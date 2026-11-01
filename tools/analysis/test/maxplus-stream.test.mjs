// XP-B2 (MAX+ machines 7-8 at the Magellanic Stream, lines P9, P10, P11, P22 and P23): the stand-in run of maxplus/stream.js, row shape, circuits, lang parity, the zone row.
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
const MS = run.global.grindless.maxPlusStream;
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const lang = read(kube, 'client_scripts', 'grindless', 'maxplus_stream_lang.js');
const server = read(kube, 'server_scripts', 'grindless', 'maxplus', 'stream.js');
const rows = plain(MS.rows);
const row = (type, name) => rows.find((r) => r.type === type && r.name === name);
const ins = (r) => (r.items || []).map((i) => i[0]);
const outs = (r) => (r.outs || []).map((i) => i[0]);

test('the stand-in runs the scripts without errors and skips nothing', () => {
  const mine = run.errors.filter((e) => /maxplus[\\/]stream/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MS.skipped), []);
  assert.equal(plain(MS.controllers).length, 2);
});

test('machine rows: the gas works takes 2^33 EU/t, the torus makes 2^34 EU/t; wear 1 in 64 and 1 in 128', () => {
  assert.equal(row('pristine_gas_works', 'pristine_gas').eut, 2 ** 33);
  assert.deepEqual(row('pristine_gas_works', 'pristine_gas').wear, [['grindless:magnetic_scoop_module', 156]]);
  const t = row('primordial_fusion_torus', 'helium_4_ash');
  assert.equal(t.eut, -(2 ** 34));
  assert.deepEqual(t.wear.map((w) => w[0]).sort(), ['grindless:direct_converter_stack', 'grindless:neutral_beam_injector']);
});

test('each line is one chain: every step feeds the next', () => {
  const fl = (r, k) => (r[k] || []).map((f) => f[0]);
  assert.ok(fl(row('cryogenic_processing', 'liquid_pristine_hydrogen'), 'fluids').includes('gtceu:pristine_gas'), 'P9 gas into the cryo row');
  assert.ok(fl(row('distillation_tower', 'hd_fraction'), 'fluids').includes('gtceu:liquid_pristine_hydrogen'), 'P9 liquid into the tower');
  assert.ok(fl(row('calutron_separation', 'primordial_deuterium'), 'fluids').includes('gtceu:hd_fraction'), 'P9 fraction into the calutron');
  assert.ok(fl(row('calutron_separation', 'primordial_deuterium'), 'fluidOuts').includes('gtceu:primordial_deuterium'), 'P9 deuterium out');
  assert.ok(fl(row('superfluid_helium', 'he3_enriched_helium'), 'fluids').includes('gtceu:pristine_helium'), 'P10 helium into the superfluid row');
  assert.ok(fl(row('distillation_tower', 'crude_helium_3'), 'fluids').includes('gtceu:he3_enriched_helium'), 'P10 enriched into the tower');
  assert.ok(fl(row('calutron_separation', 'pristine_helium_3'), 'fluids').includes('gtceu:crude_helium_3'), 'P10 crude into the calutron');
  assert.ok(fl(row('calutron_separation', 'pristine_helium_3'), 'fluidOuts').includes('gtceu:pristine_helium_3'), 'P10 helium-3 out');
  const feeds = (a, b) => outs(a).some((o) => ins(b).includes(o));
  assert.ok(feeds(row('spark_plasma_sintering', 'mo_grid_billet'), row('electron_beam_refining', 'refined_mo_grid')), 'P11 billet into the beam');
  assert.ok(feeds(row('electron_beam_refining', 'refined_mo_grid'), row('assembler', 'direct_converter_stack')), 'P11 grid into the stack');
  assert.ok(feeds(row('jet_beam_extraction', 'beam_neutraliser'), row('assembler', 'neutral_beam_injector')), 'P22 neutraliser into the injector');
  assert.ok(feeds(row('pbo_synthesis', 'scoop_web'), row('field_freezing', 'field_frozen_hoop')), 'P23 web into the freezer');
  assert.ok(feeds(row('field_freezing', 'field_frozen_hoop'), row('mtj_sputtering', 'insulated_hoop')), 'P23 hoop into the sputter');
  assert.ok(feeds(row('mtj_sputtering', 'insulated_hoop'), row('magnet_winding', 'scoop_coil')), 'P23 insulated hoop into the winding');
  assert.ok(plain(MS.cools).some((c) => c.input === 'grindless:scoop_coil' && c.output === 'grindless:cold_scoop_coil'), 'P23 cooling');
});

test('circuits are unique per recipe type; the machine rows take circuit 1', () => {
  const seen = new Set();
  for (const r of rows) {
    if (!r.circuit) continue;
    const k = `${r.type}:${r.circuit}`;
    assert.ok(!seen.has(k), `circuit clash ${k}`);
    seen.add(k);
  }
  assert.equal(row('pristine_gas_works', 'pristine_gas').circuit, 1);
  assert.equal(row('primordial_fusion_torus', 'helium_4_ash').circuit, 1);
  assert.equal(row('calutron_separation', 'primordial_deuterium').circuit, 20);
  assert.equal(row('calutron_separation', 'pristine_helium_3').circuit, 21);
});

test('controllers: assembly line recipes for the two machines, station research and V[MAX]', () => {
  const c = plain(MS.controllers);
  assert.deepEqual(c.map((x) => x.machine), ['gtceu:pristine_gas_works', 'gtceu:primordial_fusion_torus']);
  assert.ok(/c\.machine, c\.research, 64, 4800\)/.test(server));
  assert.ok(/EUt\(VA_MAX\)\.duration\(duration\)/.test(server));
});

test('no hand-set value reaches 2^31 as a literal', () => {
  assert.ok(!/\b(2[1-9]\d{8}|[3-9]\d{9}|\d{11,})\b/.test(server), 'a literal at or above 2^31');
});

test('the older machines now hold fluids: the calutron one in and out, the jet beam line an output bus', () => {
  const iso = read(kube, 'startup_scripts', 'grindless', 'uev', 'isotopes.js');
  assert.ok(/fluidsIn: 1, fluidsOut: 1/.test(iso));
  assert.ok(/Pat\.part\('input_hatch', \{ min: 0, max: 1 \}\)/.test(iso));
  assert.ok(/Pat\.part\('output_hatch', \{ min: 0, max: 1 \}\)/.test(iso));
  const jet = read(kube, 'startup_scripts', 'grindless', 'opv', 'antimatter_cygnus.js');
  assert.ok(/\[3, 1, 1, 1\]/.test(jet));
  assert.ok(/m\.name === 'jet_beam_line' \? 0 : 1/.test(jet));
});

test('lang: machine, type, tooltip and every keyed row have an en_us entry; ASCII only', () => {
  for (const r of rows.filter((x) => x.key)) assert.ok(lang.includes(`${r.key}.${r.name}'`), `no lang key for ${r.type}/${r.name}`);
  for (const m of ['pristine_gas_works', 'primordial_fusion_torus']) {
    assert.ok(lang.includes(`'block.gtceu.${m}'`), m);
    assert.ok(lang.includes(`'gtceu.${m}'`), m);
    assert.ok(lang.includes(`'grindless.machine.${m}.tooltip.0'`), m);
  }
  assert.ok(lang.includes("ClientEvents.lang('en_us'"));
  assert.ok(!/[^\x00-\x7f]/.test(lang), 'non-ASCII characters must be \\u escapes');
});

test('the zone row exists and does not overlap another', () => {
  const z = JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const list = z.zones || z;
  const mine = list.find((r) => r.id === 'maxplus_stream');
  assert.ok(mine);
  assert.deepEqual(mine.tests, ['maxplus_stream']);
  for (const o of list) {
    if (o === mine) continue;
    const overlap = o.x[0] <= mine.x[1] && mine.x[0] <= o.x[1] && o.z[0] <= mine.z[1] && mine.z[0] <= o.z[1] && o.y[0] <= mine.y[1] && mine.y[0] <= o.y[1];
    assert.ok(!overlap, `overlaps ${o.id}`);
  }
});
