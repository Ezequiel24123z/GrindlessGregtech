// UXV-A6 (shequid_mnt): the SHeQUID works and MNT collider rows, the gas stopping cell (line 43), the uxv_sensor line, the controllers'
// assembly lines, the three older rows, the items registered by startup_scripts/grindless/uxv/shequid_mnt.js and the structures.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { measure, violations } from '../lib/structure_quality.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const run = runPackScripts(pack);
const SM = run.global.grindless.shequidMnt;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const producers = (id) => recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`));
const plain = (x) => JSON.parse(JSON.stringify(x));
const rec = (type, name) => SM.recipes.find((r) => r.type === type && r.name === name);

const ITEMS = ['weak_link_cell', 'mnt_thermal_ions'];

test('the stand-in runs the UXV-A6 scripts without errors, nothing skipped, no lookup clash', () => {
  const mine = run.errors.filter((e) => /shequid_mnt|sounds/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(SM.skipped), []);
  assert.deepEqual(plain(SM.clashes), []);
  assert.equal(SM.recipes.length, 7 + 2); // MAX-A2 appended c5 balanced_composite_billet and c7 calibrated_superleak (lines 10 and 41)
});

test('2 items registered by the startup file, named in en_us and es_es', () => {
  for (const n of ITEMS) {
    const it = run.registry.items.get(`grindless:${n}`);
    assert.ok(it && /uxv[\\/]shequid_mnt\.js$/.test(String(it.file)), `${n} registered by shequid_mnt.js`);
    for (const lang of ['en_us', 'es_es']) {
      assert.ok(run.lang[lang][`item.grindless.${n}`], `${lang} names ${n}`);
      assert.ok(run.lang[lang][`tooltip.grindless.${n}.0`], `${lang} tooltip ${n}.0`);
      assert.ok(run.lang[lang][`tooltip.grindless.${n}.1`], `${lang} tooltip ${n}.1`);
    }
  }
});

test('SHeQUID rows: circuits 1-2, the aperture array to a weak-link cell, the He-II bath comes back', () => {
  const rows = SM.recipes.filter((r) => r.type === 'shequid_assembly');
  assert.deepEqual(plain(rows.map((r) => [r.name, r.circuit])), [['weak_link_cell', 1], ['shequid_gyro', 2], ['balanced_composite_billet', 5], ['calibrated_superleak', 7]]);
  const c1 = rec('shequid_assembly', 'weak_link_cell');
  const c2 = rec('shequid_assembly', 'shequid_gyro');
  assert.ok(c1.itemsIn.some((x) => x.id === 'grindless:nanoaperture_array'));
  assert.equal(c1.eut, 16777216);
  assert.ok(c2.itemsIn.some((x) => x.id === 'grindless:weak_link_cell' && x.count === 2));
  assert.ok(c2.itemsIn.some((x) => x.id === 'grindless:mtj_die'));
  assert.equal(c2.eut, 33554432);
  const inHe = c2.fluidsIn.find((f) => f.id === 'gtceu:superfluid_helium');
  const outHe = c2.fluidsOut.find((f) => f.id === 'gtceu:superfluid_helium');
  assert.ok(inHe && outHe && outHe.amount < inHe.amount, 'He-II in, a little less back');
  for (const r of rows) assert.ok(find(`grindless:shequid_assembly/${r.name}`), `${r.name} is in the recipe docs`);
});

test('MNT rows: circuits 1-4, the gas stopping cell kept, spent target, recoil gas and helium recovered', () => {
  const rows = SM.recipes.filter((r) => r.type === 'multinucleon_transfer');
  assert.deepEqual(plain(rows.map((r) => [r.name, r.circuit])), [['collision', 1], ['gas_catcher', 2], ['mr_tof', 3], ['island_chart', 4]]);
  const col = rec('multinucleon_transfer', 'collision');
  assert.equal(col.eut, 134217728);
  assert.deepEqual(plain(col.kept.map((x) => x.id)), ['grindless:gas_stopping_cell']);
  assert.ok(col.itemsIn.some((x) => x.id === 'grindless:u238_beam_charge') && col.itemsIn.some((x) => x.id === 'grindless:cm248_target'));
  assert.ok(col.itemsOut.some((x) => x.id === 'grindless:spent_actinide_target'));
  assert.ok(col.fluidsOut.some((f) => f.id === 'gtceu:mnt_product_gas'));
  const cat = rec('multinucleon_transfer', 'gas_catcher');
  assert.deepEqual(plain(cat.kept.map((x) => x.id)), ['grindless:gas_stopping_cell']);
  assert.ok(cat.fluidsIn.some((f) => f.id === 'gtceu:he_6n') && cat.itemsOut.some((x) => x.id === 'grindless:mnt_thermal_ions'));
  const mr = rec('multinucleon_transfer', 'mr_tof');
  assert.ok(mr.itemsIn.some((x) => x.id === 'grindless:mnt_thermal_ions') && mr.itemsOut.some((x) => x.id === 'grindless:island_nuclide'));
  assert.ok(mr.fluidsOut.some((f) => f.id === 'gtceu:mnt_product_gas'), 'light fragments go to A1\'s partitioning');
  const chart = rec('multinucleon_transfer', 'island_chart');
  assert.ok(chart.itemsIn.some((x) => x.id === 'grindless:island_nuclide' && x.count === 16));
  assert.ok(chart.itemsOut.some((x) => x.id === 'grindless:island_chart'));
  for (const r of rows) assert.ok(find(`grindless:multinucleon_transfer/${r.name}`), `${r.name} is in the recipe docs`);
});

test('line 43: the gas stopping cell and the sensor on an assembly line researched on the SHeQUID gyro', () => {
  const cell = find('grindless:assembler/gas_stopping_cell');
  assert.ok(cell, 'gas stopping cell');
  const text = JSON.stringify(cell.j);
  for (const id of ['grindless:rf_carpet_board', 'gtceu:he_6n']) assert.ok(text.includes(id), `the cell takes ${id}`);
  assert.equal(SM.sensorRecipe, 'grindless:assembly_line/uxv_sensor');
  const s = find(SM.sensorRecipe);
  assert.ok(s && s.t === 'gtceu:assembly_line');
  const st = JSON.stringify(s.j);
  for (const id of ['grindless:shequid_gyro', 'grindless:nv_diamond_chip', 'grindless:mtj_die', 'gtceu:uiv_sensor', 'gtceu:he_6n']) assert.ok(st.includes(id), `the sensor takes ${id}`);
});

test('the controllers: UIV hull, parts, mainframes, helium, at least 8 distinct ingredients', () => {
  assert.deepEqual(plain(SM.controllerRecipes), ['grindless:assembly_line/shequid_works', 'grindless:assembly_line/mnt_collider']);
  for (const id of SM.controllerRecipes) {
    const r = find(id);
    assert.ok(r && r.t === 'gtceu:assembly_line', id);
    const text = JSON.stringify(r.j);
    for (const need of ['gtceu:he_6n', 'gtceu:soldering_alloy', 'gtceu:lubricant']) assert.ok(text.includes(need), `${id} takes ${need}`);
    assert.ok(!text.includes('neutronium'), `${id} takes no neutronium`);
    const ids = new Set((text.match(/"(?:id|tag|item)":"[^"]+"/g) || []));
    assert.ok(ids.size >= 8, `${id}: ${ids.size} distinct ingredients`);
  }
  assert.ok(JSON.stringify(find('grindless:assembly_line/shequid_works').j).includes('optical_mainframe'));
  assert.ok(JSON.stringify(find('grindless:assembly_line/mnt_collider').j).includes('spintronic_mainframe'));
  assert.ok(JSON.stringify(find('grindless:assembly_line/mnt_collider').j).includes('gtceu:uxv_sensor'));
});

test('older rows: cold he2_heat_flush, uranium u238_ion_source (circuit 11), synchrotron u238_beam_charge (circuit 8)', () => {
  const flush = find('grindless:superfluid_helium/superfluid_helium/he2_heat_flush');
  assert.ok(flush, 'he2_heat_flush');
  const ft = JSON.stringify(flush.j);
  assert.ok(ft.includes('gtceu:superfluid_helium') && ft.includes('helium_3_concentrate'));
  const ion = find('grindless:fuel_fabrication/u238_ion_source');
  assert.ok(ion, 'u238_ion_source');
  const it = JSON.stringify(ion.j);
  assert.ok(it.includes('"configuration":11'), 'circuit 11');
  assert.ok(it.includes('depleted_uranium_hexafluoride') && it.includes('gtceu:fluorine'), 'fluorine comes back');
  const beam = find('grindless:synchrotron/synchrotron/u238_beam_charge');
  assert.ok(beam, 'u238_beam_charge');
  const bt = JSON.stringify(beam.j);
  assert.ok(bt.includes('grindless:u238_ion_source') && bt.includes('liquid_helium') && bt.includes('gtceu:helium'));
  assert.ok(bt.includes('"configuration":8'), 'circuit 8');
});

test('"only from": nothing else in the pack makes these ids', () => {
  const only = {
    'grindless:weak_link_cell': 'shequid_assembly/weak_link_cell', 'grindless:shequid_gyro': 'shequid_assembly/shequid_gyro',
    'grindless:mnt_thermal_ions': 'multinucleon_transfer/gas_catcher', 'grindless:island_nuclide': 'multinucleon_transfer/mr_tof',
    'grindless:island_chart': 'multinucleon_transfer/island_chart', 'grindless:gas_stopping_cell': 'assembler/gas_stopping_cell',
    'gtceu:uxv_sensor': 'assembly_line/uxv_sensor', 'grindless:u238_ion_source': 'fuel_fabrication/u238_ion_source',
    'grindless:u238_beam_charge': 'synchrotron/u238_beam_charge', 'gtceu:shequid_works': 'assembly_line/shequid_works',
    'gtceu:mnt_collider': 'assembly_line/mnt_collider'
  };
  for (const [id, tail] of Object.entries(only)) {
    const ps = producers(id);
    assert.ok(ps.length >= 1, `${id} has a producer`);
    assert.ok(ps.every((r) => r.i.endsWith(tail)), `${id} only from ${tail}: ${ps.map((r) => r.i)}`);
  }
  assert.ok(producers('grindless:spent_actinide_target').some((r) => r.i === 'grindless:multinucleon_transfer/collision'));
});

test('structures: not boring, at least two functional kinds, controller in the front slice', () => {
  for (const id of ['gtceu:shequid_works', 'gtceu:mnt_collider']) {
    const s = run.global.grindless.structures[id];
    assert.ok(s, `${id} has a description`);
    const m = measure(s);
    assert.deepEqual(violations(m), [], `${id}: ${JSON.stringify(m)}`);
    assert.ok(m.dominantShare <= 0.62, `${id}: dominant share ${m.dominantShare}`);
    assert.ok(s.slices[s.slices.length - 1].some((row) => row.includes('S')), `${id}: the controller is in the front slice`);
  }
});

test('lang parity: every key of both languages, names, tooltips, EMI pages and recipe lines', () => {
  const keys = [];
  for (const m of ['shequid_works', 'mnt_collider']) {
    keys.push(`block.gtceu.${m}`, `grindless.machine.${m}.tooltip.0`, `emi.grindless.info.${m}.0`, `emi.grindless.info.${m}.1`);
  }
  keys.push('gtceu.shequid_assembly', 'gtceu.multinucleon_transfer', 'gtceu.recipe.grindless_synchrotron.u238_beam_charge');
  for (const r of SM.recipes.filter((x) => x.dataKey)) keys.push(`gtceu.recipe.${r.dataKey}.${r.name}`);
  for (const k of keys) for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][k], `${lang} has ${k}`);
  const re = /shequid|mnt_|multinucleon|weak_link|u238_beam/;
  assert.deepEqual(Object.keys(run.lang.en_us).filter((k) => re.test(k)).sort(), Object.keys(run.lang.es_es).filter((k) => re.test(k)).sort());
});
