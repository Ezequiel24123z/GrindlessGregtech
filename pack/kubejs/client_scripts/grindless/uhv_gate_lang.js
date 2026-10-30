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
            '§7A ring gate that carries players between two orbits.',
            '§7Una puerta anular que transporta jugadores entre dos órbitas.'],
        ['grindless.machine.warp_gate.tooltip.1', 'Works in Earth and Proxima b orbit only.', 'Solo funciona en órbita terrestre y de Próxima b.'],

        ['grindless.machine.baseline_astrometer.tooltip.0',
            '§7Measures star distances by parallax; makes the neighbourhood chart.',
            '§7Mide distancias estelares por paralaje y traza la carta estelar.'],
        ['grindless.machine.baseline_astrometer.tooltip.1', 'Works in Proxima b orbit only.', 'Solo funciona en órbita de Próxima b.'],

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
