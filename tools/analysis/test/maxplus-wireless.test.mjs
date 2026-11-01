// The MAX+ wireless hatches (package XP-W2, docs/eras/maxplus.md 'Hatches'), no game needed: the table's maxplusHatchAmps, the startup registration kept
// out of the standard grid, maxplus/wireless.js's two assembly-line rows and the names; the exact store's source markers. The store settling above 2^53
// and the 4,096 A hatch drawing 2^43 EU/t are gg_test_maxplus_wireless.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const run = runPackScripts(pack);
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const WIRELESS = JSON.parse(read('data', 'grindless', 'tables', 'wireless_energy.json'));
const W = run.global.grindless.wireless;
const MAXT = 14;
const IDS = ['gtceu:max_wireless_energy_hatch_1024a', 'gtceu:max_wireless_energy_hatch_4096a'];

test('the table names the two amperages and each has its maxplusCaps row (V[MAX] x A x settleTicks)', () => {
  assert.deepEqual(WIRELESS.maxplusHatchAmps, [1024, 4096]);
  for (const amps of WIRELESS.maxplusHatchAmps) {
    const row = WIRELESS.maxplusCaps.find((r) => r.tier === MAXT && r.amps === amps);
    assert.ok(row, 'row for ' + amps);
    assert.equal(row.cap, 2 ** 31 * amps * WIRELESS.settleTicks);
  }
});

test('startup: both hatches are in the book as tier 14 hatches, outside the standard hatchIds grid', () => {
  assert.deepEqual(Array.from(W.maxplusHatchIds), IDS);
  for (const id of IDS) {
    assert.equal(W.hatches[id].kind, 'hatch');
    assert.equal(W.hatches[id].tier, MAXT);
    assert.ok(!W.hatchIds.includes(id), id + ' stays out of hatchIds');
  }
  assert.equal(W.hatches[IDS[0]].amps, 1024);
  assert.equal(W.hatches[IDS[1]].amps, 4096);
  const startup = read('startup_scripts', 'grindless', 'lv', 'wireless_energy.js');
  assert.match(startup, /W\.maxplusHatchAmps\.forEach/);
  const server = read('server_scripts', 'grindless', 'lv', 'wireless_energy.js');
  assert.match(server, /W\.hatchIds\.concat\(W\.maxplusHatchIds/, 'the tracking loop covers them');
});

test('maxplus/wireless.js: two assembly-line rows at VA[MAX] with station research, the 4,096 A row dearer than four 1,024 A rows', () => {
  const src = read('server_scripts', 'grindless', 'maxplus', 'wireless.js');
  assert.match(src, /^\/\/ priority: -?\d+\r?\n/);
  assert.equal((src.match(/assembly_line\(/g) || []).length, 1);
  assert.match(src, /stationResearch/);
  assert.match(src, /VA\[MAXT\]/);
  const MW = run.global.grindless.maxplusWireless;
  assert.equal(MW.hatches.length, 2);
  const [a, b] = MW.hatches;
  assert.equal(a.out, IDS[0]);
  assert.equal(b.out, IDS[1]);
  assert.ok(a.parts.some(([id]) => id === 'gtceu:max_maxplus_energy_hatch_1024a'), 'the wired 1,024 A hatch');
  const count = (h, id) => (h.parts.find(([x]) => x === id) || [, 0])[1];
  for (const [id] of a.parts) {
    if (id === 'gtceu:max_maxplus_energy_hatch_1024a') continue;
    assert.ok(count(b, id) >= 4 * count(a, id), id + ' at least four times in the 4,096 A row');
  }
  assert.equal(count(b, 'gtceu:max_wireless_energy_hatch_1024a'), 1);
  assert.equal(count(b, 'gtceu:max_maxplus_energy_hatch_1024a'), 4);
  assert.ok(b.duration > a.duration);
});

test('names: both hatches in the MAX+ lang script, en_us and es_es', () => {
  const src = read('client_scripts', 'grindless', 'maxplus_wireless_lang.js');
  assert.match(src, /'en_us'/);
  assert.match(src, /'es_es'/);
  assert.match(src, /AMPS = \[1024, 4096\]/);
  const emi = read('assets', 'emi', 'recipe', 'additions', 'grindless', 'wireless_energy_hatch.json');
  for (const id of IDS) assert.ok(emi.includes('item:' + id), id + ' in the EMI entry');
});

test('the exact store keeps its Number path and adds a BigInteger one above 2^53', () => {
  const src = read('server_scripts', 'grindless', 'lv', 'wireless_energy.js');
  assert.match(src, /W\.big = \{/);
  assert.match(src, /java\.math\.BigInteger/);
  assert.match(src, /putLong\(big\.longValue\(\)\)/);
  assert.match(src, /putLong\(STORE_KEY,\s*Math\.max\(0, Math\.floor\(eu\)\)\)/);
});
