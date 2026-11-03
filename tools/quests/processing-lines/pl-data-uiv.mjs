// pl_uiv: the UIV lines, drawn as ten clusters I1-I10. Positions are relative to each cluster (pl-model.mjs places the clusters).
// Every UIV package has landed, so nothing is gated. Arrows are checked against a recipe dump by pl-check.mjs (integrator).
// Each cluster has one trunk (the line the era is for); the lines that feed it are branches that fan in from above and below,
// and a branch that serves another line or era ends in a `dest` node. Every arrow follows a recipe of the dump.
// Lines without a chain of four steps in the recipes (the cable seal, the polarised ices, the C-12 spreader seed, the neon cone) are not drawn.
import { I, L, M, n } from './pl-lib.mjs';

// a step is [key, resource, title, kind?, options?]: the first step is raw, machines are 'ours', the rest products; a step whose
// resource is a string is a link to another chart (it can only be a first step)
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
const dest = (nodes, end) => nodes.map((nd, i) => (i === nodes.length - 1 ? { ...nd, kind: 'dest', end } : nd));
const mach = (id) => M(id);

// cluster(build): build(c) lays nodes with c.add(nodes), c.feed(...), c.spur(...) and c.vlink(...)
function cluster(name, build) {
  const nodes = [];
  const get = (key) => nodes.find((nd) => nd.key === key);
  const mk = (key, res, title, kind, opt, idx, prev, x, y) => (typeof res === 'string'
    ? L(key, x, y, res)
    : n(key, x, y, res, title, { kind: kind || (idx === 0 && !prev ? 'raw' : res.machine ? 'ours' : 'product'), ...(prev ? { from: [prev] } : {}), ...(opt || {}) }));
  const c = {
    nodes,
    add: (arr) => { nodes.push(...arr); },
    // feed(target, steps, side, depth): a branch that ends at target; its i-th node from the end sits 2.5*i left of the target
    // and min(i, depth) rows above (side -1) or below (side +1) it. depth 0 is a straight run.
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
        const last = idx === steps.length - 1;
        const nd = mk(key, res, title, kind, opt, idx, idx > 0 ? steps[idx - 1][0] : source, s.x + 2.5 * i, s.y + side * 2.5 * Math.min(i, depth));
        nodes.push(last ? { ...nd, kind: 'dest', end } : nd);
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

const HALL = mach('gtceu:photonic_integration_hall');
const FOUNDRY = mach('gtceu:photonic_foundry');
const MBE = mach('gtceu:mbe_reactor');
const FEMTO = mach('gtceu:femtosecond_writer');
const FIBRE = mach('gtceu:fibre_draw_tower');
const CRYSTAL = mach('gtceu:crystal_growth_furnace');
const HOLE = mach('gtceu:spectral_hole_burner');
const IMPLANT = mach('gtceu:ion_implanter');
const TFLN = mach('gtceu:tfln_fab');
const STM = mach('gtceu:stm_lithography_cell');
const CRYO = mach('gtceu:millikelvin_cryostat_works');
const SPS = mach('gtceu:spark_plasma_sinterer');
const SCANNER = mach('gtceu:beuv_scanner');
const PRINTER = mach('gtceu:powder_bed_printer');
const LEVITATE = mach('gtceu:levitation_melter');
const MAGNET = mach('gtceu:nitride_magnet_works');
const PRESS = mach('gtceu:megabar_press');
const FACTORY = mach('gtceu:heavy_ion_cyclotron');
const PS_LAB = mach('gtceu:positronium_condensate_lab');

export default {
  file: 'pl_uiv',
  order: 11,
  title: 'UIV Lines',
  subtitle: 'The optical mainframe and the light it runs on, the heaviest atoms and the hard parts, neutron star matter, positronium, the Matrioshka computer, and the fuel and the heat of the ring.',
  icon: 'gtceu:matrioshka_computer',
  focus: 'h1',
  bands: [['I1', 'I2'], ['I3', 'I4'], ['I5', 'I6'], ['I7', 'I8', 'I9', 'I10']],
  clusters: {
    // I1: the optical mainframe. Trunk: the photonic integration hall, four times; the BEUV, memory, microcomb and crossbar lines join it
    I1: cluster('The optical mainframe', (c) => {
      c.add([
        L('qpc', 0, 0, 'pl_uev:qpc'),
        n('h1', 2.5, 0, HALL, 'Photonic Integration Hall', { kind: 'ours', from: ['qpc'] }),
        n('cm', 5, 0, I('grindless:photonic_compute_module'), 'Photonic Compute Module', { from: ['h1'] }),
        n('h2', 7.5, 0, HALL, 'Photonic Integration Hall', { kind: 'ours', from: ['cm'] }),
        n('tc', 10, 0, I('grindless:photonic_tensor_core'), 'Photonic Tensor Core', { from: ['h2'] }),
        n('h3', 12.5, 0, HALL, 'Photonic Integration Hall', { kind: 'ours', from: ['tc'] }),
        n('cft', 15, 0, I('grindless:comb_fed_tensor_core'), 'Comb-Fed Tensor Core', { from: ['h3'] }),
        n('h4', 17.5, 0, HALL, 'Photonic Integration Hall', { kind: 'ours', from: ['cft'] }),
        n('om', 20, 0, I('gtnn:optical_mainframe'), 'Optical Mainframe', { from: ['h4'], end: 'the stored proof' }),
      ]);
      // the crossbar on its interposer, with the interposer glass joining it
      c.feed('h1', [
        ['l17_0', I('grindless:implanted_ln_wafer'), 'Implanted LN Wafer'],
        ['l17_1', FOUNDRY, 'Photonic Foundry'],
        ['l17_2', I('grindless:lnoi_wafer'), 'LNOI Wafer'],
        ['l17_3', FOUNDRY, 'Photonic Foundry'],
        ['l17_4', I('grindless:pcm_photonic_die'), 'PCM Photonic Die'],
        ['l17_5', FOUNDRY, 'Photonic Foundry'],
        ['l17_6', I('grindless:pcm_crossbar'), 'PCM Crossbar'],
        ['coi', I('grindless:crossbar_on_interposer'), 'Crossbar On Interposer'],
      ], 1, 1);
      c.feed('coi', [
        ['l12_0', I('gtceu:silicon_dust'), 'Silicon'],
        ['l12_1', I('gtca:silicon_tetrachloride_dust'), 'Silicon Tetrachloride'],
        ['l12_2', I('grindless:ule_soot'), 'Ule Soot'],
        ['l12_3', I('grindless:ule_boule'), 'Ule Boule'],
        ['l12_4', FEMTO, 'Femtosecond Writer'],
        ['l12_5', I('grindless:written_interposer_blank'), 'Written Interposer Blank'],
        ['l12_6', I('grindless:etched_interposer_blank'), 'Etched Interposer Blank'],
        ['l12_7', FOUNDRY, 'Photonic Foundry'],
        ['l12_8', I('grindless:glass_interposer'), 'Glass Interposer'],
      ], -1, 1);
      // the BEUV driver ASIC, with the mirror and the UHV comb joining it
      c.feed('h2', [
        ['b13_hfo', 'pl_uev:hfo'],
        ['b13_0', I('grindless:hfo2_resist_wafer'), 'Hfo2 Resist Wafer'],
        ['b13_1', SCANNER, 'BEUV Scanner'],
        ['b13_2', I('grindless:fouled_beuv_mirror'), 'Fouled BEUV Mirror'],
        ['b13_3', SCANNER, 'BEUV Scanner'],
        ['b13_4', I('gtceu:terbium_dust'), 'Terbium'],
        ['b13_5', I('grindless:tb_droplet_target'), 'TB Droplet Target'],
        ['b13_6', SCANNER, 'BEUV Scanner'],
        ['b13_7', I('grindless:beuv_exposed_wafer'), 'BEUV Exposed Wafer'],
        ['b13_8', SCANNER, 'BEUV Scanner'],
        ['b13_9', I('grindless:beuv_driver_asic'), 'BEUV Driver ASIC'],
      ], -1, 2);
      c.vlink('b13_9', -2.5, 'b13_comb', 'pl_uhv:comb');
      c.feed('b13_6', [
        ['l14_0', I('gtceu:boron_carbide_dust'), 'Boron Carbide'],
        ['l14_1', SPS, 'Spark Plasma Sinterer'],
        ['l14_2', I('grindless:b4c_target'), 'B4C Target'],
        ['l14_3', MBE, 'MBE Reactor'],
        ['l14_4', I('grindless:la_b4c_multilayer'), 'La/B4C Multilayer'],
        ['l14_5', I('grindless:lan_barrier_mirror'), 'LaN Barrier Mirror'],
        ['l14_6', I('grindless:beuv_mirror'), 'BEUV Mirror'],
      ], 1, 1);
      // the microcomb
      c.feed('h3', [
        ['l18_0', I('grindless:fz_silicon_boule'), 'FZ Silicon Boule'],
        ['l18_1', I('grindless:fz_silicon_wafer'), 'FZ Silicon Wafer'],
        ['l18_2', I('grindless:oxidised_wafer'), 'Oxidised Wafer'],
        ['l18_3', mach('gtceu:synchrotron'), 'Synchrotron'],
        ['l18_4', I('grindless:trenched_oxide_wafer'), 'Trenched Oxide Wafer'],
        ['l18_5', I('grindless:damascene_sin_wafer'), 'Damascene Sin Wafer'],
        ['l18_6', FOUNDRY, 'Photonic Foundry'],
        ['l18_7', I('grindless:annealed_damascene_ring'), 'Annealed Damascene Ring'],
        ['l18_8', TFLN, 'Tfln Fab'],
        ['l18_9', I('grindless:eo_microcomb'), 'EO Microcomb'],
      ], -1, 3);
      // the six-hour memory, the P:Si processor with its cryostat module, and the optical assembly of E1
      c.feed('h4', [
        ['l15_0', I('gtceu:yttrium_dust'), 'Yttrium'],
        ['l15_1', CRYSTAL, 'Crystal Growth Furnace'],
        ['l15_2', I('grindless:eu151_yso_boule'), 'Eu-151 YSO Boule'],
        ['l15_3', I('grindless:eu151_yso_slab'), 'Eu-151 YSO Slab'],
        ['l15_4', HOLE, 'Spectral Hole Burner'],
        ['l15_5', I('grindless:six_hour_memory_slab'), 'Six Hour Memory Slab'],
        ['l15_6', I('grindless:six_hour_memory'), 'Six Hour Memory'],
      ], -1, 4);
      c.feed('h4', [
        ['l11_0', I('grindless:si28_soi_wafer'), 'Si-28 Soi Wafer'],
        ['l11_1', STM, 'Stm Lithography Cell'],
        ['l11_2', I('grindless:h_terminated_wafer'), 'H Terminated Wafer'],
        ['l11_3', STM, 'Stm Lithography Cell'],
        ['l11_4', I('grindless:stm_patterned_wafer'), 'Stm Patterned Wafer'],
        ['l11_5', STM, 'Stm Lithography Cell'],
        ['l11_6', I('grindless:ph3_dosed_wafer'), 'Ph3 Dosed Wafer'],
        ['l11_7', MBE, 'MBE Reactor'],
        ['l11_8', I('grindless:p_si_die'), 'P SI Die'],
        ['l11_9', CRYO, 'Millikelvin Cryostat Works'],
        ['l11_10', I('grindless:p_si_processor'), 'P SI Processor'],
      ], 1, 2);
      c.feed('l11_9', [
        ['l42_0', I('gtceu:praseodymium_oxide_dust'), 'Praseodymium Oxide'],
        ['l42_1', mach('gtceu:electric_blast_furnace'), 'Electric Blast Furnace'],
        ['l42_2', I('gtceu:praseodymium_dust'), 'Praseodymium'],
        ['l42_3', LEVITATE, 'Levitation Melter'],
        ['l42_4', I('gtceu:prni5_dust'), 'Prni5'],
        ['l42_5', CRYO, 'Millikelvin Cryostat Works'],
        ['l42_6', I('grindless:nuclear_stage'), 'Nuclear Stage'],
        ['l42_7', CRYO, 'Millikelvin Cryostat Works'],
        ['l42_8', I('grindless:mk_cryostat_module'), 'MK Cryostat Module'],
      ], 1, 1);
      c.vlink('h4', -2.5, 'oa', 'pl_uev:oa');
      // the three memories and fibres of the pulsar repeater, each a branch to the repeater of E1
      c.add(dest(chain(15, [
        ['l10_0', I('grindless:lithium_niobate_boule'), 'Lithium Niobate Boule'],
        ['l10_1', I('grindless:lithium_niobate_wafer'), 'Lithium Niobate Wafer'],
        ['l10_2', IMPLANT, 'Ion Implanter'],
        ['l10_3', I('grindless:implanted_ln_wafer'), 'Implanted LN Wafer'],
        ['l10_4', FOUNDRY, 'Photonic Foundry'],
        ['l10_5', I('grindless:lnoi_wafer'), 'LNOI Wafer'],
        ['l10_6', TFLN, 'Tfln Fab'],
        ['l10_7', I('grindless:ln_on_sin_wafer'), 'LN On Sin Wafer'],
        ['l10_8', I('grindless:ln_on_sin_thinned'), 'LN On Sin Thinned'],
        ['l10_9', FOUNDRY, 'Photonic Foundry'],
        ['l10_10', I('grindless:eo_transceiver'), 'EO Transceiver'],
      ]), 'the pulsar repeater'));
      c.add(dest(chain(17.5, [
        ['l16_0', I('gtceu:yttrium_dust'), 'Yttrium'],
        ['l16_1', CRYSTAL, 'Crystal Growth Furnace'],
        ['l16_2', I('grindless:er_yso_boule'), 'ER YSO Boule'],
        ['l16_3', I('grindless:er_yso_slab'), 'ER YSO Slab'],
        ['l16_4', HOLE, 'Spectral Hole Burner'],
        ['l16_5', I('grindless:telecom_memory_slab'), 'Telecom Memory Slab'],
        ['l16_6', FIBRE, 'Fibre Draw Tower'],
        ['l16_7', I('grindless:telecom_memory'), 'Telecom Memory'],
      ]), 'the pulsar repeater'));
      c.add(dest(chain(20, [
        ['l44_0', I('gtceu:silicon_dust'), 'Silicon'],
        ['l44_1', I('gtca:silicon_tetrachloride_dust'), 'Silicon Tetrachloride'],
        ['l44_2', FIBRE, 'Fibre Draw Tower'],
        ['l44_3', I('grindless:er_preform'), 'ER Preform'],
        ['l44_4', I('grindless:er_fibre'), 'ER Fibre'],
        ['l44_5', I('grindless:er_fibre_coil'), 'ER Fibre Coil'],
        ['l44_6', I('grindless:pumped_edfa'), 'Pumped EDFA'],
      ]), 'the pulsar repeater'));
    }),
    // I2: the heaviest atoms. Trunk: element 120; element 119 leaves it after the etched membrane
    I2: cluster('The heaviest atoms', (c) => {
      c.add(chain(0, [
        ['l9_0', I('gtceu:polytetrafluoroethylene_foil'), 'Polytetrafluoroethylene Foil'],
        ['l9_1', I('grindless:polycarbonate_foil'), 'Polycarbonate Foil'],
        ['l9_2', FACTORY, 'Superheavy Factory'],
        ['l9_3', I('grindless:ion_tracked_foil'), 'Ion Tracked Foil'],
        ['l9_4', I('grindless:etched_membrane'), 'Etched Membrane'],
        ['l9_5', FACTORY, 'Superheavy Factory'],
        ['l9_6', I('grindless:element_120_recoil'), 'Element 120 Recoil'],
      ], 'the superheavy census'));
      c.vlink('l9_3', -2.5, 'x9_cav', 'pl_uev:nsc');
      c.vlink('l9_3', 2.5, 'x9_cf', 'pl_uhv:cf');
      c.spur('l9_4', [
        ['l32_5', FACTORY, 'Superheavy Factory'],
        ['l32_6', I('grindless:element_119_recoil'), 'Element 119 Recoil'],
      ], 1, 1, 'the superheavy census');
    }),
    // I3: the Mk5 fusion casing. Trunk: the first-wall tile line; the divertor joins the casing, the RHEA ingot joins the billet
    I3: cluster('The UIV fusion casing', (c) => {
      c.add(chain(0, [
        ['l7_0', I('grindless:coated_w_wire'), 'Coated W Wire'],
        ['l7_1', I('grindless:w_fibre_preform'), 'W Fibre Preform'],
        ['l7_2', mach('gtceu:cvi_furnace'), 'Cvi Furnace'],
        ['l7_3', I('grindless:densified_w_preform'), 'Densified W Preform'],
        ['l7_4', LEVITATE, 'Levitation Melter'],
        ['l7_5', I('grindless:wf_rhea_billet'), 'Wf RHEA Billet'],
        ['l7_6', mach('gtceu:plasma_quench_caster'), 'Plasma Quench Caster'],
        ['l7_7', I('grindless:plasma_sprayed_tile'), 'Plasma Sprayed Tile'],
        ['l7_8', I('grindless:first_wall_tile'), 'First Wall Tile'],
        ['l7_9', I('grindless:li_sn_armoured_tile'), 'LI Sn Armoured Tile'],
        ['l7_10', I('grindless:uiv_fusion_casing'), 'UIV Fusion Casing'],
      ], 'the Mk5 ring'));
      c.feed('l7_10', [
        ['l29_0', I('grindless:rhea_am_powder'), 'RHEA Am Powder'],
        ['l29_1', PRINTER, 'Powder Bed Printer'],
        ['l29_2', I('grindless:near_net_w_mesh'), 'Near Net W Mesh'],
        ['l29_3', PRINTER, 'Powder Bed Printer'],
        ['l29_4', I('grindless:w_mesh'), 'W Mesh'],
        ['l29_5', I('grindless:cps_wetted_mesh'), 'CPS Wetted Mesh'],
        ['l29_6', I('grindless:divertor_cassette'), 'Divertor Cassette'],
        ['l29_7', I('grindless:divertor'), 'Divertor'],
      ], 1, 1);
      c.feed('l7_4', [
        ['l5_0', I('grindless:tantalite_fluoride_cake'), 'Tantalite Fluoride Cake'],
        ['l5_1', mach('gtceu:extraction_cascade'), 'Extraction Cascade'],
        ['l5_2', I('grindless:niobium_oxyfluoride_dust'), 'Niobium Oxyfluoride'],
        ['l5_3', I('grindless:niobium_powder'), 'Niobium Powder'],
        ['l5_4', mach('gtceu:electron_beam_furnace'), 'Electron Beam Furnace'],
        ['l5_5', I('grindless:nb_ta_button'), 'NB TA Button'],
        ['l5_6', LEVITATE, 'Levitation Melter'],
        ['l5_7', I('gtceu:rhea_ingot'), 'RHEA Ingot'],
      ], -1, 2);
      c.spur('l5_7', [
        ['l2_1', I('grindless:rhea_slab'), 'RHEA Slab'],
        ['l2_2', mach('gtceu:hot_strip_mill'), 'Hot Strip Mill'],
        ['l2_3', I('gtceu:rhea_plate'), 'RHEA Plate'],
        ['l2_4', I('grindless:rhea_former'), 'RHEA Former'],
        ['l2_5', I('grindless:wound_rhea_former'), 'Wound RHEA Former'],
        ['l2_6', I('grindless:impregnated_mh_coil'), 'Impregnated MH Coil'],
        ['l2_7', I('grindless:metallic_hydrogen_coil_block'), 'Metallic Hydrogen Coil Block'],
      ], -1, 2, 'the Mk5 ring');
      c.spur('l29_0', [
        ['l6_1', PRINTER, 'Powder Bed Printer'],
        ['l6_2', I('grindless:near_net_rhea_impeller'), 'Near Net RHEA Impeller'],
        ['l6_3', PRINTER, 'Powder Bed Printer'],
        ['l6_4', I('grindless:printed_rhea_impeller'), 'Printed RHEA Impeller'],
        ['l6_5', PRESS, 'Megabar Press'],
        ['l6_6', I('grindless:dense_rhea_impeller'), 'Dense RHEA Impeller'],
        ['l6_7', I('grindless:machined_rhea_impeller'), 'Machined RHEA Impeller'],
        ['l6_8', I('grindless:balanced_rhea_impeller'), 'Balanced RHEA Impeller'],
      ], 1, 2, 'the UIV pump');
    }),
    // I4: neutron star matter. Trunk: the neutronium pellet; the kilonova ash and the crust tether are lines of their own
    I4: cluster('Neutron star matter', (c) => {
      c.add(chain(0, [
        ['l30_0', I('gtceu:glass_plate'), 'Glass Plate'],
        ['l30_1', MBE, 'MBE Reactor'],
        ['l30_2', I('grindless:ni58_ti_multilayer'), 'Ni-58 TI Multilayer'],
        ['l30_3', I('grindless:neutron_supermirror'), 'Neutron Supermirror'],
        ['l30_4', I('grindless:neutron_guide'), 'Neutron Guide'],
        ['l30_5', I('grindless:cage_part'), 'Cage Part'],
        ['l30_6', mach('gtceu:neutronium_cage'), 'Neutronium Cage'],
        ['l30_7', I('grindless:neutronium_pellet'), 'Neutronium Pellet'],
      ], 'the UIV field generator'));
      c.add(dest(chain(5, [
        ['l31_0', I('gtceu:lead_foil'), 'Lead Foil'],
        ['l31_1', I('grindless:lead_polymer_liner'), 'Lead Polymer Liner'],
        ['l31_2', I('grindless:sealed_capsule'), 'Sealed Capsule'],
        ['l31_3', I('grindless:kilonova_capsule'), 'Kilonova Capsule'],
        ['l31_4', mach('gtceu:decay_heat_vault'), 'Decay Heat Vault'],
        ['l31_5', I('grindless:aged_kilonova_capsule'), 'Aged Kilonova Capsule'],
        ['l31_6', mach('gtceu:decay_heat_vault'), 'Decay Heat Vault'],
        ['l31_7', I('grindless:r_process_ash'), 'R Process Ash'],
      ]), 'the decay heat vault'));
      c.add(dest(chain(7.5, [
        ['l33_0', I('grindless:worn_crust_lift_tether'), 'Worn Crust Lift Tether'],
        ['l33_1', mach('gtceu:tether_ribbon_works'), 'Tether Ribbon Works'],
        ['l33_2', I('grindless:carbon_nanotube_yarn'), 'Carbon Nanotube Yarn'],
        ['l33_3', mach('gtceu:boron_nitride_reactor'), 'Boron Nitride Reactor'],
        ['l33_4', I('grindless:bn_coated_cnt_yarn'), 'Bn Coated Cnt Yarn'],
        ['l33_5', I('grindless:mh_laminated_yarn'), 'MH Laminated Yarn'],
        ['l33_6', I('grindless:braided_mh_tether'), 'Braided MH Tether'],
        ['l33_7', mach('gtceu:tether_ribbon_works'), 'Tether Ribbon Works'],
        ['l33_8', I('grindless:mh_tether'), 'MH Tether'],
        ['l33_9', I('grindless:crust_lift_tether'), 'Crust Lift Tether'],
      ]), 'the crust lift'));
    }),
    // I5: positronium. Trunk: the gamma laser cavity; the cooling laser and the Bragg mirror join it
    I5: cluster('Positronium and the gamma laser', (c) => {
      c.add(chain(0, [
        ['l34_0', I('grindless:cooled_positron_bunch'), 'Cooled Positron Bunch'],
        ['l34_1', PS_LAB, 'Positronium Condensate Lab'],
        ['l34_2', I('grindless:ps_in_aerogel'), 'PS In Aerogel'],
        ['l34_3', PS_LAB, 'Positronium Condensate Lab'],
        ['l34_4', I('grindless:laser_cooled_ps'), 'Laser Cooled PS'],
        ['l34_5', mach('gtceu:antimatter_trap'), 'Antimatter Trap'],
        ['l34_6', I('grindless:ps_bec'), 'PS Bec'],
        ['l34_7', PS_LAB, 'Positronium Condensate Lab'],
        ['l34_8', I('grindless:gamma_laser_cavity'), 'Gamma Laser Cavity'],
      ], 'the UIV emitter'));
      c.feed('l34_4', [
        ['l36_0', I('grindless:lithium_niobate_wafer'), 'Lithium Niobate Wafer'],
        ['l36_1', IMPLANT, 'Ion Implanter'],
        ['l36_2', I('grindless:implanted_ln_wafer'), 'Implanted LN Wafer'],
        ['l36_3', FOUNDRY, 'Photonic Foundry'],
        ['l36_4', I('grindless:lnoi_wafer'), 'LNOI Wafer'],
        ['l36_5', TFLN, 'Tfln Fab'],
        ['l36_6', I('grindless:poled_lnoi_wafer'), 'Poled LNOI Wafer'],
        ['l36_7', FOUNDRY, 'Photonic Foundry'],
        ['l36_8', I('grindless:ppln_waveguide'), 'PPLN Waveguide'],
        ['l36_9', I('grindless:shg_486_stage'), 'Shg 486 Stage'],
        ['l36_10', I('grindless:ps_cooling_laser'), 'PS Cooling Laser'],
      ], -1, 2);
      c.feed('l34_8', [
        ['l38_0', I('grindless:c12_cvd_plate'), 'C-12 CVD Plate'],
        ['l38_1', PRESS, 'Megabar Press'],
        ['l38_2', I('grindless:c12_hpht_plate'), 'C-12 HPHT Plate'],
        ['l38_3', I('grindless:c12_004_plate'), 'C-12 004 Plate'],
        ['l38_4', I('grindless:c12_ion_milled_plate'), 'C-12 Ion Milled Plate'],
        ['l38_5', I('grindless:gamma_bragg_mirror'), 'Gamma Bragg Mirror'],
      ], 1, 2);
      c.vlink('l38_5', 2.5, 'x38_mass', 'pl_luv:mass');
    }),
    // I6: the Matrioshka computer. Trunk: the TPV shell, the selective emitter joins its tile; the logic tiles, the crystal and the radiator are branches to the computer
    I6: cluster('The Matrioshka computer', (c) => {
      c.add(chain(0, [
        ['l37_0', I('grindless:gallium_arsenide_wafer'), 'Gallium Arsenide Wafer'],
        ['l37_1', mach('gtceu:mocvd_reactor'), 'Mocvd Reactor'],
        ['l37_2', I('grindless:ingaasb_epi_wafer'), 'Ingaasb Epi Wafer'],
        ['l37_3', FOUNDRY, 'Photonic Foundry'],
        ['l37_4', I('grindless:air_bridge_wafer'), 'Air Bridge Wafer'],
        ['l37_5', I('grindless:ingaasb_tpv_cell'), 'Ingaasb TPV Cell'],
        ['l37_6', mach('gtceu:droplet_radiator_works'), 'Droplet Radiator Works'],
        ['l37_7', I('grindless:tpv_tile'), 'TPV Tile'],
        ['l37_8', I('grindless:tpv_segment'), 'TPV Segment'],
        ['l37_9', I('grindless:matrioshka_tpv_shell'), 'Matrioshka TPV Shell'],
      ], 'the Matrioshka computer'));
      c.feed('l37_7', [
        ['l46_0', I('gtceu:tungsten_dust'), 'Tungsten'],
        ['l46_1', SPS, 'Spark Plasma Sinterer'],
        ['l46_2', I('grindless:w_target'), 'W Target'],
        ['l46_3', I('grindless:sputtered_w_wafer'), 'Sputtered W Wafer'],
        ['l46_4', FOUNDRY, 'Photonic Foundry'],
        ['l46_5', I('grindless:w_photonic_crystal'), 'W Photonic Crystal'],
        ['l46_6', I('grindless:hfo2_passivated_crystal'), 'Hfo2 Passivated Crystal'],
        ['l46_7', I('grindless:selective_emitter'), 'Selective Emitter'],
      ], -1, 2);
      c.add(dest(chain(7.5, [
        ['l41_0', I('gtceu:niobium_dust'), 'Niobium'],
        ['l41_1', SPS, 'Spark Plasma Sinterer'],
        ['l41_2', I('grindless:nb_target'), 'NB Target'],
        ['l41_3', MBE, 'MBE Reactor'],
        ['l41_4', I('grindless:nb_trilayer'), 'NB Trilayer'],
        ['l41_5', mach('gtceu:snspd_foundry'), 'Snspd Foundry'],
        ['l41_6', I('grindless:nb_jj_wafer'), 'NB Jj Wafer'],
        ['l41_7', I('grindless:aqfp_die'), 'AQFP Die'],
        ['l41_8', I('grindless:aqfp_module'), 'AQFP Module'],
        ['l41_9', I('grindless:matrioshka_logic_tile'), 'Matrioshka Logic Tile'],
      ]), 'the Matrioshka computer'));
      c.add(dest(chain(10, [
        ['l40_0', I('gtceu:silicon_dust'), 'Silicon'],
        ['l40_1', I('gtca:silicon_tetrachloride_dust'), 'Silicon Tetrachloride'],
        ['l40_2', FIBRE, 'Fibre Draw Tower'],
        ['l40_3', I('grindless:silica_storage_preform'), 'Silica Storage Preform'],
        ['l40_4', FEMTO, 'Femtosecond Writer'],
        ['l40_5', I('grindless:written_crystal_blank'), 'Written Crystal Blank'],
        ['l40_6', I('grindless:verified_crystal'), 'Verified Crystal'],
        ['l40_7', I('grindless:data_crystal_5d'), 'Data Crystal 5D'],
      ]), 'the Matrioshka computer'));
      c.add(chain(15, [
        ['l19_0', I('gtceu:glass_plate'), 'Glass Plate'],
        ['l19_1', I('grindless:lattice_2pp'), '2PP Lattice'],
        ['l19_2', I('grindless:glassy_carbon_lattice'), 'Glassy-Carbon Lattice'],
        ['l19_3', I('grindless:sic_coated_lattice'), 'SiC-Coated Lattice'],
        ['l19_4', I('grindless:droplet_wick'), 'Droplet Wick'],
        ['l19_5', I('grindless:droplet_collector'), 'Droplet Collector'],
        ['l19_6', I('grindless:droplet_radiator_module'), 'Droplet Radiator Module'],
      ], 'the Matrioshka shell'));
      c.feed('l19_6', [
        ['l19_7', I('gtceu:tin_ingot'), 'Tin Ingot'],
        ['l19_8', I('grindless:eb_distilled_tin'), 'EB-Distilled Tin'],
      ], -1, 1);
      c.feed('l19_6', [
        ['l19_9', I('gtceu:rhea_plate'), 'RHEA Plate'],
        ['l19_10', I('grindless:orifice_plate'), 'Orifice Plate'],
      ], 1, 1);
    }),
    // I7: the fuel of the ring
    I7: cluster('The fuel of the ring', (c) => {
      c.add(chain(0, [
        ['l26_0', I('gtceu:lithium_chloride_dust'), 'Lithium Chloride'],
        ['l26_1', mach('gtceu:calutron'), 'Calutron'],
        ['l26_2', I('gtceu:lithium_6_dust'), 'Lithium 6'],
        ['l26_3', mach('gtceu:pyroprocessing_cell'), 'Pyroprocessing Cell'],
        ['l26_4', I('gtceu:lithium_6_metal_dust'), 'Lithium 6 Metal'],
        ['l26_5', I('grindless:li6_hydride'), 'Li-6 Hydride'],
        ['l26_6', mach('gtceu:polarised_proton_source'), 'Polarised Proton Source'],
        ['l26_7', I('grindless:polarised_li6h'), 'Polarised Li-6h'],
        ['l26_8', I('grindless:polarised_li6h_pellet'), 'Polarised Li-6h Pellet'],
      ], 'the Mk5 ring'));
    }),
    // I8: the sled. Trunk: its charge; the waste-canister refit is a line of its own
    I8: cluster('The sled', (c) => {
      c.add(chain(0, [
        ['l4_0', I('gtceu:diamond_plate'), 'Diamond Plate'],
        ['l4_1', I('grindless:dac_charge'), 'Dac Charge'],
        ['l4_2', I('grindless:laser_heated_n2_charge'), 'Laser Heated N2 Charge'],
        ['l4_3', mach('gtceu:ramp_compression_pulser'), 'Ramp Compression Pulser'],
        ['l4_4', I('gtceu:cubic_gauche_nitrogen_dust'), 'Cubic Gauche Nitrogen'],
        ['l4_5', I('grindless:quenched_cg_nitrogen'), 'Quenched CG Nitrogen'],
        ['l4_6', I('grindless:rhea_cased_charge'), 'RHEA Cased Charge'],
        ['l4_7', I('grindless:sled_charge'), 'SLED Charge'],
      ], 'the sled'));
      c.vlink('l4_6', -2.5, 'x4_pbo', 'pl_uhv:fib');
      c.add(dest(chain(5, [
        ['l35_0', I('grindless:synroc_block'), 'Synroc Block'],
        ['l35_1', mach('gtceu:waste_retrieval_plant'), 'Waste Retrieval Plant'],
        ['l35_2', I('grindless:synroc_liner'), 'Synroc Liner'],
        ['l35_3', mach('gtceu:hot_cell'), 'Hot Cell'],
        ['l35_4', I('grindless:filled_waste_canister'), 'Filled Waste Canister'],
        ['l35_5', PRESS, 'Megabar Press'],
        ['l35_6', I('grindless:compacted_waste_canister'), 'Compacted Waste Canister'],
        ['l35_7', mach('gtceu:ergosphere_probe_bay'), 'Ergosphere Probe Bay'],
        ['l35_8', I('grindless:split_charge_sled'), 'Split Charge SLED'],
        ['l35_9', mach('gtceu:penrose_engine'), 'Penrose Engine'],
        ['l35_10', I('grindless:recovered_half_sled'), 'Recovered Half SLED'],
      ]), 'the sled refit'));
    }),
    // I9: the moving parts. Trunk: the conveyor stator; the motor leaves it after the Fe16N2 magnet
    I9: cluster('The moving parts', (c) => {
      c.add(chain(0, [
        ['l39_0', I('grindless:reduced_iron_powder'), 'Reduced Iron Powder'],
        ['l39_1', MAGNET, 'Nitride Magnet Works'],
        ['l39_2', I('grindless:strain_annealed_fe16n2_powder'), 'Strain Annealed Fe16n2 Powder'],
        ['l39_3', MAGNET, 'Nitride Magnet Works'],
        ['l39_4', I('grindless:bonded_fe16n2_magnet'), 'Bonded Fe16n2 Magnet'],
        ['l39_5', MAGNET, 'Nitride Magnet Works'],
        ['l39_6', I('grindless:halbach_array'), 'Halbach Array'],
        ['l39_7', I('grindless:rhea_cased_halbach'), 'RHEA Cased Halbach'],
        ['l39_8', I('grindless:potted_mh_stator'), 'Potted MH Stator'],
        ['l39_9', I('grindless:maglev_stator'), 'Maglev Stator'],
        ['l39_10', I('gtceu:uiv_conveyor_module'), 'UIV Conveyor Module'],
      ], 'the UIV conveyor'));
      c.vlink('l39_10', -2.5, 'x39_cc', 'pl_luv:cc');
      c.spur('l39_4', [
        ['l23_6', I('gtceu:uev_electric_motor'), 'UEV Electric Motor'],
        ['l23_7', I('gtceu:uiv_electric_motor'), 'UIV Electric Motor'],
      ], 1, 1, 'the UIV motor');
      c.vlink('l23_7', 2.5, 'x23_coil', 'pl_luv:coil');
      c.add(dest(chain(7.5, [
        ['l123_0', I('gtceu:gd_123_dust'), 'Gd-123'],
        ['l123_1', I('grindless:bulk_gdbco'), 'Bulk GdBCO'],
        ['l123_2', I('grindless:oxygenated_gdbco'), 'Oxygenated GdBCO'],
        ['l123_3', I('grindless:impregnated_gdbco'), 'Impregnated GdBCO'],
        ['l123_4', I('grindless:field_cooled_gdbco'), 'Field-Cooled GdBCO'],
      ]), 'the UIV motor'));
      c.add(dest(chain(10, [
        ['l3_0', I('grindless:pyrolytic_graphite'), 'Pyrolytic Graphite'],
        ['l3_1', mach('gtceu:ramp_compression_pulser'), 'Ramp Compression Pulser'],
        ['l3_2', I('gtceu:lonsdaleite_dust'), 'Lonsdaleite'],
        ['l3_3', I('grindless:leached_lonsdaleite'), 'Leached Lonsdaleite'],
        ['l3_4', I('grindless:lonsdaleite_race'), 'Lonsdaleite Race'],
        ['l3_5', I('grindless:lonsdaleite_bearing'), 'Lonsdaleite Bearing', 'product', { from: ['l3_4', 'x3_brg'] }],
      ]), 'the UIV piston'));
      c.add([L('x3_brg', 12.5, 7.5, 'pl_luv:bearing')]);
      c.add(dest(chain(15, [
        ['l8_0', I('gtceu:zirconium_dust'), 'Zirconium'],
        ['l8_1', I('grindless:zr_master_alloy'), 'ZR Master Alloy'],
        ['l8_2', LEVITATE, 'Levitation Melter'],
        ['l8_3', I('gtceu:zrticunibe_glass_dust'), 'Zrticunibe Glass'],
        ['l8_4', I('grindless:bmg_blank'), 'BMG Blank'],
        ['l8_5', I('grindless:bmg_flexspline'), 'BMG Flexspline'],
        ['l8_6', I('grindless:strain_wave_gear'), 'Strain Wave Gear'],
      ]), 'the UIV robot arm'));
    }),
    // I10: the nuclear clock. Trunk: the thorium-229 clock; the radiation-hard controller is a line of its own
    I10: cluster('The nuclear clock', (c) => {
      c.add(chain(0, [
        ['l22_0', I('gtceu:uranium_233_ingot'), 'Uranium 233 Ingot'],
        ['l22_1', mach('gtceu:transuranium_facility'), 'Transuranium Facility'],
        ['l22_2', I('grindless:thorium_229'), 'Thorium 229'],
        ['l22_3', mach('gtceu:fluorspar_kiln'), 'Fluorspar Kiln'],
        ['l22_4', I('grindless:thf4'), 'Thf4'],
        ['l22_5', MBE, 'MBE Reactor'],
        ['l22_6', I('grindless:thf4_film'), 'Thf4 Film'],
        ['l22_7', I('grindless:capped_thf4_film'), 'Capped Thf4 Film'],
        ['l22_8', mach('gtceu:nuclear_clock_lab'), 'Nuclear Clock Lab'],
        ['l22_9', I('grindless:chip_nuclear_clock'), 'Chip Nuclear Clock'],
      ], 'the UIV sensor'));
      c.add(dest(chain(5, [
        ['l43_0', I('grindless:c12_cvd_plate'), 'C-12 CVD Plate'],
        ['l43_1', IMPLANT, 'Ion Implanter'],
        ['l43_2', I('grindless:c12_boron_diamond'), 'C-12 Boron Diamond'],
        ['l43_3', FOUNDRY, 'Photonic Foundry'],
        ['l43_4', I('grindless:diamond_contact_wafer'), 'Diamond Contact Wafer'],
        ['l43_5', I('grindless:diamond_schottky_die'), 'Diamond Schottky Die'],
        ['l43_6', I('grindless:rad_hard_controller'), 'Rad Hard Controller'],
      ]), 'the neutron star site'));
    }),
  },
};
