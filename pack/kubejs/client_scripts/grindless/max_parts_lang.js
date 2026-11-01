// priority: 6614
// Gregtech Grindless - EMI lines of MAX-A4's L39 rows on older machines (the fault-current-limiter line). Item and component names
// are in max_foundation_lang.js. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.recipe.grindless_coated_conductor.fcl_tape', 'Circuit 8: limiter tape, a resistive substrate strip under the coated conductor'],
        ['gtceu.recipe.grindless_pulsed_laser_deposition.thick_film_fcl_tape', 'Circuit 5: a thick GdBCO film laser-deposited on the limiter tape in oxygen'],
        ['gtceu.recipe.grindless_magnet_winding.fcl_coil', 'Circuit 14: a bifilar limiter coil wound from thick-film tape']
    ];
    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1]); });
    })
})();
