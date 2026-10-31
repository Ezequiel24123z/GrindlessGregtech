// priority: 6695
// Gregtech Grindless - EMI lines of MAX-A3's L8 rows on older machines (the power die line). Item and component names are in
// max_foundation_lang.js. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_diamond_cvd.power_diamond_plate', 'Circuit 9: power diamond plate grown on a seed', 'Circuito 9: placa de diamante de potencia crecida sobre una semilla'],
        ['gtceu.recipe.grindless_ion_implantation.boron_delta_diamond', 'Circuit 11: boron delta layer implanted in diamond', 'Circuito 11: capa delta de boro implantada en diamante'],
        ['gtceu.recipe.grindless_mtj_sputtering.metallised_diamond', 'Circuit 16: titanium and gold contacts sputtered on diamond', 'Circuito 16: contactos de titanio y oro pulverizados sobre diamante'],
        ['gtceu.recipe.grindless_silicon_carbide.diamond_power_wafer', 'Circuit 9: diamond power wafer on a SiC substrate', 'Circuito 9: oblea de potencia de diamante sobre sustrato de SiC']
    ];
    ['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) { event.add('grindless', e[0], e[1 + li]); });
        });
    });
})();
