// LuV-C1 (2026-10-26): the validator's -Tier luv. Dimension ids from the pack's tables (lib/places.mjs), packages that land one at a
// time (lib/packages.mjs), a machine's recipe denylist (exceptRecipes), the fusion reactor's start cap (eu_to_start) and the real
// tiers/luv.json: its substages, its packages and its site rules.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultTablesDir, loadTierConfig } from '../lib/config.mjs';
import { readPlaceTables, resolvePlaceTokens } from '../lib/places.mjs';
import { applyPackages } from '../lib/packages.mjs';
import { gi, gt, mkDump, run, verdicts } from './helpers.mjs';

const TIERS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'tiers');
const TABLES = {
  orbits: { earth: 't:earth_orbit', dimensions: ['t:earth_orbit', 't:io_orbit'] },
  places: { surfaces: { io: 't:io', europa: 't:europa' } },
};

// ------------------------------------------------------------------ place tokens

test('places: tokens take the ids from orbits.json and places.json; ${orbits} and ${places} expand inside arrays', () => {
  const raw = {
    a: 'dim:${orbit:earth}', b: ['x', '${orbits}', '${places}'], c: { d: '${place:io}', e: ['${orbit:io}'] }, n: 3,
  };
  assert.deepEqual(resolvePlaceTokens(raw, TABLES), {
    a: 'dim:t:earth_orbit', b: ['x', 't:earth_orbit', 't:io_orbit', 't:io', 't:europa'], c: { d: 't:io', e: ['t:io_orbit'] }, n: 3,
  });
  assert.throws(() => resolvePlaceTokens({ a: '${place:ganymede}' }, TABLES), /ganymede isn't a surface in places\.json/);
  assert.throws(() => resolvePlaceTokens({ a: '${orbit:europa}' }, TABLES), /t:europa_orbit isn't in orbits\.json/);
  assert.throws(() => resolvePlaceTokens({ a: '${orbits}' }, TABLES), /only works as an array element/);
  assert.throws(() => resolvePlaceTokens({ a: '${moon:x}' }, TABLES), /unknown token \$\{moon:x\}/);
  assert.throws(() => resolvePlaceTokens({ a: '${orbit:earth}' }, { orbits: { earth: 'x', dimensions: ['y'] }, places: TABLES.places }), /orbits\.json needs/);
  // a config with no token never reads the tables
  const plain = { a: 'gcyr:luna' };
  assert.equal(resolvePlaceTokens(plain, () => { throw new Error('read'); }), plain);
});

test('places: an orbit falls back to grindless:<name>_orbit when the surface belongs to another namespace (proxima_b)', () => {
  const t = {
    orbits: { earth: 'gcyr:overworld_orbit', dimensions: ['gcyr:overworld_orbit', 'grindless:proxima_b_orbit'] },
    places: { surfaces: { proxima_b: 'gcyr:proxima_centauri_b', io: 'grindless:io' } },
  };
  assert.deepEqual(resolvePlaceTokens({ a: ['${orbit:proxima_b}', '${place:proxima_b}'] }, t), { a: ['grindless:proxima_b_orbit', 'gcyr:proxima_centauri_b'] });
  assert.throws(() => resolvePlaceTokens({ a: '${orbit:io}' }, t), /grindless:io_orbit isn't in orbits\.json/);
  const real = readPlaceTables(defaultTablesDir(TIERS));
  assert.deepEqual(resolvePlaceTokens({ a: '${orbit:proxima_b}' }, real), { a: 'grindless:proxima_b_orbit' });
});

test('places: loadTierConfig resolves the tokens after inheritance, from the given tables or the pack\'s', () => {
  const files = {
    [path.resolve('/m/tiers/base.json')]: { tier: 'base', conditions: { dimension: { asKeysFor: ['${orbits}'] } } },
    [path.resolve('/m/tiers/child.json')]: { tier: 'child', extends: 'base', targets: [{ id: 'trip', item: 'dim:${place:io}' }] },
  };
  const io = { exists: (f) => !!files[path.resolve(f)], read: (f) => structuredClone(files[path.resolve(f)]) };
  const { raw } = loadTierConfig({ tier: 'child', tables: TABLES }, path.resolve('/m/tiers'), io);
  assert.deepEqual(raw.conditions.dimension.asKeysFor, ['t:earth_orbit', 't:io_orbit']);
  assert.equal(raw.targets[0].item, 'dim:t:io');
  // the pack's own tables, read as startup_scripts/grindless/lib/orbits.js and places.js read them
  const real = readPlaceTables(defaultTablesDir(TIERS));
  const orbits = JSON.parse(fs.readFileSync(path.join(defaultTablesDir(TIERS), 'orbits.json'), 'utf8'));
  assert.equal(real.orbits.earth, orbits.earth);
  assert.ok(Object.keys(real.places.surfaces).length >= 4);
});

// ------------------------------------------------------------------ packages

function packPack({ landed = false, extra = [] } = {}) {
  const recipes = [
    gt('t:old', 't:press', { ins: [gi('t:sand')], outs: [gi('t:glass')] }),
    ...(landed ? [gt('t:new_recipe', 't:press', { ins: [gi('t:glass')], outs: [gi('t:new_out')] })] : []),
    ...extra,
  ];
  const items = ['t:sand', 't:press_m', ...(landed ? ['t:new_machine'] : [])];
  return mkDump({ recipes, items, machines: [{ id: 't:press_m', types: ['t:press'] }, ...(landed ? [{ id: 't:new_machine', types: ['t:new'] }] : [])] });
}
const packCfg = (packages, more = {}) => ({
  tier: 'lv',
  packages,
  world: [
    { id: 'w', mode: 'manual', bootstrap: true, items: ['t:sand', 't:press_m'] },
    { id: 'new-place', package: 'P1', mode: 'manual', bootstrap: true, items: ['t:not_there'] },
  ],
  machines: [{ machine: 't:press_m', types: ['t:press'] }, { machine: 't:new_machine', types: ['t:new'], package: 'P1' }],
  synthetic: [{ id: 'new-gen', package: 'P1', produces: ['eu:luv'] }],
  targets: [
    { id: 'glass', item: 't:glass' },
    { id: 'new-out', label: 'The new product', item: 't:new_out', package: 'P1' },
    { id: 'new-recipe', kind: 'recipe', recipe: 't:new_recipe', package: ['P1', 'P2'] },
    { id: 'energy', item: 'eu:luv', package: 'P1' },
  ],
  ...more,
});

test('packages: a pending package\'s targets warn (listed as missing), its machines don\'t warn, its world entries and synthetics wait', () => {
  const r = run(packPack(), packCfg({ P1: { label: 'the new line', landedWhen: ['t:new_machine'] }, P2: { landedWhen: [] } }));
  assert.deepEqual(verdicts(r.out.gate), { glass: 'PASS', 'new-out': 'WARN', 'new-recipe': 'WARN', energy: 'WARN' });
  assert.equal(r.out.verdict, 'PASS');
  const t = r.out.gate.find((x) => x.target.id === 'new-out').target;
  assert.equal(t.label, '[pending P1] The new product');
  assert.deepEqual(t.pending, ['P1']);
  assert.ok(!r.model.warnings.some((w) => /t:new_machine|t:not_there|new-gen/.test(w)), r.model.warnings.join('\n'));
  assert.ok(!r.model.g.rules.some((x) => x.name === 'synthetic:new-gen'), 'the synthetic waits for its package');
  assert.deepEqual(r.model.stats.packages.map((p) => [p.id, p.landed, p.missing]), [['P1', false, ['t:new_machine']], ['P2', true, []]]);
  assert.match(r.text, /Packages: landed P2; pending P1 \(their targets warn instead of failing\)\n {10}P1 the new line: the dump lacks t:new_machine/);
});

test('packages: once the dump carries the package, its targets are required again with no edit to the config', () => {
  const r = run(packPack({ landed: true }), packCfg({ P1: { landedWhen: ['t:new_machine', 'recipe:t:new_recipe'] }, P2: {} }));
  // the press runs the new recipe; nothing gives eu:luv now that the synthetic is in (it has no machine or input: always fires)
  assert.deepEqual(verdicts(r.out.gate), { glass: 'PASS', 'new-out': 'PASS', 'new-recipe': 'PASS', energy: 'PASS' });
  // a target of a landed package that fails is a FAIL
  const cfg = packCfg({ P1: { landedWhen: ['t:new_machine'] } }, {});
  cfg.targets.push({ id: 'broken', item: 't:nothing', package: 'P1' });
  const r2 = run(packPack({ landed: true }), cfg);
  assert.equal(verdicts(r2.out.gate).broken, 'FAIL');
  assert.equal(r2.out.verdict, 'FAIL');
  // P2 isn't declared there: a config warning, and the target counts as landed
  assert.ok(r2.model.warnings.some((w) => /targets new-recipe: package «P2» isn't declared/.test(w)), r2.model.warnings.join('\n'));
});

test('packages: landedWhenAny (one of two designs) and landedWhenAbsent (a package whose mark is a cut)', () => {
  const cut = gt('t:cut_me', 't:press', { ins: [gi('t:sand')], outs: [gi('t:bad')] });
  const decl = { P1: { landedWhenAny: ['t:new_machine', 't:other_machine'], landedWhenAbsent: ['recipe:t:cut_me'] } };
  let p = applyPackages({ packages: decl }, packPack({ landed: true, extra: [cut] })).packages[0];
  assert.deepEqual([p.landed, p.missing], [false, ['no recipe:t:cut_me (still there)']]);
  p = applyPackages({ packages: decl }, packPack({ landed: true })).packages[0];
  assert.equal(p.landed, true);
  p = applyPackages({ packages: decl }, packPack()).packages[0];
  assert.deepEqual(p.missing, ['one of t:new_machine | t:other_machine']);
  // a config with no packages is returned untouched
  const raw = { targets: [{ id: 'x', item: 'y' }] };
  assert.equal(applyPackages(raw, packPack()).raw, raw);
});

// ------------------------------------------------------------------ exceptRecipes and the fusion start

test('exceptRecipes: a machine\'s own modifier refuses a recipe its voltage allows (the UAF and GTM\'s NPU on two LuV hatches)', () => {
  const recipes = [
    gt('t:circuit_assembler/neuro_processor', 't:circ', { ins: [gi('t:stem')], outs: [gi('t:npu')], eut: 80000 }),
    gt('t:circuit_assembler/plain', 't:circ', { ins: [gi('t:stem')], outs: [gi('t:plain')], eut: 30720 }),
    gt('t:organoid/npu', 't:organoid', { ins: [gi('t:stem')], outs: [gi('t:npu')], eut: 30720 }),
  ];
  const cfg = (except, lab) => ({
    tier: 'lv',
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:stem', 't:uaf', 't:lab'] }],
    machines: [
      { machine: 't:uaf', types: ['t:circ'], energy: { voltage: 32768, hatches: 2 }, ...(except ? { exceptRecipes: except } : {}) },
      ...(lab ? [{ machine: 't:lab', types: ['t:organoid'] }] : []),
    ],
    targets: [
      { id: 'plain', item: 't:plain' },
      { id: 'npu', item: 't:npu' },
      { id: 'npu-only-lab', item: 't:npu', without: ['operate:t:lab'], expect: 'unreachable' },
    ],
  });
  const dump = mkDump({ recipes, items: ['t:uaf', 't:lab'] });
  assert.deepEqual(verdicts(run(dump, cfg(null, true)).out.gate), { plain: 'PASS', npu: 'PASS', 'npu-only-lab': 'FAIL' }, 'two LuV hatches reach ZPM: LEAK');
  let r = run(dump, cfg(['t:circuit_assembler/neuro_*'], true));
  assert.deepEqual(verdicts(r.out.gate), { plain: 'PASS', npu: 'PASS', 'npu-only-lab': 'PASS' });
  r = run(dump, cfg(['t:circuit_assembler/neuro_*'], false));
  const slot = r.model.g.rules.find((x) => x.name === 't:circuit_assembler/neuro_processor').slots.find((s) => s.role === 'machine');
  assert.match(slot.label, /no t:circ machine of this tier takes t:circuit_assembler\/neuro_processor/);
  assert.ok(run(dump, cfg([], true)).model.warnings.some((w) => /exceptRecipes is empty/.test(w)));
});

test('eu_to_start: the fusion recipe\'s start energy (data) is a condition a tier caps (the Mk1\'s 160 M EU)', () => {
  const recipes = [
    gt('t:fusion/europium', 't:fusion', { fins: [], outs: [gi('t:eu')], eut: 24576, data: { eu_to_start: 150000000 } }),
    gt('t:fusion/duranium', 't:fusion', { outs: [gi('t:du')], eut: 16384, data: { eu_to_start: 200000000 } }),
  ];
  const cfg = (conditions) => ({
    tier: 'lv', conditions,
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:mk1'] }],
    machines: [{ machine: 't:mk1', types: ['t:fusion'], maxEUt: 32768 }],
    targets: [{ id: 'eu', item: 't:eu' }, { id: 'du', item: 't:du' }],
  });
  const dump = mkDump({ recipes, items: ['t:mk1', 't:eu', 't:du'] });
  assert.deepEqual(verdicts(run(dump, cfg({ eu_to_start: { field: 'eu', max: 160000000 } })).out.gate), { eu: 'PASS', du: 'FAIL' });
  const slot = run(dump, cfg({ eu_to_start: { field: 'eu', max: 160000000 } })).model.g.rules.find((x) => x.name === 't:fusion/duranium').slots.find((s) => s.role === 'cond');
  assert.equal(slot.label, 'eu_to_start 200000000 (this tier reaches 160000000)');
  // with no rule the start is ignored, as every condition the tier doesn't know
  assert.deepEqual(verdicts(run(dump, cfg({ '*': { ignore: true } })).out.gate), { eu: 'PASS', du: 'PASS' });
});

// ------------------------------------------------------------------ the real tiers/luv.json

const luv = () => loadTierConfig({ tier: 'luv' }, TIERS).raw;

test('real tiers (luv): seven substages, Io before its sibling moons Europa and Ganymede, the dimension ids from the pack\'s tables and none hard-coded', () => {
  const raw = luv();
  const o = raw.eraOrder;
  const at = (e) => o.indexOf(e);
  for (const [a, b] of [['iv-mercury', 'luv'], ['luv', 'luv-orbit'], ['luv-orbit', 'luv-belt'], ['luv-belt', 'luv-io'], ['luv-io', 'luv-europa'], ['luv-io', 'luv-ganymede'], ['luv-ganymede', 'luv-io-orbit'], ['luv-io-orbit', 'zpm']]) {
    assert.ok(at(a) >= 0 && at(a) < at(b), `${a} before ${b}`);
  }
  // Europa's bases are Io's sulfur concrete (docs/eras/luv.md), so Io is not their sibling
  assert.deepEqual(raw.eraSiblings, [['iv-venus', 'iv-mercury'], ['luv-europa', 'luv-ganymede']]);
  const t = readPlaceTables(defaultTablesDir(TIERS));
  const surfaces = Object.values(t.places.surfaces);
  for (const d of [...t.orbits.dimensions, ...surfaces]) assert.ok(raw.conditions.dimension.asKeysFor.includes(d), d);
  const text = fs.readFileSync(path.join(TIERS, 'luv.json'), 'utf8');
  for (const d of [...t.orbits.dimensions, ...surfaces]) assert.ok(!text.includes(`"${d}"`) && !text.includes(`:${d}"`), `${d} is hard-coded in luv.json`);
  const res = Object.fromEntries(raw.eraResources.map((r) => [r.id, r]));
  assert.deepEqual(res.belt.dimensions, [t.places.surfaces.asteroid_belt, `${t.places.surfaces.asteroid_belt}_orbit`]);
  assert.deepEqual(res.orbit.dimensions, t.orbits.dimensions);
  assert.deepEqual(res.io.dimensions, [t.places.surfaces.io]);
  assert.deepEqual(res['io-orbit'].dimensions, [`${t.places.surfaces.io}_orbit`]);
  for (const [id, era, from] of [['asteroid-metals', 'luv-belt', 'belt'], ['germanium', 'luv-io', 'io'], ['life', 'luv-europa', 'europa']]) {
    assert.equal(res[id].era, era, id);
    assert.deepEqual(res[id].onlyFrom, [from], id);
  }
  assert.deepEqual(res['iridium-osmium'].onlyFrom, ['mercury', 'belt'], 'iridium and osmium only off Earth');
  assert.ok(res.naquadria.exclude.includes('fluid:gtceu:impure_naquadria_solution'), 'the impure solution is LuV\'s');
  assert.equal(res['zpm-materials'].era, 'zpm');
  // the trips give the tables' keys
  const syn = Object.fromEntries(raw.synthetic.map((s) => [s.id, s]));
  assert.deepEqual(syn['orbit-trip'].produces, [`dim:${t.orbits.earth}`]);
  assert.deepEqual(syn['jovian-trip'].produces, ['asteroid_belt', 'io', 'europa', 'ganymede'].map((k) => `dim:${t.places.surfaces[k]}`));
  assert.ok(syn['jovian-trip'].capital.includes('grindless:cryogenic_fuel_tank'));
  for (const [id, type] of [['orbital-solar', 'gtceu:orbital_solar'], ['volcanic-heat', 'gtceu:volcanic_heat'], ['tether', 'gtceu:electrodynamic_tether']]) {
    assert.deepEqual(syn[id].recipesOf, [type], id);
  }
  assert.deepEqual(syn['wireless-luv'].produces, ['eu:luv', 'wireless:luv']);
  assert.equal(raw.conditions.eu_to_start.max, 160000000);
});

test('real tiers (luv): another place id in the tables moves the whole config with it', () => {
  const t = readPlaceTables(defaultTablesDir(TIERS));
  const moved = structuredClone(t);
  moved.places.surfaces.io = 'grindless:io_final';
  moved.orbits.dimensions = [...moved.orbits.dimensions, 'grindless:io_final_orbit'];
  const { raw } = loadTierConfig({ tier: 'luv', tables: moved }, TIERS);
  assert.ok(raw.conditions.dimension.asKeysFor.includes('grindless:io_final'));
  assert.deepEqual(raw.eraResources.find((r) => r.id === 'io-orbit').dimensions, ['grindless:io_final_orbit']);
  assert.ok(raw.synthetic.find((s) => s.id === 'jovian-trip').produces.includes('dim:grindless:io_final'));
  assert.deepEqual(raw.targets.find((x) => x.id === 'site-io').dimensions, ['grindless:io_final']);
});

test('real tiers (luv): every package is declared, the in-flight ones have targets, and the cuts and leaks are there', () => {
  const raw = luv();
  const declared = new Set(Object.keys(raw.packages));
  for (const p of ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10']) assert.ok(declared.has(p), p);
  const lists = ['targets', 'autoTargets', 'machines', 'eraItems', 'eraResources', 'world', 'synthetic', 'targetsFromVeins', 'autoTargetsFromVeins'];
  const tagged = new Map();
  for (const k of lists) {
    for (const e of raw[k] || []) {
      for (const p of [].concat(e.package || [])) {
        assert.ok(declared.has(p), `${k} ${e.id || e.machine || e.idPrefix}: ${p}`);
        tagged.set(p, (tagged.get(p) || 0) + 1);
      }
    }
  }
  for (const p of ['B1', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10']) assert.ok(tagged.get(p) > 0, `${p} has targets`);
  const t = Object.fromEntries(raw.targets.map((x) => [x.id, x]));
  for (const id of ['trinium-only-mode2', 'npu-only-organoid-lab', 'germanium-only-io', 'bacteria-only-europa', 'europium-only-mk1', 'mk1-no-osmium', 'mk1-no-u235', 'mk1-no-u238', 'duranium-only-mk2', 'no-tritanium', 'pipe-no-arc-recycling', 'pipe-no-macerator-recycling', 'concentrate-only-processor', 'extract-only-optical-miner']) {
    assert.equal(t[id].expect, 'unreachable', id);
  }
  assert.equal(t['npu-only-organoid-lab'].package, undefined, 'the NPU check holds today: GTM\'s NPU is above every LuV machine but the UAF, which refuses it');
  for (const id of ['site-orbit', 'site-belt', 'site-io', 'site-io-orbit', 'site-europa', 'site-ganymede']) assert.equal(t[id].kind, 'site', id);
  const m = Object.fromEntries(raw.machines.map((e) => [e.id || e.machine, e]));
  assert.deepEqual(m['gtceu:universal_assembly_factory@luv2'].exceptRecipes, ['gtceu:circuit_assembler/neuro_processor']);
  assert.deepEqual(m['gtceu:harpoon_anchor_drill'].onlyRecipes, ['grindless:vein_drilling/luv/harpoon_*']);
  assert.deepEqual(m['gtceu:cryobot'].onlyRecipes, ['grindless:vein_drilling/luv/cryobot_*']);
  assert.deepEqual(m['gtceu:hydroponic_ring'].onlyRecipes, ['grindless:greenhouse/luv/*']);
  // mode 2 on two IV hatches (iv.json, inherited): LuV voltage before the LuV energy hatch
  assert.deepEqual(m['gtceu:naquadah_plant@iv2'].energy, { voltage: 8192 });
  assert.ok(m['gtceu:naquadah_plant@iv2'].partAbilities.energy_input.includes('gtceu:iv_wireless_energy_hatch'));
  const items = Object.fromEntries(raw.eraItems.map((g) => [g.id, g]));
  assert.equal(items['output-luv'].era, 'zpm');
  assert.equal(items['luv-belt'].era, 'luv-belt');
  assert.ok(items['luv-belt'].items.includes('m:gtceu:hydroponic_ring'), 'the ring\'s bearings put it after the belt');
  assert.ok(items['luv-europa'].items.includes('gtceu:neuro_processing_unit'), 'the organoid lab\'s NPU sits after Europa and the belt');
  assert.ok(items['ev-gtm'].exclude.includes('gtceu:ev_fluid_drilling_rig') && items['luv-gtm-early'].items.includes('gtceu:ev_fluid_drilling_rig'));
});

test('real tiers (iv): LuV-A2\'s mode 2 runs on two IV hatches, so trinium sulfide is reachable once IV hatches exist', () => {
  const { raw } = loadTierConfig({ tier: 'iv' }, TIERS);
  assert.deepEqual(raw.packages.A2.landedWhen, ['recipe:grindless:naquadah_refining/enriched_naquadah', 'recipe:grindless:naquadah_refining/spent_naquadah']);
  const t = Object.fromEntries(raw.targets.map((x) => [x.id, x]));
  assert.equal(t['naquadah-mode2-on-iv-hatches'].recipe, 'grindless:naquadah_refining/enriched_naquadah');
  assert.deepEqual(t['trinium-sulfide-needs-two-iv-hatches'].without, ['build:gtceu:naquadah_plant@iv2', 'build:gtceu:naquadah_plant@luv*']);
  // the rule itself: a 30,720 EU/t recipe needs two IV hatches (8,192 V x 4)
  const recipes = [gt('t:naquadah_refining/enriched_naquadah', 't:refining', { ins: [gi('t:oxide')], outs: [gi('t:trinium_sulfide')], eut: 30720 })];
  const cfg = (hatches) => ({
    tier: 'lv',
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:oxide', 't:plant'] }],
    machines: [{ machine: 't:plant', types: ['t:refining'], energy: { voltage: 8192, hatches } }],
    targets: [{ id: 'ts', item: 't:trinium_sulfide' }],
  });
  const dump = mkDump({ recipes, items: ['t:plant'] });
  assert.equal(verdicts(run(dump, cfg(2)).out.gate).ts, 'PASS');
  assert.equal(verdicts(run(dump, cfg(1)).out.gate).ts, 'FAIL');
});
