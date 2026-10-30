// UXV-B3 (cygnus_disk): the accretion disk skimmer, FRC former and BZ dynamo rows, the three controllers' assembly lines, the field generator's
// line 30, the older magnet works row (strand_coil, circuit 9) and the structures of startup_scripts/grindless/uxv/cygnus_disk.js.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { measure, violations } from '../lib/structure_quality.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const run = runPackScripts(pack);
const CD = run.global.grindless.cygnusDisk;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const producers = (id) => recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`));
const plain = (x) => JSON.parse(JSON.stringify(x));
const rec = (type, name) => CD.recipes.find((r) => r.type === type && r.name === name);
const SITE = 'grindless:cygnus_x1_orbit';
const MACHINES = ['accretion_disk_skimmer', 'frc_former', 'bz_dynamo'];
const fl = (r, side, id) => r[side].find((f) => f.id === id);
const json = (...p) => JSON.parse(fs.readFileSync(path.resolve(here, '..', ...p), 'utf8'));

test('the stand-in runs the UXV-B3 scripts without errors, nothing skipped, no lookup clash', () => {
  const mine = run.errors.filter((e) => /cygnus_disk|sounds/.test(String(e.file)) && !/no original recipe/.test(String(e.message)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(CD.skipped), []);
  assert.deepEqual(plain(CD.clashes), []);
  assert.equal(CD.recipes.length, 4);
});

test('skimmer: circuit 1 skim, a wearing MH winding (5%) -> 1,000 mB disk plasma, 134,217,728 EU/t for 1,200 t, at Cygnus X-1', () => {
  const r = rec('disk_skimming', 'skim_disk');
  assert.deepEqual([r.circuit, r.eut, r.duration, r.site, r.generator], [1, 134217728, 1200, true, false]);
  assert.deepEqual(plain(r.wear), [{ id: 'grindless:mh_winding', count: 1, chance: 500 }]);
  assert.equal(fl(r, 'fluidsOut', 'gtceu:disk_plasma').amount, 1000);
  assert.ok(JSON.stringify(find('grindless:disk_skimming/skim_disk').j.recipeConditions || []).includes(SITE));
});

test('former: c1 cartridge (500 mB filtered disk plasma + 4 windings at 10%), c2 flux loading (400 mB flux-loaded plasma + 100 mB hydrogen back)', () => {
  const c1 = rec('frc_forming', 'form_cartridge');
  assert.deepEqual([c1.circuit, c1.eut, c1.duration, c1.site], [1, 134217728, 1600, true]);
  assert.deepEqual(plain(c1.wear), [{ id: 'grindless:mh_winding', count: 4, chance: 1000 }]);
  assert.equal(fl(c1, 'fluidsIn', 'gtceu:filtered_disk_plasma').amount, 500);
  assert.deepEqual(plain(c1.itemsOut), [{ id: 'grindless:frc_cartridge', count: 1 }]);
  const c2 = rec('frc_forming', 'load_flux');
  assert.deepEqual([c2.circuit, c2.eut, c2.duration, c2.site], [2, 67108864, 400, false]);
  assert.equal(fl(c2, 'fluidsIn', 'gtceu:filtered_disk_plasma').amount, 500);
  assert.equal(fl(c2, 'fluidsOut', 'gtceu:flux_loaded_plasma').amount, 400);
  assert.equal(fl(c2, 'fluidsOut', 'gtceu:hydrogen').amount, 100, 'the plasma that is not loaded recombines to hydrogen: mass in = mass out');
  assert.ok(JSON.stringify(find('grindless:frc_forming/form_cartridge').j.recipeConditions || []).includes(SITE));
});

test('BZ dynamo: a generator, 2^30 EU/t for 200 t from 400 mB flux-loaded plasma, one run, at Cygnus X-1; the chain returns more than it costs', () => {
  const r = rec('blandford_znajek', 'spin_down');
  assert.deepEqual([r.circuit, r.eut, r.duration, r.site, r.generator], [1, 2 ** 30, 200, true, true]);
  assert.equal(fl(r, 'fluidsIn', 'gtceu:flux_loaded_plasma').amount, 400);
  const d = find('grindless:blandford_znajek/spin_down');
  assert.ok(d, 'spin_down');
  assert.ok(JSON.stringify(d.j.tickInputs || d.j.tickOutputs || {}).includes('eu'));
  assert.ok(JSON.stringify(d.j.recipeConditions || []).includes(SITE));
  const out = 2 ** 30 * 200;
  // 400 mB flux = 556 mB disk (skim 1,000 mB / 1,200 t at 2^27, filter c2 at 2^26 for 400 t per 1,000, c2 FRC 2^26 for 400 t per 500)
  const cost = 0.556 * 2 ** 27 * 1200 + 0.556 * 2 ** 26 * 400 + 2 ** 26 * 400;
  assert.ok(out > cost, `${out} EU back against ${cost} EU spent`);
});

test('no Vela or Cas A input, no id from nothing: every row takes an input', () => {
  for (const r of CD.recipes) {
    assert.ok(r.itemsIn.length + r.wear.length + r.fluidsIn.length > 0, r.name);
    assert.ok(!/vela|cas_a|casa/.test(JSON.stringify(r)), `${r.name} names no Vela or Cas A product`);
  }
});

test('the controllers and the field generator: UIV hull, mainframes, UIV circuits, parts, research; line 30 reads the cartridge and strand coils', () => {
  assert.deepEqual(plain(CD.controllerRecipes), MACHINES.map((m) => `grindless:assembly_line/${m}`));
  const want = {
    accretion_disk_skimmer: ['grindless:mh_winding', ['ga2o3_power_die', 'w184_cvi_preform', 'shielded_interposer']],
    frc_former: ['gtceu:accretion_disk_skimmer', ['ga2o3_power_die', 'mh_winding', 'vuv_caf2_optic']],
    bz_dynamo: ['gtceu:frc_former', ['frc_cartridge', 'ga2o3_power_die', 'mh_winding', 'filtered_disk_plasma']]
  };
  for (const m of MACHINES) {
    const r = find(`grindless:assembly_line/${m}`);
    assert.ok(r && r.t === 'gtceu:assembly_line', m);
    const text = JSON.stringify(r.j);
    assert.ok(text.includes(`gtceu:${m}`), `${m} is its output`);
    for (const need of ['gtceu:uiv_machine_hull', 'gtnn:spintronic_mainframe', 'gtceu:circuits/uiv', 'grindless:uxv_sensor', 'gtceu:soldering_alloy', 'gtceu:lubricant', want[m][0]]) {
      assert.ok(text.includes(need), `${m} takes ${need}`);
    }
    for (const d of want[m][1]) assert.ok(text.includes(d), `${m} takes ${d}`);
    assert.ok(!/neutronium|vela|cas_a/.test(text), `${m} takes no neutronium, Vela or Cas A input`);
    const ids = new Set((text.match(/"(?:id|tag|item)":"[^"]+"/g) || []));
    assert.ok(ids.size >= 8, `${m}: ${ids.size} distinct ingredients`);
  }
  assert.equal(CD.fieldGeneratorRecipe, 'grindless:assembly_line/uxv_field_generator');
  const fg = find(CD.fieldGeneratorRecipe);
  assert.ok(fg && fg.t === 'gtceu:assembly_line');
  const ft = JSON.stringify(fg.j);
  for (const need of ['grindless:strand_coil', 'grindless:uiv_field_generator', 'grindless:mh_winding', 'gtceu:rhea_plate', 'gtceu:circuits/uxv', 'gtceu:filtered_disk_plasma', 'grindless:frc_cartridge', 'grindless:uxv_field_generator']) {
    assert.ok(ft.includes(need), `the field generator takes ${need}`);
  }
});

test('older row: magnet works strand_coil, circuit 9, charged, four strand tape + a cartridge + a tungsten steel rod', () => {
  const mw = JSON.parse(fs.readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', 'magnet_works.json'), 'utf8')).recipes;
  const row = mw.find((r) => r.name === 'strand_coil');
  assert.ok(row, 'strand_coil');
  assert.deepEqual([row.circuit, row.charge], [9, true]);
  assert.match(row._why, /^UXV-B3/);
  assert.equal(mw.filter((r) => r.circuit === 9).length, 1, 'circuit 9 is taken once');
  assert.deepEqual(plain(row.itemsIn), [{ id: 'grindless:strand_tape', count: 4 }, { id: 'grindless:frc_cartridge', count: 1 }, { id: 'gtceu:tungsten_steel_rod', count: 1 }]);
  assert.deepEqual(plain(row.itemsOut), [{ id: 'grindless:strand_coil', count: 1 }]);
  assert.ok(find('grindless:naquadria_magnets/strand_coil'), 'it is in the recipe docs');
});

test('"only from": nothing else in the pack makes these ids', () => {
  const only = {
    'gtceu:disk_plasma': 'disk_skimming/skim_disk', 'grindless:frc_cartridge': 'frc_forming/form_cartridge',
    'gtceu:flux_loaded_plasma': 'frc_forming/load_flux', 'grindless:uxv_field_generator': 'assembly_line/uxv_field_generator',
    'grindless:strand_coil': 'naquadria_magnets/strand_coil', 'gtceu:accretion_disk_skimmer': 'assembly_line/accretion_disk_skimmer',
    'gtceu:frc_former': 'assembly_line/frc_former', 'gtceu:bz_dynamo': 'assembly_line/bz_dynamo'
  };
  for (const [id, tail] of Object.entries(only)) {
    const ps = producers(id).map((r) => r.i);
    assert.ok(ps.length >= 1, `${id} has a producer`);
    assert.deepEqual(ps.filter((i) => !i.endsWith(tail)), [], `${id} only from ${tail}`);
  }
});

test('the rule and the two pending routes that waited for these stacks are gone; the others stay', () => {
  const obtain = fs.readFileSync(path.resolve(here, '..', 'tiers', 'obtain.json'), 'utf8');
  assert.ok(!obtain.includes('UXV (B3)'), 'the B3 rule is deleted');
  const cov = json('emi_coverage.json');
  const ids = (cov.pendingRoutes || []).map((e) => e.id);
  for (const gone of ['grindless:warp_gate/hold_vela_pulsar', 'grindless:plasma_mass_filtering/disk_filter']) assert.ok(!ids.includes(gone), gone);
  for (const kept of ['grindless:assembler/uxv_fusion_casing', 'grindless:assembly_line/uxv_fusion_reactor', 'grindless:assembly_line/uxv_parallel_hatch']) assert.ok(ids.includes(kept), kept);
});

test('structures: not boring, at least two functional kinds, controller in the front slice', () => {
  for (const m of MACHINES) {
    const s = run.global.grindless.structures[`gtceu:${m}`];
    assert.ok(s, `${m} has a description`);
    const mm = measure(s);
    assert.deepEqual(violations(mm), [], `${m}: ${JSON.stringify(mm)}`);
    assert.ok(mm.dominantShare <= 0.62, `${m}: dominant share ${mm.dominantShare}`);
    assert.ok(mm.functional.length >= 3, `${m}: ${mm.functional}`);
    assert.ok(s.slices[s.slices.length - 1].some((row) => row.includes('S')), `${m}: the controller is in the front slice`);
    // every required part kind needs its own hatch cell: count the oneOf (X) cells
    const xs = s.slices.reduce((n, sl) => n + sl.join('').split('X').length - 1, 0);
    assert.ok(xs >= 4, `${m}: ${xs} hatch cells for at least four parts`);
  }
});

test('lang parity: every key of both languages, names, tooltips, EMI pages, recipe lines and the strand coil', () => {
  const keys = ['item.grindless.strand_coil', 'tooltip.grindless.strand_coil.0', 'tooltip.grindless.strand_coil.1', 'gtceu.recipe.grindless_naquadria_magnets.strand_coil'];
  for (const m of MACHINES) {
    keys.push(`block.gtceu.${m}`, `grindless.machine.${m}.tooltip.0`, `grindless.machine.${m}.tooltip.1`, `grindless.machine.${m}.tooltip.2`, `emi.grindless.info.${m}.0`, `emi.grindless.info.${m}.1`);
  }
  keys.push('gtceu.disk_skimming', 'gtceu.frc_forming', 'gtceu.blandford_znajek');
  for (const r of CD.recipes) keys.push(`gtceu.recipe.${r.dataKey}.${r.name}`);
  for (const k of keys) for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][k], `${lang} has ${k}`);
  const re = /accretion_disk_skimmer|frc_former|bz_dynamo|disk_skimming|frc_forming|blandford_znajek|strand_coil/;
  assert.deepEqual(Object.keys(run.lang.en_us).filter((k) => re.test(k)).sort(), Object.keys(run.lang.es_es).filter((k) => re.test(k)).sort());
  for (const m of MACHINES) assert.match(run.lang.en_us[`emi.grindless.info.${m}.0`], /Cygnus X-1/, `${m}'s page names Cygnus X-1`);
});
