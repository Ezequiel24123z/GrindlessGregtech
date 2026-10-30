// TP-T-d: the UHV and UEV multiblock tooltips (docs/quality/recipes.md, Multiblock tooltips): at most 4 entries, every key resolves in both
// languages, and the facts that left the tooltips live on the controller's EMI info page, whose keys also resolve in both languages.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { DEFAULT_PACK, controllersOf } from '../tooltip-lint.mjs';

const CONTROLLERS = `barnard_core_drill baseline_astrometer betavoltaic_fab biomining_heap calutron carbonyl_refinery casimir_array cold_trap_drill
containment_works crystal_growth_furnace cvi_furnace degenerate_harvester electron_beam_furnace entanglement_station heavy_ion_cyclotron
helium3_polariser high_flux_reactor interstellar_dust_lab mbe_reactor megabar_press nebula_collector nitride_magnet_works nuclear_clock_lab
organoid_array pbo_plant photonic_foundry photonic_integration_hall positron_accumulator pulsar_timing_station quantum_fabricator quantum_gas_lab
radiotrophic_vat recoil_separator regolith_excavator sample_receiving_facility sic_device_fab sic_fibre_plant single_crystal_foundry snspd_foundry
solar_array_fab solar_probe_bay solar_vapour_furnace spark_plasma_sinterer stellar_forge superheavy_chemistry_lab swarm_control_station
swarm_segment_foundry tether_ribbon_works transuranium_facility uev_fusion_reactor ultrapure_water_plant vdw_stacker warp_gate
white_dwarf_spectrograph xenobiochem_plant xenobotany_greenhouse xenoflora_rover_bay zblan_draw_tower`.split(/\s+/);

// recipe types GTM itself names (its own lang, which the static stand-in does not load)
const GTM_TYPES = new Set(['assembler', 'circuit_assembler', 'forming_press', 'laser_engraver', 'cutter', 'electric_blast_furnace', 'fusion_reactor']);

const run = runPackScripts(DEFAULT_PACK);
const byName = new Map(controllersOf(run.registry).map((c) => [c.name, c]));
const machines = new Map([...run.registry.machines.values()].map((m) => [m.name, m]));
const pages = path.join(DEFAULT_PACK, 'kubejs', 'assets', 'emi', 'recipe', 'additions', 'grindless');
const pageOf = (name) => {
  for (const f of fs.readdirSync(pages)) {
    if (!f.endsWith('.json')) continue;
    const j = JSON.parse(fs.readFileSync(path.join(pages, f), 'utf8'));
    if (j.type === 'emi:info' && (j.stacks || []).includes(`item:gtceu:${name}`)) return { file: f, json: j };
  }
  return null;
};

test('every listed controller is registered with at most 4 tooltip entries', () => {
  for (const name of CONTROLLERS) {
    const c = byName.get(name);
    assert.ok(c, `${name}: not a registered multiblock`);
    assert.ok(c.entries !== null && c.entries <= 4, `${name}: ${c.entries} tooltip entries`);
  }
});

test('every tooltip key and every recipe type name resolves in en_us and es_es', () => {
  for (const name of CONTROLLERS) {
    const m = machines.get(name);
    for (const key of (m.tooltips || []).filter(Boolean)) {
      for (const l of ['en_us', 'es_es']) assert.ok(run.lang[l][key] !== undefined, `${name}: ${key} missing in ${l}`);
    }
    for (const type of [].concat(m.recipeTypes || []).map((t) => String(t).replace(/^gtceu:/, ''))) {
      if (GTM_TYPES.has(type)) continue;
      for (const l of ['en_us', 'es_es']) assert.ok(run.lang[l][`gtceu.${type}`] !== undefined, `${name}: gtceu.${type} missing in ${l}`);
    }
  }
});

test('every controller has an EMI info page whose keys all resolve in en_us and es_es', () => {
  for (const name of CONTROLLERS) {
    const page = pageOf(name);
    assert.ok(page, `${name}: no EMI info page`);
    assert.ok(page.json.text.length > 0, `${name}: empty page`);
    for (const key of page.json.text) {
      for (const l of ['en_us', 'es_es']) assert.ok(run.lang[l][key] !== undefined, `${name}: page key ${key} (${page.file}) missing in ${l}`);
    }
  }
});

test('tooltip.0 is gray and no controller keeps a tooltip key its array does not use', () => {
  for (const name of CONTROLLERS) {
    const m = machines.get(name);
    const used = new Set((m.tooltips || []).filter(Boolean));
    for (const l of ['en_us', 'es_es']) {
      assert.ok(String(run.lang[l][`grindless.machine.${name}.tooltip.0`]).startsWith('§7'), `${name}: tooltip.0 not gray in ${l}`);
      for (const key of Object.keys(run.lang[l])) {
        if (key.startsWith(`grindless.machine.${name}.tooltip.`)) assert.ok(used.has(key), `${name}: ${key} (${l}) is not used by tooltips(...)`);
      }
    }
  }
});
