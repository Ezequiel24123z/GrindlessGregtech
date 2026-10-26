// ZPM-F2: lib/stations.js reads a list of station slots (tables/stations.json `more`) without changing LuV's first, second, b7 or
// switches. Runs the real stations.js in a Node sandbox, with injected tables; the real stations.json is only read.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PACK = path.join(ROOT, 'pack');
const STATIONS_JS = 'kubejs/startup_scripts/grindless/lib/stations.js';
const readPack = (p) => JSON.parse(fs.readFileSync(path.join(PACK, p), 'utf8'));
const REAL = readPack('kubejs/data/grindless/tables/stations.json');
const ORBITS = [...readPack('kubejs/data/grindless/tables/orbits.json').dimensions, 'grindless:saturn_orbit', 'grindless:uranus_orbit'];
const plain = (v) => JSON.parse(JSON.stringify(v));

function run(table, orbits = ORBITS) {
  const G = { readJsonTable: () => plain(table), orbits: { dimensions: orbits } };
  const sandbox = { console: { info: () => {}, warn: () => {}, error: () => {}, log: () => {} }, global: { grindless: G } };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(PACK, STATIONS_JS), 'utf8'), sandbox, { filename: STATIONS_JS });
  return plain(G.stations);
}

const ZPM = [
  { slot: 'saturn', orbit: 'grindless:saturn_orbit', era: 'zpm' },
  { slot: 'uranus', orbit: 'grindless:uranus_orbit', era: 'zpm' },
];
const luvFields = (s) => ({ enabled: s.enabled, first: s.first, second: s.second, plot: s.plot, pieces: s.pieces, b7: s.b7, switches: s.switches });

test('the real table: more is an empty list, and LuV keeps its two stations and the tether', () => {
  assert.deepEqual(REAL.more, []);
  const s = run(REAL);
  assert.equal(s.b7, 'tether');
  assert.deepEqual(s.switches, { stations: true, tether: true, sulfur_iodine: false });
  assert.deepEqual(s.more, []);
  assert.deepEqual(s.slots, [{ slot: 'first', orbit: 'gcyr:overworld_orbit' }, { slot: 'second', orbit: 'grindless:io_orbit' }]);
});

test('two more stations change nothing LuV reads', () => {
  const base = run(REAL);
  const four = run({ ...REAL, more: ZPM });
  assert.deepEqual(luvFields(four), luvFields(base));
  assert.deepEqual(four.more, ZPM);
  assert.deepEqual(four.slots.map((x) => x.orbit), ['gcyr:overworld_orbit', 'grindless:io_orbit', 'grindless:saturn_orbit', 'grindless:uranus_orbit']);
  const { more, ...rest } = REAL;
  assert.deepEqual(luvFields(run(rest)), luvFields(base), 'a table without more reads as more: []');
});

test('every LuV mode keeps its b7 and switches with more set', () => {
  for (const t of [{ ...REAL, enabled: false }, { ...REAL, second: null }, { ...REAL, enabled: false, second: null }]) {
    assert.deepEqual(luvFields(run({ ...t, more: ZPM })), luvFields(run(t)));
  }
  assert.deepEqual(run({ ...REAL, second: null, more: ZPM }).slots.map((x) => x.slot), ['first', 'saturn', 'uranus']);
});

test('bad slots are refused', () => {
  const bad = [
    { more: {} },
    { more: [{ slot: 'saturn', orbit: 'grindless:nowhere', era: 'zpm' }] },
    { more: [{ slot: 'Saturn', orbit: 'grindless:saturn_orbit', era: 'zpm' }] },
    { more: [{ slot: 'saturn', orbit: 'grindless:saturn_orbit' }] },
    { more: [{ slot: 'first', orbit: 'grindless:saturn_orbit', era: 'zpm' }] },
    { more: [{ slot: 'io2', orbit: 'grindless:io_orbit', era: 'zpm' }] },
    { more: [ZPM[0], { ...ZPM[1], slot: 'saturn' }] },
    { more: [ZPM[0], { ...ZPM[1], orbit: ZPM[0].orbit }] },
  ];
  for (const b of bad) assert.throws(() => run({ ...REAL, ...b }), /grindless\/stations/, JSON.stringify(b));
});
