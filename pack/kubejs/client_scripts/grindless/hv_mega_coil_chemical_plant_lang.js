// priority: 9650
// Gregtech Grindless - names and tooltips of the HV Coil Chemical Plant (startup_scripts/grindless/hv/mega_coil_chemical_plant.js).
//
//   gtceu:coil_chemical_plant   (machine name + 3 tooltip lines, en_us)
//
// It runs GTM's large chemical reactor recipes, so the recipe type name (gtceu.large_chemical_reactor) is GTM's own; it is not renamed here.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.coil_chemical_plant', 'Coil Chemical Plant')
    add('grindless.machine.coil_chemical_plant.tooltip.0', '§7A large chemical reactor whose copies grow with its heating coil.')
    add('grindless.machine.coil_chemical_plant.tooltip.1', 'Copies: 2^(coil temperature / 900 K), up to 64.')
})

