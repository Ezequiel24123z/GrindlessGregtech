// priority: 6706
// Gregtech Grindless - names of MAX-T1, gate c14 (server_scripts/grindless/max/gate_gc.js, data/grindless/tables/gate.json):
//
//   gtceu.recipe.grindless_warp_gate.hold_sgr_a_probe   EMI line of the c14 warp gate row (2^33 EU/t for 60 s, the galactic-centre probe)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.recipe.grindless_warp_gate.hold_sgr_a_probe',
            'Hold the Cygnus X-1 ring open for a minute at 2^33 EU/t: the galactic-centre relay probe is thrown and leaves launched; the Sgr A* chart stays in the bus; the platform at Sgr A* orbit unfolds on arrival']
    ]
    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
