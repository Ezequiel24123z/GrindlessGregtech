// AUD3-PERF (#306): contracts of the factory-load fixture (tools/test/overlay/kubejs/server_scripts/gg_test_factory_load.js).
// Local evidence only: the summary maths, the band, the config and the cleanup obligations; the native proof is the VM run.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const overlay = new URL('../../test/overlay/kubejs/', import.meta.url);
const source = fs.readFileSync(new URL('server_scripts/gg_test_factory_load.js', overlay), 'utf8');
const config = JSON.parse(fs.readFileSync(new URL('config/gg_test_factory_load.json', overlay), 'utf8'));
const zones = JSON.parse(fs.readFileSync(new URL('../../zones.json', overlay), 'utf8'));
const wireless = JSON.parse(fs.readFileSync(new URL('../../../../pack/kubejs/data/grindless/tables/wireless_energy.json', overlay), 'utf8'));
const zoneRow = (zones.zones || zones).find((z) => z.id === 'factory_load');

function load() {
  const handlers = { commands: {}, tick: [], recipes: [] };
  const G = {};
  const ctx = vm.createContext({
    global: G,
    console: { info() {}, error() {} },
    Date,
    ServerEvents: {
      recipes: (fn) => handlers.recipes.push(fn),
      tick: (fn) => handlers.tick.push(fn),
      customCommand: (name, fn) => { handlers.commands[name] = fn; },
    },
  });
  vm.runInContext(source, ctx);
  return { api: G.ggFactoryLoad, handlers, G };
}

test('the zone row lists this test and the fixture stays inside its band', () => {
  assert.ok(zoneRow, 'zone factory_load exists');
  assert.deepEqual(zoneRow.tests, ['factory_load']);
  const num = (name) => Number(new RegExp(`var ${name} = (\\d+)`).exec(source)[1]);
  assert.deepEqual([num('X0'), num('X1')], zoneRow.x);
  assert.deepEqual([num('Z0'), num('Z1')], zoneRow.z);
  assert.deepEqual([num('Y0'), num('Y1')], zoneRow.y);
  assert.match(source, /refused: .* is outside the band/);
  assert.ok(num('FLOOR') >= num('Y0') && num('FLOOR') < num('Y1'));
});

test('the command is registered and the test recipes are added', () => {
  const { handlers } = load();
  assert.equal(typeof handlers.commands.gg_test_factory_load, 'function');
  assert.equal(handlers.recipes.length, 1);
  const added = [];
  const chain = (id) => { const o = { itemInputs: () => o, itemOutputs: () => o, duration: () => o, EUt: (e) => { added.push([id, e]); return o; } }; return o; };
  handlers.recipes[0]({ recipes: { gtceu: { centrifuge: (id) => chain(id) } } });
  assert.deepEqual(added.map((a) => a[0]).sort(), ['gg_test_factory:hv_cent', 'gg_test_factory:mf_cent', 'gg_test_factory:uv_cent']);
  assert.equal(added.find((a) => a[0].endsWith('hv_cent'))[1], 512);
  assert.equal(added.find((a) => a[0].endsWith('uv_cent'))[1], 524288);
});

test('the profiles are the declared control, midgame and endgame, on tiers that have wireless rows', () => {
  const { api } = load();
  assert.deepEqual(Array.from(api.order), ['control', 'midgame', 'endgame']);
  assert.deepEqual(Object.keys(config.profiles), Array.from(api.order));
  assert.equal(config.profiles.control.machines + config.profiles.control.factories, 0);
  for (const name of ['midgame', 'endgame']) {
    const p = config.profiles[name];
    assert.ok(p.machines > 0, name);
    const row = wireless.tiers.find((t) => t.tier === p.tier);
    assert.ok(row, `${name}: wireless row for tier ${p.tier}`);
    assert.ok(source.includes(`${p.tier}: '${row.name}'`), `${name}: tier name ${row.name}`);
  }
  assert.ok(config.profiles.endgame.factories > 0);
  assert.equal(config.profiles.midgame.factories, 0);
  assert.ok(config.windowTicks >= 100 && config.warmupTicks >= 20);
  assert.ok(config.warmupTicks + config.windowTicks + config.backpressureTicks + config.cleanupTicks <= 600, 'one profile fits the stage budget');
});

test('percentile, stats and rate follow the real samples', () => {
  const { api } = load();
  const s = Array.from({ length: 100 }, (_, i) => i + 1);
  assert.equal(api.percentile(s, 95), 95);
  assert.equal(api.percentile([], 95), null);
  const st = api.stats([10, 20, 30, 60, NaN, -1, undefined]);
  assert.equal(st.n, 4);
  assert.equal(st.meanMs, 30);
  assert.equal(st.maxMs, 60);
  assert.equal(st.over50, 1);
  assert.equal(api.stats([]).meanMs, null);
  const r = api.rate(480, 200, 48);
  assert.deepEqual([r.actualPerSec, r.requestedPerSec, r.ratio], [48, 48, 1]);
  assert.equal(api.rate(10, 200, null).ratio, null, 'a missing request is unavailable, not guessed');
  assert.equal(api.rate(0, 0, 5).actualPerSec, null);
});

test('the summary has the fields of the baseline and reports unavailable data as null', () => {
  const { api } = load();
  const sum = api.summarize({
    name: 'control', tier: 0, machines: 0, factories: 0, endpoints: 0, recipe: null, warmupTicks: 60, windowTicks: 200,
    samples: [], tickSource: 'unavailable', singleItems: 0, factoryItems: 0, requested: null, peakMb: 100, maxMb: 4096,
    chunks: { loadedBefore: 4, forcedBefore: 0, loadedPeak: null },
  });
  assert.deepEqual(Object.keys(sum), ['profile', 'tier', 'machines', 'factories', 'endpoints', 'recipe', 'warmupTicks', 'windowTicks', 'tick', 'tickSource',
    'singles', 'factoriesOut', 'memory', 'chunks', 'backpressure', 'cleanup']);
  assert.equal(sum.tick.n, 0);
  assert.equal(sum.tick.p95Ms, null);
  assert.equal(sum.singles.requestedPerSec, null);
  assert.equal(JSON.parse(JSON.stringify(sum)).chunks.loadedPeak, null);
});

test('cleanup obligations: the band, entities, forced chunks, store and pause are restored, and the export is compact', () => {
  assert.match(source, /forceload add/);
  assert.match(source, /forceload remove/);
  assert.match(source, /forced_chunks_released/);
  assert.match(source, /_endpoints_dropped/);
  assert.match(source, /backpressure_stalled/);
  assert.match(source, /w\.setStored\(S\.server, S\.storeBefore\)/);
  assert.match(source, /w\.paused = S\.pausedBefore/);
  assert.match(source, /clearBand\(\)/);
  assert.match(source, /dropEntities\(\)/);
  assert.match(source, /kubejs\/exported\/factory_load\.json|EXPORT_DIR \+ '\/factory_load\.json'/);
  const code = source.replace(/^\s*\/\/.*$/gm, '');
  assert.doesNotMatch(code, /\b(const|let) /, 'Rhino: var and function only');
  assert.doesNotMatch(code, /=>/, 'no arrow functions in KubeJS scripts');
});
