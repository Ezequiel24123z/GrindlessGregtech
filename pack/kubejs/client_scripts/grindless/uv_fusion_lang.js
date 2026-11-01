// priority: 2800
// Gregtech Grindless - names and tooltips of UV's Laser Fusion Chamber and the spent laser module (startup_scripts/grindless/uv/fusion.js):
//
//   gtceu:laser_fusion_chamber   machine name + tooltips + no-voiding refusal
//   gtceu:laser_fusion           recipe type name
//   grindless:spent_laser_module
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.laser_fusion_chamber', 'Laser Fusion Chamber')
    add('gtceu.laser_fusion', 'Laser Fusion')

    add('grindless.machine.laser_fusion_chamber.tooltip.0', '§7Laser fusion of proton-boron-11 and D-He-3 capsules.')
    add('grindless.machine.laser_fusion_chamber.no_voiding', 'The helium and hydrogen must leave through their hatches: turn fluid voiding off')

    add('item.grindless.spent_laser_module', 'Spent Laser Module')
    add('tooltip.grindless.spent_laser_module.0', 'A fibre laser module worn out by the chamber\'s pulses.')
    add('tooltip.grindless.spent_laser_module.1', 'Refurbished at the fibre draw tower.')
})

