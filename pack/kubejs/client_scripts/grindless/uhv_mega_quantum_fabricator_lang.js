// priority: 4525
// Gregtech Grindless - names and tooltips of the UHV Quantum Fabricator and its field ring casing (startup_scripts/grindless/uhv/mega_quantum_fabricator.js).
//
//   gtceu:quantum_fabricator      (machine name + 4 tooltip lines, en_us and es_es)
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

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.quantum_fabricator', 'Fabricador Cuántico')
    add('block.grindless.field_ring_casing', 'Carcasa de Anillo de Campo')
    add('tooltip.grindless.field_ring_casing.0', 'Anillo generador de campo del Fabricador Cuántico.')
    add('emi.grindless.info.field_ring_casing.0', 'El bloque de estructura del Fabricador Cuántico: el anillo de generadores de campo alrededor de sus paredes. Salen dos del ensamblador con un generador de campo UV, una carcasa de máquina UHV y una placa de neutronio (UHV). Solo lo usa el fabricador.')
    add('grindless.machine.quantum_fabricator.tooltip.0', '§7Ejecuta cinco tipos de receta de máquinas pequeñas en hasta 1024 copias.')
})
