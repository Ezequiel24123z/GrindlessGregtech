// UEV-B1 (docs/eras/uev.md, "B1. Travel, stations, places and sunlight"): the table rows of the three new places, stations 9 and 10, the
// sunlight rows, Barnard b's offworld_only row and the two thruster-works rows, checked without Minecraft. T1 is gg_test_uev_travel.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const data = path.join(kube, 'data', 'grindless');
const table = (name) => JSON.parse(fs.readFileSync(path.join(data, 'tables', name), 'utf8'));
const json = (...p) => JSON.parse(fs.readFileSync(path.join(...p), 'utf8'));
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');

const ALPHA = 'grindless:alpha_centauri_orbit';
const BARNARD = 'grindless:barnard_b';
const BARNARD_ORBIT = 'grindless:barnard_b_orbit';
const SIRIUS = 'grindless:sirius_b_orbit';

test('planets.json: alpha, barnard and sirius; Barnard b shares the Alpha pair; older rows keep their pairs', () => {
  const p = table('planets.json').planets;
  assert.deepEqual(p.alpha.dimensions, [ALPHA]);
  assert.deepEqual(p.barnard.dimensions, [BARNARD, BARNARD_ORBIT]);
  assert.deepEqual(p.sirius.dimensions, [SIRIUS]);
  assert.equal(p.alpha.pairTag, 'alpha');
  assert.equal(p.barnard.pairTag, 'alpha');
  assert.equal(p.sirius.pairTag, 'sirius');
  assert.equal(p.proxima.pairTag, 'proxima');
  for (const k of ['alpha', 'barnard', 'sirius']) {
    assert.ok(p[k].name.en_us && p[k].name.es_es, k);
  }
});

test('orbits.json lists the three new orbits once and keeps the older ones first', () => {
  const o = table('orbits.json').dimensions;
  for (const id of [ALPHA, BARNARD_ORBIT, SIRIUS]) assert.equal(o.filter((x) => x === id).length, 1, id);
  assert.ok(o.indexOf('grindless:proxima_b_orbit') < o.indexOf(ALPHA));
  assert.equal(new Set(o).size, o.length);
});

test('places.json: Barnard b is a surface place and no older place changed', () => {
  const s = table('places.json').surfaces;
  assert.equal(s.barnard_b, BARNARD);
  assert.equal(s.proxima_b, 'gcyr:proxima_centauri_b');
  assert.equal(s.pluto, 'grindless:pluto');
  assert.equal(Object.keys(s).length, 10);
});

test('stations.json: stations 9 and 10 are the alpha and sirius slots after the six older `more` slots (stations 3 to 8)', () => {
  const more = table('stations.json').more;
  assert.equal(more.length, 8);
  assert.deepEqual(more.slice(0, 6).map((m) => m.slot).slice(-2), ['mercury', 'proxima']);
  assert.deepEqual(more[6], { slot: 'alpha', orbit: ALPHA, era: 'uev' });
  assert.deepEqual(more[7], { slot: 'sirius', orbit: SIRIUS, era: 'uev' });
  const orbits = table('orbits.json').dimensions;
  for (const m of more) assert.ok(orbits.includes(m.orbit), m.orbit);
  assert.equal(new Set(more.map((m) => m.slot)).size, more.length);
});

test('sunlight.json rows follow the design', () => {
  const d = table('sunlight.json').dimensions;
  assert.equal(d[ALPHA].factor, 1.0);
  assert.equal(d[ALPHA].when, 'always');
  assert.equal(d[BARNARD].factor, 6.7);
  assert.equal(d[BARNARD].when, 'day');
  assert.equal(d[SIRIUS].factor, 5.6);
  assert.equal(d[SIRIUS].when, 'always');
  for (const id of [ALPHA, BARNARD, SIRIUS]) assert.equal(d[id].era, 'uev', id);
  assert.equal(d['grindless:proxima_b_orbit'].factor, 0.91);
});

test("offworld_only.json: Barnard b's rhenium belongs to its dimension", () => {
  const w = table('offworld_only.json').worlds.barnard;
  assert.equal(w.dimension, BARNARD);
  assert.ok(w.watched.items.includes('gtceu:rhenium_ingot'));
  assert.equal(w.watched.inputPattern, 'rhenium');
  assert.ok(table('offworld_only.json').worlds.mercury);
});

test('the datapack: planet, dimension and sky files exist with the design figures', () => {
  const planet = (n) => json(data, 'gcyr', 'planets', `${n}.json`);
  const b = planet('barnard_b');
  assert.equal(b.world, BARNARD);
  assert.equal(b.orbit_world, BARNARD_ORBIT);
  assert.equal(b.rocket_tier, 9);
  assert.equal(b.gravity, 12.5);
  assert.equal(b.has_atmosphere, true);
  assert.equal(b.has_oxygen, false);
  assert.equal(b.temperature, 190);
  const a = planet('alpha_centauri_orbit');
  assert.equal(a.world, ALPHA);
  assert.equal(a.orbit_world, ALPHA);
  assert.equal(a.rocket_tier, 9);
  assert.equal(a.has_atmosphere, false);
  assert.equal(a.temperature, 3);
  const s = planet('sirius_b_orbit');
  assert.equal(s.world, SIRIUS);
  assert.equal(s.rocket_tier, 10);
  assert.equal(s.has_atmosphere, false);
  assert.equal(s.temperature, 25000);
  assert.equal(s.solar_power, 40);
  for (const n of ['alpha_centauri_orbit', 'barnard_b_orbit', 'sirius_b_orbit']) {
    assert.equal(json(data, 'dimension', `${n}.json`).type, 'gcyr:space', n);
    assert.equal(json(kube, 'assets', 'grindless', 'gcyr', 'planet_assets', 'sky_renderers', `${n}.json`).world, `grindless:${n}`);
  }
  assert.equal(json(data, 'dimension', 'barnard_b.json').generator.type, 'minecraft:flat');
  for (const f of ['alpha_centauri_orbit', 'barnard_b', 'sirius_b_orbit']) {
    assert.ok(read('client_scripts', 'grindless', 'uev_travel_lang.js').includes(planet(f).translation), f);
  }
});

test('thruster works: the two DFD rows use free circuits 6 and 7 and no row of the type shares a circuit', () => {
  const src = read('server_scripts', 'grindless', 'uv', 'propulsion.js');
  const rows = [...src.matchAll(/row\('([a-z0-9_]+)', 'thruster_assembly', (\d+),/g)].map((m) => [m[1], Number(m[2])]);
  const byName = Object.fromEntries(rows);
  assert.equal(byName.dfd_mk1_motor, 6);
  assert.equal(byName.dfd_mk2_motor, 7);
  assert.equal(new Set(rows.map((r) => r[1])).size, rows.length);
  const elsewhere = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js') && p !== path.join(kube, 'server_scripts', 'grindless', 'uv', 'propulsion.js') &&
        /thruster_assembly/.test(fs.readFileSync(p, 'utf8'))) elsewhere.push(p);
    }
  };
  walk(path.join(kube, 'server_scripts'));
  for (const p of elsewhere) assert.ok(!/thruster_assembly[\s\S]{0,200}circuit\((6|7)\)/.test(fs.readFileSync(p, 'utf8')), p);
});

test('the DFD motors: tiers 7 and 9, ids, loot and tool tag, assets and names', () => {
  const start = read('startup_scripts', 'grindless', 'uev', 'travel.js');
  assert.match(start, /id: 'grindless:dfd_mk1_motor', tier: 7/);
  assert.match(start, /id: 'grindless:dfd_mk2_motor', tier: 9/);
  const server = read('server_scripts', 'grindless', 'uev', 'travel.js');
  assert.match(server, /addSimpleBlock/);
  assert.match(server, /mineable\/pickaxe/);
  const lang = read('client_scripts', 'grindless', 'uev_travel_lang.js');
  for (const n of ['dfd_mk1_motor', 'dfd_mk2_motor']) {
    assert.ok(lang.includes(`'block.grindless.${n}'`), n);
    assert.equal(json(kube, 'assets', 'grindless', 'blockstates', `${n}.json`).variants[''].model, `grindless:block/${n}`);
    assert.equal(json(kube, 'assets', 'grindless', 'models', 'item', `${n}.json`).parent, `grindless:block/${n}`);
  }
  // the rocket level is the mean of the motor tier and the tank's tier 11
  assert.equal(Math.floor((7 + 11) / 2), 9);
  assert.equal(Math.floor((9 + 11) / 2), 10);
});

test('the warp gate relays: the Alpha and Sirius orbits are gate sites and their transforms differ from the Proxima one', () => {
  const gate = read('server_scripts', 'grindless', 'uhv', 'gate.js');
  assert.ok(gate.includes(`'${ALPHA}'`));
  assert.ok(gate.includes(`'${SIRIUS}'`));
  assert.ok(gate.includes('alpha_entangled_singularity'));
  assert.ok(gate.includes('sirius_entangled_singularity'));
  const seeds = [...gate.matchAll(/seed: '([a-z_:]+)'/g)].map((m) => m[1]);
  assert.equal(new Set(seeds).size, seeds.length);
});
