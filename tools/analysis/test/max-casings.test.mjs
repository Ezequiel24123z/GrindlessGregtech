// MAX casing pass: the assembler rows of the optical table, membrane roller and Geroch drum casings.
import assert from 'node:assert/strict';
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
