// pl_uxv: the UXV lines. Positions are relative to each cluster (pl-model.mjs places the clusters).
// Every UXV package has landed, so nothing is gated. Arrows are checked against a recipe dump by pl-check.mjs (integrator).
// Each row is one line of docs/eras/uxv.md ("New process lines"), keyed by its number, as the recipes run today; long older prefixes
// start at the first UXV-era product. Line 20 (Es-254 target) and line 23 (Cm-248 target) are short of four steps on their own, so
// they are drawn as the heads of lines 20/21 and 24. Rows are laid out by chain(), 2.5 columns per step.
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

export default {
  file: 'pl_uxv',
  order: 12,
  title: 'UXV Lines',
  subtitle: 'Targets and wafers for spin logic, flakes, garnets and the sensor, superheavy III and Cassiopeia A, the burning stages of the Mk6, and pasta and the UXV parts.',
  icon: 'gtnn:spintronic_mainframe',
  focus: 'l6_0',
  bands: [['targets', 'wafers'], ['flakes', 'atoms'], ['stars', 'pasta'], ['parts', 'chips']],
  clusters: {
    targets: {
      name: 'Sputter targets',
      nodes: [
        // line 1
        ...chain(0, [
          ['l1_0', I('grindless:five_n_cobalt'), '5N Cobalt', 'raw'],
          ['l1_1', mach('gtceu:levitation_melter'), 'Levitation Melter', 'ours'],
          ['l1_2', I('grindless:cofeb_ingot'), 'CoFeB Ingot'],
          ['l1_3', I('grindless:cofeb_am_powder'), 'CoFeB AM Powder'],
          ['l1_4', mach('gtceu:powder_bed_printer'), 'Powder Bed Printer', 'ours'],
          ['l1_5', I('grindless:near_net_cofeb_blank'), 'Near Net CoFeB Blank'],
          ['l1_6', I('grindless:cofeb_hip_blank'), 'CoFeB HIP Blank'],
          ['l1_7', I('grindless:cofeb_target'), 'CoFeB Target'],
        ], 'the MTJ sputter cluster'),
        // line 2
        ...chain(2, [
          ['l2_0', I('gtceu:magnesite_dust'), 'Magnesite', 'raw'],
          ['l2_1', mach('gtceu:extraction_cascade'), 'Extraction Cascade', 'ours'],
          ['l2_2', I('grindless:magnesium_hydroxide_dust'), 'Magnesium Hydroxide'],
          ['l2_3', mach('gtceu:fluorspar_kiln'), 'Fluorspar Kiln', 'ours'],
          ['l2_4', I('grindless:five_n_magnesia_dust'), '5N Magnesia'],
          ['l2_5', I('grindless:mgo_am_powder'), 'MgO AM Powder'],
          ['l2_6', I('grindless:near_net_mgo_blank'), 'Near Net MgO Blank'],
          ['l2_7', I('grindless:mgo_hip_blank'), 'MgO HIP Blank'],
          ['l2_8', I('grindless:mgo_target'), 'MgO Target'],
        ], 'the MTJ sputter cluster'),
        // line 3
        ...chain(4, [
          ['l3_0', I('grindless:five_n_manganese'), '5N Manganese', 'raw'],
          ['l3_1', mach('gtceu:levitation_melter'), 'Levitation Melter', 'ours'],
          ['l3_2', I('grindless:heusler_cast_ingot'), 'Heusler Cast Ingot'],
          ['l3_3', mach('gtceu:nitride_magnet_works'), 'Nitride Magnet Works', 'ours'],
          ['l3_4', I('grindless:heusler_ingot'), 'Heusler Ingot'],
          ['l3_5', I('grindless:heusler_am_powder'), 'Heusler AM Powder'],
          ['l3_6', I('grindless:near_net_heusler_blank'), 'Near Net Heusler Blank'],
          ['l3_7', I('grindless:heusler_hip_blank'), 'Heusler HIP Blank'],
          ['l3_8', I('grindless:heusler_target'), 'Heusler Target'],
        ], 'the MTJ sputter cluster'),
        // line 4
        ...chain(6, [
          ['l4_0', I('gtceu:ruthenium_dust'), 'Ruthenium', 'raw'],
          ['l4_1', mach('gtceu:platinum_plant'), 'Platinum Plant', 'ours'],
          ['l4_2', I('grindless:five_n_ruthenium'), '5N Ruthenium'],
          ['l4_3', I('grindless:ruthenium_am_powder'), 'Ruthenium AM Powder'],
          ['l4_4', I('grindless:near_net_saf_blank'), 'Near Net SAF Blank'],
          ['l4_5', I('grindless:saf_hip_blank'), 'SAF HIP Blank'],
          ['l4_6', I('grindless:saf_target_set'), 'SAF Target Set'],
        ], 'the racetrack wafer'),
        // line 5
        ...chain(8, [
          ['l5_0', I('grindless:tantalite_fluoride_cake'), 'Tantalite Fluoride Cake', 'raw'],
          ['l5_1', mach('gtceu:extraction_cascade'), 'Extraction Cascade', 'ours'],
          ['l5_2', I('grindless:k2taf7_dust'), 'K2TaF7'],
          ['l5_3', I('grindless:tantalum_powder'), 'Tantalum Powder'],
          ['l5_4', mach('gtceu:electron_beam_furnace'), 'Electron Beam Furnace', 'ours'],
          ['l5_5', I('grindless:six_n_tantalum'), '6N Tantalum'],
          ['l5_6', mach('gtceu:hot_strip_mill'), 'Hot Strip Mill', 'ours'],
          ['l5_7', I('grindless:ta_foil'), 'Ta Foil'],
          ['l5_8', I('grindless:ta_seed_target'), 'Ta Seed Target'],
        ], 'the MTJ sputter cluster'),
        // line 10
        ...chain(10, [
          ['l10_0', I('grindless:five_n_ruthenium'), '5N Ruthenium', 'raw'],
          ['l10_1', I('grindless:srruo3_charge_dust'), 'SrRuO3 Charge'],
          ['l10_2', mach('gtceu:fluorspar_kiln'), 'Fluorspar Kiln', 'ours'],
          ['l10_3', I('gtceu:srruo3_dust'), 'SrRuO3'],
          ['l10_4', I('grindless:srruo3_am_powder'), 'SrRuO3 AM Powder'],
          ['l10_5', I('grindless:near_net_srruo3_blank'), 'Near Net SrRuO3 Blank'],
          ['l10_6', I('grindless:srruo3_hip_blank'), 'SrRuO3 HIP Blank'],
          ['l10_7', I('grindless:srruo3_target'), 'SrRuO3 Target'],
          ['l10_8', mach('gtceu:oxide_pld_chamber'), 'Oxide PLD Chamber', 'ours'],
          ['l10_9', I('grindless:srruo3_electrode_wafer'), 'SrRuO3 Electrode Wafer'],
        ], 'the MESO logic die'),
      ],
    },
    wafers: {
      name: 'Spin wafers and logic',
      nodes: [
        // line 6
        ...chain(0, [
          ['l6_0', I('grindless:silicon_28_dust'), 'Silicon 28', 'raw'],
          ['l6_1', mach('gtceu:zone_refining_tower'), 'Zone Refining Tower', 'ours'],
          ['l6_2', I('grindless:si28_fz_ingot'), 'Si-28 FZ Ingot'],
          ['l6_3', I('grindless:si28_fz_wafer'), 'Si-28 FZ Wafer'],
          ['l6_4', I('grindless:h_si28_wafer'), 'H Si-28 Wafer'],
          ['l6_5', mach('gtceu:mtj_sputter_cluster'), 'MTJ Sputter Cluster', 'ours'],
          ['l6_6', I('grindless:mtj_stack_wafer'), 'MTJ Stack Wafer'],
          ['l6_7', I('grindless:annealed_mtj_wafer'), 'Annealed MTJ Wafer'],
          ['l6_8', I('grindless:etched_mtj_wafer'), 'Etched MTJ Wafer'],
          ['l6_9', I('grindless:mtj_die'), 'MTJ Die'],
        ], 'the UXV sensor'),
        // line 7
        ...chain(2, [
          ['l7_0', I('grindless:h_si28_wafer'), 'H Si-28 Wafer', 'raw'],
          ['l7_1', mach('gtceu:mtj_sputter_cluster'), 'MTJ Sputter Cluster', 'ours'],
          ['l7_2', I('grindless:mram_stack_wafer'), 'MRAM Stack Wafer'],
          ['l7_3', I('grindless:annealed_mram_wafer'), 'Annealed MRAM Wafer'],
          ['l7_4', I('grindless:etched_mram_wafer'), 'Etched MRAM Wafer'],
          ['l7_5', mach('gtceu:photonic_foundry'), 'Photonic Foundry', 'ours'],
          ['l7_6', I('grindless:mram_wafer'), 'MRAM Wafer'],
        ], 'the spintronic mainframe'),
        // line 8
        ...chain(4, [
          ['l8_0', I('grindless:h_si28_wafer'), 'H Si-28 Wafer', 'raw'],
          ['l8_1', mach('gtceu:mtj_sputter_cluster'), 'MTJ Sputter Cluster', 'ours'],
          ['l8_2', I('grindless:saf_track_wafer'), 'SAF Track Wafer'],
          ['l8_3', I('grindless:annealed_saf_wafer'), 'Annealed SAF Wafer'],
          ['l8_4', I('grindless:written_track_wafer'), 'Written Track Wafer'],
          ['l8_5', I('grindless:patterned_track_wafer'), 'Patterned Track Wafer'],
          ['l8_6', mach('gtceu:racetrack_fab'), 'Racetrack Fab', 'ours'],
          ['l8_7', I('grindless:racetrack_chip'), 'Racetrack Chip'],
        ], 'the spintronic mainframe'),
        // line 44
        ...chain(6, [
          ['l44_0', I('grindless:h_si28_wafer'), 'H Si-28 Wafer', 'raw'],
          ['l44_1', mach('gtceu:mtj_sputter_cluster'), 'MTJ Sputter Cluster', 'ours'],
          ['l44_2', I('grindless:stno_stack_wafer'), 'STNO Stack Wafer'],
          ['l44_3', mach('gtceu:electron_beam_furnace'), 'Electron Beam Furnace', 'ours'],
          ['l44_4', I('grindless:stno_defined_wafer'), 'STNO Defined Wafer'],
          ['l44_5', I('grindless:stno_milled_wafer'), 'STNO Milled Wafer'],
          ['l44_6', I('grindless:stno_clean_wafer'), 'STNO Clean Wafer'],
          ['l44_7', I('grindless:stno_planarised_wafer'), 'STNO Planarised Wafer'],
          ['l44_8', I('grindless:stno_array'), 'STNO Array'],
        ], 'the magnonic bus'),
        // line 9
        ...chain(8, [
          ['l9_0', I('grindless:dysco3_charge_dust'), 'DyScO3 Charge', 'raw'],
          ['l9_1', mach('gtceu:fluorspar_kiln'), 'Fluorspar Kiln', 'ours'],
          ['l9_2', I('gtceu:dysco3_dust'), 'DyScO3'],
          ['l9_3', mach('gtceu:crystal_growth_furnace'), 'Crystal Growth Furnace', 'ours'],
          ['l9_4', I('grindless:dysco3_boule'), 'DyScO3 Boule'],
          ['l9_5', I('grindless:dysco3_slice'), 'DyScO3 Slice'],
          ['l9_6', I('grindless:dysco3_polished_slice'), 'DyScO3 Polished Slice'],
          ['l9_7', I('grindless:dysco3_substrate'), 'DyScO3 Substrate'],
        ], 'the oxide PLD chamber'),
        // line 11
        ...chain(10, [
          ['l11_0', I('gtceu:la_bfo_dust'), 'La-BFO', 'raw'],
          ['l11_1', I('grindless:la_bfo_am_powder'), 'La-BFO AM Powder'],
          ['l11_2', I('grindless:near_net_la_bfo_blank'), 'Near Net La-BFO Blank'],
          ['l11_3', I('grindless:la_bfo_hip_blank'), 'La-BFO HIP Blank'],
          ['l11_4', I('grindless:la_bfo_target'), 'La-BFO Target'],
          ['l11_5', mach('gtceu:oxide_pld_chamber'), 'Oxide PLD Chamber', 'ours'],
          ['l11_6', I('grindless:bfo_film_wafer'), 'BFO Film Wafer'],
          ['l11_7', I('grindless:cofe_me_wafer'), 'CoFe ME Wafer'],
          ['l11_8', I('grindless:me_switch_wafer'), 'ME Switch Wafer'],
          ['l11_9', I('grindless:meso_logic_die'), 'MESO Logic Die'],
        ], 'the spintronic mainframe'),
      ],
    },
    flakes: {
      name: 'Flakes, garnets and the sensor',
      nodes: [
        // line 12
        ...chain(0, [
          ['l12_0', I('grindless:hbn_dust'), 'hBN', 'raw'],
          ['l12_1', mach('gtceu:megabar_press'), 'Megabar Press', 'ours'],
          ['l12_2', I('grindless:raw_hbn_crystal'), 'Raw hBN Crystal'],
          ['l12_3', I('grindless:hbn_crystal'), 'hBN Crystal'],
          ['l12_4', mach('gtceu:vdw_stacking_cell'), 'vdW Stacking Cell', 'ours'],
          ['l12_5', I('grindless:hbn_flake'), 'hBN Flake'],
        ]),
        // line 13
        ...chain(2, [
          ['l13_0', I('gtceu:tellurium_dust'), 'Tellurium', 'raw'],
          ['l13_1', mach('gtceu:zone_refining_tower'), 'Zone Refining Tower', 'ours'],
          ['l13_2', I('grindless:seven_n_tellurium'), '7N Tellurium'],
          ['l13_3', I('grindless:wte2_raw_crystal'), 'WTe2 Raw Crystal'],
          ['l13_4', I('grindless:wte2_crystal'), 'WTe2 Crystal'],
          ['l13_5', I('grindless:wte2_flake'), 'WTe2 Flake'],
        ], 'the SOT heterostack'),
        // line 14
        ...chain(4, [
          ['l14_0', I('gtceu:germanium_dust'), 'Germanium', 'raw'],
          ['l14_1', mach('gtceu:zone_refining_tower'), 'Zone Refining Tower', 'ours'],
          ['l14_2', I('grindless:seven_n_germanium'), '7N Germanium'],
          ['l14_3', I('grindless:fgt_raw_crystal'), 'FGT Raw Crystal'],
          ['l14_4', I('grindless:fgt_crystal'), 'FGT Crystal'],
          ['l14_5', I('grindless:fgt_flake'), 'FGT Flake'],
        ], 'the SOT heterostack'),
        // line 15
        ...chain(6, [
          ['l15_0', I('grindless:hbn_flake'), 'hBN Flake', 'raw'],
          ['l15_1', mach('gtceu:vdw_stacking_cell'), 'vdW Stacking Cell', 'ours'],
          ['l15_2', I('grindless:sot_heterostack'), 'SOT Heterostack'],
          ['l15_3', I('grindless:contacted_sot_stack'), 'Contacted SOT Stack'],
          ['l15_4', mach('gtceu:nitride_magnet_works'), 'Nitride Magnet Works', 'ours'],
          ['l15_5', I('grindless:sot_readout_stack'), 'SOT Readout Stack'],
        ], 'the MESO logic die'),
        // line 16
        ...chain(8, [
          ['l16_0', I('grindless:ggg_charge_dust'), 'GGG Charge', 'raw'],
          ['l16_1', mach('gtceu:fluorspar_kiln'), 'Fluorspar Kiln', 'ours'],
          ['l16_2', I('gtceu:ggg_dust'), 'GGG'],
          ['l16_3', mach('gtceu:crystal_growth_furnace'), 'Crystal Growth Furnace', 'ours'],
          ['l16_4', I('grindless:ggg_boule'), 'GGG Boule'],
          ['l16_5', I('grindless:ggg_slice'), 'GGG Slice'],
          ['l16_6', I('grindless:ggg_polished_slice'), 'GGG Polished Slice'],
          ['l16_7', I('grindless:ggg_wafer'), 'GGG Wafer'],
        ]),
        // line 17
        ...chain(10, [
          ['l17_0', I('grindless:ggg_wafer'), 'GGG Wafer', 'raw'],
          ['l17_1', mach('gtceu:yig_lpe_furnace'), 'YIG LPE Furnace', 'ours'],
          ['l17_2', I('grindless:yig_film_wafer'), 'YIG Film Wafer'],
          ['l17_3', I('grindless:yig_waveguide_wafer'), 'YIG Waveguide Wafer'],
          ['l17_4', I('grindless:magnonic_bus'), 'Magnonic Bus'],
        ], 'the spintronic mainframe'),
        // line 18
        ...chain(12, [
          ['l18_0', I('grindless:sin_membrane'), 'SiN Membrane', 'raw'],
          ['l18_1', mach('gtceu:electron_beam_furnace'), 'Electron Beam Furnace', 'ours'],
          ['l18_2', I('grindless:nanoaperture_array'), 'Nanoaperture Array'],
          ['l18_3', mach('gtceu:shequid_works'), 'SHeQUID Works', 'ours'],
          ['l18_4', I('grindless:weak_link_cell'), 'Weak Link Cell'],
          ['l18_5', I('grindless:shequid_gyro'), 'SHeQUID Gyro'],
          ['l18_6', I('gtceu:uxv_sensor'), 'UXV Sensor'],
        ]),
      ],
    },
    atoms: {
      name: 'Superheavy III and Cassiopeia A',
      nodes: [
        // line 19
        ...chain(0, [
          ['l19_0', I('gtceu:fermium_dust'), 'Fermium', 'raw'],
          ['l19_1', mach('gtceu:calutron'), 'Calutron', 'ours'],
          ['l19_2', I('gtceu:fermium_257_dust'), 'Fermium 257'],
          ['l19_3', mach('gtceu:transuranium_facility'), 'Transuranium Facility', 'ours'],
          ['l19_4', I('grindless:fm257_plated_blank'), 'Fm-257 Plated Blank'],
          ['l19_5', mach('gtceu:spark_plasma_sinterer'), 'Spark Plasma Sinterer', 'ours'],
          ['l19_6', I('grindless:fm257_target'), 'Fm-257 Target'],
        ], 'element 122'),
        // line 20, then line 21
        ...chain(2, [
          ['l20_0', F('gtceu:es_254_solution'), 'Es-254 Solution', 'raw'],
          ['l20_1', mach('gtceu:transuranium_facility'), 'Transuranium Facility', 'ours'],
          ['l20_2', I('gtceu:einsteinium_dust'), 'Einsteinium'],
          ['l20_3', I('grindless:es254_target'), 'Es-254 Target'],
          ['l21_0', mach('gtceu:heavy_ion_cyclotron'), 'Heavy Ion Cyclotron', 'ours'],
          ['l21_1', F('gtceu:element_121_recoil_gas'), 'Element 121 Recoil Gas'],
          ['l21_2', mach('gtceu:recoil_separator'), 'Recoil Separator', 'ours'],
          ['l21_3', I('grindless:element_121_atoms'), 'Element 121 Atoms'],
          ['l21_4', I('grindless:element_121_recoil'), 'Element 121 Recoil'],
        ], 'superheavy census III'),
        // line 22
        ...chain(4, [
          ['l22_0', I('grindless:ti50_oven_charge'), 'Ti-50 Oven Charge', 'raw'],
          ['l22_1', mach('gtceu:heavy_ion_cyclotron'), 'Heavy Ion Cyclotron', 'ours'],
          ['l22_2', F('gtceu:element_122_recoil_gas'), 'Element 122 Recoil Gas'],
          ['l22_3', mach('gtceu:recoil_separator'), 'Recoil Separator', 'ours'],
          ['l22_4', I('grindless:element_122_atoms'), 'Element 122 Atoms'],
          ['l22_5', mach('gtceu:superheavy_chemistry_lab'), 'Superheavy Chemistry Lab', 'ours'],
          ['l22_6', I('grindless:element_122_recoil'), 'Element 122 Recoil'],
          ['l22_7', I('grindless:superheavy_census_iii'), 'Superheavy Census III'],
        ], 'the gate to OpV'),
        // line 23, then line 24
        ...chain(6, [
          ['l23_0', I('gtceu:curium_248_dust'), 'Curium 248', 'raw'],
          ['l23_1', mach('gtceu:transuranium_facility'), 'Transuranium Facility', 'ours'],
          ['l23_2', I('grindless:cm248_plated_blank'), 'Cm-248 Plated Blank'],
          ['l23_3', I('grindless:cm248_target'), 'Cm-248 Target'],
          ['l24_0', mach('gtceu:mnt_collider'), 'MNT Collider', 'ours'],
          ['l24_1', F('gtceu:mnt_product_gas'), 'MNT Product Gas'],
          ['l24_2', I('grindless:mnt_thermal_ions'), 'MNT Thermal Ions'],
          ['l24_3', I('grindless:island_nuclide'), 'Island Nuclide'],
          ['l24_4', I('grindless:island_chart'), 'Island Chart'],
        ], 'the gate to OpV'),
        // line 43
        ...chain(8, [
          ['l43_0', F('gtceu:helium'), 'Helium', 'raw'],
          ['l43_1', F('gtceu:liquid_helium'), 'Liquid Helium'],
          ['l43_2', mach('gtceu:cryogenic_plant'), 'Cryogenic Plant', 'ours'],
          ['l43_3', F('gtceu:he_6n'), '6N Helium'],
          ['l43_4', I('grindless:gas_stopping_cell'), 'Gas Stopping Cell'],
        ], 'the MNT collider'),
        // line 25
        ...chain(10, [
          ['l25_0', I('grindless:ejecta_knot_dust'), 'Ejecta Knot Dust', 'raw'],
          ['l25_1', I('grindless:ejecta_ti_fraction_dust'), 'Ejecta Ti Fraction'],
          ['l25_2', mach('gtceu:calutron'), 'Calutron', 'ours'],
          ['l25_3', I('gtceu:titanium_44_dust'), 'Titanium 44'],
          ['l25_4', I('grindless:ti44_core'), 'Ti-44 Core'],
          ['l25_5', mach('gtceu:annihilation_laser_works'), 'Annihilation Laser Works', 'ours'],
          ['l25_6', I('grindless:moderated_ps_cell'), 'Moderated Ps Cell'],
          ['l25_7', I('grindless:gamma_laser_module'), 'Gamma Laser Module'],
          ['l25_8', I('gtceu:uxv_emitter'), 'UXV Emitter'],
        ]),
      ],
    },
    stars: {
      name: 'Stellar fuels and fields',
      nodes: [
        // line 26
        ...chain(0, [
          ['l26_0', F('gtceu:stellar_plasma'), 'Stellar Plasma', 'raw'],
          ['l26_1', mach('gtceu:plasma_mass_filter'), 'Plasma Mass Filter', 'ours'],
          ['l26_2', F('gtceu:stellar_cno_cut'), 'Stellar CNO Cut'],
          ['l26_3', mach('gtceu:uxv_fusion_reactor'), 'Mk6 Fusion Ring', 'ours'],
          ['l26_4', F('gtceu:cno_ash_plasma'), 'CNO Ash Plasma'],
          ['l26_5', mach('gtceu:direct_energy_converter'), 'Direct Energy Converter', 'ours'],
          ['l26_6', F('gtceu:stellar_cno_cut'), 'Stellar CNO Cut'],
        ], 'the Mk6 ring again'),
        // line 27
        ...chain(2, [
          ['l27_0', F('gtceu:stellar_helium_cut'), 'Stellar Helium Cut', 'raw'],
          ['l27_1', mach('gtceu:cryogenic_plant'), 'Cryogenic Plant', 'ours'],
          ['l27_2', F('gtceu:triple_alpha_fuel'), 'Triple Alpha Fuel'],
          ['l27_3', mach('gtceu:uxv_fusion_reactor'), 'Mk6 Fusion Ring', 'ours'],
          ['l27_4', F('gtceu:helium_burning_ash_plasma'), 'Helium Burning Ash Plasma'],
          ['l27_5', mach('gtceu:direct_energy_converter'), 'Direct Energy Converter', 'ours'],
          ['l27_6', F('gtceu:helium_burning_ash'), 'Helium Burning Ash'],
          ['l27_7', mach('gtceu:plasma_quench_caster'), 'Plasma Quench Caster', 'ours'],
          ['l27_8', I('gtceu:carbon_12_dust'), 'Carbon 12'],
        ], 'carbon burning'),
        // line 28
        ...chain(4, [
          ['l28_0', I('gtceu:carbon_12_dust'), 'Carbon 12', 'raw'],
          ['l28_1', mach('gtceu:electron_beam_furnace'), 'Electron Beam Furnace', 'ours'],
          ['l28_2', F('gtceu:carbon_burning_fuel'), 'Carbon Burning Fuel'],
          ['l28_3', mach('gtceu:uxv_fusion_reactor'), 'Mk6 Fusion Ring', 'ours'],
          ['l28_4', F('gtceu:carbon_burning_ash_plasma'), 'Carbon Burning Ash Plasma'],
          ['l28_5', mach('gtceu:direct_energy_converter'), 'Direct Energy Converter', 'ours'],
          ['l28_6', F('gtceu:carbon_burning_ash'), 'Carbon Burning Ash'],
        ], 'the plasma quench caster'),
        // line 29
        ...chain(6, [
          ['l29_0', F('gtceu:oxygen_16'), 'Oxygen 16', 'raw'],
          ['l29_1', mach('gtceu:cryogenic_plant'), 'Cryogenic Plant', 'ours'],
          ['l29_2', F('gtceu:oxygen_burning_fuel'), 'Oxygen Burning Fuel'],
          ['l29_3', mach('gtceu:uxv_fusion_reactor'), 'Mk6 Fusion Ring', 'ours'],
          ['l29_4', F('gtceu:oxygen_burning_ash_plasma'), 'Oxygen Burning Ash Plasma'],
          ['l29_5', mach('gtceu:direct_energy_converter'), 'Direct Energy Converter', 'ours'],
          ['l29_6', F('gtceu:oxygen_burning_ash'), 'Oxygen Burning Ash'],
          ['l29_7', mach('gtceu:plasma_quench_caster'), 'Plasma Quench Caster', 'ours'],
          ['l29_8', I('grindless:si28_ash'), 'Si-28 Ash'],
        ]),
        // line 30
        ...chain(8, [
          ['l30_0', I('grindless:mh_winding'), 'MH Winding', 'raw'],
          ['l30_1', mach('gtceu:accretion_disk_skimmer'), 'Accretion Disk Skimmer', 'ours'],
          ['l30_2', F('gtceu:disk_plasma'), 'Disk Plasma'],
          ['l30_3', mach('gtceu:plasma_mass_filter'), 'Plasma Mass Filter', 'ours'],
          ['l30_4', F('gtceu:filtered_disk_plasma'), 'Filtered Disk Plasma'],
          ['l30_5', mach('gtceu:frc_former'), 'FRC Former', 'ours'],
          ['l30_6', I('grindless:frc_cartridge'), 'FRC Cartridge'],
          ['l30_7', I('grindless:strand_coil'), 'Strand Coil'],
          ['l30_8', I('gtceu:uxv_field_generator'), 'UXV Field Generator'],
        ]),
        // line 31
        ...chain(10, [
          ['l31_0', I('grindless:mh_winding'), 'MH Winding', 'raw'],
          ['l31_1', mach('gtceu:accretion_disk_skimmer'), 'Accretion Disk Skimmer', 'ours'],
          ['l31_2', F('gtceu:disk_plasma'), 'Disk Plasma'],
          ['l31_3', F('gtceu:filtered_disk_plasma'), 'Filtered Disk Plasma'],
          ['l31_4', mach('gtceu:frc_former'), 'FRC Former', 'ours'],
          ['l31_5', F('gtceu:flux_loaded_plasma'), 'Flux Loaded Plasma'],
        ], 'the BZ dynamo'),
        // line 38
        ...chain(12, [
          ['l38_0', I('grindless:coated_w_wire'), 'Coated W Wire', 'raw'],
          ['l38_1', I('grindless:w_fibre_preform'), 'W Fibre Preform'],
          ['l38_2', mach('gtceu:cvi_furnace'), 'CVI Furnace', 'ours'],
          ['l38_3', I('grindless:densified_w_preform'), 'Densified W Preform'],
          ['l38_4', mach('gtceu:levitation_melter'), 'Levitation Melter', 'ours'],
          ['l38_5', I('grindless:wf_rhea_billet'), 'WF-RHEA Billet'],
          ['l38_6', I('grindless:uxv_fusion_casing'), 'UXV Fusion Casing'],
        ], 'the Mk6 ring'),
      ],
    },
    pasta: {
      name: 'Pasta',
      nodes: [
        // line 32
        ...chain(0, [
          ['l32_0', I('grindless:vela_glitch_timing'), 'Vela Glitch Timing', 'raw'],
          ['l32_1', mach('gtceu:pasta_extractor'), 'Pasta Extractor', 'ours'],
          ['l32_2', I('grindless:raw_pasta'), 'Raw Pasta'],
          ['l32_3', mach('gtceu:pasta_phase_sorter'), 'Pasta Phase Sorter', 'ours'],
          ['l32_4', I('grindless:spaghetti_phase'), 'Spaghetti Phase'],
          ['l32_5', mach('gtceu:pasta_draw_bench'), 'Pasta Draw Bench', 'ours'],
          ['l32_6', I('gtceu:pasta_strand_single_wire'), 'Pasta Strand Wire'],
          ['l32_7', I('gtceu:pasta_strand_single_cable'), 'Pasta Strand Cable'],
        ], 'UXV cables'),
        // line 33
        ...chain(2, [
          ['l33_0', I('grindless:raw_pasta'), 'Raw Pasta', 'raw'],
          ['l33_1', mach('gtceu:pasta_phase_sorter'), 'Pasta Phase Sorter', 'ours'],
          ['l33_2', I('grindless:lasagna_phase'), 'Lasagna Phase'],
          ['l33_3', mach('gtceu:pasta_laminator'), 'Pasta Laminator', 'ours'],
          ['l33_4', I('grindless:lasagna_plate'), 'Lasagna Plate'],
          ['l33_5', I('gtceu:uxv_machine_hull'), 'UXV Machine Hull'],
        ]),
        // line 39
        ...chain(4, [
          ['l39_0', I('grindless:spaghetti_phase'), 'Spaghetti Phase', 'raw'],
          ['l39_1', mach('gtceu:pasta_draw_bench'), 'Pasta Draw Bench', 'ours'],
          ['l39_2', I('gtceu:pasta_strand_single_wire'), 'Pasta Strand Wire'],
          ['l39_3', mach('gtceu:coated_conductor_line'), 'Coated Conductor Line', 'ours'],
          ['l39_4', I('grindless:strand_tape'), 'Strand Tape'],
          ['l39_5', mach('gtceu:nitride_magnet_works'), 'Nitride Magnet Works', 'ours'],
          ['l39_6', I('grindless:uxv_smes_cell'), 'UXV SMES Cell'],
        ], 'the wireless towers'),
        // line 35
        ...chain(6, [
          ['l35_0', I('grindless:lasagna_phase'), 'Lasagna Phase', 'raw'],
          ['l35_1', mach('gtceu:pasta_laminator'), 'Pasta Laminator', 'ours'],
          ['l35_2', I('grindless:lasagna_plate'), 'Lasagna Plate'],
          ['l35_3', mach('gtceu:hot_strip_mill'), 'Hot Strip Mill', 'ours'],
          ['l35_4', I('grindless:alip_duct'), 'ALIP Duct'],
          ['l35_5', I('gtceu:uxv_electric_pump'), 'UXV Electric Pump'],
        ]),
      ],
    },
    parts: {
      name: 'Movers and gears',
      nodes: [
        // line 34
        ...chain(0, [
          ['l34_0', I('gtceu:tetrataenite_ingot'), 'Tetrataenite Ingot', 'raw'],
          ['l34_1', mach('gtceu:hot_strip_mill'), 'Hot Strip Mill', 'ours'],
          ['l34_2', I('grindless:tetrataenite_lamination'), 'Tetrataenite Lamination'],
          ['l34_3', mach('gtceu:hts_magnet_works'), 'HTS Magnet Works', 'ours'],
          ['l34_4', I('grindless:strand_stator'), 'Strand Stator'],
          ['l34_5', I('gtceu:uxv_electric_motor'), 'UXV Electric Motor'],
        ]),
        // line 36
        ...chain(2, [
          ['l36_0', I('gtceu:terbium_dust'), 'Terbium', 'raw'],
          ['l36_1', mach('gtceu:levitation_melter'), 'Levitation Melter', 'ours'],
          ['l36_2', I('grindless:terfenol_d_ingot'), 'Terfenol-D Ingot'],
          ['l36_3', mach('gtceu:crystal_growth_furnace'), 'Crystal Growth Furnace', 'ours'],
          ['l36_4', I('grindless:terfenol_d_rod'), 'Terfenol-D Rod'],
          ['l36_5', I('gtceu:uxv_electric_piston'), 'UXV Electric Piston'],
        ]),
        // line 37
        ...chain(4, [
          ['l37_0', I('grindless:five_n_nickel'), '5N Nickel', 'raw'],
          ['l37_1', mach('gtceu:levitation_melter'), 'Levitation Melter', 'ours'],
          ['l37_2', I('grindless:ni_mn_ga_ingot'), 'Ni-Mn-Ga Ingot'],
          ['l37_3', mach('gtceu:crystal_growth_furnace'), 'Crystal Growth Furnace', 'ours'],
          ['l37_4', I('grindless:ni_mn_ga_raw_crystal'), 'Ni-Mn-Ga Raw Crystal'],
          ['l37_5', I('grindless:ni_mn_ga_crystal'), 'Ni-Mn-Ga Crystal'],
          ['l37_6', I('gtceu:uxv_conveyor_module'), 'UXV Conveyor Module'],
        ]),
        // line 45
        ...chain(6, [
          ['l45_0', I('grindless:niobium_powder'), 'Niobium Powder', 'raw'],
          ['l45_1', mach('gtceu:electron_beam_furnace'), 'Electron Beam Furnace', 'ours'],
          ['l45_2', I('grindless:six_n_niobium'), '6N Niobium'],
          ['l45_3', I('grindless:gum_metal_blend'), 'Gum Metal Blend'],
          ['l45_4', I('grindless:gum_metal_billet'), 'Gum Metal Billet'],
          ['l45_5', I('grindless:gum_metal_blank'), 'Gum Metal Blank'],
          ['l45_6', I('grindless:gum_metal_flexspline'), 'Gum Metal Flexspline'],
          ['l45_7', I('grindless:uxv_strain_wave_gear'), 'UXV Strain Wave Gear'],
        ], 'the UXV robot arm'),
        // line 49
        ...chain(8, [
          ['l49_0', I('gtceu:tetrataenite_ingot'), 'Tetrataenite Ingot', 'raw'],
          ['l49_1', mach('gtceu:hot_strip_mill'), 'Hot Strip Mill', 'ours'],
          ['l49_2', I('grindless:encoder_ring'), 'Encoder Ring'],
          ['l49_3', I('grindless:multipole_encoder_ring'), 'Multipole Encoder Ring'],
          ['l49_4', I('grindless:tmr_encoder'), 'TMR Encoder'],
        ], 'the UXV robot arm'),
        // line 40
        ...chain(10, [
          ['l40_0', F('gtceu:methane'), 'Methane', 'raw'],
          ['l40_1', mach('gtceu:methane_pyrolyser'), 'Methane Pyrolyser', 'ours'],
          ['l40_2', I('grindless:cnt_sock'), 'CNT Sock'],
          ['l40_3', I('grindless:cnt_ribbon'), 'CNT Ribbon'],
          ['l40_4', I('grindless:cnt_densified_yarn'), 'CNT Densified Yarn'],
          ['l40_5', mach('gtceu:tether_ribbon_works'), 'Tether Ribbon Works', 'ours'],
          ['l40_6', I('grindless:cnt_bumper_weave'), 'CNT Bumper Weave'],
          ['l40_7', I('grindless:cnt_whipple_shield'), 'CNT Whipple Shield'],
        ], 'the Cassiopeia A hold'),
      ],
    },
    chips: {
      name: 'Power chips, shields and lasers',
      nodes: [
        // line 46
        ...chain(0, [
          ['l46_0', I('grindless:gallium_oxide_dust'), 'Gallium Oxide', 'raw'],
          ['l46_1', mach('gtceu:crystal_growth_furnace'), 'Crystal Growth Furnace', 'ours'],
          ['l46_2', I('grindless:ga2o3_efg_plate'), 'Ga2O3 EFG Plate'],
          ['l46_3', I('grindless:ga2o3_slice'), 'Ga2O3 Slice'],
          ['l46_4', I('grindless:ga2o3_wafer'), 'Ga2O3 Wafer'],
          ['l46_5', mach('gtceu:mocvd_reactor'), 'MOCVD Reactor', 'ours'],
          ['l46_6', I('grindless:ga2o3_epi_wafer'), 'Ga2O3 Epi Wafer'],
          ['l46_7', I('grindless:ga2o3_gated_wafer'), 'Ga2O3 Gated Wafer'],
          ['l46_8', I('grindless:ga2o3_power_die'), 'Ga2O3 Power Die'],
        ], 'the UXV machine hull'),
        // line 47
        ...chain(2, [
          ['l47_0', I('grindless:mu_metal_blend'), 'Mu-Metal Blend', 'raw'],
          ['l47_1', mach('gtceu:electron_beam_furnace'), 'Electron Beam Furnace', 'ours'],
          ['l47_2', I('grindless:mu_metal_ingot'), 'Mu-Metal Ingot'],
          ['l47_3', mach('gtceu:hot_strip_mill'), 'Hot Strip Mill', 'ours'],
          ['l47_4', I('grindless:mu_metal_hot_band'), 'Mu-Metal Hot Band'],
          ['l47_5', I('grindless:mu_metal_foil'), 'Mu-Metal Foil'],
          ['l47_6', I('grindless:annealed_mu_foil'), 'Annealed Mu Foil'],
          ['l47_7', I('grindless:mu_metal_shield_can'), 'Mu-Metal Shield Can'],
          ['l47_8', I('grindless:shielded_interposer'), 'Shielded Interposer'],
        ], 'the UXV sensor'),
        // line 48
        ...chain(4, [
          ['l48_0', I('grindless:finemet_charge_dust'), 'Finemet Charge', 'raw'],
          ['l48_1', mach('gtceu:levitation_melter'), 'Levitation Melter', 'ours'],
          ['l48_2', F('gtceu:finemet_melt'), 'Finemet Melt'],
          ['l48_3', mach('gtceu:plasma_quench_caster'), 'Plasma Quench Caster', 'ours'],
          ['l48_4', I('grindless:finemet_ribbon'), 'Finemet Ribbon'],
          ['l48_5', I('grindless:finemet_toroid'), 'Finemet Toroid'],
          ['l48_6', I('grindless:finemet_core'), 'Finemet Core'],
          ['l48_7', I('grindless:uxv_voltage_coil'), 'UXV Voltage Coil'],
        ]),
        // line 41
        ...chain(6, [
          ['l41_0', F('gtceu:krypton'), 'Krypton', 'raw'],
          ['l41_1', I('grindless:kr_f2_premix'), 'Kr-F2 Premix'],
          ['l41_2', I('grindless:krf_discharge_tube'), 'KrF Discharge Tube'],
          ['l41_3', I('grindless:krf_excimer_laser'), 'KrF Excimer Laser'],
        ], 'the oxide PLD chamber'),
        // line 42
        ...chain(8, [
          ['l42_0', I('grindless:five_n_platinum'), '5N Platinum', 'raw'],
          ['l42_1', mach('gtceu:hot_strip_mill'), 'Hot Strip Mill', 'ours'],
          ['l42_2', I('grindless:pt_sheet'), 'Pt Sheet'],
          ['l42_3', I('grindless:pt_crucible_shell'), 'Pt Crucible Shell'],
          ['l42_4', I('grindless:pt_lpe_crucible'), 'Pt LPE Crucible'],
        ], 'the YIG LPE furnace'),
      ],
    },
  },
};
