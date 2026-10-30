// priority: 5138
// Gregtech Grindless - names and tooltips of UEV's Barnard b (startup_scripts/grindless/uev/barnard.js; package UEV-B3):
//
//   block.gtceu.barnard_core_drill, block.gtceu.carbonyl_refinery, gtceu.barnard_core_drilling, gtceu.carbonyl_refining   machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                                                     controller tooltips
//   gtceu.recipe.grindless_carbonyl_refining.<recipe>                                         the EMI line of each refinery recipe
//   emi.grindless.info.<machine>.0                                                            the EMI info page of each controller
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1                                          the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.barnard_core_drill', 'Barnard Core Drill', 'Perforadora de testigos de Barnard'],
        ['block.gtceu.carbonyl_refinery', 'Carbonyl Refinery', 'Refinería de carbonilos'],
        ['gtceu.carbonyl_refining', 'Carbonyl Refining', 'Refinado de carbonilos'],
        ['gtceu.barnard_core_drilling', 'Barnard Core Drilling', 'Perforación de testigos de Barnard'],

        ['grindless.machine.barnard_core_drill.tooltip.0',
            '§7Cores Barnard b\'s crust for Barnard core rock.',
            '§7Extrae testigos de la corteza de Barnard b: roca de testigo de Barnard.'],
        ['grindless.machine.barnard_core_drill.tooltip.1', 'Works on Barnard b only.', 'Solo funciona en Barnard b.'],
        ['emi.grindless.info.barnard_core_drill.1',
            'Cores the metal-rich crust of Barnard b: the only source of Barnard core rock. Works on Barnard b only.',
            'Extrae testigos de la corteza rica en metales de Barnard b: la única fuente de roca de testigo de Barnard. Solo funciona en Barnard b.'],
        ['emi.grindless.info.barnard_core_drill.2',
            'With the gravity survey (kept) and a nanotwinned diamond bit: 8 rock a run. With the bit and circuit 1: a pilot core of 2 rock, to make the first survey. The bit wears 5 % a run.',
            'Con el estudio gravimétrico (se conserva) y una broca de diamante nanomaclado: 8 rocas por ciclo. Con la broca y el circuito 1: un testigo piloto de 2 rocas, para fabricar el primer estudio. La broca se desgasta un 5 % por ciclo.'],
        ['emi.grindless.info.barnard_core_drill.3',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida. Acepta una escotilla de paralelos.'],

        ['grindless.machine.carbonyl_refinery.tooltip.0',
            '§7Mond process: carbon monoxide carries iron out of Barnard rock.',
            '§7Proceso Mond: el monóxido de carbono extrae el hierro de la roca de Barnard.'],
        ['grindless.machine.carbonyl_refinery.tooltip.1', 'Works on Barnard b only.', 'Solo funciona en Barnard b.'],
        ['emi.grindless.info.carbonyl_refinery.1',
            'The Mond process on Barnard rock: carbon monoxide takes the iron as iron pentacarbonyl. Works on Barnard b only.',
            'El proceso Mond sobre la roca de Barnard: el monóxido de carbono se lleva el hierro como pentacarbonilo de hierro. Solo funciona en Barnard b.'],
        ['emi.grindless.info.carbonyl_refinery.2',
            'Circuit 1: rock and 5,000 mB of CO give 1,000 mB of Fe(CO)5, nickel, cobalt and a residue for the platinum plant.',
            'Circuito 1: la roca y 5.000 mB de CO dan 1.000 mB de Fe(CO)5, níquel, cobalto y un residuo para la planta de platino.'],
        ['emi.grindless.info.carbonyl_refinery.3',
            'Parts go in the walls and floor: 1-2 energy hatches, 1-2 input buses, 1 input hatch, 1-2 output buses, 1 output hatch. Accepts a parallel hatch.',
            'Las piezas van en las paredes y el suelo: 1-2 escotillas de energía, 1-2 buses de entrada, 1 escotilla de entrada, 1-2 buses de salida, 1 escotilla de salida. Acepta una escotilla de paralelos.'],

        ['gtceu.recipe.grindless_barnard_core_drilling.pilot_core',
            'A pilot core with the bit alone (circuit 1): 2 rock, enough for the first gravity survey. The bit wears 5 % a run.',
            'Un testigo piloto solo con la broca (circuito 1): 2 rocas, las justas para el primer estudio gravimétrico. La broca se desgasta un 5 % por ciclo.'],
        ['gtceu.recipe.grindless_barnard_core_drilling.core_survey',
            'With the gravity survey (kept): the drill follows the metal-rich seam and brings up 8 rock a run. The bit wears 5 % a run.',
            'Con el estudio gravimétrico (se conserva): la perforadora sigue la veta rica en metales y trae 8 rocas por ciclo. La broca se desgasta un 5 % por ciclo.'],

        ['gtceu.recipe.grindless_carbonyl_refining.mond',
            'The nickel and cobalt carbonyls form and crack inside the vessel and never leave it. The Fe(CO)5 decomposes in the nitride works, which returns the 5,000 mB of CO.',
            'Los carbonilos de níquel y cobalto se forman y se descomponen dentro del recipiente y nunca salen de él. El Fe(CO)5 se descompone en la planta de nitruros, que devuelve los 5.000 mB de CO.'],

        ['emi.grindless.info.barnard_core_drill.0',
            'The deep-core drill of the family, for Barnard b. The pilot core (circuit 1) breaks the loop between the survey, which needs 4 rock, and the rock, which needs the survey.',
            'La perforadora de testigos profundos de la familia, para Barnard b. El testigo piloto (circuito 1) rompe el círculo entre el estudio, que necesita 4 rocas, y la roca, que necesita el estudio.'],
        ['emi.grindless.info.carbonyl_refinery.0',
            'Barnard b only. Its residue (Re, Os, Ir, Pt, W) goes to the platinum plant (circuit 9); the rhenium comes out as ammonium perrhenate, then dust, pellet and ingot.',
            'Solo en Barnard b. Su residuo (Re, Os, Ir, Pt, W) va a la planta de platino (circuito 9); el renio sale como perrenato de amonio, y luego polvo, pellet y lingote.']
    ]

    // [name, en, es, tooltip 0 en, tooltip 0 es, tooltip 1 en, tooltip 1 es]
    var ITEMS = [
        ['barnard_residue', 'Barnard Residue', 'Residuo de Barnard',
            'What the Mond process leaves of Barnard rock: rhenium, osmium, iridium, platinum and tungsten.', 'Lo que el proceso Mond deja de la roca de Barnard: renio, osmio, iridio, platino y wolframio.',
            'Digested in the platinum plant (circuit 9).', 'Se digiere en la planta de platino (circuito 9).'],
        ['crude_ammonium_perrhenate', 'Crude Ammonium Perrhenate', 'Perrenato de amonio crudo',
            'Rhenium taken up from the digest, still carrying chloride.', 'Renio recogido del digerido, aún con cloruro.',
            'Recrystallised in a chemical reactor.', 'Se recristaliza en un reactor químico.'],
        ['ammonium_perrhenate', 'Ammonium Perrhenate', 'Perrenato de amonio',
            'The salt in which rhenium is sold and shipped.', 'La sal en la que se vende y se transporta el renio.',
            'Reduced with hydrogen to rhenium dust.', 'Se reduce con hidrógeno hasta polvo de renio.'],
        ['rhenium_pellet', 'Rhenium Pellet', 'Pellet de renio',
            'Rhenium powder pressed so it can be sintered.', 'Polvo de renio prensado para poder sinterizarlo.',
            'Sintered to an ingot in an electric furnace.', 'Se sinteriza hasta un lingote en un horno eléctrico.']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1], i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[3], i[4]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[5], i[6]])
    })

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
