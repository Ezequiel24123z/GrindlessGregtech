// priority: 1469
// Gregtech Grindless - name, tooltips and info page of UXV's stellar fractionation hall (startup_scripts/grindless/uxv/stellar_fractionation_hall.js; package UXV-M2):
//
//   block.gtceu.stellar_fractionation_hall             machine name
//   grindless.machine.stellar_fractionation_hall.tooltip.N   controller tooltips
//   emi.grindless.info.stellar_fractionation_hall.N    the EMI info page of the controller
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['block.gtceu.stellar_fractionation_hall', 'Stellar Fractionation Hall', 'Sala de fraccionamiento estelar'],

        ['grindless.machine.stellar_fractionation_hall.tooltip.0',
            'Two fractionating columns on a reboiler plinth, lying on its side. It runs the distillation tower and the distillery, one mode at a time: pick the mode in the controller.',
            'Dos columnas de fraccionamiento sobre un zócalo de calderín, tumbadas de lado. Ejecuta la torre de destilación y la destilería, un modo a la vez: elige el modo en el controlador.'],
        ['grindless.machine.stellar_fractionation_hall.tooltip.1',
            'Up to 4,096 recipes at once; with a parallel hatch, 4,096 times its parallel. Every copy pays its full EU/t, there is no discount, and it overclocks without losing energy.',
            'Hasta 4096 recetas a la vez; con una escotilla de paralelos, 4096 veces su paralelo. Cada copia paga su EU/t completo, no hay descuento, y hace overclock sin perder energía.'],
        ['grindless.machine.stellar_fractionation_hall.tooltip.2',
            'Each distinct output fluid needs its own output hatch: up to 12 on the outer faces of the columns.',
            'Cada fluido de salida distinto necesita su propia escotilla de salida: hasta 12 en las caras exteriores de las columnas.'],
        ['grindless.machine.stellar_fractionation_hall.tooltip.3',
            'Parts go in the two rows beside the controller: 1 maintenance, 1-2 energy hatches, 0-2 input buses, 0-2 output buses, 1-4 input hatches, 0-1 parallel hatch.',
            'Las piezas van en las dos filas junto al controlador: 1 mantenimiento, 1-2 escotillas de energía, 0-2 buses de entrada, 0-2 buses de salida, 1-4 escotillas de entrada, 0-1 escotilla de paralelos.'],

        ['emi.grindless.info.stellar_fractionation_hall.0',
            'It has no recipes of its own: it runs the recipes of the distillation tower and the distillery, in either mode, as many copies at once as its energy hatches carry, up to 4,096 times the parallel of its hatch (a UXV hatch gives 268,435,456 copies).',
            'No tiene recetas propias: ejecuta las recetas de la torre de destilación y de la destilería, en cualquiera de los dos modos, tantas copias a la vez como aguanten sus escotillas de energía, hasta 4096 veces el paralelo de su escotilla (una escotilla UXV da 268.435.456 copias).'],
        ['emi.grindless.info.stellar_fractionation_hall.1',
            'It is 13 blocks wide, 13 high and 25 deep, lying on its side: a reboiler plinth at the front and two columns running to the back, so the whole hall stands anywhere, in any dimension, with no site.',
            'Mide 13 bloques de ancho, 13 de alto y 25 de fondo, tumbada de lado: un zócalo de calderín delante y dos columnas hasta el fondo, así que la sala completa se construye en cualquier lugar y dimensión, sin sitio especial.'],
        ['emi.grindless.info.stellar_fractionation_hall.2',
            'Use it to fractionate whole stellar cuts in one machine: each distinct output fluid needs its own output hatch, up to 12.',
            'Úsala para fraccionar cortes estelares completos en una sola máquina: cada fluido de salida distinto necesita su propia escotilla de salida, hasta 12.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
