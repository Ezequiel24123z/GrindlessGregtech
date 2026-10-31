// priority: -5486
// MAX travel (package MAX-F1, docs/eras/max.md "Places and site rules" and "Bridges"): the two tier-14 places the warp gate reaches,
// c14 (the launched GC relay probe) to Sgr A*'s orbit and c15 (the launched belt seed) to the nuclear star cluster's belt.
// No item is registered here: the probe and seed are max/foundation.js's. No gate row, recipe or grant is written here either.
// The places are data (spike S0-1): gcyr:black_hole_orbit is GCYR's own level and gets its planet row in
// data/grindless/gcyr/planets/sgr_a_orbit.json; grindless:nsc_belt has data/grindless/dimension/nsc_belt.json, its planet row and
// assets/grindless/gcyr/planet_assets/sky_renderers/nsc_belt.json. No rocket reaches a tier 14 place and no station is added.
// Their relay platforms are rows of tables/relay_platforms.json: Sgr A* from cygnus_x1_orbit, the belt from gcyr:black_hole_orbit.
// Published as global.grindless.maxTravel for the recipe scripts and the tests. The dimension ids are final once shipped.
(function () {
  var G = global.grindless || (global.grindless = {})
  var T = G.maxTravel || (G.maxTravel = {})

  // key -> the place: dimension id (world and orbit are the same), warp gate circuit, the jump row's name and the place's temperature (K)
  T.places = {
    sgra: { dimension: 'gcyr:black_hole_orbit', circuit: 14, jump: 'hold_sgr_a_probe', temperature: 100 },
    nsc: { dimension: 'grindless:nsc_belt', circuit: 15, jump: 'hold_nsc_belt', temperature: 100 }
  }
  T.tier = 14
  T.source = 'grindless:cygnus_x1_orbit'
  T.ids = {
    gcRelayProbe: 'grindless:gc_relay_probe',
    launchedGcProbe: 'grindless:launched_gc_probe',
    nscBeltSeed: 'grindless:nsc_belt_seed',
    launchedBeltSeed: 'grindless:launched_belt_seed'
  }
})()
