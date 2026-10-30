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
    add('grindless.machine.engine_test_stand.tooltip.0', '§7A static fire stand that qualifies rocket engines.')

    add('block.gtceu.composite_autoclave', 'Composite Autoclave')
    add('gtceu.composite_curing', 'Composite Curing')
    add('grindless.machine.composite_autoclave.tooltip.0', '§7Cures fibre plies and epoxy under heat and nitrogen pressure.')
    add('grindless.machine.composite_autoclave.tooltip.1', 'Needs epoxy and nitrogen in its two input hatches.')

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
    add('grindless.machine.engine_test_stand.tooltip.0', '§7Un banco de encendido estático que califica motores de cohete.')

    add('block.gtceu.composite_autoclave', 'Autoclave de composites')
    add('gtceu.composite_curing', 'Curado de composites')
    add('grindless.machine.composite_autoclave.tooltip.0', '§7Cura capas de fibra y epoxi con calor y presión de nitrógeno.')
    add('grindless.machine.composite_autoclave.tooltip.1', 'Pide epoxi y nitrógeno en sus dos escotillas de entrada.')

    add('item.grindless.qualified_power_thruster', 'Propulsor de potencia calificado')
    add('tooltip.grindless.qualified_power_thruster', 'Pasó su encendido estático en el banco de pruebas de motores. Cuatro van a un motor de cohete sin probar.')
    add('item.grindless.untested_rocket_motor', 'Motor de cohete sin probar')
    add('tooltip.grindless.untested_rocket_motor', 'Todavía no vuela. Enciéndelo en el banco de pruebas de motores con combustible de cohete y saldrá un motor de cohete básico: ningún cohete vuela con un motor sin probar.')
    add('item.grindless.ablative_heat_shield_tile', 'Loseta de escudo térmico ablativo')
    add('tooltip.grindless.ablative_heat_shield_tile', 'Fibra de vidrio y epoxi curados en el autoclave de composites. Se carboniza poco a poco y no deja pasar el calor: el escudo de la base de un motor de cohete.')
    add('item.grindless.composite_overwrapped_tank', 'Depósito envuelto en composite')
    add('tooltip.grindless.composite_overwrapped_tank', 'Un forro de acero inoxidable envuelto en para-aramida y epoxi, curado en el autoclave de composites. Dos hacen un depósito de combustible básico.')
})
