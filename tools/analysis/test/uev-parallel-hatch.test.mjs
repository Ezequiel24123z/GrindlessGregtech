// UEV-M1: the UEV parallel hatch (startup_scripts/grindless/lib/parallel_hatch.js, server_scripts/grindless/uev/parallel_hatch.js): tier 10 = 4^(10-2)
// = x4096, registered with the UHV one, in the hatch list after it, the recipe one tier up, the names in both languages.
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

test('the hatch registration covers tiers 9 and 10, one definition per tier', () => {
  const { registry } = load();
  const machine = registry.find(([t]) => t === 'gtceu:machine');
  assert.ok(machine);
  const calls = [];
  const defs = [];
  const b = new Proxy({}, { get: (_, m) => (...a) => { calls.push([m, ...a]); if (m === 'definition') defs.push(a[0]); return b; } });
  machine[1]({ create: () => b });
  const tiers = calls.find((c) => c[0] === 'tiers');
  assert.deepEqual(tiers.slice(1), [9, 10, 11]);
  const out = {};
  for (const tier of [9, 10, 11]) {
    const rec = [];
    const builder = new Proxy({}, { get: (_, m) => (...a) => { rec.push([m, ...a]); return builder; }, set: () => true });
    builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'] = (rl) => { rec.push(['model', rl]); return builder; };
    builder['tooltips(net.minecraft.network.chat.Component[])'] = (t) => { rec.push(['tooltips', t]); return builder; };
    defs[0](tier, builder);
    out[tier] = rec;
  }
  assert.deepEqual(plain(out[10].find((c) => c[0].startsWith('tooltips'))[1]), ['grindless.machine.uev_parallel_hatch.tooltip', 'gtceu.part_sharing.disabled']);
  assert.deepEqual(plain(out[9].find((c) => c[0].startsWith('tooltips'))[1]), ['grindless.machine.uhv_parallel_hatch.tooltip', 'gtceu.part_sharing.disabled']);
  assert.equal(out[10].find((c) => c[0] === 'langValue')[1], 'Ultimate Parallel Control Hatch');
});

test('x4096 is 4^(tier - EV) at tier 10; the list ends UV, UHV, UEV', () => {
  assert.equal(4 ** (10 - 4), 4096);
  assert.equal(4 ** (9 - 4), 1024);
  const { G } = load();
  const list = G.parallelHatch.hatches;
  assert.deepEqual(plain(list.slice(-4, -1)), ['gtceu:uv_parallel_hatch', 'gtceu:uhv_parallel_hatch', 'gtceu:uev_parallel_hatch']);
  assert.equal(new Set(list).size, list.length);
});

test('the recipe is an assembly line with station research and fluids, guarded, with a stable id', () => {
  const src = read('server_scripts', 'grindless/uev/parallel_hatch.js');
  const calls = { ins: null, fluids: null, out: null, research: false, id: null };
  const G = {};
  const b = {
    itemInputs: (v) => { calls.ins = v; }, inputFluids: (...v) => { calls.fluids = v; }, itemOutputs: (v) => { calls.out = v; },
    stationResearch: () => { calls.research = true; }, EUt: () => b, duration: () => b,
  };
  const context = vm.createContext({
    global: { grindless: G },
    console: { info() {}, warn() {}, log() {}, error() {} },
    Item: { exists: () => true, of: (x) => x },
    Fluid: { of: (id, n) => `${id}:${n}` },
    ServerEvents: { recipes: (cb) => cb({ recipes: { gtceu: { assembly_line: (id) => { calls.id = id; return b; } } } }) },
  });
  vm.runInContext(src, context);
  assert.equal(calls.out, 'gtceu:uev_parallel_hatch');
  assert.ok(plain(calls.ins).includes('gtceu:uev_machine_hull'));
  assert.ok(plain(calls.ins).includes('4x #gtceu:circuits/uev'));
  assert.equal(calls.fluids.length, 2);
  assert.equal(calls.research, true);
  assert.equal(calls.id, 'grindless:uev_parallel_hatch');
  assert.equal(G.uevParallelHatch.recipeId, 'grindless:assembly_line/uev_parallel_hatch');
  assert.equal(G.uevParallelHatch.done, true);
});

test('the names and the tooltip exist in en_us and es_es', () => {
  const src = read('client_scripts', 'grindless/uev_parallel_hatch_lang.js');
  for (const key of ['block.gtceu.uev_parallel_hatch', 'grindless.machine.uev_parallel_hatch.tooltip']) {
    assert.equal(src.split(`'${key}'`).length - 1, 2, key);
  }
  assert.ok(src.includes('4096'));
});
