// priority: -7639
// Gregtech Grindless - smoke test of package IV-B4, tritium-removal (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack): the Tritium Removal Facility (gtceu:tritium_removal_facility, type gtceu:detritiation),
// startup_scripts/grindless/iv/tritium_removal.js and server_scripts/grindless/iv/tritium_removal.js.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_tritium_removal;;kubejs custom_command gg_test_recipe_lookup;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|tritium_removal\|DONE@@900;;GGTEST\|lookup\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|tritium_removal|<check>|PASS|FAIL|NOTE|<detail>; the last line is GGTEST|tritium_removal|DONE.
//   static (no world)
//     shared_ids          the four fluids (IV-A1's tritiated heavy water and heavy water, GTM's deuterium and tritium) and the blocks and
//                         items of the structure and the controller recipe exist
//     registration        gtceu:tritium_removal_facility on its own type gtceu:detritiation (0 items, 2 fluids in and out), not a
//                         generator, its modifier run before every recipe, with a structure description
//     hazard              GTM's hazard property on tritium and on the tritiated heavy water (why fluid voiding is refused)
//     recipe              the type's only recipe, grindless:detritiation/tritiated_heavy_water, live: 1,000 mB tritiated heavy water
//                         consumed and 100 mB deuterium at chance 0 (not consumed) -> 900 mB heavy water + 200 mB tritium, no items,
//                         6,880 EU/t x 16 t, exactly one condition (the Moon, not reversed), the night EU/t 3,440 in its data
//     energy              the published stages: GTM's live vacuum_freezer/liquid_oxygen gives 46,080 EU per 1,000 mB; GTM's
//                         centrifuge/deuterium_separation is gone (IV-A1) and its 12,800 EU per 40 mB of tritium is the published figure;
//                         110,080 EU in all, paid exactly at an IV EU/t, and the night price is exactly half
//     night_info          the type's EMI data line reads the night EU/t
//     sun_curve           the facility's sunIsDown: the sun is down from day time 12,786 to 23,214 (the cryogenic plant's)
//     controller_recipe   grindless:crafting/tritium_removal_facility gives the controller from its parts (the cryogenic plant and GTM's EV
//                         electrolyzer among them)
//     tritium_balance     NOTE: the reactor's heavy-water cores against this recipe: tritium an hour from a full reactor
//   in the world (band X 12032-12095, Z 0-15: the Moon at Y 198-214, or above its ground if that is higher; the Overworld at Y 98-112
//   with a roof at Y 112)
//     <copy>_PLACED / _FORMED / _PARTS   for the two copies below
//     moon_ground         NOTE: the highest ground under the Moon band, and the Y the facility is built at
//     RADIATORS           the 12 cells the modifier probes (global radiatorCells) are the 12 radiators placed, and all see the sky
//     DAY_RUN             time set 6000: 1,000 mB tritiated heavy water -> exactly 900 mB heavy water + 200 mB tritium, nothing left,
//                         6,880 EU/t x 16 t, exactly 110,080 EU drawn; the controller said the sun is up
//     NIGHT_RUN           time set 18000, every radiator open: the same outputs, 3,440 EU/t x 16 t, exactly 55,040 EU drawn
//     NIGHT_HALF          the night run drew exactly half the day run's EU
//     CARRIER_KEPT        the 100 mB of deuterium is still in its hatch after both runs
//     NO_VOIDING          set to void fluids in the tick the night run ends and refilled at once (GTM's cached-recipe restart, which
//                         skips the modifier): nothing runs for 60 ticks, nothing is used, no EU, and the refusal is shown
//     RESUMES             voiding off: one more run, the same outputs, priced by the sky it starts in
//     REFUSES_ON_EARTH    copy earth (the Overworld): loaded the same, nothing runs in 120 ticks, nothing is used, GTM's conditions fail,
//                         and the controller says it only works on the Moon
//
// Copies (controllers face north at z 2, the structures behind them, z 2-4, x 12037-12043):
//   moon   the facility on the Moon, rows from Y 199 (controller Y 200, radiators Y 206, roof Y 211) unless the ground is higher
//   earth  the facility in the Overworld, rows from Y 98 (controller Y 99)
// Parts (the lowest ring): the back row, left to right as seen from the front: the feed hatch (tritiated heavy water), the IV energy
// hatch, the carrier hatch (deuterium); the two side cells of the middle slice: the two output hatches. The front cells stay casing.
// TEST AREA: this test force-loads, clears and builds ONLY its band in each dimension (AGENTS.md: tests run at the same time in one
// server), and clears and releases it at the end. It also sets the time of day (one clock for every dimension) and puts it back at the
// end: do not run it in the same server as tests that need a given time of day (gg_test_observatory, gg_test_lv_content, gg_test_moon,
// gg_test_cryogenic_plant). The tritiated heavy water and the deuterium are injected: the reactor and the heavy-water plant are other
// packages' (and their own tests').
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'tritium_removal'
  var BAND = { x0: 12032, x1: 12095, z0: 0, z1: 15 }
  var EARTH = 'minecraft:overworld'
  var LUNA = 'gcyr:luna'
  var BAND_Y = {}
  BAND_Y[EARTH] = [98, 112]
  BAND_Y[LUNA] = [198, 214]
  var ROOF_Y = 112
  var STEP = 10
  var FORM_TIMEOUT = 600
  var HOLD_TICKS = 60
  var EARTH_HOLD = 120
  var RUN_TIMEOUT = 300
  var SETTLE_TICKS = 5
  var TEST_TIMEOUT = 4000

  // the command only leaves a request in `global` (it survives script reloads); the tick handler starts the test once these scripts have
  // been loaded for QUIET_MS (same as the other tests)
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestTritiumRemovalRequest'

  var MACHINE = 'gtceu:tritium_removal_facility'
  var TYPE = 'gtceu:detritiation'
  var RECIPE_ID = 'grindless:detritiation/tritiated_heavy_water'
  var CRAFTING = 'grindless:crafting/tritium_removal_facility'
  var FREEZER_STAGE = 'gtceu:vacuum_freezer/liquid_oxygen'
  var REMOVED_STAGE = 'gtceu:centrifuge/deuterium_separation'

  var THW = 'gtceu:tritiated_heavy_water'
  var HW = 'gtceu:heavy_water'
  var D = 'gtceu:deuterium'
  var T = 'gtceu:tritium'
  var SHARED_FLUIDS = [THW, HW, D, T]
  var SHARED_ITEMS = [MACHINE, 'grindless:night_sky_radiator', 'grindless:sintered_regolith', 'gtceu:frostproof_machine_casing', 'gtceu:titanium_pipe_casing',
    'gtceu:cryogenic_plant', 'gtceu:ev_electrolyzer', 'gtceu:iv_electric_pump', 'gtceu:iv_machine_hull']

  // the design (docs/eras/iv.md, "Tritium removal facility", and the package statement)
  var WANT = { feed: 1000, carrier: 100, heavyWater: 900, tritium: 200, eut: 6880, duration: 16, energy: 110080, nightEut: 3440, nightEnergy: 55040,
    separation: 64000, liquefaction: 46080, maxEut: 7680 }
  var DAY_TIME = 6000
  var NIGHT_TIME = 18000
  var NIGHT_FROM = 12786
  var NIGHT_TO = 23214
  var RADIATOR = 'grindless:night_sky_radiator'
  var RADIATOR_COUNT = 12

  var NO_VOIDING = /grindless\.machine\.tritium_removal_facility\.no_voiding|Turn fluid voiding off/
  var NOT_MOON = /grindless\.machine\.tritium_removal_facility\.not_moon|only works on the Moon/
  var SKY_DAY = /tritium_removal_facility\.sky\.day|sun is up/
  var SKY_NIGHT = /tritium_removal_facility\.sky\.night|costs half/
  var CARRIER_OK = /tritium_removal_facility\.carrier\.ok|never used up/

  var ROLE_BLOCKS = {
    feed: 'gtceu:iv_input_hatch',
    carrier: 'gtceu:iv_input_hatch',
    energy: 'gtceu:iv_energy_input_hatch',
    out1: 'gtceu:iv_output_hatch',
    out2: 'gtceu:iv_output_hatch'
  }
  var OUTS = ['out1', 'out2']
  // parts: 'slice,row,column' of the description -> role
  var PARTS_AT = { '0,1,2': 'feed', '0,1,3': 'energy', '0,1,4': 'carrier', '1,1,2': 'out1', '1,1,4': 'out2' }
  var COPIES = [
    { key: 'moon', dim: LUNA, x: 12040, z: 2, y0: 199 },
    { key: 'earth', dim: EARTH, x: 12040, z: 2, y0: 98 }
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
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        VoidingMode: Java.loadClass('com.gregtechceu.gtceu.api.machine.feature.IVoidable$VoidingMode'),
        GTMaterials: Java.loadClass('com.gregtechceu.gtceu.common.data.GTMaterials'),
        PropertyKey: Java.loadClass('com.gregtechceu.gtceu.api.data.chemical.material.properties.PropertyKey')
      }
    }
    return classes
  }

  function TRF() {
    return global.grindless.tritiumRemoval || {}
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

  function short(id) {
    return String(id).replace(/^(gtceu|grindless|minecraft):/, '')
  }

  function at(p) {
    return p.x + ',' + p.y + ',' + p.z
  }

  function fluidName(stack) {
    try {
      return String(lazy().Registries.FLUIDS.getKey(stack.getFluid()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
  }

  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }

  function inputEUt(recipe) {
    var io = lazy().RecipeHelper.getRealEUtWithIO(recipe)
    if (io.isEmpty()) return 0
    return io.isInput() ? Number(io.getTotalEU()) : -Number(io.getTotalEU())
  }

  // the fluid contents of one side, with their chance (RecipeHelper keeps the order of the contents): [{ id, amount, chance, maxChance }]
  function fluidContents(recipe, input) {
    var c = lazy()
    var contents = asArray(input ? recipe.getInputContents(c.FluidCap) : recipe.getOutputContents(c.FluidCap))
    var stacks = asArray(input ? c.RecipeHelper.getInputFluids(recipe) : c.RecipeHelper.getOutputFluids(recipe))
    return stacks.map(function (st, i) {
      return { id: fluidName(st), amount: Number(st.getAmount()), chance: Number(contents[i].chance), maxChance: Number(contents[i].maxChance) }
    })
  }

  function dimensionOfCondition(c) {
    var d = c.getDimension()
    try {
      return String(d.location())
    } catch (e) {
      return String(d)
    }
  }

  // ---------------------------------------------------------------- the sun (the facility's own published function)

  // the smallest t in (lo, hi] for which pred(t) holds, given pred(lo) false and pred(hi) true
  function firstTrue(pred, lo, hi) {
    while (hi - lo > 1) {
      var mid = Math.floor((lo + hi) / 2)
      if (pred(mid)) hi = mid
      else lo = mid
    }
    return hi
  }

  function sunDown(t) {
    return TRF().sunIsDown(t) === true
  }

  // ---------------------------------------------------------------- static checks

  function sharedIdsPresent() {
    var missing = SHARED_ITEMS.filter(function (id) { return !Item.exists(id) })
      .concat(SHARED_FLUIDS.filter(function (id) { return !Fluid.exists(id) }))
    check('shared_ids', missing.length === 0, missing.length === 0 ? SHARED_FLUIDS.length + ' fluids and ' + SHARED_ITEMS.length +
      ' blocks and items exist' : 'missing: ' + missing.join(', '))
    return missing.length === 0
  }

  function registration() {
    var c = lazy()
    var problems = []
    var def = GTRegistries.MACHINES.get(rl(MACHINE))
    if (def === null || def === undefined) throw new Error(MACHINE + ' is not registered')
    var types = []
    var arr = def.getRecipeTypes()
    for (var i = 0; i < arr.length; i++) types.push(String(arr[i].registryName))
    if (types.join(',') !== TYPE) problems.push('types ' + types.join(','))
    if (def.isGenerator() !== false) problems.push('isGenerator=' + def.isGenerator())
    if (def.isAlwaysTryModifyRecipe() !== true) problems.push('the modifier is not run before every recipe')
    if (!global.grindless.patterns.describe(MACHINE)) problems.push('no structure description')
    var type = GTRegistries.RECIPE_TYPES.get(rl(TYPE))
    var sizes = 'none'
    if (type) {
      sizes = [type.getMaxInputs(c.ItemCap), type.getMaxOutputs(c.ItemCap), type.getMaxInputs(c.FluidCap), type.getMaxOutputs(c.FluidCap)]
        .map(function (n) { return Number(n) }).join('/')
    }
    if (sizes !== '0/0/2/2') problems.push(TYPE + ' sizes ' + sizes)
    var t = TRF()
    if (t.machine !== MACHINE || t.recipeType !== TYPE || t.dimension !== LUNA || !t.carrier || t.carrier.id !== D || t.carrier.amount !== WANT.carrier) {
      problems.push('published ' + [t.machine, t.recipeType, t.dimension, JSON.stringify(t.carrier)].join(', '))
    }
    if (!global.grindless.noVoiding || typeof global.grindless.noVoiding.beforeWorking !== 'function') problems.push('lib/no_voiding.js is not loaded')
    check('registration', problems.length === 0, MACHINE + ': types=[' + types.join(',') + '] generator=' + def.isGenerator() + ' alwaysTryModifyRecipe=' +
      def.isAlwaysTryModifyRecipe() + ', ' + TYPE + ' items in/out, fluids in/out ' + sizes + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  function hazard() {
    var c = lazy()
    var lines = []
    var bad = []
    ;['tritium', 'tritiated_heavy_water'].forEach(function (name) {
      var mat = c.GTMaterials.get(name)
      var has = mat !== null && mat !== undefined && !mat.isNull() && mat.hasProperty(c.PropertyKey.HAZARD)
      var what = 'none'
      if (has) {
        try {
          var p = mat.getProperty(c.PropertyKey.HAZARD)
          what = String(p.condition.name) + ' via ' + String(p.hazardTrigger.name())
        } catch (e) {
          what = 'present (' + e + ')'
        }
      }
      lines.push(name + ': ' + what)
      if (!has) bad.push(name)
    })
    check('hazard', bad.length === 0, lines.join('; ') + (bad.length > 0 ? ' | no hazard on ' + bad.join(', ') : ''))
  }

  function recipeCheck() {
    var problems = []
    var type = GTRegistries.RECIPE_TYPES.get(rl(TYPE))
    var all = type ? asArray(S.server.getRecipeManager().getAllRecipesFor(type)).map(function (r) { return String(r.getId()) }) : []
    if (all.length !== 1 || all[0] !== RECIPE_ID) problems.push(TYPE + ' holds [' + all.join(', ') + ']')
    var r = liveRecipe(RECIPE_ID)
    if (r === null) throw new Error(RECIPE_ID + ' is not in the recipe manager')
    var fin = fluidContents(r, true)
    var fout = fluidContents(r, false)
    var consumed = fin.filter(function (f) { return f.chance >= f.maxChance })
    var kept = fin.filter(function (f) { return f.chance === 0 })
    if (fin.length !== 2 || consumed.length !== 1 || consumed[0].id !== THW || consumed[0].amount !== WANT.feed) problems.push('fluids in ' + JSON.stringify(fin))
    if (kept.length !== 1 || kept[0].id !== D || kept[0].amount !== WANT.carrier) problems.push('carrier ' + JSON.stringify(kept))
    var outs = {}
    fout.forEach(function (f) {
      outs[f.id] = f.amount
      if (f.chance < f.maxChance) problems.push('chanced output ' + f.id)
    })
    if (fout.length !== 2 || outs[HW] !== WANT.heavyWater || outs[T] !== WANT.tritium) problems.push('fluids out ' + JSON.stringify(fout))
    var itemsIn = asArray(r.getInputContents(lazy().ItemCap)).length
    var itemsOut = asArray(r.getOutputContents(lazy().ItemCap)).length
    if (itemsIn !== 0 || itemsOut !== 0) problems.push('items in/out ' + itemsIn + '/' + itemsOut)
    var eut = inputEUt(r)
    if (eut !== WANT.eut || Number(r.duration) !== WANT.duration) problems.push(eut + ' EU/t x ' + r.duration + ' t')
    var dims = []
    var others = []
    asArray(r.conditions).forEach(function (cond) {
      if (cond.getDimension) dims.push(dimensionOfCondition(cond) + (cond.isReverse() ? ' (reversed)' : ''))
      else others.push(String(cond))
    })
    if (dims.length !== 1 || dims[0] !== LUNA) problems.push('dimension conditions [' + dims.join(', ') + ']')
    if (others.length > 0) problems.push('other conditions [' + others.join(', ') + ']')
    var night = Number(r.data.getInt(TRF().nightKey || 'grindless_night_eut'))
    if (night !== WANT.nightEut) problems.push('night EU/t ' + night)
    check('recipe', problems.length === 0, RECIPE_ID + ': ' + consumed.map(function (f) { return f.amount + ' mB ' + short(f.id) }).join(' + ') + ' (+ ' +
      kept.map(function (f) { return f.amount + ' mB ' + short(f.id) + ' at chance 0' }).join(', ') + ') -> ' +
      fout.map(function (f) { return f.amount + ' mB ' + short(f.id) }).join(' + ') + ', ' + eut + ' EU/t x ' + r.duration + ' t = ' + (eut * Number(r.duration)) +
      ' EU, dimension [' + dims.join(', ') + '], night ' + night + ' EU/t' + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  function energy() {
    var problems = []
    var run = TRF().run || {}
    var stages = run.stages || []
    var byName = {}
    stages.forEach(function (s) { byName[s.stage] = s })
    var sep = byName.separation
    var liq = byName.liquefaction
    if (!sep || sep.from !== REMOVED_STAGE || sep.total !== WANT.separation) problems.push('separation ' + JSON.stringify(sep))
    if (!liq || liq.from !== FREEZER_STAGE || liq.total !== WANT.liquefaction || liq.amount !== WANT.carrier) problems.push('liquefaction ' + JSON.stringify(liq))
    // the freezer's own recipe, read live: its EU per 1,000 mB of oxygen
    var fr = liveRecipe(FREEZER_STAGE)
    var frText = 'missing'
    if (fr === null) {
      problems.push(FREEZER_STAGE + ' missing')
    } else {
      // its only fluid input is the forge:oxygen tag, 1,000 mB (the amount is what counts here)
      var ins = fluidContents(fr, true)
      var perK = ins.length === 1 ? inputEUt(fr) * Number(fr.duration) * 1000 / ins[0].amount : -1
      frText = inputEUt(fr) + ' EU/t x ' + fr.duration + ' t for ' + (ins.length === 1 ? ins[0].amount + ' mB ' + short(ins[0].id) : ins.length + ' inputs') + ' = ' +
        perK + ' EU per 1,000 mB'
      if (!liq || perK !== liq.eu * 1000 / liq.per) problems.push('the freezer gives ' + perK + ' EU per 1,000 mB, the stage says ' + (liq ? liq.eu * 1000 / liq.per : '?'))
    }
    var removed = liveRecipe(REMOVED_STAGE) === null
    if (!removed) problems.push(REMOVED_STAGE + ' is still in the recipe manager (IV-A1 removes it: tritium only through this facility)')
    if (run.sourceEnergy !== WANT.energy || run.energy !== WANT.energy || run.eut !== WANT.eut || run.duration !== WANT.duration) {
      problems.push('price ' + run.sourceEnergy + ' EU of stages, ' + run.eut + ' EU/t x ' + run.duration + ' t = ' + run.energy)
    }
    if (!(run.eut <= WANT.maxEut && run.eut > 2048)) problems.push(run.eut + ' EU/t is not an IV EU/t')
    if (run.nightEut * 2 !== run.eut || run.nightEnergy * 2 !== run.energy) problems.push('night ' + run.nightEut + ' EU/t, ' + run.nightEnergy + ' EU')
    check('energy', problems.length === 0, 'stages: separation ' + (sep ? sep.eu + ' EU per ' + sep.per + ' mB of tritium (' + REMOVED_STAGE + ', ' +
      (removed ? 'removed by IV-A1' : 'present') + ') x ' + sep.amount + ' mB = ' + sep.total : '?') + ', liquefaction ' + (liq ? liq.eu + ' EU per ' + liq.per +
      ' mB (live ' + FREEZER_STAGE + ': ' + frText + ') x ' + liq.amount + ' mB of carrier = ' + liq.total : '?') + ', in all ' + run.sourceEnergy +
      ' EU, spent as ' + run.eut + ' EU/t x ' + run.duration + ' t = ' + run.energy + ' EU; night ' + run.nightEut + ' EU/t = ' + run.nightEnergy + ' EU' +
      (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  // the type's EMI line (GTRecipeType#addDataInfo): on a server without the lang files it gives the translation key, never ''
  function nightInfo() {
    var type = GTRegistries.RECIPE_TYPES.get(rl(TYPE))
    var r = liveRecipe(RECIPE_ID)
    if (!type || r === null) throw new Error((type ? RECIPE_ID : TYPE) + ' is missing')
    var infos = asArray(type.getDataInfos())
    var text = infos.length > 0 ? String(infos[0].apply(r.data)) : ''
    check('night_info', infos.length === 1 && text !== '', TYPE + ' has ' + infos.length + ' EMI data line(s); for ' + RECIPE_ID + ' (data ' + r.data +
      ') it reads "' + text + '"')
  }

  function sunCurve() {
    if (typeof TRF().sunIsDown !== 'function') throw new Error('global.grindless.tritiumRemoval.sunIsDown is not published')
    var from = firstTrue(sunDown, DAY_TIME, NIGHT_TIME)
    var to = firstTrue(function (t) { return !sunDown(t) }, NIGHT_TIME, DAY_TIME + 24000) - 1
    var shared = global.grindless.cryogenicPlant && typeof global.grindless.cryogenicPlant.sunIsDown === 'function'
    check('sun_curve', from === NIGHT_FROM && to === NIGHT_TO && !sunDown(DAY_TIME) && sunDown(NIGHT_TIME), 'the facility\'s sunIsDown (' +
      (shared ? 'the cryogenic plant\'s' : 'its own copy') + '): night from day time ' + from + ' to ' + to + ' (wanted ' + NIGHT_FROM + ' to ' + NIGHT_TO + '), ' +
      DAY_TIME + ' is ' + (sunDown(DAY_TIME) ? 'night' : 'day') + ', ' + NIGHT_TIME + ' is ' + (sunDown(NIGHT_TIME) ? 'night' : 'day'))
  }

  function controllerRecipe() {
    var r = liveRecipe(CRAFTING)
    if (r === null) throw new Error(CRAFTING + ' missing')
    var res = r.getResultItem(S.server.registryAccess())
    var made = String(res.getId()) + ' x' + res.getCount()
    var ids = {}
    var slots = 0
    asArray(r.getIngredients()).forEach(function (ing) {
      // KubeJS hides vanilla Ingredient#getItems; its IngredientKJS gives the item ids
      var list = asArray(ing.getItemIds()).map(String).filter(function (id) { return id !== 'minecraft:air' })
      if (list.length > 0) slots++
      list.forEach(function (id) { ids[String(id)] = true })
    })
    var missing = (TRF().craftingParts || []).filter(function (id) { return id !== MACHINE && !ids[id] })
    check('controller_recipe', made === MACHINE + ' x1' && missing.length === 0 && slots === 9, CRAFTING + ' makes ' + made + ' from ' + slots +
      ' ingredients [' + Object.keys(ids).map(short).join(', ') + '] (the four circuit slots take #gtceu:circuits/iv)' +
      (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''))
  }

  function tritiumBalance() {
    var FR = global.grindless.fissionReactor || {}
    var run = TRF().run || {}
    var heavy = (FR.cores || []).filter(function (c) { return c.moderator && c.moderator.becomes === THW })
    if (heavy.length === 0 || !(FR.cycleTicks > 0) || !(FR.channels > 0)) {
      note('tritium_balance', 'the reactor\'s heavy-water cores are not published (global.grindless.fissionReactor): nothing to compare')
      return
    }
    var perCycle = heavy[0].moderator.amount
    var perChannelHour = perCycle * 72000 / FR.cycleTicks
    var full = perChannelHour * FR.channels
    var runs = full / run.feed.amount
    note('tritium_balance', 'heavy-water cores [' + heavy.map(function (c) { return c.name + ' ' + c.moderator.amount + ' mB' }).join(', ') + '] per channel and ' +
      FR.cycleTicks + '-tick cycle: ' + perChannelHour + ' mB/h a channel, ' + full + ' mB/h from a full reactor (' + FR.channels + ' channels) = ' + runs +
      ' runs an hour -> ' + (runs * run.tritium.amount) + ' mB of tritium and ' + (runs * run.heavyWater.amount) + ' mB of heavy water back (make-up ' +
      (full - runs * run.heavyWater.amount) + ' mB/h), ' + (runs * run.duration) + ' ticks of work, ' + (runs * run.energy) + ' EU by day or ' +
      (runs * run.nightEnergy) + ' EU at night an hour')
  }

  function staticChecks() {
    safely('registration', registration)
    safely('hazard', hazard)
    safely('recipe', recipeCheck)
    safely('energy', energy)
    safely('night_info', nightInfo)
    safely('sun_curve', sunCurve)
    safely('controller_recipe', controllerRecipe)
    safely('tritium_balance', tritiumBalance)
  }

  // ---------------------------------------------------------------- the world

  function levelOf(dim) {
    return dim === LUNA ? S.moon : S.earth
  }

  // a command run in a dimension's level (setblock, fill and forceload act on the dimension they run in)
  function cmd(dim, text) {
    return S.server.runCommandSilent('execute in ' + dim + ' run ' + text)
  }

  function blockIdAt(dim, x, y, z) {
    return String(levelOf(dim).getBlock(x, y, z).getId())
  }

  function isAir(id) {
    return id === 'minecraft:air' || id === 'minecraft:void_air' || id === 'minecraft:cave_air'
  }

  // the highest ground under the Moon band: a grid of columns, from Y 300 down. The facility goes on the band (Y 199) unless the ground
  // reaches it; then it goes two blocks above the ground, and the cleared range moves with it.
  function moonGround() {
    var top = -1
    var columns = 0
    var withGround = 0
    for (var x = BAND.x0; x <= BAND.x1; x += 7) {
      for (var z = BAND.z0; z <= BAND.z1; z += 5) {
        columns++
        for (var y = 300; y >= 0; y--) {
          if (!isAir(blockIdAt(LUNA, x, y, z))) {
            withGround++
            if (y > top) top = y
            break
          }
        }
      }
    }
    var moon = COPIES[0]
    if (top >= BAND_Y[LUNA][0]) {
      moon.y0 = top + 2
      BAND_Y[LUNA] = [top + 1, top + 17]
    }
    note('moon_ground', withGround + ' of ' + columns + ' columns under the Moon band have ground, the highest at Y ' + top + '; the facility is built from Y ' +
      moon.y0 + ' (controller Y ' + (moon.y0 + 1) + ', radiators Y ' + (moon.y0 + 7) + ', roof Y ' + (moon.y0 + 12) + '), cleared Y ' + BAND_Y[LUNA][0] + '-' +
      BAND_Y[LUNA][1] + (top >= 198 ? ': ABOVE the band, the ground is higher' : ': the band, above the ground'))
  }

  // the chunks of the band are generated and force-loaded, and the band (and only the band) is cleared; a roof keeps the Overworld's rain
  // off the hatches (GTM's weather check)
  function prepareWorld() {
    S.areaTouched = true
    ;[LUNA, EARTH].forEach(function (dim) {
      var level = levelOf(dim)
      for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
        for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) level.getChunk(cx, cz)
      }
      if (dim === LUNA) moonGround()
      var loaded = cmd(dim, 'forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      var cleared = cmd(dim, 'fill ' + BAND.x0 + ' ' + BAND_Y[dim][0] + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND_Y[dim][1] + ' ' + BAND.z1 + ' air')
      if (dim === EARTH) cmd(dim, 'fill ' + BAND.x0 + ' ' + ROOF_Y + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + ROOF_Y + ' ' + BAND.z1 + ' minecraft:smooth_stone')
      note('AREA_' + (dim === LUNA ? 'moon' : 'earth'), dim + ' band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND_Y[dim][0] + '-' + BAND_Y[dim][1] + ' Z ' +
        BAND.z0 + '-' + BAND.z1 + ': generated, forceload add result ' + loaded + ', changed ' + cleared + ' blocks while clearing' +
        (dim === EARTH ? ', roof at Y ' + ROOF_Y : ''))
    })
  }

  function cleanup() {
    if (S.areaTouched) {
      ;[LUNA, EARTH].forEach(function (dim) {
        var cleared = cmd(dim, 'fill ' + BAND.x0 + ' ' + BAND_Y[dim][0] + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND_Y[dim][1] + ' ' + BAND.z1 + ' air')
        var released = cmd(dim, 'forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
        note('CLEANUP_' + (dim === LUNA ? 'moon' : 'earth'), 'cleared ' + cleared + ' blocks of the band in ' + dim + ', forceload remove result ' + released)
      })
    }
    restoreClock()
  }

  // ---------------------------------------------------------------- the clock (one for every dimension: the Moon reads the Overworld's)

  function dayTimeNow() {
    return Number(S.moon.getDayTime())
  }

  function setClock(time, why) {
    if (S.clock === null) S.clock = { original: dayTimeNow() % 24000, startTick: Number(S.server.getTickCount()), lastSet: time, lastSetTick: 0 }
    S.server.runCommandSilent('time set ' + time)
    S.clock.lastSet = time
    S.clock.lastSetTick = Number(S.server.getTickCount())
    var now = dayTimeNow()
    note('CLOCK', 'time set ' + time + ' (' + why + '): the Moon reads day time ' + now + ', sun ' + (sunDown(now) ? 'down' : 'up'))
  }

  function near(a, b) {
    var d = Math.abs(a - b)
    return d <= 200 || d >= 23800
  }

  // back to where the clock would be without the test, unless something else has changed it since (then it is left alone)
  function restoreClock() {
    if (S === null || S.clock === null) return
    var c = S.clock
    S.clock = null
    var now = Number(S.server.getTickCount())
    var current = dayTimeNow() % 24000
    var ticking = near(current, (c.lastSet + now - c.lastSetTick) % 24000)
    var frozen = near(current, c.lastSet % 24000)
    if (!ticking && !frozen) {
      note('CLOCK', 'not restored: the time was changed by something else (now ' + current + ', the test set ' + c.lastSet + ' ' + (now - c.lastSetTick) +
        ' ticks ago)')
      return
    }
    var back = (c.original + (ticking ? now - c.startTick : 0)) % 24000
    S.server.runCommandSilent('time set ' + back)
    note('CLOCK', 'restored to ' + back + ' (' + c.original + ' when the test first changed it' +
      (ticking ? ', plus the ' + (now - c.startTick) + ' ticks since' : '; the daylight cycle is off') + ')')
  }

  // ---------------------------------------------------------------- structures

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

  // a part's facing, outwards: the back wall faces south (away from the controller), the side cells east (left as seen from the front)
  // or west
  function facingOf(si, ci, ctrl) {
    if (si === 0) return 'south'
    return ci < ctrl.ci ? 'east' : 'west'
  }

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing north:
  // x = cx - (col - ctrlCol), y = y0 + row, z = cz - (slice - ctrlSlice)  (the structure is behind it)
  function planOf(copy) {
    var desc = global.grindless.patterns.describe(MACHINE)
    if (!desc) throw new Error('no structure description recorded for ' + MACHINE)
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
          var role = PARTS_AT[si + ',' + ri + ',' + ci]
          if (sym.kind === 'controller') {
            c.id = MACHINE
            c.props = '[facing=north]'
            c.role = 'controller'
          } else if (sym.kind === 'air' || sym.kind === 'any') {
            continue
          } else if (role !== undefined) {
            c.id = ROLE_BLOCKS[role]
            c.props = '[facing=' + facingOf(si, ci, ctrl) + ']'
            c.role = role
          } else {
            c.id = plainBlock(sym)
          }
          cells.push(c)
        }
      })
    })
    return { cells: cells, width: desc.slices[0][0].length, height: desc.slices[0].length, depth: desc.slices.length }
  }

  function place(m) {
    var copy = m.copy
    var plan = planOf(copy)
    var failed = []
    var ctrlCell = null
    var tally = {}
    m.roles = {}
    m.radiatorsPlaced = []
    plan.cells.forEach(function (c) {
      tally[c.id] = (tally[c.id] || 0) + 1
      if (c.id === RADIATOR) m.radiatorsPlaced.push(at(c))
      if (c.role === 'controller') {
        ctrlCell = c
        return
      }
      if (c.role !== null) m.roles[at(c)] = c.role
      if (cmd(copy.dim, 'setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.id + c.props + ' replace') < 1) failed.push(at(c) + ' ' + c.id)
    })
    if (cmd(copy.dim, 'setblock ' + ctrlCell.x + ' ' + ctrlCell.y + ' ' + ctrlCell.z + ' ' + ctrlCell.id + ctrlCell.props + ' replace') < 1) failed.push('controller')
    m.ctrlPos = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }
    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(copy.dim, c.x, c.y, c.z)
      if (got !== c.id) wrong.push(at(c) + ' ' + c.ch + ' wanted ' + c.id + ' got ' + got)
    })
    var bill = Object.keys(tally).sort().map(function (id) { return short(id) + ' x' + tally[id] }).join(', ')
    check(copy.key + '_PLACED', failed.length === 0 && wrong.length === 0, copy.dim + ': ' + plan.cells.length + ' blocks, ' + plan.width + 'x' + plan.height +
      'x' + plan.depth + ' (w x h x d), controller ' + at(m.ctrlPos) + ' bill=[' + bill + ']' +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') + (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

  function machineAt(m) {
    return lazy().MetaMachine.getMachine(levelOf(m.copy.dim), new BlockPos(m.ctrlPos.x, m.ctrlPos.y, m.ctrlPos.z))
  }

  function findParts(m, ctrl) {
    var P = { ids: [] }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pos = p.self().getPos()
      var role = m.roles[pos.getX() + ',' + pos.getY() + ',' + pos.getZ()]
      P.ids.push(short(p.getDefinition().getId()) + (role ? '=' + role : ''))
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
    TRF().display(m.ctrl, list)
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

  function tankInfo(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    return { id: st.isEmpty() ? 'none' : fluidName(st), amount: st.isEmpty() ? 0 : Number(st.getAmount()) }
  }

  function setTank(hatch, id, amount) {
    // a FluidStack built by KubeJS: setFluidInTank ignores one built outside it
    if (amount <= 0) hatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
    else hatch.tank.setFluidInTank(0, Fluid.of(id, amount).getFluidStack())
  }

  // the output hatches' fluids, summed by fluid
  function outFluids(m) {
    var t = {}
    OUTS.forEach(function (role) {
      var info = tankInfo(m.P[role])
      if (info.amount > 0) t[info.id] = (t[info.id] || 0) + info.amount
    })
    return t
  }

  function emptyOutputs(m) {
    OUTS.forEach(function (role) { setTank(m.P[role], null, 0) })
  }

  function fluidSummary(t) {
    var keys = Object.keys(t)
    return keys.length === 0 ? 'none' : keys.map(function (k) { return short(k) + ' ' + t[k] + ' mB' }).join(', ')
  }

  function energyUsed(m) {
    return m.energy - m.energyAt
  }

  function mark(m, phase) {
    m.phase = phase
    m.t0 = S.t
    m.energyAt = m.energy
    m.seen = {}
    m.runs = []
    wake(m)
  }

  function inputsText(m) {
    var feed = tankInfo(m.P.feed)
    var carrier = tankInfo(m.P.carrier)
    return 'feed ' + feed.amount + ' mB ' + short(feed.id) + ', carrier ' + carrier.amount + ' mB ' + short(carrier.id) + ', out [' + fluidSummary(outFluids(m)) +
      '], ' + energyUsed(m) + ' EU, runs [' + m.runs.map(function (r) { return r.id + ' ' + r.eut + ' EU/t x ' + r.duration + ' t' }).join(', ') + '] | ' + state(m)
  }

  // ---------------------------------------------------------------- the Moon copy

  // one run's result against the recipe: exactly the outputs, nothing left of the feed, the carrier untouched, one run at the price
  function runProblems(m, eut, energy) {
    var problems = []
    var out = outFluids(m)
    if (out[HW] !== WANT.heavyWater || out[T] !== WANT.tritium || Object.keys(out).length !== 2) problems.push('out [' + fluidSummary(out) + ']')
    if (tankOf(m.P.feed) !== 0) problems.push(tankOf(m.P.feed) + ' mB of feed left')
    if (tankOf(m.P.carrier) !== WANT.carrier) problems.push('carrier ' + tankOf(m.P.carrier) + ' mB')
    if (m.runs.length !== 1) problems.push(m.runs.length + ' runs seen')
    else if (m.runs[0].id !== RECIPE_ID || m.runs[0].eut !== eut || m.runs[0].duration !== WANT.duration) {
      problems.push('ran ' + m.runs[0].id + ' at ' + m.runs[0].eut + ' EU/t x ' + m.runs[0].duration + ' t (wanted ' + eut + ' x ' + WANT.duration + ')')
    }
    if (energyUsed(m) !== energy) problems.push(energyUsed(m) + ' EU drawn (wanted ' + energy + ')')
    return problems
  }

  // the run is over once its outputs are in the hatches (GTM puts them there when it ends) or the time is up
  function runOver(m, age) {
    var out = outFluids(m)
    return ((out[HW] || 0) >= WANT.heavyWater && (out[T] || 0) >= WANT.tritium) || age >= RUN_TIMEOUT
  }

  function seeingSky(m) {
    var n = 0
    m.radiators.forEach(function (r) {
      if (S.moon.canSeeSky(new BlockPos(r.x, r.y + 1, r.z))) n++
    })
    return n
  }

  // world positions of the cells the modifier probes: global radiatorCells (up, back, side relative to the controller) for a controller
  // facing north, mapped like the startup's cellPos (front (0, -1): back = +z, +side = -x)
  function radiatorsCheck(m) {
    var cells = TRF().radiatorCells || []
    m.radiators = cells.map(function (c) { return { x: m.ctrlPos.x - c.side, y: m.ctrlPos.y + c.up, z: m.ctrlPos.z + c.back } })
    var probed = m.radiators.map(at).sort()
    var placed = m.radiatorsPlaced.slice().sort()
    var same = probed.join(' ') === placed.join(' ')
    var seeing = seeingSky(m)
    check('RADIATORS', probed.length === RADIATOR_COUNT && same && seeing === RADIATOR_COUNT, probed.length + ' cells probed by the modifier (controller facing north) ' +
      (same ? 'are the ' + placed.length + ' radiators placed' : 'differ from the radiators placed: probed [' + probed.join(' ') + '] placed [' + placed.join(' ') + ']') +
      '; seeing the sky: ' + seeing + '/' + RADIATOR_COUNT)
  }

  function moonStep(m, age) {
    if (m.phase === 'day') {
      if (!runOver(m, age)) return
      var p1 = runProblems(m, WANT.eut, WANT.energy)
      if (!m.skyLine || !SKY_DAY.test(m.skyLine)) p1.push('the controller said "' + m.skyLine + '" before the run')
      m.dayEnergy = energyUsed(m)
      check('DAY_RUN', p1.length === 0, 'day time ' + m.startedAt + ' (sun ' + (sunDown(m.startedAt) ? 'down' : 'up') + '), the controller said "' + m.skyLine +
        '": ' + inputsText(m) + (p1.length > 0 ? ' | problems: ' + p1.join('; ') : ''))
      m.phase = 'settle_day'
      m.t0 = S.t
      return
    }
    if (m.phase === 'settle_day') {
      if (age < SETTLE_TICKS) return
      // the run that ended left no cached recipe (GTM clears it the tick after a starved finish): the night run is found afresh and the
      // modifier prices it by the sky it starts in
      m.cachedBeforeNight = m.ctrl.getRecipeLogic().getLastRecipe() !== null
      emptyOutputs(m)
      setClock(NIGHT_TIME, 'the night run must start at night')
      var lines = displayLines(m)
      m.skyLine = lines.join(' ; ')
      m.startedAt = dayTimeNow()
      setTank(m.P.feed, THW, WANT.feed)
      mark(m, 'night')
      return
    }
    if (m.phase === 'night') {
      if (!runOver(m, age)) return
      var p2 = runProblems(m, WANT.nightEut, WANT.nightEnergy)
      if (!SKY_NIGHT.test(m.skyLine) || !CARRIER_OK.test(m.skyLine)) p2.push('the controller said "' + m.skyLine + '" before the run')
      if (seeingSky(m) !== RADIATOR_COUNT) p2.push('radiators seeing the sky ' + seeingSky(m) + '/' + RADIATOR_COUNT)
      m.nightEnergy = energyUsed(m)
      check('NIGHT_RUN', p2.length === 0, 'day time ' + m.startedAt + ' (sun ' + (sunDown(m.startedAt) ? 'down' : 'up') + '), radiators seeing the sky ' +
        seeingSky(m) + '/' + RADIATOR_COUNT + ', cached recipe before it: ' + m.cachedBeforeNight + ', the controller said "' + m.skyLine + '": ' + inputsText(m) +
        (p2.length > 0 ? ' | problems: ' + p2.join('; ') : ''))
      check('NIGHT_HALF', m.dayEnergy > 0 && m.nightEnergy * 2 === m.dayEnergy, 'day run ' + m.dayEnergy + ' EU, night run ' + m.nightEnergy + ' EU (x2 = ' +
        (m.nightEnergy * 2) + ')')
      check('CARRIER_KEPT', tankOf(m.P.carrier) === WANT.carrier, tankOf(m.P.carrier) + ' mB of deuterium in its hatch after two runs (loaded ' + WANT.carrier + ')')
      // containment, in the tick the night run ended: voiding on and the feed refilled at once, so GTM tries its cached recipe again
      // (RecipeLogic#findAndHandleRecipe), which skips the modifier; lib/no_voiding.js's beforeWorking must refuse it
      m.cachedAtVoid = m.ctrl.getRecipeLogic().getLastRecipe() !== null
      emptyOutputs(m)
      setVoiding(m, 'VOID_FLUIDS')
      setTank(m.P.feed, THW, WANT.feed)
      mark(m, 'void_fluids')
      return
    }
    if (m.phase === 'void_fluids') {
      if (age < HOLD_TICKS) return
      var shown = failureReasons(m).some(function (r) { return NO_VOIDING.test(r) })
      var still = tankOf(m.P.feed) === WANT.feed && tankOf(m.P.carrier) === WANT.carrier && Object.keys(outFluids(m)).length === 0 && energyUsed(m) === 0 &&
        m.runs.length === 0
      check('NO_VOIDING', still && shown, 'set to void fluids in the tick the night run ended (a cached recipe then: ' + m.cachedAtVoid + ') and refilled: after ' +
        age + ' ticks, refusal shown=' + shown + ', reasons=[' + failureReasons(m).join(' ; ') + '], ' + inputsText(m))
      setVoiding(m, 'VOID_NONE')
      m.startedAt = dayTimeNow()
      mark(m, 'resume')
      return
    }
    if (m.phase === 'resume') {
      if (!runOver(m, age)) return
      var night = sunDown(m.startedAt) && seeingSky(m) === RADIATOR_COUNT
      var p3 = runProblems(m, night ? WANT.nightEut : WANT.eut, night ? WANT.nightEnergy : WANT.energy)
      check('RESUMES', p3.length === 0, 'voiding off at day time ' + m.startedAt + ' (' + (night ? 'night, the half price' : 'day, the full price') + '): ' +
        inputsText(m) + (p3.length > 0 ? ' | problems: ' + p3.join('; ') : ''))
      m.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- the Earth copy

  function earthStep(m, age) {
    if (m.phase !== 'holding' || age < EARTH_HOLD) return
    var lines = displayLines(m)
    var shown = lines.some(function (l) { return NOT_MOON.test(l) })
    var conditions = 'unreadable'
    var condOk = false
    try {
      // GTM's own check (RecipeLogic#checkRecipe calls RecipeHelper.checkConditions first)
      var r = liveRecipe(RECIPE_ID)
      var pass = r === null ? null : lazy().RecipeHelper.checkConditions(r, m.ctrl.getRecipeLogic()).isSuccess()
      condOk = pass === false
      conditions = r === null ? 'no recipe' : String(pass)
    } catch (e) {
      conditions = 'unreadable (' + e + ')'
    }
    var untouched = tankOf(m.P.feed) === WANT.feed && tankOf(m.P.carrier) === WANT.carrier && Object.keys(outFluids(m)).length === 0 && energyUsed(m) === 0 &&
      m.runs.length === 0
    check('REFUSES_ON_EARTH', untouched && shown && condOk, 'Overworld, loaded for one run, after ' + age + ' ticks: ' + inputsText(m) + ', GTM\'s conditions pass=' +
      conditions + ', "only on the Moon" line shown=' + shown + ' | lines=[' + lines.join(' ; ') + '] reasons=[' + failureReasons(m).join(' ; ') + ']')
    m.phase = 'done'
  }

  // ---------------------------------------------------------------- forming and starting

  function start(m) {
    m.energy = 0
    m.energyAt = 0
    m.runs = []
    emptyOutputs(m)
    setTank(m.P.carrier, D, WANT.carrier)
    if (m.copy.key === 'moon') {
      radiatorsCheck(m)
      setClock(DAY_TIME, 'the first run must start by day')
      m.skyLine = displayLines(m).join(' ; ')
      m.startedAt = dayTimeNow()
      setTank(m.P.feed, THW, WANT.feed)
      mark(m, 'day')
    } else {
      setTank(m.P.feed, THW, WANT.feed)
      mark(m, 'holding')
    }
  }

  function formed(m) {
    safely(m.copy.key + '_PARTS', function () {
      m.ctrl = machineAt(m)
      m.P = findParts(m, m.ctrl)
      var want = {}
      Object.keys(PARTS_AT).forEach(function (k) { want[PARTS_AT[k]] = true })
      var missing = Object.keys(want).filter(function (role) { return !m.P[role] })
      var voltage = 'unreadable'
      try {
        voltage = String(m.ctrl.getOverclockVoltage())
      } catch (e) { /* only for the detail */ }
      check(m.copy.key + '_PARTS', missing.length === 0, '[' + m.P.ids.join(' ') + '], overclock voltage ' + voltage + ' (one IV hatch: 8192, neither price overclocks)' +
        (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''))
      if (missing.length > 0) {
        m.phase = 'done'
        return
      }
      var c = m.P.energy.energyContainer
      c.setEnergyStored(c.getEnergyCapacity())
      m.primed = true
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

  // every tick: what the controller runs (each new run once, with the EU/t and duration it started with) and the energy it draws (the
  // energy hatch is topped up to its capacity)
  function measure(m) {
    if (!m.ctrl || !m.P || !m.P.energy || m.phase === 'forming' || m.phase === 'formed' || m.phase === 'done') return
    var rlg = m.ctrl.getRecipeLogic()
    var last = rlg.getLastRecipe()
    var working = String(rlg.getStatus()) === 'WORKING' && last !== null && last !== undefined
    var progress = Number(rlg.getProgress())
    if (working && (!m.wasWorking || progress < m.lastProgress)) {
      var eut = NaN
      try {
        eut = Number(lazy().RecipeHelper.getRealEUt(last).getTotalEU())
      } catch (e) { /* reported as NaN */ }
      m.runs.push({ id: String(last.id), eut: eut, duration: Number(rlg.getDuration()), at: S.t })
    }
    m.wasWorking = working
    m.lastProgress = working ? progress : 0
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
    if (m.copy.key === 'moon') moonStep(m, age)
    else earthStep(m, age)
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
      var m = { copy: copy, phase: 'forming', energy: 0, energyAt: 0, seen: {}, runs: [], primed: false, forced: false, ctrl: null, P: null, t0: 0,
        wasWorking: false, lastProgress: 0, radiators: [], radiatorsPlaced: [], skyLine: '', startedAt: 0 }
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
    S = { server: server, earth: server.overworld(), moon: server.getLevel(LUNA), t: 0, t0: 0, tick0: Number(server.getTickCount()), copies: [],
      finished: false, areaTouched: false, clock: null }
    var shared = false
    try {
      shared = sharedIdsPresent()
      staticChecks()
    } catch (e) {
      check('static', false, 'exception: ' + e)
    }
    if (!shared) {
      note('copies', 'skipped: the facility cannot run without its fluids and blocks')
      finish()
      return
    }
    if (S.moon === null || S.moon === undefined) {
      check('moon_level', false, LUNA + ' is not loaded on this server')
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

  ServerEvents.customCommand('gg_test_tritium_removal', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_tritium_removal run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
