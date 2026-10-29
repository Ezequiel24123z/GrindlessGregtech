// UXV-M1: the UXV parallel hatch (startup_scripts/grindless/lib/parallel_hatch.js, server_scripts/grindless/uxv/parallel_hatch.js): tier 12 = 4^(12-4)
// = x65536, registered with the UHV, UEV and UIV ones, in the hatch list after them, the assembly line researched with the UIV hatch, the names in both languages.
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

test('the one create covers tiers 9 to 12; tier 12 is named, titled and modelled as the UXV hatch', () => {
  const { registry } = load();
  const machine = registry.find(([t]) => t === 'gtceu:machine');
  const calls = [];
  let creates = 0;
  const defs = [];
  const b = new Proxy({}, { get: (_, m) => (...a) => { calls.push([m, ...a]); if (m === 'definition') defs.push(a[0]); return b; } });
  machine[1]({ create: () => { creates++; return b; } });
  assert.equal(creates, 1);
  assert.deepEqual(calls.find((c) => c[0] === 'tiers').slice(1), [9, 10, 11, 12]);
  const run = (tier) => {
    const rec = [];
    const builder = new Proxy({}, { get: (_, m) => (...a) => { rec.push([m, ...a]); return builder; }, set: () => true });
    builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'] = (rl) => { rec.push(['model', rl]); return builder; };
    builder['tooltips(net.minecraft.network.chat.Component[])'] = (t) => { rec.push(['tooltips', t]); return builder; };
    defs[0](tier, builder);
    return rec;
  };
  const t12 = run(12);
  assert.equal(t12.find((c) => c[0] === 'langValue')[1], 'Extreme Parallel Control Hatch');
  assert.deepEqual(plain(t12.find((c) => c[0].startsWith('tooltips'))[1]), ['grindless.machine.uxv_parallel_hatch.tooltip', 'gtceu.part_sharing.disabled']);
  assert.ok(t12.some((c) => c[0].startsWith('overlayTieredHullModel')));
  // the older tiers keep their names
  assert.equal(run(11).find((c) => c[0] === 'langValue')[1], 'Insane Parallel Control Hatch');
  assert.deepEqual(plain(run(11).find((c) => c[0].startsWith('tooltips'))[1])[0], 'grindless.machine.uiv_parallel_hatch.tooltip');
  assert.deepEqual(plain(run(10).find((c) => c[0].startsWith('tooltips'))[1])[0], 'grindless.machine.uev_parallel_hatch.tooltip');
  assert.deepEqual(plain(run(9).find((c) => c[0].startsWith('tooltips'))[1])[0], 'grindless.machine.uhv_parallel_hatch.tooltip');
});

test('x65536 is 4^(tier - EV) at tier 12; the list ends UV, UHV, UEV, UIV, UXV', () => {
  assert.equal(4 ** (12 - 4), 65536);
  const { G } = load();
  const list = G.parallelHatch.hatches;
  assert.deepEqual(plain(list.slice(-5)), ['gtceu:uv_parallel_hatch', 'gtceu:uhv_parallel_hatch', 'gtceu:uev_parallel_hatch', 'gtceu:uiv_parallel_hatch', 'gtceu:uxv_parallel_hatch']);
  assert.equal(new Set(list).size, list.length);
});

function runRecipe(exists) {
  const src = read('server_scripts', 'grindless/uxv/parallel_hatch.js');
  const recipes = [];
  const G = {};
  const context = vm.createContext({
    global: { grindless: G },
    console: { info() {}, warn() {}, log() {}, error() {} },
    Item: { exists, of: (s) => ({ item: s }) },
    Fluid: { of: (s, n) => s + ' ' + n, exists: () => true },
    ServerEvents: {
      recipes: (cb) => cb({
        recipes: { gtceu: { assembly_line: (id) => {
          const r = { id, items: [], fluids: [], outs: [] };
          recipes.push(r);
          const b = {
            itemInputs: (...a) => { r.items.push(...a); return b; },
            inputFluids: (...a) => { r.fluids.push(...a); return b; },
            itemOutputs: (...a) => { r.outs.push(...a); return b; },
            stationResearch: (f) => { r.research = f({ researchStack: (s) => ({ CWUt: () => ({ EUt: () => s }) }) }); return b; },
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

test('the recipe is an assembly line researched with the UIV hatch, guarded, with a stable id', () => {
  const { recipes, G } = runRecipe(() => true);
  assert.equal(recipes.length, 1);
  const r = recipes[0];
  assert.deepEqual(plain(r.outs), ['gtceu:uxv_parallel_hatch']);
  assert.equal(r.id, 'grindless:uxv_parallel_hatch', 'the builder id; GTM prefixes it as grindless:assembly_line/uxv_parallel_hatch');
  for (const it of ['gtceu:uxv_machine_hull', '4x gtnn:spintronic_mainframe', 'grindless:uxv_field_generator', 'grindless:uxv_emitter']) assert.ok(r.items.includes(it), it);
  assert.ok(r.items.length <= 16, 'an assembly line holds 16 inputs');
  assert.ok(r.fluids.includes('gtceu:filtered_disk_plasma 1000'));
  assert.ok(r.fluids.some((f) => f.startsWith('gtceu:soldering_alloy ')));
  assert.ok(r.fluids.some((f) => f.startsWith('gtceu:lubricant ')));
  assert.deepEqual(plain(r.research), { item: 'gtceu:uiv_parallel_hatch' });
  assert.equal(G.uxvParallelHatch.recipeId, 'grindless:assembly_line/uxv_parallel_hatch');
  assert.equal(G.uxvParallelHatch.done, true);
  assert.deepEqual(plain(G.uxvParallelHatch.missing), []);
});

test('a missing input skips the recipe and is reported, never throws', () => {
  const { recipes, G } = runRecipe((id) => id !== 'grindless:uxv_emitter');
  assert.equal(recipes.length, 0);
  assert.deepEqual(plain(G.uxvParallelHatch.missing), ['grindless:uxv_emitter']);
  assert.equal(G.uxvParallelHatch.done, true);
});

test('the names, the tooltip and the info page exist in en_us and es_es', () => {
  const src = read('client_scripts', 'grindless/uxv_parallel_hatch_lang.js');
  for (const key of ['block.gtceu.uxv_parallel_hatch', 'grindless.machine.uxv_parallel_hatch.tooltip', 'emi.grindless.info.uxv_parallel_hatch.0']) {
    assert.equal(src.split(`'${key}'`).length - 1, 2, key);
  }
  assert.ok(src.includes('65536'));
  assert.ok(/^\/\/ priority: \d+/m.test(src), 'the integrator stamps the load priority');
  const info = JSON.parse(fs.readFileSync(path.join(KJS, 'assets/emi/recipe/additions/grindless/uxv_parallel_hatch.json'), 'utf8'));
  assert.deepEqual(info.stacks, ['item:gtceu:uxv_parallel_hatch']);
});
