// Rate cards (pl-lib.mjs: R.rate, R.cmp, R.ratio, checkRate): the card passes against its recipe, and every stale number is caught.
import test from 'node:test';
import assert from 'node:assert/strict';
import { R, checkRate, rateOf, perUnit, ratioOf, voltage, rateText } from '../processing-lines/pl-lib.mjs';

const item = (key, count, chance = 1) => ({ key, count, chance });
const fluid = (id, count) => ({ alts: ['fluid:' + id], tags: [], count, cap: false, consume: 1, label: id });
const dust = (id, count, consume = 1) => ({ alts: [id], tags: [], count, cap: false, consume, label: id });
const RECS = new Map([
  ['t:cook', { id: 't:cook', inputs: [fluid('gtceu:steam', 1000), dust('gtceu:coal_dust', 2), dust('t:cat', 1, 0.05)], outputs: [item('fluid:gtceu:hydrogen', 4000), item('gtceu:ash_dust', 1, 0.1)], eut: 480, duration: 100 }],
  ['t:alt', { id: 't:alt', inputs: [fluid('gtceu:heavy_fuel', 1000), fluid('gtceu:steam', 2000)], outputs: [item('fluid:gtceu:hydrogen', 6000)], eut: 480, duration: 100 }],
  ['t:mk', { id: 't:mk', inputs: [fluid('t:feed', 100)], outputs: [item('fluid:t:mid', 500)], eut: 30, duration: 50 }],
  ['t:use', { id: 't:use', inputs: [fluid('t:mid', 1000)], outputs: [item('t:thing', 1)], eut: 30, duration: 200 }],
]);
const get = (id) => RECS.get(id);
const CAP = { file: 'x.js', re: 'MAX_PARALLEL' };
const src = (s) => (s.re === 'MAX_PARALLEL' ? 8 : null);

const goodRate = () => R.rate('t:cook', { tier: 'hv' }, {
  eut: 480, ticks: 100, ins: { 'fluid:gtceu:steam': 12000, 't:cat': 0.6 }, outs: { 'fluid:gtceu:hydrogen': 48000, 'gtceu:ash_dust': 1.2 }, hatch: { 'fluid:gtceu:steam': 1000 },
});

test('a correct rate card passes and reports its source', () => {
  const r = checkRate(goodRate(), get, src);
  assert.equal(r.ok, true, r.why);
});

test('rateOf counts chanced outputs and chanced inputs as expected values', () => {
  const r = rateOf(RECS.get('t:cook'));
  assert.equal(r.out['gtceu:ash_dust'], 1.2);
  assert.equal(r.in['t:cat'], 0.6);
});

test('mutation: a stale quantity, duration, EU/t or buffer is caught', () => {
  const cases = [
    [{ outs: { 'fluid:gtceu:hydrogen': 40000 } }, /makes/],
    [{ ins: { 'fluid:gtceu:steam': 6000 } }, /takes/],
    [{ ticks: 60 }, /t per run/],
    [{ eut: 120 }, /EU\/t/],
    [{ hatch: { 'fluid:gtceu:steam': 2000 } }, /holds per run/],
    [{ ins: { 't:cat': 0.5 } }, /takes/],
  ];
  for (const [patch, re] of cases) {
    const r = checkRate({ ...goodRate(), ...patch }, get, src);
    assert.equal(r.ok, false, JSON.stringify(patch));
    assert.match(r.why, re);
  }
});

test('a recipe that moved under the card is caught', () => {
  const moved = new Map(RECS);
  moved.set('t:cook', { ...RECS.get('t:cook'), duration: 120 });
  assert.equal(checkRate(goodRate(), (id) => moved.get(id), src).ok, false);
  assert.equal(checkRate(goodRate(), () => undefined, src).ok, false);
});

test('the profile must fit the hatch voltage', () => {
  assert.equal(voltage('hv'), 512);
  const over = { ...goodRate(), tier: 'mv', eut: 480 };
  assert.match(checkRate(over, get, src).why, /carries 128/);
  const oc = R.rate('t:cook', { tier: 'hv', oc: 1 }, { eut: 1920, ticks: 50, outs: {} });
  assert.match(checkRate(oc, get, src).why, /needs 1920/);
  const amps = R.rate('t:cook', { tier: 'hv', oc: 1, amps: 4 }, { eut: 1920, ticks: 50, outs: { 'fluid:gtceu:hydrogen': 96000 } });
  assert.equal(checkRate(amps, get, src).ok, true);
});

test('overclock halves the time and quadruples the power; an odd time cannot overclock', () => {
  const r = rateOf(RECS.get('t:cook'), { oc: 2 });
  assert.deepEqual([r.ticks, r.eut], [25, 7680]);
  assert.throws(() => rateOf({ ...RECS.get('t:cook'), duration: 50 }, { oc: 2 }), /whole tick/);
});

test('parallels multiply amounts and power, not time, and need a named cap', () => {
  const par = (n, parSrc) => R.rate('t:cook', { tier: 'iv', par: n, parSrc }, { eut: 480 * n, ticks: 100, outs: { 'fluid:gtceu:hydrogen': 48000 * n } });
  assert.equal(checkRate(par(4, CAP), get, src).ok, true);
  assert.match(checkRate(par(4), get, src).why, /parSrc/);
  assert.match(checkRate(par(16, CAP), get, src).why, /over the cap 8/);
  assert.match(checkRate(par(4, { file: 'x.js', re: 'GONE' }), get, src).why, /parSrc/);
});

const route = (label, recipe, perMin, eu, ins, out) => ({ label, recipe, perMin, eu, ins, out });
const goodCmp = (extra = {}) => R.cmp('fluid:gtceu:hydrogen', 1000, 'Hydrogen', { tier: 'hv' }, [
  route('Coal', 't:cook', 48000, 12000, { 'fluid:gtceu:steam': 250 }, { 'gtceu:ash_dust': 0.03 }),
  route('Oil', 't:alt', 72000, 8000, { 'fluid:gtceu:heavy_fuel': 166.67, 'fluid:gtceu:steam': 333.33 }, {}),
], extra);

test('a route comparison is checked per unit under one profile', () => {
  assert.equal(checkRate(goodCmp(), get, src).ok, true);
  const bad = goodCmp();
  bad.routes[1].eu = 9000;
  assert.match(checkRate(bad, get, src).why, /EU per 1000/);
  const fuel = goodCmp();
  fuel.routes[1].ins = { 'fluid:gtceu:heavy_fuel': 200, 'fluid:gtceu:steam': 333.33 };
  assert.match(checkRate(fuel, get, src).why, /heavy_fuel/);
});

test('a route that wins on every cost must be declared as a dominance (a balance decision)', () => {
  const dom = R.cmp('fluid:gtceu:hydrogen', 1000, 'Hydrogen', { tier: 'hv' }, [
    route('Coal', 't:cook', 48000, 12000, { 'fluid:gtceu:steam': 250 }, {}),
    route('Oil', 't:alt', 72000, 8000, { 'fluid:gtceu:steam': 333.33 }, {}),
  ]);
  assert.equal(checkRate(dom, get, src).ok, true, 'neither route dominates: oil takes more steam per unit than coal does');
  const forced = { ...dom, dominates: [['Oil', 'Coal']] };
  assert.match(checkRate(forced, get, src).why, /dominance/);
});

test('an undeclared dominance fails the card', () => {
  const same = (id) => ({ ...RECS.get('t:cook'), id });
  const recs = new Map([['a', same('a')], ['b', { ...same('b'), eut: 960 }]]);
  const c = R.cmp('fluid:gtceu:hydrogen', 1000, 'x', { tier: 'ev' }, [
    route('A', 'a', 48000, 12000, { 'fluid:gtceu:steam': 250 }, { 'gtceu:ash_dust': 0.03 }),
    route('B', 'b', 48000, 24000, { 'fluid:gtceu:steam': 250 }, { 'gtceu:ash_dust': 0.03 }),
  ]);
  const r = checkRate(c, (id) => recs.get(id), src);
  assert.match(r.why || '', /dominance on cost alone is A>B/);
  assert.equal(checkRate({ ...c, dominates: [['A', 'B']] }, (id) => recs.get(id), src).ok, true);
});

test('machine ratio: whole machine counts that balance producer and consumer flows', () => {
  const p = { recipe: 't:mk', tier: 'mv' };
  const c = { recipe: 't:use', tier: 'mv' };
  const r = ratioOf(get('t:mk'), get('t:use'), 'fluid:t:mid');
  assert.equal(r.make, 12000);
  assert.equal(r.take, 6000);
  assert.deepEqual([r.n, r.m], [1, 2]);
  const ok = R.ratio(p, c, 'fluid:t:mid', 1, 2, { make: 12000, take: 6000 });
  assert.equal(checkRate(ok, get, src).ok, true);
  assert.match(checkRate({ ...ok, n: 1, m: 1 }, get, src).why, /1 producers to 2 consumers/);
  assert.match(checkRate({ ...ok, make: 6000 }, get, src).why, /makes 12000/);
  assert.match(checkRate({ ...ok, take: 12000 }, get, src).why, /takes 6000/);
  assert.match(checkRate({ ...ok, cons: { recipe: 't:cook', tier: 'hv' } }, get, src).why, /does not consume/);
});

test('perUnit is the cost of one unit of a product, with the rest of the flow', () => {
  const u = perUnit(get('t:cook'), 'fluid:gtceu:hydrogen', 1000);
  assert.equal(u.eu, 12000);
  assert.equal(u.in['fluid:gtceu:steam'], 250);
  assert.equal(u.out['gtceu:ash_dust'], 0.03);
});

test('the card text is built from the checked claims', () => {
  const t = rateText(goodRate());
  assert.match(t, /HV, 480 EU\/t, 100 t per run/);
  assert.match(t, /48,000 mB hydrogen/);
  assert.match(t, /12,000 mB steam, 0.6 cat in/);
  assert.match(rateText(goodCmp()), /Coal: 48,000\/min, 12,000 EU/);
  assert.ok(t.split(/\s+/).length <= 70, 'one card fits a chart node');
});
