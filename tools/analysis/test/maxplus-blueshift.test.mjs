// XP-B3 (MAX+ blueshift forge, lines P12, P13 and P24): the stand-in run of maxplus/blueshift.js, row shape, sites, circuits and lang parity.
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
const MB = run.global.grindless.maxPlusBlueshift;
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const lang = read(kube, 'client_scripts', 'grindless', 'maxplus_blueshift_lang.js');

test('the stand-in runs the scripts without errors and skips nothing', () => {
  const mine = run.errors.filter((e) => /maxplus[\\/]blueshift|maxplus_blueshift/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MB.skipped), []);
  assert.equal(MB.forge.length, 1);
  assert.equal(MB.rows.length, 13);
});

test('forge row: c1 at V[MAX] x 16 A at the M31 nucleus; tether and window worn 1 run in 32', () => {
  const [f] = plain(MB.forge);
  assert.equal(f.circuit, 1);
  assert.equal(f.eut, 2 ** 35);
  assert.equal(f.dimension, 'grindless:m31_nucleus_orbit');
  assert.deepEqual(f.chanced.map((c) => c[0]), ['grindless:deep_horizon_tether', 'grindless:coated_be_window']);
  for (const c of f.chanced) assert.equal(c[1], 313);
  assert.deepEqual(f.fluidOuts, [['gtceu:photonuclear_mix', 8000]]);
});

test('older rows keep their sites: only the stellar elevator is bound, to Cygnus X-1', () => {
  for (const r of plain(MB.rows)) {
    if (r.type === 'star_lifting') assert.equal(r.dimension, 'grindless:cygnus_x1_orbit');
    else assert.equal(r.dimension, undefined, r.name);
  }
});

test('lines: P12, P13 and P24 each chain to the forge inputs; one circuit per type', () => {
  const rows = plain(MB.rows);
  const outs = new Set(rows.flatMap((r) => (r.outs || []).map((o) => o[0])));
  for (const id of ['enriched_mo_target', 'p_nuclide_concentrate', 'deep_horizon_tether', 'coated_be_window', 'be_foil'])
    assert.ok(outs.has(`grindless:${id}`), id);
  assert.ok(rows.some((r) => r.fluidOuts && r.fluidOuts.some((f) => f[0] === 'gtceu:p_process_plasma')));
  const seen = new Set();
  for (const r of rows) {
    if (!r.circuit) continue;
    const k = `${r.type}:${r.circuit}`;
    assert.ok(!seen.has(k), `circuit clash ${k}`);
    seen.add(k);
  }
});

test('lang: machine, type, tooltip and every keyed row have an en_us and es_es entry', () => {
  for (const r of plain(MB.forge)) assert.ok(lang.includes(`grindless_blueshift_forge.${r.name}'`), r.name);
  for (const r of plain(MB.rows).filter((x) => x.key)) assert.ok(lang.includes(`.${r.name}'`), `no lang key for ${r.name}`);
  assert.ok(lang.includes("'block.gtceu.blueshift_forge'"));
  assert.ok(lang.includes("'gtceu.blueshift_forge'"));
  assert.ok(lang.includes("'grindless.machine.blueshift_forge.tooltip.0'"));
  assert.ok(lang.includes("['en_us', 'es_es']"));
  assert.ok(!/[^\x00-\x7f]/.test(lang), 'non-ASCII characters must be \\u escapes');
});
