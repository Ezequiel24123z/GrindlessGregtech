// pl_uiv: the UIV lines. Positions are relative to each cluster (pl-model.mjs places the clusters).
// Every UIV package has landed, so nothing is gated. Arrows are checked against a recipe dump by pl-check.mjs (integrator).
// Each row is one line of docs/eras/uiv.md ("New process lines"): its feedstock, its machines and its product, as the recipes run today.
// Rows are laid out by chain(), 2.5 columns per step. Lines without a chain of four steps in the recipes (the cable seal, the
// polarised ices, the C-12 spreader seed, the neon cone) are not drawn.
import { I, M, n } from './pl-lib.mjs';

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

export default {
  file: 'pl_uiv',
  order: 11,
  title: 'UIV Lines',
  subtitle: 'Metallic hydrogen and the hard parts, the atoms of dead stars, light and crystals, memories for the computer, and the fuel and the heat of the ring.',
  icon: 'gtceu:matrioshka_computer',
  focus: 'l11_0',
  bands: [['hydrogen', 'atoms'], ['light', 'memory'], ['fusion']],
  clusters: {
    hydrogen: {
      name: 'Metallic hydrogen and the hard parts',
      nodes: [
        // line 2
        ...chain(0, [
          ['l2_0', I('gtceu:rhea_ingot'), 'RHEA Ingot', 'raw'],
          ['l2_1', I('grindless:rhea_slab'), 'RHEA Slab'],
          ['l2_2', mach('gtceu:hot_strip_mill'), 'Hot Strip Mill', 'ours'],
          ['l2_3', I('gtceu:rhea_plate'), 'RHEA Plate'],
          ['l2_4', I('grindless:rhea_former'), 'RHEA Former'],
          ['l2_5', I('grindless:wound_rhea_former'), 'Wound RHEA Former'],
          ['l2_6', I('grindless:impregnated_mh_coil'), 'Impregnated MH Coil'],
          ['l2_7', I('grindless:metallic_hydrogen_coil_block'), 'Metallic Hydrogen Coil Block'],
        ], 'the Mk5 ring'),
        // line 3
        ...chain(2, [
          ['l3_0', I('grindless:pyrolytic_graphite'), 'Pyrolytic Graphite', 'raw'],
          ['l3_1', mach('gtceu:ramp_compression_pulser'), 'Ramp Compression Pulser', 'ours'],
          ['l3_2', I('gtceu:lonsdaleite_dust'), 'Lonsdaleite'],
          ['l3_3', I('grindless:leached_lonsdaleite'), 'Leached Lonsdaleite'],
          ['l3_4', I('grindless:lonsdaleite_race'), 'Lonsdaleite Race'],
          ['l3_5', I('grindless:lonsdaleite_bearing'), 'Lonsdaleite Bearing'],
        ], 'the UIV piston'),
        // line 4
        ...chain(4, [
          ['l4_0', I('gtceu:diamond_plate'), 'Diamond Plate', 'raw'],
          ['l4_1', I('grindless:dac_charge'), 'Dac Charge'],
          ['l4_2', I('grindless:laser_heated_n2_charge'), 'Laser Heated N2 Charge'],
          ['l4_3', mach('gtceu:ramp_compression_pulser'), 'Ramp Compression Pulser', 'ours'],
          ['l4_4', I('gtceu:cubic_gauche_nitrogen_dust'), 'Cubic Gauche Nitrogen'],
          ['l4_5', I('grindless:quenched_cg_nitrogen'), 'Quenched CG Nitrogen'],
          ['l4_6', I('grindless:rhea_cased_charge'), 'RHEA Cased Charge'],
          ['l4_7', I('grindless:sled_charge'), 'SLED Charge'],
        ], 'the sled'),
        // line 5
        ...chain(6, [
          ['l5_0', I('grindless:tantalite_fluoride_cake'), 'Tantalite Fluoride Cake', 'raw'],
          ['l5_1', mach('gtceu:extraction_cascade'), 'Extraction Cascade', 'ours'],
          ['l5_2', I('grindless:niobium_oxyfluoride_dust'), 'Niobium Oxyfluoride'],
          ['l5_3', I('grindless:niobium_powder'), 'Niobium Powder'],
          ['l5_4', mach('gtceu:electron_beam_furnace'), 'Electron Beam Furnace', 'ours'],
          ['l5_5', I('grindless:nb_ta_button'), 'NB TA Button'],
          ['l5_6', mach('gtceu:levitation_melter'), 'Levitation Melter', 'ours'],
          ['l5_7', I('gtceu:rhea_ingot'), 'RHEA Ingot'],
          ['l5_8', I('grindless:rhea_slab'), 'RHEA Slab'],
          ['l5_9', mach('gtceu:hot_strip_mill'), 'Hot Strip Mill', 'ours'],
          ['l5_10', I('gtceu:rhea_plate'), 'RHEA Plate'],
        ], 'every UIV part'),
        // line 6
        ...chain(8, [
          ['l6_0', I('grindless:rhea_am_powder'), 'RHEA Am Powder', 'raw'],
          ['l6_1', mach('gtceu:powder_bed_printer'), 'Powder Bed Printer', 'ours'],
          ['l6_2', I('grindless:near_net_rhea_impeller'), 'Near Net RHEA Impeller'],
          ['l6_3', mach('gtceu:powder_bed_printer'), 'Powder Bed Printer', 'ours'],
          ['l6_4', I('grindless:printed_rhea_impeller'), 'Printed RHEA Impeller'],
          ['l6_5', mach('gtceu:megabar_press'), 'Megabar Press', 'ours'],
          ['l6_6', I('grindless:dense_rhea_impeller'), 'Dense RHEA Impeller'],
          ['l6_7', I('grindless:machined_rhea_impeller'), 'Machined RHEA Impeller'],
          ['l6_8', I('grindless:balanced_rhea_impeller'), 'Balanced RHEA Impeller'],
        ], 'the UIV pump'),
        // line 7
        ...chain(10, [
          ['l7_0', I('grindless:coated_w_wire'), 'Coated W Wire', 'raw'],
          ['l7_1', I('grindless:w_fibre_preform'), 'W Fibre Preform'],
          ['l7_2', mach('gtceu:cvi_furnace'), 'Cvi Furnace', 'ours'],
          ['l7_3', I('grindless:densified_w_preform'), 'Densified W Preform'],
          ['l7_4', mach('gtceu:levitation_melter'), 'Levitation Melter', 'ours'],
          ['l7_5', I('grindless:wf_rhea_billet'), 'Wf RHEA Billet'],
          ['l7_6', mach('gtceu:plasma_quench_caster'), 'Plasma Quench Caster', 'ours'],
          ['l7_7', I('grindless:plasma_sprayed_tile'), 'Plasma Sprayed Tile'],
          ['l7_8', I('grindless:first_wall_tile'), 'First Wall Tile'],
          ['l7_9', I('grindless:li_sn_armoured_tile'), 'LI Sn Armoured Tile'],
          ['l7_10', I('grindless:uiv_fusion_casing'), 'UIV Fusion Casing'],
        ], 'the Mk5 ring'),
        // line 8
        ...chain(12, [
          ['l8_0', I('gtceu:zirconium_dust'), 'Zirconium', 'raw'],
          ['l8_1', I('grindless:zr_master_alloy'), 'ZR Master Alloy'],
          ['l8_2', mach('gtceu:levitation_melter'), 'Levitation Melter', 'ours'],
          ['l8_3', I('gtceu:zrticunibe_glass_dust'), 'Zrticunibe Glass'],
          ['l8_4', I('grindless:bmg_blank'), 'BMG Blank'],
          ['l8_5', I('grindless:bmg_flexspline'), 'BMG Flexspline'],
          ['l8_6', I('grindless:strain_wave_gear'), 'Strain Wave Gear'],
        ], 'the UIV robot arm'),
        // line 23
        ...chain(14, [
          ['l23_0', I('grindless:carbonyl_iron_powder'), 'Carbonyl Iron Powder', 'raw'],
          ['l23_1', I('grindless:reduced_iron_powder'), 'Reduced Iron Powder'],
          ['l23_2', mach('gtceu:nitride_magnet_works'), 'Nitride Magnet Works', 'ours'],
          ['l23_3', I('grindless:strain_annealed_fe16n2_powder'), 'Strain Annealed Fe16n2 Powder'],
          ['l23_4', mach('gtceu:nitride_magnet_works'), 'Nitride Magnet Works', 'ours'],
          ['l23_5', I('grindless:bonded_fe16n2_magnet'), 'Bonded Fe16n2 Magnet'],
          ['l23_6', I('grindless:uev_electric_motor'), 'UEV Electric Motor'],
          ['l23_7', I('grindless:uiv_electric_motor'), 'UIV Electric Motor'],
        ], 'the UIV motor'),
        // line 39
        ...chain(16, [
          ['l39_0', I('grindless:reduced_iron_powder'), 'Reduced Iron Powder', 'raw'],
          ['l39_1', mach('gtceu:nitride_magnet_works'), 'Nitride Magnet Works', 'ours'],
          ['l39_2', I('grindless:strain_annealed_fe16n2_powder'), 'Strain Annealed Fe16n2 Powder'],
          ['l39_3', mach('gtceu:nitride_magnet_works'), 'Nitride Magnet Works', 'ours'],
          ['l39_4', I('grindless:bonded_fe16n2_magnet'), 'Bonded Fe16n2 Magnet'],
          ['l39_5', mach('gtceu:nitride_magnet_works'), 'Nitride Magnet Works', 'ours'],
          ['l39_6', I('grindless:halbach_array'), 'Halbach Array'],
          ['l39_7', I('grindless:rhea_cased_halbach'), 'RHEA Cased Halbach'],
          ['l39_8', I('grindless:potted_mh_stator'), 'Potted MH Stator'],
          ['l39_9', I('grindless:maglev_stator'), 'Maglev Stator'],
          ['l39_10', I('grindless:uiv_conveyor_module'), 'UIV Conveyor Module'],
        ], 'the UIV conveyor'),
      ],
    },
    atoms: {
      name: 'Superheavy atoms and neutron star matter',
      nodes: [
        // line 9
        ...chain(0, [
          ['l9_0', I('gtceu:polytetrafluoroethylene_foil'), 'Polytetrafluoroethylene Foil', 'raw'],
          ['l9_1', I('grindless:polycarbonate_foil'), 'Polycarbonate Foil'],
          ['l9_2', mach('gtceu:heavy_ion_cyclotron'), 'Heavy Ion Cyclotron', 'ours'],
          ['l9_3', I('grindless:ion_tracked_foil'), 'Ion Tracked Foil'],
          ['l9_4', I('grindless:etched_membrane'), 'Etched Membrane'],
          ['l9_5', mach('gtceu:recoil_separator'), 'Recoil Separator', 'ours'],
          ['l9_6', I('grindless:element_120_recoil'), 'Element 120 Recoil'],
        ], 'the superheavy census'),
        // line 32
        ...chain(2, [
          ['l32_0', I('gtceu:polytetrafluoroethylene_foil'), 'Polytetrafluoroethylene Foil', 'raw'],
          ['l32_1', I('grindless:polycarbonate_foil'), 'Polycarbonate Foil'],
          ['l32_2', mach('gtceu:heavy_ion_cyclotron'), 'Heavy Ion Cyclotron', 'ours'],
          ['l32_3', I('grindless:ion_tracked_foil'), 'Ion Tracked Foil'],
          ['l32_4', I('grindless:etched_membrane'), 'Etched Membrane'],
          ['l32_5', mach('gtceu:recoil_separator'), 'Recoil Separator', 'ours'],
          ['l32_6', I('grindless:element_119_recoil'), 'Element 119 Recoil'],
        ], 'the superheavy census'),
        // line 30
        ...chain(4, [
          ['l30_0', I('gtceu:glass_plate'), 'Glass Plate', 'raw'],
          ['l30_1', mach('gtceu:mbe_reactor'), 'MBE Reactor', 'ours'],
          ['l30_2', I('grindless:ni58_ti_multilayer'), 'Ni-58 TI Multilayer'],
          ['l30_3', I('grindless:neutron_supermirror'), 'Neutron Supermirror'],
          ['l30_4', I('grindless:neutron_guide'), 'Neutron Guide'],
          ['l30_5', I('grindless:cage_part'), 'Cage Part'],
          ['l30_6', mach('gtceu:neutronium_cage'), 'Neutronium Cage', 'ours'],
          ['l30_7', I('grindless:neutronium_pellet'), 'Neutronium Pellet'],
        ], 'the UIV field generator'),
        // line 31
        ...chain(6, [
          ['l31_0', I('gtceu:lead_foil'), 'Lead Foil', 'raw'],
          ['l31_1', I('grindless:lead_polymer_liner'), 'Lead Polymer Liner'],
          ['l31_2', I('grindless:sealed_capsule'), 'Sealed Capsule'],
          ['l31_3', I('grindless:kilonova_capsule'), 'Kilonova Capsule'],
          ['l31_4', mach('gtceu:decay_heat_vault'), 'Decay Heat Vault', 'ours'],
          ['l31_5', I('grindless:aged_kilonova_capsule'), 'Aged Kilonova Capsule'],
          ['l31_6', mach('gtceu:decay_heat_vault'), 'Decay Heat Vault', 'ours'],
          ['l31_7', I('grindless:r_process_ash'), 'R Process Ash'],
        ], 'the decay heat vault'),
        // line 33
        ...chain(8, [
          ['l33_0', I('grindless:worn_crust_lift_tether'), 'Worn Crust Lift Tether', 'raw'],
          ['l33_1', mach('gtceu:tether_ribbon_works'), 'Tether Ribbon Works', 'ours'],
          ['l33_2', I('grindless:carbon_nanotube_yarn'), 'Carbon Nanotube Yarn'],
          ['l33_3', mach('gtceu:boron_nitride_reactor'), 'Boron Nitride Reactor', 'ours'],
          ['l33_4', I('grindless:bn_coated_cnt_yarn'), 'Bn Coated Cnt Yarn'],
          ['l33_5', I('grindless:mh_laminated_yarn'), 'MH Laminated Yarn'],
          ['l33_6', I('grindless:braided_mh_tether'), 'Braided MH Tether'],
          ['l33_7', mach('gtceu:tether_ribbon_works'), 'Tether Ribbon Works', 'ours'],
          ['l33_8', I('grindless:mh_tether'), 'MH Tether'],
          ['l33_9', I('grindless:crust_lift_tether'), 'Crust Lift Tether'],
        ], 'the crust lift'),
        // line 35
        ...chain(10, [
          ['l35_0', I('grindless:synroc_block'), 'Synroc Block', 'raw'],
          ['l35_1', mach('gtceu:waste_retrieval_plant'), 'Waste Retrieval Plant', 'ours'],
          ['l35_2', I('grindless:synroc_liner'), 'Synroc Liner'],
          ['l35_3', mach('gtceu:hot_cell'), 'Hot Cell', 'ours'],
          ['l35_4', I('grindless:filled_waste_canister'), 'Filled Waste Canister'],
          ['l35_5', mach('gtceu:megabar_press'), 'Megabar Press', 'ours'],
          ['l35_6', I('grindless:compacted_waste_canister'), 'Compacted Waste Canister'],
          ['l35_7', mach('gtceu:ergosphere_probe_bay'), 'Ergosphere Probe Bay', 'ours'],
          ['l35_8', I('grindless:split_charge_sled'), 'Split Charge SLED'],
          ['l35_9', mach('gtceu:penrose_engine'), 'Penrose Engine', 'ours'],
          ['l35_10', I('grindless:recovered_half_sled'), 'Recovered Half SLED'],
        ], 'the sled refit'),
      ],
    },
    light: {
      name: 'Light and crystals',
      nodes: [
        // line 10
        ...chain(0, [
          ['l10_0', I('grindless:lithium_niobate_boule'), 'Lithium Niobate Boule', 'raw'],
          ['l10_1', I('grindless:lithium_niobate_wafer'), 'Lithium Niobate Wafer'],
          ['l10_2', mach('gtceu:ion_implanter'), 'Ion Implanter', 'ours'],
          ['l10_3', I('grindless:implanted_ln_wafer'), 'Implanted LN Wafer'],
          ['l10_4', mach('gtceu:photonic_foundry'), 'Photonic Foundry', 'ours'],
          ['l10_5', I('grindless:lnoi_wafer'), 'LNOI Wafer'],
          ['l10_6', mach('gtceu:tfln_fab'), 'Tfln Fab', 'ours'],
          ['l10_7', I('grindless:ln_on_sin_wafer'), 'LN On Sin Wafer'],
          ['l10_8', I('grindless:ln_on_sin_thinned'), 'LN On Sin Thinned'],
          ['l10_9', mach('gtceu:photonic_foundry'), 'Photonic Foundry', 'ours'],
          ['l10_10', I('grindless:eo_transceiver'), 'EO Transceiver'],
        ], 'the pulsar repeater'),
        // line 12
        ...chain(2, [
          ['l12_0', I('gtceu:silicon_dust'), 'Silicon', 'raw'],
          ['l12_1', I('gtca:silicon_tetrachloride_dust'), 'Silicon Tetrachloride'],
          ['l12_2', I('grindless:ule_soot'), 'Ule Soot'],
          ['l12_3', I('grindless:ule_boule'), 'Ule Boule'],
          ['l12_4', mach('gtceu:femtosecond_writer'), 'Femtosecond Writer', 'ours'],
          ['l12_5', I('grindless:written_interposer_blank'), 'Written Interposer Blank'],
          ['l12_6', I('grindless:etched_interposer_blank'), 'Etched Interposer Blank'],
          ['l12_7', mach('gtceu:photonic_foundry'), 'Photonic Foundry', 'ours'],
          ['l12_8', I('grindless:glass_interposer'), 'Glass Interposer'],
        ], 'the optical mainframe'),
        // line 13
        ...chain(4, [
          ['l13_0', I('grindless:hfo2_resist_wafer'), 'Hfo2 Resist Wafer', 'raw'],
          ['l13_1', mach('gtceu:beuv_scanner'), 'BEUV Scanner', 'ours'],
          ['l13_2', I('grindless:fouled_beuv_mirror'), 'Fouled BEUV Mirror'],
          ['l13_3', mach('gtceu:beuv_scanner'), 'BEUV Scanner', 'ours'],
          ['l13_4', I('gtceu:terbium_dust'), 'Terbium'],
          ['l13_5', I('grindless:tb_droplet_target'), 'TB Droplet Target'],
          ['l13_6', mach('gtceu:beuv_scanner'), 'BEUV Scanner', 'ours'],
          ['l13_7', I('grindless:beuv_exposed_wafer'), 'BEUV Exposed Wafer'],
          ['l13_8', mach('gtceu:beuv_scanner'), 'BEUV Scanner', 'ours'],
          ['l13_9', I('grindless:beuv_driver_asic'), 'BEUV Driver ASIC'],
        ], 'the BEUV scanner'),
        // line 14
        ...chain(6, [
          ['l14_0', I('gtceu:mixed_rare_earth_chloride_dust'), 'Mixed Rare Earth Chloride', 'raw'],
          ['l14_1', mach('gtceu:extraction_cascade'), 'Extraction Cascade', 'ours'],
          ['l14_2', I('grindless:terbium_oxide_dust'), 'Terbium Oxide'],
          ['l14_3', mach('gtceu:europium_reductor'), 'Europium Reductor', 'ours'],
          ['l14_4', I('gtceu:terbium_dust'), 'Terbium'],
          ['l14_5', I('grindless:tb_droplet_target'), 'TB Droplet Target'],
          ['l14_6', mach('gtceu:beuv_scanner'), 'BEUV Scanner', 'ours'],
          ['l14_7', I('grindless:fouled_beuv_mirror'), 'Fouled BEUV Mirror'],
          ['l14_8', mach('gtceu:beuv_scanner'), 'BEUV Scanner', 'ours'],
          ['l14_9', I('grindless:beuv_mirror'), 'BEUV Mirror'],
        ], 'the BEUV scanner'),
        // line 18
        ...chain(8, [
          ['l18_0', I('grindless:fz_silicon_boule'), 'FZ Silicon Boule', 'raw'],
          ['l18_1', I('grindless:fz_silicon_wafer'), 'FZ Silicon Wafer'],
          ['l18_2', I('grindless:oxidised_wafer'), 'Oxidised Wafer'],
          ['l18_3', mach('gtceu:synchrotron'), 'Synchrotron', 'ours'],
          ['l18_4', I('grindless:trenched_oxide_wafer'), 'Trenched Oxide Wafer'],
          ['l18_5', I('grindless:damascene_sin_wafer'), 'Damascene Sin Wafer'],
          ['l18_6', mach('gtceu:photonic_foundry'), 'Photonic Foundry', 'ours'],
          ['l18_7', I('grindless:annealed_damascene_ring'), 'Annealed Damascene Ring'],
          ['l18_8', mach('gtceu:tfln_fab'), 'Tfln Fab', 'ours'],
          ['l18_9', I('grindless:eo_microcomb'), 'EO Microcomb'],
        ], 'the UIV sensor'),
        // line 36
        ...chain(10, [
          ['l36_0', I('grindless:lithium_niobate_wafer'), 'Lithium Niobate Wafer', 'raw'],
          ['l36_1', mach('gtceu:ion_implanter'), 'Ion Implanter', 'ours'],
          ['l36_2', I('grindless:implanted_ln_wafer'), 'Implanted LN Wafer'],
          ['l36_3', mach('gtceu:photonic_foundry'), 'Photonic Foundry', 'ours'],
          ['l36_4', I('grindless:lnoi_wafer'), 'LNOI Wafer'],
          ['l36_5', mach('gtceu:tfln_fab'), 'Tfln Fab', 'ours'],
          ['l36_6', I('grindless:poled_lnoi_wafer'), 'Poled LNOI Wafer'],
          ['l36_7', mach('gtceu:photonic_foundry'), 'Photonic Foundry', 'ours'],
          ['l36_8', I('grindless:ppln_waveguide'), 'PPLN Waveguide'],
          ['l36_9', I('grindless:shg_486_stage'), 'Shg 486 Stage'],
          ['l36_10', I('grindless:ps_cooling_laser'), 'PS Cooling Laser'],
        ], 'the positronium lab'),
        // line 40
        ...chain(12, [
          ['l40_0', I('gtceu:silicon_dust'), 'Silicon', 'raw'],
          ['l40_1', I('gtca:silicon_tetrachloride_dust'), 'Silicon Tetrachloride'],
          ['l40_2', mach('gtceu:fibre_draw_tower'), 'Fibre Draw Tower', 'ours'],
          ['l40_3', I('grindless:silica_storage_preform'), 'Silica Storage Preform'],
          ['l40_4', mach('gtceu:femtosecond_writer'), 'Femtosecond Writer', 'ours'],
          ['l40_5', I('grindless:written_crystal_blank'), 'Written Crystal Blank'],
          ['l40_6', I('grindless:verified_crystal'), 'Verified Crystal'],
          ['l40_7', I('grindless:data_crystal_5d'), 'Data Crystal 5D'],
        ], 'the Matrioshka computer'),
        // line 44
        ...chain(14, [
          ['l44_0', I('gtceu:silicon_dust'), 'Silicon', 'raw'],
          ['l44_1', I('gtca:silicon_tetrachloride_dust'), 'Silicon Tetrachloride'],
          ['l44_2', mach('gtceu:fibre_draw_tower'), 'Fibre Draw Tower', 'ours'],
          ['l44_3', I('grindless:er_preform'), 'ER Preform'],
          ['l44_4', I('grindless:er_fibre'), 'ER Fibre'],
          ['l44_5', I('grindless:er_fibre_coil'), 'ER Fibre Coil'],
          ['l44_6', I('grindless:pumped_edfa'), 'Pumped EDFA'],
        ], 'the pulsar repeater'),
      ],
    },
    memory: {
      name: 'Memories and computers',
      nodes: [
        // line 11
        ...chain(0, [
          ['l11_0', I('grindless:si28_soi_wafer'), 'Si-28 Soi Wafer', 'raw'],
          ['l11_1', mach('gtceu:stm_lithography_cell'), 'Stm Lithography Cell', 'ours'],
          ['l11_2', I('grindless:h_terminated_wafer'), 'H Terminated Wafer'],
          ['l11_3', mach('gtceu:stm_lithography_cell'), 'Stm Lithography Cell', 'ours'],
          ['l11_4', I('grindless:stm_patterned_wafer'), 'Stm Patterned Wafer'],
          ['l11_5', mach('gtceu:stm_lithography_cell'), 'Stm Lithography Cell', 'ours'],
          ['l11_6', I('grindless:ph3_dosed_wafer'), 'Ph3 Dosed Wafer'],
          ['l11_7', mach('gtceu:mbe_reactor'), 'MBE Reactor', 'ours'],
          ['l11_8', I('grindless:p_si_die'), 'P SI Die'],
          ['l11_9', mach('gtceu:millikelvin_cryostat_works'), 'Millikelvin Cryostat Works', 'ours'],
          ['l11_10', I('grindless:p_si_processor'), 'P SI Processor'],
        ], 'the memories'),
        // line 15
        ...chain(2, [
          ['l15_0', I('gtceu:yttrium_dust'), 'Yttrium', 'raw'],
          ['l15_1', mach('gtceu:crystal_growth_furnace'), 'Crystal Growth Furnace', 'ours'],
          ['l15_2', I('grindless:eu151_yso_boule'), 'Eu-151 YSO Boule'],
          ['l15_3', I('grindless:eu151_yso_slab'), 'Eu-151 YSO Slab'],
          ['l15_4', mach('gtceu:spectral_hole_burner'), 'Spectral Hole Burner', 'ours'],
          ['l15_5', I('grindless:six_hour_memory_slab'), 'Six Hour Memory Slab'],
          ['l15_6', I('grindless:six_hour_memory'), 'Six Hour Memory'],
        ], 'the pulsar repeater'),
        // line 16
        ...chain(4, [
          ['l16_0', I('gtceu:yttrium_dust'), 'Yttrium', 'raw'],
          ['l16_1', mach('gtceu:crystal_growth_furnace'), 'Crystal Growth Furnace', 'ours'],
          ['l16_2', I('grindless:er_yso_boule'), 'ER YSO Boule'],
          ['l16_3', I('grindless:er_yso_slab'), 'ER YSO Slab'],
          ['l16_4', mach('gtceu:spectral_hole_burner'), 'Spectral Hole Burner', 'ours'],
          ['l16_5', I('grindless:telecom_memory_slab'), 'Telecom Memory Slab'],
          ['l16_6', mach('gtceu:fibre_draw_tower'), 'Fibre Draw Tower', 'ours'],
          ['l16_7', I('grindless:telecom_memory'), 'Telecom Memory'],
        ], 'the pulsar repeater'),
        // line 17
        ...chain(6, [
          ['l17_0', I('grindless:implanted_ln_wafer'), 'Implanted LN Wafer', 'raw'],
          ['l17_1', mach('gtceu:photonic_foundry'), 'Photonic Foundry', 'ours'],
          ['l17_2', I('grindless:lnoi_wafer'), 'LNOI Wafer'],
          ['l17_3', mach('gtceu:photonic_foundry'), 'Photonic Foundry', 'ours'],
          ['l17_4', I('grindless:pcm_photonic_die'), 'PCM Photonic Die'],
          ['l17_5', mach('gtceu:photonic_foundry'), 'Photonic Foundry', 'ours'],
          ['l17_6', I('grindless:pcm_crossbar'), 'PCM Crossbar'],
          ['l17_7', I('grindless:crossbar_on_interposer'), 'Crossbar On Interposer'],
          ['l17_8', mach('gtceu:photonic_integration_hall'), 'Photonic Integration Hall', 'ours'],
          ['l17_9', I('gtnn:optical_mainframe'), 'Optical Mainframe'],
        ], 'the stored proof'),
        // line 41
        ...chain(8, [
          ['l41_0', I('gtceu:niobium_dust'), 'Niobium', 'raw'],
          ['l41_1', mach('gtceu:spark_plasma_sinterer'), 'Spark Plasma Sinterer', 'ours'],
          ['l41_2', I('grindless:nb_target'), 'NB Target'],
          ['l41_3', mach('gtceu:mbe_reactor'), 'MBE Reactor', 'ours'],
          ['l41_4', I('grindless:nb_trilayer'), 'NB Trilayer'],
          ['l41_5', mach('gtceu:snspd_foundry'), 'Snspd Foundry', 'ours'],
          ['l41_6', I('grindless:nb_jj_wafer'), 'NB Jj Wafer'],
          ['l41_7', I('grindless:aqfp_die'), 'AQFP Die'],
          ['l41_8', I('grindless:aqfp_module'), 'AQFP Module'],
          ['l41_9', I('grindless:matrioshka_logic_tile'), 'Matrioshka Logic Tile'],
        ], 'the Matrioshka computer'),
        // line 42
        ...chain(10, [
          ['l42_0', I('gtceu:praseodymium_dust'), 'Praseodymium', 'raw'],
          ['l42_1', mach('gtceu:levitation_melter'), 'Levitation Melter', 'ours'],
          ['l42_2', I('gtceu:prni5_dust'), 'Prni5'],
          ['l42_3', mach('gtceu:millikelvin_cryostat_works'), 'Millikelvin Cryostat Works', 'ours'],
          ['l42_4', I('grindless:nuclear_stage'), 'Nuclear Stage'],
          ['l42_5', mach('gtceu:millikelvin_cryostat_works'), 'Millikelvin Cryostat Works', 'ours'],
          ['l42_6', I('grindless:mk_cryostat_module'), 'MK Cryostat Module'],
        ], 'the P:Si line and the memories'),
      ],
    },
    fusion: {
      name: 'Fusion fuel and heat',
      nodes: [
        // line 26
        ...chain(0, [
          ['l26_0', I('gtceu:lithium_chloride_dust'), 'Lithium Chloride', 'raw'],
          ['l26_1', mach('gtceu:calutron'), 'Calutron', 'ours'],
          ['l26_2', I('gtceu:lithium_6_dust'), 'Lithium 6'],
          ['l26_3', mach('gtceu:pyroprocessing_cell'), 'Pyroprocessing Cell', 'ours'],
          ['l26_4', I('gtceu:lithium_6_metal_dust'), 'Lithium 6 Metal'],
          ['l26_5', I('grindless:li6_hydride'), 'Li-6 Hydride'],
          ['l26_6', mach('gtceu:polarised_proton_source'), 'Polarised Proton Source', 'ours'],
          ['l26_7', I('grindless:polarised_li6h'), 'Polarised Li-6h'],
          ['l26_8', I('grindless:polarised_li6h_pellet'), 'Polarised Li-6h Pellet'],
        ], 'the Mk5 ring'),
        // line 29
        ...chain(2, [
          ['l29_0', I('grindless:rhea_am_powder'), 'RHEA Am Powder', 'raw'],
          ['l29_1', mach('gtceu:powder_bed_printer'), 'Powder Bed Printer', 'ours'],
          ['l29_2', I('grindless:near_net_w_mesh'), 'Near Net W Mesh'],
          ['l29_3', mach('gtceu:powder_bed_printer'), 'Powder Bed Printer', 'ours'],
          ['l29_4', I('grindless:w_mesh'), 'W Mesh'],
          ['l29_5', I('grindless:cps_wetted_mesh'), 'CPS Wetted Mesh'],
          ['l29_6', I('grindless:divertor_cassette'), 'Divertor Cassette'],
          ['l29_7', I('grindless:divertor'), 'Divertor'],
        ], 'the fusion casing'),
        // line 34
        ...chain(4, [
          ['l34_0', I('grindless:cooled_positron_bunch'), 'Cooled Positron Bunch', 'raw'],
          ['l34_1', mach('gtceu:positronium_condensate_lab'), 'Positronium Condensate Lab', 'ours'],
          ['l34_2', I('grindless:ps_in_aerogel'), 'PS In Aerogel'],
          ['l34_3', mach('gtceu:positronium_condensate_lab'), 'Positronium Condensate Lab', 'ours'],
          ['l34_4', I('grindless:laser_cooled_ps'), 'Laser Cooled PS'],
          ['l34_5', mach('gtceu:antimatter_trap'), 'Antimatter Trap', 'ours'],
          ['l34_6', I('grindless:ps_bec'), 'PS Bec'],
          ['l34_7', mach('gtceu:positronium_condensate_lab'), 'Positronium Condensate Lab', 'ours'],
          ['l34_8', I('grindless:gamma_laser_cavity'), 'Gamma Laser Cavity'],
        ], 'the UIV emitter'),
        // line 37
        ...chain(6, [
          ['l37_0', I('grindless:gallium_arsenide_wafer'), 'Gallium Arsenide Wafer', 'raw'],
          ['l37_1', mach('gtceu:mocvd_reactor'), 'Mocvd Reactor', 'ours'],
          ['l37_2', I('grindless:ingaasb_epi_wafer'), 'Ingaasb Epi Wafer'],
          ['l37_3', mach('gtceu:photonic_foundry'), 'Photonic Foundry', 'ours'],
          ['l37_4', I('grindless:air_bridge_wafer'), 'Air Bridge Wafer'],
          ['l37_5', I('grindless:ingaasb_tpv_cell'), 'Ingaasb TPV Cell'],
          ['l37_6', mach('gtceu:droplet_radiator_works'), 'Droplet Radiator Works', 'ours'],
          ['l37_7', I('grindless:tpv_tile'), 'TPV Tile'],
          ['l37_8', I('grindless:tpv_segment'), 'TPV Segment'],
          ['l37_9', I('grindless:matrioshka_tpv_shell'), 'Matrioshka TPV Shell'],
        ], 'the Matrioshka computer'),
        // line 38
        ...chain(8, [
          ['l38_0', I('grindless:c12_cvd_plate'), 'C-12 CVD Plate', 'raw'],
          ['l38_1', mach('gtceu:megabar_press'), 'Megabar Press', 'ours'],
          ['l38_2', I('grindless:c12_hpht_plate'), 'C-12 HPHT Plate'],
          ['l38_3', I('grindless:c12_004_plate'), 'C-12 004 Plate'],
          ['l38_4', I('grindless:c12_ion_milled_plate'), 'C-12 Ion Milled Plate'],
          ['l38_5', I('grindless:gamma_bragg_mirror'), 'Gamma Bragg Mirror'],
        ], 'the positronium lab'),
        // line 43
        ...chain(10, [
          ['l43_0', I('grindless:c12_cvd_plate'), 'C-12 CVD Plate', 'raw'],
          ['l43_1', mach('gtceu:ion_implanter'), 'Ion Implanter', 'ours'],
          ['l43_2', I('grindless:c12_boron_diamond'), 'C-12 Boron Diamond'],
          ['l43_3', mach('gtceu:photonic_foundry'), 'Photonic Foundry', 'ours'],
          ['l43_4', I('grindless:diamond_contact_wafer'), 'Diamond Contact Wafer'],
          ['l43_5', I('grindless:diamond_schottky_die'), 'Diamond Schottky Die'],
          ['l43_6', I('grindless:rad_hard_controller'), 'Rad Hard Controller'],
        ], 'the neutron star site'),
        // line 46
        ...chain(12, [
          ['l46_0', I('gtceu:tungsten_dust'), 'Tungsten', 'raw'],
          ['l46_1', mach('gtceu:spark_plasma_sinterer'), 'Spark Plasma Sinterer', 'ours'],
          ['l46_2', I('grindless:w_target'), 'W Target'],
          ['l46_3', I('grindless:sputtered_w_wafer'), 'Sputtered W Wafer'],
          ['l46_4', mach('gtceu:photonic_foundry'), 'Photonic Foundry', 'ours'],
          ['l46_5', I('grindless:w_photonic_crystal'), 'W Photonic Crystal'],
          ['l46_6', I('grindless:hfo2_passivated_crystal'), 'Hfo2 Passivated Crystal'],
          ['l46_7', I('grindless:selective_emitter'), 'Selective Emitter'],
        ], 'the TPV shell'),
        // line 22
        ...chain(14, [
          ['l22_0', I('gtceu:uranium_233_ingot'), 'Uranium 233 Ingot', 'raw'],
          ['l22_1', mach('gtceu:transuranium_facility'), 'Transuranium Facility', 'ours'],
          ['l22_2', I('grindless:thorium_229'), 'Thorium 229'],
          ['l22_3', mach('gtceu:fluorspar_kiln'), 'Fluorspar Kiln', 'ours'],
          ['l22_4', I('grindless:thf4'), 'Thf4'],
          ['l22_5', mach('gtceu:mbe_reactor'), 'MBE Reactor', 'ours'],
          ['l22_6', I('grindless:thf4_film'), 'Thf4 Film'],
          ['l22_7', I('grindless:capped_thf4_film'), 'Capped Thf4 Film'],
          ['l22_8', mach('gtceu:nuclear_clock_lab'), 'Nuclear Clock Lab', 'ours'],
          ['l22_9', I('grindless:chip_nuclear_clock'), 'Chip Nuclear Clock'],
        ], 'the UIV sensor'),
      ],
    },
  },
};
