// Tests for the engine: minimum reach, grounded sustainability, and blocking costs.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { blockCosts, Graph, groundedSustain, lfp } from '../lib/engine.mjs';

/** rules: [{name, slots:[{alts:[keys], cap?, tol?}], outs:[keys]}] */
function build(rules) {
  const g = new Graph();
  for (const r of rules) {
    g.addRule({
      name: r.name,
      kind: 'recipe',
      type: 't',
      slots: r.slots.map((s) => ({ alts: s.alts.map((a) => g.key(a)), cap: !!s.cap, tol: !!s.tol, label: s.alts.join('|'), role: 'input' })),
      outs: r.outs.map((o) => g.key(o)),
      meta: {},
    });
  }
  g.finalize();
  return g;
}
const set = (g, names) => {
  const a = new Uint8Array(g.nKeys);
  for (const n of names) a[g.key(n)] = 1;
  return a;
};
const ids = (g, names) => names.map((n) => g.key(n));
const has = (g, arr, n) => arr[g.key(n)] === 1;

test('lfp: a rule fires once every slot has some alternative reached', () => {
  const g = build([
    { name: 'r1', slots: [{ alts: ['a'] }], outs: ['b'] },
    { name: 'r2', slots: [{ alts: ['b'] }, { alts: ['c', 'a'] }], outs: ['d'] },
    { name: 'r3', slots: [{ alts: ['b'] }, { alts: ['c'] }], outs: ['e'] },
  ]);
  const r = lfp(g, { facts: ids(g, ['a']) });
  assert.ok(has(g, r.reached, 'b'));
  assert.ok(has(g, r.reached, 'd'));
  assert.ok(!has(g, r.reached, 'e'));
  assert.equal(r.level[g.key('d')], 2);
});

test('lfp: capital slots are only met with capOk, and tolerant ones with tolOk', () => {
  const g = build([
    { name: 'r', slots: [{ alts: ['a'] }, { alts: ['hammer'], cap: true }, { alts: ['fuel'], tol: true }], outs: ['x'] },
  ]);
  const base = { facts: ids(g, ['a']) };
  assert.ok(!has(g, lfp(g, base).reached, 'x'));
  assert.ok(!has(g, lfp(g, { ...base, capOk: set(g, ['hammer']) }).reached, 'x'));
  assert.ok(has(g, lfp(g, { ...base, capOk: set(g, ['hammer']), tolOk: set(g, ['fuel']) }).reached, 'x'));
});

test('lfp: a cycle with no input is never reached', () => {
  const g = build([
    { name: 'a->b', slots: [{ alts: ['a'] }], outs: ['b'] },
    { name: 'b->a', slots: [{ alts: ['b'] }], outs: ['a'] },
  ]);
  const r = lfp(g, { facts: [] });
  assert.ok(!has(g, r.reached, 'a'));
});

test('groundedSustain: the compress/decompress cycle enters the gfp but not grounded sustainability', () => {
  const g = build([
    { name: 'compress', slots: [{ alts: ['dust'] }], outs: ['block'] },
    { name: 'decompress', slots: [{ alts: ['block'] }], outs: ['dust'] },
  ]);
  const universe = set(g, ['dust', 'block']);
  const permanent = new Uint8Array(g.nKeys);
  const r = groundedSustain(g, { universe, capOk: new Uint8Array(g.nKeys), permanent });
  assert.ok(has(g, r.S.inS, 'dust'), 'the gfp accepts the cycle');
  assert.ok(!has(g, r.G.reached, 'dust'), 'but it has no ground');
  assert.ok(!has(g, r.G.reached, 'block'));
});

test('groundedSustain: a bootstrap loop (steam -> drill -> coal -> boiler -> steam) is sustained with a source', () => {
  const g = build([
    { name: 'drill', slots: [{ alts: ['steam'], tol: true }, { alts: ['bit'], tol: true }, { alts: ['sample'], cap: true }], outs: ['ore', 'coal'] },
    { name: 'boiler', slots: [{ alts: ['coal'] }, { alts: ['water'] }], outs: ['steam'] },
    { name: 'forge-bit', slots: [{ alts: ['ore'] }], outs: ['bit'] },
    { name: 'pump', slots: [], outs: ['water'] },
  ]);
  const everything = set(g, ['steam', 'bit', 'sample', 'ore', 'coal', 'water']);
  const r = groundedSustain(g, { universe: everything, capOk: set(g, ['sample']), permanent: new Uint8Array(g.nKeys) });
  for (const n of ['water', 'coal', 'steam', 'ore', 'bit']) assert.ok(has(g, r.G.reached, n), n);
});

test('groundedSustain: if the fuel source is missing, the bootstrap loop isn\'t sustained', () => {
  const g = build([
    { name: 'drill', slots: [{ alts: ['steam'], tol: true }, { alts: ['sample'], cap: true }], outs: ['ore'] },
    { name: 'boiler', slots: [{ alts: ['coal'] }, { alts: ['water'] }], outs: ['steam'] },
    { name: 'pump', slots: [], outs: ['water'] },
  ]);
  // coal only exists as a bootstrap reserve: it's in the universe, but nothing resupplies it
  const universe = set(g, ['steam', 'sample', 'ore', 'coal', 'water']);
  const r = groundedSustain(g, { universe, capOk: set(g, ['sample']), permanent: new Uint8Array(g.nKeys) });
  assert.ok(!has(g, r.G.reached, 'coal'));
  assert.ok(!has(g, r.G.reached, 'steam'));
  assert.ok(!has(g, r.G.reached, 'ore'));
  assert.ok(has(g, r.G.reached, 'water'));
});

test('blockCosts: picks the cheapest blocking chain and tells roots apart', () => {
  const g = build([
    { name: 'expensive', slots: [{ alts: ['a'] }, { alts: ['b'] }, { alts: ['c'] }], outs: ['x'] },
    { name: 'cheap', slots: [{ alts: ['d'] }], outs: ['x'] },
  ]);
  const mask = new Uint8Array(g.nKeys);
  const { cost, best } = blockCosts(g, { mask });
  assert.equal(cost[g.key('x')], 2);
  assert.equal(g.rules[best[g.key('x')]].name, 'cheap');
  const rootCost = (k) => (g.producers(k).length > 0 ? Infinity : g.keyNames[k] === 'd' ? 10 : 1);
  const withRootCost = blockCosts(g, { mask, rootCost });
  assert.equal(g.rules[withRootCost.best[g.key('x')]].name, 'expensive');
});

test('blockCosts: what\'s already held costs 0, and met capital slots don\'t count', () => {
  const g = build([{ name: 'r', slots: [{ alts: ['a'] }, { alts: ['h'], cap: true }], outs: ['x'] }]);
  const mask = set(g, ['a']);
  const withoutCap = blockCosts(g, { mask });
  const withCap = blockCosts(g, { mask, capMask: set(g, ['h']) });
  assert.equal(withoutCap.cost[g.key('x')], 2);
  assert.equal(withCap.cost[g.key('x')], 1);
});
