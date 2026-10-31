// OpV foundation (package OpV-F1, startup_scripts/grindless/opv/foundation.js): every shared OpV id of docs/eras/opv.md F1 is registered
// once with en_us and es_es names, and there is no recipe. GTM registers every gtceu:opv_* and gtceu:max_* id (highTierContent on, TP-S0F;
// OpV-S0-1): tables/opv_ids.json lists them and nothing of ours creates them. The ids are pinned (count and every id): a changed id is an
// escalation (opv.md, F1). The two tier-13 places (S0-3, S0-8) are data files published by opv/travel.js, with two relay_platforms rows
// leaving from Cygnus X-1 and two sunlight rows; every item and block has its texture.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts, GTM_HIGH_TIER_COMPONENTS } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');

const ITEMS = ['bulge_relay_seed', 'launched_bulge_seed', 'chain_lamina_stack', 'ni_chain_slab', 'chain_field_coil', 'chain_composite_rod',
  'chain_composite_rotor', 'superfluid_he3_seal', 'chain_mesh_belt', 'opv_harmonic_drive', 'th229_lasing_crystal', 'hpge_compton_crystal',
  'inas_al_wafer', 'gated_2deg_wafer', 'tetron_die', 'cryo_cmos_die', 'nb_tsv_interposer', 'cryo_optical_link', 'hemt_amplifier', 'gan_mmic',
  'sdd_die', 'field_frozen_plate', 'aln_power_die', 'tetron_array', 'gamma_multilayer_mirror', 'laue_lens', 'be_beam_window',
  'ir_spallation_target', 'spent_ir_target', 'li6_hydride_shield', 'electron_cooler', 'stochastic_cooling_pickup', 'pb208_beam_cell',
  'octupole_trap_magnet', 'levitation_trap_cell', 'lyman_alpha_laser', 'gamma_absorber_tile', 'tpv_panel', 'acmf_pellet',
  'seed_positron_plasma', 'dense_positron_cell', 'cold_antiproton_cell', 'antiproton_stack_opv', 'antihydrogen_ice_cell', 'strangelet_seed',
  'stable_exotic_matter', 'kugelblitz_core', 'hawking_drive', 'xnav_unit', 'node_power_transmitter', 'bulge_debris', 'metal_feedstock',
  'silicate_debris_fraction', 'si_alloy_powder', 'cluster_sinter_casing', 'collector_node', 'spent_collector_node', 'deployed_node_pack',
  'probe_seed', 'vitamin_kit', 'pathfinder_probe', 'launched_pathfinder', 'pathfinder_probe_core', 'bulge_light_census', 'superheavy_census_iv',
  'element_124_recoil', 'element_126_recoil', 'chain_strand_repeater', 'sgr_a_chart'].map((n) => 'grindless:' + n);
const BLOCKS = ['grindless:field_frozen_casing', 'grindless:annihilation_shield_casing', 'grindless:neg_xhv_casing'];
const MATERIALS = { 'gtceu:chain_strand': 'ingot', 'grindless:superfluid_helium_3': 'liquid', 'grindless:jet_proton_beam': 'gas', 'grindless:hot_pair_plasma': 'gas' };
// F1 names it, uiv/tfln_femtosecond.js registers it
const EXISTING = 'grindless:si28_soi_wafer';
// read by the OpV packages, registered by their owners: M1 (lib/parallel_hatch.js) and W
const OURS = ['gtceu:opv_parallel_hatch', 'grindless:opv_smes_cell'];

// S0-1: the 91 gtceu:opv_* ids GTM 7.5.3 registers (its datagen at tag v7.5.3-1.20.1), by group, and its 29 gtceu:max_* ids
const opv = (...n) => n.map((x) => 'gtceu:opv_' + x);
const GTM = {
  components: opv('electric_motor', 'electric_pump', 'conveyor_module', 'electric_piston', 'robot_arm', 'emitter', 'sensor', 'field_generator'),
  cover: opv('fluid_regulator'),
  hull: opv('machine_hull', 'machine_casing'),
  energy_hatches: opv('energy_input_hatch', 'energy_input_hatch_4a', 'energy_input_hatch_16a', 'energy_output_hatch', 'energy_output_hatch_4a',
    'energy_output_hatch_16a', 'substation_input_hatch_64a', 'substation_output_hatch_64a'),
  laser_hatches: opv('256a_laser_source_hatch', '1024a_laser_source_hatch', '4096a_laser_source_hatch', '256a_laser_target_hatch',
    '1024a_laser_target_hatch', '4096a_laser_target_hatch'),
  electric: opv('transformer_1a', 'transformer_2a', 'transformer_4a', 'transformer_16a', '1a_energy_converter', '4a_energy_converter',
    '8a_energy_converter', '16a_energy_converter', 'battery_buffer_4x', 'battery_buffer_8x', 'battery_buffer_16x', 'charger_4x', 'diode'),
  parts: opv('input_bus', 'output_bus', 'input_hatch', 'input_hatch_4x', 'input_hatch_9x', 'output_hatch', 'output_hatch_4x', 'output_hatch_9x',
    'dual_input_hatch', 'dual_output_hatch', 'muffler_hatch', 'item_passthrough_hatch', 'fluid_passthrough_hatch', 'rotor_holder'),
  storage: opv('quantum_chest', 'quantum_tank'),
  machines: opv('electric_furnace', 'alloy_smelter', 'arc_furnace', 'assembler', 'autoclave', 'bender', 'brewery', 'canner', 'centrifuge',
    'chemical_bath', 'chemical_reactor', 'compressor', 'cutter', 'distillery', 'electrolyzer', 'electromagnetic_separator', 'extractor',
    'extruder', 'fermenter', 'fluid_heater', 'fluid_solidifier', 'forge_hammer', 'forming_press', 'lathe', 'scanner', 'mixer', 'ore_washer',
    'packer', 'polarizer', 'laser_engraver', 'sifter', 'thermal_centrifuge', 'wiremill', 'circuit_assembler', 'gas_collector', 'macerator',
    'rock_crusher'),
};
const MAX = ['machine_hull', 'machine_casing', 'battery', 'energy_input_hatch', 'energy_input_hatch_4a', 'energy_input_hatch_16a',
  'energy_output_hatch', 'energy_output_hatch_4a', 'energy_output_hatch_16a', 'substation_input_hatch_64a', 'substation_output_hatch_64a',
  '1a_energy_converter', '4a_energy_converter', '8a_energy_converter', '16a_energy_converter', 'battery_buffer_4x', 'battery_buffer_8x',
  'battery_buffer_16x', 'charger_4x', 'input_bus', 'output_bus', 'input_hatch', 'input_hatch_4x', 'input_hatch_9x', 'output_hatch',
  'output_hatch_4x', 'output_hatch_9x', 'dual_input_hatch', 'dual_output_hatch'].map((n) => 'gtceu:max_' + n);
const OPV_V = 2 ** 29; // V[OpV]

const run = runPackScripts(pack);
const short = (id) => id.slice(id.indexOf(':') + 1);
const ours = (f) => /(^|[\\/])opv[\\/]foundation\.js$/.test(String(f));
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const src = read('startup_scripts', 'grindless', 'opv', 'foundation.js');
const code = src.replace(/^\s*\/\/.*$/gm, '');
const table = JSON.parse(read('data', 'grindless', 'tables', 'opv_ids.json'));
const matOf = (key) => run.registry.materials.get(key) || run.registry.materials.get(short(key));

test('the stand-in runs the OpV foundation and its names without errors', () => {
  const mine = (e) => /(^|[\\/])opv[\\/](foundation|travel)|opv_foundation_lang/.test(String(e.file));
  const errs = run.errors.filter((e) => mine(e) && e.stage !== 'console.error');
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(run.errors.filter(mine), [], 'no console.error');
});

test('the id list is pinned: count and every id', () => {
  assert.equal(ITEMS.length, 69);
  assert.equal(BLOCKS.length, 3);
  assert.equal(Object.keys(MATERIALS).length, 4);
  const got = run.global.grindless.opvFoundation;
  assert.deepEqual([...got.items], ITEMS);
  assert.deepEqual([...got.blocks], BLOCKS);
  assert.deepEqual([...got.materials], Object.keys(MATERIALS));
  assert.deepEqual([...got.existing], [EXISTING]);
  assert.equal(Object.keys(got.ids).length, ITEMS.length + BLOCKS.length + Object.keys(MATERIALS).length + 1);
  assert.equal(got.ids.chainStrand, 'gtceu:chain_strand');
  assert.equal(got.ids.si28SoiWafer, EXISTING);
  assert.equal(new Set([...ITEMS, ...BLOCKS, EXISTING]).size, ITEMS.length + BLOCKS.length + 1, 'every id once');
});

test('every F1 id is registered once by this script; si28_soi_wafer, the parallel hatch and the SMES cell are not', () => {
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
  const si28 = run.registry.items.get(EXISTING);
  assert.ok(si28 && /uiv[\\/]tfln_femtosecond\.js$/.test(String(si28.file)), 'si28_soi_wafer stays UIV\'s');
  for (const id of OURS) assert.ok(!code.includes(id), `${id} is not F1's`);
  assert.equal([...run.registry.machines.values()].filter((m) => !m.seeded && ours(m.file)).length, 0, 'F1 registers no machine');
});

test('no script of ours registers a gtceu:opv_* or gtceu:max_* id (GTM\'s), except M1\'s parallel hatch and W\'s wireless hatches', () => {
  const bad = [];
  // OpV-W: lv/wireless_energy.js registers the eight gtceu:opv_wireless_* hatches (case 13), as it does every tier's
  const w = (id, v) => /^gtceu:(opv|max)_wireless_(energy|dynamo)_hatch(_\d+a)?$/.test(id) && /(^|[\\/])lv[\\/]wireless_energy\.js$/.test(String(v.file));
  for (const reg of [run.registry.items, run.registry.machines]) {
    for (const [id, v] of reg) if (/^gtceu:(opv|max)_/.test(id) && !v.seeded && id !== 'gtceu:opv_parallel_hatch' && id !== 'gtceu:max_parallel_hatch' && !w(id, v)) bad.push(`${id} (${v.file})`);
  }
  assert.deepEqual(bad, []);
  assert.doesNotMatch(code, /'(gtceu:)?(opv|max)_[a-z0-9_]+'/, 'foundation.js creates no GTM OpV or MAX id');
});

test('the strand is a 16 A cable at V[OpV] with no loss; no recipe, no machine, no server script of F1', () => {
  assert.match(src, /cableProperties\(GTValues\.V\[OPV\], 16, 0, false\)/);
  assert.match(src, /const OPV = 13/);
  assert.equal(OPV_V, 536870912);
  assert.equal(16 * OPV_V, 2 ** 33, 'S0-7: 16 A x V[OpV]');
  assert.match(src, /'gtceu:chain_strand': \{ form: 'ingot'[^}]*cable: true/);
  assert.doesNotMatch(code, /ServerEvents|\.recipes\(|event\.recipes|GTCEuStartupEvents\.registry\('gtceu:(machine|recipe_type)'|tables\//, 'no recipe, machine or table');
  // the OpV server scripts are the packages' (W's wireless.js, F2's cuts.js, then A0 on): none is F1's
  const mine = run.docs.recipes.recipes.filter((r) => /(^|[\\/])opv[\\/](foundation|travel)\.js$/.test(String(run.recipeFiles.get(r.i))));
  assert.deepEqual(mine, [], 'no recipe from an F1 script');
  for (const f of ['foundation.js', 'travel.js']) assert.ok(!fs.existsSync(path.join(kube, 'server_scripts', 'grindless', 'opv', f)), `no server opv/${f}`);
});

test('tables/opv_ids.json lists the 91 GTM OpV ids, the 29 MAX ids and every F1 id', () => {
  const flat = (o) => Object.entries(o).filter(([k]) => k !== '_why').flatMap(([, v]) => v);
  assert.deepEqual(Object.keys(table.gtm), Object.keys(GTM));
  for (const [k, ids] of Object.entries(GTM)) assert.deepEqual(table.gtm[k], ids, k);
  const gtm = flat(table.gtm);
  assert.equal(gtm.length, 91);
  assert.equal(new Set(gtm).size, 91, 'every GTM id once');
  assert.ok(!gtm.includes('gtceu:opv_parallel_hatch'), 'GTM has no OpV parallel hatch (S0-1)');
  for (const id of GTM_HIGH_TIER_COMPONENTS.filter((x) => x.startsWith('gtceu:opv_'))) assert.ok(gtm.includes(id), id);
  assert.deepEqual(table.max, MAX);
  assert.equal(new Set(table.max).size, 29);
  assert.deepEqual(table.foundation.items, ITEMS);
  assert.deepEqual(table.foundation.blocks, BLOCKS);
  assert.deepEqual(table.foundation.materials, Object.keys(MATERIALS));
  assert.deepEqual(table.foundation.chain_strand, ['gtceu:chain_strand_ingot', 'gtceu:chain_strand_single_wire', 'gtceu:chain_strand_single_cable']);
  assert.deepEqual(table.foundation.fluids, Object.entries(MATERIALS).filter(([, f]) => f !== 'ingot').map(([k]) => 'gtceu:' + short(k)));
  assert.deepEqual(Object.keys(table.ours).filter((k) => k !== '_why'), OURS);
  assert.deepEqual(Object.keys(table.existing).filter((k) => k !== '_why'), [EXISTING]);
  assert.deepEqual(table.substages.names, ['opv', 'opv-sgr', 'opv-terzan5']);
  assert.doesNotMatch(JSON.stringify(table), /"(itemsOut|fluidsOut|recipes)"/, 'an id table, not a recipe table');
});

test('names and both tooltip lines in en_us and es_es; materials named', () => {
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
  }
  assert.deepEqual(problems, []);
  const en = run.lang.en_us; const es = run.lang.es_es;
  for (const id of [...ITEMS, ...BLOCKS]) {
    for (const k of [`${ITEMS.includes(id) ? 'item' : 'block'}.grindless.${short(id)}`, `tooltip.grindless.${short(id)}.0`, `tooltip.grindless.${short(id)}.1`]) {
      assert.notEqual(es[k], en[k], k);
    }
  }
  for (const key of Object.keys(MATERIALS)) assert.notEqual(es[`material.${key.split(':')[0]}.${short(key)}`], en[`material.${key.split(':')[0]}.${short(key)}`], key);
});

// ---------------------------------------------------------------- the places (S0-3, S0-8) and the textures

// key -> [world, gravity, temperature (K), warp gate circuit, jump row]
const PLACES = { sgr1806: ['sgr1806_orbit', 0, 10000000, 11, 'hold_sgr1806'], terzan5: ['terzan5_core', 1, 100, 12, 'hold_terzan5'] };
const CYGNUS = 'grindless:cygnus_x1_orbit';
const json = (...p) => JSON.parse(read(...p));
const plain = (o) => JSON.parse(JSON.stringify(o));

test('the two places load at tier 13: dimension, planet (no air), sky; no other tier-13 planet and no rocket row', () => {
  for (const [k, [dim, gravity, temp]] of Object.entries(PLACES)) {
    assert.deepEqual(json('data', 'grindless', 'dimension', `${dim}.json`), { type: 'gcyr:space', generator: { type: 'gcyr:space' } }, k);
    const pl = json('data', 'grindless', 'gcyr', 'planets', `${dim}.json`);
    assert.equal(pl.rocket_tier, 13, k);
    assert.equal(pl.gravity, gravity, k);
    assert.equal(pl.temperature, temp, k);
    assert.equal(pl.world, `grindless:${dim}`, k);
    assert.equal(pl.orbit_world, `grindless:${dim}`, k);
    assert.equal(pl.translation, `level.grindless.${dim}`, k);
    assert.equal(pl.solar_system, `grindless:${k}`, k);
    assert.equal(pl.galaxy, 'gcyr:milky_way', k);
    assert.equal(pl.has_atmosphere, false, k);
    assert.equal(pl.has_oxygen, false, k);
    assert.equal(pl.solar_power, 0, k);
    const sky = json('assets', 'grindless', 'gcyr', 'planet_assets', 'sky_renderers', `${dim}.json`);
    assert.equal(sky.world, `grindless:${dim}`, k + ' sky');
    assert.ok(sky.sky_objects.length >= 3, k + ' sky has objects');
  }
  for (const f of fs.readdirSync(path.join(kube, 'data', 'grindless', 'gcyr', 'planets'))) {
    if (json('data', 'grindless', 'gcyr', 'planets', f).rocket_tier === 13) assert.ok(Object.values(PLACES).some(([d]) => f === `${d}.json`), f);
  }
  assert.deepEqual(table.places, { _why: table.places._why, sgr1806: 'grindless:sgr1806_orbit', terzan5: 'grindless:terzan5_core' });
});

test('opv/travel.js publishes the places on global.grindless.opvTravel (tier 13, from Cygnus X-1); no recipe, no registration', () => {
  const T = plain(run.global.grindless.opvTravel);
  assert.equal(T.tier, 13);
  assert.equal(T.source, CYGNUS);
  assert.deepEqual(Object.keys(T.places), Object.keys(PLACES));
  for (const [k, [dim, , temp, circuit, jump]] of Object.entries(PLACES)) {
    assert.deepEqual(T.places[k], { dimension: `grindless:${dim}`, circuit, jump, temperature: temp }, k);
  }
  for (const id of Object.values(T.ids)) assert.ok(ITEMS.includes(id), id);
  const travel = read('startup_scripts', 'grindless', 'opv', 'travel.js').replace(/^\s*\/\/.*$/gm, '');
  assert.doesNotMatch(travel, /ServerEvents|StartupEvents|GTCEuStartupEvents|event\.create|\.recipes/, 'data only');
  assert.match(read('startup_scripts', 'grindless', 'opv', 'travel.js'), /^\/\/ priority: -?\d+$/m, 'the integrator stamped the priority (script-order.mjs --write)');
});

test('relay_platforms.json: two OpV-F1 rows leaving from Cygnus X-1, one per jump; nine rows in all', () => {
  const plat = json('data', 'grindless', 'tables', 'relay_platforms.json');
  assert.equal(plat.platforms.length, 9);
  const mine = plat.platforms.filter((p) => Object.hasOwn(PLACES, p.place));
  assert.deepEqual(mine.map((p) => [p.place, p.jump, p.dimension, p.source, p.x, p.y, p.z]), Object.entries(PLACES).map(([k, [dim, , , , jump]]) =>
    [k, jump, `grindless:${dim}`, CYGNUS, 64, 100, 64]));
  assert.deepEqual(plat.platforms.slice(5, 7), mine, 'appended after the UXV rows (MAX-F1 appends two more)');
  assert.equal(new Set(plat.platforms.map((p) => p.jump)).size, 9, 'every jump once');
});

test('sunlight.json: two rows, factor 0, no_solar, era opv, always', () => {
  const d = json('data', 'grindless', 'tables', 'sunlight.json').dimensions;
  for (const [dim] of Object.values(PLACES)) {
    const s = d[`grindless:${dim}`];
    assert.ok(s, dim);
    assert.equal(s.factor, 0, dim);
    assert.equal(s.when, 'always', dim);
    assert.equal(s.status, 'no_solar', dim);
    assert.equal(s.era, 'opv', dim);
    assert.match(s.note, /^OpV-F1:/, dim);
  }
  assert.equal(Object.values(d).filter((s) => s.era === 'opv').length, 2);
});

test('the places are named in en_us and es_es (level, dimension, planet)', () => {
  for (const lang of ['en_us', 'es_es']) {
    const L = run.lang[lang] || {};
    for (const [k, [dim]] of Object.entries(PLACES)) {
      for (const key of [`level.grindless.${dim}`, `dimension.grindless.${dim}`, `planet.grindless.${k}`]) assert.ok(L[key], `${lang} ${key}`);
    }
  }
  assert.equal(run.lang.en_us['dimension.grindless.sgr1806_orbit'], 'SGR 1806-20 Orbit');
  assert.equal(run.lang.es_es['dimension.grindless.sgr1806_orbit'], 'Órbita de SGR 1806-20');
  assert.notEqual(run.lang.es_es['dimension.grindless.terzan5_core'], run.lang.en_us['dimension.grindless.terzan5_core']);
});

test('every F1 item and block has its texture (tools/assets/Build-OpVFoundationTextures.ps1)', () => {
  const tex = path.join(kube, 'assets', 'grindless', 'textures');
  const missing = [
    ...ITEMS.map((id) => path.join('item', `${short(id)}.png`)),
    ...BLOCKS.map((id) => path.join('block', 'opv', `${short(id)}.png`)),
  ].filter((rel) => !fs.existsSync(path.join(tex, rel)));
  assert.deepEqual(missing, []);
  for (const id of BLOCKS) assert.ok(src.includes(`'grindless:block/opv/${short(id)}'`), id);
});