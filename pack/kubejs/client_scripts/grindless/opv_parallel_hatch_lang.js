// priority: 5716
// Gregtech Grindless - text of the OpV parallel hatch (package OpV-M1; startup_scripts/grindless/lib/parallel_hatch.js and
// server_scripts/grindless/opv/parallel.js).
//
//   block.gtceu.opv_parallel_hatch                 its name
//   grindless.machine.opv_parallel_hatch.tooltip   its tooltip line
//   emi.grindless.info.opv_parallel_hatch.0        its EMI info page
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.opv_parallel_hatch', 'Overpowered Parallel Control Hatch')
    add('grindless.machine.opv_parallel_hatch.tooltip', 'Allows up to §f262144§7 recipes to be processed at once. Each copy costs the recipe\'s own EU/t.')
    add('emi.grindless.info.opv_parallel_hatch.0', 'The Overpowered Parallel Control Hatch lets a machine that takes parallel hatches run up to 262144 copies of a recipe at once, each at its own EU/t. It is made in the Assembly Line from the Extreme hatch, an OpV hull, field generators, robot arms, sensors, OpV circuits and tetron arrays, cooled with superfluid helium-3.')
})

