// AF-A2 lint classes: creative-reward, count-stack, same-title, empty-description, task-hidden, task-no-recipe. Each has a case that
// fires and one that does not, plus the level control (classLevels, options.newClasses).
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkBook, recipeOutputIds } from '../lib/checks.mjs';

let n = 0;
const quest = (o = {}) => ({
  id: String(++n).padStart(16, '0'), title: 'Quest ' + n, x: n * 2, y: 0, size: 1, deps: [], hideDependencyLines: false,
  description: ['Text.'], tasks: [{ type: 'item', itemId: 'gtceu:steel_ingot', count: 1 }], rewards: [{ type: 'item', itemId: 'minecraft:stick', count: 1 }],
  ...o,
});
const bookOf = (quests, filename = 'x_chapter') => {
  const ch = { filename, title: 'X', quests, links: [], group: '', raw: {} };
  quests.forEach((q) => { q.chapter = ch; });
  return { chapters: [ch], groups: [], questById: new Map(quests.map((q) => [q.id, q])), objectIds: new Map() };
};
const run = (quests, cfg = {}, options = {}, filename) => checkBook(bookOf(quests, filename), cfg, options);
const rule = (fs, r) => fs.filter((f) => f.rule === r);

test('class levels: info by default, cfg.classLevels sets it, options.newClasses makes warnings', () => {
  const qs = () => [quest({ description: [] })];
  assert.equal(rule(run(qs()), 'empty-description')[0].level, 'info');
  assert.equal(rule(run(qs(), { classLevels: { 'empty-description': 'error' } }), 'empty-description')[0].level, 'error');
  assert.equal(rule(run(qs(), {}, { newClasses: true }), 'empty-description')[0].level, 'warn');
});

test('empty-description: fires on a quest without text, not on one with text or on a checkmark-only quest', () => {
  const nl = { newClasses: true };
  assert.equal(rule(run([quest({ description: ['', '  '] })], {}, nl), 'empty-description').length, 1);
  assert.equal(rule(run([quest()], {}, nl), 'empty-description').length, 0);
  assert.equal(rule(run([quest({ description: [], tasks: [{ type: 'checkmark' }] })], {}, nl), 'empty-description').length, 0);
});

test('same-title: fires on two quests with one title in a chapter, not on distinct titles or the same title in two chapters', () => {
  const nl = { newClasses: true };
  assert.equal(rule(run([quest({ title: 'Steel' }), quest({ title: '&6steel' })], {}, nl), 'same-title').length, 1);
  assert.equal(rule(run([quest({ title: 'Steel' }), quest({ title: 'Iron' })], {}, nl), 'same-title').length, 0);
  assert.equal(rule(run([quest({ title: 'Steel' })], {}, nl, 'a'), 'same-title').length, 0);
});

test('creative-reward: fires on a creative or debug item reward, not on an ordinary one or an allowed chapter or quest', () => {
  const nl = { newClasses: true };
  const bad = () => quest({ rewards: [{ type: 'item', itemId: 'gtceu:creative_energy', count: 1 }] });
  assert.equal(rule(run([bad()], {}, nl), 'creative-reward').length, 1);
  assert.equal(rule(run([quest()], {}, nl), 'creative-reward').length, 0);
  assert.equal(rule(run([bad()], { creativeRewards: { allowChapters: ['end_chapter'] } }, nl, 'end_chapter'), 'creative-reward').length, 0);
  const b = bad();
  assert.equal(rule(run([b], { creativeRewards: { allowQuests: [b.id] } }, nl), 'creative-reward').length, 0);
});

test('count-stack: fires above 36 stacks of the item, not at the limit, and honours stackSizes', () => {
  const nl = { newClasses: true };
  const t = (count, id = 'gtceu:steel_ingot') => [quest({ tasks: [{ type: 'item', itemId: id, count }] })];
  assert.equal(rule(run(t(2305), {}, nl), 'count-stack').length, 1);
  assert.equal(rule(run(t(2304), {}, nl), 'count-stack').length, 0);
  assert.equal(rule(run(t(600, 'x:pearl'), { stackSizes: { 'x:pearl': 16 } }, nl), 'count-stack').length, 1, '36 x 16 = 576');
});

test('task-hidden and task-no-recipe: fire on a hidden or recipe-less task item, not on an obtainable one', () => {
  const nl = { newClasses: true, hidden: new Set(['gtceu:raw_antimony']), recipeOutputs: new Set(['gtceu:steel_ingot', 'gtceu:raw_antimony']) };
  const t = (id) => [quest({ tasks: [{ type: 'item', itemId: id, count: 1 }] })];
  assert.equal(rule(run(t('gtceu:raw_antimony'), {}, nl), 'task-hidden').length, 1);
  assert.equal(rule(run(t('gtceu:steel_ingot'), {}, nl), 'task-hidden').length, 0);
  assert.equal(rule(run(t('gtceu:steel_ingot'), {}, nl), 'task-no-recipe').length, 0);
  assert.equal(rule(run(t('gtceu:ghost'), {}, nl), 'task-no-recipe').length, 1);
  assert.equal(rule(run(t('gtceu:ghost'), { recipeLessOk: ['gtceu:ghost'] }, nl), 'task-no-recipe').length, 0);
  assert.equal(rule(run(t('gtceu:ghost'), {}, { newClasses: true }), 'task-no-recipe').length, 0, 'no recipe data, no check');
});

test('recipeOutputIds reads fluid outputs as fluid and bucket ids, not fluid inputs', () => {
  const out = recipeOutputIds([
    { inputs: { fluid: [{ content: { value: [{ fluid: 'a:nitrogen' }] } }] }, outputs: { fluid: [{ content: { value: [{ fluid: 'a:liquid_nitrogen' }] } }] } },
  ]);
  assert.deepEqual([...out].sort(), ['a:liquid_nitrogen', 'a:liquid_nitrogen_bucket']);
});

test('recipeOutputIds reads GT, vanilla and KubeJS outputs and not inputs', () => {
  const out = recipeOutputIds([
    { outputs: { item: [{ content: { ingredient: { item: 'a:gt_out' } } }] }, inputs: { item: [{ content: { ingredient: { item: 'a:gt_in' } } }] } },
    { result: { item: 'a:vanilla_out' }, ingredients: [{ item: 'a:vanilla_in' }] },
    { results: [{ id: 'a:multi', count: 2 }] },
    { output: 'a:plain' },
  ]);
  assert.deepEqual([...out].sort(), ['a:gt_out', 'a:multi', 'a:plain', 'a:vanilla_out']);
});
