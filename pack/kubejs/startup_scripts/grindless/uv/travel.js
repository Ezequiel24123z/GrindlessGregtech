// priority: -10800
// -----------------------------------------------------------------------------------------------
// UV travel (package UV-B1, docs/eras/uv.md "Places and site rules", "Bridges and first arrivals", "AE2").
//
// The places are data: data/grindless/gcyr/planets/{neptune,pluto}.json (GCYR planets), data/grindless/dimension/ (the four
// worlds, gcyr:space like ZPM's) and assets/grindless/gcyr/planet_assets/sky_renderers/{neptune,pluto}_orbit.json.
//   grindless:neptune   rocket_tier 6: elite motors + only aerogel tanks (ZPM-B1, tank tier 9) reach it
//   grindless:pluto     rocket_tier 7: elite motors + only BNNT tanks (grindless:bnnt_fuel_tank, F1, tank tier 11, recipe UV-A11)
// GCYR 0.2.9 works a rocket's level out as floor((motor tier + tank tier) / 2), the weakest averaged; elite motors are tier 3.
// Proxima Centauri b stays rocket_tier 8 and has no orbit: nothing in the pack reaches it.
//
// The orbit seeds (the far halves of the Earth-Neptune and Earth-Pluto AE2 pairs, made only in those orbits):
//   grindless:neptunian_quantum_seed    in Neptune orbit, with the deep siphon's Neptune helium as the catalyst
//   grindless:plutonian_quantum_seed    in Pluto orbit, with the penetrator's Sputnik ice core as the catalyst
// The stations are tables/stations.json `more` slots five and six (lib/stations.js). Recipes: server_scripts/grindless/uv/travel.js.
// Names: client_scripts/grindless/uv_travel_lang.js. Published as global.grindless.uvTravel.
(function () {
  var G = global.grindless
  var T = G.uvTravel || (G.uvTravel = {})

  // GCYR planet ids (data/grindless/gcyr/planets/<name>.json); the regression test checks the files
  T.planets = {
    'grindless:neptune': { planets: 'neptune', tier: 6, orbit: 'grindless:neptune_orbit', tank: 'grindless:aerogel_fuel_tank' },
    'grindless:pluto': { planets: 'pluto', tier: 7, orbit: 'grindless:pluto_orbit', tank: 'grindless:bnnt_fuel_tank' }
  }

  T.seeds = {
    neptune: 'grindless:neptunian_quantum_seed',
    pluto: 'grindless:plutonian_quantum_seed'
  }

  StartupEvents.registry('item', function (event) {
    Object.keys(T.seeds).forEach(function (key) {
      var id = T.seeds[key]
      var name = id.split(':')[1]
      event.create(id)
        .texture('grindless:item/' + name)
        .maxStackSize(16)
        .tooltip(Text.gray(Text.translate('tooltip.grindless.' + name)))
    })
  })
})()
