// Gregtech Grindless - names, tooltips and EMI lines of MAX's accretion feeder (server_scripts/grindless/max/feeder.js; package MAX-E1):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each older row of the package
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // [key, en, es]
    var ENTRIES = [
        ['gtceu.recipe.grindless_diamond_cvd.collector_diamond_plate', 'Circuit 10: a diamond plate is grown for an XUV collector, hydrogen recycled.', 'Circuito 10: se crece una placa de diamante para un colector XUV, con el hidr\u00f3geno reciclado.'],
        ['gtceu.recipe.grindless_ion_implantation.pin_diamond_plate', 'Circuit 17: phosphorus is implanted into the collector plate to make a PIN junction.', 'Circuito 17: se implanta f\u00f3sforo en la placa del colector para hacer una uni\u00f3n PIN.'],
        ['gtceu.recipe.grindless_betavoltaic.diamond_photocell', 'Circuit 4: PIN diamond plates are plated with nickel-63 into XUV photocells.', 'Circuito 4: placas de diamante PIN se chapan con n\u00edquel-63 y dan fotoceldas XUV.'],
        ['gtceu.recipe.grindless_mtj_sputtering.metallised_photocell', 'Circuit 19: a photocell is metallised with gold contacts.', 'Circuito 19: una fotocelda se metaliza con contactos de oro.'],
        ['gtceu.recipe.grindless_space_photovoltaics.xuv_collector_panel', 'Circuit 4: metallised photocells under cerium coverglass with a SiC power module make an XUV collector panel.', 'Circuito 4: fotoceldas metalizadas bajo vidrio de cerio con un m\u00f3dulo de SiC forman un panel colector XUV.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
