import test from 'node:test';
import assert from 'node:assert/strict';
import { solveCosts, summarize, EU_KEY } from '../lib/cost.mjs';

const item = (key, count = 1, extra = {}) => ({ alts: [key], count, cap: false, consume: 1, ...extra });
const out = (key, count = 1, chance = 1) => ({ key, count, chance });
const rec = (id, inputs, outputs, extra = {}) => ({ id, inputs, outputs, eut: 0, amp: 1, duration: 0, ...extra });
const base = (set) => (k) => set.includes(k);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test('a chain expands to base resources and divides by the output count', () => {
  const m = solveCosts(
    [
      rec('plate', [item('ingot', 2)], [out('plate', 1)]),
      rec('ingot', [item('ore', 1)], [out('ingot', 2)]),
      rec('gear', [item('plate', 4), item('fluid:oil', 500)], [out('gear', 1)]),
    ],
    { isBase: base(['ore', 'fluid:oil']) },
  );
  const v = m.vector('gear');
  near(v.get('ore'), 4);
  near(v.get('fluid:oil'), 500);
  const s = summarize(v, {});
  near(s.items, 4);
  near(s.fluidL, 0.5);
  near(s.score, 4.5);
});

test('a cycle terminates, picks the cheaper way out and is reported when cut', () => {
  const m = solveCosts(
    [
      rec('a-from-b', [item('b')], [out('a')]),
      rec('b-from-a', [item('a')], [out('b')]),
      rec('a-from-ore', [item('ore', 3)], [out('a')]),
    ],
    { isBase: base(['ore']) },
  );
  assert.ok(m.converged);
  near(m.vector('a').get('ore'), 3);
  near(m.vector('b').get('ore'), 3);
  assert.equal(m.cuts.size, 0);
  const loop = solveCosts([rec('x', [item('y')], [out('x')]), rec('y', [item('x')], [out('y')])], {});
  assert.equal(loop.vector('x'), null);
  assert.equal(loop.reachable('y'), false);
});

test('chanced outputs cost their expected yield, with a setting to ignore the chance', () => {
  const recipes = [rec('r', [item('ore', 2)], [out('gem', 1, 0.25)])];
  near(solveCosts(recipes, { isBase: base(['ore']) }).vector('gem').get('ore'), 8);
  near(solveCosts(recipes, { isBase: base(['ore']), chance: 'full' }).vector('gem').get('ore'), 2);
  assert.equal(solveCosts(recipes, { isBase: base(['ore']), chance: 'guaranteed' }).vector('gem'), null);
});

test('non-consumed inputs, programmed circuits and tools are free; catalysts cost their expected use', () => {
  const m = solveCosts(
    [
      rec(
        'r',
        [
          item('ore', 1),
          item('mold', 1, { cap: true, consume: 0 }),
          { alts: ['gtceu:programmed_circuit'], count: 1, cap: true, consume: 0, circuit: 3 },
          item('bit', 1, { cat: true, consume: 0.1 }),
        ],
        [out('part', 1)],
      ),
    ],
    { isBase: base(['ore', 'mold', 'bit']) },
  );
  const v = m.vector('part');
  near(v.get('ore'), 1);
  near(v.get('bit'), 0.1);
  assert.equal(v.has('mold'), false);
  assert.equal(v.has('gtceu:programmed_circuit'), false);
});

test('tag inputs take the cheapest alternative; byproducts share the cost by output units', () => {
  const m = solveCosts(
    [
      rec('cheap', [item('lead')], [out('dust', 1)]),
      rec('pricey', [item('gold', 1)], [out('pdust', 1)]),
      rec('use', [{ alts: ['pdust', 'dust'], count: 2, cap: false, consume: 1 }], [out('part', 1)]),
      rec('split', [item('ore', 6)], [out('main', 1), out('side', 2)]),
    ],
    { isBase: base(['lead', 'gold', 'ore']), weight: (k) => (k === 'gold' ? 10 : 1) },
  );
  near(m.vector('part').get('lead'), 2);
  near(m.vector('main').get('ore'), 2);
  const primary = solveCosts([rec('split', [item('ore', 6)], [out('main', 1), out('side', 2)])], { isBase: base(['ore']), allocation: 'primary' });
  near(primary.vector('main').get('ore'), 6);
  assert.equal(primary.vector('side'), null);
});

test('source recipes make base resources, EU is tracked and free resources stay out of the score', () => {
  const m = solveCosts(
    [
      rec('collector', [], [out('fluid:air', 1000)], { eut: 8, duration: 100 }),
      rec('compress', [item('fluid:air', 2000), item('ore', 1)], [out('part', 1)], { eut: 32, amp: 2, duration: 10 }),
    ],
    { isBase: base(['ore']), weight: (k) => (k === 'fluid:air' ? 0 : 1) },
  );
  const v = m.vector('part');
  near(v.get('fluid:air'), 2000);
  near(v.get(EU_KEY), 640);
  const s = summarize(v, { weight: (k) => (k === 'fluid:air' ? 0 : 1) });
  near(s.score, 1);
  near(s.freeFluidL, 2);
  assert.equal(s.top[0].key, 'ore');
});
