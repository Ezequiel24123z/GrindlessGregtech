// MAX-T1 (docs/eras/max.md, "T1. Gate c14 to Sgr A*"): the probe's assembly line, the c14 row's hand-off to the Sgr A* platform and the lang
// parity, checked from the scripts' and tables' text. The runtime proof is the T1 gg_test_max_gate_gc.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const kube = path.resolve(here, '..', '..', '..', 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const gateJson = JSON.parse(fs.readFileSync(path.join(tables, 'gate.json'), 'utf8'));
const relay = JSON.parse(fs.readFileSync(path.join(tables, 'relay_platforms.json'), 'utf8'));
const script = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'max', 'gate_gc.js'), 'utf8');
const lang = fs.readFileSync(path.join(kube, 'client_scripts', 'grindless', 'max_gate_gc_lang.js'), 'utf8');
const travel = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', 'max', 'travel.js'), 'utf8');
const code = script.replace(/^\s*\/\/.*$/gm, '');
const gate = gateJson.types.warp_gate.recipes;
const c14 = gate.find((r) => r.circuit === 14);

test('the probe is an OpV assembly line row at VA[OpV] with eight distinct items, two fluids and the Hawking drive research', () => {
  assert.match(code, /assembly_line\('grindless:gc_relay_probe'\)/);
  assert.match(code, /GTValues\.VA\[OPV\]/);
  assert.match(code, /var OPV = 13\b/);
  assert.match(code, /stationResearch\(function \(r\) \{ return r\.researchStack\(Item\.of\(PROBE\.research\)\)/);
  assert.match(code, /research: 'grindless:hawking_drive'/);
  const items = /items: \[([^\]]*)\]/.exec(code);
  assert.ok(items, 'items list');
  const parsed = [...items[1].matchAll(/'(\d+)x ([a-z_]+:[a-z0-9_]+)'/g)].map((m) => [m[2], Number(m[1])]);
  assert.deepEqual(parsed, [
    ['grindless:probe_seed', 1], ['grindless:hawking_drive', 1], ['gtceu:chain_strand_single_wire', 64], ['grindless:tetron_array', 1],
    ['grindless:vitamin_kit', 1], ['grindless:metal_feedstock', 16], ['grindless:cluster_sinter_casing', 8], ['gtceu:opv_sensor', 4]
  ]);
  assert.equal(new Set(parsed.map((p) => p[0])).size, 8);
  assert.equal((code.match(/\['gtceu:[a-z_]+', \d+\]/g) || []).length, 2, 'two fluids');
  assert.ok(!/gtceu:max_|circuits\/max/.test(code), 'OpV parts only: no MAX id, no MAX circuit');
  assert.ok(/^\/\/ priority: -\d+/.test(script), 'the integrator stamps the script with its priority line');
});

test('c14 is 2^33 = V[OpV] x 16 A for 1,200 t at Cygnus X-1, burns the probe, keeps the chart, returns the launched probe', () => {
  assert.ok(c14);
  assert.equal(c14.name, 'hold_sgr_a_probe');
  assert.equal(c14.eut, 16 * 536870912);
  assert.equal(c14.eut, 2 ** 33);
  assert.equal(c14.duration, 1200);
  assert.equal(c14.site, 'cygnus_x1_orbit');
  assert.deepEqual(c14.itemsIn, [{ id: 'grindless:gc_relay_probe', count: 1 }]);
  assert.deepEqual(c14.kept, [{ id: 'grindless:sgr_a_chart', count: 1 }]);
  assert.deepEqual(c14.itemsOut, [{ id: 'grindless:launched_gc_probe', count: 1 }]);
  assert.equal(gate[gate.length - 2], c14, 'the row follows c13; the c15 row of MAX-T2 is appended after it');
  assert.equal(gate.filter((r) => r.name === 'hold_sgr_a').length, 1, 'c13 keeps its own name');
});

test('hand-off: the Sgr A* platform row is matched by the c14 name only, from the Cygnus source; c13 places nothing', () => {
  const row = relay.platforms.find((p) => p.place === 'sgra');
  assert.ok(row);
  assert.equal(row.jump, c14.name);
  assert.equal(row.source, 'grindless:cygnus_x1_orbit');
  assert.equal(row.dimension, 'gcyr:black_hole_orbit');
  assert.ok(!relay.platforms.some((p) => p.jump === 'hold_sgr_a'), 'no platform row waits for c13');
  assert.match(travel, /sgra: \{ dimension: 'gcyr:black_hole_orbit', circuit: 14, jump: 'hold_sgr_a_probe'/);
  // kerr_sling's poll() reads only mine[0].source: every row of a Cygnus source works, the nsc row (source Sgr A*) is served by its own source poll (MAX-T2, max-gate_nsc.test.mjs)
  const mine = relay.platforms.filter((p) => p.source);
  assert.equal(mine[0].source, row.source);
});

test('the probe and the launched probe are F1 ids and the gate row names exist', () => {
  const ids = JSON.parse(fs.readFileSync(path.join(tables, 'max_ids.json'), 'utf8'));
  const text = JSON.stringify(ids);
  for (const id of ['grindless:gc_relay_probe', 'grindless:launched_gc_probe', 'max-sgra']) assert.ok(text.includes(`"${id}"`), id);
});

test('lang parity: the c14 row line in en_us and es_es', () => {
  assert.match(lang, /\['en_us', 'es_es'\]\.forEach/);
  const key = 'gtceu.recipe.grindless_warp_gate.hold_sgr_a_probe';
  const at = lang.indexOf(`['${key}'`);
  assert.ok(at > 0, key);
  const entry = lang.slice(at, lang.indexOf("']", at) + 2);
  assert.equal((entry.match(/'[^']*'|"[^"]*"/g) || []).length, 3, 'key, en and es');
});
