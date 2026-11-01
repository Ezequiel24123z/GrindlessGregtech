import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const tool = path.join(here, '..', 'render-book.mjs');
const repo = path.resolve(here, '..', '..', '..');

const quest = (id, title, x, y, deps = '') => `{ id: "${id}" title: "${title}" x: ${x}d y: ${y}d${deps ? ` dependencies: ["${deps}"]` : ''} tasks: [{ id: "T${id}", type: "checkmark" }] rewards: [{ id: "R${id}", type: "xp", xp: 10 }] }`;

function makeBook(root, quests) {
  fs.mkdirSync(path.join(root, 'chapters'), { recursive: true });
  fs.writeFileSync(path.join(root, 'chapter_groups.snbt'), '{ chapter_groups: [ { id: "00000000000000G1", title: "Main" } ] }');
  fs.writeFileSync(path.join(root, 'data.snbt'), '{ default_quest_shape: "circle" }');
  fs.writeFileSync(path.join(root, 'chapters', 'one.snbt'), `{ id: "0000000000000C01" filename: "one" group: "00000000000000G1" title: "One" quests: [ ${quests.join('\n')} ] }`);
}

const run = (...args) => execFileSync(process.execPath, [tool, ...args], { encoding: 'utf8' });

test('renders a chapter, index and CSVs, and compares a moved and an added quest', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'render-book-'));
  const bookA = path.join(tmp, 'bookA'), bookB = path.join(tmp, 'bookB');
  makeBook(bookA, [quest('0000000000000A01', 'Root', 0, 0), quest('0000000000000A02', 'Child', 2, 0, '0000000000000A01')]);
  makeBook(bookB, [quest('0000000000000A01', 'Root', 0, 0), quest('0000000000000A02', 'Child', 2, 1, '0000000000000A01'), quest('0000000000000A03', 'New', 4, 0, '0000000000000A02')]);
  const before = path.join(tmp, 'before'), after = path.join(tmp, 'after'), cmp = path.join(tmp, 'cmp');
  run('--book', bookA, '--out', before);
  run('--book', bookB, '--out', after);

  const svg = fs.readFileSync(path.join(before, 'svg', 'one.svg'), 'utf8');
  assert.match(svg, /<svg /);
  assert.match(svg, /Root/);
  assert.equal((svg.match(/<line /g) || []).length, 1);
  assert.match(fs.readFileSync(path.join(before, 'chapters.csv'), 'utf8'), /^one,One,Main,2,1,2,2,0,0$/m);
  assert.ok(fs.existsSync(path.join(before, 'index.html')));
  assert.equal(fs.readFileSync(path.join(before, 'csv', 'one.csv'), 'utf8').trim().split('\n').length, 3);
  run('--book', bookA, '--out', before);
  assert.equal(fs.readFileSync(path.join(before, 'svg', 'one.svg'), 'utf8'), svg);

  run('--compare', before, after, '--out', cmp);
  const page = fs.readFileSync(path.join(cmp, 'one.html'), 'utf8');
  assert.match(page, /added: New/);
  assert.match(page, /moved: Child \(2, 0\) → \(2, 1\)/);
  assert.match(page, /quests: 2 → 3/);
  assert.match(fs.readFileSync(path.join(cmp, 'index.html'), 'utf8'), /2 → 3/);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('the real book renders and its quest counts match the linter', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'render-book-'));
  run('--out', tmp);
  const lint = execFileSync(process.execPath, [path.join(here, '..', 'lint.mjs')], { encoding: 'utf8' });
  const expected = new Map([...lint.matchAll(/^(\S+) ".*?": (\d+) quests/gm)].map((m) => [m[1], Number(m[2])]));
  const rows = fs.readFileSync(path.join(tmp, 'chapters.csv'), 'utf8').trim().split('\n').slice(1);
  assert.equal(rows.length, expected.size);
  for (const r of rows) {
    const name = r.split(',')[0];
    const cells = r.split(',');
    assert.equal(Number(cells[cells.length - 6]), expected.get(name), name);
    assert.ok(fs.existsSync(path.join(tmp, 'svg', name + '.svg')));
  }
  fs.rmSync(tmp, { recursive: true, force: true });
});
