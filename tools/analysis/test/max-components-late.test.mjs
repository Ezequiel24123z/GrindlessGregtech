import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const VA_MAX = 2013265920;
const ML = run.global.grindless.maxComponentsLate;
const ids = JSON.parse(fs.readFileSync(path.join(kube, 'data', 'grindless', 'tables', 'max_ids.json'), 'utf8'));
const idText = JSON.stringify(ids);
const strip = (s) => s.replace(/^\d+x /, '');
const LAST = ['max_conveyor_module', 'max_sensor', 'max_field_generator'];
const row = (n) => ML.rows.find((r) => r.name === n);

test('components_late.js runs without errors and skips nothing', () => {
  assert.ok(ML, 'global.grindless.maxComponentsLate is published');
  assert.deepEqual(plain(ML.skipped), []);
  assert.equal(ML.recipes.length, 4);
});

test('the three last components are assembler rows at VA[MAX] with the cores of the Components table', () => {
  const need = {
    max_conveyor_module: ['2x grindless:max_electric_motor', '1x grindless:membrane_belt'],
    max_sensor: ['1x grindless:matter_wave_gradiometer', '2x #gtceu:circuits/max'],
    max_field_generator: ['1x grindless:max_emitter', '2x grindless:max_field_coil', '1x grindless:superconducting_membrane', '1x grindless:stable_exotic_matter']
  };
  for (const c of LAST) {
    const r = row(c);
    assert.equal(r.type, 'assembler');
    assert.equal(r.eut, null, c + ' runs at VA[MAX]');
    for (const core of need[c]) assert.ok(r.items.includes(core), c + ' takes ' + core);
    assert.equal(r.fluids.length, 1, c + ': a single-block assembler takes one fluid');
    assert.ok(new Set(r.items.map(strip)).size >= 6, c + ' meets the complexity floor (at least 6 distinct items)');
    assert.deepEqual(plain(r.out), ['1x grindless:' + c]);
    assert.ok(idText.includes('grindless:' + c), c + ' is registered by F1');
  }
  assert.equal(VA_MAX, 2013265920);
});

test('L8 last step: the cutter makes the power die from the power wafer, below VA[MAX]', () => {
  const r = row('diamond_power_die');
  assert.equal(r.type, 'cutter');
  assert.ok(r.eut < VA_MAX);
  assert.deepEqual(plain(r.items), ['1x grindless:diamond_power_wafer']);
  assert.deepEqual(plain(r.out), ['4x grindless:diamond_power_die']);
});

test('L8 older rows: circuits c9, c11, c16, c9 and the chain plate -> boron -> metallised -> wafer', () => {
  const t = (f) => JSON.parse(fs.readFileSync(path.join(kube, 'data', 'grindless', 'tables', f), 'utf8'));
  const flat = (x) => JSON.stringify(x);
  const sd = flat(t('spin_deposition.json')), pd = flat(t('power_devices.json'));
  assert.ok(sd.includes('metallised_diamond') && sd.includes('boron_delta_diamond'));
  assert.ok(pd.includes('diamond_power_wafer') && pd.includes('metallised_diamond'));
  const q = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'zpm', 'qubits.js'), 'utf8');
  assert.match(q, /name: 'power_diamond_plate', type: 'diamond_cvd', circuit: 9,/);
  assert.match(q, /name: 'boron_delta_diamond', type: 'ion_implantation', circuit: 11,/);
  assert.match(q, /grindless:power_diamond_plate', count: 1 \}, \{ id: 'gtceu:boron_dust'/);
});

test('the conveyor module and the field generator take the A2 max_fluid_regulator (closes its pendingUse)', () => {
  for (const c of ['max_conveyor_module', 'max_field_generator']) assert.ok(row(c).items.includes('1x grindless:max_fluid_regulator'), c);
});

test('no row of this file uses a circuit above 32 or consumes its own output', () => {
  for (const r of ML.rows) {
    const outs = r.out.map(strip);
    assert.ok(!r.items.map(strip).some((i) => outs.includes(i)), r.name + ' recycles');
  }
});
