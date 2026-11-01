// priority: 6840
// Gregtech Grindless - EMI lines of XP-A3's rows on older machines (MAX+ lines Q1 and Q2 and the horizon processor, package XP-A3):
//
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_calutron_separation.si28_feed', 'Silicon-28 feed', 'Alimentación de silicio-28'],
        ['gtceu.recipe.grindless_crystal_growth.si28_boule', 'Silicon-28 boule', 'Boule de silicio-28'],
        ['gtceu.recipe.grindless_beuv_lithography.horizon_logic_wafer', 'Horizon logic wafer', 'Oblea lógica del horizonte'],
        ['gtceu.recipe.grindless_mtj_sputtering.spin_interconnect_wafer', 'Spin interconnect wafer', 'Oblea de interconexión de espín'],
        ['gtceu.recipe.grindless_racetrack_patterning.stacked_logic_wafer', 'Stacked logic wafer', 'Oblea lógica apilada'],
        ['gtceu.recipe.grindless_ion_slicing.ln_on_insulator_plus', 'Enhanced lithium niobate on insulator', 'Niobato de litio sobre aislante mejorado'],
        ['gtceu.recipe.grindless_femtosecond_writing.interposer_waveguides', 'Interposer waveguides', 'Guías de ondas del interposer'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.piezo_transducer_layer', 'Piezo transducer layer', 'Capa transductora piezoeléctrica'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.horizon_interposer', 'Horizon interposer', 'Interposer del horizonte'],
        ['gtceu.recipe.grindless_photonic_integration.horizon_processor', 'Horizon processor', 'Procesador del horizonte']
    ];
    ['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1 + li]); });
        });
    });
})();
