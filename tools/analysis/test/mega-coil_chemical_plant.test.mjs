// MEGA-3, the HV Coil Chemical Plant (startup_scripts/grindless/hv/mega_coil_chemical_plant.js, server_scripts/grindless/hv/mega_coil_chemical_plant.js):
// the pattern through the real helper, the modifier chain (coil parallel, discount, perfect overclock, batch), the parallel and EU figures at two
// coil tiers (Cupronickel and Kanthal; the formulas of lib/mega.js), the controller recipe and the names in both languages.
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
    GTBlocks: { CASING_PTFE_INERT: 'CASING_PTFE_INERT' },
    GTRecipeModifiers: { OC_NON_PERFECT: 'OC_NON_PERFECT', OC_PERFECT_SUBTICK: 'OC_PERFECT_SUBTICK', BATCH_MODE: 'BATCH_MODE' },
    Text: { translate: (s) => s },
    Item: { exists: () => true },
    Java: { loadClass: () => ({}) },
  });
  vm.runInContext(read('startup_scripts', 'lib/patterns.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/coils.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/mega.js'), context);
  vm.runInContext(read('startup_scripts', 'hv/mega_coil_chemical_plant.js'), context);
  vm.runInContext(read('server_scripts', 'hv/mega_coil_chemical_plant.js'), context);
  return { G, registry, recipeHandlers, calls, b, errors, context };
}

function registerMachine(h) {
  h.registry.forEach(([type, cb]) => { if (type === 'gtceu:machine') cb({ create: (...a) => { h.calls.push(['create', ...a]); return h.b; } }); });
}

test('published figures', () => {
  const h = harness();
  assert.equal(h.G.megaCoilChemicalPlant.id, 'gtceu:coil_chemical_plant');
  assert.equal(h.G.megaCoilChemicalPlant.type, 'gtceu:large_chemical_reactor');
  assert.equal(h.G.megaCoilChemicalPlant.parallels, 64);
  assert.deepEqual(plain(h.G.megaCoilChemicalPlant.discount), { rate: 0.95, floor: 0.8, baseK: 1800 });
});

test('registers a coil multiblock on the large chemical reactor type only, no new recipe type', () => {
  const h = harness();
  registerMachine(h);
  assert.deepEqual(h.calls.find((c) => c[0] === 'create'), ['create', 'coil_chemical_plant', 'multiblock']);
  assert.deepEqual(h.calls.filter((c) => c[0] === 'recipeType').map((c) => c[1]), ['large_chemical_reactor']);
  assert.ok(!h.registry.some(([type]) => type === 'gtceu:recipe_type'), 'no recipe type registered');
  assert.ok(h.calls.some((c) => c[0] === 'langValue' && c[1] === 'Coil Chemical Plant'));
  assert.ok(h.calls.some((c) => c[0] === 'machine'), 'a coil machine, so the coil type is read');
  assert.ok(h.calls.some((c) => c[0] === 'appearanceBlock' && c[1] === 'CASING_PTFE_INERT'));
  assert.ok(h.calls.some((c) => c[0] === 'workableCasingModel' && c[2] === 'grindless:block/multiblock/coil_chemical_plant'));
});

test('modifier chain: coil parallel, discount, perfect overclock, batch (4 modifiers, no parallel hatch)', () => {
  const h = harness();
  registerMachine(h);
  const mods = h.calls.find((c) => c[0] === 'recipeModifiers');
  assert.ok(mods, 'recipeModifiers installed');
  assert.equal(mods[1], true);
  const list = mods.slice(2);
  assert.equal(list.length, 4);
  assert.equal(typeof list[0], 'function', 'coil parallel');
  assert.equal(typeof list[1], 'function', 'coil discount');
  assert.equal(list[2], 'OC_PERFECT_SUBTICK');
  assert.equal(list[3], 'BATCH_MODE', 'batch after the overclock');
  assert.equal(h.G.mega.chain({ parallel: 'coil', cap: 64, discount: { rate: 0.95, floor: 0.8, baseK: 1800 }, oc: 'perfect', batch: true }).length, 4);
});

test('structure: 5 x 6 x 7, one controller, 146 casing cells, 5 pipe casings, 16 coils in 2 rings, 18 glass, 24 air, height within 16', () => {
  const h = harness();
  registerMachine(h);
  const d = h.G.patterns.describe('gtceu:coil_chemical_plant');
  assert.ok(d, 'pattern described');
  assert.equal(d.slices.length, 7);
  let height = 0;
  const count = {};
  d.slices.forEach((rows) => {
    assert.equal(rows.length, 6);
    height = Math.max(height, rows.length);
    rows.forEach((row) => {
      assert.equal(row.length, 5);
      for (const ch of row) count[ch] = (count[ch] || 0) + 1;
    });
  });
  assert.ok(height <= 16);
  assert.deepEqual(plain(count), { X: 146, G: 18, P: 5, K: 16, S: 1, '#': 24 });
  assert.equal(d.slices[6][1], 'XXSXX', 'controller in the middle of the front wall');
  const ringSlices = d.slices.filter((rows) => rows.join('').includes('K'));
  assert.equal(ringSlices.length, 2);
  ringSlices.forEach((rows) => assert.equal(rows.join('').split('K').length - 1, 8, 'a full ring of 8'));
  assert.deepEqual(plain(d.symbols.P.blocks), ['gtceu:ptfe_pipe_casing']);
  assert.deepEqual(plain(d.symbols.G.blocks), ['gtceu:tempered_glass']);
  assert.equal(d.symbols.K.kind, 'blocks');
  assert.ok(d.symbols.K.blocks.includes('gtceu:cupronickel_coil_block'));
  assert.ok(d.symbols.K.blocks.includes('gtceu:kanthal_coil_block'));
  assert.equal(d.symbols.X.kind, 'oneOf');
  const kinds = d.symbols.X.options.map((o) => o.kind + ':' + (o.ability || o.blocks));
  assert.deepEqual(plain(kinds), ['blocks:gtceu:inert_machine_casing', 'part:maintenance', 'part:energy_input', 'part:input_bus', 'part:output_bus', 'part:input_hatch', 'part:output_hatch']);
  const lim = (i) => d.symbols.X.options[i].limits;
  assert.equal(lim(1).exact, 1);
  assert.equal(lim(2).min, 1);
  assert.equal(lim(2).max, 2);
  assert.equal(lim(3).max, 2, 'input buses');
  assert.equal(lim(4).max, 2, 'output buses');
  assert.equal(lim(5).max, 4, 'fluid input hatches');
  assert.equal(lim(6).max, 4, 'fluid output hatches');
  const maxParts = d.symbols.X.options.slice(1).reduce((n, o) => n + (o.limits.exact || o.limits.max), 0);
  assert.equal(146 - maxParts, lim(0).min, 'the casing minimum is the cells minus the most parts');
});

test('parallel and EU figures at Cupronickel and Kanthal (formulas of lib/mega.js), then the other coil tiers', () => {
  const h = harness();
  const F = h.G.mega.formulas;
  const D = h.G.megaCoilChemicalPlant.discount;
  const CAP = h.G.megaCoilChemicalPlant.parallels;
  const VA = [8, 32, 128, 512, 2048, 8192, 32768, 131072, 524288];
  const tier = (eut) => VA.findIndex((v) => v >= eut);
  // a recipe of 30 EU/t and 200 ticks (GTM's chemical reactor figures), EV hatches (2048 V)
  const figure = (kelvin, voltage, eut, dur) => {
    const par = F.parallels(F.ceiling(F.coilCeiling(kelvin, CAP), null, 1), F.energyCap(voltage, eut), 64);
    const mult = F.discountMultiplier(kelvin, D.rate, D.floor, D.baseK);
    const total = eut * par * mult;
    const oc = Math.max(0, tier(voltage) - tier(total));
    return { par, mult, eut: total * 4 ** oc, dur: Math.max(1, Math.floor(dur / 4 ** oc)), oc };
  };
  const cupro = figure(1800, 2048, 30, 200);
  assert.deepEqual({ par: cupro.par, mult: cupro.mult, oc: cupro.oc, dur: cupro.dur }, { par: 4, mult: 1, oc: 2, dur: 12 });
  assert.equal(cupro.eut, 1920);
  const kanthal = figure(2700, 2048, 30, 200);
  assert.equal(kanthal.par, 8);
  assert.ok(Math.abs(kanthal.mult - 0.95) < 1e-9);
  assert.equal(kanthal.oc, 1);
  assert.equal(kanthal.dur, 50);
  assert.ok(Math.abs(kanthal.eut - 912) < 1e-6, 'kanthal EU/t ' + kanthal.eut);
  // the five coil tiers of the design table: 4, 8, 16, 32, 64 parallels; discount 1, 0.95, 0.9025, 0.857, 0.815 (the 0.80 floor holds)
  const tiers = [[1800, 4, 1], [2700, 8, 0.95], [3600, 16, 0.9025], [4500, 32, 0.857375], [5400, 64, 0.81450625]];
  for (const [k, par, mult] of tiers) {
    assert.equal(F.parallels(F.ceiling(F.coilCeiling(k, CAP), null, 1), Infinity, 1000), par, k + ' K');
    assert.ok(Math.abs(F.discountMultiplier(k, D.rate, D.floor, D.baseK) - mult) < 1e-9, k + ' K discount');
  }
  assert.equal(F.discountMultiplier(10800, D.rate, D.floor, D.baseK), 0.8, 'the floor');
  assert.equal(F.coilCeiling(10800, CAP), 64, 'the cap');
  // always energy-bound: an HV hatch (512 V) pays floor(512 / 30) = 17 copies at most
  assert.equal(F.parallels(F.ceiling(F.coilCeiling(5400, CAP), null, 1), F.energyCap(512, 30), 1000), 17);
  assert.equal(F.parallels(F.ceiling(F.coilCeiling(2700, CAP), null, 1), F.energyCap(128, 120), 1000), 1);
});

test('controller recipe: 2 large chemical reactors, 4 HV chemical reactors, 4 HV circuits, PTFE plates, 4 Kanthal coils', () => {
  const h = harness();
  const out = [];
  const builder = (id) => {
    const r = { id, itemInputs: [], itemOutputs: [] };
    const c = new Proxy({}, { get: (_, m) => (...a) => {
      if (m === 'itemInputs') r.itemInputs.push(...a);
      else if (m === 'itemOutputs') r.itemOutputs.push(...a);
      else if (m === 'EUt') r.eut = a[0];
      else if (m === 'duration') r.duration = a[0];
      return c;
    } });
    out.push(r);
    return c;
  };
  h.recipeHandlers.forEach((cb) => cb({ recipes: { gtceu: { assembler: builder } } }));
  assert.equal(out.length, 1);
  const r = out[0];
  assert.equal(r.id, h.G.megaCoilChemicalPlant.crafting);
  assert.deepEqual(plain(r.itemInputs), ['2x gtceu:large_chemical_reactor', '4x gtceu:hv_chemical_reactor', '4x #gtceu:circuits/hv', '8x #forge:plates/polytetrafluoroethylene', '4x gtceu:kanthal_coil_block']);
  assert.deepEqual(plain(r.itemOutputs), ['gtceu:coil_chemical_plant']);
  assert.ok(r.eut <= 512 && r.eut > 0);
  assert.ok(r.duration > 0);
  assert.deepEqual(plain(h.errors), []);
});

test('the lang file names the machine and its tooltips in en_us and es_es', () => {
  const lang = read('client_scripts', 'hv_mega_coil_chemical_plant_lang.js');
  const store = {};
  vm.runInNewContext(lang, {
    ClientEvents: { lang: (code, cb) => cb({ add: (ns, key, value) => { (store[code] = store[code] || {})[key] = value; } }) },
    console,
  });
  for (const code of ['en_us', 'es_es']) {
    assert.ok(store[code], code);
    for (const key of ['block.gtceu.coil_chemical_plant', 'grindless.machine.coil_chemical_plant.tooltip.0', 'grindless.machine.coil_chemical_plant.tooltip.1', 'grindless.machine.coil_chemical_plant.tooltip.2']) {
      assert.ok(store[code][key] && store[code][key].length > 0, code + ' ' + key);
    }
  }
  assert.equal(store.en_us['block.gtceu.coil_chemical_plant'], 'Coil Chemical Plant');
  assert.notEqual(store.es_es['grindless.machine.coil_chemical_plant.tooltip.0'], store.en_us['grindless.machine.coil_chemical_plant.tooltip.0']);
});
