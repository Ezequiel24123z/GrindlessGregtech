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

const PLACES = { rx_j1856: [700000, 'rx_j1856'], psr_j0437: [3000000, 'psr_j0437'], cygnus_x1: [10000000, 'cygnus_x1'] };
const DIM = (k) => `grindless:${k}_orbit`;
const readJson = (...p) => JSON.parse(fs.readFileSync(path.join(...p), 'utf8'));

test('planets.json, orbits.json: three new places, own pair tags; older ids unchanged; stations.json does not grow', () => {
  const p = table('planets.json').planets;
  for (const k of Object.keys(PLACES)) {
    assert.deepEqual(p[k].dimensions, [DIM(k)], k);
    assert.equal(p[k].pairTag, k);
    assert.ok(p[k].name.en_us && p[k].name.es_es, k);
  }
  const olderTags = Object.entries(p).filter(([k]) => !PLACES[k]).map(([, v]) => v.pairTag);
  for (const k of Object.keys(PLACES)) assert.ok(!olderTags.includes(p[k].pairTag), k + ' pair tag is its own');
  assert.equal(p.sirius.pairTag, 'sirius');
  assert.deepEqual(p.barnard.dimensions, ['grindless:barnard_b', 'grindless:barnard_b_orbit']);
  const o = table('orbits.json').dimensions;
  assert.equal(o.indexOf('grindless:sirius_b_orbit'), 17, 'older orbits keep their order');
  // UXV-B1's Vela and Cas A orbits follow the three UIV places
  assert.deepEqual(o.slice(18, 18 + Object.keys(PLACES).length), Object.keys(PLACES).map(DIM));
  assert.equal(new Set(o).size, o.length);
  assert.ok(!o.some((x) => /black_hole/.test(x)), 'no black_hole_orbit');
  const more = table('stations.json').more;
  assert.equal(more.length, 8);
  assert.ok(!JSON.stringify(more).includes('uiv') && !more.some((m) => Object.keys(PLACES).some((k) => m.orbit === DIM(k))), 'UIV has no station');
  assert.equal(Object.keys(table('places.json').surfaces).length, 10, 'no surface place');
});

test('sunlight.json: three rows (RX 0, PSR 0, Cygnus 0.6), era uiv, always', () => {
  const d = table('sunlight.json').dimensions;
  assert.equal(d[DIM('rx_j1856')].factor, 0);
  assert.equal(d[DIM('psr_j0437')].factor, 0);
  assert.equal(d[DIM('cygnus_x1')].factor, 0.6);
  for (const k of Object.keys(PLACES)) {
    assert.equal(d[DIM(k)].when, 'always', k);
    assert.equal(d[DIM(k)].era, 'uiv', k);
    assert.match(d[DIM(k)].note, /^UIV-B1:/, k);
  }
  assert.equal(d['grindless:sirius_b_orbit'].factor, 5.6);
});

test('the datapack: dimension, planet (tier 11, no air, no gravity) and sky of each place; the figures of S0-3', () => {
  for (const [k, [temp]] of Object.entries(PLACES)) {
    assert.deepEqual(readJson(data, 'dimension', `${k}_orbit.json`), { type: 'gcyr:space', generator: { type: 'gcyr:space' } }, k);
    const pl = readJson(data, 'gcyr', 'planets', `${k}_orbit.json`);
    assert.equal(pl.rocket_tier, 11, k);
    assert.equal(pl.temperature, temp, k);
    assert.equal(pl.world, DIM(k));
    assert.equal(pl.orbit_world, DIM(k));
    assert.equal(pl.translation, `level.grindless.${k}_orbit`);
    assert.equal(pl.solar_system, `grindless:${k}`);
    assert.equal(pl.gravity, 0);
    assert.equal(pl.has_atmosphere, false);
    assert.equal(pl.has_oxygen, false);
    assert.equal(readJson(kube, 'assets', 'grindless', 'gcyr', 'planet_assets', 'sky_renderers', `${k}_orbit.json`).world, DIM(k), k + ' sky');
  }
  // no rocket offers a tier 11 place: UEV's tier 10 is the highest rocket, UIV's places are jump-only
  for (const f of fs.readdirSync(path.join(data, 'gcyr', 'planets'))) {
    const pl = readJson(data, 'gcyr', 'planets', f);
    if (pl.rocket_tier === 11) assert.ok(Object.keys(PLACES).some((k) => f === `${k}_orbit.json`), f);
  }
  assert.ok(!fs.existsSync(path.join(data, 'dimension', 'black_hole_orbit.json')));
});

test('the three jump rows, the relay pairs and the platform table', () => {
  const rows = table('gate.json').types.warp_gate.recipes.filter((r) => /^UIV-B1:/.test(r._why || ''));
  assert.deepEqual(rows.map((r) => [r.name, r.circuit]), [['hold_rx_j1856', 4], ['hold_psr_j0437', 5], ['hold_cygnus_x1', 6]]);
  for (const r of rows) {
    assert.equal(r.eut, 31457280, r.name);
    assert.equal(r.duration, 1200, r.name);
    assert.equal(r.site, 'sirius_b_orbit', r.name);
    assert.deepEqual(r.itemsOut, [], r.name);
    assert.deepEqual(r.kept, [{ id: 'grindless:pulsar_navigation_chart', count: 1 }], r.name);
    assert.ok(r.itemsIn.some((i) => i.id === 'grindless:launched_relay_seed'), r.name);
  }
  assert.deepEqual(rows[2].itemsIn.map((i) => i.id).sort(), ['grindless:launched_relay_seed', 'grindless:neutronium_pellet', 'grindless:pulsar_navigation_solution']);
  const WG = plain(run.global.grindless.warpGate);
  assert.deepEqual(WG.skipped || [], []);
  assert.deepEqual(WG.clashes || [], []);
  for (const k of ['rx_j1856', 'psr_j0437', 'cygnus_x1']) {
    assert.ok((WG.pairs || []).some((p) => p.id === `grindless:transform/${k}_entangled_singularity` && p.tag === k), k + ' relay pair');
  }
  const seeds = (WG.pairs || []).map((p) => p.seed);
  assert.equal(new Set(seeds).size, seeds.length, 'one seed per pair');
  const gate = read('server_scripts', 'grindless', 'uhv', 'gate.js');
  assert.match(gate, /SITES\.cygnus_x1_orbit = \['grindless:cygnus_x1_orbit'\]/);
  const plat = table('relay_platforms.json');
  assert.deepEqual(plat.platforms.filter((p) => !p.source).map((p) => [p.place, p.jump, p.dimension]), [
    ['rx_j1856', 'hold_rx_j1856', 'grindless:rx_j1856_orbit'],
    ['psr_j0437', 'hold_psr_j0437', 'grindless:psr_j0437_orbit'],
    ['cygnus_x1', 'hold_cygnus_x1', 'grindless:cygnus_x1_orbit']]);
  assert.equal(plat.platforms.length, 5, 'UXV-B1 appends two rows with a source');
  for (const p of plat.platforms.filter((x) => !x.source)) assert.ok(rows.some((r) => r.name === p.jump), p.place);
  assert.equal(plat.ring.machine, 'gtceu:warp_gate');
});

test('the jump rows have their EMI lines in en_us and es_es', () => {
  const lang = read('client_scripts', 'grindless', 'uiv_travel_lang.js');
  for (const n of ['hold_rx_j1856', 'hold_psr_j0437', 'hold_cygnus_x1']) {
    assert.ok(lang.includes(`'${n}'`), n);
  }
  assert.match(lang, /gtceu\.recipe\.' \+ [^\n]*|gtceu\.recipe\.grindless_warp_gate/);
});