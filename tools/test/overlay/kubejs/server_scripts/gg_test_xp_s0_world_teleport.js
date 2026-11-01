// TEST ONLY, XP-S0b spike S0-9 (docs/eras/maxplus.md S0 table). Command: kubejs custom_command gg_test_xp_s0_world_teleport
// Band ONLY: X 44544-44607, Z 0-63, gg_test:s0_flat and gg_test:s0_plots Y 0-12 (zones.json row xp_s0_world_teleport). Never shipped.
//   Question: can a Hyperstargate-style gate carry a player into another dimension and back, exactly as the shipped warp gate (uhv/gate.js transit) does?
//   The fixture runs the shipped transit logic (ring check on the player's dimension and box, player.teleportTo(dim, x, y, z, yaw, pitch), one trip per entry)
//   on a Forge FakePlayer, because the bench runs a dedicated server with no client. A fake player proves the server side only (dimension, position, chunk
//   loading, cost); the client side (loading screen, respawn packet) is proven by the client suites that already cross dimensions.
//   Every measurement is a NOTE (the answer); PASS/FAIL only check the fixture itself.
(function () {
  var NAME = 'xp_s0_world_teleport'
  var CMD = 'gg_test_xp_s0_world_teleport'
  var A = 'gg_test:s0_flat'
  var B = 'gg_test:s0_plots'
  var QUEUE = 'ggXpS0Queue'
  var X0 = 44544
  var X1 = 44607
  var Y0 = 0
  var Y1 = 12
  var GATES = [
    { dim: A, x: 44560.5, y: 1, z: 20.5, r: 2.5, h: 4 },
    { dim: B, x: 44590.5, y: 1, z: 40.5, r: 2.5, h: 4 }
  ]
  var LOADED = Date.now()
  var S = null
  var C = null

  function classes() {
    if (C !== null) return C
    C = {
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      FPF: Java.loadClass('net.minecraftforge.common.util.FakePlayerFactory'),
      Profile: Java.loadClass('com.mojang.authlib.GameProfile'),
      UUID: Java.loadClass('java.util.UUID')
    }
    return C
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
  function cmd(dim, text) { return S.server.runCommandSilent('execute in ' + dim + ' run ' + text) }
  function ms() { return Date.now() }
  function r1(x) { return Math.round(x * 10) / 10 }
  function inBand(x, y, z) { return x >= X0 && x <= X1 && z >= 0 && z <= 63 && y >= Y0 && y <= Y1 }
  function put(dim, x, y, z, block) {
    if (!inBand(x, y, z)) throw new Error('refused: ' + x + ',' + y + ',' + z + ' is outside the band')
    return cmd(dim, 'setblock ' + x + ' ' + y + ' ' + z + ' ' + block + ' replace')
  }
  function dimOf(fp) {
    try { return String(fp.getLevel().getDimension()) } catch (e) { return String(fp.level.dimension().location()) }
  }
  function where(fp) {
    var dim = 'unreadable'
    try { dim = dimOf(fp) } catch (e) { }
    return dim + ' @ ' + r1(Number(fp.getX())) + ',' + r1(Number(fp.getY())) + ',' + r1(Number(fp.getZ()))
  }

  // the shipped transit, with the player list passed in (a fake player is not in server.getPlayers())
  function inside(p, g) {
    return Math.abs(Number(p.getX()) - g.x) <= g.r && Math.abs(Number(p.getZ()) - g.z) <= g.r && Number(p.getY()) >= g.y - 1 && Number(p.getY()) <= g.y + g.h
  }
  function tp(p, dim, x, y, z) {
    var yaw = 0
    var pitch = 0
    try { yaw = p.getYaw(); pitch = p.getPitch() } catch (e) { yaw = p.getYRot(); pitch = p.getXRot() }
    try {
      p.teleportTo(dim, x, y, z, yaw, pitch)
      S.route = 'teleportTo(dimension string, x, y, z, yaw, pitch)'
    } catch (e) {
      S.route = 'teleportTo(ServerLevel, x, y, z, yaw, pitch) after the string form failed: ' + errText(e)
      p.teleportTo(S.server.getLevel(dim), x, y, z, yaw, pitch)
    }
  }
  function transit(players) {
    var inAny = {}
    players.forEach(function (p) {
      var id = String(p.getUuid())
      var dim = dimOf(p)
      var here = null
      GATES.forEach(function (g) { if (here === null && g.dim === dim && inside(p, g)) here = g })
      if (here !== null) inAny[id] = true
      if (here === null || S.moved[id]) return
      var there = null
      GATES.forEach(function (g) { if (there === null && g.dim !== here.dim) there = g })
      S.moved[id] = true
      try {
        tp(p, there.dim, there.x, there.y, there.z)
        S.trips++
      } catch (e) {
        delete S.moved[id]
        throw e
      }
    })
    players.forEach(function (p) { var id = String(p.getUuid()); if (!inAny[id]) delete S.moved[id] })
  }

  function stand(fp, g) {
    fp.setPositionAndRotation(g.x, g.y, g.z, 90, 10)
    fp.fallDistance = 0
  }
  function leave(fp, g) { fp.setPositionAndRotation(g.x + 9, g.y, g.z, 90, 10) }
  function chunkLoaded(dim, g) { return !!S.server.getLevel(dim).hasChunk(Math.floor(g.x) >> 4, Math.floor(g.z) >> 4) }

  function buildCases() {
    var q = []
    q.push({ run: function () {
      var g = GATES[0]
      var fp = S.fp
      stand(fp, g)
      var before = where(fp)
      var t = ms()
      transit([fp])
      var dt = ms() - t
      var dest = GATES[1]
      var floor = String(S.server.getLevel(B).getBlock(Math.floor(dest.x), 0, Math.floor(dest.z)).id)
      note('a_to_b', 'from ' + before + ' to ' + where(fp) + ' in ' + r1(dt) + ' ms; trips ' + S.trips + '; route ' + S.route + '; fall distance ' + fp.fallDistance +
        '; health ' + fp.getHealth() + '; floor block under the arrival ' + floor)
      check('a_to_b_dimension', dimOf(fp) === B, 'the fake player ended in ' + dimOf(fp) + ', expected ' + B)
    } })
    q.push({ run: function () {
      var n0 = S.trips
      for (var i = 0; i < 5; i++) transit([S.fp])
      note('no_retrigger', 'five transit passes while standing in the arrival ring: trips ' + (S.trips - n0) + ', now ' + where(S.fp))
    } })
    q.push({ run: function () { leave(S.fp, GATES[1]); transit([S.fp]); note('left_ring', 'moved out of the ring: ' + where(S.fp) + '; trip flag cleared ' + (Object.keys(S.moved).length === 0)) } })
    q.push({ run: function () {
      stand(S.fp, GATES[1])
      var t = ms()
      transit([S.fp])
      note('b_to_a', 'back through the second ring in ' + r1(ms() - t) + ' ms: ' + where(S.fp) + '; trips ' + S.trips)
      check('b_to_a_dimension', dimOf(S.fp) === A, 'the fake player ended in ' + dimOf(S.fp) + ', expected ' + A)
    } })
    q.push({ run: function () {
      var n = 20
      var t = ms()
      var worst = 0
      for (var i = 0; i < n; i++) {
        var t1 = ms()
        var to = dimOf(S.fp) === A ? GATES[1] : GATES[0]
        tp(S.fp, to.dim, to.x, to.y, to.z)
        var d = ms() - t1
        if (d > worst) worst = d
      }
      note('cost', n + ' teleports in a row: mean ' + r1((ms() - t) / n) + ' ms, worst ' + r1(worst) + ' ms; ends in ' + where(S.fp))
    } })
    q.push({ run: function () {
      var g = GATES[0]
      tp(S.fp, A, g.x, g.y, g.z)
      cmd(B, 'forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    }, wait: 200 })
    q.push({ run: function () {
      var dest = GATES[1]
      var cold = !chunkLoaded(B, dest)
      var t = ms()
      tp(S.fp, B, dest.x, dest.y, dest.z)
      note('cold_destination', 'destination chunk loaded before the jump: ' + !cold + (cold ? '' : ' (still loaded, so this is not a cold test)') + '; jump ' + r1(ms() - t) + ' ms; arrived ' +
        where(S.fp) + '; chunk loaded after ' + chunkLoaded(B, dest))
      check('cold_destination_dimension', dimOf(S.fp) === B, 'the fake player ended in ' + dimOf(S.fp) + ', expected ' + B)
    }, wait: 40 })
    q.push({ run: function () {
      var dest = GATES[1]
      note('after_jump', 'fake player ' + where(S.fp) + '; destination chunk loaded 40 ticks later ' + chunkLoaded(B, dest) + '; floor under it ' +
        String(S.server.getLevel(B).getBlock(Math.floor(dest.x), 0, Math.floor(dest.z)).id))
    } })
    return q
  }

  function clear() {
    ;[A, B].forEach(function (dim) {
      cmd(dim, 'fill ' + X0 + ' 0 0 ' + X1 + ' 4 63 minecraft:air')
    })
  }
  function finish() {
    if (S.finished) return
    S.finished = true
    try { if (S.fp) tp(S.fp, A, GATES[0].x, GATES[0].y, GATES[0].z) } catch (e) { }
    try { clear() } catch (e) { }
    cmd(A, 'forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    cmd(B, 'forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
    var q = global[QUEUE]
    if (q && q[0] === NAME) q.shift()
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, moved: {}, trips: 0, route: 'none', cases: null, wait: 0 }
    S.la = server.getLevel(A)
    S.lb = server.getLevel(B)
    if (S.la === null || S.la === undefined || S.lb === null || S.lb === undefined) { check('dimension', false, A + ' and ' + B + ' must both be loaded'); finish(); return }
    cmd(A, 'forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    cmd(B, 'forceload add ' + X0 + ' 0 ' + X1 + ' 63')
  }
  function ready() {
    for (var cx = X0 >> 4; cx <= X1 >> 4; cx++) for (var cz = 0; cz <= 3; cz++) if (!S.la.hasChunk(cx, cz) || !S.lb.hasChunk(cx, cz)) return false
    return true
  }
  function setup() {
    var c = classes()
    S.fp = c.FPF.get(S.la, new c.Profile(c.UUID.fromString('00000000-0000-4000-8000-0000005301b9'), '[gg_s0_tp]'))
    S.fp.getInventory().clearContent()
    GATES.forEach(function (g) {
      var bx = Math.floor(g.x)
      var bz = Math.floor(g.z)
      cmd(g.dim, 'fill ' + (bx - 4) + ' 0 ' + (bz - 4) + ' ' + (bx + 12) + ' 0 ' + (bz + 4) + ' minecraft:stone_bricks')
      cmd(g.dim, 'fill ' + (bx - 3) + ' 0 ' + (bz - 3) + ' ' + (bx + 3) + ' 0 ' + (bz + 3) + ' minecraft:gold_block')
    })
  }

  ServerEvents.customCommand(CMD, function () {
    if (!global[QUEUE]) global[QUEUE] = []
    if (global[QUEUE].indexOf(NAME) >= 0) return 0
    global[QUEUE].push(NAME)
    return 1
  })
  ServerEvents.tick(function (event) {
    try {
      var q = global[QUEUE]
      if (S === null && q && q[0] === NAME && Date.now() - LOADED >= 10000) begin(event.server)
      if (S === null || S.finished) return
      S.tick++
      if (S.cases === null) {
        if (ready()) { setup(); S.cases = buildCases(); S.wait = S.tick + 5 }
        else if (S.tick > 600) { check('chunks', false, 'band chunks not loaded in 600 ticks'); finish() }
        return
      }
      if (S.tick < S.wait) return
      var c = S.cases.shift()
      if (!c) { finish(); return }
      try { c.run() } catch (e) { note('case_exception', errText(e)); check('exception', false, errText(e)); finish(); return }
      S.wait = S.tick + (c.wait || 2)
      if (S.tick > 3000) { check('deadline', false, '3000-tick ceiling'); finish() }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
