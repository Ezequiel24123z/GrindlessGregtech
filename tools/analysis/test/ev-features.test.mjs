// EV features of the validator (2026-10-25): the pack's family tier veto (`vetoAbove`, `onlyTier`) and static site checks
// (`kind: "site"`: every recipe of a machine carries only its site's dimension conditions).
import test from 'node:test';
import assert from 'node:assert/strict';
import { recipeTierOf } from '../lib/model.mjs';
import { gt, gi, mkDump, run, verdicts } from './helpers.mjs';

test('recipeTierOf: the highest tier named by a folder of the id path, as rules.recipeTier in lv/multis.js', () => {
  assert.equal(recipeTierOf('grindless:vein_drilling/ev/ilmenite_moon_titanium'), 'ev');
  assert.equal(recipeTierOf('grindless:greenhouse/lv/oak_fertilizer'), 'lv');
  assert.equal(recipeTierOf('grindless:vein_drilling/hv/end/iron_end_stainless_steel'), 'hv');
  assert.equal(recipeTierOf('grindless:vein_drilling/mv/hv/x'), 'hv', 'the highest folder wins');
  assert.equal(recipeTierOf('grindless:vein_drilling/iron_steel'), '', 'steam recipes have no tier folder');
  assert.equal(recipeTierOf('grindless:vein_drilling/ev'), '', 'the last segment is the recipe name, not a folder');
});

function drillPack(machines) {
  const recipes = [
    gt('t:drilling/plain', 't:drilling', { ins: [gi('t:sample_a', 1, 0)], outs: [gi('t:ore_a')] }),
    gt('t:drilling/hv/b', 't:drilling', { ins: [gi('t:sample_b', 1, 0)], outs: [gi('t:ore_b')] }),
    gt('t:drilling/ev/c', 't:drilling', { ins: [gi('t:sample_c', 1, 0)], outs: [gi('t:ore_c')] }),
  ];
  const cfg = {
    tier: 'lv',
    eraOrder: ['steam', 'lv'],
    world: [{ id: 'samples', mode: 'manual', bootstrap: true, items: ['t:sample_a', 't:sample_b', 't:sample_c', ...machines.map((m) => m.machine)] }],
    machines,
    targets: [
      { id: 'a', item: 't:ore_a' },
      { id: 'b', item: 't:ore_b' },
      { id: 'c', item: 't:ore_c' },
    ],
  };
  return { dump: mkDump({ recipes, items: ['t:ore_a', 't:ore_b', 't:ore_c', ...machines.map((m) => m.machine)] }), cfg };
}

test('tier veto: vetoAbove skips the recipes filed above the machine\'s tier and keeps the unfiled ones', () => {
  const { dump, cfg } = drillPack([{ machine: 't:hv_drill', types: ['t:drilling'], vetoAbove: 'hv' }]);
  const r = run(dump, cfg);
  assert.deepEqual(verdicts(r.out.gate), { a: 'PASS', b: 'PASS', c: 'FAIL' });
  const dead = r.model.g.rules.find((x) => x.name === 't:drilling/ev/c').slots.find((s) => s.role === 'machine');
  assert.ok(/runs the recipes filed under ev\/ \(the family's tier veto\)/.test(dead.label), dead.label);
});

test('tier veto: onlyTier runs its own folder only (the EV tripod), "" only the unfiled recipes (the steam family), and no veto runs every folder', () => {
  let r = run(...Object.values(drillPack([{ machine: 't:tripod', types: ['t:drilling'], onlyTier: 'ev' }])));
  assert.deepEqual(verdicts(r.out.gate), { a: 'FAIL', b: 'FAIL', c: 'PASS' });
  r = run(...Object.values(drillPack([{ machine: 't:steam_drill', types: ['t:drilling'], onlyTier: '' }])));
  assert.deepEqual(verdicts(r.out.gate), { a: 'PASS', b: 'FAIL', c: 'FAIL' });
  assert.ok(!r.model.warnings.some((w) => /onlyTier/.test(w)), 'onlyTier "" is valid');
  r = run(...Object.values(drillPack([{ machine: 't:any_drill', types: ['t:drilling'] }])));
  assert.deepEqual(verdicts(r.out.gate), { a: 'PASS', b: 'PASS', c: 'PASS' });
});

test('tier veto: a value that is not a tier is a config warning', () => {
  const r = run(...Object.values(drillPack([{ machine: 't:drill', types: ['t:drilling'], vetoAbove: 'moon' }])));
  assert.ok(r.model.warnings.some((w) => /vetoAbove «moon» isn't a tier/.test(w)), r.model.warnings.join('\n'));
});

const dim = (d, reverse) => ({ type: 'dimension', dimension: d, ...(reverse ? { reverse: true } : {}) });

function sitePack(extraTargets) {
  const recipes = [
    gt('t:cell/one', 't:cell', { ins: [gi('t:dust')], outs: [gi('t:brick')], conditions: [dim('t:luna')] }),
    gt('t:cell/two', 't:cell', { ins: [gi('t:dust')], outs: [gi('t:ingot')], conditions: [dim('t:luna')] }),
    gt('t:burn/coal', 't:burner', { ins: [gi('t:coal')], conditions: [dim('t:earth'), dim('t:nether')] }),
    gt('t:burn/wood', 't:burner', { ins: [gi('t:wood')], conditions: [dim('t:earth')] }),
    gt('t:burn/lava', 't:burner', { ins: [gi('t:lava')] }),
    gt('t:burn/peat', 't:burner', { ins: [gi('t:peat')], conditions: [dim('t:luna', true)] }),
  ];
  const cfg = { tier: 'lv', eraOrder: ['steam', 'lv'], machines: [], targets: extraTargets };
  return { dump: mkDump({ recipes }), cfg };
}

test('site check: every recipe of the type carries only the site\'s dimension, whether or not it can be completed', () => {
  const r = run(...Object.values(sitePack([{ id: 'cell', kind: 'site', type: 't:cell', dimensions: ['t:luna'] }])));
  const res = r.out.gate.find((x) => x.target.id === 'cell');
  assert.equal(res.verdict, 'PASS');
  assert.ok(/all 2 recipe\(s\) of t:cell only run in t:luna/.test(res.lines[0]), res.lines[0]);
});

test('site check: a missing condition, an extra dimension, a reversed condition and (with exact) a missing dimension are offenders', () => {
  const targets = [
    { id: 'loose', kind: 'site', type: 't:burner', dimensions: ['t:earth'] },
    { id: 'air', kind: 'site', type: 't:burner', dimensions: ['t:earth', 't:nether'], allowAnywhere: ['t:burn/lava'] },
    { id: 'air-exact', kind: 'site', type: 't:burner', dimensions: ['t:earth', 't:nether'], exact: true, allowAnywhere: ['t:burn/lava'], recipe: ['t:burn/coal', 't:burn/wood', 't:burn/lava'] },
    { id: 'nothing', kind: 'site', type: 't:missing', dimensions: ['t:luna'] },
    { id: 'nothing-optional', kind: 'site', type: 't:missing', dimensions: ['t:luna'], optional: true },
  ];
  const r = run(...Object.values(sitePack(targets)));
  const v = verdicts(r.out.gate);
  assert.deepEqual(v, { loose: 'FAIL', air: 'FAIL', 'air-exact': 'FAIL', nothing: 'FAIL', 'nothing-optional': 'WARN' });
  const lines = (id) => r.out.gate.find((x) => x.target.id === id).lines.join('\n');
  assert.ok(/t:burn\/coal: also runs in t:nether/.test(lines('loose')));
  assert.ok(/t:burn\/lava: no dimension condition: it runs anywhere/.test(lines('loose')));
  assert.ok(/t:burn\/peat: a reversed condition/.test(lines('loose')));
  assert.ok(!/t:burn\/lava/.test(lines('air').split('\n').slice(1).join('\n')), 'allowAnywhere lets lava through');
  assert.ok(/1 allowed to run anywhere/.test(lines('air')));
  assert.ok(/t:burn\/wood: doesn't run in t:nether/.test(lines('air-exact')));
  assert.ok(!/t:burn\/peat/.test(lines('air-exact')), 'the recipe globs narrow the scope');
  assert.ok(/there's no recipe of t:missing in the pack/.test(lines('nothing')));
});

test('site check: exceptRecipes leaves a later era\'s row out of the check', () => {
  const targets = [
    { id: 'loose', kind: 'site', type: 't:burner', dimensions: ['t:earth'], allowAnywhere: ['t:burn/lava'] },
    { id: 'except', kind: 'site', type: 't:burner', dimensions: ['t:earth'], allowAnywhere: ['t:burn/lava'], exceptRecipes: ['t:burn/coal', 't:burn/pe*'] },
  ];
  const r = run(...Object.values(sitePack(targets)));
  assert.deepEqual(verdicts(r.out.gate), { loose: 'FAIL', except: 'PASS' });
});
