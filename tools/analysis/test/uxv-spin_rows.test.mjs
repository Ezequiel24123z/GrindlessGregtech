// UXV-A3 (spin_rows): the spintronic rows appended to the older shared tables (UEV electron beam, nitride magnet works, CVI, UHV crystals,
// UIV levitation melter, UEV megabar, UHV foundry, UV MOCVD, ZPM ion implanter), the own server file, and the items of startup uxv/spin_rows.js.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const run = runPackScripts(pack);
const SR = run.global.grindless.spinRows;
const recipes = run.docs.recipes.recipes;
const json = (n) => JSON.parse(fs.readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', n), 'utf8'));
const plain = (x) => JSON.parse(JSON.stringify(x));
const producers = (id) => recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`));
const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const mine = (file, type) => json(file).types[type].recipes.filter((r) => (r._why || '').startsWith('UXV-A3'));
const lang = ['en_us', 'es_es'];

const ITEMS = ['five_n_cobalt', 'five_n_iron', 'five_n_manganese', 'five_n_silicon', 'five_n_nickel', 'five_n_gallium', 'mu_metal_blend', 'mu_metal_ingot',
  'mu_metal_hot_band', 'annealed_mu_foil', 'mu_metal_shield_can', 'finemet_charge_dust', 'heusler_cast_ingot', 'ni_mn_ga_raw_crystal', 'raw_hbn_crystal',
  'wte2_raw_crystal', 'fgt_raw_crystal', 'dysco3_boule', 'ggg_boule', 'ga2o3_efg_plate', 'dysco3_slice', 'dysco3_polished_slice', 'ggg_slice', 'ggg_polished_slice',
  'ga2o3_slice', 'annealed_mtj_wafer', 'etched_mtj_wafer', 'annealed_mram_wafer', 'etched_mram_wafer', 'annealed_saf_wafer', 'written_track_wafer',
  'sot_heterostack', 'contacted_sot_stack', 'cofe_me_wafer', 'yig_film_wafer', 'yig_waveguide_wafer', 'stno_defined_wafer', 'stno_milled_wafer',
  'stno_clean_wafer', 'stno_planarised_wafer', 'stno_redeposit_dust', 'ga2o3_epi_wafer', 'ga2o3_gated_wafer'];

test('the stand-in runs the UXV-A3 scripts without errors, nothing skipped', () => {
  const errs = run.errors.filter((e) => /spin_rows|uv[\\/]photonics|zpm[\\/]qubits/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(SR.skipped), []);
});

test('43 items registered by the startup file, named in en_us and es_es with a tooltip', () => {
  assert.equal(ITEMS.length, 43);
  assert.deepEqual(plain(SR.items), ITEMS.map((n) => `grindless:${n}`));
  for (const n of ITEMS) {
    const it = run.registry.items.get(`grindless:${n}`);
    assert.ok(it && /uxv[\\/]spin_rows\.js$/.test(String(it.file)), n);
    for (const l of lang) {
      assert.ok(run.lang[l][`item.grindless.${n}`], `${l} name ${n}`);
      assert.ok(run.lang[l][`tooltip.grindless.${n}.0`], `${l} tooltip ${n}`);
    }
  }
});

test('electron beam furnace: six 5N grades, five pattern rows, carbon-12 vapour, mu-metal ingot', () => {
  const rows = mine('electron_beam.json', 'electron_beam_refining');
  assert.deepEqual(rows.map((r) => [r.name, r.circuit]), [['five_n_cobalt', 9], ['five_n_iron', 10], ['five_n_manganese', 11], ['five_n_silicon', 12], ['five_n_nickel', 13],
    ['five_n_gallium', 14], ['nanoaperture_array', 15], ['racetrack_tracks', 16], ['yig_waveguides', 17], ['vdw_edge_contacts', 18], ['me_switch_pattern', 19],
    ['c12_vapour', 20], ['stno_pillars', 27], ['ga2o3_gates', 28], ['mu_metal_ingot', 29]]);
  for (const r of rows.slice(0, 6)) {
    assert.equal(r.itemsIn[0].count, 2, r.name);
    assert.equal(r.itemsOut[0].count, 2, `${r.name}: 2 in, 2 out`);
    assert.ok(ids(r.itemsOut).includes('grindless:eb_skull'), r.name);
  }
  const c12 = rows.find((r) => r.name === 'c12_vapour');
  assert.deepEqual(ids(c12.fluidsOut), ['gtceu:carbon_burning_fuel']);
  const eb = json('electron_beam.json').types.electron_beam_refining.recipes;
  const cs = eb.map((r) => r.circuit);
  assert.equal(new Set(cs).size, cs.length, 'unique circuits');
});

test('nitride magnet works c8-15 and the CVI preform c5', () => {
  const j = json('composites.json').types;
  const nm = mine('composites.json', 'nitride_magnet_synthesis');
  assert.deepEqual(nm.map((r) => [r.name, r.circuit]), [['mtj_anneal', 8], ['mram_anneal', 9], ['saf_anneal', 10], ['heusler_homogenise', 11], ['sot_anneal', 12],
    ['ni_mn_ga_twin_training', 13], ['mu_metal_anneal', 14], ['finemet_field_anneal', 15]]);
  const all = j.nitride_magnet_synthesis.recipes.map((r) => r.circuit);
  assert.equal(new Set(all).size, all.length);
  for (const r of nm) assert.ok(r.itemsIn.length + 1 <= 3 && r.itemsOut.length <= 2 && r.fluidsIn.length <= 1 && r.fluidsOut.length <= 1, r.name);
  const hyd = nm.find((r) => r.name === 'mu_metal_anneal');
  assert.deepEqual([ids(hyd.fluidsIn), ids(hyd.fluidsOut)], [['gtceu:hydrogen'], ['gtceu:steam']]);
  const cvi = mine('composites.json', 'chemical_vapour_infiltration');
  assert.equal(cvi.length, 1);
  assert.equal(cvi[0].circuit, 5);
  assert.deepEqual(ids(cvi[0].itemsIn), ['gtceu:tungsten_184_single_wire']);
  assert.deepEqual(ids(cvi[0].itemsOut), ['grindless:w184_cvi_preform']);
  assert.ok(cvi[0].fluidsOut.some((f) => f.id === 'gtceu:hydrogen'), 'the hydrogen goes back');
});

test('crystals c10-17: the crucible and die wear 1 run in 32, the Ir die returns as the worn crucible', () => {
  const rows = mine('crystals.json', 'crystal_growth');
  assert.deepEqual(rows.map((r) => [r.name, r.circuit]), [['ggg_boule', 10], ['dysco3_boule', 11], ['wte2_cvt', 12], ['fgt_cvt', 13], ['ga2o3_efg', 14],
    ['terfenol_d_rod', 15], ['ni_mn_ga_crystal_growth', 16], ['wte2_recrystallise', 17]]);
  for (const r of json('crystals.json').types.crystal_growth.recipes) {
    assert.ok(r.itemsIn.length + r.kept.length + 1 <= 5 && r.itemsOut.length <= 2 && r.fluidsIn.length + r.charge.length <= 2 && r.fluidsOut.length === 0, r.name);
  }
  const die = rows.find((r) => r.name === 'ga2o3_efg');
  assert.equal(die.itemsIn.find((x) => x.id === 'grindless:five_n_iridium').chance, 313);
  assert.equal(die.itemsOut.find((x) => x.id === 'grindless:worn_iridium_crucible').chance, 313);
  const rod = rows.find((r) => r.name === 'terfenol_d_rod');
  assert.ok(ids(rod.itemsIn).includes('grindless:dysprosium_dust'));
  assert.ok(ids(rows.find((r) => r.name === 'wte2_cvt').itemsIn).includes('grindless:seven_n_tellurium'));
  assert.deepEqual(ids(rows.find((r) => r.name === 'fgt_cvt').itemsIn), ['grindless:five_n_iron', 'grindless:seven_n_germanium', 'grindless:seven_n_tellurium', 'gtceu:iodine_dust']);
  assert.ok(ids(rows.find((r) => r.name === 'ggg_boule').itemsIn).includes('gtceu:ggg_dust'));
  assert.ok(ids(rows.find((r) => r.name === 'dysco3_boule').itemsIn).includes('gtceu:dysco3_dust'));
  // the platinum plant's c5 (pgm_refining) takes the worn crucible back
  assert.ok(json('crystals.json').types.pgm_refining.recipes.some((r) => ids(r.itemsIn).includes('grindless:worn_iridium_crucible')));
});

test('levitation melter c9-16 under helium; megabar c6', () => {
  const rows = mine('levitation_melter.json', 'levitation_melting');
  assert.deepEqual(rows.map((r) => [r.name, r.circuit]), [['cofeb_melt', 9], ['heusler_melt', 10], ['terfenol_d_melt', 11], ['ni_mn_ga_melt', 12], ['finemet_melt', 13],
    ['stno_redeposit_remelt', 14], ['terfenol_d_remelt', 15], ['ni_mn_ga_remelt', 16]]);
  // lines 36 and 37: the crystal growth offcuts come back as GT dust, and only the melter takes it
  assert.deepEqual(ids(rows[6].itemsIn), ['gtceu:terfenol_d_dust']);
  assert.deepEqual(ids(rows[7].itemsIn), ['gtceu:ni2mnga_dust']);
  for (const r of rows) {
    assert.equal(r.eut, 7864320, r.name);
    assert.ok(ids(r.fluidsIn)[0] === 'gtceu:helium' && r.fluidsIn.length === 1 && r.itemsIn.length + 1 <= 5 && r.itemsOut.length <= 3, r.name);
  }
  assert.deepEqual(ids(rows[4].fluidsOut), ['gtceu:finemet_melt']);
  assert.ok(ids(rows[0].itemsOut).includes('grindless:cofeb_ingot') && ids(rows[1].itemsOut).includes('grindless:heusler_cast_ingot'));
  const lm = json('levitation_melter.json').types.levitation_melting.recipes.map((r) => r.circuit);
  const uc = json('uiv_components.json').types.levitation_melting.recipes.map((r) => r.circuit);
  assert.equal(new Set(lm.concat(uc)).size, lm.length + uc.length, 'circuits unique across the two tables');
  const mb = mine('megabar.json', 'megabar_synthesis');
  assert.deepEqual(mb.map((r) => [r.name, r.circuit]), [['hbn_crystal', 6]]);
  assert.equal(mb[0].itemsIn.find((x) => x.id === 'grindless:nanotwinned_diamond_anvil').chance, 1000);
  assert.deepEqual(ids(mb[0].itemsOut), ['grindless:raw_hbn_crystal']);
});

test('photonic foundry c17-22 rinse with ultrapure water; MOCVD c13-16; implanter c8-10', () => {
  const rows = mine('photonics.json', 'photonic_foundry');
  assert.deepEqual(rows.map((r) => [r.name, r.circuit]), [['meso_logic_die', 17], ['mram_copper', 18], ['rf_carpet_board', 19], ['stno_contacts', 20], ['ga2o3_dicing', 21],
    ['shielded_interposer', 22]]);
  for (const r of rows) {
    assert.ok(r.fluidsIn.some((f) => f.id === 'gtceu:ultrapure_water' && f.amount === 1000), r.name);
    assert.ok(r.fluidsOut.some((f) => f.id === 'minecraft:water' && f.amount >= 1000) && r.fluidsOut.length === 1 && r.fluidsIn.length <= 3, r.name);
    assert.ok(r.itemsIn.length + 1 <= 6 && r.itemsOut.length <= 3, r.name);
  }
  assert.equal(rows.find((r) => r.name === 'ga2o3_dicing').itemsOut[0].count, 4);
  const ph = run.global.grindless.photonics;
  assert.deepEqual(plain(ph.uxvRows.map((r) => [r.name, r.circuit])), [['mtj_die', 13], ['sin_membrane', 14], ['stno_planarise', 15], ['ga2o3_epi', 16]]);
  assert.deepEqual(plain(ph.clashes), []);
  for (const r of ph.uxvRows) assert.ok(r.itemsOut.length === 1 && r.fluidsIn.length <= 3 && r.fluidsOut.length <= 2, r.name);
  const mocvd = recipes.filter((r) => r.t === 'gtceu:mocvd').map((r) => (r.j.inputs.item.find((x) => x.content.type === 'gtceu:circuit') || { content: {} }).content.configuration);
  assert.equal(new Set(mocvd).size, mocvd.length, `unique mocvd circuits ${mocvd}`);
  const q = run.global.grindless.qubits.recipes.filter((r) => r.type === 'ion_implantation');
  // OpV-A1 appended hpge_contacts (c14) after UXV-A3's three
  assert.deepEqual(plain(q.filter((r) => r.name !== 'hpge_contacts').slice(-3).map((r) => [r.name, r.circuit])), [['mtj_ion_etch', 8], ['mram_ion_etch', 9], ['stno_ion_mill', 10]]);
  const imp = recipes.filter((r) => r.t === 'gtceu:ion_implantation').map((r) => (r.j.inputs.item.find((x) => x.content.type === 'gtceu:circuit') || { content: {} }).content.configuration);
  assert.equal(new Set(imp).size, imp.length, `unique implanter circuits ${imp}`);
});

test('own server file: slices, polish, anneals, leach, charges, mu-metal strip and can, STNO clean', () => {
  const all = [...SR.cutting, ...SR.polishing, ...SR.anneals, ...SR.chemistry, ...SR.mixing, ...SR.hotRolling, ...SR.assembly];
  assert.equal(all.length, 17);
  for (const r of all) assert.ok(recipes.some((x) => x.i.endsWith(`/${r.path}`)), r.id);
  assert.deepEqual(plain(SR.hotRolling.map((r) => r.circuit)), [7, 8]);
  const hot = recipes.filter((r) => r.t === 'gtceu:hot_rolling').map((r) => (r.j.inputs.item.find((x) => x.content.type === 'gtceu:circuit') || { content: {} }).content.configuration)
    .filter((c) => c !== undefined);
  assert.equal(new Set(hot).size, hot.length, `unique hot_rolling circuits ${hot}`);
  for (const r of SR.hotRolling) assert.equal(r.fluidsIn[0].amount * 160, r.fluidsOut[0].amount, 'steam 160 per water');
  for (const r of SR.cutting) assert.equal(r.itemsOut[0].count, 4, r.id);
  assert.deepEqual(plain(SR.polishing.map((r) => r.itemsOut[0].id)), ['grindless:dysco3_polished_slice', 'grindless:ggg_polished_slice', 'grindless:ga2o3_wafer']);
  assert.deepEqual(plain(SR.anneals.map((r) => r.itemsOut[0].id)), ['grindless:dysco3_substrate', 'grindless:ggg_wafer', 'grindless:wte2_crystal', 'grindless:fgt_crystal']);
  for (const r of SR.anneals) assert.ok(r.temp >= 1200, r.id);
  const leach = SR.chemistry.find((r) => r.path === 'uxv/hbn_leach');
  assert.deepEqual(plain(leach.itemsOut.map((x) => x.id)), ['grindless:hbn_crystal', 'gtceu:barium_dust']);
  assert.ok(SR.chemistry.find((r) => r.path === 'uxv/stno_clean').itemsOut.some((x) => x.id === 'grindless:stno_redeposit_dust'));
});

test('"only from": nothing else in the pack makes these ids', () => {
  const only = { 'grindless:five_n_cobalt': 'five_n_cobalt', 'grindless:five_n_gallium': 'five_n_gallium', 'grindless:cofeb_ingot': 'cofeb_melt|stno_redeposit_remelt',
    'grindless:heusler_ingot': 'heusler_homogenise', 'grindless:terfenol_d_rod': 'terfenol_d_rod', 'grindless:ni_mn_ga_crystal': 'ni_mn_ga_twin_training',
    'grindless:hbn_crystal': 'hbn_leach', 'grindless:wte2_crystal': 'wte2_crystal', 'grindless:fgt_crystal': 'fgt_crystal', 'grindless:ga2o3_wafer': 'ga2o3_polish',
    'grindless:dysco3_substrate': 'dysco3_substrate', 'grindless:ggg_wafer': 'ggg_wafer', 'grindless:mtj_die': 'mtj_die', 'grindless:mram_wafer': 'mram_copper',
    'grindless:sot_readout_stack': 'sot_anneal', 'grindless:meso_logic_die': 'meso_logic_die', 'grindless:sin_membrane': 'sin_membrane',
    'grindless:nanoaperture_array': 'nanoaperture_array', 'grindless:rf_carpet_board': 'rf_carpet_board', 'grindless:stno_array': 'stno_contacts',
    'grindless:ga2o3_power_die': 'ga2o3_dicing', 'grindless:mu_metal_foil': 'mu_metal_foil', 'grindless:shielded_interposer': 'shielded_interposer',
    'grindless:finemet_core': 'finemet_field_anneal', 'grindless:w184_cvi_preform': 'w184_fibre_preform',     'grindless:terfenol_d_ingot': 'terfenol_d_melt|terfenol_d_remelt',
        'grindless:ni_mn_ga_ingot': 'ni_mn_ga_melt|ni_mn_ga_remelt' };
  for (const [id, tails] of Object.entries(only)) {
    const ps = producers(id);
    assert.ok(ps.length >= 1, `${id} has a producer`);
    assert.ok(ps.every((r) => new RegExp(`(${tails})$`).test(r.i)), `${id} only from ${tails}: ${ps.map((r) => r.i)}`);
  }
  // the W-184 wire is GTM's own wiremill row: no row of ours makes it
  assert.ok(producers('gtceu:tungsten_184_single_wire').every((r) => r.i.startsWith('gtceu:')));
});

test('older rows are appended, never edited: the pinned older rows keep their circuits', () => {
  const eb = json('electron_beam.json').types.electron_beam_refining.recipes;
  assert.deepEqual(eb.slice(0, 8).map((r) => r.circuit), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(eb.filter((r) => (r._why || '').startsWith('UXV-A3')).length, 15);
  const n = (f, t) => mine(f, t).length;
  assert.equal(n('electron_beam.json', 'electron_beam_refining') + n('composites.json', 'nitride_magnet_synthesis') + n('composites.json', 'chemical_vapour_infiltration')
    + n('crystals.json', 'crystal_growth') + n('levitation_melter.json', 'levitation_melting') + n('megabar.json', 'megabar_synthesis') + n('photonics.json', 'photonic_foundry'), 15 + 8 + 1 + 8 + 8 + 1 + 6);
});

test('lang parity: every new table row has an EMI line in en_us and es_es', () => {
  const rows = [['electron_beam.json', 'electron_beam_refining', 'grindless_electron_beam'], ['composites.json', 'nitride_magnet_synthesis', 'grindless_nitride_magnet_synthesis'],
    ['composites.json', 'chemical_vapour_infiltration', 'grindless_chemical_vapour_infiltration'], ['crystals.json', 'crystal_growth', 'grindless_crystal_growth'],
    ['levitation_melter.json', 'levitation_melting', 'grindless_levitation_melting'], ['megabar.json', 'megabar_synthesis', 'grindless_megabar'],
    ['photonics.json', 'photonic_foundry', 'grindless_photonic_foundry']];
  for (const [f, t, dk] of rows) {
    for (const r of mine(f, t)) for (const l of lang) assert.ok(run.lang[l][`gtceu.recipe.${dk}.${r.name}`], `${l} ${dk}.${r.name}`);
  }
  for (const l of lang) assert.equal(Object.keys(run.lang[l]).filter((k) => /spin_rows/.test(k)).length, 0);
});
