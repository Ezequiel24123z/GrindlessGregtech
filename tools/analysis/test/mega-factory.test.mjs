// MEGA-8, the UV Mega Factory (startup_scripts/grindless/uv/mega_factory.js, server_scripts/grindless/uv/mega_factory.js): the 15 modes,
// the need map, the module blocks, the modifier chain (gate, parallel, overclock, batch, upkeep), the pattern through the real helper,
// the parallel figure at UV, the controller and module recipes and the names in both languages.
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

const MODULES = {
  separation_module: ['centrifuge', 'electrolyzer', 'sifter'],
  forming_module: ['bender', 'extruder', 'forming_press', 'wiremill'],
  cutting_module: ['cutter', 'lathe', 'laser_engraver'],
  mixing_module: ['mixer', 'chemical_bath', 'autoclave'],
  heat_module: ['arc_furnace', 'alloy_smelter'],
};

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
    StartupEvents: { registry: (type, cb) => registry.push([type, cb]) },
    ServerEvents: { recipes: (cb) => recipeHandlers.push(cb) },
    ModifierFunction: { NULL: 'NULL', IDENTITY: 'IDENTITY', cancel: (t) => 'CANCEL:' + t },
    RotationState: { NON_Y_AXIS: 'NON_Y_AXIS' },
    GTRecipeModifiers: { OC_NON_PERFECT: 'OC_NON_PERFECT', BATCH_MODE: 'BATCH_MODE' },
    Block: { getBlock: (id) => id },
    Text: { translate: (s) => s, gray: (s) => s, literal: (s) => s },
    Item: { exists: () => true },
    Java: { loadClass: () => ({}) },
  });
  vm.runInContext(read('startup_scripts', 'lib/patterns.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/mega.js'), context);
  G.parallelHatch = { part: () => ({ kind: 'part', ability: 'parallel_hatch', limits: { max: 1 }, build: () => null }) };
  vm.runInContext(read('startup_scripts', 'uv/mega_factory.js'), context);
  vm.runInContext(read('server_scripts', 'uv/mega_factory.js'), context);
  return { G, registry, recipeHandlers, calls, b, errors, context };
}

function register(h) {
  h.registry.forEach(([type, cb]) => {
    if (type === 'gtceu:machine') cb({ create: (...a) => { h.calls.push(['create', ...a]); return h.b; } });
    if (type === 'block') cb({ create: (...a) => { h.calls.push(['block', ...a]); return h.b; } });
  });
}

test('published figures: 15 types, each needs its module', () => {
  const h = harness();
  const F = h.G.megaFactory;
  assert.equal(F.id, 'gtceu:mega_factory');
  assert.equal(F.types.length, 15);
  assert.equal(F.cap, 256);
  assert.equal(F.upkeepMb, 250);
  for (const [name, types] of Object.entries(MODULES)) {
    for (const t of types) assert.equal(F.need['gtceu:' + t], 'grindless:' + name);
  }
});

test('registers the five module blocks with a texture each', () => {
  const h = harness();
  register(h);
  const blocks = h.calls.filter((c) => c[0] === 'block').map((c) => c[1]);
  assert.deepEqual(plain(blocks), Object.keys(MODULES).map((n) => 'grindless:' + n));
  const textures = h.calls.filter((c) => c[0] === 'textureAll').map((c) => c[1]);
  assert.deepEqual(plain(textures), Object.keys(MODULES).map((n) => 'grindless:block/uv/' + n));
});

test('registers a multiblock with 15 modes, one recipeType call per type', () => {
  const h = harness();
  register(h);
  assert.deepEqual(h.calls.find((c) => c[0] === 'create' && c[1] === 'mega_factory'), ['create', 'mega_factory', 'multiblock']);
  const modes = h.calls.filter((c) => c[0] === 'recipeType').map((c) => c[1]);
  assert.deepEqual(plain(modes), Object.values(MODULES).flat());
  assert.ok(h.calls.some((c) => c[0] === 'appearanceBlock'));
  assert.ok(h.calls.some((c) => c[0] === 'workableCasingModel' && c[1] === 'gtceu:block/casings/voltage/uv/side' && c[2] === 'grindless:block/multiblock/mega_factory'));
});

test('modifier chain: gate, fixed parallel with hatch, overclock, batch, upkeep last', () => {
  const h = harness();
  register(h);
  const mods = h.calls.find((c) => c[0] === 'recipeModifiers');
  assert.ok(mods);
  assert.equal(mods[1], true);
  const list = mods.slice(2);
  assert.equal(list.length, 5);
  assert.ok(list.every((f) => typeof f === 'function' || typeof f === 'string'));
  assert.equal(list[3], 'BATCH_MODE');
  assert.equal(typeof list[4], 'function', 'upkeep runs after parallel and batch');
  assert.deepEqual(plain(h.errors), []);
});

test('structure: 15 x 12 x 21, one controller, four sockets, part limits, height within 16', () => {
  const h = harness();
  register(h);
  const d = h.G.patterns.describe('gtceu:mega_factory');
  assert.ok(d);
  assert.equal(d.slices.length, 21);
  const count = {};
  d.slices.forEach((rows) => {
    assert.equal(rows.length, 12);
    rows.forEach((row) => {
      assert.equal(row.length, 15);
      for (const ch of row) count[ch] = (count[ch] || 0) + 1;
    });
  });
  assert.ok(12 <= 16);
  assert.equal(count.S, 1);
  assert.equal(count.M, 4);
  assert.equal(d.slices[20][1][7], 'S', 'controller in the middle of the front wall, one row up');
  assert.equal(d.symbols.M.kind, 'oneOf');
  assert.deepEqual(plain(d.symbols.M.options.map((o) => o.kind)), ['blocks', 'air']);
  assert.deepEqual(plain(d.symbols.M.options[0].blocks), Object.keys(MODULES).map((n) => 'grindless:' + n));
  const kinds = d.symbols.X.options.map((o) => o.kind + ':' + (o.ability || o.blocks));
  assert.deepEqual(plain(kinds), ['blocks:gtceu:uv_machine_casing', 'part:maintenance', 'part:energy_input', 'part:input_bus', 'part:output_bus', 'part:input_hatch', 'part:output_hatch', 'part:parallel_hatch']);
  assert.equal(d.symbols.X.options[0].limits.min, count.X - 24);
});

test('parallel figure at UV: 256 x the hatch (256), cut by the energy of the hatches', () => {
  const h = harness();
  const F = h.G.mega.formulas;
  const figure = (hatch, voltage, eut, inputs) => F.parallels(F.ceiling(256, null, hatch), F.energyCap(voltage, eut), inputs);
  assert.equal(F.ceiling(256, null, 256), 65536);
  assert.equal(figure(256, 2097152, 30, 1e7), 65536);
  assert.equal(figure(256, 2097152, 1024, 1e7), 2048);
  assert.equal(figure(256, 2097152, 30, 9), 9);
});

test('recipes: five module assemblers (8 machines, casings, 1 circuit) and the controller (64 machines, 4 circuits)', () => {
  const h = harness();
  const added = [];
  const chainable = (id) => {
    const r = { id, inputs: [], outputs: [] };
    const c = new Proxy({}, { get: (_, m) => (...a) => {
      if (m === 'itemInputs') r.inputs.push(...a);
      if (m === 'itemOutputs') r.outputs = a;
      if (m === 'EUt') r.eut = a[0];
      if (m === 'duration') r.duration = a[0];
      return c;
    } });
    added.push(r);
    return c;
  };
  h.recipeHandlers.forEach((cb) => cb({ recipes: { gtceu: { assembler: (id) => chainable(id) } } }));
  assert.equal(added.length, 6);
  const machines = (r) => r.inputs.filter((i) => /gtceu:uv_(?!machine_casing)/.test(i)).reduce((s, i) => s + parseInt(i, 10), 0);
  for (const name of Object.keys(MODULES)) {
    const r = added.find((x) => x.id === 'grindless:' + name);
    assert.ok(r, name);
    assert.equal(machines(r), 8, name);
    assert.ok(r.inputs.includes('1x #gtceu:circuits/uv'));
    assert.ok(r.inputs.includes('8x gtceu:uv_machine_casing'));
    assert.deepEqual(plain(r.outputs), ['grindless:' + name]);
    for (const t of MODULES[name]) assert.ok(r.inputs.some((i) => i.endsWith('gtceu:uv_' + t)), name + ' ' + t);
  }
  const c = added.find((x) => x.id === h.G.megaFactory.crafting);
  assert.equal(machines(c), 64);
  assert.ok(c.inputs.length <= 9, 'fits the assembler slots');
  assert.ok(c.inputs.includes('4x #gtceu:circuits/uv'));
  assert.deepEqual(plain(c.outputs), ['gtceu:mega_factory']);
  assert.ok(c.eut > 0 && c.duration > 0);
  assert.deepEqual(plain(h.errors), []);
});

test('the lang file names the machine, the modules and the tooltips in en_us and es_es', () => {
  const lang = read('client_scripts', 'uv_mega_factory_lang.js');
  const store = {};
  vm.runInNewContext(lang, {
    ClientEvents: { lang: (code, cb) => cb({ add: (ns, key, value) => { (store[code] = store[code] || {})[key] = value; } }) },
    console,
  });
  const keys = ['block.gtceu.mega_factory', ...[0, 1, 2, 3].map((i) => 'grindless.machine.mega_factory.tooltip.' + i)];
  for (const n of Object.keys(MODULES)) keys.push('block.grindless.' + n, 'tooltip.grindless.' + n + '.0');
  for (const code of ['en_us', 'es_es']) {
    for (const key of keys) assert.ok(store[code] && store[code][key], code + ' ' + key);
  }
  assert.equal(store.en_us['block.gtceu.mega_factory'], 'Mega Factory');
});
