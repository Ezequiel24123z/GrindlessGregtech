// UXV-B5 (cas_a): the ejecta knot sweeper and annihilation laser works rows, the two controllers and the uxv_emitter assembly lines, the trap row,
// the older rows (calutron c14, cascade c22, hot cell c16-17, X-ray profiler c3) and the structures of startup_scripts/grindless/uxv/cas_a.js.
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
const CA = run.global.grindless.casA;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const producers = (id) => recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`));
const plain = (x) => JSON.parse(JSON.stringify(x));
const rec = (type, name) => CA.recipes.find((r) => r.type === type && r.name === name);
const SITE = 'grindless:cas_a_remnant';
const MACHINES = ['ejecta_knot_sweeper', 'annihilation_laser_works'];
const ids = (list) => plain(list.map((x) => [x.id, x.count]));
const kube = (...p) => fs.readFileSync(path.join(pack, 'kubejs', ...p), 'utf8');
const table = (name) => JSON.parse(kube('data', 'grindless', 'tables', name));

test('the stand-in runs the UXV-B5 scripts without errors, nothing skipped, no lookup clash', () => {
  const mine = run.errors.filter((e) => /cas_a|extraction_cascade|sounds/.test(String(e.file)) && !/no original recipe/.test(String(e.message)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(CA.skipped), []);
  assert.deepEqual(plain(CA.clashes), []);
  assert.equal(CA.recipes.length, 3);
});

test('sweeper c1: an MH winding worn at 2%, four ejecta knot dusts; 67,108,864 EU/t (2 A of UIV), 1,200 t, at Cassiopeia A', () => {
  const r = rec('ejecta_sweeping', 'sweep_ejecta_knots');
  assert.deepEqual([r.circuit, r.eut, r.duration, r.site], [1, 67108864, 1200, SITE]);
  assert.deepEqual(plain(r.wear.map((x) => [x.id, x.chance])), [['grindless:mh_winding', 200]]);
  assert.deepEqual(ids(r.itemsOut), [['grindless:ejecta_knot_dust', 4]]);
  assert.equal(r.eut, 2 * 2 ** 25);
  assert.ok(JSON.stringify(find('grindless:ejecta_sweeping/sweep_ejecta_knots').j.recipeConditions || []).includes(SITE), 'dimension lock');
});

test('laser works c1 (Ti-44 core worn at 2%, neon, liquid helium -> Ps cell, warm helium) and c2 (cell + cavity + die -> module), on Earth', () => {
  const c1 = rec('annihilation_lasing', 'moderate_positronium');
  assert.deepEqual([c1.circuit, c1.eut, c1.duration, c1.site], [1, 67108864, 1200, '']);
  assert.deepEqual(plain(c1.wear.map((x) => [x.id, x.chance])), [['grindless:ti44_core', 200]]);
  assert.deepEqual(ids(c1.itemsIn), [['grindless:neon_moderator_cartridge', 1]]);
  assert.deepEqual(plain(c1.fluidsIn.map((f) => [f.id, f.amount])), [['gtceu:liquid_helium', 1000]]);
  assert.deepEqual(plain(c1.itemsOut.map((x) => [x.id, x.count, x.chance])), [['grindless:moderated_ps_cell', 1, 0], ['grindless:spent_ti44_core', 1, 200]]);
  assert.deepEqual(plain(c1.fluidsOut.map((f) => [f.id, f.amount])), [['gtceu:helium', 1000]]);
  const c2 = rec('annihilation_lasing', 'stimulate_gamma_emission');
  assert.deepEqual([c2.circuit, c2.eut, c2.duration], [2, 134217728, 2400]);
  assert.deepEqual(ids(c2.itemsIn), [['grindless:moderated_ps_cell', 1], ['grindless:positron_stack', 1], ['grindless:gamma_laser_cavity', 1], ['grindless:mtj_die', 1]]);
  assert.deepEqual(ids(c2.itemsOut), [['grindless:gamma_laser_module', 1]]);
});

test('the trap row (antimatter storage c5, Earth orbit), the emitter line and the controllers', () => {
  assert.deepEqual(plain(CA.trap), ['grindless:antimatter_storage/positron_stack']);
  const t = find('grindless:antimatter_storage/positron_stack');
  const tt = JSON.stringify(t.j);
  assert.ok(tt.includes('"configuration":5') && tt.includes('grindless:positron_cartridge') && tt.includes('gtceu:nitrogen') && tt.includes('grindless:positron_stack'));
  assert.deepEqual(plain(CA.emitter), ['grindless:assembly_line/uxv_emitter']);
  const e = find('grindless:assembly_line/uxv_emitter');
  const et = JSON.stringify(e.j);
  for (const need of ['grindless:uiv_emitter', 'grindless:gamma_laser_module', 'grindless:lasagna_plate', 'gtceu:circuits/uxv', 'gtceu:stellar_hydrogen_cut', 'grindless:uxv_emitter']) assert.ok(et.includes(need), `emitter takes ${need}`);
  assert.deepEqual(plain(CA.controllerRecipes), MACHINES.map((m) => `grindless:assembly_line/${m}`));
  const research = { ejecta_knot_sweeper: 'cnt_whipple_shield', annihilation_laser_works: 'gamma_laser_cavity' };
  for (const m of MACHINES) {
    const r = find(`grindless:assembly_line/${m}`);
    assert.ok(r && r.t === 'gtceu:assembly_line', m);
    const text = JSON.stringify(r.j);
    for (const need of [`gtceu:${m}`, 'gtceu:uiv_machine_hull', 'gtnn:spintronic_mainframe', 'gtceu:circuits/uiv', 'grindless:uxv_sensor', 'gtceu:soldering_alloy', 'gtceu:lubricant', research[m]]) {
      assert.ok(text.includes(need), `${m} takes ${need}`);
    }
    assert.ok(new Set(text.match(/"(?:id|tag|item)":"[^"]+"/g) || []).size >= 8, `${m}: at least 8 distinct ingredients`);
  }
});

test('older rows: calutron c14, cascade c22, hot cell c16-17, profiler c3, each on a free circuit', () => {
  const cal = table('isotopes.json').types.calutron_separation.recipes;
  const ti = cal.find((r) => r.name === 'titanium_44');
  assert.equal(ti.circuit, 14);
  assert.equal(cal.filter((r) => r.circuit === 14).length, 1);
  assert.deepEqual(ti.itemsIn, [{ id: 'grindless:ejecta_ti_fraction_dust', count: 4 }]);
  assert.deepEqual(ti.itemsOut.map((x) => [x.id, x.count]), [['gtceu:titanium_44_dust', 1], ['gtceu:titanium_dust', 3]]);
  const hot = table('hot_cell.json').recipes;
  const cap = hot.find((r) => r.name === 'ti44_core_capsule');
  const dec = hot.find((r) => r.name === 'ti44_core_decay');
  assert.deepEqual([cap.circuit, dec.circuit], [16, 17]);
  assert.equal(hot.filter((r) => r.circuit === 16 || r.circuit === 17).length, 2, 'hot cell circuits 16 and 17 are ours alone');
  assert.deepEqual(cap.itemsIn.map((x) => x.id), ['gtceu:titanium_44_dust', 'gtceu:tungsten_plate']);
  assert.deepEqual(cap.itemsOut, [{ id: 'grindless:ti44_core', count: 1 }]);
  assert.deepEqual(dec.itemsIn, [{ id: 'grindless:spent_ti44_core', count: 1 }]);
  assert.deepEqual(dec.itemsOut.map((x) => x.id), ['gtceu:calcium_dust', 'gtceu:small_tungsten_dust']);
  const prof = table('j0437.json').types.xray_pulse_profiling.recipes;
  const map = prof.find((r) => r.name === 'ti44_map');
  assert.equal(map.circuit, 3);
  assert.equal(new Set(prof.map((r) => r.circuit)).size, prof.length, 'profiler circuits are distinct');
  assert.deepEqual(map.itemsIn.map((x) => [x.id, x.count]), [['grindless:ejecta_knot_dust', 4], ['gtceu:data_orb', 1]]);
  assert.deepEqual(map.itemsOut, [{ id: 'grindless:ti44_map', count: 1 }]);
  const casc = kube('server_scripts', 'grindless', 'ev', 'extraction_cascade.js');
  assert.match(casc, /name: 'ejecta_knot_titanium', mode: 'uxv', circuit: 22/);
  assert.equal((casc.match(/circuit: 22\b/g) || []).length, 1, 'cascade circuit 22 is taken once');
  assert.match(casc, /ejecta_ti_fraction_dust[\s\S]*wollastonite_dust[\s\S]*pyrite_dust/);
});

test('"only from": nothing else in the pack makes these ids', () => {
  const only = {
    'grindless:ejecta_knot_dust': 'ejecta_sweeping/sweep_ejecta_knots', 'grindless:gamma_laser_module': 'annihilation_lasing/stimulate_gamma_emission',
    'grindless:moderated_ps_cell': 'annihilation_lasing/moderate_positronium', 'grindless:ti44_core': 'ti44_core_capsule',
    'grindless:spent_ti44_core': 'annihilation_lasing/moderate_positronium', 'grindless:positron_stack': 'antimatter_storage/positron_stack',
    'grindless:ti44_map': 'xray_pulse_profiling/ti44_map', 'gtceu:titanium_44_dust': 'calutron_separation/titanium_44',
    'grindless:ejecta_ti_fraction_dust': 'ev/ejecta_knot_titanium', 'grindless:uxv_emitter': 'assembly_line/uxv_emitter',
    'gtceu:ejecta_knot_sweeper': 'assembly_line/ejecta_knot_sweeper', 'gtceu:annihilation_laser_works': 'assembly_line/annihilation_laser_works'
  };
  for (const [id, tail] of Object.entries(only)) {
    const ps = producers(id);
    assert.ok(ps.length >= 1, `${id} has a producer`);
    assert.ok(ps.every((r) => r.i.endsWith(tail)), `${id} only from ${tail}: ${ps.map((r) => r.i)}`);
  }
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
});

test('lang parity: every key of both languages, names, tooltips, items, EMI pages and recipe lines; sound and EMI files', () => {
  const keys = ['gtceu.ejecta_sweeping', 'gtceu.annihilation_lasing'];
  for (const m of MACHINES) {
    keys.push(`block.gtceu.${m}`, `grindless.machine.${m}.tooltip.0`, `grindless.machine.${m}.tooltip.1`, `grindless.machine.${m}.tooltip.2`, `emi.grindless.info.${m}.0`, `emi.grindless.info.${m}.1`);
    assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'emi', 'recipe', 'additions', 'grindless', `uxv_cas_a_${m}.json`)), `${m} EMI info file`);
    assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'block', 'multiblock', m, 'overlay_front_active.png')), `${m} texture`);
  }
  for (const i of ['moderated_ps_cell', 'spent_ti44_core', 'ejecta_ti_fraction_dust']) keys.push(`item.grindless.${i}`, `tooltip.grindless.${i}.0`, `tooltip.grindless.${i}.1`);
  for (const r of CA.recipes) keys.push(`gtceu.recipe.${r.dataKey}.${r.name}`);
  keys.push('gtceu.recipe.grindless_antimatter_storage.positron_stack', 'gtceu.recipe.grindless_calutron_separation.titanium_44', 'gtceu.recipe.grindless_hot_cell.ti44_core_capsule',
    'gtceu.recipe.grindless_hot_cell.ti44_core_decay', 'gtceu.recipe.grindless_xray_pulse_profiling.ti44_map');
  for (const k of keys) for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][k], `${lang} has ${k}`);
  const re = /ejecta|annihilation|ti44|moderated_ps|titanium_44|positron_stack/;
  assert.deepEqual(Object.keys(run.lang.en_us).filter((k) => re.test(k)).sort(), Object.keys(run.lang.es_es).filter((k) => re.test(k)).sort());
  const sounds = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'assets', 'sounds.json'), 'utf8')).sounds || [];
  const wiring = kube('startup_scripts', 'grindless', 'sounds.js');
  for (const [type, loop] of [['ejecta_sweeping', 'ejecta_knot_sweeper'], ['annihilation_lasing', 'annihilation_laser_works']]) {
    assert.ok(wiring.includes(`'gtceu:${type}': 'loop_${loop}'`), `${type} wired`);
    if (sounds.length > 0) assert.ok(sounds.some((s) => s.id === `loop_${loop}` && s.recipeType === `gtceu:${type}` && s.loop === true), `${loop} row`);
  }
});
