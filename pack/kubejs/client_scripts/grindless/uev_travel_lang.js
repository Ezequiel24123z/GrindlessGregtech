// priority: 4937
// Gregtech Grindless - names of UEV travel (startup_scripts/grindless/uev/travel.js and data/grindless/gcyr/planets/{alpha_centauri_orbit,barnard_b,sirius_b_orbit}.json):
//
//   level.grindless.<planet>                   GCYR's planet names (each planet file's "translation"), shown in the rocket menu
//   dimension.grindless.<world>                the four new dimensions
//   planet.grindless.<key>                     the planet names of the quantum bridge messages (planets.json keys)
//   block.grindless.dfd_mk{1,2}_motor          the direct fusion drive motors (their block items use them) + item names
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
ClientEvents.lang('en_us', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('level.grindless.alpha_centauri_orbit', 'Alpha Centauri AB')
    add('level.grindless.barnard_b', 'Barnard b')
    add('level.grindless.sirius_b_orbit', 'Sirius B')
    add('dimension.grindless.alpha_centauri_orbit', 'Alpha Centauri AB Orbit')
    add('dimension.grindless.barnard_b', 'Barnard b')
    add('dimension.grindless.barnard_b_orbit', 'Barnard b Orbit')
    add('dimension.grindless.sirius_b_orbit', 'Sirius B Orbit')
    add('planet.grindless.alpha', 'Alpha Centauri')
    add('planet.grindless.barnard', 'Barnard b')
    add('planet.grindless.sirius', 'Sirius B')

    add('block.grindless.dfd_mk1_motor', 'Direct Fusion Drive Mk1')
    add('item.grindless.dfd_mk1_motor', 'Direct Fusion Drive Mk1')
    add('block.grindless.dfd_mk2_motor', 'Direct Fusion Drive Mk2')
    add('item.grindless.dfd_mk2_motor', 'Direct Fusion Drive Mk2')
})

ClientEvents.lang('es_es', event => {
    var add = function (key, value) { event.add('grindless', key, value) }

    add('level.grindless.alpha_centauri_orbit', 'Alfa Centauri AB')
    add('level.grindless.barnard_b', 'Barnard b')
    add('level.grindless.sirius_b_orbit', 'Sirio B')
    add('dimension.grindless.alpha_centauri_orbit', 'Órbita de Alfa Centauri AB')
    add('dimension.grindless.barnard_b', 'Barnard b')
    add('dimension.grindless.barnard_b_orbit', 'Órbita de Barnard b')
    add('dimension.grindless.sirius_b_orbit', 'Órbita de Sirio B')
    add('planet.grindless.alpha', 'Alfa Centauri')
    add('planet.grindless.barnard', 'Barnard b')
    add('planet.grindless.sirius', 'Sirio B')

    add('block.grindless.dfd_mk1_motor', 'Propulsor de fusión directa Mk1')
    add('item.grindless.dfd_mk1_motor', 'Propulsor de fusión directa Mk1')
    add('block.grindless.dfd_mk2_motor', 'Propulsor de fusión directa Mk2')
    add('item.grindless.dfd_mk2_motor', 'Propulsor de fusión directa Mk2')
})
