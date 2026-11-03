// D2-APT (EV tungsten through ammonium paratungstate), no game needed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const TA = plain(run.global.grindless.evTungstenApt);
const read = (p) => fs.readFileSync(path.join(pack, p), 'utf8');
const row = (n) => TA.recipes.find((r) => r.name === n);
const fl = (r, side, id) => (r[side].find((f) => f.id === id) || { amount: 0 }).amount;

test('scripts run without errors or skipped recipes', () => {
  const errs = run.errors.filter((e) => /ev[\\/]tungsten_apt/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(TA.skipped, []);
});

test('materials registered; no decomposition', () => {
  assert.ok(run.registry.materials.get('gtceu:ammonium_tungstate').forms.has('liquid'));
  assert.ok(run.registry.materials.get('gtceu:ammonium_paratungstate').forms.has('dust'));
  assert.ok(run.registry.materials.get('gtceu:tungsten_trioxide').forms.has('dust'));
  assert.match(read('kubejs/startup_scripts/grindless/ev/tungsten_apt.js'), /DISABLE_DECOMPOSITION/);
});

test('the electrolysis shortcut is retired', () => {
  assert.deepEqual(TA.retired, ['gtceu:electrolyzer/tungstic_acid_electrolysis']);
});

test('five rows: chain order and machines', () => {
  assert.deepEqual(TA.recipes.map((r) => r.type), ['chemical_reactor', 'chemical_reactor', 'distillery', 'electric_blast_furnace', 'electric_blast_furnace']);
  assert.equal(row('apt_calcination').temp, 900);
  assert.equal(row('hydrogen_reduction').temp, 1200);
});

test('one mole of tungsten: tungstic acid in, one tungsten out, molybdenite returned', () => {
  assert.equal(row('ammoniacal_dissolution').itemsIn[0].count, 7);
  assert.deepEqual(row('hydrogen_reduction').itemsOut, [{ id: 'gtceu:tungsten_dust', count: 1 }]);
  assert.deepEqual(row('molybdenum_removal').itemsOut, [{ id: 'gtceu:molybdenite_dust', count: 1 }]);
  assert.equal(row('apt_calcination').itemsOut[0].count, row('hydrogen_reduction').itemsIn[0].count);
});

test('ammonia and water balance', () => {
  const nh3In = fl(row('ammoniacal_dissolution'), 'fluidsIn', 'gtceu:ammonia');
  const nh3Out = fl(row('apt_crystallisation'), 'fluidsOut', 'gtceu:ammonia') + fl(row('apt_calcination'), 'fluidsOut', 'gtceu:ammonia');
  assert.equal(nh3In, nh3Out);
  for (const n of ['apt_crystallisation', 'apt_calcination']) assert.equal(row(n).fluidsOut.length, 1, n);
  assert.equal(fl(row('hydrogen_reduction'), 'fluidsIn', 'gtceu:hydrogen'), 6000);
  assert.equal(fl(row('hydrogen_reduction'), 'fluidsOut', 'gtceu:water'), 3000);
});

test('EU per tungsten stays near 1 M and the line stays EV', () => {
  const total = TA.recipes.reduce((s, r) => s + r.eut * r.duration, 0);
  assert.ok(total > 900000 && total < 1400000, String(total));
  for (const r of TA.recipes) assert.ok(r.eut <= 2048, r.name);
});

test('en_us strings exist', () => {
  const s = read('kubejs/client_scripts/grindless/ev_tungsten_apt_lang.js');
  for (const n of ['ammonium_tungstate', 'ammonium_paratungstate', 'tungsten_trioxide']) assert.match(s, new RegExp('material\\.gtceu\\.' + n));
});
