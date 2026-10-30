// priority: 1479
// Gregtech Grindless - names and tooltips of the UXV spintronic rows (startup_scripts/grindless/uxv/spin_rows.js) and the EMI lines of the
// new rows in the shared tables:
//
//   grindless:<item>   item.grindless.<n> plus one tooltip line (tooltip.grindless.<n>.0)
//   gtceu.recipe.<dataKey>.<recipe>   the EMI line of each new row of a custom machine
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us and es_es.
(function () {
    // id, en name, es name, en tip, es tip
    var ITEMS = [
        ['five_n_cobalt', '5N Cobalt', 'Cobalto 5N', 'Electron-beam refined; for the spintronic films.', 'Refinado con haz de electrones; para las l\u00e1minas espintr\u00f3nicas.'],
        ['five_n_iron', '5N Iron', 'Hierro 5N', 'Electron-beam refined; for the spintronic films.', 'Refinado con haz de electrones; para las l\u00e1minas espintr\u00f3nicas.'],
        ['five_n_manganese', '5N Manganese', 'Manganeso 5N', 'Electron-beam refined; for the Heusler and Ni-Mn-Ga melts.', 'Refinado con haz de electrones; para las fusiones Heusler y Ni-Mn-Ga.'],
        ['five_n_silicon', '5N Silicon', 'Silicio 5N', 'Electron-beam refined; for the Heusler melt.', 'Refinado con haz de electrones; para la fusi\u00f3n Heusler.'],
        ['five_n_nickel', '5N Nickel', 'N\u00edquel 5N', 'Electron-beam refined; for the Ni-Mn-Ga melt.', 'Refinado con haz de electrones; para la fusi\u00f3n Ni-Mn-Ga.'],
        ['five_n_gallium', '5N Gallium', 'Galio 5N', 'Electron-beam refined; for the Ni-Mn-Ga melt.', 'Refinado con haz de electrones; para la fusi\u00f3n Ni-Mn-Ga.'],
        ['mu_metal_blend', 'Mu-Metal Blend', 'Mezcla de mu-metal', 'Nickel, iron and molybdenum, mixed.', 'N\u00edquel, hierro y molibdeno, mezclados.'],
        ['mu_metal_ingot', 'Mu-Metal Ingot', 'Lingote de mu-metal', 'Electron-beam melted; goes to the hot strip mill.', 'Fundido con haz de electrones; va al laminador en caliente.'],
        ['mu_metal_hot_band', 'Mu-Metal Hot Band', 'Banda de mu-metal en caliente', 'Rolled once; rolled again into foil.', 'Laminada una vez; se lamina de nuevo hasta lamina.'],
        ['annealed_mu_foil', 'Annealed Mu-Metal Foil', 'L\u00e1mina de mu-metal recocida', 'Annealed in hydrogen for high permeability.', 'Recocida en hidr\u00f3geno para alta permeabilidad.'],
        ['mu_metal_shield_can', 'Mu-Metal Shield Can', 'Lata de blindaje de mu-metal', 'Shields a chip from stray magnetic fields.', 'Blinda un chip de campos magn\u00e9ticos parasitos.'],
        ['finemet_charge_dust', 'Finemet Charge', 'Carga de Finemet', 'Fe-Si-B-Nb-Cu, ready to melt.', 'Fe-Si-B-Nb-Cu, lista para fundir.'],
        ['heusler_cast_ingot', 'Cast Heusler Ingot', 'Lingote Heusler colado', 'Still segregated; it needs a homogenising anneal.', 'A\u00fan segregado; necesita un recocido de homogeneizaci\u00f3n.'],
        ['ni_mn_ga_raw_crystal', 'Raw Ni-Mn-Ga Crystal', 'Cristal Ni-Mn-Ga en bruto', 'Needs twin training in a field.', 'Necesita entrenamiento de maclas en un campo.'],
        ['raw_hbn_crystal', 'Raw hBN Crystal', 'Cristal de hBN en bruto', 'Grown with barium; the barium is leached out.', 'Crecido con bario; el bario se disuelve.'],
        ['wte2_raw_crystal', 'Raw WTe2 Crystal', 'Cristal de WTe2 en bruto', 'Grown by vapour transport; needs a tellurium anneal.', 'Crecido por transporte de vapor; necesita un recocido con telurio.'],
        ['fgt_raw_crystal', 'Raw Fe3GeTe2 Crystal', 'Cristal de Fe3GeTe2 en bruto', 'Grown by vapour transport; needs a tellurium anneal.', 'Crecido por transporte de vapor; necesita un recocido con telurio.'],
        ['dysco3_boule', 'DyScO3 Boule', 'Boule de DyScO3', 'Sawn into slices.', 'Se corta en rodajas.'],
        ['ggg_boule', 'GGG Boule', 'Boule de GGG', 'Sawn into slices.', 'Se corta en rodajas.'],
        ['ga2o3_efg_plate', 'Ga2O3 EFG Plate', 'Placa EFG de Ga2O3', 'Pulled through an iridium die; sawn into slices.', 'Extra\u00edda por una matriz de iridio; se corta en rodajas.'],
        ['dysco3_slice', 'DyScO3 Slice', 'Rodaja de DyScO3', 'Rough from the saw; polish it.', 'Basta de la sierra; p\u00f3lela.'],
        ['dysco3_polished_slice', 'Polished DyScO3 Slice', 'Rodaja de DyScO3 pulida', 'Anneal it into a substrate.', 'Rec\u00f3cela hasta un sustrato.'],
        ['ggg_slice', 'GGG Slice', 'Rodaja de GGG', 'Rough from the saw; polish it.', 'Basta de la sierra; p\u00f3lela.'],
        ['ggg_polished_slice', 'Polished GGG Slice', 'Rodaja de GGG pulida', 'Anneal it into a wafer.', 'Rec\u00f3cela hasta una oblea.'],
        ['ga2o3_slice', 'Ga2O3 Slice', 'Rodaja de Ga2O3', 'Rough from the saw; polish it into a wafer.', 'Basta de la sierra; p\u00f3lela hasta una oblea.'],
        ['annealed_mtj_wafer', 'Annealed MTJ Wafer', 'Oblea MTJ recocida', 'The CoFeB/MgO stack, crystallised in a field.', 'La pila CoFeB/MgO, cristalizada en un campo.'],
        ['etched_mtj_wafer', 'Etched MTJ Wafer', 'Oblea MTJ grabada', 'Pillars milled; it still needs its nitride cap.', 'Pilares fresados; a\u00fan necesita su tapa de nitruro.'],
        ['annealed_mram_wafer', 'Annealed MRAM Wafer', 'Oblea MRAM recocida', 'The Heusler/MgO stack, ordered by the anneal.', 'La pila Heusler/MgO, ordenada por el recocido.'],
        ['etched_mram_wafer', 'Etched MRAM Wafer', 'Oblea MRAM grabada', 'Cells milled; it still needs its copper wiring.', 'Celdas fresadas; a\u00fan necesita su cableado de cobre.'],
        ['annealed_saf_wafer', 'Annealed SAF Wafer', 'Oblea SAF recocida', 'The synthetic antiferromagnet, pinned.', 'El antiferromagneto sint\u00e9tico, fijado.'],
        ['written_track_wafer', 'Written Track Wafer', 'Oblea de pista escrita', 'Racetrack tracks drawn with the electron beam.', 'Pistas de hip\u00f3dromo dibujadas con el haz de electrones.'],
        ['sot_heterostack', 'SOT Heterostack', 'Heteropila SOT', 'hBN, WTe2, Fe3GeTe2 and hBN, stacked.', 'hBN, WTe2, Fe3GeTe2 y hBN, apilados.'],
        ['contacted_sot_stack', 'Contacted SOT Stack', 'Pila SOT con contactos', 'Gold edge contacts in place; it needs an anneal.', 'Contactos de oro en el borde; necesita un recocido.'],
        ['cofe_me_wafer', 'CoFe Magnetoelectric Wafer', 'Oblea magnetoel\u00e9ctrica de CoFe', 'Ready for the switch pattern.', 'Lista para el patr\u00f3n del conmutador.'],
        ['yig_film_wafer', 'YIG Film Wafer', 'Oblea de pel\u00edcula YIG', 'Ready for the waveguide pattern.', 'Lista para el patr\u00f3n de la gu\u00eda de ondas.'],
        ['yig_waveguide_wafer', 'YIG Waveguide Wafer', 'Oblea de gu\u00eda de ondas YIG', 'Magnon waveguides, patterned.', 'Gu\u00edas de magnones, grabadas.'],
        ['stno_defined_wafer', 'STNO Defined Wafer', 'Oblea STNO definida', 'Pillars patterned; it still needs ion milling.', 'Pilares grabados; a\u00fan necesita fresado i\u00f3nico.'],
        ['stno_milled_wafer', 'STNO Milled Wafer', 'Oblea STNO fresada', 'Redeposit on the pillar walls; clean it.', 'Redep\u00f3sito en las paredes; l\u00edmpiala.'],
        ['stno_clean_wafer', 'STNO Clean Wafer', 'Oblea STNO limpia', 'Ready for its planarising nitride.', 'Lista para su nitruro planarizante.'],
        ['stno_planarised_wafer', 'STNO Planarised Wafer', 'Oblea STNO planarizada', 'Ready for its gold contacts.', 'Lista para sus contactos de oro.'],
        ['stno_redeposit_dust', 'STNO Redeposit', 'Redep\u00f3sito de STNO', 'Co, Fe and B from the milled pillars; melt it again.', 'Co, Fe y B de los pilares fresados; f\u00fandelo de nuevo.'],
        ['ga2o3_epi_wafer', 'Ga2O3 Epi Wafer', 'Oblea epitaxial de Ga2O3', 'Tin-doped channel layer grown.', 'Capa de canal dopada con esta\u00f1o crecida.'],
        ['ga2o3_gated_wafer', 'Ga2O3 Gated Wafer', 'Oblea de Ga2O3 con puerta', 'Gates written; dice it into power dies.', 'Puertas escritas; c\u00f3rtala en dados de potencia.']
    ]

    // full recipe key, en line, es line
    var RECIPES = [
        ['gtceu.recipe.grindless_electron_beam.five_n_cobalt', 'Circuit 9: 5N cobalt; the hearth liner leaves a skull', 'Circuito 9: cobalto 5N; el revestimiento deja un casquete'],
        ['gtceu.recipe.grindless_electron_beam.five_n_iron', 'Circuit 10: 5N iron; the hearth liner leaves a skull', 'Circuito 10: hierro 5N; el revestimiento deja un casquete'],
        ['gtceu.recipe.grindless_electron_beam.five_n_manganese', 'Circuit 11: 5N manganese; the hearth liner leaves a skull', 'Circuito 11: manganeso 5N; el revestimiento deja un casquete'],
        ['gtceu.recipe.grindless_electron_beam.five_n_silicon', 'Circuit 12: 5N silicon; the hearth liner leaves a skull', 'Circuito 12: silicio 5N; el revestimiento deja un casquete'],
        ['gtceu.recipe.grindless_electron_beam.five_n_nickel', 'Circuit 13: 5N nickel; the hearth liner leaves a skull', 'Circuito 13: n\u00edquel 5N; el revestimiento deja un casquete'],
        ['gtceu.recipe.grindless_electron_beam.five_n_gallium', 'Circuit 14: 5N gallium; the hearth liner leaves a skull', 'Circuito 14: galio 5N; el revestimiento deja un casquete'],
        ['gtceu.recipe.grindless_electron_beam.nanoaperture_array', 'Circuit 15: nanoapertures drilled in a SiN membrane under argon; the silicon nitride swarf is kept', 'Circuito 15: nanoaberturas perforadas en una membrana de SiN bajo arg\u00f3n; se conserva la viruta de nitruro de silicio'],
        ['gtceu.recipe.grindless_electron_beam.racetrack_tracks', 'Circuit 16: racetrack tracks written in the annealed SAF stack by electron beam', 'Circuito 16: pistas de hip\u00f3dromo escritas con haz de electrones en la pila SAF recocida'],
        ['gtceu.recipe.grindless_electron_beam.yig_waveguides', 'Circuit 17: magnon waveguides written in the YIG film by electron beam', 'Circuito 17: gu\u00edas de magnones escritas con haz de electrones en la pel\u00edcula YIG'],
        ['gtceu.recipe.grindless_electron_beam.vdw_edge_contacts', 'Circuit 18: gold edge contacts on the van der Waals stack', 'Circuito 18: contactos de oro en el borde de la pila de van der Waals'],
        ['gtceu.recipe.grindless_electron_beam.me_switch_pattern', 'Circuit 19: the magnetoelectric switch pattern written by electron beam', 'Circuito 19: el patr\u00f3n del conmutador magnetoel\u00e9ctrico escrito con haz de electrones'],
        ['gtceu.recipe.grindless_electron_beam.c12_vapour', 'Circuit 20: carbon-12 evaporated into the fuel the burners use; the skull goes back to stock', 'Circuito 20: carbono-12 evaporado en el combustible de los quemadores; el casquete vuelve al almac\u00e9n'],
        ['gtceu.recipe.grindless_electron_beam.stno_pillars', 'Circuit 27: STNO pillars defined in the stack by electron beam', 'Circuito 27: pilares STNO definidos en la pila con haz de electrones'],
        ['gtceu.recipe.grindless_electron_beam.ga2o3_gates', 'Circuit 28: gate patterns written on the Ga2O3 epi wafer', 'Circuito 28: patrones de puerta escritos en la oblea epitaxial de Ga2O3'],
        ['gtceu.recipe.grindless_electron_beam.mu_metal_ingot', 'Circuit 29: mu-metal blend melted into ingots; the skull goes back to stock', 'Circuito 29: la mezcla de mu-metal fundida en lingotes; el casquete vuelve al almac\u00e9n'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.mtj_anneal', 'Circuit 8: the MTJ stack crystallised in a field under argon', 'Circuito 8: la pila MTJ cristalizada en un campo bajo arg\u00f3n'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.mram_anneal', 'Circuit 9: the MRAM stack ordered under argon', 'Circuito 9: la pila MRAM ordenada bajo arg\u00f3n'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.saf_anneal', 'Circuit 10: the SAF stack pinned in a field', 'Circuito 10: la pila SAF fijada en un campo'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.heusler_homogenise', 'Circuit 11: the cast Heusler ingot homogenised', 'Circuito 11: el lingote Heusler colado homogeneizado'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.sot_anneal', 'Circuit 12: the contacted SOT stack annealed into the readout stack', 'Circuito 12: la pila SOT con contactos recocida hasta la pila de lectura'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.ni_mn_ga_twin_training', 'Circuit 13: the Ni-Mn-Ga crystal trained in a field', 'Circuito 13: el cristal Ni-Mn-Ga entrenado en un campo'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.mu_metal_anneal', 'Circuit 14: mu-metal foil annealed in hydrogen; the hydrogen leaves as steam', 'Circuito 14: l\u00e1mina de mu-metal recocida en hidr\u00f3geno; el hidr\u00f3geno sale como vapor'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.finemet_field_anneal', 'Circuit 15: the Finemet toroid nanocrystallised in a field', 'Circuito 15: el toroide de Finemet nanocristalizado en un campo'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.w184_fibre_preform', 'Circuit 5: W-184 wire infiltrated with carbon from methane; the hydrogen goes back to stock', 'Circuito 5: alambre de W-184 infiltrado con carbono desde metano; el hidr\u00f3geno vuelve al almac\u00e9n'],
        ['gtceu.recipe.grindless_levitation_melting.cofeb_melt', 'Circuit 9: 5N Co, Fe and boron melted into CoFeB', 'Circuito 9: Co 5N, Fe y boro fundidos en CoFeB'],
        ['gtceu.recipe.grindless_levitation_melting.heusler_melt', 'Circuit 10: Co, Mn and Si melted into the Heusler alloy', 'Circuito 10: Co, Mn y Si fundidos en la aleaci\u00f3n Heusler'],
        ['gtceu.recipe.grindless_levitation_melting.terfenol_d_melt', 'Circuit 11: Tb, Dy and Fe melted into Terfenol-D', 'Circuito 11: Tb, Dy y Fe fundidos en Terfenol-D'],
        ['gtceu.recipe.grindless_levitation_melting.ni_mn_ga_melt', 'Circuit 12: Ni, Mn and Ga melted into Ni-Mn-Ga', 'Circuito 12: Ni, Mn y Ga fundidos en Ni-Mn-Ga'],
        ['gtceu.recipe.grindless_levitation_melting.finemet_melt', 'Circuit 13: the Finemet charge melted for planar flow casting', 'Circuito 13: la carga de Finemet fundida para colada de flujo plano'],
        ['gtceu.recipe.grindless_levitation_melting.stno_redeposit_remelt', 'Circuit 14: the STNO mill redeposit melted back into CoFeB', 'Circuito 14: el redep\u00f3sito del fresado STNO fundido de nuevo en CoFeB'],
        ['gtceu.recipe.grindless_levitation_melting.terfenol_d_remelt', 'Circuit 15: Terfenol-D rod ends melted back into ingots', 'Circuito 15: los extremos de las barras de Terfenol-D fundidos de nuevo en lingotes'],
        ['gtceu.recipe.grindless_levitation_melting.ni_mn_ga_remelt', 'Circuit 16: Ni-Mn-Ga crystal offcuts melted back into ingots', 'Circuito 16: los recortes de cristal de Ni-Mn-Ga fundidos de nuevo en lingotes'],
        ['gtceu.recipe.grindless_megabar.hbn_crystal', 'Circuit 6: hBN grown under pressure with barium. Anvil wear: 10 % per run.', 'Circuito 6: hBN crecido a presi\u00f3n con bario. Desgaste del yunque: 10 % por ciclo.'],
        ['gtceu.recipe.grindless_crystal_growth.ggg_boule', 'Circuit 10: a GGG boule pulled from the melt in an iridium crucible', 'Circuito 10: un boule de GGG extra\u00eddo del fundido en un crisol de iridio'],
        ['gtceu.recipe.grindless_crystal_growth.dysco3_boule', 'Circuit 11: a DyScO3 boule pulled from the melt in an iridium crucible', 'Circuito 11: un boule de DyScO3 extra\u00eddo del fundido en un crisol de iridio'],
        ['gtceu.recipe.grindless_crystal_growth.wte2_cvt', 'Circuit 12: WTe2 grown by vapour transport; 90 % of the iodine is recovered', 'Circuito 12: WTe2 crecido por transporte de vapor; se recupera el 90 % del yodo'],
        ['gtceu.recipe.grindless_crystal_growth.fgt_cvt', 'Circuit 13: Fe3GeTe2 grown by vapour transport; 90 % of the iodine is recovered', 'Circuito 13: Fe3GeTe2 crecido por transporte de vapor; se recupera el 90 % del yodo'],
        ['gtceu.recipe.grindless_crystal_growth.ga2o3_efg', 'Circuit 14: a Ga2O3 plate pulled through an iridium die; the worn die goes to the platinum plant', 'Circuito 14: una placa de Ga2O3 extra\u00edda por una matriz de iridio; la matriz gastada va a la planta de platino'],
        ['gtceu.recipe.grindless_crystal_growth.terfenol_d_rod', 'Circuit 15: a textured Terfenol-D rod drawn from the ingot; the offcut returns as dust', 'Circuito 15: una varilla de Terfenol-D texturizada del lingote; el recorte vuelve como polvo'],
        ['gtceu.recipe.grindless_crystal_growth.ni_mn_ga_crystal_growth', 'Circuit 16: a Ni-Mn-Ga single crystal drawn from the ingot; the offcut returns as dust', 'Circuito 16: un monocristal Ni-Mn-Ga del lingote; el recorte vuelve como polvo'],
        ['gtceu.recipe.grindless_crystal_growth.wte2_recrystallise', 'Circuit 17: WTe2 dust recrystallised by vapour transport', 'Circuito 17: polvo de WTe2 recristalizado por transporte de vapor'],
        ['gtceu.recipe.grindless_crystal_growth.fgt_recrystallise', 'Circuit 18: Fe3GeTe2 dust recrystallised by vapour transport', 'Circuito 18: polvo de Fe3GeTe2 recristalizado por transporte de vapor'],
        ['gtceu.recipe.grindless_photonic_foundry.meso_logic_die', 'Circuit 17: the MESO logic die bonded under argon; the argon is recovered', 'Circuito 17: el dado l\u00f3gico MESO unido bajo arg\u00f3n; el arg\u00f3n se recupera'],
        ['gtceu.recipe.grindless_photonic_foundry.mram_copper', 'Circuit 18: the MRAM wafer wired with copper', 'Circuito 18: la oblea MRAM cableada con cobre'],
        ['gtceu.recipe.grindless_photonic_foundry.rf_carpet_board', 'Circuit 19: a gold-plated RF carpet board', 'Circuito 19: una placa de alfombra RF chapada en oro'],
        ['gtceu.recipe.grindless_photonic_foundry.stno_contacts', 'Circuit 20: gold contacts on the planarised STNO wafer', 'Circuito 20: contactos de oro en la oblea STNO planarizada'],
        ['gtceu.recipe.grindless_photonic_foundry.ga2o3_dicing', 'Circuit 21: the gated wafer diced into four power dies; the kerf returns as oxide dust', 'Circuito 21: la oblea con puerta cortada en cuatro dados de potencia; el corte vuelve como \u00f3xido en polvo'],
        ['gtceu.recipe.grindless_photonic_foundry.shielded_interposer', 'Circuit 22: a mu-metal can soldered over a glass interposer', 'Circuito 22: una lata de mu-metal soldada sobre un interpositor de vidrio']
    ]

    ;['en_us', 'es_es'].forEach(function (lang, li) {
        ClientEvents.lang(lang, function (event) {
            ITEMS.forEach(function (e) {
                event.add('grindless', 'item.grindless.' + e[0], e[1 + li])
                event.add('grindless', 'tooltip.grindless.' + e[0] + '.0', e[3 + li])
            })
            RECIPES.forEach(function (e) {
                event.add('grindless', e[0], e[1 + li])
            })
        })
    })
})()
