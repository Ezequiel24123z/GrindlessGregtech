// priority: 4525
// Gregtech Grindless - names and tooltips of the UHV Quantum Fabricator and its field ring casing (startup_scripts/grindless/uhv/mega_quantum_fabricator.js).
//
//   gtceu:quantum_fabricator      (machine name + 4 tooltip lines, en_us)
//   grindless:field_ring_casing   (block name + 1 tooltip line)
//
// The mode names in the machine mode tab are GTM's own recipe type names, already translated by GTM.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.quantum_fabricator', 'Quantum Fabricator')
    add('block.grindless.field_ring_casing', 'Field Ring Casing')
    add('tooltip.grindless.field_ring_casing.0', 'Field generator ring of the Quantum Fabricator.')
    add('emi.grindless.info.field_ring_casing.0', 'The Quantum Fabricator\'s structure block: the ring of field generators round its walls. Two come from the assembler with a UV field generator, a UHV machine casing and a neutronium plate (UHV). Only the fabricator uses it.')
    add('grindless.machine.quantum_fabricator.tooltip.0', '§7Runs five small-machine recipe types in up to 1,024 parallel copies.')
})

