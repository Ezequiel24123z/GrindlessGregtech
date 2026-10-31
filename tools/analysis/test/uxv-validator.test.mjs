// UXV-C1: the validator's -Tier uxv. The real tiers/uxv.json (substages uxv, uxv-vela, uxv-cas-a and the gate after both, the checks of
// docs/eras/uxv.md "Validator" and "Gate to OpV"), the planted cases that must fail (Ti-44 made outside Cas A knot dust, an OpV item in a
// UXV recipe, a Vela product read by an Earth recipe before uxv-vela, a second gtnn:spintronic_mainframe recipe), the F1 ids at their
// substage, the generators and EU/t ceiling checks, and the re-count of the design's lines, crossings and older modes.
// The planted mini packs reuse the real config's own pieces (its targets, era order and era resources), so a weakened check fails here.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTierConfig } from '../lib/config.mjs';
import { gi, gt, mkDump, run, verdicts } from './helpers.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIERS = path.join(HERE, '..', 'tiers');
const ROOT = path.join(HERE, '..', '..', '..');
const uxv = () => loadTierConfig({ tier: 'uxv' }, TIERS).raw;
const uxvFile = () => JSON.parse(fs.readFileSync(path.join(TIERS, 'uxv.json'), 'utf8'));
const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
const target = (id) => byId(uxv().targets)[id];
const TI44 = 'gtceu:titanium_44_dust';
const KNOT = 'grindless:ejecta_knot_dust';
const SWEEPER = 'gtceu:ejecta_knot_sweeper';
const CALUTRON = 'gtceu:calutron';
const MAINFRAME = 'gtnn:spintronic_mainframe';
const HALL = 'gtceu:photonic_integration_hall';
const UXV_GROUPS = ['uxv-home', 'uxv-vela-outputs', 'uxv-cas-a-outputs', 'uxv-gate'];

test('real tiers (uxv): three substages in order after UIV, Vela and Cas A siblings, the gate after both', () => {
  const raw = uxv();
  assert.equal(raw.tier, 'uxv');
  assert.equal(uxvFile().extends, 'uiv');
  const at = (e) => raw.eraOrder.indexOf(e);
  for (const [a, b] of [['uiv-cygnus', 'uxv'], ['uxv', 'uxv-vela'], ['uxv', 'uxv-cas-a'], ['uxv-vela', 'opv'], ['uxv-cas-a', 'opv'], ['opv', 'max']]) assert.ok(at(a) >= 0 && at(a) < at(b), `${a} before ${b}`);
  assert.deepEqual(raw.eraSiblings.at(-1), ['uxv-vela', 'uxv-cas-a']);
  const res = byId(raw.eraResources);
  assert.equal(res['cygnus-uxv'].era, 'uxv');
  assert.equal(res.vela.era, 'uxv-vela');
  assert.deepEqual(res.vela.dimensions, ['grindless:vela_pulsar_orbit']);
  assert.equal(res['cas-a'].era, 'uxv-cas-a');
  assert.deepEqual(res['cas-a'].dimensions, ['grindless:cas_a_remnant']);
  assert.deepEqual(res['vela-hold'].onlyFrom, ['vela']);
  assert.deepEqual(res['cas-a-hold'].onlyFrom, ['cas-a']);
  assert.equal(res.opv.era, 'opv');
  assert.ok(res.opv.items.includes('gtceu:opv_*'));
  const g = byId(raw.eraItems);
  assert.deepEqual(UXV_GROUPS.map((id) => g[id]?.era), ['uxv', 'uxv-vela', 'uxv-cas-a', 'opv']);
  assert.equal(uxvFile().world, undefined, 'UXV adds no hand-gathered source');
});

test('real tiers (uxv): every package is declared and lands; every reference names a declared package', () => {
  const raw = uxv();
  const f = uxvFile();
  for (const want of ['F1', 'W', 'M1', 'M2', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6']) {
    assert.ok(f.packages[want], `package ${want}`);
    assert.ok(f.packages[want].landedWhen?.length > 0 || f.packages[want].landedWhenAny?.length > 0, `${want} has no landing mark`);
  }
  const ids = Object.keys(raw.packages);
  for (const x of [...f.machines, ...f.synthetic, ...f.targets, ...f.eraResources, ...f.eraItems]) {
    for (const p of [x.package].flat().filter(Boolean)) assert.ok(ids.includes(p), `${x.id || x.machine}: package ${p} is not declared`);
  }
});

test('real tiers (uxv): the Validator\'s leak checks are unreachable checks gated on the right machines', () => {
  const t = byId(uxv().targets);
  const un = (id, without, any) => {
    assert.ok(t[id], id);
    assert.equal(t[id].expect, 'unreachable', id);
    for (const w of without) assert.ok(t[id].without.includes(w), `${id}: ${w}`);
    for (const a of any) assert.ok(t[id].anyOf.includes(a), `${id}: ${a}`);
  };
  un('isotopes-only-calutron', [`operate:${CALUTRON}*`], [TI44, 'gtceu:fermium_257_dust', 'gtceu:tungsten_184_dust']);
  un('ti44-only-cas-a', [`operate:${SWEEPER}*`], [TI44, 'grindless:ti44_core']);
  un('es254-only-transuranium', ['operate:gtceu:transuranium_facility*'], ['gtceu:einsteinium_dust']);
  un('cm248-only-hot-cell', ['operate:gtceu:hot_cell*'], ['gtceu:curium_248_dust']);
  un('element-121-122-only-chain', ['operate:gtceu:heavy_ion_cyclotron*', 'operate:gtceu:recoil_separator*', 'operate:gtceu:superheavy_chemistry_lab*'], []);
  un('island-only-mnt', ['operate:gtceu:mnt_collider*'], ['grindless:island_nuclide', 'grindless:island_chart']);
  un('mtj-stacks-only-sputter', ['operate:gtceu:mtj_sputter_cluster*'], ['grindless:mtj_stack_wafer', 'grindless:mram_stack_wafer', 'grindless:saf_track_wafer']);
  un('oxide-films-only-pld', ['operate:gtceu:oxide_pld_chamber*'], []);
  un('vdw-stacks-only-cell', ['operate:gtceu:vdw_stacking_cell*'], []);
  un('tracks-only-racetrack', ['operate:gtceu:racetrack_fab*'], ['grindless:racetrack_chip']);
  un('yig-only-lpe', ['operate:gtceu:yig_lpe_furnace*'], ['grindless:yig_film_wafer']);
  un('gyro-only-shequid', ['operate:gtceu:shequid_works*'], ['grindless:shequid_gyro']);
  un('spintronic-mainframe-only-hall', [`operate:${HALL}*`], [MAINFRAME]);
  un('mk6-plasmas-only-mk6', ['operate:gtceu:uxv_fusion_reactor*'], ['fluid:gtceu:oxygen_burning_ash_plasma']);
  un('mk5-plasmas-only-mk5', ['operate:gtceu:uiv_fusion_reactor*', 'operate:gtceu:uxv_fusion_reactor*'], []);
  un('mk4-plasmas-only-mk4', ['operate:gtceu:uev_fusion_reactor*', 'operate:gtceu:uiv_fusion_reactor*', 'operate:gtceu:uxv_fusion_reactor*'], []);
  un('stellar-plasma-only-elevator', ['operate:gtceu:stellar_elevator*'], ['fluid:gtceu:stellar_plasma', 'grindless:elevator_log']);
  un('stellar-cuts-only-filter', ['operate:gtceu:plasma_mass_filter*'], ['fluid:gtceu:stellar_hydrogen_cut']);
  un('disk-plasma-only-skimmer', ['operate:gtceu:accretion_disk_skimmer*'], ['fluid:gtceu:disk_plasma']);
  un('frc-only-former', ['operate:gtceu:frc_former*'], ['grindless:frc_cartridge', 'fluid:gtceu:flux_loaded_plasma']);
  un('pasta-only-vela', ['operate:gtceu:pasta_extractor*'], ['grindless:raw_pasta', 'grindless:lasagna_plate', 'grindless:lasagna_electrode', 'grindless:pasta_core_sample', 'gtceu:pasta_strand_single_wire']);
  un('strand-wire-only-draw-bench', ['operate:gtceu:pasta_draw_bench*'], ['gtceu:pasta_strand_single_wire']);
  un('lasagna-only-laminator', ['operate:gtceu:pasta_laminator*'], ['grindless:lasagna_plate']);
  for (const [id, dim] of [['site-vela', 'grindless:vela_pulsar_orbit'], ['site-cas-a', 'grindless:cas_a_remnant']]) {
    assert.equal(t[id].kind, 'site', id);
    assert.deepEqual(t[id].dimensions, [dim], id);
  }
  for (const id of ['site-warp-gate', 'site-cygnus-uxv', 'gate-hold-vela', 'gate-hold-cas-a', 'gate-hold-bulge', 'gate-vela-orbit', 'gate-cas-a-remnant',
    'gate-arm-chart', 'gate-bulge-chart', 'gate-opv-casing', 'gate-spintronic-mainframe', 'gate-uxv-fusion', 'gate-network-uxv', 'gate-uxv-hull',
    'gate-uxv-sensor', 'gate-uxv-emitter', 'gate-uxv-parallel-hatch']) assert.ok(t[id], id);
  assert.ok(Object.keys(t).filter((k) => t[k].expect === 'unreachable').length >= 24, 'the 24 leak checks');
  const syn = byId(uxv().synthetic);
  assert.ok(syn['wireless-uxv'].produces.includes('eu:uxv'));
  assert.deepEqual(syn['vela-jump'].produces, ['dim:grindless:vela_pulsar_orbit']);
  assert.deepEqual(syn['cas-a-jump'].produces, ['dim:grindless:cas_a_remnant']);
  assert.ok(!Object.values(syn).some((s) => (s.produces || []).includes('research:rad_hard_controller')), 'UXV-FX: no rad-hard research bootstrap');
});

test('real tiers (uxv): the hull, hatches, Mk6 and every component but the sensor are held to uxv-vela; the emitter needs Cas A', () => {
  const raw = uxv();
  const g = byId(raw.eraItems);
  const res = byId(raw.eraResources);
  const vela = g['uxv-vela-outputs'].items;
  for (const id of ['gtceu:uxv_machine_hull', 'gtceu:uxv_energy_input_hatch', 'gtceu:uxv_energy_input_hatch_16a', 'gtceu:uxv_energy_output_hatch',
    'gtceu:uxv_energy_output_hatch_16a', 'm:gtceu:uxv_fusion_reactor', 'gtceu:uxv_electric_motor', 'gtceu:uxv_electric_pump', 'gtceu:uxv_conveyor_module',
    'gtceu:uxv_electric_piston', 'gtceu:uxv_robot_arm', 'gtceu:uxv_field_generator']) assert.ok(vela.includes(id), `${id} at uxv-vela`);
  for (const p of ['gtceu:uxv_machine_hull', 'gtceu:uxv_energy_input_hatch*', 'gtceu:uxv_energy_output_hatch*', 'gtceu:uxv_fusion_reactor']) assert.ok(res['vela-hold'].items.includes(p), `vela-hold: ${p}`);
  assert.ok(g['uxv-home'].items.includes('gtceu:uxv_sensor'));
  assert.ok(g['uxv-home'].items.includes(MAINFRAME));
  assert.deepEqual(res['cas-a-hold'].items, ['gtceu:uxv_emitter']);
  // the built emitter also reads lasagna_plate (Vela), so it is checked after both substages (the gate group, era opv)
  assert.ok(g['uxv-gate'].items.includes('gtceu:uxv_emitter'));
  assert.ok(g['uxv-cas-a-outputs'].items.includes(TI44));
});

// ------------------------------------------------------------------ F1's ids at their substage

const FOUNDATION_JS = path.join(ROOT, 'pack', 'kubejs', 'startup_scripts', 'grindless', 'uxv', 'foundation.js');
/** F1's items, blocks and materials, read from the registration source. */
function foundationIds() {
  const src = fs.readFileSync(FOUNDATION_JS, 'utf8');
  const block = (name) => {
    const s = src.indexOf(`const ${name} = {`);
    assert.ok(s >= 0, `foundation.js keeps ${name}`);
    return src.slice(s, src.indexOf('\n  }\n', s));
  };
  return {
    items: [...block('ITEMS').matchAll(/^ {4}([a-z0-9_]+):/gm)].map((m) => m[1]),
    blocks: [...block('BLOCKS').matchAll(/^ {4}([a-z0-9_]+):/gm)].map((m) => m[1]),
    materials: [...block('MATERIALS').matchAll(/^ {4}'([a-z]+:[a-z0-9_]+)':/gm)].map((m) => m[1]),
  };
}
// the grindless: components are retired to GTM's gtceu:uxv_* (highTierContent on, a 1:1 conversion recipe)
const RETIRED = /^uxv_(electric_motor|electric_pump|conveyor_module|electric_piston|robot_arm|sensor|emitter|field_generator)$/;
// F1 materials no recipe in the pack makes or reads: the lines use grindless:cofeb_ingot, heusler_ingot, hbn_dust and yig_film_wafer, and
// obtain.json already holds them as class C rows (UXV-F1); reported, not checked
const NO_RECIPE = ['gtceu:cofeb', 'gtceu:co2mnsi', 'gtceu:yig', 'gtceu:hbn'];

test('F1: every item and block is checked in a UXV era group (reachable at its substage); materials through their forms', (t) => {
  const raw = uxv();
  const where = {};
  for (const g of raw.eraItems.filter((x) => UXV_GROUPS.includes(x.id))) for (const it of g.items) (where[it] ??= []).push(g.id);
  const { items, blocks, materials } = foundationIds();
  assert.equal(items.length + blocks.length + materials.length, 106 + 1 + 37, 'F1 registrations as built');
  const missing = [...items, ...blocks].filter((n) => !where[RETIRED.test(n) ? `gtceu:${n}` : `grindless:${n}`]);
  assert.deepEqual(missing, []);
  const keysOf = (k) => {
    const [ns, n] = k.split(':');
    return Object.keys(where).filter((x) => x === `fluid:${ns}:${n}` || x === `fluid:gtceu:${n}` || new RegExp(`^gtceu:${n}_(dust|ingot|single_wire)$`).test(x));
  };
  const uncovered = materials.filter((k) => keysOf(k).length === 0);
  t.diagnostic(`F1: ${items.length} items, ${blocks.length} block, ${materials.length} materials; materials with no recipe: ${uncovered.join(', ') || 'none'}`);
  for (const k of uncovered) assert.ok(NO_RECIPE.includes(k), `${k} is not checked at any substage`);
  const at = (id) => where[id]?.[0];
  assert.equal(at('grindless:lasagna_plate'), 'uxv-vela-outputs');
  assert.equal(at('grindless:ti44_core'), 'uxv-cas-a-outputs');
  assert.equal(at('grindless:uxv_fusion_casing'), 'uxv-vela-outputs');
  assert.equal(at('grindless:arm_chart'), 'uxv-gate');
});

// ------------------------------------------------------------------ planted cases on a mini pack (the real targets and era data)

const mini = (extra) => ({
  tier: 'uxv',
  world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ore', CALUTRON, SWEEPER, HALL, 't:proc'] }],
  machines: [
    { machine: CALUTRON, types: ['gtceu:calutron_separation'] },
    { machine: SWEEPER, types: ['gtceu:ejecta_sweeping'] },
    { machine: HALL, types: ['gtceu:photonic_integration'] },
    { machine: 't:proc', types: ['t:proc'] },
  ],
  ...extra,
});
const MINI_ITEMS = ['t:ore', CALUTRON, SWEEPER, HALL, 't:proc'];

test('planted: Ti-44 made outside Cas A knot dust fails ti44-only-cas-a; from the sweeper\'s knot dust it passes', () => {
  const chk = target('ti44-only-cas-a');
  const cfg = mini({ targets: [{ id: 'gate', item: 't:gadget' }, { ...chk, anyOf: [TI44] }] });
  const sweep = gt('t:sweep/knot', 'gtceu:ejecta_sweeping', { ins: [gi('t:ore')], outs: [gi(KNOT)] });
  const cal = gt('t:cal/ti44', 'gtceu:calutron_separation', { ins: [gi(KNOT)], outs: [gi(TI44)] });
  const gadget = gt('t:proc/gadget', 't:proc', { ins: [gi(TI44)], outs: [gi('t:gadget')] });
  assert.deepEqual(verdicts(run(mkDump({ recipes: [sweep, cal, gadget], items: MINI_ITEMS }), cfg).out.gate), { gate: 'PASS', 'ti44-only-cas-a': 'PASS' });
  const leak = gt('t:proc/ti44', 't:proc', { ins: [gi('t:ore')], outs: [gi(TI44)] });
  const r = run(mkDump({ recipes: [sweep, cal, gadget, leak], items: MINI_ITEMS }), cfg);
  assert.equal(verdicts(r.out.gate)['ti44-only-cas-a'], 'FAIL');
  assert.equal(r.out.verdict, 'FAIL');
});

test('planted: a second gtnn:spintronic_mainframe recipe fails spintronic-mainframe-only-hall; the hall row alone passes', () => {
  const cfg = mini({ targets: [{ id: 'gate', item: 't:gadget' }, target('spintronic-mainframe-only-hall')] });
  const hall = gt('grindless:photonic_integration/spintronic_mainframe', 'gtceu:photonic_integration', { ins: [gi('t:ore')], outs: [gi(MAINFRAME)] });
  const gadget = gt('t:proc/gadget', 't:proc', { ins: [gi(MAINFRAME)], outs: [gi('t:gadget')] });
  assert.deepEqual(verdicts(run(mkDump({ recipes: [hall, gadget], items: MINI_ITEMS }), cfg).out.gate), { gate: 'PASS', 'spintronic-mainframe-only-hall': 'PASS' });
  const second = gt('gtnn:assembly_line/spintronic_mainframe', 't:proc', { ins: [gi('t:ore')], outs: [gi(MAINFRAME)] });
  const r = run(mkDump({ recipes: [hall, gadget, second], items: MINI_ITEMS }), cfg);
  assert.equal(verdicts(r.out.gate)['spintronic-mainframe-only-hall'], 'FAIL');
  assert.equal(r.out.verdict, 'FAIL');
});

// A group of the real era data over a mini pack: one recipe of the group's item needs `consumer`, which the dump may place in an era.
function eraPack(groupId, resourceId, makeResource, consumer) {
  const raw = uxv();
  const res = byId(raw.eraResources)[resourceId];
  const group = byId(raw.eraItems)[groupId];
  const dump = mkDump({
    recipes: [
      gt('t:proc/gadget', 't:proc', { ins: [gi('t:ore'), ...(consumer ? [gi(consumer)] : [])], outs: [gi('t:gadget')] }),
      ...(consumer ? [gt('t:maker/made', 't:proc', { ins: [gi('t:ore')], outs: [gi(consumer)] })] : []),
    ],
    items: ['t:ore', 't:proc', 't:gadget', ...(consumer ? [consumer] : [])],
  });
  const cfg = {
    tier: 'uxv', eraOrder: raw.eraOrder,
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ore', 't:proc'] }],
    machines: [{ machine: 't:proc', types: ['t:proc'] }],
    targets: [{ id: 'gadget', item: 't:gadget' }],
    eraResources: [{ ...res, ...makeResource }],
    eraItems: [{ id: group.id, era: group.era, label: group.label, items: ['t:gadget'] }],
  };
  return run(dump, cfg);
}
const grp = (r, id) => r.out.eras.groups.find((x) => x.group.id === id);

test('planted: an OpV item consumed by a UXV recipe is an era violation (the real uxv group and opv resource)', () => {
  const clean = eraPack('uxv-home', 'opv', {}, null);
  assert.equal(grp(clean, 'uxv-home').violations.length, 0);
  const bad = eraPack('uxv-home', 'opv', {}, 'gtceu:opv_machine_casing');
  assert.deepEqual(grp(bad, 'uxv-home').violations.map((v) => v.item), ['t:gadget']);
  assert.deepEqual(grp(bad, 'uxv-home').violations[0].resources.map((x) => x.id), ['opv']);
  assert.equal(bad.out.verdict, 'FAIL');
});

test('planted: a Vela product read by an Earth recipe before uxv-vela is an era violation (the real era order and Vela resource)', () => {
  const clean = eraPack('uxv-home', 'vela', {}, null);
  assert.equal(grp(clean, 'uxv-home').violations.length, 0);
  const bad = eraPack('uxv-home', 'vela', {}, 'grindless:lasagna_plate');
  assert.deepEqual(grp(bad, 'uxv-home').violations.map((v) => v.item), ['t:gadget']);
  assert.deepEqual(grp(bad, 'uxv-home').violations[0].resources.map((x) => x.id), ['vela']);
  assert.equal(bad.out.verdict, 'FAIL');
  // the same product is fine in the Vela group and in the gate after both
  for (const id of ['uxv-vela-outputs', 'uxv-gate']) assert.equal(grp(eraPack(id, 'vela', {}, 'grindless:lasagna_plate'), id).violations.length, 0, id);
});

// ------------------------------------------------------------------ the Mk6, BZ and polar cap: final rows, never doubled; no EU/t above 2^31

const GENERATORS_JS = path.join(ROOT, 'pack', 'kubejs', 'server_scripts', 'grindless', 'power', 'generators.js');
const TABLES = path.join(ROOT, 'pack', 'kubejs', 'data', 'grindless', 'tables');
const FINAL_TYPES = ['gtceu:fusion_reactor', 'gtceu:direct_conversion', 'gtceu:blandford_znajek', 'gtceu:polar_cap_tapping'];
const doubledTypes = (src) => {
  const m = /var TYPES = \[([\s\S]*?)\]/.exec(src);
  assert.ok(m, 'generators.js keeps its TYPES list');
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
};
const doubled = (types) => FINAL_TYPES.filter((x) => types.includes(x)).map((x) => `${x} is in generators.js TYPES: its rows would be doubled`);

test('real pack: the Mk6, its DEC rows, the BZ dynamo and the polar cap tap stay out of the doubling list', () => {
  assert.deepEqual(doubled(doubledTypes(fs.readFileSync(GENERATORS_JS, 'utf8'))), []);
});

test('planted: the BZ dynamo added to the doubling list fails', () => {
  const src = fs.readFileSync(GENERATORS_JS, 'utf8').replace(/var TYPES = \[/, "var TYPES = ['gtceu:blandford_znajek', ");
  assert.deepEqual(doubled(doubledTypes(src)), ['gtceu:blandford_znajek is in generators.js TYPES: its rows would be doubled']);
});

const LONG = 2 ** 31;
/** Every `eut` of the recipe tables, with where it is. */
function tableEut() {
  const out = [];
  const walk = (o, where) => {
    if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${where}[${i}]`));
    else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) {
      if (k === 'eut' && typeof v === 'number') out.push({ where, name: o.name, eut: v });
      else walk(v, `${where}.${k}`);
    }
  };
  for (const f of fs.readdirSync(TABLES).filter((x) => x.endsWith('.json')).sort()) walk(JSON.parse(fs.readFileSync(path.join(TABLES, f), 'utf8')), f);
  return out;
}
function eutProblems(rows) {
  const out = rows.filter((r) => r.eut > LONG).map((r) => `${r.where}: ${r.eut} EU/t is above 2^31`);
  const c10 = rows.find((r) => r.where.startsWith('gate.json') && r.name === 'hold_galactic_bulge');
  if (!c10) out.push('gate.json: the c10 row (hold_galactic_bulge) is missing');
  else if (c10.eut !== LONG) out.push(`gate.json: c10 is ${c10.eut} EU/t, the design says 2^31`);
  return out;
}

test('real pack: no table EU/t above 2^31; the gate\'s c10 row is exactly 2^31 (a long)', (t) => {
  const rows = tableEut();
  t.diagnostic(`${rows.length} table EU/t values, max ${Math.max(...rows.map((r) => r.eut))}`);
  assert.ok(rows.length > 0);
  assert.deepEqual(eutProblems(rows), []);
});

test('planted: a table row above 2^31 fails the EU/t ceiling', () => {
  const p = eutProblems([...tableEut(), { where: 'planted.json.rows[0]', name: 'x', eut: LONG + 1 }]);
  assert.deepEqual(p, [`planted.json.rows[0]: ${LONG + 1} EU/t is above 2^31`]);
});

// ------------------------------------------------------------------ re-count of docs/eras/uxv.md (lines, crossings, older modes)

const section = (md, head) => {
  const start = md.indexOf(head);
  assert.ok(start >= 0, head);
  return md.slice(start, md.indexOf('\n## ', start + 5));
};
const cells = (l) => l.split('|').map((s) => s.trim());
function recount() {
  const md = fs.readFileSync(path.join(ROOT, 'docs', 'eras', 'uxv.md'), 'utf8');
  const rows = section(md, '## New process lines').split('\n').filter((l) => /^\| \d+ \|/.test(l)).map(cells);
  const stated = rows.map((r) => Number(r[3]));
  const arrows = rows.map((r) => (r[2].match(/\u2192/g) || []).length);
  const prefixed = rows.filter((r) => /line \d+'s .*prefix/.test(r[2])).map((r) => Number(r[1]));
  const cr = rows.map((r) => Number(r[4]));
  const cx = section(md, '## Crossings').split('\n').filter((l) => l.startsWith('|') && !l.startsWith('|---') && !l.startsWith('| Era')).map(cells);
  const total = cx.find((r) => r[1].startsWith('**'));
  const eraRows = cx.filter((r) => r !== total);
  const older = section(md, '## Older machines, new modes').split('\n').filter((l) => l.startsWith('|') && !l.startsWith('|---') && !l.startsWith('| Machine'));
  return {
    lines: rows.length, numbered: rows.every((r, i) => Number(r[1]) === i + 1), stated, arrows, prefixed,
    steps: stated.reduce((a, b) => a + b, 0), crSum: cr.reduce((a, b) => a + b, 0),
    eras: Object.fromEntries(eraRows.map((r) => [r[1], Number(r[2])])),
    machines: eraRows.reduce((n, r) => n + r[3].split(/,\s*/).length, 0),
    total: total ? Number(total[2].replace(/\*/g, '')) : NaN, totalText: total?.[3] || '',
    older: older.length,
  };
}

test('re-count: the design\'s lines, steps, crossings with UEV or older and older-machine modes (reported as found)', (t) => {
  const c = recount();
  const avg = c.steps / c.lines;
  const eraSum = Object.values(c.eras).reduce((a, b) => a + b, 0);
  t.diagnostic(`lines ${c.lines}, steps ${c.steps}, average ${avg.toFixed(2)}, min ${Math.min(...c.stated)}; arrows ${c.arrows.reduce((a, b) => a + b, 0)} (min ${Math.min(...c.arrows)}); lines counting another line's prefix ${c.prefixed.join(',')}`);
  t.diagnostic(`crossings: Cr column ${c.crSum}, era rows ${eraSum} ${JSON.stringify(c.eras)}, total row ${c.total}, machines met ${c.machines}; older modes ${c.older}`);
  assert.ok(c.lines > 0 && eraSum > 0 && c.older > 0, 'the tables were found');
  assert.ok(c.numbered, 'lines numbered 1..n');
  assert.ok(c.stated.every((s) => s >= 5), 'no line under 5 steps');
  // a line that starts from another line's prefix counts those steps again, so it may show fewer than four arrows of its own
  c.arrows.forEach((a, i) => assert.ok(a >= 4 || c.prefixed.includes(i + 1), `line ${i + 1}: ${a} arrows and no shared prefix`));
  assert.equal(c.crSum, eraSum, 'the Cr column and the Crossings table agree');
  assert.equal(c.total, eraSum, 'the Crossings total is the sum of its rows');
  assert.ok(c.totalText.startsWith(`${c.machines} older machines`), `the total row names ${c.machines} machines`);
  for (const e of Object.keys(c.eras)) assert.ok(['ULV', 'LV', 'MV', 'HV', 'EV', 'IV', 'LuV', 'ZPM', 'UV', 'UHV', 'UEV'].includes(e), `crossing with ${e} is not two eras back`);
});
