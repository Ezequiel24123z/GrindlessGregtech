// priority: 950
// Gregtech Grindless - names and tooltips of the ZPM Assembly Hall (startup_scripts/grindless/zpm/mega_assembly_hall.js).
//
//   gtceu:assembly_hall   (machine name + 4 tooltip lines, en_us and es_es)
//
// The mode names in the machine mode tab are GTM's own recipe type names (gtceu.assembler, gtceu.circuit_assembler), already translated by GTM.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.assembly_hall', 'Assembly Hall')
    add('grindless.machine.assembly_hall.tooltip.0', '§7Runs assemblers and circuit assemblers, up to 64 at once.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.assembly_hall', 'Sala de Ensamblaje')
    add('grindless.machine.assembly_hall.tooltip.0', '§7Ejecuta ensambladores y ensambladores de circuitos, hasta 64 a la vez.')
})
