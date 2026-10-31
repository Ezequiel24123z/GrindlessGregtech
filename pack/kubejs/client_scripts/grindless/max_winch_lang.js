// Gregtech Grindless - names and tooltips of MAX's Geroch winch (startup_scripts/grindless/max/winch.js; package MAX-D3):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each older row of the package
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_decay_heat.waste_cooling', 'Circuit 5: retrieved waste mix sits in the vault until its short-lived heat has decayed.', 'Circuito 5: la mezcla de residuos recuperada reposa en la b\u00f3veda hasta que su calor de vida corta se desintegra.'],
        ['gtceu.recipe.grindless_hot_cell.vitrified_waste_log', 'Circuit 23: cooled waste mix is cast into a glass log behind the shield.', 'Circuito 23: la mezcla de residuos enfriada se moldea en un tronco de vidrio tras el blindaje.'],
        ['gtceu.recipe.grindless_star_lifting.proof_load_ribbon', 'Circuit 3: a strand ribbon is hung in the plasma column and proof-loaded; 100 mB of plasma is consumed.', 'Circuito 3: una cinta de hilos se cuelga en la columna de plasma y se prueba con carga; se consumen 100 mB de plasma.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
