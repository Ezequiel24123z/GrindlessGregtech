// priority: 6990
// Gregtech Grindless - names and tooltips of MAX+'s blueshift forge (startup_scripts/grindless/maxplus/blueshift.js; package XP-B3):
//
//   gtceu.recipe.grindless_<type>.<recipe>   the EMI line of each keyed row of the package: the forge's row and the P12, P13 and P24 steps on
//                                            machines whose type carries a data key
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. English only: es_es copies en_us.
(function () {
    var T = {
        forge: 'Circuit 1: enriched molybdenum target hung in a blueshifted photonuclear beam at V[MAX] x 16 A; the tether and the window are each worn 1 run in 32 (line P12).',
        calutron: 'Circuit 30: molybdenum dust separated into an enriched molybdenum target (line P12).',
        elevator: 'Circuit 4: Kerr ribbon proof-loaded in the star lift at Cygnus X-1 (line P13).',
        melter: 'Circuit 24: beryllium pebbles levitation-melted under argon into an ingot (line P24).',
        mtj: 'Circuit 28: beryllium foil sputtered with niobium into a coated window under argon (line P24).'
    }
    // [key, en]
    var ENTRIES = [
        ['gtceu.blueshift_forge', 'Blueshift Forge'],
        ['block.gtceu.blueshift_forge', 'Blueshift Forge'],
        ['grindless.machine.blueshift_forge.tooltip.0', '\u00a77Hangs a target in a blueshifted photonuclear beam at the M31 nucleus.'],
        ['gtceu.recipe.grindless_blueshift_forge.photonuclear_mix', T.forge],
        ['gtceu.recipe.grindless_calutron_separation.enriched_mo_target', T.calutron],
        ['gtceu.recipe.grindless_star_lifting.proof_loaded_kerr_ribbon', T.elevator],
        ['gtceu.recipe.grindless_levitation_melting.be_ingot', T.melter],
        ['gtceu.recipe.grindless_mtj_sputtering.coated_be_window', T.mtj]
    ]

    ;['en_us', 'es_es'].forEach(function (lang) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1])
            })
        })
    })
})()
