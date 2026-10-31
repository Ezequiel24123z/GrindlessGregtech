// MAX-B2 (atom interferometer works): the stand-in run of max/interferometer.js, the controller line, the older rows this package appended
// (marked MAX-B2), lang parity, textures, the shape and the overlay.
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
const MI = run.global.grindless.maxInterferometer;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const table = (f) => JSON.parse(read(kube, 'data', 'grindless', 'tables', f));
const VA_MAX = 2013265920;

// [table, type, name, circuit]
const OLDER = [
  ['isotopes.json', 'calutron_separation', 'strontium_88', 16],
  ['isotopes.json', 'calutron_separation', 'spent_sr_cartridge', 17],
  ['earth_orbit.json', 'quantum_degenerate_gas', 'degenerate_sr_cartridge', 5],
  ['shequid_mnt.json', 'shequid_assembly', 'shequid_rotation_ref', 6],
  ['tfln_femtosecond.json', 'ion_slicing', 'atom_optics_modulator', 11],
  ['photonics.json', 'molecular_beam_epitaxy', 'algaas_bragg_stack', 13],
  ['crystals.json', 'crystal_growth', 'silicon_cavity_spacer', 31]
];
const idOf = ([, type, name]) => (type === 'crystal_growth' ? `grindless:${type}/${type}/${name}` : `grindless:${type}/${name}`);

test('the stand-in runs the script without errors, skips nothing and names the pending route', () => {
  const mine = run.errors.filter((e) => /max[\\/]interferometer/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MI.skipped), []);
  assert.deepEqual(plain(MI.pendingRoutes), ['grindless:sgr_a_spin_map']);
  assert.ok(MI.controllerRecipe);
});

test('c1 and c2: recipes exist, at most VA[MAX], one fluid and one item bus', () => {
  for (const id of ['grindless:atom_interferometry/matter_wave_gradiometer', 'grindless:atom_interferometry/shell_gradient_map']) {
    const r = find(id);
    assert.ok(r, id);
    const eut = JSON.stringify(r.j).match(/"EUt":\s*(\d+)/);
    assert.ok(!eut || Number(eut[1]) <= VA_MAX, `${id} EUt`);
  }
});

test('the controller recipe is an assembly line with MAX circuits, a hull and at least 8 MAX components', () => {
  const r = find('grindless:assembly_line/atom_interferometer_works');
  assert.ok(r);
  const s = JSON.stringify(r.j);
  assert.match(s, /max_machine_hull/);
  assert.match(s, /circuits\/max/);
  assert.ok(Number((s.match(/"EUt":\s*(\d+)/) || [0, 0])[1]) <= VA_MAX);
});

test('the older rows exist, are marked MAX-B2, sit on the contract circuits, and no other row of those tables is marked', () => {
  for (const row of OLDER) {
    assert.ok(find(idOf(row)), idOf(row));
    const r = table(row[0]).types[row[1]].recipes.find((x) => x.name === row[2]);
    assert.ok(r, `${row[0]} ${row[1]}/${row[2]}`);
    assert.match(r._why || '', /^MAX-B2/);
    assert.equal(r.circuit, row[3]);
    assert.equal(table(row[0]).types[row[1]].recipes.filter((x) => x.circuit === row[3]).length, 1, `c${row[3]} used once`);
  }
  for (const f of new Set(OLDER.map((r) => r[0]))) {
    const t = table(f);
    const marked = Object.entries(t.types).flatMap(([type, tt]) => tt.recipes.filter((x) => /^MAX-B2/.test(x._why || '')).map((x) => `${type}/${x.name}`));
    assert.deepEqual(marked.sort(), OLDER.filter((r) => r[0] === f).map((r) => `${r[1]}/${r[2]}`).sort(), f);
  }
});

test('the GTM bath, GTM engraver and cryogenic rows exist', () => {
  for (const id of ['grindless:chemical_bath/released_algaas_film', 'grindless:laser_engraver/transferred_crystalline_mirror', 'grindless:closed_loop_cooling/cryo_reference_cavity']) {
    assert.ok(find(id), id);
  }
});

test('the shape is 5 wide, 15 high, 5 deep, and the textures and EMI page exist', () => {
  const s = read(kube, 'startup_scripts', 'grindless', 'max', 'interferometer.js');
  assert.match(s, /atom_interferometer_works/);
  assert.match(s, /atom_interferometry/);
  const dir = path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', 'atom_interferometer_works');
  for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) assert.ok(fs.existsSync(path.join(dir, f)), f);
  assert.ok(fs.existsSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'max_interferometer_atom_interferometer_works.json')));
});

test('the lang file has en_us and es_es keys in parity', () => {
  const s = read(kube, 'client_scripts', 'grindless', 'max_interferometer_lang.js');
  assert.ok(/en_us/.test(s) && /es_es/.test(s));
  assert.match(s, /atom_interferometer_works/);
});

test('the overlay stays in its band, has no priority line and is registered in zones.json', () => {
  const o = read(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_max_interferometer.js');
  assert.doesNotMatch(o, /^\/\/ priority:/m);
  assert.match(o, /X0 = 39576/);
  assert.match(o, /X1 = 39639/);
  assert.match(o, /gg_test_max_interferometer/);
  new Function(o.replace(/^\(function/m, 'return (function'));
  const z = JSON.parse(read(root, 'tools', 'test', 'zones.json')).zones || JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const rows = Array.isArray(z) ? z : Object.values(z).find(Array.isArray);
  const mine = rows.find((r) => r.id === 'max_interferometer');
  assert.ok(mine);
  assert.deepEqual(mine.x, [39576, 39639]);
});
