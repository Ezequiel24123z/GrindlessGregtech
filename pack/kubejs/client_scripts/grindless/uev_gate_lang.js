// Gregtech Grindless - the EMI line of the warp gate's UEV row (server_scripts/grindless/uhv/gate.js; package UEV-B5):
//   gtceu.recipe.grindless_warp_gate.hold   the c3 row: the UIV gate load, 16 A UEV for 60 s at Sirius B's orbit
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_warp_gate.hold',
            'Hold the gate at UEV load for a minute at Sirius B: the tennessine sample, a degenerate pellet, the EOS model and four optical computers stay in the bus',
            'Mantener la puerta a carga UEV durante un minuto en Sirio B: la muestra de teneso, un pellet degenerado, el modelo EOS y cuatro ordenadores \u00f3pticos se quedan en el bus']
    ]
    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
