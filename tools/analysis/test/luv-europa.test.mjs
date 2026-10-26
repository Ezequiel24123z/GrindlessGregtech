// LuV-B8 (docs/eras/luv.md, machines 17 and 18): the cryobot and the algae bioreactor (startup_scripts/grindless/luv/europa.js and its
// server script), Europa's brine and its processing, and the bacteria cut. The pack's scripts run in the static stand-in
// (lib/kubejs_static.mjs). Every id the recipes and patterns name is pinned to a native registry (power-quests-1): the stand-in accepts
// any id, so a naming guess would only fail in game.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');

// power-quests-1/results/server/kubejs-exported/recipes.json, verbatim: the cut recipe and the GTM recipes that take bacteria
const BREWERY = { i: 'gtceu:brewery/bacteria', t: 'gtceu:brewery', j: { type: 'gtceu:brewery', duration: 300, category: 'gtceu:brewery', recipeConditions: [{ cleanroom: 'sterile_cleanroom', type: 'cleanroom' }], tickInputs: { eu: [{ content: 480 }] }, inputs: { fluid: [{ content: { amount: 1000, value: [{ tag: 'forge:distilled_water' }] } }], item: [{ content: { type: 'gtceu:sized', count: 4, ingredient: { item: 'gtceu:bio_chaff' } } }] }, outputs: { fluid: [{ content: { amount: 1000, value: [{ fluid: 'gtceu:bacteria' }] } }] } } };
const SLUDGE = { i: 'gtceu:chemical_reactor/bacterial_sludge', t: 'gtceu:chemical_reactor', j: { type: 'gtceu:chemical_reactor', duration: 600, category: 'gtceu:chemical_reactor', recipeConditions: [{ cleanroom: 'sterile_cleanroom', type: 'cleanroom' }], tickInputs: { eu: [{ content: 1920 }] }, inputs: { fluid: [{ content: { amount: 1000, value: [{ tag: 'forge:biomass' }] } }, { content: { amount: 1000, value: [{ tag: 'forge:bacteria' }] } }] }, outputs: { fluid: [{ content: { amount: 1000, value: [{ fluid: 'gtceu:bacterial_sludge' }] } }] } } };

const run = runPackScripts(pack, { originals: [BREWERY, SLUDGE] });
const G = run.global.grindless;
const E = G.europa;
const plain = (x) => JSON.parse(JSON.stringify(x));
const byId = new Map(run.docs.recipes.recipes.map((r) => [r.i, r]));
const RECIPES = ['grindless:vein_drilling/luv/cryobot_ocean_sample', 'grindless:vein_drilling/luv/cryobot_brine', 'grindless:bioreactor/luv/algae',
  'grindless:bioreactor/luv/europan_culture', 'grindless:centrifuge/europan_brine_separation', 'grindless:assembler/melt_head',
  'grindless:assembler/cryobot_probe', 'grindless:crafting/cryobot', 'grindless:crafting/algae_bioreactor'];
const ours = RECIPES.map((id) => byId.get(id));

const itemOf = (e) => {
  const c = e.content;
  if (c.type === 'gtceu:circuit') return { circuit: c.configuration };
  const s = c.ingredient || c;
  return { id: s.item || '#' + s.tag, count: c.count || 1, chance: e.chance };
};
const fluidOf = (e) => ({ id: e.content.value[0].fluid || '#' + e.content.value[0].tag, amount: e.content.amount });
const gt = (id) => {
  const r = byId.get(id);
  return {
    type: r.t, eut: r.j.tickInputs.eu[0].content,
    items: r.j.inputs.item.map(itemOf), fluids: r.j.inputs.fluid.map(fluidOf),
    itemsOut: r.j.outputs.item.map(itemOf), fluidsOut: r.j.outputs.fluid.map(fluidOf),
    dims: r.j.recipeConditions.filter((c) => c.type === 'dimension').map((c) => c.dimension),
    other: r.j.recipeConditions.filter((c) => c.type !== 'dimension'),
  };
};

test('the stand-in runs the B8 scripts without errors and registers both machines, the type and magnesium sulfate', () => {
  const mine = run.errors.filter((e) => /luv[\\/]europa|luv_europa|lib[\\/]places/.test(String(e.file)) && e.stage !== 'console.error');
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  for (const m of ['gtceu:cryobot', 'gtceu:algae_bioreactor']) assert.ok(run.registry.machines.has(m), m);
  assert.deepEqual(run.registry.machines.get('gtceu:cryobot').recipeTypes, ['gtceu:vein_drilling']);
  assert.deepEqual(run.registry.machines.get('gtceu:algae_bioreactor').recipeTypes, ['gtceu:bioreactor']);
  assert.ok(run.registry.recipeTypes.has('gtceu:bioreactor'));
  assert.ok(run.registry.items.has('gtceu:magnesium_sulfate_dust'));
  for (const id of RECIPES) assert.ok(byId.has(id), id);
});

test('the cryobot: a probe for the sample, then brine with melt-head and RTG wear, Europa only from the places table', () => {
  const europa = JSON.parse(fs.readFileSync(path.join(pack, 'kubejs/data/grindless/tables/places.json'), 'utf8')).surfaces.europa;
  assert.equal(E.surface, europa);
  const sample = gt('grindless:vein_drilling/luv/cryobot_ocean_sample');
  assert.deepEqual(sample.items.filter((x) => !x.circuit), [{ id: 'grindless:cryobot_probe', count: 1, chance: 10000 }]);
  assert.deepEqual(sample.items.filter((x) => x.circuit), [{ circuit: 1 }]);
  assert.deepEqual(sample.itemsOut, [{ id: 'grindless:europan_ocean_sample', count: 1, chance: 10000 }]);
  assert.deepEqual(sample.fluidsOut, [{ id: 'gtceu:europan_brine', amount: 1000 }]);
  assert.equal(sample.eut, 7680);
  assert.deepEqual(sample.dims, [europa]);
  const brine = gt('grindless:vein_drilling/luv/cryobot_brine');
  assert.deepEqual(brine.items.filter((x) => x.circuit), [{ circuit: 2 }]);
  assert.deepEqual(brine.items.filter((x) => !x.circuit), [
    { id: 'grindless:melt_head', count: 1, chance: 25 }, // 0.25 % a run, the family's bit rate
    { id: 'grindless:rtg_pellet', count: 1, chance: 56 }, // 400 t of 72,000: about one an hour
  ]);
  assert.deepEqual(brine.fluids, []);
  assert.deepEqual(brine.fluidsOut, [{ id: 'gtceu:europan_brine', amount: 8000 }, { id: 'minecraft:water', amount: 2000 }]);
  assert.equal(brine.eut, 7680);
  assert.deepEqual(brine.dims, [europa]);
  // each LuV drill runs only its own prefix; the family's tier folder keeps lower drills off
  for (const id of ['grindless:vein_drilling/luv/cryobot_ocean_sample', 'grindless:vein_drilling/luv/cryobot_brine']) {
    const r = { id: { getPath: () => id.split(':')[1] } };
    assert.ok(E.isCryobotRecipe(r));
    assert.equal(G.lv.rules.recipeTier(r), 'luv');
    for (const tier of ['lv', 'mv', 'hv', 'ev', 'iv']) assert.ok(G.lv.rules.isAboveTier(r, tier), tier);
  }
  assert.ok(!E.isCryobotRecipe({ id: { getPath: () => 'vein_drilling/iv/mercury_iridosmine_mercury_tungsten_steel' } }));
  // no hard-coded dimension in B8's scripts
  for (const f of ['startup_scripts/grindless/luv/europa.js', 'server_scripts/grindless/luv/europa.js']) {
    assert.doesNotMatch(fs.readFileSync(path.join(pack, 'kubejs', f), 'utf8'), /grindless:europa\b/, f);
  }
});

test('the bioreactor: algae anywhere, the Europan culture only on Europa, the only bacteria', () => {
  const algae = gt('grindless:bioreactor/luv/algae');
  assert.deepEqual(algae.items, [{ circuit: 1 }]);
  assert.deepEqual(algae.fluids, [{ id: 'minecraft:water', amount: 1000 }, { id: 'gtceu:carbon_dioxide', amount: 500 }]);
  assert.deepEqual(algae.fluidsOut, [{ id: 'gtceu:biomass', amount: 250 }, { id: 'gtceu:oxygen', amount: 400 }]);
  assert.deepEqual([algae.eut, algae.dims], [480, []]);
  const culture = gt('grindless:bioreactor/luv/europan_culture');
  assert.deepEqual(culture.items.filter((x) => x.circuit), [{ circuit: 2 }]);
  assert.deepEqual(culture.items.filter((x) => !x.circuit), [
    { id: 'grindless:chondritic_extract', count: 1, chance: 10000 },
    { id: 'grindless:europan_ocean_sample', count: 1, chance: 0 }, // kept: the sample seeds every run
  ]);
  assert.deepEqual(culture.fluids, [{ id: 'gtceu:europan_brine', amount: 1000 }, { id: 'gtceu:hydrogen_peroxide', amount: 250 },
    { id: 'gtceu:hydrogen', amount: 500 }]);
  assert.deepEqual(culture.fluidsOut, [{ id: 'gtceu:bacteria', amount: 1000 }, { id: 'gtceu:biomass', amount: 100 }]);
  assert.equal(culture.eut, 1920);
  assert.deepEqual(culture.dims, [E.surface]);
  assert.deepEqual(culture.other, [], 'no sterile cleanroom: the culture is the replacement GTM\'s cut recipe lacked at LuV');
  const io = plain(E.bioreactorIO);
  for (const id of ['grindless:bioreactor/luv/algae', 'grindless:bioreactor/luv/europan_culture']) {
    const r = gt(id);
    assert.ok(r.items.length <= io.itemsIn && r.fluids.length <= io.fluidsIn && r.fluidsOut.length <= io.fluidsOut, id);
  }
  const drill = plain(E.drillIO);
  assert.ok(drill.itemsIn >= 3 && drill.fluidsOut >= 2 && drill.itemsOut >= 10 && drill.fluidsIn >= 1, 'never narrower than LV\'s widening');
});

test('the bacteria cut lands with its replacement: GTM\'s brewery/bacteria goes, every bacteria consumer stays and has a source', () => {
  assert.deepEqual(plain(E.cut), ['gtceu:brewery/bacteria']);
  assert.ok(run.removals.some((r) => r.file.includes('europa') && r.filter.includes('gtceu:brewery/bacteria')));
  const makers = run.docs.recipes.recipes.filter((r) => (r.j.outputs?.fluid || []).some((f) => (f.content?.value || []).some((v) => v.fluid === 'gtceu:bacteria')));
  assert.deepEqual(makers.map((r) => r.i).filter((i) => i !== BREWERY.i), ['grindless:bioreactor/luv/europan_culture']);
  // GTM's own consumers (stem cells, bacterial sludge) are originals the cut must not match; the biofoundry's steps are ours
  assert.ok(!run.removals.some((r) => r.filter.includes(SLUDGE.i) || /forge:bacteria|"output"|"input"/.test(r.filter) && r.file.includes('europa')));
  const takers = run.docs.recipes.recipes.filter((r) => r.i !== BREWERY.i && (r.j.inputs?.fluid || [])
    .some((f) => (f.content?.value || []).some((v) => v.fluid === 'gtceu:bacteria' || v.tag === 'forge:bacteria')));
  assert.ok(takers.length >= 2, takers.map((r) => r.i).join(', '));
  assert.ok(takers.some((r) => r.t === 'gtceu:sterile_culture'), 'the biofoundry keeps its bacteria steps');
});

test('the brine\'s honest destination: water, magnesium sulfate and salt, which GTM\'s electrolyzer splits', () => {
  const sep = gt('grindless:centrifuge/europan_brine_separation');
  assert.deepEqual(sep.fluids, [{ id: 'gtceu:europan_brine', amount: 1000 }]);
  assert.deepEqual(sep.itemsOut, [{ id: 'gtceu:magnesium_sulfate_dust', count: 6, chance: 10000 }, { id: 'gtceu:salt_dust', count: 2, chance: 10000 }]);
  assert.deepEqual(sep.fluidsOut, [{ id: 'minecraft:water', amount: 1000 }]);
  const cfg = JSON.parse(fs.readFileSync(path.join(root, 'tools/analysis/emi_coverage.json'), 'utf8'));
  assert.ok(cfg.derived.some((d) => d.id === 'gtceu:magnesium_sulfate_dust' && d.role === 'use' && d.category === 'gtceu:electrolyzer'));
  assert.match(fs.readFileSync(path.join(pack, 'kubejs/startup_scripts/grindless/luv/europa.js'), 'utf8'),
    /\.components\('1x magnesium', '1x sulfur', '4x oxygen'\)/);
});

test('every recipe of B8 has its own lookup path in its type', () => {
  const keys = (r) => [...r.j.inputs.item.map((e) => JSON.stringify(e.content.type === 'gtceu:circuit' ? e.content : e.content.ingredient)),
    ...r.j.inputs.fluid.map((e) => JSON.stringify(e.content.value))];
  const gtRecipes = run.docs.recipes.recipes.filter((r) => r.j && r.j.inputs && r.j.inputs.item);
  for (const mine of ours.filter((r) => r.t.startsWith('gtceu:'))) {
    const k = new Set(keys(mine));
    for (const other of gtRecipes.filter((r) => r.t === mine.t && r.i !== mine.i)) {
      const o = keys(other);
      const subset = o.every((x) => k.has(x)) || [...k].every((x) => o.includes(x));
      assert.ok(!subset, `${mine.i} and ${other.i} share a lookup path`);
    }
  }
});

test('B8 patterns: the ice shaft under the cryobot, vault casing at both, lamps between the bioreactor\'s tubes', () => {
  const cry = plain(G.structures['gtceu:cryobot']);
  assert.equal(cry.slices.length, 5);
  assert.equal(cry.slices[0].length, 16, 'at most 16 high');
  assert.deepEqual(plain(cry.symbols.I.blocks), ['minecraft:packed_ice', 'minecraft:blue_ice']);
  const shaft = cry.slices.flatMap((rows, z) => rows.flatMap((row, y) => [...row].map((c, x) => (c === 'I' ? `${x},${y},${z}` : null)))).filter(Boolean);
  assert.deepEqual(shaft, ['2,0,2', '2,1,2', '2,2,2', '2,3,2', '2,4,2'], 'a 1x1x5 shaft under the middle of the base');
  assert.ok(cry.slices[4][5].includes('S'), 'the controller on the base\'s front');
  assert.equal(cry.symbols.V.blocks[0], 'grindless:radiation_vault_casing');
  assert.equal(cry.symbols.D.blocks[0], 'gtceu:tungstensteel_gearbox');
  assert.deepEqual(plain(cry.symbols.F.materials), ['tungsten_steel']);
  assert.equal(cry.symbols.X.options[0].blocks[0], 'grindless:sulfur_concrete_casing');
  const bio = plain(G.structures['gtceu:algae_bioreactor']);
  assert.equal(bio.slices[0].length, 13);
  const tubes = bio.slices[2].slice(3);
  assert.equal(tubes.length, 10);
  for (const row of tubes) assert.equal(row, 'TLTLT');
  assert.equal(bio.symbols.T.blocks[0], 'gtceu:laminated_glass');
  assert.ok(bio.symbols.L.blocks.includes('gtceu:white_lamp') && bio.symbols.L.blocks.includes('gtceu:black_borderless_lamp'));
  assert.equal(bio.symbols.V.blocks[0], 'grindless:radiation_vault_casing');
  for (const s of [cry, bio]) {
    const abilities = s.symbols.X.options.map((o) => o.ability).filter(Boolean);
    assert.ok(abilities.includes('energy_input') && abilities.includes('output_hatch'));
  }
});

test('every id B8 names is in the pinned native registry, not a naming guess the stand-in would accept', () => {
  // Frozen subset of power-quests-1/results/server/kubejs-exported/items.json (GTM 7.5.3 and its addons), checked 2026-10-26
  const nativeItems = new Set([
    'gtceu:tungsten_carbide_plate', 'gtceu:hsss_plate', 'gtceu:iv_electric_pump', 'gtceu:luv_sensor', 'gtceu:normal_optical_pipe',
    'gtceu:luv_electric_pump', 'gtceu:luv_machine_hull', 'gtceu:tungstensteel_gearbox', 'gtceu:salt_dust', 'gtceu:laminated_glass',
    'minecraft:packed_ice', 'minecraft:blue_ice', 'gtceu:white_lamp', 'gtceu:black_borderless_lamp', 'gtceu:tungsten_steel_frame',
  ]);
  const nativeFluids = new Set(['gtceu:hydrogen_peroxide', 'gtceu:hydrogen', 'gtceu:oxygen', 'gtceu:biomass', 'gtceu:bacteria',
    'gtceu:carbon_dioxide', 'minecraft:water']);
  // ours: the controllers and magnesium sulfate (this package), A1's items and brine, IV's RTG pellet
  const registered = new Set(['gtceu:cryobot', 'gtceu:algae_bioreactor', 'gtceu:magnesium_sulfate_dust', 'grindless:cryobot_probe',
    'grindless:melt_head', 'grindless:europan_ocean_sample', 'grindless:chondritic_extract', 'grindless:rtg_pellet',
    'grindless:sulfur_concrete_casing', 'grindless:radiation_vault_casing']);
  for (const id of registered) assert.ok(run.registry.items.has(id) || run.registry.machines.has(id), `${id} is not registered by the pack`);
  assert.ok(run.registry.fluids.has('gtceu:europan_brine'));
  const problems = [];
  for (const r of ours) {
    const walk = (o) => {
      if (Array.isArray(o)) return o.forEach(walk);
      if (!o || typeof o !== 'object') return;
      if (typeof o.item === 'string' && !nativeItems.has(o.item) && !registered.has(o.item)) problems.push(`${r.i}: item ${o.item}`);
      if (typeof o.fluid === 'string' && !nativeFluids.has(o.fluid) && o.fluid !== 'gtceu:europan_brine') problems.push(`${r.i}: fluid ${o.fluid}`);
      Object.values(o).forEach(walk);
    };
    walk(r.j);
  }
  for (const id of ['gtceu:cryobot', 'gtceu:algae_bioreactor']) {
    for (const sym of Object.values(G.structures[id].symbols)) {
      const blocks = sym.options ? sym.options.flatMap((o) => o.blocks || []) : sym.blocks || [];
      for (const b of blocks) if (!nativeItems.has(b) && !registered.has(b) && !/^gtceu:[a-z_]+_(borderless_)?lamp$/.test(b)) problems.push(`${id}: block ${b}`);
    }
  }
  assert.deepEqual(problems, []);
});

test('B8\'s registrations leave the hidden tables: no group and no audit rule waits for package B8 any more', () => {
  const hidden = fs.readFileSync(path.join(pack, 'kubejs/data/grindless/tables/hidden_until.json'), 'utf8');
  for (const id of ['gtceu:europan_brine', 'grindless:cryobot_probe', 'grindless:melt_head', 'grindless:europan_ocean_sample']) {
    assert.ok(!hidden.includes(`"${id}"`), id);
  }
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'tools/analysis/tiers/obtain.json'), 'utf8'), /LuV \(B8\)/);
});
