// UIV-A7 (docs/eras/uiv.md, 'A7. Optical mainframe and the UIV sensor'; lines 17, 18 and 22): the optical mainframe line, the chip nuclear clock,
// the pulsar-timed repeater and the UIV sensor. Static checks only (no T1).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const load = (n) => JSON.parse(fs.readFileSync(path.join(tables, n), 'utf8'));
const MF = load('mainframe.json');
const HALL = load('photonics_uev.json');
const PH = load('photonics.json');
const CR = load('crystals.json');
const AC = load('alpha_centauri.json');

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn), ids(r.charge));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const by = (T, type, name) => {
  const r = T.types[type].recipes.find((x) => x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};
const ALL_TABLES = fs.readdirSync(tables).filter((n) => n.endsWith('.json'));
const producers = (id) => {
  const out = [];
  for (const f of ALL_TABLES) {
    const T = load(f);
    for (const [type, t] of Object.entries(T.types || {})) {
      for (const r of t.recipes || []) if (outputs(r).includes(id)) out.push(`${f}:${type}/${r.name}`);
    }
  }
  return out;
};
function scripts(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...scripts(p));
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}

test('assembler rows: names unique, circuit 0, figures, ids', () => {
  const rc = MF.types.assembler.recipes;
  assert.deepEqual(rc.map((r) => r.name), ['crossbar_on_interposer', 'capped_thf4_film', 'uiv_sensor']);
  for (const r of rc) {
    assert.equal(r.circuit, 0, r.name);
    assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
    assert.equal(r.itemsOut.length, 1, r.name);
  }
  assert.deepEqual(inputs(rc[0]), ['grindless:pcm_crossbar', 'grindless:glass_interposer']);
  assert.deepEqual(outputs(rc[0]), ['grindless:crossbar_on_interposer']);
  assert.deepEqual(inputs(rc[1]), ['grindless:thf4_film', 'gtceu:glass_plate']);
  assert.deepEqual(outputs(rc[1]), ['grindless:capped_thf4_film']);
  assert.deepEqual(inputs(rc[2]), ['grindless:uev_sensor', 'grindless:eo_microcomb', 'grindless:chip_nuclear_clock']);
  assert.deepEqual(outputs(rc[2]), ['grindless:uiv_sensor']);
});

test('hall rows: circuits 4-6 after the three UEV rows, within the hall slots (8 items in with the circuit, 2 out, 1 fluid in)', () => {
  const rc = HALL.types.photonic_integration.recipes;
  assert.deepEqual(rc.slice(0, 3).map((r) => r.name), ['waveguide_circuit', 'quantum_photonic_chip', 'optical_computer']);
  assert.deepEqual(rc.slice(3, 6).map((r) => [r.name, r.circuit]), [['photonic_tensor_core', 4], ['optical_mainframe', 5], ['pulsar_timed_repeater', 6]]);
  for (const r of rc.slice(3, 6)) {
    assert.ok(r.itemsIn.length + 1 <= 8 && r.itemsOut.length <= 2, r.name);
    assert.match(r._why, /UIV-A7/, r.name);
  }
  assert.deepEqual(inputs(rc[3]), ['grindless:beuv_driver_asic', 'grindless:quantum_photonic_chip', 'grindless:thin_film_ln_modulator']);
  assert.deepEqual(outputs(rc[3]), ['grindless:photonic_tensor_core']);
  assert.deepEqual(inputs(rc[4]), ['grindless:crossbar_on_interposer', 'grindless:six_hour_memory', 'grindless:p_si_processor', 'grindless:photonic_tensor_core', 'gtnn:optical_assembly']);
  assert.deepEqual(outputs(rc[4]), ['gtnn:optical_mainframe']);
  assert.deepEqual(inputs(rc[5]), ['grindless:eo_transceiver', 'grindless:telecom_memory', 'grindless:pumped_edfa', 'grindless:disciplined_clock_core']);
  assert.deepEqual(outputs(rc[5]), ['grindless:pulsar_timed_repeater']);
});

test('older rows: foundry c13 crossbar, MBE c7 ThF4 film, clock lab c3, pulsar timing c3, marked UIV-A7 and appended last', () => {
  const f = PH.types.photonic_foundry.recipes;
  const x = f[f.findIndex((r) => r.name === 'pcm_crossbar')]; // UIV-A10 appends c14-16 after it
  assert.equal(x.name, 'pcm_crossbar');
  assert.equal(x.circuit, 13);
  assert.equal(f[f.indexOf(x) - 1].circuit, 12);
  assert.match(x._why, /UIV-A7/);
  assert.deepEqual(ids(x.itemsIn), ['grindless:pcm_photonic_die', 'grindless:gst_target']);
  assert.deepEqual(ids(x.itemsOut), ['grindless:pcm_crossbar', 'grindless:spent_gst_target']);
  assert.ok(x.itemsIn.length + 1 <= 6 && x.itemsOut.length <= 3);
  const m = PH.types.molecular_beam_epitaxy.recipes;
  const y = m[m.findIndex((r) => r.name === 'thf4_film')];
  assert.equal(y.name, 'thf4_film');
  assert.equal(y.circuit, 7);
  assert.equal(m[m.indexOf(y) - 1].circuit, 6);
  assert.match(y._why, /UIV-A7/);
  assert.deepEqual(inputs(y), ['gtceu:silicon_wafer', 'grindless:thf4', 'gtceu:liquid_nitrogen']);
  assert.deepEqual(outputs(y), ['grindless:thf4_film', 'gtceu:nitrogen']);
  const c = CR.types.nuclear_clock.recipes;
  assert.deepEqual(c.map((r) => [r.name, r.circuit]), [['comb', 1], ['clock', 2], ['chip_clock', 3]]);
  const k = c[2];
  assert.match(k._why, /UIV-A7/);
  assert.deepEqual(ids(k.itemsIn), ['grindless:capped_thf4_film', '#gtceu:circuits/uhv']);
  assert.deepEqual(ids(k.kept), ['grindless:vuv_frequency_comb']);
  assert.deepEqual(outputs(k), ['grindless:chip_nuclear_clock']);
  const p = AC.types.pulsar_timing.recipes;
  assert.deepEqual(p.map((r) => [r.name, r.circuit]), [['timing_survey', 1], ['pulsar_navigation_chart', 2], ['repeater_discipline', 3]]);
  assert.match(p[2]._why, /UIV-A7/);
  assert.deepEqual(ids(p[2].itemsIn), ['grindless:pulsar_navigation_chart', 'grindless:sdd']);
  assert.deepEqual(ids(p[2].kept), ['grindless:nuclear_clock']);
  assert.deepEqual(outputs(p[2]), ['grindless:disciplined_clock_core']);
  assert.ok(AC.types.pulsar_timing.dimension === true);
});

test('fluorspar kiln: ThF4 from Th-229 in UIV_ROWS, read after UEV_ROWS', () => {
  const k = read('server_scripts', 'grindless', 'iv', 'fluorspar_kiln.js');
  assert.match(k, /var UIV_ROWS = \[\s*\{\s*name: 'thf4_from_thorium_229',\s*itemIn: \{ id: 'grindless:thorium_229', count: 1 \}, fluidIn: \{ id: 'gtceu:hydrofluoric_acid', amount: 4000 \},\s*itemOut: \{ id: 'grindless:thf4', count: 1 \}, fluidOut: \{ id: 'gtceu:hydrogen', amount: 2000 \}/);
  assert.ok(k.indexOf('var UEV_ROWS') < k.indexOf('var UIV_ROWS'));
  assert.match(k, /addUevRows\(event, UIV_ROWS\)/);
});

test('"only from" claims', () => {
  const claims = {
    'gtnn:optical_mainframe': 'photonics_uev.json:photonic_integration/optical_mainframe',
    'grindless:thf4': null,
    'grindless:pcm_crossbar': 'photonics.json:photonic_foundry/pcm_crossbar',
    'grindless:crossbar_on_interposer': 'mainframe.json:assembler/crossbar_on_interposer',
    'grindless:photonic_tensor_core': 'photonics_uev.json:photonic_integration/photonic_tensor_core',
    'grindless:thf4_film': 'photonics.json:molecular_beam_epitaxy/thf4_film',
    'grindless:capped_thf4_film': 'mainframe.json:assembler/capped_thf4_film',
    'grindless:chip_nuclear_clock': 'crystals.json:nuclear_clock/chip_clock',
    'grindless:disciplined_clock_core': 'alpha_centauri.json:pulsar_timing/repeater_discipline',
    'grindless:pulsar_timed_repeater': 'photonics_uev.json:photonic_integration/pulsar_timed_repeater',
    'grindless:uiv_sensor': 'mainframe.json:assembler/uiv_sensor'
  };
  const own = [path.join('uiv', 'mainframe.js'), path.join('iv', 'fluorspar_kiln.js')];
  for (const [id, where] of Object.entries(claims)) {
    assert.deepEqual(producers(id), where === null ? [] : [where], id);
    for (const f of scripts(path.join(kube, 'server_scripts'))) {
      if (own.some((o) => f.endsWith(o))) continue;
      const txt = fs.readFileSync(f, 'utf8');
      assert.ok(!new RegExp(`(?:itemOutputs|outputs?)[^\\n]*${id}`).test(txt), `${path.relative(kube, f)} outputs ${id}`);
    }
  }
  const kiln = read('server_scripts', 'grindless', 'iv', 'fluorspar_kiln.js');
  assert.equal([...kiln.matchAll(/itemOut: \{ id: 'grindless:thf4'/g)].length, 1);
});

test('GT--\'s mainframe recipe is removed by output, the hall row kept by id', () => {
  const s = read('server_scripts', 'grindless', 'uiv', 'mainframe.js');
  assert.match(s, /event\.remove\(\{ output: MAINFRAME, not: \{ id: MAINFRAME_RECIPE \} \}\)/);
  assert.match(s, /MAINFRAME = 'gtnn:optical_mainframe'/);
  assert.match(s, /MAINFRAME_RECIPE = 'grindless:photonic_integration\/optical_mainframe'/);
});

test('no recipe in the table is a subset of another of its type', () => {
  for (const [type, t] of Object.entries(MF.types)) {
    const keys = t.recipes.map((r) => new Set(inputs(r).concat([`circuit:${r.circuit}`])));
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const sub = [...keys[i]].every((k) => keys[j].has(k)) || [...keys[j]].every((k) => keys[i].has(k));
        assert.ok(!sub, `${type}: ${t.recipes[i].name} / ${t.recipes[j].name}`);
      }
    }
  }
});

test('every contract id has a real use (temporary EMI exceptions are for these)', () => {
  const used = new Set();
  for (const r of [...HALL.types.photonic_integration.recipes.slice(3, 6), ...MF.types.assembler.recipes]) inputs(r).forEach((i) => used.add(i));
  for (const id of ['grindless:eo_transceiver', 'grindless:glass_interposer', 'grindless:eo_microcomb', 'grindless:beuv_driver_asic', 'grindless:six_hour_memory',
    'grindless:p_si_processor', 'grindless:telecom_memory', 'grindless:pumped_edfa']) assert.ok(used.has(id), id);
});

test('lang parity: every ITEM and row key has en_us and es_es, every item has a texture', () => {
  const lang = read('client_scripts', 'grindless', 'uiv_mainframe_lang.js');
  const itemNames = [...lang.matchAll(/^\s+\['([a-z0-9_]+)', '[^']+', '[^']+', /gm)].map((m) => m[1]);
  const start = read('startup_scripts', 'grindless', 'uiv', 'mainframe.js');
  const registered = [...start.matchAll(/^\s+([a-z0-9_]+): \{ stack: \d+ \}/gm)].map((m) => m[1]);
  assert.equal(registered.length, 8);
  assert.deepEqual(itemNames.slice().sort(), registered.slice().sort());
  const flat = [...lang.matchAll(/^\s+\['((?:gtceu|emi)\.[^']+)',\s*$/gm)].map((m) => m[1]);
  const want = [
    'gtceu.recipe.grindless_photonic_integration.photonic_tensor_core', 'gtceu.recipe.grindless_photonic_integration.optical_mainframe',
    'gtceu.recipe.grindless_photonic_integration.pulsar_timed_repeater', 'gtceu.recipe.grindless_photonic_foundry.pcm_crossbar',
    'gtceu.recipe.grindless_molecular_beam_epitaxy.thf4_film', 'gtceu.recipe.grindless_nuclear_clock.chip_clock',
    'gtceu.recipe.grindless_pulsar_timing.repeater_discipline', 'gtceu.recipe.grindless_fluorspar_kiln.thf4_from_thorium_229',
    'emi.grindless.info.uiv_mainframe.0', 'emi.grindless.info.uiv_mainframe.1'
  ];
  for (const k of want) assert.ok(flat.includes(k), k);
  const entryBlock = lang.slice(0, lang.indexOf('var ITEMS'));
  assert.equal((entryBlock.match(/^\s+\['(?:gtceu|emi)\./gm) || []).length, want.length);
  for (const n of registered) {
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), n);
    assert.match(lang, new RegExp(`'${n}', '[^']+', '[^']+', '[^']+', '[^']+', '[^']+', '[^']+'\\]`), n);
  }
  assert.ok(fs.existsSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'uiv_mainframe_line.json')));
});
