// Package QR-G0 bench test (scope expanded_assembly_line, band X 36032-36063, Z 0-63, Y 98-112, Overworld).
//   kubejs custom_command gg_test_expanded_assembly_line      then wait for GGTEST|expanded_assembly_line|DONE
// Checks (all against the live registry and live machines):
//   static    the four assembly line recipes exist, make the parts, run at LuV voltage; the controller takes gtceu:assembly_line
//   eal_FORMED / mdr_FORMED / ctl_FORMED   the Expanded Assembly Line (LuV receptor, 7 slices), the Matrix Data Relay (LuV transmissor,
//             two data access hatches) and, as the control, the normal Assembly Line form
//   ctl_REFUSES_WRONG_ORDER / ctl_RUNS_RIGHT_ORDER   the normal line stays idle with gtceu:assembly_line/dynamo_hatch_luv's inputs in the
//             reverse bus order and starts when the same inputs sit in recipe order
//   eal_RUNS_WRONG_ORDER   the Expanded line runs the same recipe with the inputs in the reverse bus order and delivers the hatch
//   eal_RESEARCH_BLOCKED / eal_RESEARCH_LINK / eal_RUNS_RESEARCH   a research recipe does not start without data, the transmissor's scan
//             links the receptor and the relay's data access hatches (a forge fake player presses the button), and with the research
//             stick in the relay's hatch the line runs gtceu:assembly_line/energy_hatch_luv
// The energy hatches are topped up every tick. Maintenance is off in this pack (the config), as in the other bench tests.
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'expanded_assembly_line'
  var BAND = { x0: 36032, x1: 36063, y0: 98, y1: 112, z0: 0, z1: 63 }
  var ROOF_Y = 112
  var STEP = 10
  var FORM_TIMEOUT = 600
  var START_TIMEOUT = 400
  var REFUSE_TICKS = 200
  var RUN_SLACK = 200
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var REQUEST = 'ggTestExpandedAssemblyLineRequest'

  var DYNAMO = 'gtceu:assembly_line/dynamo_hatch_luv'
  var DYNAMO_OUT = 'gtceu:luv_energy_output_hatch'
  var RESEARCH_RECIPE = 'gtceu:assembly_line/energy_hatch_luv'
  var RESEARCH_OUT = 'gtceu:luv_energy_input_hatch'
  var RESEARCH_ID = '1x_gtceu_iv_energy_input_hatch'
  var PART_RECIPES = {
    'grindless:assembly_line/expanded_assembly_line': 'extendedfeatures:expanded_assembly_line',
    'grindless:assembly_line/luv_wireless_data_receptor': 'extendedfeatures:luv_wireless_data_receptor',
    'grindless:assembly_line/luv_wireless_data_transmissor': 'extendedfeatures:luv_wireless_data_transmissor',
    'grindless:assembly_line/matrix_data_relay': 'extendedfeatures:matrix_data_relay'
  }
  var LUV_EUT = 30720

  // the normal line (the control): 7 slices east of its controller
  var CTL = { x: 36052, y: 102, z: 20 }
  var CTL_SLICES = 7
  // the Expanded line: controller front-centre at (cx, y0, z0), 7 slices south
  var EAL = { cx: 36048, y0: 100, z0: 4, slices: 7 }
  // the relay: the controller at its pattern's aisle 10, middle string, middle char
  var MDR = { cx: 36038, cy: 102, cz: 14 }

  var B = {
    casing: 'gtceu:solid_machine_casing',
    glass: 'gtceu:laminated_glass',
    unit: 'gtceu:assembly_line_unit',
    control: 'gtceu:assembly_line_casing',
    grating: 'gtceu:assembly_line_grating',
    bus: 'gtceu:ulv_input_bus',
    outBus: 'gtceu:luv_output_bus',
    fluid: 'gtceu:luv_input_hatch',
    energy: 'gtceu:luv_energy_input_hatch',
    data: 'gtceu:data_access_hatch',
    ctl: 'gtceu:assembly_line',
    eal: 'extendedfeatures:expanded_assembly_line',
    recv: 'extendedfeatures:luv_wireless_data_receptor',
    tx: 'extendedfeatures:luv_wireless_data_transmissor',
    mdr: 'extendedfeatures:matrix_data_relay',
    cc: 'gtceu:computer_casing',
    acc: 'gtceu:advanced_computer_casing',
    hp: 'gtceu:high_power_casing'
  }
  // the relay's pattern (FactoryBlockPattern.start(): chars right, strings up, aisles back), 13 aisles of 5 strings
  var MDR_AISLES = [
    ['    CCCCC    ', '    C   C    ', '    C   C    ', '    C   C    ', '    CCCCC    '],
    ['  DDDDDDDDD  ', '  EEC   CEE  ', '  EEC   CEE  ', '  EEC   CEE  ', '  DDDDDDDDD  '],
    [' DDCFFFFFCDD ', ' EDEF F FEDE ', ' EDEF F FEDE ', ' EDEF F FEDE ', ' DDCFFFFFCDD '],
    [' DCCCCFCCCCD ', ' EE       EE ', ' EE       EE ', ' EE       EE ', ' DCCCCFCCCCD '],
    ['CDFCCCFCCCFDC', 'CCF       FCC', 'CCX       XCC', 'CCF       FCC', 'CDFCCCFCCCFDC'],
    ['CDFCCCFCCCFDC', '             ', '             ', '             ', 'CDFCCCFCCCFDC'],
    ['CDFFFFFFFFFDC', '  F   F   F  ', '  X   H   X  ', '  F   F   F  ', 'CDFFFFFFFFFDC'],
    ['CDFCCCFCCCFDC', '             ', '             ', '             ', 'CDFCCCFCCCFDC'],
    ['CDFCCCFCCCFDC', 'CCF       FCC', 'CCX       XCC', 'CCF       FCC', 'CDFCCCFCCCFDC'],
    [' DCCCCFCCCCD ', ' EE       EE ', ' EE       EE ', ' EE       EE ', ' DCCCCFCCCCD '],
    [' DDCFFFFFCDD ', ' EDEF F FEDE ', ' EDEF @ FEDE ', ' EDEF F FEDE ', ' DDCFFFFFCDD '],
    ['  DDDDDDDDD  ', '  EEC   CEE  ', '  EEC   CEE  ', '  EEC   CEE  ', '  DDDDDDDDD  '],
    ['    CCCCC    ', '    C   C    ', '    C   C    ', '    C   C    ', '    CCCCC    ']
  ]

  var S = null
  var classes = null

  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 3000) }
  // details never start with FAIL / ERROR: the harness treats a pipe-delimited FAIL or ERROR field as a failure
  function emit(name, status, detail) {
    var line = TAG + SCOPE + '|' + name + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }
  function check(name, ok, detail) { emit(name, ok ? 'PASS' : 'FAIL', detail) }
  function note(name, detail) { emit(name, 'NOTE', detail) }

  function lazy() {
    if (classes === null) {
      classes = {
        ArrayList: Java.loadClass('java.util.ArrayList'),
        MetaMachine: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
        RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
        ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
        FluidStack: Java.loadClass('net.minecraftforge.fluids.FluidStack'),
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
  function rl(id) { return new ResourceLocation(id) }
  function short(id) { return String(id).replace(/^(gtceu|grindless|extendedfeatures|minecraft):/, '') }
  function at(p) { return p.x + ',' + p.y + ',' + p.z }
  function machineAt(p) { return lazy().MetaMachine.getMachine(S.level, new BlockPos(p.x, p.y, p.z)) }
  function blockIdAt(x, y, z) { return String(S.level.getBlock(x, y, z).getId()) }
  function setBlock(x, y, z, id, props) {
    return S.server.runCommandSilent('setblock ' + x + ' ' + y + ' ' + z + ' ' + id + (props || '') + ' replace')
  }
  function itemName(st) { return String(lazy().Registries.ITEMS.getKey(st.getItem())) }
  function fluidName(st) { return String(lazy().Registries.FLUIDS.getKey(st.getFluid())) }

  function liveRecipe(id) {
    var found = S.server.getRecipeManager().byKey(rl(id))
    return found.isPresent() ? found.get() : null
  }
  // inputs of a GT recipe (a tag shows its first item): [{id, count}] / [{id, amount}]
  function gtItemsIn(recipe) {
    return asArray(lazy().RecipeHelper.getInputItems(recipe)).map(function (st) { return { id: itemName(st), count: Number(st.getCount()) } })
  }
  function gtFluidsIn(recipe) {
    return asArray(lazy().RecipeHelper.getInputFluids(recipe)).map(function (st) { return { id: fluidName(st), amount: Number(st.getAmount()) } })
  }
  function gtItemsOut(recipe) {
    return asArray(lazy().RecipeHelper.getOutputItems(recipe)).map(function (st) { return itemName(st) })
  }
  function eutOf(recipe) {
    var io = lazy().RecipeHelper.getRealEUtWithIO(recipe)
    return io.isEmpty() ? 0 : Number(io.getTotalEU())
  }

  function readBus(bus) {
    var inv = bus.getInventory()
    var counts = {}
    for (var i = 0; i < inv.getSlots(); i++) {
      var st = inv.getStackInSlot(i)
      if (st.isEmpty()) continue
      counts[itemName(st)] = (counts[itemName(st)] || 0) + Number(st.getCount())
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

  function statusOf(ctrl) { return String(ctrl.getRecipeLogic().getStatus()) }
  function wake(ctrl) {
    try { ctrl.getRecipeLogic().updateTickSubscription() } catch (e) { /* the scenario reports what did not run */ }
  }
  function lastId(ctrl) {
    var last = ctrl.getRecipeLogic().getLastRecipe()
    return last === null || last === undefined ? 'none' : String(last.id)
  }
  function state(ctrl) {
    try {
      var r = ctrl.getRecipeLogic()
      return 'status=' + r.getStatus() + ' progress=' + r.getProgress() + '/' + r.getDuration() + ' last=' + lastId(ctrl)
    } catch (e) { return 'state unreadable: ' + e }
  }
  function reasons(ctrl) {
    try {
      return asArray(ctrl.getRecipeLogic().getFailureReasons()).map(function (c) { return String(c.getString()) }).join(' ; ')
    } catch (e) { return 'unreadable: ' + e }
  }
  function describeError(ctrl) {
    try {
      var err = ctrl.getMultiblockState().error
      if (err === null || err === undefined) return 'no pattern error recorded'
      var pos = err.getPos()
      return 'pattern error ' + String(err) + ' at ' + pos.getX() + ',' + pos.getY() + ',' + pos.getZ() + ' found ' + blockIdAt(pos.getX(), pos.getY(), pos.getZ())
    } catch (e) { return 'could not read the pattern error: ' + e }
  }
  function topUp(m) {
    if (!m.P || !m.P.energy) return
    var c = m.P.energy.energyContainer
    c.setEnergyStored(c.getEnergyCapacity())
  }

  // ---------------------------------------------------------------- plans

  function cell(x, y, z, id, props, role) { return { x: x, y: y, z: z, id: id, props: props || '', role: role || null } }

  // GTM's line (start(BACK, UP, RIGHT)): slice a at x + a, rows bottom -> top "FIF","RTR","SAG","#Y#", chars south
  function ctlCells() {
    var cells = []
    for (var a = 0; a < CTL_SLICES; a++) {
      var x = CTL.x + a
      var last = a === CTL_SLICES - 1
      var fluid = a < 2
      cells.push(cell(x, CTL.y - 2, CTL.z, fluid ? B.fluid : B.casing, fluid ? '[facing=down]' : '', fluid ? 'fluid' + a : null))
      cells.push(cell(x, CTL.y - 2, CTL.z + 1, last ? B.outBus : B.bus, '[facing=down]', last ? 'out' : 'bus' + a))
      cells.push(cell(x, CTL.y - 2, CTL.z + 2, B.casing))
      cells.push(cell(x, CTL.y - 1, CTL.z, B.glass))
      cells.push(cell(x, CTL.y - 1, CTL.z + 1, B.unit))
      cells.push(cell(x, CTL.y - 1, CTL.z + 2, B.glass))
      if (a === 0) cells.push(cell(x, CTL.y, CTL.z, B.ctl, '[facing=north]', 'controller'))
      else if (last) cells.push(cell(x, CTL.y, CTL.z, B.data, '[facing=north]', 'data'))
      else cells.push(cell(x, CTL.y, CTL.z, B.grating))
      cells.push(cell(x, CTL.y, CTL.z + 1, B.control))
      cells.push(cell(x, CTL.y, CTL.z + 2, B.grating))
      cells.push(cell(x, CTL.y + 1, CTL.z + 1, a === 0 ? B.energy : B.casing, a === 0 ? '[facing=up]' : '', a === 0 ? 'energy' : null))
    }
    return cells
  }

  // the Expanded line (start(RIGHT, UP, BACK)): rows bottom -> top "EE@EE"/"EEDEE"/"EENEE", "RLKLR", "HHEHH"; slices go south
  function ealCells() {
    var cells = []
    var cx = EAL.cx
    for (var a = 0; a < EAL.slices; a++) {
      var z = EAL.z0 + a
      var first = a === 0
      var last = a === EAL.slices - 1
      for (var dx = -2; dx <= 2; dx++) {
        var x = cx + dx
        var bottom
        if (dx === 0) {
          if (first) bottom = cell(x, EAL.y0, z, B.eal, '[facing=north]', 'controller')
          else if (last) bottom = cell(x, EAL.y0, z, B.outBus, '[facing=down]', 'out')
          else bottom = cell(x, EAL.y0, z, B.bus, '[facing=down]', 'bus' + (a - 1))
        } else if (a === 1 && dx === -1) bottom = cell(x, EAL.y0, z, B.fluid, '[facing=down]', 'fluid0')
        else if (a === 2 && dx === -1) bottom = cell(x, EAL.y0, z, B.fluid, '[facing=down]', 'fluid1')
        else if (a === 1 && dx === 1) bottom = cell(x, EAL.y0, z, B.recv, '[facing=down]', 'recv')
        else bottom = cell(x, EAL.y0, z, B.casing)
        cells.push(bottom)
        var mid = Math.abs(dx) === 2 ? B.glass : (dx === 0 ? B.unit : B.control)
        cells.push(cell(x, EAL.y0 + 1, z, mid))
        if (dx === 0) cells.push(first ? cell(x, EAL.y0 + 2, z, B.energy, '[facing=up]', 'energy') : cell(x, EAL.y0 + 2, z, B.casing))
        else cells.push(cell(x, EAL.y0 + 2, z, B.grating))
      }
    }
    return cells
  }

  function mdrCells() {
    var cells = []
    var data = 0
    MDR_AISLES.forEach(function (aisle, a) {
      aisle.forEach(function (str, r) {
        for (var c = 0; c < str.length; c++) {
          var ch = str.charAt(c)
          if (ch === ' ') continue
          var x = MDR.cx + c - 6
          var y = MDR.cy + r - 2
          var z = MDR.cz + a - 10
          if (ch === '@') cells.push(cell(x, y, z, B.mdr, '[facing=north]', 'controller'))
          else if (ch === 'H') cells.push(cell(x, y, z, B.tx, '[facing=north]', 'tx'))
          else if (ch === 'X') {
            cells.push(cell(x, y, z, B.data, '[facing=north]', 'data' + data))
            data++
          } else cells.push(cell(x, y, z, ch === 'C' ? B.cc : ch === 'D' ? B.acc : ch === 'E' ? B.glass : B.hp))
        }
      })
    })
    return cells
  }

  // places the cells (the controller last) and checks every block
  function place(m, cells) {
    var failed = []
    var ctrlCell = null
    m.roles = {}
    cells.forEach(function (c) {
      if (c.role === 'controller') { ctrlCell = c; return }
      if (c.role) m.roles[at(c)] = c.role
      if (setBlock(c.x, c.y, c.z, c.id, c.props) < 1) failed.push(at(c) + ' ' + c.id)
    })
    if (ctrlCell === null || setBlock(ctrlCell.x, ctrlCell.y, ctrlCell.z, ctrlCell.id, ctrlCell.props) < 1) failed.push('controller')
    m.ctrlPos = ctrlCell === null ? null : { x: ctrlCell.x, y: ctrlCell.y, z: ctrlCell.z }
    var wrong = []
    cells.forEach(function (c) {
      var got = blockIdAt(c.x, c.y, c.z)
      if (got !== c.id) wrong.push(at(c) + ' wanted ' + c.id + ' got ' + got)
    })
    var ok = failed.length === 0 && wrong.length === 0
    check(m.key + '_PLACED', ok, cells.length + ' blocks, controller ' + (m.ctrlPos ? at(m.ctrlPos) : 'none') +
      (failed.length > 0 ? ' setblock failed: ' + failed.slice(0, 5).join('; ') : '') + (wrong.length > 0 ? ' wrong blocks: ' + wrong.slice(0, 5).join('; ') : ''))
    return ok
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

  // waits for the controller to form (GTM checks the pattern asynchronously), forces one synchronous check after FORM_TIMEOUT
  function formStep(m) {
    var waited = S.t - m.t0
    var ctrl = machineAt(m.ctrlPos)
    if (ctrl === null || ctrl === undefined) {
      check(m.key + '_FORMED', false, 'no machine at ' + at(m.ctrlPos))
      m.phase = 'done'
      return false
    }
    if (ctrl.isFormed()) {
      check(m.key + '_FORMED', true, (m.forced ? 'after a forced check' : 'by itself after ' + waited + ' ticks') + ', class=' +
        String(ctrl.getClass().getSimpleName()) + ' parts=' + asArray(ctrl.getParts()).length)
      m.ctrl = ctrl
      return true
    }
    if (waited >= FORM_TIMEOUT && !m.forced) {
      if (!ctrl.checkPatternWithLock()) {
        check(m.key + '_FORMED', false, 'not formed after ' + waited + ' ticks: ' + describeError(ctrl))
        m.phase = 'done'
        return false
      }
      check(m.key + '_FORMED', false, 'the async check never formed it in ' + waited + ' ticks, a synchronous check passes (forcing it)')
      ctrl.setFlipped(ctrl.getMultiblockState().isNeededFlip())
      ctrl.onStructureFormed()
      m.forced = true
    } else if (waited >= 2 * FORM_TIMEOUT) {
      check(m.key + '_FORMED', false, 'still not formed after a forced check')
      m.phase = 'done'
    }
    return false
  }

  // ---------------------------------------------------------------- loading a recipe

  // the recipe's item inputs in recipe order, the k-th into bus (order[k]); its fluids in order into hatches 0, 1
  function load(m, rec, order) {
    var P = m.P
    for (var i = 0; i < 6; i++) if (P['bus' + i]) emptyBus(P['bus' + i])
    for (var f = 0; f < 2; f++) if (P['fluid' + f]) setTank(P['fluid' + f], 'minecraft:water', 0)
    rec.items.forEach(function (x, k) { insert(P['bus' + order[k]], x.id, x.count) })
    rec.fluids.forEach(function (x, k) { setTank(P['fluid' + k], x.id, x.amount) })
  }
  function inOrder(n) { var o = []; for (var i = 0; i < n; i++) o.push(i); return o }
  function reversed(n) { var o = []; for (var i = 0; i < n; i++) o.push(n - 1 - i); return o }
  function recipeInputs(id) {
    var r = liveRecipe(id)
    if (r === null) throw new Error('no live recipe ' + id)
    return { items: gtItemsIn(r), fluids: gtFluidsIn(r), outs: gtItemsOut(r), eut: eutOf(r), duration: Number(r.duration) }
  }

  function researchStick() {
    return Item.of('gtceu:data_stick', '{assembly_line_research:{research_id:"' + RESEARCH_ID + '",research_type:"gtceu:assembly_line"}}')
  }
  function stickIntoHatch(hatch) {
    var RM = Java.loadClass('com.gregtechceu.gtceu.utils.ResearchManager')
    var stick = researchStick()
    var rest = hatch.importItems.insertItem(0, stick.copy(), false)
    var how = 'taken by the handler'
    if (!rest.isEmpty()) {
      hatch.importItems.storage.setStackInSlot(0, stick.copy())
      how = 'put into its storage (the handler refused it)'
    }
    var held = hatch.importItems.getStackInSlot(0)
    return { ok: !held.isEmpty() && RM.readResearchId(held) !== null, detail: how }
  }

  function busSummary(m) {
    var out = []
    for (var i = 0; i < 6; i++) {
      var b = m.P['bus' + i]
      if (!b) continue
      var c = readBus(b)
      var keys = Object.keys(c)
      out.push('bus' + i + '=' + (keys.length === 0 ? 'empty' : keys.map(function (k) { return short(k) + ' x' + c[k] }).join('+')))
    }
    return out.join(' ')
  }

  function outputCount(m, id) {
    var c = readBus(m.P.out)
    return c[id] || 0
  }

  // ---------------------------------------------------------------- scenarios

  function scenario(key) {
    return { key: key, phase: 'forming', t0: S.t, ctrl: null, P: null, forced: false, roles: {}, ctrlPos: null }
  }

  function startRun(m, id, order) {
    var rec = recipeInputs(id)
    load(m, rec, order)
    m.rec = rec
    m.runId = id
    m.t0 = S.t
    wake(m.ctrl)
  }

  function working(m) { return statusOf(m.ctrl) === 'WORKING' }

  function ctlStep(m, age) {
    if (m.phase === 'formed') {
      m.P = findParts(m, m.ctrl)
      var missing = ['bus0', 'bus1', 'bus2', 'bus3', 'bus4', 'fluid0', 'fluid1', 'energy', 'data', 'out'].filter(function (r) { return !m.P[r] })
      check('ctl_PARTS', missing.length === 0, '[' + m.P.ids.join(' ') + ']' + (missing.length > 0 ? ' missing: ' + missing.join(', ') : ''))
      if (missing.length > 0) { m.phase = 'done'; return }
      topUp(m)
      startRun(m, DYNAMO, reversed(5))
      m.phase = 'refusing'
      return
    }
    topUp(m)
    if (m.phase === 'refusing') {
      if (working(m)) {
        check('ctl_REFUSES_WRONG_ORDER', false, 'the normal line started ' + lastId(m.ctrl) + ' with reversed inputs | ' + busSummary(m))
        m.phase = 'done'
      } else if (age >= REFUSE_TICKS) {
        check('ctl_REFUSES_WRONG_ORDER', true, 'idle for ' + age + ' ticks with the inputs of ' + short(DYNAMO) + ' in reverse bus order | ' + state(m.ctrl) + ' | ' + busSummary(m))
        startRun(m, DYNAMO, inOrder(5))
        m.phase = 'ordered'
      }
      return
    }
    if (m.phase === 'ordered') {
      if (working(m)) {
        check('ctl_RUNS_RIGHT_ORDER', lastId(m.ctrl) === DYNAMO, 'started ' + lastId(m.ctrl) + ' ' + age + ' ticks after the same inputs went into recipe order')
        m.phase = 'done'
      } else if (age >= START_TIMEOUT) {
        check('ctl_RUNS_RIGHT_ORDER', false, 'did not start in ' + age + ' ticks | ' + state(m.ctrl) + ' | reasons=[' + reasons(m.ctrl) + '] | ' + busSummary(m))
        m.phase = 'done'
      }
    }
  }

  function mdrStep(m) {
    if (m.phase === 'formed') {
      m.P = findParts(m, m.ctrl)
      var missing = ['tx', 'data0', 'data1'].filter(function (r) { return !m.P[r] })
      check('mdr_PARTS', missing.length === 0, '[' + m.P.ids.join(' ') + ']' + (missing.length > 0 ? ' missing: ' + missing.join(', ') : ''))
      m.phase = missing.length > 0 ? 'done' : 'ready'
    }
  }

  function scan(m, eal) {
    var FPF = Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory')
    var GP = Java.loadClass('com.mojang.authlib.GameProfile')
    var UUID = Java.loadClass('java.util.UUID')
    var fp = FPF.get(S.level, new GP(UUID.randomUUID(), 'gg_test_scan'))
    m.P.tx.handleScanRequest(fp)
    return { data: asArray(m.P.tx.getLinkedDataHatchPositions()).length, recv: asArray(m.P.tx.getLinkedReceptorPositions()).length,
      eal: eal.P.recv.isLinked() }
  }

  function ealStep(m, age) {
    var mdr = S.byKey.mdr
    if (m.phase === 'formed') {
      m.P = findParts(m, m.ctrl)
      var missing = ['bus0', 'bus1', 'bus2', 'bus3', 'bus4', 'fluid0', 'fluid1', 'energy', 'recv', 'out'].filter(function (r) { return !m.P[r] })
      check('eal_PARTS', missing.length === 0, '[' + m.P.ids.join(' ') + ']' + (missing.length > 0 ? ' missing: ' + missing.join(', ') : ''))
      if (missing.length > 0) { m.phase = 'done'; return }
      topUp(m)
      startRun(m, DYNAMO, reversed(5))
      m.phase = 'wrong'
      return
    }
    topUp(m)
    if (m.phase === 'wrong') {
      if (working(m)) {
        var ran = lastId(m.ctrl)
        check('eal_RUNS_WRONG_ORDER_start', ran === DYNAMO, 'started ' + ran + ' ' + age + ' ticks after the inputs went into reverse bus order | ' + busSummary(m))
        m.phase = 'wrongRun'
        m.t1 = S.t
      } else if (age >= START_TIMEOUT) {
        check('eal_RUNS_WRONG_ORDER_start', false, 'did not start in ' + age + ' ticks | ' + state(m.ctrl) + ' | reasons=[' + reasons(m.ctrl) + '] | ' + busSummary(m))
        m.phase = 'done'
      }
      return
    }
    if (m.phase === 'wrongRun') {
      var got = outputCount(m, DYNAMO_OUT)
      if (got >= 1) {
        check('eal_RUNS_WRONG_ORDER', true, got + ' ' + short(DYNAMO_OUT) + ' in the output bus ' + (S.t - m.t1) + ' ticks after the start (recipe ' + m.rec.eut + ' EU/t x ' + m.rec.duration + ' t)')
        emptyBus(m.P.out)
        m.phase = 'blocked'
        startRun(m, RESEARCH_RECIPE, inOrder(5))
      } else if (S.t - m.t1 >= m.rec.duration + RUN_SLACK) {
        check('eal_RUNS_WRONG_ORDER', false, 'no output after ' + (S.t - m.t1) + ' ticks | ' + state(m.ctrl))
        m.phase = 'done'
      }
      return
    }
    if (m.phase === 'blocked') {
      if (working(m)) {
        check('eal_RESEARCH_BLOCKED', false, 'the research recipe started without any data: ' + lastId(m.ctrl))
        m.phase = 'done'
      } else if (age >= REFUSE_TICKS) {
        check('eal_RESEARCH_BLOCKED', true, short(RESEARCH_RECIPE) + ' did not start in ' + age + ' ticks with no data path | ' + state(m.ctrl) + ' | reasons=[' + reasons(m.ctrl) + ']')
        m.phase = 'waitMdr'
      }
      return
    }
    if (m.phase === 'waitMdr') {
      if (mdr.phase === 'ready') m.phase = 'link'
      else if (mdr.phase === 'done') { check('eal_RESEARCH_LINK', false, 'the relay did not form'); m.phase = 'done' }
      return
    }
    if (m.phase === 'link') {
      var st = stickIntoHatch(mdr.P.data0)
      var res = null
      var err = null
      try { res = scan(mdr, m) } catch (e) { err = String(e) }
      var linkOk = res !== null && res.data >= 1 && res.recv >= 1 && res.eal === true
      check('eal_RESEARCH_LINK', st.ok && linkOk, 'research stick in the relay\'s data access hatch: ' + st.ok + ' (' + st.detail + '); the transmissor\'s scan linked ' +
        (res === null ? 'nothing (' + err + ')' : res.data + ' data access hatch(es) and ' + res.recv + ' receptor(s); the line\'s receptor is linked: ' + res.eal))
      if (!st.ok || !linkOk) { m.phase = 'done'; return }
      m.phase = 'research'
      m.t0 = S.t
      wake(m.ctrl)
      return
    }
    if (m.phase === 'research') {
      if (working(m)) {
        check('eal_RUNS_RESEARCH_start', lastId(m.ctrl) === RESEARCH_RECIPE, 'started ' + lastId(m.ctrl) + ' ' + age + ' ticks after the link')
        m.phase = 'researchRun'
        m.t1 = S.t
      } else if (age >= START_TIMEOUT) {
        check('eal_RUNS_RESEARCH_start', false, 'did not start in ' + age + ' ticks after the link | ' + state(m.ctrl) + ' | reasons=[' + reasons(m.ctrl) + '] | ' + busSummary(m))
        m.phase = 'done'
      }
      return
    }
    if (m.phase === 'researchRun') {
      var made = outputCount(m, RESEARCH_OUT)
      if (made >= 1) {
        check('eal_RUNS_RESEARCH', true, made + ' ' + short(RESEARCH_OUT) + ' in the output bus ' + (S.t - m.t1) + ' ticks after the start (recipe ' + m.rec.eut + ' EU/t x ' + m.rec.duration + ' t)')
        m.phase = 'done'
      } else if (S.t - m.t1 >= m.rec.duration + RUN_SLACK) {
        check('eal_RUNS_RESEARCH', false, 'no output after ' + (S.t - m.t1) + ' ticks | ' + state(m.ctrl))
        m.phase = 'done'
      }
    }
  }

  function step(m) {
    if (m.phase === 'forming') {
      if (S.t % STEP !== 0) return
      if (formStep(m)) m.phase = 'formed'
      else return
    }
    if (m.phase === 'done') return
    var age = S.t - m.t0
    if (m.key === 'ctl') ctlStep(m, age)
    else if (m.key === 'eal') ealStep(m, age)
    else mdrStep(m)
  }

  // ---------------------------------------------------------------- static checks

  function staticChecks() {
    Object.keys(PART_RECIPES).forEach(function (id) {
      var out = PART_RECIPES[id]
      var r = liveRecipe(id)
      if (r === null) { check('static_' + short(out), false, 'no live recipe ' + id); return }
      var ins = gtItemsIn(r).map(function (x) { return x.id + ' x' + x.count })
      var outs = gtItemsOut(r)
      var ok = outs.indexOf(out) >= 0 && eutOf(r) === LUV_EUT && String(r.recipeType.toString()).indexOf('assembly_line') >= 0
      if (out === B.eal) ok = ok && ins.indexOf('gtceu:assembly_line x1') >= 0
      check('static_' + short(out), ok, id + ' ' + eutOf(r) + ' EU/t x ' + Number(r.duration) + ' t, type ' + r.recipeType + ', in [' + ins.join(', ') + '] out [' + outs.join(', ') + ']')
    })
    var crafting = 0
    Object.keys(PART_RECIPES).forEach(function (id) {
      S.server.getRecipeManager().getAllRecipesFor(Java.loadClass('net.minecraft.world.item.crafting.RecipeType').CRAFTING).forEach(function (r) {
        if (String(r.getResultItem(S.server.registryAccess()).getItem().builtInRegistryHolder().key().location()) === PART_RECIPES[id]) crafting++
      })
    })
    check('static_no_crafting_table', crafting === 0, crafting + ' crafting-table recipes make the four parts')
  }

  // ---------------------------------------------------------------- run

  function prepareWorld() {
    for (var cx = BAND.x0 >> 4; cx <= BAND.x1 >> 4; cx++) {
      for (var cz = 0; cz <= 2; cz++) S.level.getChunk(cx, cz)
    }
    S.server.runCommandSilent('forceload add ' + BAND.x0 + ' 0 ' + BAND.x1 + ' 47')
    S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + BAND.y0 + ' 0 ' + BAND.x1 + ' ' + BAND.y1 + ' 47 air')
    S.server.runCommandSilent('fill ' + BAND.x0 + ' ' + ROOF_Y + ' 0 ' + BAND.x1 + ' ' + ROOF_Y + ' 47 minecraft:smooth_stone')
    note('AREA', 'band X ' + BAND.x0 + '-' + BAND.x1 + ' Z 0-47 loaded and cleared, roof at Y ' + ROOF_Y)
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
        step(m)
      } catch (e) {
        check(m.key + '_STEP', false, 'exception in ' + m.phase + ': ' + e)
        m.phase = 'done'
      }
    })
    var eal = S.byKey.eal
    // the relay waits for the Expanded line's research run; it ends with it
    if (eal.phase === 'done' && S.byKey.mdr.phase === 'ready') S.byKey.mdr.phase = 'done'
    if (S.ms.every(function (m) { return m.phase === 'done' })) finish()
  }

  function run(server) {
    S = { server: server, level: server.overworld(), t: 0, tick0: server.getTickCount(), ms: [], byKey: {}, finished: false }
    try { staticChecks() } catch (e) { check('static', false, 'exception: ' + e) }
    try { prepareWorld() } catch (e2) { check('AREA', false, 'exception: ' + e2) }
    var plans = [['ctl', ctlCells], ['eal', ealCells], ['mdr', mdrCells]]
    plans.forEach(function (p) {
      var m = scenario(p[0])
      S.ms.push(m)
      S.byKey[p[0]] = m
      try {
        if (!place(m, p[1]())) m.phase = 'done'
      } catch (e3) {
        check(p[0] + '_PLACED', false, 'exception: ' + e3)
        m.phase = 'done'
      }
    })
    if (S.ms.every(function (m) { return m.phase === 'done' })) finish()
  }

  ServerEvents.tick(function (event) {
    if (global[REQUEST] === true && (S === null || S.finished) && Date.now() - LOADED_AT >= QUIET_MS) {
      global[REQUEST] = false
      try { run(event.server) } catch (e) { check('run', false, 'exception: ' + e); finish() }
    }
    onTick(event.server)
  })

  ServerEvents.customCommand('gg_test_expanded_assembly_line', function (event) {
    if (S !== null && !S.finished) {
      note('run', 'a previous gg_test_expanded_assembly_line run is still in progress')
      return 0
    }
    global[REQUEST] = true
    return 1
  })
})()
