// priority: 3058
// Gregtech Grindless - names and tooltips of the optical mainframe's compute module (startup_scripts/grindless/uiv/mainframe_module.js;
// package D4-UIV-MAINFRAME):
//
//   gtceu.recipe.grindless_photonic_integration.<recipe>   the EMI lines of the new hall rows are in uiv_mainframe_lang.js
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1        the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = []

    // [name, en, tooltip 0, tooltip 1]
    var ITEMS = [
        ['photonic_compute_module', 'Photonic Compute Module', 'A quantum photonic chip bonded to a PCM crossbar on glass.', 'Takes the BEUV driver ASIC and four modulators to become a tensor core (hall circuit 4).'],
        ['comb_fed_tensor_core', 'Comb-Fed Tensor Core', 'A tensor core lit by a soliton microcomb.', 'Goes into the optical mainframe (hall circuit 5).']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[3]])
    })

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
