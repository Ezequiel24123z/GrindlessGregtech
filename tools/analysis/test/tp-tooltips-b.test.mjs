// TP-T-b: multiblock tooltips EV to LuV (docs/research/tier-parity.md TP-D5). Every listed controller keeps at most 4 tooltip entries, every
// key its startup file translates for a tooltip exists in en_us and es_es, and its EMI info page exists and resolves in both languages.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { controllersOf } from '../tooltip-lint.mjs';

const pack = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'pack');

const CONTROLLERS = ['algae_bioreactor', 'asteroid_processor', 'atmosphere_processor', 'biofoundry', 'coated_conductor_line', 'coilgun_launcher',
  'combined_cycle_plant', 'cryobot', 'cryogenic_plant', 'deep_space_antenna', 'ev_vein_drill', 'extraction_cascade', 'fission_reactor',
  'fluorspar_kiln', 'flux_tube_tether', 'fuel_fabrication_plant', 'fumarole_condenser', 'gravitational_wave_detector', 'harpoon_anchor_drill',
  'heavy_water_plant', 'helium_refrigerator', 'hot_cell', 'hot_strip_mill', 'hts_magnet_works', 'hydroponic_ring', 'interferometer',
  'isr_wellfield', 'lunar_solar_array', 'mega_chemical_complex', 'mercury_solar_field', 'mercury_solar_works', 'mercury_vein_drill',
  'microgravity_smelter', 'naquadah_plant', 'optical_miner', 'orbital_solar_station', 'ore_refinery', 'organoid_lab', 'platinum_plant',
  'pressurized_vein_drill', 'regolith_cell', 'sealed_dome', 'smelting_complex', 'tritium_removal_facility', 'venus_acid_works',
  'venus_heat_engine', 'volcanic_intake', 'wake_shield_facility', 'zero_g_crystal_grower'];

// recipe type names that GTM itself ships (en_us only: GTM 7.5.3 has no es_es), so the static lang does not hold them
const GTM_TYPES = new Set(['gtceu.large_chemical_reactor']);
const TIP_KEY = /Text\.translate\('((?:gtceu\.multiblock\.parallelizable\.tooltip|grindless\.tooltip\.[a-z]+|planet\.grindless\.[a-z_]+|dimension\.grindless\.[a-z_]+|gtceu\.machine\.available_recipe_map_\d\.tooltip|grindless\.machine\.[a-z_]+\.tooltip\.\d+))'/g;
const MAP_ARGS = /available_recipe_map_\d\.tooltip'((?:\s*,\s*Text\.translate\('[^']+'\))+)/g;

const run = runPackScripts(pack);
const byName = new Map(controllersOf(run.registry).map((c) => [c.name, c]));
const page = (n) => path.join(pack, 'kubejs', 'assets', 'emi', 'recipe', 'additions', 'grindless', n + '.json');

test('the controller list is complete', () => {
  assert.equal(new Set(CONTROLLERS).size, CONTROLLERS.length);
  for (const n of CONTROLLERS) assert.ok(byName.has(n), `${n} is not a registered controller`);
});

for (const n of CONTROLLERS) {
  test(`tooltips of ${n}`, () => {
    const c = byName.get(n);
    assert.ok(c.entries >= 1 && c.entries <= 4, `${n}: ${c.entries} tooltip entries, 1 to 4`);

    const src = fs.readFileSync(run.registry.machines.get('gtceu:' + n).file.replace(/^kubejs\//, path.join(pack, 'kubejs') + path.sep), 'utf8');
    const own = [...src.matchAll(TIP_KEY)].map((m) => m[1]).filter((k) => !/^grindless\.machine\./.test(k) || k.startsWith(`grindless.machine.${n}.`));
    for (const m of src.matchAll(MAP_ARGS)) own.push(...[...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]));
    assert.ok(own.length > 0, `${n}: no tooltip key found in its startup file`);
    for (const k of own) {
      if (GTM_TYPES.has(k)) continue;
      assert.ok(run.lang.en_us[k] !== undefined, `${n}: ${k} missing in en_us`);
      assert.ok(run.lang.es_es[k] !== undefined, `${n}: ${k} missing in es_es`);
    }

    assert.ok(fs.existsSync(page(n)), `${n}: EMI info page missing`);
    const json = JSON.parse(fs.readFileSync(page(n), 'utf8'));
    assert.deepEqual(json.stacks, ['item:gtceu:' + n]);
    assert.ok(json.text.length > 0);
    for (const k of json.text) {
      assert.ok(run.lang.en_us[k] !== undefined, `${n}: page key ${k} missing in en_us`);
      assert.ok(run.lang.es_es[k] !== undefined, `${n}: page key ${k} missing in es_es`);
    }
  });
}
