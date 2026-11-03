// priority: 1469
// Gregtech Grindless - name, tooltips and info page of UXV's stellar fractionation hall (startup_scripts/grindless/uxv/stellar_fractionation_hall.js; package UXV-M2):
//
//   block.gtceu.stellar_fractionation_hall             machine name
//   grindless.machine.stellar_fractionation_hall.tooltip.N   controller tooltips
//   emi.grindless.info.stellar_fractionation_hall.N    the EMI info page of the controller
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.stellar_fractionation_hall', 'Stellar Fractionation Hall'],

        ['grindless.machine.stellar_fractionation_hall.tooltip.0',
            '\u00a77Runs distillation tower and distillery recipes in bulk, one mode at a time.'],

        ['emi.grindless.info.stellar_fractionation_hall.0',
            'It has no recipes of its own: it runs the recipes of the distillation tower and the distillery, in either mode, as many copies at once as its energy hatches carry, up to 4,096 times the parallel of its hatch (a UXV hatch gives 268,435,456 copies).'],
        ['emi.grindless.info.stellar_fractionation_hall.1',
            'It is 21 blocks wide, 21 high and 61 deep, lying on its side: a reboiler plinth at the front, two columns running to the back under a crane gantry, all in gum metal, so the whole hall stands anywhere, in any dimension, with no site.'],
        ['emi.grindless.info.stellar_fractionation_hall.2',
            'Use it to fractionate whole stellar cuts in one machine: each distinct output fluid needs its own output hatch, up to 12.'],
        ['emi.grindless.info.stellar_fractionation_hall.3',
            'Up to 4,096 recipes at once; with a parallel hatch, 4,096 times its parallel. Every copy pays its full EU/t, there is no discount, and it overclocks without losing energy. Parts go in the two rows beside the controller: 1 maintenance, 1-2 energy hatches, 0-2 input buses, 0-2 output buses, 1-4 input hatches, 0-1 parallel hatch.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
