// priority: 6554
// Gregtech Grindless - the EMI lines of MAX-A0's two draw rows (tables/vela_pasta.json, pasta_drawing c5 and c6, run at SGR 1806-20). The items and
// the horizon strand material are named by F1. Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts.
(function () {
    // key, text
    var RECIPES = [
        ['gtceu.recipe.grindless_pasta_drawing.horizon_strand_preform', 'Circuit 5: a clad chain strand drawn once into a horizon strand preform'],
        ['gtceu.recipe.grindless_pasta_drawing.horizon_wire_drawing', 'Circuit 6: a horizon strand preform drawn into four wires'],
        ['gtceu.recipe.grindless_pasta_drawing.horizon_ingot_drawing', 'Circuit 7: a horizon strand preform drawn into two ingots']
    ]

    ClientEvents.lang('en_us', function (event) {
        RECIPES.forEach(function (e) { event.add('grindless', e[0], e[1]) })
    })
})()
