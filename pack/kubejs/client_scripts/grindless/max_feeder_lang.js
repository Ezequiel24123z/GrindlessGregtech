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
        ['gtceu.recipe.grindless_space_photovoltaics.xuv_collector_panel', 'Circuit 4: metallised photocells under cerium coverglass with a SiC power module make an XUV collector panel.', 'Circuito 4: fotoceldas metalizadas bajo vidrio de cerio con un m\u00f3dulo de SiC         forman un panel colector XUV.'],
                ['block.gtceu.accretion_feeder', 'Accretion Feeder', 'Alimentador de acreci\u00f3n'],
                ['gtceu.accretion_power', 'Accretion Power', 'Energ\u00eda de acreci\u00f3n'],
                ['grindless.machine.accretion_feeder.tooltip.0', '\u00a77Burns slag pellets at the black hole for power.', '\u00a77Quema p\u00edldoras de escoria en el agujero negro.'],
                ['emi.grindless.info.accretion_feeder.0', 'The accretion feeder runs only at the black hole. Circuit 1 burns a slag pellet for 2^30 EU/t over 2,400 ticks.', 'El alimentador de acreci\u00f3n solo funciona en el agujero negro. El circuito 1 quema una p\u00edldora de escoria a 2^30 EU/t durante 2.400 ticks.'],
                ['emi.grindless.info.accretion_feeder.1', 'A spent collector panel is rebuilt on the solar array fab (circuit 5) with PIN diamond plates.', 'Un panel colector gastado se rehace en la fabrica de paneles solares (circuito 5) con placas de diamante PIN.'],
                ['emi.grindless.info.feeder_coil_casing.0', 'Made in an assembler from tungsten steel plate, SiC-SiC plate and a superconducting coil.', 'Se fabrica en un ensamblador con placa de acero de tungsteno, placa SiC-SiC y una bobina superconductora.'],
                ['gtceu.recipe.grindless_accretion_power.slag_pellet_burn', 'Circuit 1: a slag pellet is burned; the collector panel and Wolter module wear now and then.', 'Circuito 1: se quema una p\u00edldora de escoria; el panel colector y el m\u00f3dulo Wolter se desgastan de vez en cuando.'],
                ['gtceu.recipe.grindless_space_photovoltaics.panel_rework', 'Circuit 5: a spent collector panel is rebuilt with PIN diamond plates.', 'Circuito 5: un panel colector gastado se reconstruye con placas de diamante PIN.'],
                ['gtceu.recipe.grindless_electron_beam.iridium_target', 'Circuit 30: iridium sponge is refined into a sputtering target.', 'Circuito 30: la esponja de iridio se refina hasta un blanco de pulverizaci\u00f3n.'],
                ['gtceu.recipe.grindless_chemical_vapour_infiltration.sic_grazing_shell', 'Circuit 16: SiC mirror tow is infiltrated into a grazing-incidence shell.', 'Circuito 16: la mecha de espejo de SiC se infiltra en una c\u00e1scara de incidencia rasante.'],
                ['gtceu.recipe.grindless_mtj_sputtering.iridium_coated_shell', 'Circuit 21: a SiC shell is coated with iridium.', 'Circuito 21: una c\u00e1scara de SiC se recubre de iridio.']
            ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ENTRIES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
