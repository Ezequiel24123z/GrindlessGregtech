// priority: -1949
// Gregtech Grindless - test overlay (not shipped with the pack). RF-3B: one screenshot of every multiblock in its FORMED state
// (client suite only; the client half is client_scripts/gg_test_formed_shots.js, same JVM, talking through global.ggFormedShots).
//
// Per multiblock definition of GTRegistries.MACHINES (GTM, add-ons and ours, sorted by id): its first preview shape
// (MultiblockMachineDefinition#getMatchingShapes, what the EMI preview and QR-B1's gg_test_form_sweep.js place) is built in the
// form_sweep band, GTM's pattern check forms the controller (as gg_test_form_sweep.js; `forced` when our explicit check was needed),
// the spectator player is put at an oblique camera in front of the controller and the client half grabs
// kubejs/exported/gg_formed_<id with ':' and '/' as '__'>.png. A definition with no shape, a shape that does not fit the cell or an
// exception is not shot: the reason goes to the manifest and a NOTE line.
//
// HOW TO RUN (client suite; see docs/testing/usage.md): copy tools\test\overlay to a scratch folder, set
// kubejs\config\gg_test_formed_shots.json = {"enabled": true, "from": 0, "limit": 60, "budgetSec": 900}, then
//   powershell -File tools\test\Invoke-GGTest.ps1 -Suite client -OverlayDir <that folder> -EmiAuditClientXmx 8G -Slots 1 -EmiAuditTimeoutSec 1800
// Keys (all optional but enabled): from, limit (cursor into the sorted ids), ids (explicit list, wins), budgetSec (wall clock after
// the first shot; the run stops and prints next=<cursor>), tag.
//
// Output: kubejs/exported/gg_formed_shots_manifest.json (one row per id) and, per id,
//   GGTEST|formed_shots|<id>|PASS|<shot file> <W>x<H>x<D> formed[, forced] xei=<bool> shapes=<n>
//   GGTEST|formed_shots|<id>|NOTE|<why there is no shot, or not formed>
//   GGTEST|formed_shots|DONE|shots=<n> notes=<n> next=<cursor|none>
// TEST AREA: the form_sweep band (X 36064-36127, Z 0-127, Y 100-163; zones.json "form_sweep"); never run together with the sweep.
// var + function everywhere: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var TAG = 'GGTEST|formed_shots|'
  var MARKER = 'kubejs/config/gg_test_formed_shots.json'
  var MANIFEST = 'kubejs/exported/gg_formed_shots_manifest.json'
  var REQ = 'ggTestFormedShotsRequest'
  var QUIET_MS = 10000
  var LOADED_AT = Date.now()
  var X0 = 36064
  var X1 = 36127
  var Z0 = 0
  var Z1 = 127
  var Y0 = 100
  var Y1 = 163
  var ORIGIN = { x: X0 + 8, y: Y0 + 2, z: Z0 + 8 }
  var EYE = 1.62
  var START_TICKS = 40
  var AIM_TICKS = 6
  var SHOT_TIMEOUT = 700
  var TEST_TIMEOUT = 240000
  var T = null
  var C = null

  function classes() {
    if (C !== null) return C
    C = {
      RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
      Pos: Java.loadClass('net.minecraft.core.BlockPos'),
      ArrayList: Java.loadClass('java.util.ArrayList'),
      Meta: Java.loadClass('com.gregtechceu.gtceu.api.machine.MetaMachine'),
      MMD: Java.loadClass('com.gregtechceu.gtceu.api.machine.MultiblockMachineDefinition'),
      Registries: Java.loadClass('com.gregtechceu.gtceu.api.registry.GTRegistries')
    }
    return C
  }

  function shared() {
    if (!global.ggFormedShots) global.ggFormedShots = new (Java.loadClass('java.util.concurrent.ConcurrentHashMap'))()
    return global.ggFormedShots
  }
  function sval(key) {
    var v = shared().get(key)
    return v === null || v === undefined ? '' : String(v)
  }
  function clean(x) { return String(x).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500) }
  function emit(id, status, detail) {
    var line = TAG + id + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + clean(detail)
    console.info(line)
  }
  function errText(e) {
    var s = ''
    try { s = String(e.message || e) } catch (x) { }
    try { s += ' @' + String(e.stack || '').split('\n').slice(0, 3).join(' ') } catch (x) { }
    return s === '' ? 'unprintable exception' : s
  }
  function array(collection) {
    var list = new (classes().ArrayList)(collection)
    var out = []
    for (var i = 0; i < list.size(); i++) out.push(list.get(i))
    return out
  }
  function pos(x, y, z) { return new (classes().Pos)(x, y, z) }
  function cmd(text) { return Number(T.server.runCommandSilent(text)) }
  function fileOf(id) { return 'gg_formed_' + String(id).replace(/[:\/]/g, '__') }

  function readConfig() {
    try {
      var j = JsonIO.readJson(MARKER)
      if (j === null || j === undefined) return null
      return JSON.parse(String(JsonIO.toPrettyString(j)))
    } catch (e) {
      return null
    }
  }

  function testPlayer(server) {
    var list = array(server.getPlayerList().getPlayers())
    for (var i = 0; i < list.length; i++) {
      var p = list[i]
      if (T.playerName === '' || String(p.getName().getString()) === T.playerName) return p
    }
    return null
  }

  function selectIds(cfg) {
    var all = []
    array(classes().Registries.MACHINES.values()).forEach(function (d) {
      if (d instanceof classes().MMD) all.push(String(d.getId()))
    })
    all.sort()
    var ids = all
    if (cfg.ids && cfg.ids.length > 0) ids = cfg.ids.map(String)
    var from = Number(cfg.from) > 0 ? Number(cfg.from) : 0
    var limit = Number(cfg.limit) > 0 ? Number(cfg.limit) : ids.length
    return { total: ids.length, from: from, end: Math.min(ids.length, from + limit), ids: ids.slice(from, from + limit), registered: all.length }
  }

  // the first preview shape as cells {x, y, z, state, id}, its W x H x D and the controller cell, plus the diagnostics of the definition
  function readShape(id) {
    var def = classes().Registries.MACHINES.get(new (classes().RL)(id))
    if (def === null || def === undefined) return { error: 'no machine definition' }
    var info = { xei: null, shapes: 0 }
    try { info.xei = def.isRenderXEIPreview() === true } catch (e0) { info.xei = null }
    var shapes = []
    try {
      shapes = array(def.getMatchingShapes())
    } catch (e1) {
      info.error = 'getMatchingShapes threw: ' + errText(e1)
      return info
    }
    info.shapes = shapes.length
    if (shapes.length === 0) {
      info.error = 'no preview shape (getMatchingShapes is empty)'
      return info
    }
    var blocks = shapes[0].getBlocks()
    var cells = []
    var ctrl = null
    var w = blocks.length
    var h = 0
    var d = 0
    for (var x = 0; x < blocks.length; x++) {
      h = Math.max(h, blocks[x].length)
      for (var y = 0; y < blocks[x].length; y++) {
        d = Math.max(d, blocks[x][y].length)
        for (var z = 0; z < blocks[x][y].length; z++) {
          var bi = blocks[x][y][z]
          if (bi === null || bi === undefined) continue
          var state = bi.getBlockState()
          var bid = String(Block.getId(state.getBlock()))
          if (bid === 'minecraft:air') continue
          var cell = { x: x, y: y, z: z, state: state, id: bid }
          if (bid === id) ctrl = cell
          cells.push(cell)
        }
      }
    }
    if (ctrl === null) {
      info.error = 'the preview has no controller block'
      return info
    }
    info.cells = cells
    info.ctrl = ctrl
    info.w = w
    info.h = h
    info.d = d
    return info
  }

  function clearBox(w, h, d) {
    var x1 = Math.min(X1, ORIGIN.x + w + 1)
    var z1 = Math.min(Z1, ORIGIN.z + d + 1)
    var y1 = Math.min(Y1, ORIGIN.y + h + 1)
    for (var y = Y0; y <= y1; y++) cmd('fill ' + X0 + ' ' + y + ' ' + Z0 + ' ' + x1 + ' ' + y + ' ' + z1 + ' minecraft:air')
  }

  function setup(server, p) {
    T.playerName = String(p.getName().getString())
    var o = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, mode: 'survival' }
    try {
      o.x = Number(p.getX())
      o.y = Number(p.getY())
      o.z = Number(p.getZ())
      o.yaw = Number(p.getYaw())
      o.pitch = Number(p.getPitch())
    } catch (e) {
      var spawn = p.getLevel().getSharedSpawnPos()
      o.x = Number(spawn.getX()) + 0.5
      o.y = Number(spawn.getY()) + 1
      o.z = Number(spawn.getZ()) + 0.5
    }
    try { o.mode = p.isCreative() ? 'creative' : 'survival' } catch (e2) { o.mode = 'survival' }
    T.origin = o
    var sel = selectIds(T.cfg)
    T.sel = sel
    T.queue = sel.ids.slice()
    emit('selection', 'NOTE', sel.ids.length + ' ids (' + sel.from + '..' + sel.end + ' of ' + sel.total + '), ' + sel.registered + ' multiblock definitions registered')
    cmd('forceload add ' + X0 + ' ' + Z0 + ' ' + X1 + ' ' + Z1)
    cmd('time set 6000')
    cmd('weather clear')
    T.cycle = cmd('gamerule doDaylightCycle false')
    cmd('gamemode spectator ' + T.playerName)
    shared().put('shotToken', '')
    shared().put('shotResult', '')
    clearBox(Math.min(60, X1 - ORIGIN.x), Math.min(60, Y1 - ORIGIN.y), 120)
    T.maxW = 0
    T.maxH = 0
    T.maxD = 0
  }

  function facing(m) {
    try {
      var f = m.getFrontFacing()
      return { x: Number(f.getStepX()), z: Number(f.getStepZ()) }
    } catch (e) {
      return { x: 0, z: -1 }
    }
  }

  // camera on the controller's front side, turned 35 degrees off its axis, 20 degrees above the structure's centre
  function camera(shape, f) {
    var cx = ORIGIN.x + shape.w / 2
    var cy = ORIGIN.y + shape.h / 2
    var cz = ORIGIN.z + shape.d / 2
    var r = 0.5 * Math.sqrt(shape.w * shape.w + shape.h * shape.h + shape.d * shape.d)
    var dist = Math.min(110, Math.max(7, 1.5 * r + 3))
    var hx = f.x
    var hz = f.z
    if (hx === 0 && hz === 0) hz = -1
    var a = 35 * Math.PI / 180
    var dx = hx * Math.cos(a) - hz * Math.sin(a)
    var dz = hx * Math.sin(a) + hz * Math.cos(a)
    var el = 20 * Math.PI / 180
    var camX = cx + dx * Math.cos(el) * dist
    var camY = cy + Math.sin(el) * dist
    var camZ = cz + dz * Math.cos(el) * dist
    var lx = cx - camX
    var ly = cy - camY
    var lz = cz - camZ
    var yaw = Math.atan2(-lx, lz) * 180 / Math.PI
    var pitch = -Math.atan2(ly, Math.sqrt(lx * lx + lz * lz)) * 180 / Math.PI
    return { x: camX, y: camY - EYE, z: camZ, yaw: yaw, pitch: pitch, dist: Math.round(dist) }
  }

  function row(id, status, extra) {
    var r = { id: id, ns: String(id).split(':')[0], status: status, shot: null, formed: null, forced: false, xei: null, shapes: 0, size: null, note: '' }
    for (var k in extra) r[k] = extra[k]
    T.rows.push(r)
    return r
  }

  function placeCurrent(server, p) {
    var id = T.queue.shift()
    T.cursor = T.sel.end - T.queue.length
    var cur = { id: id, at: T.t, level: p.getLevel() }
    T.cur = cur
    if (T.maxW > 0) clearBox(T.maxW, T.maxH, T.maxD)
    T.maxW = 0
    T.maxH = 0
    T.maxD = 0
    var shape = readShape(id)
    if (shape.error) {
      row(id, 'noshape', { xei: shape.xei, shapes: shape.shapes, note: shape.error })
      emit(id, 'NOTE', 'no shot: ' + shape.error + ' xei=' + shape.xei)
      T.notes++
      T.cur = null
      return
    }
    var size = shape.w + 'x' + shape.h + 'x' + shape.d
    var fits = ORIGIN.x + shape.w - 1 <= X1 && ORIGIN.z + shape.d - 1 <= Z1 && ORIGIN.y + shape.h - 1 <= Y1
    if (!fits) {
      row(id, 'toolarge', { xei: shape.xei, shapes: shape.shapes, size: size, note: 'does not fit the cell' })
      emit(id, 'NOTE', 'no shot: the preview ' + size + ' does not fit the cell (' + (X1 - ORIGIN.x + 1) + 'x' + (Y1 - ORIGIN.y + 1) + 'x' + (Z1 - ORIGIN.z + 1) + ')')
      T.notes++
      T.cur = null
      return
    }
    T.maxW = shape.w
    T.maxH = shape.h
    T.maxD = shape.d
    var ctrlPos = null
    shape.cells.forEach(function (c) {
      var bp = pos(ORIGIN.x + c.x, ORIGIN.y + c.y, ORIGIN.z + c.z)
      if (c === shape.ctrl) { ctrlPos = bp; return }
      cur.level.setBlock(bp, c.state, 18)
    })
    cur.level.setBlock(ctrlPos, shape.ctrl.state, 3)
    cur.shape = shape
    cur.size = size
    cur.ctrl = ctrlPos
    T.phase = 'form'
  }

  function formCurrent(server, p) {
    var cur = T.cur
    var shape = cur.shape
    var m = classes().Meta.getMachine(cur.level, cur.ctrl)
    var formed = false
    var forced = false
    var note = ''
    if (!m) {
      note = 'no machine at the controller block'
    } else if (m.isFormed()) {
      formed = true
    } else {
      try {
        if (m.checkPatternWithLock()) { m.setFlipped(m.getMultiblockState().isNeededFlip()); m.onStructureFormed(); forced = m.isFormed() }
        formed = forced
        if (!formed) note = 'GTM pattern check refused the preview shape'
      } catch (e) {
        note = 'explicit pattern check threw: ' + errText(e)
      }
    }
    cur.formed = formed
    cur.forced = forced
    cur.note = note
    var cam = camera(shape, m ? facing(m) : { x: 0, z: -1 })
    cur.cam = cam
    p.teleportTo('minecraft:overworld', cam.x, cam.y, cam.z, cam.yaw, cam.pitch)
    T.phase = 'aim'
    T.since = T.t
  }

  function requestShot() {
    var cur = T.cur
    shared().put('shotResult', '')
    shared().put('shotRequest', JSON.stringify({ name: fileOf(cur.id), cam: { x: cur.cam.x, y: cur.cam.y, z: cur.cam.z },
      probe: { x: cur.ctrl.getX(), y: cur.ctrl.getY(), z: cur.ctrl.getZ(), id: cur.id } }))
    shared().put('shotToken', 's' + T.t)
    T.phase = 'shot'
    T.since = T.t
  }

  function closeCurrent(result) {
    var cur = T.cur
    var ok = result.indexOf('PASS') === 0
    var detail = cur.size + (cur.formed ? ' formed' + (cur.forced ? ', forced' : '') : ' NOT formed') + ' xei=' + cur.shape.xei + ' shapes=' + cur.shape.shapes
    if (ok) {
      T.shots++
      row(cur.id, 'shot', { shot: fileOf(cur.id) + '.png', formed: cur.formed, forced: cur.forced, xei: cur.shape.xei, shapes: cur.shape.shapes,
        size: cur.size, note: cur.note, camDist: cur.cam.dist, client: result.substring(0, 300) })
      emit(cur.id, 'PASS', fileOf(cur.id) + '.png ' + detail + (cur.note ? '; ' + cur.note : ''))
    } else {
      T.failed++
      row(cur.id, 'shotfail', { formed: cur.formed, forced: cur.forced, xei: cur.shape.xei, shapes: cur.shape.shapes, size: cur.size,
        note: cur.note + ' ' + result, camDist: cur.cam.dist })
      emit(cur.id, 'FAIL', 'no screenshot: ' + (result === '' ? 'the client never answered' : result) + ' (' + detail + ')')
    }
    if (!cur.formed) T.notes++
    T.cur = null
    T.phase = 'next'
  }

  function writeManifest() {
    var doc = { format: 'gg-formed-shots-1', time: new Date().toISOString(), tag: String(T.cfg.tag || ''), from: T.sel.from, end: T.sel.end,
      total: T.sel.total, next: T.queue.length === 0 ? null : T.cursor, rows: T.rows }
    try {
      try { Java.loadClass('dev.latvian.mods.kubejs.KubeJSPaths').dir('kubejs/exported') } catch (e0) { }
      JsonIO.write(MANIFEST, Java.loadClass('com.google.gson.JsonParser').parseString(JSON.stringify(doc)))
      emit('manifest', 'NOTE', MANIFEST + ': ' + T.rows.length + ' rows')
    } catch (e) {
      emit('manifest', 'NOTE', 'could not write ' + MANIFEST + ': ' + errText(e))
    }
  }

  function finish(server) {
    if (T === null || T.finished) return
    T.finished = true
    try { writeManifest() } catch (e0) { }
    try {
      var p = testPlayer(server)
      if (p !== null && T.origin !== null) {
        p.teleportTo('minecraft:overworld', T.origin.x, T.origin.y, T.origin.z, T.origin.yaw, T.origin.pitch)
        cmd('gamemode ' + T.origin.mode + ' ' + T.playerName)
      }
    } catch (e) { emit('restore', 'NOTE', 'failed: ' + errText(e)) }
    try { if (T.maxW > 0) clearBox(T.maxW, T.maxH, T.maxD) } catch (e2) { }
    cmd('forceload remove ' + X0 + ' ' + Z0 + ' ' + X1 + ' ' + Z1)
    if (T.cycle !== null) cmd('gamerule doDaylightCycle true')
    shared().put('hold', false)
    global[REQ + 'Done'] = true
    emit('DONE', 'NOTE', 'shots=' + T.shots + ' failed=' + T.failed + ' notes=' + T.notes + ' ids=' + T.rows.length + ' next=' + (T.queue.length === 0 ? 'none' : T.cursor))
    console.info(TAG + 'DONE')
  }

  function step(server) {
    var p = testPlayer(server)
    if (p === null) {
      emit('player_present', 'FAIL', 'the test player left during ' + T.phase)
      T.failed++
      finish(server)
      return
    }
    var age = T.t - T.since
    if (T.phase === 'start') {
      if (age < START_TICKS) return
      setup(server, p)
      T.phase = 'next'
      return
    }
    if (T.phase === 'next') {
      if (T.queue.length === 0) { finish(server); return }
      if (T.started > 0 && Date.now() - T.started > Number(T.cfg.budgetSec || 900) * 1000) { finish(server); return }
      placeCurrent(server, p)
      return
    }
    if (T.phase === 'form') {
      formCurrent(server, p)
      return
    }
    if (T.phase === 'aim') {
      if (age < AIM_TICKS) return
      if (T.started === 0) T.started = Date.now()
      requestShot()
      return
    }
    if (T.phase === 'shot') {
      var r = sval('shotResult')
      if (r === '' && age < SHOT_TIMEOUT) return
      closeCurrent(r)
    }
  }

  function onTick(server) {
    if (global[REQ] && T === null && Date.now() - LOADED_AT >= QUIET_MS && Date.now() >= Number(global[REQ + 'At'] || 0)) {
      global[REQ] = false
      T = { t: 0, tick0: server.getTickCount(), phase: 'start', since: 0, finished: false, playerName: '', server: server, cfg: readConfig() || {},
        origin: null, cycle: null, queue: [], rows: [], cur: null, cursor: 0, shots: 0, failed: 0, notes: 0, started: 0, maxW: 0, maxH: 0, maxD: 0, sel: null }
    }
    if (T === null || T.finished) return
    T.server = server
    T.t = server.getTickCount() - T.tick0
    if (T.t > TEST_TIMEOUT) {
      emit('timeout', 'FAIL', 'the test ran ' + T.t + ' ticks; phase ' + T.phase)
      T.failed++
      finish(server)
      return
    }
    try {
      step(server)
    } catch (e) {
      emit('step', 'FAIL', 'exception in ' + T.phase + (T.cur ? ' (' + T.cur.id + ')' : '') + ': ' + errText(e))
      T.failed++
      if (T.cur !== null) {
        row(T.cur.id, 'error', { note: 'exception in ' + T.phase + ': ' + errText(e) })
        T.cur = null
        T.phase = 'next'
        if (T.failed > 8) finish(server)
      } else {
        finish(server)
      }
    }
  }

  ServerEvents.tick(function (event) {
    onTick(event.server)
  })

  PlayerEvents.loggedIn(function (event) {
    if (global[REQ + 'Done'] || T !== null) return
    var cfg = readConfig()
    if (cfg === null || String(cfg.enabled) !== 'true') return
    global[REQ + 'At'] = Date.now() + 5000
    global[REQ] = true
    shared().put('hold', true)
    shared().put('shotToken', '')
    emit('armed', 'NOTE', 'player ' + event.player.getName().getString() + ' joined and ' + MARKER + ' is enabled: the formed shots start in a few seconds')
  })
})()
