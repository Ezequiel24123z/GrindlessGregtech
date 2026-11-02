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
const gate = (open, x = 0, run = 1) => ({ dimension: 'minecraft:overworld', pos: { x, y: 60, z: 0 }, facing: 'north', open, run, box: open ? box : null });
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

test('one dial admits the whole team: each member crosses once per run, another team is refused, a new dial admits the team again', () => {
  const rec = {};
  const key = E.gateKey(gate(true));
  const g = (run = 1) => ({ ...gate(true, 0, run), team: 'T1' });
  E.update([g()], rec);
  assert.equal(rec[key].team, 'T1', 'the gate\'s team is its controller owner\'s');
  const crowd = [player('a', { team: 'T1' }), player('b', { team: 'T1' }), player('x', { team: 'T2' })];
  const first = E.claim([g()], crowd, rec);
  assert.equal(first.id, 'a');
  E.cross(rec, first.key, first.id, first.team);
  const second = E.claim([g()], crowd, rec);
  assert.equal(second.id, 'b', 'a second member of the team crosses in the same run');
  E.cross(rec, second.key, second.id, second.team);
  assert.deepEqual(Array.from(rec[key].used), ['a', 'b']);
  assert.equal(E.claim([g()], crowd, rec), null, 'both members have crossed; the other team is never admitted');
  assert.equal(E.claim([g()], [player('x', { team: 'T2' })], rec), null, 'a player of another team is refused');
  assert.equal(E.update([g()], rec), false, 'still the same run');
  assert.equal(E.update([g(2)], rec), true, 'a new dial is a new run');
  assert.deepEqual(Array.from(rec[key].used), []);
  assert.equal(E.claim([g(2)], [player('a', { team: 'T1' })], rec).id, 'a', 'the team crosses again');
  assert.equal(E.claim([g(2)], [player('x', { team: 'T2' })], rec), null, 'still refused');
});

test('a solo player crosses once per run, as a team of one', () => {
  const rec = {};
  E.update([gate(true)], rec);
  const first = E.claim([gate(true)], [player('solo')], rec);
  assert.equal(first.id, 'solo');
  assert.equal(first.team, 'solo', 'no team: the player is a team of one');
  E.cross(rec, first.key, first.id, first.team);
  assert.equal(E.claim([gate(true)], [player('solo')], rec), null);
  E.update([gate(true, 0, 2)], rec);
  assert.equal(E.claim([gate(true, 0, 2)], [player('solo')], rec).id, 'solo');
});

test('a gate whose controller has no owner takes the team of the first player who crosses', () => {
  const rec = {};
  const g = (run = 1) => ({ ...gate(true, 0, run), team: 'server' });
  E.update([g()], rec);
  assert.equal(rec[E.gateKey(g())].team, '', 'no team until someone crosses');
  const first = E.claim([g()], [player('a', { team: 'T1' }), player('x', { team: 'T2' })], rec);
  assert.equal(first.id, 'a');
  assert.equal(E.update([g()], rec), false, 'the update does not undo it');
  E.cross(rec, first.key, first.id, first.team);
  assert.equal(rec[first.key].team, 'T1');
  assert.equal(E.update([g()], rec), false, 'a server-owned gate keeps the first crosser\'s team');
  assert.equal(E.claim([g()], [player('x', { team: 'T2' })], rec), null);
  assert.equal(E.claim([g()], [player('b', { team: 'T1' })], rec).id, 'b');
  E.update([g(2)], rec);
  assert.equal(rec[first.key].team, '', 'a new run clears the first crosser\'s team');
  assert.equal(E.claim([g(2)], [player('x', { team: 'T2' })], rec).id, 'x');
});

test('a pause and resume keeps the run\'s crossings; a vanished gate closes the record', () => {
  const rec = {};
  const key = E.gateKey(gate(true));
  const g = (open = true, run = 1) => ({ ...gate(open, 0, run), team: 'T1' });
  E.update([g()], rec);
  E.cross(rec, key, 'a', 'T1');
  assert.equal(E.update([g(false)], rec), true, 'closing (a pause) is recorded');
  assert.equal(E.update([g()], rec), true, 'resuming reopens the record');
  assert.equal(rec[key].run, 1, 'a resume is not a new run');
  assert.deepEqual(Array.from(rec[key].used), ['a'], 'a resume keeps who crossed');
  assert.equal(E.claim([g()], [player('a', { team: 'T1' })], rec), null);
  assert.equal(E.claim([g()], [player('b', { team: 'T1' })], rec).id, 'b');
});

test('records survive a JSON round trip (the persisted form) and each gate has its own run and team', () => {
  const rec = {};
  const g = (x) => ({ ...gate(true, x), team: 'T' + x });
  E.update([g(0), g(50)], rec);
  E.cross(rec, E.gateKey(g(0)), 'a', 'T0');
  const back = JSON.parse(JSON.stringify(rec));
  assert.equal(E.claim([g(0)], [player('a', { team: 'T0' })], back), null, 'a restart does not let the same player cross again');
  assert.equal(E.claim([g(0)], [player('b', { team: 'T0' })], back).id, 'b', 'a teammate still can');
  assert.equal(E.claim([g(50)], [player('a', { team: 'T50' })], back).id, 'a', 'the other gate is its own opening and team');
  assert.equal(E.update([g(0), g(50)], back), false, 'an opening that was open before the restart is the same run');
});

test('a record from before per-team dials (a boolean used, no team) becomes a fresh list', () => {
  const key = E.gateKey(gate(true));
  const rec = { [key]: { run: 1, open: true, used: true } };
  E.update([{ ...gate(true), team: 'T1' }], rec);
  assert.deepEqual(Array.from(rec[key].used), []);
  assert.equal(rec[key].team, 'T1');
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

test('B13-DIAL source: the gate entry carries the owner\'s team, the dial and the bank display read that team\'s store, the relay hatches are tracked under a team', () => {
  const hs = read('startup_scripts', 'grindless', 'maxplus', 'hyperstargate.js');
  assert.match(hs, /team: teamOf\(m\)/);
  assert.match(hs, /dialCharge\(level\.getServer\(\), teamOf\(machine\)\)/);
  assert.match(hs, /dialCharge\(level\.getServer\(\), teamOf\(controller\)\)/);
  assert.doesNotMatch(hs, /dialCharge\(level\.getServer\(\)\)/);
  const bank = read('startup_scripts', 'grindless', 'maxplus', 'capacitor_bank.js');
  assert.match(bank, /teamOfBank\(/);
  assert.doesNotMatch(bank, /W\.status\(level\.getServer\(\)\)/);
  const relay = read('server_scripts', 'grindless', 'lib', 'relay_platforms.js');
  assert.match(relay, /W\.track\(level, blockPos\(p\), team \? String\(team\) : 'server'\)/);
  assert.match(relay, /teamOfRing\(machine\)/);
});

test('the pack registers no Spanish and the gated fixtures are off by default', () => {
  assert.ok(!Object.keys(run.lang).includes('es_es'));
  for (const f of ['server_scripts', 'client_scripts']) {
    const src = fs.readFileSync(path.join(root, 'tools', 'test', 'overlay', 'kubejs', f, 'gg_test_maxplus_ending.js'), 'utf8');
    if (f === 'server_scripts') assert.match(src, /gg_test_maxplus_ending\.json/);
    else assert.match(src, /'hold'/);
  }
});
