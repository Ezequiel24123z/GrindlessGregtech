// D3-STARSHOT (docs/eras/lines-uv-uhv.md, V2): MCVD in three operations and the facet-coated pump diodes, no game needed.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const run = runPackScripts(path.join(root, 'pack'));
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const P = plain(run.global.grindless.photonics);
const all = P.recipes.concat(P.starshotRows);
const row = (name) => all.find((r) => r.name === name);
const side = (name) => P.side.find((r) => r.name === name);
const has = (list, id, n) => list.some((x) => x.id === id && (n === undefined || (x.count ?? x.amount) === n));

test('no skipped rows, no lookup clashes, every new id registered', () => {
  assert.deepEqual(P.clashes, []);
  assert.deepEqual(P.skipped, []);
  for (const n of ['mcvd_soot_tube', 'doped_soot_tube', 'coated_diode_bar']) assert.ok(run.registry.items.has('grindless:' + n), n);
  assert.ok(run.registry.fluids.has('gtceu:ytterbium_chloride_solution'));
});

test('MCVD: soot, dope, preform chain from tube to one preform', () => {
  const soot = row('mcvd_soot');
  assert.ok(has(soot.itemsIn, 'grindless:fused_silica_tube', 1) && has(soot.itemsIn, 'gtca:silicon_tetrachloride_dust', 5));
  assert.ok(has(soot.fluidsIn, 'gtceu:germanium_tetrachloride', 100) && has(soot.fluidsIn, 'gtceu:oxygen', 3700));
  assert.deepEqual(soot.itemsOut, [{ id: 'grindless:mcvd_soot_tube', count: 1 }]);
  assert.deepEqual(soot.fluidsOut, [{ id: 'gtceu:chlorine', amount: 4400 }]);
  const dope = row('mcvd_dope');
  assert.ok(has(dope.itemsIn, 'grindless:mcvd_soot_tube', 1) && has(dope.itemsIn, 'gtceu:aluminium_dust', 1));
  assert.ok(has(dope.fluidsIn, 'gtceu:ytterbium_chloride_solution', 250));
  assert.deepEqual(dope.itemsOut, [{ id: 'grindless:doped_soot_tube', count: 1 }]);
  const pre = row('preform');
  assert.ok(has(pre.itemsIn, 'grindless:doped_soot_tube', 1));
  assert.ok(has(pre.itemsOut, 'grindless:yb_doped_preform', 1) && has(pre.itemsOut, 'gtceu:glass_dust', 1));
  const sol = side('ytterbium_chloride_solution');
  assert.equal(sol.type, 'chemical_reactor');
  assert.ok(has(sol.itemsIn, 'gtceu:ytterbium_oxide_dust', 1));
  assert.deepEqual(sol.fluidsOut.map((f) => f.id), ['gtceu:ytterbium_chloride_solution', 'minecraft:water']);
});

test('facet coating sits between the bars and the pump module', () => {
  const coat = row('facet_coating');
  assert.equal(coat.type, 'mocvd');
  assert.ok(has(coat.itemsIn, 'grindless:ingaas_diode_bar', 8));
  assert.deepEqual(coat.itemsOut, [{ id: 'grindless:coated_diode_bar', count: 8 }]);
  assert.ok(has(row('pump_module').itemsIn, 'grindless:coated_diode_bar', 4));
  assert.ok(!has(row('pump_module').itemsIn, 'grindless:ingaas_diode_bar'));
});

test('unchanged contract: 16 fibres per preform; a module takes 4 fibre, 4 pump modules and a grating', () => {
  assert.ok(has(row('draw').itemsIn, 'grindless:yb_doped_preform', 1));
  assert.ok(has(row('draw').itemsOut, 'grindless:ytterbium_fibre', 16));
  const mod = row('laser_module');
  assert.ok(has(mod.itemsIn, 'grindless:ytterbium_fibre', 4) && has(mod.itemsIn, 'grindless:ingaas_pump_module', 4) && has(mod.itemsIn, 'grindless:fibre_bragg_grating', 1));
});

test('new rows have their own programmed circuit, unique within the type', () => {
  const list = P.recipes.concat(P.uhvRows, P.uevRows, P.a8Rows, P.uivRows, P.uxvRows, P.opvRows, P.opvA3Rows, P.maxA1Rows, P.starshotRows);
  for (const t of ['fibre_draw', 'mocvd']) {
    const c = list.filter((r) => r.type === t).map((r) => r.circuit);
    assert.equal(new Set(c).size, c.length, t);
  }
  assert.deepEqual(P.starshotRows.map((r) => [r.name, r.circuit]), [['mcvd_soot', 12], ['mcvd_dope', 13], ['facet_coating', 31]]);
});
