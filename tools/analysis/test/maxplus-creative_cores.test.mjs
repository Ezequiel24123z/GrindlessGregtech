// XP-K (MAX+ creative cores, lines K1 to K4): the stand-in run of maxplus/creative_cores.js, chains, circuits, sites and cryostat lookups.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const run = runPackScripts(pack);
const MK = run.global.grindless.maxPlusCreativeCores;
const plain = (x) => JSON.parse(JSON.stringify(x));
const rows = plain(MK.rows);
const chain = (names) => names.map((n) => rows.find((r) => r.name === n));

test('the stand-in runs the script without errors and skips nothing', () => {
  const mine = run.errors.filter((e) => /creative_cores/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MK.skipped), []);
  assert.equal(rows.length, 17);
});

test('each line chains: every step takes the previous step product', () => {
  const lines = [
    ['caged_kugelblitz', 'strange_cage_lining', 'pair_confined_cage', 'cloud_loaded_cage', 'horizon_cloud_core'],
    ['void_holographic_block', 'addressed_holo_block', 'burned_store_block', 'bottomless_store_core'],
    ['condensate_aerogel', 'superfluid_reservoir_core', 'condensate_wetted_core', 'bottomless_tank_core'],
    ['photonic_qpu_wafer', 'detector_layer_wafer', 'photonic_qpu', 'horizon_computation_core']
  ];
  for (const line of lines) {
    const steps = chain(line);
    steps.forEach((s, i) => {
      assert.ok(s, `${line[i]} missing`);
      assert.equal(s.outs[0][0], `grindless:${line[i]}`);
      if (i > 0) assert.ok(s.items.some((x) => x[0] === `grindless:${line[i - 1]}`), `${line[i]} does not take ${line[i - 1]}`);
    });
  }
});

test('site machines carry their site; home machines carry none', () => {
  const site = {
    kugelblitz_forming: 'grindless:cygnus_x1_orbit',
    magnetic_pair_production: 'grindless:sgr1806_orbit',
    condensate_refinery: 'gcyr:black_hole_orbit',
    void_crystal_fab: 'grindless:local_group_filament'
  };
  for (const r of rows) assert.equal(r.dim, site[r.type], `${r.type}/${r.name}`);
});

test('one circuit per type, except the cryostat, whose rows differ by item inputs', () => {
  const seen = new Map();
  for (const r of rows) {
    const k = `${r.type}:${r.circuit}`;
    if (r.type === 'nuclear_demagnetisation') continue;
    assert.ok(!seen.has(k), `circuit clash ${k}`);
    seen.set(k, r);
  }
  const cry = rows.filter((r) => r.type === 'nuclear_demagnetisation');
  assert.equal(cry.length, 3);
  for (const a of cry) {
    assert.equal(a.circuit, 32);
    for (const b of cry) {
      if (a === b) continue;
      const bi = new Set(b.items.map((x) => x[0]));
      assert.ok(!a.items.every((x) => bi.has(x[0])), `${a.name} is a subset of ${b.name}`);
    }
  }
});

test('rows fit their machine slots and every row has an item input for its circuit', () => {
  const io = {
    kugelblitz_forming: [6, 1, 0, 0], strangelet_growth: [5, 2, 1, 0], magnetic_pair_production: [3, 1, 1, 1],
    condensate_refinery: [4, 3, 2, 2], void_crystal_fab: [4, 2, 2, 1], femtosecond_writing: [3, 2, 1, 1],
    spectral_hole_burning: [2, 1, 1, 0], nuclear_demagnetisation: [3, 1, 1, 1], supercritical_drying: [3, 1, 2, 1],
    shequid_assembly: [5, 1, 1, 1], ion_slicing: [3, 2, 1, 1], snspd_fabrication: [4, 1, 2, 0], photonic_integration: [8, 2, 1, 0]
  };
  for (const r of rows) {
    const [i, o, fi, fo] = io[r.type];
    assert.ok(r.items.length >= 1 && r.items.length <= i, `${r.name} item inputs`);
    assert.ok(r.outs.length <= o, `${r.name} item outputs`);
    assert.ok((r.fluids || []).length <= fi, `${r.name} fluid inputs`);
    assert.ok((r.fluidOuts || []).length <= fo, `${r.name} fluid outputs`);
  }
});

test('refinery boil-off has a destination and electronic-grade silicon is a K4 substrate', () => {
  for (const r of rows.filter((x) => x.type === 'condensate_refinery')) {
    assert.ok(r.outs.some((o) => o[0] === 'grindless:condensate_boil_off'), r.name);
  }
  const k4 = chain(['photonic_qpu_wafer', 'detector_layer_wafer']);
  for (const r of k4) assert.ok(r.items.some((x) => x[0] === 'grindless:electronic_grade_silicon'), r.name);
});
