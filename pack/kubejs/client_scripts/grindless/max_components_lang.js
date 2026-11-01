// priority: 6825
// Gregtech Grindless - EMI lines of MAX-A2's rows on older machines (the six components' feeder lines L9, L10, L31, L32, L35 and L41):
//
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Same format as max_circuits_lang.js. Item and component names are in max_foundation_lang.js. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.recipe.grindless_coated_conductor.rebco_tape_max', 'MAX REBCO tape'],
        ['gtceu.recipe.grindless_magnet_winding.max_coil_winding', 'MAX coil winding'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.fe16n2_ring_magnet', 'Fe16N2 ring magnet'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.bearing_rotor_ring', 'Bearing rotor ring'],
        ['gtceu.recipe.grindless_sic_fibre_spinning.sic_tow', 'SiC tow'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.cmc_coil_former', 'CMC coil former'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.sic_sic_preform', 'SiC/SiC preform'],
        ['gtceu.recipe.grindless_ion_slicing.yig_on_ln_wafer', 'YIG-on-LN wafer by ion slicing'],
        ['gtceu.recipe.grindless_femtosecond_writing.isolator_waveguide_die', 'Isolator waveguide die'],
        ['gtceu.recipe.grindless_levitation_melting.terfenol_ingot', 'Terfenol-D ingot'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.cold_tested_superleak', 'Cold-tested superleak'],
        ['gtceu.recipe.grindless_liquid_phase_epitaxy.bi_yig_film', 'Bismuth YIG film'],
        ['gtceu.recipe.grindless_shequid_assembly.balanced_composite_billet', 'Balanced composite billet'],
        ['gtceu.recipe.grindless_shequid_assembly.calibrated_superleak', 'Calibrated superleak'],
        ['gtceu.recipe.grindless_high_flux_irradiation.irradiated_ybco_bulk', 'Irradiated YBCO bulk'],
        ['gtceu.recipe.grindless_single_crystal_casting.tsmg_ybco_bulk', 'Top-seeded YBCO bulk'],
        ['gtceu.recipe.grindless_single_crystal_casting.oriented_terfenol_rod', 'Oriented Terfenol-D rod']
    ];
    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1]); });
    })
})();
