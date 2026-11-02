import test from 'node:test';
import assert from 'node:assert/strict';
import { solveCosts } from '../lib/cost.mjs';
import { parseTargetSpec, structureBom, cheapestOf, buildCostTree, metricValue, compareRows } from '../lib/cost_tree.mjs';
import { renderHtml } from '../lib/cost_tree_html.mjs';

const item = (key, count = 1, extra = {}) => ({ alts: [key], count, cap: false, consume: 1, ...extra });
const out = (key, count = 1, chance = 1) => ({ key, count, chance });
const rec = (id, inputs, outputs, extra = {}) => ({ id, type: 'gtceu:t', inputs, outputs, eut: 0, amp: 1, duration: 0, ...extra });
const base = (set) => (k) => set.includes(k);

const recipes = [
  rec('plate', [item('ingot', 2)], [out('plate', 1)], { eut: 10, duration: 5 }),
  rec('ingot', [item('ore', 1)], [out('ingot', 2)], { eut: 2, duration: 10 }),
  rec('gear', [item('plate', 4), item('fluid:oil', 500)], [out('gear', 1)], { eut: 1, duration: 100 }),
  rec('dial', [item('gear', 3), item('plate', 2)], [out('dialout', 1)], { eut: 100, duration: 10 }),
];
const make = (extra = {}) => {
  const model = solveCosts(recipes, { isBase: base(['ore', 'fluid:oil']) });
  return buildCostTree({ model, weight: () => 1, recipes, fluidUnitMb: 1000, name: 'T', ...extra, targets: extra.targets || [{ label: 'Gears', kind: 'item', key: 'gear', entries: [{ key: 'gear', qty: 2 }] }] });
};

test('target specs', () => {
  assert.deepEqual(parseTargetSpec('Build=gtceu:x+gtceu:y*3'), { label: 'Build', kind: 'item', key: 'gtceu:x', extras: [{ key: 'gtceu:y', qty: 3 }] });
  const r = parseTargetSpec('recipe:grindless:dial');
  assert.equal(r.kind, 'recipe');
  assert.equal(r.key, 'grindless:dial');
  assert.throws(() => parseTargetSpec(''));
});

test('runs, quantities and the root equal the summary', () => {
  const res = make();
  const row = (k) => res.rows[k];
  assert.equal(row('gear').runs, 2);
  assert.equal(row('plate').count, 8);
  assert.equal(row('plate').runs, 8);
  assert.equal(row('ingot').count, 16);
  assert.equal(row('ingot').runs, 8);
  assert.equal(row('ore').count, 8);
  assert.equal(res.summary.crafts, 2 + 8 + 8);
  assert.equal(res.summary.eu, 2 * 100 + 8 * 50 + 8 * 20);
  assert.equal(res.summary.recipeTypes, 1);
  assert.ok(res.consistency.ok);
  assert.equal(res.tree.v[2], res.summary.crafts);
  assert.equal(res.checks.unreachable.length, 0);
});

test('a recipe target counts its own run once and picks the inputs', () => {
  const res = make({ targets: [{ label: 'Dial', kind: 'recipe', key: 'dial' }] });
  assert.equal(res.branchEu.Dial, 1000);
  assert.equal(res.rows.gear.count, 3);
  assert.equal(res.rows.plate.count, 14);
  assert.ok(res.consistency.ok);
  assert.equal(res.summary.crafts, 1 + 3 + 14 + 14);
});

test('an item with no recipe is reported unreachable', () => {
  const res = make({ targets: [{ label: 'X', kind: 'item', key: 'x', entries: [{ key: 'mystery', qty: 5 }] }] });
  assert.deepEqual(res.checks.unreachable, [{ key: 'mystery', count: 5 }]);
});

test('the structure bill of materials takes limited options first, then the primary one', () => {
  const desc = {
    id: 'gtceu:ctl',
    slices: [['CC', 'XX', 'K']],
    symbols: {
      C: { kind: 'controller' },
      X: { kind: 'oneOf', options: [{ kind: 'part', ability: 'input', limits: { min: 1 } }, { kind: 'blocks', blocks: ['casing'] }] },
      K: { kind: 'blocks', blocks: ['coil_a', 'coil_b'] },
    },
  };
  const { items, problems } = structureBom(desc, { input: ['hatch'] }, (ids) => ids[0]);
  assert.deepEqual(problems, []);
  assert.equal(items.get('gtceu:ctl'), 2);
  assert.equal(items.get('hatch'), 1);
  assert.equal(items.get('casing'), 1);
  assert.equal(items.get('coil_a'), 1);
});

test('cheapestOf prefers the reachable candidate with the lowest metric', () => {
  const model = solveCosts(recipes, { isBase: base(['ore', 'fluid:oil']) });
  assert.equal(cheapestOf(model, ['gear', 'plate', 'nothing']), 'plate');
});

test('comparison rows flag a gap over 20% and the page embeds the data safely', () => {
  const res = make();
  const preset = { gridKeys: ['gear'], comparison: [
    { id: 'g', label: 'Gears', unit: 'crafts', spec: { runsOf: 'grid' }, docs: 2 },
    { id: 'p', label: 'Plates', unit: 'items', spec: { count: 'plate' }, docs: 20, target: [1, 10] },
  ] };
  const rows = compareRows(res, preset);
  assert.equal(rows[0].flag, false);
  assert.equal(rows[1].flag, true);
  assert.equal(rows[1].inTarget, true);
  assert.equal(metricValue(res, { count: 'absent' }, preset), 0);
  const html = renderHtml(res, { comparison: rows, options: ['a <b>'] });
  assert.ok(html.startsWith('<!doctype html>'));
  assert.ok(!/<\/script><script>window/.test(html.split('window.__D=')[1].split('</script>')[0]));
  assert.ok(html.includes('a &lt;b&gt;'));
});
