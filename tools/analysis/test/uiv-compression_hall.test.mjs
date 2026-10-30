// UIV-M2: the Neutronium Compression Hall (startup_scripts/grindless/uiv/compression_hall.js, server_scripts/grindless/uiv/compression_hall.js): the pellet
// ceiling 4^k (k capped at 4), the energy bound, implosion keeping its explosive, the modifier list, the controller recipe, lang parity and the
// untouched libraries.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
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
    GTRecipeTypes: { get: (n) => 'type:' + n },
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
  for (const f of ['lib/patterns.js', 'lib/coils.js', 'lib/parallel_hatch.js', 'lib/mega.js', 'uiv/shapes.js', 'uiv/compression_hall.js']) {
    vm.runInContext(read('startup_scripts', f), context);
  }
  return { G, registry, calls, b, errors, context };
}

const { G } = harness();
const CH = G.compressionHall;
const C = CH.formulas;
const M = G.mega.formulas;

test('ceiling 4^k for k = 0..5 pellets; k is capped at 4; 0 pellets refuses', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5].map((k) => C.ceilingOf(k, 1)), [0, 4, 16, 64, 256, 256]);
  assert.equal(C.ceilingOf(64, 1), 256);
  assert.equal(C.pelletsOf(5), 4);
  assert.equal(C.pelletsOf(-3), 0);
});

test('the formed parallel hatch multiplies the ceiling; never above 2^31-1', () => {
  assert.equal(C.ceilingOf(4, 16384), 256 * 16384);
  assert.equal(C.ceilingOf(1, 16384), 4 * 16384);
  assert.equal(C.ceilingOf(4, 0), 256);
  assert.equal(C.ceilingOf(4, 1e12), 2147483647);
});

test('energy bound: every copy pays its full EU/t, the hatch voltage caps the copies', () => {
  const UIV = 31457280;
  assert.equal(M.parallels(C.ceilingOf(4, 1), M.energyCap(UIV, 30), null), 256);
  assert.equal(M.parallels(C.ceilingOf(4, 1), M.energyCap(UIV, 1e6), null), 31);
  assert.equal(M.parallels(C.ceilingOf(4, 1), M.energyCap(UIV, UIV * 2), null), 0);
  assert.equal(M.parallels(C.ceilingOf(1, 1), M.energyCap(UIV, 30), null), 4);
});

test('implosion keeps its explosive: no strip in the modifiers (GTM matches the original inputs first)', () => {
  const src = read('startup_scripts', 'uiv/compression_hall.js');
  assert.ok(!/stripped\(|isImplosion|EXPLOSIVES/.test(src));
  assert.ok(src.includes('PL.getParallelAmount(machine, recipe, want)'));
});

test('the pattern: 13 x 10 x 11, at most 16 tall, a press hall silhouette', () => {
  assert.deepEqual(plain(CH.size), { width: 13, height: 10, depth: 11 });
  assert.ok(CH.size.height <= 16);
  assert.equal(CH.pellet, 'grindless:neutronium_pellet');
});

test('registration: compressor and implosion_compressor on one machine, three modifiers (hall, perfect overclock, batch)', () => {
  const { registry, calls, b, errors } = harness();
  const reg = registry.filter(([t]) => t === 'gtceu:machine').pop();
  reg[1]({ create: () => b });
  const types = calls.find((c) => c[0] === 'recipeTypes').slice(1);
  assert.deepEqual(types, ['type:compressor', 'type:implosion_compressor']);
  assert.equal(calls.filter((c) => c[0] === 'recipeType').length, 0);
  const mods = calls.find((c) => c[0] === 'recipeModifiers');
  assert.equal(mods.length - 2, 3);
  assert.equal(mods[1], true);
  assert.equal(typeof mods[2], 'function');
  assert.deepEqual(errors, []);
});

test('the controller recipe: hull, two pistons, two mainframes, UIV circuits, 3 domain inputs; no pellet, no GTM neutronium', () => {
  const recs = [];
  const fluids = [];
  const Gs = {};
  const context = vm.createContext({
    global: { grindless: Gs },
    console: { info() {}, warn() {}, log() {}, error() {} },
    ServerEvents: {
      recipes: (cb) => {
        const o = {};
        const r = { id: null, inputs: [], outs: [] };
        const chain = (id) => { r.id = id; recs.push(r); return o; };
        Object.assign(o, { itemInputs: (...a) => { r.inputs.push(...a); return o; }, itemOutputs: (...a) => { r.outs = a; return o; }, inputFluids: (...a) => { fluids.push(...a); return o; }, stationResearch: () => o, EUt: () => o, duration: () => o });
        cb({ recipes: { gtceu: { assembly_line: chain } } });
      },
    },
    Fluid: { of: (id, n) => id + ' ' + n },
    Item: { exists: () => true, of: (id) => id },
  });
  vm.runInContext(read('server_scripts', 'uiv/compression_hall.js'), context);
  assert.equal(recs.length, 1);
  assert.equal(recs[0].id, 'grindless:neutronium_compression_hall');
  assert.deepEqual(plain(recs[0].outs), ['gtceu:neutronium_compression_hall']);
  assert.deepEqual(plain(recs[0].inputs), ['gtceu:uiv_machine_hull', '2x gtceu:uiv_electric_piston', '2x gtnn:optical_mainframe', '4x #gtceu:circuits/uiv',
    '2x grindless:neutron_supermirror', '2x grindless:target_wheel_blank', '2x grindless:cage_part']);
  assert.ok(!JSON.stringify(recs[0].inputs).includes('neutronium_pellet'));
  assert.ok(!fluids.some((f) => f.startsWith('gtceu:neutronium ')));
  assert.equal(fluids.length, 3);
});

test('names, tooltips and the info page exist in both languages', () => {
  const src = fs.readFileSync(path.join(KJS, 'client_scripts', 'grindless', 'uiv_compression_hall_lang.js'), 'utf8');
  const id = 'neutronium_compression_hall';
  for (const key of [`block.gtceu.${id}`, ...[0, 1].map((n) => `grindless.machine.${id}.tooltip.${n}`), `emi.grindless.info.${id}.0`]) {
    assert.equal(src.split(`'${key}'`).length - 1, 2, key);
  }
  const emi = JSON.parse(fs.readFileSync(path.join(KJS, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'uiv_compression_hall_info.json'), 'utf8'));
  assert.deepEqual(emi.stacks, [`item:gtceu:${id}`]);
});

// UXV-M1 adds tier 12 to lib/parallel_hatch.js (uxv-parallel_hatch.test.mjs pins it), so only lib/mega.js stays pinned here
test('lib/mega.js is untouched', () => {
  let base = null;
  try { base = execFileSync('git', ['rev-parse', '--verify', '-q', '998bc073^{commit}'], { cwd: ROOT, encoding: 'utf8' }).trim(); } catch (e) { base = null; }
  if (!base) return;
  const diff = execFileSync('git', ['diff', '--name-only', base, '--', 'pack/kubejs/startup_scripts/grindless/lib/mega.js'], { cwd: ROOT, encoding: 'utf8' }).trim();
  assert.equal(diff, '');
});
