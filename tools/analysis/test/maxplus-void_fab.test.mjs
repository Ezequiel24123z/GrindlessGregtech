// XP-B4 (MAX+ void crystal fab, line P14): the stand-in run of maxplus/void_fab.js, row shape, circuits and lang parity.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const run = runPackScripts(pack);
const MV = run.global.grindless.maxPlusVoidFab;
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const lang = read(kube, 'client_scripts', 'grindless', 'maxplus_void_fab_lang.js');

test('the stand-in runs the scripts without errors and skips nothing', () => {
  const mine = run.errors.filter((e) => /maxplus[\\/]void_fab|maxplus_void_fab/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MV.skipped), []);
  assert.equal(MV.fab.length, 1);
  assert.equal(MV.rows.length, 3);
});

test('fab row: c1 at VA[MAX] at the Local Group filament; circuit 2 stays free for K2', () => {
  const [f] = plain(MV.fab);
  assert.equal(f.circuit, 1);
  assert.equal(f.dimension, 'grindless:local_group_filament');
  assert.ok(f.items.length >= 1, 'item input, so a circuit fits');
  assert.deepEqual(f.outs.map((o) => o[0]), ['grindless:void_grown_diamond']);
  assert.ok(!plain(MV.fab).some((r) => r.circuit === 2));
});

test('P14 is one chain on home-site older machines; one circuit per type', () => {
  const rows = plain(MV.rows);
  const chain = rows.map((r) => r.outs[0][0]);
  assert.deepEqual(chain, ['grindless:c12_seed_plate', 'grindless:nv_engineered_diamond', 'grindless:void_crystal_lattice']);
  for (const r of rows) assert.equal(r.dimension, undefined, r.name);
  const seen = new Set();
  for (const r of rows) {
    const k = `${r.type}:${r.circuit}`;
    assert.ok(!seen.has(k), `circuit clash ${k}`);
    seen.add(k);
  }
});

test('lang: machine, type, tooltip and every keyed row have an en_us entry', () => {
  for (const r of plain(MV.fab)) assert.ok(lang.includes(`grindless_void_crystal_fab.${r.name}'`), r.name);
  for (const r of plain(MV.rows).filter((x) => x.key)) assert.ok(lang.includes(`.${r.name}'`), `no lang key for ${r.name}`);
  assert.ok(lang.includes("'block.gtceu.void_crystal_fab'"));
  assert.ok(lang.includes("'gtceu.void_crystal_fab'"));
  assert.ok(lang.includes("'grindless.machine.void_crystal_fab.tooltip.0'"));
  assert.ok(lang.includes("ClientEvents.lang('en_us'"));
  assert.ok(!/[^\x00-\x7f]/.test(lang), 'non-ASCII characters must be \\u escapes');
});
