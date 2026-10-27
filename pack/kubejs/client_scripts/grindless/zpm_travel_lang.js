// priority: 200
// Gregtech Grindless - names of ZPM travel (startup_scripts/grindless/zpm/travel.js and data/grindless/gcyr/planets/{saturn,uranus}.json):
//
//   level.grindless.<planet>                   GCYR's planet names (each planet file's "translation"), shown in the rocket menu
//   dimension.grindless.<world>                the four new dimensions
//   planet.grindless.<key>                     the planet names of moon/quantum_bridge.js's messages (planets.json keys)
//   block.grindless.<tank>, tooltip...         the level 5 and level 6 rocket tanks
//   item.grindless.<seed>                      the two orbit quantum seeds
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Quests are English only; names go in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('level.grindless.saturn', 'Saturn')
    add('level.grindless.uranus', 'Uranus')
    add('dimension.grindless.saturn', 'Saturn')
    add('dimension.grindless.saturn_orbit', 'Saturn Orbit')
    add('dimension.grindless.uranus', 'Uranus')
    add('dimension.grindless.uranus_orbit', 'Uranus Orbit')
    add('planet.grindless.saturn', 'Saturn')
    add('planet.grindless.uranus', 'Uranus')

    add('block.grindless.naquadah_fuel_tank', 'Naquadah Fuel Tank')
    add('tooltip.grindless.naquadah_fuel_tank.0', 'A tier 7 rocket tank with naquadah walls: 64,000 mB.')
    add('tooltip.grindless.naquadah_fuel_tank.1', 'Elite motors and only these tanks make a level 5 rocket: Saturn.')
    add('block.grindless.aerogel_fuel_tank', 'Aerogel Fuel Tank')
    add('tooltip.grindless.aerogel_fuel_tank.0', 'A tier 9 rocket tank insulated with silica aerogel: 256,000 mB.')
    add('tooltip.grindless.aerogel_fuel_tank.1', 'Elite motors and only these tanks make a level 6 rocket: Uranus.')

    add('item.grindless.saturnian_quantum_seed', 'Saturnian Quantum Seed')
    add('tooltip.grindless.saturnian_quantum_seed', 'Made in Saturn\'s orbit. Entangle it with a singularity for a Saturn pair.')
    add('item.grindless.uranian_quantum_seed', 'Uranian Quantum Seed')
    add('tooltip.grindless.uranian_quantum_seed', 'Made in Uranus\'s orbit. Entangle it with a singularity for a Uranus pair.')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('level.grindless.saturn', 'Saturno')
    add('level.grindless.uranus', 'Urano')
    add('dimension.grindless.saturn', 'Saturno')
    add('dimension.grindless.saturn_orbit', 'Órbita de Saturno')
    add('dimension.grindless.uranus', 'Urano')
    add('dimension.grindless.uranus_orbit', 'Órbita de Urano')
    add('planet.grindless.saturn', 'Saturno')
    add('planet.grindless.uranus', 'Urano')

    add('block.grindless.naquadah_fuel_tank', 'Tanque de combustible de naquadah')
    add('tooltip.grindless.naquadah_fuel_tank.0', 'Un tanque de cohete de nivel 7 con paredes de naquadah: 64.000 mB.')
    add('tooltip.grindless.naquadah_fuel_tank.1', 'Motores de élite y solo estos tanques hacen un cohete de nivel 5: Saturno.')
    add('block.grindless.aerogel_fuel_tank', 'Tanque de combustible de aerogel')
    add('tooltip.grindless.aerogel_fuel_tank.0', 'Un tanque de cohete de nivel 9 aislado con aerogel de sílice: 256.000 mB.')
    add('tooltip.grindless.aerogel_fuel_tank.1', 'Motores de élite y solo estos tanques hacen un cohete de nivel 6: Urano.')

    add('item.grindless.saturnian_quantum_seed', 'Semilla cuántica saturniana')
    add('tooltip.grindless.saturnian_quantum_seed', 'Hecha en la órbita de Saturno. Entrelázala con una singularidad para un par de Saturno.')
    add('item.grindless.uranian_quantum_seed', 'Semilla cuántica uraniana')
    add('tooltip.grindless.uranian_quantum_seed', 'Hecha en la órbita de Urano. Entrelázala con una singularidad para un par de Urano.')
})
