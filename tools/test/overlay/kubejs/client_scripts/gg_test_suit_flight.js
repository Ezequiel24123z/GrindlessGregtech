// TEST ONLY, NANO-1 suit flight (#181). Client half; partner of server_scripts/gg_test_suit_flight.js (asleep unless it sets 'hold'
// in global.ggSuitFlight; the client suite runs both in one JVM). Keeps mc-runtime-test in the world: it quits at tickCount 100
// with no screen open, so the player's age is lowered while the test runs.
;(function () {
  ClientEvents.tick(function () {
    try {
      var S = global.ggSuitFlight
      var p = Client.player
      if (!S || p === null || p === undefined || String(S.get('hold') || '') !== 'true') return
      if (Number(p.age) >= 80) p.age = 20
    } catch (e) {
      console.info('GGTEST|suit_flight|client_script|FAIL|' + e)
    }
  })
})()
