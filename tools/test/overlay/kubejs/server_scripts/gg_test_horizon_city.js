// priority: -2449
// TEST ONLY, XP-Z1a. Command: kubejs custom_command gg_test_horizon_city
// Band ONLY: X 46720-46783, Z 0-63, Y 0-130 (zones.json row horizon_city), in the shipped DIMENSION grindless:horizon_city (nothing else is built there).
//   Checks the dimension (fixed time, biome), generates the jigsaw city start on the band with Structure.generate (piece count, size, wall time are NOTEs),
//   places the structure over the band chunks, scans the band for banned blocks (ores, containers, signs), counts entities after 600 ticks,
//   and places the arrival plaza template. Every measurement is a NOTE; PASS/FAIL are for the invariants.
(function () {
  var NAME = 'horizon_city'
  var CMD = 'gg_test_horizon_city'
  var DIM = 'grindless:horizon_city'
  var QUEUE = 'ggHorizonCityQueue'
  var X0 = 46720
  var X1 = 46783
  var CEIL = 600
  var LOADED = Date.now()
  var S = null

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
  function cmd(text) { return S.server.runCommandSilent('execute in ' + DIM + ' run ' + text) }
  function r1(x) { return Math.round(x * 10) / 10 }
  function done() {
    cmd('forceload remove ' + X0 + ' 0 ' + X1 + ' 63')
    cmd('fill ' + X0 + ' 4 0 ' + X1 + ' 130 63 minecraft:air')
    console.info('GGTEST|' + NAME + '|DONE|failures=' + S.failed)
    S = null
  }

  function step1() {
    var level = null
    S.server.getAllLevels().forEach(function (l) { if (String(l.dimension.location()) === DIM) level = l })
    check('dimension_loaded', level !== null, DIM)
    if (level === null) return done()
    S.level = level
    try { check('fixed_time', level.dimensionType().fixedTime().isPresent() && level.dimensionType().fixedTime().getAsLong() == 13000, 'fixed time 13000') } catch (e) { note('fixed_time_error', errText(e)) }
    try { check('biome', String(level.getBiome(new BlockPos(X0 + 8, 10, 8)).unwrapKey().get().location()) === DIM, 'biome grindless:horizon_city') } catch (e) { note('biome_error', errText(e)) }
    cmd('forceload add ' + X0 + ' 0 ' + X1 + ' 63')
    S.t0 = Date.now()
    S.phase = 'load'
  }

  function step2() {
    var level = S.level
    var n = 0
    for (var cx = X0 >> 4; cx <= X1 >> 4; cx++) for (var cz = 0; cz <= 3; cz++) if (level.hasChunk(cx, cz)) n++
    if (n < 16 && Date.now() - S.t0 < 120000) return
    note('band_chunks', n + ' of 16 loaded after ' + r1((Date.now() - S.t0) / 1000) + ' s')
    check('band_loaded', n == 16, n + ' of 16')
    try {
      var gen = level.getChunkSource().getGenerator()
      var ChunkPos = Java.loadClass('net.minecraft.world.level.ChunkPos')
      var Rl = Java.loadClass('net.minecraft.resources.ResourceLocation')
      var reg = level.registryAccess().registryOrThrow(Java.loadClass('net.minecraft.core.registries.Registries').STRUCTURE)
      var st = reg.get(new Rl('grindless', 'horizon_city'))
      check('structure_registered', st != null, 'grindless:horizon_city')
      var w0 = Date.now()
      var start = st.generate(level.registryAccess(), gen, gen.getBiomeSource(), level.getChunkSource().randomState(), level.getStructureManager(), level.getSeed(), new ChunkPos(X0 >> 4, 0), 0, level, function (b) { return true })
      var ws = Date.now() - w0
      check('start_generated', start != null && start.isPresent(), 'start')
      if (start != null && start.isPresent()) {
        var ss = start.get().getPieces()
        var bb = start.get().getBoundingBox()
        note('start_layout', ss.size() + ' pieces, ' + (bb.maxX() - bb.minX() + 1) + 'x' + (bb.maxY() - bb.minY() + 1) + 'x' + (bb.maxZ() - bb.minZ() + 1) + ' blocks, ' + ws + ' ms')
        check('start_has_pieces', ss.size() > 8, ss.size() + ' pieces')
        check('start_fits_height', bb.maxY() < 320, 'maxY ' + bb.maxY())
      }
    } catch (e) { check('start_probe_threw', false, errText(e)) }
    cmd('place structure grindless:horizon_city ' + (X0 + 32) + ' 3 32')
    S.t1 = Date.now()
    S.phase = 'settle'
  }

  function step3() {
    if (Date.now() - S.t1 < 15000) return
    cmd('place template grindless:horizon_city/arrival_plaza ' + X0 + ' 3 0')
    S.ticks = 0
    S.phase = 'watch'
  }

  function step4() {
    S.ticks++
    if (S.ticks < CEIL) return
    var level = S.level
    var ents = 0
    level.getEntities().forEach(function (e) { if (!e.isPlayer()) ents++ })
    check('no_entities', ents == 0, ents + ' entities after ' + CEIL + ' ticks')
    var bad = 0
    var solid = 0
    var tall = 0
    var re = /(ore|chest|barrel|furnace|hopper|spawner|sign|command_block|crafting_table|beacon)/
    var Pos = Java.loadClass('net.minecraft.core.BlockPos')
    for (var x = X0; x <= X1; x++) for (var z = 0; z <= 63; z++) {
      for (var y = 3; y <= 130; y++) {
        var id = String(level.getBlockState(new Pos(x, y, z)).block.id)
        if (id === 'minecraft:air') continue
        solid++
        if (y > tall) tall = y
        if (re.test(id) && id.indexOf('minecraft:') == 0 || id.indexOf('gtceu:') == 0) bad++
      }
    }
    note('band_solid', solid + ' non-air blocks in y 3-130, tallest y ' + tall)
    check('city_present', solid > 2000, solid + ' blocks')
    check('no_banned_blocks', bad == 0, bad + ' banned blocks')
    done()
  }

  var BlockPos = Java.loadClass('net.minecraft.core.BlockPos')

  ServerEvents.customCommand(CMD, function (event) {
    if (S !== null) return
    S = { server: event.server, failed: 0, phase: 'wait', level: null }
    note('begin', 'waiting for the load window')
  })

  ServerEvents.tick(function (event) {
    if (S === null) return
    if (Date.now() - LOADED < 10000) return
    try {
      if (S.phase === 'wait') return step1()
      if (S.phase === 'load') return step2()
      if (S.phase === 'settle') return step3()
      if (S.phase === 'watch') return step4()
    } catch (e) {
      check('fixture_threw', false, errText(e))
      done()
    }
  })
})()
