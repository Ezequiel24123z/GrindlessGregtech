// priority: 12550
// Gregtech Grindless - client half of the formed-multiblock shots (TEST-ONLY overlay, never shipped). Partner of
// server_scripts/gg_test_formed_shots.js; asleep unless that test sets 'hold' in the map both halves share (global.ggFormedShots).
// Same shot protocol as gg_test_gallery.js: on 'shotToken' it hides the HUD, fixes the FOV, waits until the player stands at the
// camera, the controller is in the client's world and its section is drawn, then grabs kubejs/exported/<name>.png.
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var CHM = Java.loadClass('java.util.concurrent.ConcurrentHashMap')
  if (!global.ggFormedShots) global.ggFormedShots = new CHM()
  var S = global.ggFormedShots
  var TAG = 'GGTEST|formed_shots|'
  var HOLD_MAX_MS = 60 * 60 * 1000
  var SHOT_MAX_TICKS = 400
  var SETTLE_TICKS = 20
  var RENDER_WAIT_TICKS = 160
  var FOV = 70
  var c = { holding: false, since: 0, errors: 0, ageField: null, gaveUp: false, shotDone: '', shot: null, view: null, drawnUseless: false }

  function val(key) {
    var v = S.get(key)
    return v === null || v === undefined ? '' : String(v)
  }

  function log(check, status, detail) {
    var line = TAG + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + String(detail).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/').substring(0, 1500)
    console.info(line)
  }

  function windBack(p) {
    if (c.ageField === null) {
      var names = ['age', 'tickCount', 'f_19797_']
      for (var i = 0; i < names.length; i++) {
        var v = p[names[i]]
        if (v !== undefined && v !== null && typeof v !== 'function') {
          c.ageField = names[i]
          break
        }
      }
      if (c.ageField === null) c.ageField = ''
    }
    if (c.ageField === '') return
    if (Number(p[c.ageField]) >= 80) p[c.ageField] = 20
  }

  function field(obj, names) {
    for (var i = 0; i < names.length; i++) {
      var v = obj[names[i]]
      if (v !== undefined && v !== null) return v
    }
    return null
  }

  function method(obj, names) {
    for (var i = 0; i < names.length; i++) if (typeof obj[names[i]] === 'function') return obj[names[i]]()
    return null
  }

  function options(mc) {
    return field(mc, ['options', 'f_91066_'])
  }

  function hideGui(o, v) {
    var name = o.hideGui !== undefined ? 'hideGui' : 'f_92062_'
    if (v !== undefined) o[name] = v
    return o[name] === true
  }

  function applyView(mc) {
    var o = options(mc)
    if (c.view === null) {
      c.view = { hideGui: null, fov: null, fx: null }
      try { c.view.hideGui = hideGui(o) } catch (e) { c.view.hideGui = null }
      try { c.view.fov = Number(o.fov().get()) } catch (e) { c.view.fov = null }
      try { c.view.fx = Number(o.fovEffectScale().get()) } catch (e) { c.view.fx = null }
    }
    try { hideGui(o, true) } catch (e) { }
    try { o.fovEffectScale().set(0.0) } catch (e) { }
    try { if (Number(o.fov().get()) !== FOV) o.fov().set(Java.loadClass('java.lang.Integer').valueOf(FOV)) } catch (e) { }
  }

  function restoreView(mc) {
    if (c.view === null) return
    var o = options(mc)
    try { if (c.view.hideGui !== null) hideGui(o, c.view.hideGui) } catch (e) { }
    try { if (c.view.fx !== null) o.fovEffectScale().set(c.view.fx) } catch (e) { }
    try { if (c.view.fov !== null && Number(o.fov().get()) !== c.view.fov) o.fov().set(Java.loadClass('java.lang.Integer').valueOf(c.view.fov)) } catch (e) { }
    c.view = null
  }

  function near(p, cam) {
    return Math.abs(Number(p.getX()) - cam.x) < 0.75 && Math.abs(Number(p.getY()) - cam.y) < 0.75 && Math.abs(Number(p.getZ()) - cam.z) < 0.75
  }

  function blockAt(mc, pr) {
    var level = field(mc, ['level', 'f_91073_'])
    if (level === null) return 'no level'
    try {
      return String(level.getBlock(pr.x, pr.y, pr.z).getId())
    } catch (e) {
      return 'unreadable (' + e + ')'
    }
  }

  function sectionDrawn(mc, pr) {
    try {
      var lr = field(mc, ['levelRenderer', 'f_91060_'])
      if (lr === null || typeof lr.isChunkCompiled !== 'function') return null
      return lr.isChunkCompiled(new (Java.loadClass('net.minecraft.core.BlockPos'))(pr.x, pr.y, pr.z)) === true
    } catch (e) {
      return null
    }
  }

  function grab(mc, name) {
    try { Java.loadClass('dev.latvian.mods.kubejs.KubeJSPaths').dir('kubejs/exported') } catch (e) { }
    Java.loadClass('net.minecraft.client.Screenshot').grab(field(mc, ['gameDirectory', 'f_91069_']), '../kubejs/exported/' + name + '.png',
      method(mc, ['getMainRenderTarget', 'm_91385_']), function (msg) { })
  }

  function shotStep(mc, p) {
    var tok = val('shotToken')
    if (tok === '' || tok === c.shotDone || val('shotResult') !== '') return
    if (c.shot === null || c.shot.tok !== tok) {
      c.shot = { tok: tok, req: JSON.parse(val('shotRequest')), t: 0, readyAt: -1 }
      applyView(mc)
    }
    var s = c.shot
    s.t++
    try { mc.getToasts().clear() } catch (e) { }
    var pr = s.req.probe
    var posOk = near(p, s.req.cam)
    var block = blockAt(mc, pr)
    var blockOk = block === pr.id
    var drawn = c.drawnUseless ? null : sectionDrawn(mc, pr)
    if (s.readyAt < 0 && posOk && blockOk) s.readyAt = s.t
    var waited = s.readyAt < 0 ? 0 : s.t - s.readyAt
    var ready = s.readyAt >= 0 && waited >= SETTLE_TICKS && (drawn !== false || waited >= RENDER_WAIT_TICKS)
    if (!ready && s.t < SHOT_MAX_TICKS) return
    if (drawn === false) c.drawnUseless = true

    var state = 'after ' + s.t + ' ticks: camera ' + (posOk ? 'in place' : 'not in place') + ', ' +
      (blockOk ? 'controller in the client world' : 'the client has ' + block + ' where ' + pr.id + ' stands') + ', section ' +
      (drawn === null ? 'state unknown' : drawn ? 'drawn' : 'not drawn yet')
    var ok = posOk && blockOk
    try {
      grab(mc, s.req.name)
    } catch (e) {
      ok = false
      state += '; grab failed: ' + e
    }
    S.put('shotResult', (ok ? 'PASS ' : 'FAIL ') + s.req.name + '.png ' + state)
    c.shotDone = tok
    c.shot = null
  }

  function tick() {
    var mc = Client
    var p = mc.player
    if (p === null || p === undefined) return
    if (val('hold') !== 'true' || c.gaveUp) {
      if (c.holding) {
        c.holding = false
        restoreView(mc)
      }
      return
    }
    if (!c.holding) {
      c.holding = true
      c.since = Date.now()
      log('client_hold', 'NOTE', 'keeping mc-runtime-test in the world until the server half is done')
    }
    if (Date.now() - c.since > HOLD_MAX_MS) {
      c.gaveUp = true
      restoreView(mc)
      log('client_hold', 'NOTE', 'gave up holding after ' + (HOLD_MAX_MS / 60000) + ' min')
      return
    }
    windBack(p)
    shotStep(mc, p)
  }

  ClientEvents.tick(function (event) {
    try {
      tick()
    } catch (e) {
      if (c.errors++ < 5) log('client_script', 'NOTE', 'exception: ' + e)
    }
  })
})()
