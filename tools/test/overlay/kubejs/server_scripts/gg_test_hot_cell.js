// Gregtech Grindless - smoke test of package IV-A3, hot-cell (TEST-ONLY overlay: copied over the instance on the test PC, never shipped
// with the pack): IV's Hot Cell (gtceu:hot_cell and its recipe type gtceu:hot_cell), startup_scripts/grindless/iv/hot_cell.js,
// server_scripts/grindless/iv/hot_cell.js, server_scripts/grindless/lib/compose.js and data/grindless/tables/hot_cell.json.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_hot_cell;;kubejs custom_command gg_test_recipe_lookup;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|hot_cell\|DONE@@900;;GGTEST\|lookup\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|hot_cell|<check>|PASS|FAIL|NOTE|<detail>
//   shared_ids          IV-A1's items the recipes take and make exist, and GT--'s casing and waste
//   registration        gtceu:hot_cell on its own type gtceu:hot_cell, not a generator, with a structure description
//   furnace             the electric furnace EU/t the radon composition pays for its smelting was read from GTM (4 EU/t)
//   composed            enrichment and radon were composed from their 4 and 2 live GTM stages, none skipped, with the design's figures:
//                       30 uraninite + 40 000 mB HF -> 1 U-235 + 9 U-238 + 40 000 mB F2 + 20 000 mB water for 1 020 000 EU of stages;
//                       1 U-238 + 10 000 mB air -> 1 000 mB radon for 1 926 400 EU (4 000 t x 480 + 8 smelts x 200 t x 4); each spent
//                       at no more than 7 680 EU/t and at most one EU/t over the stages' energy
//   own_recipes         the table's six recipes (MOX, breeder, RTG pellet, Pu-Be source, the two reprocessings) were built, none skipped
//   live_contents       every recipe of the script is in the recipe manager under grindless:hot_cell/<name> with exactly its published
//                       contents: items (counts, chances), circuit, fluids, EU/t, duration and the EMI data key
//   lookup_safety       no recipe of the type takes a subset of another's ingredients (static; gg_test_recipe_lookup asks GTM's lookup)
//   controller_recipe   grindless:assembler/hot_cell exists and holds its parts
//   plutonium           NOTE: the plutonium balance from the live recipes, next to the reactor's EU per assembly
//   <copy>_PLACED / _FORMED / _PARTS   the two copies below
//   PROCESS_enrichment  copy chain: 30 uraninite + 40 000 mB HF, circuit 1 -> exactly 1 U-235, 9 U-238, 20 000 mB water and 40 000 mB F2;
//                       the EU drawn from the energy hatch is exactly the recipe's
//   PROCESS_radon       copy chain: a U-238 + 10 000 mB air, circuit 4 -> 1 000 mB radon; no plutonium anywhere
//   PROCESS_mox         copy fuel: 2 Pu + 8 U-238 + 4 Zircaloy tubes + 20 000 mB O2 + 100 mB He, circuit 2 -> 1 MOX assembly
//   PROCESS_reprocess   copy fuel: 1 spent fuel assembly + 4 000 mB HNO3, circuit 3 -> 8 U-238, 1 Pu, 1 waste, 0-1 Cs and Nd, 4 000 mB
//                       NO2, 200 mB Xe, 40 mB Kr
//   contained_room      copy fuel: output bus full -> the next spent assembly does not start (no acid used, no EU)
//   no_voiding_items    the same with the controller set to void items: refused, and the refusal is shown
//   no_voiding_fluids   bus emptied, controller set to void fluids: refused, and the refusal is shown
//   resumes             voiding off: the run goes through, and its waste is in the bus
//   hot_cell|DONE       last line
//
// Copies (controllers face north at z 2, the structures are behind them, z 2-5; parts on the service wall at z 5, facing south):
//   chain (x 10246) and fuel (x 10262). Service wall, bottom row, left to right as seen from the front: energy hatch, input bus,
//   output bus, two input hatches, two output hatches; the third output hatch at the left end of the row above.
// TEST AREA: this test builds, force-loads and clears ONLY its own band of the overworld, X 10240-10303, Y 98-112, Z 0-15 (AGENTS.md:
// tests run at the same time in one server), with a roof at Y 111 so no hatch is rained on. The structures come from the description
// lib/patterns.js records (global.grindless.structures). Uraninite, HF, plutonium, U-238, the Zircaloy tubes and the spent assembly are
// injected: their IV sources (the leach field, the kiln, the fuel fabrication plant, the reactor) are other packages or other machines.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'hot_cell'
  var BAND = { x0: 10240, x1: 10303, y0: 98, y1: 112, z0: 0, z1: 15 }
  var ROOF_Y = 111
  var Y = 100
  var STEP = 10
  var FORM_TIMEOUT = 600
  var HOLD_TICKS = 60
  var SLACK = 120

  // the command only leaves a request in `global` (it survives script reloads); the tick handler starts the test once these scripts have
  // been loaded for QUIET_MS (same as the other tests)
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestHotCellRequest'

  var MACHINE = 'gtceu:hot_cell'
  var TYPE = 'gtceu:hot_cell'
  var MAX_EUT = 7680
  var ROLE_BLOCKS = {
    energy: 'gtceu:iv_energy_input_hatch',
    inBus: 'gtceu:iv_input_bus',
    outBus: 'gtceu:iv_output_bus',
    in1: 'gtceu:iv_input_hatch',
    in2: 'gtceu:iv_input_hatch',
    out1: 'gtceu:iv_output_hatch',
    out2: 'gtceu:iv_output_hatch',
    out3: 'gtceu:iv_output_hatch'
  }
  // 'slice,row,column' of the description (slice 0 = the service wall) -> role
  var PARTS = { '0,0,0': 'energy', '0,0,1': 'inBus', '0,0,2': 'outBus', '0,0,3': 'in1', '0,0,4': 'in2', '0,0,5': 'out1', '0,0,6': 'out2', '0,1,0': 'out3' }
  var OUTS = ['out1', 'out2', 'out3']
  var INS = ['in1', 'in2']
  var COPIES = [
    { key: 'chain', x: 10246, z: 2 },
    { key: 'fuel', x: 10262, z: 2 }
  ]

  var U235 = 'gtceu:uranium_235_dust'
  var U238 = 'gtceu:uranium_dust'
  var URANINITE = 'gtceu:uraninite_dust'
  var PU = 'gtceu:plutonium_dust'
  var PU_INGOT = 'gtceu:plutonium_ingot'
  var TUBE = 'grindless:zircaloy_cladding_tube'
  var MOX = 'grindless:mox_fuel_assembly'
  var SPENT = 'grindless:spent_fuel_assembly'
  var WASTE = 'gtnn:radioactive_waste'
  var FILLER = 'minecraft:cobblestone'
  var HF = 'gtceu:hydrofluoric_acid'
  var F2 = 'gtceu:fluorine'
  var WATER = 'minecraft:water'
  var AIR = 'gtceu:air'
  var RADON = 'gtceu:radon'
  var O2 = 'gtceu:oxygen'
  var HE = 'gtceu:helium'
  var HNO3 = 'gtceu:nitric_acid'
  var NO2 = 'gtceu:nitrogen_dioxide'
  var XE = 'gtceu:xenon'
  var KR = 'gtceu:krypton'
  var CS = 'gtceu:caesium_dust'
  var ND = 'gtceu:neodymium_dust'
  var SHARED_ITEMS = ['grindless:mox_fuel_assembly', 'grindless:breeder_fuel_assembly', 'grindless:spent_fuel_assembly', 'grindless:spent_breeder_assembly',
    'grindless:pube_neutron_source', 'grindless:rtg_pellet', 'grindless:zircaloy_cladding_tube', 'gtnn:radioactive_waste', 'gtnn:radiation_proof_machine_casing']
  var NO_VOIDING = /grindless\.machine\.hot_cell\.no_voiding|Turn voiding off/

  // the design (docs/eras/iv.md, "Hot cell", and the package statement): what the composed recipes must give
  var WANT_COMPOSED = {
    enrichment: {
      circuit: 1, sourceEnergy: 1020000, stages: 4,
      itemsIn: [[URANINITE, 30]], fluidsIn: [[HF, 40000]], itemsOut: [[U235, 1], [U238, 9]], fluidsOut: [[F2, 40000], [WATER, 20000]]
    },
    radon: {
      circuit: 4, sourceEnergy: 1926400, stages: 2,
      itemsIn: [[U238, 1]], fluidsIn: [[AIR, 10000]], itemsOut: [], fluidsOut: [[RADON, 1000]]
    }
  }
  var WANT_OWN = ['mox_fuel_assembly', 'breeder_fuel_assembly', 'rtg_pellet', 'pube_neutron_source', 'reprocess_spent_fuel', 'reprocess_spent_breeder']

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
        VoidingMode: Java.loadClass('com.gregtechceu.gtceu.api.machine.feature.IVoidable$VoidingMode')
      }
    }
    return classes
  }

  function HC() {
    return global.grindless.hotCell || {}
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

  function short(id) {
    return String(id).replace(/^(gtceu|grindless|minecraft|gtnn):/, '')
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

  function itemName(stack) {
    try {
      return String(lazy().Registries.ITEMS.getKey(stack.getItem()))
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
      var id = itemName(st)
      counts[id] = (counts[id] || 0) + Number(st.getCount())
    }
    return counts
  }

  function emptyBus(bus) {
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, lazy().ItemStack.EMPTY)
  }

  function fillBus(bus, id) {
    var inv = bus.getInventory()
    for (var i = 0; i < inv.getSlots(); i++) inv.setStackInSlot(i, Item.of(id, 64))
    return inv.getSlots()
  }

  // inserts n of an item, slot after slot (an assembly may not stack to n)
  function insert(bus, id, n) {
    var inv = bus.getInventory()
    var left = n
    for (var s = 0; s < inv.getSlots() && left > 0; s++) {
      var rest = inv.insertItem(s, Item.of(id, left), false)
      left = rest.isEmpty() ? 0 : Number(rest.getCount())
    }
    if (left > 0) throw new Error('could only insert ' + (n - left) + ' of ' + n + ' ' + id)
  }

  function summary(counts) {
    var keys = Object.keys(counts)
    return keys.length === 0 ? 'empty' : keys.map(function (k) { return short(k) + ' x' + counts[k] }).join(', ')
  }

  function outFluids(m) {
    var t = {}
    OUTS.forEach(function (role) {
      var info = tankInfo(m.P[role])
      if (info.amount > 0) t[info.id] = (t[info.id] || 0) + info.amount
    })
    return t
  }

  function fluidSummary(t) {
    var keys = Object.keys(t)
    return keys.length === 0 ? 'none' : keys.map(function (k) { return short(k) + ' ' + t[k] + ' mB' }).join(', ')
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

  function fluidContents(recipe, input) {
    var c = lazy()
    return asArray(input ? c.RecipeHelper.getInputFluids(recipe) : c.RecipeHelper.getOutputFluids(recipe)).map(function (st) {
      return { id: fluidName(st), amount: Number(st.getAmount()) }
    })
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

  function statusOf(ctrl) {
    return String(ctrl.getRecipeLogic().getStatus())
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

  function published(name) {
    return (HC().recipes || []).filter(function (r) { return r.name === name })[0] || null
  }

  // ---------------------------------------------------------------- static checks

  function sharedIdsPresent() {
    var missing = SHARED_ITEMS.filter(function (id) { return !Item.exists(id) })
    check('shared_ids', missing.length === 0, missing.length === 0 ? SHARED_ITEMS.length + ' shared items exist (IV-A1\'s and GT--\'s)' :
      'missing (IV-A1 not merged?): ' + missing.join(', '))
    return missing.length === 0
  }

  // [[id, n], ...] against [{ id, count|whole|amount }]
  function sameList(want, got, field) {
    if (want.length !== got.length) return false
    for (var i = 0; i < want.length; i++) {
      var g = got.filter(function (x) { return x.id === want[i][0] })[0]
      if (!g || Number(g[field]) !== want[i][1]) return false
      if (field === 'whole' && g.chance > 0) return false
      if (field === 'count' && g.chance < 10000) return false
    }
    return true
  }

  function staticChecks() {
    safely('registration', function () {
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
      check('registration', problems.length === 0, MACHINE + ': types=[' + types.join(',') + '] generator=' + def.isGenerator() +
        ' alwaysTryModifyRecipe=' + def.isAlwaysTryModifyRecipe() + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('furnace', function () {
      var f = HC().furnace || {}
      check('furnace', f.from === 'gtm' && f.eut === 4, 'electric furnace EU/t ' + f.eut + ' read from ' + f.from + ' (GTM 7.5.3 prepares its builder with 4)')
    })

    safely('composed', function () {
      var problems = []
      var lines = []
      var skipped = HC().skipped || []
      if (skipped.length > 0) problems.push('skipped: ' + skipped.map(function (s) { return s.name + ' (' + s.reason + ')' }).join(', '))
      if (HC().stagesRead !== 6) problems.push(HC().stagesRead + ' live stages read of 6')
      Object.keys(WANT_COMPOSED).forEach(function (name) {
        var w = WANT_COMPOSED[name]
        var r = published(name)
        if (r === null) {
          problems.push(name + ' missing')
          return
        }
        if (r.kind !== 'composed' || r.circuit !== w.circuit) problems.push(name + ' kind ' + r.kind + ' circuit ' + r.circuit)
        if ((r.sources || []).length !== w.stages) problems.push(name + ' ' + (r.sources || []).length + ' stages')
        if (Math.abs(r.sourceEnergy - w.sourceEnergy) > 1e-6) problems.push(name + ' stages ' + r.sourceEnergy + ' EU, design ' + w.sourceEnergy)
        if (!(r.energy >= r.sourceEnergy && r.energy < r.sourceEnergy + r.duration)) problems.push(name + ' costs ' + r.energy + ' EU for ' + r.sourceEnergy)
        if (!(r.eut <= MAX_EUT)) problems.push(name + ' ' + r.eut + ' EU/t')
        if (!sameList(w.itemsIn, r.itemsIn, 'count')) problems.push(name + ' items in ' + JSON.stringify(r.itemsIn))
        if (!sameList(w.fluidsIn, r.fluidsIn, 'amount')) problems.push(name + ' fluids in ' + JSON.stringify(r.fluidsIn))
        if (!sameList(w.itemsOut, r.itemsOut, 'whole')) problems.push(name + ' items out ' + JSON.stringify(r.itemsOut))
        if (!sameList(w.fluidsOut, r.fluidsOut, 'amount')) problems.push(name + ' fluids out ' + JSON.stringify(r.fluidsOut))
        lines.push(name + ': ' + r.itemsIn.map(function (x) { return x.count + ' ' + short(x.id) }).concat(r.fluidsIn.map(function (f) { return f.amount + ' mB ' + short(f.id) })).join(' + ') +
          ' -> ' + r.itemsOut.map(function (x) { return x.whole + ' ' + short(x.id) }).concat(r.fluidsOut.map(function (f) { return f.amount + ' mB ' + short(f.id) })).join(' + ') +
          ', stages ' + (r.sources || []).map(function (s) { return short(s.id) + ' x' + s.scale }).join(' ') + ' = ' + r.sourceEnergy + ' EU, spent as ' +
          r.duration + ' t x ' + r.eut + ' EU/t = ' + r.energy)
      })
      check('composed', problems.length === 0, lines.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('own_recipes', function () {
      var names = (HC().recipes || []).filter(function (r) { return r.kind === 'own' }).map(function (r) { return r.name })
      var missing = WANT_OWN.filter(function (n) { return names.indexOf(n) < 0 })
      check('own_recipes', missing.length === 0 && names.length === WANT_OWN.length, names.length + ' own recipes [' + names.join(', ') + ']' +
        (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''))
    })

    safely('live_contents', function () {
      var problems = []
      var sets = []
      var recipes = HC().recipes || []
      recipes.forEach(function (rec) {
        var r = liveRecipe(rec.recipeId)
        if (r === null) {
          problems.push(rec.recipeId + ' not in the recipe manager')
          return
        }
        var items = itemContents(r, true)
        var circuit = items.filter(function (x) { return x.circuit > 0 })
        var ins = items.filter(function (x) { return x.circuit === 0 })
        if (circuit.length !== 1 || circuit[0].circuit !== rec.circuit) problems.push(rec.name + ' circuit ' + JSON.stringify(circuit))
        var wantIn = rec.itemsIn.map(function (x) { return x.id + ' x' + x.count + ' @' + x.chance }).sort().join(',')
        var gotIn = ins.map(function (x) { return x.id + ' x' + x.count + ' @' + x.chance }).sort().join(',')
        if (wantIn !== gotIn) problems.push(rec.name + ' items in ' + gotIn + ' (want ' + wantIn + ')')
        var wantOut = []
        rec.itemsOut.forEach(function (o) {
          if (o.whole > 0) wantOut.push(o.id + ' x' + o.whole + ' @10000')
          if (o.chance > 0) wantOut.push(o.id + ' x1 @' + o.chance)
        })
        var gotOut = itemContents(r, false).map(function (x) { return x.id + ' x' + x.count + ' @' + x.chance })
        if (wantOut.sort().join(',') !== gotOut.sort().join(',')) problems.push(rec.name + ' items out ' + gotOut.join(',') + ' (want ' + wantOut.join(',') + ')')
        var fin = fluidContents(r, true).map(function (f) { return f.id + ' ' + f.amount }).sort().join(',')
        var fout = fluidContents(r, false).map(function (f) { return f.id + ' ' + f.amount }).sort().join(',')
        if (fin !== rec.fluidsIn.map(function (f) { return f.id + ' ' + f.amount }).sort().join(',')) problems.push(rec.name + ' fluids in ' + fin)
        if (fout !== rec.fluidsOut.map(function (f) { return f.id + ' ' + f.amount }).sort().join(',')) problems.push(rec.name + ' fluids out ' + fout)
        var eut = inputEUt(r)
        if (eut !== rec.eut || Number(r.duration) !== rec.duration) problems.push(rec.name + ' ' + eut + ' EU/t x ' + r.duration + ' t')
        var key = String(r.data.getString(HC().dataKey))
        if (key !== rec.name) problems.push(rec.name + ' data ' + HC().dataKey + '=' + key)
        sets.push({ name: rec.name, keys: ins.map(function (x) { return 'i:' + x.id }).concat(fluidContents(r, true).map(function (f) { return 'f:' + f.id }))
          .concat(['circuit:' + rec.circuit]) })
      })
      var live = asArray(S.server.getRecipeManager().getAllRecipesFor(GTRegistries.RECIPE_TYPES.get(rl(TYPE)))).length
      if (live !== recipes.length) problems.push(live + ' live ' + TYPE + ' recipes for ' + recipes.length + ' published')
      check('live_contents', problems.length === 0 && recipes.length === 8, recipes.length + ' recipes checked against the recipe manager' +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      S.sets = sets
    })

    safely('lookup_safety', function () {
      var sets = S.sets || []
      var clashes = []
      function subset(a, b) {
        return a.keys.every(function (k) { return b.keys.indexOf(k) >= 0 })
      }
      for (var i = 0; i < sets.length; i++) {
        for (var j = i + 1; j < sets.length; j++) {
          if (subset(sets[i], sets[j]) || subset(sets[j], sets[i])) clashes.push(sets[i].name + ' / ' + sets[j].name)
        }
      }
      var script = HC().clashes || []
      check('lookup_safety', sets.length === 8 && clashes.length === 0 && script.length === 0, sets.length + ' input sets, none a subset of another' +
        (clashes.length + script.length > 0 ? ' | clashes: ' + clashes.concat(script).join('; ') : ''))
    })

    safely('controller_recipe', function () {
      var r = liveRecipe(HC().craftingRecipe)
      if (r === null) throw new Error(HC().craftingRecipe + ' missing')
      var outs = itemContents(r, false)
      var ids = itemContents(r, true).map(function (x) { return x.id })
      var missing = (HC().craftingParts || []).filter(function (id) { return id !== MACHINE && ids.indexOf(id) < 0 })
      check('controller_recipe', outs.length === 1 && outs[0].id === MACHINE && missing.length === 0, HC().craftingRecipe + ' -> ' +
        outs.map(function (x) { return x.id }).join(',') + ' from [' + ids.map(short).join(', ') + '] at ' + inputEUt(r) + ' EU/t' +
        (missing.length > 0 ? ' | missing: ' + missing.join(',') : ''))
    })

    safely('plutonium', function () {
      function count(rec, id, side) {
        var list = side === 'in' ? rec.itemsIn : rec.itemsOut
        return list.filter(function (x) { return x.id === id }).reduce(function (a, x) { return a + (side === 'in' ? x.count : x.whole) }, 0)
      }
      var mox = published('mox_fuel_assembly')
      var breeder = published('breeder_fuel_assembly')
      var spent = published('reprocess_spent_fuel')
      var spentB = published('reprocess_spent_breeder')
      var rtg = published('rtg_pellet')
      var pube = published('pube_neutron_source')
      if (!mox || !breeder || !spent || !spentB || !rtg || !pube) throw new Error('a recipe of the balance is missing')
      var FR = global.grindless.fissionReactor || {}
      var gEu = {}
      ;(FR.cores || []).forEach(function (c) { gEu[c.name] = (c.euPerChannel * FR.cycleTicks * (10000 / FR.wearChance) / 1e9).toFixed(2) })
      var back = count(spent, PU, 'out')
      var backB = count(spentB, PU, 'out')
      note('plutonium', 'spent LEU or MOX assembly -> ' + back + ' Pu + ' + count(spent, U238, 'out') + ' U-238; LEU (reactor ' + gEu.leu_light_water +
        ' G light / ' + gEu.leu_heavy_water + ' G heavy): net +' + back + ' Pu; MOX (' + gEu.mox_heavy_water + ' G) takes ' + count(mox, PU, 'in') +
        ' Pu + ' + count(mox, U238, 'in') + ' U-238: net ' + (back - count(mox, PU, 'in')) + ' Pu; breeder (' + gEu.breeder + ' G) takes ' +
        count(breeder, PU_INGOT, 'in') + ' Pu ingot + ' + count(breeder, 'gtceu:uranium_ingot', 'in') + ' U-238 ingots, its spent assembly gives ' + backB +
        ' Pu + ' + count(spentB, U238, 'out') + ' U-238: net +' + (backB - count(breeder, PU_INGOT, 'in')) + ' Pu; RTG pellet -' + count(rtg, PU, 'in') +
        ' Pu; Pu-Be source -' + count(pube, PU, 'in') + ' Pu')
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
    var cy = Y + ctrl.ri
    var cells = []
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          var c = { x: copy.x - (ci - ctrl.ci), y: cy + (ri - ctrl.ri), z: copy.z - (si - ctrl.si), ch: ch, id: null, props: '', role: null }
          var role = PARTS[si + ',' + ri + ',' + ci]
          if (sym.kind === 'controller') {
            c.id = MACHINE
            c.props = '[facing=north]'
            c.role = 'controller'
          } else if (sym.kind === 'air' || sym.kind === 'any') {
            continue
          } else if (role !== undefined) {
            c.id = ROLE_BLOCKS[role]
            c.props = '[facing=south]'
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
    var wrong = []
    plan.cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.ch + ' wanted ' + c.id + ' got ' + got)
    })
    var bill = Object.keys(tally).sort().map(function (id) { return short(id) + ' x' + tally[id] }).join(', ')
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
      P.ids.push(short(p.getDefinition().getId()) + (role ? '=' + role : ''))
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

  function setVoiding(m, mode) {
    m.ctrl.setVoidingMode(lazy().VoidingMode[mode])
    wake(m.ctrl)
  }

  // the energy hatch is topped up every tick; what it lost since the last tick is what the hot cell drew
  function meter(m) {
    var c = m.P.energy.energyContainer
    var cap = Number(c.getEnergyCapacity())
    var stored = Number(c.getEnergyStored())
    if (m.metered) m.euUsed += cap - stored
    c.setEnergyStored(cap)
    m.metered = true
  }

  // empties every part (the circuit too) and starts a scenario: items into the input bus, fluids into the input hatches
  function load(m, sc) {
    emptyBus(m.P.inBus)
    emptyBus(m.P.outBus)
    INS.forEach(function (role) { setTank(m.P[role], null, 0) })
    OUTS.forEach(function (role) { setTank(m.P[role], null, 0) })
    m.P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(sc.circuit))
    ;(sc.items || []).forEach(function (x) { insert(m.P.inBus, x[0], x[1]) })
    ;(sc.fluids || []).forEach(function (f, i) { setTank(m.P[INS[i]], f[0], f[1]) })
    begin(m, sc.phase)
  }

  function begin(m, phase) {
    m.phase = phase
    m.t0 = S.t
    m.seen = {}
    m.seenWorking = false
    m.eu0 = m.euUsed
    wake(m.ctrl)
  }

  function runOver(m, age, duration) {
    return (m.seenWorking && statusOf(m.ctrl) === 'IDLE') || age >= duration + SLACK
  }

  function recipeOf(name) {
    var r = published(name)
    if (r === null) throw new Error('recipe ' + name + ' was not published')
    return r
  }

  // what a run left: items in the output bus, fluids in the output hatches, what is still in the inputs and the EU drawn
  function result(m) {
    return {
      out: readBus(m.P.outBus),
      fluids: outFluids(m),
      left: readBus(m.P.inBus),
      tanks: INS.map(function (role) { return tankInfo(m.P[role]) }),
      eu: m.euUsed - m.eu0
    }
  }

  function chainStep(m, age) {
    if (m.phase === 'enrichment' && runOver(m, age, recipeOf('enrichment').duration)) {
      var rec = recipeOf('enrichment')
      var r = result(m)
      var problems = []
      if (m.seen[rec.recipeId] !== true) problems.push(rec.recipeId + ' never ran (seen ' + Object.keys(m.seen).join(',') + ')')
      if ((r.out[U235] || 0) !== 1 || (r.out[U238] || 0) !== 9 || Object.keys(r.out).length !== 2) problems.push('items out ' + summary(r.out))
      if ((r.fluids[F2] || 0) !== 40000 || (r.fluids[WATER] || 0) !== 20000 || Object.keys(r.fluids).length !== 2) problems.push('fluids out ' + fluidSummary(r.fluids))
      if (Object.keys(r.left).length !== 0 || r.tanks[0].amount !== 0) problems.push('left ' + summary(r.left) + ', ' + r.tanks[0].amount + ' mB ' + r.tanks[0].id)
      if (r.eu !== rec.energy) problems.push(r.eu + ' EU drawn, the recipe is ' + rec.energy)
      check('PROCESS_enrichment', problems.length === 0, '30 uraninite + 40 000 mB HF, circuit 1 -> [' + summary(r.out) + '], ' + fluidSummary(r.fluids) +
        '; ' + r.eu + ' EU drawn (' + rec.duration + ' t x ' + rec.eut + ' EU/t) | ' + state(m.ctrl) + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      // the radon run takes a U-238 like the ones the enrichment just made
      var hadU238 = (r.out[U238] || 0) > 0
      emptyBus(m.P.outBus)
      OUTS.forEach(function (role) { setTank(m.P[role], null, 0) })
      if (!hadU238) {
        check('PROCESS_radon', false, 'no U-238 from the enrichment to start it')
        m.phase = 'done'
        return
      }
      insert(m.P.inBus, U238, 1)
      m.P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(4))
      setTank(m.P.in1, AIR, 10000)
      begin(m, 'radon')
      return
    }
    if (m.phase === 'radon' && runOver(m, age, recipeOf('radon').duration)) {
      var rec2 = recipeOf('radon')
      var r2 = result(m)
      var problems2 = []
      if (m.seen[rec2.recipeId] !== true) problems2.push(rec2.recipeId + ' never ran (seen ' + Object.keys(m.seen).join(',') + ')')
      if ((r2.fluids[RADON] || 0) !== 1000 || Object.keys(r2.fluids).length !== 1) problems2.push('fluids out ' + fluidSummary(r2.fluids))
      if (Object.keys(r2.out).length !== 0) problems2.push('items out ' + summary(r2.out) + ' (the plutonium stays inside)')
      if (Object.keys(r2.left).length !== 0 || r2.tanks[0].amount !== 0) problems2.push('left ' + summary(r2.left) + ', ' + r2.tanks[0].amount + ' mB air')
      if (r2.eu !== rec2.energy) problems2.push(r2.eu + ' EU drawn, the recipe is ' + rec2.energy)
      check('PROCESS_radon', problems2.length === 0, 'a U-238 + 10 000 mB air, circuit 4, no plutonium anywhere -> ' + fluidSummary(r2.fluids) +
        ', items out [' + summary(r2.out) + ']; ' + r2.eu + ' EU drawn | ' + state(m.ctrl) + (problems2.length > 0 ? ' | problems: ' + problems2.join('; ') : ''))
      m.phase = 'done'
    }
  }

  function reprocessProblems(m, r, rec) {
    var problems = []
    if (m.seen[rec.recipeId] !== true) problems.push(rec.recipeId + ' never ran (seen ' + Object.keys(m.seen).join(',') + ')')
    var extra = Object.keys(r.out).filter(function (id) { return [U238, PU, WASTE, CS, ND, FILLER].indexOf(id) < 0 })
    if ((r.out[U238] || 0) !== 8 || (r.out[PU] || 0) !== 1 || (r.out[WASTE] || 0) !== 1 || (r.out[CS] || 0) > 1 || (r.out[ND] || 0) > 1 || extra.length > 0) {
      problems.push('items out ' + summary(r.out))
    }
    if ((r.fluids[NO2] || 0) !== 4000 || (r.fluids[XE] || 0) !== 200 || (r.fluids[KR] || 0) !== 40 || Object.keys(r.fluids).length !== 3) {
      problems.push('fluids out ' + fluidSummary(r.fluids))
    }
    if ((r.left[SPENT] || 0) !== 0 || r.tanks[0].amount !== 0) problems.push('left ' + summary(r.left) + ', ' + r.tanks[0].amount + ' mB HNO3')
    if (r.eu !== rec.energy) problems.push(r.eu + ' EU drawn, the recipe is ' + rec.energy)
    return problems
  }

  // nothing ran since the scenario began: the acid and the spent assembly are untouched and no EU was drawn
  function stillBlocked(m) {
    return tankInfo(m.P.in1).amount === 4000 && (readBus(m.P.inBus)[SPENT] || 0) === 1 && m.euUsed === m.eu0 && Object.keys(m.seen).length === 0
  }

  function blockedDetail(m) {
    return tankInfo(m.P.in1).amount + ' mB HNO3 left, ' + (readBus(m.P.inBus)[SPENT] || 0) + ' spent assembly in the bus, ' + (m.euUsed - m.eu0) + ' EU, ran [' +
      Object.keys(m.seen).join(',') + '] | ' + state(m.ctrl) + ' reasons=[' + failureReasons(m.ctrl).join(' ; ') + ']'
  }

  function loadSpent(m) {
    insert(m.P.inBus, SPENT, 1)
    setTank(m.P.in1, HNO3, 4000)
  }

  function fuelStep(m, age) {
    if (m.phase === 'mox' && runOver(m, age, recipeOf('mox_fuel_assembly').duration)) {
      var rec = recipeOf('mox_fuel_assembly')
      var r = result(m)
      var problems = []
      if (m.seen[rec.recipeId] !== true) problems.push(rec.recipeId + ' never ran (seen ' + Object.keys(m.seen).join(',') + ')')
      if ((r.out[MOX] || 0) !== 1 || Object.keys(r.out).length !== 1) problems.push('items out ' + summary(r.out))
      if (Object.keys(r.left).length !== 0 || r.tanks[0].amount !== 0 || r.tanks[1].amount !== 0) {
        problems.push('left ' + summary(r.left) + ', ' + r.tanks.map(function (t) { return t.amount + ' mB ' + short(t.id) }).join(', '))
      }
      if (Object.keys(r.fluids).length !== 0) problems.push('fluids out ' + fluidSummary(r.fluids))
      if (r.eu !== rec.energy) problems.push(r.eu + ' EU drawn, the recipe is ' + rec.energy)
      check('PROCESS_mox', problems.length === 0, '2 Pu + 8 U-238 + 4 Zircaloy tubes + 20 000 mB O2 + 100 mB He, circuit 2 -> [' + summary(r.out) + ']; ' + r.eu +
        ' EU drawn | ' + state(m.ctrl) + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      load(m, { phase: 'reprocess', circuit: 3, items: [[SPENT, 1]], fluids: [[HNO3, 4000]] })
      return
    }
    if (m.phase === 'reprocess' && runOver(m, age, recipeOf('reprocess_spent_fuel').duration)) {
      var rec2 = recipeOf('reprocess_spent_fuel')
      var r2 = result(m)
      var problems2 = reprocessProblems(m, r2, rec2)
      check('PROCESS_reprocess', problems2.length === 0, '1 spent fuel assembly + 4 000 mB HNO3, circuit 3 -> [' + summary(r2.out) + '], ' + fluidSummary(r2.fluids) +
        '; ' + r2.eu + ' EU drawn | ' + state(m.ctrl) + (problems2.length > 0 ? ' | problems: ' + problems2.join('; ') : ''))
      // containment: the output bus full, then voiding, then free again
      emptyBus(m.P.outBus)
      OUTS.forEach(function (role) { setTank(m.P[role], null, 0) })
      m.busSlots = fillBus(m.P.outBus, FILLER)
      loadSpent(m)
      begin(m, 'room')
      return
    }
    if (m.phase === 'room' && age >= HOLD_TICKS) {
      check('contained_room', stillBlocked(m), 'output bus full (' + m.busSlots + ' slots of ' + FILLER + '): ' + blockedDetail(m))
      setVoiding(m, 'VOID_ITEMS')
      begin(m, 'void_items')
      return
    }
    if (m.phase === 'void_items' && age >= HOLD_TICKS) {
      var shown = failureReasons(m.ctrl).some(function (x) { return NO_VOIDING.test(x) })
      check('no_voiding_items', stillBlocked(m) && shown, 'output bus full, controller set to void items: refusal shown=' + shown + ', ' + blockedDetail(m))
      emptyBus(m.P.outBus)
      setVoiding(m, 'VOID_FLUIDS')
      begin(m, 'void_fluids')
      return
    }
    if (m.phase === 'void_fluids' && age >= HOLD_TICKS) {
      var shown2 = failureReasons(m.ctrl).some(function (x) { return NO_VOIDING.test(x) })
      check('no_voiding_fluids', stillBlocked(m) && shown2, 'bus emptied, controller set to void fluids: refusal shown=' + shown2 + ', ' + blockedDetail(m))
      setVoiding(m, 'VOID_NONE')
      begin(m, 'resume')
      return
    }
    if (m.phase === 'resume' && runOver(m, age, recipeOf('reprocess_spent_fuel').duration)) {
      var rec3 = recipeOf('reprocess_spent_fuel')
      var r3 = result(m)
      var problems3 = reprocessProblems(m, r3, rec3)
      check('resumes', problems3.length === 0, 'voiding off: [' + summary(r3.out) + '], ' + fluidSummary(r3.fluids) + '; ' + r3.eu + ' EU drawn | ' + state(m.ctrl) +
        (problems3.length > 0 ? ' | problems: ' + problems3.join('; ') : ''))
      m.phase = 'done'
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
      var m = { copy: copy, phase: 'forming', seen: {}, seenWorking: false, euUsed: 0, eu0: 0, metered: false }
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

  function start(m) {
    if (m.copy.key === 'chain') {
      load(m, { phase: 'enrichment', circuit: 1, items: [[URANINITE, 30]], fluids: [[HF, 40000]] })
    } else {
      load(m, { phase: 'mox', circuit: 2, items: [[PU, 2], [U238, 8], [TUBE, 4]], fluids: [[O2, 20000], [HE, 100]] })
    }
  }

  function formed(m) {
    safely(m.copy.key + '_PARTS', function () {
      m.ctrl = machineAt(m.ctrlPos)
      m.P = findParts(m, m.ctrl)
      var want = {}
      Object.keys(PARTS).forEach(function (k) { want[PARTS[k]] = true })
      var missing = Object.keys(want).filter(function (role) { return !m.P[role] })
      check(m.copy.key + '_PARTS', missing.length === 0, '[' + m.P.ids.join(' ') + ']' + (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''))
      if (missing.length > 0) {
        m.phase = 'done'
        return
      }
      meter(m)
      start(m)
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

  // every tick: the energy the controller drew, and what it runs
  function measure(m) {
    if (!m.ctrl || m.phase === 'forming' || m.phase === 'formed' || m.phase === 'done') return
    meter(m)
    var rlg = m.ctrl.getRecipeLogic()
    var last = rlg.getLastRecipe()
    if (String(rlg.getStatus()) === 'WORKING' && last !== null && last !== undefined) {
      m.seenWorking = true
      m.seen[String(last.id)] = true
    }
  }

  function step(m) {
    if (m.phase === 'forming') {
      formStep(m)
      return
    }
    var age = S.t - m.t0
    if (m.copy.key === 'chain') chainStep(m, age)
    else fuelStep(m, age)
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
    var shared = false
    try {
      shared = sharedIdsPresent()
      staticChecks()
    } catch (e) {
      check('static', false, 'exception: ' + e)
    }
    if (!shared) {
      note('copies', 'skipped: the recipes cannot run without IV-A1\'s registrations')
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

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick(event.server)
  })

  ServerEvents.customCommand('gg_test_hot_cell', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_hot_cell run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
