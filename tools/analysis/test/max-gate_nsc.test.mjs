// MAX-T2 (docs/eras/max.md, "T2. Gate c15 to the belt"): the belt seed's assembly line, the c15 row, the Sgr A* site, the per-source relay
// poll and the lang parity, checked from the scripts' and tables' text. The runtime proof is the T1 gg_test_max_gate_nsc.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const kube = path.resolve(here, '..', '..', '..', 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const gateJson = JSON.parse(fs.readFileSync(path.join(tables, 'gate.json'), 'utf8'));
const relay = JSON.parse(fs.readFileSync(path.join(tables, 'relay_platforms.json'), 'utf8'));
const script = read('server_scripts', 'grindless', 'max', 'gate_nsc.js');
const lang = read('client_scripts', 'grindless', 'max_gate_nsc_lang.js');
const gateJs = read('server_scripts', 'grindless', 'uhv', 'gate.js');
const sling = read('server_scripts', 'grindless', 'uxv', 'kerr_sling.js');
const code = script.replace(/^\s*\/\/.*$/gm, '');
const gate = gateJson.types.warp_gate.recipes;
const c15 = gate.find((r) => r.circuit === 15);

test('the seed is an assembly line row at VA[MAX] with the contract inputs, two fluids and nsc_ephemeris research', () => {
  assert.match(code, /assembly_line\('grindless:nsc_belt_seed'\)/);
  assert.match(code, /GTValues\.VA\[MAXT\]/);
  assert.match(code, /var MAXT = 14\b/);
  assert.match(code, /research: 'grindless:nsc_ephemeris'/);
  assert.match(code, /stationResearch\(function \(r\) \{ return r\.researchStack\(Item\.of\(SEED\.research\)\)/);
  const items = /items: \[([^\]]*)\]/.exec(code);
  assert.ok(items, 'items list');
  const parsed = [...items[1].matchAll(/'(\d+)x (#?[a-z_]+:[a-z0-9_/]+)'/g)].map((m) => [m[2], Number(m[1])]);
  assert.deepEqual(parsed, [
    ['grindless:probe_seed', 1], ['grindless:nsc_ephemeris', 1], ['grindless:rydberg_logic_array', 1], ['grindless:max_robot_arm', 2],
    ['grindless:max_sensor', 2], ['grindless:metal_feedstock', 8], ['grindless:cluster_sinter_casing', 4], ['#gtceu:circuits/max', 2]
  ]);
  assert.equal((code.match(/\['gtceu:[a-z_]+', \d+\]/g) || []).length, 2, 'two fluids');
  assert.ok(parsed.length <= 16);
});

test('c15 is 2^33 = V[OpV] x 16 A for 1,200 t at the Sgr A* ring, burns the seed, keeps nothing, returns the launched seed', () => {
  assert.ok(c15);
  assert.equal(c15.name, 'hold_nsc_belt');
  assert.equal(c15.eut, 16 * 536870912);
  assert.equal(c15.eut, 2 ** 33);
  assert.equal(c15.duration, 1200);
  assert.equal(c15.site, 'sgr_a_orbit');
  assert.deepEqual(c15.itemsIn, [{ id: 'grindless:nsc_belt_seed', count: 1 }]);
  assert.deepEqual(c15.kept, []);
  assert.deepEqual(c15.itemsOut, [{ id: 'grindless:launched_belt_seed', count: 1 }]);
  assert.equal(gate[gate.length - 1], c15, 'the row is appended last');
  assert.equal(new Set(gate.map((r) => r.circuit)).size, gate.length, 'no circuit repeats');
});

test('the Sgr A* site: black_hole_orbit is a gate orbit and the c15 site key points at it', () => {
  assert.match(gateJs, /SITES\.orbits\.push\('gcyr:black_hole_orbit'\)/);
  assert.match(gateJs, /SITES\.sgr_a_orbit = \['gcyr:black_hole_orbit'\]/);
});

test('hand-off: the belt platform row is matched by the c15 name only, from the Sgr A* source', () => {
  const row = relay.platforms.find((p) => p.place === 'nsc');
  assert.ok(row);
  assert.equal(row.jump, c15.name);
  assert.equal(row.source, 'gcyr:black_hole_orbit');
  assert.equal(row.dimension, 'grindless:nsc_belt');
  const sgra = relay.platforms.find((p) => p.place === 'sgra');
  assert.notEqual(sgra.source, row.source, 'two sources: the poll must serve both');
});

test('kerr_sling polls every source place with its own rows and keeps each pending jump with its source', () => {
  assert.match(sling, /sources\.forEach\(function \(src\) \{ pollSource\(server, t, mine, src\) \}\)/);
  assert.match(sling, /String\(r\.source\) === source/);
  assert.ok(!/mine\[0\]/.test(sling), 'no row is taken as the only source');
  assert.match(sling, /until: rec\.until, source: source/);
  assert.match(sling, /p\.source !== source \|\| now < p\.until/);
});

test('every id is registered (F1 or earlier) and max-nsc is a tier-model substage', () => {
  const text = JSON.stringify(JSON.parse(fs.readFileSync(path.join(tables, 'max_ids.json'), 'utf8')));
  for (const id of ['grindless:nsc_belt_seed', 'grindless:launched_belt_seed', 'grindless:nsc_ephemeris', 'grindless:rydberg_logic_array',
    'grindless:max_robot_arm', 'grindless:max_sensor', 'max-nsc']) assert.ok(text.includes(`"${id}"`), id);
});

test('lang parity: the c15 row line in en_us and es_es', () => {
  assert.match(lang, /\['en_us', 'es_es'\]\.forEach/);
  const key = 'gtceu.recipe.grindless_warp_gate.hold_nsc_belt';
  const at = lang.indexOf(`['${key}'`);
  assert.ok(at > 0, key);
  const entry = lang.slice(at, lang.indexOf("']", at) + 2);
  assert.equal((entry.match(/'[^']*'|"[^"]*"/g) || []).length, 3, 'key, en and es');
});
