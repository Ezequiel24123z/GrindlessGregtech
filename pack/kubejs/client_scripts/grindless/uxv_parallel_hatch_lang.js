// priority: 1539
// Gregtech Grindless - text of the UXV parallel hatch (package UXV-M1; startup_scripts/grindless/lib/parallel_hatch.js and
// server_scripts/grindless/uxv/parallel_hatch.js).
//
//   block.gtceu.uxv_parallel_hatch                 its name
//   grindless.machine.uxv_parallel_hatch.tooltip   its tooltip line
//   emi.grindless.info.uxv_parallel_hatch.0        its EMI info page
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.uxv_parallel_hatch', 'Extreme Parallel Control Hatch')
    add('grindless.machine.uxv_parallel_hatch.tooltip', 'Allows up to §f65536§7 recipes to be processed at once. Each copy costs the recipe\'s own EU/t.')
    add('emi.grindless.info.uxv_parallel_hatch.0', 'The Extreme Parallel Control Hatch lets a machine that takes parallel hatches run up to 65536 copies of a recipe at once, each at its own EU/t. It is made in the Assembly Line from the Insane hatch, a UXV hull, four spintronic mainframes, a field generator and an emitter.')
})

