// priority: 5185
// Gregtech Grindless - shared multiblock tooltip lines (tier parity, docs/research/tier-parity.md TP-D5).
//
// A controller tooltip is at most 4 lines: grindless.machine.<id>.tooltip.0 (gray, what it does), then feature lines from GTM's keys
// (recipe types, parallelizable, max parallel, perfect overclock) or the grindless.tooltip.* keys below. Details go to the EMI info page.
// GTM 7.5.3 ships no es_es, so the GTM keys the standard uses get their Spanish text here; their English is GTM's own text.
(function () {
    // [namespace, key, en, es]
    var ENTRIES = [
        ['grindless', 'grindless.tooltip.laser', 'Accepts laser target hatches.', 'Acepta escotillas láser de destino.'],
        ['grindless', 'grindless.tooltip.wireless', 'Accepts wireless energy hatches.', 'Acepta escotillas de energía inalámbrica.'],
        // site-bound machines form anywhere; their recipes run only at the site (the recipe's dimension condition)
        ['grindless', 'grindless.tooltip.site', 'Works only at %s.', 'Solo funciona en %s.'],
        ['grindless', 'grindless.tooltip.steam', 'Runs on steam, recipes up to %s EU/t.', 'Funciona con vapor, recetas hasta %s EU/t.'],

        ['gtceu', 'gtceu.machine.available_recipe_map_1.tooltip', 'Available Recipe Types: %s', 'Tipos de receta: %s'],
        ['gtceu', 'gtceu.machine.available_recipe_map_2.tooltip', 'Available Recipe Types: %s, %s', 'Tipos de receta: %s, %s'],
        ['gtceu', 'gtceu.machine.available_recipe_map_3.tooltip', 'Available Recipe Types: %s, %s, %s', 'Tipos de receta: %s, %s, %s'],
        ['gtceu', 'gtceu.machine.available_recipe_map_4.tooltip', 'Available Recipe Types: %s, %s, %s, %s', 'Tipos de receta: %s, %s, %s, %s'],
        ['gtceu', 'gtceu.multiblock.parallelizable.tooltip', 'Can parallelize with Parallel Control Hatches.', 'Admite escotillas de control de paralelos.'],
        ['gtceu', 'gtceu.machine.perfect_oc', 'Does not lose energy efficiency when overclocked.', 'No pierde eficiencia energética al hacer overclock.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add(e[0], e[1], e[2 + li])
            })
        })
    })
})()
