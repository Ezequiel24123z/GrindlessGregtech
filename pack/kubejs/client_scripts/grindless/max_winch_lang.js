// priority: 6534
// Gregtech Grindless - names and tooltips of MAX's Geroch winch (startup_scripts/grindless/max/winch.js; package MAX-D3):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each older row of the package
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.geroch_winch', 'Geroch Winch'],
        ['gtceu.geroch_power', 'Geroch Power'],
        ['grindless.machine.geroch_winch.tooltip.0', '\u00a77Lowers a waste canister on a tether to the horizon.'],
        ['emi.grindless.info.geroch_winch.0', 'A box lowered on a rope towards the horizon gives up almost all its rest energy as work at the top (the Geroch process). Circuit 1 lowers one geroch canister and gives 2^30 EU/t for 2,400 ticks; the canister crosses the horizon, and the tether wears: now and then a worn tether segment comes back.'],
        ['emi.grindless.info.geroch_winch.1', 'A worn tether segment is rebuilt into a horizon tether in an assembler. The canister comes from waste retrieval, the hot cell and a canner; the tether from the tether ribbon works and the stellar elevator. It runs only in orbit around Sgr A*.'],
        ['emi.grindless.info.geroch_drum_casing.0', 'A structure block: the drum casing of the Geroch winch tower. Made in the assembler.'],
        ['gtceu.recipe.grindless_geroch_power.geroch_canister_lowering', 'Circuit 1: a canister is lowered through the horizon; a worn tether segment comes back with chance 1/128.'],
        ['gtceu.recipe.grindless_decay_heat.waste_cooling', 'Circuit 5: retrieved waste mix sits in the vault until its short-lived heat has decayed.'],
        ['gtceu.recipe.grindless_hot_cell.vitrified_waste_log', 'Circuit 23: cooled waste mix is cast into a glass log behind the shield.'],
        ['gtceu.recipe.grindless_star_lifting.proof_load_ribbon', 'Circuit 3: a strand ribbon is hung in the plasma column and proof-loaded; 100 mB of plasma is consumed.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
