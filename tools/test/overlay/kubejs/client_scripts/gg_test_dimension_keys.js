// priority: 12700
// Gregtech Grindless - client half of the travel-key test (TEST-ONLY overlay: copied over the instance on the test PC, never
// shipped with the pack). Partner of server_scripts/gg_test_dimension_keys.js; asleep unless that test sets 'hold' in the map
// both halves share (global.ggDimensionKeys: in the client suite both run in the same JVM).
//
// While the test runs it:
//   - keeps mc-runtime-test in the world: mc-runtime-test 5.0.1 (1.20.1) quits once the player's tickCount reaches 100 with no
//     screen open, so the counter is wound back (80 -> 20). KubeJS exposes Entity#tickCount to scripts as `age` (@RemapForJS
//     on its EntityMixin; `tickCount` and `f_19797_` do not exist for scripts);
//   - right-clicks with the held key when the server half asks for it: the "use" key binding (right mouse button) is held
//     for one client tick, so Minecraft runs its own right-click code (handleKeybinds -> startUseItem ->
//     MultiPlayerGameMode.useItem -> ServerboundUseItemPacket), like a mouse click; the server's last attempt asks for
//     MultiPlayerGameMode.useItem directly instead;
//   - reports what the client sees: dimension, height, held item and open screen.
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var CHM = Java.loadClass('java.util.concurrent.ConcurrentHashMap')
  if (!global.ggDimensionKeys) global.ggDimensionKeys = new CHM()
  var S = global.ggDimensionKeys
  var TAG = 'GGTEST|dimension_keys|'
  var HOLD_MAX_MS = 10 * 60 * 1000
  var c = { holding: false, since: 0, pressed: '', releaseNext: false, errors: 0, lastState: '', ageField: null, gaveUp: false }
  var Hand = null

  function val(key) {
    var v = S.get(key)
    return v === null || v === undefined ? '' : String(v)
  }

  function log(check, status, detail) {
    var line = TAG + check + '|' + status
    if (detail !== undefined && detail !== null && String(detail) !== '') line += '|' + String(detail).replace(/[\r\n]+/g, ' ').replace(/\|/g, '/')
    console.info(line)
  }

  function releaseKey(mc) {
    if (c.releaseNext) {
      mc.options.keyUse.setDown(false)
      c.releaseNext = false
    }
  }

  function release(mc) {
    releaseKey(mc)
    if (c.holding) {
      c.holding = false
      log('client_hold', 'NOTE', 'released after ' + Math.round((Date.now() - c.since) / 1000) + ' s: mc-runtime-test may finish now')
    }
  }

  // mc-runtime-test reads Entity#tickCount; KubeJS calls it `age`
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
      if (c.ageField === null) {
        c.ageField = ''
        log('client_hold_check', 'NOTE', 'no tick counter field found on ' + p + ': mc-runtime-test will quit after 100 ticks')
      }
    }
    if (c.ageField === '') return
    if (Number(p[c.ageField]) >= 80) p[c.ageField] = 20
  }

  function report(mc, p) {
    var dim = String(p.getLevel().getDimension())
    var item = String(p.getMainHandItem().getId())
    var scr = mc.screen
    var screen = scr === null || scr === undefined ? '' : String(scr.getTitle().getString()) || 'untitled screen'
    S.put('clientDim', dim)
    S.put('clientY', Number(p.getY()).toFixed(2))
    S.put('clientItem', item)
    S.put('clientScreen', screen)
    var state = dim + '|' + screen
    if (state !== c.lastState) {
      c.lastState = state
      log('client_state', 'NOTE', 'dimension ' + dim + ', y ' + Number(p.getY()).toFixed(2) + ', holding ' + item + ', screen ' + (screen || 'none'))
    }
    return { dim: dim, item: item, screen: screen }
  }

  function click(mc, p, seen) {
    releaseKey(mc)
    var token = val('clickToken')
    if (token === '' || token === c.pressed) return
    if (seen.screen !== '' || mc.getOverlay() != null) return
    if (seen.dim !== val('clickDim') || seen.item !== val('clickItem')) return
    c.pressed = token
    var how
    if (val('clickMode') === 'direct') {
      if (Hand === null) Hand = Java.loadClass('net.minecraft.world.InteractionHand')
      how = 'MultiPlayerGameMode.useItem(player, MAIN_HAND) called directly -> ' + mc.gameMode.useItem(p, Hand.MAIN_HAND)
    } else {
      // Minecraft's own handleKeybinds() sees the use key down on the next tick and runs startUseItem(), as for a mouse click
      mc.options.keyUse.setDown(true)
      c.releaseNext = true
      how = 'use key (right mouse button) held for one client tick'
    }
    S.put('clickedHow', how)
    S.put('clicked', token)
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
    var seen = report(mc, p)
    click(mc, p, seen)
  }

  ClientEvents.tick(function (event) {
    try {
      tick()
    } catch (e) {
      if (c.errors++ < 5) log('client_script', 'NOTE', 'exception: ' + e)
    }
  })
})()
