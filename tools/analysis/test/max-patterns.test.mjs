// MAX-P: lib/patterns.js takes slices of up to 64 rows (MAX_ROWS 16 -> 64); 1 to 16 rows keep the explicit aisle(...) calls, 17 to 64 pass the rows as one array.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const src = fs.readFileSync(path.join(ROOT, 'pack/kubejs/startup_scripts/grindless/lib/patterns.js'), 'utf8');

function load() {
  const m = /function addSlice\(builder, rows\) \{[\s\S]*?\r?\n  \}\r?\n/.exec(src);
  assert.ok(m, 'addSlice is in patterns.js');
  const max = /const MAX_ROWS = (\d+)/.exec(src);
  const ctx = vm.createContext({ fail: (msg) => { throw new Error(msg); }, MAX_ROWS: Number(max[1]) });
  vm.runInContext(m[0].replace(/^function addSlice/, 'this.addSlice = function addSlice'), ctx);
  return { addSlice: ctx.addSlice, max: Number(max[1]) };
}
const recorder = () => { const calls = []; return { calls, aisle: (...a) => { calls.push(a); return 'ok'; } }; };
const rows = (n) => Array.from({ length: n }, (_, i) => 'r' + i);

test('MAX_ROWS is 64', () => {
  assert.equal(load().max, 64);
});

test('1 to 16 rows keep one explicit argument per row, as before', () => {
  const { addSlice } = load();
  for (const n of [1, 2, 8, 15, 16]) {
    const b = recorder();
    addSlice(b, rows(n));
    assert.deepEqual(b.calls, [rows(n)], `${n} rows`);
  }
});

test('17 to 64 rows pass the rows as one array (aisle(String...)); 0 and 65 fail with the 1 to 64 message', () => {
  const { addSlice } = load();
  for (const n of [17, 32, 64]) {
    const b = recorder();
    addSlice(b, rows(n));
    assert.equal(b.calls.length, 1, `${n} rows: one aisle call`);
    assert.equal(b.calls[0].length, 1);
    assert.deepEqual(Array.from(b.calls[0][0]), rows(n));
  }
  for (const n of [0, 65]) {
    assert.throws(() => addSlice(recorder(), rows(n)), /a slice can have 1 to 64 rows/, `${n} rows`);
  }
});
