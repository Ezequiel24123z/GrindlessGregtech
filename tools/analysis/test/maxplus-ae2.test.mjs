// XP-AE: the MAX+ AE2 lines A1 to A3 and the re-gates of the top AE2 add-on items (docs/eras/maxplus.md). Static checks on the scripts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const ae2 = read('server_scripts', 'grindless', 'maxplus', 'ae2.js');
const lang = read('client_scripts', 'grindless', 'maxplus_ae2_lang.js');
const mega = read('server_scripts', 'grindless', 'integration', 'megacells.js');
const exp = read('server_scripts', 'grindless', 'integration', 'expandedae.js');

const rowSrc = ae2.slice(ae2.indexOf('var ROWS = ['), ae2.indexOf('var CUTTERS'));
const rows = [...rowSrc.matchAll(/type: '(\w+)', name: '(\w+)', circuit: (\d+)[^\n]*\n([\s\S]*?)(?=\n    \{ type|\n  \])/g)].map((m) => ({
  type: m[1], name: m[2], circuit: Number(m[3]), body: m[0], ins: [...m[4].split('outs:')[0].matchAll(/'(grindless:\w+)'/g)].map((x) => x[1]),
  outs: [...(m[4].split('outs:')[1] || '').split('fluidOuts')[0].matchAll(/'(grindless:\w+)'/g)].map((x) => x[1]),
}));
const cutters = [...ae2.matchAll(/name: '(\w+)', eut: CUTTER_EUT[^\n]*input: '(grindless:\w+)', out: '(grindless:\w+)'/g)].map((m) => ({ name: m[1], input: m[2], out: m[3] }));

// type, name, circuit
const EXPECT = [
  ['mtj_sputtering', 'mram_stack_plus', 32], ['beuv_lithography', 'patterned_mram', 22], ['racetrack_patterning', 'racetrack_3d_stack', 7],
  ['mocvd', 'laser_array_wafer', 32], ['ion_slicing', 'ln_modulator_array', 20], ['photonic_foundry', 'optical_matrix_die', 32],
  ['photonic_integration', 'photonic_coprocessor', 10], ['crystal_growth', 'fe_ln_boule', 32], ['femtosecond_writing', 'addressed_holo_slab', 21],
  ['spectral_hole_burning', 'burned_pattern_crystal', 27], ['fibre_draw', 'pattern_memory_unit', 23],
];

test('ae2.js has the eleven older-machine rows at the allocated circuits, each making its own id', () => {
  assert.equal(rows.length, EXPECT.length);
  for (const [type, name, circuit] of EXPECT) {
    const r = rows.find((x) => x.name === name);
    assert.ok(r, name);
    assert.equal(r.type, type, name);
    assert.equal(r.circuit, circuit, name);
    assert.ok(r.outs.includes(`grindless:${name}`), name);
  }
});

test('the three lines chain from A1 die to A3 unit and the cutters sit in the right place', () => {
  const consumes = (name, id) => assert.ok(rows.find((x) => x.name === name).ins.includes(id), `${name} consumes ${id}`);
  consumes('patterned_mram', 'grindless:mram_stack_plus');
  consumes('racetrack_3d_stack', 'grindless:patterned_mram');
  consumes('ln_modulator_array', 'grindless:laser_array_wafer');
  consumes('optical_matrix_die', 'grindless:ln_modulator_array');
  consumes('photonic_coprocessor', 'grindless:optical_matrix_die');
  consumes('addressed_holo_slab', 'grindless:holographic_slab');
  consumes('burned_pattern_crystal', 'grindless:addressed_holo_slab');
  consumes('pattern_memory_unit', 'grindless:burned_pattern_crystal');
  assert.deepEqual(cutters.map((c) => [c.name, c.input, c.out]), [
    ['horizon_storage_die', 'grindless:racetrack_3d_stack', 'grindless:horizon_storage_die'],
    ['holographic_slab', 'grindless:fe_ln_boule', 'grindless:holographic_slab'],
  ]);
});

test('no two rows of one machine type share a circuit unless their item inputs differ', () => {
  const keys = rows.map((r) => `${r.type}|${r.circuit}|${[...new Set(r.ins)].sort().join(',')}`);
  assert.equal(new Set(keys).size, keys.length);
  for (const r of rows) assert.ok(r.circuit >= 1 && r.circuit <= 32, r.name);
  assert.ok(!/duration: (\d{5,})/.test(rowSrc), 'no inflated time');
});

test('every row with a data key has an EMI line in both languages', () => {
  for (const m of rowSrc.matchAll(/key: '(grindless_\w+)'/g)) assert.ok(m[1]);
  for (const r of rows.filter((x) => new RegExp(`name: '${x.name}'[^\\n]*key:`).test(rowSrc))) {
    assert.ok(lang.includes(`.${r.name}'`), r.name);
  }
  assert.ok(lang.includes("ClientEvents.lang('en_us'"));
});

test('MEGA Cells top tier asks for the A products and the lower tiers keep their recipes', () => {
  assert.match(mega, /grindless:horizon_storage_die/);
  assert.match(mega, /cell_component_256m/);
  for (const keep of ['cell_component_1m', 'cell_component_4m', 'cell_component_16m', 'cell_component_64m']) assert.ok(!mega.includes(`'megacells:cells/${keep}'`), keep);
  assert.ok(mega.includes("'megacells:inscriber/accumulation_processor'"));
});

test('Expanded AE top tier asks for the A products; the mid-game providers keep their gates', () => {
  assert.match(exp, /grindless:photonic_coprocessor/);
  assert.match(exp, /grindless:pattern_memory_unit/);
  assert.ok(exp.includes("'expandedae:crafting/exp_pattern_provider': HV"));
  assert.ok(exp.includes("'expandedae:crafting/exp_crafting_accelerator_1k': EV"));
});
