// pl_opv: the OpV lines O1 to O9 (docs/eras/lines-opv-maxplus.md, sections 1, 2 and 10). One cluster per line, laid out by place():
// the spine of the line first, then its branches, each branch joined into the machine step that takes its end product.
// O1 is a staged line: it starts at the UXV chart's si28_ash and takes the three UXV steps that make it (line id 'si28').
// Arrows are checked against a recipe dump by pl-check.mjs (integrator).
import { I, F, M, n, L, KINDS } from './pl-lib.mjs';

// a path is a list of [type, id, title, options?]: 'i' item, 'f' fluid, 'm' machine, 'l' link (id is 'pl_<era>:<key>').
// The first step is raw, machines are 'ours', the rest products; each step comes from the one before it. Keys are <prefix><index>.
function path(p, spec) {
  return spec.map(([t, id, title, o = {}], i) => {
    const key = `${p}${i}`;
    if (t === 'l') return L(key, 0, 0, id);
    const res = t === 'm' ? M(id) : t === 'f' ? F(id) : I(id);
    const kind = o.kind || (i === 0 ? 'raw' : t === 'm' ? 'ours' : 'product');
    return n(key, 0, 0, res, title, { ...(i > 0 ? { from: [`${p}${i - 1}`] } : {}), ...o, kind });
  });
}

// Layout: the first path is the spine, a straight row at lane 0 (lanes are 2 apart, steps 2.5). Every other path is a unit that is
// hung on the nodes already placed: right-justified under the node it feeds (so its last arrow is one step long), or left-justified
// after the node that feeds it. Units are taken left to right; each takes the nearest lane where nothing is crowded, backward,
// longer than 5, under a node or crossing a line (the same rules as pl-model's layoutFindings).
const STEP = 2.5;
const LANE = 2;
const half = (nd) => (nd.size ?? KINDS[nd.kind].size) / 2;

function segHitsBox(a, b, box) {
  let t0 = 0, t1 = 1;
  const dx = b.x - a.x, dy = b.y - a.y;
  const p = [-dx, dx, -dy, dy];
  const q = [a.x - box.x0, box.x1 - a.x, a.y - box.y0, box.y1 - a.y];
  for (let i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-12) { if (q[i] < 0) return false; continue; }
    const t = q[i] / p[i];
    if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
  }
  return t1 - t0 > 1e-6;
}

function segCross(a, b, c, d) {
  const o = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
}

function layout(paths, name) {
  const nodes = paths.flat();
  const byKey = new Map(nodes.map((nd) => [nd.key, nd]));
  const edges = [];
  for (const nd of nodes) for (const k of nd.from || []) if (byKey.has(k)) edges.push({ a: byKey.get(k), b: nd });
  const placed = new Set();
  const placedEdges = new Set();
  const lane = new Map();
  const put = (nd, x, l) => { nd.x = x; nd.y = LANE * l; lane.set(nd.key, l); };
  paths[0].forEach((nd, i) => put(nd, STEP * i, 0));
  const commit = (unit) => {
    for (const nd of unit) placed.add(nd.key);
    for (const e of edges) if (!placedEdges.has(e) && placed.has(e.a.key) && placed.has(e.b.key)) placedEdges.add(e);
  };
  commit(paths[0]);

  const hits = (a, b, nds, skip) => {
    for (const o of nds) {
      if (o === a || o === b || skip.has(o.key)) continue;
      const h = half(o) * 0.9;
      if (segHitsBox(a, b, { x0: o.x - h, x1: o.x + h, y0: o.y - h, y1: o.y + h })) return true;
    }
    return false;
  };
  const valid = (unit) => {
    const fresh = new Set(unit.map((nd) => nd.key));
    const live = nodes.filter((nd) => placed.has(nd.key) || fresh.has(nd.key));
    for (const nd of unit) {
      for (const o of live) {
        if (o === nd) continue;
        const gap = Math.max(Math.abs(nd.x - o.x), Math.abs(nd.y - o.y)) - half(nd) - half(o);
        if (gap < 0.25) return false;
      }
    }
    const fresher = edges.filter((e) => !placedEdges.has(e) && live.includes(e.a) && live.includes(e.b));
    const all = [...placedEdges, ...fresher];
    for (const e of fresher) {
      const { a, b } = e;
      if (b.x < a.x - 0.01) return false;
      if (Math.abs(b.x - a.x) <= 0.01 && Math.abs(b.y - a.y) > 3.01) return false;
      if (Math.hypot(b.x - a.x, b.y - a.y) > 5.01) return false;
      if (hits(a, b, live, new Set())) return false;
      for (const o of all) {
        if (o === e || o.a === a || o.a === b || o.b === a || o.b === b) continue;
        if (segCross(a, b, o.a, o.b)) return false;
      }
    }
    for (const o of placedEdges) if (hits(o.a, o.b, unit, new Set())) return false;
    return true;
  };

  const todo = new Set(paths.slice(1).map((_, i) => i + 1));
  while (todo.size) {
    let best = null;
    for (const ui of todo) {
      const unit = paths[ui];
      const keys = new Set(unit.map((nd) => nd.key));
      const out = edges.filter((e) => keys.has(e.a.key) && placed.has(e.b.key));
      const inn = edges.filter((e) => keys.has(e.b.key) && placed.has(e.a.key));
      if (!out.length && !inn.length) continue;
      let anchor;
      if (out.length) {
        const e = out.reduce((m, o) => (o.b.x < m.b.x ? o : m));
        anchor = { node: e.a, x: e.b.x - STEP, lane: lane.get(e.b.key), dir: 'out' };
      } else {
        const e = inn.reduce((m, o) => (o.a.x < m.a.x ? o : m));
        anchor = { node: e.b, x: e.a.x + STEP, lane: lane.get(e.a.key), dir: 'in' };
      }
      if (!best || anchor.x < best.anchor.x) best = { ui, anchor };
    }
    if (!best) {
      // a unit with nothing placed to hang on: start it on a fresh lane, taking the unit the most others lead into first
      const deg = (ui) => { const ks = new Set(paths[ui].map((nd) => nd.key)); return edges.filter((e) => (ks.has(e.b.key) && !placed.has(e.a.key) && !ks.has(e.a.key)) || (ks.has(e.a.key) && !placed.has(e.b.key) && !ks.has(e.b.key))).length; };
      const ui = [...todo].reduce((m, o) => (deg(o) > deg(m) ? o : m));
      const l = Math.max(...lane.values()) + 1;
      paths[ui].forEach((nd, j) => put(nd, STEP * j, l));
      commit(paths[ui]);
      todo.delete(ui);
      continue;
    }
    const unit = paths[best.ui];
    const at = unit.indexOf(best.anchor.node);
    let ok = false;
    for (const gap of [0, STEP]) {
      for (let d = gap ? 0 : 1; d <= 40 && !ok; d++) {
        for (const l of [best.anchor.lane + d, best.anchor.lane - d].sort((p, q) => Math.abs(p) - Math.abs(q))) {
          const x0 = best.anchor.x + (best.anchor.dir === 'out' ? -gap : gap);
          unit.forEach((nd, j) => put(nd, x0 + STEP * (j - at), l));
          if (valid(unit)) { ok = true; break; }
        }
      }
      if (ok) break;
    }
    if (!ok) throw new Error(`pl_opv: ${name}: no lane for ${unit[0].key}..${unit[unit.length - 1].key}`);
    commit(unit);
    todo.delete(best.ui);
  }
  return nodes;
}

// one cluster: the paths, the joins [target key, source key] that feed a branch end into a step, and the links below them
function cluster(name, paths, joins, links, extra = {}) {
  const nodes = paths.flat();
  for (const [to, from] of joins) {
    const nd = nodes.find((o) => o.key === to);
    if (!nd) throw new Error(`pl_opv: join target ${to} is not in ${name}`);
    nd.from = [...nd.from, from];
  }
  layout(paths, name);
  const y = Math.max(...nodes.map((nd) => nd.y)) + 2.5;
  links.forEach(([key, ref], i) => nodes.push(L(key, 2.5 * i, y, ref)));
  return { name, ...extra, nodes };
}

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
const dt = 'gtceu:distillation_tower';
const zr = 'gtceu:zone_refining_tower';
const adec = 'gtceu:antiproton_decelerator';
const ahf = 'gtceu:antihydrogen_foundry';
const forge = 'gtceu:kugelblitz_forge';
const lcr = 'gtceu:ev_chemical_reactor';
const hic = 'gtceu:heavy_ion_cyclotron';
const calutron = 'gtceu:calutron';
const hotcell = 'gtceu:hot_cell';
const sorter = 'gtceu:pasta_phase_sorter';
const nodeWorks = 'gtceu:collector_node_works';

// O1: the Si-28 qubit line. Three UXV steps, then 23 of ours (the spine); the branches end in the tetron fab, the TFLN fab and the hall.
const o1 = cluster('O1 Si-28 qubit line', [
  path('o1_', [
    ['l', 'pl_uxv:l29_8', 'Si-28 Ash'],
    ['m', 'gtceu:extraction_cascade', 'Extraction Cascade'],
    ['f', 'gtceu:crude_si28_trichlorosilane', 'Crude Si-28 Trichlorosilane'],
    ['m', dt, 'Distillation Tower'],
    ['f', 'gtceu:si28_trichlorosilane', 'Si-28 Trichlorosilane'],
    ['m', mocvd, 'MOCVD Reactor'],
    ['i', 'grindless:si28_poly_rod', 'Si-28 Poly Rod'],
    ['m', zr, 'Zone Refining Tower'],
    ['i', 'grindless:si28_fz_ingot', 'Si-28 FZ Ingot'],
    ['m', 'gtceu:large_cutter', 'Large Cutter'],
    ['i', 'grindless:si28_fz_wafer', 'Si-28 FZ Wafer'],
    ['m', imp, 'Ion Implanter'],
    ['i', 'grindless:h_si28_wafer', 'H Si-28 Wafer'],
    ['m', tfln, 'TFLN Fab'],
    ['i', 'grindless:si28_soi_wafer', 'Si-28 SOI Wafer'],
    ['m', 'gtceu:electric_blast_furnace', 'Electric Blast Furnace'],
    ['i', 'grindless:annealed_soi_wafer', 'Annealed SOI Wafer'],
    ['m', imp, 'Ion Implanter'],
    ['i', 'grindless:back_gated_soi_wafer', 'Back-Gated SOI Wafer'],
    ['m', mocvd, 'MOCVD Reactor'],
    ['i', 'grindless:gate_stack_soi_wafer', 'Gate Stack SOI Wafer'],
    ['m', beuv, 'BEUV Scanner'],
    ['i', 'grindless:cryo_cmos_litho_wafer', 'Cryo-CMOS Litho Wafer'],
    ['m', imp, 'Ion Implanter'],
    ['i', 'grindless:cryo_cmos_implanted_wafer', 'Cryo-CMOS Implanted Wafer'],
    ['m', eb, 'Electron Beam Furnace'],
    ['i', 'grindless:activated_cmos_wafer', 'Activated CMOS Wafer'],
    ['m', mocvd, 'MOCVD Reactor'],
    ['i', 'grindless:contacted_cmos_wafer', 'Contacted CMOS Wafer'],
        ['m', sput, 'Spintronic Cluster Tool'],
    ['i', 'grindless:cryo_cmos_metal_wafer', 'Cryo-CMOS Metal Wafer'],
    ['m', beuv, 'BEUV Scanner'],
    ['i', 'grindless:interconnected_cmos_wafer', 'Interconnected CMOS Wafer'],
    ['m', 'gtceu:large_cutter', 'Large Cutter'],
    ['i', 'grindless:untested_cryo_cmos_die', 'Untested Cryo-CMOS Die'],
    ['m', he, 'Helium Refrigerator'],
    ['i', 'grindless:cryo_cmos_die', 'Cryo-CMOS Die'],
    ['m', 'gtceu:tetron_fab', 'Tetron Fab'],
    ['i', 'grindless:tetron_die', 'Tetron Die'],
        ['m', sput, 'Spintronic Cluster Tool'],
    ['i', 'grindless:bumped_tetron_die', 'Bumped Tetron Die'],
    ['m', tfln, 'TFLN Fab'],
    ['i', 'grindless:bonded_tetron_die', 'Bonded Tetron Die'],
    ['m', mk, 'Millikelvin Cryostat Works'],
    ['i', 'grindless:tested_tetron_die', 'Tested Tetron Die'],
    ['m', 'gtceu:tetron_fab', 'Tetron Fab'],
    ['i', 'grindless:tetron_array', 'Tetron Array', { end: 'MAX: the supracausal mainframe' }],
  ]),
  // byproducts of the silicon half: the tetrachloride goes back to the crude, the purge is hydrolysed, the HF joins the fluorine chain
  [n('o1_tet', 0, 0, F('gtceu:si28_tetrachloride'), 'Si-28 Tetrachloride', { kind: 'by', from: ['o1_2'], by: [dt], end: 'hydrogenated back to crude trichlorosilane in a Large Chemical Reactor (the loop)', sub: 'The distillation tower; back into step 1' })],
  [n('o1_purge', 0, 0, F('gtceu:chlorosilane_purge'), 'Chlorosilane Purge', { kind: 'by', from: ['o1_2'], by: [dt], end: 'hydrolysed in a Large Chemical Reactor to phosphoric and sulfuric acid, HCl and silica', sub: 'Carries the ash phosphorus out' })],
  [n('o1_hf', 0, 0, F('gtceu:hydrofluoric_acid'), 'Hydrofluoric Acid', { kind: 'by', from: ['o1_26'], by: [mocvd], end: 'the fluorine chain (the fluorspar kiln, the HF electrolysis)', sub: 'Tungsten plugs: WF6 and hydrogen' })],
  path('o1g_', [
    ['i', 'grindless:si_inp_wafer', 'Si-InP Wafer'],
    ['m', mbe, 'MBE Reactor'],
    ['i', 'grindless:inas_qw_wafer', 'InAs QW Wafer'],
    ['i', 'grindless:inas_al_wafer', 'InAs-Al Wafer'],
    ['i', 'grindless:hbn_capped_2deg_wafer', 'hBN Capped 2DEG Wafer'],
    ['m', 'gtceu:stm_lithography_cell', 'STM Lithography Cell'],
    ['i', 'grindless:gated_2deg_wafer', 'Gated 2DEG Wafer'],
  ]),
  path('o1n_', [
    ['i', 'grindless:fz_silicon_wafer', 'FZ Silicon Wafer'],
    ['m', beuv, 'BEUV Scanner'],
    ['i', 'grindless:tsv_via_wafer', 'TSV Via Wafer'],
        ['m', sput, 'Spintronic Cluster Tool'],
    ['i', 'grindless:nb_filled_tsv_wafer', 'Nb Filled TSV Wafer'],
    ['m', tfln, 'TFLN Fab'],
    ['i', 'grindless:bonded_tsv_interposer', 'Bonded TSV Interposer'],
    ['i', 'grindless:nb_tsv_interposer', 'Nb TSV Interposer'],
  ]),
  path('o1l_', [
    ['i', 'grindless:implanted_ln_wafer', 'Implanted LN Wafer'],
    ['m', tfln, 'TFLN Fab'],
    ['i', 'grindless:ln_on_soi_wafer', 'LN on SOI Wafer'],
    ['m', 'gtceu:femtosecond_writer', 'Femtosecond Writer'],
    ['i', 'grindless:ln_soi_waveguide_wafer', 'LN Waveguide Wafer'],
    ['m', 'gtceu:snspd_foundry', 'SNSPD Foundry'],
    ['i', 'grindless:snspd_link_wafer', 'SNSPD Link Wafer'],
    ['m', 'gtceu:fibre_draw_tower', 'Fibre Draw Tower'],
    ['i', 'grindless:cryo_optical_link', 'Cryo Optical Link'],
  ]),
  path('o1h_', [
    ['i', 'grindless:si_inp_boule', 'Si-InP Boule'],
    ['i', 'grindless:si_inp_wafer', 'Si-InP Wafer'],
    ['m', mbe, 'MBE Reactor'],
    ['i', 'grindless:inp_hemt_epi_wafer', 'InP HEMT Epi Wafer'],
    ['i', 'grindless:hemt_gated_wafer', 'HEMT Gated Wafer'],
    ['i', 'grindless:isolated_hemt_wafer', 'Isolated HEMT Wafer'],
    ['i', 'grindless:hemt_amplifier', 'HEMT Amplifier'],
  ]),
  [n('o1nr_0', 0, 0, I('grindless:nb_tsv_interposer'), 'Nb TSV Interposer', { kind: 'raw', sub: 'The interposer branch' })],
  [n('o1_hall', 0, 0, M('gtceu:photonic_integration_hall'), 'Photonic Integration Hall', { kind: 'ours', from: ['o1_36'], sub: 'Circuit 8, the cosmic mainframe: die, interposer, link and HEMT' })],
], [
  ['o1_37', 'o1g_6'],
  ['o1_41', 'o1n_7'],
  ['o1_hall', 'o1nr_0'],
  ['o1_hall', 'o1l_8'],
  ['o1_hall', 'o1h_6'],
], [], { line: 'si28', extends: 'pl_uxv:stars' });

// O2: the antiproton complex. The spallation station merged into the decelerator: its rows are the four cooling and capture
// steps (spallation, stochastic cooling, electron cooling, ELENA), then the three antihydrogen foundry rows.
const o2 = cluster('O2 Antiprotons to antihydrogen', [
  path('o2_', [
    ['f', 'gtceu:jet_proton_beam', 'Jet Proton Beam'],
    ['m', adec, 'Antiproton Complex'],
    ['f', 'gtceu:hot_antiproton_beam', 'Hot Antiproton Beam'],
    ['m', adec, 'Antiproton Complex'],
    ['f', 'gtceu:stochastically_cooled_beam', 'Cooled Antiproton Beam'],
    ['m', adec, 'Antiproton Complex'],
    ['f', 'gtceu:decelerated_antiproton_beam', 'Decelerated Antiproton Beam'],
    ['m', adec, 'Antiproton Complex'],
    ['i', 'grindless:cold_antiproton_cell', 'Cold Antiproton Cell'],
    ['m', ahf, 'Antihydrogen Foundry'],
    ['i', 'grindless:trapped_antihydrogen', 'Trapped Antihydrogen'],
    ['m', ahf, 'Antihydrogen Foundry'],
    ['i', 'grindless:cooled_antihydrogen', 'Cooled Antihydrogen'],
    ['m', ahf, 'Antihydrogen Foundry'],
    ['i', 'grindless:antihydrogen_ice_cell', 'Antihydrogen Ice Cell', { end: 'the annihilation engine' }],
  ]),
  path('o2w_', [
    ['i', 'gtceu:beryllium_dust', 'Beryllium'],
    ['m', 'gtceu:fluorspar_kiln', 'Fluorspar Kiln'],
    ['i', 'grindless:be_fluoride_dust', 'BeF2'],
    ['m', eb, 'Electron Beam Furnace'],
    ['i', 'grindless:eb_beryllium_ingot', 'EB Beryllium Ingot'],
    ['m', 'gtceu:hot_strip_mill', 'Hot Strip Mill'],
    ['i', 'grindless:be_window_foil', 'Be Window Foil'],
    ['m', eb, 'Electron Beam Furnace'],
    ['i', 'grindless:brazed_be_window', 'Brazed Be Window'],
    ['i', 'grindless:be_beam_window', 'Be Beam Window'],
    ['m', 'gtceu:jet_beam_line', 'Jet Beam Line'],
  ]),
  path('o2i_', [
    ['i', 'gtceu:iridium_dust', 'Iridium'],
    ['m', 'gtceu:platinum_plant', 'Platinum Plant'],
    ['i', 'grindless:five_n_iridium', '5N Iridium'],
    ['m', sx, 'Spark Plasma Sinterer'],
    ['i', 'grindless:ir_target_rod', 'Ir Target Rod'],
        ['m', sput, 'Spintronic Cluster Tool'],
    ['i', 'grindless:ta_clad_ir_rod', 'Ta-Clad Ir Rod'],
    ['i', 'grindless:ir_spallation_target', 'Ir Spallation Target', { end: 'the first antiproton complex row' }],
  ]),
  path('o2h_', [
    ['i', 'gtceu:lithium_chloride_dust', 'Lithium Chloride'],
    ['m', calutron, 'Calutron'],
    ['i', 'gtceu:lithium_6_dust', 'Li-6'],
    ['m', 'gtceu:pyroprocessing_cell', 'Pyroprocessing Cell'],
    ['i', 'gtceu:lithium_6_metal_dust', 'Li-6 Metal'],
    ['m', lcr, 'Large Chemical Reactor'],
    ['i', 'grindless:li6_hydride', 'Li-6 Hydride'],
    ['m', sx, 'Spark Plasma Sinterer'],
    ['i', 'grindless:li6h_tile', 'Li-6 Hydride Tile'],
    ['m', eb, 'Electron Beam Furnace'],
    ['i', 'grindless:canned_li6h_block', 'Canned Li-6 Hydride Block'],
    ['i', 'grindless:li6_hydride_shield', 'Li-6 Hydride Shield', { end: 'the first antiproton complex row' }],
  ]),
  path('o2p_', [
    ['i', 'grindless:rrr_nb_target', 'RRR Nb Target'],
        ['m', sput, 'Spintronic Cluster Tool'],
    ['i', 'grindless:nbtin_film_wafer', 'NbTiN Film Wafer'],
    ['m', eb, 'Electron Beam Furnace'],
    ['i', 'grindless:pickup_array', 'Pickup Array'],
    ['i', 'grindless:brazed_pickup_tank', 'Brazed Pickup Tank'],
    ['m', he, 'Helium Refrigerator'],
    ['i', 'grindless:stochastic_cooling_pickup', 'Stochastic Cooling Pickup', { end: 'the stochastic cooling row' }],
  ]),
  path('o2c_', [
    ['i', 'grindless:ceb6_powder', 'CeB6 Powder'],
    ['m', cg, 'Crystal Growth Furnace'],
    ['i', 'grindless:ceb6_boule', 'CeB6 Boule'],
    ['i', 'grindless:ceb6_cathode', 'CeB6 Cathode'],
    ['i', 'grindless:cooler_electron_gun', 'Cooler Electron Gun'],
    ['m', he, 'Helium Refrigerator'],
    ['i', 'grindless:electron_cooler', 'Electron Cooler', { end: 'the electron cooling row' }],
  ]),
  path('o2n_', [
    ['i', 'grindless:tizrv_ingot', 'TiZrV Ingot'],
    ['m', sx, 'Spark Plasma Sinterer'],
    ['i', 'grindless:tizrv_target', 'TiZrV Target'],
        ['m', sput, 'Spintronic Cluster Tool'],
    ['i', 'grindless:neg_coated_chamber', 'NEG Coated Chamber'],
    ['m', eb, 'Electron Beam Furnace'],
    ['i', 'grindless:activated_neg_chamber', 'Activated NEG Chamber'],
    ['i', 'grindless:neg_xhv_casing', 'NEG XHV Casing', { end: 'the beam line casing and the ELENA rings' }],
  ]),
  [n('o2r0', 0, 0, I('grindless:ir_spallation_target'), 'Ir Spallation Target', { kind: 'raw', sub: 'Made in its own line, left' })],
  [n('o2r1', 0, 0, I('grindless:li6_hydride_shield'), 'Li-6 Hydride Shield', { kind: 'raw', sub: 'Made in its own line, left' })],
  [n('o2r2', 0, 0, I('grindless:stochastic_cooling_pickup'), 'Stochastic Cooling Pickup', { kind: 'raw', sub: 'Made in its own line, left' })],
  [n('o2r3', 0, 0, I('grindless:electron_cooler'), 'Electron Cooler', { kind: 'raw', sub: 'Made in its own line, left' })],
  [n('o2t_0', 0, 0, I('grindless:empty_penning_trap'), 'Empty Penning Trap', { kind: 'raw', sub: 'Catches the cold antiprotons' })],
  [n('o2d_0', 0, 0, I('grindless:dense_positron_cell'), 'Dense Positron Cell', { kind: 'raw', sub: 'O3: the positron line' })],
  path('o2l_', [
    ['i', 'gtceu:raw_lithium', 'Raw Lithium'],
    ['m', 'gtceu:ore_refinery', 'Ore Refinery'],
    ['i', 'gtceu:lithium_dust', 'Lithium'],
    ['m', cg, 'Crystal Growth Furnace'],
    ['i', 'grindless:lbo_boule', 'LBO Boule'],
    ['i', 'grindless:kr_tripler_cell', 'Kr Tripler Cell'],
    ['i', 'grindless:lyman_alpha_laser', 'Lyman-alpha Laser'],
  ]),
  path('o2o_', [
    ['i', 'grindless:octupole_tape', 'Octupole Tape'],
    ['i', 'grindless:octupole_winding', 'Octupole Winding'],
    ['m', cvi, 'CVI Furnace'],
    ['i', 'grindless:potted_octupole_winding', 'Potted Octupole Winding'],
    ['m', he, 'Helium Refrigerator'],
    ['i', 'grindless:cooled_octupole_winding', 'Cooled Octupole Winding'],
    ['i', 'grindless:octupole_trap_magnet', 'Octupole Trap Magnet'],
  ]),
  path('o2v_', [
    ['f', 'gtceu:methane', 'Methane'],
    ['m', 'gtceu:methane_pyrolyser', 'Methane Pyrolyser'],
    ['i', 'grindless:pyrolytic_graphite', 'Pyrolytic Graphite'],
    ['i', 'grindless:hopg_blank', 'HOPG Blank'],
    ['i', 'grindless:hopg_plate', 'HOPG Plate'],
    ['m', mk, 'Millikelvin Cryostat Works'],
    ['i', 'grindless:levitation_trap_cell', 'Levitation Trap Cell'],
  ]),
  path('o2s_', [
    ['i', 'grindless:cold_antiproton_cell', 'Cold Antiproton Cell', { kind: 'raw' }],
    ['m', 'gtceu:antimatter_trap', 'Antimatter Trap'],
    ['i', 'grindless:antiproton_stack_opv', 'Antiproton Stack'],
  ]),
  path('o2a_', [
    ['f', 'gtceu:curium_californium_nitrate', 'Cm-Cf Nitrate'],
    ['m', 'gtceu:actinide_partitioning_plant', 'Actinide Partitioning Plant'],
    ['f', 'gtceu:curium_nitrate', 'Curium Nitrate'],
    ['m', 'gtceu:actinide_partitioning_plant', 'Actinide Partitioning Plant'],
    ['i', 'grindless:cm245_fraction', 'Cm-245 Fraction'],
    ['m', eb, 'Electron Beam Furnace'],
    ['i', 'grindless:w_re_hohlraum', 'W-Re Hohlraum'],
    ['i', 'grindless:acmf_pellet', 'ACMF Pellet'],
  ]),
  path('o2b_', [
    ['i', 'gtceu:boron_dust', 'Boron'],
    ['m', calutron, 'Calutron'],
    ['i', 'grindless:boron_10_dust', 'B-10'],
    ['m', lcr, 'Large Chemical Reactor'],
    ['i', 'grindless:b4c_10_dust', 'B4C-10'],
    ['i', 'grindless:w_b4c_powder', 'W/B4C Powder'],
    ['m', sx, 'Spark Plasma Sinterer'],
    ['i', 'grindless:gamma_absorber_tile', 'Gamma Absorber Tile'],
  ]),
  path('o2g_', [
    ['i', 'gtceu:gallium_dust', 'Gallium'],
    ['m', cg, 'Crystal Growth Furnace'],
    ['i', 'grindless:gasb_boule', 'GaSb Boule'],
    ['i', 'grindless:gasb_wafer', 'GaSb Wafer'],
    ['m', mbe, 'MBE Reactor'],
    ['i', 'grindless:ingaassb_epi_wafer', 'InGaAsSb Epi Wafer'],
    ['i', 'grindless:tpv_panel', 'TPV Panel', { end: 'the annihilation shield and the engine cage' }],
  ]),
  [n('o2_engine', 0, 0, M('gtceu:annihilation_engine'), 'Annihilation Engine', { kind: 'ours', sub: 'Stack, ACMF pellet, absorber tile and TPV panel', from: [] })],
], [
  ['o2_1', 'o2_0'],
  ['o2_1', 'o2r0'],
  ['o2_1', 'o2r1'],
  ['o2_3', 'o2r2'],
  ['o2_5', 'o2r3'],
  ['o2_7', 'o2t_0'],
  ['o2_9', 'o2d_0'],
  ['o2_9', 'o2o_6'],
  ['o2_11', 'o2l_6'],
  ['o2_13', 'o2v_6'],
  ['o2w_10', 'o2w_9'],
  ['o2_engine', 'o2s_2'],
  ['o2_engine', 'o2a_7'],
  ['o2_engine', 'o2b_7'],
], [
  ['o2x0', 'pl_uv:trap'], ['o2x1', 'pl_uhv:sps'], ['o2x2', 'pl_uev:ebf'], ['o2x3', 'pl_uhv:cgf'], ['o2x4', 'pl_uv:sheet'],
  ['o2x5', 'pl_uiv:l31_1'], ['o2x6', 'pl_ev:plate'], ['o2x7', 'pl_uhv:acc'], ['o2x8', 'pl_uhv:mbe'], ['o2x9', 'pl_luv:indium'],
], {});

// O3: positrons to the Kugelblitz.
const o3 = cluster('O3 Positrons to the Kugelblitz', [
  path('o3_', [
    ['i', 'grindless:empty_penning_trap', 'Empty Penning Trap'],
    ['m', 'gtceu:positron_accumulator', 'Positron Accumulator'],
    ['i', 'grindless:seed_positron_plasma', 'Seed Positron Plasma'],
    ['m', 'gtceu:magnetic_pair_converter', 'Magnetic Pair Converter'],
    ['f', 'gtceu:hot_pair_plasma', 'Hot Pair Plasma'],
    ['i', 'grindless:unsealed_positron_cell', 'Unsealed Positron Cell'],
    ['m', eb, 'Electron Beam Furnace'],
    ['i', 'grindless:dense_positron_cell', 'Dense Positron Cell'],
    ['m', forge, 'Kugelblitz Forge'],
    ['i', 'grindless:gamma_pump_charge', 'Gamma Pump Charge'],
    ['m', forge, 'Kugelblitz Forge'],
    ['i', 'grindless:kugelblitz_seed', 'Kugelblitz Seed'],
    ['m', forge, 'Kugelblitz Forge'],
    ['i', 'grindless:kugelblitz_core', 'Kugelblitz Core'],
    ['m', forge, 'Kugelblitz Forge'],
    ['i', 'grindless:hawking_drive', 'Hawking Drive', { end: 'the warp gate' }],
  ]),
  path('o3g_', [
    ['i', 'grindless:moderated_ps_cell', 'Moderated Ps Cell'],
    ['m', 'gtceu:annihilation_laser_works', 'Annihilation Laser Works'],
    ['i', 'grindless:gamma_laser_module', 'Gamma Laser Module'],
  ]),
  path('o3m_', [
    ['i', 'gtceu:carbon_dust', 'Carbon'],
    ['m', 'gtceu:ev_mixer', 'Mixer'],
    ['i', 'gtca:silicon_carbide_dust', 'Silicon Carbide'],
        ['m', sput, 'Spintronic Cluster Tool'],
    ['i', 'grindless:wc_sic_multilayer', 'WC/SiC Multilayer'],
    ['m', 'gtceu:synchrotron', 'Synchrotron'],
    ['i', 'grindless:mirror_metrology_record', 'Mirror Metrology Record'],
    ['m', 'gtceu:gamma_optics_works', 'Gamma Optics Works'],
    ['i', 'grindless:gamma_multilayer_mirror', 'Gamma Multilayer Mirror'],
  ]),
  path('o3l_', [
    ['i', 'gtceu:germanium_dust', 'Germanium'],
    ['m', zr, 'Zone Refining Tower'],
    ['i', 'grindless:seven_n_germanium', '7N Germanium'],
    ['m', 'gtceu:megabar_press', 'Megabar Press'],
    ['i', 'grindless:bent_ge_tile', 'Bent Ge Tile'],
    ['m', 'gtceu:gamma_optics_works', 'Gamma Optics Works'],
    ['i', 'grindless:laue_lens', 'Laue Lens'],
  ]),
  [n('o3gr_0', 0, 0, I('grindless:gamma_laser_module'), 'Gamma Laser Module', { kind: 'raw', sub: 'The gamma laser branch' })],
  [n('o3mr_0', 0, 0, I('grindless:gamma_multilayer_mirror'), 'Gamma Multilayer Mirror', { kind: 'raw', sub: 'The mirror branch' })],
  [n('o3a_0', 0, 0, I('grindless:gamma_absorber_tile'), 'Gamma Absorber Tile', { kind: 'raw', sub: 'O2: the absorber branch' })],
  [n('o3f_0', 0, 0, I('grindless:field_frozen_plate'), 'Field Frozen Plate', { kind: 'raw', sub: 'O5: the field-freezing line' })],
], [
  ['o3_3', 'o3g_2'],
  ['o3_8', 'o3gr_0'],
  ['o3_10', 'o3m_8'],
  ['o3_10', 'o3l_6'],
  ['o3_12', 'o3a_0'],
  ['o3_14', 'o3mr_0'],
  ['o3_14', 'o3f_0'],
], [], {});

// O4: stable exotic matter.
const o4 = cluster('O4 Stable exotic matter', [
  path('o4_', [
    ['i', 'gtceu:lead_dust', 'Lead'],
    ['m', calutron, 'Calutron'],
    ['i', 'grindless:lead_208_dust', 'Lead-208'],
    ['i', 'grindless:pb208_ion_source', 'Pb-208 Ion Source'],
    ['m', hic, 'Superheavy Factory'],
    ['i', 'grindless:pb208_beam_cell', 'Pb-208 Beam Cell'],
    ['m', 'gtceu:synchrotron', 'Synchrotron'],
    ['f', 'gtceu:fireball_distillate', 'Fireball Distillate'],
    ['m', 'gtceu:strangelet_distiller', 'Strangelet Distiller'],
    ['i', 'grindless:strangelet_seed', 'Strangelet Seed'],
    ['i', 'grindless:fed_strangelet', 'Fed Strangelet'],
    ['m', 'gtceu:strangelet_vault', 'Strangelet Vault'],
    ['i', 'grindless:grown_strangelet', 'Grown Strangelet'],
    ['i', 'grindless:stable_exotic_matter', 'Stable Exotic Matter', { end: 'the Kugelblitz forge' }],
  ]),
  [n('o4n_0', 0, 0, I('grindless:neutronium_pellet'), 'Neutronium Pellet', { kind: 'raw', sub: 'UIV: the neutron star line' })],
  [n('o4f_0', 0, 0, I('grindless:field_frozen_plate'), 'Field Frozen Plate', { kind: 'raw', sub: 'O5: the field-freezing line' })],
], [
  ['o4_10', 'o4n_0'],
  ['o4_13', 'o4f_0'],
], [], {});

// O5: SGR chain matter and field freezing. The lamina branch is the line; the cable branch ends in the hull cables.
const o5 = cluster('O5 Chain matter and field freezing', [
  path('o5_', [
    ['i', 'grindless:neutronium_pellet', 'Neutronium Pellet'],
    ['m', 'gtceu:pasta_extractor', 'Pasta Extractor'],
    ['i', 'grindless:chain_lattice_slab', 'Chain Lattice Slab'],
    ['m', sorter, 'Pasta Mill'],
    ['i', 'grindless:caged_chain_lattice', 'Caged Chain Lattice'],
    ['i', 'grindless:chain_lamina', 'Chain Lamina'],
    ['m', sorter, 'Pasta Mill'],
    ['i', 'grindless:chain_lamina_stack', 'Chain Lamina Stack'],
    ['m', eb, 'Electron Beam Furnace'],
    ['i', 'grindless:field_canned_stack', 'Field Canned Stack'],
    ['m', 'gtceu:field_frozen_press', 'Field Frozen Press'],
    ['i', 'grindless:field_frozen_billet', 'Field Frozen Billet'],
    ['i', 'grindless:field_frozen_plate', 'Field Frozen Plate', { end: 'the field-frozen casing, the OpV energy hatches and the Hawking drive' }],
  ]),
  path('o5c_', [
    ['i', 'grindless:chain_crust_slab', 'Chain Crust Slab'],
    ['m', sorter, 'Pasta Mill'],
    ['i', 'grindless:caged_chain_phase', 'Caged Chain Phase'],
    ['m', sorter, 'Pasta Mill'],
    ['i', 'gtceu:chain_strand_ingot', 'Chain Strand Ingot'],
    ['i', 'gtceu:chain_strand_single_wire', 'Chain Strand Wire'],
    ['i', 'grindless:pbo_braided_chain_wire', 'PBO Braided Wire'],
    ['i', 'gtceu:chain_strand_single_cable', 'Chain Strand Cable', { end: 'the OpV hull cables' }],
  ]),
], [], [['o5x0', 'pl_uhv:fib'], ['o5x1', 'pl_uiv:l30_5']], {});

// O6: Terzan 5 replication and the bulge. The spine is the GaN MMIC tile to the bulge collector; the debris, film and probe branches join it.
const o6 = cluster('O6 Probes, nodes and the bulge', [
  path('o6_', [
    ['i', 'grindless:sic_wafer', 'SiC Wafer'],
    ['m', cvi, 'CVI Furnace'],
    ['i', 'grindless:hpsi_sic_wafer', 'HPSI SiC Wafer'],
    ['m', mocvd, 'MOCVD Reactor'],
    ['i', 'grindless:gan_sic_epi_wafer', 'GaN-on-SiC Epi Wafer'],
    ['m', beuv, 'BEUV Scanner'],
    ['i', 'grindless:gan_gated_wafer', 'GaN Gated Wafer'],
    ['i', 'grindless:gan_mmic', 'GaN MMIC'],
    ['i', 'grindless:gan_mmic_tile', 'GaN MMIC Tile'],
    ['m', hotcell, 'Hot Cell'],
    ['i', 'grindless:tested_mmic_tile', 'Tested MMIC Tile'],
    ['m', eb, 'Electron Beam Furnace'],
    ['i', 'grindless:sealed_mmic_tile', 'Sealed MMIC Tile'],
    ['i', 'grindless:node_power_transmitter', 'Node Power Transmitter'],
    ['m', nodeWorks, 'Collector Node Works'],
    ['i', 'grindless:collector_node', 'Collector Node'],
    ['m', nodeWorks, 'Collector Node Works'],
    ['i', 'grindless:deployed_node_pack', 'Deployed Node Pack'],
    ['m', 'gtceu:bulge_collector', 'Bulge Collector'],
    ['i', 'grindless:bulge_light_census', 'Bulge Light Census', { end: 'the gate to MAX' }],
  ]),
  path('o6m_', [
    ['i', 'grindless:bulge_debris', 'Bulge Debris'],
    ['m', 'gtceu:debris_harvester', 'Debris Harvester'],
    ['i', 'grindless:metal_debris_fraction', 'Metal Debris Fraction'],
    ['m', 'gtceu:replication_refinery', 'Replication Refinery'],
    ['f', 'gtceu:metal_carbonyl', 'Metal Carbonyl'],
    ['i', 'grindless:carbonyl_iron_nickel', 'Carbonyl Iron-Nickel'],
    ['i', 'grindless:metal_feedstock', 'Metal Feedstock'],
    ['m', 'gtceu:von_neumann_foundry', 'Von Neumann Foundry'],
    ['i', 'grindless:probe_seed', 'Probe Seed'],
  ]),
  path('o6s_', [
    ['i', 'grindless:bulge_debris', 'Bulge Debris'],
    ['m', 'gtceu:debris_harvester', 'Debris Harvester'],
    ['i', 'grindless:silicate_debris_fraction', 'Silicate Debris Fraction'],
    ['i', 'grindless:ffc_pellet', 'FFC Pellet'],
    ['i', 'grindless:si_alloy_powder', 'Si Alloy Powder'],
    ['m', 'gtceu:replication_refinery', 'Replication Refinery'],
    ['i', 'grindless:cluster_sinter_casing', 'Cluster Sinter Casing'],
  ]),
  path('o6f_', [
    ['i', 'grindless:si_alloy_powder', 'Si Alloy Powder', { kind: 'raw' }],
    ['m', nodeWorks, 'Collector Node Works'],
    ['i', 'grindless:si_ribbon', 'Si Ribbon'],
    ['i', 'grindless:pv_collector_film', 'PV Collector Film'],
  ]),
  path('o6x_', [
    ['i', 'grindless:hollow_capillaries', 'Hollow Capillaries'],
    ['m', 'gtceu:fibre_draw_tower', 'Fibre Draw Tower'],
    ['i', 'grindless:polycapillary_optic', 'Polycapillary Optic'],
    ['i', 'grindless:xray_timing_head', 'X-ray Timing Head'],
    ['i', 'grindless:clock_locked_head', 'Clock-Locked Head'],
    ['m', 'gtceu:xray_pulse_profiler', 'X-ray Pulse Profiler'],
    ['i', 'grindless:xnav_unit', 'XNAV Unit', { end: 'the probe fleet' }],
  ]),
  path('o6d_', [
    ['i', 'grindless:fz_silicon_boule', 'FZ Silicon Boule'],
    ['m', 'gtceu:large_cutter', 'Large Cutter'],
    ['i', 'grindless:fz_silicon_wafer', 'FZ Silicon Wafer'],
    ['i', 'grindless:sdd_ring_wafer', 'SDD Ring Wafer'],
    ['i', 'grindless:sdd_anode_wafer', 'SDD Anode Wafer'],
        ['m', sput, 'Spintronic Cluster Tool'],
    ['i', 'grindless:sdd_die', 'SDD Die'],
  ]),
], [
  ['o6_16', 'o6m_8'],
  ['o6_14', 'o6s_6'],
  ['o6_14', 'o6f_3'],
  ['o6x_3', 'o6d_6'],
], [['o6x0', 'pl_iv:hotcell'], ['o6x1', 'pl_uhv:clock']], {});

// O7: OpV components. The spine is the REBCO pancake to the robot arm; the rotor and harmonic drive join it.
const o7 = cluster('O7 OpV components', [
  path('o7_', [
    ['i', 'grindless:itbtc_coated_conductor', 'ITBTC Coated Conductor'],
    ['m', hts, 'HTS Magnet Works'],
    ['i', 'grindless:rebco_pancake', 'REBCO Pancake'],
    ['m', cvi, 'CVI Furnace'],
    ['i', 'grindless:potted_rebco_pancake', 'Potted REBCO Pancake'],
    ['m', hts, 'HTS Magnet Works'],
    ['i', 'grindless:trained_rebco_pancake', 'Trained REBCO Pancake'],
    ['i', 'grindless:chain_field_coil', 'Chain Field Coil'],
    ['i', 'gtceu:opv_electric_motor', 'OpV Electric Motor'],
    ['i', 'gtceu:opv_electric_piston', 'OpV Electric Piston'],
    ['i', 'gtceu:opv_robot_arm', 'OpV Robot Arm', { end: 'the OpV machines' }],
  ]),
  path('o7r_', [
    ['i', 'grindless:sic_fibre', 'SiC Fibre'],
    ['i', 'grindless:chain_sic_preform', 'Chain SiC Preform'],
    ['m', cvi, 'CVI Furnace'],
    ['i', 'grindless:densified_chain_preform', 'Densified Chain Preform'],
    ['i', 'grindless:chain_composite_rod', 'Chain Composite Rod'],
  ]),
  path('o7h_', [
    ['i', 'grindless:gum_metal_billet', 'Gum Metal Billet'],
    ['m', 'gtceu:hot_strip_mill', 'Hot Strip Mill'],
    ['i', 'grindless:gum_metal_blank', 'Gum Metal Blank'],
    ['m', 'gtceu:megabar_press', 'Megabar Press'],
    ['i', 'grindless:chain_flexspline_cup', 'Flexspline Cup'],
    ['i', 'grindless:toothed_flexspline_cup', 'Toothed Flexspline Cup'],
    ['m', sx, 'Spark Plasma Sinterer'],
    ['i', 'grindless:opv_harmonic_drive', 'OpV Harmonic Drive'],
  ]),
  path('o7p_', [
    ['f', 'gtceu:helium_3', 'Helium-3'],
    ['m', 'gtceu:cryogenic_plant', 'Cryogenic Plant'],
    ['f', 'gtceu:helium_3_6n', '6N Helium-3'],
    ['m', 'gtceu:cryogenic_plant', 'Cryogenic Plant'],
    ['f', 'gtceu:liquid_helium_3', 'Liquid Helium-3'],
    ['m', mk, 'Millikelvin Cryostat Works'],
    ['f', 'gtceu:superfluid_helium_3', 'Superfluid Helium-3'],
    ['i', 'grindless:superfluid_he3_seal', 'Superfluid He-3 Seal', { end: 'the OpV pump' }],
  ]),
  path('o7b_', [
    ['i', 'gtceu:diaminoresorcinol_dust', 'Diaminoresorcinol'],
    ['m', 'gtceu:pbo_plant', 'PBO Plant'],
    ['f', 'gtceu:pbo_dope', 'PBO Dope'],
    ['m', 'gtceu:pbo_plant', 'PBO Plant'],
    ['i', 'grindless:pbo_fibre', 'PBO Fibre'],
    ['m', sorter, 'Pasta Mill'],
    ['i', 'grindless:chain_mesh_weave', 'Chain Mesh Weave'],
    ['m', eb, 'Electron Beam Furnace'],
    ['i', 'grindless:welded_mesh_belt', 'Welded Mesh Belt'],
    ['m', he, 'Helium Refrigerator'],
    ['i', 'grindless:chain_mesh_belt', 'Chain Mesh Belt', { end: 'the OpV conveyor' }],
  ]),
  path('o7t_', [
    ['i', 'grindless:thorium_229', 'Thorium-229'],
    ['m', hotcell, 'Hot Cell'],
    ['i', 'grindless:thorium_229_nitrate', 'Thorium-229 Nitrate'],
    ['m', 'gtceu:fluorspar_kiln', 'Fluorspar Kiln'],
    ['i', 'grindless:laser_grade_thf4', 'Laser-Grade ThF4'],
    ['m', cg, 'Crystal Growth Furnace'],
    ['i', 'grindless:th_caf2_lasing_boule', 'Th:CaF2 Boule'],
    ['m', mocvd, 'MOCVD Reactor'],
    ['i', 'grindless:coated_th_caf2_crystal', 'Coated Th:CaF2 Crystal'],
    ['m', 'gtceu:nuclear_clock_lab', 'Nuclear Clock Lab'],
    ['i', 'grindless:th229_lasing_crystal', 'Th-229 Lasing Crystal', { end: 'the OpV emitter' }],
  ]),
  path('o7g_', [
    ['f', 'gtceu:pure_germanium_tetrachloride', 'Pure GeCl4'],
    ['m', zr, 'Zone Refining Tower'],
    ['i', 'grindless:thirteen_n_germanium', '13N Germanium'],
    ['m', cg, 'Crystal Growth Furnace'],
    ['i', 'grindless:hpge_compton_boule', 'HPGe Boule'],
    ['m', imp, 'Ion Implanter'],
    ['i', 'grindless:contacted_hpge_crystal', 'Contacted HPGe Crystal'],
    ['m', he, 'Helium Refrigerator'],
    ['i', 'grindless:hpge_compton_crystal', 'HPGe Compton Crystal', { end: 'the OpV sensor' }],
  ]),
], [
  ['o7_8', 'o7r_4'],
  ['o7_10', 'o7h_7'],
], [], {});

// O8: the superheavy census IV. The californium branch joins at the census.
const o8 = cluster('O8 Superheavy census IV', [
  path('o8_', [
    ['i', 'grindless:ni_chain_slab', 'Ni Chain Slab'],
    ['i', 'grindless:caged_ni_chain', 'Caged Ni Chain'],
    ['i', 'gtceu:thawed_chain_nickel_dust', 'Thawed Chain Nickel'],
    ['m', calutron, 'Calutron'],
    ['i', 'gtceu:nickel_64_dust', 'Nickel-64'],
    ['m', hic, 'Superheavy Factory'],
    ['f', 'gtceu:element_124_recoil_gas', 'Element 124 Recoil Gas'],
    ['m', hic, 'Superheavy Factory'],
    ['i', 'grindless:element_124_recoil', 'Element 124 Recoil'],
    ['i', 'grindless:superheavy_census_iv', 'Superheavy Census IV', { end: 'the gate to MAX' }],
  ]),
  path('o8c_', [
    ['i', 'gtceu:californium_249_dust', 'Californium 249'],
    ['m', hotcell, 'Hot Cell'],
    ['i', 'grindless:cf249_target_wheel', 'Cf-249 Target Wheel'],
    ['m', hic, 'Superheavy Factory'],
    ['f', 'gtceu:element_126_recoil_gas', 'Element 126 Recoil Gas'],
    ['i', 'grindless:element_126_recoil', 'Element 126 Recoil'],
  ]),
], [['o8_9', 'o8c_5']], [], {});

// O9: the AlN power die.
const o9 = cluster('O9 AlN power die', [
  path('o9_', [
    ['i', 'gtceu:aluminium_dust', 'Aluminium'],
    ['m', 'gtceu:nitride_magnet_works', 'Nitride Magnet Works'],
    ['i', 'grindless:aln_powder', 'AlN Powder'],
    ['i', 'grindless:aln_boule', 'AlN Boule'],
    ['i', 'grindless:aln_wafer', 'AlN Wafer'],
    ['m', mocvd, 'MOCVD Reactor'],
    ['i', 'grindless:algan_epi_wafer', 'AlGaN Epi Wafer'],
    ['i', 'grindless:algan_patterned_wafer', 'AlGaN Patterned Wafer'],
    ['i', 'grindless:aln_power_die', 'AlN Power Die', { end: 'the OpV power parts' }],
  ]),
], [], [], {});

export default {
  file: 'pl_opv',
  order: 13,
  title: 'OpV Lines',
  subtitle: 'The Si-28 qubit line from UXV oxygen ash to the tetron array, antiprotons to antihydrogen, positrons to the Kugelblitz, stable exotic matter, SGR chain matter and field freezing, probe replication and the bulge, the OpV components, the last superheavy census and the AlN power die.',
  icon: 'grindless:tetron_array',
  focus: 'o1_1',
  bands: [['o5', 'o7', 'o9'], ['o1'], ['o2', 'o3', 'o4'], ['o6', 'o8']],
  clusters: { o5, o7, o9, o1, o2, o3, o4, o6, o8 },
};
