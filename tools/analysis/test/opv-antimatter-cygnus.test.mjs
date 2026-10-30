import assert from 'node:assert/strict';
import { test } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { measure, violations } from '../lib/structure_quality.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const run = runPackScripts(path.join(root, 'pack'));
const A = run.global.grindless.antimatterCygnus;
const plain = x => JSON.parse(JSON.stringify(x));
const recipes = run.docs.recipes.recipes;
const get = (type, name) => recipes.find(r => r.i === `grindless:${type}/${name}`);
const site = 'grindless:cygnus_x1_orbit';

test('B3b startup and recipe handlers have no package errors', () => {
  assert.deepEqual(run.errors.filter(e => /antimatter_cygnus/.test(e.file)), []);
  assert.deepEqual(plain(A.errors), []);
  assert.equal(A.recipes.length, 5);
  assert.equal(A.controllers.length, 3);
});
test('exact design beam yields, EU/t and durations; all steps stay at Cygnus', () => {
  const expected = [
    ['jet_beam_extraction', 'jet_proton_beam', 1, 268435456, 200, 'jet_proton_beam', 1000],
    ['jet_beam_extraction', 'flux_boosted_jet_beam', 2, 503316480, 200, 'jet_proton_beam', 2000],
    ['antiproton_production', 'hot_antiproton_beam', 1, 503316480, 400, 'hot_antiproton_beam', 1000],
    ['beam_cooling', 'stochastic_cooling', 1, 268435456, 800, 'stochastically_cooled_beam', 1000],
    ['beam_cooling', 'cold_antiproton_cell', 2, 503316480, 1200, null, null]
  ];
  for (const [type, name, circuit, eut, duration, fluid, amount] of expected) {
    const row = A.recipes.find(r => r.type === type && r.name === name);
    assert.deepEqual([row.circuit, row.eut, row.duration], [circuit, eut, duration]);
    if (fluid) assert.deepEqual(plain(row.fluidsOut), [{ id: `grindless:${fluid}`, amount }]);
    assert.ok(JSON.stringify(get(type, name).j.recipeConditions).includes(site), name);
  }
  assert.deepEqual(plain(A.recipes[1].fluidsIn), [{ id: 'gtceu:flux_loaded_plasma', amount: 100 }]);
  assert.deepEqual(plain(A.recipes[2].fluidsIn), [{ id: 'grindless:jet_proton_beam', amount: 4000 }]);
  assert.deepEqual(plain(A.recipes[3].fluidsIn), [{ id: 'grindless:hot_antiproton_beam', amount: 1000 }]);
  assert.deepEqual(plain(A.recipes[4].fluidsIn), [{ id: 'grindless:stochastically_cooled_beam', amount: 1000 }]);
});
test('wear, spent shield/target destinations and Penning containment', () => {
  assert.deepEqual(plain(A.recipes[0].wear), [{ id: 'grindless:be_beam_window', chance: 313 }]);
  assert.deepEqual(plain(A.recipes[2].chancedOut), [
    { id: 'grindless:spent_ir_target', count: 1, chance: 625 },
    { id: 'grindless:spent_li6_shield', count: 1, chance: 313 }
  ]);
  assert.equal(A.recipes[3].wear[0].chance, 156);
  assert.equal(A.recipes[4].wear[0].chance, 156);
  assert.deepEqual(plain(A.recipes[4].itemsIn), ['grindless:empty_penning_trap']);
  assert.deepEqual(plain(A.recipes[4].kept), ['grindless:octupole_trap_magnet']);
  assert.deepEqual(plain(A.recipes[4].itemsOut), ['grindless:cold_antiproton_cell']);
});
test('three controllers meet the OpV component, research and domain-input contract', () => {
  for (const m of A.machines) {
    const r = get('assembly_line', m.name);
    assert.ok(r, m.name);
    const text = JSON.stringify(r.j);
    for (const id of ['gtceu:opv_machine_hull', 'gtceu:circuits/opv', 'grindless:superfluid_helium_3', 'gtceu:data_module'])
      assert.ok(text.includes(id), `${m.name}: ${id}`);
    assert.ok(!/gtceu:(?:uxv|uiv|uev|uhv|uv|zpm|luv|iv|ev|hv|mv|lv)_(?:electric|field_generator|sensor|emitter)|circuits\/uxv/.test(text));
  }
});
test('three designed structures are hollow, varied and functional', () => {
  for (const m of A.machines) {
    const s = run.global.grindless.structures[`gtceu:${m.name}`];
    assert.ok(s, m.name);
    const metrics = measure(s);
    assert.deepEqual(metrics.bbox, [m.w, m.h, m.d]);
    assert.deepEqual(violations(metrics), [], `${m.name}: ${JSON.stringify(metrics)}`);
    assert.ok(s.slices.at(-1).some(r => r.includes('S')));
    const xs = s.slices.flat().join('').split('X').length - 1;
    assert.ok(xs >= (m.name === 'jet_beam_line' ? 4 : 5));
  }
});
test('names, short tooltips, EMI guidance and new ids have language parity', () => {
  const matcher = /jet_beam_line|spallation_target_station|antiproton_decelerator|hot_antiproton_beam|stochastically_cooled_beam|spent_li6_shield|jet_beam_extraction|antiproton_production|beam_cooling/;
  const keys = Object.keys(run.lang.en_us).filter(k => matcher.test(k)).sort();
  assert.deepEqual(keys, Object.keys(run.lang.es_es).filter(k => matcher.test(k)).sort());
  for (const m of A.machines) for (const lang of ['en_us', 'es_es']) {
    assert.ok(run.lang[lang][`block.gtceu.${m.name}`]);
    assert.ok(run.lang[lang][`grindless.machine.${m.name}.tooltip.0`]);
    assert.ok(run.lang[lang][`emi.grindless.info.${m.name}.0`]);
  }
});
