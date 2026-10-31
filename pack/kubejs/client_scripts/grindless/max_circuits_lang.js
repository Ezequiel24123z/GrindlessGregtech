// priority: 6735
// Gregtech Grindless - EMI lines of MAX-A1's rows on older machines (lines 5, 6 and 7 and the mainframe join, package MAX-A1):
//
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_crystal_growth.ppln_boule', 'Periodically poled lithium niobate boule', 'Boule de niobato de litio de polarización periódica'],
        ['gtceu.recipe.grindless_crystal_growth.quartz_crystal_wafer', 'Quartz crystal wafer', 'Oblea de cristal de cuarzo'],
        ['gtceu.recipe.grindless_ion_slicing.ppln_thin_film_wafer', 'PPLN thin-film wafer by ion slicing', 'Oblea de película fina de PPLN por corte iónico'],
        ['gtceu.recipe.grindless_ion_slicing.transducer_wafer', 'Transducer wafer by ion slicing', 'Oblea transductora por corte iónico'],
        ['gtceu.recipe.grindless_femtosecond_writing.squeezer_waveguide_die', 'Squeezer waveguide die', 'Chip de guía de ondas comprimidora'],
        ['gtceu.recipe.grindless_snspd_fabrication.squeezed_light_chip', 'Squeezed-light chip', 'Chip de luz comprimida'],
        ['gtceu.recipe.grindless_photonic_integration.supracausal_mainframe', 'Supracausal mainframe', 'Mainframe supracausal'],
        ['gtceu.recipe.grindless_beuv_lithography.metalens_wafer', 'Metalens wafer', 'Oblea de metalente'],
        ['gtceu.recipe.grindless_mtj_sputtering.coated_metalens', 'Gold-coated metalens', 'Metalente recubierta de oro'],
        ['gtceu.recipe.grindless_mtj_sputtering.nb_coplanar_film', 'Niobium coplanar film', 'Película coplanar de niobio'],
        ['gtceu.recipe.grindless_quantum_degenerate_gas.tweezer_calibrated_lens', 'Tweezer-calibrated lens', 'Lente calibrada para pinzas'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.piezo_optomech_layer', 'Piezo optomechanical layer', 'Capa optomecánica piezoeléctrica'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.cryo_photonic_interposer', 'Cryo photonic interposer', 'Interposer fotónico criogénico']
    ];
    ['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1 + li]); });
        });
    });
})();
