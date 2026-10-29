// QR-F3: static deadlock check (tools/analysis/recipe-cycles.mjs), no game needed.
//   - synthetic: a controller researched or built with its own product is a root cycle; a bootstrap recipe breaks it;
//   - the pack: every controller our recipes make is reachable from our own recipes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { deadlocks } from '../lib/recipe_cycles.mjs';
import { packDeadlocks } from '../recipe-cycles.mjs';

const gt = (id, type, items, out, research = []) => ({ id, type, json: {
  inputs: { item: items.map((i) => ({ content: { type: 'gtceu:sized', count: 1, ingredient: { item: i } } })) },
  outputs: { item: [{ content: { type: 'gtceu:sized', count: 1, ingredient: { item: out } } }] },
  recipeConditions: research.length ? [{ type: 'research', researchItems: research.map((r) => ({ item: r })) }] : [],
} });
const dump = (recipes) => ({
  recipes: new Map(recipes.map((r) => [r.id, r])),
  machines: new Map([['gtceu:works', { id: 'gtceu:works', recipeTypes: ['gtceu:works_type'] }]]),
  recipeTypes: new Map([['gtceu:works_type', { id: 'gtceu:works_type' }]]),
  tags: {},
});

test('a controller researched with its own product is a root cycle', () => {
  const r = deadlocks(dump([
    gt('a/works', 'gtceu:assembly_line', ['minecraft:iron_ingot'], 'gtceu:works', ['grindless:widget']),
    gt('b/widget', 'gtceu:works_type', ['minecraft:stone'], 'grindless:widget'),
  ]));
  assert.deepEqual(r.deadMachines, ['gtceu:works']);
  assert.equal(r.cycles.length, 1);
  assert.ok(r.cycles[0].root);
  assert.deepEqual(r.cycles[0].members, ['grindless:widget', 'gtceu:works']);
});

test('an earlier route to the item breaks the cycle; vanilla and GTM ids are assumed obtainable', () => {
  const r = deadlocks(dump([
    gt('a/works', 'gtceu:assembly_line', ['gtceu:iv_machine_hull'], 'gtceu:works', ['grindless:widget']),
    gt('b/widget', 'gtceu:works_type', ['minecraft:stone'], 'grindless:widget'),
    gt('c/widget', 'gtceu:assembler', ['minecraft:stone', 'minecraft:stone'], 'grindless:widget'),
  ]));
  assert.deepEqual(r.deadMachines, []);
  assert.deepEqual(r.cycles, []);
});

test('every controller our recipes make is reachable from our own recipes', { timeout: 900000 }, () => {
  const r = packDeadlocks();
  const roots = r.cycles.filter((c) => c.root).map((c) => c.members.join(' '));
  assert.deepEqual(r.deadMachines, [], `root cycles: ${roots.join(' / ')}; run node tools/analysis/recipe-cycles.mjs`);
});
