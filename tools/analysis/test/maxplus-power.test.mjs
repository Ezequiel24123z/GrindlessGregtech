// MAX+ power plumbing (package XP-W, docs/eras/maxplus.md 'Hatches' and line P18), no game needed: the case 14 cap rows for the 1,024 to
// 4,096 A hatches, the P18 rows' circuits on the older machines and the hatch recipes of maxplus/power.js. The 2^37 row on a 64 A
// substation hatch fed by wireless case 14 is gg_test_maxplus_power.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const table = (n) => JSON.parse(fs.readFileSync(path.join(kube, 'data', 'grindless', 'tables', n + '.json'), 'utf8'));
const power = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'maxplus', 'power.js'), 'utf8');
const WIRELESS = table('wireless_energy');
const V_MAX = 2 ** 31;

test('case 14 caps: V[MAX] x A x settleTicks for 1,024, 2,048 and 4,096 A, exact as longs', () => {
  const caps = WIRELESS.maxplusCaps;
  assert.deepEqual(caps.map((c) => c.amps), [1024, 2048, 4096]);
  caps.forEach((c) => {
    assert.equal(c.tier, 14);
    assert.equal(c.cap, V_MAX * c.amps * WIRELESS.settleTicks);
    assert.ok(Number.isSafeInteger(c.cap));
  });
  assert.deepEqual(WIRELESS.hatchAmps, [2, 4, 16, 64], 'the shared hatch amperages are untouched');
});

test('P18 takes the first MAX+ circuit of each older machine: above every circuit in the tables', () => {
  const highest = (name) => Math.max(...table(name).recipes.map((r) => r.circuit));
  const circuitOf = (type) => Number(new RegExp("type: '" + type + "', name: '[a-z_]+', circuit: (\\d+)").exec(power)[1]);
  assert.ok(circuitOf('coated_conductor') > highest('coated_conductor_line'));
  assert.ok(circuitOf('magnet_winding') > highest('hts_magnet_works'));
  const pld = table('spin_deposition').types.pulsed_laser_deposition.recipes ?? [];
  if (pld.length > 0) assert.ok(circuitOf('pulsed_laser_deposition') > Math.max(...pld.map((r) => r.circuit)));
});

test('power.js: the five P18 outputs and the 1,024 A hatch recipe, MAX+ ingredients only', () => {
  ['kerr_fcl_buffer_tape', 'thick_kerr_fcl_tape', 'kerr_fcl_coil', 'cold_kerr_fcl'].forEach((id) => assert.ok(power.includes("'grindless:" + id + "'")));
  assert.ok(power.includes("out: 'gtceu:max_maxplus_energy_hatch_1024a'"));
  ['max_substation_input_hatch_64a', 'max_substation_output_hatch_64a'].forEach((id) =>
    assert.ok(!power.includes("out: 'gtceu:" + id + "'"), id + ' keeps MAX\'s row only (a dearer MAX+ copy would be dominated)'));
  assert.ok(!power.includes("'grindless:cold_fcl_module'"), 'the MAX rows keep cold_fcl_module; ours must not collide with them');
});
