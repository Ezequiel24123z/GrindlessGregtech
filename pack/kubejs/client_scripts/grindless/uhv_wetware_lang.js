// priority: 3600
// Gregtech Grindless - names and tooltips of UHV's organoid array (startup_scripts/grindless/uhv/wetware.js; package UHV-B6):
//
//   block.gtceu.organoid_array, gtceu.organoid_computing          machine and recipe type names
//   grindless.machine.organoid_array.tooltip.N / .no_voiding     controller tooltips and the refusal to void
//
// No new items: the organoid processor and the sterilised growth medium are F1's (uhv_foundation_lang.js).
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['block.gtceu.organoid_array', 'Organoid Array'],
        ['gtceu.organoid_computing', 'Organoid Computing'],

        ['grindless.machine.organoid_array.tooltip.0',
            '§7Grows cortical organoids on electrodes into wetware mainframes.'],
        ['grindless.machine.organoid_array.tooltip.1', 'Works on Earth only.'],
        ['grindless.machine.organoid_array.no_voiding',
            'Voiding is off: the spent medium goes back to the biofoundry and must never be thrown away.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
