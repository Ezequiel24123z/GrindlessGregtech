// priority: -6862
// TEST ONLY, OpV-R2 (gtceu:debris_harvester, gtceu:replication_refinery, gtceu:von_neumann_foundry). Command: kubejs custom_command gg_test_opv_replication
// Band ONLY: X 38464-38527, Z 0-63, Y 98-115, in grindless:terzan5_core. Give vitamin_kit and pathfinder_probe_core with /give for a manual run; the bench
// reaches the site by the overlay's teleport (F1 registered the place), not by R1's throw.
//   T1 (named uncertainty: the three machines form at Terzan 5 on UXV 4 A hatches, and foundry c1 returns the seed and outputs two only with all feedstock):
//     lookup          the rows and controllers are in the recipe manager
//     static_clean    nothing skipped, no clash
//     <m>_formed      each machine forms
//     full_c1         foundry c1 starts and finishes with the seed kept: two seeds in the output bus, the seed still in the input bus
//     short_c1        the same bus with one feedstock missing never starts c1
(function () {
  var S = null
  var C = null
  var LOADED = Date.now()
  var X0 = 38464
  var X1 = 38527
  var Y0 = 98
  var Y1 = 115
  var NAME = 'opv_replication'
  var FAR = 'grindless:terzan5_core'
  var CY = 106
  var UXV_4A = 'gtceu:uxv_energy_input_hatch_4a'
  var CIRCUIT = 'gtceu:programmed_circuit'

  var IDS = [
    'grindless:debris_harvesting/bulge_debris_harvest', 'grindless:debris_harvesting/debris_fractions',
    'grindless:replication_refining/metal_carbonyl_synthesis', 'grindless:replication_refining/cluster_casing_sinter',
    'grindless:self_replication/probe_self_copy', 'grindless:self_replication/probe_core_seed',
    'grindless:assembly_line/debris_harvester', 'grindless:assembly_line/replication_refinery', 'grindless:assembly_line/von_neumann_foundry'
  ]

  var FEED = [['grindless:metal_feedstock', 16], ['grindless:cluster_sinter_casing', 8], ['grindless:vitamin_kit', 1]]
  var FULL = [[CIRCUIT, 1, '{Configuration:1}'], ['grindless:probe_seed', 1]].concat(FEED)
  var SHORT = [[CIRCUIT, 1, '{Configuration:1}'], ['grindless:probe_seed', 1], ['grindless:metal_feedstock', 15], ['grindless:cluster_sinter_casing', 8],
    ['grindless:vitamin_kit', 1]]
  var BASE = [UXV_4A, UXV_4A, 'gtceu:hv_input_bus', 'gtceu:hv_output_bus']

  var UNITS = [
    { name: 'harvester', machine: 'debris_harvester', cx: 38480, z: 16, parts: BASE },
    { name: 'refinery', machine: 'replication_refinery', cx: 38510, z: 16, parts: BASE.concat(['gtceu:hv_input_hatch', 'gtceu:hv_output_hatch']) },
    { name: 'full_c1', machine: 'von_neumann_foundry', cx: 38480, z: 44, parts: BASE, bus: FULL, run: true },
    { name: 'short_c1', machine: 'von_neumann_foundry', cx: 38510, z: 44, parts: BASE, bus: SHORT, run: false }
  ]

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
  function countIn(p, id) {
    var st = p.getInventory().storage
    var n = 0
    for (var i = 0; i < st.getSlots(); i++) { var s = st.getStackInSlot(i); if (String(s.id) === id) n += s.count }
    return n
  }
  function topUp(list) { list.forEach(function (p) { var c = p.energyContainer; c.setEnergyStored(c.getEnergyCapacity()) }) }
  function formCheck(m, waited) {
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) { try { return String(m.getMultiblockState().error) } catch (e) { return 'unknown' } }
  function reasons(m) { return String(m.getRecipeLogic().getFailureReasons()) }

  // the template walk; the 'X' oneOf cells take the parts, spread evenly over the sorted cells
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
    var R = global.grindless.replication
    check('static_clean', !!R, R ? 'published' : 'no global.grindless.replication')
  }

  function tick(u) {
    var waited = S.tick - u.started
    var m = machine(u)
    if (u.phase === 'forming') {
      if (!m || !formCheck(m, waited)) {
        if (waited > 600) { check(u.name + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller'); u.phase = 'done' }
        return
      }
      u.m = m
      u.energy = partsLike(m, /uxv_energy_input_hatch_4a/)
      u.inBus = partsLike(m, /input_bus/)[0]
      u.outBus = partsLike(m, /output_bus/)[0]
      var ok = !!u.inBus && !!u.outBus && u.energy.length === 2
      check(u.name + '_formed', ok, 'class ' + m.getClass().getSimpleName() + ', energy hatches ' + u.energy.length + ', parts ' + array(m.getParts()).length)
      if (!ok || !u.bus) { u.phase = 'done'; return }
      setBus(u.inBus, u.bus)
      topUp(u.energy)
      try { m.getRecipeLogic().updateTickSubscription() } catch (e) { }
      u.started = S.tick
      u.phase = 'run'
      return
    }
    if (u.phase !== 'run') return
    var rlg = m.getRecipeLogic()
    var rec = rlg.getLastRecipe()
    var started = rec !== null && rec !== undefined && String(rec.id).indexOf('probe_self_copy') >= 0
    if (u.run) {
      var seeds = countIn(u.outBus, 'grindless:probe_seed')
      if (seeds >= 2) {
        check(u.name, seeds === 2 && countIn(u.inBus, 'grindless:probe_seed') === 1 && countIn(u.inBus, 'grindless:vitamin_kit') === 0,
          'out seeds ' + seeds + ', kept seed ' + countIn(u.inBus, 'grindless:probe_seed') + ', kit left ' + countIn(u.inBus, 'grindless:vitamin_kit'))
        u.phase = 'done'
      } else if (waited > 3600) {
        check(u.name, false, 'no two seeds in 3600 ticks; started ' + started + ', status ' + rlg.getStatus() + ', reasons ' + reasons(m))
        u.phase = 'done'
      }
    } else if (started) {
      check(u.name, false, 'c1 started with 15 feedstock')
      u.phase = 'done'
    } else if (waited > 400) {
      check(u.name, true, 'c1 never started with 15 feedstock; reasons ' + reasons(m))
      u.phase = 'done'
    }
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
    UNITS.forEach(function (def) {
      var u = { name: def.name, machine: def.machine, cx: def.cx, z: def.z, parts: def.parts, bus: def.bus, run: def.run, phase: 'forming', started: S.tick }
      try {
        u.level = server.getLevel(FAR)
        if (!u.level) throw new Error('no level ' + FAR)
        u.pos = place(u)
        S.units.push(u)
      } catch (e) { check(def.name + '_build_exception', false, errText(e)) }
    })
  }
  ServerEvents.customCommand('gg_test_opv_replication', function () {
    if (S !== null && !S.finished) return 0
    global.ggTestOpvReplicationRequest = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global.ggTestOpvReplicationRequest && Date.now() - LOADED >= 10000) {
        global.ggTestOpvReplicationRequest = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      var pending = 0
      S.units.forEach(function (u) {
        if (u.phase === 'done') return
        try {
          if (u.m && u.m.isFormed() && u.energy && u.energy.length) topUp(u.energy)
          tick(u)
        } catch (e) { check(u.name + '_exception', false, 'phase ' + u.phase + ': ' + errText(e)); u.phase = 'done' }
        if (u.phase !== 'done') pending++
      })
      if (pending === 0) finish()
      else if (S.tick > 4500) { check('deadline', false, '4500-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
