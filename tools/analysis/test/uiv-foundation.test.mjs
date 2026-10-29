// UIV foundation (package UIV-F1, startup_scripts/grindless/uiv/foundation.js): every shared UIV id of docs/eras/uiv.md is registered once
// with en_us and es_es names, drawn, and the only recipes are the hull and the four hatches, in GTM's assembler at UEV voltage. The hull and
// hatches themselves are uev/foundation.js's builders at a second tier (S0-1 fallback). The ids are pinned (count and every id): a changed id
// is an escalation (uiv.md, F1).
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
  'uiv_electric_motor', 'uiv_electric_pump', 'uiv_conveyor_module', 'uiv_electric_piston', 'uiv_robot_arm', 'uiv_sensor', 'uiv_emitter',
  'uiv_field_generator', 'ti50_oven_charge', 'element_119_recoil', 'element_120_recoil', 'superheavy_census_ii', 'u238_flash_target',
  'mh_winding', 'h_si28_wafer', 'p_si_die', 'eo_microcomb', 'telecom_memory', 'mk_cryostat_module', 'data_crystal_5d', 'wf_rhea_billet',
  'ps_cooling_laser', 'cage_part', 'sled_charge', 'neutronium_pellet', 'j0437_pulse_raw', 'xray_pulse_timed', 'pulsar_navigation_solution',
  'kerr_probe_data', 'correlated_kerr_data', 'recovered_half_sled', 'ns_eos_chart', 'kerr_chart', 'pulsar_timed_repeater',
].map((n) => 'grindless:' + n);
const PLAIN_BLOCKS = ['uiv_fusion_casing', 'neutron_star_site_casing'].map((n) => 'grindless:' + n);
const COIL = 'grindless:metallic_hydrogen_coil_block';
const MATERIALS = {
  'grindless:metallic_hydrogen': 'ingot', 'gtceu:rhea': 'ingot', 'gtceu:wf_rhea': 'ingot', 'gtceu:zrticunibe_glass': 'dust',
  'gtceu:prni5': 'dust', 'gtceu:lonsdaleite': 'dust', 'gtceu:cubic_gauche_nitrogen': 'dust', 'gtceu:gd_123': 'dust', 'gtceu:li_sn': 'liquid',
  'gtceu:ingaasb': 'dust', 'gtceu:titanium_50': 'dust', 'gtceu:europium_151': 'dust', 'gtceu:nickel_58': 'dust', 'gtceu:carbon_12': 'dust',
  'gtceu:niobium_pentoxide': 'dust', 'gtceu:erbium_oxide': 'dust', 'gtceu:praseodymium_oxide': 'dust', 'gtceu:gadolinium_oxide': 'dust',
  'grindless:he3he3_fuel': 'gas', 'grindless:pli6_fuel': 'gas', 'grindless:pn15_fuel': 'gas',
  'grindless:he3he3_plasma': 'gas', 'grindless:pli6_plasma': 'gas', 'grindless:pn15_plasma': 'gas',
  'grindless:he3he3_ash': 'gas', 'grindless:pli6_ash': 'gas', 'grindless:pn15_ash': 'gas',
};
const ADDED_DUSTS = ['gtceu:erbium', 'gtceu:einsteinium', 'gtceu:fermium'];
// S0-1: the exact ids the hull and hatches were proved with
const MACHINES = [
  'uiv_machine_hull', 'uiv_energy_input_hatch', 'uiv_energy_input_hatch_16a', 'uiv_energy_output_hatch', 'uiv_energy_output_hatch_16a',
].map((n) => 'gtceu:' + n);
// GTM's own (S0-1 dump) or an older era's: F1 must not create them again
const EXISTING_MATERIALS = ['titanium', 'silicon', 'europium', 'nickel', 'terbium', 'gadolinium', 'erbium', 'praseodymium', 'zirconium',
  'beryllium', 'molybdenum', 'germanium', 'antimony', 'tellurium', 'indium', 'einsteinium', 'fermium', 'neutronium', 'lithium', 'tungsten'];
const RECIPE_IDS = ['uiv_machine_hull', 'uiv_energy_input_hatch', 'uiv_energy_output_hatch', 'uiv_energy_input_hatch_16a', 'uiv_energy_output_hatch_16a'];
// B1's seeds and probe, W's cell, the machine casing (UEV's gate) and the UEV pattern's ids
const NOT_F1 = ['grindless:relay_seed', 'grindless:launched_relay_seed', 'grindless:ergosphere_probe', 'grindless:uiv_smes_cell',
  'gtceu:uiv_machine_casing', 'grindless:uev_electric_motor', 'grindless:pulsar_navigation_chart'];
const UEV_EUT = 8388608; // V[UEV]
const UIV_V = 33554432; // V[UIV]

const run = runPackScripts(pack);
const short = (id) => id.slice(id.indexOf(':') + 1);
const ours = (f) => /(^|[\\/])uiv[\\/]foundation\.js$/.test(String(f));
const read = (...p) => fs.readFileSync(path.join(pack, 'kubejs', ...p), 'utf8');
const src = read('startup_scripts', 'grindless', 'uiv', 'foundation.js');
const serverSrc = read('server_scripts', 'grindless', 'uiv', 'foundation.js');
const uevSrc = read('startup_scripts', 'grindless', 'uev', 'foundation.js');
const matOf = (key) => run.registry.materials.get(key) || run.registry.materials.get(short(key));

test('the stand-in runs the UIV foundation without errors', () => {
  const errs = run.errors.filter((e) => /(^|[\\/])uiv[\\/]foundation/.test(String(e.file)) && e.stage !== 'console.error');
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  const logged = run.errors.filter((e) => /(^|[\\/])uiv[\\/]foundation/.test(String(e.file)));
  assert.deepEqual(logged, [], 'no console.error (a skipped recipe or form)');
});

test('the id list is pinned: count and every id', () => {
  assert.equal(ITEMS.length, 34);
  assert.equal(PLAIN_BLOCKS.length + 1, 3);
  assert.equal(Object.keys(MATERIALS).length, 27);
  const got = run.global.grindless.uivFoundation;
  assert.deepEqual([...got.items], ITEMS);
  assert.deepEqual([...got.blocks], [...PLAIN_BLOCKS, COIL]);
  assert.deepEqual([...got.materials], Object.keys(MATERIALS));
  assert.deepEqual([...got.addedDusts], ADDED_DUSTS);
  assert.deepEqual([...got.machines], MACHINES);
  assert.equal(Object.keys(got.ids).length, ITEMS.length + PLAIN_BLOCKS.length + 1 + Object.keys(MATERIALS).length);
  assert.equal(new Set([...ITEMS, ...PLAIN_BLOCKS, COIL]).size, ITEMS.length + PLAIN_BLOCKS.length + 1, 'every id once');
});

test('every shared UIV id is registered once by this script, and nothing of B1 or W', () => {
  for (const id of [...ITEMS, ...PLAIN_BLOCKS, COIL]) {
    assert.ok(run.registry.items.has(id), `${id} not registered`);
    assert.ok(ours(run.registry.items.get(id).file), `${id} is registered by another script`);
  }
  for (const [key, form] of Object.entries(MATERIALS)) {
    const mat = matOf(key);
    assert.ok(mat && ours(mat.file), `${key} is not a GT material of foundation.js`);
    assert.ok(mat.forms.has(form), `${key} lacks the ${form} form`);
    if (form === 'gas' || form === 'liquid') assert.ok(run.registry.fluids.has('gtceu:' + short(key)), `${key} fluid not registered`);
  }
  for (const id of NOT_F1) {
    const it = run.registry.items.get(id) || run.registry.machines.get(id);
    assert.ok(!it || !ours(it.file), `${id} is not F1's`);
  }
  // the hull and hatches are the UEV builders at the second tier (S0-1): this script registers no machine
  assert.equal([...run.registry.machines.values()].filter((m) => ours(m.file)).length, 0, 'F1 registers no machine of its own');
  for (const id of MACHINES) {
    assert.ok(run.registry.machines.has(id), `${id} not registered by uev/foundation.js (.tiers(UEV, UIV))`);
    assert.ok(/(^|[\\/])uev[\\/]foundation\.js$/.test(String(run.registry.machines.get(id).file)), `${id} comes from the UEV builders`);
  }
  assert.match(uevSrc, /\.tiers\(UEV, GTValues\.UIV\)/);
  assert.doesNotMatch(src.replace(/^\s*\/\/.*$/gm, ''), /create\('(machine_hull|energy_|dynamo_)|\.tiers\(/, 'no hull or hatch builder of our own (a duplicate key crashes the boot)');
});

test('materials that exist already (S0-1) are not created again; metallic hydrogen is a 4 A UIV cable', () => {
  for (const m of EXISTING_MATERIALS) {
    const mat = matOf('gtceu:' + m);
    assert.ok(!mat || !ours(mat.file), `${m} exists already: foundation.js must not create it`);
  }
  assert.match(src, /cableProperties\(GTValues\.V\[UIV\], 4, 0, false\)/);
  assert.match(src, /const UIV = 11/);
  assert.equal(UIV_V, 2 ** 25);
  assert.match(src, /'grindless:metallic_hydrogen': \{ form: 'ingot'[^}]*cable: true/);
  assert.match(src, /'gtceu:rhea': \{[^}]*plate: true/, 'the hull takes an RHEA plate');
  assert.match(src, /GENERATE_PLATE/);
  // forms added to GTM's own materials: exactly erbium, einsteinium and fermium dust, through materialModification
  assert.match(src, /const ADDED_DUSTS = \['erbium', 'einsteinium', 'fermium'\]/);
  assert.match(src, /materialModification/);
  assert.match(src, /ensureSet\(PropertyKey\.DUST\)/);
});

test('the metallic hydrogen coil is a gtceu:coil of 14,400 K', () => {
  assert.match(src, /'gtceu:coil'/);
  assert.match(src, /temperature: 14400/);
  assert.match(src, /\.level\(11\)/);
  assert.equal(run.global.grindless.uivFoundation.coilTemperature, 14400);
});

test('the only recipes are the hull and the four hatches, assembled at UEV voltage', () => {
  assert.doesNotMatch(src, /ServerEvents|\.recipes\(/, 'the startup script has no recipe');
  const mine = run.docs.recipes.recipes.filter((r) => /(^|[\\/])uiv[\\/]foundation\.js$/.test(String(run.recipeFiles.get(r.i))));
  assert.equal(mine.length, RECIPE_IDS.length);
  const ids = mine.map((r) => short(r.i).replace(/^[a-z_]+\//, '')).sort();
  assert.deepEqual(ids, [...RECIPE_IDS].sort());
  for (const r of mine) {
    assert.equal(r.t, 'gtceu:assembly_line', `${r.i} is not an assembly line recipe`);
    assert.match(r.i, /^grindless:assembly_line\//, `${r.i} has the assembly_line id`);
    assert.ok((r.j.recipeConditions || []).some((c) => c.type === 'research'), `${r.i} has station research`);
    assert.deepEqual(r.j.tickInputs.eu.map((e) => e.content), [UEV_EUT], `${r.i} runs at V[UEV]`);
    const out = JSON.stringify(r.j.outputs.item);
    const name = short(r.i).replace(/^[a-z_]+\//, '');
    assert.ok(out.includes('gtceu:' + name), `${r.i} outputs gtceu:${name}`);
  }
  const hull = mine.find((r) => /uiv_machine_hull$/.test(r.i));
  assert.ok(hull, 'the hull recipe exists');
  const hullIn = JSON.stringify(hull.j.inputs.item);
  assert.ok(hullIn.includes('gtceu:uiv_machine_casing'));
  assert.match(hullIn, /metallic_hydrogen_single_cable/);
  assert.ok(hullIn.includes('gtceu:rhea_plate'));
  // 2 A hatches take single cables, 16 A hatches quadruple cables, each with its own circuit
  const cable = (n) => JSON.stringify(mine.find((r) => new RegExp(n + '$').test(r.i)).j.inputs.item);
  assert.match(cable('uiv_energy_input_hatch'), /metallic_hydrogen_single_cable/);
  assert.match(cable('uiv_energy_output_hatch_16a'), /metallic_hydrogen_quadruple_cable/);
  assert.match(serverSrc, /UEV_EUT = 8388608/);
  assert.doesNotMatch(serverSrc, /uiv_machine_casing'\)|removeRecipe|\.remove\(/, 'the casing recipe is UEV\'s gate');
  assert.match(serverSrc, /Item\.exists/, 'unverified ids are guarded');
  assert.match(serverSrc, /console\.error/);
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
    for (const key of Object.keys(MATERIALS)) {
      const k = `material.${key.split(':')[0]}.${short(key)}`;
      if (!L[k]) problems.push(`${lang} ${k}`);
    }
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

test('UEV keeps its labels: the hull and hatches are named by tier inside the definition', () => {
  assert.match(uevSrc, /GTValues\.VN\[tier\] \+ ' Machine Hull'/);
  assert.match(uevSrc, /GTValues\.VN\[tier\] \+ ' ' \+ label/);
  assert.doesNotMatch(uevSrc, /'UEV (Machine Hull|Energy Hatch|Dynamo Hatch|16A)/);
  for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang]['block.gtceu.uev_machine_hull'], `${lang} keeps UEV's hull name`);
});

test('every item and plain block has its texture', () => {
  const missing = [];
  for (const id of ITEMS) if (!fs.existsSync(path.join(assets, 'textures', 'item', short(id) + '.png'))) missing.push(id);
  for (const id of PLAIN_BLOCKS) if (!fs.existsSync(path.join(assets, 'textures', 'block', 'uiv', short(id) + '.png'))) missing.push(id);
  assert.deepEqual(missing, []);
  assert.match(src, /machine_coil_tritanium/, 'the coil borrows GTM\'s proved coil texture');
});
