// The shared writer of the generated era chapters (docs/reforge/05_quest_design.md, section 4): it turns the data files of
// tools/quests/<era>-chapter/ into the book's SNBT. Used by gen-chapters.mjs.
//
// Format: tabs, LF, no BOM, keys sorted, inline task and reward compounds, task counts with L, reward counts without.
// Ids: sha256('c2-<era>-quests|' + key), high bit cleared, first digit 1-7 (docs/quests.md, section 10); a pinned `id` wins.
// Package gate (from luv-chapter): `pkg`, `LANDED`, `fallback`, `slot` work in every era (see buildWorld).
//
// A data file exports CHAPTER, QUESTS and, optionally, LINKS, PACKAGES, LANDED, ALL_STATE.
// CHAPTER { era?, title, subtitle, icon, autofocus, order, group?, id?, section? } is read from the era's main data file
// (quests-data.mjs) for the era chapter; every other data file only needs CHAPTER.section.
//   CHAPTER.section { name, origin: { x, y }, heading?: { key, x, y, deps?, icon?, desc? } }
//     name     the section's title (the heading quest's title)
//     origin   where the file's (0, 0) lands in the era chapter; without one the section goes to the right of the sections before it
//     heading  optional: adds a `reading` quest titled `name` at (x, y) (relative to origin), depending on `deps` (keys of the era)
// Every data file of an era renders into ONE chapter, <era>_age. A link whose ref is a quest of the same era is dropped.
//   LINKS   [{ key, ref, x, y, shape?, size? }]  quest links shown in this chapter; ref is a key of the era, '<era>:KEY' or 'X:<hex>'
//   QUESTS  [{ key, kind?, title, icon, x, y, deps, teach?, desc, tasks, rewards, id?, shape?, size?, optional?, pkg?, fallback?,
//              slot?, adjust?, raw? }]
//   a task: { type, id?, item?, count?, dimension?, raw?, snbt? }; `snbt` is the task's own SNBT text, written as it is.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { eraGroupId, PROGRESSION_GROUP } from './groups.mjs';

export const ERAS = ['steam', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max', 'maxplus'];

// kind -> shape and size (section 4.2); an explicit shape or size on the quest wins
export const KINDS = {
  start: { shape: 'rsquare', size: 1.5 },
  step: {},
  wafer: { shape: 'hexagon', size: 1 },
  circuit: { shape: 'hexagon', size: 1 },
  process: { shape: 'hexagon', size: 1 },
  machine: { shape: 'gear', size: 1.25 },
  plant: { shape: 'gear', size: 1.25 },
  signature: { shape: 'gear', size: 1.5 },
  reading: { shape: 'circle', size: 0.75 },
  side: { shape: 'hexagon', size: 0.75, optional: true },
  milestone: { shape: 'rsquare', size: 1.25 },
  exit: { shape: 'diamond', size: 1.75 },
};
export const TEACH_REQUIRED = new Set(['machine', 'plant', 'signature', 'wafer', 'circuit', 'process']);
export const TEACH_KEYS = ['for', 'needs', 'unlocks', 'automate'];

export function newId(era, seed) {
  const b = crypto.createHash('sha256').update(`c2-${era}-quests|` + seed).digest().subarray(0, 8);
  b[0] = (b[0] & 0x7f) | 0x10;
  return Buffer.from(b).toString('hex').toUpperCase();
}

const HEX16 = /^[0-9A-F]{16}$/;

// ---------------------------------------------------------------- loading

// Every data file of an era folder: quests-data.mjs first, then the others (circuits-data.mjs ...) by name.
export function dataFiles(questsDir, era) {
  const dir = path.join(questsDir, `${era}-chapter`);
  if (!fs.existsSync(dir)) return [];
  const names = fs.readdirSync(dir).filter((n) => n === 'quests-data.mjs' || /^[a-z0-9_-]+-data\.mjs$/.test(n));
  names.sort((a, b) => (a === 'quests-data.mjs' ? -1 : b === 'quests-data.mjs' ? 1 : a.localeCompare(b)));
  return names.map((n) => path.join(dir, n));
}

// Era -> data modules ({ file, CHAPTER, QUESTS, LINKS, PACKAGES, LANDED, ALL_STATE }) for the given eras.
export async function loadEras(questsDir, eras = ERAS) {
  const out = new Map();
  for (const era of eras) {
    const mods = [];
    for (const file of dataFiles(questsDir, era)) {
      const m = await import(pathToFileURL(file).href);
      if (!m.CHAPTER || !m.QUESTS) throw new Error(`${file}: must export CHAPTER and QUESTS`);
      mods.push({ file, CHAPTER: m.CHAPTER, QUESTS: m.QUESTS, LINKS: m.LINKS || [], PACKAGES: m.PACKAGES, LANDED: m.LANDED, ALL_STATE: m.ALL_STATE });
    }
    if (mods.length) out.set(era, mods);
  }
  return out;
}

// ---------------------------------------------------------------- the model

// eraMods: Map era -> data modules. Returns the world: ids, the package gate and every dependency resolved.
export function buildWorld(eraMods, { allPackages = false } = {}) {
  const world = { eras: new Map(), allPackages };
  for (const [era, mods] of eraMods) world.eras.set(era, prepareEra(era, mods, allPackages));
  for (const e of world.eras.values()) resolveEra(world, e);
  return world;
}

const AUTO_GAP = 8;

// The module whose CHAPTER describes the era chapter (title, icon, order, autofocus, id, group): quests-data.mjs, else the one
// whose filename is <era>_age, else the lowest order.
function mainModule(era, mods) {
  const byName = mods.find((m) => path.basename(m.file) === 'quests-data.mjs');
  if (byName) return byName;
  const byFile = mods.find((m) => m.CHAPTER.filename === `${era}_age`);
  if (byFile) return byFile;
  return [...mods].sort((a, b) => (a.CHAPTER.order ?? 0) - (b.CHAPTER.order ?? 0))[0];
}

// CHAPTER.section.heading { key, x, y, deps?, icon?, desc? }: the section's title as a `reading` quest (FTB Quests 2001.4 has no
// text decoration), wired into the graph through its deps like any other quest.
function headingQuest(era, sec) {
  const h = sec.heading;
  if (!h.key) throw new Error(`${era}: section "${sec.name}" heading needs a key`);
  return {
    key: h.key, kind: 'reading', title: sec.name, icon: h.icon || 'minecraft:writable_book', x: h.x, y: h.y, deps: h.deps || [],
    desc: h.desc || [], tasks: [{ type: 'checkmark' }], rewards: [],
  };
}

function prepareEra(era, mods, allPackages) {
  const packages = [...new Set(mods.flatMap((m) => m.PACKAGES || []))];
  const landedList = [...new Set(mods.flatMap((m) => m.LANDED || []))];
  const allState = [...new Set(mods.flatMap((m) => m.ALL_STATE || []))];
  for (const p of landedList) if (!packages.includes(p)) throw new Error(`${era}: LANDED names unknown package ${p}`);
  const landed = new Set(allPackages && allState.length ? allState : landedList);
  const filename = `${era}_age`;
  const main = mainModule(era, mods);
  // one chapter per era: every data file is a section of it (docs/quests.md, section 4b)
  const chapter = { mod: main, filename, quests: [], links: [] };
  const e = { era, mods, main, byKey: new Map(), quests: [], slots: new Map(), chapters: [chapter], chapter, sections: [], linkKeys: new Set(), droppedLinks: [] };
  let rightEdge = 0;

  for (const mod of mods) {
    const ch = mod.CHAPTER;
    if (ch.era && ch.era !== era) throw new Error(`${mod.file}: CHAPTER.era "${ch.era}" is not the folder's era "${era}"`);
    const sec = ch.section || {};
    const section = { mod, file: path.basename(mod.file), name: sec.name || null, quests: [], placed: sec.origin ? 'declared' : 'auto' };
    e.sections.push(section);
    const heading = sec.heading ? headingQuest(era, sec) : null;
    const ownQuests = heading ? [heading, ...mod.QUESTS] : mod.QUESTS;
    const first = e.quests.length;
    for (const q of ownQuests) {
      if (e.byKey.has(q.key)) throw new Error(`${era}: duplicate quest key ${q.key}`);
      const kind = q.kind === undefined ? null : q.kind;
      if (kind !== null && !KINDS[kind]) throw new Error(`${q.key}: unknown kind "${kind}"`);
      checkTeach(q, kind);
      for (const p of q.pkg || []) if (!packages.includes(p)) throw new Error(`${q.key}: unknown package ${p}`);
      if (q.id !== undefined && !HEX16.test(q.id)) throw new Error(`${q.key}: pinned id "${q.id}" is not 16 uppercase hex digits`);
      const c = {
        q, key: q.key, era, chapter, kind,
        id: q.id || newId(era, q.key),
        tasks: q.tasks.map((t, i) => ({ ...t, id: t.id || newId(era, q.key + '|task|' + i + '|' + (t.item || t.dimension || t.type)) })),
        rewards: q.rewards.map((r, i) => ({ ...r, id: r.id || newId(era, q.key + '|reward|' + i + '|' + (r.item || r.type)) })),
      };
      c.on = (q.pkg || []).every((p) => landed.has(p));
      const fb = q.fallback && q.fallback.unless.some((p) => !landed.has(p)) ? q.fallback : null;
      c.px = fb ? fb.x : q.x;
      c.py = fb ? fb.y : q.y;
      c.pdeps = fb ? fb.deps : q.deps;
      c.section = section;
      e.byKey.set(q.key, c);
      e.quests.push(c);
      chapter.quests.push(c);
      section.quests.push(c);
    }
    // origin: declared, else the section goes to the right of the sections before it (a data file that has no section yet)
    const mine = e.quests.slice(first);
    const xs = mine.flatMap((c) => [c.q.x, ...(c.q.fallback ? [c.q.fallback.x] : [])]);
    const lo = xs.length ? Math.min(...xs) : 0;
    const hi = xs.length ? Math.max(...xs) : 0;
    section.origin = sec.origin ? { x: sec.origin.x, y: sec.origin.y } : { x: first === 0 ? 0 : Math.ceil(rightEdge + AUTO_GAP - lo), y: 0 };
    rightEdge = Math.max(rightEdge, section.origin.x + hi);
    for (const c of mine) {
      c.px += section.origin.x;
      c.py += section.origin.y;
    }
    section.links = mod.LINKS || [];
  }
  for (const c of e.quests.filter((c) => c.on && c.q.slot)) {
    if (e.slots.has(c.q.slot)) throw new Error(`${c.key} and ${e.slots.get(c.q.slot)} share slot ${c.q.slot}: only one of them can land`);
    e.slots.set(c.q.slot, c.key);
  }
  e.landed = landed;
  return e;
}

function checkTeach(q, kind) {
  const t = q.teach;
  if (t === undefined) {
    if (kind && TEACH_REQUIRED.has(kind)) throw new Error(`${q.key}: kind "${kind}" needs teach { ${TEACH_KEYS.join(', ')} } (section 4.2)`);
    return;
  }
  for (const k of Object.keys(t)) if (!TEACH_KEYS.includes(k)) throw new Error(`${q.key}: teach.${k} is not one of ${TEACH_KEYS.join(', ')}`);
  if (kind && TEACH_REQUIRED.has(kind)) {
    for (const k of TEACH_KEYS) if (typeof t[k] !== 'string' || !t[k].trim()) throw new Error(`${q.key}: teach.${k} is missing`);
  }
}

// A dependency or link target to ids: 'X:<hex>' is a hand-written chapter's quest, '<era>:KEY' another generated era's, anything
// else a key of this era. A left-out quest is replaced by its own dependencies (docs/quests.md, section 8: "when one goes, its
// children depend on its parents"); the alternative of a slot that has landed stands in for the one that has not.
function resolveRef(world, era, ref, seen = new Set()) {
  if (ref.startsWith('X:')) return [ref.slice(2)];
  let eraName = era;
  let key = ref;
  const m = /^([a-z0-9]+):(.+)$/.exec(ref);
  if (m) { eraName = m[1]; key = m[2]; }
  const e = world.eras.get(eraName);
  if (!e) throw new Error(`reference ${ref}: era "${eraName}" is not loaded`);
  const p = e.byKey.get(key);
  if (!p) throw new Error(`unknown dependency key ${ref}` + (m ? '' : ` (era ${era})`));
  if (p.on) return [p.id];
  if (p.q.slot && e.slots.has(p.q.slot)) return [];
  const id = eraName + ':' + key;
  if (seen.has(id)) return [];
  seen.add(id);
  return p.pdeps.flatMap((d) => resolveRef(world, eraName, d, seen));
}

function resolveEra(world, e) {
  for (const c of e.quests.filter((c) => c.on)) {
    c.depIds = [...new Set(c.pdeps.flatMap((d) => resolveRef(world, e.era, d)))];
    if (c.pdeps.length && !c.depIds.length) throw new Error(`${c.key} would float: none of its dependencies has landed`);
  }
  // quest links: a link to a quest of this same era is dropped (the quest is in this chapter now); links to other eras stay
  const sameEra = (ref) => { const m = /^([a-z0-9]+):(.+)$/.exec(ref); return !m ? !ref.startsWith('X:') : m[1] === e.era; };
  for (const section of e.sections) {
    for (const l of section.links) {
      if (e.linkKeys.has(l.key) || e.byKey.has(l.key)) throw new Error(`${e.era}: duplicate key ${l.key}`);
      e.linkKeys.add(l.key);
      if (sameEra(l.ref)) { e.droppedLinks.push({ key: l.key, ref: l.ref, file: section.file }); continue; }
      const target = resolveRef(world, e.era, l.ref);
      if (target.length) e.chapter.links.push({ ...l, x: l.x + section.origin.x, y: l.y + section.origin.y, id: l.id || newId(e.era, 'link|' + l.key), target: target[0] });
    }
  }
}

// ---------------------------------------------------------------- SNBT

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const str = (s) => '"' + esc(s) + '"';
function dnum(n) {
  const f = Number(n);
  if (Number.isInteger(f)) return f + '.0d';
  let s = String(Math.round(f * 1000) / 1000);
  if (!s.includes('.')) s += '.0';
  return s + 'd';
}
function compound(fields) {
  return '{ ' + Object.keys(fields).sort().map((k) => k + ': ' + fields[k]).join(', ') + ' }';
}
// raw: fields the writer does not model, written as they are (values are SNBT text)
function withRaw(f, raw, where) {
  for (const [k, v] of Object.entries(raw || {})) {
    if (k in f) throw new Error(`${where}: raw.${k} collides with a field the writer models`);
    f[k] = String(v);
  }
  return f;
}
function task(t, where) {
  // snbt: the task as the book has it, for a task the writer does not model (a tag filter, a title); lines are relative to the task
  if (t.snbt !== undefined) return t.snbt;
  const f = { id: str(t.id), type: str(t.type) };
  if (t.type === 'item') {
    f.item = str(t.item);
    if ((t.count ?? 1) !== 1) f.count = t.count + 'L';
  } else if (t.type === 'dimension') {
    f.dimension = str(t.dimension);
  } else if (t.type !== 'checkmark') throw new Error(`${where}: task type ${t.type}`);
  return compound(withRaw(f, t.raw, where));
}
function reward(r, where) {
  const f = { id: str(r.id), type: str(r.type) };
  if (r.type === 'xp') f.xp = String(r.xp);
  else if (r.type === 'item') {
    f.item = str(r.item);
    if ((r.count ?? 1) !== 1) f.count = String(r.count);
  } else throw new Error(`${where}: reward type ${r.type}`);
  return compound(withRaw(f, r.raw, where));
}
function list(key, items, indent) {
  if (items.length === 0) return key + ': [ ]';
  if (items.length === 1 && !items[0].includes('\n')) return key + ': [' + items[0] + ']';
  return key + ': [\n' + items.map((s) => s.split('\n').map((l) => indent + '\t' + l).join('\n')).join('\n') + '\n' + indent + ']';
}

// the description: the teach paragraph (for, needs, unlocks, automate, joined), then the extra paragraphs
export function descriptionOf(q) {
  const paras = [];
  if (q.teach) {
    const joined = TEACH_KEYS.map((k) => (q.teach[k] || '').trim()).filter(Boolean).join(' ');
    if (joined) paras.push(joined);
  }
  return [...paras, ...(q.desc || [])];
}

function questSnbt(c, indent) {
  const q = c.q;
  const inner = indent + '\t';
  const kind = c.kind ? KINDS[c.kind] : {};
  const f = {};
  if (c.depIds.length) f.dependencies = 'dependencies: [' + c.depIds.map(str).join(', ') + ']';
  const desc = descriptionOf(q);
  if (desc.length) f.description = list('description', desc.map(str), inner);
  f.icon = 'icon: ' + str(q.icon);
  f.id = 'id: ' + str(c.id);
  if (q.optional === undefined ? kind.optional : q.optional) f.optional = 'optional: true';
  f.rewards = list('rewards', c.rewards.map((r) => reward(r, q.key)), inner);
  const shape = q.shape || kind.shape;
  if (shape) f.shape = 'shape: ' + str(shape);
  const size = q.size !== undefined ? q.size : kind.size;
  if (size !== undefined) f.size = 'size: ' + dnum(size);
  f.tasks = list('tasks', c.tasks.map((t) => task(t, q.key)), inner);
  f.title = 'title: ' + str(q.title);
  f.x = 'x: ' + dnum(c.px);
  f.y = 'y: ' + dnum(c.py);
  withRaw(f, Object.fromEntries(Object.entries(q.raw || {}).map(([k, v]) => [k, k + ': ' + v])), q.key);
  return [indent + '{', ...Object.keys(f).sort().map((k) => inner + f[k]), indent + '}'].join('\n');
}

function linkSnbt(l, indent) {
  const f = { id: str(l.id), linked_quest: str(l.target), x: dnum(l.x), y: dnum(l.y) };
  if (l.shape) f.shape = str(l.shape);
  if (l.size !== undefined && l.size !== 1) f.size = dnum(l.size);
  const inner = indent + '\t';
  return [indent + '{', ...Object.keys(f).sort().map((k) => inner + k + ': ' + f[k]), indent + '}'].join('\n');
}

// One chapter of a world: { filename, era, text, counts: { quests, dependencies, links, waiting } }
export function renderChapter(world, era, chapter) {
  const e = world.eras.get(era);
  const ch = chapter.mod.CHAPTER;
  const shown = chapter.quests.filter((c) => c.on);
  const focus = e.byKey.get(ch.autofocus);
  if (!focus) throw new Error(`${chapter.filename}: autofocus ${ch.autofocus} is not a quest of era ${era}`);
  if (ch.order === undefined) throw new Error(`${chapter.filename}: CHAPTER.order is required`);
  const group = eraGroupId({ ...ch, era, filename: chapter.filename });
  // Every era chapter shares the Progression group (QB-0), so its place there is its era's place in ERAS, not CHAPTER.order.
  const eraIndex = ERAS.indexOf(era);
  const order = group === PROGRESSION_GROUP.id && eraIndex >= 0 ? eraIndex : ch.order;
  const links = chapter.links;
  const lines = [
    '{',
    '\tautofocus_id: ' + str(focus.id),
    '\tdefault_hide_dependency_lines: false',
    '\tdefault_quest_shape: ""',
    '\tfilename: ' + str(chapter.filename),
    '\tgroup: ' + str(group),
    '\ticon: ' + str(ch.icon),
    '\tid: ' + str(ch.id || newId(era, 'chapter|' + chapter.filename)),
    '\torder_index: ' + order,
    links.length ? '\tquest_links: [\n' + links.map((l) => linkSnbt(l, '\t\t')).join('\n') + '\n\t]' : '\tquest_links: [ ]',
    '\tquests: [',
    shown.map((c) => questSnbt(c, '\t\t')).join('\n'),
    '\t]',
    '\tsubtitle: [' + [].concat(ch.subtitle).map(str).join(', ') + ']',
    '\ttitle: ' + str(ch.title),
    '}',
  ];
  const counts = {
    quests: shown.length,
    dependencies: shown.reduce((n, c) => n + c.depIds.length, 0),
    links: links.length,
    waiting: chapter.quests.length - shown.length,
  };
  return { filename: chapter.filename, era, text: lines.join('\n') + '\n', counts };
}

export function countsLine(counts) {
  const links = counts.links ? `, ${counts.links} links` : '';
  const waiting = counts.waiting ? ` (${counts.waiting} waiting for their package)` : '';
  return `${counts.quests} quests, ${counts.dependencies} dependencies${links}${waiting}`;
}

// Every chapter of the world (or of the listed eras), in era and file order.
export function renderWorld(world, eras = [...world.eras.keys()]) {
  const out = [];
  for (const era of eras) {
    const e = world.eras.get(era);
    if (!e) throw new Error(`era "${era}" is not loaded`);
    for (const chapter of e.chapters) out.push(renderChapter(world, era, chapter));
  }
  return out;
}

// The quests left out, by the packages they wait for, and the quests in the book that a package may change (luv `--pending`).
export function pendingReport(world, era) {
  const e = world.eras.get(era);
  const lines = [];
  const byPkg = new Map();
  for (const c of e.quests.filter((c) => !c.on)) {
    const missing = (c.q.pkg || []).filter((p) => !e.landed.has(p)).join('+');
    if (!byPkg.has(missing)) byPkg.set(missing, []);
    byPkg.get(missing).push(c);
  }
  for (const [p, cs] of [...byPkg].sort()) {
    lines.push(`waiting for ${p}:`);
    for (const c of cs) {
      const ids = c.q.tasks.map((t) => t.item || (t.dimension && 'dimension ' + t.dimension)).filter(Boolean);
      lines.push(`  ${c.key} "${c.q.title}" ${c.id}: ${ids.join(', ')}`);
    }
  }
  const adjust = e.quests.filter((c) => c.on && c.q.adjust);
  if (adjust.length) {
    lines.push('in the book, to check when a package lands:');
    for (const c of adjust) lines.push(`  ${c.key} "${c.q.title}" ${c.id}: ${c.q.adjust}`);
  }
  return lines;
}
