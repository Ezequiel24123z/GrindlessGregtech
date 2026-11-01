// priority: 1700
// Gregtech Grindless - names of UV travel (startup_scripts/grindless/uv/travel.js and data/grindless/gcyr/planets/{neptune,pluto}.json):
//
//   level.grindless.<planet>                   GCYR's planet names (each planet file's "translation"), shown in the rocket menu
//   dimension.grindless.<world>                the four new dimensions
//   planet.grindless.<key>                     the planet names of moon/quantum_bridge.js's messages (planets.json keys)
//   item.grindless.<seed>                      the two orbit quantum seeds
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Quests are English only; names go in en_us.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('level.grindless.neptune', 'Neptune')
    add('level.grindless.pluto', 'Pluto')
    add('dimension.grindless.neptune', 'Neptune')
    add('dimension.grindless.neptune_orbit', 'Neptune Orbit')
    add('dimension.grindless.pluto', 'Pluto')
    add('dimension.grindless.pluto_orbit', 'Pluto Orbit')
    add('planet.grindless.neptune', 'Neptune')
    add('planet.grindless.pluto', 'Pluto')

    add('item.grindless.neptunian_quantum_seed', 'Neptunian Quantum Seed')
    add('tooltip.grindless.neptunian_quantum_seed', 'Made in Neptune\'s orbit. Entangle it with a singularity for a Neptune pair.')
    add('item.grindless.plutonian_quantum_seed', 'Plutonian Quantum Seed')
    add('tooltip.grindless.plutonian_quantum_seed', 'Made in Pluto\'s orbit. Entangle it with a singularity for a Pluto pair.')
})

