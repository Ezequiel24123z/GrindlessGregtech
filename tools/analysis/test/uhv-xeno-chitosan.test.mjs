// D3-XENO (docs/eras/lines-uv-uhv.md, W6): the chitosan scaffold chain on Proxima b, no game needed. Static: reads the table.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const T = JSON.parse(fs.readFileSync(path.join(root, 'pack/kubejs/data/grindless/tables/proxima_life.json'), 'utf8'));
const rows = T.types.xenobiochemistry.recipes;
const row = (n) => rows.find((r) => r.name === n);
const qty = (xs, id) => (xs.find((x) => x.id === id) || {}).count ?? (xs.find((x) => x.id === id) || {}).amount;

test('three steps: 8 mushrooms to 2 chitin, 2 chitin to 2 chitosan, 2 chitosan to 2 scaffolds', () => {
  const a = row('xeno_chitin'), b = row('xeno_chitosan'), c = row('chitosan');
  assert.ok(a && b && c);
  assert.equal(qty(a.itemsIn, 'grindless:xeno_mushroom'), 8);
  assert.equal(qty(a.fluidsIn, 'gtceu:hydrochloric_acid'), 1000);
  assert.equal(qty(a.itemsOut, 'grindless:xeno_chitin'), 2);
  assert.equal(qty(a.fluidsOut, 'gtceu:salt_water'), 1000);
  assert.equal(qty(b.itemsIn, 'grindless:xeno_chitin'), 2);
  assert.equal(qty(b.itemsIn, 'gtceu:sodium_hydroxide_dust'), 4);
  assert.equal(qty(b.itemsOut, 'grindless:xeno_chitosan'), 2);
  assert.equal(qty(c.itemsIn, 'grindless:xeno_chitosan'), 2);
  assert.equal(qty(c.fluidsIn, 'gtceu:acetic_acid'), 500);
  assert.equal(qty(c.itemsOut, 'grindless:chitosan_scaffold'), 2);
});

test('the deacetylation byproduct (acetic acid) is what the scaffold row consumes; times are not inflated', () => {
  assert.equal(qty(row('xeno_chitosan').fluidsOut, 'gtceu:acetic_acid'), 500);
  assert.ok(rows.filter((r) => ['xeno_chitin', 'xeno_chitosan', 'chitosan'].includes(r.name)).reduce((s, r) => s + r.duration, 0) <= 800);
});

test('unique circuits inside the plant, and nothing consumes mushrooms or caustic in the scaffold row any more', () => {
  const circuits = rows.map((r) => r.circuit);
  assert.equal(new Set(circuits).size, circuits.length);
  assert.equal(row('xeno_chitin').circuit, 6);
  assert.equal(row('xeno_chitosan').circuit, 7);
  assert.equal(row('chitosan').itemsIn.length, 1);
});
