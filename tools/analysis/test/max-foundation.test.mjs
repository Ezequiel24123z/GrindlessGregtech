// MAX foundation (package MAX-F1, startup_scripts/grindless/max/foundation.js): every shared MAX id of docs/eras/max.md F1 is registered once
// with en_us and es_es names and there is no recipe. GTM registers every gtceu:max_* id (highTierContent on): tables/max_ids.json lists them and
// nothing of ours creates them. The horizon_strand cable is 16 A at V[MAX] with loss 1 (S0-3, never "lossless"). The two tier-14 places are
// data files published by max/travel.js with two relay_platforms rows; every item and block has its texture.
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
const short = (id) => id.slice(id.indexOf(':') + 1);
const ours = (f) => /(^|[\\/])max[\\/]foundation\.js$/.test(String(f));
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const json = (...p) => JSON.parse(read(...p));
const src = read('startup_scripts', 'grindless', 'max', 'foundation.js');
const code = src.replace(/^\s*\/\/.*$/gm, '');
const table = json('data', 'grindless', 'tables', 'max_ids.json');
const matOf = (key) => run.registry.materials.get(key) || run.registry.materials.get(short(key));
const got = run.global.grindless.maxFoundation;

const EXISTING = ['grindless:eu_yso_boule', 'grindless:mram_stack_wafer', 'grindless:hollow_core_fibre'];
const COMPONENTS = ['electric_motor', 'electric_pump', 'electric_piston', 'robot_arm', 'emitter', 'fluid_regulator', 'conveyor_module', 'sensor', 'field_generator']
  .map((n) => 'grindless:max_' + n);
const BLOCKS = ['max_optical_table_casing', 'membrane_roller_casing', 'geroch_drum_casing', 'stream_turn_casing', 'mirror_shell_segment',
  'stream_bundle_block', 'feeder_coil_casing'].map((n) => 'grindless:' + n);
const FLUIDS = { hot_flow_plasma: 'gas', filtered_hot_flow: 'gas', flux_loaded_frc: 'gas', cooled_exhaust: 'gas', sn_li_eutectic: 'liquid' };
const MAX_V = 2 ** 31 * 16 / 16; // V[MAX] = 2^31; the cable carries 16 A of it
const PLACES = { sgra: ['gcyr:black_hole_orbit', 'sgr_a_orbit', 14, 'hold_sgr_a', 'grindless:cygnus_x1_orbit'], nsc: ['grindless:nsc_belt', 'nsc_belt', 15, 'hold_nsc_belt', 'gcyr:black_hole_orbit'] };

const ITEMS = got.items;
const MATERIAL_KEYS = ['gtceu:horizon_strand', ...Object.keys(FLUIDS).map((n) => 'grindless:' + n)];

test('the stand-in runs the MAX foundation and its names without errors', () => {
  const mine = (e) => /(^|[\\/])max[\\/](foundation|travel)|max_foundation_lang/.test(String(e.file));
  const errs = run.errors.filter((e) => mine(e) && e.stage !== 'console.error');
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(run.errors.filter(mine), [], 'no console.error');
});

test('the id list is pinned: 258 items, 7 blocks, the strand and 5 fluids; nothing twice', () => {
  assert.equal(ITEMS.length, 258);
  assert.deepEqual([...got.blocks], BLOCKS);
  assert.deepEqual([...got.materials], MATERIAL_KEYS);
  assert.deepEqual([...got.existing], EXISTING);
  assert.equal(new Set([...ITEMS, ...BLOCKS, ...EXISTING]).size, ITEMS.length + BLOCKS.length + EXISTING.length, 'every id once');
  for (const id of COMPONENTS) assert.ok(ITEMS.includes(id), id);
  for (const id of EXISTING) assert.ok(!ITEMS.includes(id), `${id} stays its owner's`);
  assert.equal(got.ids.horizonStrand, 'gtceu:horizon_strand');
});

test('every F1 id is registered once by this script; the existing three and the parallel hatch are not', () => {
  for (const id of [...ITEMS, ...BLOCKS]) {
    assert.ok(run.registry.items.has(id), `${id} not registered`);
    assert.ok(ours(run.registry.items.get(id).file), `${id} is registered by another script`);
  }
  for (const key of MATERIAL_KEYS) {
    const mat = matOf(key);
    assert.ok(mat && ours(mat.file), `${key} is not a GT material of foundation.js`);
    const form = key === 'gtceu:horizon_strand' ? 'ingot' : FLUIDS[short(key)];
    assert.ok(mat.forms.has(form), `${key} lacks the ${form} form`);
    if (form !== 'ingot') assert.ok(run.registry.fluids.has('gtceu:' + short(key)), `${key} fluid not registered`);
  }
  for (const id of EXISTING) {
    const it = run.registry.items.get(id);
    assert.ok(it && !ours(it.file), `${id} stays registered by its owner`);
  }
  assert.ok(!code.includes('max_parallel_hatch'), 'grindless:max_parallel_hatch is M1\'s');
  assert.equal([...run.registry.machines.values()].filter((m) => !m.seeded && ours(m.file)).length, 0, 'F1 registers no machine');
});

test('no script of ours registers a gtceu:max_* id (GTM\'s), except M1\'s parallel hatch', () => {
  const bad = [];
  for (const reg of [run.registry.items, run.registry.machines]) {
    for (const [id, v] of reg) if (/^gtceu:max_/.test(id) && !v.seeded) bad.push(`${id} (${v.file})`);
  }
  assert.deepEqual(bad, []);
  assert.doesNotMatch(code, /'(gtceu:)?max_[a-z0-9_]+'/, 'foundation.js creates no GTM MAX id');
});

test('the strand is a 16 A cable at V[MAX] with loss 1 (S0-3); no recipe, no machine, no server script of F1', () => {
  assert.match(src, /cableProperties\(GTValues\.V\[MAXT\], 16, 1, false\)/);
  assert.match(src, /const MAXT = 14/);
  assert.equal(MAX_V, 2 ** 31);
  assert.match(src, /'gtceu:horizon_strand': \{ form: 'ingot'[^}]*cable: true/);
  assert.doesNotMatch(code, /lossless/i, 'the loss is 1, never "lossless"');
  assert.doesNotMatch(code, /ServerEvents|\.recipes\(|event\.recipes|GTCEuStartupEvents\.registry\('gtceu:(machine|recipe_type)'|tables\//, 'no recipe, machine or table');
  const mine = run.docs.recipes.recipes.filter((r) => /(^|[\\/])max[\\/](foundation|travel)\.js$/.test(String(run.recipeFiles.get(r.i))));
  assert.deepEqual(mine, [], 'no recipe from an F1 script');
  for (const f of ['foundation.js', 'travel.js']) assert.ok(!fs.existsSync(path.join(kube, 'server_scripts', 'grindless', 'max', f)), `no server max/${f}`);
});

test('tables/max_ids.json lists the 29 MAX ids, every F1 id and the circuits block', () => {
  assert.equal(table.max.length, 29);
  assert.equal(new Set(table.max).size, 29);
  for (const id of table.max) assert.match(id, /^gtceu:max_/);
  assert.deepEqual(table.foundation.items, [...ITEMS]);
  assert.deepEqual(table.foundation.blocks, [...BLOCKS]);
  assert.deepEqual(table.foundation.materials, MATERIAL_KEYS);
  assert.deepEqual(table.foundation.horizon_strand, ['gtceu:horizon_strand_ingot', 'gtceu:horizon_strand_single_wire', 'gtceu:horizon_strand_single_cable']);
  assert.deepEqual(table.foundation.fluids, Object.keys(FLUIDS).map((n) => 'gtceu:' + n));
  assert.deepEqual(table.ours.components, COMPONENTS);
  assert.deepEqual(table.ours.parallel_hatch, ['grindless:max_parallel_hatch']);
  assert.deepEqual(table.existing, EXISTING);
  assert.deepEqual(table.substages.names, ['max', 'max-sgra', 'max-nsc']);
  assert.deepEqual(table.places, { _why: table.places._why, sgra: 'gcyr:black_hole_orbit', nsc: 'grindless:nsc_belt' });
  const circuits = Object.entries(table.circuits).filter(([k]) => k !== '_why' && k !== 'gates');
  assert.ok(circuits.length >= 20);
  for (const [k, v] of circuits) assert.ok(Number.isInteger(v.first_free) && v.first_free >= 1, k);
  assert.equal(table.circuits.gates.first_free_after_opv, 14);
  assert.doesNotMatch(JSON.stringify(table), /"(itemsOut|fluidsOut|recipes)"/, 'an id table, not a recipe table');
});

test('names and both tooltip lines in en_us and es_es; materials named; es differs from en', () => {
  const problems = [];
  const keysOf = (id) => [`${BLOCKS.includes(id) ? 'block' : 'item'}.grindless.${short(id)}`, `tooltip.grindless.${short(id)}.0`, `tooltip.grindless.${short(id)}.1`];
  for (const lang of ['en_us', 'es_es']) {
    const L = run.lang[lang] || {};
    for (const id of [...ITEMS, ...BLOCKS]) for (const k of keysOf(id)) if (!L[k]) problems.push(`${lang} ${k}`);
    for (const key of MATERIAL_KEYS) {
      const k = `material.${key.split(':')[0]}.${short(key)}`;
      if (!L[k]) problems.push(`${lang} ${k}`);
    }
  }
  assert.deepEqual(problems, []);
  const en = run.lang.en_us; const es = run.lang.es_es;
  for (const id of [...ITEMS, ...BLOCKS]) assert.notEqual(es[keysOf(id)[0]], en[keysOf(id)[0]], id);
  for (const key of MATERIAL_KEYS) assert.notEqual(es[`material.${key.split(':')[0]}.${short(key)}`], en[`material.${key.split(':')[0]}.${short(key)}`], key);
});

test('the two places load at tier 14: dimension (nsc_belt), planet rows (no air), sky; no other tier-14 planet', () => {
  for (const [k, [world, file, , ,]] of Object.entries(PLACES)) {
    const pl = json('data', 'grindless', 'gcyr', 'planets', `${file}.json`);
    assert.equal(pl.rocket_tier, 14, k);
    assert.equal(pl.world, world, k);
    assert.equal(pl.orbit_world, world, k);
    assert.equal(pl.translation, `level.grindless.${file}`, k);
    assert.equal(pl.galaxy, 'gcyr:milky_way', k);
    assert.equal(pl.has_atmosphere, false, k);
    assert.equal(pl.has_oxygen, false, k);
    assert.equal(pl.solar_power, 0, k);
  }
  assert.deepEqual(json('data', 'grindless', 'dimension', 'nsc_belt.json'), { type: 'gcyr:space', generator: { type: 'gcyr:space' } });
  assert.ok(!fs.existsSync(path.join(kube, 'data', 'grindless', 'dimension', 'sgr_a_orbit.json')), 'Sgr A* is GCYR\'s own level');
  const sky = json('assets', 'grindless', 'gcyr', 'planet_assets', 'sky_renderers', 'nsc_belt.json');
  assert.equal(sky.world, 'grindless:nsc_belt');
  assert.ok(sky.sky_objects.length >= 3);
  for (const f of fs.readdirSync(path.join(kube, 'data', 'grindless', 'gcyr', 'planets'))) {
    if (json('data', 'grindless', 'gcyr', 'planets', f).rocket_tier === 14) assert.ok(Object.values(PLACES).some(([, file]) => f === `${file}.json`), f);
  }
});

test('max/travel.js publishes the places on global.grindless.maxTravel (tier 14); data only', () => {
  const T = JSON.parse(JSON.stringify(run.global.grindless.maxTravel));
  assert.equal(T.tier, 14);
  assert.equal(T.source, 'grindless:cygnus_x1_orbit');
  assert.deepEqual(Object.keys(T.places), Object.keys(PLACES));
  for (const [k, [world, , circuit, jump]] of Object.entries(PLACES)) {
    assert.equal(T.places[k].dimension, world, k);
    assert.equal(T.places[k].circuit, circuit, k);
    assert.equal(T.places[k].jump, jump, k);
  }
  for (const id of Object.values(T.ids)) assert.ok(ITEMS.includes(id), id);
  const travel = read('startup_scripts', 'grindless', 'max', 'travel.js').replace(/^\s*\/\/.*$/gm, '');
  assert.doesNotMatch(travel, /ServerEvents|StartupEvents|GTCEuStartupEvents|event\.create|\.recipes/, 'data only');
});

test('relay_platforms.json: the two MAX rows are appended, one jump each, Sgr A* from Cygnus X-1 and the belt from Sgr A*', () => {
  const plat = json('data', 'grindless', 'tables', 'relay_platforms.json').platforms;
  const mine = plat.filter((p) => Object.hasOwn(PLACES, p.place));
  assert.deepEqual(mine.map((p) => [p.place, p.jump, p.dimension, p.source, p.x, p.y, p.z]),
    Object.entries(PLACES).map(([k, [world, , , jump, source]]) => [k, jump, world, source, 64, 100, 64]));
  assert.deepEqual(plat.slice(-2), mine, 'appended after the OpV rows');
  assert.equal(new Set(plat.map((p) => p.jump)).size, plat.length, 'every jump once');
});

test('the places are named in en_us and es_es (level, dimension, planet)', () => {
  for (const lang of ['en_us', 'es_es']) {
    const L = run.lang[lang] || {};
    for (const [k, [, file]] of Object.entries(PLACES)) {
      for (const key of [`level.grindless.${file}`, `dimension.grindless.${file}`, `planet.grindless.${k}`]) assert.ok(L[key], `${lang} ${key}`);
    }
  }
  for (const [, [, file]] of Object.entries(PLACES)) assert.notEqual(run.lang.es_es[`dimension.grindless.${file}`], run.lang.en_us[`dimension.grindless.${file}`]);
});

test('every item and block has its texture and the generator draws exactly them', () => {
  const tex = (...p) => path.join(kube, 'assets', 'grindless', 'textures', ...p);
  for (const id of ITEMS) assert.ok(fs.existsSync(tex('item', `${short(id)}.png`)), `item/${short(id)}.png`);
  for (const id of BLOCKS) assert.ok(fs.existsSync(tex('block', 'max', `${short(id)}.png`)), `block/max/${short(id)}.png`);
  const gen = fs.readFileSync(path.join(root, 'tools', 'assets', 'Build-MaxFoundationTextures.ps1'), 'utf8');
  for (const id of BLOCKS) assert.ok(gen.includes(`'${short(id)}'`), `${short(id)} drawn by the generator`);
});

test('no priority line yet in the new MAX files (the integrator stamps them)', () => {
  for (const f of [['startup_scripts', 'grindless', 'max', 'foundation.js'], ['startup_scripts', 'grindless', 'max', 'travel.js'], ['client_scripts', 'grindless', 'max_foundation_lang.js']]) {
    const t = read(...f);
    assert.ok(!/^\/\/ priority:/m.test(t) || /^\/\/ priority: -?\d+$/m.test(t), f.join('/'));
  }
});
