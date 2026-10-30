// UIV-B4 (docs/eras/uiv.md, machines 21 and 22, line 35; "B4. Cygnus X-1"): the ergosphere probe bay, the Penrose engine, and the older rows the
// package appends. Static checks only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const json = (f) => JSON.parse(fs.readFileSync(path.join(tables, f), 'utf8'));
const T = json('cygnus.json');
const startup = read('startup_scripts', 'grindless', 'uiv', 'cygnus.js');
const server = read('server_scripts', 'grindless', 'uiv', 'cygnus.js');
const lang = read('client_scripts', 'grindless', 'uiv_cygnus_lang.js');
const by = (type, name) => {
  const r = T.types[type].recipes.find((x) => x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};
const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);

test('every row says UIV-B4, circuits are unique per type, and every row is a far row', () => {
  for (const [type, t] of Object.entries(T.types)) {
    const circuits = t.recipes.map((r) => r.circuit);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      assert.match(r._why, /^(UIV-B4|UXV-B1)/, r.name); // UXV-B1 appends the bay's c5 row
      assert.equal(r.site, true, `${type}/${r.name}`);
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
    }
  }
  assert.match(server, /recipe\.dimension\(CY\.site/);
  assert.match(startup, /CY\.site = 'grindless:cygnus_x1_orbit'/);
});

test('the bay has circuits 1-4 and the engine one drop at exactly 8 A of UIV for 2400 ticks', () => {
  assert.deepEqual(T.types.ergosphere_probing.recipes.map((r) => [r.name, r.circuit]), [['kerr_probe', 1], ['split_sled', 2], ['refit_sled', 3], ['sled_hull', 4], ['relay_seed', 5]]); // c5: UXV-B1
  const drop = by('penrose_extraction', 'penrose_drop');
  assert.equal(T.types.penrose_extraction.generator, true);
  assert.equal(drop.eut, 8 * 33554432);
  assert.equal(drop.duration, 2400);
  assert.deepEqual(ids(drop.itemsOut), ['grindless:recovered_half_sled']);
  assert.deepEqual(ids(drop.kept), ['grindless:kerr_chart']);
});

test('the refit loop: the engine returns a half-sled, the bay refits it; the half-sled is never a controller input', () => {
  assert.deepEqual(ids(by('ergosphere_probing', 'refit_sled').itemsIn).slice(0, 1), ['grindless:recovered_half_sled']);
  assert.deepEqual(ids(by('ergosphere_probing', 'refit_sled').itemsOut), ['grindless:split_charge_sled']);
  assert.deepEqual(ids(by('penrose_extraction', 'penrose_drop').itemsIn), ['grindless:split_charge_sled']);
  assert.ok(!/recovered_half_sled/.test(server.slice(server.indexOf('addControllers'))));
});

test('the probe makes Kerr probe data and keeps the data crystal', () => {
  const r = by('ergosphere_probing', 'kerr_probe');
  assert.deepEqual(ids(r.itemsIn), ['grindless:ergosphere_probe']);
  assert.deepEqual(ids(r.kept), ['grindless:data_crystal_5d']);
  assert.deepEqual(ids(r.itemsOut), ['grindless:kerr_probe_data']);
});

test('the engine is written final through lib/generators.js and both machines have the dynamo and bus parts', () => {
  assert.match(startup, /G\.generators\.configure\(builder, \{ maxParallels: 1, name: m\.name \}\)/);
  assert.match(startup, /\['energy_output', 1, 2\]/);
  assert.match(startup, /\['energy_input', 1, 2\]/);
  assert.match(startup, /uiv_wireless_dynamo_hatch_4a/);
});

test('the older rows: canister chain in the actinide, hot-cell and megabar tables, the ringdown record on Ganymede and at the edge', () => {
  const hot = json('hot_cell.json');
  const hrows = hot.recipes.filter((r) => /^UIV-B4/.test(r._why || ''));
  assert.equal(hrows.length, 1);
  assert.equal(hrows[0].circuit, 15);
  assert.deepEqual(ids(hrows[0].itemsOut), ['grindless:filled_waste_canister']);
  const mega = json('megabar.json');
  const mrows = Object.values(mega.types).flatMap((t) => t.recipes).filter((r) => /^UIV-B4/.test(r._why || ''));
  assert.equal(mrows.length, 1);
  assert.equal(mrows[0].circuit, 5);
  assert.deepEqual(ids(mrows[0].itemsOut), ['grindless:compacted_waste_canister']);
  assert.match(read('server_scripts', 'grindless', 'zpm', 'actinides.js'), /name: 'synroc_liner', circuit: 4/);
  assert.match(read('server_scripts', 'grindless', 'luv', 'ganymede.js'), /onGanymede\('gravitational_wave_astronomy', 'kerr_ringdown_record'\)\.circuit\(2\)/);
  assert.match(read('server_scripts', 'grindless', 'uv', 'edge.js'), /name: 'correlated_kerr_data', type: 'event_horizon_imaging', circuit: 2/);
});

test('every item has a texture, a name and two tooltips in en_us and es_es; every machine has three tooltips and an info page', () => {
  const names = [...startup.slice(startup.indexOf('CY.items'), startup.indexOf('CY.machines')).matchAll(/^\s{4}(\w+): \{ stack/gm)].map((m) => m[1]);
  assert.equal(names.length, 6);
  for (const n of names) {
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', n + '.png')), n);
    assert.ok(lang.includes(`['${n}', '`), n);
  }
  for (const m of ['ergosphere_probe_bay', 'penrose_engine']) {
    assert.ok(lang.includes(`grindless.machine.${m}.tooltip.0'`), m);
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', m + '.json')), m);
    for (const f of ['overlay_front', 'overlay_front_active', 'overlay_front_active_emissive']) {
      assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', m, f + '.png')), m + f);
    }
  }
});

test('every row has an EMI line (own types and the two older EMI tables)', () => {
  for (const [type, t] of Object.entries(T.types)) {
    for (const r of t.recipes.filter((x) => !/^UXV-B1/.test(x._why))) assert.ok(lang.includes(`gtceu.recipe.${t.dataKey}.${r.name}'`), `${type}/${r.name}`);
  }
  assert.ok(lang.includes("gtceu.recipe.grindless_hot_cell.waste_canister_fill'"));
  assert.ok(lang.includes("gtceu.recipe.grindless_megabar.canister_compaction'"));
});
