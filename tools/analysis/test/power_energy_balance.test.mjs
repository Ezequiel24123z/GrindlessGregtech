// M6-01: no closed fluid loop may gain EU. The electric heater turned 6 mB of distilled water into 960 mB of steam for 900 EU, and the steam
// turbine paid back 640 mB of steam for 32 EU/t x 40 t (doubled), so the loop made energy. The heater recipe is removed in power/generators.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const src = fs.readFileSync(path.join(ROOT, 'pack/kubejs/server_scripts/grindless/power/generators.js'), 'utf8');

test('the electric water -> steam heater recipe is removed', () => {
  assert.match(src, /event\.remove\(\{ id: 'gtceu:fluid_heater\/heat_distilled_to_steam' \}\)/);
});

test('the base figures would have looped (the reason for the removal)', () => {
  const heaterEuPerMbSteam = (30 * 30) / 960;
  const turbineEuPerMbSteam = (32 * 20 * 2) / 640;
  assert.ok(turbineEuPerMbSteam > heaterEuPerMbSteam);
});
