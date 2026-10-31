// priority: 6537
// Gregtech Grindless - names and tooltips of MAX's Geroch winch (startup_scripts/grindless/max/winch.js; package MAX-D3):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each older row of the package
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.geroch_winch', 'Geroch Winch', 'Cabrestante de Geroch'],
        ['gtceu.geroch_power', 'Geroch Power', 'Energ\u00eda de Geroch'],
        ['grindless.machine.geroch_winch.tooltip.0', '\u00a77Lowers a waste canister on a tether to the horizon.', '\u00a77Baja un bid\u00f3n de residuos con un cable al horizonte.'],
        ['emi.grindless.info.geroch_winch.0', 'A box lowered on a rope towards the horizon gives up almost all its rest energy as work at the top (the Geroch process). Circuit 1 lowers one geroch canister and gives 2^30 EU/t for 2,400 ticks; the canister crosses the horizon, and the tether wears: now and then a worn tether segment comes back.', 'Una caja bajada con una cuerda hacia el horizonte cede casi toda su energ\u00eda en reposo como trabajo arriba (el proceso de Geroch). El circuito 1 baja un bid\u00f3n de Geroch y da 2^30 EU/t durante 2.400 ticks; el bid\u00f3n cruza el horizonte y el cable se desgasta: de vez en cuando vuelve un segmento de cable gastado.'],
        ['emi.grindless.info.geroch_winch.1', 'A worn tether segment is rebuilt into a horizon tether in an assembler. The canister comes from waste retrieval, the hot cell and a canner; the tether from the tether ribbon works and the stellar elevator. It runs only in orbit around Sgr A*.', 'Un segmento de cable gastado se reconstruye en un cable de horizonte en un ensamblador. El bid\u00f3n viene de la recuperaci\u00f3n de residuos, la celda caliente y una enlatadora; el cable, de la fabrica de cintas y el ascensor estelar. Solo funciona en \u00f3rbita de Sgr A*.'],
        ['emi.grindless.info.geroch_drum_casing.0', 'A structure block: the drum casing of the Geroch winch tower. Its assembler recipe is written by the MAX casing pass (QR-MAX).', 'Un bloque de estructura: la carcasa de tambor de la torre del cabrestante de Geroch. Su receta de ensamblador la escribe el paso de carcasas MAX (QR-MAX).'],
        ['gtceu.recipe.grindless_geroch_power.geroch_canister_lowering', 'Circuit 1: a canister is lowered through the horizon; a worn tether segment comes back with chance 1/128.', 'Circuito 1: un bid\u00f3n se baja a trav\u00e9s del horizonte; un segmento de cable gastado vuelve con probabilidad 1/128.'],
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
