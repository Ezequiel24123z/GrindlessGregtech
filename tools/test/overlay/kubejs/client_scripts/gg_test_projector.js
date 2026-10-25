// Gregtech Grindless - client half of the Hologram Projector test (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped). Partner of server_scripts/gg_test_projector.js; asleep unless that test sets 'hold' in the map both halves share
// (global.ggProjector: in the client suite both run in the same JVM).
//
// While the test runs it:
//   - keeps mc-runtime-test in the world (it quits once the player's tickCount reaches 100 with no screen open; KubeJS calls the
//     field `age`, so the counter is wound back 80 -> 20, as in gg_test_quest_book.js);
//   - hides the HUD for the screenshots (options.hideGui) and puts it back at the end;
//   - on each request of the server half (shared 'token'), with the crosshair on the controller:
//       hologram  waits (up to DRAW_MAX ticks) until the client has drawn the render sections around the controller: right after
//                 the teleport it has the blocks (the crosshair finds the controller) but, on the bench's software renderer,
//                 may not draw them for a while, and the screenshots would show the sky alone;
//                 screenshot gg_projector_before, the use key held one tick (Minecraft's own handleKeybinds -> startUseItem ->
//                 useItemOn, as a mouse click), waits for the projector's client script to show GTM's preview
//                 (global.grindless.projectorClient.shown), then gg_projector_hologram; the two are compared on a grid of samples
//       build     the sneak key held, the use key held one tick, sneak released: the server half checks what was built;
//                 screenshot gg_projector_built (the hologram is still up)
//       hide      the use key again: the hologram goes away (projectorClient.hidden); screenshot gg_projector_hidden
//     and answers in 'result' (PASS/FAIL + detail).
// var + function everywhere: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var CHM = Java.loadClass('java.util.concurrent.ConcurrentHashMap')
  if (!global.ggProjector) global.ggProjector = new CHM()
  var S = global.ggProjector
  var TAG = 'GGTEST|projector|'
  var HOLD_MAX_MS = 15 * 60 * 1000
  var WAIT_MAX = 200
  var DRAW_MAX = 500
  var c = { holding: false, since: 0, errors: 0, ageField: null, gaveUp: false, token: '', job: null, view: null }

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

  function hideGui(o, v) {
    var name = o.hideGui !== undefined ? 'hideGui' : 'f_92062_'
    if (v !== undefined) o[name] = v
    return o[name] === true
  }

  function projector() {
    var G = global.grindless
    return G && G.projectorClient ? G.projectorClient : { shown: 0, hidden: 0, last: '', errors: 0, error: '' }
  }

  // Screenshot.grab(gameDir, name, ...) writes <gameDir>/screenshots/<name>, so the name climbs into kubejs/exported
  function grab(mc, name) {
    try { Java.loadClass('dev.latvian.mods.kubejs.KubeJSPaths').dir('kubejs/exported') } catch (e) { }
    Java.loadClass('net.minecraft.client.Screenshot').grab(field(mc, ['gameDirectory', 'f_91069_']), '../kubejs/exported/' + name + '.png',
      method(mc, ['getMainRenderTarget', 'm_91385_']), function (msg) { })
  }

  // a 64 x 36 grid of pixels of the frame just drawn
  function sample(mc) {
    var img = Java.loadClass('net.minecraft.client.Screenshot').takeScreenshot(method(mc, ['getMainRenderTarget', 'm_91385_']))
    var out = []
    try {
      var w = img.getWidth()
      var h = img.getHeight()
      for (var gy = 0; gy < 36; gy++) {
        for (var gx = 0; gx < 64; gx++) out.push(Number(img.getPixelRGBA(Math.floor((gx + 0.5) * w / 64), Math.floor((gy + 0.5) * h / 36))))
      }
    } finally {
      img.close()
    }
    return out
  }

  function changed(a, b) {
    if (!a || !b || a.length !== b.length) return -1
    var n = 0
    for (var i = 0; i < a.length; i++) {
      var d = Math.abs((a[i] & 255) - (b[i] & 255)) + Math.abs(((a[i] >> 8) & 255) - ((b[i] >> 8) & 255)) + Math.abs(((a[i] >> 16) & 255) - ((b[i] >> 16) & 255))
      if (d > 30) n++
    }
    return n / a.length
  }

  function aimed(mc) {
    var hit = mc.hitResult
    var want = val('ctrl')
    if (hit === null || hit === undefined || want === '') return 'no target'
    if (String(hit.getType()) !== 'BLOCK') return 'looking at ' + hit.getType()
    var p = hit.getBlockPos()
    var at = p.getX() + ',' + p.getY() + ',' + p.getZ()
    return at === want ? '' : 'looking at ' + at + ', not the controller ' + want
  }

  // true/false: the render sections of the controller, both sides of the structure and the floor under the player are built
  // (Embeddium answers LevelRenderer#isChunkCompiled from its own sections, as in gg_test_gallery.js); null: unknown
  function drawn(mc) {
    try {
      var lr = field(mc, ['levelRenderer', 'f_91060_'])
      var at = val('ctrl').split(',')
      if (lr === null || typeof lr.isChunkCompiled !== 'function' || at.length !== 3) return null
      var BlockPos = Java.loadClass('net.minecraft.core.BlockPos')
      var x = Number(at[0])
      var y = Number(at[1])
      var z = Number(at[2])
      var probes = [[x, y, z], [x + 2, y, z], [x - 2, y, z], [x, y - 2, z + 4]]
      for (var i = 0; i < probes.length; i++) {
        if (lr.isChunkCompiled(new BlockPos(probes[i][0], probes[i][1], probes[i][2])) !== true) return false
      }
      return true
    } catch (e) {
      return null
    }
  }

  // true/false: no render section waits to be rebuilt (LevelRenderer#hasRenderedAllChunks, which Embeddium answers from its own
  // build queue); null: unknown. Lets the screenshots after the build show the new blocks.
  function rendered(mc) {
    try {
      var lr = field(mc, ['levelRenderer', 'f_91060_'])
      if (lr === null || typeof lr.hasRenderedAllChunks !== 'function') return null
      return lr.hasRenderedAllChunks() === true
    } catch (e) {
      return null
    }
  }

  function answer(text) {
    S.put('result', text)
    log('client_' + c.job.kind, 'NOTE', text)
    c.job = null
  }

  function release(mc) {
    try { mc.options.keyUse.setDown(false) } catch (e) { }
    try { mc.options.keyShift.setDown(false) } catch (e2) { }
    if (c.view !== null) {
      try { hideGui(mc.options, c.view.hideGui) } catch (e3) { }
      c.view = null
    }
    if (c.holding) {
      c.holding = false
      log('client_hold', 'NOTE', 'released after ' + Math.round((Date.now() - c.since) / 1000) + ' s')
    }
  }

  function work(mc) {
    var j = c.job
    var o = mc.options
    j.t++
    if (j.kind === 'hologram') {
      if (j.step === 'aim') {
        var why = aimed(mc)
        if (why !== '' && j.t < WAIT_MAX) return
        if (why !== '') { answer('FAIL the crosshair never reached the controller: ' + why); return }
        if (j.drawnAt === undefined) {
          var d = drawn(mc)
          if (d === false && j.t < DRAW_MAX) return
          j.drawnAt = j.t
          j.terrain = d === true ? 'terrain drawn ' + j.t + ' ticks after the request' : d === false ? 'terrain still not drawn after ' + j.t +
            ' ticks (the screenshots show the hologram without the real blocks)' : 'terrain drawing state unknown'
        }
        if (j.t - j.drawnAt < 20) return
        grab(mc, 'gg_projector_before')
        j.before = sample(mc)
        j.shown0 = projector().shown
        o.keyUse.setDown(true)
        j.step = 'release'
        return
      }
      if (j.step === 'release') {
        o.keyUse.setDown(false)
        j.step = 'wait'
        j.t = 0
        return
      }
      if (j.step === 'wait') {
        if (projector().shown <= j.shown0 && j.t < WAIT_MAX) return
        if (projector().shown <= j.shown0) { answer('FAIL no hologram after the click (' + projector().last + ', errors ' + projector().errors + ' ' + projector().error + ')'); return }
        j.step = 'settle'
        j.t = 0
        return
      }
      if (j.step === 'settle') {
        if (j.t < 60) return
        grab(mc, 'gg_projector_hologram')
        var ratio = changed(j.before, sample(mc))
        var pc = Math.round(ratio * 1000) / 10
        answer((ratio >= 0.02 ? 'PASS' : 'FAIL') + ' right-click: ' + projector().last + '; ' + pc + ' % of the sampled pixels changed against the screenshot before the click' +
          ' (gg_projector_before.png -> gg_projector_hologram.png); ' + j.terrain)
      }
      return
    }
    if (j.kind === 'build') {
      if (j.step === 'aim') {
        var why2 = aimed(mc)
        if (why2 !== '' && j.t < WAIT_MAX) return
        if (why2 !== '') { answer('FAIL the crosshair never reached the controller: ' + why2); return }
        o.keyShift.setDown(true)
        j.step = 'sneak'
        j.t = 0
        return
      }
      if (j.step === 'sneak') {
        if (j.t < 10) return
        o.keyUse.setDown(true)
        j.step = 'release'
        return
      }
      if (j.step === 'release') {
        o.keyUse.setDown(false)
        j.step = 'unsneak'
        j.t = 0
        return
      }
      if (j.step === 'unsneak') {
        if (j.t < 10) return
        o.keyShift.setDown(false)
        j.step = 'settle'
        j.t = 0
        return
      }
      if (j.step === 'settle') {
        if (j.t < 40) return
        if (rendered(mc) === false && j.t < 240) return
        grab(mc, 'gg_projector_built')
        answer('PASS sneak key held, use key held one tick, sneak released; screenshot gg_projector_built.png after ' + j.t + ' ticks')
      }
      return
    }
    if (j.kind === 'hide') {
      if (j.step === 'aim') {
        var why3 = aimed(mc)
        if (why3 !== '' && j.t < WAIT_MAX) return
        if (why3 !== '') { answer('FAIL the crosshair never reached the controller: ' + why3); return }
        if (j.t < 10) return
        j.hidden0 = projector().hidden
        o.keyUse.setDown(true)
        j.step = 'release'
        return
      }
      if (j.step === 'release') {
        o.keyUse.setDown(false)
        j.step = 'wait'
        j.t = 0
        return
      }
      if (j.step === 'wait') {
        if (projector().hidden <= j.hidden0 && j.t < WAIT_MAX) return
        if (projector().hidden <= j.hidden0) { answer('FAIL the hologram stayed after a second click (' + projector().last + ')'); return }
        j.step = 'settle'
        j.t = 0
        return
      }
      if (j.step === 'settle') {
        if (j.t < 20) return
        if (rendered(mc) === false && j.t < 220) return
        grab(mc, 'gg_projector_hidden')
        answer('PASS a second right-click hides it: ' + projector().last + '; screenshot gg_projector_hidden.png')
      }
    }
  }

  function tick() {
    var mc = Client
    var p = mc.player
    if (p === null || p === undefined) return
    if (val('hold') !== 'true' || c.gaveUp) {
      release(mc)
      return
    }
    if (!c.holding) {
      c.holding = true
      c.since = Date.now()
      log('client_hold', 'NOTE', 'keeping mc-runtime-test in the world until the server half is done')
    }
    if (Date.now() - c.since > HOLD_MAX_MS) {
      c.gaveUp = true
      log('client_hold', 'NOTE', 'gave up holding after ' + (HOLD_MAX_MS / 60000) + ' min')
      release(mc)
      return
    }
    windBack(p)
    if (c.view === null) {
      c.view = { hideGui: hideGui(mc.options) }
      hideGui(mc.options, true)
    }
    var token = val('token')
    if (c.job === null && token !== '' && token !== c.token) {
      c.token = token
      c.job = { kind: val('request'), step: 'aim', t: 0 }
      log('client_request', 'NOTE', c.job.kind + ' (' + token + ')')
    }
    if (c.job !== null && mc.screen === null && mc.getOverlay() === null) work(mc)
  }

  ClientEvents.tick(function (event) {
    try {
      tick()
    } catch (e) {
      if (c.errors++ < 5) log('client_script', 'NOTE', 'exception: ' + e)
      if (c.job !== null) answer('FAIL exception in the client half: ' + e)
    }
  })
})()
