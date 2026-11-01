// priority: 1575
// Gregtech Grindless - names of UXV-B6, the gate to OpV (server_scripts/grindless/uxv/gate.js, data/grindless/tables/{gate,matrioshka}.json):
//
//   gtceu.recipe.grindless_warp_gate.hold_galactic_bulge        EMI line of the c10 warp gate row (2^31 EU/t for 60 s, the bulge chart)
//   gtceu.recipe.grindless_matrioshka_computing.arm_chart       EMI line of the Matrioshka's arm chart row
//   emi.grindless.info.uxv_gate_stock.0                         the info page of the bulge chart (the OpV casing's research; stock for OpV)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.recipe.grindless_warp_gate.hold_galactic_bulge',
            'Hold the Cygnus X-1 ring open for a minute at 2^31 EU/t: an FRC cartridge burns; census III, the island chart, the arm chart, a core sample and four spintronic mainframes stay in the bus; the bulge chart comes out'],
        ['gtceu.recipe.grindless_matrioshka_computing.arm_chart',
            'Compute the arm chart from the Vela strain record, the Ti-44 line map, the Cygnus elevator log and the EHT VLBI record'],
        ['emi.grindless.info.uxv_gate_stock.0',
            'Made by the warp gate at Cygnus X-1 (circuit 10: 2^31 EU/t for a minute, with the arm chart, the island chart, census III, a core sample and four spintronic mainframes kept in the bus). It researches the OpV machine casing and is stock for OpV: the galactic bulge is its next place.']
    ]
    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
