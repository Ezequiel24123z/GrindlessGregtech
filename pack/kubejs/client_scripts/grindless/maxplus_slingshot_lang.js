// priority: 6816
// Gregtech Grindless - names and tooltips of MAX+'s Hills slingshot (startup_scripts/grindless/maxplus/slingshot.js; package XP-T1):
//
//   gtceu.recipe.grindless_<type>.<recipe>   the EMI line of each keyed row of the package: the slingshot's two rows, the older P15 and P16 steps on
//                                            machines whose type carries a data key, and gate c16 (hold_tarantula)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.hills_slingshot', 'Hills Slingshot'],
        ['block.gtceu.hills_slingshot', 'Hills Slingshot'],
        ['grindless.machine.hills_slingshot.tooltip.0', '\u00a77Slings a probe and counterweight out of the Galaxy past Sgr A*.'],
        ['gtceu.recipe.grindless_hills_slingshot.bound_probe_pair', 'Circuit 1: an intergalactic relay probe bound to a canned counterweight in the capture ring (line P16).'],
        ['gtceu.recipe.grindless_hills_slingshot.launched_ig_probe', 'Circuit 2: the bound pair released at V[MAX] x 16 A; the counterweight falls into the hole and the probe leaves the galaxy launched (line P16).'],
        ['gtceu.recipe.grindless_megabar.dense_counterweight_core', 'Circuit 14: metal-rich bloom and graded Z billets pressed to megabar density into a dense counterweight core (line P15).'],
        ['gtceu.recipe.grindless_nuclear_clock.thorium_nav_clock', 'Circuit 9: nuclear clocks and thorium plates tuned under argon into a thorium navigation clock (line P16).'],
        ['gtceu.recipe.grindless_photonic_foundry.optical_nav_core', 'Circuit 28: sapphire and gold plates written into an optical navigation core under argon (line P16).'],
        ['gtceu.recipe.grindless_warp_gate.hold_tarantula',
            'Hold the Sgr A* ring open at 2^37 EU/t: the launched intergalactic probe, aimed by the horizon lock, is thrown to 30 Doradus; the platform there unfolds on arrival']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
