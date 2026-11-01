// XP-A2: the MAX+ component lines C1 to C7 (docs/eras/maxplus.md). Static checks on the table rows, the older scripts and components.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const table = (f) => JSON.parse(fs.readFileSync(path.join(kube, 'data', 'grindless', 'tables', `${f}.json`), 'utf8'));
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const VA_MAX = 2013265920;

// [file, row, circuit, output]
const ROWS = [
  ['hts_magnet_works', 'kerr_coil_winding', 22, 'grindless:kerr_coil_winding'],
  ['shequid_mnt', 'balanced_bound_billet', 10, 'grindless:balanced_bound_billet'],
  ['spin_deposition', 'wear_coated_rotor', 28, 'grindless:wear_coated_rotor'],
  ['spin_deposition', 'nb_coated_cavity', 29, 'grindless:nb_coated_cavity'],
  ['spin_deposition', 'electroded_pmn_stack', 30, 'grindless:electroded_pmn_stack'],
  ['tfln_femtosecond', 'ln_on_diamond', 18, 'grindless:ln_on_diamond'],
  ['beuv_stm', 'patterned_engine_wafer', 19, 'grindless:patterned_engine_wafer'],
  ['beuv_stm', 'readout_wafer', 20, 'grindless:readout_wafer'],
  ['photonics', 'horizon_photonic_engine', 28, 'grindless:horizon_photonic_engine'],
  ['photonics', 'horizon_phase_sensor_core', 29, 'grindless:horizon_phase_sensor_core'],
  ['photonics_uev', 'snspd_array_die', 10, 'grindless:snspd_array_die'],
  ['memories_cryostat', 'cold_snspd_module', 31, 'grindless:cold_snspd_module'],
  ['memories_cryostat', 'condensate_field_cell', 30, 'grindless:condensate_field_cell'],
  ['electron_beam', 'refractory_coated_web', 32, 'grindless:refractory_coated_web'],
  ['electron_beam', 'confinement_cavity', 14, 'grindless:confinement_cavity'],
  ['crystals', 'pmn_pt_boule', 32, 'grindless:pmn_pt_boule'],
  ['membrane_line', 'horizon_belt', 4, 'grindless:horizon_belt'],
];

const find = (file, name) => {
  const hits = [];
  const tb = table(file); for (const t of tb.types ? Object.values(tb.types) : [tb]) for (const r of t.recipes || []) if (r.name === name) hits.push(r);
  return hits;
};

test('every XP-A2 table row exists once, makes its id and stays within VA[MAX] and circuit 32', () => {
  for (const [file, name, circuit, out] of ROWS) {
    const hits = find(file, name);
    assert.equal(hits.length, 1, name);
    const r = hits[0];
    assert.equal(r.circuit, circuit, name);
    assert.ok(r.circuit <= 32 && r.eut <= VA_MAX && r.duration > 0, name);
    assert.ok(ids(r.itemsOut).includes(out), name);
  }
});

test('the script rows exist: kerr_field_coil, kerr_braided_web, c12_photonic_plate, gan_laser_array, pmn_precursor_oxides', () => {
  assert.match(read('server_scripts', 'grindless', 'luv', 'helium_refrigerator.js'), /grindless:kerr_field_coil/);
  assert.match(read('server_scripts', 'grindless', 'uhv', 'elevator.js'), /name: 'kerr_braided_web', type: 'pbo_synthesis', circuit: 17/);
  assert.match(read('server_scripts', 'grindless', 'zpm', 'qubits.js'), /name: 'c12_photonic_plate', type: 'diamond_cvd', circuit: 12/);
  assert.match(read('server_scripts', 'grindless', 'uv', 'photonics.js'), /name: 'gan_laser_array'/);
  assert.match(read('server_scripts', 'grindless', 'ev', 'extraction_cascade.js'), /name: 'pmn_precursor_oxides'/);
});

test('components.js makes the nine components and the casing', () => {
  const src = read('server_scripts', 'grindless', 'maxplus', 'components.js');
  for (const n of ['electric_motor', 'electric_pump', 'electric_piston', 'robot_arm', 'emitter', 'sensor', 'field_generator', 'conveyor_module', 'fluid_regulator']) {
    assert.match(src, new RegExp(`name: 'maxplus_${n}'`), n);
  }
  assert.match(src, /name: 'horizon_machine_casing'/);
});
