// priority: 3275
// Gregtech Grindless - names and tooltips of the UIV Neutronium Compression Hall (startup_scripts/grindless/uiv/compression_hall.js), and the text of
// its EMI info card (assets/emi/recipe/additions/grindless/uiv_compression_hall_info.json).
//
//   gtceu:neutronium_compression_hall   (machine name + 4 tooltip lines + the info page, en_us)
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.neutronium_compression_hall', 'Neutronium Compression Hall')
    add('grindless.machine.neutronium_compression_hall.tooltip.0', '\u00a77The press of the mega family: many compressions at once.')
    add('grindless.machine.neutronium_compression_hall.tooltip.1', 'Needs neutronium pellets in an input bus.')
    add('emi.grindless.info.neutronium_compression_hall.0', 'The Neutronium Compression Hall runs compressor and implosion compressor recipes. Keep neutronium pellets in an input bus: 4^pellets copies at once (at most 256, times the parallel hatch), bounded by the energy hatches. Implosion recipes still burn their explosive, once per copy. The pellets are durable tooling and are never used up.')
    add('emi.grindless.info.neutronium_compression_hall.1', 'Needs, in a 19 x 13 x 25 press hall of neutron star site casings: 1 maintenance hatch, 1 or 2 energy hatches, 1 or 2 input and 1 or 2 output buses, 1 parallel hatch (optional). Each copy pays its full EU/t.')
})

