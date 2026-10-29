// MEGA-2, the MV Polymer Works (startup_scripts/grindless/mv/mega_polymer_works.js, server_scripts/grindless/mv/mega_polymer_works.js,
// data/grindless/tables/mega_polymer_works.json): the recipe type, the pattern through the real helper, the modifier chain, the two composed
// lines checked against the sum of their stage recipes (recomputed here by hand from the stages' numbers), the parallel figure at two hatch
// tiers (the formulas of lib/mega.js), the controller recipe and the names in both languages.
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

// GTM 7.5.3's stage recipes in the JSON shape compose.js reads (numbers from the jar's ReactorRecipes, PolymerRecipes and MixerRecipes sources)
const fluid = (id, amount) => ({ content: { amount, value: [{ fluid: id }] }, chance: 10000, maxChance: 10000 });
const item = (id, count) => ({ content: { type: 'gtceu:sized', count, ingredient: { item: id } }, chance: 10000, maxChance: 10000 });
const mold = { content: { type: 'gtceu:sized', count: 1, ingredient: { item: 'gtceu:plate_casting_mold' } }, chance: 0, maxChance: 10000 };
const circuit = { content: { type: 'gtceu:circuit', configuration: 1 }, chance: 0, maxChance: 10000 };
const stage = (eut, duration, inputs, outputs) => ({ duration, tickInputs: { eu: [{ content: eut }] }, inputs, outputs });
const STAGES = {
  'gtceu:chemical_reactor/ethylene_from_ethanol': { eut: 128, duration: 1200,
    json: stage(128, 1200, { fluid: [fluid('gtceu:sulfuric_acid', 1000), fluid('gtceu:ethanol', 1000)] },
      { fluid: [fluid('gtceu:ethylene', 1000), fluid('gtceu:diluted_sulfuric_acid', 1000)] }) },
  'gtceu:chemical_reactor/polyethylene_from_oxygen': { eut: 32, duration: 160,
    json: stage(32, 160, { item: [circuit], fluid: [fluid('gtceu:oxygen', 1000), fluid('gtceu:ethylene', 144)] }, { fluid: [fluid('gtceu:polyethylene', 216)] }) },
  'gtceu:fluid_solidifier/solidify_polyethylene_to_plate': { eut: 8, duration: 40,
    json: stage(8, 40, { item: [mold], fluid: [fluid('gtceu:polyethylene', 144)] }, { item: [item('gtceu:polyethylene_plate', 1)] }) },
  'gtceu:chemical_reactor/rubber': { eut: 16, duration: 600,
    json: stage(16, 600, { item: [item('gtceu:raw_rubber_dust', 9), item('gtceu:sulfur_dust', 1)] }, { fluid: [fluid('gtceu:rubber', 1296)] }) },
  'gtceu:fluid_solidifier/solidify_rubber_to_plate': { eut: 8, duration: 40,
    json: stage(8, 40, { item: [mold], fluid: [fluid('gtceu:rubber', 144)] }, { item: [item('gtceu:rubber_plate', 1)] }) },
};

function harness(stages = STAGES) {
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
    GuiTextures: { PROGRESS_BAR_ARROW_MULTIPLE: 'ARROW' },
    FillDirection: { LEFT_TO_RIGHT: 'LTR' },
    GTSoundEntries: { CHEMICAL: 'CHEMICAL' },
    Text: { translate: (s) => s },
    Item: { exists: () => true },
    Fluid: { exists: () => true, of: (id, amount) => ({ id, amount }) },
    Java: { loadClass: () => ({}) },
  });
  G.readJsonTable = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, 'pack', p), 'utf8'));
  vm.runInContext(read('startup_scripts', 'lib/patterns.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/coils.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/mega.js'), context);
  vm.runInContext(read('startup_scripts', 'mv/mega_polymer_works.js'), context);
  vm.runInContext(read('server_scripts', 'lib/compose.js'), context);
  vm.runInContext(read('server_scripts', 'mv/mega_polymer_works.js'), context);
  const originals = Object.entries(stages).map(([id, s]) => ({ toString: () => id + '[gtceu:x]', json: JSON.stringify(s.json) }));
  return { G, registry, recipeHandlers, calls, b, errors, context, originals };
}

function registerMachine(h) {
  h.registry.forEach(([type, cb]) => { if (type === 'gtceu:machine') cb({ create: (...a) => { h.calls.push(['create', ...a]); return h.b; } }); });
}

// runs the recipe handlers with a recording event: { assembler: [...], polymer: [...] }
function runRecipes(h) {
  const out = { assembler: [], polymer: [] };
  const builder = (id, bucket) => {
    const r = { id, itemInputs: [], itemOutputs: [], inputFluids: [], outputFluids: [], chanced: [] };
    const c = new Proxy({}, { get: (_, m) => (...a) => {
      if (m === 'itemInputs') r.itemInputs.push(...a);
      else if (m === 'itemOutputs') r.itemOutputs.push(...a);
      else if (m === 'inputFluids') r.inputFluids.push(...a);
      else if (m === 'outputFluids') r.outputFluids.push(...a);
      else if (m === 'chancedOutput' || m === 'chancedInput') r.chanced.push([m, ...a]);
      else if (m === 'EUt') r.eut = a[0];
      else if (m === 'duration') r.duration = a[0];
      return c;
    } });
    out[bucket].push(r);
    return c;
  };
  const event = {
    originalRecipes: { values: () => h.originals },
    recipes: { gtceu: { assembler: (id) => builder(id, 'assembler'), polymer_works: (id) => builder(id, 'polymer') } },
  };
  h.recipeHandlers.forEach((cb) => cb(event));
  return out;
}

test('published figures', () => {
  const h = harness();
  assert.equal(h.G.megaPolymerWorks.id, 'gtceu:polymer_works');
  assert.equal(h.G.megaPolymerWorks.type, 'gtceu:polymer_works');
  assert.equal(h.G.megaPolymerWorks.parallels, 16);
});

test('registers the recipe type and a multiblock on it, no extra mode', () => {
  const h = harness();
  const typeCalls = [];
  const typeBuilder = new Proxy({}, { get: (_, m) => (...x) => { typeCalls.push([m, ...x]); return typeBuilder; } });
  h.registry.forEach(([type, cb]) => { if (type === 'gtceu:recipe_type') cb({ create: (...a) => { typeCalls.push(['create', ...a]); return typeBuilder; } }); });
  assert.deepEqual(typeCalls[0], ['create', 'polymer_works']);
  assert.ok(typeCalls.some((c) => c[0] === 'setMaxIOSize' && c.slice(1).join() === '2,2,3,2'));
  registerMachine(h);
  assert.deepEqual(h.calls.find((c) => c[0] === 'create'), ['create', 'polymer_works', 'multiblock']);
  assert.deepEqual(h.calls.filter((c) => c[0] === 'recipeType').map((c) => c[1]), ['polymer_works']);
  assert.ok(h.calls.some((c) => c[0] === 'langValue' && c[1] === 'Polymer Works'));
  assert.ok(h.calls.some((c) => c[0] === 'workableCasingModel' && c[2] === 'grindless:block/multiblock/polymer_works'));
  assert.ok(h.calls.some((c) => c[0] === 'machine'), 'a coil machine, so a coil row forms');
});

test('modifier chain: fixed parallel, non-perfect overclock, batch (three modifiers, no veto, no discount)', () => {
  const h = harness();
  registerMachine(h);
  const mods = h.calls.find((c) => c[0] === 'recipeModifiers');
  assert.ok(mods, 'recipeModifiers installed');
  assert.equal(mods[1], true);
  assert.equal(mods.slice(2).length, 3, 'parallel, overclock, batch');
});

test('structure: 5 x 5 x 7, one controller, 89 casing cells, 12 frames, 23 glass, 5 pipes, 5 coils, 40 air, height within 16', () => {
  const h = harness();
  registerMachine(h);
  const d = h.G.patterns.describe('gtceu:polymer_works');
  assert.ok(d, 'pattern described');
  assert.equal(d.slices.length, 7);
  let height = 0;
  const count = {};
  d.slices.forEach((rows) => {
    assert.equal(rows.length, 5);
    height = Math.max(height, rows.length);
    rows.forEach((row) => {
      assert.equal(row.length, 5);
      for (const ch of row) count[ch] = (count[ch] || 0) + 1;
    });
  });
  assert.ok(height <= 16);
  assert.deepEqual(plain(count), { X: 89, F: 12, S: 1, G: 23, P: 5, K: 5, '#': 40 });
  assert.equal(d.slices[6][1], 'FXSXF', 'controller in the middle of the front wall');
  assert.equal(d.symbols.F.kind, 'frames');
  assert.deepEqual(plain(d.symbols.F.materials), ['aluminium']);
  assert.deepEqual(plain(d.symbols.G.blocks), ['gtceu:tempered_glass']);
  assert.equal(d.symbols.K.kind, 'blocks');
  assert.ok(d.symbols.K.blocks.includes('gtceu:cupronickel_coil_block'));
  assert.equal(d.symbols.X.kind, 'oneOf');
  const kinds = d.symbols.X.options.map((o) => o.kind + ':' + (o.ability || o.blocks));
  assert.deepEqual(plain(kinds), ['blocks:gtceu:solid_machine_casing', 'part:maintenance', 'part:energy_input', 'part:input_bus', 'part:input_hatch', 'part:output_bus', 'part:output_hatch']);
  const lim = (i) => d.symbols.X.options[i].limits;
  assert.equal(lim(0).min, 77);
  assert.equal(lim(1).exact, 1);
  assert.equal(lim(2).max, 2);
  assert.equal(lim(2).min, 1);
  const maxParts = d.symbols.X.options.slice(1).reduce((n, o) => n + (o.limits.exact || o.limits.max), 0);
  assert.equal(89 - maxParts, lim(0).min, 'the casing minimum is the cells minus the most parts');
});

test('the two composed lines equal the sum of their stage recipes (inputs, outputs, total EU)', () => {
  const h = harness();
  const out = runRecipes(h);
  assert.deepEqual(plain(h.errors), []);
  assert.deepEqual(plain(h.G.megaPolymerWorks.skipped), []);
  assert.equal(out.polymer.length, 2);
  const byName = Object.fromEntries(h.G.megaPolymerWorks.recipes.map((r) => [r.name, r]));

  // by hand: 1152 mB ethanol is 1.152 runs of the ethylene stage; 1152 mB ethylene is 8 runs of 144 mB (1728 mB polyethylene) = 12 plates
  const A = byName.polyethylene_plate;
  const runsA = { ethylene: 1.152, polyethylene: 8, plate: 12 };
  assert.deepEqual(plain(A.fluidsIn.map((f) => [f.id, f.amount]).sort()), [['gtceu:ethanol', 1152], ['gtceu:oxygen', 8000], ['gtceu:sulfuric_acid', 1152]]);
  assert.deepEqual(plain(A.fluidsOut.map((f) => [f.id, f.amount])), [['gtceu:diluted_sulfuric_acid', 1152]]);
  assert.deepEqual(plain(A.itemsOut.map((o) => [o.id, o.whole, o.chance])), [['gtceu:polyethylene_plate', 12, 0]]);
  assert.deepEqual(plain(A.itemsIn), []);
  const sumA = 128 * 1200 * runsA.ethylene + 32 * 160 * runsA.polyethylene + 8 * 40 * runsA.plate;
  assert.ok(Math.abs(A.sourceEnergy - sumA) < 1e-3, `sourceEnergy ${A.sourceEnergy} vs ${sumA}`);

  // by hand: 9 raw rubber dust and 1 sulfur are one run of 1296 mB rubber = 9 plates of 144 mB
  const R = byName.rubber_plate;
  const sumR = 16 * 600 * 1 + 8 * 40 * 9;
  assert.deepEqual(plain(R.itemsIn.map((x) => [x.id, x.count]).sort()), [['gtceu:raw_rubber_dust', 9], ['gtceu:sulfur_dust', 1]]);
  assert.deepEqual(plain(R.itemsOut.map((o) => [o.id, o.whole, o.chance])), [['gtceu:rubber_plate', 9, 0]]);
  assert.deepEqual(plain(R.fluidsIn), []);
  assert.deepEqual(plain(R.fluidsOut), []);
  assert.ok(Math.abs(R.sourceEnergy - sumR) < 1e-3, `sourceEnergy ${R.sourceEnergy} vs ${sumR}`);

  // rule 7: built at MV's 128 EU/t, never cheaper than the stages, by less than one tick of power
  for (const [rec, sum] of [[A, sumA], [R, sumR]]) {
    assert.ok(rec.eut <= 128 && rec.eut > 0, rec.name);
    assert.equal(rec.duration, Math.ceil(sum / 128), rec.name);
    assert.ok(rec.eut * rec.duration >= sum - 1e-6, rec.name);
    assert.ok(rec.eut * rec.duration - sum < rec.duration, rec.name);
  }
  // what the builder received matches the published recipe
  const built = Object.fromEntries(out.polymer.map((r) => [r.id, r]));
  assert.ok(built['grindless:polyethylene_plate'] && built['grindless:rubber_plate']);
  assert.equal(built['grindless:polyethylene_plate'].eut, A.eut);
  assert.equal(built['grindless:rubber_plate'].duration, R.duration);
  assert.deepEqual(plain(h.G.megaPolymerWorks.clashes), []);
});

test('a line with a stage that is not live is skipped and said, not invented', () => {
  const stages = { ...STAGES };
  delete stages['gtceu:fluid_solidifier/solidify_rubber_to_plate'];
  const h = harness(stages);
  const out = runRecipes(h);
  assert.equal(out.polymer.length, 1);
  assert.equal(h.G.megaPolymerWorks.skipped.length, 1);
  assert.equal(h.G.megaPolymerWorks.skipped[0].name, 'rubber_plate');
});

test('parallel figure: fixed ceiling 16, cut by the energy of the hatches (formulas of lib/mega.js), at two hatch tiers', () => {
  const h = harness();
  runRecipes(h);
  const F = h.G.mega.formulas;
  const figure = (voltage, eut, inputs = 64) => F.parallels(F.ceiling(16, null, 1), F.energyCap(voltage, eut), inputs);
  for (const rec of h.G.megaPolymerWorks.recipes) {
    // 1 MV hatch (128 V): the composed recipe costs up to 128 EU/t, one copy; 1 HV hatch (512 V): floor(512 / eut), at most 16
    assert.equal(figure(128, rec.eut), Math.min(16, Math.floor(128 / rec.eut)), rec.name);
    assert.equal(figure(512, rec.eut), Math.min(16, Math.floor(512 / rec.eut)), rec.name);
    assert.ok(figure(512, rec.eut) >= figure(128, rec.eut), rec.name);
  }
  assert.equal(figure(128, 128), 1);
  assert.equal(figure(512, 128), 4);
  assert.equal(figure(2048, 128), 16);
  assert.equal(figure(2048, 128, 5), 5, 'the inputs still limit');
});

test('controller recipe: 2 MV chemical reactors, 2 MV fluid solidifiers, 2 MV mixers, 4 MV circuits', () => {
  const h = harness();
  const out = runRecipes(h);
  assert.equal(out.assembler.length, 1);
  const r = out.assembler[0];
  assert.equal(r.id, h.G.megaPolymerWorks.crafting);
  assert.deepEqual(plain(r.itemInputs), ['2x gtceu:mv_chemical_reactor', '2x gtceu:mv_fluid_solidifier', '2x gtceu:mv_mixer', '4x #gtceu:circuits/mv']);
  assert.deepEqual(plain(r.itemOutputs), ['gtceu:polymer_works']);
  assert.ok(r.eut <= 128 && r.eut > 0);
  assert.ok(r.duration > 0);
  assert.deepEqual(plain(h.errors), []);
});

test('the lang file names the machine, the recipe type and its tooltips in en_us and es_es', () => {
  const lang = read('client_scripts', 'mv_mega_polymer_works_lang.js');
  const store = {};
  vm.runInNewContext(lang, {
    ClientEvents: { lang: (code, cb) => cb({ add: (ns, key, value) => { (store[code] = store[code] || {})[key] = value; } }) },
    console,
  });
  for (const code of ['en_us', 'es_es']) {
    assert.ok(store[code], code);
    for (const key of ['block.gtceu.polymer_works', 'gtceu.polymer_works', 'grindless.machine.polymer_works.tooltip.0', 'grindless.machine.polymer_works.tooltip.1', 'grindless.machine.polymer_works.tooltip.2']) {
      assert.ok(store[code][key] && store[code][key].length > 0, code + ' ' + key);
    }
  }
  assert.equal(store.en_us['block.gtceu.polymer_works'], 'Polymer Works');
  assert.notEqual(store.es_es['grindless.machine.polymer_works.tooltip.0'], store.en_us['grindless.machine.polymer_works.tooltip.0']);
});
