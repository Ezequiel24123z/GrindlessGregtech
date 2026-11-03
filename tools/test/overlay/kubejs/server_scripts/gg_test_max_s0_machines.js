// priority: -5604
// TEST ONLY, MAX-S0 (bench overlay, never shipped; needs the startup overlay on: kubejs/config/gg_test_max_s0.json {"enabled": true}).
// Command: kubejs custom_command gg_test_max_s0_machines. Band ONLY: X 38720-38783, Z 0-63, Overworld Y 70-102. Everything placed is cleared before DONE.
//   s0_2_*   gtceu:warp_gate on two gtceu:max_energy_input_hatch_16a runs a recipe at 2^35 EU/t (a long) for 1,200 ticks: per-tick draw, wrap, completion, tier readout
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 38720
  var X1 = 38783
  var Y0 = 70
  var Y1 = 102
  var NAME = 'max_s0_machines'
  var REQUEST = 'ggTestMaxS0MachinesRequest'
  var MAXT = 14
  var HATCH16 = 'gtceu:max_energy_input_hatch_16a'
  var DYNAMO16 = 'gtceu:max_energy_output_hatch_16a'
  var GATE = 'gtceu:warp_gate'
  var DANDELION = 'minecraft:blue_orchid'
  var POPPY = 'minecraft:poppy'
  var GATE_EUT = '34359738368'
  var GATE_TICKS = 1200

  var marker = JsonIO.read('kubejs/config/gg_test_max_s0.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'

  ServerEvents.recipes(function (event) {
    if (!ON) return
    var Long = Java.loadClass('java.lang.Long')
    try {
      event.recipes.gtceu.warp_gate('gg_test_max_s0:warp_gate/s0_probe').notConsumable('1x ' + DANDELION).itemOutputs('1x ' + POPPY).EUt(Long.valueOf(GATE_EUT)).duration(GATE_TICKS)
    } catch (e) { console.error('[gg_test max_s0] could not add the warp gate probe: ' + errText(e)) }
  })

  function classes() {
    if (C !== null) return C
    C = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      RecipeHelper: Java.loadClass('com.gregtechceu.gtceu.api.recipe.RecipeHelper'),
      FU: Java.loadClass('com.gregtechceu.gtceu.utils.FormattingUtil'),
      GTUtil: Java.loadClass('com.gregtechceu.gtceu.utils.GTUtil'),
      Long: Java.loadClass('java.lang.Long')
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

  // ---------------------------------------------------------------- S0-2: the warp gate at 2^35 EU/t
  function gateBuild(u) {
    var step = 0
    placeCheck(u, placeMachine(GATE, 38758, 80, 10, function (c) {
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
    try { out.push('V[14]=' + GTValues.V[MAXT] + ' VN=' + GTValues.VN[MAXT] + ' VNF=' + GTValues.VNF[MAXT] + ' MAX=' + GTValues.MAX) } catch (e) { out.push('V: ' + e) }
    try { out.push('getTierByVoltage(2^35)=' + G.getTierByVoltage(classes().Long.valueOf(GATE_EUT))) } catch (e) { out.push('getTierByVoltage: ' + e) }
    try { out.push('getFloorTierByVoltage(2^35)=' + G.getFloorTierByVoltage(classes().Long.valueOf(GATE_EUT))) } catch (e) { out.push('getFloorTierByVoltage: ' + e) }
    try { out.push('getRecipeEUtTier=' + classes().RecipeHelper.getRecipeEUtTier(rec)) } catch (e) { out.push('getRecipeEUtTier: ' + e) }
    try { out.push('formatNumbers(EU/t)=' + classes().FU.formatNumbers(eut)) } catch (e) { out.push('formatNumbers: ' + e) }
    return out.join('; ')
  }
  function gateTick(u) {
    var m = machine(u.pos)
    if (u.phase === 'forming') {
      if (!waitForm(u, m)) return
      u.energy = partsLike(m, /max_energy_input_hatch_16a/)
      u.bus = partsLike(m, /input_bus/)[0]
      u.out = partsLike(m, /output_bus/)[0]
      var ec = m.getEnergyContainer()
      var volt = NaN
      var amps = NaN
      try { volt = Number(ec.getInputVoltage()); amps = Number(ec.getInputAmperage()) } catch (x) { }
      check('s0_2_formed', u.energy.length === 2 && !!u.bus && !!u.out, 'class ' + m.getClass().getSimpleName() + ', MAX 16 A hatches ' + u.energy.length + ', list ' + volt + ' V x ' + amps + ' A, hatch buffer ' + (u.energy.length ? u.energy[0].energyContainer.getEnergyCapacity() : 'none') + ', parts ' + partIds(m))
      setBus(u.bus, DANDELION)
      topUp(u.energy)
      m.getRecipeLogic().updateTickSubscription()
      u.started = S.tick
      u.phase = 'start'
      return
    }
    var drain = drainOf(u.energy)
    topUp(u.energy)
    var logic = m.getRecipeLogic()
    if (u.phase === 'start') {
      var last = logic.getLastRecipe()
      if (String(logic.getStatus()) === 'WORKING' && last && String(last.id).indexOf('s0_probe') >= 0) {
        var eut = NaN
        try { eut = Number(classes().RecipeHelper.getRealEUtWithIO(last).getTotalEU()) } catch (x) { }
        check('s0_2_eut_long', eut === 34359738368, 'recipe EU/t ' + eut + ' (expected 34,359,738,368 = 2^35; as an int it would read ' + (34359738368 | 0) + ')')
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
        var want = 34359738368
        check('s0_2_draw', u.neg === 0 && u.n > 0 && Math.abs(u.sum / u.n - want) < want * 0.01, 'per-tick draw over ' + u.n + ' ticks: avg ' + Math.round(u.sum / u.n) + ', min ' + u.min + ', max ' + u.max + ', negative samples ' + u.neg + ' (expected ' + want + '); total ' + u.sum + ' EU')
        check('s0_2_completes', made >= 1, 'the output bus holds ' + made + ' ' + POPPY + ' ' + run + ' ticks after the start (a 1,200 t recipe completed); status ' + status(m))
        u.phase = 'done'
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
    global.ggTestMaxS0Busy = false
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
  }
  ServerEvents.customCommand('gg_test_max_s0_machines', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    global.ggTestMaxS0Busy = true
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
