// priority: 3175
// Gregtech Grindless - the EMI line of the warp gate's UIV row (data/grindless/tables/gate.json; package UIV-B5):
//   gtceu.recipe.grindless_warp_gate.hold_cygnus_ring   the c7 row: 16 A UIV for 60 s holding the Cygnus X-1 ring open
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_warp_gate.hold_cygnus_ring',
            'Hold the Cygnus X-1 ring open for a minute at UIV load: a neutronium pellet burns; census II, the EOS chart, the recovered half-sled and four optical mainframes stay in the bus',
            'Mantener abierto el anillo de Cygnus X-1 un minuto a carga UIV: se consume un pellet de neutronio; el censo II, la carta EOS, el medio trineo recuperado y cuatro mainframes \u00f3pticos se quedan en el bus']
    ]
    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
