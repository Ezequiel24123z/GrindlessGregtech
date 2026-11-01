// The cost-curve rule (pack/kubejs/server_scripts/grindless/integration/cost_curve.js), the Node side that applies it to a dump
// (lib/cost_curve.mjs) and the static stand-in that runs the pack's pass (RF-2A). T0: local and deterministic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadRule, loadTables, withFactors, applyToDump, applyToRecipes, TABLE_DIR, PASS_FILE } from '../lib/cost_curve.mjs';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { gt, gi, gtag, gf, mkDump } from './helpers.mjs';

const rule = loadRule();
// the rule lives in another realm: compare plain copies
const plain = (x) => JSON.parse(JSON.stringify(x));

const table = (era, over = {}) => ({ era, enabled: true, item: 2, fluid: 2, keys: [], include: [], exclude: [], remove: [], override: {}, ...over });

const sizedIn = (id, count, extra = {}) => ({ content: { type: 'gtceu:sized', count, ingredient: { item: id } }, chance: 10000, maxChance: 10000, tierChanceBoost: 0, ...extra });
const fluidIn = (id, amount, extra = {}) => ({ content: { amount, value: [{ fluid: id }] }, chance: 10000, maxChance: 10000, tierChanceBoost: 0, ...extra });
const outItem = (id, count = 1) => ({ content: { type: 'gtceu:sized', count, ingredient: { item: id } }, chance: 10000, maxChance: 10000, tierChanceBoost: 0 });

function recipe(id, { ins = [], fins = [], outs = ['gtceu:mv_machine_hull'], eut = 30, type = 'gtceu:assembler', duration = 100, tick } = {}) {
  return {
    id, type,
    json: {
      type, duration,
      inputs: { item: ins, fluid: fins },
      outputs: { item: outs.map((o) => outItem(o)), fluid: [] },
      tickInputs: tick || { eu: [{ content: eut, chance: 10000, maxChance: 10000, tierChanceBoost: 0 }] },
      tickOutputs: { eu: [] },
      recipeConditions: [],
    },
  };
}

test('scaledCount rounds to the nearest count, half up, without float noise, and caps at an int', () => {
  assert.equal(rule.scaledCount(10, 1.1), 11);
  assert.equal(rule.scaledCount(10, 1.15), 12, '11.499999999999998 in doubles is 11.5');
  assert.equal(rule.scaledCount(3, 2.5), 8);
  assert.equal(rule.scaledCount(4, 2.5), 10);
  assert.equal(rule.scaledCount(7, 1), 7);
  assert.equal(rule.scaledCount(1000, 1.0001), 1000);
  assert.equal(rule.scaledCount(2e9, 5), 2147483647);
});

test('scaledCount has no cliff at the first factor above 1: a count moves only when its own step is reached, and never shrinks', () => {
  assert.equal(rule.scaledCount(1, 1.001), 1);
  assert.equal(rule.scaledCount(1, 1.49), 1);
  assert.equal(rule.scaledCount(1, 1.5), 2);
  assert.equal(rule.scaledCount(2, 1.24), 2);
  assert.equal(rule.scaledCount(2, 1.25), 3);
  assert.equal(rule.scaledCount(144, 1.001), 144);
  for (const n of [1, 2, 3, 5, 16, 64, 144, 1000]) for (const f of [1, 1.001, 1.3, 2, 7.77]) assert.ok(rule.scaledCount(n, f) >= n, `${n} x ${f}`);
});

test('tierOfEut gives the lowest tier whose voltage covers the EU/t', () => {
  assert.equal(rule.tierOfEut(8), 'ulv');
  assert.equal(rule.tierOfEut(32), 'lv');
  assert.equal(rule.tierOfEut(128), 'mv');
  assert.equal(rule.tierOfEut(129), 'hv');
  assert.equal(rule.tierOfEut(2000000000), 'max');
  assert.equal(rule.tierOfEut(null), null);
});

test('scaleRecipe changes consumed inputs only: amounts of items and fluids, never outputs, time or power', () => {
  const r = recipe('t:a', {
    ins: [
      sizedIn('x:plate', 3),
      sizedIn('x:cat', 2, { chance: 0 }),
      sizedIn('x:maybe', 4, { chance: 5000 }),
      { content: { type: 'gtceu:circuit', configuration: 2 }, chance: 0, maxChance: 10000, tierChanceBoost: 0 },
      { content: { item: 'x:plain' }, chance: 10000, maxChance: 10000, tierChanceBoost: 0 },
    ],
    fins: [fluidIn('gtceu:water', 1000), fluidIn('gtceu:lube', 100, { chance: 0 })],
    outs: ['gtceu:mv_machine_hull'],
  });
  const res = plain(rule.scaleRecipe(plain(r.json), 2.5, 3));
  assert.equal(res.changed, true);
  assert.equal(res.items, 2);
  assert.equal(res.fluids, 1);
  const ins = res.json.inputs.item;
  assert.equal(ins[0].content.count, 8);
  assert.equal(ins[1].content.count, 2, 'a catalyst (chance 0) stays');
  assert.equal(ins[2].content.count, 4, 'a partial chance stays');
  assert.deepEqual(ins[3], r.json.inputs.item[3], 'a programmed circuit stays');
  assert.deepEqual(ins[4].content, { type: 'gtceu:sized', count: 3, ingredient: { item: 'x:plain' } }, 'a plain item is one item, wrapped as sized');
  assert.equal(res.json.inputs.fluid[0].content.amount, 3000);
  assert.equal(res.json.inputs.fluid[1].content.amount, 100);
  assert.deepEqual(res.json.outputs, r.json.outputs);
  assert.deepEqual(res.json.tickInputs, r.json.tickInputs);
  assert.equal(res.json.duration, 100);
  assert.equal(r.json.inputs.item[0].content.count, 3, 'the input recipe is not modified');
});

test('scaleRecipe at factor 1 changes nothing', () => {
  const r = recipe('t:b', { ins: [sizedIn('x:plate', 3)], fins: [fluidIn('gtceu:water', 1000)] });
  const res = plain(rule.scaleRecipe(plain(r.json), 1, 1));
  assert.equal(res.changed, false);
  assert.deepEqual(res.json, r.json);
});

test('selection: the era is the key item the recipe makes; include falls back to the EU/t tier; exclude and override', () => {
  const sel = rule.makeSelector([
    table('mv', { keys: ['gtceu:mv_machine_hull', 'gtceu:*_wire'] }),
    table('hv', { keys: ['gtceu:hv_machine_hull'], include: ['gtceu:assembler/tier_*'], exclude: ['gtceu:assembler/skip_*'], override: { 'gtceu:assembler/to_ev': 'ev', 'gtceu:assembler/to_none': 'none' } }),
    table('ev', { enabled: false, item: 1, fluid: 1 }),
  ]);
  const hull = recipe('gtceu:assembler/h', { outs: ['gtceu:mv_machine_hull'], eut: 2000 });
  assert.deepEqual(plain(sel.select(hull.id, hull.json)), { era: 'mv', via: 'key', enabled: true, item: 2, fluid: 2 });
  const wire = recipe('gtceu:assembler/w', { outs: ['gtceu:tin_wire'] });
  assert.equal(sel.select(wire.id, wire.json).era, 'mv', 'a glob key');
  const other = recipe('gtceu:assembler/other', { outs: ['x:thing'], eut: 400 });
  assert.equal(sel.select(other.id, other.json), null, 'not a key item, not included');
  const inc = recipe('gtceu:assembler/tier_one', { outs: ['x:thing'], eut: 400 });
  assert.deepEqual(plain(sel.select(inc.id, inc.json)), { era: 'hv', via: 'include', enabled: true, item: 2, fluid: 2 });
  const incLow = recipe('gtceu:assembler/tier_low', { outs: ['x:thing'], eut: 30 });
  assert.equal(sel.select(incLow.id, incLow.json), null, 'include never reaches below MV');
  const skip = recipe('gtceu:assembler/skip_hull', { outs: ['gtceu:hv_machine_hull'] });
  assert.equal(sel.select(skip.id, skip.json), null, 'exclude drops a keyed recipe');
  const toEv = recipe('gtceu:assembler/to_ev', { outs: ['gtceu:hv_machine_hull'] });
  const s = sel.select(toEv.id, toEv.json);
  assert.equal(s.era, 'ev');
  assert.equal(s.enabled, false, 'the table of the new era decides');
  const toNone = recipe('gtceu:assembler/to_none', { outs: ['gtceu:hv_machine_hull'] });
  assert.equal(sel.select(toNone.id, toNone.json), null);
  const craft = { type: 'minecraft:crafting_shaped', pattern: ['A'], key: {}, result: { item: 'gtceu:mv_machine_hull' } };
  assert.equal(sel.select('minecraft:x', craft), null, 'only GT machine recipes are scaled');
  // a recipe a script added dumps as type "unknown" even after serialize(): the recipe type comes from the event
  const added = recipe('grindless:assembler/ours', { outs: ['gtceu:mv_machine_hull'] });
  added.json.type = 'unknown';
  assert.equal(sel.select(added.id, added.json), null, 'no type, no selection');
  assert.equal(sel.select(added.id, added.json, 'gtceu:assembler').era, 'mv');
  assert.equal(sel.select(added.id, added.json, 'minecraft:crafting_shaped'), null);
  const res = applyToRecipes([{ id: added.id, type: 'gtceu:assembler', json: added.json }], [table('mv', { keys: ['gtceu:mv_machine_hull'] })]);
  assert.equal(res.selected.length, 1, 'the Node bridge passes rec.type');
});

test('remove ids apply only for an enabled table', () => {
  assert.deepEqual(plain(rule.makeSelector([table('mv', { remove: ['a:b'] })]).removeIds), ['a:b']);
  assert.deepEqual(plain(rule.makeSelector([table('mv', { enabled: false, remove: ['a:b'] })]).removeIds), []);
});

test('validateTable names every problem', () => {
  assert.deepEqual(plain(rule.validateTable(table('mv'), 'mv')), []);
  assert.match(rule.validateTable(table('lv'), 'lv').join(';'), /era lv is not one of/);
  assert.match(rule.validateTable(table('mv'), 'hv').join(';'), /in the file of hv/);
  assert.match(rule.validateTable(table('mv', { item: 0.5 }), 'mv').join(';'), /item must be/);
  assert.match(rule.validateTable(table('mv', { fluid: 'x' }), 'mv').join(';'), /fluid must be/);
  assert.match(rule.validateTable(table('mv', { enabled: 1 }), 'mv').join(';'), /enabled must be/);
  assert.match(rule.validateTable(table('mv', { keys: 'a' }), 'mv').join(';'), /keys must be a list/);
  assert.match(rule.validateTable(table('mv', { override: { a: 'lv' } }), 'mv').join(';'), /override a: lv/);
});

test('the committed tables are valid; with every table forced to enabled:false the mechanism changes nothing', () => {
  const { tables, problems } = loadTables(TABLE_DIR);
  assert.deepEqual(problems, []);
  assert.deepEqual(tables.map((t) => t.era), plain(rule.eras));
  for (const t of tables) {
    assert.ok(t.item >= 1 && t.fluid >= 1, `${t.era} factors are at least 1`);
    assert.ok(t.keys.length > 0, `${t.era} lists its key items`);
    assert.ok(!t.keys.some((k) => /^gtceu:(ulv|lv)_/.test(k)), `${t.era} has no ULV or LV key`);
  }
  const hull = recipe('gtceu:assembler/mv_hull', { ins: [sizedIn('x:plate', 3)], fins: [fluidIn('gtceu:water', 1000)], outs: ['gtceu:mv_machine_hull'] });
  const dump = mkDump({ recipes: [hull] });
  const res = applyToDump(dump, tables.map((t) => ({ ...t, enabled: false })));
  assert.equal(res.changed.size, 0);
  assert.equal(res.removed.size, 0);
  assert.equal(res.recipes.get(hull.id), dump.recipes.get(hull.id));
});

test('an enabled committed table applies exactly its committed factors', () => {
  const { tables } = loadTables(TABLE_DIR);
  const on = tables.filter((t) => t.enabled);
  for (const t of on) {
    const hull = recipe(`gtceu:assembler/${t.era}_hull`, { ins: [sizedIn('x:plate', 3)], fins: [fluidIn('gtceu:water', 1000)], outs: [`gtceu:${t.era}_machine_hull`] });
    const res = applyToDump(mkDump({ recipes: [hull] }), tables);
    const j = res.recipes.get(hull.id).json;
    assert.equal(j.inputs.item[0].content.count, rule.scaledCount(3, t.item), t.era);
    assert.equal(j.inputs.fluid[0].content.amount, rule.scaledCount(1000, t.fluid), t.era);
  }
  for (const t of tables.filter((x) => !x.enabled)) {
    const hull = recipe(`gtceu:assembler/${t.era}_hull`, { ins: [sizedIn('x:plate', 3)], outs: [`gtceu:${t.era}_machine_hull`] });
    assert.equal(applyToDump(mkDump({ recipes: [hull] }), tables).changed.size, 0, t.era);
  }
});

test('an era with a factor above 1 changes exactly the selected recipes, to round(n x f)', () => {
  const { tables } = loadTables(TABLE_DIR);
  const hull = recipe('gtceu:assembler/mv_hull', { ins: [sizedIn('x:plate', 3)], fins: [fluidIn('gtceu:water', 1000)], outs: ['gtceu:mv_machine_hull'] });
  const unrelated = recipe('gtceu:assembler/unrelated', { ins: [sizedIn('x:plate', 3)], outs: ['x:widget'], eut: 30 });
  const dump = mkDump({ recipes: [hull, unrelated] });
  const res = applyToDump(dump, withFactors(tables, { mv: { item: 2.5, fluid: 3 } }));
  assert.deepEqual([...res.changed.keys()], [hull.id]);
  const j = res.recipes.get(hull.id).json;
  assert.equal(j.inputs.item[0].content.count, 8);
  assert.equal(j.inputs.fluid[0].content.amount, 3000);
  assert.equal(res.recipes.get(unrelated.id), dump.recipes.get(unrelated.id));
  assert.equal(res.byEra.mv.changed, 1);
});


test('the static stand-in runs the pack pass: originals and added recipes end up as lib/cost_curve.mjs predicts', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cost-curve-'));
  try {
    const pack = path.join(root, 'pack');
    const scripts = path.join(pack, 'kubejs', 'server_scripts');
    const tables = path.join(pack, 'kubejs', 'data', 'grindless', 'tables', 'cost_curve');
    fs.mkdirSync(scripts, { recursive: true });
    fs.mkdirSync(tables, { recursive: true });
    fs.writeFileSync(path.join(scripts, 'cost_curve.js'), fs.readFileSync(PASS_FILE, 'utf8'));
    fs.writeFileSync(path.join(scripts, 'add.js'), `ServerEvents.recipes(event => {
  event.recipes.gtceu.assembler('mv_hull_ours')
    .itemInputs('3x x:plate', 'x:plain')
    .notConsumable('x:mold')
    .circuit(2)
    .inputFluids('gtceu:water 1000')
    .itemOutputs('gtceu:mv_machine_hull')
    .duration(100).EUt(30)
  event.recipes.gtceu.assembler('mv_widget_ours')
    .itemInputs('3x x:plate')
    .itemOutputs('x:widget')
    .duration(100).EUt(30)
})\n`);
    const writeTables = (list) => list.forEach((t) => fs.writeFileSync(path.join(tables, `${t.era}.json`), JSON.stringify(t)));
    const real = loadTables(TABLE_DIR).tables;
    const mkOriginals = () => [
      recipe('gtceu:assembler/mv_hull_gtm', { ins: [sizedIn('x:plate', 4)], fins: [fluidIn('gtceu:lube', 40)], outs: ['gtceu:mv_machine_hull'] }),
      recipe('gtceu:assembler/hv_hull_gtm', { ins: [sizedIn('x:plate', 5)], outs: ['gtceu:hv_machine_hull'], eut: 120 }),
      recipe('gtceu:assembler/untouched', { ins: [sizedIn('x:plate', 4)], outs: ['x:widget'] }),
      { id: 'minecraft:crafting_table', type: 'minecraft:crafting_shaped', json: { type: 'minecraft:crafting_shaped', pattern: ['A'], key: {}, result: { item: 'gtceu:mv_machine_hull' } } },
    ].map((r) => ({ i: r.id, t: r.type, j: plain(r.json) }));

    // every table forced off: nothing is rewritten
    writeTables(real.map((t) => ({ ...t, enabled: false })));
    const off = runPackScripts(pack, { originals: mkOriginals() });
    assert.deepEqual(off.errors, []);
    assert.equal(off.originalsChanged.size, 0);
    const base = off.docs.recipes.recipes.map((r) => ({ id: r.i, json: plain(r.j) }));
    assert.equal(base.length, 2);

    // the committed tables as they are: each enabled era applies its committed item factor to the hull original
    writeTables(real);
    const committed = runPackScripts(pack, { originals: mkOriginals() });
    assert.deepEqual(committed.errors, []);
    const eraOn = (era) => real.find((t) => t.era === era && t.enabled);
    for (const [era, id, n] of [['mv', 'gtceu:assembler/mv_hull_gtm', 4], ['hv', 'gtceu:assembler/hv_hull_gtm', 5]]) {
      const t = eraOn(era);
      const got = committed.originalsChanged.get(id);
      if (t) assert.equal(got.inputs.item[0].content.count, rule.scaledCount(n, t.item), id);
      else assert.equal(got, undefined, id);
    }

    // two eras on: the pass and the Node rule agree, recipe by recipe
    const on = withFactors(real, { mv: { item: 2.5, fluid: 3 }, hv: { item: 4, fluid: 4 } });
    writeTables(on);
    const originals = mkOriginals();
    const run = runPackScripts(pack, { originals });
    assert.deepEqual(run.errors, []);

    const expectAdded = applyToRecipes(base, on);
    assert.deepEqual([...expectAdded.changed.keys()].sort(), base.map((r) => r.id).filter((id) => id.endsWith('mv_hull_ours')));
    for (const r of run.docs.recipes.recipes) {
      const want = expectAdded.changed.get(r.i) || base.find((b) => b.id === r.i).json;
      assert.deepEqual(plain(r.j), want, r.i);
    }
    const ours = run.docs.recipes.recipes.find((r) => r.i.endsWith('mv_hull_ours')).j;
    assert.equal(ours.inputs.item[0].content.count, 8);
    assert.equal(ours.inputs.item[1].content.count, 3, 'the plain item is wrapped and scaled');
    assert.equal(ours.inputs.item[2].chance, 0, 'the mold stays a catalyst');
    assert.equal(ours.inputs.fluid[0].content.amount, 3000);

    const orig = mkOriginals().map((o) => ({ id: o.i, json: plain(o.j) }));
    const expectOrig = applyToRecipes(orig, on);
    assert.deepEqual([...run.originalsChanged.keys()].sort(), [...expectOrig.changed.keys()].sort());
    assert.deepEqual([...run.originalsChanged.keys()].sort(), ['gtceu:assembler/hv_hull_gtm', 'gtceu:assembler/mv_hull_gtm']);
    for (const [id, j] of run.originalsChanged) assert.deepEqual(plain(j), expectOrig.changed.get(id), id);
    assert.equal(run.originalsChanged.get('gtceu:assembler/mv_hull_gtm').inputs.item[0].content.count, 10);
    assert.equal(run.originalsChanged.get('gtceu:assembler/hv_hull_gtm').inputs.item[0].content.count, 20);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
