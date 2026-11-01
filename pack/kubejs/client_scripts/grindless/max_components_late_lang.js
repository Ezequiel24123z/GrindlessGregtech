// priority: 6828
// Gregtech Grindless - EMI lines of MAX-A3's L8 rows on older machines (the power die line). Item and component names are in
// max_foundation_lang.js. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.recipe.grindless_diamond_cvd.power_diamond_plate', 'Circuit 9: power diamond plate grown on a seed'],
        ['gtceu.recipe.grindless_ion_implantation.boron_delta_diamond', 'Circuit 11: boron delta layer implanted in diamond'],
        ['gtceu.recipe.grindless_mtj_sputtering.metallised_diamond', 'Circuit 16: titanium and gold contacts sputtered on diamond'],
        ['gtceu.recipe.grindless_silicon_carbide.diamond_power_wafer', 'Circuit 9: diamond power wafer on a SiC substrate']
    ];
    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1]); });
    })
})();
