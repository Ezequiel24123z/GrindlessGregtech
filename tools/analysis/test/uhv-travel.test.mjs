// UHV B1: Proxima b's orbit, stations seven and eight, the Mercury orbit seed, the sunlight rows and the lunar field's Proxima row.
//   - GCYR's Proxima b is overridden only in orbit_world (spike S0-3's path): rocket_tier 8, its world and gravity as GCYR ships them;
//     the orbit is a gcyr:space dimension of ours with a sky made of GCYR's own textures;
//   - planets.json, orbits.json and places.json list Proxima b; stations.json keeps the six older slots and adds Mercury and
//     Proxima b orbit (eight in all), each a known orbit;
//   - sunlight: Mercury orbit 1.4 / AU^2, Proxima b orbit and its day side 0.91 (a Sun-equivalent distance of 1.24 AU);
//   - the lunar solar field's Proxima row: a red-tuned array (not used up), the star-side biome on Proxima b, 273 EU/t per panel,
//     x0.65 of the Moon's 420 and 300 x 0.91;
//   - the Mercury orbit route of IV's Hermean seed: only in the orbit, the swarm segment not used up, no new item or pair.
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

const ORBITS = json('data/grindless/tables/orbits.json');
const PLACES = json('data/grindless/tables/places.json').surfaces;
const PLANETS = json('data/grindless/tables/planets.json').planets;
const STATIONS = json('data/grindless/tables/stations.json');
const SUNLIGHT = json('data/grindless/tables/sunlight.json').dimensions;
const PROXIMA = json('data/gcyr/gcyr/planets/proxima_centauri_b.json');
const ORBIT = 'grindless:proxima_b_orbit';

// GCYR 0.2.9's data/gcyr/gcyr/planets/proxima_centauri_b.json, as the jar ships it (rocket_tier 3; the pack's override already made it 8)
const GCYR_PROXIMA = {
  translation: 'level.gcyr.proxima_centauri_b', galaxy: 'gcyr:milky_way', solar_system: 'gcyr:proxima_centauri',
  world: 'gcyr:proxima_centauri_b', orbit_world: 'gcyr:proxima_centauri_b_orbit', rocket_tier: 3, gravity: 9.806,
  has_atmosphere: true, days_in_year: 11, temperature: 303, solar_power: 13, has_oxygen: true, button_color: 893717,
};

const calls = (b, m) => b.calls.filter(([n]) => n === m).map(([, ...a]) => a);

function startupTravel() {
  const G = {};
  vm.runInContext(read('startup_scripts/grindless/uhv/travel.js'), vm.createContext({ global: { grindless: G } }));
  return JSON.parse(JSON.stringify(G));
}

test('Proxima b keeps every field GCYR ships but the tier (8, already ours) and orbit_world, now our orbit; gravity is never claimed', () => {
  const diff = Object.keys({ ...GCYR_PROXIMA, ...PROXIMA }).filter((k) => JSON.stringify(PROXIMA[k]) !== JSON.stringify(GCYR_PROXIMA[k]));
  assert.deepEqual(diff, ['orbit_world', 'rocket_tier']);
  assert.equal(PROXIMA.orbit_world, ORBIT);
  assert.equal(PROXIMA.rocket_tier, 8, 'the level 8 rocket (UHV-A8)');
  const overlay = path.join(ROOT, 'tools/test/overlay/kubejs/data/gcyr/gcyr/planets/proxima_centauri_b.json');
  if (fs.existsSync(overlay)) assert.deepEqual(JSON.parse(fs.readFileSync(overlay, 'utf8')), PROXIMA, 'the bench overlay copy matches');
  assert.deepEqual(json('data/grindless/dimension/proxima_b_orbit.json'), { type: 'gcyr:space', generator: { type: 'gcyr:space' } });
  assert.ok(!fs.existsSync(path.join(KJS, 'data/gcyr/dimension/proxima_centauri_b_orbit.json')), 'GCYR\'s orbit id stays undefined');
  const sky = json('assets/grindless/gcyr/planet_assets/sky_renderers/proxima_b_orbit.json');
  assert.equal(sky.world, ORBIT);
  assert.ok(sky.sky_objects.length >= 2);
  for (const o of sky.sky_objects) assert.match(o.texture, /^gcyr:textures\/sky\/(sun|light|proxima_centauri|proxima_centauri_b)\.png$/, 'a texture GCYR 0.2.9 ships');
  const T = startupTravel().uhvTravel;
  assert.deepEqual(T.planet, { id: 'gcyr:proxima_centauri_b', planets: 'proxima', tier: 8, world: PROXIMA.world, orbit: ORBIT,
    dayBiome: 'gcyr:proxima_centauri_b_star_side' });
});

test('planets, orbits and places list Proxima b; existing dimension ids are unchanged', () => {
  assert.deepEqual(PLANETS.proxima.dimensions, ['gcyr:proxima_centauri_b', ORBIT]);
  assert.equal(PLANETS.proxima.pairTag, 'proxima');
  assert.ok(PLANETS.proxima.name.en_us && PLANETS.proxima.name.es_es);
  assert.ok(ORBITS.dimensions.includes(ORBIT));
  assert.ok(ORBITS.dimensions.includes('gcyr:mercury_orbit'));
  assert.equal(ORBITS.dimensions.filter((d) => d === ORBIT).length, 1);
  assert.equal(PLACES.proxima_b, 'gcyr:proxima_centauri_b');
  assert.equal(new Set(Object.values(PLACES)).size, Object.values(PLACES).length, 'places are unique');
  assert.ok(PLANETS.mercury.dimensions.includes('gcyr:mercury_orbit'), 'the Mercury pairTag covers its orbit');
});

test('stations: the six older slots are unchanged, seven and eight are Mercury and Proxima b orbit', () => {
  assert.equal(STATIONS.first, 'gcyr:overworld_orbit');
  assert.equal(STATIONS.second, 'grindless:io_orbit');
  assert.deepEqual(STATIONS.more.map((s) => s.orbit), ['grindless:saturn_orbit', 'grindless:uranus_orbit', 'grindless:neptune_orbit',
    'grindless:pluto_orbit', 'gcyr:mercury_orbit', ORBIT]);
  assert.deepEqual(STATIONS.more.filter((s) => s.era === 'uhv'), [
    { slot: 'mercury', orbit: 'gcyr:mercury_orbit', era: 'uhv' },
    { slot: 'proxima', orbit: ORBIT, era: 'uhv' },
  ]);
  for (const s of STATIONS.more) assert.ok(ORBITS.dimensions.includes(s.orbit), s.orbit);
  const T = startupTravel().uhvTravel;
  assert.deepEqual(T.stations.map((s) => s.orbit), ['gcyr:mercury_orbit', ORBIT]);
});

test('sunlight: Mercury orbit 1.4 / AU^2; Proxima b orbit always and its day side 0.91', () => {
  const mo = SUNLIGHT['gcyr:mercury_orbit'];
  assert.equal(mo.era, 'uhv');
  assert.equal(mo.when, 'always');
  assert.ok(Math.abs(mo.factor - 1.4 / (0.387 * 0.387)) / mo.factor < 0.01, 'Mercury orbit: 1.4 / AU^2');
  assert.deepEqual([SUNLIGHT[ORBIT].factor, SUNLIGHT[ORBIT].when, SUNLIGHT[ORBIT].era], [0.91, 'always', 'uhv']);
  const px = SUNLIGHT['gcyr:proxima_centauri_b'];
  assert.deepEqual([px.factor, px.when, px.era], [0.91, 'day', 'uhv']);
  const T = startupTravel().uhvTravel;
  for (const [dim, f] of Object.entries(T.sunlight)) assert.equal(SUNLIGHT[dim].factor, f, dim);
});

test('the lunar field\'s Proxima row: red-tuned array, star-side biome on Proxima b, 273 EU/t per panel; the Moon and Mars rows stay', () => {
  const r = runServerScripts({
    packRoot: PACK,
    startup: ['kubejs/startup_scripts/grindless/ev/lunar_power_and_antenna.js'],
    scripts: ['kubejs/server_scripts/grindless/ev/lunar_power_and_antenna.js'],
    recipes: {},
    before(sandbox) { sandbox.global.grindless.generators = { modifier: () => null, display: () => null }; },
  });
  // the sandbox has no event.shapeless (the chart copy recipe, after the solar rows): that one error is the stand-in's, not the script's
  assert.deepEqual(r.logs.filter(([l, m]) => l === 'error' && !/event\.shapeless is not a function/.test(m)).map(([, m]) => m), []);
  const solar = r.built.filter((b) => b.type === 'gtceu:lunar_solar');
  assert.deepEqual(solar.map((b) => b.id), ['grindless:moon', 'grindless:mars', 'grindless:proxima']);
  const px = solar[2];
  assert.deepEqual(calls(px, 'notConsumable'), [['grindless:red_tuned_solar_array']]);
  assert.deepEqual(calls(px, 'dimension'), [['gcyr:proxima_centauri_b']]);
  assert.deepEqual(calls(px, 'biome'), [['gcyr:proxima_centauri_b_star_side']]);
  assert.deepEqual(calls(px, 'daytime'), [], 'GCYR fixes Proxima b at midnight: no daytime check');
  assert.deepEqual(calls(px, 'EUt'), [[-273]]);
  assert.ok(calls(px, 'addDataString').some((a) => a[1] === 'proxima_day'));
  assert.equal(273, Math.round(420 * 0.65));
  assert.equal(273, Math.round(300 * SUNLIGHT['gcyr:proxima_centauri_b'].factor));
  assert.ok(r.G.lunarPower.recipes.solar.includes('grindless:lunar_solar/proxima'));
  for (const b of solar.slice(0, 2)) assert.deepEqual(calls(b, 'biome'), [], b.id + ' unchanged');
});

test('the Mercury orbit route: IV\'s Hermean seed, only in Mercury orbit, the swarm segment not used up', () => {
  const r = runServerScripts({
    packRoot: PACK,
    startup: ['kubejs/startup_scripts/grindless/uhv/travel.js'],
    scripts: ['kubejs/server_scripts/grindless/uhv/travel.js'],
    recipes: {},
    fluids: (id) => id === 'gtceu:helium_3',
    items: (id) => /^(grindless|minecraft):/.test(id),
  });
  assert.deepEqual(r.logs.filter(([l]) => l === 'error').map(([, m]) => m), []);
  assert.deepEqual(r.G.uhvTravel.done, ['grindless:chemical_reactor/hermean_quantum_seed_orbit']);
  const seed = r.built.find((b) => b.id === 'grindless:hermean_quantum_seed_orbit');
  assert.equal(seed.type, 'gtceu:chemical_reactor');
  assert.deepEqual(calls(seed, 'dimension'), [['gcyr:mercury_orbit']]);
  assert.deepEqual(calls(seed, 'itemInputs'), [['#forge:ender_pearls']]);
  assert.deepEqual(calls(seed, 'notConsumable'), [['grindless:swarm_segment']]);
  assert.deepEqual(calls(seed, 'inputFluids'), [[{ fluid: 'gtceu:helium_3', amount: 250 }]]);
  assert.deepEqual(calls(seed, 'itemOutputs'), [['grindless:hermean_quantum_seed']]);
  assert.deepEqual([calls(seed, 'EUt'), calls(seed, 'duration')], [[[480]], [[200]]]);
  const iv = read('startup_scripts/grindless/iv/travel_network.js');
  assert.match(iv, /recipe: 'grindless:chemical_reactor\/hermean_quantum_seed', pair: 'grindless:transform\/hermean_entangled_singularity'/);
  const f1 = read('startup_scripts/grindless/uhv/foundation.js');
  assert.match(f1, /swarm_segment/);
});

test('names exist in en_us and es_es; the Hermean seed\'s EMI page has text in both', () => {
  const [en, es] = read('client_scripts/grindless/uhv_travel_lang.js').split("ClientEvents.lang('es_es'");
  for (const k of ['dimension.grindless.proxima_b_orbit', 'planet.grindless.proxima', 'gtceu.recipe.grindless_sky.proxima_day']) {
    assert.ok(en.includes(`'${k}'`), `en_us ${k}`);
    assert.ok(es.includes(`'${k}'`), `es_es ${k}`);
  }
  for (const part of [en, es]) {
    const line = part.split('\n').find((l) => l.includes("'gtceu.recipe.grindless_sky.proxima_day'"));
    assert.equal(line.split('%s').length - 1, 3, 'per panel, panels, total');
  }
  assert.deepEqual(json('assets/emi/recipe/additions/grindless/uhv_travel_hermean_quantum_seed.json'),
    { type: 'emi:info', stacks: ['item:grindless:hermean_quantum_seed'], text: ['emi.grindless.info.hermean_quantum_seed.0'] });
  const info = read('client_scripts/grindless/emi_info_lang.js');
  assert.equal(info.split("'emi.grindless.info.hermean_quantum_seed.0'").length - 1, 2);
});
