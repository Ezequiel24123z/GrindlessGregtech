// priority: 6613
// Gregtech Grindless - names of MAX-T1, gate c14 (server_scripts/grindless/max/gate_gc.js, data/grindless/tables/gate.json):
//
//   gtceu.recipe.grindless_warp_gate.hold_sgr_a_probe   EMI line of the c14 warp gate row (2^33 EU/t for 60 s, the galactic-centre probe)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_warp_gate.hold_sgr_a_probe',
            'Hold the Cygnus X-1 ring open for a minute at 2^33 EU/t: the galactic-centre relay probe is thrown and leaves launched; the Sgr A* chart stays in the bus; the platform at Sgr A* orbit unfolds on arrival',
            'Mantener abierto el anillo de Cygnus X-1 un minuto a 2^33 EU/t: la sonda de relevo del centro gal\u00e1ctico sale lanzada; la carta de Sgr A* se queda en el bus; al llegar se despliega la plataforma en la \u00f3rbita de Sgr A*']
    ]
    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
