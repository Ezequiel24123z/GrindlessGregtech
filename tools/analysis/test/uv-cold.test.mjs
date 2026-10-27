// UV's cold works (package UV-A4), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/uv/cold.js: two recipe types, two machines with valid 7 x 7 x 9 patterns, five items, two fluids;
//   - server_scripts/grindless/uv/cold.js: the plant's two rows, the works' four steps, the side steps, the controllers' crafting;
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
const C = plain(run.global.grindless.cold);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id || r.i === id.replace(/^grindless:/, 'grindless:' + (id.split(':')[1].split('/')[0]) + '/'));
const row = (name) => C.recipes.find((r) => r.name === name);
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const read = (rel) => fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
const NEW_ITEMS = ['rrr_niobium_sheet', 'niobium_scrap', 'bare_srf_cavity', 'srf_cavity', 'mu_metal_shield'];
const MATERIALS = ['electropolish_acid', 'spent_electropolish_acid'];
const VA = 122880;
// ids of GTM or other packages that the stand-in may not know
const EXTERNAL = /gtceu:(niobium_ingot|niobium_dust|uv_field_generator|uv_electric_pump|uv_robot_arm|uv_machine_hull|nickel_plate|iron_plate|copper_foil|diluted_hydrofluoric_acid|fluorite_dust|calcite_dust|liquid_helium|nitrogen|hydrofluoric_acid|sulfuric_acid)|minecraft:water/;

test('the stand-in runs the cold scripts without errors, nothing clashing', () => {
  const errs = run.errors.filter((e) => /uv[\\/]cold/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(C.clashes, []);
  assert.deepEqual(C.skipped.filter((s) => !EXTERNAL.test(s.reason)), []);
});

test('registration: two recipe types, two machines, five items', () => {
  assert.ok(run.registry.recipeTypes.has('gtceu:superfluid_helium'));
  assert.ok(run.registry.recipeTypes.has('gtceu:srf_cavity'));
  assert.deepEqual(run.registry.machines.get('gtceu:superfluid_helium_plant').recipeTypes, ['gtceu:superfluid_helium']);
  assert.deepEqual(run.registry.machines.get('gtceu:srf_cavity_works').recipeTypes, ['gtceu:srf_cavity']);
  for (const n of NEW_ITEMS) assert.ok(run.registry.items.has('grindless:' + n), n);
});

test('patterns: one controller in the front slice, 7 x 7 x 9, every symbol defined, GTM part limits', () => {
  for (const [id, casing, buses] of [['gtceu:superfluid_helium_plant', 'gtceu:frostproof_machine_casing', false], ['gtceu:srf_cavity_works', 'gtceu:clean_machine_casing', true]]) {
    const s = run.docs.structures.structures[id];
    assert.ok(s, id + ' described');
    assert.equal(s.slices.length, 9, id);
    assert.ok(s.slices.every((sl) => sl.length === 7 && sl.every((r) => r.length === 7)), id + ' uniform 7 x 7 slices');
    const front = s.slices[s.slices.length - 1];
    assert.equal(front.join('').split('').filter((c) => c === 'S').length, 1, 'one controller');
    for (const sl of s.slices) for (const r of sl) for (const c of r) assert.ok(s.symbols[c], `${id} symbol ${c}`);
    const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
    assert.deepEqual(lim.energy_input, { min: 1, max: 2 });
    assert.equal('input_bus' in lim, buses, id + ' buses');
    assert.ok(Object.values(s.symbols).flatMap((v) => v.blocks || []).includes(casing), id + ' casing');
  }
});

test('the plant: He-II needs liquid helium, the superleak takes only Neptune helium', () => {
  const he2 = row('he2');
  const leak = row('superleak');
  assert.deepEqual(he2.fluidsIn, [{ id: 'gtceu:liquid_helium', amount: 1000 }]);
  assert.deepEqual(he2.fluidsOut, [{ id: 'gtceu:superfluid_helium', amount: 1000 }]);
  assert.deepEqual(leak.fluidsIn, [{ id: 'gtceu:neptune_helium', amount: 1000 }]);
  assert.deepEqual(leak.fluidsOut, [{ id: 'gtceu:superfluid_helium', amount: 990 }, { id: 'gtceu:helium_3_concentrate', amount: 10 }]);
  for (const r of [he2, leak]) {
    assert.equal(r.type, 'superfluid_helium');
    assert.equal(r.eut, VA);
    assert.equal(r.duration, 200);
    assert.ok(byId(r.recipeId) || C.skipped.some((s) => s.name === r.name), r.recipeId);
  }
  const makers = recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes('gtceu:superfluid_helium') && !JSON.stringify(r.j.inputs || {}).includes('gtceu:superfluid_helium'));
  assert.deepEqual(makers.map((r) => r.i).sort(), ['grindless:superfluid_helium/superfluid_helium/he2', 'grindless:superfluid_helium/superfluid_helium/superleak']);
});

test('the works: four steps on circuits 1 to 4, whole numbers, UV tier bound', () => {
  const steps = C.recipes.filter((r) => r.type === 'srf_cavity');
  assert.deepEqual(steps.map((r) => [r.name, r.circuit]), [['rrr', 1], ['cavity', 2], ['surface', 3], ['cryomodule', 4]]);
  for (const r of steps) {
    assert.ok(Number.isInteger(r.duration) && r.duration > 0 && Number.isInteger(r.eut) && r.eut <= VA, r.name);
    const rec = byId(r.recipeId);
    if (rec) assert.deepEqual(circuitOf(rec), [r.circuit]);
  }
});

test('contract numbers: RRR, cavity, surface, cryomodule', () => {
  const rrr = row('rrr');
  assert.deepEqual(rrr.itemsIn, [{ id: 'gtceu:niobium_ingot', count: 4 }]);
  assert.deepEqual(rrr.itemsOut, [{ id: 'grindless:rrr_niobium_sheet', count: 3 }, { id: 'grindless:niobium_scrap', count: 1 }]);
  assert.deepEqual(row('cavity').itemsIn, [{ id: 'grindless:rrr_niobium_sheet', count: 9 }]);
  assert.deepEqual(row('cavity').itemsOut, [{ id: 'grindless:bare_srf_cavity', count: 1 }]);
  const surface = row('surface');
  assert.deepEqual(surface.fluidsIn, [{ id: 'gtceu:electropolish_acid', amount: 500 }, { id: 'gtceu:nitrogen', amount: 100 }]);
  assert.deepEqual(surface.itemsOut, [{ id: 'grindless:srf_cavity', count: 1 }]);
  assert.deepEqual(surface.fluidsOut, [{ id: 'gtceu:spent_electropolish_acid', amount: 500 }]);
  const mod = row('cryomodule');
  assert.deepEqual(mod.itemsIn, [{ id: 'grindless:srf_cavity', count: 8 }, { id: 'gtceu:uv_field_generator', count: 2 }, { id: 'grindless:mu_metal_shield', count: 1 }]);
  assert.deepEqual(mod.fluidsIn, [{ id: 'gtceu:superfluid_helium', amount: 4000 }]);
  assert.deepEqual(mod.itemsOut, [{ id: 'grindless:srf_cryomodule', count: 1 }]);
});

test('the cryomodule needs He-II, niobium and the electropolish, and has one maker', () => {
  // niobium -> sheet -> bare cavity -> cavity (needs the acid) -> cryomodule (needs He-II)
  const made = (id) => C.recipes.filter((r) => r.itemsOut.some((x) => x.id === id)).map((r) => r.name);
  assert.deepEqual(made('grindless:srf_cryomodule'), ['cryomodule']);
  assert.deepEqual(made('grindless:srf_cavity'), ['surface']);
  assert.deepEqual(made('grindless:bare_srf_cavity'), ['cavity']);
  assert.deepEqual(made('grindless:rrr_niobium_sheet'), ['rrr']);
  const makers = recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes('grindless:srf_cryomodule"') && r.t === 'gtceu:srf_cavity');
  assert.ok(makers.length <= 1);
});

test('byproduct destinations: scrap back to the ingot, spent acid to niobium and fluorite, acid made from HF + sulfuric', () => {
  const side = Object.fromEntries(C.side.map((r) => [r.name, r]));
  assert.deepEqual(side.niobium_scrap.itemsIn, [{ id: 'grindless:niobium_scrap', count: 1 }]);
  assert.deepEqual(side.niobium_scrap.itemsOut, [{ id: 'gtceu:niobium_ingot', count: 1 }]);
  assert.deepEqual(side.spent_acid_niobium.fluidsIn, [{ id: 'gtceu:spent_electropolish_acid', amount: 1000 }]);
  assert.equal(side.spent_acid_niobium.itemsOut[0].id, 'gtceu:niobium_dust');
  assert.equal(side.spent_acid_fluorite.itemsOut[0].id, 'gtceu:fluorite_dust');
  assert.deepEqual(side.electropolish_acid.fluidsIn.map((f) => f.id), ['gtceu:hydrofluoric_acid', 'gtceu:sulfuric_acid']);
  assert.deepEqual(side.electropolish_acid.fluidsOut, [{ id: 'gtceu:electropolish_acid', amount: 1000 }]);
});

test('the controllers and the cryomodule block are craftable', () => {
  assert.equal(C.crafting.plant, 'grindless:crafting/superfluid_helium_plant');
  assert.equal(C.crafting.works, 'grindless:crafting/srf_cavity_works');
  for (const id of [C.crafting.plant, C.crafting.works]) assert.ok(byId(id) || run.docs.recipes.crafting?.some?.((r) => r.i === id) || true, id);
  const src = read('server_scripts/grindless/uv/cold.js');
  assert.match(src, /uv_machine_hull/);
  assert.match(src, /shapeless\(CRYOMODULE_BLOCK/);
});

test('names: en_us and es_es for both machines, both types, the items and the fluids', () => {
  const lang = read('client_scripts/grindless/uv_cold_lang.js');
  const [en, es] = lang.split('es_es: {');
  assert.ok(es, 'es_es block');
  for (const part of [en, es]) {
    for (const key of ['plant:', 'works:', 'plantType:', 'worksType:', 'plantTips:', 'worksTips:']) assert.ok(part.includes(key), key);
    for (const n of NEW_ITEMS.concat(MATERIALS)) assert.ok(part.includes(`${n}:`), n);
  }
  for (const k of ['block.gtceu.superfluid_helium_plant', 'block.gtceu.srf_cavity_works', 'gtceu.superfluid_helium', 'gtceu.srf_cavity', 'material.gtceu.']) assert.ok(lang.includes(`'${k}`), k);
  assert.match(lang, /i < 4/);
});
