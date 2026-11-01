// XP-T2 (MAX+ gates c17 to c19): the rows, the sites, the lang parity and the test zone, checked from the tables and scripts and the stand-in run of uhv/gate.js.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const gate = JSON.parse(read(kube, 'data', 'grindless', 'tables', 'gate.json'));
const platforms = JSON.parse(read(kube, 'data', 'grindless', 'tables', 'relay_platforms.json'));
const rows = gate.types.warp_gate.recipes;
const lang = read(kube, 'client_scripts', 'grindless', 'maxplus_gates_lang.js');
const gateJs = read(kube, 'server_scripts', 'grindless', 'uhv', 'gate.js');

const WANT = [
  { circuit: 17, name: 'hold_magellanic_stream', site: 'tarantula_orbit', place: 'magellanic_stream' },
  { circuit: 18, name: 'hold_m31_nucleus', site: 'tarantula_orbit', place: 'm31' },
  { circuit: 19, name: 'hold_local_group_filament', site: 'm31_nucleus_orbit', place: 'local_group_filament' }
];

test('rows c17 to c19: the probe at 2^37 EU/t for 1,200 t, nothing kept, no repeated circuit', () => {
  for (const w of WANT) {
    const r = rows.find((x) => x.circuit === w.circuit);
    assert.ok(r, `no row for c${w.circuit}`);
    assert.equal(r.name, w.name);
    assert.equal(r.site, w.site);
    assert.equal(r.eut, 2 ** 37);
    assert.equal(r.duration, 1200);
    assert.deepEqual(r.itemsIn, [{ id: 'grindless:ig_relay_probe', count: 1 }]);
    assert.deepEqual(r.kept, []);
    assert.deepEqual(r.itemsOut, []);
    assert.match(r._why, /^XP-T2/);
  }
  const circuits = rows.map((x) => x.circuit);
  assert.equal(new Set(circuits).size, circuits.length);
  assert.equal(new Set(rows.map((x) => x.name)).size, rows.length);
});

test('each jump matches XP-F1\'s relay platform row (its name and its source place)', () => {
  const dimOf = { tarantula_orbit: 'grindless:tarantula_orbit', m31_nucleus_orbit: 'grindless:m31_nucleus_orbit' };
  for (const w of WANT) {
    const p = platforms.platforms.find((x) => x.place === w.place);
    assert.ok(p, `no platform ${w.place}`);
    assert.equal(p.jump, w.name);
    assert.equal(p.source, dimOf[w.site]);
  }
});

test('the stand-in run: the three rows are loaded, nothing skipped, no clash', () => {
  const run = runPackScripts(pack);
  const WG = run.global.grindless.warpGate;
  const mine = run.errors.filter((e) => /uhv[\\/]gate/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(JSON.parse(JSON.stringify(WG.skipped)), []);
  assert.deepEqual(JSON.parse(JSON.stringify(WG.clashes)), []);
  for (const w of WANT) assert.ok(WG.recipes.some((r) => r.name === w.name), `${w.name} not loaded`);
});

test('SITES: the four MAX+ places join the orbits, and the two site keys exist', () => {
  for (const d of ['tarantula_orbit', 'magellanic_stream', 'm31_nucleus_orbit', 'local_group_filament']) {
    assert.ok(gateJs.includes(`'grindless:${d}'`), `no site for ${d}`);
  }
  assert.ok(gateJs.includes("SITES.tarantula_orbit = ['grindless:tarantula_orbit']"));
  assert.ok(gateJs.includes("SITES.m31_nucleus_orbit = ['grindless:m31_nucleus_orbit']"));
});

test('lang: one en_us line per row, ASCII only', () => {
  for (const w of WANT) assert.ok(lang.includes(`'gtceu.recipe.grindless_warp_gate.${w.name}'`), `no lang key for ${w.name}`);
  assert.ok(lang.includes("ClientEvents.lang('en_us'"));
  assert.ok(!/[^\x00-\x7f]/.test(lang), 'non-ASCII characters must be \\u escapes');
});

test('the zone row exists and does not overlap another', () => {
  const z = JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const list = z.zones || z;
  const mine = list.find((r) => r.id === 'maxplus_gates');
  assert.ok(mine);
  assert.deepEqual(mine.tests, ['maxplus_gates']);
  assert.ok(fs.existsSync(path.join(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_maxplus_gates.js')));
  for (const o of list) {
    if (o === mine) continue;
    const overlap = o.x[0] <= mine.x[1] && mine.x[0] <= o.x[1] && o.z[0] <= mine.z[1] && mine.z[0] <= o.z[1] && o.y[0] <= mine.y[1] && mine.y[0] <= o.y[1];
    assert.ok(!overlap, `overlaps ${o.id}`);
  }
});
