// Gregtech Grindless - names, tooltip and EMI info page of OpV's assembly line array
// (startup_scripts/grindless/opv/assembly_line_array.js; package OpV-M2):
//
//   block.gtceu.assembly_line_array                    machine name
//   grindless.machine.assembly_line_array.tooltip.N    controller tooltip
//   emi.grindless.info.assembly_line_array.N           the EMI info page of the controller
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.assembly_line_array', 'Assembly Line Array', 'Matriz de líneas de ensamblaje'],

        ['grindless.machine.assembly_line_array.tooltip.0',
            '\u00a77Four assembly tracks under one gantry: runs assembly line recipes in bulk.',
            '\u00a77Cuatro pistas bajo un pórtico: recetas de línea de ensamblaje en masa.'],

        ['emi.grindless.info.assembly_line_array.0',
            'It runs the assembly line\'s own recipes, with their research and ordered inputs, and has no recipes of its own. One input bus per slice along the line, in order; a data access hatch holds the research.',
            'Ejecuta las recetas propias de la línea de ensamblaje, con su investigación y sus entradas ordenadas, y no tiene recetas propias. Una bandeja de entrada por sección a lo largo de la línea, en orden; una escotilla de acceso a datos guarda la investigación.'],
        ['emi.grindless.info.assembly_line_array.1',
            'Copies: as many as the energy allows, times the parallel hatch\'s (up to x262,144 with the OpV one). Every copy pays its full EU/t. It overclocks perfectly and batches.',
            'Copias: tantas como permite la energía, por las de la escotilla de paralelos (hasta x262.144 con la de OpV). Cada copia paga su EU/t completo. Hace sobrecarga perfecta y por lotes.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
