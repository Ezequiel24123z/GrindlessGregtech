import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildWorld, renderWorld, newId, descriptionOf, KINDS } from '../lib/chapter-gen.mjs';
import { eraGroupId, PROGRESSION_GROUP, BOOK_GROUPS, renderGroups } from '../lib/groups.mjs';
import { isEraChapter, isMergedEra, checkBook } from '../lib/checks.mjs';
import { loadBook } from '../lib/book.mjs';
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
  assert.ok(t.includes(`linked_quest: "1234567890ABCDEF"`) && !t.includes(`linked_quest: "${idA}"`));
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

test('group ids: pinned group wins, else Progression (one group for every era)', () => {
  assert.equal(eraGroupId({ filename: 'x' }), PROGRESSION_GROUP.id);
  assert.equal(eraGroupId({ filename: 'x', era: 'ev' }), PROGRESSION_GROUP.id);
  assert.equal(eraGroupId({ filename: 'x', group: '7C6BF927E205E2F4' }), '7C6BF927E205E2F4');
  assert.equal(eraGroupId({ filename: 'x', era: 'ev', group: '7C6BF927E205E2F4' }), '7C6BF927E205E2F4');
  assert.deepEqual(BOOK_GROUPS.map((g) => g.title), ['Progression', 'Quality of Life', 'Processing Lines']);
  for (const g of BOOK_GROUPS) assert.match(g.id, /^[1-7][0-9A-F]{15}$/, g.title);
  assert.throws(() => eraGroupId({ filename: 'x', group: 'abc' }), /16 uppercase hex/);
  const rendered = renderGroups();
  assert.equal(parse(rendered).chapter_groups.length, 3);
});

const sec = (file, name, origin, quests, extra = {}) => ({ file, CHAPTER: chapter({ section: { name, origin, ...(extra.heading ? { heading: extra.heading } : {}) } }), QUESTS: quests, LINKS: extra.LINKS || [] });

test('an era is one chapter <era>_age made of sections placed at their origin', () => {
  const main = sec('quests-data.mjs', 'Main', { x: 0, y: 0 }, [quest('A'), quest('B', { deps: ['A'], x: 2 })]);
  const side = sec('circuits-data.mjs', 'Circuits', { x: 10, y: 5 }, [quest('C', { x: 1, y: 1, deps: ['B'] })]);
  const out = render({ tst: [main, side] });
  assert.equal(out.length, 1);
  assert.equal(out[0].filename, 'tst_age');
  assert.equal(out[0].counts.quests, 3);
  const t = out[0].text;
  assert.ok(t.includes('x: 11.0d') && t.includes('y: 6.0d'));
  assert.ok(t.includes(`dependencies: ["${newId('tst', 'B')}"]`));
});

test('a section without an origin goes to the right of the previous ones', () => {
  const main = sec('quests-data.mjs', 'Main', { x: 0, y: 0 }, [quest('A', { x: 0 }), quest('B', { deps: ['A'], x: 3 })]);
  const other = { file: 'age1-data.mjs', CHAPTER: chapter(), QUESTS: [quest('C', { x: 0, deps: ['B'] })], LINKS: [] };
  const t = render({ tst: [main, other] })[0].text;
  const xs = [...t.matchAll(/^\t\t\tx: (-?[\d.]+)d/gm)].map((m) => Number(m[1]));
  assert.ok(Math.max(...xs) >= 3 + 8, `gap after the first section: ${xs}`);
});

test('a section heading is a reading quest with a checkmark and no rewards', () => {
  const heading = { key: 'HEAD', x: 0, y: -2, desc: ['Start here.'] };
  const main = sec('quests-data.mjs', 'Main', { x: 0, y: 0 }, [quest('A')]);
  const side = sec('circuits-data.mjs', 'Circuits', { x: 10, y: 0 }, [quest('C', { deps: ['A'] })], { heading });
  const t = render({ tst: [main, side] })[0].text;
  assert.ok(t.includes('title: "Circuits"'));
  assert.ok(t.includes('shape: "circle"'));
});

test('same-era quest links are dropped, other-era links stay', () => {
  const tst = [mod([quest('A'), quest('B', { deps: ['A'] })], { LINKS: [{ key: 'L1', ref: 'A', x: 2, y: 2 }, { key: 'L2', ref: 'tst:B', x: 3, y: 2 }] })];
  const world = buildWorld(new Map([['tst', tst]]));
  assert.equal(world.eras.get('tst').droppedLinks.length, 2);
  assert.ok(renderWorld(world, ['tst'])[0].text.includes('quest_links: [ ]'));
});

test('which chapters get the merged-era rules', () => {
  assert.equal(isEraChapter('ev_age'), true);
  assert.equal(isEraChapter('ev_circuits'), false);
  assert.equal(isMergedEra({ eraChapters: { enabled: [] } }, 'ev_age', {}), false);
  assert.equal(isMergedEra({ eraChapters: { enabled: ['ev_age'] } }, 'ev_age', {}), true);
  assert.equal(isMergedEra({}, 'ev_age', { mergedEras: true }), true);
  assert.equal(isMergedEra({}, 'lv_misc', { mergedEras: true }), false);
});

const lintEv = (quests, cfgExtra = {}) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gg-qb0-'));
  try {
    fs.mkdirSync(path.join(dir, 'chapters'));
    const [ch] = render({ ev: [mod(quests, { CHAPTER: { filename: 'ev_age' } })] }, {}, 'ev');
    fs.writeFileSync(path.join(dir, 'chapters', 'ev_age.snbt'), ch.text);
    fs.writeFileSync(path.join(dir, 'chapter_groups.snbt'), renderGroups());
    return checkBook(loadBook(dir), { eraChapters: { enabled: [], bridgeMaxEdge: 14 }, ...cfgExtra }, { mergedEras: true }).filter((f) => f.rule === 'connectivity');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

test('connectivity: one start, everything reachable inside the chapter', () => {
  const ok = [quest('A', { deps: [] }), quest('B', { deps: ['A'], x: 2 }), quest('C', { deps: ['B'], x: 4 })];
  assert.equal(lintEv(ok).length, 0);
  const second = [...ok, quest('D', { deps: [], x: 2, y: 3 })];
  assert.ok(lintEv(second).some((f) => /second start/.test(f.message)));
  const crossOnly = [...ok, quest('D', { deps: ['X:2897E3EB8159710C'], x: 2, y: 3 })];
  assert.ok(lintEv(crossOnly).some((f) => /second start/.test(f.message)));
});

