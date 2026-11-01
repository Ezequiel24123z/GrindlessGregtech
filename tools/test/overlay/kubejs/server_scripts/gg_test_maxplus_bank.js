// TEST ONLY, XP-H5 (gtceu:horizon_capacitor_bank). Command: kubejs custom_command gg_test_maxplus_bank
// Band ONLY: X 48192-48255, Z 0-63, Y 98-125 of gcyr:black_hole_orbit (Sgr A*) and, for the second run, the same band of the Overworld
// (zones.json row maxplus_bank). No startup overlay: the bank and its cell are part of the pack.
//   T1 (named uncertainty: GTM forms the 25 x 5 x 25 ring of 40 capacitors, and the network counts it at Sgr A* orbit only, exactly past 2^53):
//     lookup     the controller line is in the recipe manager
//     site_formed  the bank forms at Sgr A* with 40 capacitors in its slots
//     capacity   the network's bank capacity is exactly 40 x 2^48 = 11,258,999,068,426,240 EU, one bank, and the status capacity holds it
//     exact      W.dialCharge answers the same capacity as an exact value above 2^53 (one dial, 1,200 x 2^43 EU, fits with 80 dial-ticks over)
//     home_formed  the same structure forms in the Overworld
//     home_zero  there the bank adds 0: no bank, no capacity, and bankInfo says it is not at the site
// The wireless network's persistent data is put aside while the test runs and put back at the end; the queue (ggTestWirelessQueue) is shared with
// the other wireless fixtures.
(function () {
  var TAG = 'GGTEST|'
  var SCOPE = 'maxplus_bank'
  var REQUEST = 'ggTestMaxplusBankRequest'
  var QUEUE = 'ggTestWirelessQueue'
  var TURN_TIMEOUT_MS = 180000
  var FORM_TIMEOUT = 900
  var COUNT_TIMEOUT = 200
  var LOADED_AT = Date.now()
  var X0 = 48192
  var X1 = 48255
  var Y0 = 98
  var Y1 = 125
  var CX = 48224
  var CY = 104
  var CZ = 20
  var SITE = 'gcyr:black_hole_orbit'
  var HOME = 'minecraft:overworld'
  var MACHINE = 'gtceu:horizon_capacitor_bank'
  var CAPACITOR = 'grindless:horizon_capacitor'
  var WANT = '11258999068426240'
  var DIAL = '10555311626649600'
  var S = null
  var C = null

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine')
    }
    return C
  }
  function errText(e) {
    var s = ''
    try { s = String(e.message || e) } catch (x) { }
    try { s += ' @' + String(e.stack || '').split('\n').slice(0, 3).join(' ') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) }
  function emit(name, kind, detail) { console.info(TAG + SCOPE + '|' + name + '|' + kind + '|' + clean(detail)) }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    emit(name, ok ? 'PASS' : 'FAIL', detail)
  }
  function note(name, detail) { emit(name, 'NOTE', detail) }
  function guarded(name, fn) {
    try { fn() } catch (e) { check(name, false, 'exception: ' + errText(e)) }
  }

  function queueList() {
    var s = global[QUEUE]
    s = s === undefined || s === null ? '' : String(s)
    return s === '' ? [] : s.split(',')
  }
  function joinQueue() {
    var q = queueList()
    if (q.indexOf(SCOPE) < 0) q.push(SCOPE)
    global[QUEUE] = q.join(',')
  }
  function leaveQueue() { global[QUEUE] = queueList().filter(function (n) { return n !== SCOPE }).join(',') }
  function myTurn() { return queueList()[0] === SCOPE }

  function W() {
    var w = global.grindless && global.grindless.wireless
    if (!w || typeof w.settle !== 'function' || !w.big || typeof w.dialCharge !== 'function') throw new Error('global.grindless.wireless has no bank API (lv/wireless_energy.js)')
    return w
  }

  function saveNetwork() {
    var w = W()
    var pd = S.server.persistentData
    S.savedKeys = {}
    ;[w.blocksKey, w.storeKey, w.legacyKey].forEach(function (k) {
      if (k === undefined || k === null) return
      var t = pd.get(k)
      S.savedKeys[k] = t === null || t === undefined ? null : t.copy()
      pd.remove(k)
    })
    w.dropCache()
    S.wasPaused = w.paused === true
    w.paused = true
  }
  function restoreNetwork() {
    var w = W()
    var pd = S.server.persistentData
    Object.keys(S.savedKeys || {}).forEach(function (k) {
      pd.remove(k)
      var t = S.savedKeys[k]
      if (t !== null) pd.put(k, t)
    })
    w.dropCache()
    w.paused = S.wasPaused === true
  }

  function command(dim, text) { return S.server.runCommandSilent('execute in ' + dim + ' run ' + text) }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= 0 && z <= 63 && y >= Y0 && y <= Y1 }
  function put(dim, x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return command(dim, 'setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function clear(dim) {
    for (var z = 0; z < 64; z += 8) command(dim, 'fill ' + X0 + ' ' + Y0 + ' ' + z + ' ' + X1 + ' ' + Y1 + ' ' + (z + 7) + ' minecraft:air')
  }
  function pos(p) { return new (classes().Pos)(p.x, p.y, p.z) }
  function machineAt(level, p) {
    var m = classes().Meta.getMachine(level, pos(p))
    return m === null || m === undefined ? null : m
  }
  function formCheck(m, waited) {
    if (m === null) return false
    if (m.isFormed()) return true
    if (waited >= 100 && waited % 50 === 0) {
      if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
    }
    return m.isFormed()
  }
  function why(m) { try { return String(m.getMultiblockState().error) } catch (e) { return 'unknown' } }

  // the template walk: casing in the 'F' cells, a capacitor in every slot (the oneOf's first option), the controller facing north
  function place(dim) {
    var desc = global.grindless.patterns.describe(MACHINE)
    if (!desc) throw new Error('no structure description for ' + MACHINE)
    var cells = []
    var ctrl = null
    desc.slices.forEach(function (rows, si) {
      rows.forEach(function (row, ri) {
        for (var ci = 0; ci < row.length; ci++) {
          var ch = row.charAt(ci)
          if (ch === ' ') continue
          var sym = desc.symbols[ch]
          if (sym.kind === 'controller') ctrl = { si: si, ri: ri, ci: ci }
          cells.push({ si: si, ri: ri, ci: ci, sym: sym })
        }
      })
    })
    var controller = null
    var slots = 0
    cells.forEach(function (c) {
      var x = CX - (c.ci - ctrl.ci)
      var y = CY + (c.ri - ctrl.ri)
      var z = CZ - (c.si - ctrl.si)
      var sym = c.sym
      var block = null
      if (sym.kind === 'controller') { controller = { x: x, y: y, z: z }; return }
      if (sym.kind === 'blocks') block = sym.blocks[0]
      else if (sym.kind === 'oneOf') {
        sym.options.forEach(function (o) { if (block === null && o.kind === 'blocks' && o.blocks[0] === CAPACITOR) block = CAPACITOR })
        if (block === CAPACITOR) slots++
      }
      if (block !== null) put(dim, x, y, z, block)
    })
    put(dim, controller.x, controller.y, controller.z, MACHINE + '[facing=north]')
    return { pos: controller, slots: slots }
  }

  function cleanup() {
    try {
      W().paused = true
      clear(SITE)
      clear(HOME)
      command(SITE, 'forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
      command(HOME, 'forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
      restoreNetwork()
      note('CLEANUP', 'band cleared, force-load released, the network\'s keys put back')
    } catch (e) {
      note('CLEANUP', 'could not clean up: ' + errText(e))
    }
  }
  function finish() {
    if (S === null || S.finished) return
    S.finished = true
    if (S.started) cleanup()
    leaveQueue()
    console.info(TAG + SCOPE + '|DONE|failures=' + S.failed)
  }

  function begin(server) {
    S = { server: server, failed: 0, finished: false, started: false, phase: 'turn', queuedAt: Date.now(), tick: 0 }
    joinQueue()
  }

  function startRun(dim, tag) {
    S.run = { dim: dim, tag: tag, level: S.server.getLevel(dim), started: S.tick }
    command(dim, 'forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    clear(dim)
    var r = place(dim)
    S.run.pos = r.pos
    S.run.slots = r.slots
    S.phase = 'forming'
  }

  function step() {
    if (S.phase === 'turn') {
      if (!myTurn()) {
        if (Date.now() - S.queuedAt > TURN_TIMEOUT_MS) {
          check('TURN', false, 'no turn on the wireless network in ' + (TURN_TIMEOUT_MS / 1000) + ' s; queue ' + queueList().join(','))
          finish()
        }
        return
      }
      S.started = true
      saveNetwork()
      var rm = S.server.getRecipeManager()
      check('lookup', rm.byKey(new (classes().RL)('grindless:assembly_line/horizon_capacitor_bank')).isPresent(), 'the controller line grindless:assembly_line/horizon_capacitor_bank')
      startRun(SITE, 'site')
      return
    }
    var r = S.run
    var waited = S.tick - r.started
    if (S.phase === 'forming') {
      var m = machineAt(r.level, r.pos)
      if (!formCheck(m, waited)) {
        if (waited > FORM_TIMEOUT) {
          check(r.tag + '_formed', false, m ? 'not formed: ' + why(m) : 'no controller')
          if (r.tag === 'site') { finish(); return }
          S.phase = 'done'
        }
        return
      }
      check(r.tag + '_formed', r.slots === 40, 'formed; ' + r.slots + ' capacitor slots placed')
      r.counted = S.tick
      S.phase = 'count'
      return
    }
    if (S.phase === 'count') {
      var w = W()
      var machine = machineAt(r.level, r.pos)
      guarded(r.tag + '_track', function () { w.track(r.level, pos(r.pos)) })
      var info = w.bankInfo(machine)
      if (info.pending && S.tick - r.counted < COUNT_TIMEOUT) return
      w.settle(S.server)
      var st = w.status(S.server)
      var dc = w.dialCharge(S.server)
      if (r.tag === 'site') {
        check('capacity', String(st.bankCapacity) === WANT && st.banks === 1 && w.big.cmp(st.capacity, st.bankCapacity) >= 0,
          'banks ' + st.banks + ', bank capacity ' + st.bankCapacity + ' (expected ' + WANT + '), capacity ' + st.capacity + ', capacitors ' + info.capacitors)
        var above = w.big.cmp(dc.bankCapacity, w.big.SAFE) > 0
        var spare = w.big.sub(dc.bankCapacity, DIAL)
        check('exact', String(dc.bankCapacity) === WANT && above && String(spare) === String(80 * Math.pow(2, 43)),
          'dialCharge bank ' + dc.bankCapacity + ' above 2^53 ' + above + ', over one dial by ' + spare)
        S.server.persistentData.remove(w.blocksKey)
        w.dropCache()
        clear(SITE)
        startRun(HOME, 'home')
      } else {
        check('home_zero', st.banks === 0 && String(st.bankCapacity) === '0' && info.atSite === false,
          'banks ' + st.banks + ', bank capacity ' + st.bankCapacity + ', atSite ' + info.atSite + ', capacitors ' + info.capacitors)
        S.phase = 'done'
      }
      return
    }
    if (S.phase === 'done') finish()
  }

  ServerEvents.customCommand('gg_test_maxplus_bank', function () {
    if (S !== null && !S.finished) return 0
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] && Date.now() - LOADED_AT >= 10000) {
        global[REQUEST] = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      step()
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false, started: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
