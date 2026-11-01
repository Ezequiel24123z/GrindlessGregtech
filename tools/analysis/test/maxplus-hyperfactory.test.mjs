// XP-M1, the Hyperfactory and the MAX+ parallel hatch (startup_scripts/grindless/maxplus/hyperfactory.js, lib/parallel_hatch.js, lib/mega.js,
// server_scripts/grindless/maxplus/hyperfactory.js): registration and modes, the modifier chain, the pattern through the real helper, the hatch
// registration and its list entry, the int clamp, the two recipes, the names in both languages, the test zone.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const KJS = path.join(ROOT, 'pack', 'kubejs');
const read = (kind, file) => fs.readFileSync(path.join(KJS, kind, 'grindless', file), 'utf8');
const plain = (v) => JSON.parse(JSON.stringify(v));

function harness(exists = () => true) {
  const registry = [];
  const recipeHandlers = [];
  const calls = [];
  const lines = [];
  const G = {};
  const b = new Proxy({}, { get: (_, method) => (...args) => { calls.push([method, ...args]); return b; } });
  const rec = (name) => new Proxy({}, { get: (_, m) => (...a) => { lines.push([name, m, ...a]); return rec(name); } });
  const errors = [];
  const context = vm.createContext({
    global: { grindless: G },
    console: { info() {}, warn() {}, log() {}, error: (...m) => errors.push(m.join(' ')) },
    GTCEuStartupEvents: { registry: (type, cb) => registry.push([type, cb]) },
    ServerEvents: { recipes: (cb) => recipeHandlers.push(cb) },
    ModifierFunction: { NULL: 'NULL', IDENTITY: 'IDENTITY' },
    RotationState: { NON_Y_AXIS: 'NON_Y_AXIS', ALL: 'ALL' },
    PartAbility: { PARALLEL_HATCH: 'PH' },
    GTModelProperties: { IS_FORMED: 'F' },
    GTValues: { VA: { 14: 2013265920 } },
    Block: { getBlock: (id) => id },
    GTRecipeModifiers: { OC_PERFECT_SUBTICK: 'OC_PERFECT_SUBTICK', OC_NON_PERFECT: 'OC_NON_PERFECT', BATCH_MODE: 'BATCH_MODE' },
    Text: { translate: (s) => s, gray: (s) => s },
    Item: { exists, of: (id) => id },
    Fluid: { of: (id, n) => id + ' ' + n, exists: () => true },
    Java: { loadClass: () => function () {} },
  });
  vm.runInContext(read('startup_scripts', 'lib/patterns.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/mega.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/parallel_hatch.js'), context);
  vm.runInContext(read('startup_scripts', 'maxplus/hyperfactory.js'), context);
  context.ServerEvents.recipes = (cb) => recipeHandlers.push(cb);
  vm.runInContext(read('server_scripts', 'maxplus/hyperfactory.js'), context);
  const event = { recipes: { gtceu: { assembly_line: (id) => rec(id) } } };
  return { G, registry, recipeHandlers, calls, lines, errors, b, event };
}

test('published figures and the 4,096 cap', () => {
  const H = harness().G.hyperfactory;
  assert.equal(H.id, 'gtceu:hyperfactory');
  assert.deepEqual(plain(H.types), ['gtceu:assembler', 'gtceu:circuit_assembler', 'gtceu:assembly_line', 'gtceu:forming_press', 'gtceu:laser_engraver']);
  assert.equal(H.cap, 4096);
  assert.equal(H.hatch, 'gtceu:max_maxplus_parallel_hatch');
  assert.equal(H.energyHatch, 'gtceu:max_maxplus_energy_hatch_1024a');
  assert.ok(H.partCells >= H.partMax, 'enough part cells for every part at its maximum');
});

test('registers one multiblock with the five types and the mega chain', () => {
  const h = harness();
  h.registry.filter(([t]) => t === 'gtceu:machine').forEach(([, cb]) => cb({ create: (...a) => { h.calls.push(['create', ...a]); return h.b; } }));
  const creates = h.calls.filter((c) => c[0] === 'create');
  assert.ok(creates.some((c) => c[1] === 'hyperfactory' && c[2] === 'multiblock'));
  assert.deepEqual(h.calls.filter((c) => c[0] === 'recipeType').map((c) => c[1]), ['assembler', 'circuit_assembler', 'assembly_line', 'forming_press', 'laser_engraver']);
  const mods = h.calls.find((c) => c[0] === 'recipeModifiers');
  assert.ok(mods && mods[1] === true);
  assert.ok(h.calls.some((c) => c[0] === 'workableCasingModel' && c[1] === 'grindless:block/max/mirror_shell_segment'));
  const d = h.G.patterns.describe('gtceu:hyperfactory');
  assert.ok(d, 'pattern registered');
  assert.equal(d.slices.length, 21);
  const kinds = JSON.stringify(plain(d.symbols));
  for (const a of ['parallel_hatch', 'data_access', 'energy_input', 'input_bus']) assert.match(kinds, new RegExp(a));
});

test('the MAX+ hatch is a second tier-14 create, reflected to 4,194,304, and is in the hatch list once', () => {
  const h = harness();
  const calls = [];
  const bb = new Proxy({}, { get: (_, m) => (...a) => { calls.push([m, ...a]); return bb; } });
  const names = [];
  h.registry.filter(([t]) => t === 'gtceu:machine').forEach(([, cb]) => cb({ create: (n) => { names.push(n); return bb; } }));
  assert.ok(names.includes('maxplus_parallel_hatch'));
  const src = read('startup_scripts', 'lib/parallel_hatch.js');
  assert.match(src, /setInt\(hatch, 4194304\)/);
  assert.equal(4 ** 11, 4194304);
  const list = h.G.parallelHatch.hatches;
  assert.equal(list.filter((i) => i === 'gtceu:max_maxplus_parallel_hatch').length, 1);
});

test('lib/mega.js clamps copies to an int: 4,096 x 4,194,304 never reaches getParallelAmount as 2^34', () => {
  const F = harness().G.mega.formulas;
  assert.equal(F.ceiling(4096, null, 4194304), 2 ** 34);
  assert.equal(F.parallels(2 ** 34, 2 ** 42, null), 2147483647);
  assert.equal(F.parallels(2 ** 34, 1000, null), 1000);
  assert.equal(F.parallels(4096, 2 ** 42, 17), 17);
});

test('the controller and the hatch recipes are published, at VA[MAX], with the literal 4,800 t', () => {
  const h = harness();
  h.recipeHandlers.forEach((cb) => cb(h.event));
  assert.deepEqual(h.G.hyperfactoryRecipes.skipped, []);
  const ids = h.lines.map((l) => l[0]);
  assert.ok(ids.includes('grindless:maxplus_parallel_hatch') && ids.includes('grindless:hyperfactory'));
  const src = read('server_scripts', 'maxplus/hyperfactory.js');
  assert.match(src, /EUt\(VA_MAX\)\.duration\(4800\)/);
  assert.equal(h.G.hyperfactoryRecipes.specs.hatch.research, 'gtceu:max_parallel_hatch');
});

test('an unknown id skips a recipe instead of throwing', () => {
  const h = harness((id) => id !== 'grindless:maxplus_sensor');
  h.recipeHandlers.forEach((cb) => cb(h.event));
  assert.equal(h.G.hyperfactoryRecipes.skipped.length, 2);
  assert.deepEqual(h.errors.filter((e) => /failed/.test(e)), []);
});

test('names in both languages, with \\u escapes', () => {
  const src = read('client_scripts', '../../client_scripts/grindless/maxplus_hyperfactory_lang.js'.replace('../../client_scripts/grindless/', ''));
  const keys = [...src.matchAll(/^\s*\['([^']+)', '((?:[^'\\]|\\.)*)', '((?:[^'\\]|\\.)*)'\]/gm)];
  const names = keys.map((k) => k[1]);
  for (const k of ['block.gtceu.hyperfactory', 'block.gtceu.max_maxplus_parallel_hatch', 'grindless.machine.hyperfactory.tooltip.0', 'grindless.machine.maxplus_parallel_hatch.tooltip', 'emi.grindless.info.max_maxplus_parallel_hatch.0']) assert.ok(names.includes(k), k);
  assert.ok(keys.every((k) => k[2] && k[3] && k[2] !== k[3]), 'every key has distinct en and es text');
  assert.ok(!/[^\x00-\x7f]/.test(src), 'ASCII only');
});

test('the test zone row exists and its band is disjoint from every other row', () => {
  const zones = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'test', 'zones.json'), 'utf8'));
  const rows = (zones.zones || zones).filter((z) => z && z.id);
  const mine = rows.find((z) => z.id === 'maxplus_hyperfactory');
  assert.ok(mine, 'maxplus_hyperfactory row');
  assert.deepEqual(plain(mine.tests), ['gg_test_maxplus_hyperfactory']);
  const hit = (a, b) => a[0] <= b[1] && b[0] <= a[1];
  for (const z of rows) {
    if (z === mine || !z.x || !z.z || !z.y) continue;
    assert.ok(!(hit(mine.x, z.x) && hit(mine.y, z.y) && hit(mine.z, z.z)), `overlaps ${z.id}`);
  }
});
