// EMI coverage audit (tools/analysis/emi-coverage.mjs): the static KubeJS stand-in that runs the pack's scripts, the EMI model, the
// pack itself (zero gaps), and the native client fixture's contract (expectations current, Rhino-safe ES5, disabled by default).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { DEFAULT_EXPECT, runCoverage } from '../emi-coverage.mjs';
import { auditEmiCoverage, conditionStacks, DIMENSION_MARKERS, fixtureExpectations, loadEmiData, parseEmiStack, previewBlocks, renderCoverageText, renderExpectations } from '../lib/emi_coverage.mjs';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { gf, gi, gt, mkDump, shaped } from './helpers.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const overlay = path.join(root, 'tools', 'test', 'overlay', 'kubejs');

// ---------------------------------------------------------------- the model, on in-memory dumps

const reg = ({ items = [], machines = [], fluids = [], types = [] } = {}) => ({
  items: new Map(items.map((id) => [id, { id, file: 'x.js' }])),
  machines: new Map(machines.map((m) => [m.id, { id: m.id, recipeTypes: m.types || [], file: 'x.js' }])),
  fluids: new Map(fluids.map((id) => [id, { id, file: 'x.js' }])),
  recipeTypes: new Map(types.map((t) => [t, { id: t }])),
});
const noEmi = { pages: [], disabled: [], problems: [] };
const cfg0 = { invisibleTypes: ['gtceu:electric_furnace', 'gtceu:dummy'] };
const page = (file, stacks, text = ['k.0']) => ({ id: 'emi:/generated/recipe/additions/grindless/' + file, file, type: 'emi:info', stacks: stacks.map(parseEmiStack), text });
const audit = (o) => auditEmiCoverage({ cfg: cfg0, emi: noEmi, lang: null, native: false, ...o });
const gapsOf = (res) => Object.fromEntries(res.gaps.map((g) => [g.key, g.gaps]));

test('a not-consumed input (GTM shows it as an EMI catalyst) is a use; a crafting output is an acquisition', () => {
  const dump = mkDump({
    recipes: [
      shaped('t:crafting/sample', ['P'], { P: { item: 't:probe' } }, 't:sample'),
      gt('t:drilling/a', 'gtceu:drilling', { ins: [gi('t:sample', 1, 0)], outs: [gi('t:ore')] }),
    ],
  });
  const res = audit({ dump, registry: reg({ items: ['t:sample'], types: ['gtceu:drilling'] }) });
  assert.deepEqual(res.gaps, []);
  const row = res.results.find((r) => r.key === 't:sample');
  assert.deepEqual(row.used.map((u) => u.category), ['gtceu:drilling']);
  assert.deepEqual(row.made.map((u) => u.category), ['minecraft:crafting']);
});

test('EMI never shows GTM\'s electric furnace recipes: such a route needs a page, and alone it is no acquisition', () => {
  const recipes = [gt('t:electric_furnace/brick', 'gtceu:electric_furnace', { ins: [gi('t:dust', 4)], outs: [gi('t:brick')] })];
  let res = audit({ dump: mkDump({ recipes }), registry: reg({ items: ['t:brick'] }), cfg: { ...cfg0, endProducts: { items: [{ id: 't:brick', reason: 'test' }] } } });
  assert.deepEqual(gapsOf(res), { 't:brick': ['acquisition', 'page for a route EMI cannot show'] });
  res = audit({
    dump: mkDump({ recipes }), registry: reg({ items: ['t:brick'] }), cfg: { ...cfg0, endProducts: { items: [{ id: 't:brick', reason: 'test' }] } },
    emi: { ...noEmi, pages: [page('brick.json', ['item:t:brick'])] },
  });
  assert.deepEqual(res.gaps, []);
  assert.deepEqual(res.viaPagesOnly, ['t:brick']);
});

test('an info page is both a recipe and a use of every stack on it (EmiInfoRecipe), tags expanded; its text must exist in en_us and es_es', () => {
  const dump = mkDump({ items: ['t:key', 't:sample_a', 't:sample_b'], tagsItem: { 't:samples': ['t:sample_a', 't:sample_b'] } });
  const emi = { ...noEmi, pages: [page('keys.json', ['item:t:key', '#item:t:samples'], ['emi.t.keys.0'])] };
  const lang = { en_us: { 'emi.t.keys.0': 'x' }, es_es: {} };
  const res = audit({ dump, registry: reg({ items: ['t:key', 't:sample_a', 't:sample_b'] }), emi, lang });
  assert.deepEqual(res.gaps, []);
  assert.deepEqual(res.problems, ['keys.json: no es_es text for emi.t.keys.0']);
});

test('a disabled stack (assets/emi/index/stacks) drops every recipe it is in; an index-hidden old item is listed with its conversion', () => {
  const dump = mkDump({
    recipes: [
      gt('t:mixer/cat', 'gtceu:mixer', { ins: [gi('t:dust')], outs: [gi('t:catalyst'), gi('t:junk')] }),
      shaped('t:crafting/old_to_new', ['O'], { O: { item: 't:old' } }, 't:new'),
    ],
    tagsItem: { 'c:hidden_from_recipe_viewers': ['t:junk', 't:old'], 't:hidden_with_recipes': ['t:junk'] },
  });
  const emi = { ...noEmi, disabled: [parseEmiStack('#item:t:hidden_with_recipes')] };
  const res = audit({ dump, registry: reg({ items: ['t:catalyst', 't:old'] }), emi });
  assert.deepEqual(gapsOf(res), { 't:catalyst': ['acquisition', 'use'] });
  assert.equal(res.results.find((r) => r.key === 't:catalyst').invisibleMade[0].dropped, true);
  assert.deepEqual(res.legacy, [{ key: 't:old', conversions: ['t:crafting/old_to_new'] }]);
  assert.deepEqual(res.droppedRoutes, [{ id: 't:mixer/cat', type: 'gtceu:mixer', disabledBy: ['output t:junk'], ours: ['t:catalyst'] }]);
});

test('an observation with a hidden byproduct is dropped whole: the chart keeps its copy recipe, but the audit still fails on the lost route', () => {
  const dump = mkDump({
    recipes: [
      gt('t:stargazing/chart', 'gtceu:stargazing', { ins: [gi('t:paper', 4), gi('t:lens', 1, 0)], outs: [gi('t:chart'), gi('t:later_era_dust')] }),
      shaped('t:crafting/chart_copy', ['CP'], { C: { item: 't:chart' }, P: { item: 't:paper' } }, 't:chart', 2),
      gt('t:drilling/a', 'gtceu:drilling', { ins: [gi('t:sample', 1, 0), gi('t:bit', 1, 100)], fins: [gf('t:hidden_fluid', 10)], outs: [gi('t:ore')] }),
    ],
    tagsItem: { 't:hidden_with_recipes': ['t:later_era_dust'] }, tagsFluid: { 't:hidden_with_recipes': ['t:hidden_fluid'] },
  });
  const emi = { ...noEmi, disabled: [parseEmiStack('#item:t:hidden_with_recipes'), parseEmiStack('#fluid:t:hidden_with_recipes')] };
  const res = audit({ dump, registry: reg({ items: ['t:chart', 't:lens', 't:sample'], types: ['gtceu:stargazing', 'gtceu:drilling'] }), emi });
  assert.deepEqual(gapsOf(res), { 't:lens': ['acquisition', 'use'], 't:sample': ['acquisition', 'use'] }, 'the copy keeps the chart covered');
  assert.deepEqual(res.droppedRoutes.map((d) => [d.id, d.disabledBy, d.ours]), [
    ['t:stargazing/chart', ['output t:later_era_dust'], ['t:chart', 't:lens']],
    ['t:drilling/a', ['input fluid:t:hidden_fluid'], ['t:sample']],
  ]);
  assert.ok(res.problems.some((p) => p.startsWith('t:stargazing/chart (gtceu:stargazing): EMI drops it for output t:later_era_dust')), res.problems.join('\n'));
});

test('a pending route is dropped only for our stacks disabled until their era; a foreign stack or a stale entry is still a problem', () => {
  const dump = mkDump({
    recipes: [
      gt('t:assembler/tank', 'gtceu:assembler', { ins: [gi('t:small_tank'), gi('t:aerogel', 8)], outs: [gi('t:big_tank')] }),
      gt('t:assembler/other', 'gtceu:assembler', { ins: [gi('t:small_tank'), gi('t:junk')], outs: [gi('t:big_tank')] }),
    ],
    tagsItem: { 't:hidden_with_recipes': ['t:aerogel', 't:junk'] },
  });
  const emi = { ...noEmi, disabled: [parseEmiStack('#item:t:hidden_with_recipes')] };
  const registry = reg({ items: ['t:small_tank', 't:big_tank', 't:aerogel'], types: ['gtceu:assembler'] });
  const pendingRoutes = [{ id: 't:assembler/tank', reason: 'aerogel is a later package' }, { id: 't:assembler/other' }, { id: 't:assembler/gone' }];
  const res = audit({ dump, registry, emi, cfg: { ...cfg0, pendingRoutes } });
  assert.deepEqual(res.pendingRoutes.map((d) => [d.id, d.disabledBy, d.reason]), [['t:assembler/tank', ['input t:aerogel'], 'aerogel is a later package']]);
  assert.deepEqual(res.droppedRoutes.map((d) => d.id), ['t:assembler/other'], 't:junk is not ours');
  assert.ok(res.problems.includes('pending route t:assembler/gone: EMI no longer drops it for stacks disabled until their era; delete the entry'), res.problems.join('\n'));
  assert.ok(res.problems.some((p) => p.startsWith('t:assembler/other (gtceu:assembler): EMI drops it')), res.problems.join('\n'));
});

test('what only a pending route gives is pending, not a gap, and a process whose recipes are all pending routes is not a problem', () => {
  const dump = mkDump({
    recipes: [gt('t:cvd/plate', 'gtceu:cvd', { ins: [gi('t:seed', 1, 0), gi('t:methane')], outs: [gi('t:plate')] })],
    tagsItem: { 't:hidden_with_recipes': ['t:seed'] },
  });
  const emi = { ...noEmi, disabled: [parseEmiStack('#item:t:hidden_with_recipes')] };
  const registry = reg({ items: ['t:seed', 't:plate', 't:methane'], types: ['gtceu:cvd'] });
  const cfg = { ...cfg0, endProducts: { globs: [], items: [{ id: 't:plate' }] } };
  const before = audit({ dump, registry, emi, cfg });
  assert.ok(gapsOf(before)['t:plate'], 'without the entry the plate has no source');
  assert.ok(before.problems.some((p) => p.startsWith('process gtceu:cvd')), before.problems.join('\n'));
  const res = audit({ dump, registry, emi, cfg: { ...cfg, pendingRoutes: [{ id: 't:cvd/plate', reason: 'the seed is a later package' }] } });
  assert.equal(gapsOf(res)['t:plate'], undefined);
  assert.deepEqual(res.results.find((r) => r.key === 't:plate').pending, [{ role: 'acquisition', routes: ['t:cvd/plate'] }]);
  assert.ok(!res.problems.some((p) => p.startsWith('process gtceu:cvd')), res.problems.join('\n'));
});

test('the multiblock preview places the first block of each predicate: later options are no use, and a structure-only block needs a page', () => {
  const structure = { symbols: { S: { kind: 'controller' }, C: { kind: 'oneOf', options: [{ kind: 'blocks', blocks: ['t:cell_1', 't:cell_2'] }, { kind: 'blocks', blocks: ['t:casing'] }] } } };
  assert.deepEqual(previewBlocks(structure), ['t:cell_1', 't:casing']);
  const dump = mkDump({ items: ['t:cell_1', 't:cell_2', 't:tower'], structures: { 't:tower': structure } });
  const res = audit({ dump, registry: reg({ items: ['t:cell_1', 't:cell_2'] }) });
  assert.deepEqual(gapsOf(res), { 't:cell_1': ['acquisition', 'page for a structure block'], 't:cell_2': ['acquisition', 'use'] });
});

test('machines need no use; end products and exceptions are honoured with their reasons', () => {
  const dump = mkDump({ recipes: [shaped('t:crafting/drill', ['H'], { H: { item: 't:hull' } }, 't:drill'), shaped('t:crafting/tool', ['H'], { H: { item: 't:hull' } }, 't:tool')], items: ['t:reward'] });
  const res = audit({
    dump,
    registry: reg({ items: ['t:tool', 't:reward'], machines: [{ id: 't:drill' }] }),
    cfg: { ...cfg0, endProducts: { items: [{ id: 't:tool', reason: 'a tool' }] }, exceptions: [{ id: 't:reward', role: 'acquisition', reason: 'quest reward' }, { id: 't:reward', role: 'use', reason: 'cosmetic' }] },
  });
  assert.deepEqual(res.gaps, []);
  assert.deepEqual(res.results.find((r) => r.key === 't:reward').excepted.map((e) => e.role), ['acquisition', 'use']);
  assert.match(renderCoverageText(res), /Justified exceptions: 1/);
});

test('a derived route covers what the stand-in cannot see, and a native dump must hold it in that EMI category', () => {
  const cfg = { ...cfg0, derived: [{ id: 't:catalyst', role: 'use', category: 'gtceu:refining', source: 'refinery.js' }] };
  const made = gt('t:mixer/catalyst', 'gtceu:mixer', { ins: [gi('t:dust')], outs: [gi('t:catalyst')] });
  let res = audit({ dump: mkDump({ recipes: [made] }), registry: reg({ items: ['t:catalyst'] }), cfg });
  assert.deepEqual(res.gaps, []);
  res = audit({ dump: mkDump({ recipes: [made] }), registry: reg({ items: ['t:catalyst'] }), cfg, native: true });
  assert.deepEqual(res.problems, ['derived route for t:catalyst (use in gtceu:refining): no such recipe in the dump']);
  const refine = gt('t:refining/oil', 'gtceu:refining', { ins: [gi('t:catalyst', 1, 0)], fins: [gf('t:oil')], fouts: [gf('t:fuel')] });
  res = audit({ dump: mkDump({ recipes: [made, refine] }), registry: reg({ items: ['t:catalyst'] }), cfg, native: true });
  assert.deepEqual(res.problems, []);
  assert.equal(res.derivedChecks[0].found, 1);
});

test('every process of ours shows a recipe; a GT sub-category is the EMI tab its recipes show in', () => {
  const crush = gt('t:macerator/raw', 'gtceu:macerator', { ins: [gi('t:raw')], outs: [gi('t:crushed')] });
  crush.json.category = 'gtceu:ore_crushing';
  const res = audit({ dump: mkDump({ recipes: [crush] }), registry: reg({ items: ['t:raw'], types: ['gtceu:empty_type'], machines: [{ id: 't:m', types: ['gtceu:empty_type'] }] }), cfg: { ...cfg0, endProducts: { items: [{ id: 't:raw', reason: 'x' }] } } });
  assert.deepEqual(res.problems, ['process gtceu:empty_type (t:m): no recipe EMI could show']);
  assert.equal(res.results.find((r) => r.key === 't:raw').used[0].category, 'gtceu:ore_crushing');
});

test('GTM turns a dimension condition into a marker input and research into a data catalyst; a disabled marker drops the recipe', () => {
  assert.deepEqual(conditionStacks([
    { type: 'dimension', dimension: 'gcyr:luna' }, { type: 'dimension', dimension: 'grindless:void' }, { type: 'daytime', reverse: true },
    { type: 'research', research: [{ researchId: 'x', dataItem: { id: 'gtceu:data_orb', Count: 1 } }] }, { type: 'research', research: 'y' },
  ]).map((s) => [s.role, s.alts]), [
    ['input', ['gcyr:luna_marker']], ['input', ['minecraft:barrier']], ['catalyst', ['gtceu:data_orb']], ['catalyst', ['gtceu:data_stick']],
  ]);
  assert.deepEqual(conditionStacks([{ type: 'dimension', dimension: 't:moon' }], { dimensionMarkers: { 't:moon': 't:moon_marker' } })[0].alts, ['t:moon_marker']);
  const draw = gt('t:drilling/moon', 'gtceu:drilling', { ins: [gi('t:sample', 1, 0)], outs: [gi('t:ore')], conditions: [{ type: 'dimension', dimension: 'gcyr:luna' }] });
  const dump = mkDump({ recipes: [draw], items: ['gcyr:luna_marker'], tagsItem: { 't:hidden': ['gcyr:luna_marker'] } });
  const registry = reg({ items: ['t:sample'], types: ['gtceu:drilling'] });
  let res = audit({ dump, registry, emi: { ...noEmi, disabled: [parseEmiStack('#item:t:hidden')] }, cfg: { ...cfg0, exceptions: [{ id: 't:sample', role: 'acquisition', reason: 'x' }] } });
  assert.deepEqual(res.droppedRoutes, [{ id: 't:drilling/moon', type: 'gtceu:drilling', disabledBy: ['dimension marker gcyr:luna_marker (gcyr:luna)'], ours: ['t:sample'] }]);
  assert.deepEqual(gapsOf(res), { 't:sample': ['use'] });
  // index-only (c:hidden_from_recipe_viewers, keepRecipes): the recipe stays
  res = audit({ dump, registry, cfg: { ...cfg0, exceptions: [{ id: 't:sample', role: 'acquisition', reason: 'x' }] } });
  assert.deepEqual([res.droppedRoutes, res.gaps], [[], []]);
});
test('EMI ingredient text: item:, fluid:, #item: and a bare id', () => {
  assert.deepEqual(parseEmiStack('item:grindless:end_key'), { kind: 'item', id: 'grindless:end_key' });
  assert.deepEqual(parseEmiStack('fluid:gtceu:heavy_water'), { kind: 'fluid', id: 'gtceu:heavy_water' });
  assert.deepEqual(parseEmiStack('#item:grindless:vein_samples'), { kind: 'item', tag: 'grindless:vein_samples' });
  assert.deepEqual(parseEmiStack('minecraft:stone'), { kind: 'item', id: 'minecraft:stone' });
});

// ---------------------------------------------------------------- the stand-in, on a pack of its own

test('the stand-in runs a pack\'s scripts: table-driven registrations, tiers, GT ids, chances, tags, priority and translations', () => {
  const work = path.join(here, '..', '.work');
  fs.mkdirSync(work, { recursive: true });
  const pack = fs.mkdtempSync(path.join(work, 'kjs-pack-'));
  try {
    const w = (rel, text) => {
      fs.mkdirSync(path.dirname(path.join(pack, rel)), { recursive: true });
      fs.writeFileSync(path.join(pack, rel), text);
    };
    w('kubejs/data/t/tables/things.json', JSON.stringify({ things: [{ id: 'a' }, { id: 'b' }] }));
    w('kubejs/startup_scripts/b_items.js', `
      StartupEvents.registry('item', function (event) {
        global.T.things.forEach(function (t) { event.create('t:sample_' + t.id).tag('t:samples') })
      })
      GTCEuStartupEvents.registry('gtceu:recipe_type', function (event) { event.create('drilling').setEUIO('in') })
      GTCEuStartupEvents.registry('gtceu:machine', function (event) {
        event.create('drill', 'multiblock').recipeType('drilling')
        event.create('cell', 'simple').tiers(GTValues.LV, GTValues.MV).recipeType('drilling')
      })`);
    w('kubejs/startup_scripts/a_tables.js', `// priority: 10
      global.T = JSON.parse(JsonIO.toPrettyString(JsonIO.readJson('kubejs/data/t/tables/things.json')))`);
    w('kubejs/server_scripts/recipes.js', `
      ServerEvents.recipes(function (event) {
        event.recipes.gtceu.drilling('t:a').notConsumable('t:sample_a').chancedInput('t:bit', 500, 0).itemOutputs('2x t:ore').inputFluids(Fluid.of('t:water', 100)).EUt(8)
        event.shapeless('2x t:sample_b', ['t:sample_b', '#forge:paper']).id('t:crafting/copy')
      })`);
    w('kubejs/client_scripts/lang.js', `ClientEvents.lang('en_us', function (event) { event.add('t', 'k.0', 'Hello') })`);
    const run = runPackScripts(pack);
    assert.deepEqual(run.errors, []);
    assert.deepEqual([...run.registry.items.keys()], ['t:sample_a', 't:sample_b']);
    assert.deepEqual([...run.registry.machines.keys()].sort(), ['gtceu:drill', 'gtceu:lv_cell', 'gtceu:mv_cell']);
    assert.deepEqual(run.docs.tags.item['t:samples'], ['t:sample_a', 't:sample_b']);
    const ids = run.docs.recipes.recipes.map((r) => r.i);
    assert.deepEqual(ids, ['t:drilling/a', 't:crafting/copy'], 'GTM puts the recipe type in front of the id');
    const drill = run.docs.recipes.recipes[0].j;
    assert.deepEqual(drill.inputs.item.map((c) => [c.content.ingredient.item, c.chance]), [['t:sample_a', 0], ['t:bit', 500]]);
    assert.deepEqual(drill.outputs.item[0].content, { type: 'gtceu:sized', count: 2, ingredient: { item: 't:ore' } });
    assert.deepEqual(drill.inputs.fluid[0].content, { amount: 100, value: [{ fluid: 't:water' }] });
    assert.equal(run.lang.en_us['k.0'], 'Hello');
  } finally {
    fs.rmSync(pack, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- the pack

const packRun = runCoverage();

test('the stand-in runs every script of the pack without an exception', () => {
  const thrown = packRun.res.standInErrors.filter((e) => e.stage !== 'console.error');
  assert.deepEqual(thrown, [], thrown.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.ok(packRun.run.registry.items.size > 100 && packRun.run.registry.machines.size > 100, 'the registrations were read');
  assert.ok(packRun.dump.recipes.size > 900, 'the recipes were read');
  assert.ok(packRun.dump.structures.size > 60, 'the patterns were read');
});

test('EMI shows how every item, block, fluid and machine of the pack is obtained and, for intermediates, used', () => {
  const { res } = packRun;
  assert.deepEqual({ gaps: res.gaps.map((g) => g.key), problems: res.problems }, { gaps: [], problems: [] }, renderCoverageText(res));
  assert.ok(res.counts.audited > 250);
  assert.deepEqual(res.droppedRoutes, []);
  // the families of the bug report: every chart is made by its observation (a GT recipe EMI shows) and used by the next step or a
  // rocket part, every vein sample is used by a GT drilling or leaching recipe; no page stands in for them
  const gtRecipe = (list) => list.some((m) => m.source === 'recipe' && m.category.startsWith('gtceu:'));
  const charts = res.results.filter((x) => /_chart$|chart_draft$|lunar_map$|lunar_ephemeris$|vlbi_recording$/.test(x.key));
  const samples = res.results.filter((x) => x.key.startsWith('grindless:vein_sample_'));
  assert.equal(charts.length, 11);
  assert.ok(samples.length > 40);
  // LuV B9: the Saturn Transfer Chart is made by the coilgun (a GT recipe) and is the ZPM trip: until ZPM its use is its copy and a page
  const nextEra = new Set(['grindless:saturn_transfer_chart']);
  // ZPM-A9: the Pluto-Kuiper chart is decoded from B5's flyby recordings and is UV's trip (an end product): no GT use until UV
  const pending = new Set(['grindless:pluto_kuiper_chart']);
  for (const r of charts.filter((x) => !pending.has(x.key))) {
    // an info page lists its stack as both made and used, so the chart's page shows on both sides
    assert.ok(gtRecipe(r.made) && (nextEra.has(r.key) || !r.made.some((m) => m.source === 'page')), r.key);
    assert.ok(nextEra.has(r.key) ? r.used.some((m) => m.source === 'page') : gtRecipe(r.used), r.key);
  }
  for (const r of samples) assert.ok(gtRecipe(r.used) && !r.used.some((m) => m.source === 'page'), r.key);
});

test('the dimension markers of the old hidden table (disabled, not index-only) drop the 47 planet and End routes the native EMI run found', () => {
  // before d6ee7d4 hidden_until.json disabled GTM's and GCYR's seven dimension markers; that change is the only one of the table, so
  // disabling them again reproduces it. Native run 20261026-024353-client-44b found 47 missing routes.
  const { dump, run } = packRun;
  const emi = loadEmiData(path.join(root, 'pack'));
  emi.disabled = [...emi.disabled, ...Object.values(DIMENSION_MARKERS).map((id) => ({ kind: 'item', id }))];
  const old = auditEmiCoverage({ dump, registry: run.registry, cfg: JSON.parse(fs.readFileSync(path.join(here, '..', 'emi_coverage.json'), 'utf8')), emi, lang: run.lang });
  assert.equal(old.droppedRoutes.length, 38, old.droppedRoutes.map((d) => d.id).join('\n'));
  assert.ok(old.droppedRoutes.every((d) => d.disabledBy.every((b) => b.startsWith('dimension marker '))));
  const now = new Map(fixtureExpectations(packRun.res).items.map((e) => [e.id, e]));
  const lost = [];
  for (const e of fixtureExpectations(old).items) {
    const was = now.get(e.id);
    for (const role of ['made', 'used']) for (const c of was[role]) if (!e[role].includes(c)) lost.push(`${e.id} ${role} in ${c}`);
  }
  assert.equal(lost.length, 47, lost.join('\n'));
  for (const route of ['grindless:mars_chart made in gtceu:deep_space_tracking', 'grindless:vein_sample_ice_mars used in gtceu:vein_drilling',
    'gtceu:liquid_nitrogen made in gtceu:cryogenic_processing', 'gtceu:heavy_water made in gtceu:detritiation',
    'grindless:titanium_drill_bit used in gtceu:vein_drilling', 'grindless:martian_quantum_seed made in gtceu:chemical_reactor']) {
    assert.ok(lost.includes(route), route);
  }
  assert.ok(old.gaps.length > 0 && old.problems.length >= old.droppedRoutes.length, 'the audit fails on it');
});

test('our info pages live where EMI reads them (the emi namespace) and every page is used', () => {
  const emi = loadEmiData(path.join(root, 'pack'));
  assert.deepEqual(emi.problems, []);
  assert.ok(emi.pages.length >= 10);
  for (const p of emi.pages) assert.match(p.file, /^recipe\/additions\/grindless\/[a-z_]+\.json$/);
  const used = new Set(fixtureExpectations(packRun.res).pages);
  for (const p of emi.pages) assert.ok(used.has(p.id), p.file + ' covers no audited stack');
});

test('the native fixture\'s expectations are current (node tools/analysis/emi-coverage.mjs --expect)', () => {
  const want = renderExpectations(fixtureExpectations(packRun.res));
  assert.equal(fs.readFileSync(DEFAULT_EXPECT, 'utf8').replace(/\r\n/g, '\n'), want);
});

// ---------------------------------------------------------------- the native fixture

const clientFixture = fs.readFileSync(path.join(overlay, 'client_scripts', 'gg_test_emi_coverage.js'), 'utf8');
const serverFixture = fs.readFileSync(path.join(overlay, 'server_scripts', 'gg_test_emi_coverage.js'), 'utf8');
const codeOnly = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/'(?:\\.|[^'\\\n])*'/g, "''");

test('the fixture is ES5 for Rhino, valid, disabled by default, and read-only (no clicks, no teleports, no blocks)', () => {
  for (const src of [clientFixture, serverFixture]) {
    assert.doesNotMatch(codeOnly(src), /\b(const|let|class)\b|=>|`/);
    assert.doesNotThrow(() => new vm.Script(src));
    assert.doesNotMatch(codeOnly(src), /setDown|teleport|setBlock|\.runCommand|keyUse/);
  }
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(overlay, 'config', 'gg_test_emi_coverage.json'), 'utf8')), { enabled: false });
  assert.match(clientFixture, /GGTEST\|emi_coverage\|/);
});

test('the fixture\'s integration hook arms the client half and acknowledges the server side, like the serial dispatcher expects', () => {
  class SharedMap extends Map {
    get(k) { return super.has(k) ? super.get(k) : null; }
    put(k, v) { this.set(k, v); return null; }
  }
  const logs = [];
  const ticks = [];
  const global = {};
  const ctx = {
    global, console: { info: (s) => logs.push(s) }, Java: { loadClass: () => SharedMap },
    JsonIO: { readJson: () => null, toPrettyString: (x) => JSON.stringify(x) },
    ClientEvents: { tick: (fn) => ticks.push(fn) }, Client: { player: null }, Date,
  };
  vm.runInNewContext(serverFixture, ctx);
  vm.runInNewContext(clientFixture, ctx);
  assert.equal(typeof global.ggTestEmiCoverageStart, 'function');
  ticks.forEach((fn) => fn({}));
  assert.equal(logs.length, 0, 'asleep without its marker or the dispatcher');
  global.ggTestEmiCoverageStart({});
  assert.equal(String(global.ggEmiCoverage.get('serverDone')), 'true');
  assert.equal(String(global.ggEmiCoverage.get('requested')), 'true');
  ctx.Client.player = { age: 5 };
  global.ggEmiCoverage.put('cancel', 'test');
  ticks.forEach((fn) => fn({}));
  assert.equal(String(global.ggEmiCoverage.get('clientDone')), 'true');
  assert.equal(String(global.ggEmiCoverage.get('failed')), 'true');
  assert.ok(logs.some((l) => /^GGTEST\|emi_coverage\|all\|FAIL\|cancelled/.test(l)) && logs.at(-1) === 'GGTEST|emi_coverage|DONE', logs.join('\n'));
});

// A stand-in EMI built from the expectations themselves (every route present), so the fixture's own checks run here: all PASS, then
// one intermediate loses its uses, one route and one page go missing, and an unaudited item appears.
function simulateFixture(exp, { dropUsesOf = null, dropRoute = null, dropPage = null, extraItem = null } = {}) {
  const recipes = [];
  const rec = (id, cat, ins, outs) => recipes.push({ id, cat, ins: new Set(ins), outs: new Set(outs) });
  let n = 0;
  for (const e of exp.items) {
    for (const cat of e.made) if (!(dropRoute && dropRoute.id === e.id && dropRoute.cat === cat)) rec('sim:r' + n++, cat, [], [e.id]);
    if (e.id !== dropUsesOf) for (const cat of e.used) if (!(dropRoute && dropRoute.id === e.id && dropRoute.cat === cat)) rec('sim:r' + n++, cat, [e.id], []);
  }
  for (const p of exp.pages) if (p !== dropPage) rec(p, 'emi:info', [], []);
  for (const l of exp.legacy) for (const c of l.conversions) rec(c, 'minecraft:crafting', [l.id], []);
  const wrap = (r) => ({ getId: () => (r.id.startsWith('sim:') ? null : { toString: () => r.id }), getCategory: () => ({ getId: () => ({ toString: () => r.cat }) }) });
  const list = (arr) => Object.assign(arr.slice(), { size() { return this.length; }, get(i) { return this[i]; } });
  const rm = {
    getRecipesByOutput: (s) => recipes.filter((r) => r.outs.has(s.id)).map(wrap),
    getRecipesByInput: (s) => recipes.filter((r) => r.ins.has(s.id)).map(wrap),
    getRecipe: (rl) => { const r = recipes.find((x) => x.id === String(rl)); return r ? wrap(r) : null; },
    getRecipes: () => recipes.map(wrap),
  };
  const items = new Set(exp.items.filter((e) => e.kind === 'item').map((e) => e.id).concat(exp.legacy.map((l) => l.id)));
  if (extraItem) items.add(extraItem);
  const fluids = new Set(exp.items.filter((e) => e.kind === 'fluid').map((e) => e.id));
  class RL { constructor(s) { this.s = String(s); } toString() { return this.s; } }
  const classes = {
    'net.minecraft.resources.ResourceLocation': RL,
    'net.minecraft.core.registries.BuiltInRegistries': {
      ITEM: { keySet: () => [...items].map((i) => new RL(i)), containsKey: (rl) => items.has(String(rl)) },
      FLUID: { containsKey: (rl) => fluids.has(String(rl)), get: (rl) => String(rl) },
    },
    'dev.emi.emi.api.stack.ItemEmiStack': class { constructor(st) { this.id = st.id; } },
    'dev.emi.emi.api.stack.FluidEmiStack': class { constructor(fl) { this.id = fl; } },
    'dev.emi.emi.api.EmiApi': { getRecipeManager: () => rm },
    'dev.emi.emi.registry.EmiStackList': { stacks: [...items].filter((i) => !exp.legacy.some((l) => l.id === i)).map((i) => ({ getId: () => i })) },
    'dev.emi.emi.runtime.EmiReloadManager': { isLoaded: () => true },
    'java.util.ArrayList': function (x) { return list(Array.from(x)); },
    'com.google.gson.JsonParser': { parseString: (s) => JSON.parse(s) },
    'net.minecraft.FileUtil': { createDirectoriesSafe: (dir) => { assert.equal(dir, 'kubejs/exported'); } },
  };
  const logs = [];
  const written = {};
  const ticks = [];
  const ctx = {
    global: {}, console: { info: (s) => logs.push(s) }, Date, Client: { player: { age: 90 } },
    Java: { loadClass: (name) => classes[name] },
    Item: { of: (id) => ({ id }) },
    JsonIO: {
      readJson: (p) => (p === 'kubejs/config/gg_test_emi_coverage.json' ? { enabled: true } : p === 'kubejs/config/gg_test_emi_coverage_expect.json' ? exp : null),
      toPrettyString: (x) => JSON.stringify(x),
      write: (p, x) => { written[p] = x; },
    },
    ClientEvents: { tick: (fn) => ticks.push(fn) },
  };
  vm.runInNewContext(clientFixture, ctx);
  ticks.forEach((fn) => fn({}));
  const status = Object.fromEntries(logs.filter((l) => l.split('|').length >= 4).map((l) => l.split('|')).map((p) => [p[2], p[3]]));
  return { logs, status, report: written['kubejs/exported/gg_emi_coverage_report.json'], player: ctx.Client.player };
}

test('the fixture\'s checks, against a stand-in EMI: all PASS when every expected route is there, and each kind of gap is caught', () => {
  const exp = JSON.parse(fs.readFileSync(DEFAULT_EXPECT, 'utf8'));
  let sim = simulateFixture(exp);
  assert.deepEqual(sim.status, {
    client_hold: 'NOTE', emi_loaded: 'PASS', expectations: 'NOTE', registry: 'PASS', acquisition: 'PASS', use: 'PASS', routes: 'PASS',
    preview_routes: 'NOTE', pages: 'PASS', legacy: 'PASS', all: 'PASS',
  }, sim.logs.join('\n'));
  assert.equal(sim.logs.at(-1), 'GGTEST|emi_coverage|DONE');
  assert.equal(sim.player.age, 20, 'standalone, it keeps mc-runtime-test in the world');
  assert.equal(sim.report.items.length, exp.items.length);

  const sample = exp.items.find((e) => e.id === 'grindless:vein_sample_ilmenite_moon');
  assert.ok(sample.needUse && sample.used.includes('gtceu:vein_drilling') && !sample.used.includes('emi:info'));
  sim = simulateFixture(exp, { dropUsesOf: sample.id, dropPage: exp.pages[0], extraItem: 'grindless:not_audited',
    dropRoute: { id: 'grindless:mars_chart', cat: 'gtceu:deep_space_tracking' } });
  assert.equal(sim.status.use, 'FAIL');
  assert.equal(sim.status.routes, 'FAIL');
  assert.equal(sim.status.pages, 'FAIL');
  assert.equal(sim.status.registry, 'FAIL');
  assert.equal(sim.status.all, 'FAIL');
  assert.ok(sim.logs.some((l) => l.includes('grindless:mars_chart made in gtceu:deep_space_tracking')), sim.logs.join('\n'));
  assert.ok(sim.logs.some((l) => l.includes('none for: ' + sample.id)));
});