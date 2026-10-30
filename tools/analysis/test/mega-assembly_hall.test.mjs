// MEGA-7, the ZPM Assembly Hall (startup_scripts/grindless/zpm/mega_assembly_hall.js, server_scripts/grindless/zpm/mega_assembly_hall.js):
// the pattern through the real helper, the two modes, the modifier chain, the parallel figure at two hatch tiers (the formulas of
// lib/mega.js), the footprint inside the largest GTM cleanroom, the controller recipe and the names in both languages.
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
    GTBlocks: { CASING_ASSEMBLY_CONTROL: 'CASING_ASSEMBLY_CONTROL' },
    GTRecipeModifiers: { OC_NON_PERFECT: 'OC_NON_PERFECT', BATCH_MODE: 'BATCH_MODE' },
    Text: { translate: (s) => s },
    Item: { exists: () => true, of: (x) => x },
    Fluid: { of: (id, n) => id + ' ' + n },
    Java: { loadClass: () => ({}) },
  });
  vm.runInContext(read('startup_scripts', 'lib/patterns.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/mega.js'), context);
  // the real parallel hatch part predicate is a part with the 'parallel_hatch' ability; a stand-in is enough here
  G.parallelHatch = { part: () => ({ kind: 'part', ability: 'parallel_hatch', limits: { max: 1 }, build: () => null }) };
  vm.runInContext(read('startup_scripts', 'zpm/mega_assembly_hall.js'), context);
  vm.runInContext(read('server_scripts', 'zpm/mega_assembly_hall.js'), context);
  return { G, registry, recipeHandlers, calls, b, errors, context };
}

function register(h) {
  h.registry.forEach(([type, cb]) => { if (type === 'gtceu:machine') cb({ create: (...a) => { h.calls.push(['create', ...a]); return h.b; } }); });
}

test('published figures', () => {
  const h = harness();
  assert.equal(h.G.megaAssemblyHall.id, 'gtceu:assembly_hall');
  assert.deepEqual(plain(h.G.megaAssemblyHall.types), ['gtceu:assembler', 'gtceu:circuit_assembler']);
  assert.equal(h.G.megaAssemblyHall.cap, 64);
});

test('registers a multiblock with the two modes, assembler first', () => {
  const h = harness();
  register(h);
  assert.deepEqual(h.calls.find((c) => c[0] === 'create'), ['create', 'assembly_hall', 'multiblock']);
  const modes = h.calls.filter((c) => c[0] === 'recipeType').map((c) => c[1]);
  assert.deepEqual(modes, ['assembler', 'circuit_assembler']);
  assert.ok(h.calls.some((c) => c[0] === 'langValue' && c[1] === 'Assembly Hall'));
  assert.ok(h.calls.some((c) => c[0] === 'appearanceBlock' && c[1] === 'CASING_ASSEMBLY_CONTROL'));
  assert.ok(h.calls.some((c) => c[0] === 'workableCasingModel' && c[2] === 'grindless:block/multiblock/assembly_hall'));
});

test('modifier chain: mode veto + fixed parallel with hatch, non-perfect overclock, batch', () => {
  const h = harness();
  register(h);
  const mods = h.calls.find((c) => c[0] === 'recipeModifiers');
  assert.ok(mods, 'recipeModifiers installed');
  assert.equal(mods[1], true);
  const list = mods.slice(2);
  assert.equal(list.length, 4, 'veto, parallel, overclock, batch');
  const machine = { getRecipeType: () => ({ registryName: 'gtceu:assembler' }) };
  assert.equal(list[0](machine, { getType: () => ({ registryName: 'gtceu:circuit_assembler' }) }), 'NULL');
  assert.equal(list[0](machine, { getType: () => ({ registryName: 'gtceu:assembler' }) }), 'IDENTITY');
});

test('structure: 11 x 9 x 12, one controller, fits the largest GTM cleanroom interior (13 x 13 x 13), height within 16', () => {
  const h = harness();
  register(h);
  const d = h.G.patterns.describe('gtceu:assembly_hall');
  assert.ok(d, 'pattern described');
  assert.equal(d.slices.length, 12);
  const count = {};
  d.slices.forEach((rows) => {
    assert.equal(rows.length, 9);
    rows.forEach((row) => {
      assert.equal(row.length, 11);
      for (const ch of row) count[ch] = (count[ch] || 0) + 1;
    });
  });
  assert.ok(11 <= 13 && 9 <= 13 && 12 <= 13 && 9 <= 16);
  assert.equal(count.S, 1);
  assert.equal(count.U, 28);
  assert.equal(d.slices[11][1][5], 'S', 'controller in the middle of the front wall, one row up');
  assert.equal(d.symbols.X.kind, 'oneOf');
  const kinds = d.symbols.X.options.map((o) => o.kind + ':' + (o.ability || o.blocks));
  assert.deepEqual(plain(kinds), ['blocks:gtceu:assembly_line_casing', 'part:maintenance', 'part:energy_input', 'part:input_bus', 'part:output_bus', 'part:input_hatch', 'part:parallel_hatch']);
  // parts can take at most 22 cells, so the casing floor min leaves exactly that room
  assert.equal(d.symbols.X.options[0].limits.min, count.X - 22);
  assert.equal(d.symbols.U.blocks[0], 'gtceu:assembly_line_unit');
  assert.equal(d.symbols.L.blocks[0], 'gtceu:laminated_glass');
  assert.equal(d.symbols.G.blocks[0], 'gtceu:assembly_line_grating');
});

test('parallel figure: ceiling 64 x the hatch, cut by the energy of the hatches (formulas of lib/mega.js)', () => {
  const h = harness();
  const F = h.G.mega.formulas;
  const figure = (hatch, voltage, eut, inputs) => F.parallels(F.ceiling(64, null, hatch), F.energyCap(voltage, eut), inputs);
  // no hatch: ceiling 64
  assert.equal(F.ceiling(64, null, 1), 64);
  assert.equal(figure(1, 524288, 32, 100000), 64);
  // LuV hatch (16): ceiling 1024; ZPM hatch (64): ceiling 4096
  assert.equal(F.ceiling(64, null, 16), 1024);
  assert.equal(F.ceiling(64, null, 64), 4096);
  // cheap recipe, ZPM hatch voltage 524288 V: 32 EU/t is 16384 by energy, so the ceiling binds
  assert.equal(figure(16, 524288, 32, 100000), 1024);
  assert.equal(figure(64, 524288, 32, 100000), 4096);
  // the bench recipe, 1024 EU/t: energy binds at 512 with either hatch tier... and at LuV the ceiling 1024 is not reached
  assert.equal(figure(16, 524288, 1024, 100000), 512);
  assert.equal(figure(64, 524288, 1024, 100000), 512);
  // an expensive recipe, 16384 EU/t: 32 copies whatever the hatch
  assert.equal(figure(16, 524288, 16384, 100000), 32);
  assert.equal(figure(64, 524288, 16384, 100000), 32);
  // a small hatch (EV, 2048 V) and a 64 EU/t recipe: 32 copies
  assert.equal(figure(16, 2048, 64, 100000), 32);
  // the inputs still limit
  assert.equal(figure(64, 524288, 32, 7), 7);
});

test('controller recipe: 16 ZPM assemblers, 16 ZPM circuit assemblers, 4 ZPM circuits, assembly line casings', () => {
  const h = harness();
  const added = [];
  const chainable = (id) => {
    const r = { id, inputs: [], outputs: [] };
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
  h.recipeHandlers.forEach((cb) => cb({ recipes: { gtceu: { assembly_line: (id) => chainable(id) } } }));
  assert.equal(added.length, 1);
  const r = added[0];
  assert.equal(r.id.replace('grindless:', 'grindless:assembly_line/'), h.G.megaAssemblyHall.crafting);
  assert.deepEqual(plain(r.inputs), plain(h.G.megaAssemblyHall.craftingInputs));
  assert.deepEqual(plain(r.inputs).slice(0, 4), ['16x gtceu:zpm_assembler', '16x gtceu:zpm_circuit_assembler', '4x #gtceu:circuits/zpm', '16x gtceu:assembly_line_casing']);
  assert.deepEqual(plain(r.outputs), ['gtceu:assembly_hall']);
  assert.ok(r.eut > 0 && r.duration > 0);
  assert.deepEqual(plain(h.errors), []);
});

test('the lang file names the machine and its tooltips in en_us and es_es', () => {
  const lang = read('client_scripts', 'zpm_mega_assembly_hall_lang.js');
  const store = {};
  vm.runInNewContext(lang, {
    ClientEvents: { lang: (code, cb) => cb({ add: (ns, key, value) => { (store[code] = store[code] || {})[key] = value; } }) },
    console,
  });
  for (const code of ['en_us', 'es_es']) {
    assert.ok(store[code], code);
    for (const key of ['block.gtceu.assembly_hall', ...[0].map((i) => 'grindless.machine.assembly_hall.tooltip.' + i)]) {
      assert.ok(store[code][key] && store[code][key].length > 0, code + ' ' + key);
    }
  }
  assert.equal(store.en_us['block.gtceu.assembly_hall'], 'Assembly Hall');
});
