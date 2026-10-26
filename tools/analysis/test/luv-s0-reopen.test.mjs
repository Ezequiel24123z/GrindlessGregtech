import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const source = fs.readFileSync(path.join(ROOT, 'tools', 'test', 'overlay', 'kubejs',
  'startup_scripts', 'gg_test_luv_s0_reopen.js'), 'utf8');

function fixture({ enabled = true, snapshotToken = 'owned-reopen' } = {}) {
  const bridge = new Map(enabled ? [
    ['hold', true],
    ['s0sReopenPending', 'owned-reopen'],
    ['s0sReopenSnapshot', JSON.stringify({
      reopenToken: snapshotToken, atMs: 1000, report: { phase: 'await_reopen' },
    })],
  ] : []);
  bridge.put = (key, value) => bridge.set(key, value);
  const errors = [];
  let callback;
  let nativeAccesses = 0;
  const context = vm.createContext({
    Platform: { isClientEnvironment: () => true },
    global: { ggGcyrFlight: bridge },
    Date: { now: () => 1000 },
    ForgeEvents: { onEvent: (_event, fn) => { callback = fn; } },
    Client: new Proxy({}, {
      get() {
        nativeAccesses++;
        throw new Error('native lifecycle must not be accessed');
      },
    }),
    Java: { loadClass() { throw new Error('native classes must not be loaded'); } },
    console: { info() {}, error: message => errors.push(message) },
  });
  vm.runInContext(source, context);
  return {
    bridge, errors,
    tick: (phase = 'END') => callback({ phase }),
    nativeAccesses: () => nativeAccesses,
  };
}

test('disabled lifecycle and non-END ticks do not touch the native client', () => {
  for (const enabled of [false, true]) {
    const f = fixture({ enabled });
    f.tick('START');
    if (!enabled) f.tick();
    assert.equal(f.errors.length, 0);
    assert.equal(f.nativeAccesses(), 0);
  }
});

test('owned reopen fails once before Save/Quit or any native client access', () => {
  const f = fixture();
  f.tick();
  f.tick();
  f.tick();
  assert.equal(f.errors.length, 1);
  assert.match(f.bridge.get('s0sReopenError'), /owned-reopen.*quarantined before Save\/Quit/);
  assert.match(f.bridge.get('s0sReopenError'), /outside Rhino/);
  assert.equal(f.bridge.get('hold'), true);
  assert.equal(f.bridge.get('s0sReopenPending'), 'owned-reopen');
  assert.equal(f.bridge.has('s0sReopenClosed'), false);
  assert.equal(f.nativeAccesses(), 0);
});

test('snapshot identity is still checked before the quarantine error', () => {
  const f = fixture({ snapshotToken: 'foreign-reopen' });
  f.tick();
  assert.match(f.bridge.get('s0sReopenError'), /snapshot token is missing or mismatched/);
  assert.equal(f.nativeAccesses(), 0);
});

test('an unpublished snapshot waits without a lifecycle action, then fails explicitly', () => {
  const f = fixture();
  const raw = f.bridge.get('s0sReopenSnapshot');
  f.bridge.delete('s0sReopenSnapshot');
  f.tick();
  assert.equal(f.errors.length, 0);
  f.bridge.set('s0sReopenSnapshot', raw);
  f.tick();
  assert.equal(f.errors.length, 1);
  assert.match(f.bridge.get('s0sReopenError'), /quarantined/);
  assert.equal(f.nativeAccesses(), 0);
});

test('withdrawn ownership is refused without reopening or releasing a foreign hold', () => {
  const f = fixture();
  f.bridge.delete('s0sReopenSnapshot');
  f.tick();
  f.bridge.set('s0sReopenPending', 'foreign-reopen');
  f.tick();
  assert.match(f.bridge.get('s0sReopenError'), /owner withdrew\/changed/);
  assert.equal(f.bridge.get('s0sReopenPending'), 'foreign-reopen');
  assert.equal(f.bridge.get('hold'), true);
  assert.equal(f.nativeAccesses(), 0);
});
