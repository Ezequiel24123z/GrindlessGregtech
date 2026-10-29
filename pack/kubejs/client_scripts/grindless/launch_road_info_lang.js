// priority: 8350
// Gregtech Grindless - EMI information pages of the launch road multiblocks (kubejs/assets/emi/recipe/additions/grindless/<id>.json, type emi:info).
// One page per controller: what it does, what it is for, what it needs. Their recipes show in EMI under the controller itself.
// Tooltips live in launch_road_lang.js; every key is in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.composite_autoclave.0', "The Composite Autoclave cures fibre plies and epoxy under heat and nitrogen pressure. Glass fibre foils and epoxy make ablative heat shield tiles. A stainless steel drum wrapped in para-aramid and epoxy makes a composite overwrapped tank.")
    add('emi.grindless.info.composite_autoclave.1', "It needs epoxy and nitrogen in its two input hatches; the nitrogen is vented after every cure. HV: 1 or 2 HV energy hatches. The tiles go into rocket motors, two tanks make a basic fuel tank.")

    add('emi.grindless.info.engine_test_stand.0', "The Engine Test Stand is a static fire stand, and no other machine qualifies a rocket engine. MV: four power thrusters fire together on RP-1 and oxygen and come out qualified. HV: an untested rocket motor fires on rocket fuel and becomes a basic rocket motor.")
    add('emi.grindless.info.engine_test_stand.1', "The exhaust is CO2 and water, one output hatch each. The HV fire needs an HV energy hatch or two MV ones. Fuel and oxidizer go in the run tank hatches.")
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('emi.grindless.info.composite_autoclave.0', "El autoclave de composites cura capas de fibra y epoxi con calor y presión de nitrógeno. Láminas de fibra de vidrio y epoxi dan losetas de escudo térmico ablativo. Un tambor de acero inoxidable envuelto en para-aramida y epoxi da un depósito envuelto en composite.")
    add('emi.grindless.info.composite_autoclave.1', "Necesita epoxi y nitrógeno en sus dos hatches de entrada; el nitrógeno se ventea tras cada curado. HV: 1 o 2 hatches de energía HV. Las losetas van a los motores de cohete y dos depósitos hacen un depósito de combustible básico.")

    add('emi.grindless.info.engine_test_stand.0', "El banco de pruebas de motores es un puesto de encendido estático, y ninguna otra máquina califica un motor de cohete. MV: cuatro propulsores de potencia arden juntos con RP-1 y oxígeno y salen calificados. HV: un motor de cohete sin probar arde con combustible de cohete y pasa a ser un motor de cohete básico.")
    add('emi.grindless.info.engine_test_stand.1', "El escape es CO2 y agua, un hatch de salida para cada uno. El encendido HV necesita un hatch de energía HV o dos MV. Combustible y oxidante entran por los hatches de los tanques.")
})
