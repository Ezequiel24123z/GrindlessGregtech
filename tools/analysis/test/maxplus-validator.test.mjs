// XP-C1: the validator's -Tier maxplus, a pseudo-tier 15 in our tools only (docs/eras/maxplus.md, Validator). The real tiers/maxplus.json, the era lists and
// the quality ladder, then the audit checks the engine has no kind for: controller composition, the highest circuit of a row, the EU/t ceiling (2^39, the
// Hyperstargate dial at 2^43), generator balance, creative items, the final dimension, the shared circuits and the re-count of the design's Lines table.
// The static pack run is a stand-in: it records recipes but not durations or EUt, and its voltage table is 8*4^i (V[14] = 2^31). Durations come from script text.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTierConfig } from '../lib/config.mjs';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIERS = path.join(HERE, '..', 'tiers');
const ROOT = path.join(HERE, '..', '..', '..');
const PACK = path.join(ROOT, 'pack');
const SERVER = path.join(PACK, 'kubejs', 'server_scripts', 'grindless', 'maxplus');
const TABLES = path.join(PACK, 'kubejs', 'data', 'grindless', 'tables');
const maxplus = () => loadTierConfig({ tier: 'maxplus' }, TIERS).raw;
const file = () => JSON.parse(fs.readFileSync(path.join(TIERS, 'maxplus.json'), 'utf8'));
const src = (f) => fs.readFileSync(path.join(SERVER, f), 'utf8');
const IDS = () => JSON.parse(fs.readFileSync(path.join(TABLES, 'maxplus_ids.json'), 'utf8'));
const V_MAX = 2 ** 31;
const DIAL_EUT = V_MAX * 4096;
const CEILING = 2 ** 39;
const HYPERSTARGATE = 'gtceu:hyperstargate';
const CIRCUIT_ORDER = ['ulv', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max'];

let RUN;
const pack = () => {
  if (!RUN) {
    const r = runPackScripts(PACK);
    const here = (x) => /server_scripts[\\/]grindless[\\/]maxplus[\\/]/.test(String(r.recipeFiles?.get?.(x.i) ?? ''));
    const recs = r.docs.recipes.recipes;
    RUN = { r, recs, mp: recs.filter(here), errors: r.errors.filter((e) => /maxplus[\\/]/.test(JSON.stringify(e))) };
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
const outs = (r) => (r.j.outputs?.item || []).map(itemId);
const ins = (r) => (r.j.inputs?.item || []).map(itemId);
const eu = (r, side) => (r.j[side]?.eu || []).map((x) => x.content);
const typeOf = (r) => r.t.replace(/^gtceu:/, '');
const hasG1 = () => pack().r.registry.machines.has(HYPERSTARGATE);

// ------------------------------------------------------------------ the real config

test('real tiers (maxplus): extends max, ordered after it, every package declared and landing, every machine a MAX+ controller', () => {
  const raw = maxplus();
  const f = file();
  assert.equal(raw.tier, 'maxplus');
  assert.equal(f.extends, 'max');
  assert.ok(raw.eraOrder.indexOf('max') < raw.eraOrder.indexOf('maxplus'), 'max before maxplus');
  for (const [id, p] of Object.entries(f.packages)) assert.ok(p.landedWhen?.length > 0, `${id} has no landing mark`);
  const controllers = IDS().controllers.ids.map((n) => n.replace('gtceu:', ''));
  const named = f.machines.filter((m) => !m.id).map((m) => m.machine.replace('gtceu:', ''));
  const known = new Set([...controllers, 'hyperfactory']);
  for (const n of named) assert.ok(known.has(n), `${n} is not a MAX+ controller`);
  // horizon_capacitor_bank has no recipe type (storage only); hyperfactory is the mega family's member, not one of the 17
  const expected = controllers.filter((n) => n !== 'horizon_capacitor_bank');
  assert.deepEqual(named.filter((n) => n !== 'hyperfactory').sort(), expected.filter((n) => n !== 'hyperfactory').sort(), 'every MAX+ controller with a recipe type is a machine');
  for (const m of f.machines) assert.ok(raw.packages[m.package], `${m.machine}: package ${m.package} is not declared`);
  for (const x of ['ig_relay_probe', 'creative', 'capacitor_bank']) assert.ok(f.note.includes(x), `the note keeps the ${x} exemption`);
});

// ------------------------------------------------------------------ static run

test('static run: the MAX+ scripts load without errors and the run finds MAX+ recipes', () => {
  assert.deepEqual(pack().errors, []);
  assert.ok(pack().mp.length > 250, `${pack().mp.length} MAX+ recipes`);
});

test('controllers: at least 8 maxplus_* components from 3 families and 4 horizon_processor (bootstrap pair: MAX parts and 4 stream_bundle)', (t) => {
  const { recs, r } = pack();
  const ids = IDS().controllers.ids.map((n) => n.replace('gtceu:', ''));
  const bootstrap = new Set(['condensate_refinery', 'bound_matter_press']);
  const checked = [];
  for (const n of ids) {
    const rows = recs.filter((x) => outs(x).includes(`gtceu:${n}`) && typeOf(x) === 'assembly_line');
    if (!rows.length) {
      assert.ok(n === 'hyperstargate', `${n} has no assembly line row`);
      continue;
    }
    const row = rows[0];
    const has = (re) => (row.j.inputs?.item || []).filter((x) => re.test(itemId(x))).reduce((s, x) => s + cnt(x), 0);
    assert.ok(r.registry.machines.has(`gtceu:${n}`), n);
    checked.push(n);
    if (bootstrap.has(n)) {
      assert.ok(has(/stream_bundle$/) >= 4, `${n}: 4 stream_bundle`);
      continue;
    }
    assert.ok(has(/^#gtceu:circuits\/maxplus$/) >= 4, `${n}: 4 horizon_processor`);
    const comps = (row.j.inputs?.item || []).map(itemId).filter((x) => /^grindless:maxplus_/.test(x));
    const total = (row.j.inputs?.item || []).filter((x) => /^grindless:maxplus_/.test(itemId(x))).reduce((s, x) => s + cnt(x), 0);
    assert.ok(total >= 8, `${n}: ${total} maxplus components`);
    assert.ok(new Set(comps).size >= 3, `${n}: ${new Set(comps).size} families`);
  }
  t.diagnostic(`controllers with a row: ${checked.length} of ${ids.length}`);
});

test('circuits: no MAX+ recipe takes a lower-tier circuit as its highest', () => {
  const bad = [];
  for (const row of pack().mp) {
    let top = -1;
    for (const id of ins(row)) {
      const m = id.match(/^#gtceu:circuits\/(\w+)$/);
      if (m) top = Math.max(top, CIRCUIT_ORDER.indexOf(m[1]));
    }
    if (top >= 0 && top < CIRCUIT_ORDER.indexOf('max')) bad.push(`${row.i}: ${CIRCUIT_ORDER[top]}`);
  }
  assert.deepEqual(bad, []);
});

test('EU/t: no MAX+ row above 2^39; only the Hyperstargate dial goes to V[MAX] x 4,096 A (2^43, 1,200 t); its recharge row stays under the ceiling', () => {
  const bad = [];
  const dial = [];
  for (const row of pack().mp) {
    for (const e of [...eu(row, 'tickInputs'), ...eu(row, 'tickOutputs')]) {
      if (typeOf(row) === 'hyperstargate_dial' && e === DIAL_EUT) dial.push(row.i);
      else if (e > CEILING) bad.push(`${row.i}: ${e}`);
    }
  }
  assert.deepEqual(bad, []);
  if (hasG1()) {
    assert.equal(dial.length, 1, `the dial row: ${dial.join(', ') || 'none'}`);
    assert.match(src('hyperstargate.js'), /1200\b/, 'the dial runs 1,200 t');
  }
});

test('generators: the burner makes 2^34 and 2^33, the torus 2^34 and nothing exceeds it; the torus gives 2.0x the gas works it feeds', (t) => {
  const gens = pack().mp.filter((x) => eu(x, 'tickOutputs').length);
  assert.ok(gens.length >= 3, `${gens.length} generator rows`);
  for (const row of gens) {
    assert.equal(eu(row, 'tickInputs').length, 0, `${row.i} consumes EU on a generator row`);
    for (const e of eu(row, 'tickOutputs')) assert.ok(e <= 2 ** 34, `${row.i}: generator ${e} above 2^34`);
  }
  const stream = src('stream.js');
  const torus = stream.match(/name: 'helium_4_ash'[^\n]*eut: -Math\.pow\(2, (\d+)\)[^\n]*duration: (\d+)/);
  assert.ok(torus, 'torus row');
  const given = 2 ** Number(torus[1]) * Number(torus[2]);
  const spent = 2 ** 33 * 2400;
  t.diagnostic(`torus ${given.toExponential(3)} EU vs gas works ${spent.toExponential(3)} EU = ${(given / spent).toFixed(2)}x`);
  const ratio = given / spent;
  assert.ok(ratio >= 1.3 && ratio <= 2.5, `balance ${ratio}`);
  assert.match(stream, /a net of 2\.0 x/, 'the stated ratio is the row ratio');
});

test('creative items: only the six hyper assembly rows output them', () => {
  const six = new Set(['creative_energy', 'creative_chest', 'creative_tank', 'creative_computation_provider', 'creative_data_access_hatch', 'creative_energy_cell'].map((n) => `grindless:${n}`));
  const made = new Map();
  for (const row of pack().recs) for (const o of outs(row)) if (/creative/.test(o)) (made.get(o) ?? made.set(o, []).get(o)).push(row);
  for (const [id, rows] of made) {
    assert.ok(six.has(id), `${id} is not one of the six`);
    assert.deepEqual([...new Set(rows.map(typeOf))], ['hyper_assembly_array'], `${id} is made outside the hyper assembly array`);
  }
  assert.equal(made.size, 6, `${made.size} creative items made`);
});

test('the final dimension: no recipe in the pack has grindless:horizon_city as a site', () => {
  const bad = pack().recs.filter((x) => JSON.stringify(x.j).includes('grindless:horizon_city')).map((x) => x.i);
  assert.deepEqual(bad, []);
});

test('circuits are shared once: one row per (machine type, circuit) among MAX+ rows, c32 (the cold qualification) excepted', () => {
  const seen = new Map();
  for (const row of pack().mp) {
    for (const x of row.j.inputs?.item || []) {
      if (x.content.type !== 'gtceu:circuit' || x.content.configuration === 32) continue;
      const key = `${row.t} c${x.content.configuration}`;
      (seen.get(key) ?? seen.set(key, []).get(key)).push(row.i);
    }
  }
  const dup = [...seen].filter(([, v]) => v.length > 1).map(([k, v]) => `${k}: ${v.join(', ')}`);
  assert.deepEqual(dup, []);
});

test('moved circuits: the magnetic scoop hoop uses MTJ c29 and the waveguide tube chemical bath c3', () => {
  const find = (re) => pack().mp.find((x) => re.test(x.i));
  const hoop = find(/insulated_hoop$/);
  const tube = find(/polished_waveguide_tube$/);
  assert.ok(hoop && tube);
  assert.ok(ins(hoop).includes('circuit:29'), hoop.i);
  assert.ok(ins(tube).includes('circuit:3'), tube.i);
});

test('removed ids: gtceu:kerr_strand and gtceu:condensate_boil_off_gas are gone from the foundation and the id table', () => {
  const text = fs.readFileSync(path.join(TABLES, 'maxplus_ids.json'), 'utf8');
  const foundation = fs.readFileSync(path.join(PACK, 'kubejs', 'startup_scripts', 'grindless', 'maxplus', 'foundation.js'), 'utf8');
  for (const gone of [/\bkerr_strand\b/, /condensate_boil_off_gas/]) {
    assert.ok(!gone.test(text), String(gone));
    assert.ok(!gone.test(foundation), String(gone));
  }
});

// ------------------------------------------------------------------ the Hyperstargate (XP-G1's contract; checked once it has landed)

test('hyperstargate: machine 17 with its dial type and its recharge row, once XP-G1 has landed', (t) => {
  if (!hasG1()) return t.skip('XP-G1 has not landed');
  assert.equal(IDS().controllers.ids.filter((n) => n.includes('hyperstargate')).length, 1);
  const ids = pack().mp.map((x) => x.i);
  assert.ok(ids.some((i) => /hyper_assembly_array\/hyperstargate$/.test(i)), 'the controller row');
  assert.ok(ids.some((i) => /condensate_refinery\/recharge_dial_charge$/.test(i)), 'the recharge row');
  const dial = pack().mp.filter((x) => typeOf(x) === 'hyperstargate_dial');
  assert.equal(dial.length, 1, 'one dial row');
  assert.match(dial[0].i, /^grindless:hyperstargate_dial\//, 'the dial row (data string "dial")');
});

// ------------------------------------------------------------------ re-count of docs/eras/maxplus.md

const cells = (l) => l.split('|').map((s) => s.replace(/\*/g, '').trim());
function recount() {
  const md = fs.readFileSync(path.join(ROOT, 'docs', 'eras', 'maxplus.md'), 'utf8');
  const lines = md.split('\n');
  const rows = lines.filter((l) => /^\| [A-Z]\d+ \|/.test(l)).map(cells);
  const steps = rows.map((r) => Number(r[4]));
  const cr = rows.map((r) => Number(r[5]));
  const start = md.indexOf('\n## Crossings');
  const end = md.indexOf('\n## ', start + 5);
  const cx = md.slice(start, end).split('\n').filter((l) => l.startsWith('|') && !l.startsWith('|---') && !l.startsWith('| Era')).map(cells);
  const total = cx.find((r) => r[1] === 'Total');
  const eraRows = cx.filter((r) => r !== total);
  return {
    lines: rows.length, stepSum: steps.reduce((a, b) => a + b, 0), min: Math.min(...steps), crSum: cr.reduce((a, b) => a + b, 0),
    eraSum: eraRows.reduce((s, r) => s + Number(r[2]), 0), machines: eraRows.reduce((n, r) => n + Number(r[3].match(/\((\d+)\)\s*$/)[1]), 0),
    total: Number(total[2]), totalMachines: Number(total[3].replace(/\D/g, '')),
  };
}

test('re-count: 58 lines (265 steps), 185 crossings on 56 older machines, 17 MAX+ machines (a gap is reported, never padded)', (t) => {
  const c = recount();
  t.diagnostic(`lines ${c.lines}, steps ${c.stepSum}, min ${c.min}; crossings Cr column ${c.crSum}, era rows ${c.eraSum}, total ${c.total}; machines ${c.machines} (stated ${c.totalMachines})`);
  assert.ok(c.min >= 4, 'no line under 4 steps');
  assert.equal(c.lines, 58);
  assert.equal(c.stepSum, 265);
  assert.equal(c.crSum, 185);
  assert.equal(c.total, c.eraSum, 'the Crossings total is the sum of its rows');
  assert.equal(c.total, 185);
  assert.equal(c.machines, 56);
  assert.equal(c.totalMachines, 56);
  assert.equal(IDS().controllers.ids.length, 17, '17 MAX+ machines in the id table');
  assert.equal(pack().r.registry.machines.size > 0 && [...pack().r.registry.machines].filter(([id, m]) => /maxplus[\\/]/.test(m.file || '') && m.kind === 'multiblock' && id !== 'gtceu:hyperfactory').length, hasG1() ? 17 : 16, 'multiblocks registered');
});

test('docs: the Bootstrap check table has a row per gate and controller group', () => {
  const md = fs.readFileSync(path.join(ROOT, 'docs', 'eras', 'maxplus.md'), 'utf8');
  const start = md.indexOf('\n## Bootstrap check');
  const body = md.slice(start, md.indexOf('\n## ', start + 5));
  const rows = body.split('\n').filter((l) => l.startsWith('|') && !l.startsWith('|---') && !l.startsWith('| Needs'));
  assert.equal(rows.length, 14);
  for (const r of rows) assert.ok(/\| yes/.test(r), `a row is not satisfied before its use: ${r.slice(0, 60)}`);
});
