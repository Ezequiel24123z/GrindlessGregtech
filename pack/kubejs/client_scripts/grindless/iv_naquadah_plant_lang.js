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

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.naquadah_plant', 'Planta de naquadah')
    add('gtceu.naquadah_refining', 'Refinado de naquadah')

    add('grindless.machine.naquadah_plant.tooltip.0', '§7Toda la cadena del naquadah en una sola planta.')
    add('grindless.machine.naquadah_plant.no_voiding', 'Los modos 2 y 3 guardan todo lo que producen: la solución de naquadria debe quedar contenida. Desactiva el desecho de salidas.')

    add('gtceu.recipe.grindless_naquadah_plant.naquadah', 'Modo 1: la línea del naquadah de GT-- en una pasada; una fuente de Pu-Be mantiene la ventana de neutrones')
    add('gtceu.recipe.grindless_naquadah_plant.enriched_naquadah', 'Modo 2: la línea del naquadah enriquecido de GT-- con recuperación total; el xenón, el oro, el antimonio y el catalizador de Pd/C se quedan dentro')
    add('gtceu.recipe.grindless_naquadah_plant.spent_naquadah', 'Modo 2: barras de naquadah gastadas reenriquecidas por la separación del naquadah de GT--, con recuperación total')
    add('gtceu.recipe.grindless_naquadah_plant.enriched_solution', 'Modo 3: solución de naquadah enriquecido de la refinería de naquadria convertida en polvo de naquadah enriquecido, devolviendo el ácido sulfúrico')
})
