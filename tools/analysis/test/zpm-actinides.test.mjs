// ZPM's waste retrieval plant and actinide partitioning plant (package ZPM-A4), no game needed. The pack's scripts run in the stand-in of
// lib/kubejs_static.mjs:
//   - startup_scripts/grindless/zpm/actinides.js: two recipe types, two machines with valid patterns, two GT materials;
//   - server_scripts/grindless/zpm/actinides.js: the five recipes (one circuit each, nothing clashing), the lanthanide nitrate route to the
//     cascade, the two crafting recipes;
//   - en_us and es_es text for everything new; A4's hide rules are gone.
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
const AC = plain(run.global.grindless.actinides);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const ZPM_VA = 122880;
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);

test('the stand-in runs the actinide scripts without errors, nothing skipped or clashing', () => {
  const errs = run.errors.filter((e) => /zpm[\\/]actinides/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(AC.skipped, []);
  assert.deepEqual(AC.clashes, []);
});

test('registration: two recipe types, two machines, two materials', () => {
  assert.ok(run.registry.recipeTypes.has('gtceu:waste_retrieval'));
  assert.ok(run.registry.recipeTypes.has('gtceu:actinide_partitioning'));
  assert.deepEqual(run.registry.machines.get('gtceu:waste_retrieval_plant').recipeTypes, ['gtceu:waste_retrieval']);
  assert.deepEqual(run.registry.machines.get('gtceu:actinide_partitioning_plant').recipeTypes, ['gtceu:actinide_partitioning']);
  for (const m of ['minor_actinide_strip', 'lanthanide_nitrate']) {
    assert.ok(run.registry.materials.get('gtceu:' + m).forms.has('liquid'), m);
  }
});

test('both patterns: one controller in the front slice, GTM part limits, one width and height', () => {
  for (const id of ['gtceu:waste_retrieval_plant', 'gtceu:actinide_partitioning_plant']) {
    const s = run.docs.structures.structures[id];
    assert.ok(s, id + ' described');
    const front = s.slices[s.slices.length - 1];
    assert.equal(front.join('').split('').filter((c) => c === 'S').length, 1, 'one controller');
    const h = s.slices[0].length;
    const w = s.slices[0][0].length;
    assert.ok(s.slices.every((sl) => sl.length === h && sl.every((row) => row.length === w)), 'uniform slices');
    const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
    assert.deepEqual(lim.energy_input, { min: 1, max: 2 });
    assert.deepEqual(lim.input_hatch, { min: 1, max: 3 });
    assert.deepEqual(lim.output_hatch, { min: 1, max: 3 });
    for (const sl of s.slices) for (const row of sl) for (const c of row) assert.ok(c === ' ' || s.symbols[c], 'symbol ' + c);
    const blocks = Object.values(s.symbols).flatMap((v) => v.blocks || []);
    assert.ok(blocks.includes('gtnn:radiation_proof_machine_casing'));
    assert.ok(blocks.includes('gtceu:ptfe_pipe_casing'));
  }
});

test('the five recipes: one circuit each, the waste item pinned by id, ZPM VA bound, whole numbers', () => {
  assert.deepEqual(AC.retrieval.map((r) => [r.name, r.circuit]), [['retrieve', 1], ['emanate', 2], ['capsule', 3]]);
  // circuits 3-5: UEV-A1's plutonium recovery and the Cm and Bk/Cf cuts
  assert.deepEqual(AC.partition.map((r) => [r.name, r.circuit]), [['strip', 1], ['split', 2], ['plutonium_recovery', 3], ['curium_cut', 4], ['berkelium_cut', 5], ['es_fm_cut', 6]]); // UIV-B2 appended c6
  for (const p of AC.retrieval.concat(AC.partition)) {
    const r = byId(p.recipeId);
    assert.ok(r, p.recipeId + ' added');
    assert.deepEqual(circuitOf(r), [p.circuit]);
    assert.ok(Number.isInteger(p.duration) && p.duration > 0 && p.eut <= ZPM_VA);
  }
  assert.equal(byId('grindless:waste_retrieval/retrieve').t, 'gtceu:waste_retrieval');
  assert.equal(byId('grindless:actinide_partitioning/split').t, 'gtceu:actinide_partitioning');
  assert.equal(AC.retrieval[0].itemsIn[0].id, 'gtnn:radioactive_waste');
  assert.ok(!run.removals.some((x) => JSON.stringify(x.filter).includes('radioactive_waste')), 'GT--\'s waste recipes are not removed');
});

test('every product has its destination; synroc is the sealed end', () => {
  const [ret, em, cap] = AC.retrieval;
  const [strip, split] = AC.partition;
  assert.deepEqual(ret.itemsOut.map((x) => x.id), ['gtceu:radium_dust', 'grindless:synroc_block']);
  assert.deepEqual(ret.fluidsOut.map((x) => x.id), ['gtceu:actinide_raffinate', 'gtceu:nitrogen_dioxide']);
  // radium -> capsule -> radon; the worn capsule ends as lead
  assert.equal(cap.itemsIn[0].id, 'gtceu:radium_dust');
  assert.equal(cap.itemsOut[0].id, 'grindless:radium_capsule');
  assert.equal(em.chancedIn[0].id, 'grindless:radium_capsule');
  assert.equal(em.fluidsOut[0].id, 'gtceu:radon');
  assert.deepEqual(em.notConsumed, [{ id: 'gtceu:helium', amount: 1000 }]);
  assert.equal(em.chancedOut[0].id, 'gtceu:lead_dust');
  // raffinate -> partitioning
  assert.equal(strip.fluidsIn[0].id, 'gtceu:actinide_raffinate');
  assert.deepEqual(strip.fluidsOut.map((x) => x.id), ['gtceu:minor_actinide_strip', 'gtceu:lanthanide_nitrate']);
  assert.deepEqual(strip.notConsumed.map((x) => x.id), ['gtceu:kerosene']);
  assert.equal(split.fluidsIn[0].id, 'gtceu:minor_actinide_strip');
  assert.deepEqual(split.itemsOut.map((x) => x.id), ['gtceu:americium_dust', 'grindless:curium_oxide', 'grindless:synroc_block']);
  // lanthanide nitrate -> the cascade's circuit-2 input
  const re = byId('grindless:chemical_reactor/lanthanide_nitrate_to_chloride');
  assert.ok(re, 'reactor recipe added');
  const text = JSON.stringify(re.j);
  assert.match(text, /lanthanide_nitrate/);
  assert.match(text, /rare_earth_chloride_solution/);
  // nothing in the plants is hidden: the F1 ids are produced here and no longer hidden
  const obtain = fs.readFileSync(path.join(root, 'tools', 'analysis', 'tiers', 'obtain.json'), 'utf8');
  assert.ok(!/ZPM \(A4\)/.test(obtain), 'A4 hide rule deleted');
  const hidden = fs.readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', 'hidden_until.json'), 'utf8');
  for (const id of ['radium_capsule', 'curium_oxide', 'synroc_block']) assert.ok(!hidden.includes('grindless:' + id), id + ' no longer hidden');
});

test('crafting recipes use ZPM parts', () => {
  for (const [id, machine] of [[AC.crafting.retrieval, 'waste_retrieval_plant'], [AC.crafting.partition, 'actinide_partitioning_plant']]) {
    const r = byId(id);
    assert.ok(r, id + ' added');
    const text = JSON.stringify(r.j);
    assert.match(text, new RegExp('gtceu:' + machine));
    for (const part of AC.craftingParts) assert.ok(text.includes(part), part);
  }
});

test('every new name and tooltip has en_us and es_es text', () => {
  const en = run.lang.en_us || {};
  const es = run.lang.es_es || {};
  const keys = [];
  for (const m of ['waste_retrieval_plant', 'actinide_partitioning_plant']) {
    keys.push('block.gtceu.' + m, `grindless.machine.${m}.no_voiding`);
    for (let i = 0; i < 4; i++) keys.push(`grindless.machine.${m}.tooltip.${i}`);
  }
  keys.push('gtceu.waste_retrieval', 'gtceu.actinide_partitioning', 'material.gtceu.minor_actinide_strip', 'material.gtceu.lanthanide_nitrate');
  for (const k of keys) {
    assert.ok(en[k] && en[k].length > 3, 'en_us ' + k);
    assert.ok(es[k] && es[k].length > 3, 'es_es ' + k);
    assert.notEqual(en[k], es[k], 'es_es ' + k + ' is translated');
  }
});
