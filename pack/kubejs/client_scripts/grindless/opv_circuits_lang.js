// priority: 5808
// Gregtech Grindless - names and tooltips of the OpV circuit lines (startup_scripts/grindless/opv/circuits.js, package OpV-A2):
//
//   grindless:<item>          item.grindless.<n> plus two tooltip lines (tooltip.grindless.<n>.0 and .1)
//   gtceu:<material> (fluid)  material.gtceu.<n>
//   recipe rows               gtceu.recipe.<dataKey>.<name> (the EMI line of each row on an older machine with a data key)
//
// The finished parts (cryo_cmos_die, nb_tsv_interposer, cryo_optical_link, hemt_amplifier, gated_2deg_wafer, gan_mmic, sdd_die) are named by
// client_scripts/grindless/opv_foundation_lang.js. Kept out of pack/kubejs/assets/grindless/lang/* like the other *_lang.js scripts.
// Names go in en_us.
(function () {
    // id, name, tip 0, tip 1
    var ITEMS = [
        ['si28_poly_rod', 'Si-28 Polysilicon Rod', 'Isotopically pure silicon grown from Si-28 trichlorosilane in the MOCVD reactor.', 'Zone-refined into a Si-28 float-zone ingot.'],
        ['si_inp_boule', 'Semi-Insulating InP Boule', 'Indium phosphide pulled with a trace of iron under a boron oxide cap.', 'The iron pins the Fermi level: no leakage at 4 K.'],
        ['si_inp_wafer', 'Semi-Insulating InP Wafer', 'The substrate of the 2DEG and HEMT epitaxy.', 'Sawn from a semi-insulating InP boule.'],
        ['inp_scrap', 'InP Scrap', 'Kerf, boule ends and wafer edges of indium phosphide.', 'Leached back to indium in the extraction cascade.'],
        ['inas_qw_wafer', 'InAs Quantum Well Wafer', 'A shallow InAs quantum well grown by MBE on semi-insulating InP.', 'An epitaxial aluminium film comes next.'],
        ['hbn_capped_2deg_wafer', 'hBN-Capped 2DEG Wafer', 'The InAs/Al wafer under an annealed hBN gate dielectric.', 'Gates are written on it by STM lithography.'],
        ['annealed_soi_wafer', 'Annealed SOI Wafer', 'The bonded Si-28 SOI wafer after a 1,373 K nitrogen anneal that strengthens the bond.', 'A boron ground plane is implanted next.'],
        ['back_gated_soi_wafer', 'Back-Gated SOI Wafer', 'A boron ground plane under the buried oxide lets the back gate tune thresholds at 4 K.', 'The hafnium oxide and titanium nitride gate stack comes next.'],
        ['gate_stack_soi_wafer', 'Gate Stack SOI Wafer', 'Si-28 on insulator under a hafnium oxide and titanium nitride gate stack.', 'Exposed in the BEUV scanner.'],
        ['cryo_cmos_litho_wafer', 'Patterned Cryo-CMOS Wafer', 'The gate stack patterned at 6.7 nm.', 'Its sources and drains are implanted next.'],
        ['cryo_cmos_implanted_wafer', 'Implanted Cryo-CMOS Wafer', 'Arsenic-implanted sources and drains, dopants not yet active.', 'A millisecond flash anneal in the electron beam furnace activates them.'],
        ['activated_cmos_wafer', 'Activated CMOS Wafer', 'Dopants activated by a millisecond electron-beam flash, without diffusing.', 'Tungsten plugs are grown in the MOCVD reactor.'],
        ['contacted_cmos_wafer', 'Contacted CMOS Wafer', 'Tungsten contact plugs reach every source, drain and gate.', 'Gold interconnect is sputtered on next.'],
        ['cryo_cmos_metal_wafer', 'Metallised Cryo-CMOS Wafer', 'Gold interconnect over the cryo-CMOS transistors.', 'Vias and the top metal are patterned in the BEUV scanner.'],
        ['interconnected_cmos_wafer', 'Interconnected CMOS Wafer', 'The back end finished: vias and top metal patterned over the cryo-CMOS.', 'Diced into untested dies.'],
        ['untested_cryo_cmos_die', 'Untested Cryo-CMOS Die', 'A cryo-CMOS controller die that has not yet been cold.', 'Tested at 4 K in the helium refrigerator.'],
        ['gold_overspray', 'Gold Overspray', 'Gold scraped from the sputter shields.', 'Dissolved back to gold in the platinum plant.'],
        ['rrr_nb_target', 'High-RRR Niobium Target', 'A sputter target of SRF-grade niobium on a copper backing plate.', 'Fills the TSVs and makes the NbTiN film.'],
        ['tsv_via_wafer', 'TSV Via Wafer', 'Float-zone silicon with through-silicon vias etched in it.', 'The vias are filled with niobium.'],
        ['nb_filled_tsv_wafer', 'Nb-Filled TSV Wafer', 'Every via filled with high-RRR niobium.', 'Bonded to an oxidised handle wafer.'],
        ['bonded_tsv_interposer', 'Bonded TSV Interposer', 'The niobium TSV wafer bonded and thinned on its handle.', 'Cooled below 9.2 K so each via is checked superconducting.'],
        ['nbtin_film_wafer', 'NbTiN Film Wafer', 'A reactively sputtered niobium titanium nitride film on sapphire.', 'High kinetic inductance, low loss.'],
        ['ln_on_soi_wafer', 'LN-on-SOI Wafer', 'A lithium niobate film sliced onto Si-28 on insulator.', 'Waveguides are written in it next.'],
        ['ln_soi_waveguide_wafer', 'LN-on-SOI Waveguide Wafer', 'Femtosecond-written waveguides and modulators in the LN film.', 'NbN detectors are added in the SNSPD foundry.'],
        ['snspd_link_wafer', 'SNSPD Link Wafer', 'Modulators and NbN nanowire detectors on one LN-on-SOI chip.', 'Pigtailed to fibre in the fibre draw tower.'],
        ['inp_hemt_epi_wafer', 'InP HEMT Epi Wafer', 'An InGaAs/InAlAs channel grown by MBE on semi-insulating InP.', 'Its T-gates are exposed in the BEUV scanner.'],
        ['hemt_gated_wafer', 'Gated HEMT Wafer', 'Sub-50 nm T-gates over the HEMT channel.', 'Isolated by helium implantation.'],
        ['isolated_hemt_wafer', 'Isolated HEMT Wafer', 'Each transistor isolated from its neighbours by helium damage.', 'Diced into cryogenic amplifiers.'],
        ['hpsi_sic_wafer', 'HPSI SiC Wafer', 'High-purity semi-insulating silicon carbide.', 'The substrate of the GaN epitaxy.'],
        ['gan_sic_epi_wafer', 'GaN-on-SiC Epi Wafer', 'An AlGaN/GaN heterostructure on semi-insulating SiC.', 'Its gates are exposed in the BEUV scanner.'],
        ['gan_gated_wafer', 'Gated GaN Wafer', 'GaN transistors with their gates written.', 'Passivated and plated into MMICs in the SiC device fab.'],
        ['sdd_ring_wafer', 'SDD Drift Ring Wafer', 'Boron-implanted drift rings on float-zone silicon.', 'The anode is exposed in the BEUV scanner.'],
        ['sdd_anode_wafer', 'SDD Anode Wafer', 'The drift rings around a small collecting anode.', 'Metallised and diced in the MTJ sputter tool.']
    ]

    // kind, id, name
    var NAMES = [
        ['material', 'si28_trichlorosilane', 'Si-28 Trichlorosilane'],
        ['material', 'crude_si28_trichlorosilane', 'Crude Si-28 Trichlorosilane'],
        ['material', 'si28_tetrachloride', 'Si-28 Tetrachloride'],
        ['material', 'chlorosilane_purge', 'Chlorosilane Purge'],
        ['material', 'gan_mocvd_exhaust', 'GaN MOCVD Exhaust']
    ]
    var PREFIX = { material: 'material.gtceu.' }

    // EMI lines of this package's rows on older machines whose types carry a data key (gtceu.recipe.<dataKey>.<name>)
    var RECIPES = [
        ['gtceu.recipe.grindless_crystal_growth.si_inp_boule', 'Circuit 21: semi-insulating InP pulled with a trace of iron under the boron oxide cap'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.inas_qw', 'Circuit 9: an InAs quantum well on semi-insulating InP; half the arsenic comes back'],
        ['gtceu.recipe.grindless_molecular_beam_epitaxy.inp_hemt_epi', 'Circuit 10: the InGaAs/InAlAs HEMT channel on semi-insulating InP; half the arsenic comes back'],
        ['gtceu.recipe.grindless_beuv_lithography.cryo_cmos_exposure', 'Circuit 4: the cryo-CMOS gates; the mirror comes out fouled'],
        ['gtceu.recipe.grindless_beuv_lithography.cmos_via_exposure', 'Circuit 17: vias and top metal of the cryo-CMOS back end; the mirror comes out fouled'],
        ['gtceu.recipe.grindless_electron_beam.cmos_flash_anneal', 'Circuit 29: a millisecond flash anneal activates the dopants without letting them diffuse'],
        ['gtceu.recipe.grindless_beuv_lithography.tsv_exposure', 'Circuit 5: the through-silicon vias of the Nb interposer'],
        ['gtceu.recipe.grindless_beuv_lithography.hemt_gate_exposure', 'Circuit 6: the T-gates of the InP HEMT'],
        ['gtceu.recipe.grindless_beuv_lithography.gan_gate_exposure', 'Circuit 7: the gates of the GaN-on-SiC transistors'],
        ['gtceu.recipe.grindless_beuv_lithography.sdd_anode_exposure', 'Circuit 8: the collecting anode inside the drift rings'],
        ['gtceu.recipe.grindless_stm_lithography.gate_2deg', 'Circuit 4: gate electrodes written through the hBN cap; the helium boils off'],
        ['gtceu.recipe.grindless_mtj_sputtering.cryo_cmos_metal', 'Circuit 5: gold interconnect from foil; the overspray goes to the platinum plant'],
        ['gtceu.recipe.grindless_mtj_sputtering.nb_tsv_fill', 'Circuit 6: the vias filled with RRR niobium; the trim goes to scrap'],
        ['gtceu.recipe.grindless_mtj_sputtering.nbtin_film', 'Circuit 7: NbTiN sputtered in nitrogen onto sapphire'],
        ['gtceu.recipe.grindless_mtj_sputtering.sdd_metal', 'Circuit 8: aluminium contacts, then the wafer is diced into four SDD dies'],
        ['gtceu.recipe.grindless_ion_slicing.tsv_bond', 'Circuit 5: the via wafer bonded to an oxidised handle and thinned'],
        ['gtceu.recipe.grindless_ion_slicing.ln_on_soi', 'Circuit 6: a lithium niobate film sliced onto Si-28 SOI; the donor is often reused'],
        ['gtceu.recipe.grindless_femtosecond_writing.ln_soi_waveguides', 'Circuit 6: waveguides and modulators written in the LN film under 2 glass dust'],
        ['gtceu.recipe.grindless_snspd_fabrication.snspd_link', 'Circuit 6: NbN nanowire detectors on the LN-on-SOI link chip'],
        ['gtceu.recipe.grindless_chemical_vapour_infiltration.hpsi_sic', 'Circuit 8: a high-purity SiC layer grown from methyltrichlorosilane'],
        ['gtceu.recipe.grindless_silicon_carbide.gan_mmic', 'Circuit 6: the gated GaN wafer passivated, plated and diced into four MMICs'],
        ['gtceu.recipe.grindless_photonic_integration.cosmic_mainframe', 'Circuit 8: the cosmic mainframe, joined from the four cryogenic parts']
    ]

    ClientEvents.lang('en_us', function (event) {
        var add = function (key, value) { event.add('grindless', key, value) }
        ITEMS.forEach(function (e) {
            add('item.grindless.' + e[0], e[1])
            add('tooltip.grindless.' + e[0] + '.0', e[2])
            add('tooltip.grindless.' + e[0] + '.1', e[3])
        })
        NAMES.forEach(function (e) { add(PREFIX[e[0]] + e[1], e[2]) })
        RECIPES.forEach(function (e) { add(e[0], e[1]) })
    })
})()
