import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const source = fs.readFileSync(path.join(ROOT, 'tools', 'test', 'overlay', 'kubejs',
  'server_scripts', 'gg_test_luv_s0_stations.js'), 'utf8');
const stack = (nbt = '{owned:1}', count = 1) => ({
  isEmpty: () => false, getId: () => 'gcyr:space_station_package',
  getNbt: () => nbt, getCount: () => count,
});

function scenario(change = () => {}) {
  const empty = { isEmpty: () => true };
  const rocket = { getStringUuid: () => 'native-arrival-root' };
  rocket.equals = other => other === rocket;
  const ctx = { rocket };
  const state = {
    failures: 0, report: { checks: [] },
    loadedCargo: { label: 'earth', id: 0, nbt: '{owned:1}', count: 1,
      deployed: true, arrivalRocketUuid: 'native-arrival-root' },
    entries: [{ label: 'earth', id: 0, packageNbt: '{owned:1}', packageCount: 1, arrived: true },
      { label: 'moon', id: 0, packageNbt: '{owned:1}', packageCount: 1, arrived: true }],
  };
  let current = stack();
  let writes = 0;
  const probe = { ctx, rocket, state, setCurrent: value => { current = value; } };
  change(probe);
  const slot = { getItem: () => current, set: value => { writes++; current = value; } };
  const hook = `
    global.cargoProbe = {
      set: function(state) { S = state },
      clear: clearDeployedCargo
    };
  `;
  const sandbox = { global: {}, Item: { empty }, console: { info() {} } };
  vm.runInNewContext(source.replace(/\}\)\(\)\s*$/, hook + '\n})()'), sandbox);
  sandbox.global.cargoProbe.set(state);
  return {
    run: () => sandbox.global.cargoProbe.clear(ctx, rocket, slot),
    state, current: () => current, writes: () => writes,
  };
}

test('native unconsumed package is removed only from its verified deployed flight root', () => {
  const s = scenario();
  s.run();
  assert.equal(s.writes(), 1);
  assert.ok(s.current().isEmpty());
  assert.equal(s.state.loadedCargo, null);
  assert.ok(s.state.report.checks.some(row => row.name === 'earth_deployed_package_retained' && row.ok));
  s.run();
  assert.equal(s.writes(), 1);
});

test('unknown, undeployed, altered or wrong-root cargo remains untouched', () => {
  for (const change of [
    p => { p.state.loadedCargo = null; },
    p => { p.state.loadedCargo.deployed = false; },
    p => { p.state.loadedCargo.arrivalRocketUuid = 'other-root'; },
    p => { p.ctx.rocket = { equals: () => false }; },
    p => { p.state.entries[0].arrived = false; },
    p => { p.state.entries[0].packageNbt = '{foreign:1}'; },
    p => { p.setCurrent(stack('{foreign:1}')); },
    p => { p.setCurrent(stack('{owned:1}', 2)); },
  ]) {
    const s = scenario(change);
    assert.throws(s.run, /refusing to replace preexisting rocket cargo/);
    assert.equal(s.writes(), 0);
  }
});
