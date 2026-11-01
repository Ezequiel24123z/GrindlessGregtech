// priority: 6927
// Gregtech Grindless - names and tooltips of MAX+'s hyper assembly array, the Hyperstargate's parts and the creative-item stand-ins
// (startup_scripts/grindless/maxplus/grid.js; package XP-H4a). Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js
// scripts. English only; es_es copies the English text until EN-1 removes it.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.hyper_assembly_array', 'Hyper Assembly Array'],
        ['block.gtceu.hyper_assembly_array', 'Hyper Assembly Array'],
        ['grindless.machine.hyper_assembly_array.tooltip.0', '\u00a77Builds the Hyperstargate\'s parts and the creative-item ingredients from dozens of inputs at once.'],
        ['gtceu.recipe.grindless_hyper_assembly_array.hyperstargate_ring_block', 'Circuit 1: frame parts, containment plates, field generators and the rest assembled into a Hyperstargate ring block under a condensate bath.'],
        ['gtceu.recipe.grindless_hyper_assembly_array.hyperstargate_chevron_upgrade', 'Circuit 2: compressed plates, frame parts, chevron cores and drives assembled into a chevron upgrade under a condensate bath.'],
        ['gtceu.recipe.grindless_hyper_assembly_array.hyperstargate_chevron_block', 'Circuit 3: ring blocks, chevron upgrades and the four horizon parts assembled into a chevron block.'],
        ['gtceu.recipe.grindless_hyper_assembly_array.hyperstargate_locked_chevron', 'Circuit 4: the chevron block\'s parts and a horizon lock assembled into a locked chevron.'],
        ['gtceu.recipe.grindless_hyper_assembly_array.iris_blade', 'Circuit 5: a coated iris blade finished into an iris blade (line T11, last step).'],
        ['gtceu.recipe.grindless_hyper_assembly_array.horizon_iris', 'Circuit 6: 240 iris blades, shielding and condensate field cells assembled into a horizon iris.'],
        ['gtceu.recipe.grindless_hyper_assembly_array.horizon_capacitor', 'Circuit 7: Kerr toroids, field generators, flux-confinement loops and a creative energy cell stand-in assembled into a horizon capacitor.'],
        ['gtceu.recipe.grindless_hyper_assembly_array.hyperstargate_power_unit', 'Circuit 8: ring blocks, resonance chambers, 640 conduits and a creative energy source stand-in assembled into a power unit.'],
        ['gtceu.recipe.grindless_hyper_assembly_array.hyperstargate_base', 'Circuit 9: chevron blocks, ring blocks, upgrades, alignment matrices, creative stand-ins, MEGA cells and four MAX+ hatches assembled into the Hyperstargate base.'],
        ['gtceu.recipe.grindless_hyper_assembly_array.hyperstargate_interface', 'Circuit 10: ring blocks, a creative data access hatch stand-in, comm terminals and pattern memory units assembled into an interface.'],
        ['gtceu.recipe.grindless_hyper_assembly_array.horizon_alignment_matrix', 'Circuit 11: cold reference assemblies, plates and waveguides assembled into a horizon alignment matrix (line T12, last step).'],
        ['gtceu.recipe.grindless_hyper_assembly_array.creative_energy', 'Circuit 12: a cloud core and a great store of field hardware, Kerr condensate and superfluid helium-3 assembled into a creative energy source stand-in. It is an ingredient: it cannot be placed.'],
        ['gtceu.recipe.grindless_hyper_assembly_array.creative_chest', 'Circuit 13: the bottomless store core assembled into a creative chest stand-in. It is an ingredient: it cannot be placed.'],
        ['gtceu.recipe.grindless_hyper_assembly_array.creative_tank', 'Circuit 14: the bottomless tank core assembled into a creative tank stand-in. It is an ingredient: it cannot be placed.'],
        ['gtceu.recipe.grindless_hyper_assembly_array.creative_computation_provider', 'Circuit 15: the computation core assembled into a creative computation provider stand-in. It is an ingredient: it cannot be placed.'],
        ['gtceu.recipe.grindless_hyper_assembly_array.creative_data_access_hatch', 'Circuit 16: the computation core and pattern memory units assembled into a creative data access hatch stand-in. It is an ingredient: it cannot be placed.'],
        ['gtceu.recipe.grindless_hyper_assembly_array.creative_energy_cell', 'Circuit 17: a cloud core assembled into a creative energy cell stand-in, a tenth of the energy source\'s cost. It is an ingredient: it cannot be placed.'],
        ['block.grindless.hyperstargate_ring_block', 'Hyperstargate Ring Block'],
        ['block.grindless.hyperstargate_chevron_block', 'Hyperstargate Chevron Block'],
        ['block.grindless.hyperstargate_locked_chevron', 'Hyperstargate Locked Chevron'],
        ['block.grindless.hyperstargate_power_unit', 'Hyperstargate Power Unit'],
        ['block.grindless.horizon_iris', 'Horizon Iris'],
        ['block.grindless.hyperstargate_base', 'Hyperstargate Base'],
        ['item.grindless.hyperstargate_chevron_upgrade', 'Hyperstargate Chevron Upgrade'],
        ['item.grindless.hyperstargate_interface', 'Hyperstargate Interface'],
        ['item.grindless.creative_energy', 'Creative Energy Source (Ingredient)'],
        ['item.grindless.creative_chest', 'Creative Chest (Ingredient)'],
        ['item.grindless.creative_tank', 'Creative Tank (Ingredient)'],
        ['item.grindless.creative_computation_provider', 'Creative Computation Provider (Ingredient)'],
        ['item.grindless.creative_data_access_hatch', 'Creative Data Access Hatch (Ingredient)'],
        ['item.grindless.creative_energy_cell', 'Creative Energy Cell (Ingredient)']
    ]
    ;['en_us', 'es_es'].forEach(function (lang) {
        ClientEvents.lang(lang, function (e) {
            ENTRIES.forEach(function (x) { e.add('grindless', x[0], x[1]) })
        })
    })
})()
