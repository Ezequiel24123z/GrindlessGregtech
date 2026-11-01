// priority: 3175
// Gregtech Grindless - the EMI line of the warp gate's UIV row (data/grindless/tables/gate.json; package UIV-B5):
//   gtceu.recipe.grindless_warp_gate.hold_cygnus_ring   the c7 row: 16 A UIV for 60 s holding the Cygnus X-1 ring open
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.recipe.grindless_warp_gate.hold_cygnus_ring',
            'Hold the Cygnus X-1 ring open for a minute at UIV load: a neutronium pellet burns; census II, the EOS chart, the recovered half-sled and four optical mainframes stay in the bus']
    ]
    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
