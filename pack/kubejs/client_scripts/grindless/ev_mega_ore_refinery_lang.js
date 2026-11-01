// priority: 10350
// Gregtech Grindless - names and tooltips of the EV Ore Refinery (startup_scripts/grindless/ev/mega_ore_refinery.js).
//
//   gtceu:ore_refinery / gtceu.ore_refinery   (machine name + 3 tooltip lines, recipe type name; en_us)
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.ore_refinery', 'Ore Refinery')
    add('gtceu.ore_refinery', 'Ore Refinery')
    add('grindless.machine.ore_refinery.tooltip.0', '§7Takes raw ore through the whole ore line in one pass.')
})

