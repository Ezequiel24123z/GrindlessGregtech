// priority: 6927
// Gregtech Grindless - names and tooltips of MAX+'s hyper assembly array, the Hyperstargate's parts and the creative-item stand-ins
// (startup_scripts/grindless/maxplus/grid.js; package XP-H4a). Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js
// scripts. English only; es_es copies the English text until EN-1 removes it.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.grindless.hyperstargate_ring_block', 'Hyperstargate Ring Block'],
        ['block.grindless.hyperstargate_chevron_block', 'Hyperstargate Chevron Block'],
        ['block.grindless.hyperstargate_locked_chevron', 'Hyperstargate Locked Chevron'],
        ['block.grindless.hyperstargate_power_unit', 'Hyperstargate Power Unit'],
        ['block.grindless.horizon_iris', 'Horizon Iris'],
        ['block.grindless.hyperstargate_base', 'Hyperstargate Base'],
        ['item.grindless.hyperstargate_chevron_upgrade', 'Hyperstargate Chevron Upgrade'],
        ['item.grindless.hyperstargate_interface', 'Hyperstargate Interface'],
        ['item.grindless.creative_energy', 'Creative Energy Source (Ingredient)'],
        ['item.grindless.creative_chest', 'Creative Chest (Ingredient)'],
        ['item.grindless.creative_tank', 'Creative Tank (Ingredient)'],
        ['item.grindless.creative_computation_provider', 'Creative Computation Provider (Ingredient)'],
        ['item.grindless.creative_data_access_hatch', 'Creative Data Access Hatch (Ingredient)'],
        ['item.grindless.creative_energy_cell', 'Creative Energy Cell (Ingredient)']
    ]
    ;['en_us', 'es_es'].forEach(function (lang) {
        ClientEvents.lang(lang, function (e) {
            ENTRIES.forEach(function (x) { e.add('grindless', x[0], x[1]) })
        })
    })
})()
