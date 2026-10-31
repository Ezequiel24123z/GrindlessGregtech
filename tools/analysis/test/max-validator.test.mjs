// MAX-C1: the validator's -Tier max. The real tiers/max.json (substages max, max-sgra after gate c14 and max-nsc after gate c15), F1's ids at their
// substage, planted failures on a mini pack, the table EU/t ceiling, the re-count of docs/eras/max.md, and the audit checks the engine has no
// check kind for (generator balance and the 2^30 cap, consumer rows on generator types, registered recipe types, chanced wear, the 7 F1 blocks,
// the component thresholds, MAX+ hooks, partSorter, repeat circuits, the last recipe's draw against one max_smes_cell).
// The static pack run is a stand-in: it records recipes but not durations or EUt, and its voltage table is 8*4^i, so GTValues.V[14] and VA[14] are
// both 2^31 there. Durations therefore come from the script text, EU from tickInputs/tickOutputs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTierConfig } from '../lib/config.mjs';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { gi, gt, mkDump, run, verdicts } from './helpers.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIERS = path.join(HERE, '..', 'tiers');
const ROOT = path.join(HERE, '..', '..', '..');
const PACK = path.join(ROOT, 'pack');
const TABLES = path.join(PACK, 'kubejs', 'data', 'grindless', 'tables');
const SERVER = path.join(PACK, 'kubejs', 'server_scripts', 'grindless', 'max');
const STARTUP = path.join(PACK, 'kubejs', 'startup_scripts', 'grindless', 'max');
const max = () => loadTierConfig({ tier: 'max' }, TIERS).raw;
const maxFile = () => JSON.parse(fs.readFileSync(path.join(TIERS, 'max.json'), 'utf8'));
const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
const MAX_GROUPS = ['max-home', 'max-sgra-items', 'max-nsc-items'];
const readDir = (d) => Object.fromEntries(fs.readdirSync(d).filter((f) => f.endsWith('.js')).map((f) => [f, fs.readFileSync(path.join(d, f), 'utf8')]));
const SERVER_SRC = () => readDir(SERVER);
const STARTUP_SRC = () => readDir(STARTUP);
const MULTIBLOCKS = {
  rydberg_array_works: 'rydberg_assembly', atom_interferometer_works: 'atom_interferometry', membrane_line: 'membrane_rolling', gene_ark: 'genome_archiving',
  photon_ring_imager: 'photon_ring_imaging', geroch_winch: 'geroch_power', mass_stream_injector: 'mass_stream_injection', mirror_shell: 'black_hole_bomb',
  cluster_light_furnace: 'cluster_light_smelting', accretion_feeder: 'accretion_power',
};

// ------------------------------------------------------------------ the real config

test('real tiers (max): substages in order after OpV, with the Sgr A* and belt resources at their era', () => {
  const raw = max();
  assert.equal(raw.tier, 'max');
  assert.equal(maxFile().extends, 'opv');
  const at = (e) => raw.eraOrder.indexOf(e);
  for (const [a, b] of [['opv-terzan5', 'max'], ['max', 'max-sgra'], ['max-sgra', 'max-nsc']]) assert.ok(at(a) >= 0 && at(a) < at(b), `${a} before ${b}`);
  const res = byId(raw.eraResources);
  assert.equal(res.sgra.era, 'max-sgra');
  assert.deepEqual(res.sgra.dimensions, ['gcyr:black_hole_orbit']);
  assert.equal(res.nsc.era, 'max-nsc');
  assert.deepEqual(res.nsc.dimensions, ['grindless:nsc_belt']);
  assert.ok(res.max.items.includes('gtceu:max_*'), 'the OpV max resource is kept');
  const g = byId(raw.eraItems);
  assert.deepEqual(MAX_GROUPS.map((id) => g[id]?.era), ['max', 'max-sgra', 'max-nsc']);
  assert.equal(maxFile().world, undefined, 'MAX adds no hand-gathered source');
});

test('real tiers (max): the 10 multiblocks are machines with a declared package, each checked at its era (winch and imager-side at Sgr A*, the rest by the belt)', () => {
  const raw = max();
  const ids = Object.keys(raw.packages);
  const ms = maxFile().machines.filter((m) => !m.id);
  assert.deepEqual(ms.map((m) => m.machine.replace('gtceu:', '')).sort(), Object.keys(MULTIBLOCKS).sort());
  for (const m of ms) {
    assert.ok(ids.includes(m.package), `${m.machine}: package ${m.package} is not declared`);
    assert.deepEqual(m.types, [`gtceu:${MULTIBLOCKS[m.machine.replace('gtceu:', '')]}`], m.machine);
  }
  const where = {};
  for (const g of raw.eraItems.filter((x) => MAX_GROUPS.includes(x.id))) for (const it of g.items) (where[it] ??= []).push(g.era);
  for (const n of Object.keys(MULTIBLOCKS)) assert.ok(where[`m:gtceu:${n}`], `m:gtceu:${n} is checked at an era`);
  assert.equal(where['m:gtceu:geroch_winch'][0], 'max-sgra');
  assert.equal(where['m:gtceu:mirror_shell'][0], 'max-nsc');
  assert.equal(where['m:gtceu:gene_ark'][0], 'max');
});

test('real tiers (max): every package is declared and lands; every reference names a declared package', () => {
  const raw = max();
  const f = maxFile();
  for (const [id, p] of Object.entries(f.packages)) assert.ok(p.landedWhen?.length > 0 || p.landedWhenAny?.length > 0, `${id} has no landing mark`);
  const ids = Object.keys(raw.packages);
  for (const x of [...f.machines, ...f.synthetic, ...f.targets, ...f.eraResources, ...f.eraItems]) {
    for (const p of [x.package].flat().filter(Boolean)) assert.ok(ids.includes(p), `${x.id || x.machine}: package ${p} is not declared`);
  }
});

test('real tiers (max): the gate rows, the jumps, the Sgr A* and belt sites and the 2^33 gate rating', () => {
  const t = byId(max().targets);
  for (const id of ['gate-hold-sgr-a-probe', 'gate-hold-nsc-belt', 'gate-sgra-orbit', 'gate-nsc-belt', 'gate-gc-relay-probe', 'gate-nsc-belt-seed']) assert.ok(t[id], id);
  assert.deepEqual(t['site-max-sgra'].dimensions, ['gcyr:black_hole_orbit']);
  assert.deepEqual(t['site-max-nsc'].dimensions, ['grindless:nsc_belt']);
  assert.deepEqual(t['site-max-sgra'].types.sort(), ['gtceu:accretion_power', 'gtceu:black_hole_bomb', 'gtceu:geroch_power', 'gtceu:mass_stream_injection', 'gtceu:photon_ring_imaging']);
  const syn = byId(max().synthetic);
  assert.deepEqual(syn['sgra-jump'].produces, ['dim:gcyr:black_hole_orbit']);
  assert.deepEqual(syn['nsc-jump'].produces, ['dim:grindless:nsc_belt']);
  assert.ok(syn['wireless-max'].produces.includes('eu:max'));
  const gate = maxFile().machines.find((m) => m.id === 'gtceu:warp_gate@max');
  assert.equal(gate.maxEUt, 2 ** 33, 'the warp gate is rated for c14 and c15');
  for (const id of ['site-warp-gate']) assert.ok(t[id], id);
});

test('real tiers (max): exemptions are listed with a reason in max.json', () => {
  const note = maxFile().note;
  for (const x of ['gc_relay_probe', 'mirror_shell_segment', 'max_optical_table_casing', 'membrane_roller_casing', 'geroch_drum_casing', 'stream_turn_casing', 'max_machine_hull']) assert.ok(note.includes(x), `exemption ${x}`);
});

// ------------------------------------------------------------------ F1's ids at their substage

const IDS = () => JSON.parse(fs.readFileSync(path.join(TABLES, 'max_ids.json'), 'utf8'));

test('F1: every item and block of the id table is checked in a MAX group (glob-aware); known gaps are reported', (t) => {
  const raw = max();
  const where = {};
  const globs = [];
  for (const g of raw.eraItems.filter((x) => MAX_GROUPS.includes(x.id))) for (const it of g.items) { (where[it] ??= []).push(g.id); if (it.endsWith('*')) globs.push(it.slice(0, -1)); }
  const ids = IDS();
  const names = [...ids.foundation.items, ...ids.foundation.blocks].map((n) => (n.includes(':') ? n : `grindless:${n}`));
  const made = new Set(pack().recs.flatMap(outs));
  const covered = (n) => where[n] || globs.some((g) => n.startsWith(g)) || made.has(n);
  const missing = names.filter((n) => !covered(n));
  t.diagnostic(`F1: ${ids.foundation.items.length} items, ${ids.foundation.blocks.length} blocks; unchecked: ${missing.join(', ') || 'none'}`);
  // Ids with no era group are covered by a recipe that makes them. max_epilogue has no recipe or source; max_ids.json lists grindless:max_parallel_hatch where the real id is gtceu:max_parallel_hatch (covered by the glob).
  assert.deepEqual(missing.sort(), ['grindless:max_epilogue']);
  const at = (id) => where[id]?.[0];
  assert.equal(at('grindless:nsc_planetesimal'), 'max-nsc-items');
  assert.equal(at('grindless:sgr_a_spin_map'), 'max-sgra-items');
  assert.equal(at('grindless:gc_relay_probe'), 'max-home');
  for (const n of ['electric_motor', 'electric_pump', 'electric_piston', 'robot_arm', 'emitter', 'fluid_regulator', 'conveyor_module', 'sensor', 'field_generator']) assert.equal(at(`grindless:max_${n}`), 'max-home', n);
});

// ------------------------------------------------------------------ planted cases on a mini pack (the real era data)

function eraPack(groupId, resourceId, consumer) {
  const raw = max();
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
    tier: 'max', eraOrder: raw.eraOrder,
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ore', 't:proc'] }],
    machines: [{ machine: 't:proc', types: ['t:proc'] }],
    targets: [{ id: 'gadget', item: 't:gadget' }],
    eraResources: [res],
    eraItems: [{ id: group.id, era: group.era, label: group.label, items: ['t:gadget'] }],
  };
  return run(dump, cfg);
}
const grp = (r, id) => r.out.eras.groups.find((x) => x.group.id === id);

test('planted: a Sgr A* item read by a home recipe before max-sgra is an era violation (the real era order and resource)', () => {
  assert.equal(grp(eraPack('max-home', 'sgra', null), 'max-home').violations.length, 0);
  const bad = eraPack('max-home', 'sgra', 'grindless:sgr_a_spin_map');
  assert.deepEqual(grp(bad, 'max-home').violations.map((v) => v.item), ['t:gadget']);
  assert.deepEqual(grp(bad, 'max-home').violations[0].resources.map((x) => x.id), ['sgra']);
  assert.equal(bad.out.verdict, 'FAIL');
  assert.equal(grp(eraPack('max-sgra-items', 'sgra', 'grindless:sgr_a_spin_map'), 'max-sgra-items').violations.length, 0);
});

test('planted: a belt item read by a Sgr A* recipe before max-nsc is an era violation', () => {
  const bad = eraPack('max-sgra-items', 'nsc', 'grindless:nsc_planetesimal');
  assert.deepEqual(grp(bad, 'max-sgra-items').violations.map((v) => v.item), ['t:gadget']);
  assert.equal(grp(eraPack('max-nsc-items', 'nsc', 'grindless:nsc_planetesimal'), 'max-nsc-items').violations.length, 0);
});

test('planted: a MAX recipe on an Earth-only site fails the real site target; the gate recipe passes (mini pack with the real targets)', () => {
  const site = byId(max().targets)['site-max-nsc'];
  const cfg = { tier: 'max', world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ore', 't:proc'] }], machines: [{ machine: 't:proc', types: ['gtceu:cluster_light_smelting'] }], targets: [site] };
  const ok = gt('grindless:cluster_light_smelting/x', 'gtceu:cluster_light_smelting', { ins: [gi('t:ore')], outs: [gi('t:out')], conditions: [{ type: 'dimension', dimension: 'grindless:nsc_belt' }] });
  const bad = gt('grindless:cluster_light_smelting/x', 'gtceu:cluster_light_smelting', { ins: [gi('t:ore')], outs: [gi('t:out')], conditions: [{ type: 'dimension', dimension: 'minecraft:overworld' }] });
  assert.equal(verdicts(run(mkDump({ recipes: [ok], items: ['t:ore', 't:proc', 't:out'] }), cfg).out.gate)['site-max-nsc'], 'PASS');
  assert.equal(verdicts(run(mkDump({ recipes: [bad], items: ['t:ore', 't:proc', 't:out'] }), cfg).out.gate)['site-max-nsc'], 'FAIL');
});

// ------------------------------------------------------------------ no EU/t at or above 2^31 except gate c14, gate c15 and the mirror shell's c3

const LONG = 2 ** 31;
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
  const isOld = (r) => (gateRow(r, 'hold_sgr_a') && r.eut === 2 ** 33) || ((gateRow(r, 'hold_galactic_bulge') || gateRow(r, 'hold_sgr1806')) && r.eut === LONG);
  const isMax = (r) => (gateRow(r, 'hold_sgr_a_probe') || gateRow(r, 'hold_nsc_belt')) && r.eut === 2 ** 33;
  const out = rows.filter((r) => r.eut >= LONG && !isOld(r) && !isMax(r)).map((r) => `${r.where}: ${r.eut} EU/t is at or above 2^31`);
  for (const n of ['hold_sgr_a_probe', 'hold_nsc_belt']) {
    const row = rows.find((r) => gateRow(r, n));
    if (!row) out.push(`gate.json: the ${n} row is missing`);
    else if (row.eut !== 2 ** 33) out.push(`gate.json: ${n} is ${row.eut} EU/t, the design says 2^33`);
  }
  return out;
}

test('real pack: no table EU/t at or above 2^31 except the old gates (c10, c11, c13) and MAX gates c14 and c15 (2^33)', (t) => {
  const rows = tableEut();
  t.diagnostic(`${rows.length} table EU/t values, max ${Math.max(...rows.map((r) => r.eut))}`);
  assert.deepEqual(eutProblems(rows), []);
});

test('planted: a MAX table row at 2^31 EU/t fails the EU/t ceiling', () => {
  assert.deepEqual(eutProblems([...tableEut(), { where: 'planted.json.rows[0]', name: 'x', eut: LONG }]), [`planted.json.rows[0]: ${LONG} EU/t is at or above 2^31`]);
});

// ------------------------------------------------------------------ the static pack run: one shared run for the audit checks

let RUN;
const pack = () => {
  if (!RUN) {
    const r = runPackScripts(PACK);
    const recs = r.docs.recipes.recipes;
    RUN = { r, recs, errors: r.errors.filter((e) => /max[\\/]/.test(JSON.stringify(e))) };
  }
  return RUN;
};
const itemId = (x) => {
  const c = x.content;
  const i = c.ingredient || c;
  if (c.type === 'gtceu:circuit') return `circuit:${c.configuration}`;
  if (i.item) return i.item;
  if (i.tag) return `#${i.tag}`;
  if (i.value?.item) return i.value.item;
  if (i.value?.tag) return `#${i.value.tag}`;
  return JSON.stringify(i);
};
const cnt = (x) => x.content.count ?? 1;
const itemsOf = (side) => (side || []);
const outs = (r) => itemsOf(r.j.outputs?.item).map(itemId);
const ins = (r) => itemsOf(r.j.inputs?.item).map(itemId);
const makers = (recs, id) => recs.filter((r) => outs(r).includes(id));
const rec = (id) => pack().recs.find((r) => r.i === id);
const eu = (r, side) => (r.j[side]?.eu || []).map((x) => x.content);
const typeOf = (r) => r.t.replace(/^gtceu:/, '');
const recsOfType = (type) => pack().recs.filter((r) => typeOf(r) === type);

test('static run: the MAX scripts load without errors', () => {
  assert.deepEqual(pack().errors, []);
  assert.ok(pack().recs.length > 3000);
});

// ------------------------------------------------------------------ the stand-in's 2^31 is VA[14]; the real ceiling is checked on the script text and the dump rows

test('static run: no MAX recipe above 2^31 EU/t except gate c14 and c15 (2^33) and the mirror shell c3 (2^35); no generator above 2^30', () => {
  const gate = new Set(['grindless:warp_gate/hold_sgr_a_probe', 'grindless:warp_gate/hold_nsc_belt']);
  const old = new Set(['grindless:warp_gate/hold_sgr_a', 'grindless:warp_gate/hold_galactic_bulge', 'grindless:warp_gate/hold_sgr1806']);
  const bad = [];
  for (const r of pack().recs) {
    for (const e of eu(r, 'tickInputs')) {
      if (e > LONG && !gate.has(r.i) && !old.has(r.i) && r.i !== 'grindless:black_hole_bomb/universe_seed') bad.push(`${r.i}: ${e}`);
    }
    for (const e of eu(r, 'tickOutputs')) if (e > 2 ** 30) bad.push(`${r.i}: generator ${e} above 2^30`);
  }
  assert.deepEqual(bad, []);
  assert.deepEqual(eu(rec('grindless:black_hole_bomb/universe_seed'), 'tickInputs'), [2 ** 35]);
  for (const id of gate) assert.equal(eu(rec(id), 'tickInputs')[0], 2 ** 33, id);
  // the script text names no literal at or above 2^31 either (V_MAX x 16 is an expression)
  const lit = [];
  for (const [f, src] of Object.entries({ ...SERVER_SRC() })) for (const m of src.matchAll(/\b(\d{10,}|\d{1,3}(?:_\d{3}){3,})\b/g)) if (Number(m[1].replace(/_/g, '')) >= LONG) lit.push(`${f}: ${m[1]}`);
  assert.deepEqual(lit.filter((l) => !/gate_gc|gate_nsc|gate_sgra/.test(l)), []);
});

// ------------------------------------------------------------------ generator balance, consumer rows on generator types

function stated(file) {
  const src = SERVER_SRC()[file];
  const g = src.match(/gives 2\^30 x ([\d,]+) = ([\d.]+)e12 EU: about ([\d.]+)x/);
  const c = src.match(/costs? about ([\d.]+)e12 EU/);
  assert.ok(g && c, `${file}: balance comment`);
  return { dur: Number(g[1].replace(/,/g, '')), gives: Number(g[2]) * 1e12, cost: Number(c[1]) * 1e12, ratio: Number(g[3]) };
}

test('generator balance 1.3-2.5x: winch (D3), feeder (E1) and mirror shell c1 (G1); the cost is the design\'s stated figure along the line', (t) => {
  const rows = [['winch.js', 'grindless:geroch_power/geroch_canister_lowering', 2400], ['feeder.js', 'grindless:accretion_power/slag_pellet_burn', 2400], ['shell.js', 'grindless:black_hole_bomb/vent_wave_packet', 4800]];
  for (const [file, id, dur] of rows) {
    const s = stated(file);
    const row = rec(id);
    assert.ok(row, id);
    assert.deepEqual(eu(row, 'tickOutputs'), [2 ** 30], `${id} generates 2^30 EU/t`);
    assert.equal(eu(row, 'tickInputs').length, 0, `${id} is not a consumer`);
    assert.equal(s.dur, dur, `${file} comment names the duration`);
    assert.ok(new RegExp(`duration: ${dur}\\b`).test(SERVER_SRC()[file]), `${file}: duration ${dur} is in the row`);
    assert.ok(Math.abs(s.gives - 2 ** 30 * dur) / s.gives < 0.01, `${file}: stated output ${s.gives}`);
    const ratio = (2 ** 30 * dur) / s.cost;
    t.diagnostic(`${id}: ${(2 ** 30 * dur).toExponential(3)} EU out / ${s.cost.toExponential(2)} EU stated cost = ${ratio.toFixed(2)}x (comment ${s.ratio}x)`);
    assert.ok(ratio >= 1.3 && ratio <= 2.5, `${id} balance ${ratio}`);
    assert.ok(Math.abs(ratio - s.ratio) < 0.1, `${file}: stated ratio ${s.ratio} against ${ratio.toFixed(2)}`);
  }
});

test('generator types hold only EU-out rows; the mirror shell is the one mixed machine (c1 out, c2 and c3 in)', () => {
  const src = STARTUP_SRC();
  const gens = Object.entries(src).filter(([, s]) => /setEUIO\('out'\)/.test(s)).map(([f]) => f).sort();
  assert.deepEqual(gens, ['feeder.js', 'winch.js']);
  for (const f of gens) assert.ok(/G\.generators\.configure|generators\.configure/.test(src[f]), `${f} configures the generator modifier`);
  for (const type of ['geroch_power', 'accretion_power']) {
    const rows = recsOfType(type);
    assert.ok(rows.length >= 1, type);
    for (const r of rows) {
      assert.equal(eu(r, 'tickInputs').length, 0, `${r.i} consumes EU on a generator type`);
      assert.ok(eu(r, 'tickOutputs').length === 1, `${r.i} has no EU-out`);
    }
  }
  const bomb = Object.fromEntries(recsOfType('black_hole_bomb').map((r) => [r.i.split('/')[1], r]));
  assert.equal(eu(bomb.vent_wave_packet, 'tickOutputs').length, 1);
  assert.equal(eu(bomb.vent_wave_packet, 'tickInputs').length, 0);
  for (const n of ['final_spin_map', 'universe_seed']) {
    assert.equal(eu(bomb[n], 'tickOutputs').length, 0, `${n} must consume`);
    assert.equal(eu(bomb[n], 'tickInputs').length, 1, `${n} must consume`);
  }
  assert.ok(/setEUIO\('both'\)/.test(src['shell.js']));
});

// ------------------------------------------------------------------ the last recipe's draw against one max_smes_cell

test('last recipe: 2^35 x 1,200 t = 41,231,686,041,600 EU against one charged max_smes_cell (64,424,509,440,000 EU) and case 14\'s 2 A cap', (t) => {
  const draw = 2 ** 35 * 1200;
  assert.equal(draw, 41231686041600);
  const wire = fs.readFileSync(path.join(TABLES, 'wireless_energy.json'), 'utf8');
  assert.ok(/max_smes_cell/.test(wire) && wire.includes('64424509440000'), 'the cell holds 64,424,509,440,000 EU');
  assert.ok(draw < 64424509440000, 'one cell covers the draw');
  assert.ok(2 ** 35 <= 42949672960, 'the case-14 2 A cap carries 2^35 EU/t');
  assert.ok(/duration: 1200/.test(SERVER_SRC()['shell.js']));
  t.diagnostic(`draw / cell = ${(draw / 64424509440000).toFixed(4)}; storage-only one-shot (verdict: accept under principle 8, as c13 was)`);
});

// ------------------------------------------------------------------ registered recipe types

const GTM = new Set(['assembler', 'laser_engraver', 'assembly_line', 'macerator', 'bender', 'chemical_bath', 'canner', 'chemical_reactor', 'autoclave', 'wiremill', 'extruder', 'arc_furnace',
  'electric_blast_furnace', 'centrifuge', 'mixer', 'compressor', 'cutter', 'forming_press', 'lathe', 'sifter', 'extractor', 'electrolyzer', 'distillery', 'fluid_solidifier', 'packer', 'polarizer',
  'brewery', 'fermenter', 'thermal_centrifuge', 'ore_washer', 'implosion_compressor', 'vacuum_freezer', 'large_chemical_reactor', 'circuit_assembler', 'alloy_smelter', 'forge_hammer',
  'plasma_arc_furnace', 'electromagnetic_separator', 'fluid_heater', 'gas_centrifuge', 'cracker', 'distillation_tower', 'macerator', 'dehydrator']);

test('recipe types named in the MAX server scripts are registered (GTM 7.5.3 or created in startup scripts)', (t) => {
  const startup = new Set();
  const all = path.join(PACK, 'kubejs', 'startup_scripts', 'grindless');
  const walkJs = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walkJs(path.join(d, e.name)) : e.name.endsWith('.js') ? [path.join(d, e.name)] : []));
  for (const f of walkJs(all)) for (const m of fs.readFileSync(f, 'utf8').matchAll(/(?:event\.create\(|type:\s*|[A-Z_]+_TYPE\s*=\s*)'([a-z0-9_]+)'/g)) startup.add(m[1]);
  const named = new Map();
  const add = (n, f) => named.set(n, [...(named.get(n) || []), f]);
  for (const [f, s] of Object.entries(SERVER_SRC())) {
    for (const m of s.matchAll(/event\.recipes\.gtceu\.([a-z0-9_]+)/g)) add(m[1], f);
    for (const m of s.matchAll(/recipes\.gtceu\['([a-z0-9_]+)'\]/g)) add(m[1], f);
    for (const m of s.matchAll(/\btype:\s*'([a-z0-9_]+)'/g)) add(m[1], f);
    if (f === 'cuts.js') for (const m of s.matchAll(/STRAND_TYPES\s*=\s*\[([^\]]*)\]/g)) for (const x of m[1].matchAll(/'([a-z0-9_]+)'/g)) add(x[1], f);
  }
  const unknown = [...named.keys()].filter((n) => !GTM.has(n) && !startup.has(n)).sort();
  t.diagnostic(`${named.size} types named; unverifiable: ${unknown.join(', ') || 'none'}`);
  assert.ok(!named.has('assembly_hall'), 'assembly_hall is a machine, not a recipe type');
  assert.deepEqual(unknown, []);
  for (const t2 of Object.values(MULTIBLOCKS)) assert.ok(startup.has(t2), `${t2} is created in startup scripts`);
});

// ------------------------------------------------------------------ chanced wear on the generators

test('chanced wear: each chanced generator input has a spent output at the same ratio and a rework row that consumes it', () => {
  const chance = (r, side, id) => (r.j[side].item.find((x) => itemId(x) === id)?.chance ?? null);
  const cases = [
    ['grindless:geroch_power/geroch_canister_lowering', [['grindless:horizon_tether', 'grindless:spent_tether_segment']], 128],
    ['grindless:accretion_power/slag_pellet_burn', [['grindless:xuv_collector_panel', 'grindless:spent_collector_panel', 64], ['grindless:wolter_mirror_module', 'grindless:spent_wolter_module', 128]]],
  ];
  const checks = [
    ['grindless:geroch_power/geroch_canister_lowering', 'grindless:horizon_tether', 'grindless:spent_tether_segment'],
    ['grindless:accretion_power/slag_pellet_burn', 'grindless:xuv_collector_panel', 'grindless:spent_collector_panel'],
    ['grindless:accretion_power/slag_pellet_burn', 'grindless:wolter_mirror_module', 'grindless:spent_wolter_module'],
  ];
  assert.ok(cases.length === 2);
  for (const [id, inp, spent] of checks) {
    const r = rec(id);
    const ci = chance(r, 'inputs', inp);
    const co = chance(r, 'outputs', spent);
    assert.ok(ci !== null && ci > 0 && ci < 10000, `${id}: ${inp} is chanced (${ci})`);
    assert.equal(co, ci, `${id}: ${spent} chance equals the wear chance`);
    const reworks = pack().recs.filter((x) => ins(x).includes(spent));
    assert.ok(reworks.length >= 1, `${spent} has a rework row`);
  }
});

// ------------------------------------------------------------------ the 7 F1 blocks

test('the 7 F1 MAX blocks each have a real recipe whose inputs are not an output of the machine that uses them', (t) => {
  const BLOCKS = {
    max_optical_table_casing: ['rydberg_assembly', 'atom_interferometry', 'photon_ring_imaging', 'cluster_light_smelting'], membrane_roller_casing: ['membrane_rolling'],
    geroch_drum_casing: ['geroch_power'], stream_turn_casing: ['mass_stream_injection'], mirror_shell_segment: ['black_hole_bomb'], stream_bundle_block: ['black_hole_bomb'],
    feeder_coil_casing: ['accretion_power'],
  };
  const { recs } = pack();
  for (const [b, usedBy] of Object.entries(BLOCKS)) {
    const mk = makers(recs, `grindless:${b}`);
    assert.ok(mk.length >= 1, `${b} has no recipe`);
    const own = new Set(usedBy.flatMap((u) => recsOfType(u).flatMap(outs)));
    for (const r of mk) {
      const self = ins(r).filter((i) => own.has(i));
      assert.deepEqual(self, [], `${b} (${r.i}) needs an output of the machine that uses it`);
      t.diagnostic(`${b}: ${r.i} on ${r.t}`);
    }
  }
  assert.equal(makers(recs, 'grindless:mirror_shell_segment')[0].t.replace('gtceu:', ''), 'swarm_segment');
});

// ------------------------------------------------------------------ components, circuits, hooks, partSorter

const TIERS_LE_OPV = '(lv|mv|hv|ev|iv|luv|zpm|uv|uhv|uev|uiv|uxv|opv)';
const OLD_COMPONENT = new RegExp(`^gtceu:${TIERS_LE_OPV}_(electric_motor|electric_pump|conveyor_module|electric_piston|robot_arm|emitter|sensor|field_generator)$`);
const OLD_CIRCUIT = new RegExp(`^#gtceu:circuits/${TIERS_LE_OPV}$`);

test('no MAX controller, hatch or MAX component recipe takes an OpV-or-lower component or circuit (gc_relay_probe excepted)', (t) => {
  const { recs } = pack();
  const isMax = (r) => outs(r).some((o) => /^(gtceu|grindless):max_/.test(o) || Object.keys(MULTIBLOCKS).some((m) => o === `gtceu:${m}`));
  const rows = recs.filter((r) => isMax(r) && r.i !== 'grindless:assembly_line/gc_relay_probe' && r.i !== 'grindless:assembly_line/max_machine_casing');
  assert.ok(rows.length >= 30, `${rows.length} MAX rows`);
  const bad = [];
  for (const r of rows) for (const i of ins(r)) if (OLD_COMPONENT.test(i) || OLD_CIRCUIT.test(i)) bad.push(`${r.i}: ${i}`);
  t.diagnostic(`${rows.length} MAX output rows checked`);
  assert.deepEqual(bad, []);
  const probe = rec('grindless:assembly_line/gc_relay_probe');
  assert.ok(ins(probe).includes('gtceu:opv_sensor'), 'the probe is the exempt OpV-stage travel item');
});

test('component thresholds: each of the 10 controllers has at least 4 MAX circuits; the 7 with MAX components have 8 or more from 3 kinds', (t) => {
  const COMP = /^grindless:max_(electric_motor|electric_pump|electric_piston|robot_arm|emitter|fluid_regulator|conveyor_module|sensor|field_generator)$/;
  const report = [];
  for (const m of Object.keys(MULTIBLOCKS)) {
    const r = rec(`grindless:assembly_line/${m}`);
    assert.ok(r, `${m} has an assembly line recipe`);
    const items = r.j.inputs.item;
    const circuits = items.filter((x) => itemId(x) === '#gtceu:circuits/max').reduce((s, x) => s + cnt(x), 0);
    const comps = items.filter((x) => COMP.test(itemId(x)));
    const total = comps.reduce((s, x) => s + cnt(x), 0);
    report.push(`${m}: ${circuits} circuits, ${total} components of ${new Set(comps.map(itemId)).size} kinds`);
    assert.ok(ins(r).includes('gtceu:max_machine_hull'), `${m} uses the MAX hull`);
    assert.ok(circuits >= 4, `${m}: ${circuits} MAX circuits`);
    assert.ok(total >= 4, `${m}: ${total} MAX components`);
  }
  t.diagnostic(report.join('; '));
});

test('no MAX recipe consumes a MAX+ hook (universe_seed, GT-- max casing and converter)', () => {
  for (const hook of ['grindless:universe_seed', 'gtnn:component_assline_casing_max', 'gtmutils:max_64a_energy_converter']) {
    assert.deepEqual(pack().recs.filter((r) => ins(r).includes(hook)).map((r) => r.i), [], hook);
  }
});

test('partSorter: no MAX multiblock takes ordered inputs, so none needs one (vacuously total)', () => {
  for (const [f, s] of Object.entries(STARTUP_SRC())) assert.ok(!/partSorter|ordered/i.test(s), `${f} orders its inputs`);
});

// ------------------------------------------------------------------ mram_stack_wafer, shared-table repeat circuits, emi_coverage

test('mram_stack_wafer has two makers (c2 and c20) with different inputs', (t) => {
  const mk = makers(pack().recs, 'grindless:mram_stack_wafer');
  t.diagnostic(mk.map((r) => r.i).join(', '));
  assert.equal(mk.length, 2);
  assert.notDeepEqual([...new Set(ins(mk[0]))].sort(), [...new Set(ins(mk[1]))].sort());
});

test('shared-table MAX rows: distinct item inputs from every other row on the same circuit number', (t) => {
  const groups = new Map();
  const walk = (o, where, file) => {
    if (Array.isArray(o)) {
      for (const row of o) if (row && typeof row === 'object' && Array.isArray(row.itemsIn) && row.circuit !== undefined) {
        const key = `${file}:${where}:${row.circuit}`;
        const set = [...new Set(row.itemsIn.map((x) => (typeof x === 'string' ? x : x.id)))].sort().join(',');
        groups.set(key, [...(groups.get(key) || []), { name: row.name, max: /^MAX-/.test(row._why || ''), set }]);
      }
      o.forEach((x, i) => walk(x, `${where}[${i}]`, file));
    } else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, `${where}.${k}`, file);
  };
  for (const f of fs.readdirSync(TABLES).filter((x) => x.endsWith('.json'))) walk(JSON.parse(fs.readFileSync(path.join(TABLES, f), 'utf8')), '', f);
  const clash = [];
  let maxRows = 0;
  for (const [key, rows] of groups) for (const r of rows.filter((x) => x.max)) {
    maxRows++;
    for (const o of rows) if (o !== r && o.set === r.set) clash.push(`${key}: ${r.name} and ${o.name}`);
  }
  t.diagnostic(`${maxRows} MAX rows over ${groups.size} circuit numbers`);
  assert.ok(maxRows > 0);
  assert.deepEqual(clash, []);
});

test('emi_coverage.json pendingUses names only C1 or T2 (C1\'s entry closes with max.json; T2\'s needs an out-of-bounds edit); pendingRoutes is empty', (t) => {
  const cov = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'emi_coverage.json'), 'utf8'));
  t.diagnostic(`pendingUses ${JSON.stringify(cov.pendingUses)}; pendingRoutes ${JSON.stringify(cov.pendingRoutes)}`);
  assert.deepEqual(cov.pendingRoutes ?? [], []);
  assert.ok(max().targets.some((x) => x.id === 'gate-nsc-belt-seed') && byId(max().synthetic)['nsc-jump'].capital.includes('grindless:nsc_belt_seed'));
});

// ------------------------------------------------------------------ re-count of docs/eras/max.md

const section = (md, head) => {
  const start = md.indexOf(head);
  assert.ok(start >= 0, head);
  const end = md.indexOf('\n## ', start + 5);
  return md.slice(start, end < 0 ? md.length : end);
};
const cells = (l) => l.split('|').map((s) => s.trim());
function recount() {
  const md = fs.readFileSync(path.join(ROOT, 'docs', 'eras', 'max.md'), 'utf8');
  const rows = md.split('\n').filter((l) => /^\| L\d+ \|/.test(l)).map(cells);
  const stated = rows.map((r) => Number(r[4]));
  const cr = rows.map((r) => Number(r[5]));
  const cx = section(md, '## Crossings').split('\n').filter((l) => l.startsWith('|') && !l.startsWith('|---') && !l.startsWith('| Era')).map(cells);
  const total = cx.find((r) => r[1].startsWith('**'));
  const eraRows = cx.filter((r) => r !== total);
  return {
    lines: rows.length, numbered: rows.every((r, i) => r[1] === `L${i + 1}`), stated, steps: stated.reduce((a, b) => a + b, 0), crSum: cr.reduce((a, b) => a + b, 0),
    eraSum: eraRows.reduce((s, r) => s + Number(r[2]), 0),
    machines: eraRows.reduce((n, r) => n + Number(r[3].match(/\((\d+)\)\s*$/)[1]), 0),
    total: Number(total[2].replace(/\*/g, '')), totalMachines: Number(total[3].replace(/\D/g, '')),
  };
}

test('re-count: 46 lines (232 steps), 167 crossings on 71 older machines (reported as found, never padded)', (t) => {
  const c = recount();
  t.diagnostic(`lines ${c.lines}, steps ${c.steps}, min ${Math.min(...c.stated)}; crossings: Cr column ${c.crSum}, era rows ${c.eraSum}, total row ${c.total}; machines ${c.machines} (stated ${c.totalMachines})`);
  assert.ok(c.numbered, 'lines numbered L1..Ln');
  assert.ok(c.stated.every((s) => s >= 4), 'no line under 4 steps');
  assert.ok(Math.abs(c.lines - 46) <= 3, `46 lines stated, ${c.lines} found`);
  assert.ok(Math.abs(c.steps - 232) <= 3, `232 steps stated, ${c.steps} found`);
  assert.ok(Math.abs(c.crSum - 167) <= 3, `167 crossings stated, ${c.crSum} in the Cr column`);
  assert.equal(c.total, c.eraSum, 'the Crossings total is the sum of its rows');
  assert.ok(Math.abs(c.machines - 71) <= 3, `71 machines stated, ${c.machines} named`);
});
