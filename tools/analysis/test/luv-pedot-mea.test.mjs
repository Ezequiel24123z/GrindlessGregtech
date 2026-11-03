// LuV living-circuit line L2 (package D2-MEA): the PEDOT:PSS microelectrode array, and the NPU taking it instead of 8 electrum plates.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runServerScripts } from '../lib/kubejs_recipes_sandbox.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PACK = path.join(ROOT, 'pack');
const ARRAY = 'grindless:pedot_microelectrode_array';

const RUN = runServerScripts({
  packRoot: PACK, scripts: ['kubejs/server_scripts/grindless/luv/pedot_mea.js'], recipes: {},
  startup: ['kubejs/startup_scripts/grindless/luv/pedot_mea.js'],
  before(sandbox) {
    sandbox.Java = { loadClass: () => ({ CLEANROOM: 'cleanroom' }) };
    const recipes = sandbox.ServerEvents.recipes;
    sandbox.ServerEvents.recipes = (fn) => recipes((event) => { event.remove = () => {}; fn(event); });
  },
});
const calls = (r, m) => r.calls.filter((c) => c[0] === m).map((c) => c.slice(1));

test('the array is made in a cleanroom assembler from sapphire, gold and PEDOT:PSS at LuV voltage', () => {
  const r = RUN.built.find((x) => x.id === 'grindless:pedot_microelectrode_array');
  assert.ok(r);
  assert.equal(r.type, 'gtceu:assembler');
  assert.deepEqual(calls(r, 'itemInputs')[0], ['4x gtceu:sapphire_plate', '16x gtceu:gold_foil', '8x gtceu:platinum_foil', '8x gtceu:silver_foil', '8x gtceu:polystyrene_dust']);
  assert.deepEqual(calls(r, 'inputFluids')[0], [{ fluid: 'gtceu:pedot_pss', amount: 2000 }]);
  assert.deepEqual(calls(r, 'itemOutputs')[0], [ARRAY]);
  assert.equal(calls(r, 'cleanroom').length, 1);
  assert.ok(calls(r, 'EUt')[0][0] <= 30720);
  assert.ok(calls(r, 'duration')[0][0] <= 600);
});

test('the neural processing unit takes the array and no electrum plates', () => {
  const src = fs.readFileSync(path.join(PACK, 'kubejs/server_scripts/grindless/luv/orbital_biology.js'), 'utf8');
  const npu = /orbital\('organoid_assembly', 'neuro_processing_unit'\)[\s\S]*?\.itemOutputs/.exec(src)[0];
  assert.ok(npu.includes(`'${ARRAY}'`));
  assert.ok(!npu.includes('electrum_plate'));
});

test('the array has a name, a tooltip and a texture', () => {
  const lang = fs.readFileSync(path.join(PACK, 'kubejs/client_scripts/grindless/luv_pedot_mea_lang.js'), 'utf8');
  assert.ok(lang.includes("'pedot_microelectrode_array'"));
  assert.ok(fs.existsSync(path.join(PACK, 'kubejs/assets/grindless/textures/item/pedot_microelectrode_array.png')));
});
