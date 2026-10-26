// Gregtech Grindless - names of LuV travel (startup_scripts/grindless/luv/travel.js and data/grindless/gcyr/planets/*.json):
//
//   block.grindless.cryogenic_fuel_tank        the level 4 rocket's tank, with two tooltip lines
//   level.grindless.<planet>                   GCYR's planet names (each planet file's "translation"), shown in the rocket menu
//   dimension.grindless.<world>                the ten dimensions (GCYR names its own as dimension.gcyr.<world>)
//   planet.grindless.<key>                     the planet names of moon/quantum_bridge.js's messages (planets.json keys)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Quests are English only; names go in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.grindless.cryogenic_fuel_tank', 'Cryogenic Fuel Tank')
    add('tooltip.grindless.cryogenic_fuel_tank.0', 'A tier 5 rocket tank with HSS-S walls and Kapton insulation: 16,000 mB.')
    add('tooltip.grindless.cryogenic_fuel_tank.1', 'Elite motors and only these tanks make a level 4 rocket: the belt and Jupiter\'s moons.')

    add('level.grindless.asteroid_belt', 'Asteroid Belt')
    add('level.grindless.jupiter', 'Jupiter')
    add('level.grindless.io', 'Io')
    add('level.grindless.europa', 'Europa')
    add('level.grindless.ganymede', 'Ganymede')

    add('dimension.grindless.asteroid_belt', 'Asteroid Belt')
    add('dimension.grindless.asteroid_belt_orbit', 'Asteroid Belt Orbit')
    add('dimension.grindless.jupiter', 'Jupiter')
    add('dimension.grindless.jupiter_orbit', 'Jupiter Orbit')
    add('dimension.grindless.io', 'Io')
    add('dimension.grindless.io_orbit', 'Io Orbit')
    add('dimension.grindless.europa', 'Europa')
    add('dimension.grindless.europa_orbit', 'Europa Orbit')
    add('dimension.grindless.ganymede', 'Ganymede')
    add('dimension.grindless.ganymede_orbit', 'Ganymede Orbit')

    add('planet.grindless.belt', 'the asteroid belt')
    add('planet.grindless.jupiter', 'Jupiter')
    add('planet.grindless.io', 'Io')
    add('planet.grindless.europa', 'Europa')
    add('planet.grindless.ganymede', 'Ganymede')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('block.grindless.cryogenic_fuel_tank', 'Tanque de combustible criogénico')
    add('tooltip.grindless.cryogenic_fuel_tank.0', 'Un tanque de cohete de nivel 5 con paredes de HSS-S y aislamiento de Kapton: 16.000 mB.')
    add('tooltip.grindless.cryogenic_fuel_tank.1', 'Motores de élite y solo estos tanques hacen un cohete de nivel 4: el cinturón y las lunas de Júpiter.')

    add('level.grindless.asteroid_belt', 'Cinturón de asteroides')
    add('level.grindless.jupiter', 'Júpiter')
    add('level.grindless.io', 'Ío')
    add('level.grindless.europa', 'Europa')
    add('level.grindless.ganymede', 'Ganímedes')

    add('dimension.grindless.asteroid_belt', 'Cinturón de asteroides')
    add('dimension.grindless.asteroid_belt_orbit', 'Órbita del cinturón de asteroides')
    add('dimension.grindless.jupiter', 'Júpiter')
    add('dimension.grindless.jupiter_orbit', 'Órbita de Júpiter')
    add('dimension.grindless.io', 'Ío')
    add('dimension.grindless.io_orbit', 'Órbita de Ío')
    add('dimension.grindless.europa', 'Europa')
    add('dimension.grindless.europa_orbit', 'Órbita de Europa')
    add('dimension.grindless.ganymede', 'Ganímedes')
    add('dimension.grindless.ganymede_orbit', 'Órbita de Ganímedes')

    add('planet.grindless.belt', 'el cinturón de asteroides')
    add('planet.grindless.jupiter', 'Júpiter')
    add('planet.grindless.io', 'Ío')
    add('planet.grindless.europa', 'Europa')
    add('planet.grindless.ganymede', 'Ganímedes')
})
