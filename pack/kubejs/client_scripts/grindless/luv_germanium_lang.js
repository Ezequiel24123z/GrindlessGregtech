// priority: 7650
// Gregtech Grindless - names and tooltips of LuV's germanium line (startup_scripts/grindless/luv/germanium.js; package D2-GERMANIUM).
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['material.gtceu.germanium_dioxide', 'Germanium Dioxide'],
        ['material.gtceu.indium_chloride', 'Indium Chloride']
    ]

    // [name, en, tooltip 0]
    var ITEMS = [
        ['germanium_boule', 'Germanium Boule', 'A single crystal of germanium, pulled in argon. The cutter slices it into wafers.'],
        ['germanium_wafer', 'Germanium Wafer', 'The substrate of the orbital triple-junction cells.']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[2]])
    })

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
