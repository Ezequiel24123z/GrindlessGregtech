// priority: 11400
// Gregtech Grindless - client half of the GCYR flight test (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack). Partner of server_scripts/gg_test_gcyr_flight.js; asleep unless that test sets 'hold' in the map it
// shares with this script (global.ggGcyrFlight: in the client suite both halves run in the same JVM).
//
// While the test runs it:
//   - keeps mc-runtime-test in the world: mc-runtime-test 5.0.1 (1.20.1) quits on the first client tick with the player loaded,
//     no screen open, the player's chunk loaded and player.tickCount >= 100, and has no option to wait longer. The player's tick
//     counter is wound back (80 -> 20, same phase of 20) until the server test prints DONE (or 30 minutes pass); if this Rhino
//     cannot write that field, a chat screen (does not pause the game) is kept open instead and closed at the end;
//   - clicks the requested planet on GCYR's planet screen (PlanetSelectionScreen.selectPlanet, what its button runs); that
//     screen pauses the integrated server, so it is closed after 8 s if nothing could be clicked;
//   - holds Space (the jump key) while the server test asks for it (the rider of a falling rocket): GCYR brakes a falling rocket
//     only while its rider jumps, and a rocket that hits the ground with fallDistance > 48 explodes;
//   - reports what the client sees (dimension, vehicle, rockets), takes screenshots into kubejs/exported/, and reports an
//     integrated server that stops ticking for 20 s while the game is not paused (GCYR issue #91).
// KubeJS renames some vanilla members for scripts (@RemapForJS in its mixins: Entity.tickCount -> age, Entity.getStringUUID ->
// getStringUuid...) and the vanilla name of a renamed member does not exist in JS, so vanilla members go through jcall/jget with
// the KubeJS name first, then the Mojang name, then the SRG name (Rhino's mm.jsmappings); every use keeps a fallback and a probe
// logs once which members the player object shows. var + function: this Rhino throws "redeclaration of var" for const/let in
// functions that run more than once.
;(function () {
  var CHM = Java.loadClass('java.util.concurrent.ConcurrentHashMap')
  if (!global.ggZpmTravel) global.ggZpmTravel = new CHM()
  var S = global.ggZpmTravel
  var TAG = 'GGTEST|zpm_travel|'
  var HOLD_MAX_MS = 30 * 60 * 1000
  var c = { holding: false, since: 0, jump: false, brakeTicks: 0, lastDim: '', lastVeh: '', frozen: false, planetSince: 0, errors: 0,
    lastRockets: 0, holdNoted: false, windNoted: false, holdMode: '', ourScreen: false, probed: false }
  var K = null
  var V = {
    tickCount: ['age', 'tickCount', 'f_19797_'],
    options: ['options', 'f_91066_'],
    keyJump: ['keyJump', 'f_92089_'],
    setDown: ['setDown', 'm_7249_'],
    isPaused: ['isPaused', 'm_91104_'],
    vehicle: ['getVehicle', 'm_20202_'],
    firstPassenger: ['getFirstPassenger', 'm_146895_'],
    y: ['getY', 'm_20186_'],
    uuid: ['getStringUuid', 'getStringUUID', 'm_20149_'],
    entitiesForRendering: ['entitiesForRendering', 'm_104735_'],
    onClose: ['onClose', 'm_7379_'],
    gameDirectory: ['gameDirectory', 'f_91069_'],
    mainRenderTarget: ['getMainRenderTarget', 'm_91385_'],
    level: ['level', 'f_91073_'],
    title: ['getTitle', 'm_96636_'],
    textString: ['getString', 'm_130668_']
  }

  function k() {
    if (K === null) {
      K = {
        Rocket: Java.loadClass('argent_matter.gcyr.common.entity.RocketEntity'),
        PlanetScreen: Java.loadClass('argent_matter.gcyr.client.gui.screen.PlanetSelectionScreen'),
        PlanetData: Java.loadClass('argent_matter.gcyr.data.loader.PlanetData'),
        ChatScreen: Java.loadClass('net.minecraft.client.gui.screens.ChatScreen'),
        KeyMapping: Java.loadClass('net.minecraft.client.KeyMapping'),
        InputConstants: Java.loadClass('com.mojang.blaze3d.platform.InputConstants'),
        RL: Java.loadClass('net.minecraft.resources.ResourceLocation'),
        Screenshot: Java.loadClass('net.minecraft.client.Screenshot'),
        Paths: Java.loadClass('dev.latvian.mods.kubejs.KubeJSPaths')
      }
    }
    return K
  }

  function jcall(obj, names, args) {
    var a = args || []
    for (var i = 0; i < names.length; i++) {
      var n = names[i]
      if (typeof obj[n] !== 'function') continue
      switch (a.length) {
        case 0: return obj[n]()
        case 1: return obj[n](a[0])
        case 2: return obj[n](a[0], a[1])
        case 3: return obj[n](a[0], a[1], a[2])
        default: return obj[n](a[0], a[1], a[2], a[3])
      }
    }
    throw new Error('no method ' + names.join('/') + ' on ' + obj)
  }

  // a field that shares its JS name with a method comes back as one callable object (Rhino's FieldAndMethods) whose primitive
  // value is the field: numbers are read through Number()
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

  // which members this Rhino shows on an object (once per label): the names the test needs, with their JS type
  function probe(label, obj) {
    var keys = []
    try {
      for (var key in obj) keys.push(String(key))
    } catch (e) {
      keys.push('(for-in failed: ' + e + ')')
    }
    var want = /uuid|tick|^age$|vehicle|passenger|^getY$|^y$|level|closeContainer|closeMenu|isPaused/i
    var types = ['age', 'tickCount', 'getVehicle', 'getStringUuid', 'getStringUUID', 'getY', 'getLevel', 'closeMenu'].map(function (n) {
      var t = ''
      try { t = typeof obj[n] } catch (e) { t = 'throws' }
      return n + ':' + t
    })
    log('client_probe_' + label, 'NOTE', keys.length + ' members; ' + types.join(' ') + '; matching: ' +
      keys.filter(function (x) { return want.test(x) }).sort().join(' '))
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

  function setJump(mc, down) {
    try {
      jcall(jget(jget(mc, V.options), V.keyJump), V.setDown, [down])
    } catch (e) {
      // KeyMapping.set(key, down) is what the keyboard handler calls for a real key press
      jcall(k().KeyMapping, ['set', 'm_90837_'], [jcall(k().InputConstants, ['getKey', 'm_84851_'], ['key.keyboard.space']), down])
    }
  }

  function isChat(scr) {
    return scr !== null && scr !== undefined && scr instanceof k().ChatScreen
  }

  function release(mc) {
    if (c.jump) {
      try { setJump(mc, false) } catch (e) { /* key state only */ }
      c.jump = false
    }
    if (c.ourScreen) {
      c.ourScreen = false
      if (isChat(mc.currentScreen)) mc.setCurrentScreen(null)
    }
    if (c.holding) {
      c.holding = false
      log('client_hold', 'NOTE', 'released after ' + Math.round((Date.now() - c.since) / 1000) + ' s (held with: ' + c.holdMode + '): mc-runtime-test may finish now')
    }
  }

  // GCYR's planet screen pauses the integrated server; if isPaused cannot be read, that screen counts as paused
  function pausedNow(mc) {
    try {
      return String(jcall(mc, V.isPaused)) === 'true'
    } catch (e) {
      var scr = mc.currentScreen
      return scr !== null && scr !== undefined && scr instanceof k().PlanetScreen
    }
  }

  // the server test sets 'watch' from the launch to the landing: a stall there is the #91 freeze; elsewhere (the test building its
  // area, chunk generation) it is only noted
  function watchdog(mc) {
    var last = Number(val('serverTickMs') || 0)
    if (last <= 0 || pausedNow(mc)) return
    var gap = Date.now() - last
    if (gap > 20000 && !c.frozen) {
      c.frozen = true
      var flying = val('watch') === 'true'
      log(flying ? 'server_ticking' : 'server_stall', flying ? 'FAIL' : 'NOTE', 'the integrated server has not ticked for ' + Math.round(gap / 1000) + ' s (test phase ' +
        val('phase') + ', client dimension ' + val('clientDim') + ', vehicle ' + val('clientVehicle') + ')' + (flying ? ': the GCYR #91 freeze' : ''))
    } else if (c.frozen && gap < 2000) {
      c.frozen = false
      log('server_ticking_again', 'NOTE', 'the integrated server ticks again (phase ' + val('phase') + ')')
    }
  }

  function planetScreen(mc, p) {
    var scr = mc.currentScreen
    if (scr === null || scr === undefined || !(scr instanceof k().PlanetScreen)) {
      c.planetSince = 0
      return
    }
    if (c.planetSince === 0) {
      c.planetSince = Date.now()
      S.put('clientScreen', 'PlanetSelectionScreen')
    }
    var want = val('select')
    if (want !== '') {
      var planet = k().PlanetData.getPlanet(new (k().RL)(want))
      if (planet !== null && planet !== undefined) {
        S.put('select', '')
        S.put('selected', want)
        log('client_planet_click', 'NOTE', 'GCYR planet screen open (' + k().PlanetData.planets().size() + ' planets); clicking ' + want + ' -> ' + planet.level())
        scr.selectPlanet(planet)
        c.planetSince = 0
        return
      }
    }
    if (Date.now() - c.planetSince > 8000) {
      log('client_planet_screen', 'FAIL', 'the planet screen stayed open 8 s without a planet to click (wanted "' + want + '"); closing it')
      try {
        jcall(scr, V.onClose)
      } catch (e) {
        mc.setCurrentScreen(null)
      }
      c.planetSince = 0
    }
  }

  // the server test sets 'brake' only while the player rides the falling rocket
  function brake(mc, p) {
    if (val('brake') === 'true') {
      setJump(mc, true)
      c.jump = true
      c.brakeTicks++
      S.put('clientBrakeTicks', c.brakeTicks)
    } else if (c.jump) {
      setJump(mc, false)
      c.jump = false
    }
  }

  function rocketTag(r) {
    var id = '?'
    try { id = String(jcall(r, V.uuid)).substring(0, 8) } catch (e) { id = '?' }
    var y = '?'
    try { y = Math.round(Number(jcall(r, V.y))) } catch (e2) { y = '?' }
    return id + ':' + r.getBlocks().size() + 'b@y' + y
  }

  function clientRockets(p) {
    var out = []
    var it = jcall(p.getLevel(), V.entitiesForRendering).iterator()
    while (it.hasNext()) {
      var e = it.next()
      if (e instanceof k().Rocket) out.push(e)
    }
    return out
  }

  // the player's vehicle; if Entity.getVehicle does not resolve on the player, the rocket whose first passenger is the player
  function clientVehicle(p, rockets) {
    try {
      var v = jcall(p, V.vehicle)
      if (v === null || v === undefined) return 'none'
      return v instanceof k().Rocket ? 'gcyr:rocket ' + rocketTag(v) : String(v).substring(0, 60)
    } catch (e) {
      var mine = String(p)
      for (var i = 0; i < rockets.length; i++) {
        var rider = null
        try { rider = jcall(rockets[i], V.firstPassenger) } catch (e2) { rider = null }
        if (rider !== null && rider !== undefined && String(rider) === mine) return 'gcyr:rocket ' + rocketTag(rockets[i]) + ' (its rider)'
      }
      return 'none (no rocket has the player as rider)'
    }
  }

  function playerY(p) {
    try {
      return Math.round(Number(jcall(p, V.y)))
    } catch (e) {
      return Number(p.getBlock().y)
    }
  }

  function observe(mc, p) {
    var dim = String(p.getLevel().getDimension())
    var rockets = []
    try { rockets = clientRockets(p) } catch (e) { rockets = [] }
    var veh = clientVehicle(p, rockets)
    S.put('clientDim', dim)
    S.put('clientVehicle', veh)
    if (dim !== c.lastDim || veh !== c.lastVeh) {
      var scr = mc.currentScreen
      var title = 'none'
      if (scr !== null && scr !== undefined) {
        try { title = String(jcall(jcall(scr, V.title), V.textString)) } catch (e) { title = String(scr).substring(0, 60) }
      }
      log('client_state', 'NOTE', 'dimension ' + dim + ', vehicle ' + veh + ', y ' + playerY(p) + ', screen ' + title)
      c.lastDim = dim
      c.lastVeh = veh
    }
    if (Date.now() - c.lastRockets > 1000) {
      c.lastRockets = Date.now()
      S.put('clientRockets', rockets.length === 0 ? 'none' : rockets.map(rocketTag).join(' '))
    }
  }

  function screenshot(mc) {
    var name = val('shot')
    if (name === '') return
    S.put('shot', '')
    try {
      try {
        k().Paths.dir('kubejs/exported')
      } catch (e0) { /* exists already */ }
      k().Screenshot.grab(jget(mc, V.gameDirectory), '../kubejs/exported/gcyr_flight_' + name + '.png', jcall(mc, V.mainRenderTarget), function (msg) { })
      log('client_screenshot', 'NOTE', 'kubejs/exported/gcyr_flight_' + name + '.png')
    } catch (e) {
      log('client_screenshot', 'NOTE', 'could not take ' + name + ': ' + e)
    }
  }

  // throws when the tick counter cannot be read or written
  function tickHold(p) {
    var t = Number(jget(p, V.tickCount))
    if (isNaN(t)) throw new Error('tickCount reads as NaN')
    if (t >= 80) {
      jset(p, V.tickCount, 20)
      var after = Number(jget(p, V.tickCount))
      if (!(after < t)) throw new Error('tickCount stays ' + after + ' after writing 20')
      if (!c.windNoted) {
        c.windNoted = true
        log('client_hold_check', 'NOTE', 'player tick counter wound back from ' + t + ' to ' + after + ' (mc-runtime-test quits at 100)')
      }
    }
  }

  // mc-runtime-test only waits while a screen is open; a chat screen does not pause the integrated server
  function screenHold(mc) {
    var scr = mc.currentScreen
    if (scr === null || scr === undefined) {
      mc.setCurrentScreen(new (k().ChatScreen)(''))
      c.ourScreen = true
    }
  }

  function hold(mc, p) {
    if (c.holdMode === 'chat screen') {
      screenHold(mc)
      return
    }
    try {
      tickHold(p)
      if (c.holdMode === '') c.holdMode = 'tick counter'
    } catch (e) {
      c.holdMode = 'chat screen'
      log('client_hold_mode', 'NOTE', 'the player tick counter cannot be held (' + e + '): a chat screen, which does not pause the game, stays open until the test is done')
      screenHold(mc)
    }
  }

  function tick() {
    var mc = Client
    var p = mc.player
    if (p === null || p === undefined) return
    S.put('clientTickMs', Date.now())
    if (val('hold') !== 'true') {
      release(mc)
      return
    }
    if (!c.holding) {
      c.holding = true
      c.since = Date.now()
      if (!c.holdNoted) {
        c.holdNoted = true
        log('client_hold', 'NOTE', 'keeping mc-runtime-test in the world until the server test is done')
      }
      if (!c.probed) {
        c.probed = true
        probe('player', p)
      }
    }
    if (Date.now() - c.since > HOLD_MAX_MS) {
      S.put('hold', false)
      log('client_hold', 'NOTE', 'gave up holding after 30 min')
      release(mc)
      return
    }
    hold(mc, p)
    var parts = [watchdog, planetScreen, brake, observe, screenshot]
    for (var i = 0; i < parts.length; i++) {
      try {
        parts[i](mc, p)
      } catch (e) {
        if (c.errors++ < 12) log('client_script', 'NOTE', 'exception in part ' + i + ': ' + e)
      }
    }
    // a screen closed during this tick (the planet screen after the click, the loading screen after a dimension change) must
    // not leave mc-runtime-test a tick with no screen
    if (c.holdMode === 'chat screen') screenHold(mc)
  }
  ClientEvents.tick(function (event) {
    try {
      tick()
    } catch (e) {
      if (c.errors++ < 8) log('client_script', 'NOTE', 'exception: ' + e)
    }
  })
})()
