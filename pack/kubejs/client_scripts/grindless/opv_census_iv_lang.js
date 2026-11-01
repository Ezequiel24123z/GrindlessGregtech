// priority: 5836
// Gregtech Grindless - names of OpV's census IV (startup_scripts/grindless/opv/census_iv.js; package OpV-B2):
//   material.gtceu.<n>                                           the two dusts and the two recoil gases
//   gtceu.recipe.grindless_<type>.<recipe>                       the EMI line of each older row the package adds
// F1 names and tooltips element_124_recoil, element_126_recoil and superheavy_census_iv (opv_foundation_lang.js).
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    var MATERIALS = [
        ['thawed_chain_nickel', 'Thawed Chain Nickel'],
        ['nickel_64', 'Nickel-64'],
        ['element_124_recoil_gas', 'Element 124 Recoil Gas'],
        ['element_126_recoil_gas', 'Element 126 Recoil Gas']
    ]

    var ENTRIES = [
        ['gtceu.recipe.grindless_electron_beam.ni_chain_thaw',
            'Circuit 23: the caged Ni chain thawed in vacuum; the cage part returns'],
        ['gtceu.recipe.grindless_calutron_separation.nickel_64',
            'Circuit 11: chain nickel split by mass; the Ni-58, Ni-60 and Ni-62 rest goes back to stock as nickel'],
        ['gtceu.recipe.grindless_heavy_ion_irradiation.element_124',
            'Circuit 11: a nickel-64 beam on the curium-248 target; the spent target goes to waste retrieval'],
        ['gtceu.recipe.grindless_heavy_ion_irradiation.element_126',
            'Circuit 13: a nickel-64 beam on a californium-249 wheel; the activated wheel goes back to the hot cell'],
        ['gtceu.recipe.grindless_recoil_separation.element_124_recoil',
            'Circuit 10: element 124 caught from its recoil gas on the membrane'],
        ['gtceu.recipe.grindless_recoil_separation.element_126_recoil',
            'Circuit 11: element 126 caught from its recoil gas on the membrane'],
        ['gtceu.recipe.grindless_superheavy_chemistry.census_iv',
            'Circuit 11: elements 124 and 126 and the island nuclide counted together in one capsule']
    ]

    MATERIALS.forEach(function (m) {
        ENTRIES.push(['material.gtceu.' + m[0], m[1]])
    })

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
