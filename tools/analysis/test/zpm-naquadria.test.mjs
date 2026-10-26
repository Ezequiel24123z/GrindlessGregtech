// ZPM-A2 (docs/eras/zpm.md, "Naquadria and the large naquadah reactor"): the naquadria refinery's and the fuel works' table, the plant's
// circuit-4 mode, the casing route and the reactor's duranium frames, checked without Minecraft. The live lookups are the native test
// gg_test_zpm_naquadria.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const T = JSON.parse(read('data', 'grindless', 'tables', 'naquadria.json'));
const PLANT = JSON.parse(read('data', 'grindless', 'tables', 'naquadah_plant.json'));
const all = Object.entries(T.types).flatMap(([type, t]) => t.recipes.map((r) => ({ type, dataKey: t.dataKey, ...r })));
const byName = (n) => all.find((r) => r.name === n);

test('every recipe has a unique circuit and name inside its type, a positive EU/t and duration', () => {
  for (const [type, t] of Object.entries(T.types)) {
    const circuits = t.recipes.map((r) => r.circuit);
    assert.equal(new Set(circuits).size, circuits.length, type);
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    assert.ok(t.dataKey.startsWith('grindless_'), type);
  }
  for (const r of all) {
    assert.ok(r.eut > 0 && Number.isInteger(r.eut) && r.duration > 0 && Number.isInteger(r.duration), r.name);
  }
});

test('naquadria only comes from the stored impure solution or the stored waste, never from nothing', () => {
  const makers = all.filter((r) => (r.itemsOut || []).some((o) => o.id === 'gtceu:naquadria_dust'));
  assert.deepEqual(makers.map((r) => r.name).sort(), ['naquadria', 'naquadria_waste']);
  const inputs = makers.flatMap((r) => (r.fluidsIn || []).map((f) => f.id));
  assert.ok(inputs.includes('gtceu:impure_naquadria_solution'));
  assert.ok(inputs.includes('gtceu:naquadria_waste'));
});

test('the fuel loop: a naquadria dust returns far more energy than its refining costs (S0-5 figures)', () => {
  const EU_PER_MB_EXCITED = 117_000_000;
  const EXCITED_MB_PER_1000_FUEL = 125;
  const mix = byName('fuel_mix');
  const dust = mix.itemsIn.find((i) => i.id === 'gtceu:naquadria_dust').count;
  const energyPerDust = (EU_PER_MB_EXCITED * EXCITED_MB_PER_1000_FUEL) / dust;
  const refine = byName('naquadria');
  const costPerDust = (refine.eut * refine.duration) / refine.itemsOut.find((o) => o.id === 'gtceu:naquadria_dust').count;
  assert.ok(energyPerDust > 30 * costPerDust, `${energyPerDust} vs ${costPerDust}`);
  assert.ok(energyPerDust > 3e8 && energyPerDust < 4e8, String(energyPerDust));
});

test('every byproduct has a written destination in the machines\' tooltips', () => {
  const lang = read('client_scripts', 'grindless', 'zpm_naquadria_lang.js');
  for (const word of ['enriched naquadah solution', 'gallium', 'sulfuric acid', 'xenon', 'europium']) {
    assert.ok(lang.toLowerCase().includes(word), word);
  }
});

test('the casing has an assembler route and the A2 hiding rule is gone', () => {
  assert.equal(T.casing.id, 'grindless:naquadria_containment_casing');
  assert.equal(T.casing.recipe, 'grindless:assembler/naquadria_containment_casing');
  assert.ok(T.casing.itemsIn.length > 0 && T.casing.count >= 1);
  const obtain = fs.readFileSync(path.join(root, 'tools', 'analysis', 'tiers', 'obtain.json'), 'utf8');
  assert.ok(!obtain.includes('naquadria_containment_casing'));
  assert.ok(!read('data', 'grindless', 'tables', 'hidden_until.json').includes('naquadria_containment_casing'));
});

test('no neutronium or UV-only input anywhere in A2', () => {
  const text = JSON.stringify(T) + read('startup_scripts', 'grindless', 'zpm', 'naquadria.js') + read('server_scripts', 'grindless', 'zpm', 'naquadria.js');
  const used = text.split('\n').filter((l) => !/^\s*(\/\/|var REACTOR)/.test(l)).join('\n');
  assert.ok(!/neutronium|:uv_|_uv\b/.test(used), 'neutronium or UV input');
});

test('plant mode 3 (circuit 4) is a new row with its own circuit; modes 1 and 2 keep theirs', () => {
  const circuits = PLANT.modes.map((m) => m.circuit);
  assert.deepEqual(circuits, [1, 2, 3, 4]);
  assert.equal(PLANT.modes[3].name, 'enriched_solution');
  const direct = PLANT.direct.find((d) => d.name === 'enriched_solution');
  assert.equal(direct.circuit, 4);
  assert.equal(direct.keep, true);
  assert.deepEqual(direct.fluidsIn.map((f) => f.id), ['gtceu:enriched_naquadah_solution']);
  assert.ok(PLANT.composed.every((c) => c.circuit !== 4));
  assert.ok(byName('naquadria').fluidsOut.some((f) => f.id === 'gtceu:enriched_naquadah_solution'));
});

test('the reactor keeps its id and swaps only the frames', () => {
  const s = read('server_scripts', 'grindless', 'zpm', 'naquadria.js');
  assert.ok(s.includes("'gtceu:assembly_line/large_naquadah_reactor'"));
  assert.ok(s.includes("from: 'gtceu:neutronium_frame', to: 'gtceu:duranium_frame'"));
  assert.ok(s.includes('researchWithoutRecipe(args.research)'));
  assert.ok(s.includes("'expected 8 '"));
});
