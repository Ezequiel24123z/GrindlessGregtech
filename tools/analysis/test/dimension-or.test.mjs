// GTM ORs the dimension conditions of one recipe (DimensionCondition.isOr, RecipeHelper.checkConditions): the model makes them one
// slot, met when any of them is. A fuel that burns where there is air carries one condition per such dimension.
import test from 'node:test';
import assert from 'node:assert/strict';
import { gt, gi, mkDump, run, verdicts } from './helpers.mjs';

function burnerPack({ dims = [], reverse = [], dimension } = {}) {
  const conditions = dims.map((d) => ({ type: 'dimension', dimension: d }))
    .concat(reverse.map((d) => ({ type: 'dimension', dimension: d, reverse: true })));
  const recipes = [gt('t:burner/coal', 't:burner', { ins: [gi('t:coal')], outs: [gi('t:ash')], conditions })];
  const cfg = {
    tier: 'lv',
    eraOrder: ['steam', 'lv'],
    ...(dimension ? { conditions: { dimension } } : {}),
    world: [{ id: 'earth', mode: 'manual', bootstrap: true, items: ['t:coal', 't:burner'] }],
    machines: [{ machine: 't:burner', types: ['t:burner'] }],
    targets: [{ id: 'ash', item: 't:ash' }],
  };
  return { dump: mkDump({ recipes, items: ['t:coal', 't:ash', 't:burner'] }), cfg };
}

const ruleOf = (r) => r.model.g.rules.find((x) => x.name === 't:burner/coal');
const names = (r, s) => s.alts.map((a) => r.model.g.keyNames[a]).sort();

test('dimension OR: a recipe valid in the factory\'s dimension or another one applies at the factory', () => {
  const { dump, cfg } = burnerPack({ dims: ['t:luna', 'minecraft:overworld', 't:void'] });
  const r = run(dump, cfg);
  assert.equal(verdicts(r.out.gate).ash, 'PASS');
  assert.ok(!ruleOf(r).slots.some((s) => s.role === 'cond'), 'no condition slot: the Overworld condition holds');
  assert.deepEqual(ruleOf(r).meta.dims, ['t:luna', 'minecraft:overworld', 't:void']);
});

test('dimension OR: a recipe valid only in other dimensions gets one dead slot naming all of them', () => {
  const { dump, cfg } = burnerPack({ dims: ['t:luna', 't:mars'] });
  const r = run(dump, cfg);
  assert.equal(verdicts(r.out.gate).ash, 'FAIL');
  const conds = ruleOf(r).slots.filter((s) => s.role === 'cond');
  assert.equal(conds.length, 1);
  assert.ok(conds[0].dead && /only applies in t:luna or in t:mars; the factory is in minecraft:overworld/.test(conds[0].label));
});

test('dimension OR: a reversed condition that holds here meets the group', () => {
  const { dump, cfg } = burnerPack({ dims: ['t:luna'], reverse: ['t:mars'] });
  const r = run(dump, cfg);
  assert.equal(verdicts(r.out.gate).ash, 'PASS');
});

test('dimension OR with asKeys: one capital slot with every dimension\'s key as an alternative', () => {
  const { dump, cfg } = burnerPack({ dims: ['t:luna', 't:mars'], dimension: { asKeys: true } });
  const r = run(dump, cfg);
  const conds = ruleOf(r).slots.filter((s) => s.role === 'cond');
  assert.equal(conds.length, 1);
  assert.ok(conds[0].cap);
  assert.deepEqual(names(r, conds[0]), ['dim:t:luna', 'dim:t:mars']);
});

test('dimension OR with asKeysFor: a keyed dimension and the factory\'s own one, the recipe applies at the factory', () => {
  const { dump, cfg } = burnerPack({ dims: ['t:luna', 'minecraft:overworld'], dimension: { asKeysFor: ['t:luna'] } });
  const r = run(dump, cfg);
  assert.equal(verdicts(r.out.gate).ash, 'PASS');
  assert.ok(!ruleOf(r).slots.some((s) => s.role === 'cond'));
});
