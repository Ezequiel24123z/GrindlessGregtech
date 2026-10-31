// MAX-M1: the MAX parallel hatch (startup_scripts/grindless/lib/parallel_hatch.js, server_scripts/grindless/max/parallel.js): tier 14 = 4^(14-4)
// = x1048576, registered by the same create as the UHV to OpV ones, listed after them, the assembly line researched with the OpV hatch at VA[MAX],
// the names in both languages, its test zone and its EMI route held until A3.
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
const VA_MAX = 2013265920;

function load() {
  const registry = [];
  const G = {};
  const context = vm.createContext({
    global: { grindless: G },
    console: { info() {}, warn() {}, log() {}, error() {} },
    GTCEuStartupEvents: { registry: (type, cb) => registry.push([type, cb]) },
    Java: { loadClass: () => function () {} },
    GTRecipeModifiers: {}, ModifierFunction: {}, PartAbility: { PARALLEL_HATCH: 'PH' }, RotationState: { ALL: 'ALL' },
    GTModelProperties: { IS_FORMED: 'F' }, Text: { translate: (s) => s },
  });
  vm.runInContext(read('startup_scripts', 'grindless/lib/parallel_hatch.js'), context);
  return { G, registry };
}

test('the one create covers tiers 9 to 14; tier 14 is named, titled and modelled as the MAX hatch, older tiers keep theirs', () => {
  const { registry } = load();
  const machine = registry.find(([t]) => t === 'gtceu:machine');
  const calls = [];
  const defs = [];
  let creates = 0;
  const b = new Proxy({}, { get: (_, m) => (...a) => { calls.push([m, ...a]); if (m === 'definition') defs.push(a[0]); return b; } });
  machine[1]({ create: () => { creates++; return b; } });
  assert.equal(creates, 1);
  assert.deepEqual(calls.find((c) => c[0] === 'tiers').slice(1), [9, 10, 11, 12, 13, 14]);
  const run = (tier) => {
    const rec = [];
    const builder = new Proxy({}, { get: (_, m) => (...a) => { rec.push([m, ...a]); return builder; }, set: () => true });
    builder['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'] = (rl) => { rec.push(['model', rl]); return builder; };
    builder['tooltips(net.minecraft.network.chat.Component[])'] = (t) => { rec.push(['tooltips', t]); return builder; };
    defs[0](tier, builder);
    return rec;
  };
  const t14 = run(14);
  assert.equal(t14.find((c) => c[0] === 'langValue')[1], 'Maximum Parallel Control Hatch');
  assert.deepEqual(plain(t14.find((c) => c[0].startsWith('tooltips'))[1]), ['grindless.machine.max_parallel_hatch.tooltip', 'gtceu.part_sharing.disabled']);
  const names = { 13: ['Overpowered', 'opv'], 12: ['Extreme', 'uxv'], 11: ['Insane', 'uiv'], 10: ['Ultimate', 'uev'], 9: ['Hyper', 'uhv'] };
  for (const [tier, [title, id]] of Object.entries(names)) {
    const rec = run(Number(tier));
    assert.equal(rec.find((c) => c[0] === 'langValue')[1], `${title} Parallel Control Hatch`);
    assert.equal(plain(rec.find((c) => c[0].startsWith('tooltips'))[1])[0], `grindless.machine.${id}_parallel_hatch.tooltip`);
  }
});

test('x1048576 is 4^(tier - EV) at tier 14 and fits an int; the list ends with the MAX hatch once', () => {
  assert.equal(4 ** (14 - 4), 1048576);
  assert.ok(4 ** (14 - 4) <= 2147483647);
  const list = load().G.parallelHatch.hatches;
  assert.equal(list[list.length - 1], 'gtceu:max_parallel_hatch');
  assert.equal(list[list.length - 2], 'gtceu:opv_parallel_hatch');
  assert.equal(list.filter((id) => id === 'gtceu:max_parallel_hatch').length, 1);
  assert.equal(new Set(list).size, list.length);
});

function runRecipe(exists, fluidExists = () => true) {
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
  vm.runInContext(read('server_scripts', 'grindless/max/parallel.js'), context);
  return { recipes, G };
}

test('the recipe is an assembly line at VA[MAX] researched with the OpV hatch, guarded, with a stable id', () => {
  const { recipes, G } = runRecipe(() => true);
  assert.equal(recipes.length, 1);
  const r = recipes[0];
  assert.deepEqual(plain(r.outs), ['gtceu:max_parallel_hatch']);
  assert.equal(r.id, 'grindless:max_parallel_hatch', 'the builder id; GTM prefixes it as grindless:assembly_line/max_parallel_hatch');
  assert.deepEqual(plain(r.items), ['gtceu:max_machine_hull', '2x grindless:max_field_generator', '2x grindless:max_robot_arm', '4x #gtceu:circuits/max']);
  assert.deepEqual(plain(r.fluids), ['gtceu:superfluid_helium_3 1000']);
  assert.equal(r.eut, VA_MAX, 'VA[MAX]');
  assert.ok(r.eut <= 2013265920);
  assert.deepEqual(plain(r.research.stack), { item: 'gtceu:opv_parallel_hatch' });
  assert.equal(G.maxParallelHatch.recipeId, 'grindless:assembly_line/max_parallel_hatch');
  assert.equal(G.maxParallelHatch.output, 'gtceu:max_parallel_hatch');
  assert.equal(G.maxParallelHatch.done, true);
  assert.deepEqual(plain(G.maxParallelHatch.missing), []);
});

test('a missing input or fluid skips the recipe and is reported, never throws', () => {
  const a = runRecipe((id) => id !== 'grindless:max_robot_arm');
  assert.equal(a.recipes.length, 0);
  assert.deepEqual(plain(a.G.maxParallelHatch.missing), ['grindless:max_robot_arm']);
  const b = runRecipe(() => true, () => false);
  assert.equal(b.recipes.length, 0);
  assert.deepEqual(plain(b.G.maxParallelHatch.missing), ['gtceu:superfluid_helium_3']);
  assert.equal(b.G.maxParallelHatch.done, true);
});

test('names, tooltip and info page in both languages; the EMI route is held; the test zone and overlay exist', () => {
  const src = read('client_scripts', 'grindless/max_parallel_hatch_lang.js');
  for (const key of ['block.gtceu.max_parallel_hatch', 'grindless.machine.max_parallel_hatch.tooltip', 'emi.grindless.info.max_parallel_hatch.0']) {
    assert.equal(src.split(`'${key}'`).length - 1, 2, key);
  }
  assert.ok(src.includes('1048576'));
  const info = JSON.parse(read('assets', 'emi/recipe/additions/grindless/max_parallel_hatch.json'));
  assert.deepEqual(info.stacks, ['item:gtceu:max_parallel_hatch']);
  const emi = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/analysis/emi_coverage.json'), 'utf8'));
  assert.ok(emi.pendingRoutes.some((r) => r.id === 'grindless:assembly_line/max_parallel_hatch'));
  const zones = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/test/zones.json'), 'utf8'));
  const z = (zones.zones || zones).find((x) => x.id === 'max_parallel');
  assert.deepEqual(z.x, [39320, 39383]);
  assert.deepEqual(z.tests, ['max_parallel']);
  assert.ok(fs.existsSync(path.join(ROOT, 'tools/test/overlay/kubejs/server_scripts/gg_test_max_parallel.js')));
});
