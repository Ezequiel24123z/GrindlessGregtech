// priority: 7170
// Gregtech Grindless - names of LuV's ZBLAN fluorides (startup_scripts/grindless/luv/zblan_fluorides.js; package D2-ZBLAN).
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    var ENTRIES = [
        ['material.gtceu.barium_fluoride', 'Barium Fluoride'],
        ['material.gtceu.lanthanum_fluoride', 'Lanthanum Fluoride'],
        ['material.gtceu.aluminium_fluoride', 'Aluminium Fluoride'],
        ['material.gtceu.sodium_fluoride', 'Sodium Fluoride'],
        ['material.gtceu.zblan_dopant_blend', 'ZBLAN Dopant Blend']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
