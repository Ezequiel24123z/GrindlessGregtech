// TEST ONLY, XP-S0b spike S0-10 (docs/eras/maxplus.md S0 table). Command: kubejs custom_command gg_test_xp_s0_world_city
// Band ONLY: X 44800-44863, Z 0-63, Y 0-12 (zones.json row xp_s0_world_city). Dimensions gg_test:s0_plots (template workshop) and
//   gg_test:s0_city_s / s0_city_m / s0_city_l (reserved for this fixture). Never shipped.
//   Question: how big a jigsaw "city" can the bench generate before chunk generation stops being workable?
//   Plots of three sizes (16x8x16, 32x10x32, 48x12x48) are built in s0_plots and captured into the in-memory structure manager as gg_test:plot_s/m/l.
//   Each plot has a connector on its four walls, so the datapack structure gg_test:city_<v> (depth 7, up to 128 blocks from its start, one start per
//   4x4-chunk cell) grows a street grid of that plot. The fixture force-loads the 4x4 chunks of the band in the matching dimension and measures real
//   chunk generation: wall time to load them, main-thread tick gaps, memory, the start's piece count and size, and how much of the band the city covers.
//   Pieces outside the band are laid out (the start is computed whole) but never placed, because no chunk there is loaded.
//   Every measurement is a NOTE (the answer); PASS/FAIL only check the fixture itself.
(function () {
  var NAME = 'xp_s0_world_city'
  var CMD = 'gg_test_xp_s0_world_city'
  var WORK = 'gg_test:s0_plots'
  var QUEUE = 'ggXpS0Queue'
  var X0 = 44800
  var X1 = 44863
  var CEIL = 900
  var VARS = [
    { v: 's', w: 16, h: 8, d: 16 },
    { v: 'm', w: 32, h: 10, d: 32 },
    { v: 'l', w: 48, h: 12, d: 48 }
  ]
  var LOADED = Date.now()
  var S = null
  var C = null

  function classes() {
    if (C !== null) return C
    C = { Rt: Java.loadClass('java.lang.Runtime') }
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
  function r1(x) { return Math.round(x * 10) / 10 }
  function usedMb() {
    var rt = classes().Rt.getRuntime()
    return Math.round((Number(rt.totalMemory()) - Number(rt.freeMemory())) / 1048576)
  }
  function cityDim(v) { return 'gg_test:s0_city_' + v }
  function bandLoaded(level) {
    var n = 0
    for (var cx = X0 >> 4; cx <= X1 >> 4; cx++) for (var cz = 0; cz <= 3; cz++) if (level.hasChunk(cx, cz)) n++
    return n
  }
  function clearBox(dim) {
    cmd(dim, 'fill ' + X0 + ' 0 0 ' + X1 + ' 7 63 minecraft:air')
    cmd(dim, 'fill ' + X0 + ' 8 0 ' + X1 + ' 12 63 minecraft:air')
  }

  function buildPlot(p) {
    var ox = X0
    var oz = 0
    var x1 = ox + p.w - 1
    var z1 = oz + p.d - 1
    var pool = 'gg_test:city/grid_' + p.v
    cmd(WORK, 'fill ' + ox + ' 0 ' + oz + ' ' + x1 + ' ' + (p.h - 1) + ' ' + z1 + ' minecraft:stone_bricks hollow')
    var nbt = '{name:"gg_test:link",target:"gg_test:link",pool:"' + pool + '",final_state:"minecraft:stone_bricks",joint:"aligned"}'
    var mx = ox + (p.w >> 1)
    var mz = oz + (p.d >> 1)
    cmd(WORK, 'setblock ' + mx + ' 1 ' + oz + ' minecraft:jigsaw[orientation=north_up]' + nbt)
    cmd(WORK, 'setblock ' + mx + ' 1 ' + z1 + ' minecraft:jigsaw[orientation=south_up]' + nbt)
    cmd(WORK, 'setblock ' + ox + ' 1 ' + mz + ' minecraft:jigsaw[orientation=west_up]' + nbt)
    cmd(WORK, 'setblock ' + x1 + ' 1 ' + mz + ' minecraft:jigsaw[orientation=east_up]' + nbt)
    var Pos = Java.loadClass('net.minecraft.core.BlockPos')
    var Vec3i = Java.loadClass('net.minecraft.core.Vec3i')
    var Blocks = Java.loadClass('net.minecraft.world.level.block.Blocks')
    var Rl = Java.loadClass('net.minecraft.resources.ResourceLocation')
    var tpl = S.server.getStructureManager().getOrCreate(new Rl('gg_test:plot_' + p.v))
    tpl.fillFromWorld(S.lw, new Pos(ox, 0, oz), new Vec3i(p.w, p.h, p.d), false, Blocks.STRUCTURE_VOID)
    var sz = tpl.getSize()
    var jig = String(S.lw.getBlock(mx, 1, oz).id)
    note('template_' + p.v, 'captured gg_test:plot_' + p.v + ' size ' + sz.getX() + 'x' + sz.getY() + 'x' + sz.getZ() + ' (asked ' + p.w + 'x' + p.h + 'x' + p.d + '); connector block in the world ' + jig)
    check('template_' + p.v + '_size', Number(sz.getX()) === p.w && Number(sz.getY()) === p.h && Number(sz.getZ()) === p.d, 'captured size ' + sz.getX() + 'x' + sz.getY() + 'x' + sz.getZ())
    cmd(WORK, 'fill ' + ox + ' 0 ' + oz + ' ' + x1 + ' ' + (p.h - 1) + ' ' + z1 + ' minecraft:air')
  }

  function startInfo(level) {
    var pieces = 0
    var starts = 0
    var bb = ''
    for (var cx = X0 >> 4; cx <= X1 >> 4; cx++) {
      for (var cz = 0; cz <= 3; cz++) {
        var arr = level.getChunk(cx, cz).getAllStarts().values().toArray()
        for (var i = 0; i < arr.length; i++) {
          var st = arr[i]
          if (!st.isValid()) continue
          starts++
          pieces += Number(st.getPieces().size())
          var b = st.getBoundingBox()
          bb += ' [start chunk ' + cx + ',' + cz + ': ' + st.getPieces().size() + ' pieces, box ' + (Number(b.maxX()) - Number(b.minX()) + 1) + 'x' + (Number(b.maxY()) - Number(b.minY()) + 1) + 'x' +
            (Number(b.maxZ()) - Number(b.minZ()) + 1) + ' at ' + b.minX() + ',' + b.minZ() + ']'
        }
      }
    }
    return { starts: starts, pieces: pieces, text: bb }
  }
  function coverage(level) {
    var hit = 0
    var all = 0
    for (var x = X0; x <= X1; x += 2) {
      for (var z = 0; z <= 63; z += 2) {
        all++
        if (String(level.getBlock(x, 0, z).id) !== 'minecraft:air') hit++
      }
    }
    return r1(100 * hit / all)
  }

  function variantSteps(p) {
    var dim = cityDim(p.v)
    var st = []
    st.push({ run: function () { buildPlot(p) } })
    st.push({
      run: function () {
        S.level = S.server.getLevel(dim)
        if (S.level === null || S.level === undefined) { check('dimension_' + p.v, false, dim + ' is not loaded'); S.timedOut = true; return }
        S.gaps = []
        S.mem0 = usedMb()
        S.t0 = Date.now()
        cmd(dim, 'forceload add ' + X0 + ' 0 ' + X1 + ' 63')
      },
      poll: function () {
        if (S.timedOut) return true
        var n = bandLoaded(S.level)
        var tk = S.tick - this.t
        if (n < 16 && tk <= CEIL) return false
        var ms = Date.now() - S.t0
        var g = S.gaps
        var mean = 0
        var max = 0
        for (var i = 0; i < g.length; i++) { mean += g[i]; if (g[i] > max) max = g[i] }
        mean = g.length ? mean / g.length : 0
        var tail = ' | wall ' + ms + ' ms, ' + tk + ' ticks; loaded chunks ' + n + '/16; tick gap mean ' + r1(mean) + ' ms, max ' + max + ' ms; server average tick ' + r1(Number(S.server.getAverageTickTime())) +
          ' ms; heap ' + S.mem0 + ' -> ' + usedMb() + ' MB'
        if (n < 16) {
          note('city_' + p.v, 'TIMEOUT: the band did not finish loading in ' + CEIL + ' ticks (' + p.w + 'x' + p.d + ' plots)' + tail)
        } else {
          var si = startInfo(S.level)
          note('city_' + p.v, 'plots ' + p.w + 'x' + p.h + 'x' + p.d + '; starts in band ' + si.starts + ', pieces ' + si.pieces + si.text + '; floor coverage of the band ' + coverage(S.level) + '%' + tail)
        }
        S.timedOut = n < 16
        return true
      }
    })
    st.push({
      run: function () {
        try { clearBox(dim) } catch (e) { note('clear_' + p.v, errText(e)) }
        cmd(dim, 'forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
        S.timedOut = false
      }
    })
    return st
  }

  function finish() {
    if (S.finished) return
    S.finished = true
    try { clearBox(WORK) } catch (e) { }
    VARS.forEach(function (p) { try { clearBox(cityDim(p.v)) } catch (e) { } cmd(cityDim(p.v), 'forceload remove ' + X0 + ' 0 ' + X1 + ' 63') })
    cmd(WORK, 'forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
    var q = global[QUEUE]
    if (q && q[0] === NAME) q.shift()
  }
  function begin(server) {
    S = { server: server, tick: 0, failed: 0, finished: false, steps: [], cur: null, wait: 0, gaps: [], last: 0, timedOut: false, ready: false }
    S.lw = server.getLevel(WORK)
    if (S.lw === null || S.lw === undefined) { check('dimension', false, WORK + ' must be loaded'); finish(); return }
    cmd(WORK, 'forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    VARS.forEach(function (p) { S.steps = S.steps.concat(variantSteps(p)) })
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
      var now = Date.now()
      if (S.last > 0) S.gaps.push(now - S.last)
      S.last = now
      if (!S.ready) {
        if (bandLoaded(S.lw) === 16) { S.ready = true; S.wait = S.tick + 5 }
        else if (S.tick > 600) { check('chunks', false, 'workshop chunks not loaded in 600 ticks'); finish() }
        return
      }
      if (S.tick < S.wait) return
      if (S.cur === null) {
        S.cur = S.steps.shift()
        if (!S.cur) { finish(); return }
        S.cur.started = false
      }
      var c = S.cur
      try {
        if (!c.started) {
          c.started = true
          c.t = S.tick
          c.run()
          if (!c.poll) { S.cur = null; S.wait = S.tick + 2 }
          return
        }
        if (c.poll()) { S.cur = null; S.wait = S.tick + 2 }
      } catch (e) {
        note('step_exception', errText(e))
        check('exception', false, errText(e))
        finish()
      }
    } catch (e) {
      if (S === null) S = { server: event.server, failed: 0, finished: false }
      check('exception', false, errText(e))
      finish()
    }
  })
})()
