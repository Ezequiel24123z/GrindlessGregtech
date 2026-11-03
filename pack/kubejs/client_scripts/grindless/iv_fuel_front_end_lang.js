// priority: 9250
// Gregtech Grindless - names and tooltips of IV's uranium front end (startup_scripts/grindless/iv/fuel_front_end.js and
// server_scripts/grindless/iv/fuel_front_end.js; docs/eras/lines-ev-zpm.md, I1). Every key is in en_us.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('material.gtceu.uranyl_sulfate_liquor', 'Uranyl Sulfate Liquor')
    add('material.gtceu.uranium_eluate', 'Uranium Eluate')
    add('material.gtceu.yellowcake', 'Yellowcake')
    add('material.gtceu.triuranium_octoxide', 'Triuranium Octoxide')
    add('material.gtceu.uranium_tetrafluoride', 'Uranium Tetrafluoride')

    add('tooltip.grindless.uranyl_sulfate_liquor', 'What the leach field brings up. The large chemical reactor strips the uranium onto ion-exchange resin.')
    add('tooltip.grindless.uranium_eluate', 'Uranium washed off the resin. A chemical reactor precipitates it with hydrogen peroxide.')
    add('tooltip.grindless.yellowcake', 'Uranium peroxide. An electric blast furnace at 700 K calcines it into triuranium octoxide.')
    add('tooltip.grindless.triuranium_octoxide', 'U3O8. An electric blast furnace at 900 K reduces it with hydrogen to uraninite.')
    add('tooltip.grindless.uranium_tetrafluoride', 'The green salt, UF4. A large chemical reactor fluorinates it into uranium hexafluoride.')
})

ItemEvents.tooltip(event => {
    event.add('gtceu:uranyl_sulfate_liquor_bucket', Text.translate('tooltip.grindless.uranyl_sulfate_liquor').gray())
    event.add('gtceu:uranium_eluate_bucket', Text.translate('tooltip.grindless.uranium_eluate').gray())
    event.add('gtceu:yellowcake_dust', Text.translate('tooltip.grindless.yellowcake').gray())
    event.add('gtceu:triuranium_octoxide_dust', Text.translate('tooltip.grindless.triuranium_octoxide').gray())
    event.add('gtceu:uranium_tetrafluoride_dust', Text.translate('tooltip.grindless.uranium_tetrafluoride').gray())
})
