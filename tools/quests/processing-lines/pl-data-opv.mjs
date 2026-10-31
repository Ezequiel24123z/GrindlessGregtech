// pl_opv: the OpV lines. Positions are relative to each cluster (pl-model.mjs places the clusters).
// Each row is one line of docs/eras/opv.md ("New process lines"), keyed by its number, as the recipes run today. Rows start at the
// first OpV-era product (or the older product it takes) and are laid out by chain(), 2.5 columns per step.
// Arrows are checked against a recipe dump by pl-check.mjs (integrator).
import { I, F, M, n } from './pl-lib.mjs';

// a step is [key, resource, title, kind?, options?]: the first step is raw, machines are 'ours', the rest products
function chain(y, steps, end, x0 = 0) {
  const out = steps.map(([key, res, title, kind, opt], i) => n(key, x0 + 2.5 * i, y, res, title, {
    kind: kind || (i === 0 ? 'raw' : res.machine ? 'ours' : 'product'),
    ...(i > 0 ? { from: [steps[i - 1][0]] } : {}),
    ...(opt || {}),
  }));
  const last = out[out.length - 1];
  if (end && last.kind !== 'ours') last.end = end;
  return out;
}
const mach = (id) => M(id);

// one line: spec items are ['i'|'f'|'m', id, title]; keys are l<num>_<index>
const line = (num, y, spec, end, x0 = 0) => chain(y, spec.map(([t, id, title], i) => [
  `l${num}_${i}`, t === 'm' ? mach(id) : t === 'f' ? F(id) : I(id), title,
]), end, x0);
const sx = 'gtceu:spark_plasma_sinterer';
const eb = 'gtceu:electron_beam_furnace';
const cg = 'gtceu:crystal_growth_furnace';
const mocvd = 'gtceu:mocvd_reactor';
const beuv = 'gtceu:beuv_scanner';
const imp = 'gtceu:ion_implanter';
const cvi = 'gtceu:cvi_furnace';
const he = 'gtceu:helium_refrigerator';
const hts = 'gtceu:hts_magnet_works';
const mk = 'gtceu:millikelvin_cryostat_works';
const mbe = 'gtceu:mbe_reactor';
const tfln = 'gtceu:tfln_fab';
const sput = 'gtceu:mtj_sputter_cluster';

export default {
  file: 'pl_opv',
  order: 13,
  title: 'OpV Lines',
  subtitle: 'Chain-strand matter, the Terzan 5 parts, cryogenic wafers and tetrons, beam hardware, antimatter, exotic matter and the Kugelblitz, probe replication and the bulge, and the last superheavy census.',
  icon: 'grindless:tetron_array',
  focus: 'l1_0',
  bands: [['strand', 'parts'], ['wafers', 'beam'], ['antimatter', 'exotic'], ['bulge', 'census']],
  clusters: {
    strand: {
      name: 'Chain strand and field freezing',
      nodes: [
        ...line(1, 0, [
          ['i', 'grindless:chain_crust_slab', 'Chain Crust Slab'],
          ['m', 'gtceu:pasta_phase_sorter', 'Pasta Phase Sorter'],
          ['i', 'grindless:caged_chain_phase', 'Caged Chain Phase'],
          ['m', 'gtceu:pasta_draw_bench', 'Pasta Draw Bench'],
          ['i', 'gtceu:chain_strand_ingot', 'Chain Strand Ingot'],
          ['i', 'gtceu:chain_strand_single_wire', 'Chain Strand Wire'],
          ['i', 'grindless:pbo_braided_chain_wire', 'PBO Braided Wire'],
          ['i', 'gtceu:chain_strand_single_cable', 'Chain Strand Cable'],
        ], 'the OpV hull cables'),
        ...line(2, 2, [
          ['i', 'grindless:chain_lattice_slab', 'Chain Lattice Slab'],
          ['m', 'gtceu:pasta_phase_sorter', 'Pasta Phase Sorter'],
          ['i', 'grindless:caged_chain_lattice', 'Caged Chain Lattice'],
          ['i', 'grindless:chain_lamina', 'Chain Lamina'],
          ['m', 'gtceu:pasta_laminator', 'Pasta Laminator'],
          ['i', 'grindless:chain_lamina_stack', 'Chain Lamina Stack'],
        ], 'the OpV hull'),
        ...line(3, 4, [
          ['i', 'grindless:field_canned_stack', 'Field Canned Stack'],
          ['m', eb, 'Electron Beam Furnace'],
          ['i', 'grindless:field_frozen_billet', 'Field Frozen Billet'],
          ['i', 'grindless:field_frozen_plate', 'Field Frozen Plate'],
          ['m', 'gtceu:field_frozen_press', 'Field Frozen Press'],
          ['i', 'grindless:field_frozen_casing', 'Field Frozen Casing'],
        ], 'the OpV energy hatches'),
      ],
    },
    parts: {
      name: 'Terzan 5 parts',
      nodes: [
        ...line(4, 0, [
          ['i', 'grindless:green_sic_fibre', 'Green SiC Fibre'],
          ['m', 'gtceu:sic_fibre_plant', 'SiC Fibre Plant'],
          ['i', 'grindless:chain_sic_preform', 'Chain SiC Preform'],
          ['m', cvi, 'CVI Furnace'],
          ['i', 'grindless:densified_chain_preform', 'Densified Chain Preform'],
          ['i', 'grindless:chain_composite_rod', 'Chain Composite Rod'],
          ['i', 'grindless:chain_composite_rotor', 'Chain Composite Rotor'],
        ], 'the OpV motor'),
        ...line(5, 2, [
          ['f', 'gtceu:helium_3', 'Helium-3'],
          ['f', 'gtceu:superfluid_helium_3', 'Superfluid Helium-3'],
          ['i', 'grindless:silica_aerogel', 'Silica Aerogel'],
          ['i', 'grindless:superleak_plug', 'Superleak Plug'],
          ['i', 'grindless:superfluid_he3_seal', 'Superfluid He-3 Seal'],
        ], 'the OpV pump'),
        ...line(6, 4, [
          ['i', 'grindless:chain_mesh_weave', 'Chain Mesh Weave'],
          ['m', eb, 'Electron Beam Furnace'],
          ['i', 'grindless:welded_mesh_belt', 'Welded Mesh Belt'],
          ['m', mk, 'Millikelvin Cryostat Works'],
          ['i', 'grindless:chain_mesh_belt', 'Chain Mesh Belt'],
        ], 'the OpV conveyor'),
        ...line(7, 6, [
          ['i', 'grindless:gum_metal_blank', 'Gum Metal Blank'],
          ['m', 'gtceu:megabar_press', 'Megabar Press'],
          ['i', 'grindless:chain_flexspline_cup', 'Flexspline Cup'],
          ['i', 'grindless:toothed_flexspline_cup', 'Toothed Flexspline Cup'],
          ['m', sx, 'Spark Plasma Sinterer'],
          ['i', 'grindless:opv_harmonic_drive', 'OpV Harmonic Drive'],
        ], 'the OpV robot arm'),
        ...line(8, 8, [
          ['i', 'grindless:rebco_pancake', 'REBCO Pancake'],
          ['m', cvi, 'CVI Furnace'],
          ['i', 'grindless:potted_rebco_pancake', 'Potted REBCO Pancake'],
          ['m', hts, 'HTS Magnet Works'],
          ['i', 'grindless:trained_rebco_pancake', 'Trained REBCO Pancake'],
          ['i', 'grindless:chain_field_coil', 'Chain Field Coil'],
        ], 'the OpV field generator'),
        ...line(9, 10, [
          ['i', 'grindless:thorium_229', 'Thorium-229'],
          ['i', 'grindless:thf4', 'ThF4'],
          ['m', cg, 'Crystal Growth Furnace'],
          ['i', 'grindless:th_caf2_lasing_boule', 'Th:CaF2 Boule'],
          ['m', mocvd, 'MOCVD Reactor'],
          ['i', 'grindless:coated_th_caf2_crystal', 'Coated Th:CaF2 Crystal'],
          ['i', 'grindless:th229_lasing_crystal', 'Th-229 Lasing Crystal'],
        ], 'the OpV emitter'),
        ...line(10, 12, [
          ['i', 'grindless:pure_germanium_tetrachloride', 'Pure GeCl4'],
          ['i', 'grindless:thirteen_n_germanium', '13N Germanium'],
          ['m', cg, 'Crystal Growth Furnace'],
          ['i', 'grindless:hpge_compton_boule', 'HPGe Boule'],
          ['m', imp, 'Ion Implanter'],
          ['i', 'grindless:hpge_crystal', 'HPGe Crystal'],
          ['i', 'grindless:hpge_compton_crystal', 'HPGe Compton Crystal'],
        ], 'the OpV sensor'),
      ],
    },
    wafers: {
      name: 'Cryogenic wafers and tetrons',
      nodes: [
        ...line(11, 0, [
          ['i', 'grindless:si28_ash', 'Si-28 Ash'],
          ['i', 'gtceu:si28_trichlorosilane', 'Si-28 Trichlorosilane'],
          ['i', 'grindless:si28_fz_ingot', 'Si-28 FZ Ingot'],
          ['i', 'grindless:si28_fz_wafer', 'Si-28 FZ Wafer'],
          ['m', imp, 'Ion Implanter'],
          ['i', 'grindless:si28_donor_wafer', 'Si-28 Donor Wafer'],
          ['m', tfln, 'TFLN Fab'],
          ['i', 'grindless:si28_soi_wafer', 'Si-28 SOI Wafer'],
        ], 'the OpV circuits'),
        ...line(12, 2, [
          ['i', 'grindless:inp_boule', 'InP Boule'],
          ['m', mbe, 'MBE Reactor'],
          ['i', 'grindless:inas_qw_wafer', 'InAs QW Wafer'],
          ['i', 'grindless:inas_al_wafer', 'InAs-Al Wafer'],
          ['i', 'grindless:hbn_capped_2deg_wafer', 'hBN Capped 2DEG Wafer'],
          ['m', 'gtceu:stm_lithography_cell', 'STM Lithography Cell'],
          ['i', 'grindless:gated_2deg_wafer', 'Gated 2DEG Wafer'],
        ], 'the tetron die'),
        ...line(13, 4, [
          ['i', 'grindless:gate_stack_soi_wafer', 'Gate Stack SOI Wafer'],
          ['m', beuv, 'BEUV Scanner'],
          ['i', 'grindless:cryo_cmos_litho_wafer', 'Cryo-CMOS Litho Wafer'],
          ['i', 'grindless:cryo_cmos_implanted_wafer', 'Cryo-CMOS Implanted Wafer'],
          ['i', 'grindless:cryo_cmos_metal_wafer', 'Cryo-CMOS Metal Wafer'],
          ['i', 'grindless:untested_cryo_cmos_die', 'Untested Cryo-CMOS Die'],
          ['m', he, 'Helium Refrigerator'],
          ['i', 'grindless:cryo_cmos_die', 'Cryo-CMOS Die'],
        ], 'the tetron die'),
        ...line(14, 6, [
          ['i', 'grindless:rrr_nb_target', 'RRR Nb Target'],
          ['i', 'grindless:tsv_via_wafer', 'TSV Via Wafer'],
          ['i', 'grindless:nb_filled_tsv_wafer', 'Nb Filled TSV Wafer'],
          ['m', tfln, 'TFLN Fab'],
          ['i', 'grindless:bonded_tsv_interposer', 'Bonded TSV Interposer'],
          ['i', 'grindless:nb_tsv_interposer', 'Nb TSV Interposer'],
        ], 'the tetron array'),
        ...line(15, 8, [
          ['i', 'grindless:ln_on_soi_wafer', 'LN on SOI Wafer'],
          ['m', 'gtceu:femtosecond_writer', 'Femtosecond Writer'],
          ['i', 'grindless:ln_soi_waveguide_wafer', 'LN Waveguide Wafer'],
          ['m', 'gtceu:snspd_foundry', 'SNSPD Foundry'],
          ['i', 'grindless:snspd_array', 'SNSPD Array'],
          ['i', 'grindless:cryo_optical_link', 'Cryo Optical Link'],
        ], 'the cosmic mainframe'),
        ...line(16, 10, [
          ['i', 'grindless:si_inp_boule', 'Si-InP Boule'],
          ['i', 'grindless:si_inp_wafer', 'Si-InP Wafer'],
          ['m', mbe, 'MBE Reactor'],
          ['i', 'grindless:inp_hemt_epi_wafer', 'InP HEMT Epi Wafer'],
          ['i', 'grindless:hemt_gated_wafer', 'HEMT Gated Wafer'],
          ['i', 'grindless:isolated_hemt_wafer', 'Isolated HEMT Wafer'],
          ['i', 'grindless:hemt_amplifier', 'HEMT Amplifier'],
        ], 'the tetron array'),
        ...line(17, 12, [
          ['i', 'grindless:sic_wafer', 'SiC Wafer'],
          ['m', mocvd, 'MOCVD Reactor'],
          ['i', 'grindless:gan_sic_epi_wafer', 'GaN-on-SiC Epi Wafer'],
          ['i', 'grindless:gan_gated_wafer', 'GaN Gated Wafer'],
          ['i', 'grindless:gan_mmic', 'GaN MMIC'],
        ], 'the cosmic mainframe'),
        ...line(18, 14, [
          ['i', 'grindless:fz_silicon_wafer', 'FZ Silicon Wafer'],
          ['i', 'grindless:sdd_ring_wafer', 'SDD Ring Wafer'],
          ['i', 'grindless:sdd_anode_wafer', 'SDD Anode Wafer'],
          ['m', sput, 'MTJ Sputter Cluster'],
          ['i', 'grindless:sdd_die', 'SDD Die'],
        ], 'the XNAV unit'),
        ...line(19, 16, [
          ['i', 'grindless:tetron_die', 'Tetron Die'],
          ['m', sput, 'MTJ Sputter Cluster'],
          ['i', 'grindless:bumped_tetron_die', 'Bumped Tetron Die'],
          ['i', 'grindless:bonded_tetron_die', 'Bonded Tetron Die'],
          ['m', mk, 'Millikelvin Cryostat Works'],
          ['i', 'grindless:tested_tetron_die', 'Tested Tetron Die'],
          ['m', 'gtceu:tetron_fab', 'Tetron Fab'],
          ['i', 'grindless:tetron_array', 'Tetron Array'],
        ], 'the cosmic mainframe'),
        ...line(34, 18, [
          ['i', 'grindless:sic_wafer', 'SiC Wafer'],
          ['i', 'grindless:superpolished_sic_blank', 'Superpolished SiC Blank'],
          ['m', sput, 'MTJ Sputter Cluster'],
          ['i', 'grindless:wc_sic_multilayer', 'WC/SiC Multilayer'],
          ['m', 'gtceu:synchrotron', 'Synchrotron'],
          ['i', 'grindless:gamma_multilayer_mirror', 'Gamma Multilayer Mirror'],
        ], 'the gamma optics works'),
        ...line(35, 20, [
          ['i', 'gtceu:germanium_ingot', 'Germanium Ingot'],
          ['m', 'gtceu:megabar_press', 'Megabar Press'],
          ['i', 'grindless:bent_ge_tile', 'Bent Ge Tile'],
          ['m', 'gtceu:synchrotron', 'Synchrotron'],
          ['i', 'grindless:aligned_laue_frame', 'Aligned Laue Frame'],
          ['i', 'grindless:laue_lens', 'Laue Lens'],
        ], 'the gamma optics works'),
      ],
    },
    beam: {
      name: 'Beam hardware at Cygnus',
      nodes: [
        ...line(20, 0, [
          ['i', 'gtceu:beryllium_dust', 'Beryllium'],
          ['m', 'gtceu:hot_strip_mill', 'Hot Strip Mill'],
          ['i', 'gtceu:beryllium_plate', 'Beryllium Plate'],
          ['i', 'grindless:brazed_be_window', 'Brazed Be Window'],
          ['i', 'grindless:be_beam_window', 'Be Beam Window'],
        ], 'the jet beam line'),
        ...line(21, 2, [
          ['i', 'grindless:five_n_iridium', '5N Iridium'],
          ['m', sx, 'Spark Plasma Sinterer'],
          ['i', 'gtceu:iridium_rod', 'Iridium Rod'],
          ['i', 'grindless:ta_clad_ir_rod', 'Ta-Clad Ir Rod'],
          ['i', 'grindless:ir_spallation_target', 'Ir Spallation Target'],
        ], 'the spallation target station'),
        ...line(22, 4, [
          ['i', 'grindless:li6_hydride', 'Li-6 Hydride'],
          ['m', sx, 'Spark Plasma Sinterer'],
          ['i', 'grindless:li6h_tile', 'Li-6 Hydride Tile'],
          ['m', eb, 'Electron Beam Furnace'],
          ['i', 'grindless:canned_li6h_block', 'Canned Li-6 Hydride Block'],
          ['i', 'grindless:li6_hydride_shield', 'Li-6 Hydride Shield'],
        ], 'the spallation target station'),
        ...line(23, 6, [
          ['i', 'grindless:ceb6_powder', 'CeB6 Powder'],
          ['m', cg, 'Crystal Growth Furnace'],
          ['i', 'grindless:ceb6_boule', 'CeB6 Boule'],
          ['i', 'grindless:ceb6_cathode', 'CeB6 Cathode'],
          ['i', 'grindless:electron_cooler', 'Electron Cooler'],
        ], 'the antiproton decelerator'),
        ...line(24, 8, [
          ['i', 'grindless:nb_target', 'Nb Target'],
          ['i', 'grindless:nbtin_film_wafer', 'NbTiN Film Wafer'],
          ['m', eb, 'Electron Beam Furnace'],
          ['i', 'grindless:pickup_array', 'Pickup Array'],
          ['m', he, 'Helium Refrigerator'],
          ['i', 'grindless:brazed_pickup_tank', 'Brazed Pickup Tank'],
          ['i', 'grindless:stochastic_cooling_pickup', 'Stochastic Cooling Pickup'],
        ], 'the antiproton decelerator'),
        ...line(25, 10, [
          ['i', 'grindless:tizrv_ingot', 'TiZrV Ingot'],
          ['i', 'grindless:tizrv_target', 'TiZrV Target'],
          ['m', eb, 'Electron Beam Furnace'],
          ['i', 'grindless:neg_coated_chamber', 'NEG Coated Chamber'],
          ['i', 'grindless:neg_xhv_casing', 'NEG XHV Casing'],
        ], 'the beam line casing'),
        ...line(30, 12, [
          ['i', 'grindless:jet_proton_beam', 'Jet Proton Beam'],
          ['m', 'gtceu:spallation_target_station', 'Spallation Target Station'],
          ['f', 'gtceu:hot_antiproton_beam', 'Hot Antiproton Beam'],
          ['m', 'gtceu:antiproton_decelerator', 'Antiproton Decelerator'],
          ['f', 'gtceu:stochastically_cooled_beam', 'Cooled Antiproton Beam'],
          ['i', 'grindless:cold_antiproton_cell', 'Cold Antiproton Cell'],
          ['m', 'gtceu:antimatter_trap', 'Antimatter Trap'],
          ['i', 'grindless:antiproton_stack_opv', 'Antiproton Stack'],
        ], 'the antihydrogen foundry'),
      ],
    },
    antimatter: {
      name: 'Antimatter and power parts',
      nodes: [
        ...line(26, 0, [
          ['i', 'grindless:magnesium_fluoride_dust', 'MgF2'],
          ['m', cg, 'Crystal Growth Furnace'],
          ['i', 'grindless:ti_sapphire_boule', 'Ti:Sapphire Boule'],
          ['i', 'grindless:lbo_boule', 'LBO Boule'],
          ['i', 'grindless:kr_tripler_cell', 'Kr Tripler Cell'],
          ['i', 'grindless:lyman_alpha_laser', 'Lyman-alpha Laser'],
        ], 'the antihydrogen foundry'),
        ...line(27, 2, [
          ['i', 'grindless:octupole_tape', 'Octupole Tape'],
          ['i', 'grindless:octupole_winding', 'Octupole Winding'],
          ['m', cvi, 'CVI Furnace'],
          ['i', 'grindless:potted_octupole_winding', 'Potted Octupole Winding'],
          ['m', hts, 'HTS Magnet Works'],
          ['i', 'grindless:cooled_octupole_winding', 'Cooled Octupole Winding'],
          ['i', 'grindless:octupole_trap_magnet', 'Octupole Trap Magnet'],
        ], 'the antihydrogen foundry'),
        ...line(28, 4, [
          ['i', 'grindless:pyrolytic_graphite', 'Pyrolytic Graphite'],
          ['i', 'grindless:hopg_blank', 'HOPG Blank'],
          ['i', 'grindless:hopg_plate', 'HOPG Plate'],
          ['m', mk, 'Millikelvin Cryostat Works'],
          ['i', 'grindless:levitation_trap_cell', 'Levitation Trap Cell'],
        ], 'the antihydrogen foundry'),
        ...line(29, 6, [
          ['i', 'grindless:empty_penning_trap', 'Empty Penning Trap'],
          ['m', 'gtceu:positron_accumulator', 'Positron Accumulator'],
          ['i', 'grindless:seed_positron_plasma', 'Seed Positron Plasma'],
          ['i', 'grindless:hot_pair_plasma', 'Hot Pair Plasma'],
          ['m', eb, 'Electron Beam Furnace'],
          ['i', 'grindless:dense_positron_cell', 'Dense Positron Cell'],
        ], 'the antihydrogen foundry'),
        ...line(31, 8, [
          ['i', 'grindless:cm245_fraction', 'Cm-245 Fraction'],
          ['m', eb, 'Electron Beam Furnace'],
          ['i', 'grindless:w_re_hohlraum', 'W-Re Hohlraum'],
          ['i', 'grindless:acmf_pellet', 'ACMF Pellet'],
        ], 'the annihilation engine'),
        ...line(32, 10, [
          ['i', 'grindless:b4c_10_dust', 'B4C-10'],
          ['i', 'grindless:w_b4c_powder', 'W/B4C Powder'],
          ['m', sx, 'Spark Plasma Sinterer'],
          ['i', 'grindless:b4c_target', 'B4C Target'],
          ['i', 'grindless:gamma_absorber_tile', 'Gamma Absorber Tile'],
        ], 'the annihilation engine'),
        ...line(33, 12, [
          ['i', 'grindless:gasb_boule', 'GaSb Boule'],
          ['i', 'grindless:gasb_wafer', 'GaSb Wafer'],
          ['m', mbe, 'MBE Reactor'],
          ['i', 'grindless:ingaassb_epi_wafer', 'InGaAsSb Epi Wafer'],
          ['i', 'grindless:tpv_panel', 'TPV Panel'],
        ], 'the annihilation engine'),
      ],
    },
    exotic: {
      name: 'Exotic matter and the Kugelblitz',
      nodes: [
        ...line(36, 0, [
          ['i', 'grindless:lead_208_dust', 'Lead-208'],
          ['i', 'grindless:pb208_ion_source', 'Pb-208 Ion Source'],
          ['m', 'gtceu:heavy_ion_cyclotron', 'Heavy Ion Cyclotron'],
          ['i', 'grindless:pb208_beam_cell', 'Pb-208 Beam Cell'],
          ['m', 'gtceu:synchrotron', 'Synchrotron'],
          ['i', 'grindless:fireball_distillate', 'Fireball Distillate'],
          ['m', 'gtceu:strangelet_distiller', 'Strangelet Distiller'],
          ['i', 'grindless:strangelet_seed', 'Strangelet Seed'],
          ['i', 'grindless:fed_strangelet', 'Fed Strangelet'],
          ['m', 'gtceu:strangelet_vault', 'Strangelet Vault'],
          ['i', 'grindless:grown_strangelet', 'Grown Strangelet'],
          ['i', 'grindless:stable_exotic_matter', 'Stable Exotic Matter'],
        ], 'the Kugelblitz forge'),
        ...line(37, 2, [
          ['i', 'grindless:gamma_laser_module', 'Gamma Laser Module'],
          ['i', 'grindless:gamma_pump_charge', 'Gamma Pump Charge'],
          ['i', 'grindless:kugelblitz_seed', 'Kugelblitz Seed'],
          ['m', 'gtceu:kugelblitz_forge', 'Kugelblitz Forge'],
          ['i', 'grindless:kugelblitz_core', 'Kugelblitz Core'],
          ['i', 'grindless:hawking_drive', 'Hawking Drive'],
        ], 'the warp gate'),
      ],
    },
    bulge: {
      name: 'Probes, nodes and the bulge',
      nodes: [
        ...line(38, 0, [
          ['i', 'grindless:bulge_debris', 'Bulge Debris'],
          ['m', 'gtceu:carbonyl_refinery', 'Carbonyl Refinery'],
          ['i', 'grindless:metal_carbonyl', 'Metal Carbonyl'],
          ['i', 'grindless:carbonyl_iron_nickel', 'Carbonyl Iron-Nickel'],
          ['i', 'grindless:metal_feedstock', 'Metal Feedstock'],
          ['m', 'gtceu:von_neumann_foundry', 'Von Neumann Foundry'],
          ['i', 'grindless:probe_seed', 'Probe Seed'],
        ], 'the von Neumann foundry'),
        ...line(39, 2, [
          ['i', 'grindless:silicate_debris_fraction', 'Silicate Debris Fraction'],
          ['i', 'grindless:ffc_pellet', 'FFC Pellet'],
          ['i', 'grindless:si_alloy_powder', 'Si Alloy Powder'],
          ['m', 'gtceu:replication_refinery', 'Replication Refinery'],
          ['i', 'grindless:cluster_sinter_casing', 'Cluster Sinter Casing'],
        ], 'the von Neumann foundry'),
        ...line(40, 4, [
          ['i', 'grindless:si_ribbon', 'Si Ribbon'],
          ['i', 'grindless:pv_collector_film', 'PV Collector Film'],
          ['m', 'gtceu:collector_node_works', 'Collector Node Works'],
          ['i', 'grindless:collector_node', 'Collector Node'],
          ['i', 'grindless:deployed_node_pack', 'Deployed Node Pack'],
        ], 'the bulge collector'),
        ...line(41, 6, [
          ['i', 'grindless:polycapillary_optic', 'Polycapillary Optic'],
          ['i', 'grindless:xray_timing_head', 'X-ray Timing Head'],
          ['i', 'grindless:clock_locked_head', 'Clock-Locked Head'],
          ['i', 'grindless:xnav_unit', 'XNAV Unit'],
        ], 'the probe fleet'),
        ...line(42, 8, [
          ['i', 'grindless:gan_mmic', 'GaN MMIC'],
          ['i', 'grindless:gan_mmic_tile', 'GaN MMIC Tile'],
          ['i', 'grindless:rad_hard_controller', 'Rad-Hard Controller'],
          ['i', 'grindless:node_power_transmitter', 'Node Power Transmitter'],
        ], 'the bulge collector'),
      ],
    },
    census: {
      name: 'Census IV and the power die',
      nodes: [
        ...line(43, 0, [
          ['i', 'grindless:ni_chain_slab', 'Ni Chain Slab'],
          ['i', 'grindless:caged_ni_chain', 'Caged Ni Chain'],
          ['i', 'gtceu:thawed_chain_nickel_dust', 'Thawed Chain Nickel'],
          ['m', 'gtceu:calutron', 'Calutron'],
          ['i', 'grindless:element_124_recoil', 'Element 124 Recoil'],
        ], 'the superheavy chemistry lab'),
        ...line(44, 2, [
          ['i', 'grindless:cf249_target_wheel', 'Cf-249 Target Wheel'],
          ['m', 'gtceu:heavy_ion_cyclotron', 'Heavy Ion Cyclotron'],
          ['f', 'gtceu:element_126_recoil_gas', 'Element 126 Recoil Gas'],
          ['i', 'grindless:element_126_recoil', 'Element 126 Recoil'],
          ['i', 'grindless:superheavy_census_iv', 'Superheavy Census IV'],
        ], 'the gate to MAX'),
        ...line(45, 4, [
          ['i', 'grindless:aln_powder', 'AlN Powder'],
          ['i', 'grindless:aln_boule', 'AlN Boule'],
          ['i', 'grindless:aln_wafer', 'AlN Wafer'],
          ['m', mocvd, 'MOCVD Reactor'],
          ['i', 'grindless:algan_epi_wafer', 'AlGaN Epi Wafer'],
          ['i', 'grindless:algan_patterned_wafer', 'AlGaN Patterned Wafer'],
          ['i', 'grindless:aln_power_die', 'AlN Power Die'],
        ], 'the OpV power parts'),
      ],
    },
  },
};
