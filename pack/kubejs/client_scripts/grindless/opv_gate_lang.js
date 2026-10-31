// priority: 5746
// Gregtech Grindless - names of OpV-G1, the gate to MAX (server_scripts/grindless/opv/gate.js, data/grindless/tables/gate.json):
//
//   gtceu.recipe.grindless_warp_gate.hold_sgr_a   EMI line of the c13 warp gate row (2^33 EU/t for 60 s, the Sgr A* chart)
//   emi.grindless.info.opv_gate_stock.0           the info page of the Sgr A* chart (the MAX casing's research; stock for MAX)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_warp_gate.hold_sgr_a',
            'Hold the Cygnus X-1 ring open for a minute at 2^33 EU/t: a Kugelblitz core and the launched bulge seed burn; the light census, stable exotic matter, a tetron array, census IV, the bulge chart and four cosmic mainframes stay in the bus; the Sgr A* chart comes out',
            'Mantener abierto el anillo de Cygnus X-1 un minuto a 2^33 EU/t: se consumen un n\u00facleo Kugelblitz y la semilla del bulbo lanzada; el censo de luz, la materia ex\u00f3tica estable, un arreglo tetr\u00f3n, el censo IV, la carta del bulbo y cuatro mainframes c\u00f3smicos se quedan en el bus; sale la carta de Sgr A*'],
        ['emi.grindless.info.opv_gate_stock.0',
            'Made by the warp gate at Cygnus X-1 (circuit 13: 2^33 EU/t for a minute on two OpV 16 A hatches, burning a Kugelblitz core and the launched bulge seed). It researches the MAX machine casing and is stock for MAX.',
            'La hace la puerta de salto de Cygnus X-1 (circuito 13: 2^33 EU/t durante un minuto en dos hatches OpV de 16 A, consumiendo un n\u00facleo Kugelblitz y la semilla del bulbo lanzada). Investiga la carcasa de m\u00e1quina MAX y es reserva para MAX.']
    ]
    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
