import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from '../../quests/lib/snbt.mjs';
import { loadBook } from '../../quests/lib/book.mjs';

const root = new URL('../../../', import.meta.url);
const chapter = parse(fs.readFileSync(new URL('pack/config/ftbquests/quests/chapters/welcome.snbt', root), 'utf8'));
const arrival = chapter.quests.find((q) => q.id === '69BDA9FBB0EB66F2');
const itemId = (reward) => typeof reward.item === 'string' ? reward.item : reward.item?.id;
const itemRewards = (id) => arrival.rewards.filter((r) => itemId(r) === id);

test('Arrival keeps its bread and torch reward ids, with the bread in one stack of 64', () => {
  assert.deepEqual(arrival.tasks, [{ id: '436062DAEF17D6AD', type: 'checkmark' }]);
  assert.deepEqual(arrival.rewards.find((r) => r.id === '21A6FB493B3D6DA8'),
    { count: 64, id: '21A6FB493B3D6DA8', item: 'minecraft:bread', type: 'item' });
  assert.deepEqual(arrival.rewards.find((r) => r.id === '4FE190B37FB472CA'),
    { count: 16, id: '4FE190B37FB472CA', item: 'minecraft:torch', type: 'item' });
  assert.equal(itemRewards('minecraft:bread').length, 1);
});

test('Arrival gives exactly four diamond working tools with Efficiency V, without armor or a sword', () => {
  const tools = arrival.rewards.filter((r) => itemId(r)?.startsWith('minecraft:diamond_'));
  assert.deepEqual(tools.map(itemId).sort(), ['axe', 'hoe', 'pickaxe', 'shovel'].map((t) => `minecraft:diamond_${t}`).sort());
  for (const reward of tools) {
    assert.equal(reward.type, 'item');
    assert.equal(reward.item.Count, 1);
    assert.deepEqual(reward.item.tag, { Enchantments: [{ id: 'minecraft:efficiency', lvl: 5 }] });
  }
});

test('Starter additions leave the neutronium toolbox and all book ids readable', () => {
  const toolbox = chapter.quests.find((q) => q.id === '047B55ED9C952BC9');
  assert.equal(toolbox.rewards.length, 20);
  for (const reward of toolbox.rewards) assert.equal(reward.item.tag.Unbreakable, 1);
  const book = loadBook(fileURLToPath(new URL('pack/config/ftbquests/quests', root)));
  for (const [id, uses] of book.objectIds) {
    assert.match(id, /^[0-7][0-9A-F]{15}$/);
    assert.notEqual(BigInt(`0x${id}`), 0n);
    assert.equal(uses.length, 1, id);
  }
});

test('Arrival gifts one ordinary, fully charged HV prospector: no marker, rename or infinite charge', () => {
  const rewards = itemRewards('gtceu:prospector.hv');
  assert.equal(rewards.length, 1);
  const [reward] = rewards;
  assert.equal(reward.id, '6325EC29C56BD824');
  assert.equal(reward.item.Count, 1);
  assert.deepEqual(reward.item.tag, { Charge: 1600000 });
});

test('The custom prospector survey is gone: GTM owns right-click, GUI and map overlay', () => {
  for (const file of [
    'pack/kubejs/server_scripts/grindless/starter_prospector.js',
    'pack/kubejs/client_scripts/grindless/starter_prospector_lang.js',
  ]) assert.equal(fs.existsSync(new URL(file, root)), false, file);
  assert.doesNotMatch(fs.readFileSync(new URL('pack/config/ftbquests/quests/chapters/welcome.snbt', root), 'utf8'),
    /grindless_starter_prospector|field_prospector/);
});
