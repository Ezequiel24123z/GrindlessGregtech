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
  assert.ok(r.eut < 2 ** 31);
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
});
