// D3-ICEWORKS (D3-11, option A), no game needed: the amorphous ice annealer is merged into the volatile ice fractionator.
//   - the annealer machine, its recipe type, its lang keys and its EMI page are gone;
//   - planetesimal_annealing is a fractionator row (circuit 3, no dimension lock) with the old mass balance;
//   - the fractionator is a large hall (about 650 cells) with a cryostat carousel and up to four output hatches.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { measure, violations } from '../lib/structure_quality.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const PI = plain(run.global.grindless.uvPlutoIces);
const recipes = run.docs.recipes.recipes;
const FRAC = 'gtceu:volatile_ice_fractionator';
const ANNEALER = 'gtceu:amorphous_ice_annealer';

test('the annealer is gone: machine, recipe type, startup/lang text and the EMI page', () => {
  assert.ok(!run.registry.machines.has(ANNEALER));
  assert.ok(!run.registry.recipeTypes.has('gtceu:ice_annealing'));
  assert.ok(!recipes.some((r) => r.t === 'gtceu:ice_annealing'));
  assert.ok(!fs.existsSync(path.join(pack, 'kubejs/assets/emi/recipe/additions/grindless/amorphous_ice_annealer.json')));
  for (const rel of ['startup_scripts/grindless/uv/kuiper.js', 'server_scripts/grindless/uv/kuiper.js',
    'client_scripts/grindless/uv_kuiper_lang.js', 'client_scripts/grindless/uv_info_lang.js']) {
    const src = fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
    assert.doesNotMatch(src, /amorphous_ice_annealer|ice_annealing/, rel);
  }
});

test('planetesimal_annealing is a fractionator row: circuit 3, one sample, the old mass balance, no dimension lock', () => {
  const p = PI.recipes.find((x) => x.name === 'planetesimal_annealing');
  assert.ok(p, 'row present');
  assert.equal(p.type, 'ice_fractionation');
  assert.equal(p.circuit, 3);
  assert.deepEqual(p.itemsIn, [{ id: 'grindless:planetesimal_sample', count: 1 }]);
  assert.deepEqual(p.itemsOut, []);
  assert.deepEqual(p.fluidsOut, [{ id: 'minecraft:water', amount: 4000 }, { id: 'gtceu:carbon_monoxide', amount: 1000 },
    { id: 'gtceu:nitrogen', amount: 500 }, { id: 'gtceu:kuiper_noble_gas', amount: 250 }]);
  assert.equal(p.eut, 122880);
  assert.equal(p.duration, 800);
  const r = recipes.find((x) => x.i === p.recipeId);
  assert.ok(r, p.recipeId);
  assert.equal(r.t, 'gtceu:ice_fractionation');
  assert.doesNotMatch(JSON.stringify(r.j.recipeConditions || []), /dimension/);
  assert.ok(r.j.outputs.fluid.length <= 4, 'within the type\'s four fluid outputs');
});

test('the fractionator: 11 x 11 x 11, about 650 cells, no structure-quality violation, a cryostat carousel, 1-4 output hatches', () => {
  const d = run.docs.structures.structures[FRAC];
  const m = measure(d);
  assert.deepEqual(violations(m), []);
  assert.ok(m.cells >= 600 && m.cells <= 700, 'cells ' + m.cells);
  assert.ok(m.dominantShare <= 0.7, 'dominant share ' + m.dominantShare);
  assert.deepEqual(m.bbox, [11, 11, 11]);
  const blocks = Object.values(d.symbols).flatMap((v) => v.blocks || []);
  assert.ok(blocks.includes('grindless:cryostat_casing'), 'cryostat carousel');
  assert.ok(blocks.includes('gtceu:frostproof_machine_casing'), 'frostproof bands');
  const lim = Object.fromEntries(d.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
  assert.deepEqual(lim.output_hatch, { min: 1, max: 4 });
  assert.deepEqual(lim.energy_input, { min: 1, max: 2 });
});

test('the Kuiper noble gas comes only from the fractionator row, and the sample from the bay', () => {
  const makers = recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes('"gtceu:kuiper_noble_gas"'));
  assert.deepEqual(makers.map((r) => r.i), ['grindless:ice_fractionation/planetesimal_annealing']);
});
