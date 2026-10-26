// TEST ONLY, ZPM-S0. Disposable GCYR 0.2.9 probe for S0-1: a KubeJS gcyr:rocket_motor (tier 5) and gcyr:fuel_tank (tier 7).
StartupEvents.registry('block', function (event) {
  event.create('grindless:s0_naquadah_motor', 'gcyr:rocket_motor')
    .typeId('grindless_s0_naquadah').tier(5).fuelStorage(16000)
    .textureAll('minecraft:block/blue_ice')
  event.create('grindless:s0_aerogel_tank', 'gcyr:fuel_tank')
    .typeId('grindless_s0_aerogel').tier(7).fuelStorage(16000)
    .textureAll('minecraft:block/blue_ice')
})
