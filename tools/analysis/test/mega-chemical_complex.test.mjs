// MEGA-6, the LuV Mega Chemical Complex (startup_scripts/grindless/luv/mega_chemical_complex.js, server_scripts/grindless/luv/mega_chemical_complex.js,
// data/grindless/tables/mega_chemical_complex.json): the two modes (large chemical reactor, then its own recipe type), the pattern through the real
// helper (15 x 15 x 15, coil rings, parallel hatch slot), the modifier chain (mode veto, coil parallel with the hatch, discount, perfect overclock,
// batch), the composed lines checked against the sum of their stage recipes (recomputed here by hand from the stages' numbers, copied from the bench
// dump), the Gregicality fluid patch, the skipped line, the parallel figures at LuV and ZPM (the formulas of lib/mega.js), the controller recipe
// and the names in both languages.
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

const fluidIn = (tag, amount) => ({ content: { amount, value: [{ tag }] } });
const fluidOut = (id, amount) => ({ content: { amount, value: [{ fluid: id }] } });
const circuit = { content: { type: 'gtceu:circuit', configuration: 1 }, chance: 0 };
const naoh = { content: { type: 'gtceu:sized', count: 3, ingredient: { tag: 'forge:dusts/sodium_hydroxide' } } };
const stage = (eut, duration, inputs, outputs) => ({ type: 'gtceu:chemical_reactor', duration, tickInputs: { eu: [{ content: eut }] }, inputs, outputs });
// GTM 7.5.3's stage recipes as the bench dump holds them
const STAGES = {
  'gtceu:chemical_reactor/chloroform': stage(30, 80, { item: [circuit], fluid: [fluidIn('forge:chlorine', 6000), fluidIn('forge:methane', 1000)] },
    { fluid: [fluidOut('gtceu:hydrochloric_acid', 3000), fluidOut('gtceu:chloroform', 1000)] }),
  'gtceu:chemical_reactor/hydrofluoric_acid_from_elements': stage(7, 60, { fluid: [fluidIn('forge:hydrogen', 1000), fluidIn('forge:fluorine', 1000)] },
    { fluid: [fluidOut('gtceu:hydrofluoric_acid', 1000)] }),
  'gtceu:chemical_reactor/tetrafluoroethylene_from_chloroform': stage(240, 480, { fluid: [fluidIn('forge:chloroform', 2000), fluidIn('forge:hydrofluoric_acid', 4000)] },
    { fluid: [fluidOut('gtceu:hydrochloric_acid', 6000), fluidOut('gtceu:tetrafluoroethylene', 1000)] }),
  'gtceu:chemical_reactor/ptfe_from_oxygen': stage(30, 160, { item: [circuit], fluid: [fluidIn('forge:oxygen', 1000), fluidIn('forge:tetrafluoroethylene', 144)] },
    { fluid: [fluidOut('gtceu:polytetrafluoroethylene', 216)] }),
  'gtceu:chemical_reactor/phenol_from_cumene': stage(30, 160, { fluid: [fluidIn('forge:oxygen', 2000), fluidIn('forge:cumene', 1000)] },
    { fluid: [fluidOut('gtceu:phenol', 1000), fluidOut('gtceu:acetone', 1000)] }),
  'gtceu:chemical_reactor/bisphenol_a': stage(30, 160, { item: [circuit], fluid: [fluidIn('forge:hydrochloric_acid', 1000), fluidIn('forge:acetone', 1000), fluidIn('forge:phenol', 2000)] },
    { fluid: [fluidOut('gtceu:bisphenol_a', 1000), fluidOut('gtceu:diluted_hydrochloric_acid', 1000)] }),
  'gtceu:chemical_reactor/allyl_chloride': stage(30, 160, { item: [circuit], fluid: [fluidIn('forge:propene', 1000), fluidIn('forge:chlorine', 2000)] },
    { fluid: [fluidOut('gtceu:hydrochloric_acid', 1000), fluidOut('gtceu:allyl_chloride', 1000)] }),
  'gtceu:chemical_reactor/hypochlorous_acid': stage(30, 120, { item: [circuit], fluid: [fluidIn('forge:water', 1000), fluidIn('forge:chlorine', 2000)] },
    { fluid: [fluidOut('gtceu:diluted_hydrochloric_acid', 1000), fluidOut('gtceu:hypochlorous_acid', 1000)] }),
  'gtceu:chemical_reactor/epichlorohydrin_from_allyl_chloride': stage(30, 480, { item: [naoh], fluid: [fluidIn('forge:allyl_chloride', 1000), fluidIn('forge:hypochlorous_acid', 1000)] },
    { fluid: [fluidOut('gtceu:salt_water', 1000), fluidOut('gtceu:epichlorohydrin', 1000)] }),
  'gtceu:chemical_reactor/epoxy_from_bisphenol_a': stage(30, 200, { item: [naoh], fluid: [fluidIn('forge:epichlorohydrin', 1000), fluidIn('forge:bisphenol_a', 1000)] },
    { fluid: [fluidOut('gtceu:epoxy', 1000), fluidOut('gtceu:salt_water', 1000)] }),
};

function harness(stages = STAGES) {
  const registry = [];
  const recipeHandlers = [];
  const calls = [];
  const G = {};
  const b = new Proxy({}, { get: (_, method) => (...args) => { calls.push([method, ...args]); return b; } });
  const errors = [];
  const names = new Proxy({}, { get: (_, n) => String(n) });
  const context = vm.createContext({
    global: { grindless: G },
    console: { info() {}, warn() {}, log() {}, error: (...m) => { const s = m.join(' '); if (!/ skipped /.test(s)) errors.push(s); } },
    GTCEuStartupEvents: { registry: (type, cb) => registry.push([type, cb]) },
    ServerEvents: { recipes: (cb) => recipeHandlers.push(cb) },
    ModifierFunction: { NULL: 'NULL', IDENTITY: 'IDENTITY' },
    RotationState: { NON_Y_AXIS: 'NON_Y_AXIS' },
    GTBlocks: names,
    GTRecipeModifiers: names,
    GuiTextures: { PROGRESS_BAR_ARROW_MULTIPLE: 'ARROW' },
    FillDirection: { LEFT_TO_RIGHT: 'LTR' },
    GTSoundEntries: names,
    Text: { translate: (s) => s },
    Item: { exists: () => true },
    Fluid: { exists: () => true, of: (id, amount) => ({ id, amount }) },
    Java: { loadClass: () => ({}) },
  });
  G.readJsonTable = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, 'pack', p), 'utf8'));
  vm.runInContext(read('startup_scripts', 'lib/patterns.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/coils.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/parallel_hatch.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/mega.js'), context);
  vm.runInContext(read('startup_scripts', 'luv/mega_chemical_complex.js'), context);
  vm.runInContext(read('server_scripts', 'lib/compose.js'), context);
  vm.runInContext(read('server_scripts', 'luv/mega_chemical_complex.js'), context);
  const originals = Object.entries(stages).map(([id, s]) => ({ toString: () => id + '[gtceu:x]', json: JSON.stringify(s) }));
  return { G, registry, recipeHandlers, calls, b, errors, context, originals };
}

function registerMachine(h) {
  h.registry.forEach(([type, cb]) => { if (type === 'gtceu:machine') cb({ create: (...a) => { h.calls.push(['create', ...a]); return h.b; } }); });
}

function runRecipes(h) {
  const out = { assembler: [], complex: [] };
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
    recipes: { gtceu: { assembly_line: (id) => builder(id, 'assembler'), mega_chemical_complex: (id) => builder(id, 'complex') } },
  };
  h.recipeHandlers.forEach((cb) => cb(event));
  return out;
}

const fluidMap = (list) => Object.fromEntries(list.map((f) => [f.id, f.amount]));

test('published figures', () => {
  const h = harness();
  assert.equal(h.G.megaChemicalComplex.id, 'gtceu:mega_chemical_complex');
  assert.equal(h.G.megaChemicalComplex.type, 'gtceu:mega_chemical_complex');
  assert.deepEqual(plain(h.G.megaChemicalComplex.types), ['gtceu:large_chemical_reactor', 'gtceu:mega_chemical_complex']);
  assert.deepEqual(plain(h.G.megaChemicalComplex.size), { width: 15, height: 15, depth: 15 });
});

test('registers its own recipe type (room for the largest line) and a coil multiblock with both modes, the LCR first', () => {
  const h = harness();
  const typeCalls = [];
  const typeBuilder = new Proxy({}, { get: (_, m) => (...x) => { typeCalls.push([m, ...x]); return typeBuilder; } });
  h.registry.forEach(([type, cb]) => { if (type === 'gtceu:recipe_type') cb({ create: (...a) => { typeCalls.push(['create', ...a]); return typeBuilder; } }); });
  assert.deepEqual(typeCalls[0], ['create', 'mega_chemical_complex']);
  const size = typeCalls.find((c) => c[0] === 'setMaxIOSize');
  assert.ok(size && size[1] >= 3 && size[2] >= 3 && size[3] >= 7 && size[4] >= 3, 'holds the para-aramid line: 3 / 3 / 8 / 6 >= 1 item in, 1 item out, 7 fluids in, 3 fluids out');
  registerMachine(h);
  assert.deepEqual(h.calls.find((c) => c[0] === 'create' && c[2] === 'multiblock'), ['create', 'mega_chemical_complex', 'multiblock']);
  assert.deepEqual(h.calls.filter((c) => c[0] === 'recipeType').map((c) => c[1]), ['large_chemical_reactor', 'mega_chemical_complex']);
  assert.ok(h.calls.some((c) => c[0] === 'langValue' && c[1] === 'Mega Chemical Complex'));
  assert.ok(h.calls.some((c) => c[0] === 'appearanceBlock' && c[1] === 'CASING_PTFE_INERT'));
  assert.ok(h.calls.some((c) => c[0] === 'workableCasingModel' && c[2] === 'grindless:block/multiblock/mega_chemical_complex'));
  assert.ok(h.calls.some((c) => c[0] === 'machine'), 'a coil machine, so the coil rings form');
});

test('modifier chain: a mode veto first, then coil parallel with the hatch, discount, perfect overclock, batch', () => {
  const h = harness();
  registerMachine(h);
  const mods = h.calls.find((c) => c[0] === 'recipeModifiers');
  assert.ok(mods, 'recipeModifiers installed');
  assert.equal(mods[1], true);
  const list = mods.slice(2);
  assert.equal(list.length, 1 + h.G.mega.chain({ parallel: 'coil', cap: null, hatch: true, discount: { rate: 0.95, floor: 0.8, baseK: 1800 }, oc: 'perfect', batch: true }).length);
  assert.equal(typeof list[0], 'function');
  const machine = (type) => ({ getRecipeType: () => ({ registryName: type }) });
  const recipe = (type) => ({ getType: () => ({ registryName: type }) });
  assert.equal(list[0](machine('gtceu:large_chemical_reactor'), recipe('gtceu:large_chemical_reactor')), 'IDENTITY');
  assert.equal(list[0](machine('gtceu:large_chemical_reactor'), recipe('gtceu:mega_chemical_complex')), 'NULL');
  assert.equal(list[0](machine('gtceu:mega_chemical_complex'), recipe('gtceu:large_chemical_reactor')), 'NULL');
  assert.equal(list[0](machine('gtceu:mega_chemical_complex'), recipe('gtceu:mega_chemical_complex')), 'IDENTITY');
});

test('structure: 15 x 15 x 15, one controller, HSS-S frames, glass, a PTFE pipe column, 4 coil rings, a casing minimum, height within 16', () => {
  const h = harness();
  registerMachine(h);
  const d = h.G.patterns.describe('gtceu:mega_chemical_complex');
  assert.ok(d, 'pattern described');
  assert.equal(d.slices.length, 15);
  let height = 0;
  const count = {};
  d.slices.forEach((rows) => {
    assert.equal(rows.length, 15);
    height = Math.max(height, rows.length);
    rows.forEach((row) => {
      assert.equal(row.length, 15);
      for (const ch of row) count[ch] = (count[ch] || 0) + 1;
    });
  });
  assert.ok(height <= 16);
  assert.equal(count.S, 1);
  assert.equal(count.K, 128, '4 rings of 32');
  assert.equal(count.P, 15 - 2 + 0, 'the central column: 13 cells between the floor and the ceiling plus nothing at the frame rows');
  assert.equal(h.G.megaChemicalComplex.coilCells, 128);
  assert.equal(d.slices[14][1][7], 'S', 'the controller in the middle of the front wall, one row up');
  assert.equal(d.symbols.F.kind, 'blocks');
  assert.deepEqual(plain(d.symbols.F.blocks), ['gtceu:hsss_frame']);
  assert.deepEqual(plain(d.symbols.L.blocks), ['gtceu:laminated_glass']);
  assert.deepEqual(plain(d.symbols.P.blocks), ['gtceu:ptfe_pipe_casing']);
  assert.equal(d.symbols.K.kind, 'blocks');
  assert.ok(d.symbols.K.blocks.includes('gtceu:hssg_coil_block') && d.symbols.K.blocks.includes('gtceu:naquadah_coil_block'));
  assert.equal(d.symbols.X.kind, 'oneOf');
  const abilities = d.symbols.X.options.map((o) => (o.kind === 'blocks' ? o.blocks.join() : o.ability));
  assert.deepEqual(plain(abilities), ['gtceu:inert_machine_casing', 'maintenance', 'energy_input', 'input_bus', 'output_bus', 'input_hatch', 'output_hatch', 'parallel_hatch']);
  const lim = (i) => d.symbols.X.options[i].limits;
  assert.equal(lim(1).exact, 1);
  assert.equal(lim(2).min, 1);
  assert.equal(lim(2).max, 2, 'energy hatches <= 2: lib/patterns.js has no laser hatch');
  assert.equal(lim(3).max, 2);
  assert.equal(lim(4).max, 2);
  assert.ok(lim(5).max >= 4 && lim(6).max >= 4, '4+ fluid input and output hatches');
  assert.equal(lim(7).max, 1, 'one parallel hatch slot');
  const parts = d.symbols.X.options.slice(1).reduce((n, o) => n + (o.limits.exact || o.limits.max), 0);
  assert.equal(count.X - parts, lim(0).min, 'the casing minimum is the cells minus the most parts');
  assert.equal(h.G.megaChemicalComplex.casingCells, count.X);
});

test('the composed lines equal the sum of their stage recipes (PTFE and epoxy by hand: inputs, outputs, total EU)', () => {
  const h = harness();
  const out = runRecipes(h);
  assert.deepEqual(plain(h.errors), []);
  const byName = Object.fromEntries(h.G.megaChemicalComplex.recipes.map((r) => [r.name, r]));
  assert.deepEqual(Object.keys(byName).sort(), ['epoxy', 'ptfe']);
  assert.deepEqual(plain(h.G.megaChemicalComplex.skipped.map((s) => s.name)), ['para_aramid'], 'the Gregicality line is skipped, not invented, when its stages are not live');
  assert.equal(out.complex.length, 2);

  // PTFE by hand: 2000 mB methane = 2 runs of chloroform (12000 mB chlorine, 6000 mB HCl, 2000 mB chloroform); 2000 mB chloroform + 4000 mB HF is 1 TFE run
  // (4 HF runs: 4000 mB hydrogen and fluorine); 1000 mB TFE is 1000 / 144 = 6.9444 runs of PTFE (6945 mB oxygen, 1500 mB PTFE); HCl 3000 x 2 + 6000 = 12000
  const P = byName.ptfe;
  assert.deepEqual(plain(fluidMap(P.fluidsIn)), {
    'gtceu:chlorine': 12000, 'gtceu:methane': 2000, 'gtceu:hydrogen': 4000, 'gtceu:fluorine': 4000, 'gtceu:oxygen': Math.ceil(1000 / 144 * 1000) / 1000 * 1000 === 6945 ? 6945 : 6944,
  });
  assert.deepEqual(plain(fluidMap(P.fluidsOut)), { 'gtceu:hydrochloric_acid': 12000, 'gtceu:polytetrafluoroethylene': 1500 });
  assert.deepEqual(plain(P.itemsIn), []);
  assert.deepEqual(plain(P.itemsOut), []);
  const sumP = 30 * 80 * 2 + 7 * 60 * 4 + 240 * 480 * 1 + 30 * 160 * (1000 / 144);
  assert.ok(Math.abs(P.sourceEnergy - sumP) < 1e-3, `sourceEnergy ${P.sourceEnergy} vs ${sumP}`);

  // epoxy by hand: 2000 mB cumene = 2 phenol runs (4000 mB oxygen, 2000 phenol, 2000 acetone); 1 bisphenol A run takes 2000 phenol, 1000 acetone, 1000 HCl (the HCl of the
  // allyl chloride run); allyl chloride 1 run (1000 propene, 2000 chlorine), hypochlorous acid 1 run (1000 water, 2000 chlorine); 2 x 3 NaOH; epoxy 1000 mB
  const E = byName.epoxy;
  assert.deepEqual(plain(fluidMap(E.fluidsIn)), { 'gtceu:oxygen': 4000, 'gtceu:cumene': 2000, 'gtceu:propene': 1000, 'gtceu:chlorine': 4000, 'gtceu:water': 1000 });
  assert.deepEqual(plain(fluidMap(E.fluidsOut)), { 'gtceu:acetone': 1000, 'gtceu:diluted_hydrochloric_acid': 2000, 'gtceu:salt_water': 2000, 'gtceu:epoxy': 1000 });
  assert.deepEqual(plain(E.itemsIn.map((x) => [x.id, x.count])), [['gtceu:sodium_hydroxide_dust', 6]]);
  assert.deepEqual(plain(E.itemsOut), []);
  const sumE = 30 * (160 * 2 + 160 + 160 + 120 + 480 + 200);
  assert.equal(sumE, 43200);
  assert.ok(Math.abs(E.sourceEnergy - sumE) < 1e-3, `sourceEnergy ${E.sourceEnergy} vs ${sumE}`);

  // rule 7: built at LuV's 32768 EU/t, never cheaper than the stages, by less than one tick of power
  for (const [rec, sum] of [[P, sumP], [E, sumE]]) {
    assert.ok(rec.eut <= 32768 && rec.eut > 0, rec.name);
    assert.equal(rec.duration, Math.ceil(sum / 32768), rec.name);
    assert.ok(rec.eut * rec.duration >= sum - 1e-6, rec.name);
    assert.ok(rec.eut * rec.duration - sum < rec.duration, rec.name);
  }
  assert.equal(P.duration, 5);
  assert.equal(E.duration, 2);
  const built = Object.fromEntries(out.complex.map((r) => [r.id, r]));
  assert.ok(built['grindless:ptfe'] && built['grindless:epoxy']);
  assert.equal(built['grindless:epoxy'].eut, E.eut);
  assert.equal(built['grindless:ptfe'].duration, P.duration);
  assert.deepEqual(plain(h.G.megaChemicalComplex.clashes), []);
});

test('every byproduct of a line leaves as an output (rule 3): the HCl, the diluted acid, the acetone and the salt water are all there', () => {
  const h = harness();
  runRecipes(h);
  const byName = Object.fromEntries(h.G.megaChemicalComplex.recipes.map((r) => [r.name, r]));
  assert.ok(fluidMap(byName.ptfe.fluidsOut)['gtceu:hydrochloric_acid'] > 0);
  const e = fluidMap(byName.epoxy.fluidsOut);
  for (const id of ['gtceu:acetone', 'gtceu:diluted_hydrochloric_acid', 'gtceu:salt_water']) assert.ok(e[id] > 0, id);
});

test('the Gregicality line: gcyr fluids are read through the patch and close inside the line; the chain is 6 live stages', () => {
  const stages = { ...STAGES };
  const gcyrIn = (id, amount) => ({ content: { amount, value: [{ tag: 'forge:' + id }] } });
  const gcyrOut = (id, amount) => ({ content: { amount, value: [{ fluid: 'gcyr:' + id }] } });
  stages['gcyr:chemical_reactor/nitroaniline'] = stage(30, 100, { fluid: [fluidIn('forge:nitrochlorobenzene', 1000), fluidIn('forge:ammonia', 2000)] },
    { fluid: [gcyrOut('nitroaniline', 1000)], item: [{ content: { type: 'gtceu:sized', count: 1, ingredient: { item: 'gtceu:ammonium_chloride_dust' } } }] });
  stages['gcyr:chemical_reactor/para_phenylenediamine'] = stage(30, 100, { fluid: [gcyrIn('nitroaniline', 1000), fluidIn('forge:hydrogen', 5000)] },
    { fluid: [gcyrOut('para_phenylenediamine', 1000), fluidOut('gtceu:water', 3000)] });
  stages['gcyr:chemical_reactor/bis_trichloromethyl_benzene'] = stage(30, 100, { fluid: [gcyrIn('para_xylene', 1000), fluidIn('forge:chlorine', 12000)] },
    { fluid: [gcyrOut('bis_trichloromethyl_benzene', 1000), fluidOut('gtceu:hydrochloric_acid', 6000)] });
  stages['gcyr:chemical_reactor/therephthalic_acid'] = stage(30, 100, { fluid: [gcyrIn('methylbenzaldehyde', 1000), fluidIn('forge:oxygen', 3000)] },
    { fluid: [gcyrOut('therephthalic_acid', 1000), fluidOut('gtceu:hydrogen', 0 + 1000)] });
  stages['gcyr:chemical_reactor/terephthaloyl_chloride'] = stage(30, 100, { fluid: [gcyrIn('bis_trichloromethyl_benzene', 1000), gcyrIn('therephthalic_acid', 1000)] },
    { fluid: [gcyrOut('terephthaloyl_chloride', 2000), fluidOut('gtceu:hydrochloric_acid', 2000)] });
  stages['gcyr:large_chemical_reactor/para_aramid'] = stage(30, 100, { fluid: [gcyrIn('para_phenylenediamine', 1000), gcyrIn('terephthaloyl_chloride', 1000)] },
    { fluid: [gcyrOut('para_aramid', 1000), fluidOut('gtceu:hydrochloric_acid', 2000)] });
  const h = harness(stages);
  runRecipes(h);
  assert.deepEqual(plain(h.errors), []);
  const rec = h.G.megaChemicalComplex.recipes.find((r) => r.name === 'para_aramid');
  assert.ok(rec, 'the line is composed once its six stages are live');
  assert.deepEqual(plain(h.G.megaChemicalComplex.skipped), []);
  const outs = fluidMap(rec.fluidsOut);
  assert.ok(outs['gcyr:para_aramid'] > 0, 'the product is gcyr:para_aramid');
  for (const k of Object.keys(fluidMap(rec.fluidsIn))) assert.ok(!/nitroaniline|para_phenylenediamine|bis_trichloromethyl|therephthalic|terephthaloyl/.test(k), 'intermediate ' + k + ' closed inside');
  assert.ok(fluidMap(rec.fluidsIn)['gcyr:para_xylene'] > 0, 'para-xylene is a gcyr fluid input, not a gtceu one');
});

test('a line with a stage that is not live is skipped and said, not invented', () => {
  const stages = { ...STAGES };
  delete stages['gtceu:chemical_reactor/ptfe_from_oxygen'];
  const h = harness(stages);
  const out = runRecipes(h);
  assert.equal(out.complex.length, 1);
  const skipped = plain(h.G.megaChemicalComplex.skipped).map((s) => s.name).sort();
  assert.deepEqual(skipped, ['para_aramid', 'ptfe']);
  assert.ok(plain(h.G.megaChemicalComplex.skipped).find((s) => s.name === 'ptfe').reason.includes('ptfe_from_oxygen'));
});

test('parallel figures (formulas of lib/mega.js): LuV HSS-G 64 x 16 = 1,024 and ZPM Naquadah 256 x 64 = 16,384, cut by the energy of the hatches', () => {
  const h = harness();
  runRecipes(h);
  const F = h.G.mega.formulas;
  const hssg = F.coilCeiling(5400, null);
  const naq = F.coilCeiling(7200, null);
  assert.equal(hssg, 64);
  assert.equal(naq, 256);
  const figure = (kelvin, hatch, voltage, eut) => F.parallels(F.ceiling(F.coilCeiling(kelvin, null), null, hatch), F.energyCap(voltage, eut), 1 << 30);
  // ceilings: one LuV hatch (32,768 V) on a 8 EU/t LCR recipe has room for 4,096 copies, so the coil x hatch ceiling of 1,024 is the limit
  assert.equal(figure(5400, 16, 32768, 8), 1024);
  // one ZPM energy hatch (131,072 V) carries 16,384 copies of a 8 EU/t recipe
  assert.equal(figure(7200, 64, 131072, 8), 16384);
  assert.equal(figure(7200, 64, 32768, 8), 4096, 'with a LuV hatch the same plant is energy-bound');
  // a composed line costs the full LuV voltage per copy: 1 copy per LuV hatch amp, never more
  for (const rec of h.G.megaChemicalComplex.recipes) {
    assert.ok(rec.eut > 16384 && rec.eut <= 32768, rec.name + ' ' + rec.eut);
    assert.equal(figure(5400, 16, 32768, rec.eut), 1, rec.name);
    assert.equal(figure(7200, 64, 131072, rec.eut), Math.floor(131072 / rec.eut), rec.name);
  }
});

test('controller recipe: 4 coil chemical plants, 16 LuV chemical reactors, 4 LuV circuits, 16 PTFE frames', () => {
  const h = harness();
  const out = runRecipes(h);
  assert.equal(out.assembler.length, 1);
  const r = out.assembler[0];
  assert.equal(r.id, h.G.megaChemicalComplex.crafting);
  assert.deepEqual(plain(r.itemInputs), ['4x gtceu:coil_chemical_plant', '16x gtceu:luv_chemical_reactor', '4x #gtceu:circuits/luv', '16x gtceu:polytetrafluoroethylene_frame', '2x grindless:ion_exchange_resin', '2x grindless:contact_catalyst']);
  assert.deepEqual(plain(r.itemOutputs), ['gtceu:mega_chemical_complex']);
  assert.deepEqual(fluidMap(r.inputFluids), { 'gtceu:soldering_alloy': 1152, 'gtceu:lubricant': 1000 });
  assert.ok(r.eut > 0 && r.duration > 0);
  assert.deepEqual(plain(h.errors), []);
});

test('the lang file names the machine, the recipe type and its tooltips in en_us and es_es', () => {
  const lang = read('client_scripts', 'luv_mega_chemical_complex_lang.js');
  const store = {};
  vm.runInNewContext(lang, {
    ClientEvents: { lang: (code, cb) => cb({ add: (ns, key, value) => { (store[code] = store[code] || {})[key] = value; } }) },
    console,
  });
  const keys = ['block.gtceu.mega_chemical_complex', 'gtceu.mega_chemical_complex'];
  keys.push('grindless.machine.mega_chemical_complex.tooltip.0');
  for (const code of ['en_us', 'es_es']) {
    assert.ok(store[code], code);
    for (const key of keys) assert.ok(store[code][key] && store[code][key].length > 0, code + ' ' + key);
  }
  assert.equal(store.en_us['block.gtceu.mega_chemical_complex'], 'Mega Chemical Complex');
  assert.notEqual(store.es_es['grindless.machine.mega_chemical_complex.tooltip.0'], store.en_us['grindless.machine.mega_chemical_complex.tooltip.0']);
});
