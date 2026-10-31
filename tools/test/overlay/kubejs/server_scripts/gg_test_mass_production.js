// priority: -5454
// Gregtech Grindless - smoke test of package IV-B6, mass-production (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack): IV's mass-production kit, startup_scripts/grindless/lib/parallel_hatch.js (GTM's parallel hatch in our IV
// plants) and server_scripts/grindless/iv/mass_production.js (recipes), and GTM's assembly line fed from an ME system.
//
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite server `
//     -Commands 'kubejs custom_command gg_test_mass_production;;kubejs custom_command gg_test_recipe_lookup;;kubejs custom_command gg_dump' `
//     -WaitForLog 'GGTEST\|mass_production\|DONE@@900;;GGTEST\|lookup\|DONE@@900;;GGTEST\|dump\|DONE@@900'
//
// Markers: GGTEST|mass_production|<check>|PASS|FAIL|NOTE|<detail>
//   helper                 global.grindless.parallelHatch is published (part, modifier) and GTM registers gtceu:iv_parallel_hatch
//   plants_take_the_hatch  the hot cell, the fuel fabrication plant and the heavy-water plant: their part-cell symbol has the parallel
//                          hatch option (at most one) and nothing else changed: same size, same number of part cells and of cells
//   parallel_hatch_recipe  grindless:assembler/iv_parallel_hatch: IV sensor, emitter, hull, double platinum cables and 4 IV circuits; GTM's
//                          LuV-circuit recipe is gone and nothing else (crafting, assembler, assembly line) makes the hatch
//   gcym_iv                every GCYM controller's recipes take a circuit of IV or higher and none below; the large packer and the alloy
//                          blast smelter are ours (IV circuits and the IV machine) and GTM's EV ones are gone
//   addon_megas_iv         GTCA's mega chemical reactor and mega oil cracking unit and GT--'s Maceration Stack: every recipe that makes
//                          them takes an IV circuit or an IV part
//   quantum_storage_iv     Quantum Chest V and Quantum Tank V: every recipe that makes them (GTM's NBT-clearing ones aside) takes IV
//                          circuits and an HV field generator
//   assembly_line_chain    the line's controller, control casing (IV sensor and emitter), line casing (ruridit gear) and data access
//                          hatch have recipes; the LuV motor's research runs in a 1,920 EU/t scanner and writes the stick the line uses;
//                          the motor's recipe takes the six items and two fluids this test feeds, in that order
//   hw_PLACED / hw_FORMED / hw_PARTS   a heavy-water plant with an IV energy hatch and an IV parallel hatch in its back face
//   par_refuses_low_charge     64 ice + 102,400 mB steam with 999 mB of H2S: the parallel path does not start either
//   PROCESS_parallel_exchange  with 1,000 mB of H2S: one run of 4 copies at 4x the EU/t and the base duration (one IV hatch), 4x the
//                              outputs, the ice and the steam used up, exactly 4 batches' EU drawn
//   charge_after_parallel      the H2S hatch still holds exactly 1,000 mB after the parallel run (IV-A5's open point)
//   PROCESS_partial_parallel   40 ice + 64,000 mB steam: 2 copies (the inputs decide), 8 ice and 12,800 mB steam left, the charge kept
//   parallel_energy            NOTE: EU per batch with the hatch (the recipe's own) against one overclock (twice that, IV-A5's run)
//   al_PLACED / al_FORMED / al_PARTS   a 7-slice assembly line: 6 ULV input buses, 2 fluid input hatches, an IV energy hatch, a data
//                              access hatch with the stick the EV scanner writes for the LuV motor, GTM's ME output bus
//   ae2_network                AE2 controller, creative energy cell, drive (an item and a fluid cell), a dense trunk under the line and an
//                              export bus under every input bus and fluid hatch (each set to its ingredient, 4 speed cards): one powered
//                              grid, every bus and the ME output bus online
//   al_fed                     the LuV motor's ingredients put into ME storage reach the line in recipe order and it starts the motor
//   PROCESS_assembly_line      gtceu:assembly_line/electric_motor_luv runs once (6,000 EU/t x 600 t on an IV hatch), draws exactly its
//                              EU, and the motor ends up in ME storage; no ingredient is left anywhere
//   mass_production|DONE       last line
//
// TEST AREA: this test builds, force-loads and clears ONLY its own band of the overworld, X 12544-12607, Y 98-112, Z 0-15 (AGENTS.md:
// tests run at the same time in one server), under a roof at Y 112 (a hatch that is rained on may explode). The heavy-water plant
// (controller 12596,98,2 facing north) stands at X 12594-12602, Z 2-4, Y 98-111; the assembly line (controller 12548,102,2 facing north;
// its slices go east, its depth south) at X 12548-12554, Z 2-4, Y 100-103; its AE2 network under and beside it, X 12546-12554, Z 2-3,
// Y 98-99. Ingredients, fluids, energy and the data stick are injected.
// var + function everywhere (this Rhino throws "redeclaration of var" for const/let inside functions that run more than once).
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'mass_production'
  var BAND = { x0: 12544, x1: 12607, y0: 98, y1: 112, z0: 0, z1: 15 }
  var ROOF_Y = 112
  var STEP = 10
  var FORM_TIMEOUT = 600
  var HOLD_TICKS = 60
  var SLACK = 400
  var NET_TIMEOUT = 400
  var FEED_TIMEOUT = 600
  var STORE_TIMEOUT = 200

  // the command only leaves a request in `global` (it survives script reloads); the tick handler starts the test once these scripts have
  // been loaded for QUIET_MS (same as the other tests)
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestMassProductionRequest'

  var HATCH = 'gtceu:iv_parallel_hatch'
  // the shapes of the plants that take the hatch, before IV-B6 (their startup scripts): size, part cells, cells that are not "any"
  var PLANTS = {
    'gtceu:hot_cell': { w: 7, h: 5, d: 4, cells: 20, total: 116 },
    'gtceu:fuel_fabrication_plant': { w: 3, h: 4, d: 13, cells: 18, total: 156 },
    'gtceu:heavy_water_plant': { w: 9, h: 14, d: 3, cells: 14, total: 228 }
  }

  // ---------------------------------------------------------------- the heavy-water plant (IV-A5's) with a parallel hatch
  var HW_MACHINE = 'gtceu:heavy_water_plant'
  var HW_COPY = { key: 'hw', x: 12596, z: 2, y: 98, energy: 'gtceu:iv_energy_input_hatch' }
  var HW_ROLE_BLOCKS = {
    inBus: 'gtceu:iv_input_bus',
    in1: 'gtceu:iv_input_hatch',
    in2: 'gtceu:iv_input_hatch',
    out1: 'gtceu:iv_output_hatch',
    out2: 'gtceu:iv_output_hatch',
    out3: 'gtceu:iv_output_hatch',
    parallel: HATCH
  }
  // 'slice,row,column' of the description (slice 0 = the back face, 2 = the front face) -> role; the parallel hatch sits in the back face
  // under the hot tower
  var HW_PARTS = { '2,0,0': 'energy', '2,0,1': 'inBus', '2,0,2': 'in1', '2,0,5': 'in2', '2,0,7': 'out1', '0,0,0': 'out2', '0,0,1': 'out3', '0,0,5': 'parallel' }
  var HW_FACING = { 0: 'south', 2: 'north' }
  var OUTS = ['out1', 'out2', 'out3']
  var INS = ['in1', 'in2']
  var ICE = 'gtceu:deuterium_rich_ice_dust'
  var STEAM = 'gtceu:steam'
  var H2S = 'gtceu:hydrogen_sulfide'
  var EXCHANGE = 'martian_ice_exchange'

  // ---------------------------------------------------------------- the assembly line fed from AE2
  var AL = { x: 12548, y: 102, z: 2 }
  var AL_SLICES = 7
  var AL_MACHINE = 'gtceu:assembly_line'
  var AL_RECIPE = 'gtceu:assembly_line/electric_motor_luv'
  var RESEARCH = 'gtceu:scanner/1_x_gtceu_iv_electric_motor'
  var RESEARCH_ID = '1x_gtceu_iv_electric_motor'
  var MOTOR = 'gtceu:luv_electric_motor'
  // the motor's item inputs in recipe order (one ULV input bus each, slice 0 first) and its fluids in order (one 1x hatch each)
  var AL_ITEMS = [['gtceu:long_magnetic_samarium_rod', 1], ['gtceu:long_hsss_rod', 2], ['gtceu:hsss_ring', 2], ['gtceu:hsss_round', 4],
    ['gtceu:fine_ruridit_wire', 64], ['gtceu:niobium_titanium_single_cable', 2]]
  var AL_FLUIDS = [['gtceu:soldering_alloy', 144], ['gtceu:lubricant', 250]]
  var AL_BLOCKS = {
    casing: 'gtceu:solid_machine_casing',
    glass: 'gtceu:laminated_glass',
    unit: 'gtceu:assembly_line_unit',
    control: 'gtceu:assembly_line_casing',
    grating: 'gtceu:assembly_line_grating',
    bus: 'gtceu:ulv_input_bus',
    fluid: 'gtceu:ev_input_hatch',
    energy: 'gtceu:iv_energy_input_hatch',
    data: 'gtceu:data_access_hatch',
    out: 'gtceu:me_output_bus'
  }
  var AE_IDS = {
    controller: 'ae2:controller',
    cell: 'ae2:creative_energy_cell',
    drive: 'ae2:drive',
    itemCell: 'ae2:item_storage_cell_1k',
    fluidCell: 'ae2:fluid_storage_cell_1k',
    trunk: 'ae2:fluix_covered_dense_cable',
    exportBus: 'ae2:export_bus',
    speedCard: 'ae2:speed_card'
  }

  var S = null
  var classes = null
  var aeClasses = null

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
        ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
        Registries: Java.loadClass('net.minecraftforge.registries.ForgeRegistries'),
        Circuit: Java.loadClass('com.gregtechceu.gtceu.common.item.IntCircuitBehaviour'),
        Direction: Java.loadClass('net.minecraft.core.Direction'),
        RecipeType: Java.loadClass('net.minecraft.world.item.crafting.RecipeType')
      }
    }
    return classes
  }

  function ae() {
    if (aeClasses === null) {
      aeClasses = {
        PartHelper: Java.loadClass('appeng.api.parts.PartHelper'),
        AEItemKey: Java.loadClass('appeng.api.stacks.AEItemKey'),
        AEFluidKey: Java.loadClass('appeng.api.stacks.AEFluidKey'),
        GenericStack: Java.loadClass('appeng.api.stacks.GenericStack'),
        Actionable: Java.loadClass('appeng.api.config.Actionable'),
        ActionSource: Java.loadClass('appeng.api.networking.security.IActionSource')
      }
    }
    return aeClasses
  }

  function PH() {
    return global.grindless.parallelHatch || {}
  }

  function HWP() {
    return global.grindless.heavyWaterPlant || {}
  }

  function MP() {
    return global.grindless.massProduction || {}
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
    return String(id).replace(/^(gtceu|grindless|minecraft|ae2):/, '')
  }

  function bp(p) {
    return new BlockPos(p.x, p.y, p.z)
  }

  function at(p) {
    return p.x + ',' + p.y + ',' + p.z
  }

  function machineAt(p) {
    return lazy().MetaMachine.getMachine(S.level, bp(p))
  }

  function blockIdAt(x, y, z) {
    return String(S.level.getBlock(x, y, z).getId())
  }

  function setBlock(x, y, z, id, props) {
    return S.server.runCommandSilent('setblock ' + x + ' ' + y + ' ' + z + ' ' + id + (props || '') + ' replace')
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

  function fluidSummary(t) {
    var keys = Object.keys(t)
    return keys.length === 0 ? 'none' : keys.map(function (k) { return short(k) + ' ' + t[k] + ' mB' }).join(', ')
  }

  // exactly these fluids in exactly these amounts: want = [[id, amount], ...]
  function sameFluids(t, want) {
    if (Object.keys(t).length !== want.length) return false
    return want.every(function (w) { return t[w[0]] === w[1] })
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

  // the first item of each item input of a GT recipe, with its count (a tag shows its first item: SizedIngredient#getItems() is not
  // reachable from Rhino, RecipeHelper's stacks are)
  function gtItemsIn(recipe) {
    return asArray(lazy().RecipeHelper.getInputItems(recipe)).map(function (st) { return { id: itemName(st), count: Number(st.getCount()) } })
  }

  function gtFluidsIn(recipe) {
    return asArray(lazy().RecipeHelper.getInputFluids(recipe)).map(function (st) { return { id: fluidName(st), amount: Number(st.getAmount()) } })
  }

  function gtItemsOut(recipe) {
    return asArray(lazy().RecipeHelper.getOutputItems(recipe))
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
        ' last=' + (last ? last.id + ' x' + last.parallels : 'none')
    } catch (e) {
      return 'state unreadable: ' + e
    }
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

  // the energy hatch is topped up every tick; what it lost since the last tick is what the machine drew
  function meter(m) {
    var c = m.P.energy.energyContainer
    var cap = Number(c.getEnergyCapacity())
    var stored = Number(c.getEnergyStored())
    if (m.metered) m.euUsed += cap - stored
    c.setEnergyStored(cap)
    m.metered = true
  }

  // the item ids a tag holds
  function tagItems(tag) {
    var out = {}
    asArray(Ingredient.of('#' + tag).getItemIds()).forEach(function (id) { out[String(id)] = true })
    return out
  }

  // ---------------------------------------------------------------- static checks

  var TIERS = ['ulv', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv']
  var IV = 5
  var GCYM = ['large_maceration_tower', 'large_arc_smelter', 'large_chemical_bath', 'large_sifting_funnel', 'large_engraving_laser',
    'large_packer', 'large_mixer', 'large_centrifuge', 'large_assembler', 'large_circuit_assembler', 'large_electrolyzer',
    'large_electromagnet', 'alloy_blast_smelter', 'mega_blast_furnace', 'mega_vacuum_freezer', 'large_autoclave', 'large_material_press',
    'large_brewer', 'large_cutter', 'large_distillery', 'large_extractor', 'large_extruder', 'large_solidifier', 'large_wiremill']
    .map(function (n) { return 'gtceu:' + n })
  var MOVED = { 'gtceu:large_packer': 'grindless:assembler/large_packer', 'gtceu:alloy_blast_smelter': 'grindless:assembler/alloy_blast_smelter' }
  var MEGAS = ['gtca:mega_lcr', 'gtca:mega_oil_cracking_unit', 'gtnn:maceration_stack_controller']
  var QUANTUM = ['gtceu:iv_quantum_chest', 'gtceu:iv_quantum_tank']

  // circuit tier of an item (index in TIERS), -1 when it is no circuit
  function circuitTier(id) {
    if (S.tiers === undefined) {
      S.tiers = TIERS.map(function (t) { return tagItems('gtceu:circuits/' + t) })
    }
    for (var i = 0; i < S.tiers.length; i++) if (S.tiers[i][id]) return i
    return -1
  }

  // an ingredient's ids -> its circuit tier when every id is a circuit of one tier, -1 otherwise
  function ingredientTier(ids) {
    if (ids.length === 0) return -1
    var t = circuitTier(ids[0])
    for (var i = 1; i < ids.length; i++) if (circuitTier(ids[i]) !== t) return -1
    return t
  }

  // every recipe that makes an item: crafting recipes by their result, GT assembler and assembly line recipes by their item outputs;
  // each maker: { id, kind, ins: [[ids of one ingredient], ...] } (GT tags show their first item)
  function makers() {
    if (S.makers !== undefined) return S.makers
    var c = lazy()
    var by = {}
    function add(out, m) {
      if (!by[out]) by[out] = []
      by[out].push(m)
    }
    asArray(S.server.getRecipeManager().getAllRecipesFor(c.RecipeType.CRAFTING)).forEach(function (r) {
      var out = itemName(r.getResultItem(S.server.registryAccess()))
      var ins = asArray(r.getIngredients()).map(function (ing) { return asArray(ing.getItemIds()).map(String) }).filter(function (l) { return l.length > 0 })
      add(out, { id: String(r.getId()), kind: 'crafting', ins: ins })
    })
    ;['gtceu:assembler', 'gtceu:assembly_line'].forEach(function (type) {
      asArray(S.server.getRecipeManager().getAllRecipesFor(GTRegistries.RECIPE_TYPES.get(rl(type)))).forEach(function (r) {
        var inItems = gtItemsIn(r)
        var ins = inItems.map(function (x) { return [x.id] })
        var cnt = inItems.map(function (x) { return x.count })
        gtItemsOut(r).forEach(function (st) { add(itemName(st), { id: String(r.getId()), kind: type, ins: ins, cnt: cnt }) })
      })
    })
    S.makers = by
    return by
  }

  function makersOf(id) {
    return makers()[id] || []
  }

  function hasItem(m, id) {
    return m.ins.some(function (l) { return l.indexOf(id) >= 0 })
  }

  function tiersOf(m) {
    return m.ins.map(ingredientTier).filter(function (t) { return t >= 0 })
  }

  function staticChecks() {
    safely('helper', function () {
      var p = PH()
      var problems = []
      if (typeof p.part !== 'function' || typeof p.modifier !== 'function') problems.push('global.grindless.parallelHatch is not published')
      var d = typeof p.part === 'function' ? p.part() : null
      if (!d || d.kind !== 'part' || d.ability !== 'parallel_hatch' || !d.limits || d.limits.max !== 1) problems.push('part() ' + JSON.stringify(d))
      var def = GTRegistries.MACHINES.get(rl(HATCH))
      if (def === null || def === undefined) problems.push(HATCH + ' is not registered')
      check('helper', problems.length === 0, 'part ' + (d ? d.kind + ' ' + d.ability + ' ' + JSON.stringify(d.limits) : 'none') + '; machines ' +
        (p.machines || []).map(short).join(', ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('plants_take_the_hatch', function () {
      var problems = []
      var lines = []
      Object.keys(PLANTS).forEach(function (id) {
        var want = PLANTS[id]
        var desc = global.grindless.patterns.describe(id)
        if (!desc) {
          problems.push(id + ': no structure description')
          return
        }
        var w = desc.slices[0][0].length
        var h = desc.slices[0].length
        var d = desc.slices.length
        var withHatch = Object.keys(desc.symbols).filter(function (ch) {
          var s = desc.symbols[ch]
          return s.kind === 'oneOf' && s.options.some(function (o) { return o.kind === 'part' && o.ability === 'parallel_hatch' })
        })
        var cells = 0
        var total = 0
        desc.slices.forEach(function (rows) {
          rows.forEach(function (row) {
            for (var i = 0; i < row.length; i++) {
              var ch = row.charAt(i)
              if (ch === ' ') continue
              total++
              if (withHatch.indexOf(ch) >= 0) cells++
            }
          })
        })
        var opt = withHatch.length === 1 ? desc.symbols[withHatch[0]].options.filter(function (o) { return o.ability === 'parallel_hatch' })[0] : null
        if (withHatch.length !== 1) problems.push(short(id) + ': ' + withHatch.length + ' symbols take the hatch')
        if (opt && (!opt.limits || opt.limits.max !== 1)) problems.push(short(id) + ': limits ' + JSON.stringify(opt.limits))
        if (w !== want.w || h !== want.h || d !== want.d || cells !== want.cells || total !== want.total) {
          problems.push(short(id) + ': ' + w + 'x' + h + 'x' + d + ', ' + cells + ' part cells, ' + total + ' cells (want ' + want.w + 'x' + want.h + 'x' + want.d +
            ', ' + want.cells + ', ' + want.total + ')')
        }
        lines.push(short(id) + ' ' + w + 'x' + h + 'x' + d + ' (w x h x d), ' + total + ' cells; ' + cells + ' part cells "' + withHatch.join('') + '" take ' +
          (opt ? 'the parallel hatch ' + JSON.stringify(opt.limits) : 'no parallel hatch'))
      })
      check('plants_take_the_hatch', problems.length === 0, lines.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('parallel_hatch_recipe', function () {
      var problems = []
      var mine = (MP().recipes || []).filter(function (r) { return r.output === HATCH })[0]
      if (!mine) throw new Error('global.grindless.massProduction.recipes has no ' + HATCH)
      var r = liveRecipe(mine.id)
      if (r === null) throw new Error(mine.id + ' missing')
      var m = makersOf(HATCH)
      var ours = m.filter(function (x) { return x.id === mine.id })[0]
      if (!ours) problems.push(mine.id + ' does not make ' + HATCH)
      // one GT assembler input holds the whole stack (4x circuit tag), so count items, not ingredients
      var iv = 0
      var lower = 0
      if (ours) ours.ins.forEach(function (l, i) {
        var t = ingredientTier(l)
        var n = ours.cnt ? ours.cnt[i] : 1
        if (t === IV) iv += n
        else if (t >= 0 && t < IV) lower += n
      })
      if (iv !== 4 || lower !== 0) problems.push(iv + ' IV circuits, ' + lower + ' lower')
      ;['gtceu:iv_sensor', 'gtceu:iv_emitter', 'gtceu:iv_machine_hull', 'gtceu:platinum_double_cable'].forEach(function (id) {
        if (ours && !hasItem(ours, id)) problems.push('no ' + short(id))
      })
      if (liveRecipe(mine.replaces) !== null) problems.push(mine.replaces + ' is still there')
      if (m.length !== 1) problems.push('made by ' + m.map(function (x) { return x.id }).join(', '))
      check('parallel_hatch_recipe', problems.length === 0, mine.id + ': ' + (ours ? ours.ins.length : 0) + ' ingredients, ' + iv +
        ' IV circuits, IV sensor + emitter + hull + double platinum cables; ' + short(mine.replaces) + ' ' + (liveRecipe(mine.replaces) === null ? 'removed' : 'PRESENT') +
        '; makers of the hatch: ' + m.map(function (x) { return x.id }).join(', ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('gcym_iv', function () {
      var problems = []
      var lines = []
      GCYM.forEach(function (id) {
        if (!Item.exists(id)) {
          problems.push(short(id) + ' does not exist')
          return
        }
        var m = makersOf(id)
        if (m.length === 0) {
          lines.push(short(id) + ': no recipe')
          return
        }
        m.forEach(function (x) {
          var t = tiersOf(x)
          var top = t.length > 0 ? Math.max.apply(null, t) : -1
          var low = t.length > 0 ? Math.min.apply(null, t) : -1
          if (top < IV || low < IV) problems.push(short(id) + ' <= ' + x.id + ' circuits ' + t.map(function (i) { return TIERS[i] }).join('/'))
          if (MOVED[id] && x.id !== MOVED[id]) problems.push(short(id) + ' <= ' + x.id + ' (want only ' + MOVED[id] + ')')
          lines.push(short(id) + ' ' + (top >= 0 ? TIERS[top] : '?'))
        })
        if (MOVED[id] && !m.some(function (x) { return x.id === MOVED[id] })) problems.push(short(id) + ': ' + MOVED[id] + ' missing')
      })
      ;['gtceu:large_packer', 'gtceu:alloy_blast_smelter'].forEach(function (id) {
        var x = makersOf(id).filter(function (y) { return y.id === MOVED[id] })[0]
        var machine = id === 'gtceu:large_packer' ? 'gtceu:iv_packer' : 'gtceu:iv_alloy_smelter'
        if (x && !hasItem(x, machine)) problems.push(MOVED[id] + ' has no ' + short(machine))
      })
      check('gcym_iv', problems.length === 0, GCYM.length + ' GCYM controllers: ' + lines.join(', ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('addon_megas_iv', function () {
      var problems = []
      var lines = []
      MEGAS.forEach(function (id) {
        if (!Item.exists(id)) {
          lines.push(id + ' not installed')
          return
        }
        var m = makersOf(id)
        if (m.length === 0) problems.push(id + ' has no recipe')
        m.forEach(function (x) {
          var gates = []
          x.ins.forEach(function (l) {
            if (ingredientTier(l) >= IV) gates.push(TIERS[ingredientTier(l)] + ' circuit')
            else if (l.length === 1 && /^gtceu:iv_/.test(l[0])) gates.push(short(l[0]))
          })
          if (gates.length === 0) problems.push(id + ' <= ' + x.id + ' has no IV part')
          lines.push(id + ' <= ' + x.id + ' (' + gates.join(', ') + ')')
        })
      })
      check('addon_megas_iv', problems.length === 0, lines.join(' ; ') + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('quantum_storage_iv', function () {
      var problems = []
      var lines = []
      QUANTUM.forEach(function (id) {
        var m = makersOf(id).filter(function (x) { return !hasItem(x, id) })
        if (m.length === 0) problems.push(short(id) + ' has no recipe')
        m.forEach(function (x) {
          var t = tiersOf(x)
          if (t.indexOf(IV) < 0 || t.some(function (i) { return i < IV })) problems.push(x.id + ' circuits ' + t.map(function (i) { return TIERS[i] }).join('/'))
          if (!hasItem(x, 'gtceu:hv_field_generator')) problems.push(x.id + ' has no HV field generator')
          lines.push(short(id) + ' <= ' + x.id)
        })
      })
      check('quantum_storage_iv', problems.length === 0, lines.join(', ') + ' (IV circuits and an HV field generator)' +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })

    safely('assembly_line_chain', function () {
      var problems = []
      var ctrl = makersOf(AL_MACHINE)
      if (ctrl.length === 0) problems.push('no recipe makes the assembly line')
      ctrl.forEach(function (x) {
        ;['gtceu:iv_machine_hull', 'gtceu:iv_robot_arm', AL_BLOCKS.control].forEach(function (id) { if (!hasItem(x, id)) problems.push(x.id + ' has no ' + short(id)) })
        if (tiersOf(x).indexOf(IV) < 0) problems.push(x.id + ' has no IV circuit')
      })
      var control = makersOf(AL_BLOCKS.control)
      if (control.length === 0) problems.push('no recipe makes the control casing')
      control.forEach(function (x) {
        if (!hasItem(x, 'gtceu:iv_sensor') || !hasItem(x, 'gtceu:iv_emitter')) problems.push(x.id + ' lacks the IV sensor or emitter')
      })
      var unit = makersOf(AL_BLOCKS.unit)
      if (unit.length === 0) problems.push('no recipe makes the line casing')
      unit.forEach(function (x) { if (!hasItem(x, 'gtceu:ruridit_gear')) problems.push(x.id + ' has no ruridit gear') })
      var data = makersOf(AL_BLOCKS.data)
      if (data.length === 0) problems.push('no recipe makes the data access hatch')
      var research = liveRecipe(RESEARCH)
      var stick = null
      if (research === null) problems.push(RESEARCH + ' missing')
      else {
        stick = gtItemsOut(research)[0]
        var nbt = stick ? String(stick.getNbt()) : ''
        if (nbt.indexOf(RESEARCH_ID) < 0) problems.push('the scanner writes ' + nbt)
        if (inputEUt(research) !== 1920) problems.push('research at ' + inputEUt(research) + ' EU/t')
        S.stick = stick.copy()
      }
      var line = liveRecipe(AL_RECIPE)
      var items = []
      var fluids = []
      if (line === null) problems.push(AL_RECIPE + ' missing')
      else {
        items = gtItemsIn(line)
        fluids = gtFluidsIn(line)
        var wantItems = AL_ITEMS.map(function (x) { return x[0] + ' x' + x[1] }).join(', ')
        var gotItems = items.map(function (x) { return x.id + ' x' + x.count }).join(', ')
        if (gotItems !== wantItems) problems.push('items ' + gotItems + ' (want ' + wantItems + ')')
        var fluidOk = fluids.length === AL_FLUIDS.length && fluids.every(function (f, i) {
          return (f.id === AL_FLUIDS[i][0] || f.id === AL_FLUIDS[i][0].replace(':', ':flowing_')) && f.amount === AL_FLUIDS[i][1]
        })
        if (!fluidOk) problems.push('fluids ' + JSON.stringify(fluids))
        S.alRecipe = { eut: inputEUt(line), duration: Number(line.duration) }
        if (S.alRecipe.eut !== 6000 || S.alRecipe.duration !== 600) problems.push(S.alRecipe.eut + ' EU/t x ' + S.alRecipe.duration + ' t')
      }
      check('assembly_line_chain', problems.length === 0, 'controller <= ' + ctrl.map(function (x) { return x.id }).join(', ') + '; control casing <= ' +
        control.map(function (x) { return x.id }).join(', ') + '; line casing <= ' + unit.map(function (x) { return x.id }).join(', ') + '; data access hatch <= ' +
        data.map(function (x) { return x.id }).join(', ') + '; research ' + short(RESEARCH) + ' at ' + (research ? inputEUt(research) : '?') + ' EU/t -> ' +
        (stick ? String(stick.getNbt()) : 'none') + '; ' + short(AL_RECIPE) + ': ' + items.map(function (x) { return short(x.id) + ' x' + x.count }).join(', ') + ' + ' +
        fluids.map(function (f) { return short(f.id) + ' ' + f.amount }).join(', ') + (S.alRecipe ? ', ' + S.alRecipe.eut + ' EU/t x ' + S.alRecipe.duration + ' t' : '') +
        (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
    })
  }

  // ---------------------------------------------------------------- the heavy-water plant with a parallel hatch

  function plainBlock(sym) {
    if (sym.kind === 'blocks') return sym.blocks[0]
    if (sym.kind === 'frames' && sym.materials && sym.materials.length > 0) return 'gtceu:' + sym.materials[0] + '_frame'
    if (sym.kind === 'oneOf') {
      for (var i = 0; i < sym.options.length; i++) {
        if (sym.options[i].kind === 'blocks') return sym.options[i].blocks[0]
      }
    }
    throw new Error('no plain block for symbol kind ' + sym.kind)
  }

  // the pattern is listed back -> front (controller in the last slice), rows bottom -> top; for a controller facing north:
  // x = cx - (col - ctrlCol), y = cy + (row - ctrlRow), z = cz - (slice - ctrlSlice)  (the structure is behind it)
  function hwPlan() {
    var desc = global.grindless.patterns.describe(HW_MACHINE)
    if (!desc) throw new Error('no structure description recorded for ' + HW_MACHINE)
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          if (desc.symbols[row.charAt(ci)] && desc.symbols[row.charAt(ci)].kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
        }
      })
    })
    if (ctrl === null) throw new Error('the description has no controller cell')
    var cy = HW_COPY.y + ctrl.ri
    var cells = []
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'air' || sym.kind === 'any') continue
          var c = { x: HW_COPY.x - (ci - ctrl.ci), y: cy + (ri - ctrl.ri), z: HW_COPY.z - (si - ctrl.si), id: null, props: '', role: null }
          var role = HW_PARTS[si + ',' + ri + ',' + ci]
          if (sym.kind === 'controller') {
            c.id = HW_MACHINE
            c.props = '[facing=north]'
            c.role = 'controller'
          } else if (role !== undefined) {
            c.id = role === 'energy' ? HW_COPY.energy : HW_ROLE_BLOCKS[role]
            c.props = '[facing=' + HW_FACING[si] + ']'
            c.role = role
          } else {
            c.id = plainBlock(sym)
          }
          cells.push(c)
        }
      })
    })
    return { cells: cells, size: desc.slices[0][0].length + 'x' + desc.slices[0].length + 'x' + desc.slices.length }
  }

  // places a plan's cells (the controller last, so it checks a complete structure) and checks every block; m.roles maps positions to roles
  function placeCells(m, name, cells, size) {
    var failed = []
    var ctrlCell = null
    var tally = {}
    m.roles = {}
    cells.forEach(function (c) {
      tally[c.id] = (tally[c.id] || 0) + 1
      if (c.role === 'controller') {
        ctrlCell = c
        return
      }
      if (c.role !== null && c.role !== undefined) m.roles[at(c)] = c.role
      if (setBlock(c.x, c.y, c.z, c.id, c.props) < 1) failed.push(at(c) + ' ' + c.id)
    })
    if (ctrlCell === null || setBlock(ctrlCell.x, ctrlCell.y, ctrlCell.z, ctrlCell.id, ctrlCell.props) < 1) failed.push('controller')
    m.ctrlPos = ctrlCell === null ? null : { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }
    var wrong = []
    cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.id) wrong.push(at(c) + ' wanted ' + c.id + ' got ' + got)
    })
    var bill = Object.keys(tally).sort().map(function (id) { return short(id) + ' x' + tally[id] }).join(', ')
    check(name + '_PLACED', failed.length === 0 && wrong.length === 0, cells.length + ' blocks, ' + size + ' (w x h x d), controller ' +
      (m.ctrlPos ? at(m.ctrlPos) : 'none') + ' bill=[' + bill + ']' + (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') +
      (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return failed.length === 0 && wrong.length === 0
  }

  // the controller's parts by role (positions recorded when placing)
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

  // waits for the controller to form (GTM checks the pattern asynchronously); forces one synchronous check after FORM_TIMEOUT
  function formStep(m, name) {
    var waited = S.t - m.t0
    var ctrl = machineAt(m.ctrlPos)
    if (ctrl === null || ctrl === undefined) {
      check(name + '_FORMED', false, 'no machine at the controller position ' + at(m.ctrlPos))
      m.phase = 'done'
      return false
    }
    if (ctrl.isFormed()) {
      check(name + '_FORMED', true, (m.forced ? 'after a forced check' : 'by itself after ' + waited + ' ticks') + ', class=' +
        String(ctrl.getClass().getSimpleName()) + ' parts=' + asArray(ctrl.getParts()).length)
      m.ctrl = ctrl
      return true
    }
    if (waited >= FORM_TIMEOUT && !m.forced) {
      if (!ctrl.checkPatternWithLock()) {
        check(name + '_FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(ctrl))
        m.phase = 'done'
        return false
      }
      check(name + '_FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
      ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
      ctrl.onStructureFormed()
      m.forced = true
    } else if (waited >= 2 * FORM_TIMEOUT) {
      check(name + '_FORMED', false, 'still not formed after a forced check')
      m.phase = 'done'
    }
    return false
  }

  function exchangeRecipe() {
    var r = (HWP().recipes || []).filter(function (x) { return x.name === EXCHANGE })[0]
    if (!r) throw new Error('the heavy-water plant did not publish ' + EXCHANGE)
    return r
  }

  function hwOutFluids(m) {
    var t = {}
    OUTS.forEach(function (role) {
      var info = tankInfo(m.P[role])
      if (info.amount > 0) t[info.id] = (t[info.id] || 0) + info.amount
    })
    return t
  }

  // the exchange's outputs times k: [[id, amount], ...]
  function timesOut(rec, k) {
    return rec.fluidsOut.map(function (f) { return [f.id, f.amount * k] })
  }

  function hwBegin(m, phase) {
    m.phase = phase
    m.t0 = S.t
    m.seen = {}
    m.seenWorking = false
    m.ran = null
    m.eu0 = m.euUsed
    wake(m.ctrl)
  }

  // empties every part (the circuit too) and loads: items into the input bus, fluids into input hatches 1 and 2
  function hwLoad(m, phase, ice, steam, h2s) {
    emptyBus(m.P.inBus)
    INS.concat(OUTS).forEach(function (role) { setTank(m.P[role], null, 0) })
    m.P.inBus.getCircuitInventory().setStackInSlot(0, lazy().Circuit.stack(1))
    if (ice > 0) insert(m.P.inBus, ICE, ice)
    setTank(m.P.in1, STEAM, steam)
    setTank(m.P.in2, H2S, h2s)
    hwBegin(m, phase)
  }

  function hwResult(m) {
    return { fluids: hwOutFluids(m), left: readBus(m.P.inBus), steam: tankInfo(m.P.in1), charge: tankInfo(m.P.in2), eu: m.euUsed - m.eu0 }
  }

  function hwRunOver(m, age, duration) {
    return (m.seenWorking && statusOf(m.ctrl) === 'IDLE') || age >= duration + SLACK
  }

  function hwFormed(m) {
    safely('hw_PARTS', function () {
      m.P = findParts(m, m.ctrl)
      var want = {}
      Object.keys(HW_PARTS).forEach(function (k) { want[HW_PARTS[k]] = true })
      var missing = Object.keys(want).filter(function (role) { return !m.P[role] })
      var hatch = m.ctrl.getParallelHatch()
      var present = hatch.isPresent()
      var current = present ? Number(hatch.get().getCurrentParallel()) : 0
      var ok = missing.length === 0 && present && current === 4
      check('hw_PARTS', ok, '[' + m.P.ids.join(' ') + '] parallel hatch: ' + (present ? 'read by the controller, set to ' + current : 'NOT read by the controller') +
        (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''))
      if (!ok) {
        m.phase = 'done'
        return
      }
      meter(m)
      hwLoad(m, 'par_low', 64, 102400, 999)
    })
    if (m.phase === 'formed') m.phase = 'done'
  }

  function hwStep(m, age) {
    var rec = exchangeRecipe()
    if (m.phase === 'par_low' && age >= HOLD_TICKS) {
      var r0 = hwResult(m)
      var blocked = (r0.left[ICE] || 0) === 64 && r0.steam.amount === 102400 && r0.eu === 0 && Object.keys(m.seen).length === 0 && Object.keys(r0.fluids).length === 0
      check('par_refuses_low_charge', blocked && r0.charge.amount === 999, '64 ice + 102,400 mB steam + 999 mB H2S with the parallel hatch: ' + (r0.left[ICE] || 0) +
        ' ice and ' + r0.steam.amount + ' mB steam left, ' + r0.eu + ' EU, ran [' + Object.keys(m.seen).join(',') + '], outputs ' + fluidSummary(r0.fluids) + ' | ' +
        state(m.ctrl) + ' reasons=[' + failureReasons(m.ctrl).join(' ; ') + ']')
      setTank(m.P.in2, H2S, 1000)
      hwBegin(m, 'par_full')
      return
    }
    if (m.phase === 'par_full' && hwRunOver(m, age, rec.duration)) {
      var r = hwResult(m)
      var ran = m.ran || {}
      var problems = []
      if (m.seen[rec.recipeId] !== true) problems.push(rec.recipeId + ' never ran (seen ' + Object.keys(m.seen).join(',') + ')')
      if (ran.parallels !== 4) problems.push(ran.parallels + ' copies')
      if (ran.eut !== rec.eut * 4 || ran.duration !== rec.duration) problems.push('ran at ' + ran.eut + ' EU/t x ' + ran.duration + ' t')
      if (!sameFluids(r.fluids, timesOut(rec, 4))) problems.push('fluids out ' + fluidSummary(r.fluids))
      if (Object.keys(r.left).length !== 0 || r.steam.amount !== 0) problems.push('left ' + summary(r.left) + ', ' + r.steam.amount + ' mB steam')
      if (r.eu !== rec.energy * 4) problems.push(r.eu + ' EU drawn, want ' + rec.energy * 4)
      check('PROCESS_parallel_exchange', problems.length === 0, '64 ice + 102,400 mB steam + 1,000 mB H2S, circuit 1, one IV hatch: ' + ran.parallels + ' copies at ' +
        ran.eut + ' EU/t x ' + ran.duration + ' t (base ' + rec.eut + ' x ' + rec.duration + ') -> ' + fluidSummary(r.fluids) + '; ' + r.eu + ' EU drawn (4 x ' + rec.energy +
        ') | ' + state(m.ctrl) + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
      check('charge_after_parallel', r.charge.id === H2S && r.charge.amount === 1000, 'after the 4-copy run the H2S hatch holds ' + r.charge.amount + ' mB ' +
        short(r.charge.id) + ' (put in: 1,000; the charge is needed once and never multiplied)')
      note('parallel_energy', 'per batch: ' + (r.eu / 4) + ' EU with the parallel hatch (the recipe\'s own ' + rec.energy + ', ' + rec.duration +
        ' t for 4 batches at ' + ran.eut + ' EU/t) against ' + (rec.eut * 4 * Math.ceil(rec.duration / 2)) + ' EU with one overclock on the same IV hatch (IV-A5: ' +
        rec.eut * 4 + ' EU/t x ' + Math.ceil(rec.duration / 2) + ' t a batch): twice the batches per tick for half the energy each')
      // fewer inputs than 4 batches: 40 ice and 64,000 mB of steam are 2.5 batches
      INS.concat(OUTS).forEach(function (role) { if (role !== 'in2') setTank(m.P[role], null, 0) })
      emptyBus(m.P.inBus)
      insert(m.P.inBus, ICE, 40)
      setTank(m.P.in1, STEAM, 64000)
      hwBegin(m, 'par_partial')
      return
    }
    if (m.phase === 'par_partial' && hwRunOver(m, age, rec.duration)) {
      var r2 = hwResult(m)
      var ran2 = m.ran || {}
      var problems2 = []
      if (ran2.parallels !== 2) problems2.push(ran2.parallels + ' copies')
      if (ran2.eut !== rec.eut * 2 || ran2.duration !== rec.duration) problems2.push('ran at ' + ran2.eut + ' EU/t x ' + ran2.duration + ' t')
      if (!sameFluids(r2.fluids, timesOut(rec, 2))) problems2.push('fluids out ' + fluidSummary(r2.fluids))
      if ((r2.left[ICE] || 0) !== 8 || r2.steam.amount !== 12800) problems2.push('left ' + summary(r2.left) + ', ' + r2.steam.amount + ' mB steam')
      if (r2.charge.id !== H2S || r2.charge.amount !== 1000) problems2.push('charge ' + r2.charge.amount + ' mB ' + short(r2.charge.id))
      if (r2.eu !== rec.energy * 2) problems2.push(r2.eu + ' EU drawn, want ' + rec.energy * 2)
      check('PROCESS_partial_parallel', problems2.length === 0, '40 ice + 64,000 mB steam: ' + ran2.parallels + ' copies at ' + ran2.eut + ' EU/t x ' + ran2.duration +
        ' t -> ' + fluidSummary(r2.fluids) + '; left ' + summary(r2.left) + ' and ' + r2.steam.amount + ' mB steam; charge ' + r2.charge.amount + ' mB; ' + r2.eu + ' EU | ' +
        state(m.ctrl) + (problems2.length > 0 ? ' | problems: ' + problems2.join('; ') : ''))
      m.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- the assembly line fed from AE2

  // GTM's pattern (GTMultiMachines.ASSEMBLY_LINE, FactoryBlockPattern.start(BACK, UP, RIGHT)): a slice's chars go back (south for a
  // controller facing north), its strings up, the slices to the controller's right (east). Rows of a slice, bottom -> top:
  //   "FIF" fluid hatch or steel casing / ULV input bus (the last slice: "O", an output bus) / fluid hatch or steel casing
  //   "RTR" laminated glass / assembly line unit / laminated glass
  //   "SAG" the controller ("D" in the other slices: grating, or the one data access hatch) / control casing / grating
  //   "#Y#" anything / steel casing or energy hatch (1-2) / anything
  // The controller is in slice 0, char 0 of row 2: block (slice a, row r, char c) = (x + a, y + r - 2, z + c).
  function alCells() {
    var B = AL_BLOCKS
    var cells = []
    for (var a = 0; a < AL_SLICES; a++) {
      var x = AL.x + a
      var first = a === 0
      var last = a === AL_SLICES - 1
      var fluid = a < AL_FLUIDS.length
      cells.push({ x: x, y: AL.y - 2, z: AL.z, id: fluid ? B.fluid : B.casing, props: fluid ? '[facing=down]' : '', role: fluid ? 'fluid' + a : null })
      cells.push({ x: x, y: AL.y - 2, z: AL.z + 1, id: last ? B.out : B.bus, props: '[facing=down]', role: last ? 'out' : 'bus' + a })
      cells.push({ x: x, y: AL.y - 2, z: AL.z + 2, id: B.casing, props: '', role: null })
      cells.push({ x: x, y: AL.y - 1, z: AL.z, id: B.glass, props: '', role: null })
      cells.push({ x: x, y: AL.y - 1, z: AL.z + 1, id: B.unit, props: '', role: null })
      cells.push({ x: x, y: AL.y - 1, z: AL.z + 2, id: B.glass, props: '', role: null })
      if (first) cells.push({ x: x, y: AL.y, z: AL.z, id: AL_MACHINE, props: '[facing=north]', role: 'controller' })
      else if (last) cells.push({ x: x, y: AL.y, z: AL.z, id: B.data, props: '[facing=north]', role: 'data' })
      else cells.push({ x: x, y: AL.y, z: AL.z, id: B.grating, props: '', role: null })
      cells.push({ x: x, y: AL.y, z: AL.z + 1, id: B.control, props: '', role: null })
      cells.push({ x: x, y: AL.y, z: AL.z + 2, id: B.grating, props: '', role: null })
      cells.push({ x: x, y: AL.y + 1, z: AL.z + 1, id: first ? B.energy : B.casing, props: first ? '[facing=up]' : '', role: first ? 'energy' : null })
    }
    return cells
  }

  // AE2 under the line: a dense trunk (Y - 4) under every input bus and fluid hatch, and on it one glass cable each (Y - 3) carrying an
  // export bus on its top face. Neighbouring glass cables alternate white and orange so they don't join each other: each takes its
  // channel straight from the trunk (a glass cable carries 8, the trunk 32). The last slice's cable feeds GTM's ME output bus, which only
  // connects on its front (facing down). The AE2 controller, a creative energy cell and the drive sit west of the line.
  function aeLayout() {
    var trunk = []
    var hosts = []
    for (var a = 0; a < AL_SLICES; a++) {
      trunk.push({ x: AL.x + a, y: AL.y - 4, z: AL.z + 1 })
      hosts.push({ x: AL.x + a, y: AL.y - 3, z: AL.z + 1, color: a % 2 === 0 ? 'white' : 'orange', item: a < AL_SLICES - 1 ? AL_ITEMS[a] : null, fluid: null })
    }
    for (var f = 0; f < AL_FLUIDS.length; f++) {
      trunk.push({ x: AL.x + f, y: AL.y - 4, z: AL.z })
      hosts.push({ x: AL.x + f, y: AL.y - 3, z: AL.z, color: f % 2 === 0 ? 'orange' : 'white', item: null, fluid: AL_FLUIDS[f] })
    }
    return {
      trunk: trunk,
      hosts: hosts,
      controller: { x: AL.x - 1, y: AL.y - 4, z: AL.z + 1 },
      cell: { x: AL.x - 2, y: AL.y - 4, z: AL.z + 1 },
      drive: { x: AL.x - 1, y: AL.y - 3, z: AL.z + 1 }
    }
  }

  function itemKey(id) {
    return ae().AEItemKey['of(net.minecraft.world.level.ItemLike)'](Item.of(id).getItem())
  }

  function fluidKey(id) {
    return ae().AEFluidKey['of(net.minecraft.world.level.material.Fluid)'](lazy().Registries.FLUIDS.getValue(rl(id)))
  }

  function buildNetwork(m) {
    var A = ae()
    var L = lazy()
    var lay = aeLayout()
    var failed = []
    if (setBlock(lay.controller.x, lay.controller.y, lay.controller.z, AE_IDS.controller, '') < 1) failed.push('controller')
    if (setBlock(lay.cell.x, lay.cell.y, lay.cell.z, AE_IDS.cell, '') < 1) failed.push('energy cell')
    if (setBlock(lay.drive.x, lay.drive.y, lay.drive.z, AE_IDS.drive, '') < 1) failed.push('drive')
    var drive = S.level.getBlockEntity(bp(lay.drive))
    if (drive === null) failed.push('drive block entity')
    else {
      drive.getInternalInventory().setItemDirect(0, Item.of(AE_IDS.itemCell))
      drive.getInternalInventory().setItemDirect(1, Item.of(AE_IDS.fluidCell))
    }
    var trunk = Item.of(AE_IDS.trunk).getItem()
    lay.trunk.forEach(function (p) {
      if (A.PartHelper.setPart(S.level, bp(p), null, null, trunk) === null) failed.push('trunk ' + at(p))
    })
    var exportBus = Item.of(AE_IDS.exportBus).getItem()
    m.buses = []
    lay.hosts.forEach(function (h) {
      if (A.PartHelper.setPart(S.level, bp(h), null, null, Item.of('ae2:' + h.color + '_glass_cable').getItem()) === null) failed.push('cable ' + at(h))
      if (h.item === null && h.fluid === null) return
      var bus = A.PartHelper.setPart(S.level, bp(h), L.Direction.UP, null, exportBus)
      if (bus === null) {
        failed.push('export bus ' + at(h))
        return
      }
      var key = h.item !== null ? itemKey(h.item[0]) : fluidKey(h.fluid[0])
      bus.getConfig().setStack(0, new A.GenericStack(key, 1))
      var rest = bus.getUpgrades().addItems(Item.of(AE_IDS.speedCard, 4))
      if (!rest.isEmpty()) failed.push('speed cards ' + at(h) + ': ' + rest.getCount() + ' left')
      m.buses.push({ part: bus, at: at(h), what: h.item !== null ? h.item[0] : h.fluid[0] })
    })
    m.drive = drive
    m.lay = lay
    check('ae2_build', failed.length === 0, 'AE2 controller ' + at(lay.controller) + ', creative energy cell ' + at(lay.cell) + ', drive ' + at(lay.drive) +
      ' (1k item + 1k fluid cell), dense trunk x' + lay.trunk.length + ', ' + m.buses.length + ' export buses (4 speed cards each): ' +
      m.buses.map(function (b) { return short(b.what) + '@' + b.at }).join(' ') + (failed.length > 0 ? ' | failed: ' + failed.join(', ') : ''))
    return failed.length === 0
  }

  function gridOfNode(node) {
    return node === null || node === undefined ? null : node.getGrid()
  }

  function nodeActive(node) {
    try {
      return !!node.isActive()
    } catch (e) {
      return !!node.isOnline()
    }
  }

  // the network as the line test needs it: one grid, booted and powered, every export bus and the ME output bus online
  function netState(m) {
    var grid = gridOfNode(m.drive.getMainNode())
    var out = { grid: grid, ok: false, detail: '' }
    if (grid === null || grid === undefined) {
      out.detail = 'the drive has no grid'
      return out
    }
    var booting = !!grid.getPathingService().isNetworkBooting()
    var powered = !!grid.getEnergyService().isNetworkPowered()
    var off = []
    var other = []
    m.buses.forEach(function (b) {
      var node = b.part.getMainNode()
      if (!nodeActive(node)) off.push(short(b.what))
      var g = gridOfNode(node)
      if (g === null || !g.equals(grid)) other.push(short(b.what))
    })
    var outNode = m.P && m.P.out ? m.P.out.getMainNode() : null
    var outOnline = outNode !== null && nodeActive(outNode)
    var outSame = outNode !== null && gridOfNode(outNode) !== null && gridOfNode(outNode).equals(grid)
    out.ok = !booting && powered && off.length === 0 && other.length === 0 && outOnline && outSame
    out.detail = 'booting=' + booting + ' powered=' + powered + ' controller=' + grid.getPathingService().getControllerState() + ' nodes=' + grid.size() +
      ' channels used=' + grid.getPathingService().getUsedChannels() + ' buses offline=[' + off.join(',') + '] on another grid=[' +
      other.join(',') + '] ME output bus online=' + outOnline + ' same grid=' + outSame
    return out
  }

  function storage(m) {
    return m.net.grid.getStorageService().getInventory()
  }

  function stored(m, key) {
    return Number(storage(m).getAvailableStacks().get(key))
  }

  function putIn(m, key, amount) {
    var A = ae()
    return Number(storage(m).insert(key, amount, A.Actionable.MODULATE, A.ActionSource.empty()))
  }

  // what the buses and hatches hold, in line order
  function alSnapshot(m) {
    var items = []
    for (var a = 0; a < AL_SLICES - 1; a++) items.push(summary(readBus(m.P['bus' + a])))
    var fluids = []
    for (var f = 0; f < AL_FLUIDS.length; f++) {
      var t = tankInfo(m.P['fluid' + f])
      fluids.push(t.amount > 0 ? short(t.id) + ' ' + t.amount : 'empty')
    }
    return 'buses [' + items.join(' | ') + '] hatches [' + fluids.join(' | ') + ']'
  }

  function alEmpty(m) {
    for (var a = 0; a < AL_SLICES - 1; a++) if (Object.keys(readBus(m.P['bus' + a])).length > 0) return false
    for (var f = 0; f < AL_FLUIDS.length; f++) if (tankInfo(m.P['fluid' + f]).amount > 0) return false
    return true
  }

  var AL_ROLES = ['bus0', 'bus1', 'bus2', 'bus3', 'bus4', 'bus5', 'fluid0', 'fluid1', 'energy', 'data', 'out']

  function alPlace(m) {
    if (!placeCells(m, 'al', alCells(), AL_SLICES + 'x4x3 (slices x rows x depth)')) return false
    return buildNetwork(m)
  }

  // the stick the EV scanner writes for the LuV motor (read from its recipe by assembly_line_chain), or the same NBT by hand
  function researchStick() {
    if (S.stick) return S.stick.copy()
    return Item.of('gtceu:data_stick', '{assembly_line_research:{research_id:"' + RESEARCH_ID + '",research_type:"gtceu:assembly_line"}}')
  }

  // puts the research stick into the data access hatch the way its slot does (the handler's insertItem, which only takes data items);
  // if that refuses, straight into its storage, and says so. Returns { ok, detail }
  function stickIntoHatch(hatch) {
    var RM = Java.loadClass('com.gregtechceu.gtceu.utils.ResearchManager')
    var stick = researchStick()
    var research = RM.readResearchId(stick)
    var detail = itemName(stick) + ' x' + stick.getCount() + ' ' + stick.getNbt() + ' (data item: ' + RM.isStackDataItem(stick, false) + ', research: ' +
      (research === null ? 'none' : research.researchId() + ' for ' + research.recipeType()) + ')'
    var inv = hatch.importItems
    var rest = inv.insertItem(0, stick.copy(), false)
    if (!rest.isEmpty()) {
      detail += '; the handler refused it (' + itemName(rest) + ' x' + rest.getCount() + ' back, slots ' + inv.getSlots() + ', formed ' + hatch.isFormed() +
        '): put into its storage instead'
      inv.storage.setStackInSlot(0, stick.copy())
    } else {
      detail += '; taken by the handler'
    }
    var held = inv.getStackInSlot(0)
    return { ok: !held.isEmpty() && itemName(held) === 'gtceu:data_stick' && RM.readResearchId(held) !== null, detail: detail }
  }

  function alFormed(m) {
    safely('al_PARTS', function () {
      m.P = findParts(m, m.ctrl)
      var missing = AL_ROLES.filter(function (role) { return !m.P[role] })
      var stick = missing.indexOf('data') < 0 ? stickIntoHatch(m.P.data) : { ok: false, detail: 'no data access hatch' }
      check('al_PARTS', missing.length === 0 && stick.ok, '[' + m.P.ids.join(' ') + '] research stick in the data access hatch: ' + stick.ok + ' (' +
        stick.detail + ')' + (missing.length > 0 ? ' | missing: ' + missing.join(', ') : ''))
      if (missing.length > 0 || !stick.ok) {
        m.phase = 'done'
        return
      }
      meter(m)
      m.phase = 'network'
      m.t0 = S.t
    })
    if (m.phase === 'formed') m.phase = 'done'
  }

  function alFeed(m) {
    var problems = []
    AL_ITEMS.forEach(function (x) {
      var n = putIn(m, itemKey(x[0]), x[1])
      if (n !== x[1]) problems.push(short(x[0]) + ' ' + n + '/' + x[1])
    })
    AL_FLUIDS.forEach(function (f) {
      var n = putIn(m, fluidKey(f[0]), f[1])
      if (n !== f[1]) problems.push(short(f[0]) + ' ' + n + '/' + f[1])
    })
    if (problems.length > 0) {
      check('al_fed', false, 'ME storage did not take: ' + problems.join(', '))
      m.phase = 'done'
      return
    }
    m.phase = 'running'
    m.t0 = S.t
    m.eu0 = m.euUsed
    m.seen = {}
    m.seenWorking = false
    m.ran = null
    m.lastSnap = alSnapshot(m)
    wake(m.ctrl)
  }

  // what is still in ME storage of the motor's ingredients
  function storedIngredients(m) {
    var left = []
    AL_ITEMS.forEach(function (x) {
      var n = stored(m, itemKey(x[0]))
      if (n > 0) left.push(short(x[0]) + ' x' + n)
    })
    AL_FLUIDS.forEach(function (f) {
      var n = stored(m, fluidKey(f[0]))
      if (n > 0) left.push(short(f[0]) + ' ' + n)
    })
    return left
  }

  function alStep(m, age) {
    if (m.phase === 'network') {
      m.net = netState(m)
      if (m.net.ok) {
        check('ae2_network', true, 'after ' + age + ' ticks: ' + m.net.detail)
        alFeed(m)
      } else if (age >= NET_TIMEOUT) {
        check('ae2_network', false, 'not ready after ' + age + ' ticks: ' + m.net.detail)
        m.phase = 'done'
      }
      return
    }
    if (m.phase === 'running') {
      if (!m.seenWorking) {
        if (age >= FEED_TIMEOUT) {
          check('al_fed', false, 'the line never started in ' + age + ' ticks: ' + alSnapshot(m) + '; still in ME storage [' + storedIngredients(m).join(', ') +
            '] | ' + state(m.ctrl) + ' reasons=[' + failureReasons(m.ctrl).join(' ; ') + ']')
          m.phase = 'done'
          return
        }
        m.lastSnap = alSnapshot(m)
        return
      }
      if (m.startedAt === undefined) {
        m.startedAt = S.t
        check('al_fed', m.ran !== null && m.ran.id === AL_RECIPE, 'the line started ' + (m.ran ? m.ran.id : '?') + ' ' + age + ' ticks after the ingredients went into ME ' +
          'storage; the tick before: ' + m.lastSnap)
      }
      var want = S.alRecipe || { eut: 6000, duration: 600 }
      if (statusOf(m.ctrl) === 'IDLE' || S.t - m.startedAt >= want.duration + SLACK) {
        m.phase = 'store'
        m.t0 = S.t
      }
      return
    }
    if (m.phase === 'store') {
      var motors = stored(m, itemKey(MOTOR))
      if (motors < 1 && age < STORE_TIMEOUT) return
      var w = S.alRecipe || { eut: 6000, duration: 600 }
      var ran = m.ran || {}
      var eu = m.euUsed - m.eu0
      var left = storedIngredients(m)
      var problems = []
      if (ran.id !== AL_RECIPE) problems.push('ran ' + ran.id)
      if (ran.eut !== w.eut || ran.duration !== w.duration || ran.parallels !== 1) problems.push('ran at ' + ran.eut + ' EU/t x ' + ran.duration + ' t x' + ran.parallels)
      if (eu !== w.eut * w.duration) problems.push(eu + ' EU drawn, want ' + w.eut * w.duration)
      if (motors !== 1) problems.push(motors + ' motors in ME storage')
      if (left.length > 0) problems.push('still in ME storage: ' + left.join(', '))
      if (!alEmpty(m)) problems.push('left in the line: ' + alSnapshot(m))
      check('PROCESS_assembly_line', problems.length === 0, short(AL_RECIPE) + ' at ' + ran.eut + ' EU/t x ' + ran.duration + ' t, ' + eu + ' EU drawn; ' + motors +
        ' ' + short(MOTOR) + ' in ME storage ' + age + ' ticks after the run (GTM\'s ME output bus); line ' + (alEmpty(m) ? 'empty' : alSnapshot(m)) + ' | ' +
        state(m.ctrl) + (problems.length > 0 ? ' | problems: ' + problems.join('; ') : ''))
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

  function scenario(key) {
    return { key: key, phase: 'forming', t0: S.t, seen: {}, seenWorking: false, euUsed: 0, eu0: 0, metered: false, ran: null, ctrl: null, P: null }
  }

  function startScenarios() {
    var hw = scenario('hw')
    S.ms.push(hw)
    try {
      var plan = hwPlan()
      if (!placeCells(hw, 'hw', plan.cells, plan.size)) hw.phase = 'done'
    } catch (e) {
      check('hw_PLACED', false, 'exception: ' + e)
      hw.phase = 'done'
    }
    var al = scenario('al')
    S.ms.push(al)
    try {
      if (!alPlace(al)) al.phase = 'done'
    } catch (e2) {
      check('al_PLACED', false, 'exception: ' + e2)
      al.phase = 'done'
    }
  }

  // every tick: the energy the controller drew, and what it runs (the recipe as modified: copies, EU/t and duration)
  function measure(m) {
    if (m.ctrl === null || m.P === null || !m.P.energy || m.phase === 'forming' || m.phase === 'done') return
    meter(m)
    var rlg = m.ctrl.getRecipeLogic()
    var last = rlg.getLastRecipe()
    if (String(rlg.getStatus()) === 'WORKING' && last !== null && last !== undefined) {
      m.seenWorking = true
      m.seen[String(last.id)] = true
      if (m.ran === null) m.ran = { id: String(last.id), eut: inputEUt(last), duration: Number(last.duration), parallels: Number(last.parallels) }
    }
  }

  function step(m) {
    if (m.phase === 'forming') {
      if (S.t % STEP !== 0) return
      if (formStep(m, m.key)) {
        m.phase = 'formed'
        if (m.key === 'hw') hwFormed(m)
        else alFormed(m)
      }
      return
    }
    var age = S.t - m.t0
    if (m.key === 'hw') hwStep(m, age)
    else alStep(m, age)
  }

  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    console.info(TAG + SCOPE + '|DONE')
  }

  function onTick(server) {
    if (S === null || S.finished) return
    S.t = server.getTickCount() - S.tick0
    S.ms.forEach(function (m) {
      if (m.phase === 'done') return
      try {
        measure(m)
        step(m)
      } catch (e) {
        check(m.key + '_STEP', false, 'exception in ' + m.phase + ': ' + e)
        m.phase = 'done'
      }
    })
    if (S.ms.every(function (m) { return m.phase === 'done' })) finish()
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
    S = { server: server, level: server.overworld(), t: 0, tick0: server.getTickCount(), ms: [], finished: false }
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
    startScenarios()
    if (S.ms.every(function (m) { return m.phase === 'done' })) finish()
  }

  ServerEvents.tick(function (event) {
    startIfRequested(event.server)
    onTick(event.server)
  })

  ServerEvents.customCommand('gg_test_mass_production', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_mass_production run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
