// LuV-A3 (docs/eras/luv.md, machines 1 and 2): the helium refrigerator (startup_scripts/grindless/luv/helium_refrigerator.js and its
// server script, which generates the recipes from the live vacuum freezer recipes) and the coated conductor line
// (startup_scripts/grindless/luv/coated_conductor_line.js and its server script, from tables/coated_conductor_line.json).
// The pack's scripts run in the static stand-in (lib/kubejs_static.mjs) with freezer recipes copied verbatim from a native dump
// (power-quests-1, GTM 7.5.3), so the generator reads the same JSON it reads in game. Every id the recipes, patterns and the native
// fixture name is pinned to that dump's registry: the stand-in accepts any id, so a naming guess would only fail in game.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');

// power-quests-1/results/server/kubejs-exported/recipes.json, verbatim
const LIQUID_HELIUM = { i: 'gtceu:vacuum_freezer/liquid_helium', t: 'gtceu:vacuum_freezer', j: { type: 'gtceu:vacuum_freezer', duration: 240, category: 'gtceu:vacuum_freezer', tickInputs: { eu: [{ content: 1920 }] }, inputs: { fluid: [{ content: { amount: 1000, value: [{ tag: 'forge:helium' }] } }] }, outputs: { fluid: [{ content: { amount: 1000, value: [{ fluid: 'gtceu:liquid_helium' }] } }] } } };
const HOT = { i: 'gtceu:vacuum_freezer/cool_hot_naquadah_alloy_ingot', t: 'gtceu:vacuum_freezer', j: { type: 'gtceu:vacuum_freezer', duration: 300, category: 'gtceu:vacuum_freezer', tickInputs: { eu: [{ content: 7680 }] }, inputs: { fluid: [{ content: { amount: 500, value: [{ tag: 'forge:liquid_helium' }] } }], item: [{ content: { type: 'gtceu:sized', count: 1, ingredient: { tag: 'forge:hot_ingots/naquadah_alloy' } } }] }, outputs: { fluid: [{ content: { amount: 250, value: [{ fluid: 'gtceu:helium' }] } }], item: [{ content: { type: 'gtceu:sized', count: 1, ingredient: { item: 'gtceu:naquadah_alloy_ingot' } } }] } } };
const MOLTEN = { i: 'gtceu:vacuum_freezer/naquadah_alloy', t: 'gtceu:vacuum_freezer', j: { type: 'gtceu:vacuum_freezer', duration: 1173, category: 'gtceu:vacuum_freezer', tickInputs: { eu: [{ content: 120 }] }, inputs: { fluid: [{ content: { amount: 144, value: [{ tag: 'forge:molten_naquadah_alloy' }] } }, { content: { amount: 500, value: [{ tag: 'forge:liquid_helium' }] } }], item: [{ content: { type: 'gtceu:sized', count: 1, ingredient: { item: 'gtceu:ingot_casting_mold' } }, chance: 0 }] }, outputs: { fluid: [{ content: { amount: 250, value: [{ fluid: 'gtceu:helium' }] } }], item: [{ content: { type: 'gtceu:sized', count: 1, ingredient: { item: 'gtceu:naquadah_alloy_ingot' } } }] } } };
const TITANIUM = { i: 'gtceu:vacuum_freezer/cool_hot_titanium_ingot', t: 'gtceu:vacuum_freezer', j: { type: 'gtceu:vacuum_freezer', duration: 144, category: 'gtceu:vacuum_freezer', tickInputs: { eu: [{ content: 480 }] }, inputs: { item: [{ content: { type: 'gtceu:sized', count: 1, ingredient: { tag: 'forge:hot_ingots/titanium' } } }] }, outputs: { item: [{ content: { type: 'gtceu:sized', count: 1, ingredient: { item: 'gtceu:titanium_ingot' } } }] } } };
// made up: a helium recipe with a condition, which the generator must refuse
const CONDITIONED = JSON.parse(JSON.stringify(HOT));
CONDITIONED.i = 'gtceu:vacuum_freezer/cool_hot_conditioned_ingot';
CONDITIONED.j.recipeConditions = [{ type: 'dimension', dimension: 'gcyr:luna' }];

const run = runPackScripts(pack, { originals: [LIQUID_HELIUM, HOT, MOLTEN, TITANIUM, CONDITIONED] });
const G = run.global.grindless;
const HR = G.heliumRefrigerator;
const CCL = G.coatedConductorLine;
const byId = new Map(run.docs.recipes.recipes.map((r) => [r.i, r]));
const ours = run.docs.recipes.recipes.filter((r) => r.t === 'gtceu:closed_loop_cooling' || r.t === 'gtceu:coated_conductor'
  || /^grindless:crafting\/(helium_refrigerator|coated_conductor_line)$/.test(r.i));

// { item | tag, count, consumed } of an item content; { fluid | tag, amount, consumed } of a fluid content
const itemOf = (e) => {
  const c = e.content;
  const s = c.ingredient || c;
  return { id: s.item || '#' + s.tag, count: c.count || 1, consumed: e.chance === undefined || e.chance > 0 };
};
const fluidOf = (e) => ({ id: e.content.value[0].fluid || '#' + e.content.value[0].tag, amount: e.content.amount, consumed: e.chance === undefined || e.chance > 0 });
const euOf = (r) => r.j.tickInputs.eu[0].content;
// what the scripts publish lives in the stand-in's own realm: compare plain copies
const plain = (x) => JSON.parse(JSON.stringify(x));
// the stand-in records no duration in a recipe's JSON: the scripts publish it
const planOf = (list, key, value) => plain(list).find((p) => p[key] === value);

test('the stand-in runs the A3 scripts without errors', () => {
  const mine = run.errors.filter((e) => /luv[\\/](helium_refrigerator|coated_conductor_line)|luv_cryogenics/.test(String(e.file)) && e.stage !== 'console.error');
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  for (const m of ['gtceu:helium_refrigerator', 'gtceu:coated_conductor_line']) assert.ok(run.registry.machines.has(m), m);
  for (const t of ['gtceu:closed_loop_cooling', 'gtceu:coated_conductor']) assert.ok(run.registry.recipeTypes.has(t), t);
});

test('the refrigerator makes one recipe per live freezer recipe that takes liquid helium, and refuses the rest', () => {
  assert.deepEqual(plain(HR.recipes.map((r) => r.source)).sort(), [MOLTEN.i, HOT.i].sort());
  assert.deepEqual(plain(HR.skipped), [{ source: CONDITIONED.i, reason: 'it has conditions' }]);
  assert.equal(HR.rate.from, LIQUID_HELIUM.i, 'the liquefaction rate is read from the live recipe');
  assert.equal(HR.rate.euPerMb, 1920 * 240 / 1000);
  assert.ok(![...byId.keys()].some((id) => /closed_loop_cooling\/cool_hot_titanium/.test(id)), 'a freezer recipe without liquid helium gets none');
});

test('a hot ingot: the ingot and 50 mB of nitrogen for 25 mB of liquid helium, the 4,000 mB charge never consumed, the EU of the freezer plus the re-liquefaction', () => {
  const r = byId.get('grindless:closed_loop_cooling/cool_hot_naquadah_alloy_ingot');
  assert.ok(r, 'the recipe id is grindless:closed_loop_cooling/<the source path>');
  assert.deepEqual(r.j.inputs.item.map(itemOf), [{ id: '#forge:hot_ingots/naquadah_alloy', count: 1, consumed: true }]);
  assert.deepEqual(r.j.inputs.fluid.map(fluidOf), [
    { id: 'gtceu:liquid_helium', amount: 25, consumed: true },
    { id: 'gtceu:liquid_nitrogen', amount: 50, consumed: true },
    { id: 'gtceu:liquid_helium', amount: 4000, consumed: false },
  ]);
  assert.deepEqual(r.j.outputs.item.map(itemOf), [{ id: 'gtceu:naquadah_alloy_ingot', count: 1, consumed: true }]);
  assert.deepEqual(r.j.outputs.fluid.map(fluidOf), [{ id: 'gtceu:nitrogen', amount: 50, consumed: true }], 'no helium leaves the loop');
  // 7,680 x 300 + 475 mB x 460.8 EU/mB x 0.5 = 2,413,440 EU at the freezer's 7,680 EU/t
  assert.equal(euOf(r), 7680);
  const p = planOf(HR.recipes, 'source', HOT.i);
  assert.deepEqual([p.eut, p.duration], [7680, 315]);
  assert.ok(p.eut * p.duration >= 7680 * 300 + 475 * 460.8 * 0.5);
});

test('a molten metal: the mold is not consumed, the molten metal is, and a cheap freezer step runs at no less than 1,920 EU/t', () => {
  const r = byId.get('grindless:closed_loop_cooling/naquadah_alloy');
  assert.ok(r);
  assert.deepEqual(r.j.inputs.item.map(itemOf), [{ id: 'gtceu:ingot_casting_mold', count: 1, consumed: false }]);
  assert.deepEqual(r.j.inputs.fluid.map(fluidOf), [
    { id: '#forge:molten_naquadah_alloy', amount: 144, consumed: true },
    { id: 'gtceu:liquid_helium', amount: 25, consumed: true },
    { id: 'gtceu:liquid_nitrogen', amount: 50, consumed: true },
    { id: 'gtceu:liquid_helium', amount: 4000, consumed: false },
  ]);
  assert.equal(euOf(r), 1920);
  const p = planOf(HR.recipes, 'source', MOLTEN.i);
  assert.deepEqual([p.eut, p.duration], [1920, Math.ceil((120 * 1173 + 475 * 460.8 * 0.5) / 1920)]);
});

test('one recipe per lookup path: no refrigerator or line recipe has keys that are a subset of another of its type', () => {
  const keysOf = (r) => {
    const k = new Set();
    for (const e of r.j.inputs.item || []) {
      const c = e.content;
      if (c.type === 'gtceu:circuit' || (c.ingredient && c.ingredient.type === 'gtceu:circuit')) k.add('circuit:' + JSON.stringify(c));
      else k.add('i:' + itemOf(e).id);
    }
    for (const e of r.j.inputs.fluid || []) k.add('f:' + fluidOf(e).id);
    return k;
  };
  for (const type of ['gtceu:closed_loop_cooling', 'gtceu:coated_conductor']) {
    const list = ours.filter((r) => r.t === type);
    assert.ok(list.length >= 2, type);
    const keys = list.map(keysOf);
    for (let a = 0; a < list.length; a++) {
      for (let b = 0; b < list.length; b++) {
        if (a !== b) assert.ok(![...keys[a]].every((x) => keys[b].has(x)), `${list[a].i} hides behind ${list[b].i}`);
      }
    }
  }
});

test('the coated conductor line: c1 substrate and c2 tape, from the table', () => {
  assert.deepEqual(plain(CCL.skipped), []);
  assert.deepEqual(plain(CCL.clashes), []);
  const c1 = byId.get('grindless:coated_conductor/nickel_tungsten_substrate');
  const c2 = byId.get('grindless:coated_conductor/itbtc_coated_conductor');
  assert.ok(c1 && c2);
  const isCircuit = (e) => e.content.type === 'gtceu:circuit' || (e.content.ingredient && e.content.ingredient.type === 'gtceu:circuit');
  const solids = (r) => r.j.inputs.item.filter((e) => !isCircuit(e)).map(itemOf);
  assert.deepEqual(c1.j.inputs.item.filter(isCircuit).length, 1, 'c1 has its programmed circuit');
  assert.deepEqual(c2.j.inputs.item.filter(isCircuit).length, 1, 'c2 has its programmed circuit');
  // UIV-A8 appends c3 gd_123_precursor (line 23), whose ids its own test proves; UXV-A8 appends c4 strand_tape
  assert.deepEqual(plain(CCL.recipes.map((r) => [r.circuit, r.eut, r.duration])), [[1, 7680, 400], [2, 30720, 300], [3, 30720, 400], [4, 1966080, 300]]);
  assert.deepEqual(solids(c1).map((x) => [x.id, x.count]), [['gtceu:nickel_dust', 19], ['gtceu:tungsten_dust', 1]]);
  assert.deepEqual(c1.j.outputs.item.map(itemOf).map((x) => [x.id, x.count]), [['grindless:nickel_tungsten_tape', 20]]);
  assert.equal(euOf(c1), 7680);
  assert.deepEqual(solids(c2).map((x) => [x.id, x.count]), [['grindless:nickel_tungsten_tape', 16], ['gtceu:indium_tin_barium_titanium_cuprate_dust', 1]]);
  assert.deepEqual(c2.j.inputs.fluid.map(fluidOf).map((x) => [x.id, x.amount]), [['gtceu:oxygen', 1000], ['gtceu:silver', 36]]);
  assert.deepEqual(c2.j.outputs.item.map(itemOf).map((x) => [x.id, x.count]), [['grindless:itbtc_coated_conductor', 16]]);
  assert.equal(euOf(c2), 30720);
});

test('the structures: sizes, one controller in the front slice, the part cells and the parallel hatch', () => {
  const cells = (s, ch) => s.slices.flat().join('').split('').filter((c) => c === ch).length;
  const hr = G.structures['gtceu:helium_refrigerator'];
  assert.deepEqual([hr.slices.length, hr.slices[0].length, hr.slices[0][0].length], [5, 9, 8]);
  assert.equal(cells(hr, 'X'), 16);
  const ccl = G.structures['gtceu:coated_conductor_line'];
  assert.deepEqual([ccl.slices.length, ccl.slices[0].length, ccl.slices[0][0].length], [3, 4, 21]);
  assert.equal(cells(ccl, 'X'), 42);
  for (const s of [hr, ccl]) {
    assert.equal(cells(s, 'S'), 1);
    assert.ok(s.slices[s.slices.length - 1].join('').includes('S'));
    assert.ok(s.symbols.X.options.some((o) => o.ability === 'parallel_hatch'));
  }
  for (const m of ['gtceu:helium_refrigerator', 'gtceu:coated_conductor_line']) assert.ok(G.parallelHatch.machines.includes(m), m);
});

test('every id A3 names is in the pinned native registry, not a naming guess the stand-in would accept', () => {
  // Frozen subset of power-quests-1/results/server/kubejs-exported/items.json (GTM 7.5.3 and its addons), checked 2026-10-26
  const nativeItems = new Set([
    'gtceu:frostproof_machine_casing', 'gtceu:titanium_turbine_casing', 'gtceu:clean_machine_casing', 'gtceu:titanium_gearbox',
    'gtceu:laminated_glass', 'gtceu:robust_machine_casing', 'gtceu:tungstensteel_gearbox', 'gtceu:hssg_coil_block',
    'gtceu:naquadah_coil_block', 'gtceu:trinium_coil_block', 'gtceu:tritanium_coil_block', 'gtceu:inert_machine_casing',
    'gtceu:tempered_glass', 'gtceu:titanium_pipe_casing', 'gtceu:stainless_steel_frame', 'gtceu:nickel_dust', 'gtceu:tungsten_dust',
    'gtceu:indium_tin_barium_titanium_cuprate_dust', 'gtceu:luv_machine_hull', 'gtceu:luv_electric_pump', 'gtceu:luv_electric_motor',
    'gtceu:luv_emitter', 'gtceu:luv_conveyor_module', 'gtceu:ingot_casting_mold', 'gtceu:naquadah_alloy_ingot',
    'gtceu:luv_parallel_hatch', 'gtceu:iv_parallel_hatch',
  ]);
  const nativeFluids = new Set(['gtceu:liquid_helium', 'gtceu:liquid_nitrogen', 'gtceu:nitrogen', 'gtceu:oxygen', 'gtceu:silver', 'gtceu:helium']);
  // ours: the two controllers (this package) and A1's tape items (startup_scripts/grindless/luv/foundation.js)
  const registered = new Set(['gtceu:helium_refrigerator', 'gtceu:coated_conductor_line', 'grindless:nickel_tungsten_tape', 'grindless:itbtc_coated_conductor']);
  for (const id of registered) assert.ok(run.registry.items.has(id) || run.registry.machines.has(id), `${id} is not registered by the pack`);
  const problems = [];
  const item = (id, where) => { if (!nativeItems.has(id) && !registered.has(id)) problems.push(`${where}: item ${id}`); };
  const fluid = (id, where) => { if (!nativeFluids.has(id)) problems.push(`${where}: fluid ${id}`); };
  // rows later eras append to A3's tables (_why "UIV-..."): their own tests prove their ids
  const later = (r) => /^U[IX][VX]-/.test((r && r._why) || '');
  const laterIds = new Set(JSON.parse(fs.readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', 'coated_conductor_line.json'), 'utf8'))
    .recipes.filter(later).map((r) => 'grindless:coated_conductor/' + r.name));
  // OpV-A2's 4 K tests on the refrigerator (server_scripts/grindless/opv/circuits.js): opv-circuits.test.mjs proves their ids
  for (const id of plain(G.opvCircuits?.fridgeRecipes || [])) laterIds.add(id);
  for (const r of ours.filter((x) => !laterIds.has(x.i))) {
    const walk = (o, key) => {
      if (Array.isArray(o)) return o.forEach((x) => walk(x, key));
      if (!o || typeof o !== 'object') return;
      if (typeof o.item === 'string') item(o.item, r.i);
      if (typeof o.fluid === 'string') fluid(o.fluid, r.i);
      for (const [k, v] of Object.entries(o)) walk(v, k);
    };
    walk(r.j);
  }
  for (const id of ['gtceu:helium_refrigerator', 'gtceu:coated_conductor_line']) {
    const sym = (s) => {
      (s.options || []).forEach(sym);
      (s.blocks || []).forEach((b) => item(b, id + ' pattern'));
      (s.materials || []).forEach((m) => item('gtceu:' + m + '_frame', id + ' pattern'));
    };
    Object.values(G.structures[id].symbols).forEach(sym);
  }
  for (const table of ['helium_refrigerator.json', 'coated_conductor_line.json']) {
    const t = JSON.parse(fs.readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', table), 'utf8'));
    const walk = (o) => {
      if (Array.isArray(o)) return o.forEach(walk);
      if (!o || typeof o !== 'object') return;
      if (typeof o.id === 'string' && o.amount !== undefined) fluid(o.id, table);
      else if (typeof o.id === 'string' && o.count !== undefined) item(o.id, table);
      Object.values(o).forEach(walk);
    };
    walk({ ...t, recipes: (t.recipes || []).filter((r) => !later(r)) });
  }
  assert.deepEqual(problems, []);
  // the native fixture names more: its parts, the recipe types it scans for recycling, and one live recipe id
  const fixtureIds = new Set(['gtceu:iv_input_bus', 'gtceu:iv_input_hatch', 'gtceu:iv_output_bus', 'gtceu:iv_output_hatch',
    'gtceu:luv_energy_input_hatch', 'gtceu:macerator', 'gtceu:arc_furnace', 'gtceu:extractor', 'gtceu:vacuum_freezer',
    'gtceu:vacuum_freezer/liquid_helium', 'gtceu:closed_loop_cooling', 'gtceu:coated_conductor']);
  const src = fs.readFileSync(path.join(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_luv_cryogenics.js'), 'utf8');
  for (const [, id] of src.matchAll(/['"](?:\d+x )?((?:gtceu|grindless):[a-z0-9_/]+)['"]/g)) {
    assert.ok(nativeItems.has(id) || nativeFluids.has(id) || registered.has(id) || fixtureIds.has(id), `fixture id: ${id}`);
  }
});
