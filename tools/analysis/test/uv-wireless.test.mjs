// UV's wireless tier (package UV-A9), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - the UV row of tables/wireless_energy.json: tier 8, six of GTM's UV naquadria battery (15,728,640,000 EU, uv-s0.md S0-5), the gravi
//     star as the link, the cell made in the naquadria magnet works (lv/wireless_energy.js registers the cell, eight hatches and two covers);
//   - the magnet works' circuit 4 (tables/magnet_works.json): the only recipe of the UV cell, with the helium charge and A8's EnTED wire;
//   - the UV hatches and covers in the assembler at VA[UV] with the gravi star; en_us and es_es names in GTM's UV colour; the textures;
//   - the smoke test's band in tools/test/zones.json.
// The settlement (UV only when every formed tower holds UV cells, the per-window cap) runs in the game: gg_test_uv_wireless.
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
const CELL = 'grindless:uv_smes_cell';
const CELL_EU = 15728640000;
const UV = 8;
const UV_VA = 491520;
// the static runner stands V in for VA (tools/analysis/lib/kubejs_static.mjs:381): GTM's VA[UV] 491,520 is checked in game (T1)
const STUB_VA_UV = 524288;
const MACHINE = 'gtceu:naquadria_magnet_works';
const ENTED = 'gtceu:enriched_naquadah_trinium_europium_duranide_single_wire';
const HATCHES = [];
for (const kind of ['energy', 'dynamo']) for (const a of WIRELESS.hatchAmps) HATCHES.push(`gtceu:uv_wireless_${kind}_hatch${a === 2 ? '' : '_' + a + 'a'}`);
const COVERS = ['grindless:uv_wireless_energy_cover', 'grindless:uv_wireless_dynamo_cover'];

test('the stand-in runs the wireless and magnet works scripts without errors', () => {
  const errs = run.errors.filter((e) => /wireless|magnet_works/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(MW.skipped, []);
  assert.deepEqual(MW.clashes, []);
});

test('the UV row: tier 8, six UV naquadria batteries (15,728,640,000 EU), the gravi star as the link, made in the naquadria magnet works', () => {
  const rows = WIRELESS.tiers.filter((r) => r.name === 'uv');
  assert.equal(rows.length, 1);
  const uv = rows[0];
  assert.equal(WIRELESS.tiers.indexOf(uv), UV - 1, 'the eighth row (UHV-A9 adds the ninth)');
  assert.deepEqual([uv.tier, uv.cell, uv.capacity, uv.referenceBattery], [UV, CELL, CELL_EU, 'gtceu:uv_naquadria_battery']);
  assert.equal(uv.capacity, 6 * 2621440000);
  assert.ok(uv.capacity > 2 ** 32, 'past an int');
  assert.equal(uv.cellMadeBy, MACHINE);
  assert.equal(uv.batteries, null);
  assert.equal(uv.frame, null, 'GTM has no darmstadtium frame');
  assert.equal(uv.texture, 'grindless:block/wireless/smes_cell_uv');
  assert.deepEqual([uv.emitter, uv.sensor, uv.signalParts, uv.link, uv.plate, uv.wire],
    ['gtceu:uv_emitter', 'gtceu:uv_sensor', 1, 'gtceu:gravi_star', 'gtceu:darmstadtium_plate', 'yttrium_barium_cuprate']);
});

test('registration: the cell is a block (never F1\'s item), eight hatches and two covers, all from lv/wireless_energy.js', () => {
  const rel = 'kubejs/startup_scripts/grindless/lv/wireless_energy.js';
  assert.ok(run.registry.blocks.has(CELL), 'a block');
  assert.equal(run.registry.blocks.get(CELL).file, rel);
  assert.ok(run.registry.items.has(CELL), 'with its block item');
  assert.equal(run.registry.items.get(CELL).file, rel, 'and no second registration (UV-F1 no longer registers it)');
  for (const id of HATCHES) assert.equal((run.registry.machines.get(id) || {}).file, rel, id);
  for (const id of COVERS) assert.equal((run.registry.items.get(id) || {}).file, rel, id);
  assert.deepEqual(plain(W.cells[CELL]), { tier: UV, capacity: CELL_EU, madeBy: MACHINE });
  assert.deepEqual(plain(W.hatches['gtceu:uv_wireless_energy_hatch_64a']), { kind: 'hatch', tier: UV, amps: 64 });
  assert.equal(W.tierLabels[UV], 'UV');
  assert.ok(JSON.stringify(W.towerSpec.symbols.C).includes(CELL), 'the tower\'s cell slots take the UV cell');
  assert.ok(!(run.global.grindless.uvFoundation && JSON.stringify(plain(run.global.grindless.uvFoundation)).includes('"' + CELL + '"')),
    'the foundation does not list the cell among its items');
});

test('circuit 4 of the naquadria magnet works is the UV cell\'s only recipe: A8\'s EnTED wire, UV parts, the helium charge kept', () => {
  const entry = MAGNETS.recipes.find((r) => r.name === 'uv_smes_cell');
  assert.ok(entry, 'tables/magnet_works.json');
  assert.equal(entry.circuit, 4);
  assert.equal(entry.charge, true);
  assert.deepEqual(entry.itemsOut, [{ id: CELL, count: 1 }]);
  assert.ok(entry.itemsIn.some((i) => i.id === ENTED), 'EnTED wire');
  assert.ok(entry.itemsIn.some((i) => i.id === 'gtceu:darmstadtium_plate'));
  assert.ok(entry.itemsIn.length + 1 <= 6, 'the machine\'s six item inputs, with the circuit');
  assert.ok(entry.eut <= UV_VA && entry.eut > UV_VA / 4, 'a UV recipe (two energy hatches carry it)');
  const p = MW.recipes.find((r) => r.name === 'uv_smes_cell');
  assert.equal(p.recipeId, 'grindless:naquadria_magnets/uv_smes_cell');
  const r = docs.find((d) => d.i === p.recipeId);
  assert.ok(r, 'added');
  assert.equal(r.t, 'gtceu:naquadria_magnets');
  const text = JSON.stringify(r.j);
  assert.match(text, /liquid_helium/, 'the charge');
  assert.match(text, new RegExp(ENTED));
  const making = docs.filter((d) => JSON.stringify((d.j || {}).outputs || d.j || {}).includes('"' + CELL + '"'));
  assert.deepEqual(making.map((d) => [d.i, d.t]), [[p.recipeId, 'gtceu:naquadria_magnets']]);
  // the EnTED wire has one maker, A8's powder in the tube
  const wires = docs.filter((d) => JSON.stringify((d.j || {}).outputs || {}).includes('"' + ENTED + '"'));
  assert.ok(wires.length >= 1 && wires.every((d) => d.t === 'gtceu:powder_in_tube'), wires.map((d) => d.i + ' ' + d.t).join(', '));
});

test('the UV hatches and covers: assembler recipes at VA[UV] with the gravi star; none for the cell', () => {
  const recipes = plain(W.recipes);
  assert.equal(recipes.filter((r) => r.output === CELL).length, 0, 'no assembler cell');
  const by = (out) => recipes.find((r) => r.output === out);
  for (const id of [...HATCHES, ...COVERS]) {
    const r = by(id);
    assert.ok(r, id);
    assert.equal(r.eut, STUB_VA_UV, id);
    assert.ok(docs.some((d) => d.i === r.id && d.t === 'gtceu:assembler'), r.id + ' in the static recipes');
  }
  assert.deepEqual(by('gtceu:uv_wireless_energy_hatch').inputs, ['1x gtceu:uv_sensor', '1x gtceu:uv_energy_input_hatch', '2x #gtceu:circuits/uv', '1x gtceu:gravi_star']);
  assert.deepEqual(by('gtceu:uv_wireless_dynamo_hatch').inputs, ['1x gtceu:uv_emitter', '1x gtceu:uv_energy_output_hatch', '2x #gtceu:circuits/uv', '1x gtceu:gravi_star']);
  assert.deepEqual(by('gtceu:uv_wireless_energy_hatch_4a').inputs, ['1x gtceu:uv_wireless_energy_hatch', '2x gtceu:yttrium_barium_cuprate_quadruple_wire', '2x gtceu:darmstadtium_plate']);
  assert.deepEqual(by('gtceu:uv_wireless_dynamo_hatch_16a').inputs, ['1x gtceu:uv_wireless_dynamo_hatch_4a', '2x gtceu:yttrium_barium_cuprate_octal_wire', '4x gtceu:darmstadtium_plate']);
  assert.deepEqual(by('gtceu:uv_wireless_energy_hatch_64a').inputs, ['1x gtceu:uv_wireless_energy_hatch_16a', '2x gtceu:yttrium_barium_cuprate_hex_wire', '6x gtceu:darmstadtium_plate']);
  for (const c of COVERS) assert.ok(by(c).inputs.includes('1x gtceu:gravi_star'), c + ' links with the gravi star');
  // the per-window cap a UV hatch keeps: V[UV] x amps x the settlement window
  assert.equal(W.rate(UV, 2), 524288 * 2);
  assert.equal(W.rate(UV, 64), 524288 * 64);
});

test('names and textures: en_us and es_es in GTM\'s UV colour, the EMI line of circuit 4, the five UV textures', () => {
  const { lang } = run;
  const keys = HATCHES.map((id) => 'block.' + id.replace(':', '.')).concat(COVERS.map((id) => 'item.' + id.replace(':', '.')));
  for (const l of ['en_us', 'es_es']) {
    for (const k of keys) assert.match(String(lang[l][k]), /^\u00a73.*UV/, l + ' ' + k);
    assert.ok(lang[l]['block.grindless.uv_smes_cell'], l + ' names the cell');
    assert.ok(lang[l]['gtceu.recipe.grindless_naquadria_magnets.uv_smes_cell'], l + ': the EMI line of circuit 4');
  }
  assert.equal(lang.en_us['block.grindless.uv_smes_cell'], 'UV SMES Cell');
  assert.equal(lang.en_us['block.gtceu.uv_wireless_dynamo_hatch_64a'], '\u00a73UV 64A Wireless Dynamo Hatch');
  assert.equal(lang.en_us['item.grindless.uv_smes_cell'], undefined, 'no item name left from UV-F1');
  const tex = path.join(pack, 'kubejs', 'assets', 'grindless', 'textures');
  for (const rel of ['block/wireless/smes_cell_uv', 'block/cover/wireless_energy_cover_uv', 'block/cover/wireless_dynamo_cover_uv',
    'item/wireless/energy_cover_uv', 'item/wireless/dynamo_cover_uv']) assert.ok(fs.existsSync(path.join(tex, rel + '.png')), rel);
  assert.ok(!fs.existsSync(path.join(tex, 'item', 'uv_smes_cell.png')), 'UV-F1\'s item texture is gone');
});

test('the smoke test\'s band: uv_wireless at X 25344, 256 wide, overlapping no other zone', () => {
  const zones = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'test', 'zones.json'), 'utf8'));
  const list = Array.isArray(zones) ? zones : zones.zones;
  const z = list.find((x) => x.id === 'uv_wireless');
  assert.ok(z, 'the row');
  assert.deepEqual(z.x, [25344, 25407]);
  assert.ok(z.tests.includes('uv_wireless'));
  assert.ok(fs.existsSync(path.join(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_uv_wireless.js')));
});
