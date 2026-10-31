// OPV-C1: the validator's -Tier opv. The real tiers/opv.json (substages opv, opv-sgr, opv-terzan5 and max, the checks of docs/eras/opv.md
// "Validator (-Tier opv)" and "Gate to MAX"), the planted cases that must fail (an OpV recipe at 2^31 EU/t other than c11/c13, a MAX
// machine casing consumed by an OpV recipe, a Terzan 5 item read by an Earth recipe before opv-terzan5, a second gtnn:cosmic_mainframe
// recipe), the F1 ids at their substage, the table EU/t ceiling and the re-count of the design's lines and crossings.
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
const TABLES = path.join(ROOT, 'pack', 'kubejs', 'data', 'grindless', 'tables');
const opv = () => loadTierConfig({ tier: 'opv' }, TIERS).raw;
const opvFile = () => JSON.parse(fs.readFileSync(path.join(TIERS, 'opv.json'), 'utf8'));
const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
const target = (id) => byId(opv().targets)[id];
const MAINFRAME = 'gtnn:cosmic_mainframe';
const HALL = 'gtceu:photonic_integration_hall';
const OPV_GROUPS = ['opv-foundation', 'opv-sgr-items', 'opv-terzan5-items', 'max-hold'];
const MACHINES = ['tetron_fab', 'gamma_optics_works', 'antihydrogen_foundry', 'strangelet_vault', 'annihilation_engine', 'jet_beam_line',
  'spallation_target_station', 'antiproton_decelerator', 'strangelet_distiller', 'kugelblitz_forge', 'hawking_collector', 'magnetic_pair_converter',
  'field_frozen_press', 'debris_harvester', 'replication_refinery', 'von_neumann_foundry', 'collector_node_works', 'bulge_collector'];

test('real tiers (opv): the substages in order after UXV (SGR, Terzan 5, then MAX), resources and groups at their era', () => {
  const raw = opv();
  assert.equal(raw.tier, 'opv');
  assert.equal(opvFile().extends, 'uxv');
  const at = (e) => raw.eraOrder.indexOf(e);
  for (const [a, b] of [['uxv-cas-a', 'opv'], ['opv', 'opv-sgr'], ['opv-sgr', 'opv-terzan5'], ['opv-terzan5', 'max']]) assert.ok(at(a) >= 0 && at(a) < at(b), `${a} before ${b}`);
  const res = byId(raw.eraResources);
  assert.equal(res.sgr.era, 'opv-sgr');
  assert.deepEqual(res.sgr.dimensions, ['grindless:sgr1806_orbit']);
  assert.equal(res.terzan5.era, 'opv-terzan5');
  assert.deepEqual(res.terzan5.dimensions, ['grindless:terzan5_core']);
  assert.equal(res.max.era, 'max');
  assert.ok(res.max.items.includes('gtceu:max_*'));
  assert.ok(res.terzan5.items.includes('grindless:probe_seed'));
  const g = byId(raw.eraItems);
  assert.deepEqual(OPV_GROUPS.map((id) => g[id]?.era), ['opv', 'opv-sgr', 'opv-terzan5', 'max']);
  assert.deepEqual(g['max-hold'].items, ['grindless:sgr_a_chart']);
  assert.equal(opvFile().world, undefined, 'OpV adds no hand-gathered source');
});

test('real tiers (opv): the 18 multiblocks are machines with a declared package, each in a group at its era', () => {
  const raw = opv();
  const ids = Object.keys(raw.packages);
  const ms = opvFile().machines.filter((m) => !m.id);
  assert.deepEqual(ms.map((m) => m.machine.replace('gtceu:', '')).sort(), [...MACHINES].sort());
  for (const m of ms) assert.ok(ids.includes(m.package), `${m.machine}: package ${m.package} is not declared`);
  const where = {};
  for (const g of raw.eraItems.filter((x) => OPV_GROUPS.includes(x.id))) for (const it of g.items) (where[it] ??= []).push(g.era);
  for (const n of MACHINES) assert.ok(where[`m:gtceu:${n}`], `m:gtceu:${n} is checked at an era`);
  assert.equal(where['m:gtceu:field_frozen_press'][0], 'opv-sgr');
  assert.equal(where['m:gtceu:bulge_collector'][0], 'opv-terzan5');
  assert.equal(where['m:gtceu:replication_refinery'][0], 'opv-terzan5');
});

test('real tiers (opv): every package is declared and lands; every reference names a declared package', () => {
  const raw = opv();
  const f = opvFile();
  for (const want of ['F1', 'W', 'M1', 'M2', 'A0', 'A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'D1', 'D2', 'D3', 'E1', 'R1', 'R2', 'R3', 'G1']) {
    const p = raw.packages[want];
    // F1..M2 and A*/B* are the ones UXV declares or this tier adds; D3 and A0/A4 have no mark of their own and are covered by a machine row
    if (!p) continue;
    assert.ok(p.landedWhen?.length > 0 || p.landedWhenAny?.length > 0, `${want} has no landing mark`);
  }
  for (const want of ['D1', 'D2', 'E1', 'R1', 'R2', 'R3', 'G1']) assert.ok(f.packages[want], `package ${want}`);
  const ids = Object.keys(raw.packages);
  for (const x of [...f.machines, ...f.synthetic, ...f.targets, ...f.eraResources, ...f.eraItems]) {
    for (const p of [x.package].flat().filter(Boolean)) assert.ok(ids.includes(p), `${x.id || x.machine}: package ${p} is not declared`);
  }
});

test('real tiers (opv): leak checks, sites, the gate and the jumps', () => {
  const t = byId(opv().targets);
  const un = (id, without, any) => {
    assert.ok(t[id], id);
    assert.equal(t[id].expect, 'unreachable', id);
    for (const w of without) assert.ok(t[id].without.includes(w), `${id}: ${w}`);
    for (const a of any) assert.ok(t[id].anyOf.includes(a), `${id}: ${a}`);
  };
  un('cosmic-mainframe-only-hall', [`operate:${HALL}*`], [MAINFRAME]);
  un('tetron_fab-products-only-tetron_fab', ['operate:gtceu:tetron_fab*'], ['grindless:tetron_die']);
  un('bulge_collector-products-only-bulge_collector', ['operate:gtceu:bulge_collector*'], []);
  assert.ok(Object.keys(t).filter((k) => t[k].expect === 'unreachable' && /-products-only-/.test(k)).length >= 14, 'a leak check per producing multiblock');
  for (const [id, dim] of [['site-opv-cygnus', 'grindless:cygnus_x1_orbit'], ['site-opv-sgr', 'grindless:sgr1806_orbit'], ['site-opv-terzan5', 'grindless:terzan5_core'],
    ['site-opv-overworld', 'minecraft:overworld'], ['site-antiproton-stack-opv', 'grindless:cygnus_x1_orbit']]) {
    assert.equal(t[id].kind, 'site', id);
    assert.deepEqual(t[id].dimensions, [dim], id);
  }
  assert.ok(t['site-earth-orbit'].exceptRecipes.includes('grindless:antimatter_storage/antiproton_stack_opv'), 'the antiproton stack row is out of the Earth-orbit rule');
  assert.ok(t['site-earth-orbit'].exceptRecipes.includes('grindless:antimatter_storage/ps_bec'), 'UV\'s own exception is kept');
  for (const id of ['gate-hold-sgr1806', 'gate-hold-terzan5', 'gate-hold-sgr-a', 'gate-sgr-orbit', 'gate-terzan5-core', 'gate-sgr-a-chart', 'site-warp-gate']) assert.ok(t[id], id);
  const syn = byId(opv().synthetic);
  assert.ok(syn['wireless-opv'].produces.includes('eu:opv'));
  assert.deepEqual(syn['sgr-jump'].produces, ['dim:grindless:sgr1806_orbit']);
  assert.deepEqual(syn['terzan5-jump'].produces, ['dim:grindless:terzan5_core']);
  const gate = opvFile().machines.find((m) => m.id === 'gtceu:warp_gate@opv');
  assert.equal(gate.maxEUt, 2 ** 33, 'the warp gate is rated for c13');
});

// ------------------------------------------------------------------ F1's ids at their substage

const IDS = () => JSON.parse(fs.readFileSync(path.join(TABLES, 'opv_ids.json'), 'utf8'));

test('F1: every item and block of the id table is checked in an OpV group; the 8 components and the hull at opv-sgr', (t) => {
  const raw = opv();
  const where = {};
  for (const g of raw.eraItems.filter((x) => OPV_GROUPS.includes(x.id))) for (const it of g.items) (where[it] ??= []).push(g.id);
  const ids = IDS();
  const names = [...ids.foundation.items, ...ids.foundation.blocks].map((n) => (n.includes(':') ? n : `grindless:${n}`));
  const missing = names.filter((n) => !where[n]);
  t.diagnostic(`F1: ${ids.foundation.items.length} items, ${ids.foundation.blocks.length} blocks; unchecked: ${missing.join(', ') || 'none'}`);
  assert.deepEqual(missing, []);
  const at = (id) => where[id]?.[0];
  assert.equal(at('grindless:tetron_die'), 'opv-sgr-items');
  assert.equal(at('grindless:probe_seed'), 'opv-terzan5-items');
  assert.equal(at('grindless:sgr_a_chart'), 'max-hold');
  for (const n of ['opv_electric_motor', 'opv_electric_pump', 'opv_conveyor_module', 'opv_electric_piston', 'opv_robot_arm', 'opv_emitter', 'opv_sensor', 'opv_field_generator', 'opv_machine_hull']) assert.equal(at(`gtceu:${n}`), 'opv-sgr-items', n);
});

// ------------------------------------------------------------------ planted cases on a mini pack (the real targets and era data)

const mini = (extra) => ({
  tier: 'opv',
  world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ore', HALL, 't:proc'] }],
  machines: [{ machine: HALL, types: ['gtceu:photonic_integration'] }, { machine: 't:proc', types: ['t:proc'] }],
  ...extra,
});
const MINI_ITEMS = ['t:ore', HALL, 't:proc'];

test('planted: a second gtnn:cosmic_mainframe recipe fails cosmic-mainframe-only-hall; the hall row alone passes', () => {
  const cfg = mini({ targets: [{ id: 'gate', item: 't:gadget' }, target('cosmic-mainframe-only-hall')] });
  const hall = gt('grindless:photonic_integration/cosmic_mainframe', 'gtceu:photonic_integration', { ins: [gi('t:ore')], outs: [gi(MAINFRAME)] });
  const gadget = gt('t:proc/gadget', 't:proc', { ins: [gi(MAINFRAME)], outs: [gi('t:gadget')] });
  assert.deepEqual(verdicts(run(mkDump({ recipes: [hall, gadget], items: MINI_ITEMS }), cfg).out.gate), { gate: 'PASS', 'cosmic-mainframe-only-hall': 'PASS' });
  const second = gt('gtnn:assembly_line/cosmic_mainframe', 't:proc', { ins: [gi('t:ore')], outs: [gi(MAINFRAME)] });
  const r = run(mkDump({ recipes: [hall, gadget, second], items: MINI_ITEMS }), cfg);
  assert.equal(verdicts(r.out.gate)['cosmic-mainframe-only-hall'], 'FAIL');
  assert.equal(r.out.verdict, 'FAIL');
});

// A group of the real era data over a mini pack: one recipe of the group's item needs `consumer`, which the dump may place in an era.
function eraPack(groupId, resourceId, consumer) {
  const raw = opv();
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
    tier: 'opv', eraOrder: raw.eraOrder,
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ore', 't:proc'] }],
    machines: [{ machine: 't:proc', types: ['t:proc'] }],
    targets: [{ id: 'gadget', item: 't:gadget' }],
    eraResources: [res],
    eraItems: [{ id: group.id, era: group.era, label: group.label, items: ['t:gadget'] }],
  };
  return run(dump, cfg);
}
const grp = (r, id) => r.out.eras.groups.find((x) => x.group.id === id);

test('planted: a Terzan 5 item read by an Earth recipe before opv-terzan5 is an era violation (the real era order and Terzan 5 resource)', () => {
  assert.equal(grp(eraPack('opv-foundation', 'terzan5', null), 'opv-foundation').violations.length, 0);
  const bad = eraPack('opv-foundation', 'terzan5', 'grindless:probe_seed');
  assert.deepEqual(grp(bad, 'opv-foundation').violations.map((v) => v.item), ['t:gadget']);
  assert.deepEqual(grp(bad, 'opv-foundation').violations[0].resources.map((x) => x.id), ['terzan5']);
  assert.equal(bad.out.verdict, 'FAIL');
  for (const id of ['opv-terzan5-items', 'max-hold']) assert.equal(grp(eraPack(id, 'terzan5', 'grindless:probe_seed'), id).violations.length, 0, id);
});

test('planted: gtceu:max_machine_casing consumed by an OpV recipe is an era violation (the real max resource)', () => {
  assert.equal(grp(eraPack('opv-sgr-items', 'max', null), 'opv-sgr-items').violations.length, 0);
  const bad = eraPack('opv-sgr-items', 'max', 'gtceu:max_machine_casing');
  assert.deepEqual(grp(bad, 'opv-sgr-items').violations.map((v) => v.item), ['t:gadget']);
  assert.deepEqual(grp(bad, 'opv-sgr-items').violations[0].resources.map((x) => x.id), ['max']);
  assert.equal(bad.out.verdict, 'FAIL');
});

// ------------------------------------------------------------------ no EU/t at or above 2^31 except c10, c11 and c13

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
  const gateRow = (r, n) => r.where.startsWith('gate.json') && r.name === n;
  const isC13 = (r) => gateRow(r, 'hold_sgr_a') && r.eut === 2 ** 33;
  const isMaxC14 = (r) => (gateRow(r, 'hold_sgr_a_probe') || gateRow(r, 'hold_nsc_belt')) && r.eut === 2 ** 33; // MAX-T1 gate c14, MAX-T2 gate c15
  const atTwo31 = (r) => (gateRow(r, 'hold_galactic_bulge') || gateRow(r, 'hold_sgr1806')) && r.eut === LONG;
  const out = rows.filter((r) => r.eut >= LONG && !isC13(r) && !isMaxC14(r) && !atTwo31(r)).map((r) => `${r.where}: ${r.eut} EU/t is at or above 2^31`);
  for (const n of ['hold_galactic_bulge', 'hold_sgr1806']) {
    const row = rows.find((r) => gateRow(r, n));
    if (!row) out.push(`gate.json: the ${n} row is missing`);
    else if (row.eut !== LONG) out.push(`gate.json: ${n} is ${row.eut} EU/t, the design says 2^31`);
  }
  const c13 = rows.find((r) => gateRow(r, 'hold_sgr_a'));
  if (!c13) out.push('gate.json: the c13 row (hold_sgr_a) is missing');
  else if (c13.eut !== 2 ** 33) out.push(`gate.json: c13 is ${c13.eut} EU/t, the design says 2^33`);
  return out;
}

test('real pack: no table EU/t at or above 2^31 except c10, c11 (2^31) and c13 (2^33)', (t) => {
  const rows = tableEut();
  t.diagnostic(`${rows.length} table EU/t values, max ${Math.max(...rows.map((r) => r.eut))}`);
  assert.ok(rows.length > 0);
  assert.deepEqual(eutProblems(rows), []);
});

test('planted: an OpV row at 2^31 EU/t other than c10, c11 and c13 fails the EU/t ceiling', () => {
  const p = eutProblems([...tableEut(), { where: 'planted.json.rows[0]', name: 'x', eut: LONG }]);
  assert.deepEqual(p, [`planted.json.rows[0]: ${LONG} EU/t is at or above 2^31`]);
});

// ------------------------------------------------------------------ re-count of docs/eras/opv.md (lines, crossings)

const section = (md, head) => {
  const start = md.indexOf(head);
  assert.ok(start >= 0, head);
  return md.slice(start, md.indexOf('\n## ', start + 5));
};
const cells = (l) => l.split('|').map((s) => s.trim());
function recount() {
  const md = fs.readFileSync(path.join(ROOT, 'docs', 'eras', 'opv.md'), 'utf8');
  const rows = section(md, '## New process lines').split('\n').filter((l) => /^\| \d+ \|/.test(l)).map(cells);
  const stated = rows.map((r) => Number(r[3]));
  const cr = rows.map((r) => Number(r[4]));
  const cx = section(md, '## Crossings').split('\n').filter((l) => l.startsWith('|') && !l.startsWith('|---') && !l.startsWith('| Era')).map(cells);
  const total = cx.find((r) => r[1].startsWith('**'));
  const eraRows = cx.filter((r) => r !== total);
  return {
    lines: rows.length, numbered: rows.every((r, i) => Number(r[1]) === i + 1), stated,
    steps: stated.reduce((a, b) => a + b, 0), crSum: cr.reduce((a, b) => a + b, 0),
    eras: Object.fromEntries(eraRows.map((r) => [r[1], Number(r[2])])),
    machines: eraRows.reduce((n, r) => n + r[3].split(/,\s*/).length, 0),
    total: total ? Number(total[2].replace(/\*/g, '')) : NaN, totalText: total?.[3] || '',
  };
}

test('re-count: the design\'s lines, steps and crossings with UIV or older (reported as found, within 3 of the stated figures)', (t) => {
  const c = recount();
  const avg = c.steps / c.lines;
  const eraSum = Object.values(c.eras).reduce((a, b) => a + b, 0);
  const four = c.stated.filter((s) => s === 4).length;
  t.diagnostic(`lines ${c.lines}, steps ${c.steps}, average ${avg.toFixed(2)}, min ${Math.min(...c.stated)}, lines of exactly 4 steps ${four}`);
  t.diagnostic(`crossings: Cr column ${c.crSum}, era rows ${eraSum} ${JSON.stringify(c.eras)}, total row ${c.total}, machines met ${c.machines}`);
  assert.ok(c.lines > 0 && eraSum > 0, 'the tables were found');
  assert.ok(c.numbered, 'lines numbered 1..n');
  assert.ok(c.stated.every((s) => s >= 4), 'no line under 4 steps');
  assert.ok(Math.abs(c.lines - 45) <= 3, `45 lines stated, ${c.lines} found`);
  assert.ok(Math.abs(c.steps - 216) <= 3, `216 steps stated, ${c.steps} found`);
  assert.ok(Math.abs(four - 19) <= 3, `19 four-step lines stated, ${four} found`);
  assert.ok(Math.abs(c.crSum - 141) <= 3, `141 crossings stated, ${c.crSum} in the Cr column`);
  assert.equal(c.total, eraSum, 'the Crossings total is the sum of its rows');
  assert.ok(Math.abs(c.machines - 49) <= 3, `49 machines stated, ${c.machines} named`);
});
