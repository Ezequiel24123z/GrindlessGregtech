#!/usr/bin/env node
// Quest book linter for Gregtech Grindless (FTB Quests SNBT). Rules: docs/misiones.md, section "Tools".
//
//   node tools/quests/lint.mjs [--book <dir>] [--chapter <name>[,<name>...]] [--items <items.json>] [--tags <tags.json>]
//                              [--config <file>] [--json <out.json>] [--export <out.json>] [--strict] [--quiet]
//
// --items / --tags take the gg_dump exports (kubejs-exported/items.json and tags.json of a test run) and turn on the
// item id and item tag checks; the server test gg_test_quests does the same check inside the game.
// Exit code: 0 clean, 1 errors (or warnings with --strict), 2 the tool itself failed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadBook } from './lib/book.mjs';
import { checkBook, chapterEdges, questLabel, stripCodes } from './lib/checks.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..', '..');

function parseArgs(argv) {
  const a = { chapters: [] };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const next = () => argv[++i];
    if (k === '--book') a.book = next();
    else if (k === '--chapter') a.chapters.push(...next().split(',').filter(Boolean));
    else if (k === '--items') a.items = next();
    else if (k === '--tags') a.tags = next();
    else if (k === '--config') a.config = next();
    else if (k === '--json') a.json = next();
    else if (k === '--export') a.export = next();
    else if (k === '--strict') a.strict = true;
    else if (k === '--quiet') a.quiet = true;
    else if (k === '--help' || k === '-h') a.help = true;
    else throw new Error('unknown argument ' + k);
  }
  return a;
}

function readItems(file) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const list = Array.isArray(raw) ? raw : raw.items;
  return new Set(list);
}

function readTags(file) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const map = raw.item || raw;
  return new Set(Object.keys(map).filter((k) => Array.isArray(map[k]) && map[k].length > 0));
}

function exportModel(book, findings, chapters) {
  const out = { book: book.dir, generated: new Date().toISOString(), chapters: [] };
  for (const ch of book.chapters) {
    if (chapters.length && !chapters.includes(ch.filename)) continue;
    const mine = findings.filter((f) => f.chapter === ch.filename);
    const levelOf = (id) => {
      const fs_ = mine.filter((f) => f.quest === id && f.level !== 'info');
      return fs_.some((f) => f.level === 'error') ? 'error' : fs_.length ? 'warn' : 'ok';
    };
    const { edges, cross } = chapterEdges(book, ch);
    const edgeRules = new Set(['backward', 'long-edge', 'through-node', 'crossing', 'vertical-long']);
    out.chapters.push({
      filename: ch.filename,
      title: stripCodes(ch.title),
      group: (book.groups.find((g) => g.id === ch.group) || {}).title || '',
      errors: mine.filter((f) => f.level === 'error').length,
      warnings: mine.filter((f) => f.level === 'warn').length,
      quests: ch.quests.map((q) => ({
        id: q.id,
        title: questLabel(q),
        x: q.x,
        y: q.y,
        size: q.size,
        shape: q.shape,
        optional: q.optional,
        root: q.deps.length === 0,
        hideLines: q.hideDependencyLines,
        level: levelOf(q.id),
        cross: cross.filter((c) => c.to === q).map((c) => ({ chapter: c.from.chapter.filename, title: questLabel(c.from) })),
      })),
      edges: edges.map((e) => {
        const bad = mine.filter((f) => edgeRules.has(f.rule) && f.quest === e.to.id && (f.other === e.from.id || f.rule === 'crossing' || f.rule === 'through-node'));
        const own = bad.filter((f) => f.other === e.from.id || f.rule === 'crossing' || (f.rule === 'through-node' && f.message.includes(`"${questLabel(e.from)}"`)));
        return { from: e.from.id, to: e.to.id, hidden: e.to.hideDependencyLines, level: own.some((f) => f.level === 'error') ? 'error' : own.length ? 'warn' : 'ok' };
      }),
      findings: mine,
    });
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 9).join('\n'));
    return 0;
  }
  const bookDir = path.resolve(args.book || path.join(repo, 'pack', 'config', 'ftbquests', 'quests'));
  const cfg = JSON.parse(fs.readFileSync(args.config || path.join(here, 'lint-config.json'), 'utf8'));
  const book = loadBook(bookDir);
  const options = { chapters: args.chapters };
  if (args.items) options.items = readItems(args.items);
  if (args.tags) options.tags = readTags(args.tags);
  const findings = checkBook(book, cfg, options);
  const errors = findings.filter((f) => f.level === 'error');
  const warns = findings.filter((f) => f.level === 'warn');

  if (!args.quiet) {
    for (const ch of book.chapters) {
      if (args.chapters.length && !args.chapters.includes(ch.filename)) continue;
      const mine = findings.filter((f) => f.chapter === ch.filename && f.level !== 'info');
      const e = mine.filter((f) => f.level === 'error').length;
      const w = mine.length - e;
      const deps = ch.quests.reduce((n, q) => n + q.deps.length, 0);
      console.log(`${ch.filename} "${stripCodes(ch.title)}": ${ch.quests.length} quests, ${deps} dependencies, ${e} errors, ${w} warnings`);
      for (const f of mine.sort((a, b) => (a.level === b.level ? 0 : a.level === 'error' ? -1 : 1) || a.rule.localeCompare(b.rule))) {
        console.log(`  ${f.level === 'error' ? 'ERROR' : 'WARN '} ${f.rule.padEnd(14)} ${f.questTitle ? '"' + f.questTitle + '" ' : ''}${f.message}`);
      }
    }
    const dups = findings.filter((f) => f.rule === 'dup-id' && !book.chapters.some((c) => c.filename === f.chapter));
    for (const f of dups) console.log(`  ERROR dup-id ${f.message}`);
  }
  if (!options.items) console.log('note: item ids not checked here (pass --items <items.json> from a gg_dump run; gg_test_quests checks them in game)');
  console.log(`total: ${errors.length} errors, ${warns.length} warnings`);
  if (args.json) fs.writeFileSync(args.json, JSON.stringify(findings, null, 2));
  if (args.export) fs.writeFileSync(args.export, JSON.stringify(exportModel(book, findings, args.chapters), null, 2));
  return errors.length > 0 || (args.strict && warns.length > 0) ? 1 : 0;
}

try {
  process.exitCode = main();
} catch (e) {
  console.error('lint failed: ' + (e && e.stack ? e.stack : e));
  process.exitCode = 2;
}
