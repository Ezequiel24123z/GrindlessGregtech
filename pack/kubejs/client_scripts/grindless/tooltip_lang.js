// priority: 5185
// Gregtech Grindless - shared multiblock tooltip lines (tier parity, docs/research/tier-parity.md TP-D5).
//
// A controller tooltip is at most 4 lines: grindless.machine.<id>.tooltip.0 (gray, what it does), then feature lines from GTM's keys
// (recipe types, parallelizable, max parallel, perfect overclock) or the grindless.tooltip.* keys below. Details go to the EMI info page.
(function () {
    // [namespace, key, text]
    var ENTRIES = [
        ['grindless', 'grindless.tooltip.laser', 'Accepts laser target hatches.'],
        ['grindless', 'grindless.tooltip.wireless', 'Accepts wireless energy hatches.'],
        // site-bound machines form anywhere; their recipes run only at the site (the recipe's dimension condition)
        ['grindless', 'grindless.tooltip.site', 'Works only at %s.'],
        ['grindless', 'grindless.tooltip.steam', 'Runs on steam, recipes up to %s EU/t.'],

        ['gtceu', 'gtceu.machine.available_recipe_map_1.tooltip', 'Available Recipe Types: %s'],
        ['gtceu', 'gtceu.machine.available_recipe_map_2.tooltip', 'Available Recipe Types: %s, %s'],
        ['gtceu', 'gtceu.machine.available_recipe_map_3.tooltip', 'Available Recipe Types: %s, %s, %s'],
        ['gtceu', 'gtceu.machine.available_recipe_map_4.tooltip', 'Available Recipe Types: %s, %s, %s, %s'],
        ['gtceu', 'gtceu.multiblock.parallelizable.tooltip', 'Can parallelize with Parallel Control Hatches.'],
        ['gtceu', 'gtceu.machine.perfect_oc', 'Does not lose energy efficiency when overclocked.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add(e[0], e[1], e[2])
        })
    })
})()
