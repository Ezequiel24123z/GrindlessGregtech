// Gregtech Grindless - smoke test of package IV-B1, venus (TEST-ONLY overlay: copied over the instance on the test PC, never shipped with
// the pack): the Pressurized Vein Drill (gtceu:pressurized_vein_drill), the Venus Heat Engine (gtceu:venus_heat_engine, type
// gtceu:venus_heat) and the Venus Acid Works (gtceu:venus_acid_works, type gtceu:acid_cracking): startup_scripts/grindless/iv/venus.js,
// server_scripts/grindless/iv/venus.js, data/grindless/tables/venus.json; and the Venus recipes of GTM's gas collector and forge hammer.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_venus;;kubejs custom_command gg_test_recipe_lookup;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|venus\|DONE@@1200;;GGTEST\|lookup\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|venus|<check>|PASS|FAIL|NOTE|<detail>
//   static
//     registration      the three machines on their types, their structure sizes, gtceu:vein_drilling widened to a fluid output,
//                       global.grindless.venus
//     drill_recipes     one recipe per 'ore' vein of Venus and Mars under vein_drilling/iv/pressurized_*, each with its dimension, 8 EU/t,
//                       200 t, the bit at 25 of 10,000, 5.625 raw ores a run; Venus: 200 mB of distilled water in, steam out no more than
//                       the run's energy; Mars: no fluid
//     drill_veto        the drill takes exactly its own recipes (and not a made-up vein_drilling/iv/mercury_* one); every lower drill
//                       skips them (rules.isAboveTier)
//     engine_recipe     gtceu:venus_heat: Venus only, 8,192 EU/t out for 400 t, 200 mB of distilled water in, 32,000 mB of steam out
//     works_recipes     circuits 1 and 2, the gauze at 10 of 10,000, 1,000 mB of acid; the outputs against GTM's sulfur_trioxide and
//                       sulfuric_acid_from_trioxide run backwards; only circuit 2 keeps its SO2 (and carries the keep key); the energy
//                       equals GTM's live distilled water electrolysis
//     collector_recipes circuits 4 and 5 on Venus with complementary pos_y ranges; every gas collector recipe has its own circuit
//     casing_recipe     the forge hammer's Venus cobblestone -> Venusian regolith, Venus only, at GTM's cobblestone-to-gravel numbers
//     controllers       the three crafting recipes and their parts
//   in the world: Venus (gcyr:venus) band X 11264..11327, Z 0..15, on a slab one block above the highest ground of the band (SURFACE
//   notes the ground); the cloud collector at Y 250. Mars (gcyr:mars), same X and Z, likewise.
//     drill_venus_PLACED / _FORMED / _PARTS, PROCESS_no_water (sample and bits, no water: nothing runs), PROCESS_naquadah (one cycle:
//       128 runs at once, one overclock, 5.625 ores a run, 200 mB of water and 1,600 mB of steam a run)
//     drill_mars_..., PROCESS_scheelite (dry: 128 runs, no fluid)
//     engine_..., PROCESS_eu (two cycles: EU into a real IV battery buffer + what is still in the dynamo = exactly 2 x 8,192 x 400;
//       400 mB of water in, 64,000 mB of steam out)
//     works_..., PROCESS_mode1 (3 runs: water and oxygen, no SO2, 3 x 45,000 EU), PROCESS_mode2 (2 runs: + SO2), no_voiding (circuit 2
//       cached, fluid voiding on: nothing runs and the refusal shows), resumes (voiding off: one more run), mode1_voids (circuit 1 runs
//       with fluid voiding on)
//     collector_low / collector_clouds: an EV gas collector below the cloud base makes CO2 (circuit 4) and no acid (circuit 5); one at
//       Y 250 makes acid (circuit 5) and no CO2 (circuit 4)
//   venus|DONE  last line
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'venus'
  var STEP = 5
  var FORM_TIMEOUT = 400
  var RUN_TIMEOUT = 400
  var HOLD_TICKS = 60
  var REQUEST = 'ggTestVenusRequest'

  var VENUS = 'gcyr:venus'
  var MARS = 'gcyr:mars'
  var BAND = { x0: 11264, x1: 11327, z0: 0, z1: 15 }
  var CLOUD_Y = 250
  var CLEAR_ABOVE = 18

  var DRILL = 'gtceu:pressurized_vein_drill'
  var ENGINE = 'gtceu:venus_heat_engine'
  var WORKS = 'gtceu:venus_acid_works'
  var COLLECTOR = 'gtceu:ev_gas_collector'
  var BUFFER = 'gtceu:iv_battery_buffer_4x'
  var BATTERY = 'gtceu:iv_vanadium_battery'

  var BIT = 'grindless:tungsten_steel_drill_bit'
  var GAUZE = 'grindless:platinum_gauze'
  var SAMPLE_VENUS = 'grindless:vein_sample_naquadah_venus'
  var SAMPLE_MARS = 'grindless:vein_sample_scheelite_mars'
  var STONE_VENUS = 'gcyr:venus_cobblestone'
  var STONE_MARS = 'gcyr:martian_cobblestone'
  var REGOLITH = 'gcyr:venusian_regolith'
  var WATER = 'gtceu:distilled_water'
  var STEAM = 'gtceu:steam'
  var ACID = 'gtceu:sulfuric_acid'
  var OXYGEN = 'gtceu:oxygen'
  var SO2 = 'gtceu:sulfur_dioxide'
  var CO2 = 'gtceu:carbon_dioxide'

  var DRILL_VENUS_ID = 'grindless:vein_drilling/iv/pressurized_naquadah_venus_tungsten_steel'
  var DRILL_MARS_ID = 'grindless:vein_drilling/iv/pressurized_scheelite_mars_tungsten_steel'
  var ENGINE_ID = 'grindless:venus_heat/ground_heat'
  var MODE1_ID = 'grindless:acid_cracking/cloud_acid_vented'
  var MODE2_ID = 'grindless:acid_cracking/cloud_acid_kept'
  var CO2_ID = 'grindless:gas_collector/venus_carbon_dioxide'
  var ACID_ID = 'grindless:gas_collector/venus_sulfuric_acid'
  var CASING_ID = 'grindless:forge_hammer/venusian_regolith'
  var ELECTROLYSIS = 'gtceu:electrolyzer/distilled_water_electrolysis'
  var TRIOXIDE = 'gtceu:chemical_reactor/sulfur_trioxide'
  var ACID_FROM_TRIOXIDE = 'gtceu:chemical_reactor/sulfuric_acid_from_trioxide'
  var GRAVEL = 'gtceu:forge_hammer/cobblestone_to_gravel'

  var NO_VOIDING = /grindless\.machine\.venus_acid_works\.no_voiding|keeps the sulfur dioxide/

  var PARTS_IV = {
    energy_input: 'gtceu:iv_energy_input_hatch', energy_output: 'gtceu:iv_energy_output_hatch', input_bus: 'gtceu:iv_input_bus',
    output_bus: 'gtceu:iv_output_bus', input_hatch: 'gtceu:iv_input_hatch', output_hatch: 'gtceu:iv_output_hatch'
  }
  // preferred facing of parts: the first side that has no structure block in front of it
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  var S = null
  var J = null

  // ---------------------------------------------------------------- output

  function clean(x) {
    return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3500)
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

  // ---------------------------------------------------------------- Java and small helpers

  function lazy() {
    if (J === null) {
      J = {
        ArrayList: Java.loadClass('java.util.ArrayList'),
        MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
        FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP,
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
        ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        BI: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'),
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
        VoidingMode: Java.loadClass('com.gregtechceu.gtceu.api.machine.feature.IVoidable$VoidingMode')
      }
    }
    return J
  }

  function asArray(coll) {
    if (coll === null || coll === undefined) return []
    var list = new (lazy().ArrayList)(coll)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }

  function rl(id) {
    return new ResourceLocation(id)
  }

  function cmd(dim, text) {
    return S.server.runCommandSilent('execute in ' + dim + ' run ' + text)
  }

  function levelOf(dim) {
    return dim === VENUS ? S.venus : S.mars
  }

  function blockIdAt(dim, x, y, z) {
    return String(levelOf(dim).getBlock(x, y, z).getId())
  }

  function machineAt(dim, p) {
    return lazy().MetaMachine.getMachine(levelOf(dim), new BlockPos(p.x, p.y, p.z))
  }

  function byId(id) {
    var opt = S.server.getRecipeManager().byKey(rl(id))
    return opt.isPresent() ? opt.get() : null
  }

  function recipesOfType(typeId) {
    var type = GTRegistries.RECIPE_TYPES.get(rl(typeId))
    return type ? asArray(S.server.getRecipeManager().getAllRecipesFor(type)) : []
  }

  // total EU/t of a GT recipe and whether it is made (out) or used (in)
  function euOf(r) {
    var io = lazy().RecipeHelper.getRealEUtWithIO(r)
    if (io.isEmpty()) return { eut: 0, out: false }
    return { eut: Number(io.getTotalEU()), out: !io.isInput() }
  }

  function conditionsOf(r) {
    return asArray(r.conditions).map(function (c) {
      try {
        return JSON.parse(String(c.serialize()))
      } catch (e) {
        return { type: String(c.getClass().getSimpleName()) }
      }
    })
  }

  function itemIdOf(stack) {
    return String(lazy().BI.ITEM.getKey(stack.getItem()))
  }

  function fluidIdOf(stack) {
    return String(lazy().Registries.FLUIDS.getKey(stack.getFluid()))
  }

  function inputChances(r) {
    return asArray(r.getInputContents(lazy().ItemCap)).map(function (c) { return Number(c.chance) })
  }

  function fluidsIn(r) {
    return asArray(lazy().RecipeHelper.getInputFluids(r)).map(function (st) { return { id: fluidIdOf(st), amount: Number(st.getAmount()) } })
  }

  function fluidsOut(r) {
    return asArray(lazy().RecipeHelper.getOutputFluids(r)).map(function (st) { return { id: fluidIdOf(st), amount: Number(st.getAmount()) } })
  }

  function fluidText(list) {
    return list.map(function (f) { return f.amount + ' ' + f.id.replace(/^[a-z]+:/, '') }).join(' + ')
  }

  function itemSummary(counts) {
    return Object.keys(counts).map(function (k) { return k.replace(/^[a-z_]+:/, '') + 'x' + counts[k] }).join(' ')
  }

  // the item inputs of a recipe as they are written: [{ id, chance }] (the programmed circuit as circuit:<n>), read from each ingredient's JSON
  function itemInputs(r) {
    return asArray(r.getInputContents(lazy().ItemCap)).map(function (c) {
      var id = '?'
      try {
        var json = String(c.content.toJson())
        var m = /"configuration":(\d+)/.exec(json)
        var it = /"item":"([^"]+)"/.exec(json)
        if (m) id = 'circuit:' + m[1]
        else if (it) id = it[1]
      } catch (e) {
        id = 'unreadable'
      }
      return { id: id, chance: Number(c.chance) }
    })
  }

  // ---------------------------------------------------------------- static checks

  function VN() {
    return global.grindless.venus
  }

  function machineTypes(id) {
    var def = GTRegistries.MACHINES.get(rl(id))
    if (def === null || def === undefined) return null
    var types = []
    var arr = def.getRecipeTypes()
    for (var i = 0; i < arr.length; i++) types.push(String(arr[i].registryName))
    return types.join(',')
  }

  function sizeOf(id) {
    var desc = global.grindless.patterns.describe(id)
    return desc ? desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length : 'none'
  }

  function checkRegistration() {
    var problems = []
    var got = []
    ;[[DRILL, 'gtceu:vein_drilling', '5x9x4'], [ENGINE, 'gtceu:venus_heat', '5x16x5'], [WORKS, 'gtceu:acid_cracking', '8x11x5']].forEach(function (w) {
      var types = machineTypes(w[0])
      var size = sizeOf(w[0])
      if (types !== w[1]) problems.push(w[0] + ' types ' + types)
      if (size !== w[2]) problems.push(w[0] + ' size ' + size)
      got.push(w[0].replace('gtceu:', '') + ' on ' + types + ' ' + size + ' (w x h x d)')
    })
    var drilling = GTRegistries.RECIPE_TYPES.get(rl('gtceu:vein_drilling'))
    var fluidOuts = drilling ? Number(drilling.getMaxOutputs(lazy().FluidCap)) : -1
    if (fluidOuts < 1) problems.push('gtceu:vein_drilling has ' + fluidOuts + ' fluid outputs')
    var generator = '?'
    try {
      generator = String(GTRegistries.MACHINES.get(rl(ENGINE)).isGenerator())
    } catch (e) {
      generator = 'unreadable'
    }
    if (generator === 'false') problems.push('the engine is not a generator')
    var v = VN()
    if (!v || !v.drill || v.drill.cap !== 128 || typeof v.drill.isDrillRecipe !== 'function' || !v.recipes || v.cloudBase !== 240) problems.push('global.grindless.venus missing or wrong')
    if (v && v.recipes && v.recipes.problems.length > 0) problems.push('table problems: ' + v.recipes.problems.join('; '))
    check('registration', problems.length === 0, got.join('; ') + '; vein_drilling fluid outputs=' + fluidOuts + ', engine generator=' + generator +
      (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  // raw ores a run of a drilling recipe: every item output but the stone, whole counts plus chances
  function oresPerRun(r, stone) {
    var total = 0
    asArray(r.getOutputContents(lazy().ItemCap)).forEach(function (c) {
      var json = String(c.content.toJson())
      var it = /"item":"([^"]+)"/.exec(json)
      var cnt = /"count":(\d+)/.exec(json)
      if (it && it[1] === stone) return
      total += (cnt ? Number(cnt[1]) : 1) * Number(c.chance) / 10000
    })
    return total
  }

  function checkDrillRecipes() {
    var v = VN()
    var D = v.data.drill
    var runEnergy = Number(D.eut) * Number(D.duration)
    var want = []
    global.grindless.ivFoundation.venusVeins().forEach(function (vein) {
      if (vein.kind === undefined || vein.kind === 'ore') want.push({ vein: vein, dim: VENUS })
    })
    global.grindless.mars.martianVeins().forEach(function (vein) {
      if (vein.kind === undefined || vein.kind === 'ore') want.push({ vein: vein, dim: MARS })
    })
    var problems = []
    var seen = []
    want.forEach(function (w) {
      var id = 'grindless:vein_drilling/iv/pressurized_' + w.vein.id + '_tungsten_steel'
      var r = byId(id)
      if (r === null) {
        problems.push(id + ' missing')
        return
      }
      seen.push(w.vein.id + '@' + w.dim)
      var conds = conditionsOf(r)
      if (conds.length !== 1 || conds[0].type !== 'dimension' || conds[0].dimension !== w.dim) problems.push(id + ' conditions ' + JSON.stringify(conds))
      var eu = euOf(r)
      if (eu.out || eu.eut !== 8 || Number(r.duration) !== 200) problems.push(id + ' ' + eu.eut + ' EU/t ' + r.duration + ' t')
      var ins = itemInputs(r).map(function (i) { return i.id + '@' + i.chance })
      var wantIns = w.dim === VENUS ? [BIT + '@25', w.vein.sample + '@0'] : [w.vein.sample + '@0', BIT + '@25']
      if (ins.join(',') !== wantIns.join(',')) problems.push(id + ' item inputs ' + ins.join(','))
      var fin = fluidsIn(r)
      var fout = fluidsOut(r)
      if (w.dim === VENUS) {
        if (fluidText(fin) !== '200 distilled_water') problems.push(id + ' fluids in ' + fluidText(fin))
        if (fout.length !== 1 || fout[0].id !== STEAM || fout[0].amount !== 1600 || fout[0].amount > runEnergy) problems.push(id + ' fluids out ' + fluidText(fout))
      } else if (fin.length + fout.length !== 0) {
        problems.push(id + ' has fluids ' + fluidText(fin) + ' / ' + fluidText(fout))
      }
      var ores = oresPerRun(r, String(w.vein.stone))
      if (Math.abs(ores - 5.625) > 0.002) problems.push(id + ' ' + ores.toFixed(4) + ' ores a run')
    })
    var live = recipesOfType('gtceu:vein_drilling').filter(function (r) { return String(r.getId()).indexOf('grindless:vein_drilling/iv/pressurized_') === 0 })
    var published = v.recipes.drilling.length
    check('drill_recipes', problems.length === 0 && live.length === want.length && published === want.length && want.length === 4,
      'veins ' + seen.join(', ') + ': ' + live.length + ' live recipes under vein_drilling/iv/pressurized_ (expected ' + want.length + ', published ' + published +
      '); the bit at 25 of 10,000, 5.625 ores a run, Venus 200 mB water -> 1,600 mB steam (a run is ' + runEnergy + ' EU), Mars dry' +
      (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  function checkDrillVeto() {
    var v = VN()
    var rules = global.grindless.lv.rules
    var all = recipesOfType('gtceu:vein_drilling')
    var taken = all.filter(function (r) { return v.drill.isDrillRecipe(r) }).map(function (r) { return String(r.getId()) }).sort()
    var want = v.recipes.drilling.map(function (d) { return d.id }).sort()
    var problems = []
    if (taken.join(',') !== want.join(',')) problems.push('takes [' + taken.join(',') + '] wanted [' + want.join(',') + ']')
    function stub(path) {
      return { id: { getPath: function () { return path } } }
    }
    if (v.drill.isDrillRecipe(stub('vein_drilling/iv/mercury_iridosmine_mercury_tungsten_steel'))) problems.push('takes a Mercury drill recipe')
    if (v.drill.isDrillRecipe(stub('vein_drilling/ev/scheelite_mars_titanium'))) problems.push('takes a tripod recipe')
    if (v.drill.isDrillRecipe(stub('vein_drilling/iron_bronze'))) problems.push('takes a steam recipe')
    if (!v.drill.isDrillRecipe(stub('vein_drilling/iv/pressurized_made_up_tungsten_steel'))) problems.push('refuses its own folder')
    var lowerTake = all.filter(function (r) { return v.drill.isDrillRecipe(r) && !(rules.isAboveTier(r, 'ev') && rules.recipeTier(r) === 'iv') })
    if (lowerTake.length > 0) problems.push('a lower drill could take ' + lowerTake.map(function (r) { return String(r.getId()) }).join(','))
    check('drill_veto', problems.length === 0, 'of ' + all.length + ' vein_drilling recipes the drill takes exactly its ' + taken.length +
      ' (not vein_drilling/iv/mercury_*, ev/ or steam ones); every lower drill skips them (above EV)' + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  function checkEngine() {
    var r = byId(ENGINE_ID)
    if (r === null) throw new Error(ENGINE_ID + ' missing')
    var eu = euOf(r)
    var conds = conditionsOf(r)
    var count = recipesOfType('gtceu:venus_heat').length
    var ok = eu.out && eu.eut === 8192 && Number(r.duration) === 400 && fluidText(fluidsIn(r)) === '200 distilled_water' &&
      fluidText(fluidsOut(r)) === '32000 steam' && conds.length === 1 && conds[0].type === 'dimension' && conds[0].dimension === VENUS && count === 1
    check('engine_recipe', ok, ENGINE_ID + ': ' + fluidText(fluidsIn(r)) + ' -> ' + (eu.out ? '' : 'IN ') + eu.eut + ' EU/t x ' + r.duration + ' t (' +
      (eu.eut * Number(r.duration)) + ' EU) + ' + fluidText(fluidsOut(r)) + ', conditions ' + JSON.stringify(conds) + ', ' + count + ' recipe(s) of the type')
  }

  // per 1,000 mB of sulfuric acid, GTM's sulfuric_acid_from_trioxide and sulfur_trioxide run backwards
  function backwards() {
    var tri = byId(TRIOXIDE)
    var acid = byId(ACID_FROM_TRIOXIDE)
    if (tri === null || acid === null) throw new Error('GTM\'s sulfur_trioxide or sulfuric_acid_from_trioxide is missing')
    function amountOf(list, re) {
      var f = list.filter(function (x) { return re.test(x.id) })
      return f.length === 1 ? f[0].amount : -1
    }
    var acidOut = amountOf(fluidsOut(acid), /sulfuric_acid$/)
    var water = amountOf(fluidsIn(acid), /water$/) * 1000 / acidOut
    var so3 = amountOf(fluidsIn(acid), /sulfur_trioxide$/) * 1000 / acidOut
    var triOut = amountOf(fluidsOut(tri), /sulfur_trioxide$/)
    var so2 = amountOf(fluidsIn(tri), /sulfur_dioxide$/) * so3 / triOut
    var o = amountOf(fluidsIn(tri), /oxygen$/) * so3 / triOut
    return { water: water, so2: so2, oxygen: o }
  }

  function checkWorks() {
    var el = byId(ELECTROLYSIS)
    if (el === null) throw new Error(ELECTROLYSIS + ' missing')
    var elEnergy = euOf(el).eut * Number(el.duration)
    var back = backwards()
    var keyName = VN().works.keepKey
    var problems = []
    var text = []
    ;[[MODE1_ID, 1, false], [MODE2_ID, 2, true]].forEach(function (w) {
      var r = byId(w[0])
      if (r === null) {
        problems.push(w[0] + ' missing')
        return
      }
      var ins = itemInputs(r).map(function (i) { return i.id + '@' + i.chance })
      if (ins.join(',') !== GAUZE + '@10,circuit:' + w[1] + '@0') problems.push(w[0] + ' item inputs ' + ins.join(','))
      if (fluidText(fluidsIn(r)) !== '1000 sulfuric_acid') problems.push(w[0] + ' fluids in ' + fluidText(fluidsIn(r)))
      var wantOut = back.water + ' distilled_water + ' + back.oxygen + ' oxygen' + (w[2] ? ' + ' + back.so2 + ' sulfur_dioxide' : '')
      if (fluidText(fluidsOut(r)) !== wantOut) problems.push(w[0] + ' fluids out ' + fluidText(fluidsOut(r)) + ' (GTM backwards: ' + wantOut + ')')
      var eu = euOf(r)
      if (eu.out || eu.eut * Number(r.duration) !== elEnergy || eu.eut > 7680) problems.push(w[0] + ' ' + eu.eut + ' EU/t x ' + r.duration + ' t (electrolysis ' + elEnergy + ' EU)')
      var conds = conditionsOf(r)
      if (conds.length !== 1 || conds[0].dimension !== VENUS) problems.push(w[0] + ' conditions ' + JSON.stringify(conds))
      var keeps = false
      try {
        keeps = r.data.getBoolean(keyName) === true
      } catch (e) {
        keeps = false
      }
      if (keeps !== w[2]) problems.push(w[0] + ' keep key ' + keeps)
      text.push(w[0].replace('grindless:acid_cracking/', '') + ' circuit ' + w[1] + ' -> ' + fluidText(fluidsOut(r)) + ' at ' + eu.eut + ' EU/t x ' + r.duration + ' t' +
        (keeps ? ', keeps its fluids' : ''))
    })
    check('works_recipes', problems.length === 0 && recipesOfType('gtceu:acid_cracking').length === 2, text.join('; ') + '; the energy of ' + ELECTROLYSIS + ' is ' +
      elEnergy + ' EU' + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  function checkCollector() {
    var all = recipesOfType('gtceu:gas_collector')
    var byCircuit = {}
    var dup = []
    all.forEach(function (r) {
      var c = itemInputs(r).filter(function (i) { return i.id.indexOf('circuit:') === 0 }).map(function (i) { return i.id }).join('+') || 'none'
      if (byCircuit[c]) dup.push(c + ': ' + byCircuit[c] + ' and ' + r.getId())
      byCircuit[c] = String(r.getId())
    })
    var problems = []
    var text = []
    ;[[CO2_ID, 4, CO2, -64, 239], [ACID_ID, 5, ACID, 240, 319]].forEach(function (w) {
      var r = byId(w[0])
      if (r === null) {
        problems.push(w[0] + ' missing')
        return
      }
      var conds = conditionsOf(r)
      var dim = conds.filter(function (c) { return c.type === 'dimension' })
      var pos = conds.filter(function (c) { return c.type === 'pos_y' })
      if (conds.length !== 2 || dim.length !== 1 || dim[0].dimension !== VENUS || pos.length !== 1 || pos[0].min !== w[3] || pos[0].max !== w[4] || pos[0].reverse === true) {
        problems.push(w[0] + ' conditions ' + JSON.stringify(conds))
      }
      var ins = itemInputs(r).map(function (i) { return i.id })
      if (ins.join(',') !== 'circuit:' + w[1]) problems.push(w[0] + ' inputs ' + ins.join(','))
      var out = fluidsOut(r)
      if (out.length !== 1 || out[0].id !== w[2] || out[0].amount !== 10000) problems.push(w[0] + ' outputs ' + fluidText(out))
      var eu = euOf(r)
      if (eu.out || eu.eut !== 1024 || Number(r.duration) !== 200) problems.push(w[0] + ' ' + eu.eut + ' EU/t x ' + r.duration)
      text.push('circuit ' + w[1] + ' Y ' + w[3] + '..' + w[4] + ' -> ' + fluidText(out))
    })
    check('collector_recipes', problems.length === 0 && dup.length === 0, all.length + ' gas collector recipes on circuits [' + Object.keys(byCircuit).sort().join(' ') +
      ']; Venus: ' + text.join('; ') + (dup.length > 0 ? ' | shared circuits: ' + dup.join('; ') : '') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  function checkCasing() {
    var r = byId(CASING_ID)
    var g = byId(GRAVEL)
    if (r === null || g === null) throw new Error((r === null ? CASING_ID : GRAVEL) + ' missing')
    var ins = asArray(lazy().RecipeHelper.getInputItems(r)).map(function (st) { return st.getCount() + 'x' + itemIdOf(st) })
    var outs = asArray(lazy().RecipeHelper.getOutputItems(r)).map(function (st) { return st.getCount() + 'x' + itemIdOf(st) })
    var conds = conditionsOf(r)
    var ok = ins.join(',') === '1x' + STONE_VENUS && outs.join(',') === '1x' + REGOLITH && conds.length === 1 && conds[0].dimension === VENUS &&
      euOf(r).eut === euOf(g).eut && Number(r.duration) === Number(g.duration)
    check('casing_recipe', ok, CASING_ID + ': ' + ins.join(',') + ' -> ' + outs.join(',') + ' at ' + euOf(r).eut + ' EU/t x ' + r.duration + ' t (GTM\'s gravel: ' +
      euOf(g).eut + ' x ' + g.duration + '), conditions ' + JSON.stringify(conds))
  }

  function checkControllers() {
    var want = [
      ['grindless:crafting/pressurized_vein_drill', DRILL, ['gtceu:ev_vein_drill', 'gtceu:iv_machine_hull', 'gtceu:iv_electric_motor', 'gtceu:iv_electric_pump', 'gtceu:polytetrafluoroethylene_plate']],
      ['grindless:crafting/venus_heat_engine', ENGINE, ['gtceu:heliostat_tower', 'gtceu:steam_large_turbine', 'gtceu:iv_machine_hull', 'gtceu:iv_electric_pump']],
      ['grindless:crafting/venus_acid_works', WORKS, [GAUZE, 'gtceu:iv_chemical_reactor', 'gtceu:iv_fluid_heater', 'gtceu:iv_machine_hull']]
    ]
    var problems = []
    want.forEach(function (w) {
      var r = byId(w[0])
      if (r === null) {
        problems.push(w[0] + ' missing')
        return
      }
      var out = String(r.getResultItem(S.server.registryAccess()).getId())
      var ids = {}
      asArray(r.getIngredients()).forEach(function (ing) {
        asArray(ing.getItemIds()).forEach(function (id) { ids[String(id)] = true })
      })
      var missing = w[2].filter(function (id) { return !ids[id] })
      if (out !== w[1]) problems.push(w[0] + ' makes ' + out)
      if (missing.length > 0) problems.push(w[0] + ' lacks ' + missing.join(','))
    })
    check('controllers', problems.length === 0, want.map(function (w) { return w[0] }).join(', ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  function staticChecks() {
    safely('registration', checkRegistration)
    safely('drill_recipes', checkDrillRecipes)
    safely('drill_veto', checkDrillVeto)
    safely('engine_recipe', checkEngine)
    safely('works_recipes', checkWorks)
    safely('collector_recipes', checkCollector)
    safely('casing_recipe', checkCasing)
    safely('controllers', checkControllers)
  }

  // ---------------------------------------------------------------- structures (the tripod test's technique, any dimension)

  function simpleBlock(sym, m) {
    switch (sym.kind) {
      case 'blocks':
        return { id: sym.blocks[0] }
      case 'frames':
        return { id: 'gtceu:' + sym.materials[0] + '_frame' }
      case 'part':
        if (!PARTS_IV[sym.ability]) throw new Error('the test does not know the part ability ' + sym.ability)
        return { id: PARTS_IV[sym.ability], ability: sym.ability }
      case 'controller':
        return { id: m.id, controller: true }
      case 'air':
        return { id: 'minecraft:air', air: true }
      case 'any':
        return null
      default:
        throw new Error('unsupported symbol kind ' + sym.kind)
    }
  }

  function assignOneOf(sym, list, m) {
    var filler = null
    var parts = []
    sym.options.forEach(function (o) {
      if (o.kind === 'part') {
        var lim = o.limits || {}
        var need = lim.exact != null ? lim.exact : (lim.min != null ? lim.min : 0)
        if (m.counts[o.ability] != null) need = m.counts[o.ability]
        for (var k = 0; k < need; k++) parts.push(simpleBlock(o, m))
      } else if (filler === null) {
        filler = simpleBlock(o, m)
      }
    })
    if (filler === null) throw new Error('a oneOf symbol has no plain block option')
    if (parts.length > list.length) throw new Error('more required parts (' + parts.length + ') than cells (' + list.length + ')')
    list.forEach(function (c) { c.block = filler })
    parts.forEach(function (p, i) {
      list[Math.floor((i + 0.5) * list.length / parts.length)].block = p
    })
    // parts the test needs in the front wall (the dynamo, with the battery buffer in front of it): swap them with a front casing cell
    ;(m.front || []).forEach(function (ability) {
      var at = list.filter(function (c) { return c.block.ability === ability })
      if (at.length === 0 || at[0].si === m.lastSlice) return
      var free = list.filter(function (c) { return c.si === m.lastSlice && c.block === filler && c.ri === m.ctrlRow })
      if (free.length === 0) free = list.filter(function (c) { return c.si === m.lastSlice && c.block === filler })
      if (free.length === 0) throw new Error('no front cell for ' + ability)
      free[0].block = at[0].block
      at[0].block = filler
    })
  }

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing north:
  // x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)  (the structure is behind it)
  function planOf(m) {
    var desc = global.grindless.patterns.describe(m.id)
    if (!desc) throw new Error('no structure description recorded for ' + m.id)
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
    m.lastSlice = desc.slices.length - 1
    m.ctrlRow = ctrl.ri
    // the controller's row above the structure's base: the base (row 0) stands on m.base
    var cy = m.base + ctrl.ri
    cells.forEach(function (c) {
      c.x = m.x - (c.ci - ctrl.ci)
      c.y = cy + (c.ri - ctrl.ri)
      c.z = m.z - (c.si - ctrl.si)
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
        assignOneOf(sym, list, m)
      } else {
        var b = simpleBlock(sym, m)
        list.forEach(function (c) { c.block = b })
      }
    })
    var occupied = {}
    cells.forEach(function (c) {
      if (c.block && !c.block.air) occupied[c.x + ',' + c.y + ',' + c.z] = true
    })
    cells.forEach(function (c) {
      if (!c.block) return
      if (c.block.controller) {
        c.props = '[facing=north]'
      } else if (c.block.ability) {
        if ((m.front || []).indexOf(c.block.ability) >= 0 && c.si === m.lastSlice) {
          c.props = '[facing=north]'
          c.facing = SIDES[1]
          return
        }
        for (var i = 0; i < SIDES.length; i++) {
          var s = SIDES[i]
          if (!occupied[(c.x + s[1]) + ',' + (c.y + s[2]) + ',' + (c.z + s[3])]) {
            c.props = '[facing=' + s[0] + ']'
            c.facing = s
            break
          }
        }
      }
    })
    var placed = cells.filter(function (c) { return c.block !== null })
    return { cells: placed, size: desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length + ' (w x h x d)' }
  }

  function place(m) {
    var plan = planOf(m)
    m.plan = plan
    var failed = []
    var ctrlCell = null
    var tally = {}
    function put(c) {
      return cmd(m.dim, 'setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.block.id + c.props + ' replace')
    }
    plan.cells.forEach(function (c) {
      if (c.block.air) return
      tally[c.block.id] = (tally[c.block.id] || 0) + 1
      if (c.block.controller) {
        ctrlCell = c
        return
      }
      if (put(c) < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.block.id + c.props)
    })
    if (put(ctrlCell) < 1) failed.push('controller ' + ctrlCell.block.id)
    m.ctrlPos = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }
    m.partCells = plan.cells.filter(function (c) { return c.block.ability })
    var bill = Object.keys(tally).sort().map(function (id) { return id.replace(/^[a-z]+:/, '') + ' x' + tally[id] }).join(', ')
    m.bill = bill
    m.placedOk = failed.length === 0
    m.placeFailed = failed
    return plan
  }

  // run a few ticks after placing (falling blocks settle, parts attach): every planned block still where it was put
  function verifyPlaced(m) {
    var wrong = []
    m.plan.cells.forEach(function (c) {
      var got = blockIdAt(m.dim, c.x, c.y, c.z)
      var want = c.block.air ? 'minecraft:air' : c.block.id
      if (got !== want && !(c.block.air && /air$/.test(got))) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + want + ' got ' + got)
    })
    check(m.key + '_PLACED', m.placedOk && wrong.length === 0, 'in ' + m.dim + ' ' + m.plan.cells.length + ' cells, ' + m.plan.size + ', controller ' +
      m.ctrlPos.x + ',' + m.ctrlPos.y + ',' + m.ctrlPos.z + ' bill=[' + m.bill + ']' +
      (m.placeFailed.length > 0 ? ' setblock failed: ' + m.placeFailed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' wrong blocks after settling: ' + wrong.slice(0, 5).join('; ') : ''))
    return m.placedOk && wrong.length === 0
  }

  function describeError(m, ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var text = 'pattern error ' + String(err)
      try {
        var p = err.getPos()
        text += ' at ' + p.getX() + ',' + p.getY() + ',' + p.getZ() + ' found ' + blockIdAt(m.dim, p.getX(), p.getY(), p.getZ())
      } catch (e1) { /* no position */ }
      return text
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  // ---------------------------------------------------------------- machine helpers

  function findParts(ctrl) {
    var P = { energy: [], dynamo: [], inBus: null, outBuses: [], inHatches: [], outHatches: [], ids: [] }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      P.ids.push(pid.replace('gtceu:', ''))
      if (pid === PARTS_IV.energy_input) P.energy.push(p)
      else if (pid === PARTS_IV.energy_output) P.dynamo.push(p)
      else if (pid === PARTS_IV.input_bus) P.inBus = p
      else if (pid === PARTS_IV.output_bus) P.outBuses.push(p)
      else if (pid === PARTS_IV.input_hatch) P.inHatches.push(p)
      else if (pid === PARTS_IV.output_hatch) P.outHatches.push(p)
    })
    return P
  }

  function readInventory(inv) {
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = itemIdOf(st)
      counts[id] = (counts[id] || 0) + Number(st.getCount())
    }
    return counts
  }

  function clearInventory(inv) {
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, lazy().ItemStack.EMPTY)
  }

  function outItems(m) {
    var total = {}
    m.P.outBuses.forEach(function (b) {
      var c = readInventory(b.getInventory())
      Object.keys(c).forEach(function (id) { total[id] = (total[id] || 0) + c[id] })
    })
    return total
  }

  // puts count items into the bus, one at a time slot after slot (the bits and the gauze stack to 16)
  function fillBus(bus, id, count) {
    var inv = bus.getInventory()
    var placed = 0
    for (var s = 0; s < inv.getSlots() && placed < count; s++) {
      while (placed < count && inv.insertItem(s, Item.of(id, 1), false).isEmpty()) placed++
    }
    if (placed !== count) throw new Error('could only insert ' + placed + ' of ' + count + ' ' + id)
  }

  function tankOf(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    return st.isEmpty() ? { id: 'none', amount: 0 } : { id: fluidIdOf(st), amount: Number(st.getAmount()) }
  }

  function setTank(hatch, id, amount) {
    // a FluidStack built by KubeJS: setFluidInTank ignores one built outside it
    if (amount <= 0) hatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
    else hatch.tank.setFluidInTank(0, Fluid.of(id, amount).getFluidStack())
  }

  function fluidsOfHatches(list) {
    var total = {}
    list.forEach(function (h) {
      var t = tankOf(h)
      if (t.amount > 0) total[t.id] = (total[t.id] || 0) + t.amount
    })
    return total
  }

  function clearHatches(list) {
    list.forEach(function (h) { setTank(h, null, 0) })
  }

  function setCircuit(m, n) {
    m.P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(n))
  }

  function wake(m) {
    try {
      m.ctrl.getRecipeLogic().updateTickSubscription()
    } catch (e) { /* the scenario reports what did not run */ }
  }

  function setVoiding(m, mode) {
    m.ctrl.setVoidingMode(lazy().VoidingMode[mode])
    wake(m)
  }

  function failureReasons(m) {
    try {
      return asArray(m.ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
    } catch (e) {
      return ['unreadable: ' + e]
    }
  }

  function state(m) {
    try {
      var rlg = m.ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() + ' last=' + (last ? last.id + ' x' + last.parallels : 'none') +
        ' voiding=' + m.ctrl.getVoidingMode()
    } catch (e) {
      return 'state unreadable: ' + e
    }
  }

  function idle(m) {
    return String(m.ctrl.getRecipeLogic().getStatus()) !== 'WORKING'
  }

  // every tick: the energy hatches full again (what they lost is what the machine used), the run observed
  function topUp(m) {
    m.P.energy.forEach(function (p) {
      var c = p.energyContainer
      var cap = Number(c.getEnergyCapacity())
      m.euUsed += cap - Number(c.getEnergyStored())
      c.setEnergyStored(cap)
    })
  }

  function observe(m) {
    var rlg = m.ctrl.getRecipeLogic()
    var last = rlg.getLastRecipe()
    if (String(rlg.getStatus()) !== 'WORKING' || last === null || last === undefined) return
    var o = m.obs
    o.seen[String(last.id)] = true
    var par = Number(last.parallels)
    if (par > o.maxPar) o.maxPar = par
    if (par !== o.fullPar) return
    var eut = euOf(last).eut
    if (eut < o.minEut) o.minEut = eut
    if (eut > o.maxEut) o.maxEut = eut
    var dur = Number(last.duration)
    if (dur < o.minDur) o.minDur = dur
  }

  // a new scenario: phase, start tick, EU mark, a fresh observation
  function mark(m, phase, fullPar) {
    m.phase = phase
    m.t0 = S.t
    m.euAt = m.euUsed
    m.obs = { seen: {}, maxPar: 0, fullPar: fullPar || 1, minEut: 1e12, maxEut: 0, minDur: 1e9 }
    wake(m)
  }

  function euSince(m) {
    return m.euUsed - m.euAt
  }

  function seenText(m) {
    return Object.keys(m.obs.seen).map(function (id) { return id.replace(/^grindless:[a-z_]+\//, '') }).join(',')
  }

  // ---------------------------------------------------------------- the drill (Venus and Mars)

  var DRILL_CAP = 128

  function drillText(m) {
    var o = m.obs
    return 'out=[' + itemSummary(outItems(m)) + '] steam=' + fluidsOfHatches(m.P.outHatches)[STEAM] + ' water=' + (m.P.inHatches.length > 0 ? tankOf(m.P.inHatches[0]).amount : 'no hatch') +
      ' bits left=' + (readInventory(m.P.inBus.getInventory())[BIT] || 0) + ' par<=' + o.maxPar + ' EU/t ' + (o.maxEut > 0 ? o.minEut + '..' + o.maxEut : '-') + ' dur ' +
      (o.minDur < 1e9 ? o.minDur : '-') + ' EU used ' + euSince(m) + ' ran [' + seenText(m) + '] | ' + state(m)
  }

  // a cycle's results against a drilling recipe: runs = stone, ores a run, the full-cycle EU/t and duration (one IV hatch: one overclock)
  function drilledProblems(m, recipe, stone, runs) {
    var o = m.obs
    var items = outItems(m)
    var got = items[stone] || 0
    var ores = 0
    Object.keys(items).forEach(function (id) { if (id !== stone) ores += items[id] })
    var problems = []
    if (o.seen[recipe] !== true) problems.push(recipe + ' never ran')
    var others = Object.keys(o.seen).filter(function (id) { return id !== recipe })
    if (others.length > 0) problems.push('other recipes ran: ' + others.join(','))
    if (o.maxPar !== DRILL_CAP) problems.push('parallels ' + o.maxPar)
    if (runs > 0 && got !== runs) problems.push(got + ' runs (stone), wanted ' + runs)
    if (runs === 0 && (got < DRILL_CAP || got % DRILL_CAP !== 0)) problems.push(got + ' runs (stone), wanted whole cycles of ' + DRILL_CAP)
    var ratio = got > 0 ? ores / got : 0
    if (ratio < 5.3 || ratio > 5.95) problems.push('ores a run ' + ratio.toFixed(3))
    if (o.minEut !== 4096 || o.maxEut !== 4096 || o.minDur !== 100) problems.push('cycle ' + o.minEut + '..' + o.maxEut + ' EU/t, ' + o.minDur + ' t (wanted 4096 x 100)')
    return { problems: problems, runs: got, ratio: ratio }
  }

  function drillVenusStep(m) {
    var age = S.t - m.t0
    var bus = m.P.inBus
    if (m.phase === 'begin') {
      clearInventory(bus.getInventory())
      fillBus(bus, SAMPLE_VENUS, 1)
      fillBus(bus, BIT, 140)
      setTank(m.P.inHatches[0], null, 0)
      clearHatches(m.P.outHatches)
      mark(m, 'no_water', DRILL_CAP)
      return
    }
    if (m.phase === 'no_water' && age >= HOLD_TICKS) {
      var none = Object.keys(outItems(m)).length === 0 && Object.keys(m.obs.seen).length === 0 && euSince(m) === 0
      check('drill_venus_PROCESS_no_water', none, 'sample and 140 bits, no water, ' + age + ' ticks: nothing runs (no dry recipe on Venus): ' + drillText(m))
      setTank(m.P.inHatches[0], WATER, DRILL_CAP * 200)
      mark(m, 'naquadah', DRILL_CAP)
      return
    }
    if (m.phase === 'naquadah') {
      var stone = outItems(m)[STONE_VENUS] || 0
      if (!(stone >= DRILL_CAP && idle(m)) && age < RUN_TIMEOUT) return
      var r = drilledProblems(m, DRILL_VENUS_ID, STONE_VENUS, DRILL_CAP)
      var steam = fluidsOfHatches(m.P.outHatches)[STEAM] || 0
      var water = tankOf(m.P.inHatches[0]).amount
      var bitsUsed = 140 - (readInventory(bus.getInventory())[BIT] || 0)
      if (steam !== DRILL_CAP * 1600) r.problems.push('steam ' + steam + ' (wanted ' + DRILL_CAP * 1600 + ')')
      if (water !== 0) r.problems.push('water left ' + water)
      if (bitsUsed > 3) r.problems.push('bits used ' + bitsUsed)
      if (euSince(m) !== 4096 * 100) r.problems.push('EU used ' + euSince(m) + ' (wanted ' + (4096 * 100) + ')')
      var raw = outItems(m)
      check('drill_venus_PROCESS_naquadah', r.problems.length === 0, 'one cycle of ' + r.runs + ' runs on the naquadah vein: ' + r.ratio.toFixed(3) + ' ores a run (naquadah ' +
        (raw['gtceu:raw_naquadah'] || 0) + ', plutonium ' + (raw['gtceu:raw_plutonium'] || 0) + '), ' + steam + ' mB of steam for ' + (DRILL_CAP * 200 - water) +
        ' mB of water, bits used ' + bitsUsed + '; ' + drillText(m) + (r.problems.length > 0 ? ' | problems: ' + r.problems.join('; ') : ''))
      m.phase = 'done'
    }
  }

  function drillMarsStep(m) {
    var age = S.t - m.t0
    if (m.phase === 'begin') {
      clearInventory(m.P.inBus.getInventory())
      fillBus(m.P.inBus, SAMPLE_MARS, 1)
      fillBus(m.P.inBus, BIT, 140)
      mark(m, 'scheelite', DRILL_CAP)
      return
    }
    if (m.phase === 'scheelite' && age >= 240) {
      var r = drilledProblems(m, DRILL_MARS_ID, STONE_MARS, 0)
      if (m.P.inHatches.length + m.P.outHatches.length !== 0) r.problems.push('built with hatches')
      check('drill_mars_PROCESS_scheelite', r.problems.length === 0, 'Mars, dry, no hatches: ' + r.runs + ' runs in ' + age + ' ticks, ' + r.ratio.toFixed(3) +
        ' ores a run; ' + drillText(m) + (r.problems.length > 0 ? ' | problems: ' + r.problems.join('; ') : ''))
      clearInventory(m.P.inBus.getInventory())
      m.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- the heat engine

  var ENGINE_EUT = 8192
  var ENGINE_TICKS = 400

  function batteryCharge(m) {
    var bb = machineAt(m.dim, m.bufferPos)
    return bb ? Number(bb.energyContainer.getEnergyStored()) : -1
  }

  function engineStep(m) {
    var age = S.t - m.t0
    if (m.phase === 'begin') {
      var dyn = m.partCells.filter(function (c) { return c.block.ability === 'energy_output' })[0]
      m.bufferPos = { x: dyn.x, y: dyn.y, z: dyn.z - 1 }
      if (cmd(m.dim, 'setblock ' + m.bufferPos.x + ' ' + m.bufferPos.y + ' ' + m.bufferPos.z + ' ' + BUFFER + '[facing=north] replace') < 1) {
        check('engine_PROCESS_eu', false, 'could not place the battery buffer at ' + JSON.stringify(m.bufferPos))
        m.phase = 'done'
        return
      }
      var inv = machineAt(m.dim, m.bufferPos).getBatteryInventory()
      for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.of(BATTERY))
      m.batteryStart = batteryCharge(m)
      setTank(m.P.inHatches[0], WATER, 400)
      clearHatches(m.P.outHatches)
      mark(m, 'eu', 1)
      return
    }
    if (m.phase === 'eu') {
      var water = tankOf(m.P.inHatches[0]).amount
      if (!(water === 0 && idle(m) && age > 2 * ENGINE_TICKS) && age < 2 * ENGINE_TICKS + RUN_TIMEOUT) return
      var charged = batteryCharge(m) - m.batteryStart
      var residual = Number(m.P.dynamo[0].energyContainer.getEnergyStored())
      var made = charged + residual
      var want = 2 * ENGINE_EUT * ENGINE_TICKS
      var steam = fluidsOfHatches(m.P.outHatches)[STEAM] || 0
      var problems = []
      if (!(charged > 0) || made !== want) problems.push(made + ' EU (wanted ' + want + ')')
      if (water !== 0) problems.push('water left ' + water)
      if (steam !== 64000) problems.push('steam ' + steam)
      if (m.obs.seen[ENGINE_ID] !== true) problems.push(ENGINE_ID + ' never ran')
      if (m.obs.maxPar !== 1) problems.push('parallels ' + m.obs.maxPar)
      check('engine_PROCESS_eu', problems.length === 0, 'two cycles on Venus: ' + charged + ' EU charged into 4 IV batteries of an IV battery buffer through an IV dynamo hatch, ' +
        residual + ' still in the hatch, total ' + made + ' (2 x ' + ENGINE_EUT + ' x ' + ENGINE_TICKS + ' = ' + want + '); 400 mB of water -> ' + steam + ' mB of steam; ' +
        state(m) + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      m.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- the acid works

  var RUN_EU = 45000

  function worksText(m) {
    var f = fluidsOfHatches(m.P.outHatches)
    return 'acid ' + tankOf(m.P.inHatches[0]).amount + ' mB, out water ' + (f[WATER] || 0) + ' oxygen ' + (f[OXYGEN] || 0) + ' SO2 ' + (f[SO2] || 0) + ', gauze ' +
      (readInventory(m.P.inBus.getInventory())[GAUZE] || 0) + ', EU used ' + euSince(m) + ', ran [' + seenText(m) + '] | ' + state(m)
  }

  function worksRuns(m, runs, recipe, so2) {
    var f = fluidsOfHatches(m.P.outHatches)
    var problems = []
    if ((f[WATER] || 0) !== runs * 1000 || (f[OXYGEN] || 0) !== runs * 1000) problems.push('water ' + (f[WATER] || 0) + ', oxygen ' + (f[OXYGEN] || 0))
    if ((f[SO2] || 0) !== so2) problems.push('SO2 ' + (f[SO2] || 0) + ' (wanted ' + so2 + ')')
    if (tankOf(m.P.inHatches[0]).amount !== 0) problems.push('acid left')
    if (euSince(m) !== runs * RUN_EU) problems.push(euSince(m) + ' EU (wanted ' + runs * RUN_EU + ')')
    if (recipe !== null && m.obs.seen[recipe] !== true) problems.push(recipe + ' never seen running')
    return problems
  }

  function worksStep(m) {
    var age = S.t - m.t0
    var acid = m.P.inHatches[0]
    if (m.phase === 'begin') {
      clearInventory(m.P.inBus.getInventory())
      fillBus(m.P.inBus, GAUZE, 4)
      setCircuit(m, 1)
      clearHatches(m.P.outHatches)
      setTank(acid, ACID, 3000)
      mark(m, 'mode1')
      return
    }
    if (m.phase === 'mode1') {
      if (!(tankOf(acid).amount === 0 && idle(m)) && age < RUN_TIMEOUT) return
      var p1 = worksRuns(m, 3, MODE1_ID, 0)
      var gauze = readInventory(m.P.inBus.getInventory())[GAUZE] || 0
      if (gauze < 3) p1.push('gauze ' + gauze)
      check('works_PROCESS_mode1', p1.length === 0, 'circuit 1, 3,000 mB of acid: ' + worksText(m) + (p1.length > 0 ? ' | problems: ' + p1.join('; ') : ''))
      clearHatches(m.P.outHatches)
      setCircuit(m, 2)
      setTank(acid, ACID, 2000)
      mark(m, 'mode2')
      return
    }
    if (m.phase === 'mode2') {
      if (!(tankOf(acid).amount === 0 && idle(m)) && age < RUN_TIMEOUT) return
      var p2 = worksRuns(m, 2, MODE2_ID, 2000)
      check('works_PROCESS_mode2', p2.length === 0, 'circuit 2, 2,000 mB of acid: ' + worksText(m) + (p2.length > 0 ? ' | problems: ' + p2.join('; ') : ''))
      // the cached recipe is circuit 2's: fluid voiding on, then acid
      m.before = fluidsOfHatches(m.P.outHatches)
      setVoiding(m, 'VOID_FLUIDS')
      setTank(acid, ACID, 1000)
      mark(m, 'no_voiding')
      return
    }
    if (m.phase === 'no_voiding' && age >= HOLD_TICKS) {
      var shown = failureReasons(m).some(function (r) { return NO_VOIDING.test(r) })
      var after = fluidsOfHatches(m.P.outHatches)
      var still = tankOf(acid).amount === 1000 && euSince(m) === 0 && (after[SO2] || 0) === (m.before[SO2] || 0)
      check('works_no_voiding', still && shown, 'circuit 2 cached, fluid voiding on, 1,000 mB of acid, ' + age + ' ticks: refusal shown=' + shown + ', reasons=[' +
        failureReasons(m).join(' ; ') + '], ' + worksText(m))
      setVoiding(m, 'VOID_NONE')
      mark(m, 'resumes')
      return
    }
    if (m.phase === 'resumes') {
      if (!(tankOf(acid).amount === 0 && idle(m)) && age < RUN_TIMEOUT) return
      var f = fluidsOfHatches(m.P.outHatches)
      var ok = tankOf(acid).amount === 0 && euSince(m) === RUN_EU && (f[SO2] || 0) === (m.before[SO2] || 0) + 1000
      check('works_resumes', ok, 'voiding off: one more circuit 2 run, SO2 ' + (m.before[SO2] || 0) + ' -> ' + (f[SO2] || 0) + ', ' + worksText(m))
      clearHatches(m.P.outHatches)
      setCircuit(m, 1)
      setVoiding(m, 'VOID_FLUIDS')
      setTank(acid, ACID, 1000)
      mark(m, 'mode1_voids')
      return
    }
    if (m.phase === 'mode1_voids') {
      if (!(tankOf(acid).amount === 0 && idle(m)) && age < RUN_TIMEOUT) return
      var ran = tankOf(acid).amount === 0 && euSince(m) === RUN_EU && m.obs.seen[MODE1_ID] === true
      check('works_mode1_voids', ran, 'circuit 1 with fluid voiding on: it runs (only circuit 2 keeps its fluids), ' + worksText(m))
      setVoiding(m, 'VOID_NONE')
      m.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- the gas collectors (GTM single blocks)

  function collectorText(c) {
    var t = c.machine ? tankOf({ tank: c.machine.exportFluids }) : { id: '?', amount: -1 }
    var status = '?'
    try {
      status = String(c.machine.getRecipeLogic().getStatus())
    } catch (e) { /* unreadable */ }
    return 'at Y ' + c.pos.y + ', circuit ' + c.circuit + ', output ' + t.amount + ' mB ' + t.id + ', status ' + status
  }

  function collectorCircuit(c, n) {
    c.circuit = n
    c.machine.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(n))
    c.machine.exportFluids.setFluidInTank(0, lazy().FluidStack.EMPTY)
    try {
      c.machine.getRecipeLogic().updateTickSubscription()
    } catch (e) { /* the check reports it */ }
    c.t0 = S.t
  }

  function collectorStep(c) {
    var age = S.t - c.t0
    if (c.phase === 'begin') {
      c.machine = machineAt(VENUS, c.pos)
      if (c.machine === null || c.machine === undefined) {
        check(c.key, false, 'no gas collector at ' + JSON.stringify(c.pos))
        c.phase = 'done'
        return
      }
      collectorCircuit(c, c.wrong)
      c.phase = 'wrong'
      return
    }
    if (c.phase === 'wrong' && age >= HOLD_TICKS) {
      c.wrongText = collectorText(c)
      c.wrongOk = tankOf({ tank: c.machine.exportFluids }).amount === 0
      collectorCircuit(c, c.right)
      c.phase = 'right'
      return
    }
    if (c.phase === 'right' && age >= 215) {
      var t = tankOf({ tank: c.machine.exportFluids })
      var ok = c.wrongOk && t.id === c.fluid && t.amount === 10000
      check(c.key, ok, c.label + ': circuit ' + c.wrong + ' for ' + HOLD_TICKS + ' ticks: ' + c.wrongText + '; circuit ' + c.right + ' for ' + age + ' ticks: ' + collectorText(c))
      c.phase = 'done'
    }
  }

  function topUpCollector(c) {
    if (!c.machine) return
    var e = c.machine.energyContainer
    e.setEnergyStored(e.getEnergyCapacity())
  }

  // ---------------------------------------------------------------- the multiblock jobs: place, settle, form, then their scenarios

  function stepMachine(m) {
    if (m.phase === 'done') return
    if (m.phase === 'settle') {
      if (S.t - m.t0 < 10) return
      if (!verifyPlaced(m)) {
        m.phase = 'done'
        return
      }
      m.phase = 'forming'
      m.t0 = S.t
      return
    }
    var ctrl = machineAt(m.dim, m.ctrlPos)
    if (ctrl === null || ctrl === undefined) {
      check(m.key + '_FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }
    m.ctrl = ctrl
    if (m.phase === 'forming') {
      var waited = S.t - m.t0
      if (ctrl.isFormed()) {
        check(m.key + '_FORMED', true, (m.forced ? 'after a forced check' : 'by itself after ' + waited + ' ticks') + ', parts=' + asArray(ctrl.getParts()).length)
        m.P = findParts(ctrl)
        var problems = []
        Object.keys(m.counts).forEach(function (ability) {
          var n = { energy_input: m.P.energy.length, energy_output: m.P.dynamo.length, input_bus: m.P.inBus ? 1 : 0, output_bus: m.P.outBuses.length,
            input_hatch: m.P.inHatches.length, output_hatch: m.P.outHatches.length }[ability]
          if (n !== m.counts[ability]) problems.push(ability + ' ' + n + ' (placed ' + m.counts[ability] + ')')
        })
        check(m.key + '_PARTS', problems.length === 0, '[' + m.P.ids.join(' ') + ']' + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
        if (problems.length > 0) {
          m.phase = 'done'
          return
        }
        m.euUsed = 0
        m.active = true
        m.phase = 'begin'
        m.t0 = S.t
        return
      }
      if (waited >= FORM_TIMEOUT) {
        if (m.forced || !ctrl.checkPatternWithLock()) {
          check(m.key + '_FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(m, ctrl))
          m.phase = 'done'
          return
        }
        note(m.key + '_FORM_FORCED', 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
        ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
        ctrl.onStructureFormed()
        m.forced = true
      }
      return
    }
    try {
      m.step(m)
    } catch (e) {
      check(m.key + '_PROCESS', false, 'exception in phase ' + m.phase + ': ' + e)
      m.phase = 'done'
    }
    if (m.phase === 'done') m.active = false
  }

  // ---------------------------------------------------------------- the world: the band of each planet, measured, a slab, cleared above

  // the highest non-air block of a column, scanning down from the sky
  function groundAt(dim, x, z) {
    for (var y = 318; y > -64; y--) {
      if (!/air$/.test(blockIdAt(dim, x, y, z))) return y
    }
    return -64
  }

  function prepareSite(dim) {
    var level = levelOf(dim)
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) level.getChunk(cx, cz)
    }
    cmd(dim, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var heights = []
    for (var x = BAND.x0; x <= BAND.x1; x += 7) {
      for (var z = BAND.z0; z <= BAND.z1; z += 5) heights.push(groundAt(dim, x, z))
    }
    var top = Math.max.apply(null, heights)
    var low = Math.min.apply(null, heights)
    var mid = groundAt(dim, (BAND.x0 + BAND.x1) >> 1, (BAND.z0 + BAND.z1) >> 1)
    var base = top + 2
    var slab = cmd(dim, 'fill ' + BAND.x0 + ' ' + (base - 1) + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + (base - 1) + ' ' + BAND.z1 + ' minecraft:stone replace')
    var cleared = cmd(dim, 'fill ' + BAND.x0 + ' ' + base + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + (base + CLEAR_ABOVE) + ' ' + BAND.z1 + ' air')
    note('SURFACE_' + (dim === VENUS ? 'venus' : 'mars'), dim + ' band X ' + BAND.x0 + '-' + BAND.x1 + ' Z ' + BAND.z0 + '-' + BAND.z1 + ': ground Y ' + low + '..' + top +
      ' over ' + heights.length + ' columns (middle Y ' + mid + '); stone slab at Y ' + (base - 1) + ' (' + slab + ' blocks), structures from Y ' + base +
      ', cleared Y ' + base + '..' + (base + CLEAR_ABOVE) + ' (' + cleared + ' blocks)')
    return base
  }

  function startMachine(spec, base) {
    var m = { key: spec.key, id: spec.id, dim: spec.dim, x: spec.x, z: spec.z, base: base, counts: spec.counts, front: spec.front || [], step: spec.step,
      phase: 'settle', t0: S.t, forced: false, active: false, euUsed: 0, euAt: 0, obs: { seen: {}, maxPar: 0, fullPar: 1, minEut: 1e12, maxEut: 0, minDur: 1e9 } }
    S.machines.push(m)
    try {
      place(m)
    } catch (e) {
      check(m.key + '_PLACED', false, 'exception: ' + e)
      m.phase = 'done'
    }
    return m
  }

  function startCollector(key, label, y, wrong, right, fluid) {
    var c = { key: key, label: label, pos: { x: 0, y: y, z: 4 }, wrong: wrong, right: right, fluid: fluid, phase: 'begin', t0: S.t, machine: null, circuit: 0 }
    c.pos.x = key === 'collector_low' ? 11300 : 11302
    if (cmd(VENUS, 'setblock ' + c.pos.x + ' ' + y + ' ' + c.pos.z + ' ' + COLLECTOR + '[facing=north] replace') < 1) {
      check(key, false, 'could not place ' + COLLECTOR + ' at Y ' + y)
      c.phase = 'done'
    }
    S.collectors.push(c)
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      S.sites.forEach(function (s) {
        cmd(s.dim, 'fill ' + BAND.x0 + ' ' + (s.base - 1) + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + (s.base + CLEAR_ABOVE) + ' ' + BAND.z1 + ' air')
        cmd(s.dim, 'forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      })
      cmd(VENUS, 'setblock 11302 ' + CLOUD_Y + ' 4 air')
    } catch (e) {
      note('CLEANUP', 'exception: ' + e)
    }
    console.info(TAG + SCOPE + '|DONE')
  }

  function onTick(server) {
    if (S === null || S.finished) return
    S.t = server.getTickCount() - S.tick0
    try {
      S.machines.forEach(function (m) {
        if (!m.active) return
        topUp(m)
        observe(m)
      })
      S.collectors.forEach(topUpCollector)
      if (S.t % STEP === 0) {
        S.machines.forEach(stepMachine)
        S.collectors.forEach(function (c) { if (c.phase !== 'done') collectorStep(c) })
      }
    } catch (e) {
      check('STEP', false, 'exception: ' + e)
      S.machines.forEach(function (m) { m.phase = 'done' })
      S.collectors.forEach(function (c) { c.phase = 'done' })
    }
    if (S.machines.every(function (m) { return m.phase === 'done' }) && S.collectors.every(function (c) { return c.phase === 'done' })) finish()
  }

  function run(server) {
    S = { server: server, venus: server.getLevel(VENUS), mars: server.getLevel(MARS), t: 0, tick0: server.getTickCount(), machines: [], collectors: [], sites: [],
      finished: false }
    if (!S.venus || !S.mars) {
      check('run', false, 'no level ' + (!S.venus ? VENUS : MARS))
      finish()
      return
    }
    try {
      staticChecks()
    } catch (e) {
      check('static', false, 'exception: ' + e)
    }
    var venusBase = prepareSite(VENUS)
    var marsBase = prepareSite(MARS)
    S.sites.push({ dim: VENUS, base: venusBase })
    S.sites.push({ dim: MARS, base: marsBase })
    startMachine({ key: 'drill_venus', id: DRILL, dim: VENUS, x: 11268, z: 2, step: drillVenusStep,
      counts: { energy_input: 1, input_bus: 1, output_bus: 1, input_hatch: 1, output_hatch: 1 } }, venusBase)
    startMachine({ key: 'engine', id: ENGINE, dim: VENUS, x: 11278, z: 3, step: engineStep, front: ['energy_output'],
      counts: { energy_output: 1, input_hatch: 1, output_hatch: 1 } }, venusBase)
    startMachine({ key: 'works', id: WORKS, dim: VENUS, x: 11292, z: 2, step: worksStep,
      counts: { energy_input: 1, input_bus: 1, input_hatch: 1, output_hatch: 3 } }, venusBase)
    startMachine({ key: 'drill_mars', id: DRILL, dim: MARS, x: 11268, z: 2, step: drillMarsStep,
      counts: { energy_input: 1, input_bus: 1, output_bus: 1, input_hatch: 0, output_hatch: 0 } }, marsBase)
    var cloudBase = global.grindless.venus.cloudBase
    if (venusBase >= cloudBase) note('collector_low', 'the band\'s ground reaches the clouds (structures from Y ' + venusBase + ', cloud base ' + cloudBase + ')')
    startCollector('collector_low', 'below the clouds (CO2)', venusBase, 5, 4, CO2)
    startCollector('collector_clouds', 'in the clouds (sulfuric acid)', CLOUD_Y, 4, 5, ACID)
  }

  function startIfRequested(server) {
    if (global[REQUEST] !== true || (S !== null && !S.finished)) return
    global[REQUEST] = false
    try {
      run(server)
    } catch (e) {
      check('run', false, 'exception: ' + e)
      finish()
    }
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick(event.server)
  })

  ServerEvents.customCommand('gg_test_venus', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_venus run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
