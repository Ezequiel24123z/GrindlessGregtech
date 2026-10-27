// UV's heat source works (package UV-A2), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/uv/heat_sources.js: one recipe type, one machine with a valid 5 x 5 x 7 pattern, four items;
//   - server_scripts/grindless/uv/heat_sources.js: the five works recipes (one circuit each, nothing clashing), the C-C aeroshell row,
//     the controller's crafting recipe;
//   - server_scripts/grindless/iv/travel_network.js: the RTG cell burns the curium RTG pellet for 3x the plutonium pellet's time;
//   - en_us and es_es text for everything new.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const HS = plain(run.global.grindless.heatSources);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const ZPM_VA = 122880;
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const read = (rel) => fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
const NEW_ITEMS = ['probe_rtg', 'americium_micro_source', 'curium_rtg_pellet', 'heavy_curium_oxide'];

test('the stand-in runs the heat source scripts without errors, nothing skipped or clashing', () => {
  const errs = run.errors.filter((e) => /uv[\\/]heat_sources|iv[\\/]travel_network/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(HS.clashes, []);
  assert.deepEqual(HS.skipped.filter((s) => !/gtceu:(iridium_foil|germanium_dust|uv_robot_arm|uv_machine_hull|creosote|carbon_fibers)/.test(s.reason)), []);
});

test('registration: the recipe type, the machine, the four items', () => {
  assert.ok(run.registry.recipeTypes.has('gtceu:heat_source'));
  assert.deepEqual(run.registry.machines.get('gtceu:heat_source_works').recipeTypes, ['gtceu:heat_source']);
  for (const n of NEW_ITEMS) assert.ok(run.registry.items.has('grindless:' + n), n);
});

test('pattern: one controller in the front slice, GTM part limits, 5 x 5 x 7, radiation proof casing', () => {
  const s = run.docs.structures.structures['gtceu:heat_source_works'];
  assert.ok(s, 'described');
  assert.equal(s.slices.length, 7);
  const front = s.slices[s.slices.length - 1];
  assert.equal(front.join('').split('').filter((c) => c === 'S').length, 1, 'one controller');
  assert.ok(s.slices.every((sl) => sl.length === 5 && sl.every((row) => row.length === 5)), 'uniform 5 x 5 slices');
  const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
  assert.deepEqual(lim.energy_input, { min: 1, max: 2 });
  for (const sl of s.slices) for (const row of sl) for (const c of row) assert.ok(s.symbols[c], 'symbol ' + c);
  const blocks = Object.values(s.symbols).flatMap((v) => v.blocks || []);
  assert.ok(blocks.includes('gtnn:radiation_proof_machine_casing'));
});

test('the five works recipes: one circuit each, ZPM VA bound, whole numbers', () => {
  assert.deepEqual(HS.recipes.map((r) => [r.name, r.circuit]), [['pellet', 1], ['clad', 2], ['probe_rtg', 3], ['micro_source', 4], ['rtg_pellet', 5]]);
  for (const p of HS.recipes) {
    const r = byId(p.recipeId);
    assert.ok(r, p.recipeId + ' added');
    assert.equal(r.t, 'gtceu:heat_source');
    assert.deepEqual(circuitOf(r), [p.circuit]);
    assert.ok(Number.isInteger(p.duration) && p.duration > 0 && p.eut <= ZPM_VA);
  }
});

test('contract numbers: pellet, clad, probe RTG, micro source, RTG pellet', () => {
  const [pellet, clad, rtg, micro, rtgPellet] = HS.recipes;
  assert.deepEqual(pellet.itemsIn, [{ id: 'grindless:curium_oxide', count: 4 }]);
  assert.deepEqual(pellet.itemsOut.map((x) => x.id), ['grindless:curium_244_pellet', 'grindless:heavy_curium_oxide']);
  assert.equal(pellet.eut, ZPM_VA);
  assert.equal(pellet.duration, 600);
  assert.deepEqual(clad.itemsIn.map((x) => x.id), ['grindless:curium_244_pellet', 'gtceu:iridium_foil', 'grindless:carbon_carbon_aeroshell']);
  assert.deepEqual(clad.itemsOut.map((x) => x.id), ['grindless:gphs_module']);
  assert.equal(clad.chancedOut[0].id, 'gtceu:small_iridium_dust');
  assert.equal(rtg.itemsIn[0].count, 4);
  assert.equal(rtg.itemsOut[0].id, 'grindless:probe_rtg');
  assert.deepEqual(micro.itemsOut, [{ id: 'grindless:americium_micro_source', count: 8 }]);
  assert.deepEqual(rtgPellet.itemsOut, [{ id: 'grindless:curium_rtg_pellet', count: 2 }]);
  assert.equal(rtgPellet.itemsIn[0].id, 'grindless:curium_244_pellet');
});

test('Cm-244 comes only from the works', () => {
  const makers = recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes('grindless:curium_244_pellet') && !JSON.stringify(r.j.inputs || {}).includes('grindless:curium_244_pellet'));
  assert.deepEqual(makers.map((r) => r.i), ['grindless:heat_source/pellet']);
});

test('the C-C aeroshell row is a composite autoclave recipe on circuit 6', () => {
  var r = byId(HS.aeroshell.recipeId);
  assert.ok(r, 'aeroshell row added');
  assert.equal(r.t, 'gtceu:composite_curing');
  assert.deepEqual(circuitOf(r), [6]);
});

test('IV\'s RTG cell burns the curium pellet for 3x the plutonium pellet\'s time', () => {
  const pu = recipes.find((r) => r.i === 'grindless:radioisotope_decay/rtg_pellet');
  const cm = byId('grindless:radioisotope_decay/curium_rtg_pellet');
  assert.ok(pu, 'plutonium row kept');
  assert.ok(cm, 'curium row added');
  assert.equal(cm.t, 'gtceu:radioisotope_decay');
  assert.deepEqual(cm.j.tickOutputs, pu.j.tickOutputs, 'same power');
  assert.deepEqual(cm.j.inputs.item[0].chance, pu.j.inputs.item[0].chance, 'same chance');
  // the stand-in does not record durations: read the row's source
  const src = read('server_scripts/grindless/iv/travel_network.js');
  const row = src.slice(src.indexOf("radioisotope_decay('grindless:curium_rtg_pellet')"));
  assert.match(row.split('}')[0], /\.duration\(R\.duration \* 3\)/);
  assert.match(src, /radioisotope_decay\(R\.builderId\)[^;]*?\.duration\(R\.duration\)/s);
});

test('names: en_us and es_es for the machine, the type and each item, no accents lost', () => {
  const lang = read('client_scripts/grindless/uv_heat_sources_lang.js');
  const [en, es] = lang.split("ClientEvents.lang('es_es'");
  for (const part of [en, es]) {
    for (const key of ['block.gtceu.heat_source_works', 'gtceu.heat_source', 'grindless.machine.heat_source_works.no_voiding']) assert.ok(part.includes(`'${key}'`), key);
    for (let i = 0; i < 4; i++) assert.ok(part.includes(`heat_source_works.tooltip.${i}'`), 'tooltip ' + i);
    for (const n of NEW_ITEMS) for (const key of [`item.grindless.${n}`, `tooltip.grindless.${n}.0`, `tooltip.grindless.${n}.1`]) assert.ok(part.includes(`'${key}'`), key);
  }
});
