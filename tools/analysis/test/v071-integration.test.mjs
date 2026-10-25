// LOCAL ONLY: execute the actual overlay dispatcher/driver with stand-ins.
// These contracts are scheduling/cleanup evidence, NOT Minecraft or Rhino proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const overlay = new URL('../../test/overlay/kubejs/', import.meta.url);
const read = (side, name) => fs.readFileSync(new URL(`${side}_scripts/gg_test_${name}.js`, overlay), 'utf8');
const server = read('server', 'v071_integration');
const client = read('client', 'v071_integration');
const chest = read('server', 'chest_furnace');
const starter = read('server', 'starter_equipment');
const marker = 'kubejs/config/gg_test_v071_integration.json';

class SharedMap extends Map {
  get(key) { return super.has(key) ? super.get(key) : null; }
  put(key, value) { const old = this.get(key); this.set(key, value); return old; }
  putIfAbsent(key, value) { if (this.has(key)) return this.get(key); this.put(key, value); return null; }
}

function sandbox(code, { enabled = true, markers = {}, global = {}, Client = {} } = {}) {
  let now = 0;
  const login = [], ticks = [], logs = [];
  const ctx = {
    global, Client, Date: { now: () => now },
    JsonIO: { read: (path) => path === marker ? { enabled } : markers[path] ?? null },
    Java: { loadClass: () => SharedMap },
    console: { info: (s) => logs.push(s) },
    PlayerEvents: { loggedIn: (fn) => login.push(fn) },
    ServerEvents: { tick: (fn) => ticks.push(fn) },
    ClientEvents: { tick: (fn) => ticks.push(fn) },
  };
  vm.runInNewContext(code, ctx);
  return { ctx, global, logs, login: (player = {}) => login.forEach((fn) => fn({ player })),
    tick: () => ticks.forEach((fn) => fn({ server: {} })), time: (ms) => { now = ms; } };
}

function dispatch(options = {}) {
  const starts = [];
  const global = {};
  for (const [name, key, hook] of [
    ['starter', 'ggStarterEquipment', 'ggTestStarterEquipmentStart'],
    ['chest', 'ggChestFurnace', 'ggTestChestFurnaceStart'],
  ]) {
    global[hook] = () => { starts.push(name); global[key] = new SharedMap(); global[key].put('hold', true); };
  }
  const s = sandbox(server, { global, ...options });
  s.login();
  return { ...s, starts, S: global.ggV071Integration };
}

function done(F, { serverDone = true, clientDone = true, failed = false } = {}) {
  F.put('serverDone', serverDone); F.put('clientDone', clientDone); F.put('failed', failed);
}

test('integrated marker ships disabled; all six edited/new overlay scripts parse locally', () => {
  assert.deepEqual(JSON.parse(fs.readFileSync(new URL('config/gg_test_v071_integration.json', overlay), 'utf8')), { enabled: false });
  for (const code of [server, client, chest, starter, read('client', 'chest_furnace'), read('client', 'starter_equipment')]) {
    assert.doesNotThrow(() => new vm.Script(code));
  }
  const s = dispatch({ enabled: false });
  s.tick();
  assert.deepEqual(s.starts, []);
  assert.equal(s.S, undefined);
});

test('fixed serial sequence requires BOTH cleanup acknowledgements, not a fixture DONE line', () => {
  const s = dispatch();
  assert.equal(s.S.get('hold'), true, 'dispatcher owns login-to-first-stage gap');
  s.tick(); s.tick();
  assert.deepEqual(s.starts, ['starter']);
  const F = s.global.ggStarterEquipment;
  F.put('doneLogged', true); F.put('hold', false); F.put('serverDone', true);
  s.tick();
  assert.deepEqual(s.starts, ['starter'], 'early DONE/server completion cannot hand off player');
  assert.equal(s.S.get('hold'), true);
  F.put('clientDone', true);
  s.tick();
  assert.deepEqual(s.starts, ['starter'], 'stage transition itself does not start another fixture');
  assert.equal(s.S.get('hold'), true, 'client is held across the handoff');
  s.tick();
  assert.deepEqual(s.starts, ['starter', 'chest']);
  done(s.global.ggChestFurnace);
  s.tick(); s.tick();
  assert.equal(s.S.get('hold'), false);
  assert.equal(s.S.get('failed'), false);
  assert.equal(s.logs.filter((l) => l === 'GGTEST|v071_client|DONE').length, 1);
  assert.ok(s.logs.some((l) => l.includes('NOT full v0.7.1 acceptance')));
});

test('fixture/assertion/cleanup failures stay red and never start the next fixture', () => {
  for (const clientDone of [false, true]) {
    const s = dispatch(); s.tick();
    done(s.global.ggStarterEquipment, { failed: true, clientDone });
    s.tick();
    assert.deepEqual(s.starts, ['starter']);
    if (!clientDone) {
      assert.equal(s.S.get('hold'), true, 'failure still waits for cleanup');
      s.global.ggStarterEquipment.put('clientDone', true); s.tick();
    }
    assert.equal(s.S.get('failed'), true);
    assert.equal(s.S.get('hold'), false);
    assert.ok(s.logs.some((l) => l.includes('|all|FAIL|')));
  }
});

test('170s work ceiling requests cancellation; missing cleanup fails within another 10s', () => {
  const s = dispatch(); s.tick();
  s.time(170001); s.tick();
  assert.match(s.global.ggStarterEquipment.get('cancel'), /170s/);
  assert.equal(s.S.get('hold'), true);
  s.time(180002); s.tick(); s.tick();
  assert.equal(s.S.get('hold'), false);
  assert.equal(s.S.get('failed'), true);
  assert.deepEqual(s.starts, ['starter']);
  assert.ok(s.logs.some((l) => l.includes('did not acknowledge cleanup')));
});

test('conflicting markers and missing start hooks cannot produce a green integrated result', () => {
  const s = dispatch({ markers: { 'kubejs/config/gg_test_starter_equipment.json': { enabled: true } } });
  s.tick();
  assert.deepEqual(s.starts, []);
  assert.equal(s.S.get('failed'), true);
  const missing = sandbox(server);
  missing.login(); missing.tick();
  assert.equal(missing.global.ggV071Integration.get('failed'), true);
  assert.ok(missing.logs.some((l) => l.includes('missing fixture start hook')));
});

test('both real fixture login hooks defer to integration even if individual markers are enabled', () => {
  for (const [code, name, key] of [
    [starter, 'starter_equipment', 'ggStarterEquipment'],
    [chest, 'chest_furnace', 'ggChestFurnace'],
  ]) {
    const m = { enabled: true, get: () => true };
    const s = sandbox(code, { markers: { [`kubejs/config/gg_test_${name}.json`]: m } });
    s.login();
    assert.equal(s.global[key], undefined, 'no fixture owns the player before the dispatcher calls its hook');
    assert.equal(s.global.ggTestChestFurnaceRequest, undefined);
  }
});

// Pull the actual private driver/cleanup function, without a test API in the
// runtime overlay or copying its implementation into this test.
function fn(code, name) {
  const source = code.match(new RegExp(`  function ${name}\\([^]*?\\n  }`))?.[0];
  assert.ok(source, `actual ${name} function found`);
  return source;
}

test('actual chest driver starts every step at age zero and carries old-world snapshots through both reloads', () => {
  let tick = 0;
  const seen = [], failures = [];
  const T = { tick0: 0, step: 0, since: 0, st: {}, finished: false };
  const ctx = { T, global: {}, REQ: 'request', LOADED_AT: 0, QUIET_MS: 0,
    TEST_TIMEOUT: 12000, STEP_TIMEOUT: 2400,
    sval: () => '', testPlayer: () => ({}), check: (...a) => failures.push(a), finish: () => {},
    STEPS: [
      ['old_world', (_, age, st) => { seen.push(age); st.savedA = 'chest'; st.savedB = 'barrel'; st.oldBE = 'original'; return true; }],
      ['update', (_, age, st) => {
        seen.push(age); assert.equal(st.savedA, 'chest'); assert.equal(st.savedB, 'barrel');
        assert.equal(st.oldBE, 'original'); st.savedA2 = 'grown'; return true;
      }],
      ['persist', (_, age, st) => { seen.push(age); assert.equal(st.savedA2, 'grown'); return true; }],
      ['next', (_, age, st) => { seen.push(age); assert.deepEqual(Object.keys(st), []); return true; }],
    ],
  };
  vm.runInNewContext(`${fn(chest, 'onTick')}; globalThis.drive = onTick`, ctx);
  for (let i = 0; i < 4; i++) {
    ctx.drive({ getTickCount: () => tick });
    tick += 7; // No reliance on consecutive callback tick counts for initialization.
  }
  assert.deepEqual(seen, [0, 0, 0, 0]);
  assert.deepEqual(failures, []);
});

test('actual chest cleanup keeps failures red and releases forceload even if player/config/band cleanup throws', () => {
  const F = new SharedMap(), attempts = [], failures = [], logs = [];
  const T = { finished: false, spawn: {}, touched: true, forced: true, oldConfig: ['saved config'], failed: [], table: [] };
  const ctx = { T, global: {}, TAG: 'GGTEST|chest_furnace|', REQ: 'request',
    AREA: { x0: 18688, x1: 18703, y0: 98, y1: 112, z0: 0, z1: 15 },
    shared: () => F, cls: () => ({ SSConfig: { SERVER_SPEC: {} } }),
    testPlayer: () => { throw new Error('player failure'); },
    guardedSet: (_, saved) => { attempts.push(saved[0]); throw new Error('config failure'); },
    cmd: (command) => { attempts.push(command); if (command.startsWith('fill ')) throw new Error('fill failure'); return 1; },
    check: (name, ok) => { if (!ok) { failures.push(name); T.failed.push(name); F.put('failed', true); } },
    console: { info: (s) => logs.push(s) },
  };
  vm.runInNewContext(`${fn(chest, 'finish')}; finish({})`, ctx);
  assert.deepEqual(failures, ['restore', 'config_cleanup', 'cleanup', 'all']);
  assert.ok(attempts.includes('saved config'));
  assert.ok(attempts.some((s) => s.startsWith('forceload remove 18688 0 18703 15')));
  assert.equal(F.get('serverDone'), true);
  assert.equal(F.get('hold'), false);
  assert.equal(F.get('failed'), true);
  assert.equal(logs.filter((s) => s.endsWith('|DONE')).length, 1);
});

test('integrated starter driver reuses reward/boundary proof and requests map after one reveal', () => {
  const F = new SharedMap();
  let handler, claims = 0, prepared = 0, finished = 0;
  const request = { at: 0, pendingOnly: true, phase: 'rewards',
    player: { getCooldowns: () => ({ isOnCooldown: () => false }), getMainHandItem: () => ({ getItem: () => ({}) }) } };
  const ctx = { request, serverTicks: 0, Date: { now: () => 0 },
    ServerEvents: { tick: (fn) => { handler = fn; } }, shared: () => F, requireAlive: () => {},
    claim: () => { claims++; }, prepare: () => { prepared++; request.round = 1; request.phase = 'cooldown'; request.completedAt = 0; },
    requireProof: (_, ok) => assert.equal(ok, true), check: (_, ok) => assert.equal(ok, true),
    finish: () => { finished++; }, verifyScan: () => { throw new Error('unexpected repeat scan'); },
  };
  const driver = starter.slice(starter.indexOf('  ServerEvents.tick('), starter.indexOf('\n  function requireAlive'));
  vm.runInNewContext(driver, ctx);
  handler();
  assert.equal(claims, 0);
  assert.equal(prepared, 1);
  ctx.serverTicks = 12; handler();
  assert.equal(request.round, 1);
  assert.equal(F.get('mapRequested'), true);
  assert.equal(request.phase, 'map');
  F.put('mapDone', true); F.put('mapResult', 'PASS'); F.put('codecDone', true);
  handler();
  assert.equal(finished, 1);
  assert.match(starter, /var offsets = request\.pendingOnly \? \[\] :/);
});

test('real client cleanup acknowledges once and reports screen/menu failures, never success-shaped notes', () => {
  for (const name of ['starter_equipment', 'chest_furnace']) {
    for (const fail of [false, true]) {
      const key = name === 'starter_equipment' ? 'ggStarterEquipment' : 'ggChestFurnace';
      const F = new SharedMap();
      done(F, { clientDone: false }); F.put('hold', false);
      const Client = { options: { keyUse: { setDown() {} } }, player: { closeMenu() {} },
        setScreen() { if (fail) throw new Error('screen cleanup failure'); } };
      const s = sandbox(read('client', name), { global: { [key]: F }, Client });
      s.tick(); s.tick();
      assert.equal(F.get('clientDone'), true, name);
      assert.equal(F.get('failed'), fail, name);
      const cleanup = s.logs.filter((l) => l.includes('|client_cleanup|'));
      assert.equal(cleanup.length, 1);
      assert.match(cleanup[0], fail ? /\|FAIL\|/ : /\|PASS\|/);
    }
  }
});

test('integration client bridges stage gaps and unpauses a deadline without another JVM or fresh budget', () => {
  const S = new SharedMap();
  S.put('hold', true);
  const actions = [];
  const Client = { player: { age: 90 }, options: { keyUse: { setDown: (v) => actions.push(v) } },
    setScreen: (v) => actions.push(v) };
  const s = sandbox(client, { global: { ggV071Integration: S }, Client });
  s.tick();
  assert.equal(Client.player.age, 20);
  S.put('deadline', 170000);
  s.time(170001); s.tick(); s.tick();
  assert.match(S.get('cancel'), /including paused screens/);
  assert.deepEqual(actions, [false, null]);
  assert.equal(s.logs.filter((l) => l.includes('|client_deadline|FAIL|')).length, 1);
});
