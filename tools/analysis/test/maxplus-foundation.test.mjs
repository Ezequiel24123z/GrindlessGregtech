// MAX+ foundation (package XP-F1, startup_scripts/grindless/maxplus/foundation.js and travel.js): every shared MAX+ id of docs/eras/maxplus.md F1 is
// registered once with en_us names, the four tier-14 places are data files with a relay_platforms row each, the 1,024 A hatch is an input
// EnergyHatchPartMachine and no creative id (gtceu:creative_*, ae2:, appflux) is ever registered.
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
const ours = (f) => /(^|[\\/])maxplus[\\/]foundation\.js$/.test(String(f));
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const json = (...p) => JSON.parse(read(...p));
const table = json('data', 'grindless', 'tables', 'maxplus_ids.json');
const got = run.global.grindless.maxPlusFoundation;
const travel = run.global.grindless.maxPlusTravel;

const COMPONENTS = ['electric_motor', 'electric_pump', 'electric_piston', 'robot_arm', 'emitter', 'sensor', 'field_generator', 'conveyor_module', 'fluid_regulator']
  .map((n) => 'grindless:maxplus_' + n);
const CASINGS = ['horizon_machine_casing', 'condensate_vessel_casing', 'bound_press_casing', 'slingshot_coil_casing', 'lift_nozzle_casing', 'crucible_liner_casing']
  .map((n) => 'grindless:' + n);
const STANDINS = ['bottomless_store_core', 'bottomless_tank_core', 'horizon_cloud_core', 'horizon_computation_core'].map((n) => 'grindless:' + n);
const PLACES = {
  lmc: ['grindless:tarantula_orbit', 16, 'hold_tarantula', 'gcyr:black_hole_orbit'],
  stream: ['grindless:magellanic_stream', 17, 'hold_magellanic_stream', 'grindless:tarantula_orbit'],
  m31: ['grindless:m31_nucleus_orbit', 18, 'hold_m31_nucleus', 'grindless:tarantula_orbit'],
  void: ['grindless:local_group_filament', 19, 'hold_local_group_filament', 'grindless:m31_nucleus_orbit']
};

test('the stand-in runs the MAX+ foundation and its names without errors', () => {
  const mine = (e) => /(^|[\\/])maxplus[\\/](foundation|travel)|maxplus_foundation_lang/.test(String(e.file));
  const errs = run.errors.filter(mine);
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.ok(got && travel, 'both globals published');
});

test('the nine components, the circuit, the casings and the stand-ins are registered once by foundation.js', () => {
  for (const id of [...COMPONENTS, 'grindless:horizon_processor', ...STANDINS]) {
    assert.ok(run.registry.items.has(id), `${id} not registered`);
    assert.ok(ours(run.registry.items.get(id).file), `${id} is registered by another script`);
  }
  for (const id of CASINGS) assert.ok(run.registry.blocks.has(id), `${id} not registered`);
  assert.deepEqual(table.components, COMPONENTS);
  assert.deepEqual(table.casings, CASINGS);
  assert.deepEqual(Array.from(got.items).filter((id, i, a) => a.indexOf(id) !== i), [], 'no id twice');
});

test('ids registered elsewhere are read, never created here', () => {
  for (const id of got.existing) {
    assert.ok(!got.items.includes(id) && !got.fluids.includes(id), `${id} is registered here too`);
  }
  assert.deepEqual(table.existing, Array.from(got.existing));
});

test('no creative id and no placeable stand-in', () => {
  const all = [...got.items, ...got.blocks, ...got.fluids];
  for (const id of all) assert.ok(!/creative|appflux|^ae2:/.test(id), `${id} looks like a creative id`);
  for (const id of STANDINS) assert.ok(!got.blocks.includes(id), `${id} must not be a block`);
  const src = read('startup_scripts', 'grindless', 'maxplus', 'foundation.js').replace(/^\s*\/\/.*$/gm, '');
  assert.ok(!/gtceu:creative_|ae2:|appflux/.test(src), 'no creative registration in the code');
});

test('the 1,024 A hatch is an input EnergyHatchPartMachine at tier 14 and no second hull exists', () => {
  const src = read('startup_scripts', 'grindless', 'maxplus', 'foundation.js').replace(/^\s*\/\/.*$/gm, '');
  assert.equal(got.hatchAmps, 1024);
  assert.equal(table.hatch.amps, 1024);
  assert.match(src, /EnergyHatchPartMachine/);
  assert.match(src, /new EHPM\(holder, tier, IO\.IN, 1024\)/);
  assert.match(src, /PartAbility\.INPUT_ENERGY/);
  assert.match(src, /\.tiers\(MAXT\)/);
  assert.ok(!/machine_hull|MachineHull/i.test(src), 'no hull of ours (gtceu:max_machine_hull is GTM\'s)');
});

test('the four places: planet rows at tier 14, relay rows and the travel global', () => {
  const relay = json('data', 'grindless', 'tables', 'relay_platforms.json');
  const rows = relay.platforms || relay.rows || relay;
  for (const [key, [dim, circuit, jump, source]] of Object.entries(PLACES)) {
    const planet = json('data', 'grindless', 'gcyr', 'planets', `${short(dim)}.json`);
    assert.equal(planet.world, dim, key);
    assert.equal(planet.orbit_world, dim, key);
    assert.equal(planet.rocket_tier, 14, key);
    const row = rows.find((r) => r.dimension === dim);
    assert.ok(row, `${dim} has a relay_platforms row`);
    assert.equal(row.source, source, key);
    assert.equal(row.jump, jump, key);
    assert.deepEqual([travel.places[key].dimension, travel.places[key].circuit, travel.places[key].jump], [dim, circuit, jump], key);
    assert.equal(table.places[key], dim, key);
  }
  assert.equal(travel.tier, 14);
});

test('names in en_us for every id and place', () => {
  const problems = [];
  for (const lang of ['en_us']) {
    const L = run.lang[lang] || {};
    for (const id of got.items) if (!L['item.grindless.' + short(id)]) problems.push(`${lang} item ${id}`);
    for (const id of got.blocks) if (!L['block.grindless.' + short(id)]) problems.push(`${lang} block ${id}`);
    for (const id of got.fluids) if (!L['material.grindless.' + short(id)]) problems.push(`${lang} fluid ${id}`);
    for (const k of ['material.gtceu.kerr_strand', 'block.gtceu.max_maxplus_energy_hatch_1024a']) if (!L[k]) problems.push(`${lang} ${k}`);
    for (const [, [dim]] of Object.entries(PLACES)) for (const k of ['level', 'dimension']) if (!L[`${k}.grindless.${short(dim)}`]) problems.push(`${lang} ${k} ${dim}`);
  }
  assert.deepEqual(problems, []);
  const en = run.lang.en_us;
  assert.equal(en['item.grindless.maxplus_electric_motor'], 'MAX+ Electric Motor');
});

test('no priority line is hand-edited beyond a stamped number', () => {
  for (const f of [['startup_scripts', 'grindless', 'maxplus', 'foundation.js'], ['startup_scripts', 'grindless', 'maxplus', 'travel.js'], ['client_scripts', 'grindless', 'maxplus_foundation_lang.js']]) {
    assert.match(read(...f), /^\/\/ priority: -?\d+\r?$/m, f.join('/'));
  }
});
