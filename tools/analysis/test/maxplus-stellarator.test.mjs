// B13-STEL (MAX+ machine 18, the polarized fusion stellarator, and line P26): the stand-in run of maxplus/stellarator.js, row shape, chains, circuits, lang parity, the shape and the zone row.
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
const MS = run.global.grindless.maxPlusStellarator;
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const lang = read(kube, 'client_scripts', 'grindless', 'maxplus_stellarator_lang.js');
const info = read(kube, 'client_scripts', 'grindless', 'maxplus_info_lang.js');
const server = read(kube, 'server_scripts', 'grindless', 'maxplus', 'stellarator.js');
const rows = plain(MS.rows);
const row = (type, name) => rows.find((r) => r.type === type && r.name === name);
const ins = (r) => (r.items || []).map((i) => i[0]);
const outs = (r) => (r.outs || []).map((i) => i[0]);
const fl = (r, k) => (r[k] || []).map((f) => f[0]);

test('the stand-in runs the scripts without errors and skips nothing', () => {
  const mine = run.errors.filter((e) => /maxplus[\\/]stellarator/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MS.skipped), []);
  assert.equal(rows.length, 6);
  assert.equal(plain(MS.controllers).length, 1);
});

test('the plant row makes 2^34 EU/t per run and wears 1 in 64, 1 in 128 and 1 in 128', () => {
  const r = row('polarized_fusion', 'helium_4_ash');
  assert.equal(r.eut, -(2 ** 34));
  assert.equal(r.circuit, 1);
  assert.equal(r.key, 'grindless_polarized_fusion');
  assert.deepEqual(r.wear, [['grindless:neutral_beam_injector', 156], ['grindless:direct_converter_stack', 78], ['grindless:sco2_turbine_module', 78]]);
  assert.deepEqual(r.items, [['grindless:polarized_hd_pellet', 4]]);
  assert.deepEqual(r.fluids, [['gtceu:polarized_helium_3', 1000]]);
});

test('P26 is one chain, d1 to d4 into the plant, and h1 from P10 into the plant', () => {
  const d1 = row('chemical_reactor', 'hd_equilibrium_mix');
  const d2 = row('distillation_tower', 'pure_hd');
  const d3 = row('nuclear_demagnetisation', 'frozen_spin_hd');
  const d4 = row('extruder', 'polarized_hd_pellet');
  const h1 = row('photonic_foundry', 'polarized_helium_3');
  const c1 = row('polarized_fusion', 'helium_4_ash');
  assert.ok(fl(d1, 'fluids').includes('gtceu:primordial_deuterium'), 'P9 deuterium into d1');
  assert.ok(fl(d1, 'fluidOuts').includes('gtceu:hd_equilibrium_mix'));
  assert.ok(fl(d2, 'fluids').includes('gtceu:hd_equilibrium_mix'), 'd1 into d2');
  assert.ok(fl(d2, 'fluidOuts').includes('gtceu:pure_hd'));
  assert.ok(fl(d2, 'fluidOuts').includes('gtceu:hydrogen') && fl(d2, 'fluidOuts').includes('gtceu:primordial_deuterium'), 'd2 returns both feeds to d1');
  assert.ok(fl(d3, 'fluids').includes('gtceu:pure_hd'), 'd2 into d3');
  assert.ok(outs(d3).includes('grindless:frozen_spin_hd'));
  assert.ok(ins(d4).includes('grindless:frozen_spin_hd'), 'd3 into d4');
  assert.ok(outs(d4).includes('grindless:polarized_hd_pellet'));
  assert.ok(ins(c1).includes('grindless:polarized_hd_pellet'), 'd4 into the plant');
  assert.ok(fl(h1, 'fluids').includes('gtceu:pristine_helium_3'), 'P10 helium-3 into h1');
  assert.ok(fl(h1, 'fluidOuts').includes('gtceu:polarized_helium_3'));
  assert.deepEqual(h1.wear, [['grindless:max_emitter', 156]]);
  assert.ok(fl(c1, 'fluids').includes('gtceu:polarized_helium_3'), 'h1 into the plant');
  assert.equal(d3.key, 'grindless_nuclear_demagnetisation');
  assert.equal(h1.key, 'grindless_photonic_foundry');
});

test('the plant row fits the five item inputs and the two fluid outputs', () => {
  const c1 = row('polarized_fusion', 'helium_4_ash');
  assert.ok(1 + c1.items.length + c1.wear.length <= 5);
  assert.ok(fl(c1, 'fluids').length <= 1 && fl(c1, 'fluidOuts').length <= 2);
});

test('circuits are unique per recipe type; only the plant row takes one', () => {
  const seen = new Set();
  for (const r of rows) {
    if (!r.circuit) continue;
    const k = `${r.type}:${r.circuit}`;
    assert.ok(!seen.has(k), `circuit clash ${k}`);
    seen.add(k);
  }
  assert.deepEqual(rows.filter((r) => r.circuit).map((r) => r.name), ['helium_4_ash']);
});

test('the controller line: station research on frozen_spin_hd, V[MAX], 64 CWUt, 4800 t', () => {
  const c = plain(MS.controllers);
  assert.deepEqual(c.map((x) => x.machine), ['gtceu:polarized_fusion_stellarator']);
  assert.equal(c[0].research, 'grindless:frozen_spin_hd');
  assert.ok(/c\.machine, c\.research, 64, 4800\)/.test(server));
  assert.ok(/EUt\(VA_MAX\)\.duration\(duration\)/.test(server));
});

test('no hand-set value reaches 2^31 as a literal', () => {
  assert.ok(!/\b(2[1-9]\d{8}|[3-9]\d{9}|\d{11,})\b/.test(server), 'a literal at or above 2^31');
});

test('lang: machine, type, tooltip, EMI info and every keyed row have an en_us entry; ASCII only', () => {
  for (const r of rows.filter((x) => x.key)) assert.ok(lang.includes(`${r.key}.${r.name}'`), `no lang key for ${r.type}/${r.name}`);
  assert.ok(lang.includes("'block.gtceu.polarized_fusion_stellarator'"));
  assert.ok(lang.includes("'gtceu.polarized_fusion_stellarator'"));
  assert.ok(lang.includes("'gtceu.polarized_fusion'"));
  assert.ok(lang.includes("'grindless.machine.polarized_fusion_stellarator.tooltip.0'"));
  assert.ok(lang.includes("ClientEvents.lang('en_us'"));
  assert.ok(info.includes("'emi.grindless.info.polarized_fusion_stellarator.0'") && info.includes("'emi.grindless.info.polarized_fusion_stellarator.1'"));
  assert.ok(!/[^\x00-\x7f]/.test(lang) && !/[^\x00-\x7f]/.test(info), 'non-ASCII characters must be \\u escapes');
  const emi = JSON.parse(read(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'maxplus_polarized_fusion_stellarator.json'));
  assert.deepEqual(emi.stacks, ['item:gtceu:polarized_fusion_stellarator']);
});

test('the shape is 31 x 11 x 31 with at most 192 coil cells', () => {
  const m = MS.machine;
  assert.deepEqual([m.width, m.height, m.depth], [31, 11, 31]);
  assert.equal(m.maxParallels, 64);
  assert.equal(m.maxCoils, 192);
  if (!m.spec) return; // the stand-in does not run the machine registry
  const slices = plain(m.spec.slices);
  const count = (ch) => slices.join('').split('').filter((c) => c === ch).length;
  assert.ok(count('C') > 0 && count('C') <= 192, `coil cells ${count('C')}`);
  assert.ok(count('A') > 0);
  assert.equal(slices.length, 31);
});

test('the zone row exists and does not overlap another', () => {
  const z = JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const list = z.zones || z;
  const mine = list.find((r) => r.id === 'maxplus_stellarator');
  assert.ok(mine);
  assert.deepEqual(mine.tests, ['maxplus_stellarator']);
  assert.deepEqual(mine.x, [48896, 48959]);
  for (const o of list) {
    if (o === mine) continue;
    const overlap = o.x[0] <= mine.x[1] && mine.x[0] <= o.x[1] && o.z[0] <= mine.z[1] && mine.z[0] <= o.z[1] && o.y[0] <= mine.y[1] && mine.y[0] <= o.y[1];
    assert.ok(!overlap, `overlaps ${o.id}`);
  }
});
