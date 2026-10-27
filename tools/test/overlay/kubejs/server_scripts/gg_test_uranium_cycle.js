// priority: -8524
// Gregtech Grindless - smoke test of package IV-A4, uranium-cycle (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack): the In-Situ Leach Field (gtceu:isr_wellfield, type gtceu:in_situ_leaching) and the Fuel Fabrication Plant
// (gtceu:fuel_fabrication_plant, type gtceu:fuel_fabrication): startup_scripts/grindless/iv/uranium_cycle.js, server_scripts/grindless/
// iv/uranium_cycle.js and data/grindless/tables/uranium_cycle.json.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_uranium_cycle;;kubejs custom_command gg_test_recipe_lookup;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|uranium_cycle\|DONE@@900;;GGTEST\|lookup\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|uranium_cycle|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|uranium_cycle|DONE.
//   static (no world)
//     shared_ids          IV-A1's sample, resin, pellet, tube and assembly, zircaloy, GT--'s waste and the GTM dusts and fluids exist
//     registration        both machines on their own type, not generators, with a structure description
//     table               uranium_cycle.json loaded: 4 recipes (1 leach vein + 3 steps), none skipped, no lookup subset, IV maxEUt
//     leach_recipe        the live grindless:in_situ_leaching/pitchblende_end: sample not consumed (chance 0), resin chanced 1 %, 100 mB
//                         acid + 50 mB oxygen -> 2 uraninite + waste chanced 1 %, exactly one dimension condition (the End, not reversed)
//     step_<name>         each live fuel_fabrication recipe: its own circuit, items and fluids as the design says (the hydrogen of the
//                         sinter kept: chance 0), the outputs, EU/t and ticks as the table's stages spent at IV
//     energy_sources      every stage of the table read back from the game: a live recipe (EU/t x ticks), GTM's blast-furnace stage of a
//                         material (mass x K / 50 ticks at VA[MV]), GTM's small-pipe extrusion (mass ticks at 6 x VA[ULV or LV])
//     controller_recipes  both shaped recipes exist and hold their parts
//     balance             NOTE: the EU of one LEU assembly from the live recipes, next to IV-A2's assumption
//   in the world (band X 10496-10559, Z 0-15: the Overworld at Y 98-112 with a roof at Y 111, the End at Y 198-214)
//     <copy>_PLACED / _FORMED / _PARTS   for the three copies below
//     end_surface         NOTE: the highest ground under the End band (the field is built above it)
//     PROCESS_end         copy end (the End): 5 batches, 10 uraninite, 500 mB acid and 250 mB oxygen used, the sample still there, the
//                         resin at most 1 used, exactly 5 x the recipe's EU; no "only in the End" line
//     no_voiding          copy end: set to void items, nothing runs and the refusal is shown
//     resumes             copy end: voiding off, one more batch
//     refuses_on_earth    copy earth (the Overworld): loaded the same, nothing runs, nothing is used, and the controller says why
//     needs_hydrogen      copy plant: circuit 1 with the dusts and the oxygen but no hydrogen: nothing runs
//     PROCESS_pellets     copy plant: hydrogen added: 10 LEU pellets, the dusts and the oxygen used, exactly the recipe's EU
//     hydrogen_kept       copy plant: the 500 mB of hydrogen is still in its hatch
//     PROCESS_tubes       copy plant: circuit 2, 2 zircaloy ingots -> 4 cladding tubes
//     PROCESS_assembly    copy plant: circuit 3, the pellets and tubes it made + 100 mB helium -> 1 LEU fuel assembly
//
// Copies (controllers face north at z 2, the structures behind them):
//   end    the leach field in the End, x 10497-10503, z 2-11, rows from Y 200 (controller Y 204)
//   earth  the leach field in the Overworld, the same x and z, rows from Y 99 (controller Y 103)
//   plant  the fuel plant in the Overworld, x 10529-10531, z 2-14, rows from Y 99 (controller Y 100)
// TEST AREA: this test force-loads, clears and builds ONLY its band in each dimension, and clears and releases it at the end (AGENTS.md:
// tests run at the same time in one server). The structures come from the description lib/patterns.js records.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'uranium_cycle'
  var BAND = { x0: 10496, x1: 10559, z0: 0, z1: 15 }
  var EARTH = 'minecraft:overworld'
  var END = 'minecraft:the_end'
  var BAND_Y = {}
  BAND_Y[EARTH] = [98, 112]
  BAND_Y[END] = [198, 214]
  var ROOF_Y = 111
  var STEP = 10
  var FORM_TIMEOUT = 600
  var HOLD_TICKS = 60
  var EARTH_HOLD = 120
  var RUN_TIMEOUT = 600
  var TEST_TIMEOUT = 8000

  // the command only leaves a request in `global` (it survives script reloads); the tick handler starts the test once these scripts have
  // been loaded for QUIET_MS (same as the other tests)
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestUraniumCycleRequest'

  var FIELD = 'gtceu:isr_wellfield'
  var FIELD_TYPE = 'gtceu:in_situ_leaching'
  var PLANT = 'gtceu:fuel_fabrication_plant'
  var PLANT_TYPE = 'gtceu:fuel_fabrication'
  var LEACH_ID = 'grindless:in_situ_leaching/pitchblende_end'

  var SAMPLE = 'grindless:vein_sample_pitchblende_end'
  var RESIN = 'grindless:ion_exchange_resin'
  var URANINITE = 'gtceu:uraninite_dust'
  var WASTE = 'gtnn:radioactive_waste'
  var U235 = 'gtceu:uranium_235_dust'
  var U238 = 'gtceu:uranium_dust'
  var ZIRCALOY = 'gtceu:zircaloy_ingot'
  var PELLET = 'grindless:leu_pellet'
  var TUBE = 'grindless:zircaloy_cladding_tube'
  var ASSEMBLY = 'grindless:leu_fuel_assembly'
  var ACID = 'gtceu:sulfuric_acid'
  var OXYGEN = 'gtceu:oxygen'
  var HYDROGEN = 'gtceu:hydrogen'
  var HELIUM = 'gtceu:helium'
  var SHARED_ITEMS = [SAMPLE, RESIN, URANINITE, WASTE, U235, U238, ZIRCALOY, PELLET, TUBE, ASSEMBLY]
  var SHARED_FLUIDS = [ACID, OXYGEN, HYDROGEN, HELIUM]
  var NO_VOIDING = /grindless\.machine\.isr_wellfield\.no_voiding|Turn item voiding off/
  var NOT_END = /grindless\.machine\.isr_wellfield\.not_end|only works in the End/

  // the design (docs/eras/iv.md, the package statement): what the live recipes must hold. Energy is checked against the table's stages.
  var MAX_EUT = 7680
  var WANT_LEACH = { acid: 100, oxygen: 50, uraninite: 2, resinChance: 100, wasteChance: 100 }
  var WANT_STEPS = {
    leu_pellets: { circuit: 1, items: [[U235, 1], [U238, 9]], fluids: [[OXYGEN, 20000]], kept: [[HYDROGEN, 500]], out: [PELLET, 10] },
    zircaloy_cladding_tube: { circuit: 2, items: [[ZIRCALOY, 1]], fluids: [], kept: [], out: [TUBE, 2] },
    leu_fuel_assembly: { circuit: 3, items: [[PELLET, 10], [TUBE, 4]], fluids: [[HELIUM, 100]], kept: [], out: [ASSEMBLY, 1] }
  }
  var LEACH_RUNS = 5
  // IV-A2's assumption for one LEU assembly (docs/eras/iv.md, "Balance (as built, IV-A2)") and iv.md's enrichment figure (hot cell)
  var A2_ASSUMED = '2-4 M EU, 30 uraninite, 2 Zircaloy ingots and 100 mB helium'
  var ENRICHMENT_EU = 1020000

  var ROLE_BLOCKS = {
    inBus: 'gtceu:iv_input_bus',
    outBus: 'gtceu:iv_output_bus',
    acid: 'gtceu:iv_input_hatch',
    oxygen: 'gtceu:iv_input_hatch',
    hydrogen: 'gtceu:iv_input_hatch',
    helium: 'gtceu:iv_input_hatch',
    energy: 'gtceu:iv_energy_input_hatch'
  }
  // parts: 'slice,row,column' of each description -> role
  var FIELD_PARTS_AT = { '9,4,1': 'inBus', '9,4,2': 'outBus', '9,4,4': 'acid', '9,4,5': 'oxygen', '9,5,3': 'energy' }
  var PLANT_PARTS_AT = { '12,0,0': 'inBus', '12,0,1': 'outBus', '12,0,2': 'energy', '11,0,0': 'oxygen', '11,0,1': 'hydrogen', '11,0,2': 'helium' }
  var COPIES = [
    { key: 'end', machine: FIELD, dim: END, x: 10500, z: 2, y0: 200, partsAt: FIELD_PARTS_AT },
    { key: 'earth', machine: FIELD, dim: EARTH, x: 10500, z: 2, y0: 99, partsAt: FIELD_PARTS_AT },
    { key: 'plant', machine: PLANT, dim: EARTH, x: 10530, z: 2, y0: 99, partsAt: PLANT_PARTS_AT }
  ]

  var S = null
  var classes = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000)
  }

  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, status, detail) {
    var line = TAG + SCOPE + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }

  function check(name, ok, detail) {
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }

  function note(name, detail) {
    emit(name, 'NOTE', detail)
  }

  function safely(name, fn) {
    try {
      fn()
    } catch (e) {
      check(name, false, 'exception: ' + e)
    }
  }

  // ---------------------------------------------------------------- helpers

  function lazy() {
    if (classes === null) {
      classes = {
        ArrayList: Java.loadClass('java.util.ArrayList'),
        MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
        ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
        VoidingMode: Java.loadClass('com.gregtechceu.gtceu.api.machine.feature.IVoidable$VoidingMode'),
        GTValues: Java.loadClass('com.gregtechceu.gtceu.api.GTValues'),
        PropertyKey: Java.loadClass('com.gregtechceu.gtceu.api.data.chemical.material.properties.PropertyKey')
      }
    }
    return classes
  }

  function UC() {
    return global.grindless.uraniumCycle || {}
  }

  function asArray(coll) {
    var list = new (lazy().ArrayList)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function rl(id) {
    return new ResourceLocation(id)
  }

  function fluidName(stack) {
    try {
      return String(lazy().Registries.FLUIDS.getKey(stack.getFluid()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
  }

  function itemName(stack) {
    try {
      return String(lazy().Registries.ITEMS.getKey(stack.getItem()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
  }

  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }

  function eutOf(recipe) {
    return Math.abs(Number(lazy().RecipeHelper.getRealEUt(recipe).getTotalEU()))
  }

  // the item contents of one side of a recipe, with their chance: [{ id, count, chance, maxChance, circuit }]
  function itemContents(recipe, input) {
    var c = lazy()
    var contents = asArray(input ? recipe.getInputContents(c.ItemCap) : recipe.getOutputContents(c.ItemCap))
    var stacks = asArray(input ? c.RecipeHelper.getInputItems(recipe) : c.RecipeHelper.getOutputItems(recipe))
    return stacks.map(function (st, i) {
      var circuit = c.Circuit.isIntegratedCircuit(st) ? Number(c.Circuit.getCircuitConfiguration(st)) : 0
      return { id: itemName(st), count: Number(st.getCount()), chance: Number(contents[i].chance), maxChance: Number(contents[i].maxChance), circuit: circuit }
    })
  }

  // the fluid contents of one side, with their chance (RecipeHelper keeps the order of the contents)
  function fluidContents(recipe, input) {
    var c = lazy()
    var contents = asArray(input ? recipe.getInputContents(c.FluidCap) : recipe.getOutputContents(c.FluidCap))
    var stacks = asArray(input ? c.RecipeHelper.getInputFluids(recipe) : c.RecipeHelper.getOutputFluids(recipe))
    return stacks.map(function (st, i) {
      return { id: fluidName(st), amount: Number(st.getAmount()), chance: Number(contents[i].chance) }
    })
  }

  function dimensionsOf(recipe) {
    var out = { dims: [], others: [] }
    asArray(recipe.conditions).forEach(function (c) {
      if (c.getDimension) {
        var d = c.getDimension()
        var id
        try {
          id = String(d.location())
        } catch (e) {
          id = String(d)
        }
        out.dims.push({ id: id, reverse: !!c.isReverse() })
      } else {
        out.others.push(String(c))
      }
    })
    return out
  }

  function short(id) {
    return String(id).replace(/^(gtceu|grindless|minecraft|gtnn):/, '')
  }

  function summary(counts) {
    var keys = Object.keys(counts)
    return keys.length === 0 ? 'empty' : keys.map(function (k) { return short(k) + ' x' + counts[k] }).join(', ')
  }

  // ---------------------------------------------------------------- static checks

  function sharedIdsPresent() {
    var missing = SHARED_ITEMS.filter(function (id) { return !Item.exists(id) })
      .concat(SHARED_FLUIDS.filter(function (id) { return !Fluid.exists(id) }))
    check('shared_ids', missing.length === 0, missing.length === 0 ? SHARED_ITEMS.length + ' items and ' + SHARED_FLUIDS.length +
      ' fluids exist (IV-A1\'s sample, resin, pellet, tube, assembly and zircaloy; GT--\'s waste; GTM\'s dusts)' : 'missing: ' + missing.join(', '))
    return missing.length === 0
  }

  function registration() {
    var problems = []
    var parts = []
    ;[[FIELD, FIELD_TYPE], [PLANT, PLANT_TYPE]].forEach(function (pair) {
      var def = GTRegistries.MACHINES.get(rl(pair[0]))
      if (def === null || def === undefined) {
        problems.push(pair[0] + ' is not registered')
        return
      }
      var types = []
      var arr = def.getRecipeTypes()
      for (var i = 0; i < arr.length; i++) types.push(String(arr[i].registryName))
      if (types.join(',') !== pair[1]) problems.push(pair[0] + ' types ' + types.join(','))
      if (def.isGenerator() !== false) problems.push(pair[0] + ' is a generator')
      var desc = global.grindless.patterns.describe(pair[0])
      if (!desc) problems.push(pair[0] + ' has no structure description')
      else parts.push(short(pair[0]) + ' ' + desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length + ' (w x h x d)')
    })
    check('registration', problems.length === 0, parts.join('; ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  function tableCheck() {
    var u = UC()
    var problems = []
    var recipes = u.recipes || []
    if (recipes.length !== 4) problems.push(recipes.length + ' recipes')
    if ((u.skipped || []).length > 0) problems.push('skipped ' + JSON.stringify(u.skipped))
    if ((u.clashes || []).length > 0) problems.push('lookup subsets ' + u.clashes.join('; '))
    if (u.maxEut !== MAX_EUT) problems.push('maxEut ' + u.maxEut)
    recipes.forEach(function (r) {
      var cost = u.spend(r.stages, u.maxEut)
      if (cost.duration !== Math.ceil(cost.stagesEnergy / MAX_EUT) || cost.eut * cost.duration < cost.stagesEnergy ||
        cost.eut * cost.duration - cost.stagesEnergy >= cost.duration) problems.push(r.name + ' spend ' + JSON.stringify(cost))
      if (r.eut !== cost.eut || r.duration !== cost.duration) problems.push(r.name + ' ' + r.eut + ' EU/t x ' + r.duration + ' t')
    })
    check('table', problems.length === 0, recipes.map(function (r) { return r.recipeId + ' ' + r.duration + ' t x ' + r.eut + ' EU/t = ' + r.energy +
      ' EU (stages ' + r.stagesEnergy + ')' }).join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  function planOfName(name) {
    return (UC().recipes || []).filter(function (r) { return r.name === name })[0] || null
  }

  function leachRecipe() {
    var r = liveRecipe(LEACH_ID)
    if (r === null) throw new Error(LEACH_ID + ' missing')
    var plan = planOfName('pitchblende_end')
    var problems = []
    var ins = itemContents(r, true)
    var outs = itemContents(r, false)
    var fin = fluidContents(r, true)
    var sample = ins.filter(function (x) { return x.id === SAMPLE })
    var resin = ins.filter(function (x) { return x.id === RESIN })
    if (ins.length !== 2) problems.push(ins.length + ' item inputs')
    if (sample.length !== 1 || sample[0].chance !== 0 || sample[0].count !== 1) problems.push('sample ' + JSON.stringify(sample))
    if (resin.length !== 1 || resin[0].chance !== WANT_LEACH.resinChance || resin[0].maxChance !== 10000) problems.push('resin ' + JSON.stringify(resin))
    var wantFluids = [{ id: ACID, amount: WANT_LEACH.acid, chance: 10000 }, { id: OXYGEN, amount: WANT_LEACH.oxygen, chance: 10000 }]
    if (JSON.stringify(fin) !== JSON.stringify(wantFluids)) problems.push('fluids ' + JSON.stringify(fin))
    if (fluidContents(r, false).length !== 0) problems.push('fluid outputs')
    var ore = outs.filter(function (x) { return x.id === URANINITE })
    var waste = outs.filter(function (x) { return x.id === WASTE })
    if (outs.length !== 2) problems.push(outs.length + ' item outputs')
    if (ore.length !== 1 || ore[0].count !== WANT_LEACH.uraninite || ore[0].chance !== 10000) problems.push('uraninite ' + JSON.stringify(ore))
    if (waste.length !== 1 || waste[0].count !== 1 || waste[0].chance !== WANT_LEACH.wasteChance) problems.push('waste ' + JSON.stringify(waste))
    var d = dimensionsOf(r)
    if (d.dims.length !== 1 || d.dims[0].id !== END || d.dims[0].reverse !== false) problems.push('dimension conditions ' + JSON.stringify(d.dims))
    var eut = eutOf(r)
    if (plan === null) problems.push('no published plan')
    else if (eut !== plan.eut || Number(r.duration) !== plan.duration) problems.push(eut + ' EU/t x ' + r.duration + ' t (table ' + plan.eut + ' x ' + plan.duration + ')')
    check('leach_recipe', problems.length === 0, LEACH_ID + ': in [' + ins.map(function (x) { return short(x.id) + ' x' + x.count + ' @' + x.chance }).join(', ') +
      '] + [' + fin.map(function (x) { return x.amount + ' mB ' + short(x.id) }).join(', ') + '] -> [' + outs.map(function (x) { return short(x.id) + ' x' +
      x.count + ' @' + x.chance }).join(', ') + '], ' + eut + ' EU/t x ' + r.duration + ' t, dimension ' + JSON.stringify(d.dims) +
      (d.others.length > 0 ? ' other conditions ' + d.others.join(',') : '') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  function stepRecipe(name) {
    var want = WANT_STEPS[name]
    var plan = planOfName(name)
    var r = plan === null ? null : liveRecipe(plan.recipeId)
    if (r === null) throw new Error('grindless:fuel_fabrication/' + name + ' missing')
    var problems = []
    var ins = itemContents(r, true)
    var circuit = ins.filter(function (x) { return x.circuit > 0 })
    var items = ins.filter(function (x) { return x.circuit === 0 })
    if (circuit.length !== 1 || circuit[0].circuit !== want.circuit || circuit[0].chance !== 0) problems.push('circuit ' + JSON.stringify(circuit))
    var gotItems = items.map(function (x) { return [x.id, x.count, x.chance] })
    var wantItems = want.items.map(function (x) { return [x[0], x[1], 10000] })
    if (JSON.stringify(gotItems) !== JSON.stringify(wantItems)) problems.push('items ' + JSON.stringify(gotItems))
    var fin = fluidContents(r, true)
    var used = fin.filter(function (x) { return x.chance > 0 }).map(function (x) { return [x.id, x.amount, x.chance] })
    var kept = fin.filter(function (x) { return x.chance === 0 }).map(function (x) { return [x.id, x.amount] })
    if (JSON.stringify(used) !== JSON.stringify(want.fluids.map(function (x) { return [x[0], x[1], 10000] }))) problems.push('fluids ' + JSON.stringify(used))
    if (JSON.stringify(kept) !== JSON.stringify(want.kept)) problems.push('kept ' + JSON.stringify(kept))
    var outs = itemContents(r, false)
    if (outs.length !== 1 || outs[0].id !== want.out[0] || outs[0].count !== want.out[1] || outs[0].chance !== 10000) problems.push('out ' + JSON.stringify(outs))
    if (fluidContents(r, false).length !== 0) problems.push('fluid outputs')
    var eut = eutOf(r)
    if (eut !== plan.eut || Number(r.duration) !== plan.duration) problems.push(eut + ' EU/t x ' + r.duration + ' t (table ' + plan.eut + ' x ' + plan.duration + ')')
    if (dimensionsOf(r).dims.length !== 0) problems.push('dimension conditions')
    check('step_' + name, problems.length === 0, plan.recipeId + ': circuit ' + (circuit[0] ? circuit[0].circuit : '?') + ', [' + gotItems.map(function (x) {
      return short(x[0]) + ' x' + x[1] }).join(', ') + '] + [' + used.map(function (x) { return x[1] + ' mB ' + short(x[0]) }).join(', ') + ']' +
      (kept.length > 0 ? ' kept [' + kept.map(function (x) { return x[1] + ' mB ' + short(x[0]) }).join(', ') + ']' : '') + ' -> ' + outs.map(function (x) {
      return short(x.id) + ' x' + x.count }).join(', ') + ', ' + eut + ' EU/t x ' + r.duration + ' t' + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  // a stage's EU read from the game: { eu, how } or { error }
  function stageFromGame(from) {
    var c = lazy()
    if (from && from.recipe) {
      var r = liveRecipe(from.recipe)
      if (r === null) return { error: from.recipe + ' is not a live recipe' }
      var eut = eutOf(r)
      return { eu: eut * Number(r.duration), how: short(from.recipe) + ' ' + eut + ' EU/t x ' + r.duration + ' t' }
    }
    if (from && from.blast) {
      var m = GTMaterials.get(from.blast.material)
      if (m == null || m.isNull()) return { error: 'no GT material ' + from.blast.material }
      var mass = Number(m.getMass())
      var ticks = Math.max(1, Math.floor(mass * Number(from.blast.temperature) / 50))
      var bEut = Number(c.GTValues.VA[2])
      return { eu: ticks * bEut, how: from.blast.material + ' mass ' + mass + ' x ' + from.blast.temperature + ' K / 50 = ' + ticks + ' t x ' + bEut + ' EU/t' }
    }
    if (from && from.smallPipe) {
      var p = GTMaterials.get(from.smallPipe.material)
      if (p == null || p.isNull()) return { error: 'no GT material ' + from.smallPipe.material }
      var pMass = Number(p.getMass())
      var mult = p.hasProperty(c.PropertyKey.POLYMER) ? 4 : (Number(p.getBlastTemperature()) >= 2800 ? Number(c.GTValues.VA[1]) : Number(c.GTValues.VA[0]))
      return { eu: pMass * 6 * mult, how: from.smallPipe.material + ' mass ' + pMass + ' t x ' + (6 * mult) + ' EU/t' }
    }
    return { error: 'unknown source ' + JSON.stringify(from) }
  }

  function energySources() {
    var problems = []
    var lines = []
    ;(UC().recipes || []).forEach(function (r) {
      r.stages.forEach(function (s) {
        var got = stageFromGame(s.from)
        if (got.error) {
          problems.push(r.name + ': ' + got.error)
          return
        }
        if (got.eu !== s.eu) problems.push(r.name + ': table ' + s.eu + ' EU, game ' + got.eu + ' (' + got.how + ')')
        lines.push(r.name + ': ' + s.eu + (s.times > 1 ? ' x' + s.times : '') + ' = ' + got.how)
      })
    })
    check('energy_sources', problems.length === 0 && lines.length > 0, lines.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  function controllerRecipes() {
    var u = UC()
    var problems = []
    ;['field', 'plant'].forEach(function (k) {
      var id = u.craftingRecipes ? u.craftingRecipes[k] : null
      var r = id ? liveRecipe(id) : null
      if (r === null) {
        problems.push(k + ' recipe ' + id + ' missing')
        return
      }
      var out = String(r.getResultItem(S.server.registryAccess()).getId())
      var ids = {}
      asArray(r.getIngredients()).forEach(function (ing) {
        asArray(ing.getItemIds()).forEach(function (iid) { ids[String(iid)] = true })
      })
      var parts = u.craftingParts[k]
      var missing = parts.filter(function (pid) { return pid !== parts[0] && !ids[pid] })
      if (out !== parts[0] || missing.length > 0) problems.push(id + ' -> ' + out + ' missing ' + missing.join(','))
    })
    check('controller_recipes', problems.length === 0, (u.craftingRecipes ? u.craftingRecipes.field + ', ' + u.craftingRecipes.plant : '?') +
      (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  // the EU of one LEU assembly: 15 leach batches (30 uraninite), the hot cell's enrichment, 10 pellets, 4 tubes and the assembly
  function balance() {
    var leach = planOfName('pitchblende_end')
    var pellets = planOfName('leu_pellets')
    var tube = planOfName('zircaloy_cladding_tube')
    var assembly = planOfName('leu_fuel_assembly')
    if (!leach || !pellets || !tube || !assembly) {
      note('balance', 'not computed: a plan is missing')
      return
    }
    var hc = global.grindless.hotCell
    var enrich = hc && hc.recipes ? hc.recipes.filter(function (r) { return r.name === 'enrichment' })[0] : null
    var enrichEu = enrich ? Number(enrich.energy) : ENRICHMENT_EU
    var batches = 30 / WANT_LEACH.uraninite
    var leachEu = batches * leach.energy
    var fab = pellets.energy + 2 * tube.energy + assembly.energy
    var total = leachEu + enrichEu + fab
    note('balance', 'one LEU assembly: leaching ' + batches + ' x ' + leach.energy + ' = ' + leachEu + ' EU (' + (batches * WANT_LEACH.acid) + ' mB acid, ' +
      (batches * WANT_LEACH.oxygen) + ' mB oxygen, ' + (batches / 100).toFixed(2) + ' resin, ' + (batches / 100).toFixed(2) + ' waste) + enrichment ' +
      enrichEu + ' EU (' + (enrich ? 'the hot cell\'s live recipe' : 'iv.md\'s figure; the hot cell is not on this branch') + ') + pellets ' + pellets.energy +
      ' + 2 tubes ' + (2 * tube.energy) + ' + assembly ' + assembly.energy + ' = ' + total + ' EU (' + (total / 1e6).toFixed(2) + ' M), plus 20,000 mB oxygen,' +
      ' 2 Zircaloy ingots and 100 mB helium; IV-A2 assumed ' + A2_ASSUMED + '. The reactor gets 1.31 G (light water) or 2.62 G EU (heavy water) from it: ' +
      Math.round(1310720000 / total) + 'x and ' + Math.round(2621440000 / total) + 'x')
  }

  function staticChecks() {
    safely('registration', registration)
    safely('table', tableCheck)
    safely('leach_recipe', leachRecipe)
    Object.keys(WANT_STEPS).forEach(function (name) {
      safely('step_' + name, function () { stepRecipe(name) })
    })
    safely('energy_sources', energySources)
    safely('controller_recipes', controllerRecipes)
    safely('balance', balance)
  }

  // ---------------------------------------------------------------- the world

  function levelOf(dim) {
    return dim === END ? S.end : S.earth
  }

  // a command run in a dimension's level (setblock, fill and forceload act on the dimension they run in)
  function cmd(dim, text) {
    return S.server.runCommandSilent('execute in ' + dim + ' run ' + text)
  }

  function blockIdAt(dim, x, y, z) {
    return String(levelOf(dim).getBlock(x, y, z).getId())
  }

  function machineAt(m) {
    return lazy().MetaMachine.getMachine(levelOf(m.copy.dim), new BlockPos(m.ctrlPos.x, m.ctrlPos.y, m.ctrlPos.z))
  }

  // the highest block under the End band (the field is built above it): a grid of columns, from Y 197 down
  function endSurface() {
    var top = -1
    var withGround = 0
    var columns = 0
    for (var x = BAND.x0; x <= BAND.x1; x += 9) {
      for (var z = BAND.z0; z <= BAND.z1; z += 5) {
        columns++
        for (var y = BAND_Y[END][0] - 1; y >= 0; y--) {
          var id = blockIdAt(END, x, y, z)
          if (id !== 'minecraft:air' && id !== 'minecraft:void_air' && id !== 'minecraft:cave_air') {
            withGround++
            if (y > top) top = y
            break
          }
        }
      }
    }
    note('end_surface', withGround + ' of ' + columns + ' columns under the End band have ground' + (top >= 0 ? ', the highest at Y ' + top : ' (open void)') +
      '; the field is built from Y ' + COPIES[0].y0 + ', the band is Y ' + BAND_Y[END][0] + '-' + BAND_Y[END][1])
  }

  // the chunks of the band are generated and force-loaded, and the band (and only the band) is cleared; a roof keeps the Overworld's rain
  // off the hatches (GTM's weather check)
  function prepareWorld() {
    S.areaTouched = true
    ;[EARTH, END].forEach(function (dim) {
      var level = levelOf(dim)
      for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
        for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) level.getChunk(cx, cz)
      }
      if (dim === END) endSurface()
      var loaded = cmd(dim, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      var cleared = cmd(dim, 'fill ' + BAND.x0 + ' ' + BAND_Y[dim][0] + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND_Y[dim][1] + ' ' + BAND.z1 + ' air')
      if (dim === EARTH) cmd(dim, 'fill ' + BAND.x0 + ' ' + ROOF_Y + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + ROOF_Y + ' ' + BAND.z1 + ' minecraft:smooth_stone')
      note('AREA_' + (dim === END ? 'end' : 'earth'), dim + ' band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND_Y[dim][0] + '-' + BAND_Y[dim][1] + ' Z ' +
        BAND.z0 + '-' + BAND.z1 + ': generated, forceload add result ' + loaded + ', changed ' + cleared + ' blocks while clearing' +
        (dim === EARTH ? ', roof at Y ' + ROOF_Y : ''))
    })
  }

  function cleanup() {
    if (!S.areaTouched) return
    ;[EARTH, END].forEach(function (dim) {
      var cleared = cmd(dim, 'fill ' + BAND.x0 + ' ' + BAND_Y[dim][0] + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND_Y[dim][1] + ' ' + BAND.z1 + ' air')
      var released = cmd(dim, 'forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      note('CLEANUP_' + (dim === END ? 'end' : 'earth'), 'cleared ' + cleared + ' blocks of the band in ' + dim + ', forceload remove result ' + released)
    })
  }

  function plainBlock(sym) {
    if (sym.kind === 'blocks') return sym.blocks[0]
    if (sym.kind === 'frames') return 'gtceu:' + sym.materials[0] + '_frame'
    if (sym.kind === 'oneOf') {
      for (var i = 0; i < sym.options.length; i++) {
        if (sym.options[i].kind === 'blocks') return sym.options[i].blocks[0]
      }
    }
    throw new Error('no plain block for symbol kind ' + sym.kind)
  }

  // a part's facing: the front face looks north, the side columns outwards (column 0 is the left as seen from the front: east)
  function facingOf(si, ci, last, width) {
    if (si === last) return 'north'
    if (ci === 0) return 'east'
    if (ci === width - 1) return 'west'
    return 'down'
  }

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing north:
  // x = cx - (col - ctrlCol), y = y0 + row, z = cz - (slice - ctrlSlice)  (the structure is behind it)
  function planOf(copy) {
    var desc = global.grindless.patterns.describe(copy.machine)
    if (!desc) throw new Error('no structure description recorded for ' + copy.machine)
    var last = desc.slices.length - 1
    var width = desc.slices[0][0].length
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          if (desc.symbols[row.charAt(ci)] && desc.symbols[row.charAt(ci)].kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    if (ctrl === null) throw new Error('the description has no controller cell')
    var cells = []
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          var c = { x: copy.x - (ci - ctrl.ci), y: copy.y0 + ri, z: copy.z - (si - ctrl.si), ch: ch, id: null, props: '', role: null }
          var role = copy.partsAt[si + ',' + ri + ',' + ci]
          if (sym.kind === 'controller') {
            c.id = copy.machine
            c.props = '[facing=north]'
            c.role = 'controller'
          } else if (sym.kind === 'air' || sym.kind === 'any') {
            continue
          } else if (role !== undefined) {
            c.id = ROLE_BLOCKS[role]
            c.props = '[facing=' + facingOf(si, ci, last, width) + ']'
            c.role = role
          } else {
            c.id = plainBlock(sym)
          }
          cells.push(c)
        }
      })
    })
    return { cells: cells, width: width, height: desc.slices[0].length, depth: desc.slices.length }
  }

  function place(m) {
    var copy = m.copy
    var plan = planOf(copy)
    var failed = []
    var ctrlCell = null
    var tally = {}
    m.roles = {}
    plan.cells.forEach(function (c) {
      tally[c.id] = (tally[c.id] || 0) + 1
      if (c.role === 'controller') {
        ctrlCell = c
        return
      }
      if (c.role !== null) m.roles[c.x + ',' + c.y + ',' + c.z] = c.role
      if (cmd(copy.dim, 'setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.id + c.props + ' replace') < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.id)
    })
    if (cmd(copy.dim, 'setblock ' + ctrlCell.x + ' ' + ctrlCell.y + ' ' + ctrlCell.z + ' ' + ctrlCell.id + ctrlCell.props + ' replace') < 1) failed.push('controller')
    m.ctrlPos = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }
    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(copy.dim, c.x, c.y, c.z)
      if (got !== c.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.id + ' got ' + got)
    })
    var bill = Object.keys(tally).sort().map(function (id) { return short(id) + ' x' + tally[id] }).join(', ')
    check(copy.key + '_PLACED', failed.length === 0 && wrong.length === 0, copy.dim + ': ' + plan.cells.length + ' blocks, ' + plan.width + 'x' + plan.height +
      'x' + plan.depth + ' (w x h x d), controller ' + m.ctrlPos.x + ',' + m.ctrlPos.y + ',' + m.ctrlPos.z + ' bill=[' + bill + ']' +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') + (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

  function findParts(m, ctrl) {
    var P = { ids: [] }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pos = p.self().getPos()
      var role = m.roles[pos.getX() + ',' + pos.getY() + ',' + pos.getZ()]
      P.ids.push(String(p.getDefinition().getId()).replace('gtceu:', '') + (role ? '=' + role : ''))
      if (role) P[role] = p
    })
    return P
  }

  function describeError(m, ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var pos = err.getPos()
      return 'pattern error ' + String(err) + ' at ' + pos.getX() + ',' + pos.getY() + ',' + pos.getZ() + ' found ' + blockIdAt(m.copy.dim, pos.getX(), pos.getY(), pos.getZ())
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  // ---------------------------------------------------------------- machine helpers

  function wake(m) {
    try {
      m.ctrl.getRecipeLogic().updateTickSubscription()
    } catch (e) { /* the scenario reports what did not run */ }
  }

  function statusOf(m) {
    return String(m.ctrl.getRecipeLogic().getStatus())
  }

  function state(m) {
    try {
      var rlg = m.ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() + ' last=' + (last ? last.id : 'none') +
        ' voiding=' + m.ctrl.getVoidingMode()
    } catch (e) {
      return 'state unreadable: ' + e
    }
  }

  function failureReasons(m) {
    try {
      return asArray(m.ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
    } catch (e) {
      return ['unreadable: ' + e]
    }
  }

  function displayLines(m) {
    var list = new (lazy().ArrayList)()
    UC().field.display(m.ctrl, list)
    return asArray(list).map(function (c) {
      try {
        return String(c.getString())
      } catch (e) {
        return String(c)
      }
    })
  }

  function setVoiding(m, mode) {
    m.ctrl.setVoidingMode(lazy().VoidingMode[mode])
    wake(m)
  }

  function tankOf(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    return st.isEmpty() ? 0 : Number(st.getAmount())
  }

  function setTank(hatch, id, amount) {
    // a FluidStack built by KubeJS: setFluidInTank ignores one built outside it
    if (amount <= 0) hatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
    else hatch.tank.setFluidInTank(0, Fluid.of(id, amount).getFluidStack())
  }

  function readBus(bus) {
    var inv = bus.getInventory()
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = itemName(st)
      counts[id] = (counts[id] || 0) + Number(st.getCount())
    }
    return counts
  }

  function emptyBus(bus) {
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, lazy().ItemStack.EMPTY)
  }

  // puts count items into the bus, one at a time slot after slot (some stack to 16 only)
  function fillBus(bus, id, count) {
    var inv = bus.getInventory()
    var placed = 0
    for (var s = 0; s < inv.getSlots() && placed < count; s++) {
      while (placed < count && inv.insertItem(s, Item.of(id, 1), false).isEmpty()) placed++
    }
    if (placed !== count) throw new Error('could only insert ' + placed + ' of ' + count + ' ' + id)
  }

  function setCircuit(m, n) {
    m.P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(n))
  }

  function energyUsed(m) {
    return m.energy - m.energyAt
  }

  function mark(m, phase) {
    m.phase = phase
    m.t0 = S.t
    m.energyAt = m.energy
    m.seen = {}
    wake(m)
  }

  // ---------------------------------------------------------------- the leach field in the End

  function loadLeach(m, batches) {
    emptyBus(m.P.inBus)
    emptyBus(m.P.outBus)
    fillBus(m.P.inBus, SAMPLE, 1)
    fillBus(m.P.inBus, RESIN, 16)
    setTank(m.P.acid, ACID, batches * WANT_LEACH.acid)
    setTank(m.P.oxygen, OXYGEN, batches * WANT_LEACH.oxygen)
  }

  function leachText(m) {
    return 'acid ' + tankOf(m.P.acid) + ' mB, oxygen ' + tankOf(m.P.oxygen) + ' mB, input bus [' + summary(readBus(m.P.inBus)) + '], output bus [' +
      summary(readBus(m.P.outBus)) + '], ' + energyUsed(m) + ' EU, ran [' + Object.keys(m.seen).join(',') + '] | ' + state(m)
  }

  function endStep(m, age) {
    var plan = planOfName('pitchblende_end')
    if (m.phase === 'running') {
      var made = readBus(m.P.outBus)[URANINITE] || 0
      if (!(made >= LEACH_RUNS * WANT_LEACH.uraninite && tankOf(m.P.acid) === 0) && age < RUN_TIMEOUT) return
      var ins = readBus(m.P.inBus)
      var outs = readBus(m.P.outBus)
      var problems = []
      if (made !== LEACH_RUNS * WANT_LEACH.uraninite) problems.push(made + ' uraninite')
      if (tankOf(m.P.acid) !== 0 || tankOf(m.P.oxygen) !== 0) problems.push('fluids left')
      if ((ins[SAMPLE] || 0) !== 1) problems.push('sample ' + (ins[SAMPLE] || 0))
      if (!((ins[RESIN] || 0) >= 15 && (ins[RESIN] || 0) <= 16)) problems.push('resin ' + (ins[RESIN] || 0))
      if (plan && energyUsed(m) !== LEACH_RUNS * plan.energy) problems.push(energyUsed(m) + ' EU (wanted ' + LEACH_RUNS * plan.energy + ')')
      if (m.seen[LEACH_ID] !== true) problems.push(LEACH_ID + ' never seen running')
      var lines = displayLines(m)
      var wrongLine = lines.some(function (l) { return NOT_END.test(l) })
      if (wrongLine) problems.push('shows the not-in-the-End line in the End')
      check('PROCESS_end', problems.length === 0, LEACH_RUNS + ' batches in the End: ' + made + ' uraninite, ' + (outs[WASTE] || 0) + ' waste, resin ' +
        (ins[RESIN] || 0) + ' of 16 left, sample ' + (ins[SAMPLE] || 0) + ', ' + leachText(m) + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      m.madeBefore = made
      setTank(m.P.acid, ACID, WANT_LEACH.acid)
      setTank(m.P.oxygen, OXYGEN, WANT_LEACH.oxygen)
      setVoiding(m, 'VOID_ITEMS')
      mark(m, 'void_items')
      return
    }
    if (m.phase === 'void_items' && age >= HOLD_TICKS) {
      var shown = failureReasons(m).some(function (r) { return NO_VOIDING.test(r) })
      var still = tankOf(m.P.acid) === WANT_LEACH.acid && tankOf(m.P.oxygen) === WANT_LEACH.oxygen && (readBus(m.P.outBus)[URANINITE] || 0) === m.madeBefore &&
        energyUsed(m) === 0
      check('no_voiding', still && shown, 'set to void items: refusal shown=' + shown + ', reasons=[' + failureReasons(m).join(' ; ') + '], ' + leachText(m))
      setVoiding(m, 'VOID_NONE')
      mark(m, 'resume')
      return
    }
    if (m.phase === 'resume') {
      var after = readBus(m.P.outBus)[URANINITE] || 0
      if (!(after >= m.madeBefore + WANT_LEACH.uraninite && tankOf(m.P.acid) === 0) && age < RUN_TIMEOUT) return
      var ok = after === m.madeBefore + WANT_LEACH.uraninite && tankOf(m.P.acid) === 0 && tankOf(m.P.oxygen) === 0 && (!plan || energyUsed(m) === plan.energy)
      check('resumes', ok, 'voiding off: one more batch, uraninite ' + m.madeBefore + ' -> ' + after + ', ' + leachText(m))
      m.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- the leach field on Earth

  function earthStep(m, age) {
    if (m.phase !== 'holding' || age < EARTH_HOLD) return
    var outs = readBus(m.P.outBus)
    var ins = readBus(m.P.inBus)
    var untouched = tankOf(m.P.acid) === LEACH_RUNS * WANT_LEACH.acid && tankOf(m.P.oxygen) === LEACH_RUNS * WANT_LEACH.oxygen &&
      Object.keys(outs).length === 0 && energyUsed(m) === 0 && Object.keys(m.seen).length === 0 && (ins[RESIN] || 0) === 16
    var lines = displayLines(m)
    var shown = lines.some(function (l) { return NOT_END.test(l) })
    check('refuses_on_earth', untouched && shown, 'Overworld, loaded for ' + LEACH_RUNS + ' batches, after ' + age + ' ticks: ' + leachText(m) +
      ', "only in the End" line shown=' + shown + ' | lines=[' + lines.join(' ; ') + '] reasons=[' + failureReasons(m).join(' ; ') + ']')
    m.phase = 'done'
  }

  // ---------------------------------------------------------------- the fuel plant on Earth

  function plantText(m) {
    return 'oxygen ' + tankOf(m.P.oxygen) + ' mB, hydrogen ' + tankOf(m.P.hydrogen) + ' mB, helium ' + tankOf(m.P.helium) + ' mB, input bus [' +
      summary(readBus(m.P.inBus)) + '], output bus [' + summary(readBus(m.P.outBus)) + '], ' + energyUsed(m) + ' EU, ran [' + Object.keys(m.seen).join(',') +
      '] | ' + state(m)
  }

  function stepEnergy(name) {
    var plan = planOfName(name)
    return plan ? plan.energy : -1
  }

  function plantStep(m, age) {
    if (m.phase === 'no_hydrogen' && age >= HOLD_TICKS) {
      var ins = readBus(m.P.inBus)
      var nothing = (ins[U235] || 0) === 1 && (ins[U238] || 0) === 9 && tankOf(m.P.oxygen) === 20000 && Object.keys(readBus(m.P.outBus)).length === 0 &&
        energyUsed(m) === 0
      check('needs_hydrogen', nothing, 'circuit 1, the dusts and 20,000 mB oxygen, no hydrogen, after ' + age + ' ticks: ' + plantText(m))
      setTank(m.P.hydrogen, HYDROGEN, 500)
      mark(m, 'pellets')
      return
    }
    if (m.phase === 'pellets') {
      var pellets = readBus(m.P.outBus)[PELLET] || 0
      if (pellets < 10 && age < RUN_TIMEOUT) return
      var left = readBus(m.P.inBus)
      var p1 = []
      if (pellets !== 10) p1.push(pellets + ' pellets')
      if ((left[U235] || 0) !== 0 || (left[U238] || 0) !== 0) p1.push('dusts left')
      if (tankOf(m.P.oxygen) !== 0) p1.push('oxygen left')
      if (energyUsed(m) !== stepEnergy('leu_pellets')) p1.push(energyUsed(m) + ' EU (wanted ' + stepEnergy('leu_pellets') + ')')
      check('PROCESS_pellets', p1.length === 0, plantText(m) + (p1.length > 0 ? ' | problems: ' + p1.join('; ') : ''))
      check('hydrogen_kept', tankOf(m.P.hydrogen) === 500, 'hydrogen in its hatch after the sinter: ' + tankOf(m.P.hydrogen) + ' of 500 mB')
      emptyBus(m.P.inBus)
      setCircuit(m, 2)
      fillBus(m.P.inBus, ZIRCALOY, 2)
      mark(m, 'tubes')
      return
    }
    if (m.phase === 'tubes') {
      var tubes = readBus(m.P.outBus)[TUBE] || 0
      if (tubes < 4 && age < RUN_TIMEOUT) return
      var p2 = []
      if (tubes !== 4) p2.push(tubes + ' tubes')
      if ((readBus(m.P.inBus)[ZIRCALOY] || 0) !== 0) p2.push('ingots left')
      if (energyUsed(m) !== 2 * stepEnergy('zircaloy_cladding_tube')) p2.push(energyUsed(m) + ' EU (wanted ' + 2 * stepEnergy('zircaloy_cladding_tube') + ')')
      check('PROCESS_tubes', p2.length === 0, 'circuit 2, 2 zircaloy ingots: ' + plantText(m) + (p2.length > 0 ? ' | problems: ' + p2.join('; ') : ''))
      // the pellets and tubes it made go back in for the assembly
      var made = readBus(m.P.outBus)
      emptyBus(m.P.outBus)
      emptyBus(m.P.inBus)
      fillBus(m.P.inBus, PELLET, made[PELLET] || 0)
      fillBus(m.P.inBus, TUBE, made[TUBE] || 0)
      setCircuit(m, 3)
      setTank(m.P.helium, HELIUM, 100)
      mark(m, 'assembly')
      return
    }
    if (m.phase === 'assembly') {
      var assemblies = readBus(m.P.outBus)[ASSEMBLY] || 0
      if (assemblies < 1 && age < RUN_TIMEOUT) return
      var rest = readBus(m.P.inBus)
      var p3 = []
      if (assemblies !== 1) p3.push(assemblies + ' assemblies')
      if ((rest[PELLET] || 0) !== 0 || (rest[TUBE] || 0) !== 0) p3.push('pellets or tubes left')
      if (tankOf(m.P.helium) !== 0) p3.push('helium left')
      if (energyUsed(m) !== stepEnergy('leu_fuel_assembly')) p3.push(energyUsed(m) + ' EU (wanted ' + stepEnergy('leu_fuel_assembly') + ')')
      check('PROCESS_assembly', p3.length === 0, 'circuit 3, its 10 pellets and 4 tubes + 100 mB helium: ' + plantText(m) +
        (p3.length > 0 ? ' | problems: ' + p3.join('; ') : ''))
      m.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- forming and starting

  function start(m) {
    m.energy = 0
    m.energyAt = 0
    m.seen = {}
    var key = m.copy.key
    if (key === 'end' || key === 'earth') {
      loadLeach(m, LEACH_RUNS)
      mark(m, key === 'end' ? 'running' : 'holding')
    } else {
      emptyBus(m.P.inBus)
      emptyBus(m.P.outBus)
      setCircuit(m, 1)
      fillBus(m.P.inBus, U235, 1)
      fillBus(m.P.inBus, U238, 9)
      setTank(m.P.oxygen, OXYGEN, 20000)
      setTank(m.P.hydrogen, HYDROGEN, 0)
      setTank(m.P.helium, HELIUM, 0)
      mark(m, 'no_hydrogen')
    }
  }

  function formed(m) {
    safely(m.copy.key + '_PARTS', function () {
      m.ctrl = machineAt(m)
      m.P = findParts(m, m.ctrl)
      var want = {}
      Object.keys(m.copy.partsAt).forEach(function (k) { want[m.copy.partsAt[k]] = true })
      var missing = Object.keys(want).filter(function (role) { return !m.P[role] })
      check(m.copy.key + '_PARTS', missing.length === 0, '[' + m.P.ids.join(' ') + ']' + (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''))
      if (missing.length > 0) {
        m.phase = 'done'
        return
      }
      start(m)
    })
    if (m.phase === 'formed') m.phase = 'done'
  }

  function formStep(m) {
    var waited = S.t - S.t0
    var ctrl = machineAt(m)
    if (ctrl === null || ctrl === undefined) {
      check(m.copy.key + '_FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }
    if (ctrl.isFormed()) {
      check(m.copy.key + '_FORMED', true, (m.forced ? 'after a forced check' : 'by itself after ' + waited + ' ticks') + ', class=' +
        String(ctrl.getClass().getSimpleName()) + ' parts=' + asArray(ctrl.getParts()).length)
      m.phase = 'formed'
      formed(m)
      return
    }
    if (waited >= FORM_TIMEOUT && !m.forced) {
      m.ctrl = ctrl
      if (!ctrl.checkPatternWithLock()) {
        check(m.copy.key + '_FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(m, ctrl))
        m.phase = 'done'
        return
      }
      check(m.copy.key + '_FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
      ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
      ctrl.onStructureFormed()
      m.forced = true
    } else if (waited >= 2 * FORM_TIMEOUT) {
      check(m.copy.key + '_FORMED', false, 'still not formed after a forced check')
      m.phase = 'done'
    }
  }

  // every tick: what each controller runs, and the energy it draws (the energy hatch is topped up to its capacity)
  function measure(m) {
    if (!m.ctrl || !m.P || !m.P.energy || m.phase === 'forming' || m.phase === 'formed' || m.phase === 'done') return
    var rlg = m.ctrl.getRecipeLogic()
    var last = rlg.getLastRecipe()
    if (String(rlg.getStatus()) === 'WORKING' && last !== null && last !== undefined) m.seen[String(last.id)] = true
    var c = m.P.energy.energyContainer
    var cap = Number(c.getEnergyCapacity())
    var stored = Number(c.getEnergyStored())
    if (m.primed) m.energy += cap - stored
    c.setEnergyStored(cap)
    m.primed = true
  }

  function step(m) {
    if (m.phase === 'forming') {
      formStep(m)
      return
    }
    var age = S.t - m.t0
    if (m.copy.key === 'end') endStep(m, age)
    else if (m.copy.key === 'earth') earthStep(m, age)
    else plantStep(m, age)
  }

  // ---------------------------------------------------------------- driver

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      cleanup()
    } catch (e) {
      check('CLEANUP', false, 'exception: ' + e)
    }
    console.info(TAG + SCOPE + '|DONE')
  }

  function onTick(server) {
    if (S === null || S.finished) return
    S.t = Number(server.getTickCount()) - S.tick0
    if (S.t > TEST_TIMEOUT) {
      check('timeout', false, 'still running after ' + S.t + ' ticks: ' + S.copies.map(function (m) { return m.copy.key + ' ' + m.phase }).join(', '))
      finish()
      return
    }
    S.copies.forEach(function (m) {
      try {
        measure(m)
        if (m.phase === 'forming' ? S.t % STEP === 0 : true) step(m)
      } catch (e) {
        check(m.copy.key + '_STEP', false, 'exception in ' + m.phase + ': ' + e)
        m.phase = 'done'
      }
    })
    if (S.copies.every(function (m) { return m.phase === 'done' })) finish()
  }

  function startCopies() {
    COPIES.forEach(function (copy) {
      var m = { copy: copy, phase: 'forming', energy: 0, energyAt: 0, seen: {}, primed: false, forced: false, ctrl: null, P: null, t0: 0 }
      S.copies.push(m)
      try {
        if (!place(m)) m.phase = 'done'
      } catch (e) {
        check(copy.key + '_PLACED', false, 'exception: ' + e)
        m.phase = 'done'
      }
    })
    S.t0 = S.t
  }

  function run(server) {
    S = { server: server, earth: server.overworld(), end: server.getLevel(END), t: 0, t0: 0, tick0: Number(server.getTickCount()), copies: [], finished: false,
      areaTouched: false }
    var shared = false
    try {
      shared = sharedIdsPresent()
      staticChecks()
    } catch (e) {
      check('static', false, 'exception: ' + e)
    }
    if (!shared) {
      note('copies', 'skipped: the machines cannot run without IV-A1\'s registrations')
      finish()
      return
    }
    if (S.end === null || S.end === undefined) {
      check('end_level', false, END + ' is not loaded on this server')
      finish()
      return
    }
    try {
      prepareWorld()
    } catch (e2) {
      check('AREA', false, 'exception: ' + e2)
    }
    startCopies()
    if (S.copies.every(function (m) { return m.phase === 'done' })) finish()
  }

  function startIfRequested(server) {
    if (global[REQUEST] !== true || (S !== null && !S.finished)) return
    if (Date.now() - LOADED_AT < QUIET_MS) return
    global[REQUEST] = false
    try {
      run(server)
    } catch (e) {
      check('run', false, 'exception: ' + e)
      if (S === null) console.info(TAG + SCOPE + '|DONE')
      else finish()
    }
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick(event.server)
  })

  ServerEvents.customCommand('gg_test_uranium_cycle', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_uranium_cycle run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
