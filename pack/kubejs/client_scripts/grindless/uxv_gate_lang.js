// Gregtech Grindless - names of UXV-B6, the gate to OpV (server_scripts/grindless/uxv/gate.js, data/grindless/tables/{gate,matrioshka}.json):
//
//   gtceu.recipe.grindless_warp_gate.hold_galactic_bulge        EMI line of the c10 warp gate row (2^31 EU/t for 60 s, the bulge chart)
//   gtceu.recipe.grindless_matrioshka_computing.arm_chart       EMI line of the Matrioshka's arm chart row
//   emi.grindless.info.uxv_gate_stock.0                         the info page of the bulge chart (the OpV casing's research; stock for OpV)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_warp_gate.hold_galactic_bulge',
            'Hold the Cygnus X-1 ring open for a minute at 2^31 EU/t: an FRC cartridge burns; census III, the island chart, the arm chart, a core sample and four spintronic mainframes stay in the bus; the bulge chart comes out',
            'Mantener abierto el anillo de Cygnus X-1 un minuto a 2^31 EU/t: se consume un cartucho FRC; el censo III, la carta de la isla, la carta del brazo, una muestra de n\u00facleo y cuatro mainframes espintr\u00f3nicos se quedan en el bus; sale la carta del bulbo'],
        ['gtceu.recipe.grindless_matrioshka_computing.arm_chart',
            'Compute the arm chart from the Vela strain record, the Ti-44 line map, the Cygnus elevator log and the EHT VLBI record',
            'Calcular la carta del brazo con el registro de deformaci\u00f3n de Vela, el mapa de l\u00edneas del Ti-44, el registro del elevador de Cygnus y el registro VLBI del EHT'],
        ['emi.grindless.info.uxv_gate_stock.0',
            'Made by the warp gate at Cygnus X-1 (circuit 10: 2^31 EU/t for a minute, with the arm chart, the island chart, census III, a core sample and four spintronic mainframes kept in the bus). It researches the OpV machine casing and is stock for OpV: the galactic bulge is its next place.',
            'La hace la puerta de salto de Cygnus X-1 (circuito 10: 2^31 EU/t durante un minuto, con la carta del brazo, la carta de la isla, el censo III, una muestra de n\u00facleo y cuatro mainframes espintr\u00f3nicos en el bus). Investiga la carcasa de m\u00e1quina OpV y es reserva para OpV: el bulbo gal\u00e1ctico es su siguiente lugar.']
    ]
    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
