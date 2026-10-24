// Loads an FTB Quests book folder (config/ftbquests/quests) into a plain model for the linter and the renderer.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from './snbt.mjs';

export function readSnbt(file, options) {
  return parse(fs.readFileSync(file, 'utf8'), options);
}

function asList(v) {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

function itemId(item) {
  if (!item) return null;
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && typeof item.id === 'string') return item.id;
  return null;
}

// Every item id named inside a task/reward/icon value (Item Filters lists included).
export function collectItemIds(value, out = []) {
  if (value === null || value === undefined) return out;
  if (typeof value === 'string') return out;
  if (Array.isArray(value)) { for (const v of value) collectItemIds(v, out); return out; }
  if (typeof value === 'object') {
    // an ItemStack written as NBT has "Count"; FTB Quests tasks and rewards use "count" and their own "id"
    if (typeof value.id === 'string' && value.Count !== undefined) out.push(value.id);
    for (const [k, v] of Object.entries(value)) {
      if ((k === 'item' || k === 'icon') && typeof v === 'string') out.push(v);
      else collectItemIds(v, out);
    }
  }
  return out;
}

export function loadBook(dir, options = {}) {
  const lang = options.lang || {};
  const tr = (s) => {
    if (typeof s !== 'string') return s;
    const m = /^\{([^{}]+)\}$/.exec(s.trim());
    return m && lang[m[1]] !== undefined ? lang[m[1]] : s;
  };
  const book = { dir, groups: [], chapters: [], questById: new Map(), objectIds: new Map(), data: {} };
  const dataFile = path.join(dir, 'data.snbt');
  if (fs.existsSync(dataFile)) book.data = readSnbt(dataFile);
  const groupsFile = path.join(dir, 'chapter_groups.snbt');
  if (fs.existsSync(groupsFile)) {
    const g = readSnbt(groupsFile);
    book.groups = asList(g.chapter_groups).map((x) => ({ id: x.id, title: tr(x.title) || '' }));
  }
  const chDir = path.join(dir, 'chapters');
  const files = fs.existsSync(chDir) ? fs.readdirSync(chDir).filter((f) => f.endsWith('.snbt')).sort() : [];
  const defaultShape = book.data.default_quest_shape || 'circle';
  const note = (id, kind, where) => {
    if (!id) return;
    if (!book.objectIds.has(id)) book.objectIds.set(id, []);
    book.objectIds.get(id).push({ kind, where });
  };
  for (const f of files) {
    const file = path.join(chDir, f);
    let raw;
    try { raw = readSnbt(file); } catch (e) { book.chapters.push({ file, filename: f.replace(/\.snbt$/, ''), parseError: e.message, quests: [], links: [] }); continue; }
    const ch = {
      file,
      filename: raw.filename || f.replace(/\.snbt$/, ''),
      id: raw.id,
      title: tr(raw.title) || lang[`chapter.${raw.id}.title`] || '',
      subtitle: asList(raw.subtitle).map(tr),
      group: raw.group || '',
      orderIndex: raw.order_index ?? 0,
      icon: raw.icon,
      defaultShape: raw.default_quest_shape || defaultShape,
      defaultHideLines: !!raw.default_hide_dependency_lines,
      quests: [],
      links: [],
      images: asList(raw.images),
      raw,
    };
    note(ch.id, 'chapter', ch.filename);
    for (const q of asList(raw.quests)) {
      const quest = {
        id: q.id,
        chapter: ch,
        title: tr(q.title) || lang[`quest.${q.id}.title`] || '',
        subtitle: tr(q.subtitle) || lang[`quest.${q.id}.quest_subtitle`] || '',
        x: Number(q.x ?? 0),
        y: Number(q.y ?? 0),
        size: Number(q.size ?? 1),
        shape: q.shape || ch.defaultShape,
        deps: asList(q.dependencies).map(String),
        depRequirement: q.dependency_requirement || 'all_completed',
        optional: !!q.optional,
        hideDependencyLines: q.hide_dependency_lines === undefined ? ch.defaultHideLines : !!q.hide_dependency_lines,
        invisible: !!q.invisible,
        description: q.description !== undefined
          ? asList(q.description).map(tr)
          : asList(lang[`quest.${q.id}.quest_desc`]).flatMap((s) => String(s).split('\n')),
        icon: q.icon,
        tasks: asList(q.tasks).map((t) => ({ ...t, itemId: itemId(t.item) })),
        rewards: asList(q.rewards).map((r) => ({ ...r, itemId: itemId(r.item) })),
        raw: q,
      };
      ch.quests.push(quest);
      note(quest.id, 'quest', `${ch.filename}/${quest.title || quest.id}`);
      for (const t of quest.tasks) note(t.id, 'task', `${ch.filename}/${quest.title || quest.id}`);
      for (const r of quest.rewards) note(r.id, 'reward', `${ch.filename}/${quest.title || quest.id}`);
      if (book.questById.has(quest.id)) quest.duplicate = true;
      else book.questById.set(quest.id, quest);
    }
    for (const l of asList(raw.quest_links)) {
      ch.links.push({ id: l.id, linked: l.linked_quest, x: Number(l.x ?? 0), y: Number(l.y ?? 0), size: Number(l.size ?? 1), shape: l.shape, raw: l });
      note(l.id, 'quest_link', ch.filename);
    }
    book.chapters.push(ch);
  }
  for (const g of book.groups) note(g.id, 'chapter_group', g.title);
  book.chapters.sort((a, b) => {
    const ga = book.groups.findIndex((g) => g.id === a.group);
    const gb = book.groups.findIndex((g) => g.id === b.group);
    return ga - gb || a.orderIndex - b.orderIndex || a.filename.localeCompare(b.filename);
  });
  return book;
}

// Reads an FTB Quests lang file (lang/en_us.snbt) or a JSON lang file into a flat map.
export function loadLang(file) {
  if (!file || !fs.existsSync(file)) return {};
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const raw = readSnbt(file);
  const out = {};
  for (const [k, v] of Object.entries(raw)) out[k] = Array.isArray(v) ? v.join('\n') : v;
  return out;
}
