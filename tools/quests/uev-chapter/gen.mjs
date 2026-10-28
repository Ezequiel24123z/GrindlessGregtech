// Generates pack/config/ftbquests/quests/chapters/uev_age.snbt from quests-data.mjs (docs/quests.md, section 14, UEV).
// Same SNBT format as tools/quests/luev-chapter/gen.mjs. Ids are derived from the quest key (seed "c2-uev-quests"), so a re-run never
// changes an id. Every UEV package has landed, so nothing is gated.
//
// Usage: node tools/quests/uev-chapter/gen.mjs [--out <file>]
//   --out  write somewhere else than the book ("-": print the chapter on stdout, the summary on stderr)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { QUESTS, CHAPTER } from './quests-data.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const args = process.argv.slice(2);
const outArg = args.indexOf('--out');
const out = outArg >= 0 ? path.resolve(args[outArg + 1]) : path.join(repo, 'pack', 'config', 'ftbquests', 'quests', 'chapters', 'uev_age.snbt');

function newId(seed) {
  const b = crypto.createHash('sha256').update('c2-uev-quests|' + seed).digest().subarray(0, 8);
  b[0] = (b[0] & 0x7f) | 0x10;
  return Buffer.from(b).toString('hex').toUpperCase();
}

const byKey = new Map(QUESTS.map((q) => [q.key, q]));
if (byKey.size !== QUESTS.length) throw new Error('duplicate quest key');
for (const q of QUESTS) {
  q.id = newId(q.key);
  q.tasks.forEach((t, i) => { t.id = newId(q.key + '|task|' + i + '|' + (t.item || t.dimension || t.type)); });
  q.rewards.forEach((r, i) => { r.id = newId(q.key + '|reward|' + i + '|' + (r.item || r.type)); });
}
for (const q of QUESTS) {
  q.depIds = q.deps.map((d) => {
    if (d.startsWith('X:')) return d.slice(2);
    const p = byKey.get(d);
    if (!p) throw new Error(`${q.key}: unknown dependency ${d}`);
    return p.id;
  });
}

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
function task(t) {
  const f = { id: str(t.id), type: str(t.type) };
  if (t.type === 'item') {
    f.item = str(t.item);
    if ((t.count ?? 1) !== 1) f.count = t.count + 'L';
  } else if (t.type === 'dimension') {
    f.dimension = str(t.dimension);
  } else if (t.type !== 'checkmark') throw new Error('task type ' + t.type);
  return compound(f);
}
function reward(r) {
  const f = { id: str(r.id), type: str(r.type) };
  if (r.type === 'xp') f.xp = String(r.xp);
  else if (r.type === 'item') {
    f.item = str(r.item);
    if ((r.count ?? 1) !== 1) f.count = String(r.count);
  } else throw new Error('reward type ' + r.type);
  return compound(f);
}
function list(key, items, indent) {
  if (items.length === 1) return key + ': [' + items[0] + ']';
  return key + ': [\n' + items.map((s) => indent + '\t' + s).join('\n') + '\n' + indent + ']';
}
function quest(q, indent) {
  const inner = indent + '\t';
  const f = {};
  f.dependencies = 'dependencies: [' + q.depIds.map(str).join(', ') + ']';
  f.description = list('description', q.desc.map(str), inner);
  f.icon = 'icon: ' + str(q.icon);
  f.id = 'id: ' + str(q.id);
  if (q.optional) f.optional = 'optional: true';
  f.rewards = list('rewards', q.rewards.map(reward), inner);
  if (q.shape) f.shape = 'shape: ' + str(q.shape);
  if (q.size !== undefined) f.size = 'size: ' + dnum(q.size);
  f.tasks = list('tasks', q.tasks.map(task), inner);
  f.title = 'title: ' + str(q.title);
  f.x = 'x: ' + dnum(q.x);
  f.y = 'y: ' + dnum(q.y);
  return [indent + '{', ...Object.keys(f).sort().map((k) => inner + f[k]), indent + '}'].join('\n');
}

const lines = [
  '{',
  '\tautofocus_id: ' + str(byKey.get(CHAPTER.autofocus).id),
  '\tdefault_hide_dependency_lines: false',
  '\tdefault_quest_shape: ""',
  '\tfilename: "uev_age"',
  '\tgroup: ' + str(CHAPTER.group),
  '\ticon: ' + str(CHAPTER.icon),
  '\tid: ' + str(CHAPTER.id || newId('chapter|uev_age')),
  '\torder_index: ' + CHAPTER.order,
  '\tquest_links: [ ]',
  '\tquests: [',
  QUESTS.map((q) => quest(q, '\t\t')).join('\n'),
  '\t]',
  '\tsubtitle: [' + CHAPTER.subtitle.map(str).join(', ') + ']',
  '\ttitle: ' + str(CHAPTER.title),
  '}',
];
const text = lines.join('\n') + '\n';
const deps = QUESTS.reduce((n, q) => n + q.depIds.length, 0);
const summary = `${QUESTS.length} quests, ${deps} dependencies`;
if (outArg >= 0 && args[outArg + 1] === '-') {
  process.stdout.write(text);
  console.error('uev_age: ' + summary);
} else {
  fs.writeFileSync(out, text, { encoding: 'utf8' });
  console.log(`wrote ${out}: ${summary}`);
}
