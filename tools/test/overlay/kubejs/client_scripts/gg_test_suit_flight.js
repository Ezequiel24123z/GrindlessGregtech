// priority: 11875
// TEST ONLY, suit flight: NANO-1 (#181) and NANO-1b (#195). Client half; partner of server_scripts/gg_test_suit_flight.js (asleep
// unless it sets 'hold' in global.ggSuitFlight; the client suite runs both in one JVM).
// In Minecraft 'flying' is the client's: a double jump sets it on the local player and sends it (ServerboundPlayerAbilitiesPacket),
// the server copies it while 'mayfly' is on, and LocalPlayer#aiStep clears it and sends it again when the player touches the
// ground. So this half takes off and lands the way a player does, when the server half asks ('cmd'):
//   fly   with 'mayfly' and off the ground, sets 'flying' on the local player and syncs it (LocalPlayer#onUpdateAbilities);
//   land  holds the sneak key so the flying player descends; on touching the ground Minecraft clears 'flying', then the key is
//         released.
// It answers in 'ack' and reports what the client sees ('cFlying', 'cMayfly', 'cGround', 'cY'). It also keeps mc-runtime-test in
// the world: it quits at tickCount 100 with no screen open, so the player's age is lowered while the test runs.
// var + function: this Rhino throws "redeclaration of var" for const/let in functions that run more than once.
;(function () {
  var CHM = Java.loadClass('java.util.concurrent.ConcurrentHashMap')
  if (!global.ggSuitFlight) global.ggSuitFlight = new CHM()
  var S = global.ggSuitFlight
  var c = { current: '', done: '', ticks: 0, sneaking: false, errors: 0 }

  function val(k) { var v = S.get(k); return v === null || v === undefined ? '' : String(v) }
  function y(p) { return Number(p.getY()).toFixed(2) }
  function sneak(mc, on) {
    if (c.sneaking === on) return
    mc.options.keyShift.setDown(on)
    c.sneaking = on
  }
  function reply(token, text) {
    c.done = token
    S.put('ack', token + '|' + text)
  }

  function serve(mc, p) {
    var token = val('cmd')
    if (token === '' || token === c.done) {
      sneak(mc, false)
      return
    }
    if (token !== c.current) {
      c.current = token
      c.ticks = 0
    }
    var kind = token.split('#')[0]
    var ab = p.getAbilities()
    c.ticks++
    if (kind === 'fly') {
      if (ab.mayfly && !p.onGround()) {
        ab.flying = true
        p.onUpdateAbilities()
        reply(token, 'ok|the client set flying and synced it after ' + c.ticks + ' ticks at y ' + y(p))
      } else if (c.ticks > 60) {
        reply(token, 'refused|mayfly ' + ab.mayfly + ', on the ground ' + p.onGround() + ' for 60 ticks')
      }
    } else if (kind === 'land') {
      if (p.onGround() && !ab.flying) {
        sneak(mc, false)
        reply(token, 'ok|on the ground after ' + c.ticks + ' ticks at y ' + y(p) + ', flying cleared by the client')
      } else if (c.ticks > 80) {
        sneak(mc, false)
        reply(token, 'timeout|flying ' + ab.flying + ', on the ground ' + p.onGround() + ', y ' + y(p) + ' after 80 ticks')
      } else {
        sneak(mc, true)
      }
    } else {
      reply(token, 'unknown|' + kind)
    }
  }

  ClientEvents.tick(function () {
    try {
      var mc = Client
      var p = mc.player
      if (p === null || p === undefined) return
      if (val('hold') !== 'true') {
        sneak(mc, false)
        return
      }
      if (Number(p.age) >= 80) p.age = 20
      serve(mc, p)
      var ab = p.getAbilities()
      S.put('cFlying', String(!!ab.flying))
      S.put('cMayfly', String(!!ab.mayfly))
      S.put('cGround', String(!!p.onGround()))
      S.put('cY', y(p))
    } catch (e) {
      if (c.errors++ < 5) console.info('GGTEST|suit_flight|client_script|FAIL|' + String(e).replace(/\|/g, '/'))
    }
  })
})()
