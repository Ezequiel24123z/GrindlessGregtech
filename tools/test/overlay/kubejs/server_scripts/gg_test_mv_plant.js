// Gregtech Grindless - smoke test of the MV Ore Plant and Biorefinery (TEST-ONLY overlay: copied over the instance on the test PC,
// never shipped with the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_mv_plant' -WaitForLog 'GGTEST\|mv_plant\|DONE@@900'
//
// Markers: GGTEST|<scope>|<check>|PASS|FAIL|NOTE|<detail>   (scope = mv_plant, or the key of a machine: ore_plant_2hatch, ore_plant_1hatch, biorefinery)
//   mv_plant|registration, items, tags, counts, coverage, chain, bio, crafting   registration and data. `chain` compares EVERY generated
//       ore_processing recipe with the real loose GTM recipes in the recipe manager (macerator, ore washer, thermal centrifuge, chemical bath):
//       same outputs and chances, same energy (no discount), 4 stone dust of rubble. `bio` does the same for every bio_distillation recipe
//       against the gtceu:distillation_tower recipe it comes from.
//   <machine>|DESCRIPTION / PLACED / FORMED / PATTERN / PREVIEW   the registered description is placed block by block, forms, GTM builds the pattern and previews it
//   <machine>|PROCESS_<scenario>   one run of the machine: inputs in -> the expected items / fluids out
//   <machine>|LOOKUP               GTM's recipe lookup reaches every recipe of the type from its inputs
//   mv_plant|DONE                  last line
//
// Machines (all facing north in the overworld, built and run at the same time):
//   ore_plant_2hatch  around (520, 102, 2)   2 MV energy hatches: iron (washed in water) and iron (chemical bath) must run 6 ores at once; redstone (ore
//                                            multiplier 5, the recipe with the most outputs: 9) runs 3 at once with its waiting skipped (FASTFORWARD note)
//   ore_plant_1hatch  around (540, 102, 2)   1 MV energy hatch: magnetite in water (3 at once), distilled (circuit 2), chemical bath, and the
//                                            "better recipe wins" cases (distilled over water, bath over water)
//   biorefinery       around (560, 100, 2)   wood vinegar (6 fractions), fermented biomass (7 fractions + fertilizer), charcoal byproducts (4 + dust)
// TEST AREA: this test builds, force-loads and clears ONLY its own band of the overworld, X 512-575, Y 98-112, Z 0-15 (tests run at the same time
// in one server; other bands belong to other tests). Everything is driven by the structure description that lib/patterns.js records
// (global.grindless.structures). var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run
// more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'mv_plant'
  var STEP = 10
  var FORM_TIMEOUT = 400
  var BAND = { x0: 512, x1: 575, y0: 98, y1: 112, z0: 0, z1: 15 }
  var STONE = 'gtceu:stone_dust'
  var MAX_ITEM_OUTPUTS = 9   // item outputs of the ore_processing type (redstone needs all 9)
  var PART_BLOCKS = {
    energy_input: 'gtceu:mv_energy_input_hatch',
    input_bus: 'gtceu:mv_input_bus',
    output_bus: 'gtceu:mv_output_bus',
    input_hatch: 'gtceu:mv_input_hatch',
    output_hatch: 'gtceu:mv_output_hatch'
  }
  // preferred facing of parts: the first side that has no structure block in front of it
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  var S = null
  var metaMachineClass = null
  var classes = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(scope, check, status, detail) {
    var line = TAG + scope + '|' + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(scope, name, ok, detail) {
    emit(scope, name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(scope, name, detail) {
    emit(scope, name, 'NOTE', detail)
  }

  function asArray(coll) {
    var AL = Java.loadClass('java.util.ArrayList')
    var list = new AL(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function rl(id) {
    return new ResourceLocation(id)
  }

  function lazy() {
    if (classes === null) {
      classes = {
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
      }
    }
    return classes
  }

  function machineAt(p) {
    if (metaMachineClass === null) metaMachineClass = Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine')
    return metaMachineClass.getMachine(S.level, new BlockPos(p.x, p.y, p.z))
  }

  function blockIdAt(x, y, z) {
    return String(S.level.getBlock(x, y, z).getId())
  }

  function tagSize(tag) {
    return asArray(Ingredient.of('#' + tag).getItemIds()).length
  }

  function itemSummary(counts) {
    return Object.keys(counts).sort().map(function (id) { return id + ' x' + counts[id] }).join(', ')
  }

  function fluidName(stack) {
    try {
      return String(lazy().Registries.FLUIDS.getKey(stack.getFluid()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
  }

  function dedupe(list) {
    var seen = {}
    return list.filter(function (id) {
      if (seen[id]) return false
      seen[id] = true
      return true
    })
  }

  // ---------------------------------------------------------------- reading recipes from the recipe manager

  // item / fluid ingredient JSON -> { id | tag, count | amount } (null for a circuit or anything unreadable)
  function parseItem(j) {
    if (!j) return null
    var count = Number(j.count || 1)
    if (j.item) return { id: String(j.item), count: count }
    if (j.ingredient) {
      if (j.ingredient.item) return { id: String(j.ingredient.item), count: count }
      if (j.ingredient.tag) return { tag: String(j.ingredient.tag), count: count }
    }
    return null
  }

  function parseFluid(j) {
    if (!j || !j.value || j.value.length === 0) return null
    var v = j.value[0]
    var out = { amount: Number(j.amount) }
    if (v.fluid) out.id = String(v.fluid)
    else if (v.tag) out.tag = String(v.tag)
    else return null
    return out
  }

  // fluid name without namespace: gtceu:mercury and forge:mercury are both "mercury"
  function fluidShort(f) {
    var s = f.id !== undefined ? f.id : f.tag
    return String(s).replace(/^[^:]*:/, '')
  }

  function readRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    if (!found.isPresent()) return null
    var r = found.get()
    var L = lazy()
    var eu = r.getInputEUt()
    function side(list) {
      return asArray(list).map(function (c) {
        var j = null
        try {
          j = JSON.parse(String(c.content.toJson()))
        } catch (e) {
          j = null
        }
        return { j: j, ing: c.content, chance: Number(c.chance), max: Number(c.maxChance) }
      })
    }
    return {
      id: id,
      duration: Number(r.duration),
      voltage: Number(eu.voltage()),
      eut: Number(eu.voltage()) * Number(eu.amperage()),
      itemsIn: side(r.getInputContents(L.ItemCap)),
      itemsOut: side(r.getOutputContents(L.ItemCap)),
      fluidsIn: side(r.getInputContents(L.FluidCap)),
      fluidsOut: side(r.getOutputContents(L.FluidCap))
    }
  }

  // ---------------------------------------------------------------- static checks

  var PLANT_ID = 'gtceu:ore_plant'
  var BIO_ID = 'gtceu:biorefinery'

  function recipeCount(typeId) {
    var type = GTRegistries.RECIPE_TYPES.get(rl(typeId))
    return type ? S.server.getRecipeManager().getAllRecipesFor(type).size() : -1
  }

  function plantRecipePath(plan) {
    return 'grindless:ore_processing/' + plan.id.substring('grindless:'.length)
  }

  // what the loose GTM chain gives for one raw ore of a material: expected amounts per item, stone dust, energy, washing fluid
  function looseChain(mat, variant) {
    var wash = variant === 'water' ? 'gtceu:ore_washer/wash_' + mat + '_crushed_ore_to_purified_ore'
      : (variant === 'distilled' ? 'gtceu:ore_washer/wash_' + mat + '_crushed_ore_to_purified_ore_distilled'
        : 'gtceu:chemical_bath/bathe_' + mat + '_crushed_ore_to_purified_ore')
    var ids = ['gtceu:macerator/macerate_raw_' + mat + '_ore_to_crushed_ore', wash, 'gtceu:thermal_centrifuge/centrifuge_' + mat + '_purified_ore_to_refined_ore',
      'gtceu:macerator/macerate_' + mat + '_refined_ore_to_dust']
    var rs = ids.map(readRecipe)
    var missing = ids.filter(function (id, i) { return rs[i] === null })
    if (missing.length > 0) return { error: 'missing loose recipe(s) ' + missing.join(', ') }
    var crushed = parseItem(rs[0].itemsOut[0].j)
    if (crushed === null) return { error: 'unreadable crushed ore output' }
    var n = crushed.count
    var amounts = {}
    function add(item, x) {
      amounts[item] = (amounts[item] || 0) + x
    }
    function chanceOf(o) {
      return o.chance / o.max
    }
    var stoneWash = 0
    var dust = null
    for (var i = 1; i < rs[0].itemsOut.length; i++) {
      var a = parseItem(rs[0].itemsOut[i].j)
      add(a.id, a.count * chanceOf(rs[0].itemsOut[i]))
    }
    for (var w = 1; w < rs[1].itemsOut.length; w++) {
      var b = parseItem(rs[1].itemsOut[w].j)
      var xb = n * b.count * chanceOf(rs[1].itemsOut[w])
      if (b.id === STONE) stoneWash += xb
      else add(b.id, xb)
    }
    for (var c = 1; c < rs[2].itemsOut.length; c++) {
      var d = parseItem(rs[2].itemsOut[c].j)
      add(d.id, n * d.count * chanceOf(rs[2].itemsOut[c]))
    }
    for (var e = 0; e < rs[3].itemsOut.length; e++) {
      var f = parseItem(rs[3].itemsOut[e].j)
      if (e === 0) dust = f.id
      add(f.id, n * f.count * chanceOf(rs[3].itemsOut[e]))
    }
    var fluid = parseFluid(rs[1].fluidsIn[0].j)
    var energy = rs[0].eut * rs[0].duration
    energy += n * (rs[1].eut * rs[1].duration + rs[2].eut * rs[2].duration + rs[3].eut * rs[3].duration)
    // the macerated raw ore adds its own 2 x multiplier crushed ores to the item list: not a byproduct
    return { n: n, amounts: amounts, stone: stoneWash, energy: energy, fluid: fluid, dust: dust, rawIngredient: rs[0].itemsIn.length > 0 ? rs[0].itemsIn[0].ing : null }
  }

  // a recipe of the recipe manager -> { amounts per item (expected), certainStone, fluidIn, circuit }
  function readGenerated(path) {
    var g = readRecipe(path)
    if (g === null) return null
    var amounts = {}
    g.itemsOut.forEach(function (o) {
      var it = parseItem(o.j)
      if (it === null) return
      amounts[it.id] = (amounts[it.id] || 0) + it.count * (o.chance / o.max)
    })
    var circuit = 0
    // a programmed circuit is { count, ingredient: { type: 'gtceu:circuit', configuration } } in the content JSON
    g.itemsIn.forEach(function (o) {
      if (!o.j) return
      if (o.j.configuration !== undefined) circuit = Number(o.j.configuration)
      else if (o.j.ingredient && o.j.ingredient.configuration !== undefined) circuit = Number(o.j.ingredient.configuration)
    })
    var raw = null
    g.itemsIn.forEach(function (o) {
      var it = parseItem(o.j)
      if (it !== null) raw = it
    })
    return { g: g, amounts: amounts, fluid: g.fluidsIn.length > 0 ? parseFluid(g.fluidsIn[0].j) : null, circuit: circuit, raw: raw }
  }

  function chainCheck() {
    var OP = global.grindless.orePlant
    var problems = []
    var compared = 0
    var rawChecked = 0
    OP.recipes.forEach(function (plan) {
      var path = plantRecipePath(plan)
      var exp = looseChain(plan.material, plan.variant)
      if (exp.error) {
        problems.push(plan.id + ': ' + exp.error)
        return
      }
      var got = readGenerated(path)
      if (got === null) {
        problems.push(plan.id + ': not in the recipe manager')
        return
      }
      compared++
      var tag = plan.material + '/' + plan.variant
      var keys = {}
      Object.keys(exp.amounts).forEach(function (k) { keys[k] = true })
      Object.keys(got.amounts).forEach(function (k) { keys[k] = true })
      Object.keys(keys).forEach(function (item) {
        if (item === STONE) return
        var want = exp.amounts[item] || 0
        var have = got.amounts[item] || 0
        if (Math.abs(want - have) > 0.0003) problems.push(tag + ' ' + item + ' want ' + want.toFixed(4) + ' have ' + have.toFixed(4))
      })
      var rubble = got.amounts[STONE] || 0
      if (Math.abs(rubble - 2 * exp.n) > 1e-9) problems.push(tag + ' rubble ' + rubble + ' (2 per crushed ore = ' + (2 * exp.n) + ')')
      if (plan.variant !== 'bath' && Math.abs(rubble - 2 * exp.stone) > 1e-9) problems.push(tag + ' rubble ' + rubble + ' is not twice the washers\' ' + exp.stone)
      var energy = got.g.duration * got.g.eut
      if (got.g.eut !== 40 || Math.abs(energy - exp.energy) > 20) problems.push(tag + ' energy ' + got.g.duration + ' t x ' + got.g.eut + ' = ' + energy + ' (loose chain ' + exp.energy + ')')
      if (got.fluid === null || exp.fluid === null || got.fluid.amount !== exp.n * exp.fluid.amount || fluidShort(got.fluid) !== fluidShort(exp.fluid)) {
        problems.push(tag + ' fluid ' + JSON.stringify(got.fluid) + ' (loose ' + JSON.stringify(exp.fluid) + ' x ' + exp.n + ')')
      }
      if (got.circuit !== (plan.variant === 'distilled' ? 2 : 0)) problems.push(tag + ' circuit ' + got.circuit)
      if (got.g.itemsOut.length > MAX_ITEM_OUTPUTS) problems.push(tag + ' ' + got.g.itemsOut.length + ' item outputs (the recipe type holds ' + MAX_ITEM_OUTPUTS + ')')
      // the raw ore item of the plant recipe is one the loose macerator accepts
      if (exp.rawIngredient !== null) {
        var accepted = null
        try {
          accepted = Boolean(exp.rawIngredient.test(Item.of(plan.input)))
        } catch (e2) {
          accepted = null
        }
        if (accepted === false) problems.push(tag + ' raw ore ' + plan.input + ' is not what the loose macerator takes')
        else if (accepted === true) rawChecked++
      }
    })
    return { problems: problems, compared: compared, rawChecked: rawChecked }
  }

  function coverageCheck() {
    var OP = global.grindless.orePlant
    var type = GTRegistries.RECIPE_TYPES.get(rl('gtceu:macerator'))
    var loose = {}
    asArray(S.server.getRecipeManager().getAllRecipesFor(type)).forEach(function (r) {
      var m = /^macerate_raw_(.+)_ore_to_crushed_ore$/.exec(String(r.id.getPath()).replace(/^macerator\//, ''))
      if (m) loose[m[1]] = true
    })
    var have = {}
    OP.recipes.forEach(function (p) { have[p.material] = true })
    var skipped = {}
    OP.skipped.forEach(function (s) { skipped[s.material] = s.reason })
    var uncovered = Object.keys(loose).filter(function (m) { return !have[m] && !skipped[m] })
    var skippedLoose = Object.keys(loose).filter(function (m) { return !have[m] && skipped[m] })
    var byReason = {}
    OP.skipped.forEach(function (s) {
      if (!byReason[s.reason]) byReason[s.reason] = []
      byReason[s.reason].push(s.material)
    })
    return { looseOres: Object.keys(loose).length, covered: Object.keys(have).length, uncovered: uncovered, skippedLoose: skippedLoose, byReason: byReason }
  }

  function bioCheck() {
    var BIO = global.grindless.biorefinery
    var problems = []
    BIO.recipes.forEach(function (b) {
      var src = readRecipe(b.source)
      var gen = readRecipe(b.id)
      if (src === null || gen === null) {
        problems.push(b.id + ': ' + (src === null ? 'source ' + b.source : 'generated recipe') + ' is not in the recipe manager')
        return
      }
      var tag = b.id.replace('grindless:bio_distillation/bio/', '')
      var sIn = parseFluid(src.fluidsIn[0].j)
      var gIn = parseFluid(gen.fluidsIn[0].j)
      if (sIn === null || gIn === null || sIn.amount !== gIn.amount || fluidShort(sIn) !== fluidShort(gIn)) problems.push(tag + ' input ' + JSON.stringify(gIn) + ' vs ' + JSON.stringify(sIn))
      if (src.fluidsOut.length !== gen.fluidsOut.length) {
        problems.push(tag + ' ' + gen.fluidsOut.length + ' fluid outputs vs ' + src.fluidsOut.length)
      } else {
        src.fluidsOut.forEach(function (o, i) {
          var s = parseFluid(o.j)
          var g = parseFluid(gen.fluidsOut[i].j)
          if (s === null || g === null || s.amount !== g.amount || fluidShort(s) !== fluidShort(g)) problems.push(tag + ' output ' + i + ' ' + JSON.stringify(g) + ' vs ' + JSON.stringify(s))
        })
      }
      if (src.itemsOut.length !== gen.itemsOut.length) {
        problems.push(tag + ' ' + gen.itemsOut.length + ' item outputs vs ' + src.itemsOut.length)
      } else {
        src.itemsOut.forEach(function (o, i) {
          var s = parseItem(o.j)
          var g = parseItem(gen.itemsOut[i].j)
          if (s === null || g === null || s.id !== g.id || s.count !== g.count || Math.abs(o.chance / o.max - gen.itemsOut[i].chance / gen.itemsOut[i].max) > 0.0002) {
            problems.push(tag + ' item ' + i + ' ' + JSON.stringify(g) + ' vs ' + JSON.stringify(s))
          }
        })
      }
      var sEnergy = src.eut * src.duration
      var gEnergy = gen.eut * gen.duration
      if (gen.eut > 120 || gen.eut !== Math.min(src.eut, 120)) problems.push(tag + ' draws ' + gen.eut + ' EU/t (source ' + src.eut + ')')
      if (gEnergy < sEnergy || gEnergy >= sEnergy + gen.eut) problems.push(tag + ' energy ' + gEnergy + ' vs ' + sEnergy)
    })
    return problems
  }

  function staticChecks() {
    var G = global.grindless
    var OP = G.orePlant
    var BIO = G.biorefinery
    var rm = S.server.getRecipeManager()
    var fc = lazy().FluidCap
    var ic = lazy().ItemCap

    var plantType = GTRegistries.RECIPE_TYPES.get(rl('gtceu:ore_processing'))
    var bioType = GTRegistries.RECIPE_TYPES.get(rl('gtceu:bio_distillation'))
    var missingMachines = [PLANT_ID, BIO_ID].filter(function (id) { return !GTRegistries.MACHINES.get(rl(id)) })
    var sizesOk = !!plantType && !!bioType && plantType.getMaxOutputs(ic) === MAX_ITEM_OUTPUTS && plantType.getMaxInputs(fc) === 1 && plantType.getMaxInputs(ic) === 2 &&
      bioType.getMaxOutputs(fc) === 12 && bioType.getMaxOutputs(ic) === 1 && bioType.getMaxInputs(fc) === 1
    check(SCOPE, 'registration', sizesOk && missingMachines.length === 0,
      'ore_processing=' + (plantType ? 'registered (items in ' + plantType.getMaxInputs(ic) + ', items out ' + plantType.getMaxOutputs(ic) + ', fluids in ' + plantType.getMaxInputs(fc) + ')' : 'missing') +
      ' bio_distillation=' + (bioType ? 'registered (fluids out ' + bioType.getMaxOutputs(fc) + ', items out ' + bioType.getMaxOutputs(ic) + ')' : 'missing') +
      ' machines=' + (missingMachines.length === 0 ? 'registered' : 'missing ' + missingMachines.join(',')))

    var items = dedupe(G.orePlant.craftingParts.concat(G.biorefinery.craftingParts).concat(['gtceu:solid_machine_casing', 'gtceu:heatproof_machine_casing',
      'gtceu:steel_gearbox', 'gtceu:steel_pipe_casing', 'gtceu:tempered_glass', 'gtceu:mv_energy_input_hatch', 'gtceu:mv_input_bus', 'gtceu:mv_output_bus',
      'gtceu:mv_input_hatch', 'gtceu:mv_output_hatch', 'gtceu:programmed_circuit', 'gtceu:stone_dust', 'gtceu:fertilizer', 'gtceu:charcoal_dust']))
    var missingItems = items.filter(function (id) { return !Item.exists(id) })
    var fluids = ['gtceu:distilled_water', 'gtceu:mercury', 'gtceu:sodium_persulfate', 'minecraft:water', 'gtceu:wood_vinegar', 'gtceu:fermented_biomass',
      'gtceu:charcoal_byproducts', 'gtceu:acetic_acid', 'gtceu:methanol']
    var missingFluids = fluids.filter(function (id) { return !Fluid.exists(id) })
    check(SCOPE, 'items', missingItems.length === 0 && missingFluids.length === 0,
      'items=' + items.length + ' fluids=' + fluids.length + (missingItems.length > 0 ? ' missing items=' + missingItems.join(',') : '') +
      (missingFluids.length > 0 ? ' missing fluids=' + missingFluids.join(',') : ''))

    var tags = ['gtceu:circuits/mv']
    var emptyTags = tags.filter(function (t) { return tagSize(t) === 0 })
    check(SCOPE, 'tags', emptyTags.length === 0, 'count=' + tags.length + (emptyTags.length > 0 ? ' empty=' + emptyTags.join(',') : ''))

    var wantPlant = OP.recipes.length
    var havePlant = recipeCount('gtceu:ore_processing')
    var wantBio = BIO.recipes.length
    var haveBio = recipeCount('gtceu:bio_distillation')
    var variants = { water: 0, distilled: 0, bath: 0 }
    OP.recipes.forEach(function (p) { variants[p.variant]++ })
    check(SCOPE, 'counts', wantPlant > 0 && wantBio > 0 && havePlant === wantPlant && haveBio === wantBio && variants.water === variants.distilled,
      'ore_processing=' + havePlant + '/' + wantPlant + ' (water ' + variants.water + ', distilled ' + variants.distilled + ', bath ' + variants.bath + ') for ' + OP.ores +
      ' ores, bio_distillation=' + haveBio + '/' + wantBio + ' (' + BIO.others + ' distillation tower recipes left to the HV tower)')

    var cov = coverageCheck()
    check(SCOPE, 'coverage', cov.uncovered.length === 0 && cov.covered > 0,
      'ores with a raw-ore macerator recipe=' + cov.looseOres + ' covered=' + cov.covered + ' skipped=' + OP.skipped.length +
      (cov.uncovered.length > 0 ? ' neither covered nor skipped=' + cov.uncovered.join(',') : ''))
    Object.keys(cov.byReason).forEach(function (reason) {
      note(SCOPE, 'skipped', reason + ' (' + cov.byReason[reason].length + '): ' + cov.byReason[reason].join(','))
    })

    try {
      var chain = chainCheck()
      check(SCOPE, 'chain', chain.problems.length === 0 && chain.compared === wantPlant && chain.rawChecked === wantPlant,
        'recipes compared with the loose GTM chain=' + chain.compared + '/' + wantPlant + ', raw ore items accepted by the loose macerator=' + chain.rawChecked +
        (chain.problems.length > 0 ? ' problems(' + chain.problems.length + ')=' + chain.problems.slice(0, 12).join(' ; ') : ''))
    } catch (e1) {
      check(SCOPE, 'chain', false, 'exception: ' + e1)
    }

    try {
      var bio = bioCheck()
      var organic = BIO.organicInputs.length
      check(SCOPE, 'bio', bio.length === 0 && BIO.skipped.length === 0 && wantBio === organic,
        'recipes compared with their distillation tower recipe=' + wantBio + '/' + organic + (BIO.skipped.length > 0 ? ' skipped=' + BIO.skipped.map(function (s) { return s.source + ': ' + s.reason }).join(' ; ') : '') +
        (bio.length > 0 ? ' problems(' + bio.length + ')=' + bio.slice(0, 8).join(' ; ') : ''))
      var summary = BIO.recipes.map(function (b) {
        return b.id.replace('grindless:bio_distillation/bio/', '') + ':' + b.fluids.length + 'f' + (b.items.length > 0 ? '+i' : '') + ' ' + b.sourceEut + '->' + b.eut + ' EU/t x ' + b.duration + ' t'
      })
      note(SCOPE, 'bio_recipes', summary.join(' ; '))
    } catch (e2) {
      check(SCOPE, 'bio', false, 'exception: ' + e2)
    }

    var craft = ['grindless:crafting/ore_plant', 'grindless:crafting/biorefinery']
    var missingCraft = craft.filter(function (id) { return !rm.byKey(rl(id)).isPresent() })
    check(SCOPE, 'crafting', missingCraft.length === 0, 'count=' + craft.length + (missingCraft.length > 0 ? ' missing=' + missingCraft.join(',') : ''))

    var iron = OP.recipes.filter(function (p) { return p.material === 'iron' || p.material === 'magnetite' })
    note(SCOPE, 'test_ores', iron.map(function (p) {
      return p.id + ' ' + p.duration + ' t x ' + p.eut + ' EU/t, ' + p.fluid.amount + ' mB ' + p.fluid.id + ', out=[' +
        p.outputs.map(function (o) { return o.item.replace('gtceu:', '') + ' ' + o.whole + '+' + o.chance }).join(' ') + '] rubble ' + p.rubble
    }).join(' ; '))
    note(SCOPE, 'reagents', Object.keys(OP.reagents).length + ' ores with a chemical bath: ' + Object.keys(OP.reagents).map(function (m) { return m + '=' + OP.reagents[m].replace('gtceu:', '') }).join(','))
  }

  // ---------------------------------------------------------------- structures (same technique as gg_test_lv_multis.js)

  function simpleBlock(sym, machineId) {
    switch (sym.kind) {
      case 'blocks':
        return { id: sym.blocks[0] }
      case 'frames':
        return { id: 'gtceu:' + sym.materials[0] + '_frame' }
      case 'part':
        if (!PART_BLOCKS[sym.ability]) throw new Error('the test does not know the part ability ' + sym.ability)
        return { id: PART_BLOCKS[sym.ability], ability: sym.ability }
      case 'controller':
        return { id: machineId, controller: true }
      case 'air':
      case 'any':
        return null
      default:
        throw new Error('unsupported symbol kind ' + sym.kind)
    }
  }

  // a "casing OR parts" cell: the parts the limits ask for (or the counts the test overrides) are spread evenly over the cells, the rest is the plain block
  function assignOneOf(sym, list, machineId, counts) {
    var filler = null
    var parts = []
    sym.options.forEach(function (o) {
      if (o.kind === 'part') {
        var lim = o.limits || {}
        var need = lim.exact != null ? lim.exact : (lim.min != null ? lim.min : 0)
        if (counts && counts[o.ability] !== undefined) need = counts[o.ability]
        for (var k = 0; k < need; k++) parts.push(simpleBlock(o, machineId))
      } else if (filler === null) {
        filler = simpleBlock(o, machineId)
      }
    })
    if (filler === null) throw new Error('a oneOf symbol has no plain block option')
    if (parts.length > list.length) throw new Error('more required parts (' + parts.length + ') than cells (' + list.length + ')')
    list.forEach(function (c) { c.block = filler })
    parts.forEach(function (p, i) {
      list[Math.floor((i + 0.5) * list.length / parts.length)].block = p
    })
  }

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing
  // north: x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)  (the structure is behind it)
  function planOf(machineId, cx, cy, cz, counts) {
    var desc = global.grindless.patterns.describe(machineId)
    if (!desc) throw new Error('no structure description recorded for ' + machineId)
    var cells = []
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
          cells.push({ si: si, ri: ri, ci: ci, ch: ch, sym: sym, block: null, props: '' })
        }
      })
    })
    if (ctrl === null) throw new Error('the description has no controller cell')
    cells.forEach(function (c) {
      c.x = cx - (c.ci - ctrl.ci)
      c.y = cy + (c.ri - ctrl.ri)
      c.z = cz - (c.si - ctrl.si)
    })

    var byChar = {}
    cells.forEach(function (c) {
      if (!byChar[c.ch]) byChar[c.ch] = []
      byChar[c.ch].push(c)
    })
    Object.keys(byChar).forEach(function (ch) {
      var sym = desc.symbols[ch]
      var list = byChar[ch]
      if (sym.kind === 'oneOf') {
        assignOneOf(sym, list, machineId, counts)
      } else {
        var b = simpleBlock(sym, machineId)
        list.forEach(function (c) { c.block = b })
      }
    })

    var occupied = {}
    cells.forEach(function (c) {
      if (c.block) occupied[c.x + ',' + c.y + ',' + c.z] = true
    })
    cells.forEach(function (c) {
      if (!c.block) return
      if (c.block.controller) {
        c.props = '[facing=north]'
      } else if (c.block.ability) {
        for (var i = 0; i < SIDES.length; i++) {
          var s = SIDES[i]
          if (!occupied[(c.x + s[1]) + ',' + (c.y + s[2]) + ',' + (c.z + s[3])]) {
            c.props = '[facing=' + s[0] + ']'
            break
          }
        }
      }
    })

    var placed = cells.filter(function (c) { return c.block !== null })
    var width = desc.slices[0][0].length
    return {
      id: machineId,
      cx: cx, cy: cy, cz: cz,
      cells: placed,
      desc: desc,
      size: width + 'x' + desc.slices[0].length + 'x' + desc.slices.length + ' (w x h x d)',
      blocks: placed.length
    }
  }

  function setBlock(c) {
    return S.server.runCommandSilent('setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.block.id + c.props + ' replace')
  }

  // everything but the controller first, the controller last
  function place(key, plan) {
    var failed = []
    var ctrlCell = null
    plan.cells.forEach(function (c) {
      if (c.block.controller) {
        ctrlCell = c
        return
      }
      if (setBlock(c) < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.block.id + c.props)
    })
    if (setBlock(ctrlCell) < 1) failed.push('controller ' + ctrlCell.block.id)
    plan.ctrl = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }

    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.block.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.block.id + ' got ' + got)
    })
    var parts = plan.cells.filter(function (c) { return c.block.ability }).map(function (c) {
      return c.block.ability + '@' + c.x + ',' + c.y + ',' + c.z + c.props
    })
    check(key, 'PLACED', failed.length === 0 && wrong.length === 0,
      'blocks=' + plan.blocks + ' size=' + plan.size + ' controller=' + plan.ctrl.x + ',' + plan.ctrl.y + ',' + plan.ctrl.z +
      ' parts=[' + parts.join(' ') + ']' +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

  function describeSymbol(sym) {
    if (sym.kind === 'oneOf') return 'oneOf(' + sym.options.map(describeSymbol).join(' | ') + ')'
    if (sym.kind === 'blocks') return sym.blocks.join('/')
    if (sym.kind === 'frames') return 'frame ' + sym.materials.join('/')
    if (sym.kind === 'part') return 'part ' + sym.ability
    return sym.kind
  }

  function describeError(m, ctrl) {
    try {
      var st = ctrl.getMultiblockState()
      var err = st.error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var text = 'pattern error ' + String(err)
      try {
        var pos = err.getPos()
        var px = pos.getX()
        var py = pos.getY()
        var pz = pos.getZ()
        text += ' at ' + px + ',' + py + ',' + pz + ' found ' + blockIdAt(px, py, pz)
        for (var i = 0; i < m.plan.cells.length; i++) {
          var c = m.plan.cells[i]
          if (c.x === px && c.y === py && c.z === pz) {
            text += ' expected symbol ' + c.ch + ' = ' + describeSymbol(c.sym) + ' (placed ' + c.block.id + c.props + ')'
            break
          }
        }
      } catch (e1) {
        text += ' (no position: ' + e1 + ')'
      }
      try {
        text += ' info=' + err.getErrorInfo().getString()
      } catch (e2) { /* optional */ }
      return text
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  function partIds(ctrl) {
    return asArray(ctrl.getParts()).map(function (p) { return String(p.getDefinition().getId()).replace('gtceu:', '') })
  }

  // the structure preview EMI / JEI draw: size and the parts it contains (the preview picks its own tier of every part: match the kind only)
  var PART_KIND = {
    energy_input: /^gtceu:[a-z]+_energy_input_hatch$/,
    input_bus: /^gtceu:[a-z]+_input_bus$/,
    output_bus: /^gtceu:[a-z]+_output_bus$/,
    input_hatch: /^gtceu:[a-z]+_input_hatch$/,
    output_hatch: /^gtceu:[a-z]+_output_hatch$/
  }

  function previewCheck(key, id, def, plan, wantParts) {
    var shapes = asArray(def.getMatchingShapes())
    var blocks = shapes[0].getBlocks()
    var counts = {}
    var total = 0
    for (var x = 0; x < blocks.length; x++) {
      for (var y = 0; y < blocks[x].length; y++) {
        for (var z = 0; z < blocks[x][y].length; z++) {
          var info = blocks[x][y][z]
          if (info === null || info === undefined) continue
          var block = info.getBlockState().getBlock()
          var bid = String(Block.getId(block))
          if (bid === 'minecraft:air') continue
          counts[bid] = (counts[bid] || 0) + 1
          total++
        }
      }
    }
    var missing = []
    wantParts.forEach(function (ability) {
      var found = false
      Object.keys(counts).forEach(function (bid) {
        if (PART_KIND[ability].test(bid)) found = true
      })
      if (!found) missing.push(ability)
    })
    if (!counts[id]) missing.push('controller')
    check(key, 'PREVIEW', shapes.length >= 1 && missing.length === 0,
      'shapes=' + shapes.length + ' blocks=' + total + ' (placed structure: ' + plan.blocks + ')' +
      (missing.length > 0 ? ' missing=' + missing.join(',') : ''))
  }

  // ---------------------------------------------------------------- inputs and outputs

  function readBus(bus) {
    var inv = bus.getInventory()
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = String(st.getId())
      counts[id] = (counts[id] || 0) + st.getCount()
    }
    return counts
  }

  function clearInventory(inv) {
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.empty)
  }

  function tankInfo(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    return { id: st.isEmpty() ? 'none' : fluidName(st), amount: st.isEmpty() ? 0 : st.getAmount() }
  }

  function findParts(ctrl) {
    var P = { energy: [], inBus: null, outBuses: [], inHatches: [], outHatches: [] }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (pid === PART_BLOCKS.energy_input) P.energy.push(p)
      else if (pid === PART_BLOCKS.input_bus) P.inBus = p
      else if (pid === PART_BLOCKS.output_bus) P.outBuses.push(p)
      else if (pid === PART_BLOCKS.input_hatch) P.inHatches.push(p)
      else if (pid === PART_BLOCKS.output_hatch) P.outHatches.push(p)
    })
    function byPos(a, b) {
      var pa = a.self().getPos()
      var pb = b.self().getPos()
      return (pa.getY() - pb.getY()) || (pa.getX() - pb.getX()) || (pa.getZ() - pb.getZ())
    }
    P.inHatches.sort(byPos)
    P.outHatches.sort(byPos)
    return P
  }

  function topUpEnergy(m) {
    if (m.parts === null) return
    m.parts.energy.forEach(function (p) {
      var c = p.energyContainer
      c.setEnergyStored(c.getEnergyCapacity())
    })
  }

  function resetMachine(m, ctrl) {
    var P = m.parts
    if (P.inBus !== null) {
      clearInventory(P.inBus.getInventory())
      clearInventory(P.inBus.getCircuitInventory())
    }
    P.outBuses.forEach(function (b) { clearInventory(b.getInventory()) })
    P.inHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    P.outHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    ctrl.getRecipeLogic().resetRecipeLogic()
  }

  function fillInputs(m, sc) {
    var P = m.parts
    var inv = P.inBus !== null ? P.inBus.getInventory() : null
    ;(sc.items || []).forEach(function (input, slot) {
      if (inv === null) throw new Error('the scenario needs an input bus but the machine has none')
      var left = inv.insertItem(slot, Item.of(input.id, input.n), false)
      if (!left.isEmpty()) throw new Error('could not insert ' + input.id + ' x' + input.n + ' into slot ' + slot)
    })
    if (sc.circuit) {
      // the bus circuit slot refuses insertItem (its capability IO is NONE); players set it through the GUI
      P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(sc.circuit))
    }
    ;(sc.fluids || []).forEach(function (f) {
      if (!P.inHatches[f.hatch]) throw new Error('the scenario needs input hatch ' + f.hatch + ' but the machine has ' + P.inHatches.length)
      P.inHatches[f.hatch].tank.setFluidInTank(0, Fluid.of(f.id, f.mb).getFluidStack())
    })
  }

  function fillScenario(m, sc) {
    fillInputs(m, sc)
    var P = m.parts
    note(m.key, 'INPUT_' + sc.name, 'bus=[' + (P.inBus !== null ? itemSummary(readBus(P.inBus)) : 'none') + '] circuit=' + (sc.circuit ? sc.circuit : 'none') +
      ' fluids=[' + (sc.fluids || []).map(function (f) { return 'hatch ' + f.hatch + ': ' + f.id + ' ' + f.mb + ' mB' }).join(' ; ') + '] output buses=' + P.outBuses.length +
      ' output hatches=' + P.outHatches.length + ' energy hatches=' + P.energy.length)
  }

  function recipeState(ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() +
        ' lastRecipe=' + (last ? last.id + ' parallels=' + last.parallels : 'none')
    } catch (e) {
      return 'recipe state unreadable: ' + e
    }
  }

  // what GTM's own recipe lookup and matching say about the machine right now (used when a machine stays idle)
  function diagnose(ctrl) {
    var out = []
    try {
      var match = ctrl.getRecipeType().db().find(ctrl)
      if (!match) {
        out.push('lookup=none')
      } else {
        var helper = Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper')
        out.push('lookup=' + match.id)
        try { out.push('matchRecipe=' + helper.matchRecipe(ctrl, match).isSuccess()) } catch (e1) { out.push('matchRecipe threw ' + e1) }
        try { out.push('matchTickRecipe=' + helper.matchTickRecipe(ctrl, match).isSuccess()) } catch (e2) { out.push('matchTickRecipe threw ' + e2) }
      }
      out.push('workingEnabled=' + ctrl.isWorkingEnabled())
      var fails = asArray(ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
      if (fails.length > 0) out.push('failureReasons=[' + fails.join(' ; ') + ']')
    } catch (e) {
      out.push('diagnose threw ' + e)
    }
    return out.join(' ')
  }

  function collect(m, ctrl, sc) {
    var P = m.parts
    var counts = {}
    P.outBuses.forEach(function (b) {
      var c = readBus(b)
      Object.keys(c).forEach(function (id) { counts[id] = (counts[id] || 0) + c[id] })
    })
    return {
      items: counts,
      fluidIn: P.inHatches.map(tankInfo),
      fluidOut: P.outHatches.map(tankInfo),
      leftover: P.inBus !== null ? readBus(P.inBus) : {},
      seen: m.seen,
      sc: sc
    }
  }

  function unexpectedItems(counts, allowed) {
    return Object.keys(counts).filter(function (id) { return allowed.indexOf(id) < 0 })
  }

  function seenIds(r) {
    return Object.keys(r.seen).map(function (id) { return id + '(x' + r.seen[id] + ')' }).join(',')
  }

  // ---------------------------------------------------------------- scenarios

  function planById(id) {
    var list = global.grindless.orePlant.recipes
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i]
    }
    throw new Error('no generated ore_processing recipe ' + id)
  }

  function bioById(name) {
    var list = global.grindless.biorefinery.recipes
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === 'grindless:bio_distillation/bio/' + name) return list[i]
    }
    throw new Error('no generated bio_distillation recipe ' + name)
  }

  // expected items of `runs` parallel runs of a plant recipe: whole amounts exactly, chanced ones between the guaranteed part and one more
  function plantExpectation(plan, runs) {
    var want = {}
    plan.outputs.forEach(function (o) {
      var lo = runs * o.whole + Math.floor(runs * o.chance / 10000)
      var hi = lo + (o.chance > 0 ? 1 : 0)
      if (!want[o.item]) want[o.item] = { lo: 0, hi: 0 }
      want[o.item].lo += lo
      want[o.item].hi += hi
    })
    if (!want[plan.stone]) want[plan.stone] = { lo: 0, hi: 0 }
    want[plan.stone].lo += runs * plan.rubble
    want[plan.stone].hi += runs * plan.rubble
    return want
  }

  // fluidUse: [{ hatch, start, used }] expected consumption of the input hatches; fastForward: the waiting of a very long recipe is skipped
  // (the progress is set 20 ticks before its end once it is running, everything else is the real thing)
  function plantScenario(name, recipeId, runs, circuit, fluids, fluidUse, fastForward) {
    var plan = planById(recipeId)
    var path = plantRecipePath(plan)
    return {
      name: name,
      ticks: fastForward ? 220 : plan.duration + 90,
      fastForward: !!fastForward,
      items: [{ id: plan.input, n: runs }],
      circuit: circuit,
      fluids: fluids,
      verify: function (r) {
        var want = plantExpectation(plan, runs)
        var problems = []
        var have = []
        Object.keys(want).forEach(function (item) {
          var got = r.items[item] || 0
          have.push(item.replace('gtceu:', '') + ' ' + got + ' [' + want[item].lo + '-' + want[item].hi + ']')
          if (got < want[item].lo || got > want[item].hi) problems.push(item + ' ' + got + ' not in ' + want[item].lo + '-' + want[item].hi)
        })
        var unexpected = unexpectedItems(r.items, Object.keys(want))
        if (unexpected.length > 0) problems.push('unexpected ' + unexpected.join(','))
        var used = []
        fluidUse.forEach(function (f) {
          var left = r.fluidIn[f.hatch] ? r.fluidIn[f.hatch].amount : -1
          used.push('hatch ' + f.hatch + ' used ' + (f.start - left) + ' of ' + f.used)
          if (f.start - left !== f.used) problems.push('hatch ' + f.hatch + ' used ' + (f.start - left) + ' mB, wanted ' + f.used)
        })
        var ran = r.seen[path]
        if (ran !== runs) problems.push('recipe ' + path + ' ran ' + (ran === undefined ? 'never' : ran + ' at once') + ', wanted ' + runs + ' at once')
        var others = Object.keys(r.seen).filter(function (id) { return id !== path })
        if (others.length > 0) problems.push('other recipes seen ' + others.join(','))
        var leftoverOre = r.leftover[plan.input] || 0
        if (leftoverOre !== 0) problems.push(leftoverOre + ' raw ore left in the bus')
        return {
          ok: problems.length === 0,
          detail: plan.id + ' x' + runs + ' (' + plan.duration + ' t, ' + plan.eut + ' EU/t each): ' + have.join(', ') + ' | ' + used.join(' ; ') + ' | recipes seen=[' + seenIds(r) + ']' +
            (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : '')
        }
      }
    }
  }

  // more ores in the bus than the machine can run at once: only `expected` of them start, the rest stay in the bus (looked at while the first
  // batch is still running, the energy hatches decide how many)
  function plantCapScenario(name, recipeId, ores, expected, fluids) {
    var plan = planById(recipeId)
    var path = plantRecipePath(plan)
    return {
      name: name,
      ticks: 100,
      items: [{ id: plan.input, n: ores }],
      circuit: 0,
      fluids: fluids,
      verify: function (r) {
        var problems = []
        var ran = r.seen[path]
        var left = r.leftover[plan.input] || 0
        if (ran !== expected) problems.push('recipe ' + path + ' ran ' + (ran === undefined ? 'never' : ran + ' at once') + ', wanted ' + expected + ' at once')
        if (left !== ores - expected) problems.push(left + ' raw ore left in the bus, wanted ' + (ores - expected))
        return {
          ok: problems.length === 0,
          detail: plan.id + ' with ' + ores + ' ores in the bus: ' + (ran === undefined ? 'none' : ran) + ' at once, ' + left + ' left in the bus (wanted ' + expected + ' at once)' +
            (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : '')
        }
      }
    }
  }

  function plantAScenarios() {
    var iron = planById('grindless:mv/iron_water')
    var ironBath = planById('grindless:mv/iron_bath')
    var redstone = planById('grindless:mv/redstone_water')
    return [
      // 2 MV hatches count as a tier up (512 V): 12 runs of 40 EU/t would be paid, the cap of the plant is 6
      plantCapScenario('iron_cap_8_ores', 'grindless:mv/iron_water', 8, 6, [{ hatch: 0, id: 'minecraft:water', mb: 20000 }]),
      // 6 runs of 40 EU/t; water only
      plantScenario('iron_water', 'grindless:mv/iron_water', 6, 0, [{ hatch: 0, id: 'minecraft:water', mb: 14000 }],
        [{ hatch: 0, start: 14000, used: 6 * iron.fluid.amount }]),
      // the persulfate of iron's chemical bath is in the second hatch, water is still there: the bath wins
      plantScenario('iron_bath_over_water', 'grindless:mv/iron_bath', 6, 0,
        [{ hatch: 0, id: 'minecraft:water', mb: 8000 }, { hatch: 1, id: ironBath.fluid.id, mb: 3000 }],
        [{ hatch: 0, start: 8000, used: 0 }, { hatch: 1, start: 3000, used: 6 * ironBath.fluid.amount }]),
      // the largest recipe: redstone has an ore multiplier of 5 (10 crushed ores, 9 item outputs, 4 820 ticks); its waiting is skipped
      plantScenario('redstone_water', 'grindless:mv/redstone_water', 3, 0, [{ hatch: 0, id: 'minecraft:water', mb: 3 * redstone.fluid.amount }],
        [{ hatch: 0, start: 3 * redstone.fluid.amount, used: 3 * redstone.fluid.amount }], true)
    ]
  }

  function plantBScenarios() {
    var water = planById('grindless:mv/magnetite_water')
    var distilled = planById('grindless:mv/magnetite_distilled')
    var bath = planById('grindless:mv/magnetite_bath')
    return [
      // one MV hatch pays 3 runs of 40 EU/t (128 V): of 6 ores only 3 start
      plantCapScenario('magnetite_cap_6_ores', 'grindless:mv/magnetite_water', 6, 3, [{ hatch: 0, id: 'minecraft:water', mb: 14000 }]),
      // 3 ores, 3 runs; the ore has a reagent but none is in the machine: plain water
      plantScenario('magnetite_water', 'grindless:mv/magnetite_water', 3, 0, [{ hatch: 0, id: 'minecraft:water', mb: 8000 }],
        [{ hatch: 0, start: 8000, used: 3 * water.fluid.amount }]),
      // circuit 2 + distilled water: the distilled variant, the water next to it is not touched
      plantScenario('magnetite_distilled_over_water', 'grindless:mv/magnetite_distilled', 3, 2,
        [{ hatch: 0, id: 'gtceu:distilled_water', mb: 5000 }, { hatch: 1, id: 'minecraft:water', mb: 5000 }],
        [{ hatch: 0, start: 5000, used: 3 * distilled.fluid.amount }, { hatch: 1, start: 5000, used: 0 }]),
      // the reagent alone: the chemical bath
      plantScenario('magnetite_bath', 'grindless:mv/magnetite_bath', 3, 0, [{ hatch: 1, id: bath.fluid.id, mb: 2000 }],
        [{ hatch: 1, start: 2000, used: 3 * bath.fluid.amount }]),
      // the reagent and water together: the bath wins, the water stays
      plantScenario('magnetite_bath_over_water', 'grindless:mv/magnetite_bath', 3, 0,
        [{ hatch: 0, id: 'minecraft:water', mb: 8000 }, { hatch: 1, id: bath.fluid.id, mb: 2000 }],
        [{ hatch: 0, start: 8000, used: 0 }, { hatch: 1, start: 2000, used: 3 * bath.fluid.amount }])
    ]
  }

  function towerScenario(name, key) {
    var rec = bioById(key)
    var path = rec.id
    return {
      name: name,
      ticks: rec.duration + 70,
      items: [],
      circuit: 0,
      fluids: [{ hatch: 0, id: rec.input.id, mb: rec.input.amount }],
      verify: function (r) {
        var problems = []
        var have = []
        rec.fluids.forEach(function (f, i) {
          var h = r.fluidOut[i]
          have.push(i + ':' + f.id.replace('gtceu:', '') + ' ' + (h ? h.amount : '?'))
          if (!h) problems.push('no output hatch on layer ' + (i + 1))
          else if (h.id !== f.id || h.amount !== f.amount) problems.push('layer ' + (i + 1) + ' holds ' + h.id + ' ' + h.amount + ', wanted ' + f.id + ' ' + f.amount)
        })
        for (var i = rec.fluids.length; i < r.fluidOut.length; i++) {
          if (r.fluidOut[i].amount !== 0) problems.push('layer ' + (i + 1) + ' should be empty but holds ' + r.fluidOut[i].id + ' ' + r.fluidOut[i].amount)
        }
        var allowed = rec.items.map(function (it) { return it.id })
        rec.items.forEach(function (it) {
          var got = r.items[it.id] || 0
          var lo = it.chance >= 10000 ? it.count : 0
          var hi = it.count
          have.push(it.id.replace('gtceu:', '') + ' ' + got + ' [' + lo + '-' + hi + ']')
          if (got < lo || got > hi) problems.push(it.id + ' ' + got + ' not in ' + lo + '-' + hi)
        })
        var unexpected = unexpectedItems(r.items, allowed)
        if (unexpected.length > 0) problems.push('unexpected items ' + unexpected.join(','))
        var left = r.fluidIn[0] ? r.fluidIn[0].amount : -1
        if (left !== 0) problems.push('input hatch still holds ' + left + ' mB')
        if (rec.eut > 120) problems.push('recipe draws ' + rec.eut + ' EU/t')
        if (r.seen[path] === undefined) problems.push('recipe ' + path + ' never ran')
        return {
          ok: problems.length === 0,
          detail: rec.id + ' (' + rec.sourceEut + ' EU/t x ' + rec.sourceDuration + ' t in the tower; ' + rec.eut + ' EU/t x ' + rec.duration + ' t here): ' + have.join(', ') +
            ' | recipes seen=[' + seenIds(r) + ']' + (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : '')
        }
      }
    }
  }

  function towerScenarios() {
    return [
      towerScenario('wood_vinegar', 'wood_vinegar'),
      towerScenario('fermented_biomass', 'fermented_biomass'),
      towerScenario('charcoal_byproducts', 'charcoal_byproducts')
    ]
  }

  // ---------------------------------------------------------------- lookup checks

  // every recipe GTM's lookup can reach with the inputs now in the machine (the predicate accepts everything)
  function candidateIds(ctrl) {
    var ids = []
    var it = ctrl.getRecipeType().db().iterator(ctrl, function (r) { return true })
    if (it === null || it === undefined) return ids
    var guard = 0
    while (it.hasNext() && guard < 900) {
      ids.push(String(it.next().id))
      guard++
    }
    return ids
  }

  function setLookupInputs(m, c) {
    var P = m.parts
    if (P.inBus !== null) {
      clearInventory(P.inBus.getInventory())
      clearInventory(P.inBus.getCircuitInventory())
    }
    P.inHatches.forEach(function (h) { h.tank.setFluidInTank(0, lazy().FluidStack.EMPTY) })
    fillInputs(m, c)
  }

  function runLookup(m, ctrl, cases) {
    var bad = []
    cases.forEach(function (c) {
      setLookupInputs(m, c)
      var ids = candidateIds(ctrl)
      if (ids.indexOf(c.want) < 0) bad.push(c.label + ' wanted ' + c.want + ' got [' + ids.slice(0, 6).join(',') + ']')
    })
    check(m.key, 'LOOKUP', bad.length === 0, 'cases=' + cases.length + (bad.length > 0 ? ' unreachable=' + bad.slice(0, 8).join('; ') : ''))
  }

  function plantLookupCases() {
    return global.grindless.orePlant.recipes.map(function (plan) {
      return {
        label: plan.id, items: [{ id: plan.input, n: 1 }], circuit: plan.circuit,
        fluids: [{ hatch: 0, id: plan.fluid.id, mb: plan.fluid.amount }], want: plantRecipePath(plan)
      }
    })
  }

  function bioLookupCases() {
    return global.grindless.biorefinery.recipes.map(function (rec) {
      return { label: rec.id, items: [], circuit: 0, fluids: [{ hatch: 0, id: rec.input.id, mb: rec.input.amount }], want: rec.id }
    })
  }

  // ---------------------------------------------------------------- machines

  var SPECS = [
    { key: 'ore_plant_2hatch', id: PLANT_ID, x: 520, y: 102, z: 2, counts: { energy_input: 2 }, scenarios: plantAScenarios, lookup: null,
      previewParts: ['energy_input', 'input_bus', 'output_bus', 'input_hatch'],
      need: { energy: 2, inBus: true, outBuses: 2, inHatches: 2, outHatches: 0 } },
    { key: 'ore_plant_1hatch', id: PLANT_ID, x: 540, y: 102, z: 2, counts: {}, scenarios: plantBScenarios, lookup: plantLookupCases,
      previewParts: ['energy_input', 'input_bus', 'output_bus', 'input_hatch'],
      need: { energy: 1, inBus: true, outBuses: 2, inHatches: 2, outHatches: 0 } },
    { key: 'biorefinery', id: BIO_ID, x: 560, y: 100, z: 2, counts: {}, scenarios: towerScenarios, lookup: bioLookupCases,
      previewParts: ['energy_input', 'input_hatch', 'output_bus', 'output_hatch'],
      need: { energy: 1, inBus: false, outBuses: 1, inHatches: 1, outHatches: 7 } }
  ]

  // the chunks of the band are generated and force-loaded, and the band (and only the band) is cleared
  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    S.server.runCommandSilent('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    note(SCOPE, 'AREA', 'band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 +
      ' generated and force-loaded, changed ' + cleared + ' blocks while clearing')
  }

  function startMachine(spec) {
    var m = { key: spec.key, id: spec.id, spec: spec, phase: 'forming', t0: S.t, plan: null, ctrl: null, forced: false, noted: false,
      parts: null, scenarios: null, sc: -1, scStart: 0, seen: {}, stateNoted: false }
    S.machines.push(m)
    try {
      var def = GTRegistries.MACHINES.get(rl(spec.id))
      if (def === null || def === undefined) {
        check(spec.key, 'PATTERN', false, 'machine is not registered')
        m.phase = 'done'
        return
      }
      // the pattern is NOT built here: the structure is placed from the registered description and GTM builds the
      // pattern itself, lazily, when the controller first checks its structure (what happens in a real world)
      var desc = global.grindless.patterns.describe(spec.id)
      m.builtBefore = !!(desc && desc.built)
      m.def = def
      m.plan = planOf(spec.id, spec.x, spec.y, spec.z, spec.counts)
      check(spec.key, 'DESCRIPTION', true, 'registered at startup, ' + m.plan.blocks + ' blocks, ' + m.plan.size +
        ', pattern already built before placing: ' + m.builtBefore)
      if (!place(spec.key, m.plan)) {
        m.phase = 'done'
        return
      }
      m.ctrl = m.plan.ctrl
      m.t0 = S.t
    } catch (e) {
      check(spec.key, 'DESCRIPTION', false, 'exception while describing/placing: ' + e)
      m.phase = 'done'
    }
  }

  function observe(m, ctrl) {
    try {
      var last = ctrl.getRecipeLogic().getLastRecipe()
      if (last) {
        var id = String(last.id)
        var p = Number(last.parallels)
        if (m.seen[id] === undefined || p > m.seen[id]) m.seen[id] = p
      }
    } catch (e) { /* optional */ }
  }

  function nextScenario(m, ctrl) {
    m.sc++
    if (m.sc >= m.scenarios.length) {
      if (m.spec.lookup) {
        try {
          runLookup(m, ctrl, m.spec.lookup())
        } catch (e) {
          check(m.key, 'LOOKUP', false, 'exception: ' + e)
        }
      }
      m.phase = 'done'
      return
    }
    var sc = m.scenarios[m.sc]
    resetMachine(m, ctrl)
    m.seen = {}
    m.stateNoted = false
    m.fastForwarded = false
    fillScenario(m, sc)
    m.scStart = S.t
  }

  function partsProblem(m) {
    var P = m.parts
    var need = m.spec.need
    var problems = []
    if (P.energy.length !== need.energy) problems.push('energy hatches ' + P.energy.length + ' (wanted ' + need.energy + ')')
    if ((P.inBus !== null) !== need.inBus) problems.push('input bus ' + (P.inBus !== null))
    if (P.outBuses.length !== need.outBuses) problems.push('output buses ' + P.outBuses.length + ' (wanted ' + need.outBuses + ')')
    if (P.inHatches.length !== need.inHatches) problems.push('input hatches ' + P.inHatches.length + ' (wanted ' + need.inHatches + ')')
    if (P.outHatches.length !== need.outHatches) problems.push('output hatches ' + P.outHatches.length + ' (wanted ' + need.outHatches + ')')
    return problems
  }

  function advance(m) {
    var ctrl = machineAt(m.ctrl)
    if (ctrl === null || ctrl === undefined) {
      check(m.key, 'FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }

    if (m.phase === 'forming') {
      var waited = S.t - m.t0
      if (ctrl.isFormed()) {
        check(m.key, 'FORMED', true, (m.forced ? 'after a forced check, ' : 'by itself after ' + waited + ' ticks, ') +
          'parts=[' + partIds(ctrl).join(' ') + '] flipped=' + ctrl.isFlipped() + ' tier=' + (ctrl.getTier ? ctrl.getTier() : '?'))
        check(m.key, 'PATTERN', global.grindless.patterns.describe(m.id).built,
          'built by GTM itself on the first structure check (already built before placing: ' + m.builtBefore + ')')
        try {
          previewCheck(m.key, m.id, m.def, m.plan, m.spec.previewParts)
        } catch (e3) {
          check(m.key, 'PREVIEW', false, 'exception: ' + e3)
        }
        m.parts = findParts(ctrl)
        var problems = partsProblem(m)
        if (problems.length > 0) {
          check(m.key, 'PARTS', false, problems.join('; '))
          m.phase = 'done'
          return
        }
        if (m.id === BIO_ID) {
          // the tower class reads its output hatches bottom to top: layer N holds output N
          var ys = m.parts.outHatches.map(function (h) { return h.self().getPos().getY() - m.plan.ctrl.y })
          var layersOk = ys.length === 7 && ys.every(function (y, i) { return y === i + 1 })
          var fluidOutputs = null
          try { fluidOutputs = asArray(ctrl.getFluidOutputs()).length } catch (e4) { fluidOutputs = 'unreadable(' + e4 + ')' }
          var machineClass = 'unknown'
          try { machineClass = String(ctrl.getClass().getSimpleName()) } catch (e5) { machineClass = 'unreadable' }
          check(m.key, 'LAYERS', layersOk && fluidOutputs === 7, 'output hatch heights above the controller=[' + ys.join(',') + '] tower fluid outputs=' + fluidOutputs +
            ' class=' + machineClass)
        }
        m.scenarios = m.spec.scenarios()
        m.sc = -1
        m.phase = 'running'
        topUpEnergy(m)
        nextScenario(m, ctrl)
        return
      }
      if (waited >= FORM_TIMEOUT) {
        if (!global.grindless.patterns.describe(m.id).built) {
          check(m.key, 'FORMED', false, 'not formed after ' + waited + ' ticks and GTM never built the pattern')
          m.phase = 'done'
          return
        }
        var syncOk = ctrl.checkPatternWithLock()
        if (!syncOk) {
          check(m.key, 'FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(m, ctrl))
          m.phase = 'done'
          return
        }
        check(m.key, 'FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
        ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
        ctrl.onStructureFormed()
        m.forced = true
      }
      return
    }

    if (m.phase === 'running') {
      var sc = m.scenarios[m.sc]
      var running = S.t - m.scStart
      observe(m, ctrl)
      if (sc.fastForward && !m.fastForwarded && running >= 40) {
        var logic = ctrl.getRecipeLogic()
        if (String(logic.getStatus()) === 'WORKING' && logic.getDuration() > 100) {
          var before = logic.getProgress()
          logic.setProgress(logic.getDuration() - 20)
          m.fastForwarded = true
          note(m.key, 'FASTFORWARD_' + sc.name, 'progress ' + before + ' -> ' + logic.getProgress() + ' of ' + logic.getDuration() +
            ' (only the waiting is skipped, the outputs are the real ones)')
        }
      }
      if (!m.stateNoted && running >= 60) {
        m.stateNoted = true
        note(m.key, 'STATE_' + sc.name, 'after ' + running + ' ticks: ' + recipeState(ctrl) + ' ' + diagnose(ctrl))
      }
      if (running >= sc.ticks) {
        var verdict = null
        try {
          var result = collect(m, ctrl, sc)
          verdict = sc.verify(result)
        } catch (e) {
          verdict = { ok: false, detail: 'exception while checking: ' + e }
        }
        check(m.key, 'PROCESS_' + sc.name, verdict.ok, verdict.detail + ' | ' + recipeState(ctrl))
        nextScenario(m, ctrl)
      }
    }
  }

  function allDone() {
    for (var i = 0; i < S.machines.length; i++) {
      if (S.machines[i].phase !== 'done') return false
    }
    return true
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    console.info(TAG + SCOPE + '|DONE')
  }

  // setTimeout is not bound in the scripts of this server, so a server-tick handler drives the steps
  function step(elapsed) {
    try {
      S.t = elapsed
      S.machines.forEach(function (m) {
        if (m.phase === 'done') return
        try {
          advance(m)
        } catch (e) {
          check(m.key, 'STEP', false, 'exception in ' + m.phase + ': ' + e)
          m.phase = 'done'
        }
      })
      if (allDone()) finish()
    } catch (e) {
      check(SCOPE, 'STEP', false, 'exception: ' + e)
      finish()
    }
  }

  function onTick() {
    if (S === null || S.finished) return
    var now = S.server.getTickCount()
    S.machines.forEach(function (m) {
      if (m.phase === 'running') {
        try { topUpEnergy(m) } catch (e) { /* the next step reports problems */ }
      }
    })
    if (now < S.nextAt) return
    S.nextAt = now + STEP
    step(now - S.tick0)
  }

  function run(server) {
    var now = server.getTickCount()
    S = { server: server, level: server.overworld(), t: 0, tick0: now, nextAt: now + STEP, machines: [], finished: false }
    try {
      staticChecks()
    } catch (e) {
      check(SCOPE, 'static', false, 'exception: ' + e)
    }
    try {
      prepareWorld()
    } catch (e) {
      check(SCOPE, 'AREA', false, 'exception: ' + e)
    }
    SPECS.forEach(startMachine)
    if (allDone()) finish()
  }

  ServerEvents.tick(function () { onTick() })

  ServerEvents.customCommand('gg_test_mv_plant', function (event) {
    if (S !== null && !S.finished) {
      note(SCOPE, 'run', 'a previous gg_test_mv_plant run is still in progress')
      return 0
    }
    try {
      run(event.getLevel().getServer())
    } catch (e) {
      check(SCOPE, 'run', false, 'exception: ' + e)
      finish()
    }
    return 1
  })
})()
