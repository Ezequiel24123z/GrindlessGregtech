// MAX casing pass: the assembler rows of the optical table, membrane roller and Geroch drum casings.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const run = runPackScripts(pack);
const MC = run.global.grindless.maxCasings;
const find = (id) => run.docs.recipes.recipes.find((r) => r.i === id);
const VA_MAX = 2013265920;
const CASINGS = ['max_optical_table_casing', 'membrane_roller_casing', 'geroch_drum_casing'];
// products of the machines that use each casing; none may be an input of that casing
const LOOP = /mirror_shell_segment|feeder_coil_casing|stream_|max_machine_hull|membrane|geroch|optical_table|rydberg/;

test('runs without errors and skips nothing', () => {
  const mine = run.errors.filter((e) => /max[\\/]casings/.test(String(e.file)));
  assert.deepEqual(mine, []);
  assert.deepEqual(JSON.parse(JSON.stringify(MC.skipped)), []);
});

for (const c of CASINGS) {
  test(`${c}: assembler row, 2 out, EU <= VA[MAX], no loop`, () => {
    const r = find(`grindless:assembler/${c}`);
    assert.ok(r, 'row exists');
    const s = JSON.stringify(r.j);
    assert.ok(Number((s.match(/"EUt":\s*(\d+)/) || [0, 0])[1]) <= VA_MAX);
    assert.match(s, new RegExp(`2x? ?grindless:${c}|"count":\\s*2`));
    const ins = JSON.stringify(r.j.inputs || r.j.itemInputs || r.j);
    const body = ins.replace(new RegExp(`grindless:${c}`, 'g'), '');
    assert.doesNotMatch(body, LOOP);
  });
}

// D5-CAS-MAX: the family (docs/eras/lines-opv-maxplus.md 7.2)
const text = (id) => JSON.stringify(find(id).j);
const FAMILY = {
  tensegrity_truss_casing: { ins: ['grindless:exotic_composite_rod', 'gtceu:horizon_strand_single_wire', 'grindless:chain_lamina_casing'], t: 200 },
  max_optical_table_casing: { ins: ['grindless:zero_expansion_baseplate', 'grindless:laminated_terfenol_stack', 'grindless:tensegrity_truss_casing'], t: 400 },
  membrane_vacuum_casing: { ins: ['grindless:superconducting_membrane', 'grindless:neg_xhv_casing', 'grindless:tensegrity_truss_casing'], t: 400 },
  droplet_radiator_casing: { ins: ['grindless:shell_droplet_radiator', 'grindless:tensegrity_truss_casing'], t: 400 },
  shell_window_coil_casing: { ins: ['grindless:max_field_coil', 'grindless:superconducting_membrane', 'gtceu:horizon_strand_single_wire', 'grindless:tensegrity_truss_casing'], t: 400 },
  clamp_coil_casing: { ins: ['grindless:max_field_coil', 'gtceu:horizon_strand_single_wire', 'grindless:tensegrity_truss_casing'], t: 400, id: 'grindless:assembler/clamp_coil_casing' }
};
for (const [n, f] of Object.entries(FAMILY)) {
  test(`${n}: assembler at VA[MAX], ${f.t} t, no circuit, its era inputs`, () => {
    const id = f.id || `grindless:assembler/${n}`;
    const r = find(id);
    assert.ok(r, 'row exists');
    assert.equal(r.t, 'gtceu:assembler');
    const s = text(id);
    for (const i of f.ins) assert.ok(s.includes(i), i);
    assert.ok(!s.includes('gtceu:circuits/') && !s.includes('programmed_circuit'));
    assert.ok(s.includes(String(VA_MAX)));
    assert.ok(new RegExp(`"duration":\\s*${f.t}\\b`).test(s) || s.includes(`"duration":${f.t}`), 'duration');
  });
}

test('the truss is the only casing of the family without a truss input, and the window coil is a plain block', () => {
  assert.ok(!text('grindless:assembler/tensegrity_truss_casing').includes('grindless:tensegrity_truss_casing"'));
  const kube = path.join(pack, 'kubejs');
  const src = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', 'max', 'foundation.js'), 'utf8');
  assert.ok(src.includes('shell_window_coil_casing') && !/ActiveBlock/.test(src));
});

test('the four new casings have texture, lang and EMI page', () => {
  const kube = path.join(pack, 'kubejs');
  const L = run.lang.en_us || {};
  for (const n of ['tensegrity_truss_casing', 'membrane_vacuum_casing', 'droplet_radiator_casing', 'shell_window_coil_casing']) {
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'max', `${n}.png`)), `${n} texture`);
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', `max_casing_${n}.json`)), `${n} EMI page`);
    for (const k of [`block.grindless.${n}`, `tooltip.grindless.${n}.0`, `tooltip.grindless.${n}.1`, `emi.grindless.info.${n}.0`]) assert.ok(L[k], k);
  }
});