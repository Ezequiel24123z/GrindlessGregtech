// XP-H4a (MAX+ hyper assembly array, the Hyperstargate's grid rows and the six creative rows): the stand-in run of maxplus/grid.js, every row against
// docs/eras/maxplus.md's grid and creative tables, circuits, lang parity and the test zone.
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
const run = runPackScripts(pack);
const GRID = run.global.grindless.maxPlusGrid;
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const lang = read(kube, 'client_scripts', 'grindless', 'maxplus_grid_lang.js');
const rows = [...plain(GRID.rows), ...plain(GRID.creative)];
const V_MAX = 2147483647; // GTValues.V[14]
const g = (s) => `grindless:${s}`;
const RING = g('hyperstargate_ring_block');
const UPGRADE = g('hyperstargate_chevron_upgrade');
const CHEVRON = g('hyperstargate_chevron_block');

// docs/eras/maxplus.md :397-435: the design's inputs, by row
const EXPECT = {
  hyperstargate_ring_block: { horizon_frame_part: 20, horizon_containment_plate: 10, maxplus_field_generator: 6, horizon_compressed_plate: 8, flux_absorber_casing: 8, kerr_strange_plate: 4, chevron_core: 2, horizon_waveguide: 4, horizon_frame_truss: 2 },
  hyperstargate_chevron_upgrade: { horizon_compressed_plate: 24, horizon_frame_part: 8, chevron_core: 4, maxplus_field_generator: 2, maxplus_electric_piston: 2, maxplus_sensor: 1, maxplus_emitter: 1, cold_kerr_gyro: 2 },
  hyperstargate_chevron_block: { [RING]: 4, [UPGRADE]: 9, horizon_containment_plate: 16, maxplus_field_generator: 4, horizon_shielding: 16, horizon_waveguide: 16, horizon_conduit: 16, horizon_valve: 16 },
  hyperstargate_locked_chevron: { [RING]: 4, [UPGRADE]: 9, horizon_containment_plate: 16, maxplus_field_generator: 4, horizon_shielding: 16, horizon_waveguide: 16, horizon_conduit: 16, horizon_valve: 16, horizon_lock: 1 },
  iris_blade: { coated_iris_blade: 1, horizon_compressed_plate: 12, kerr_strange_plate: 8, maxplus_electric_piston: 2, maxplus_conveyor_module: 1 },
  horizon_iris: { iris_blade: 240, horizon_shielding: 12, condensate_field_cell: 12 },
  horizon_capacitor: { cold_kerr_toroid: 4, maxplus_field_generator: 4, cold_kerr_fcl: 2, creative_energy_cell: 1 },
  hyperstargate_power_unit: { [RING]: 16, resonance_chamber: 8, horizon_conduit: 640, creative_energy: 1 },
  hyperstargate_base: { [CHEVRON]: 27, [RING]: 144, [UPGRADE]: 36, horizon_alignment_matrix: 4, creative_chest: 1, creative_tank: 1, 'megacells:item_storage_cell_256m': 1, 'megacells:fluid_storage_cell_256m': 1, 'gtceu:max_maxplus_energy_hatch_1024a': 4 },
  hyperstargate_interface: { [RING]: 8, creative_data_access_hatch: 1, horizon_comm_terminal: 4, pattern_memory_unit: 64 },
  horizon_alignment_matrix: { cold_reference_assembly: 4, horizon_compressed_plate: 8, kerr_strange_plate: 4, maxplus_sensor: 2, horizon_waveguide: 4 },
  creative_energy: { horizon_cloud_core: 1, maxplus_field_generator: 64, kerr_field_coil: 64, cold_kerr_toroid: 16, horizon_processor: 256, horizon_containment_plate: 64, horizon_conduit: 64, 'gtceu:max_substation_input_hatch_64a': 64 },
  creative_chest: { bottomless_store_core: 1 },
  creative_tank: { bottomless_tank_core: 1 },
  creative_computation_provider: { horizon_computation_core: 1 },
  creative_data_access_hatch: { horizon_computation_core: 1, pattern_memory_unit: 16 },
  creative_energy_cell: { horizon_cloud_core: 1 }
};
const idOf = (k) => (k.includes(':') ? k : g(k));

test('the stand-in runs the script without errors and skips nothing', () => {
  const mine = run.errors.filter((e) => /maxplus[\\/]grid/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(GRID.skipped), []);
  assert.equal(GRID.rows.length, 11);
  assert.equal(GRID.creative.length, 6);
});

test('every row has its design inputs and the right output', () => {
  for (const r of rows) {
    const want = EXPECT[r.name];
    assert.ok(want, `no design entry for ${r.name}`);
    const have = Object.fromEntries(r.items.map((x) => [x[0], x[1]]));
    for (const [k, n] of Object.entries(want)) assert.equal(have[idOf(k)], n, `${r.name}: ${k}`);
    assert.equal(r.out[0], g(r.name));
    assert.equal(r.out[1], 1, `${r.name} output count`);
  }
});

test('the creative rows output grindless: stand-ins, never a placeable GTM or AE2 block', () => {
  for (const r of plain(GRID.creative)) {
    assert.ok(r.out[0].startsWith('grindless:'), `${r.name} outputs ${r.out[0]}`);
    assert.ok(r.amps === 256 && r.duration === 2400, `${r.name} runs at V[MAX] x 256 A for 2,400 t`);
  }
  assert.deepEqual(Object.keys(plain(GRID.creativeItems)).sort(), plain(GRID.creative).map((r) => r.name).sort());
});

test('rows: unique circuit 1 to 32, 64 to 256 A, 1,200 to 2,400 t, a Kerr bath, inputs within the type\'s maximum', () => {
  const seen = new Set();
  for (const r of rows) {
    assert.ok(r.circuit >= 1 && r.circuit <= 32, `${r.name} circuit`);
    assert.ok(!seen.has(r.circuit), `circuit clash ${r.circuit} (${r.name})`);
    seen.add(r.circuit);
    assert.ok(r.amps >= 64 && r.amps <= 256, `${r.name} amps`);
    assert.ok(r.duration >= 1200 && r.duration <= 2400, `${r.name} duration`);
    assert.ok(r.fluids.some((f) => f[0] === 'gtceu:kerr_condensate'), `${r.name} bath`);
    assert.ok(r.items.length + 1 <= GRID.maxItems, `${r.name} exceeds the type's item inputs`);
    assert.ok(r.fluids.length <= GRID.maxFluids, `${r.name} exceeds the type's fluid inputs`);
  }
  const widest = Math.max(...rows.map((r) => r.items.length + 1));
  assert.equal(GRID.maxItems, widest, 'the type\'s maximum is computed from the rows, not padded');
});

test('rows above 2^31 EU/t: V[MAX] x amps', () => {
  const rec = run.docs.recipes.recipes.filter((x) => x.i.startsWith('grindless:hyper_assembly_array/'));
  assert.equal(rec.length, 17);
  for (const x of rec) {
    const eut = x.j.tickInputs.eu.reduce((s, e) => s + e.content, 0);
    assert.ok(eut >= V_MAX * 64, `${x.i} EU/t ${eut}`);
  }
});

test('the controller is an assembly-line recipe', () => {
  const r = run.docs.recipes.recipes.find((x) => x.i === 'grindless:assembly_line/hyper_assembly_array');
  assert.ok(r, 'no assembly line recipe');
  assert.ok(r.j.recipeConditions.some((x) => x.type === 'research'), 'station research kept');
});

test('lang: machine names and every row have an entry, es_es copies English, ASCII only', () => {
  for (const r of rows) assert.ok(lang.includes(`grindless_hyper_assembly_array.${r.name}'`), `no lang key for ${r.name}`);
  for (const k of ['block.gtceu.hyper_assembly_array', 'gtceu.hyper_assembly_array', 'grindless.machine.hyper_assembly_array.tooltip.0']) assert.ok(lang.includes(`'${k}'`), k);
  for (const b of Object.keys(plain(GRID.blocks))) assert.ok(lang.includes(`'block.grindless.${b}'`), b);
  for (const i of [...Object.keys(plain(GRID.items)), ...Object.keys(plain(GRID.creativeItems))]) assert.ok(lang.includes(`'item.grindless.${i}'`), i);
  assert.ok(lang.includes("['en_us', 'es_es']"));
  assert.ok(!/[^\x00-\x7f]/.test(lang), 'non-ASCII characters must be \\u escapes');
});

test('the zone row exists and does not overlap another', () => {
  const z = JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const list = z.zones || z;
  const mine = list.find((r) => r.id === 'maxplus_grid');
  assert.ok(mine);
  assert.deepEqual(mine.tests, ['maxplus_grid']);
  for (const o of list) {
    if (o === mine) continue;
    const overlap = o.x[0] <= mine.x[1] && mine.x[0] <= o.x[1] && o.z[0] <= mine.z[1] && mine.z[0] <= o.z[1] && o.y[0] <= mine.y[1] && mine.y[0] <= o.y[1];
    assert.ok(!overlap, `overlaps ${o.id}`);
  }
});
