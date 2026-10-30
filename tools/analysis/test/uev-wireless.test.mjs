// UEV's wireless tier (package UEV-W, docs/eras/uev.md 'W. UEV wireless tier'), no game needed. The pack's scripts run in the stand-in of
// lib/kubejs_static.mjs:
//   - the UEV row of tables/wireless_energy.json: tier 10, 96 of GTM's UV naquadria battery (251,658,240,000 EU, four UHV cells' worth),
//     F1's UEV emitter / sensor, the quantum repeater node as the link, lay superhydride plate and wire;
//   - withTiers case 10 (startup lv/wireless_energy.js), the window caps (derived, never stored) and the long-sized figures;
//   - the naquadria magnet works' circuit 6 (tables/magnet_works.json): the only recipe of the UEV cell, four UHV cells;
//   - the UEV hatches and covers in the assembler; en_us and es_es names in GTM's UEV colour; the textures; the zones row.
// The settlement itself (64 A hatch, 60 s of a 16 A draw) runs in the game: gg_test_uev_wireless.
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
const tables = path.join(pack, 'kubejs', 'data', 'grindless', 'tables');
const WIRELESS = JSON.parse(fs.readFileSync(path.join(tables, 'wireless_energy.json'), 'utf8'));
const MAGNETS = JSON.parse(fs.readFileSync(path.join(tables, 'magnet_works.json'), 'utf8'));
const docs = run.docs.recipes.recipes;
const CELL = 'grindless:uev_smes_cell';
const UHV_CELL = 'grindless:uhv_smes_cell';
const CELL_EU = 251658240000;
const UV_NAQUADRIA_EU = 2621440000;
const UEV = 10;
const V_UEV = 8388608;
const VA_UEV = 7864320;
// the static runner stands V in for VA (tools/analysis/lib/kubejs_static.mjs): GTM's VA[UEV] is checked in game (T1)
const STUB_VA_UEV = V_UEV;
const MACHINE = 'gtceu:naquadria_magnet_works';
const LINK = 'grindless:quantum_repeater_node';
const WIRE = 'gtceu:lay_superhydride_';
const PLATE = 'gtceu:lay_superhydride_plate';
const HATCHES = [];
for (const kind of ['energy', 'dynamo']) for (const a of WIRELESS.hatchAmps) HATCHES.push(`gtceu:uev_wireless_${kind}_hatch${a === 2 ? '' : '_' + a + 'a'}`);
const COVERS = ['grindless:uev_wireless_energy_cover', 'grindless:uev_wireless_dynamo_cover'];
const outputsOf = (d) => JSON.stringify((d.j || {}).outputs || (d.j || {}).result || {});

test('the stand-in runs the wireless and magnet works scripts without errors', () => {
  const errs = run.errors.filter((e) => /wireless|magnet_works/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(MW.skipped, []);
  assert.deepEqual(MW.clashes, []);
});

test('the UEV row: tier 10, 96 UV naquadria batteries (251,658,240,000 EU, past an int), F1\'s UEV parts, the quantum repeater node', () => {
  const rows = WIRELESS.tiers.filter((r) => r.name === 'uev');
  assert.equal(rows.length, 1);
  const uev = rows[0];
  assert.equal(WIRELESS.tiers[9], uev, 'the tenth row (UIV-W appends uiv after it)');
  assert.deepEqual([uev.tier, uev.cell, uev.capacity, uev.referenceBattery, uev.referenceCount],
    [UEV, CELL, CELL_EU, 'gtceu:uv_naquadria_battery', 96]);
  assert.equal(uev.capacity, uev.referenceCount * UV_NAQUADRIA_EU);
  assert.ok(uev.capacity > 2 ** 31 - 1, 'a long');
  const uhv = WIRELESS.tiers.find((r) => r.name === 'uhv');
  assert.equal(uev.capacity, 4 * uhv.capacity, 'four UHV cells\' worth');
  assert.equal(uev.cellMadeBy, MACHINE);
  assert.equal(uev.batteries, null);
  assert.equal(uev.frame, null);
  assert.equal(uev.texture, 'grindless:block/wireless/smes_cell_uev');
  assert.deepEqual([uev.emitter, uev.sensor, uev.signalParts, uev.link, uev.plate, uev.wire],
    ['gtceu:uev_emitter', 'gtceu:uev_sensor', 1, LINK, PLATE, 'lay_superhydride']);
});

test('withTiers case 10 is spelled out and the default message covers at least 10 tiers', () => {
  const src = fs.readFileSync(path.join(pack, 'kubejs', 'startup_scripts', 'grindless', 'lv', 'wireless_energy.js'), 'utf8');
  assert.match(src, /case 10:\s*return b\.tiers\(t\[0\], t\[1\], t\[2\], t\[3\], t\[4\], t\[5\], t\[6\], t\[7\], t\[8\], t\[9\]\)/);
  assert.match(src, /1 to 1\d tiers/);
});

test('registration: the cell is a block, eight hatches and two covers, all from lv/wireless_energy.js; F1 does not register the cell', () => {
  const rel = 'kubejs/startup_scripts/grindless/lv/wireless_energy.js';
  assert.equal((run.registry.blocks.get(CELL) || {}).file, rel, 'a block');
  assert.equal((run.registry.items.get(CELL) || {}).file, rel, 'its block item, registered once');
  assert.equal(HATCHES.length, 8);
  for (const id of HATCHES) assert.equal((run.registry.machines.get(id) || {}).file, rel, id);
  for (const id of COVERS) assert.equal((run.registry.items.get(id) || {}).file, rel, id);
  assert.deepEqual(plain(W.cells[CELL]), { tier: UEV, capacity: CELL_EU, madeBy: MACHINE });
  assert.deepEqual(plain(W.hatches['gtceu:uev_wireless_dynamo_hatch_64a']), { kind: 'dynamo', tier: UEV, amps: 64 });
  assert.equal(W.tierLabels[UEV], 'UEV');
  assert.ok(JSON.stringify(W.towerSpec.symbols.C).includes(CELL), 'the tower\'s cell slots take the UEV cell');
  assert.equal((run.registry.items.get(LINK) || {}).file, 'kubejs/startup_scripts/grindless/uev/foundation.js', 'the node is F1\'s');
});

test('the window caps are derived (V[UEV] x amps x the window), never stored, and stay numbers past an int', () => {
  const t = W.settleTicks;
  assert.equal(W.rate(UEV, 2) * t, 167772160);
  assert.equal(W.rate(UEV, 4) * t, 335544320);
  assert.equal(W.rate(UEV, 16) * t, 1342177280);
  assert.equal(W.rate(UEV, 64) * t, 5368709120);
  assert.ok(W.rate(UEV, 64) * t > 2 ** 31 - 1);
  assert.equal(V_UEV * 16, 134217728, 'a 16 A draw per tick');
  assert.equal(V_UEV * 16 * 1200, 161061273600, '60 s of it');
  assert.equal(V_UEV * 16 * 16, 2147483648, 'the 16 A hatch buffer (S0-1)');
});

test('circuit 6 of the naquadria magnet works is the UEV cell\'s only recipe: four UHV cells, lay superhydride, the helium charge', () => {
  const entry = MAGNETS.recipes.find((r) => r.name === 'uev_smes_cell');
  assert.ok(entry, 'tables/magnet_works.json');
  assert.equal(entry.circuit, 6);
  assert.equal(new Set(MAGNETS.recipes.map((r) => r.circuit)).size, MAGNETS.recipes.length, 'every entry its own circuit');
  assert.equal(entry.charge, true);
  assert.deepEqual(entry.itemsOut, [{ id: CELL, count: 1 }]);
  assert.deepEqual(entry.itemsIn.find((i) => i.id === UHV_CELL), { id: UHV_CELL, count: 4 });
  assert.deepEqual(entry.itemsIn.find((i) => i.id === WIRE + 'single_wire'), { id: WIRE + 'single_wire', count: 16 });
  assert.deepEqual(entry.itemsIn.find((i) => i.id === PLATE), { id: PLATE, count: 8 });
  assert.ok(entry.itemsIn.length + 1 <= 6, 'the machine\'s six item inputs, with the circuit');
  assert.equal(entry.eut, VA_UEV);
  assert.equal(entry.duration, 600);
  const p = MW.recipes.find((r) => r.name === 'uev_smes_cell');
  assert.equal(p.recipeId, 'grindless:naquadria_magnets/uev_smes_cell');
  const r = docs.find((d) => d.i === p.recipeId);
  assert.ok(r, 'added');
  assert.equal(r.t, 'gtceu:naquadria_magnets');
  assert.match(JSON.stringify(r.j), /liquid_helium/, 'the charge');
  const making = docs.filter((d) => outputsOf(d).includes('"' + CELL + '"'));
  assert.deepEqual(making.map((d) => [d.i, d.t]), [[p.recipeId, 'gtceu:naquadria_magnets']]);
});

test('the UEV hatches and covers: assembler recipes at VA[UEV] with the quantum repeater node; none for the cell', () => {
  const recipes = plain(W.recipes);
  assert.equal(recipes.filter((r) => r.output === CELL).length, 0, 'no assembler cell');
  const by = (out) => recipes.find((r) => r.output === out);
  for (const id of [...HATCHES, ...COVERS]) {
    const r = by(id);
    assert.ok(r, id);
    assert.equal(r.eut, STUB_VA_UEV, id);
    assert.ok(docs.some((d) => d.i === r.id && d.t === 'gtceu:assembler'), r.id + ' in the static recipes');
  }
  assert.deepEqual(by('gtceu:uev_wireless_energy_hatch').inputs, ['1x gtceu:uev_sensor', '1x gtceu:uev_energy_input_hatch', '2x #gtceu:circuits/uev', '1x ' + LINK]);
  assert.deepEqual(by('gtceu:uev_wireless_dynamo_hatch').inputs, ['1x gtceu:uev_emitter', '1x gtceu:uev_energy_output_hatch', '2x #gtceu:circuits/uev', '1x ' + LINK]);
  assert.deepEqual(by('gtceu:uev_wireless_energy_hatch_4a').inputs, ['1x gtceu:uev_wireless_energy_hatch', '2x ' + WIRE + 'quadruple_wire', '2x ' + PLATE]);
  assert.deepEqual(by('gtceu:uev_wireless_dynamo_hatch_16a').inputs, ['1x gtceu:uev_wireless_dynamo_hatch_4a', '2x ' + WIRE + 'octal_wire', '4x ' + PLATE]);
  assert.deepEqual(by('gtceu:uev_wireless_energy_hatch_64a').inputs, ['1x gtceu:uev_wireless_energy_hatch_16a', '2x ' + WIRE + 'hex_wire', '6x ' + PLATE]);
  for (const c of COVERS) assert.ok(by(c).inputs.includes('1x ' + LINK), c + ' links with the node');
});

test('tiers below UEV are untouched: ids, capacities and the 9 existing rows', () => {
  assert.deepEqual(WIRELESS.tiers.map((r) => r.name).slice(0, 9), ['lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv'].slice(0, 9));
  assert.ok(WIRELESS.tiers.length >= 10, 'UEV is row 10; later eras append');
  assert.equal(WIRELESS.tiers.find((r) => r.name === 'uhv').capacity, 62914560000);
});

test('names and textures: en_us and es_es in GTM\'s UEV colour, the EMI line of circuit 6, the five UEV textures', () => {
  const { lang } = run;
  const keys = HATCHES.map((id) => 'block.' + id.replace(':', '.')).concat(COVERS.map((id) => 'item.' + id.replace(':', '.')));
  for (const l of ['en_us', 'es_es']) {
    for (const k of keys) assert.match(String(lang[l][k]), /^\u00a7a.*UEV/, l + ' ' + k);
    assert.ok(lang[l]['block.grindless.uev_smes_cell'], l + ' names the cell');
    assert.ok(lang[l]['gtceu.recipe.grindless_naquadria_magnets.uev_smes_cell'], l + ': the EMI line of circuit 6');
  }
  assert.equal(lang.en_us['block.grindless.uev_smes_cell'], 'UEV SMES Cell');
  assert.equal(lang.en_us['block.gtceu.uev_wireless_dynamo_hatch_64a'], '\u00a7aUEV 64A Wireless Dynamo Hatch');
  const tex = path.join(pack, 'kubejs', 'assets', 'grindless', 'textures');
  for (const rel of ['block/wireless/smes_cell_uev', 'block/cover/wireless_energy_cover_uev', 'block/cover/wireless_dynamo_cover_uev',
    'item/wireless/energy_cover_uev', 'item/wireless/dynamo_cover_uev']) assert.ok(fs.existsSync(path.join(tex, rel + '.png')), rel);
});

test('the smoke test\'s band: uev_wireless at X 31744, 64 wide, its overlay script present', () => {
  const zones = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'test', 'zones.json'), 'utf8'));
  const list = Array.isArray(zones) ? zones : zones.zones;
  const z = list.find((x) => x.id === 'uev_wireless');
  assert.ok(z, 'the row');
  assert.deepEqual([z.x, z.z], [[31744, 31807], [0, 63]]);
  assert.ok(z.y[0] >= 60 && z.y[1] <= 120);
  assert.ok(z.tests.includes('uev_wireless'));
  assert.ok(fs.existsSync(path.join(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_uev_wireless.js')));
});
