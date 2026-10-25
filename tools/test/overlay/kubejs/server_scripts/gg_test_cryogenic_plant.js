// Gregtech Grindless - smoke test of the EV Cryogenic Plant (TEST-ONLY overlay: copied over the instance on the test PC, never shipped with
// the pack).
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_dump;;kubejs custom_command gg_test_cryogenic_plant' `
//     -WaitForLog 'GGTEST\|dump\|DONE@@900;;GGTEST\|cryogenic_plant\|DONE@@900'
//
// Code under test: startup_scripts/grindless/ev/cryogenic_plant.js (machine gtceu:cryogenic_plant, recipe type gtceu:cryogenic_processing,
// block grindless:night_sky_radiator, and the recipe modifier that halves the EU/t of a run that STARTS while the sun is down with all 12
// radiators open to the sky; it is registered with alwaysTryModifyRecipe, so GTM re-applies it when each run ends) and
// server_scripts/grindless/ev/cryogenic_plant.js (the 3 recipes and the crafting). Markers: GGTEST|cryogenic_plant|<check>|PASS|FAIL|NOTE|
// <detail>; the last line is GGTEST|cryogenic_plant|DONE, printed even after a failure, an exception or the time limit (4,000 ticks).
//   registration   the recipe type (with the IO sizes the startup asked for), the machine, the radiator block and item
//   recipes        exactly 3 recipes of the type, each under its final id (grindless:cryogenic_processing/<liquid>: GTM's builder puts the
//                  type in front): 1,000 mB gas in, 1,000 mB liquid out, 1,920 EU/t, 240 ticks, the gcyr:luna dimension condition (not
//                  reversed, no other condition) and the data key grindless_night_eut = 960
//   crafting       grindless:crafting/cryogenic_plant (makes the plant) and grindless:assembler/night_sky_radiator (2 radiators)
//   night_info     the type's EMI data line reads a recipe's night EU/t
//   sun_curve      the startup's sunIsDown (published in global): the sun is down from day time 12,786 to 23,214
//   in the world, on the Moon:
//   PLACED / FORMED / PARTS   the registered description placed block by block, formed by itself; 1 EV energy hatch, 1 EV input hatch,
//                  1 EV output hatch, every other part cell frost-proof casing
//   RADIATORS      the 12 cells the modifier probes (global radiatorCells) are the 12 radiators placed, and all of them see the sky
//   NIGHT          time set 18000, 8,000 mB nitrogen in: run 1 costs 960 EU/t for 240 ticks
//   OUTPUT         run 1 leaves at least 1,000 mB of liquid nitrogen in the output hatch
//   DAY            time set 6000 while run 1 runs: run 2 (re-modified when run 1 ends) costs 1,920 EU/t
//   COVER          time set 18000 and stone on the cell above one radiator while run 2 runs: that cell is outside the pattern, the plant
//                  stays formed
//   COVERED        run 3 starts at night with that radiator covered: 1,920 EU/t
//   NIGHT_AGAIN    the stone taken off while run 3 runs: run 4 costs 960 EU/t
//   STATES         the runs started in the three states: night with every radiator open, day, night with a radiator covered
// Each run is judged against what the test reads in the tick the run is detected (the Moon's day time, the cover, Level#canSeeSky above
// each radiator): 960 EU/t only if the sun is down, the cover is off and the 12 radiators see the sky, otherwise 1,920 EU/t; always 240
// ticks (one EV energy hatch, 2,048 V: neither price overclocks). A time changed by something else therefore gives no misleading verdict,
// and STATES still requires the three states.
//
// TEST AREA: ONLY the Moon (gcyr:luna), X 7424-7487, Y 198-214, Z 0-15: force-loaded, cleared and built in at the start, cleared and
// released at the end. The controller faces north at (7434, 200, 8): footings at Y 199, radiators at Y 205, cap at Y 206 (the band is
// cleared up to 214; above it is the lunar sky). The test also sets the time of day (one clock for every dimension) and puts it back at
// the end: do not run it in the same server as tests that need a given time of day (gg_test_observatory, gg_test_lv_content, gg_test_moon).
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'cryogenic_plant'
  var FORM_TIMEOUT = 600
  var TEST_TIMEOUT = 4000
  var FIRST_RUN_WAIT = 200
  var NEXT_RUN_SLACK = 120
  var COVER_SETTLE = 20

  // The pack's Additional Placements mod reloads the datapacks (so these scripts too) a couple of seconds after the server is up; a test
  // that is running then is lost. The command therefore only leaves a request in `global` (it survives script reloads) and the tick handler
  // starts the test once these scripts have been loaded for QUIET_MS.
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestCryogenicPlantRequest'

  var LUNA = 'gcyr:luna'
  var BAND = { x0: 7424, x1: 7487, y0: 198, y1: 214, z0: 0, z1: 15 }
  var CONTROLLER = { x: 7434, y: 200, z: 8 }

  var MACHINE = 'gtceu:cryogenic_plant'
  var TYPE = 'gtceu:cryogenic_processing'
  var RADIATOR = 'grindless:night_sky_radiator'
  var NIGHT_KEY = 'grindless_night_eut'
  var PLANT_CRAFTING = 'grindless:crafting/cryogenic_plant'
  var RADIATOR_CRAFTING = 'grindless:assembler/night_sky_radiator'
  // final recipe id -> [gas, liquid]
  var WANT_RECIPES = {
    'grindless:cryogenic_processing/liquid_oxygen': ['gtceu:oxygen', 'gtceu:liquid_oxygen'],
    'grindless:cryogenic_processing/liquid_helium': ['gtceu:helium', 'gtceu:liquid_helium'],
    'grindless:cryogenic_processing/liquid_nitrogen': ['gtceu:nitrogen', 'gtceu:liquid_nitrogen']
  }
  var AMOUNT = 1000
  var DAY_EUT = 1920
  var NIGHT_EUT = 960
  var DURATION = 240
  var RUN_RECIPE = 'grindless:cryogenic_processing/liquid_nitrogen'
  var GAS = 'gtceu:nitrogen'
  var LIQUID = 'gtceu:liquid_nitrogen'
  var GAS_MB = 8000
  var NIGHT_TIME = 18000
  var DAY_TIME = 6000
  var NIGHT_FROM = 12786
  var NIGHT_TO = 23214
  var RADIATOR_COUNT = 12
  var COVER_BLOCK = 'minecraft:stone'

  var PART_BLOCKS = {
    energy_input: 'gtceu:ev_energy_input_hatch',
    input_hatch: 'gtceu:ev_input_hatch',
    output_hatch: 'gtceu:ev_output_hatch'
  }
  // preferred facing of parts: the first side that has no structure block in front of it
  var SIDES = [['south', 0, 0, 1], ['north', 0, 0, -1], ['east', 1, 0, 0], ['west', -1, 0, 0], ['up', 0, 1, 0], ['down', 0, -1, 0]]

  // the runs the test watches, in order: the check each one gets and the sky the test sets up before it starts
  var RUNS = [
    { check: 'NIGHT', intended: 'night_open' },
    { check: 'DAY', intended: 'day' },
    { check: 'COVERED', intended: 'night_covered' },
    { check: 'NIGHT_AGAIN', intended: 'night_open' }
  ]

  var S = null
  var J = null

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

  function guarded(name, fn) {
    try {
      fn()
    } catch (e) {
      check(name, false, 'exception: ' + e)
    }
  }

  // ---------------------------------------------------------------- Java

  function lazy() {
    if (J !== null) return J
    J = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Fluids: Java.loadClass('net.minecraftforge.registries.ForgeRegistries').FLUIDS,
      FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
      GTRegistries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries'),
      MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      Helper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      ItemCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.ItemRecipeCapability').CAP,
      FluidCap: Java.loadClass('com.gregtechceu.gtceu.api.capability.recipe.FluidRecipeCapability').CAP
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
    return new (lazy().RL)(id)
  }

  function bp(x, y, z) {
    return new (lazy().BlockPos)(x, y, z)
  }

  function at(p) {
    return p.x + ',' + p.y + ',' + p.z
  }

  // a command run in the Moon's level (setblock, fill and forceload act on the dimension they run in)
  function cmd(text) {
    return S.server.runCommandSilent('execute in ' + LUNA + ' run ' + text)
  }

  function blockIdAt(p) {
    return String(S.moon.getBlock(p.x, p.y, p.z).getId())
  }

  function machineAt(p) {
    return lazy().MetaMachine.getMachine(S.moon, bp(p.x, p.y, p.z))
  }

  function byId(id) {
    var opt = S.server.getRecipeManager().byKey(rl(id))
    return opt.isPresent() ? opt.get() : null
  }

  function fluidOf(stack) {
    return { id: String(lazy().Fluids.getKey(stack.getFluid())), mb: Number(stack.getAmount()) }
  }

  function fluidsText(list) {
    if (list === null) return 'unreadable'
    if (list.length === 0) return 'none'
    return list.map(function (f) { return f.mb + ' mB ' + f.id }).join(' + ')
  }

  function tankInfo(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    if (st.isEmpty()) return { id: 'none', mb: 0 }
    return fluidOf(st)
  }

  // ---------------------------------------------------------------- the sun

  // the plant's definition of night, the test's own copy: the sun is down from day time 12,786 to 23,214 of every 24,000 (where vanilla's
  // time-of-day curve, DimensionType#timeOfDay of a dimension without a fixed time, is between 0.25 sunset and 0.75 sunrise; the bounds
  // were worked out with Node, as the startup keeps them)
  function sunDownLocal(dayTime) {
    var t = Number(dayTime) % 24000
    if (t < 0) t += 24000
    return t >= NIGHT_FROM && t <= NIGHT_TO
  }

  // the curve itself, as this Rhino evaluates it: run 1 of 2026-10-25 found the sun never set with it (only reported, never judged)
  function rhinoCurveText() {
    var parts = []
    try {
      var f = 18000 / 24000 - 0.25
      parts.push('18000/24000=' + (18000 / 24000))
      parts.push('f=' + f)
      parts.push('Math.floor(f)=' + Math.floor(f))
      parts.push('Math.PI=' + Math.PI)
      parts.push('Math.cos(f*PI)=' + Math.cos(f * Math.PI))
      var g = f - Math.floor(f)
      var d = 0.5 - Math.cos(g * Math.PI) / 2
      parts.push('tod(18000)=' + ((g * 2 + d) / 3))
      parts.push('Math.cos(1)=' + Math.cos(1))
    } catch (e) {
      parts.push('threw ' + e)
    }
    return parts.join(' ')
  }

  function startupSunFn() {
    var C = global.grindless ? global.grindless.cryogenicPlant : null
    if (!C || typeof C.sunIsDown !== 'function') return null
    return C.sunIsDown
  }

  // what the startup's own function (the one the modifier uses) says, or why it could not be asked
  function startupSays(dayTime) {
    var fn = startupSunFn()
    if (fn === null) return 'not published'
    try {
      return fn(dayTime) ? 'down' : 'up'
    } catch (e) {
      return 'not callable from here (' + String(e).substring(0, 120) + ')'
    }
  }

  // the smallest t in (lo, hi] for which pred(t) holds, given pred(lo) false and pred(hi) true
  function firstTrue(pred, lo, hi) {
    while (hi - lo > 1) {
      var mid = Math.floor((lo + hi) / 2)
      if (pred(mid)) hi = mid
      else lo = mid
    }
    return hi
  }

  // [first, last] night tick of a sun-is-down function, searched between the day (6000) and the next day (30000)
  function nightWindow(down) {
    return [firstTrue(down, DAY_TIME, NIGHT_TIME), firstTrue(function (t) { return !down(t) }, NIGHT_TIME, DAY_TIME + 24000) - 1]
  }

  // ---------------------------------------------------------------- static checks

  function registrationCheck() {
    var L = lazy()
    var C = global.grindless.cryogenicPlant || {}
    var type = L.GTRegistries.RECIPE_TYPES.get(rl(TYPE))
    var machine = L.GTRegistries.MACHINES.get(rl(MACHINE))
    var io = C.maxIO || { itemsIn: 0, itemsOut: 0, fluidsIn: 1, fluidsOut: 1 }
    var want = [io.itemsIn, io.itemsOut, io.fluidsIn, io.fluidsOut].join('/')
    var sizes = 'none'
    if (type) {
      sizes = [type.getMaxInputs(L.ItemCap), type.getMaxOutputs(L.ItemCap), type.getMaxInputs(L.FluidCap), type.getMaxOutputs(L.FluidCap)]
        .map(function (n) { return Number(n) }).join('/')
    }
    var block = Block.getBlock(RADIATOR)
    var blockOk = block != null && String(Block.getId(block)) === RADIATOR && !block.defaultBlockState().isAir()
    var itemOk = Item.exists(RADIATOR)
    var published = C.machine === MACHINE && C.recipeType === TYPE && C.radiator === RADIATOR && C.dimension === LUNA
    check('registration', !!type && sizes === want && !!machine && blockOk && itemOk && published,
      TYPE + ' ' + (type ? 'registered (items in/out, fluids in/out: ' + sizes + '; the startup asked for ' + want + ')' : 'missing') + '; ' +
      MACHINE + ' ' + (machine ? 'registered' : 'missing') + '; ' + RADIATOR + ' block ' + (blockOk ? 'registered' : 'missing') + ', item ' +
      (itemOk ? 'registered' : 'missing') + '; global.grindless.cryogenicPlant: ' +
      (published ? 'the same ids and ' + LUNA : [C.machine, C.recipeType, C.radiator, C.dimension].join(', ')))
  }

  function dimensionOf(c) {
    var d = c.getDimension()
    try {
      return String(d.location())
    } catch (e) {
      return String(d)
    }
  }

  // one live GT recipe; each part is read on its own, so one unreadable part does not hide the others
  function readRecipe(r) {
    var L = lazy()
    var info = { duration: Number(r.duration), eut: NaN, fluidsIn: null, fluidsOut: null, itemsIn: -1, itemsOut: -1, dims: [], others: [],
      night: NaN, nightTag: 'none', errors: [] }
    try {
      info.eut = Number(L.Helper.getRealEUt(r).getTotalEU())
    } catch (e1) {
      info.errors.push('EU/t unreadable (' + e1 + ')')
    }
    try {
      info.fluidsIn = asArray(L.Helper.getInputFluids(r)).map(fluidOf)
      info.fluidsOut = asArray(L.Helper.getOutputFluids(r)).map(fluidOf)
    } catch (e2) {
      info.errors.push('fluids unreadable (' + e2 + ')')
    }
    try {
      info.itemsIn = asArray(r.getInputContents(L.ItemCap)).length
      info.itemsOut = asArray(r.getOutputContents(L.ItemCap)).length
    } catch (e3) {
      info.errors.push('items unreadable (' + e3 + ')')
    }
    try {
      asArray(r.conditions).forEach(function (c) {
        if (c.getDimension) info.dims.push({ id: dimensionOf(c), reverse: !!c.isReverse() })
        else info.others.push(String(c))
      })
    } catch (e4) {
      info.errors.push('conditions unreadable (' + e4 + ')')
    }
    try {
      info.night = Number(r.data.getInt(NIGHT_KEY))
      if (r.data.contains(NIGHT_KEY)) info.nightTag = String(r.data.get(NIGHT_KEY))
    } catch (e5) {
      info.errors.push('data unreadable (' + e5 + ')')
    }
    return info
  }

  function recipesCheck() {
    var L = lazy()
    var C = global.grindless.cryogenicPlant || {}
    var published = C.recipes || []
    var wantIds = Object.keys(WANT_RECIPES).sort()
    var problems = []
    var lines = []
    var type = L.GTRegistries.RECIPE_TYPES.get(rl(TYPE))
    var all = []
    if (type) {
      all = asArray(S.server.getRecipeManager().getAllRecipesFor(type)).map(function (r) { return String(r.getId()) }).sort()
      if (all.length !== wantIds.length) problems.push(TYPE + ' has ' + all.length + ' recipes (wanted ' + wantIds.length + '): ' + all.join(', '))
    } else {
      problems.push('no recipe type ' + TYPE)
    }
    var pubIds = published.map(function (p) { return String(p.id) }).sort()
    if (pubIds.join(',') !== wantIds.join(',')) problems.push('global.grindless.cryogenicPlant.recipes lists [' + pubIds.join(', ') + ']')
    published.forEach(function (p) {
      var w = WANT_RECIPES[p.id]
      if (!w) return
      if (p.gas !== w[0] || p.liquid !== w[1] || p.amount !== AMOUNT || p.eut !== DAY_EUT || p.nightEut !== NIGHT_EUT || p.duration !== DURATION) {
        problems.push('published ' + p.id + ': ' + p.amount + ' mB ' + p.gas + ' -> ' + p.liquid + ', ' + p.eut + ' EU/t (night ' + p.nightEut + ') x ' +
          p.duration + ' t')
      }
    })
    wantIds.forEach(function (id) {
      var w = WANT_RECIPES[id]
      var r = byId(id)
      if (r === null) {
        problems.push(id + ' is not in the recipe manager')
        return
      }
      if (type && all.indexOf(id) < 0) problems.push(id + ' is not a ' + TYPE + ' recipe')
      var info = readRecipe(r)
      var bad = info.errors.slice()
      if (info.duration !== DURATION) bad.push(info.duration + ' ticks')
      if (info.eut !== DAY_EUT) bad.push(info.eut + ' EU/t')
      if (info.fluidsIn !== null && (info.fluidsIn.length !== 1 || info.fluidsIn[0].id !== w[0] || info.fluidsIn[0].mb !== AMOUNT)) {
        bad.push('fluids in ' + fluidsText(info.fluidsIn))
      }
      if (info.fluidsOut !== null && (info.fluidsOut.length !== 1 || info.fluidsOut[0].id !== w[1] || info.fluidsOut[0].mb !== AMOUNT)) {
        bad.push('fluids out ' + fluidsText(info.fluidsOut))
      }
      if (info.itemsIn !== 0 || info.itemsOut !== 0) bad.push('items in/out ' + info.itemsIn + '/' + info.itemsOut)
      var dims = info.dims.map(function (d) { return d.id + (d.reverse ? ' (reversed)' : '') })
      if (dims.length !== 1 || dims[0] !== LUNA) bad.push('dimension conditions [' + dims.join(', ') + ']')
      if (info.others.length > 0) bad.push('other conditions [' + info.others.join(', ') + ']')
      if (info.night !== NIGHT_EUT) bad.push(NIGHT_KEY + ' ' + info.night + ' (tag ' + info.nightTag + ')')
      if (bad.length > 0) problems.push(id + ': ' + bad.join(', '))
      lines.push(id.replace('grindless:cryogenic_processing/', '') + ' ' + fluidsText(info.fluidsIn) + ' -> ' + fluidsText(info.fluidsOut) + ', ' +
        info.eut + ' EU/t x ' + info.duration + ' t, dimension [' + dims.join(', ') + '], ' + NIGHT_KEY + ' ' + info.nightTag)
    })
    check('recipes', problems.length === 0, all.length + ' recipes of ' + TYPE + ': ' + lines.join('; ') +
      (problems.length > 0 ? ' ; problems: ' + problems.join(' ; ') : ''))
  }

  function craftingCheck() {
    var L = lazy()
    var C = global.grindless.cryogenicPlant || {}
    var ids = C.craftingRecipes || {}
    var problems = []
    var text = []
    if (ids.plant !== PLANT_CRAFTING || ids.radiator !== RADIATOR_CRAFTING) problems.push('global lists ' + ids.plant + ', ' + ids.radiator)
    var plant = byId(PLANT_CRAFTING)
    if (plant === null) {
      problems.push(PLANT_CRAFTING + ' missing')
    } else {
      try {
        var res = plant.getResultItem(S.server.registryAccess())
        var made = String(res.getId()) + ' x' + res.getCount()
        text.push(PLANT_CRAFTING + ' makes ' + made)
        if (made !== MACHINE + ' x1') problems.push(PLANT_CRAFTING + ' makes ' + made)
      } catch (e) {
        text.push(PLANT_CRAFTING + ' present (its result is not readable from here: ' + e + ')')
      }
    }
    var rad = byId(RADIATOR_CRAFTING)
    if (rad === null) {
      problems.push(RADIATOR_CRAFTING + ' missing')
    } else {
      try {
        var outs = asArray(L.Helper.getOutputItems(rad)).map(function (st) { return String(st.getId()) + ' x' + st.getCount() })
        text.push(RADIATOR_CRAFTING + ' makes ' + (outs.join(', ') || 'nothing'))
        if (outs.join(',') !== RADIATOR + ' x2') problems.push(RADIATOR_CRAFTING + ' makes ' + (outs.join(', ') || 'nothing') + ' (wanted 2 radiators)')
      } catch (e2) {
        problems.push(RADIATOR_CRAFTING + ' outputs unreadable (' + e2 + ')')
      }
    }
    check('crafting', problems.length === 0, (text.join('; ') || 'no recipe found') + (problems.length > 0 ? ' ; problems: ' + problems.join(' ; ') : ''))
  }

  // the type's EMI line (GTRecipeType#addDataInfo): on a server without the lang files it gives the translation key, never ''
  function nightInfoCheck() {
    var type = lazy().GTRegistries.RECIPE_TYPES.get(rl(TYPE))
    var r = byId(RUN_RECIPE)
    if (!type || r === null) {
      check('night_info', false, 'cannot check: ' + (type ? RUN_RECIPE : TYPE) + ' is missing')
      return
    }
    var infos = asArray(type.getDataInfos())
    var text = infos.length > 0 ? String(infos[0].apply(r.data)) : ''
    check('night_info', infos.length === 1 && text !== '', TYPE + ' has ' + infos.length + ' EMI data line(s); for ' + RUN_RECIPE + ' (data ' + r.data +
      ') it reads "' + text + '"')
  }

  // The startup's sunIsDown is what the modifier uses. If a server script cannot call it, the run checks use the test's own copy.
  function sunCurveCheck() {
    note('rhino_math', rhinoCurveText())
    var local = nightWindow(sunDownLocal)
    var fn = startupSunFn()
    if (fn === null) {
      note('sun_curve', 'global.grindless.cryogenicPlant.sunIsDown is not published as a function: the run checks use the test\'s copy of the curve (night ' +
        local[0] + ' to ' + local[1] + ')')
      return
    }
    try {
      fn(0)
    } catch (e) {
      note('sun_curve', 'the startup\'s sunIsDown is not callable from a server script (' + e + '): the run checks use the test\'s copy of the curve (night ' +
        local[0] + ' to ' + local[1] + ')')
      return
    }
    var down = function (t) { return !!fn(t) }
    var win = nightWindow(down)
    var samples = [0, 1000, 6000, 12000, 13000, 18000, 23000, 23500, 30000, 42000]
    var differ = samples.filter(function (t) { return down(t) !== sunDownLocal(t) })
    check('sun_curve', win[0] === NIGHT_FROM && win[1] === NIGHT_TO && differ.length === 0 && !down(DAY_TIME) && down(NIGHT_TIME),
      'the startup\'s sunIsDown: night from day time ' + win[0] + ' to ' + win[1] + ' (wanted ' + NIGHT_FROM + ' to ' + NIGHT_TO + '; the test\'s copy: ' +
      local[0] + ' to ' + local[1] + '), ' + DAY_TIME + ' is ' + (down(DAY_TIME) ? 'night' : 'day') + ', ' + NIGHT_TIME + ' is ' +
      (down(NIGHT_TIME) ? 'night' : 'day') + (differ.length > 0 ? ', differs from the test\'s copy at ' + differ.join(',') : ''))
  }

  function staticChecks() {
    guarded('registration', registrationCheck)
    guarded('recipes', recipesCheck)
    guarded('crafting', craftingCheck)
    guarded('night_info', nightInfoCheck)
    guarded('sun_curve', sunCurveCheck)
  }

  // ---------------------------------------------------------------- structure (same technique as gg_test_ev_platinum_plant.js)

  function simpleBlock(sym) {
    switch (sym.kind) {
      case 'blocks':
        return { id: sym.blocks[0] }
      case 'frames':
        return { id: 'gtceu:' + sym.materials[0] + '_frame' }
      case 'part':
        if (!PART_BLOCKS[sym.ability]) throw new Error('the test does not know the part ability ' + sym.ability)
        return { id: PART_BLOCKS[sym.ability], ability: sym.ability }
      case 'controller':
        return { id: MACHINE, controller: true }
      case 'air':
      case 'any':
        return null
      default:
        throw new Error('unsupported symbol kind ' + sym.kind)
    }
  }

  // a "casing OR parts" cell: the parts the limits ask for (their minimum: one energy hatch, one input hatch, one output hatch) are spread
  // evenly over the cells, the rest is the plain block (frost-proof casing)
  function assignOneOf(sym, list) {
    var filler = null
    var parts = []
    sym.options.forEach(function (o) {
      if (o.kind === 'part') {
        var lim = o.limits || {}
        var need = lim.exact != null ? lim.exact : (lim.min != null ? lim.min : 0)
        for (var k = 0; k < need; k++) parts.push(simpleBlock(o))
      } else if (filler === null) {
        filler = simpleBlock(o)
      }
    })
    if (filler === null) throw new Error('a oneOf symbol has no plain block option')
    if (parts.length > list.length) throw new Error('more required parts (' + parts.length + ') than cells (' + list.length + ')')
    list.forEach(function (c) { c.block = filler })
    parts.forEach(function (p, i) {
      list[Math.floor((i + 0.5) * list.length / parts.length)].block = p
    })
  }

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing north:
  // x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)  (the structure is behind it, to the south)
  function planOf(cx, cy, cz) {
    var desc = global.grindless.patterns.describe(MACHINE)
    if (!desc) throw new Error('no structure description recorded for ' + MACHINE)
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
      if (sym.kind === 'oneOf') {
        assignOneOf(sym, byChar[ch])
      } else {
        var b = simpleBlock(sym)
        byChar[ch].forEach(function (c) { c.block = b })
      }
    })
    var occupied = {}
    cells.forEach(function (c) {
      if (c.block) occupied[at(c)] = true
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
    return {
      cells: placed,
      occupied: occupied,
      size: desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length + ' (w x h x d)',
      blocks: placed.length,
      ctrl: null
    }
  }

  function setBlock(p, state) {
    return cmd('setblock ' + p.x + ' ' + p.y + ' ' + p.z + ' ' + state + ' replace')
  }

  // everything but the controller first, the controller last
  function place(plan) {
    var failed = []
    var ctrlCell = null
    plan.cells.forEach(function (c) {
      if (c.block.controller) {
        ctrlCell = c
        return
      }
      if (setBlock(c, c.block.id + c.props) < 1) failed.push(at(c) + ' ' + c.block.id + c.props)
    })
    if (ctrlCell === null) throw new Error('the plan has no controller cell')
    if (setBlock(ctrlCell, ctrlCell.block.id + ctrlCell.props) < 1) failed.push('controller ' + ctrlCell.block.id)
    plan.ctrl = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }
    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(c)
      if (got !== c.block.id) wrong.push(at(c) + ' ' + c.ch + ' wanted ' + c.block.id + ' got ' + got)
    })
    var parts = plan.cells.filter(function (c) { return c.block.ability }).map(function (c) { return c.block.ability + '@' + at(c) + c.props })
    var casings = plan.cells.filter(function (c) { return c.ch === 'X' && !c.block.ability }).length
    var ok = failed.length === 0 && wrong.length === 0
    check('PLACED', ok, 'in ' + LUNA + ' from the description lib/patterns.js recorded: blocks=' + plan.blocks + ' size=' + plan.size +
      ' controller=' + at(plan.ctrl) + ' facing north, parts=[' + parts.join(' ') + '], ' + casings + ' casings in the other part cells' +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return ok
  }

  function describeError(ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var text = 'pattern error ' + String(err)
      try {
        var pos = err.getPos()
        text += ' at ' + pos.getX() + ',' + pos.getY() + ',' + pos.getZ() + ' found ' + blockIdAt({ x: pos.getX(), y: pos.getY(), z: pos.getZ() })
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

  function findParts(ctrl) {
    var P = { energy: [], inHatches: [], outHatches: [], others: [] }
    asArray(ctrl.getParts()).forEach(function (p) {
      var pid = String(p.getDefinition().getId())
      if (pid === PART_BLOCKS.energy_input) P.energy.push(p)
      else if (pid === PART_BLOCKS.input_hatch) P.inHatches.push(p)
      else if (pid === PART_BLOCKS.output_hatch) P.outHatches.push(p)
      else P.others.push(pid)
    })
    return P
  }

  function topUpEnergy(m) {
    if (m.parts === null) return
    m.parts.energy.forEach(function (p) {
      var c = p.energyContainer
      c.setEnergyStored(c.getEnergyCapacity())
    })
  }

  // an idle, freshly formed multiblock can stop ticking: wake its recipe logic after the inputs change
  function wake(ctrl) {
    try {
      ctrl.getRecipeLogic().updateTickSubscription()
    } catch (e) { /* the run checks report what did not run */ }
  }

  // the nitrogen for every run (8 runs' worth). A FluidStack built by KubeJS: setFluidInTank ignores one built outside it; if the tank stays
  // empty anyway, the tank's own fill is tried
  function fillGas(m) {
    var hatch = m.parts.inHatches[0]
    hatch.tank.setFluidInTank(0, Fluid.of(GAS, GAS_MB).getFluidStack())
    var got = tankInfo(hatch)
    if (got.id === GAS && got.mb === GAS_MB) return 'setFluidInTank'
    try {
      var Action = Java.loadClass('net.minecraftforge.fluids.capability.IFluidHandler$FluidAction')
      var filled = hatch.tank.fill(Fluid.of(GAS, GAS_MB).getFluidStack(), Action.EXECUTE)
      return 'the tank\'s fill (setFluidInTank left ' + got.mb + ' mB ' + got.id + '; fill took ' + filled + ' mB)'
    } catch (e) {
      return 'setFluidInTank, which left ' + got.mb + ' mB ' + got.id + ' (the tank\'s fill threw ' + e + ')'
    }
  }

  // ---------------------------------------------------------------- radiators and the cover

  // world positions of the cells the modifier probes: global radiatorCells (up, back, side relative to the controller) for a controller
  // facing north, mapped like the startup's cellPos (front (0, -1): back = +z, +side = -x)
  function radiatorWorld(ctrlPos) {
    var cells = (global.grindless.cryogenicPlant || {}).radiatorCells || []
    return cells.map(function (c) { return { x: ctrlPos.x - c.side, y: ctrlPos.y + c.up, z: ctrlPos.z + c.back } })
  }

  // how many radiators see the sky right now, asked the way the modifier asks (Level#canSeeSky on the block above each one)
  function seeingSky(m) {
    var n = 0
    m.radiators.forEach(function (r) {
      if (S.moon.canSeeSky(bp(r.x, r.y + 1, r.z))) n++
    })
    return n
  }

  function coverOn(m) {
    return m.cover !== null && blockIdAt(m.cover) !== 'minecraft:air'
  }

  // the cover goes on the cell above an outer radiator (a wing tip: that cell is outside the pattern)
  function chooseCover(m) {
    var best = null
    m.radiators.forEach(function (r) {
      if (best === null || Math.abs(r.x - m.ctrl.x) > Math.abs(best.x - m.ctrl.x)) best = r
    })
    m.coverRadiator = best
    m.cover = best === null ? null : { x: best.x, y: best.y + 1, z: best.z }
  }

  function radiatorsCheck(m) {
    var placed = m.plan.cells.filter(function (c) { return c.block.id === RADIATOR }).map(at).sort()
    var probed = m.radiators.map(at).sort()
    var same = placed.join(' ') === probed.join(' ')
    var seeing = seeingSky(m)
    var coverFree = m.cover !== null && !m.plan.occupied[at(m.cover)] && blockIdAt(m.cover) === 'minecraft:air'
    check('RADIATORS', probed.length === RADIATOR_COUNT && same && seeing === RADIATOR_COUNT && coverFree,
      probed.length + ' cells probed by the modifier (global radiatorCells, controller facing north) ' +
      (same ? 'are the ' + placed.length + ' radiators placed' : 'differ from the ' + placed.length + ' radiators placed: probed [' + probed.join(' ') +
        '] placed [' + placed.join(' ') + ']') + '; seeing the sky: ' + seeing + '/' + RADIATOR_COUNT + '; the cover cell ' +
      (m.cover !== null ? at(m.cover) + ' (above the radiator at ' + at(m.coverRadiator) + ')' : 'none') + ' is ' +
      (coverFree ? 'air and outside the pattern' : 'not usable'))
  }

  function placeCover(m) {
    m.coverBefore = blockIdAt(m.cover)
    m.coverResult = setBlock(m.cover, COVER_BLOCK)
    m.coverPlacedAt = S.t
  }

  function coverCheck(m, ctrl) {
    var on = coverOn(m)
    var formed = !!ctrl.isFormed()
    check('COVER', on && formed, COVER_BLOCK + ' set on ' + at(m.cover) + ', the cell above the radiator at ' + at(m.coverRadiator) +
      ' (outside the pattern; it held ' + m.coverBefore + ', setblock result ' + m.coverResult + '): ' + COVER_SETTLE + ' ticks later the cell holds ' +
      blockIdAt(m.cover) + ', the plant is ' + (formed ? 'still formed' : 'no longer formed') + ', radiators seeing the sky ' + seeingSky(m) + '/' +
      RADIATOR_COUNT + ' (11 once the light engine has seen the cover)')
  }

  function removeCover(m) {
    var res = setBlock(m.cover, 'minecraft:air')
    note('UNCOVER', 'run 3 is running: the cover taken off ' + at(m.cover) + ' (setblock result ' + res + ', the cell now holds ' + blockIdAt(m.cover) +
      '); run 4 must start with every radiator open to the sky')
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
    note('CLOCK', 'time set ' + time + ' (' + why + '): the Moon reads day time ' + now + ', sun ' + (sunDownLocal(now) ? 'down' : 'up'))
  }

  function near(a, b) {
    var d = Math.abs(a - b)
    return d <= 200 || d >= 23800
  }

  // back to where the clock would be without the test, unless something else has changed it since (then it is left alone)
  function restoreClock() {
    if (S.clock === null) return
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

  // ---------------------------------------------------------------- recipe logic

  function recipeState(ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() + ' lastRecipe=' + (last ? last.id : 'none')
    } catch (e) {
      return 'recipe state unreadable: ' + e
    }
  }

  // what GTM's own lookup, matching and conditions say (added to a run that never started)
  function diagnose(ctrl) {
    var out = []
    try {
      var match = ctrl.getRecipeType().db().find(ctrl)
      if (!match) {
        out.push('lookup=none')
      } else {
        out.push('lookup=' + match.id)
        try { out.push('matchRecipe=' + lazy().Helper.matchRecipe(ctrl, match).isSuccess()) } catch (e1) { out.push('matchRecipe threw ' + e1) }
        try { out.push('matchTickRecipe=' + lazy().Helper.matchTickRecipe(ctrl, match).isSuccess()) } catch (e2) { out.push('matchTickRecipe threw ' + e2) }
        try { out.push('conditions=' + match.checkConditions(ctrl.getRecipeLogic()).isSuccess()) } catch (e3) { /* optional */ }
      }
      out.push('workingEnabled=' + ctrl.isWorkingEnabled())
      var fails = asArray(ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
      if (fails.length > 0) out.push('failureReasons=[' + fails.join(' ; ') + ']')
    } catch (e) {
      out.push('diagnose threw ' + e)
    }
    return out.join(' ')
  }

  // ---------------------------------------------------------------- the runs

  // what a run started in: the sun (the Moon's day time), the cover and the sky above the radiators, read in the tick it was detected
  function stateOf(run) {
    if (!run.sunDown) return 'day'
    if (run.coverOn || run.seeing < RADIATOR_COUNT) return 'night_covered'
    return 'night_open'
  }

  function judgeRun(run) {
    var spec = RUNS[run.k - 1]
    var expected = run.state === 'night_open' ? NIGHT_EUT : DAY_EUT
    var problems = []
    if (run.id !== RUN_RECIPE) problems.push('it runs ' + run.id + ' (wanted ' + RUN_RECIPE + ')')
    if (run.eut !== expected) problems.push(run.eutError !== null ? 'EU/t unreadable (' + run.eutError + ')' : run.eut + ' EU/t, wanted ' + expected)
    if (run.duration !== DURATION) problems.push(run.duration + ' ticks, wanted ' + DURATION)
    if (!run.formed) problems.push('the plant is not formed')
    check(spec.check, problems.length === 0, 'run ' + run.k + ' (t=' + run.t + '): ' + run.id + ', ' + run.eut + ' EU/t x ' + run.duration +
      ' t (recipe logic: ' + run.logicDuration + ' t); when it started: day time ' + run.dayTime + ' (sun ' + (run.sunDown ? 'down' : 'up') +
      '; the startup\'s sunIsDown says ' + run.startup + '), radiators seeing the sky ' + run.seeing + '/' + RADIATOR_COUNT + ', cover ' +
      (run.coverOn ? 'on' : 'off') + ' -> ' + run.state + ' (the test set up ' + spec.intended + '), so ' + expected + ' EU/t expected' +
      (problems.length > 0 ? ' ; problems: ' + problems.join(' ; ') : ''))
  }

  // run 1's liquid in the output hatch; closing = run 2 has started or the wait is over (a miss is then a failure)
  function outputCheck(m, closing) {
    var out = tankInfo(m.parts.outHatches[0])
    var ok = out.id === LIQUID && out.mb >= AMOUNT
    if (!ok && !closing) return
    m.outputDone = true
    var first = m.runs.length > 0 ? m.runs[0] : null
    check('OUTPUT', ok, 'output hatch: ' + out.mb + ' mB ' + out.id + ' (wanted at least ' + AMOUNT + ' mB ' + LIQUID + ')' +
      (first !== null ? ', ' + (S.t - first.t) + ' ticks after run 1 started' : '') + '; gas left in the input hatch: ' +
      tankInfo(m.parts.inHatches[0]).mb + ' mB of ' + GAS_MB)
  }

  function statesCheck(m) {
    if (m.statesDone) return
    m.statesDone = true
    var counts = {}
    m.runs.forEach(function (r) { counts[r.state] = (counts[r.state] || 0) + 1 })
    var missing = ['night_open', 'day', 'night_covered'].filter(function (s) { return !counts[s] })
    check('STATES', missing.length === 0, 'runs: ' +
      (m.runs.length > 0 ? m.runs.map(function (r) { return r.k + ' ' + r.state + ' ' + r.eut + ' EU/t' }).join(', ') : 'none') +
      (missing.length > 0 ? ' ; never seen: ' + missing.join(', ') : ' ; night with every radiator open, day and night with a radiator covered all seen'))
  }

  function onNewRun(m, ctrl, rlg, last) {
    var k = m.runs.length + 1
    var dayTime = dayTimeNow()
    var run = { k: k, t: S.t, id: String(last.id), dayTime: dayTime, sunDown: sunDownLocal(dayTime), startup: startupSays(dayTime),
      seeing: seeingSky(m), coverOn: coverOn(m), formed: !!ctrl.isFormed(), eut: NaN, eutError: null, duration: Number(last.duration),
      logicDuration: Number(rlg.getDuration()), maxProgress: 0, state: '' }
    try {
      run.eut = Number(lazy().Helper.getRealEUt(last).getTotalEU())
    } catch (e) {
      run.eutError = String(e)
    }
    run.state = stateOf(run)
    m.runs.push(run)
    m.cur = run
    if (k >= 2 && !m.outputDone) outputCheck(m, true)
    judgeRun(run)
    if (k === 1) {
      setClock(DAY_TIME, 'run 1 is running: run 2 must start by day')
    } else if (k === 2) {
      setClock(NIGHT_TIME, 'run 2 is running: run 3 must start at night, with a radiator covered')
      placeCover(m)
    } else if (k === 3) {
      removeCover(m)
    }
    if (k >= RUNS.length) {
      statesCheck(m)
      m.phase = 'done'
    }
  }

  function noteWaiting(m, rlg) {
    try {
      if (m.waitNotes >= 3 || !rlg.isWaiting()) return
      m.waitNotes++
      var reason = 'no reason given'
      try {
        var w = rlg.getWaitingReason()
        if (w) reason = String(w.getString())
      } catch (e1) { /* optional */ }
      note('WAITING', 't=' + S.t + ', after ' + m.runs.length + ' run(s): the plant waits: ' + reason)
    } catch (e) { /* only a note */ }
  }

  function stalled(m, ctrl) {
    var k = m.runs.length + 1
    if (!m.outputDone && m.runs.length >= 1) outputCheck(m, true)
    check(RUNS[k - 1].check, false, 'run ' + k + ' never started (' + (m.cur === null ? 'the gas went in at t=' + m.fedAt : 'run ' + m.cur.k +
      ' started at t=' + m.cur.t) + ', now t=' + S.t + '): ' + recipeState(ctrl) + ' ' + diagnose(ctrl) + ' ; day time ' + dayTimeNow() +
      ', radiators seeing the sky ' + seeingSky(m) + '/' + RADIATOR_COUNT + ', cover ' + (coverOn(m) ? 'on' : 'off') + ', gas left ' +
      tankInfo(m.parts.inHatches[0]).mb + ' mB, liquid out ' + tankInfo(m.parts.outHatches[0]).mb + ' mB')
    statesCheck(m)
    m.phase = 'done'
  }

  // Every tick. A new run starts at progress 0 (GTM's setupRecipe), after a tick without work or in the tick the previous run ends (the
  // progress drops); a run that waits and goes on keeps its progress (or is damped to 1 or more), so it is not counted twice.
  function watch(m, ctrl) {
    var rlg = ctrl.getRecipeLogic()
    var working = !!rlg.isWorking()
    var progress = Number(rlg.getProgress())
    var last = rlg.getLastRecipe()
    if (m.cur !== null && working && progress > m.cur.maxProgress) m.cur.maxProgress = progress
    if (!working) noteWaiting(m, rlg)
    var isNew = working && last !== null && last !== undefined && progress <= 1 && (!m.prevWorking || m.prevProgress > progress) &&
      !(m.cur !== null && m.cur.maxProgress <= 1)
    m.prevWorking = working
    m.prevProgress = progress
    if (!m.outputDone && m.runs.length >= 1) outputCheck(m, false)
    if (isNew) {
      onNewRun(m, ctrl, rlg, last)
      return
    }
    if (m.coverPlacedAt >= 0 && !m.coverChecked && S.t - m.coverPlacedAt >= COVER_SETTLE) {
      m.coverChecked = true
      coverCheck(m, ctrl)
    }
    var deadline = m.cur === null ? m.fedAt + FIRST_RUN_WAIT : m.cur.t + (m.cur.duration > 0 ? m.cur.duration : DURATION) + NEXT_RUN_SLACK
    if (S.t > deadline) stalled(m, ctrl)
  }

  // ---------------------------------------------------------------- the machine

  // once formed: the parts, the radiators, night, the gas and the energy
  function setup(m, ctrl) {
    m.parts = findParts(ctrl)
    var P = m.parts
    var problems = []
    if (P.energy.length !== 1) problems.push('energy hatches ' + P.energy.length + ' (wanted 1)')
    if (P.inHatches.length !== 1) problems.push('input hatches ' + P.inHatches.length + ' (wanted 1)')
    if (P.outHatches.length !== 1) problems.push('output hatches ' + P.outHatches.length + ' (wanted 1)')
    if (P.others.length > 0) problems.push('other parts ' + P.others.join(','))
    var voltage = 'unreadable'
    try {
      voltage = String(ctrl.getOverclockVoltage())
    } catch (e) { /* only for the detail */ }
    check('PARTS', problems.length === 0, (problems.length > 0 ? problems.join('; ') : '1 EV energy hatch, 1 EV input hatch, 1 EV output hatch') +
      '; overclock voltage ' + voltage + ' (one EV hatch: 2048, no overclock for 960 or 1,920 EU/t)')
    if (problems.length > 0) {
      m.parts = null
      m.phase = 'done'
      return
    }
    guarded('RADIATORS', function () { radiatorsCheck(m) })
    setClock(NIGHT_TIME, 'run 1 must start at night')
    P.outHatches[0].tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
    topUpEnergy(m)
    var how = fillGas(m)
    var gas = tankInfo(P.inHatches[0])
    var energy = P.energy[0].energyContainer
    wake(ctrl)
    if (gas.id !== GAS || gas.mb < 4 * AMOUNT) {
      check('INPUT', false, 'the input hatch holds ' + gas.mb + ' mB ' + gas.id + ' after ' + how + ' (wanted ' + GAS_MB + ' mB ' + GAS + ')')
      m.phase = 'done'
      return
    }
    m.fedAt = S.t
    note('INPUT', 'input hatch ' + gas.mb + ' mB ' + gas.id + ' (by ' + how + '), output hatch emptied, energy hatch ' + energy.getEnergyStored() + '/' +
      energy.getEnergyCapacity() + ' EU, topped up every tick')
    m.phase = 'running'
  }

  function startMachine() {
    var m = { phase: 'forming', t0: S.t, plan: null, ctrl: null, forced: false, forcedAt: 0, parts: null, radiators: [], cover: null,
      coverRadiator: null, coverBefore: '', coverResult: -1, coverPlacedAt: -1, coverChecked: false, runs: [], cur: null, prevWorking: false,
      prevProgress: 0, fedAt: -1, outputDone: false, statesDone: false, waitNotes: 0 }
    S.machine = m
    try {
      if (!lazy().GTRegistries.MACHINES.get(rl(MACHINE))) {
        check('PLACED', false, MACHINE + ' is not registered: nothing to place')
        m.phase = 'done'
        return
      }
      // the pattern is NOT built here: the structure is placed from the registered description and GTM builds the pattern itself, lazily,
      // when the controller first checks its structure (what happens in a real world)
      m.plan = planOf(CONTROLLER.x, CONTROLLER.y, CONTROLLER.z)
      if (!place(m.plan)) {
        m.phase = 'done'
        return
      }
      m.ctrl = m.plan.ctrl
      m.radiators = radiatorWorld(m.ctrl)
      chooseCover(m)
      m.t0 = S.t
    } catch (e) {
      check('PLACED', false, 'exception while describing or placing: ' + e)
      m.phase = 'done'
    }
  }

  function form(m, ctrl) {
    var waited = S.t - m.t0
    if (ctrl.isFormed()) {
      check('FORMED', true, (m.forced ? 'after a forced check, ' : 'by itself after ' + waited + ' ticks, ') + 'parts=[' + partIds(ctrl).join(' ') + ']')
      setup(m, ctrl)
      return
    }
    if (m.forced) {
      if (S.t - m.forcedAt > 40) {
        check('FORMED', false, 'still not formed 40 ticks after forcing it: ' + describeError(ctrl))
        m.phase = 'done'
      }
      return
    }
    if (waited < FORM_TIMEOUT) return
    var desc = global.grindless.patterns.describe(MACHINE)
    if (!desc || !desc.built) {
      check('FORMED', false, 'not formed after ' + waited + ' ticks and GTM never built the pattern')
      m.phase = 'done'
      return
    }
    var syncOk = false
    try {
      syncOk = ctrl.checkPatternWithLock()
    } catch (e) { /* reported below */ }
    if (!syncOk) {
      check('FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(ctrl))
      m.phase = 'done'
      return
    }
    check('FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
    ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
    ctrl.onStructureFormed()
    m.forced = true
    m.forcedAt = S.t
  }

  function advance(m) {
    var ctrl = machineAt(m.ctrl)
    if (ctrl === null || ctrl === undefined) {
      check(m.phase === 'forming' ? 'FORMED' : 'STEP', false, 'no machine at the controller position ' + at(m.ctrl) + ' (the block there is ' +
        blockIdAt(m.ctrl) + ')')
      m.phase = 'done'
      return
    }
    if (m.phase === 'forming') {
      form(m, ctrl)
    } else if (m.phase === 'running') {
      topUpEnergy(m)
      watch(m, ctrl)
    }
  }

  // ---------------------------------------------------------------- the world

  // the chunks of the band are generated and force-loaded, and the band (and only the band) is cleared
  function prepareWorld() {
    S.areaTouched = true
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.moon.getChunk(cx, cz)
    }
    var loaded = cmd('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = cmd('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    note('AREA', LUNA + ' band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 + ': chunks ' +
      (BAND.x0 >> 4) + '..' + (BAND.x1 >> 4) + ',' + (BAND.z0 >> 4) + ' generated, forceload add result ' + loaded + ', changed ' + cleared +
      ' blocks while clearing')
  }

  // the band is cleared (17,408 blocks: one fill, under vanilla's 32,768 limit) and released, and the clock put back
  function cleanup() {
    if (S.moon !== null && S.moon !== undefined && S.areaTouched) {
      var cleared = cmd('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
      var released = cmd('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
      note('CLEANUP', 'cleared ' + cleared + ' blocks of the band in ' + LUNA + ', forceload remove result ' + released)
    }
    restoreClock()
  }

  // ---------------------------------------------------------------- driver

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    var m = S.machine
    if (m !== null && m.fedAt >= 0 && !m.statesDone) {
      try {
        statesCheck(m)
      } catch (e0) {
        check('STATES', false, 'exception: ' + e0)
      }
    }
    try {
      cleanup()
    } catch (e) {
      check('CLEANUP', false, 'exception: ' + e)
    }
    console.info(TAG + SCOPE + '|DONE')
  }

  function machineText(m) {
    if (m === null) return 'no machine'
    var text = 'phase ' + m.phase + ', runs seen ' + m.runs.length
    try {
      if (m.ctrl !== null) text += ', ' + recipeState(machineAt(m.ctrl))
    } catch (e) { /* only for the detail */ }
    return text
  }

  // setTimeout is not bound in the scripts of this server, so a server-tick handler drives the test, one step per tick
  function onTick() {
    if (S === null || S.finished) return
    try {
      S.t = Number(S.server.getTickCount()) - S.tick0
      var m = S.machine
      if (S.t > TEST_TIMEOUT) {
        check('timeout', false, 'still running after ' + S.t + ' ticks: ' + machineText(m))
        finish()
        return
      }
      if (m !== null && m.phase !== 'done') {
        try {
          advance(m)
        } catch (e) {
          check('STEP', false, 'exception in ' + m.phase + ': ' + e)
          m.phase = 'done'
        }
      }
      if (m === null || m.phase === 'done') finish()
    } catch (e2) {
      check('STEP', false, 'exception: ' + e2)
      finish()
    }
  }

  function run(server) {
    S = { server: server, moon: null, t: 0, tick0: Number(server.getTickCount()), machine: null, finished: false, clock: null, areaTouched: false }
    staticChecks()
    S.moon = server.getLevel(LUNA)
    if (S.moon === null || S.moon === undefined) {
      check('moon_level', false, LUNA + ' is not loaded on this server')
      finish()
      return
    }
    guarded('AREA', prepareWorld)
    startMachine()
    if (S.machine === null || S.machine.phase === 'done') finish()
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
    onTick()
  })

  ServerEvents.customCommand('gg_test_cryogenic_plant', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_cryogenic_plant run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
