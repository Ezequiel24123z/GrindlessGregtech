// priority: 8800
// Gregtech Grindless - names and tooltips of IV's Naquadah Plant (startup_scripts/grindless/iv/naquadah_plant.js), its recipe type and
// the EMI line of each of its recipes.
//
//   gtceu:naquadah_plant / gtceu.naquadah_refining          (machine name + tooltips, recipe type name)
//   gtceu.recipe.grindless_naquadah_plant.<recipe name>     (EMI line of each recipe: what the mode does)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.naquadah_plant', 'Naquadah Plant')
    add('gtceu.naquadah_refining', 'Naquadah Refining')

    add('grindless.machine.naquadah_plant.tooltip.0', '§7The whole naquadah line in one plant.')
    add('grindless.machine.naquadah_plant.no_voiding', 'Modes 2 and 3 keep everything they make: the naquadria solution must be contained. Turn output voiding off.')

    add('gtceu.recipe.grindless_naquadah_plant.naquadah', 'Mode 1: GT--\'s naquadah line in one pass; a Pu-Be source holds the neutron window')
    add('gtceu.recipe.grindless_naquadah_plant.enriched_naquadah', 'Mode 2: GT--\'s enriched naquadah line with full recovery; xenon, gold, antimony and the Pd/C catalyst stay inside')
    add('gtceu.recipe.grindless_naquadah_plant.spent_naquadah', 'Mode 2: spent naquadah rods re-enriched through GT--\'s naquadah separation, with full recovery')
    add('gtceu.recipe.grindless_naquadah_plant.enriched_solution', 'Mode 3: enriched naquadah solution from the naquadria refinery turned into enriched naquadah dust, with the sulfuric acid sent back')
})

