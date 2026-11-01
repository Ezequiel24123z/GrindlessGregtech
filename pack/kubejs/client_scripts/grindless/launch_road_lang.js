// priority: 8300
// Gregtech Grindless - names and tooltips of the road to the first rocket (MV -> HV):
//
//   gtceu:engine_test_stand, gtceu:static_fire            (machine name + tooltips, recipe type)
//   gtceu:composite_autoclave, gtceu:composite_curing     (machine name + tooltips, recipe type)
//   grindless:qualified_power_thruster, untested_rocket_motor, ablative_heat_shield_tile, composite_overwrapped_tank
//
// Kept out of pack/kubejs/assets/grindless/lang/*, like the other *_lang.js scripts: Minecraft merges lang entries from every
// namespace/script, so ClientEvents.lang works fine wherever it is declared. Quests are English only; names go in en_us.
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

