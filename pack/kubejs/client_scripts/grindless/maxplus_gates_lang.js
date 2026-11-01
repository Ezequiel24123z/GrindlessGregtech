// priority: 6825
// Gregtech Grindless - names of MAX+'s second-hop gate rows (data/grindless/tables/gate.json c17 to c19; package XP-T2):
//
//   gtceu.recipe.grindless_warp_gate.<name>   the EMI line of each row
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_warp_gate.hold_magellanic_stream',
            'Hold the 30 Doradus ring open at 2^37 EU/t: an intergalactic relay probe is thrown to the Magellanic Stream; the platform there unfolds on arrival',
            'Mantener abierto el anillo de 30 Doradus a 2^37 EU/t: una sonda de relevo intergal\u00e1ctica sale hacia la Corriente de Magallanes; al llegar se despliega la plataforma all\u00ed'],
        ['gtceu.recipe.grindless_warp_gate.hold_m31_nucleus',
            'Hold the 30 Doradus ring open at 2^37 EU/t: an intergalactic relay probe is thrown to the nucleus of M31; the platform there unfolds on arrival',
            'Mantener abierto el anillo de 30 Doradus a 2^37 EU/t: una sonda de relevo intergal\u00e1ctica sale hacia el n\u00facleo de M31; al llegar se despliega la plataforma all\u00ed'],
        ['gtceu.recipe.grindless_warp_gate.hold_local_group_filament',
            'Hold the M31 nucleus ring open at 2^37 EU/t: an intergalactic relay probe is thrown to the Local Group filament; the platform there unfolds on arrival',
            'Mantener abierto el anillo del n\u00facleo de M31 a 2^37 EU/t: una sonda de relevo intergal\u00e1ctica sale hacia el filamento del Grupo Local; al llegar se despliega la plataforma all\u00ed']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
