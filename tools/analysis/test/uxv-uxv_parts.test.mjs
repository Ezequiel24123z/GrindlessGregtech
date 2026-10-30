// UXV-A8 (uxv_parts): the hot strip mill, lathe and assembler rows, the five parts' assembly lines, the older rows in magnet_works (c8, c10),
// hts_magnet_works (c6) and coated_conductor_line (c4), the hold rules deleted and text parity.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const UP = run.global.grindless.uxvParts;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const producers = (id) => recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`));
const plain = (x) => JSON.parse(JSON.stringify(x));
const json = (...p) => JSON.parse(fs.readFileSync(path.join(root, ...p), 'utf8'));
const tables = (n) => json('pack', 'kubejs', 'data', 'grindless', 'tables', n + '.json').recipes;
const row = (p) => UP.rows.find((r) => r.path === p);

test('the stand-in runs uxv_parts.js without errors, nothing skipped', () => {
  const mine = run.errors.filter((e) => /uxv_parts/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(UP.skipped), []);
  assert.equal(UP.rows.length, 7);
  assert.equal(UP.partRecipes.length, 5);
});

test('hot strip mill: circuits 9-12, one item in, water in and steam out, no circuit taken twice in the type', () => {
  const hr = UP.rows.filter((r) => r.type === 'hot_rolling');
  assert.deepEqual(plain(hr.map((r) => [r.path, r.circuit])), [['uxv/tetrataenite_lamination', 9], ['uxv/alip_duct', 10], ['uxv/gum_metal_blank', 11], ['uxv/encoder_ring', 12]]);
  assert.deepEqual(plain(row('uxv/gum_metal_blank').itemsIn), [{ id: 'grindless:gum_metal_billet', count: 1 }]);
  assert.deepEqual(plain(row('uxv/alip_duct').itemsIn), [{ id: 'grindless:lasagna_plate', count: 1 }]);
  assert.equal(row('uxv/tetrataenite_lamination').itemsOut[0].count, 4);
  for (const r of hr) {
    assert.ok(r.fluidsIn.some((f) => f.id === 'minecraft:water') && r.fluidsOut.some((f) => f.id === 'gtceu:steam'), r.path);
    assert.ok(find(r.id), `${r.id} is in the recipe docs`);
  }
  const used = recipes.filter((r) => r.t === 'gtceu:hot_rolling').map((r) => JSON.stringify(r.j.inputs.item.filter((e) => JSON.stringify(e).includes('circuit'))));
  assert.equal(new Set(used).size, used.length, 'every hot_rolling row has its own circuit');
});

test('lathe, gear and encoder rows: the flexspline returns its swarf, the gear and the encoder take an era fluid and five items', () => {
  const lathe = row('uxv/gum_metal_flexspline');
  assert.deepEqual(plain(lathe.itemsOut.map((x) => x.id)), ['grindless:gum_metal_flexspline', 'grindless:gum_metal_blend']);
  assert.ok(find(lathe.id));
  for (const [p, out] of [['uxv_strain_wave_gear', 'grindless:uxv_strain_wave_gear'], ['tmr_encoder', 'grindless:tmr_encoder']]) {
    const r = row(p);
    assert.equal(r.itemsOut[0].id, out);
    assert.ok(r.itemsIn.length >= 5 && r.fluidsIn.some((f) => f.id === 'gtceu:he_6n'), p);
    assert.ok(find(r.id));
  }
  assert.ok(row('tmr_encoder').itemsIn.some((x) => x.id === 'grindless:mtj_die' && x.count === 2));
  assert.ok(row('tmr_encoder').itemsIn.some((x) => x.id === 'grindless:multipole_encoder_ring'));
  assert.ok(row('uxv_strain_wave_gear').itemsIn.some((x) => x.id === 'grindless:gum_metal_flexspline'));
});

test('the five parts: assembly lines researched on the UIV part, an era fluid and at least two domain inputs', () => {
  assert.deepEqual(plain(UP.parts.map((p) => p.name)), ['uxv_electric_motor', 'uxv_electric_pump', 'uxv_electric_piston', 'uxv_conveyor_module', 'uxv_robot_arm']);
  const domain = {
    uxv_electric_motor: ['strand_stator', 'tetrataenite_rotor'],
    uxv_electric_pump: ['alip_duct', 'strand_tape'],
    uxv_electric_piston: ['terfenol_d_rod', 'strand_tape'],
    uxv_conveyor_module: ['ni_mn_ga_crystal', 'strand_tape'],
    uxv_robot_arm: ['uxv_strain_wave_gear', 'tmr_encoder', 'gtceu:uxv_electric_piston'],
  };
  for (const p of UP.parts) {
    const r = find(`grindless:assembly_line/${p.name}`);
    assert.ok(r && r.t === 'gtceu:assembly_line', p.name);
    const text = JSON.stringify(r.j);
    assert.ok(text.includes(p.research) && p.research === 'gtceu:' + p.name.replace('uxv_', 'uiv_'), `${p.name} researched on its UIV part`);
    assert.ok(text.includes('gtceu:he_6n'), `${p.name} takes 6N helium`);
    for (const d of domain[p.name]) assert.ok(text.includes(d.includes(':') ? d : `grindless:${d}`), `${p.name} takes ${d}`);
    assert.ok(text.includes('circuits/uiv'));
    assert.ok(new Set(p.itemsIn.map((s) => s.replace(/^\d+x /, ''))).size >= 5, `${p.name}: at least five distinct inputs`);
  }
  assert.ok(JSON.stringify(find('grindless:assembly_line/uxv_electric_pump').j).includes('gtceu:sodium_potassium'));
});

test('only from: each produced id has its one producer here or in its older table', () => {
  const only = {
    'grindless:uxv_strain_wave_gear': 'grindless:assembler/uxv_strain_wave_gear',
    'grindless:tmr_encoder': 'grindless:assembler/tmr_encoder',
    'grindless:gum_metal_flexspline': 'grindless:lathe/uxv/gum_metal_flexspline',
    'grindless:gum_metal_blank': 'grindless:hot_rolling/uxv/gum_metal_blank',
    'grindless:alip_duct': 'grindless:hot_rolling/uxv/alip_duct',
    'grindless:encoder_ring': 'grindless:hot_rolling/uxv/encoder_ring',
    'grindless:tetrataenite_lamination': 'grindless:hot_rolling/uxv/tetrataenite_lamination',
    'grindless:tetrataenite_rotor': 'grindless:naquadria_magnets/tetrataenite_rotor',
    'grindless:multipole_encoder_ring': 'grindless:naquadria_magnets/multipole_encoder_ring',
    'grindless:strand_stator': 'grindless:magnet_winding/strand_stator',
    'grindless:strand_tape': 'grindless:coated_conductor/strand_tape',
  };
  for (const p of UP.parts) only['gtceu:' + p.name] = `grindless:assembly_line/${p.name}`;
  for (const [id, rid] of Object.entries(only)) assert.deepEqual(plain(producers(id).map((r) => r.i)), [rid], id);
});

test('older rows: tables carry them with a UXV-A8 reason and the next free circuit', () => {
  const mw = tables('magnet_works');
  // UXV-B3 appended strand_coil (c9) after A8's two rows, so A8's rows are now the two before the last one
  const a8 = mw.slice(-3, -1);
  assert.deepEqual(plain(a8.map((r) => [r.name, r.circuit, r.charge])), [['tetrataenite_rotor', 8, false], ['multipole_encoder_ring', 10, false]]);
  assert.deepEqual(plain(tables('hts_magnet_works').slice(-1).map((r) => [r.name, r.circuit, r.charge])), [['strand_stator', 6, true]]);
  assert.deepEqual(plain(tables('coated_conductor_line').slice(-1).map((r) => [r.name, r.circuit])), [['strand_tape', 4]]);
  for (const r of [...a8, ...tables('hts_magnet_works').slice(-1), ...tables('coated_conductor_line').slice(-1)]) assert.match(r._why, /^UXV-A8/, r.name);
  const rotor = mw.find((r) => r.name === 'tetrataenite_rotor');
  assert.deepEqual(plain(rotor.itemsIn), [{ id: 'grindless:tetrataenite_lamination', count: 4 }, { id: 'gtceu:tungsten_steel_rod', count: 1 }]);
  const ring = mw.find((r) => r.name === 'multipole_encoder_ring');
  assert.deepEqual(plain(ring.itemsIn.map((x) => x.id)), ['grindless:encoder_ring', 'gtceu:titanium_ring']);
  const stator = tables('hts_magnet_works').find((r) => r.name === 'strand_stator');
  assert.ok(stator.itemsIn.some((x) => x.id === 'gtceu:pasta_strand_single_wire') && stator.itemsIn.some((x) => x.id === 'grindless:tetrataenite_lamination'));
  const tape = tables('coated_conductor_line').find((r) => r.name === 'strand_tape');
  assert.deepEqual(plain(tape.itemsOut), [{ id: 'grindless:strand_tape', count: 4 }]);
  for (const id of ['grindless:naquadria_magnets/tetrataenite_rotor', 'grindless:naquadria_magnets/multipole_encoder_ring', 'grindless:magnet_winding/strand_stator', 'grindless:coated_conductor/strand_tape']) {
    assert.ok(find(id), `${id} is in the recipe docs`);
  }
});

test('hold rules: the A8 and tetrataenite rules are gone, and the pending EMI entries with them', () => {
  const rules = json('tools', 'analysis', 'tiers', 'obtain.json').obtain.classes;
  assert.ok(!rules.some((r) => /UXV \(A8\)/.test(r.era || '')), 'no A8 rule');
  assert.ok(!rules.some((r) => (r.materials || []).includes('tetrataenite') && /A8/.test(r.reason || '')), 'no tetrataenite rule');
  const emi = json('tools', 'analysis', 'emi_coverage.json');
  for (const s of ['grindless:gum_metal_billet', 'grindless:ni_mn_ga_crystal']) assert.ok(!(emi.pendingUses || []).some((p) => p.id === s), s);
  assert.ok(!(emi.pendingUses || []).some((p) => p.package === 'UXV-A8'), 'no pending use for A8');
  // the integrator holds W's SMES cell route for B4 (A8's strand tape waits for B4's pasta strand)
  assert.ok(!(emi.pendingRoutes || []).some((p) => /A8 (deletes|writes)/.test(p.reason || '')), 'no route waits for A8');
});

test('text: the EMI lines of the older rows in en_us and es_es', () => {
  const keys = ['gtceu.recipe.grindless_naquadria_magnets.tetrataenite_rotor', 'gtceu.recipe.grindless_naquadria_magnets.multipole_encoder_ring',
    'gtceu.recipe.grindless_magnet_winding.strand_stator', 'gtceu.recipe.grindless_coated_conductor.strand_tape'];
  for (const l of ['en_us', 'es_es']) for (const k of keys) assert.ok(run.lang[l][k], `${l} ${k}`);
  const en = Object.keys(run.lang.en_us).filter((k) => /^gtceu\.recipe\.grindless_(naquadria_magnets|magnet_winding|coated_conductor)/.test(k)).sort();
  const es = Object.keys(run.lang.es_es).filter((k) => /^gtceu\.recipe\.grindless_(naquadria_magnets|magnet_winding|coated_conductor)/.test(k)).sort();
  assert.deepEqual(en, es);
});
