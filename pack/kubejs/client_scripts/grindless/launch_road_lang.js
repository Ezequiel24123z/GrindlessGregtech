// priority: 8300
// Gregtech Grindless - names and tooltips of the road to the first rocket (MV -> HV):
//
//   gtceu:engine_test_stand, gtceu:static_fire            (machine name + tooltips, recipe type)
//   gtceu:composite_autoclave, gtceu:composite_curing     (machine name + tooltips, recipe type)
//   grindless:qualified_power_thruster, untested_rocket_motor, ablative_heat_shield_tile, composite_overwrapped_tank
//
// Kept out of pack/kubejs/assets/grindless/lang/*, like the other *_lang.js scripts: Minecraft merges lang entries from every
// namespace/script, so ClientEvents.lang works fine wherever it is declared. Quests are English only; names go in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.engine_test_stand', 'Engine Test Stand')
    add('gtceu.static_fire', 'Static Fire')
    add('grindless.machine.engine_test_stand.tooltip.0', 'A static fire stand: the engine is clamped over a firebrick flame bucket, fed from the run tanks on top and fired. What passes, flies. No other machine qualifies a rocket engine.')
    add('grindless.machine.engine_test_stand.tooltip.1', 'MV: the four power thrusters of one rocket motor fire together on RP-1 and oxygen and come out qualified. HV: an untested rocket motor fires on rocket fuel and becomes a basic rocket motor.')
    add('grindless.machine.engine_test_stand.tooltip.2', 'The exhaust is CO2 and water, one output hatch each: the CO2 can go to a greenhouse or to methanol, the water back to the pumps. The HV fire needs an HV energy hatch or two MV ones.')
    add('grindless.machine.engine_test_stand.tooltip.3', 'Needs 1 or 2 energy hatches, 1 input bus, 1 output bus and 2 output hatches in the base, and 1 or 2 input hatches (fuel and oxidizer) in the run tanks. The trench under the engine stays open on both sides.')

    add('block.gtceu.composite_autoclave', 'Composite Autoclave')
    add('gtceu.composite_curing', 'Composite Curing')
    add('grindless.machine.composite_autoclave.tooltip.0', 'A horizontal pressure vessel: fibre plies and epoxy cure under heat and nitrogen pressure. No small machine holds a part this size at that pressure.')
    add('grindless.machine.composite_autoclave.tooltip.1', 'Glass fibre foils + epoxy: ablative heat shield tiles, the base heat shield of a rocket motor. A stainless steel drum wrapped in para-aramid + epoxy: a composite overwrapped tank, two per basic fuel tank.')
    add('grindless.machine.composite_autoclave.tooltip.2', 'The nitrogen pressurises the vessel and is vented after every cure (it is inert). HV: 1 or 2 HV energy hatches.')
    add('grindless.machine.composite_autoclave.tooltip.3', 'Needs 1 or 2 energy hatches, 1 input bus, 1 output bus and 2 input hatches (epoxy and nitrogen) on the shell. The chamber inside stays empty.')

    add('item.grindless.qualified_power_thruster', 'Qualified Power Thruster')
    add('tooltip.grindless.qualified_power_thruster', 'Passed its static fire on the Engine Test Stand. Four go into an untested rocket motor.')
    add('item.grindless.untested_rocket_motor', 'Untested Rocket Motor')
    add('tooltip.grindless.untested_rocket_motor', 'Not flight-ready. Fire it on the Engine Test Stand with rocket fuel to get a basic rocket motor: no rocket flies an untested engine.')
    add('item.grindless.ablative_heat_shield_tile', 'Ablative Heat Shield Tile')
    add('tooltip.grindless.ablative_heat_shield_tile', 'Glass fibre and epoxy cured in the Composite Autoclave. It chars away slowly and keeps the heat out: the base heat shield of a rocket motor.')
    add('item.grindless.composite_overwrapped_tank', 'Composite Overwrapped Tank')
    add('tooltip.grindless.composite_overwrapped_tank', 'A stainless steel liner wrapped in para-aramid and epoxy, cured in the Composite Autoclave. Two make a basic fuel tank.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.engine_test_stand', 'Banco de pruebas de motores')
    add('gtceu.static_fire', 'Encendido estático')
    add('grindless.machine.engine_test_stand.tooltip.0', 'Un banco de encendido estático: el motor va sujeto sobre un foso de ladrillo refractario, se alimenta de los tanques de arriba y se enciende. Lo que pasa la prueba, vuela. Ninguna otra máquina califica un motor de cohete.')
    add('grindless.machine.engine_test_stand.tooltip.1', 'MV: los cuatro propulsores de potencia de un motor de cohete se encienden juntos con RP-1 y oxígeno y salen calificados. HV: un motor de cohete sin probar se enciende con combustible de cohete y pasa a ser un motor de cohete básico.')
    add('grindless.machine.engine_test_stand.tooltip.2', 'El escape es CO2 y agua, cada uno por su escotilla de salida: el CO2 puede ir a un invernadero o al metanol y el agua, de vuelta a las bombas. El encendido HV pide una escotilla de energía HV o dos MV.')
    add('grindless.machine.engine_test_stand.tooltip.3', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada, 1 bus de salida y 2 escotillas de salida en la base, y 1 o 2 escotillas de entrada (combustible y oxidante) en los tanques. El foso bajo el motor queda abierto por los dos lados.')

    add('block.gtceu.composite_autoclave', 'Autoclave de composites')
    add('gtceu.composite_curing', 'Curado de composites')
    add('grindless.machine.composite_autoclave.tooltip.0', 'Un recipiente a presión tumbado: las capas de fibra y el epoxi curan con calor y presión de nitrógeno. Ninguna máquina pequeña aguanta una pieza de este tamaño a esa presión.')
    add('grindless.machine.composite_autoclave.tooltip.1', 'Láminas de fibra de vidrio + epoxi: losetas de escudo térmico ablativo, el escudo de la base de un motor de cohete. Un barril de acero inoxidable envuelto en para-aramida + epoxi: un depósito envuelto en composite, dos por depósito de combustible básico.')
    add('grindless.machine.composite_autoclave.tooltip.2', 'El nitrógeno presuriza el recipiente y se ventea después de cada curado (es inerte). HV: 1 o 2 escotillas de energía HV.')
    add('grindless.machine.composite_autoclave.tooltip.3', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada, 1 bus de salida y 2 escotillas de entrada (epoxi y nitrógeno) en la carcasa. La cámara de dentro queda vacía.')

    add('item.grindless.qualified_power_thruster', 'Propulsor de potencia calificado')
    add('tooltip.grindless.qualified_power_thruster', 'Pasó su encendido estático en el banco de pruebas de motores. Cuatro van a un motor de cohete sin probar.')
    add('item.grindless.untested_rocket_motor', 'Motor de cohete sin probar')
    add('tooltip.grindless.untested_rocket_motor', 'Todavía no vuela. Enciéndelo en el banco de pruebas de motores con combustible de cohete y saldrá un motor de cohete básico: ningún cohete vuela con un motor sin probar.')
    add('item.grindless.ablative_heat_shield_tile', 'Loseta de escudo térmico ablativo')
    add('tooltip.grindless.ablative_heat_shield_tile', 'Fibra de vidrio y epoxi curados en el autoclave de composites. Se carboniza poco a poco y no deja pasar el calor: el escudo de la base de un motor de cohete.')
    add('item.grindless.composite_overwrapped_tank', 'Depósito envuelto en composite')
    add('tooltip.grindless.composite_overwrapped_tank', 'Un forro de acero inoxidable envuelto en para-aramida y epoxi, curado en el autoclave de composites. Dos hacen un depósito de combustible básico.')
})
