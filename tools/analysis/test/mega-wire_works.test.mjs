// MEGA-1, the LV Wire Works (startup_scripts/grindless/lv/mega_wire_works.js, server_scripts/grindless/lv/mega_wire_works.js): the
// pattern through the real helper, the two modes, the modifier chain, the parallel figure at two hatch tiers (the formulas of
// lib/mega.js), the controller recipe and the names in both languages.
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
  const recipeHandlers = [];
  const calls = [];
  const G = {};
  const b = new Proxy({}, { get: (_, method) => (...args) => { calls.push([method, ...args]); return b; } });
  const errors = [];
  const context = vm.createContext({
    global: { grindless: G },
    console: { info() {}, warn() {}, log() {}, error: (...m) => errors.push(m.join(' ')) },
    GTCEuStartupEvents: { registry: (type, cb) => registry.push([type, cb]) },
    ServerEvents: { recipes: (cb) => recipeHandlers.push(cb) },
    ModifierFunction: { NULL: 'NULL', IDENTITY: 'IDENTITY' },
    RotationState: { NON_Y_AXIS: 'NON_Y_AXIS' },
    GTBlocks: { CASING_STEEL_SOLID: 'CASING_STEEL_SOLID' },
    GTRecipeModifiers: { OC_NON_PERFECT: 'OC_NON_PERFECT', BATCH_MODE: 'BATCH_MODE' },
    Text: { translate: (s) => s },
    Item: { exists: () => true },
    Java: { loadClass: () => ({}) },
  });
  vm.runInContext(read('startup_scripts', 'lib/patterns.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/mega.js'), context);
  vm.runInContext(read('startup_scripts', 'lv/mega_wire_works.js'), context);
  vm.runInContext(read('server_scripts', 'lv/mega_wire_works.js'), context);
  return { G, registry, recipeHandlers, calls, b, errors, context };
}

function register(h) {
  h.registry.forEach(([type, cb]) => { if (type === 'gtceu:machine') cb({ create: (...a) => { h.calls.push(['create', ...a]); return h.b; } }); });
}

test('published figures', () => {
  const h = harness();
  assert.equal(h.G.megaWireWorks.id, 'gtceu:wire_works');
  assert.deepEqual(plain(h.G.megaWireWorks.types), ['gtceu:wiremill', 'gtceu:bender']);
  assert.equal(h.G.megaWireWorks.parallels, 8);
});

test('registers a multiblock with the two modes, wiremill first', () => {
  const h = harness();
  register(h);
  assert.deepEqual(h.calls.find((c) => c[0] === 'create'), ['create', 'wire_works', 'multiblock']);
  const modes = h.calls.filter((c) => c[0] === 'recipeType').map((c) => c[1]);
  assert.deepEqual(modes, ['wiremill', 'bender']);
  assert.ok(h.calls.some((c) => c[0] === 'langValue' && c[1] === 'Wire Works'));
  assert.ok(h.calls.some((c) => c[0] === 'workableCasingModel' && c[2] === 'grindless:block/multiblock/wire_works'));
});

test('modifier chain: mode veto + fixed parallel, non-perfect overclock, batch (4 modifiers plus the veto)', () => {
  const h = harness();
  register(h);
  const mods = h.calls.find((c) => c[0] === 'recipeModifiers');
  assert.ok(mods, 'recipeModifiers installed');
  assert.equal(mods[1], true);
  const list = mods.slice(2);
  assert.equal(list.length, 4, 'veto, parallel, overclock, batch');
  assert.equal(typeof list[0], 'function');
  // the veto: another mode's recipe is rejected, the active mode's passes
  const machine = { getRecipeType: () => ({ registryName: 'gtceu:wiremill' }) };
  assert.equal(list[0](machine, { getType: () => ({ registryName: 'gtceu:bender' }) }), 'NULL');
  assert.equal(list[0](machine, { getType: () => ({ registryName: 'gtceu:wiremill' }) }), 'IDENTITY');
});

test('structure: 5 x 4 x 5, one controller, 73 casing cells, 8 frames, 18 air, height within 16', () => {
  const h = harness();
  register(h);
  const d = h.G.patterns.describe('gtceu:wire_works');
  assert.ok(d, 'pattern described');
  assert.equal(d.slices.length, 5);
  let height = 0;
  const count = { S: 0, X: 0, F: 0, '#': 0 };
  d.slices.forEach((rows) => {
    assert.equal(rows.length, 4);
    height = Math.max(height, rows.length);
    rows.forEach((row) => {
      assert.equal(row.length, 5);
      for (const ch of row) count[ch]++;
    });
  });
  assert.ok(height <= 16);
  assert.deepEqual(plain(count), { S: 1, X: 73, F: 8, '#': 18 });
  // controller in the middle of the front wall
  assert.equal(d.slices[4][1], 'FXSXF');
  assert.equal(d.symbols.F.kind, 'frames');
  assert.deepEqual(plain(d.symbols.F.materials), ['steel']);
  assert.equal(d.symbols.X.kind, 'oneOf');
  const kinds = d.symbols.X.options.map((o) => o.kind + ':' + (o.ability || o.blocks));
  assert.deepEqual(plain(kinds), ['blocks:gtceu:solid_machine_casing', 'part:maintenance', 'part:energy_input', 'part:input_bus', 'part:output_bus']);
  const lim = (i) => d.symbols.X.options[i].limits;
  assert.equal(lim(0).min, 64);
  assert.equal(lim(1).exact, 1);
  assert.equal(lim(2).max, 2);
  assert.equal(lim(2).min, 1);
});

test('parallel figure: fixed ceiling 8, cut by the energy of the hatches (formulas of lib/mega.js)', () => {
  const h = harness();
  const F = h.G.mega.formulas;
  const figure = (voltage, eut, inputs) => F.parallels(F.ceiling(8, null, 1), F.energyCap(voltage, eut), inputs);
  // 1 LV hatch (32 V), 8 EU/t recipe
  assert.equal(figure(32, 8, 64), 4);
  // 1 LV hatch, a 2 EU/t recipe: the ceiling binds
  assert.equal(figure(32, 2, 64), 8);
  // 1 LV hatch, a 30 EU/t recipe: a single copy
  assert.equal(figure(32, 30, 64), 1);
  // 2 MV hatches (256 V): a 8 EU/t recipe reaches the ceiling, a 30 EU/t one is cut to 8 as well, a 64 EU/t one to 4
  assert.equal(figure(256, 8, 64), 8);
  assert.equal(figure(256, 30, 64), 8);
  assert.equal(figure(256, 64, 64), 4);
  // 1 MV hatch (128 V)
  assert.equal(figure(128, 8, 64), 8);
  assert.equal(figure(128, 30, 64), 4);
  // the inputs still limit
  assert.equal(figure(256, 8, 3), 3);
});

test('controller recipe: 4 LV wiremills, 4 LV benders, 4 LV circuits, steel plates; ids exist in the jar names', () => {
  const h = harness();
  const added = [];
  const chainable = (id, type) => {
    const r = { id, type, inputs: [], outputs: [] };
    const c = new Proxy({}, { get: (_, m) => (...a) => {
      if (m === 'itemInputs') r.inputs = a;
      if (m === 'itemOutputs') r.outputs = a;
      if (m === 'EUt') r.eut = a[0];
      if (m === 'duration') r.duration = a[0];
      return c;
    } });
    added.push(r);
    return c;
  };
  h.recipeHandlers.forEach((cb) => cb({ recipes: { gtceu: { assembler: (id) => chainable(id, 'assembler') } } }));
  assert.equal(added.length, 1);
  const r = added[0];
  assert.equal(r.id, h.G.megaWireWorks.crafting);
  assert.deepEqual(plain(r.inputs), ['4x gtceu:lv_wiremill', '4x gtceu:lv_bender', '4x #gtceu:circuits/lv', '8x #forge:plates/steel']);
  assert.deepEqual(plain(r.outputs), ['gtceu:wire_works']);
  assert.equal(r.eut, 30);
  assert.ok(r.duration > 0);
  assert.deepEqual(plain(h.errors), []);
});

test('the integrator stamped the priority line; the lang file names the machine and its tooltips in en_us and es_es', () => {
  for (const [kind, file] of [['startup_scripts', 'lv/mega_wire_works.js'], ['server_scripts', 'lv/mega_wire_works.js']]) {
    assert.ok(/^\/\/ priority: -?\d+\r?\n/.test(read(kind, file)), file);
  }
  const lang = read('client_scripts', 'lv_mega_wire_works_lang.js');
  const store = {};
  vm.runInNewContext(lang, {
    ClientEvents: { lang: (code, cb) => cb({ add: (ns, key, value) => { (store[code] = store[code] || {})[key] = value; } }) },
    console,
  });
  for (const code of ['en_us', 'es_es']) {
    assert.ok(store[code], code);
    for (const key of ['block.gtceu.wire_works', 'grindless.machine.wire_works.tooltip.0', 'grindless.machine.wire_works.tooltip.1', 'grindless.machine.wire_works.tooltip.2']) {
      assert.ok(store[code][key] && store[code][key].length > 0, code + ' ' + key);
    }
  }
  assert.equal(store.en_us['block.gtceu.wire_works'], 'Wire Works');
});
