// priority: 7179
// Gregtech Grindless - name and tooltip of LuV's PEDOT:PSS microelectrode array (startup_scripts/grindless/luv/pedot_mea.js; package D2-MEA).
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [name, en, tooltip 0]
    var ITEMS = [
        ['pedot_microelectrode_array', 'PEDOT:PSS Microelectrode Array', 'Gold contacts on sapphire, coated in the conductive polymer that lets an organoid be read. The neuro processing unit takes one.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ITEMS.forEach(function (i) {
            event.add('grindless', 'item.grindless.' + i[0], i[1])
            event.add('grindless', 'tooltip.grindless.' + i[0] + '.0', i[2])
        })
    })
})()
