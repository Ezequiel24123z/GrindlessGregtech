import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const file = path.join(ROOT, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_gcyr_flight.js');
const source = fs.readFileSync(file, 'utf8');

function descent(options = {}) {
  const orbit = 'gcyr:overworld_orbit';
  const dimension = options.dimension || orbit;
  const rocket = {
    uuid: 'actual-root-uuid', dimension, y: options.y ?? 65,
    isRemoved: () => false, onGround: () => options.ground !== false,
    getX: () => 0, getY: () => options.y ?? 65, getZ: () => 0,
  };
  const player = { dimension, y: 67, vehicle: options.serverMount === false ? null : rocket };
  const values = new Map(Object.entries({
    clientDim: dimension,
    clientMountedRocketUuid: options.clientUuid ?? rocket.uuid,
    clientMountedRocketY: String(options.clientY ?? rocket.y),
    clientMountObservedMs: String(options.observedMs ?? 100000),
    clientMountObservationError: options.clientError || '',
    clientWorldReady: String(options.worldReady !== false),
    clientBrakeTicks: '60',
  }));
  const checks = [];
  const aborted = [];
  let now = 100000;
  values.put = (key, value) => values.set(key, value);
  const probe = { rocket, player, values, checks, aborted };
  const hook = `
    global.probe = {
      install: function(q) {
        S = { t: 100 };
        SCOPE = 'luv_s0_stations';
        FL = { phase: 'descent', since: 0, arriveT: 0, launchT: 0, m: { g: {} },
          rocket: q.rocket, targetDim: q.rocket.dimension, leg: 'station_1', legs: {},
          fireSeen: true, lastY: 65, minY: 65, arrY: 600, landStable: 9, fuelAtLaunch: 32000 };
        lazy = function() { return {} };
        testPlayer = function() { return q.player };
        yOf = function(e) { return e.y };
        xOf = function() { return 0 };
        zOf = function() { return 0 };
        uuidOf = function(e) { return e.uuid };
        dimOf = function(e) { return e.dimension };
        vehicleOf = function(p) { return p.vehicle };
        shared = function() { return q.values };
        readRocket = function() { return { fuel: 29000 } };
        started = function() { return false };
        check = function(name, ok, detail) { q.checks.push({ name: name, ok: !!ok, detail: detail }); return ok };
        note = function() {};
        shot = function() {};
        levelOf = function() { return {} };
        rocketsAround = function() { return [q.rocket] };
        fireHits = function() { return 0 };
        flightSummary = function() {};
        go = function(phase) { FL.phase = phase };
        abortFlight = function(reason) { q.aborted.push(reason); FL.phase = 'aborted' };
      },
      tick: flightTick,
      advance: function(ticks) { S.t += ticks },
      state: function() { return FL }
    };
  `;
  const config = { enabled: true, integrated: true, level4: true, stationsOnly: true };
  const sandbox = {
    global: { grindless: { orbits: { dimensions: [orbit] } } },
    JsonIO: { read: () => ({ get: key => config[key] }), write() {} },
    console: { info() {} }, Date: { now: () => now },
    ServerEvents: { tick() {}, customCommand() {} },
    PlayerEvents: { loggedIn() {} }, EntityEvents: { hurt() {}, death() {} },
    Item: { of: id => ({ id }) },
  };
  if (options.assistHandled) {
    sandbox.global.grindless.orbitArrival = { states: { [rocket.uuid]: { handled: true } } };
  }
  vm.runInNewContext(source.replace(/\}\)\(\)\s*$/, hook + '\n})()'), sandbox, { filename: file });
  const h = sandbox.global.probe;
  h.install(probe);
  return { h, checks, aborted, setNow: value => { now = value; } };
}

test('orbit landing requires native collision and the actual fresh server/client mount', () => {
  const c = descent();
  c.h.tick();
  assert.equal(c.h.state().phase, 'done');
  assert.ok(c.checks.some(row => row.name === 'flight_native_ground_station_1' && row.ok));
  assert.ok(c.checks.some(row => row.name === 'flight_client_mount_station_1' && row.ok));
  assert.ok(c.checks.some(row => row.name === 'flight_landing_station_1' && row.ok));
});

test('a lowered but unticked rocket, absent/wrong mount, stale data and coordinate mismatch cannot pass', () => {
  for (const options of [
    { ground: false }, { serverMount: false }, { clientUuid: '' },
    { clientUuid: 'other-root' }, { observedMs: 97000 }, { clientY: 600 },
    { clientError: 'native observation failed' }, { worldReady: false },
  ]) {
    const c = descent(options);
    c.h.tick();
    assert.equal(c.h.state().phase, 'descent', JSON.stringify(options));
    assert.equal(c.h.state().landStable, 0);
    assert.ok(!c.checks.some(row => row.name === 'flight_landing_station_1' && row.ok));
  }
});

test('failed post-correction recovery exits after the bounded settle window, not the full landing timeout', () => {
  for (const wallDeadline of [false, true]) {
    const c = descent({ ground: false });
    c.h.tick();
    if (wallDeadline) c.setNow(110001);
    else c.h.advance(201);
    c.h.tick();
    assert.equal(c.h.state().phase, 'aborted');
    assert.deepEqual(c.aborted, ['orbit collision/client-mount recovery failed']);
    assert.ok(c.checks.some(row => row.name === 'flight_landing_station_1' && !row.ok));
  }
});

test('existing surface landing proof is unchanged and does not require the new orbit observations', () => {
  const c = descent({ dimension: 'minecraft:overworld', ground: false, serverMount: false, clientUuid: '' });
  c.h.tick();
  assert.equal(c.h.state().phase, 'done');
  assert.ok(c.checks.some(row => row.name === 'flight_landing_station_1' && row.ok));
  assert.ok(!c.checks.some(row => row.name.startsWith('flight_native_ground_')));
});

test('a terminal assist failure at Y600 unwinds within ten seconds without waiting for a move', () => {
  const c = descent({ y: 600, ground: false, clientUuid: '', assistHandled: true });
  c.h.state().minY = 600;
  c.h.state().lastY = 600;
  c.h.tick();
  c.setNow(110001);
  c.h.tick();
  assert.equal(c.h.state().phase, 'aborted');
  assert.deepEqual(c.aborted, ['orbit collision/client-mount recovery failed']);
  assert.ok(c.checks.some(row => !row.ok && row.detail.includes('assistHandled=true')));
});

test('each actual arrival clears the previous leg settle deadlines', () => {
  const start = source.indexOf('      FL.arriveT = S.t');
  const end = source.indexOf("      go('descent')", start);
  assert.ok(start >= 0 && end > start);
  const FL = { rocketUuid: 'actual-root-uuid', leg: 'second', orbitSettleT: 1, orbitSettleMs: 1 };
  vm.runInNewContext(source.slice(start, end), {
    FL, S: { t: 900 }, newRocket: {}, yOf: () => 600, shared: () => ({ put() {} }), shot() {},
  });
  assert.equal(FL.arriveT, 900);
  assert.equal(FL.orbitSettleT, undefined);
  assert.equal(FL.orbitSettleMs, undefined);
  assert.equal(FL.landStable, 0);
});
