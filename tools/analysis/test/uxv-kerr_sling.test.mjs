// UXV-B1 (docs/eras/uxv.md "B1. The Kerr sling"), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs.
// T1 is gg_test_uxv_kerr_sling (tools/test/overlay/kubejs/server_scripts/gg_test_uxv_kerr_sling.js).
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
const readJson = (...p) => JSON.parse(read(...p));
const outputsOf = (r) => JSON.stringify(r.j.outputs || r.j.result || {});
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const VA_UIV = 33554432;
const VA_UHV = 1966080;
const PLACES = { vela_pulsar: ['vela_pulsar_orbit', 1500000, 8, 'hold_vela_pulsar'], cas_a: ['cas_a_remnant', 30000000, 9, 'hold_cas_a'] };
const gateRows = () => table('gate.json').types.warp_gate.recipes;
const uxvRows = () => gateRows().filter((r) => /^UXV-B1:/.test(r._why || ''));

test('the stand-in runs the B1 scripts without errors; nothing is skipped or clashes', () => {
  const errs = run.errors.filter((e) => /kerr_sling|uxv[\\/]travel|elevator/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  const WG = plain(run.global.grindless.warpGate);
  assert.deepEqual(WG.skipped || [], []);
  assert.deepEqual(WG.clashes || [], []);
  const E = plain(run.global.grindless.elevator);
  assert.deepEqual(E.skipped || [], []);
  assert.deepEqual(E.clashes || [], []);
  assert.deepEqual(plain(run.global.grindless.uxvKerrSling).skipped, []);
});

test('the two c8 and c9 jump rows: ids, figures, site, circuits free and unique', () => {
  const rows = uxvRows();
  assert.deepEqual(rows.map((r) => [r.name, r.circuit]), [['hold_vela_pulsar', 8], ['hold_cas_a', 9]]);
  for (const r of rows) {
    assert.equal(r.eut, 16 * VA_UIV, r.name);
    assert.equal(r.duration, 1200, r.name);
    assert.equal(r.site, 'cygnus_x1_orbit', r.name);
    assert.deepEqual(r.itemsOut, [], r.name);
    assert.deepEqual(r.kept, [], r.name);
    assert.ok(r.itemsIn.length + 1 <= 6, r.name + ' fits the gate');
  }
  assert.deepEqual(rows[0].itemsIn, [{ id: 'grindless:launched_relay_seed', count: 1 }, { id: 'grindless:frc_cartridge', count: 1 }]);
  assert.deepEqual(rows[1].itemsIn, [{ id: 'grindless:launched_relay_seed', count: 1 }, { id: 'grindless:cnt_whipple_shield', count: 1 }]);
  const all = gateRows();
  assert.equal(new Set(all.map((r) => r.circuit)).size, all.length, 'unique circuits');
  assert.equal(new Set(all.map((r) => r.name)).size, all.length, 'unique names');
  assert.equal(all.find((r) => r.name === 'hold_cygnus_ring').circuit, 7, 'UIV-B5 c7 untouched');
  for (const id of rows.flatMap((r) => r.itemsIn.map((i) => i.id))) {
    assert.ok(run.registry.items.has(id) || /launched_relay_seed|frc_cartridge/.test(id), id);
  }
});

test('the gate keeps Cygnus X-1 as a site; no sustain row, no recipe type and no multiblock is added', () => {
  assert.match(read('server_scripts', 'grindless', 'uhv', 'gate.js'), /SITES\.cygnus_x1_orbit = \['grindless:cygnus_x1_orbit'\]/);
  const code = read('server_scripts', 'grindless', 'uxv', 'kerr_sling.js');
  assert.ok(!/registry\(|RecipeType|Pat\.register|\.create\(/.test(code), 'no registration here');
  assert.ok(!/craftingTable|shaped\(|shapeless\(/.test(code), 'never crafting');
});

test('tether works c7: densified yarn and two foil sheets -> bumper weave; circuits 1-4 stay', () => {
  const E = plain(run.global.grindless.elevator);
  const rows = E.recipes.filter((r) => r.type === 'tether_ribbon');
  assert.deepEqual(rows.map((r) => r.circuit), [1, 2, 3, 4, 7]);
  const r = rows.find((x) => x.name === 'bumper_weave');
  assert.deepEqual(r.itemsIn, [{ id: 'grindless:cnt_densified_yarn', count: 1 }, { id: 'gtceu:aluminium_foil', count: 2 }]);
  assert.deepEqual(r.itemsOut, [{ id: 'grindless:cnt_bumper_weave', count: 1 }]);
  assert.equal(r.eut, VA_UHV);
  assert.equal(r.duration, 600);
  const rec = recipes.find((x) => x.i === 'grindless:tether_ribbon/bumper_weave');
  assert.ok(rec, 'recipe grindless:tether_ribbon/bumper_weave');
  assert.equal(rec.t, 'gtceu:tether_ribbon');
  assert.deepEqual(circuitOf(rec), [7]);
});

test('the probe bay: c5 relay seed + tungsten steel block -> launched relay seed, site-locked; circuits 1-4 stay', () => {
  const T = table('cygnus.json').types.ergosphere_probing;
  assert.deepEqual(T.recipes.map((r) => r.circuit), [1, 2, 3, 4, 5]);
  const r = T.recipes[4];
  assert.equal(r.name, 'relay_seed');
  assert.equal(r.site, true);
  assert.match(r._why, /^UXV-B1/);
  assert.deepEqual(r.itemsIn, [{ id: 'grindless:relay_seed', count: 1 }, { id: 'gtceu:tungsten_steel_block', count: 1 }]);
  assert.deepEqual(r.itemsOut, [{ id: 'grindless:launched_relay_seed', count: 1 }]);
  assert.ok(r.eut <= VA_UIV && Number.isInteger(r.duration));
});

test('the Whipple shield: an assembly line row (not crafting) on the casing with RHEA plate and bumper weave', () => {
  const rec = recipes.find((x) => x.i === 'grindless:assembly_line/whipple_shield');
  assert.ok(rec, 'recipe grindless:assembly_line/whipple_shield');
  assert.equal(rec.t, 'gtceu:assembly_line');
  assert.ok(outputsOf(rec).includes('grindless:cnt_whipple_shield'));
  const ins = JSON.stringify(rec.j.inputs);
  for (const id of ['grindless:whipple_shield_casing', 'gtceu:rhea_plate', 'grindless:cnt_bumper_weave']) assert.ok(ins.includes(id), id);
  assert.ok(rec.j.tickInputs ? rec.j.tickInputs.eu : true);
});

test('only from: each B1 product has the producers the contract names and no other', () => {
  const makers = (id) => recipes.filter((r) => r.i.startsWith('grindless:') && outputsOf(r).includes(`"${id}"`)).map((r) => r.i).sort();
  assert.deepEqual(makers('grindless:cnt_whipple_shield'), ['grindless:assembly_line/whipple_shield']);
  assert.deepEqual(makers('grindless:cnt_bumper_weave'), ['grindless:tether_ribbon/bumper_weave']);
  const seeds = makers('grindless:launched_relay_seed');
  assert.deepEqual(seeds, ['grindless:ergosphere_probing/relay_seed', 'grindless:laser_sail_launch/relay_seed_launch'], 'the Moon launcher and the Cygnus sling row only');
  assert.equal(seeds.length, 2);
});

test('the two places: dimension, planet (tier 12, no air, no gravity), sky and no rocket', () => {
  for (const [k, [dim, temp]] of Object.entries(PLACES)) {
    assert.deepEqual(readJson('data', 'grindless', 'dimension', `${dim}.json`), { type: 'gcyr:space', generator: { type: 'gcyr:space' } }, k);
    const pl = readJson('data', 'grindless', 'gcyr', 'planets', `${dim}.json`);
    assert.equal(pl.rocket_tier, 12, k);
    assert.equal(pl.temperature, temp, k);
    assert.equal(pl.world, `grindless:${dim}`);
    assert.equal(pl.orbit_world, `grindless:${dim}`);
    assert.equal(pl.translation, `level.grindless.${dim}`);
    assert.equal(pl.solar_system, `grindless:${k}`);
    assert.equal(pl.gravity, 0);
    assert.equal(pl.has_atmosphere, false);
    assert.equal(pl.has_oxygen, false);
    const sky = readJson('assets', 'grindless', 'gcyr', 'planet_assets', 'sky_renderers', `${dim}.json`);
    assert.equal(sky.world, `grindless:${dim}`, k + ' sky');
    assert.ok(sky.sky_objects.length >= 3, k + ' sky has objects');
  }
  for (const f of fs.readdirSync(path.join(data, 'gcyr', 'planets'))) {
    const pl = readJson('data', 'grindless', 'gcyr', 'planets', f);
    if (pl.rocket_tier === 12) assert.ok(Object.values(PLACES).some(([d]) => f === `${d}.json`), f);
  }
  const T = plain(run.global.grindless.uxvTravel);
  assert.equal(T.tier, 12);
  for (const [k, [dim, temp, circuit, jump]] of Object.entries(PLACES)) {
    assert.deepEqual(T.places[k], { dimension: `grindless:${dim}`, circuit, jump, temperature: temp });
  }
});

test('sunlight.json: two rows, factor 0, no_solar, era uxv, always', () => {
  const d = table('sunlight.json').dimensions;
  for (const [dim] of Object.values(PLACES)) {
    const s = d[`grindless:${dim}`];
    assert.equal(s.factor, 0, dim);
    assert.equal(s.when, 'always', dim);
    assert.equal(s.status, 'no_solar', dim);
    assert.equal(s.era, 'uxv', dim);
    assert.match(s.note, /^UXV-B1:/, dim);
  }
  assert.equal(d['grindless:cygnus_x1_orbit'].factor, 0.6, 'Cygnus untouched');
});

test('relay_platforms.json: two UXV-B1 rows with the UIV-B1 kit, one per jump, leaving from Cygnus X-1', () => {
  const plat = table('relay_platforms.json');
  assert.equal(plat.platforms.length, 5);
  assert.equal(plat.ring.machine, 'gtceu:warp_gate');
  const mine = plat.platforms.filter((p) => p.source);
  assert.deepEqual(mine.map((p) => [p.place, p.jump, p.dimension, p.source, p.x, p.y, p.z]), Object.entries(PLACES).map(([k, [dim, , , jump]]) =>
    [k, jump, `grindless:${dim}`, 'grindless:cygnus_x1_orbit', 64, 100, 64]));
  const rows = uxvRows();
  for (const p of mine) assert.ok(rows.some((r) => r.name === p.jump), p.place);
});

test('lang parity (en_us and es_es), the jump rows and the two info pages naming their place', () => {
  const lang = read('client_scripts', 'grindless', 'uxv_kerr_sling_lang.js');
  assert.match(lang, /\['en_us', 'es_es'\]/);
  for (const n of ['hold_vela_pulsar', 'hold_cas_a']) assert.ok(lang.includes(`'${n}'`), n);
  assert.ok(lang.includes("'ergosphere_probing', 'relay_seed'"));
  for (const [dim, k] of [['vela_pulsar_orbit', 'vela_pulsar'], ['cas_a_remnant', 'cas_a']]) {
    assert.ok(lang.includes(`'${dim}'`) && lang.includes(`'${k}'`), dim);
  }
  const info = (page, stack) => {
    const j = readJson('assets', 'emi', 'recipe', 'additions', 'grindless', `uxv_kerr_sling_${page}.json`);
    assert.equal(j.type, 'emi:info');
    assert.deepEqual(j.stacks, [stack]);
    assert.deepEqual(j.text, [`emi.grindless.info.uxv_kerr_sling.${page}`]);
  };
  info('vela', 'item:grindless:frc_cartridge');
  info('cas_a', 'item:grindless:cnt_whipple_shield');
  assert.match(lang, /Vela Pulsar\./);
  assert.match(lang, /Cassiopeia A, where/);
  assert.match(lang, /púlsar de Vela\./);
  assert.match(lang, /Casiopea A, donde/);
});

test('the zone row: band X 36736-36799, Z 0-63, Y 98-115, its test and a note naming each dimension', () => {
  const z = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'test', 'zones.json'), 'utf8'));
  const zone = (z.zones || z.bands || z).find((b) => b.id === 'uxv_kerr_sling');
  assert.ok(zone, 'zones.json row');
  assert.deepEqual(zone.x, [36736, 36799]);
  assert.deepEqual(zone.z, [0, 63]);
  assert.deepEqual(zone.y, [98, 115]);
  assert.deepEqual(zone.tests, ['uxv_kerr_sling']);
  for (const d of ['cygnus_x1_orbit', 'vela_pulsar_orbit', 'cas_a_remnant']) assert.ok(zone.note.includes(d), d);
});

test('F1 ids now produced: the B1 obtain rule is gone, the others stay', () => {
  const o = fs.readFileSync(path.join(root, 'tools', 'analysis', 'tiers', 'obtain.json'), 'utf8');
  assert.ok(!/UXV \(B1\)/.test(o));
  assert.ok(/UXV \(B3\)/.test(o), 'B3 rule (frc_cartridge) untouched');
});
