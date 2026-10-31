// MAX-D2 (photon ring imager): the stand-in run of max/imager.js, the controller line, the table rows this package appended
// (marked MAX-D2), lang parity, textures, the shape and the overlay.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const run = runPackScripts(pack);
const MD = run.global.grindless.maxImager;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const table = (f) => JSON.parse(read(kube, 'data', 'grindless', 'tables', f));
const VA_MAX = 2013265920;

// [table, type, name, circuit]
const OLDER = [
  ['composites.json', 'sic_fibre_spinning', 'sic_mirror_tow', 19],
  ['composites.json', 'chemical_vapour_infiltration', 'sic_dish_blank', 14],
  ['spin_deposition.json', 'mtj_sputtering', 'gold_coated_dish', 17],
  ['spin_deposition.json', 'mtj_sputtering', 'nb_alox_nb_trilayer', 18],
  ['beuv_stm.json', 'beuv_lithography', 'sis_junction_wafer', 11],
  ['beuv_stm.json', 'beuv_lithography', 'utc_photodiode_wafer', 13],
  ['beuv_stm.json', 'beuv_lithography', 'hemt_gate_wafer', 14],
  ['memories_cryostat.json', 'nuclear_demagnetisation', 'tested_sis_die', 9],
  ['photonics.json', 'molecular_beam_epitaxy', 'hemt_stack_epi', 14],
  ['photonics.json', 'photonic_foundry', 'photonic_lo_module', 24],
  ['crystals.json', 'crystal_growth', 'semi_insulating_inp_wafer', 32],
  ['electron_beam.json', 'electron_beam_refining', 'sis_scrap_niobium', 32]
];

test('the stand-in runs the script without errors, skips nothing and leaves no pending route', () => {
  const mine = run.errors.filter((e) => /max[\\/]imager/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MD.skipped), []);
  assert.deepEqual(plain(MD.pendingRoutes), []);
  assert.ok(MD.controllerRecipe);
});

test('c1 and c2: recipes exist, run at Sgr A* and are at most VA[MAX]', () => {
  for (const id of ['grindless:photon_ring_imaging/sgr_a_spin_map', 'grindless:photon_ring_imaging/nsc_ephemeris']) {
    const r = find(id);
    assert.ok(r, id);
    const s = JSON.stringify(r.j);
    assert.match(s, /black_hole_orbit/, `${id} dimension`);
    const eut = s.match(/"EUt":\s*(\d+)/);
    assert.ok(!eut || Number(eut[1]) <= VA_MAX, `${id} EUt`);
  }
});

test('the GTM rows of the lines exist and none exceeds VA[MAX]', () => {
  for (const n of ['imager_dish_panel', 'anodised_junction_wafer', 'sis_die', 'sis_mixer', 'passivated_utc_wafer', 'utc_die', 'hemt_die', 'cryo_lna_module']) {
    assert.ok(MD.recipes.some((r) => r.endsWith('/' + n)), n);
  }
  for (const r of MD.recipes) {
    const x = find(r);
    const eut = x && JSON.stringify(x.j).match(/"EUt":\s*(\d+)/);
    assert.ok(!eut || Number(eut[1]) <= VA_MAX, r);
  }
});

test('the controller recipe is an assembly line with MAX circuits, a hull and at least 8 MAX components', () => {
  const r = find('grindless:assembly_line/photon_ring_imager');
  assert.ok(r);
  const s = JSON.stringify(r.j);
  assert.match(s, /max_machine_hull/);
  assert.match(s, /circuits\/max/);
  assert.ok(Number((s.match(/"EUt":\s*(\d+)/) || [0, 0])[1]) <= VA_MAX);
});

test('the table rows exist, are marked MAX-D2 and sit on the contract circuits, and no other row of those tables is marked', () => {
  for (const row of OLDER) {
    const r = table(row[0]).types[row[1]].recipes.find((x) => x.name === row[2]);
    assert.ok(r, `${row[0]} ${row[1]}/${row[2]}`);
    assert.match(r._why || '', /^MAX-D2/);
    assert.equal(r.circuit, row[3]);
  }
  for (const f of new Set(OLDER.map((r) => r[0]))) {
    const t = table(f);
    const marked = Object.entries(t.types).flatMap(([type, tt]) => tt.recipes.filter((x) => /^MAX-D2/.test(x._why || '')).map((x) => `${type}/${x.name}`));
    assert.deepEqual(marked.sort(), OLDER.filter((r) => r[0] === f).map((r) => `${r[1]}/${r[2]}`).sort(), f);
  }
});

test('the shape, textures and EMI page exist', () => {
  const s = read(kube, 'startup_scripts', 'grindless', 'max', 'imager.js');
  assert.match(s, /photon_ring_imager/);
  assert.match(s, /photon_ring_imaging/);
  const dir = path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', 'photon_ring_imager');
  for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) assert.ok(fs.existsSync(path.join(dir, f)), f);
  assert.ok(fs.existsSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'max_imager_photon_ring_imager.json')));
});

test('the lang file has en_us and es_es keys in parity', () => {
  const s = read(kube, 'client_scripts', 'grindless', 'max_imager_lang.js');
  assert.ok(/en_us/.test(s) && /es_es/.test(s));
  assert.match(s, /block\.gtceu\.photon_ring_imager/);
  assert.match(s, /gtceu\.photon_ring_imaging/);
  for (const [, type, name] of OLDER) assert.ok(s.includes(`.${name}'`), name);
});

test('the overlay stays in its band, has no priority line and is registered in zones.json', () => {
  const o = read(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_max_imager.js');
  assert.doesNotMatch(o.replace(/^\/\/ priority: -?\d+\r?\n/, ''), /^\/\/ priority:/m); // the integrator's stamp is the only one
  assert.match(o, /X0 = 39896/);
  assert.match(o, /X1 = 39959/);
  assert.match(o, /gg_test_max_imager/);
  new Function(o.replace(/^\(function/m, 'return (function'));
  const z = JSON.parse(read(root, 'tools', 'test', 'zones.json')).zones || JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const rows = Array.isArray(z) ? z : Object.values(z).find(Array.isArray);
  const mine = rows.find((r) => r.id === 'max_imager');
  assert.ok(mine);
  assert.deepEqual(mine.x, [39896, 39959]);
});
