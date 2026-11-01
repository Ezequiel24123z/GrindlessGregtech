// priority: 5026
// Gregtech Grindless - the EMI line of the warp gate's UEV row (server_scripts/grindless/uhv/gate.js; package UEV-B5):
//   gtceu.recipe.grindless_warp_gate.hold   the c3 row: the UIV gate load, 16 A UEV for 60 s at Sirius B's orbit
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.recipe.grindless_warp_gate.hold',
            'Hold the gate at UEV load for a minute at Sirius B: the tennessine sample, a degenerate pellet, the EOS model and four optical computers stay in the bus']
    ]
    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
