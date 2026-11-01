import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { buildWorld, renderWorld, newId, descriptionOf, KINDS } from '../lib/chapter-gen.mjs';
import { eraGroupId, PROGRESSION_GROUP, ERA_GROUPS } from '../lib/groups.mjs';
import { parse } from '../lib/snbt.mjs';

const it = (item, count) => ({ type: 'item', item, count });
const ck = () => ({ type: 'checkmark' });
const xp = (n) => ({ type: 'xp', xp: n });
const TEACH = { for: 'It makes a thing.', needs: 'Power.', unlocks: 'The next one.', automate: 'Loop it.' };

const chapter = (over = {}) => ({ filename: 'tst_age', title: 'T', subtitle: ['s'], icon: 'minecraft:stone', autofocus: 'A', order: 3, ...over });
const quest = (key, over = {}) => ({ key, title: key, icon: 'minecraft:stone', x: 0, y: 0, deps: ['X:2897E3EB8159710C'], desc: ['Text.'], tasks: [ck()], rewards: [xp(10)], ...over });
const mod = (quests, extra = {}) => ({ file: 'quests-data.mjs', CHAPTER: chapter(extra.CHAPTER), QUESTS: quests, LINKS: extra.LINKS || [], PACKAGES: extra.PACKAGES, LANDED: extra.LANDED, ALL_STATE: extra.ALL_STATE });
const render = (mods, opts, era = 'tst') => renderWorld(buildWorld(new Map(Object.entries(mods)), opts), [era]);
const text = (quests, extra) => render({ tst: [mod(quests, extra)] })[0].text;

test('ids come from the era seed and the key; a pinned id wins', () => {
  const sha = crypto.createHash('sha256').update('c2-tst-quests|A').digest().subarray(0, 8);
  sha[0] = (sha[0] & 0x7f) | 0x10;
  const id = Buffer.from(sha).toString('hex').toUpperCase();
  assert.equal(newId('tst', 'A'), id);
  assert.match(id, /^[1-7][0-9A-F]{15}$/);
  const t = text([quest('A'), quest('B', { id: '7E510A95C066D14C', deps: ['A'] })]);
  assert.ok(t.includes(`id: "${id}"`));
  assert.ok(t.includes('id: "7E510A95C066D14C"'));
  assert.ok(t.includes(`dependencies: ["${id}"]`));
  assert.ok(t.includes(`id: "${newId('tst', 'A|task|0|checkmark')}"`));
  assert.ok(t.includes(`id: "${newId('tst', 'A|reward|0|xp')}"`));
  assert.ok(t.includes(`id: "${newId('tst', 'chapter|tst_age')}"`));
});

test('the output is in the book format and parses', () => {
  const t = text([quest('A', { tasks: [it('minecraft:stone', 4), ck()], rewards: [xp(10), it('minecraft:dirt', 2)] })]);
  assert.ok(!t.startsWith('\uFEFF') && !t.includes('\r') && t.endsWith('}\n'));
  assert.ok(t.includes('count: 4L') && t.includes('count: 2,'));
  assert.ok(t.includes(`group: "${PROGRESSION_GROUP.id}"`));
  assert.ok(t.includes('quest_links: [ ]'));
  const keys = [...t.matchAll(/^\t([a-z_]+):/gm)].map((m) => m[1]);
  assert.deepEqual(keys, [...keys].sort());
  assert.ok(parse(t));
});

test('kind gives the shape and size, and an explicit shape wins', () => {
  const t = text([
    quest('A', { kind: 'start' }),
    quest('B', { kind: 'step', deps: ['A'] }),
    quest('C', { kind: 'reading', deps: ['A'] }),
    quest('D', { kind: 'side', deps: ['A'] }),
    quest('E', { kind: 'exit', shape: 'square', deps: ['A'] }),
  ]);
  const blocks = t.split('\n\t\t{\n').slice(1);
  const get = (title) => blocks.find((b) => b.includes(`title: "${title}"`));
  assert.ok(get('A').includes('shape: "rsquare"') && get('A').includes('size: 1.5d'));
  assert.ok(!get('B').includes('shape:') && !get('B').includes('size:'));
  assert.ok(get('C').includes('shape: "circle"') && get('C').includes('size: 0.75d'));
  assert.ok(get('D').includes('optional: true') && get('D').includes('shape: "hexagon"'));
  assert.ok(get('E').includes('shape: "square"') && get('E').includes('size: 1.75d'));
  assert.throws(() => text([quest('A', { kind: 'nope' })]), /unknown kind/);
  for (const k of ['machine', 'plant', 'signature', 'wafer', 'circuit', 'process', 'milestone']) assert.ok(KINDS[k]);
});

test('teach is required for its kinds and joins into the description', () => {
  for (const kind of ['machine', 'plant', 'signature', 'wafer', 'circuit', 'process']) {
    assert.throws(() => text([quest('A', { kind })]), /needs teach/, kind);
  }
  assert.throws(() => text([quest('A', { kind: 'machine', teach: { ...TEACH, needs: '' } })]), /teach\.needs is missing/);
  assert.throws(() => text([quest('A', { teach: { ...TEACH, why: 'x' } })]), /teach\.why/);
  assert.doesNotThrow(() => text([quest('A', { kind: 'step' }), quest('B', { kind: 'milestone', deps: ['A'] })]));
  const q = quest('A', { kind: 'machine', teach: TEACH, desc: ['Extra.'] });
  assert.deepEqual(descriptionOf(q), ['It makes a thing. Power. The next one. Loop it.', 'Extra.']);
  const t = text([q]);
  assert.ok(t.includes('"It makes a thing. Power. The next one. Loop it."') && t.includes('"Extra."'));
  assert.ok(t.includes('shape: "gear"') && t.includes('size: 1.25d'));
});

test('quests without kind or teach are unaffected', () => {
  const t = text([quest('A', { shape: 'gear', size: 1.5 })]);
  assert.ok(t.includes('description: ["Text."]'));
  assert.ok(t.includes('shape: "gear"') && t.includes('size: 1.5d'));
});

test('links resolve by key, by era and by X:, and are written in the chapter', () => {
  const luv = [mod([quest('FUSION', { x: 1 })], { CHAPTER: { filename: 'luv_age', autofocus: 'FUSION' } })];
  const tst = [mod([quest('A'), quest('B', { deps: ['A', 'luv:FUSION'] })], {
    LINKS: [{ key: 'L1', ref: 'A', x: 2, y: -3 }, { key: 'L2', ref: 'X:1234567890ABCDEF', x: 4, y: 0, shape: 'circle', size: 0.5 }],
  })];
  const t = render({ luv, tst })[0].text;
  const idA = newId('tst', 'A');
  const idF = newId('luv', 'FUSION');
  assert.ok(t.includes(`dependencies: ["${idA}", "${idF}"]`));
  assert.ok(t.includes(`linked_quest: "${idA}"`) && t.includes('linked_quest: "1234567890ABCDEF"'));
  assert.ok(t.includes('shape: "circle"') && t.includes('size: 0.5d'));
  assert.ok(!t.includes('quest_links: [ ]'));
  assert.throws(() => render({ tst: [mod([quest('A', { deps: ['nope:A'] })])] }), /not loaded/);
  assert.throws(() => text([quest('A', { deps: ['MISSING'] })]), /unknown dependency/);
  assert.throws(() => text([quest('A')], { LINKS: [{ key: 'A', ref: 'A', x: 0, y: 0 }] }), /duplicate key/);
});

test('the package gate leaves quests out, rewires their children, and honours fallback and slot', () => {
  const quests = [
    quest('A'),
    quest('B', { deps: ['A'], pkg: ['P1'], x: 2 }),
    quest('C', { deps: ['B'], x: 4, y: 1, fallback: { unless: ['P1'], x: 3, y: 2, deps: ['A'] } }),
    quest('D', { deps: ['C'], pkg: ['P2'] }),
  ];
  const extra = { PACKAGES: ['P1', 'P2'], LANDED: ['P2'], ALL_STATE: ['P1', 'P2'] };
  const [off] = render({ tst: [mod(quests, extra)] });
  assert.equal(off.counts.quests, 3);
  assert.equal(off.counts.waiting, 1);
  assert.ok(!off.text.includes(newId('tst', 'B')));
  assert.ok(off.text.includes(`dependencies: ["${newId('tst', 'A')}"]`));
  assert.ok(off.text.includes('x: 3.0d') && off.text.includes('y: 2.0d'));
  const [all] = render({ tst: [mod(quests, extra)] }, { allPackages: true });
  assert.equal(all.counts.quests, 4);
  assert.ok(all.text.includes(`dependencies: ["${newId('tst', 'B')}"]`));
  assert.throws(() => text([quest('A', { pkg: ['ZZ'] })], extra), /unknown package ZZ/);
  assert.throws(() => text([quest('A')], { PACKAGES: ['P1'], LANDED: ['P9'] }), /unknown package P9/);
  const slots = [quest('A'), quest('T', { deps: ['A'], pkg: ['P1'], slot: 's' }), quest('S', { deps: ['A'], pkg: ['P2'], slot: 's' })];
  assert.throws(() => text(slots, { PACKAGES: ['P1', 'P2'], LANDED: ['P1', 'P2'] }), /share slot s/);
  assert.doesNotThrow(() => text(slots, { PACKAGES: ['P1', 'P2'], LANDED: ['P1'] }));
});

test('a quest whose dependencies all wait would float', () => {
  const quests = [quest('A', { pkg: ['P1'], deps: [] }), quest('B', { deps: ['A'] })];
  assert.throws(() => text(quests, { PACKAGES: ['P1'], LANDED: [] }), /would float/);
});

test('raw fields pass through and cannot shadow modelled ones', () => {
  const t = text([quest('A', { raw: { progression_mode: '"linear"' }, tasks: [{ type: 'checkmark', raw: { title: '"x"' } }] })]);
  assert.ok(t.includes('progression_mode: "linear"') && t.includes('title: "x"'));
  assert.throws(() => text([quest('A', { raw: { title: '"x"' } })]), /collides/);
});

test('group ids: pinned group wins, else the era group, else Progression', () => {
  assert.equal(eraGroupId({ filename: 'x' }), PROGRESSION_GROUP.id);
  assert.equal(eraGroupId({ filename: 'x', era: 'tst' }), PROGRESSION_GROUP.id);
  assert.equal(eraGroupId({ filename: 'x', group: '7C6BF927E205E2F4' }), '7C6BF927E205E2F4');
  assert.equal(eraGroupId({ filename: 'x', era: 'ev', group: '7C6BF927E205E2F4' }), '7C6BF927E205E2F4');
  for (const era of ['steam', 'lv', 'mv', 'hv']) assert.equal(eraGroupId({ filename: 'x', era }), ERA_GROUPS.steam.id, era);
  assert.equal(eraGroupId({ filename: 'x', era: 'ev' }), ERA_GROUPS.ev.id);
  assert.equal(new Set(Object.values(ERA_GROUPS).map((g) => g.id)).size, 13);
  for (const g of Object.values(ERA_GROUPS)) assert.match(g.id, /^[1-7][0-9A-F]{15}$/, g.title);
  assert.throws(() => eraGroupId({ filename: 'x', group: 'abc' }), /16 uppercase hex/);
});
