// UV's detectors (package UV-A7), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/uv/detectors.js: two recipe types, two machines (3 x 13 x 3 zone refining tower, 9 x 9 x 9 optical ground
//     station); no new item or fluid (F1's and UV-A6's ids);
//   - server_scripts/grindless/uv/detectors.js: the tower's three steps, the station's downlink, the crafting;
//   - the ZPM qubit fab's circuit 3 row (server_scripts/grindless/zpm/qubits.js): the SNSPD array;
//   - en_us and es_es text for the machines and types.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const D = plain(run.global.grindless.detectors);
const Q = plain(run.global.grindless.qubits);
const recipes = run.docs.recipes.recipes;
const row = (name) => D.recipes.find((r) => r.name === name);
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const read = (rel) => fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
const outputsOf = (r) => JSON.stringify(r.j.outputs || r.j.result || {});
const inputsOf = (r) => JSON.stringify(r.j.inputs || r.j.ingredients || r.j.key || {});
const VA_UV = 491520;

test('the stand-in runs the detectors scripts without errors, nothing clashing or skipped', () => {
  const errs = run.errors.filter((e) => /detectors/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(D.clashes, []);
  assert.deepEqual(D.skipped, []);
});

test('registration: two recipe types, two machines; F1 and A6 ids are reused, not registered again', () => {
  assert.deepEqual(run.registry.machines.get('gtceu:zone_refining_tower').recipeTypes, ['gtceu:zone_refining']);
  assert.deepEqual(run.registry.machines.get('gtceu:optical_ground_station').recipeTypes, ['gtceu:optical_downlink']);
  for (const t of ['zone_refining', 'optical_downlink']) assert.ok(run.registry.recipeTypes.has('gtceu:' + t), t);
  const src = read('startup_scripts/grindless/uv/detectors.js');
  assert.doesNotMatch(src, /StartupEvents\.registry\('(item|block|fluid)'/);
  assert.doesNotMatch(src, /GTCEuStartupEvents\.registry\('gtceu:material'/);
  for (const id of ['grindless:hpge_crystal', 'grindless:snspd_array', 'grindless:starshot_probe', 'grindless:proxima_approach_data']) {
    assert.ok(run.registry.items.has(id), id + ' (F1)');
  }
  assert.ok(run.registry.fluids.has('gtceu:germanium_tetrachloride'), 'GeCl4 (UV-A6)');
});

test('patterns: tower 3 wide x 13 high x 3 deep with 8 coils and the puller, station 9 x 9 x 9 with mirror and bench', () => {
  const dims = { 'gtceu:zone_refining_tower': [3, 13, 3], 'gtceu:optical_ground_station': [9, 9, 9] };
  for (const [id, [width, height, depth]] of Object.entries(dims)) {
    const s = run.docs.structures.structures[id];
    assert.ok(s, id + ' described');
    assert.equal(s.slices.length, depth, id);
    assert.ok(s.slices.every((sl) => sl.length === height && sl.every((r) => r.length === width)), id + ' uniform slices');
    assert.equal(s.slices.flat().join('').split('').filter((c) => c === 'S').length, 1, id + ' one controller');
    for (const sl of s.slices) for (const r of sl) for (const c of r) assert.ok(c === ' ' || s.symbols[c], `${id} symbol ${c}`);
    const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
    for (const a of ['energy_input', 'input_bus', 'input_hatch', 'output_bus', 'output_hatch']) assert.ok(lim[a] && lim[a].min === 1, `${id} ${a}`);
    assert.equal(lim.energy_input.max, 2, id + ' energy');
  }
  const count = (s, block) => {
    const syms = Object.entries(s.symbols).filter(([, v]) => v.kind === 'blocks' && v.blocks.length === 1 && v.blocks[0] === block).map(([k]) => k);
    return s.slices.flat().join('').split('').filter((c) => syms.includes(c)).length;
  };
  const tower = run.docs.structures.structures['gtceu:zone_refining_tower'];
  assert.equal(count(tower, 'gtceu:naquadah_coil_block'), 8, 'eight RF coils');
  assert.equal(count(tower, 'gtceu:stainless_steel_gearbox'), 1, 'the Czochralski puller');
  assert.ok(tower.symbols.X.options.some((o) => o.kind === 'blocks' && o.blocks.includes('gtceu:clean_machine_casing')), 'clean room casing');
  const station = run.docs.structures.structures['gtceu:optical_ground_station'];
  assert.equal(count(station, 'gtceu:aluminium_block'), 25, '5 x 5 mirror');
  assert.equal(count(station, 'gtceu:computer_casing'), 3, 'adaptive optics bench');
  assert.ok(station.symbols.X.options.some((o) => o.kind === 'blocks' && o.blocks.includes('gtceu:uv_machine_casing')), 'UV casing');
});

test('each machine: unique circuits, whole numbers, UV VA at most, every row in the dump with its circuit', () => {
  for (const type of ['zone_refining', 'optical_downlink']) {
    const rows = D.recipes.filter((r) => r.type === type);
    const circuits = rows.map((r) => r.circuit);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of rows) {
      assert.ok(Number.isInteger(r.duration) && r.duration > 0 && Number.isInteger(r.eut) && r.eut > 0 && r.eut <= VA_UV, r.name);
      const rec = recipes.find((x) => x.i === r.recipeId);
      assert.ok(rec, r.recipeId);
      assert.equal(rec.t, 'gtceu:' + type);
      assert.deepEqual(circuitOf(rec), r.circuit === null ? [] : [r.circuit], r.name);
    }
  }
  // UIV-A5 appended the Si-28 float-zone ingot (c6) and the donor regrow (c7); circuits 4-5 are UEV's rows in uev/photonics.js
  assert.deepEqual(D.recipes.filter((r) => r.type === 'zone_refining').map((r) => [r.name, r.circuit]),
  // UXV-A2 appended the 7N tellurium (c8) and germanium (c9) rows
    [['germanium_tetrachloride', 1], ['germanium_reduction', 2], ['hpge_crystal', 3], ['si28_fz_ingot', 6], ['si28_donor_regrow', 7], ['seven_n_tellurium', 8], ['seven_n_germanium', 9]]);
  for (const id of [D.crafting.tower, D.crafting.station]) assert.ok(recipes.find((x) => x.i === id), id);
});

test('germanium line: circuit 1 makes UV-A6\'s GeCl4 with balanced chlorine; circuit 2 loops the water', () => {
  const c1 = row('germanium_tetrachloride');
  assert.deepEqual(c1.itemsIn, [{ id: 'gtceu:germanium_dust', count: 1 }]);
  assert.deepEqual(c1.fluidsIn, [{ id: 'gtceu:chlorine', amount: 4000 }]);
  assert.deepEqual(c1.fluidsOut, [{ id: 'gtceu:germanium_tetrachloride', amount: 1000 }]);
  const c2 = row('germanium_reduction');
  const water = (list) => list.find((f) => f.id === 'minecraft:water').amount;
  assert.equal(water(c2.fluidsIn), water(c2.fluidsOut), 'water comes back');
  assert.deepEqual(c2.itemsOut, [{ id: 'gtceu:germanium_ingot', count: 1 }]);
  assert.ok(c2.fluidsOut.some((f) => f.id === 'gtceu:hydrochloric_acid' && f.amount === 4000), 'the four chlorines leave as HCl');
  // GeCl4 now has a maker: our circuit 1; A6's preform consumes it
  const makers = recipes.filter((r) => outputsOf(r).includes('gtceu:germanium_tetrachloride')).map((r) => r.i);
  assert.deepEqual(makers, ['grindless:zone_refining/germanium_tetrachloride']);
  assert.ok(recipes.some((r) => /^grindless:fibre_draw\/(fibre_draw\/)?preform$/.test(r.i) && inputsOf(r).includes('gtceu:germanium_tetrachloride')));
});

test('HPGe comes only from the zone tower\'s circuit 3; the impure ends go back to circuit 1', () => {
  const makers = recipes.filter((r) => outputsOf(r).includes('grindless:hpge_crystal')).map((r) => r.i);
  assert.deepEqual(makers, ['grindless:zone_refining/hpge_crystal']);
  const c3 = row('hpge_crystal');
  assert.deepEqual(c3.itemsIn, [{ id: 'gtceu:germanium_ingot', count: 4 }]);
  assert.deepEqual(c3.itemsOut, [{ id: 'grindless:hpge_crystal', count: 1 }, { id: 'gtceu:germanium_dust', count: 1 }]);
});

test('the ground station turns the Starshot probe into Proxima data only with an SNSPD array, made in the qubit fab from NbN', () => {
  const r = row('proxima_approach_data');
  assert.equal(r.type, 'optical_downlink');
  assert.equal(r.notConsumable, 'grindless:snspd_array');
  assert.deepEqual(r.itemsIn, [{ id: 'grindless:starshot_probe', count: 1 }]);
  assert.deepEqual(r.itemsOut, [{ id: 'grindless:proxima_approach_data', count: 1 }]);
  assert.deepEqual(r.fluidsIn, [{ id: 'gtceu:superfluid_helium', amount: 100 }]);
  const rec = recipes.find((x) => x.i === r.recipeId);
  assert.ok(inputsOf(rec).includes('grindless:snspd_array'), 'the array is in the recipe');
  const makers = recipes.filter((x) => outputsOf(x).includes('grindless:proxima_approach_data')).map((x) => x.i);
  assert.deepEqual(makers, [r.recipeId]);
  const snspd = Q.recipes.find((x) => x.name === 'snspd_array');
  assert.ok(snspd, 'qubit fab row');
  assert.equal(snspd.type, 'qubit_fabrication');
  assert.deepEqual(snspd.itemsIn, [{ id: 'grindless:nbn_film_wafer', count: 1 }]);
  assert.deepEqual(snspd.itemsOut, [{ id: 'grindless:snspd_array', count: 1 }]);
  const arrayMakers = recipes.filter((x) => outputsOf(x).includes('grindless:snspd_array')).map((x) => x.i);
  assert.deepEqual(arrayMakers, ['grindless:qubit_fabrication/snspd_array']);
});

test('byproduct destinations are written down', () => {
  const src = read('server_scripts/grindless/uv/detectors.js');
  for (const word of ['hydrochloric acid', 'water', 'germanium dust', 'helium']) assert.match(src, new RegExp(`${word} \\(`, 'i'), word);
});

test('names: en_us and es_es for both machines and both types', () => {
  const lang = read('client_scripts/grindless/uv_detectors_lang.js');
  const [en, es] = lang.split('es_es: {');
  assert.ok(es, 'es_es block');
  for (const part of [en, es]) {
    for (const key of ['tower:', 'station:', 'towerType:', 'stationType:', 'towerTips:', 'stationTips:']) assert.ok(part.includes(key), key);
  }
  for (const k of ['block.gtceu.zone_refining_tower', 'block.gtceu.optical_ground_station', 'gtceu.zone_refining', 'gtceu.optical_downlink',
    'grindless.machine.zone_refining_tower.tooltip.', 'grindless.machine.optical_ground_station.tooltip.']) assert.ok(lang.includes(`'${k}`), k);
  assert.match(lang, /i < 1/);
});
