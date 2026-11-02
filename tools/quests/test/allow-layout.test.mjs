import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedLayout, unusedWaivers, checkBook } from '../lib/checks.mjs';

const q = (id) => ({ id });

test('a waiver that suppresses nothing is reported as unused', () => {
  const cfg = { allowLayout: [{ from: 'A', to: 'B', why: 'x' }], allowLongEdges: [{ from: 'C', to: 'D', why: 'y' }] };
  const book = { groups: [], chapters: [] };
  const f = checkBook(book, cfg).filter((x) => x.rule === 'unused-waiver');
  assert.equal(f.length, 2);
  assert.deepEqual(unusedWaivers(cfg).map((w) => w.list), ['allowLayout', 'allowLongEdges']);
  assert.equal(checkBook(book, { allowLayout: [] }).filter((x) => x.rule === 'unused-waiver').length, 0);
  assert.equal(checkBook(book, cfg, { chapters: ['x'] }).filter((x) => x.rule === 'unused-waiver').length, 0, 'a partial run cannot tell');
});

test('allowLayout lets one named edge keep a crossing or a through-node', () => {
  const cfg = { allowLayout: [{ from: 'A', to: 'B', kinds: ['crossing'], why: 'real dependency' }, { from: 'C', to: 'D', why: 'both kinds' }] };
  assert.equal(allowedLayout(cfg, q('A'), q('B'), 'crossing'), true);
  assert.equal(allowedLayout(cfg, q('A'), q('B'), 'through-node'), false, 'only the kinds it names');
  assert.equal(allowedLayout(cfg, q('C'), q('D'), 'crossing'), true, 'no kinds = both');
  assert.equal(allowedLayout(cfg, q('C'), q('D'), 'through-node'), true);
  assert.equal(allowedLayout(cfg, q('B'), q('A'), 'crossing'), false, 'the direction matters');
  assert.equal(allowedLayout({}, q('A'), q('B'), 'crossing'), false, 'nothing allowed by default');
});
