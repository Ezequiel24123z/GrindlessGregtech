// XP-H2 (MAX+ multi-plasma blender and horizon crystal furnace, lines T8, T9 and T10): the stand-in run of maxplus/crystals.js, row shape, sites,
// circuits, the 2.56e8 mB slurry bill (one MAX fluid hatch per core run) and the English names.
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
const MC = run.global.grindless.maxPlusCrystals;
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const lang = read(kube, 'client_scripts', 'grindless', 'maxplus_crystals_lang.js');

test('the stand-in runs the scripts without errors and skips nothing', () => {
  const mine = run.errors.filter((e) => /maxplus[\\/]crystals|maxplus_crystals/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MC.skipped), []);
  assert.equal(MC.rows.length, 9);
  assert.equal(MC.blender.length, 1);
  assert.equal(MC.furnace.length, 2);
  assert.deepEqual(plain(MC.controllers).map((c) => c.name), ['multi_plasma_blender', 'horizon_crystal_furnace']);
});

test('blender row: eight fluids of 1,000 mB make 1,000 mB of slurry at V[MAX] x 64 A for 100 t, with no site', () => {
  const [b] = plain(MC.blender);
  assert.equal(b.fluids.length, 8);
  assert.equal(new Set(b.fluids.map((f) => f[0])).size, 8);
  for (const f of b.fluids) assert.equal(f[1], 1000);
  assert.deepEqual(b.fluidOuts, [['gtceu:horizon_crystal_slurry', 1000]]);
  assert.equal(b.eut, 2 ** 37);
  assert.equal(b.duration, 100);
  assert.equal(b.dimension, undefined);
  assert.equal(b.items, undefined);
});

test('furnace rows: c1 core and c2 controller boule at V[MAX] x 256 A for 2,400 t; the core bill is 4,000,000 mB x 64 = 2.56e8 mB, each slurry input fits one MAX fluid hatch', () => {
  const [core, ctrl] = plain(MC.furnace);
  assert.deepEqual([core.circuit, ctrl.circuit], [1, 2]);
  assert.deepEqual([core.outs[0][0], ctrl.outs[0][0]], ['grindless:core_crystal_boule', 'grindless:controller_crystal_boule']);
  for (const r of [core, ctrl]) {
    assert.equal(r.eut, 2 ** 39);
    assert.equal(r.duration, 2400);
    assert.equal(r.dimension, undefined);
    assert.ok(r.fluids.some((f) => f[0] === 'gtceu:kerr_condensate'), 'heat from condensate');
    assert.ok(r.items.some((i) => i[0] === 'grindless:kerr_strange_plate'), 'P3 lines the crucible');
  }
  const slurry = core.fluids.find((f) => f[0] === 'gtceu:horizon_crystal_slurry')[1];
  assert.equal(slurry * 64, 2.56e8);
  // GTM 7.5.3: a MAX fluid hatch holds 8,000 x 2^9 = 4,096,000 mB (the capacity lint's tank)
  for (const r of [core, ctrl]) for (const f of r.fluids) assert.ok(f[1] <= 4096000, f[0] + ' ' + f[1] + ' mB fits one MAX hatch');
});

test('older rows keep a site only where they use the place: the elevator is bound to Cygnus X-1; the rest run anywhere', () => {
  for (const r of plain(MC.rows)) {
    if (r.type === 'star_lifting') assert.equal(r.dimension, 'grindless:cygnus_x1_orbit', r.name);
    else assert.equal(r.dimension, undefined, r.name);
  }
});

test('lines: T8, T9 and T10 chain to the blender and the furnace; circuits are unique per type unless the item inputs differ', () => {
  const rows = [...plain(MC.rows), ...plain(MC.blender), ...plain(MC.furnace)];
  const outs = new Set(rows.flatMap((r) => [...(r.outs || []), ...(r.fluidOuts || [])].map((o) => o[0])));
  for (const id of ['grindless:sapphire_seed_plate', 'grindless:condensate_doped_dust', 'grindless:core_crystal_boule', 'grindless:inscribed_core_crystal',
    'grindless:horizon_core_crystal', 'gtceu:molten_kerr_strange', 'grindless:controller_seed', 'grindless:controller_crystal_boule',
    'grindless:horizon_controller_crystal', 'gtceu:lifted_stellar_plasma', 'gtceu:filtered_stellar_plasma', 'gtceu:horizon_crystal_slurry'])
    assert.ok(outs.has(id), id);
  const seen = new Map();
  for (const r of rows) {
    if (!r.circuit) continue;
    const k = `${r.type}:${r.circuit}`;
    const items = JSON.stringify((r.items || []).map((i) => i[0]).sort());
    assert.ok(!seen.has(k) || seen.get(k) !== items, `circuit clash ${k} with the same inputs`);
    seen.set(k, items);
  }
});

test('lang: machines, types, tooltips and every keyed row have an en_us entry (English only, EN-1)', () => {
  for (const r of [...plain(MC.blender), ...plain(MC.furnace), ...plain(MC.rows)].filter((x) => x.key))
    assert.ok(lang.includes(`${r.key}.${r.name}'`), `no lang key for ${r.name}`);
  for (const m of ['multi_plasma_blender', 'horizon_crystal_furnace']) {
    assert.ok(lang.includes(`'block.gtceu.${m}'`), m);
    assert.ok(lang.includes(`'gtceu.${m}'`), m);
    assert.ok(lang.includes(`'grindless.machine.${m}.tooltip.0'`), m);
  }
  assert.ok(lang.includes("ClientEvents.lang('en_us'"));
  assert.ok(!lang.includes('es_es'));
  assert.ok(!/[^\x00-\x7f]/.test(lang), 'non-ASCII characters must be \\u escapes');
});
