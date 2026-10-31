// OpV-A3 (field_press): the field-frozen press rows (machine 13, line 3), its controller line, the electron beam c22 can and re-melt, line 45's
// older rows (AlN power die), the OpV field generator and the six OpV hatches, and the structure of startup_scripts/grindless/opv/field_press.js.
// T1 is gg_test_opv_field_press.
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
const FP = run.global.grindless.fieldPress;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const producers = (id) => recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`));
const plain = (x) => JSON.parse(JSON.stringify(x));
const rec = (name) => FP.recipes.find((r) => r.name === name);
const SITE = 'grindless:sgr1806_orbit';
const ids = (list) => plain(list.map((x) => [x.id, x.count]));
const kube = (...p) => fs.readFileSync(path.join(pack, 'kubejs', ...p), 'utf8');
const table = (name) => JSON.parse(kube('data', 'grindless', 'tables', name));
const V_UXV = 2 ** 27;
const VA_OPV = 503316480;
// every item and tag id a recipe json names
const named = (r) => JSON.stringify(r.j).match(/"(?:item|tag|id)":"[^"]+"/g) || [];
const circuitOf = (r) => (r.j.inputs.item || []).filter((x) => x.content.type === 'gtceu:circuit').map((x) => x.content.configuration);
// line 45 (opv.md:836): [EMI data key, row name, type, circuit]; the cutter is GTM's and has no circuit or EMI line
const LINE45 = [
  ['grindless_nitride_magnet_synthesis', 'aln_powder', 'nitride_magnet_synthesis', 16],
  ['grindless_crystal_growth', 'aln_boule', 'crystal_growth', 22],
  [null, 'aln_wafer', 'cutter', 0],
  ['grindless_nitride_magnet_synthesis', 'aln_kerf_repress', 'nitride_magnet_synthesis', 17],
  [null, 'algan_epi', 'mocvd', 22],
  ['grindless_beuv_lithography', 'algan_gates', 'beuv_lithography', 9],
  ['grindless_silicon_carbide', 'aln_power_die', 'silicon_carbide', 8]
];
// the older scripts build their ids differently (some double the type); match on the type and the last path segment
const built = (type, name) => recipes.filter((r) => r.t === `gtceu:${type}` && r.i.startsWith('grindless:') && r.i.endsWith(`/${name}`));

test('the stand-in runs the OpV-A3 scripts without errors, nothing skipped, no lookup clash', () => {
  const mine = run.errors.filter((e) => /field_press/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(FP.skipped), []);
  assert.deepEqual(plain(FP.clashes), []);
  assert.equal(FP.recipes.length, 3);
});

test('press c1-c3: canned stacks -> billet + spent cans -> plates -> casing; c1-c2 268,435,456 EU/t (2 A of UXV), the casing at VA[OpV] (an OpV structure part, T-VOLT); only at SGR 1806-20', () => {
  const c1 = rec('field_frozen_billet');
  assert.deepEqual([c1.circuit, c1.eut, c1.duration, c1.site], [1, 2 * V_UXV, 1200, SITE]);
  assert.deepEqual(ids(c1.itemsIn), [['grindless:field_canned_stack', 4]]);
  assert.deepEqual(ids(c1.itemsOut), [['grindless:field_frozen_billet', 1], ['grindless:spent_field_can', 4]]);
  const c2 = rec('field_frozen_plate');
  assert.deepEqual([c2.circuit, c2.eut, c2.duration, c2.site], [2, 2 * V_UXV, 800, SITE]);
  assert.deepEqual(ids(c2.itemsOut), [['grindless:field_frozen_plate', 4]]);
  const c3 = rec('field_frozen_casing');
  assert.deepEqual([c3.circuit, c3.eut, c3.duration, c3.site], [3, 503316480, 400, SITE]);
  assert.deepEqual(ids(c3.itemsIn), [['grindless:field_frozen_plate', 4], ['gtceu:tungsten_steel_frame', 1]]);
  assert.deepEqual(ids(c3.itemsOut), [['grindless:field_frozen_casing', 2]]);
  for (const r of FP.recipes) {
    assert.ok(r.eut < 2 ** 31, `${r.name}: below 2^31`);
    assert.ok(JSON.stringify(find(`grindless:field_freezing/${r.name}`).j.recipeConditions || []).includes(SITE), `${r.name}: dimension lock`);
  }
});

test('field_frozen_plate and field_frozen_casing come only from the press (only at SGR)', () => {
  for (const [id, tail] of [['grindless:field_frozen_plate', 'field_freezing/field_frozen_plate'], ['grindless:field_frozen_casing', 'field_freezing/field_frozen_casing'],
    ['grindless:field_frozen_billet', 'field_freezing/field_frozen_billet'], ['grindless:spent_field_can', 'field_freezing/field_frozen_billet'],
    ['grindless:field_canned_stack', 'electron_beam_refining/field_can'], ['gtceu:field_frozen_press', 'assembly_line/field_frozen_press']]) {
    const ps = producers(id);
    assert.ok(ps.length >= 1, `${id} has a producer`);
    assert.ok(ps.every((r) => r.i.endsWith(tail)), `${id} only from ${tail}: ${ps.map((r) => r.i)}`);
  }
});

test('electron beam c22: the W-Re can and its re-melt (80% back), appended at the end of the type', () => {
  const rows = table('electron_beam.json').types.electron_beam_refining.recipes;
  const can = rows.find((r) => r.name === 'field_can');
  const melt = rows.find((r) => r.name === 'field_can_remelt');
  assert.deepEqual([can.circuit, melt.circuit], [22, 22]);
  // appended together; only later OpV rows (OpV-E1's c23 seal) follow them
  const i = rows.indexOf(can);
  assert.equal(rows[i + 1], melt);
  assert.ok(rows.slice(i + 2).every((r) => /^(OpV-|MAX-B1|MAX-D2)/.test(r._why || '')), 'only later OpV rows (and MAX-B1\'s) after the can');
  assert.deepEqual(ids(can.itemsIn), [['grindless:chain_lamina_stack', 1], ['grindless:six_n_rhenium', 1]]);
  assert.deepEqual(can.fluidsIn, [{ id: 'gtceu:tungsten', amount: 288 }]);
  assert.deepEqual(ids(can.itemsOut), [['grindless:field_canned_stack', 1]]);
  assert.deepEqual(ids(melt.itemsIn), [['grindless:spent_field_can', 5]]);
  assert.deepEqual(ids(melt.itemsOut), [['grindless:six_n_rhenium', 4], ['grindless:eb_skull', 1]]);
  assert.deepEqual(melt.fluidsOut, [{ id: 'gtceu:tungsten', amount: 1152 }]);
  assert.equal(melt.fluidsOut[0].amount, 0.8 * 5 * can.fluidsIn[0].amount, '80% of the tungsten');
  assert.equal(rows.filter((r) => r.circuit === 22 && !/^OpV-B3a/.test(r._why || '')).length, 2, 'c22 is ours alone (OpV-B3a\'s hohlraum can shares it by item inputs)');
  for (const n of ['field_can', 'field_can_remelt']) assert.ok(find(`grindless:electron_beam_refining/${n}`), `${n} built`);
});

test('line 45: each older row built once on its machine with its circuit, and its circuit alone in its type', () => {
  for (const [, name, type, c] of LINE45) {
    const b = built(type, name);
    assert.equal(b.length, 1, `${type}/${name}: ${b.map((r) => r.i)}`);
    assert.deepEqual(circuitOf(b[0]), c ? [c] : [], `${type}/${name}`);
    if (!c) continue;
    const same = recipes.filter((r) => r.t === `gtceu:${type}` && circuitOf(r).includes(c));
    assert.deepEqual(same.map((r) => r.i), [b[0].i], `${type} c${c}`);
  }
  assert.deepEqual(plain(FP.cutterRecipes), ['grindless:cutter/aln_wafer']);
  for (const [file, type, name] of [['composites.json', 'nitride_magnet_synthesis', 'aln_powder'], ['composites.json', 'nitride_magnet_synthesis', 'aln_kerf_repress'],
    ['crystals.json', 'crystal_growth', 'aln_boule'], ['beuv_stm.json', 'beuv_lithography', 'algan_gates'], ['power_devices.json', 'silicon_carbide', 'aln_power_die']]) {
    const rows = table(file).types[type].recipes;
    assert.ok(rows.find((r) => r.name === name)._why.startsWith('OpV-A3'), `${file} ${name} is marked`);
  }
});

test('line 45: AlN powder -> boule -> wafer (+ kerf back) -> AlGaN epi -> BEUV gates -> power die; every link made only here', () => {
  const only = {
    'grindless:aln_powder': ['nitride_magnet_synthesis/aln_powder', 'nitride_magnet_synthesis/aln_kerf_repress'],
    'grindless:aln_boule': ['crystal_growth/aln_boule'],
    'grindless:aln_wafer': ['cutter/aln_wafer'],
    'grindless:aln_kerf': ['cutter/aln_wafer'],
    'grindless:algan_epi_wafer': ['mocvd/algan_epi'],
    'grindless:algan_patterned_wafer': ['beuv_lithography/algan_gates'],
    'grindless:aln_power_die': ['silicon_carbide/aln_power_die']
  };
  const tail = (r) => `${r.t.split(':')[1]}/${r.i.split('/').pop()}`;
  for (const [id, where] of Object.entries(only)) assert.deepEqual(producers(id).map(tail).sort(), where.slice().sort(), id);
  const ins = (type, name) => JSON.stringify(built(type, name)[0].j.inputs);
  for (const [type, name, need] of [['crystal_growth', 'aln_boule', 'grindless:aln_powder'], ['cutter', 'aln_wafer', 'grindless:aln_boule'],
    ['nitride_magnet_synthesis', 'aln_kerf_repress', 'grindless:aln_kerf'], ['mocvd', 'algan_epi', 'grindless:aln_wafer'],
    ['beuv_lithography', 'algan_gates', 'grindless:algan_epi_wafer'], ['silicon_carbide', 'aln_power_die', 'grindless:algan_patterned_wafer']]) {
    assert.ok(ins(type, name).includes(`"${need}"`), `${type}/${name} takes ${need}`);
  }
  // the kerf returns less powder than it took to grow it, and the BEUV mirror comes back fouled for c3 to clean
  const beuv = table('beuv_stm.json').types.beuv_lithography.recipes;
  assert.ok(beuv.find((r) => r.name === 'algan_gates').itemsOut.some((x) => x.id === 'grindless:fouled_beuv_mirror'));
  const kerf = table('composites.json').types.nitride_magnet_synthesis.recipes.find((r) => r.name === 'aln_kerf_repress');
  assert.ok(kerf.itemsOut[0].count < kerf.itemsIn[0].count);
  for (const i of ['aln_powder', 'aln_kerf', 'aln_boule', 'aln_wafer', 'algan_epi_wafer', 'algan_patterned_wafer']) assert.ok(FP.items.includes(i), i);
  for (const f1 of ['field_frozen_plate', 'field_frozen_casing', 'aln_power_die']) assert.ok(!FP.items.includes(f1), `${f1} is F1's`);
});

test('the controller: OpV hull, 10 OpV components of three families, 4 OpV circuits, at VA[OpV]; no field generator, no OpV hatch, nothing UXV', () => {
  assert.deepEqual(plain(FP.controllerRecipes), ['grindless:assembly_line/field_frozen_press']);
  const r = find('grindless:assembly_line/field_frozen_press');
  assert.ok(r && r.t === 'gtceu:assembly_line');
  const text = JSON.stringify(r.j);
  for (const need of ['gtceu:field_frozen_press', 'gtceu:opv_machine_hull', 'gtceu:opv_electric_piston', 'gtceu:opv_electric_motor', 'gtceu:opv_robot_arm', 'gtceu:circuits/opv',
    'grindless:chain_field_coil', 'gtceu:superfluid_helium_3']) assert.ok(text.includes(need), `takes ${need}`);
  assert.ok(!/opv_field_generator|energy_input_hatch|energy_output_hatch|field_frozen_plate/.test(text), 'bootstrap: nothing that needs the press');
  assert.ok(!named(r).some((s) => /uxv|uiv|uev|uhv|circuits\/(?!opv)/.test(s)), 'no lower component or circuit');
  assert.ok(text.includes(`${VA_OPV}`), 'VA[OpV]');
});

test('the OpV field generator: the emitter between two field coils inside four field-frozen plates, made only here', () => {
  assert.deepEqual(plain(FP.fieldGeneratorRecipes), ['grindless:assembler/opv_field_generator']);
  const r = find('grindless:assembler/opv_field_generator');
  assert.ok(r && r.t === 'gtceu:assembler');
  const text = JSON.stringify(r.j);
  for (const need of ['gtceu:opv_emitter', 'grindless:chain_field_coil', 'grindless:field_frozen_plate', 'gtceu:circuits/opv', 'gtceu:chain_strand_single_cable',
    'gtceu:soldering_alloy']) assert.ok(text.includes(need), `takes ${need}`);
  assert.ok(!named(r).some((s) => /uxv|uiv|uev|uhv|circuits\/(?!opv)/.test(s)), 'no lower component or circuit');
  assert.ok(text.includes(`${2 * V_UXV}`), '2 A of UXV');
  assert.deepEqual(producers('gtceu:opv_field_generator').map((x) => x.i), ['grindless:assembler/opv_field_generator']);
});

test('the six OpV hatches: assembly lines at VA[OpV] on the sensor or emitter, field-frozen plates and AlN power dies; 4 A and 16 A on field generators', () => {
  const names = [];
  for (const dir of ['input', 'output']) for (const amp of ['', '_4a', '_16a']) names.push(`opv_energy_${dir}_hatch${amp}`);
  assert.deepEqual(plain(FP.hatchRecipes), names.map((n) => `grindless:assembly_line/${n}`));
  // the stand-in's json carries no duration: 1200 t each, read from the script
  assert.ok(/fluids: \[\['gtceu:soldering_alloy', 2304\], \['gtceu:superfluid_helium_3', 1000\]\], eut: VA_OPV, duration: 1200/.test(kube('server_scripts', 'grindless', 'opv', 'field_press.js')), '1200 t');
  for (const n of names) {
    const r = find(`grindless:assembly_line/${n}`);
    assert.ok(r && r.t === 'gtceu:assembly_line', n);
    const text = JSON.stringify(r.j);
    const part = n.includes('input') ? 'gtceu:opv_sensor' : 'gtceu:opv_emitter';
    for (const need of [`gtceu:${n}`, part, 'grindless:field_frozen_plate', 'grindless:aln_power_die', 'gtceu:circuits/opv', 'gtceu:superfluid_helium_3'])
      assert.ok(text.includes(`"${need}"`), `${n} takes ${need}`);
    assert.equal(text.includes('"gtceu:opv_field_generator"'), !/hatch$/.test(n), `${n}: field generator from 4 A up`);
    assert.ok(text.includes(`${VA_OPV}`), `${n}: VA[OpV]`);
    assert.ok(!named(r).some((s) => /uxv|uiv|uev|uhv|circuits\/(?!opv)/.test(s)), `${n}: no lower component or circuit`);
    assert.deepEqual(producers(`gtceu:${n}`).map((x) => x.i).filter((i) => i.startsWith('grindless:')), [`grindless:assembly_line/${n}`], `${n}: one of ours`);
  }
});

test('structure: not boring, frame and coil, controller in the front slice, 16 rows at most, dominant share <= 0.7', () => {
  const s = run.global.grindless.structures['gtceu:field_frozen_press'];
  assert.ok(s, 'has a description');
  const mm = measure(s);
  assert.deepEqual(violations(mm), [], JSON.stringify(mm));
  assert.ok(mm.functional.length >= 2, `${mm.functional}`);
  assert.deepEqual(mm.bbox, [7, 9, 7]);
  assert.ok(s.slices.every((sl) => sl.length <= 16), 'at most 16 rows per slice');
  assert.ok(s.slices[s.slices.length - 1].some((row) => row.includes('S')), 'the controller is in the front slice');
});

test('lang parity: names, the short tooltip, items, EMI pages and recipe lines in both languages; EMI file and textures', () => {
  const keys = ['gtceu.field_freezing', 'block.gtceu.field_frozen_press', 'grindless.machine.field_frozen_press.tooltip.0', 'emi.grindless.info.field_frozen_press.0',
    'emi.grindless.info.field_frozen_press.1', 'gtceu.recipe.grindless_electron_beam.field_can', 'gtceu.recipe.grindless_electron_beam.field_can_remelt'];
  for (const i of FP.items) {
    keys.push(`item.grindless.${i}`, `tooltip.grindless.${i}.0`, `tooltip.grindless.${i}.1`);
    assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'item', `${i}.png`)), `${i} texture`);
  }
  for (const r of FP.recipes) keys.push(`gtceu.recipe.${r.dataKey}.${r.name}`);
  for (const [dk, name] of LINE45) if (dk) keys.push(`gtceu.recipe.${dk}.${name}`);
  for (const k of keys) for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][k], `${lang} has ${k}`);
  for (const lang of ['en_us', 'es_es']) {
    const tip = run.lang[lang]['grindless.machine.field_frozen_press.tooltip.0'];
    assert.ok(tip.startsWith('\u00a77') && tip.length <= 84, `${lang}: one short line`);
  }
  const lang = kube('client_scripts', 'grindless', 'opv_field_press_lang.js');
  const mine = [...lang.matchAll(/\['([a-z0-9_]+\.[a-z0-9_.]+)',/g)].map((m) => m[1]);
  assert.ok(mine.length >= 42, `${mine.length} keys`);
  for (const k of mine) assert.ok(run.lang.en_us[k] && run.lang.es_es[k], `${k} in both languages`);
  assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'emi', 'recipe', 'additions', 'grindless', 'opv_field_press_field_frozen_press.json')), 'EMI info file');
  assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'block', 'multiblock', 'field_frozen_press', 'overlay_front_active.png')), 'texture');
});
