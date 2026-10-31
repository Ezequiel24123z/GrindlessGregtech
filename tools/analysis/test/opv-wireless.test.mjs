// OpV's wireless tier (package OpV-W, docs/eras/opv.md 'W. Wireless case 13'), no game needed: withTiers case 13, the OpV row of
// tables/wireless_energy.json, the caps held as longs, the cell and repeater recipes of opv/wireless.js, names and textures.
// The settlement itself (a 64 A OpV hatch drawing 2^35 EU in one tick, the cell storing 16,106,127,360,000 EU) runs in the game:
// gg_test_opv_wireless.
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
const OW = run.global.grindless.opvWireless;
const tables = path.join(pack, 'kubejs', 'data', 'grindless', 'tables');
const WIRELESS = JSON.parse(fs.readFileSync(path.join(tables, 'wireless_energy.json'), 'utf8'));
const CELL = 'grindless:opv_smes_cell';
const CELL_EU = 16106127360000;
const OPV = 13;
const V_OPV = 536870912;
// the stand-in's VA[13] is V[13]; in the game GTValues.VA[OpV] is 503,316,480 EU/t (the overlay reads it live)
const VA_OPV = V_OPV;
const MACHINE = 'gtceu:opv_assembler';
const LINK = 'grindless:chain_strand_repeater';
const PLATE = 'grindless:field_frozen_plate';
const HATCHES = [];
for (const kind of ['energy', 'dynamo']) for (const a of WIRELESS.hatchAmps) HATCHES.push(`gtceu:opv_wireless_${kind}_hatch${a === 2 ? '' : '_' + a + 'a'}`);
const COVERS = ['grindless:opv_wireless_energy_cover', 'grindless:opv_wireless_dynamo_cover'];
const docs = run.docs.recipes.recipes;
const find = (id) => docs.find((r) => r.i === id);

test('the stand-in runs the wireless scripts without errors', () => {
  const errs = run.errors.filter((e) => /wireless/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
});

test('the OpV row: tier 13, 6,144 UV naquadria batteries (four UXV cells), the chain strand repeater as the link', () => {
  const rows = WIRELESS.tiers.filter((r) => r.name === 'opv');
  assert.equal(rows.length, 1);
  const opv = rows[0];
  assert.equal(WIRELESS.tiers[12], opv, 'the thirteenth row');
  assert.deepEqual([opv.tier, opv.cell, opv.capacity, opv.referenceBattery, opv.referenceCount],
    [OPV, CELL, CELL_EU, 'gtceu:uv_naquadria_battery', 6144]);
  assert.equal(opv.capacity, opv.referenceCount * 2621440000);
  assert.equal(opv.capacity, 4 * WIRELESS.tiers.find((r) => r.name === 'uxv').capacity, 'four UXV cells\' worth');
  assert.ok(Number.isSafeInteger(opv.capacity) && opv.capacity > 2 ** 43, 'past 2^43, exact as a double and a long');
  assert.equal(opv.cellMadeBy, MACHINE);
  assert.equal(opv.texture, 'grindless:block/wireless/smes_cell_opv');
  assert.equal(opv.batteries, null);
  assert.equal(opv.frame, null);
  assert.deepEqual([opv.emitter, opv.sensor, opv.signalParts, opv.link, opv.plate, opv.wire],
    ['gtceu:opv_emitter', 'gtceu:opv_sensor', 1, LINK, PLATE, 'chain_strand']);
});

test('withTiers case 13 is spelled out and the default message says 1 to 13 tiers', () => {
  const src = fs.readFileSync(path.join(pack, 'kubejs', 'startup_scripts', 'grindless', 'lv', 'wireless_energy.js'), 'utf8');
  assert.match(src, /case 13:\s*return b\.tiers\(t\[0\], t\[1\], t\[2\], t\[3\], t\[4\], t\[5\], t\[6\], t\[7\], t\[8\], t\[9\], t\[10\], t\[11\], t\[12\]\)/);
  assert.match(src, /1 to 14 tiers/);
});

test('registration: the cell is a block, eight hatches and two covers, all from lv/wireless_energy.js', () => {
  const rel = 'kubejs/startup_scripts/grindless/lv/wireless_energy.js';
  assert.equal((run.registry.blocks.get(CELL) || {}).file, rel, 'a block');
  assert.equal((run.registry.items.get(CELL) || {}).file, rel, 'its block item');
  assert.equal(HATCHES.length, 8);
  for (const id of HATCHES) assert.equal((run.registry.machines.get(id) || {}).file, rel, id);
  for (const id of COVERS) assert.equal((run.registry.items.get(id) || {}).file, rel, id);
  assert.deepEqual(plain(W.cells[CELL]), { tier: OPV, capacity: CELL_EU, madeBy: MACHINE });
  assert.deepEqual(plain(W.hatches['gtceu:opv_wireless_energy_hatch_64a']), { kind: 'hatch', tier: OPV, amps: 64 });
  // GTM's VN, upper-cased by the stand-in ('OpV' in the game)
  assert.equal(W.tierLabels[OPV].toLowerCase(), 'opv');
});

test('the window caps are derived (V[OpV] x amps x the window), every one past 2^31 and exact as a long', () => {
  const t = W.settleTicks;
  assert.equal(W.rate(OPV, 2) * t, 10737418240);
  assert.equal(W.rate(OPV, 4) * t, 21474836480);
  assert.equal(W.rate(OPV, 16) * t, 85899345920);
  assert.equal(W.rate(OPV, 64) * t, 343597383680);
  for (const a of WIRELESS.hatchAmps) assert.ok(Number.isSafeInteger(W.rate(OPV, a) * t) && W.rate(OPV, a) * t > 2 ** 31 - 1, a + ' A');
  assert.equal(V_OPV * 64, 2 ** 35, 'a 64 A draw per tick is 2^35');
  assert.ok(Number.isSafeInteger(CELL_EU * 3), 'three cells fit a double exactly');
});

test('opv/wireless.js: the repeater and the cell in the assembler at VA[OpV], from OpV-era parts', () => {
  assert.deepEqual(plain(OW.recipes), ['grindless:assembler/chain_strand_repeater', 'grindless:assembler/opv_smes_cell']);
  const rep = find('grindless:assembler/chain_strand_repeater');
  assert.ok(rep && rep.t === 'gtceu:assembler', 'the repeater');
  const rt = JSON.stringify(rep.j);
  for (const id of ['gtceu:chain_strand_single_wire', 'grindless:pasta_strand_repeater', 'grindless:tetron_die', LINK, String(VA_OPV)]) assert.ok(rt.includes(id), 'repeater: ' + id);
  const cell = find('grindless:assembler/opv_smes_cell');
  assert.ok(cell && cell.t === 'gtceu:assembler', 'the cell');
  const ct = JSON.stringify(cell.j);
  for (const id of ['gtceu:chain_strand_single_wire', 'grindless:chain_lamina_stack', 'gtceu:opv_field_generator', CELL, String(VA_OPV)]) assert.ok(ct.includes(id), 'cell: ' + id);
  const making = docs.filter((r) => JSON.stringify((r.j || {}).outputs || {}).includes('"' + CELL + '"'));
  assert.deepEqual(making.map((r) => r.i), ['grindless:assembler/opv_smes_cell'], 'the cell\'s only recipe');
  assert.equal(plain(W.recipes).filter((r) => r.output === CELL).length, 0, 'no table cell recipe (cellMadeBy)');
  assert.ok(VA_OPV > 134217728, 'every OpV row runs above V[UXV]');
});

test('the OpV hatches and covers: assembler recipes at VA[OpV] with OpV parts, the link on the 2 A hatches and covers', () => {
  const recipes = plain(W.recipes);
  const by = (out) => recipes.find((r) => r.output === out);
  for (const id of [...HATCHES, ...COVERS]) {
    const r = by(id);
    assert.ok(r, id);
    assert.equal(r.eut, VA_OPV, id);
    assert.ok(find(r.id), r.id + ' in the static recipes');
  }
  assert.deepEqual(by('gtceu:opv_wireless_energy_hatch').inputs, ['1x gtceu:opv_sensor', '1x gtceu:opv_energy_input_hatch', '2x #gtceu:circuits/opv', '1x ' + LINK]);
  assert.deepEqual(by('gtceu:opv_wireless_dynamo_hatch').inputs, ['1x gtceu:opv_emitter', '1x gtceu:opv_energy_output_hatch', '2x #gtceu:circuits/opv', '1x ' + LINK]);
  assert.deepEqual(by('gtceu:opv_wireless_energy_hatch_64a').inputs, ['1x gtceu:opv_wireless_energy_hatch_16a', '2x gtceu:chain_strand_hex_wire', '6x ' + PLATE]);
  for (const c of COVERS) assert.ok(by(c).inputs.includes('1x ' + LINK) && by(c).inputs.includes('1x ' + PLATE), c);
});

test('tiers 1-12 are untouched (MAX-W appends the fourteenth row)', () => {
  assert.deepEqual(WIRELESS.tiers.map((r) => r.name), ['lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max']);
  assert.equal(WIRELESS.tiers.find((r) => r.name === 'uxv').capacity, 4026531840000);
  assert.equal(WIRELESS.tiers.find((r) => r.name === 'uxv').cellMadeBy, 'gtceu:nitride_magnet_works');
});

test('names: en_us and es_es for the OpV hatches, covers and cell', () => {
  const { lang } = run;
  const keys = HATCHES.map((id) => 'block.' + id.replace(':', '.')).concat(COVERS.map((id) => 'item.' + id.replace(':', '.')));
  for (const l of ['en_us', 'es_es']) {
    for (const k of keys) assert.match(String(lang[l][k]), /^\u00a79\u00a7l.*OpV/, l + ' ' + k);
    assert.ok(lang[l]['block.grindless.opv_smes_cell'], l + ' names the cell');
  }
  assert.equal(lang.en_us['block.grindless.opv_smes_cell'], 'OpV SMES Cell');
  assert.equal(lang.es_es['block.grindless.opv_smes_cell'], 'Celda SMES OpV');
  assert.equal(lang.en_us['block.gtceu.opv_wireless_energy_hatch_64a'], '\u00a79\u00a7lOpV 64A Wireless Energy Hatch');
});

test('the cell\'s texture and the covers\' are written by Build-OpVWirelessTextures.ps1', () => {
  assert.ok(fs.existsSync(path.join(root, 'tools', 'assets', 'Build-OpVWirelessTextures.ps1')));
  const tex = path.join(pack, 'kubejs', 'assets', 'grindless', 'textures');
  for (const rel of ['block/wireless/smes_cell_opv', 'block/cover/wireless_energy_cover_opv', 'block/cover/wireless_dynamo_cover_opv',
    'item/wireless/energy_cover_opv', 'item/wireless/dynamo_cover_opv']) {
    assert.ok(fs.existsSync(path.join(tex, rel + '.png')), rel);
  }
});

test('the smoke test\'s band: opv_wireless at X 37696, 64 wide, its overlay script present', () => {
  const zones = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'test', 'zones.json'), 'utf8'));
  const list = Array.isArray(zones) ? zones : zones.zones;
  const z = list.find((x) => x.id === 'opv_wireless');
  assert.ok(z, 'the row');
  assert.deepEqual([z.x, z.z, z.y], [[37696, 37759], [0, 63], [98, 112]]);
  assert.ok(z.tests.includes('opv_wireless'));
  assert.ok(fs.existsSync(path.join(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_opv_wireless.js')));
});
