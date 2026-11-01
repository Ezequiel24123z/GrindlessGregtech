// priority: 1449
// Gregtech Grindless - EMI lines of UXV's parts and part steps (server_scripts/grindless/uxv/uxv_parts.js and the three older tables; package UXV-A8):
//
//   gtceu.recipe.grindless_naquadria_magnets.<name>   magnet works c8 and c10
//   gtceu.recipe.grindless_magnet_winding.<name>      HTS magnet works c6
//   gtceu.recipe.grindless_coated_conductor.<name>    coated conductor line c4
// The item names are in uxv_foundation_lang.js. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.recipe.grindless_naquadria_magnets.tetrataenite_rotor',
            'Circuit 8: four tetrataenite laminations are stacked on a tungsten steel shaft and magnetised as the rotor.'],
        ['gtceu.recipe.grindless_naquadria_magnets.multipole_encoder_ring',
            'Circuit 10: an encoder ring is mounted on a titanium carrier and magnetised in alternating poles.'],
        ['gtceu.recipe.grindless_magnet_winding.strand_stator',
            'Circuit 6: pasta strand wire is wound round tetrataenite laminations, potted in epoxy and cold-tested in the helium charge.'],
        ['gtceu.recipe.grindless_coated_conductor.strand_tape',
            'Circuit 4: pasta strand wire is flattened and clad with copper foil as the stabiliser.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
