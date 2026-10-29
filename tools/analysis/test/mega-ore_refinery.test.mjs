// MEGA-4, the EV Ore Refinery (startup_scripts/grindless/ev/mega_ore_refinery.js, server_scripts/grindless/ev/mega_ore_refinery.js,
// data/grindless/tables/mega_ore_refinery.json): the recipe type, the pattern through the real helper, the modifier chain, composed ore lines
// checked against the sum of their four stage recipes (recomputed here by hand from the stages' numbers), the skipped ores, the parallel figure
// at two hatch tiers (the formulas of lib/mega.js), the controller recipe and the names in both languages.
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

// GTM 7.5.3's stage recipes in the JSON shape compose.js reads (copied from the bench dump: the plain-water washer variant)
const tag = (t, count) => ({ content: { type: 'gtceu:sized', count, ingredient: { tag: t } }, chance: 10000, maxChance: 10000 });
const item = (id, count) => ({ content: { type: 'gtceu:sized', count, ingredient: { item: id } }, chance: 10000, maxChance: 10000 });
const chanced = (id, chance, maxChance = 10000) => ({ content: { type: 'gtceu:sized', count: 1, ingredient: { item: id } }, chance, maxChance });
const water = { content: { amount: 1000, value: [{ tag: 'forge:water' }] }, chance: 10000, maxChance: 10000 };
const circuit = { content: { type: 'gtceu:circuit', configuration: 1 }, chance: 0, maxChance: 10000 };
const stage = (eut, inputs, outputs) => ({ duration: 400, tickInputs: { eu: [{ content: eut }] }, inputs, outputs });

// ore, the byproduct of the washer and the centrifuge, the byproduct of the two macerators, and the dust
function oreStages(m, wash, centrifuge, dust, raw) {
  return {
    [`gtceu:macerator/macerate_raw_${m}_ore_to_crushed_ore`]: stage(2, { item: [tag(`forge:raw_materials/${m}`, 1)] },
      { item: [item(`gtceu:crushed_${m}_ore`, 2), chanced(raw, 1400)] }),
    [`gtceu:ore_washer/wash_${m}_crushed_ore_to_purified_ore`]: stage(16, { fluid: [water], item: [tag(`forge:crushed_ores/${m}`, 1), circuit] },
      { item: [item(`gtceu:purified_${m}_ore`, 1), chanced(wash, 3333, 9999), item('gtceu:stone_dust', 1)] }),
    [`gtceu:thermal_centrifuge/centrifuge_${m}_purified_ore_to_refined_ore`]: stage(30, { item: [tag(`forge:purified_ores/${m}`, 1)] },
      { item: [item(`gtceu:refined_${m}_ore`, 1), chanced(centrifuge, 3333, 9999)] }),
    [`gtceu:macerator/macerate_${m}_refined_ore_to_dust`]: stage(2, { item: [tag(`forge:refined_ores/${m}`, 1)] },
      { item: [item(dust, 1), chanced(centrifuge === 'gtceu:zinc_dust' ? 'gtceu:zinc_dust' : 'gtceu:silver_dust', 1400)] }),
  };
}
const STAGES = {
  ...oreStages('tin', 'gtceu:iron_dust', 'gtceu:zinc_dust', 'gtceu:tin_dust', 'gtceu:iron_dust'),
  ...oreStages('galena', 'gtceu:sulfur_dust', 'gtceu:silver_dust', 'gtceu:galena_dust', 'gtceu:sulfur_dust'),
};
// a macerator recipe of a raw ore that has no washer, so the line is not live
STAGES['gtceu:macerator/macerate_raw_orphan_ore_to_crushed_ore'] = stage(2, { item: [tag('forge:raw_materials/orphan', 1)] }, { item: [item('gtceu:crushed_orphan_ore', 2)] });

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
    GTBlocks: { CASING_TITANIUM_STABLE: 'CASING_TITANIUM_STABLE' },
    GTRecipeModifiers: { OC_NON_PERFECT: 'OC_NON_PERFECT', BATCH_MODE: 'BATCH_MODE' },
    GuiTextures: { PROGRESS_BAR_ARROW_MULTIPLE: 'ARROW' },
    FillDirection: { LEFT_TO_RIGHT: 'LTR' },
    GTSoundEntries: { MACERATOR: 'MACERATOR' },
    Text: { translate: (s) => s },
    Item: { exists: itemExists },
    Fluid: { exists: () => true, of: (id, amount) => ({ id, amount }) },
    Java: { loadClass: () => ({}) },
  });
  G.readJsonTable = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, 'pack', p), 'utf8'));
  vm.runInContext(read('startup_scripts', 'lib/patterns.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/coils.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/mega.js'), context);
  vm.runInContext(read('startup_scripts', 'ev/mega_ore_refinery.js'), context);
  vm.runInContext(read('server_scripts', 'lib/compose.js'), context);
  vm.runInContext(read('server_scripts', 'ev/mega_ore_refinery.js'), context);
  const originals = Object.entries(stages).map(([id, s]) => ({ toString: () => id + '[gtceu:x]', json: JSON.stringify(s) }));
  return { G, registry, recipeHandlers, calls, b, errors, context, originals };
}

function registerMachine(h) {
  h.registry.forEach(([type, cb]) => { if (type === 'gtceu:machine') cb({ create: (...a) => { h.calls.push(['create', ...a]); return h.b; } }); });
}

// runs the recipe handlers with a recording event: { assembler: [...], refinery: [...] }
function runRecipes(h) {
  const out = { assembler: [], refinery: [] };
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
    recipes: { gtceu: { assembler: (id) => builder(id, 'assembler'), ore_refinery: (id) => builder(id, 'refinery') } },
  };
  h.recipeHandlers.forEach((cb) => cb(event));
  return out;
}

test('published figures', () => {
  const h = harness();
  assert.equal(h.G.megaOreRefinery.id, 'gtceu:ore_refinery');
  assert.equal(h.G.megaOreRefinery.type, 'gtceu:ore_refinery');
  assert.equal(h.G.megaOreRefinery.parallels, 64);
});

test('registers the recipe type and a multiblock on it, no coil, no extra mode', () => {
  const h = harness();
  const typeCalls = [];
  const typeBuilder = new Proxy({}, { get: (_, m) => (...x) => { typeCalls.push([m, ...x]); return typeBuilder; } });
  h.registry.forEach(([type, cb]) => { if (type === 'gtceu:recipe_type') cb({ create: (...a) => { typeCalls.push(['create', ...a]); return typeBuilder; } }); });
  assert.deepEqual(typeCalls[0], ['create', 'ore_refinery']);
  assert.ok(typeCalls.some((c) => c[0] === 'setMaxIOSize' && c.slice(1).join() === '1,9,1,0'));
  registerMachine(h);
  assert.deepEqual(h.calls.find((c) => c[0] === 'create'), ['create', 'ore_refinery', 'multiblock']);
  assert.deepEqual(h.calls.filter((c) => c[0] === 'recipeType').map((c) => c[1]), ['ore_refinery']);
  assert.ok(h.calls.some((c) => c[0] === 'langValue' && c[1] === 'Ore Refinery'));
  assert.ok(h.calls.some((c) => c[0] === 'appearanceBlock' && c[1] === 'CASING_TITANIUM_STABLE'));
  assert.ok(h.calls.some((c) => c[0] === 'workableCasingModel' && c[2] === 'grindless:block/multiblock/ore_refinery'));
  assert.ok(!h.calls.some((c) => c[0] === 'machine'), 'not a coil machine');
});

test('modifier chain: fixed parallel, non-perfect overclock, batch (three modifiers, no veto, no discount)', () => {
  const h = harness();
  registerMachine(h);
  const mods = h.calls.find((c) => c[0] === 'recipeModifiers');
  assert.ok(mods, 'recipeModifiers installed');
  assert.equal(mods[1], true);
  assert.equal(mods.slice(2).length, 3, 'parallel, overclock, batch');
});

test('structure: 7 x 7 x 9, one controller, 196 casing cells, 20 frames, 42 glass, 7 pipes, 21 gearboxes, 154 air, height within 16', () => {
  const h = harness();
  registerMachine(h);
  const d = h.G.patterns.describe('gtceu:ore_refinery');
  assert.ok(d, 'pattern described');
  assert.equal(d.slices.length, 9);
  let height = 0;
  const count = {};
  d.slices.forEach((rows) => {
    assert.equal(rows.length, 7);
    height = Math.max(height, rows.length);
    rows.forEach((row) => {
      assert.equal(row.length, 7);
      for (const ch of row) count[ch] = (count[ch] || 0) + 1;
    });
  });
  assert.ok(height <= 16);
  assert.deepEqual(plain(count), { X: 196, F: 20, G: 42, P: 7, B: 21, S: 1, '#': 154 });
  assert.equal(d.slices[8][3], 'FXGSGXF', 'controller in the middle of the front wall');
  assert.deepEqual(plain(d.symbols.B.blocks), ['gtceu:steel_gearbox']);
  assert.equal(d.symbols.X.kind, 'oneOf');
  const kinds = d.symbols.X.options.map((o) => o.kind + ':' + (o.ability || o.blocks));
  assert.deepEqual(plain(kinds), ['blocks:gtceu:stable_machine_casing', 'part:energy_input', 'part:input_bus', 'part:output_bus', 'part:input_hatch', 'part:muffler']);
  const lim = (i) => d.symbols.X.options[i].limits;
  assert.equal(lim(0).min, 188);
  assert.equal(lim(1).max, 2);
  assert.equal(lim(1).min, 1);
  assert.equal(lim(4).exact, 1);
  const maxParts = d.symbols.X.options.slice(1).reduce((n, o) => n + (o.limits.exact || o.limits.max), 0);
  assert.equal(196 - maxParts, lim(0).min, 'the casing minimum is the cells minus the most parts');
});

test('composed ore lines equal the sum of their four stage recipes (inputs, outputs, total EU), tin and galena', () => {
  const h = harness();
  const out = runRecipes(h);
  assert.deepEqual(plain(h.errors.filter((e) => !/orphan/.test(e))), []);
  assert.equal(out.refinery.length, 2);
  const byName = Object.fromEntries(h.G.megaOreRefinery.recipes.map((r) => [r.name, r]));
  // by hand: 1 raw ore -> 2 crushed -> 2 washes (2000 mB) -> 2 purified -> 2 refined -> 2 dust
  // energy: 400 * (2 * 1 + 2 * 16 + 2 * 30 + 2 * 2) = 400 * 98 = 39 200 EU
  const sum = 400 * (2 + 2 * 16 + 2 * 30 + 2 * 2);
  assert.equal(sum, 39200);
  const lines = [
    // name, raw item, dust, byproduct of the raw macerator and washer, byproduct of the centrifuge and refined macerator
    ['tin', 'gtceu:raw_tin', 'gtceu:tin_dust', 'gtceu:iron_dust', 'gtceu:zinc_dust'],
    ['galena', 'gtceu:raw_galena', 'gtceu:galena_dust', 'gtceu:sulfur_dust', 'gtceu:silver_dust'],
  ];
  for (const [name, raw, dust, first, second] of lines) {
    const rec = byName[name];
    assert.ok(rec, name);
    assert.deepEqual(plain(rec.itemsIn.map((x) => [x.id, x.count])), [[raw, 1]], name + ' inputs');
    assert.deepEqual(plain(rec.fluidsIn.map((f) => [f.id, f.amount])).length, 1);
    assert.equal(rec.fluidsIn[0].amount, 2000, 'two washes');
    assert.deepEqual(plain(rec.fluidsOut), []);
    const whole = Object.fromEntries(rec.itemsOut.filter((o) => o.whole > 0).map((o) => [o.id, o.whole]));
    assert.deepEqual(plain(whole), { [dust]: 2, 'gtceu:stone_dust': 2 }, name + ' whole outputs');
    // chances, in 1/10000: first = 0.14 (raw macerator) + 2 * 3333/9999 (washer); second = 2 * 3333/9999 (centrifuge) + 2 * 0.14 (refined macerator)
    const chance = Object.fromEntries(rec.itemsOut.filter((o) => o.chance > 0).map((o) => [o.id, o.chance]));
    assert.deepEqual(Object.keys(chance).sort(), [first, second].sort(), name + ' byproducts stay in the outputs');
    assert.ok(Math.abs(chance[first] - 10000 * (0.14 + 2 / 3)) <= 1, `${name} ${first} ${chance[first]}`);
    assert.ok(Math.abs(chance[second] - 10000 * (2 / 3 + 0.28)) <= 1, `${name} ${second} ${chance[second]}`);
    // rule 7: built at EV's 512 EU/t, never cheaper than the stages, by less than one tick of power
    assert.ok(Math.abs(rec.sourceEnergy - sum) < 1e-3, `${name} sourceEnergy ${rec.sourceEnergy} vs ${sum}`);
    assert.ok(rec.eut <= 512 && rec.eut > 0, name);
    assert.equal(rec.duration, Math.ceil(sum / 512), name);
    assert.ok(rec.eut * rec.duration >= sum - 1e-6, name);
    assert.ok(rec.eut * rec.duration - sum < rec.duration, name);
    assert.equal(rec.recipeId, 'grindless:ore_refinery/' + name);
  }
  const built = Object.fromEntries(out.refinery.map((r) => [r.id, r]));
  assert.ok(built['grindless:tin'] && built['grindless:galena']);
  assert.equal(built['grindless:tin'].eut, byName.tin.eut);
  assert.equal(built['grindless:galena'].duration, byName.galena.duration);
  assert.deepEqual(plain(h.G.megaOreRefinery.clashes), []);
});

test('an ore with a stage that is not live is skipped and said, not invented', () => {
  const h = harness();
  const out = runRecipes(h);
  const skipped = h.G.megaOreRefinery.skipped;
  assert.equal(out.refinery.length, 2);
  assert.equal(h.G.megaOreRefinery.candidates, 3);
  assert.equal(skipped.length, 1);
  assert.equal(skipped[0].name, 'orphan');
  assert.match(skipped[0].reason, /missing stage recipe/);
  assert.match(skipped[0].reason, /ore_washer\/wash_orphan_crushed_ore_to_purified_ore/);

  const stages = { ...STAGES };
  delete stages['gtceu:thermal_centrifuge/centrifuge_galena_purified_ore_to_refined_ore'];
  const h2 = harness(stages);
  const out2 = runRecipes(h2);
  assert.deepEqual(plain(out2.refinery.map((r) => r.id)), ['grindless:tin']);
  assert.ok(h2.G.megaOreRefinery.skipped.some((s) => s.name === 'galena' && /centrifuge_galena/.test(s.reason)));
});

test('an ore whose item does not exist is skipped with the item named', () => {
  const h = harness(STAGES, (id) => id !== 'gtceu:refined_tin_ore');
  const out = runRecipes(h);
  assert.deepEqual(plain(out.refinery.map((r) => r.id)), ['grindless:galena']);
  assert.ok(h.G.megaOreRefinery.skipped.some((s) => s.name === 'tin' && /refined_tin_ore/.test(s.reason)));
});

test('parallel figure: fixed ceiling 64, cut by the energy of the hatches (formulas of lib/mega.js), at EV and IV hatches', () => {
  const h = harness();
  runRecipes(h);
  const F = h.G.mega.formulas;
  const figure = (voltage, eut, inputs = 64) => F.parallels(F.ceiling(64, null, 1), F.energyCap(voltage, eut), inputs);
  for (const rec of h.G.megaOreRefinery.recipes) {
    assert.equal(figure(2048, rec.eut), Math.min(64, Math.floor(2048 / rec.eut)), rec.name);
    assert.equal(figure(8192, rec.eut), Math.min(64, Math.floor(8192 / rec.eut)), rec.name);
    assert.ok(figure(8192, rec.eut) >= figure(2048, rec.eut), rec.name);
  }
  assert.equal(figure(2048, 512), 4, 'one EV hatch: four copies');
  assert.equal(figure(8192, 512), 16, 'one IV hatch: sixteen copies');
  assert.equal(figure(32768, 512), 64, 'the ceiling');
  assert.equal(figure(8192, 512, 5), 5, 'the inputs still limit');
});

test('controller recipe: 4 EV macerators, 4 EV ore washers, 4 EV thermal centrifuges, 4 EV sifters, 4 EV circuits', () => {
  const h = harness();
  const out = runRecipes(h);
  assert.equal(out.assembler.length, 1);
  const r = out.assembler[0];
  assert.equal(r.id, h.G.megaOreRefinery.crafting);
  assert.deepEqual(plain(r.itemInputs), ['4x gtceu:ev_macerator', '4x gtceu:ev_ore_washer', '4x gtceu:ev_thermal_centrifuge', '4x gtceu:ev_sifter', '4x #gtceu:circuits/ev']);
  assert.deepEqual(plain(r.itemOutputs), ['gtceu:ore_refinery']);
  assert.ok(r.eut > 0 && r.duration > 0);
});

test('the lang file names the machine, the recipe type and its tooltips in en_us and es_es', () => {
  const lang = read('client_scripts', 'ev_mega_ore_refinery_lang.js');
  const store = {};
  vm.runInNewContext(lang, {
    ClientEvents: { lang: (code, cb) => cb({ add: (ns, key, value) => { (store[code] = store[code] || {})[key] = value; } }) },
    console,
  });
  for (const code of ['en_us', 'es_es']) {
    assert.ok(store[code], code);
    for (const key of ['block.gtceu.ore_refinery', 'gtceu.ore_refinery', 'grindless.machine.ore_refinery.tooltip.0', 'grindless.machine.ore_refinery.tooltip.1', 'grindless.machine.ore_refinery.tooltip.2']) {
      assert.ok(store[code][key] && store[code][key].length > 0, code + ' ' + key);
    }
  }
  assert.equal(store.en_us['block.gtceu.ore_refinery'], 'Ore Refinery');
  assert.notEqual(store.es_es['grindless.machine.ore_refinery.tooltip.0'], store.en_us['grindless.machine.ore_refinery.tooltip.0']);
});
