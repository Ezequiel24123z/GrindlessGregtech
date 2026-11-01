// priority: 5200
// Gregtech Grindless - names and tooltips of the HV Syngas and Shift Plant.
//
//   gtceu:syngas_plant            (machine name + tooltips)
//   gtceu:syngas                  (recipe type name)
//   grindless:shift_catalyst      (its catalyst)
//   #grindless:gasifier_feed      (the item tag of its feed, as EMI names it)
//
// Same approach as hv_refinery_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.syngas_plant', 'Syngas and Shift Plant')
    add('gtceu.syngas', 'Syngas and Shift')

    add('grindless.machine.syngas_plant.tooltip.0', '§7Gasifier, shift reactors and CO2 absorber in one machine.')
    add('grindless.machine.syngas_plant.tooltip.1', 'Modes 2 to 4 need a Shift Catalyst in the input bus.')

    add('item.grindless.shift_catalyst', 'Shift Catalyst')
    add('tooltip.grindless.shift_catalyst', 'Iron-chromium oxide (magnetite and chromium). Goes in the input bus of the Syngas and Shift Plant; used up in about 0.05% of the runs that shift.')

    add('tag.item.grindless.gasifier_feed', 'Gasifier Feed')
})

