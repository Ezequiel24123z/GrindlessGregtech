// TP-T-e: UIV and UXV controllers have short tooltips (TP-D5): at most 4 entries, every key resolves, the EMI page holds the detail.
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

const NAMES = `accretion_disk_skimmer annihilation_laser_works beuv_scanner bz_dynamo crust_lift decay_heat_vault droplet_radiator_works ejecta_knot_sweeper ergosphere_probe_bay femtosecond_writer frc_former levitation_melter matrioshka_computer millikelvin_cryostat_works mnt_collider mtj_sputter_cluster neutron_drip_separator neutronium_cage neutronium_compression_hall oxide_pld_chamber pasta_draw_bench pasta_extractor pasta_laminator pasta_phase_sorter penrose_engine plasma_mass_filter polar_cap_tap polarised_proton_source positronium_condensate_lab pulsar_wind_trap r_process_decompressor racetrack_fab ramp_compression_pulser shequid_works spectral_hole_burner stellar_condensation_tower stellar_elevator stellar_fractionation_hall stm_lithography_cell tfln_fab uiv_fusion_reactor uxv_fusion_reactor vdw_stacking_cell xray_pulse_profiler yig_lpe_furnace`.split(/\s+/);

const run = runPackScripts(pack);
const byName = new Map(controllersOf(run.registry).map((c) => [c.name, c]));
const machines = new Map([...run.registry.machines.values()].map((m) => [m.name, m]));
const keyOf = (t) => String((t && t.__key) || t);

const pages = new Map();
for (const f of fs.readdirSync(PAGES)) {
  if (!f.endsWith('.json')) continue;
  const page = JSON.parse(fs.readFileSync(path.join(PAGES, f), 'utf8'));
  for (const s of page.stacks || []) pages.set(s, page);
}

test('45 controllers are covered', () => assert.equal(new Set(NAMES).size, 45));

test('site names used by the tooltips resolve', () => {
  for (const k of ['planet.grindless.rx_j1856', 'planet.grindless.psr_j0437', 'planet.grindless.mercury', 'dimension.grindless.cygnus_x1_orbit', 'dimension.grindless.vela_pulsar_orbit', 'dimension.grindless.cas_a_remnant']) {
    for (const l of ['en_us', 'es_es']) assert.ok(run.lang[l][k] !== undefined, `${l} ${k}`);
  }
});

for (const name of NAMES) {
  test(`${name}: short tooltip, keys resolve, page resolves`, () => {
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
        assert.ok(run.lang[l][k] !== undefined, `${l} ${k}`);
      }
      // GTM ships these names itself; the static lang only holds ours.
      const GTM = new Set(['compressor', 'implosion_compressor', 'distillation_tower', 'distillery', 'fusion_reactor']);
      for (const ty of machines.get(name).recipeTypes) {
        const id = ty.replace(/^gtceu:/, '');
        if (!id || GTM.has(id)) continue;
        assert.ok(run.lang[l][`gtceu.${id}`] !== undefined, `${l} recipe type gtceu.${id}`);
      }
    }
    const tipKeys = (l) => Object.keys(run.lang[l]).filter((k) => k.startsWith(`grindless.machine.${name}.tooltip.`));
    assert.deepEqual(tipKeys('en_us').sort(), tipKeys('es_es').sort());
    for (const k of tipKeys('en_us')) assert.ok(tips.some((t) => keyOf(t) === k), `${k} is used`);

    const page = pages.get(`item:gtceu:${name}`);
    assert.ok(page, 'EMI page');
    assert.ok(page.text.length >= 1);
    for (const k of page.text) for (const l of ['en_us', 'es_es']) assert.ok(run.lang[l][k] !== undefined, `${l} ${k}`);
  });
}
