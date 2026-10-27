import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ntfsCompare, walkOrder, intendedOrder, bandOf, hazards, readHeader, assign, check, write, GAP, INT_MAX } from '../script-order.mjs';

test('NTFS collation: upper-cased ordinal, "_" after letters, "." and digits before', () => {
  const names = ['b.js', 'a_x.js', '_lib.js', '2x.js', 'a-b.js', 'Zeta.js', 'a.js'];
  assert.deepEqual([...names].sort(ntfsCompare), ['2x.js', 'a-b.js', 'a.js', 'a_x.js', 'b.js', 'Zeta.js', '_lib.js']);
  assert.ok(ntfsCompare('a.js', 'a_x.js') < 0, '"." < "_"');
  assert.ok(ntfsCompare('a_x.js', 'ab.js') > 0, '"_" after letters');
  assert.ok(ntfsCompare('9.js', 'a.js') < 0, 'digits before letters');
  assert.ok(ntfsCompare('B.js', 'a.js') > 0, 'case-insensitive');
  assert.equal(ntfsCompare('Ab.js', 'aB.js'), 0);
});

test('walk order is pre-order: a directory sorts among the files of its parent', () => {
  const files = ['lib/z.js', 'a.js', 'b.js', 'lib/a.js', 'lib_x.js', 'sub/deep/q.js', 'zz.js', 'Lib/ignore.js'].filter((f) => f !== 'Lib/ignore.js');
  assert.deepEqual(walkOrder(files), ['a.js', 'b.js', 'lib/a.js', 'lib/z.js', 'lib_x.js', 'sub/deep/q.js', 'zz.js']);
});

test('bands: higher first, ties in walk order, directory prefixes, most specific wins', () => {
  const bands = { 'lib/': 1000, 'lib/late.js': -5, 'z.js': 50 };
  assert.equal(bandOf('lib/a.js', bands), 1000);
  assert.equal(bandOf('lib/late.js', bands), -5);
  assert.equal(bandOf('other.js', bands), 0);
  assert.deepEqual(intendedOrder(['a.js', 'z.js', 'lib/b.js', 'lib/a.js', 'lib/late.js', 'm.js'], bands), ['lib/a.js', 'lib/b.js', 'z.js', 'a.js', 'm.js', 'lib/late.js']);
});

test('parse hazard: only property comments KubeJS acts on, never line 1 header', () => {
  assert.deepEqual(hazards('// priority: 5\nvar a = 1; // priority: 9\n// front face\n// back\n'), []);
  assert.deepEqual(hazards('// priority: 5\n  // priority 7\n// requires: foo\n// ignored: true\n').map((h) => h.line), [2, 3, 4]);
  assert.equal(hazards('// requires: x\n').length, 1);
  assert.equal(readHeader('// priority: -20\nx'), -20);
  assert.equal(readHeader('// priority:5\nx'), null);
});

test('assign: stamps everything with gaps, idempotent, minimal change', () => {
  const first = assign([null, null, null]);
  assert.deepEqual(first, [300, 200, 100]);
  assert.deepEqual(assign(first), first);
  // a new file between neighbours takes the midpoint, nothing else moves
  assert.deepEqual(assign([300, null, 200, 100]), [300, 250, 200, 100]);
  // new file at the top and bottom
  assert.deepEqual(assign([null, 300, 200]), [400, 300, 200]);
  assert.deepEqual(assign([300, 200, null]), [300, 200, 100]);
  // a stamped value that breaks the order is the one repaired (longest decreasing run is kept)
  assert.deepEqual(assign([500, 400, 450, 300]), [500, 400, 350, 300]);
});

test('assign: renumbers locally only when no gap is left', () => {
  const r = assign([1000, 11, null, 10, 9, -5000]);
  assert.ok(r.every((v, i) => i === 0 || v < r[i - 1]), 'strictly decreasing');
  assert.equal(r[0], 1000);
  assert.equal(r[5], -5000);
  assert.deepEqual(r.slice(1, 4), [900, 800, 700], 'window widened over 11');
  // exhausted tail of the int32 range still works through widening
  const t = assign([INT_MAX, null, INT_MAX - 1]);
  assert.ok(t[0] > t[1] && t[1] > t[2]);
  assert.equal(GAP, 100);
});

function fixture(files, bands = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'script-order-'));
  fs.mkdirSync(path.join(root, 'tools/analysis'), { recursive: true });
  fs.writeFileSync(path.join(root, 'tools/analysis/script_order.json'), JSON.stringify({ bands }));
  for (const [rel, text] of Object.entries(files)) {
    const p = path.join(root, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, text);
  }
  return root;
}
const body = '\nconsole.log(1)\n';

test('check/write on a tree: overlay joins the pack tree, header replaces or is inserted, idempotent', () => {
  const root = fixture({
    'pack/kubejs/server_scripts/b.js': `// priority: 7${body}`,
    'pack/kubejs/server_scripts/a.js': `console.log(0)\n`,
    'pack/kubejs/server_scripts/sub/c.js': `${body}`,
    'tools/test/overlay/kubejs/server_scripts/gg_t.js': `// priority: -5\n`,
    'pack/kubejs/startup_scripts/s.js': `x\n`,
  }, { 'server_scripts/sub/c.js': 10 });
  const before = check(root);
  assert.deepEqual(before.errors, []);
  assert.ok(before.notices.length >= 1);
  assert.ok(write(root) > 0);
  assert.equal(write(root), 0, 'idempotent');
  const r = check(root, { strict: true });
  assert.deepEqual(r.errors, []);
  const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
  assert.match(read('pack/kubejs/server_scripts/a.js'), /^\/\/ priority: -?\d+\nconsole\.log\(0\)\n$/);
  assert.match(read('pack/kubejs/server_scripts/b.js'), /^\/\/ priority: -?\d+\nconsole\.log\(1\)\n$/);
  assert.equal(read('pack/kubejs/server_scripts/b.js').split('\n').length, 3, 'old header replaced, not duplicated');
  // minimal change: a new file only gets its own header
  fs.writeFileSync(path.join(root, 'pack/kubejs/server_scripts/a_new.js'), 'y\n');
  const snapshot = ['a', 'b', 'sub/c'].map((n) => read(`pack/kubejs/server_scripts/${n}.js`));
  assert.equal(write(root), 1);
  assert.deepEqual(['a', 'b', 'sub/c'].map((n) => read(`pack/kubejs/server_scripts/${n}.js`)), snapshot);
});

test('check fails on a broken order, a stray property line and an unused band; unstamped is a notice (strict: failure)', () => {
  const root = fixture({
    'pack/kubejs/server_scripts/a.js': `// priority: 100${body}`,
    'pack/kubejs/server_scripts/b.js': `// priority: 200${body}`,
    'pack/kubejs/server_scripts/c.js': `// priority: 50\n// requires: nomod\n`,
    'pack/kubejs/server_scripts/d.js': `x\n`,
  }, { 'server_scripts/gone.js': 3 });
  const r = check(root);
  const text = r.errors.join('\n');
  assert.match(text, /b\.js:1: priority 200 breaks the order/);
  assert.match(text, /c\.js:2: property-like comment/);
  assert.match(text, /gone\.js" matches no script/);
  assert.ok(r.notices.some((n) => /1 unstamped/.test(n)));
  assert.ok(check(root, { strict: true }).errors.some((e) => /unstamped/.test(e)));
  const big = fixture({ 'pack/kubejs/server_scripts/a.js': '// priority: 3000000000\n' });
  assert.match(check(big).errors.join(), /out of int32/);
});
