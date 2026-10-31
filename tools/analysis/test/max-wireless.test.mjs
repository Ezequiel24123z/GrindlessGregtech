// MAX's wireless tier (package MAX-W, docs/eras/max.md 'W. Wireless case 14'), no game needed: withTiers case 14, the MAX row of
// tables/wireless_energy.json, the caps held as longs, max/wireless.js (pending until A2) and line L27's rows on the older machines.
// The 64 A hatch settling in the game (2^37 EU in one tick) is gg_test_max_wireless.
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
const tables = path.join(pack, 'kubejs', 'data', 'grindless', 'tables');
const table = (n) => JSON.parse(fs.readFileSync(path.join(tables, n + '.json'), 'utf8'));
const WIRELESS = table('wireless_energy');
const W = run.global.grindless.wireless;
const MW = run.global.grindless.maxWireless;
const MAXT = 14;
const V_MAX = 2 ** 31;
const CELL = 'grindless:max_smes_cell';
const CELL_EU = 64424509440000;
const read = (...p) => fs.readFileSync(path.join(pack, 'kubejs', ...p), 'utf8');

test('the MAX row: tier 14, 24,576 UV naquadria batteries (four OpV cells), the horizon strand repeater as the link', () => {
  const rows = WIRELESS.tiers.filter((r) => r.name === 'max');
  assert.equal(rows.length, 1);
  const max = rows[0];
  assert.equal(WIRELESS.tiers[13], max, 'the fourteenth row');
  assert.deepEqual([max.tier, max.cell, max.capacity, max.referenceCount], [MAXT, CELL, CELL_EU, 24576]);
  assert.equal(max.capacity, max.referenceCount * 2621440000);
  assert.equal(max.capacity, 4 * WIRELESS.tiers.find((r) => r.name === 'opv').capacity, 'four OpV cells\' worth');
  assert.ok(Number.isSafeInteger(max.capacity) && Number.isSafeInteger(max.capacity * 3));
  assert.equal(max.cellMadeBy, 'gtceu:max_assembler');
  assert.deepEqual([max.emitter, max.sensor, max.signalParts, max.link, max.wire],
    ['grindless:max_emitter', 'grindless:max_sensor', 1, 'grindless:horizon_strand_repeater', 'horizon_strand']);
  assert.deepEqual(WIRELESS.tiers.map((r) => r.tier), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
});

test('withTiers case 14 is spelled out in the startup script and the default says 1 to 14 tiers', () => {
  const src = read('startup_scripts', 'grindless', 'lv', 'wireless_energy.js');
  assert.match(src, /case 14:\s*return b\.tiers\(t\[0\], t\[1\], t\[2\], t\[3\], t\[4\], t\[5\], t\[6\], t\[7\], t\[8\], t\[9\], t\[10\], t\[11\], t\[12\], t\[13\]\)/);
  assert.match(src, /1 to 14 tiers/);
});

test('the caps are V[MAX] x amps x the window as longs: past 2^31 and exact, 64 A = 1,374,389,534,720 (the S0-5 maths, no fallback)', () => {
  const t = W.settleTicks;
  assert.equal(t, 10);
  const want = { 2: 42949672960, 4: 85899345920, 16: 343597383680, 64: 1374389534720 };
  for (const a of WIRELESS.hatchAmps) {
    assert.equal(V_MAX * a * t, want[a], a + ' A');
    assert.equal(W.rate(MAXT, a) * t, want[a], a + ' A by the helper');
    assert.ok(Number.isSafeInteger(V_MAX * a * t) && V_MAX * a * t > 2 ** 31 - 1);
  }
  assert.equal(V_MAX * 64, 2 ** 37, 'a 64 A draw per tick is 2^37');
});

test('max/wireless.js: the repeater and the cell are assembler rows at VA[MAX] and pendingRoutes until A2', () => {
  const src = read('server_scripts', 'grindless', 'max', 'wireless.js');
  assert.ok(!/^\/\/ priority:/m.test(src.replace(/^\/\/ priority: -?\d+\r?\n/, '')), 'no hand-written priority line (the integrator stamps the first line)');
  assert.deepEqual(plain(MW.rows.map((r) => r.out)), ['grindless:horizon_strand_repeater', CELL]);
  assert.match(src, /GTValues\.VA\[MAXT\]/);
  assert.deepEqual(plain(MW.rows[1].items), ['16x gtceu:horizon_strand_single_wire', '4x grindless:cold_smes_toroid', '2x grindless:max_field_generator']);
  assert.ok(Array.isArray(plain(MW.pendingRoutes)));
});

const L27 = [
  ['coated_conductor_line', null, 'smes_buffered_tape', 7],
  ['hts_magnet_works', null, 'smes_toroid_winding', 13],
  ['magnet_works', null, 'braced_smes_toroid', 11]
];

test('L27: every older row is the last of its table, on its own free circuit (at most 32), with ids made by the chain', () => {
  for (const [file, , name, circuit] of L27) {
    const rows = table(file).recipes.filter((r) => !['fcl_tape', 'fcl_coil'].includes(r.name)); // MAX-A4 appends L39 rows after
    const last = rows[rows.length - 1];
    assert.equal(last.name, name, file);
    assert.equal(last.circuit, circuit, file);
    assert.ok(circuit <= 32);
    assert.equal(rows.filter((r) => r.circuit === circuit).length, 1, file + ' circuit ' + circuit + ' is used once');
    assert.deepEqual(plain(last.itemsOut.map((o) => o.id)), ['grindless:' + name]);
  }
  const pld = table('spin_deposition').types.pulsed_laser_deposition.recipes;
  const plds = pld.filter((r) => r.name !== 'thick_film_fcl_tape'); // MAX-A4 appends after
  const row = plds[plds.length - 1];
  assert.deepEqual([row.name, row.circuit], ['thick_rebco_tape', 4]);
  assert.equal(pld.filter((r) => r.circuit === 4).length, 1);
  assert.deepEqual(plain(row.kept.map((k) => k.id)), ['grindless:krf_excimer_laser']);
  assert.deepEqual(plain(row.itemsOut.map((o) => o.id)), ['grindless:thick_rebco_tape']);
  const chain = ['smes_buffered_tape', 'thick_rebco_tape', 'smes_toroid_winding', 'braced_smes_toroid'];
  const all = [...table('coated_conductor_line').recipes, ...pld, ...table('hts_magnet_works').recipes, ...table('magnet_works').recipes];
  chain.forEach((id, i) => {
    const r = all.find((x) => x.name === id);
    if (i > 0) assert.ok(r.itemsIn.some((x) => x.id === 'grindless:' + chain[i - 1]), id + ' takes ' + chain[i - 1]);
    for (const x of r.itemsIn) assert.ok(!/cold_smes_toroid|max_smes_cell|braced_smes_toroid/.test(x.id) || id === 'x', id + ' has no later-step input');
  });
});

test('L27 step 5: the helium refrigerator row braced_smes_toroid -> cold_smes_toroid, keyed by its input', () => {
  const HR = run.global.grindless.heliumRefrigerator || run.global.grindless.helium_refrigerator;
  const src = read('server_scripts', 'grindless', 'luv', 'helium_refrigerator.js');
  assert.match(src, /name: 'cold_smes_toroid', input: 'grindless:braced_smes_toroid', output: 'grindless:cold_smes_toroid'/);
  if (HR && HR.opvRows) {
    const r = plain(HR.opvRows).filter((x) => x.input === 'grindless:braced_smes_toroid');
    assert.equal(r.length, 1);
  }
});

test('names: the MAX hatches and covers in en_us and es_es', () => {
  const { lang } = run;
  const keys = [];
  for (const kind of ['energy', 'dynamo']) for (const a of WIRELESS.hatchAmps) keys.push(`block.gtceu.max_wireless_${kind}_hatch${a === 2 ? '' : '_' + a + 'a'}`);
  keys.push('item.grindless.max_wireless_energy_cover', 'item.grindless.max_wireless_dynamo_cover');
  for (const l of ['en_us', 'es_es']) for (const k of keys) assert.match(String(lang[l][k]), /^\u00a7c\u00a7l.*MAX/, l + ' ' + k);
  assert.equal(lang.en_us['block.gtceu.max_wireless_energy_hatch_64a'], '\u00a7c\u00a7lMAX 64A Wireless Energy Hatch');
});

test('the smoke test\'s band: max_wireless at X 39128, 64 wide, its overlay script present', () => {
  const zones = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'test', 'zones.json'), 'utf8'));
  const list = Array.isArray(zones) ? zones : zones.zones;
  const z = list.find((x) => x.id === 'max_wireless');
  assert.ok(z, 'the row');
  assert.deepEqual(z.x, [39128, 39191]);
  assert.ok(z.tests.includes('max_wireless'));
  assert.ok(fs.existsSync(path.join(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_max_wireless.js')));
});
