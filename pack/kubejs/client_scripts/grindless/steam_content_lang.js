// priority: 5600
// Gregtech Grindless - names and tooltips of the Steam Age additions of the journey plan (docs/journey.md):
//
//   gtceu:steam_blast_furnace, gtceu:coking_battery     (machine names + tooltips)
//   gtceu:steelmaking, gtceu:coking                     (recipe type names)
//   #grindless:blast_furnace_fluxes                     (tag name, shown by EMI)
//
// Kept out of pack/kubejs/assets/grindless/lang/* (owned by another agent): Minecraft merges lang entries from every
// script, so ClientEvents.lang works wherever it is declared (same approach as lv_multis_lang.js).
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.steam_blast_furnace', 'Steam Blast Furnace')
    add('block.gtceu.coking_battery', 'By-product Coke Battery')
    add('gtceu.steelmaking', 'Steelmaking')
    add('gtceu.coking', 'Coking')
    add('tag.item.grindless.blast_furnace_fluxes', 'Blast Furnace Fluxes')

    add('grindless.machine.steam_blast_furnace.tooltip.0', '§7Turns iron ore straight into steel, four batches at a time.')

    add('grindless.machine.coking_battery.tooltip.0', '§7Cokes coal like the coke oven, but keeps the gas.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.steam_blast_furnace', 'Alto horno de vapor')
    add('block.gtceu.coking_battery', 'Batería de coque con subproductos')
    add('gtceu.steelmaking', 'Fabricación de acero')
    add('gtceu.coking', 'Coquización')
    add('tag.item.grindless.blast_furnace_fluxes', 'Fundentes de alto horno')

    add('grindless.machine.steam_blast_furnace.tooltip.0', '§7Convierte la mena de hierro directamente en acero, cuatro cargas a la vez.')

    add('grindless.machine.coking_battery.tooltip.0', '§7Coquiza el carbón como el horno de coque, pero se queda el gas.')
})
