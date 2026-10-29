// Recipe twins (QR-F4, docs/quality/lessons.md row 18): GTM's recipe lookup files each recipe under the set of its ingredients,
// counts aside, so two recipes of one type with the same ingredient set collide and one of them can never run (the bench guard
// gg_test_recipe_lookup reports it as shadowed). This catches the collision statically for every recipe our scripts add.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');

// one key per ingredient, without its count; a programmed circuit keeps its configuration in the ingredient
function ingredientKeys(inputs) {
  const keys = new Set();
  for (const e of (inputs && inputs.item) || []) {
    const c = e.content || {};
    keys.add('item ' + JSON.stringify(c.ingredient !== undefined ? c.ingredient : c));
  }
  for (const e of (inputs && inputs.fluid) || []) {
    const c = e.content || {};
    keys.add('fluid ' + JSON.stringify(c.value !== undefined ? c.value : c));
  }
  return [...keys].sort();
}

export function findTwins(recipes) {
  const byKey = new Map();
  for (const r of recipes) {
    if (!r.j || !r.j.inputs) continue;
    const keys = ingredientKeys(r.j.inputs);
    if (keys.length === 0) continue;
    const key = r.t + '|' + keys.join('|');
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(r.i);
  }
  return [...byKey.values()].filter((ids) => new Set(ids).size > 1).map((ids) => [...new Set(ids)].sort());
}

test('findTwins: same type and ingredient set collide whatever the counts; another ingredient or type keeps them apart', () => {
  const sized = (item, count) => ({ content: { type: 'gtceu:sized', count, ingredient: { item } } });
  const fluid = (f, amount) => ({ content: { amount, value: [{ fluid: f }] } });
  const R = (i, t, items, fluids = []) => ({ i, t, j: { inputs: { item: items, fluid: fluids } } });
  const got = findTwins([
    R('a', 'gtceu:assembler', [sized('x:hull', 1), sized('x:cable', 2)], [fluid('x:solder', 144)]),
    R('b', 'gtceu:assembler', [sized('x:cable', 4), sized('x:hull', 1)], [fluid('x:solder', 288)]),
    R('c', 'gtceu:assembler', [sized('x:hull', 1), sized('x:cable', 2), sized('x:coil', 1)], [fluid('x:solder', 144)]),
    R('d', 'gtceu:assembly_line', [sized('x:hull', 1), sized('x:cable', 2)], [fluid('x:solder', 144)]),
    R('e', 'gtceu:assembler', [sized('x:hull', 1), sized('x:cable', 2)], [fluid('x:lubricant', 144)]),
  ]);
  assert.deepEqual(got, [['a', 'b']]);
});

test('no two recipes of one type share an ingredient set (GTM lookup would shadow one)', () => {
  const run = runPackScripts(pack);
  const twins = findTwins(run.docs.recipes.recipes);
  assert.deepEqual(twins, [], twins.map((ids) => ids.join(' = ')).join('\n'));
});
