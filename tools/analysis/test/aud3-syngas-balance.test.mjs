// AUD3-RECIPES (#299, #301): the water-gas shift of circuit 5 runs anywhere, and every syngas row and the second C-12 methanation balance
// hydrogen under one convention: 1 000 mB hydrogen = one H (a molecule of any other fluid is 1 000 mB).
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
const SYN = plain(run.global.grindless.syngas);
const BV = JSON.parse(fs.readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', 'betavoltaics.json'), 'utf8'));
const ALL = [...SYN.recipes, ...SYN.orbitRecipes, ...SYN.uevRecipes, ...SYN.uivRecipes, ...SYN.uxvRecipes];

test('every published syngas row balances C, H and O', () => {
  assert.equal(ALL.length, 10);
  for (const p of ALL) assert.deepEqual(p.atoms, { c: 0, h: 0, o: 0 }, p.name);
});

test('c12_methanation takes four hydrogen units (4 000 mB) for CH4', () => {
  const r = SYN.uivRecipes.find((p) => p.name === 'c12_methanation');
  assert.equal(r.fluidsIn.find((f) => f.id === 'gtceu:hydrogen').amount, 4000);
});

test('carbon_12_methanation (CO + 6 H -> CH4 + H2O) takes 6 000 mB hydrogen', () => {
  const r = BV.types.chemical_reactor.recipes.find((x) => x.name === 'carbon_12_methanation');
  assert.equal(r.fluidsIn.find((f) => f.id === 'gtceu:hydrogen').amount, 6000);
  assert.equal(r.fluidsIn.find((f) => f.id === 'gtceu:carbon_12_monoxide').amount, 1000);
});

test('pluto_shift has no dimension and its energy carries the vaporisation of the liquid water', () => {
  const p = SYN.orbitRecipes[0];
  assert.equal(p.name, 'pluto_shift');
  assert.equal(p.dim, undefined);
  const r = run.docs.recipes.recipes.find((x) => x.i === p.id);
  assert.ok(!/dimension/.test(JSON.stringify(r.j.recipeConditions || [])));
  assert.ok(!/pluto_orbit/.test(JSON.stringify(r.j)));
  assert.equal(p.eut * p.duration, 2 * SYN.stageEnergy.shift + 2 * SYN.stageEnergy.vaporize);
});
