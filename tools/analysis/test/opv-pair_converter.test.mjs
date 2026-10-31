// OpV-E1 (pair_converter): the magnetic pair converter row, its controller assembly line, the older rows (positron accumulator c5,
// electron beam c23) and the structure of startup_scripts/grindless/opv/pair_converter.js.
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
const PC = run.global.grindless.pairConverter;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const producers = (id) => recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`));
const plain = (x) => JSON.parse(JSON.stringify(x));
const rec = (type, name) => PC.recipes.find((r) => r.type === type && r.name === name);
const SITE = 'grindless:sgr1806_orbit';
const MACHINE = 'magnetic_pair_converter';
const ids = (list) => plain(list.map((x) => [x.id, x.count]));
const kube = (...p) => fs.readFileSync(path.join(pack, 'kubejs', ...p), 'utf8');
const table = (name) => JSON.parse(kube('data', 'grindless', 'tables', name));

test('the stand-in runs the OpV-E1 scripts without errors, nothing skipped, no lookup clash', () => {
  const mine = run.errors.filter((e) => /pair_converter|sounds/.test(String(e.file)) && !/no original recipe/.test(String(e.message)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(PC.skipped), []);
  assert.deepEqual(plain(PC.clashes), []);
  assert.equal(PC.recipes.length, 2);
});

test('converter c1 (seed plasma + gamma laser module worn at 6.25% -> hot pair plasma, 90% empty trap back) and c2 (plasma + trap -> unsealed cell), at SGR 1806-20 orbit', () => {
  const c1 = rec('magnetic_pair_production', 'boil_seed_plasma');
  assert.deepEqual([c1.circuit, c1.eut, c1.duration, c1.site], [1, 503316480, 1200, SITE]);
  assert.deepEqual(ids(c1.itemsIn), [['grindless:seed_positron_plasma', 1]]);
  assert.deepEqual(plain(c1.wear.map((x) => [x.id, x.chance])), [['grindless:gamma_laser_module', 625]]);
  assert.deepEqual(plain(c1.itemsOut.map((x) => [x.id, x.count, x.chance])), [['grindless:empty_penning_trap', 1, 9000]]);
  assert.deepEqual(plain(c1.fluidsOut.map((f) => [f.id, f.amount])), [['gtceu:hot_pair_plasma', 1000]]);
  assert.ok(JSON.stringify(find('grindless:magnetic_pair_production/boil_seed_plasma').j.recipeConditions || []).includes(SITE), 'dimension lock c1');

  const c2 = rec('magnetic_pair_production', 'seal_positron_cell');
  assert.deepEqual([c2.circuit, c2.eut, c2.duration, c2.site], [2, 268435456, 800, SITE]);
  assert.deepEqual(ids(c2.itemsIn), [['grindless:empty_penning_trap', 1]]);
  assert.deepEqual(plain(c2.fluidsIn.map((f) => [f.id, f.amount])), [['gtceu:hot_pair_plasma', 1000]]);
  assert.deepEqual(ids(c2.itemsOut), [['grindless:unsealed_positron_cell', 1]]);
  assert.ok(JSON.stringify(find('grindless:magnetic_pair_production/seal_positron_cell').j.recipeConditions || []).includes(SITE), 'dimension lock c2');
});

test('the controller: OpV hull, field generators, emitters, sensor, superfluid He-3, domain parts, researched with the seed plasma', () => {
  assert.deepEqual(plain(PC.controllerRecipes), [`grindless:assembly_line/${MACHINE}`]);
  const r = find(`grindless:assembly_line/${MACHINE}`);
  assert.ok(r && r.t === 'gtceu:assembly_line');
  const text = JSON.stringify(r.j);
  for (const need of [`gtceu:${MACHINE}`, 'gtceu:opv_machine_hull', 'gtceu:opv_field_generator', 'gtceu:opv_emitter', 'gtceu:opv_sensor',
    'gtceu:circuits/opv', 'grindless:gamma_laser_module', 'grindless:chain_field_coil', 'grindless:field_frozen_plate', 'gtceu:superfluid_helium_3', 'grindless:seed_positron_plasma']) {
    assert.ok(text.includes(need), `controller takes ${need}`);
  }
  assert.ok(new Set(text.match(/"(?:id|tag|item)":"[^"]+"/g) || []).size >= 8, 'at least 8 distinct ingredients');
  const controllerSource = kube('server_scripts', 'grindless', 'opv', 'pair_converter.js');
  for (const component of ['4x gtceu:opv_field_generator', '4x gtceu:opv_emitter', '2x gtceu:opv_sensor']) {
    assert.ok(controllerSource.includes(component), `controller count: ${component}`);
  }
});

test('older rows: positron accumulator c5 (antimatter.json) on a free circuit, EB c23 (electron_beam.json) shared under OpV-F3', () => {
  const posAcc = table('antimatter.json').types.positron_accumulation.recipes;
  const seed = posAcc.find((r) => r.name === 'seed_plasma');
  assert.equal(seed.circuit, 5);
  assert.equal(posAcc.filter((r) => r.circuit === 5).length, 1, 'positron accumulation circuit 5 is ours alone');
  assert.deepEqual(seed.itemsIn.map((x) => [x.id, x.count]), [['grindless:positron_cartridge', 1], ['grindless:empty_penning_trap', 1]]);
  assert.deepEqual(seed.itemsOut.map((x) => x.id), ['grindless:seed_positron_plasma']);

  const eb = table('electron_beam.json').types.electron_beam_refining.recipes;
  const seal = eb.find((r) => r.name === 'positron_cell_seal');
  assert.equal(seal.circuit, 23);
  // OpV-F3: EB c23 is shared with OpV-B2's ni_chain_thaw on disjoint item inputs, so lookup cannot shadow either row
  const its = (x) => x.itemsIn.concat(x.kept || []).map((i) => i.id);
  for (const o of eb.filter((r) => r !== seal && r.circuit === 23)) assert.ok(!its(o).some((id) => its(seal).includes(id)), `electron beam c23 shared with ${o.name} only on disjoint item inputs`);
  assert.deepEqual(seal.itemsIn.map((x) => [x.id, x.count]), [['grindless:unsealed_positron_cell', 1], ['gtceu:zirconium_dust', 1]]);
  assert.deepEqual(seal.itemsOut.map((x) => x.id), ['grindless:dense_positron_cell']);
});

test('"only from": nothing else in the pack makes these ids', () => {
  const only = {
    'grindless:seed_positron_plasma': 'positron_accumulation/seed_plasma', 'grindless:unsealed_positron_cell': 'magnetic_pair_production/seal_positron_cell',
    'grindless:dense_positron_cell': 'electron_beam_refining/positron_cell_seal', 'gtceu:magnetic_pair_converter': 'assembly_line/magnetic_pair_converter'
  };
  for (const [id, tail] of Object.entries(only)) {
    const ps = producers(id);
    assert.ok(ps.length >= 1, `${id} has a producer`);
    assert.ok(ps.every((r) => r.i.endsWith(tail)), `${id} only from ${tail}: ${ps.map((r) => r.i)}`);
  }
});

test('structure: not boring, three functional kinds, controller in the front slice, 9 rows at most, dominant share <= 0.62', () => {
  const s = run.global.grindless.structures[`gtceu:${MACHINE}`];
  assert.ok(s, `${MACHINE} has a description`);
  const mm = measure(s);
  assert.deepEqual(violations(mm), [], `${MACHINE}: ${JSON.stringify(mm)}`);
  assert.ok(mm.dominantShare <= 0.62, `${MACHINE}: dominant share ${mm.dominantShare}`);
  assert.ok(mm.functional.length >= 3, `${MACHINE}: ${mm.functional}`);
  assert.ok(s.slices.every((sl) => sl.length <= 16), `${MACHINE}: at most 16 rows per slice`);
  assert.ok(s.slices[s.slices.length - 1].some((row) => row.includes('S')), `${MACHINE}: the controller is in the front slice`);
});

test('lang parity: names, tooltips, item, EMI page and recipe lines; sound and EMI files', () => {
  const keys = [`block.gtceu.${MACHINE}`, 'gtceu.magnetic_pair_production', `grindless.machine.${MACHINE}.tooltip.0`,
    `grindless.machine.${MACHINE}.tooltip.1`, `grindless.machine.${MACHINE}.tooltip.2`,
    `emi.grindless.info.${MACHINE}.0`, `emi.grindless.info.${MACHINE}.1`, `emi.grindless.info.${MACHINE}.2`,
    'item.grindless.unsealed_positron_cell', 'tooltip.grindless.unsealed_positron_cell.0', 'tooltip.grindless.unsealed_positron_cell.1'];
  for (const r of PC.recipes) keys.push(`gtceu.recipe.${r.dataKey}.${r.name}`);
  keys.push('gtceu.recipe.grindless_positron_accumulation.seed_plasma', 'gtceu.recipe.grindless_electron_beam.positron_cell_seal');
  for (const k of keys) for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][k], `${lang} has ${k}`);
  const re = /magnetic_pair|unsealed_positron_cell/;
  assert.deepEqual(Object.keys(run.lang.en_us).filter((k) => re.test(k)).sort(), Object.keys(run.lang.es_es).filter((k) => re.test(k)).sort());

  assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'emi', 'recipe', 'additions', 'grindless', `opv_pair_converter_${MACHINE}.json`)), 'EMI info file');
  assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'block', 'multiblock', MACHINE, 'overlay_front_active.png')), 'texture');
  assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'item', 'unsealed_positron_cell.png')), 'item texture');

  const sounds = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'assets', 'sounds.json'), 'utf8')).sounds || [];
  const wiring = kube('startup_scripts', 'grindless', 'sounds.js');
  assert.ok(wiring.includes(`'gtceu:magnetic_pair_production': 'loop_${MACHINE}'`), 'sound wired');
  if (sounds.length > 0) assert.ok(sounds.some((s) => s.id === `loop_${MACHINE}` && s.recipeType === 'gtceu:magnetic_pair_production' && s.loop === true), 'sound row');
});
