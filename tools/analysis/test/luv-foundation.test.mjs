// LuV foundation (package LuV-A1, startup_scripts/grindless/luv/foundation.js): every shared LuV id of docs/eras/luv.md is registered
// exactly as the design writes it (the other LuV packages use these ids), named in en_us and es_es, drawn, hidden from EMI until the
// package that gives it a route lands (hidden_until.json and tools/analysis/tiers/obtain.json agree), and the sunlight table keeps the
// as-built factors of the EV and IV solar machines.
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
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

// the ids of docs/eras/luv.md that A1 registers (the design's names; other packages reference them verbatim)
const ITEMS = [
  'nickel_tungsten_tape', 'itbtc_coated_conductor', 'engineered_barley_seed', 'engineered_tobacco_seed', 'asteroid_quantum_seed',
  'ionian_quantum_seed', 'europan_quantum_seed', 'ganymedean_quantum_seed', 'triple_junction_wafer', 'triple_junction_cell',
  'neurotrophic_factor', 'neural_organoid', 'hss_s_drill_bit', 'anchor_harpoon', 'asteroid_pgm_concentrate', 'capture_bag',
  'chondritic_extract', 'ionian_sublimate', 'heat_exchanger_bundle', 'tether_spool', 'cryobot_probe', 'melt_head', 'europan_ocean_sample',
  'jupiter_entry_probe', 'saturn_flyby_probe', 'jovian_atmosphere_survey', 'saturn_transfer_chart', 'gravitational_wave_catalogue',
].map((n) => 'grindless:' + n);
const BLOCKS = [
  'station_truss_casing', 'radiation_vault_casing', 'whipple_shield_casing', 'asteroid_regolith_casing', 'sulfur_concrete_casing',
  'orbital_solar_panel', 'magnetic_bearing', 'coilgun_coil_casing', 'sapphire_test_mass',
].map((n) => 'grindless:' + n);
const MATERIALS = { meteoric_iron: ['dust', 'ore'], tetrataenite: ['ingot', 'ore'], zblan: ['dust'], europan_brine: ['liquid'] };
// what the design keeps for later packages: A1 must not register them
const NOT_A1 = ['grindless:luv_smes_cell', 'grindless:luv_wireless_energy_cover', 'grindless:luv_wireless_dynamo_cover', 'grindless:cryogenic_fuel_tank'];

const run = runPackScripts(pack);
const short = (id) => id.slice(id.indexOf(':') + 1);

test('the stand-in runs the LuV foundation without errors', () => {
  const ours = run.errors.filter((e) => /luv/.test(String(e.file)) && e.stage !== 'console.error');
  assert.deepEqual(ours, [], ours.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
});

test('every shared LuV id of the design is registered with the design\'s name, and nothing of the later packages', () => {
  const missing = [...ITEMS, ...BLOCKS].filter((id) => !run.registry.items.has(id));
  assert.deepEqual(missing, []);
  for (const id of [...ITEMS, ...BLOCKS]) assert.match(run.registry.items.get(id).file, /luv[\\/]foundation\.js$/, id);
  const design = fs.readFileSync(path.join(root, 'docs', 'eras', 'luv.md'), 'utf8');
  for (const id of [...ITEMS, ...BLOCKS]) {
    if (id === 'grindless:station_truss_casing' || id === 'grindless:asteroid_regolith_casing') continue; // named in words only
    assert.ok(design.includes('`' + id + '`'), `${id} is not an id of docs/eras/luv.md`);
  }
  for (const id of NOT_A1) assert.ok(!run.registry.items.has(id), `${id} belongs to a later package`);
  for (const [m, forms] of Object.entries(MATERIALS)) {
    const mat = run.registry.materials.get(m) || run.registry.materials.get('gtceu:' + m);
    assert.ok(mat, `material ${m}`);
    for (const f of forms) assert.ok(mat.forms.has(f), `${m} has ${f}`);
  }
  assert.ok(run.registry.fluids.has('gtceu:europan_brine'));
  assert.ok(run.registry.items.has('gtceu:raw_meteoric_iron') && run.registry.items.has('gtceu:raw_tetrataenite'));
  for (const id of ['gtceu:tetrataenite_ingot', 'gtceu:tetrataenite_dust', 'gtceu:meteoric_iron_dust', 'gtceu:zblan_dust']) assert.ok(run.registry.items.has(id), id);
});

test('names and both tooltip lines in en_us and es_es; materials named', () => {
  const problems = [];
  for (const lang of ['en_us', 'es_es']) {
    const L = run.lang[lang] || {};
    for (const id of ITEMS) for (const k of [`item.grindless.${short(id)}`, `tooltip.grindless.${short(id)}.0`, `tooltip.grindless.${short(id)}.1`]) if (!L[k]) problems.push(`${lang} ${k}`);
    for (const id of BLOCKS) for (const k of [`block.grindless.${short(id)}`, `tooltip.grindless.${short(id)}.0`, `tooltip.grindless.${short(id)}.1`]) if (!L[k]) problems.push(`${lang} ${k}`);
    for (const m of Object.keys(MATERIALS)) if (!L[`material.gtceu.${m}`]) problems.push(`${lang} material.gtceu.${m}`);
  }
  assert.deepEqual(problems, []);
});

test('every item and block has its texture, and the panel its model', () => {
  const missing = [];
  for (const id of ITEMS) if (!fs.existsSync(path.join(assets, 'textures', 'item', short(id) + '.png'))) missing.push(id);
  for (const id of BLOCKS) {
    if (id === 'grindless:orbital_solar_panel') continue;
    if (!fs.existsSync(path.join(assets, 'textures', 'block', 'luv', short(id) + '.png'))) missing.push(id);
  }
  const model = path.join(assets, 'models', 'block', 'luv', 'orbital_solar_panel.json');
  assert.ok(fs.existsSync(model), 'models/block/luv/orbital_solar_panel.json');
  for (const t of Object.values(JSON.parse(fs.readFileSync(model, 'utf8')).textures)) {
    const [ns, p] = t.split(':');
    if (!fs.existsSync(path.join(pack, 'kubejs', 'assets', ns, 'textures', ...p.split('/')) + '.png')) missing.push(t);
  }
  assert.deepEqual(missing, []);
});

test('the forms LuV needs of existing GT materials: germanium plate and dense titanium plate, by materialModification, not hidden', () => {
  const src = fs.readFileSync(path.join(pack, 'kubejs', 'startup_scripts', 'grindless', 'luv', 'foundation.js'), 'utf8');
  const body = src.slice(src.indexOf('GTCEuStartupEvents.materialModification'));
  assert.match(body, /germanium: \[GTMaterialFlags\.GENERATE_PLATE\]/);
  assert.match(body, /titanium: \[GTMaterialFlags\.GENERATE_DENSE\]/);
  assert.match(body, /material\.addFlags\(flag\)/);
  const hidden = readJson('pack/kubejs/data/grindless/tables/hidden_until.json');
  const ids = new Set(hidden.groups.flatMap((g) => g.items));
  for (const id of ['gtceu:germanium_plate', 'gtceu:dense_titanium_plate', 'gtceu:germanium_ingot', 'gtceu:titanium_plate']) assert.ok(!ids.has(id), `${id} is hidden`);
  assert.ok(!hidden.groups.some((g) => g.material === 'germanium' || g.material === 'titanium'));
});

test('hidden until its package lands: hidden_until.json and the obtain rules list the same A1 groups', () => {
  const hidden = readJson('pack/kubejs/data/grindless/tables/hidden_until.json');
  const rules = readJson('tools/analysis/tiers/obtain.json').obtain.classes.filter((r) => /^LuV-A1 registration/.test(r.reason || ''));
  const ruled = new Map();
  for (const r of rules) {
    assert.equal(r.class, 'B');
    assert.equal(r.until, 'luv');
    for (const m of r.materials) ruled.set(m, r.reason);
  }
  const groups = hidden.groups.filter((g) => /^LuV-A1 registration/.test(g.reason || ''));
  assert.deepEqual(groups.map((g) => g.material).sort(), [...ruled.keys()].sort(), 'one hidden group per material of the A1 rules');
  for (const g of groups) {
    assert.equal(g.until, 'luv', g.material);
    assert.equal(g.reason, ruled.get(g.material), g.material);
  }
  // an A1 id that is not hidden any more must have been given a route by its package (the EMI coverage test checks the route)
  const all = [...ITEMS, ...BLOCKS, ...Object.keys(MATERIALS)];
  const stillHidden = new Set(groups.map((g) => g.material));
  for (const id of [...ruled.keys()]) assert.ok(all.includes(id), `${id}: an A1 rule names something A1 does not register`);
  const brine = groups.find((g) => g.material === 'europan_brine');
  if (brine) assert.deepEqual(brine.fluids, ['gtceu:europan_brine']);
  for (const m of ['meteoric_iron', 'tetrataenite']) {
    const g = groups.find((x) => x.material === m);
    if (g) for (const form of [`gtceu:raw_${m}`, `gtceu:crushed_${m}_ore`, `gtceu:${m}_dust`, `gtceu:tuff_${m}_ore`]) assert.ok(g.items.includes(form), `${m}: ${form}`);
  }
  assert.ok(stillHidden.size <= all.length);
});

test('sunlight.json: the as-built factors equal the machines\' own, and the new airless places follow the 1 AU rule', () => {
  const sun = readJson('pack/kubejs/data/grindless/tables/sunlight.json');
  const d = sun.dimensions;
  const lunar = fs.readFileSync(path.join(pack, 'kubejs', 'startup_scripts', 'grindless', 'ev', 'lunar_power_and_antenna.js'), 'utf8');
  const mercury = fs.readFileSync(path.join(pack, 'kubejs', 'startup_scripts', 'grindless', 'iv', 'mercury.js'), 'utf8');
  const light = (src, dim) => Number(new RegExp(`dimension: '${dim}'[^}]*?light: ([0-9.]+)`).exec(src)[1]);
  assert.equal(d['gcyr:luna'].factor, light(lunar, 'gcyr:luna'));
  assert.equal(d['gcyr:mars'].factor, light(lunar, 'gcyr:mars'));
  assert.equal(d['gcyr:mercury'].factor, Number(/light: ([0-9.]+),\s*euPerPanel: 2010/.exec(mercury)[1]));
  assert.equal(d['minecraft:overworld'].factor, 1.0);
  assert.equal(d['gcyr:venus'].factor, null);
  for (const [dim, row] of Object.entries(d)) {
    assert.ok(['day', 'always', 'never'].includes(row.when), dim);
    assert.ok(['reference', 'as_built', 'new', 'no_solar'].includes(row.status), dim);
    if (row.status !== 'new') continue;
    const rule = sun.rule.referenceAirless * Math.pow(row.distanceAU / sun.rule.atAU, sun.rule.power);
    assert.ok(Math.abs(row.factor - rule) / rule < 0.03, `${dim}: ${row.factor} against the rule's ${rule.toFixed(3)}`);
  }
  assert.equal(d['gcyr:overworld_orbit'].when, 'always', 'orbits are always midnight: sky exposure only');
  for (const dim of ['grindless:asteroid_belt', 'grindless:io', 'grindless:europa', 'grindless:ganymede']) assert.ok(d[dim], dim);
});
