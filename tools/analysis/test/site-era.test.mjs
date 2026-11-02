// M9-04: a tier's `kind: "site"` check scopes a recipe by its own era (voltage and multiblock type), never by the dimension under
// test, so a low-era recipe that acquires a later-era dimension is an offender (the old check skipped it as "a later era's row").
// gcyr:luna is an EV dimension, gcyr:mercury an IV one, gcyr:mercury_orbit a UHV one (pack startup scripts).
import test from 'node:test';
import assert from 'node:assert/strict';
import { gt, gi, mkDump, run, verdicts } from './helpers.mjs';

const dim = (d, reverse) => ({ type: 'dimension', dimension: d, ...(reverse ? { reverse: true } : {}) });
const LUNA = 'gcyr:luna';
const MERCURY = 'gcyr:mercury';
const LATER = 'gcyr:mercury_orbit';

function pack(tier, targets, extra = []) {
  const recipes = [
    gt('t:swarm/base', 't:swarm', { ins: [gi('t:dust')], conditions: [dim(LUNA)] }),
    ...extra,
  ];
  return run(mkDump({ recipes }), { tier, eraOrder: ['steam', 'lv'], machines: [], targets });
}

const site = (id, o = {}) => ({ id, kind: 'site', type: 't:swarm', dimensions: [LUNA], ...o });
const textOf = (r, id) => r.out.gate.find((x) => x.target.id === id).lines.join('\n');

test('site era: a clean site passes', () => {
  assert.deepEqual(verdicts(pack('iv', [site('s')]).out.gate), { s: 'PASS' });
});

test('site era (mutation): an EV recipe that acquires a UHV dimension fails, in any tier', () => {
  const extra = [gt('t:swarm/later', 't:swarm', { ins: [gi('t:dust')], eut: 512, conditions: [dim(LATER)] })];
  for (const tier of ['iv', 'uhv']) {
    const r = pack(tier, [site('s')], extra);
    assert.equal(r.out.gate.find((x) => x.target.id === 's').verdict, 'FAIL', tier);
    assert.ok(/t:swarm\/later: also runs in gcyr:mercury_orbit/.test(textOf(r, 's')), textOf(r, 's'));
  }
});

test('site era: exceptRecipes names a deliberate later extension and passes it', () => {
  const extra = [gt('t:swarm/later', 't:swarm', { ins: [gi('t:dust')], eut: 512, conditions: [dim(LATER)] })];
  const r = pack('iv', [site('s', { exceptRecipes: ['t:swarm/later'] })], extra);
  assert.deepEqual(verdicts(r.out.gate), { s: 'PASS' });
});

test('site era: a mixed row, an unconditioned row and a reversed condition are offenders', () => {
  const extra = [
    gt('t:swarm/same', 't:swarm', { ins: [gi('t:dust')], conditions: [dim(LUNA), dim(MERCURY)] }),
    gt('t:swarm/anywhere', 't:swarm', { ins: [gi('t:dust')] }),
    gt('t:swarm/not', 't:swarm', { ins: [gi('t:dust')], conditions: [dim(LUNA, true)] }),
  ];
  const text = textOf(pack('iv', [site('s')], extra), 's');
  assert.ok(/t:swarm\/same: also runs in gcyr:mercury/.test(text), text);
  assert.ok(/t:swarm\/anywhere: no dimension condition/.test(text), text);
  assert.ok(/t:swarm\/not: a reversed condition/.test(text), text);
});

test('site era: with exact, a row missing a dimension fails and a later dimension is not forgiven', () => {
  const extra = [
    gt('t:swarm/pair', 't:swarm', { ins: [gi('t:dust')], conditions: [dim(LUNA), dim(MERCURY)] }),
    gt('t:swarm/later', 't:swarm', { ins: [gi('t:dust')], conditions: [dim(LATER)] }),
  ];
  const text = textOf(pack('iv', [site('e', { exact: true, dimensions: [LUNA, MERCURY] })], extra), 'e');
  assert.ok(/t:swarm\/base: doesn't run in gcyr:mercury/.test(text), text);
  assert.ok(/t:swarm\/later: also runs in gcyr:mercury_orbit/.test(text), text);
});

test('site era: a row of a later voltage at a wrong site is skipped; the same site at a same-era voltage is an offender', () => {
  const extra = [
    gt('t:swarm/big', 't:swarm', { ins: [gi('t:dust')], eut: 2000000000, conditions: [dim(MERCURY)] }),
    gt('t:swarm/small', 't:swarm', { ins: [gi('t:dust')], eut: 8192, conditions: [dim(MERCURY)] }),
  ];
  const text = textOf(pack('iv', [site('s')], extra), 's');
  assert.ok(!/t:swarm\/big/.test(text), text);
  assert.ok(/t:swarm\/small: also runs in gcyr:mercury/.test(text), text);
});