// OpV-A2 (circuits): the items and fluids of startup_scripts/grindless/opv/circuits.js, the cutter, assembler and 4 K test rows of
// server_scripts/grindless/opv/circuits.js, and the rows this package appended to older machines (marked OpV-A2 in their own files).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const kube = path.join(pack, 'kubejs');
const run = runPackScripts(pack);
const OC = run.global.grindless.opvCircuits;
const recipes = run.docs.recipes.recipes;
const fileOf = (r) => String(run.recipeFiles.get(r.i)).replace(/\\/g, '/');
const find = (id) => recipes.find((r) => r.i === id);
const has = (side, id) => (r) => JSON.stringify(r.j[side] || {}).includes(`"${id}"`);
const producers = (id) => recipes.filter(has('outputs', id));
const consumers = (id) => recipes.filter(has('inputs', id));
const plain = (x) => JSON.parse(JSON.stringify(x));
const table = (f) => JSON.parse(fs.readFileSync(path.join(kube, 'data', 'grindless', 'tables', f), 'utf8'));

// [recipe id, the script that makes it]: the GTM-type rows of this package's own table
const OWN = [
  ['grindless:cutter/si_inp_wafers', 'opv/circuits.js'],
  ['grindless:cutter/untested_cryo_cmos_dies', 'opv/circuits.js'],
  ['grindless:cutter/hemt_amplifiers', 'opv/circuits.js'],
  ['grindless:assembler/hbn_capped_2deg_wafer', 'opv/circuits.js'],
  ['grindless:closed_loop_cooling/opv_cryo_cmos_die_test', 'opv/circuits.js'],
  ['grindless:closed_loop_cooling/opv_nb_tsv_interposer_test', 'opv/circuits.js']
];
// the rows appended to older scripts' own arrays
const SCRIPT_ROWS = [
  ['grindless:solvent_extraction/ev/si28_trichlorosilane', 'ev/extraction_cascade.js'],
  ['grindless:solvent_extraction/ev/inp_scrap_indium', 'ev/extraction_cascade.js'],
  ['grindless:solvent_extraction/ev/gan_exhaust_gallium', 'ev/extraction_cascade.js'],
  ['grindless:pgm_refining/opv/gold_overspray', 'ev/platinum_plant.js'],
  ['grindless:zone_refining/si28_poly_fz', 'uv/detectors.js'],
  ['grindless:srf_cavity/srf_cavity/rrr_nb_target', 'uv/cold.js'],
  ['grindless:mocvd/si28_poly_rod', 'uv/photonics.js'],
  ['grindless:mocvd/inas_al', 'uv/photonics.js'],
  ['grindless:mocvd/gate_stack', 'uv/photonics.js'],
  ['grindless:mocvd/gan_on_sic', 'uv/photonics.js'],
  ['grindless:fibre_draw/fibre_draw/cryo_optical_link', 'uv/photonics.js']
];
// [table, type, name, circuit, the script that loads it]: the rows appended to older machines' tables
const TABLE_ROWS = [
  ['crystals.json', 'crystal_growth', 'si_inp_boule', 21, 'uhv/crystals.js'],
  ['photonics.json', 'molecular_beam_epitaxy', 'inas_qw', 9, 'uhv/photonics.js'],
  ['photonics.json', 'molecular_beam_epitaxy', 'inp_hemt_epi', 10, 'uhv/photonics.js'],
  ['photonics.json', 'ion_implantation', 'cryo_cmos_implant', 12, 'uhv/photonics.js'],
  ['photonics.json', 'ion_implantation', 'hemt_isolation', 13, 'uhv/photonics.js'],
  ['photonics.json', 'ion_implantation', 'sdd_rings', 14, 'uhv/photonics.js'],
  ['beuv_stm.json', 'beuv_lithography', 'cryo_cmos_exposure', 4, 'uiv/beuv_stm.js'],
  ['beuv_stm.json', 'beuv_lithography', 'tsv_exposure', 5, 'uiv/beuv_stm.js'],
  ['beuv_stm.json', 'beuv_lithography', 'hemt_gate_exposure', 6, 'uiv/beuv_stm.js'],
  ['beuv_stm.json', 'beuv_lithography', 'gan_gate_exposure', 7, 'uiv/beuv_stm.js'],
  ['beuv_stm.json', 'beuv_lithography', 'sdd_anode_exposure', 8, 'uiv/beuv_stm.js'],
  ['beuv_stm.json', 'stm_lithography', 'gate_2deg', 4, 'uiv/beuv_stm.js'],
  ['spin_deposition.json', 'mtj_sputtering', 'cryo_cmos_metal', 5, 'uxv/spin_deposition.js'],
  ['spin_deposition.json', 'mtj_sputtering', 'nb_tsv_fill', 6, 'uxv/spin_deposition.js'],
  ['spin_deposition.json', 'mtj_sputtering', 'nbtin_film', 7, 'uxv/spin_deposition.js'],
  ['spin_deposition.json', 'mtj_sputtering', 'sdd_metal', 8, 'uxv/spin_deposition.js'],
  ['tfln_femtosecond.json', 'ion_slicing', 'tsv_bond', 5, 'uiv/tfln_femtosecond.js'],
  ['tfln_femtosecond.json', 'ion_slicing', 'ln_on_soi', 6, 'uiv/tfln_femtosecond.js'],
  ['tfln_femtosecond.json', 'femtosecond_writing', 'ln_soi_waveguides', 6, 'uiv/tfln_femtosecond.js'],
  ['photonics_uev.json', 'snspd_fabrication', 'snspd_link', 6, 'uev/photonics.js'],
  ['photonics_uev.json', 'photonic_integration', 'cosmic_mainframe', 8, 'uev/photonics.js'],
  ['composites.json', 'chemical_vapour_infiltration', 'hpsi_sic', 8, 'uev/composites.js'],
  ['power_devices.json', 'silicon_carbide', 'gan_mmic', 6, 'uhv/power_devices.js']
];
// the table types whose rows carry an EMI line (data key grindless_<type>)
const DATA_KEYED = ['crystal_growth', 'molecular_beam_epitaxy', 'beuv_lithography', 'stm_lithography', 'mtj_sputtering', 'ion_slicing',
  'femtosecond_writing', 'snspd_fabrication', 'chemical_vapour_infiltration', 'silicon_carbide', 'photonic_integration'];
const tableId = ([, type, name]) => (type === 'crystal_growth' ? `grindless:${type}/${type}/${name}` : `grindless:${type}/${name}`);
// the items of lines 11-18: each has a producer and a consumer among the recipes (nbtin_film_wafer waits for OpV-D1: made, not yet used)
const CHAIN = ['si28_poly_rod', 'si_inp_boule', 'si_inp_wafer', 'inp_scrap', 'inas_qw_wafer', 'hbn_capped_2deg_wafer', 'gate_stack_soi_wafer',
  'cryo_cmos_litho_wafer', 'cryo_cmos_implanted_wafer', 'cryo_cmos_metal_wafer', 'untested_cryo_cmos_die', 'gold_overspray', 'rrr_nb_target',
  'tsv_via_wafer', 'nb_filled_tsv_wafer', 'bonded_tsv_interposer', 'ln_on_soi_wafer', 'ln_soi_waveguide_wafer', 'snspd_link_wafer',
  'inp_hemt_epi_wafer', 'hemt_gated_wafer', 'isolated_hemt_wafer', 'hpsi_sic_wafer', 'gan_sic_epi_wafer', 'gan_gated_wafer', 'sdd_ring_wafer',
  'sdd_anode_wafer'];
// F1's parts (startup_scripts/grindless/opv/foundation.js and older eras): read, never registered here
const F1 = ['gated_2deg_wafer', 'cryo_cmos_die', 'nb_tsv_interposer', 'cryo_optical_link', 'hemt_amplifier', 'gan_mmic', 'sdd_die', 'inas_al_wafer', 'si28_soi_wafer'];

test('the stand-in runs the OpV-A2 scripts without errors and skips nothing', () => {
  const mine = run.errors.filter((e) => /opv[\\/]circuits|opv_circuits/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(OC.skipped), []);
  assert.equal(OC.recipes.length, 6);
  assert.deepEqual(plain(OC.fridgeRecipes), ['grindless:closed_loop_cooling/opv_cryo_cmos_die_test', 'grindless:closed_loop_cooling/opv_nb_tsv_interposer_test']);
});

test('28 items and 2 fluids registered by the startup file, named in both languages, each with a texture', () => {
  assert.equal(OC.items.length, 28);
  for (const id of OC.items) {
    const it = run.registry.items.get(id);
    assert.ok(it && /opv[\\/]circuits\.js$/.test(String(it.file)), `${id} registered by opv/circuits.js`);
    const n = id.split(':')[1];
    for (const lang of ['en_us', 'es_es']) {
      for (const k of [`item.grindless.${n}`, `tooltip.grindless.${n}.0`, `tooltip.grindless.${n}.1`]) assert.ok(run.lang[lang][k], `${lang} ${k}`);
    }
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), `${n}.png`);
  }
  assert.deepEqual(plain(OC.fluids), ['gtceu:si28_trichlorosilane', 'gtceu:gan_mocvd_exhaust']);
  for (const id of OC.fluids) {
    const f = run.registry.fluids.get(id);
    assert.ok(f && /opv[\\/]circuits\.js$/.test(String(f.file)), `${id} registered by opv/circuits.js`);
    for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][`material.gtceu.${id.split(':')[1]}`], `${lang} names ${id}`);
  }
});

test('F1\'s parts are read, never registered here; no priority line in the new files', () => {
  for (const n of F1) {
    const it = run.registry.items.get(`grindless:${n}`);
    assert.ok(it, `${n} is registered`);
    assert.ok(!/opv[\\/]circuits\.js$/.test(String(it.file)), `${n} not registered by opv/circuits.js`);
  }
  for (const f of [['startup_scripts', 'grindless', 'opv', 'circuits.js'], ['server_scripts', 'grindless', 'opv', 'circuits.js'], ['client_scripts', 'grindless', 'opv_circuits_lang.js']]) {
    assert.ok(!/^\s*\/\/\s*priority:/m.test(fs.readFileSync(path.join(kube, ...f), 'utf8')), f.join('/'));
  }
});

test('every row exists, in the script that owns its machine', () => {
  for (const [id, file] of OWN.concat(SCRIPT_ROWS, TABLE_ROWS.map((r) => [tableId(r), r[4]]))) {
    const r = find(id);
    assert.ok(r, `${id} exists`);
    assert.ok(fileOf(r).endsWith(file), `${id} made by ${file}, not ${fileOf(r)}`);
  }
});

test('the table rows: marked OpV-A2, on the circuits the package uses, and no other OpV-A2 row', () => {
  const byTable = {};
  for (const row of TABLE_ROWS) (byTable[row[0]] = byTable[row[0]] || []).push(row);
  for (const [f, rows] of Object.entries(byTable)) {
    const t = table(f);
    for (const [, type, name, circuit] of rows) {
      const r = t.types[type].recipes.find((x) => x.name === name);
      assert.ok(r, `${f} ${type}/${name}`);
      assert.match(r._why || '', /^OpV-A2/, `${type}/${name} marked`);
      assert.equal(r.circuit, circuit, `${type}/${name} circuit`);
      const clash = t.types[type].recipes.filter((x) => x.circuit === circuit);
      assert.equal(clash.length, 1, `${type} c${circuit} used once`);
    }
    const marked = Object.entries(t.types).flatMap(([type, tt]) => tt.recipes.filter((x) => /^OpV-A2/.test(x._why || '')).map((x) => `${type}/${x.name}`));
    assert.deepEqual(marked.sort(), rows.map(([, type, name]) => `${type}/${name}`).sort(), f);
  }
});

test('every data-keyed row has its EMI line in both languages', () => {
  for (const [, type, name] of TABLE_ROWS) {
    if (!DATA_KEYED.includes(type)) continue;
    const k = `gtceu.recipe.grindless_${type}.${name}`;
    for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][k], `${lang} ${k}`);
  }
});

test('the lines chain: every intermediate is made and used, the fluids too', () => {
  for (const n of CHAIN) {
    const id = `grindless:${n}`;
    assert.ok(producers(id).length >= 1, `${n} has a producer`);
    assert.ok(consumers(id).length >= 1, `${n} has a consumer`);
  }
  for (const id of ['gtceu:si28_trichlorosilane', 'gtceu:gan_mocvd_exhaust']) {
    assert.ok(producers(id).length >= 1, `${id} has a producer`);
    assert.ok(consumers(id).length >= 1, `${id} has a consumer`);
  }
  assert.ok(producers('grindless:nbtin_film_wafer').some((r) => r.i === 'grindless:mtj_sputtering/nbtin_film'));
  // the finished parts of lines 13-18 come out of their last step
  assert.ok(producers('grindless:cryo_cmos_die').some((r) => r.i === 'grindless:closed_loop_cooling/opv_cryo_cmos_die_test'));
  assert.ok(producers('grindless:nb_tsv_interposer').some((r) => r.i === 'grindless:closed_loop_cooling/opv_nb_tsv_interposer_test'));
  assert.ok(producers('grindless:gated_2deg_wafer').some((r) => r.i === 'grindless:stm_lithography/gate_2deg'));
  assert.ok(producers('grindless:inas_al_wafer').some((r) => r.i === 'grindless:mocvd/inas_al'));
  assert.ok(producers('grindless:cryo_optical_link').some((r) => r.i === 'grindless:fibre_draw/fibre_draw/cryo_optical_link'));
  assert.ok(producers('grindless:hemt_amplifier').some((r) => r.i === 'grindless:cutter/hemt_amplifiers'));
  assert.ok(producers('grindless:gan_mmic').some((r) => r.i === 'grindless:silicon_carbide/gan_mmic'));
  assert.ok(producers('grindless:sdd_die').some((r) => r.i === 'grindless:mtj_sputtering/sdd_metal'));
});

test('the join: one photonic hall row, circuit 8, the only maker of gtnn:cosmic_mainframe, from the four parts of lines 13-16', () => {
  const hall = table('photonics_uev.json').types.photonic_integration.recipes;
  const r = hall.find((x) => x.name === 'cosmic_mainframe');
  assert.ok(r);
  assert.equal(r.circuit, 8);
  assert.deepEqual(r.itemsIn.map((x) => x.id), ['grindless:cryo_cmos_die', 'grindless:nb_tsv_interposer', 'grindless:cryo_optical_link', 'grindless:hemt_amplifier']);
  assert.ok(r.itemsIn.length + 1 <= 8 && r.itemsOut.length <= 2, 'within the hall slots');
  assert.deepEqual(r.itemsOut, [{ id: 'gtnn:cosmic_mainframe', count: 1 }]);
  assert.equal(new Set(hall.map((x) => x.circuit)).size, hall.length, 'no circuit twice');
  assert.equal(OC.joinRecipe, 'grindless:photonic_integration/cosmic_mainframe');
  assert.deepEqual(plain(producers('gtnn:cosmic_mainframe').map((x) => x.i)), [OC.joinRecipe]);
  for (const p of r.itemsIn) assert.ok(producers(p.id).length >= 1, `${p.id} has a producer`);
});
