// UXV-B4 (vela_pasta): the pasta extractor, phase sorter, draw bench, laminator and polar cap tap rows, the five controllers' assembly lines, the
// hull and hatches, line 48's assembler steps, the older rows and the structures of startup_scripts/grindless/uxv/vela_pasta.js.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { measure, violations } from '../lib/structure_quality.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const VP = run.global.grindless.velaPasta;
const UF = run.global.grindless.uxvFoundation;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const producers = (id) => recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`));
const plain = (x) => JSON.parse(JSON.stringify(x));
const rec = (type, name) => VP.recipes.find((r) => r.type === type && r.name === name);
const SITE = 'grindless:vela_pulsar_orbit';
const MACHINES = ['pasta_extractor', 'pasta_phase_sorter', 'pasta_draw_bench', 'pasta_laminator', 'polar_cap_tap'];
const ids = (list) => plain(list.map((x) => [x.id, x.count]));
const kube = (...p) => fs.readFileSync(path.join(pack, 'kubejs', ...p), 'utf8');

test('the stand-in runs the UXV-B4 scripts without errors, nothing skipped, no lookup clash', () => {
  const mine = run.errors.filter((e) => /vela_pasta|uxv[\\/]foundation|zpm[\\/]observatory|luv[\\/]ganymede|rx_j1856|sounds/.test(String(e.file)) && !/no original recipe/.test(String(e.message)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(VP.skipped), []);
  assert.deepEqual(plain(VP.clashes), []);
  assert.equal(VP.recipes.length, 8);
  assert.deepEqual(plain(UF.skipped), []);
});

test('extractor c1: the timing record kept, a pellet worn at 10%, raw pasta; 134,217,728 EU/t, 2,400 t, at Vela', () => {
  const r = rec('pasta_extraction', 'pasta_extraction');
  assert.deepEqual([r.circuit, r.eut, r.duration, r.site], [1, 134217728, 2400, SITE]);
  assert.deepEqual(ids(r.kept), [['grindless:vela_glitch_timing', 1]]);
  assert.deepEqual(plain(r.wear.map((x) => [x.id, x.chance])), [['grindless:neutronium_pellet', 1000]]);
  assert.deepEqual(ids(r.itemsOut), [['grindless:raw_pasta', 1]]);
});

test('sorter c1 (raw pasta, cage part kept -> four outputs) and c2 (16 residues + a cage part -> core sample)', () => {
  const c1 = rec('pasta_sorting', 'phase_sorting');
  assert.deepEqual([c1.circuit, c1.eut, c1.duration, c1.site], [1, 67108864, 1200, SITE]);
  assert.deepEqual(ids(c1.kept), [['grindless:cage_part', 1]]);
  assert.deepEqual(ids(c1.itemsOut).map((x) => x[0]), ['grindless:spaghetti_phase', 'grindless:lasagna_phase', 'grindless:gnocchi_fragment', 'grindless:anti_phase_residue']);
  const c2 = rec('pasta_sorting', 'core_sample');
  assert.deepEqual([c2.circuit, c2.eut, c2.duration], [2, 134217728, 2400]);
  assert.deepEqual(ids(c2.itemsIn), [['grindless:anti_phase_residue', 16], ['grindless:cage_part', 1]]);
  assert.deepEqual(ids(c2.itemsOut), [['grindless:pasta_core_sample', 1]]);
});

test('draw bench: spaghetti + aerogel (cage part kept) -> 8 strand wire; laminator c1 -> 4 plates, c2 -> electrode', () => {
  const d = rec('pasta_drawing', 'strand_drawing');
  assert.deepEqual([d.circuit, d.eut, d.duration, d.site], [1, 134217728, 1200, SITE]);
  assert.deepEqual(ids(d.itemsOut), [['gtceu:pasta_strand_single_wire', 8]]);
  assert.deepEqual(ids(d.itemsIn).map((x) => x[0]), ['grindless:spaghetti_phase', 'grindless:silica_aerogel']);
  const p = rec('pasta_lamination', 'plate_pressing');
  assert.deepEqual([p.circuit, p.eut, p.duration], [1, 134217728, 1200]);
  assert.deepEqual(ids(p.itemsIn).map((x) => x[0]), ['grindless:lasagna_phase', 'grindless:wf_rhea_billet']);
  assert.deepEqual(ids(p.itemsOut), [['grindless:lasagna_plate', 4]]);
  const e = rec('pasta_lamination', 'lasagna_electrode');
  assert.deepEqual([e.circuit, e.eut, e.duration], [2, 33554432, 400]);
  assert.deepEqual(ids(e.itemsIn), [['grindless:lasagna_plate', 1], ['gtceu:pasta_strand_single_wire', 2]]);
  assert.deepEqual(ids(e.itemsOut), [['grindless:lasagna_electrode', 1]]);
});

test('tap: a generator, one lasagna electrode -> 536,870,912 EU/t for 720 t (386,547,056,640 EU), through one UIV 16 A dynamo; returns about 2x its chain', () => {
  const t = rec('polar_cap_tapping', 'polar_cap_tap');
  assert.deepEqual([t.circuit, t.eut, t.duration, t.site, t.generator], [1, 536870912, 720, SITE, true]);
  assert.deepEqual(ids(t.itemsIn), [['grindless:lasagna_electrode', 1]]);
  assert.equal(t.eut * t.duration, 386547056640);
  // chain per electrode: per raw pasta extraction + sorting + drawing + pressing + 4 electrodes, four electrodes per pasta
  const chain = (134217728 * 2400 + 67108864 * 1200 + 134217728 * 1200 + 134217728 * 1200 + 4 * 33554432 * 400) / 4;
  assert.ok(t.eut * t.duration / chain > 1.9 && t.eut * t.duration / chain < 2.1, 'about 2x the chain');
  assert.equal(536870912, 16 * 2 ** 25, 'a UIV 16 A hatch carries it');
  assert.ok(find('grindless:polar_cap_tapping/polar_cap_tap'), 'tap recipe added');
  assert.equal(VP.dynamo, 'gtceu:uiv_energy_output_hatch_16a');
  const src = kube('startup_scripts', 'grindless', 'uxv', 'vela_pasta.js');
  assert.match(src, /G\.generators\.configure\(builder, \{ maxParallels: 1/);
  assert.match(src, /Pat\.part\('energy_output', \{ min: 1, max: 1 \}\)/);
});

test('every row is Vela-locked and takes an input; the cage companion is circuit-less on UIV\'s type at its site', () => {
  for (const r of VP.recipes.filter((x) => x.type !== 'neutronium_caging')) {
    assert.equal(r.site, SITE, r.name);
    assert.ok(r.itemsIn.length + r.kept.length + r.wear.length + r.fluidsIn.length > 0, r.name);
    assert.ok(JSON.stringify(find(`grindless:${r.type}/${r.name}`).j.recipeConditions || []).includes(SITE), `${r.name} carries the dimension lock`);
  }
  const c = rec('neutronium_caging', 'cage_part_pressing');
  assert.deepEqual([c.circuit, c.site, c.eut, c.duration], [0, 'grindless:rx_j1856_orbit', 31457280, 2400]);
  assert.deepEqual(ids(c.itemsIn), [['grindless:neutronium_pellet', 1], ['grindless:mh_winding', 1]]);
  assert.deepEqual(ids(c.itemsOut), [['grindless:cage_part', 1]]);
  assert.ok(find('grindless:neutronium_caging/cage_part_pressing'));
});

test('the controllers: UIV hull, uxv_sensor, 2 mainframes, UIV circuits, era fluid, soldering alloy, lubricant, research', () => {
  assert.deepEqual(plain(VP.controllerRecipes), MACHINES.map((m) => `grindless:assembly_line/${m}`));
  const research = { pasta_extractor: 'vela_glitch_timing', pasta_phase_sorter: 'cage_part', pasta_draw_bench: 'gtceu:pasta_phase_sorter',
    pasta_laminator: 'wf_rhea_billet', polar_cap_tap: 'gtceu:pasta_laminator' };
  for (const m of MACHINES) {
    const r = find(`grindless:assembly_line/${m}`);
    assert.ok(r && r.t === 'gtceu:assembly_line', m);
    const text = JSON.stringify(r.j);
    assert.ok(text.includes(`gtceu:${m}`), `${m} is its output`);
    for (const need of ['gtceu:uiv_machine_hull', 'gtnn:spintronic_mainframe', 'gtceu:circuits/uiv', 'gtceu:uxv_sensor', 'gtceu:soldering_alloy', 'gtceu:lubricant', research[m]]) {
      assert.ok(text.includes(need), `${m} takes ${need}`);
    }
    const distinct = new Set(text.match(/"(?:id|tag|item)":"[^"]+"/g) || []);
    assert.ok(distinct.size >= 8, `${m}: ${distinct.size} distinct ingredients`);
  }
});

test('hull and the four hatches: assembly lines with station research and 1,000 mB filtered disk plasma, taking the voltage coil and the die', () => {
  assert.deepEqual(plain(UF.recipes), ['uxv_machine_hull', 'uxv_energy_input_hatch', 'uxv_energy_output_hatch', 'uxv_energy_input_hatch_16a', 'uxv_energy_output_hatch_16a']
    .map((n) => `grindless:assembly_line/${n}`));
  for (const n of ['uxv_machine_hull', 'uxv_energy_input_hatch', 'uxv_energy_output_hatch', 'uxv_energy_input_hatch_16a', 'uxv_energy_output_hatch_16a']) {
    const r = find(`grindless:assembly_line/${n}`);
    assert.ok(r && r.t === 'gtceu:assembly_line', n);
    const text = JSON.stringify(r.j);
    assert.ok(text.includes(`gtceu:${n}`) && text.includes('gtceu:filtered_disk_plasma') && text.includes('grindless:uxv_voltage_coil') && text.includes('grindless:lasagna_plate'), n);
    if (n !== 'uxv_machine_hull') assert.ok(text.includes('gtceu:uxv_machine_hull') && text.includes('grindless:ga2o3_power_die') && text.includes('gtceu:pasta_strand_single_wire'), n);
    else assert.ok(text.includes('gtceu:uxv_machine_casing'));
  }
});

test('line 48: wound toroid, voltage coil (finemet core + strand wire), the repeater; GTM assembler rows', () => {
  assert.deepEqual(plain(VP.line48), ['finemet_toroid', 'uxv_voltage_coil', 'pasta_strand_repeater'].map((n) => `grindless:assembler/${n}`));
  const t = JSON.stringify(find('grindless:assembler/finemet_toroid').j);
  assert.ok(t.includes('grindless:finemet_ribbon') && t.includes('grindless:finemet_toroid'));
  const v = JSON.stringify(find('grindless:assembler/uxv_voltage_coil').j);
  assert.ok(v.includes('grindless:finemet_core') && v.includes('gtceu:pasta_strand_single_wire') && v.includes('grindless:uxv_voltage_coil'));
  const p = JSON.stringify(find('grindless:assembler/pasta_strand_repeater').j);
  assert.ok(p.includes('gtceu:pasta_strand_single_wire') && p.includes('grindless:pulsar_timed_repeater') && p.includes('grindless:mtj_die'));
});

test('older rows: DSN circuit 6, Ganymede GW circuit 3, decompressor circuit 3 (gnocchi), each free of a clash', () => {
  const dsn = find('grindless:telemetry_decoding/vela_glitch_timing');
  assert.ok(dsn, 'vela_glitch_timing');
  const dt = JSON.stringify(dsn.j);
  assert.ok(dt.includes('"configuration":6') && dt.includes('grindless:xray_pulse_timed') && dt.includes('gtceu:data_orb') && dt.includes('grindless:vela_glitch_timing'));
  const gw = find('grindless:luv/vela_glitch_record') || find('grindless:gravitational_wave_astronomy/luv/vela_glitch_record');
  assert.ok(gw, 'vela_glitch_record');
  const gt = JSON.stringify(gw.j);
  assert.ok(gt.includes('"configuration":3') && gt.includes('grindless:vela_glitch_timing') && gt.includes('grindless:vela_glitch_record'));
  const d = JSON.parse(fs.readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', 'rx_j1856.json'), 'utf8')).types.r_process_decompression.recipes;
  assert.deepEqual(d.map((r) => r.circuit), [1, 2, 3]);
  const g = d[2];
  assert.deepEqual([g.name, g.eut, g.duration, g.site], ['gnocchi_decompression', 31457280, 1600, true]);
  assert.deepEqual(g.itemsIn, [{ id: 'grindless:gnocchi_fragment', count: 1 }]);
  assert.deepEqual(g.itemsOut.map((x) => [x.id, x.count]), [['grindless:r_process_ash', 2], ['grindless:fission_fragments', 1]]);
  assert.equal(g.fluidsIn[0].amount, 4000);
});

test('"only from": nothing else in the pack makes these ids (cage part and electrode have a UIV source too)', () => {
  const only = {
    'grindless:raw_pasta': 'pasta_extraction/pasta_extraction', 'grindless:spaghetti_phase': 'pasta_sorting/phase_sorting', 'grindless:lasagna_phase': 'pasta_sorting/phase_sorting',
    'grindless:gnocchi_fragment': 'pasta_sorting/phase_sorting', 'grindless:anti_phase_residue': 'pasta_sorting/phase_sorting', 'grindless:pasta_core_sample': 'pasta_sorting/core_sample',
    'gtceu:pasta_strand_single_wire': 'pasta_drawing/strand_drawing', 'grindless:lasagna_plate': 'pasta_lamination/plate_pressing',
    'grindless:finemet_toroid': 'assembler/finemet_toroid', 'grindless:uxv_voltage_coil': 'assembler/uxv_voltage_coil',
    'grindless:pasta_strand_repeater': 'assembler/pasta_strand_repeater', 'grindless:vela_glitch_timing': 'telemetry_decoding/vela_glitch_timing',
    'grindless:vela_glitch_record': 'vela_glitch_record', 'gtceu:uxv_machine_hull': 'assembly_line/uxv_machine_hull',
    'gtceu:uxv_energy_input_hatch': 'assembly_line/uxv_energy_input_hatch', 'gtceu:uxv_energy_output_hatch': 'assembly_line/uxv_energy_output_hatch',
    'gtceu:uxv_energy_input_hatch_16a': 'assembly_line/uxv_energy_input_hatch_16a', 'gtceu:uxv_energy_output_hatch_16a': 'assembly_line/uxv_energy_output_hatch_16a',
    'gtceu:pasta_extractor': 'assembly_line/pasta_extractor', 'gtceu:pasta_phase_sorter': 'assembly_line/pasta_phase_sorter', 'gtceu:pasta_draw_bench': 'assembly_line/pasta_draw_bench',
    'gtceu:pasta_laminator': 'assembly_line/pasta_laminator', 'gtceu:polar_cap_tap': 'assembly_line/polar_cap_tap'
  };
  for (const [id, tail] of Object.entries(only)) {
    const ps = producers(id);
    assert.ok(ps.length >= 1, `${id} has a producer`);
    assert.ok(ps.every((r) => r.i.endsWith(tail)), `${id} only from ${tail}: ${ps.map((r) => r.i)}`);
  }
  const src = (id) => producers(id).map((r) => r.i).sort();
  assert.deepEqual(src('grindless:cage_part').filter((i) => /cage_part_pressing/.test(i)), ['grindless:neutronium_caging/cage_part_pressing']);
  assert.ok(src('grindless:lasagna_electrode').includes('grindless:pasta_lamination/lasagna_electrode'));
  assert.deepEqual(src('grindless:polar_cap_electrode').filter((i) => /pasta_/.test(i)), [], 'UIV\'s electrode is not ours');
});

test('structures: not boring, three functional kinds, controller in the front slice, 16 rows at most, dominant share <= 0.62', () => {
  for (const m of MACHINES) {
    const s = run.global.grindless.structures[`gtceu:${m}`];
    assert.ok(s, `${m} has a description`);
    const mm = measure(s);
    assert.deepEqual(violations(mm), [], `${m}: ${JSON.stringify(mm)}`);
    assert.ok(mm.dominantShare <= 0.62, `${m}: dominant share ${mm.dominantShare}`);
    assert.ok(mm.functional.length >= 3, `${m}: ${mm.functional}`);
    assert.ok(s.slices.every((sl) => sl.length <= 16), `${m}: at most 16 rows per slice`);
    assert.ok(s.slices[s.slices.length - 1].some((row) => row.includes('S')), `${m}: the controller is in the front slice`);
  }
  assert.deepEqual(MACHINES.map((m) => run.global.grindless.structures[`gtceu:${m}`].slices.length), [21, 13, 23, 9, 11]);
});

test('lang parity: every key of both languages, names, tooltips, EMI pages and recipe lines; sound and EMI files', () => {
  const keys = [];
  for (const m of MACHINES) {
    keys.push(`block.gtceu.${m}`, `grindless.machine.${m}.tooltip.0`, `grindless.machine.${m}.tooltip.1`, `grindless.machine.${m}.tooltip.2`, `emi.grindless.info.${m}.0`, `emi.grindless.info.${m}.1`);
    assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'emi', 'recipe', 'additions', 'grindless', `uxv_vela_pasta_${m}.json`)), `${m} EMI info file`);
    assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'block', 'multiblock', m, 'overlay_front_active.png')), `${m} texture`);
  }
  keys.push('gtceu.pasta_extraction', 'gtceu.pasta_sorting', 'gtceu.pasta_drawing', 'gtceu.pasta_lamination', 'gtceu.polar_cap_tapping');
  for (const r of VP.recipes) if (r.dataKey !== '') keys.push(`gtceu.recipe.${r.dataKey}.${r.name}`);
  keys.push('gtceu.recipe.grindless_r_process_decompression.gnocchi_decompression');
  for (const k of keys) for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][k], `${lang} has ${k}`);
  const re = /pasta_|polar_cap|gnocchi_decompression/;
  assert.deepEqual(Object.keys(run.lang.en_us).filter((k) => re.test(k)).sort(), Object.keys(run.lang.es_es).filter((k) => re.test(k)).sort());
  const sounds = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'assets', 'sounds.json'), 'utf8')).sounds || [];
  const wiring = kube('startup_scripts', 'grindless', 'sounds.js');
  for (const [type, loop] of [['pasta_extraction', 'pasta_extractor'], ['pasta_sorting', 'pasta_phase_sorter'], ['pasta_drawing', 'pasta_draw_bench'],
    ['pasta_lamination', 'pasta_laminator'], ['polar_cap_tapping', 'polar_cap_tap']]) {
    assert.ok(wiring.includes(`'gtceu:${type}': 'loop_${loop}'`), `${type} wired`);
    if (sounds.length > 0) assert.ok(sounds.some((s) => s.id === `loop_${loop}` && s.recipeType === `gtceu:${type}` && s.loop === true), `${loop} row`);
  }
});
