// priority: -24680
// UIV-B1: the arrival platforms of the c4-c6 jumps (UIV-S0-2, S0-4). Since AF-1 (issue #203) one shared placer serves every row of
// tables/relay_platforms.json: server_scripts/grindless/lib/relay_platforms.js. A jump that completes (the warp gate's afterWorking) queues its
// place in the world's persistent data; the placer puts the platform there once per world (mark uivPlatform_<place> for the rows without a
// source) and gives the jump ring that place's relay coordinates. This file only keeps global.grindless.uivTravel.placed for the tests.
(function () {
  var G = global.grindless || (global.grindless = {})
  var T = G.uivTravel || (G.uivTravel = {})
  var R = G.relayPlatforms || (G.relayPlatforms = {})
  R.placed = R.placed || {}
  T.placed = R.placed
})()
