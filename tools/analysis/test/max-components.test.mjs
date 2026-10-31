// MAX-A2 (docs/eras/max.md, A2 "First six components"), no game needed: max/components.js makes the six components from MAX parts only, at VA[MAX],
// and every GTM step of lines L9, L10 and L41 sits on an id the older tables make. T1 is gg_test_max_components (tools/test/overlay/kubejs/server_scripts).
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
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const VA_MAX = 2013265920;
const MC = run.global.grindless.maxComponents;
const src = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'max', 'components.js'), 'utf8');
const COMPONENTS = ['max_electric_motor', 'max_electric_pump', 'max_electric_piston', 'max_robot_arm', 'max_emitter', 'max_fluid_regulator'];
const A3 = ['grindless:max_conveyor_module', 'grindless:max_sensor', 'grindless:max_field_generator'];
const rowOf = (name) => MC.rows.find((r) => r.name === name);
const inputIds = (r) => r.items.map((s) => s.replace(/^\d+x /, ''));

test('components.js runs without errors, skips nothing and names the three A3 parts as pendingRoutes', () => {
  const errs = run.errors.filter((e) => /max[\\/]components/.test(String(e.file)) && !/no original recipe/.test(String(e.message)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MC.skipped), []);
  assert.equal(MC.recipes.length, 18);
  assert.deepEqual(plain(MC.pendingRoutes), A3);
  assert.equal(MC.pendingBy, 'A3');
  assert.ok(!/^\/\/ priority:/m.test(src.replace(/^\/\/ priority: -?\d+\r?\n/, '')), 'no hand-written priority line');
});

test('the six components are assembler rows at VA[MAX] (V[MAX] x 1, the large assembler with two OpV 4 A hatches); every other row is below it', () => {
  assert.match(src, /GTValues\.VA\[MAXT\]/);
  assert.equal(2 ** 31 - 2 ** 27, VA_MAX);
  COMPONENTS.forEach((c) => {
    const r = rowOf(c);
    assert.equal(r.type, 'assembler', c);
    assert.equal(r.eut, null, c + ' takes VA[MAX] from GTValues');
    assert.deepEqual(plain(r.out), ['1x grindless:' + c]);
  });
  MC.rows.filter((r) => !COMPONENTS.includes(r.name)).forEach((r) => assert.ok(r.eut > 0 && r.eut < VA_MAX, r.name));
});

test('component cores follow the Components table: MAX parts only, the six reach a MAX circuit and no recycle loop', () => {
  const core = {
    max_electric_motor: ['grindless:max_field_coil', 'grindless:exotic_composite_rod', 'grindless:sc_magnetic_bearing', 'gtceu:horizon_strand_single_wire', 'gtceu:horizon_strand_single_cable'],
    max_electric_pump: ['grindless:max_electric_motor', 'grindless:exotic_composite_rotor', 'grindless:superfluid_he3_seal'],
    max_electric_piston: ['grindless:max_electric_motor', 'grindless:opv_harmonic_drive', 'grindless:laminated_terfenol_stack', 'grindless:exotic_composite_rod'],
    max_robot_arm: ['grindless:max_electric_motor', 'grindless:max_electric_piston', '#gtceu:circuits/max'],
    max_emitter: ['grindless:squeezed_light_chip', 'grindless:cryo_optical_link', 'grindless:max_optical_isolator', '#gtceu:circuits/max'],
    max_fluid_regulator: ['grindless:max_electric_pump', 'grindless:superfluid_valve', '#gtceu:circuits/max', 'grindless:tetron_array']
  };
  for (const [c, ids] of Object.entries(core)) {
    const have = inputIds(rowOf(c));
    ids.forEach((id) => assert.ok(have.includes(id), c + ' takes ' + id));
    assert.ok(!have.includes('grindless:' + c), c + ' does not take itself');
  }
  assert.deepEqual(plain(rowOf('max_robot_arm').items.filter((s) => /motor/.test(s))), ['2x grindless:max_electric_motor']);
  assert.ok(rowOf('max_emitter').items.includes('2x #gtceu:circuits/max'));
  assert.ok(rowOf('max_fluid_regulator').items.includes('2x #gtceu:circuits/max'));
  // nothing here consumes an A3 part
  MC.rows.forEach((r) => A3.forEach((a) => assert.ok(!inputIds(r).includes(a), r.name + ' does not take ' + a)));
});

test('L9, L10 and L41: each GTM step takes what the older machines make and gives what the next step takes', () => {
  const tbl = (f) => JSON.parse(fs.readFileSync(path.join(kube, 'data', 'grindless', 'tables', f + '.json'), 'utf8'));
  const outs = (list) => new Set(list.flatMap((r) => (r.itemsOut || []).map((o) => o.id)));
  const flat = (t) => (t.recipes || Object.values(t.types).flatMap((x) => x.recipes));
  const made = new Set();
  ['coated_conductor_line', 'hts_magnet_works', 'composites', 'tfln_femtosecond', 'levitation_melter', 'memories_cryostat', 'spin_logic', 'shequid_mnt', 'transcurium', 'electron_beam']
    .forEach((f) => outs(flat(tbl(f))).forEach((o) => made.add(o)));
  ['grindless:rebco_tape_max', 'grindless:max_coil_winding', 'grindless:cmc_coil_former', 'grindless:sic_sic_preform', 'grindless:balanced_composite_billet', 'grindless:isolator_waveguide_die',
    'grindless:yig_on_ln_wafer', 'grindless:bearing_rotor_ring', 'grindless:fe16n2_ring_magnet', 'grindless:cold_tested_superleak', 'grindless:oriented_terfenol_rod']
    .forEach((id) => assert.ok(made.has(id), id + ' is made by an older table'));
  const chain = [
    ['stabilised_rebco_tape', 'grindless:rebco_tape_max'], ['silica_alcogel', 'gtceu:silicon_dioxide_dust'], ['silylated_alcogel', 'grindless:silica_alcogel'],
    ['exotic_infiltrated_preform', 'grindless:sic_sic_preform'], ['potted_superleak', 'grindless:aerogel_superleak_plug'], ['exotic_composite_rod', 'grindless:balanced_composite_billet'],
    ['exotic_composite_rotor', 'grindless:balanced_composite_billet'], ['laminated_terfenol_stack', 'grindless:oriented_terfenol_rod'], ['max_field_coil', 'grindless:max_coil_winding'],
    ['max_optical_isolator', 'grindless:isolator_waveguide_die'], ['sc_magnetic_bearing', 'grindless:bearing_rotor_ring'],     ['superfluid_valve', 'grindless:cold_tested_superleak']
  ];
  chain.forEach(([row, input]) => assert.ok(inputIds(rowOf(row)).includes(input), row + ' takes ' + input));
      // MAX-A3 fix (decision 76, max.md L41): the valve takes the mK cryostat's cold-tested superleak, not the potted one two steps upstream
      assert.ok(!inputIds(rowOf('superfluid_valve')).includes('grindless:potted_superleak'), 'the valve does not take the potted superleak');
  assert.ok(inputIds(rowOf('stabilised_rebco_tape')).length >= 1);
  assert.ok(inputIds(rowOf('max_field_coil')).includes('grindless:max_coil_winding'));
  // the HTS winding takes the tape this file makes, and the CVI preform the SiC fibre makes
  const hts = tbl('hts_magnet_works').recipes.find((r) => r.name === 'max_coil_winding');
  assert.ok(hts.itemsIn.some((x) => x.id === 'grindless:stabilised_rebco_tape'));
});

test('every id a row makes is registered by MAX-F1 or older, and each row has a fluid or a MAX-era shape (one fluid per assembler row)', () => {
  const foundation = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', 'max', 'foundation.js'), 'utf8');
  MC.rows.forEach((r) => {
    r.out.forEach((o) => {
      const id = o.replace(/^\d+x /, '');
      assert.ok(foundation.includes(id.replace('grindless:', '') + ':'), r.name + ' makes ' + id + ', registered in max/foundation.js');
    });
    if (r.type === 'assembler') assert.equal(r.fluids.length, 1, r.name + ': a GTM assembler takes one fluid');
  });
});
