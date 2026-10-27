// UV-S0 (S0-1) disposable tier 11 fuel tank. TEST-ONLY overlay, never shipped.
StartupEvents.registry('block', function (event) {
  event.create('grindless:s0_uv_tank', 'gcyr:fuel_tank')
    .typeId('grindless_s0_uv')
    .tier(11)
    .fuelStorage(1024000)
    .textureAll('gcyr:block/basic_fuel_tank')
    .hardness(5)
    .resistance(6)
})
