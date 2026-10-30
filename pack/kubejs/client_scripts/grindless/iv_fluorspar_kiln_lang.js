// priority: 9400
// Gregtech Grindless - names and tooltips of IV's Fluorspar Kiln (startup_scripts/grindless/iv/fluorspar_kiln.js), its recipe type, the EMI
// line of its recipe and the reason it shows when set to void fluids.
//
//   gtceu:fluorspar_kiln / gtceu.fluorspar_digestion           (machine name + tooltips, recipe type name)
//   gtceu.recipe.grindless_fluorspar_kiln.<recipe name>        (EMI line of the recipe: one charge)
//   grindless.machine.fluorspar_kiln.no_voiding                (why a run does not start)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.fluorspar_kiln', 'Fluorspar Kiln')
    add('gtceu.fluorspar_digestion', 'Fluorspar Digestion')

    add('grindless.machine.fluorspar_kiln.tooltip.0', '§7A rotary kiln that digests fluorspar into hydrofluoric acid.')

    add('gtceu.recipe.grindless_fluorspar_kiln.hydrofluoric_acid_from_fluorite', 'One charge: the kiln runs up to 256 at once, 64 ticks each, with no overclock')

    add('grindless.machine.fluorspar_kiln.no_voiding', 'The scrubber keeps all the hydrofluoric acid: it leaves through the output hatches. Turn fluid voiding off')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.fluorspar_kiln', 'Horno de fluorita')
    add('gtceu.fluorspar_digestion', 'Digestión de fluorita')

    add('grindless.machine.fluorspar_kiln.tooltip.0', '§7Horno rotatorio que digiere fluorita en ácido fluorhídrico.')

    add('gtceu.recipe.grindless_fluorspar_kiln.hydrofluoric_acid_from_fluorite', 'Una carga: el horno hace hasta 256 a la vez, 64 ticks cada una, sin overclock')

    add('grindless.machine.fluorspar_kiln.no_voiding', 'El lavador guarda todo el ácido fluorhídrico: sale por las escotillas de salida. Desactiva el vaciado de fluidos')
})
