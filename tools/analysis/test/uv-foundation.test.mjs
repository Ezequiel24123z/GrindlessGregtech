// UV foundation (package UV-F1, startup_scripts/grindless/uv/foundation.js): every shared UV id of docs/eras/uv.md's F1 list is registered
// once, as the design writes it (the other UV packages use these ids), named in en_us and es_es with two tooltip lines, and drawn. GTM's own
// materials, wireless hatches and covers, planets, orbits, dimensions and station items are not registered here.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const assets = path.join(pack, 'kubejs', 'assets', 'grindless');

const ITEMS = [
  'thorium_oxide_fuel_assembly', 'thorium_nitride_fuel_assembly', 'spent_thorium_oxide_fuel', 'spent_thorium_nitride_fuel',
  'curium_244_pellet', 'gphs_module', 'carbon_carbon_aeroshell', 'pb11_capsule', 'd_he3_capsule', 'srf_cryomodule',
  'antiproton_cartridge', 'fibre_laser_module', 'ytterbium_fibre', 'ingaas_pump_module', 'hpge_crystal', 'snspd_array', 'hbn_dust',
  'bnnt_yarn', 'ented_powder', 'neutronium_am_powder', 'darmstadtium_am_powder', 'tritanium_am_powder', 'light_sail', 'starchip',
  'sailcraft', 'starshot_probe', 'triton_ice_core', 'sputnik_ice_core', 'charon_core', 'planetesimal_sample', 'heliopause_data',
  'proxima_approach_data', 'sgr_a_star_image', 'uv_smes_cell',
].map((n) => 'grindless:' + n);
const BLOCKS = ['laser_module_block', 'srf_cryomodule_block', 'bnnt_fuel_tank'].map((n) => 'grindless:' + n);
const MATERIALS = {
  ytterbium: 'ingot', uranium_233: 'ingot', arsine: 'gas', thorium_nitride: 'dust', nitrogen_15: 'gas', nitrogen_15_oxide: 'gas',
  boron_11_trifluoride: 'gas', boron_10_trifluoride: 'gas', decaborane: 'liquid', neptune_helium: 'gas', neptune_hydrogen: 'gas',
  triton_nitrogen: 'gas', kuiper_noble_gas: 'gas', superfluid_helium: 'liquid', helium_3_concentrate: 'gas',
  liquid_deuterium_tritium: 'liquid',
};
// GTM's own, or owned by a later package or by B1: F1 must not register them
const NOT_F1 = [
  'grindless:neutronium', 'grindless:gravi_star', 'grindless:quantum_star', 'grindless:americium', 'grindless:plutonium_241',
  'grindless:uhpic_chip', 'grindless:uv_machine_casing', 'grindless:uv_machine_hull', 'grindless:uv_wireless_energy_cover',
  'grindless:uv_wireless_dynamo_cover', 'grindless:neptune', 'grindless:pluto', 'grindless:neptune_orbit', 'grindless:pluto_orbit',
  'grindless:thruster_pod', 'grindless:probe_rtg', 'grindless:penetrator_probe', 'grindless:ion_thruster',
];
// words the design uses where the id differs
const DESIGN_ALIAS = {
  curium_244_pellet: 'cm-244 pellet', d_he3_capsule: 'd–he-3 capsule', hbn_dust: 'hbn dust', liquid_deuterium_tritium: 'liquid d–t',
  nitrogen_15: 'nitrogen-15', nitrogen_15_oxide: 'nitrogen-15 oxide', boron_11_trifluoride: 'boron-11 trifluoride',
  boron_10_trifluoride: 'boron-10 trifluoride', uranium_233: 'uranium-233', neutronium_am_powder: '_am_powder',
  darmstadtium_am_powder: '_am_powder', tritanium_am_powder: '_am_powder', laser_module_block: 'laser module block',
  srf_cryomodule_block: 'srf cryomodule', spent_thorium_oxide_fuel: 'spent thorium oxide fuel',
  spent_thorium_nitride_fuel: 'spent thorium nitride fuel',
};
const SPIKE = /(^|_)(planet|orbit|dimension|station|wireless)(_|$)/;

const run = runPackScripts(pack);
const short = (id) => id.slice(id.indexOf(':') + 1);
const ours = (f) => /(^|[\\/])uv[\\/]foundation\.js$/.test(String(f));

test('the stand-in runs the UV foundation without errors', () => {
  const errs = run.errors.filter((e) => /(^|[\\/])uv[\\/]foundation/.test(String(e.file)) && e.stage !== 'console.error');
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
});

test('every shared UV id is registered once, is an id of docs/eras/uv.md, and nothing of GTM, a later package or B1', () => {
  const design = fs.readFileSync(path.join(root, 'docs', 'eras', 'uv.md'), 'utf8').toLowerCase();
  for (const id of [...ITEMS, ...BLOCKS]) {
    assert.ok(run.registry.items.has(id), `${id} not registered`);
    assert.match(run.registry.items.get(id).file, /(^|[\\/])uv[\\/]foundation\.js$/, id);
  }
  for (const [name, form] of Object.entries(MATERIALS)) {
    const mat = run.registry.materials.get(name) || run.registry.materials.get('gtceu:' + name);
    assert.ok(mat && ours(mat.file), `gtceu:${name} is not a GT material of foundation.js`);
    assert.ok(mat.forms.has(form), `gtceu:${name} lacks the ${form} form`);
    if (form === 'gas' || form === 'liquid') assert.ok(run.registry.fluids.has('gtceu:' + name), `gtceu:${name} fluid not registered`);
  }
  assert.ok(![...run.registry.fluids.keys()].some((id) => id.startsWith('grindless:') && ours(run.registry.fluids.get(id).file)), 'no KubeJS fluids');
  const named = [...ITEMS, ...BLOCKS].map(short).concat(Object.keys(MATERIALS));
  for (const n of named) {
    const spaced = n.replace(/_/g, ' ');
    assert.ok(design.includes(n) || design.includes(spaced) || (DESIGN_ALIAS[n] && design.includes(DESIGN_ALIAS[n])), `${n} is not named in docs/eras/uv.md`);
  }
  for (const id of NOT_F1) {
    const it = run.registry.items.get(id);
    assert.ok(!it || !ours(it.file), `${id} is GTM's or belongs to a later package`);
  }
  for (const [id, it] of run.registry.items) if (ours(it.file)) assert.ok(!SPIKE.test(short(id)), `${id} belongs to B1 or the wireless tier`);
  for (const [id, it] of run.registry.items) if (ours(it.file) && !/_(dust|ingot)$/.test(id)) assert.ok(id.startsWith('grindless:'), id);
  // ids registered once: no other script registers one of ours
  for (const id of [...ITEMS, ...BLOCKS]) assert.ok(ours(run.registry.items.get(id).file), `${id} is registered by another script`);
});

test('the id table global.grindless.uvFoundation is published', () => {
  const src = fs.readFileSync(path.join(pack, 'kubejs', 'startup_scripts', 'grindless', 'uv', 'foundation.js'), 'utf8');
  assert.match(src, /G\.uvFoundation/);
  assert.match(src, /UVF\.ids\[key\]/);
});

test('the BNNT fuel tank is a tier 11 gcyr:fuel_tank (S0-1) and ytterbium, uranium_233 and arsine are ours (S0-8)', () => {
  const src = fs.readFileSync(path.join(pack, 'kubejs', 'startup_scripts', 'grindless', 'uv', 'foundation.js'), 'utf8');
  assert.match(src, /id: 'grindless:bnnt_fuel_tank'/);
  assert.match(src, /tier: 11/);
  assert.match(src, /event\.create\(TANK\.id, 'gcyr:fuel_tank'\)/);
  for (const m of ['ytterbium', 'uranium_233', 'arsine']) assert.ok(run.registry.materials.has(m) || run.registry.materials.has('gtceu:' + m), m);
});

test('names and both tooltip lines in en_us and es_es; materials named', () => {
  const problems = [];
  for (const lang of ['en_us', 'es_es']) {
    const L = run.lang[lang] || {};
    for (const id of [...ITEMS, ...BLOCKS]) {
      const kind = ITEMS.includes(id) ? 'item' : 'block';
      for (const k of [`${kind}.grindless.${short(id)}`, `tooltip.grindless.${short(id)}.0`, `tooltip.grindless.${short(id)}.1`]) if (!L[k]) problems.push(`${lang} ${k}`);
    }
    for (const name of Object.keys(MATERIALS)) if (!L[`material.gtceu.${name}`]) problems.push(`${lang} material.gtceu.${name}`);
  }
  assert.deepEqual(problems, []);
  // the Spanish text is a translation, not a copy of the English one (a few names are the same word in both)
  const en = run.lang.en_us; const es = run.lang.es_es;
  for (const id of [...ITEMS, ...BLOCKS]) {
    const k = `${ITEMS.includes(id) ? 'item' : 'block'}.grindless.${short(id)}`;
    assert.notEqual(es[`tooltip.grindless.${short(id)}.1`], en[`tooltip.grindless.${short(id)}.1`], k);
  }
});

test('every item and block has its texture', () => {
  const missing = [];
  for (const id of ITEMS) if (!fs.existsSync(path.join(assets, 'textures', 'item', short(id) + '.png'))) missing.push(id);
  for (const n of ['laser_module_block', 'srf_cryomodule_block', 'bnnt_fuel_tank_side']) {
    if (!fs.existsSync(path.join(assets, 'textures', 'block', 'uv', n + '.png'))) missing.push(n);
  }
  assert.deepEqual(missing, []);
});
