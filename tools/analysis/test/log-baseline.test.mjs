// AF-K2 (M8-12): the log baseline reads only the pack's own WARN and ERROR lines, normalises them, and flags what is not known.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compare, normalise, pickLog } from '../log-baseline.mjs';
import { scopeFindings } from '../lib/scope_rules.mjs';

test('pickLog keeps the pack scripts WARN and ERROR lines, without time, script line or numbers', () => {
  const text = [
    '[10:44:21] [INFO] grindless/integration/hidden.js#97: [grindless/hidden] fine',
    '[10:44:22] [WARN] grindless/uv/fusion.js#67: [grindless/uv/fusion] x is in the audit',
    '[10:44:23] [ERROR] grindless/ev/a.js#12: [grindless/ev] skipped 3 recipes',
    '[10:44:24] [ERROR] other_mod/b.js#1: not ours',
  ].join('\n');
  const got = [...pickLog(text)].sort();
  assert.deepEqual(got, ['ERROR grindless/ev/a.js: [grindless/ev] skipped # recipes', 'WARN grindless/uv/fusion.js: [grindless/uv/fusion] x is in the audit']);
});

test('compare lists new lines (failure) and gone lines (to delete)', () => {
  const r = compare(new Set(['a', 'b']), ['b', 'c']);
  assert.deepEqual(r, { unknown: ['a'], gone: ['c'] });
  assert.equal(normalise('took 12.5 ms'), 'took # ms');
});

test('scope rules: top-level declarations and const/let in callbacks are found, IIFE-wrapped var is not', () => {
  const bad = "const A = 1\nfunction f() {}\n;(function () {\n  var ok = 1\n  ServerEvents.recipes(function (e) {\n    const x = 2\n    list.forEach((y) => { let z = 3 })\n  })\n})()\n";
  const r = scopeFindings(bad);
  assert.deepEqual(r.topLevel.map((d) => d.name), ['A', 'f']);
  assert.deepEqual(r.callbackLexical.map((d) => d.name), ['x', 'z']);
  const good = "// const A = 1\n;(function () {\n  const B = /x{2}\\/'/\n  var s = 'const Q = 1'\n  function g() { const inner = 1 }\n  ServerEvents.recipes(function (e) { var v = 1 })\n})()\n";
  const g = scopeFindings(good);
  assert.deepEqual(g.topLevel, []);
  assert.deepEqual(g.callbackLexical, []);
});
