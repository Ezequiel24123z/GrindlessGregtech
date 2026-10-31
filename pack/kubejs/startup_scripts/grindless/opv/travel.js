// priority: -6841
// OpV travel (package OpV-F1, docs/eras/opv.md "F1. Ids, places and the id table"): the two tier-13 places the warp gate reaches from
// Cygnus X-1's orbit, c11 (A0's launched bulge seed) to SGR 1806-20's orbit and c12 (R1's launched pathfinder) to the Terzan 5 core.
// No item is registered here: the seeds and probes are opv/foundation.js's. No gate row, recipe or grant is written here either.
// The places are data (spikes S0-3 and S0-8): data/grindless/dimension/<id>.json, data/grindless/gcyr/planets/<id>.json and
// assets/grindless/gcyr/planet_assets/sky_renderers/<id>.json. No rocket reaches a tier 13 place and no station is added.
// Their relay platforms are rows of tables/relay_platforms.json with source cygnus_x1_orbit (server_scripts/grindless/uxv/kerr_sling.js places them).
// Published as global.grindless.opvTravel for the recipe scripts and the tests. The dimension ids are final once shipped.
(function () {
  var G = global.grindless || (global.grindless = {})
  var T = G.opvTravel || (G.opvTravel = {})

  // key -> the place: dimension id (world and orbit are the same), warp gate circuit, the jump row's name and the place's temperature (K)
  T.places = {
    sgr1806: { dimension: 'grindless:sgr1806_orbit', circuit: 11, jump: 'hold_sgr1806', temperature: 10000000 },
    terzan5: { dimension: 'grindless:terzan5_core', circuit: 12, jump: 'hold_terzan5', temperature: 100 }
  }
  T.tier = 13
  T.source = 'grindless:cygnus_x1_orbit'
  T.ids = {
    bulgeRelaySeed: 'grindless:bulge_relay_seed',
    launchedBulgeSeed: 'grindless:launched_bulge_seed',
    pathfinderProbe: 'grindless:pathfinder_probe',
    launchedPathfinder: 'grindless:launched_pathfinder'
  }
})()
