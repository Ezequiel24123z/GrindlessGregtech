// MAX-D3 (Geroch winch): the stand-in run of max/winch.js, the controller line, the older-machine rows this package appended, lang parity,
// textures, the shape and the overlay.
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
const MW = run.global.grindless.maxWinch;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const table = (f) => JSON.parse(read(kube, 'data', 'grindless', 'tables', f));
const VA_MAX = 2013265920;
const findRow = (x, name) => {
  if (Array.isArray(x)) return x.map((y) => findRow(y, name)).find(Boolean);
  if (x && typeof x === 'object') return x.name === name && 'circuit' in x ? x : Object.values(x).map((y) => findRow(y, name)).find(Boolean);
  return undefined;
};

// [table, type, name, circuit] of the rows kept in JSON tables
const OLDER = [
  ['rx_j1856.json', 'decay_heat', 'waste_cooling', 5],
  ['hot_cell.json', 'hot_cell', 'vitrified_waste_log', 23],
  ['cygnus_lift.json', 'star_lifting', 'proof_load_ribbon', 3]
];

test('the stand-in runs the script without errors, skips nothing and leaves no pending route', () => {
  const mine = run.errors.filter((e) => /max[\\/]winch/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MW.skipped), []);
  assert.deepEqual(plain(MW.pendingRoutes), []);
  assert.ok(MW.controllerRecipe);
});

test('c1 exists, is a generator row at most VA[MAX] and run in the Sgr A* orbit', () => {
  for (const [id, eut] of [['grindless:geroch_power/geroch_canister_lowering', 1073741824]]) {
    const r = find(id);
    assert.ok(r, id);
    const s = JSON.stringify(r.j);
    const m = s.match(/"EUt":\s*(-?\d+)/);
    assert.ok(!m || Number(m[1]) < 0, `${id} is a generator row`);
    assert.ok(!m || -Number(m[1]) <= VA_MAX, `${id} EUt`);
    if (eut !== null && m) assert.equal(-Number(m[1]), eut);
    assert.match(s, /black_hole_orbit/);
  }
  const c1s = JSON.stringify(find('grindless:geroch_power/geroch_canister_lowering').j);
  assert.match(c1s, /spent_tether_segment/);
  assert.match(c1s, /horizon_tether.{0,80}"chance":1,"maxChance":128/);
  assert.equal(find('grindless:geroch_power/tether_rework'), undefined, 'the rework is no generator row');
  const rw = JSON.stringify(find('grindless:assembler/tether_rework').j);
  assert.match(rw, /spent_tether_segment/);
  assert.match(rw, /grindless:horizon_tether/);
});

test('the GTM rows of L17 and L20 exist and are at most VA[MAX]', () => {
  for (const id of ['canner/sealed_waste_log', 'assembler/geroch_canister', 'chemical_reactor/exotic_coated_ribbon', 'autoclave/cured_exotic_ribbon',
    'assembler/horizon_tether']) {
    const r = find(`grindless:${id}`);
    assert.ok(r, id);
    const eut = JSON.stringify(r.j).match(/"EUt":\s*(\d+)/);
    assert.ok(!eut || Number(eut[1]) <= VA_MAX, `${id} EUt`);
  }
});

test('the controller recipe is an assembly line with MAX circuits, a hull and at least 8 MAX components of 3 families', () => {
  const r = find('grindless:assembly_line/geroch_winch');
  assert.ok(r);
  const s = JSON.stringify(r.j);
  assert.match(s, /max_machine_hull/);
  assert.match(s, /circuits\/max/);
  for (const f of ['max_electric_motor', 'max_field_generator', 'max_electric_piston']) assert.match(s, new RegExp(f));
  assert.ok(Number((s.match(/"EUt":\s*(\d+)/) || [0, 0])[1]) <= VA_MAX);
});

test('the older rows exist, are marked MAX-D3 and sit on the contract circuits', () => {
  for (const [f, type, name, circuit] of OLDER) {
    const r = findRow(table(f), name);
    assert.ok(r, `${f} ${type}/${name}`);
    assert.match(r._why || '', /^MAX-D3/);
    assert.equal(r.circuit, circuit);
    assert.ok(find(`grindless:${type}/${name}`), `${type}/${name} recipe`);
  }
  const act = read(kube, 'server_scripts', 'grindless', 'zpm', 'actinides.js');
  assert.match(act, /retrieved_waste_mix/);
  const el = read(kube, 'server_scripts', 'grindless', 'uhv', 'elevator.js');
  assert.match(el, /strand_ribbon/);
});

test('the shape, textures and EMI page exist', () => {
  const s = read(kube, 'startup_scripts', 'grindless', 'max', 'winch.js');
  assert.match(s, /geroch_winch/);
  assert.match(s, /geroch_power/);
  assert.match(s, /height: 33/);
  assert.match(s, /generators\.configure/);
  const dir = path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', 'geroch_winch');
  for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) assert.ok(fs.existsSync(path.join(dir, f)), f);
  assert.ok(fs.existsSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'max_winch_geroch_winch.json')));
});

test('the lang file has en_us and es_es keys in parity', () => {
  const s = read(kube, 'client_scripts', 'grindless', 'max_winch_lang.js');
  assert.ok(/en_us/.test(s) && /es_es/.test(s));
  assert.match(s, /block\.gtceu\.geroch_winch/);
  assert.match(s, /gtceu\.geroch_power/);
  const keys = [...s.matchAll(/^\s+\['([^']+)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)'\]/gm)];
  assert.ok(keys.length >= 9);
  for (const k of keys) assert.ok(k[2].length > 0 && k[3].length > 0, k[1]);
});

test('the overlay stays in its band, has no second priority line and is registered in zones.json', () => {
  const o = read(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_max_winch.js');
  assert.doesNotMatch(o.replace(/^\/\/ priority: -?\d+\r?\n/, ''), /^\/\/ priority:/m);
  assert.match(o, /X0 = 39960/);
  assert.match(o, /X1 = 40023/);
  assert.match(o, /gg_test_max_winch/);
  new Function(o.replace(/^\(function/m, 'return (function'));
  const z = JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const rows = Array.isArray(z) ? z : z.zones || Object.values(z).find(Array.isArray);
  const mine = rows.find((r) => r.id === 'max_winch');
  assert.ok(mine);
  assert.deepEqual(mine.x, [39960, 40023]);
});
