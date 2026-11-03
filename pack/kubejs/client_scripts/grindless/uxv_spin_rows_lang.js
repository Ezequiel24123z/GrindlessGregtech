// priority: 1479
// Gregtech Grindless - names and tooltips of the UXV spintronic rows (startup_scripts/grindless/uxv/spin_rows.js) and the EMI lines of the
// new rows in the shared tables:
//
//   grindless:<item>   item.grindless.<n> plus one tooltip line (tooltip.grindless.<n>.0)
//   gtceu.recipe.<dataKey>.<recipe>   the EMI line of each new row of a custom machine
//
// Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts. Names go in en_us.
(function () {
    // id, en name, es name, en tip, es tip
    var ITEMS = [
        ['five_n_cobalt', '5N Cobalt', 'Electron-beam refined; for the spintronic films.'],
        ['five_n_iron', '5N Iron', 'Electron-beam refined; for the spintronic films.'],
        ['five_n_manganese', '5N Manganese', 'Electron-beam refined; for the Heusler and Ni-Mn-Ga melts.'],
        ['five_n_silicon', '5N Silicon', 'Electron-beam refined; for the Heusler melt.'],
        ['five_n_nickel', '5N Nickel', 'Electron-beam refined; for the Ni-Mn-Ga melt.'],
        ['five_n_gallium', '5N Gallium', 'Electron-beam refined; for the Ni-Mn-Ga melt.'],
        ['mu_metal_blend', 'Mu-Metal Blend', 'Nickel, iron and molybdenum, mixed.'],
        ['mu_metal_ingot', 'Mu-Metal Ingot', 'Electron-beam melted; goes to the hot strip mill.'],
        ['mu_metal_hot_band', 'Mu-Metal Hot Band', 'Rolled once; rolled again into foil.'],
        ['annealed_mu_foil', 'Annealed Mu-Metal Foil', 'Annealed in hydrogen for high permeability.'],
        ['mu_metal_shield_can', 'Mu-Metal Shield Can', 'Shields a chip from stray magnetic fields.'],
        ['finemet_charge_dust', 'Finemet Charge', 'Fe-Si-B-Nb-Cu, ready to melt.'],
        ['heusler_cast_ingot', 'Cast Heusler Ingot', 'Still segregated; it needs a homogenising anneal.'],
        ['ni_mn_ga_raw_crystal', 'Raw Ni-Mn-Ga Crystal', 'Needs twin training in a field.'],
        ['raw_hbn_crystal', 'Raw hBN Crystal', 'Grown with barium; the barium is leached out.'],
        ['wte2_raw_crystal', 'Raw WTe2 Crystal', 'Grown by vapour transport; needs a tellurium anneal.'],
        ['fgt_raw_crystal', 'Raw Fe3GeTe2 Crystal', 'Grown by vapour transport; needs a tellurium anneal.'],
        ['dysco3_boule', 'DyScO3 Boule', 'Sawn into slices.'],
        ['ggg_boule', 'GGG Boule', 'Sawn into slices.'],
        ['ga2o3_efg_plate', 'Ga2O3 EFG Plate', 'Pulled through an iridium die; sawn into slices.'],
        ['dysco3_slice', 'DyScO3 Slice', 'Rough from the saw; polish it.'],
        ['dysco3_polished_slice', 'Polished DyScO3 Slice', 'Anneal it into a substrate.'],
        ['ggg_slice', 'GGG Slice', 'Rough from the saw; polish it.'],
        ['ggg_polished_slice', 'Polished GGG Slice', 'Anneal it into a wafer.'],
        ['ga2o3_slice', 'Ga2O3 Slice', 'Rough from the saw; polish it into a wafer.'],
        ['annealed_mtj_wafer', 'Annealed MTJ Wafer', 'The CoFeB/MgO stack, crystallised in a field.'],
        ['etched_mtj_wafer', 'Etched MTJ Wafer', 'Pillars milled; it still needs its nitride cap.'],
        ['annealed_mram_wafer', 'Annealed MRAM Wafer', 'The Heusler/MgO stack, ordered by the anneal.'],
        ['etched_mram_wafer', 'Etched MRAM Wafer', 'Cells milled; it still needs its copper wiring.'],
        ['annealed_saf_wafer', 'Annealed SAF Wafer', 'The synthetic antiferromagnet, pinned.'],
        ['written_track_wafer', 'Written Track Wafer', 'Racetrack tracks drawn with the electron beam.'],
        ['sot_heterostack', 'SOT Heterostack', 'hBN, WTe2, Fe3GeTe2 and hBN, stacked.'],
        ['contacted_sot_stack', 'Contacted SOT Stack', 'Gold edge contacts in place; it needs an anneal.'],
        ['cofe_me_wafer', 'CoFe Magnetoelectric Wafer', 'Ready for the switch pattern.'],
        ['yig_film_wafer', 'YIG Film Wafer', 'Ready for the waveguide pattern.'],
        ['yig_waveguide_wafer', 'YIG Waveguide Wafer', 'Magnon waveguides, patterned.'],
        ['stno_defined_wafer', 'STNO Defined Wafer', 'Pillars patterned; it still needs ion milling.'],
        ['stno_milled_wafer', 'STNO Milled Wafer', 'Redeposit on the pillar walls; clean it.'],
        ['stno_clean_wafer', 'STNO Clean Wafer', 'Ready for its planarising nitride.'],
        ['stno_planarised_wafer', 'STNO Planarised Wafer', 'Ready for its gold contacts.'],
        ['stno_redeposit_dust', 'STNO Redeposit', 'Co, Fe and B from the milled pillars; melt it again.'],
        ['ga2o3_epi_wafer', 'Ga2O3 Epi Wafer', 'Tin-doped channel layer grown.'],
        ['ga2o3_gated_wafer', 'Ga2O3 Gated Wafer', 'Gates written; dice it into power dies.']
    ]

    // full recipe key, en line, es line
    var RECIPES = [
        ['gtceu.recipe.grindless_electron_beam.five_n_cobalt', 'Circuit 9: 5N cobalt; the hearth liner leaves a skull'],
        ['gtceu.recipe.grindless_electron_beam.five_n_iron', 'Circuit 10: 5N iron; the hearth liner leaves a skull'],
        ['gtceu.recipe.grindless_electron_beam.five_n_manganese', 'Circuit 11: 5N manganese; the hearth liner leaves a skull'],
        ['gtceu.recipe.grindless_electron_beam.five_n_silicon', 'Circuit 12: 5N silicon; the hearth liner leaves a skull'],
        ['gtceu.recipe.grindless_electron_beam.five_n_nickel', 'Circuit 13: 5N nickel; the hearth liner leaves a skull'],
        ['gtceu.recipe.grindless_electron_beam.five_n_gallium', 'Circuit 14: 5N gallium; the hearth liner leaves a skull'],
        ['gtceu.recipe.grindless_electron_beam.nanoaperture_array', 'Circuit 15: nanoapertures drilled in a SiN membrane under argon; the silicon nitride swarf is kept'],
        ['gtceu.recipe.grindless_electron_beam.racetrack_tracks', 'Circuit 16: racetrack tracks written in the annealed SAF stack by electron beam'],
        ['gtceu.recipe.grindless_electron_beam.yig_waveguides', 'Circuit 17: magnon waveguides written in the YIG film by electron beam'],
        ['gtceu.recipe.grindless_electron_beam.vdw_edge_contacts', 'Circuit 18: gold edge contacts on the van der Waals stack'],
        ['gtceu.recipe.grindless_electron_beam.me_switch_pattern', 'Circuit 19: the magnetoelectric switch pattern written by electron beam'],
        ['gtceu.recipe.grindless_electron_beam.c12_vapour', 'Circuit 20: carbon-12 evaporated into the fuel the burners use; the skull goes back to stock'],
        ['gtceu.recipe.grindless_electron_beam.stno_pillars', 'Circuit 27: STNO pillars defined in the stack by electron beam'],
        ['gtceu.recipe.grindless_electron_beam.ga2o3_gates', 'Circuit 28: gate patterns written on the Ga2O3 epi wafer'],
        ['gtceu.recipe.grindless_electron_beam.mu_metal_ingot', 'Circuit 29: mu-metal blend melted into ingots; the skull goes back to stock'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.mtj_anneal', 'Circuit 8: the MTJ stack crystallised in a field under argon'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.mram_anneal', 'Circuit 9: the MRAM stack ordered under argon'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.saf_anneal', 'Circuit 10: the SAF stack pinned in a field'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.heusler_homogenise', 'Circuit 11: the cast Heusler ingot homogenised'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.sot_anneal', 'Circuit 12: the contacted SOT stack annealed into the readout stack'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.ni_mn_ga_twin_training', 'Circuit 13: the Ni-Mn-Ga crystal trained in a field'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.mu_metal_anneal', 'Circuit 14: mu-metal foil annealed in hydrogen; the hydrogen leaves as steam'],
        ['gtceu.recipe.grindless_nitride_magnet_synthesis.finemet_field_anneal', 'Circuit 15: the Finemet toroid nanocrystallised in a field'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.w184_fibre_preform', 'Circuit 5: W-184 wire infiltrated with carbon from methane; the hydrogen goes back to stock'],
        ['gtceu.recipe.grindless_levitation_melting.cofeb_melt', 'Circuit 9: 5N Co, Fe and boron melted into CoFeB'],
        ['gtceu.recipe.grindless_levitation_melting.heusler_melt', 'Circuit 10: Co, Mn and Si melted into the Heusler alloy'],
        ['gtceu.recipe.grindless_levitation_melting.terfenol_d_melt', 'Circuit 11: Tb, Dy and Fe melted into Terfenol-D'],
        ['gtceu.recipe.grindless_levitation_melting.ni_mn_ga_melt', 'Circuit 12: Ni, Mn and Ga melted into Ni-Mn-Ga'],
        ['gtceu.recipe.grindless_levitation_melting.finemet_melt', 'Circuit 13: the Finemet charge melted for planar flow casting'],
        ['gtceu.recipe.grindless_levitation_melting.stno_redeposit_remelt', 'Circuit 14: the STNO mill redeposit melted back into CoFeB'],
        ['gtceu.recipe.grindless_levitation_melting.terfenol_d_remelt', 'Circuit 15: Terfenol-D rod ends melted back into ingots'],
        ['gtceu.recipe.grindless_levitation_melting.ni_mn_ga_remelt', 'Circuit 16: Ni-Mn-Ga crystal offcuts melted back into ingots'],
        ['gtceu.recipe.grindless_megabar.hbn_crystal', 'Circuit 6: hBN grown under pressure with barium. Anvil wear: 10 % per run.'],
        ['gtceu.recipe.grindless_crystal_growth.ggg_boule', 'Circuit 10: a GGG boule pulled from the melt in an iridium crucible'],
        ['gtceu.recipe.grindless_crystal_growth.dysco3_boule', 'Circuit 11: a DyScO3 boule pulled from the melt in an iridium crucible'],
        ['gtceu.recipe.grindless_crystal_growth.wte2_cvt', 'Circuit 12: WTe2 grown by vapour transport; 90 % of the iodine is recovered'],
        ['gtceu.recipe.grindless_crystal_growth.fgt_cvt', 'Circuit 13: Fe3GeTe2 grown by vapour transport; 90 % of the iodine is recovered'],
        ['gtceu.recipe.grindless_crystal_growth.ga2o3_efg', 'Circuit 14: a Ga2O3 plate pulled through an iridium die; the worn die goes to the platinum plant'],
        ['gtceu.recipe.grindless_crystal_growth.terfenol_d_rod', 'Circuit 15: a textured Terfenol-D rod drawn from the ingot; the offcut returns as dust'],
        ['gtceu.recipe.grindless_crystal_growth.ni_mn_ga_crystal_growth', 'Circuit 16: a Ni-Mn-Ga single crystal drawn from the ingot; the offcut returns as dust'],
        ['gtceu.recipe.grindless_crystal_growth.wte2_recrystallise', 'Circuit 17: WTe2 dust recrystallised by vapour transport'],
        ['gtceu.recipe.grindless_crystal_growth.fgt_recrystallise', 'Circuit 18: Fe3GeTe2 dust recrystallised by vapour transport'],
        ['gtceu.recipe.grindless_photonic_foundry.mram_copper', 'Circuit 18: the MRAM wafer wired with copper'],
        ['gtceu.recipe.grindless_photonic_foundry.rf_carpet_board', 'Circuit 19: a gold-plated RF carpet board'],
        ['gtceu.recipe.grindless_photonic_foundry.stno_contacts', 'Circuit 20: gold contacts on the planarised STNO wafer'],
        ['gtceu.recipe.grindless_photonic_foundry.ga2o3_dicing', 'Circuit 21: the gated wafer diced into four power dies; the kerf returns as oxide dust'],
        ['gtceu.recipe.grindless_photonic_foundry.shielded_interposer', 'Circuit 22: a mu-metal can soldered over a glass interposer']
    ]

    ClientEvents.lang('en_us', function (event) {
        ITEMS.forEach(function (e) {
            event.add('grindless', 'item.grindless.' + e[0], e[1])
            event.add('grindless', 'tooltip.grindless.' + e[0] + '.0', e[2])
        })
        RECIPES.forEach(function (e) {
            event.add('grindless', e[0], e[1])
        })
    })
})()
