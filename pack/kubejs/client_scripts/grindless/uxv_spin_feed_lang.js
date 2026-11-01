// priority: 1499
// Gregtech Grindless - names and tooltips of the UXV spintronic feedstock (startup_scripts/grindless/uxv/spin_feed.js):
//
//   grindless:<item>   item.grindless.<n> plus one tooltip line (tooltip.grindless.<n>.0)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // id, en name, es name, en tip, es tip
    var ITEMS = [
        ['dysprosium_oxide_dust', 'Dysprosium Oxide Dust', 'Dy2O3 stripped from the depleted liquor.'],
        ['dysprosium_dust', 'Dysprosium Dust', 'Reduced with lanthanum, like terbium.'],
        ['scandium_oxide_dust', 'Scandium Oxide Dust', 'Sc2O3 from the mixed rare earth strip.'],
        ['strontium_carbonate_dust', 'Strontium Carbonate Dust', 'Co-precipitated from the calcium chloride liquor.'],
        ['magnesium_hydroxide_dust', 'Magnesium Hydroxide Dust', 'Magnesite and water; the CO2 is vented.'],
        ['five_n_magnesia_dust', '5N Magnesia Dust', 'Calcined from magnesium hydroxide.'],
        ['five_n_platinum', '5N Platinum', 'Refined to sputter grade.'],
        ['five_n_ruthenium', '5N Ruthenium', 'Refined to sputter grade.'],
        ['five_n_iridium', '5N Iridium', 'Refined to sputter grade.'],
        ['seven_n_tellurium', '7N Tellurium', 'Zone refined seven times.'],
        ['seven_n_germanium', '7N Germanium', 'Zone refined seven times.'],
        ['bfo_fume', 'BFO Fume', 'Bismuth ferrite carried off the PLD plume.'],
        ['lpe_dross', 'LPE Dross', 'Lead oxide flux left in the epitaxy crucible.'],
        ['dysco3_charge_dust', 'DyScO3 Charge', 'Dy2O3 and Sc2O3 kneaded wet.'],
        ['ggg_charge_dust', 'GGG Charge', 'Gd2O3 and Ga2O3 kneaded wet.'],
        ['srruo3_charge_dust', 'SrRuO3 Charge', '5N ruthenium and strontium carbonate.'],
        ['la_bfo_charge_dust', 'La-BFO Charge', 'La2O3, roasted bismuth and iron oxide.'],
        ['gum_metal_blend', 'Gum Metal Blend', 'Ti, Nb, Ta, Zr and O, ready to sinter.'],
        ['cofeb_am_powder', 'CoFeB Powder', 'Atomised for the powder bed.'],
        ['heusler_am_powder', 'Heusler Powder', 'Atomised for the powder bed.'],
        ['mgo_am_powder', 'MgO Powder', 'Granulated for the powder bed.'],
        ['ruthenium_am_powder', 'Ruthenium Powder', 'Atomised for the powder bed.'],
        ['srruo3_am_powder', 'SrRuO3 Powder', 'Granulated for the powder bed.'],
        ['la_bfo_am_powder', 'La-BFO Powder', 'Granulated for the powder bed.'],
        ['near_net_cofeb_blank', 'Near-Net CoFeB Blank', 'Printed; it still needs hot isostatic pressing.'],
        ['near_net_heusler_blank', 'Near-Net Heusler Blank', 'Printed; it still needs hot isostatic pressing.'],
        ['near_net_mgo_blank', 'Near-Net MgO Blank', 'Printed; it still needs hot isostatic pressing.'],
        ['near_net_saf_blank', 'Near-Net SAF Blank', 'Printed; it still needs hot isostatic pressing.'],
        ['near_net_srruo3_blank', 'Near-Net SrRuO3 Blank', 'Printed; it still needs hot isostatic pressing.'],
        ['near_net_la_bfo_blank', 'Near-Net La-BFO Blank', 'Printed; it still needs hot isostatic pressing.'],
        ['cofeb_hip_blank', 'CoFeB HIP Blank', 'Bonded to a copper backing plate.'],
        ['heusler_hip_blank', 'Heusler HIP Blank', 'Bonded to a copper backing plate.'],
        ['mgo_hip_blank', 'MgO HIP Blank', 'Bonded to a copper backing plate.'],
        ['saf_hip_blank', 'SAF HIP Blank', 'Bonded to a copper backing plate.'],
        ['srruo3_hip_blank', 'SrRuO3 HIP Blank', 'Bonded to a copper backing plate.'],
        ['la_bfo_hip_blank', 'La-BFO HIP Blank', 'Bonded to a copper backing plate.'],
        ['spent_cofeb_target', 'Spent CoFeB Target', 'Pressed again in the powder bed.']
    ]

    ClientEvents.lang('en_us', function (event) {
        ITEMS.forEach(function (e) {
            event.add('grindless', 'item.grindless.' + e[0], e[1])
            event.add('grindless', 'tooltip.grindless.' + e[0] + '.0', e[2])
        })
    })
})()
