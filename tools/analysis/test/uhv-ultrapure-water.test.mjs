// D3-UPW (docs/eras/lines-uv-uhv.md, W4): the ultrapure water plant climbs GTCA's purified water grades 1 to 5, then polishes.
// Static: the table's rows, their chain, balances and the untouched grades 6 to 8. T1: none.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const T = JSON.parse(fs.readFileSync(path.join(kube, 'data', 'grindless', 'tables', 'betavoltaics.json'), 'utf8'));
const rows = T.types.ultrapure_water.recipes;
const row = (n) => rows.find((r) => r.name === n);
const grade = (n) => `gtca:purified_water_grade_${n}`;
const amount = (list, id) => (list.find((f) => f.id === id) || { amount: 0 }).amount;

const CHAIN = ['carbon_filtration', 'reverse_osmosis', 'electrodeionisation', 'uv_oxidation', 'degassing', 'ultrapure_water'];

test('six rows, every one 200 ticks, unique circuits, no EU/t above the UHV row', () => {
  assert.deepEqual(rows.map((r) => r.name).sort(), [...CHAIN].sort());
  for (const r of rows) assert.equal(r.duration, 200, r.name);
  const circuits = rows.map((r) => r.circuit);
  assert.equal(new Set(circuits).size, circuits.length);
  assert.equal(new Set(rows.map((r) => r.eut)).size, 1);
});

test('the chain climbs grade 1 to 5, each row taking the previous grade', () => {
  assert.equal(amount(row('carbon_filtration').fluidsIn, 'minecraft:water'), 8000);
  assert.equal(amount(row('carbon_filtration').fluidsOut, grade(1)), 8000);
  const steps = [['reverse_osmosis', 1, 2], ['electrodeionisation', 2, 3], ['uv_oxidation', 3, 4], ['degassing', 4, 5]];
  for (const [n, from, to] of steps) {
    const r = row(n);
    assert.ok(amount(r.fluidsIn, grade(from)) > 0, `${n} takes grade ${from}`);
    assert.ok(amount(r.fluidsOut, grade(to)) > 0, `${n} makes grade ${to}`);
  }
  assert.ok(amount(row('ultrapure_water').fluidsIn, grade(5)) > 0);
});

test('activated carbon is the only item the filtration uses and it wears at 5%', () => {
  const r = row('carbon_filtration');
  assert.deepEqual(r.chanced, [{ id: 'gtceu:activated_carbon_dust', count: 1, chance: 500 }]);
  assert.deepEqual(r.itemsIn, []);
});

test('6,000 mB ultrapure water per 8,000 mB water; the loss leaves as brine and a little CO2', () => {
  assert.equal(amount(row('ultrapure_water').fluidsOut, 'gtceu:ultrapure_water'), 6000);
  assert.equal(amount(row('reverse_osmosis').fluidsOut, grade(2)), 6000);
  assert.equal(amount(row('reverse_osmosis').fluidsOut, 'gtceu:salt_water'), 2000);
  assert.equal(amount(row('uv_oxidation').fluidsOut, 'gtceu:carbon_dioxide'), 50);
  for (const n of ['electrodeionisation', 'uv_oxidation', 'degassing']) {
    const r = row(n);
    const gin = r.fluidsIn.reduce((s, f) => s + f.amount, 0);
    const gout = r.fluidsOut.filter((f) => f.id.startsWith('gtca:')).reduce((s, f) => s + f.amount, 0);
    assert.equal(gout, gin, n);
  }
});

test('the polish keeps the resin and the regeneration acid and caustic', () => {
  const r = row('ultrapure_water');
  assert.deepEqual(r.kept, [{ id: 'grindless:ion_exchange_resin', count: 1 }]);
  assert.deepEqual(r.itemsIn, [{ id: 'gtceu:sodium_hydroxide_dust', count: 1 }]);
  assert.equal(amount(r.fluidsIn, 'gtceu:hydrochloric_acid'), 1000);
});

test('grades 6 to 8 stay untouched', () => {
  const text = JSON.stringify(T);
  for (const g of [6, 7, 8]) assert.ok(!text.includes(grade(g)), `grade ${g}`);
});

test('every row has an English EMI line', () => {
  const lang = fs.readFileSync(path.join(kube, 'client_scripts', 'grindless', 'uhv_betavoltaics_lang.js'), 'utf8');
  for (const n of CHAIN) assert.ok(lang.includes(`'gtceu.recipe.grindless_ultrapure_water.${n}'`), n);
});
