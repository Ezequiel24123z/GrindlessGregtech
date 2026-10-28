// UHV's wireless tier (package UHV-A9, docs/eras/uhv.md 'Power'), no game needed. The pack's scripts run in the stand-in of
// lib/kubejs_static.mjs:
//   - the UHV row of tables/wireless_energy.json: tier 9, 24 of GTM's UV naquadria battery (62,914,560,000 EU, four UV cells' worth,
//     uhv-s0.md S0-5), two UV emitters / sensors (GTM has no UHV ones), our nuclear clock (A2) as the link, neutronium and RTAN wire;
//   - the naquadria magnet works' circuit 5 (tables/magnet_works.json): the only recipe of the UHV cell, four UV cells and RTAN wire;
//   - the powder-in-tube line's RTAN row (circuit 4): RTAN dust in a silver sheath, GTM's mass and at least GTM's EU per wire;
//   - the UHV hatches and covers in the assembler with the clock; en_us and es_es names in GTM's UHV colour; the textures; the zones row.
// The settlement (UHV only when every formed tower holds UHV cells, the per-window cap with tier 9 hatches) runs in the game:
// gg_test_uhv_wireless.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const W = run.global.grindless.wireless;
const MW = plain(run.global.grindless.magnetWorks);
const M = plain(run.global.grindless.materials);
const tables = path.join(pack, 'kubejs', 'data', 'grindless', 'tables');
const WIRELESS = JSON.parse(fs.readFileSync(path.join(tables, 'wireless_energy.json'), 'utf8'));
const MAGNETS = JSON.parse(fs.readFileSync(path.join(tables, 'magnet_works.json'), 'utf8'));
const docs = run.docs.recipes.recipes;
const CELL = 'grindless:uhv_smes_cell';
const UV_CELL = 'grindless:uv_smes_cell';
const CELL_EU = 62914560000;
const UV_NAQUADRIA_EU = 2621440000;
const UHV = 9;
const UHV_VA = 1966080;
// the static runner stands V in for VA (tools/analysis/lib/kubejs_static.mjs:381): GTM's VA[UHV] 1,966,080 is checked in game (T1)
const STUB_VA_UHV = 2097152;
const MACHINE = 'gtceu:naquadria_magnet_works';
const CLOCK = 'grindless:nuclear_clock';
const RTAN = 'gtceu:ruthenium_trinium_americium_neutronate_';
const RTAN_WIRE = RTAN + 'single_wire';
// GTM 7.5.3's RTAN wire (recipe dump): the blast furnace (122,880 EU/t x 670 t) and the vacuum freezer (1,966,080 x 200) per ingot,
// the wiremill's 2 single wires per ingot
const GTM_EU_PER_WIRE = (122880 * 670 + 1966080 * 200) / 2;
const HATCHES = [];
for (const kind of ['energy', 'dynamo']) for (const a of WIRELESS.hatchAmps) HATCHES.push(`gtceu:uhv_wireless_${kind}_hatch${a === 2 ? '' : '_' + a + 'a'}`);
const COVERS = ['grindless:uhv_wireless_energy_cover', 'grindless:uhv_wireless_dynamo_cover'];
const outputsOf = (d) => JSON.stringify((d.j || {}).outputs || (d.j || {}).result || {});

test('the stand-in runs the wireless, magnet works and materials scripts without errors', () => {
  const errs = run.errors.filter((e) => /wireless|magnet_works|uv[\\/]materials/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(MW.skipped, []);
  assert.deepEqual(MW.clashes, []);
  assert.deepEqual(M.skipped, []);
  assert.deepEqual(M.clashes, []);
});

test('the UHV row: tier 9, 24 UV naquadria batteries (62,914,560,000 EU), UV parts x2, the nuclear clock as the link', () => {
  const rows = WIRELESS.tiers.filter((r) => r.name === 'uhv');
  assert.equal(rows.length, 1);
  const uhv = rows[0];
  assert.equal(WIRELESS.tiers.indexOf(uhv), UHV - 1, 'the ninth row (UEV-W adds the tenth)');
  assert.deepEqual([uhv.tier, uhv.cell, uhv.capacity, uhv.referenceBattery, uhv.referenceCount],
    [UHV, CELL, CELL_EU, 'gtceu:uv_naquadria_battery', 24]);
  assert.equal(uhv.capacity, uhv.referenceCount * UV_NAQUADRIA_EU);
  const uv = WIRELESS.tiers.find((r) => r.name === 'uv');
  assert.equal(uhv.capacity, 4 * uv.capacity, 'four UV cells\' worth');
  assert.equal(uhv.cellMadeBy, MACHINE);
  assert.equal(uhv.batteries, null);
  assert.equal(uhv.frame, null);
  assert.equal(uhv.texture, 'grindless:block/wireless/smes_cell_uhv');
  assert.deepEqual([uhv.emitter, uhv.sensor, uhv.signalParts, uhv.link, uhv.plate, uhv.wire],
    ['gtceu:uv_emitter', 'gtceu:uv_sensor', 2, CLOCK, 'gtceu:neutronium_plate', 'ruthenium_trinium_americium_neutronate']);
});

test('registration: the cell is a block, eight hatches and two covers, all from lv/wireless_energy.js; F1 registers none of them', () => {
  const rel = 'kubejs/startup_scripts/grindless/lv/wireless_energy.js';
  assert.equal((run.registry.blocks.get(CELL) || {}).file, rel, 'a block');
  assert.equal((run.registry.items.get(CELL) || {}).file, rel, 'its block item, registered once');
  for (const id of HATCHES) assert.equal((run.registry.machines.get(id) || {}).file, rel, id);
  for (const id of COVERS) assert.equal((run.registry.items.get(id) || {}).file, rel, id);
  assert.deepEqual(plain(W.cells[CELL]), { tier: UHV, capacity: CELL_EU, madeBy: MACHINE });
  assert.deepEqual(plain(W.hatches['gtceu:uhv_wireless_dynamo_hatch_64a']), { kind: 'dynamo', tier: UHV, amps: 64 });
  assert.equal(W.tierLabels[UHV], 'UHV');
  assert.ok(JSON.stringify(W.towerSpec.symbols.C).includes(CELL), 'the tower\'s cell slots take the UHV cell');
  const f1 = JSON.stringify(plain(run.global.grindless.uhvFoundation || {}));
  for (const id of [CELL, ...COVERS]) assert.ok(!f1.includes('"' + id + '"'), id + ' is not F1\'s');
  assert.equal((run.registry.items.get(CLOCK) || {}).file, 'kubejs/startup_scripts/grindless/uhv/foundation.js', 'the clock is F1\'s');
});

test('circuit 5 of the naquadria magnet works is the UHV cell\'s only recipe: four UV cells, RTAN wire, the helium charge kept', () => {
  const entry = MAGNETS.recipes.find((r) => r.name === 'uhv_smes_cell');
  assert.ok(entry, 'tables/magnet_works.json');
  assert.equal(entry.circuit, 5);
  assert.equal(new Set(MAGNETS.recipes.map((r) => r.circuit)).size, MAGNETS.recipes.length, 'every entry its own circuit');
  assert.equal(entry.charge, true);
  assert.deepEqual(entry.itemsOut, [{ id: CELL, count: 1 }]);
  assert.deepEqual(entry.itemsIn.find((i) => i.id === UV_CELL), { id: UV_CELL, count: 4 });
  assert.ok(entry.itemsIn.some((i) => i.id === RTAN_WIRE), 'RTAN wire');
  assert.ok(entry.itemsIn.some((i) => i.id === 'gtceu:neutronium_plate'));
  assert.ok(entry.itemsIn.length + 1 <= 6, 'the machine\'s six item inputs, with the circuit');
  assert.ok(entry.eut <= UHV_VA && entry.eut > UHV_VA / 4, 'a UHV recipe');
  const p = MW.recipes.find((r) => r.name === 'uhv_smes_cell');
  assert.equal(p.recipeId, 'grindless:naquadria_magnets/uhv_smes_cell');
  const r = docs.find((d) => d.i === p.recipeId);
  assert.ok(r, 'added');
  assert.equal(r.t, 'gtceu:naquadria_magnets');
  const text = JSON.stringify(r.j);
  assert.match(text, /liquid_helium/, 'the charge');
  assert.match(text, new RegExp(RTAN_WIRE));
  const making = docs.filter((d) => outputsOf(d).includes('"' + CELL + '"'));
  assert.deepEqual(making.map((d) => [d.i, d.t]), [[p.recipeId, 'gtceu:naquadria_magnets']]);
});

test('the powder-in-tube line\'s RTAN row: circuit 4, RTAN dust in a silver tube, GTM\'s mass and at least GTM\'s EU per wire', () => {
  const r = M.recipes.find((x) => x.name === 'rtan_wire');
  assert.ok(r, 'the row');
  assert.deepEqual([r.type, r.circuit, r.recipeId], ['powder_in_tube', 4, 'grindless:powder_in_tube/rtan_wire']);
  assert.deepEqual(r.itemsIn, [{ id: RTAN + 'dust', count: 4 }, { id: 'grindless:silver_tube', count: 1 }]);
  assert.deepEqual(r.itemsOut, [{ id: RTAN_WIRE, count: 8 }, { id: 'gtceu:silver_dust', count: 1 }], 'the sheath back to tubes');
  assert.equal(r.itemsOut[0].count, 2 * r.itemsIn[0].count, 'GTM\'s mass: one ingot of dust, two single wires');
  assert.equal(r.eut, UHV_VA);
  assert.ok((r.eut * r.duration) / r.itemsOut[0].count >= GTM_EU_PER_WIRE, 'not cheaper than GTM\'s blast furnace and freezer');
  assert.ok(r.itemsIn.length + 1 <= M.lineIO.itemsIn && r.itemsOut.length <= M.lineIO.itemsOut);
  const d = docs.find((x) => x.i === r.recipeId);
  assert.ok(d, 'added');
  assert.equal(d.t, 'gtceu:powder_in_tube');
  assert.deepEqual(d.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration), [4]);
  const others = M.recipes.filter((x) => x.type === 'powder_in_tube' && x !== r).map((x) => x.circuit);
  assert.ok(!others.includes(4), 'its own circuit');
});

test('the UHV hatches and covers: assembler recipes at VA[UHV] with the nuclear clock as the link; none for the cell', () => {
  const recipes = plain(W.recipes);
  assert.equal(recipes.filter((r) => r.output === CELL).length, 0, 'no assembler cell');
  const by = (out) => recipes.find((r) => r.output === out);
  for (const id of [...HATCHES, ...COVERS]) {
    const r = by(id);
    assert.ok(r, id);
    assert.equal(r.eut, STUB_VA_UHV, id);
    assert.ok(docs.some((d) => d.i === r.id && d.t === 'gtceu:assembler'), r.id + ' in the static recipes');
  }
  assert.deepEqual(by('gtceu:uhv_wireless_energy_hatch').inputs, ['2x gtceu:uv_sensor', '1x gtceu:uhv_energy_input_hatch', '2x #gtceu:circuits/uhv', '1x ' + CLOCK]);
  assert.deepEqual(by('gtceu:uhv_wireless_dynamo_hatch').inputs, ['2x gtceu:uv_emitter', '1x gtceu:uhv_energy_output_hatch', '2x #gtceu:circuits/uhv', '1x ' + CLOCK]);
  assert.deepEqual(by('gtceu:uhv_wireless_energy_hatch_4a').inputs, ['1x gtceu:uhv_wireless_energy_hatch', '2x ' + RTAN + 'quadruple_wire', '2x gtceu:neutronium_plate']);
  assert.deepEqual(by('gtceu:uhv_wireless_dynamo_hatch_16a').inputs, ['1x gtceu:uhv_wireless_dynamo_hatch_4a', '2x ' + RTAN + 'octal_wire', '4x gtceu:neutronium_plate']);
  assert.deepEqual(by('gtceu:uhv_wireless_energy_hatch_64a').inputs, ['1x gtceu:uhv_wireless_energy_hatch_16a', '2x ' + RTAN + 'hex_wire', '6x gtceu:neutronium_plate']);
  for (const c of COVERS) assert.ok(by(c).inputs.includes('1x ' + CLOCK), c + ' links with the clock');
  // the clock is made (A2's nuclear clock lab), so every UHV link has a maker in the pack
  assert.ok(docs.some((d) => outputsOf(d).includes('"' + CLOCK + '"')), 'the clock has a recipe');
  // the per-window cap a UHV hatch keeps: V[UHV] x amps x the settlement window
  assert.equal(W.rate(UHV, 2), 2097152 * 2);
  assert.equal(W.rate(UHV, 64), 2097152 * 64);
});

test('names and textures: en_us and es_es in GTM\'s UHV colour, the EMI line of circuit 5, the five UHV textures', () => {
  const { lang } = run;
  const keys = HATCHES.map((id) => 'block.' + id.replace(':', '.')).concat(COVERS.map((id) => 'item.' + id.replace(':', '.')));
  for (const l of ['en_us', 'es_es']) {
    for (const k of keys) assert.match(String(lang[l][k]), /^\u00a74.*UHV/, l + ' ' + k);
    assert.ok(lang[l]['block.grindless.uhv_smes_cell'], l + ' names the cell');
    assert.ok(lang[l]['gtceu.recipe.grindless_naquadria_magnets.uhv_smes_cell'], l + ': the EMI line of circuit 5');
  }
  assert.equal(lang.en_us['block.grindless.uhv_smes_cell'], 'UHV SMES Cell');
  assert.equal(lang.en_us['block.gtceu.uhv_wireless_dynamo_hatch_64a'], '\u00a74UHV 64A Wireless Dynamo Hatch');
  const tex = path.join(pack, 'kubejs', 'assets', 'grindless', 'textures');
  for (const rel of ['block/wireless/smes_cell_uhv', 'block/cover/wireless_energy_cover_uhv', 'block/cover/wireless_dynamo_cover_uhv',
    'item/wireless/energy_cover_uhv', 'item/wireless/dynamo_cover_uhv']) assert.ok(fs.existsSync(path.join(tex, rel + '.png')), rel);
});

test('the smoke test\'s band: uhv_wireless at X 28672, 64 wide, its overlay script present', () => {
  const zones = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'test', 'zones.json'), 'utf8'));
  const list = Array.isArray(zones) ? zones : zones.zones;
  const z = list.find((x) => x.id === 'uhv_wireless');
  assert.ok(z, 'the row');
  assert.deepEqual([z.x, z.z], [[28672, 28735], [0, 63]]);
  assert.ok(z.y[0] >= 60 && z.y[1] <= 120);
  assert.ok(z.tests.includes('uhv_wireless'));
  assert.ok(fs.existsSync(path.join(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_uhv_wireless.js')));
});
