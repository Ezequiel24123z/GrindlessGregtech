// priority: 6803
// Gregtech Grindless - names, tooltips and EMI lines of MAX's accretion feeder (server_scripts/grindless/max/feeder.js; package MAX-E1):
//
//   gtceu.recipe.grindless_<type>.<recipe>             the EMI line of each older row of the package
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, text]
    var ENTRIES = [
        ['gtceu.recipe.grindless_diamond_cvd.collector_diamond_plate', 'Circuit 10: a diamond plate is grown for an XUV collector, hydrogen recycled.'],
        ['gtceu.recipe.grindless_ion_implantation.pin_diamond_plate', 'Circuit 17: phosphorus is implanted into the collector plate to make a PIN junction.'],
        ['gtceu.recipe.grindless_betavoltaic.diamond_photocell', 'Circuit 4: PIN diamond plates are plated with nickel-63 into XUV photocells.'],
        ['gtceu.recipe.grindless_mtj_sputtering.metallised_photocell', 'Circuit 19: a photocell is metallised with gold contacts.'],
        ['gtceu.recipe.grindless_space_photovoltaics.xuv_collector_panel', 'Circuit 4: metallised photocells under cerium coverglass with a SiC power module make an XUV collector panel.'],
                ['block.gtceu.accretion_feeder', 'Accretion Feeder'],
                ['gtceu.accretion_power', 'Accretion Power'],
                ['grindless.machine.accretion_feeder.tooltip.0', '\u00a77Burns slag pellets at the black hole for power.'],
                ['emi.grindless.info.accretion_feeder.0', 'The accretion feeder runs only at the black hole. Circuit 1 burns a slag pellet for 2^30 EU/t over 2,400 ticks.'],
                ['emi.grindless.info.accretion_feeder.1', 'A spent collector panel is rebuilt on the solar array fab (circuit 5) with PIN diamond plates.'],
                ['emi.grindless.info.feeder_coil_casing.0', 'Made in an assembler from tungsten steel plate, SiC-SiC plate and a superconducting coil.'],
                ['gtceu.recipe.grindless_accretion_power.slag_pellet_burn', 'Circuit 1: a slag pellet is burned; the collector panel and Wolter module wear now and then.'],
                ['gtceu.recipe.grindless_space_photovoltaics.panel_rework', 'Circuit 5: a spent collector panel is rebuilt with PIN diamond plates.'],
                ['gtceu.recipe.grindless_electron_beam.iridium_target', 'Circuit 30: iridium sponge is refined into a sputtering target.'],
                ['gtceu.recipe.grindless_chemical_vapour_infiltration.sic_grazing_shell', 'Circuit 16: SiC mirror tow is infiltrated into a grazing-incidence shell.'],
                ['gtceu.recipe.grindless_mtj_sputtering.iridium_coated_shell', 'Circuit 21: a SiC shell is coated with iridium.']
            ]

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
