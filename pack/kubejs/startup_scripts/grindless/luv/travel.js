// priority: -4700
// -----------------------------------------------------------------------------------------------
// LuV travel (package LuV-B1, docs/eras/luv.md "The belt and Jupiter's moons", "Cryogenic fuel tank" and decision 2).
//
// The level 4 rocket. GCYR 0.2.9 works a rocket's tier out as floor((weakest motor tier + weakest tank tier) / 2) and refuses a
// destination with a higher rocket_tier. Its best parts are elite (tier 3): the belt and Jupiter's moons are rocket_tier 4, so the
// level 4 rocket needs a tier 5 tank, registered through GCYR's own KubeJS builder (no Java):
//   grindless:cryogenic_fuel_tank   gcyr:fuel_tank, tier 5, 16,000 mB; elite motors + only these tanks = level 4.
// Spike S0-2 (native, 2026-10-26) launched the same builder's tank: two of them hold 32,000 mB, a mixed build with an elite tank (tier 3)
// is refused for tier 4, and a level 4 round trip to a Jupiter moon worked. Jupiter itself is rocket_tier 5: no rocket reaches it in LuV;
// it is there for GCYR's menu (only planets with no parent get a navigation button). Proxima Centauri b goes to 5 for the same reason.
//
// The places themselves are data: data/grindless/gcyr/planets/*.json (5), data/grindless/dimension/*.json (10) and their types, noise,
// biomes and skies. Other packages read the dimension ids only through tables/places.json (G.places) and tables/orbits.json (G.orbits).
// GCYR's planet "gravity" is shown in its menu but no entity physics reads it (S0-1: a client fell at vanilla speed on a 1.315 m/s²
// moon): the values are real-world figures for the menu only.
//
// The recipes are in server_scripts/grindless/luv/travel.js. Names: client_scripts/grindless/luv_travel_lang.js.
// Published as global.grindless.luvTravel.
(function () {
  var G = global.grindless
  var T = G.luvTravel || (G.luvTravel = {})

  T.tank = {
    id: 'grindless:cryogenic_fuel_tank',
    typeId: 'grindless_cryogenic',
    tier: 5,
    fuel: 16000,
    model: 'grindless:block/luv/cryogenic_fuel_tank'
  }

  // GCYR planet ids (data/grindless/gcyr/planets/<name>.json) -> world, orbit, parent and rocket tier; the regression test checks the files
  T.planets = {
    'grindless:asteroid_belt': { places: 'asteroid_belt', planets: 'belt', tier: 4 },
    'grindless:jupiter': { planets: 'jupiter', tier: 5 },
    'grindless:io': { places: 'io', planets: 'io', parent: 'grindless:jupiter', tier: 4 },
    'grindless:europa': { places: 'europa', planets: 'europa', parent: 'grindless:jupiter', tier: 4 },
    'grindless:ganymede': { places: 'ganymede', planets: 'ganymede', parent: 'grindless:jupiter', tier: 4 }
  }

  StartupEvents.registry('block', function (event) {
    event.create(T.tank.id, 'gcyr:fuel_tank')
      .typeId(T.tank.typeId)
      .tier(T.tank.tier)
      .fuelStorage(T.tank.fuel)
      .textureAll('grindless:block/luv/cryogenic_fuel_tank_side')
      .model(T.tank.model)
      .hardness(5)
      .resistance(6)
      .requiresTool(true)
      .tagBlock('minecraft:mineable/pickaxe')
      .item(function (item) {
        item.tooltip(Text.gray(Text.translate('tooltip.grindless.cryogenic_fuel_tank.0')))
        item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.cryogenic_fuel_tank.1')))
      })
  })
})()
