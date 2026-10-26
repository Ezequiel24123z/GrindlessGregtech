// TEST ONLY, ZPM-S0 S0-6: a custom D + He-3 fusion recipe whose start EU (250 M) is above the Mk1's 160 M and below the Mk2's.
ServerEvents.recipes(function (event) {
  event.recipes.gtceu.fusion_reactor('grindless:s0_d_he3')
    .inputFluids('#forge:deuterium 125', 'gtceu:helium_3 125')
    .outputFluids(Fluid.of('gtceu:helium_plasma', 125))
    .EUt(16384)
    .duration(32)
    .fusionStartEU(250000000)
})
