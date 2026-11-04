// pl_uxv: the UXV lines, drawn as ten clusters X1-X10. Positions are relative to each cluster (pl-model.mjs places the clusters).
// Every UXV package has landed, so nothing is gated. Arrows are checked against a recipe dump by pl-check.mjs (integrator).
// Each cluster has one trunk (the line the cluster is for); the lines that feed it are branches that fan in from above and below,
// and a line that serves another cluster or era is a row ending in a `dest` node. Every arrow follows a recipe of the dump.
// X1 is the spintronic mainframe: the tool nodes take the wafers the recipes take (the MRAM stack takes the Si-28 CMOS wafer
// with the metal-1 layers, the SAF track takes the MRAM wafer, the STNO stack takes the racetrack chip).
import { I, F, L, M, n } from './pl-lib.mjs';

const dest = (nodes, end) => nodes.map((nd, i) => (i === nodes.length - 1 ? { ...nd, kind: 'dest', end } : nd));
const mach = (id) => M(id);

// cluster(build): build(c) lays nodes with c.trunk(...), c.feed(...), c.spur(...), c.row(...), c.vlink(...) and c.add(nodes);
// a step is [key, resource, title, kind?, options?]; a step whose resource is a string is a link to another chart
function cluster(name, build) {
  const nodes = [];
  const get = (key) => nodes.find((nd) => nd.key === key);
  const mk = (key, res, title, kind, opt, idx, prev, x, y) => (typeof res === 'string'
    ? L(key, x, y, res)
    : n(key, x, y, res, title, { kind: kind || (idx === 0 && !prev ? 'raw' : res.machine ? 'ours' : 'product'), ...(prev ? { from: [prev] } : {}), ...(opt || {}) }));
  const c = {
    nodes,
    add: (arr) => { nodes.push(...arr); },
    // trunk(steps, end): the line the cluster is for, on row 0
    trunk: (steps, end) => {
      steps.forEach(([key, res, title, kind, opt], idx) => {
        const nd = mk(key, res, title, kind, opt, idx, idx > 0 ? steps[idx - 1][0] : null, 2.5 * idx, 0);
        nodes.push(idx === steps.length - 1 && end && !res.machine ? { ...nd, end } : nd);
      });
    },
    // row(y, steps, end, x0): a line drawn beside the trunk that ends in a dest node
    row: (y, steps, end, x0 = 0) => {
      steps.forEach(([key, res, title, kind, opt], idx) => {
        const nd = mk(key, res, title, kind, opt, idx, idx > 0 ? steps[idx - 1][0] : null, x0 + 2.5 * idx, y);
        nodes.push(idx === steps.length - 1 ? { ...nd, kind: 'dest', end } : nd);
      });
    },
    // feed(target, steps, side, depth): a branch that ends at target; its i-th node from the end sits 2.5*i left of the target
    // and min(i, depth) rows above (side -1) or below (side +1) it
    feed: (target, steps, side, depth = 1) => {
      const t = get(target);
      const k = steps.length;
      steps.forEach(([key, res, title, kind, opt], idx) => {
        const i = k - idx;
        nodes.push(mk(key, res, title, kind, opt, idx, idx > 0 ? steps[idx - 1][0] : null, t.x - 2.5 * i, t.y + side * 2.5 * Math.min(i, depth)));
      });
      t.from.push(steps[k - 1][0]);
    },
    // spur(source, steps, side, depth, end): a branch that leaves source to the right and ends as a dest node
    spur: (source, steps, side, depth, end) => {
      const s = get(source);
      steps.forEach(([key, res, title, kind, opt], idx) => {
        const i = idx + 1;
        const nd = mk(key, res, title, kind, opt, idx, idx > 0 ? steps[idx - 1][0] : source, s.x + 2.5 * i, s.y + side * 2.5 * Math.min(i, depth));
        nodes.push(idx === steps.length - 1 ? { ...nd, kind: 'dest', end } : nd);
      });
    },
    // vlink(target, dy, key, ref): a link straight above or below target
    vlink: (target, dy, key, ref) => {
      const t = get(target);
      nodes.push(L(key, t.x, t.y + dy, ref));
      t.from.push(key);
    },
    get,
  };
  build(c);
  return { name, nodes };
}

const TOOL = mach('gtceu:mtj_sputter_cluster');
const FOUNDRY = mach('gtceu:photonic_foundry');
const MOCVD = mach('gtceu:mocvd_reactor');
const ZONE = mach('gtceu:zone_refining_tower');
const LEVITATE = mach('gtceu:levitation_melter');
const MAGNET = mach('gtceu:nitride_magnet_works');
const EBF = mach('gtceu:electron_beam_furnace');
const KILN = mach('gtceu:fluorspar_kiln');
const CRYSTAL = mach('gtceu:crystal_growth_furnace');
const STACKER = mach('gtceu:vdw_stacker');
const STRIP = mach('gtceu:hot_strip_mill');
const FACTORY = mach('gtceu:heavy_ion_cyclotron');
const CHEMLAB = mach('gtceu:superheavy_chemistry_lab');
const TUF = mach('gtceu:transuranium_facility');
const CALUTRON = mach('gtceu:calutron');
const RING = mach('gtceu:uxv_fusion_reactor');
const DIRECT = mach('gtceu:direct_energy_converter');
const QUENCH = mach('gtceu:plasma_quench_caster');
const CRYO = mach('gtceu:cryogenic_plant');
const MILL = mach('gtceu:pasta_phase_sorter');
const EXTRACTOR = mach('gtceu:pasta_extractor');
const SKIMMER = mach('gtceu:accretion_disk_skimmer');
const FILTER = mach('gtceu:plasma_mass_filter');
const FRC = mach('gtceu:frc_former');
const ASSEMBLER = mach('gtceu:ev_assembler');
const SPS = mach('gtceu:spark_plasma_sinterer');
const HOTCELL = mach('gtceu:hot_cell');

// the sputter-target lines: ingot or powder, additive powder, near-net blank, HIP blank, target
const tgtTail = (p, name, label) => [
  [`${p}_am`, I(`grindless:${name}_am_powder`), `${label} AM Powder`],
  [`${p}_nn`, I(`grindless:near_net_${name}_blank`), `Near Net ${label} Blank`],
  [`${p}_hip`, I(`grindless:${name}_hip_blank`), `${label} HIP Blank`],
  [`${p}_t`, I(`grindless:${name}_target`), `${label} Target`],
];
// the GGG substrate line, up to the wafer
const gggLine = (p) => [
  [`${p}_0`, I('grindless:ggg_charge_dust'), 'GGG Charge', 'raw'],
  [`${p}_1`, KILN, 'Fluorspar Kiln'],
  [`${p}_2`, I('gtceu:ggg_dust'), 'GGG'],
  [`${p}_3`, CRYSTAL, 'Crystal Growth Furnace'],
  [`${p}_4`, I('grindless:ggg_boule'), 'GGG Boule'],
  [`${p}_5`, I('grindless:ggg_slice'), 'GGG Slice'],
  [`${p}_6`, I('grindless:ggg_polished_slice'), 'GGG Polished Slice'],
  [`${p}_7`, I('grindless:ggg_wafer'), 'GGG Wafer'],
];

export default {
  file: 'pl_uxv',
  order: 12,
  title: 'UXV Lines',
  subtitle: 'The spintronic mainframe and its wafers, the sensor, superheavy III, the burning stages of the Mk6, its fields, pasta, the UXV parts, the power chips and Cassiopeia A.',
  icon: 'gtnn:spintronic_mainframe',
  focus: 'h_si28',
  bands: [['X1'], ['X2', 'X3'], ['X4', 'X5'], ['X6', 'X7'], ['X8', 'X9', 'X10']],
  clusters: {
    // X1: the spintronic mainframe. Trunk: silicon 28, the MRAM, racetrack and STNO wafers, the magnonic bus, the MESO logic and the die
    X1: cluster('The spintronic mainframe', (c) => {
      c.trunk([
        ['sidust', 'pl_mv:sidust'],
        ['s28', I('grindless:silicon_28_dust'), 'Silicon 28', 'product'],
        ['zone', ZONE, 'Zone Refining Tower'],
        ['ingot', I('grindless:si28_fz_ingot'), 'Si-28 FZ Ingot'],
        ['wafer', I('grindless:si28_fz_wafer'), 'Si-28 FZ Wafer'],
        ['h_si28', I('grindless:h_si28_wafer'), 'H Si-28 Wafer'],
        ['mocvd', MOCVD, 'MOCVD Reactor'],
        ['cmos', I('grindless:si28_cmos_wafer'), 'Si-28 CMOS Wafer'],
        ['fdry1', FOUNDRY, 'Photonic Foundry'],
        ['m1', I('grindless:si28_m1_wafer'), 'Si-28 Metal-1 Wafer'],
        ['tool1', TOOL, 'Spintronic Cluster Tool'],
        ['mram_stack', I('grindless:mram_stack_wafer'), 'MRAM Stack Wafer'],
        ['mram_anneal', I('grindless:annealed_mram_wafer'), 'Annealed MRAM Wafer'],
        ['mram_etch', I('grindless:etched_mram_wafer'), 'Etched MRAM Wafer'],
        ['fdry2', FOUNDRY, 'Photonic Foundry'],
        ['mram', I('grindless:mram_wafer'), 'MRAM Wafer'],
        ['tool2', TOOL, 'Spintronic Cluster Tool'],
        ['saf_track', I('grindless:saf_track_wafer'), 'SAF Track Wafer'],
        ['saf_anneal', I('grindless:annealed_saf_wafer'), 'Annealed SAF Wafer'],
        ['written', I('grindless:written_track_wafer'), 'Written Track Wafer'],
        ['patterned', I('grindless:patterned_track_wafer'), 'Patterned Track Wafer'],
        ['racetrack', I('grindless:racetrack_chip'), 'Racetrack Chip'],
        ['tool3', TOOL, 'Spintronic Cluster Tool'],
        ['stno_stack', I('grindless:stno_stack_wafer'), 'STNO Stack Wafer'],
        ['stno_def', I('grindless:stno_defined_wafer'), 'STNO Defined Wafer'],
        ['stno_mill', I('grindless:stno_milled_wafer'), 'STNO Milled Wafer'],
        ['stno_clean', I('grindless:stno_clean_wafer'), 'STNO Clean Wafer'],
        ['stno_plan', I('grindless:stno_planarised_wafer'), 'STNO Planarised Wafer'],
        ['stno_array', I('grindless:stno_array'), 'STNO Array'],
        ['bus', I('grindless:magnonic_bus'), 'Magnonic Bus'],
        ['me_spin', I('grindless:me_on_spin_wafer'), 'ME-on-Spin Wafer'],
        ['meso', I('grindless:meso_spin_wafer'), 'MESO Spin Wafer'],
        ['spin_wafer', I('grindless:spintronic_wafer'), 'Spintronic Wafer'],
        ['spin_die', I('grindless:spintronic_die'), 'Spintronic Die'],
        ['mainframe', I('gtnn:spintronic_mainframe'), 'Spintronic Mainframe'],
      ], 'the spintronic computers');
      // above: the Heusler, SAF, MTJ die, garnet and shielded interposer branches, deeper the further right they join
      c.feed('tool1', [
        ['l3_0', I('grindless:five_n_manganese'), '5N Manganese', 'raw'],
        ['l3_1', LEVITATE, 'Levitation Melter'],
        ['l3_2', I('grindless:heusler_cast_ingot'), 'Heusler Cast Ingot'],
        ['l3_3', MAGNET, 'Nitride Magnet Works'],
        ['l3_4', I('grindless:heusler_ingot'), 'Heusler Ingot'],
        ...tgtTail('l3', 'heusler', 'Heusler'),
      ], -1, 1);
      c.feed('tool2', [
        ['l4_0', I('gtceu:ruthenium_dust'), 'Ruthenium', 'raw'],
        ['l4_1', mach('gtceu:platinum_plant'), 'Platinum Plant'],
        ['l4_2', I('grindless:five_n_ruthenium'), '5N Ruthenium'],
        ['l4_3', I('grindless:ruthenium_am_powder'), 'Ruthenium AM Powder'],
        ['l4_4', I('grindless:near_net_saf_blank'), 'Near Net SAF Blank'],
        ['l4_5', I('grindless:saf_hip_blank'), 'SAF HIP Blank'],
        ['l4_6', I('grindless:saf_target_set'), 'SAF Target Set'],
      ], -1, 2);
      c.feed('racetrack', [
        ['d_h_si28', I('grindless:h_si28_wafer'), 'H Si-28 Wafer', 'raw'],
        ['d_tool', TOOL, 'Spintronic Cluster Tool'],
        ['d_stack', I('grindless:mtj_stack_wafer'), 'MTJ Stack Wafer'],
        ['d_anneal', I('grindless:annealed_mtj_wafer'), 'Annealed MTJ Wafer'],
        ['d_etch', I('grindless:etched_mtj_wafer'), 'Etched MTJ Wafer'],
        ['d_die', I('grindless:mtj_die'), 'MTJ Die'],
      ], -1, 3);
      c.feed('bus', [
        ...gggLine('l16'),
        ['l17_3', mach('gtceu:yig_lpe_furnace'), 'YIG LPE Furnace'],
        ['l17_4', I('grindless:yig_film_wafer'), 'YIG Film Wafer'],
        ['l17_5', I('grindless:yig_waveguide_wafer'), 'YIG Waveguide Wafer'],
      ], -1, 4);
      c.feed('mainframe', [
        ['l47_0', I('grindless:mu_metal_blend'), 'Mu-Metal Blend', 'raw'],
        ['l47_1', EBF, 'Electron Beam Furnace'],
        ['l47_2', I('grindless:mu_metal_ingot'), 'Mu-Metal Ingot'],
        ['l47_3', STRIP, 'Hot Strip Mill'],
        ['l47_4', I('grindless:mu_metal_hot_band'), 'Mu-Metal Hot Band'],
        ['l47_5', I('grindless:mu_metal_foil'), 'Mu-Metal Foil'],
        ['l47_6', I('grindless:annealed_mu_foil'), 'Annealed Mu Foil'],
        ['l47_7', I('grindless:mu_metal_shield_can'), 'Mu-Metal Shield Can'],
        ['l47_8', I('grindless:shielded_interposer'), 'Shielded Interposer'],
      ], -1, 5);
      // below: the ME switch and the SOT readout join the two vdW steps
      c.feed('me_spin', [
        ['l9_0', I('grindless:dysco3_charge_dust'), 'DyScO3 Charge', 'raw'],
        ['l9_1', KILN, 'Fluorspar Kiln'],
        ['l9_2', I('gtceu:dysco3_dust'), 'DyScO3'],
        ['l9_3', CRYSTAL, 'Crystal Growth Furnace'],
        ['l9_4', I('grindless:dysco3_boule'), 'DyScO3 Boule'],
        ['l9_5', I('grindless:dysco3_slice'), 'DyScO3 Slice'],
        ['l9_6', I('grindless:dysco3_polished_slice'), 'DyScO3 Polished Slice'],
        ['l9_7', I('grindless:dysco3_substrate'), 'DyScO3 Substrate'],
        ['me_tool', TOOL, 'Spintronic Cluster Tool'],
        ['me_elec', I('grindless:srruo3_electrode_wafer'), 'SrRuO3 Electrode Wafer'],
        ['l11_f', I('grindless:bfo_film_wafer'), 'BFO Film Wafer'],
        ['l11_c', I('grindless:cofe_me_wafer'), 'CoFe ME Wafer'],
        ['l11_m', I('grindless:me_switch_wafer'), 'ME Switch Wafer'],
      ], 1, 1);
      c.feed('meso', [
        ['l12_0', I('gtceu:boron_trioxide_dust'), 'Boron Trioxide', 'raw'],
        ['l12_1', mach('gtceu:boron_nitride_reactor'), 'Boron Nitride Reactor'],
        ['l12_2', I('grindless:hbn_dust'), 'hBN'],
        ['l12_3', mach('gtceu:megabar_press'), 'Megabar Press'],
        ['l12_4', I('grindless:raw_hbn_crystal'), 'Raw hBN Crystal'],
        ['l12_5', I('grindless:hbn_crystal'), 'hBN Crystal'],
        ['l15_1', STACKER, 'Van der Waals Stacker'],
        ['l15_2', I('grindless:hbn_flake'), 'hBN Flake'],
        ['l15_3', STACKER, 'Van der Waals Stacker'],
        ['l15_4', I('grindless:sot_heterostack'), 'SOT Heterostack'],
        ['l15_5', I('grindless:contacted_sot_stack'), 'Contacted SOT Stack'],
        ['l15_6', MAGNET, 'Nitride Magnet Works'],
        ['l15_7', I('grindless:sot_readout_stack'), 'SOT Readout Stack'],
      ], 1, 2);
      // the lines that end in a target, a flake or a tool, drawn beside the trunk
      c.row(10, [
        ['l1_0', I('grindless:five_n_cobalt'), '5N Cobalt', 'raw'],
        ['l1_1', LEVITATE, 'Levitation Melter'],
        ['l1_2', I('grindless:cofeb_ingot'), 'CoFeB Ingot'],
        ...tgtTail('l1', 'cofeb', 'CoFeB'),
      ], 'the Spintronic Cluster Tool');
      c.row(12.5, [
        ['l2_0', I('gtceu:magnesite_dust'), 'Magnesite', 'raw'],
        ['l2_1', mach('gtceu:extraction_cascade'), 'Extraction Cascade'],
        ['l2_2', I('grindless:magnesium_hydroxide_dust'), 'Magnesium Hydroxide'],
        ['l2_3', KILN, 'Fluorspar Kiln'],
        ['l2_4', I('grindless:five_n_magnesia_dust'), '5N Magnesia'],
        ['l2_5', I('grindless:mgo_am_powder'), 'MgO AM Powder'],
        ['l2_6', I('grindless:near_net_mgo_blank'), 'Near Net MgO Blank'],
        ['l2_7', I('grindless:mgo_hip_blank'), 'MgO HIP Blank'],
        ['l2_8', I('grindless:mgo_target'), 'MgO Target'],
      ], 'the Spintronic Cluster Tool');
      c.row(15, [
        ['l5_0', I('grindless:tantalite_fluoride_cake'), 'Tantalite Fluoride Cake', 'raw'],
        ['l5_1', mach('gtceu:extraction_cascade'), 'Extraction Cascade'],
        ['l5_2', I('grindless:k2taf7_dust'), 'K2TaF7'],
        ['l5_3', I('grindless:tantalum_powder'), 'Tantalum Powder'],
        ['l5_4', EBF, 'Electron Beam Furnace'],
        ['l5_5', I('grindless:six_n_tantalum'), '6N Tantalum'],
        ['l5_6', STRIP, 'Hot Strip Mill'],
        ['l5_7', I('grindless:ta_foil'), 'Ta Foil'],
        ['l5_8', I('grindless:ta_seed_target'), 'Ta Seed Target'],
      ], 'the Spintronic Cluster Tool');
      c.row(17.5, [
        ['l10_0', I('grindless:five_n_ruthenium'), '5N Ruthenium', 'raw'],
        ['l10_1', I('grindless:srruo3_charge_dust'), 'SrRuO3 Charge'],
        ['l10_2', KILN, 'Fluorspar Kiln'],
        ['l10_3', I('gtceu:srruo3_dust'), 'SrRuO3'],
        ...tgtTail('l10', 'srruo3', 'SrRuO3'),
      ], 'the Spintronic Cluster Tool');
      c.row(20, [
        ['l11_0', I('gtceu:la_bfo_dust'), 'La-BFO', 'raw'],
        ...tgtTail('l11', 'la_bfo', 'La-BFO'),
      ], 'the Spintronic Cluster Tool');
      c.row(22.5, [
        ['l13_0', I('gtceu:tellurium_dust'), 'Tellurium', 'raw'],
        ['l13_1', ZONE, 'Zone Refining Tower'],
        ['l13_2', I('grindless:seven_n_tellurium'), '7N Tellurium'],
        ['l13_3', I('grindless:wte2_raw_crystal'), 'WTe2 Raw Crystal'],
        ['l13_4', I('grindless:wte2_crystal'), 'WTe2 Crystal'],
        ['l13_5', I('grindless:wte2_flake'), 'WTe2 Flake'],
      ], 'the SOT heterostack');
      c.row(25, [
        ['l14_0', I('gtceu:germanium_dust'), 'Germanium', 'raw'],
        ['l14_1', ZONE, 'Zone Refining Tower'],
        ['l14_2', I('grindless:seven_n_germanium'), '7N Germanium'],
        ['l14_3', I('grindless:fgt_raw_crystal'), 'FGT Raw Crystal'],
        ['l14_4', I('grindless:fgt_crystal'), 'FGT Crystal'],
        ['l14_5', I('grindless:fgt_flake'), 'FGT Flake'],
      ], 'the SOT heterostack');
      c.row(27.5, [
        ['l41_a', F('gtceu:liquid_air'), 'Liquid Air', 'raw'],
        ['l41_b', CRYO, 'Cryogenic Plant'],
        ['l41_0', F('gtceu:krypton'), 'Krypton'],
        ['l41_m', mach('gtceu:ev_mixer'), 'Mixer'],
        ['l41_1', I('grindless:kr_f2_premix'), 'Kr-F2 Premix'],
        ['l41_r', mach('gtceu:ev_chemical_reactor'), 'Chemical Reactor'],
        ['l41_2', I('grindless:krf_discharge_tube'), 'KrF Discharge Tube'],
        ['l41_l', mach('gtceu:assembly_line'), 'Assembly Line'],
        ['l41_3', I('grindless:krf_excimer_laser'), 'KrF Excimer Laser'],
      ], 'the Spintronic Cluster Tool');
      c.row(30, [
        ['l42_0', I('gtceu:platinum_dust'), 'Platinum', 'raw'],
        ['l42_1', mach('gtceu:platinum_plant'), 'Platinum Plant'],
        ['l42_2', I('grindless:five_n_platinum'), '5N Platinum'],
        ['l42_3', STRIP, 'Hot Strip Mill'],
        ['l42_4', I('grindless:pt_sheet'), 'Pt Sheet'],
        ['l42_5', I('grindless:pt_crucible_shell'), 'Pt Crucible Shell'],
        ['l42_6', I('grindless:pt_lpe_crucible'), 'Pt LPE Crucible'],
      ], 'the YIG LPE furnace');
    }),

    // X2: the UXV sensor. Trunk: the SiN membrane to the gyro and the sensor; the MTJ die joins the gyro
    X2: cluster('The UXV sensor', (c) => {
      c.trunk([
        ['l18_0', I('grindless:sin_membrane'), 'SiN Membrane', 'raw'],
        ['l18_1', EBF, 'Electron Beam Furnace'],
        ['l18_2', I('grindless:nanoaperture_array'), 'Nanoaperture Array'],
        ['l18_3', mach('gtceu:shequid_works'), 'SHeQUID Works'],
        ['l18_4', I('grindless:weak_link_cell'), 'Weak Link Cell'],
        ['l18_5', I('grindless:shequid_gyro'), 'SHeQUID Gyro'],
        ['l18_6', I('gtceu:uxv_sensor'), 'UXV Sensor'],
      ], 'the UXV sensor');
      c.feed('l18_5', [
        ['l6_0', I('grindless:mtj_die'), 'MTJ Die', 'raw', { sub: 'From the spintronic mainframe line (X1)' }],
      ], -1, 1);
    }),

    // X3: superheavy III. Trunk: the Ti-50 charge and element 122 to census III; element 121 joins the census
    X3: cluster('Superheavy III', (c) => {
      c.trunk([
        ['l21_t0', I('gtceu:titanium_tetrachloride_ice_dust'), 'TiCl4 Ice', 'raw'],
        ['l21_t1', CALUTRON, 'Calutron'],
        ['l21_t2', I('gtceu:titanium_50_chloride_dust'), 'Ti-50 Chloride'],
        ['l21_t3', mach('gtceu:pyroprocessing_cell'), 'Pyroprocessing Cell'],
        ['l21_t4', I('gtceu:titanium_50_sponge_dust'), 'Ti-50 Sponge'],
        ['l21_t5', LEVITATE, 'Levitation Melter'],
        ['l21_t6', I('gtceu:titanium_50_dust'), 'Titanium 50'],
        ['l21_t7', ASSEMBLER, 'Assembler'],
        ['l21_t8', I('grindless:ti50_oven_charge'), 'Ti-50 Oven Charge'],
        ['l22_1', FACTORY, 'Superheavy Factory'],
        ['l22_2', F('gtceu:element_122_recoil_gas'), 'Element 122 Recoil Gas'],
        ['l22_3', FACTORY, 'Superheavy Factory'],
        ['l22_4', I('grindless:element_122_atoms'), 'Element 122 Atoms'],
        ['l22_5', CHEMLAB, 'Superheavy Chemistry Lab'],
        ['l22_6', I('grindless:element_122_recoil'), 'Element 122 Recoil'],
        ['l22_7', I('grindless:superheavy_census_iii'), 'Superheavy Census III'],
      ], 'the gate to OpV');
      c.feed('l22_7', [
        ['l21_s', I('grindless:es254_target'), 'Es-254 Target', 'raw'],
        ['l21_0', FACTORY, 'Superheavy Factory'],
        ['l21_1', F('gtceu:element_121_recoil_gas'), 'Element 121 Recoil Gas'],
        ['l21_2', FACTORY, 'Superheavy Factory'],
        ['l21_3', I('grindless:element_121_atoms'), 'Element 121 Atoms'],
        ['l21_5', CHEMLAB, 'Superheavy Chemistry Lab'],
        ['l21_4', I('grindless:element_121_recoil'), 'Element 121 Recoil'],
      ], -1, 1);
      c.row(7.5, [
        ['l19_0', F('gtceu:es_fm_liquor'), 'Es/Fm Liquor', 'raw'],
        ['l19_1', mach('gtceu:actinide_partitioning_plant'), 'Actinide Partitioning Plant'],
        ['l19_2', I('gtceu:fermium_dust'), 'Fermium'],
        ['l19_3', CALUTRON, 'Calutron'],
        ['l19_4', I('gtceu:fermium_257_dust'), 'Fermium 257'],
        ['l19_5', TUF, 'Transuranium Facility'],
        ['l19_6', I('grindless:fm257_plated_blank'), 'Fm-257 Plated Blank'],
        ['l19_7', SPS, 'Spark Plasma Sinterer'],
        ['l19_8', I('grindless:fm257_target'), 'Fm-257 Target'],
      ], 'element 122');
      c.row(10, [
        ['l20_0', I('grindless:flashed_target'), 'Flashed Target', 'raw'],
        ['l20_1', HOTCELL, 'Hot Cell'],
        ['l20_2', F('gtceu:es_fm_liquor'), 'Es/Fm Liquor'],
        ['l20_3', mach('gtceu:actinide_partitioning_plant'), 'Actinide Partitioning Plant'],
        ['l20_4', F('gtceu:es_254_solution'), 'Es-254 Solution'],
        ['l20_5', TUF, 'Transuranium Facility'],
        ['l20_6', I('gtceu:einsteinium_dust'), 'Einsteinium'],
        ['l20_7', I('grindless:es254_target'), 'Es-254 Target'],
      ], 'element 121');
      c.row(12.5, [
        ['l21_m0', I('grindless:polycarbonate_foil'), 'Polycarbonate Foil', 'raw'],
        ['l21_m1', FACTORY, 'Superheavy Factory'],
        ['l21_m2', I('grindless:ion_tracked_foil'), 'Ion-Tracked Foil'],
        ['l21_m3', mach('gtceu:ev_chemical_reactor'), 'Chemical Reactor'],
        ['l21_m4', I('grindless:etched_membrane'), 'Etched Membrane'],
      ], 'element 121');
    }),

    // X4: the burning stages of the Mk6. Trunk: helium burning to carbon burning; the oxygen stage leaves the helium ash
    X4: cluster('The burning stages', (c) => {
      c.trunk([
        ['l27_0', F('gtceu:stellar_helium_cut'), 'Stellar Helium Cut', 'raw'],
        ['l27_1', CRYO, 'Cryogenic Plant'],
        ['l27_2', F('gtceu:triple_alpha_fuel'), 'Triple Alpha Fuel'],
        ['l27_3', RING, 'Mk6 Fusion Ring'],
        ['l27_4', F('gtceu:helium_burning_ash_plasma'), 'Helium Burning Ash Plasma'],
        ['l27_5', DIRECT, 'Direct Energy Converter'],
        ['l27_6', F('gtceu:helium_burning_ash'), 'Helium Burning Ash'],
        ['l27_7', QUENCH, 'Plasma Quench Caster'],
        ['l27_8', I('gtceu:carbon_12_dust'), 'Carbon 12'],
        ['l28_3', EBF, 'Electron Beam Furnace'],
        ['l28_4', F('gtceu:carbon_burning_fuel'), 'Carbon Burning Fuel'],
        ['l28_5', RING, 'Mk6 Fusion Ring'],
        ['l28_6', F('gtceu:carbon_burning_ash_plasma'), 'Carbon Burning Ash Plasma'],
        ['l28_7', DIRECT, 'Direct Energy Converter'],
        ['l28_8', F('gtceu:carbon_burning_ash'), 'Carbon Burning Ash'],
      ], 'the plasma quench caster');
      c.spur('l27_6', [
        ['l29_q', QUENCH, 'Plasma Quench Caster'],
        ['l29_0', F('gtceu:oxygen_16'), 'Oxygen 16'],
        ['l29_1', CRYO, 'Cryogenic Plant'],
        ['l29_2', F('gtceu:oxygen_burning_fuel'), 'Oxygen Burning Fuel'],
        ['l29_3', RING, 'Mk6 Fusion Ring'],
        ['l29_4', F('gtceu:oxygen_burning_ash_plasma'), 'Oxygen Burning Ash Plasma'],
        ['l29_5', DIRECT, 'Direct Energy Converter'],
        ['l29_6', F('gtceu:oxygen_burning_ash'), 'Oxygen Burning Ash'],
        ['l29_7', QUENCH, 'Plasma Quench Caster'],
        ['l29_8', I('grindless:si28_ash'), 'Si-28 Ash'],
      ], 1, 1, 'silicon burning');
      c.row(7.5, [
        ['l26_0', F('gtceu:liquid_helium'), 'Liquid Helium', 'raw'],
        ['l26_1', mach('gtceu:stellar_elevator'), 'Stellar Elevator'],
        ['l26_2', F('gtceu:stellar_plasma'), 'Stellar Plasma'],
        ['l26_3', FILTER, 'Plasma Mass Filter'],
        ['l26_4', F('gtceu:stellar_cno_cut'), 'Stellar CNO Cut'],
        ['l26_5', RING, 'Mk6 Fusion Ring'],
        ['l26_6', F('gtceu:cno_ash_plasma'), 'CNO Ash Plasma'],
        ['l26_7', DIRECT, 'Direct Energy Converter'],
        ['l26_8', F('gtceu:stellar_cno_cut'), 'Stellar CNO Cut'],
      ], 'the Mk6 ring again');
    }),

    // X5: the fields. Trunk: the metallic hydrogen winding, the disk plasma and the FRC to the field generator
    X5: cluster('The field generator', (c) => {
      c.trunk([
        ['l31_0', I('gtceu:metallic_hydrogen_single_wire'), 'Metallic Hydrogen Wire', 'raw'],
        ['l31_1', mach('gtceu:naquadria_magnet_works'), 'Naquadria Magnet Works'],
        ['l30_0', I('grindless:mh_winding'), 'MH Winding'],
        ['l30_1', SKIMMER, 'Accretion Disk Skimmer'],
        ['l30_2', F('gtceu:disk_plasma'), 'Disk Plasma'],
        ['l30_3', FILTER, 'Plasma Mass Filter'],
        ['l30_4', F('gtceu:filtered_disk_plasma'), 'Filtered Disk Plasma'],
        ['l30_5', FRC, 'FRC Former'],
        ['l30_6', I('grindless:frc_cartridge'), 'FRC Cartridge'],
        ['l30_7', I('grindless:strand_coil'), 'Strand Coil'],
        ['l30_8', I('gtceu:uxv_field_generator'), 'UXV Field Generator'],
      ], 'the Mk6 ring');
      c.row(5, [
        ['l38_0', I('grindless:coated_w_wire'), 'Coated W Wire', 'raw'],
        ['l38_1', I('grindless:w_fibre_preform'), 'W Fibre Preform'],
        ['l38_2', mach('gtceu:cvi_furnace'), 'CVI Furnace'],
        ['l38_3', I('grindless:densified_w_preform'), 'Densified W Preform'],
        ['l38_4', LEVITATE, 'Levitation Melter'],
        ['l38_5', I('grindless:wf_rhea_billet'), 'WF-RHEA Billet'],
        ['l38_6', I('grindless:uxv_fusion_casing'), 'UXV Fusion Casing'],
      ], 'the Mk6 ring');
    }),

    // X6: pasta. Trunk: the neutron-star crust to the strand wire, the tape and the SMES cell; the cable leaves the wire
    X6: cluster('Pasta', (c) => {
      c.trunk([
        ['l32_0', I('grindless:vela_glitch_timing'), 'Vela Glitch Timing', 'raw'],
        ['l32_1', EXTRACTOR, 'Pasta Extractor'],
        ['l32_2', I('grindless:raw_pasta'), 'Raw Pasta'],
        ['l32_3', MILL, 'Pasta Mill'],
        ['l32_4', I('grindless:spaghetti_phase'), 'Spaghetti Phase'],
        ['l32_5', MILL, 'Pasta Mill'],
        ['l32_6', I('gtceu:pasta_strand_single_wire'), 'Pasta Strand Wire'],
        ['l39_5', mach('gtceu:coated_conductor_line'), 'Coated Conductor Line'],
        ['l39_6', I('grindless:strand_tape'), 'Strand Tape'],
        ['l39_7', MAGNET, 'Nitride Magnet Works'],
        ['l39_8', I('grindless:uxv_smes_cell'), 'UXV SMES Cell'],
      ], 'the wireless towers');
      c.spur('l32_6', [
        ['l32_7', I('gtceu:pasta_strand_single_cable'), 'Pasta Strand Cable'],
      ], 1, 1, 'UXV cables');
      c.row(5, [
        ['l33_0', I('grindless:neutronium_pellet'), 'Neutronium Pellet', 'raw'],
        ['l33_1', EXTRACTOR, 'Pasta Extractor'],
        ['l33_2', I('grindless:raw_pasta'), 'Raw Pasta'],
        ['l33_3', MILL, 'Pasta Mill'],
        ['l33_4', I('grindless:lasagna_phase'), 'Lasagna Phase'],
        ['l33_5', MILL, 'Pasta Mill'],
        ['l33_6', I('grindless:lasagna_plate'), 'Lasagna Plate'],
        ['l33_7', I('gtceu:uxv_machine_hull'), 'UXV Machine Hull'],
      ], 'the UXV machine hull');
      c.row(7.5, [
        ['l35_0', I('grindless:raw_pasta'), 'Raw Pasta', 'raw'],
        ['l35_1', MILL, 'Pasta Mill'],
        ['l35_2', I('grindless:lasagna_phase'), 'Lasagna Phase'],
        ['l35_3', MILL, 'Pasta Mill'],
        ['l35_4', I('grindless:lasagna_plate'), 'Lasagna Plate'],
        ['l35_5', STRIP, 'Hot Strip Mill'],
        ['l35_6', I('grindless:alip_duct'), 'ALIP Duct'],
        ['l35_7', I('gtceu:uxv_electric_pump'), 'UXV Electric Pump'],
      ], 'the UXV electric pump');
      c.add([
        L('x39_ccl', 0, 10, 'pl_luv:ccl'),
        L('x39_nmw', 2.5, 10, 'pl_uev:nmw'),
        L('x35_mill', 5, 10, 'pl_ev:mill'),
      ]);
    }),

    // X7: movers. Trunk: the tetrataenite stator to the motor; the piston, conveyor, gear and encoder lines run beside it
    X7: cluster('Movers and gears', (c) => {
      c.trunk([
        ['l34_0', I('gtceu:tetrataenite_dust'), 'Tetrataenite Dust', 'raw'],
        ['l34_1', I('gtceu:tetrataenite_ingot'), 'Tetrataenite Ingot'],
        ['l34_2', STRIP, 'Hot Strip Mill'],
        ['l34_3', I('grindless:tetrataenite_lamination'), 'Tetrataenite Lamination'],
        ['l34_4', mach('gtceu:hts_magnet_works'), 'HTS Magnet Works'],
        ['l34_5', I('grindless:strand_stator'), 'Strand Stator'],
        ['l34_6', I('gtceu:uxv_electric_motor'), 'UXV Electric Motor'],
      ], 'the UXV motor');
      c.spur('l34_1', [
        ['l49_2', STRIP, 'Hot Strip Mill'],
        ['l49_3', I('grindless:encoder_ring'), 'Encoder Ring'],
        ['l49_4', I('grindless:multipole_encoder_ring'), 'Multipole Encoder Ring'],
        ['l49_5', I('grindless:tmr_encoder'), 'TMR Encoder'],
      ], 1, 1, 'the UXV robot arm');
      c.row(7.5, [
        ['l36_0', I('grindless:terbium_oxide_dust'), 'Terbium Oxide', 'raw'],
        ['l36_1', mach('gtceu:europium_reductor'), 'Europium Reductor'],
        ['l36_2', I('gtceu:terbium_dust'), 'Terbium'],
        ['l36_3', LEVITATE, 'Levitation Melter'],
        ['l36_4', I('grindless:terfenol_d_ingot'), 'Terfenol-D Ingot'],
        ['l36_5', CRYSTAL, 'Crystal Growth Furnace'],
        ['l36_6', I('grindless:terfenol_d_rod'), 'Terfenol-D Rod'],
        ['l36_7', I('gtceu:uxv_electric_piston'), 'UXV Electric Piston'],
      ], 'the UXV piston');
      c.row(10, [
        ['l37_0', I('grindless:five_n_nickel'), '5N Nickel', 'raw'],
        ['l37_1', LEVITATE, 'Levitation Melter'],
        ['l37_2', I('grindless:ni_mn_ga_ingot'), 'Ni-Mn-Ga Ingot'],
        ['l37_3', CRYSTAL, 'Crystal Growth Furnace'],
        ['l37_4', I('grindless:ni_mn_ga_raw_crystal'), 'Ni-Mn-Ga Raw Crystal'],
        ['l37_5', I('grindless:ni_mn_ga_crystal'), 'Ni-Mn-Ga Crystal'],
        ['l37_6', I('gtceu:uxv_conveyor_module'), 'UXV Conveyor Module'],
      ], 'the UXV conveyor');
      c.row(12.5, [
        ['l45_0', I('grindless:niobium_powder'), 'Niobium Powder', 'raw'],
        ['l45_1', EBF, 'Electron Beam Furnace'],
        ['l45_2', I('grindless:six_n_niobium'), '6N Niobium'],
        ['l45_3', I('grindless:gum_metal_blend'), 'Gum Metal Blend'],
        ['l45_4', I('grindless:gum_metal_billet'), 'Gum Metal Billet'],
        ['l45_5', I('grindless:gum_metal_blank'), 'Gum Metal Blank'],
        ['l45_6', I('grindless:gum_metal_flexspline'), 'Gum Metal Flexspline'],
        ['l45_7', I('grindless:uxv_strain_wave_gear'), 'UXV Strain Wave Gear'],
      ], 'the UXV robot arm');
    }),

    // X8: the island of stability. Trunk: transcurium to the Cm-248 target and the MNT collider; the U-238 beam and the gas stopping cell join it
    X8: cluster('The island chart', (c) => {
      c.trunk([
        ['tcl', 'pl_uev:tcl'],
        ['l23_b', TUF, 'Transuranium Facility'],
        ['l23_0', I('grindless:californium_252'), 'Californium 252'],
        ['l23_1', HOTCELL, 'Hot Cell'],
        ['l23_2', I('gtceu:curium_248_dust'), 'Curium 248'],
        ['l23_3', TUF, 'Transuranium Facility'],
        ['l23_4', I('grindless:cm248_plated_blank'), 'Cm-248 Plated Blank'],
        ['l23_c', SPS, 'Spark Plasma Sinterer'],
        ['l23_5', I('grindless:cm248_target'), 'Cm-248 Target'],
        ['l24_0', mach('gtceu:mnt_collider'), 'MNT Collider'],
        ['l24_1', F('gtceu:mnt_product_gas'), 'MNT Product Gas'],
        ['l24_2', I('grindless:mnt_thermal_ions'), 'MNT Thermal Ions'],
        ['l24_3', I('grindless:island_nuclide'), 'Island Nuclide'],
        ['l24_4', I('grindless:island_chart'), 'Island Chart'],
      ], 'the gate to OpV');
      c.feed('l24_0', [
        ['l24_u0', F('gtceu:depleted_uranium_hexafluoride'), 'Depleted UF6', 'raw'],
        ['l24_u1', mach('gtceu:fuel_fabrication_plant'), 'Fuel Fabrication Plant'],
        ['l24_u2', I('grindless:u238_ion_source'), 'U-238 Ion Source'],
        ['l24_u3', mach('gtceu:synchrotron'), 'Synchrotron'],
        ['l24_u4', I('grindless:u238_beam_charge'), 'U-238 Beam Charge'],
      ], 1, 1);
      c.feed('l24_0', [
        ['l43_0', F('gtceu:helium'), 'Helium', 'raw'],
        ['l43_1', F('gtceu:liquid_helium'), 'Liquid Helium'],
        ['l43_2', CRYO, 'Cryogenic Plant'],
        ['l43_3', F('gtceu:he_6n'), '6N Helium'],
        ['l43_5', ASSEMBLER, 'Assembler'],
        ['l43_4', I('grindless:gas_stopping_cell'), 'Gas Stopping Cell'],
      ], -1, 1);
      c.row(7.5, [
        ['l43_r0', I('gtceu:silicon_wafer'), 'Silicon Wafer', 'raw'],
        ['l43_r1', FOUNDRY, 'Photonic Foundry'],
        ['l43_r2', I('grindless:rf_carpet_board'), 'RF Carpet Board'],
      ], 'the gas stopping cell');
    }),

    // X9: power chips. Trunk: the Ga2O3 die; the voltage coil line runs beside it, and the tool links lead to the machines it needs
    X9: cluster('Power chips', (c) => {
      c.trunk([
        ['l46_0', I('grindless:gallium_oxide_dust'), 'Gallium Oxide', 'raw'],
        ['l46_1', CRYSTAL, 'Crystal Growth Furnace'],
        ['l46_2', I('grindless:ga2o3_efg_plate'), 'Ga2O3 EFG Plate'],
        ['l46_3', I('grindless:ga2o3_slice'), 'Ga2O3 Slice'],
        ['l46_4', I('grindless:ga2o3_wafer'), 'Ga2O3 Wafer'],
        ['l46_5', MOCVD, 'MOCVD Reactor'],
        ['l46_6', I('grindless:ga2o3_epi_wafer'), 'Ga2O3 Epi Wafer'],
        ['l46_7', I('grindless:ga2o3_gated_wafer'), 'Ga2O3 Gated Wafer'],
        ['l46_8', I('grindless:ga2o3_power_die'), 'Ga2O3 Power Die'],
      ], 'the UXV machine hull');
      c.row(5, [
        ['l48_0', I('grindless:finemet_charge_dust'), 'Finemet Charge', 'raw'],
        ['l48_1', LEVITATE, 'Levitation Melter'],
        ['l48_2', F('gtceu:finemet_melt'), 'Finemet Melt'],
        ['l48_3', QUENCH, 'Plasma Quench Caster'],
        ['l48_4', I('grindless:finemet_ribbon'), 'Finemet Ribbon'],
        ['l48_5', I('grindless:finemet_toroid'), 'Finemet Toroid'],
        ['l48_6', I('grindless:finemet_core'), 'Finemet Core'],
        ['l48_7', I('grindless:uxv_voltage_coil'), 'UXV Voltage Coil'],
      ], 'the UXV voltage coil');
      c.add([
        L('x0', 0, 7.5, 'pl_uhv:cgf'),
        L('x1', 2.5, 7.5, 'pl_uev:ebf'),
        L('x2', 5, 7.5, 'pl_uv:mocvd'),
        L('x3', 7.5, 7.5, 'pl_uhv:pf'),
        L('x4', 10, 7.5, 'pl_uhv:vo'),
      ]);
    }),

    // X10: Cassiopeia A. Trunk: the ejecta knot to the gamma laser and the emitter; the whipple shield line runs beside it
    X10: cluster('Cassiopeia A', (c) => {
      c.trunk([
        ['l25_0', I('grindless:ejecta_knot_dust'), 'Ejecta Knot Dust', 'raw'],
        ['l25_1', I('grindless:ejecta_ti_fraction_dust'), 'Ejecta Ti Fraction'],
        ['l25_2', CALUTRON, 'Calutron'],
        ['l25_3', I('gtceu:titanium_44_dust'), 'Titanium 44'],
        ['l25_4', I('grindless:ti44_core'), 'Ti-44 Core'],
        ['l25_5', mach('gtceu:annihilation_laser_works'), 'Annihilation Laser Works'],
        ['l25_6', I('grindless:moderated_ps_cell'), 'Moderated Ps Cell'],
        ['l25_7', I('grindless:gamma_laser_module'), 'Gamma Laser Module'],
        ['l25_8', I('gtceu:uxv_emitter'), 'UXV Emitter'],
      ], 'the Cassiopeia A hold');
      c.row(5, [
        ['l40_0', F('gtceu:methane'), 'Methane', 'raw'],
        ['l40_1', mach('gtceu:methane_pyrolyser'), 'Methane Pyrolyser'],
        ['l40_2', I('grindless:cnt_sock'), 'CNT Sock'],
        ['l40_3', I('grindless:cnt_ribbon'), 'CNT Ribbon'],
        ['l40_4', I('grindless:cnt_densified_yarn'), 'CNT Densified Yarn'],
        ['l40_5', mach('gtceu:tether_ribbon_works'), 'Tether Ribbon Works'],
        ['l40_6', I('grindless:cnt_bumper_weave'), 'CNT Bumper Weave'],
        ['l40_7', I('grindless:cnt_whipple_shield'), 'CNT Whipple Shield'],
      ], 'the Cassiopeia A hold');
    }),
  },
};
