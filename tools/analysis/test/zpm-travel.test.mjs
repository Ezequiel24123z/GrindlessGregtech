// ZPM B1: Saturn and Uranus, the level 5 and 6 tanks, the seeds, the stations and the ablator, checked against GCYR 0.2.9's planet codec.
//   - the two planet files carry exactly the fields of GCYR's Planet.DIRECT_CODEC, and their worlds and orbits are the ids of
//     tables/places.json, orbits.json and planets.json, each with a dimension file;
//   - the naquadah (tier 7) and aerogel (tier 9) tanks are GCYR's KubeJS gcyr:fuel_tank: with elite motors (tier 3) they make level 5 and
//     level 6 (floor((motor + tank) / 2)), a mixed build drops the level; Proxima b is tier 8 and out of reach of both;
//   - the far halves of the Saturn and Uranus AE2 pairs are made only in their orbit; the stations table lists both orbits;
//   - the ablator mode makes the PICA heat shield and its ZPM-F1 (B1) hiding rule and groups are gone.
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
const NAMES = ['saturn', 'uranus'];
const planet = (name) => json('data/grindless/gcyr/planets', name + '.json');

const CODEC = {
  translation: 'string', galaxy: 'id', solar_system: 'id', world: 'id', orbit_world: 'id', parent_world: 'id?',
  rocket_tier: 'int', gravity: 'number', has_atmosphere: 'boolean', days_in_year: 'int', temperature: 'number',
  solar_power: 'int', has_oxygen: 'boolean', button_color: 'int',
};
const ID = /^[a-z0-9_.-]+:[a-z0-9_./-]+$/;
const rocketLevel = (motors, tanks) => Math.floor((Math.min(...motors) + Math.min(...tanks)) / 2);

function startupTravel() {
  const created = [];
  const chain = (entry) => new Proxy({}, {
    get(_t, m) {
      return (...args) => {
        if (m === 'item') { args[0](new Proxy({}, { get: () => () => {} })); }
        entry.calls[m] = args;
        return chain(entry);
      };
    },
  });
  const G = {};
  const ctx = vm.createContext({
    global: { grindless: G },
    StartupEvents: { registry(kind, fn) { fn({ create(id, type) { const e = { kind, id, type, calls: {} }; created.push(e); return chain(e); } }); } },
    Text: new Proxy({}, { get: () => (x) => x }),
  });
  vm.runInContext(read('startup_scripts/grindless/zpm/travel.js'), ctx);
  return { G: JSON.parse(JSON.stringify(G)), created };
}

const OURS = /^(grindless:|gtceu:(zpm_|naquadah|carbon_fibers))/;

function serverTravel() {
  const items = new Set(IDS.items);
  const asked = new Set();
  const r = runServerScripts({
    packRoot: PACK,
    startup: ['kubejs/startup_scripts/grindless/lib/places.js', 'kubejs/startup_scripts/grindless/zpm/travel.js'],
    scripts: ['kubejs/server_scripts/grindless/zpm/travel.js'],
    recipes: {},
    items: (id) => { asked.add(id); return items.has(id) || OURS.test(id); },
    fluids: (id) => IDS.fluids.includes(id),
    before(sandbox) { sandbox.global.grindless.tables = {}; },
  });
  return { ...r, asked };
}

test('the two planet files carry exactly GCYR 0.2.9 codec fields; Saturn is tier 5, Uranus tier 6, Proxima b tier 8', () => {
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
    assert.equal(p.world, 'grindless:' + name);
    assert.equal(p.orbit_world, 'grindless:' + name + '_orbit');
    assert.equal(p.has_oxygen, false);
    assert.ok(p.temperature >= 60 && p.temperature <= 363, `${name}: inside the suit's 60-363 K`);
    for (const id of [p.world, p.orbit_world]) {
      assert.ok(fs.existsSync(path.join(KJS, 'data/grindless/dimension', id.split(':')[1] + '.json')), `dimension file for ${id}`);
    }
    assert.deepEqual(PLANETS_TABLE.planets[name].dimensions, [p.world, p.orbit_world]);
    assert.equal(PLANETS_TABLE.planets[name].pairTag, name);
    assert.equal(PLACES[name], p.world);
    assert.ok(ORBITS.dimensions.includes(p.orbit_world));
    assert.ok(fs.existsSync(path.join(KJS, 'assets/grindless/gcyr/planet_assets/sky_renderers', name + '_orbit.json')), `${name} sky`);
  }
  assert.equal(planet('saturn').rocket_tier, 5);
  assert.equal(planet('uranus').rocket_tier, 6);
  assert.equal(json('data/gcyr/gcyr/planets/proxima_centauri_b.json').rocket_tier, 8);
});

test('naquadah and aerogel tanks are GCYR fuel tanks tier 7 and 9: elite motors make level 5 and 6, mixed builds drop the level', () => {
  const { G, created } = startupTravel();
  const want = { 'grindless:naquadah_fuel_tank': [7, 'grindless_naquadah'], 'grindless:aerogel_fuel_tank': [9, 'grindless_aerogel'] };
  for (const [id, [tier, typeId]] of Object.entries(want)) {
    const tank = created.find((e) => e.id === id);
    assert.ok(tank, id + ' registered');
    assert.equal(tank.kind, 'block');
    assert.equal(tank.type, 'gcyr:fuel_tank');
    assert.deepEqual(tank.calls.tier, [tier]);
    assert.deepEqual(tank.calls.typeId, [typeId]);
    assert.ok(tank.calls.fuelStorage[0] >= 16000);
    const model = tank.calls.model[0];
    const modelFile = path.join(KJS, 'assets', model.split(':')[0], 'models', model.split(':')[1] + '.json');
    assert.ok(fs.existsSync(modelFile), model);
    for (const tex of Object.values(JSON.parse(fs.readFileSync(modelFile, 'utf8')).textures)) {
      assert.ok(fs.existsSync(path.join(KJS, 'assets', tex.split(':')[0], 'textures', tex.split(':')[1] + '.png')), tex);
    }
  }
  assert.equal(rocketLevel([3, 3, 3, 3], [7, 7]), 5);
  assert.equal(rocketLevel([3, 3, 3, 3], [9, 9]), 6);
  assert.equal(rocketLevel([3, 3, 3, 3], [9, 7]), 5, 'a mixed build takes the weakest tank');
  assert.equal(rocketLevel([3, 3, 3, 3], [7, 5]), 4);
  assert.ok(planet('saturn').rocket_tier <= 5 && planet('uranus').rocket_tier > 5, 'level 5 does not reach Uranus');
  assert.ok(6 < json('data/gcyr/gcyr/planets/proxima_centauri_b.json').rocket_tier, 'neither reaches Proxima b');
  assert.ok(G.zpmTravel.tanks.naquadah && G.zpmTravel.tanks.aerogel);
});

test('the tank recipes and the AE2 seeds compose with registered ids; each seed is made only in its orbit', () => {
  const { G, built, logs } = serverTravel();
  assert.deepEqual(logs.filter(([l]) => l === 'error').map(([, m]) => m), []);
  const T = G.zpmTravel;
  assert.deepEqual(T.done, ['grindless:assembler/naquadah_fuel_tank', 'grindless:assembler/aerogel_fuel_tank',
    'grindless:chemical_reactor/saturnian_quantum_seed', 'grindless:transform/saturnian_entangled_singularity',
    'grindless:chemical_reactor/uranian_quantum_seed', 'grindless:transform/uranian_entangled_singularity']);
  const calls = (b, m) => b.calls.filter(([n]) => n === m).map(([, ...a]) => a);

  const naq = built.find((b) => b.id === 'grindless:naquadah_fuel_tank');
  assert.equal(naq.type, 'gtceu:assembler');
  assert.deepEqual(calls(naq, 'notConsumable'), [['grindless:saturn_transfer_chart']]);
  assert.deepEqual(calls(naq, 'itemOutputs'), [['1x grindless:naquadah_fuel_tank']]);
  const aero = built.find((b) => b.id === 'grindless:aerogel_fuel_tank');
  assert.deepEqual(calls(aero, 'notConsumable'), [['grindless:uranus_transfer_chart']]);
  assert.deepEqual(calls(aero, 'itemOutputs'), [['1x grindless:aerogel_fuel_tank']]);
  assert.ok(calls(aero, 'itemInputs').flat().includes('1x grindless:naquadah_fuel_tank'), 'the aerogel tank builds on the naquadah one');

  const want = { saturn: 'grindless:ring_ice_sample', uranus: 'grindless:ice_giant_atmosphere_sample' };
  for (const s of T.recipes.seeds) {
    const r = built.find((b) => b.id === s.builderId);
    assert.equal(r.type, 'gtceu:chemical_reactor');
    assert.deepEqual(calls(r, 'dimension'), [[PLANETS_TABLE.planets[s.planet].dimensions[1]]], `${s.seed}: only in its orbit`);
    assert.deepEqual(calls(r, 'itemInputs'), [[want[s.planet], '#forge:ender_pearls']]);
    assert.deepEqual(calls(r, 'inputFluids'), [[{ fluid: 'gtceu:helium_3', amount: 250 }]]);
    const pair = built.find((b) => b.id === s.pair);
    assert.equal(pair.type, 'ae2:transform');
    assert.deepEqual(pair.json.ingredients, [{ item: 'ae2:singularity' }, { item: s.seed }]);
    assert.deepEqual(pair.json.result.nbt, { grindless_planet: PLANETS_TABLE.planets[s.planet].pairTag });
  }
});

test('the stations table lists the Saturn and Uranus slots; sunlight has their rows', () => {
  assert.deepEqual(STATIONS.more, [
    { slot: 'saturn', orbit: 'grindless:saturn_orbit', era: 'zpm' },
    { slot: 'uranus', orbit: 'grindless:uranus_orbit', era: 'zpm' },
  ]);
  for (const s of STATIONS.more) assert.ok(ORBITS.dimensions.includes(s.orbit), s.orbit);
  assert.equal(SUNLIGHT.dimensions['grindless:saturn_orbit'].factor, 0.015);
  assert.equal(SUNLIGHT.dimensions['grindless:uranus_orbit'].factor, 0.0038);
});

test('names exist in en_us and es_es for the planets, dimensions, tanks and seeds', () => {
  const lang = read('client_scripts/grindless/zpm_travel_lang.js');
  const [en, es] = lang.split("ClientEvents.lang('es_es'");
  const keys = [];
  for (const name of NAMES) keys.push(planet(name).translation, 'dimension.grindless.' + name, 'dimension.grindless.' + name + '_orbit', 'planet.grindless.' + name);
  for (const t of ['naquadah_fuel_tank', 'aerogel_fuel_tank']) keys.push('block.grindless.' + t);
  for (const t of ['saturnian_quantum_seed', 'uranian_quantum_seed']) keys.push('item.grindless.' + t);
  for (const k of keys) {
    assert.ok(en.includes(`'${k}'`), `en_us ${k}`);
    assert.ok(es.includes(`'${k}'`), `es_es ${k}`);
  }
});

test('the ablator mode makes the PICA heat shield (circuit 5) and B1\'s hiding rule and groups are gone', () => {
  const recipes = read('server_scripts/grindless/launch_road/recipes.js');
  assert.match(recipes, /grindless:composite_curing\/pica_heat_shield/);
  assert.match(recipes, /circuit: 5/);
  assert.match(recipes, /itemsOut: \[\{ id: 'grindless:pica_heat_shield', n: 2 \}\]/);
  const obtain = fs.readFileSync(path.join(ROOT, 'tools/analysis/tiers/obtain.json'), 'utf8');
  assert.doesNotMatch(obtain, /"era": "ZPM \(B1\)"/);
  assert.ok(!read('data/grindless/tables/hidden_until.json').includes('"grindless:pica_heat_shield"'));
});
