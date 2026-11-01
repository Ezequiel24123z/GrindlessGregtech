// priority: 6752
// Gregtech Grindless - names and tooltips of MAX's horizon flux clamp (startup_scripts/grindless/max/flux_clamp.js; package MX-S3):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each row of the package that has one (the machine's own, the L54
//                                                      steps on older machines and the plasmoid return on the plasma mass filter)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.horizon_flux_clamp', 'Horizon Flux Clamp', 'Abrazadera de flujo del horizonte'],
        ['grindless.machine.horizon_flux_clamp.tooltip.0', '\u00a77Winds HTS flux pumps, field coils and stream bundles into a clamp winding.', '\u00a77Devana bombas HTS, bobinas y haces en un devanado de abrazadera.'],
        ['emi.grindless.info.clamp_coil_casing.0', 'A structure block: a coil ring of the Horizon Flux Clamp, held off the floor on stream bundle blocks. Made in the assembler.', 'Un bloque de estructura: un anillo de bobinas de la abrazadera de flujo del horizonte, sostenido sobre bloques de haces de flujo. Se fabrica en el ensamblador.'],
        ['gtceu.recipe.grindless_horizon_flux_clamp.horizon_flux_clamp', 'Circuit 1: four HTS flux pumps, eight field coils and four stream bundles are wound into a clamp winding under flux-loaded FRC; the flares it suppresses come out as a reconnection plasmoid. Runs only at Sgr A* (gcyr:black_hole_orbit).', 'Circuito 1: cuatro bombas de flujo HTS, ocho bobinas de campo y cuatro haces de flujo se bobinan en un devanado de abrazadera bajo FRC cargado de flujo; las r\u00e1fagas que suprime salen como un plasmoide de reconexi\u00f3n. Solo funciona en Sgr A* (gcyr:black_hole_orbit).'],
        ['gtceu.recipe.grindless_coated_conductor.pump_buffered_tape', 'Circuit 9: ITBTC coated conductor is laid on the Hastelloy substrate strip under an epoxy bond into the buffered tape of the HTS flux pump (line L54, step 1).', 'Circuito 9: el conductor recubierto ITBTC se coloca sobre la tira de sustrato de Hastelloy bajo un adhesivo epoxi, en la cinta tamponada de la bomba de flujo HTS (l\u00ednea L54, paso 1).'],
        ['gtceu.recipe.grindless_pulsed_laser_deposition.thick_pump_tape', 'Circuit 7: the KrF laser ablates gadolinium barium copper oxide onto the buffered pump tape in oxygen, growing the thick film the pump stator is wound from (line L54, step 2).', 'Circuito 7: el l\u00e1ser KrF ablaciona \u00f3xido de gadolinio, bario y cobre sobre la cinta tamponada en ox\u00edgeno, creciendo la pel\u00edcula gruesa con que se bobina el estator de la bomba (l\u00ednea L54, paso 2).'],
        ['gtceu.recipe.grindless_magnet_winding.flux_pump_stator', 'Circuit 15: eight turns of thick pump tape are wound with horizon strand wire and potted in epoxy, then ramped in the cold-test helium (line L54, step 3).', 'Circuito 15: ocho vueltas de cinta gruesa de bomba se bobinan con cable de hebra del horizonte y se encapsulan en epoxi, y se activan en el helio de prueba en fr\u00edo (l\u00ednea L54, paso 3).'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.fe16n2_rotor_magnet', 'Circuit 21: the flux pump stator is set into Fe16N2 ring magnets in a nitrogen stream, below the 320 C ordering limit (line L54, step 4).', 'Circuito 21: el estator de la bomba de flujo se monta en imanes anulares Fe16N2 en corriente de nitr\u00f3geno, por debajo del l\u00edmite de ordenaci\u00f3n de 320 C (l\u00ednea L54, paso 4).'],
        ['gtceu.recipe.grindless_plasma_mass_filtering.reconnection_plasmoid_return', 'Circuit 5: the clamp\'s captured reconnection plasmoid is sorted again; it is consumed here and comes out as filtered hot flow and the heavy cut. Runs only at Sgr A* (gcyr:black_hole_orbit).', 'Circuito 5: el plasmoide de reconexi\u00f3n capturado por la abrazadera se clasifica de nuevo; se consume aqu\u00ed y sale como flujo caliente filtrado y el corte pesado. Solo funciona en Sgr A* (gcyr:black_hole_orbit).']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
