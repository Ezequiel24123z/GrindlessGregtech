// priority: 7650
// Gregtech Grindless - names of LuV's PEDOT:PSS line (startup_scripts/grindless/luv/pedot.js; package D2-PEDOT).
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['material.gtceu.thiophene', 'Thiophene'],
        ['material.gtceu.tetrabromothiophene', 'Tetrabromothiophene'],
        ['material.gtceu.dibromothiophene', '3,4-Dibromothiophene'],
        ['material.gtceu.dimethoxythiophene', '3,4-Dimethoxythiophene'],
        ['material.gtceu.edot', 'EDOT'],
        ['material.gtceu.sodium_methoxide', 'Sodium Methoxide Solution'],
        ['material.gtceu.ethylene_oxide', 'Ethylene Oxide'],
        ['material.gtceu.ethylene_glycol', 'Ethylene Glycol'],
        ['material.gtceu.hydrogen_bromide', 'Hydrogen Bromide'],
        ['material.gtceu.polystyrene', 'Polystyrene'],
        ['material.gtceu.polystyrene_sulfonate', 'Polystyrene Sulfonate'],
        ['material.gtceu.pedot_pss', 'PEDOT:PSS'],
        ['material.gtceu.zinc_bromide', 'Zinc Bromide'],
        ['material.gtceu.sodium_bromide', 'Sodium Bromide']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
