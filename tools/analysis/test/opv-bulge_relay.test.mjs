// OpV-A0 (docs/eras/opv.md "A0. Bulge relay, chain matter and the hull"), no game needed. The pack's scripts run in the stand-in of
// lib/kubejs_static.mjs; the restart-safe hold of server_scripts/grindless/opv/bulge_relay.js runs in node:vm against a small fake server.
// T1 is gg_test_opv_bulge_relay (tools/test/overlay/kubejs/server_scripts/gg_test_opv_bulge_relay.js), with one @restart.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const data = path.join(kube, 'data', 'grindless');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const recipes = run.docs.recipes.recipes;
const table = (name) => JSON.parse(fs.readFileSync(path.join(data, 'tables', name), 'utf8'));
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const SCRIPT = ['server_scripts', 'grindless', 'opv', 'bulge_relay.js'];
const itemsOf = (r, side) => r.j[side].item.filter((e) => e.content.type !== 'gtceu:circuit').map((e) => [e.content.ingredient.item, e.content.count]);
const euOf = (r) => r.j.tickInputs.eu[0].content;
const V_UXV = 134217728;
const VA_UXV = 125829120;
const SOURCE = 'grindless:cygnus_x1_orbit';
const gateRows = () => table('gate.json').types.warp_gate.recipes;

test('the stand-in runs bulge_relay.js without errors; the seed, the hull and the strand cable are made and nothing is skipped', () => {
  const errs = run.errors.filter((e) => /bulge_relay|opv[\\/]/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  const B = plain(run.global.grindless.opvBulgeRelay);
  assert.deepEqual(B.skipped, []);
  assert.deepEqual(B.recipes, ['grindless:assembly_line/bulge_relay_seed', 'grindless:assembly_line/opv_machine_hull', 'grindless:assembler/chain_strand_single_cable']);
  assert.deepEqual(plain(B.hull), { cable: 'gtceu:chain_strand_single_cable', helium: 'gtceu:superfluid_helium_3' });
  assert.equal(B.jump, 'hold_sgr1806');
  assert.equal(B.place, 'sgr1806');
  assert.equal(B.source, SOURCE);
  const WG = plain(run.global.grindless.warpGate);
  assert.deepEqual(WG.skipped || [], []);
  assert.deepEqual(WG.clashes || [], []);
});

test('the seed: an assembly line row at VA[UXV] of UXV parts only, no research, the one product', () => {
  const r = recipes.find((x) => x.i === 'grindless:assembly_line/bulge_relay_seed');
  assert.ok(r, 'recipe grindless:assembly_line/bulge_relay_seed');
  assert.equal(r.t, 'gtceu:assembly_line');
  assert.deepEqual(itemsOf(r, 'inputs'), [['gtceu:pasta_strand_single_wire', 32], ['grindless:lasagna_plate', 4], ['grindless:shequid_gyro', 1],
    ['gtceu:uxv_sensor', 2], ['grindless:frc_cartridge', 1]]);
  assert.deepEqual(r.j.inputs.fluid.map((f) => [f.content.value[0].fluid, f.content.amount]), [['gtceu:soldering_alloy', 576]]);
  assert.deepEqual(itemsOf(r, 'outputs'), [['grindless:bulge_relay_seed', 1]]);
  assert.equal(euOf(r), VA_UXV);
  assert.ok(!r.j.recipeConditions.some((c) => c.type === 'research'), 'no research');
  const ins = JSON.stringify(r.j.inputs);
  assert.ok(!/opv_|circuits\/opv/.test(ins), 'no OpV part: the seed is made before any exists');
  const makers = recipes.filter((x) => x.i.startsWith('grindless:') && JSON.stringify(x.j.outputs || {}).includes('"grindless:bulge_relay_seed"')).map((x) => x.i);
  assert.deepEqual(makers, ['grindless:assembly_line/bulge_relay_seed']);
});

test('gate c11: hold_sgr1806 throws the seed from Cygnus X-1 at 2^31 EU/t for 2,400 ticks, the bulge chart kept', () => {
  const all = gateRows();
  const r = all.find((x) => x.name === 'hold_sgr1806');
  assert.ok(r, 'gate.json row hold_sgr1806');
  assert.match(r._why, /^OpV-A0:/);
  assert.equal(r.circuit, 11);
  assert.equal(r.eut, 16 * V_UXV);
  assert.equal(r.eut, 2147483648);
  assert.equal(r.duration, 2400);
  assert.equal(r.site, 'cygnus_x1_orbit');
  assert.deepEqual(r.itemsIn, [{ id: 'grindless:bulge_relay_seed', count: 1 }]);
  assert.deepEqual(r.kept, [{ id: 'grindless:bulge_chart', count: 1 }]);
  assert.deepEqual(r.itemsOut, [{ id: 'grindless:launched_bulge_seed', count: 1 }]);
  assert.ok(r.itemsIn.length + r.kept.length + 1 <= 7, 'fits the 7-slot gate');
  assert.equal(new Set(all.map((x) => x.circuit)).size, all.length, 'unique circuits');
  assert.equal(new Set(all.map((x) => x.name)).size, all.length, 'unique names');
  const big = all.filter((x) => x.eut >= 2147483648).map((x) => x.circuit);
  assert.ok(big.includes(10) && big.includes(11), 'c10 and c11 draw 16 A x V[UXV]: ' + big.join(', '));
  const c10 = all.find((x) => x.name === 'hold_galactic_bulge');
  assert.equal(c10.circuit, 10, 'UXV-B6 c10 untouched');
  assert.deepEqual(c10.itemsOut, [{ id: 'grindless:bulge_chart', count: 1 }], 'c10 makes the chart c11 keeps');
  const rec = recipes.find((x) => x.i === 'grindless:warp_gate/hold_sgr1806');
  assert.ok(rec, 'recipe grindless:warp_gate/hold_sgr1806');
  assert.equal(euOf(rec), 2147483648);
  assert.deepEqual(rec.j.recipeConditions.filter((c) => c.type === 'dimension').map((c) => c.dimension), [SOURCE]);
});

test('the jump row and its platform: travel.js and relay_platforms.json name c11 hold_sgr1806 from Cygnus X-1', () => {
  const T = plain(run.global.grindless.opvTravel);
  assert.equal(T.places.sgr1806.circuit, 11);
  assert.equal(T.places.sgr1806.jump, 'hold_sgr1806');
  assert.equal(T.source, SOURCE);
  const p = table('relay_platforms.json').platforms.filter((x) => x.place === 'sgr1806');
  assert.equal(p.length, 1);
  assert.equal(p[0].jump, 'hold_sgr1806');
  assert.equal(p[0].source, SOURCE);
  assert.equal(p[0].dimension, 'grindless:sgr1806_orbit');
});

test('bulge_relay.js registers nothing, places nothing and never crafts; the platform stays kerr_sling.js\'s', () => {
  const code = read(...SCRIPT);
  assert.ok(!/setblock|forceload|runCommand/.test(code), 'nothing placed here');
  assert.ok(!/registry\(|RecipeType|Pat\.register|StartupEvents/.test(code), 'no registration here');
  assert.ok(!/craftingTable|shaped\(|shapeless\(/.test(code), 'never crafting');
  assert.match(code, /opvBulgeHold/);
  assert.match(code, /'uxvPlatform_' \+ PLACE/);
  assert.match(read('server_scripts', 'grindless', 'uxv', 'kerr_sling.js'), /mine = t\.platforms\.filter\(function \(r\) \{ return !!r\.source \}\)/, 'kerr_sling places every row with a source');
});

test('the chain strand cable: F1 made it a GT material, 16 A at V[OpV] with no loss', () => {
  const f = read('startup_scripts', 'grindless', 'opv', 'foundation.js');
  assert.match(f, /'gtceu:chain_strand': \{[^}]*cable: true/);
  assert.match(f, /material\.cableProperties\(GTValues\.V\[OPV\], 16, 0, false\)/);
});

test('the hull: an assembly line row at V[OpV]/2 of the OpV casing, 2 strand cables, 2 lamina stacks and 500 mB superfluid He-3, the one maker', () => {
  const r = recipes.find((x) => x.i === 'grindless:assembly_line/opv_machine_hull');
  assert.ok(r, 'recipe grindless:assembly_line/opv_machine_hull');
  assert.equal(r.t, 'gtceu:assembly_line', 'no OpV machine yet: GTM\'s assembly line on UXV 4 A hatches (opv.md:46)');
  assert.deepEqual(itemsOf(r, 'inputs'), [['gtceu:opv_machine_casing', 1], ['gtceu:chain_strand_single_cable', 2], ['grindless:chain_lamina_stack', 2]]);
  assert.deepEqual(r.j.inputs.fluid.map((f) => [f.content.value[0].fluid, f.content.amount]), [['gtceu:superfluid_helium_3', 500]]);
  assert.deepEqual(itemsOf(r, 'outputs'), [['gtceu:opv_machine_hull', 1]]);
  assert.equal(euOf(r), 2 ** 28);
  assert.equal(euOf(r), 268435456);
  assert.match(read(...SCRIPT), /h\.EUt\(V_OPV \/ 2\)\.duration\(200\)/, '200 ticks (the stand-in keeps no duration)');
  assert.ok(!r.j.recipeConditions.some((c) => c.type === 'research'), 'no research');
  assert.ok(euOf(r) <= 4 * V_UXV, 'a UXV 4 A hatch carries it');
  const makers = recipes.filter((x) => x.i.startsWith('grindless:') && JSON.stringify(x.j.outputs || {}).includes('"gtceu:opv_machine_hull"')).map((x) => x.i);
  assert.deepEqual(makers, ['grindless:assembly_line/opv_machine_hull']);
  const casing = recipes.filter((x) => JSON.stringify(x.j.outputs || {}).includes('"gtceu:opv_machine_casing"')).map((x) => x.i);
  assert.deepEqual(casing, ['grindless:assembly_line/opv_machine_casing'], 'the casing is UXV-B6\'s (uxv/gate.js)');
});

test('A0 adds no OpV component and no OpV circuit tag (opv.md "Bootstrap check")', () => {
  for (const r of recipes.filter((x) => /bulge_relay|opv_machine_hull/.test(x.i))) {
    const out = JSON.stringify(r.j.outputs || {});
    assert.ok(!/gtceu:opv_(electric|robot|conveyor|sensor|emitter|field|fluid)/.test(out), r.i);
    assert.ok(!/circuits\/opv/.test(JSON.stringify(r.j)), r.i);
  }
});

test('the zone row: band X 37824-37887, Z 0-63, Y 98-115, its test, inside no other row', () => {
  const z = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'test', 'zones.json'), 'utf8'));
  const rows = z.zones || z.bands || z;
  const zone = rows.find((b) => b.id === 'opv_bulge_relay');
  assert.ok(zone, 'zones.json row');
  assert.deepEqual(zone.x, [37824, 37887]);
  assert.deepEqual(zone.z, [0, 63]);
  assert.deepEqual(zone.y, [98, 115]);
  assert.deepEqual(zone.tests, ['opv_bulge_relay', 'opv_chain_matter']);
  assert.match(zone.note, /^OpV-A0:/);
  for (const o of rows) {
    if (o === zone || !Array.isArray(o.x)) continue
    assert.ok(o.x[1] < zone.x[0] || o.x[0] > zone.x[1], 'X band shared with ' + o.id);
  }
});

// ---------------------------------------------------------------- the hold across a restart, in a fake server

function nbt(store) {
  return {
    contains: (k) => Object.hasOwn(store, k),
    getString: (k) => (Object.hasOwn(store, k) ? store[k] : ''),
    putString: (k, v) => { store[k] = String(v) },
    remove: (k) => { delete store[k] }
  };
}

// one boot: a fresh `global` (a restart loses it), the world's persistent data kept in `store`
function boot(store, gate) {
  const ticks = [];
  const logs = [];
  const G = { grindless: { warpGate: { gates: {} } } };
  const Pos = function (x, y, z) { this.k = `${x},${y},${z}` };
  const Meta = { getMachine: (level, p) => (gate.loaded && p.k === `${gate.x},${gate.y},${gate.z}` ? gate.machine : null) };
  const ctx = vm.createContext({
    global: G,
    console: { info: (s) => logs.push(String(s)), error: (s) => logs.push('ERROR ' + s), log: (s) => logs.push(String(s)) },
    ServerEvents: { recipes: () => {}, tick: (fn) => ticks.push(fn) },
    Java: { loadClass: (n) => (/MetaMachine$/.test(n) ? Meta : /BlockPos$/.test(n) ? Pos : null) },
    Item: { exists: () => true },
    Fluid: { exists: () => true, of: () => ({}) }
  });
  vm.runInContext(read(...SCRIPT), ctx, { filename: 'bulge_relay.js' });
  const level = { time: 0, getTime() { return this.time } };
  let tc = 0;
  const server = {
    persistentData: nbt(store),
    getTickCount: () => tc,
    getLevel: (d) => (d === SOURCE ? level : null)
  };
  return {
    G, logs, level,
    gates: G.grindless.warpGate.gates,
    B: G.grindless.opvBulgeRelay,
    tick(n = 1) {
      for (let i = 0; i < n; i++) {
        tc++;
        level.time++;
        ticks.forEach((fn) => fn({ server }));
      }
    }
  };
}

const GATE = { x: 37856, y: 100, z: 10 };
const KEY = `${SOURCE}|${GATE.x}|${GATE.y}|${GATE.z}`;
const machine = (name) => ({ getRecipeLogic: () => ({ getLastRecipe: () => (name ? { id: `grindless:warp_gate/${name}` } : null) }) });
const record = (until, extra = {}) => ({ dim: SOURCE, ...GATE, fx: 0, fz: -1, sustain: false, until, ...extra });

test('hold: a c11 run is kept in persistent data, other runs are not', () => {
  const store = {};
  const gate = { ...GATE, loaded: true, machine: machine('hold_cas_a') };
  const b = boot(store, gate);
  b.level.time = 1000;
  b.gates[KEY] = record(3400);
  b.gates[`${SOURCE}|1|2|3`] = record(9999, { x: 1, y: 2, z: 3, sustain: true });
  b.tick(10);
  assert.deepEqual(store, {}, 'another jump is not kept');
  gate.machine = machine('hold_sgr1806');
  b.tick(10);
  assert.equal(store.opvBulgeHold, `${KEY}|3400|0|-1`);
  assert.equal(b.B.hold.key, KEY);
  b.tick(30);
  assert.equal(Object.keys(b.gates).length, 2, 'nothing added this boot');
  assert.equal(b.B.restored, null);
});

test('hold: after a restart the kept run is given back once, with its own end', () => {
  const store = { opvBulgeHold: `${KEY}|3400|0|-1` };
  const gate = { ...GATE, loaded: false, machine: machine('hold_sgr1806') };
  const b = boot(store, gate);
  b.level.time = 2000;
  b.tick(20);
  assert.deepEqual(b.gates, {}, 'the gate is not loaded yet: wait');
  assert.equal(store.opvBulgeHold, `${KEY}|3400|0|-1`);
  gate.loaded = true;
  b.tick(10);
  assert.deepEqual(plain(b.gates[KEY]), record(3400));
  assert.equal(b.B.restored, `${KEY}|3400`);
  delete b.gates[KEY];
  b.tick(10);
  assert.equal(b.gates[KEY], undefined, 'given back only once a boot');
});

test('hold: a run that ended while the server was down gets a margin so the platform poller sees it', () => {
  const store = { opvBulgeHold: `${KEY}|3400|0|-1` };
  const b = boot(store, { ...GATE, loaded: true, machine: machine('hold_sgr1806') });
  b.level.time = 5000;
  b.tick(10);
  assert.equal(b.gates[KEY].until, 5010 + 20);
  b.tick(10);
  assert.equal(store.opvBulgeHold, `${KEY}|5030|0|-1`, 'the new end is kept');
});

test('hold: released when the platform is placed, when the gate holds another recipe, or when the run ended unformed', () => {
  let store = { opvBulgeHold: `${KEY}|3400|0|-1`, uxvPlatform_sgr1806: 'grindless:sgr1806_orbit@64,100,64' };
  let b = boot(store, { ...GATE, loaded: true, machine: machine('hold_sgr1806') });
  b.tick(10);
  assert.ok(!Object.hasOwn(store, 'opvBulgeHold'), 'platform placed');
  assert.deepEqual(b.gates, {});

  store = { opvBulgeHold: `${KEY}|3400|0|-1` };
  b = boot(store, { ...GATE, loaded: true, machine: machine('hold_galactic_bulge') });
  b.tick(10);
  assert.ok(!Object.hasOwn(store, 'opvBulgeHold'), 'another recipe');
  assert.deepEqual(b.gates, {});

  store = {};
  b = boot(store, { ...GATE, loaded: true, machine: machine('hold_sgr1806') });
  b.level.time = 1000;
  b.gates[KEY] = record(1100);
  b.tick(10);
  assert.ok(Object.hasOwn(store, 'opvBulgeHold'));
  b.tick(100);
  delete b.gates[KEY];
  b.tick(20);
  assert.ok(Object.hasOwn(store, 'opvBulgeHold'), 'the poller gets its turn first');
  b.tick(30);
  assert.ok(!Object.hasOwn(store, 'opvBulgeHold'), 'ended without a platform');
  assert.ok(!b.logs.some((l) => l.startsWith('ERROR')), b.logs.join('\n'));
});
