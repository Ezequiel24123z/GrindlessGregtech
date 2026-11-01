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

    add('item.grindless.alkali_sulfate_dust', 'Alkali Sulfate Dust')
    add('tooltip.grindless.alkali_sulfate_dust.0', 'Inert sodium and potassium sulfate.')
    add('tooltip.grindless.alkali_sulfate_dust.1', 'The kiln\'s harmless leftover: nothing uses it, so void it.')
})

