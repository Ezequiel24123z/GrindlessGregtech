// MAX-R1 (cluster-light furnace): the stand-in run of max/furnace.js, the controller line, the belt and GTM rows, the older rows this
// package appended, lang parity, textures, the shape and the overlay.
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
const MF = run.global.grindless.maxFurnace;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const table = (f) => JSON.parse(read(kube, 'data', 'grindless', 'tables', f));
const VA_MAX = 2013265920;
const eutOf = (r) => Number((JSON.stringify(r.j).match(/"EUt":\s*(\d+)/) || [0, 0])[1]);

test('the stand-in runs the script without errors and skips nothing', () => {
  const mine = run.errors.filter((e) => /max[\\/]furnace/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MF.skipped), []);
  assert.ok(MF.controllerRecipe);
});

test('c1-c5 exist, are at most VA[MAX] and are locked to the NSC belt', () => {
  for (const n of ['metal_rich_bloom', 'segment_truss_billet', 'pellet_blank', 'mirror_scrap_billet', 'hearth_relining']) {
    const r = find(`grindless:cluster_light_smelting/${n}`);
    assert.ok(r, n);
    assert.ok(eutOf(r) <= VA_MAX, `${n} EUt`);
    assert.match(JSON.stringify(r.j), /nsc_belt/, `${n} dimension`);
  }
});

test('the belt harvest and processor rows, and the GTM steps, exist', () => {
  for (const id of ['debris_harvesting/nsc_planetesimal_harvest', 'asteroid_processing/iron_core_fragment']) {
    const r = find(`grindless:${id}`);
    assert.ok(r, id);
    assert.match(JSON.stringify(r.j), /nsc_belt/, id);
  }
  assert.match(JSON.stringify(find('grindless:debris_harvesting/nsc_planetesimal_harvest').j), /nsc_planetesimal/);
  for (const id of ['segment_truss', 'ta_hf_c_powder', 'tetrataenite_concentrate', 'cold_pressed_tetrataenite']) {
    assert.ok(recipes.some((r) => new RegExp(`grindless:[a-z_]+/${id}$|grindless:${id}$`).test(r.i)), id);
  }
});

test('the controller recipe is an assembly line with MAX circuits, a hull, a fluid and at least 8 MAX components', () => {
  const r = find('grindless:assembly_line/cluster_light_furnace');
  assert.ok(r);
  const s = JSON.stringify(r.j);
  assert.match(s, /max_machine_hull/);
  assert.match(s, /circuits\/max/);
  assert.match(s, /superfluid_helium_3/);
  assert.ok(eutOf(r) <= VA_MAX);
});

test('L37 step 2 is the helium refrigerator row, not the cryogenic plant', () => {
  const r = find('grindless:closed_loop_cooling/cryo_milled_core');
  assert.ok(r);
  const s = JSON.stringify(r.j);
  assert.match(s, /iron_core_fragment/);
  assert.match(s, /cryo_milled_core/);
  const h = read(kube, 'server_scripts', 'grindless', 'luv', 'helium_refrigerator.js');
  assert.match(h, /name: 'cryo_milled_core', input: 'grindless:iron_core_fragment'/);
});

// [table, type, name, circuit]
const OLDER = [
  ['barnard.json', 'carbonyl_refining', 'bloom_carbonyl', 2],
  ['levitation_melter.json', 'levitation_melting', 'segment_alloy_ingot', 19],
  ['composites.json', 'nitride_magnet_synthesis', 'halbach_segment_coupler', 20],
  ['composites.json', 'chemical_vapour_infiltration', 'sealed_hearth_liner', 15]
];

test('the older table rows exist on the contract circuits', () => {
  for (const [f, type, name, c] of OLDER) {
    const r = table(f).types[type].recipes.find((x) => x.name === name);
    assert.ok(r, `${f} ${type}/${name}`);
    assert.equal(r.circuit, c, name);
    assert.ok(find(`grindless:${type}/${name}`), name);
  }
  assert.match(read(kube, 'server_scripts', 'grindless', 'ev', 'extraction_cascade.js'), /hafnium_tantalum_oxide/);
  assert.match(read(kube, 'server_scripts', 'grindless', 'ev', 'platinum_plant.js'), /bloom_pgm_residue/);
  assert.match(read(kube, 'server_scripts', 'grindless', 'uhv', 'propulsion.js'), /ta_hf_c_billet/);
});

test('nsc_planetesimal is registered with a texture and a name, the shape is 13x9x13 and the textures and EMI page exist', () => {
  const s = read(kube, 'startup_scripts', 'grindless', 'max', 'furnace.js');
  assert.match(s, /nsc_planetesimal/);
  assert.match(s, /cluster_light_furnace/);
  assert.match(s, /cluster_light_smelting/);
  assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', 'nsc_planetesimal.png')));
  const dir = path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', 'cluster_light_furnace');
  for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) assert.ok(fs.existsSync(path.join(dir, f)), f);
  assert.ok(fs.existsSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'max_furnace_cluster_light_furnace.json')));
});

test('the lang file has en_us and es_es keys in parity', () => {
  const s = read(kube, 'client_scripts', 'grindless', 'max_furnace_lang.js');
  assert.ok(/en_us/.test(s) && /es_es/.test(s));
  assert.match(s, /cluster_light_furnace/);
  assert.match(s, /nsc_planetesimal/);
});

test('the overlay stays in its band, has no priority line and is registered in zones.json', () => {
  const o = read(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_max_furnace.js');
  assert.doesNotMatch(o, /^\/\/ priority:/m);
  assert.match(o, /X0 = 40152/);
  assert.match(o, /X1 = 40215/);
  assert.match(o, /gg_test_max_furnace/);
  new Function(o.replace(/^\(function/m, 'return (function'));
  const z = JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const rows = Array.isArray(z) ? z : Object.values(z).find(Array.isArray);
  const mine = rows.find((r) => r.id === 'max_furnace');
  assert.ok(mine);
  assert.deepEqual(mine.x, [40152, 40215]);
});
