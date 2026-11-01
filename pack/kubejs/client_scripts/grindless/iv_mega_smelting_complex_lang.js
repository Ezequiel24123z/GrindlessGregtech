// priority: 8950
// Gregtech Grindless - names and tooltips of the IV Smelting Complex (startup_scripts/grindless/iv/mega_smelting_complex.js).
//
//   gtceu:smelting_complex / gtceu.smelting_complex   (machine name + 3 tooltip lines, recipe type name; en_us)
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.smelting_complex', 'Smelting Complex')
    add('gtceu.smelting_complex', 'Smelting Complex')
    add('grindless.machine.smelting_complex.tooltip.0', '§7Blast furnace and vacuum freezer in one hall.')
})

