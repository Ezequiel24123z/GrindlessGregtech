// UEV-A7 (docs/eras/uev.md, machines 14-15, lines 23-25): the fusion table, the polariser, the Mk4 ring and the older rows, checked without
// Minecraft by static lookup. T1 (gg_test_uev_fusion) proves the ring forms, starts and runs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const T = JSON.parse(fs.readFileSync(path.join(tables, 'fusion_mk4.json'), 'utf8'));
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const rows = (type) => T.types[type].recipes;
const by = (rs, name) => {
  const r = rs.find((x) => x.name === name);
  assert.ok(r, name);
  return r;
};

test('the three Mk4 rows are premixed: one fluid in, plasma out, under the tier-10 voltage', () => {
  const fuels = ['gtceu:dhe3_fuel_mix', 'gtceu:pb11_fuel', 'gtceu:polarised_dhe3_fuel'];
  const rs = rows('fusion_reactor');
  assert.equal(rs.length, 3);
  rs.forEach((r, i) => {
    assert.deepEqual(ids(r.fluidsIn), [fuels[i]]);
    assert.equal(r.itemsIn.length, 0);
    assert.ok(r.eut < 8388608);
    assert.ok(r.start >= 1e9);
    assert.ok(r.start <= 16 * 160000000, 'a start above 16 hatches x 160,000,000 EU never fits the tier-10 buffer');
  });
  assert.ok(by(rs, 'uev_pb11').start > 2 ** 31, 'c2 starts above the int maximum');
});

test('the Mk4 casing is assembled from the Mk3 casing and UEV-A5 composites; the ring caps energy hatches at 16 and uses the HfTaCN coil', () => {
  const c = T.casing;
  assert.equal(c.output, 'grindless:uev_fusion_casing');
  assert.deepEqual(c.itemsIn.map((x) => x.id), ['gtceu:fusion_casing_mk3', 'grindless:wf_w_tile', 'grindless:sic_sic_plate']);
  const startup = read('startup_scripts', 'grindless', 'uev', 'fusion.js');
  assert.ok(startup.includes("Pat.part('energy_input', { min: 1, max: 16 })"));
  assert.ok(startup.includes("Pat.block('grindless:hftacn_coil_block')"));
});

test('the converter returns 16,777,216, 12,582,912 and 25,165,824 EU/t at 128 parallels', () => {
  const c = T.converter;
  assert.equal(c.parallels, 128);
  const want = { uev_dhe3_plasma: 16777216, uev_pb11_plasma: 12582912, uev_polarised_plasma: 25165824 };
  for (const [name, total] of Object.entries(want)) {
    const r = by(c.recipes, name);
    assert.equal(r.eut * 128, total);
    assert.equal(r.total, total);
  }
  const zpm = read('server_scripts', 'grindless', 'zpm', 'fusion.js');
  assert.match(zpm, /function addMk4Converter/);
  assert.match(zpm, /direct_conversion\('grindless:' \+ r\.name\)/);
});

test('polarised He-3 and its fuel come only from the polariser', () => {
  const producers = [];
  for (const [type, t] of Object.entries(T.types)) {
    for (const r of t.recipes) {
      if (ids(r.fluidsOut).includes('gtceu:polarised_helium_3') || ids(r.fluidsOut).includes('gtceu:polarised_dhe3_fuel')) producers.push(type);
    }
  }
  assert.deepEqual([...new Set(producers)], ['spin_polarisation']);
  for (const f of fs.readdirSync(tables).filter((n) => n.endsWith('.json') && n !== 'fusion_mk4.json' && n !== 'mk5.json' && n !== 'hidden_until.json')) { // UIV-A9: mk5.json reads polarised He-3 (its input only; the producer check above still covers it)
    const txt = fs.readFileSync(path.join(tables, f), 'utf8');
    assert.ok(!/polarised_(helium_3|dhe3_fuel)/.test(txt), f);
  }
  rows('spin_polarisation').forEach((r) => assert.deepEqual(r.notConsumed, ['grindless:laser_1083nm']));
});

test('line 25: borax to boron-11 fuel, circuits unique per type', () => {
  const chem = rows('chemical_reactor');
  assert.deepEqual(chem.map((r) => r.circuit), [24, 25, 26, 27]);
  assert.ok(ids(by(chem, 'boron_11_powder').fluidsIn).includes('gtceu:boron_11_trifluoride'));
  assert.ok(ids(by(rows('mixer'), 'pb11_fuel').itemsIn).includes('grindless:boron_11_powder'));
  const sat = read('server_scripts', 'grindless', 'zpm', 'saturn_siphon.js');
  assert.match(sat, /name: 'boron_11_trifluoride', type: 'cryogenic_isotope_separation', circuit: 20/);
});

test('the older rows exist and are only added', () => {
  const cryo = read('server_scripts', 'grindless', 'ev', 'cryogenic_plant.js');
  assert.match(cryo, /grindless:cryogenic_processing\/helium_3_6n/);
  assert.match(cryo, /grindless:cryogenic_processing\/helium_4_ash/);
  const ph = read('server_scripts', 'grindless', 'uv', 'photonics.js');
  assert.match(ph, /name: 'laser_1083nm', type: 'fibre_draw', circuit: 5/);
});

test('GTM fusion rings are untouched and the DEC rows are not in the x2 list', () => {
  for (const f of ['uev/fusion.js']) {
    const txt = read('server_scripts', 'grindless', f);
    assert.ok(!/removeRecipe|\.remove\(/.test(txt), f);
    assert.ok(!/gtceu:(luv|zpm|uv)_fusion_reactor/.test(txt), f);
  }
  const gen = read('server_scripts', 'grindless', 'power', 'generators.js');
  assert.ok(!/direct_conversion|direct_energy_converter/.test(gen));
  assert.ok(!/uev_(dhe3|pb11|polarised)/.test(gen));
});

test('every id the server script uses is registered or published here', () => {
  const startup = read('startup_scripts', 'grindless', 'uev', 'fusion.js');
  for (const m of ['helium3_polariser', 'uev_fusion_reactor', 'spin_polarisation', 'registerFusionTier']) assert.ok(startup.includes(m), m);
  for (const m of ['helium_3_6n', 'polarised_helium_3', 'helium_4_ash', 'uev_dhe3_plasma', 'uev_pb11_plasma', 'uev_polarised_plasma', 'boron_trifluoride']) {
    assert.ok(startup.includes(m), m);
  }
});
