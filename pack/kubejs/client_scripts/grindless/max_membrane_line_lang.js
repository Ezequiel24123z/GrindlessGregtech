// priority: 6610
// Gregtech Grindless - names and EMI lines of MAX-B1 (the membrane line, machine 3, and its feeder rows on older machines, lines L2, L3, L11 and L34):
//
//   block.gtceu.membrane_line                         the controller's name
//   gtceu.membrane_rolling                            the recipe type
//   grindless.machine.membrane_line.tooltip.0         the controller's tooltip
//   emi.grindless.info.membrane_line.<n>              the info page
//   gtceu.recipe.<dataKey>.<recipe>                   the EMI line of each recipe
//
// Same format as max_components_lang.js. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.membrane_line', 'Membrane Line', 'L\u00ednea de membranas'],
        ['gtceu.membrane_rolling', 'Membrane Rolling', 'Laminado de membranas'],
        ['grindless.machine.membrane_line.tooltip.0', '\u00a77Rolls membrane, albedo panel and belt in one line.',
            '\u00a77Lamina membrana, panel de alb\u00e9do y correa en una l\u00ednea.'],
        ['emi.grindless.info.membrane_line.0', 'The Membrane Line unwinds a web through an 21-block roller train: coating, etching, calendering and winding without a break.',
            'La L\u00ednea de membranas desenrolla una banda por un tren de rodillos de 21 bloques: recubrimiento, grabado, calandrado y bobinado sin pausa.'],
        ['emi.grindless.info.membrane_line.1', 'Circuit 1: superconducting membrane. Circuit 2: albedo multilayer panel. Circuit 3: membrane belt. Scrap goes to the macerator for carbon.',
            'Circuito 1: membrana superconductora. Circuito 2: panel multicapa de alb\u00e9do. Circuito 3: correa de membrana. La chatarra va al triturador para obtener carbono.'],
        ['emi.grindless.info.membrane_roller_casing.0', 'A structure block: a roller wall of the Membrane Line. It builds the 21-block roller train. Made in the assembler.',
            'Un bloque de estructura: una pared de rodillos de la l\u00ednea de membranas. Construye el tren de rodillos de 21 bloques. Se fabrica en el ensamblador.'],
        ['gtceu.recipe.grindless_membrane_rolling.superconducting_membrane', 'Circuit 1: pinned REBCO web and graphene film rolled and etched into the superconducting membrane',
            'Circuito 1: banda de REBCO anclada y pel\u00edcula de grafeno laminadas y grabadas en la membrana superconductora'],
        ['gtceu.recipe.grindless_membrane_rolling.albedo_multilayer_panel', 'Circuit 2: HfO2/SiO2 stacks and silver foil rolled into the albedo panel',
            'Circuito 2: pilas de HfO2/SiO2 y l\u00e1mina de plata laminadas en el panel de alb\u00e9do'],
        ['gtceu.recipe.grindless_membrane_rolling.membrane_belt', 'Circuit 3: cryo-conditioned web and horizon strand wire wound into the membrane belt',
            'Circuito 3: banda criocondicionada y cable de hebra de horizonte bobinados en la correa de membrana'],
        ['gtceu.recipe.grindless_vdw_stacking.graphene_hbn_film', 'Circuit 5: graphene grown on electropolished Cu(111) and capped with hBN flakes',
            'Circuito 5: grafeno crecido sobre Cu(111) electropulido y cubierto con escamas de hBN'],
        ['gtceu.recipe.grindless_mtj_sputtering.hfo2_sio2_stack', 'Circuit 15: HfO2 and SiO2 sputtered into an alternating stack',
            'Circuito 15: HfO2 y SiO2 pulverizados en una pila alterna'],
        ['gtceu.recipe.grindless_coated_conductor.rebco_on_pbo_web', 'Circuit 6: ITBTC coated conductor laid on the buffered PBO web',
            'Circuito 6: conductor recubierto ITBTC sobre la banda de PBO con capa tamp\u00f3n'],
        ['gtceu.recipe.grindless_magnet_winding.pinned_rebco_web', 'Circuit 12: the REBCO web trained and pinned',
            'Circuito 12: la banda de REBCO entrenada y anclada'],
        ['gtceu.recipe.grindless_electron_beam.hafnia_target', 'Circuit 30: hafnia powder fused into a sputtering target',
            'Circuito 30: polvo de hafnia fundido en un blanco de pulverizaci\u00f3n'],
        ['gtceu.recipe.grindless_electron_beam.refractory_wear_coat', 'Circuit 31: tungsten carbide fused onto the primed belt web',
            'Circuito 31: carburo de wolframio fundido sobre la banda imprimada'],
        ['gtceu.recipe.grindless_single_crystal_casting.cu111_foil', 'Circuit 26: rolled copper foil recrystallised into a Cu(111) single crystal',
            'Circuito 26: l\u00e1mina de cobre laminada recristalizada en un monocristal de Cu(111)']
    ];
    ['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1 + li]); });
        });
    });
})();
