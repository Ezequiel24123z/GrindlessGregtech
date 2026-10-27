// priority: -12100
// -----------------------------------------------------------------------------------------------
// ZPM travel (package ZPM-B1, docs/eras/zpm.md "Route", "Saturn, Uranus and what is only seen", "Bridges and first arrivals").
//
// The level 5 and level 6 rockets. GCYR 0.2.9 works a rocket's tier out as floor((weakest motor tier + weakest tank tier) / 2) and
// its motors are a fixed enum up to elite (tier 3); spike S0-1 showed no KubeJS motor builder exists (gcyr:rocket_motor builds a
// tank). So the era raises the tank, through GCYR's own KubeJS builder, exactly like LuV's cryogenic tank:
//   grindless:naquadah_fuel_tank   gcyr:fuel_tank, tier 7; elite motors + only these tanks = level 5 (Saturn).
//   grindless:aerogel_fuel_tank    gcyr:fuel_tank, tier 9; elite motors + only these tanks = level 6 (Uranus).
// Saturn is rocket_tier 5, Uranus 6 and Proxima Centauri b 8 (data/gcyr/gcyr/planets/proxima_centauri_b.json).
//
// The orbit seeds (the far halves of the Earth-Saturn and Earth-Uranus AE2 pairs, made only in those orbits):
//   grindless:saturnian_quantum_seed   a ring ice sample, in Saturn orbit
//   grindless:uranian_quantum_seed     an ice-giant atmosphere sample, in Uranus orbit
//
// The places are data (data/grindless/gcyr/planets, dimension, sky_renderers). Recipes: server_scripts/grindless/zpm/travel.js.
// Names: client_scripts/grindless/zpm_travel_lang.js. Published as global.grindless.zpmTravel.
(function () {
  var G = global.grindless
  var T = G.zpmTravel || (G.zpmTravel = {})

  T.tanks = {
    naquadah: { id: 'grindless:naquadah_fuel_tank', typeId: 'grindless_naquadah', tier: 7, fuel: 64000 },
    aerogel: { id: 'grindless:aerogel_fuel_tank', typeId: 'grindless_aerogel', tier: 9, fuel: 256000 }
  }

  // GCYR planet ids (data/grindless/gcyr/planets/<name>.json); the regression test checks the files
  T.planets = {
    'grindless:saturn': { planets: 'saturn', tier: 5 },
    'grindless:uranus': { planets: 'uranus', tier: 6 }
  }

  T.seeds = {
    saturn: 'grindless:saturnian_quantum_seed',
    uranus: 'grindless:uranian_quantum_seed'
  }

  StartupEvents.registry('block', function (event) {
    Object.keys(T.tanks).forEach(function (key) {
      var tank = T.tanks[key]
      var name = tank.id.split(':')[1]
      event.create(tank.id, 'gcyr:fuel_tank')
        .typeId(tank.typeId)
        .tier(tank.tier)
        .fuelStorage(tank.fuel)
        .textureAll('grindless:block/zpm/' + name + '_side')
        .model('grindless:block/zpm/' + name)
        .hardness(5)
        .resistance(6)
        .requiresTool(true)
        .tagBlock('minecraft:mineable/pickaxe')
        .item(function (item) {
          item.tooltip(Text.gray(Text.translate('tooltip.grindless.' + name + '.0')))
          item.tooltip(Text.darkGray(Text.translate('tooltip.grindless.' + name + '.1')))
        })
    })
  })

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
