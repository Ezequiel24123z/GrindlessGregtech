// OpV-A1 (components): lines 4-10 end to end in the static stand-in, the four components made here (motor, pump, conveyor, piston) as the
// component table of docs/eras/opv.md "Voltages and controllers", the OpV-A1 rows on older machines, the item text and the test band.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const OPVC = run.global.grindless.opvComponents;
const recipes = run.docs.recipes.recipes;
const plain = (x) => JSON.parse(JSON.stringify(x));
const find = (id) => recipes.find((r) => r.i === id);
const producers = (id) => recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`)).map((r) => r.i);
const consumers = (id) => recipes.filter((r) => JSON.stringify(r.j.inputs || {}).includes(`"${id}"`)).map((r) => r.i);
const row = (p) => OPVC.rows.find((r) => r.path === p);
const items = (r) => plain(r.itemsIn.map((x) => [x.id, x.count]));

const V_UXV = 134217728;
const OPV_EUT = 268435456;
const WIRE = 'gtceu:chain_strand_single_wire';
const CABLE = 'gtceu:chain_strand_single_cable';
const STACK = 'grindless:chain_lamina_stack';
const ROD = 'grindless:chain_composite_rod';
const MOTOR = 'gtceu:opv_electric_motor';
const TRI_RING = 'gtceu:tritanium_ring';
const TRI_PLATE = 'gtceu:tritanium_plate';

test('the stand-in runs the OpV components scripts without errors, nothing skipped', () => {
  const mine = run.errors.filter((e) => /opv[\\/]components|opv_components/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(OPVC.skipped), []);
  assert.deepEqual(plain(OPVC.rows.map((r) => r.path)), ['chain_sic_preform', 'superfluid_he3_seal', 'chain_field_coil', 'opv_electric_motor',
    'opv_electric_pump', 'opv_conveyor_module', 'opv_electric_piston', 'opv_robot_arm', 'opv_emitter', 'opv_sensor', 'opv_fluid_regulator']);
  assert.deepEqual(plain(OPVC.components), [MOTOR, 'gtceu:opv_electric_pump', 'gtceu:opv_conveyor_module', 'gtceu:opv_electric_piston']);
  assert.deepEqual(plain(OPVC.circuitComponents), ['gtceu:opv_robot_arm', 'gtceu:opv_emitter', 'gtceu:opv_sensor', 'gtceu:opv_fluid_regulator']);
});

test('every row is a GTM assembler row at 2^28 EU/t: above V[UXV], below 2^31, in the recipe docs', () => {
  for (const r of OPVC.rows) {
    assert.equal(r.type, 'assembler', r.path);
    assert.equal(r.eut, OPV_EUT, r.path);
    assert.ok(r.eut > V_UXV && r.eut < 2 ** 31, r.path);
    assert.equal(r.id, `grindless:assembler/${r.path}`);
    const doc = find(r.id);
    assert.ok(doc && doc.t === 'gtceu:assembler', `${r.id} is in the recipe docs`);
    assert.ok(r.itemsIn.length <= 9 && r.fluidsIn.length <= 1, `${r.path} fits GTM's assembler`);
  }
});

test('the four components follow the component table: GT-like counts, no circuit, no UXV-or-lower component', () => {
  assert.deepEqual(items(row('opv_electric_motor')), [['grindless:chain_field_coil', 1], [ROD, 2], [WIRE, 4], [CABLE, 2], [TRI_RING, 2]]);
  assert.deepEqual(plain(row('opv_electric_motor').fluidsIn), [{ id: 'gtceu:superfluid_helium_3', amount: 250 }]);
  assert.deepEqual(items(row('opv_electric_pump')), [[MOTOR, 1], ['grindless:chain_composite_rotor', 1], ['grindless:superfluid_he3_seal', 2],
    [STACK, 2], [CABLE, 1], [TRI_PLATE, 2]]);
  assert.deepEqual(plain(row('opv_electric_pump').fluidsIn), []);
  assert.deepEqual(items(row('opv_conveyor_module')), [[MOTOR, 2], ['grindless:chain_mesh_belt', 2], [CABLE, 1], [TRI_PLATE, 2],
    ['gtceu:tritanium_round', 4], [TRI_RING, 2]]);
  assert.deepEqual(plain(row('opv_conveyor_module').fluidsIn), [], 'the native probe row takes no fluid');
  assert.deepEqual(items(row('opv_electric_piston')), [[MOTOR, 1], ['grindless:opv_harmonic_drive', 1], [ROD, 2], [STACK, 2], [CABLE, 2]]);
  assert.deepEqual(plain(row('opv_electric_piston').fluidsIn), [{ id: 'gtceu:lubricant', amount: 250 }]);
  for (const id of OPVC.components) {
    const r = OPVC.rows.find((x) => x.itemsOut[0].id === id);
    assert.ok(r, id);
    assert.equal(r.circuit, null, `${id}: no circuit`);
    assert.deepEqual(plain(r.itemsOut), [{ id, count: 1 }]);
    const text = JSON.stringify(r.itemsIn);
    assert.doesNotMatch(text, /gtceu:(ulv|lv|mv|hv|ev|iv|luv|zpm|uv|uhv|uev|uiv|uxv)_/, `${id}: no UXV-or-lower component`);
    assert.doesNotMatch(text, /circuits\//, `${id}: no circuit item`);
  }
});

test('only from: every line part and component has its one producer, and every intermediate is used', () => {
  const only = {
    'grindless:chain_composite_rod': 'grindless:spark_plasma_sintering/chain_composite_rod',
    'grindless:chain_composite_rotor': 'grindless:spark_plasma_sintering/chain_composite_rotor',
    'grindless:superfluid_he3_seal': 'grindless:assembler/superfluid_he3_seal',
    'grindless:chain_mesh_belt': 'grindless:closed_loop_cooling/chain_mesh_belt',
    'grindless:opv_harmonic_drive': 'grindless:spark_plasma_sintering/opv_harmonic_drive',
    'grindless:chain_field_coil': 'grindless:assembler/chain_field_coil',
    'grindless:th229_lasing_crystal': 'grindless:nuclear_clock/nuclear_clock/lasing_check',
    'grindless:hpge_compton_crystal': 'grindless:closed_loop_cooling/hpge_compton_crystal',
    'gtceu:superfluid_helium_3': 'grindless:nuclear_demagnetisation/superfluid_he3',
    'gtceu:liquid_helium_3': 'grindless:cryogenic_processing/liquid_helium_3',
    'gtceu:pure_germanium_tetrachloride': 'grindless:solvent_extraction/ev/germanium_tetrachloride_scrub',
  };
  for (const id of [...OPVC.components, ...OPVC.circuitComponents]) only[id] = `grindless:assembler/${id.replace('gtceu:', '')}`;
  for (const [id, rid] of Object.entries(only)) assert.deepEqual(plain(producers(id)), [rid], id);
  // every intermediate registered here: one producer, at least one use (the whole line is wired)
  for (const id of [...OPVC.items, 'gtceu:pure_germanium_tetrachloride']) {
    assert.equal(producers(id).length, 1, `${id} producers: ${producers(id).join(', ')}`);
    assert.ok(consumers(id).length >= 1, `${id} is used`);
  }
  for (const id of ['grindless:chain_composite_rod', 'grindless:chain_composite_rotor', 'grindless:superfluid_he3_seal', 'grindless:chain_mesh_belt',
    'grindless:opv_harmonic_drive', 'grindless:chain_field_coil', MOTOR]) assert.ok(consumers(id).length >= 1, `${id} is used`);
});

test('the robot arm, emitter, sensor and fluid regulator follow the component table with A2\'s OpV circuits (written at A2\'s landing)', () => {
  const CIRCUIT = '#gtceu:circuits/opv';
  const DRIVE = 'grindless:opv_harmonic_drive';
  const LINK = 'grindless:cryo_optical_link';
  assert.deepEqual(items(row('opv_robot_arm')), [[MOTOR, 2], ['gtceu:opv_electric_piston', 1], [DRIVE, 2], [CABLE, 2], [CIRCUIT, 1]]);
  assert.deepEqual(items(row('opv_emitter')), [['grindless:th229_lasing_crystal', 1], [STACK, 2], [LINK, 1], [CABLE, 2], [CIRCUIT, 2]]);
  assert.deepEqual(items(row('opv_sensor')), [['grindless:hpge_compton_crystal', 1], [STACK, 2], [LINK, 1], [CABLE, 2], [CIRCUIT, 2]]);
  assert.deepEqual(items(row('opv_fluid_regulator')), [['gtceu:opv_electric_pump', 1], [DRIVE, 1], [CIRCUIT, 2], ['grindless:superfluid_he3_seal', 1],
    ['gtceu:tritanium_gear', 1]]);
  assert.deepEqual(plain(row('opv_robot_arm').fluidsIn), [{ id: 'gtceu:lubricant', amount: 250 }]);
  for (const p of ['opv_emitter', 'opv_sensor', 'opv_fluid_regulator']) assert.deepEqual(plain(row(p).fluidsIn), [{ id: 'gtceu:soldering_alloy', amount: 288 }], p);
  for (const id of OPVC.circuitComponents) {
    const r = OPVC.rows.find((x) => x.itemsOut[0].id === id);
    assert.ok(r && r.circuit === null && r.fluidsIn.length === 1, id);
    assert.deepEqual(plain(r.itemsOut), [{ id, count: 1 }]);
    assert.doesNotMatch(JSON.stringify(r.itemsIn), /gtceu:(ulv|lv|mv|hv|ev|iv|luv|zpm|uv|uhv|uev|uiv|uxv)_/, `${id}: no UXV-or-lower component`);
  }
});

test('the OpV-A1 rows on older machines are in the recipe docs', () => {
  for (const id of ['grindless:chemical_vapour_infiltration/chain_preform_densify', 'grindless:chemical_vapour_infiltration/rebco_potting',
    'grindless:megabar_synthesis/flexspline_cup', 'grindless:femtosecond_writing/flexspline_teeth', 'grindless:magnet_winding/rebco_pancake',
    'grindless:magnet_winding/rebco_training', 'grindless:hot_cell/thorium_229_nitrate', 'grindless:fluorspar_digestion/laser_grade_thf4',
    'grindless:crystal_growth/crystal_growth/th_caf2_lasing', 'grindless:crystal_growth/crystal_growth/hpge_compton', 'grindless:mocvd/th_caf2_coating',
    'grindless:zone_refining/thirteen_n_germanium', 'grindless:ion_implantation/hpge_contacts', 'grindless:nuclear_demagnetisation/superleak_plug',
    'grindless:electron_beam_refining/mesh_belt_weld']) assert.ok(find(id), id);
  const tables = (n) => JSON.parse(fs.readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', n + '.json'), 'utf8'));
  const gum = tables('am_powders').metals.find((m) => m.name === 'gum_metal');
  assert.ok(gum && /^OpV-A1/.test(gum._why), 'am_powders gum_metal row');
});

test('text: every OpV-A1 item and material has its name in en_us and es_es, and every item two tooltip lines', () => {
  for (const l of ['en_us', 'es_es']) {
    for (const id of OPVC.items) {
      const n = id.replace('grindless:', '');
      for (const k of [`item.grindless.${n}`, `tooltip.grindless.${n}.0`, `tooltip.grindless.${n}.1`]) assert.ok(run.lang[l][k], `${l} ${k}`);
    }
    for (const m of OPVC.materials) assert.ok(run.lang[l]['material.' + m.replace(':', '.')], `${l} ${m}`);
  }
});

test('the test band: one zones.json row for gg_test_opv_components', () => {
  const zones = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'test', 'zones.json'), 'utf8'));
  const list = Object.values(zones).find((v) => Array.isArray(v) && v.some((z) => z && z.id === 'opv_components'));
  const z = list.find((x) => x.id === 'opv_components');
  assert.deepEqual(plain([z.x, z.z, z.y, z.tests]), [[37888, 37951], [0, 63], [98, 115], ['opv_components']]);
  const overlay = fs.readFileSync(path.join(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_opv_components.js'), 'utf8');
  assert.match(overlay, /var X0 = 37888/);
  assert.match(overlay, /var X1 = 37951/);
  assert.match(overlay, /ServerEvents\.customCommand\('gg_test_opv_components'/);
});
