// UIV-B1 (docs/eras/uiv.md "B1. Travel: the relay seed, the jump and the platforms"), no game needed. The pack's scripts run in the stand-in
// of lib/kubejs_static.mjs. T1 is gg_test_uiv_travel (tools/test/overlay/kubejs/server_scripts/gg_test_uiv_travel.js).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const data = path.join(kube, 'data', 'grindless');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const S = plain(run.global.grindless.starshot);
const T = plain(run.global.grindless.uivTravel);
const recipes = run.docs.recipes.recipes;
const table = (name) => JSON.parse(fs.readFileSync(path.join(data, 'tables', name), 'utf8'));
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const row = (name) => S.recipes.find((r) => r.name === name);
const recOf = (r) => recipes.find((x) => x.i === r.recipeId);
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const dimsOf = (r) => (r.j.recipeConditions || []).filter((c) => c.type === 'dimension').map((c) => c.dimension);
const VA_UV = 491520;

test('the stand-in runs the travel scripts without errors', () => {
  const errs = run.errors.filter((e) => /travel|starshot/.test(String(e.file)) && /uiv|starshot/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(S.clashes, []);
  assert.deepEqual(S.skipped, []);
});

test('the three items are registered here, with textures, names and tooltips', () => {
  for (const id of ['relay_seed', 'launched_relay_seed', 'ergosphere_probe']) {
    assert.ok(run.registry.items.has('grindless:' + id), id);
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', id + '.png')), id + ' texture');
  }
  assert.deepEqual(T.items, ['grindless:relay_seed', 'grindless:launched_relay_seed', 'grindless:ergosphere_probe']);
  const lang = read('client_scripts', 'grindless', 'uiv_travel_lang.js');
  assert.match(lang, /\['en_us', 'es_es'\]/);
  for (const id of ['relay_seed', 'launched_relay_seed', 'ergosphere_probe']) assert.ok(lang.includes(`['${id}',`), id);
});

test('starshot rows: starchip c3 and c4, launch c2 at the Moon; the older rows and circuits are unchanged', () => {
  const seed = row('relay_seed');
  assert.equal(seed.type, 'starchip');
  assert.equal(seed.circuit, 3);
  assert.deepEqual(seed.itemsIn, [{ id: 'grindless:starchip', count: 1 }, { id: 'grindless:degenerate_pellet', count: 1 }, { id: 'grindless:exotic_matter_cell', count: 1 }]);
  assert.deepEqual(seed.itemsOut, [{ id: 'grindless:relay_seed', count: 1 }]);
  const probe = row('ergosphere_probe');
  assert.equal(probe.type, 'starchip');
  assert.equal(probe.circuit, 4);
  assert.deepEqual(probe.itemsIn, [{ id: 'grindless:starchip', count: 1 }, { id: 'grindless:rad_hard_controller', count: 1 }]);
  assert.deepEqual(probe.itemsOut, [{ id: 'grindless:ergosphere_probe', count: 1 }]);
  const launch = row('relay_seed_launch');
  assert.equal(launch.type, 'laser_sail_launch');
  assert.equal(launch.circuit, 2);
  assert.deepEqual(dimsOf(recOf(launch)), ['gcyr:luna']);
  assert.deepEqual(launch.itemsIn, [{ id: 'grindless:relay_seed', count: 1 }]);
  assert.deepEqual(launch.itemsOut, [{ id: 'grindless:launched_relay_seed', count: 1 }]);
  // the launch module wears as starshot_probe's does
  const older = row('starshot_probe');
  assert.deepEqual(launch.chancedIn, older.chancedIn);
  assert.deepEqual(launch.chancedOut, older.chancedOut);
  assert.equal(launch.eut, older.eut);
  assert.equal(launch.amps, older.amps);
  for (const r of [seed, probe, launch]) {
    assert.ok(r.eut <= VA_UV && Number.isInteger(r.duration), r.name);
    assert.deepEqual(circuitOf(recOf(r)), [r.circuit], r.name);
  }
  assert.deepEqual(S.recipes.filter((r) => r.type === 'starchip').map((r) => r.circuit), [1, 2, 3, 4]);
  assert.deepEqual(S.recipes.filter((r) => r.type === 'laser_sail_launch').map((r) => r.circuit), [1, 2]);
  assert.equal(row('starchip').circuit, 1);
  assert.equal(row('sailcraft').circuit, 2);
  // the rad-hard controller, the pellet and the cell have their F1 makers (A10, UEV, UHV)
  for (const id of ['grindless:rad_hard_controller', 'grindless:degenerate_pellet', 'grindless:exotic_matter_cell']) {
    assert.ok(run.registry.items.has(id), id);
  }
});
