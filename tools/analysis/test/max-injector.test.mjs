// MAX-D4 (mass stream injector): the stand-in run of max/injector.js, the controller line, the L14 rows this package appended
// (marked MAX-D4), lang parity, textures, the shape and the overlay.
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
const MD = run.global.grindless.maxInjector;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const table = (f) => JSON.parse(read(kube, 'data', 'grindless', 'tables', f));
const VA_MAX = 2013265920;

test('the stand-in runs the script without errors, skips nothing and leaves no pending route', () => {
  const mine = run.errors.filter((e) => /max[\\/]injector/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MD.skipped), []);
  assert.deepEqual(plain(MD.pendingRoutes), []);
  assert.ok(MD.controllerRecipe);
});

test('c1 and c2: recipes exist, run at Sgr A* and are at most VA[MAX]; c1 takes 64 pellets and returns the spent ones', () => {
  for (const id of ['grindless:mass_stream_injection/stream_bundle', 'grindless:mass_stream_injection/pellet_recast']) {
    const r = find(id);
    assert.ok(r, id);
    const s = JSON.stringify(r.j);
    assert.match(s, /black_hole_orbit/, `${id} dimension`);
    const eut = s.match(/"EUt":\s*(\d+)/);
    assert.ok(!eut || Number(eut[1]) <= VA_MAX, `${id} EUt`);
  }
  const c1 = JSON.stringify(find('grindless:mass_stream_injection/stream_bundle').j);
  assert.match(c1, /spent_stream_pellet/);
  assert.match(c1, /cooled_exhaust/);
});

test('the GTM rows of the line exist and none exceeds VA[MAX]', () => {
  for (const n of ['turned_pellet_core', 'stream_pellet', 'stream_turn_casing', 'stream_bundle_block']) {
    assert.ok(MD.recipes.some((r) => r.endsWith('/' + n)), n);
  }
  for (const r of MD.recipes) {
    const x = find(r);
    const eut = x && JSON.stringify(x.j).match(/"EUt":\s*(\d+)/);
    assert.ok(!eut || Number(eut[1]) <= VA_MAX, r);
  }
});

test('the controller recipe is an assembly line with MAX circuits, a hull and at least 8 MAX components', () => {
  const r = find('grindless:assembly_line/mass_stream_injector');
  assert.ok(r);
  const s = JSON.stringify(r.j);
  assert.match(s, /max_machine_hull/);
  assert.match(s, /circuits\/max/);
  assert.ok(Number((s.match(/"EUt":\s*(\d+)/) || [0, 0])[1]) <= VA_MAX);
});

test('the older rows exist, are marked MAX-D4 and sit on the contract circuits', () => {
  const press = table('megabar.json').types.megabar_synthesis.recipes.find((x) => x.name === 'pellet_press');
  assert.ok(press);
  assert.match(press._why || '', /^MAX-D4/);
  assert.equal(press.circuit, 10);
  const marked = Object.entries(table('megabar.json').types).flatMap(([type, tt]) => tt.recipes.filter((x) => /^MAX-D4/.test(x._why || '')).map((x) => `${type}/${x.name}`));
  assert.deepEqual(marked, ['megabar_synthesis/pellet_press']);
  // the SRF row is a script row; c7 was taken, so it sits on c9, the only one
  const cold = read(kube, 'server_scripts', 'grindless', 'uv', 'cold.js');
  assert.match(cold, /name: 'pellet_jacket', type: 'srf_cavity', circuit: 9/);
  assert.equal((cold.match(/circuit: 9/g) || []).length, 1);
});

test('the shape, textures and EMI page exist', () => {
  const s = read(kube, 'startup_scripts', 'grindless', 'max', 'injector.js');
  assert.match(s, /mass_stream_injector/);
  assert.match(s, /mass_stream_injection/);
  const dir = path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', 'mass_stream_injector');
  for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) assert.ok(fs.existsSync(path.join(dir, f)), f);
  assert.ok(fs.existsSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'max_injector_mass_stream_injector.json')));
});

test('the lang file has en_us and es_es keys in parity', () => {
  const s = read(kube, 'client_scripts', 'grindless', 'max_injector_lang.js');
  assert.ok(/en_us/.test(s) && /es_es/.test(s));
  assert.match(s, /block\.gtceu\.mass_stream_injector/);
  assert.match(s, /gtceu\.mass_stream_injection/);
  assert.match(s, /grindless_megabar\.pellet_press/);
});

test('the overlay stays in its band, has no priority line and is registered in zones.json', () => {
  const o = read(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_max_injector.js');
  assert.doesNotMatch(o, /^\/\/ priority:/m); // the integrator's stamp is the only one
  assert.match(o, /X0 = 40216/);
  assert.match(o, /X1 = 40279/);
  assert.match(o, /gg_test_max_injector/);
  new Function(o.replace(/^\(function/m, 'return (function'));
  const z = JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const rows = Array.isArray(z) ? z : z.zones || Object.values(z).find(Array.isArray);
  const mine = rows.find((r) => r.id === 'max_injector');
  assert.ok(mine);
  assert.deepEqual(mine.x, [40216, 40279]);
});
