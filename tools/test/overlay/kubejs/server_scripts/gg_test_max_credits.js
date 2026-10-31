// priority: -5416
// TEST ONLY, MAX-C3 credits leg (S0-9; docs/eras/max.md "The ending"). Server half; partner of client_scripts/gg_test_max_credits.js.
// Runs in the client suite (integrated server) and only with kubejs/config/gg_test_max_credits.json {"enabled": true}.
// Sends the packet the mirror shell's credits handler sends (startup max/shell.js: ClientboundGameEventPacket.WIN_GAME, 1.0) to the
// player, waits for the client to see the screen and close it (which makes vanilla send PERFORM_RESPAWN), then checks the player is
// still alive, is the same server player and has not moved. No world change, no placed block.
;(function () {
  var NAME = 'max_credits'
  var CHM = Java.loadClass('java.util.concurrent.ConcurrentHashMap')
  if (!global.ggMaxCredits) global.ggMaxCredits = new CHM()
  var S = global.ggMaxCredits
  var marker = JsonIO.read('kubejs/config/gg_test_max_credits.json')
  if (!marker || !marker.enabled) return
  var st = { ticks: 0, sent: false, before: null, done: false, closedAt: -1 }

  function log(check, status, detail) {
    console.info('GGTEST|' + NAME + '|' + check + '|' + status + (detail ? '|' + String(detail).replace(/\|/g, '/') : ''))
  }

  PlayerEvents.tick(function (event) {
    var p = event.player
    if (st.done || p === null || p === undefined) return
    try {
      st.ticks++
      S.put('hold', 'true')
      if (!st.sent && st.ticks >= 60 && String(S.get('idle') || '') === 'true') {
        var Packet = Java.loadClass('net.minecraft.network.protocol.game.ClientboundGameEventPacket')
        st.before = { player: p, x: p.getX(), y: p.getY(), z: p.getZ(), dim: String(p.level.dimension) }
        p.connection.send(new Packet(Packet.WIN_GAME, 1.0))
        st.sent = true
        S.put('sent', 'true')
        log('packet', 'NOTE', 'WIN_GAME 1.0 sent to ' + p.getGameProfile().getName() + ' at ' + st.before.dim)
        return
      }
      if (st.sent && st.closedAt < 0 && String(S.get('closed') || '') === 'true') st.closedAt = st.ticks
      if (st.closedAt >= 0 && st.ticks - st.closedAt >= 100) {
        st.done = true
        var moved = Math.abs(p.getX() - st.before.x) + Math.abs(p.getY() - st.before.y) + Math.abs(p.getZ() - st.before.z)
        log('alive', p.isAlive() && p.getHealth() > 0 ? 'PASS' : 'FAIL', 'alive ' + p.isAlive() + ', health ' + p.getHealth())
        log('same_player', p === st.before.player ? 'PASS' : 'FAIL', 'the server player object is the one before the credits (not respawned)')
        log('not_moved', moved < 0.01 && String(p.level.dimension) === st.before.dim ? 'PASS' : 'FAIL', 'moved ' + moved.toFixed(3) + ', dimension ' + p.level.dimension)
        log('client_screen', String(S.get('seen') || '') === 'true' ? 'PASS' : 'FAIL', 'screen seen by the client: ' + S.get('screenClass'))
        S.put('hold', 'false')
        log('DONE', 'NOTE')
      }
    } catch (e) {
      st.done = true
      S.put('hold', 'false')
      log('script', 'FAIL', 'exception: ' + e)
      log('DONE', 'NOTE')
    }
  })
})()
