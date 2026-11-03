// A1a-08: script-added chemical reactor recipes get GTM's runtime large chemical reactor copy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkDump, gt, gi } from './helpers.mjs';

const CR = 'gtceu:chemical_reactor';
const LCR = 'gtceu:large_chemical_reactor';
const typeOf = (dump, id) => dump.recipes.find((r) => r.id === id)?.type;

test('an added chemical reactor recipe gets a large chemical reactor copy', () => {
  const r = gt('grindless:chemical_reactor/foo', CR, { ins: [gi('minecraft:coal')], outs: [gi('minecraft:diamond')] });
  r.added = true;
  const dump = mkDump({ recipes: [r] });
  assert.equal(dump.runtimeLcr, 1);
  assert.equal(typeOf(dump, 'grindless:large_chemical_reactor/foo'), LCR);
});

test('no second copy when the script already added one', () => {
  const a = gt('grindless:chemical_reactor/foo', CR, { ins: [gi('minecraft:coal')], outs: [gi('minecraft:diamond')] });
  a.added = true;
  const b = gt('grindless:large_chemical_reactor/foo', LCR, { ins: [gi('minecraft:coal')], outs: [gi('minecraft:diamond')] });
  b.added = true;
  const dump = mkDump({ recipes: [a, b] });
  assert.equal(dump.runtimeLcr, 0);
  assert.equal(dump.recipes.filter((r) => r.type === LCR).length, 1);
});

test('base-game chemical reactor recipes are not copied', () => {
  const r = gt('gtceu:chemical_reactor/bar', CR, { ins: [gi('minecraft:coal')], outs: [gi('minecraft:diamond')] });
  const dump = mkDump({ recipes: [r] });
  assert.equal(dump.runtimeLcr, 0);
});
