// OpV-D2: chain crossings, containment, the sole disposal recipe, structures and names.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { measure, violations } from '../lib/structure_quality.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const pack = path.join(root, 'pack');
const table = (name) => JSON.parse(fs.readFileSync(path.join(pack, 'kubejs/data/grindless/tables', `${name}.json`), 'utf8'));
const T = table('exotic_matter');
const SITE = 'grindless:cygnus_x1_orbit';
const run = runPackScripts(pack);
const EM = run.global.grindless.exoticMatter;
const docs = run.docs.recipes.recipes;
const find = (id) => docs.find((r) => r.i === `grindless:${id}`);
const ids = (r, key) => (r[key] || []).map((s) => s.id);
const row = (name, type, circuit) => table(name).types[type].recipes.find((r) => r.circuit === circuit);
const conditions = (r) => JSON.stringify(r.j.recipeConditions || []);

test('D2 scripts register every local row and both controllers without errors', () => {
  assert.deepEqual(run.errors.filter((e) => /opv[\\/]exotic_matter/.test(e.file)), []);
  assert.equal(EM.recipes.length, 6);
  assert.equal(EM.controllerRecipes.length, 2);
  for (const id of [...EM.recipes, ...EM.controllerRecipes]) assert.ok(docs.some((r) => r.i === id), id);
});

test('line 36 has append-only calutron c12, ion source, cyclotron c12 and Cygnus synchrotron c9', () => {
  const pb = row('isotopes', 'calutron_separation', 12);
  assert.equal(pb.name, 'lead_208');
  assert.deepEqual(pb.itemsOut, [{ id: 'grindless:lead_208_dust', count: 1 }, { id: 'gtceu:lead_dust', count: 3 }]);
  const cyc = row('superheavy', 'heavy_ion_irradiation', 12);
  assert.equal(cyc.name, 'pb208_beam_cell');
  assert.ok(ids(cyc, 'itemsIn').includes('grindless:pb208_ion_source'));
  assert.ok(ids(cyc, 'itemsOut').includes('gtceu:glass_tube'));
  assert.ok(ids(cyc, 'fluidsOut').includes('gtceu:chlorine'));
  const synch = row('accelerators', 'synchrotron', 9);
  assert.deepEqual([synch.name, synch.eut, synch.duration, synch.site], ['fireball_distillate', 503316480, 1200, SITE]);
  assert.deepEqual(synch.fluidsIn, [{ id: 'gtceu:disk_plasma', amount: 1000 }]);
  assert.deepEqual(synch.fluidsOut, [{ id: 'grindless:fireball_distillate', amount: 1000 }]);
  assert.ok(conditions(find('synchrotron/fireball_distillate')).includes(SITE));
  assert.ok(find('chemical_reactor/pb208_ion_source'));
  for (const [name, type, circuit] of [['isotopes', 'calutron_separation', 12], ['superheavy', 'heavy_ion_irradiation', 12], ['accelerators', 'synchrotron', 9]]) {
    assert.equal(table(name).types[type].recipes.filter((r) => r.circuit === circuit).length, 1);
  }
});

test('distiller uses only c2/c3; seed is positive, negative residue is contained at 20%, catalyst nominal wear 1/32', () => {
  const rows = T.types.strangelet_distillation.recipes;
  assert.deepEqual(rows.map((r) => r.circuit), [2, 3]);
  assert.deepEqual(rows[0].chancedIn, [{ id: 'grindless:pasta_core_sample', count: 1, chance: 312 }]);
  assert.match(rows[0]._wear, /1\/32.*312\/10000/);
  assert.deepEqual(rows[0].chancedOut, [{ id: 'grindless:negative_strangelet_residue', count: 1, chance: 2000 }]);
  for (const r of rows) assert.ok(conditions(find(`strangelet_distillation/${r.name}`)).includes(SITE));
  const producers = docs.filter((r) => JSON.stringify(r.j.outputs || {}).includes('"grindless:fireball_distillate"'));
  assert.deepEqual(producers.map((r) => r.i), ['grindless:synchrotron/fireball_distillate'], 'no distiller c1 bypass');
});

test('exact c3 is the sole D2 output-free row, and it consumes only negative residue', () => {
  const noOutputs = Object.entries(T.types).flatMap(([type, t]) =>
    t.recipes.filter((r) => ['itemsOut', 'chancedOut', 'fluidsOut'].every((key) => !r[key]?.length)).map((r) => [type, r]));
  assert.equal(noOutputs.length, 1);
  const [type, r] = noOutputs[0];
  assert.equal(`grindless:${type}/${r.name}`, EM.disposalId);
  assert.equal(r.site, SITE);
  assert.equal(r.disposal, true);
  assert.deepEqual(r.itemsIn, [{ id: 'grindless:negative_strangelet_residue', count: 1 }]);
  const startup = fs.readFileSync(path.join(pack, 'kubejs/startup_scripts/grindless/opv/exotic_matter.js'), 'utf8');
  assert.match(startup, /String\(recipe\.id\) === EM\.disposalId/);
  assert.match(startup, /G\.noVoiding\.modifier/);
  assert.match(startup, /G\.noVoiding\.beforeWorking/);
});

test('vault c1 feeds, c2 returns beta-active tailings, c3 stabilises; hot cell c19 returns inert lead', () => {
  const rows = T.types.strangelet_growth.recipes;
  assert.deepEqual(rows.map((r) => [r.circuit, r.eut, r.duration]), [[1, 268435456, 1600], [2, 503316480, 2400], [3, 503316480, 2400]]);
  assert.deepEqual(rows[0].itemsIn, [{ id: 'grindless:strangelet_seed', count: 1 }, { id: 'grindless:neutronium_pellet', count: 4 }]);
  assert.ok(ids(rows[1], 'itemsOut').includes('grindless:strangelet_tailings'));
  assert.ok(ids(rows[2], 'itemsIn').includes('grindless:field_frozen_plate'));
  assert.ok(ids(rows[2], 'itemsOut').includes('grindless:stable_exotic_matter'));
  for (const r of rows) {
    assert.ok(!r.site, r.name);
    assert.ok(ids(r, 'kept').includes('gtceu:boron_dust'));
    assert.ok(ids(r, 'charge').includes('minecraft:water'));
  }
  const hot = table('hot_cell').recipes.find((r) => r.circuit === 19);
  assert.deepEqual(hot.itemsIn, [{ id: 'grindless:strangelet_tailings', count: 1 }]);
  assert.deepEqual(hot.itemsOut, [{ id: 'gtceu:lead_dust', count: 1 }]);
  assert.ok(find('hot_cell/strangelet_tailings_decay'));
});

test('controllers obey the OpV assembly-line rule and research the beam cell, never lower-tier parts', () => {
  for (const m of ['strangelet_vault', 'strangelet_distiller']) {
    const r = find(`assembly_line/${m}`);
    assert.ok(r);
    const j = JSON.stringify(r.j);
    for (const id of ['gtceu:opv_machine_hull', 'gtceu:opv_field_generator', 'gtceu:opv_electric_pump', 'gtceu:opv_sensor',
      'gtceu:circuits/opv', 'grindless:superfluid_helium_3', 'grindless:pb208_beam_cell']) assert.ok(j.includes(id), `${m}: ${id}`);
    assert.doesNotMatch(j, /gtceu:(uxv|uiv|uev|uhv)_(machine_hull|field_generator|sensor|electric_pump)/);
  }
});

test('shapes match 9x9x9 and 7x7x13, keep NEG liners and pass the structure rubric', () => {
  for (const [m, bbox] of [['strangelet_vault', [9, 9, 9]], ['strangelet_distiller', [7, 7, 13]]]) {
    const s = run.global.grindless.structures[`gtceu:${m}`];
    const metrics = measure(s);
    assert.deepEqual(metrics.bbox, bbox);
    assert.deepEqual(violations(metrics), [], JSON.stringify(metrics));
    assert.ok(metrics.dominantShare <= 0.62, JSON.stringify(metrics));
    assert.ok(JSON.stringify(s).includes('grindless:neg_xhv_casing'));
    assert.ok(s.slices.at(-1).some((r) => r.includes('S')));
  }
});

test('all new names, containment tooltips and EMI pages have matching English and Spanish keys', () => {
  const localKeys = Object.keys(run.lang.en_us).filter((k) => /strangelet|fireball_distillate|lead_208|pb208_ion_source|opv_exotic_matter/.test(k));
  assert.deepEqual(localKeys.sort(), Object.keys(run.lang.es_es).filter((k) => /strangelet|fireball_distillate|lead_208|pb208_ion_source|opv_exotic_matter/.test(k)).sort());
  for (const k of localKeys) for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][k], `${lang}: ${k}`);
  assert.match(run.lang.en_us['grindless.machine.strangelet_distiller.tooltip.1'], /negative residue.*Cygnus X-1/);
  assert.match(run.lang.en_us['emi.grindless.info.strangelet_vault.1'], /Witten.*hypothesis.*named fiction/);
  assert.match(run.lang.en_us['emi.grindless.info.opv_exotic_matter_stock.0'], /OpV-D3.*G1.*MAX/);
});
