// XP-T1 (MAX+ Hills slingshot, lines P15 and P16, gate c16): the stand-in run of maxplus/slingshot.js, row shape, lang parity, the gate row and the test zone.
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
const MS = run.global.grindless.maxPlusSlingshot;
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const lang = read(kube, 'client_scripts', 'grindless', 'maxplus_slingshot_lang.js');

test('the stand-in runs the script without errors and skips nothing', () => {
  const mine = run.errors.filter((e) => /maxplus[\\/]slingshot/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MS.skipped), []);
  assert.equal(MS.slingshot.length, 2);
  assert.equal(MS.rows.length, 5);
});

test('slingshot rows: c1 binds, c2 releases at V[MAX] x 16 A; the counterweight is consumed', () => {
  const [c1, c2] = plain(MS.slingshot);
  assert.deepEqual([c1.circuit, c2.circuit], [1, 2]);
  assert.deepEqual(c1.items.map((i) => i[0]), ['grindless:ig_relay_probe', 'grindless:canned_counterweight']);
  assert.deepEqual(c1.outs.map((i) => i[0]), ['grindless:bound_probe_pair']);
  assert.deepEqual(c2.items.map((i) => i[0]), ['grindless:bound_probe_pair']);
  assert.deepEqual(c2.outs.map((i) => i[0]), ['grindless:launched_ig_probe']);
  assert.equal(c2.eut, 2 ** 35, 'V[MAX] x 16 A');
});

test('older rows: P15 at megabar c14, P16 at photonic foundry c28 and clock lab c9; unique circuit per type', () => {
  const rows = plain(MS.rows);
  const at = (type, circuit) => rows.find((r) => r.type === type && r.circuit === circuit);
  assert.deepEqual(at('megabar_synthesis', 14).outs, [['grindless:dense_counterweight_core', 1]]);
  assert.deepEqual(at('nuclear_clock', 9).outs, [['grindless:thorium_nav_clock', 1]]);
  assert.deepEqual(at('photonic_foundry', 28).outs, [['grindless:optical_nav_core', 1]]);
  assert.ok(at('photonic_foundry', 28).items.some(([id]) => id === 'grindless:thorium_nav_clock'), 'P16 is one chain: the clock goes into the nav core');
  assert.deepEqual(rows.find((r) => r.type === 'canner').outs, [['grindless:canned_counterweight', 1]]);
  const seen = new Set();
  for (const r of rows) {
    if (!r.circuit) continue;
    const k = `${r.type}:${r.circuit}`;
    assert.ok(!seen.has(k), `circuit clash ${k}`);
    seen.add(k);
  }
});

test('lang: machine, type, tooltip and every keyed row have an en_us entry', () => {
  for (const r of plain(MS.slingshot)) assert.ok(lang.includes(`grindless_hills_slingshot.${r.name}'`), `no lang key for ${r.name}`);
  for (const r of plain(MS.rows).filter((x) => x.key)) assert.ok(lang.includes(`.${r.name}'`), `no lang key for ${r.name}`);
  assert.ok(lang.includes("'block.gtceu.hills_slingshot'"));
  assert.ok(lang.includes("'gtceu.hills_slingshot'"));
  assert.ok(lang.includes("'grindless.machine.hills_slingshot.tooltip.0'"));
  assert.ok(lang.includes('grindless_warp_gate.hold_tarantula'));
  assert.ok(lang.includes("ClientEvents.lang('en_us'"));
  assert.ok(!/[^\x00-\x7f]/.test(lang), 'non-ASCII characters must be \\u escapes');
});

test('gate c16: hold_tarantula keeps the horizon lock and takes a launched probe', () => {
  const gate = JSON.parse(read(kube, 'data', 'grindless', 'tables', 'gate.json'));
  const row = gate.types.warp_gate.recipes.find((r) => r.circuit === 16);
  assert.equal(row.name, 'hold_tarantula');
  assert.equal(row.site, 'sgr_a_orbit');
  assert.deepEqual(row.itemsIn, [{ id: 'grindless:launched_ig_probe', count: 1 }]);
  assert.deepEqual(row.kept, [{ id: 'grindless:horizon_lock', count: 1 }]);
});

test('the zone row exists and does not overlap another', () => {
  const z = JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const list = z.zones || z;
  const mine = list.find((r) => r.id === 'maxplus_slingshot');
  assert.ok(mine);
  assert.deepEqual(mine.tests, ['maxplus_slingshot']);
  for (const o of list) {
    if (o === mine) continue;
    const overlap = o.x[0] <= mine.x[1] && mine.x[0] <= o.x[1] && o.z[0] <= mine.z[1] && mine.z[0] <= o.z[1] && o.y[0] <= mine.y[1] && mine.y[0] <= o.y[1];
    assert.ok(!overlap, `overlaps ${o.id}`);
  }
});
