// Gregtech Grindless - smoke test of the HV Refinery and Catalytic Reformer (TEST-ONLY overlay: copied over the instance on the test PC,
// never shipped with the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_hv_refinery' -WaitForLog 'GGTEST\|hv_refinery\|DONE@@1200'
//
// Markers: GGTEST|<scope>|<check>|PASS|FAIL|NOTE|<detail>   (scope = hv_refinery, or the key of a machine: refinery, reformer, refinery_2hatch)
//   hv_refinery|registration, items, counts, chain, catalyst, crafting, ender_eye, h2_balance   registration and data. `chain` compares EVERY
//       generated gtceu:refining recipe with the real GTM recipes it comes from in the recipe manager (tower, cracker and desulfurization
//       reactors): same ratios, energy = sum of the stages. `catalyst` reads the wear chance GTM sees (5 / 10000) in every recipe of both types.
//   <machine>|DESCRIPTION / PLACED / FORMED / PATTERN / PREVIEW / LAYERS   the registered description is placed block by block, forms, GTM builds the
//       pattern, previews it, and the output hatches sit on consecutive layers read by GTM's tower class
//   <machine>|PROCESS_<scenario>   one run of the machine: inputs in -> the expected fluids out, layer by layer
//   <machine>|LOOKUP               GTM's recipe lookup reaches every recipe of the type from its inputs
//   hv_refinery|DONE               last line
//
// Machines (both face north in the overworld, built and run at the same time):
//   refinery         around (1292, 99, 2)   one HV energy hatch; a mode-1 crude (oil), a second crude (heavy oil), hydro-cracking of naphtha and of
//                                           refinery gas (hydrogen goes in and out), steam cracking of naphtha (12 outputs + carbon), no catalyst =
//                                           no run, and a test recipe with a certain catalyst input (consumption check)
//   reformer         around (1316, 99, 2)   one HV energy hatch; benzene mode and hydrogen mode
//   refinery_2hatch  around (1332, 99, 2)   a second refinery with TWO HV energy hatches: forms, hydro-cracking and refining of oil
//   mixer            at (1300, 99, 12)      a single-block HV mixer: GTM's lookup finds the two catalyst recipes and the machine makes 4 catalysts of each
//                                           (marker scope `mixer`)
// TEST AREA: this test builds, force-loads and clears ONLY its own band of the overworld, X 1280-1343, Y 98-113, Z 0-15 (tests run at the same time
// in one server; other bands belong to other tests; the Refinery is 16 blocks tall, one more than the Y 98-112 of the convention). Everything is
// driven by the structure description that lib/patterns.js records (global.grindless.structures). var + function everywhere (this Rhino throws
// "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'hv_refinery'
  var STEP = 10
  var FORM_TIMEOUT = 600
  var BAND = { x0: 1280, x1: 1343, y0: 98, y1: 113, z0: 0, z1: 15 }

  // The pack's Additional Placements mod rebuilds its block tags and reloads the datapacks (so these scripts too) a couple of seconds after the
  // server is up; a test that is running then is lost and its static checks can see empty tags. The command therefore only leaves a request in
  // `global` (it survives script reloads) and the tick handler starts the test once these scripts have been loaded for QUIET_MS.
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestHvRefineryRequest'

  var REFINERY_ID = 'gtceu:refinery'
  var REFORMER_ID = 'gtceu:reformer'
  var CATALYST = 'grindless:hydrotreating_catalyst'
  var REFORMING_CATALYST = 'grindless:reforming_catalyst'
  var CONSUME_PATH = 'gg_test:refining/consume'
  var CONSUME_CIRCUIT = 9
  var CATALYST_WEAR = 5

  var PART_BLOCKS = {
    energy_input: 'gtceu:hv_energy_input_hatch',
    input_bus: 'gtceu:hv_input_bus',
    output_bus: 'gtceu:hv_output_bus',
    input_hatch: 'gtceu:hv_input_hatch',
    output_hatch: 'gtceu:hv_output_hatch'
  }
  // preferred facing of parts: the first side that has no structure block in front of it
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  var S = null
  var metaMachineClass = null
  var classes = null

  // the test-only recipe: a catalyst that IS used up (chance 10000 = certain), so the consumption through the input bus is seen for real
  ServerEvents.recipes(function (event) {
    try {
      event.recipes.gtceu.refining('gg_test:consume')
        .chancedInput(CATALYST, 10000, 0)
        .circuit(CONSUME_CIRCUIT)
        .inputFluids(Fluid.of('gtceu:naphtha', 10))
        .outputFluids(Fluid.of('gtceu:hydrogen', 10))
        .EUt(8).duration(400)
    } catch (e) {
      console.error('[gg_test hv_refinery] could not add the consumption test recipe: ' + e)
    }
  })

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
        return { j: j, chance: Number(c.chance), max: Number(c.maxChance) }
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

  function recipeCount(typeId) {
    var type = GTRegistries.RECIPE_TYPES.get(rl(typeId))
    return type ? S.server.getRecipeManager().getAllRecipesFor(type).size() : -1
  }

  // the programmed circuit of a recipe's item inputs (0 = none)
  function circuitOf(rec) {
    var circuit = 0
    rec.itemsIn.forEach(function (o) {
      if (!o.j) return
      if (o.j.configuration !== undefined) circuit = Number(o.j.configuration)
      else if (o.j.ingredient && o.j.ingredient.configuration !== undefined) circuit = Number(o.j.ingredient.configuration)
    })
    return circuit
  }

  // the wear of an item input as GTM sees it: { chance, max } of the first input with that item id (null = not an input)
  function wearOf(rec, itemId) {
    var found = null
    rec.itemsIn.forEach(function (o) {
      var it = parseItem(o.j)
      if (it !== null && it.id === itemId && found === null) found = { chance: o.chance, max: o.max }
    })
    return found
  }

  function sameFluidLists(want, got, k) {
    if (want.length !== got.length) return 'count ' + got.length + ' (wanted ' + want.length + ')'
    for (var i = 0; i < want.length; i++) {
      var w = want[i]
      var g = got[i]
      if (g === null || w === null) return 'unreadable fluid ' + i
      if (fluidShort(w) !== fluidShort(g) || Math.abs(w.amount * k - g.amount) > 1e-6) {
        return i + ': ' + fluidShort(g) + ' ' + g.amount + ' (wanted ' + fluidShort(w) + ' ' + (w.amount * k) + ')'
      }
    }
    return null
  }

  // ---------------------------------------------------------------- static checks

  function fluidsOf(rec, side) {
    return rec[side].map(function (o) { return parseFluid(o.j) })
  }

  // what GTM's stages give for this recipe: { fluidsIn, fluidsOut, items: [{ id, count, ratio }], energy } for ONE run of the stages (scale 1)
  function expectedCrack(src) {
    var cracker = src[0]
    var tower = src[1]
    var towerIn = parseFluid(tower.fluidsIn[0].j)
    var crackerOut = parseFluid(cracker.fluidsOut[0].j)
    var runs = towerIn.amount / crackerOut.amount
    return {
      fluidsIn: fluidsOf(cracker, 'fluidsIn').map(function (f) { return { id: f.id, tag: f.tag, amount: f.amount * runs } }),
      fluidsOut: fluidsOf(tower, 'fluidsOut'),
      items: tower.itemsOut.map(function (o) {
        var it = parseItem(o.j)
        return { id: it.id, count: it.count, ratio: o.chance / o.max }
      }),
      energy: runs * cracker.eut * cracker.duration + tower.eut * tower.duration
    }
  }

  function expectedCrude(src) {
    var tower = src[0]
    var energy = tower.eut * tower.duration
    var outs = []
    var h2 = 0
    var h2s = 0
    fluidsOf(tower, 'fluidsOut').forEach(function (o, i) {
      var d = src[1 + i]
      var dIn = fluidsOf(d, 'fluidsIn')
      var dOut = fluidsOf(d, 'fluidsOut')
      var sulfuric = null
      var hydrogen = null
      var sulfide = null
      var clean = null
      dIn.forEach(function (f) {
        if (fluidShort(f) === 'hydrogen') hydrogen = f
        else sulfuric = f
      })
      dOut.forEach(function (f) {
        if (fluidShort(f) === 'hydrogen_sulfide') sulfide = f
        else clean = f
      })
      var batches = o.amount / sulfuric.amount
      outs.push({ id: clean.id, tag: clean.tag, amount: batches * clean.amount })
      h2 += batches * hydrogen.amount
      h2s += batches * sulfide.amount
      energy += batches * d.eut * d.duration
    })
    var crude = fluidsOf(tower, 'fluidsIn')[0]
    return {
      fluidsIn: [{ id: crude.id, tag: crude.tag, amount: crude.amount }, { id: 'gtceu:hydrogen', amount: h2 }],
      fluidsOut: outs.concat([{ id: 'gtceu:hydrogen_sulfide', amount: h2s }]),
      items: [],
      energy: energy
    }
  }

  function chainCheck() {
    var REF = global.grindless.refinery
    var problems = []
    var compared = 0
    var surplus = []
    REF.recipes.forEach(function (plan) {
      var gen = readRecipe(plan.id)
      if (gen === null) {
        problems.push(plan.name + ': not in the recipe manager')
        return
      }
      var src = plan.sources.map(readRecipe)
      if (src.some(function (s) { return s === null })) {
        problems.push(plan.name + ': a source recipe is not in the recipe manager')
        return
      }
      compared++
      var want = plan.mode === 'refining' ? expectedCrude(src) : expectedCrack(src)
      var k = plan.scale
      var bad = sameFluidLists(want.fluidsIn, fluidsOf(gen, 'fluidsIn'), k)
      if (bad) problems.push(plan.name + ' fluids in ' + bad)
      bad = sameFluidLists(want.fluidsOut, fluidsOf(gen, 'fluidsOut'), k)
      if (bad) problems.push(plan.name + ' fluids out ' + bad)
      if (want.items.length !== gen.itemsOut.length) {
        problems.push(plan.name + ' ' + gen.itemsOut.length + ' item outputs (wanted ' + want.items.length + ')')
      } else {
        want.items.forEach(function (w, i) {
          var g = parseItem(gen.itemsOut[i].j)
          var ratio = gen.itemsOut[i].chance / gen.itemsOut[i].max
          if (g === null || g.id !== w.id || g.count !== w.count * k || Math.abs(ratio - w.ratio) > 0.0002) {
            problems.push(plan.name + ' item ' + i + ' ' + JSON.stringify(g) + ' @' + ratio.toFixed(4) + ' (wanted ' + w.id + ' x' + (w.count * k) + ' @' + w.ratio.toFixed(4) + ')')
          }
        })
      }
      var energy = gen.eut * gen.duration
      var floor = want.energy * k
      if (gen.eut > REF.maxEut || energy < floor - 1e-6 || energy >= floor + gen.eut) {
        problems.push(plan.name + ' energy ' + gen.duration + ' t x ' + gen.eut + ' EU/t = ' + energy + ' (stages ' + floor + ', surplus must stay under one EU/t)')
      }
      if (circuitOf(gen) !== plan.circuit) problems.push(plan.name + ' circuit ' + circuitOf(gen) + ' (wanted ' + plan.circuit + ')')
      surplus.push(plan.name + ' ' + (100 * (energy - floor) / floor).toFixed(2) + '%')
    })
    return { problems: problems, compared: compared, surplus: surplus }
  }

  function catalystCheck() {
    var REF = global.grindless.refinery
    var RF = global.grindless.reformer
    var problems = []
    var read = 0
    REF.recipes.forEach(function (plan) {
      var gen = readRecipe(plan.id)
      var wear = gen === null ? null : wearOf(gen, CATALYST)
      read++
      if (wear === null || wear.chance !== CATALYST_WEAR || wear.max !== 10000) problems.push(plan.name + ' ' + JSON.stringify(wear))
    })
    RF.recipes.forEach(function (plan) {
      var gen = readRecipe(plan.id)
      var wear = gen === null ? null : wearOf(gen, REFORMING_CATALYST)
      read++
      if (wear === null || wear.chance !== CATALYST_WEAR || wear.max !== 10000) problems.push(plan.name + ' ' + JSON.stringify(wear))
      if (gen !== null && circuitOf(gen) !== plan.circuit) problems.push(plan.name + ' circuit ' + circuitOf(gen))
    })
    var consume = readRecipe(CONSUME_PATH)
    var certain = consume === null ? null : wearOf(consume, CATALYST)
    if (certain === null || certain.chance !== 10000 || certain.max !== 10000) problems.push('consume ' + JSON.stringify(certain))
    return { problems: problems, read: read }
  }

  // the reformer recipes (hand-written): numbers, order of the outputs, energy
  function reformerCheck() {
    var RF = global.grindless.reformer
    var problems = []
    RF.recipes.forEach(function (plan) {
      var gen = readRecipe(plan.id)
      if (gen === null) {
        problems.push(plan.name + ': not in the recipe manager')
        return
      }
      var bad = sameFluidLists(plan.fluidsIn.map(function (f) { return { id: f.id, amount: f.amount } }), fluidsOf(gen, 'fluidsIn'), 1)
      if (bad) problems.push(plan.name + ' in ' + bad)
      bad = sameFluidLists(plan.fluidsOut.map(function (f) { return { id: f.id, amount: f.amount } }), fluidsOf(gen, 'fluidsOut'), 1)
      if (bad) problems.push(plan.name + ' out ' + bad)
      if (gen.eut !== plan.eut || gen.duration !== plan.duration) problems.push(plan.name + ' ' + gen.eut + ' EU/t x ' + gen.duration + ' t')
    })
    return problems
  }

  // item inputs of a recipe as { <id or #tag>: count }
  function inputMap(rec) {
    var map = {}
    rec.itemsIn.forEach(function (o) {
      var it = parseItem(o.j)
      if (it === null) return
      var key = it.id !== undefined ? it.id : '#' + it.tag
      map[key] = (map[key] || 0) + it.count
    })
    return map
  }

  function sameMap(want, got) {
    var keys = dedupe(Object.keys(want).concat(Object.keys(got)))
    var bad = keys.filter(function (k) { return want[k] !== got[k] })
    return bad.length === 0 ? null : bad.map(function (k) { return k + ' ' + got[k] + ' (wanted ' + want[k] + ')' }).join(', ')
  }

  function craftingChecks(rm) {
    var REF = global.grindless.refinery
    var problems = []
    var refinery = readRecipe(REF.craftingRecipes.refinery)
    if (refinery === null) {
      problems.push('no ' + REF.craftingRecipes.refinery)
    } else {
      var bad = sameMap({ 'gtceu:hv_machine_hull': 1, 'gtceu:hv_distillery': 1, 'gtceu:hv_chemical_reactor': 2, 'gtceu:hv_electric_pump': 2, '#gtceu:circuits/hv': 4 }, inputMap(refinery))
      if (bad) problems.push('refinery assembler inputs: ' + bad)
      var out = refinery.itemsOut.length === 1 ? parseItem(refinery.itemsOut[0].j) : null
      if (out === null || out.id !== REFINERY_ID || out.count !== 1) problems.push('refinery assembler output ' + JSON.stringify(out))
    }
    if (!rm.byKey(rl(REF.craftingRecipes.reformer)).isPresent()) problems.push('no ' + REF.craftingRecipes.reformer)
    var hydrotreating = readRecipe(REF.catalystRecipes.hydrotreating)
    var reforming = readRecipe(REF.catalystRecipes.reforming)
    if (hydrotreating === null || reforming === null) {
      problems.push('a catalyst recipe is missing')
    } else {
      var b1 = sameMap({ 'gtceu:cobalt_dust': 1, 'gtceu:molybdenum_dust': 1, 'gtceu:silicon_dioxide_dust': 3 }, inputMap(hydrotreating))
      var b2 = sameMap({ 'gtceu:platinum_dust': 1, 'gtceu:silicon_dioxide_dust': 3 }, inputMap(reforming))
      if (b1) problems.push('hydrotreating catalyst inputs: ' + b1)
      if (b2) problems.push('reforming catalyst inputs: ' + b2)
      var o1 = parseItem(hydrotreating.itemsOut[0].j)
      var o2 = parseItem(reforming.itemsOut[0].j)
      if (o1 === null || o1.id !== CATALYST || o1.count !== 4) problems.push('hydrotreating catalyst output ' + JSON.stringify(o1))
      if (o2 === null || o2.id !== REFORMING_CATALYST || o2.count !== 4) problems.push('reforming catalyst output ' + JSON.stringify(o2))
    }
    return problems
  }

  // GTM's own route to an ender eye, and the vanilla recipe gone
  function enderEyeCheck(rm) {
    var problems = []
    var vanilla = rm.byKey(rl('minecraft:ender_eye')).isPresent()
    if (vanilla) problems.push('minecraft:ender_eye is still there')
    // the dust and the pearl the route works with are what the tags say they are
    var blazeDusts = asArray(Ingredient.of('#forge:dusts/blaze').getItemIds()).map(String)
    var pearls = asArray(Ingredient.of('#forge:gems/ender_pearl').getItemIds()).map(String)
    if (blazeDusts.indexOf('minecraft:blaze_powder') < 0) problems.push('#forge:dusts/blaze does not hold minecraft:blaze_powder (' + blazeDusts.join(',') + ')')
    if (pearls.indexOf('minecraft:ender_pearl') < 0) problems.push('#forge:gems/ender_pearl does not hold minecraft:ender_pearl (' + pearls.join(',') + ')')
    var blaze = readRecipe('gtceu:chemical_reactor/blaze_powder')
    var extract = readRecipe('gtceu:extractor/extract_blaze_powder')
    var bath = readRecipe('gtceu:chemical_bath/eye_of_ender')
    if (blaze === null) {
      problems.push('no gtceu:chemical_reactor/blaze_powder')
    } else {
      var bad = sameMap({ '#forge:dusts/carbon': 1, '#forge:dusts/sulfur': 1 }, inputMap(blaze))
      var out = blaze.itemsOut.length === 1 ? parseItem(blaze.itemsOut[0].j) : null
      if (bad) problems.push('blaze powder inputs: ' + bad)
      if (out === null || out.id !== 'minecraft:blaze_powder') problems.push('blaze powder output ' + JSON.stringify(out))
      if (blaze.eut !== 480) problems.push('blaze powder draws ' + blaze.eut + ' EU/t (HV is 480)')
    }
    if (extract === null) {
      problems.push('no gtceu:extractor/extract_blaze_powder')
    } else {
      var liquid = extract.fluidsOut.length === 1 ? parseFluid(extract.fluidsOut[0].j) : null
      if (liquid === null || fluidShort(liquid) !== 'blaze' || liquid.amount !== 144) problems.push('liquid blaze ' + JSON.stringify(liquid))
    }
    if (bath === null) {
      problems.push('no gtceu:chemical_bath/eye_of_ender')
    } else {
      var fin = bath.fluidsIn.length === 1 ? parseFluid(bath.fluidsIn[0].j) : null
      var item = bath.itemsOut.length === 1 ? parseItem(bath.itemsOut[0].j) : null
      if (fin === null || fluidShort(fin) !== 'blaze' || fin.amount !== 144) problems.push('eye bath fluid ' + JSON.stringify(fin))
      if (item === null || item.id !== 'minecraft:ender_eye') problems.push('eye bath output ' + JSON.stringify(item))
      if (bath.eut !== 120) problems.push('eye bath draws ' + bath.eut + ' EU/t (the End is MV since v0.5.0: 120)')
      var pearl = inputMap(bath)
      if (pearl['#forge:gems/ender_pearl'] !== 1) problems.push('eye bath item inputs ' + JSON.stringify(pearl))
    }
    return problems
  }

  function staticChecks() {
    var G = global.grindless
    var REF = G.refinery
    var RF = G.reformer
    var rm = S.server.getRecipeManager()
    var fc = lazy().FluidCap
    var ic = lazy().ItemCap

    var refining = GTRegistries.RECIPE_TYPES.get(rl('gtceu:refining'))
    var reforming = GTRegistries.RECIPE_TYPES.get(rl('gtceu:reforming'))
    var missingMachines = [REFINERY_ID, REFORMER_ID].filter(function (id) { return !GTRegistries.MACHINES.get(rl(id)) })
    var sizesOk = !!refining && !!reforming && refining.getMaxInputs(ic) === 2 && refining.getMaxOutputs(ic) === 1 && refining.getMaxInputs(fc) === 2 &&
      refining.getMaxOutputs(fc) === 12 && reforming.getMaxInputs(ic) === 2 && reforming.getMaxOutputs(ic) === 0 && reforming.getMaxInputs(fc) === 1 &&
      reforming.getMaxOutputs(fc) === 3
    check(SCOPE, 'registration', sizesOk && missingMachines.length === 0,
      'refining=' + (refining ? 'registered (items in ' + refining.getMaxInputs(ic) + ' out ' + refining.getMaxOutputs(ic) + ', fluids in ' + refining.getMaxInputs(fc) + ' out ' + refining.getMaxOutputs(fc) + ')' : 'missing') +
      ' reforming=' + (reforming ? 'registered (items in ' + reforming.getMaxInputs(ic) + ' out ' + reforming.getMaxOutputs(ic) + ', fluids in ' + reforming.getMaxInputs(fc) + ' out ' + reforming.getMaxOutputs(fc) + ')' : 'missing') +
      ' machines=' + (missingMachines.length === 0 ? 'registered' : 'missing ' + missingMachines.join(',')))

    var items = dedupe(REF.craftingParts.concat(RF.craftingParts).concat(REF.catalystParts).concat(['gtceu:clean_machine_casing', 'gtceu:steel_pipe_casing',
      'gtceu:hv_energy_input_hatch', 'gtceu:hv_input_bus', 'gtceu:hv_output_bus', 'gtceu:hv_input_hatch', 'gtceu:hv_output_hatch',
      'gtceu:programmed_circuit', 'gtceu:carbon_dust', 'gtceu:tiny_carbon_dust', 'gtceu:sulfur_dust', 'minecraft:blaze_powder', 'minecraft:ender_eye']))
    var missingItems = items.filter(function (id) { return !Item.exists(id) })
    var fluids = ['gtceu:oil', 'gtceu:oil_medium', 'gtceu:oil_light', 'gtceu:oil_heavy', 'gtceu:hydrogen', 'gtceu:hydrogen_sulfide', 'gtceu:steam', 'gtceu:naphtha',
      'gtceu:light_fuel', 'gtceu:heavy_fuel', 'gtceu:refinery_gas', 'gtceu:benzene', 'gtceu:toluene', 'gtceu:blaze', 'gcyr:para_xylene']
    var missingFluids = fluids.filter(function (id) { return !Fluid.exists(id) })
    check(SCOPE, 'items', missingItems.length === 0 && missingFluids.length === 0,
      'items=' + items.length + ' fluids=' + fluids.length + (missingItems.length > 0 ? ' missing items=' + missingItems.join(',') : '') +
      (missingFluids.length > 0 ? ' missing fluids=' + missingFluids.join(',') : ''))
    var tags = ['gtceu:circuits/hv']
    var emptyTags = tags.filter(function (t) { return tagSize(t) === 0 })
    check(SCOPE, 'tags', emptyTags.length === 0, 'count=' + tags.length + (emptyTags.length > 0 ? ' empty=' + emptyTags.join(',') : ''))

    var wantRefining = REF.recipes.length
    var haveRefining = recipeCount('gtceu:refining')
    var wantReforming = RF.recipes.length
    var haveReforming = recipeCount('gtceu:reforming')
    var byMode = {}
    REF.recipes.forEach(function (p) { byMode[p.mode] = (byMode[p.mode] || 0) + 1 })
    check(SCOPE, 'counts', wantRefining === 12 && REF.skipped.length === 0 && haveRefining === wantRefining + 1 && wantReforming === 3 && haveReforming === wantReforming,
      'refining=' + haveRefining + ' (' + wantRefining + ' generated from ' + REF.stages + ' GTM recipes + 1 test recipe; refining ' + (byMode.refining || 0) + ', hydrocrack ' +
      (byMode.hydrocrack || 0) + ', steamcrack ' + (byMode.steamcrack || 0) + ') skipped=' + REF.skipped.length +
      (REF.skipped.length > 0 ? ' [' + REF.skipped.map(function (s) { return s.name + ': ' + s.reason }).join(' ; ') + ']' : '') +
      ' reforming=' + haveReforming + '/' + wantReforming)

    try {
      var chain = chainCheck()
      check(SCOPE, 'chain', chain.problems.length === 0 && chain.compared === wantRefining,
        'recipes compared with the GTM stages they come from=' + chain.compared + '/' + wantRefining + (chain.problems.length > 0 ? ' problems(' + chain.problems.length + ')=' + chain.problems.slice(0, 8).join(' ; ') : ''))
      note(SCOPE, 'energy_surplus', 'over the sum of the stages (never under): ' + chain.surplus.join(', '))
    } catch (e1) {
      check(SCOPE, 'chain', false, 'exception: ' + e1)
    }

    try {
      var summary = REF.recipes.map(function (p) {
        return p.name + ':' + p.fluidsIn.length + 'in/' + p.fluidsOut.length + 'out' + (p.items.length > 0 ? '+i' : '') + ' x' + p.scale + ' ' + p.eut + ' EU/t x ' + p.duration + ' t'
      })
      note(SCOPE, 'refining_recipes', summary.join(' ; '))
      var crude = []
      Object.keys(REF.h2).sort().forEach(function (name) {
        var h = REF.h2[name]
        crude.push(name + ': ' + h.crude + ' mB + ' + h.h2 + ' H2 (' + (h.h2 / h.crude).toFixed(4) + ' per mB) -> ' + h.naphtha + ' naphtha (' + (h.naphtha / h.crude).toFixed(4) + ' per mB) + ' + h.h2s + ' H2S')
      })
      note(SCOPE, 'crude_numbers', crude.join(' ; '))
    } catch (e2) {
      check(SCOPE, 'refining_recipes', false, 'exception: ' + e2)
    }

    try {
      var cat = catalystCheck()
      check(SCOPE, 'catalyst', cat.problems.length === 0,
        'wear chance read from ' + cat.read + ' recipes = ' + CATALYST_WEAR + ' / 10000 (0.05 %), and 10000 in the test recipe' + (cat.problems.length > 0 ? ' problems=' + cat.problems.join(' ; ') : ''))
    } catch (e3) {
      check(SCOPE, 'catalyst', false, 'exception: ' + e3)
    }

    try {
      var ref = reformerCheck()
      check(SCOPE, 'reformer_recipes', ref.length === 0, 'recipes=' + RF.recipes.length + (ref.length > 0 ? ' problems=' + ref.join(' ; ') : ''))
    } catch (e4) {
      check(SCOPE, 'reformer_recipes', false, 'exception: ' + e4)
    }

    try {
      var craft = craftingChecks(rm)
      check(SCOPE, 'crafting', craft.length === 0, 'refinery (assembler), reformer (crafting table), two catalysts (mixer)' + (craft.length > 0 ? ' problems=' + craft.join(' ; ') : ''))
    } catch (e5) {
      check(SCOPE, 'crafting', false, 'exception: ' + e5)
    }

    try {
      var eye = enderEyeCheck(rm)
      check(SCOPE, 'ender_eye', eye.length === 0, 'vanilla recipe removed; blaze powder (HV reactor) -> 144 mB blaze (extractor) -> ender eye (HV chemical bath)' + (eye.length > 0 ? ' problems=' + eye.join(' ; ') : ''))
    } catch (e6) {
      check(SCOPE, 'ender_eye', false, 'exception: ' + e6)
    }

    // the hydrogen balance: what reforming ALL the naphtha of a crude gives back, against what the refining spent
    try {
      var lines = []
      Object.keys(REF.h2).sort().forEach(function (name) {
        var h = REF.h2[name]
        var shares = RF.recipes.map(function (r) {
          var made = 0
          r.fluidsOut.forEach(function (f) { if (f.id === 'gtceu:hydrogen') made = f.amount })
          return r.name + ' ' + (100 * h.naphtha * (made / r.fluidsIn[0].amount) / h.h2).toFixed(1) + '%'
        })
        lines.push(name + ': ' + shares.join(', '))
      })
      note(SCOPE, 'h2_balance', 'H2 given back by reforming all the naphtha of the crude, as a share of the H2 the refining used: ' + lines.join(' ; '))
    } catch (e7) {
      note(SCOPE, 'h2_balance', 'exception: ' + e7)
    }
  }

  // ---------------------------------------------------------------- structures (same technique as gg_test_mv_plant.js)

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
      ' parts=' + parts.length + ' [' + parts.slice(0, 6).join(' ') + ' ...]' +
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
      duration: m.duration,
      hatches: P.energy.length,
      sc: sc
    }
  }

  function seenIds(r) {
    return Object.keys(r.seen).map(function (id) { return id + '(x' + r.seen[id] + ')' }).join(',')
  }

  // GTM's overclock of a recipe: the tier of the recipe is the smallest one whose voltage covers its EU/t, the machine overclocks up to the tier of its
  // energy supply, every step costs 4x the EU/t and halves the time. An HV energy hatch takes 2 A: one is an HV supply (512 V), two are 4 A = an EV
  // supply (GTM compacts four amps into one amp of a higher voltage), which is why a second hatch buys a second overclock step
  var TIER_VOLTS = [8, 32, 128, 512, 2048, 8192]

  function tierOf(eut) {
    for (var i = 0; i < TIER_VOLTS.length; i++) {
      if (eut <= TIER_VOLTS[i]) return i
    }
    return TIER_VOLTS.length - 1
  }

  function expectedTicks(eut, ticks, hatches) {
    var supply = hatches >= 2 ? 4 : 3
    var steps = supply - tierOf(eut)
    var power = eut
    var time = ticks
    while (steps > 0 && power * 4 <= TIER_VOLTS[supply] && time / 2 >= 1) {
      power *= 4
      time /= 2
      steps--
    }
    return Math.floor(time)
  }

  // ---------------------------------------------------------------- scenarios

  function planByName(name) {
    var list = global.grindless.refinery.recipes
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === name) return list[i]
    }
    throw new Error('no generated refining recipe ' + name)
  }

  function reformerByName(name) {
    var list = global.grindless.reformer.recipes
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === name) return list[i]
    }
    throw new Error('no reforming recipe ' + name)
  }

  // a plan (generated refining recipe or hand-written reforming recipe) run once: the fluids of every layer, the carbon, the inputs used up
  function layerScenario(name, plan, catalyst) {
    return {
      name: name,
      ticks: plan.duration + 100,
      items: [{ id: catalyst, n: 1 }],
      circuit: plan.circuit,
      fluids: plan.fluidsIn.map(function (f, i) { return { hatch: i, id: f.id, mb: f.amount } }),
      verify: function (r) {
        var problems = []
        var have = []
        plan.fluidsOut.forEach(function (f, i) {
          var h = r.fluidOut[i]
          have.push((i + 1) + ':' + f.id.replace('gtceu:', '') + ' ' + (h ? h.amount : '?'))
          if (!h) problems.push('no output hatch on layer ' + (i + 1))
          else if (h.id !== f.id || h.amount !== f.amount) problems.push('layer ' + (i + 1) + ' holds ' + h.id + ' ' + h.amount + ', wanted ' + f.id + ' ' + f.amount)
        })
        for (var i = plan.fluidsOut.length; i < r.fluidOut.length; i++) {
          if (r.fluidOut[i].amount !== 0) problems.push('layer ' + (i + 1) + ' should be empty but holds ' + r.fluidOut[i].id + ' ' + r.fluidOut[i].amount)
        }
        var items = plan.items || []
        items.forEach(function (it) {
          var got = r.items[it.id] || 0
          var lo = it.chance >= 10000 ? it.count : 0
          have.push(it.id.replace('gtceu:', '') + ' ' + got + ' [' + lo + '-' + it.count + ']')
          if (got < lo || got > it.count) problems.push(it.id + ' ' + got + ' not in ' + lo + '-' + it.count)
        })
        var unexpected = Object.keys(r.items).filter(function (id) { return !items.some(function (it) { return it.id === id }) })
        if (unexpected.length > 0) problems.push('unexpected items ' + unexpected.join(','))
        r.fluidIn.forEach(function (h, i) {
          if (h.amount !== 0) problems.push('input hatch ' + i + ' still holds ' + h.id + ' ' + h.amount + ' mB')
        })
        var left = r.leftover[catalyst] || 0
        if (left > 1) problems.push('catalyst x' + left + ' in the bus (one was put in)')
        if (r.seen[plan.id] === undefined) problems.push('recipe ' + plan.id + ' never ran')
        var others = Object.keys(r.seen).filter(function (id) { return id !== plan.id })
        if (others.length > 0) problems.push('other recipes seen ' + others.join(','))
        // the overclock: how long the run was, against what GTM's rules give for the energy hatches of the machine
        var wantTicks = expectedTicks(plan.eut, plan.duration, r.hatches)
        if (!(r.duration > 0)) problems.push('the length of the run was never seen')
        else if (Math.abs(r.duration - wantTicks) > 1) problems.push('the run lasted ' + r.duration + ' t, GTM\'s overclock gives ' + wantTicks + ' t for ' + r.hatches + ' HV hatch(es)')
        return {
          ok: problems.length === 0,
          detail: plan.id + ' (' + plan.eut + ' EU/t x ' + plan.duration + ' t before the overclock, ' + r.duration + ' t with ' + r.hatches + ' HV hatch(es)): ' + have.join(', ') + ' | catalyst left=' + left +
            ' | recipes seen=[' + seenIds(r) + ']' + (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : '')
        }
      }
    }
  }

  // no catalyst in the bus: nothing may happen and nothing may be taken
  function noCatalystScenario() {
    var plan = planByName('refine_oil')
    return {
      name: 'no_catalyst',
      ticks: 80,
      items: [],
      circuit: plan.circuit,
      fluids: plan.fluidsIn.map(function (f, i) { return { hatch: i, id: f.id, mb: f.amount } }),
      verify: function (r) {
        var problems = []
        r.fluidOut.forEach(function (h, i) {
          if (h.amount !== 0) problems.push('layer ' + (i + 1) + ' holds ' + h.id + ' ' + h.amount)
        })
        r.fluidIn.forEach(function (h, i) {
          if (h.amount !== plan.fluidsIn[i].amount) problems.push('input hatch ' + i + ' holds ' + h.amount + ' (put in ' + plan.fluidsIn[i].amount + ')')
        })
        if (Object.keys(r.seen).length > 0) problems.push('recipes seen ' + seenIds(r))
        return {
          ok: problems.length === 0,
          detail: 'oil + hydrogen + circuit 1 without the catalyst: no run, inputs untouched' + (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : '')
        }
      }
    }
  }

  // the test recipe uses the catalyst up for certain: it has to be gone from the bus afterwards
  function consumeScenario() {
    return {
      name: 'catalyst_consumed',
      ticks: 200,
      items: [{ id: CATALYST, n: 1 }],
      circuit: CONSUME_CIRCUIT,
      fluids: [{ hatch: 0, id: 'gtceu:naphtha', mb: 10 }],
      verify: function (r) {
        var problems = []
        var out = r.fluidOut[0]
        if (!out || out.id !== 'gtceu:hydrogen' || out.amount !== 10) problems.push('layer 1 holds ' + (out ? out.id + ' ' + out.amount : '?') + ', wanted gtceu:hydrogen 10')
        var left = r.leftover[CATALYST] || 0
        if (left !== 0) problems.push('the catalyst is still in the bus (x' + left + ')')
        if (r.fluidIn[0].amount !== 0) problems.push('naphtha left ' + r.fluidIn[0].amount)
        if (r.seen[CONSUME_PATH] === undefined) problems.push('recipe ' + CONSUME_PATH + ' never ran')
        return {
          ok: problems.length === 0,
          detail: 'test recipe with a certain catalyst input: catalyst left in the bus=' + left + ' recipes seen=[' + seenIds(r) + ']' + (problems.length > 0 ? ' | problems: ' + problems.join(' ; ') : '')
        }
      }
    }
  }

  function refineryScenarios() {
    return [
      layerScenario('refine_oil', planByName('refine_oil'), CATALYST),
      layerScenario('refine_heavy_oil', planByName('refine_heavy_oil'), CATALYST),
      layerScenario('hydrocrack_naphtha', planByName('hydrocrack_naphtha'), CATALYST),
      layerScenario('hydrocrack_refinery_gas', planByName('hydrocrack_refinery_gas'), CATALYST),
      layerScenario('steamcrack_naphtha', planByName('steamcrack_naphtha'), CATALYST),
      noCatalystScenario(),
      consumeScenario()
    ]
  }

  // the second refinery, with two energy hatches: forms and runs one recipe. Two HV hatches are 4 A, which GTM compacts into an EV supply (machine tier 4),
  // so the same recipes overclock one step more than with a single hatch; the check of the length of the run above is what pins that down
  function twoHatchScenarios() {
    return [
      layerScenario('hydrocrack_naphtha', planByName('hydrocrack_naphtha'), CATALYST),
      layerScenario('refine_oil', planByName('refine_oil'), CATALYST)
    ]
  }

  function reformerScenarios() {
    return [
      layerScenario('benzene_mode', reformerByName('benzene'), REFORMING_CATALYST),
      layerScenario('hydrogen_mode', reformerByName('hydrogen'), REFORMING_CATALYST)
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

  function lookupCase(plan, catalyst, want) {
    return {
      label: plan.name || want,
      items: [{ id: catalyst, n: 1 }],
      circuit: plan.circuit,
      fluids: plan.fluidsIn.map(function (f, i) { return { hatch: i, id: f.id, mb: f.amount } }),
      want: want
    }
  }

  function refineryLookupCases() {
    var cases = global.grindless.refinery.recipes.map(function (p) { return lookupCase(p, CATALYST, p.id) })
    cases.push({ label: 'consume', items: [{ id: CATALYST, n: 1 }], circuit: CONSUME_CIRCUIT, fluids: [{ hatch: 0, id: 'gtceu:naphtha', mb: 10 }], want: CONSUME_PATH })
    return cases
  }

  function reformerLookupCases() {
    return global.grindless.reformer.recipes.map(function (p) { return lookupCase(p, REFORMING_CATALYST, p.id) })
  }

  // ---------------------------------------------------------------- the mixer that makes the catalysts (a single-block HV mixer)

  var MIXER = {
    id: 'gtceu:hv_mixer', x: 1300, y: 99, z: 12, ticks: 360,
    cases: [
      { name: 'hydrotreating_catalyst', recipe: 'grindless:mixer/hydrotreating_catalyst', out: { id: CATALYST, n: 4 },
        items: [{ id: 'gtceu:cobalt_dust', n: 1 }, { id: 'gtceu:molybdenum_dust', n: 1 }, { id: 'gtceu:silicon_dioxide_dust', n: 3 }] },
      { name: 'reforming_catalyst', recipe: 'grindless:mixer/reforming_catalyst', out: { id: REFORMING_CATALYST, n: 4 },
        items: [{ id: 'gtceu:platinum_dust', n: 1 }, { id: 'gtceu:silicon_dioxide_dust', n: 3 }] }
    ]
  }

  function clearHandler(h) {
    for (var i = 0; i < h.getSlots(); i++) h.setStackInSlot(i, Item.empty)
  }

  function readHandler(h) {
    var counts = {}
    for (var i = 0; i < h.getSlots(); i++) {
      var st = h.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = String(st.getId())
      counts[id] = (counts[id] || 0) + st.getCount()
    }
    return counts
  }

  function startMixer() {
    S.mixer = { phase: 'running', sc: -1, scStart: 0 }
    var at = MIXER.x + ' ' + MIXER.y + ' ' + MIXER.z + ' ' + MIXER.id
    var res = S.server.runCommandSilent('setblock ' + at + '[facing=north] replace')
    if (res < 1) res = S.server.runCommandSilent('setblock ' + at + ' replace')
    var mm = machineAt(MIXER)
    if (res < 1 || mm === null || mm === undefined) {
      check('mixer', 'PLACED', false, MIXER.id + ' could not be placed at ' + MIXER.x + ',' + MIXER.y + ',' + MIXER.z + ' (found ' + blockIdAt(MIXER.x, MIXER.y, MIXER.z) + ')')
      S.mixer.phase = 'done'
      return
    }
    check('mixer', 'PLACED', true, MIXER.id + ' at ' + MIXER.x + ',' + MIXER.y + ',' + MIXER.z + ' tier=' + (mm.getTier ? mm.getTier() : '?'))
    nextMixerCase(mm)
  }

  function nextMixerCase(mm) {
    S.mixer.sc++
    if (S.mixer.sc >= MIXER.cases.length) {
      S.mixer.phase = 'done'
      return
    }
    var c = MIXER.cases[S.mixer.sc]
    clearHandler(mm.importItems)
    clearHandler(mm.exportItems)
    clearHandler(mm.getCircuitInventory())
    c.items.forEach(function (it, slot) {
      var left = mm.importItems.insertItem(slot, Item.of(it.id, it.n), false)
      if (!left.isEmpty()) throw new Error('could not insert ' + it.id + ' x' + it.n + ' into slot ' + slot)
    })
    var found = mm.getRecipeType().db().find(mm)
    var got = found ? String(found.id) : 'none'
    check('mixer', 'LOOKUP_' + c.name, got === c.recipe, 'GTM finds ' + got + ' for ' + c.items.map(function (it) { return it.id + ' x' + it.n }).join(' + ') + ' (wanted ' + c.recipe + ')')
    S.mixer.scStart = S.t
  }

  function stepMixer() {
    var mm = machineAt(MIXER)
    if (mm === null || mm === undefined) {
      check('mixer', 'STEP', false, 'the mixer disappeared')
      S.mixer.phase = 'done'
      return
    }
    var c = MIXER.cases[S.mixer.sc]
    if (S.t - S.mixer.scStart < MIXER.ticks) return
    var outs = readHandler(mm.exportItems)
    var left = readHandler(mm.importItems)
    var ok = outs[c.out.id] === c.out.n && Object.keys(outs).length === 1 && Object.keys(left).length === 0
    check('mixer', 'PROCESS_' + c.name, ok, c.items.map(function (it) { return it.id + ' x' + it.n }).join(' + ') + ' -> out=[' + itemSummary(outs) + '] inputs left=[' + itemSummary(left) +
      '] (wanted ' + c.out.id + ' x' + c.out.n + ') ' + recipeState(mm))
    nextMixerCase(mm)
  }

  // ---------------------------------------------------------------- machines

  var SPECS = [
    { key: 'refinery', id: REFINERY_ID, x: 1292, y: 99, z: 2, counts: {}, scenarios: refineryScenarios, lookup: refineryLookupCases,
      layers: 12, firstLayer: 2,
      previewParts: ['energy_input', 'input_bus', 'output_bus', 'input_hatch', 'output_hatch'],
      need: { energy: 1, inBus: true, outBuses: 1, inHatches: 2, outHatches: 12 } },
    { key: 'reformer', id: REFORMER_ID, x: 1316, y: 99, z: 2, counts: {}, scenarios: reformerScenarios, lookup: reformerLookupCases,
      layers: 3, firstLayer: 1,
      previewParts: ['energy_input', 'input_bus', 'input_hatch', 'output_hatch'],
      need: { energy: 1, inBus: true, outBuses: 0, inHatches: 1, outHatches: 3 } },
    { key: 'refinery_2hatch', id: REFINERY_ID, x: 1332, y: 99, z: 2, counts: { energy_input: 2 }, scenarios: twoHatchScenarios, lookup: null,
      layers: 12, firstLayer: 2,
      previewParts: ['energy_input', 'input_bus', 'output_bus', 'input_hatch', 'output_hatch'],
      need: { energy: 2, inBus: true, outBuses: 1, inHatches: 2, outHatches: 12 } }
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
      parts: null, scenarios: null, sc: -1, scStart: 0, seen: {}, duration: 0, stateNoted: false }
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
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      if (last) {
        var id = String(last.id)
        var p = Number(last.parallels)
        if (m.seen[id] === undefined || p > m.seen[id]) m.seen[id] = p
      }
      // the length of the run as GTM computed it (after the overclock), the first time it is seen working
      if (m.duration === 0 && String(rlg.getStatus()) === 'WORKING' && Number(rlg.getDuration()) > 0) m.duration = Number(rlg.getDuration())
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
    m.duration = 0
    m.stateNoted = false
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
          'parts=' + partIds(ctrl).length + ' [' + partIds(ctrl).join(' ') + '] flipped=' + ctrl.isFlipped() + ' tier=' + (ctrl.getTier ? ctrl.getTier() : '?'))
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
        // the tower class reads its output hatches bottom to top: layer N holds output N, the first layer sits firstLayer blocks above the controller
        var ys = m.parts.outHatches.map(function (h) { return h.self().getPos().getY() - m.plan.ctrl.y })
        var layersOk = ys.length === m.spec.layers && ys.every(function (y, i) { return y === m.spec.firstLayer + i })
        var fluidOutputs = null
        try { fluidOutputs = asArray(ctrl.getFluidOutputs()).length } catch (e4) { fluidOutputs = 'unreadable(' + e4 + ')' }
        var machineClass = 'unknown'
        try { machineClass = String(ctrl.getClass().getSimpleName()) } catch (e5) { machineClass = 'unreadable' }
        check(m.key, 'LAYERS', layersOk && fluidOutputs === m.spec.layers && machineClass === 'DistillationTowerMachine',
          'output hatch heights above the controller=[' + ys.join(',') + '] (first layer expected ' + m.spec.firstLayer + ' up) tower fluid outputs=' + fluidOutputs + ' class=' + machineClass)
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
    return S.mixer === null || S.mixer.phase === 'done'
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
      if (S.mixer !== null && S.mixer.phase !== 'done') {
        try {
          stepMixer()
        } catch (e2) {
          check('mixer', 'STEP', false, 'exception: ' + e2)
          S.mixer.phase = 'done'
        }
      }
      if (allDone()) finish()
    } catch (e3) {
      check(SCOPE, 'STEP', false, 'exception: ' + e3)
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
    if (S.mixer !== null && S.mixer.phase === 'running') {
      try {
        var mm = machineAt(MIXER)
        mm.energyContainer.setEnergyStored(mm.energyContainer.getEnergyCapacity())
      } catch (e2) { /* the next step reports problems */ }
    }
    if (now < S.nextAt) return
    S.nextAt = now + STEP
    step(now - S.tick0)
  }

  function startIfRequested(server) {
    if (global[REQUEST] !== true || (S !== null && !S.finished)) return
    if (Date.now() - LOADED_AT < QUIET_MS) return
    global[REQUEST] = false
    try {
      run(server)
    } catch (e) {
      check(SCOPE, 'run', false, 'exception: ' + e)
      finish()
    }
  }

  function run(server) {
    var now = server.getTickCount()
    S = { server: server, level: server.overworld(), t: 0, tick0: now, nextAt: now + STEP, machines: [], mixer: null, finished: false }
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
    try {
      startMixer()
    } catch (e) {
      check('mixer', 'PLACED', false, 'exception: ' + e)
      if (S.mixer !== null) S.mixer.phase = 'done'
    }
    if (allDone()) finish()
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick()
  })

  ServerEvents.customCommand('gg_test_hv_refinery', function (event) {
    if (S !== null && !S.finished) {
      note(SCOPE, 'run', 'a previous gg_test_hv_refinery run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
