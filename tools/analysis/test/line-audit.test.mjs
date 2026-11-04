import test from 'node:test';
import assert from 'node:assert/strict';
import { lineSteps, collectLines, usedBy, findDuplicates, judge, toCsv, eraSummary, infraSet, structureBlocks, loadKeyItems, buildFacts, skipRoute, recipeEra, buildEraContext, contentCrossings, splitChains, parseDesignLines, designReport, checkRole, classify, isFold, tagProblems, acceptedRoute } from '../line-audit.mjs';

const n = (key, kind, res, from = [], extra = {}) => ({ key, kind, res, from, cluster: 'a', ...extra });
const chain = () => [
  n('r', 'raw', 'gtceu:ore'),
  n('m1', 'machine', null, ['r'], { item: 'gtceu:macerator' }),
  n('d', 'item', 'gtceu:dust', ['m1']),
  n('m2', 'machine', null, ['d'], { item: 'gtceu:ebf' }),
  n('i', 'item', 'gtceu:ingot', ['m2']),
  n('p', 'product', 'gtceu:plate', ['i']),
];

test('lineSteps counts machines and machine-less crafts, not machine outputs or raws', () => {
  assert.equal(lineSteps(chain()), 3);
  assert.equal(lineSteps([n('r', 'raw', 'x'), n('a', 'item', 'y', ['r'])]), 1);
  assert.equal(lineSteps([n('r', 'raw', 'x')]), 0);
});

const model = {
  chapters: [
    { file: 'pl_lv', clusters: { a: { name: 'Alpha' } }, nodes: chain() },
    {
      file: 'pl_iv',
      clusters: { a: { name: 'Beta' } },
      nodes: [n('lk', 'item', null, [], { link: true, target: { chapter: 'pl_lv', cluster: 'a' } }), n('o', 'product', 'gtceu:thing', ['lk'])],
    },
    { file: 'quests_other', clusters: {}, nodes: [n('z', 'item', 'q')] },
  ],
};

test('collectLines reads era lines, crossings with reach back and main products', () => {
  const lines = collectLines(model);
  assert.deepEqual(lines.map((l) => l.id), ['lv.a', 'iv.a']);
  assert.equal(lines[0].steps, 3);
  assert.deepEqual(lines[0].products.map((p) => p.res), ['gtceu:plate']);
  assert.equal(lines[1].crossings[0].back, 4);
  assert.equal(lines[1].crossings[0].era, 'lv');
});

test('usedBy links a line to the lines crossing into it', () => {
  const lines = collectLines(model);
  assert.deepEqual([...usedBy(lines).get('lv.a')], ['iv.a']);
});

test('findDuplicates merges a later line sharing most intermediates', () => {
  const mk = (id, era, cluster, inner, products) => ({ id, era, cluster, inner: new Set(inner), products: products.map((res) => ({ res })) });
  const a = mk('lv.a', 'lv', 'a', ['1', '2', '3', '4', '5'], ['p']);
  const b = mk('mv.a', 'mv', 'a', ['1', '2', '3', '4', '5'], ['q']);
  const c = mk('mv.b', 'mv', 'b', ['9'], ['r']);
  const d = findDuplicates([a, b, c]);
  assert.equal(d.get('mv.a').of, 'lv.a');
  assert.equal(d.has('mv.b'), false);
});

const line = (over = {}) => ({ era: 'ev', steps: 5, crossings: [{ back: 2 }], products: [{ res: 'gtceu:x' }], ...over });
const ctx = (over = {}) => ({ used: new Set(['x']), dup: null, skipped: [], endInfo: new Map([['gtceu:x', { n: 3, reached: [] }]]), ...over });

test('judge verdicts', () => {
  assert.equal(judge(line(), ctx()).verdict, 'keep');
  assert.equal(judge(line({ steps: 2 }), ctx()).verdict, 'fix');
  assert.equal(judge(line(), ctx({ dup: { of: 'lv.a', shared: 5 } })).verdict, 'merge');
  assert.equal(judge(line(), ctx({ skipped: [{ res: 'gtceu:x' }] })).verdict, 'fix');
  const dead = judge(line(), ctx({ used: new Set(), endInfo: new Map([['gtceu:x', { n: 0, reached: [] }]]) }));
  assert.equal(dead.verdict, 'remove');
  // MAX gets the same diagnostics as any implemented era: a defective line is diagnosed, a valid one kept
  assert.equal(judge(line({ era: 'max' }), ctx()).verdict, 'keep');
  assert.equal(judge(line({ era: 'max' }), ctx({ used: new Set(), endInfo: new Map([['gtceu:x', { n: 0, reached: [] }]]) })).verdict, 'remove');
  assert.equal(judge(line({ era: 'max', steps: 2 }), ctx()).verdict, 'fix');
});

test('a travel key without recipe consumers is not dead', () => {
  const l = line({ products: [{ res: 'grindless:end_key' }] });
  const r = judge(l, ctx({ used: new Set(), endInfo: new Map([['grindless:end_key', { n: 0, reached: [] }]]) }));
  assert.notEqual(r.verdict, 'remove');
});

test('toCsv and eraSummary agree on rows', () => {
  const l = line({ cluster: 'a', name: 'A "q"', mbs: [], ours: [] });
  const rows = [{ line: l, real: true, reach: 2, used: new Set(['iv.a']), skipText: [], endInfo: new Map([['gtceu:x', { n: 3, reached: ['iv:y'] }]]), dup: null, verdict: 'keep', reason: 'ok' }];
  const csv = toCsv(rows).trim().split('\n');
  assert.equal(csv.length, 2);
  assert.match(csv[1], /"A ""q"""/);
  assert.equal(eraSummary(rows).get('ev').keep, 1);
});

test('loadKeyItems keeps the first era per item', () => {
  const m = loadKeyItems('era,group,item\nlv,g,a\nmv,g,a\n');
  assert.equal(m.get('a'), 'lv');
});

test('clusters sharing a line id join into one line; the joining raw adds no step', () => {
  const m = { chapters: [{ file: 'pl_ev', clusters: { a: { name: 'A', line: 'L1' }, b: { line: 'L1' } }, nodes: [
    n('r', 'raw', 'gtceu:ore'), n('m1', 'machine', null, ['r'], { item: 'gtceu:m1' }), n('x', 'item', 'gtceu:x', ['m1']),
    n('rx', 'raw', 'gtceu:x', [], { cluster: 'b' }), n('m2', 'machine', null, ['rx'], { item: 'gtceu:m2', cluster: 'b' }), n('p', 'product', 'gtceu:p', ['m2'], { cluster: 'b' }),
  ] }] };
  const ls = collectLines(m);
  assert.equal(ls.length, 1);
  assert.equal(ls[0].id, 'ev.a+b');
  assert.deepEqual(ls[0].clusters, ['a', 'b']);
  assert.equal(ls[0].steps, 2);
  assert.deepEqual(ls[0].products.map((p) => p.res), ['gtceu:p']);
});

test('tags: extends branch end, keepShort and fold verdicts', () => {
  assert.equal(judge(line({ steps: 2 }), ctx({ kind: 'branch' })).verdict, 'keep');
  assert.equal(judge(line({ steps: 2, crossings: [] }), ctx({ kind: 'branch', used: new Set() })).verdict, 'fix');
  const ks = judge(line({ steps: 2, keepShort: 'one-off' }), ctx());
  assert.equal(ks.verdict, 'keep');
  assert.match(ks.reason, /keepShort \(one-off\)/);
  assert.equal(judge(line({ steps: 2 }), ctx({ kind: 'fold' })).verdict, 'keep');
  assert.equal(judge(line({ steps: 2 }), ctx({ kind: 'production' })).verdict, 'fix');
});

test('keepShort keeps a short line at any era, before the bypass check; the short fix stays EV+', () => {
  const skip = ctx({ skipped: [{ res: 'gtceu:x' }] });
  const ks = judge(line({ era: 'lv', steps: 2, keepShort: 'yield booster' }), skip);
  assert.equal(ks.verdict, 'keep');
  assert.match(ks.reason, /keepShort \(yield booster\)/);
  assert.equal(judge(line({ era: 'lv', steps: 2 }), skip).verdict, 'fix');
  assert.equal(judge(line({ era: 'lv', steps: 2 }), ctx()).verdict, 'keep');
});

test('roles: pass and fail per role, and a failed role is judged as production', () => {
  const eu = buildFacts([rec('g', 'gtceu:gen', ['gtceu:fuel'], 'gtceu:x', { euOut: 100 })]);
  const L = (role, extra = {}) => ({ era: 'ev', role, steps: 2, products: [{ res: 'gtceu:p' }], machines: new Set(['gtceu:other']), inner: new Set(), raws: new Set(), ...extra });
  assert.equal(checkRole(L('power', { machines: new Set(['gtceu:gen']) }), eu).ok, true);
  assert.equal(checkRole(L('power'), eu).ok, false);
  assert.equal(checkRole(L('research'), null).ok, false);
  const res = buildFacts([
    rec('use', 'gtceu:research_station', ['gtceu:p'], 'gtceu:data'),
    { ...rec('cap', 'gtceu:other', ['gtceu:z'], 'gtceu:q'), inputs: [{ alts: ['gtceu:p'], count: 1, cap: true }] },
  ]);
  assert.equal(checkRole(L('research'), res).ok, true);
  assert.equal(checkRole(L('infrastructure'), res).ok, false);
  const bad = buildFacts([rec('mat', 'gtceu:assembler', ['gtceu:p'], 'gtceu:plate')]);
  assert.equal(checkRole(L('research'), bad).ok, false);
  assert.equal(checkRole(L('travel', { products: [{ res: 'grindless:x_key' }] }), bad).ok, true);
  assert.equal(classify(L('research'), res).kind, 'role');
  const failed = classify(L('research'), bad);
  assert.equal(failed.kind, 'production');
  assert.match(judge(L('research', { crossings: [] }), { used: new Set(), dup: null, skipped: [], endInfo: new Map(), ...failed }).reason, /declared role research fails/);
});

test('LD-T2 role tests follow RF-3S: one positive and one negative fixture per role', () => {
  const L = (role, res, extra = {}) => ({ era: 'luv', role, steps: 2, products: [{ res }], machines: new Set(['gtceu:site']), inner: new Set(), raws: new Set(), ...extra });
  const plate = rec('plate', 'gtceu:assembler', ['gtceu:p'], 'gtceu:plate');
  // infrastructure: a part consumed by a part recipe that leads to a casing within 2 hops; a placed machine needs no consumer
  const infra = buildFacts([rec('part', 'gtceu:assembler', ['gtceu:p'], 'gtceu:q'), rec('cas', 'gtceu:assembler', ['gtceu:q'], 'grindless:x_casing')]);
  assert.equal(checkRole(L('infrastructure', 'gtceu:p'), infra).ok, true);
  assert.equal(checkRole(L('infrastructure', 'gtceu:p'), buildFacts([plate])).ok, false);
  assert.equal(checkRole(L('infrastructure', 'gtceu:hpca'), buildFacts([]), { infra: new Set(['gtceu:hpca']) }).ok, true);
  assert.equal(checkRole(L('infrastructure', 'gtceu:hpca'), buildFacts([])).ok, false);
  // research: consumed as a material by a recipe whose output is a research item
  const rs = buildFacts([rec('chart', 'minecraft:crafting_shapeless', ['gtceu:p'], 'grindless:outer_system_chart')]);
  assert.equal(checkRole(L('research', 'gtceu:p'), rs).ok, true);
  assert.equal(checkRole(L('research', 'gtceu:p'), buildFacts([plate])).ok, false);
  // travel: consumed by a recipe whose output is a tank or seed part
  const tv = buildFacts([rec('tank', 'gtceu:assembler', ['gtceu:p'], 'grindless:naquadah_fuel_tank')]);
  assert.equal(checkRole(L('travel', 'gtceu:p'), tv).ok, true);
  assert.equal(checkRole(L('travel', 'gtceu:p'), buildFacts([plate])).ok, false);
  // resource: a site recipe that takes a fluid and a capture bag; a plain assembler recipe from ingots is production
  const site = (ins) => buildFacts([rec('mine', 'gtceu:site', ins, 'gtceu:ore')]);
  const feeds = { feeds: new Map([['gtceu:ore', new Set(['other'])]]) };
  assert.equal(checkRole(L('resource', 'gtceu:ore'), site(['fluid:gtceu:helium', 'grindless:capture_bag']), feeds).ok, true);
  assert.equal(checkRole(L('resource', 'gtceu:ore'), site(['gtceu:steel_ingot']), feeds).ok, false);
});

test('a short line of ours that replaces a stock chain is a fold', () => {
  const facts = buildFacts([
    rec('mid', 'gtceu:macerator', ['gtceu:sand'], 'gtceu:mid', { added: false }),
    rec('sp', 'gtceu:assembler', ['gtceu:mid'], 'gtceu:plate', { added: false }),
    rec('own', 'gtceu:ourtype', ['gtceu:sand'], 'gtceu:plate'),
  ]);
  const l = mkLine('ev', { steps: 2, ours: ['gtceu:our_mb'], raws: new Set(['gtceu:sand']), machines: new Set(['gtceu:ourtype']) });
  assert.equal(isFold(l, facts), true);
  assert.equal(skipRoute(l, 'gtceu:plate', facts), null);
  assert.equal(classify(l, facts).kind, 'fold');
});

test('skip route drops: an ore with no vein', () => {
  const facts = buildFacts([rec('b', 'gtceu:other', ['gtceu:ore_x'], 'gtceu:plate')]);
  const l = mkLine('ev', { steps: 4 });
  assert.ok(skipRoute(l, 'gtceu:plate', facts));
  assert.equal(skipRoute(l, 'gtceu:plate', facts, null, { never: new Set(['gtceu:ore_x']) }), null);
});

test('skip route drops: a parallel source of an earlier production line', () => {
  const facts = buildFacts([rec('b', 'gtceu:other', ['gtceu:sand'], 'gtceu:plate')]);
  const l = mkLine('ev', { steps: 4 });
  const earlier = [{ products: [{ res: 'gtceu:plate' }], machines: new Set(['gtceu:other']) }];
  assert.equal(skipRoute(l, 'gtceu:plate', facts, null, { earlier }), null);
});

test('skip route drops: an ore block of a material with no vein, a circular route, a parallel source at any node', () => {
  // the ore block is not listed in the never group, only the material is
  const ore = buildFacts([rec('b', 'gtceu:other', ['gtceu:tuff_nether_star_ore'], 'gtceu:plate')]);
  const l = mkLine('ev', { steps: 4 });
  assert.ok(skipRoute(l, 'gtceu:plate', ore));
  assert.equal(skipRoute(l, 'gtceu:plate', ore, null, { never: new Set(['material:nether_star']) }), null);
  assert.ok(skipRoute(l, 'gtceu:plate', ore, null, { never: new Set(['material:iron']) }));
  // circular: a decolour route takes a stained variant that is made from the key itself
  const loop = buildFacts([
    rec('own', 'gtceu:mine', ['gtceu:ore'], 'gtceu:plate'),
    rec('stain', 'minecraft:crafting_shaped', ['gtceu:sand', 'gtceu:plate'], 'gtceu:stained', { added: false }),
    rec('clear', 'minecraft:crafting_shaped', ['gtceu:stained'], 'gtceu:plate', { added: false }),
  ]);
  assert.equal(skipRoute(l, 'gtceu:plate', loop), null);
  const open = buildFacts([
    rec('own', 'gtceu:mine', ['gtceu:ore'], 'gtceu:plate'),
    rec('clear', 'minecraft:crafting_shaped', ['gtceu:stained'], 'gtceu:plate', { added: false }),
  ]);
  assert.ok(skipRoute(l, 'gtceu:plate', open));
  // glass: the clear-glass tweak takes a shard that only breaking glass gives
  const shard = buildFacts([
    rec('own', 'gtceu:mine', ['gtceu:ore'], 'minecraft:glass'),
    rec('clear', 'minecraft:crafting_shaped', ['quark:clear_shard'], 'minecraft:glass', { added: false }),
  ]);
  assert.equal(skipRoute(mkLine('steam', { steps: 4, products: [{ res: 'minecraft:glass' }] }), 'minecraft:glass', shard), null);
  // parallel source: the earlier line makes the key at an inner node, not as its end product
  const par = buildFacts([rec('b', 'gtceu:other', ['gtceu:sand'], 'gtceu:plate')]);
  const earlier = [{ products: [{ res: 'gtceu:ingot' }], inner: new Set(['gtceu:plate']), machines: new Set(['gtceu:other']), raws: new Set(), ours: [], inners: new Set() }];
  assert.ok(skipRoute(l, 'gtceu:plate', par));
  assert.equal(skipRoute(l, 'gtceu:plate', par, null, { earlier }), null);
  assert.ok(skipRoute(l, 'gtceu:plate', par, null, { earlier: [{ ...earlier[0], machines: new Set(['gtceu:else']) }] }));
});

test('tagProblems reports bad role, line, extends and keepShort', () => {
  const m = { chapters: [{ file: 'pl_ev', clusters: { a: { role: 'bogus', extends: 'pl_ev:zz' }, b: { line: 'L1', keepShort: ' ' } }, nodes: [n('x', 'item', 'k', [], { role: 'power', extends: 'pl_ev:a' })] }] };
  const p = tagProblems(m);
  assert.equal(p.length, 3);
  assert.equal(tagProblems({ chapters: [{ file: 'pl_ev', clusters: { a: { role: 'power', keepShort: 'r' } }, nodes: [] }] }).length, 0);
});

test('toCsv and eraSummary carry roles and kinds', () => {
  const l = line({ cluster: 'a', name: 'A', mbs: [], ours: [], role: 'power', lineId: 'L1' });
  const rows = [{ line: l, real: true, reach: 0, used: new Set(), skipText: [], endInfo: new Map([['gtceu:x', { n: 1, reached: [] }]]), dup: null, verdict: 'keep', reason: 'ok', kind: 'role', role: { ok: true } }];
  const csv = toCsv(rows).trim().split('\n');
  assert.match(csv[0], /role,role_ok,line_id,extends,keep_short$/);
  assert.match(csv[1], /,power,1,L1,"",""$/);
  const s = eraSummary(rows).get('ev');
  assert.equal(s.role, 1);
  assert.equal(s.real, 0);
});

test('eraSummary counts deep crossings (back >= 2) of real production lines, and depth statistics are descriptive', () => {
  const l = line({ cluster: 'a', name: 'A', mbs: [], ours: [] });
  l.era = 'zpm';
  l.crossings = [{ back: 2 }, { back: 1 }];
  l.content = [{ back: 3 }];
  const mk = (real, kind) => ({ line: l, real, reach: 0, used: new Set(), skipText: [], endInfo: new Map(), dup: null, verdict: 'keep', reason: 'ok', kind });
  const s = eraSummary([mk(true, 'production'), mk(false, 'production'), mk(true, 'role')]).get('zpm');
  assert.equal(s.deep, 2, 'only the real production line counts, 2 of its 3 crossings reach back 2 eras');
  assert.equal(s.real, 1);
  assert.equal(s.longest, l.steps);
  assert.deepEqual(s.depth, { [l.steps]: 1 });
  assert.deepEqual(s.long, [{ id: l.id, steps: l.steps }]);
});

const io = (alts, count = 1) => ({ alts, count, cap: false });
const rec =  (id, type, ins, out, extra = {}) => ({ id, type, category: type, inputs: ins.map((a) => io([a])), outputs: [{ key: out, chance: 1 }], added: true, ...extra });
const mkLine = (era, extra = {}) => ({
  era, steps: 3, raws: new Set(['gtceu:ore']), inner: new Set(['gtceu:dust', 'gtceu:plate']), products: [{ res: 'gtceu:plate' }], machines: new Set(['gtceu:mine']), ...extra,
});

test('a bypass counts only when usable at or below the line era', () => {
  // EV line (tier 4, 2048 EU/t); the bypass is a one-step recipe from base resources
  const mk = (eut, extra = {}) => buildFacts([rec('b', 'gtceu:other', ['gtceu:sand'], 'gtceu:plate', { eut, ...extra })]);
  const ctxOf = (facts, startup = new Map()) => buildEraContext({ startup, machines: [], lines: [] });
  const line = mkLine('ev', { steps: 4 });
  const later = mk(524288); // UV
  const same = mk(2048); // EV
  assert.equal(recipeEra(later.byId.get('b'), ctxOf(later)) > 4, true);
  assert.equal(skipRoute(line, 'gtceu:plate', later, ctxOf(later)), null);
  assert.ok(skipRoute(line, 'gtceu:plate', same, ctxOf(same)));
  // without an era context the old behaviour holds
  assert.ok(skipRoute(line, 'gtceu:plate', later));
  // a dimension reached only by a later era is a later-era bypass too
  const dim = mk(32, { conditions: [{ type: 'dimension', dimension: 'grindless:far' }] });
  assert.equal(skipRoute(line, 'gtceu:plate', dim, ctxOf(dim, new Map([['grindless:far', 8]]))), null);
  assert.ok(skipRoute(line, 'gtceu:plate', dim, ctxOf(dim, new Map([['grindless:far', 3]]))));
});

test('a content crossing is found from the recipes without a chart link', () => {
  const recipes = [
    rec('mk', 'gtceu:uxv_press', ['gtceu:dust', 'grindless:old_product', 'gtceu:steel_ingot'], 'gtceu:plate'),
    rec('old', 'gtceu:old_type', ['gtceu:sand'], 'grindless:old_product'),
    rec('stock', 'gtceu:assembler', ['gtceu:sand'], 'gtceu:steel_ingot', { added: false }),
    rec('stock2', 'gtceu:assembler', ['gtceu:sand'], 'gtceu:gear', { added: true }),
    rec('mk2', 'gtceu:assembler', ['gtceu:dust'], 'gtceu:plate'),
  ];
  const facts = buildFacts(recipes);
  const line = mkLine('uxv', { steps: 5, products: [{ res: 'gtceu:plate' }] });
  const startup = new Map([['gtceu:old_multi', 4], ['gtceu:assembler_multi', 1]]);
  const machines = [{ id: 'gtceu:old_multi', mb: 1, types: ['gtceu:uxv_press'] }, { id: 'gtceu:assembler_multi', mb: 1, types: ['gtceu:assembler'] }];
  const older = { era: 'ev', products: [{ res: 'grindless:old_product' }] };
  const eraCtx = buildEraContext({ startup, machines, lines: [older] });
  const found = contentCrossings(line, facts, eraCtx);
  assert.deepEqual(found.map((c) => `${c.kind}:${c.id}:${c.era}`).sort(), ['item:grindless:old_product:ev', 'machine:gtceu:uxv_press:ev']);
  assert.equal(found.every((c) => c.back >= 2), true);
  // stock machines (the assembler also holds stock recipes) and other-era-near items are not crossings
  assert.equal(found.some((c) => c.id === 'gtceu:assembler'), false);
  // the verdict reads content crossings when the chart has none
  const l = { ...line, crossings: [], content: found };
  const ok = judge(l, { used: new Set(), dup: null, skipped: [], endInfo: new Map([['gtceu:plate', { n: 2, reached: [] }]]) });
  assert.equal(ok.reach >= 2, true);
  assert.notEqual(ok.reason.startsWith('no crossing'), true);
  const bare = judge({ ...l, content: [] }, { used: new Set(), dup: null, skipped: [], endInfo: new Map([['gtceu:plate', { n: 2, reached: [] }]]) });
  assert.match(bare.reason, /isolated/);
});
test('splitChains: numbered rows are lines, a cluster with two end products is two lines', () => {
  const rows = [n('l1_0', 'raw', 'x'), n('l1_1', 'product', 'a', ['l1_0']), n('l2_0', 'raw', 'y'), n('l2_1', 'product', 'b', ['l2_0'])];
  assert.deepEqual(splitChains(rows).map((c) => c.label), ['L1', 'L2']);
  const two = [n('r', 'raw', 'x'), n('i', 'item', 'm', ['r']), n('p1', 'product', 'a', ['i']), n('p2', 'product', 'b', ['i'])];
  assert.equal(splitChains(two).length, 2);
  assert.equal(splitChains(chain()).length, 1);
});

// #284: numbered rows walk their ancestors and the links they consume; short feeder rows fold into the row that consumes them
const M = (key, from, item = 'gtceu:m') => n(key, 'machine', null, from, { item });
test('splitChains numbered: a row that consumes a link counts the crossing', () => {
  const m = { chapters: [
    { file: 'pl_uhv', clusters: { cf: { name: 'CF' } }, nodes: [n('t', 'product', 'gtceu:t', [], { cluster: 'cf' })] },
    { file: 'pl_uiv', clusters: { a: { name: 'A' } }, nodes: [
      n('xl', 'item', null, [], { link: true, target: { chapter: 'pl_uhv', cluster: 'cf', key: 't' } }),
      n('l1_0', 'raw', 'gtceu:r'), M('l1_1', ['l1_0', 'xl']), n('l1_2', 'item', 'gtceu:i', ['l1_1']), M('l1_3', ['l1_2']), n('l1_4', 'product', 'gtceu:p', ['l1_3']),
      n('l2_0', 'raw', 'gtceu:s'), M('l2_1', ['l2_0']), n('l2_2', 'product', 'gtceu:q', ['l2_1']),
    ] },
  ] };
  const l1 = collectLines(m).find((l) => l.id === 'uiv.a#L1');
  assert.deepEqual(l1.crossings.map((c) => `${c.era}:${c.key}`), ['uhv:t']);
});

test('splitChains numbered: a spur row counts its trunk ancestors', () => {
  const nodes = [
    n('l1_0', 'raw', 'gtceu:r'), M('l1_1', ['l1_0']), n('l1_2', 'item', 'gtceu:a', ['l1_1']), M('l1_3', ['l1_2']), n('l1_4', 'item', 'gtceu:b', ['l1_3']),
    M('l1_5', ['l1_4']), n('l1_6', 'product', 'gtceu:c', ['l1_5']),
    M('l2_5', ['l1_4']), n('l2_6', 'product', 'gtceu:d', ['l2_5']),
  ];
  const parts = splitChains(nodes);
  assert.deepEqual(parts.map((p) => p.label), ['L1', 'L2']);
  const l2 = parts.find((p) => p.label === 'L2');
  assert.ok(l2.nodes.some((nd) => nd.key === 'l1_0'));
  assert.equal(lineSteps(l2.nodes), 3);
  assert.equal(l2.sink.key, 'l2_6');
});

test('splitChains numbered: a short row another row consumes folds; a 4-step one stays', () => {
  const trunk = [n('l1_0', 'item', 'gtceu:h', ['l2_1']), M('l1_1', ['l1_0']), n('l1_2', 'item', 'gtceu:a', ['l1_1']), M('l1_3', ['l1_2']), n('l1_4', 'item', 'gtceu:b', ['l1_3']),
    M('l1_5', ['l1_4']), n('l1_6', 'item', 'gtceu:c', ['l1_5']), M('l1_7', ['l1_6']), n('l1_8', 'product', 'gtceu:p', ['l1_7'])];
  const feeder = [n('l2_0', 'raw', 'gtceu:r'), M('l2_1', ['l2_0'])];
  const other = [n('l3_0', 'raw', 'gtceu:s'), M('l3_1', ['l3_0']), n('l3_2', 'product', 'gtceu:q', ['l3_1'])];
  const folded = splitChains([...feeder, ...trunk, ...other]);
  assert.deepEqual(folded.map((p) => p.label), ['L1', 'L3']);
  assert.equal(lineSteps(folded[0].nodes), 5);
  // a lone row left by folding keeps its label
  const m = { chapters: [{ file: 'pl_uxv', clusters: { a: { name: 'A' } }, nodes: [...feeder, ...trunk] }] };
  assert.deepEqual(collectLines(m).map((l) => l.id), ['uxv.a#L1']);
  const long = [n('l2_0', 'raw', 'gtceu:r'), M('l2_1', ['l2_0']), n('l2_2', 'item', 'gtceu:x', ['l2_1']), M('l2_3', ['l2_2']), n('l2_4', 'item', 'gtceu:y', ['l2_3']),
    M('l2_5', ['l2_4']), n('l2_6', 'item', 'gtceu:z', ['l2_5']), M('l2_7', ['l2_6'])];
  assert.equal(lineSteps(long), 4);
  assert.deepEqual(splitChains([...long, ...trunk.map((nd) => (nd.key === 'l1_0' ? { ...nd, from: ['l2_7'] } : nd))]).map((p) => p.label), ['L2', 'L1']);
});

test('parseDesignLines reads the first table only; designReport counts the missing', () => {
  const md = '## New process lines\n\n| # | Line | Steps |\n|---|---|---|\n| 1 | Alpha | ore \u2192 dust \u2192 ingot |\n| 2 | Beta | quartz \u2192 wafer |\n\n| # | Crossing |\n|---|---|\n| 1 | x |\n';
  const rows = parseDesignLines(md, 'uhv');
  assert.deepEqual(rows.map((r) => r.num), [1, 2]);
  const chart = [{ nodes: [n('a', 'item', 'gtceu:ore'), n('b', 'item', 'gtceu:dust'), n('c', 'item', 'gtceu:ingot')] }];
  const r = designReport('uhv', rows, chart, new Set(['gtceu:quartz', 'gtceu:wafer']));
  assert.equal(r.design, 2);
  assert.equal(r.chart, 1);
  assert.equal(r.missing.length, 1);
  assert.equal(r.missing[0].dump, true);
});
test('staged lines: a later stage linking to its own earlier stage sums the steps; untagged clusters are unchanged', () => {
  const m = { chapters: [
    { file: 'pl_mv', clusters: { a: { name: 'A', line: 'P' } }, nodes: chain() },
    { file: 'pl_hv', clusters: { b: { name: 'B', line: 'P' }, c: { name: 'C' } }, nodes: [
      n('lk', 'item', null, [], { link: true, cluster: 'b', target: { chapter: 'pl_mv', cluster: 'a' } }),
      n('m', 'machine', null, ['lk'], { item: 'gtceu:m', cluster: 'b' }), n('p', 'product', 'gtceu:p', ['m'], { cluster: 'b' }),
      n('lk2', 'item', null, [], { link: true, cluster: 'c', target: { chapter: 'pl_mv', cluster: 'a' } }),
      n('m2', 'machine', null, ['lk2'], { item: 'gtceu:m2', cluster: 'c' }), n('p2', 'product', 'gtceu:p2', ['m2'], { cluster: 'c' }),
    ] },
  ] };
  const ls = collectLines(m);
  assert.equal(ls.find((l) => l.id === 'mv.a').steps, 3);
  assert.equal(ls.find((l) => l.id === 'hv.b').steps, 4);
  assert.equal(ls.find((l) => l.id === 'hv.c').steps, 1);
});

test('accepted bootstrap routes are not skips', () => {
  const facts = buildFacts([rec('gtceu:primitive_blast_furnace/steel', 'gtceu:primitive_blast_furnace', ['gtceu:sand'], 'gtceu:plate')]);
  assert.equal(skipRoute(mkLine('ev', { steps: 4 }), 'gtceu:plate', facts), null);
  assert.equal(acceptedRoute('gtceu:primitive_blast_furnace/x').pattern, 'gtceu:primitive_blast_furnace/*');
  assert.equal(acceptedRoute('gtceu:other/x'), undefined);
});

test('infrastructure: blocks a structure accepts (oneOf alternatives, wireless table cells) are placed parts, other cells are not', () => {
  const L = (res) => ({ era: 'zpm', role: 'infrastructure', steps: 2, products: [{ res }], machines: new Set(['gtceu:site']), inner: new Set(), raws: new Set() });
  const structures = new Map([['gtceu:wireless_energy_tower', { symbols: { C: { kind: 'oneOf', options: [{ kind: 'blocks', blocks: ['grindless:zpm_smes_cell'] }, { kind: 'blocks', blocks: ['grindless:tower_casing'] }] }, K: { kind: 'controller' } } }]]);
  const wireless = { tiers: [{ cell: 'grindless:uxv_smes_cell' }, { cell: 'grindless:horizon_bank_cell' }] };
  const infra = infraSet(structures, wireless);
  assert.ok(infra.has('gtceu:wireless_energy_tower'));
  assert.deepEqual([...structureBlocks(structures, wireless)].sort(), ['grindless:tower_casing', 'grindless:uxv_smes_cell', 'grindless:zpm_smes_cell']);
  const facts = buildFacts([]);
  for (const cell of ['grindless:zpm_smes_cell', 'grindless:uxv_smes_cell']) assert.equal(checkRole(L(cell), facts, { infra }).ok, true, cell);
  assert.equal(checkRole(L('grindless:orphan_cell'), facts, { infra }).ok, false);
  assert.equal(checkRole(L('grindless:zpm_smes_cell'), facts, { infra: infraSet(new Map([['gtceu:wireless_energy_tower', {}]])) }).ok, false);
});
