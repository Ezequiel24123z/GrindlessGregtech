// Generates pack/config/ftbquests/quests/chapters/luv_age.snbt from quests-data.mjs (docs/quests.md, section 14, LuV).
// Same SNBT format as tools/quests/ev-chapter/gen.mjs. Ids are derived from the quest key (seed "c2-luv-quests"), so a re-run and a
// package landing never change an id.
//
// Packages: every quest names the LuV packages it needs (`pkg`); a quest whose packages are not all in LANDED (quests-data.mjs) is left
// out, so no id that isn't registered yet reaches the book. A dependency on a left-out quest is replaced by that quest's own
// dependencies (docs/quests.md, section 8: "when one goes, its children depend on its parents"). A quest may carry `fallback`
// ({ unless: [packages], x, y, deps }): its place and dependencies while one of those packages is missing. Quests that share a
// `slot` are alternatives (the tether or the sulfur-iodine plant): at most one of them may land.
//
// Usage: node tools/quests/luv-chapter/gen.mjs [--all] [--out <file>] [--pending]
//   --all      pretend every package has landed (the draft of the finished chapter; use with --out for a preview)
//   --out      write somewhere else than the book
//   --pending  print the left-out quests and the ids they wait for, by package
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { QUESTS, CHAPTER, LANDED, PACKAGES, ALL_STATE } from './quests-data.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const args = process.argv.slice(2);
const all = args.includes('--all');
const outArg = args.indexOf('--out');
const out = outArg >= 0 ? path.resolve(args[outArg + 1]) : path.join(repo, 'pack', 'config', 'ftbquests', 'quests', 'chapters', 'luv_age.snbt');

function newId(seed) {
  const b = crypto.createHash('sha256').update('c2-luv-quests|' + seed).digest().subarray(0, 8);
  b[0] = (b[0] & 0x7f) | 0x10;
  return Buffer.from(b).toString('hex').toUpperCase();
}

for (const p of LANDED) if (!PACKAGES.includes(p)) throw new Error('LANDED names unknown package ' + p);
const landed = new Set(all ? ALL_STATE : LANDED);
const byKey = new Map(QUESTS.map((q) => [q.key, q]));
if (byKey.size !== QUESTS.length) throw new Error('duplicate quest key');
for (const q of QUESTS) {
  for (const p of q.pkg || []) if (!PACKAGES.includes(p)) throw new Error(`${q.key}: unknown package ${p}`);
  q.id = newId(q.key);
  q.tasks.forEach((t, i) => { t.id = newId(q.key + '|task|' + i + '|' + (t.item || t.dimension || t.type)); });
  q.rewards.forEach((r, i) => { r.id = newId(q.key + '|reward|' + i + '|' + (r.item || r.type)); });
  q.on = (q.pkg || []).every((p) => landed.has(p));
  const fb = q.fallback && q.fallback.unless.some((p) => !landed.has(p)) ? q.fallback : null;
  q.px = fb ? fb.x : q.x;
  q.py = fb ? fb.y : q.y;
  q.pdeps = fb ? fb.deps : q.deps;
}
const slots = new Map();
for (const q of QUESTS.filter((q) => q.on && q.slot)) {
  if (slots.has(q.slot)) throw new Error(`${q.key} and ${slots.get(q.slot)} share slot ${q.slot}: only one of them can land`);
  slots.set(q.slot, q.key);
}

// dependencies of a quest that is in the book, with left-out quests replaced by their parents
function resolve(key, seen = new Set()) {
  if (key.startsWith('X:')) return [key.slice(2)];
  const p = byKey.get(key);
  if (!p) throw new Error('unknown dependency key ' + key);
  if (p.on) return [p.id];
  // the other alternative of a slot that has landed stands in for this one
  if (p.slot && slots.has(p.slot)) return [];
  if (seen.has(key)) return [];
  seen.add(key);
  return p.pdeps.flatMap((d) => resolve(d, seen));
}
const shown = QUESTS.filter((q) => q.on);
for (const q of shown) {
  q.depIds = [...new Set(q.pdeps.flatMap((d) => resolve(d)))];
  if (!q.depIds.length) throw new Error(`${q.key} would float: none of its dependencies has landed`);
}

if (args.includes('--pending')) {
  const byPkg = new Map();
  for (const q of QUESTS.filter((q) => !q.on)) {
    const missing = (q.pkg || []).filter((p) => !landed.has(p)).join('+');
    if (!byPkg.has(missing)) byPkg.set(missing, []);
    byPkg.get(missing).push(q);
  }
  for (const [p, qs] of [...byPkg].sort()) {
    console.log(`waiting for ${p}:`);
    for (const q of qs) {
      const ids = q.tasks.map((t) => t.item || (t.dimension && 'dimension ' + t.dimension)).filter(Boolean);
      console.log(`  ${q.key} "${q.title}" ${q.id}: ${ids.join(', ')}`);
    }
  }
  const adjust = shown.filter((q) => q.adjust);
  if (adjust.length) {
    console.log('in the book, to check when a package lands:');
    for (const q of adjust) console.log(`  ${q.key} "${q.title}" ${q.id}: ${q.adjust}`);
  }
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
  f.x = 'x: ' + dnum(q.px);
  f.y = 'y: ' + dnum(q.py);
  return [indent + '{', ...Object.keys(f).sort().map((k) => inner + f[k]), indent + '}'].join('\n');
}

const lines = [
  '{',
  '\tautofocus_id: ' + str(byKey.get(CHAPTER.autofocus).id),
  '\tdefault_hide_dependency_lines: false',
  '\tdefault_quest_shape: ""',
  '\tfilename: "luv_age"',
  '\tgroup: ' + str(CHAPTER.group),
  '\ticon: ' + str(CHAPTER.icon),
  '\tid: ' + str(CHAPTER.id || newId('chapter|luv_age')),
  '\torder_index: ' + CHAPTER.order,
  '\tquest_links: [ ]',
  '\tquests: [',
  shown.map((q) => quest(q, '\t\t')).join('\n'),
  '\t]',
  '\tsubtitle: [' + CHAPTER.subtitle.map(str).join(', ') + ']',
  '\ttitle: ' + str(CHAPTER.title),
  '}',
];
fs.writeFileSync(out, lines.join('\n') + '\n', { encoding: 'utf8' });
const deps = shown.reduce((n, q) => n + q.depIds.length, 0);
console.log(`wrote ${out}: ${shown.length} quests, ${deps} dependencies (${QUESTS.length - shown.length} waiting for their package)`);
