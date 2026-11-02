// priority: 6901
// Gregtech Grindless - names, tooltips and EMI lines of MAX+'s polarized fusion stellarator and its line P26 (startup_scripts/grindless/maxplus/stellarator.js; package B13-STEL):
//
//   gtceu.<type>, block.gtceu.<machine>, grindless.machine.<machine>.tooltip.0   the recipe type and the controller
//   gtceu.recipe.<data key>.<recipe>                                             the EMI line of each keyed row (the plant's own row and the two crossings of P26)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.polarized_fusion', 'Polarized Fusion'],
        ['gtceu.polarized_fusion_stellarator', 'Polarized Fusion Stellarator'],
        ['block.gtceu.polarized_fusion_stellarator', 'Polarized Fusion Stellarator'],
        ['grindless.machine.polarized_fusion_stellarator.tooltip.0', '\u00a77A generator: spin-polarized pellets and helium-3 fuse, up to 64 runs at once, limited by its dynamo hatches (up to 8).'],

        ['gtceu.recipe.grindless_polarized_fusion.helium_4_ash', 'Circuit 1: 4 polarized HD pellets and 1,000 mB of polarized helium-3 fuse into helium-4 ash and hydrogen and make 2^34 EU/t per run; wears a neutral beam injector 1 in 64, a direct converter stack 1 in 128 and an sCO2 turbine module 1 in 128 (line P26).'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.frozen_spin_hd', 'Pure HD polarized by brute force at millikelvin and frozen into spin-polarized HD ice (line P26).'],
        ['gtceu.recipe.grindless_photonic_foundry.polarized_helium_3', 'Pristine helium-3 polarized by optical pumping with 1,083 nm light; wears a MAX emitter 1 in 64 (line P26).']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
