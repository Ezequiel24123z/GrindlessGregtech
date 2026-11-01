// priority: 6926
// Gregtech Grindless - EMI lines of the MAX+ AE2 lines A1 to A3 on the older machines (package XP-AE):
//
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe that carries a data key
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_mtj_sputtering.mram_stack_plus', 'Enhanced MRAM stack', 'Pila de MRAM mejorada'],
        ['gtceu.recipe.grindless_beuv_lithography.patterned_mram', 'Patterned MRAM', 'MRAM con patr\u00f3n'],
        ['gtceu.recipe.grindless_racetrack_patterning.racetrack_3d_stack', 'Racetrack 3D stack', 'Pila 3D de pista de carreras'],
        ['gtceu.recipe.grindless_ion_slicing.ln_modulator_array', 'Lithium niobate modulator array', 'Matriz de moduladores de niobato de litio'],
        ['gtceu.recipe.grindless_photonic_foundry.optical_matrix_die', 'Optical matrix die', 'Dado de matriz \u00f3ptica'],
        ['gtceu.recipe.grindless_photonic_integration.photonic_coprocessor', 'Photonic coprocessor', 'Coprocesador fot\u00f3nico'],
        ['gtceu.recipe.grindless_crystal_growth.fe_ln_boule', 'Iron-doped lithium niobate boule', 'Boule de niobato de litio dopado con hierro'],
        ['gtceu.recipe.grindless_femtosecond_writing.addressed_holo_slab', 'Addressed holographic slab', 'Losa hologr\u00e1fica direccionada'],
        ['gtceu.recipe.grindless_spectral_hole_burning.burned_pattern_crystal', 'Burned pattern crystal', 'Cristal de patr\u00f3n grabado']
    ];
    ['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1 + li]); });
        });
    });
})();
