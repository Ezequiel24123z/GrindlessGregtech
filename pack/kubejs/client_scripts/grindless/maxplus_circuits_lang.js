// priority: 7048
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
        ['gtceu.recipe.grindless_photonic_integration.horizon_processor', 'Horizon processor'],
        ['gtceu.recipe.grindless_mtj_sputtering.stacked_horizon_module', 'Circuit 28: two horizon logic dies stacked on the shielded quantum module with a spin interconnect; one stack in twenty fails and leaves scrap'],
        ['gtceu.recipe.grindless_femtosecond_writing.linked_horizon_module', 'Circuit 21: the horizon interposer laid over the stack and waveguide links written between them'],
        ['gtceu.recipe.grindless_condensate_refinery.condensate_cooled_module', 'Circuit 12: the linked module jacketed in 1,000 mB of Kerr condensate'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.tested_horizon_module', 'Circuit 13: the module cold-tested at 10 mK in the cryostat module (kept); the He-3/He-4 mixture is returned']
    ];
    // id, name, tip 0, tip 1
    var ITEMS = [
        ['stacked_horizon_module', 'Stacked Horizon Module', 'The shielded quantum module with two horizon logic dies stacked on it.', 'Goes on to Linked Horizon Module.'],
        ['linked_horizon_module', 'Linked Horizon Module', 'The stack with the horizon interposer and its written waveguide links.', 'Goes on to Condensate-Cooled Module.'],
        ['condensate_cooled_module', 'Condensate-Cooled Module', 'The linked module jacketed in Kerr condensate.', 'Goes on to Tested Horizon Module.'],
        ['tested_horizon_module', 'Tested Horizon Module', 'A horizon module cold-tested at 10 mK.', 'Integrated into the Horizon Processor.'],
        ['horizon_module_scrap', 'Horizon Module Scrap', 'A failed stack of the horizon module.', 'Leached in the extraction cascade for its indium and niobium.']
    ];
    ClientEvents.lang('en_us', function (event) {
        ITEMS.forEach(function (e) {
            event.add('grindless', 'item.grindless.' + e[0], e[1]);
            event.add('grindless', 'tooltip.grindless.' + e[0] + '.0', e[2]);
            event.add('grindless', 'tooltip.grindless.' + e[0] + '.1', e[3]);
        });
        ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1]); });
    })
})();
