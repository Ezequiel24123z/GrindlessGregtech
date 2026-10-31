// priority: 6706
// Gregtech Grindless - EMI lines of MAX-A2's rows on older machines (the six components' feeder lines L9, L10, L31, L32, L35 and L41):
//
//   gtceu.recipe.<dataKey>.<recipe>                    the EMI line of each recipe
//
// Same format as max_circuits_lang.js. Item and component names are in max_foundation_lang.js. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_coated_conductor.rebco_tape_max', 'MAX REBCO tape', 'Cinta REBCO MAX'],
        ['gtceu.recipe.grindless_magnet_winding.max_coil_winding', 'MAX coil winding', 'Bobinado de bobina MAX'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.fe16n2_ring_magnet', 'Fe16N2 ring magnet', 'Im\u00e1n anular de Fe16N2'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.bearing_rotor_ring', 'Bearing rotor ring', 'Anillo de rotor de cojinete'],
        ['gtceu.recipe.grindless_sic_fibre_spinning.sic_tow', 'SiC tow', 'Mecha de SiC'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.cmc_coil_former', 'CMC coil former', 'Molde de bobina CMC'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.sic_sic_preform', 'SiC/SiC preform', 'Preforma de SiC/SiC'],
        ['gtceu.recipe.grindless_ion_slicing.yig_on_ln_wafer', 'YIG-on-LN wafer by ion slicing', 'Oblea de YIG sobre LN por corte i\u00f3nico'],
        ['gtceu.recipe.grindless_femtosecond_writing.isolator_waveguide_die', 'Isolator waveguide die', 'Chip de gu\u00eda de ondas del a\u00edslador'],
        ['gtceu.recipe.grindless_levitation_melting.terfenol_ingot', 'Terfenol-D ingot', 'Lingote de Terfenol-D'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.cold_tested_superleak', 'Cold-tested superleak', 'Superescape probado en fr\u00edo'],
        ['gtceu.recipe.grindless_liquid_phase_epitaxy.bi_yig_film', 'Bismuth YIG film', 'Pel\u00edcula de YIG con bismuto'],
        ['gtceu.recipe.grindless_shequid_assembly.balanced_composite_billet', 'Balanced composite billet', 'Tocho compuesto equilibrado'],
        ['gtceu.recipe.grindless_shequid_assembly.calibrated_superleak', 'Calibrated superleak', 'Superescape calibrado'],
        ['gtceu.recipe.grindless_high_flux_irradiation.irradiated_ybco_bulk', 'Irradiated YBCO bulk', 'Bloque de YBCO irradiado'],
        ['gtceu.recipe.grindless_single_crystal_casting.tsmg_ybco_bulk', 'Top-seeded YBCO bulk', 'Bloque de YBCO sembrado'],
        ['gtceu.recipe.grindless_single_crystal_casting.oriented_terfenol_rod', 'Oriented Terfenol-D rod', 'Barra de Terfenol-D orientada']
    ];
    ['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1 + li]); });
        });
    });
})();
