// LuV B5, the asteroid belt (startup_scripts/grindless/luv/asteroid_belt.js, server_scripts/grindless/luv/asteroid_belt.js): the patterns
// through the real helper, the recipes and their figures, the family veto, the site rule from the one places table, the no-voiding and
// sun gates, the belt's world gen, the un-hidden B5 ids, and every id pinned against the native registry.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const PACK = path.join(ROOT, 'pack');
const script = (kind, file) => fs.readFileSync(path.join(PACK, 'kubejs', kind, 'grindless', file), 'utf8');
const table = (name) => JSON.parse(fs.readFileSync(path.join(PACK, 'kubejs/data/grindless/tables', name + '.json'), 'utf8'));
const recipe = (id) => ({ id: { getNamespace: () => id.split(':')[0], getPath: () => id.split(':')[1] } });
const MACHINES = ['harpoon_anchor_drill', 'asteroid_processor', 'optical_miner'];

function harness() {
  const callbacks = [];
  const machines = new Map();
  const recipes = [];
  const customs = [];
  const shapeless = [];
  const layers = [];
  const veinsAdded = [];
  const serverRecipeHandlers = [];
  const oreHandlers = [];
  const logs = [];
  const log = (level) => (...m) => logs.push([level, m.join(' ')]);
  const G = {
    tables: {},
    readJsonTable: (p) => JSON.parse(fs.readFileSync(path.join(PACK, p), 'utf8')),
    parallelHatch: {
      part: () => ({ kind: 'part', ability: 'parallel_hatch', limits: { max: 1 } }),
      modifier: (next) => (m, r) => next(m, r),
      overclock: () => 'overclock',
      machines: [],
    },
    noVoiding: {
      modifier: (opts, next) => (m, r) => m.voids ? 'cancel:' + opts.reason : next(m, r),
      beforeWorking: () => (m) => !m.voids,
    },
    freshRun: { afterWorking: (name) => 'fresh:' + name },
    lv: {
      bores: (veto, cap) => (m, r) => veto(m, r) ? 'cancel' : 'bores:' + cap,
      rules: {
        recipeTier: (r) => {
          const tiers = ['ulv', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm'];
          let best = -1;
          r.id.getPath().split('/').slice(0, -1).forEach((p) => { best = Math.max(best, tiers.indexOf(p)); });
          return best < 0 ? '' : tiers[best];
        },
      },
      allVeins: () => [],
    },
    hv: {},
  };
  const dummy = new Proxy(() => dummy, { get: () => dummy });
  function builder(calls = []) {
    const b = new Proxy({}, { get: (_, method) => (...args) => { calls.push([method, ...args]); return b; } });
    return b;
  }
  const context = vm.createContext({
    global: { grindless: G },
    console: { info: log('info'), warn: log('warn'), error: log('error'), log: log('info') },
    GTCEuStartupEvents: { registry: (type, cb) => callbacks.push([type, cb]) },
    StartupEvents: { registry: (type, cb) => callbacks.push([type, cb]) },
    GTRecipeTypes: { get: () => ({ getMaxInputs: () => 2, setMaxSize: (...a) => G._widened = a, addDataInfo: (f) => { G._sunInfo = f; } }) },
    ModifierFunction: { NULL: 'cancel', cancel: (t) => 'cancel:' + t },
    GTRecipeModifiers: { OC_NON_PERFECT: { getModifier: () => 'overclock' } },
    GuiTextures: dummy, FillDirection: dummy, RotationState: dummy, GTSoundEntries: dummy,
    Text: { translate: (s) => { const t = { s, append: () => t, getString: () => s, toString: () => s }; return t; }, gray: (s) => s, darkGray: (s) => s, red: (s) => s },
    Block: { getBlock: (id) => id },
    Java: { loadClass: () => ({ IN: 'in', CAP: 'item' }) },
    Fluid: { of: (id, amount) => ({ id, amount }), exists: () => true },
    Item: { exists: () => true },
    GTMaterials: { get: (name) => ({ name, isNull: () => false }) },
    ServerEvents: { recipes: (cb) => serverRecipeHandlers.push(cb) },
    GTCEuServerEvents: { oreVeins: (cb) => oreHandlers.push(cb) },
  });
  vm.runInContext(script('startup_scripts', 'lib/patterns.js'), context);
  vm.runInContext(script('startup_scripts', 'lib/places.js'), context);
  vm.runInContext(script('server_scripts', 'data/veins.js'), context);
  // the family's real vein maths (oresOf, samplePairOf), without the LV recipes
  const lvSaved = G.lv;
  vm.runInContext(script('server_scripts', 'lv/vein_drilling.js'), context);
  G.lv.bores = lvSaved.bores;
  G.lv.rules = lvSaved.rules;
  G.lv.allVeins = () => [];
  serverRecipeHandlers.length = 0;
  vm.runInContext(script('startup_scripts', 'luv/asteroid_belt.js'), context);
  for (const [type, cb] of callbacks) {
    cb({
      create(id) {
        const calls = [];
        if (type === 'gtceu:machine') machines.set(id, calls);
        if (type === 'gtceu:world_gen_layer') layers.push({ id, calls });
        return builder(calls);
      },
    });
  }
  vm.runInContext(script('server_scripts', 'luv/asteroid_belt.js'), context);
  const gtceu = new Proxy({}, { get: (_, type) => (...args) => {
    const entry = { type, args, calls: [] };
    recipes.push(entry);
    return builder(entry.calls);
  } });
  const event = {
    recipes: { gtceu },
    custom: (json) => { const e = { json, calls: [] }; customs.push(e); return builder(e.calls); },
    shapeless: (out, ins) => { const e = { out, ins, calls: [] }; shapeless.push(e); return builder(e.calls); },
  };
  serverRecipeHandlers.forEach((cb) => cb(event));
  oreHandlers.forEach((cb) => cb({ add: (id, fn) => { const calls = []; fn(builder(calls)); veinsAdded.push({ id, calls }); } }));
  return { G, machines, recipes, customs, shapeless, layers, veinsAdded, logs };
}
const call = (r, method) => r.calls.filter((c) => c[0] === method).map((c) => c.slice(1));
const only = (r, method) => call(r, method)[0]?.[0];
const byId = (recipes, type, id) => recipes.find((r) => r.type === type && r.args[0] === id);

test('B5 patterns validate through the real helper, at most 16 high, with their casings, parts and the parallel hatch', () => {
  const { G, logs } = harness();
  assert.deepEqual(logs.filter((l) => l[0] === 'error'), []);
  const d = G.structures['gtceu:harpoon_anchor_drill'];
  assert.equal(d.slices.length, 7);
  assert.equal(d.slices[0].length, 8);
  const drillFlat = d.slices.flat().join('');
  assert.equal([...drillFlat].filter((c) => c === 'R').length, 29);
  assert.equal([...drillFlat].filter((c) => c === 'X').length, 23);
  assert.equal(d.symbols.R.blocks[0], 'grindless:asteroid_regolith_casing');
  assert.equal(d.symbols.W.blocks[0], 'grindless:whipple_shield_casing');
  assert.equal(d.symbols.H.materials[0], 'hsss');
  const p = G.structures['gtceu:asteroid_processor'];
  assert.ok(p.symbols.X.options.some((o) => o.ability === 'parallel_hatch'));
  assert.ok(p.symbols.X.options.some((o) => o.ability === 'input_hatch'));
  assert.equal(p.symbols.C.blocks[0], 'gtceu:steel_pipe_casing');
  assert.ok(G.parallelHatch.machines.includes('gtceu:asteroid_processor'));
  const m = G.structures['gtceu:optical_miner'];
  assert.equal([...m.slices.flat().join('')].filter((c) => c === 'M').length, 8);
  assert.equal(G.asteroidBelt.miner.mirrorCells.length, 8);
  assert.deepEqual({ ...G.asteroidBelt.miner.receiverCell }, { up: 1, back: 6, side: 0 });
  for (const s of [d, p, m]) {
    assert.ok(s.slices[0].length <= 16);
    assert.equal([...s.slices.at(-1).join('')].filter((c) => c === 'S').length, 1, 'the controller sits in the front slice');
  }
});

test('B5 drill: one harpoon recipe per belt vein, sample first, bit and harpoon wear, 11.25 ores, the belt only', () => {
  const { recipes, G, shapeless } = harness();
  const drills = recipes.filter((r) => r.type === 'vein_drilling');
  assert.deepEqual(drills.map((r) => r.args[0]), ['grindless:luv/harpoon_m_type_belt_hss_s', 'grindless:luv/harpoon_s_type_belt_hss_s',
    'grindless:luv/harpoon_c_type_belt_hss_s']);
  for (const r of drills) {
    assert.equal(r.calls[0][0], 'notConsumable');
    assert.match(r.calls[0][1], /^grindless:vein_sample_[msc]_type_belt$/);
    assert.deepEqual(call(r, 'chancedInput'), [['grindless:hss_s_drill_bit', 25, 0], ['grindless:anchor_harpoon', 100, 0]]);
    assert.deepEqual(call(r, 'dimension').flat(), ['grindless:asteroid_belt']);
    assert.equal(only(r, 'EUt'), 8);
    assert.equal(only(r, 'duration'), 200);
    const whole = call(r, 'itemOutputs').flat().slice(1).reduce((s, t) => s + Number(t.split('x ')[0]), 0);
    const chanced = call(r, 'chancedOutput').reduce((s, c) => s + c[1] / 10000, 0);
    assert.ok(Math.abs(whole + chanced - 11.25) < 1e-3, `${r.args[0]}: ${whole + chanced}`);
    assert.equal(call(r, 'itemOutputs')[0][0], '1x minecraft:tuff');
  }
  const m = drills[0];
  assert.deepEqual(call(m, 'itemOutputs').flat(), ['1x minecraft:tuff', '6x gtceu:raw_meteoric_iron', '3x gtceu:raw_tetrataenite',
    '1x gtceu:raw_pentlandite']);
  // the family's lookup rule: no other belt sample, and the vein drilling type takes three item inputs
  assert.deepEqual([...G._widened], ['in', 'item', 3]);
  assert.equal(shapeless.length, 3);
  assert.deepEqual([...shapeless[0].ins], ['grindless:empty_vein_probe', '#forge:raw_materials/meteoric_iron', '#forge:raw_materials/tetrataenite']);
});

test('B5 drill veto: only grindless vein_drilling/luv/harpoon_*; every lower drill already skips the luv folder', () => {
  const { machines } = harness();
  const mod = machines.get('harpoon_anchor_drill').find((c) => c[0] === 'recipeModifier');
  assert.equal(mod[2], true);
  assert.equal(mod[1]({}, recipe('grindless:vein_drilling/luv/harpoon_m_type_belt_hss_s')), 'bores:256');
  for (const id of ['grindless:vein_drilling/iv/mercury_iridosmine_mercury_tungsten_steel', 'grindless:vein_drilling/luv/cryobot_brine',
    'other:vein_drilling/luv/harpoon_x', 'grindless:vein_drilling/magnetite_steel']) {
    assert.equal(mod[1]({}, recipe(id)), 'cancel', id);
  }
  const lv = script('startup_scripts', 'lv/multis.js');
  assert.match(lv, /'iv', 'luv', 'zpm'/);
  assert.match(script('startup_scripts', 'steam/machines.js'), /rules\.recipeTier\(recipe\) !== ''/);
  assert.match(script('startup_scripts', 'iv/mercury.js'), /rules\.recipeTier\(recipe\) !== DRILL_TIER \|\| !isMercuryRecipe/);
});

test('B5 asteroid processor: Mond on crushed and dust with a CO charge never used up, the magnetic split; the concentrate is kept', () => {
  const { recipes, machines } = harness();
  const mondC = byId(recipes, 'asteroid_processing', 'grindless:mond_crushed');
  const mondD = byId(recipes, 'asteroid_processing', 'grindless:mond_dust');
  const split = byId(recipes, 'asteroid_processing', 'grindless:magnetic_split');
  assert.equal(only(mondC, 'circuit'), 1);
  assert.equal(only(split, 'circuit'), 2);
  assert.equal(only(mondD, 'circuit'), 3);
  assert.equal(only(mondC, 'itemInputs'), '16x gtceu:crushed_meteoric_iron_ore');
  assert.equal(only(mondD, 'itemInputs'), '16x gtceu:meteoric_iron_dust');
  for (const r of [mondC, mondD]) {
    assert.deepEqual({ ...only(r, 'notConsumableFluid') }, { id: 'gtceu:carbon_monoxide', amount: 1000 });
    assert.deepEqual(call(r, 'itemOutputs').flat(), ['24x gtceu:iron_dust', '4x gtceu:nickel_dust', '1x gtceu:cobalt_dust',
      '1x grindless:asteroid_pgm_concentrate']);
    assert.equal(only(r, 'EUt'), 1920);
    assert.equal(only(r, 'duration'), 400);
    assert.equal(call(r, 'dimension').length, 0, 'the processor works anywhere');
  }
  assert.equal(only(split, 'itemInputs'), '16x gtceu:crushed_tetrataenite_ore');
  assert.deepEqual(call(split, 'itemOutputs').flat(), ['12x gtceu:tetrataenite_dust', '4x gtceu:meteoric_iron_dust']);
  const calls = machines.get('asteroid_processor');
  const mod = calls.find((c) => c[0] === 'recipeModifier');
  const start = calls.find((c) => c[0] === 'beforeWorking')[1];
  assert.equal(mod[2], true);
  const voids = { voids: true };
  assert.match(mod[1](voids, recipe('grindless:asteroid_processing/mond_crushed')), /^cancel:grindless\.machine\.asteroid_processor\.no_voiding/);
  assert.match(mod[1](voids, recipe('grindless:asteroid_processing/mond_dust')), /^cancel/);
  assert.equal(mod[1](voids, recipe('grindless:asteroid_processing/magnetic_split')), 'overclock');
  assert.equal(start(voids, recipe('grindless:asteroid_processing/mond_crushed')), false);
  assert.equal(start(voids, recipe('grindless:asteroid_processing/magnetic_split')), true);
  assert.equal(start({ voids: false }, recipe('grindless:asteroid_processing/mond_crushed')), true);
});

test('B5 optical miner: the boulder needs the sun at run start, Boudouard does not; both on the belt and kept; fresh every run', () => {
  const { recipes, machines, G } = harness();
  const boulder = byId(recipes, 'optical_mining', 'grindless:c_type_boulder');
  const boud = byId(recipes, 'optical_mining', 'grindless:boudouard');
  assert.equal(only(boulder, 'circuit'), 1);
  assert.deepEqual(call(boulder, 'chancedInput'), [['grindless:capture_bag', 500, 0]]);
  assert.deepEqual(call(boulder, 'itemOutputs')[0], ['2x gtceu:carbon_dust', '1x grindless:chondritic_extract']);
  assert.deepEqual(JSON.parse(JSON.stringify(call(boulder, 'outputFluids')[0])), [{ id: 'minecraft:water', amount: 4000 },
    { id: 'gtceu:carbon_dioxide', amount: 1000 }]);
  assert.equal(only(boulder, 'EUt'), 1920);
  assert.equal(only(boulder, 'duration'), 1200);
  assert.equal(only(boud, 'circuit'), 2);
  assert.equal(only(boud, 'itemInputs'), '1x gtceu:carbon_dust');
  assert.deepEqual({ ...only(boud, 'inputFluids') }, { id: 'gtceu:carbon_dioxide', amount: 1000 });
  assert.deepEqual({ ...only(boud, 'outputFluids') }, { id: 'gtceu:carbon_monoxide', amount: 2000 });
  assert.equal(only(boud, 'EUt'), 480);
  for (const r of [boulder, boud]) assert.deepEqual(call(r, 'dimension').flat(), ['grindless:asteroid_belt']);
  assert.deepEqual(call(boulder, 'addDataString')[0], ['grindless_optical_sun', 'boulder']);
  assert.equal(G.asteroidBelt.miner.needsSun(recipe('grindless:optical_mining/c_type_boulder')), true);
  assert.equal(G.asteroidBelt.miner.needsSun(recipe('grindless:optical_mining/boudouard')), false);
  const calls = machines.get('optical_miner');
  assert.equal(calls.find((c) => c[0] === 'afterWorking')[1], 'fresh:optical_miner');
  const mod = calls.find((c) => c[0] === 'recipeModifier');
  assert.equal(mod[2], true);
  const night = { voids: false, getLevel: () => ({ isNight: () => true }) };
  assert.equal(mod[1](night, recipe('grindless:optical_mining/c_type_boulder')), 'cancel:grindless.machine.optical_miner.no_sun');
  assert.equal(mod[1](night, recipe('grindless:optical_mining/boudouard')), 'overclock');
  assert.match(mod[1]({ voids: true }, recipe('grindless:optical_mining/boudouard')), /^cancel:grindless\.machine\.optical_miner\.no_voiding/);
  assert.equal(calls.find((c) => c[0] === 'beforeWorking')[1]({ voids: true }), false);
  assert.equal(G._sunInfo === undefined, false);
});

test('B5 parts, the belt-only casing and seed, the AE2 pair and the controllers', () => {
  const { recipes, customs } = harness();
  assert.equal(only(byId(recipes, 'lathe', 'grindless:hss_s_drill_bit'), 'itemInputs'), 'gtceu:long_hsss_rod');
  assert.deepEqual(call(byId(recipes, 'assembler', 'grindless:anchor_harpoon'), 'itemInputs')[0], ['2x gtceu:hsss_rod', '1x gtceu:tungsten_carbide_plate']);
  assert.deepEqual(call(byId(recipes, 'assembler', 'grindless:capture_bag'), 'itemInputs')[0],
    ['8x gcyr:para_aramid_foil', '4x gcyr:kapton_k_plate', '2x gtceu:titanium_rod']);
  const casing = byId(recipes, 'alloy_smelter', 'grindless:asteroid_regolith_casing');
  assert.deepEqual(call(casing, 'itemInputs')[0], ['4x minecraft:tuff', '1x gtceu:titanium_dust']);
  assert.deepEqual(call(casing, 'dimension').flat(), ['grindless:asteroid_belt']);
  const seed = byId(recipes, 'chemical_reactor', 'grindless:asteroid_quantum_seed');
  assert.deepEqual(call(seed, 'itemInputs')[0], ['gtceu:raw_meteoric_iron', '#forge:ender_pearls']);
  assert.deepEqual({ ...only(seed, 'inputFluids') }, { id: 'gtceu:helium_3', amount: 250 });
  assert.deepEqual(call(seed, 'dimension').flat(), ['grindless:asteroid_belt']);
  assert.equal(only(seed, 'EUt'), 480);
  assert.equal(customs.length, 1);
  assert.equal(customs[0].json.result.nbt.grindless_planet, 'belt');
  assert.equal(only(customs[0], 'id'), 'grindless:transform/asteroid_entangled_singularity');
  const controllers = recipes.filter((r) => r.type === 'shaped');
  assert.deepEqual(controllers.map((r) => r.args[0]), MACHINES.map((n) => 'gtceu:' + n));
  for (const r of controllers) {
    const [, pattern, keys] = r.args;
    assert.equal(pattern.join('').split('C').length - 1, 4);
    assert.equal(keys.C, '#gtceu:circuits/luv');
    assert.equal(keys.H, 'gtceu:luv_machine_hull');
  }
});

test('B5 dimension ids live in one table: places.json for the surface, planets.json agrees with places and orbits', () => {
  const places = table('places').surfaces;
  const planets = table('planets').planets;
  const orbits = table('orbits').dimensions;
  assert.equal(places.asteroid_belt, 'grindless:asteroid_belt');
  assert.deepEqual(planets.belt.dimensions, [places.asteroid_belt, 'grindless:asteroid_belt_orbit']);
  assert.ok(orbits.includes(planets.belt.dimensions[1]));
  assert.equal(planets.belt.pairTag, 'belt');
  for (const kind of ['startup_scripts', 'server_scripts']) {
    assert.doesNotMatch(script(kind, 'luv/asteroid_belt.js'), /'grindless:asteroid_belt'/, 'no hard-coded belt id in ' + kind);
  }
  assert.equal(table('sunlight').dimensions[places.asteroid_belt].factor, 0.19);
});

test('B5 world gen: a tuff layer on the belt only, three veins in it, materials only the belt has', () => {
  const { layers, veinsAdded } = harness();
  assert.equal(layers.length, 1);
  assert.equal(layers[0].id, 'grindless:asteroid_belt');
  assert.deepEqual(call(layers[0], 'targets').flat(), ['minecraft:tuff']);
  assert.deepEqual(call(layers[0], 'dimensions').flat(), ['grindless:asteroid_belt']);
  assert.deepEqual(veinsAdded.map((v) => v.id), ['grindless:m_type_vein_belt', 'grindless:s_type_vein_belt', 'grindless:c_type_vein_belt']);
  for (const v of veinsAdded) {
    assert.deepEqual(call(v, 'layer').flat(), ['asteroid_belt']);
    assert.deepEqual(call(v, 'dimensions').flat(), ['grindless:asteroid_belt']);
  }
  // meteoric iron and tetrataenite are in no other vein table: the concentrate and the bearings come only from the belt
  const dir = path.join(PACK, 'kubejs/data/grindless/tables');
  for (const f of fs.readdirSync(dir).filter((n) => /^veins.*\.json$/.test(n) && n !== 'veins_belt.json')) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    assert.doesNotMatch(text, /"(meteoric_iron|tetrataenite)"/, f);
  }
  // the S and C sample pairs are free: no other vein's two most common ores are the same pair
  const topPair = (v) => [...v.materials].sort((a, b) => b.weight - a.weight).slice(0, 2).map((m) => m.id).sort().join('+');
  const belt = new Set(table('veins_belt').veins.map(topPair));
  for (const f of fs.readdirSync(dir).filter((n) => /^veins.*\.json$/.test(n) && n !== 'veins_belt.json' && n !== 'veins_excluded.json')) {
    for (const v of table(f.slice(0, -5)).veins || []) if (v.materials) assert.ok(!belt.has(topPair(v)), `${f}: ${v.id}`);
  }
});

test('B5 un-hides its ids: no B5 rule or group is left, the bearing keeps its structure page, the extract waits for B8', () => {
  const obtain = fs.readFileSync(path.join(ROOT, 'tools/analysis/tiers/obtain.json'), 'utf8');
  assert.doesNotMatch(obtain, /LuV \(B5\)/);
  assert.doesNotMatch(obtain, /asteroid_quantum_seed/);
  const groups = table('hidden_until').groups.map((g) => g.material);
  for (const m of ['meteoric_iron', 'tetrataenite', 'grindless:hss_s_drill_bit', 'grindless:anchor_harpoon', 'grindless:asteroid_pgm_concentrate',
    'grindless:capture_bag', 'grindless:chondritic_extract', 'grindless:asteroid_regolith_casing', 'grindless:asteroid_quantum_seed']) {
    assert.ok(!groups.includes(m), m);
  }
  const pages = path.join(PACK, 'kubejs/assets/emi/recipe/additions/grindless');
  for (const page of ['asteroid_regolith_casing', 'magnetic_bearing']) assert.ok(fs.existsSync(path.join(pages, page + '.json')), page);
  const cov = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/analysis/emi_coverage.json'), 'utf8'));
  assert.ok(cov.exceptions.some((e) => e.id === 'grindless:chondritic_extract' && /B8/.test(e.reason)));
});

test('B5 language parity, every key the scripts use, and the three controller overlays', () => {
  const languages = {};
  for (const file of ['luv_asteroid_belt_lang.js']) {
    vm.runInNewContext(script('client_scripts', file), {
      ClientEvents: { lang(lang, cb) { languages[lang] = languages[lang] || {}; cb({ add: (_, key, value) => { languages[lang][key] = value; } }); } },
    });
  }
  assert.deepEqual(Object.keys(languages.en_us).sort(), Object.keys(languages.es_es).sort());
  const used = new Set();
  for (const kind of ['startup_scripts', 'server_scripts']) {
    for (const [, key] of script(kind, 'luv/asteroid_belt.js').matchAll(/'((?:grindless\.machine|tooltip\.grindless\.vein_sample)\.[a-z_.]+[a-z0-9_])'/g)) used.add(key);
  }
  for (const n of MACHINES) for (let i = 0; i < 3; i++) used.add(`grindless.machine.${n}.tooltip.${i}`);
  for (const s of ['sun', 'night', 'shaded']) used.add('grindless.machine.optical_miner.sun.' + s);
  for (const v of table('veins_belt').veins) used.add('item.grindless.vein_sample_' + v.id);
  used.add('gtceu.recipe.grindless_optical_sun.boulder');
  // contains and depth are the vein samples' shared lines (iv_foundation_lang.js)
  for (const key of used) if (!/\.(contains|depth)$|parallel_hatch/.test(key)) assert.ok(languages.en_us[key], key);
  for (const name of MACHINES) {
    assert.ok(languages.en_us['block.gtceu.' + name]);
    for (const file of ['overlay_front.png', 'overlay_front_active.png']) {
      const bytes = fs.readFileSync(path.join(PACK, 'kubejs/assets/grindless/textures/block/multiblock', name, file));
      assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
      assert.equal(bytes.readUInt32BE(16), 16);
    }
  }
});

test('B5 ids that are not ours match the pinned native registry (power-quests-1 items.json), not naming guesses', () => {
  // Frozen B5 subset of power-quests-1/results/server/kubejs-exported/items.json (gg-items-1). A1's materials (meteoric iron,
  // tetrataenite) postdate that dump: their forms follow GTM's prefixes, pinned in A1's own test (luv-foundation.test.mjs).
  const nativeItems = new Set([
    'minecraft:tuff', 'minecraft:ender_pearl', 'gtceu:raw_pentlandite', 'gtceu:raw_olivine', 'gtceu:raw_chromite', 'gtceu:raw_magnetite',
    'gtceu:raw_graphite', 'gtceu:tuff_olivine_ore', 'gtceu:tuff_chromite_ore', 'gtceu:tuff_magnetite_ore', 'gtceu:tuff_graphite_ore',
    'gtceu:tuff_pentlandite_ore', 'gtceu:iron_dust', 'gtceu:nickel_dust', 'gtceu:cobalt_dust', 'gtceu:carbon_dust',
    'gtceu:long_hsss_rod', 'gtceu:hsss_rod', 'gtceu:hsss_frame', 'gtceu:tungsten_carbide_plate', 'gtceu:titanium_rod',
    'gtceu:titanium_dust', 'gtceu:titanium_frame', 'gcyr:para_aramid_foil', 'gcyr:kapton_k_plate', 'gtceu:luv_machine_hull',
    'gtceu:luv_electric_motor', 'gtceu:luv_electric_piston', 'gtceu:luv_electric_pump', 'gtceu:luv_robot_arm', 'gtceu:luv_sensor',
    'gtceu:solid_machine_casing', 'gtceu:steel_pipe_casing', 'gtceu:tungstensteel_pipe_casing', 'gtceu:laminated_glass',
    'gtceu:robust_machine_casing', 'gtceu:frostproof_machine_casing', 'grindless:empty_vein_probe', 'ae2:singularity',
    'ae2:quantum_entangled_singularity',
  ]);
  const nativeFluids = new Set(['minecraft:water', 'gtceu:carbon_dioxide', 'gtceu:carbon_monoxide', 'gtceu:helium_3']);
  const ours = /^(grindless:|gtceu:(raw_|crushed_|tuff_)?(meteoric_iron|tetrataenite)|gtceu:(meteoric_iron|tetrataenite)_dust)/;
  const checkItem = (text) => {
    const id = String(text).replace(/^\d+x /, '');
    if (id.startsWith('#') || ours.test(id)) return;
    assert.ok(nativeItems.has(id), `not a pinned native item: ${id}`);
  };
  const { G, recipes, customs, shapeless } = harness();
  for (const r of recipes) {
    for (const method of ['itemInputs', 'itemOutputs', 'notConsumable', 'chancedInput', 'chancedOutput']) {
      for (const args of call(r, method)) for (const a of method.startsWith('chanced') ? [args[0]] : args.flat()) checkItem(a);
    }
    for (const method of ['inputFluids', 'outputFluids', 'notConsumableFluid']) {
      for (const fluid of call(r, method).flat()) assert.ok(nativeFluids.has(fluid.id), fluid.id);
    }
    if (r.type === 'shaped') for (const ingredient of Object.values(r.args[2])) checkItem(ingredient);
  }
  for (const c of customs) for (const i of c.json.ingredients) checkItem(i.item);
  for (const s of shapeless) s.ins.forEach(checkItem);
  function checkSymbol(symbol) {
    if (symbol.options) symbol.options.forEach(checkSymbol);
    if (symbol.blocks) symbol.blocks.forEach(checkItem);
    if (symbol.materials) symbol.materials.forEach((m) => checkItem('gtceu:' + m + '_frame'));
  }
  for (const n of MACHINES) Object.values(G.structures['gtceu:' + n].symbols).forEach(checkSymbol);
  for (const v of table('veins_belt').veins) {
    checkItem(v.stone);
    for (const m of v.materials) checkItem('gtceu:tuff_' + m.id + '_ore');
  }
  // the A1 ids B5 uses are A1's registrations
  const a1 = script('startup_scripts', 'luv/foundation.js');
  for (const name of ['hss_s_drill_bit', 'anchor_harpoon', 'asteroid_pgm_concentrate', 'capture_bag', 'chondritic_extract',
    'asteroid_quantum_seed', 'asteroid_regolith_casing', 'whipple_shield_casing']) assert.match(a1, new RegExp(`\\b${name}:`));
});
