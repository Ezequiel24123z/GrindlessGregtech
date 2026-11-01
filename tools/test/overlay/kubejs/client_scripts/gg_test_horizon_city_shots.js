// priority: 12276
// TEST ONLY, P9-T3a. Client half; partner of server_scripts/gg_test_horizon_city_shots.js (asleep unless it sets 'hold' in global.ggCityShots).
// Keeps mc-runtime-test in the world, hides the HUD, fixes the FOV and, on a shot request, waits until the player stands at the camera and the
// probe block is in the client's world, then settles for request.settle ticks and grabs kubejs/exported/<name>.png (the shot protocol of
// gg_test_formed_shots.js). Sets 'idle' once the client has been screen-free for 60 ticks.
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var CHM = Java.loadClass('java.util.concurrent.ConcurrentHashMap')
  if (!global.ggCityShots) global.ggCityShots = new CHM()
  var S = global.ggCityShots
  var TAG = 'GGTEST|horizon_city_shots|client|'
  var FOV = 70
  var SHOT_MAX_TICKS = 600
  var c = { quiet: 0, errors: 0, shotDone: '', shot: null, view: null }

  function val(key) {
    var v = S.get(key)
    return v === null || v === undefined ? '' : String(v)
  }
  function log(status, detail) {
    console.info(TAG + status + (detail ? '|' + String(detail).replace(/[\r\n|]+/g, ' ').substring(0, 1000) : ''))
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
  function hideGui(o, v) {
    var name = o.hideGui !== undefined ? 'hideGui' : 'f_92062_'
    if (v !== undefined) o[name] = v
    return o[name] === true
  }
  function applyView(mc) {
    var o = field(mc, ['options', 'f_91066_'])
    if (c.view === null) {
      c.view = { hideGui: null, fov: null }
      try { c.view.hideGui = hideGui(o) } catch (e) { }
      try { c.view.fov = Number(o.fov().get()) } catch (e) { }
    }
    try { hideGui(o, true) } catch (e) { }
    try { if (Number(o.fov().get()) !== FOV) o.fov().set(Java.loadClass('java.lang.Integer').valueOf(FOV)) } catch (e) { }
  }
  function restoreView(mc) {
    if (c.view === null) return
    var o = field(mc, ['options', 'f_91066_'])
    try { if (c.view.hideGui !== null) hideGui(o, c.view.hideGui) } catch (e) { }
    try { if (c.view.fov !== null) o.fov().set(Java.loadClass('java.lang.Integer').valueOf(c.view.fov)) } catch (e) { }
    c.view = null
  }
  function near(p, cam) {
    return Math.abs(Number(p.getX()) - cam.x) < 0.75 && Math.abs(Number(p.getY()) + 1.62 - cam.y) < 0.9 && Math.abs(Number(p.getZ()) - cam.z) < 0.75
  }
  function blockAt(mc, pr) {
    var level = field(mc, ['level', 'f_91073_'])
    if (level === null) return 'no level'
    try { return String(level.getBlock(pr.x, pr.y, pr.z).getId()) } catch (e) { return 'unreadable' }
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
    var posOk = near(p, s.req.cam)
    var block = blockAt(mc, s.req.probe)
    var blockOk = block === s.req.probe.id && block !== 'minecraft:air'
    if (s.readyAt < 0 && posOk && blockOk) s.readyAt = s.t
    var ready = s.readyAt >= 0 && s.t - s.readyAt >= Number(s.req.settle || 60)
    if (!ready && s.t < SHOT_MAX_TICKS) return
    var ok = posOk && blockOk
    var state = 'after ' + s.t + ' ticks: camera ' + (posOk ? 'in place' : 'not in place') + ', block ' + block + (blockOk ? ' as expected' : ' where ' + s.req.probe.id + ' was wanted')
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

  ClientEvents.tick(function () {
    try {
      var mc = Client
      var p = mc.player
      if (p === null || p === undefined) return
      if (val('hold') !== 'true') {
        if (val('hold') === 'false') restoreView(mc)
        return
      }
      if (Number(p.age) >= 80) p.age = 20
      if (mc.screen === null || mc.screen === undefined) {
        c.quiet++
        if (c.quiet >= 60) S.put('idle', 'true')
      } else {
        c.quiet = 0
      }
      shotStep(mc, p)
    } catch (e) {
      if (c.errors++ < 5) log('NOTE', 'exception: ' + e)
    }
  })
})()
