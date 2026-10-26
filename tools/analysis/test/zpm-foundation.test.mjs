// ZPM foundation (package ZPM-F1, startup_scripts/grindless/zpm/foundation.js): every shared ZPM id of docs/eras/zpm.md is registered as
// the design writes it (the other ZPM packages use these ids), named in en_us and es_es with two tooltip lines, and drawn. Nothing that
// waits for spikes S0-1/S0-2 or for the wireless tier is registered here.
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
  'ring_ice_sample', 'ice_giant_atmosphere_sample', 'curium_oxide', 'carbon_nanotube_yarn', 'cvd_diamond_plate', 'qubit_array',
  'archaeal_culture', 'silica_aerogel', 'solar_core_survey', 'multimessenger_catalogue', 'neptune_probe_recording',
  'triton_probe_recording', 'neptune_flyby_data', 'triton_flyby_data', 'pluto_kuiper_chart', 'kuiper_target_list', 'scoop_head',
  'ring_sail_net', 'titan_entry_probe', 'tholin', 'lake_sampler', 'aerogel_cartridge', 'silica_nanograins', 'saturn_interior_model',
  'uranus_transfer_chart', 'ice_giant_diamond_seed', 'neptune_flyby_probe', 'neptune_sample', 'silicon_28_dust', 'pica_heat_shield',
  'radium_capsule',
].map((n) => 'grindless:' + n);
const BLOCKS = [
  'naquadria_containment_casing', 'pressure_hull_casing', 'photomultiplier_casing', 'cryostat_casing', 'probe_bay_casing', 'synroc_block',
].map((n) => 'grindless:' + n);
const FLUIDS = ['saturn_helium', 'uranus_hydrogen', 'enceladus_brine', 'actinide_raffinate', 'diamond_slurry', 'ring_ice'].map((n) => 'grindless:' + n);
// owned by later packages or waiting for spikes S0-1/S0-2: F1 must not register them
const NOT_F1 = [
  'grindless:zpm_smes_cell', 'grindless:zpm_wireless_energy_cover', 'grindless:zpm_wireless_dynamo_cover', 'grindless:titan_nitriles',
  'grindless:station_truss_casing', 'grindless:radiation_vault_casing',
];
const SPIKE = /rocket|motor|fuel_tank|planet|orbit|dimension|station/;

const run = runPackScripts(pack);
const short = (id) => id.slice(id.indexOf(':') + 1);
const ours = (f) => /zpm[\\/]foundation\.js$/.test(String(f));

test('the stand-in runs the ZPM foundation without errors', () => {
  const errs = run.errors.filter((e) => /zpm/.test(String(e.file)) && e.stage !== 'console.error');
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
});

test('every shared ZPM id is registered, is an id of docs/eras/zpm.md, and nothing of a later package or a spike', () => {
  const design = fs.readFileSync(path.join(root, 'docs', 'eras', 'zpm.md'), 'utf8');
  for (const id of [...ITEMS, ...BLOCKS]) {
    assert.ok(run.registry.items.has(id), `${id} not registered`);
    assert.match(run.registry.items.get(id).file, /zpm[\\/]foundation\.js$/, id);
  }
  for (const id of FLUIDS) {
    assert.ok(run.registry.fluids.has(id), `${id} fluid not registered`);
    assert.ok(ours(run.registry.fluids.get(id).file), id);
  }
  // the casings are named in words only (naquadria containment casing), the rest by id
  for (const id of [...ITEMS, ...BLOCKS, ...FLUIDS]) assert.ok(design.includes(short(id)) || design.includes(short(id).replace(/_/g, ' ')), `${id} is not named in docs/eras/zpm.md`);
  for (const id of NOT_F1) {
    const it = run.registry.items.get(id);
    assert.ok(!it || !ours(it.file), `${id} belongs to a later package`);
  }
  for (const [id, it] of run.registry.items) if (ours(it.file)) assert.ok(!SPIKE.test(short(id)), `${id} waits for spikes S0-1/S0-2`);
  for (const [id, it] of run.registry.items) if (ours(it.file)) assert.ok(id.startsWith('grindless:'), id);
});

test('the id table global.grindless.zpmFoundation is published', () => {
  const src = fs.readFileSync(path.join(pack, 'kubejs', 'startup_scripts', 'grindless', 'zpm', 'foundation.js'), 'utf8');
  assert.match(src, /G\.zpmFoundation/);
  assert.match(src, /ZPMF\.ids\[key\]/);
});

test('the scoop head joins the drill bit tag', () => {
  const src = fs.readFileSync(path.join(pack, 'kubejs', 'startup_scripts', 'grindless', 'zpm', 'foundation.js'), 'utf8');
  assert.match(src, /scoop_head: \{ stack: 16, tag: 'grindless:drill_bits' \}/);
});

test('names and both tooltip lines in en_us and es_es; fluids and buckets named', () => {
  const problems = [];
  for (const lang of ['en_us', 'es_es']) {
    const L = run.lang[lang] || {};
    for (const id of ITEMS) for (const k of [`item.grindless.${short(id)}`, `tooltip.grindless.${short(id)}.0`, `tooltip.grindless.${short(id)}.1`]) if (!L[k]) problems.push(`${lang} ${k}`);
    for (const id of BLOCKS) for (const k of [`block.grindless.${short(id)}`, `tooltip.grindless.${short(id)}.0`, `tooltip.grindless.${short(id)}.1`]) if (!L[k]) problems.push(`${lang} ${k}`);
    for (const id of FLUIDS) for (const k of [`fluid.grindless.${short(id)}`, `item.grindless.${short(id)}_bucket`]) if (!L[k]) problems.push(`${lang} ${k}`);
  }
  assert.deepEqual(problems, []);
  // the Spanish text is a translation, not a copy of the English one
  const en = run.lang.en_us; const es = run.lang.es_es;
  for (const id of [...ITEMS, ...BLOCKS]) {
    const k = `${ITEMS.includes(id) ? 'item' : 'block'}.grindless.${short(id)}`;
    assert.notEqual(es[k], en[k], k);
  }
});

test('every item and block has its texture', () => {
  const missing = [];
  for (const id of ITEMS) if (!fs.existsSync(path.join(assets, 'textures', 'item', short(id) + '.png'))) missing.push(id);
  for (const id of BLOCKS) if (!fs.existsSync(path.join(assets, 'textures', 'block', 'zpm', short(id) + '.png'))) missing.push(id);
  assert.deepEqual(missing, []);
});
