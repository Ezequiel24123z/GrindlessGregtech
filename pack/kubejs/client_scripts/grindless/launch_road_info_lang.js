// priority: 8350
// Gregtech Grindless - EMI information pages of the launch road multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in launch_road_lang.js; every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.composite_autoclave.0', "The Composite Autoclave cures fibre plies and epoxy under heat and nitrogen pressure. Glass fibre foils and epoxy make ablative heat shield tiles. A stainless steel drum wrapped in para-aramid and epoxy makes a composite overwrapped tank.")
    add('emi.grindless.info.composite_autoclave.1', "It needs epoxy and nitrogen in its two input hatches; the nitrogen is vented after every cure. HV: 1 or 2 HV energy hatches. The tiles go into rocket motors, two tanks make a basic fuel tank.")
    add('emi.grindless.info.composite_autoclave.2', 'A horizontal pressure vessel: fibre plies and epoxy cure under heat and nitrogen pressure. No small machine holds a part this size at that pressure.')
    add('emi.grindless.info.composite_autoclave.3', 'Glass fibre foils + epoxy: ablative heat shield tiles, the base heat shield of a rocket motor. A stainless steel drum wrapped in para-aramid + epoxy: a composite overwrapped tank, two per basic fuel tank.')
    add('emi.grindless.info.composite_autoclave.4', 'The nitrogen pressurises the vessel and is vented after every cure (it is inert). HV: 1 or 2 HV energy hatches.')
    add('emi.grindless.info.composite_autoclave.5', 'Needs 1 or 2 energy hatches, 1 input bus, 1 output bus and 2 input hatches (epoxy and nitrogen) on the shell. The chamber inside stays empty.')

    add('emi.grindless.info.engine_test_stand.0', "The Engine Test Stand is a static fire stand, and no other machine qualifies a rocket engine. MV: four power thrusters fire together on RP-1 and oxygen and come out qualified. HV: an untested rocket motor fires on rocket fuel and becomes a basic rocket motor.")
    add('emi.grindless.info.engine_test_stand.1', "The exhaust is CO2 and water, one output hatch each. The HV fire needs an HV energy hatch or two MV ones. Fuel and oxidizer go in the run tank hatches.")
    add('emi.grindless.info.engine_test_stand.2', 'A static fire stand: the engine is clamped over a firebrick flame bucket, fed from the run tanks on top and fired. What passes, flies. No other machine qualifies a rocket engine.')
    add('emi.grindless.info.engine_test_stand.3', 'MV: the four power thrusters of one rocket motor fire together on RP-1 and oxygen and come out qualified. HV: an untested rocket motor fires on rocket fuel and becomes a basic rocket motor.')
    add('emi.grindless.info.engine_test_stand.4', 'The exhaust is CO2 and water, one output hatch each: the CO2 can go to a greenhouse or to methanol, the water back to the pumps. The HV fire needs an HV energy hatch or two MV ones.')
    add('emi.grindless.info.engine_test_stand.5', 'Needs 1 or 2 energy hatches, 1 input bus, 1 output bus and 2 output hatches in the base, and 1 or 2 input hatches (fuel and oxidizer) in the run tanks. The trench under the engine stays open on both sides.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.composite_autoclave.0', "El autoclave de composites cura capas de fibra y epoxi con calor y presión de nitrógeno. Láminas de fibra de vidrio y epoxi dan losetas de escudo térmico ablativo. Un tambor de acero inoxidable envuelto en para-aramida y epoxi da un depósito envuelto en composite.")
    add('emi.grindless.info.composite_autoclave.1', "Necesita epoxi y nitrógeno en sus dos escotillas de entrada; el nitrógeno se ventea tras cada curado. HV: 1 o 2 escotillas de energía HV. Las losetas van a los motores de cohete y dos depósitos hacen un depósito de combustible básico.")
    add('emi.grindless.info.composite_autoclave.2', 'Un recipiente a presión tumbado: las capas de fibra y el epoxi curan con calor y presión de nitrógeno. Ninguna máquina pequeña aguanta una pieza de este tamaño a esa presión.')
    add('emi.grindless.info.composite_autoclave.3', 'Láminas de fibra de vidrio + epoxi: losetas de escudo térmico ablativo, el escudo de la base de un motor de cohete. Un barril de acero inoxidable envuelto en para-aramida + epoxi: un depósito envuelto en composite, dos por depósito de combustible básico.')
    add('emi.grindless.info.composite_autoclave.4', 'El nitrógeno presuriza el recipiente y se ventea después de cada curado (es inerte). HV: 1 o 2 escotillas de energía HV.')
    add('emi.grindless.info.composite_autoclave.5', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada, 1 bus de salida y 2 escotillas de entrada (epoxi y nitrógeno) en la carcasa. La cámara de dentro queda vacía.')

    add('emi.grindless.info.engine_test_stand.0', "El banco de pruebas de motores es un puesto de encendido estático, y ninguna otra máquina califica un motor de cohete. MV: cuatro propulsores de potencia arden juntos con RP-1 y oxígeno y salen calificados. HV: un motor de cohete sin probar arde con combustible de cohete y pasa a ser un motor de cohete básico.")
    add('emi.grindless.info.engine_test_stand.1', "El escape es CO2 y agua, una escotilla de salida para cada uno. El encendido HV necesita una escotilla de energía HV o dos MV. Combustible y oxidante entran por las escotillas de los tanques.")
    add('emi.grindless.info.engine_test_stand.2', 'Un banco de encendido estático: el motor va sujeto sobre un foso de ladrillo refractario, se alimenta de los tanques de arriba y se enciende. Lo que pasa la prueba, vuela. Ninguna otra máquina califica un motor de cohete.')
    add('emi.grindless.info.engine_test_stand.3', 'MV: los cuatro propulsores de potencia de un motor de cohete se encienden juntos con RP-1 y oxígeno y salen calificados. HV: un motor de cohete sin probar se enciende con combustible de cohete y pasa a ser un motor de cohete básico.')
    add('emi.grindless.info.engine_test_stand.4', 'El escape es CO2 y agua, cada uno por su escotilla de salida: el CO2 puede ir a un invernadero o al metanol y el agua, de vuelta a las bombas. El encendido HV pide una escotilla de energía HV o dos MV.')
    add('emi.grindless.info.engine_test_stand.5', 'Necesita 1 o 2 escotillas de energía, 1 bus de entrada, 1 bus de salida y 2 escotillas de salida en la base, y 1 o 2 escotillas de entrada (combustible y oxidante) en los tanques. El foso bajo el motor queda abierto por los dos lados.')
})
