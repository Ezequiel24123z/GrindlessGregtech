// Chapter groups of the book (chapter_groups.snbt), written in one place for the era generators (chapter-gen.mjs) and the
// Processing Lines generator (processing-lines/pl-gen.mjs).
import fs from 'node:fs';
import path from 'node:path';

// The Progression group: every era chapter lives in it (today's grouping; RF-5I1 may regroup at regeneration).
export const PROGRESSION_GROUP = { id: '3F021F40CD26BF57', title: 'Progression' };

const HEX16 = /^[0-9A-F]{16}$/;

// The group id of an era chapter: its pinned `group` (CHAPTER.group), else Progression.
export function eraGroupId(chapter) {
  const id = chapter.group === undefined ? PROGRESSION_GROUP.id : chapter.group;
  if (!HEX16.test(id)) throw new Error(`${chapter.filename}: group "${id}" is not 16 uppercase hex digits`);
  return id;
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
