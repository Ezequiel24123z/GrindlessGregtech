// UXV's wireless tier (package UXV-W, docs/eras/uxv.md 'W. UXV wireless tier'), no game needed: withTiers case 12, the UXV row of
// tables/wireless_energy.json, the caps held as longs, and the nitride magnet works' circuit 7 (tables/composites.json) that makes the UXV cell.
// The settlement itself (64 A hatch, a cell above 2^41 EU, 60 s of a 16 A draw at 2^31 EU/t) runs in the game: gg_test_uxv_wireless.
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
const CELL = 'grindless:uxv_smes_cell';
const UIV_CELL = 'grindless:uiv_smes_cell';
const CELL_EU = 4026531840000;
const UXV = 12;
const V_UXV = 134217728;
const MACHINE = 'gtceu:nitride_magnet_works';
const LINK = 'grindless:pasta_strand_repeater';
const HATCHES = [];
for (const kind of ['energy', 'dynamo']) for (const a of WIRELESS.hatchAmps) HATCHES.push(`gtceu:uxv_wireless_${kind}_hatch${a === 2 ? '' : '_' + a + 'a'}`);
const COVERS = ['grindless:uxv_wireless_energy_cover', 'grindless:uxv_wireless_dynamo_cover'];

test('the stand-in runs the wireless and composites scripts without errors', () => {
  const errs = run.errors.filter((e) => /wireless|composites/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
});

test('the UXV row: tier 12, 1,536 UV naquadria batteries (four UIV cells, past 2^41), the pasta strand repeater as the link', () => {
  const rows = WIRELESS.tiers.filter((r) => r.name === 'uxv');
  assert.equal(rows.length, 1);
  const uxv = rows[0];
  assert.equal(WIRELESS.tiers[WIRELESS.tiers.length - 1], uxv, 'the last row');
  assert.deepEqual([uxv.tier, uxv.cell, uxv.capacity, uxv.referenceBattery, uxv.referenceCount],
    [UXV, CELL, CELL_EU, 'gtceu:uv_naquadria_battery', 1536]);
  assert.equal(uxv.capacity, uxv.referenceCount * 2621440000);
  assert.ok(uxv.capacity > 2 ** 41, 'above 2^41');
  assert.equal(uxv.capacity, 4 * WIRELESS.tiers.find((r) => r.name === 'uiv').capacity, 'four UIV cells\' worth');
  assert.equal(uxv.cellMadeBy, MACHINE);
  assert.equal(uxv.texture, 'grindless:block/wireless/smes_cell_uxv');
  assert.equal(uxv.batteries, null);
  assert.equal(uxv.frame, null);
  assert.deepEqual([uxv.emitter, uxv.sensor, uxv.signalParts, uxv.link, uxv.plate, uxv.wire],
    ['gtceu:uxv_emitter', 'gtceu:uxv_sensor', 1, LINK, 'grindless:lasagna_plate', 'pasta_strand']);
});

test('withTiers case 12 is spelled out and the default message says 1 to 12 tiers', () => {
  const src = fs.readFileSync(path.join(pack, 'kubejs', 'startup_scripts', 'grindless', 'lv', 'wireless_energy.js'), 'utf8');
  assert.match(src, /case 12:\s*return b\.tiers\(t\[0\], t\[1\], t\[2\], t\[3\], t\[4\], t\[5\], t\[6\], t\[7\], t\[8\], t\[9\], t\[10\], t\[11\]\)/);
  assert.match(src, /1 to 12 tiers/);
});

test('registration: the cell is a block, eight hatches and two covers, all from lv/wireless_energy.js', () => {
  const rel = 'kubejs/startup_scripts/grindless/lv/wireless_energy.js';
  assert.equal((run.registry.blocks.get(CELL) || {}).file, rel, 'a block');
  assert.equal((run.registry.items.get(CELL) || {}).file, rel, 'its block item');
  assert.equal(HATCHES.length, 8);
  for (const id of HATCHES) assert.equal((run.registry.machines.get(id) || {}).file, rel, id);
  for (const id of COVERS) assert.equal((run.registry.items.get(id) || {}).file, rel, id);
  assert.deepEqual(plain(W.cells[CELL]), { tier: UXV, capacity: CELL_EU, madeBy: MACHINE });
  assert.deepEqual(plain(W.hatches['gtceu:uxv_wireless_dynamo_hatch_64a']), { kind: 'dynamo', tier: UXV, amps: 64 });
  assert.equal(W.tierLabels[UXV], 'UXV');
});

test('the window caps are derived (V[UXV] x amps x the window) and every one past 2^31 stays exact', () => {
  const t = W.settleTicks;
  assert.equal(W.rate(UXV, 2) * t, 2684354560);
  assert.equal(W.rate(UXV, 4) * t, 5368709120);
  assert.equal(W.rate(UXV, 16) * t, 21474836480);
  assert.equal(W.rate(UXV, 64) * t, 85899345920);
  assert.ok(W.rate(UXV, 2) * t > 2 ** 31 - 1, 'even the 2 A cap is past an int');
  assert.equal(V_UXV * 16, 2 ** 31, 'a 16 A draw per tick is 2^31');
  assert.equal(V_UXV * 16 * 1200, 2576980377600, '60 s of it');
  assert.ok(Number.isSafeInteger(CELL_EU * 3), 'three cells fit a double exactly');
});

test('circuit 7 of the nitride magnet works makes the UXV cell: four UIV cells, strand tape, lasagna plate, the He-II charge', () => {
  const rows = COMPOSITES.types.nitride_magnet_synthesis.recipes;
  const entry = rows.find((r) => r.name === 'uxv_smes_cell');
  assert.ok(entry);
  assert.equal(entry.circuit, 7);
  assert.equal(new Set(rows.map((r) => r.circuit)).size, rows.length, 'every row its own circuit');
  assert.deepEqual(entry.itemsIn, [{ id: UIV_CELL, count: 4 }, { id: 'grindless:strand_tape', count: 16 }]);
  assert.deepEqual(entry.charge, [{ id: 'gtceu:superfluid_helium', amount: 1000 }]);
  assert.deepEqual(entry.fluidsIn, []);
  assert.deepEqual(entry.itemsOut, [{ id: CELL, count: 1 }]);
  assert.equal(entry.eut, 1966080);
  assert.equal(entry.duration, 600);
  assert.equal(plain(W.recipes).filter((r) => r.output === CELL).length, 0, 'no assembler cell');
});

test('the UXV hatches and covers: assembler recipes with the link on the 2 A hatches and covers', () => {
  const recipes = plain(W.recipes);
  const by = (out) => recipes.find((r) => r.output === out);
  for (const id of [...HATCHES, ...COVERS]) {
    const r = by(id);
    assert.ok(r, id);
    assert.equal(r.eut, V_UXV, id);
  }
  assert.deepEqual(by('gtceu:uxv_wireless_energy_hatch').inputs, ['1x gtceu:uxv_sensor', '1x gtceu:uxv_energy_input_hatch', '2x #gtceu:circuits/uxv', '1x ' + LINK]);
  assert.deepEqual(by('gtceu:uxv_wireless_energy_hatch_64a').inputs, ['1x gtceu:uxv_wireless_energy_hatch_16a', '2x gtceu:pasta_strand_hex_wire', '6x grindless:lasagna_plate']);
  for (const c of COVERS) assert.ok(by(c).inputs.includes('1x ' + LINK), c);
});

test('tiers 1-11 are untouched', () => {
  assert.deepEqual(WIRELESS.tiers.map((r) => r.name).slice(0, 11), ['lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv']);
  assert.equal(WIRELESS.tiers.length, 12);
  assert.equal(WIRELESS.tiers.find((r) => r.name === 'uiv').capacity, 1006632960000);
  assert.equal(WIRELESS.tiers.find((r) => r.name === 'uev').capacity, 251658240000);
});

test('names: en_us and es_es for the UXV hatches, covers, cell and the EMI line of circuit 7', () => {
  const { lang } = run;
  const keys = HATCHES.map((id) => 'block.' + id.replace(':', '.')).concat(COVERS.map((id) => 'item.' + id.replace(':', '.')));
  for (const l of ['en_us', 'es_es']) {
    for (const k of keys) assert.match(String(lang[l][k]), /UXV/, l + ' ' + k);
    assert.ok(lang[l]['block.grindless.uxv_smes_cell'], l + ' names the cell');
    assert.ok(lang[l]['gtceu.recipe.grindless_nitride_magnet_synthesis.uxv_smes_cell'], l + ': the EMI line of circuit 7');
  }
  assert.equal(lang.en_us['block.grindless.uxv_smes_cell'], 'UXV SMES Cell');
});

test('the cell\'s texture and the covers\' are written by Build-UXVWirelessTextures.ps1', () => {
  const tex = path.join(pack, 'kubejs', 'assets', 'grindless', 'textures');
  for (const rel of ['block/wireless/smes_cell_uxv', 'block/cover/wireless_energy_cover_uxv', 'block/cover/wireless_dynamo_cover_uxv',
    'item/wireless/energy_cover_uxv', 'item/wireless/dynamo_cover_uxv']) {
    assert.ok(fs.existsSync(path.join(tex, rel + '.png')), rel);
  }
});

test('the smoke test\'s band: uxv_wireless at X 36352, 64 wide, its overlay script present', () => {
  const zones = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'test', 'zones.json'), 'utf8'));
  const list = Array.isArray(zones) ? zones : zones.zones;
  const z = list.find((x) => x.id === 'uxv_wireless');
  assert.ok(z, 'the row');
  assert.deepEqual([z.x, z.z, z.y], [[36352, 36415], [0, 63], [98, 112]]);
  assert.ok(z.tests.includes('uxv_wireless'));
  assert.ok(fs.existsSync(path.join(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_uxv_wireless.js')));
});
