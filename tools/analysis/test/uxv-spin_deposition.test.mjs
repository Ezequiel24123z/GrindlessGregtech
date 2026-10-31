// UXV-A4 (spin_deposition): the MTJ sputter cluster and oxide PLD chamber rows, line 41 (the KrF excimer laser), the controllers'
// assembly lines, the items registered by startup_scripts/grindless/uxv/spin_deposition.js and the structures.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { measure, violations } from '../lib/structure_quality.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const run = runPackScripts(pack);
const SD = run.global.grindless.spinDeposition;
const recipes = run.docs.recipes.recipes;
const fileOf = (r) => String(run.recipeFiles.get(r.i)).replace(/\\/g, '/');
const find = (id) => recipes.find((r) => r.i === id);
const producers = (id) => recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`));
const plain = (x) => JSON.parse(JSON.stringify(x));
const rec = (type, name) => SD.recipes.find((r) => r.type === type && r.name === name);

const ITEMS = ['cofe_target', 'bfo_film_wafer', 'krf_discharge_tube_blank', 'krf_discharge_tube', 'pulsed_power_head'];

test('the stand-in runs the UXV-A4 scripts without errors, nothing skipped, no lookup clash', () => {
  const mine = run.errors.filter((e) => /spin_deposition|sounds/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(SD.skipped), []);
  assert.deepEqual(plain(SD.clashes), []);
  assert.equal(SD.recipes.length, 14); // OpV-B1: + mtj_sputtering tetron_bumps (c9) and wc_sic_multilayer (c10)
});

test('5 items registered by the startup file, named in en_us and es_es', () => {
  for (const n of ITEMS) {
    const it = run.registry.items.get(`grindless:${n}`);
    assert.ok(it && /uxv[\\/]spin_deposition\.js$/.test(String(it.file)), `${n} registered by spin_deposition.js`);
    for (const lang of ['en_us', 'es_es']) {
      assert.ok(run.lang[lang][`item.grindless.${n}`], `${lang} names ${n}`);
      assert.ok(run.lang[lang][`tooltip.grindless.${n}.0`], `${lang} tooltip ${n}.0`);
      assert.ok(run.lang[lang][`tooltip.grindless.${n}.1`], `${lang} tooltip ${n}.1`);
    }
  }
});

test('the MTJ sputter rows: circuits 1-4, figures, spent target and scrap powder back', () => {
  const rows = SD.recipes.filter((r) => r.type === 'mtj_sputtering');
  // OpV-B1: + ['tetron_bumps', 9] (OpV line 19, the In bumps on the tetron dies) and ['wc_sic_multilayer', 10] (line 34)
  assert.deepEqual(plain(rows.map((r) => [r.name, r.circuit])), [['mtj_stack', 1], ['mram_stack', 2], ['saf_track', 3], ['stno_stack', 4], ['tetron_bumps', 9], ['wc_sic_multilayer', 10]]);
  const out = (r) => r.itemsOut.map((x) => x.id);
  assert.ok(out(rec('mtj_sputtering', 'mtj_stack')).includes('grindless:mtj_stack_wafer'));
  assert.ok(out(rec('mtj_sputtering', 'mtj_stack')).includes('grindless:spent_cofeb_target'), 'the spent CoFeB target comes back');
  assert.ok(out(rec('mtj_sputtering', 'mram_stack')).includes('grindless:mram_stack_wafer'));
  assert.ok(out(rec('mtj_sputtering', 'saf_track')).includes('grindless:saf_track_wafer'));
  assert.ok(out(rec('mtj_sputtering', 'stno_stack')).includes('grindless:stno_stack_wafer'), 'A3 reads stno_stack_wafer by this id');
  for (const r of rows) {
    assert.ok(r.fluidsIn.some((f) => f.id === 'gtceu:argon') && r.fluidsOut.some((f) => f.id === 'gtceu:argon' && f.amount < r.fluidsIn[0].amount), `${r.name}: argon in, a little less out`);
    // OpV-B1: the tetron bumps (c9) and the WC/SiC multilayer (c10) go on OpV parts, not on a Si-28 wafer
    assert.ok(r.circuit > 4 || r.itemsIn.some((x) => x.id === 'grindless:h_si28_wafer'), `${r.name}: on a Si-28 wafer`);
    assert.ok([33554432, 67108864].includes(r.eut) && r.duration >= 600, `${r.name}: figures ${r.eut} x ${r.duration}`);
    assert.ok(find(`grindless:mtj_sputtering/${r.name}`), `${r.name} is in the recipe docs`);
  }
  assert.ok(rec('mtj_sputtering', 'mtj_stack').itemsIn.some((x) => x.id === 'grindless:cofeb_target'));
  assert.ok(rec('mtj_sputtering', 'mram_stack').itemsIn.some((x) => x.id === 'grindless:heusler_target'));
  assert.ok(rec('mtj_sputtering', 'saf_track').itemsIn.some((x) => x.id === 'grindless:saf_target_set'));
  assert.ok(rec('mtj_sputtering', 'mtj_stack').itemsIn.some((x) => x.id === 'grindless:ta_seed_target'));
  assert.ok(rec('mtj_sputtering', 'mtj_stack').itemsIn.some((x) => x.id === 'grindless:mgo_target'));
});

test('the oxide PLD rows: circuits 1-3, the laser kept, RuO4 and BFO fume as byproducts', () => {
  const rows = SD.recipes.filter((r) => r.type === 'pulsed_laser_deposition');
  assert.deepEqual(plain(rows.map((r) => [r.name, r.circuit])), [['srruo3_electrode', 1], ['bfo_film', 2], ['me_switch', 3]]);
  for (const r of rows) {
    assert.deepEqual(plain(r.kept.map((x) => x.id)), ['grindless:krf_excimer_laser'], `${r.name}: the laser is not consumed`);
    assert.ok(r.fluidsIn.some((f) => f.id === 'gtceu:oxygen'), `${r.name}: oxygen`);
    assert.ok(find(`grindless:pulsed_laser_deposition/${r.name}`), `${r.name} is in the recipe docs`);
  }
  const o = (n) => plain(rec('pulsed_laser_deposition', n).itemsOut.map((x) => x.id));
  assert.deepEqual(o('srruo3_electrode'), ['grindless:srruo3_electrode_wafer', 'gtceu:ruthenium_tetroxide_dust']);
  assert.deepEqual(o('bfo_film'), ['grindless:bfo_film_wafer', 'grindless:bfo_fume']);
  assert.deepEqual(o('me_switch'), ['grindless:cofe_me_wafer', 'gtceu:small_cobalt_dust']);
  assert.ok(rec('pulsed_laser_deposition', 'srruo3_electrode').itemsIn.some((x) => x.id === 'grindless:srruo3_target'));
  assert.ok(rec('pulsed_laser_deposition', 'bfo_film').itemsIn.some((x) => x.id === 'grindless:la_bfo_target'));
});

test('line 41: five steps, the laser on an assembly line researched on the conditioned tube', () => {
  for (const id of ['mixer/kr_f2_premix', 'assembler/krf_discharge_tube_blank', 'assembler/pulsed_power_head', 'assembler/cofe_target', 'chemical_reactor/krf_discharge_tube']) {
    assert.ok(find(`grindless:${id}`), id);
  }
  assert.equal(SD.laserRecipe, 'grindless:assembly_line/krf_excimer_laser');
  const laser = find(SD.laserRecipe);
  assert.ok(laser && laser.t === 'gtceu:assembly_line');
  const text = JSON.stringify(laser.j);
  for (const id of ['grindless:krf_discharge_tube', 'grindless:pulsed_power_head', 'grindless:vuv_caf2_optic', 'gtceu:uev_sensor', 'gtceu:he_6n']) assert.ok(text.includes(id), `the laser takes ${id}`);
  assert.ok(text.includes('krf_discharge_tube'), 'research stack');
  const tube = find('grindless:chemical_reactor/krf_discharge_tube');
  assert.ok(JSON.stringify(tube.j).includes('gtceu:fluorine'), 'the spent fluorine comes back');
});

test('the controllers: UIV hull, parts, mainframes, helium, at least 8 distinct ingredients', () => {
  assert.deepEqual(plain(SD.controllerRecipes), ['grindless:assembly_line/mtj_sputter_cluster', 'grindless:assembly_line/oxide_pld_chamber']);
  for (const id of SD.controllerRecipes) {
    const r = find(id);
    assert.ok(r && r.t === 'gtceu:assembly_line', id);
    const text = JSON.stringify(r.j);
    for (const need of ['gtceu:uiv_machine_hull', 'gtnn:optical_mainframe', 'gtceu:he_6n', 'gtceu:soldering_alloy', 'gtceu:lubricant']) assert.ok(text.includes(need), `${id} takes ${need}`);
    assert.ok(!text.includes('neutronium'), `${id} takes no neutronium`);
    const ids = new Set((text.match(/"(?:id|tag|item)":"[^"]+"/g) || []));
    assert.ok(ids.size >= 8, `${id}: ${ids.size} distinct ingredients`);
  }
});

test('"only from": nothing else in the pack makes these ids', () => {
  const only = {
    'grindless:mtj_stack_wafer': 'mtj_sputtering/mtj_stack', 'grindless:mram_stack_wafer': 'mtj_sputtering/mram_stack',
    'grindless:saf_track_wafer': 'mtj_sputtering/saf_track', 'grindless:stno_stack_wafer': 'mtj_sputtering/stno_stack',
    'grindless:srruo3_electrode_wafer': 'pulsed_laser_deposition/srruo3_electrode', 'grindless:bfo_film_wafer': 'pulsed_laser_deposition/bfo_film',
    'grindless:cofe_me_wafer': 'pulsed_laser_deposition/me_switch', 'grindless:me_switch_wafer': 'electron_beam_refining/me_switch_pattern', 'grindless:kr_f2_premix': 'mixer/kr_f2_premix',
    'grindless:krf_excimer_laser': 'assembly_line/krf_excimer_laser', 'grindless:krf_discharge_tube': 'chemical_reactor/krf_discharge_tube',
    'grindless:krf_discharge_tube_blank': 'assembler/krf_discharge_tube_blank', 'grindless:pulsed_power_head': 'assembler/pulsed_power_head',
    'grindless:cofe_target': 'assembler/cofe_target', 'gtceu:mtj_sputter_cluster': 'assembly_line/mtj_sputter_cluster',
    'gtceu:oxide_pld_chamber': 'assembly_line/oxide_pld_chamber'
  };
  for (const [id, tail] of Object.entries(only)) {
    const ps = producers(id);
    assert.ok(ps.length >= 1, `${id} has a producer`);
    assert.ok(ps.every((r) => r.i.endsWith(tail)), `${id} only from ${tail}: ${ps.map((r) => r.i)}`);
  }
  assert.ok(producers('grindless:spent_cofeb_target').some((r) => r.i === 'grindless:mtj_sputtering/mtj_stack'));
  assert.ok(producers('grindless:bfo_fume').some((r) => r.i === 'grindless:pulsed_laser_deposition/bfo_film'));
});

test('no older row written: no recipe of this package sits in another package\'s file', () => {
  const mine = recipes.filter((r) => /uxv[\\/]spin_deposition\.js$/.test(fileOf(r)));
  assert.equal(mine.length, 14 + 2 + 1, 'rows, two controllers, the laser'); // OpV-B1: + tetron_bumps, wc_sic_multilayer
});

test('structures: not boring, at least two functional kinds, controller in the front slice', () => {
  for (const id of ['gtceu:mtj_sputter_cluster', 'gtceu:oxide_pld_chamber']) {
    const s = run.global.grindless.structures[id];
    assert.ok(s, `${id} has a description`);
    const m = measure(s);
    assert.deepEqual(violations(m), [], `${id}: ${JSON.stringify(m)}`);
    assert.ok(m.dominantShare <= 0.62, `${id}: dominant share ${m.dominantShare}`);
    assert.ok(s.slices[s.slices.length - 1].some((row) => row.includes('S')), `${id}: the controller is in the front slice`);
  }
});

test('lang parity: every key of both languages, names, tooltips, EMI pages and recipe lines', () => {
  const keys = [];
  for (const m of ['mtj_sputter_cluster', 'oxide_pld_chamber']) {
    keys.push(`block.gtceu.${m}`, `grindless.machine.${m}.tooltip.0`, `emi.grindless.info.${m}.0`, `emi.grindless.info.${m}.1`);
  }
  keys.push('gtceu.mtj_sputtering', 'gtceu.pulsed_laser_deposition');
  for (const r of SD.recipes.filter((x) => x.dataKey)) keys.push(`gtceu.recipe.${r.dataKey}.${r.name}`);
  for (const k of keys) for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][k], `${lang} has ${k}`);
  assert.deepEqual(Object.keys(run.lang.en_us).filter((k) => /spin_deposition|mtj_sputt|oxide_pld/.test(k)).sort(),
    Object.keys(run.lang.es_es).filter((k) => /spin_deposition|mtj_sputt|oxide_pld/.test(k)).sort());
});
