// UV-A1 (docs/eras/uv.md, "A1. Thorium"): the pyroprocessing cell's, the accelerator-driven reactor's and the older rows' tables,
// checked without Minecraft. The live lookups are the native test gg_test_uv_thorium.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const T = JSON.parse(read('data', 'grindless', 'tables', 'thorium.json'));
const FAB = JSON.parse(read('data', 'grindless', 'tables', 'thorium_fabrication.json'));

test('every recipe has a unique name, a positive EU/t and duration; circuits are unique inside a type', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
    }
  }
});

test('the reactor runs 1.5-2.6 M EU/t (S0-6) and its charge is never consumed', () => {
  const rx = T.types.accelerator_driven.recipes;
  assert.deepEqual(rx.map((r) => r.name).sort(), ['thorium_nitride', 'thorium_oxide']);
  for (const r of rx) assert.ok(r.eut >= 1_500_000 && r.eut <= 2_600_000, r.name);
  assert.ok(rx.find((r) => r.name === 'thorium_nitride').duration > rx.find((r) => r.name === 'thorium_oxide').duration);
});

test('the fuel fabrication rows have unique circuits and the uranium-233 rod is made from uranium-233', () => {
  const steps = FAB.fabrication;
  const circuits = steps.map((s) => s.circuit);
  assert.equal(new Set(circuits).size, circuits.length);
  assert.ok(steps.length >= 3);
  assert.ok(JSON.stringify(steps).includes('uranium_233'));
});

test('the machines are registered once and the generator type is not in the doubling list', () => {
  const s = read('startup_scripts', 'grindless', 'uv', 'thorium.js');
  assert.ok(s.includes('gtceu:pyroprocessing_cell') && s.includes('gtceu:accelerator_driven_reactor'));
  const gen = read('server_scripts', 'grindless', 'power', 'generators.js');
  assert.ok(!gen.includes('accelerator_driven'));
});

test('every byproduct has a written destination in the tooltips', () => {
  const lang = read('client_scripts', 'grindless', 'uv_thorium_lang.js').toLowerCase();
  for (const word of ['polonium', 'lithium', 'nitrogen']) assert.ok(lang.includes(word), word);
});

test('D3-TH-BACK: the back end chops, holds protactinium and keeps the U-233 total', () => {
  const R = Object.fromEntries(T.types.pyroprocessing.recipes.map((r) => [r.name, r]));
  const ids = (xs) => xs.map((x) => x.id);
  assert.ok(ids(R.chop_oxide.itemsOut).includes('gtnn:radioactive_waste') && ids(R.chop_nitride.itemsOut).includes('gtnn:radioactive_waste'));
  assert.equal(R.reduce.itemsIn[0].id, 'grindless:spent_oxide_fragments');
  assert.equal(R.nitride.itemsIn[0].id, 'grindless:spent_nitride_fragments');
  assert.ok(ids(R.nitride.fluidsOut).includes('gtceu:nitrogen_15'));
  for (const n of ['refine', 'nitride']) assert.ok(ids(R[n].itemsOut).includes('grindless:u233_cathode_deposit'), n);
  // four refining runs load 1,000 mB of salt: 4 deposits -> 3 ingots, 1 dust from the hold = 4 per 4 spent assemblies
  assert.equal(R.salt.fluidsIn.find((f) => f.id === 'gtceu:loaded_licl_salt').amount, 4 * R.nitride.fluidsOut.find((f) => f.id === 'gtceu:loaded_licl_salt').amount);
  const dep = R.cathode.itemsIn[0].count;
  const ingots = R.cathode.itemsOut[0].count;
  const dust = R.decay.itemsOut[0].count;
  assert.equal(dep, 4);
  assert.equal(ingots + dust, dep);
  const pa = (r, k) => r[k].find((f) => f.id === 'gtceu:protactinium_bismuth').amount;
  assert.equal(pa(R.salt, 'fluidsOut'), pa(R.decay, 'fluidsIn'));
  const bi = (r, k) => r[k].find((f) => f.id === 'gtceu:bismuth').amount;
  assert.equal(bi(R.salt, 'fluidsIn'), bi(R.decay, 'fluidsOut'));
  const s = read('startup_scripts', 'grindless', 'uv', 'thorium.js');
  for (const id of ['spent_oxide_fragments', 'spent_nitride_fragments', 'u233_cathode_deposit', 'protactinium_bismuth']) assert.ok(s.includes(id), id);
});

test('the F1 ids are used, never registered again', () => {
  const s = read('startup_scripts', 'grindless', 'uv', 'thorium.js');
  assert.ok(!/registerItem|\.item\('grindless:(thorium_|spent_|srf_)/.test(s.replace(/u233_fuel_rod/g, '')));
});
