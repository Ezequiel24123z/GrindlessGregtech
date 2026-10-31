// priority: -5574
// TEST ONLY, MAX-S0 S0-7 (bench overlay, never shipped; needs kubejs/config/gg_test_max_s0.json {"enabled": true}). Command: kubejs custom_command gg_test_max_s0_cube
// Band ONLY: X 38720-38783, Z 0-63, Overworld Y 70-102. Forms gtceu:gg_max_s0_cube33 (33 x 33 x 33, hollow, MAX_ROWS 64) and the fallback gg_max_s0_cube25, and
// times checkPatternWithLock per call against the 50 ms tick budget. Everything is cleared before DONE.
(function () {
  var NAME = 'max_s0_cube'
  var REQUEST = 'ggTestMaxS0CubeRequest'
  var LOADED = Date.now()
  var X0 = 38720, X1 = 38783, Y0 = 70, Y1 = 102
  var S = null
  var C = null
  var marker = JsonIO.read('kubejs/config/gg_test_max_s0.json')
  var ON = marker !== null && String(marker.get('enabled')) === 'true'

  function classes() {
    if (C === null) C = { Pos: Java.loadClass('net.minecraft.core.BlockPos'), Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine') }
    return C
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) }
  function errText(e) {
    var s = ''
    try { s = String(e.message || '') } catch (x) { }
    try { s += ' @' + String(e.stack || '').split('\n').slice(0, 4).join(' ') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }
  function check(name, ok, detail) {
    if (!ok) S.failed++
    console.info('GGTEST|' + NAME + '|' + name + '|' + (ok ? 'PASS' : 'FAIL') + '|' + clean(detail))
  }
  function note(name, detail) { console.info('GGTEST|' + NAME + '|' + name + '|NOTE|' + clean(detail)) }
  function command(text) { return S.server.runCommandSilent('execute in minecraft:overworld run ' + text) }
  function fill(x0, y0, z0, x1, y1, z1, block) {
    if (x0 < X0 || x1 > X1 || y0 < Y0 || y1 > Y1 || z0 < 0 || z1 > 63) throw new Error('refused: fill outside the band')
    return command('fill ' + x0 + ' ' + y0 + ' ' + z0 + ' ' + x1 + ' ' + y1 + ' ' + z1 + ' ' + block)
  }
  function clear() {
    for (var z = 0; z < 64; z += 8) fill(X0, Y0, z, X1, Y1, z + 7, 'minecraft:air')
  }
  function why(m) {
    try {
      var err = m.getMultiblockState().error
      var p = err.getPos()
      return String(err.getErrorInfo().getString()) + ' at ' + (p ? p.getX() + ',' + p.getY() + ',' + p.getZ() : '?')
    } catch (e) { return 'unknown ' + e }
  }

  // controller at the bottom middle of the front face (z = cz), the shell reaches n - 1 blocks behind it (+z)
  function build(n, cx, cz) {
    var id = 'gtceu:gg_max_s0_cube' + n
    var x0 = cx - (n - 1) / 2, x1 = cx + (n - 1) / 2, y0 = 70, y1 = 70 + n - 1, z0 = cz, z1 = cz + n - 1
    var casing = 'gtceu:solid_machine_casing'
    fill(x0, y0, z0, x1, y1, z0, casing)
    fill(x0, y0, z1, x1, y1, z1, casing)
    fill(x0, y0, z0, x1, y0, z1, casing)
    fill(x0, y1, z0, x1, y1, z1, casing)
    fill(x0, y0, z0, x0, y1, z1, casing)
    fill(x1, y0, z0, x1, y1, z1, casing)
    command('setblock ' + cx + ' ' + y0 + ' ' + cz + ' ' + id + '[facing=north] replace')
    return { id: id, pos: new (classes().Pos)(cx, y0, cz), blocks: 6 * n * n - 12 * n + 8 }
  }
  function formed(u) {
    var m = classes().Meta.getMachine(S.level, u.pos)
    var waited = S.tick - u.started
    if (!m) { if (waited > 100) { check(u.name + '_formed', false, 'no controller block entity'); u.done = true } return }
    if (!m.isFormed() && waited >= 20 && waited % 20 === 0) {
      var t0 = Date.now()
      var ok = m.checkPatternWithLock()
      u.firstMs = (Date.now() - t0)
      if (ok) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed() }
      if (!ok && waited >= 100) { check(u.name + '_formed', false, 'pattern check false after ' + waited + ' ticks: ' + why(m) + '; first check ' + u.firstMs.toFixed(2) + ' ms'); u.done = true; return }
    }
    if (!m.isFormed()) {
      if (waited > 200) { check(u.name + '_formed', false, 'not formed after ' + waited + ' ticks: ' + why(m)); u.done = true }
      return
    }
    var runs = 20
    var t1 = Date.now()
    var allOk = true
    for (var i = 0; i < runs; i++) if (!m.checkPatternWithLock()) allOk = false
    var per = (Date.now() - t1) / runs
    var parts = 0
    try { parts = Number(m.getMultiblockState().getMatchContext().size()) } catch (e) { }
    check(u.name + '_formed', allOk, 'formed ' + u.blocks + ' casing blocks, ' + u.n + '^3; first check ' + (u.firstMs !== undefined ? u.firstMs.toFixed(2) : 'n/a') + ' ms')
    check(u.name + '_tick_cost', per < 50, 'checkPatternWithLock ' + per.toFixed(3) + ' ms per call over ' + runs + ' calls (the 50 ms tick budget); formed still ' + m.isFormed())
    u.done = true
  }

  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, units: [] }
    S.level = server.getLevel('minecraft:overworld')
    command('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    note('s0_7_forceload', 'chunks requested, building after 80 ticks')
  }
  function first() {
    clear()
    var a = build(33, 38752, 5)
    S.units.push({ name: 's0_7_cube33', n: 33, pos: a.pos, blocks: a.blocks, started: 0, done: false })
    note('s0_7_cube33_placed', 'controller 38752,70,5; shell x 38736-38768, y 70-102, z 5-37; ' + a.blocks + ' casing blocks')
  }
  function second() {
    clear()
    var b = build(25, 38752, 38)
    S.units.push({ name: 's0_7_cube25', n: 25, pos: b.pos, blocks: b.blocks, started: S.tick, done: false })
    note('s0_7_cube25_placed', 'controller 38752,70,38; shell x 38740-38764, y 70-94, z 38-62; ' + b.blocks + ' casing blocks')
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    try { clear() } catch (e) { }
    command('forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
  }
  global[REQUEST] = false
  ServerEvents.customCommand('gg_test_max_s0_cube', function () {
    if (!ON || (S !== null && !S.finished)) return 0
    global[REQUEST] = true
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      if (global[REQUEST] === true && Date.now() - LOADED >= 10000 && global.ggTestMaxS0Busy !== true) {
        global[REQUEST] = false
        begin(event.server)
      }
      if (S === null || S.finished) return
      S.tick++
      if (S.tick < 80) return
      if (S.units.length === 0) { first(); return }
      var u = S.units[S.units.length - 1]
      if (!u.done) { formed(u); return }
      if (S.units.length === 1) { second(); return }
      finish()
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
