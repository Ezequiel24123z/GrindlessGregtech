// priority: -3700
// -----------------------------------------------------------------------------------------------
// Items of the road to the first rocket (MV -> HV). They are the parts that make the first rocket an engineering project instead of one
// assembler recipe; none of them is a block of the rocket (the rocket stays GCYR's own blocks, only their recipes change):
//   grindless:qualified_power_thruster   MV. A GTM power thruster that passed its static fire on the Engine Test Stand (four at a time, on
//                                        RP-1 and oxygen). Four go into an untested rocket motor
//   grindless:untested_rocket_motor      HV. Assembled from four qualified thrusters, two ablative heat shield tiles (the base heat
//                                        shield), Kapton K and a stainless steel frame. Its static fire on the Engine Test Stand turns it
//                                        into gcyr:basic_rocket_motor
//   grindless:ablative_heat_shield_tile  HV. Glass fibre and epoxy cured in the Composite Autoclave
//   grindless:composite_overwrapped_tank HV. A stainless steel drum overwrapped with para-aramid in epoxy, cured in the Composite
//                                        Autoclave. Two of them make a basic fuel tank of GCYR
// Recipes: server_scripts/grindless/launch_road/*.js and integration/gcyr_launch_road.js. Names / tooltips:
// client_scripts/grindless/launch_road_lang.js. Textures: tools/assets/Build-LaunchRoadTextures.ps1.
(function () {
  StartupEvents.registry('item', function (event) {
    event.create('grindless:qualified_power_thruster')
      .texture('grindless:item/qualified_power_thruster')
      .tooltip(Text.gray(Text.translate('tooltip.grindless.qualified_power_thruster')))

    event.create('grindless:untested_rocket_motor')
      .texture('grindless:item/untested_rocket_motor')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.untested_rocket_motor')))

    event.create('grindless:ablative_heat_shield_tile')
      .texture('grindless:item/ablative_heat_shield_tile')
      .tooltip(Text.gray(Text.translate('tooltip.grindless.ablative_heat_shield_tile')))

    event.create('grindless:composite_overwrapped_tank')
      .texture('grindless:item/composite_overwrapped_tank')
      .maxStackSize(16)
      .tooltip(Text.gray(Text.translate('tooltip.grindless.composite_overwrapped_tank')))
  })
})()
