// UEV-M2: the Stellar Forge (startup_scripts/grindless/uev/stellar_forge.js, server_scripts/grindless/uev/stellar_forge.js): the pure formulas
// (ceiling, veto, plasma once, the 2^31-1 clamp), the pattern through the real helper (<= 16 tall, coil rings), the modifier list and the recipe.
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

function harness() {
  const registry = [];
  const calls = [];
  const G = {};
  const b = new Proxy({}, { get: (_, method) => (...args) => { calls.push([method, ...args]); return b; } });
  const errors = [];
  const names = new Proxy({}, { get: (_, n) => String(n) });
  const context = vm.createContext({
    global: { grindless: G },
    console: { info() {}, warn() {}, log() {}, error: (...m) => errors.push(m.join(' ')) },
    GTCEuStartupEvents: { registry: (type, cb) => registry.push([type, cb]) },
    ModifierFunction: { NULL: 'NULL', IDENTITY: 'IDENTITY' },
    RotationState: { NON_Y_AXIS: 'NON_Y_AXIS' },
    GTBlocks: names,
    GTRecipeModifiers: names,
    Block: { getBlock: (id) => id },
    Text: { translate: (s) => s },
    Item: { exists: () => true },
    Java: { loadClass: () => ({}) },
  });
  G.readJsonTable = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, 'pack', p), 'utf8'));
  for (const f of ['lib/patterns.js', 'lib/coils.js', 'lib/parallel_hatch.js', 'lib/mega.js', 'uev/stellar_forge.js']) {
    vm.runInContext(read('startup_scripts', f), context);
  }
  return { G, registry, calls, b, errors, context };
}

const { G } = harness();
const SF = G.stellarForge;
const C = SF.formulas;

test('9,000 K recipe: 256 copies at 12,600 K, 1,024 with plasma (13,500 K)', () => {
  assert.equal(C.ceilingOf(12600, 9000, 1), 256);
  assert.equal(C.ceilingOf(C.heatOf(12600, true), 9000, 1), 1024);
  assert.equal(C.ceilingOf(C.heatOf(12600, false), 9000, 1), 256);
});

test('the formed parallel hatch multiplies the ceiling', () => {
  assert.equal(C.ceilingOf(12600, 9000, 4096), 256 * 4096);
  assert.equal(C.ceilingOf(13500, 9000, 4096), 1024 * 4096);
  assert.equal(C.ceilingOf(12600, 9000, 0), 256);
});

test('a recipe at the coil temperature runs one copy; below the step it stays x1', () => {
  assert.equal(C.ceilingOf(12600, 12600, 1), 1);
  assert.equal(C.ceilingOf(12600, 12200, 1), 1);
  assert.equal(C.ceilingOf(12600, 12150, 1), 2);
  assert.equal(C.ceilingOf(0, 1800, 1), 1);
});

test('the veto: a recipe hotter than the coil is refused, plasma or not', () => {
  assert.equal(C.vetoed(12600, 12601), true);
  assert.equal(C.vetoed(12600, 12600), false);
  assert.equal(C.vetoed(12600, 13000), true); // the plasma heat (13,500 K) never enters the veto
  assert.equal(C.vetoed(1800, 0), false);
});

test('2^31-1 clamp before GTM: a 1,800 K recipe at 13,500 K with the UEV hatch', () => {
  assert.equal(C.ceilingOf(13500, 1800, 4096), 2147483647);
  assert.equal(C.ceilingOf(13500, 1800, 1), 2 ** 26);
  assert.equal(C.ceilingOf(1e9, 0, 4096), 2147483647);
});

test('plasma and ash: once per run, whatever the copies; nothing without plasma', () => {
  assert.deepEqual(plain(C.plasmaFor(true)), { in: 250, out: 250 });
  assert.deepEqual(plain(C.plasmaFor(false)), { in: 0, out: 0 });
  assert.equal(SF.plasma, 'gtceu:uev_dhe3_plasma');
  assert.equal(SF.ash, 'gtceu:helium_4_ash');
  assert.equal(C.heatOf(12600, true) - C.heatOf(12600, false), 900);
});

test('the pattern: 7 x 16 x 7 (<= 16 tall), four rings of 8 coils, one controller', () => {
  assert.ok(SF.size.height <= 16);
  assert.equal(SF.coilCells, 32);
  assert.equal(SF.type, 'gtceu:electric_blast_furnace');
});

test('registration: electric_blast_furnace only, five modifiers, last one adds the plasma', () => {
  const { registry, calls, b, errors } = harness();
  const reg = registry.filter(([t]) => t === 'gtceu:machine').pop();
  reg[1]({ create: () => b });
  const types = calls.filter((c) => c[0] === 'recipeType').map((c) => c[1]);
  assert.deepEqual(types, ['electric_blast_furnace']);
  const mods = calls.find((c) => c[0] === 'recipeModifiers');
  assert.equal(mods.length - 2, 5);
  assert.equal(mods[1], true);
  assert.equal(typeof mods[2], 'function');
  assert.deepEqual(errors, []);
});

test('the controller recipe: N blast furnaces, coils and circuits, no new type', () => {
  const recs = [];
  const Gs = {};
  const context = vm.createContext({
    global: { grindless: Gs },
    console: { info() {}, warn() {}, log() {}, error() {} },
    Item: { exists: () => true },
    ServerEvents: {
      recipes: (cb) => {
        const chain = (id) => { const r = { id, inputs: [], outs: [] }; recs.push(r); const o = { itemInputs: (...a) => { r.inputs = a; return o; }, itemOutputs: (...a) => { r.outs = a; return o; }, EUt: () => o, duration: () => o }; return o; };
        cb({ recipes: { gtceu: { assembler: chain } } });
      },
    },
  });
  vm.runInContext(read('server_scripts', 'uev/stellar_forge.js'), context);
  assert.equal(recs.length, 1);
  assert.equal(recs[0].id, 'grindless:stellar_forge');
  assert.deepEqual(plain(recs[0].outs), ['gtceu:stellar_forge']);
  assert.deepEqual(plain(recs[0].inputs), ['8x gtceu:electric_blast_furnace', '16x grindless:hftacn_coil_block', '4x #gtceu:circuits/uev']);
});

test('names and tooltips exist in both languages', () => {
  const src = fs.readFileSync(path.join(KJS, 'client_scripts', 'grindless', 'uev_stellar_forge_lang.js'), 'utf8');
  for (const key of ['block.gtceu.stellar_forge', 'grindless.machine.stellar_forge.tooltip.0', 'grindless.machine.stellar_forge.tooltip.1',
    'grindless.machine.stellar_forge.tooltip.2', 'grindless.machine.stellar_forge.tooltip.3', 'emi.grindless.info.stellar_forge.0']) {
    assert.equal(src.split(`'${key}'`).length - 1, 2, key);
  }
});
