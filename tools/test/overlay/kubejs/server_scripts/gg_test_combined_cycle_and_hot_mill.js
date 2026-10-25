// Gregtech Grindless - smoke test of package B7, combined-cycle-and-hot-mill (TEST-ONLY overlay: copied over the instance on the test PC,
// never shipped with the pack): the EV Combined-Cycle Plant (gtceu:combined_cycle_plant, the first CUSTOM generator recipe type,
// gtceu:combined_cycle) and the Hot Strip Mill (gtceu:hot_strip_mill, gtceu:hot_rolling), startup_scripts/grindless/ev/
// combined_cycle_and_hot_mill.js and server_scripts/grindless/ev/combined_cycle_and_hot_mill.js.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_combined_cycle_and_hot_mill;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|combined_cycle_and_hot_mill\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|combined_cycle_and_hot_mill|<check>|PASS|FAIL|NOTE|<detail>
//   registration        both machines are registered: the plant as a generator that does not regress while waiting, on gtceu:combined_cycle;
//                       the mill on gtceu:hot_rolling; both have a structure description
//   cc_recipes          one combined_cycle recipe per live gas turbine fuel: the same fuel and amount, EU/t and duration (so the same EU
//                       per mB), steam = round(0.4 x the run's EU), distilled water = ceil(steam / 160), and the site rule: the gas
//                       turbine recipe's own dimension conditions, or without any, none for a fuel that carries its own oxidizer
//                       (power.site.burnAnywhere) and the air allowlist otherwise; every fuel that needs air is dead on the Moon and Mars
//   hr_recipes          the titanium plate, rods and foil recipes: hot ingot + circuit 1/2/3 + water -> 1 plate / 2 rods / 4 foil + steam,
//                       energy = the live freezer's + the live bender's or extruder's, steam 2 mB per kelvin in whole 160 mB; no recipe for
//                       an ingot whose freezer needs liquid helium; no recipe gives more steam than its own EU
//   controller_recipes  both controller recipes exist and hold their parts
//   <copy>_PLACED / _FORMED / _PARTS   for the three copies below
//   plant_eu_to_buffer  copy plant_run: the custom generator type sends EU out of an EV dynamo hatch into a real EV battery buffer, and
//                       battery + what is still in the hatch = exactly the EU the methane is worth
//   PROCESS_plant_run   128 runs in parallel (one EV dynamo hatch: 4 096 EU/t), 224 EU per mB of methane (the gas turbine's), the steam
//                       and distilled water of the recipe x the runs
//   plant_blocked_full  copy plant_blocked: with its steam hatch full the plant does not start: no fuel used, no EU
//   plant_no_voiding    the same with the controller set to void fluids: refused (the run never starts, the reason is shown)
//   plant_resumes       once the hatch is emptied and voiding is off it runs: fuel, EU and steam as the recipe says
//   mill_blocked_full / mill_no_voiding   the same two refusals for the mill, with a hot titanium ingot waiting
//   PROCESS_mill_plate / _rods / _foil    circuit 1, 2, 3: one hot titanium ingot -> 1 plate / 2 rods / 4 foil, its steam and water, the
//                       energy drawn (never less than the recipe's: no discount)
//   combined_cycle_and_hot_mill|DONE      last line
//
// Copies (controllers face north at z 2, the structures are behind them; parts in the front face, facing north):
//   plant_run (x 8710), plant_blocked (x 8722): fuel hatch, water hatch, dynamo, -, steam hatch along the front row of the hall floor
//   mill (x 8734): input bus, energy hatch, output bus on the bottom row of the front face; water hatch and steam hatch on its sides
// TEST AREA: this test builds, force-loads and clears ONLY its own band of the overworld, X 8704-8767, Y 98-112, Z 0-15 (AGENTS.md: tests
// run at the same time in one server), with a roof at Y 111 so no hatch is rained on. The structures come from the description
// lib/patterns.js records (global.grindless.structures).
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'combined_cycle_and_hot_mill'
  var BAND = { x0: 8704, x1: 8767, y0: 98, y1: 112, z0: 0, z1: 15 }
  var ROOF_Y = 111
  var Y = 100
  var STEP = 10
  var FORM_TIMEOUT = 600
  var RUN_TICKS = 200
  var HOLD_TICKS = 60
  var ROLL_TIMEOUT = 400

  // the command only leaves a request in `global` (it survives script reloads); the tick handler starts the test once these scripts have
  // been loaded for QUIET_MS (same as the other tests)
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestCombinedCycleHotMillRequest'

  var PLANT = 'gtceu:combined_cycle_plant'
  var MILL = 'gtceu:hot_strip_mill'
  var CC_TYPE = 'gtceu:combined_cycle'
  var HR_TYPE = 'gtceu:hot_rolling'
  var GAS_TYPE = 'gtceu:gas_turbine'
  var FREEZER_TYPE = 'gtceu:vacuum_freezer'

  var ROLE_BLOCKS = {
    fuel: 'gtceu:ev_input_hatch',
    water: 'gtceu:ev_input_hatch',
    steam: 'gtceu:ev_output_hatch',
    dynamo: 'gtceu:ev_energy_output_hatch',
    energy: 'gtceu:ev_energy_input_hatch',
    inBus: 'gtceu:ev_input_bus',
    outBus: 'gtceu:ev_output_bus'
  }
  var BUFFER = 'gtceu:ev_battery_buffer_4x'
  var BATTERY = 'gtceu:ev_vanadium_battery'
  var METHANE = 'gtceu:methane'
  var DISTILLED = 'gtceu:distilled_water'
  var STEAM = 'gtceu:steam'
  var WATER = 'minecraft:water'
  var HOT_TI = 'gtceu:hot_titanium_ingot'
  var GAS_METHANE = 'gtceu:gas_turbine/methane'
  var CC_METHANE = 'grindless:combined_cycle/ev/methane'
  var TI = {
    plate: { id: 'grindless:hot_rolling/ev/titanium_plate', circuit: 1, out: 'gtceu:titanium_plate', count: 1, source: 'gtceu:bender/bend_titanium_to_plate' },
    rods: { id: 'grindless:hot_rolling/ev/titanium_rods', circuit: 2, out: 'gtceu:titanium_rod', count: 2, source: 'gtceu:extruder/extrude_titanium_to_rod' },
    foil: { id: 'grindless:hot_rolling/ev/titanium_foil', circuit: 3, out: 'gtceu:titanium_foil', count: 4, source: 'gtceu:bender/bend_titanium_ingot_to_foil' }
  }
  var TI_FREEZER = 'gtceu:vacuum_freezer/cool_hot_titanium_ingot'
  var NO_VOIDING = /grindless\.steam_outputs\.no_voiding|turn fluid voiding off/

  // parts: 'row,column' of the front slice -> role
  var PLANT_PARTS = { '0,0': 'fuel', '0,1': 'water', '0,2': 'dynamo', '0,4': 'steam' }
  var COPIES = [
    { key: 'plant_run', machine: PLANT, x: 8710, z: 2, parts: PLANT_PARTS, batches: 3, sink: 'buffer' },
    { key: 'plant_blocked', machine: PLANT, x: 8722, z: 2, parts: PLANT_PARTS, batches: 2, sink: 'drain' },
    { key: 'mill', machine: MILL, x: 8734, z: 2, parts: { '0,0': 'inBus', '0,1': 'energy', '0,2': 'outBus', '1,0': 'water', '1,2': 'steam' } }
  ]
  // one EV dynamo hatch: 2 048 V x 2 A = 4 096 EU/t = 128 runs of 32 EU/t
  var PLANT_RUNS = 128

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
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
        VoidingMode: Java.loadClass('com.gregtechceu.gtceu.api.machine.feature.IVoidable$VoidingMode')
      }
    }
    return classes
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

  function machineAt(p) {
    return lazy().MetaMachine.getMachine(S.level, new BlockPos(p.x, p.y, p.z))
  }

  function blockIdAt(x, y, z) {
    return String(S.level.getBlock(x, y, z).getId())
  }

  function fluidName(stack) {
    try {
      return String(lazy().Registries.FLUIDS.getKey(stack.getFluid()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
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

  function readBus(bus) {
    var inv = bus.getInventory()
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      var id = String(st.getId())
      counts[id] = (counts[id] || 0) + Number(st.getCount())
    }
    return counts
  }

  function summary(counts) {
    var keys = Object.keys(counts)
    return keys.length === 0 ? 'empty' : keys.map(function (k) { return k.replace('gtceu:', '') + ' x' + counts[k] }).join(', ')
  }

  function signedEUt(recipe) {
    var io = lazy().RecipeHelper.getRealEUtWithIO(recipe)
    if (io.isEmpty()) return 0
    return io.isInput() ? -Number(io.getTotalEU()) : Number(io.getTotalEU())
  }

  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }

  function fluidList(stacks) {
    return asArray(stacks).map(function (st) { return { id: fluidName(st), amount: Number(st.getAmount()) } })
  }

  function itemList(stacks) {
    return asArray(stacks).map(function (st) { return { id: String(st.getId()), count: Number(st.getCount()) } })
  }

  // { dimension: reversed } of a recipe's dimension conditions, plus how many conditions it has in all, and a sorted key to compare two
  // recipes' dimension conditions
  function dimensionConditions(recipe) {
    var out = { all: 0, dims: {}, key: '' }
    asArray(recipe.conditions).forEach(function (c) {
      out.all++
      try {
        out.dims[String(c.getDimension().location())] = c.isReverse() === true
      } catch (e) { /* not a dimension condition */ }
    })
    out.key = Object.keys(out.dims).sort().map(function (d) { return (out.dims[d] ? '!' : '') + d }).join(',')
    return out
  }

  function failureReasons(ctrl) {
    try {
      return asArray(ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) })
    } catch (e) {
      return ['unreadable: ' + e]
    }
  }

  function wake(ctrl) {
    try {
      ctrl.getRecipeLogic().updateTickSubscription()
    } catch (e) { /* the scenario reports what did not run */ }
  }

  function state(ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() +
        ' last=' + (last ? last.id + ' x' + last.parallels : 'none') + ' voiding=' + ctrl.getVoidingMode()
    } catch (e) {
      return 'state unreadable: ' + e
    }
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    safely('registration', function () {
      var problems = []
      var lines = []
      ;[[PLANT, CC_TYPE, true], [MILL, HR_TYPE, false]].forEach(function (w) {
        var def = GTRegistries.MACHINES.get(rl(w[0]))
        if (def === null || def === undefined) {
          problems.push(w[0] + ' is not registered')
          return
        }
        var types = []
        var arr = def.getRecipeTypes()
        for (var i = 0; i < arr.length; i++) types.push(String(arr[i].registryName))
        if (types.join(',') !== w[1]) problems.push(w[0] + ' types ' + types.join(','))
        if (def.isGenerator() !== w[2]) problems.push(w[0] + ' isGenerator=' + def.isGenerator())
        if (w[2] && def.isRegressWhenWaiting() !== false) problems.push(w[0] + ' regresses while waiting')
        if (!global.grindless.patterns.describe(w[0])) problems.push(w[0] + ' has no structure description')
        lines.push(w[0] + ': types=[' + types.join(',') + '] generator=' + def.isGenerator() + ' regressWhenWaiting=' + def.isRegressWhenWaiting())
      })
      check('registration', problems.length === 0, lines.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('cc_recipes', function () {
      var CC = global.grindless.combinedCycle || {}
      var plans = CC.recipes || []
      var problems = []
      var gasType = GTRegistries.RECIPE_TYPES.get(rl(GAS_TYPE))
      var gas = asArray(S.server.getRecipeManager().getAllRecipesFor(gasType))
      var bySource = {}
      plans.forEach(function (p) { bySource[p.source] = p })
      var taken = 0
      var siteKeys = {}
      var site = (global.grindless.power && global.grindless.power.site) || null
      var airKey = site && site.airDimensions ? site.airDimensions.map(String).sort().join(',') : null
      function anywhere(fluidId) {
        return !!site && (site.burnAnywhere || []).some(function (f) { return String(f.fluid) === fluidId })
      }
      if (airKey === null) problems.push('no site table (global.grindless.power.site)')
      gas.forEach(function (g) {
        var gid = String(g.getId())
        var p = bySource[gid]
        var gFluids = fluidList(lazy().RecipeHelper.getInputFluids(g))
        var gEut = signedEUt(g)
        var gDur = Number(g.duration)
        var gConds = dimensionConditions(g)
        if (!p) {
          // only a fuel with a condition other than a dimension may be left out
          if (gConds.all === Object.keys(gConds.dims).length) problems.push(gid + ' has no combined_cycle recipe')
          return
        }
        taken++
        var r = liveRecipe(p.id)
        if (r === null) {
          problems.push(p.id + ' missing')
          return
        }
        var eut = signedEUt(r)
        var fin = fluidList(lazy().RecipeHelper.getInputFluids(r))
        var fout = fluidList(lazy().RecipeHelper.getOutputFluids(r))
        var conds2 = dimensionConditions(r)
        var steam = Math.round(0.4 * gEut * gDur)
        var water = Math.ceil(steam / 160)
        if (eut !== gEut || Number(r.duration) !== gDur) problems.push(p.id + ' ' + eut + ' EU/t x ' + r.duration + ' t, gas turbine ' + gEut + ' x ' + gDur)
        if (fin.length !== 2 || gFluids.length < 1 || fin[0].id !== gFluids[0].id || fin[0].amount !== gFluids[0].amount) {
          problems.push(p.id + ' fuel ' + JSON.stringify(fin[0]) + ', gas turbine ' + JSON.stringify(gFluids[0]))
        }
        if (fin.length !== 2 || fin[1].id !== DISTILLED || fin[1].amount !== water) problems.push(p.id + ' water ' + JSON.stringify(fin[1]) + ' (wanted ' + water + ')')
        if (fout.length !== 1 || fout[0].id !== STEAM || fout[0].amount !== steam) problems.push(p.id + ' steam ' + JSON.stringify(fout) + ' (wanted ' + steam + ')')
        // the site rule: the gas turbine's own dimension conditions; without any, none for a fuel that carries its oxidizer, else the
        // air allowlist (power.burnsInAir)
        var free = gFluids.length > 0 && anywhere(gFluids[0].id)
        var wantKey = gConds.key !== '' ? gConds.key : (free ? '' : airKey)
        if (conds2.key !== wantKey || conds2.all !== Object.keys(conds2.dims).length) {
          problems.push(p.id + ' dimension conditions [' + conds2.key + '], wanted [' + wantKey + '] (gas turbine [' + gConds.key + '])')
        }
        // a fuel that needs air is dead on the Moon and Mars: only positive conditions, none of them there
        if (!free) {
          var dims = Object.keys(conds2.dims)
          var bad = dims.length === 0 || dims.some(function (d) { return conds2.dims[d] === true || d === 'gcyr:luna' || d === 'gcyr:mars' })
          if (bad) problems.push(p.id + ' (needs air) would burn off Earth: [' + conds2.key + ']')
        }
        var where = conds2.key === '' ? 'anywhere' : (conds2.key === airKey ? 'air' : conds2.key)
        siteKeys[where] = (siteKeys[where] || 0) + 1
      })
      var m = bySource[GAS_METHANE]
      var methane = m ? m.fuel.amount + ' mB methane, ' + m.eut + ' EU/t x ' + m.duration + ' t = ' + m.energy + ' EU (' + (m.energy / m.fuel.amount) +
        ' EU/mB) + ' + m.water + ' mB distilled water -> ' + m.steam + ' mB steam' : 'no methane plan'
      check('cc_recipes', problems.length === 0 && taken === plans.length && taken > 0, taken + ' of ' + gas.length + ' live gas turbine fuels have a ' +
        'combined_cycle recipe with the same fuel, EU/t, duration and dimension conditions; ' + methane + '; sites: ' + JSON.stringify(siteKeys) +
        '; not taken: [' + (CC.skipped || []).map(function (s) {
          return s.source + ' (' + s.reason + ')'
        }).join(', ') + ']' + (problems.length > 0 ? ' | problems: ' + problems.slice(0, 8).join('; ') : ''))
    })

    safely('hr_recipes', function () {
      var HM = global.grindless.hotStripMill || {}
      var plans = HM.recipes || []
      var problems = []
      var freezer = liveRecipe(TI_FREEZER)
      if (freezer === null) throw new Error(TI_FREEZER + ' missing')
      var fEU = -signedEUt(freezer) * Number(freezer.duration)
      var lines = []
      // the blast temperature from GTM's material, apart from the EBF recipes the server script reads it from
      var tiTemperature = Number(GTMaterials.get('titanium').getBlastTemperature())
      var wantSteam = 160 * Math.round(2 * tiTemperature / 160)
      lines.push('titanium blast temperature ' + tiTemperature + ' K')
      Object.keys(TI).forEach(function (k) {
        var want = TI[k]
        var plan = plans.filter(function (p) { return p.id === want.id })[0]
        var r = liveRecipe(want.id)
        var src = liveRecipe(want.source)
        if (!plan || r === null || src === null) {
          problems.push(k + ': plan ' + !!plan + ', recipe ' + (r !== null) + ', source ' + (src !== null))
          return
        }
        var sEU = -signedEUt(src) * Number(src.duration)
        var energy = fEU + sEU
        var eut = -signedEUt(r)
        var outs = itemList(lazy().RecipeHelper.getOutputItems(r))
        var fin = fluidList(lazy().RecipeHelper.getInputFluids(r))
        var fout = fluidList(lazy().RecipeHelper.getOutputFluids(r))
        if (plan.energy !== energy) problems.push(k + ' plan energy ' + plan.energy + ', freezer + ' + want.source + ' = ' + energy)
        if (eut * Number(r.duration) < energy || eut * (Number(r.duration) - 1) >= energy) problems.push(k + ' ' + eut + ' EU/t x ' + r.duration + ' t for ' + energy + ' EU')
        if (plan.circuit !== want.circuit) problems.push(k + ' circuit ' + plan.circuit)
        if (plan.temperature !== tiTemperature) problems.push(k + ' plan temperature ' + plan.temperature + ' K, the material ' + tiTemperature + ' K')
        if (outs.length !== 1 || outs[0].id !== want.out || outs[0].count !== want.count) problems.push(k + ' makes ' + JSON.stringify(outs))
        if (fin.length !== 1 || fin[0].id !== WATER || fin[0].amount !== wantSteam / 160) problems.push(k + ' water ' + JSON.stringify(fin))
        if (fout.length !== 1 || fout[0].id !== STEAM || fout[0].amount !== wantSteam) problems.push(k + ' steam ' + JSON.stringify(fout))
        lines.push(k + ': ' + eut + ' EU/t x ' + r.duration + ' t (freezer ' + fEU + ' + ' + sEU + ' = ' + energy + ' EU) -> ' + want.count + ' ' + want.out +
          ' + ' + (fout[0] ? fout[0].amount : '?') + ' mB steam')
      })
      // ingots whose freezer needs a coolant (liquid helium) keep the freezer
      var freezerType = GTRegistries.RECIPE_TYPES.get(rl(FREEZER_TYPE))
      var cooled = asArray(S.server.getRecipeManager().getAllRecipesFor(freezerType)).filter(function (f) {
        return /cool_hot_.+_ingot$/.test(String(f.getId())) && asArray(lazy().RecipeHelper.getInputFluids(f)).length > 0
      })
      var leaks = []
      cooled.forEach(function (f) {
        var mat = /cool_hot_(.+)_ingot$/.exec(String(f.getId()))[1]
        if (plans.some(function (p) { return p.material === mat })) leaks.push(mat)
      })
      if (cooled.length === 0) problems.push('no freezer recipe with a coolant found to compare')
      if (leaks.length > 0) problems.push('rolled although their freezer needs a coolant: ' + leaks.join(','))
      var greedy = plans.filter(function (p) { return p.steam > p.energy || p.steam !== 160 * p.water })
      if (greedy.length > 0) problems.push('steam above the run\'s EU or not 160 per mB of water: ' + greedy.map(function (p) { return p.id }).join(','))
      var live = asArray(S.server.getRecipeManager().getAllRecipesFor(GTRegistries.RECIPE_TYPES.get(rl(HR_TYPE)))).length
      if (live !== plans.length) problems.push(live + ' live hot_rolling recipes, ' + plans.length + ' planned')
      check('hr_recipes', problems.length === 0, plans.length + ' recipes for ' + (HM.materials || []).length + ' materials, ' + cooled.length +
        ' helium-cooled ingots left to the freezer; titanium ' + lines.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.slice(0, 8).join('; ') : ''))
      note('hr_materials', (HM.materials || []).join(', ') + ' | not taken: ' + (HM.skipped || []).map(function (s) { return s.material + ' (' + s.reason + ')' }).join(', '))
    })

    safely('controller_recipes', function () {
      var lines = []
      var problems = []
      ;[[global.grindless.combinedCycle, PLANT], [global.grindless.hotStripMill, MILL]].forEach(function (w) {
        var r = liveRecipe(w[0].craftingRecipe)
        if (r === null) {
          problems.push(w[0].craftingRecipe + ' missing')
          return
        }
        var out = String(r.getResultItem(S.server.registryAccess()).getId())
        var ids = {}
        asArray(r.getIngredients()).forEach(function (ing) {
          asArray(ing.getItemIds()).forEach(function (id) { ids[String(id)] = true })
        })
        var missing = w[0].craftingParts.filter(function (id) { return id !== w[1] && !ids[id] })
        if (out !== w[1] || missing.length > 0) problems.push(w[0].craftingRecipe + ' makes ' + out + ', missing ' + missing.join(','))
        lines.push(w[0].craftingRecipe + ' -> ' + out)
      })
      check('controller_recipes', problems.length === 0, lines.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })
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

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing north:
  // x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)  (the structure is behind it)
  function planOf(copy) {
    var desc = global.grindless.patterns.describe(copy.machine)
    if (!desc) throw new Error('no structure description recorded for ' + copy.machine)
    var last = desc.slices.length - 1
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          if (desc.symbols[row.charAt(ci)] && desc.symbols[row.charAt(ci)].kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    if (ctrl === null) throw new Error('the description has no controller cell')
    var cy = Y + ctrl.ri
    var cells = []
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          var c = { x: copy.x - (ci - ctrl.ci), y: cy + (ri - ctrl.ri), z: copy.z - (si - ctrl.si), ch: ch, id: null, props: '', role: null }
          var role = si === last ? copy.parts[ri + ',' + ci] : undefined
          if (sym.kind === 'controller') {
            c.id = copy.machine
            c.props = '[facing=north]'
            c.role = 'controller'
          } else if (sym.kind === 'air' || sym.kind === 'any') {
            continue
          } else if (role !== undefined) {
            c.id = ROLE_BLOCKS[role]
            c.props = '[facing=north]'
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

  function setBlock(x, y, z, id, props) {
    return S.server.runCommandSilent('setblock ' + x + ' ' + y + ' ' + z + ' ' + id + (props || '') + ' replace')
  }

  function place(m) {
    var plan = planOf(m.copy)
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
      if (setBlock(c.x, c.y, c.z, c.id, c.props) < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.id)
    })
    if (setBlock(ctrlCell.x, ctrlCell.y, ctrlCell.z, ctrlCell.id, ctrlCell.props) < 1) failed.push('controller')
    m.ctrlPos = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }
    if (m.copy.sink === 'buffer') {
      var dyn = plan.cells.filter(function (c) { return c.role === 'dynamo' })[0]
      m.bufferPos = { x: dyn.x, y: dyn.y, z: dyn.z - 1 }
      if (setBlock(m.bufferPos.x, m.bufferPos.y, m.bufferPos.z, BUFFER, '[facing=north]') < 1) failed.push('battery buffer')
    }
    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.id + ' got ' + got)
    })
    var bill = Object.keys(tally).sort().map(function (id) { return id.replace('gtceu:', '') + ' x' + tally[id] }).join(', ')
    check(m.copy.key + '_PLACED', failed.length === 0 && wrong.length === 0, plan.cells.length + ' blocks, ' + plan.width + 'x' + plan.height + 'x' +
      plan.depth + ' (w x h x d), controller ' + m.ctrlPos.x + ',' + m.ctrlPos.y + ',' + m.ctrlPos.z + ' bill=[' + bill + ']' +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
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

  function describeError(ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var pos = err.getPos()
      return 'pattern error ' + String(err) + ' at ' + pos.getX() + ',' + pos.getY() + ',' + pos.getZ() + ' found ' + blockIdAt(pos.getX(), pos.getY(), pos.getZ())
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  // ---------------------------------------------------------------- the copies

  function plantPlan() {
    var CC = global.grindless.combinedCycle || {}
    var p = (CC.recipes || []).filter(function (r) { return r.source === GAS_METHANE })[0]
    if (!p) throw new Error('no combined_cycle plan for ' + GAS_METHANE)
    return p
  }

  function setVoiding(m, voidFluids) {
    var VM = lazy().VoidingMode
    m.ctrl.setVoidingMode(voidFluids ? VM.VOID_FLUIDS : VM.VOID_NONE)
    wake(m.ctrl)
  }

  function dynamoStored(m) {
    return Number(m.P.dynamo.energyContainer.getEnergyStored())
  }

  function drainDynamo(m) {
    var c = m.P.dynamo.energyContainer
    var e = Number(c.getEnergyStored())
    if (e > 0) {
      m.eu += e
      c.setEnergyStored(0)
    }
  }

  function batteryCharge(m) {
    var bb = machineAt(m.bufferPos)
    return bb ? Number(bb.energyContainer.getEnergyStored()) : -1
  }

  function startPlant(m) {
    var plan = plantPlan()
    m.plan = plan
    var runs = m.copy.batches * PLANT_RUNS
    m.fuelIn = runs * plan.fuel.amount
    m.waterIn = runs * plan.water
    setTank(m.P.fuel, METHANE, m.fuelIn)
    setTank(m.P.water, DISTILLED, m.waterIn)
    setTank(m.P.steam, STEAM, 0)
    if (m.copy.sink === 'buffer') {
      var inv = machineAt(m.bufferPos).getBatteryInventory()
      for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.of(BATTERY))
      m.batteryStart = batteryCharge(m)
      m.phase = 'running'
    } else {
      // the steam hatch full: nowhere for the steam to go
      m.steamCap = Number(m.P.steam.tank.getTankCapacity(0))
      setTank(m.P.steam, STEAM, m.steamCap)
      m.phase = 'blocked'
    }
    m.t0 = S.t
    wake(m.ctrl)
  }

  function startMill(m) {
    m.steamCap = Number(m.P.steam.tank.getTankCapacity(0))
    setTank(m.P.water, WATER, 10000)
    setTank(m.P.steam, STEAM, m.steamCap)
    m.P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(TI.plate.circuit))
    var left = m.P.inBus.getInventory().insertItem(0, Item.of(HOT_TI, 1), false)
    if (!left.isEmpty()) throw new Error('could not insert the hot titanium ingot')
    m.phase = 'blocked'
    m.t0 = S.t
    m.energyUsed = 0
    m.rolls = {}
    wake(m.ctrl)
  }

  // the plant_run copy: EU into the battery buffer, steam, water and fuel against the recipe
  function verifyPlantRun(m) {
    var plan = m.plan
    var runs = m.copy.batches * PLANT_RUNS
    var residual = dynamoStored(m)
    var charged = batteryCharge(m) - m.batteryStart
    var made = charged + residual
    var fuelUsed = m.fuelIn - tankInfo(m.P.fuel).amount
    var waterUsed = m.waterIn - tankInfo(m.P.water).amount
    var steam = tankInfo(m.P.steam)
    var gas = liveRecipe(GAS_METHANE)
    var gasPerMb = gas ? signedEUt(gas) * Number(gas.duration) / plan.fuel.amount : -1
    var want = { eu: runs * plan.energy, fuel: runs * plan.fuel.amount, water: runs * plan.water, steam: runs * plan.steam }
    var perMb = fuelUsed > 0 ? made / fuelUsed : 0
    check('plant_eu_to_buffer', charged > 0 && made === want.eu, 'the custom generator type gtceu:combined_cycle made EU: ' + charged + ' EU charged into ' +
      '4 EV batteries of an EV battery buffer through an EV dynamo hatch, ' + residual + ' still in the hatch, total ' + made + ' (the methane is worth ' + want.eu + ')')
    var problems = []
    if (m.maxPar !== PLANT_RUNS) problems.push('parallels ' + m.maxPar + ' (wanted ' + PLANT_RUNS + ')')
    if (fuelUsed !== want.fuel) problems.push('methane used ' + fuelUsed + ' (wanted ' + want.fuel + ')')
    if (waterUsed !== want.water) problems.push('distilled water used ' + waterUsed + ' (wanted ' + want.water + ')')
    if (steam.id !== STEAM || steam.amount !== want.steam) problems.push('steam ' + steam.amount + ' ' + steam.id + ' (wanted ' + want.steam + ')')
    if (Math.abs(perMb - gasPerMb) > 1e-9) problems.push(perMb + ' EU per mB, the gas turbine ' + gasPerMb)
    if (m.seen[CC_METHANE] !== true) problems.push(CC_METHANE + ' never ran (seen ' + Object.keys(m.seen).join(',') + ')')
    check('PROCESS_plant_run', problems.length === 0, m.copy.batches + ' batches x ' + m.maxPar + ' runs of ' + CC_METHANE + ' (max ' + m.maxEut + ' EU/t): ' +
      made + ' EU from ' + fuelUsed + ' mB methane (' + perMb + ' EU/mB, gas turbine ' + gasPerMb + '), ' + waterUsed + ' mB distilled water -> ' +
      steam.amount + ' mB steam (' + (made > 0 ? Math.round(1000 * steam.amount / made) / 10 : 0) + '% of the EU) | ' + state(m.ctrl) +
      (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  function plantStep(m) {
    var age = S.t - m.t0
    var fuelUsed = m.fuelIn - tankInfo(m.P.fuel).amount
    if (m.phase === 'running') {
      if (age >= RUN_TICKS) {
        verifyPlantRun(m)
        m.phase = 'done'
      }
      return
    }
    if (m.phase === 'blocked' && age >= HOLD_TICKS) {
      check('plant_blocked_full', fuelUsed === 0 && m.eu === 0 && Object.keys(m.seen).length === 0, 'steam hatch full (' + m.steamCap +
        ' mB): ' + fuelUsed + ' mB methane used, ' + m.eu + ' EU made in ' + age + ' ticks | ' + state(m.ctrl) +
        ' reasons=[' + failureReasons(m.ctrl).join(' ; ') + ']')
      setVoiding(m, true)
      m.phase = 'voiding'
      m.t0 = S.t
      return
    }
    if (m.phase === 'voiding' && age >= HOLD_TICKS) {
      var reasons = failureReasons(m.ctrl)
      var shown = reasons.some(function (r) { return NO_VOIDING.test(r) })
      check('plant_no_voiding', fuelUsed === 0 && m.eu === 0 && Object.keys(m.seen).length === 0 && shown, 'steam hatch full, controller set to void ' +
        'fluids: ' + fuelUsed + ' mB methane used, ' + m.eu + ' EU made, refusal shown=' + shown + ' | ' + state(m.ctrl) + ' reasons=[' + reasons.join(' ; ') + ']')
      setVoiding(m, false)
      setTank(m.P.steam, STEAM, 0)
      wake(m.ctrl)
      m.phase = 'resume'
      m.t0 = S.t
      return
    }
    if (m.phase === 'resume' && age >= RUN_TICKS) {
      var plan = m.plan
      var runs = m.copy.batches * PLANT_RUNS
      var steam = tankInfo(m.P.steam).amount
      var made = m.eu + dynamoStored(m)
      var ok = fuelUsed === runs * plan.fuel.amount && made === runs * plan.energy && steam === runs * plan.steam
      check('plant_resumes', ok, 'hatch emptied, voiding off: ' + fuelUsed + ' mB methane (wanted ' + runs * plan.fuel.amount + '), ' + made + ' EU (wanted ' +
        runs * plan.energy + '), ' + steam + ' mB steam (wanted ' + runs * plan.steam + '), parallels ' + m.maxPar + ' | ' + state(m.ctrl))
      m.phase = 'done'
    }
  }

  function millProducts(m) {
    return readBus(m.P.outBus)
  }

  function startRoll(m, k) {
    var want = TI[k]
    m.P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(want.circuit))
    if (k !== 'plate') {
      var left = m.P.inBus.getInventory().insertItem(0, Item.of(HOT_TI, 1), false)
      if (!left.isEmpty()) throw new Error('could not insert the hot titanium ingot')
    }
    m.roll = { key: k, t0: S.t, energy0: m.energyUsed, steam0: tankInfo(m.P.steam).amount, water0: tankInfo(m.P.water).amount, out0: millProducts(m)[want.out] || 0 }
    m.phase = 'roll'
    m.t0 = S.t
    wake(m.ctrl)
  }

  function finishRoll(m, done) {
    var k = m.roll.key
    var want = TI[k]
    var HM = global.grindless.hotStripMill || {}
    var plan = (HM.recipes || []).filter(function (p) { return p.id === want.id })[0]
    var made = (millProducts(m)[want.out] || 0) - m.roll.out0
    var steam = tankInfo(m.P.steam).amount - m.roll.steam0
    var water = m.roll.water0 - tankInfo(m.P.water).amount
    var energy = m.energyUsed - m.roll.energy0
    var problems = []
    if (!plan) problems.push('no plan for ' + want.id)
    if (!done) problems.push('nothing came out in ' + ROLL_TIMEOUT + ' ticks')
    if (made !== want.count) problems.push('made ' + made + ' ' + want.out + ' (wanted ' + want.count + ')')
    if (plan && steam !== plan.steam) problems.push('steam ' + steam + ' (wanted ' + plan.steam + ')')
    if (plan && water !== plan.water) problems.push('water ' + water + ' (wanted ' + plan.water + ')')
    if (plan && energy < plan.energy) problems.push('energy ' + energy + ' EU, less than the recipe\'s ' + plan.energy)
    if (m.seen[want.id] !== true) problems.push(want.id + ' never ran (seen ' + Object.keys(m.seen).join(',') + ')')
    check('PROCESS_mill_' + k, problems.length === 0, 'circuit ' + want.circuit + ': 1 ' + HOT_TI + ' -> ' + made + ' ' + want.out + ' + ' + steam + ' mB steam for ' +
      water + ' mB water, ' + energy + ' EU drawn in ' + (S.t - m.roll.t0) + ' ticks (recipe ' + (plan ? plan.eut + ' EU/t x ' + plan.duration + ' t = ' +
      plan.energy + ' EU before the overclock' : '?') + ') | ' + state(m.ctrl) + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
  }

  function millStep(m) {
    var age = S.t - m.t0
    var bus = readBus(m.P.inBus)
    var waiting = bus[HOT_TI] || 0
    if (m.phase === 'blocked' && age >= HOLD_TICKS) {
      check('mill_blocked_full', waiting === 1 && Object.keys(m.seen).length === 0 && m.energyUsed === 0, 'steam hatch full (' + m.steamCap + ' mB): the hot ingot ' +
        (waiting === 1 ? 'still waits' : 'is gone') + ', products [' + summary(millProducts(m)) + '], ' + m.energyUsed + ' EU drawn | ' + state(m.ctrl) +
        ' reasons=[' + failureReasons(m.ctrl).join(' ; ') + ']')
      setVoiding(m, true)
      m.phase = 'voiding'
      m.t0 = S.t
      return
    }
    if (m.phase === 'voiding' && age >= HOLD_TICKS) {
      var reasons = failureReasons(m.ctrl)
      var shown = reasons.some(function (r) { return NO_VOIDING.test(r) })
      check('mill_no_voiding', waiting === 1 && Object.keys(m.seen).length === 0 && shown, 'steam hatch full, controller set to void fluids: the hot ingot ' +
        (waiting === 1 ? 'still waits' : 'is gone') + ', refusal shown=' + shown + ' | ' + state(m.ctrl) + ' reasons=[' + reasons.join(' ; ') + ']')
      setVoiding(m, false)
      setTank(m.P.steam, STEAM, 0)
      startRoll(m, 'plate')
      return
    }
    if (m.phase === 'roll') {
      var want = TI[m.roll.key]
      var now = (millProducts(m)[want.out] || 0) - m.roll.out0
      var idle = String(m.ctrl.getRecipeLogic().getStatus()) !== 'WORKING'
      var done = now >= want.count && idle
      if (done || age >= ROLL_TIMEOUT) {
        finishRoll(m, done)
        var order = ['plate', 'rods', 'foil']
        var next = order[order.indexOf(m.roll.key) + 1]
        if (next) startRoll(m, next)
        else m.phase = 'done'
      }
    }
  }

  // ---------------------------------------------------------------- run

  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    S.server.runCommandSilent('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    // a roof over the band: a hatch that is rained on may explode (GTM's weather check)
    S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + ROOF_Y + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + ROOF_Y + ' ' + BAND.z1 + ' minecraft:smooth_stone')
    note('AREA', 'band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 +
      ' generated and force-loaded, changed ' + cleared + ' blocks while clearing, roof at Y ' + ROOF_Y)
  }

  function startCopies() {
    S.copies = []
    COPIES.forEach(function (copy) {
      var m = { copy: copy, phase: 'forming', eu: 0, seen: {}, maxPar: 0, maxEut: 0, statuses: {}, energyUsed: 0 }
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

  function formed(m) {
    safely(m.copy.key + '_PARTS', function () {
      m.ctrl = machineAt(m.ctrlPos)
      m.P = findParts(m, m.ctrl)
      var want = {}
      Object.keys(m.copy.parts).forEach(function (k) { want[m.copy.parts[k]] = true })
      var missing = Object.keys(want).filter(function (role) { return !m.P[role] })
      check(m.copy.key + '_PARTS', missing.length === 0, '[' + m.P.ids.join(' ') + ']' + (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''))
      if (missing.length > 0) {
        m.phase = 'done'
        return
      }
      if (m.copy.machine === PLANT) startPlant(m)
      else startMill(m)
    })
    if (m.phase === 'formed') m.phase = 'done'
  }

  function formStep(m) {
    var waited = S.t - S.t0
    var ctrl = machineAt(m.ctrlPos)
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
      if (!ctrl.checkPatternWithLock()) {
        check(m.copy.key + '_FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(ctrl))
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

  // every tick: what each controller does, the EU of the plants' dynamo hatches, the energy the mill draws
  function measure(m) {
    if (!m.ctrl || m.phase === 'forming' || m.phase === 'formed' || m.phase === 'done') return
    var rlg = m.ctrl.getRecipeLogic()
    var status = String(rlg.getStatus())
    m.statuses[status] = (m.statuses[status] || 0) + 1
    var last = rlg.getLastRecipe()
    if (status === 'WORKING' && last !== null && last !== undefined) {
      m.seen[String(last.id)] = true
      if (last.parallels > m.maxPar) m.maxPar = last.parallels
      var eut = Math.abs(signedEUt(last))
      if (eut > m.maxEut) m.maxEut = eut
    }
    if (m.copy.sink === 'drain') drainDynamo(m)
    if (m.copy.machine === MILL) {
      var c = m.P.energy.energyContainer
      var cap = Number(c.getEnergyCapacity())
      var stored = Number(c.getEnergyStored())
      if (m.primed) m.energyUsed += cap - stored
      c.setEnergyStored(cap)
      m.primed = true
    }
  }

  function step(m) {
    if (m.phase === 'forming') formStep(m)
    else if (m.copy.machine === PLANT) plantStep(m)
    else millStep(m)
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    console.info(TAG + SCOPE + '|DONE')
  }

  function onTick(server) {
    if (S === null || S.finished) return
    S.t = server.getTickCount() - S.tick0
    try {
      S.copies.forEach(function (m) {
        try {
          measure(m)
          if (m.phase === 'forming' ? S.t % STEP === 0 : true) step(m)
        } catch (e) {
          check(m.copy.key + '_STEP', false, 'exception in ' + m.phase + ': ' + e)
          m.phase = 'done'
        }
      })
    } catch (e2) {
      check('STEP', false, 'exception: ' + e2)
      S.copies.forEach(function (m) { m.phase = 'done' })
    }
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
      finish()
    }
  }

  function run(server) {
    S = { server: server, level: server.overworld(), t: 0, tick0: server.getTickCount(), copies: [], finished: false }
    try {
      staticChecks()
    } catch (e) {
      check('static', false, 'exception: ' + e)
    }
    try {
      prepareWorld()
    } catch (e2) {
      check('AREA', false, 'exception: ' + e2)
    }
    startCopies()
    if (S.copies.every(function (m) { return m.phase === 'done' })) finish()
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick(event.server)
  })

  ServerEvents.customCommand('gg_test_combined_cycle_and_hot_mill', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_combined_cycle_and_hot_mill run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
