// MAX-H1 (docs/eras/max.md lines 30 and 38, amended by docs/research/max-s0.md S0-12): the two lines of the Mirror shell's parts, each five steps
// on older machines and the GTM assembler. Line 30 ends in shell_cryocooler, line 38 in segment_controller; every step's input is the previous
// step's output, no input is a MAX product, no circuit repeats within a recipe type, and every row fits its machine's slots.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const kube = path.resolve(here, '..', '..', '..', 'pack', 'kubejs');
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const tables = (f) => JSON.parse(read('data', 'grindless', 'tables', f + '.json')).types;
const rowOf = (type, f, name) => tables(f)[type].recipes.find((r) => r.name === name);

const cascade = read('server_scripts', 'grindless', 'ev', 'extraction_cascade.js');
const shell = read('server_scripts', 'grindless', 'max', 'shell_parts.js');
const code = shell.replace(/^\s*\/\/.*$/gm, '');

const ids = (list) => (list || []).map((x) => x.id);
const assemblerRows = [...code.matchAll(/name: '([a-z0-9_]+)'[\s\S]*?items: \[([^\]]*)\][\s\S]*?fluids: \[\[([^\]]*)\]\][\s\S]*?out: '([^']+)'/g)]
  .map((m) => ({ name: m[1], items: [...m[2].matchAll(/'(?:\d+x )?([^']+)'/g)].map((x) => x[1]), fluids: m[3], out: m[4] }));
const asm = (n) => assemblerRows.find((r) => r.name === n);

const L30 = [
  rowOf('levitation_melting', 'levitation_melter', 'er3ni_ingot'),
  asm('er3ni_spheres'), asm('charged_pulse_tube'), asm('shell_cryocooler')
];
const L38 = [
  rowOf('crystal_growth', 'crystals', 'sic_substrate_wafer'),
  rowOf('silicon_carbide', 'power_devices', 'sic_cmos_wafer'),
  rowOf('mtj_sputtering', 'spin_deposition', 'mram_stack_sic'),
  rowOf('racetrack_patterning', 'spin_logic', 'racetrack_memory_die'),
  asm('segment_controller')
];

test('line 30: five steps, each consuming the product of the one before', () => {
  assert.match(cascade, /name: 'er_ho_strip', mode: 'max', circuit: 32,[\s\S]*?grindless:er_ho_oxide/);
  assert.ok(L30.every(Boolean));
  const inOf = (r) => (r.items ? r.items : ids(r.itemsIn));
  const outOf = (r) => (r.out ? [r.out] : ids(r.itemsOut));
  assert.ok(inOf(L30[0]).includes('grindless:er_ho_oxide'));
  for (let i = 1; i < L30.length; i++) assert.ok(inOf(L30[i]).includes(outOf(L30[i - 1])[0]), `step ${i + 1} takes step ${i}'s ingot, spheres or tube`);
  assert.equal(outOf(L30[3])[0], 'grindless:shell_cryocooler');
});

test('line 38: five steps, each consuming the product of the one before', () => {
  assert.ok(L38.every(Boolean));
  const inOf = (r) => (r.items ? r.items : ids(r.itemsIn));
  const outOf = (r) => (r.out ? [r.out] : ids(r.itemsOut));
  const chain = ['grindless:sic_substrate_wafer', 'grindless:sic_cmos_wafer', 'grindless:mram_stack_wafer', 'grindless:racetrack_memory_die', 'grindless:segment_controller'];
  chain.forEach((id, i) => assert.ok(outOf(L38[i]).includes(id), `step ${i + 1} makes ${id}`));
  for (let i = 1; i < L38.length; i++) assert.ok(inOf(L38[i]).includes(chain[i - 1]), `step ${i + 1} takes ${chain[i - 1]}`);
});

test('the circuits are the contract\'s and unique within each recipe type', () => {
  assert.equal(rowOf('levitation_melting', 'levitation_melter', 'er3ni_ingot').circuit, 20);
  assert.equal(rowOf('crystal_growth', 'crystals', 'sic_substrate_wafer').circuit, 32);
  assert.equal(rowOf('silicon_carbide', 'power_devices', 'sic_cmos_wafer').circuit, 10);
  assert.equal(rowOf('mtj_sputtering', 'spin_deposition', 'mram_stack_sic').circuit, 20);
  assert.equal(rowOf('racetrack_patterning', 'spin_logic', 'racetrack_memory_die').circuit, 3);
  for (const [t, f] of [['levitation_melting', 'levitation_melter'], ['crystal_growth', 'crystals'], ['silicon_carbide', 'power_devices'], ['mtj_sputtering', 'spin_deposition'], ['racetrack_patterning', 'spin_logic']]) {
    const c = tables(f)[t].recipes.map((r) => r.circuit).filter((n) => n > 0);
    assert.equal(new Set(c).size, c.length, `${t} has a repeated circuit`);
  }
  const ec = [...cascade.matchAll(/mode: '\w+', circuit: (\d+)/g)].map((m) => m[1]);
  assert.equal(new Set(ec).size, ec.length, 'the extraction cascade repeats a circuit');
});

test('every older row fits its machine: items, fluids and outputs', () => {
  const fit = (r, i, f, o, fo) => {
    assert.ok(r.itemsIn.length + (r.kept || []).length + (r.circuit ? 1 : 0) <= i, `${r.name} items in`);
    assert.ok(r.fluidsIn.length + (r.charge || []).length <= f, `${r.name} fluids in`);
    assert.ok(r.itemsOut.length <= o, `${r.name} items out`);
    assert.ok(r.fluidsOut.length <= fo, `${r.name} fluids out`);
  };
  fit(L30[0], 5, 1, 3, 1);
  fit(L38[0], 5, 2, 2, 0);
  fit(L38[1], 4, 3, 1, 1);
  fit(L38[2], 6, 1, 2, 1);
  fit(L38[3], 3, 1, 2, 0);
  assert.match(cascade, /er_ho_strip[\s\S]*?itemsIn: \[\{ id: MIX_CL, count: 32 \}\][\s\S]*?fluidsIn: \[[^\]]*\][\s\S]*?itemsOut: \[[^\]]*\]/);
});

test('the assembler steps stay single-fluid, have at least six distinct items and no MAX product enters either line', () => {
  assert.equal(assemblerRows.length, 4);
  for (const r of assemblerRows) {
    assert.equal(r.fluids.split('],').length, 1, `${r.name} takes one fluid`);
    assert.ok(new Set(r.items).size >= 6, `${r.name} has at least six distinct items`);
    assert.ok(!r.items.some((x) => /(^|:)max_|:horizon_strand/.test(x)), `${r.name} uses a MAX product`);
  }
  assert.doesNotMatch(code, /priority:/);
  for (const r of [...L30.slice(0, 1), ...L38.slice(0, 4)]) {
    assert.ok(!JSON.stringify(r).match(/:max_/), `${r.name} uses a MAX product`);
  }
});

test('no input of either line comes back through a loop', () => {
  const er = L30[0];
  assert.ok(!ids(er.itemsOut).includes('grindless:er_ho_oxide'));
  assert.ok(!ids(er.itemsOut).some((x) => /er3ni_spheres|charged_pulse_tube|shell_cryocooler/.test(x)));
  assert.ok(!ids(L38[0].itemsOut).includes('gtca:silicon_carbide_dust'));
  assert.ok(!ids(L38[2].itemsOut).includes('grindless:sic_cmos_wafer'));
});
