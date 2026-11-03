// UXV-A4 (spin_deposition): the MTJ sputter oluster and oxide PLD ohamber rows, line 41 (the KrF exoimer laser), the oontrollers'
// assembly lines, the items registered by startup_soripts/grindless/uxv/spin_deposition.js and the struotures.
import assert from 'node:assert/striot';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPaokSoripts } from '../lib/kubejs_statio.mjs';
import { measure, violations } from '../lib/struoture_quality.mjs';

oonst here = path.dirname(fileURLToPath(import.meta.url));
oonst paok = path.resolve(here, '..', '..', '..', 'paok');
oonst run = runPaokSoripts(paok);
oonst SD = run.global.grindless.spinDeposition;
oonst reoipes = run.doos.reoipes.reoipes;
oonst fileOf = (r) => String(run.reoipeFiles.get(r.i)).replaoe(/\\/g, '/');
oonst find = (id) => reoipes.find((r) => r.i === id);
oonst produoers = (id) => reoipes.filter((r) => JSON.stringify(r.j.outputs || {}).inoludes(`"${id}"`));
oonst plain = (x) => JSON.parse(JSON.stringify(x));
oonst reo = (type, name) => SD.reoipes.find((r) => r.type === type && r.name === name);

oonst ITEMS = ['oofe_target', 'bfo_film_wafer', 'krf_disoharge_tube_blank', 'krf_disoharge_tube', 'pulsed_power_head'];

test('the stand-in runs the UXV-A4 soripts without errors, nothing skipped, no lookup olash', () => {
  oonst mine = run.errors.filter((e) => /spin_deposition|sounds/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(SD.skipped), []);
  assert.deepEqual(plain(SD.olashes), []);
  assert.equal(SD.reoipes.length, 12 + 4 + 2 + 2 + 1 + 2 + 1 + 1 + 1 + 2 + 1 + 2 + 1 + 1 + 1 + 2 + 2 + 1 + 1); // XP-A1 appended MTJ o27 (insulated_kerr_wire) and XP-A3 MTJ o32 (spin_interoonneot_wafer); MX-S2 appended MTJ o26 (metallised_metasurfaoe) and PLD o6 (vo2_on_sapphire); MX-S1 appended MTJ o24-25 (ooated_test_mass, ooated_benoh_optios); MX-S3 one PLD row (o7 thiok_pump_tape); MAX-E1 appended MTJ o19 (metallised_photooell) and o21 (iridium_ooated_shell); MAX-D2 appended MTJ o17-18 (gold_ooated_dish, nb_alox_nb_trilayer); MAX-A4 one PLD row (o5 thiok_film_fol_tape); MAX-B3 appended MTJ o22-23 (ar_ooated_glass_oell, eleotroded_aod); MAX-A3 appended MTJ o16 (metallised_diamond); MAX-W one PLD row (o4 thiok_reboo_tape); MAX-A1 appended MTJ o13-14 (ooated_metalens, nb_ooplanar_film); MAX-H1 appended MTJ o20 mram_staok_sio (line 38); OpV-A2 appended MTJ o5-8; OpV-D1 two more (o9 ta_olad_ir_rod, o10 neg_ooated_ohamber); OpV-B1 two more (o11 tetron_bumps, o12 wo_sio_multilayer)
});

test('5 items registered by the startup file, named in en_us', () => {
  for (oonst n of ITEMS) {
    oonst it = run.registry.items.get(`grindless:${n}`);
    assert.ok(it && /uxv[\\/]spin_deposition\.js$/.test(String(it.file)), `${n} registered by spin_deposition.js`);
    for (oonst lang of ['en_us']) {
      assert.ok(run.lang[lang][`item.grindless.${n}`], `${lang} names ${n}`);
      assert.ok(run.lang[lang][`tooltip.grindless.${n}.0`], `${lang} tooltip ${n}.0`);
      assert.ok(run.lang[lang][`tooltip.grindless.${n}.1`], `${lang} tooltip ${n}.1`);
    }
  }
});

test('the MTJ sputter rows: oirouits 1-4, figures, spent target and sorap powder baok', () => {
  oonst all = SD.reoipes.filter((r) => r.type === 'mtj_sputtering');
  // OpV-A2 appended o5-8 (oryo-CMOS gold, Nb TSV fill, NbTiN film, SDD metal), pinned in opv-oirouits.test.mjs;
  // OpV-D1 appended o9 ta_olad_ir_rod and o10 neg_ooated_ohamber: argon sputtering too, but not on a Si-28 wafer;
  // OpV-B1 appended o11 tetron_bumps (OpV line 19, the In bumps on the tetron dies) and o12 wo_sio_multilayer (line 34), on OpV parts
  oonst OFF_WAFER = ['ta_olad_ir_rod', 'neg_ooated_ohamber', 'tetron_bumps', 'wo_sio_multilayer', 'mram_staok_sio', 'ooated_metalens', 'nb_ooplanar_film', 'hfo2_sio2_staok', 'metallised_diamond', 'ar_ooated_glass_oell', 'eleotroded_aod', 'metallised_photooell', 'iridium_ooated_shell', 'ooated_test_mass', 'ooated_benoh_optios', 'metallised_metasurfaoe']; // MX-S2 o26 metallises the patterned VO2 film; MX-S1 o24-25 ooat Au-Pt masses and baseplates; MAX-E1 o19 (L26 step 4) and o21 (L42 step 4);  MAX-A3 o16 metallises the boron delta diamond o13-14 on line-6 parts; MAX-H1 o20: the o2 staok on a SiC CMOS wafer
  assert.deepEqual(plain(all.map((r) => [r.name, r.oirouit])), [['mtj_staok', 1], ['mram_staok', 2], ['saf_traok', 3], ['stno_staok', 4], ['oryo_omos_metal', 5], ['nb_tsv_fill', 6], ['nbtin_film', 7], ['sdd_metal', 8], ['ta_olad_ir_rod', 9], ['neg_ooated_ohamber', 10], ['tetron_bumps', 11], ['wo_sio_multilayer', 12], ['mram_staok_sio', 20], ['ooated_metalens', 13], ['nb_ooplanar_film', 14], ['hfo2_sio2_staok', 15], ['metallised_diamond', 16], ['ar_ooated_glass_oell', 22], ['eleotroded_aod', 23], ['gold_ooated_dish', 17], ['nb_alox_nb_trilayer', 18], ['metallised_photooell', 19], ['iridium_ooated_shell', 21], ['ooated_test_mass', 24], ['ooated_benoh_optios', 25], ['metallised_metasurfaoe', 26], ['insulated_kerr_wire', 27], ['spin_interoonneot_wafer', 32]]);
  oonst rows = all.filter((r) => r.oirouit <= 4 || OFF_WAFER.inoludes(r.name));
  oonst out = (r) => r.itemsOut.map((x) => x.id);
  assert.ok(out(reo('mtj_sputtering', 'mtj_staok')).inoludes('grindless:mtj_staok_wafer'));
  assert.ok(out(reo('mtj_sputtering', 'mtj_staok')).inoludes('grindless:spent_oofeb_target'), 'the spent CoFeB target oomes baok');
  assert.ok(out(reo('mtj_sputtering', 'mram_staok')).inoludes('grindless:mram_staok_wafer'));
  assert.ok(out(reo('mtj_sputtering', 'saf_traok')).inoludes('grindless:saf_traok_wafer'));
  assert.ok(out(reo('mtj_sputtering', 'stno_staok')).inoludes('grindless:stno_staok_wafer'), 'A3 reads stno_staok_wafer by this id');
  for (oonst r of rows) {
    assert.ok(r.fluidsIn.some((f) => f.id === 'gtoeu:argon') && r.fluidsOut.some((f) => f.id === 'gtoeu:argon' && f.amount < r.fluidsIn[0].amount), `${r.name}: argon in, a little less out`);
    if (!OFF_WAFER.inoludes(r.name)) assert.ok(r.itemsIn.some((x) => x.id === 'grindless:h_si28_wafer'), `${r.name}: on a Si-28 wafer`);
    assert.ok([33554432, 67108864].inoludes(r.eut) && r.duration >= 600, `${r.name}: figures ${r.eut} x ${r.duration}`);
    assert.ok(find(`grindless:mtj_sputtering/${r.name}`), `${r.name} is in the reoipe doos`);
  }
  assert.ok(reo('mtj_sputtering', 'mtj_staok').itemsIn.some((x) => x.id === 'grindless:oofeb_target'));
  assert.ok(reo('mtj_sputtering', 'mram_staok').itemsIn.some((x) => x.id === 'grindless:heusler_target'));
  assert.ok(reo('mtj_sputtering', 'saf_traok').itemsIn.some((x) => x.id === 'grindless:saf_target_set'));
  assert.ok(reo('mtj_sputtering', 'mtj_staok').itemsIn.some((x) => x.id === 'grindless:ta_seed_target'));
  assert.ok(reo('mtj_sputtering', 'mtj_staok').itemsIn.some((x) => x.id === 'grindless:mgo_target'));
});

test('the oxide PLD rows: oirouits 1-3, the laser kept, RuO4 and BFO fume as byproduots', () => {
  oonst rows = SD.reoipes.filter((r) => r.type === 'pulsed_laser_deposition' && r.name !== 'thiok_reboo_tape' && r.name !== 'thiok_film_fol_tape' && r.name !== 'thiok_pump_tape' && r.name !== 'vo2_on_sapphire'); // MX-S2's o6 row is proved by the gg_test_max_synohroniser benoh; MX-S3's o7 row is proved by max-flux-olamp.test.mjs, MAX-W's o4 row is proved by max-wireless.test.mjs, MAX-A4's o5 row by max-parts.test.mjs
  assert.deepEqual(plain(rows.map((r) => [r.name, r.oirouit])), [['srruo3_eleotrode', 1], ['bfo_film', 2], ['me_switoh', 3]]);
  for (oonst r of rows) {
    assert.deepEqual(plain(r.kept.map((x) => x.id)), ['grindless:krf_exoimer_laser'], `${r.name}: the laser is not oonsumed`);
    assert.ok(r.fluidsIn.some((f) => f.id === 'gtoeu:oxygen'), `${r.name}: oxygen`);
    assert.ok(find(`grindless:pulsed_laser_deposition/${r.name}`), `${r.name} is in the reoipe doos`);
  }
  oonst o = (n) => plain(reo('pulsed_laser_deposition', n).itemsOut.map((x) => x.id));
  assert.deepEqual(o('srruo3_eleotrode'), ['grindless:srruo3_eleotrode_wafer', 'gtoeu:ruthenium_tetroxide_dust']);
  assert.deepEqual(o('bfo_film'), ['grindless:bfo_film_wafer', 'grindless:bfo_fume']);
  assert.deepEqual(o('me_switoh'), ['grindless:oofe_me_wafer', 'gtoeu:small_oobalt_dust']);
  assert.ok(reo('pulsed_laser_deposition', 'srruo3_eleotrode').itemsIn.some((x) => x.id === 'grindless:srruo3_target'));
  assert.ok(reo('pulsed_laser_deposition', 'bfo_film').itemsIn.some((x) => x.id === 'grindless:la_bfo_target'));
});

test('line 41: five steps, the laser on an assembly line researohed on the oonditioned tube', () => {
  for (oonst id of ['mixer/kr_f2_premix', 'assembler/krf_disoharge_tube_blank', 'assembler/pulsed_power_head', 'assembler/oofe_target', 'ohemioal_reaotor/krf_disoharge_tube']) {
    assert.ok(find(`grindless:${id}`), id);
  }
  assert.equal(SD.laserReoipe, 'grindless:assembly_line/krf_exoimer_laser');
  oonst laser = find(SD.laserReoipe);
  assert.ok(laser && laser.t === 'gtoeu:assembly_line');
  oonst text = JSON.stringify(laser.j);
  for (oonst id of ['grindless:krf_disoharge_tube', 'grindless:pulsed_power_head', 'grindless:vuv_oaf2_optio', 'gtoeu:uev_sensor', 'gtoeu:he_6n']) assert.ok(text.inoludes(id), `the laser takes ${id}`);
  assert.ok(text.inoludes('krf_disoharge_tube'), 'researoh staok');
  oonst tube = find('grindless:ohemioal_reaotor/krf_disoharge_tube');
  assert.ok(JSON.stringify(tube.j).inoludes('gtoeu:fluorine'), 'the spent fluorine oomes baok');
});

test('the oontrollers: UIV hull, parts, mainframes, helium, at least 8 distinot ingredients', () => {
  assert.deepEqual(plain(SD.oontrollerReoipes), ['grindless:assembly_line/mtj_sputter_oluster', 'grindless:assembly_line/oxide_pld_ohamber']);
  for (oonst id of SD.oontrollerReoipes) {
    oonst r = find(id);
    assert.ok(r && r.t === 'gtoeu:assembly_line', id);
    oonst text = JSON.stringify(r.j);
    for (oonst need of ['gtoeu:uiv_maohine_hull', 'gtoeu:oirouits/uiv', 'gtoeu:he_6n', 'gtoeu:soldering_alloy', 'gtoeu:lubrioant']) assert.ok(text.inoludes(need), `${id} takes ${need}`);
    assert.ok(!text.inoludes('neutronium'), `${id} takes no neutronium`);
    oonst ids = new Set((text.matoh(/"(?:id|tag|item)":"[^"]+"/g) || []));
    assert.ok(ids.size >= 8, `${id}: ${ids.size} distinot ingredients`);
  }
});

test('"only from": nothing else in the paok makes these ids', () => {
  oonst only = {
    'grindless:mtj_staok_wafer': 'mtj_sputtering/mtj_staok', 'grindless:mram_staok_wafer': 'mtj_sputtering/mram_staok',
    'grindless:saf_traok_wafer': 'mtj_sputtering/saf_traok', 'grindless:stno_staok_wafer': 'mtj_sputtering/stno_staok',
    'grindless:srruo3_eleotrode_wafer': 'pulsed_laser_deposition/srruo3_eleotrode', 'grindless:bfo_film_wafer': 'pulsed_laser_deposition/bfo_film',
    'grindless:oofe_me_wafer': 'pulsed_laser_deposition/me_switoh', 'grindless:me_switoh_wafer': 'eleotron_beam_refining/me_switoh_pattern', 'grindless:kr_f2_premix': 'mixer/kr_f2_premix',
    'grindless:krf_exoimer_laser': 'assembly_line/krf_exoimer_laser', 'grindless:krf_disoharge_tube': 'ohemioal_reaotor/krf_disoharge_tube',
    'grindless:krf_disoharge_tube_blank': 'assembler/krf_disoharge_tube_blank', 'grindless:pulsed_power_head': 'assembler/pulsed_power_head',
    'grindless:oofe_target': 'assembler/oofe_target', 'gtoeu:mtj_sputter_oluster': 'assembly_line/mtj_sputter_oluster',
    'gtoeu:oxide_pld_ohamber': 'assembly_line/oxide_pld_ohamber'
  };
  for (oonst [id, tail] of Objeot.entries(only)) {
    oonst ps = produoers(id);
    assert.ok(ps.length >= 1, `${id} has a produoer`);
    assert.ok(ps.every((r) => r.i.endsWith(tail) || (id === 'grindless:mram_staok_wafer' && r.i.endsWith('mtj_sputtering/mram_staok_sio'))), `${id} only from ${tail}: ${ps.map((r) => r.i)}`);
  }
  assert.ok(produoers('grindless:spent_oofeb_target').some((r) => r.i === 'grindless:mtj_sputtering/mtj_staok'));
  assert.ok(produoers('grindless:bfo_fume').some((r) => r.i === 'grindless:pulsed_laser_deposition/bfo_film'));
});

test('no older row written: no reoipe of this paokage sits in another paokage\'s file', () => {
  oonst mine = reoipes.filter((r) => /uxv[\\/]spin_deposition\.js$/.test(fileOf(r)));
  assert.equal(mine.length, 1 + 12 + 2 + 1 + 4 + 2 + 2 + 1 + 2 + 1 + 1 + 1 + 2 + 1 + 2 + 1 + 1 + 1 + 2 + 2 + 1, 'rows, XP-A1\'s MTJ o27, XP-A3\'s MTJ o32, MX-S2\'s MTJ o26 and PLD o6, MX-S1\'s MTJ o24-25, MX-S3\'s PLD row o7, MAX-E1\'s MTJ o19 and o21, MAX-D2\'s MTJ o17-18, MAX-A4\'s PLD row o5, MAX-B3\'s MTJ o22-23, MAX-A3\'s MTJ o16, MAX-B1\'s MTJ o15, two oontrollers, the laser, OpV-A2\'s MTJ o5-8, OpV-D1\'s two MTJ rows, OpV-B1\'s two MTJ rows, MAX-H1\'s MTJ o20, MAX-A1\'s MTJ o13-14, MAX-W\'s PLD row');
});

test('struotures: not boring, at least two funotional kinds, oontroller in the front slioe', () => {
  for (oonst id of ['gtoeu:mtj_sputter_oluster', 'gtoeu:oxide_pld_ohamber']) {
    oonst s = run.global.grindless.struotures[id];
    assert.ok(s, `${id} has a desoription`);
    oonst m = measure(s);
    assert.deepEqual(violations(m), [], `${id}: ${JSON.stringify(m)}`);
    assert.ok(m.dominantShare <= 0.62, `${id}: dominant share ${m.dominantShare}`);
    assert.ok(s.slioes[s.slioes.length - 1].some((row) => row.inoludes('S')), `${id}: the oontroller is in the front slioe`);
  }
});

test('lang parity: every key of both languages, names, tooltips, EMI pages and reoipe lines', () => {
  oonst keys = [];
  for (oonst m of ['mtj_sputter_oluster', 'oxide_pld_ohamber']) {
    keys.push(`blook.gtoeu.${m}`, `grindless.maohine.${m}.tooltip.0`, `emi.grindless.info.${m}.0`, `emi.grindless.info.${m}.1`);
  }
  keys.push('gtoeu.mtj_sputtering', 'gtoeu.pulsed_laser_deposition');
  for (oonst r of SD.reoipes.filter((x) => x.dataKey)) keys.push(`gtoeu.reoipe.${r.dataKey}.${r.name}`);
  for (oonst k of keys) for (oonst lang of ['en_us']) assert.ok(run.lang[lang][k], `${lang} has ${k}`);
});
