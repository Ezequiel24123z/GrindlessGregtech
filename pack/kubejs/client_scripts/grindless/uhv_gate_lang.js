// priority: 4550
// Gregtech Grindless - names and tooltips of UHV's gate and edge (startup_scripts/grindless/uhv/gate.js; package UHV-B7):
//
//   block.gtceu.<machine>, gtceu.<recipe type>                    machine and recipe type names
//   grindless.machine.<machine>.tooltip.N                         controller tooltips
//   gtceu.recipe.grindless_<type>.<recipe>                        the EMI line of each recipe
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es (Spanish accents as
// \u escapes). Every item and block these machines use is F1's and already has its name.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.warp_gate', 'Warp Gate', 'Puerta de salto'],
        ['gtceu.warp_gate', 'Warp Gate', 'Puerta de salto'],
        ['block.gtceu.baseline_astrometer', 'Baseline Astrometer', 'Astr\u00f3metro de l\u00ednea base'],
        ['gtceu.baseline_astrometry', 'Baseline Astrometry', 'Astrometr\u00eda de l\u00ednea base'],

        ['grindless.machine.warp_gate.tooltip.0',
            'A ring of casing built at both ends, in Earth orbit and in Proxima b\'s orbit. Open it with exotic matter cells and antihydrogen cartridges (circuit 1): the shells go back to UV\'s antimatter trap and a Proxima gate seed comes out.',
            'Un anillo de carcasa construido en ambos extremos, en la \u00f3rbita de la Tierra y en la de Pr\u00f3xima b. \u00c1brela con celdas de materia ex\u00f3tica y cartuchos de antihidr\u00f3geno (circuito 1): las carcasas vuelven a la trampa de antimateria del UV y sale una semilla de puerta de Pr\u00f3xima.'],
        ['grindless.machine.warp_gate.tooltip.1',
            'Circuit 2 holds it open for a minute (one exotic matter cell, 16 A UHV). While both ends hold, a player standing inside one ring is carried to the centre of the other. Items do not cross: they go by AE2.',
            'El circuito 2 la mantiene abierta un minuto (una celda de materia ex\u00f3tica, 16 A UHV). Mientras ambos extremos aguantan, un jugador dentro de un anillo pasa al centro del otro. Los objetos no cruzan: van por AE2.'],
        ['grindless.machine.warp_gate.tooltip.2',
            'A 15x15x3 ring of warp gate casing round open air; the controller on the front face, six UHV casing mounts on the top row for the modulators, 1-2 input buses, 1-2 output buses and 1-4 energy hatches in the bottom row. Earth and Proxima b orbits only.',
            'Un anillo de 15x15x3 de carcasa de puerta de salto alrededor de aire libre; el controlador en la cara frontal, seis soportes de carcasa UHV en la fila superior para los moduladores, 1-2 buses de entrada, 1-2 de salida y 1-4 escotillas de energ\u00eda en la fila inferior. Solo en las \u00f3rbitas de la Tierra y de Pr\u00f3xima b.'],

        ['grindless.machine.baseline_astrometer.tooltip.0',
            'Two views of the same stars, a long way apart, give their distances. Sgr A*\'s image is the reference; silicon carbide mirrors, ZBLAN fibre, quantum cascade lasers and thin-film modulators make the instrument, and an infrared pigment coats the optics.',
            'Dos vistas de las mismas estrellas, muy separadas, dan sus distancias. La imagen de Sgr A* es la referencia; espejos de carburo de silicio, fibra ZBLAN, l\u00e1seres de cascada cu\u00e1ntica y moduladores de pel\u00edcula fina forman el instrumento, y un pigmento infrarrojo recubre la \u00f3ptica.'],
        ['grindless.machine.baseline_astrometer.tooltip.1',
            'Proxima b\'s orbit only: the baseline is the trip. The image and the organoid processor are kept; the pigment is used up. The only source of the stellar neighbourhood chart, which is the research of the UEV machine casing.',
            'Solo en la \u00f3rbita de Pr\u00f3xima b: la l\u00ednea base es el viaje. La imagen y el procesador de organoides se conservan; el pigmento se gasta. La \u00fanica fuente del mapa del vecindario estelar, que es la investigaci\u00f3n de la carcasa de m\u00e1quina UEV.'],
        ['grindless.machine.baseline_astrometer.tooltip.2',
            'A 7x5x7 station truss deck and roof on four stainless steel frame posts round a tungstensteel gearbox dish drive; 1-2 input buses, an output bus and 1-2 energy hatches in the deck.',
            'Una cubierta y un techo de armaz\u00f3n de estaci\u00f3n de 7x5x7 sobre cuatro postes de bastidor de acero inoxidable alrededor de un accionamiento de plato de caja de engranajes de acero de tungsteno; 1-2 buses de entrada, un bus de salida y 1-2 escotillas de energ\u00eda en la cubierta.'],

        ['gtceu.recipe.grindless_warp_gate.open', 'Open the gate: a Proxima gate seed, the cartridge shells back', 'Abrir la puerta: una semilla de puerta de Pr\u00f3xima y las carcasas de cartucho de vuelta'],
        ['gtceu.recipe.grindless_warp_gate.sustain', 'Hold the gate open for a minute of transit', 'Mantener la puerta abierta un minuto de tr\u00e1nsito'],
        ['gtceu.recipe.grindless_baseline_astrometry.stellar_neighbourhood_chart', 'Chart the stellar neighbourhood from the baseline', 'Cartografiar el vecindario estelar desde la l\u00ednea base'],

        ['emi.grindless.info.warp_gate_casing.0',
            'A structure block: a neutronium ring segment wound with MgB2 wire to hold the exotic matter field, made in the Assembler (circuit 6). It builds the Warp Gate\'s 15x15x3 ring, once in Earth orbit and once in Proxima b\'s orbit.',
            'Un bloque de estructura: un segmento de anillo de neutronio bobinado con hilo de MgB2 para contener el campo de materia ex\u00f3tica, hecho en el ensamblador (circuito 6). Construye el anillo de 15x15x3 de la puerta de salto, una vez en la \u00f3rbita de la Tierra y otra en la de Pr\u00f3xima b.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
