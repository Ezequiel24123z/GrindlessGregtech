// priority: 6852
// Gregtech Grindless - EMI lines of MAX-A1's rows on older machines (lines 5, 6 and 7 and the mainframe join, package MAX-A1):
//
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.recipe.grindless_crystal_growth.ppln_boule', 'Periodically poled lithium niobate boule'],
        ['gtceu.recipe.grindless_crystal_growth.quartz_crystal_wafer', 'Quartz crystal wafer'],
        ['gtceu.recipe.grindless_ion_slicing.ppln_thin_film_wafer', 'PPLN thin-film wafer by ion slicing'],
        ['gtceu.recipe.grindless_ion_slicing.transducer_wafer', 'Transducer wafer by ion slicing'],
        ['gtceu.recipe.grindless_femtosecond_writing.squeezer_waveguide_die', 'Squeezer waveguide die'],
        ['gtceu.recipe.grindless_snspd_fabrication.squeezed_light_chip', 'Squeezed-light chip'],
        ['gtceu.recipe.grindless_photonic_integration.supracausal_mainframe', 'Supracausal mainframe'],
        ['gtceu.recipe.grindless_beuv_lithography.metalens_wafer', 'Metalens wafer'],
        ['gtceu.recipe.grindless_mtj_sputtering.coated_metalens', 'Gold-coated metalens'],
        ['gtceu.recipe.grindless_mtj_sputtering.nb_coplanar_film', 'Niobium coplanar film'],
        ['gtceu.recipe.grindless_quantum_degenerate_gas.tweezer_calibrated_lens', 'Tweezer-calibrated lens'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.piezo_optomech_layer', 'Piezo optomechanical layer'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.cryo_photonic_interposer', 'Cryo photonic interposer']
    ];
    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1]); });
    })
})();
