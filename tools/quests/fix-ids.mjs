#!/usr/bin/env node
// Rewrites the quest-book ids FTB Quests 2001.4 cannot read.
//
// FTB Quests 2001.4 (MC 1.20.1) reads every id with Long.parseLong(hex, 16) (BaseQuestFile#readID,
// QuestObjectBase#parseCodeString). A 16-digit id that starts with 8-F is above 7FFFFFFFFFFFFFFF and fails: the object
// gets a new random id at every load (its progress and claimed rewards are lost) and every dependency on it is dropped,
// so the quest floats with no line. FTB Quests' own editor never makes such ids (Math.abs(nextLong())); our old
// generators did.
//
// The fix clears the top bit (first digit 8-F -> 0-7). It is deterministic and idempotent, so chapters can be fixed one
// at a time: a link from a chapter not fixed yet still points to the same new id once that chapter is fixed.
//
//   node tools/quests/fix-ids.mjs [--book <dir>] [--chapter a,b] [--write] [--map]
//     --book     book folder (default pack/config/ftbquests/quests)
//     --chapter  only these chapter files (default: every .snbt in the book)
//     --write    write the files (default: dry run, only report)
//     --map      print every old -> new id
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HEX16 = /^[0-9A-Fa-f]{16}$/;
const ID_KEYS = 'id|autofocus_id|group|linked_quest|table_id|quest|chapter|quest_id|chapter_id';

export function fixId(id) {
  if (typeof id !== 'string' || !HEX16.test(id)) return id;
  const d = parseInt(id[0], 16);
  return d >= 8 ? String(d - 8) + id.slice(1) : id;
}

// returns { text, changes: [[old, new], ...] } with every unreadable id in an id field, a dependency list or a quest link fixed
export function fixIdsInText(text) {
  const changes = [];
  const swap = (id) => {
    const n = fixId(id);
    if (n !== id) changes.push([id, n]);
    return n;
  };
  let out = text.replace(new RegExp(`((?:^|[\\s{,\\[])(?:${ID_KEYS}):\\s*")([0-9A-Fa-f]{16})(")`, 'gm'), (m, a, id, b) => a + swap(id) + b);
  out = out.replace(/(dependencies:\s*\[)([^\]]*)(\])/g, (m, a, list, b) => a + list.replace(/"([0-9A-Fa-f]{16})"/g, (mm, id) => `"${swap(id)}"`) + b);
  return { text: out, changes };
}

function bookFiles(dir, only) {
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.snbt')) out.push(p);
    }
  };
  walk(dir);
  if (!only) return out;
  return out.filter((f) => path.dirname(f).endsWith('chapters') && only.has(path.basename(f, '.snbt')));
}

function allIds(texts) {
  const seen = new Map();
  for (const [file, text] of texts) {
    for (const m of text.matchAll(/(?:^|[\s{,])id:\s*"([0-9A-Fa-f]{16})"/gm)) {
      const id = m[1].toUpperCase();
      if (!seen.has(id)) seen.set(id, []);
      seen.get(id).push(path.basename(file));
    }
  }
  return seen;
}

function main(argv) {
  const arg = (name, def) => {
    const i = argv.indexOf(name);
    return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
  };
  const here = path.dirname(fileURLToPath(import.meta.url));
  const book = path.resolve(arg('--book', path.join(here, '..', '..', 'pack', 'config', 'ftbquests', 'quests')));
  const only = arg('--chapter', '') ? new Set(arg('--chapter', '').split(',').map((s) => s.trim()).filter(Boolean)) : null;
  const write = argv.includes('--write');
  const showMap = argv.includes('--map');

  const every = bookFiles(book, null);
  const targets = new Set(bookFiles(book, only));
  const before = new Map(every.map((f) => [f, fs.readFileSync(f, 'utf8')]));
  const after = new Map();
  const report = [];
  for (const [file, text] of before) {
    if (!targets.has(file)) { after.set(file, text); continue; }
    const r = fixIdsInText(text);
    after.set(file, r.text);
    if (r.changes.length) report.push([file, r.changes]);
  }

  // a fixed id must not land on an id the book already uses for something else
  const clashes = [...allIds(after)].filter(([, where]) => where.length > 1);
  const beforeDup = allIds(before);
  const newClashes = clashes.filter(([id, where]) => !beforeDup.has(id) || beforeDup.get(id).length < where.length);
  for (const [file, changes] of report) {
    const objects = new Set(changes.map((c) => c[0])).size;
    console.log(`${path.relative(process.cwd(), file)}: ${changes.length} reference(s) to ${objects} unreadable id(s)`);
    if (showMap) for (const [o, n] of [...new Map(changes)]) console.log(`  ${o} -> ${n}`);
  }
  if (newClashes.length) {
    for (const [id, where] of newClashes) console.error(`clash: ${id} would be used ${where.length} times (${where.join(', ')})`);
    console.error('nothing written');
    return 2;
  }
  if (!report.length) { console.log('every id is readable by FTB Quests 2001.4'); return 0; }
  if (!write) { console.log('dry run: add --write to fix'); return 1; }
  for (const [file] of report) fs.writeFileSync(file, after.get(file), 'utf8');
  console.log(`wrote ${report.length} file(s)`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
