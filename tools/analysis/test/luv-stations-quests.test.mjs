// The Io-orbit slot (LuV-B7) and spike S0-3 in the quest book: luv_age, pl_luv and power take S03, B7T and B7S from
// tables/stations.json (tools/quests/luv-stations.mjs, the rule of lib/stations.js), so each mode names only the machine the pack
// registers. Every mode is drawn here from an injected table (GG_STATIONS_TABLE); the real stations.json is never touched.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { stationsMode, stationPackages, readStations, STATIONS_FILE } from '../../quests/luv-stations.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const quests = path.join(root, 'tools', 'quests');
const luvGen = path.join(quests, 'luv-chapter', 'gen.mjs');
const plGen = path.join(quests, 'processing-lines', 'pl-gen.mjs');
// scratch folder for the luv_age each mode links into (tools/analysis/.work is ignored by git)
const work = path.join(root, 'tools', 'analysis', '.work', `luv-stations-${process.pid}`);

const table = (enabled, second) => ({ enabled, first: 'gcyr:overworld_orbit', second, plot: 512, pieces: [] });
const MODES = {
  pending: table(false, 'grindless:io_orbit'),
  tether: table(true, 'grindless:io_orbit'),
  sulfur_iodine: table(false, null),
  // the first station holds and the second fails: S03 with the plant
  sulfur_iodine_stations: table(true, null),
};
const TETHER_IDS = ['gtceu:flux_tube_tether', 'grindless:tether_spool'];
const SI_IDS = ['gtceu:sulfur_iodine_plant'];

function run(args, stationsJson, extraEnv = {}) {
  const r = spawnSync(process.execPath, args, {
    encoding: 'utf8', cwd: root, maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, GG_STATIONS_TABLE: stationsJson, ...extraEnv },
  });
  assert.equal(r.status, 0, `${args.join(' ')}\n${r.stderr}`);
  return r.stdout;
}

// the three LANDED sets as the data files compute them under that table
function landedSets(json) {
  const url = (p) => pathToFileURL(path.join(quests, p)).href;
  const script = `
    const q = await import(${JSON.stringify(url('luv-chapter/quests-data.mjs'))});
    const pl = await import(${JSON.stringify(url('processing-lines/pl-data-luv.mjs'))});
    const pw = await import(${JSON.stringify(url('processing-lines/power-data.mjs'))});
    console.log(JSON.stringify({ luv: q.LANDED, pl: [...pl.LANDED], power: [...pw.LANDED] }));`;
  return JSON.parse(run(['--input-type=module', '-e', script], json));
}

// luv_age, then pl_luv and power linked against that luv_age
function drawMode(name, json) {
  const luv = run([luvGen, '--out', '-'], json);
  const dir = path.join(work, name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'luv_age.snbt'), luv);
  const out = run([plGen, '--print', '--only', 'pl_luv,power'], json, { GG_QUESTS_ERA_DIR: dir });
  const chapters = {};
  for (const part of out.split(/(?=^\{\n\tautofocus_id)/m)) {
    const m = /\n\tfilename: "([^"]+)"/.exec(part);
    if (m) chapters[m[1]] = part;
  }
  assert.deepEqual(Object.keys(chapters).sort(), ['pl_luv', 'power']);
  return { luv, ...chapters };
}

const titles = (snbt) => [...snbt.matchAll(/\n\t\t\ttitle: "([^"]+)"/g)].map((m) => m[1]);
// what a generated quest names: its icon and its task items
const named = (snbt) => new Set([...snbt.matchAll(/\b(?:icon|item): "([^"]+)"/g)].map((m) => m[1]));

test('the mode and packages follow lib/stations.js', () => {
  assert.equal(stationsMode(MODES.pending), 'pending');
  assert.equal(stationsMode(MODES.tether), 'tether');
  assert.equal(stationsMode(MODES.sulfur_iodine), 'sulfur_iodine');
  assert.equal(stationsMode(MODES.sulfur_iodine_stations), 'sulfur_iodine');
  assert.equal(stationsMode({ enabled: false, first: 'gcyr:overworld_orbit' }), 'sulfur_iodine', 'a missing second is null');
  assert.deepEqual(stationPackages(MODES.pending), []);
  assert.deepEqual(stationPackages(MODES.tether), ['S03', 'B7T']);
  assert.deepEqual(stationPackages(MODES.sulfur_iodine), ['B7S']);
  assert.deepEqual(stationPackages(MODES.sulfur_iodine_stations), ['S03', 'B7S']);
  assert.throws(() => stationsMode({ enabled: 'yes', first: 'gcyr:overworld_orbit' }), /invalid stations table/);
  assert.throws(() => stationsMode(table(true, 'gcyr:overworld_orbit')), /second must be null or another orbit/);
  assert.throws(() => stationsMode(table(true, 'grindless:nowhere')), /second must be null or another orbit/);
  assert.throws(() => stationsMode(table(true, 'grindless:europa_orbit')), /second must be null or grindless:io_orbit/);
  assert.throws(() => stationsMode({ ...table(true, null), first: 'grindless:nowhere' }), /first is not an orbit/);
  // the pack's own table, read the same way the data files read it
  const real = readStations(STATIONS_FILE);
  assert.equal(stationsMode(real), real.second === null ? 'sulfur_iodine' : real.enabled ? 'tether' : 'pending');
  assert.deepEqual(readStations(JSON.stringify(MODES.tether)), MODES.tether, 'GG_STATIONS_TABLE may be the JSON itself');
});

test('the three LANDED sets add exactly the packages of the table', () => {
  const STATIC = ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B8', 'B9', 'B10'];
  for (const [name, t] of Object.entries(MODES)) {
    const sets = landedSets(JSON.stringify(t));
    const want = [...STATIC, ...stationPackages(t)].sort();
    for (const [file, set] of Object.entries(sets)) assert.deepEqual([...set].sort(), want, `${name}: ${file}`);
    for (const set of Object.values(sets)) assert.ok(!(set.includes('B7T') && set.includes('B7S')), `${name}: B7T and B7S together`);
  }
  // pending: what the book had before the table drove it
  const pending = landedSets(JSON.stringify(MODES.pending));
  for (const set of Object.values(pending)) for (const p of ['S03', 'B7T', 'B7S']) assert.ok(!set.includes(p), p);
});

test('each mode draws only its own machine', (t) => {
  t.after(() => fs.rmSync(work, { recursive: true, force: true }));
  for (const [name, tb] of Object.entries(MODES)) {
    const mode = stationsMode(tb);
    const book = drawMode(name, JSON.stringify(tb));
    const luvTitles = titles(book.luv);
    const all = new Set([...named(book.luv), ...named(book.pl_luv), ...named(book.power)]);
    // no quest names a machine the pack leaves out
    for (const id of SI_IDS) assert.equal(all.has(id), mode === 'sulfur_iodine', `${name}: ${id}`);
    for (const id of TETHER_IDS) assert.equal(all.has(id), mode === 'tether', `${name}: ${id}`);
    assert.equal(luvTitles.includes('Riding the Torus'), mode === 'tether', `${name}: TORUS`);
    assert.equal(luvTitles.includes('Iodine Loop'), mode === 'sulfur_iodine', `${name}: IODINE`);
    assert.equal(luvTitles.includes('First Station'), tb.enabled, `${name}: S03 quests`);
    for (const chart of ['pl_luv', 'power']) {
      const ids = named(book[chart]);
      assert.equal(ids.has('gtceu:sulfur_iodine_plant'), mode === 'sulfur_iodine', `${name}: ${chart} plant`);
      assert.equal(ids.has('gtceu:flux_tube_tether'), mode === 'tether', `${name}: ${chart} tether`);
    }
    if (mode === 'sulfur_iodine') {
      // Europa's water and the kept charges in, hydrogen and oxygen out
      const plTitles = titles(book.pl_luv);
      for (const s of ['Sulfur-Iodine Plant', 'Sulfuric Acid', 'Iodine', 'Hydrogen', 'Oxygen']) assert.ok(plTitles.includes(s), `${name}: ${s}`);
      for (const id of ['minecraft:water_bucket', 'gtceu:sulfuric_acid_bucket', 'gtceu:iodine_dust', 'gtceu:hydrogen_bucket', 'gtceu:oxygen_bucket']) {
        assert.ok(named(book.pl_luv).has(id), `${name}: ${id}`);
      }
    }
  }
});
