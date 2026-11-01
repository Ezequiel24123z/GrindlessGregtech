// priority: 6926
// Gregtech Grindless - EMI lines of the MAX+ AE2 lines A1 to A3 on the older machines (package XP-AE):
//
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe that carries a data key
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.recipe.grindless_mtj_sputtering.mram_stack_plus', 'Enhanced MRAM stack'],
        ['gtceu.recipe.grindless_beuv_lithography.patterned_mram', 'Patterned MRAM'],
        ['gtceu.recipe.grindless_racetrack_patterning.racetrack_3d_stack', 'Racetrack 3D stack'],
        ['gtceu.recipe.grindless_ion_slicing.ln_modulator_array', 'Lithium niobate modulator array'],
        ['gtceu.recipe.grindless_photonic_foundry.optical_matrix_die', 'Optical matrix die'],
        ['gtceu.recipe.grindless_photonic_integration.photonic_coprocessor', 'Photonic coprocessor'],
        ['gtceu.recipe.grindless_crystal_growth.fe_ln_boule', 'Iron-doped lithium niobate boule'],
        ['gtceu.recipe.grindless_femtosecond_writing.addressed_holo_slab', 'Addressed holographic slab'],
        ['gtceu.recipe.grindless_spectral_hole_burning.burned_pattern_crystal', 'Burned pattern crystal']
    ];
    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1]); });
    })
})();
