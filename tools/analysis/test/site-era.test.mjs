// RF-3T: a tier's `kind: "site"` check ignores dimensions first named by a later era's startup folder (lib/era.mjs).
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
    gt('t:swarm/later', 't:swarm', { ins: [gi('t:dust')], conditions: [dim(LATER)] }),
    gt('t:swarm/both', 't:swarm', { ins: [gi('t:dust')], conditions: [dim(LUNA), dim(LATER)] }),
    ...extra,
  ];
  return run(mkDump({ recipes }), { tier, eraOrder: ['steam', 'lv'], machines: [], targets });
}

const site = (id, o = {}) => ({ id, kind: 'site', type: 't:swarm', dimensions: [LUNA], ...o });

test('site era: a row at a later-era dimension is not an offender, in a tier before that era', () => {
  const r = pack('iv', [site('s')]);
  assert.deepEqual(verdicts(r.out.gate), { s: 'PASS' });
});

test('site era: the same rows fail in the tier of that era or after (the dimension is reached by then)', () => {
  const r = pack('uhv', [site('s')]);
  const res = r.out.gate.find((x) => x.target.id === 's');
  assert.equal(res.verdict, 'FAIL');
  const text = res.lines.join('\n');
  assert.ok(/t:swarm\/later: also runs in gcyr:mercury_orbit/.test(text), text);
});

test('site era: an earlier or same-era extra dimension, an unconditioned row and a reversed condition stay offenders', () => {
  const extra = [
    gt('t:swarm/same', 't:swarm', { ins: [gi('t:dust')], conditions: [dim(LUNA), dim(MERCURY)] }),
    gt('t:swarm/anywhere', 't:swarm', { ins: [gi('t:dust')] }),
    gt('t:swarm/not', 't:swarm', { ins: [gi('t:dust')], conditions: [dim(LUNA, true)] }),
  ];
  const r = pack('iv', [site('s')], extra);
  const text = r.out.gate.find((x) => x.target.id === 's').lines.join('\n');
  assert.ok(/t:swarm\/same: also runs in gcyr:mercury/.test(text), text);
  assert.ok(/t:swarm\/anywhere: no dimension condition/.test(text), text);
  assert.ok(/t:swarm\/not: a reversed condition/.test(text), text);
  assert.ok(!/t:swarm\/(later|both)/.test(text), text);
});

test('site era: with exact, a row naming only later-era dimensions is skipped and a row missing a dimension still fails', () => {
  const ok = pack('iv', [site('e', { exact: true, dimensions: [LUNA, MERCURY] })], [
    gt('t:swarm/pair', 't:swarm', { ins: [gi('t:dust')], conditions: [dim(LUNA), dim(MERCURY)] }),
  ]);
  const text = ok.out.gate.find((x) => x.target.id === 'e').lines.join('\n');
  assert.ok(!/t:swarm\/later/.test(text), text);
  assert.ok(/t:swarm\/base: doesn't run in gcyr:mercury/.test(text), text);
  assert.ok(/t:swarm\/both: doesn't run in gcyr:mercury/.test(text), 'a mixed row is not only later-era');
});
