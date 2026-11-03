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

test('scaledCount without a key rounds half up, without float noise, and caps at an int', () => {
  assert.equal(rule.scaledCount(10, 1.1), 11);
  assert.equal(rule.scaledCount(10, 1.15), 12, '11.499999999999998 in doubles is 11.5');
  assert.equal(rule.scaledCount(3, 2.5), 8);
  assert.equal(rule.scaledCount(4, 2.5), 10);
  assert.equal(rule.scaledCount(7, 1), 7);
  assert.equal(rule.scaledCount(1000, 1.0001), 1000);
  assert.equal(rule.scaledCount(2e9, 5), 2147483647);
});

test('scaledCount dithers by key: exact at whole products, never below n, monotone in f, unbiased over keys, no cliff at the first factor above 1', () => {
  const keys = Array.from({ length: 4000 }, (_, i) => `x:item_${i}`);
  for (const k of keys.slice(0, 50)) {
    assert.equal(rule.scaledCount(3, 2, k), 6, 'a whole product needs no dither');
    assert.equal(rule.scaledCount(5, 1, k), 5);
    let last = 0;
    for (let f = 1; f <= 4; f += 0.01) {
      const m = rule.scaledCount(2, f, k);
      assert.ok(m >= last && m >= 2 && m <= Math.ceil(2 * f), `${k} f=${f}`);
      last = m;
    }
    assert.equal(rule.scaledCount(2, 1.3, k), rule.scaledCount(2, 1.3, k), 'same key, same result');
  }
  const mean = (n, f) => keys.reduce((s, k) => s + rule.scaledCount(n, f, k), 0) / keys.length;
  assert.ok(Math.abs(mean(1, 1.3) - 1.3) < 0.04, `a count of 1 at 1.3 averages ${mean(1, 1.3)}`);
  assert.ok(Math.abs(mean(3, 1.2) - 3.6) < 0.06, `a count of 3 at 1.2 averages ${mean(3, 1.2)}`);
  assert.ok(Math.abs(mean(1, 1.001) - 1.001) < 0.01, 'a count of 1 at 1.001 hardly moves (ceil made it 2)');
});

test('the threshold hash uses no charCodeAt (the pack Rhino returns a character from it, so the hash was NaN and nothing rounded up)', () => {
  const src = fs.readFileSync(PASS_FILE, 'utf8').replace(/\/\/.*$/gm, '');
  assert.ok(!/charCodeAt|codePointAt/.test(src));
  assert.equal(rule.scaledCount(1, 1.77, 'gtceu:hv_motor'), 2);
  assert.equal(rule.scaledCount(1, 1.77, '#forge:plates/steel'), 1);
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
  const res = plain(rule.scaleRecipe(plain(r.json), 3, 3));
  assert.equal(res.changed, true);
  assert.equal(res.items, 2);
  assert.equal(res.fluids, 1);
  const ins = res.json.inputs.item;
  assert.equal(ins[0].content.count, 9);
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

test('an ordered type (the assembly line) gets each input over a stack as entries of at most 64, in place, with the same total', () => {
  assert.equal(rule.isOrdered('gtceu:assembly_line'), true);
  assert.equal(rule.isOrdered('gtceu:assembler'), false);
  const r = recipe('gtceu:assembly_line/m', { type: 'gtceu:assembly_line', ins: [sizedIn('x:frame', 1), sizedIn('x:fine_wire', 64), sizedIn('x:foil', 121)] });
  const res = plain(rule.scaleRecipe(plain(r.json), 2, 2, null, true));
  const counts = res.json.inputs.item.map((e) => [e.content.ingredient.item, e.content.count]);
  assert.deepEqual(counts, [['x:frame', 2], ['x:fine_wire', 64], ['x:fine_wire', 64], ['x:foil', 64], ['x:foil', 64], ['x:foil', 64], ['x:foil', 50]]);
  assert.equal(res.split, 2);
  assert.ok(counts.every(([, n]) => n <= 64));
  const flat = plain(rule.scaleRecipe(plain(r.json), 2, 2));
  assert.equal(flat.json.inputs.item.length, 3, 'an unordered type keeps one entry per input');
  assert.equal(flat.json.inputs.item[2].content.count, 242);
  const same = plain(rule.scaleRecipe(plain(r.json), 1, 1, null, true));
  assert.equal(same.changed, true, 'an ordered input already over a stack is split even at factor 1');
  assert.deepEqual(same.json.inputs.item.map((e) => e.content.count), [1, 64, 64, 57]);
});

test('selection: the era is the key item the recipe makes; include falls back to the EU/t tier; exclude and override', () => {
  const sel = rule.makeSelector([
    table('mv', { keys: ['gtceu:mv_machine_hull', 'gtceu:*_wire'] }),
    table('hv', { keys: ['gtceu:hv_machine_hull'], include: ['gtceu:assembler/tier_*'], exclude: ['gtceu:assembler/skip_*'], override: { 'gtceu:assembler/to_ev': 'ev', 'gtceu:assembler/to_none': 'none' } }),
    table('ev', { enabled: false, item: 1, fluid: 1 }),
  ]);
  const hull = recipe('gtceu:assembler/h', { outs: ['gtceu:mv_machine_hull'], eut: 2000 });
  assert.deepEqual(plain(sel.select(hull.id, hull.json)), { era: 'mv', via: 'key', enabled: true, item: 2, fluid: 2, keyFactor: 1, pin: null });
  const wire = recipe('gtceu:assembler/w', { outs: ['gtceu:tin_wire'] });
  assert.equal(sel.select(wire.id, wire.json).era, 'mv', 'a glob key');
  const other = recipe('gtceu:assembler/other', { outs: ['x:thing'], eut: 400 });
  assert.equal(sel.select(other.id, other.json), null, 'not a key item, not included');
  const inc = recipe('gtceu:assembler/tier_one', { outs: ['x:thing'], eut: 400 });
  assert.deepEqual(plain(sel.select(inc.id, inc.json)), { era: 'hv', via: 'include', enabled: true, item: 2, fluid: 2, keyFactor: 1, pin: null });
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

test('keyFactor multiplies the era factors of one key; an exact id wins over a glob; other keys keep the era factor', () => {
  const sel = rule.makeSelector([table('mv', {
    keys: ['gtceu:mv_machine_hull', 'gtceu:mv_machine_casing', 'gtceu:mv_emitter'],
    keyFactor: { 'gtceu:mv_*': 1.5, 'gtceu:mv_machine_casing': 4 },
  })]);
  const at = (out) => plain(sel.select('gtceu:assembler/x', recipe('gtceu:assembler/x', { outs: [out] }).json));
  assert.equal(at('gtceu:mv_machine_casing').item, 8, 'exact id: 2 x 4');
  assert.equal(at('gtceu:mv_machine_casing').fluid, 8);
  assert.equal(at('gtceu:mv_emitter').item, 3, 'glob: 2 x 1.5');
  assert.equal(at('gtceu:mv_emitter').keyFactor, 1.5);
  const r = recipe('gtceu:assembler/casing', { ins: [sizedIn('x:plate', 8)], fins: [fluidIn('gtceu:water', 100)], outs: ['gtceu:mv_machine_casing'] });
  const res = applyToRecipes([r], [table('mv', { keys: ['gtceu:mv_machine_casing'], keyFactor: { 'gtceu:mv_machine_casing': 4 } })]);
  const j = res.changed.get(r.id);
  assert.equal(j.inputs.item[0].content.count, 64);
  assert.equal(j.inputs.fluid[0].content.amount, 800);
});

test('pin holds a container input at its count (never scaled), raises a ladder step to it, and leaves other inputs to the factor', () => {
  const pin = { 'gtceu:*_machine_hull': { 'gtceu:*_machine_casing': 1 }, 'gtceu:*_energy_input_hatch_4a': { 'gtceu:*_energy_input_hatch': 2 } };
  const tables = [table('ev', { item: 3, fluid: 3, keys: ['gtceu:ev_machine_hull', 'gtceu:ev_energy_input_hatch_4a'], pin })];
  const hull = recipe('gtceu:assembler/hull_ev', { ins: [sizedIn('gtceu:ev_machine_casing', 1), sizedIn('x:cable', 2)], outs: ['gtceu:ev_machine_hull'] });
  const hatch = recipe('gtceu:assembler/energy_hatch_4a_ev', { ins: [{ content: { item: 'gtceu:ev_energy_input_hatch' }, chance: 10000, maxChance: 10000, tierChanceBoost: 0 }, sizedIn('x:wire', 2)], outs: ['gtceu:ev_energy_input_hatch_4a'] });
  const res = applyToRecipes([hull, hatch], tables);
  const h = res.changed.get(hull.id).inputs.item;
  assert.equal(h[0].content.count, 1, 'one casing per hull');
  assert.equal(h[1].content.count, 6, 'the cables carry the factor');
  const a = res.changed.get(hatch.id).inputs.item;
  assert.deepEqual(a[0].content, { type: 'gtceu:sized', count: 2, ingredient: { item: 'gtceu:ev_energy_input_hatch' } }, '4 A = 2 x 1 A');
  assert.equal(a[1].content.count, 6);
  const same = recipe('gtceu:assembler/hull_ev_2', { ins: [sizedIn('gtceu:ev_machine_casing', 1)], outs: ['gtceu:ev_machine_hull'] });
  assert.equal(applyToRecipes([same], tables).changed.size, 0, 'a pinned input at its count is no change');
});

test('validateTable checks keyFactor and pin', () => {
  assert.deepEqual(plain(rule.validateTable(table('mv', { keyFactor: { 'a:b': 2 }, pin: { 'a:*': { 'b:*': 2 } } }), 'mv')), []);
  assert.match(rule.validateTable(table('mv', { keyFactor: [] }), 'mv').join(';'), /keyFactor must be an object/);
  assert.match(rule.validateTable(table('mv', { keyFactor: { 'a:b': 0.5 } }), 'mv').join(';'), /keyFactor a:b must be/);
  assert.match(rule.validateTable(table('mv', { pin: { 'a:b': 2 } }), 'mv').join(';'), /pin a:b must be an object/);
  assert.match(rule.validateTable(table('mv', { pin: { 'a:b': { 'c:d': 1.5 } } }), 'mv').join(';'), /pin a:b c:d must be a whole count/);
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
    const k = (t.keyFactor && t.keyFactor[`gtceu:${t.era}_machine_hull`]) || 1;
    assert.equal(j.inputs.item[0].content.count, rule.scaledCount(3, t.item * k, 'x:plate'), t.era);
    assert.equal(j.inputs.fluid[0].content.amount, rule.scaledCount(1000, t.fluid * k, 'gtceu:water'), t.era);
  }
  for (const t of tables.filter((x) => !x.enabled)) {
    const hull = recipe(`gtceu:assembler/${t.era}_hull`, { ins: [sizedIn('x:plate', 3)], outs: [`gtceu:${t.era}_machine_hull`] });
    assert.equal(applyToDump(mkDump({ recipes: [hull] }), tables).changed.size, 0, t.era);
  }
});

test('an era with a factor above 1 changes exactly the selected recipes, to the dithered n x f', () => {
  const { tables } = loadTables(TABLE_DIR);
  const hull = recipe('gtceu:assembler/mv_hull', { ins: [sizedIn('x:plate', 3)], fins: [fluidIn('gtceu:water', 1000)], outs: ['gtceu:mv_machine_hull'] });
  const unrelated = recipe('gtceu:assembler/unrelated', { ins: [sizedIn('x:plate', 3)], outs: ['x:widget'], eut: 30 });
  const dump = mkDump({ recipes: [hull, unrelated] });
  const res = applyToDump(dump, withFactors(tables, { mv: { item: 3, fluid: 3 } }));
  assert.deepEqual([...res.changed.keys()], [hull.id]);
  const j = res.recipes.get(hull.id).json;
  const k = (tables.find((t) => t.era === 'mv').keyFactor || {})['gtceu:mv_machine_hull'] || 1;
  assert.equal(j.inputs.item[0].content.count, rule.scaledCount(3, 3 * k, 'x:plate'));
  assert.equal(j.inputs.fluid[0].content.amount, rule.scaledCount(1000, 3 * k, 'gtceu:water'));
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
    // the hull's own key factor (AF-CC) multiplies the era's
    const kOf = (era) => (real.find((t) => t.era === era).keyFactor || {})[`gtceu:${era}_machine_hull`] || 1;
    for (const [era, id, n] of [['mv', 'gtceu:assembler/mv_hull_gtm', 4], ['hv', 'gtceu:assembler/hv_hull_gtm', 5]]) {
      const t = eraOn(era);
      const got = committed.originalsChanged.get(id);
      if (t) assert.equal(got.inputs.item[0].content.count, rule.scaledCount(n, t.item * kOf(era), 'x:plate'), id);
      else assert.equal(got, undefined, id);
    }

    // two eras on: the pass and the Node rule agree, recipe by recipe
    const on = withFactors(real, { mv: { item: 3, fluid: 3 }, hv: { item: 4, fluid: 4 } });
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
    assert.equal(ours.inputs.item[0].content.count, rule.scaledCount(3, 3 * kOf('mv'), 'x:plate'));
    assert.equal(ours.inputs.item[1].content.count, rule.scaledCount(1, 3 * kOf('mv'), 'x:plain'), 'the plain item is wrapped and scaled');
    assert.equal(ours.inputs.item[2].chance, 0, 'the mold stays a catalyst');
    assert.equal(ours.inputs.fluid[0].content.amount, rule.scaledCount(1000, 3 * kOf('mv'), 'gtceu:water'));

    const orig = mkOriginals().map((o) => ({ id: o.i, json: plain(o.j) }));
    const expectOrig = applyToRecipes(orig, on);
    assert.deepEqual([...run.originalsChanged.keys()].sort(), [...expectOrig.changed.keys()].sort());
    assert.deepEqual([...run.originalsChanged.keys()].sort(), ['gtceu:assembler/hv_hull_gtm', 'gtceu:assembler/mv_hull_gtm']);
    for (const [id, j] of run.originalsChanged) assert.deepEqual(plain(j), expectOrig.changed.get(id), id);
    assert.equal(run.originalsChanged.get('gtceu:assembler/mv_hull_gtm').inputs.item[0].content.count, rule.scaledCount(4, 3 * kOf('mv'), 'x:plate'));
    assert.equal(run.originalsChanged.get('gtceu:assembler/hv_hull_gtm').inputs.item[0].content.count, rule.scaledCount(5, 4 * kOf('hv'), 'x:plate'));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
