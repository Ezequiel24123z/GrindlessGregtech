// priority: 6830
// Gregtech Grindless - names and tooltips of MAX+'s Hyperfactory and parallel hatch (startup_scripts/grindless/maxplus/hyperfactory.js and
// lib/parallel_hatch.js; package XP-M1). The EMI info keys are here: the shared emi_info_lang.js and the additions json are the integrator's.
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.hyperfactory', 'Hyperfactory', 'Hiperf\u00e1brica'],
        ['block.gtceu.hyperfactory', 'Hyperfactory', 'Hiperf\u00e1brica'],
        ['grindless.machine.hyperfactory.tooltip.0', '\u00a77Assembler, circuit assembler, assembly line, forming press and laser engraver in one, up to 4,096 copies per hatch step.', '\u00a77Ensambladora, ensambladora de circuitos, l\u00ednea de ensamblaje, prensa de formado y grabadora l\u00e1ser en una, hasta 4.096 copias por paso de la escotilla.'],
        ['block.gtceu.max_maxplus_parallel_hatch', 'MAX+ Parallel Control Hatch', 'Escotilla de control paralelo MAX+'],
        ['grindless.machine.maxplus_parallel_hatch.tooltip', '\u00a77Sets the parallels of a recipe: up to 4,194,304 copies at once.', '\u00a77Fija los paralelos de una receta: hasta 4.194.304 copias a la vez.'],
        ['emi.grindless.info.hyperfactory.0', 'The top of the mega family: five machines in one, at 4,096 times the parallel hatch.', 'La cima de la familia mega: cinco m\u00e1quinas en una, a 4.096 veces la escotilla paralela.'],
        ['emi.grindless.info.hyperfactory.1', 'It needs one MAX+ parallel hatch and a 1,024 A MAX+ energy hatch; the copies are cut by the voltage, never by an overflow.', 'Necesita una escotilla paralela MAX+ y una escotilla de energ\u00eda MAX+ de 1.024 A; la tensi\u00f3n limita las copias, nunca un desbordamiento.'],
        ['emi.grindless.info.max_maxplus_parallel_hatch.0', 'Up to 4,194,304 parallel copies (4^11). The Hyperfactory takes it as its parallel hatch.', 'Hasta 4.194.304 copias paralelas (4^11). La Hiperf\u00e1brica la usa como escotilla paralela.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
