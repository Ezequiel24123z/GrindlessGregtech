// M6-01: no closed fluid loop may gain EU. The electric heater turned 6 mB of distilled water into 960 mB of steam for 900 EU, and the steam
// turbine paid back 640 mB of steam for 32 EU/t x 40 t (doubled), so the loop made energy. The heater recipe is removed in power/generators.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const src = fs.readFileSync(path.join(ROOT, 'pack/kubejs/server_scripts/grindless/power/generators.js'), 'utf8');

const HEATERS = [
  ['gtceu:fluid_heater/heat_water_to_steam', 960, 30, 30],
  ['gtceu:fluid_heater/heat_distilled_to_steam', 960, 30, 30],
];
const TURBINE_EU_PER_MB = (32 * 20 * 2) / 640; // best case: doubled duration, no efficiency loss

for (const [id, mb, eut, ticks] of HEATERS) {
  test(id + ' costs less than the turbine returns, so it must be removed', () => {
    assert.ok((eut * ticks) / mb < TURBINE_EU_PER_MB, 'the loop would gain EU');
    const re = new RegExp("event\\.remove\\(\\{ id: '" + id.replace(/[/.]/g, '\\$&') + "' \\}\\)");
    assert.match(src, re);
  });
}
