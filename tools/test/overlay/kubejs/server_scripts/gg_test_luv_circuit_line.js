// priority: -4124
// Gregtech Grindless - LuV spike S0-4: GT--'s circuit assembly line and GTM's NPU recipe (TEST-ONLY overlay: copied over the
// instance on the test PC, never shipped with the pack). Prepared by LuV-A5 for LuV's single integrated run; not run yet.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_luv_circuit_line' -WaitForLog 'GGTEST\|luv_circuit_line\|DONE@@120'
//
// Markers: GGTEST|luv_circuit_line|<check>|PASS|FAIL|NOTE|<detail>
//   ids                 every block and item the check places or loads exists
//   registration        gtnn:circuit_assembly_line has types [gtceu:circuit_assembly_line, gtceu:circuit_assembler] (mode 0, mode 1)
//   npu_recipe          live gtceu:circuit_assembler/neuro_processor: 80,000 EU/t x 600 t, EU tier ZPM (7), a cleanroom condition, 1 NPU
//   wetware_recipe      live grindless:circuit_assembly_line/wetware_processor_luv (server_scripts/grindless/luv/circuit_line.js, GT--'s
//                       recipe at LuV voltage, the same 23.04 M EU): 30,720 EU/t x 750 t, tier LuV (6), research condition, 6 item
//                       inputs + 72 mB soldering alloy -> 32 wetware processors; GT--'s gtnn:...wetware_processor_luv_soldering_alloy is gone
//   research_entry      the type's data-stick entry for the research id lists our wetware recipe (what GT--'s checkResearch reads:
//                       GTM's KubeJS plugin files every added GT recipe there through GTRecipeBuilder#save)
//   molten_cerrobase    live grindless:fluid_heater/molten_cerrobase_140: 144 mB gtceu:cerrobase_140 -> 144 mB molten, 120 EU/t x 181 t
//                       (GTM's ingot melt price), and gtnn:assembly_line/circuit_assembly_line takes 1,440 mB of that molten fluid
//   rule_table          GTM's EnergyContainerList.calculateVoltageAmperage + GTUtil tiers for 1 x LuV 2A/4A/16A, 1 x ZPM 2A/4A and
//                       two LuV 2A: GT--'s combined tier and GTM's max tier, as S0-4.md's table says
//   npu_sources         recipe manager: no recipe <= 32,768 EU/t (any mod, any type) outputs gtceu:neuro_processing_unit unless its
//                       type is gtceu:organoid_assembly; NOTE lists every NPU maker
//   <copy>_PLACED / _FORMED / _PARTS   the copies below (two_luv: expected NOT to form)
//   two_luv_refused     a line with a second LuV energy hatch in a grating cell never forms (the pattern has one energy cell)
//   <copy>_npu_modifier fullModifyRecipe(NPU recipe) in circuit-assembler mode: null or not as expected, and which rule refuses
//                       (GT--: recipe tier >= tier of the combined hatch voltage; GTM: recipe tier > the machine tier)
//   <copy>_npu_run      NPU inputs loaded, a dummy cleanroom given: it does not start (luv, luv16a, zpm) or starts (zpm4a)
//   <copy>_wetware_modifier / _wetware_run   mode 0, research stick in the template slot, wetware inputs in bus order: starts on
//                       one LuV 2A hatch (30,720 EU/t x 750 t), on LuV 16A and on ZPM 2A (overclocked)
//   uaf_npu_modifier / uaf_npu_run   (UAF.enabled) our Universal Assembly Factory on two LuV hatches in circuit-assembler mode:
//                       it refuses the NPU recipe (mv/leisure_factories.js: HATCH_VOLTAGE_LOCKED, landed with LuV-A5)
//   CLEANUP, DONE
//
// Lines (GTPPMachines.CIRCUIT_ASSEMBLY_LINE: start(BACK, UP, RIGHT); for a controller facing north the slices go east, a slice's
// chars south and its strings up). Seven slices (six ULV input buses, the most the pattern takes), controller at (X0, Y+2, z):
//   row Y  : F I F   (slice 0: the one fluid hatch; last slice: O, the output bus)
//   row Y+1: R T R   (osmium borosilicate glass / assembly line unit / glass)
//   row Y+2: S E D   (controller / the ONE energy hatch / grating), then D D D in every other slice
// TEST AREA: X 15648-15679, Y 98-112, Z 0-31 of the Overworld (X 15616-15647 is the biofoundry's, gg_test_luv_biofoundry), force-loaded while it runs, roof at Y 111, cleared at the end.
// var + function everywhere (Rhino: "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'luv_circuit_line'
  var BAND = { x0: 15648, x1: 15679, y0: 98, y1: 112, z0: 0, z1: 31 }
  var ROOF_Y = 111
  var Y = 100
  var X0 = 15652
  var SLICES = 7
  var STEP = 5
  var FORM_TIMEOUT = 200
  var HOLD = 60
  var START_WAIT = 100

  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestLuvCircuitLineRequest'

  var LINE = 'gtnn:circuit_assembly_line'
  var NPU_RECIPE = 'gtceu:circuit_assembler/neuro_processor'
  var WET_RECIPE = 'grindless:circuit_assembly_line/wetware_processor_luv'
  var MELT_RECIPE = 'grindless:fluid_heater/molten_cerrobase_140'
  var LINE_RECIPE = 'gtnn:assembly_line/circuit_assembly_line'
  var GTNN_WET_RECIPE = 'gtnn:circuit_assembly_line/wetware_processor_luv_soldering_alloy'
  var NPU = 'gtceu:neuro_processing_unit'
  var WETWARE = 'gtceu:wetware_processor'
  var LAB_TYPE = 'gtceu:organoid_assembly'
  var LUV_V = 32768
  var ZPM_V = 131072
  var RESEARCH_FALLBACK = '1x_gtnn_etched_wetware_processor_base'
  var B = {
    casing: 'gtceu:solid_machine_casing',
    glass: 'gtnn:osmium_borosilicate_glass',
    unit: 'gtceu:assembly_line_unit',
    grating: 'gtceu:assembly_line_grating',
    bus: 'gtceu:ulv_input_bus',
    out: 'gtceu:lv_output_bus',
    fluid: 'gtceu:luv_input_hatch'
  }
  // inV/inA: GTM's combined input voltage and amperage; tier: GTM's machine tier (floor of getMaxVoltage)
  var COPIES = [
    { key: 'luv', z: 2, energy: 'gtceu:luv_energy_input_hatch', forms: true, inV: 32768, inA: 2, tier: 6, gtnnRefuses: true, gtmRefuses: true, npu: false, wetware: true },
    { key: 'luv16a', z: 8, energy: 'gtceu:luv_energy_input_hatch_16a', forms: true, inV: 524288, inA: 1, tier: 6, gtnnRefuses: false, gtmRefuses: true, npu: false, wetware: true },
    { key: 'zpm', z: 14, energy: 'gtceu:zpm_energy_input_hatch', forms: true, inV: 131072, inA: 2, tier: 7, gtnnRefuses: true, gtmRefuses: false, npu: false, wetware: true },
    { key: 'zpm4a', z: 20, energy: 'gtceu:zpm_energy_input_hatch_4a', forms: true, inV: 524288, inA: 1, tier: 7, gtnnRefuses: false, gtmRefuses: false, npu: true, wetware: null },
    { key: 'two_luv', z: 26, energy: 'gtceu:luv_energy_input_hatch', second: 'gtceu:luv_energy_input_hatch', forms: false }
  ]

  // our Universal Assembly Factory (startup_scripts/grindless/mv/leisure_factories.js), controller facing north at (x, Y+1, z), its hall
  // behind it (z .. z+2); parts on the back wall's bottom row. expectRefuse: the design's invariant (the NPU at LuV only from the lab)
  var UAF = {
    enabled: true, expectRefuse: true, machine: 'gtceu:universal_assembly_factory', x: 15670, z: 4,
    roles: { '0,0,0': 'energy', '0,0,1': 'energy2', '0,0,2': 'inBus', '0,0,3': 'outBus', '0,0,4': 'fluid' },
    blocks: { energy: 'gtceu:luv_energy_input_hatch', energy2: 'gtceu:luv_energy_input_hatch', inBus: 'gtceu:luv_input_bus', outBus: 'gtceu:lv_output_bus', fluid: 'gtceu:luv_input_hatch' }
  }

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
        GTRecipe: Java.loadClass('com.gregtechceu.gtceu.api.recipe.GTRecipe'),
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        GTUtil: Java.loadClass('com.gregtechceu.gtceu.utils.GTUtil'),
        ECL: Java.loadClass('com.gregtechceu.gtceu.api.misc.EnergyContainerList'),
        DummyCleanroom: Java.loadClass('com.gregtechceu.gtceu.api.machine.multiblock.DummyCleanroom'),
        ResearchManager: Java.loadClass('com.gregtechceu.gtceu.utils.ResearchManager'),
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
        ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
        ItemEntity: Java.loadClass('net.minecraft.world.entity.item.ItemEntity'),
        AABB: Java.loadClass('net.minecraft.world.phys.AABB'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries')
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

  function short(id) {
    return String(id).replace(/^(gtceu|grindless|minecraft|gtnn):/, '')
  }

  function cmd(c) {
    return S.server.runCommandSilent(c)
  }

  function machineAt(p) {
    return lazy().MetaMachine.getMachine(S.level, new BlockPos(p.x, p.y, p.z))
  }

  function blockIdAt(x, y, z) {
    return String(S.level.getBlock(x, y, z).getId())
  }

  function itemName(stack) {
    try {
      return String(lazy().Registries.ITEMS.getKey(stack.getItem()))
    } catch (e) {
      return 'unknown(' + e + ')'
    }
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

  function euTier(recipe) {
    return Number(lazy().RecipeHelper.getRecipeEUtTier(recipe))
  }

  function conditionNames(recipe) {
    return asArray(recipe.conditions).map(function (c) { return String(c.getClass().getSimpleName()) })
  }

  function researchIdOf(recipe) {
    var conds = asArray(recipe.conditions)
    for (var i = 0; i < conds.length; i++) {
      if (String(conds[i].getClass().getSimpleName()) !== 'ResearchCondition') continue
      var it = conds[i].data.iterator()
      while (it.hasNext()) {
        var e = it.next()
        try {
          return String(e.getResearchId())
        } catch (ex) {
          return String(e.researchId)
        }
      }
    }
    return null
  }

  function stickFor(researchId, type) {
    return Item.of('gtceu:data_stick', '{assembly_line_research:{research_id:"' + researchId + '",research_type:"' + type + '"}}')
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

  function insert(bus, id, n) {
    var inv = bus.getInventory()
    var left = n
    for (var s = 0; s < inv.getSlots() && left > 0; s++) {
      var rest = inv.insertItem(s, Item.of(id, left), false)
      left = rest.isEmpty() ? 0 : Number(rest.getCount())
    }
    if (left > 0) throw new Error('could only insert ' + (n - left) + ' of ' + n + ' ' + id)
  }

  function setTank(hatch, id, amount) {
    if (amount <= 0) hatch.tank.setFluidInTank(0, lazy().FluidStack.EMPTY)
    else hatch.tank.setFluidInTank(0, Fluid.of(id, amount).getFluidStack())
  }

  function tankAmount(hatch) {
    var st = hatch.tank.getFluidInTank(0)
    return st.isEmpty() ? 0 : Number(st.getAmount())
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
      ctrl.getRecipeLogic().markLastRecipeDirty()
    } catch (e) { /* older names: the subscription below still wakes it */ }
    try {
      ctrl.getRecipeLogic().updateTickSubscription()
    } catch (e2) { /* the scenario reports what did not run */ }
  }

  function state(ctrl) {
    try {
      var rlg = ctrl.getRecipeLogic()
      var last = rlg.getLastRecipe()
      return 'mode=' + short(ctrl.getRecipeType().registryName) + ' status=' + rlg.getStatus() + ' progress=' + rlg.getProgress() + '/' +
        rlg.getDuration() + ' last=' + (last ? last.id + ' at ' + inputEUt(last) + ' EU/t x ' + last.duration + ' t' : 'none')
    } catch (e) {
      return 'state unreadable: ' + e
    }
  }

  // GTM's view of the hatches (EnergyContainerList) and GT--'s tier (the tier of the combined input voltage)
  function energyFacts(ctrl) {
    var c = lazy()
    var ecl = ctrl.getEnergyContainer()
    return {
      inV: Number(ecl.getInputVoltage()),
      inA: Number(ecl.getInputAmperage()),
      highest: Number(ecl.getHighestInputVoltage()),
      count: Number(ecl.getNumHighestInputContainers()),
      maxV: Number(ctrl.getMaxVoltage()),
      tier: Number(ctrl.getMaxOverclockTier()),
      ocV: Number(ctrl.getOverclockVoltage()),
      gtnnTier: Number(c.GTUtil.getTierByVoltage(ecl.getInputVoltage()))
    }
  }

  function factsText(f) {
    return 'combined ' + f.inV + ' V x ' + f.inA + ' A (GT-- tier ' + f.gtnnTier + '), highest hatch ' + f.highest + ' V x' + f.count +
      ', getMaxVoltage ' + f.maxV + ' (machine tier ' + f.tier + '), overclock voltage ' + f.ocV
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    safely('ids', function () {
      var ids = [LINE, B.casing, B.glass, B.unit, B.grating, B.bus, B.out, B.fluid, NPU, WETWARE, 'gtceu:data_stick']
      COPIES.forEach(function (c) { ids.push(c.energy) })
      if (UAF.enabled) Object.keys(UAF.blocks).forEach(function (k) { ids.push(UAF.blocks[k]) })
      var missing = ids.filter(function (id) { return !Item.exists(id) })
      check('ids', missing.length === 0, ids.length + ' ids' + (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''))
    })

    safely('registration', function () {
      var def = GTRegistries.MACHINES.get(rl(LINE))
      if (def === null || def === undefined) throw new Error(LINE + ' is not registered')
      var types = []
      var arr = def.getRecipeTypes()
      for (var i = 0; i < arr.length; i++) types.push(String(arr[i].registryName))
      check('registration', types.join(',') === 'gtceu:circuit_assembly_line,gtceu:circuit_assembler', LINE + ': types=[' + types.join(',') +
        '] alwaysTryModifyRecipe=' + def.isAlwaysTryModifyRecipe())
    })

    safely('npu_recipe', function () {
      var r = liveRecipe(NPU_RECIPE)
      if (r === null) throw new Error(NPU_RECIPE + ' is not in the recipe manager')
      var outs = asArray(lazy().RecipeHelper.getOutputItems(r)).map(function (st) { return st.getCount() + ' ' + itemName(st) })
      var conds = conditionNames(r)
      S.npu = r
      S.npuTier = euTier(r)
      check('npu_recipe', inputEUt(r) === 80000 && Number(r.duration) === 600 && S.npuTier === 7 && conds.indexOf('CleanroomCondition') >= 0 &&
        outs.join(',') === '1 ' + NPU, String(r.recipeType.registryName) + ' ' + inputEUt(r) + ' EU/t x ' + r.duration + ' t, EU tier ' + S.npuTier +
        ', conditions [' + conds.join(',') + '] -> ' + outs.join(', '))
    })

    safely('wetware_recipe', function () {
      var r = liveRecipe(WET_RECIPE)
      if (r === null) throw new Error(WET_RECIPE + ' is not in the recipe manager')
      var c = lazy()
      var ins = asArray(c.RecipeHelper.getInputItems(r)).map(function (st) { return st.getCount() + ' ' + short(itemName(st)) })
      var fl = asArray(c.RecipeHelper.getInputFluids(r)).map(function (st) { return st.getAmount() + ' mB ' + short(fluidName(st)) })
      var outs = asArray(c.RecipeHelper.getOutputItems(r)).map(function (st) { return st.getCount() + ' ' + itemName(st) })
      S.wet = r
      S.researchId = researchIdOf(r) || RESEARCH_FALLBACK
      var gone = liveRecipe(GTNN_WET_RECIPE) === null
      check('wetware_recipe', String(r.recipeType.registryName) === 'gtceu:circuit_assembly_line' && inputEUt(r) === 30720 && Number(r.duration) === 750 &&
        euTier(r) === 6 && ins.length === 6 && outs.join(',') === '32 ' + WETWARE && S.researchId === RESEARCH_FALLBACK && gone,
        inputEUt(r) + ' EU/t x ' + r.duration + ' t, EU tier ' + euTier(r) + ', research ' + S.researchId + ', in [' + ins.concat(fl).join(', ') +
        '] -> ' + outs.join(', ') + '; GT--\'s original ' + (gone ? 'removed' : 'STILL LIVE'))
    })

    // C3 found GT--'s line unbuildable: its assembly-line recipe takes molten cerrobase 140, which nothing made
    safely('molten_cerrobase', function () {
      var c = lazy()
      var r = liveRecipe(MELT_RECIPE)
      if (r === null) throw new Error(MELT_RECIPE + ' is not in the recipe manager')
      var fin = asArray(c.RecipeHelper.getInputFluids(r)).map(function (st) { return st.getAmount() + ' ' + fluidName(st) })
      var fout = asArray(c.RecipeHelper.getOutputFluids(r)).map(function (st) { return st.getAmount() + ' ' + fluidName(st) })
      var line = liveRecipe(LINE_RECIPE)
      var lineFluids = line === null ? [] : asArray(c.RecipeHelper.getInputFluids(line)).map(function (st) { return st.getAmount() + ' ' + fluidName(st) })
      check('molten_cerrobase', String(r.recipeType.registryName) === 'gtceu:fluid_heater' && inputEUt(r) === 120 && Number(r.duration) === 181 &&
        fin.join(',') === '144 gtceu:cerrobase_140' && fout.join(',') === '144 gtceu:molten_cerrobase_140' && lineFluids.indexOf('1440 gtceu:molten_cerrobase_140') >= 0,
        inputEUt(r) + ' EU/t x ' + r.duration + ' t: [' + fin.join(', ') + '] -> [' + fout.join(', ') + ']; ' + LINE_RECIPE + ' takes [' + lineFluids.join(', ') + ']')
    })

    safely('research_entry', function () {
      if (!S.wet) throw new Error('no wetware recipe')
      var c = lazy()
      S.stick = stickFor(S.researchId, 'gtceu:circuit_assembly_line')
      var item = c.ResearchManager.readResearchId(S.stick)
      var entry = S.wet.recipeType.getDataStickEntry(S.researchId)
      var listed = entry !== null && entry.contains(S.wet)
      check('research_entry', item !== null && listed, 'stick ' + S.stick.getNbt() + ' reads as ' + (item === null ? 'nothing' : item.researchId() +
        ' for ' + item.recipeType()) + '; data-stick entry lists the wetware recipe: ' + listed)
    })

    safely('rule_table', function () {
      var c = lazy()
      // [name, hatch voltage, amps per hatch, hatches, GT-- tier, GTM machine tier]
      var rows = [['LuV 2A', LUV_V, 2, 1, 6, 6], ['LuV 4A', LUV_V, 4, 1, 7, 6], ['LuV 16A', LUV_V, 16, 1, 8, 6], ['ZPM 2A', ZPM_V, 2, 1, 7, 7],
        ['ZPM 4A', ZPM_V, 4, 1, 8, 7], ['two LuV 2A', LUV_V, 2, 2, 7, 7]]
      var bad = []
      var text = rows.map(function (row) {
        var st = c.ECL.calculateVoltageAmperage(row[1] * row[2] * row[3], row[2] * row[3])
        var gtnn = Number(c.GTUtil.getTierByVoltage(st.voltage()))
        var maxV = row[3] > 1 ? row[1] * 4 : row[1]
        var gtm = Number(c.GTUtil.getFloorTierByVoltage(maxV))
        if (gtnn !== row[4] || gtm !== row[5]) bad.push(row[0])
        var npu = S.npuTier >= gtnn ? 'GT-- refuses' : (S.npuTier > gtm ? 'GTM refuses' : 'NPU runs')
        return row[0] + ': ' + Number(st.voltage()) + ' V x ' + Number(st.amperage()) + ' A, GT-- tier ' + gtnn + ', GTM tier ' + gtm + ', ' + npu
      })
      check('rule_table', bad.length === 0, text.join('; ') + (bad.length > 0 ? ' | differs from S0-4.md: ' + bad.join(', ') : ''))
    })

    safely('npu_sources', function () {
      var c = lazy()
      var access = null
      try {
        access = S.server.registryAccess()
      } catch (e) { /* non-GT recipes then read with a null registry access */ }
      var all = asArray(S.server.getRecipeManager().getRecipes())
      var makers = []
      var bad = []
      var unreadable = 0
      all.forEach(function (r) {
        var outs = []
        var type = ''
        var eut = 0
        try {
          if (r instanceof c.GTRecipe) {
            type = String(r.recipeType.registryName)
            eut = inputEUt(r)
            outs = asArray(c.RecipeHelper.getOutputItems(r))
          } else {
            type = String(r.getType())
            outs = [r.getResultItem(access)]
          }
        } catch (e) {
          unreadable++
          return
        }
        var makes = outs.some(function (st) { return st !== null && !st.isEmpty() && itemName(st) === NPU })
        if (!makes) return
        makers.push(String(r.getId()) + ' (' + type + ', ' + eut + ' EU/t)')
        if (eut <= LUV_V && type !== LAB_TYPE) bad.push(String(r.getId()))
      })
      var labType = GTRegistries.RECIPE_TYPES.get(rl(LAB_TYPE))
      var labMakers = makers.filter(function (m) { return m.indexOf(LAB_TYPE) >= 0 }).length
      check('npu_sources', bad.length === 0, all.length + ' recipes, ' + makers.length + ' make the NPU, none at <= ' + LUV_V + ' EU/t outside ' + LAB_TYPE +
        (bad.length > 0 ? ' | offenders: ' + bad.join(', ') : ''))
      note('npu_makers', makers.join('; ') + ' | ' + LAB_TYPE + (labType ? ' registered, ' + labMakers + ' recipes' : ' not registered yet') +
        (unreadable > 0 ? ' | ' + unreadable + ' recipes unreadable' : ''))
    })
  }

  // ---------------------------------------------------------------- world

  function fillBand(y0, y1, block) {
    var n = 0
    for (var z = BAND.z0; z <= BAND.z1; z += 16) {
      n += Number(cmd('fill ' + BAND.x0 + ' ' + y0 + ' ' + z + ' ' + BAND.x1 + ' ' + y1 + ' ' + Math.min(z + 15, BAND.z1) + ' ' + block))
    }
    return n
  }

  function prepareWorld() {
    S.areaTouched = true
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = BAND.z0 >> 4; cz <= BAND.z1 >> 4; cz++) S.level.getChunk(cx, cz)
    }
    var loaded = cmd('forceload add ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    var cleared = fillBand(BAND.y0, BAND.y1, 'air')
    // a roof over the band: a hatch that is rained on may explode (GTM's weather check)
    fillBand(ROOF_Y, ROOF_Y, 'minecraft:smooth_stone')
    note('AREA', 'band X ' + BAND.x0 + '-' + BAND.x1 + ' Y ' + BAND.y0 + '-' + BAND.y1 + ' Z ' + BAND.z0 + '-' + BAND.z1 + ': forceload add ' + loaded +
      ', cleared ' + cleared + ', roof at Y ' + ROOF_Y)
  }

  function dropItems() {
    var c = lazy()
    var list = S.level.getEntitiesOfClass(c.ItemEntity, new c.AABB(BAND.x0, BAND.y0, BAND.z0, BAND.x1 + 1, BAND.y1 + 1, BAND.z1 + 1))
    for (var i = 0; i < list.size(); i++) list.get(i).discard()
    return list.size()
  }

  function cleanup() {
    S.copies.forEach(function (m) {
      try {
        if (m.ctrl) m.ctrl.setWorkingEnabled(false)
      } catch (e) { /* the fill below removes it anyway */ }
    })
    if (!S.areaTouched) return
    var cleared = fillBand(BAND.y0, BAND.y1, 'air')
    var items = dropItems()
    var released = cmd('forceload remove ' + BAND.x0 + ' ' + BAND.z0 + ' ' + BAND.x1 + ' ' + BAND.z1)
    note('CLEANUP', 'cleared ' + cleared + ' blocks, ' + items + ' item entities removed, forceload remove ' + released)
  }

  function setBlock(c) {
    return Number(cmd('setblock ' + c.x + ' ' + c.y + ' ' + c.z + ' ' + c.id + (c.props || '') + ' replace'))
  }

  // one GT-- line: slice a at X0 + a, rows Y..Y+2, chars z..z+2 (see the header)
  function lineCells(copy) {
    var cells = []
    for (var a = 0; a < SLICES; a++) {
      var x = X0 + a
      var first = a === 0
      var last = a === SLICES - 1
      cells.push({ x: x, y: Y, z: copy.z, id: first ? B.fluid : B.casing, props: first ? '[facing=down]' : '', role: first ? 'fluid' : null })
      cells.push({ x: x, y: Y, z: copy.z + 1, id: last ? B.out : B.bus, props: '[facing=down]', role: last ? 'out' : 'bus' })
      cells.push({ x: x, y: Y, z: copy.z + 2, id: B.casing, props: '', role: null })
      cells.push({ x: x, y: Y + 1, z: copy.z, id: B.glass, props: '', role: null })
      cells.push({ x: x, y: Y + 1, z: copy.z + 1, id: B.unit, props: '', role: null })
      cells.push({ x: x, y: Y + 1, z: copy.z + 2, id: B.glass, props: '', role: null })
      if (first) {
        cells.push({ x: x, y: Y + 2, z: copy.z, id: LINE, props: '[facing=north]', role: 'controller' })
        cells.push({ x: x, y: Y + 2, z: copy.z + 1, id: copy.energy, props: '[facing=up]', role: 'energy' })
      } else {
        cells.push({ x: x, y: Y + 2, z: copy.z, id: B.grating, props: '', role: null })
        var second = copy.second && a === 1
        cells.push({ x: x, y: Y + 2, z: copy.z + 1, id: second ? copy.second : B.grating, props: second ? '[facing=up]' : '', role: second ? 'energy2' : null })
      }
      cells.push({ x: x, y: Y + 2, z: copy.z + 2, id: B.grating, props: '', role: null })
    }
    return cells
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

  // our factory from the description lib/patterns.js records: slices back -> front, rows bottom -> top; controller facing north
  function uafCells() {
    var desc = global.grindless.patterns.describe(UAF.machine)
    if (!desc) throw new Error('no structure description recorded for ' + UAF.machine)
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var sym = desc.symbols[row.charAt(ci)]
          if (sym && sym.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    if (ctrl === null) throw new Error('the description has no controller cell')
    var cells = []
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          var sym = desc.symbols[ch]
          if (ch === ' ' || !sym || sym.kind === 'air' || sym.kind === 'any') continue
          var c = { x: UAF.x - (ci - ctrl.ci), y: Y + 1 + (ri - ctrl.ri), z: UAF.z - (si - ctrl.si), id: null, props: '', role: null }
          var role = UAF.roles[si + ',' + ri + ',' + ci]
          if (sym.kind === 'controller') {
            c.id = UAF.machine
            c.props = '[facing=north]'
            c.role = 'controller'
          } else if (role !== undefined) {
            c.id = UAF.blocks[role]
            c.props = '[facing=south]'
            c.role = role
          } else {
            c.id = plainBlock(sym)
          }
          cells.push(c)
        }
      })
    })
    return cells
  }

  function place(m) {
    var failed = []
    var wrong = []
    var ctrlCell = null
    m.roles = {}
    m.cells.forEach(function (c) {
      if (c.role === 'controller') {
        ctrlCell = c
        return
      }
      if (c.role !== null) m.roles[c.x + ',' + c.y + ',' + c.z] = c.role
      if (setBlock(c) < 1) failed.push(c.x + ',' + c.y + ',' + c.z + ' ' + c.id)
    })
    if (setBlock(ctrlCell) < 1) failed.push('controller')
    m.ctrlPos = { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }
    m.cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.id) wrong.push(c.x + ',' + c.y + ',' + c.z + ' wanted ' + c.id + ' got ' + got)
    })
    check(m.key + '_PLACED', failed.length === 0 && wrong.length === 0, m.cells.length + ' blocks, controller ' + m.ctrlPos.x + ',' + m.ctrlPos.y + ',' +
      m.ctrlPos.z + (failed.length > 0 ? ' | setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' | wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

  // the parts by role; input buses in the controller's part order (GT--'s sorter), which is the order its ordered-input check reads
  function findParts(m) {
    var P = { ids: [], buses: [] }
    asArray(m.ctrl.getParts()).forEach(function (p) {
      var pos = p.self().getPos()
      var role = m.roles[pos.getX() + ',' + pos.getY() + ',' + pos.getZ()]
      P.ids.push(short(p.getDefinition().getId()) + (role ? '=' + role : ''))
      if (role === 'bus') P.buses.push(p)
      else if (role) P[role] = p
    })
    if (P.inBus) P.buses.push(P.inBus)
    return P
  }

  function describeError(ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var pos = err.getPos()
      return 'pattern error ' + String(err) + ' at ' + pos.getX() + ',' + pos.getY() + ',' + pos.getZ() + ' (' + blockIdAt(pos.getX(), pos.getY(), pos.getZ()) + ')'
    } catch (e) {
      return 'could not read the pattern error: ' + e
    }
  }

  // ---------------------------------------------------------------- scenarios

  function topUp(m) {
    ;['energy', 'energy2'].forEach(function (role) {
      var p = m.P && m.P[role]
      if (!p) return
      var c = p.energyContainer
      c.setEnergyStored(c.getEnergyCapacity())
    })
  }

  function clearInputs(m) {
    m.P.buses.forEach(emptyBus)
    if (m.P.fluid) setTank(m.P.fluid, null, 0)
  }

  // recipe input i into bus i (one bus for the factory), its fluid into the one hatch; returns what went in
  function load(m, recipe) {
    var c = lazy()
    clearInputs(m)
    var loaded = {}
    var items = asArray(c.RecipeHelper.getInputItems(recipe))
    var single = m.P.buses.length === 1
    if (!single && items.length > m.P.buses.length) throw new Error(items.length + ' item inputs for ' + m.P.buses.length + ' buses')
    items.forEach(function (st, i) {
      var id = itemName(st)
      insert(single ? m.P.buses[0] : m.P.buses[i], id, Number(st.getCount()))
      loaded[id] = (loaded[id] || 0) + Number(st.getCount())
    })
    asArray(c.RecipeHelper.getInputFluids(recipe)).forEach(function (f) {
      setTank(m.P.fluid, fluidName(f), Number(f.getAmount()))
      loaded['fluid:' + fluidName(f)] = Number(f.getAmount())
    })
    return loaded
  }

  function untouched(m, loaded) {
    var now = {}
    m.P.buses.forEach(function (bus) {
      var counts = readBus(bus)
      Object.keys(counts).forEach(function (id) { now[id] = (now[id] || 0) + counts[id] })
    })
    var ok = true
    Object.keys(loaded).forEach(function (k) {
      if (k.indexOf('fluid:') === 0) {
        if (tankAmount(m.P.fluid) !== loaded[k]) ok = false
      } else if (now[k] !== loaded[k]) ok = false
    })
    return ok
  }

  function begin(m, phase) {
    m.phase = phase
    m.t0 = S.t
    m.seen = {}
    wake(m.ctrl)
  }

  function modifierCheck(m, name, recipe, wantRefused, gtnnWant, gtmWant) {
    var f = energyFacts(m.ctrl)
    var mod = m.ctrl.fullModifyRecipe(recipe.copy())
    var refused = mod === null
    var gtnn = euTier(recipe) >= f.gtnnTier
    var gtm = euTier(recipe) > f.tier
    var ok = refused === wantRefused
    if (gtnnWant !== null && gtnn !== gtnnWant) ok = false
    if (gtmWant !== null && gtm !== gtmWant) ok = false
    if (m.copy && m.copy.inV !== undefined && (f.inV !== m.copy.inV || f.inA !== m.copy.inA || f.tier !== m.copy.tier)) ok = false
    check(m.key + '_' + name + '_modifier', ok, (refused ? 'refused' : 'accepted as ' + inputEUt(mod) + ' EU/t x ' + mod.duration + ' t') + '; recipe tier ' +
      euTier(recipe) + '; ' + factsText(f) + '; GT-- rule refuses=' + gtnn + ', GTM tier rule refuses=' + gtm)
  }

  function startNpu(m) {
    m.ctrl.setCleanroom(lazy().DummyCleanroom.createForAllTypes())
    m.ctrl.setActiveRecipeType(1)
    var isLine = m.key !== 'uaf'
    modifierCheck(m, 'npu', S.npu, isLine ? !m.copy.npu : UAF.expectRefuse, isLine ? m.copy.gtnnRefuses : null, isLine ? m.copy.gtmRefuses : null)
    m.loaded = load(m, S.npu)
    m.wantStart = isLine ? m.copy.npu : !UAF.expectRefuse
    begin(m, 'npu')
  }

  function startWetware(m) {
    m.ctrl.setActiveRecipeType(0)
    m.ctrl.getTemplateInventory().setStackInSlot(0, S.stick.copy())
    modifierCheck(m, 'wetware', S.wet, !m.copy.wetware, null, null)
    m.loaded = load(m, S.wet)
    m.wantStart = m.copy.wetware
    begin(m, 'wetware')
  }

  function stop(m) {
    m.ctrl.setWorkingEnabled(false)
  }

  // a run either starts (WORKING with that recipe) or, after HOLD ticks, has not touched its inputs
  function runStep(m, age, recipeId, name, next) {
    if (m.wantStart) {
      if (m.seen[recipeId]) {
        check(m.key + '_' + name + '_run', true, 'started | ' + state(m.ctrl))
        stop(m)
        next()
      } else if (age >= START_WAIT) {
        check(m.key + '_' + name + '_run', false, 'did not start in ' + age + ' ticks | ' + state(m.ctrl) + ' reasons=[' + failureReasons(m.ctrl).join(' ; ') + ']')
        stop(m)
        next()
      }
      return
    }
    if (age < HOLD) return
    var ok = !m.seen[recipeId] && untouched(m, m.loaded)
    check(m.key + '_' + name + '_run', ok, 'held ' + age + ' ticks: ran=' + Object.keys(m.seen).join(',') + ' inputs untouched=' + untouched(m, m.loaded) +
      ' | ' + state(m.ctrl) + ' reasons=[' + failureReasons(m.ctrl).join(' ; ') + ']')
    next()
  }

  function step(m) {
    var age = S.t - m.t0
    if (m.phase === 'npu') {
      runStep(m, age, NPU_RECIPE, 'npu', function () {
        if (m.copy && m.copy.wetware !== null && m.copy.wetware !== undefined) {
          m.ctrl.setWorkingEnabled(true)
          startWetware(m)
        } else m.phase = 'done'
      })
    } else if (m.phase === 'wetware') {
      runStep(m, age, WET_RECIPE, 'wetware', function () { m.phase = 'done' })
    }
  }

  function formed(m) {
    m.P = findParts(m)
    var need = m.key === 'uaf' ? ['energy', 'energy2', 'outBus', 'fluid'] : ['energy', 'out', 'fluid']
    var missing = need.filter(function (r) { return !m.P[r] })
    var buses = m.key === 'uaf' ? 1 : SLICES - 1
    if (m.P.buses.length !== buses) missing.push(m.P.buses.length + ' input buses')
    check(m.key + '_PARTS', missing.length === 0, '[' + m.P.ids.join(' ') + ']' + (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''))
    if (missing.length > 0) {
      m.phase = 'done'
      return
    }
    topUp(m)
    startNpu(m)
  }

  function formStep(m) {
    var waited = S.t - S.t0
    var ctrl = machineAt(m.ctrlPos)
    if (ctrl === null || ctrl === undefined) {
      check(m.key + '_FORMED', false, 'no machine at the controller position')
      m.phase = 'done'
      return
    }
    m.ctrl = ctrl
    if (m.copy && m.copy.forms === false) {
      var othersDone = S.copies.every(function (o) { return o === m || o.phase !== 'forming' })
      if (ctrl.isFormed()) {
        check('two_luv_refused', false, 'a line with two LuV energy hatches FORMED: ' + factsText(energyFacts(ctrl)))
        m.phase = 'done'
      } else if (othersDone || waited >= FORM_TIMEOUT) {
        var sync = ctrl.checkPatternWithLock()
        check('two_luv_refused', !sync, 'not formed after ' + waited + ' ticks, synchronous check ' + sync + ': ' + describeError(ctrl))
        m.phase = 'done'
      }
      return
    }
    if (ctrl.isFormed()) {
      check(m.key + '_FORMED', true, (m.forced ? 'after a forced check' : 'after ' + waited + ' ticks') + ', parts=' + asArray(ctrl.getParts()).length)
      m.phase = 'formed'
      formed(m)
      return
    }
    if (waited >= FORM_TIMEOUT && !m.forced) {
      if (!ctrl.checkPatternWithLock()) {
        check(m.key + '_FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(ctrl))
        m.phase = 'done'
        return
      }
      note(m.key + '_FORMED', 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
      ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
      ctrl.onStructureFormed()
      m.forced = true
    } else if (waited >= 2 * FORM_TIMEOUT) {
      check(m.key + '_FORMED', false, 'still not formed after a forced check')
      m.phase = 'done'
    }
  }

  function measure(m) {
    if (!m.ctrl || !m.P || m.phase === 'forming' || m.phase === 'done') return
    topUp(m)
    var rlg = m.ctrl.getRecipeLogic()
    var last = rlg.getLastRecipe()
    if (String(rlg.getStatus()) === 'WORKING' && last !== null && last !== undefined) m.seen[String(last.id)] = true
  }

  // ---------------------------------------------------------------- run

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    try {
      cleanup()
    } catch (e) {
      check('cleanup', false, 'exception: ' + e)
    }
    console.info(TAG + SCOPE + '|DONE')
  }

  function onTick(server) {
    if (S === null || S.finished) return
    S.t = server.getTickCount() - S.tick0
    S.copies.forEach(function (m) {
      try {
        measure(m)
        if (m.phase === 'forming') {
          if (S.t % STEP === 0) formStep(m)
        } else if (m.phase !== 'done') step(m)
      } catch (e) {
        check(m.key + '_STEP', false, 'exception in ' + m.phase + ': ' + e)
        m.phase = 'done'
      }
    })
    if (S.copies.every(function (m) { return m.phase === 'done' })) finish()
  }

  function run(server) {
    S = { server: server, level: server.overworld(), t: 0, tick0: server.getTickCount(), copies: [], finished: false, areaTouched: false }
    staticChecks()
    if (!S.npu || !S.wet || !S.stick) {
      note('copies', 'skipped: a live recipe or the research stick is missing')
      finish()
      return
    }
    prepareWorld()
    COPIES.forEach(function (copy) {
      S.copies.push({ key: copy.key, copy: copy, cells: lineCells(copy), phase: 'forming', seen: {} })
    })
    if (UAF.enabled) {
      try {
        S.copies.push({ key: 'uaf', copy: null, cells: uafCells(), phase: 'forming', seen: {} })
      } catch (e) {
        check('uaf_PLACED', false, 'exception: ' + e)
      }
    }
    S.copies.forEach(function (m) {
      try {
        if (!place(m)) m.phase = 'done'
      } catch (e) {
        check(m.key + '_PLACED', false, 'exception: ' + e)
        m.phase = 'done'
      }
    })
    S.t0 = S.t
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

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick(event.server)
  })

  ServerEvents.customCommand('gg_test_luv_circuit_line', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_luv_circuit_line run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
