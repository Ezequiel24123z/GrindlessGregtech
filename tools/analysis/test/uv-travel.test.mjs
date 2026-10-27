// UV B1: Neptune and Pluto, the seeds, stations five and six and the sunlight rows, checked against GCYR 0.2.9's planet codec.
//   - the two planet files carry exactly the fields of GCYR's Planet.DIRECT_CODEC (temperature inside the suit's 60-363 K), and their
//     worlds and orbits are the ids of tables/places.json, orbits.json and planets.json, each with a dimension file and an orbit sky;
//   - Neptune is rocket_tier 6 (elite motors + aerogel tanks, level 6) and Pluto 7 (elite motors + BNNT tanks, level 7); Proxima b stays 8;
//   - the far halves of the Neptune and Pluto AE2 pairs are made only in their orbit, with the place's first product as the catalyst;
//   - stations.json keeps LuV's and ZPM's slots and adds Neptune and Pluto orbit; sunlight has both rows (1.4 / AU^2).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { runServerScripts } from '../lib/kubejs_recipes_sandbox.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PACK = path.join(ROOT, 'pack');
const KJS = path.join(PACK, 'kubejs');
const read = (...p) => fs.readFileSync(path.join(KJS, ...p), 'utf8');
const json = (...p) => JSON.parse(read(...p));
const IDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/analysis/fixtures/luv-b1-travel-ids.json'), 'utf8'));

const ORBITS = json('data/grindless/tables/orbits.json');
const PLACES = json('data/grindless/tables/places.json').surfaces;
const PLANETS_TABLE = json('data/grindless/tables/planets.json');
const STATIONS = json('data/grindless/tables/stations.json');
const SUNLIGHT = json('data/grindless/tables/sunlight.json');
const NAMES = ['neptune', 'pluto'];
const planet = (name) => json('data/grindless/gcyr/planets', name + '.json');

const CODEC = {
  translation: 'string', galaxy: 'id', solar_system: 'id', world: 'id', orbit_world: 'id', parent_world: 'id?',
  rocket_tier: 'int', gravity: 'number', has_atmosphere: 'boolean', days_in_year: 'int', temperature: 'number',
  solar_power: 'int', has_oxygen: 'boolean', button_color: 'int',
};
const ID = /^[a-z0-9_.-]+:[a-z0-9_./-]+$/;
const rocketLevel = (motors, tanks) => Math.floor((Math.min(...motors) + Math.min(...tanks)) / 2);
const texture = (id) => path.join(KJS, 'assets', id.split(':')[0], id.split(':')[1]);

function startupTravel() {
  const created = [];
  const chain = (entry) => new Proxy({}, {
    get(_t, m) {
      return (...args) => { entry.calls[m] = args; return chain(entry); };
    },
  });
  const G = {};
  const ctx = vm.createContext({
    global: { grindless: G },
    StartupEvents: { registry(kind, fn) { fn({ create(id, type) { const e = { kind, id, type, calls: {} }; created.push(e); return chain(e); } }); } },
    Text: new Proxy({}, { get: () => (x) => x }),
  });
  vm.runInContext(read('startup_scripts/grindless/uv/travel.js'), ctx);
  return { G: JSON.parse(JSON.stringify(G)), created };
}

const OURS = /^grindless:/;
const OUR_FLUIDS = ['gtceu:neptune_helium'];

function serverTravel() {
  const items = new Set(IDS.items);
  const r = runServerScripts({
    packRoot: PACK,
    startup: ['kubejs/startup_scripts/grindless/lib/places.js', 'kubejs/startup_scripts/grindless/uv/foundation.js',
      'kubejs/startup_scripts/grindless/uv/travel.js'],
    scripts: ['kubejs/server_scripts/grindless/uv/travel.js'],
    recipes: {},
    items: (id) => items.has(id) || OURS.test(id),
    fluids: (id) => IDS.fluids.includes(id) || OUR_FLUIDS.includes(id),
    before(sandbox) { sandbox.global.grindless.tables = {}; },
  });
  return r;
}

test('the two planet files carry exactly GCYR 0.2.9 codec fields; Neptune is tier 6, Pluto tier 7, Proxima b tier 8', () => {
  for (const name of NAMES) {
    const p = planet(name);
    for (const [k, v] of Object.entries(p)) {
      assert.ok(k in CODEC, `${name}: unknown field ${k}`);
      const t = CODEC[k].replace('?', '');
      if (t === 'id') assert.match(v, ID, `${name}.${k}`);
      else if (t === 'int') assert.ok(Number.isInteger(v) && v >= 0 && v <= 2147483647, `${name}.${k}`);
      else assert.equal(typeof v, t, `${name}.${k}`);
    }
    for (const [k, t] of Object.entries(CODEC)) if (!t.endsWith('?')) assert.ok(k in p, `${name}: missing ${k}`);
    assert.equal(p.translation, 'level.grindless.' + name);
    assert.equal(p.world, 'grindless:' + name);
    assert.equal(p.orbit_world, 'grindless:' + name + '_orbit');
    assert.equal(p.has_oxygen, false);
    assert.ok(p.temperature >= 60 && p.temperature <= 363, `${name}: inside the suit's 60-363 K`);
    for (const id of [p.world, p.orbit_world]) {
      assert.deepEqual(json('data/grindless/dimension', id.split(':')[1] + '.json'),
        { type: 'gcyr:space', generator: { type: 'gcyr:space' } }, `dimension file for ${id}`);
    }
    assert.deepEqual(PLANETS_TABLE.planets[name].dimensions, [p.world, p.orbit_world]);
    assert.equal(PLANETS_TABLE.planets[name].pairTag, name);
    assert.equal(PLACES[name], p.world);
    assert.ok(ORBITS.dimensions.includes(p.orbit_world));
    const sky = json('assets/grindless/gcyr/planet_assets/sky_renderers', name + '_orbit.json');
    assert.equal(sky.world, p.orbit_world);
    for (const o of sky.sky_objects) {
      if (o.texture.startsWith('grindless:')) assert.ok(fs.existsSync(texture(o.texture)), o.texture);
      else assert.match(o.texture, /^gcyr:textures\/sky\/(sun|light|neptune)\.png$/, 'a texture GCYR 0.2.9 ships');
    }
  }
  assert.equal(planet('neptune').rocket_tier, 6);
  assert.equal(planet('pluto').rocket_tier, 7);
  assert.equal(json('data/gcyr/gcyr/planets/proxima_centauri_b.json').rocket_tier, 8);
  assert.ok(!fs.existsSync(path.join(KJS, 'data/gcyr/dimension/proxima_centauri_b_orbit.json')), 'Proxima b gets no orbit');
});

test('elite motors + aerogel tanks are level 6 (Neptune), + BNNT tanks level 7 (Pluto); a mixed build drops the level', () => {
  const { G } = startupTravel();
  const T = G.uvTravel;
  assert.equal(T.planets['grindless:neptune'].tank, 'grindless:aerogel_fuel_tank');
  assert.equal(T.planets['grindless:pluto'].tank, 'grindless:bnnt_fuel_tank');
  const zpm = read('startup_scripts/grindless/zpm/travel.js');
  assert.match(zpm, /aerogel: \{ id: 'grindless:aerogel_fuel_tank', typeId: 'grindless_aerogel', tier: 9/);
  const f1 = read('startup_scripts/grindless/uv/foundation.js');
  assert.match(f1, /bnnt_fuel_tank/);
  assert.match(f1, /tier: 11/);
  assert.equal(rocketLevel([3, 3, 3, 3], [9, 9]), 6);
  assert.equal(rocketLevel([3, 3, 3, 3], [11, 11]), 7);
  assert.equal(rocketLevel([3, 3, 3, 3], [11, 9]), 6, 'a mixed build takes the weakest tank');
  for (const name of NAMES) assert.equal(planet(name).rocket_tier, T.planets['grindless:' + name].tier);
  assert.ok(planet('pluto').rocket_tier > 6, 'level 6 does not reach Pluto');
  assert.ok(7 < json('data/gcyr/gcyr/planets/proxima_centauri_b.json').rocket_tier, 'level 7 does not reach Proxima b');
});

test('the seeds are registered with textures; each is made only in its orbit with its catalyst; the pairs carry the pairTag', () => {
  const { G: SG, created } = startupTravel();
  for (const id of Object.values(SG.uvTravel.seeds)) {
    const e = created.find((c) => c.id === id);
    assert.ok(e && e.kind === 'item', id);
    assert.ok(fs.existsSync(path.join(KJS, 'assets/grindless/textures/item', id.split(':')[1] + '.png')), id + ' texture');
    assert.ok(fs.existsSync(path.join(KJS, 'assets/emi/recipe/additions/grindless', 'uv_travel_' + id.split(':')[1] + '.json')), id + ' EMI page');
  }
  const { G, built, logs } = serverTravel();
  assert.deepEqual(logs.filter(([l]) => l === 'error').map(([, m]) => m), []);
  const T = G.uvTravel;
  assert.deepEqual(T.done, ['grindless:chemical_reactor/neptunian_quantum_seed', 'grindless:transform/neptunian_entangled_singularity',
    'grindless:chemical_reactor/plutonian_quantum_seed', 'grindless:transform/plutonian_entangled_singularity']);
  const calls = (b, m) => b.calls.filter(([n]) => n === m).map(([, ...a]) => a);
  const nep = built.find((b) => b.id === 'grindless:neptunian_quantum_seed');
  assert.deepEqual(calls(nep, 'notConsumableFluid'), [[{ fluid: 'gtceu:neptune_helium', amount: 1000 }]]);
  assert.deepEqual(calls(nep, 'notConsumable'), []);
  const plu = built.find((b) => b.id === 'grindless:plutonian_quantum_seed');
  assert.deepEqual(calls(plu, 'notConsumable'), [['grindless:sputnik_ice_core']]);
  for (const s of T.recipes.seeds) {
    const r = built.find((b) => b.id === s.builderId);
    assert.equal(r.type, 'gtceu:chemical_reactor');
    assert.deepEqual(calls(r, 'dimension'), [[PLANETS_TABLE.planets[s.planet].dimensions[1]]], `${s.seed}: only in its orbit`);
    assert.deepEqual(calls(r, 'itemInputs'), [['#forge:ender_pearls']]);
    assert.deepEqual(calls(r, 'inputFluids'), [[{ fluid: 'gtceu:helium_3', amount: 250 }]]);
    assert.deepEqual(calls(r, 'itemOutputs'), [[s.seed]]);
    const pair = built.find((b) => b.id === s.pair);
    assert.equal(pair.type, 'ae2:transform');
    assert.deepEqual(pair.json.ingredients, [{ item: 'ae2:singularity' }, { item: s.seed }]);
    assert.deepEqual(pair.json.result, { item: 'ae2:quantum_entangled_singularity', count: 2, nbt: { grindless_planet: s.planet } });
  }
});

test('the stations table keeps LuV\'s and ZPM\'s slots and adds Neptune and Pluto orbit; sunlight has their rows', () => {
  assert.equal(STATIONS.first, 'gcyr:overworld_orbit');
  assert.equal(STATIONS.second, 'grindless:io_orbit');
  assert.deepEqual(STATIONS.more, [
    { slot: 'saturn', orbit: 'grindless:saturn_orbit', era: 'zpm' },
    { slot: 'uranus', orbit: 'grindless:uranus_orbit', era: 'zpm' },
    { slot: 'neptune', orbit: 'grindless:neptune_orbit', era: 'uv' },
    { slot: 'pluto', orbit: 'grindless:pluto_orbit', era: 'uv' },
  ]);
  for (const s of STATIONS.more) assert.ok(ORBITS.dimensions.includes(s.orbit), s.orbit);
  for (const [orbit, au] of [['grindless:neptune_orbit', 30.1], ['grindless:pluto_orbit', 39.5]]) {
    const row = SUNLIGHT.dimensions[orbit];
    assert.equal(row.era, 'uv');
    assert.equal(row.when, 'always');
    assert.equal(row.distanceAU, au);
    assert.ok(Math.abs(row.factor - 1.4 / (au * au)) < 0.0001, `${orbit}: 1.4 / AU^2`);
  }
});

test('names exist in en_us and es_es for the planets, dimensions and seeds; the EMI pages have text in both', () => {
  const lang = read('client_scripts/grindless/uv_travel_lang.js');
  const [en, es] = lang.split("ClientEvents.lang('es_es'");
  const keys = [];
  for (const name of NAMES) keys.push(planet(name).translation, 'dimension.grindless.' + name, 'dimension.grindless.' + name + '_orbit', 'planet.grindless.' + name);
  for (const t of ['neptunian_quantum_seed', 'plutonian_quantum_seed']) keys.push('item.grindless.' + t, 'tooltip.grindless.' + t);
  for (const k of keys) {
    assert.ok(en.includes(`'${k}'`), `en_us ${k}`);
    assert.ok(es.includes(`'${k}'`), `es_es ${k}`);
  }
  const info = read('client_scripts/grindless/emi_info_lang.js');
  for (const t of ['neptunian_quantum_seed', 'plutonian_quantum_seed']) {
    assert.equal(info.split(`'emi.grindless.info.${t}.0'`).length - 1, 2, `${t}: en_us and es_es`);
  }
});
