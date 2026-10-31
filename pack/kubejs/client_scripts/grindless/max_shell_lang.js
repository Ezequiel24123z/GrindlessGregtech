// Gregtech Grindless - names and tooltips of MAX's mirror shell (startup_scripts/grindless/max/shell.js; package MAX-G1):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each older row of the package
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_nuclear_clock.thorium_clock_reference', 'Circuit 6: a thorium-229 sample and a VUV optic are read against the nuclear clock (kept) into a frequency reference.', 'Circuito 6: una muestra de torio-229 y una \u00f3ptica VUV se leen contra el reloj nuclear (se conserva) para dar una referencia de frecuencia.'],
        ['gtceu.recipe.grindless_nuclear_demagnetisation.cooled_cavity_mode', 'Circuit 10: a polished SRF cavity is cooled in the mK module and its mode characterised (the module and He-3/He-4 mixture are kept).', 'Circuito 10: una cavidad de SRF pulida se enfr\u00eda en el m\u00f3dulo de mK y se caracteriza su modo (el m\u00f3dulo y la mezcla He-3/He-4 se conservan).'],
        ['gtceu.recipe.grindless_kugelblitz_forming.write_seed_wave_packet', 'Circuit 6: at Cygnus X-1 a Kugelblitz seed pumps a cooled cavity mode into a seed wave packet.', 'Circuito 6: en Cygnus X-1 una semilla de Kugelblitz bombea un modo de cavidad enfriado y lo convierte en un paquete de ondas semilla.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
