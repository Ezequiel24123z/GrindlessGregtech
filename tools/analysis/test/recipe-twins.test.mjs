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

// GTM 7.5.3 RecipeDB.addRecursive files a recipe as a path of ingredient nodes; a recipe whose path is a strict prefix of another's
// is dropped ("failed to add recipe from staging into lookup DB"). The path order is capability blocks from an identity-hashed map
// (items-first or fluids-first, per JVM) and the fluid order inside a block is unreliable; only the declared item order is.
// So A is a hazard against B (same type) when A's ingredients are a strict subset of B's and either block order could make A's
// path a prefix of B's.
function orderedIngredients(inputs) {
  const items = [];
  for (const e of (inputs && inputs.item) || []) {
    const c = e.content || {};
    const k = 'item ' + JSON.stringify(c.ingredient !== undefined ? c.ingredient : c);
    if (!items.includes(k)) items.push(k);
  }
  const fluids = new Set();
  for (const e of (inputs && inputs.fluid) || []) {
    const c = e.content || {};
    fluids.add('fluid ' + JSON.stringify(c.value !== undefined ? c.value : c));
  }
  return { items, fluids };
}

const isPrefix = (a, b) => a.length <= b.length && a.every((k, i) => b[i] === k);
const isSubset = (a, b) => [...a].every((k) => b.has(k));
const sameList = (a, b) => a.length === b.length && isPrefix(a, b);

// returns [[shadowedCandidate, other], ...] ids sorted by pair
export function findPrefixHazards(recipes) {
  const byType = new Map();
  for (const r of recipes) {
    if (!r.j || !r.j.inputs) continue;
    const ing = orderedIngredients(r.j.inputs);
    if (ing.items.length + ing.fluids.size === 0) continue;
    if (!byType.has(r.t)) byType.set(r.t, []);
    byType.get(r.t).push({ id: r.i, ...ing });
  }
  const pairs = [];
  for (const list of byType.values()) {
    for (const a of list) {
      for (const b of list) {
        if (a.id === b.id) continue;
        if (!isSubset(a.items, new Set(b.items)) || !isSubset(a.fluids, b.fluids)) continue;
        if (a.items.length + a.fluids.size >= b.items.length + b.fluids.size) continue;
        const itemsFirst = a.fluids.size === 0 ? isPrefix(a.items, b.items) : sameList(a.items, b.items) && isSubset(a.fluids, b.fluids);
        const fluidsFirst = a.items.length === 0 ? isSubset(a.fluids, b.fluids) : a.fluids.size === b.fluids.size && isSubset(a.fluids, b.fluids) && isPrefix(a.items, b.items);
        if (itemsFirst || fluidsFirst) pairs.push([a.id, b.id]);
      }
    }
  }
  const seen = new Set();
  return pairs
    .filter((p) => !seen.has(p.join('|')) && seen.add(p.join('|')))
    .sort((x, y) => (x[0] + '|' + x[1]).localeCompare(y[0] + '|' + y[1]));
}

test('findPrefixHazards: strict prefixes are flagged, incomparable sets and other types are not', () => {
  const item = (i, count = 1) => ({ content: { type: 'gtceu:sized', count, ingredient: { item: i } } });
  const fluid = (f, amount = 100) => ({ content: { amount, value: [{ fluid: f }] } });
  const R = (i, t, items, fluids = []) => ({ i, t, j: { inputs: { item: items, fluid: fluids } } });
  const T = 'gtceu:greenhouse';
  const got = findPrefixHazards([
    // fluid-only extension of the same items (the lv/mv greenhouse pair)
    R('a', T, [item('x:fert'), item('x:plant'), item('x:c2')], [fluid('x:water')]),
    R('b', T, [item('x:fert'), item('x:plant'), item('x:c2')], [fluid('x:water'), fluid('x:co2')]),
    // different circuit: incomparable
    R('c', T, [item('x:fert'), item('x:plant'), item('x:c4')], [fluid('x:water'), fluid('x:co2')]),
    // item prefix with the same fluids
    R('d', T, [item('x:pearl')], [fluid('x:he3')]),
    R('e', T, [item('x:pearl'), item('x:c1')], [fluid('x:he3')]),
    // item subset that is not a declared prefix, no fluids: items-first cannot be a prefix, fluids-first needs no fluids in B
    R('f', T, [item('x:b')]),
    R('g', T, [item('x:a'), item('x:b')]),
    // another type is never compared
    R('h', 'gtceu:assembler', [item('x:pearl'), item('x:c1')], [fluid('x:he3')]),
  ]);
  assert.deepEqual(got, [['a', 'b'], ['d', 'e']]);
});

test('no recipe of ours is a strict prefix of another of its type (GTM lookup would drop one, whatever the JVM)', () => {
  const run = runPackScripts(pack);
  const hazards = findPrefixHazards(run.docs.recipes.recipes);
  assert.deepEqual(hazards, [], hazards.length + ' pair(s):\n' + hazards.slice(0, 20).map((p) => p.join(' < ')).join('\n'));
});
