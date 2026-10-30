import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

// LuV B9 (Ganymede): the gravitational-wave detector and the coilgun probe launcher (docs/eras/luv.md, machines 19 and 20).
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const script = (kind, file) => fs.readFileSync(path.join(ROOT, 'pack/kubejs', kind, 'grindless', file), 'utf8');
const names = ['gravitational_wave_detector', 'coilgun_launcher'];

function harness() {
  const callbacks = [];
  const machines = new Map();
  const types = new Map();
  const recipes = [];
  const G = {
    readJsonTable: (p) => JSON.parse(fs.readFileSync(path.join(ROOT, 'pack', p), 'utf8')),
    parallelHatch: { overclock: () => 'overclock' },
    noVoiding: {
      modifier: (opts, next) => (m, r) => (m.voids ? 'cancel:' + opts.reason : next(m, r)),
      beforeWorking: (opts) => (m) => !m.voids && opts.which === 'items',
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
    GuiTextures: dummy, FillDirection: dummy, RotationState: dummy, Text: { translate: (s) => s },
    Block: { getBlock: (id) => 'block:' + id },
    Fluid: { of: (id, amount) => ({ id, amount }) },
    ServerEvents: { recipes(cb) {
      const gtceu = new Proxy({}, { get: (_, type) => (...args) => {
        const entry = { type, args, calls: [] };
        recipes.push(entry);
        return builder(entry.calls);
      } });
      const shapeless = (...args) => {
        const entry = { type: 'shapeless', args, calls: [] };
        recipes.push(entry);
        return builder(entry.calls);
      };
      cb({ recipes: { gtceu }, shapeless });
    } },
  });
  vm.runInContext(script('startup_scripts', 'lib/patterns.js'), context);
  vm.runInContext(script('startup_scripts', 'lib/places.js'), context);
  vm.runInContext(script('startup_scripts', 'luv/ganymede.js'), context);
  for (const [type, cb] of callbacks) cb({ create(id) {
    const calls = [];
    (type === 'gtceu:machine' ? machines : types).set(id, calls);
    return builder(calls);
  } });
  vm.runInContext(script('server_scripts', 'luv/ganymede.js'), context);
  return { G, machines, types, recipes };
}
const call = (r, method) => r.calls.filter((c) => c[0] === method).map((c) => c.slice(1));
const only = (r, method) => call(r, method)[0]?.[0];
const cells = (d) => {
  const out = [];
  d.slices.forEach((rows, s) => rows.forEach((row, y) => [...row].forEach((ch, x) => out.push({ ch, x, y, s }))));
  return out;
};
const plain = (x) => JSON.parse(JSON.stringify(x));
const count = (d, ch) => cells(d).filter((c) => c.ch === ch).length;

test('B9 the buried L: 33x5x33, two hollow tubes under ice, four sapphire test masses, hatches only at the vertex', () => {
  const { G } = harness();
  const d = G.structures['gtceu:gravitational_wave_detector'];
  assert.equal(d.slices.length, 33);
  assert.equal(d.slices[0].length, 5);
  assert.equal(d.slices[0][0].length, 33);
  assert.equal(count(d, 'S'), 1);
  const ctrl = cells(d).find((c) => c.ch === 'S');
  assert.deepEqual([ctrl.x, ctrl.y, ctrl.s], [2, 2, 32]);
  assert.equal(count(d, 'M'), 4);
  assert.equal(d.symbols.M.blocks[0], 'grindless:sapphire_test_mass');
  assert.deepEqual(plain(d.symbols.I.blocks), ['minecraft:packed_ice', 'minecraft:blue_ice']);
  assert.equal(d.symbols.C.blocks[0], 'gtceu:clean_machine_casing');
  assert.equal(d.symbols.F.blocks[0], 'gtceu:frostproof_machine_casing');
  // two tubes of 25 rings (five pipe rings, stainless frame posts on the corners, clean panels, glass viewports), two 3x3x3 end stations less their test mass, ice over every tube and end station
  assert.equal(count(d, 'P'), 2 * 5 * 8);
  assert.equal(count(d, 'T'), 2 * 20 * 4);
  assert.equal(count(d, 'G'), 2 * 4 * 2);
  assert.equal(count(d, 'C') + count(d, 'G') + count(d, 'T') + count(d, 'P'), 2 * 25 * 8);
  assert.equal(d.symbols.T.materials[0], 'stainless_steel');
  assert.equal(count(d, 'F'), 2 * 26);
  assert.equal(count(d, 'I'), 2 * 28 * 3);
  // the beam line: air down the middle of each tube, from the vertex test mass to the end one
  for (let s = 3; s <= 27; s++) assert.equal(d.slices[s][2][2], '#');
  for (let x = 5; x <= 29; x++) assert.equal(d.slices[30][2][x], '#');
  assert.equal(d.slices[28][2][2], 'M');
  assert.equal(d.slices[30][2][4], 'M');
  assert.equal(d.slices[2][2][2], 'M');
  assert.equal(d.slices[30][2][30], 'M');
  // every ice cell has an arm cell under it
  for (const c of cells(d).filter((c) => c.ch === 'I')) assert.match(d.slices[c.s][3][c.x], /[CFPTG]/);
  // only the vertex carries parts
  for (const c of cells(d).filter((c) => c.ch === 'X')) assert.ok(c.x <= 4 && c.s >= 28);
  const parts = d.symbols.X.options;
  assert.equal(parts[0].blocks[0], 'gtceu:frostproof_machine_casing');
  assert.equal(parts[0].limits.min, 60);
  assert.ok(count(d, 'X') >= 60 + 5);
  assert.ok(parts.some((p) => p.ability === 'energy_input' && p.limits.min === 1 && p.limits.max === 2));
  assert.ok(parts.some((p) => p.ability === 'input_hatch' && p.limits.min === 1));
  assert.ok(parts.some((p) => p.ability === 'maintenance' && p.limits.exact === 1));
  assert.ok(!parts.some((p) => p.ability === 'parallel_hatch'));
});

test('B9 the coilgun: 11 accelerating coil rings between frame-post sections around an open bore, a 5x5x4 breech and a 3x3x3 pulse bank', () => {
  const { G } = harness();
  const d = G.structures['gtceu:coilgun_launcher'];
  assert.equal(d.slices.length, 37);
  assert.equal(d.slices[0].length, 5);
  assert.equal(d.slices[0][0].length, 8);
  assert.equal(count(d, 'K'), 11 * 8);
  assert.equal(count(d, 'R'), 22 * 4);
  assert.equal(count(d, 'G'), 11 * 4);
  assert.equal(d.symbols.K.blocks[0], 'grindless:coilgun_coil_casing');
  assert.equal(d.symbols.R.materials[0], 'tungsten_steel');
  assert.equal(count(d, 'T'), 27 + 11 * 4);
  assert.equal(d.symbols.T.blocks[0], 'gtceu:robust_machine_casing');
  for (let s = 0; s <= 35; s++) assert.equal(d.slices[s][2][2], '#', 'bore at slice ' + s);
  const ctrl = cells(d).find((c) => c.ch === 'S');
  assert.deepEqual([ctrl.x, ctrl.y, ctrl.s], [2, 2, 36]);
  for (const c of cells(d).filter((c) => c.ch === 'X')) assert.ok(c.x <= 4 && c.s >= 33);
  const parts = d.symbols.X.options;
  assert.equal(parts[0].blocks[0], 'gtceu:robust_machine_casing');
  assert.ok(count(d, 'X') >= parts[0].limits.min + 4);
  assert.ok(!parts.some((p) => p.ability === 'input_hatch' || p.ability === 'parallel_hatch'));
  // every height fits the helper's 16-row limit
  assert.ok(Math.max(...Object.values(G.structures).map((s) => s.slices[0].length)) <= 16);
});

test('B9 recipe types, keep-everything machines and their controllers', () => {
  const { machines, types, recipes } = harness();
  assert.deepEqual([...types.keys()], ['gravitational_wave_astronomy', 'probe_launch']);
  assert.deepEqual(call({ calls: types.get('gravitational_wave_astronomy') }, 'setMaxIOSize')[0], [3, 1, 1, 0]);
  assert.deepEqual(call({ calls: types.get('probe_launch') }, 'setMaxIOSize')[0], [2, 1, 0, 0]);
  for (const name of names) {
    const c = { calls: machines.get(name) };
    const [modifier, always] = call(c, 'recipeModifier')[0];
    assert.equal(always, true);
    assert.equal(modifier({ voids: true }, {}), 'cancel:grindless.machine.' + name + '.no_voiding');
    assert.equal(modifier({ voids: false }, {}), 'overclock');
    assert.equal(only(c, 'beforeWorking')({ voids: true }), false);
    assert.equal(only(c, 'beforeWorking')({ voids: false }), true);
    assert.equal(call(c, 'workableCasingModel')[0][1], 'grindless:block/multiblock/' + name);
  }
  const controllers = recipes.filter((r) => r.type === 'assembly_line' && names.includes(r.args[0].replace('grindless:', '')));
  assert.equal(controllers.length, 2);
  const inputs = (r) => call(r, 'itemInputs').flat();
  assert.deepEqual(inputs(controllers[0]), ['gtceu:luv_machine_hull', '2x gtceu:luv_emitter', '2x gtceu:luv_sensor', '4x #gtceu:circuits/luv',
    '2x grindless:jupiter_entry_probe', '2x grindless:hermean_thin_film_panel']);
  assert.deepEqual(inputs(controllers[1]), ['gtceu:luv_machine_hull', 'gtceu:luv_field_generator', '2x gtceu:luv_emitter', '4x #gtceu:circuits/luv',
    '2x grindless:saturn_flyby_probe', '2x grindless:tungsten_steel_drill_bit']);
  controllers.forEach((r, i) => {
    assert.equal(r.args[0], 'grindless:' + names[i]);
    assert.deepEqual(call(r, 'itemOutputs').flat(), ['gtceu:' + names[i]]);
    assert.deepEqual(call(r, 'inputFluids').flat().map((x) => [x.id, x.amount]), [['gtceu:soldering_alloy', 576], ['gtceu:lubricant', 500]]);
    assert.deepEqual([only(r, 'EUt'), only(r, 'duration')], [30720, 600]);
  });});

test('B9 the catalogue, the launches and the probes: Ganymede only, own circuits, the Sagittarius A* signal kept', () => {
  const { G, recipes } = harness();
  const ganymede = JSON.parse(fs.readFileSync(path.join(ROOT, 'pack/kubejs/data/grindless/tables/places.json'), 'utf8')).surfaces.ganymede;
  assert.equal(G.places.surface('ganymede'), ganymede);
  const gw = recipes.filter((r) => r.type === 'gravitational_wave_astronomy');
  assert.equal(gw.length, 3); // UIV-B4 appended the Kerr ringdown record (circuit 2), UXV-B4 the Vela glitch record (circuit 3)
  assert.equal(gw[0].args[0], 'grindless:luv/gravitational_wave_catalogue');
  assert.equal(only(gw[0], 'circuit'), 1);
  assert.deepEqual(call(gw[0], 'itemInputs')[0], ['gtceu:data_orb']);
  assert.deepEqual(call(gw[0], 'notConsumable')[0], ['grindless:sagittarius_a_star_signal']);
  assert.deepEqual(JSON.parse(JSON.stringify(only(gw[0], 'inputFluids'))), { id: 'gtceu:liquid_helium', amount: 100 });
  assert.equal(only(gw[0], 'itemOutputs'), 'grindless:gravitational_wave_catalogue');
  assert.equal(only(gw[0], 'EUt'), 30720);
  assert.equal(only(gw[0], 'duration'), 12000);
  assert.deepEqual(call(gw[0], 'dimension').flat(), [ganymede]);

  const launches = recipes.filter((r) => r.type === 'probe_launch');
  assert.equal(launches.length, 2);
  [['jupiter_entry_probe', 'jovian_atmosphere_survey', 400], ['saturn_flyby_probe', 'saturn_transfer_chart', 12000]].forEach(([probe, out, t], i) => {
    const r = launches[i];
    assert.equal(r.args[0], 'grindless:luv/' + out);
    assert.equal(only(r, 'circuit'), i + 1);
    assert.deepEqual(call(r, 'itemInputs')[0], ['grindless:' + probe]);
    assert.equal(only(r, 'itemOutputs'), 'grindless:' + out);
    assert.equal(only(r, 'EUt'), 30720);
    assert.equal(only(r, 'duration'), t);
    assert.deepEqual(call(r, 'dimension').flat(), [ganymede]);
  });

  const probes = recipes.filter((r) => r.type === 'assembly_line' && /_probe$/.test(r.args[0]));
  assert.deepEqual(probes.map((r) => only(r, 'itemOutputs')), ['grindless:jupiter_entry_probe', 'grindless:saturn_flyby_probe']);
  assert.deepEqual(call(probes[0], 'itemInputs')[0], ['4x gcyr:heat_shielding_fabric', 'gtceu:luv_sensor', 'gtceu:hv_lithium_battery', '4x gtceu:titanium_plate',
    '2x grindless:hermean_heat_shield_brick', '2x grindless:platinum_gauze']);
  assert.deepEqual(call(probes[1], 'itemInputs')[0], ['2x grindless:rtg_pellet', 'gtceu:luv_sensor', 'gtceu:luv_emitter', '4x gtceu:titanium_plate']);
  for (const r of probes) assert.equal(call(r, 'dimension').length, 0);

  const copies = recipes.filter((r) => r.type === 'shapeless');
  assert.deepEqual(plain(copies.map((r) => r.args)), [
    ['2x grindless:gravitational_wave_catalogue', ['grindless:gravitational_wave_catalogue', 'gtceu:data_orb']],
    ['2x grindless:saturn_transfer_chart', ['grindless:saturn_transfer_chart', 'gtceu:data_orb']],
  ]);
  assert.deepEqual(copies.map((r) => only(r, 'id')), [G.ganymede.recipes.copy, G.ganymede.recipes.chartCopy]);
  // the published ids follow GTM's rule: the type goes in front of the path
  assert.equal(G.ganymede.recipes.catalogue, 'grindless:gravitational_wave_astronomy/' + gw[0].args[0].split(':')[1]);
  launches.forEach((r, i) => assert.equal([G.ganymede.recipes.survey, G.ganymede.recipes.chart][i], 'grindless:probe_launch/' + r.args[0].split(':')[1]));
  // no hard-coded dimension in either script
  for (const kind of ['startup_scripts', 'server_scripts']) assert.doesNotMatch(script(kind, 'luv/ganymede.js'), /['"]grindless:ganymede['"]/);
});

test('B9 the hiding rules are gone, the signal\'s IV page is replaced by its use, and the ZPM items have pages', () => {
  const hidden = fs.readFileSync(path.join(ROOT, 'pack/kubejs/data/grindless/tables/hidden_until.json'), 'utf8');
  const obtain = fs.readFileSync(path.join(ROOT, 'tools/analysis/tiers/obtain.json'), 'utf8');
  for (const id of ['jupiter_entry_probe', 'saturn_flyby_probe', 'jovian_atmosphere_survey', 'saturn_transfer_chart',
    'gravitational_wave_catalogue', 'coilgun_coil_casing', 'sapphire_test_mass']) {
    assert.doesNotMatch(hidden, new RegExp('"grindless:' + id + '"'), id);
    assert.doesNotMatch(obtain, new RegExp('"grindless:' + id + '"'), id);
  }
  const pages = path.join(ROOT, 'pack/kubejs/assets/emi/recipe/additions/grindless');
  assert.ok(!fs.existsSync(path.join(pages, 'sagittarius_a_star_signal.json')));
  for (const id of ['jovian_atmosphere_survey', 'saturn_transfer_chart', 'coilgun_coil_casing', 'sapphire_test_mass']) {
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(pages, id + '.json'), 'utf8')).stacks, ['item:grindless:' + id]);
  }
  const lang = fs.readFileSync(path.join(ROOT, 'pack/kubejs/client_scripts/grindless/emi_info_lang.js'), 'utf8');
  assert.doesNotMatch(lang, /info\.sagittarius_a_star_signal/);
  assert.doesNotMatch(lang, /later in LuV/);
});

test('B9 language parity and both controller faces exist', () => {
  const languages = {};
  vm.runInNewContext(script('client_scripts', 'luv_ganymede_lang.js'), {
    ClientEvents: { lang(lang, cb) { languages[lang] = {}; cb({ add: (_, key, value) => { languages[lang][key] = value; } }); } },
  });
  assert.deepEqual(Object.keys(languages.en_us).sort(), Object.keys(languages.es_es).sort());
  for (const name of names) {
    for (const key of ['block.gtceu.' + name, 'grindless.machine.' + name + '.tooltip.0', 'grindless.machine.' + name + '.tooltip.1',
      'grindless.machine.' + name + '.no_voiding']) assert.ok(languages.en_us[key], key);
    for (const file of ['overlay_front.png', 'overlay_front_active.png']) {
      const bytes = fs.readFileSync(path.join(ROOT, 'pack/kubejs/assets/grindless/textures/block/multiblock', name, file));
      assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
      assert.equal(bytes.readUInt32BE(16), 16);
    }
  }
  for (const type of ['gravitational_wave_astronomy', 'probe_launch']) assert.ok(languages.en_us['gtceu.' + type]);
});

test('B9 native fixture compiles, stays in its band, reads Ganymede from the places table and keeps its cleanup boundaries', () => {
  const src = fs.readFileSync(path.join(ROOT, 'tools/test/overlay/kubejs/server_scripts/gg_test_luv_ganymede.js'), 'utf8');
  assert.doesNotThrow(() => new vm.Script(src));
  assert.match(src, /x0: 17664, x1: 17727/);
  assert.match(src, /G\.places\.surface\('ganymede'\)/);
  assert.doesNotMatch(src, /['"]grindless:ganymede['"]/);
  assert.match(src, /refusing to overwrite unowned block/);
  assert.match(src, /S\.blocks\.slice\(\)\.reverse\(\)/);
  assert.match(src, /S\.tick > MAX_TICKS/);
  // GTM 7.5.3's RecipeHelper.getRealEUt returns an EnergyStack: Number() of it is NaN (native S2, 2026-10-26).
  assert.match(src, /getRealEUt\(r\)\.getTotalEU\(\)/);
  assert.doesNotMatch(src, /Number\([^()]*getRealEUt\([^()]*\)\)/);
  const zones = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'test', 'zones.json'), 'utf8')).zones;
  assert.deepEqual(zones.find((z) => z.id === 'luv_ganymede').x, [17664, 17727]);
});

test('B9 every existing id matches the pinned native registry', () => {
  // Frozen subset of power-quests-1/results/server/kubejs-exported/items.json (gg-items-1); grindless: ids are LuV-A1's and IV's.
  const nativeItems = new Set([
    'gtceu:frostproof_machine_casing', 'gtceu:clean_machine_casing', 'gtceu:robust_machine_casing',
    'gtceu:tungstensteel_pipe_casing', 'gtceu:borosilicate_glass_block',
    'minecraft:packed_ice', 'minecraft:blue_ice', 'gtceu:data_orb', 'gtceu:luv_sensor',
    'gtceu:luv_emitter', 'gtceu:luv_field_generator', 'gtceu:luv_machine_hull', 'gcyr:heat_shielding_fabric',
    'gtceu:hv_lithium_battery', 'gtceu:titanium_plate', 'grindless:rtg_pellet', 'grindless:sagittarius_a_star_signal',
    'grindless:kerr_probe_data', 'grindless:kerr_ringdown_record', // UIV-B4's ringdown row on Ganymede
    'grindless:vela_glitch_timing', 'grindless:vela_glitch_record', // UXV-B4's record row on Ganymede
  ]);
  const a1 = script('startup_scripts', 'luv/foundation.js');
  // the assembly line parts are IV's registrations (iv/foundation.js, iv/tungsten_steel_drill_bit.js)
  const iv = script('startup_scripts', 'iv/foundation.js') + script('startup_scripts', 'iv/tungsten_steel_drill_bit.js');
  const known = (id) => nativeItems.has(id) || id.startsWith('#gtceu:circuits/') ||
    (id.startsWith('grindless:') && (a1.includes(id.split(':')[1] + ':') || iv.includes(id)));
  const check = (text) => { const id = text.replace(/^\d+x /, ''); if (names.includes(id.replace('gtceu:', ''))) return; assert.ok(known(id), 'not a pinned id: ' + id); };
  const { G, recipes } = harness();
  for (const r of recipes) {
    for (const m of ['itemInputs', 'itemOutputs', 'notConsumable']) call(r, m).flat().forEach(check);
    for (const f of call(r, 'inputFluids').flat()) assert.ok(['gtceu:liquid_helium', 'gtceu:soldering_alloy', 'gtceu:lubricant'].includes(f.id), f.id);
    if (r.type === 'shapeless') [r.args[0], ...r.args[1]].forEach(check);
  }
  const symbol = (s) => { (s.options || []).forEach(symbol); (s.blocks || []).forEach(check); };
  for (const d of Object.values(G.structures)) Object.values(d.symbols).forEach(symbol);
});
