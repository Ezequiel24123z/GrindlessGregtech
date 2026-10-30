// OpV-D1 beam hardware (docs/eras/opv.md "D1", process lines 20-25), no game needed: the 22 intermediates of
// startup_scripts/grindless/opv/beam_hardware.js, the rows of server_scripts/grindless/opv/beam_hardware.js and the rows D1 appends to
// the older machines (electron beam, levitation melter, crystal growth, SPS, hot cell, platinum plant, MTJ sputtering, fluorspar kiln,
// helium refrigerator, tritium removal), their names and their textures. The rows run on proven machines (no T1): the stand-in builds
// every row, so a row that refers to another package's id (A2's NbTiN film, B3's spent shield) is built here and skips itself in game
// until that id is registered.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x));
const OPVB = plain(run.global.grindless.opvBeamHardware);
const docs = run.docs.recipes.recipes;
const byId = new Map(docs.map((r) => [r.i, r]));

const MAX_INT = 2 ** 31;
const V_UXV = 134217728;
// F1's six products (opv/foundation.js), made by D1's rows
const PRODUCTS = ['be_beam_window', 'ir_spallation_target', 'li6_hydride_shield', 'electron_cooler', 'stochastic_cooling_pickup', 'neg_xhv_casing'].map((n) => 'grindless:' + n);

const idOf = (e) => {
  const c = e.content;
  const s = c.ingredient || c;
  return s.item || (s.tag ? '#' + s.tag : null);
};
const fluidOf = (e) => e.content.value[0].fluid || '#' + e.content.value[0].tag;
const itemsIn = (r) => ((r.j.inputs && r.j.inputs.item) || []).map(idOf);
const itemsOut = (r) => ((r.j.outputs && r.j.outputs.item) || []).map(idOf);
const fluidsIn = (r) => ((r.j.inputs && r.j.inputs.fluid) || []).map(fluidOf);
const fluidsOut = (r) => ((r.j.outputs && r.j.outputs.fluid) || []).map(fluidOf);
const euOf = (r) => r.j.tickInputs.eu[0].content;
const makers = (id) => docs.filter((r) => itemsOut(r).includes(id));
const takers = (id) => docs.filter((r) => itemsIn(r).includes(id));

test('the stand-in runs the D1 scripts without errors', () => {
  // console.error lines of the older scripts are theirs; every error of the D1 files counts
  const errs = run.errors.filter((e) => /beam_hardware|platinum_plant|fluorspar_kiln|helium_refrigerator|tritium_removal|propulsion/.test(String(e.file))
    && (e.stage !== 'console.error' || /beam_hardware/.test(String(e.file))));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.equal(OPVB.items.length, 22);
  for (const id of OPVB.items) assert.ok(run.registry.items.has(id), `${id} is registered`);
  assert.deepEqual(OPVB.fluids, ['gtceu:bred_tritium_gas']);
  assert.deepEqual(OPVB.skipped, [], 'the stand-in knows every id, so no row of the D1 file skips itself');
});

test('every intermediate is made and used: none is a dead end', () => {
  for (const id of OPVB.items) {
    assert.ok(makers(id).length > 0, `${id} is made`);
    assert.ok(takers(id).length > 0, `${id} is used`);
  }
  // the bred gas: baked out of the spent shield, stripped in the tritium removal facility
  assert.ok(docs.some((r) => fluidsOut(r).includes('gtceu:bred_tritium_gas')), 'the bake-out gives the bred gas');
  const strip = byId.get('grindless:detritiation/bred_tritium_gas');
  assert.ok(strip, 'the facility strips the bred gas');
  assert.deepEqual(fluidsOut(strip), ['gtceu:tritium', 'gtceu:helium_3']);
});

test('acceptance: a spent Ir target reaches the hot cell, and its core goes back to 5N iridium', () => {
  const declad = takers('grindless:spent_ir_target').filter((r) => r.t === 'gtceu:hot_cell');
  assert.equal(declad.length, 1);
  assert.deepEqual(itemsOut(declad[0]), ['grindless:decladded_ir_core', 'gtnn:radioactive_waste']);
  const refine = takers('grindless:decladded_ir_core');
  assert.equal(refine.length, 1);
  assert.equal(refine[0].t, 'gtceu:pgm_refining');
  assert.ok(itemsOut(refine[0]).includes('grindless:five_n_iridium'));
  const residue = takers('grindless:ir_spallation_residue');
  assert.equal(residue.length, 1);
  assert.ok(itemsOut(residue[0]).includes('gtceu:iridium_dust'), 'the iridium left in the residue comes back');
});

test('acceptance: a spent NEG chamber goes back to the levitation melter', () => {
  const remelt = takers('grindless:spent_neg_chamber');
  assert.equal(remelt.length, 1);
  assert.equal(remelt[0].t, 'gtceu:levitation_melting');
  assert.ok(itemsOut(remelt[0]).includes('grindless:tizrv_ingot'), 'the getter film comes back as TiZrV');
  assert.ok(itemsOut(remelt[0]).includes('gtceu:stainless_steel_ingot'), 'the chamber comes back as stainless steel');
});

test('the products: OpV assembler rows above V[UXV] with only OpV circuits, every D1 row under 2^31 EU/t', () => {
  const assembled = ['be_beam_window', 'ir_spallation_target', 'li6_hydride_shield', 'cooler_electron_gun', 'neg_xhv_casing'];
  for (const n of assembled) {
    const rows = makers('grindless:' + n).filter((r) => r.t === 'gtceu:assembler');
    assert.equal(rows.length, 1, n);
    assert.ok(euOf(rows[0]) > V_UXV && euOf(rows[0]) < MAX_INT, `${n}: ${euOf(rows[0])} EU/t`);
    const circuits = itemsIn(rows[0]).filter((id) => /^#gtceu:circuits\//.test(id));
    assert.ok(circuits.every((c) => c === '#gtceu:circuits/opv'), `${n}: ${circuits}`);
  }
  assert.deepEqual(itemsIn(makers('grindless:neg_xhv_casing')[0]).filter((id) => /circuits/.test(id)), ['#gtceu:circuits/opv']);
  for (const id of OPVB.items.concat(PRODUCTS)) {
    assert.ok(makers(id).length > 0, `${id} is made`);
    for (const r of makers(id)) assert.ok(euOf(r) > 0 && euOf(r) < MAX_INT, `${r.i}: ${euOf(r)} EU/t`);
  }
});

test('the cryogenic parts: the helium refrigerator seals the gun and the pickup cold, published apart from its freezer rows', () => {
  const HR = plain(run.global.grindless.heliumRefrigerator);
  assert.deepEqual(HR.opvRows.map((r) => [r.input, r.output]), [
    ['grindless:cooler_electron_gun', 'grindless:electron_cooler'],
    ['grindless:brazed_pickup_tank', 'grindless:stochastic_cooling_pickup'],
  ]);
  for (const p of HR.opvRows) {
    const r = byId.get('grindless:closed_loop_cooling/' + p.name);
    assert.ok(r, p.name);
    assert.deepEqual(itemsOut(r), [p.output]);
    assert.ok(fluidsIn(r).includes('gtceu:liquid_helium'));
  }
  assert.ok(!HR.recipes.some((p) => /opv/.test(p.name)), 'the freezer rows stay as they were');
});

test('the rows appended to older tables: the contract\'s circuits, each with an EMI line in en_us and es_es', () => {
  const tables = path.join(pack, 'kubejs', 'data', 'grindless', 'tables');
  const want = {
    'electron_beam.json': [['be_reduction', 24], ['be_window_braze', 25], ['pickup_tank_braze', 25], ['li6h_canning', 26], ['neg_activation', 30], ['pickup_array', 31]],
    'crystals.json': [['ceb6_boule', 23]],
    'levitation_melter.json': [['tizrv_melt', 17], ['neg_chamber_remelt', 18]],
    'hot_cell.json': [['spent_ir_target_decladding', 17]],
    'spin_deposition.json': [['ta_clad_ir_rod', 9], ['neg_coated_chamber', 10]],
  };
  for (const [file, rows] of Object.entries(want)) {
    const T = JSON.parse(fs.readFileSync(path.join(tables, file), 'utf8'));
    const types = T.types || {};
    const mine = [];
    for (const t of Object.values(types)) for (const r of t.recipes || []) if (/OpV-D1/.test(JSON.stringify(r))) mine.push([t, r]);
    if (!T.types) for (const r of T.recipes || []) if (/OpV-D1/.test(JSON.stringify(r))) mine.push([{ dataKey: 'grindless_hot_cell' }, r]); // the hot cell's flat table
    assert.deepEqual(mine.map(([, r]) => [r.name, r.circuit]), rows, file);
    for (const [t, r] of mine) {
      const key = `gtceu.recipe.${t.dataKey}.${r.name}`;
      assert.ok(t.dataKey, `${file}: data key`);
      for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][key], `${lang} ${key}`);
    }
  }
});

test('names: en_us and es_es for every item (two tooltips) and the bred gas', () => {
  for (const lang of ['en_us', 'es_es']) {
    for (const id of OPVB.items) {
      const n = id.split(':')[1];
      for (const k of [`item.grindless.${n}`, `tooltip.grindless.${n}.0`, `tooltip.grindless.${n}.1`]) assert.ok(run.lang[lang][k], `${lang} ${k}`);
    }
    assert.ok(run.lang[lang]['material.grindless.bred_tritium_gas'], `${lang} names the bred gas`);
  }
});

test('textures: one generated icon per item', () => {
  const dir = path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'item');
  for (const id of OPVB.items) assert.ok(fs.existsSync(path.join(dir, id.split(':')[1] + '.png')), id);
});
