import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { parse } from '../../quests/lib/snbt.mjs';
import { loadBook } from '../../quests/lib/book.mjs';

const root = new URL('../../../', import.meta.url);
const chapter = parse(fs.readFileSync(new URL('pack/config/ftbquests/quests/chapters/welcome.snbt', root), 'utf8'));
const arrival = chapter.quests.find((q) => q.id === '69BDA9FBB0EB66F2');
const itemId = (reward) => typeof reward.item === 'string' ? reward.item : reward.item?.id;
const itemRewards = (id) => arrival.rewards.filter((r) => itemId(r) === id);

test('Arrival preserves claimed bread and torches and adds only the missing food', () => {
  assert.deepEqual(arrival.tasks, [{ id: '436062DAEF17D6AD', type: 'checkmark' }]);
  assert.deepEqual(arrival.rewards.find((r) => r.id === '21A6FB493B3D6DA8'),
    { count: 8, id: '21A6FB493B3D6DA8', item: 'minecraft:bread', type: 'item' });
  assert.deepEqual(arrival.rewards.find((r) => r.id === '4FE190B37FB472CA'),
    { count: 16, id: '4FE190B37FB472CA', item: 'minecraft:torch', type: 'item' });
  assert.equal(itemRewards('minecraft:bread').reduce((n, r) => n + r.count, 0), 64);
  assert.equal(itemRewards('minecraft:bread').filter((r) => r.id !== '21A6FB493B3D6DA8')[0].count, 56);
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

test('Arrival gifts one marked native HV prospector without infinite charge or fake range NBT', () => {
  const [reward] = itemRewards('gtceu:prospector.hv');
  assert.equal(itemRewards('gtceu:prospector.hv').length, 1);
  assert.equal(reward.id, '6325EC29C56BD824');
  assert.equal(reward.item.Count, 1);
  assert.deepEqual(reward.item.tag, {
    display: { Name: '{"translate":"item.grindless.field_prospector"}' },
    grindless_starter_prospector: 1,
  });
});

const scannerCode = fs.readFileSync(new URL('pack/kubejs/server_scripts/grindless/starter_prospector.js', root), 'utf8');
function scanner({ marked = true, empty = false, failure = false } = {}) {
  const cancelled = new Error('KubeJS EventExit');
  const calls = { queries: [], packets: [], messages: [], errors: [], cooldown: 0 };
  const dimension = Symbol('dimension');
  const position = Symbol('position');
  const entries = empty ? [] : ['gtceu:iron', 'gtceu:copper', 'gtceu:iron'].map((id) => ({ definition: () => id }));
  const veins = { size: () => entries.length, isEmpty: () => empty, forEach: (fn) => entries.forEach(fn) };
  const classes = {
    'com.gregtechceu.gtceu.integration.map.cache.server.ServerCache': {
      instance: { getNearbyVeins(...args) {
        calls.queries.push(args);
        if (failure) throw new Error('cache unavailable');
        return veins;
      }, prospectByDepositName(...args) { calls.packets.push(args); } },
    },
    'com.gregtechceu.gtceu.api.registry.GTRegistries': {
      ORE_VEINS: { getKey: (definition) => definition },
    },
  };
  let handler;
  vm.runInNewContext(scannerCode, {
    Java: { loadClass(name) { assert.ok(classes[name], name); return classes[name]; } },
    ItemEvents: { rightClicked(id, callback) { assert.equal(id, 'gtceu:prospector.hv'); handler = callback; } },
    Text: { translate: (...args) => args },
    console: { error: (message) => calls.errors.push(message) },
  });
  const cooldowns = { isOnCooldown: () => calls.cooldown > 0, addCooldown: (_, ticks) => { calls.cooldown = ticks; } };
  const player = {
    getCooldowns: () => cooldowns,
    getLevel: () => ({ getDimensionKey: () => dimension }),
    blockPosition: () => position,
    tell: (message) => calls.messages.push(message),
  };
  const event = {
    player,
    item: { getNbt: () => marked === null ? null : { getBoolean: (key) => key === 'grindless_starter_prospector' && marked },
      getItem: () => 'native-hv' },
    cancel() { throw cancelled; },
  };
  return { calls, dimension, position, veins, player, use() {
    try { handler(event); } catch (error) { if (error !== cancelled) throw error; return 'cancelled'; }
    return 'native';
  } };
}

test('Gift use queries a real 256-block radius and uses native discovery once per deposit type before cancelling', () => {
  assert.doesNotMatch(scannerCode, /Java\.loadClass\('[^']*\.network\./,
    'network classes are deliberately blocked by KubeJS; use GTM public discovery methods');
  const s = scanner();
  assert.equal(s.use(), 'cancelled');
  assert.deepEqual(s.calls.queries, [[s.dimension, s.position, 256]]);
  assert.deepEqual(s.calls.packets, [
    [s.dimension, 'gtceu:iron', s.position, s.player, 256],
    [s.dimension, 'gtceu:copper', s.position, s.player, 256],
  ]);
  assert.equal(s.calls.cooldown, 10);
  assert.equal(s.calls.messages[0][0], 'message.grindless.field_prospector.result');
  assert.equal(s.calls.errors.length, 0);
  assert.equal(s.use(), 'cancelled');
  assert.equal(s.calls.packets.length, 2, 'holding use must not flood map packets');
  s.calls.cooldown = 0;
  assert.equal(s.use(), 'cancelled');
  assert.equal(s.calls.packets.length, 4, 'a new scan needs no charge or persistent refill');
});

test('Crafted HV prospectors keep native behavior and empty surveys never claim that there are no ores', () => {
  for (const marked of [false, null]) {
    const s = scanner({ marked });
    assert.equal(s.use(), 'native');
    assert.equal(s.calls.queries.length, 0);
  }
  const empty = scanner({ empty: true });
  assert.equal(empty.use(), 'cancelled');
  assert.equal(empty.calls.packets.length, 0, 'no deposit lookup is needed without cached data');
  assert.equal(empty.calls.messages[0][0], 'message.grindless.field_prospector.no_data');
});

test('Failed surveys notify the player, log the error and still suppress the unsafe native scan', () => {
  const s = scanner({ failure: true });
  assert.equal(s.use(), 'cancelled');
  assert.equal(s.calls.packets.length, 0);
  assert.match(s.calls.errors[0], /cache unavailable/);
  assert.equal(s.calls.messages[0][0], 'message.grindless.field_prospector.error');
});

test('Gift-only tooltip replaces stock range/energy claims and all added text has both translations', () => {
  const languages = {};
  let tooltip;
  vm.runInNewContext(fs.readFileSync(new URL('pack/kubejs/client_scripts/grindless/starter_prospector_lang.js', root), 'utf8'), {
    ClientEvents: { lang(locale, callback) {
      languages[locale] = {};
      callback({ add(namespace, key, value) { assert.equal(namespace, 'grindless'); languages[locale][key] = value; } });
    } },
    ItemEvents: { tooltip(callback) { callback({ addAdvanced(id, fn) {
      assert.equal(id, 'gtceu:prospector.hv'); tooltip = fn;
    } }); } },
    Text: { translate: (key) => key, aqua: (s) => s, green: (s) => s, gray: (s) => s, darkGray: (s) => s },
  });
  assert.deepEqual(Object.keys(languages.en_us).sort(), Object.keys(languages.es_es).sort());
  const lines = ['Gift name', 'Stock range', 'Stock energy'];
  const list = { get: (i) => lines[i], clear: () => { lines.length = 0; }, add: (s) => lines.push(s) };
  tooltip({ getNbt: () => ({ getBoolean: () => false }) }, false, list);
  assert.deepEqual(lines, ['Gift name', 'Stock range', 'Stock energy']);
  tooltip({ getNbt: () => ({ getBoolean: () => true }) }, false, list);
  assert.deepEqual(lines, ['Gift name', 'tooltip.grindless.field_prospector.range',
    'tooltip.grindless.field_prospector.power', 'tooltip.grindless.field_prospector.terrain']);
  for (const key of lines.slice(1)) assert.ok(languages.en_us[key]);
  assert.match(languages.en_us['tooltip.grindless.field_prospector.terrain'], /generated terrain/);
  assert.match(languages.en_us['message.grindless.field_prospector.no_data'], /does not mean there are no ores/);
});
