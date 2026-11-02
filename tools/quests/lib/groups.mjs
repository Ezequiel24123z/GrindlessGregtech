// Chapter groups of the book (chapter_groups.snbt), written in one place for the era generators (chapter-gen.mjs) and the
// Processing Lines generator (processing-lines/pl-gen.mjs).
import fs from 'node:fs';
import path from 'node:path';

// QB-0: every era is one chapter, and all of them share one group, in era order (the per-era groups are retired).
// Ids are sha256('c2-group|' + title) with the first digit in 1-7 (docs/quests.md section 10).
export const PROGRESSION_GROUP = { id: '3F021F40CD26BF57', title: 'Progression' };
export const QOL_GROUP = { id: '7C6BF927E205E2F4', title: 'Quality of Life' };
export const PL_GROUP = { id: '3027186E3042DDFB', title: 'Processing Lines' };

// chapter_groups.snbt, in order: the era chapters, the quality-of-life tabs, the Processing Lines charts
export const BOOK_GROUPS = [PROGRESSION_GROUP, QOL_GROUP, PL_GROUP];

const HEX16 = /^[0-9A-F]{16}$/;

// The group id of an era chapter: its pinned `group` (CHAPTER.group), else Progression.
export function eraGroupId(chapter) {
  const id = chapter.group !== undefined ? chapter.group : PROGRESSION_GROUP.id;
  if (!HEX16.test(id)) throw new Error(`${chapter.filename}: group "${id}" is not 16 uppercase hex digits`);
  return id;
}

// The text of chapter_groups.snbt
export function renderGroups(groups = BOOK_GROUPS) {
  return '{\n\tchapter_groups: [\n' + groups.map((g) => `\t\t{ id: "${g.id}", title: "${g.title}" }\n`).join('') + '\t]\n}\n';
}

// Rewrites chapter_groups.snbt from BOOK_GROUPS. Returns whether the file changed.
export function writeGroups(file, groups = BOOK_GROUPS) {
  const text = renderGroups(groups);
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === text) return false;
  fs.writeFileSync(file, text);
  return true;
}

// A group's id by its title in <bookDir>/chapter_groups.snbt. `own` lists groups the generators own ({ title: id }): those need
// not be in the file yet (ensureGroup adds them).
export function groupIdByTitle(bookDir, title, own = {}) {
  if (Object.prototype.hasOwnProperty.call(own, title)) return own[title];
  const text = fs.readFileSync(path.join(bookDir, 'chapter_groups.snbt'), 'utf8');
  const m = new RegExp('\\{ id: "([0-9A-F]{16})", title: "' + title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '" \\}').exec(text);
  if (!m) throw new Error(`no chapter group titled "${title}" in chapter_groups.snbt`);
  return m[1];
}

// Adds a generator-owned group to chapter_groups.snbt, after the others, once. Returns whether the file changed.
export function ensureGroup(file, group) {
  let text = fs.readFileSync(file, 'utf8');
  if (text.includes(group.id)) return false;
  const line = `\t\t{ id: "${group.id}", title: "${group.title}" }\n`;
  text = text.replace(/(\n\t\]\n\}\s*)$/, '\n' + line.replace(/\n$/, '') + '$1');
  if (!text.includes(group.id)) throw new Error('could not add the group to ' + file);
  fs.writeFileSync(file, text);
  return true;
}
