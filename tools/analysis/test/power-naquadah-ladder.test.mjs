// D2-NAQPOWER (docs/eras/lines-ev-zpm.md D2-4): the five naquadah reactor rows that climb the ladder get a final
// duration in power/generators.js; I and III keep the doubled GT-- value, EU/t is never touched.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const src = fs.readFileSync(path.join(ROOT, 'pack/kubejs/server_scripts/grindless/power/generators.js'), 'utf8');

const EXPECTED = {
  'gtceu:naquadah_reactor/naquadah_reactor_ii': 54932,
  'gtceu:naquadah_reactor/naquadah_reactor_iv': 1431,
  'gtceu:naquadah_reactor/naquadah_reactor_v': 1669,
  'gtceu:large_naquadah_reactor/naquadah_based_liquid_fuel_depleted': 690,
};

function finalTable() {
  const m = src.match(/var FINAL_DURATION = \{([\s\S]*?)\n  \}/);
  assert.ok(m, 'generators.js declares FINAL_DURATION');
  const out = {};
  for (const [, id, n] of m[1].matchAll(/'([^']+)':\s*(\d+)/g)) out[id] = Number(n);
  return out;
}

test('the ladder rows carry the spec durations and nothing else is pinned', () => {
  assert.deepEqual(finalTable(), EXPECTED);
});

test('reactor I and III (and the retired U/Th rows) are not overridden', () => {
  const t = finalTable();
  for (const id of ['naquadah_reactor_i', 'naquadah_reactor_iii'].map((x) => `gtceu:naquadah_reactor/${x}`)) assert.ok(!(id in t), id);
});

test('the override replaces the planned duration and leaves EU/t alone', () => {
  assert.match(src, /if \(FINAL_DURATION\[c\.id\] !== undefined\) plan\.duration = FINAL_DURATION\[c\.id\]/);
  assert.ok(!/plan\.eu\s*=/.test(src));
});

test('the ladder climbs: EU per fuel unit rises with the plant', () => {
  const perIngot = [[2048, 48828, 1 / 8], [8192, 54932, 1 / 2], [32768, 30516, 1]].map(([e, t, f]) => (e * t) / f);
  assert.ok(perIngot[0] < perIngot[1] && perIngot[1] < perIngot[2], perIngot.join(' < '));
  // 42 naquadria -> 1,000 mB fuel -> 125 mB excited: 1 mB excited holds 42/125 naquadria
  const perNaq = [[131072, 1431, 1 / 8], [524288, 1669, 1 / 2], [975000, 690, 42 / 125]].map(([e, t, f]) => (e * t) / f);
  assert.ok(perNaq[0] < perNaq[1] && perNaq[1] < perNaq[2], perNaq.join(' < '));
});