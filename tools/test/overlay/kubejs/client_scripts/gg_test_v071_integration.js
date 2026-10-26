// TEST-ONLY: bridge mc-runtime-test's 100-tick exit across serial fixture handoffs.
// No clicks/teleports/assertion copies here. A paused server must not hide a timeout.
;(function () {
  var marker = JsonIO.read('kubejs/config/gg_test_v071_integration.json')
  if (!marker || String(marker.enabled) !== 'true') return
  var stopped = false
  ClientEvents.tick(function () {
    if (stopped) return
    var S = global.ggV071Integration
    if (!S || String(S.get('hold')) !== 'true') return
    try {
      var mc = Client
      if (mc.player && mc.player.age >= 80) mc.player.age = 20
      if (Number(S.get('deadline')) > 0 && Date.now() > Number(S.get('deadline')) && !S.get('cancel')) {
        S.put('cancel', 'client observed integrated stage deadline (including paused screens)')
        console.info('GGTEST|v071_client|client_deadline|FAIL|' + S.get('cancel'))
        mc.options.keyUse.setDown(false)
        mc.setScreen(null) // Unpause, so the server can cancel/clean up the active fixture.
      }
    } catch (e) {
      stopped = true
      S.put('cancel', 'integration client exception: ' + e)
      console.info('GGTEST|v071_client|client_exception|FAIL|' + String(e).replace(/[\r\n|]+/g, '/'))
    }
  })
})()
