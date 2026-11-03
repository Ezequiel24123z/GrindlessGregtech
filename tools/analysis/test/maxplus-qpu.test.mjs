// D5-QPU-MAXP (X1): the Si-28 qubit line's MAX+ stage, four rows on four machines; the horizon processor is made only through the module.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const kube = path.resolve(here, '..', '..', '..', 'pack', 'kubejs');
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const table = (f) => JSON.parse(read('data', 'grindless', 'tables', f));
const row = (f, type, name) => table(f).types[type].recipes.find((r) => r.name === name);
const ids = (xs) => xs.map((x) => x.id);

const VA_MAX = 2013265920;
const ROWS = [
  ['spin_deposition.json', 'mtj_sputtering', 'stacked_horizon_module', 28, 'grindless:shielded_quantum_module'],
  ['tfln_femtosecond.json', 'femtosecond_writing', 'linked_horizon_module', 21, 'grindless:stacked_horizon_module'],
  ['memories_cryostat.json', 'nuclear_demagnetisation', 'tested_horizon_module', 13, 'grindless:condensate_cooled_module']
];

test('stack, link and test rows exist at VA[MAX] on their circuits and chain through the module', () => {
  for (const [f, type, name, circuit, prev] of ROWS) {
    const r = row(f, type, name);
    assert.ok(r, name);
    assert.equal(r.circuit, circuit, name);
    assert.equal(r.eut, VA_MAX, name);
    assert.ok(ids(r.itemsOut).includes(`grindless:${name}`), name);
    assert.ok(ids(r.itemsIn).includes(prev), `${name} consumes ${prev}`);
  }
  const a = row(...ROWS[0].slice(0, 3));
  assert.deepEqual(a.itemsIn.map((x) => [x.id, x.count]), [['grindless:shielded_quantum_module', 1], ['grindless:horizon_logic_die', 2]]);
  const b = row(...ROWS[1].slice(0, 3));
  assert.deepEqual(b.itemsIn.map((x) => [x.id, x.count]), [['grindless:stacked_horizon_module', 1], ['grindless:horizon_interposer', 1]]);
  const d = row(...ROWS[2].slice(0, 3));
  assert.ok(ids(d.kept).includes('grindless:mk_cryostat_module'));
  assert.deepEqual(d.fluidsIn, d.fluidsOut);
});

test('the condensate refinery jackets the linked module with the processor\'s 1,000 mB (moved, not added)', () => {
  const js = read('server_scripts', 'grindless', 'maxplus', 'condensate.js');
  assert.match(js, /name: 'condensate_cooled_module', circuit: 12, eut: VA_MAX[^\n]*\n\s*items: \['1x grindless:linked_horizon_module'\], fluids: \[\[KERR, 1000\]\], outs: \['1x grindless:condensate_cooled_module'\]/);
  const p = row('photonics_uev.json', 'photonic_integration', 'horizon_processor');
  assert.deepEqual(p.fluidsIn, []);
});

test('the horizon processor is made only through the tested module', () => {
  const p = row('photonics_uev.json', 'photonic_integration', 'horizon_processor');
  assert.equal(p.circuit, 14);
  assert.deepEqual(p.itemsIn.map((x) => [x.id, x.count]), [
    ['grindless:tested_horizon_module', 1], ['grindless:quantum_memory_node', 1], ['grindless:rydberg_logic_array', 1], ['#gtceu:circuits/max', 2]]);
});

test('failed stacks (5%) become scrap and the EV cascade returns In and Nb', () => {
  const a = row(...ROWS[0].slice(0, 3));
  const s = a.itemsOut.find((o) => o.id === 'grindless:horizon_module_scrap');
  assert.ok(s && s.chance === 500);
  const js = read('server_scripts', 'grindless', 'ev', 'extraction_cascade.js');
  assert.match(js, /name: 'horizon_module_scrap', mode: 'max', circuit: 29,\s*itemsIn: \[\{ id: 'grindless:horizon_module_scrap', count: 4 \}\]/);
  assert.match(js, /gtceu:indium_dust', count: 1 \}, \{ id: 'gtceu:niobium_dust', count: 1 \}/);
});

test('the five items are registered, named in en_us, drawn, and the new rows have EMI lines', () => {
  const foundation = read('startup_scripts', 'grindless', 'maxplus', 'foundation.js');
  const lang = read('client_scripts', 'grindless', 'maxplus_circuits_lang.js');
  const items = ['stacked_horizon_module', 'linked_horizon_module', 'condensate_cooled_module', 'tested_horizon_module', 'horizon_module_scrap'];
  for (const n of items) {
    assert.ok(foundation.includes(n), `registered ${n}`);
    assert.ok(lang.includes(`['${n}', '`), `name ${n}`);
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), `texture ${n}`);
  }
  for (const k of ['mtj_sputtering.stacked_horizon_module', 'femtosecond_writing.linked_horizon_module', 'condensate_refinery.condensate_cooled_module', 'nuclear_demagnetisation.tested_horizon_module']) {
    assert.ok(lang.includes(`gtceu.recipe.grindless_${k}`), k);
  }
});
