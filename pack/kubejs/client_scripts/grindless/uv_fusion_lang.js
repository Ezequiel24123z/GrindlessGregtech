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

    add('grindless.machine.laser_fusion_chamber.tooltip.0', 'Proton-boron-11 fusion: three alpha particles and almost no neutrons. One capsule per run pays 2,621,440 EU/t (5 A UV). Programmed circuit 1: 1 p-B11 capsule, 400 ticks, 3,000 mB helium. Circuit 2: 1 D-He-3 capsule, 600 ticks, 1,000 mB helium + 1,000 mB hydrogen.')
    add('grindless.machine.laser_fusion_chamber.tooltip.1', 'Each run has a 2% chance to wear out 1 fibre laser module into a spent laser module. The helium goes to the helium refrigerator.')
    add('grindless.machine.laser_fusion_chamber.tooltip.2', 'A 13x13x13 chamber of UV casing with a ring of 32 laser module blocks round its waist. In the floor: 1-8 dynamo hatches, 1 input bus (the capsule injector), 1-2 output hatches, 1 output bus.')
    add('grindless.machine.laser_fusion_chamber.no_voiding', 'The helium and hydrogen must leave through their hatches: turn fluid voiding off')

    add('item.grindless.spent_laser_module', 'Spent Laser Module')
    add('tooltip.grindless.spent_laser_module.0', 'A fibre laser module worn out by the chamber\'s pulses.')
    add('tooltip.grindless.spent_laser_module.1', 'Refurbished at the fibre draw tower.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.laser_fusion_chamber', 'Camara de Fusion Laser')
    add('gtceu.laser_fusion', 'Fusion laser')

    add('grindless.machine.laser_fusion_chamber.tooltip.0', 'Fusion proton-boro-11: tres particulas alfa y casi ningun neutron. Una capsula por ejecucion paga 2.621.440 EU/t (5 A UV). Circuito programado 1: 1 capsula p-B11, 400 ticks, 3.000 mB de helio. Circuito 2: 1 capsula D-He-3, 600 ticks, 1.000 mB de helio + 1.000 mB de hidrogeno.')
    add('grindless.machine.laser_fusion_chamber.tooltip.1', 'Cada ejecucion tiene un 2% de probabilidad de desgastar 1 modulo laser de fibra y dejarlo en un modulo laser gastado. El helio va al refrigerador de helio.')
    add('grindless.machine.laser_fusion_chamber.tooltip.2', 'Una camara de 13x13x13 de carcasa UV con un anillo de 32 bloques de modulo laser en su cintura. En el suelo: 1-8 hatches de dinamo, 1 bus de entrada (el inyector de capsulas), 1-2 hatches de salida, 1 bus de salida.')
    add('grindless.machine.laser_fusion_chamber.no_voiding', 'El helio y el hidrogeno deben salir por sus hatches: desactiva el vaciado de fluidos')

    add('item.grindless.spent_laser_module', 'Modulo laser gastado')
    add('tooltip.grindless.spent_laser_module.0', 'Un modulo laser de fibra desgastado por los pulsos de la camara.')
    add('tooltip.grindless.spent_laser_module.1', 'Se reacondiciona en la torre de estirado de fibra.')
})
