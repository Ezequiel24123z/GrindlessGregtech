// D5-QPU-MAX (M1): the Si-28 qubit line's MAX stage, four rows on four machines; the mainframe is made only through the module.
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

const VH_MAX = 1073741824;
const VA_MAX = 2013265920;
const ROWS = [
  ['tfln_femtosecond.json', 'ion_slicing', 'transducer_bonded_stack', 14, VH_MAX, 'grindless:transducer_bonded_stack'],
  ['photonics.json', 'photonic_foundry', 'photonic_tetron_module', 17, VH_MAX, 'grindless:photonic_tetron_module'],
  ['memories_cryostat.json', 'nuclear_demagnetisation', 'calibrated_photonic_module', 12, VH_MAX, 'grindless:calibrated_photonic_module'],
  ['membrane_line.json', 'membrane_rolling', 'shielded_quantum_module', 4, VA_MAX, 'grindless:shielded_quantum_module']
];

test('the four rows exist on the contract circuits and EU/t, each making its item', () => {
  for (const [f, type, name, circuit, eut, out] of ROWS) {
    const r = row(f, type, name);
    assert.ok(r, name);
    assert.equal(r.circuit, circuit, name);
    assert.equal(r.eut, eut, name);
    assert.ok(ids(r.itemsOut).includes(out), name);
  }
});

test('the line chains: each stage consumes the previous one', () => {
  const [a, b, c, d] = ROWS.map(([f, t, n]) => row(f, t, n));
  assert.ok(ids(a.itemsIn).includes('grindless:tested_tetron_die') && ids(a.itemsIn).includes('grindless:cryo_photonic_interposer'));
  assert.ok(ids(b.itemsIn).includes('grindless:transducer_bonded_stack') && ids(b.itemsIn).includes('grindless:squeezed_light_chip'));
  assert.ok(ids(c.itemsIn).includes('grindless:photonic_tetron_module'));
  assert.ok(ids(d.itemsIn).includes('grindless:calibrated_photonic_module') && ids(d.itemsIn).includes('grindless:superconducting_membrane'));
});

test('failed bonds have a destination: a failed_tetron_die byproduct at 10%', () => {
  const r = row('tfln_femtosecond.json', 'ion_slicing', 'transducer_bonded_stack');
  const f = r.itemsOut.find((o) => o.id === 'grindless:failed_tetron_die');
  assert.ok(f && f.chance === 1000);
});

test('the supracausal mainframe is made only through the module', () => {
  const r = row('photonics_uev.json', 'photonic_integration', 'supracausal_mainframe');
  const inp = ids(r.itemsIn);
  assert.ok(inp.includes('grindless:shielded_quantum_module'));
  for (const gone of ['grindless:tetron_array', 'grindless:squeezed_light_chip', 'grindless:cryo_photonic_interposer']) assert.ok(!inp.includes(gone), gone);
});

test('the four items are registered, named in en_us and drawn', () => {
  const foundation = read('startup_scripts', 'grindless', 'max', 'foundation.js');
  const lang = read('client_scripts', 'grindless', 'max_qpu_lang.js');
  for (const [, type, name] of ROWS) {
    assert.ok(foundation.includes(`${name}: {`), `registered ${name}`);
    assert.ok(lang.includes(`['${name}', '`), `name ${name}`);
    assert.ok(lang.includes(`gtceu.recipe.grindless_${type}.${name}`), `EMI ${name}`);
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${name}.png`)), `texture ${name}`);
  }
  assert.match(lang, /ClientEvents\.lang\('en_us'/);
});
