// OpV-B1 (tetron_optics): the tetron fab and gamma optics works rows, the older rows of lines 19, 34 and 35, the controllers' assembly
// lines, the items registered by startup_scripts/grindless/opv/tetron_optics.js, the structures, textures, EMI pages and sounds.
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
const kube = path.join(pack, 'kubejs');
const run = runPackScripts(pack);
const TO = run.global.grindless.tetronOptics;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const producers = (id) => recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`));
const plain = (x) => JSON.parse(JSON.stringify(x));
const rec = (type, name) => TO.recipes.find((r) => r.type === type && r.name === name);
const has = (list, id, count) => list.some((x) => x.id === id && (count === undefined || x.count === count));
const VA_OPV = 503316480;

const MACHINES = ['tetron_fab', 'gamma_optics_works'];
const ITEMS = ['bumped_tetron_die', 'bonded_tetron_die', 'tested_tetron_die', 'failed_tetron_die',
  'bent_ge_tile', 'gaas_laue_tile', 'aligned_laue_frame', 'rejected_laue_tile', 'superpolished_sic_blank', 'wc_sic_multilayer',
  'mirror_metrology_record', 'wc_sputter_target', 'rejected_gamma_mirror'];

test('the stand-in runs the OpV-B1 scripts without errors, nothing skipped, no lookup clash', () => {
  const mine = run.errors.filter((e) => /tetron_optics|sounds/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(TO.skipped), []);
  assert.deepEqual(plain(TO.clashes), []);
  assert.equal(TO.recipes.length, 4);
});

test('the package items are registered by the startup file, named in en_us and es_es, with a texture', () => {
  for (const n of ITEMS) {
    const it = run.registry.items.get(`grindless:${n}`);
    assert.ok(it && /opv[\\/]tetron_optics\.js$/.test(String(it.file)), `${n} registered by tetron_optics.js`);
    for (const lang of ['en_us', 'es_es']) {
      assert.ok(run.lang[lang][`item.grindless.${n}`], `${lang} names ${n}`);
      assert.ok(run.lang[lang][`tooltip.grindless.${n}.0`], `${lang} tooltip ${n}.0`);
      assert.ok(run.lang[lang][`tooltip.grindless.${n}.1`], `${lang} tooltip ${n}.1`);
    }
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), `${n}.png`);
  }
});

test('tetron fab rows: circuits 1-2, dies diced, the array in a kept He-3 bath, a failed die now and then', () => {
  const rows = TO.recipes.filter((r) => r.type === 'tetron_assembly');
  assert.deepEqual(plain(rows.map((r) => [r.name, r.circuit])), [['tetron_die', 1], ['tetron_array', 2]]);
  const c1 = rec('tetron_assembly', 'tetron_die');
  assert.ok(has(c1.itemsIn, 'grindless:gated_2deg_wafer') && has(c1.itemsIn, 'grindless:cryo_cmos_die'));
  assert.ok(has(c1.itemsOut, 'grindless:tetron_die', 4));
  const c2 = rec('tetron_assembly', 'tetron_array');
  assert.ok(has(c2.itemsIn, 'grindless:tested_tetron_die', 4) && has(c2.itemsIn, 'grindless:hemt_amplifier'));
  assert.deepEqual(plain(c2.charge), [{ id: 'gtceu:superfluid_helium_3', amount: 1000 }], 'the He-3 bath is not consumed');
  assert.deepEqual(plain(c2.fluidsIn), []);
  assert.ok(has(c2.itemsOut, 'grindless:tetron_array', 1));
  const failed = c2.itemsOut.find((x) => x.id === 'grindless:failed_tetron_die');
  assert.ok(failed && failed.chance > 0 && failed.chance < 10000, 'the failed die is a chanced output');
  for (const r of rows) {
    assert.ok(r.eut > 134217728 && r.eut <= VA_OPV * 2, `${r.name}: an OpV row (${r.eut})`);
    assert.ok(find(`grindless:tetron_assembly/${r.name}`), `${r.name} is in the recipe docs`);
  }
});

test('gamma optics rows: circuits 1-2, the Laue lens bonded in epoxy, the mirror figured to its record, chanced rejects', () => {
  const rows = TO.recipes.filter((r) => r.type === 'gamma_optics');
  assert.deepEqual(plain(rows.map((r) => [r.name, r.circuit])), [['laue_lens', 1], ['gamma_multilayer_mirror', 2]]);
  const c1 = rec('gamma_optics', 'laue_lens');
  assert.ok(has(c1.itemsIn, 'grindless:bent_ge_tile', 32) && has(c1.itemsIn, 'grindless:gaas_laue_tile', 32) && has(c1.itemsIn, 'grindless:aligned_laue_frame', 1));
  assert.deepEqual(plain(c1.fluidsIn), [{ id: 'gtceu:epoxy', amount: 144 }]);
  assert.ok(has(c1.itemsOut, 'grindless:laue_lens', 1));
  const c2 = rec('gamma_optics', 'gamma_multilayer_mirror');
  for (const n of ['superpolished_sic_blank', 'wc_sic_multilayer', 'mirror_metrology_record']) assert.ok(has(c2.itemsIn, `grindless:${n}`, 1), `c2 takes ${n}`);
  assert.ok(has(c2.itemsOut, 'grindless:gamma_multilayer_mirror', 1));
  for (const [r, reject] of [[c1, 'grindless:rejected_laue_tile'], [c2, 'grindless:rejected_gamma_mirror']]) {
    const x = r.itemsOut.find((o) => o.id === reject);
    assert.ok(x && x.chance > 0 && x.chance < 10000, `${r.name}: ${reject} is a chanced output`);
  }
  for (const r of rows) {
    assert.ok(r.eut > 134217728 && r.eut <= VA_OPV * 2, `${r.name}: an OpV row (${r.eut})`);
    assert.ok(r.itemsIn.length + 1 <= 4 && r.itemsOut.length <= 2 && r.fluidsIn.length <= 1 && r.fluidsOut.length === 0, `${r.name}: fits the hatches`);
    assert.ok(find(`grindless:gamma_optics/${r.name}`), `${r.name} is in the recipe docs`);
  }
});

test('line 19 middle steps: MTJ c9 In bumps, ion slicing c8 flip-chip, millikelvin c6 parity test, cascade c25 recovery', () => {
  const steps = [
    ['grindless:mtj_sputtering/tetron_bumps', 9, 'grindless:tetron_die', 'grindless:bumped_tetron_die'],
    ['grindless:ion_slicing/bonded_tetron_die', 8, 'grindless:bumped_tetron_die', 'grindless:bonded_tetron_die'],
    ['grindless:nuclear_demagnetisation/tested_tetron_die', 6, 'grindless:bonded_tetron_die', 'grindless:tested_tetron_die'],
    ['grindless:solvent_extraction/ev/tetron_die_recovery', 25, 'grindless:failed_tetron_die', 'gtceu:indium_dust']
  ];
  for (const [id, circuit, input, output] of steps) {
    const r = find(id);
    assert.ok(r, id);
    const ins = JSON.stringify(r.j.inputs);
    assert.ok(ins.includes(`"configuration":${circuit}`), `${id}: circuit ${circuit}`);
    assert.ok(ins.includes(`"${input}"`), `${id} takes ${input}`);
    assert.ok(JSON.stringify(r.j.outputs).includes(`"${output}"`), `${id} makes ${output}`);
  }
  assert.ok(JSON.stringify(find('grindless:ion_slicing/bonded_tetron_die').j.inputs).includes('grindless:nb_tsv_interposer'));
  const mk = find('grindless:nuclear_demagnetisation/tested_tetron_die').j.inputs.item;
  assert.ok(mk.some((x) => x.chance === 0 && JSON.stringify(x).includes('grindless:mk_cryostat_module')), 'the cryostat module is kept');
  const mtj = JSON.stringify(find('grindless:mtj_sputtering/tetron_bumps').j);
  assert.ok(mtj.includes('gtceu:indium_dust') && mtj.includes('gtceu:argon'));
  const leach = JSON.stringify(find('grindless:solvent_extraction/ev/tetron_die_recovery').j.outputs);
  assert.ok(leach.includes('gtceu:small_gold_dust') && leach.includes('gtceu:diluted_hydrochloric_acid'));
});

test('the controllers: OpV hull, OpV parts and circuits, superfluid He-3, VA[OpV], at least 9 distinct ingredients', () => {
  assert.deepEqual(plain(TO.controllerRecipes), MACHINES.map((m) => `grindless:assembly_line/${m}`));
  for (const id of TO.controllerRecipes) {
    const r = find(id);
    assert.ok(r && r.t === 'gtceu:assembly_line', id);
    const text = JSON.stringify(r.j);
    for (const need of ['gtceu:opv_machine_hull', 'gtceu:circuits/opv', 'gtceu:superfluid_helium_3', `gtceu:${id.split('/').pop()}`]) assert.ok(text.includes(need), `${id} takes ${need}`);
    assert.ok(JSON.stringify(r.j.tickInputs).includes(String(VA_OPV)), `${id}: VA[OpV]`);
    assert.ok(r.j.recipeConditions.some((c) => c.type === 'research'), `${id}: station research`);
    const ids = new Set((text.match(/"(?:id|tag|item)":"[^"]+"/g) || []));
    assert.ok(ids.size >= 9, `${id}: ${ids.size} distinct ingredients`);
  }
  assert.ok(JSON.stringify(find('grindless:assembly_line/tetron_fab').j).includes('grindless:inas_al_wafer'), 'researched on the InAs-Al wafer');
  assert.ok(JSON.stringify(find('grindless:assembly_line/gamma_optics_works').j).includes('grindless:hpge_compton_crystal'), 'researched on the HPGe Compton crystal');
});

test('"only from": nothing else in the pack makes these ids', () => {
  const only = {
    'grindless:tetron_die': 'tetron_assembly/tetron_die', 'grindless:tetron_array': 'tetron_assembly/tetron_array',
    'grindless:bumped_tetron_die': 'mtj_sputtering/tetron_bumps', 'grindless:bonded_tetron_die': 'ion_slicing/bonded_tetron_die',
    'grindless:tested_tetron_die': 'nuclear_demagnetisation/tested_tetron_die', 'grindless:failed_tetron_die': 'tetron_assembly/tetron_array',
    'gtceu:tetron_fab': 'assembly_line/tetron_fab',
    'grindless:laue_lens': 'gamma_optics/laue_lens', 'grindless:gamma_multilayer_mirror': 'gamma_optics/gamma_multilayer_mirror',
    'grindless:rejected_laue_tile': 'gamma_optics/laue_lens', 'grindless:rejected_gamma_mirror': 'gamma_optics/gamma_multilayer_mirror',
    'gtceu:gamma_optics_works': 'assembly_line/gamma_optics_works'
  };
  for (const [id, tail] of Object.entries(only)) {
    const ps = producers(id);
    assert.ok(ps.length >= 1, `${id} has a producer`);
    assert.ok(ps.every((r) => r.i.endsWith(tail)), `${id} only from ${tail}: ${ps.map((r) => r.i)}`);
  }
});

test('structures: not boring, at least two functional kinds, controller in the front slice', () => {
  for (const m of MACHINES) {
    const s = run.global.grindless.structures[`gtceu:${m}`];
    assert.ok(s, `${m} has a description`);
    const q = measure(s);
    assert.deepEqual(violations(q), [], `${m}: ${JSON.stringify(q)}`);
    assert.ok(q.dominantShare <= 0.62, `${m}: dominant share ${q.dominantShare}`);
    assert.ok(s.slices[s.slices.length - 1].some((row) => row.includes('S')), `${m}: the controller is in the front slice`);
  }
});

test('faces, EMI pages and the working sound of every machine', () => {
  const spec = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'assets', 'sounds.json'), 'utf8')).sounds;
  for (const m of TO.machines) {
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) {
      assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', m.name, f)), `${m.name}/${f}`);
    }
    const emi = JSON.parse(fs.readFileSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', `opv_tetron_optics_${m.name}.json`), 'utf8'));
    assert.deepEqual(emi, { type: 'emi:info', stacks: [`item:gtceu:${m.name}`], text: [`emi.grindless.info.${m.name}.0`, `emi.grindless.info.${m.name}.1`] });
    assert.ok(spec.some((s) => s.recipeType === `gtceu:${m.type}` && s.id === `loop_${m.name}`), `${m.name}: a sound row`);
  }
  assert.deepEqual(plain(TO.machines.map((m) => m.name)), MACHINES);
});

test('lang parity: every key of both languages, names, tooltips, EMI pages and recipe lines', () => {
  const keys = [];
  for (const m of TO.machines) {
    keys.push(`block.gtceu.${m.name}`, `gtceu.${m.type}`, `grindless.machine.${m.name}.tooltip.0`, `emi.grindless.info.${m.name}.0`, `emi.grindless.info.${m.name}.1`);
  }
  for (const r of TO.recipes) keys.push(`gtceu.recipe.${r.dataKey}.${r.name}`);
  keys.push('gtceu.recipe.grindless_mtj_sputtering.tetron_bumps', 'gtceu.recipe.grindless_ion_slicing.bonded_tetron_die',
    'gtceu.recipe.grindless_nuclear_demagnetisation.tested_tetron_die');
  for (const k of keys) for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][k], `${lang} has ${k}`);
  const re = /tetron|gamma_optics|laue|gamma_mirror|gamma_multilayer|sic_blank|wc_sic|metrology_record|wc_sputter|bent_ge|gaas_laue/;
  assert.deepEqual(Object.keys(run.lang.en_us).filter((k) => re.test(k)).sort(), Object.keys(run.lang.es_es).filter((k) => re.test(k)).sort());
});
