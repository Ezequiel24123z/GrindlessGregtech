// D3-TH-FRONT (docs/eras/lines-uv-uhv.md, V1 rows 1-12): the THOREX front end, thoria, pellets, pins and the assemblies, no game needed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const run = runPackScripts(path.join(root, 'pack'));
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const R = plain(run.global.grindless.thoriumRefiningRecipes);
const tables = path.join(root, 'pack', 'kubejs', 'data', 'grindless', 'tables');
const fab = JSON.parse(fs.readFileSync(path.join(tables, 'thorium_fabrication.json'), 'utf8')).fabrication;
const row = (name) => R.rows.find((r) => r.name === name);
const plant = (name) => fab.find((r) => r.name === name);
const has = (list, id, n) => list.some((x) => x.id === id && (n === undefined || (x.count ?? x.amount) === n));

test('no load problems, no lookup clashes, every new id registered', () => {
  assert.deepEqual(R.problems, []);
  assert.deepEqual(R.clashes, []);
  assert.equal(R.rows.length, 8);
  for (const n of ['thoria_pellet', 'thorium_nitride_pellet', 'thoria_fuel_pin', 'thorium_nitride_fuel_pin', 'cladding_tube_15_15ti']) {
    assert.ok(run.registry.items.has('grindless:' + n), n);
  }
  for (const n of ['n_butanol', 'tributyl_phosphate', 'tbp_solvent', 'loaded_tbp_solvent', 'crude_thorium_nitrate', 'thorium_nitrate']) {
    assert.ok(run.registry.fluids.has('gtceu:' + n), n);
  }
});

test('THOREX: dissolve, extract (lanthanides leave), strip, precipitate, calcine', () => {
  const dis = row('thorex_dissolution');
  assert.ok(has(dis.itemsIn, 'gtceu:thorium_dust', 4) && has(dis.fluidsIn, 'gtceu:nitric_acid', 16000));
  const ext = row('thorex_extraction');
  assert.ok(has(ext.fluidsIn, 'gtceu:tbp_solvent') && has(ext.fluidsIn, 'gtceu:crude_thorium_nitrate'));
  assert.ok(has(ext.fluidsOut, 'gtceu:lanthanide_nitrate') && has(ext.fluidsOut, 'gtceu:loaded_tbp_solvent'));
  const strip = row('thorex_strip');
  assert.ok(has(strip.fluidsOut, 'gtceu:thorium_nitrate') && has(strip.fluidsOut, 'gtceu:tbp_solvent'));
  assert.ok(row('thorium_oxalate_precipitation').itemsOut.some((x) => x.id === 'gtceu:thorium_oxalate_dust'));
  const cal = row('thoria_calcination');
  assert.equal(cal.type, 'electric_blast_furnace');
  assert.ok(has(cal.itemsOut, 'gtceu:thoria_dust'));
});

test('nitric acid is never made from nothing: what the line returns is below what it takes', () => {
  const taken = row('thorex_dissolution').fluidsIn.find((f) => f.id === 'gtceu:nitric_acid').amount;
  const back = ['thorex_extraction', 'thorium_oxalate_precipitation']
    .flatMap((n) => row(n).fluidsOut).filter((f) => f.id === 'gtceu:nitric_acid').reduce((s, f) => s + f.amount, 0);
  assert.ok(back < taken, `${back} >= ${taken}`);
});

test('fabrication: thoria to pellets to pins to assemblies, 8 thorium per assembly, circuits unique', () => {
  assert.ok(!fab.some((r) => r.itemsIn.some((x) => x.id === 'gtceu:thorium_dust')));
  for (const [asm, pin] of [['thorium_oxide_assembly', 'thoria_fuel_pin'], ['thorium_nitride_assembly', 'thorium_nitride_fuel_pin']]) {
    const a = plant(asm);
    assert.ok(has(a.itemsIn, 'grindless:' + pin, 2) && has(a.itemsIn, 'gtceu:stainless_steel_plate', 2), asm);
  }
  const pin = plant('thoria_pin');
  assert.ok(has(pin.itemsIn, 'grindless:thoria_pellet', 4) && has(pin.itemsIn, 'grindless:cladding_tube_15_15ti', 1));
  assert.ok(has(pin.fluidsIn, 'gtceu:helium'));
  assert.ok(has(plant('thoria_pellet').itemsIn, 'gtceu:thoria_dust', 8) && has(plant('thoria_pellet').itemsOut, 'grindless:thoria_pellet', 8));
  const nit = plant('thorium_nitridation');
  assert.ok(has(nit.itemsIn, 'gtceu:thoria_dust', 2) && has(nit.fluidsIn, 'gtceu:nitrogen_15') && has(nit.fluidsOut, 'gtceu:carbon_monoxide'));
  assert.ok(has(plant('thorium_nitride_pellet').itemsIn, 'gtceu:thorium_nitride_dust', 8));
  for (const r of fab) assert.ok(r.circuit >= 1 && r.circuit <= 32, r.name);
  assert.equal(new Set(fab.map((r) => r.circuit)).size, fab.length);
});
