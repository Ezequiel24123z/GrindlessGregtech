// priority: 11000
// Gregtech Grindless - names and tooltips of the AE2 network's EV step (startup_scripts/grindless/ev/ae2_interplanetary.js):
//
//   grindless:martian_quantum_seed                   (the Martian half of an Earth-Mars quantum pair)
//   tooltip.grindless.entangled_planet.mars          (the extra line on the Earth-Mars pairs; moon_lang.js adds it to every marked pair)
//   planet.grindless.mars                            (the planet's name in the messages of moon/quantum_bridge.js)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Quests are English only; names go in en_us.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('item.grindless.martian_quantum_seed', 'Martian Quantum Seed')
    add('tooltip.grindless.martian_quantum_seed.0', 'The Martian half of an Earth-Mars quantum pair. Made anywhere from shipped inputs: chemical reactor, merrillite dust + ender pearl + helium-3.')
    add('tooltip.grindless.martian_quantum_seed.1', 'Throw it into an explosion with an AE2 singularity (the Earth half): two entangled singularities that also link the Earth and Mars.')
    add('tooltip.grindless.entangled_planet.mars', 'Earth-Mars pair: one end may sit on Mars.')

    add('planet.grindless.mars', 'Mars')
})

