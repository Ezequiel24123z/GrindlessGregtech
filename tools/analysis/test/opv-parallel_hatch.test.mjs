// OpV-M1: the OpV parallel hatch (startup_scripts/grindless/lib/parallel_hatch.js, server_scripts/grindless/opv/parallel.js): tier 13 = 4^(13-4)
// = x262144, registered with the UHV, UEV, UIV and UXV ones, in the hatch list after them, the assembly line researched with the UXV hatch, the names in both languages.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const KJS = path.join(ROOT, 'pack', 'kubejs');
const read = (kind, file) => fs.readFileSync(path.join(KJS, kind, file), 'utf8');
const plain = (v) => JSON.parse(JSON.stringify(v));

function load() {
  const registry = [];
  const G = {};
  const context = vm.createContext({
    global: { grindless: G },
    console: { info() {}, warn() {}, log() {}, error() {} },
    GTCEuStartupEvents: { registry: (type, cb) => registry.push([type, cb]) },
    Java: { loadClass: () => function () {} },
    GTRecipeModifiers: {},
    ModifierFunction: {},
    PartAbility: { PARALLEL_HATCH: 'PH' },
    RotationState: { ALL: 'ALL' },
    GTModelProperties: { IS_FORMED: 'F' },
    Text: { translate: (s) => s },
  });
  vm.runInContext(read('startup_scripts', 'grindless/lib/parallel_hatch.js'), context);
  return { G, registry };
}

test('the one create covers tiers 9 to 13; tier 13 is named, titled and modelled as the OpV hatch', () => {
  const { registry } = load();
  const machine = registry.find(([t]) => t === 'gtceu:machine');
  const calls = [];
  let creates = 0;
  const defs = [];
  const b = new Proxy({}, { get: (_, m) => (...a) => { calls.push([m, ...a]); if (m === 'definition') defs.push(a[0]); return b; } });
  machine[1]({ create: () => { creates++; return b; } });
  assert.equal(creates, 1);
  assert.deepEqual(calls.find((c) => c[0] === 'tiers').slice(1), [9, 10, 11, 12, 13]);
  const run = (tier) => {
    const rec = [];
    const builder = new Proxy({}, { get: (_, m) => (...a) => { rec.push([m, ...a]); return builder; }, set: () => true });
    builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'] = (rl) => { rec.push(['model', rl]); return builder; };
    builder['tooltips(net.minecraft.network.chat.Component[])'] = (t) => { rec.push(['tooltips', t]); return builder; };
    defs[0](tier, builder);
    return rec;
  };
  const t13 = run(13);
  assert.equal(t13.find((c) => c[0] === 'langValue')[1], 'Overpowered Parallel Control Hatch');
  assert.deepEqual(plain(t13.find((c) => c[0].startsWith('tooltips'))[1]), ['grindless.machine.opv_parallel_hatch.tooltip', 'gtceu.part_sharing.disabled']);
  assert.ok(t13.some((c) => c[0].startsWith('overlayTieredHullModel')));
  // the older tiers keep their names
  assert.equal(run(12).find((c) => c[0] === 'langValue')[1], 'Extreme Parallel Control Hatch');
  assert.equal(run(11).find((c) => c[0] === 'langValue')[1], 'Insane Parallel Control Hatch');
  assert.equal(run(10).find((c) => c[0] === 'langValue')[1], 'Ultimate Parallel Control Hatch');
  assert.equal(run(9).find((c) => c[0] === 'langValue')[1], 'Hyper Parallel Control Hatch');
  assert.deepEqual(plain(run(12).find((c) => c[0].startsWith('tooltips'))[1])[0], 'grindless.machine.uxv_parallel_hatch.tooltip');
  assert.deepEqual(plain(run(11).find((c) => c[0].startsWith('tooltips'))[1])[0], 'grindless.machine.uiv_parallel_hatch.tooltip');
  assert.deepEqual(plain(run(10).find((c) => c[0].startsWith('tooltips'))[1])[0], 'grindless.machine.uev_parallel_hatch.tooltip');
  assert.deepEqual(plain(run(9).find((c) => c[0].startsWith('tooltips'))[1])[0], 'grindless.machine.uhv_parallel_hatch.tooltip');
});

test('x262144 is 4^(tier - EV) at tier 13 and fits an int; the list ends UV, UHV, UEV, UIV, UXV, OpV', () => {
  assert.equal(4 ** (13 - 4), 262144);
  assert.ok(4 ** (13 - 4) <= 2147483647);
  const { G } = load();
  const list = G.parallelHatch.hatches;
  assert.deepEqual(plain(list.slice(-6)), ['gtceu:uv_parallel_hatch', 'gtceu:uhv_parallel_hatch', 'gtceu:uev_parallel_hatch', 'gtceu:uiv_parallel_hatch', 'gtceu:uxv_parallel_hatch', 'gtceu:opv_parallel_hatch']);
  assert.equal(list.filter((id) => id === 'gtceu:opv_parallel_hatch').length, 1);
  assert.equal(new Set(list).size, list.length);
});

function runRecipe(exists, fluidExists = () => true) {
  const src = read('server_scripts', 'grindless/opv/parallel.js');
  const recipes = [];
  const G = {};
  const context = vm.createContext({
    global: { grindless: G },
    console: { info() {}, warn() {}, log() {}, error() {} },
    Item: { exists, of: (s) => ({ item: s }) },
    Fluid: { of: (s, n) => s + ' ' + n, exists: fluidExists },
    ServerEvents: {
      recipes: (cb) => cb({
        recipes: { gtceu: { assembly_line: (id) => {
          const r = { id, items: [], fluids: [], outs: [] };
          recipes.push(r);
          const b = {
            itemInputs: (...a) => { r.items.push(...a); return b; },
            inputFluids: (...a) => { r.fluids.push(...a); return b; },
            itemOutputs: (...a) => { r.outs.push(...a); return b; },
            stationResearch: (f) => { r.research = f({ researchStack: (s) => ({ CWUt: (c) => ({ EUt: (e) => ({ stack: s, cwut: c, eut: e }) }) }) }); return b; },
            EUt: (e) => { r.eut = e; return b; },
            duration: (d) => { r.duration = d; return b; },
          };
          return b;
        } } },
      }),
    },
  });
  vm.runInContext(src, context);
  return { recipes, G };
}

test('the recipe is an assembly line at VA[OpV] researched with the UXV hatch, guarded, with a stable id', () => {
  const { recipes, G } = runRecipe(() => true);
  assert.equal(recipes.length, 1);
  const r = recipes[0];
  assert.deepEqual(plain(r.outs), ['gtceu:opv_parallel_hatch']);
  assert.equal(r.id, 'grindless:opv_parallel_hatch', 'the builder id; GTM prefixes it as grindless:assembly_line/opv_parallel_hatch');
  assert.deepEqual(plain(r.items), ['gtceu:opv_machine_hull', '4x gtceu:opv_field_generator', '4x gtceu:opv_robot_arm', '4x gtceu:opv_sensor', '8x #gtceu:circuits/opv', '4x grindless:tetron_array']);
  assert.ok(r.items.length <= 16, 'an assembly line holds 16 inputs');
  assert.deepEqual(plain(r.fluids), ['gtceu:superfluid_helium_3 1000']);
  assert.equal(r.eut, 503316480, 'VA[OpV]');
  assert.deepEqual(plain(r.research.stack), { item: 'gtceu:uxv_parallel_hatch' });
  assert.equal(G.opvParallelHatch.recipeId, 'grindless:assembly_line/opv_parallel_hatch');
  assert.equal(G.opvParallelHatch.output, 'gtceu:opv_parallel_hatch');
  assert.equal(G.opvParallelHatch.done, true);
  assert.deepEqual(plain(G.opvParallelHatch.missing), []);
});

test('a missing input or fluid skips the recipe and is reported, never throws', () => {
  const a = runRecipe((id) => id !== 'grindless:tetron_array');
  assert.equal(a.recipes.length, 0);
  assert.deepEqual(plain(a.G.opvParallelHatch.missing), ['grindless:tetron_array']);
  assert.equal(a.G.opvParallelHatch.done, true);
  const b = runRecipe(() => true, () => false);
  assert.equal(b.recipes.length, 0);
  assert.deepEqual(plain(b.G.opvParallelHatch.missing), ['gtceu:superfluid_helium_3']);
});

test('the names, the tooltip and the info page exist in en_us and es_es', () => {
  const src = read('client_scripts', 'grindless/opv_parallel_hatch_lang.js');
  for (const key of ['block.gtceu.opv_parallel_hatch', 'grindless.machine.opv_parallel_hatch.tooltip', 'emi.grindless.info.opv_parallel_hatch.0']) {
    assert.equal(src.split(`'${key}'`).length - 1, 2, key);
  }
  assert.ok(src.includes('262144'));
  const info = JSON.parse(fs.readFileSync(path.join(KJS, 'assets/emi/recipe/additions/grindless/opv_parallel_hatch.json'), 'utf8'));
  assert.deepEqual(info.stacks, ['item:gtceu:opv_parallel_hatch']);
  assert.deepEqual(info.text, ['emi.grindless.info.opv_parallel_hatch.0']);
});
