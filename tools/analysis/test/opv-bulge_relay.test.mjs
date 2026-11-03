// OpV-A0 (docs/eras/opv.md "A0. Bulge relay, chain matter and the hull"), no game needed. The pack's scripts run in the stand-in of
// lib/kubejs_static.mjs. The c11 throw's restart safety is the shared placer's (AF-1, uiv-travel.test.mjs).
// T1 is gg_test_opv_bulge_relay (tools/test/overlay/kubejs/server_scripts/gg_test_opv_bulge_relay.js), with one @restart.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
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

test('bulge_relay.js registers nothing, places nothing and never crafts; the shared placer serves c11 (AF-1)', () => {
  const code = read(...SCRIPT);
  assert.ok(!/setblock|forceload|runCommand/.test(code), 'nothing placed here');
  assert.ok(!/registry\(|RecipeType|Pat\.register|StartupEvents/.test(code), 'no registration here');
  assert.ok(!/craftingTable|shaped\(|shapeless\(/.test(code), 'never crafting');
  // the c11-only copy of the run is gone: the gate's afterWorking queues every completed jump in persistent data (uiv-travel.test.mjs, AF-1)
  assert.ok(!/opvBulgeHold|ServerEvents\.tick|warpGate/.test(code), 'no copy of the gate run here');
  const R = run.global.grindless.relayPlatforms;
  const row = R.rowOfJump('hold_sgr1806');
  assert.equal(row.place, 'sgr1806');
  assert.equal(row.source, SOURCE);
  assert.equal(R.keyOf(row), 'uxvPlatform_sgr1806');
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
  // the cost curve (opv.json) raises the counts above these bases, so the ids are pinned and the counts are floors
  const hullIn = itemsOf(r, 'inputs');
  assert.deepEqual(hullIn.map((x) => x[0]), ['gtceu:opv_machine_casing', 'gtceu:chain_strand_single_cable', 'grindless:chain_lamina_stack']);
  assert.ok(hullIn.every((x, k) => x[1] >= [1, 2, 2][k]), 'casing 1, cables 2, lamina stacks 2 at least');
  assert.equal(r.j.inputs.fluid.length, 1);
  assert.equal(r.j.inputs.fluid[0].content.value[0].fluid, 'gtceu:superfluid_helium_3');
  assert.ok(r.j.inputs.fluid[0].content.amount >= 500, '500 mB superfluid He-3 at least');
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

test('the zone row: band X 37824-37887, Z 0-63, Y 98-128, its test, inside no other row', () => {
  const z = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'test', 'zones.json'), 'utf8'));
  const rows = z.zones || z.bands || z;
  const zone = rows.find((b) => b.id === 'opv_bulge_relay');
  assert.ok(zone, 'zones.json row');
  assert.deepEqual(zone.x, [37824, 37887]);
  assert.deepEqual(zone.z, [0, 63]);
  assert.deepEqual(zone.y, [98, 128]);
  assert.deepEqual(zone.tests, ['opv_bulge_relay', 'opv_chain_matter']);
  assert.match(zone.note, /^OpV-A0:/);
  for (const o of rows) {
    if (o === zone || !Array.isArray(o.x)) continue
    assert.ok(o.x[1] < zone.x[0] || o.x[0] > zone.x[1], 'X band shared with ' + o.id);
  }
});
