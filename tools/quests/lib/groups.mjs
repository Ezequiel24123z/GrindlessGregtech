// Chapter groups of the book (chapter_groups.snbt), written in one place for the era generators (chapter-gen.mjs) and the
// Processing Lines generator (processing-lines/pl-gen.mjs).
import fs from 'node:fs';
import path from 'node:path';

// The Progression group: the era chapters' group before Phase 5 (kept as the fallback for a chapter with no era).
export const PROGRESSION_GROUP = { id: '3F021F40CD26BF57', title: 'Progression' };

// Phase 5 groups (docs/reforge/05_quest_design.md section 2.2, open question 1): Steam to HV share "Early Ages", every era
// from EV on has its own group. Ids are sha256('c2-group|' + title) with the first digit in 1-7 (docs/quests.md section 10).
export const ERA_GROUPS = {
  steam: { id: '4FEA27882E3DB25B', title: 'Early Ages' },
  lv: { id: '4FEA27882E3DB25B', title: 'Early Ages' },
  mv: { id: '4FEA27882E3DB25B', title: 'Early Ages' },
  hv: { id: '4FEA27882E3DB25B', title: 'Early Ages' },
  ev: { id: '56FB7B66CDAC1140', title: 'EV' },
  iv: { id: '20206D3FAD4A2FFF', title: 'IV' },
  luv: { id: '1B68BDF66B6D5658', title: 'LuV' },
  zpm: { id: '4E32EDFD57B398F2', title: 'ZPM' },
  uv: { id: '274E9C2B08DCD170', title: 'UV' },
  uhv: { id: '5588266FE7D27583', title: 'UHV' },
  uev: { id: '1D2C127632B5B46E', title: 'UEV' },
  uiv: { id: '26251651D4D8EF21', title: 'UIV' },
  uxv: { id: '2FC87731726663DD', title: 'UXV' },
  opv: { id: '41398BEC88C216FF', title: 'OpV' },
  max: { id: '14CC251BB70F88DF', title: 'MAX' },
  maxplus: { id: '7921472BE13FC86D', title: 'MAX+' },
};

const HEX16 = /^[0-9A-F]{16}$/;

// The group id of an era chapter: its pinned `group` (CHAPTER.group), else its era's group, else Progression.
export function eraGroupId(chapter) {
  const id = chapter.group !== undefined ? chapter.group : (ERA_GROUPS[chapter.era] || PROGRESSION_GROUP).id;
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
