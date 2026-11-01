// priority: 6932
// Gregtech Grindless - names of MAX+'s second-hop gate rows (data/grindless/tables/gate.json c17 to c19; package XP-T2):
//
//   gtceu.recipe.grindless_warp_gate.<name>   the EMI line of each row
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es (es_es carries the English text until the EN-1 cleanup).
(function () {
    // [key, en]
    var ENTRIES = [
        ['gtceu.recipe.grindless_warp_gate.hold_magellanic_stream',
            'Hold the 30 Doradus ring open at 2^37 EU/t: an intergalactic relay probe is thrown to the Magellanic Stream; the platform there unfolds on arrival'],
        ['gtceu.recipe.grindless_warp_gate.hold_m31_nucleus',
            'Hold the 30 Doradus ring open at 2^37 EU/t: an intergalactic relay probe is thrown to             the nucleus of M31; the platform there unfolds on arrival'],
        ['gtceu.recipe.grindless_warp_gate.hold_local_group_filament',
            'Hold the M31 nucleus ring open at 2^37 EU/t: an intergalactic relay probe is thrown to the             Local Group filament; the platform there unfolds on arrival']
                ]

    ;['en_us', 'es_es'].forEach(function (lang) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1])
            })
        })
    })
})()
