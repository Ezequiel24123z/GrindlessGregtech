// LuV B1: the places, the level 4 tank and the bridges, checked against GCYR 0.2.9's planet codec and a native registry export.
//   - the five planet files carry exactly the fields of GCYR's Planet.DIRECT_CODEC (api/space/planet/Planet, pinned 0.2.9), and their
//     worlds and orbits are the ids of tables/places.json, tables/orbits.json and tables/planets.json, each with a dimension file;
//   - the tank is GCYR's KubeJS gcyr:fuel_tank at tier 5 and 16,000 mB, so elite motors + only these tanks make level 4 and reach every
//     LuV place but not Jupiter or Proxima b (both tier 5); a mixed build stays level 3 (spike S0-2, natively);
//   - every recipe composes with only ids of the native export (tools/analysis/fixtures/luv-b1-travel-ids.json) and A1's registrations;
//   - Io, Europa and Ganymede pairs carry planets.json's pairTag, made only on their place; the airless weather covers every new
//     dimension and Earth orbit; the B1 hiding rule is gone, the keycard stays hidden while the station flag is off.
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

const PLACES = json('data/grindless/tables/places.json').surfaces;
const ORBITS = json('data/grindless/tables/orbits.json');
const PLANETS_TABLE = json('data/grindless/tables/planets.json');
const STATIONS = json('data/grindless/tables/stations.json');
const NAMES = ['asteroid_belt', 'jupiter', 'io', 'europa', 'ganymede'];
const planet = (name) => json('data/grindless/gcyr/planets', name + '.json');

// GCYR 0.2.9 Planet.DIRECT_CODEC: field -> JSON type (parent_world is optionalFieldOf)
const CODEC = {
  translation: 'string', galaxy: 'id', solar_system: 'id', world: 'id', orbit_world: 'id', parent_world: 'id?',
  rocket_tier: 'int', gravity: 'number', has_atmosphere: 'boolean', days_in_year: 'int', temperature: 'number',
  solar_power: 'int', has_oxygen: 'boolean', button_color: 'int',
};
const ID = /^[a-z0-9_.-]+:[a-z0-9_./-]+$/;

// GCYR 0.2.9: floor((weakest motor tier + weakest tank tier) / 2); elite motor and tank are tier 3
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
  vm.runInContext(read('startup_scripts/grindless/luv/travel.js'), ctx);
  return { G: JSON.parse(JSON.stringify(G)), created };
}

function serverTravel() {
  const items = new Set(IDS.items);
  const asked = new Set();
  const r = runServerScripts({
    packRoot: PACK,
    startup: ['kubejs/startup_scripts/grindless/lib/places.js', 'kubejs/startup_scripts/grindless/luv/foundation.js',
      'kubejs/startup_scripts/grindless/luv/travel.js'],
    scripts: ['kubejs/server_scripts/grindless/luv/travel.js'],
    recipes: {},
    items: (id) => { asked.add(id); return items.has(id) || /^grindless:/.test(id); },
    fluids: (id) => IDS.fluids.includes(id),
    before(sandbox) { sandbox.global.grindless.tables = {}; },
  });
  return { ...r, asked };
}

test('the five planet files carry exactly GCYR 0.2.9 codec fields with valid types', () => {
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
    assert.equal(p.galaxy, 'gcyr:milky_way');
    assert.equal(p.solar_system, 'gcyr:solar_system');
    assert.equal(p.translation, 'level.grindless.' + name);
    assert.equal(p.world, 'grindless:' + name);
    assert.equal(p.orbit_world, 'grindless:' + name + '_orbit');
    assert.equal(p.has_oxygen, false);
    assert.ok(p.temperature >= 60 && p.temperature <= 363, `${name}: inside the suit's 60-363 K`);
  }
});

test('Jupiter is the tier 5 parent; its moons and the belt are tier 4; Proxima b is out of reach', () => {
  const jupiter = planet('jupiter');
  assert.equal(jupiter.rocket_tier, 5);
  assert.ok(!('parent_world' in jupiter), 'GCYR only gives planets with no parent a navigation button');
  for (const moon of ['io', 'europa', 'ganymede']) {
    assert.equal(planet(moon).parent_world, jupiter.world);
    assert.equal(planet(moon).rocket_tier, 4);
  }
  assert.ok(!('parent_world' in planet('asteroid_belt')));
  assert.equal(planet('asteroid_belt').rocket_tier, 4);
  assert.equal(json('data/gcyr/gcyr/planets/proxima_centauri_b.json').rocket_tier, 8);
});

test('every place id is shared: places.json, orbits.json, planets.json and a dimension file each', () => {
  const surfaces = { asteroid_belt: 'asteroid_belt', io: 'io', europa: 'europa', ganymede: 'ganymede' };
  for (const [key, name] of Object.entries(surfaces)) assert.equal(PLACES[key], planet(name).world);
  for (const name of NAMES) {
    assert.ok(ORBITS.dimensions.includes(planet(name).orbit_world), `${name} orbit in orbits.json`);
    for (const id of [planet(name).world, planet(name).orbit_world]) {
      assert.ok(fs.existsSync(path.join(KJS, 'data/grindless/dimension', id.split(':')[1] + '.json')), `dimension file for ${id}`);
    }
  }
  const P = PLANETS_TABLE.planets;
  const want = { belt: 'asteroid_belt', jupiter: 'jupiter', io: 'io', europa: 'europa', ganymede: 'ganymede' };
  for (const [key, name] of Object.entries(want)) {
    assert.deepEqual(P[key].dimensions, [planet(name).world, planet(name).orbit_world]);
    if (key === 'jupiter') assert.equal(P[key].pairTag, undefined, 'Jupiter keeps no pair');
    else assert.equal(P[key].pairTag, key);
  }
  const all = Object.values(P).flatMap((p) => p.dimensions);
  assert.equal(new Set(all).size, all.length, 'no dimension in two planets');
});

test('the cryogenic tank is GCYR\'s tier 5, 16,000 mB fuel tank: level 4 with elite motors, mixed builds stay level 3', () => {
  const { G, created } = startupTravel();
  const tank = created.find((e) => e.id === 'grindless:cryogenic_fuel_tank');
  assert.ok(tank, 'registered');
  assert.equal(tank.kind, 'block');
  assert.equal(tank.type, 'gcyr:fuel_tank');
  assert.deepEqual(tank.calls.tier, [5]);
  assert.deepEqual(tank.calls.fuelStorage, [16000]);
  assert.deepEqual(tank.calls.typeId, ['grindless_cryogenic']);
  assert.equal(G.luvTravel.tank.fuel * 2, 32000, 'two tanks: S0-2\'s measured 32,000 mB');
  const model = tank.calls.model[0];
  const modelFile = path.join(KJS, 'assets', model.split(':')[0], 'models', model.split(':')[1] + '.json');
  assert.ok(fs.existsSync(modelFile));
  for (const tex of Object.values(JSON.parse(fs.readFileSync(modelFile, 'utf8')).textures)) {
    assert.ok(fs.existsSync(path.join(KJS, 'assets', tex.split(':')[0], 'textures', tex.split(':')[1] + '.png')), tex);
  }
  const level = rocketLevel([3, 3, 3, 3], [5, 5]);
  assert.equal(level, 4);
  for (const name of NAMES) {
    assert.equal(level >= planet(name).rocket_tier, name !== 'jupiter', `${name}: reachable only below tier 5`);
  }
  assert.ok(level < json('data/gcyr/gcyr/planets/proxima_centauri_b.json').rocket_tier);
  assert.equal(rocketLevel([3, 3, 3, 3], [5, 3]), 3, 'one elite tank lowers the rocket to level 3');
  for (const [k, v] of Object.entries(G.luvTravel.planets)) {
    const name = k.split(':')[1];
    assert.equal(planet(name).rocket_tier, v.tier, k);
    if (v.places) assert.equal(PLACES[v.places], planet(name).world, k);
    assert.ok(PLANETS_TABLE.planets[v.planets], k);
  }
});

test('the travel recipes compose with only registered ids; seeds are made only on their place', () => {
  const { G, built, logs, asked } = serverTravel();
  assert.deepEqual(logs.filter(([l]) => l === 'error').map(([, m]) => m), []);
  for (const id of asked) assert.ok(IDS.items.includes(id) || id.startsWith('grindless:'), `asked an id outside the export: ${id}`);
  const A1 = runServerScripts({
    packRoot: PACK, scripts: [], recipes: {}, startup: ['kubejs/startup_scripts/grindless/luv/foundation.js'],
    before(sandbox) { sandbox.global.grindless.tables = {}; },
  }).G.luvFoundation;
  for (const id of asked) if (id.startsWith('grindless:')) {
    assert.ok(A1.items.includes(id) || A1.blocks.includes(id) || id === 'grindless:cryogenic_fuel_tank' || IDS.items.includes(id), id);
  }
  for (const [tag, members] of Object.entries(IDS.tags)) assert.ok(members.length > 0, tag);

  const T = G.luvTravel;
  assert.deepEqual(T.done, ['grindless:assembler/cryogenic_fuel_tank', 'grindless:assembler/station_truss_casing',
    'grindless:chemical_reactor/ionian_quantum_seed', 'grindless:transform/ionian_entangled_singularity',
    'grindless:chemical_reactor/europan_quantum_seed', 'grindless:transform/europan_entangled_singularity',
    'grindless:chemical_reactor/ganymedean_quantum_seed', 'grindless:transform/ganymedean_entangled_singularity']);

  const tank = built.find((b) => b.id === 'grindless:cryogenic_fuel_tank');
  assert.equal(tank.type, 'gtceu:assembler');
  const calls = (b, m) => b.calls.filter(([n]) => n === m).map(([, ...a]) => a);
  assert.deepEqual(calls(tank, 'itemInputs').flat(), ['1x gcyr:elite_fuel_tank', '6x #forge:plates/hsss', '8x #forge:plates/kapton_k', '1x gtceu:luv_electric_pump']);
  assert.deepEqual(calls(tank, 'notConsumable'), [['grindless:outer_system_chart']]);
  assert.deepEqual(calls(tank, 'EUt'), [[30720]]);
  assert.deepEqual(calls(tank, 'itemOutputs'), [['1x grindless:cryogenic_fuel_tank']]);

  const truss = built.find((b) => b.id === 'grindless:station_truss_casing');
  assert.deepEqual(calls(truss, 'itemOutputs'), [['2x grindless:station_truss_casing']]);
  assert.deepEqual(calls(truss, 'EUt'), [[1920]]);

  const want = { io: 'biomesoplenty:brimstone', europa: 'minecraft:blue_ice', ganymede: 'minecraft:tuff' };
  for (const s of T.recipes.seeds) {
    const r = built.find((b) => b.id === s.builderId);
    assert.equal(r.type, 'gtceu:chemical_reactor');
    assert.deepEqual(calls(r, 'dimension'), [[PLACES[s.place]]], `${s.seed}: only on ${s.place}`);
    assert.deepEqual(calls(r, 'itemInputs'), [[want[s.planet], '#forge:ender_pearls']]);
    assert.deepEqual(calls(r, 'inputFluids'), [[{ fluid: 'gtceu:helium_3', amount: 250 }]]);
    assert.deepEqual(calls(r, 'EUt'), [[480]]);
    assert.deepEqual(calls(r, 'duration'), [[200]]);
    const pair = built.find((b) => b.id === s.pair);
    assert.equal(pair.type, 'ae2:transform');
    assert.deepEqual(pair.json.ingredients, [{ item: 'ae2:singularity' }, { item: s.seed }]);
    assert.deepEqual(pair.json.result.nbt, { grindless_planet: PLANETS_TABLE.planets[s.planet].pairTag });
  }
});

test('names exist in en_us and es_es for the tank, the five planets and the ten dimensions', () => {
  const lang = read('client_scripts/grindless/luv_travel_lang.js');
  const [en, es] = lang.split("ClientEvents.lang('es_es'");
  const keys = ['block.grindless.cryogenic_fuel_tank', 'tooltip.grindless.cryogenic_fuel_tank.0', 'tooltip.grindless.cryogenic_fuel_tank.1'];
  for (const name of NAMES) keys.push(planet(name).translation, 'dimension.grindless.' + name, 'dimension.grindless.' + name + '_orbit');
  for (const key of Object.keys(PLANETS_TABLE.planets)) if (key !== 'earth' && PLANETS_TABLE.planets[key].name && /^(belt|jupiter|io|europa|ganymede)$/.test(key)) keys.push('planet.grindless.' + key);
  for (const k of keys) {
    assert.ok(en.includes(`'${k}'`), `en_us ${k}`);
    assert.ok(es.includes(`'${k}'`), `es_es ${k}`);
  }
});

test('airless weather covers every new dimension and Earth orbit, never Earth itself', () => {
  const ctx = { global: { grindless: { readJsonTable: (p) => JSON.parse(fs.readFileSync(path.join(PACK, p), 'utf8')) } }, ServerEvents: { tick() {} } };
  vm.createContext(ctx);
  vm.runInContext(read('server_scripts/grindless/space/airless_weather.js'), ctx);
  const dims = Array.from(ctx.global.grindless.airlessWeather.dimensions);
  for (const name of NAMES) for (const id of [planet(name).world, planet(name).orbit_world]) assert.ok(dims.includes(id), id);
  assert.ok(dims.includes('gcyr:overworld_orbit'));
  for (const id of ['minecraft:overworld', 'minecraft:the_nether', 'minecraft:the_end', 'grindless:void', 'grindless:flat']) assert.ok(!dims.includes(id), id);
  assert.equal(new Set(dims).size, dims.length);
});

test('B1\'s hiding rule is gone; the stations are on since S0-3 passed, and the keycard shows with its EMI page', () => {
  const obtain = fs.readFileSync(path.join(ROOT, 'tools/analysis/tiers/obtain.json'), 'utf8');
  const hidden = read('data/grindless/tables/hidden_until.json');
  assert.doesNotMatch(obtain, /"era": "LuV \(B1\)"/);
  for (const id of ['grindless:ionian_quantum_seed', 'grindless:europan_quantum_seed', 'grindless:ganymedean_quantum_seed', 'grindless:station_truss_casing', 'grindless:cryogenic_fuel_tank']) {
    assert.ok(!hidden.includes(`"${id}"`), `${id} is not hidden`);
  }
  // the belt seed is B5's (raw meteoric iron): it stays hidden exactly as long as meteoric iron does
  assert.equal(hidden.includes('"grindless:asteroid_quantum_seed"'), hidden.includes('"material":"meteoric_iron"'));
  assert.equal(STATIONS.enabled, true, 'S0-3 passed natively (travel spikes R14)');
  assert.equal(STATIONS.second, 'grindless:io_orbit', 'the tether\'s station');
  assert.equal(STATIONS.first, ORBITS.earth);
  assert.ok(STATIONS.second === null || ORBITS.dimensions.includes(STATIONS.second), 'second is null (B7\'s fallback) or an orbit');
  for (const id of STATIONS.pieces) assert.ok(IDS.items.includes(id), id);
  assert.equal(hidden.includes('"gcyr:keycard"'), !STATIONS.enabled, 'the keycard shows exactly when the stations do');
  assert.doesNotMatch(obtain, /"materials": \["gcyr:keycard"\]/);
  const page = json('assets/emi/recipe/additions/grindless/space_station.json');
  assert.ok(page.stacks.includes('item:gcyr:keycard'));
  assert.ok(fs.existsSync(path.join(KJS, 'server_scripts/grindless/luv/orbit_arrival.js')), 'the arrival assist ships with the stations');
});
