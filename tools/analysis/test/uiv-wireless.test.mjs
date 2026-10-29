// UIV's wireless tier (package UIV-W, docs/eras/uiv.md 'W. UIV wireless tier'), no game needed: withTiers case 11, the UIV row of
// tables/wireless_energy.json, the caps held as longs, and the nitride magnet works' circuit 4 (tables/composites.json) that makes the UIV cell.
// The settlement itself (64 A hatch, a cell above 2^39 EU, 60 s of a 16 A draw) runs in the game: gg_test_uiv_wireless.
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
const tables = path.join(pack, 'kubejs', 'data', 'grindless', 'tables');
const WIRELESS = JSON.parse(fs.readFileSync(path.join(tables, 'wireless_energy.json'), 'utf8'));
const COMPOSITES = JSON.parse(fs.readFileSync(path.join(tables, 'composites.json'), 'utf8'));
const CELL = 'grindless:uiv_smes_cell';
const UEV_CELL = 'grindless:uev_smes_cell';
const CELL_EU = 1006632960000;
const UIV = 11;
const V_UIV = 33554432;
const MACHINE = 'gtceu:nitride_magnet_works';
const LINK = 'grindless:pulsar_timed_repeater';
const HATCHES = [];
for (const kind of ['energy', 'dynamo']) for (const a of WIRELESS.hatchAmps) HATCHES.push(`gtceu:uiv_wireless_${kind}_hatch${a === 2 ? '' : '_' + a + 'a'}`);
const COVERS = ['grindless:uiv_wireless_energy_cover', 'grindless:uiv_wireless_dynamo_cover'];

test('the stand-in runs the wireless and composites scripts without errors', () => {
  const errs = run.errors.filter((e) => /wireless|composites/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
});

test('the UIV row: tier 11, 384 UV naquadria batteries (four UEV cells, past 2^39), the pulsar-timed repeater as the link', () => {
  const rows = WIRELESS.tiers.filter((r) => r.name === 'uiv');
  assert.equal(rows.length, 1);
  const uiv = rows[0];
  assert.equal(WIRELESS.tiers[10], uiv, 'the eleventh row (UXV-W appends uxv after it)');
  assert.deepEqual([uiv.tier, uiv.cell, uiv.capacity, uiv.referenceBattery, uiv.referenceCount],
    [UIV, CELL, CELL_EU, 'gtceu:uv_naquadria_battery', 384]);
  assert.equal(uiv.capacity, uiv.referenceCount * 2621440000);
  assert.ok(uiv.capacity > 2 ** 39, 'above 2^39');
  assert.equal(uiv.capacity, 4 * WIRELESS.tiers.find((r) => r.name === 'uev').capacity, 'four UEV cells\' worth');
  assert.equal(uiv.cellMadeBy, MACHINE);
  assert.equal(uiv.batteries, null);
  assert.equal(uiv.frame, null);
  assert.deepEqual([uiv.emitter, uiv.sensor, uiv.signalParts, uiv.link, uiv.plate, uiv.wire],
    ['grindless:uiv_emitter', 'grindless:uiv_sensor', 1, LINK, 'gtceu:rhea_plate', 'metallic_hydrogen']);
});

test('withTiers case 11 is spelled out and the default message says 1 to 11 tiers', () => {
  const src = fs.readFileSync(path.join(pack, 'kubejs', 'startup_scripts', 'grindless', 'lv', 'wireless_energy.js'), 'utf8');
  assert.match(src, /case 11:\s*return b\.tiers\(t\[0\], t\[1\], t\[2\], t\[3\], t\[4\], t\[5\], t\[6\], t\[7\], t\[8\], t\[9\], t\[10\]\)/);
  assert.match(src, /1 to 1\d tiers/);
});

test('registration: the cell is a block, eight hatches and two covers, all from lv/wireless_energy.js', () => {
  const rel = 'kubejs/startup_scripts/grindless/lv/wireless_energy.js';
  assert.equal((run.registry.blocks.get(CELL) || {}).file, rel, 'a block');
  assert.equal((run.registry.items.get(CELL) || {}).file, rel, 'its block item');
  assert.equal(HATCHES.length, 8);
  for (const id of HATCHES) assert.equal((run.registry.machines.get(id) || {}).file, rel, id);
  for (const id of COVERS) assert.equal((run.registry.items.get(id) || {}).file, rel, id);
  assert.deepEqual(plain(W.cells[CELL]), { tier: UIV, capacity: CELL_EU, madeBy: MACHINE });
  assert.deepEqual(plain(W.hatches['gtceu:uiv_wireless_dynamo_hatch_64a']), { kind: 'dynamo', tier: UIV, amps: 64 });
  assert.equal(W.tierLabels[UIV], 'UIV');
});

test('the window caps are derived (V[UIV] x amps x the window) and the 64 A cap is past an int', () => {
  const t = W.settleTicks;
  assert.equal(W.rate(UIV, 2) * t, 671088640);
  assert.equal(W.rate(UIV, 4) * t, 1342177280);
  assert.equal(W.rate(UIV, 16) * t, 5368709120);
  assert.equal(W.rate(UIV, 64) * t, 21474836480);
  assert.ok(W.rate(UIV, 64) * t > 2 ** 31 - 1);
  assert.equal(V_UIV * 16, 536870912, 'a 16 A draw per tick');
  assert.equal(V_UIV * 16 * 1200, 644245094400, '60 s of it');
});

test('circuit 4 of the nitride magnet works makes the UIV cell: four UEV cells, metallic hydrogen wire, the helium charge', () => {
  const rows = COMPOSITES.types.nitride_magnet_synthesis.recipes;
  const entry = rows.find((r) => r.name === 'uiv_smes_cell');
  assert.ok(entry);
  assert.equal(entry.circuit, 4);
  assert.equal(new Set(rows.map((r) => r.circuit)).size, rows.length, 'every row its own circuit');
  assert.deepEqual(entry.itemsIn, [{ id: UEV_CELL, count: 4 }, { id: 'gtceu:metallic_hydrogen_single_wire', count: 16 }]);
  assert.deepEqual(entry.charge, [{ id: 'gtceu:liquid_helium', amount: 1000 }]);
  assert.deepEqual(entry.itemsOut, [{ id: CELL, count: 1 }]);
  assert.equal(entry.eut, 1966080);
  assert.equal(entry.duration, 600);
  const docs = run.docs.recipes.recipes;
  const making = docs.filter((d) => JSON.stringify((d.j || {}).outputs || (d.j || {}).result || {}).includes('"' + CELL + '"'));
  assert.equal(making.length, 1, 'the only recipe of the cell');
  assert.equal(plain(W.recipes).filter((r) => r.output === CELL).length, 0, 'no assembler cell');
});

test('the UIV hatches and covers: assembler recipes with the link on the 2 A hatches and covers', () => {
  const recipes = plain(W.recipes);
  const by = (out) => recipes.find((r) => r.output === out);
  for (const id of [...HATCHES, ...COVERS]) {
    const r = by(id);
    assert.ok(r, id);
    assert.equal(r.eut, V_UIV, id);
  }
  assert.deepEqual(by('gtceu:uiv_wireless_energy_hatch').inputs, ['1x grindless:uiv_sensor', '1x gtceu:uiv_energy_input_hatch', '2x #gtceu:circuits/uiv', '1x ' + LINK]);
  assert.deepEqual(by('gtceu:uiv_wireless_energy_hatch_64a').inputs, ['1x gtceu:uiv_wireless_energy_hatch_16a', '2x gtceu:metallic_hydrogen_hex_wire', '6x gtceu:rhea_plate']);
  for (const c of COVERS) assert.ok(by(c).inputs.includes('1x ' + LINK), c);
});

test('tiers 1-10 are untouched', () => {
  assert.deepEqual(WIRELESS.tiers.map((r) => r.name).slice(0, 10), ['lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev']);
  assert.equal(WIRELESS.tiers.length, 12); // UXV-W appends the twelfth
  assert.equal(WIRELESS.tiers.find((r) => r.name === 'uev').capacity, 251658240000);
  assert.equal(WIRELESS.tiers.find((r) => r.name === 'uhv').capacity, 62914560000);
});

test('names: en_us and es_es for the UIV hatches, covers, cell and the EMI line of circuit 4', () => {
  const { lang } = run;
  const keys = HATCHES.map((id) => 'block.' + id.replace(':', '.')).concat(COVERS.map((id) => 'item.' + id.replace(':', '.')));
  for (const l of ['en_us', 'es_es']) {
    for (const k of keys) assert.match(String(lang[l][k]), /UIV/, l + ' ' + k);
    assert.ok(lang[l]['block.grindless.uiv_smes_cell'], l + ' names the cell');
    assert.ok(lang[l]['gtceu.recipe.grindless_nitride_magnet_synthesis.uiv_smes_cell'], l + ': the EMI line of circuit 4');
  }
  assert.equal(lang.en_us['block.grindless.uiv_smes_cell'], 'UIV SMES Cell');
});

test('the smoke test\'s band: uiv_wireless at X 35328, 64 wide, its overlay script present', () => {
  const zones = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'test', 'zones.json'), 'utf8'));
  const list = Array.isArray(zones) ? zones : zones.zones;
  const z = list.find((x) => x.id === 'uiv_wireless');
  assert.ok(z, 'the row');
  assert.deepEqual([z.x, z.z, z.y], [[35328, 35391], [0, 63], [98, 112]]);
  assert.ok(z.tests.includes('uiv_wireless'));
  assert.ok(fs.existsSync(path.join(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_uiv_wireless.js')));
});
