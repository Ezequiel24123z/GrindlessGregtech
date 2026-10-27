// integration/hidden.js's `unless`: a hidden-table group whose stations switch (startup_scripts/grindless/lib/stations.js, from
// tables/stations.json) is on is not hidden. Runs the real stations.js and hidden.js in a Node sandbox with ServerEvents.tags stubbed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PACK = path.join(ROOT, 'pack');
const HIDDEN_JS = 'kubejs/server_scripts/grindless/integration/hidden.js';
const STATIONS_JS = 'kubejs/startup_scripts/grindless/lib/stations.js';
const TABLE = 'kubejs/data/grindless/tables/hidden_until.json';
const STATIONS = 'kubejs/data/grindless/tables/stations.json';
const SPOOL = 'grindless:tether_spool';
const readPack = (p) => JSON.parse(fs.readFileSync(path.join(PACK, p), 'utf8'));

/** Runs stations.js (unless `stations` is false: G.stations stays missing) and hidden.js; tables maps a pack path to its JSON. */
function run({ stations = readPack(STATIONS), table = readPack(TABLE) } = {}) {
  const logs = [];
  const tags = { item: {}, fluid: {} };
  const tagHandlers = {};
  const files = { [STATIONS]: stations, [TABLE]: table };
  const G = {
    readJsonTable: (p) => JSON.parse(JSON.stringify(p in files ? files[p] : readPack(p))),
    orbits: { dimensions: ['gcyr:overworld_orbit', 'grindless:io_orbit', 'grindless:saturn_orbit', 'grindless:uranus_orbit'] },
  };
  const log = (level) => (...m) => logs.push([level, m.map(String).join(' ')]);
  const sandbox = {
    console: { info: log('info'), warn: log('warn'), error: log('error'), log: log('info') },
    global: { grindless: G },
    Item: { exists: () => true },
    Fluid: { exists: () => true },
    ServerEvents: { tags: (kind, fn) => { tagHandlers[kind] = fn; }, recipes: () => {} },
  };
  vm.createContext(sandbox);
  const scripts = stations === false ? [HIDDEN_JS] : [STATIONS_JS, HIDDEN_JS];
  for (const f of scripts) vm.runInContext(fs.readFileSync(path.join(PACK, f), 'utf8'), sandbox, { filename: f });
  for (const kind of ['item', 'fluid']) {
    tagHandlers[kind]({ add: (tag, ids) => { (tags[kind][tag] = tags[kind][tag] || new Set()); for (const id of ids) tags[kind][tag].add(id); } });
  }
  const tagged = (id) => !!(tags.item['c:hidden_from_recipe_viewers'] && tags.item['c:hidden_from_recipe_viewers'].has(id)) &&
    !!(tags.item['grindless:hidden_with_recipes'] && tags.item['grindless:hidden_with_recipes'].has(id));
  // the scripts' arrays belong to the sandbox's realm: plain copies for deepEqual
  const shownBySwitch = [...G.hidden.shownBySwitch];
  return { G, H: G.hidden, shownBySwitch, logs, tagged, errors: logs.filter((l) => l[0] === 'error').map((l) => l[1]) };
}

const fixture = (unless) => ({
  groups: [
    { material: 'grindless:switched', until: 'uv', reason: 'r', items: ['grindless:switched'], fluids: [], ...(unless ? { unless } : {}) },
    { material: 'grindless:plain', until: 'uv', reason: 'r', items: ['grindless:plain'], fluids: [] },
  ],
});

test('the real hidden table: the tether spool says unless "tether", a switch stations.js publishes', () => {
  const spool = readPack(TABLE).groups.filter((g) => g.material === SPOOL);
  assert.equal(spool.length, 1);
  assert.equal(spool[0].unless, 'tether');
  const { G } = run();
  assert.ok(Object.keys(G.stations.switches).includes('tether'), 'stations.js publishes the tether switch');
  assert.deepEqual(Object.keys(G.stations.switches).sort(), ['stations', 'sulfur_iodine', 'tether']);
  const rule = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/analysis/tiers/obtain.json'), 'utf8')).obtain.classes
    .find((r) => (r.materials || []).includes(SPOOL));
  assert.equal(rule.unless, 'tether', 'the audit rule says so too, so a regenerated table keeps it');
});

test('the real tables: the spool is hidden while stations.json is pending or sulfur-iodine, and shows in the tether mode', () => {
  const table = readPack(STATIONS);
  const pending = run({ stations: { ...table, enabled: false, second: 'grindless:io_orbit' } });
  assert.equal(pending.G.stations.b7, 'pending');
  assert.ok(pending.tagged(SPOOL), 'pending: hidden with its recipes');
  assert.deepEqual(pending.shownBySwitch, []);
  assert.deepEqual(pending.errors, []);

  const tether = run({ stations: { ...table, enabled: true, second: 'grindless:io_orbit' } });
  assert.equal(tether.G.stations.b7, 'tether');
  assert.ok(!tether.tagged(SPOOL), 'tether mode: not hidden');
  assert.ok(!tether.H.isHidden(SPOOL));
  assert.deepEqual(tether.shownBySwitch, [SPOOL]);
  assert.equal(tether.H.hidden.groups, pending.H.hidden.groups - 1, 'only the spool group drops out');
  assert.deepEqual(tether.errors, []);

  const si = run({ stations: { ...table, enabled: true, second: null } });
  assert.equal(si.G.stations.b7, 'sulfur_iodine');
  assert.ok(si.tagged(SPOOL), 'sulfur-iodine mode: still hidden');
  assert.deepEqual(si.shownBySwitch, []);
});

test('unless: switch on -> not tagged, off -> tagged, unknown or no stations -> tagged with one error line', () => {
  const on = { enabled: true, first: 'gcyr:overworld_orbit', second: 'grindless:io_orbit' };
  const off = { ...on, enabled: false };

  let r = run({ stations: on, table: fixture('tether') });
  assert.ok(!r.tagged('grindless:switched') && r.tagged('grindless:plain'));
  assert.deepEqual(r.shownBySwitch, ['grindless:switched']);
  assert.deepEqual(r.errors, []);

  r = run({ stations: off, table: fixture('tether') });
  assert.ok(r.tagged('grindless:switched') && r.tagged('grindless:plain'));
  assert.deepEqual(r.shownBySwitch, []);
  assert.deepEqual(r.errors, []);

  r = run({ stations: on, table: fixture('no_such_switch') });
  assert.ok(r.tagged('grindless:switched'), 'an unknown switch keeps the group hidden');
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /grindless:switched: unless names an unknown switch "no_such_switch"/);

  r = run({ stations: false, table: fixture('tether') });
  assert.ok(r.tagged('grindless:switched'), 'without global.grindless.stations the group stays hidden');
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /unknown switch "tether" \(global\.grindless\.stations\.switches: missing\)/);
});
