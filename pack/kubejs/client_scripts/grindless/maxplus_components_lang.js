// priority: 6823
// Gregtech Grindless - the EMI line of the one MAX+ component step that runs on a custom machine
// (server_scripts/grindless/maxplus/components.js; package XP-A2). The other steps run on GTM machines and need no key.
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_condensate_refinery.condensate_loaded_cavity', 'Circuit 7: a niobium-coated cavity is flooded with settled condensate until it holds a standing field (line C5).', 'Circuito 7: una cavidad recubierta de niobio se inunda de condensado asentado hasta que sostiene un campo estacionario         (l\u00ednea C5).'],
                ['gtceu.recipe.grindless_magnet_winding.kerr_coil_winding', 'Circuit 22: stabilised Kerr wire wound on the CMC coil former and potted in epoxy (line C1).', 'Circuito 22: hilo Kerr estabilizado bobinado sobre el soporte CMC y encapsulado en ep\u00f3xido (l\u00ednea C1).'],
                ['gtceu.recipe.grindless_membrane_rolling.horizon_belt', 'Circuit 4: horizon membrane and strand wire rolled into the horizon belt (line C6).', 'Circuito 4: membrana de horizonte e hilo trenzado laminados en la correa de horizonte (l\u00ednea C6).']
            ]
    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
