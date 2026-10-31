// OpV-R1 Pathfinder (docs/eras/opv.md 'R1'), no game needed: the c12 gate row, the eight intermediates, the probe line, the kit and
// node-transmitter rows, the unpack recipe, names and textures. The second-hop throw itself runs in the game: gg_test_opv_pathfinder.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const tables = path.join(pack, 'kubejs', 'data', 'grindless', 'tables');
const GATE = JSON.parse(fs.readFileSync(path.join(tables, 'gate.json'), 'utf8'));
const P = run.global.grindless.opvPathfinder;
const INTERMEDIATES = ['polycapillary_optic', 'xray_timing_head', 'rejected_timing_head', 'clock_locked_head',
  'gan_mmic_tile', 'tested_mmic_tile', 'rejected_mmic_tile', 'sealed_mmic_tile'];
const lang = fs.readFileSync(path.join(pack, 'kubejs', 'client_scripts', 'grindless', 'opv_pathfinder_lang.js'), 'utf8');

test('the stand-in runs the pathfinder scripts without errors', () => {
  const errs = run.errors.filter((e) => /pathfinder/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.ok(P, 'global.grindless.opvPathfinder is published');
  assert.equal(P.skipped.length, 0, JSON.stringify(P.skipped));
});

test('gate c12 hold_terzan5: the probe goes in, the launched probe comes out, below 2^31 EU/t', () => {
  const rows = GATE.types.warp_gate.recipes.filter((r) => r.name === 'hold_terzan5');
  assert.equal(rows.length, 1);
  const r = rows[0];
  assert.equal(r.circuit, 12);
  assert.equal(r.site, 'cygnus_x1_orbit');
  assert.equal(r.eut, 2 ** 30);
  assert.equal(r.duration, 2400);
  assert.deepEqual(r.kept, []);
  assert.deepEqual(r.itemsIn.map((i) => [i.id, i.count]), [['grindless:pathfinder_probe', 1]]);
  assert.deepEqual(r.itemsOut.map((i) => [i.id, i.count]), [['grindless:launched_pathfinder', 1]]);
});

test('the eight intermediates are registered with textures and en_us/es_es names', () => {
  for (const n of INTERMEDIATES) {
    const id = `grindless:${n}`;
    assert.equal((run.registry.items.get(id) || {}).file, 'kubejs/startup_scripts/grindless/opv/pathfinder.js', id);
    assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'item', `${n}.png`)), `${n}.png`);
    assert.match(lang, new RegExp(`^\\s+${n}: \\['[^']+', '[^']+', `, 'm'), `${n} names`);
  }
  assert.ok(/en_us/.test(lang) && /es_es/.test(lang));
});

test('the probe line, the kit and the node transmitter produce the F1 ids at OpV voltage', () => {
  const out = Array.from(P.recipes);
  for (const id of ['grindless:assembly_line/pathfinder_probe', 'grindless:assembler/vitamin_kit',
    'grindless:assembler/node_power_transmitter', 'grindless:assembler/xray_timing_head', 'grindless:pathfinder_probe_core_unpack']) {
    assert.ok(out.includes(id), `${id} in ${JSON.stringify(out)}`);
  }
  const recipes = run.docs.recipes.recipes;
  for (const id of out.filter((id) => id !== 'grindless:pathfinder_probe_core_unpack')) {
    const r = recipes.find((r) => r.i === id);
    assert.ok(r, id);
    // The stand-in maps VA and V to the same table; native VA[OpV] is 503,316,480.
    assert.equal(r.j.tickInputs.eu[0].content, 536870912, `${id} tier 13 in the stand-in`);
  }
  const source = fs.readFileSync(path.join(pack, 'kubejs', 'server_scripts', 'grindless', 'opv', 'pathfinder.js'), 'utf8');
  assert.equal((source.match(/Number\(GTValues\.VA\[OPV\]\)/g) || []).length, 2);
});

test('the probe consumes the full seven-input contract and the assemblers fit six item / one fluid slots', () => {
  assert.deepEqual(Array.from(P.probe.items), [
    '1x grindless:tetron_array', '1x grindless:xnav_unit', '1x grindless:shequid_gyro', '1x grindless:hawking_drive',
    '2x gtceu:opv_sensor', '1x gtceu:opv_emitter', '2x #gtceu:circuits/opv'
  ]);
  for (const r of P.assembler) {
    assert.equal(new Set(Array.from(r.items, (s) => s.replace(/^\d+x /, ''))).size, 6, r.name);
    assert.equal(r.fluids.length, 1, r.name);
    assert.ok(r.out.length <= 2, r.name);
  }
  assert.ok(P.assembler.find((r) => r.name === 'vitamin_kit').items.includes('1x grindless:cryo_optical_link'));
});

test('older rows preserve their assigned circuits, J0437 site and reject destinations', () => {
  const row = (file, type, name) => JSON.parse(fs.readFileSync(path.join(tables, file), 'utf8')).types[type].recipes.find((r) => r.name === name);
  const xnav = row('j0437.json', 'xray_pulse_profiling', 'xnav_unit');
  assert.equal(xnav.circuit, 4); // c3 is UXV's ti44_map, never overwrite it.
  assert.equal(xnav.site, true);
  assert.equal(row('crystals.json', 'nuclear_clock', 'lock_timing_head').circuit, 5);
  assert.equal(row('power_devices.json', 'silicon_carbide', 'gan_mmic_tile').circuit, 7);
  assert.equal(row('electron_beam.json', 'electron_beam_refining', 'seal_node_tile').circuit, 24);
  const cascade = fs.readFileSync(path.join(pack, 'kubejs', 'server_scripts', 'grindless', 'ev', 'extraction_cascade.js'), 'utf8');
  assert.match(cascade, /name: 'rejected_timing_head_recovery', mode: 'opv', circuit: 28/);
  assert.match(cascade, /name: 'rejected_mmic_tile_gallium', mode: 'opv', circuit: 29/);
});

test('EMI explains the arrival, pending R2/R3 uses and rejects in both languages', () => {
  for (const name of ['arrival', 'transmitter']) {
    const page = JSON.parse(fs.readFileSync(path.join(pack, 'kubejs', 'assets', 'emi', 'recipe', 'additions', 'grindless', `opv_pathfinder_${name}.json`), 'utf8'));
    assert.equal(page.type, 'emi:info');
    for (const key of page.text) assert.ok(lang.includes(`['${key}',`), key);
  }
  for (const key of ['grindless_nuclear_clock.lock_timing_head', 'grindless_silicon_carbide.gan_mmic_tile',
    'grindless_electron_beam.seal_node_tile', 'grindless_xray_pulse_profiling.xnav_unit']) {
    assert.ok(lang.includes(`['gtceu.recipe.${key}',`), key);
  }
});

test('T1 checks two UXV 16 A hatches and the far platform only after a saved restart leg', () => {
  const overlay = fs.readFileSync(path.join(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_opv_pathfinder.js'), 'utf8');
  assert.equal((overlay.match(/id: 'gtceu:uxv_energy_input_hatch_16a'/g) || []).length, 2);
  assert.match(overlay, /platformChecks\('_after_restart'\)/);
  assert.match(overlay, /putString\(SAVED, String\(LOADED_AT\)\)/);
  assert.match(overlay, /check\('launched_output'/);
  assert.match(overlay, /forceload query 56 64/);
  assert.match(overlay, /forceload query 78 79/);
});
