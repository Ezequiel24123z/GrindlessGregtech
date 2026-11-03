// priority: -2650
// -----------------------------------------------------------------------------------------------
// IV's uranium front end (docs/eras/lines-ev-zpm.md, I1): the GT materials of the new steps between the leach field and GTM's UF6
// centrifuge. The recipes are in server_scripts/grindless/iv/fuel_front_end.js; the names in client_scripts/grindless/iv_fuel_front_end_lang.js.
//
//   gtceu:uranyl_sulfate_liquor   fluid: the leach field's pregnant liquor
//   gtceu:uranium_eluate          fluid: the ion-exchange eluate
//   gtceu:yellowcake              dust: uranium peroxide
//   gtceu:triuranium_octoxide     dust: U3O8
//   gtceu:uranium_tetrafluoride   dust: UF4, the green salt
//
// None is decomposed by GTM: only our own steps make and use them.
// -----------------------------------------------------------------------------------------------

GTCEuStartupEvents.registry('gtceu:material', function (event) {
    event.create('uranyl_sulfate_liquor')
      .liquid()
      .color(0xC9D63A)
      .formula('UO2SO4(aq)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create('uranium_eluate')
      .liquid()
      .color(0xE2E05A)
      .formula('UO2(SO4)3(aq)')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create('yellowcake')
      .dust()
      .color(0xE8D43C).secondaryColor(0xB59B12)
      .iconSet(GTMaterialIconSet.DULL)
      .formula('UO4(H2O)2')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create('triuranium_octoxide')
      .dust()
      .color(0x3F4A2A).secondaryColor(0x1E2415)
      .iconSet(GTMaterialIconSet.DULL)
      .formula('U3O8')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)

    event.create('uranium_tetrafluoride')
      .dust()
      .color(0x4DB36B).secondaryColor(0x27703F)
      .iconSet(GTMaterialIconSet.DULL)
      .formula('UF4')
      .flags(GTMaterialFlags.DISABLE_DECOMPOSITION)
})
