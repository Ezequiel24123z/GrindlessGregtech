// -----------------------------------------------------------------------------------------------
// UHV travel (package UHV-B1, docs/eras/uhv.md "Places and site rules", "Sunlight", "Bridges and first arrivals", "AE2").
//
// The places are data, nothing is registered here:
//   data/gcyr/gcyr/planets/proxima_centauri_b.json  GCYR's Proxima b, overridden (spike S0-3's path): rocket_tier 8 (the level 8
//                                                   rocket, UHV-A8), world gcyr:proxima_centauri_b kept, orbit_world now
//                                                   grindless:proxima_b_orbit (GCYR named gcyr:proxima_centauri_b_orbit, which no
//                                                   dimension file defines); every other field as GCYR ships it, gravity unclaimed
//   data/grindless/dimension/proxima_b_orbit.json   the orbit, gcyr:space like every orbit of ours
//   assets/grindless/gcyr/planet_assets/sky_renderers/proxima_b_orbit.json  its sky: the red dwarf, the planet, its glow (GCYR's
//                                                   own textures)
// Tables (UHV rows): planets.json proxima (both dimensions, pairTag proxima: the warp gate's seed, package B7, makes the pair),
// orbits.json and places.json (proxima_b), stations.json `more` slots seven and eight (Mercury orbit, Proxima b orbit;
// lib/stations.js), sunlight.json (Mercury orbit, Proxima b orbit and its day side).
// The Mercury orbit route of IV's Hermean seed: server_scripts/grindless/uhv/travel.js. The lunar solar field's Proxima row:
// server_scripts/grindless/ev/lunar_power_and_antenna.js. Names: client_scripts/grindless/uhv_travel_lang.js.
// Published as global.grindless.uhvTravel for the recipe script and the tests.
(function () {
  var G = global.grindless
  var T = G.uhvTravel || (G.uhvTravel = {})

  T.planet = {
    id: 'gcyr:proxima_centauri_b',
    planets: 'proxima',
    tier: 8,
    world: 'gcyr:proxima_centauri_b',
    orbit: 'grindless:proxima_b_orbit',
    dayBiome: 'gcyr:proxima_centauri_b_star_side'
  }

  // stations.json `more`: the 7th and 8th slots, after LuV's two and ZPM's and UV's four
  T.stations = [
    { slot: 'mercury', orbit: 'gcyr:mercury_orbit', planet: 'gcyr:mercury' },
    { slot: 'proxima', orbit: 'grindless:proxima_b_orbit', planet: 'gcyr:proxima_centauri_b' }
  ]

  T.sunlight = {
    'gcyr:mercury_orbit': 9.35,
    'grindless:proxima_b_orbit': 0.91,
    'gcyr:proxima_centauri_b': 0.91
  }
})()
