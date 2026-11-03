// D3-SRF (docs/eras/lines-uv-uhv.md V4): niobium sheet -> half-cells -> bare cavity -> N-doped cavity -> dressed cavity -> cryomodule. Static.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const C = JSON.parse(JSON.stringify(run.global.grindless.cold, (k, v) => (typeof v === 'function' ? undefined : v)));
const row = (n) => C.recipes.find((r) => r.name === n);
const sheets = (r) => r.itemsIn.find((x) => x.id === 'grindless:rrr_niobium_sheet');

test('half-cells: one sheet makes two, on its own circuit', () => {
  const r = row('half_cells');
  assert.deepEqual(r.itemsIn, [{ id: 'grindless:rrr_niobium_sheet', count: 1 }]);
  assert.deepEqual(r.itemsOut, [{ id: 'grindless:niobium_half_cell', count: 2 }]);
  assert.equal(r.type, 'srf_cavity');
  assert.equal(r.circuit, 14);
});

test('bare cavity: 18 half-cells, so niobium per cavity stays nine sheets', () => {
  const cavity = row('cavity');
  assert.deepEqual(cavity.itemsIn, [{ id: 'grindless:niobium_half_cell', count: 18 }]);
  assert.equal(cavity.circuit, 2);
  assert.equal(18 / row('half_cells').itemsOut[0].count * row('half_cells').itemsIn[0].count, 9);
  assert.equal(sheets(cavity), undefined);
  assert.equal(C.recipes.filter((r) => r.itemsOut.some((x) => x.id === 'grindless:niobium_half_cell')).length, 1);
});

test('dressed cavity: the N-doped cavity, two titanium plates and helium', () => {
  const r = row('dressed_cavity');
  assert.deepEqual(r.itemsIn, [{ id: 'grindless:srf_cavity', count: 1 }, { id: 'gtceu:titanium_plate', count: 2 }]);
  assert.deepEqual(r.fluidsIn, [{ id: 'gtceu:helium', amount: 100 }]);
  assert.deepEqual(r.itemsOut, [{ id: 'grindless:dressed_srf_cavity', count: 1 }]);
  assert.equal(r.circuit, 15);
});

test('cryomodule takes 8 dressed cavities; later rows keep the plain cavity', () => {
  const mod = row('cryomodule');
  assert.deepEqual(mod.itemsIn[0], { id: 'grindless:dressed_srf_cavity', count: 8 });
  assert.equal(mod.itemsIn.some((x) => x.id === 'grindless:srf_cavity'), false);
  assert.ok(row('max_srf_cavity').itemsIn.some((x) => x.id === 'grindless:srf_cavity'));
  assert.deepEqual(row('surface').itemsOut, [{ id: 'grindless:srf_cavity', count: 1 }]);
});

test('no recipe-lookup clash and the works circuits are unique', () => {
  assert.deepEqual(C.clashes, []);
  const used = C.recipes.filter((r) => r.type === 'srf_cavity').map((r) => r.circuit);
  assert.equal(new Set(used).size, used.length);
});

test('textures and names exist for both new ids', () => {
  const lang = fs.readFileSync(path.join(pack, 'kubejs', 'client_scripts', 'grindless', 'uv_cold_lang.js'), 'utf8');
  for (const n of ['niobium_half_cell', 'dressed_srf_cavity']) {
    assert.ok(run.registry.items.has('grindless:' + n), n);
    assert.ok(lang.includes(n + ':'), n);
    assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'item', n + '.png')), n);
  }
});
