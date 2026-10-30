// UXV-A5 (spin_logic): the vdW stacking cell, racetrack fab and YIG LPE furnace rows, line 42's crucible, the magnonic bus, the three controllers'
// assembly lines, the spintronic mainframe row in the photonic hall, the items registered by startup_scripts/grindless/uxv/spin_logic.js and the structures.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { measure, violations } from '../lib/structure_quality.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const SL = run.global.grindless.spinLogic;
const recipes = run.docs.recipes.recipes;
const fileOf = (r) => String(run.recipeFiles.get(r.i)).replace(/\\/g, '/');
const find = (id) => recipes.find((r) => r.i === id);
const producers = (id) => recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`));
const plain = (x) => JSON.parse(JSON.stringify(x));
const rec = (type, name) => SL.recipes.find((r) => r.type === type && r.name === name);
const ids = (xs) => xs.map((x) => x.id);

const ITEMS = ['wte2_flake', 'fgt_flake', 'hbn_flake', 'patterned_track_wafer', 'pt_crucible_shell'];
const MACHINES = ['vdw_stacking_cell', 'racetrack_fab', 'yig_lpe_furnace'];

test('the stand-in runs the UXV-A5 scripts without errors, nothing skipped, no lookup clash', () => {
  const mine = run.errors.filter((e) => /spin_logic|sounds/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(SL.skipped), []);
  assert.deepEqual(plain(SL.clashes), []);
  assert.equal(SL.recipes.length, 12);
});

test('5 items registered by the startup file, named in en_us and es_es', () => {
  for (const n of ITEMS) {
    const it = run.registry.items.get(`grindless:${n}`);
    assert.ok(it && /uxv[\\/]spin_logic\.js$/.test(String(it.file)), `${n} registered by spin_logic.js`);
    for (const lang of ['en_us', 'es_es']) {
      assert.ok(run.lang[lang][`item.grindless.${n}`], `${lang} names ${n}`);
      assert.ok(run.lang[lang][`tooltip.grindless.${n}.0`], `${lang} tooltip ${n}.0`);
      assert.ok(run.lang[lang][`tooltip.grindless.${n}.1`], `${lang} tooltip ${n}.1`);
    }
  }
});

test('the vdW stacking rows: circuits 1-4, argon, flakes, broken flakes as GT dusts', () => {
  const rows = SL.recipes.filter((r) => r.type === 'vdw_stacking');
  assert.deepEqual(plain(rows.map((r) => [r.name, r.circuit])), [['wte2_flake', 1], ['fgt_flake', 2], ['hbn_flake', 3], ['sot_heterostack', 4]]);
  assert.deepEqual(plain(ids(rec('vdw_stacking', 'wte2_flake').itemsIn)), ['grindless:wte2_crystal']);
  assert.deepEqual(plain(ids(rec('vdw_stacking', 'fgt_flake').itemsIn)), ['grindless:fgt_crystal']);
  assert.deepEqual(plain(ids(rec('vdw_stacking', 'hbn_flake').itemsIn)), ['grindless:hbn_crystal']);
  assert.ok(ids(rec('vdw_stacking', 'wte2_flake').itemsOut).includes('gtceu:wte2_dust'));
  assert.ok(ids(rec('vdw_stacking', 'fgt_flake').itemsOut).includes('gtceu:fe3gete2_dust'));
  assert.ok(ids(rec('vdw_stacking', 'hbn_flake').itemsOut).includes('grindless:hbn_dust'));
  const c4 = rec('vdw_stacking', 'sot_heterostack');
  assert.deepEqual(plain(ids(c4.itemsIn)), ['grindless:hbn_flake', 'grindless:wte2_flake', 'grindless:fgt_flake']);
  assert.deepEqual(plain(ids(c4.itemsOut)), ['grindless:sot_heterostack', 'gtceu:wte2_dust', 'gtceu:fe3gete2_dust']);
  assert.equal(c4.eut, 67108864);
  assert.equal(c4.duration, 900);
  for (const r of rows) {
    assert.ok(r.fluidsIn.some((f) => f.id === 'gtceu:argon'), `${r.name}: argon`);
    assert.ok(r.itemsOut.slice(1).every((x) => x.chance < 10000), `${r.name}: the byproducts are chanced`);
    assert.ok(find(`grindless:vdw_stacking/${r.name}`), `${r.name} is in the recipe docs`);
  }
});

test('the racetrack rows: circuits 1-2, patterned wafer then chip, platinum-group sludge', () => {
  const rows = SL.recipes.filter((r) => r.type === 'racetrack_patterning');
  assert.deepEqual(plain(rows.map((r) => [r.name, r.circuit, r.eut, r.duration])), [['pattern_track', 1, 33554432, 600], ['racetrack_chip', 2, 67108864, 900]]);
  assert.deepEqual(plain(ids(rows[0].itemsIn)), ['grindless:written_track_wafer']);
  assert.deepEqual(plain(ids(rows[0].itemsOut)), ['grindless:patterned_track_wafer', 'gtceu:platinum_group_sludge_dust']);
  assert.deepEqual(plain(ids(rows[1].itemsIn)), ['grindless:patterned_track_wafer', 'grindless:mtj_die']);
  assert.deepEqual(plain(ids(rows[1].itemsOut)), ['grindless:racetrack_chip']);
  for (const r of rows) assert.ok(find(`grindless:racetrack_patterning/${r.name}`));
});

test('the LPE rows: flux, the YIG film with the crucible kept, the skim that gives lpe_dross', () => {
  const rows = SL.recipes.filter((r) => r.type === 'liquid_phase_epitaxy');
  assert.deepEqual(plain(rows.map((r) => [r.name, r.circuit])), [['lpe_flux', 1], ['yig_film', 2], ['flux_skim', 3]]);
  assert.deepEqual(plain(rows[0].fluidsOut), [{ id: 'gtceu:lpe_flux', amount: 4000 }]);
  const film = rows[1];
  assert.deepEqual(plain(ids(film.kept)), ['grindless:pt_lpe_crucible'], 'the crucible is not consumed');
  assert.ok(ids(film.itemsIn).includes('grindless:ggg_wafer') && ids(film.itemsIn).includes('grindless:yttrium_oxide_dust') && ids(film.itemsIn).includes('gtceu:hematite_dust'));
  assert.deepEqual(plain(ids(film.itemsOut)), ['grindless:yig_film_wafer']);
  assert.ok(film.fluidsOut[0].amount < film.fluidsIn[0].amount && film.fluidsOut[0].id === 'gtceu:lpe_flux', 'most of the flux comes back');
  assert.ok(ids(rows[2].itemsOut).includes('grindless:lpe_dross'));
  assert.ok(rows[2].itemsOut.every((x) => x.id === 'grindless:lpe_dross' || x.chance < 10000), 'the recovered oxides are chanced');
  for (const r of [...rows, ...SL.recipes.filter((x) => x.type === 'vdw_stacking')]) assert.ok(r.eut <= 67108864, `${r.name}: within two UIV hatches`);
});

test('line 42 and line 12: the crucible takes a lathe and a weld step, the magnonic bus its own assembler row', () => {
  assert.deepEqual(plain(ids(rec('lathe', 'pt_crucible_shell').itemsIn)), ['grindless:pt_sheet']);
  assert.equal(rec('lathe', 'pt_crucible_shell').itemsIn[0].count, 4);
  const weld = rec('assembler', 'pt_lpe_crucible');
  assert.deepEqual(plain(ids(weld.itemsIn)), ['grindless:pt_crucible_shell', 'grindless:pt_sheet', 'grindless:five_n_platinum', 'gtceu:small_platinum_dust', 'gtceu:small_iridium_dust', 'gtceu:small_rhodium_dust']);
  assert.ok(weld.fluidsIn.some((f) => f.id === 'gtceu:argon'));
  const bus = rec('assembler', 'magnonic_bus');
  assert.deepEqual(plain(ids(bus.itemsIn)), ['grindless:yig_waveguide_wafer', 'grindless:stno_array', 'grindless:five_n_platinum', 'grindless:pt_sheet']);
  for (const id of ['lathe/pt_crucible_shell', 'assembler/pt_lpe_crucible', 'assembler/magnonic_bus']) assert.ok(find(`grindless:${id}`), id);
});

test('the controllers: UIV hull, parts, mainframes, helium, domain inputs, at least 8 distinct ingredients', () => {
  assert.deepEqual(plain(SL.controllerRecipes), MACHINES.map((m) => `grindless:assembly_line/${m}`));
  const need = {
    vdw_stacking_cell: ['grindless:uiv_robot_arm', 'grindless:wte2_crystal', 'grindless:terfenol_d_rod', 'grindless:sin_membrane', 'grindless:vuv_caf2_optic'],
    racetrack_fab: ['grindless:uiv_electric_motor', 'grindless:saf_track_wafer', 'grindless:mtj_die', 'grindless:pt_sheet', 'grindless:ga2o3_power_die'],
    yig_lpe_furnace: ['grindless:uiv_electric_piston', 'grindless:ggg_wafer', 'grindless:pt_lpe_crucible', 'grindless:w184_cvi_preform', 'grindless:pt_sheet']
  };
  for (const m of MACHINES) {
    const r = find(`grindless:assembly_line/${m}`);
    assert.ok(r && r.t === 'gtceu:assembly_line', m);
    const text = JSON.stringify(r.j);
    for (const id of ['gtceu:uiv_machine_hull', 'gtnn:optical_mainframe', 'gtceu:he_6n', 'gtceu:soldering_alloy', 'gtceu:lubricant', ...need[m]]) assert.ok(text.includes(id), `${m} takes ${id}`);
    assert.ok(!text.includes('neutronium'), `${m} takes no neutronium`);
    assert.ok(new Set(text.match(/"(?:id|tag|item)":"[^"]+"/g) || []).size >= 8, `${m}: at least 8 distinct ingredients`);
  }
});

test('the mainframe: one photonic hall row, circuit 7, the only maker of gtnn:spintronic_mainframe', () => {
  const hall = JSON.parse(fs.readFileSync(path.join(pack, 'kubejs/data/grindless/tables/photonics_uev.json'), 'utf8')).types.photonic_integration.recipes;
  const last = hall[hall.length - 1];
  assert.equal(last.name, 'spintronic_mainframe');
  assert.equal(last.circuit, 7);
  assert.match(last._why, /UXV-A5/);
  assert.deepEqual(last.itemsIn.map((x) => x.id), ['grindless:meso_logic_die', 'grindless:racetrack_chip', 'grindless:mram_wafer', 'grindless:magnonic_bus', 'grindless:mtj_die', 'grindless:shielded_interposer']);
  assert.ok(last.itemsIn.length + 1 <= 8);
  assert.deepEqual(last.itemsOut, [{ id: 'gtnn:spintronic_mainframe', count: 1 }]);
  assert.equal(new Set(hall.map((r) => r.circuit)).size, hall.length, 'no circuit twice');
  const ps = producers('gtnn:spintronic_mainframe');
  assert.deepEqual(plain(ps.map((r) => r.i)), ['grindless:photonic_integration/spintronic_mainframe']);
});

test('"only from": nothing else in the pack makes these ids', () => {
  const only = {
    'grindless:wte2_flake': 'vdw_stacking/wte2_flake', 'grindless:fgt_flake': 'vdw_stacking/fgt_flake', 'grindless:hbn_flake': 'vdw_stacking/hbn_flake',
    'grindless:sot_heterostack': 'vdw_stacking/sot_heterostack', 'grindless:patterned_track_wafer': 'racetrack_patterning/pattern_track',
    'grindless:racetrack_chip': 'racetrack_patterning/racetrack_chip', 'grindless:yig_film_wafer': 'liquid_phase_epitaxy/yig_film',
    'grindless:pt_crucible_shell': 'lathe/pt_crucible_shell', 'grindless:pt_lpe_crucible': 'assembler/pt_lpe_crucible', 'grindless:magnonic_bus': 'assembler/magnonic_bus',
    'gtceu:vdw_stacking_cell': 'assembly_line/vdw_stacking_cell', 'gtceu:racetrack_fab': 'assembly_line/racetrack_fab', 'gtceu:yig_lpe_furnace': 'assembly_line/yig_lpe_furnace'
  };
  for (const [id, tail] of Object.entries(only)) {
    const ps = producers(id);
    assert.ok(ps.length >= 1, `${id} has a producer`);
    assert.ok(ps.every((r) => r.i.endsWith(tail)), `${id} only from ${tail}: ${ps.map((r) => r.i)}`);
  }
  assert.ok(producers('grindless:lpe_dross').every((r) => r.i === 'grindless:liquid_phase_epitaxy/flux_skim'));
  assert.ok(producers('grindless:lpe_dross').length === 1);
  assert.ok(producers('gtceu:lpe_flux').length >= 1 && JSON.stringify(find('grindless:liquid_phase_epitaxy/lpe_flux').j).includes('lpe_flux'));
  assert.ok(producers('gtceu:wte2_dust').some((r) => r.i === 'grindless:vdw_stacking/wte2_flake'));
  assert.ok(producers('gtceu:fe3gete2_dust').some((r) => r.i === 'grindless:vdw_stacking/fgt_flake'));
  // the integrator's crystal growth c18 recrystallises the FGT flake dust, as A3's c17 does for WTe2
  const fgt = recipes.find((r) => /crystal_growth\/(.*\/)?fgt_recrystallise$/.test(r.i));
  assert.ok(fgt && JSON.stringify(fgt.j).includes('gtceu:fe3gete2_dust') && JSON.stringify(fgt.j).includes('grindless:fgt_raw_crystal'), 'FGT dust goes back to the raw crystal');
});

test('older rows: only the hall row sits outside this package\'s files', () => {
  const mine = recipes.filter((r) => /uxv[\\/]spin_logic\.js$/.test(fileOf(r)));
  assert.equal(mine.length, 12 + 3, 'rows and three controllers');
});

test('the held F1 ids are free: the A5 hold rules are deleted, the pending EMI entries too', () => {
  const obtain = fs.readFileSync(path.join(root, 'tools/analysis/tiers/obtain.json'), 'utf8');
  assert.ok(!/"era": "UXV \(A5\)"/.test(obtain), 'no A5 obtain rule left');
  const cov = fs.readFileSync(path.join(root, 'tools/analysis/emi_coverage.json'), 'utf8');
  assert.ok(!cov.includes('"package": "UXV-A5"'), 'no A5 pending use left');
  for (const id of ['lpe_dross_lead', 'vdw_edge_contacts', 'wte2_recrystallise', 'photonic_foundry/meso_logic_die']) assert.ok(!cov.includes(id), id);
  // UXV-B5 wrote the emitter, so the hatch's pending route is deleted too
  assert.ok(!JSON.parse(cov).pendingRoutes.some((e) => e.id === 'grindless:assembly_line/uxv_parallel_hatch'), 'the hatch entry is deleted by B5');
});

test('structures: not boring, at least two functional kinds, controller in the front slice', () => {
  for (const m of MACHINES) {
    const s = run.global.grindless.structures[`gtceu:${m}`];
    assert.ok(s, `${m} has a description`);
    const meas = measure(s);
    assert.deepEqual(violations(meas), [], `${m}: ${JSON.stringify(meas)}`);
    assert.ok(meas.dominantShare <= 0.62, `${m}: dominant share ${meas.dominantShare}`);
    assert.ok(s.slices[s.slices.length - 1].some((row) => row.includes('S')), `${m}: the controller is in the front slice`);
  }
});

test('lang parity: every key of both languages, names, tooltips, EMI pages and recipe lines', () => {
  const keys = [];
  for (const m of MACHINES) {
    keys.push(`block.gtceu.${m}`, `grindless.machine.${m}.tooltip.0`, `grindless.machine.${m}.tooltip.1`, `grindless.machine.${m}.tooltip.2`, `emi.grindless.info.${m}.0`, `emi.grindless.info.${m}.1`);
  }
  keys.push('gtceu.vdw_stacking', 'gtceu.racetrack_patterning', 'gtceu.liquid_phase_epitaxy');
  for (const r of SL.recipes.filter((x) => x.dataKey)) keys.push(`gtceu.recipe.${r.dataKey}.${r.name}`);
  for (const k of keys) for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][k], `${lang} has ${k}`);
  const re = /spin_logic|vdw_stacking|racetrack|liquid_phase_epitaxy|yig_lpe/;
  assert.deepEqual(Object.keys(run.lang.en_us).filter((k) => re.test(k)).sort(), Object.keys(run.lang.es_es).filter((k) => re.test(k)).sort());
});

test('EMI info pages and sounds exist for every machine and recipe type', () => {
  for (const m of MACHINES) {
    const p = path.join(pack, `kubejs/assets/emi/recipe/additions/grindless/uxv_spin_logic_${m}.json`);
    assert.ok(fs.existsSync(p), p);
    assert.deepEqual(JSON.parse(fs.readFileSync(p, 'utf8')).stacks, [`item:gtceu:${m}`]);
  }
  const sounds = fs.readFileSync(path.join(pack, 'kubejs/startup_scripts/grindless/sounds.js'), 'utf8');
  for (const t of ['vdw_stacking', 'racetrack_patterning', 'liquid_phase_epitaxy']) assert.ok(sounds.includes(`'gtceu:${t}'`), t);
});
