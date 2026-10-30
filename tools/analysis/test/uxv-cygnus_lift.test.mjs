// UXV-B2 (cygnus_lift): the stellar elevator, plasma mass filter and stellar condensation tower rows, the three controllers' assembly lines,
// the two older rows (EHT circuit 3, syngas circuit 8) and the structures of startup_scripts/grindless/uxv/cygnus_lift.js.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { measure, violations } from '../lib/structure_quality.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const run = runPackScripts(pack);
const CL = run.global.grindless.cygnusLift;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const producers = (id) => recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`));
const plain = (x) => JSON.parse(JSON.stringify(x));
const rec = (type, name) => CL.recipes.find((r) => r.type === type && r.name === name);
const SITE = 'grindless:cygnus_x1_orbit';
const MACHINES = ['stellar_elevator', 'plasma_mass_filter', 'stellar_condensation_tower'];
const fl = (r, side, id) => r[side].find((f) => f.id === id);

test('the stand-in runs the UXV-B2 scripts without errors, nothing skipped, no lookup clash', () => {
  const mine = run.errors.filter((e) => /cygnus_lift|syngas_plant|uv[\\/]edge|sounds/.test(String(e.file)) && !/no original recipe/.test(String(e.message)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(CL.skipped), []);
  assert.deepEqual(plain(CL.clashes), []);
  assert.equal(CL.recipes.length, 5);
});

test('elevator: circuit 1 lift (liquid helium -> stellar plasma + 900 mB warm helium), circuit 2 log (data module + 100 mB plasma); both at Cygnus X-1', () => {
  assert.deepEqual(plain(CL.recipes.filter((r) => r.type === 'star_lifting').map((r) => [r.name, r.circuit])), [['stellar_lift', 1], ['elevator_log', 2]]);
  const lift = rec('star_lifting', 'stellar_lift');
  assert.deepEqual([lift.eut, lift.duration, lift.site], [134217728, 1200, true]);
  assert.equal(fl(lift, 'fluidsIn', 'gtceu:liquid_helium').amount, 1000);
  assert.equal(fl(lift, 'fluidsOut', 'gtceu:stellar_plasma').amount, 1000);
  assert.equal(fl(lift, 'fluidsOut', 'gtceu:helium').amount, 900);
  const log = rec('star_lifting', 'elevator_log');
  assert.deepEqual([log.eut, log.site], [8388608, true]);
  assert.deepEqual(plain(log.itemsIn), [{ id: 'gtceu:data_module', count: 1 }]);
  assert.equal(fl(log, 'fluidsIn', 'gtceu:stellar_plasma').amount, 100);
  assert.deepEqual(plain(log.itemsOut), [{ id: 'grindless:elevator_log', count: 1 }]);
  for (const r of [lift, log]) {
    const d = find(`grindless:star_lifting/${r.name}`);
    assert.ok(d, r.name);
    assert.ok(JSON.stringify(d.j.recipeConditions || []).includes(SITE), `${r.name} carries the dimension lock`);
  }
});

test('filter: c1 splits 1,000 mB plasma into 700/270/15/15 at Cygnus X-1; c2 is disk plasma -> 900 filtered + 100 heavy cut', () => {
  const c1 = rec('plasma_mass_filtering', 'stellar_cuts');
  assert.deepEqual([c1.circuit, c1.eut, c1.duration, c1.site], [1, 67108864, 400, true]);
  assert.equal(fl(c1, 'fluidsIn', 'gtceu:stellar_plasma').amount, 1000);
  const out = Object.fromEntries(c1.fluidsOut.map((f) => [f.id, f.amount]));
  assert.deepEqual(out, { 'gtceu:stellar_hydrogen_cut': 700, 'gtceu:stellar_helium_cut': 270, 'gtceu:stellar_cno_cut': 15, 'gtceu:stellar_heavy_cut': 15 });
  assert.equal(Object.values(out).reduce((a, b) => a + b, 0), 1000, 'mass in = mass out');
  const c2 = rec('plasma_mass_filtering', 'disk_filter');
  assert.deepEqual([c2.circuit, c2.eut, c2.duration], [2, 67108864, 400]);
  assert.equal(fl(c2, 'fluidsIn', 'gtceu:disk_plasma').amount, 1000);
  assert.equal(fl(c2, 'fluidsOut', 'gtceu:filtered_disk_plasma').amount, 900);
  assert.equal(fl(c2, 'fluidsOut', 'gtceu:stellar_heavy_cut').amount, 100);
  assert.ok(JSON.stringify(find('grindless:plasma_mass_filtering/stellar_cuts').j.recipeConditions || []).includes(SITE));
});

test('tower: heavy cut + hydrogen cut -> three condensates + volatile condensate, at Cygnus X-1, 33,554,432 EU/t', () => {
  const r = rec('stellar_condensation', 'condense');
  assert.deepEqual([r.circuit, r.eut, r.duration, r.site], [1, 33554432, 600, true]);
  assert.equal(fl(r, 'fluidsIn', 'gtceu:stellar_heavy_cut').amount, 100);
  assert.equal(fl(r, 'fluidsIn', 'gtceu:stellar_hydrogen_cut').amount, 100);
  assert.deepEqual(plain(r.itemsOut.map((x) => x.id)), ['grindless:refractory_condensate', 'grindless:metal_condensate', 'grindless:silicate_condensate']);
  assert.equal(fl(r, 'fluidsOut', 'gtceu:volatile_condensate').amount, 100);
  assert.ok(JSON.stringify(find('grindless:stellar_condensation/condense').j.recipeConditions || []).includes(SITE));
});

test('no Vela or Cas A input, no id from nothing: every row takes an input', () => {
  for (const r of CL.recipes) {
    assert.ok(r.itemsIn.length + r.fluidsIn.length > 0, r.name);
    assert.ok(!/vela|cas_a|casa/.test(JSON.stringify(r)), `${r.name} names no Vela or Cas A product`);
  }
});

test('the controllers as the controller table: UIV hull, uxv_sensor, mainframes, UIV circuits, the era fluid, research', () => {
  assert.deepEqual(plain(CL.controllerRecipes), MACHINES.map((m) => `grindless:assembly_line/${m}`));
  const want = {
    stellar_elevator: ['grindless:mh_winding', 'gtceu:he_6n', ['ga2o3_power_die', 'w184_cvi_preform', 'mu_metal_foil']],
    plasma_mass_filter: ['gtceu:stellar_elevator', 'gtceu:he_6n', ['ga2o3_power_die', 'mh_winding', 'w184_cvi_preform']],
    stellar_condensation_tower: ['gtceu:plasma_mass_filter', 'gtceu:stellar_helium_cut', ['pt_sheet', 'w184_cvi_preform', 'iridium_crucible']]
  };
  for (const m of MACHINES) {
    const r = find(`grindless:assembly_line/${m}`);
    assert.ok(r && r.t === 'gtceu:assembly_line', m);
    const text = JSON.stringify(r.j);
    assert.ok(text.includes(`gtceu:${m}`), `${m} is its output`);
    for (const need of ['gtceu:uiv_machine_hull', 'gtnn:spintronic_mainframe', 'gtceu:circuits/uiv', 'gtceu:uxv_sensor', 'gtceu:soldering_alloy', 'gtceu:lubricant', want[m][0], want[m][1]]) {
      assert.ok(text.includes(need), `${m} takes ${need}`);
    }
    for (const d of want[m][2]) assert.ok(text.includes(d), `${m} takes ${d}`);
    assert.ok(!/neutronium|vela|cas_a/.test(text), `${m} takes no neutronium, Vela or Cas A input`);
    const ids = new Set((text.match(/"(?:id|tag|item)":"[^"]+"/g) || []));
    assert.ok(ids.size >= 8, `${m}: ${ids.size} distinct ingredients`);
  }
});

test('older rows: EHT cygnus_vlbi_record (circuit 3), syngas volatile_reform (circuit 8)', () => {
  const vlbi = find('grindless:event_horizon_imaging/cygnus_vlbi_record');
  assert.ok(vlbi, 'cygnus_vlbi_record');
  const vt = JSON.stringify(vlbi.j);
  assert.ok(vt.includes('"configuration":3'), 'circuit 3');
  assert.ok(vt.includes('grindless:cygnus_vlbi_record') && vt.includes('grindless:hpge_crystal') && vt.includes('gtceu:data_orb'));
  const syn = find('grindless:syngas/hv/volatile_reform');
  assert.ok(syn, 'volatile_reform');
  const st = JSON.stringify(syn.j);
  assert.ok(st.includes('"configuration":8'), 'circuit 8');
  for (const id of ['gtceu:volatile_condensate', 'gtceu:steam', 'gtceu:hydrogen', 'gtceu:carbon_dioxide', 'gtceu:nitrogen']) assert.ok(st.includes(id), `volatile_reform names ${id}`);
  const plan = plain(run.global.grindless.syngas.uxvRecipes);
  assert.equal(plan.length, 1);
  assert.deepEqual(plan[0].atoms, { c: 0, h: 0, o: 0 }, 'carbon, hydrogen and oxygen balance');
  assert.equal(plan[0].circuit, 8);
});

test('"only from": nothing else in the pack makes these ids', () => {
  const only = {
    'grindless:elevator_log': 'star_lifting/elevator_log', 'grindless:cygnus_vlbi_record': 'event_horizon_imaging/cygnus_vlbi_record',
    'grindless:refractory_condensate': 'stellar_condensation/condense', 'grindless:metal_condensate': 'stellar_condensation/condense',
    'grindless:silicate_condensate': 'stellar_condensation/condense', 'gtceu:stellar_stellar_elevator': null,
    'gtceu:stellar_elevator': 'assembly_line/stellar_elevator', 'gtceu:plasma_mass_filter': 'assembly_line/plasma_mass_filter',
    'gtceu:stellar_condensation_tower': 'assembly_line/stellar_condensation_tower',
    'gtceu:stellar_plasma': 'star_lifting/stellar_lift', 'gtceu:stellar_hydrogen_cut': 'plasma_mass_filtering/stellar_cuts',
    'gtceu:stellar_helium_cut': 'plasma_mass_filtering/stellar_cuts', 'gtceu:stellar_cno_cut': 'plasma_mass_filtering/stellar_cuts',
    'gtceu:volatile_condensate': 'stellar_condensation/condense', 'gtceu:filtered_disk_plasma': 'plasma_mass_filtering/disk_filter'
  };
  for (const [id, tail] of Object.entries(only)) {
    if (tail === null) continue;
    const ps = producers(id);
    assert.ok(ps.length >= 1, `${id} has a producer`);
    // the heavy cut has two sources by design (both filter rows); a cut may also return from a Mk6 quench row, which is not a source of matter
    assert.ok(ps.every((r) => r.i.endsWith(tail) || /fusion|quench|mk6|direct_conversion/.test(r.i)), `${id} only from ${tail}: ${ps.map((r) => r.i)}`);
  }
  const heavy = producers('gtceu:stellar_heavy_cut').map((r) => r.i).filter((i) => !/fusion|quench|mk6|direct_conversion/.test(i)).sort();
  assert.deepEqual(heavy, ['grindless:plasma_mass_filtering/disk_filter', 'grindless:plasma_mass_filtering/stellar_cuts']);
});

test('structures: not boring, at least two functional kinds, controller in the front slice, lying on their side (16 rows at most)', () => {
  for (const m of MACHINES) {
    const s = run.global.grindless.structures[`gtceu:${m}`];
    assert.ok(s, `${m} has a description`);
    const mm = measure(s);
    assert.deepEqual(violations(mm), [], `${m}: ${JSON.stringify(mm)}`);
    assert.ok(mm.dominantShare <= 0.62, `${m}: dominant share ${mm.dominantShare}`);
    assert.ok(mm.functional.length >= 3, `${m}: ${mm.functional}`);
    assert.ok(s.slices.every((sl) => sl.length <= 16), `${m}: at most 16 rows per slice`);
    assert.ok(s.slices[s.slices.length - 1].some((row) => row.includes('S')), `${m}: the controller is in the front slice`);
  }
  assert.deepEqual(plain(run.global.grindless.structures['gtceu:stellar_elevator'].slices.length), 25);
  assert.deepEqual(plain(run.global.grindless.structures['gtceu:stellar_condensation_tower'].slices.length), 23);
});

test('lang parity: every key of both languages, names, tooltips, EMI pages and recipe lines', () => {
  const keys = [];
  for (const m of MACHINES) {
    keys.push(`block.gtceu.${m}`, `grindless.machine.${m}.tooltip.0`, `grindless.machine.${m}.tooltip.1`, `grindless.machine.${m}.tooltip.2`, `emi.grindless.info.${m}.0`, `emi.grindless.info.${m}.1`);
  }
  keys.push('gtceu.star_lifting', 'gtceu.plasma_mass_filtering', 'gtceu.stellar_condensation');
  for (const r of CL.recipes) keys.push(`gtceu.recipe.${r.dataKey}.${r.name}`);
  for (const k of keys) for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][k], `${lang} has ${k}`);
  const re = /stellar_elevator|plasma_mass_filter|stellar_condensation|star_lifting/;
  assert.deepEqual(Object.keys(run.lang.en_us).filter((k) => re.test(k)).sort(), Object.keys(run.lang.es_es).filter((k) => re.test(k)).sort());
  for (const m of MACHINES) {
    assert.match(run.lang.en_us[`emi.grindless.info.${m}.0`], /Cygnus X-1/, `${m}'s page names Cygnus X-1`);
  }
});
