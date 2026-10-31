import test from 'node:test';
import assert from 'node:assert/strict';
import { lineSteps, collectLines, usedBy, findDuplicates, judge, toCsv, eraSummary, loadKeyItems } from '../line-audit.mjs';

const n = (key, kind, res, from = [], extra = {}) => ({ key, kind, res, from, cluster: 'a', ...extra });
const chain = () => [
  n('r', 'raw', 'gtceu:ore'),
  n('m1', 'machine', null, ['r'], { item: 'gtceu:macerator' }),
  n('d', 'item', 'gtceu:dust', ['m1']),
  n('m2', 'machine', null, ['d'], { item: 'gtceu:ebf' }),
  n('i', 'item', 'gtceu:ingot', ['m2']),
  n('p', 'product', 'gtceu:plate', ['i']),
];

test('lineSteps counts machines and machine-less crafts, not machine outputs or raws', () => {
  assert.equal(lineSteps(chain()), 3);
  assert.equal(lineSteps([n('r', 'raw', 'x'), n('a', 'item', 'y', ['r'])]), 1);
  assert.equal(lineSteps([n('r', 'raw', 'x')]), 0);
});

const model = {
  chapters: [
    { file: 'pl_lv', clusters: { a: { name: 'Alpha' } }, nodes: chain() },
    {
      file: 'pl_iv',
      clusters: { a: { name: 'Beta' } },
      nodes: [n('lk', 'item', null, [], { link: true, target: { chapter: 'pl_lv', cluster: 'a' } }), n('o', 'product', 'gtceu:thing', ['lk'])],
    },
    { file: 'quests_other', clusters: {}, nodes: [n('z', 'item', 'q')] },
  ],
};

test('collectLines reads era lines, crossings with reach back and main products', () => {
  const lines = collectLines(model);
  assert.deepEqual(lines.map((l) => l.id), ['lv.a', 'iv.a']);
  assert.equal(lines[0].steps, 3);
  assert.deepEqual(lines[0].products.map((p) => p.res), ['gtceu:plate']);
  assert.equal(lines[1].crossings[0].back, 4);
  assert.equal(lines[1].crossings[0].era, 'lv');
});

test('usedBy links a line to the lines crossing into it', () => {
  const lines = collectLines(model);
  assert.deepEqual([...usedBy(lines).get('lv.a')], ['iv.a']);
});

test('findDuplicates merges a later line sharing most intermediates', () => {
  const mk = (id, era, cluster, inner, products) => ({ id, era, cluster, inner: new Set(inner), products: products.map((res) => ({ res })) });
  const a = mk('lv.a', 'lv', 'a', ['1', '2', '3', '4', '5'], ['p']);
  const b = mk('mv.a', 'mv', 'a', ['1', '2', '3', '4', '5'], ['q']);
  const c = mk('mv.b', 'mv', 'b', ['9'], ['r']);
  const d = findDuplicates([a, b, c]);
  assert.equal(d.get('mv.a').of, 'lv.a');
  assert.equal(d.has('mv.b'), false);
});

const line = (over = {}) => ({ era: 'ev', steps: 5, crossings: [{ back: 2 }], products: [{ res: 'gtceu:x' }], ...over });
const ctx = (over = {}) => ({ used: new Set(['x']), dup: null, skipped: [], endInfo: new Map([['gtceu:x', { n: 3, reached: [] }]]), ...over });

test('judge verdicts', () => {
  assert.equal(judge(line(), ctx()).verdict, 'keep');
  assert.equal(judge(line({ steps: 2 }), ctx()).verdict, 'fix');
  assert.equal(judge(line(), ctx({ dup: { of: 'lv.a', shared: 5 } })).verdict, 'merge');
  assert.equal(judge(line(), ctx({ skipped: [{ res: 'gtceu:x' }] })).verdict, 'fix');
  const dead = judge(line(), ctx({ used: new Set(), endInfo: new Map([['gtceu:x', { n: 0, reached: [] }]]) }));
  assert.equal(dead.verdict, 'remove');
  assert.equal(judge(line({ era: 'max' }), ctx()).verdict, 'data-only');
});

test('a travel key without recipe consumers is not dead', () => {
  const l = line({ products: [{ res: 'grindless:end_key' }] });
  const r = judge(l, ctx({ used: new Set(), endInfo: new Map([['grindless:end_key', { n: 0, reached: [] }]]) }));
  assert.notEqual(r.verdict, 'remove');
});

test('toCsv and eraSummary agree on rows', () => {
  const l = line({ cluster: 'a', name: 'A "q"', mbs: [], ours: [] });
  const rows = [{ line: l, real: true, reach: 2, used: new Set(['iv.a']), skipText: [], endInfo: new Map([['gtceu:x', { n: 3, reached: ['iv:y'] }]]), dup: null, verdict: 'keep', reason: 'ok' }];
  const csv = toCsv(rows).trim().split('\n');
  assert.equal(csv.length, 2);
  assert.match(csv[1], /"A ""q"""/);
  assert.equal(eraSummary(rows).get('ev').keep, 1);
});

test('loadKeyItems keeps the first era per item', () => {
  const m = loadKeyItems('era,group,item\nlv,g,a\nmv,g,a\n');
  assert.equal(m.get('a'), 'lv');
});
