// UXV foundation (package UXV-F1, startup_scripts/grindless/uxv/foundation.js): every shared UXV id of docs/eras/uxv.md F1 is registered once
// with en_us and es_es names and drawn, and there is no recipe. The hull and hatches are uev/foundation.js's builders at a third tier
// (S0-1). The ids are pinned (count and every id): a changed id is an escalation (uxv.md, F1).
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

const COMPONENTS = ['uxv_electric_motor', 'uxv_electric_pump', 'uxv_conveyor_module', 'uxv_electric_piston', 'uxv_robot_arm', 'uxv_sensor',
  'uxv_emitter', 'uxv_field_generator'];
const SPINTRONICS = ['cofeb_target', 'mgo_target', 'heusler_target', 'saf_target_set', 'ta_seed_target', 'srruo3_target', 'la_bfo_target',
  'cofeb_ingot', 'heusler_ingot', 'terfenol_d_ingot', 'ni_mn_ga_ingot', 'ta_foil', 'pt_sheet', 'dysco3_substrate', 'ggg_wafer', 'hbn_crystal',
  'wte2_crystal', 'fgt_crystal', 'mtj_stack_wafer', 'mram_stack_wafer', 'saf_track_wafer', 'mtj_die', 'mram_wafer', 'srruo3_electrode_wafer',
  'me_switch_wafer', 'sot_readout_stack', 'meso_logic_die', 'racetrack_chip', 'magnonic_bus', 'sin_membrane', 'nanoaperture_array',
  'rf_carpet_board', 'kr_f2_premix', 'krf_excimer_laser', 'pt_lpe_crucible', 'gas_stopping_cell', 'shequid_gyro'];
const LINES_44_49 = ['stno_stack_wafer', 'stno_array', 'gum_metal_billet', 'gum_metal_blank', 'gum_metal_flexspline', 'uxv_strain_wave_gear',
  'encoder_ring', 'multipole_encoder_ring', 'tmr_encoder', 'ga2o3_wafer', 'ga2o3_power_die', 'mu_metal_foil', 'shielded_interposer',
  'finemet_ribbon', 'finemet_toroid', 'finemet_core', 'uxv_voltage_coil'];
const SUPERHEAVY = ['fm257_target', 'cm248_target', 'element_121_recoil', 'element_122_recoil', 'superheavy_census_iii',
  'spent_actinide_target', 'u238_ion_source', 'u238_beam_charge', 'island_nuclide', 'island_chart'];
const PARTS = ['tetrataenite_lamination', 'tetrataenite_rotor', 'strand_stator', 'strand_tape', 'alip_duct', 'w184_cvi_preform', 'terfenol_d_rod',
  'ni_mn_ga_crystal', 'cnt_bumper_weave', 'cnt_whipple_shield', 'frc_cartridge', 'gamma_laser_module', 'positron_stack', 'ti44_core', 'si28_ash'];
const FAR = ['raw_pasta', 'spaghetti_phase', 'lasagna_phase', 'gnocchi_fragment', 'anti_phase_residue', 'lasagna_plate', 'pasta_core_sample',
  'ejecta_knot_dust', 'refractory_condensate', 'metal_condensate', 'silicate_condensate'];
const DATA = ['vela_glitch_timing', 'vela_glitch_record', 'cygnus_vlbi_record', 'elevator_log', 'ti44_map', 'arm_chart', 'bulge_chart',
  'pasta_strand_repeater'];
const ITEMS = [...COMPONENTS, ...SPINTRONICS, ...LINES_44_49, ...SUPERHEAVY, ...PARTS, ...FAR, ...DATA].map((n) => 'grindless:' + n);
const BLOCKS = ['grindless:uxv_fusion_casing'];
const MATERIALS = {
  'gtceu:pasta_strand': 'ingot', 'gtceu:titanium_44': 'dust', 'gtceu:fermium_257': 'dust', 'gtceu:einsteinium_254': 'dust',
  'gtceu:tungsten_184': 'ingot', 'gtceu:oxygen_16': 'gas', 'gtceu:cofeb': 'ingot', 'gtceu:co2mnsi': 'ingot', 'gtceu:terfenol_d': 'ingot',
  'gtceu:ni2mnga': 'ingot', 'gtceu:dysco3': 'dust', 'gtceu:srruo3': 'dust', 'gtceu:la_bfo': 'dust', 'gtceu:ggg': 'dust', 'gtceu:yig': 'dust',
  'gtceu:hbn': 'dust', 'gtceu:wte2': 'dust', 'gtceu:fe3gete2': 'dust',
  'grindless:stellar_plasma': 'gas', 'grindless:disk_plasma': 'gas', 'grindless:filtered_disk_plasma': 'gas', 'grindless:flux_loaded_plasma': 'gas',
  'grindless:stellar_hydrogen_cut': 'gas', 'grindless:stellar_helium_cut': 'gas', 'grindless:stellar_cno_cut': 'gas',
  'grindless:stellar_heavy_cut': 'gas', 'grindless:triple_alpha_fuel': 'gas', 'grindless:carbon_burning_fuel': 'gas',
  'grindless:oxygen_burning_fuel': 'gas', 'grindless:cno_ash_plasma': 'gas', 'grindless:helium_burning_ash_plasma': 'gas',
  'grindless:carbon_burning_ash_plasma': 'gas', 'grindless:oxygen_burning_ash_plasma': 'gas', 'grindless:lpe_flux': 'liquid',
  'grindless:he_6n': 'gas', 'grindless:mnt_product_gas': 'gas', 'grindless:finemet_melt': 'liquid', 'grindless:volatile_condensate': 'gas',
};
// S0-1: the exact ids the hull and hatches were proved with
const MACHINES = ['uxv_machine_hull', 'uxv_energy_input_hatch', 'uxv_energy_input_hatch_16a', 'uxv_energy_output_hatch', 'uxv_energy_output_hatch_16a']
  .map((n) => 'gtceu:' + n);
// registered by an older script: the contract lists them, but F1 must not create them a second time
const EXISTING = ['gtceu:curium_248', 'grindless:cage_part', 'grindless:es254_target', 'grindless:polar_cap_electrode', 'grindless:nv_diamond_chip',
  'grindless:uxv_smes_cell'];
const UXV_V = 2 ** 27; // V[UXV]

const run = runPackScripts(pack);
const short = (id) => id.slice(id.indexOf(':') + 1);
const ours = (f) => /(^|[\\/])uxv[\\/]foundation\.js$/.test(String(f));
const read = (...p) => fs.readFileSync(path.join(pack, 'kubejs', ...p), 'utf8');
const src = read('startup_scripts', 'grindless', 'uxv', 'foundation.js');
const uevSrc = read('startup_scripts', 'grindless', 'uev', 'foundation.js');
const matOf = (key) => run.registry.materials.get(key) || run.registry.materials.get(short(key));

test('the stand-in runs the UXV foundation without errors', () => {
  const errs = run.errors.filter((e) => /(^|[\\/])uxv[\\/]foundation/.test(String(e.file)) && e.stage !== 'console.error');
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  const logged = run.errors.filter((e) => /(^|[\\/])uxv[\\/]foundation/.test(String(e.file)));
  assert.deepEqual(logged, [], 'no console.error');
});

test('the id list is pinned: count and every id', () => {
  assert.equal(ITEMS.length, 106);
  assert.equal(Object.keys(MATERIALS).length, 38);
  assert.equal(Object.values(MATERIALS).filter((f, i) => Object.keys(MATERIALS)[i].startsWith('grindless:')).length, 20, '20 fluids');
  const got = run.global.grindless.uxvFoundation;
  assert.deepEqual([...got.items], ITEMS);
  assert.deepEqual([...got.blocks], BLOCKS);
  assert.deepEqual([...got.materials], Object.keys(MATERIALS));
  assert.deepEqual([...got.machines], MACHINES);
  assert.equal(Object.keys(got.ids).length, ITEMS.length + BLOCKS.length + Object.keys(MATERIALS).length);
  assert.equal(new Set([...ITEMS, ...BLOCKS]).size, ITEMS.length + BLOCKS.length, 'every id once');
});

test('every shared UXV id is registered once by this script, and nothing of an older era or of W', () => {
  for (const id of [...ITEMS, ...BLOCKS]) {
    assert.ok(run.registry.items.has(id), `${id} not registered`);
    assert.ok(ours(run.registry.items.get(id).file), `${id} is registered by another script`);
  }
  for (const [key, form] of Object.entries(MATERIALS)) {
    const mat = matOf(key);
    assert.ok(mat && ours(mat.file), `${key} is not a GT material of foundation.js`);
    assert.ok(mat.forms.has(form), `${key} lacks the ${form} form`);
    if (form === 'gas' || form === 'liquid') assert.ok(run.registry.fluids.has('gtceu:' + short(key)), `${key} fluid not registered`);
  }
  for (const id of EXISTING) {
    const it = run.registry.items.get(id) || run.registry.machines.get(id) || matOf(id);
    assert.ok(!it || !ours(it.file), `${id} exists already (or is W's): foundation.js must not create it`);
  }
  assert.ok(!src.includes('grindless:uxv_smes_cell'), 'W registers the cell');
  assert.equal(run.registry.items.has('grindless:cage_part') && ours(run.registry.items.get('grindless:cage_part').file), false);
  // the hull and hatches are the UEV builders at the third tier (S0-1): this script registers no machine
  assert.equal([...run.registry.machines.values()].filter((m) => ours(m.file)).length, 0, 'F1 registers no machine of its own');
  for (const id of MACHINES) {
    assert.ok(run.registry.machines.has(id), `${id} not registered by uev/foundation.js (.tiers(UEV, UIV, UXV))`);
    assert.ok(/(^|[\\/])uev[\\/]foundation\.js$/.test(String(run.registry.machines.get(id).file)), `${id} comes from the UEV builders`);
  }
  assert.doesNotMatch(src.replace(/^\s*\/\/.*$/gm, ''), /create\('(machine_hull|energy_|dynamo_)|\.tiers\(/, 'no hull or hatch builder of our own');
});

test('the tier widening: UEV, UIV and UXV on both of UEV\'s builders, labels named by tier', () => {
  assert.equal((uevSrc.match(/\.tiers\(UEV, GTValues\.UIV, GTValues\.UXV\)/g) || []).length, 2, 'the hatch helper and the hull');
  assert.doesNotMatch(uevSrc, /\.tiers\(UEV(, GTValues\.UIV)?\)/);
  assert.match(uevSrc, /GTValues\.VN\[tier\] \+ ' Machine Hull'/);
  assert.match(uevSrc, /GTValues\.VN\[tier\] \+ ' ' \+ label/);
  assert.doesNotMatch(uevSrc, /'UXV /);
  for (const lang of ['en_us', 'es_es']) {
    for (const k of ['uev_machine_hull', 'uiv_machine_hull', 'uxv_machine_hull']) assert.ok(run.lang[lang][`block.gtceu.${k}`], `${lang} names ${k}`);
  }
  assert.equal(run.lang.en_us['block.gtceu.uxv_energy_input_hatch'], 'UXV Energy Hatch');
});

test('the strand is a 4 A cable at V[UXV] with no loss; W-184 has a wire form; no recipe, no machine, no shared table', () => {
  assert.match(src, /cableProperties\(GTValues\.V\[UXV\], 4, 0, false\)/);
  assert.match(src, /const UXV = 12/);
  assert.equal(UXV_V, 134217728);
  assert.match(src, /'gtceu:pasta_strand': \{ form: 'ingot'[^}]*cable: true/);
  assert.match(src, /'gtceu:tungsten_184': \{ form: 'ingot'[^}]*wire: true/);
  assert.match(src, /if \(spec\.wire\) material\.cableProperties\(/);
  assert.doesNotMatch(src, /ServerEvents|\.recipes\(|event\.recipes|GTCEuStartupEvents\.registry\('gtceu:machine'|tables\//, 'no recipe, machine or table');
  const mine = run.docs.recipes.recipes.filter((r) => /(^|[\\/])uxv[\\/]foundation\.js$/.test(String(run.recipeFiles.get(r.i))));
  assert.deepEqual(mine, [], 'F1 adds no recipe');
  assert.ok(!fs.existsSync(path.join(pack, 'kubejs', 'server_scripts', 'grindless', 'uxv', 'foundation.js')), 'the hull and hatch recipes are B4\'s');
  assert.match(src, /^\/\/ priority:/m, 'the integrator (UXV-F2) stamped the load order');
});

test('names and both tooltip lines in en_us and es_es; materials and machines named', () => {
  const problems = [];
  for (const lang of ['en_us', 'es_es']) {
    const L = run.lang[lang] || {};
    for (const id of [...ITEMS, ...BLOCKS]) {
      const kind = ITEMS.includes(id) ? 'item' : 'block';
      for (const k of [`${kind}.grindless.${short(id)}`, `tooltip.grindless.${short(id)}.0`, `tooltip.grindless.${short(id)}.1`]) if (!L[k]) problems.push(`${lang} ${k}`);
    }
    for (const key of Object.keys(MATERIALS)) {
      const k = `material.${key.split(':')[0]}.${short(key)}`;
      if (!L[k]) problems.push(`${lang} ${k}`);
    }
    for (const id of MACHINES) if (!L[`block.gtceu.${short(id)}`]) problems.push(`${lang} block.gtceu.${short(id)}`);
  }
  assert.deepEqual(problems, []);
  const en = run.lang.en_us; const es = run.lang.es_es;
  for (const id of [...ITEMS, ...BLOCKS]) {
    for (const k of [`${ITEMS.includes(id) ? 'item' : 'block'}.grindless.${short(id)}`, `tooltip.grindless.${short(id)}.0`, `tooltip.grindless.${short(id)}.1`]) {
      assert.notEqual(es[k], en[k], k);
    }
  }
});

test('every item and the casing has its texture', () => {
  const missing = [];
  for (const id of ITEMS) if (!fs.existsSync(path.join(assets, 'textures', 'item', short(id) + '.png'))) missing.push(id);
  for (const id of BLOCKS) if (!fs.existsSync(path.join(assets, 'textures', 'block', 'uxv', short(id) + '.png'))) missing.push(id);
  assert.deepEqual(missing, []);
});
