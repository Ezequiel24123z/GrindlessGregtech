// TP-T-c: ZPM and UV controllers have short tooltips (TP-D5): at most 4 entries, every key resolves, the EMI page holds the detail.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { controllersOf, loadBaseline, visible } from '../tooltip-lint.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const PAGES = path.join(pack, 'kubejs', 'assets', 'emi', 'recipe', 'additions', 'grindless');

const NAMES = `accelerator_driven_reactor actinide_partitioning_plant aerogel_works amorphous_ice_annealer antimatter_trap ark_biosphere assembly_hall boron_nitride_reactor cryotank_winder deep_space_network diamond_lattice_fab direct_energy_converter entry_probe_bay europium_reductor event_horizon_interferometer fibre_draw_tower flyby_probe_bay gas_giant_siphon heat_source_works ice_giant_siphon ion_implanter isotope_column kuiper_interceptor_bay kuiper_survey_telescope laser_fusion_chamber laser_sail_launcher light_sail_fab mega_factory methane_pyrolyser mocvd_reactor muon_fusion_cell naquadah_fuel_works naquadria_magnet_works naquadria_refinery neptune_deep_siphon neural_culture_vat neutrino_observatory optical_ground_station penetrator_probe_bay plasma_quench_caster plume_sampler powder_bed_printer powder_in_tube_line precursor_probe_bay pyroprocessing_cell qubit_fab ring_harvester ring_seismometer slurry_separator srf_cavity_works starchip_fab superfluid_helium_plant synchrotron tholin_reformer thruster_works triton_geyser_sampler vent_bioreactor volatile_ice_fractionator waste_retrieval_plant zone_refining_tower`.split(/\s+/);

const run = runPackScripts(pack);
const byName = new Map(controllersOf(run.registry).map((c) => [c.name, c]));
const machines = new Map([...run.registry.machines.values()].map((m) => [m.name, m]));
const keyOf = (t) => String((t && t.__key) || t);

test('60 controllers are covered', () => assert.equal(new Set(NAMES).size, 60));

for (const name of NAMES) {
  test(`${name}: short tooltip, keys resolve, page exists`, () => {
    assert.ok(byName.has(name), 'registered controller');
    assert.ok(!(`gtceu:${name}` in loadBaseline()), 'left the tooltip baseline');
    const tips = machines.get(name).tooltips;
    assert.ok(Array.isArray(tips) && tips.length >= 1 && tips.length <= 4, `${tips && tips.length} entries`);
    assert.equal(keyOf(tips[0]), `grindless.machine.${name}.tooltip.0`);
    for (const l of ['en_us', 'es_es']) {
      assert.ok(String(run.lang[l][`grindless.machine.${name}.tooltip.0`]).startsWith('§7'), `${l} tooltip.0 is gray`);
      assert.ok(visible(run.lang[l][`grindless.machine.${name}.tooltip.0`]) <= 80, `${l} tooltip.0 length`);
      for (const t of tips) {
        const k = keyOf(t);
        if (/^(grindless\.|emi\.grindless\.)/.test(k)) assert.ok(run.lang[l][k] !== undefined, `${l} ${k}`);
      }
    }
    const tipKeys = (l) => Object.keys(run.lang[l]).filter((k) => k.startsWith(`grindless.machine.${name}.tooltip.`));
    assert.deepEqual(tipKeys('en_us').sort(), tipKeys('es_es').sort());
    for (const k of tipKeys('en_us')) assert.ok(tips.some((t) => keyOf(t) === k), `${k} is used`);

    const file = path.join(PAGES, `${name}.json`);
    assert.ok(fs.existsSync(file), 'EMI page');
    const page = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.deepEqual(page.stacks, [`item:gtceu:${name}`]);
    assert.ok(page.text.length >= 1);
    for (const k of page.text) for (const l of ['en_us', 'es_es']) assert.ok(run.lang[l][k] !== undefined, `${l} ${k}`);
  });
}
