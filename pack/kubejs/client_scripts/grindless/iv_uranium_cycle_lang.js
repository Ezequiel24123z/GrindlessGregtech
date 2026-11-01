// priority: 8500
// Gregtech Grindless - names and tooltips of IV's uranium cycle (startup_scripts/grindless/iv/uranium_cycle.js): the In-Situ Leach Field
// and the Fuel Fabrication Plant, their recipe types, why the field refuses voiding and why it does not start outside the End.
//
//   gtceu:isr_wellfield / gtceu:in_situ_leaching                   (machine name + tooltips, recipe type name)
//   gtceu:fuel_fabrication_plant / gtceu:fuel_fabrication          (machine name + tooltips, recipe type name)
//   grindless.machine.isr_wellfield.no_voiding / .not_end          (why a run does not start)
//   planet.grindless.end                                           (the place name in the shared site line)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.isr_wellfield', 'In-Situ Leach Field')
    add('gtceu.in_situ_leaching', 'In-Situ Leaching')
    add('block.gtceu.fuel_fabrication_plant', 'Fuel Fabrication Plant')
    add('gtceu.fuel_fabrication', 'Fuel Fabrication')

    add('grindless.machine.isr_wellfield.tooltip.0', '§7Dissolves the End\'s uranium in place with injection wells.')

    add('grindless.machine.fuel_fabrication_plant.tooltip.0', '§7Makes uranium fuel: pellets, cladding tubes and assemblies.')
    add('planet.grindless.end', 'the End')

    add('grindless.machine.isr_wellfield.no_voiding', 'The field keeps its radioactive waste: it leaves through the output bus. Turn item voiding off')
    add('grindless.machine.isr_wellfield.not_end', 'Nothing to leach here: the field only works in the End, on its pitchblende vein')
})

