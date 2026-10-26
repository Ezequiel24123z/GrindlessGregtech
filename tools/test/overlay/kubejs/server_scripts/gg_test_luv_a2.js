// Gregtech Grindless - smoke test of package LuV A2 (TEST-ONLY overlay: copied over the instance on the test PC, never shipped with the
// pack): the naquadah plant's LuV modes (circuit 2 enriched naquadah, circuit 3 spent naquadah; startup_scripts/grindless/iv/
// naquadah_plant.js, server_scripts/grindless/iv/naquadah_plant.js, data/grindless/tables/naquadah_plant.json, composed by
// server_scripts/grindless/lib/compose.js), GTM's LuV parallel hatch in our plants (startup_scripts/grindless/lib/parallel_hatch.js) and
// the platinum plant's mode 4 (circuit 4, the asteroid belt's platinum metals: server_scripts/grindless/ev/platinum_plant.js,
// data/grindless/tables/asteroid_pgm.json; it needs LuV A1's grindless:asteroid_pgm_concentrate).
//
//   powershell -NoProfile -ExecutionPolicy Bypass -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_luv_a2;;kubejs custom_command gg_test_recipe_lookup' `
//     -WaitForLog 'GGTEST\|luv_a2\|DONE@@180;;GGTEST\|lookup\|DONE@@180'
//
// Markers: GGTEST|luv_a2|<check>|PASS|FAIL|NOTE|<detail>
//   ids                       the items, blocks and fluids the checks and the copies use exist
//   registration              both plants are registered with alwaysTryModifyRecipe (the keep modifier is re-applied when a run ends);
//                             gtceu:naquadah_refining holds the published sizes (5/6/5/2) and gtceu:pgm_refining the platinum plant's
//   pins                      the naquadah plant read its 18 pinned GT-- stages, every pin 'ok', no mode skipped, none of GT--'s four
//                             empty placeholders among them
//   composed_naquadah         circuit 1 still composed: IV's 7,680 EU/t, no charges, voidable
//   composed_enriched_naquadah  circuit 2 as luv.md (S0-11): 4 enriched oxide + Pu-Be @75 + 36,000 F2 + 26,500 H2 + 8,000 H2SO4; held
//                             xenon 1,000, HSbF6 2,500, 4 AuF3, Pd/C @400 -> 11 sulfate + 1 @2,500, 2 trinium sulfide, 3 Ti + 1 @5,000,
//                             750 impure naquadria, 8,500 HF; 30,717 EU/t x 5,984 t (stages 183,805,920 EU); refuses voiding
//   composed_spent_naquadah   circuit 3: 6 naquadah dust + Pu-Be @38 + 18,000 F2 + 15,000 H2 + 4,000 H2SO4; the same charges with Pd/C
//                             @200 -> 5 sulfate + 1 @6,250, 1 trinium sulfide, 1 Ti, 2,375 naquadria, 10,000 HF; 30,716 EU/t x 3,558 t
//                             (stages 109,287,120 EU); refuses voiding
//   live_contents             the three recipes are in the recipe manager as grindless:naquadah_refining/<name> with exactly the published
//                             contents: the charges non-consumed (chance 0), Pd/C and Pu-Be chanced, the circuit, the EU/t, the duration,
//                             the data key, and the keep boolean on circuits 2 and 3 only; the type holds those three, one per circuit
//   placeholders_empty        GT--'s four centrifuge placeholders (the steps the line replaces) are loaded and still empty
//   spent_rod_macerate        gtceu:macerator/macerate_long_naquadah_rod: 1 long naquadah rod -> 1 naquadah dust (circuit 3's feed)
//   luv_parallel_hatch_recipe GTM's gtceu:shaped/parallel_hatch_mk2 is live as GTM made it (LuV sensor, emitter and hull, 4 ZPM circuits,
//                             2 niobium-titanium double cables) and nothing else (crafting or GT) makes gtceu:luv_parallel_hatch
//   pgm_mode4                 grindless:pgm_refining/luv/asteroid is live: circuit 4, 22 concentrate, 3 Ir, 3 Os, 1 sludge, the keep
//                             boolean, exactly its published contents; no other pgm_refining recipe takes circuit 4 or keeps. FAIL when
//                             the concentrate is not registered (LuV A1 must be merged before the integrated run)
//   naq_PLACED / _FORMED / _PARTS   copy naq: a naquadah plant on two LuV energy hatches (ZPM voltage, 131,072) with GTM's LuV parallel
//                             hatch in a part cell: the controller reads it, it accepts 16 copies (the IV one stops at 4), set to 4
//   naq_parallel_start        4 copies of circuit 2's inputs (16 oxide, 4 Pu-Be, 4 Pd/C, the charges once): one run starts with 4
//                             parallels at 122,868 EU/t (4 x 30,717) for 5,984 t (no overclock fits at ZPM), and for OBSERVE ticks the
//                             progress advances one a tick while the hatches give exactly 122,868 EU a tick
//   naq_FASTFORWARD           NOTE: the progress is set to the end (only the waiting is skipped; the outputs are the real ones)
//   naq_PROCESS_parallel      the run gives 4x: 44-48 sulfate, 8 trinium sulfide, 12-16 Ti, 3,000 mB naquadria, 34,000 mB HF; every
//                             consumed input used up (0-4 Pu-Be and 0-4 Pd/C by chance); xenon 1,000, HSbF6 2,500 and 4 AuF3 untouched
//   naq_no_voiding_items / naq_no_voiding_fluids   one copy of circuit 2 with the controller voiding items, then fluids: nothing starts,
//                             no EU, the inputs stay, the no_voiding reason is shown
//   naq_resumes               voiding off: the same inputs start (one copy, GTM's overclock) and give 1x the outputs, charges kept
//   naq_mode1_voids           circuit 1 with items and fluids voided: it runs (mode 1 may void)
//   pt_PLACED / _FORMED / _PARTS    copy pt: a platinum plant (IV energy hatch, EV parts)
//   pt_no_voiding             mode 4's inputs with the controller voiding items and fluids: nothing starts, the reason is shown
//   pt_resumes / pt_PROCESS_asteroid  voiding off: mode 4 starts and (fast-forwarded) gives its published outputs (3 Ir, 3 Os, 1 sludge...)
//   CLEANUP                   NOTE: the area cleared, stray items removed, the force-load released
//   luv_a2|DONE               last line
//
// The long run: circuit 2 lasts 5,984 t (5 minutes) and the bench's native budget is 600 s for the whole integrated run, so the 4-copy run
// is not waited for. It is checked while it runs (the copies, the EU/t and the energy drawn tick by tick against the progress) and then
// fast-forwarded with RecipeLogic#setProgress (gg_test_leisure_utility's and gg_test_mv_plant's technique): GTM finishes it on the next
// tick with its real outputs and chance rolls. The other runs are fast-forwarded the same way. Mode 1-3 processes of the platinum plant are
// not repeated (gg_test_ev_platinum_plant, gg_test_naquadah_plant); mode 4 reuses mode 3's proven chain.
//
// TEST AREA: the band is X 14848-14911, Y 98-112, Z 0-63 of the overworld; this test builds, force-loads and clears ONLY X 14848-14911,
// Y 98-112, Z 0-15 of it, under a roof at Y 111 (a hatch that is rained on may explode). Controllers face north at z 2, the structures
// behind them: naq at x 14875-14882 (controller 14880,101,2), pt at x 14897-14903 (controller 14900,101,2). Inputs, fluids and energy are
// injected. At the end the parts are emptied, the area cleared and the force-load released.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'luv_a2'
  var BAND = { x0: 14848, x1: 14911, y0: 98, y1: 112, z0: 0, z1: 15 }
  var ROOF_Y = 111
  var Y = 100
  var STEP = 10
  var FORM_TIMEOUT = 300
  var START_TIMEOUT = 100
  var OBSERVE = 40
  var HOLD_TICKS = 40
  var FINISH_TIMEOUT = 60
  var SLACK = 120
  var MAX_TICKS = 3000
  var COPIES = 4

  // the command only leaves a request in `global` (it survives script reloads); the tick handler starts the test once these scripts have
  // been loaded for QUIET_MS (same as the other tests)
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestLuvA2Request'

  var NAQ = 'gtceu:naquadah_plant'
  var NAQ_TYPE = 'gtceu:naquadah_refining'
  var PLANT = 'gtceu:platinum_plant'
  var PGM_TYPE = 'gtceu:pgm_refining'
  var LUV_HATCH = 'gtceu:luv_parallel_hatch'
  var LUV_HATCH_RECIPE = 'gtceu:shaped/parallel_hatch_mk2'
  var ASTEROID_ID = 'grindless:pgm_refining/luv/asteroid'
  var CONCENTRATE = 'grindless:asteroid_pgm_concentrate'
  var ZPM_VOLTAGE = 131072

  var OXIDE = 'gtceu:naquadah_oxide_mixture_dust'
  var E_OXIDE = 'gtceu:enriched_naquadah_oxide_mixture_dust'
  var SB2O3 = 'gtceu:antimony_trioxide_dust'
  var SOURCE = 'grindless:pube_neutron_source'
  var AUF3 = 'gtceu:gold_trifluoride_dust'
  var PDC = 'gtnn:palladium_on_carbon_catalyst'
  var NQ = 'gtceu:naquadah_dust'
  var SULFATE = 'gtceu:enriched_naquadah_sulfate_dust'
  var TRINIUM = 'gtceu:trinium_sulfide_dust'
  var TI = 'gtceu:titanium_ingot'
  var F2 = 'gtceu:fluorine'
  var H2 = 'gtceu:hydrogen'
  var H2SO4 = 'gtceu:sulfuric_acid'
  var XE = 'gtceu:xenon'
  var HSBF6 = 'gtceu:fluoroantimonic_acid'
  var NAQUADRIA = 'gtceu:impure_naquadria_solution'
  var HF = 'gtceu:hydrofluoric_acid'
  var IR = 'gtceu:iridium_dust'
  var OS = 'gtceu:osmium_dust'
  var PGS = 'gtceu:platinum_group_sludge_dust'
  var ELECTRODE = 'grindless:platinum_electrode'
  var LONG_ROD = 'gtceu:long_naquadah_rod'
  var MACERATE_ROD = 'gtceu:macerator/macerate_long_naquadah_rod'
  var PLACEHOLDERS = ['gtceu:centrifuge/impure_enriched_naquadah_solution_separation', 'gtceu:centrifuge/acidic_enriched_naquadah_separation',
    'gtceu:centrifuge/impure_naquadria_solution_separation', 'gtceu:centrifuge/acidic_naquadria_solution_separation']
  var RECOVERED = ['f:gtceu:xenon', 'i:gtceu:antimony_trifluoride_dust', 'i:gtceu:antimony_trioxide_dust', 'i:gtceu:gold_dust', 'i:gtnn:palladium_on_carbon_catalyst']
  var NAQ_REASON = /grindless\.machine\.naquadah_plant\.no_voiding|Turn output voiding off/
  var PGM_REASON = /grindless\.machine\.platinum_plant\.no_voiding|Turn output voiding off/

  // the design (docs/eras/luv.md, "Naquadah plant, mode 2: the exact balance"; tools/analysis/test/naquadah-mode2.test.mjs prints it):
  // items [id, count or whole, chance], fluids [id, mB], charges [kind, id, count or mB, chance]
  var WANT = {
    enriched_naquadah: {
      circuit: 2, keep: true, maxEut: 30720, eut: 30717, duration: 5984, sourceEnergy: 183805920, stages: 14, batches: 4, activatorRuns: 0.75,
      itemsIn: [[E_OXIDE, 4, 10000], [SOURCE, 1, 75]],
      fluidsIn: [[F2, 36000], [H2, 26500], [H2SO4, 8000]],
      charges: [['f', XE, 1000, 0], ['f', HSBF6, 2500, 0], ['i', AUF3, 4, 0], ['i', PDC, 1, 400]],
      itemsOut: [[SULFATE, 11, 2500], [TRINIUM, 2, 0], [TI, 3, 5000]],
      fluidsOut: [[NAQUADRIA, 750], [HF, 8500]]
    },
    spent_naquadah: {
      circuit: 3, keep: true, maxEut: 30720, eut: 30716, duration: 3558, sourceEnergy: 109287120, stages: 14, batches: 2, activatorRuns: 0.375,
      itemsIn: [[NQ, 6, 10000], [SOURCE, 1, 38]],
      fluidsIn: [[F2, 18000], [H2, 15000], [H2SO4, 4000]],
      charges: [['f', XE, 1000, 0], ['f', HSBF6, 2500, 0], ['i', AUF3, 4, 0], ['i', PDC, 1, 200]],
      itemsOut: [[SULFATE, 5, 6250], [TRINIUM, 1, 0], [TI, 1, 0]],
      fluidsOut: [[NAQUADRIA, 2375], [HF, 10000]]
    }
  }

  // the copies: role blocks and where the parts go ('slice,row,column' of the description, slice 0 = the back) with their facing
  var PLANTS = [
    {
      key: 'naq', machine: NAQ, x: 14880, z: 2,
      blocks: {
        energy: 'gtceu:luv_energy_input_hatch', energy2: 'gtceu:luv_energy_input_hatch', inBus: 'gtceu:luv_input_bus', outBus: 'gtceu:luv_output_bus',
        in1: 'gtceu:luv_input_hatch', in2: 'gtceu:luv_input_hatch', in3: 'gtceu:luv_input_hatch', in4: 'gtceu:luv_input_hatch', in5: 'gtceu:luv_input_hatch',
        out1: 'gtceu:luv_output_hatch', out2: 'gtceu:luv_output_hatch', parallel: LUV_HATCH
      },
      // the back wall (rows 0-2) and the hall's outer side (column 0 of slices 1 and 2)
      parts: {
        '0,0,0': 'energy', '0,0,1': 'energy2', '0,0,2': 'inBus', '0,0,3': 'outBus', '0,1,0': 'in1', '0,1,1': 'in2', '0,1,2': 'in3', '0,1,3': 'in4',
        '0,2,0': 'in5', '0,2,3': 'parallel', '1,1,0': 'out1', '2,1,0': 'out2'
      },
      facing: { out1: 'east', out2: 'east' },
      energies: ['energy', 'energy2'], ins: ['in1', 'in2', 'in3', 'in4', 'in5'], outs: ['out1', 'out2'],
      ids: [E_OXIDE, OXIDE, SB2O3, SOURCE, AUF3, PDC, SULFATE, TRINIUM, TI, NQ], fluids: [F2, H2, H2SO4, XE, HSBF6, NAQUADRIA, HF]
    },
    {
      key: 'pt', machine: PLANT, x: 14900, z: 2,
      blocks: {
        energy: 'gtceu:iv_energy_input_hatch', inBus: 'gtceu:ev_input_bus', outBus: 'gtceu:ev_output_bus', in1: 'gtceu:ev_input_hatch',
        in2: 'gtceu:ev_input_hatch', in3: 'gtceu:ev_input_hatch', out1: 'gtceu:ev_output_hatch', out2: 'gtceu:ev_output_hatch', out3: 'gtceu:ev_output_hatch',
        out4: 'gtceu:ev_output_hatch'
      },
      // gg_test_naquadah_plant's platinum plant layout (IV-B3)
      parts: { '0,0,0': 'energy', '0,0,1': 'inBus', '0,0,2': 'outBus', '0,0,3': 'in1', '0,0,4': 'in2', '0,1,1': 'in3', '0,1,2': 'out1', '0,1,3': 'out2',
        '1,1,0': 'out3', '1,1,4': 'out4' },
      facing: { out3: 'east', out4: 'west' },
      energies: ['energy'], ins: ['in1', 'in2', 'in3'], outs: ['out1', 'out2', 'out3', 'out4'],
      ids: [CONCENTRATE, ELECTRODE, IR, OS, PGS], fluids: []
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

  function withProblems(text, problems) {
    return text + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : '')
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
        GTRecipe: Java.loadClass('com.gregtechceu.gtceu.api.recipe.GTRecipe'),
        RecipeType: Java.loadClass('net.minecraft.world.item.crafting.RecipeType'),
        VoidingMode: Java.loadClass('com.gregtechceu.gtceu.api.machine.feature.IVoidable$VoidingMode'),
        AABB: Java.loadClass('net.minecraft.world.phys.AABB'),
        ItemEntity: Java.loadClass('net.minecraft.world.entity.item.ItemEntity')
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

  function PH() {
    return global.grindless.parallelHatch || {}
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

  function cmd(text) {
    return S.server.runCommandSilent(text)
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

  function tankSummary(m) {
    return m.copy.ins.map(function (role) {
      var t = tankInfo(m.P[role])
      return role + ' ' + (t.amount > 0 ? t.amount + ' ' + short(t.id) : 'empty')
    }).join(', ')
  }

  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }

  function allOfType(typeId) {
    return asArray(S.server.getRecipeManager().getAllRecipesFor(GTRegistries.RECIPE_TYPES.get(rl(typeId))))
  }

  function inputEUt(recipe) {
    var io = lazy().RecipeHelper.getRealEUtWithIO(recipe)
    if (io.isEmpty()) return 0
    return io.isInput() ? Number(io.getTotalEU()) : -Number(io.getTotalEU())
  }

  // the item contents of one side of a GT recipe, with their chance: [{ id, count, chance, circuit }]
  function itemContents(recipe, input) {
    var c = lazy()
    var contents = asArray(input ? recipe.getInputContents(c.ItemCap) : recipe.getOutputContents(c.ItemCap))
    var stacks = asArray(input ? c.RecipeHelper.getInputItems(recipe) : c.RecipeHelper.getOutputItems(recipe))
    return stacks.map(function (st, i) {
      var circuit = c.Circuit.isIntegratedCircuit(st) ? Number(c.Circuit.getCircuitConfiguration(st)) : 0
      return { id: itemName(st), count: Number(st.getCount()), chance: Number(contents[i].chance), circuit: circuit }
    })
  }

  // the fluid contents of one side, with their chance (0: not consumed): [{ id, amount, chance }]
  function fluidContents(recipe, input) {
    var c = lazy()
    var contents = asArray(input ? recipe.getInputContents(c.FluidCap) : recipe.getOutputContents(c.FluidCap))
    var stacks = asArray(input ? c.RecipeHelper.getInputFluids(recipe) : c.RecipeHelper.getOutputFluids(recipe))
    return stacks.map(function (st, i) {
      return { id: fluidName(st), amount: Number(st.getAmount()), chance: Number(contents[i].chance) }
    })
  }

  function circuitOf(recipe) {
    var c = itemContents(recipe, true).filter(function (x) { return x.circuit > 0 })
    return c.length === 1 ? c[0].circuit : (c.length === 0 ? 0 : -1)
  }

  function keeps(recipe, key) {
    try {
      return recipe.data.getBoolean(key) === true
    } catch (e) {
      return false
    }
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
      return 'status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' + rlg.getDuration() + ' last=' + (last ? last.id + ' x' + last.parallels : 'none') +
        ' voiding=' + ctrl.getVoidingMode()
    } catch (e) {
      return 'state unreadable: ' + e
    }
  }

  function setVoiding(m, mode) {
    m.ctrl.setVoidingMode(lazy().VoidingMode[mode])
    wake(m.ctrl)
  }

  function publishedNaq(name) {
    return (NP().recipes || []).filter(function (r) { return r.name === name })[0] || null
  }

  function publishedPgm(name) {
    return (PP().recipes || []).filter(function (r) { return r.name === name })[0] || null
  }

  function between(x, lo, hi) {
    return x >= lo && x <= hi
  }

  // ---------------------------------------------------------------- static checks: the naquadah plant

  function idsCheck() {
    var missing = []
    var items = [NAQ, PLANT, LUV_HATCH, LONG_ROD]
    PLANTS.forEach(function (p) {
      Object.keys(p.blocks).forEach(function (role) { if (items.indexOf(p.blocks[role]) < 0) items.push(p.blocks[role]) })
    })
    items.forEach(function (id) { if (!Item.exists(id)) missing.push(id) })
    PLANTS.forEach(function (p) {
      p.missing = p.ids.filter(function (id) { return !Item.exists(id) }).concat(p.fluids.filter(function (id) { return !Fluid.exists(id) }))
      p.missing.forEach(function (id) { if (missing.indexOf(id) < 0) missing.push(id) })
    })
    check('ids', missing.length === 0, missing.length === 0 ? 'every block, item and fluid the test uses exists' : 'missing: ' + missing.join(', ') +
      (missing.indexOf(CONCENTRATE) >= 0 ? ' (the concentrate is LuV A1\'s: merge A1 before the integrated run)' : ''))
  }

  function registrationCheck() {
    var problems = []
    var lines = []
    var c = lazy()
    ;[[NAQ, NAQ_TYPE, NP().maxIO], [PLANT, PGM_TYPE, PP().maxIO]].forEach(function (w) {
      var def = GTRegistries.MACHINES.get(rl(w[0]))
      if (def === null || def === undefined) {
        problems.push(w[0] + ' is not registered')
        return
      }
      var always = def.isAlwaysTryModifyRecipe()
      if (always !== true) problems.push(short(w[0]) + ' alwaysTryModifyRecipe=' + always)
      var type = GTRegistries.RECIPE_TYPES.get(rl(w[1]))
      var io = w[2] || {}
      var sizes = type ? [type.getMaxInputs(c.ItemCap), type.getMaxOutputs(c.ItemCap), type.getMaxInputs(c.FluidCap), type.getMaxOutputs(c.FluidCap)] : []
      if (sizes.join(',') !== [io.itemsIn, io.itemsOut, io.fluidsIn, io.fluidsOut].join(',')) problems.push(short(w[1]) + ' IO ' + sizes.join('/') + ', published ' + JSON.stringify(io))
      lines.push(short(w[0]) + ' alwaysTryModifyRecipe=' + always + ' ' + short(w[1]) + ' IO=' + sizes.join('/'))
    })
    var nio = NP().maxIO || {}
    if ([nio.itemsIn, nio.itemsOut, nio.fluidsIn, nio.fluidsOut].join('/') !== '5/6/5/2') problems.push('naquadah_refining published ' + JSON.stringify(nio) + ', the design is 5/6/5/2')
    check('registration', problems.length === 0, withProblems(lines.join(' ; '), problems))
  }

  function pinsCheck() {
    var np = NP()
    var pins = np.pins || {}
    var ids = Object.keys(pins)
    var problems = []
    var bad = ids.filter(function (id) { return pins[id] !== 'ok' })
    if (bad.length > 0) problems.push('pins not ok: ' + bad.map(function (id) { return short(id) + '=' + pins[id] }).join(', '))
    if (ids.length !== 18) problems.push(ids.length + ' pins, the three modes name 18 stages')
    if (Number(np.stagesRead) !== 18) problems.push(np.stagesRead + ' stages read, want 18')
    var skipped = np.skipped || []
    if (skipped.length > 0) problems.push('skipped: ' + skipped.map(function (s) { return s.name + ' (' + s.reason + ')' }).join(', '))
    var named = PLACEHOLDERS.filter(function (id) { return ids.indexOf(id) >= 0 })
    if (named.length > 0) problems.push('a plan names a placeholder: ' + named.join(', '))
    check('pins', problems.length === 0, withProblems(ids.length + ' pinned stages of GT-- ' + np.gtnnVersion + ', ' + np.stagesRead + ' read live, ' +
      (ids.length - bad.length) + ' ok, skipped ' + skipped.length + '; modes ' + JSON.stringify(np.modes || {}), problems))
  }

  // [[id, n, chance], ...] against [{ id, count|whole, chance }]: same ids, same numbers
  function itemsText(list, field) {
    return list.map(function (x) { return x.id + ' x' + x[field] + ' @' + x.chance }).sort().join(',')
  }

  function wantItemsText(list) {
    return list.map(function (x) { return x[0] + ' x' + x[1] + ' @' + x[2] }).sort().join(',')
  }

  function fluidsText(list) {
    return list.map(function (x) { return x.id + ' ' + x.amount }).sort().join(',')
  }

  function wantFluidsText(list) {
    return list.map(function (x) { return x[0] + ' ' + x[1] }).sort().join(',')
  }

  function chargesText(list) {
    return list.map(function (c) {
      return c.item !== undefined ? 'i:' + c.item + ' x' + c.count + ' @' + c.chance : 'f:' + c.fluid + ' ' + c.amount + ' @' + c.chance
    }).sort().join(',')
  }

  function wantChargesText(list) {
    return list.map(function (c) { return c[0] === 'i' ? 'i:' + c[1] + ' x' + c[2] + ' @' + c[3] : 'f:' + c[1] + ' ' + c[2] + ' @' + c[3] }).sort().join(',')
  }

  function composedProblems(name, r, w) {
    var problems = []
    if (r === null) return [name + ' was not published']
    if (r.recipeId !== 'grindless:naquadah_refining/' + name) problems.push('id ' + r.recipeId)
    if (r.circuit !== w.circuit) problems.push('circuit ' + r.circuit)
    if ((r.keep === true) !== w.keep) problems.push('keep ' + r.keep)
    if (r.maxEut !== w.maxEut) problems.push('maxEut ' + r.maxEut)
    if (r.eut !== w.eut || r.duration !== w.duration) problems.push(r.eut + ' EU/t x ' + r.duration + ' t, want ' + w.eut + ' x ' + w.duration)
    if (r.energy !== r.eut * r.duration) problems.push('energy ' + r.energy + ' is not EU/t x ticks')
    if (Math.abs(r.sourceEnergy - w.sourceEnergy) > 1e-6) problems.push('stages ' + r.sourceEnergy + ' EU, want ' + w.sourceEnergy)
    if (!(r.energy >= r.sourceEnergy && r.energy < r.sourceEnergy + r.duration)) problems.push('costs ' + r.energy + ' EU for ' + r.sourceEnergy)
    if ((r.sources || []).length !== w.stages) problems.push((r.sources || []).length + ' stages, want ' + w.stages)
    if (Math.abs(r.batches - w.batches) > 1e-9 || Math.abs(r.activatorRuns - w.activatorRuns) > 1e-9) problems.push(r.batches + ' batches, activator x' + r.activatorRuns)
    if (itemsText(r.itemsIn, 'count') !== wantItemsText(w.itemsIn)) problems.push('items in ' + itemsText(r.itemsIn, 'count'))
    if (fluidsText(r.fluidsIn) !== wantFluidsText(w.fluidsIn)) problems.push('fluids in ' + fluidsText(r.fluidsIn))
    if (chargesText(r.charges || []) !== wantChargesText(w.charges)) problems.push('charges ' + chargesText(r.charges || []))
    if (itemsText(r.itemsOut, 'whole') !== wantItemsText(w.itemsOut)) problems.push('items out ' + itemsText(r.itemsOut, 'whole'))
    if (fluidsText(r.fluidsOut) !== wantFluidsText(w.fluidsOut)) problems.push('fluids out ' + fluidsText(r.fluidsOut))
    var kept = Object.keys(r.recovered || {}).sort().join(',')
    if (kept !== RECOVERED.slice().sort().join(',')) problems.push('recovered ' + kept)
    return problems
  }

  function line(r) {
    return 'circuit ' + r.circuit + ': ' + r.itemsIn.map(function (x) { return x.count + ' ' + short(x.id) + (x.chance < 10000 ? '@' + x.chance : '') })
      .concat(r.fluidsIn.map(function (f) { return f.amount + ' mB ' + short(f.id) })).join(' + ') +
      ((r.charges || []).length > 0 ? ' (held: ' + r.charges.map(function (c) {
        return c.item !== undefined ? c.count + ' ' + short(c.item) + (c.chance > 0 ? '@' + c.chance : '') : c.amount + ' mB ' + short(c.fluid)
      }).join(', ') + ')' : '') + ' -> ' +
      r.itemsOut.map(function (x) { return (x.whole > 0 ? x.whole + ' ' : '') + short(x.id) + (x.chance > 0 ? '@' + x.chance : '') })
        .concat(r.fluidsOut.map(function (f) { return f.amount + ' mB ' + short(f.id) })).join(' + ') +
      '; ' + (r.sources || []).length + ' stages = ' + r.sourceEnergy + ' EU, spent as ' + r.duration + ' t x ' + r.eut + ' EU/t = ' + r.energy +
      (r.keep === true ? '; refuses voiding' : '')
  }

  // a published recipe against its copy in the recipe manager: [problems]. opts: { dataKey, keepKey }
  function liveProblems(rec, opts) {
    var problems = []
    var r = liveRecipe(rec.recipeId)
    if (r === null) return [rec.recipeId + ' not in the recipe manager']
    var items = itemContents(r, true)
    var circuit = items.filter(function (x) { return x.circuit > 0 })
    if (circuit.length !== 1 || circuit[0].circuit !== rec.circuit) problems.push(rec.name + ' circuit ' + JSON.stringify(circuit))
    var wantIn = rec.itemsIn.map(function (x) { return x.id + ' x' + x.count + ' @' + x.chance })
    var wantFin = rec.fluidsIn.map(function (f) { return f.id + ' ' + f.amount + ' @10000' })
    ;(rec.charges || []).forEach(function (c) {
      if (c.item !== undefined) wantIn.push(c.item + ' x' + c.count + ' @' + c.chance)
      else wantFin.push(c.fluid + ' ' + c.amount + ' @' + c.chance)
    })
    var gotIn = items.filter(function (x) { return x.circuit === 0 }).map(function (x) { return x.id + ' x' + x.count + ' @' + x.chance })
    if (wantIn.sort().join(',') !== gotIn.sort().join(',')) problems.push(rec.name + ' items in ' + gotIn.join(',') + ' (want ' + wantIn.join(',') + ')')
    var gotFin = fluidContents(r, true).map(function (f) { return f.id + ' ' + f.amount + ' @' + f.chance })
    if (wantFin.sort().join(',') !== gotFin.sort().join(',')) problems.push(rec.name + ' fluids in ' + gotFin.join(',') + ' (want ' + wantFin.join(',') + ')')
    var wantOut = []
    rec.itemsOut.forEach(function (o) {
      if (o.whole > 0) wantOut.push(o.id + ' x' + o.whole + ' @10000')
      if (o.chance > 0) wantOut.push(o.id + ' x1 @' + o.chance)
    })
    var gotOut = itemContents(r, false).map(function (x) { return x.id + ' x' + x.count + ' @' + x.chance })
    if (wantOut.sort().join(',') !== gotOut.sort().join(',')) problems.push(rec.name + ' items out ' + gotOut.join(',') + ' (want ' + wantOut.join(',') + ')')
    var fout = fluidContents(r, false).map(function (f) { return f.id + ' ' + f.amount }).sort().join(',')
    if (fout !== fluidsText(rec.fluidsOut)) problems.push(rec.name + ' fluids out ' + fout)
    var eut = inputEUt(r)
    if (eut !== rec.eut || Number(r.duration) !== rec.duration) problems.push(rec.name + ' ' + eut + ' EU/t x ' + r.duration + ' t')
    if (opts.dataKey) {
      var key = String(r.data.getString(opts.dataKey))
      if (key !== rec.name) problems.push(rec.name + ' data ' + opts.dataKey + '=' + key)
    }
    if (opts.keepKey && keeps(r, opts.keepKey) !== (rec.keep === true)) problems.push(rec.name + ' ' + opts.keepKey + '=' + keeps(r, opts.keepKey) + ', published keep=' + rec.keep)
    return problems
  }

  function naquadahChecks() {
    safely('pins', pinsCheck)

    safely('composed_naquadah', function () {
      var r = publishedNaq('naquadah')
      var problems = []
      if (r === null) throw new Error('circuit 1 (naquadah) was not published')
      if (r.circuit !== 1 || r.keep === true || (r.charges || []).length !== 0) problems.push('circuit ' + r.circuit + ' keep ' + r.keep + ' charges ' + chargesText(r.charges || []))
      if (!(r.eut <= 7680) || r.maxEut !== 7680) problems.push(r.eut + ' EU/t (maxEut ' + r.maxEut + ')')
      if (r.recipeId !== 'grindless:naquadah_refining/naquadah') problems.push('id ' + r.recipeId)
      check('composed_naquadah', problems.length === 0, withProblems(line(r), problems))
    })

    Object.keys(WANT).forEach(function (name) {
      safely('composed_' + name, function () {
        var r = publishedNaq(name)
        var problems = composedProblems(name, r, WANT[name])
        check('composed_' + name, problems.length === 0, withProblems(r ? line(r) + '; batches ' + r.batches + ', activator x' + r.activatorRuns +
          ', recovered ' + JSON.stringify(r.recovered) : 'none', problems))
      })
    })

    safely('live_contents', function () {
      var np = NP()
      var recs = np.recipes || []
      var problems = []
      recs.forEach(function (rec) {
        problems = problems.concat(liveProblems(rec, { dataKey: np.dataKey || 'grindless_naquadah_plant', keepKey: np.keepKey || 'grindless_naquadah_keep' }))
      })
      if (np.keepKey !== 'grindless_naquadah_keep') problems.push('keepKey ' + np.keepKey)
      var live = allOfType(NAQ_TYPE)
      var ids = live.map(function (r) { return String(r.getId()) }).sort()
      var want = recs.map(function (r) { return r.recipeId }).sort()
      if (ids.join(',') !== want.join(',') || recs.length !== 3) problems.push('the type holds [' + ids.join(', ') + '], published [' + want.join(', ') + ']')
      var circuits = live.map(circuitOf).sort()
      if (circuits.join(',') !== '1,2,3') problems.push('circuits ' + circuits.join(','))
      var keeping = live.filter(function (r) { return keeps(r, np.keepKey || 'grindless_naquadah_keep') }).map(circuitOf).sort()
      if (keeping.join(',') !== '2,3') problems.push('the keep boolean on circuits ' + keeping.join(','))
      check('live_contents', problems.length === 0, withProblems(live.length + ' live ' + NAQ_TYPE + ' recipes [' + ids.join(', ') + '], circuits ' +
        circuits.join(',') + ', keep on ' + keeping.join(','), problems))
    })

    safely('placeholders_empty', function () {
      var problems = []
      var c = lazy()
      PLACEHOLDERS.forEach(function (id) {
        var r = liveRecipe(id)
        if (r === null) {
          problems.push(id + ' is not loaded (GT-- changed its line: re-check the pins)')
          return
        }
        var n = asArray(r.getInputContents(c.ItemCap)).length + asArray(r.getInputContents(c.FluidCap)).length +
          asArray(r.getOutputContents(c.ItemCap)).length + asArray(r.getOutputContents(c.FluidCap)).length
        if (n !== 0) problems.push(id + ' has ' + n + ' contents')
      })
      var listed = (NP().pins && Object.keys(NP().pins)) || []
      check('placeholders_empty', problems.length === 0, withProblems(PLACEHOLDERS.map(short).join(', ') + ' loaded with no inputs or outputs; none is a pinned stage (' +
        listed.length + ' pins)', problems))
    })

    safely('spent_rod_macerate', function () {
      var r = liveRecipe(MACERATE_ROD)
      if (r === null) throw new Error(MACERATE_ROD + ' is not in the recipe manager')
      var ins = itemContents(r, true).filter(function (x) { return x.circuit === 0 })
      var outs = itemContents(r, false)
      var ok = ins.length === 1 && ins[0].id === LONG_ROD && ins[0].count === 1 && outs.length === 1 && outs[0].id === NQ && outs[0].count === 1 &&
        outs[0].chance === 10000 && fluidContents(r, false).length === 0
      check('spent_rod_macerate', ok, MACERATE_ROD + ': ' + ins.map(function (x) { return x.count + ' ' + short(x.id) }).join(' + ') + ' -> ' +
        outs.map(function (x) { return x.count + ' ' + short(x.id) + '@' + x.chance }).join(' + ') + ' (' + inputEUt(r) + ' EU/t x ' + r.duration + ' t)')
    })
  }

  // ---------------------------------------------------------------- static checks: the LuV parallel hatch and the platinum plant's mode 4

  // every recipe of the manager that makes an item: crafting-like recipes by their result, GT recipes by their item outputs
  function makersOf(id) {
    var c = lazy()
    var found = []
    var unreadable = 0
    var access = S.server.registryAccess()
    asArray(S.server.getRecipeManager().getRecipes()).forEach(function (r) {
      try {
        if (r instanceof c.GTRecipe) {
          var outs = asArray(c.RecipeHelper.getOutputItems(r))
          for (var i = 0; i < outs.length; i++) {
            if (itemName(outs[i]) === id) {
              found.push(String(r.getId()))
              return
            }
          }
          return
        }
        // an empty stack compares === null in KubeJS 2001.6.5: both cases are "no result"
        var res = r.getResultItem(access)
        if (res !== null && !res.isEmpty() && itemName(res) === id) found.push(String(r.getId()))
      } catch (e) {
        unreadable++
      }
    })
    return { ids: found, unreadable: unreadable }
  }

  function luvHatchCheck() {
    var problems = []
    var ph = PH()
    if (ph.luvRecipe !== LUV_HATCH_RECIPE) problems.push('global.grindless.parallelHatch.luvRecipe ' + ph.luvRecipe)
    if ((ph.hatches || []).indexOf(LUV_HATCH) < 0) problems.push('global.grindless.parallelHatch.hatches lacks ' + LUV_HATCH)
    var r = liveRecipe(LUV_HATCH_RECIPE)
    if (r === null) throw new Error(LUV_HATCH_RECIPE + ' is not in the recipe manager')
    var res = r.getResultItem(S.server.registryAccess())
    var made = res === null || res.isEmpty() ? 'nothing' : Number(res.getCount()) + ' ' + itemName(res)
    if (made !== '1 ' + LUV_HATCH) problems.push('it makes ' + made)
    var zpm = {}
    asArray(Ingredient.of('#gtceu:circuits/zpm').getItemIds()).forEach(function (x) { zpm[String(x)] = true })
    var tally = { sensor: 0, emitter: 0, hull: 0, cable: 0, circuit: 0, other: 0 }
    var parts = { 'gtceu:luv_sensor': 'sensor', 'gtceu:luv_emitter': 'emitter', 'gtceu:luv_machine_hull': 'hull', 'gtceu:niobium_titanium_double_cable': 'cable' }
    var others = []
    var filled = 0
    asArray(r.getIngredients()).forEach(function (ing) {
      var ids = asArray(ing.getItemIds()).map(String)
      if (ids.length === 0) return
      filled++
      var kind = null
      Object.keys(parts).forEach(function (p) { if (kind === null && ids.indexOf(p) >= 0) kind = parts[p] })
      if (kind === null && ids.every(function (x) { return zpm[x] === true })) kind = 'circuit'
      if (kind === null) {
        kind = 'other'
        others.push(ids.slice(0, 3).join('/'))
      }
      tally[kind]++
    })
    var want = { sensor: 1, emitter: 1, hull: 1, cable: 2, circuit: 4, other: 0 }
    Object.keys(want).forEach(function (k) { if (tally[k] !== want[k]) problems.push(tally[k] + ' ' + k + ', GTM has ' + want[k]) })
    if (filled !== 9) problems.push(filled + ' filled cells, GTM\'s SZE/ZHZ/CZC fills 9')
    if (others.length > 0) problems.push('unexpected ingredients ' + others.join(', '))
    var makers = makersOf(LUV_HATCH)
    if (makers.ids.join(',') !== LUV_HATCH_RECIPE) problems.push('made by [' + makers.ids.join(', ') + ']')
    check('luv_parallel_hatch_recipe', problems.length === 0, withProblems(LUV_HATCH_RECIPE + ' -> ' + made + ' from ' + JSON.stringify(tally) +
      ' (' + Object.keys(zpm).length + ' ZPM circuits accepted); makers of ' + short(LUV_HATCH) + ': [' + makers.ids.join(', ') + ']' +
      (makers.unreadable > 0 ? ' (' + makers.unreadable + ' recipes unreadable)' : ''), problems))
  }

  function pgmLine(r) {
    return r.recipeId + ' circuit ' + r.circuit + ': ' + r.itemsIn.map(function (x) { return x.count + ' ' + short(x.id) + (x.chance < 10000 ? '@' + x.chance : '') })
      .concat(r.fluidsIn.map(function (f) { return f.amount + ' mB ' + short(f.id) })).join(' + ') + ' -> ' +
      r.itemsOut.map(function (x) { return (x.whole > 0 ? x.whole + ' ' : '') + short(x.id) + (x.chance > 0 ? '@' + x.chance : '') })
        .concat(r.fluidsOut.map(function (f) { return f.amount + ' mB ' + short(f.id) })).join(' + ') + '; ' + r.duration + ' t x ' + r.eut + ' EU/t' +
      (r.keep === true ? '; refuses voiding' : '')
  }

  function pgmMode4Check() {
    var pp = PP()
    var problems = []
    var keepKey = pp.keepKey || 'grindless_pgm_keep'
    var rec = publishedPgm('asteroid')
    if (!Item.exists(CONCENTRATE)) problems.push(CONCENTRATE + ' is not registered: LuV A1 (the era\'s shared items) must be merged before the integrated run')
    if (rec === null) {
      var why = (pp.skipped || []).filter(function (s) { return s.name === 'asteroid' }).map(function (s) { return s.reason })
      problems.push('mode 4 was not built' + (why.length > 0 ? ': ' + why.join('; ') : (pp.asteroid && pp.asteroid.error ? ': ' + pp.asteroid.error : '')))
    }
    if (keepKey !== 'grindless_pgm_keep') problems.push('keepKey ' + keepKey)
    if (rec !== null) {
      if (rec.recipeId !== ASTEROID_ID || rec.mode !== 'asteroid' || rec.circuit !== 4 || rec.keep !== true) {
        problems.push('published as ' + rec.recipeId + ' mode ' + rec.mode + ' circuit ' + rec.circuit + ' keep ' + rec.keep)
      }
      var cin = rec.itemsIn.filter(function (x) { return x.id === CONCENTRATE })[0]
      if (!cin || cin.count !== 22 || cin.chance !== 10000) problems.push('concentrate in ' + JSON.stringify(cin || null))
      var want = {}
      want[IR] = 3
      want[OS] = 3
      want[PGS] = 1
      Object.keys(want).forEach(function (id) {
        var o = rec.itemsOut.filter(function (x) { return x.id === id })[0]
        if (!o || o.whole !== want[id] || o.chance !== 0) problems.push(short(id) + ' out ' + JSON.stringify(o || null) + ', want ' + want[id])
      })
      var y = pp.asteroid ? pp.asteroid.yields : null
      if (!y || (y.differ || []).length > 0) problems.push('yields ' + JSON.stringify(y))
      problems = problems.concat(liveProblems(rec, { keepKey: keepKey }))
    }
    var live = allOfType(PGM_TYPE)
    var rest = live.filter(function (r) { return String(r.getId()) !== ASTEROID_ID })
    var c4 = rest.filter(function (r) { return circuitOf(r) === 4 }).map(function (r) { return String(r.getId()) })
    var keepers = rest.filter(function (r) { return keeps(r, keepKey) }).map(function (r) { return String(r.getId()) })
    if (c4.length > 0) problems.push('circuit 4 also in ' + c4.join(', '))
    if (keepers.length > 0) problems.push('the keep boolean also on ' + keepers.join(', '))
    if (live.length !== (pp.recipes || []).length) problems.push(live.length + ' live ' + PGM_TYPE + ' recipes, ' + (pp.recipes || []).length + ' published')
    check('pgm_mode4', problems.length === 0, withProblems((rec ? pgmLine(rec) : 'no mode 4 recipe') + '; ' + live.length + ' live ' + PGM_TYPE +
      ' recipes, circuit 4 and the keep boolean only on ' + short(ASTEROID_ID), problems))
  }

  function staticChecks() {
    safely('ids', idsCheck)
    safely('registration', registrationCheck)
    naquadahChecks()
    safely('luv_parallel_hatch_recipe', luvHatchCheck)
    safely('pgm_mode4', pgmMode4Check)
  }

  // ---------------------------------------------------------------- structures (gg_test_naquadah_plant's technique)

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
    return cmd('setblock ' + x + ' ' + y + ' ' + z + ' ' + id + (props || '') + ' replace')
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
      formed(m, ctrl)
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

  // ---------------------------------------------------------------- driving a copy

  // the energy hatches are topped up every tick; what they lost since the last tick is what the machine drew
  function meter(m) {
    var drawn = 0
    m.copy.energies.forEach(function (role) {
      if (!m.P[role]) return
      var c = m.P[role].energyContainer
      var cap = Number(c.getEnergyCapacity())
      var stored = Number(c.getEnergyStored())
      if (m.metered) drawn += cap - stored
      c.setEnergyStored(cap)
    })
    m.euUsed += drawn
    m.metered = true
  }

  // empties every part (the circuit too) and loads a scenario: items into the input bus, fluids into the input hatches in order
  function load(m, sc) {
    emptyBus(m.P.inBus)
    emptyBus(m.P.outBus)
    m.copy.ins.forEach(function (role) { setTank(m.P[role], null, 0) })
    m.copy.outs.forEach(function (role) { setTank(m.P[role], null, 0) })
    m.P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(sc.circuit))
    ;(sc.items || []).forEach(function (x) { insert(m.P.inBus, x[0], x[1]) })
    if ((sc.fluids || []).length > m.copy.ins.length) throw new Error((sc.fluids || []).length + ' fluids for ' + m.copy.ins.length + ' input hatches')
    ;(sc.fluids || []).forEach(function (f, i) { setTank(m.P[m.copy.ins[i]], f[0], f[1]) })
  }

  function begin(m, phase) {
    m.phase = phase
    m.t0 = S.t
    m.seen = {}
    m.run = null
    m.seenWorking = false
    m.eu0 = m.euUsed
    m.ffAt = -1
    wake(m.ctrl)
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

  // every tick: the energy the controller drew, and what it runs (the recipe as modified: copies, EU/t and duration)
  function measure(m) {
    if (!m.ctrl || !m.P || m.phase === 'forming' || m.phase === 'formed' || m.phase === 'done') return
    meter(m)
    var rlg = m.ctrl.getRecipeLogic()
    var last = rlg.getLastRecipe()
    if (String(rlg.getStatus()) === 'WORKING' && last !== null && last !== undefined) {
      m.seenWorking = true
      m.seen[String(last.id)] = true
      if (m.run === null) m.run = { id: String(last.id), parallels: Number(last.parallels), eut: inputEUt(last), duration: Number(last.duration) }
    }
  }

  // skips the waiting of the run under way (GTM finishes it on its next tick, with its real outputs and chance rolls)
  function fastForward(m, name) {
    var rlg = m.ctrl.getRecipeLogic()
    var before = Number(rlg.getProgress())
    var duration = Number(rlg.getDuration())
    if (statusOf(m.ctrl) === 'WORKING' && duration > 2) rlg.setProgress(duration - 1)
    m.ffAt = S.t
    note(name, 'progress ' + before + ' -> ' + rlg.getProgress() + ' of ' + duration + ' (only the waiting is skipped, the outputs are the real ones)')
  }

  function runText(run) {
    return run ? run.id + ' x' + run.parallels + ' at ' + run.eut + ' EU/t x ' + run.duration + ' t' : 'no run'
  }

  function blockedText(m) {
    var r = result(m)
    return 'ran [' + Object.keys(m.seen).join(',') + '], ' + r.eu + ' EU, bus [' + summary(r.left) + '], ' + tankSummary(m) + ', out [' + summary(r.out) +
      '] ' + fluidSummary(r.fluids) + ' | ' + state(m.ctrl) + ' reasons=[' + failureReasons(m.ctrl).join(' ; ') + ']'
  }

  // ---------------------------------------------------------------- copy naq: the naquadah plant with GTM's LuV parallel hatch

  // one copy of circuit 2's inputs, charges included
  function oneCopy() {
    return {
      circuit: 2,
      items: [[E_OXIDE, 4], [SOURCE, 1], [PDC, 1], [AUF3, 4]],
      fluids: [[F2, 36000], [H2, 26500], [H2SO4, 8000], [XE, 1000], [HSBF6, 2500]]
    }
  }

  // the hatch the controller reads: GTM's LuV one (it takes 16 copies, the IV one clamps at 4), set to COPIES; two LuV energy hatches
  function naqHatch(m) {
    var problems = []
    var hatch = m.ctrl.getParallelHatch()
    var present = hatch.isPresent()
    var p = m.P.parallel
    var hatchId = String(p.getDefinition().getId())
    p.setCurrentParallel(16)
    var max = Number(p.getCurrentParallel())
    p.setCurrentParallel(COPIES)
    var current = present ? Number(hatch.get().getCurrentParallel()) : 0
    var volts = Number(m.ctrl.getOverclockVoltage())
    if (!present) problems.push('the controller reads no parallel hatch')
    if (hatchId !== LUV_HATCH) problems.push('the hatch is ' + hatchId)
    if (max !== 16) problems.push('it takes ' + max + ' copies at most, GTM\'s LuV hatch 16')
    if (current !== COPIES) problems.push('set to ' + current + ', want ' + COPIES)
    if (volts !== ZPM_VOLTAGE) problems.push('voltage ' + volts + ', two LuV hatches give ' + ZPM_VOLTAGE)
    return { text: 'parallel hatch ' + short(hatchId) + (present ? ' read by the controller' : ' NOT read by the controller') + ', up to ' + max +
      ' copies, set to ' + current + '; voltage ' + volts, problems: problems }
  }

  function naqStart(m) {
    var one = oneCopy()
    setVoiding(m, 'VOID_NONE')
    // the charges once (never multiplied), every consumed input COPIES times (the chanced Pu-Be source and Pd/C included)
    load(m, {
      circuit: 2,
      items: one.items.map(function (x) { return [x[0], x[0] === AUF3 ? x[1] : x[1] * COPIES] }),
      fluids: one.fluids.map(function (f) { return [f[0], f[0] === XE || f[0] === HSBF6 ? f[1] : f[1] * COPIES] })
    })
    begin(m, 'par_start')
  }

  function startVoiding(m) {
    setVoiding(m, 'VOID_ITEMS')
    load(m, oneCopy())
    begin(m, 'void_items')
  }

  function startMode1(m) {
    setVoiding(m, 'VOID_ITEMS_FLUIDS')
    load(m, { circuit: 1, items: [[OXIDE, 4], [SB2O3, 15], [SOURCE, 1]], fluids: [[HF, 40500]] })
    begin(m, 'mode1')
  }

  // the outputs and what is left of `n` copies of circuit 2: [problems]
  function copiesProblems(m, rec, r, n) {
    var problems = []
    if (m.seen[rec.recipeId] !== true) problems.push(rec.recipeId + ' never ran (seen ' + Object.keys(m.seen).join(',') + ')')
    var sul = r.out[SULFATE] || 0
    var ti = r.out[TI] || 0
    if (!between(sul, 11 * n, 12 * n)) problems.push(sul + ' sulfate, want ' + 11 * n + '-' + 12 * n)
    if ((r.out[TRINIUM] || 0) !== 2 * n) problems.push((r.out[TRINIUM] || 0) + ' trinium sulfide, want ' + 2 * n)
    if (!between(ti, 3 * n, 4 * n)) problems.push(ti + ' titanium, want ' + 3 * n + '-' + 4 * n)
    var extra = Object.keys(r.out).filter(function (id) { return [SULFATE, TRINIUM, TI].indexOf(id) < 0 })
    if (extra.length > 0) problems.push('also made ' + extra.join(', '))
    if ((r.fluids[NAQUADRIA] || 0) !== 750 * n || (r.fluids[HF] || 0) !== 8500 * n || Object.keys(r.fluids).length !== 2) {
      problems.push('fluids out ' + fluidSummary(r.fluids) + ', want ' + 750 * n + ' naquadria and ' + 8500 * n + ' HF')
    }
    var leftExtra = Object.keys(r.left).filter(function (id) { return [SOURCE, PDC, AUF3].indexOf(id) < 0 })
    if (leftExtra.length > 0) problems.push('left in the bus ' + summary(r.left))
    if (!between(r.left[SOURCE] || 0, 0, n) || !between(r.left[PDC] || 0, 0, n)) problems.push('Pu-Be ' + (r.left[SOURCE] || 0) + ', Pd/C ' + (r.left[PDC] || 0) + ' left of ' + n)
    if ((r.left[AUF3] || 0) !== 4) problems.push((r.left[AUF3] || 0) + ' AuF3 left of 4 (a charge)')
    var want = [[F2, 0], [H2, 0], [H2SO4, 0], [XE, 1000], [HSBF6, 2500]]
    want.forEach(function (w, i) {
      var t = r.tanks[i]
      if (t.amount !== w[1] || (w[1] > 0 && t.id !== w[0])) problems.push(m.copy.ins[i] + ' holds ' + t.amount + ' ' + short(t.id) + ', want ' + w[1] + ' ' + short(w[0]))
    })
    return problems
  }

  function copiesText(r, n) {
    return 'out [' + summary(r.out) + '] ' + fluidSummary(r.fluids) + '; Pu-Be used ' + (n - (r.left[SOURCE] || 0)) + ' of ' + n + ', Pd/C used ' + (n - (r.left[PDC] || 0)) +
      ' of ' + n + ', AuF3 ' + (r.left[AUF3] || 0) + '; tanks ' + r.tanks.map(function (t) { return t.amount + ' ' + short(t.id) }).join(', ')
  }

  function naqStep(m, age) {
    var rec = publishedNaq('enriched_naquadah')
    if (rec === null) {
      check('naq_parallel_start', false, 'circuit 2 (enriched_naquadah) was not published: nothing to run')
      m.phase = 'done'
      return
    }
    var rlg = m.ctrl.getRecipeLogic()

    if (m.phase === 'par_start') {
      if (m.run === null) {
        if (age < START_TIMEOUT) return
        check('naq_parallel_start', false, COPIES + ' copies of circuit 2: nothing started in ' + age + ' ticks: ' + blockedText(m))
        startVoiding(m)
        return
      }
      m.win = { t: S.t, eu: m.euUsed, progress: Number(rlg.getProgress()) }
      m.phase = 'par_observe'
      return
    }

    if (m.phase === 'par_observe') {
      var working = statusOf(m.ctrl) === 'WORKING'
      if (working && S.t - m.win.t < OBSERVE) return
      var ticks = S.t - m.win.t
      var dp = Number(rlg.getProgress()) - m.win.progress
      var deu = m.euUsed - m.win.eu
      var run = m.run
      var problems = []
      if (run.id !== rec.recipeId) problems.push('ran ' + run.id)
      if (run.parallels !== COPIES) problems.push(run.parallels + ' copies, want ' + COPIES)
      if (run.eut !== COPIES * rec.eut) problems.push(run.eut + ' EU/t, want ' + COPIES * rec.eut)
      if (run.duration !== rec.duration) problems.push(run.duration + ' t, want ' + rec.duration + ' (no overclock fits at ' + ZPM_VOLTAGE + ' V)')
      if (!working) problems.push('it stopped after ' + ticks + ' ticks: ' + state(m.ctrl))
      if (dp < ticks - 1 || dp > ticks + 1) problems.push('progress ' + dp + ' in ' + ticks + ' ticks')
      if (deu !== dp * run.eut) problems.push(deu + ' EU drawn for ' + dp + ' ticks of progress, want ' + dp * run.eut)
      check('naq_parallel_start', problems.length === 0, withProblems(4 * COPIES + ' enriched oxide + ' + COPIES + ' Pu-Be + ' + COPIES + ' Pd/C + 4 AuF3 + ' +
        36000 * COPIES + ' F2 + ' + 26500 * COPIES + ' H2 + ' + 8000 * COPIES + ' H2SO4 + 1000 Xe + 2500 HSbF6, circuit 2: ' + runText(run) + ' (one copy ' +
        rec.eut + ' EU/t x ' + rec.duration + ' t); over ' + ticks + ' ticks the progress went ' + m.win.progress + ' -> ' + (m.win.progress + dp) +
        ' and the hatches gave ' + deu + ' EU (' + (dp > 0 ? deu / dp : 0) + ' a tick); at real speed the run costs ' + run.eut * run.duration + ' EU (' + COPIES +
        ' x ' + rec.energy + ')', problems))
      if (working) fastForward(m, 'naq_FASTFORWARD')
      m.ffAt = S.t
      m.phase = 'par_finish'
      return
    }

    if (m.phase === 'par_finish') {
      if (statusOf(m.ctrl) === 'WORKING' && S.t - m.ffAt < FINISH_TIMEOUT) return
      var r = result(m)
      var pp = copiesProblems(m, rec, r, COPIES)
      check('naq_PROCESS_parallel', pp.length === 0, withProblems('one run of ' + COPIES + ' copies: ' + copiesText(r, COPIES) + ' | ' + state(m.ctrl), pp))
      startVoiding(m)
      return
    }

    if (m.phase === 'void_items' || m.phase === 'void_fluids') {
      if (age < HOLD_TICKS) return
      var items = m.phase === 'void_items'
      var r0 = result(m)
      var still = m.run === null && r0.eu === 0 && (r0.left[E_OXIDE] || 0) === 4 && r0.tanks[0].amount === 36000 && Object.keys(r0.out).length === 0
      var shown = failureReasons(m.ctrl).some(function (x) { return NAQ_REASON.test(x) })
      check('naq_no_voiding_' + (items ? 'items' : 'fluids'), still && shown, 'one copy of circuit 2, the controller voiding ' + (items ? 'items' : 'fluids') +
        ', ' + age + ' ticks: refusal shown=' + shown + ', ' + blockedText(m))
      if (items) {
        setVoiding(m, 'VOID_FLUIDS')
        begin(m, 'void_fluids')
      } else {
        setVoiding(m, 'VOID_NONE')
        begin(m, 'resume')
      }
      return
    }

    if (m.phase === 'resume') {
      if (m.run === null) {
        if (age < START_TIMEOUT) return
        check('naq_resumes', false, 'voiding off: nothing started in ' + age + ' ticks: ' + blockedText(m))
        startMode1(m)
        return
      }
      m.resumed = m.run
      fastForward(m, 'naq_FASTFORWARD')
      m.phase = 'resume_finish'
      return
    }

    if (m.phase === 'resume_finish') {
      if (statusOf(m.ctrl) === 'WORKING' && S.t - m.ffAt < FINISH_TIMEOUT) return
      var r2 = result(m)
      var p2 = copiesProblems(m, rec, r2, 1)
      if (m.resumed.parallels !== 1) p2.push(m.resumed.parallels + ' copies from one copy of inputs')
      check('naq_resumes', p2.length === 0, withProblems('voiding off, after ' + age + ' ticks: ' + runText(m.resumed) + ' (one copy, GTM\'s overclock) -> ' +
        copiesText(r2, 1), p2))
      startMode1(m)
      return
    }

    if (m.phase === 'mode1') {
      var rec1 = publishedNaq('naquadah')
      var limit = (rec1 ? rec1.duration : 200) + SLACK
      var over = (m.seenWorking && statusOf(m.ctrl) !== 'WORKING') || (!m.seenWorking && age >= START_TIMEOUT) || age >= limit
      if (!over) return
      var r3 = result(m)
      var ran = rec1 !== null && m.seen[rec1.recipeId] === true && (r3.left[OXIDE] || 0) === 0 && (r3.left[SB2O3] || 0) === 0
      check('naq_mode1_voids', ran, 'circuit 1 with items and fluids voided, ' + age + ' ticks: ' + runText(m.run) + ', out [' + summary(r3.out) + '] ' +
        fluidSummary(r3.fluids) + ', bus [' + summary(r3.left) + '] | ' + state(m.ctrl) + ' reasons=[' + failureReasons(m.ctrl).join(' ; ') + ']')
      setVoiding(m, 'VOID_NONE')
      m.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- copy pt: the platinum plant's mode 4 refuses voiding

  function ptStart(m) {
    var rec = publishedPgm('asteroid')
    if (rec === null) {
      note('pt_process', 'skipped: mode 4 was not built (pgm_mode4 says why)')
      m.phase = 'done'
      return
    }
    m.rec = rec
    setVoiding(m, 'VOID_ITEMS_FLUIDS')
    load(m, {
      circuit: rec.circuit,
      items: rec.itemsIn.map(function (x) { return [x.id, x.count] }),
      fluids: rec.fluidsIn.map(function (f) { return [f.id, f.amount] })
    })
    begin(m, 'pt_void')
  }

  function ptStep(m, age) {
    var rec = m.rec
    if (m.phase === 'pt_void') {
      if (age < HOLD_TICKS) return
      var r = result(m)
      var intact = rec.itemsIn.every(function (x) { return (r.left[x.id] || 0) === x.count }) &&
        rec.fluidsIn.every(function (f, i) { return r.tanks[i].amount === f.amount })
      var still = m.run === null && r.eu === 0 && intact
      var shown = failureReasons(m.ctrl).some(function (x) { return PGM_REASON.test(x) })
      check('pt_no_voiding', still && shown, 'mode 4\'s inputs, circuit 4, the controller voiding items and fluids, ' + age + ' ticks: refusal shown=' + shown +
        ', ' + blockedText(m))
      setVoiding(m, 'VOID_NONE')
      begin(m, 'pt_resume')
      return
    }
    if (m.phase === 'pt_resume') {
      if (m.run === null) {
        if (age < START_TIMEOUT) return
        check('pt_resumes', false, 'voiding off: nothing started in ' + age + ' ticks: ' + blockedText(m))
        m.phase = 'done'
        return
      }
      check('pt_resumes', m.run.id === rec.recipeId && m.run.parallels === 1, 'voiding off, after ' + age + ' ticks: ' + runText(m.run) + ' (published ' +
        rec.eut + ' EU/t x ' + rec.duration + ' t)')
      fastForward(m, 'pt_FASTFORWARD')
      m.phase = 'pt_finish'
      return
    }
    if (m.phase === 'pt_finish') {
      if (statusOf(m.ctrl) === 'WORKING' && S.t - m.ffAt < FINISH_TIMEOUT) return
      var r2 = result(m)
      var problems = []
      var made = rec.itemsOut.map(function (o) { return o.id })
      rec.itemsOut.forEach(function (o) {
        var got = r2.out[o.id] || 0
        if (!between(got, o.whole, o.whole + (o.chance > 0 ? 1 : 0))) problems.push(got + ' ' + short(o.id) + ', want ' + o.whole + (o.chance > 0 ? '-' + (o.whole + 1) : ''))
      })
      Object.keys(r2.out).forEach(function (id) { if (made.indexOf(id) < 0) problems.push('also made ' + id) })
      rec.fluidsOut.forEach(function (f) { if ((r2.fluids[f.id] || 0) !== f.amount) problems.push((r2.fluids[f.id] || 0) + ' mB ' + short(f.id) + ', want ' + f.amount) })
      if (Object.keys(r2.fluids).length !== rec.fluidsOut.length) problems.push('fluids out ' + fluidSummary(r2.fluids))
      var leftExtra = Object.keys(r2.left).filter(function (id) { return id !== ELECTRODE })
      if (leftExtra.length > 0 || (r2.left[ELECTRODE] || 0) > 1) problems.push('left in the bus ' + summary(r2.left))
      r2.tanks.forEach(function (t, i) { if (t.amount !== 0) problems.push(m.copy.ins[i] + ' kept ' + t.amount + ' mB ' + short(t.id)) })
      check('pt_PROCESS_asteroid', problems.length === 0, withProblems('circuit 4 -> [' + summary(r2.out) + '] ' + fluidSummary(r2.fluids) + '; electrode ' +
        ((r2.left[ELECTRODE] || 0) === 1 ? 'kept' : 'used up') + ' | ' + state(m.ctrl), problems))
      m.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- run

  function prepareWorld() {
    S.areaTouched = true
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    var loaded = cmd('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = cmd('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    // a roof over the area: a hatch that is rained on may explode (GTM's weather check)
    cmd('fill ' + BAND.x0 + ' ' + ROOF_Y + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + ROOF_Y + ' ' + BAND.z1 + ' minecraft:smooth_stone')
    note('AREA', 'X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 + ' (of the band X 14848-14911, Z 0-63): ' +
      'generated, forceload add ' + loaded + ', changed ' + cleared + ' blocks while clearing, roof at Y ' + ROOF_Y)
  }

  // the parts emptied (nothing to drop), the area cleared, stray items removed and the force-load released
  function cleanup() {
    if (!S.areaTouched) return
    S.copies.forEach(function (m) {
      if (!m.P || !m.ctrl) return
      try {
        m.ctrl.setVoidingMode(lazy().VoidingMode.VOID_NONE)
        emptyBus(m.P.inBus)
        emptyBus(m.P.outBus)
        m.copy.ins.concat(m.copy.outs).forEach(function (role) { if (m.P[role]) setTank(m.P[role], null, 0) })
      } catch (e) { /* the fill below clears it anyway */ }
    })
    var cleared = cmd('fill ' + BAND.x0 + ' ' + BAND.y0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.y1 + ' ' + BAND.z1 + ' air')
    var list = S.level.getEntitiesOfClass(lazy().ItemEntity, new (lazy().AABB)(BAND.x0, BAND.y0, BAND.z0, BAND.x1 + 1, BAND.y1 + 1, BAND.z1 + 1))
    for (var i = 0; i < list.size(); i++) list.get(i).discard()
    var released = cmd('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    note('CLEANUP', 'cleared ' + cleared + ' blocks, ' + list.size() + ' item entities removed, forceload remove ' + released)
  }

  function startCopies() {
    S.t0 = S.t
    PLANTS.forEach(function (copy) {
      var m = { copy: copy, phase: 'forming', seen: {}, run: null, seenWorking: false, euUsed: 0, eu0: 0, metered: false, ctrl: null, P: null, forced: false, ffAt: -1 }
      S.copies.push(m)
      try {
        if (!place(m)) m.phase = 'done'
      } catch (e) {
        check(copy.key + '_PLACED', false, 'exception: ' + e)
        m.phase = 'done'
      }
    })
  }

  function formed(m, ctrl) {
    safely(m.copy.key + '_PARTS', function () {
      m.ctrl = ctrl
      m.P = findParts(m, ctrl)
      var want = {}
      Object.keys(m.copy.parts).forEach(function (k) { want[m.copy.parts[k]] = true })
      var missing = Object.keys(want).filter(function (role) { return !m.P[role] })
      var extra = { text: '', problems: [] }
      if (missing.length === 0 && m.copy.key === 'naq') extra = naqHatch(m)
      check(m.copy.key + '_PARTS', missing.length === 0 && extra.problems.length === 0, withProblems('[' + m.P.ids.join(' ') + ']' +
        (extra.text !== '' ? ' ' + extra.text : '') + (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''), extra.problems))
      if (missing.length > 0) {
        m.phase = 'done'
        return
      }
      var absent = m.copy.missing || []
      if (absent.length > 0) {
        note(m.copy.key + '_process', 'skipped: missing ids ' + absent.join(', '))
        m.phase = 'done'
        return
      }
      meter(m)
      if (m.copy.key === 'naq') naqStart(m)
      else ptStart(m)
    })
    if (m.phase === 'formed') m.phase = 'done'
  }

  function step(m) {
    if (m.phase === 'forming') {
      if (S.t % STEP === 0) formStep(m)
      return
    }
    var age = S.t - m.t0
    if (m.copy.key === 'naq') naqStep(m, age)
    else ptStep(m, age)
  }

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
    S.t = server.getTickCount() - S.tick0
    S.copies.forEach(function (m) {
      if (m.phase === 'done') return
      try {
        measure(m)
        step(m)
      } catch (e) {
        check(m.copy.key + '_STEP', false, 'exception in ' + m.phase + ': ' + e)
        m.phase = 'done'
      }
    })
    if (S.t >= MAX_TICKS) {
      S.copies.forEach(function (m) {
        if (m.phase === 'done') return
        check(m.copy.key + '_TIMEOUT', false, 'still in ' + m.phase + ' after ' + S.t + ' ticks' + (m.ctrl ? ' | ' + state(m.ctrl) : ''))
        m.phase = 'done'
      })
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
    S = { server: server, level: server.overworld(), t: 0, tick0: server.getTickCount(), copies: [], finished: false, areaTouched: false }
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

  ServerEvents.customCommand('gg_test_luv_a2', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_luv_a2 run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
