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
    add('item.grindless.iron_sinter', 'Iron Sinter')
    add('item.grindless.pig_iron', 'Pig Iron')
    add('tooltip.grindless.iron_sinter', 'Purified iron ore fused with coke dust. Smelt it with circuit 1 in the Steam Blast Furnace.')
    add('tooltip.grindless.pig_iron', 'Brittle blast furnace iron. Blow it into steel with circuit 2 in the Steam Blast Furnace.')

    add('grindless.machine.steam_blast_furnace.tooltip.0', '§7Circuit 1 smelts iron sinter into pig iron, circuit 2 blows pig iron into steel. Four batches at a time.')

    add('grindless.machine.coking_battery.tooltip.0', '§7Cokes coal like the coke oven, but keeps the gas.')
})

