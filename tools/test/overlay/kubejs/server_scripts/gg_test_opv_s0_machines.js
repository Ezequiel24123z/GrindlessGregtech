// priority: -6254
// TEST ONLY, OpV-S0 (bench overlay, never shipped; needs the startup overlay on: kubejs/config/gg_test_opv_s0.json {"enabled": true}).
// Command: kubejs custom_command gg_test_opv_s0_machines. Band ONLY: X 37376-37439, Z 0-63, Overworld Y 70-100. Everything placed is cleared before DONE.
//   s0_2_*   gtceu:warp_gate on two gtceu:opv_energy_input_hatch_16a runs a recipe at 2^33 EU/t (a long) for 1,200 ticks; per-tick draw, wrap, tier shown
//   s0_5_*   a tier 13 ParallelHatchPartMachine (gtceu:gg_opv_s0_parallel_hatch) in gtceu:gg_opv_s0_frame: copies and EU/t of a light probe (one OpV 2 A hatch)
//            and of a heavy probe (two OpV 16 A hatches)
//   s0_7_*   a run of gg_opv_s0_chain_strand cable between an OpV 16 A dynamo hatch and an OpV 16 A input hatch: per-tick flow against 2^33
//   s0_10_*  gtceu:gg_opv_s0_assembly_array (GTM's AssemblyLineMachine class): ordered inputs and research with the tier 13 parallel hatch
//   s0_11_*  gtceu:gg_opv_s0_gen_frame: a generation recipe scaled by the parallel hatch's copies, bounded by the input items in the bus
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 37376
  var X1 = 37439
  var Y0 = 70
  var Y1 = 100
  var NAME = 'opv_s0_machines'
  var REQUEST = 'ggTestOpvS0MachinesRequest'
  var OPV = 13
  var HATCH16 = 'gtceu:opv_energy_input_hatch_16a'
  var HATCH2 = 'gtceu:opv_energy_input_hatch'
  var DYNAMO16 = 'gtceu:opv_energy_output_hatch_16a'
  var PARALLEL = 'gtceu:opv_gg_opv_s0_parallel_hatch'
  var FRAME = 'gtceu:gg_opv_s0_frame'
  var ARRAY = 'gtceu:gg_opv_s0_assembly_array'
  var GEN = 'gtceu:gg_opv_s0_gen_frame'
  var GATE = 'gtceu:warp_gate'
  var CABLE = 'gtceu:gg_opv_s0_chain_strand_single_cable'
  var DANDELION = 'minecraft:dandelion'
  var POPPY = 'minecraft:poppy'
  var GATE_EUT = '8589934592'
  var GATE_TICKS = 1200
  var GEN_EUT = 67108864
  var RESEARCH_ID = 'gg_opv_s0_research'
  var ORDER_ITEMS = ['minecraft:dandelion', 'minecraft:poppy', 'minecraft:azure_bluet']
  var RESEARCH_ITEMS = ['minecraft:cornflower', 'minecraft:allium', 'minecraft:oxeye_daisy']

  var marker = JsonIO.read('kubejs/config/gg_test_opv_s0.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'

  ServerEvents.recipes(function (event) {
    if (!ON) return
    var Long = Java.loadClass('java.lang.Long')
    try {
      event.recipes.gtceu.macerator('gg_test_opv_s0:ph_light').notConsumable('1x ' + DANDELION).EUt(2048).duration(40)
      event.recipes.gtceu.macerator('gg_test_opv_s0:ph_heavy').notConsumable('1x ' + POPPY).EUt(16384).duration(40)
    } catch (e) { console.error('[gg_test opv_s0] could not add the macerator probes: ' + errText(e)) }
    try {
      event.recipes.gtceu.warp_gate('gg_test_opv_s0:warp_gate/s0_probe').notConsumable('1x ' + DANDELION).itemOutputs('1x ' + POPPY).EUt(Long.valueOf(GATE_EUT)).duration(GATE_TICKS)
    } catch (e) { console.error('[gg_test opv_s0] could not add the warp gate probe: ' + errText(e)) }
    try {
      event.recipes.gtceu.macerator('gg_test_opv_s0:gen_probe').itemInputs('1x minecraft:iron_nugget').EUt(-GEN_EUT).duration(200)
    } catch (e) { console.error('[gg_test opv_s0] could not add the generator probe: ' + errText(e)) }
    try {
      var o = ORDER_ITEMS
      event.recipes.gtceu.assembly_line('gg_test_opv_s0:array_ordered').notConsumable('1x ' + o[0]).notConsumable('1x ' + o[1]).notConsumable('1x ' + o[2]).EUt(2048).duration(40)
      var r = RESEARCH_ITEMS
      event.recipes.gtceu.assembly_line('gg_test_opv_s0:array_research').notConsumable('1x ' + r[0]).notConsumable('1x ' + r[1]).notConsumable('1x ' + r[2]).EUt(2048).duration(40)
        .researchWithoutRecipe(RESEARCH_ID)
    } catch (e) { console.error('[gg_test opv_s0] could not add the array probes: ' + errText(e)) }
  })

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      FU: Java.loadClass('com.gregtechceu.gtceu.utils.FormattingUtil'),
      GTUtil: Java.loadClass('com.gregtechceu.gtceu.utils.GTUtil'),
      RM: Java.loadClass('com.gregtechceu.gtceu.utils.ResearchManager')
    }
    return C
  }
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function errText(e) {
    var s = ''
    try { s = String(e.message || '') } catch (x) { }
    try { s += ' @' + String(e.stack || '').split('\n').slice(0, 4).join(' ') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + clean(detail)) }
  function command(text) { return S.server.runCommandSilent('execute in minecraft:overworld run ' + text) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= 0 && z <= 63 && y >= Y0 && y <= Y1 }
  function put(x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return command('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function machine(p) { return classes().Meta.getMachine(S.level, p) }
  function partsLike(ctrl, re) {
    var out = []
    array(ctrl.getParts()).forEach(function (p) { if (re.test(String(p.getDefinition().getId()))) out.push(p) })
    return out
  }
  function topUp(list) { list.forEach(function (p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) }) }
  function drainOf(list) {
    var n = 0
    list.forEach(function (p) { var c = p.energyContainer; n += Number(c.getEnergyCapacity()) - Number(c.getEnergyStored()) })
    return n
  }
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) {
    try {
      var err = m.getMultiblockState().error
      var p = err.getPos()
      return String(err.getErrorInfo().getString()) + ' at ' + (p ? p.getX() + ',' + p.getY() + ',' + p.getZ() : '?')
    } catch (e) { return 'unknown ' + e }
  }
  function partIds(ctrl) {
    var out = {}
    array(ctrl.getParts()).forEach(function (p) { var k = String(p.getDefinition().getId()); out[k] = (out[k] || 0) + 1 })
    return JSON.stringify(out)
  }
  function snapshot(m) {
    var rec = m.getRecipeLogic().getLastRecipe()
    if (rec === null || rec === undefined) return null
    var eut = NaN
    try { eut = Number(classes().RecipeHelper.getRealEUtWithIO(rec).getTotalEU()) } catch (e) { }
    var par = NaN
    try { par = Number(rec.parallels) } catch (e) { }
    return { duration: Number(rec.duration), eut: eut, id: String(rec.id), parallels: par }
  }
  function status(m) { return String(m.getRecipeLogic().getStatus()) }
  function reasons(m) { return String(m.getRecipeLogic().getFailureReasons()) }
  function setSlots(p, list) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    list.forEach(function (e, i) { st.setStackInSlot(i, Item.of(e[0], e[1])) })
  }
  function setBus(p, id) { setSlots(p, id ? [[id, 1]] : []) }
  function countIn(p, id) {
    var st = p.getInventory().storage
    var n = 0
    for (var i = 0; i < st.getSlots(); i++) { var s = st.getStackInSlot(i); if (String(s.getId()) === id) n += Number(s.getCount()) }
    return n
  }
  function allows(sym, ability) {
    return sym.kind === 'oneOf' && sym.options.some(function (o) { return o.kind === 'part' && o.ability === ability })
  }

  var DEFAULT_PART = { energy_input: 'gtceu:mv_energy_input_hatch', input_bus: 'gtceu:hv_input_bus', output_bus: 'gtceu:hv_output_bus',
    input_hatch: 'gtceu:hv_input_hatch', output_hatch: 'gtceu:hv_output_hatch', energy_output: 'gtceu:hv_energy_output_hatch', data_access: 'gtceu:data_access_hatch' }
  // placement from the pattern description (lib/patterns.js); ov(cell) returns a block id to replace the default, or null; cell.front = the controller's slice
  function placeMachine(id, cx, cy, cz, ov) {
    var desc = global.grindless.patterns.describe(id)
    if (!desc) throw new Error('no structure description for ' + id)
    var cells = []
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
          cells.push({ si: si, ri: ri, ci: ci, ch: ch, sym: sym })
        }
      })
    })
    var controller = null
    var count = 0
    cells.forEach(function (c) {
      c.x = cx + (c.ci - ctrl.ci)
      c.y = cy + (c.ri - ctrl.ri)
      c.z = cz - (c.si - ctrl.si)
      c.front = c.si === ctrl.si
    })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = ov ? ov(c) : null
      if (!block) {
        if (sym.kind === 'controller') block = id
        else if (sym.kind === 'blocks') block = sym.blocks[0]
        else if (sym.kind === 'frames') block = 'gtceu:' + sym.materials[0] + '_frame'
        else if (sym.kind === 'part') block = DEFAULT_PART[sym.ability]
        else if (sym.kind === 'oneOf') {
          sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
        }
      }
      if (!block) return
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      var props = /hatch|bus/.test(block) ? '[facing=north]' : ''
      put(c.x, c.y, c.z, block + props)
      count++
    })
    put(controller.x, controller.y, controller.z, id + '[facing=north]')
    return { pos: pos(controller.x, controller.y, controller.z), blocks: count + 1 }
  }
  function placeCheck(u, placed) {
    u.pos = placed.pos
    u.phase = 'forming'
    u.started = S.tick
    note(u.name + '_placed', 'controller ' + placed.pos.getX() + ',' + placed.pos.getY() + ',' + placed.pos.getZ() + ', ' + placed.blocks + ' blocks')
  }
  function waitForm(u, m) {
    var waited = S.tick - u.started
    if (!m || !formCheck(m, waited)) {
      if (waited > 600) { check(u.name + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
      return false
    }
    return true
  }

  // ---------------------------------------------------------------- S0-2: the warp gate at 2^33 EU/t
  function gateBuild(u) {
    var step = 0
    placeCheck(u, placeMachine(GATE, 37414, 80, 47, function (c) {
      if (!c.front) return null
      if (step === 0 && allows(c.sym, 'input_bus')) { step++; return 'gtceu:uhv_input_bus' }
      if (step === 1 && allows(c.sym, 'output_bus')) { step++; return 'gtceu:uhv_output_bus' }
      if (step >= 2 && step < 4 && allows(c.sym, 'energy_input')) { step++; return HATCH16 }
      return null
    }))
  }
  function tierReadout(eut, rec) {
    var G = classes().GTUtil
    var out = []
    try { out.push('V[13]=' + GTValues.V[OPV] + ' VN=' + GTValues.VN[OPV] + ' VNF=' + GTValues.VNF[OPV] + ' V[14]=' + GTValues.V[14] + ' VN[14]=' + GTValues.VN[14]) } catch (e) { out.push('V: ' + e) }
    try { out.push('getTierByVoltage(2^33)=' + G.getTierByVoltage(Java.loadClass('java.lang.Long').valueOf(GATE_EUT))) } catch (e) { out.push('getTierByVoltage: ' + e) }
    try { out.push('getFloorTierByVoltage(2^33)=' + G.getFloorTierByVoltage(Java.loadClass('java.lang.Long').valueOf(GATE_EUT))) } catch (e) { out.push('getFloorTierByVoltage: ' + e) }
    try { out.push('getRecipeEUtTier=' + classes().RecipeHelper.getRecipeEUtTier(rec)) } catch (e) { out.push('getRecipeEUtTier: ' + e) }
    try { out.push('formatNumbers(EU/t)=' + classes().FU.formatNumbers(eut)) } catch (e) { out.push('formatNumbers: ' + e) }
    return out.join('; ')
  }
  function gateTick(u) {
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!waitForm(u, m)) return
      u.energy = partsLike(m, /opv_energy_input_hatch_16a/)
      u.bus = partsLike(m, /input_bus/)[0]
      u.out = partsLike(m, /output_bus/)[0]
      var ec = m.getEnergyContainer()
      var volt = NaN
      var amps = NaN
      try { volt = Number(ec.getInputVoltage()); amps = Number(ec.getInputAmperage()) } catch (x) { }
      check('s0_2_formed', u.energy.length === 2 && !!u.bus && !!u.out, 'class ' + m.getClass().getSimpleName() + ', OpV 16 A hatches ' + u.energy.length + ', list ' + volt + ' V x ' + amps + ' A, hatch buffer ' + u.energy[0].energyContainer.getEnergyCapacity() + ', parts ' + partIds(m))
      setBus(u.bus, DANDELION)
      topUp(u.energy)
      m.getRecipeLogic().updateTickSubscription()
      u.started = S.tick
      u.phase = 'start'
      return
    }
    // the draw of the tick that just ran, read before the hatches are refilled
    var drain = drainOf(u.energy)
    topUp(u.energy)
    var logic = m.getRecipeLogic()
    if (u.phase === 'start') {
      var last = logic.getLastRecipe()
      if (String(logic.getStatus()) === 'WORKING' && last && String(last.id).indexOf('s0_probe') >= 0) {
        var eut = NaN
        try { eut = Number(classes().RecipeHelper.getRealEUtWithIO(last).getTotalEU()) } catch (x) { }
        check('s0_2_eut_long', eut === 8589934592, 'recipe EU/t ' + eut + ' (expected 8,589,934,592 = 2^33; as an int it would read ' + (8589934592 | 0) + ')')
        check('s0_2_duration', Number(last.duration) === GATE_TICKS, 'recipe duration ' + last.duration + ' ticks')
        note('s0_2_tier', tierReadout(eut, last))
        u.runStart = S.tick
        u.sum = 0
        u.n = 0
        u.min = Infinity
        u.max = 0
        u.neg = 0
        u.phase = 'long'
      } else if (S.tick - u.started > 400) {
        var why1 = ''
        try { why1 = String(logic.getFancyTooltip()) } catch (x) { why1 = 'tooltip: ' + x }
        check('s0_2_starts', false, 'the probe did not start: status ' + logic.getStatus() + ', reasons ' + String(logic.getFailureReasons()) + ', ' + why1 + ', last ' + (last ? last.id : 'none'))
        u.phase = 'done'
      }
      return
    }
    if (u.phase === 'long') {
      var run = S.tick - u.runStart
      if (run > 1) {
        u.sum += drain
        u.n++
        if (drain < u.min) u.min = drain
        if (drain > u.max) u.max = drain
        if (drain < 0) u.neg++
      }
      if (run >= GATE_TICKS + 40) {
        var made = countIn(u.out, POPPY)
        var want = 8589934592
        check('s0_2_draw', u.neg === 0 && u.n > 0 && Math.abs(u.sum / u.n - want) < want * 0.01, 'per-tick draw over ' + u.n + ' ticks: avg ' + Math.round(u.sum / u.n) + ', min ' + u.min + ', max ' + u.max + ', negative samples ' + u.neg + ' (expected ' + want + '); total ' + u.sum + ' EU')
        check('s0_2_completes', made >= 1, 'the output bus holds ' + made + ' ' + POPPY + ' ' + run + ' ticks after the start (a 1,200 t recipe completed); status ' + status(m))
        u.phase = 'done'
      }
    }
  }

  // ---------------------------------------------------------------- S0-5: the tier 13 parallel hatch
  function frameBuild(u) {
    placeCheck(u, placeMachine(FRAME, u.cx, 75, 14, function (c) {
      if (c.ch === 'E') { u.eCount = u.eCount || 0; if (u.eCount >= u.hatches) return null; u.eCount++; return u.hatch }
      if (c.ch === 'P') return PARALLEL
      return null
    }))
  }
  function frameTick(u) {
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!waitForm(u, m)) return
      u.m = m
      u.energy = partsLike(m, /opv_energy_input_hatch/)
      u.bus = partsLike(m, /input_bus/)[0]
      var ph = m.getParallelHatch()
      var hatch = ph.isPresent() ? ph.get() : null
      var rep = hatch ? Number(hatch.getCurrentParallel()) : NaN
      var ec = m.getEnergyContainer()
      var volt = NaN
      try { volt = Number(ec.getInputVoltage()) } catch (x) { }
      check(u.name + '_formed', u.energy.length === u.hatches, 'class ' + m.getClass().getSimpleName() + ', OpV hatches ' + u.energy.length + ', list voltage ' + volt + ', parts ' + partIds(m))
      check(u.name + '_reports', rep === 262144, 'the tier 13 hatch reports ' + rep + ' (expected 262,144 = 4^9), formed in gtceu:gg_opv_s0_frame')
      topUp(u.energy)
      setBus(u.bus, u.item)
      u.volt = volt
      u.started = S.tick
      u.phase = 'run'
      return
    }
    topUp(u.energy)
    if (u.phase === 'run') {
      var snap = m.getRecipeLogic().isWorking() ? snapshot(m) : null
      if (snap !== null || S.tick - u.started > 300) {
        var V = Number(GTValues.V[OPV])
        note(u.name + '_measured', 'probe ' + u.eut + ' EU/t x ' + (snap ? snap.parallels : 'none') + ' copies = ' + (snap ? snap.parallels * u.eut : 'n/a') + ' EU/t expected, the recipe reads ' + (snap ? snap.eut : 'n/a') + '; V[13] ' + V + ', list voltage ' + u.volt + '; recipe ' + (snap ? snap.id : 'none') + '; reasons ' + reasons(m))
        var exact = snap !== null && snap.eut === snap.parallels * u.eut && snap.eut > 0
        check(u.name + '_no_wrap', exact, 'EU/t ' + (snap ? snap.eut : 'none') + ' equals copies x probe (' + (snap ? snap.parallels * u.eut : 'none') + '), positive')
        if (u.expect) check(u.name + '_copies', snap !== null && snap.parallels === u.expect, 'copies ' + (snap ? snap.parallels : 'none') + ' (expected ' + u.expect + ')')
        u.phase = 'done'
      }
    }
  }

  // ---------------------------------------------------------------- S0-7: the cable
  function cableBuild(u) {
    var x = 37420
    var z = 40
    put(x, 75, z, DYNAMO16 + '[facing=north]')
    for (var i = 1; i <= 3; i++) put(x, 75, z - i, CABLE)
    put(x, 75, z - 4, HATCH16 + '[facing=south]')
    u.src = pos(x, 75, z)
    u.wire = [pos(x, 75, z - 1), pos(x, 75, z - 2), pos(x, 75, z - 3)]
    u.sink = pos(x, 75, z - 4)
    // a setblock pipe has no connections: link each cable to its neighbours the way PipeBlockItem.placeBlock does
    try {
      var north = Direction.NORTH
      var south = Direction.SOUTH
      u.wire.forEach(function (p) {
        var be = S.level.getBlockEntity(p)
        be.setConnection(north, true, false)
        be.setConnection(south, true, false)
      })
    } catch (e) { check('s0_7_build', false, errText(e)) }
    u.phase = 'warm'
    u.started = S.tick
  }
  function cableTick(u) {
    var src = machine(u.src)
    var sink = machine(u.sink)
    if (!src || !sink) { check('s0_7_machines', false, 'hatches missing: source ' + !!src + ', sink ' + !!sink); u.phase = 'done'; return }
    var sc = src.energyContainer
    var kc = sink.energyContainer
    if (u.phase === 'warm') {
      if (S.tick - u.started === 1) {
        var V = Number(GTValues.V[OPV])
        check('s0_7_hatches', Number(sc.getOutputVoltage()) === V && Number(sc.getOutputAmperage()) === 16 && Number(kc.getInputAmperage()) === 16, 'dynamo ' + sc.getOutputVoltage() + ' V x ' + sc.getOutputAmperage() + ' A, sink ' + kc.getInputVoltage() + ' V x ' + kc.getInputAmperage() + ' A, V[13] ' + V)
        try {
          var be = S.level.getBlockEntity(u.wire[0])
          var nd = be.getNodeData()
          note('s0_7_wire_property', 'voltage ' + nd.getVoltage() + ', amperage ' + nd.getAmperage() + ', loss per block ' + nd.getLossPerBlock() + ', block ' + CABLE)
        } catch (e) { note('s0_7_wire_property', 'unreadable: ' + errText(e)) }
      }
      if (S.tick - u.started >= 20) { u.phase = 'sample'; u.gain = []; u.draw = []; u.started = S.tick }
      sc.setEnergyStored(sc.getEnergyCapacity())
      kc.setEnergyStored(0)
      return
    }
    if (u.phase === 'sample') {
      u.gain.push(Number(kc.getEnergyStored()))
      u.draw.push(Number(sc.getEnergyCapacity()) - Number(sc.getEnergyStored()))
      sc.setEnergyStored(sc.getEnergyCapacity())
      kc.setEnergyStored(0)
      if (S.tick - u.started >= 40) {
        var alive = u.wire.every(function (p) { return String(S.level.getBlock(p.getX(), p.getY(), p.getZ()).getId()) === CABLE })
        var steady = u.gain.slice(5)
        var want = Number(GTValues.V[OPV]) * 16
        var allWant = steady.every(function (g) { return g === want })
        var equal = steady.every(function (g, i) { return g === u.draw.slice(5)[i] })
        note('s0_7_samples', 'sink gain per tick ' + steady.slice(0, 6).join(',') + ' ...; source draw ' + u.draw.slice(5, 11).join(',') + ' ...')
        check('s0_7_flow', alive && allWant, 'sink gained ' + (steady.length ? steady[0] : 'none') + ' EU/t (expected ' + want + ' = 16 A x V[OpV]) on every one of ' + steady.length + ' ticks: ' + allWant + '; cable intact ' + alive)
        check('s0_7_zero_loss', equal, 'sink gain equals source draw on every tick: ' + equal)
        u.phase = 'done'
      }
    }
  }

  // ---------------------------------------------------------------- S0-10: the assembly array
  function arrayBuild(u) {
    placeCheck(u, placeMachine(ARRAY, 37400, 75, 30, function (c) {
      if (c.ch === 'I' && c.si >= 1) return 'gtceu:hv_input_bus'
      if (c.ch === 'O') return 'gtceu:hv_output_bus'
      if (c.ch === 'E') return HATCH2
      if (c.ch === 'D') return 'gtceu:data_access_hatch'
      if (c.ch === 'P') return PARALLEL
      return null
    }))
  }
  function loadOrder(u, items, backFirst) {
    var ordered = backFirst ? u.buses : u.buses.slice().reverse()
    ordered.forEach(function (b, i) { setBus(b, items[i]) })
  }
  function clearBuses(u) { u.buses.forEach(function (b) { setBus(b, null) }) }
  function arrayTick(u) {
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!waitForm(u, m)) return
      u.m = m
      u.energy = partsLike(m, /opv_energy_input_hatch/)
      u.data = partsLike(m, /data_access/)[0]
      u.buses = partsLike(m, /input_bus/).sort(function (a, b) { return b.getPos().getZ() - a.getPos().getZ() })
      var ph = m.getParallelHatch()
      var rep = ph.isPresent() ? Number(ph.get().getCurrentParallel()) : NaN
      check('s0_10_formed', u.buses.length === 3 && !!u.data && u.energy.length === 1 && rep === 262144,
        'class ' + m.getClass().getSimpleName() + ', input buses ' + u.buses.length + ', data access ' + !!u.data + ', parallel hatch reports ' + rep + ', parts ' + partIds(m))
      u.trials = [['back_first', ORDER_ITEMS, true], ['front_first', ORDER_ITEMS, false]]
      u.results = {}
      u.ti = 0
      u.phase = 'trial_load'
      return
    }
    topUp(u.energy)
    if (u.phase === 'trial_load') {
      if (u.ti >= u.trials.length) { u.phase = 'research_load'; u.rstep = 0; return }
      var t = u.trials[u.ti]
      clearBuses(u)
      loadOrder(u, t[1], t[2])
      u.started = S.tick
      u.phase = 'trial_wait'
      return
    }
    if (u.phase === 'trial_wait') {
      var t2 = u.trials[u.ti]
      var snap = m.getRecipeLogic().isWorking() ? snapshot(m) : null
      if (snap !== null) {
        u.results[t2[0]] = snap
        note('s0_10_' + t2[0], 'started after ' + (S.tick - u.started) + ' ticks: ' + snap.id + ', copies ' + snap.parallels + ', ' + snap.eut + ' EU/t')
        clearBuses(u)
        u.phase = 'trial_idle'
        u.started = S.tick
      } else if (S.tick - u.started > 100) {
        u.results[t2[0]] = null
        note('s0_10_' + t2[0], 'idle for 100 ticks: status ' + status(m) + ', reasons ' + reasons(m))
        clearBuses(u)
        u.phase = 'trial_idle'
        u.started = S.tick
      }
      return
    }
    if (u.phase === 'trial_idle') {
      if (status(m) === 'WORKING' && S.tick - u.started < 120) return
      u.ti++
      u.phase = 'trial_load'
      return
    }
    // research: with the working order of the trials (back first when none worked), no stick, then the stick in the data access hatch
    if (u.phase === 'research_load') {
      if (u.rstep === 0) {
        var a = u.results.back_first
        var b = u.results.front_first
        check('s0_10_ordered', (a === null) !== (b === null), 'back-first ' + (a ? 'started, copies ' + a.parallels : 'refused') + ', front-first ' + (b ? 'started, copies ' + b.parallels : 'refused') + ' (GTM keeps its ordered-input check when exactly one order runs)')
        var win = a || b
        if (win) check('s0_10_ordered_parallel', win.parallels === 262144 && win.eut === 262144 * 2048, 'the ordered recipe ran at ' + win.parallels + ' copies, ' + win.eut + ' EU/t (expected 262,144 and ' + 262144 * 2048 + ')')
        u.backFirst = !(b !== null && a === null)
        clearBuses(u)
        loadOrder(u, RESEARCH_ITEMS, u.backFirst)
        u.started = S.tick
        u.rstep = 1
        return
      }
      if (u.rstep === 1) {
        if (S.tick - u.started < 80) { if (m.getRecipeLogic().isWorking()) { check('s0_10_research_blocked', false, 'the research recipe started without data: ' + String(m.getRecipeLogic().getLastRecipe().id)); u.rstep = 9 } return }
        if (u.rstep === 1) {
          check('s0_10_research_blocked', status(m) !== 'WORKING', 'no data stick: status ' + status(m) + ', reasons ' + reasons(m))
          var stick = Item.of('gtceu:data_stick', '{assembly_line_research:{research_id:"' + RESEARCH_ID + '",research_type:"gtceu:assembly_line"}}')
          var rest = u.data.importItems.insertItem(0, stick.copy(), false)
          if (!rest.isEmpty()) u.data.importItems.storage.setStackInSlot(0, stick.copy())
          var held = u.data.importItems.getStackInSlot(0)
          note('s0_10_stick', 'data hatch holds ' + held.getId() + ', research id ' + classes().RM.readResearchId(held))
          u.started = S.tick
          u.rstep = 2
        }
        return
      }
      if (u.rstep === 2) {
        var snap2 = m.getRecipeLogic().isWorking() ? snapshot(m) : null
        if (snap2 !== null || S.tick - u.started > 200) {
          check('s0_10_research_parallel', snap2 !== null && snap2.parallels === 262144 && snap2.eut === 262144 * 2048,
            'with the stick: ' + (snap2 ? snap2.id + ', copies ' + snap2.parallels + ', ' + snap2.eut + ' EU/t' : 'no start; status ' + status(m) + ', reasons ' + reasons(m)) + ' (expected 262,144 copies, ' + 262144 * 2048 + ' EU/t)')
          u.phase = 'done'
        }
        return
      }
      if (u.rstep === 9) u.phase = 'done'
    }
  }

  // ---------------------------------------------------------------- S0-11: a generation recipe scaled by the copies the bus allows
  function genBuild(u) {
    placeCheck(u, placeMachine(GEN, 37424, 75, 14, function (c) {
      if (c.ch === 'D') return DYNAMO16
      if (c.ch === 'P') return PARALLEL
      return null
    }))
  }
  function genTick(u) {
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!waitForm(u, m)) return
      u.bus = partsLike(m, /input_bus/)[0]
      u.dyn = partsLike(m, /energy_output_hatch_16a/)[0]
      var isGen = 'unknown'
      try { isGen = String(m.getDefinition().isGenerator()) } catch (x) { }
      check('s0_11_formed', !!u.bus && !!u.dyn, 'class ' + m.getClass().getSimpleName() + ', generator ' + isGen + ', parts ' + partIds(m))
      u.counts = [1, 4, 16]
      u.ti = 0
      u.phase = 'load'
      return
    }
    if (u.phase === 'load') {
      if (u.ti >= u.counts.length) { u.phase = 'done'; return }
      setSlots(u.bus, [['minecraft:iron_nugget', u.counts[u.ti]]])
      u.started = S.tick
      u.phase = 'wait'
      return
    }
    if (u.phase === 'wait') {
      var n = u.counts[u.ti]
      var snap = m.getRecipeLogic().isWorking() ? snapshot(m) : null
      if (snap !== null || S.tick - u.started > 200) {
        var left = countIn(u.bus, 'minecraft:iron_nugget')
        var stored = Number(u.dyn.energyContainer.getEnergyStored())
        var wantEut = -n * GEN_EUT
        check('s0_11_' + n, snap !== null && snap.eut === wantEut && snap.parallels === n,
          n + ' nuggets: ' + (snap ? snap.id + ', copies ' + snap.parallels + ', ' + snap.eut + ' EU/t' : 'no start; status ' + status(m) + ', reasons ' + reasons(m)) + ' (expected ' + n + ' copies, ' + wantEut + ' EU/t); nuggets left ' + left + ', dynamo stored ' + stored + ' EU')
        setSlots(u.bus, [])
        u.started = S.tick
        u.phase = 'idle'
      }
      return
    }
    if (u.phase === 'idle') {
      if (status(m) !== 'WORKING' || S.tick - u.started > 400) {
        u.dyn.energyContainer.setEnergyStored(0)
        u.ti++
        u.phase = 'load'
      }
    }
  }

  // ---------------------------------------------------------------- driver
  function clear() {
    for (var z = 0; z < 64; z += 8) command('fill ' + X0 + ' ' + Y0 + ' ' + z + ' ' + X1 + ' ' + Y1 + ' ' + (z + 7) + ' minecraft:air')
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    try { clear() } catch (e) { }
    command('forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, units: [] }
    S.level = server.getLevel('minecraft:overworld')
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    function add(u, build) {
      try { if (build) build(u); S.units.push(u) } catch (e) { check(u.name + '_build_exception', false, errText(e)) }
    }
    add({ name: 'gate', tick: gateTick, phase: 'forming', started: 0 }, gateBuild)
    add({ name: 's0_5_light', tick: frameTick, phase: 'forming', started: 0, cx: 37380, hatch: HATCH2, hatches: 1, item: DANDELION, eut: 2048,
      expect: Math.min(262144, Math.floor(Number(GTValues.V[OPV]) / 2048)) }, frameBuild)
    add({ name: 's0_5_heavy', tick: frameTick, phase: 'forming', started: 0, cx: 37390, hatch: HATCH16, hatches: 2, item: POPPY, eut: 16384, expect: 0 }, frameBuild)
    add({ name: 'cable', tick: cableTick, phase: 'warm', started: 0 }, cableBuild)
    add({ name: 'array', tick: arrayTick, phase: 'forming', started: 0 }, arrayBuild)
    add({ name: 'gen', tick: genTick, phase: 'forming', started: 0 }, genBuild)
  }
  ServerEvents.customCommand('gg_test_opv_s0_machines', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && Date.now() - LOADED >= 10000) {
        global[REQUEST] = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      var pending = 0
      S.units.forEach(function (u) {
        if (u.phase === 'done') return
        try { u.tick(u) } catch (e) { check(u.name + '_exception', false, 'phase ' + u.phase + ': ' + errText(e)); u.phase = 'done' }
        if (u.phase !== 'done') pending++
      })
      if (pending === 0) finish()
      else if (S.tick > 4000) { check('deadline', false, '4000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
