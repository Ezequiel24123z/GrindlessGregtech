// Disposable GCYR 0.2.9 probe; never shipped. FuelTankBlockBuilder and Luna data: GCYR, LGPL-3.0.
StartupEvents.registry('block', function (event) {
  event.create('grindless:s0_cryogenic_fuel_tank', 'gcyr:fuel_tank')
    .typeId('grindless_s0_cryogenic').tier(5).fuelStorage(16000)
    .textureAll('minecraft:block/blue_ice')
})
