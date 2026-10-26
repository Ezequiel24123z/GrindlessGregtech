// Disposable GCYR 0.2.9 probe; never shipped. FuelTankBlockBuilder and Luna data: GCYR, LGPL-3.0.
StartupEvents.registry('block', function (event) {
  event.create('grindless:s0_cryogenic_fuel_tank', 'gcyr:fuel_tank')
    .typeId('grindless_s0_cryogenic').tier(5).fuelStorage(16000)
    .textureAll('minecraft:block/blue_ice')
})

;(function () {
  var marker = JsonIO.read('kubejs/config/gg_test_luv_s0_planet.json')
  if (marker === null || String(marker.get('enabled')) !== 'true' ||
      String(marker.get('stationsOnly')) !== 'true') return
  var G = global.grindless
  if (!G || !G.orbits || !Array.isArray(G.orbits.dimensions)) {
    throw new Error('[grindless S0] station continuation requires the production orbit registry')
  }
  var dimension = 'grindless:s0_moon_orbit'
  if (G.orbits.dimensions.indexOf(dimension) < 0) G.orbits.dimensions.push(dimension)
  console.info('GGTEST|luv_s0_stations|test_orbit_allowlist|PASS|' + dimension +
    ' added only by the enabled disposable station fixture')
})()
