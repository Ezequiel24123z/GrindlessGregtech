// XP-H3 (MAX+ condensate assembler, lines T1 to T3, T14 to T16 and P25): the stand-in run of maxplus/assembler.js, row shape, lang parity and the test zone.
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
const MA = run.global.grindless.maxPlusAssembler;
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const lang = read(kube, 'client_scripts', 'grindless', 'maxplus_assembler_lang.js');

test('the stand-in runs the script without errors; only the unregistered frame-part row may be skipped', () => {
  const mine = run.errors.filter((e) => /maxplus[\\/]assembler/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MA.skipped).filter((s) => !/horizon_frame_part/.test(s.name)), []);
  assert.equal(MA.assembler.length, 4);
  assert.equal(MA.rows.length, 24);
  assert.equal(MA.coolRows.length, 2);
});

test('assembler rows: circuits 1 to 4, a condensate bath of 1e5 to 1e6 mB, boil-off byproduct', () => {
  const rows = plain(MA.assembler);
  assert.deepEqual(rows.map((r) => r.circuit), [1, 2, 3, 4]);
  for (const r of rows) {
    assert.equal(r.fluids.length, 1);
    assert.ok(r.fluids[0][1] >= 100000 && r.fluids[0][1] <= 1000000, `${r.name} bath`);
    assert.ok(r.items.length <= 9, `${r.name} has too many item inputs`);
    assert.ok(r.outs.some((o) => o[0] === 'grindless:condensate_boil_off'), `${r.name} has no boil-off`);
    assert.ok(r.duration >= 1200 && r.duration <= 2400, `${r.name} duration`);
  }
});

test('older rows: unique circuit per type, at most 32', () => {
  const seen = new Set();
  for (const r of plain(MA.rows)) {
    if (r.circuit === undefined || r.circuit === null) continue;
    assert.ok(r.circuit >= 1 && r.circuit <= 32, `${r.name} circuit`);
    const k = `${r.type}:${r.circuit}`;
    assert.ok(!seen.has(k), `circuit clash ${k} (${r.name})`);
    seen.add(k);
  }
});

test('lang: machine names and every keyed row have an en_us and es_es entry', () => {
  for (const r of plain(MA.assembler)) assert.ok(lang.includes(`grindless_condensate_assembler.${r.name}'`), `no lang key for ${r.name}`);
  for (const r of plain(MA.rows).filter((x) => x.key)) assert.ok(lang.includes(`.${r.name}'`), `no lang key for ${r.name}`);
  assert.ok(lang.includes("'block.gtceu.condensate_assembler'"));
  assert.ok(lang.includes("'gtceu.condensate_assembler'"));
  assert.ok(lang.includes("'grindless.machine.condensate_assembler.tooltip.0'"));
  assert.ok(lang.includes("['en_us', 'es_es']"));
  assert.ok(!/[^\x00-\x7f]/.test(lang), 'non-ASCII characters must be \\u escapes');
});

test('the zone row exists and does not overlap another', () => {
  const z = JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const list = z.zones || z;
  const mine = list.find((r) => r.id === 'maxplus_assembler');
  assert.ok(mine);
  assert.deepEqual(mine.tests, ['maxplus_assembler']);
  for (const o of list) {
    if (o === mine) continue;
    const overlap = o.x[0] <= mine.x[1] && mine.x[0] <= o.x[1] && o.z[0] <= mine.z[1] && mine.z[0] <= o.z[1] && o.y[0] <= mine.y[1] && mine.y[0] <= o.y[1];
    assert.ok(!overlap, `overlaps ${o.id}`);
  }
});
