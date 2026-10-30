// MEGA-9, the UHV Quantum Fabricator (startup_scripts/grindless/uhv/mega_quantum_fabricator.js, server_scripts/grindless/uhv/mega_quantum_fabricator.js):
// the pattern through the real helper, the five modes, the modifier chain (perfect overclock), the parallel figure at the UV and UHV
// hatch (the formulas of lib/mega.js), the footprint inside the largest GTM cleanroom, the recipes and the names in both languages.
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
  const blockHandlers = [];
  const recipeHandlers = [];
  const calls = [];
  const G = {};
  const b = new Proxy({}, { get: (_, method) => (...args) => { calls.push([method, ...args]); return b; } });
  const errors = [];
  const context = vm.createContext({
    global: { grindless: G },
    console: { info() {}, warn() {}, log() {}, error: (...m) => errors.push(m.join(' ')) },
    GTCEuStartupEvents: { registry: (type, cb) => registry.push([type, cb]) },
    StartupEvents: { registry: (type, cb) => blockHandlers.push([type, cb]) },
    ServerEvents: { recipes: (cb) => recipeHandlers.push(cb) },
    ModifierFunction: { NULL: 'NULL', IDENTITY: 'IDENTITY' },
    RotationState: { NON_Y_AXIS: 'NON_Y_AXIS' },
    Block: { getBlock: (id) => id },
    GTRecipeModifiers: { OC_PERFECT_SUBTICK: 'OC_PERFECT_SUBTICK', OC_NON_PERFECT: 'OC_NON_PERFECT', BATCH_MODE: 'BATCH_MODE' },
    Text: { translate: (s) => s, gray: (s) => s },
    Item: { exists: () => true, of: (id) => id },
    Fluid: { of: (id, n) => ({ id, n }) },
    Java: { loadClass: () => ({}) },
  });
  vm.runInContext(read('startup_scripts', 'lib/patterns.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/mega.js'), context);
  // the real parallel hatch part predicate is a part with the 'parallel_hatch' ability; a stand-in is enough here
  G.parallelHatch = { part: () => ({ kind: 'part', ability: 'parallel_hatch', limits: { max: 1 }, build: () => null }) };
  vm.runInContext(read('startup_scripts', 'uhv/mega_quantum_fabricator.js'), context);
  vm.runInContext(read('server_scripts', 'uhv/mega_quantum_fabricator.js'), context);
  return { G, registry, blockHandlers, recipeHandlers, calls, b, errors, context };
}

function register(h) {
  h.registry.forEach(([type, cb]) => { if (type === 'gtceu:machine') cb({ create: (...a) => { h.calls.push(['create', ...a]); return h.b; } }); });
}

test('published figures', () => {
  const h = harness();
  assert.equal(h.G.megaQuantumFabricator.id, 'gtceu:quantum_fabricator');
  assert.deepEqual(plain(h.G.megaQuantumFabricator.types), ['gtceu:assembler', 'gtceu:circuit_assembler', 'gtceu:forming_press', 'gtceu:laser_engraver', 'gtceu:cutter']);
  assert.equal(h.G.megaQuantumFabricator.cap, 1024);
  assert.deepEqual(plain(h.G.megaQuantumFabricator.size), { width: 11, height: 10, depth: 12 });
});

test('registers a multiblock with the five modes, assembler first, in the UHV casing look', () => {
  const h = harness();
  register(h);
  assert.deepEqual(h.calls.find((c) => c[0] === 'create'), ['create', 'quantum_fabricator', 'multiblock']);
  const modes = h.calls.filter((c) => c[0] === 'recipeType').map((c) => c[1]);
  assert.deepEqual(modes, ['assembler', 'circuit_assembler', 'forming_press', 'laser_engraver', 'cutter']);
  assert.ok(h.calls.some((c) => c[0] === 'langValue' && c[1] === 'Quantum Fabricator'));
  assert.ok(h.calls.some((c) => c[0] === 'workableCasingModel' && c[2] === 'grindless:block/multiblock/quantum_fabricator'));
});

test('registers the field ring casing block', () => {
  const h = harness();
  const created = [];
  h.blockHandlers.forEach(([type, cb]) => { if (type === 'block') cb({ create: (id) => { created.push(id); return h.b; } }); });
  assert.deepEqual(created, ['grindless:field_ring_casing']);
  assert.ok(h.calls.some((c) => c[0] === 'textureAll' && c[1] === 'grindless:block/uhv/field_ring_casing'));
  assert.ok(fs.existsSync(path.join(KJS, 'assets', 'grindless', 'textures', 'block', 'uhv', 'field_ring_casing.png')));
});

test('modifier chain: mode veto + fixed parallel with hatch, perfect overclock, batch, no discount', () => {
  const h = harness();
  register(h);
  const mods = h.calls.find((c) => c[0] === 'recipeModifiers');
  assert.ok(mods, 'recipeModifiers installed');
  assert.equal(mods[1], true);
  const list = mods.slice(2);
  assert.equal(list.length, 4, 'veto, parallel, overclock, batch');
  assert.ok(list.includes('OC_PERFECT_SUBTICK'), 'perfect overclock');
  assert.ok(!list.includes('OC_NON_PERFECT'));
  assert.ok(list.indexOf('OC_PERFECT_SUBTICK') < list.indexOf('BATCH_MODE'), 'overclock before batch');
  const machine = { getRecipeType: () => ({ registryName: 'gtceu:cutter' }) };
  assert.equal(list[0](machine, { getType: () => ({ registryName: 'gtceu:assembler' }) }), 'NULL');
  assert.equal(list[0](machine, { getType: () => ({ registryName: 'gtceu:cutter' }) }), 'IDENTITY');
});

test('structure: 11 x 10 x 12, one controller, a field ring, fits the largest GTM cleanroom interior (13 x 13 x 13), height within 16', () => {
  const h = harness();
  register(h);
  const d = h.G.patterns.describe('gtceu:quantum_fabricator');
  assert.ok(d, 'pattern described');
  assert.equal(d.slices.length, 12);
  const count = {};
  d.slices.forEach((rows) => {
    assert.equal(rows.length, 10);
    rows.forEach((row) => {
      assert.equal(row.length, 11);
      for (const ch of row) count[ch] = (count[ch] || 0) + 1;
    });
  });
  assert.ok(11 <= 13 && 10 <= 13 && 12 <= 13 && 10 <= 16);
  assert.ok(11 <= 12 && 10 <= 11 && 12 <= 12, 'room for the controller face inside the cleanroom');
  assert.equal(count.S, 1);
  assert.equal(count.R, 2 * (11 + 12) - 4, 'one ring round the walls');
  assert.equal(d.slices[11][1][5], 'S', 'controller in the middle of the front wall, one row up');
  assert.equal(d.symbols.X.kind, 'oneOf');
  const kinds = d.symbols.X.options.map((o) => o.kind + ':' + (o.ability || o.blocks));
  assert.deepEqual(plain(kinds), ['blocks:gtceu:uhv_machine_casing', 'part:maintenance', 'part:energy_input', 'part:input_bus', 'part:output_bus', 'part:input_hatch', 'part:parallel_hatch']);
  // parts take at most 18 cells (1 + 2 + 6 + 4 + 4 + 1), so the casing floor min leaves exactly that room
  assert.equal(d.symbols.X.options[0].limits.min, count.X - 18);
  const fluid = d.symbols.X.options.find((o) => o.ability === 'input_hatch');
  assert.ok(fluid.limits.min >= 1, 'a fluid input hatch is required (molten tin of the circuit assembler)');
  assert.equal(d.symbols.R.blocks[0], 'grindless:field_ring_casing');
  assert.equal(d.symbols.L.blocks[0], 'gtceu:laminated_glass');
});

test('parallel figure: ceiling 1024 x the hatch, cut by the energy of the hatches (formulas of lib/mega.js)', () => {
  const h = harness();
  const F = h.G.mega.formulas;
  const figure = (hatch, voltage, eut, inputs) => F.parallels(F.ceiling(1024, null, hatch), F.energyCap(voltage, eut), inputs);
  const UHV_V = 2097152;
  const UV_V = 524288;
  assert.equal(F.ceiling(1024, null, 1), 1024);
  assert.equal(F.ceiling(1024, null, 256), 262144, 'UV hatch');
  assert.equal(F.ceiling(1024, null, 1024), 1048576, 'UHV hatch');
  // a 2 EU/t probe and a UHV hatch: 1,048,576 by energy exactly, so the ceiling and the energy cap meet
  assert.equal(figure(1024, UHV_V, 2, 10000000), 1048576);
  assert.equal(figure(256, UHV_V, 2, 10000000), 262144);
  assert.equal(figure(256, UV_V, 2, 10000000), 262144, 'UV voltage, 2 EU/t: energy cap 262,144 equals the UV ceiling');
  assert.equal(figure(1024, UV_V, 2, 10000000), 262144, 'UV hatch voltage binds before the UHV hatch');
  // the energy cap binds on real recipes: a 7,680 EU/t circuit assembler recipe on UHV hatches
  assert.equal(figure(1024, UHV_V, 7680, 10000000), 273);
  // the inputs still limit
  assert.equal(figure(1024, UHV_V, 2, 100), 100);
});

test('recipes: controller from 16 UV assemblers, the hall, hulls, arms, field generators and UHV circuits; the field ring casing', () => {
  const h = harness();
  const added = [];
  const chainable = (id) => {
    const r = { id, inputs: [], outputs: [] };
    const c = new Proxy({}, { get: (_, m) => (...a) => {
      if (m === 'itemInputs') r.inputs = (r.inputs || []).concat(a);
      if (m === 'itemOutputs') r.outputs = a;
      if (m === 'EUt') r.eut = a[0];
      if (m === 'duration') r.duration = a[0];
      return c;
    } });
    added.push(r);
    return c;
  };
  h.recipeHandlers.forEach((cb) => cb({ recipes: { gtceu: { assembler: (id) => chainable(id), assembly_line: (id) => chainable(id) } } }));
  assert.equal(added.length, 2);
  const [controller, ring] = added;
  assert.equal('grindless:assembly_line/' + controller.id.replace('grindless:', ''), h.G.megaQuantumFabricator.crafting);
  assert.deepEqual(plain(controller.inputs), ['16x gtceu:uv_assembler', '1x gtceu:assembly_hall', '4x gtceu:uhv_machine_hull', '4x gtceu:uv_robot_arm', '4x gtceu:uv_field_generator', '4x #gtceu:circuits/uhv', '4x grindless:field_ring_casing', '2x grindless:srf_cryomodule', '2x grindless:uv_electromagnet']);
  assert.deepEqual(plain(controller.outputs), ['gtceu:quantum_fabricator']);
  assert.equal(controller.eut, 2097152, 'UHV EU/t');
  assert.ok(controller.duration > 0);
  assert.deepEqual(plain(ring.inputs), ['1x gtceu:uv_field_generator', '1x gtceu:uhv_machine_casing', '1x gtceu:neutronium_plate', '1x grindless:srf_cavity']);
  assert.deepEqual(plain(ring.outputs), ['2x grindless:field_ring_casing']);
  assert.ok(ring.eut > 0 && ring.duration > 0);
  assert.deepEqual(plain(h.errors), []);
});

test('the lang file names the machine, the casing and the tooltips in en_us and es_es', () => {
  const lang = read('client_scripts', 'uhv_mega_quantum_fabricator_lang.js');
  const store = {};
  vm.runInNewContext(lang, {
    ClientEvents: { lang: (code, cb) => cb({ add: (ns, key, value) => { (store[code] = store[code] || {})[key] = value; } }) },
    console,
  });
  for (const code of ['en_us', 'es_es']) {
    assert.ok(store[code], code);
    const keys = ['block.gtceu.quantum_fabricator', 'block.grindless.field_ring_casing', 'tooltip.grindless.field_ring_casing.0',
      'grindless.machine.quantum_fabricator.tooltip.0'];
    for (const key of keys) assert.ok(store[code][key] && store[code][key].length > 0, code + ' ' + key);
  }
  assert.equal(store.en_us['block.gtceu.quantum_fabricator'], 'Quantum Fabricator');
});
