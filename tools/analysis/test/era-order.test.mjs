// QR-F5 era order check (the current-pack run is in recipe-cycles.test.mjs, sharing its static run): a recipe that builds a machine must not take an input first available in a later era (lib/era_order.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { eraOrderViolations } from '../lib/era_order.mjs';

const cfg = JSON.parse(fs.readFileSync(fileURLToPath(new URL('../recipe_quality.json', import.meta.url)), 'utf8'));
const asm = (id, out, inputs) => ({ id, type: 'gtceu:assembly_line', json: {
  inputs: { item: inputs.map((i) => ({ content: { type: 'gtceu:sized', count: 1, ingredient: { item: i } } })) },
  outputs: { item: [{ content: { type: 'gtceu:sized', count: 1, ingredient: { item: out } } }] },
} });
const model = (recipes, items, materials = []) => ({
  dump: { recipes: new Map(recipes.map((r) => [r.id, r])), machines: new Map([['gtceu:works', {}], ['gtceu:hatch', {}]]) },
  run: {
    registry: {
      items: new Map(items.map(([id, era]) => [id, { id, file: `kubejs/startup_scripts/grindless/${era}/x.js` }])),
      blocks: new Map(), fluids: new Map(),
      materials: new Map(materials.map(([n, era]) => [n, { name: n, file: `kubejs/startup_scripts/grindless/${era}/m.js` }])),
    },
    recipeFiles: new Map(recipes.map((r) => [r.id, 'kubejs/server_scripts/grindless/uv/x.js'])),
  },
});

test('a UV machine taking a UEV item is an era inversion; an equal or earlier era is fine', () => {
  const v = eraOrderViolations(model([
    asm('grindless:uv/bad', 'gtceu:works', ['grindless:sic_fibre']),
    asm('grindless:uv/ok', 'gtceu:hatch', ['grindless:uv_part', 'grindless:zpm_part']),
  ], [['grindless:sic_fibre', 'uev'], ['grindless:uv_part', 'uv'], ['grindless:zpm_part', 'zpm']]), cfg);
  assert.deepEqual(v.map((x) => `${x.recipe} <- ${x.input} (${x.inputEra})`), ['grindless:uv/bad <- grindless:sic_fibre (uev)']);
});

test('roots 1 and 2: sic_fibre (boron_nitride_reactor, powder_bed_printer) and atom_interferometer (event_horizon_interferometer) are UEV items in UV machines', () => {
  const v = eraOrderViolations(model([
    asm('grindless:assembly_line/boron_nitride_reactor', 'gtceu:works', ['grindless:sic_fibre']),
    asm('grindless:assembly_line/event_horizon_interferometer', 'gtceu:hatch', ['grindless:atom_interferometer']),
  ], [['grindless:sic_fibre', 'uev'], ['grindless:atom_interferometer', 'uev']]), cfg);
  assert.equal(v.length, 2);
});

test('a registered material form of a later era counts; the recipe tier follows the output tier prefix', () => {
  const v = eraOrderViolations(model([asm('grindless:uv/m', 'gtceu:works', ['gtceu:rhea_plate'])], [], [['rhea', 'uiv']]), cfg);
  assert.deepEqual(v.map((x) => x.input), ['gtceu:rhea_plate']);
  const hi = model([asm('grindless:uv/m', 'gtceu:uiv_hatch', ['gtceu:rhea_plate'])], [], [['rhea', 'uiv']]);
  hi.dump.machines.set('gtceu:uiv_hatch', {});
  assert.deepEqual(eraOrderViolations(hi, cfg), []);
});
