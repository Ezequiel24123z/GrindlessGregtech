import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildWorld, renderWorld } from '../lib/chapter-gen.mjs';
import { importChapters } from '../lib/import-snbt.mjs';
import { chapterRole, textLimits } from '../lib/checks.mjs';
import { E, eraChapterOf } from '../processing-lines/pl-lib.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'gg-quests-'));

// a hand-written chapter in the book's format: one inline task, one tag-filter task, one extra task flag, a dependency out of the era
const CHAPTER = `{
\tautofocus_id: "1000000000000001"
\tdefault_hide_dependency_lines: false
\tdefault_quest_shape: ""
\tfilename: "tst_age"
\tgroup: "3F021F40CD26BF57"
\thide_quest_until_deps_visible: true
\ticon: "minecraft:stone"
\tid: "1000000000000000"
\torder_index: 7
\tquest_links: [ ]
\tquests: [
\t\t{
\t\t\tdescription: ["First."]
\t\t\ticon: "minecraft:stone"
\t\t\tid: "1000000000000001"
\t\t\trewards: [{ id: "1000000000000002", type: "xp", xp: 20 }]
\t\t\tshape: "rsquare"
\t\t\tsize: 1.5d
\t\t\ttasks: [{ id: "1000000000000003", type: "checkmark" }]
\t\t\ttitle: "First Step"
\t\t\tx: 0.0d
\t\t\ty: 0.0d
\t\t}
\t\t{
\t\t\tdependencies: ["1000000000000001", "2897E3EB8159710C"]
\t\t\tdescription: [
\t\t\t\t"One."
\t\t\t\t"Two."
\t\t\t]
\t\t\ticon: "minecraft:dirt"
\t\t\tid: "1000000000000004"
\t\t\toptional: true
\t\t\trewards: [
\t\t\t\t{ id: "1000000000000005", type: "xp", xp: 10 }
\t\t\t\t{ count: 2, id: "1000000000000006", item: "minecraft:dirt", type: "item" }
\t\t\t]
\t\t\ttasks: [
\t\t\t\t{ count: 4L, id: "1000000000000007", item: "minecraft:dirt", optional_task: true, type: "item" }
\t\t\t\t{
\t\t\t\t\tid: "1000000000000008"
\t\t\t\t\titem: {
\t\t\t\t\t\tCount: 1b
\t\t\t\t\t\tid: "itemfilters:tag"
\t\t\t\t\t\ttag: { value: "grindless:vein_samples" }
\t\t\t\t\t}
\t\t\t\t\ttitle: "Any Sample"
\t\t\t\t\ttype: "item"
\t\t\t\t}
\t\t\t]
\t\t\ttitle: "Second Step"
\t\t\tx: 2.0d
\t\t\ty: 1.5d
\t\t}
\t]
\tsubtitle: ["A test."]
\ttitle: "Test Age"
}
`;

test('the importer writes a data file the writer turns back into the same chapter', async () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'tst_age.snbt'), CHAPTER);
  const source = importChapters(dir, ['tst']).get('tst');
  const file = path.join(dir, 'quests-data.mjs');
  fs.writeFileSync(file, source);
  const m = await import(file);
  const world = buildWorld(new Map([['tst', [{ file, CHAPTER: m.CHAPTER, QUESTS: m.QUESTS, LINKS: [] }]]]));
  const out = renderWorld(world, ['tst'])[0].text;
  assert.equal(out, CHAPTER);
  assert.deepEqual(m.QUESTS.map((q) => q.key), ['TST_FIRST_STEP', 'TST_SECOND_STEP']);
  assert.deepEqual(m.QUESTS[1].deps, ['TST_FIRST_STEP', 'X:2897E3EB8159710C']);
});

test('the importer stops on a field it cannot carry', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'tst_age.snbt'), CHAPTER.replace('\t\t\ttitle: "First Step"', '\t\t\tsubtitle: "x"\n\t\t\ttitle: "First Step"'));
  assert.throws(() => importChapters(dir, ['tst']), /quest field "subtitle" is not carried/);
});

const CFG = {
  maxWords: 70,
  maxLines: 4,
  limits: {
    default: { maxWords: 70, maxLines: 4 },
    roles: { circuits: { maxWords: 120, maxLines: 5 }, capstone: { maxWords: 120, maxLines: 5 } },
    chapterRoles: { max_horizon: 'capstone' },
  },
};

test('text limits come from the chapter role: its file name suffix or an explicit entry', () => {
  assert.deepEqual(textLimits(CFG, 'ev_age'), { role: '', maxWords: 70, maxLines: 4 });
  assert.deepEqual(textLimits(CFG, 'ev_circuits'), { role: 'circuits', maxWords: 120, maxLines: 5 });
  assert.equal(chapterRole(CFG, 'max_horizon'), 'capstone');
  assert.equal(chapterRole(CFG, 'ev_machines'), '');
  assert.deepEqual(textLimits({ maxWords: 50, maxLines: 3 }, 'x_circuits'), { role: '', maxWords: 50, maxLines: 3 });
});

test('an E() link resolves its chapter from the quest id, and keeps the hint when no chapter holds it', () => {
  const book = tmp();
  fs.writeFileSync(path.join(book, 'ev_age.snbt'), '{ quests: [ { id: "AAAAAAAAAAAAAAAA" } ] }\n');
  fs.writeFileSync(path.join(book, 'ev_circuits.snbt'), '{ quests: [ { id: "BBBBBBBBBBBBBBBB" } ] }\n');
  fs.writeFileSync(path.join(book, 'pl_lv.snbt'), '{ quests: [ { id: "CCCCCCCCCCCCCCCC" } ] }\n');
  assert.equal(eraChapterOf('ev_age', 'BBBBBBBBBBBBBBBB', { bookDir: book }), 'ev_circuits');
  assert.equal(eraChapterOf('ev_age', 'AAAAAAAAAAAAAAAA', { bookDir: book }), 'ev_age');
  assert.equal(eraChapterOf('ev_age', 'CCCCCCCCCCCCCCCC', { bookDir: book }), 'ev_age');
  assert.equal(eraChapterOf('ev_age', 'DDDDDDDDDDDDDDDD', { bookDir: book }), 'ev_age');
  const over = tmp();
  fs.writeFileSync(path.join(over, 'ev_age.snbt'), '{ quests: [ { id: "BBBBBBBBBBBBBBBB" } ] }\n');
  assert.equal(eraChapterOf('x', 'BBBBBBBBBBBBBBBB', { bookDir: book, overDir: over }), 'ev_age');
});

test('E() builds the link from the resolved chapter', () => {
  // the pack's real book: this id is ev_age's first quest, wherever a data file says it is
  const e = E('k', 0, 0, 'steam_age', '7E510A95C066D14C');
  assert.equal(e.link, 'ev_age#7E510A95C066D14C');
  assert.equal(e.era, true);
});
