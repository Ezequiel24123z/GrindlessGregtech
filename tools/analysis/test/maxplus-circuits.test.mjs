// XP-A3: the MAX+ circuit lines Q1 and Q2 and the horizon processor (docs/eras/maxplus.md). Static checks on the table rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const table = (f) => JSON.parse(fs.readFileSync(path.join(kube, 'data', 'grindless', 'tables', `${f}.json`), 'utf8'));
const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const VA_MAX = 2013265920;

// [file, type, row, circuit, output]
const ROWS = [
  ['isotopes', 'calutron_separation', 'si28_feed', 31, 'grindless:si28_feed'],
  ['crystals', 'crystal_growth', 'si28_boule', 32, 'grindless:si28_boule'],
  ['beuv_stm', 'beuv_lithography', 'horizon_logic_wafer', 21, 'grindless:horizon_logic_wafer'],
  ['spin_deposition', 'mtj_sputtering', 'spin_interconnect_wafer', 32, 'grindless:spin_interconnect_wafer'],
  ['spin_logic', 'racetrack_patterning', 'stacked_logic_wafer', 6, 'grindless:stacked_logic_wafer'],
  ['tfln_femtosecond', 'ion_slicing', 'ln_on_insulator_plus', 19, 'grindless:ln_on_insulator_plus'],
  ['tfln_femtosecond', 'femtosecond_writing', 'interposer_waveguides', 20, 'grindless:interposer_waveguides'],
  ['photonics', 'molecular_beam_epitaxy', 'piezo_transducer_layer', 32, 'grindless:piezo_transducer_layer'],
  ['memories_cryostat', 'nuclear_demagnetisation', 'horizon_interposer', 32, 'grindless:horizon_interposer'],
  ['photonics_uev', 'photonic_integration', 'horizon_processor', 14, 'grindless:horizon_processor'],
];

const find = ([file, type, name]) => table(file).types[type].recipes.find((r) => r.name === name);

test('every XP-A3 row exists, is marked, makes its id and stays within VA[MAX] and circuit 32', () => {
  for (const row of ROWS) {
    const r = find(row);
    assert.ok(r, row[2]);
    assert.match(r._why, /^XP-A3 /, row[2]);
    assert.equal(r.circuit, row[3], row[2]);
    assert.ok(r.circuit <= 32 && r.eut <= VA_MAX && r.duration > 0, row[2]);
    assert.ok(ids(r.itemsOut).includes(row[4]), row[2]);
  }
});

test('the lines chain: every XP-A3 intermediate is made by one row and consumed by the next', () => {
  const made = new Map(ROWS.map((r) => [r[4], r]));
  const inputsOf = (row) => ids(find(row).itemsIn).concat(ids(find(row).kept));
  const chain = [
    ['grindless:si28_feed', 'si28_boule'],
    ['grindless:si28_boule', 'horizon_logic_wafer'],
    ['grindless:horizon_logic_wafer', 'spin_interconnect_wafer'],
    ['grindless:spin_interconnect_wafer', 'stacked_logic_wafer'],
    ['grindless:ln_on_insulator_plus', 'interposer_waveguides'],
    ['grindless:interposer_waveguides', 'piezo_transducer_layer'],
  ];
  for (const [id, next] of chain) {
    assert.ok(made.has(id), id);
    assert.ok(inputsOf(ROWS.find((r) => r[2] === next)).includes(id), `${next} consumes ${id}`);
  }
});

test('the horizon processor joins on the hall at VA[MAX], through the tested module only', () => {
  const r = find(ROWS[9]);
  assert.equal(r.eut, VA_MAX);
  assert.deepEqual(r.itemsIn.map((x) => [x.id, x.count]), [
    ['grindless:tested_horizon_module', 1], ['grindless:quantum_memory_node', 1],
    ['grindless:rydberg_logic_array', 1], ['#gtceu:circuits/max', 2]]);
  assert.deepEqual(r.fluidsIn, []);
});

test('no duplicate lookup in the tables that gained rows', () => {
  for (const f of new Set(ROWS.map((r) => r[0]))) {
    for (const [type, t] of Object.entries(table(f).types)) {
      const keys = t.recipes.filter((r) => r.circuit > 0).map((r) => `${r.circuit}|${[...new Set(ids(r.itemsIn).concat(ids(r.kept)))].sort().join(',')}`);
      assert.equal(new Set(keys).size, keys.length, `${f}/${type}`);
    }
  }
});

test('the mainframe rows climb: each takes 2 circuits of the previous tier and runs at its own tier VA (M2-01)', () => {
  const rows = table('photonics_uev').types.photonic_integration.recipes;
  const want = { optical_mainframe: ['uev', 31457280], spintronic_mainframe: ['uiv', 125829120], cosmic_mainframe: ['uxv', 503316480], supracausal_mainframe: ['opv', VA_MAX] };
  for (const [name, [prev, eut]] of Object.entries(want)) {
    const r = rows.find((x) => x.name === name);
    assert.ok(r, name);
    assert.equal(r.eut, eut, `${name} eut`);
    const tag = r.itemsIn.find((x) => x.id === `#gtceu:circuits/${prev}`);
    assert.ok(tag && tag.count >= 2, `${name} takes #gtceu:circuits/${prev}`);
  }
});

function runCircuits() {
  const dir = path.join(kube, 'server_scripts', 'grindless', 'maxplus');
  const tags = [];
  const context = vm.createContext({
    global: { grindless: { recipes() {} } }, console: { info() {}, error() {} },
    Item: { exists: () => true }, Fluid: { of: (id, amount) => ({ id, amount }) },
    ServerEvents: { recipes() {}, tags(_type, fn) { fn({ add: (tag, id) => tags.push([tag, id]) }); } },
  });
  vm.runInContext(fs.readFileSync(path.join(dir, 'circuits.js'), 'utf8'), context);
  return tags;
}

test('the real tag gtceu:circuits/maxplus holds the horizon processor (M3-02)', () => {
  assert.deepEqual(runCircuits(), [['gtceu:circuits/maxplus', 'grindless:horizon_processor']]);
});

test('no maxplus script names the horizon processor as a literal recipe ingredient', () => {
  const dir = path.join(kube, 'server_scripts', 'grindless', 'maxplus');
  const bad = [];
  for (const f of fs.readdirSync(dir)) {
    const s = fs.readFileSync(path.join(dir, f), 'utf8');
    if (/['"]\d+x grindless:horizon_processor['"]/.test(s)) bad.push(f);
  }
  assert.deepEqual(bad, []);
  const circuits = fs.readFileSync(path.join(dir, 'circuits.js'), 'utf8');
  assert.ok(circuits.includes("MC.tag = 'gtceu:circuits/maxplus'") && circuits.includes('event.recipes.gtceu.cutter'));
});