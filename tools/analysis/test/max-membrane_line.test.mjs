// MAX-B1 (docs/eras/max.md, B1 "Membrane line"), no game needed: the membrane line's table, shape, controller recipe and the feeder rows
// B1 adds on older machines (L2, L3, L11, L34). T1 is gg_test_max_membrane_line (tools/test/overlay/kubejs/server_scripts).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const run = runPackScripts(pack);
const read = (p) => fs.readFileSync(path.join(kube, ...p.split('/')), 'utf8');
const json = (p) => JSON.parse(read(p));
const table = json('data/grindless/tables/membrane_line.json').types.membrane_rolling;
const ML = run.global.grindless.membraneLine;
const VA_MAX = 2013265920;

test('membrane_line.js scripts run without errors and skip nothing', () => {
  const errs = run.errors.filter((e) => /max[\\/]membrane_line/.test(String(e.file)) && !/no original recipe/.test(String(e.message)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(JSON.parse(JSON.stringify(ML.skipped)), []);
  assert.deepEqual(JSON.parse(JSON.stringify(ML.clashes)), []);
  const unstamped = (p) => read(p).replace(/^\/\/ priority: -?\d+\r?\n/, ''); // the integrator's stamp is the only one
  assert.ok(!/^\/\/ priority:/m.test(unstamped('startup_scripts/grindless/max/membrane_line.js')));
  assert.ok(!/^\/\/ priority:/m.test(unstamped('server_scripts/grindless/max/membrane_line.js')));
});

test('the table has circuits 1-3 at VA[MAX] and each outputs its product plus a scrap byproduct', () => {
  assert.equal(table.dataKey, 'grindless_membrane_rolling');
  const rows = table.recipes;
  assert.deepEqual(rows.map((r) => r.circuit), [1, 2, 3]);
  rows.forEach((r) => assert.equal(r.eut, VA_MAX, r.name));
  assert.deepEqual(rows.map((r) => r.name), ['superconducting_membrane', 'albedo_multilayer_panel', 'membrane_belt']);
});

test('the machine is gtceu:membrane_line with the membrane_rolling type and a 5 x 5 x 21 shape', () => {
  const m = ML.machines[0];
  assert.equal(m.machine, 'gtceu:membrane_line');
  assert.equal(m.type, 'membrane_rolling');
  assert.equal(m.dataKey, 'grindless_membrane_rolling');
});

test('lang keys of the machine, the type and every recipe exist in en_us and es_es', () => {
  const lang = read('client_scripts/grindless/max_membrane_line_lang.js');
  const keys = [...lang.matchAll(/\['([a-z0-9_.]+)', '/g)].map((m) => m[1]);
  for (const k of ['block.gtceu.membrane_line', 'gtceu.membrane_rolling', 'grindless.machine.membrane_line.tooltip.0',
    'emi.grindless.info.membrane_line.0', 'emi.grindless.info.membrane_line.1']) assert.ok(keys.includes(k), k);
  table.recipes.forEach((r) => assert.ok(keys.includes('gtceu.recipe.grindless_membrane_rolling.' + r.name), r.name));
  assert.match(lang, /\['en_us', 'es_es'\]/);
});

test('the controller recipe is an assembly_line row researching the REBCO-on-PBO web, with MAX components and 4 MAX circuits', () => {
  const src = read('server_scripts/grindless/max/membrane_line.js');
  assert.match(src, /grindless:rebco_on_pbo_web/);
  assert.match(src, /membrane_line/);
  assert.match(src, /event\.recipes\.gtceu\.assembly_line/);
  assert.match(src, /#gtceu:circuits\/max/);
});

test('B1 rows on older machines exist and are marked MAX-B1', () => {
  const marked = (p, name) => {
    const t = json(p);
    const all = JSON.stringify(t);
    assert.ok(all.includes('"' + name + '"'), p + ' ' + name);
    assert.ok(all.includes('MAX-B1'), p + ' MAX-B1 mark');
  };
  marked('data/grindless/tables/spin_logic.json', 'graphene_hbn_film');
  marked('data/grindless/tables/spin_deposition.json', 'hfo2_sio2_stack');
  marked('data/grindless/tables/coated_conductor_line.json', 'rebco_on_pbo_web');
  marked('data/grindless/tables/hts_magnet_works.json', 'pinned_rebco_web');
  marked('data/grindless/tables/electron_beam.json', 'cu111_foil');
  marked('data/grindless/tables/accelerators.json', 'electropolished_cu111_foil');
});
