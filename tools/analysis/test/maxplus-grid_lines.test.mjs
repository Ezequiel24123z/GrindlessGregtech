// XP-H4b: the MAX+ grid lines P19, T11, T12, T13 and T17 on the older machines (docs/eras/maxplus.md). Static checks on maxplus/grid_lines.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const src = fs.readFileSync(path.join(root, 'pack', 'kubejs', 'server_scripts', 'grindless', 'maxplus', 'grid_lines.js'), 'utf8');

const rowSrc = src.slice(src.indexOf('var ROWS = ['), src.indexOf('MG.rows = ROWS'));
const ids = (s) => [...s.matchAll(/\['((?:grindless|gtceu):\w+)', \d+\]/g)].map((x) => x[1]);
const rows = rowSrc.split(/\n    \{ type: /).slice(1).map((chunk) => {
  const head = /^'(\w+)', name: '(\w+)',(?: circuit: (\d+),)? eut: ([^,]+), duration: (\d+)/.exec(chunk);
  assert.ok(head, chunk.slice(0, 80));
  const part = (key, next) => {
    const a = chunk.indexOf(`${key}: [`);
    if (a < 0) return '';
    const rest = chunk.slice(a);
    const z = next.map((n) => rest.indexOf(`${n}: [`)).filter((i) => i > 0);
    return z.length ? rest.slice(0, Math.min(...z)) : rest;
  };
  return {
    type: head[1], name: head[2], circuit: head[3] ? Number(head[3]) : 0, eut: head[4], duration: Number(head[5]),
    ins: ids(part('items', ['fluids', 'outs', 'fluidOuts'])), outs: ids(part('outs', ['fluidOuts'])),
  };
});
const row = (name) => rows.find((r) => r.name === name);

// type, name, circuit (0 = item-keyed, no circuit)
const EXPECT = [
  ['zone_refining', 'fused_quartz_sphere_blank', 19], ['lathe', 'lapped_quartz_sphere', 0], ['mtj_sputtering', 'nb_coated_sphere', 32],
  ['shequid_assembly', 'calibrated_gyro', 8], ['shequid_assembly', 'cold_kerr_gyro', 15],
  ['single_crystal_casting', 'oriented_blade_blank', 29], ['megabar_synthesis', 'densified_blade', 18], ['lathe', 'edged_blade', 0],
  ['electron_beam_refining', 'coated_iris_blade', 0],
  ['nuclear_clock', 'nuclear_clock_reference', 10], ['photonic_foundry', 'optical_frequency_divider', 32], ['ion_slicing', 'phase_modulator_chip', 22],
  ['femtosecond_writing', 'inscribed_reference_crystal', 24], ['nuclear_demagnetisation', 'cold_reference_assembly', 32],
  ['chemical_vapour_infiltration', 'sic_chamber_flange', 21], ['srf_cavity', 'large_resonance_cell', 13], ['chemical_bath', 'polished_resonance_cell', 8],
  ['mtj_sputtering', 'coated_resonance_cell', 32], ['nuclear_demagnetisation', 'resonance_chamber', 32],
  ['mocvd', 'inp_1550_laser_die', 32], ['fibre_draw', 'er_amplifier_fibre', 24], ['photonic_foundry', 'laser_comm_engine', 32],
  ['mtj_sputtering', 'coated_telescope_optic', 32], ['assembler', 'horizon_comm_terminal', 0],
];

test('grid_lines.js has the twenty-four older-machine rows at the allocated circuits, each making its own id', () => {
  assert.equal(rows.length, EXPECT.length);
  for (const [type, name, circuit] of EXPECT) {
    const r = row(name);
    assert.ok(r, name);
    assert.equal(r.type, type, name);
    assert.equal(r.circuit, circuit, name);
    assert.ok(r.outs.includes(`grindless:${name}`), name);
  }
});

test('each line chains from its first step to the id the hyper array or the next package takes', () => {
  const consumes = (name, id) => assert.ok(row(name).ins.includes(id), `${name} consumes ${id}`);
  consumes('lapped_quartz_sphere', 'grindless:fused_quartz_sphere_blank');
  consumes('nb_coated_sphere', 'grindless:lapped_quartz_sphere');
  consumes('calibrated_gyro', 'grindless:nb_coated_sphere');
  consumes('cold_kerr_gyro', 'grindless:calibrated_gyro');
  consumes('densified_blade', 'grindless:oriented_blade_blank');
  consumes('edged_blade', 'grindless:densified_blade');
  consumes('coated_iris_blade', 'grindless:edged_blade');
  consumes('optical_frequency_divider', 'grindless:nuclear_clock_reference');
  consumes('phase_modulator_chip', 'grindless:optical_frequency_divider');
  consumes('inscribed_reference_crystal', 'grindless:phase_modulator_chip');
  consumes('cold_reference_assembly', 'grindless:inscribed_reference_crystal');
  consumes('large_resonance_cell', 'grindless:sic_chamber_flange');
  consumes('polished_resonance_cell', 'grindless:large_resonance_cell');
  consumes('coated_resonance_cell', 'grindless:polished_resonance_cell');
  consumes('resonance_chamber', 'grindless:coated_resonance_cell');
  consumes('er_amplifier_fibre', 'grindless:inp_1550_laser_die');
  consumes('laser_comm_engine', 'grindless:er_amplifier_fibre');
  consumes('horizon_comm_terminal', 'grindless:laser_comm_engine');
  consumes('horizon_comm_terminal', 'grindless:coated_telescope_optic');
  consumes('oriented_blade_blank', 'grindless:kerr_strange_plate');
  consumes('inscribed_reference_crystal', 'grindless:void_crystal_lattice');
});

test('no two rows of one machine type share a circuit unless their item inputs differ; no row is a subset of another of its type', () => {
  const keys = rows.map((r) => `${r.type}|${r.circuit}|${[...new Set(r.ins)].sort().join(',')}`);
  assert.equal(new Set(keys).size, keys.length);
  for (const r of rows) assert.ok(r.circuit >= 0 && r.circuit <= 32, r.name);
  for (const r of rows.filter((x) => x.circuit === 0)) {
    for (const o of rows.filter((x) => x !== r && x.type === r.type)) {
      assert.ok(![...new Set(r.ins)].every((i) => o.ins.includes(i)), `${r.name} is a subset of ${o.name}`);
    }
  }
  assert.ok(!/duration: (\d{5,})/.test(rowSrc), 'no inflated time');
  assert.ok(rows.every((r) => r.duration >= 400 && r.duration <= 2400), 'durations stay small');
});

test('no literal at or above 2^31 and no EMI data key (the text lives in lang files this package does not own)', () => {
  assert.ok(!/\b(2[1-9]\d{8}|[3-9]\d{9}|\d{11,})\b/.test(src), 'a literal at or above 2^31');
  assert.ok(!/addDataString|key: '/.test(src));
  assert.match(src, /^\/\/ priority: -\d+$/m);
});

test('every output that is not the product is an inert gas, a working fluid or an acid returned to its line', () => {
  const allowed = /'(gtceu:(argon|helium|superfluid_helium|hydrogen|hydrochloric_acid|spent_electropolish_acid))'/;
  for (const m of rowSrc.matchAll(/fluidOuts: \[\[([^\]]+)\]/g)) assert.match(`'${m[1].split("'")[1]}'`, allowed);
});
