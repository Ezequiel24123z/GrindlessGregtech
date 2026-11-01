// priority: 10100
// Gregtech Grindless - names and tooltips of the Sealed Dome (gtceu:sealed_dome), the EV step of the Greenhouse family
// (startup_scripts/grindless/ev/sealed_dome.js, server_scripts/grindless/ev/sealed_dome.js).
//
// The creature models of the wither skeleton and the wither take their names from the creature table (mobs.json, read by
// lv_creatures_lang.js), so they need nothing here.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.gtceu.sealed_dome', 'Sealed Dome')

    add('grindless.machine.sealed_dome.tooltip.0', '§7A greenhouse sealed against the vacuum.')
    add('grindless.machine.sealed_dome.tooltip.1', 'Runs up to 64 recipes at once.')
})

