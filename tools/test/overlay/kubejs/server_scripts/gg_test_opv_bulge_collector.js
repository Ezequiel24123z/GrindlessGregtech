// priority: -6374
// TEST ONLY, OpV-R3 (gtceu:bulge_collector). Command: kubejs custom_command gg_test_opv_bulge_collector
// Band ONLY: X 38528-38591, Z 0-63, Y 98-115, in grindless:terzan5_core.
//   T1 (named uncertainty: collector c3 starts on one OpV 4 A dynamo hatch at 2^30 EU/t and keeps producing for its first 1,200 ticks; its census output is proven by the node test):
//     lookup        the rows and controllers are in the recipe manager
//     static_clean  nothing skipped, no clash
//     collector_formed  the machine forms with one OpV dynamo hatch
//     c3_runs       16 deployed packs + circuit 3: bulge_light_16 is the running recipe, working, progress advancing at tick 1200, the hatch holds EU
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 38528
  var X1 = 38591
  var Y0 = 98
  var Y1 = 115
  var NAME = 'opv_bulge_collector'
  var FAR = 'grindless:terzan5_core'
  var CY = 106
  var DYNAMO = 'gtceu:opv_energy_output_hatch_4a'
  var CIRCUIT = 'gtceu:programmed_circuit'
  var IDS = [
    'grindless:collector_node_assembly/node_pack_deploy', 'grindless:bulge_light_collection/bulge_light_16',
    'grindless:replication_refining/spent_node_recovery',
    'grindless:assembly_line/collector_node_works', 'grindless:assembly_line/bulge_collector'
  ]
  var BUS = [[CIRCUIT, 1, '{Configuration:3}'], ['grindless:deployed_node_pack', 16]]
  var PARTS = [DYNAMO, 'gtceu:hv_input_bus', 'gtceu:hv_output_bus']
  var UNIT = { name: 'collector', machine: 'bulge_collector', cx: 38560, z: 32, parts: PARTS }

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine')
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
  function command(text) { return S.server.runCommandSilent('execute in ' + FAR + ' run ' + text) }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= 0 && z <= 63 && y >= Y0 && y <= Y1 }
  function put(x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return command('setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function machine(u) { return classes().Meta.getMachine(u.level, u.pos) }
  function partsLike(ctrl, re) {
    var out = []
    array(ctrl.getParts()).forEach(function (p) { if (re.test(String(p.getDefinition().getId()))) out.push(p) })
    return out
  }
  function setBus(p, list) {
    var st = p.getInventory().storage
    for (var i = 0; i < st.getSlots(); i++) st.setStackInSlot(i, Item.of('minecraft:air'))
    var slot = 0
    list.forEach(function (e) { st.setStackInSlot(slot++, e.length > 2 ? Item.of(e[0], e[1], e[2]) : Item.of(e[0], e[1])) })
  }
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) { try { return String(m.getMultiblockState().error) } catch (e) { return 'unknown' } }
  function reasons(m) { return String(m.getRecipeLogic().getFailureReasons()) }

  function place(u) {
    var desc = global.grindless.patterns.describe('gtceu:' + u.machine)
    if (!desc) throw new Error('no structure description for gtceu:' + u.machine)
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
    var xs = []
    cells.forEach(function (c) {
      c.x = u.cx - (c.ci - ctrl.ci)
      c.y = CY + (c.ri - ctrl.ri)
      c.z = u.z - (c.si - ctrl.si)
      if (c.sym.kind === 'oneOf') xs.push(c)
    })
    xs.sort(function (a, b) { return a.z - b.z || a.x - b.x })
    var chosen = {}
    var n = xs.length
    u.parts.forEach(function (id, i) { chosen[Math.floor(i * (n - 1) / (u.parts.length - 1))] = id })
    var idx = {}
    xs.forEach(function (c, i) { idx[c.x + ',' + c.y + ',' + c.z] = i })
    cells.forEach(function (c) {
      var sym = c.sym
      var block = null
      var part = false
      if (sym.kind === 'controller') { controller = { x: c.x, y: c.y, z: c.z }; return }
      if (sym.kind === 'blocks') block = sym.blocks[0]
      else if (sym.kind === 'frames') block = 'gtceu:' + sym.materials[0] + '_frame'
      else if (sym.kind === 'oneOf') {
        var pid = chosen[idx[c.x + ',' + c.y + ',' + c.z]]
        if (pid) { block = pid; part = true }
        else sym.options.forEach(function (o) { if (!block && o.kind === 'blocks') block = o.blocks[0] })
      }
      if (!block) return
      put(c.x, c.y, c.z, block + (part ? '[facing=north]' : ''))
    })
    put(controller.x, controller.y, controller.z, 'gtceu:' + u.machine + '[facing=north]')
    return pos(controller.x, controller.y, controller.z)
  }

  function registrationChecks() {
    var rm = S.server.getRecipeManager()
    var missing = IDS.filter(function (i) { return !rm.byKey(new (classes().RL)(i)).isPresent() })
    check('lookup', missing.length === 0, IDS.length + ' ids checked; missing: ' + (missing.length ? missing.join(', ') : 'none'))
    var B = global.grindless.bulgeCollector
    check('static_clean', !!B && B.skipped.length === 0 && B.clashes.length === 0, B ? 'skipped ' + B.skipped.length + ', clashes ' + B.clashes.length : 'no global.grindless.bulgeCollector')
  }

  function tick(u) {
    var waited = S.tick - u.started
    var m = machine(u)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check('collector_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      u.dynamo = partsLike(m, /opv_energy_output_hatch_4a/)
      u.inBus = partsLike(m, /input_bus/)[0]
      var ok = !!u.inBus && u.dynamo.length === 1
      check('collector_formed', ok, 'class ' + m.getClass().getSimpleName() + ', dynamo hatches ' + u.dynamo.length + ', parts ' + array(m.getParts()).length)
      if (!ok) { u.phase = 'done'; return }
      setBus(u.inBus, BUS)
      try { m.getRecipeLogic().updateTickSubscription() } catch (e) { }
      u.started = S.tick
      u.phase = 'run'
      return
    }
    if (u.phase !== 'run') return
    if (waited < 1200) return
    var rlg = m.getRecipeLogic()
    var rec = rlg.getLastRecipe()
    var id = rec === null || rec === undefined ? 'none' : String(rec.id)
    var stored = u.dynamo[0].energyContainer.getEnergyStored()
    var cap = u.dynamo[0].energyContainer.getEnergyCapacity()
    var full = stored >= cap
    var good = id.indexOf('bulge_light_16') >= 0 && (rlg.isWorking() || full) && rlg.getProgress() > 0
    check('c3_runs', good, 'recipe ' + id + ', working ' + rlg.isWorking() + ', progress ' + rlg.getProgress() + ', dynamo hatch holds ' + stored + ' EU, reasons ' + reasons(m))
    u.phase = 'done'
  }

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
    S = { server: server, tick: 0, failed: 0, finished: false }
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear()
    try { registrationChecks() } catch (e) { check('registration_exception', false, errText(e)) }
    S.units = []
    var u = { name: UNIT.name, machine: UNIT.machine, cx: UNIT.cx, z: UNIT.z, parts: UNIT.parts, phase: 'forming', started: S.tick }
    try {
      u.level = server.getLevel(FAR)
      if (!u.level) throw new Error('no level ' + FAR)
      u.pos = place(u)
      S.units.push(u)
    } catch (e) { check('build_exception', false, errText(e)) }
  }
  ServerEvents.customCommand('gg_test_opv_bulge_collector', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestOpvBulgeCollectorRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestOpvBulgeCollectorRequest && Date.now() - LOADED >= 10000) {
        global.ggTestOpvBulgeCollectorRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      var pending = 0
      S.units.forEach(function (u) {
        if (u.phase === 'done') return
        try { tick(u) } catch (e) { check(u.name + '_exception', false, 'phase ' + u.phase + ': ' + errText(e)); u.phase = 'done' }
        if (u.phase !== 'done') pending++
      })
      if (pending === 0) finish()
      else if (S.tick > 3000) { check('deadline', false, '3000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
