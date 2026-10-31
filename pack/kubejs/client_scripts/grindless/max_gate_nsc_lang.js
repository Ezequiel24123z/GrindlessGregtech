// priority: 6680
// Gregtech Grindless - names of MAX-T2, gate c15 (server_scripts/grindless/max/gate_nsc.js, data/grindless/tables/gate.json):
//
//   gtceu.recipe.grindless_warp_gate.hold_nsc_belt   EMI line of the c15 warp gate row (2^33 EU/t for 1,200 t, the belt seed)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_warp_gate.hold_nsc_belt',
            'Hold the Sgr A* ring open for a minute at 2^33 EU/t: the belt seed, aimed by the ephemeris it carries, is thrown and leaves launched; the platform in the nuclear star cluster unfolds on arrival',
            'Mantener abierto el anillo de Sgr A* un minuto a 2^33 EU/t: la semilla del cintur\u00f3n, apuntada con la efem\u00e9ride que lleva, sale lanzada; al llegar se despliega la plataforma en el c\u00famulo estelar nuclear']
    ]
    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
