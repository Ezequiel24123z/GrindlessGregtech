// priority: 11550
// UXV-B1: client half of gg_test_uxv_kerr_sling_sky (derived from client_scripts/gg_test_uv_travel.js, trimmed to the sky). TEST-ONLY overlay: copied
// over the instance on the test PC, never shipped with the pack. Asleep unless the server test sets 'hold' in the map it shares with this script
// (global.ggUxvKerrSling: in the client suite both halves run in the same JVM).
//
// While the test runs it keeps mc-runtime-test in the world (it quits on the first client tick with the player loaded and tickCount >= 100: the
// player's tick counter is wound back until the server test prints DONE, or 30 minutes pass), reports when EMI has loaded ('emiReady': the server
// leg waits for it, so the dimension change never lands inside EMI's reload), the dimension the client sees, whether the
// sky renderer's resource exists, and takes a screenshot into kubejs/exported/ when the server test asks for it ('shot').
// KubeJS renames Entity.tickCount to age for scripts, so the field is read by the KubeJS name first, then the Mojang and SRG names.
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var CHM = Java.loadClass('java.util.concurrent.ConcurrentHashMap')
  if (!global.ggUxvKerrSling) global.ggUxvKerrSling = new CHM()
  var S = global.ggUxvKerrSling
  var TAG = 'GGTEST|uxv_kerr_sling|'
  var HOLD_MAX_MS = 30 * 60 * 1000
  var c = { holding: false, since: 0, lastDim: '', errors: 0, windNoted: false, skyNoted: false }
  var K = null
  var TICK = ['age', 'tickCount', 'f_19797_']

  function k() {
    if (K === null) {
      K = {
        RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
        Screenshot: Java.loadClass('net.minecraft.client.Screenshot'),
        Paths: Java.loadClass('dev.latvian.mods.kubejs.KubeJSPaths')
      }
    }
    return K
  }

  function log(check, status, detail) {
    var line = TAG + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + String(detail).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/')
    console.info(line)
  }

  function val(key) {
    var v = S.get(key)
    return v === null || v === undefined ? '' : String(v)
  }

  function jget(obj, names) {
    for (var i = 0; i < names.length; i++) {
      var v = obj[names[i]]
      if (v === undefined || v === null) continue
      if (typeof v !== 'function') return v
      var n = Number(v)
      if (!isNaN(n)) return n
    }
    throw new Error('no field ' + names.join('/') + ' on ' + obj)
  }

  function jset(obj, names, value) {
    for (var i = 0; i < names.length; i++) {
      if (obj[names[i]] !== undefined) {
        obj[names[i]] = value
        return
      }
    }
    throw new Error('no field ' + names.join('/') + ' on ' + obj)
  }

  function hold(p) {
    var t = Number(jget(p, TICK))
    if (isNaN(t)) throw new Error('tickCount reads as NaN')
    if (t >= 80) {
      jset(p, TICK, 20)
      if (!c.windNoted) {
        c.windNoted = true
        log('client_hold_check', 'NOTE', 'player tick counter wound back from ' + t + ' to 20 (mc-runtime-test quits at 100)')
      }
    }
  }

  function observe(p) {
    var dim = String(p.getLevel().getDimension())
    S.put('clientDim', dim)
    if (dim !== c.lastDim) {
      log('client_state', 'NOTE', 'dimension ' + dim)
      c.lastDim = dim
    }
    var want = val('sky')
    if (want !== '' && !c.skyNoted && dim === want) {
      c.skyNoted = true
      var path = 'gcyr/planet_assets/sky_renderers/' + want.substring(want.indexOf(':') + 1) + '.json'
      var found = false
      try {
        found = String(Client.getResourceManager().getResource(new (k().RL)('grindless', path)).isPresent()) === 'true'
      } catch (e) {
        log('client_sky_resource', 'NOTE', 'could not look up ' + path + ': ' + e)
      }
      log('client_sky_resource', found ? 'PASS' : 'NOTE', path + ' present: ' + found)
      S.put('skySeen', 'true')
    }
  }

  function screenshot() {
    var name = val('shot')
    if (name === '') return
    S.put('shot', '')
    try {
      try { k().Paths.dir('kubejs/exported') } catch (e0) { /* exists already */ }
      var mc = Client
      k().Screenshot.grab(mc.gameDirectory, '../kubejs/exported/uxv_kerr_sling_' + name + '.png', mc.getMainRenderTarget(), function (msg) { })
      log('client_screenshot', 'NOTE', 'kubejs/exported/uxv_kerr_sling_' + name + '.png')
      S.put('shotTaken', name)
    } catch (e) {
      log('client_screenshot', 'NOTE', 'could not take ' + name + ': ' + e)
      S.put('shotTaken', name)
    }
  }

  function emi() {
    if (val('emiReady') === 'true') return
    var loaded = true
    try {
      loaded = String(Java.loadClass('dev.emi.emi.runtime.EmiReloadManager').isLoaded()) === 'true'
    } catch (e) { /* no EMI: nothing to wait for */ }
    if (loaded) {
      S.put('emiReady', 'true')
      log('client_emi', 'NOTE', 'EMI loaded: the server leg may move the player now')
    }
  }

  function tick() {
    var p = Client.player
    if (p === null || p === undefined) return
    if (val('hold') !== 'true') {
      if (c.holding) {
        c.holding = false
        log('client_hold', 'NOTE', 'released after ' + Math.round((Date.now() - c.since) / 1000) + ' s: mc-runtime-test may finish now')
      }
      return
    }
    if (!c.holding) {
      c.holding = true
      c.since = Date.now()
      log('client_hold', 'NOTE', 'keeping mc-runtime-test in the world until the server test is done')
    }
    if (Date.now() - c.since > HOLD_MAX_MS) {
      S.put('hold', false)
      log('client_hold', 'NOTE', 'gave up holding after 30 min')
      return
    }
    var parts = [hold, emi, observe, screenshot]
    for (var i = 0; i < parts.length; i++) {
      try {
        parts[i](p)
      } catch (e) {
        if (c.errors++ < 12) log('client_script', 'NOTE', 'exception in part ' + i + ': ' + e)
      }
    }
  }
  ClientEvents.tick(function (event) {
    try {
      tick()
    } catch (e) {
      if (c.errors++ < 8) log('client_script', 'NOTE', 'exception: ' + e)
    }
  })
})()
