// priority: 3079
// Gregtech Grindless - names and tooltips of UIV's levitation melter (startup_scripts/grindless/uiv/levitation_melter.js; package UIV-A3):
//
//   block.gtceu.levitation_melter, gtceu.levitation_melting   machine and recipe type names
//   grindless.machine.levitation_melter.tooltip.N             controller tooltips
//   gtceu.recipe.grindless_levitation_melting.<recipe>        the EMI line of each melt
//   gtceu.recipe.grindless_electron_beam.nb_ta_button, ...nitride_magnet_synthesis.halbach_array, ...chemical_vapour_infiltration.w_preform_densify
//                                                             the EMI lines of the older rows this package appends
//   item.grindless.<n>, tooltip.grindless.<n>.0 / .1          the package's own items
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // [key, en]
    var ENTRIES = [
        ['block.gtceu.levitation_melter', 'Levitation Melter'],
        ['gtceu.levitation_melting', 'Levitation Melting'],

        ['grindless.machine.levitation_melter.tooltip.0',
            '\u00a77Melts alloys levitated in helium: RHEA, Ti-50, metallic glass and PrNi5.'],
        ['grindless.machine.levitation_melter.tooltip.1',
            'Needs a helium hatch.'],

        ['gtceu.recipe.grindless_levitation_melting.rhea_melt', 'Melts W, Mo, Nb-Ta buttons and Hf into the RHEA ingot.'],
        ['gtceu.recipe.grindless_levitation_melting.wf_rhea_melt', 'Melts a densified tungsten preform into RHEA: the Wf/RHEA billet.'],
        ['gtceu.recipe.grindless_levitation_melting.ti50_melt', 'Melts Ti-50 sponge into Ti-50 metal.'],
        ['gtceu.recipe.grindless_levitation_melting.bmg_melt', 'Melts the Zr master alloy into bulk metallic glass; the beryllium fume is captured as BeO.'],
        ['gtceu.recipe.grindless_levitation_melting.prni5_melt', 'Melts praseodymium and nickel into PrNi5.'],

        ['gtceu.recipe.grindless_electron_beam.nb_ta_button', 'Electron-beam melts Nb and Ta powder into a button; the skull goes back to stock.'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.halbach_array', 'Bonds Fe16N2 magnets into a Halbach array.'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.w_preform_densify', 'Densifies a tungsten fibre preform with WF6 and hydrogen; the HF goes to the kiln.']
    ]

    // [name, en, tooltip 0, tooltip 1]
    var ITEMS = [
        ['melter_dross', 'Melter Dross', 'Oxide skin skimmed off a levitated melt.', 'Digest it in the extraction cascade.'],
        ['nb_ta_button', 'Nb-Ta Button', 'An electron-beam melted button of niobium and tantalum.', 'Feeds the RHEA melt.'],
        ['densified_w_preform', 'Densified Tungsten Preform', 'A tungsten fibre preform filled by vapour infiltration.', 'Melted with RHEA into the Wf/RHEA billet.'],
        ['zr_master_alloy', 'Zr Master Alloy', 'Zirconium, titanium, copper, nickel and beryllium, mixed.', 'Melts into bulk metallic glass.'],
        ['beryllium_oxide_dust', 'Beryllium Oxide Dust', 'Beryllium fume captured from the glass melt.', 'Contained; electrolyse it back to metal.'],
        ['rhea_slab', 'Homogenised RHEA Slab', 'An RHEA ingot held in a hot furnace until it is uniform.', 'Goes to the hot strip mill.'],
        ['rhea_former', 'RHEA Former', 'A plate-and-ingot frame for a winding.', 'Line 2.'],
        ['wound_rhea_former', 'Wound RHEA Former', 'A RHEA former wound with metallic hydrogen.', 'Impregnate it with epoxy.'],
        ['impregnated_mh_coil', 'Impregnated MH Coil', 'A metallic hydrogen winding set in epoxy.', 'Four make a coil block.'],
        ['rhea_cased_charge', 'RHEA-Cased Charge', 'Cubic gauche nitrogen in a RHEA case.', 'Ends up on the sled.'],
        ['halbach_array', 'Halbach Array', 'Fe16N2 magnets bonded into a one-sided flux array.', 'Goes into a maglev stator.'],
        ['rhea_cased_halbach', 'RHEA-Cased Halbach Array', 'A Halbach array in a RHEA case.', 'Wind and pot it.'],
        ['potted_mh_stator', 'Potted MH Stator', 'A cased Halbach array with a metallic hydrogen winding, potted.', 'Add the cable.'],
        ['maglev_stator', 'Maglev Stator', 'A finished magnetic-levitation stator.', 'Builds the UIV conveyor module.']
    ]

    ITEMS.forEach(function (i) {
        ENTRIES.push(['item.grindless.' + i[0], i[1]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.0', i[2]])
        ENTRIES.push(['tooltip.grindless.' + i[0] + '.1', i[3]])
    })

    ClientEvents.lang('en_us', function (event) {
        ENTRIES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
