// D2-REE (samaric branch of EV's rare-earth trunk), no game needed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const RE = plain(run.global.grindless.evRareEarths);
const EC = plain(run.global.grindless.extractionCascade);
const read = (p) => fs.readFileSync(path.join(pack, p), 'utf8');

test('scripts run without errors or skipped recipes', () => {
  const errs = run.errors.filter((e) => /ev[\\/]rare_earths|extraction_cascade/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(RE.skipped, []);
});

test('both fluids are registered as liquid materials', () => {
  for (const n of ['seg_chloride_solution', 'heavy_rare_earth_chloride_solution']) {
    assert.ok(run.registry.materials.get('gtceu:' + n).forms.has('liquid'), n);
  }
});

test('16 and 18: closed acid loop, only 18 makes the fluorinated concentrate, no samarium output', () => {
  const [a, b] = RE.recipes;
  assert.equal(a.fluidsIn.find((f) => f.id === 'gtceu:hydrochloric_acid').amount, 2000);
  assert.equal(b.fluidsOut.find((f) => f.id === 'gtceu:hydrochloric_acid').amount, 2000);
  assert.deepEqual(b.itemsOut, [{ id: 'gtca:fluorinated_samaric_concentrate_dust', count: 1 }]);
  for (const r of RE.recipes) {
    assert.ok(![...r.itemsOut, ...r.fluidsOut].some((o) => /samarium/.test(o.id)));
  }
  assert.deepEqual(RE.recipes.filter((r) => r.itemsOut.some((o) => /fluorinated/.test(o.id))).map((r) => r.name), ['fluoride_precipitation']);
});

test('retired recipes are removed', () => {
  for (const id of ['gtceu:chemical_reactor/samaric_to_flsamaric', 'gtceu:large_chemical_reactor/samaric_to_flsamaric', 'gtceu:electrolyzer/decomposition_electrolyzing_bastnasite']) {
    assert.ok(RE.retired.includes(id), id);
  }
  assert.ok(!read('kubejs/data/grindless/tables/offworld_only.json').includes('decomposition_electrolyzing_bastnasite'));
  assert.ok(read('kubejs/data/grindless/tables/offworld_only.json').includes('flsamaric_to_ho'));
});

test('cascade seg_split row: circuit 3, exact amounts, no lookup clash', () => {
  const row = EC.recipes.find((r) => r.name === 'seg_split');
  assert.ok(row, 'row present');
  assert.equal(row.circuit, 3);
  assert.equal(row.eut, 1920);
  assert.equal(row.duration, 200);
  assert.deepEqual(row.fluidsIn.map((f) => f.amount), [1000, 500, 1000]);
  assert.deepEqual(row.fluidsOut.map((f) => f.amount), [500, 1000, 950]);
  assert.deepEqual(EC.clashes || [], []);
});

test('en_us strings exist', () => {
  const s = read('kubejs/client_scripts/grindless/ev_rare_earths_lang.js');
  assert.match(s, /material\.gtceu\.seg_chloride_solution/);
  assert.match(s, /material\.gtceu\.heavy_rare_earth_chloride_solution/);
});

