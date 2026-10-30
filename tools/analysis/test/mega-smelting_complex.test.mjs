// MEGA-5, the IV Smelting Complex (startup_scripts/grindless/iv/mega_smelting_complex.js, server_scripts/grindless/iv/mega_smelting_complex.js,
// data/grindless/tables/mega_smelting_complex.json): the recipe type, the pattern through the real helper, the modifier chain (coil parallel,
// GTM's EBF overclock, batch), composed lines checked against the sum of their two stage recipes (recomputed here by hand from the stages'
// numbers, which are copied from the bench dump), ebf_temp and the circuit carried, the skipped hot ingots, the parallel figure at two coil
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

const tag = (t, count) => ({ content: { type: 'gtceu:sized', count, ingredient: { tag: t } } });
const item = (id, count) => ({ content: { type: 'gtceu:sized', count, ingredient: { item: id } } });
const circuit = (n) => ({ content: { type: 'gtceu:circuit', configuration: n }, chance: 0 });
const fluidTag = (t, amount) => ({ content: { amount, value: [{ tag: t }] } });
const fluidOut = (id, amount) => ({ content: { amount, value: [{ fluid: id }] } });
const mold = { content: { type: 'gtceu:sized', count: 1, ingredient: { item: 'gtceu:ingot_casting_mold' } }, chance: 0 };
const ebf = (temp, duration, eut, inputs, outputs) => ({
  type: 'gtceu:electric_blast_furnace', data: { ebf_temp: temp }, duration, category: 'gtceu:electric_blast_furnace', tickInputs: { eu: [{ content: eut }] }, inputs, outputs,
});
const freezer = (duration, eut, inputs, outputs) => ({ type: 'gtceu:vacuum_freezer', duration, category: 'gtceu:vacuum_freezer', tickInputs: { eu: [{ content: eut }] }, inputs, outputs });

// copied from the bench dump (GTM 7.5.3)
const STAGES = {
  'gtceu:electric_blast_furnace/blast_black_bronze': ebf(2000, 1000, 120, { item: [tag('forge:dusts/black_bronze', 1), circuit(1)] }, { item: [item('gtceu:hot_black_bronze_ingot', 1)] }),
  'gtceu:electric_blast_furnace/blast_black_bronze_gas': ebf(2000, 670, 120, { fluid: [fluidTag('forge:nitrogen', 1000)], item: [tag('forge:dusts/black_bronze', 1), circuit(2)] }, { item: [item('gtceu:hot_black_bronze_ingot', 1)] }),
  'gtceu:vacuum_freezer/cool_hot_black_bronze_ingot': freezer(294, 120, { item: [tag('forge:hot_ingots/black_bronze', 1)] }, { item: [item('gtceu:black_bronze_ingot', 1)] }),
  'gtceu:electric_blast_furnace/blast_europium': ebf(6000, 180, 7680, { item: [tag('forge:dusts/europium', 1), circuit(1)] }, { item: [item('gtceu:hot_europium_ingot', 1)] }),
  'gtceu:electric_blast_furnace/blast_europium_gas': ebf(6000, 120, 7680, { fluid: [fluidTag('forge:helium', 100)], item: [tag('forge:dusts/europium', 1), circuit(2)] }, { item: [item('gtceu:hot_europium_ingot', 1)] }),
  'gtceu:vacuum_freezer/cool_hot_europium_ingot': freezer(453, 480, { fluid: [fluidTag('forge:liquid_helium', 500)], item: [tag('forge:hot_ingots/europium', 1)] },
    { fluid: [fluidOut('gtceu:helium', 250)], item: [item('gtceu:europium_ingot', 1)] }),
  // a blast furnace recipe of a hot ingot that no freezer takes: not live as a line
  'gtceu:electric_blast_furnace/blast_orphan': ebf(1500, 100, 120, { item: [tag('forge:dusts/orphan', 1), circuit(1)] }, { item: [item('gtceu:hot_orphan_ingot', 1)] }),
  // a casting-mold freezer line (as the alloys that cool in a mold)
  'gtceu:electric_blast_furnace/blast_molded': ebf(1800, 200, 480, { item: [tag('forge:dusts/molded', 2), circuit(1)] }, { item: [item('gtceu:hot_molded_ingot', 1)] }),
  'gtceu:vacuum_freezer/cool_hot_molded_ingot': freezer(100, 120, { item: [tag('forge:hot_ingots/molded', 1), mold] }, { item: [item('gtceu:molded_ingot', 1)] }),
  // not a hot ingot: left alone
  'gtceu:electric_blast_furnace/blast_plain': ebf(1000, 100, 120, { item: [tag('forge:dusts/plain', 1), circuit(1)] }, { item: [item('gtceu:plain_ingot', 1)] }),
};

function harness(stages = STAGES, itemExists = () => true) {
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
    GTBlocks: { CASING_INVAR_HEATPROOF: 'CASING_INVAR_HEATPROOF' },
    GTRecipeModifiers: { ebfOverclock: () => 'EBF_RESULT', BATCH_MODE: 'BATCH_MODE', OC_NON_PERFECT: 'OC_NON_PERFECT' },
    GuiTextures: { PROGRESS_BAR_ARROW_MULTIPLE: 'ARROW' },
    FillDirection: { LEFT_TO_RIGHT: 'LTR' },
    GTSoundEntries: { FURNACE: 'FURNACE' },
    Text: { translate: (s) => s },
    Item: { exists: itemExists },
    Fluid: { exists: () => true, of: (id, amount) => ({ id, amount }) },
    Java: { loadClass: () => ({}) },
  });
  G.readJsonTable = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, 'pack', p), 'utf8'));
  vm.runInContext(read('startup_scripts', 'lib/patterns.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/coils.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/mega.js'), context);
  vm.runInContext(read('startup_scripts', 'iv/mega_smelting_complex.js'), context);
  vm.runInContext(read('server_scripts', 'lib/compose.js'), context);
  vm.runInContext(read('server_scripts', 'iv/mega_smelting_complex.js'), context);
  const originals = Object.entries(stages).map(([id, s]) => ({ toString: () => id + '[gtceu:x]', json: JSON.stringify(s) }));
  return { G, registry, recipeHandlers, calls, b, errors, context, originals };
}

function registerMachine(h) {
  h.registry.forEach(([type, cb]) => { if (type === 'gtceu:machine') cb({ create: (...a) => { h.calls.push(['create', ...a]); return h.b; } }); });
}

function runRecipes(h) {
  const out = { assembler: [], complex: [] };
  const builder = (id, bucket) => {
    const r = { id, itemInputs: [], notConsumable: [], itemOutputs: [], inputFluids: [], outputFluids: [], chanced: [] };
    const c = new Proxy({}, { get: (_, m) => (...a) => {
      if (m === 'itemInputs') r.itemInputs.push(...a);
      else if (m === 'notConsumable') r.notConsumable.push(...a);
      else if (m === 'circuit') r.circuit = a[0];
      else if (m === 'blastFurnaceTemp') r.temp = a[0];
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
    recipes: { gtceu: { assembler: (id) => builder(id, 'assembler'), smelting_complex: (id) => builder(id, 'complex') } },
  };
  h.recipeHandlers.forEach((cb) => cb(event));
  return out;
}

test('published figures', () => {
  const h = harness();
  assert.equal(h.G.megaSmeltingComplex.id, 'gtceu:smelting_complex');
  assert.equal(h.G.megaSmeltingComplex.type, 'gtceu:smelting_complex');
  assert.equal(h.G.megaSmeltingComplex.parallels, 64);
});

test('registers the recipe type (with room for the largest line) and a coil multiblock on it', () => {
  const h = harness();
  const typeCalls = [];
  const typeBuilder = new Proxy({}, { get: (_, m) => (...x) => { typeCalls.push([m, ...x]); return typeBuilder; } });
  h.registry.forEach(([type, cb]) => { if (type === 'gtceu:recipe_type') cb({ create: (...a) => { typeCalls.push(['create', ...a]); return typeBuilder; } }); });
  assert.deepEqual(typeCalls[0], ['create', 'smelting_complex']);
  const size = typeCalls.find((c) => c[0] === 'setMaxIOSize');
  assert.ok(size && size[1] >= 3 && size[2] >= 2 && size[3] >= 2 && size[4] >= 2, 'holds 3 / 2 / 2 / 2');
  registerMachine(h);
  assert.deepEqual(h.calls.find((c) => c[0] === 'create'), ['create', 'smelting_complex', 'multiblock']);
  assert.deepEqual(h.calls.filter((c) => c[0] === 'recipeType').map((c) => c[1]), ['smelting_complex']);
  assert.ok(h.calls.some((c) => c[0] === 'langValue' && c[1] === 'Smelting Complex'));
  assert.ok(h.calls.some((c) => c[0] === 'appearanceBlock' && c[1] === 'CASING_INVAR_HEATPROOF'));
  assert.ok(h.calls.some((c) => c[0] === 'workableCasingModel' && c[2] === 'grindless:block/multiblock/smelting_complex'));
  assert.ok(h.calls.some((c) => c[0] === 'machine'), 'a coil machine');
});

test('modifier chain: coil parallel, GTM EBF overclock, batch, in that order, three modifiers', () => {
  const h = harness();
  registerMachine(h);
  const mods = h.calls.find((c) => c[0] === 'recipeModifiers');
  assert.ok(mods, 'recipeModifiers installed');
  assert.equal(mods[1], true);
  const list = mods.slice(2);
  assert.equal(list.length, 3, 'coil parallel, EBF overclock, batch');
  assert.equal(typeof list[1], 'function', 'the EBF modifier is a function calling GTRecipeModifiers.ebfOverclock');
  assert.equal(list[1]({}, {}), 'EBF_RESULT');
  assert.equal(list[2], 'BATCH_MODE');
});

test('structure: 9 x 9 x 11, one controller, two coil rings, three casings, heights within 16', () => {
  const h = harness();
  registerMachine(h);
  const d = h.G.patterns.describe('gtceu:smelting_complex');
  assert.ok(d, 'pattern described');
  assert.equal(d.slices.length, 11);
  const count = {};
  d.slices.forEach((rows) => {
    assert.equal(rows.length, 9);
    assert.ok(rows.length <= 16);
    rows.forEach((row) => {
      assert.equal(row.length, 9);
      for (const ch of row) count[ch] = (count[ch] || 0) + 1;
    });
  });
  assert.deepEqual(plain(count), { F: 241, R: 32, H: 96, K: 32, X: 80, S: 1, '#': 409 });
  assert.equal(Object.values(count).reduce((a, b) => a + b, 0), 891);
  const front = d.slices[10];
  assert.ok(front.some((row) => row === 'XXXXSXXXX'), 'controller in the middle of the front wall');
  assert.deepEqual(plain(d.symbols.H.blocks), ['gtceu:heatproof_machine_casing']);
  assert.deepEqual(plain(d.symbols.F.blocks), ['gtceu:frostproof_machine_casing']);
  assert.deepEqual(plain(d.symbols.R.blocks), ['gtceu:robust_machine_casing']);
  assert.equal(d.symbols.X.kind, 'oneOf');
  const kinds = d.symbols.X.options.map((o) => o.kind + ':' + (o.ability || o.blocks));
  assert.deepEqual(plain(kinds), ['blocks:gtceu:heatproof_machine_casing', 'part:maintenance', 'part:muffler', 'part:energy_input', 'part:input_bus', 'part:output_bus', 'part:input_hatch', 'part:output_hatch']);
  const lim = (i) => d.symbols.X.options[i].limits;
  assert.equal(lim(3).min, 1);
  assert.equal(lim(3).max, 2);
  assert.equal(lim(1).exact, 1);
  assert.equal(lim(2).exact, 1);
  const maxParts = d.symbols.X.options.slice(1).reduce((n, o) => n + (o.limits.exact || o.limits.max), 0);
  assert.equal(80 - maxParts, lim(0).min, 'the casing minimum is the cells minus the most parts');
});

// the line of a hot ingot by hand: both stages' energy, every input and output
test('composed lines equal the sum of their two stage recipes: black bronze with nitrogen, europium with helium, and a mold line', () => {
  const h = harness();
  const out = runRecipes(h);
  assert.deepEqual(plain(h.errors), []);
  const byName = Object.fromEntries(h.G.megaSmeltingComplex.recipes.map((r) => [r.name, r]));
  assert.deepEqual(Object.keys(byName).sort(), ['blast_black_bronze', 'blast_black_bronze_gas', 'blast_europium', 'blast_europium_gas', 'blast_molded']);
  assert.equal(out.complex.length, 5);

  const check = (rec, sum) => {
    assert.ok(Math.abs(rec.sourceEnergy - sum) < 1e-3, `${rec.name} sourceEnergy ${rec.sourceEnergy} vs ${sum}`);
    assert.ok(rec.eut > 0 && rec.eut <= 8192, rec.name);
    assert.equal(rec.duration, Math.ceil(sum / 8192), rec.name);
    assert.ok(rec.eut * rec.duration >= sum - 1e-6, rec.name);
    assert.ok(rec.eut * rec.duration - sum < rec.duration, rec.name);
    assert.equal(rec.recipeId, 'grindless:smelting_complex/' + rec.name);
  };

  // black bronze, no gas: 1000 * 120 + 294 * 120 = 155 280 EU
  const bb = byName.blast_black_bronze;
  check(bb, 1000 * 120 + 294 * 120);
  assert.deepEqual(plain(bb.itemsIn.map((x) => [x.id, x.count])), [['gtceu:black_bronze_dust', 1]]);
  assert.deepEqual(plain(bb.fluidsIn), []);
  assert.deepEqual(plain(bb.itemsOut.filter((o) => o.whole > 0).map((o) => [o.id, o.whole])), [['gtceu:black_bronze_ingot', 1]]);
  assert.equal(bb.circuit, 1);
  assert.equal(bb.temp, 2000);

  // black bronze with nitrogen: 670 * 120 + 294 * 120 = 115 680 EU, circuit 2 keeps it apart from the plain line
  const bg = byName.blast_black_bronze_gas;
  check(bg, 670 * 120 + 294 * 120);
  assert.deepEqual(plain(bg.fluidsIn.map((f) => [f.id, f.amount])), [['gtceu:nitrogen', 1000]]);
  assert.equal(bg.circuit, 2);
  assert.equal(bg.temp, 2000);

  // europium with helium and the freezer's liquid helium: 120 * 7680 + 453 * 480 = 921 600 + 217 440 = 1 139 040 EU
  const eg = byName.blast_europium_gas;
  check(eg, 120 * 7680 + 453 * 480);
  assert.deepEqual(plain(eg.itemsIn.map((x) => [x.id, x.count])), [['gtceu:europium_dust', 1]]);
  const fin = Object.fromEntries(eg.fluidsIn.map((f) => [f.id, f.amount]));
  const fout = Object.fromEntries(eg.fluidsOut.map((f) => [f.id, f.amount]));
  // helium: 100 in at the furnace, 250 back from the freezer: net 150 out; liquid helium 500 in
  assert.equal(fin['gtceu:liquid_helium'], 500);
  assert.equal((fin['gtceu:helium'] || 0) - (fout['gtceu:helium'] || 0), 100 - 250);
  assert.ok(!('gtceu:liquid_helium' in fout), 'the coolant is not returned as itself');
  assert.deepEqual(plain(eg.itemsOut.filter((o) => o.whole > 0).map((o) => [o.id, o.whole])), [['gtceu:europium_ingot', 1]]);
  assert.equal(eg.circuit, 2);
  assert.equal(eg.temp, 6000);
  const e0 = byName.blast_europium;
  check(e0, 180 * 7680 + 453 * 480);
  assert.equal(e0.circuit, 1);
  assert.equal(e0.temp, 6000);
  assert.deepEqual(plain(e0.fluidsIn.map((f) => [f.id, f.amount])), [['gtceu:liquid_helium', 500]]);

  // 2 dusts, the freezer's casting mold carried as a non-consumed input: 200 * 480 + 100 * 120 = 108 000 EU
  const mo = byName.blast_molded;
  check(mo, 200 * 480 + 100 * 120);
  assert.deepEqual(plain(mo.itemsIn.map((x) => [x.id, x.count])), [['gtceu:molded_dust', 2]]);
  assert.deepEqual(plain(mo.kept), [{ id: 'gtceu:ingot_casting_mold', count: 1 }]);

  // what the builder received
  const built = Object.fromEntries(out.complex.map((r) => [r.id, r]));
  const b = built['grindless:blast_europium_gas'];
  assert.ok(b, 'builder called with the final id');
  assert.equal(b.circuit, 2);
  assert.equal(b.temp, 6000);
  assert.equal(b.eut, eg.eut);
  assert.equal(b.duration, eg.duration);
  assert.ok(b.itemInputs.includes('1x gtceu:europium_dust'));
  assert.deepEqual(plain(built['grindless:blast_molded'].notConsumable), ['1x gtceu:ingot_casting_mold']);
  assert.deepEqual(plain(h.G.megaSmeltingComplex.clashes), [], 'gas and no-gas variants never clash');
});

test('a hot ingot with no live freezer is skipped and said; a non-hot recipe is ignored', () => {
  const h = harness();
  runRecipes(h);
  const sc = h.G.megaSmeltingComplex;
  assert.equal(sc.candidates, 6);
  assert.deepEqual(plain(sc.skipped.map((s) => s.name)), ['blast_orphan']);
  assert.match(sc.skipped[0].reason, /no live vacuum freezer/);

  const stages = { ...STAGES };
  delete stages['gtceu:vacuum_freezer/cool_hot_europium_ingot'];
  const h2 = harness(stages);
  const out2 = runRecipes(h2);
  assert.equal(out2.complex.length, 3);
  assert.deepEqual(plain(h2.G.megaSmeltingComplex.skipped.map((s) => s.name).sort()), ['blast_europium', 'blast_europium_gas', 'blast_orphan']);
});

test('a line with an unknown item is skipped with the item named', () => {
  const h = harness(STAGES, (id) => id !== 'gtceu:europium_ingot');
  const out = runRecipes(h);
  assert.equal(out.complex.length, 3);
  assert.ok(h.G.megaSmeltingComplex.skipped.some((s) => /europium_ingot/.test(s.reason)));
});

test('parallel figure: coil ceiling (Nichrome 16, HSS-G 64) cut by the energy of the hatches (formulas of lib/mega.js)', () => {
  const h = harness();
  runRecipes(h);
  const F = h.G.mega.formulas;
  const figure = (kelvin, voltage, eut, inputs = 64) => F.parallels(F.ceiling(F.coilCeiling(kelvin, 64), null, 1), F.energyCap(voltage, eut), inputs);
  assert.equal(F.coilCeiling(3600, 64), 16, 'Nichrome');
  assert.equal(F.coilCeiling(5400, 64), 64, 'HSS-G');
  for (const rec of h.G.megaSmeltingComplex.recipes) {
    assert.ok(rec.eut <= 8192, rec.name);
    // an IV hatch pays one copy; a UV hatch is where the coil ceiling starts to bind
    assert.equal(figure(3600, 8192, rec.eut), 1, rec.name);
    assert.equal(figure(5400, 8192, rec.eut), 1, rec.name);
    assert.equal(figure(3600, 8192 * 16, rec.eut), Math.min(16, Math.floor(8192 * 16 / rec.eut)), rec.name);
    assert.equal(figure(5400, 8192 * 64, rec.eut), Math.min(64, Math.floor(8192 * 64 / rec.eut)), rec.name);
  }
  // the lightest line (black bronze at 6.4k EU/t of an IV source): energy first, then coil
  assert.equal(figure(3600, 131072, 155280 / Math.ceil(155280 / 8192)), 16, 'Nichrome ceiling binds');
  assert.equal(figure(5400, 524288, 8192), 64, 'HSS-G ceiling binds');
});

test('controller recipe: 4 electric blast furnaces, 4 vacuum freezers, 4 IV circuits', () => {
  const h = harness();
  const out = runRecipes(h);
  assert.equal(out.assembler.length, 1);
  const r = out.assembler[0];
  assert.equal(r.id, h.G.megaSmeltingComplex.crafting);
  assert.deepEqual(plain(r.itemInputs), ['4x gtceu:electric_blast_furnace', '4x gtceu:vacuum_freezer', '4x #gtceu:circuits/iv', '2x grindless:sintered_regolith', '2x grindless:platinum_electrode']);
  assert.deepEqual(plain(r.itemOutputs), ['gtceu:smelting_complex']);
  assert.ok(r.eut > 0 && r.duration > 0);
});

test('the lang file names the machine, the recipe type and its tooltips in en_us and es_es', () => {
  const lang = read('client_scripts', 'iv_mega_smelting_complex_lang.js');
  const store = {};
  vm.runInNewContext(lang, {
    ClientEvents: { lang: (code, cb) => cb({ add: (ns, key, value) => { (store[code] = store[code] || {})[key] = value; } }) },
    console,
  });
  for (const code of ['en_us', 'es_es']) {
    assert.ok(store[code], code);
    for (const key of ['block.gtceu.smelting_complex', 'gtceu.smelting_complex', 'grindless.machine.smelting_complex.tooltip.0']) {
      assert.ok(store[code][key] && store[code][key].length > 0, code + ' ' + key);
    }
  }
  assert.equal(store.en_us['block.gtceu.smelting_complex'], 'Smelting Complex');
  assert.notEqual(store.es_es['grindless.machine.smelting_complex.tooltip.0'], store.en_us['grindless.machine.smelting_complex.tooltip.0']);
});
