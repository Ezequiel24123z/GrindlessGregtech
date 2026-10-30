// TP-T-a (docs/research/tier-parity.md TP-D5): the steam to HV, launch road, power, moon and observatory controllers keep a short tooltip
// (at most 4 entries, every translation key exists in en_us and es_es) and an EMI info page whose keys all resolve in both languages.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const PACK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../pack');
const PAGES = path.join(PACK, 'kubejs', 'assets', 'emi', 'recipe', 'additions', 'grindless');

// steam_vein_drill and steam_greenhouse keep their keys in assets/grindless/lang/*.json; the integrator shortened them and the lint checks them
const CONTROLLERS = `advanced_multi_smelter biorefinery coil_chemical_plant coking_battery composite_autoclave engine_test_stand generator_array
heliostat_tower hv_greenhouse hv_vein_drill large_steam_centrifuge large_steam_chemical_bath large_steam_macerator large_steam_ore_washer
large_steam_thermal_centrifuge lava_furnace lunar_drill lv_greenhouse lv_vein_drill mv_greenhouse mv_vein_drill optical_observatory ore_plant
polymer_works radio_telescope refinery reformer steam_alloy_smelter steam_blast_furnace steam_chemical_bath steam_compressor steam_forge_hammer
steam_mixer steam_observatory steam_ore_washer submerged_arc_furnace sulfide_roaster syngas_plant universal_assembly_factory
universal_mixing_factory universal_processing_factory universal_separation_factory weather_controller wire_works wireless_energy_tower`.split(/\s+/);

const run = runPackScripts(PACK);

test('45 controllers are covered', () => assert.equal(CONTROLLERS.length, 45));

for (const name of CONTROLLERS) {
  test(`${name}: at most 4 tooltip entries, every key and every page key resolves in en_us and es_es`, () => {
    const m = run.registry.machines.get(`gtceu:${name}`);
    assert.ok(m, 'registered');
    assert.ok(Array.isArray(m.tooltips) && m.tooltips.length >= 1 && m.tooltips.length <= 4, `entries: ${JSON.stringify(m.tooltips)}`);
    assert.equal(m.tooltips[0], `grindless.machine.${name}.tooltip.0`);
    for (const key of m.tooltips) {
      assert.ok(typeof key === 'string', 'every entry is a Text.translate(key)');
      for (const l of ['en_us', 'es_es']) assert.ok(run.lang[l] && run.lang[l][key], `${l} ${key}`);
    }
    const file = path.join(PAGES, `${name}.json`);
    assert.ok(fs.existsSync(file), 'EMI page exists');
    const page = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.equal(page.type, 'emi:info');
    assert.deepEqual(page.stacks, [`item:gtceu:${name}`]);
    assert.ok(page.text.length > 0);
    for (const key of page.text) for (const l of ['en_us', 'es_es']) assert.ok(run.lang[l][key], `${l} ${key}`);
  });
}
