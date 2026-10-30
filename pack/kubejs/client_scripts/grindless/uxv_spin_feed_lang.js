// priority: 1499
// Gregtech Grindless - names and tooltips of the UXV spintronic feedstock (startup_scripts/grindless/uxv/spin_feed.js):
//
//   grindless:<item>   item.grindless.<n> plus one tooltip line (tooltip.grindless.<n>.0)
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // id, en name, es name, en tip, es tip
    var ITEMS = [
        ['dysprosium_oxide_dust', 'Dysprosium Oxide Dust', 'Polvo de óxido de disprosio', 'Dy2O3 stripped from the depleted liquor.', 'Dy2O3 extraído del licor agotado.'],
        ['dysprosium_dust', 'Dysprosium Dust', 'Polvo de disprosio', 'Reduced with lanthanum, like terbium.', 'Reducido con lantano, como el terbio.'],
        ['scandium_oxide_dust', 'Scandium Oxide Dust', 'Polvo de óxido de escandio', 'Sc2O3 from the mixed rare earth strip.', 'Sc2O3 de la extracción de tierras raras mixtas.'],
        ['strontium_carbonate_dust', 'Strontium Carbonate Dust', 'Polvo de carbonato de estroncio', 'Co-precipitated from the calcium chloride liquor.', 'Coprecipitado del licor de cloruro de calcio.'],
        ['magnesium_hydroxide_dust', 'Magnesium Hydroxide Dust', 'Polvo de hidróxido de magnesio', 'Magnesite and water; the CO2 is vented.', 'Magnesita y agua; el CO2 se ventea.'],
        ['five_n_magnesia_dust', '5N Magnesia Dust', 'Polvo de magnesia 5N', 'Calcined from magnesium hydroxide.', 'Calcinada a partir de hidróxido de magnesio.'],
        ['five_n_platinum', '5N Platinum', 'Platino 5N', 'Refined to sputter grade.', 'Refinado a grado de pulverización.'],
        ['five_n_ruthenium', '5N Ruthenium', 'Rutenio 5N', 'Refined to sputter grade.', 'Refinado a grado de pulverización.'],
        ['five_n_iridium', '5N Iridium', 'Iridio 5N', 'Refined to sputter grade.', 'Refinado a grado de pulverización.'],
        ['seven_n_tellurium', '7N Tellurium', 'Telurio 7N', 'Zone refined seven times.', 'Refinado por zonas siete veces.'],
        ['seven_n_germanium', '7N Germanium', 'Germanio 7N', 'Zone refined seven times.', 'Refinado por zonas siete veces.'],
        ['bfo_fume', 'BFO Fume', 'Humo de BFO', 'Bismuth ferrite carried off the PLD plume.', 'Ferrita de bismuto arrastrada por la pluma PLD.'],
        ['lpe_dross', 'LPE Dross', 'Escoria de LPE', 'Lead oxide flux left in the epitaxy crucible.', 'Fundente de óxido de plomo del crisol de epitaxia.'],
        ['dysco3_charge_dust', 'DyScO3 Charge', 'Carga de DyScO3', 'Dy2O3 and Sc2O3 kneaded wet.', 'Dy2O3 y Sc2O3 amasados en húmedo.'],
        ['ggg_charge_dust', 'GGG Charge', 'Carga de GGG', 'Gd2O3 and Ga2O3 kneaded wet.', 'Gd2O3 y Ga2O3 amasados en húmedo.'],
        ['srruo3_charge_dust', 'SrRuO3 Charge', 'Carga de SrRuO3', '5N ruthenium and strontium carbonate.', 'Rutenio 5N y carbonato de estroncio.'],
        ['la_bfo_charge_dust', 'La-BFO Charge', 'Carga de La-BFO', 'La2O3, roasted bismuth and iron oxide.', 'La2O3, bismuto tostado y óxido de hierro.'],
        ['gum_metal_blend', 'Gum Metal Blend', 'Mezcla de metal goma', 'Ti, Nb, Ta, Zr and O, ready to sinter.', 'Ti, Nb, Ta, Zr y O, lista para sinterizar.'],
        ['cofeb_am_powder', 'CoFeB Powder', 'Polvo de CoFeB', 'Atomised for the powder bed.', 'Atomizado para la cama de polvo.'],
        ['heusler_am_powder', 'Heusler Powder', 'Polvo Heusler', 'Atomised for the powder bed.', 'Atomizado para la cama de polvo.'],
        ['mgo_am_powder', 'MgO Powder', 'Polvo de MgO', 'Granulated for the powder bed.', 'Granulado para la cama de polvo.'],
        ['ruthenium_am_powder', 'Ruthenium Powder', 'Polvo de rutenio', 'Atomised for the powder bed.', 'Atomizado para la cama de polvo.'],
        ['srruo3_am_powder', 'SrRuO3 Powder', 'Polvo de SrRuO3', 'Granulated for the powder bed.', 'Granulado para la cama de polvo.'],
        ['la_bfo_am_powder', 'La-BFO Powder', 'Polvo de La-BFO', 'Granulated for the powder bed.', 'Granulado para la cama de polvo.'],
        ['near_net_cofeb_blank', 'Near-Net CoFeB Blank', 'Pieza casi final de CoFeB', 'Printed; it still needs hot isostatic pressing.', 'Impresa; aún necesita prensado isostático en caliente.'],
        ['near_net_heusler_blank', 'Near-Net Heusler Blank', 'Pieza casi final Heusler', 'Printed; it still needs hot isostatic pressing.', 'Impresa; aún necesita prensado isostático en caliente.'],
        ['near_net_mgo_blank', 'Near-Net MgO Blank', 'Pieza casi final de MgO', 'Printed; it still needs hot isostatic pressing.', 'Impresa; aún necesita prensado isostático en caliente.'],
        ['near_net_saf_blank', 'Near-Net SAF Blank', 'Pieza casi final SAF', 'Printed; it still needs hot isostatic pressing.', 'Impresa; aún necesita prensado isostático en caliente.'],
        ['near_net_srruo3_blank', 'Near-Net SrRuO3 Blank', 'Pieza casi final de SrRuO3', 'Printed; it still needs hot isostatic pressing.', 'Impresa; aún necesita prensado isostático en caliente.'],
        ['near_net_la_bfo_blank', 'Near-Net La-BFO Blank', 'Pieza casi final de La-BFO', 'Printed; it still needs hot isostatic pressing.', 'Impresa; aún necesita prensado isostático en caliente.'],
        ['cofeb_hip_blank', 'CoFeB HIP Blank', 'Pieza HIP de CoFeB', 'Bonded to a copper backing plate.', 'Se adhiere a una placa base de cobre.'],
        ['heusler_hip_blank', 'Heusler HIP Blank', 'Pieza HIP Heusler', 'Bonded to a copper backing plate.', 'Se adhiere a una placa base de cobre.'],
        ['mgo_hip_blank', 'MgO HIP Blank', 'Pieza HIP de MgO', 'Bonded to a copper backing plate.', 'Se adhiere a una placa base de cobre.'],
        ['saf_hip_blank', 'SAF HIP Blank', 'Pieza HIP SAF', 'Bonded to a copper backing plate.', 'Se adhiere a una placa base de cobre.'],
        ['srruo3_hip_blank', 'SrRuO3 HIP Blank', 'Pieza HIP de SrRuO3', 'Bonded to a copper backing plate.', 'Se adhiere a una placa base de cobre.'],
        ['la_bfo_hip_blank', 'La-BFO HIP Blank', 'Pieza HIP de La-BFO', 'Bonded to a copper backing plate.', 'Se adhiere a una placa base de cobre.'],
        ['spent_cofeb_target', 'Spent CoFeB Target', 'Blanco de CoFeB gastado', 'Pressed again in the powder bed.', 'Se vuelve a prensar en la cama de polvo.']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ITEMS.forEach(function (e) {
                event.add('grindless', 'item.grindless.' + e[0], e[1 + li])
                event.add('grindless', 'tooltip.grindless.' + e[0] + '.0', e[3 + li])
            })
        })
    })
})()
