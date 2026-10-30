// priority: 3275
// Gregtech Grindless - names and tooltips of the UIV Neutronium Compression Hall (startup_scripts/grindless/uiv/compression_hall.js), and the text of
// its EMI info card (assets/emi/recipe/additions/grindless/uiv_compression_hall_info.json).
//
//   gtceu:neutronium_compression_hall   (machine name + 4 tooltip lines + the info page, en_us and es_es)
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.neutronium_compression_hall', 'Neutronium Compression Hall')
    add('grindless.machine.neutronium_compression_hall.tooltip.0', '\u00a77The press of the mega family: many compressions at once.')
    add('grindless.machine.neutronium_compression_hall.tooltip.1', 'Needs neutronium pellets in an input bus.')
    add('emi.grindless.info.neutronium_compression_hall.0', 'The Neutronium Compression Hall runs compressor and implosion compressor recipes. Keep neutronium pellets in an input bus: 4^pellets copies at once (at most 256, times the parallel hatch), bounded by the energy hatches. Implosion recipes still burn their explosive, once per copy. The pellets are durable tooling and are never used up.')
    add('emi.grindless.info.neutronium_compression_hall.1', 'Needs, in a 13 x 10 x 11 press hall of neutron star site casings: 1 maintenance hatch, 1 or 2 energy hatches, 1 or 2 input and 1 or 2 output buses, 1 parallel hatch (optional). Each copy pays its full EU/t.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.neutronium_compression_hall', 'Sala de Compresión de Neutronio')
    add('grindless.machine.neutronium_compression_hall.tooltip.0', '\u00a77La prensa de la familia mega: muchas compresiones a la vez.')
    add('grindless.machine.neutronium_compression_hall.tooltip.1', 'Necesita gránulos de neutronio en un bus de entrada.')
    add('emi.grindless.info.neutronium_compression_hall.1', 'Necesita, en una sala de prensa de 13 x 10 x 11 de carcasas de sitio de estrella de neutrones: 1 escotilla de mantenimiento, 1 o 2 escotillas de energía, 1 o 2 buses de entrada y 1 o 2 de salida, 1 escotilla de paralelos (opcional). Cada copia paga su EU/t completo.')
    add('emi.grindless.info.neutronium_compression_hall.0', 'La Sala de Compresión de Neutronio ejecuta recetas del compresor y del compresor de implosión. Guarda gránulos de neutronio en un bus de entrada: 4^gránulos copias a la vez (como máximo 256, por la escotilla de paralelos), limitadas por las escotillas de energía. Las recetas de implosión siguen gastando su explosivo, uno por copia. Los gránulos son herramienta duradera y nunca se gastan.')
})
