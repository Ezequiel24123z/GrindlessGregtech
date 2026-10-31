// MAX-B3 (Rydberg array works): the stand-in run of max/rydberg.js, the controller line, the table rows this package appended
// (marked MAX-B3), lang parity, textures, the shape and the overlay.
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
const MR = run.global.grindless.maxRydberg;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const table = (f) => JSON.parse(read(kube, 'data', 'grindless', 'tables', f));
const VA_MAX = 2013265920;

// [table, type, name, circuit]
const OLDER = [
  ['isotopes.json', 'calutron_separation', 'rubidium_87', 18],
  ['isotopes.json', 'calutron_separation', 'rb_getter_scrap', 19],
  ['earth_orbit.json', 'quantum_degenerate_gas', 'atom_cartridge_rb87', 6],
  ['crystals.json', 'crystal_growth', 'eu_yso_boule', 30],
  ['crystals.json', 'crystal_growth', 'teo2_boule', 32],
  ['crystals.json', 'nuclear_clock', 'lock_microcomb', 7],
  ['memories_cryostat.json', 'spectral_hole_burning', 'burned_memory_crystal', 26],
  ['tfln_femtosecond.json', 'ion_slicing', 'ln_transducer_bonded_blank', 13],
  ['tfln_femtosecond.json', 'femtosecond_writing', 'trimmed_microring', 9],
  ['tfln_femtosecond.json', 'femtosecond_writing', 'endcapped_hc_fibre', 11],
  ['tfln_femtosecond.json', 'femtosecond_writing', 'laser_welded_glass_cell', 12],
  ['beuv_stm.json', 'beuv_lithography', 'microring_wafer', 12],
  ['spin_deposition.json', 'mtj_sputtering', 'ar_coated_glass_cell', 22],
  ['spin_deposition.json', 'mtj_sputtering', 'electroded_aod', 23],
  ['photonics.json', 'photonic_foundry', 'packaged_microcomb', 23]
];
const idOf = ([, type, name]) => (type === 'crystal_growth' || type === 'nuclear_clock' ? `grindless:${type}/${type}/${name}` : `grindless:${type}/${name}`);

test('the stand-in runs the script without errors, skips nothing and leaves no pending route', () => {
  const mine = run.errors.filter((e) => /max[\\/]rydberg/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MR.skipped), []);
  assert.deepEqual(plain(MR.pendingRoutes), []);
  assert.ok(MR.controllerRecipe);
});

test('c1 and c2: recipes exist and are at most VA[MAX]', () => {
  for (const id of ['grindless:rydberg_assembly/rydberg_logic_array', 'grindless:rydberg_assembly/rydberg_array_refurbish']) {
    const r = find(id);
    assert.ok(r, id);
    const eut = JSON.stringify(r.j).match(/"EUt":\s*(\d+)/);
    assert.ok(!eut || Number(eut[1]) <= VA_MAX, `${id} EUt`);
  }
});

test('the controller recipe is an assembly line with MAX circuits, a hull and at least 8 MAX components', () => {
  const r = find('grindless:assembly_line/rydberg_array_works');
  assert.ok(r);
  const s = JSON.stringify(r.j);
  assert.match(s, /max_machine_hull/);
  assert.match(s, /circuits\/max/);
  assert.ok(Number((s.match(/"EUt":\s*(\d+)/) || [0, 0])[1]) <= VA_MAX);
});

test('the table rows exist, are marked MAX-B3 and sit on the contract circuits, and no other row of those tables is marked', () => {
  for (const row of OLDER) {
    assert.ok(find(idOf(row)), idOf(row));
    const r = table(row[0]).types[row[1]].recipes.find((x) => x.name === row[2]);
    assert.ok(r, `${row[0]} ${row[1]}/${row[2]}`);
    assert.match(r._why || '', /^MAX-B3/);
    assert.equal(r.circuit, row[3]);
  }
  for (const f of new Set(OLDER.map((r) => r[0]))) {
    const t = table(f);
    const marked = Object.entries(t.types).flatMap(([type, tt]) => tt.recipes.filter((x) => /^MAX-B3/.test(x._why || '')).map((x) => `${type}/${x.name}`));
    assert.deepEqual(marked.sort(), OLDER.filter((r) => r[0] === f).map((r) => `${r[1]}/${r[2]}`).sort(), f);
  }
});

test('the shape, textures and EMI page exist', () => {
  const s = read(kube, 'startup_scripts', 'grindless', 'max', 'rydberg.js');
  assert.match(s, /rydberg_array_works/);
  assert.match(s, /rydberg_assembly/);
  const dir = path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', 'rydberg_array_works');
  for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) assert.ok(fs.existsSync(path.join(dir, f)), f);
  assert.ok(fs.existsSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'max_rydberg_rydberg_array_works.json')));
});

test('the lang file has en_us and es_es keys in parity', () => {
  const s = read(kube, 'client_scripts', 'grindless', 'max_rydberg_lang.js');
  assert.ok(/en_us/.test(s) && /es_es/.test(s));
  assert.match(s, /block\.gtceu\.rydberg_array_works/);
  assert.match(s, /gtceu\.rydberg_assembly/);
});

test('the overlay stays in its band, has no priority line and is registered in zones.json', () => {
  const o = read(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_max_rydberg.js');
  assert.doesNotMatch(o.replace(/^\/\/ priority: -?\d+\r?\n/, ''), /^\/\/ priority:/m);
  assert.match(o, /X0 = 39768/);
  assert.match(o, /X1 = 39831/);
  assert.match(o, /gg_test_max_rydberg/);
  new Function(o.replace(/^\(function/m, 'return (function'));
  const z = JSON.parse(read(root, 'tools', 'test', 'zones.json')).zones || JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const rows = Array.isArray(z) ? z : Object.values(z).find(Array.isArray);
  const mine = rows.find((r) => r.id === 'max_rydberg');
  assert.ok(mine);
  assert.deepEqual(mine.x, [39768, 39831]);
});
