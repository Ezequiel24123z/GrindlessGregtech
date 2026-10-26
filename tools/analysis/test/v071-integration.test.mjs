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
    ['chest', 'ggChestFurnace', 'ggTestChestFurnaceStart'],
    ['emi', 'ggEmiCoverage', 'ggTestEmiCoverageStart'],
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

test('integrated marker ships disabled; final chest/EMI scripts parse locally', () => {
  assert.deepEqual(JSON.parse(fs.readFileSync(new URL('config/gg_test_v071_integration.json', overlay), 'utf8')), { enabled: false });
  for (const code of [server, client, chest, starter, read('client', 'chest_furnace'), read('client', 'starter_equipment'),
    read('server', 'emi_coverage'), read('client', 'emi_coverage')]) {
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
  assert.deepEqual(s.starts, ['chest']);
  const F = s.global.ggChestFurnace;
  F.put('doneLogged', true); F.put('hold', false); F.put('serverDone', true);
  s.tick();
  assert.deepEqual(s.starts, ['chest'], 'early DONE/server completion cannot hand off player');
  assert.equal(s.S.get('hold'), true);
  F.put('clientDone', true);
  s.tick();
  assert.deepEqual(s.starts, ['chest'], 'stage transition itself does not start another fixture');
  assert.equal(s.S.get('hold'), true, 'client is held across the handoff');
  s.tick();
  assert.deepEqual(s.starts, ['chest', 'emi']);
  done(s.global.ggEmiCoverage, { clientDone: false });
  s.tick();
  assert.equal(s.S.get('hold'), true, 'EMI serverDone alone is not completion');
  done(s.global.ggEmiCoverage);
  s.tick(); s.tick();
  assert.equal(s.S.get('hold'), false);
  assert.equal(s.S.get('failed'), false);
  assert.equal(s.logs.filter((l) => l === 'GGTEST|v071_client|DONE').length, 1);
  assert.ok(s.logs.some((l) => l.includes('NOT full v0.7.1 acceptance')));
});

test('fixture/assertion/cleanup failures stay red and never start the next fixture', () => {
  for (const clientDone of [false, true]) {
    const s = dispatch(); s.tick();
    done(s.global.ggChestFurnace, { failed: true, clientDone });
    s.tick();
    assert.deepEqual(s.starts, ['chest']);
    if (!clientDone) {
      assert.equal(s.S.get('hold'), true, 'failure still waits for cleanup');
      s.global.ggChestFurnace.put('clientDone', true); s.tick();
    }
    assert.equal(s.S.get('failed'), true);
    assert.equal(s.S.get('hold'), false);
    assert.ok(s.logs.some((l) => l.includes('|all|FAIL|')));
  }
});

test('170s work ceiling requests cancellation; missing cleanup fails within another 10s', () => {
  const s = dispatch(); s.tick();
  s.time(170001); s.tick();
  assert.match(s.global.ggChestFurnace.get('cancel'), /170s/);
  assert.equal(s.S.get('hold'), true);
  s.time(180002); s.tick(); s.tick();
  assert.equal(s.S.get('hold'), false);
  assert.equal(s.S.get('failed'), true);
  assert.deepEqual(s.starts, ['chest']);
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
  const emi = dispatch({ markers: { 'kubejs/config/gg_test_emi_coverage.json': { enabled: true } } });
  emi.tick();
  assert.deepEqual(emi.starts, []);
  assert.equal(emi.S.get('failed'), true);
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

test('actual chest cleanup keeps failures red and attempts exact placements even if player/config cleanup throws', () => {
  const F = new SharedMap(), attempts = [], failures = [], logs = [];
  const T = { finished: false, spawn: {}, touched: true, oldConfig: ['saved config'], failed: [], table: [] };
  const ctx = { T, global: {}, TAG: 'GGTEST|chest_furnace|', REQ: 'request',
    shared: () => F, cls: () => ({ SSConfig: { SERVER_SPEC: {} } }),
    testPlayer: () => { throw new Error('player failure'); },
    guardedSet: (_, saved) => { attempts.push(saved[0]); throw new Error('config failure'); },
    cleanupPlaced: () => { attempts.push('exact cleanup'); throw new Error('placement cleanup failure'); },
    check: (name, ok) => { if (!ok) { failures.push(name); T.failed.push(name); F.put('failed', true); } },
    console: { info: (s) => logs.push(s) },
  };
  vm.runInNewContext(`${fn(chest, 'finish')}; finish({})`, ctx);
  assert.deepEqual(failures, ['restore', 'config_cleanup', 'cleanup', 'all']);
  assert.ok(attempts.includes('saved config'));
  assert.ok(attempts.includes('exact cleanup'));
  assert.equal(F.get('serverDone'), true);
  assert.equal(F.get('hold'), false);
  assert.equal(F.get('failed'), true);
  assert.equal(logs.filter((s) => s.endsWith('|DONE')).length, 1);
});

// Execute the actual nearby-layout/placement/NBT helpers. Any generating/far access throws.
function platform({ loaded = true, obstructed = false } = {}) {
  const edits = [], reads = [], lookups = [], entities = new Map();
  const points = Object.fromEntries(['A', 'B', 'C', 'D', 'F1', 'F2', 'F3'].map((k) => [k, {}]));
  const chunk = { getBlockState(pos) {
    assert.ok(pos.x >= -32 && pos.x <= 15 && pos.z >= -32 && pos.z <= 15, 'nearby only');
    reads.push(pos);
    return { isAir: () => !obstructed };
  } };
  const level = {
    getMaxBuildHeight: () => 320,
    getChunkSource: () => ({
      getChunkNow(x, z) { assert.ok(Math.abs(x + 1) + Math.abs(z + 1) <= 1); lookups.push([x, z]); return loaded ? chunk : null; },
      getChunk() { throw new Error('generating access forbidden'); },
    }),
    setBlockAndUpdate(pos, state) { edits.push([pos, state]); },
    getBlockState: () => 'iron state',
    getBlockEntity: (pos) => entities.get(`${pos.x},${pos.z}`),
    removeBlockEntity(pos) { entities.get(`${pos.x},${pos.z}`)?.remove(); },
    setBlockEntity(entity) { entities.set(`${entity.pos.x},${entity.pos.z}`, entity); },
  };
  const ctx = {
    ...points, AREA: null, T: { level, placed: [], placedKeys: {} }, bp: (p) => ({ ...p }),
    Block: { getBlock: (id) => ({ defaultBlockState: () => id }) },
    cls: () => ({ BlockEntity: { loadStatic: (pos, state, tag) => ({
      pos, state, tag, changed: false, setChanged() { this.changed = true; },
    }) } }),
  };
  const names = ['loadedChunk', 'selectArea', 'layout', 'place', 'be', 'saveStorages', 'reloadStorages', 'cleanupPlaced'];
  vm.runInNewContext(names.map((n) => fn(chest, n)).join('\n'), ctx);
  return { ctx, points, level, edits, reads, lookups, entities,
    player: { getX: () => -2, getZ: () => -3 } };
}

test('actual setup only selects verified air in existing nearby full chunks; GUI references follow dynamic layout', () => {
  const p = platform();
  const guiReference = p.points.A;
  p.ctx.layout(p.ctx.selectArea(p.player));
  assert.equal(p.reads.length, 16 * 16 * 15, 'whole volume checked before placement');
  assert.equal(p.edits.length, 0);
  assert.equal(p.ctx.AREA.x0, -16, 'negative coordinates use floor, not truncation');
  assert.equal(guiReference.x, -14);
  assert.equal(guiReference.y, 301);
  assert.equal(guiReference.z, -12);
  assert.throws(() => p.ctx.place({ x: 18690, y: 99, z: 4 }, 'stone'), /outside.*footprint/);
  assert.equal(p.edits.length, 0, 'far access must fail before any world edit');
  for (const options of [{ loaded: false }, { obstructed: true }]) {
    const bad = platform(options);
    assert.throws(() => bad.ctx.selectArea(bad.player), /no verified-air/);
    assert.equal(bad.edits.length, 0, 'missing chunk/occupied area cannot be cleared or generated');
    assert.equal(bad.lookups.length, 5, 'bounded nearby candidates only');
  }
  assert.doesNotMatch(chest, /forceload\s+(?:add|remove)|\.getChunk(?:At)?\s*\(|runCommandSilent\([^]*?['"]fill /);
  assert.doesNotMatch(chest, /18688|18703|1168|saveAllChunks/);
});

test('actual boot builds exactly the recorded nearby floor, without clearing terrain or requesting chunks', () => {
  const p = platform();
  const commands = [];
  Object.assign(p.player, {
    getName: () => ({ getString: () => 'FixturePlayer' }), getY: () => 70, getYaw: () => 0, getPitch: () => 0,
    getInventory: () => ({ selected: 0 }), getMainHandItem: () => ({ copy: () => 'saved hand' }),
    gameMode: { getGameModeForPlayer: () => ({ getName: () => 'survival' }) },
  });
  Object.assign(p.ctx, {
    cmd: (s) => commands.push(s), note: () => {},
  });
  p.ctx.T.server = { overworld: () => p.level };
  vm.runInNewContext(fn(chest, 'stepBoot'), p.ctx);
  assert.equal(p.ctx.stepBoot(p.player, 0, {}), false);
  assert.equal(p.edits.length, 0, 'air verification never clears existing blocks');
  assert.equal(p.ctx.stepBoot(p.player, 20, {}), true);
  assert.equal(p.edits.length, 256);
  assert.equal(p.ctx.T.placed.length, 256);
  assert.ok(p.edits.every(([pos, state]) => pos.y === 300 && state === 'minecraft:smooth_stone'));
  assert.deepEqual(commands, ['gamemode survival FixturePlayer'], 'no load/ticket/fill command');
  const n = p.edits.length;
  p.level.getChunkSource = () => ({ getChunkNow: () => null });
  assert.throws(() => p.ctx.place(p.points.A, 'iron'), /no longer fully loaded/);
  assert.equal(p.edits.length, n, 'a lost full chunk is never recovered by loading/generation');
});

test('actual cleanup removes only deduplicated placements, BE first (no drops), and continues after a failed position', () => {
  const p = platform();
  p.ctx.layout(p.ctx.selectArea(p.player));
  p.ctx.place(p.points.A, 'iron');
  p.ctx.place(p.points.A, 'gold');
  p.ctx.place(p.points.F1, 'furnace');
  assert.equal(p.ctx.T.placed.length, 2);
  const cleanup = [];
  p.level.removeBlockEntity = (pos) => cleanup.push(['removeBE', pos.x, pos.z]);
  p.level.setBlockAndUpdate = (pos, state) => cleanup.push([state, pos.x, pos.z]);
  p.ctx.cleanupPlaced();
  assert.deepEqual(cleanup.map((v) => v[0]), ['removeBE', 'minecraft:air', 'removeBE', 'minecraft:air']);
  assert.deepEqual(cleanup.map((v) => v.slice(1)), [[-14, -6], [-14, -6], [-14, -12], [-14, -12]]);
  cleanup.length = 0;
  p.level.removeBlockEntity = (pos) => { if (pos.z === -6) throw new Error('blocked'); cleanup.push(['removeBE']); };
  assert.throws(() => p.ctx.cleanupPlaced(), /blocked/);
  assert.equal(cleanup.length, 2, 'one failed placement cannot skip the other cleanup');
});

test('actual storage reload takes native stock NBT, replaces each BE, and never requests a chunk', () => {
  const p = platform();
  p.ctx.layout(p.ctx.selectArea(p.player));
  const originals = [];
  for (const point of [p.points.A, p.points.B, p.points.C]) {
    const tag = { slots: 54, copy() { return { slots: this.slots }; } };
    const entity = { removed: false, remove() { this.removed = true; }, saveWithFullMetadata: () => tag };
    originals.push(entity);
    p.entities.set(`${point.x},${point.z}`, entity);
  }
  const saved = p.ctx.saveStorages();
  p.ctx.reloadStorages(saved);
  for (let i = 0; i < 3; i++) {
    const pos = saved[i].pos;
    const entity = p.entities.get(`${pos.x},${pos.z}`);
    assert.equal(originals[i].removed, true);
    assert.notEqual(entity, originals[i]);
    assert.equal(entity.tag.slots, 54);
    assert.notEqual(entity.tag, saved[i].tag, 'native NBT copied before load');
    assert.equal(entity.changed, true);
  }
  assert.equal(p.edits.length, 0, 'reload does not replace blocks or drop inventories');
  assert.match(chest, /not chunk\/disk\/reconnect proof/);
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
