// priority: 7350
// Gregtech Grindless - names and tooltips of the LuV Mega Chemical Complex (startup_scripts/grindless/luv/mega_chemical_complex.js).
//
//   gtceu:mega_chemical_complex   (machine name + 4 tooltip lines, en_us and es_es)
//   gtceu:mega_chemical_complex   (the recipe type name, the second mode)
//
// The first mode runs GTM's large chemical reactor recipes, so gtceu.large_chemical_reactor is GTM's own, already translated.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.mega_chemical_complex', 'Mega Chemical Complex')
    add('gtceu.mega_chemical_complex', 'Mega Chemical Complex')
    add('grindless.machine.mega_chemical_complex.tooltip.0', '§7Runs chemical reactor recipes and its own long chemical lines.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.mega_chemical_complex', 'Complejo Químico Mega')
    add('gtceu.mega_chemical_complex', 'Complejo Químico Mega')
    add('grindless.machine.mega_chemical_complex.tooltip.0', '§7Hace recetas de reactor químico y sus propias cadenas largas.')
})
