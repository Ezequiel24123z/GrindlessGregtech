// UXV-M2, the stellar fractionation hall (startup_scripts/grindless/uxv/stellar_fractionation_hall.js, server_scripts/grindless/uxv/stellar_fractionation_hall.js):
// the pattern through the real helper, the two modes with the veto, the modifier chain (perfect overclock, no discount), the parallel figure at the UXV hatch,
// the one controller recipe (and that nothing else makes it), the names in both languages, the EMI page, the test zone and the closed pendingUses.
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

function harness(exists = () => true) {
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
    Block: { getBlock: (id) => id },
    GTRecipeModifiers: { OC_PERFECT_SUBTICK: 'OC_PERFECT_SUBTICK', OC_NON_PERFECT: 'OC_NON_PERFECT', BATCH_MODE: 'BATCH_MODE' },
    Text: { translate: (s) => s, gray: (s) => s },
    Item: { exists, of: (id) => id },
    Fluid: { of: (id, n) => id + ' ' + n, exists: () => true },
    Java: { loadClass: () => ({}) },
  });
  vm.runInContext(read('startup_scripts', 'lib/patterns.js'), context);
  vm.runInContext(read('startup_scripts', 'lib/mega.js'), context);
  G.parallelHatch = { part: () => ({ kind: 'part', ability: 'parallel_hatch', limits: { max: 1 }, build: () => null }) };
  vm.runInContext(read('startup_scripts', 'uxv/stellar_fractionation_hall.js'), context);
  vm.runInContext(read('server_scripts', 'uxv/stellar_fractionation_hall.js'), context);
  return { G, registry, recipeHandlers, calls, b, errors };
}

function register(h) {
  h.registry.forEach(([type, cb]) => { if (type === 'gtceu:machine') cb({ create: (...a) => { h.calls.push(['create', ...a]); return h.b; } }); });
}

test('published figures', () => {
  const h = harness();
  const S = h.G.stellarFractionationHall;
  assert.equal(S.id, 'gtceu:stellar_fractionation_hall');
  assert.deepEqual(plain(S.types), ['gtceu:distillation_tower', 'gtceu:distillery']);
  assert.equal(S.cap, 4096);
  assert.equal(S.maxOutputs, 12);
  assert.deepEqual(plain(S.size), { width: 13, height: 13, depth: 25 });
});

test('registers a multiblock with the two modes, tower first, in the UXV casing look', () => {
  const h = harness();
  register(h);
  assert.deepEqual(h.calls.find((c) => c[0] === 'create'), ['create', 'stellar_fractionation_hall', 'multiblock']);
  assert.deepEqual(h.calls.filter((c) => c[0] === 'recipeType').map((c) => c[1]), ['distillation_tower', 'distillery']);
  assert.ok(h.calls.some((c) => c[0] === 'langValue' && c[1] === 'Stellar Fractionation Hall'));
  assert.ok(h.calls.some((c) => c[0] === 'workableCasingModel' && c[1] === 'gtceu:block/casings/voltage/uxv/side' && c[2] === 'grindless:block/multiblock/stellar_fractionation_hall'));
  assert.equal(h.calls.filter((c) => c[0].startsWith('tooltips'))[0][1].length, 4);
});

test('modifier chain: mode veto, fixed parallel with hatch, perfect overclock, batch, no discount', () => {
  const h = harness();
  register(h);
  const mods = h.calls.find((c) => c[0] === 'recipeModifiers');
  assert.ok(mods, 'recipeModifiers installed');
  assert.equal(mods[1], true);
  const list = mods.slice(2);
  assert.equal(list.length, 4, 'veto, parallel, overclock, batch');
  assert.ok(list.includes('OC_PERFECT_SUBTICK'));
  assert.ok(!list.includes('OC_NON_PERFECT'));
  assert.ok(list.indexOf('OC_PERFECT_SUBTICK') < list.indexOf('BATCH_MODE'), 'overclock before batch');
  const machine = { getRecipeType: () => ({ registryName: 'gtceu:distillery' }) };
  assert.equal(list[0](machine, { getType: () => ({ registryName: 'gtceu:distillation_tower' }) }), 'NULL');
  assert.equal(list[0](machine, { getType: () => ({ registryName: 'gtceu:distillery' }) }), 'IDENTITY');
});

test('structure: 13 x 13 x 25 (lies on its side, 13 rows per slice), one controller on the front face, two columns, parts and 12 output hatches', () => {
  const h = harness();
  register(h);
  const d = h.G.patterns.describe('gtceu:stellar_fractionation_hall');
  assert.ok(d, 'pattern described');
  assert.equal(d.slices.length, 25);
  const count = {};
  d.slices.forEach((rows) => {
    assert.equal(rows.length, 13);
    rows.forEach((row) => {
      assert.equal(row.length, 13);
      for (const ch of row) count[ch] = (count[ch] || 0) + 1;
    });
  });
  assert.equal(count.S, 1);
  assert.equal(d.slices[24][1][6], 'S', 'controller in the middle of the front face, one row up');
  const kinds = d.symbols.X.options.map((o) => o.kind + ':' + (o.ability || o.blocks));
  assert.deepEqual(plain(kinds), ['blocks:gtceu:uxv_machine_casing', 'part:maintenance', 'part:energy_input', 'part:input_bus', 'part:output_bus', 'part:input_hatch', 'part:parallel_hatch']);
  // parts take at most 12 cells (1 + 2 + 2 + 2 + 4 + 1), so the casing floor leaves exactly that room, and the cells are enough
  assert.equal(d.symbols.X.options[0].limits.min, count.X - 12);
  assert.ok(count.X >= 12);
  assert.ok(d.symbols.X.options.find((o) => o.ability === 'input_hatch').limits.min >= 1);
  const out = d.symbols.O.options.find((o) => o.ability === 'output_hatch');
  assert.equal(out.limits.max, 12);
  assert.ok(count.O >= 12, 'a hatch cell for each of the 12 outputs of a tower recipe');
  assert.equal(d.symbols.L.blocks[0], 'gtceu:laminated_glass');
  assert.equal(d.symbols.P.blocks[0], 'gtceu:titanium_pipe_casing');
  assert.equal(d.symbols.K.blocks[0], 'gtceu:superconducting_coil');
  assert.equal(d.symbols.V.blocks[0], 'gtceu:computer_heat_vent');
  assert.deepEqual(plain(d.symbols.Q.materials), ['naquadah_alloy']);
});

test('parallel figure: ceiling 4096 x the hatch, under 2^31 at the UXV hatch, cut by the energy of the hatches', () => {
  const h = harness();
  const F = h.G.mega.formulas;
  assert.equal(F.ceiling(4096, null, 1), 4096);
  assert.equal(F.ceiling(4096, null, 65536), 268435456);
  assert.ok(F.ceiling(4096, null, 65536) < 2 ** 31);
  assert.equal(F.parallels(F.ceiling(4096, null, 65536), F.energyCap(524288 * 16, 7680), 1e10), Math.floor(524288 * 16 / 7680));
});

test('controller recipe: one guarded assembly line researched with the condensation tower, ten distinct inputs, tag circuits', () => {
  const run = (exists) => {
    const h = harness(exists);
    const recipes = [];
    h.recipeHandlers.forEach((cb) => cb({ recipes: { gtceu: { assembly_line: (id) => {
      const r = { id, items: [], fluids: [], outs: [] };
      recipes.push(r);
      const c = {
        itemInputs: (...a) => { r.items.push(...a); return c; },
        inputFluids: (...a) => { r.fluids.push(...a); return c; },
        itemOutputs: (...a) => { r.outs.push(...a); return c; },
        stationResearch: (f) => { r.research = f({ researchStack: (s) => ({ CWUt: (n) => ({ EUt: (e) => ({ s, n, e }) }) }) }); return c; },
        EUt: (e) => { r.eut = e; return c; },
        duration: (d) => { r.duration = d; return c; },
      };
      return c;
    } } } }));
    return { recipes, h };
  };
  const { recipes, h } = run(() => true);
  assert.equal(recipes.length, 1);
  const r = recipes[0];
  assert.equal(r.id, 'grindless:stellar_fractionation_hall');
  assert.deepEqual(plain(r.outs), ['gtceu:stellar_fractionation_hall']);
  for (const it of ['gtceu:uxv_machine_hull', '2x gtceu:uxv_conveyor_module', '2x gtceu:uxv_robot_arm', '2x gtceu:uxv_electric_pump', 'grindless:lasagna_plate', 'grindless:pt_sheet', '4x #gtceu:circuits/uxv']) assert.ok(r.items.includes(it), it);
  assert.ok(r.items.length <= 16);
  assert.ok(r.fluids.includes('gtceu:stellar_helium_cut 1000'));
  assert.ok(r.fluids.includes('gtceu:soldering_alloy 2304'));
  assert.ok(r.fluids.includes('gtceu:lubricant 2000'));
  assert.equal(r.research.s, 'gtceu:stellar_condensation_tower');
  assert.equal(h.G.stellarFractionationHall.recipeId, 'grindless:assembly_line/stellar_fractionation_hall');
  const miss = run((id) => id !== 'grindless:pt_sheet');
  assert.equal(miss.recipes.length, 0);
  assert.deepEqual(plain(miss.h.G.stellarFractionationHall.missing), ['grindless:pt_sheet']);
});

test('only from: no other script in pack/kubejs produces the hall', () => {
  const own = new Set(['startup_scripts/grindless/uxv/stellar_fractionation_hall.js', 'server_scripts/grindless/uxv/stellar_fractionation_hall.js', 'client_scripts/grindless/uxv_stellar_fractionation_hall_lang.js']);
  const hits = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== 'assets') walk(p); continue; }
      if (!e.name.endsWith('.js')) continue;
      const rel = path.relative(KJS, p).split(path.sep).join('/');
      if (own.has(rel)) continue;
      if (fs.readFileSync(p, 'utf8').includes('stellar_fractionation_hall')) hits.push(rel);
    }
  };
  for (const d of ['server_scripts', 'startup_scripts']) walk(path.join(KJS, d));
  assert.deepEqual(hits, []);
});

test('names, tooltips and the info page exist in en_us and es_es; the EMI page points at them', () => {
  const src = fs.readFileSync(path.join(KJS, 'client_scripts/grindless/uxv_stellar_fractionation_hall_lang.js'), 'utf8');
  const keys = ['block.gtceu.stellar_fractionation_hall', 0, 1, 2, 3].map((k) => (typeof k === 'number' ? 'grindless.machine.stellar_fractionation_hall.tooltip.' + k : k))
    .concat([0, 1, 2].map((i) => 'emi.grindless.info.stellar_fractionation_hall.' + i));
  for (const key of keys) assert.equal(src.split(`'${key}'`).length - 1, 1, key);
  // each entry is [key, en, es]: both strings exist and differ
  const entries = [...src.matchAll(/\['([^']+)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)'\]/g)];
  assert.equal(entries.length, keys.length);
  for (const [, k, en, es] of entries) assert.ok(en.length > 0 && es.length > 0 && en !== es, k);
  assert.ok(src.includes("['en_us', 'es_es']"));
  const info = JSON.parse(fs.readFileSync(path.join(KJS, 'assets/emi/recipe/additions/grindless/stellar_fractionation_hall.json'), 'utf8'));
  assert.deepEqual(info.stacks, ['item:gtceu:stellar_fractionation_hall']);
  assert.deepEqual(info.text, [0, 1, 2].map((i) => 'emi.grindless.info.stellar_fractionation_hall.' + i));
  for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active.png.mcmeta', 'overlay_front_active_emissive.png', 'overlay_front_active_emissive.png.mcmeta']) {
    assert.ok(fs.existsSync(path.join(KJS, 'assets/grindless/textures/block/multiblock/stellar_fractionation_hall', f)), f);
  }
});

test('the test zone is in its band, the bench test exists, and the two pendingUses of M2 are closed', () => {
  const zones = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/test/zones.json'), 'utf8'));
  const list = Array.isArray(zones) ? zones : zones.zones;
  const z = list.find((e) => e.id === 'uxv_stellar_fractionation_hall');
  assert.ok(z);
  assert.deepEqual(z.x, [37056, 37119]);
  assert.deepEqual(z.z, [0, 63]);
  assert.deepEqual(z.y, [98, 115]);
  assert.deepEqual(z.tests, ['uxv_stellar_fractionation_hall']);
  assert.ok(/Overworld/.test(z.note));
  assert.ok(fs.existsSync(path.join(ROOT, 'tools/test/overlay/kubejs/server_scripts/gg_test_uxv_stellar_fractionation_hall.js')));
  const cov = fs.readFileSync(path.join(ROOT, 'tools/analysis/emi_coverage.json'), 'utf8');
  JSON.parse(cov);
  assert.ok(!cov.includes('"UXV-M2"'));
});
