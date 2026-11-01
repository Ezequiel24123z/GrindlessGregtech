// priority: 950
// Gregtech Grindless - names and tooltips of the ZPM Assembly Hall (startup_scripts/grindless/zpm/mega_assembly_hall.js).
//
//   gtceu:assembly_hall   (machine name + 4 tooltip lines, en_us)
//
// The mode names in the machine mode tab are GTM's own recipe type names (gtceu.assembler, gtceu.circuit_assembler), already translated by GTM.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.assembly_hall', 'Assembly Hall')
    add('grindless.machine.assembly_hall.tooltip.0', '§7Runs assemblers and circuit assemblers, up to 64 at once.')
})

