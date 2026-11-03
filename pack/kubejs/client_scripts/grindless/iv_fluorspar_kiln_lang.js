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
    add('gtceu.recipe.grindless_fluorspar_kiln.hf_from_alkali_fluoride', 'One charge: 4 alkali fluoride and 1000 mB of sulfuric acid give 7 alkali sulfate and 2000 mB of hydrofluoric acid; 64 ticks, no overclock')
    add('gtceu.recipe.grindless_fluorspar_kiln.calcium_fluoride_return', 'One charge: 1 calcium dust takes 2000 mB of hydrofluoric acid back into 3 fluorite and 2000 mB of hydrogen; 64 ticks, no overclock')
    add('gtceu.recipe.grindless_fluorspar_kiln.niobium_oxyfluoride_from_pyrochlore', 'One charge: 11 pyrochlore digested in 9000 mB of hydrofluoric acid give 2 niobium oxyfluoride, 6 fluorite back to the charge and 4500 mB of water; 128 ticks, no overclock')
    add('gtceu.recipe.grindless_fluorspar_kiln.five_n_magnesia', 'One charge: 2 magnesium hydroxide fired under 1000 mB of argon give 2 5N magnesia and 2000 mB of steam; 64 ticks, no overclock')
    add('gtceu.recipe.grindless_fluorspar_kiln.dysco3_calcine', 'One charge: 2 DyScO3 charge calcined in 1000 mB of oxygen give 2 oxide and 1000 mB of steam; 64 ticks, no overclock')
    add('gtceu.recipe.grindless_fluorspar_kiln.la_bfo_calcine', 'One charge: 2 La-BFO charge calcined in 1000 mB of oxygen give 2 oxide and 1000 mB of steam; 64 ticks, no overclock')
    add('gtceu.recipe.grindless_fluorspar_kiln.ggg_calcine', 'One charge: 2 GGG charge calcined in 1000 mB of oxygen give 2 oxide and 1000 mB of steam; 64 ticks, no overclock')
    add('gtceu.recipe.grindless_fluorspar_kiln.srruo3_calcine', 'One charge: 2 SrRuO3 charge calcined in 1000 mB of oxygen give 2 SrRuO3 and 1000 mB of carbon dioxide; 64 ticks, no overclock')
    add('gtceu.recipe.grindless_fluorspar_kiln.fluorine_from_hf', 'One charge: 1 alkali fluoride (returned) and 2000 mB of hydrofluoric acid give 1000 mB of fluorine; the hydrogen is flared; 64 ticks')
    add('gtceu.recipe.grindless_fluorspar_kiln.be_fluoride_from_beryllium', 'One charge: 1 beryllium and 2000 mB of hydrofluoric acid give 3 beryllium fluoride and 2000 mB of hydrogen; 64 ticks, no overclock')
    add('gtceu.recipe.grindless_fluorspar_kiln.be_fluoride_from_window_scrap', 'One charge: 1 beryllium window scrap and 2000 mB of hydrofluoric acid give 3 beryllium fluoride and 2000 mB of hydrogen; 64 ticks')
    add('gtceu.recipe.grindless_fluorspar_kiln.barium_fluoride', 'One charge: 1 barium and 2000 mB of hydrofluoric acid give 3 barium fluoride and 2000 mB of hydrogen; 64 ticks, no overclock')
    add('gtceu.recipe.grindless_fluorspar_kiln.lanthanum_fluoride', 'One charge: 5 lanthanum oxide and 6000 mB of hydrofluoric acid give 8 lanthanum fluoride and 3000 mB of water; 64 ticks, no overclock')
    add('gtceu.recipe.grindless_fluorspar_kiln.aluminium_fluoride', 'One charge: 5 sapphire and 6000 mB of hydrofluoric acid give 8 aluminium fluoride and 3000 mB of water; 64 ticks, no overclock')
    add('gtceu.recipe.grindless_fluorspar_kiln.sodium_fluoride', 'One charge: 3 sodium hydroxide and 1000 mB of hydrofluoric acid give 2 sodium fluoride and 1000 mB of water; 64 ticks, no overclock')

    add('grindless.machine.fluorspar_kiln.no_voiding', 'The scrubber keeps all the hydrofluoric acid: it leaves through the output hatches. Turn fluid voiding off')

    add('item.grindless.alkali_sulfate_dust', 'Alkali Sulfate Dust')
    add('tooltip.grindless.alkali_sulfate_dust.0', 'Inert sodium and potassium sulfate.')
    add('tooltip.grindless.alkali_sulfate_dust.1', 'The kiln\'s harmless leftover: nothing uses it, so void it.')
})
