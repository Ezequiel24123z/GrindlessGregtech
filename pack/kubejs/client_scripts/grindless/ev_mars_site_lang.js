// priority: 10400
// Gregtech Grindless - names and tooltips of the EV Atmosphere Processor (the Mars base).
//
//   gtceu:atmosphere_processor           (machine name + tooltips)
//   gtceu:atmosphere_processing          (recipe type name)
//
// Same approach as syngas_lang.js: Minecraft merges lang entries from every namespace/script, so ClientEvents.lang works fine
// regardless of where it is declared.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.atmosphere_processor', 'Atmosphere Processor')
    add('gtceu.atmosphere_processing', 'Atmosphere Processing')

    add('grindless.machine.atmosphere_processor.tooltip.0', '§7Turns Martian air and water into oxygen and methane.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.atmosphere_processor', 'Procesador atmosférico')
    add('gtceu.atmosphere_processing', 'Procesado atmosférico')

    add('grindless.machine.atmosphere_processor.tooltip.0', '§7Convierte el aire y el agua de Marte en oxígeno y metano.')
})
