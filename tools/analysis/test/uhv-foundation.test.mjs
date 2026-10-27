// UHV foundation (package UHV-F1, startup_scripts/grindless/uhv/foundation.js): every shared UHV id of docs/eras/uhv.md is registered
// once, as the design writes it (the other UHV packages use these ids), named in en_us and es_es with two tooltip lines, and drawn.
// Materials GTM, GTCA or an older era already have, the ICAN motor (A8), the wireless tier (A9), planets, orbits and the
// intermediates one package uses alone are not registered here.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const assets = path.join(pack, 'kubejs', 'assets', 'grindless');

const ITEMS = [
  'berkelium_249', 'californium_252', 'californium_252_source', 'thorium_229', 'nickel_62_target', 'nickel_63_target',
  'hfir_driver_element', 'spent_hfir_driver_element', 'transcurium_target', 'irradiated_transcurium_target', 'nuclear_clock',
  'lithium_niobate_boule', 'lithium_niobate_wafer', 'vuv_caf2_boule', 'thorium_caf2_crystal', 'eu_yso_boule', 'inp_boule', 'inp_wafer',
  'quantum_cascade_laser', 'thin_film_ln_modulator', 'sic_power_module', 'sic_mirror_blank', 'nbn_coated_sic_plate', 'imm_solar_array',
  'red_tuned_solar_array', 'betavoltaic_cell', 'c12_diamond_spreader', 'positron_cartridge', 'antihydrogen_cartridge',
  'exotic_matter_cell', 'zblan_fibre', 'pbo_fibre', 'tether_ribbon_segment', 'tether_climber', 'uhtc_tile', 'uhtc_nozzle',
  'organoid_processor', 'proxima_flora_sample', 'proxima_regolith_survey', 'characterised_xeno_strain', 'xeno_genome_data',
  'proxima_ice_core', 'cold_trap_regolith', 'chitosan_scaffold', 'xeno_radioprotectant', 'infrared_pigment', 'aluminium_reflector_film',
  'swarm_segment', 'worn_swarm_segment', 'coronal_field_map', 'stellar_neighbourhood_chart', 'proxima_gate_seed',
].map((n) => 'grindless:' + n);
const BLOCKS = ['bsl4_casing', 'warp_gate_casing', 'hangar_casing'].map((n) => 'grindless:' + n);
const MATERIALS = {
  zirconia: 'dust', zirconium_diboride: 'dust', niobium_oxide: 'dust', lead_fluoride: 'dust', ultrapure_water: 'liquid',
  proxima_pgm_liquor: 'liquid', proxima_ree_liquor: 'liquid', sterilised_growth_medium: 'liquid', hdehp_solvent: 'liquid',
  pbo_dope: 'liquid', oganesson_propellant: 'gas', deuterium_enriched_water: 'liquid',
};
// S0-1: GTM's, GTCA's or an older era's; F1 must not create them again
const EXISTING_MATERIALS = ['californium', 'oganesson', 'thorium', 'nickel', 'indium_phosphide', 'silicon_carbide', 'curium', 'uranium_233'];
// owned by a later package or by B1, or used by one package alone: F1 must not register them
const NOT_F1 = [
  'grindless:ican_rocket_motor', 'grindless:uhv_smes_cell', 'grindless:uhv_wireless_energy_cover', 'grindless:uhv_wireless_dynamo_cover',
  'grindless:proxima_b_orbit', 'grindless:uhv_emitter', 'grindless:uhv_sensor', 'grindless:uhv_motor', 'grindless:uhv_robot_arm',
  'grindless:uhv_field_generator', 'grindless:uhv_parallel_hatch', 'grindless:vuv_frequency_comb', 'grindless:quantum_memory_chip',
  'grindless:casimir_cavity_stack', 'grindless:tantalum_carbide_liner', 'grindless:solar_probe', 'grindless:proxima_rover',
  'grindless:xeno_biomass', 'grindless:xeno_mushroom', 'grindless:far_red_pigment', 'grindless:melanised_biomass',
  'grindless:mercury_regolith', 'grindless:biocemented_regolith',
];
// words the design uses where the id differs
const DESIGN_ALIAS = {
  berkelium_249: 'berkelium-249', californium_252: 'californium-252', californium_252_source: 'californium-252 source',
  thorium_229: 'thorium-229', nickel_62_target: 'nickel-62', nickel_63_target: 'nickel-63', spent_hfir_driver_element: 'spent driver',
  irradiated_transcurium_target: 'irradiated transcurium target', lithium_niobate_boule: 'linbo', lithium_niobate_wafer: 'linbo',
  vuv_caf2_boule: 'vuv caf', thorium_caf2_crystal: 'th:caf', eu_yso_boule: 'eu:yso', inp_boule: 'inp boule', inp_wafer: 'inp wafer',
  nbn_coated_sic_plate: 'nbn-coated sic', c12_diamond_spreader: 'c-12 diamond', cold_trap_regolith: 'cold-trap regolith',
  worn_swarm_segment: 'worn segment', aluminium_reflector_film: 'reflector film', bsl4_casing: 'bsl-4 casing',
  warp_gate_casing: 'gate casing', hangar_casing: 'hangar casing', zirconium_diboride: 'zrb', niobium_oxide: 'nb₂o₅',
  lead_fluoride: 'pbf', sterilised_growth_medium: 'growth medium', hdehp_solvent: 'hdehp', pbo_dope: 'pbo dope',
  oganesson_propellant: 'oganesson', deuterium_enriched_water: 'deuterium-enriched water',
};
const SPIKE = /(^|_)(planet|orbit|dimension|station|wireless)(_|$)/;

const run = runPackScripts(pack);
const short = (id) => id.slice(id.indexOf(':') + 1);
const ours = (f) => /(^|[\\/])uhv[\\/]foundation\.js$/.test(String(f));
const src = fs.readFileSync(path.join(pack, 'kubejs', 'startup_scripts', 'grindless', 'uhv', 'foundation.js'), 'utf8');

test('the stand-in runs the UHV foundation without errors', () => {
  const errs = run.errors.filter((e) => /(^|[\\/])uhv[\\/]foundation/.test(String(e.file)) && e.stage !== 'console.error');
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
});

test('every shared UHV id is registered once, is named in docs/eras/uhv.md, and nothing of a later package or B1', () => {
  const design = fs.readFileSync(path.join(root, 'docs', 'eras', 'uhv.md'), 'utf8').toLowerCase();
  for (const id of [...ITEMS, ...BLOCKS]) {
    assert.ok(run.registry.items.has(id), `${id} not registered`);
    assert.ok(ours(run.registry.items.get(id).file), `${id} is registered by another script`);
  }
  for (const [name, form] of Object.entries(MATERIALS)) {
    const mat = run.registry.materials.get(name) || run.registry.materials.get('gtceu:' + name);
    assert.ok(mat && ours(mat.file), `gtceu:${name} is not a GT material of foundation.js`);
    assert.ok(mat.forms.has(form), `gtceu:${name} lacks the ${form} form`);
    if (form === 'gas' || form === 'liquid') assert.ok(run.registry.fluids.has('gtceu:' + name), `gtceu:${name} fluid not registered`);
  }
  assert.ok(![...run.registry.fluids.keys()].some((id) => id.startsWith('grindless:') && ours(run.registry.fluids.get(id).file)), 'no KubeJS fluids');
  const named = [...ITEMS, ...BLOCKS].map(short).concat(Object.keys(MATERIALS));
  for (const n of named) {
    const spaced = n.replace(/_/g, ' ');
    assert.ok(design.includes(n) || design.includes(spaced) || (DESIGN_ALIAS[n] && design.includes(DESIGN_ALIAS[n])), `${n} is not named in docs/eras/uhv.md`);
  }
  for (const id of NOT_F1) {
    const it = run.registry.items.get(id);
    assert.ok(!it || !ours(it.file), `${id} belongs to a later package, B1, or one package alone`);
  }
  for (const [id, it] of run.registry.items) if (ours(it.file)) assert.ok(!SPIKE.test(short(id)), `${id} belongs to B1 or the wireless tier`);
  for (const [id, it] of run.registry.items) if (ours(it.file) && !/_(dust|ingot)$/.test(id)) assert.ok(id.startsWith('grindless:'), id);
});

test('materials that already exist (S0-1) are not created again', () => {
  for (const m of EXISTING_MATERIALS) {
    const mat = run.registry.materials.get(m) || run.registry.materials.get('gtceu:' + m);
    assert.ok(!mat || !ours(mat.file), `${m} exists already (S0-1): foundation.js must not create it`);
  }
  assert.doesNotMatch(src, /materialModification/, 'F1 adds no forms to existing materials');
});

test('no machine, recipe type or recipe', () => {
  assert.doesNotMatch(src, /registry\('(gtceu:)?(machine|recipe_type)'/);
  assert.doesNotMatch(src, /ServerEvents|\.recipes\(/);
});

test('the id table global.grindless.uhvFoundation is published', () => {
  assert.match(src, /G\.uhvFoundation/);
  assert.match(src, /UHVF\.ids\[key\]/);
});

test('names and both tooltip lines in en_us and es_es; materials named', () => {
  const problems = [];
  for (const lang of ['en_us', 'es_es']) {
    const L = run.lang[lang] || {};
    for (const id of [...ITEMS, ...BLOCKS]) {
      const kind = ITEMS.includes(id) ? 'item' : 'block';
      for (const k of [`${kind}.grindless.${short(id)}`, `tooltip.grindless.${short(id)}.0`, `tooltip.grindless.${short(id)}.1`]) if (!L[k]) problems.push(`${lang} ${k}`);
    }
    for (const name of Object.keys(MATERIALS)) if (!L[`material.gtceu.${name}`]) problems.push(`${lang} material.gtceu.${name}`);
  }
  assert.deepEqual(problems, []);
  // the Spanish text is a translation, not a copy of the English one
  const en = run.lang.en_us; const es = run.lang.es_es;
  for (const id of [...ITEMS, ...BLOCKS]) {
    for (const k of [`${ITEMS.includes(id) ? 'item' : 'block'}.grindless.${short(id)}`, `tooltip.grindless.${short(id)}.1`]) {
      assert.notEqual(es[k], en[k], k);
    }
  }
});

test('every item and block has its texture', () => {
  const missing = [];
  for (const id of ITEMS) if (!fs.existsSync(path.join(assets, 'textures', 'item', short(id) + '.png'))) missing.push(id);
  for (const id of BLOCKS) if (!fs.existsSync(path.join(assets, 'textures', 'block', 'uhv', short(id) + '.png'))) missing.push(id);
  assert.deepEqual(missing, []);
});
