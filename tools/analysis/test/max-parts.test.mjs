import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const MP = run.global.grindless.maxParts;
const table = JSON.parse(fs.readFileSync(path.join(tables, 'max_parts.json'), 'utf8'));
const ids = JSON.stringify(JSON.parse(fs.readFileSync(path.join(tables, 'max_ids.json'), 'utf8')));
const opv = JSON.parse(fs.readFileSync(path.join(tables, 'opv_ids.json'), 'utf8'));
const parts = () => MP.recipes.filter((r) => r.machine);

test('parts.js runs without errors and skips nothing', () => {
  assert.ok(MP, 'global.grindless.maxParts is published');
  assert.deepEqual(plain(MP.skipped), []);
  assert.deepEqual(plain(MP.clashes), []);
  assert.equal(parts().length, 27);
  assert.equal(MP.recipes.length, 28);
});

test('the rows cover every gtceu:max_* part of the OpV id list except hull, casing and battery cell rows made elsewhere', () => {
  const have = parts().map((r) => String(r.machine)).sort();
  const want = (opv.max || []).filter((i) => !/machine_hull|machine_casing/.test(i)).sort();
  assert.deepEqual(plain(have), want);
});

test('every row meets the hatch rule: MAX hull (but the battery), at least 2 MAX components, MAX circuits, a horizon strand cable', () => {
  assert.equal(table.hull, 'gtceu:max_machine_hull');
  assert.equal(table.circuits.id, '#gtceu:circuits/max');
  assert.ok(table.circuits.count >= 2);
  assert.equal(table.cable.id, 'gtceu:horizon_strand_single_cable');
  const circuits = new Set();
  for (const r of table.machines) {
    assert.ok(!circuits.has(r.circuit), r.machine + ' reuses circuit ' + r.circuit);
    circuits.add(r.circuit);
    assert.ok(r.circuit >= 1 && r.circuit <= 32, r.machine + ' circuit in 0..32');
    const total = r.components.reduce((n, c) => n + c.count, 0);
    assert.ok(total >= 2, r.machine + ' has at least 2 components');
    for (const c of r.components) assert.ok(ids.includes(c.id), c.id + ' is registered by F1');
    if (r.machine === 'gtceu:max_battery') assert.equal(r.hull, false);
    else assert.notEqual(r.hull, false);
  }
});

test('families take the contract cores: dies for energy, membranes for fluid, conveyors for buses, L39 module for substation and converters, SMES toroid for the battery', () => {
  const take = (m, id) => table.machines.find((r) => r.machine === m).components.some((c) => c.id === 'grindless:' + id);
  assert.ok(take('gtceu:max_energy_input_hatch', 'diamond_power_die'));
  assert.ok(take('gtceu:max_energy_output_hatch_16a', 'diamond_power_die'));
  assert.ok(take('gtceu:max_input_hatch_9x', 'superconducting_membrane'));
  assert.ok(take('gtceu:max_output_hatch', 'superconducting_membrane'));
  assert.ok(take('gtceu:max_input_bus', 'max_conveyor_module'));
  assert.ok(take('gtceu:max_output_bus', 'max_conveyor_module'));
  assert.ok(take('gtceu:max_substation_input_hatch_64a', 'cold_fcl_module'));
  assert.ok(take('gtceu:max_16a_energy_converter', 'cold_fcl_module'));
  assert.ok(take('gtceu:max_battery', 'cold_smes_toroid'));
  for (const r of table.machines) {
    if (/input_hatch|input_bus/.test(r.machine) && !/dual|substation/.test(r.machine)) assert.ok(r.components.some((c) => c.id === 'grindless:max_sensor' || c.id === 'grindless:max_conveyor_module'), r.machine);
    if (/output_hatch|output_bus/.test(r.machine) && !/dual|substation/.test(r.machine)) assert.ok(r.components.some((c) => c.id === 'grindless:max_emitter' || c.id === 'grindless:max_conveyor_module'), r.machine);
  }
});

test('L39: bender row, coated conductor c8, oxide PLD c5, HTS c14 and the refrigerator row', () => {
  assert.equal(MP.bender.output, 'grindless:fcl_substrate_strip');
  assert.ok(MP.bender.eut < 2013265920);
  const t = (f) => fs.readFileSync(path.join(tables, f), 'utf8');
  assert.match(t('coated_conductor_line.json'), /"name": "fcl_tape"[\s\S]*?"circuit": 8/);
  assert.match(t('spin_deposition.json'), /"name": "thick_film_fcl_tape"[\s\S]*?"circuit": 5/);
  assert.match(t('hts_magnet_works.json'), /"name": "fcl_coil"[\s\S]*?"circuit": 14/);
  const h = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'luv', 'helium_refrigerator.js'), 'utf8');
  assert.match(h, /name: 'cold_fcl_module', input: 'grindless:fcl_coil', output: 'grindless:cold_fcl_module'/);
});
