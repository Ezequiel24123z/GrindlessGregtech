// XP-Z1b, the ending (docs/eras/maxplus.md "The ending"), no game needed: the constants against the XP-Z1a table, the crossing logic against a test-only
// double of global.grindless.hyperstargate (XP-G1's published gates()), the book text against the design text, and source markers for what must never
// appear (wonGame, game mode changes). The whole chain on a client is gg_test_maxplus_ending.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const run = runPackScripts(pack);
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const TABLE = JSON.parse(read('data', 'grindless', 'tables', 'horizon_city.json'));
const E = run.global.grindless.ending;
const SERVER = read('server_scripts', 'grindless', 'maxplus', 'ending.js');

const box = { minX: 10, minY: 60, minZ: 10, maxX: 12, maxY: 64, maxZ: 10 };
const gate = (open, x = 0) => ({ dimension: 'minecraft:overworld', pos: { x, y: 60, z: 0 }, facing: 'north', open, box: open ? box : null });
const player = (id, over = {}) => ({ id, dim: 'minecraft:overworld', x: 11.5, y: 60, z: 10.5, ok: true, ...over });

test('the script loads and its constants are the horizon_city table', () => {
  assert.ok(E, 'global.grindless.ending');
  assert.equal(E.constants.dimension, TABLE.dimension);
  assert.deepEqual(JSON.parse(JSON.stringify(E.constants.arrival)), { x: TABLE.arrival.x + 0.5, y: TABLE.arrival.y, z: TABLE.arrival.z + 0.5, yaw: TABLE.arrival.yaw, pitch: 0 });
  assert.equal(E.constants.plaza.template, TABLE.plaza.template);
  assert.deepEqual(Array.from(E.constants.plaza.origin), TABLE.plaza.origin);
  assert.deepEqual(Array.from(E.constants.plaza.size), TABLE.plaza.size);
  assert.ok(E.constants.check <= 10, 'checked often enough to feel instant');
});

test('a closed gate never admits anyone', () => {
  const rec = {};
  const gates = [gate(false)];
  assert.equal(E.update(gates, rec), false);
  assert.equal(E.claim(gates, [player('a')], rec), null);
});

test('an open gate admits a player inside its box, not one outside, in another dimension or a spectator', () => {
  const rec = {};
  const gates = [gate(true)];
  assert.equal(E.update(gates, rec), true);
  assert.equal(E.claim(gates, [player('out', { x: 20 }), player('nether', { dim: 'minecraft:the_nether' }), player('spec', { ok: false })], rec), null);
  assert.equal(E.claim(gates, [player('out', { x: 20 }), player('in')], rec).id, 'in');
  assert.equal(E.claim(gates, [player('low', { y: 50 })], rec), null);
});

test('one player per opening: once used, the same run admits no one; a new opening admits again', () => {
  const rec = {};
  const key = E.gateKey(gate(true));
  E.update([gate(true)], rec);
  const first = E.claim([gate(true)], [player('a'), player('b')], rec);
  assert.equal(first.id, 'a');
  rec[first.key].used = true;
  assert.equal(E.claim([gate(true)], [player('b')], rec), null);
  assert.equal(E.update([gate(true)], rec), false, 'still the same run');
  assert.equal(rec[key].run, 1);
  assert.equal(E.update([gate(false)], rec), true, 'closing is recorded');
  assert.equal(E.update([gate(true)], rec), true, 'reopening starts a new run');
  assert.equal(rec[key].run, 2);
  assert.equal(rec[key].used, false);
  assert.equal(E.claim([gate(true)], [player('b')], rec).id, 'b');
});

test('records survive a JSON round trip (the persisted form) and each gate has its own run', () => {
  const rec = {};
  E.update([gate(true, 0), gate(true, 50)], rec);
  rec[E.gateKey(gate(true, 0))].used = true;
  const back = JSON.parse(JSON.stringify(rec));
  assert.equal(E.claim([gate(true, 0)], [player('a')], back), null, 'a restart does not reopen a used opening');
  assert.equal(E.claim([gate(true, 50)], [player('a')], back).id, 'a', 'the other gate is its own opening');
  assert.equal(E.update([gate(true, 0), gate(true, 50)], back), false, 'an opening that was open before the restart is the same run');
});

test('a gate that vanishes from the list while open is closed in the record', () => {
  const rec = {};
  E.update([gate(true)], rec);
  assert.equal(E.update([], rec), true);
  assert.equal(rec[E.gateKey(gate(true))].open, false);
});

test('source: players only, plaza once, first-arrival flags, WIN_GAME once and late, never wonGame or a game mode change', () => {
  assert.doesNotMatch(SERVER, /wonGame|setGameMode|gamemode|gamerule|kill\b|respawn/i);
  assert.match(SERVER, /WIN_GAME/);
  assert.match(SERVER, /grindless_ending_plaza/);
  assert.match(SERVER, /grindless_ending_arrived/);
  assert.match(SERVER, /grindless_ending_credits/);
  assert.match(SERVER, /place template/);
  assert.match(SERVER, /forceload add/);
  assert.match(SERVER, /ItemEvents\.rightClicked\('grindless:epilogue'/);
  assert.doesNotMatch(SERVER, /getBlock|getEntities|level\.entities/, 'no block or entity scans');
  assert.ok(/CREDITS_DELAY = (\d+)/.exec(SERVER)[1] >= 100, 'credits after the 100-tick title');
});

test('the lang has the title, subtitle and six pages that read as the design text', () => {
  const L = run.lang.en_us;
  assert.equal(L['grindless.ending.title'], 'Beyond the Horizon');
  assert.ok(L['grindless.ending.subtitle']);
  const pages = [];
  for (let i = 1; L['grindless.ending.book.page.' + i]; i++) pages.push(L['grindless.ending.book.page.' + i]);
  assert.equal(pages.length, 6);
  assert.match(read('client_scripts', 'grindless', 'maxplus_epilogue_book.js'), /var PAGES = 6/);
  for (const p of pages) assert.ok(p.length <= 260, 'fits a book page');
  const doc = fs.readFileSync(path.join(root, 'docs', 'eras', 'maxplus.md'), 'utf8');
  const text = /\*\*The ending text\*\*[^\n]*\n\n> ([^\n]+)/.exec(doc)[1];
  assert.equal(pages.join(' '), text);
});

test('the pack registers no Spanish and the gated fixtures are off by default', () => {
  assert.ok(!Object.keys(run.lang).includes('es_es'));
  for (const f of ['server_scripts', 'client_scripts']) {
    const src = fs.readFileSync(path.join(root, 'tools', 'test', 'overlay', 'kubejs', f, 'gg_test_maxplus_ending.js'), 'utf8');
    if (f === 'server_scripts') assert.match(src, /gg_test_maxplus_ending\.json/);
    else assert.match(src, /'hold'/);
  }
});
