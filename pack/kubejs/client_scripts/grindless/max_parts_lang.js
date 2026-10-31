// priority: 6582
// Gregtech Grindless - EMI lines of MAX-A4's L39 rows on older machines (the fault-current-limiter line). Item and component names
// are in max_foundation_lang.js. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_coated_conductor.fcl_tape', 'Circuit 8: limiter tape, a resistive substrate strip under the coated conductor', 'Circuito 8: cinta limitadora, una tira de sustrato resistivo bajo el conductor recubierto'],
        ['gtceu.recipe.grindless_pulsed_laser_deposition.thick_film_fcl_tape', 'Circuit 5: a thick GdBCO film laser-deposited on the limiter tape in oxygen', 'Circuito 5: una película gruesa de GdBCO depositada por láser sobre la cinta limitadora, en oxígeno'],
        ['gtceu.recipe.grindless_magnet_winding.fcl_coil', 'Circuit 14: a bifilar limiter coil wound from thick-film tape', 'Circuito 14: una bobina limitadora bifilar devanada con cinta de película gruesa']
    ];
    ['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1 + li]); });
        });
    });
})();
