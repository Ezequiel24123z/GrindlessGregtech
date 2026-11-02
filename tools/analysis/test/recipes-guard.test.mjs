// AF-K3 (M8-07): every ServerEvents.recipes handler is guarded, and the wrapper isolates a throwing handler.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { unguardedRecipeHandlers } from '../lib/recipes_guard_rule.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const GUARD = path.join(repo, 'pack/kubejs/server_scripts/grindless/lib/recipes_guard.js');

test('the rule flags a bare handler and accepts the wrapper and a handler with a try block', () => {
  assert.deepEqual(unguardedRecipeHandlers('ServerEvents.recipes(function (event) {\n  var a = 1\n})\n'), [{ line: 1 }]);
  assert.deepEqual(unguardedRecipeHandlers('ServerEvents.recipes(function (event) {\n  try { a(event) } catch (e) { console.error(e) }\n})'), []);
  assert.deepEqual(unguardedRecipeHandlers('ServerEvents.recipes(function (event) {\n  try { a(event) } catch (e) { x() } finally { y() }\n})'), []);
  assert.deepEqual(unguardedRecipeHandlers('ServerEvents.recipes(function (event) {\n  var steps = [a, b]\n  steps.forEach(function (s) {\n    try { s(event) } catch (e) { x() }\n  })\n})'), []);
  assert.deepEqual(unguardedRecipeHandlers('ServerEvents.recipes(function (event) { addKeys(event) })'), [{ line: 1 }]);
  assert.deepEqual(unguardedRecipeHandlers('ServerEvents.recipes(handler)'), [{ line: 1 }]);
  assert.deepEqual(unguardedRecipeHandlers("global.grindless.recipes('x/y', function (event) {\n  a(event)\n})"), []);
  assert.deepEqual(unguardedRecipeHandlers('// ServerEvents.recipes(function (event) {\nvar s = "ServerEvents.recipes(function (e) {"'), []);
});

test('strict rule: a throwing call outside the try leaves the handler unguarded, a fully wrapped one passes', () => {
  const strict = (s) => unguardedRecipeHandlers(s, { strict: true });
  assert.deepEqual(strict('ServerEvents.recipes(function (event) {\n  try { a(event) } catch (e) { x() }\n  b(event)\n})'), [{ line: 1 }]);
  assert.deepEqual(strict('ServerEvents.recipes(function (event) {\n  var n = count(event)\n  try { a(event) } catch (e) { x() }\n})'), [{ line: 1 }]);
  assert.deepEqual(strict('ServerEvents.recipes(function (event) {\n  steps.forEach(function (s) {\n    s(event)\n    try { s(event) } catch (e) { x() }\n  })\n})'), [{ line: 1 }]);
  assert.deepEqual(strict('ServerEvents.recipes(function (event) {\n  try { a(event) } catch (e) { x() }\n  if (flag) { try { b(event) } catch (e) { x() } }\n})'), []);
  assert.deepEqual(strict('ServerEvents.recipes(function (event) {\n  try { a(event) } catch (e) { x() } finally { y() }\n})'), []);
  assert.deepEqual(strict('ServerEvents.recipes(function (event) {\n  var steps = [a, b]\n  steps.forEach(function (s) {\n    try { s(event) } catch (e) { x() }\n  })\n})'), []);
  assert.deepEqual(strict('ServerEvents.recipes(function (event) { addKeys(event) })'), [{ line: 1 }]);
  assert.deepEqual(unguardedRecipeHandlers('ServerEvents.recipes(function (event) {\n  try { a(event) } catch (e) { x() }\n  b(event)\n})'), [], 'the lenient rule check-static runs still accepts it');
});

// The pack's partial handlers today (strict rule): pack/ is not this package's to edit, so the count is a ceiling that only goes down.
// When it reaches 0, switch check-static to the strict rule and delete this ceiling.
const KNOWN_PARTIAL_HANDLERS = 50;

test('no recipe handler of the pack is unguarded; partial ones stay at or under the known ceiling', () => {
  const bad = [];
  const partial = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js')) {
        const src = fs.readFileSync(p, 'utf8');
        if (unguardedRecipeHandlers(src).length) bad.push(path.relative(repo, p));
        for (const h of unguardedRecipeHandlers(src, { strict: true })) partial.push(`${path.relative(repo, p)}:${h.line}`);
      }
    }
  };
  walk(path.join(repo, 'pack/kubejs/server_scripts'));
  assert.deepEqual(bad, []);
  assert.ok(partial.length <= KNOWN_PARTIAL_HANDLERS, `${partial.length} handlers with a call outside their try (ceiling ${KNOWN_PARTIAL_HANDLERS}):\n${partial.join('\n')}`);
});

test('the wrapper logs and counts a throwing handler and the next handler still runs', () => {
  const handlers = [];
  const errors = [];
  const sandbox = { global: {}, ServerEvents: { recipes: (fn) => handlers.push(fn) }, console: { error: (m) => errors.push(String(m)) } };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(GUARD, 'utf8'), sandbox);
  const ran = [];
  vm.runInContext("global.grindless.recipes('a/first', function () { throw new Error('boom') })", sandbox);
  vm.runInContext("global.grindless.recipes('b/second', function (event) { event.ran.push('second') })", sandbox);
  for (const h of handlers) h({ ran });
  assert.deepEqual(ran, ['second']);
  assert.equal(sandbox.global.grindless.recipesGuard.failures, 1);
  assert.equal(sandbox.global.grindless.recipesGuard.failed.length, 1);
  assert.ok(errors.length === 1 && errors[0].includes('a/first') && errors[0].includes('boom'));
});
