// UEV foundation (package UEV-F1, startup_scripts/grindless/uev/foundation.js): every shared UEV id of docs/eras/uev.md is registered
// once with en_us and es_es names, drawn, and the only recipes are the machine casing, the hull and the four hatches, in GTM's
// assembler at UHV voltage. The ids are pinned (count and every id): a changed id is an escalation (uev.md, F1).
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
  'uev_electric_motor', 'uev_electric_pump', 'uev_conveyor_module', 'uev_electric_piston', 'uev_robot_arm', 'uev_sensor',
  'uev_emitter', 'uev_field_generator', 'ca48_beam', 'target_wheel', 'tennessine_sample', 'superheavy_census',
  'degenerate_eos_model', 'barnard_gravity_survey', 'quantum_repeater_node', 'pulsar_navigation_chart', 'mass_radius_chart',
  'degenerate_matter', 'degenerate_pellet', 'sx_blade', 'sic_sic_plate', 'wf_w_tile', 'snspd', 'qd_source', 'sdd',
  'lobster_eye_mcp', 'aerogel_tile', 'hollow_core_fibre', 'faraday_isolator', 'bonded_fe16n2_magnet', 'barnard_core_rock',
].map((n) => 'grindless:' + n);
const PLAIN_BLOCKS = ['uev_fusion_casing', 'degenerate_containment_casing', 'photonic_casing'].map((n) => 'grindless:' + n);
const COIL = 'grindless:hftacn_coil_block';
const MATERIALS = {
  calcium_48: 'dust', potassium_40: 'dust', lithium_6: 'dust', plutonium_244: 'dust', curium_248: 'dust', californium_249: 'dust',
  lay_superhydride: 'ingot', ammonia_borane: 'dust', fe16n2: 'dust', iron_pentacarbonyl: 'liquid', hftacn: 'ingot', sic_sic: 'dust',
  tungsten_silicide: 'dust', tgg: 'dust', ppktp: 'dust', ffkm: 'dust', polycarbonate: 'dust', ule_glass: 'dust',
  interstellar_gas: 'gas', compressed_interstellar_gas: 'gas', hydrogen_deuterium_fraction: 'gas', helium_fraction: 'gas',
  dhe3_fuel_mix: 'gas', pb11_fuel: 'gas', polarised_dhe3_fuel: 'gas',
};
// S0-1: the exact ids the hull and hatches were proved with
const MACHINES = [
  'uev_machine_hull', 'uev_energy_input_hatch', 'uev_energy_input_hatch_16a', 'uev_energy_output_hatch', 'uev_energy_output_hatch_16a',
].map((n) => 'gtceu:' + n);
// GTM's own (S0-1 dump) or an older era's: F1 must not create them again. gtceu:uev_machine_casing exists too: F1 only gives it a recipe.
const EXISTING_MATERIALS = [
  'calcium', 'potassium', 'lithium', 'hafnium', 'tantalum', 'rhenium', 'ruthenium', 'terbium', 'lanthanum', 'yttrium', 'curium',
  'californium', 'tennessine', 'silicon_carbide', 'neon', 'uranium_233',
];
const RECIPE_IDS = [
  'uev_machine_casing', 'uev_machine_hull', 'uev_energy_input_hatch', 'uev_energy_output_hatch', 'uev_energy_input_hatch_16a',
  'uev_energy_output_hatch_16a',
];
// the DFD motors are B1's (S0-2), the optical computers have no recipe here. The UIV hull and hatches come from these same builders
// (UIV-F1, UXV-F1, S0-1 fallback: .tiers(UEV, UIV, UXV)), so they are checked apart
const NOT_F1 = ['grindless:dfd_motor_mk1', 'grindless:dfd_motor_mk2', 'gtceu:uev_machine_casing'];
const UIV_MACHINES = MACHINES.map((id) => id.replace('gtceu:uev_', 'gtceu:uiv_'));
const UXV_MACHINES = MACHINES.map((id) => id.replace('gtceu:uev_', 'gtceu:uxv_'));
const UHV_EUT = 2097152; // V[UHV]

const run = runPackScripts(pack);
const short = (id) => id.slice(id.indexOf(':') + 1);
const ours = (f) => /(^|[\\/])uev[\\/]foundation\.js$/.test(String(f));
const read = (...p) => fs.readFileSync(path.join(pack, 'kubejs', ...p), 'utf8');
const src = read('startup_scripts', 'grindless', 'uev', 'foundation.js');
const serverSrc = read('server_scripts', 'grindless', 'uev', 'foundation.js');
const matOf = (name) => run.registry.materials.get(name) || run.registry.materials.get('gtceu:' + name);

test('the stand-in runs the UEV foundation without errors', () => {
  const errs = run.errors.filter((e) => /(^|[\\/])uev[\\/]foundation/.test(String(e.file)) && e.stage !== 'console.error');
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
});

test('the id list is pinned: count and every id', () => {
  assert.equal(ITEMS.length, 31);
  assert.equal(PLAIN_BLOCKS.length + 1, 4);
  assert.equal(Object.keys(MATERIALS).length, 25);
  const got = run.global.grindless.uevFoundation;
  assert.deepEqual([...got.items], ITEMS);
  assert.deepEqual([...got.blocks], [...PLAIN_BLOCKS, COIL]);
  assert.deepEqual([...got.materials], Object.keys(MATERIALS).map((n) => 'gtceu:' + n));
  assert.deepEqual([...got.machines], MACHINES);
  assert.equal(Object.keys(got.ids).length, ITEMS.length + PLAIN_BLOCKS.length + 1 + Object.keys(MATERIALS).length);
});

test('every shared UEV id is registered once by this script, and nothing of B1', () => {
  for (const id of [...ITEMS, ...PLAIN_BLOCKS, COIL]) {
    assert.ok(run.registry.items.has(id), `${id} not registered`);
    assert.ok(ours(run.registry.items.get(id).file), `${id} is registered by another script`);
  }
  for (const [name, form] of Object.entries(MATERIALS)) {
    const mat = matOf(name);
    assert.ok(mat && ours(mat.file), `gtceu:${name} is not a GT material of foundation.js`);
    assert.ok(mat.forms.has(form), `gtceu:${name} lacks the ${form} form`);
    if (form === 'gas' || form === 'liquid') assert.ok(run.registry.fluids.has('gtceu:' + name), `gtceu:${name} fluid not registered`);
  }
  for (const id of MACHINES) {
    assert.ok(run.registry.machines.has(id), `${id} not registered`);
    assert.ok(ours(run.registry.machines.get(id).file), `${id} is registered by another script`);
  }
  for (const id of [...UIV_MACHINES, ...UXV_MACHINES]) {
    assert.ok(run.registry.machines.has(id), `${id} not registered (.tiers(UEV, UIV, UXV))`);
    assert.ok(ours(run.registry.machines.get(id).file), `${id} is registered by another script`);
  }
  assert.equal([...run.registry.machines.values()].filter((m) => ours(m.file)).length, MACHINES.length + UIV_MACHINES.length + UXV_MACHINES.length, 'F1 registers no other machine');
  for (const id of NOT_F1) {
    const it = run.registry.items.get(id) || run.registry.machines.get(id);
    assert.ok(!it || !ours(it.file), `${id} is not F1's`);
  }
  assert.doesNotMatch(src, /'(gtceu|grindless):(uiv|uxv)_|create\('u(iv|xv)_/, 'no UIV or UXV id of its own: the hull and hatches are the UEV builders at three tiers');
  assert.match(src, /\.tiers\(UEV, GTValues\.UIV, GTValues\.UXV\)/);
  assert.ok(!src.includes("'gtceu:uev_machine_casing'") && !/create\('(machine_casing|uev_machine_casing)'/.test(src), 'gtceu:uev_machine_casing exists already');
});

test('materials that already exist (S0-1) are not created again; the lay superhydride is a 4 A UEV cable', () => {
  for (const m of EXISTING_MATERIALS) {
    const mat = matOf(m);
    assert.ok(!mat || !ours(mat.file), `${m} exists already: foundation.js must not create it`);
  }
  assert.doesNotMatch(src, /materialModification/);
  assert.match(src, /cableProperties\(GTValues\.V\[UEV\], 4, 0, false\)/);
  assert.match(src, /const UEV = 10/);
});

test('the HfTaCN coil is a gtceu:coil of 12,600 K', () => {
  assert.match(src, /'gtceu:coil'/);
  assert.match(src, /temperature: 12600/);
  assert.equal(run.global.grindless.uevFoundation.coilTemperature, 12600);
});

test('the only recipes are the casing, the hull and the four hatches, assembled at UHV voltage', () => {
  assert.doesNotMatch(src, /ServerEvents|\.recipes\(/, 'the startup script has no recipe');
  const mine = run.docs.recipes.recipes.filter((r) => /(^|[\\/])uev[\\/]foundation\.js$/.test(String(run.recipeFiles.get(r.i))));
  assert.equal(mine.length, RECIPE_IDS.length);
  const ids = mine.map((r) => short(r.i).replace(/^[a-z_]+\//, '')).sort();
  assert.deepEqual(ids, [...RECIPE_IDS].sort());
  for (const r of mine) {
    assert.equal(r.t, /uev_machine_casing$/.test(r.i) ? 'gtceu:assembler' : 'gtceu:assembly_line', `${r.i} has the wrong recipe type`);
    assert.deepEqual(r.j.tickInputs.eu.map((e) => e.content), [UHV_EUT], `${r.i} runs at V[UHV]`);
    const out = JSON.stringify(r.j.outputs.item);
    const name = short(r.i).replace(/^[a-z_]+\//, '');
    assert.ok(out.includes('gtceu:' + name), `${r.i} outputs gtceu:${name}`);
  }
  const hull = mine.find((r) => /uev_machine_hull$/.test(r.i));
  assert.ok(hull, 'the hull recipe exists');
  assert.ok(JSON.stringify(hull.j.inputs.item).includes('gtceu:uev_machine_casing'));
  assert.ok(JSON.stringify(hull.j.inputs.item).includes('gtceu:lay_superhydride_single_cable'));
  assert.match(serverSrc, /UHV_EUT = 2097152/);
  // no recipe of the pack outside these files mentions the new ids' outputs as their own
  assert.doesNotMatch(serverSrc, /gtceu:uiv_|removeRecipe|\.remove\(/);
});

test('names and both tooltip lines in en_us and es_es; materials and machines named', () => {
  const problems = [];
  const blocks = [...PLAIN_BLOCKS, COIL];
  for (const lang of ['en_us', 'es_es']) {
    const L = run.lang[lang] || {};
    for (const id of [...ITEMS, ...blocks]) {
      const kind = ITEMS.includes(id) ? 'item' : 'block';
      for (const k of [`${kind}.grindless.${short(id)}`, `tooltip.grindless.${short(id)}.0`, `tooltip.grindless.${short(id)}.1`]) if (!L[k]) problems.push(`${lang} ${k}`);
    }
    for (const name of Object.keys(MATERIALS)) if (!L[`material.gtceu.${name}`]) problems.push(`${lang} material.gtceu.${name}`);
    for (const id of MACHINES) if (!L[`block.gtceu.${short(id)}`]) problems.push(`${lang} block.gtceu.${short(id)}`);
  }
  assert.deepEqual(problems, []);
  const en = run.lang.en_us; const es = run.lang.es_es;
  for (const id of [...ITEMS, ...blocks]) {
    for (const k of [`${ITEMS.includes(id) ? 'item' : 'block'}.grindless.${short(id)}`, `tooltip.grindless.${short(id)}.1`]) {
      assert.notEqual(es[k], en[k], k);
    }
  }
});

test('every item and plain block has its texture', () => {
  const missing = [];
  for (const id of ITEMS) if (!fs.existsSync(path.join(assets, 'textures', 'item', short(id) + '.png'))) missing.push(id);
  for (const id of PLAIN_BLOCKS) if (!fs.existsSync(path.join(assets, 'textures', 'block', 'uev', short(id) + '.png'))) missing.push(id);
  assert.deepEqual(missing, []);
  assert.match(src, /machine_coil_tritanium/, 'the coil borrows GTM\'s proved coil texture');
});
