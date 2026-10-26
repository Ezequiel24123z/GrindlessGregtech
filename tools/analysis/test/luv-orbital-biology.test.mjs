import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const script = (kind, file) => fs.readFileSync(path.join(ROOT, 'pack/kubejs', kind, 'grindless', file), 'utf8');
const names = ['zero_g_crystal_grower', 'hydroponic_ring', 'organoid_lab'];
const recipe = (id) => ({
  id: { getNamespace: () => id.split(':')[0], getPath: () => id.split(':')[1] },
});

function harness() {
  const callbacks = [];
  const machines = new Map();
  const recipes = [];
  const cleanroom = { CLEANROOM: 'native-cleanroom' };
  const G = {
    parallelHatch: {
      part: () => ({ kind: 'part', ability: 'parallel_hatch', limits: { max: 1 } }),
      modifier: (next) => (m, r) => next(m, r),
      overclock: () => 'overclock',
    },
    noVoiding: {
      modifier: (opts, next) => (m, r) => m.voids ? 'cancel' : next(m, r),
      beforeWorking: () => (m) => !m.voids,
    },
    orbits: {
      dimensions: ['test:orbit_a', 'test:orbit_b'],
      allow(r) { for (const dim of this.dimensions) r.dimension(dim); return r; },
    },
  };
  const dummy = new Proxy(() => dummy, { get: () => dummy });
  function builder(calls = []) {
    const b = new Proxy({}, { get: (_, method) => (...args) => { calls.push([method, ...args]); return b; } });
    return b;
  }
  const context = vm.createContext({
    global: { grindless: G }, console,
    GTCEuStartupEvents: { registry: (type, cb) => callbacks.push([type, cb]) },
    GTRecipeTypes: { get: () => builder() },
    ModifierFunction: { NULL: 'cancel' }, GuiTextures: dummy, FillDirection: dummy,
    RotationState: dummy, Text: { translate: (s) => s },
    Java: { loadClass: (id) => { assert.equal(id, 'com.gregtechceu.gtceu.api.machine.multiblock.CleanroomType'); return cleanroom; } },
    Fluid: { of: (id, amount) => ({ id, amount }) },
    ServerEvents: { recipes(cb) {
      const gtceu = new Proxy({}, { get: (_, type) => (...args) => {
        const entry = { type, args, calls: [] };
        recipes.push(entry);
        return builder(entry.calls);
      } });
      cb({ recipes: { gtceu } });
    } },
  });
  vm.runInContext(script('startup_scripts', 'lib/patterns.js'), context);
  vm.runInContext(script('startup_scripts', 'luv/orbital_biology.js'), context);
  for (const [type, cb] of callbacks) cb({ create(id) {
    const calls = [];
    if (type === 'gtceu:machine') machines.set(id, calls);
    return builder(calls);
  } });
  vm.runInContext(script('server_scripts', 'luv/orbital_biology.js'), context);
  return { G, context, machines, recipes };
}
const call = (r, method) => r.calls.filter((c) => c[0] === method).map((c) => c.slice(1));
const only = (r, method) => call(r, method)[0]?.[0];

test('B4 patterns validate through the real helper, include parts, distinctive cores and four real bearings', () => {
  const { G } = harness();
  for (let i = 0; i < names.length; i++) {
    const d = G.structures['gtceu:' + names[i]];
    assert.equal(d.slices.length, i === 1 ? 15 : 5);
    assert.equal(d.slices[0].length, i === 1 ? 3 : 5);
    assert.equal(d.slices[0][0].length, i === 1 ? 15 : 5);
    const parts = d.symbols.X.options;
    assert.ok(parts.some((p) => p.ability === 'parallel_hatch'));
    assert.ok(parts.some((p) => p.ability === 'energy_input' && p.limits.max === 2));
    assert.equal(parts.some((p) => p.ability === 'maintenance' && p.limits.exact === 1), i !== 1);
  }
  const ring = G.structures['gtceu:hydroponic_ring'];
  const flat = ring.slices.flat().join('');
  assert.equal([...flat].filter((x) => x === 'B').length, 4);
  assert.equal(ring.symbols.B.blocks[0], 'grindless:magnetic_bearing');
  assert.equal(ring.symbols.D.blocks[0], 'minecraft:dirt');
  assert.equal(ring.symbols.G.blocks[0], 'gtceu:tempered_glass');
  assert.equal(ring.symbols.F.materials[0], 'titanium');
  assert.ok(flat.includes('#'));
  const lab = G.structures['gtceu:organoid_lab'];
  assert.equal([...lab.slices.flat().join('')].filter((x) => x === 'F').length, 4);
  assert.equal(lab.symbols.L.blocks[0], 'gtceu:laminated_glass');
  assert.equal(lab.symbols.C.blocks[0], 'gtceu:cleanroom_glass');
});

test('B4 exact crystals, cleanrooms, dose, certainty, circuits and shared orbital allowlist', () => {
  const { recipes, G } = harness();
  const crystals = recipes.filter((r) => r.type === 'microgravity_crystal_growth');
  assert.equal(crystals.length, 6);
  crystals.forEach((r, i) => {
    assert.equal(only(r, 'circuit'), i + 1);
    assert.equal(only(r, 'cleanroom'), 'native-cleanroom');
    assert.deepEqual(call(r, 'dimension').flat(), G.orbits.dimensions);
    assert.equal(only(r, 'duration'), i === 5 ? 6000 : 3000);
    assert.equal(only(r, 'EUt'), [320, 320, 480, 480, 480, 7680][i]);
    assert.equal(call(r, 'chancedOutput').length, 0);
    assert.equal(only(r, 'itemOutputs'), i === 5 ? 'grindless:sapphire_test_mass' : 'gtceu:raw_crystal_chip');
    if (i < 5) {
      assert.equal(only(r, 'inputFluids').amount, i < 3 ? 16 : 250);
      assert.equal(only(r, 'inputFluids').id, ['gtceu:europium', 'gtceu:europium', 'gtceu:europium',
        'gtceu:bacterial_sludge', 'gtceu:mutagen'][i]);
      assert.equal(only(r, 'itemInputs'), ['gtceu:exquisite_olivine_gem', 'gtceu:exquisite_emerald_gem',
        'gtceu:raw_crystal_chip_parts', 'gtceu:raw_crystal_chip_parts', 'gtceu:raw_crystal_chip_parts'][i]);
    }
  });
  assert.deepEqual(call(crystals[5], 'itemInputs')[0], ['64x gtceu:sapphire_dust', 'gtceu:exquisite_sapphire_gem']);
});

test('B4 molecular farming is exclusively c5/c6, retained seeds and two useful fluid outputs', () => {
  const { recipes, G, machines } = harness();
  const ring = recipes.filter((r) => r.type === 'greenhouse');
  assert.equal(ring.length, 2);
  ring.forEach((r, i) => {
    assert.equal(only(r, 'circuit'), i + 5);
    assert.equal(only(r, 'notConsumable'), 'grindless:engineered_' + (i ? 'tobacco' : 'barley') + '_seed');
    assert.equal(only(r, 'EUt'), 480);
    assert.equal(only(r, 'duration'), 1200);
    assert.equal(only(r, 'itemOutputs'), i ? '2x gtceu:collagen_dust' : 'grindless:neurotrophic_factor');
    assert.deepEqual(JSON.parse(JSON.stringify(call(r, 'inputFluids')[0])),
      [{ id: 'minecraft:water', amount: 1000 }, { id: 'gtceu:carbon_dioxide', amount: 500 }]);
    assert.deepEqual(JSON.parse(JSON.stringify(call(r, 'outputFluids')[0])),
      [{ id: 'gtceu:biomass', amount: 250 }, { id: 'gtceu:oxygen', amount: 200 }]);
    assert.equal(G.orbitalBiology.isRingRecipe(recipe('grindless:greenhouse/luv/' + r.args[0].split('/').at(-1))), true);
  });
  const mod = machines.get('hydroponic_ring').find((c) => c[0] === 'recipeModifier');
  assert.equal(mod[2], true);
  for (const id of ['grindless:greenhouse/carrot', 'grindless:greenhouse/ev/carrot_sealed_moon',
    'other:greenhouse/luv/neurotrophic_factor', 'grindless:greenhouse/luv/unreviewed_crop']) {
    assert.equal(mod[1]({}, recipe(id)), 'cancel');
  }
  assert.equal(mod[1]({}, recipe('grindless:greenhouse/luv/neurotrophic_factor')), 'overclock');
  for (const name of ['hydroponic_ring', 'organoid_lab']) {
    const calls = machines.get(name);
    assert.equal(calls.find((c) => c[0] === 'recipeModifier')[1]({ voids: true }, recipe('grindless:greenhouse/luv/plant_collagen')), 'cancel');
    assert.equal(calls.find((c) => c[0] === 'beforeWorking')[1]({ voids: true }), false);
    assert.equal(calls.find((c) => c[0] === 'beforeWorking')[1]({ voids: false }), true);
  }
});

test('B4 older family tier vetoes already reject LuV without changing existing greenhouse behavior', () => {
  const { G, context } = harness();
  vm.runInContext(script('startup_scripts', 'lv/multis.js'), context);
  const r = recipe('grindless:greenhouse/luv/neurotrophic_factor');
  for (const tier of ['lv', 'mv', 'hv', 'ev']) assert.equal(G.lv.rules.isAboveTier(r, tier), true);
  assert.equal(G.lv.rules.isAboveTier(recipe('grindless:greenhouse/carrot'), 'lv'), false);
  const steam = script('startup_scripts', 'steam/machines.js');
  assert.match(steam, /rules\.recipeTier\(recipe\) !== ''/);
  const dome = script('startup_scripts', 'ev/sealed_dome.js');
  assert.match(dome, /iv\|luv\|zpm/);
});

test('B4 NPU preserves GTM materials and 48 M EU at LuV; all controllers have exact components', () => {
  const { recipes } = harness();
  const lab = recipes.filter((r) => r.type === 'organoid_assembly');
  assert.equal(lab.length, 2);
  assert.deepEqual(call(lab[0], 'itemInputs')[0], ['16x gtceu:stem_cells', 'grindless:neurotrophic_factor']);
  assert.deepEqual(call(lab[1], 'itemInputs')[0], ['gtceu:wetware_printed_circuit_board', 'grindless:neural_organoid',
    '8x gtceu:polybenzimidazole_small_fluid_pipe', '8x gtceu:electrum_plate',
    '16x gtceu:silicone_rubber_foil', '8x gtceu:hsse_bolt']);
  lab.forEach((r, i) => {
    assert.equal(only(r, 'cleanroom'), 'native-cleanroom');
    assert.equal(only(r, 'inputFluids').id, 'gtceu:sterilized_growth_medium');
    assert.equal(only(r, 'inputFluids').amount, 250);
    assert.equal(only(r, 'EUt'), 30720);
    assert.equal(only(r, 'duration'), i ? 1563 : 600);
    assert.equal(only(r, 'itemOutputs'), i ? 'gtceu:neuro_processing_unit' : 'grindless:neural_organoid');
  });
  assert.equal(30720 * 1563, 48015360);
  const controllers = recipes.filter((r) => r.type === 'shaped');
  assert.equal(controllers.length, 3);
  controllers.forEach((r, i) => {
    assert.equal(r.args[0], 'gtceu:' + names[i]);
    const [, pattern, keys] = r.args;
    assert.equal(pattern.join('').split('C').length - 1, 4);
    assert.equal(pattern.join('').split('P').length - 1, 2);
    assert.equal(keys.H, 'gtceu:luv_machine_hull');
    assert.equal(keys.C, '#gtceu:circuits/luv');
    assert.equal(only(r, 'id'), 'grindless:crafting/' + names[i]);
  });
});

test('B4 language parity and all three distinctive controller overlays exist', () => {
  const languages = {};
  vm.runInNewContext(script('client_scripts', 'luv_orbital_biology_lang.js'), {
    ClientEvents: { lang(lang, cb) { languages[lang] = {}; cb({ add: (_, key, value) => { languages[lang][key] = value; } }); } },
  });
  assert.deepEqual(Object.keys(languages.en_us).sort(), Object.keys(languages.es_es).sort());
  for (const name of names) {
    assert.ok(languages.en_us['block.gtceu.' + name]);
    for (const file of ['overlay_front.png', 'overlay_front_active.png']) {
      const bytes = fs.readFileSync(path.join(ROOT, 'pack/kubejs/assets/grindless/textures/block/multiblock', name, file));
      assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
      assert.equal(bytes.readUInt32BE(16), 16);
      assert.equal(bytes.readUInt32BE(20), 16);
    }
  }
});

test('B4 native fixture compiles, cannot overlap other bands and retains every owned-cell cleanup boundary', () => {
  const file = path.join(ROOT, 'tools/test/overlay/kubejs/server_scripts/gg_test_luv_orbital_biology.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.doesNotThrow(() => new vm.Script(src));
  assert.match(src, /S\.tick > 2900/);
  assert.match(src, /Date\.now\(\) - S\.started > 150000/);
  assert.match(src, /refusing to overwrite unowned block/);
  assert.match(src, /S\.blocks\.slice\(\)\.reverse\(\)/);
  assert.match(src, /S\.tickets\.forEach/);
  // The orbit also holds a second, already clean organoid lab for the NPU (native S2: the two organoid
  // recipes in series outlasted the fixture deadline in the integrated run).
  assert.match(src, /key: 'organoid_lab_orbit_npu', next: 1, last: 1/);
  assert.match(src, /p: \{ x: 16648, y: world\.y, z: 20 \}/);
  const { G } = harness();
  for (const baseY of [102, 202]) {
    const used = new Set();
    const placed = names.map((name, index) => ({ name, x: 16648 + index * 24, z: 2 }));
    if (baseY === 202) placed.push({ name: 'organoid_lab', x: 16648, z: 20 });
    for (const { name, x: px, z: pz } of placed) {
      const d = G.structures['gtceu:' + name];
      let anchor;
      d.slices.forEach((rows, z) => rows.forEach((row, y) => {
        const x = row.indexOf('S');
        if (x >= 0) anchor = { x, y, z };
      }));
      d.slices.forEach((rows, z) => rows.forEach((row, y) => [...row].forEach((ch, x) => {
        const pos = [px - x + anchor.x, baseY + y - anchor.y, pz - z + anchor.z];
        assert.ok(pos[0] >= 16640 && pos[0] <= 16703);
        assert.ok(pos[1] >= baseY - 4 && pos[1] <= baseY + 10);
        assert.ok(pos[2] >= 0 && pos[2] <= 31);
        const key = pos.join(',');
        assert.ok(!used.has(key), `${key} overlaps another B4 machine`);
        used.add(key);
      })));
    }
  }
  const startup = script('startup_scripts', 'luv/orbital_biology.js');
  assert.match(startup, /priority: -10/);
  assert.match(startup, /get\('greenhouse'\)\.setMaxIOSize\(3, 6, 2, 2\)/);
  assert.match(startup, /grindless:block\/luv\/station_truss_casing/);
});

test('B4 preexisting item/fluid IDs match the pinned native registry, not naming guesses in recipe mocks', () => {
  // Frozen B4 subset of power-quests-1/results/server/kubejs-exported/items.json (gg-items-1).
  // Its recipes.json resolves gtceu:circuit_assembler/neuro_processor to the PBI pipe below,
  // and all three gtceu:autoclave/raw_crystal_chip_from_part_* recipes to raw_crystal_chip_parts.
  const nativeItems = new Set([
    'gtceu:exquisite_olivine_gem', 'gtceu:exquisite_emerald_gem', 'gtceu:exquisite_sapphire_gem',
    'gtceu:raw_crystal_chip_parts', 'gtceu:raw_crystal_chip', 'gtceu:sapphire_dust',
    'gtceu:collagen_dust', 'gtceu:stem_cells', 'gtceu:wetware_printed_circuit_board',
    'gtceu:polybenzimidazole_small_fluid_pipe', 'gtceu:electrum_plate',
    'gtceu:silicone_rubber_foil', 'gtceu:hsse_bolt', 'gtceu:neuro_processing_unit',
    'gtceu:luv_electric_pump', 'gtceu:luv_sensor', 'gtceu:luv_electric_motor',
    'gtceu:luv_robot_arm', 'gtceu:luv_machine_hull', 'gtceu:inert_machine_casing',
    'gtceu:laminated_glass', 'gtceu:tempered_glass', 'gtceu:plascrete',
    'gtceu:cleanroom_glass', 'gtceu:filter_casing', 'gtceu:titanium_frame',
    'gtceu:luv_energy_input_hatch', 'gtceu:luv_input_bus', 'gtceu:luv_output_bus',
    'gtceu:luv_input_hatch', 'gtceu:luv_output_hatch',
    'gtceu:cleaning_maintenance_hatch', 'gtceu:auto_maintenance_hatch',
  ]);
  const nativeFluids = new Set(['minecraft:water', 'gtceu:europium', 'gtceu:bacterial_sludge',
    'gtceu:mutagen', 'gtceu:carbon_dioxide', 'gtceu:biomass', 'gtceu:oxygen',
    'gtceu:sterilized_growth_medium']);
  const checkItem = (text) => {
    const id = text.replace(/^\d+x /, '');
    if (id.startsWith('gtceu:')) assert.ok(nativeItems.has(id), `not a pinned native item: ${id}`);
  };
  const { G, recipes } = harness();
  for (const r of recipes) {
    for (const method of ['itemInputs', 'itemOutputs', 'notConsumable']) {
      for (const text of call(r, method).flat()) checkItem(text);
    }
    for (const method of ['inputFluids', 'outputFluids']) {
      for (const fluid of call(r, method).flat()) assert.ok(nativeFluids.has(fluid.id), fluid.id);
    }
    if (r.type === 'shaped') for (const ingredient of Object.values(r.args[2])) checkItem(ingredient);
  }
  function checkSymbol(symbol) {
    if (symbol.options) symbol.options.forEach(checkSymbol);
    if (symbol.blocks) symbol.blocks.forEach(checkItem);
    if (symbol.materials) symbol.materials.forEach((m) => checkItem('gtceu:' + m + '_frame'));
  }
  for (const structure of Object.values(G.structures)) Object.values(structure.symbols).forEach(checkSymbol);
  const fixture = fs.readFileSync(path.join(ROOT,
    'tools/test/overlay/kubejs/server_scripts/gg_test_luv_orbital_biology.js'), 'utf8');
  for (const [, id] of fixture.matchAll(/['"](?:\d+x )?(gtceu:[a-z0-9_]+)['"]/g)) {
    if (id !== 'gtceu:greenhouse') assert.ok(nativeItems.has(id) || nativeFluids.has(id), `fixture native ID: ${id}`);
  }
});

test('B4 native fixture feeds exactly the inputs of a real B4 recipe in every scenario', () => {
  // Native S2: the crystal grower was fed an emerald with circuit 1 (olivine's), matched nothing and never finished.
  const src = fs.readFileSync(path.join(ROOT, 'tools/test/overlay/kubejs/server_scripts/gg_test_luv_orbital_biology.js'), 'utf8');
  const body = src.slice(src.indexOf('function scenario(m, step)'), src.indexOf('function wake(m)'));
  const scenario = vm.runInNewContext('(' + body + ')');
  const { recipes } = harness();
  const types = ['microgravity_crystal_growth', 'greenhouse', 'organoid_assembly'];
  for (const [index, step] of [[0, 0], [1, 0], [1, 1], [2, 0], [2, 1]]) {
    const sc = JSON.parse(JSON.stringify(scenario({ index }, step)));
    const matches = recipes.filter((r) => r.type === types[index] && only(r, 'circuit') === sc.circuit);
    assert.equal(matches.length, 1, `scenario ${index}/${step} circuit ${sc.circuit}`);
    const r = matches[0];
    const items = [...call(r, 'itemInputs').flat(), ...call(r, 'notConsumable').flat()].sort();
    assert.deepEqual(items, [...sc.items].sort(), `scenario ${index}/${step} items`);
    assert.deepEqual(call(r, 'inputFluids').flat().map((f) => [f.id, f.amount]), sc.fluids);
    const out = /^(?:(\d+)x )?(.+)$/.exec(only(r, 'itemOutputs'));
    assert.deepEqual([out[2], Number(out[1] || 1)], [sc.output, sc.count]);
  }
});