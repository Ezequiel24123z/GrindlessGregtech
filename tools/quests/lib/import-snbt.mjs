// One-off importer: a hand-written chapter of the book (SNBT) -> the data file the shared writer reads (lib/chapter-gen.mjs).
// It moves a chapter to data without changing the book: after the import, `gen-chapters.mjs` must write the same bytes.
//
//   node tools/quests/lib/import-snbt.mjs [--book <chapters dir>] [--out <dir>|-] <era> [<era> ...]
//
// The chapter read is <era>_age.snbt. The data file is <out>/<era>-chapter/quests-data.mjs (default out: tools/quests); `--out -`
// prints every file after a `//// FILE <path>` line instead. Every id (chapter, quest, task, reward) is pinned, so the book keeps
// its ids. Quest keys come from the titles (<ERA>_<WORDS>). Dependencies point at the keys of the imported eras ('<era>:KEY')
// and at 'X:<hex>' for any other quest. Fields the writer does not model go to `raw`; what cannot be carried (a nested value,
// a quest link, an unknown chapter field) stops the import with the place named.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from './snbt.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const QUESTS_DIR = path.resolve(HERE, '..');
export const BOOK_CHAPTERS = path.resolve(HERE, '../../../pack/config/ftbquests/quests/chapters');

const CHAPTER_KEYS = new Set(['autofocus_id', 'default_hide_dependency_lines', 'default_quest_shape', 'filename', 'group', 'hide_quest_until_deps_visible', 'icon', 'id', 'order_index', 'quest_links', 'quests', 'subtitle', 'title']);
const QUEST_KEYS = new Set(['dependencies', 'description', 'icon', 'id', 'optional', 'rewards', 'shape', 'size', 'tasks', 'title', 'x', 'y']);
const TASK_KEYS = new Set(['id', 'type', 'item', 'count', 'dimension']);
const REWARD_KEYS = new Set(['id', 'type', 'item', 'count', 'xp']);

const q = (s) => JSON.stringify(s);
const isNum = (v) => v && typeof v === 'object' && '$n' in v;

function number(v, suffix, where) {
  if (!isNum(v) || String(v.$t).toLowerCase() !== (suffix || 'i').toLowerCase()) throw new Error(`${where}: expected a number with suffix "${suffix}", got ${JSON.stringify(v)}`);
  return v.$n;
}

// a value the writer's `raw` can carry: SNBT text
function rawText(v, where) {
  if (typeof v === 'boolean') return String(v);
  if (typeof v === 'string') return q(v);
  if (isNum(v)) return String(v.$n) + (v.$t === 'i' ? '' : v.$t || '');
  throw new Error(`${where}: a nested value cannot be carried in raw`);
}

function rawOf(obj, known, where) {
  const out = [];
  for (const k of Object.keys(obj).sort()) if (!known.has(k)) out.push(`${/^[A-Za-z0-9_]+$/.test(k) ? k : q(k)}: ${q(rawText(obj[k], where + '.' + k))}`);
  return out.length ? `raw: { ${out.join(', ')} }` : '';
}

function slug(title, era) {
  const words = title.normalize('NFKD').replace(/[^A-Za-z0-9 ]+/g, ' ').trim().split(/\s+/).filter(Boolean).slice(0, 4);
  return era.toUpperCase() + '_' + words.map((w) => w.toUpperCase()).join('_');
}

function readChapter(dir, era) {
  const file = path.join(dir, `${era}_age.snbt`);
  const c = parse(fs.readFileSync(file, 'utf8'), { typed: true });
  for (const k of Object.keys(c)) if (!CHAPTER_KEYS.has(k)) throw new Error(`${file}: chapter field "${k}" is not carried`);
  if (c.quest_links && c.quest_links.length) throw new Error(`${file}: quest_links are not carried`);
  if (c.default_hide_dependency_lines !== false || c.default_quest_shape !== '') throw new Error(`${file}: chapter defaults differ from the writer's`);
  if (c.filename !== `${era}_age`) throw new Error(`${file}: filename is ${c.filename}`);
  return c;
}

// Era -> data file text, for the given eras of the book in `dir`.
export function importChapters(dir, eras) {
  const chapters = new Map(eras.map((e) => [e, readChapter(dir, e)]));
  const owner = new Map(); // quest id -> { era, key }
  const keys = new Map();
  for (const [era, c] of chapters) {
    const used = new Set();
    for (const quest of c.quests) {
      let key = slug(quest.title, era);
      for (let n = 2; used.has(key); n++) key = slug(quest.title, era) + '_' + n;
      used.add(key);
      owner.set(quest.id, { era, key });
      keys.set(quest.id, key);
    }
  }
  const ref = (era, id) => {
    const o = owner.get(id);
    if (!o) return 'X:' + id;
    return o.era === era ? o.key : `${o.era}:${o.key}`;
  };

  const out = new Map();
  for (const [era, c] of chapters) {
    const L = [];
    L.push(`// Quest data for ${c.filename}; tools/quests/gen-chapters.mjs writes the chapter. Imported from the hand-written chapter by tools/quests/lib/import-snbt.mjs (RF-5L2): every id is spelled out.`);
    L.push('');
    const focus = owner.get(c.autofocus_id);
    if (!focus || focus.era !== era) throw new Error(`${c.filename}: autofocus ${c.autofocus_id} is not one of its quests`);
    L.push('export const CHAPTER = {');
    L.push(`  id: ${q(c.id)},`, `  group: ${q(c.group)},`, `  order: ${number(c.order_index, '', c.filename + ' order_index')},`, `  icon: ${q(c.icon)},`, `  autofocus: ${q(focus.key)},`);
    L.push(`  title: ${q(c.title)},`, `  subtitle: ${JSON.stringify([].concat(c.subtitle))},`, '};', '', 'export const QUESTS = [');
    for (const quest of c.quests) {
      const where = `${c.filename} ${keys.get(quest.id)}`;
      for (const k of Object.keys(quest)) if (!QUEST_KEYS.has(k)) throw new Error(`${where}: quest field "${k}" is not carried`);
      if ('optional' in quest && quest.optional !== true) throw new Error(`${where}: optional is not true`);
      const f = [`key: ${q(keys.get(quest.id))}`, `id: ${q(quest.id)}`, `title: ${q(quest.title)}`, `icon: ${q(quest.icon)}`];
      if (quest.shape) f.push(`shape: ${q(quest.shape)}`);
      if ('size' in quest) f.push(`size: ${number(quest.size, 'd', where + ' size')}`);
      if (quest.optional) f.push('optional: true');
      f.push(`deps: ${JSON.stringify((quest.dependencies || []).map((d) => ref(era, d)))}`);
      f.push(`x: ${number(quest.x, 'd', where + ' x')}`, `y: ${number(quest.y, 'd', where + ' y')}`);
      L.push('  {');
      L.push('    ' + f.join(', ') + ',');
      const desc = quest.description === undefined ? [] : [].concat(quest.description);
      if (desc.length) L.push('    desc: [', ...desc.map((p) => `      ${q(p)},`), '    ],');
      const tasks = quest.tasks.map((t, i) => {
        const w = `${where} task ${i}`;
        if (Object.values(t).some((v) => v && typeof v === 'object' && !isNum(v))) {
          return `{ type: ${q(t.type)}, id: ${q(t.id)}, snbt: ${q(stringify(t).trimEnd())} }`;
        }
        const extra = rawOf(t, TASK_KEYS, w);
        const parts = [`type: ${q(t.type)}`, `id: ${q(t.id)}`];
        if (t.type === 'item') {
          if (typeof t.item !== 'string') throw new Error(`${w}: item is not a plain id`);
          parts.push(`item: ${q(t.item)}`);
          if ('count' in t) parts.push(`count: ${number(t.count, 'L', w + ' count')}`);
        } else if (t.type === 'dimension') parts.push(`dimension: ${q(t.dimension)}`);
        else if (t.type !== 'checkmark') throw new Error(`${w}: task type ${t.type}`);
        if (extra) parts.push(extra);
        return `{ ${parts.join(', ')} }`;
      });
      const rewards = quest.rewards.map((r, i) => {
        const w = `${where} reward ${i}`;
        const extra = rawOf(r, REWARD_KEYS, w);
        const parts = [`type: ${q(r.type)}`, `id: ${q(r.id)}`];
        if (r.type === 'xp') parts.push(`xp: ${number(r.xp, '', w + ' xp')}`);
        else if (r.type === 'item') {
          if (typeof r.item !== 'string') throw new Error(`${w}: item is not a plain id`);
          parts.push(`item: ${q(r.item)}`);
          if ('count' in r) parts.push(`count: ${number(r.count, '', w + ' count')}`);
        } else throw new Error(`${w}: reward type ${r.type}`);
        if (extra) parts.push(extra);
        return `{ ${parts.join(', ')} }`;
      });
      L.push(`    tasks: [${tasks.join(', ')}],`, `    rewards: [${rewards.join(', ')}],`);
      const raw = rawOf(quest, QUEST_KEYS, where);
      if (raw) L.push('    ' + raw + ',');
      L.push('  },');
    }
    L.push('];', '');
    out.set(era, L.join('\n'));
  }
  return out;
}

function main(argv) {
  let book = BOOK_CHAPTERS;
  let outDir = QUESTS_DIR;
  const eras = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--book') book = path.resolve(argv[++i]);
    else if (argv[i] === '--out') outDir = argv[++i];
    else eras.push(argv[i]);
  }
  if (!eras.length) throw new Error('usage: import-snbt.mjs [--book dir] [--out dir|-] <era> ...');
  for (const [era, text] of importChapters(book, eras)) {
    const rel = `${era}-chapter/quests-data.mjs`;
    if (outDir === '-') process.stdout.write(`//// FILE ${rel}\n${text}`);
    else {
      fs.mkdirSync(path.join(outDir, `${era}-chapter`), { recursive: true });
      fs.writeFileSync(path.join(outDir, rel), text);
      console.log(`wrote ${path.join(outDir, rel)}`);
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
