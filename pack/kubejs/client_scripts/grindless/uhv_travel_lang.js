// priority: 3700
// Gregtech Grindless - names of UHV travel (startup_scripts/grindless/uhv/travel.js, data/grindless/dimension/proxima_b_orbit.json):
//
//   dimension.grindless.proxima_b_orbit        the new orbit (Proxima b's surface keeps GCYR's names)
//   planet.grindless.proxima                   the planet name of moon/quantum_bridge.js's messages (planets.json key)
//   gtceu.recipe.grindless_sky.proxima_day     the lunar solar field's Proxima row in EMI (ev/lunar_power_and_antenna.js)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Quests are English only; names go in en_us.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('dimension.grindless.proxima_b_orbit', 'Proxima b Orbit')
    add('planet.grindless.proxima', 'Proxima b')
    add('gtceu.recipe.grindless_sky.proxima_day', 'Proxima b, star side only, a red-tuned array in the bus, panels under open sky (x0.91 sunlight): %s EU/t per panel, %s panels = %s EU/t')
})

