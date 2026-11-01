// XP-A2: the MAX+ component lines C1 to C7 (docs/eras/maxplus.md). Static checks on maxplus/components.js and its EMI lines.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const src = read('server_scripts', 'grindless', 'maxplus', 'components.js');
const lang = read('client_scripts', 'grindless', 'maxplus_components_lang.js');

// [type, name, circuit] of the rows on the older machines (the OLD list), in the order of the design
const OLD = [
  ['magnet_winding', 'kerr_coil_winding', 22], ['shequid_assembly', 'balanced_bound_billet', 10],
  ['mtj_sputtering', 'wear_coated_rotor', 32], ['mtj_sputtering', 'nb_coated_cavity', 32], ['mtj_sputtering', 'electroded_pmn_stack', 32],
  ['ion_slicing', 'ln_on_diamond', 15], ['beuv_lithography', 'patterned_engine_wafer', 19], ['beuv_lithography', 'readout_wafer', 20],
  ['photonic_foundry', 'horizon_photonic_engine', 31], ['photonic_foundry', 'horizon_phase_sensor_core', 32],
  ['snspd_fabrication', 'snspd_array_die', 8], ['nuclear_demagnetisation', 'cold_snspd_module', 16], ['nuclear_demagnetisation', 'condensate_field_cell', 17],
  ['crystal_growth', 'pmn_pt_boule', 32], ['electron_beam_refining', 'refractory_coated_web', 32], ['srf_cavity', 'confinement_cavity', 8],
  ['membrane_rolling', 'horizon_belt', 4], ['pbo_synthesis', 'kerr_braided_web', 17], ['diamond_cvd', 'c12_photonic_plate', 12],
  ['mocvd', 'gan_laser_array', 32], ['solvent_extraction', 'pmn_precursor_oxides', 0]
];

const oldBlock = () => src.slice(src.indexOf('var OLD = ['), src.indexOf('var COOL ='));
const rowOf = (name) => {
  const b = oldBlock();
  const i = b.indexOf(`name: '${name}'`);
  assert.ok(i >= 0, name);
  const next = b.indexOf('{ type:', i);
  return b.slice(i, next < 0 ? b.length : next);
};

test('every older-machine row is in components.js once, with its circuit, within 32 and VA[MAX]', () => {
  for (const [type, name, circuit] of OLD) {
    assert.equal(oldBlock().split(`name: '${name}'`).length - 1, 1, name);
    const r = rowOf(name);
    assert.match(oldBlock().slice(oldBlock().lastIndexOf('{ type:', oldBlock().indexOf(`name: '${name}'`)), oldBlock().indexOf(`name: '${name}'`)), new RegExp(`type: '${type}'`), name);
    assert.match(r, new RegExp(`circuit: ${circuit},`), name);
    const eut = Number(/eut: (\d+)/.exec(r)[1]);
    assert.ok(eut > 0 && eut <= 2013265920, name);
    assert.ok(circuit <= 32, name);
  }
});

test('rows on one type and circuit are told apart by their item inputs', () => {
  const seen = new Map();
  for (const [type, name, circuit] of OLD) {
    const items = [...rowOf(name).matchAll(/'(?:\d+x )?([a-z0-9_]+:[a-z0-9_]+)'/g)].map((m) => m[1]);
    const inputs = /items: \[(.*?)\]/s.exec(rowOf(name))[1].match(/[a-z0-9_]+:[a-z0-9_]+/g);
    assert.ok(items.length > 0 && inputs.length > 0, name);
    const key = `${type}/${circuit}`;
    for (const prev of seen.get(key) || []) {
      assert.ok(!prev.every((x) => inputs.includes(x)) && !inputs.every((x) => prev.includes(x)), `${name} clashes in the lookup`);
    }
    seen.set(key, [...(seen.get(key) || []), inputs]);
  }
});

test('ids are type-prefixed and the helium refrigerator row is registered as power.js does', () => {
  assert.match(src, /gtceu\[r\.type\]\('grindless:' \+ r\.name\)/);
  assert.match(src, /closed_loop_cooling\('grindless:' \+ COOL\.name\)/);
  assert.match(src, /name: 'kerr_field_coil', input: 'grindless:impregnated_kerr_coil'/);
});

test('every older custom-type row with a data key has its EMI line in en_us', () => {
  for (const [type, name] of OLD) {
    const key = /dataKey: '(grindless_[a-z_]+)'/.exec(rowOf(name));
    if (!key) continue;
    assert.ok(lang.includes(`'gtceu.recipe.${key[1]}.${name}'`), `${key[1]}.${name}`);
  }
});

test('components.js makes the nine components and the casing', () => {
  for (const n of ['electric_motor', 'electric_pump', 'electric_piston', 'robot_arm', 'emitter', 'sensor', 'field_generator', 'conveyor_module', 'fluid_regulator']) {
    assert.match(src, new RegExp(`name: 'maxplus_${n}'`), n);
  }
  assert.match(src, /name: 'horizon_machine_casing'/);
});
