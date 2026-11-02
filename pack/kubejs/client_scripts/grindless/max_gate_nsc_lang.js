// priority: 6756
// Gregtech Grindless - names of MAX-T2, gate c15 (server_scripts/grindless/max/gate_nsc.js, data/grindless/tables/gate.json):
//
//   gtceu.recipe.grindless_warp_gate.hold_nsc_belt   EMI line of the c15 warp gate row (2^33 EU/t for 1,200 t, the belt seed)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.recipe.grindless_warp_gate.hold_nsc_belt',
            'Hold the Sgr A* ring open for a minute at 2^33 EU/t: the belt seed, aimed by its ephemeris, is thrown and leaves launched; the nuclear star cluster platform unfolds on arrival']
    ]
    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
