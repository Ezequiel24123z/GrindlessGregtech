// priority: 7044
// Gregtech Grindless - EMI lines of XP-A3's rows on older machines (MAX+ lines Q1 and Q2 and the horizon processor, package XP-A3):
//
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.recipe.grindless_calutron_separation.si28_feed', 'Silicon-28 feed'],
        ['gtceu.recipe.grindless_crystal_growth.si28_boule', 'Silicon-28 boule'],
        ['gtceu.recipe.grindless_beuv_lithography.horizon_logic_wafer', 'Horizon logic wafer'],
        ['gtceu.recipe.grindless_mtj_sputtering.spin_interconnect_wafer', 'Spin interconnect wafer'],
        ['gtceu.recipe.grindless_racetrack_patterning.stacked_logic_wafer', 'Stacked logic wafer'],
        ['gtceu.recipe.grindless_ion_slicing.ln_on_insulator_plus', 'Enhanced lithium niobate on insulator'],
        ['gtceu.recipe.grindless_femtosecond_writing.interposer_waveguides', 'Interposer waveguides'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.piezo_transducer_layer', 'Piezo transducer layer'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.horizon_interposer', 'Horizon interposer'],
        ['gtceu.recipe.grindless_photonic_integration.horizon_processor', 'Horizon processor']
    ];
    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1]); });
    })
})();
