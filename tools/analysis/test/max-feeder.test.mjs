// MAX-E1 (accretion feeder): the stand-in run of max/feeder.js, c1 and c2, the controller line, the casing recipe, the older-machine rows of
// L25, L26 and L42, lang parity, textures, the shape and the overlay.
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
const MF = run.global.grindless.maxFeeder;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const VA_MAX = 2013265920;
const VH_MAX = 1073741824;

// the older rows of the package, by recipe id
const OLDER = [
  'spark_plasma_sintering/slag_pellet', 'solar_vaporisation/devolatilised_slag', 'regolith_processing/ev/slag_reduction',
  'diamond_cvd/collector_diamond_plate', 'ion_implantation/pin_diamond_plate', 'betavoltaic/diamond_photocell',
  'mtj_sputtering/metallised_photocell', 'space_photovoltaics/xuv_collector_panel', 'pgm_refining/opv/iridium_sponge',
  'pgm_refining/opv/wolter_iridium_recovery', 'electron_beam_refining/iridium_target', 'chemical_vapour_infiltration/sic_grazing_shell',
  'mtj_sputtering/iridium_coated_shell'
];

test('the stand-in runs the script without errors, skips nothing and the controller line exists', () => {
  const mine = run.errors.filter((e) => /max[\\/]feeder/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MF.skipped), []);
  assert.ok(MF.controllerRecipe);
  assert.ok(find('grindless:assembly_line/accretion_feeder'));
});

test('c1 and c2 are generator rows at most VA[MAX] in the Sgr A* orbit; c1 gives 2^30 EU/t for 2,400 ticks', () => {
  const c1 = find('grindless:accretion_power/slag_pellet_burn');
  const c2 = find('grindless:accretion_power/panel_rework');
  assert.ok(c1 && c2);
  for (const r of [c1, c2]) {
    const s = JSON.stringify(r.j);
    const m = s.match(/"tickOutputs":\{"eu":\[\{"content":(\d+)/);
    assert.ok(m && !/"tickInputs":\{"eu":\[\{/.test(s), `${r.i} is a generator row`);
    assert.ok(Number(m[1]) <= VA_MAX, `${r.i} EU/t out`);
    assert.match(s, /black_hole_orbit/);
  }
  const s1 = JSON.stringify(c1.j);
  assert.equal(Number(s1.match(/"tickOutputs":\{"eu":\[\{"content":(\d+)/)[1]), VH_MAX);
  assert.match(s1, /slag_pellet/);
  assert.match(s1, /xuv_collector_panel/);
  assert.match(s1, /wolter_mirror_module/);
  assert.match(s1, /spent_collector_panel/);
  assert.match(s1, /spent_wolter_module/);
  assert.match(s1, /"configuration":1\b/);
  assert.match(JSON.stringify(c2.j), /pin_diamond_plate/);
});

test('the GTM rows (compressor, Wolter module, casing) exist, are at most VA[MAX] and the casing uses no feeder output', () => {
  for (const id of ['compressor/slag_compact', 'assembly_hall/wolter_mirror_module', 'assembly_hall/feeder_coil_casing']) {
    const r = find(`grindless:${id}`);
    assert.ok(r, id);
    const eut = JSON.stringify(r.j).match(/"EUt":\s*(\d+)/);
    assert.ok(!eut || Number(eut[1]) <= VA_MAX, `${id} EUt`);
  }
  const casing = JSON.stringify(find('grindless:assembly_hall/feeder_coil_casing').j);
  assert.match(casing, /feeder_coil_casing/);
  for (const out of ['slag_pellet', 'xuv_collector_panel', 'wolter_mirror_module', 'spent_collector_panel', 'spent_wolter_module', 'slag_compact']) {
    assert.doesNotMatch(casing, new RegExp(out), `the casing needs no ${out}`);
  }
  assert.ok(new Set(casing.match(/(gtceu|grindless):[a-z_0-9]+/g)).size >= 6);
});

test('the controller recipe is an assembly line with MAX circuits, a hull and at least 8 MAX components of 3 families', () => {
  const s = JSON.stringify(find('grindless:assembly_line/accretion_feeder').j);
  assert.match(s, /max_machine_hull/);
  assert.match(s, /circuits\/max/);
  for (const f of ['max_field_generator', 'max_emitter', 'max_sensor']) assert.match(s, new RegExp(f));
  assert.ok(Number((s.match(/"EUt":\s*(\d+)/) || [0, 0])[1]) <= VA_MAX);
});

test('the older rows of L25, L26 and L42 exist and are at most VA[MAX]', () => {
  for (const id of OLDER) {
    const r = find(`grindless:${id}`);
    assert.ok(r, id);
    const eut = JSON.stringify(r.j).match(/"EUt":\s*(\d+)/);
    assert.ok(!eut || Number(eut[1]) <= VA_MAX, `${id} EUt`);
  }
});

test('the shape, textures and EMI pages exist', () => {
  const s = read(kube, 'startup_scripts', 'grindless', 'max', 'feeder.js');
  assert.match(s, /accretion_feeder/);
  assert.match(s, /accretion_power/);
  assert.match(s, /generators\.configure/);
  assert.match(s, /energy_output/);
  assert.equal(MF.machines[0].spec.slices.length, 15);
  const dir = path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', 'accretion_feeder');
  for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) assert.ok(fs.existsSync(path.join(dir, f)), f);
  const emi = path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless');
  assert.ok(fs.existsSync(path.join(emi, 'max_feeder_accretion_feeder.json')));
  assert.ok(fs.existsSync(path.join(emi, 'max_feeder_feeder_coil_casing.json')));
});

test('the lang file has en_us and es_es keys in parity, for the machine, the EMI pages and every recipe line', () => {
  const s = read(kube, 'client_scripts', 'grindless', 'max_feeder_lang.js');
  assert.ok(/en_us/.test(s) && /es_es/.test(s));
  for (const k of ['block.gtceu.accretion_feeder', 'gtceu.accretion_power', 'grindless.machine.accretion_feeder.tooltip.0',
    'emi.grindless.info.accretion_feeder.0', 'emi.grindless.info.accretion_feeder.1', 'emi.grindless.info.feeder_coil_casing.0',
    'gtceu.recipe.grindless_accretion_power.slag_pellet_burn', 'gtceu.recipe.grindless_accretion_power.panel_rework']) {
    assert.ok(s.includes(`'${k}'`), k);
  }
  const keys = [...s.matchAll(/^\s+\['([^']+)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)'\]/gm)];
  assert.ok(keys.length >= 15);
  for (const k of keys) assert.ok(k[2].length > 0 && k[3].length > 0, k[1]);
});

test('the overlay stays in its band, has no second priority line and is registered in zones.json', () => {
  const o = read(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_max_feeder.js');
  assert.doesNotMatch(o.replace(/^\/\/ priority: -?\d+\r?\n/, ''), /^\/\/ priority:/m);
  assert.match(o, /X0 = 40280/);
  assert.match(o, /X1 = 40343/);
  assert.match(o, /gg_test_max_feeder/);
  new Function(o.replace(/^\(function/m, 'return (function'));
  const z = JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const rows = Array.isArray(z) ? z : z.zones || Object.values(z).find(Array.isArray);
  const mine = rows.find((r) => r.id === 'max_feeder');
  assert.ok(mine);
  assert.deepEqual(mine.x, [40280, 40343]);
});
