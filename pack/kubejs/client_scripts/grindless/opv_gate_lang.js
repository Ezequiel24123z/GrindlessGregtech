// priority: 5746
// Gregtech Grindless - names of OpV-G1, the gate to MAX (server_scripts/grindless/opv/gate.js, data/grindless/tables/gate.json):
//
//   gtceu.recipe.grindless_warp_gate.hold_sgr_a   EMI line of the c13 warp gate row (2^33 EU/t for 60 s, the Sgr A* chart)
//   emi.grindless.info.opv_gate_stock.0           the info page of the Sgr A* chart (the MAX casing's research; stock for MAX)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.recipe.grindless_warp_gate.hold_sgr_a',
            'Hold the Cygnus X-1 ring open for a minute at 2^33 EU/t: a Kugelblitz core and the bulge seed burn; the census, tetron array and 4 cosmic mainframes stay; the Sgr A* chart comes out'],
        ['emi.grindless.info.opv_gate_stock.0',
            'Made by the warp gate at Cygnus X-1 (circuit 13: 2^33 EU/t for a minute on two OpV 16 A hatches, burning a Kugelblitz core and the launched bulge seed). It researches the MAX machine casing and is stock for MAX.']
    ]
    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
