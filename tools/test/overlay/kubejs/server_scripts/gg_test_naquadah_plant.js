// Gregtech Grindless - smoke test of package IV-B3, naquadah-plant (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack): IV's Naquadah Plant (gtceu:naquadah_plant, recipe type gtceu:naquadah_refining; startup_scripts/grindless/iv/
// naquadah_plant.js, server_scripts/grindless/iv/naquadah_plant.js, data/grindless/tables/naquadah_plant.json) and the EV platinum
// plant's mode 3 (server_scripts/grindless/ev/platinum_plant.js: Mercury's iridosmine -> iridium and osmium), both composed by
// server_scripts/grindless/lib/compose.js; and Productive Bees' naquadah bee recipe, removed.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_naquadah_plant;;kubejs custom_command gg_test_recipe_lookup;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|naquadah_plant\|DONE@@900;;GGTEST\|lookup\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|naquadah_plant|<check>|PASS|FAIL|NOTE|<detail>
//   shared_ids            the ids the recipes take and the structures use exist (IV-A1's, IV-A3's, GT--'s, the EV electrode)
//   registration          gtceu:naquadah_plant on its own type gtceu:naquadah_refining (the IO sizes published), not a generator, with a
//                         structure description
//   naquadah_composed     mode 1 composed from its 5 live GT-- stages, none skipped, with the design's figures: 4 naquadah oxide mixture +
//                         15 antimony trioxide + 40 500 mB HF + the Pu-Be source (100 of 10 000) -> 2 naquadah + titanium and gallium at
//                         5 000 of 10 000 + 10 500 mB hydrogen + 9 000 mB water, for 1 143 960 EU of stages (the activator's run charged the
//                         accelerators' upkeep, 240 EU/t), spent at no more than 7 680 EU/t and at most one EU/t over the stages
//   iridosmine_composed   platinum mode 3 composed from IV-B2's fusion and 9 live GT-- and GTM stages: 10 iridosmine + 10 saltpeter + 3
//                         calcium + 1 000 mB salt water + 12 500 mB HCl + 7 000 mB hydrogen -> 3 iridium + 1 osmium + 3 platinum sludge
//                         residue + 3 metal sludge + 12 calcium chloride + 4 700 mB water + 1 000 mB steam, 1 983 990 EU of stages
//   fusion_live           the fusion stage mode 3 read from global.grindless.mercury.fusion equals IV-B2's live recipe
//                         grindless:solar_processing/iridosmine_fusion (items, fluids, EU/t and duration)
//   live_contents         both recipes are in the recipe manager under their final ids with exactly their published contents
//   lookup_sets           gtceu:naquadah_refining holds one recipe; no gtceu:pgm_refining recipe takes a subset of another's ingredients
//                         (static; gg_test_recipe_lookup asks GTM's lookup)
//   bee_removed           Productive Bees' gcteu:electric_blast_furnace/naquadah_bee is gone
//   controller_recipe     grindless:assembler/naquadah_plant exists and holds its parts
//   balance               NOTE: what one naquadah dust costs, and the share of the accelerators' upkeep
//   <copy>_PLACED / _FORMED / _PARTS   the two copies below
//   no_source             copy naq: every input but the Pu-Be source -> nothing runs (the source holds the window)
//   PROCESS_naquadah      copy naq: the source added -> exactly 2 naquadah dust, 0-1 titanium ingot, 0-1 gallium dust, 10 500 mB hydrogen
//                         and 9 000 mB water; the oxide, the antimony trioxide and the HF used up, the source used up or not; the EU drawn
//                         from the energy hatch is exactly the recipe's
//   PROCESS_iridosmine    copy pt: circuit 3 -> exactly 3 iridium, 1 osmium, 3 platinum sludge residue, 3 metal sludge, 12 calcium
//                         chloride, 4 700 mB water and 1 000 mB steam; every input used up (the electrode or not); the EU exactly the recipe's
//   naquadah_plant|DONE   last line
//
// Copies (controllers face north at z 2, the structures are behind them; parts on the back wall facing south, and two of the platinum
// plant's output hatches on its sides): naq, the naquadah plant (x 11777-11783, IV parts), and pt, a platinum plant (x 11798-11802, EV
// parts). TEST AREA: this test builds, force-loads and clears ONLY its own band of the overworld, X 11776-11839, Y 98-112, Z 0-15
// (AGENTS.md: tests run at the same time in one server), with a roof at Y 111 so no hatch is rained on. The structures come from the
// descriptions lib/patterns.js records (global.grindless.structures). The oxide, the antimony trioxide, the HF, the Pu-Be source, the
// iridosmine and the reagents are injected: their sources (Venus and the ore plant, the fluorspar kiln, the hot cell, Mercury) are other
// packages or other machines.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'naquadah_plant'
  var BAND = { x0: 11776, x1: 11839, y0: 98, y1: 112, z0: 0, z1: 15 }
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
  var REQUEST = 'ggTestNaquadahPlantRequest'

  var NAQ = 'gtceu:naquadah_plant'
  var NAQ_TYPE = 'gtceu:naquadah_refining'
  var PLANT = 'gtceu:platinum_plant'
  var PGM_TYPE = 'gtceu:pgm_refining'
  var NAQ_MAX_EUT = 7680
  var PGM_MAX_EUT = 1920

  var OXIDE = 'gtceu:naquadah_oxide_mixture_dust'
  var SB2O3 = 'gtceu:antimony_trioxide_dust'
  var SOURCE = 'grindless:pube_neutron_source'
  var NQ = 'gtceu:naquadah_dust'
  var TI = 'gtceu:titanium_ingot'
  var GA = 'gtceu:gallium_dust'
  var HF = 'gtceu:hydrofluoric_acid'
  var H2 = 'gtceu:hydrogen'
  var WATER = 'minecraft:water'
  var IRIDOSMINE = 'gtceu:iridosmine_dust'
  var SALTPETER = 'gtceu:saltpeter_dust'
  var CALCIUM = 'gtceu:calcium_dust'
  var ELECTRODE = 'grindless:platinum_electrode'
  var IR = 'gtceu:iridium_dust'
  var OS = 'gtceu:osmium_dust'
  var PSR = 'gtceu:platinum_sludge_residue_dust'
  var SLUDGE = 'gtceu:metal_sludge_dust'
  var CACL2 = 'gtceu:calcium_chloride_dust'
  var SALT_WATER = 'gtceu:salt_water'
  var HCL = 'gtceu:hydrochloric_acid'
  var STEAM = 'gtceu:steam'
  var BEE = 'gcteu:electric_blast_furnace/naquadah_bee'
  var FUSION = 'grindless:solar_processing/iridosmine_fusion'
  var SHARED_ITEMS = [SOURCE, IRIDOSMINE, ELECTRODE, 'gtnn:radiation_proof_machine_casing', 'gtceu:ptfe_pipe_casing', 'gtceu:inert_machine_casing']

  // the design (docs/eras/iv.md, "Naquadah plant" and decision 10; the platinum plant's mode 3): what the composed recipes must give
  var WANT = {
    naquadah: {
      circuit: 1, sourceEnergy: 1143960, maxEut: NAQ_MAX_EUT,
      stages: { 'gtceu:neutron_activator/naquadah': 1, 'gtceu:chemical_reactor/fluoroantimonic_acid': 6, 'gtceu:chemical_reactor/antimony_trifluoride': 3,
        'gtceu:electric_blast_furnace/titanium_trifluoride_separation': 0.5, 'gtceu:vacuum_freezer/cool_hot_titanium_ingot': 0.5 },
      itemsIn: [[OXIDE, 4, 10000], [SB2O3, 15, 10000], [SOURCE, 1, 100]],
      fluidsIn: [[HF, 40500]],
      itemsOut: [[NQ, 2, 0], [TI, 0, 5000], [GA, 0, 5000]],
      fluidsOut: [[H2, 10500], [WATER, 9000]]
    },
    iridosmine: {
      circuit: 3, sourceEnergy: 1983990, maxEut: PGM_MAX_EUT,
      stages: { 'grindless:solar_processing/iridosmine_fusion': 1, 'gtceu:electric_blast_furnace/rarest_metal_residue_ebf': 3,
        'gtceu:distillation_tower/acidic_osmium_solution_distill': 3, 'gtceu:chemical_reactor/osmium_dust_completion': 1,
        'gtceu:electric_blast_furnace/iridium_metal_residue_process': 3, 'gtceu:chemical_reactor/iridium_dioxide_dissolving': 3,
        'gtceu:chemical_reactor/iridium_chloride': 3, 'gtceu:chemical_reactor/iridium_chloride_separation': 3, 'gtceu:chemical_reactor/hydrochloric_acid': 7,
        'gtceu:chemical_reactor/ammonium_chloride': 9 },
      itemsIn: [[IRIDOSMINE, 10, 10000], [SALTPETER, 10, 10000], [CALCIUM, 3, 10000], [ELECTRODE, 1, 10]],
      fluidsIn: [[SALT_WATER, 1000], [HCL, 12500], [H2, 7000]],
      itemsOut: [[IR, 3, 0], [OS, 1, 0], [PSR, 3, 0], [SLUDGE, 3, 0], [CACL2, 12, 0]],
      fluidsOut: [[WATER, 4700], [STEAM, 1000]]
    }
  }

  // the copies: role blocks and where the parts go ('slice,row,column' of the description, slice 0 = the back) with their facing
  var COPIES = [
    {
      key: 'naq', machine: NAQ, x: 11782, z: 2,
      blocks: { energy: 'gtceu:iv_energy_input_hatch', inBus: 'gtceu:iv_input_bus', outBus: 'gtceu:iv_output_bus', in1: 'gtceu:iv_input_hatch',
        out1: 'gtceu:iv_output_hatch', out2: 'gtceu:iv_output_hatch' },
      parts: { '0,0,0': 'energy', '0,0,1': 'inBus', '0,0,2': 'outBus', '0,0,3': 'in1', '0,1,0': 'out1', '0,1,1': 'out2' },
      facing: {},
      ins: ['in1'], outs: ['out1', 'out2']
    },
    {
      key: 'pt', machine: PLANT, x: 11800, z: 2,
      blocks: { energy: 'gtceu:ev_energy_input_hatch', inBus: 'gtceu:ev_input_bus', outBus: 'gtceu:ev_output_bus', in1: 'gtceu:ev_input_hatch',
        in2: 'gtceu:ev_input_hatch', in3: 'gtceu:ev_input_hatch', out1: 'gtceu:ev_output_hatch', out2: 'gtceu:ev_output_hatch', out3: 'gtceu:ev_output_hatch',
        out4: 'gtceu:ev_output_hatch' },
      parts: { '0,0,0': 'energy', '0,0,1': 'inBus', '0,0,2': 'outBus', '0,0,3': 'in1', '0,0,4': 'in2', '0,1,1': 'in3', '0,1,2': 'out1', '0,1,3': 'out2',
        '1,1,0': 'out3', '1,1,4': 'out4' },
      facing: { out3: 'east', out4: 'west' },
      ins: ['in1', 'in2', 'in3'], outs: ['out1', 'out2', 'out3', 'out4']
    }
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
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour')
      }
    }
    return classes
  }

  function NP() {
    return global.grindless.naquadahPlant || {}
  }

  function PP() {
    return global.grindless.platinumPlant || {}
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

  // inserts n of an item, slot after slot
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
    m.copy.outs.forEach(function (role) {
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

  // the item contents of one side of a recipe, with their chance: [{ id, count, chance, circuit }]
  function itemContents(recipe, input) {
    var c = lazy()
    var contents = asArray(input ? recipe.getInputContents(c.ItemCap) : recipe.getOutputContents(c.ItemCap))
    var stacks = asArray(input ? c.RecipeHelper.getInputItems(recipe) : c.RecipeHelper.getOutputItems(recipe))
    return stacks.map(function (st, i) {
      var circuit = c.Circuit.isIntegratedCircuit(st) ? Number(c.Circuit.getCircuitConfiguration(st)) : 0
      return { id: itemName(st), count: Number(st.getCount()), chance: Number(contents[i].chance), circuit: circuit }
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
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() + ' last=' + (last ? last.id + ' x' + last.parallels : 'none')
    } catch (e) {
      return 'state unreadable: ' + e
    }
  }

  function publishedNaq(name) {
    return (NP().recipes || []).filter(function (r) { return r.name === name })[0] || null
  }

  function publishedPgm(name) {
    return (PP().recipes || []).filter(function (r) { return r.name === name })[0] || null
  }

  // ---------------------------------------------------------------- static checks

  function sharedIdsPresent() {
    var missing = SHARED_ITEMS.filter(function (id) { return !Item.exists(id) })
    check('shared_ids', missing.length === 0, missing.length === 0 ? SHARED_ITEMS.length + ' shared ids exist' : 'missing: ' + missing.join(', '))
    return missing.length === 0
  }

  // [[id, n, chance], ...] against [{ id, count|whole, chance }]
  function sameItems(want, got, field) {
    if (want.length !== got.length) return false
    for (var i = 0; i < want.length; i++) {
      var g = got.filter(function (x) { return x.id === want[i][0] })[0]
      if (!g || Number(g[field]) !== want[i][1] || Number(g.chance) !== want[i][2]) return false
    }
    return true
  }

  function sameFluids(want, got) {
    if (want.length !== got.length) return false
    for (var i = 0; i < want.length; i++) {
      var g = got.filter(function (x) { return x.id === want[i][0] })[0]
      if (!g || Number(g.amount) !== want[i][1]) return false
    }
    return true
  }

  function composedProblems(name, r, w, extra) {
    var problems = []
    if (r === null) return [name + ' was not published']
    if (r.circuit !== w.circuit) problems.push(name + ' circuit ' + r.circuit)
    var sources = r.sources || []
    var names = Object.keys(w.stages)
    if (sources.length !== names.length) problems.push(name + ' ' + sources.length + ' stages, want ' + names.length)
    sources.forEach(function (s) {
      var want = w.stages[s.id]
      if (want === undefined) problems.push(name + ' unexpected stage ' + s.id)
      else if (Math.abs(s.scale - want) > 1e-6) problems.push(name + ' stage ' + short(s.id) + ' x' + s.scale + ', want x' + want)
    })
    if (Math.abs(r.sourceEnergy - w.sourceEnergy) > 1e-6) problems.push(name + ' stages ' + r.sourceEnergy + ' EU, design ' + w.sourceEnergy)
    if (!(r.energy >= r.sourceEnergy && r.energy < r.sourceEnergy + r.duration)) problems.push(name + ' costs ' + r.energy + ' EU for ' + r.sourceEnergy)
    if (!(r.eut <= w.maxEut)) problems.push(name + ' ' + r.eut + ' EU/t')
    if (!sameItems(w.itemsIn, r.itemsIn, 'count')) problems.push(name + ' items in ' + JSON.stringify(r.itemsIn))
    if (!sameFluids(w.fluidsIn, r.fluidsIn)) problems.push(name + ' fluids in ' + JSON.stringify(r.fluidsIn))
    if (!sameItems(w.itemsOut, r.itemsOut, 'whole')) problems.push(name + ' items out ' + JSON.stringify(r.itemsOut))
    if (!sameFluids(w.fluidsOut, r.fluidsOut)) problems.push(name + ' fluids out ' + JSON.stringify(r.fluidsOut))
    return problems.concat(extra || [])
  }

  function line(r) {
    return r.itemsIn.map(function (x) { return x.count + ' ' + short(x.id) + (x.chance < 10000 ? '@' + x.chance : '') })
      .concat(r.fluidsIn.map(function (f) { return f.amount + ' mB ' + short(f.id) })).join(' + ') + ' -> ' +
      r.itemsOut.map(function (x) { return (x.whole > 0 ? x.whole + ' ' : '') + short(x.id) + (x.chance > 0 ? '@' + x.chance : '') })
        .concat(r.fluidsOut.map(function (f) { return f.amount + ' mB ' + short(f.id) })).join(' + ') +
      ', stages ' + (r.sources || []).map(function (s) { return short(s.id) + ' x' + Math.round(s.scale * 1e6) / 1e6 }).join(' ') + ' = ' + r.sourceEnergy +
      ' EU, spent as ' + r.duration + ' t x ' + r.eut + ' EU/t = ' + r.energy
  }

  // a published recipe against its live copy in the recipe manager: [problems], and its lookup keys
  function liveProblems(rec, dataKey) {
    var problems = []
    var r = liveRecipe(rec.recipeId)
    if (r === null) return { problems: [rec.recipeId + ' not in the recipe manager'], keys: [] }
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
    if (dataKey) {
      var key = String(r.data.getString(dataKey))
      if (key !== rec.name) problems.push(rec.name + ' data ' + dataKey + '=' + key)
    }
    var keys = ins.map(function (x) { return 'i:' + x.id }).concat(fluidContents(r, true).map(function (f) { return 'f:' + f.id })).concat(['circuit:' + rec.circuit])
    return { problems: problems, keys: keys }
  }

  function staticChecks() {
    safely('registration', function () {
      var problems = []
      var def = GTRegistries.MACHINES.get(rl(NAQ))
      if (def === null || def === undefined) throw new Error(NAQ + ' is not registered')
      var types = []
      var arr = def.getRecipeTypes()
      for (var i = 0; i < arr.length; i++) types.push(String(arr[i].registryName))
      if (types.join(',') !== NAQ_TYPE) problems.push('types ' + types.join(','))
      if (def.isGenerator() !== false) problems.push('isGenerator=' + def.isGenerator())
      if (!global.grindless.patterns.describe(NAQ)) problems.push('no structure description')
      var type = GTRegistries.RECIPE_TYPES.get(rl(NAQ_TYPE))
      var io = NP().maxIO || {}
      var sizes = type ? [type.getMaxInputs(lazy().ItemCap), type.getMaxOutputs(lazy().ItemCap), type.getMaxInputs(lazy().FluidCap), type.getMaxOutputs(lazy().FluidCap)] : []
      if (sizes.join(',') !== [io.itemsIn, io.itemsOut, io.fluidsIn, io.fluidsOut].join(',')) problems.push('type IO ' + sizes.join('/') + ' published ' + JSON.stringify(io))
      check('registration', problems.length === 0, NAQ + ': types=[' + types.join(',') + '] generator=' + def.isGenerator() + ' IO=' + sizes.join('/') +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('naquadah_composed', function () {
      var r = publishedNaq('naquadah')
      var extra = []
      var skipped = NP().skipped || []
      if (skipped.length > 0) extra.push('skipped: ' + skipped.map(function (s) { return s.name + ' (' + s.reason + ')' }).join(', '))
      if (NP().stagesRead !== 5) extra.push(NP().stagesRead + ' live stages read of 5')
      var acc = NP().accelerator || {}
      if (acc.upkeepEUt !== 240) extra.push('accelerator upkeep ' + acc.upkeepEUt + ' EU/t, want 240 (72 000 eV / 20 t / 15 eV per EU)')
      var problems = composedProblems('naquadah', r, WANT.naquadah, extra)
      check('naquadah_composed', problems.length === 0, (r ? line(r) : 'none') + ' | accelerators ' + acc.upkeepEUt + ' EU/t' +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('iridosmine_composed', function () {
      var r = publishedPgm('iridosmine')
      var extra = []
      var skipped = PP().skipped || []
      if (skipped.length > 0) extra.push('platinum plant skipped: ' + skipped.map(function (s) { return s.name + ' (' + s.reason + ')' }).join(', '))
      if (r !== null && (r.recipeId !== 'grindless:pgm_refining/iv/iridosmine' || r.mode !== 'iridosmine')) extra.push('id ' + r.recipeId + ' mode ' + r.mode)
      var problems = composedProblems('iridosmine', r, WANT.iridosmine, extra)
      check('iridosmine_composed', problems.length === 0, (r ? line(r) : 'none') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('fusion_live', function () {
      var f = PP().fusion || {}
      var st = f.stage
      var live = liveRecipe(FUSION)
      if (!st) throw new Error('the platinum plant read no fusion stage (' + JSON.stringify(f) + ')')
      if (live === null) throw new Error(FUSION + ' is not in the recipe manager')
      var v = {}
      itemContents(live, true).forEach(function (x) { if (x.circuit === 0) v['i:' + x.id] = (v['i:' + x.id] || 0) - x.count })
      fluidContents(live, true).forEach(function (x) { v['f:' + x.id] = (v['f:' + x.id] || 0) - x.amount })
      itemContents(live, false).forEach(function (x) { v['i:' + x.id] = (v['i:' + x.id] || 0) + x.count })
      fluidContents(live, false).forEach(function (x) { v['f:' + x.id] = (v['f:' + x.id] || 0) + x.amount })
      var problems = []
      var keys = {}
      Object.keys(v).concat(Object.keys(st.v)).forEach(function (k) { keys[k] = true })
      Object.keys(keys).forEach(function (k) {
        if (Math.abs((v[k] || 0) - (st.v[k] || 0)) > 1e-9) problems.push(short(k) + ' live ' + (v[k] || 0) + ', read ' + (st.v[k] || 0))
      })
      if (inputEUt(live) !== st.eut || Number(live.duration) !== st.duration) problems.push('live ' + inputEUt(live) + ' EU/t x ' + live.duration + ' t, read ' + st.eut + ' x ' + st.duration)
      check('fusion_live', problems.length === 0, 'from ' + f.from + ': ' + JSON.stringify(st.v) + ' at ' + st.eut + ' EU/t x ' + st.duration + ' t' +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('live_contents', function () {
      var problems = []
      var naq = publishedNaq('naquadah')
      var iri = publishedPgm('iridosmine')
      if (naq === null || iri === null) throw new Error('a recipe was not published')
      var a = liveProblems(naq, NP().dataKey)
      var b = liveProblems(iri, null)
      problems = problems.concat(a.problems, b.problems)
      check('live_contents', problems.length === 0, naq.recipeId + ' and ' + iri.recipeId + ' checked against the recipe manager' +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('lookup_sets', function () {
      var problems = []
      var naqLive = asArray(S.server.getRecipeManager().getAllRecipesFor(GTRegistries.RECIPE_TYPES.get(rl(NAQ_TYPE)))).length
      if (naqLive !== 1) problems.push(naqLive + ' live ' + NAQ_TYPE + ' recipes')
      var sets = (PP().recipes || []).map(function (rec) { return { name: rec.name, keys: liveProblems(rec, null).keys } })
      function subset(x, y) {
        return x.keys.length > 0 && x.keys.every(function (k) { return y.keys.indexOf(k) >= 0 })
      }
      for (var i = 0; i < sets.length; i++) {
        for (var j = i + 1; j < sets.length; j++) {
          if (subset(sets[i], sets[j]) || subset(sets[j], sets[i])) problems.push(sets[i].name + ' / ' + sets[j].name)
        }
      }
      check('lookup_sets', problems.length === 0 && sets.length === 6, NAQ_TYPE + ' holds ' + naqLive + '; ' + sets.length + ' ' + PGM_TYPE +
        ' input sets, none a subset of another' + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('bee_removed', function () {
      check('bee_removed', liveRecipe(BEE) === null, BEE + (liveRecipe(BEE) === null ? ' is gone' : ' is still in the recipe manager'))
    })

    safely('controller_recipe', function () {
      var r = liveRecipe(NP().craftingRecipe)
      if (r === null) throw new Error(NP().craftingRecipe + ' missing')
      var outs = itemContents(r, false)
      var ids = itemContents(r, true).map(function (x) { return x.id })
      var missing = (NP().craftingParts || []).filter(function (id) { return id !== NAQ && ids.indexOf(id) < 0 })
      check('controller_recipe', outs.length === 1 && outs[0].id === NAQ && missing.length === 0, NP().craftingRecipe + ' -> ' +
        outs.map(function (x) { return x.id }).join(',') + ' from [' + ids.map(short).join(', ') + '] at ' + inputEUt(r) + ' EU/t' +
        (missing.length > 0 ? ' | missing: ' + missing.join(',') : ''))
    })

    safely('balance', function () {
      var r = publishedNaq('naquadah')
      var acc = NP().accelerator || {}
      if (r === null) throw new Error('no naquadah recipe')
      var nq = r.itemsOut.filter(function (x) { return x.id === NQ })[0].whole
      var activator = (r.sources || []).filter(function (s) { return /neutron_activator/.test(s.id) })[0]
      var upkeep = activator ? activator.scale * activator.eut * activator.duration : 0
      note('balance', 'per naquadah dust: ' + (4 / nq) + ' oxide, ' + (15 / nq) + ' antimony trioxide, ' + (40500 / nq) + ' mB HF, ' + Math.round(r.energy / nq) +
        ' EU (the accelerators\' upkeep ' + upkeep + ' EU a batch, ' + Math.round(upkeep / r.sourceEnergy * 1000) / 10 + ' %); a Pu-Be source lasts ' +
        Math.round(10000 / NP().source.chance) + ' batches (' + Math.round(10000 / NP().source.chance) * nq + ' naquadah dust). Platinum mode 3: 10 iridosmine -> 3 Ir + 1 Os for ' +
        (publishedPgm('iridosmine') || {}).energy + ' EU')
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
          var role = copy.parts[si + ',' + ri + ',' + ci]
          if (sym.kind === 'controller') {
            c.id = copy.machine
            c.props = '[facing=north]'
            c.role = 'controller'
          } else if (sym.kind === 'air' || sym.kind === 'any') {
            continue
          } else if (role !== undefined) {
            if (sym.kind !== 'oneOf') throw new Error('the part cell ' + si + ',' + ri + ',' + ci + ' is a ' + sym.kind + ' cell')
            c.id = copy.blocks[role]
            c.props = '[facing=' + (copy.facing[role] || 'south') + ']'
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

  // the energy hatch is topped up every tick; what it lost since the last tick is what the machine drew
  function meter(m) {
    var c = m.P.energy.energyContainer
    var cap = Number(c.getEnergyCapacity())
    var stored = Number(c.getEnergyStored())
    if (m.metered) m.euUsed += cap - stored
    c.setEnergyStored(cap)
    m.metered = true
  }

  // empties every part (the circuit too) and starts a scenario: items into the input bus, fluids into the input hatches in order
  function load(m, sc) {
    emptyBus(m.P.inBus)
    emptyBus(m.P.outBus)
    m.copy.ins.forEach(function (role) { setTank(m.P[role], null, 0) })
    m.copy.outs.forEach(function (role) { setTank(m.P[role], null, 0) })
    m.P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(sc.circuit))
    ;(sc.items || []).forEach(function (x) { insert(m.P.inBus, x[0], x[1]) })
    ;(sc.fluids || []).forEach(function (f, i) { setTank(m.P[m.copy.ins[i]], f[0], f[1]) })
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

  function result(m) {
    return {
      out: readBus(m.P.outBus),
      fluids: outFluids(m),
      left: readBus(m.P.inBus),
      tanks: m.copy.ins.map(function (role) { return tankInfo(m.P[role]) }),
      eu: m.euUsed - m.eu0
    }
  }

  function naqStep(m, age) {
    if (m.phase === 'no_source' && age >= HOLD_TICKS) {
      var r0 = result(m)
      var idle = Object.keys(m.seen).length === 0 && r0.eu === 0 && (r0.left[OXIDE] || 0) === 4 && (r0.left[SB2O3] || 0) === 15 && r0.tanks[0].amount === 40500 &&
        Object.keys(r0.out).length === 0
      check('no_source', idle, 'every input but the Pu-Be source, circuit 1: ran [' + Object.keys(m.seen).join(',') + '], ' + r0.eu + ' EU, bus [' + summary(r0.left) +
        '], ' + r0.tanks[0].amount + ' mB HF | ' + state(m.ctrl) + ' reasons=[' + failureReasons(m.ctrl).join(' ; ') + ']')
      insert(m.P.inBus, SOURCE, 1)
      begin(m, 'naquadah')
      return
    }
    if (m.phase === 'naquadah') {
      var rec = publishedNaq('naquadah')
      if (rec === null) {
        check('PROCESS_naquadah', false, 'the recipe was not published')
        m.phase = 'done'
        return
      }
      if (!runOver(m, age, rec.duration)) return
      var r = result(m)
      var problems = []
      if (m.seen[rec.recipeId] !== true) problems.push(rec.recipeId + ' never ran (seen ' + Object.keys(m.seen).join(',') + ')')
      var extra = Object.keys(r.out).filter(function (id) { return [NQ, TI, GA].indexOf(id) < 0 })
      if ((r.out[NQ] || 0) !== 2 || (r.out[TI] || 0) > 1 || (r.out[GA] || 0) > 1 || extra.length > 0) problems.push('items out ' + summary(r.out))
      if ((r.fluids[H2] || 0) !== 10500 || (r.fluids[WATER] || 0) !== 9000 || Object.keys(r.fluids).length !== 2) problems.push('fluids out ' + fluidSummary(r.fluids))
      var leftKeys = Object.keys(r.left).filter(function (id) { return id !== SOURCE })
      if (leftKeys.length > 0 || (r.left[SOURCE] || 0) > 1 || r.tanks[0].amount !== 0) problems.push('left ' + summary(r.left) + ', ' + r.tanks[0].amount + ' mB HF')
      if (r.eu !== rec.energy) problems.push(r.eu + ' EU drawn, the recipe is ' + rec.energy)
      check('PROCESS_naquadah', problems.length === 0, '4 oxide + 15 Sb2O3 + 40 500 mB HF + the Pu-Be source, circuit 1 -> [' + summary(r.out) + '], ' +
        fluidSummary(r.fluids) + '; source ' + ((r.left[SOURCE] || 0) === 1 ? 'kept' : 'used up') + '; ' + r.eu + ' EU drawn (' + rec.duration + ' t x ' + rec.eut +
        ' EU/t) | ' + state(m.ctrl) + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      m.phase = 'done'
    }
  }

  function ptStep(m, age) {
    if (m.phase !== 'iridosmine') return
    var rec = publishedPgm('iridosmine')
    if (rec === null) {
      check('PROCESS_iridosmine', false, 'the recipe was not published')
      m.phase = 'done'
      return
    }
    if (!runOver(m, age, rec.duration)) return
    var r = result(m)
    var problems = []
    if (m.seen[rec.recipeId] !== true) problems.push(rec.recipeId + ' never ran (seen ' + Object.keys(m.seen).join(',') + ')')
    var want = { }
    want[IR] = 3
    want[OS] = 1
    want[PSR] = 3
    want[SLUDGE] = 3
    want[CACL2] = 12
    var keys = Object.keys(want).concat(Object.keys(r.out))
    keys.forEach(function (id) {
      if ((r.out[id] || 0) !== (want[id] || 0)) problems.push(short(id) + ' x' + (r.out[id] || 0) + ', want ' + (want[id] || 0))
    })
    if ((r.fluids[WATER] || 0) !== 4700 || (r.fluids[STEAM] || 0) !== 1000 || Object.keys(r.fluids).length !== 2) problems.push('fluids out ' + fluidSummary(r.fluids))
    var leftKeys = Object.keys(r.left).filter(function (id) { return id !== ELECTRODE })
    if (leftKeys.length > 0 || (r.left[ELECTRODE] || 0) > 1) problems.push('left ' + summary(r.left))
    r.tanks.forEach(function (t, i) { if (t.amount !== 0) problems.push(m.copy.ins[i] + ' kept ' + t.amount + ' mB ' + short(t.id)) })
    if (r.eu !== rec.energy) problems.push(r.eu + ' EU drawn, the recipe is ' + rec.energy)
    check('PROCESS_iridosmine', problems.length === 0, '10 iridosmine + 10 saltpeter + 3 calcium + the electrode + 1 000 mB salt water + 12 500 mB HCl + 7 000 mB H2, circuit 3 -> [' +
      summary(r.out) + '], ' + fluidSummary(r.fluids) + '; electrode ' + ((r.left[ELECTRODE] || 0) === 1 ? 'kept' : 'used up') + '; ' + r.eu + ' EU drawn (' +
      rec.duration + ' t x ' + rec.eut + ' EU/t) | ' + state(m.ctrl) + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    m.phase = 'done'
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
    if (m.copy.key === 'naq') {
      load(m, { phase: 'no_source', circuit: 1, items: [[OXIDE, 4], [SB2O3, 15]], fluids: [[HF, 40500]] })
    } else {
      load(m, { phase: 'iridosmine', circuit: 3, items: [[IRIDOSMINE, 10], [SALTPETER, 10], [CALCIUM, 3], [ELECTRODE, 1]],
        fluids: [[SALT_WATER, 1000], [HCL, 12500], [H2, 7000]] })
    }
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
    if (m.copy.key === 'naq') naqStep(m, age)
    else ptStep(m, age)
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
      note('copies', 'skipped: the recipes cannot run without the shared ids')
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

  ServerEvents.customCommand('gg_test_naquadah_plant', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_naquadah_plant run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
