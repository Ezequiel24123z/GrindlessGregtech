// AF-X (issue #223; audit #207 rows M1-02 and M1-03): the Horizon Shard has a MAX recipe, and the last six places of the journey have an AE2
// pair, a planets.json row and a distinct seed.
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
const recipes = run.docs.recipes.recipes;
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const table = (f) => JSON.parse(read(kube, 'data', 'grindless', 'tables', f));
const VA_MAX = 2013265920;
const euIn = (r) => (((r.j.tickInputs || {}).eu || [])[0] || { content: 0 }).content;

const PLACES = {
  sgra: ['gcyr:black_hole_orbit', 'grindless:reconnection_plasmoid'],
  nsc: ['grindless:nsc_belt', 'grindless:metal_rich_bloom'],
  tarantula: ['grindless:tarantula_orbit', 'grindless:ni56_slug'],
  magellanic_stream: ['grindless:magellanic_stream', 'grindless:scoop_coil'],
  m31: ['grindless:m31_nucleus_orbit', 'grindless:p_nuclide_concentrate'],
  local_group_filament: ['grindless:local_group_filament', 'grindless:void_grown_diamond'],
};

test('the shard recipe runs without errors and is registered', () => {
  const errs = run.errors.filter((e) => /horizon_shard/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.equal(run.global.grindless.horizonShard.made, true);
});

test('the shard is made on the mirror shell at Sgr A*, at MAX power, from automated MAX inputs', () => {
  const r = recipes.find((x) => x.i === 'grindless:black_hole_bomb/horizon_shard');
  assert.ok(r, 'no shard recipe');
  assert.equal(r.t, 'gtceu:black_hole_bomb');
  assert.equal(euIn(r), VA_MAX);
  assert.match(JSON.stringify(r.j), /grindless:horizon_shard/);
  assert.match(JSON.stringify(r.j), /gcyr:black_hole_orbit/);
  const makers = recipes.filter((x) => JSON.stringify(x.j.outputs || {}).includes('grindless:horizon_shard'));
  assert.deepEqual(makers.map((x) => x.i), ['grindless:black_hole_bomb/horizon_shard']);
});

test('the shard tooltip says how it is made', () => {
  assert.match(read(kube, 'client_scripts', 'grindless', 'steam_horizon_lang.js'), /Made on the mirror shell/);
});

test('every one of the six places has a planets.json row with its own pair tag', () => {
  const planets = table('planets.json').planets;
  const tags = new Set();
  for (const [key, [dim]] of Object.entries(PLACES)) {
    assert.ok(planets[key], `planets.json has no ${key}`);
    assert.deepEqual(planets[key].dimensions, [dim], key);
    assert.equal(planets[key].pairTag, key);
    assert.ok(planets[key].name.en_us);
    tags.add(planets[key].pairTag);
  }
  assert.equal(tags.size, 6);
  const all = Object.values(planets).flatMap((p) => p.dimensions);
  assert.equal(new Set(all).size, all.length, 'a dimension sits in two planets');
});

test('gate.js carries one pair row per place, each with a seed no other pair uses', () => {
  const src = read(kube, 'server_scripts', 'grindless', 'uhv', 'gate.js');
  const seeds = [...src.matchAll(/seed: '([^']+)'/g)].map((m) => m[1]);
  assert.equal(new Set(seeds).size, seeds.length, 'a seed repeats');
  for (const [key, [, seed]] of Object.entries(PLACES)) {
    assert.match(src, new RegExp(`planet: '${key}', seed: '${seed}', name: '${key}_entangled_singularity'`));
  }
});

test('the stand-in builds an AE2 transform per place', () => {
  for (const key of Object.keys(PLACES)) {
    const r = recipes.find((x) => x.i === `grindless:transform/${key}_entangled_singularity`);
    assert.ok(r, `no transform for ${key}`);
    assert.match(JSON.stringify(r.j), new RegExp(`"grindless_planet":"${key}"`));
  }
});
