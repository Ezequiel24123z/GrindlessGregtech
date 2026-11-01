// XP-H1 (MAX+ meta-material loom, lines T4 to T7): the stand-in run of maxplus/loom.js, row shape, lang parity and the test zone.
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
const ML = run.global.grindless.maxPlusLoom;
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const lang = read(kube, 'client_scripts', 'grindless', 'maxplus_loom_lang.js');

test('the stand-in runs the script without errors, skips nothing', () => {
  const mine = run.errors.filter((e) => /maxplus[\\/]loom/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(ML.skipped), []);
  assert.equal(ML.loom.length, 4);
  assert.equal(ML.rows.length, 13);
});

test('loom rows: circuits 1 to 4, one fluid in, boil-off byproduct', () => {
  const rows = plain(ML.loom);
  assert.deepEqual(rows.map((r) => r.circuit), [1, 2, 3, 4]);
  for (const r of rows) {
    assert.equal(r.fluids.length, 1);
    assert.ok(r.items.length <= 6, `${r.name} has too many item inputs`);
    assert.ok(r.outs.some((o) => o[0] === 'grindless:condensate_boil_off'), `${r.name} has no boil-off`);
  }
});

test('older rows: unique circuit per type, at most 32', () => {
  const seen = new Set();
  for (const r of plain(ML.rows)) {
    if (r.circuit === undefined || r.circuit === null) continue;
    assert.ok(r.circuit >= 1 && r.circuit <= 32, `${r.name} circuit`);
    if (r.circuit === 32) continue;
    const k = `${r.type}:${r.circuit}`;
    assert.ok(!seen.has(k), `circuit clash ${k} (${r.name})`);
    seen.add(k);
  }
});

test('lang: loom names and every keyed row have an en_us and es_es entry', () => {
  for (const n of ['horizon_shielding', 'horizon_waveguide', 'horizon_conduit', 'horizon_valve_body']) assert.ok(lang.includes(`.${n}'`), `no lang key for ${n}`);
  assert.ok(lang.includes("'gtceu.meta_material_loom'"));
  assert.ok(lang.includes("'grindless.machine.meta_material_loom.tooltip.0'"));
  assert.ok(lang.includes("['en_us', 'es_es']"));
  assert.ok(!/[^\x00-\x7f]/.test(lang), 'non-ASCII characters must be \\u escapes');
});

test('the zone row exists and does not overlap another', () => {
  const z = JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const list = z.zones || z;
  const mine = list.find((r) => r.id === 'maxplus_loom');
  assert.ok(mine);
  assert.deepEqual(mine.tests, ['maxplus_loom']);
  for (const o of list) {
    if (o === mine) continue;
    const overlap = o.x[0] <= mine.x[1] && mine.x[0] <= o.x[1] && o.z[0] <= mine.z[1] && mine.z[0] <= o.z[1] && o.y[0] <= mine.y[1] && mine.y[0] <= o.y[1];
    assert.ok(!overlap, `overlaps ${o.id}`);
  }
});
