// priority: 6645
// Gregtech Grindless - names and tooltips of MAX's mass stream injector (startup_scripts/grindless/max/injector.js; package MAX-D4):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each row of the package that has one
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.mass_stream_injector', 'Mass Stream Injector', 'Inyector de flujo de masa'],
        ['gtceu.mass_stream_injection', 'Mass Stream Injection', 'Inyecci\u00f3n de flujo de masa'],
        ['grindless.machine.mass_stream_injector.tooltip.0', '\u00a77Packs stream pellets into stream bundles and re-casts the spent ones.', '\u00a77Empaqueta p\u00edldoras de flujo en haces de flujo y refunde las gastadas.'],
        ['emi.grindless.info.mass_stream_injector.0', 'Sixty-four stream pellets, four max field coils and flux-loaded FRC are packed into one stream bundle at Sgr A*. The spent pellets come out and the cooled exhaust goes to the mass filter. The recipes run only at Sgr A* (gcyr:black_hole_orbit).', 'Sesenta y cuatro p\u00edldoras de flujo, cuatro bobinas de campo m\u00e1ximas y FRC cargado de flujo se empaquetan en un haz de flujo en Sgr A*. Salen las p\u00edldoras gastadas y el escape enfriado va al filtro de masa. Las recetas solo funcionan en Sgr A* (gcyr:black_hole_orbit).'],
        ['emi.grindless.info.mass_stream_injector.1', 'Seven in eight spent pellets are re-cast into stream pellets. Pellets are made from furnace blanks (megabar press, lathe, SRF works, canner).', 'Siete de cada ocho p\u00edldoras gastadas se refunden en p\u00edldoras de flujo. Las p\u00edldoras se hacen de bloques del horno (prensa de megabar, torno, taller SRF, enlatadora).'],
        ['emi.grindless.info.stream_turn_casing.0', 'A structure block: a magnet turn of the Mass Stream Injector ring. Made in the assembler.', 'Un bloque de estructura: un giro magn\u00e9tico del anillo del inyector de flujo de masa. Se fabrica en el ensamblador.'],
        ['gtceu.recipe.grindless_mass_stream_injection.stream_bundle', 'Circuit 1: 64 stream pellets and four field coils are packed into a stream bundle; the spent pellets and the cooled exhaust come out.', 'Circuito 1: 64 p\u00edldoras de flujo y cuatro bobinas se empaquetan en un haz de flujo; salen las p\u00edldoras gastadas y el escape enfriado.'],
        ['gtceu.recipe.grindless_mass_stream_injection.pellet_recast', 'Circuit 2: a spent pellet is re-cast; seven in eight come back.', 'Circuito 2: una p\u00edldora gastada se refunde; vuelven siete de cada ocho.'],
        ['gtceu.recipe.grindless_megabar.pellet_press', 'Circuit 10: pellet blanks are pressed under the anvil into dense pellets.', 'Circuito 10: los bloques de p\u00edldora se prensan bajo el yunque en p\u00edldoras densas.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
