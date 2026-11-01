// priority: 6828
// Gregtech Grindless - names and tooltips of MAX+'s void crystal fab (startup_scripts/grindless/maxplus/void_fab.js; package XP-B4):
//
//   gtceu.recipe.grindless_<type>.<recipe>   the EMI line of each keyed row of the package: the fab's row and the P14 step on the femto writer
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. English only: es_es copies en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['gtceu.void_crystal_fab', 'Void Crystal Fab'],
        ['block.gtceu.void_crystal_fab', 'Void Crystal Fab'],
        ['grindless.machine.void_crystal_fab.tooltip.0', '\u00a77Grows crystal in the emptiness of the Local Group filament.'],
        ['gtceu.recipe.grindless_void_crystal_fab.void_grown_diamond', 'Circuit 1: a C12 seed plate grown into void-grown diamond under methane and hydrogen in the filament (line P14).'],
        ['gtceu.recipe.grindless_femtosecond_writing.void_crystal_lattice', 'Circuit 13: NV-engineered diamond written into a void crystal lattice under helium (line P14).']
    ]

    ;['en_us', 'es_es'].forEach(function (lang) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1])
            })
        })
    })
})()
