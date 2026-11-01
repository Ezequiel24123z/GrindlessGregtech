// priority: 6846
// Gregtech Grindless - names and tooltips of MAX+'s Hyperfactory and parallel hatch (startup_scripts/grindless/maxplus/hyperfactory.js and
// lib/parallel_hatch.js; package XP-M1). The EMI info keys are here: the shared emi_info_lang.js and the additions json are the integrator's.
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.hyperfactory', 'Hyperfactory'],
        ['block.gtceu.hyperfactory', 'Hyperfactory'],
        ['grindless.machine.hyperfactory.tooltip.0', '\u00a77Five assembly machines in one, 4,096x the hatch.'],
        ['block.gtceu.max_maxplus_parallel_hatch', 'MAX+ Parallel Control Hatch'],
        ['grindless.machine.maxplus_parallel_hatch.tooltip', '\u00a77Sets the parallels of a recipe: up to 4,194,304 copies at once.'],
        ['emi.grindless.info.hyperfactory.0', 'The top of the mega family: five machines in one, at 4,096 times the parallel hatch.'],
        ['emi.grindless.info.hyperfactory.1', 'It needs one MAX+ parallel hatch and a 1,024 A MAX+ energy hatch; the copies are cut by the voltage, never by an overflow.'],
        ['emi.grindless.info.max_maxplus_parallel_hatch.0', 'Up to 4,194,304 parallel copies (4^11). The Hyperfactory takes it as its parallel hatch.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
