// priority: 5170
// Gregtech Grindless - names and tooltips of UEV's Sirius B machines (startup_scripts/grindless/uev/sirius.js; package UEV-B4):
//
//   block.gtceu.<machine>, gtceu.<type>                                machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                              controller tooltips
//   gtceu.recipe.<dataKey>.<recipe>                                    the EMI line of each recipe
//   emi.grindless.info.<key>.N                                         the EMI info pages (the named fiction of degenerate matter included)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.white_dwarf_spectrograph', 'White Dwarf Spectrograph', 'Espectrógrafo de enana blanca'],
        ['block.gtceu.degenerate_harvester', 'Degenerate Harvester', 'Cosechadora de materia degenerada'],
        ['block.gtceu.containment_works', 'Containment Works', 'Obra de contención'],
        ['gtceu.gravitational_redshift', 'Gravitational Redshift', 'Corrimiento al rojo gravitacional'],
        ['gtceu.degenerate_harvesting', 'Degenerate Harvesting', 'Cosecha de materia degenerada'],
        ['gtceu.degenerate_containment', 'Degenerate Containment', 'Contención de materia degenerada'],

        ['grindless.machine.white_dwarf_spectrograph.tooltip.0',
            'Reads the redshift of Sirius B\'s light to weigh the star: the mass-radius chart. Works in Sirius B orbit only.',
            'Lee el corrimiento al rojo de la luz de Sirio B para pesar la estrella: la carta masa-radio. Solo funciona en la órbita de Sirio B.'],
        ['grindless.machine.white_dwarf_spectrograph.tooltip.1',
            'Circuit 1: a ULE cavity and 2 SNSPDs, with the nuclear clock kept as the frequency reference. The clock is never consumed.',
            'Circuito 1: una cavidad ULE y 2 SNSPD, con el reloj nuclear como referencia de frecuencia, que se conserva. El reloj nunca se consume.'],
        ['grindless.machine.white_dwarf_spectrograph.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida. Acepta una escotilla de paralelos.'],

        ['grindless.machine.degenerate_harvester.tooltip.0',
            'Takes degenerate matter from Sirius B following the equation-of-state model, with the mass-radius chart as the guide. Works in Sirius B orbit only.',
            'Toma materia degenerada de Sirio B siguiendo el modelo de ecuación de estado, con la carta masa-radio como guía. Solo funciona en la órbita de Sirio B.'],
        ['grindless.machine.degenerate_harvester.tooltip.1',
            'Circuit 1: consumes the EOS model, keeps the chart and 1,000 mB of liquid helium as the cold loop. Gives 1 degenerate matter, which must be contained at once.',
            'Circuito 1: consume el modelo EOS, conserva la carta y 1.000 mB de helio líquido como circuito frío. Da 1 materia degenerada, que hay que contener de inmediato.'],
        ['grindless.machine.degenerate_harvester.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1 input hatch, 1-2 output buses. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1 escotilla de entrada, 1-2 buses de salida. Acepta una escotilla de paralelos.'],

        ['grindless.machine.containment_works.tooltip.0',
            'Seals degenerate matter in a stasis field into a pellet that can be carried. Works in Sirius B orbit only.',
            'Sella la materia degenerada en un campo de estasis dentro de un pellet que se puede transportar. Solo funciona en la órbita de Sirio B.'],
        ['grindless.machine.containment_works.tooltip.1',
            'Circuit 1: 1 degenerate matter and 1 exotic matter cell (the Casimir array\'s stasis field) give 1 degenerate pellet. Nothing is released.',
            'Circuito 1: 1 materia degenerada y 1 celda de materia exótica (el campo de estasis de la matriz de Casimir) dan 1 pellet degenerado. No se libera nada.'],
        ['grindless.machine.containment_works.tooltip.2',
            'Parts go in the bottom layer: 1-2 energy hatches, 1-2 input buses, 1-2 output buses. Accepts a parallel hatch.',
            'Las piezas van en la capa inferior: 1-2 escotillas de energía, 1-2 buses de entrada, 1-2 buses de salida. Acepta una escotilla de paralelos.'],

        ['gtceu.recipe.grindless_gravitational_redshift.mass_radius_chart',
            'The nuclear clock (kept) times the redshift against the ULE cavity; the SNSPDs count the photons. The chart gives the star\'s mass at its radius.',
            'El reloj nuclear (se conserva) mide el corrimiento al rojo contra la cavidad ULE; los SNSPD cuentan los fotones. La carta da la masa de la estrella para su radio.'],
        ['gtceu.recipe.grindless_degenerate_harvesting.degenerate_matter',
            'The EOS model is spent, the chart (kept) says where the matter is dense enough, and the helium loop (kept) carries the heat away. The matter leaves as one contained unit.',
            'El modelo EOS se gasta, la carta (se conserva) dice dónde la materia es lo bastante densa, y el circuito de helio (se conserva) se lleva el calor. La materia sale como una unidad contenida.'],
        ['gtceu.recipe.grindless_degenerate_containment.degenerate_pellet',
            'The matter and the stasis-field cell are sealed together; the cell is the pellet\'s shell. The pellet goes to the UEV field generator and the Sirius warp gate.',
            'La materia y la celda del campo de estasis se sellan juntas; la celda es la cáscara del pellet. El pellet va al generador de campo UEV y a la puerta de salto de Sirio.'],

        ['emi.grindless.info.sirius_fiction.0',
            'Degenerate matter is named fiction, like the Casimir array\'s exotic matter: the pack gives the label to a step, it claims no physics.',
            'La materia degenerada es ficción con nombre, como la materia exótica de la matriz de Casimir: el pack da la etiqueta a un paso, no afirma ninguna física.'],
        ['emi.grindless.info.sirius_fiction.1',
            'It exists only in Sirius B orbit, comes out of the harvester (consuming the EOS model, keeping the chart) and is sealed at once into a pellet in the containment works. Nothing is voided and nothing escapes.',
            'Solo existe en la órbita de Sirio B, sale de la cosechadora (consume el modelo EOS, conserva la carta) y se sella de inmediato en un pellet en la obra de contención. No se vacía nada y nada escapa.'],
        ['emi.grindless.info.white_dwarf_spectrograph.0',
            'The mass-radius chart is made only in Sirius B orbit. It is the harvester\'s kept catalyst and is never consumed.',
            'La carta masa-radio solo se fabrica en la órbita de Sirio B. Es el catalizador que se conserva en la cosechadora y nunca se consume.'],
        ['emi.grindless.info.containment_works.0',
            'The pellet is the core of the UEV field generator (assembler, with a pump rotor of single-crystal rhenium alloy) and the seed of the Sirius warp gate.',
            'El pellet es el núcleo del generador de campo UEV (ensamblador, con un rotor de bomba de aleación monocristalina de renio) y la semilla de la puerta de salto de Sirio.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
