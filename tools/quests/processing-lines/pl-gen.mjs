// Generates the Processing Lines chapters (pack/config/ftbquests/quests/chapters/pl_*.snbt) from the data files.
//
//   node tools/quests/processing-lines/pl-gen.mjs [--only pl_lv,pl_mv] [--dry]
//
// Writes, in this checkout:
//   - one chapter file per data file, in the book's format (tabs, LF, no BOM, keys sorted, inline task compounds);
//   - the "Processing Lines" group in chapter_groups.snbt (added once, after the others);
//   - the charts' starting points in tools/quests/lint-config.json (allowRoots: every line starts from its raw inputs).
// Prints, per chapter, the quests and dependencies FTB Quests will load (GG_QUESTS_EXPECTED in gg_test_quests.js) and the
// layout findings of what the game draws (quest links included, which the book linter does not see).
// Ids are derived from the chapter file and the node key (pl-model.mjs#hid), so a regeneration keeps every id.
import fs from 'node:fs';
import path from 'node:path';
import { buildModel, layoutFindings, GROUP_ID, GROUP_TITLE, REPO, hid } from './pl-model.mjs';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const repo = REPO;
const only = opt('--only', '') ? new Set(opt('--only', '').split(',')) : null;
const dry = args.includes('--dry');

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const str = (s) => '"' + esc(s) + '"';
function dnum(v) {
  const f = Number(v);
  if (Number.isInteger(f)) return f + '.0d';
  let s = String(Math.round(f * 1000) / 1000);
  if (!s.includes('.')) s += '.0';
  return s + 'd';
}
const compound = (fields) => '{ ' + Object.keys(fields).sort().map((k) => k + ': ' + fields[k]).join(', ') + ' }';
function list(key, items, indent) {
  if (items.length === 1) return key + ': [' + items[0] + ']';
  return key + ': [\n' + items.map((s) => indent + '\t' + s).join('\n') + '\n' + indent + ']';
}

function questSnbt(nd, indent) {
  const inner = indent + '\t';
  const f = {};
  if (nd.deps.length) f.dependencies = 'dependencies: [' + nd.deps.map(str).join(', ') + ']';
  if (nd.deps.length > 1 && nd.anyOf) f.dependency_requirement = 'dependency_requirement: "one_completed"';
  const desc = [].concat(nd.desc || []);
  if (desc.length) f.description = list('description', desc.map(str), inner);
  f.icon = 'icon: ' + str(nd.item);
  f.id = 'id: ' + str(nd.id);
  if (nd.shape) f.shape = 'shape: ' + str(nd.shape);
  f.size = 'size: ' + dnum(nd.size);
  if (nd.sub) f.subtitle = 'subtitle: ' + str(nd.sub);
  const tasks = [
    compound({ id: str(hid('task|' + nd.chapter + '|' + nd.key + '|item')), item: str(nd.item), optional_task: 'true', type: '"item"' }),
    compound({ id: str(hid('task|' + nd.chapter + '|' + nd.key + '|check')), type: '"checkmark"' }),
  ];
  f.tasks = list('tasks', tasks, inner);
  f.title = 'title: ' + str(nd.title);
  f.x = 'x: ' + dnum(nd.x);
  f.y = 'y: ' + dnum(nd.y);
  return [indent + '{', ...Object.keys(f).sort().map((k) => inner + f[k]), indent + '}'].join('\n');
}

function linkSnbt(nd, indent) {
  const f = { id: str(nd.id), linked_quest: str(nd.target.id), x: dnum(nd.x), y: dnum(nd.y) };
  if (nd.shape) f.shape = str(nd.shape);
  if (nd.size !== 1) f.size = dnum(nd.size);
  const inner = indent + '\t';
  return [indent + '{', ...Object.keys(f).sort().map((k) => inner + k + ': ' + f[k]), indent + '}'].join('\n');
}

function chapterSnbt(m) {
  const quests = m.nodes.filter((nd) => !nd.link);
  const links = m.nodes.filter((nd) => nd.link);
  const focus = m.byKey.get(m.focus);
  if (!focus || focus.link) throw new Error(`${m.file}: focus ${m.focus} is not a quest`);
  const lines = [
    '{',
    '\tautofocus_id: ' + str(focus.id),
    '\tconsume_items: false',
    '\tdefault_hide_dependency_lines: false',
    '\tdefault_quest_shape: ""',
    '\tfilename: ' + str(m.file),
    '\tgroup: ' + str(GROUP_ID),
    '\ticon: ' + str(m.icon),
    '\tid: ' + str(m.id),
    '\torder_index: ' + m.order,
    '\tprogression_mode: "flexible"',
    links.length ? '\tquest_links: [\n' + links.map((l) => linkSnbt(l, '\t\t')).join('\n') + '\n\t]' : '\tquest_links: [ ]',
    '\tquests: [',
    quests.map((q) => questSnbt(q, '\t\t')).join('\n'),
    '\t]',
    '\tsubtitle: [' + [].concat(m.subtitle).map(str).join(', ') + ']',
    '\ttitle: ' + str(m.title),
    '}',
  ];
  return lines.join('\n') + '\n';
}

function writeGroup(file) {
  let text = fs.readFileSync(file, 'utf8');
  if (text.includes(GROUP_ID)) return false;
  const line = `\t\t{ id: "${GROUP_ID}", title: "${GROUP_TITLE}" }\n`;
  text = text.replace(/(\n\t\]\n\}\s*)$/, '\n' + line.replace(/\n$/, '') + '$1');
  if (!text.includes(GROUP_ID)) throw new Error('could not add the group to ' + file);
  fs.writeFileSync(file, text);
  return true;
}

// allowRoots for the pl_* chapters: a targeted text edit, so the rest of lint-config.json keeps its formatting
function writeRoots(file, model) {
  const raw = fs.readFileSync(file, 'utf8');
  const crlf = raw.includes('\r\n');
  let text = raw.replace(/\r\n/g, '\n');
  const entries = [
    '    "_why_pl": "Processing Lines (pl_*): every line starts from its own raw inputs, so a chart has one starting point per input. The charts are reference only: no quest outside the group depends on them (docs/quests.md, section 17)."',
  ];
  for (const m of model.chapters) {
    const roots = m.nodes.filter((nd) => !nd.link && nd.deps.length === 0).sort((a, b) => a.x - b.x || a.y - b.y);
    entries.push(`    "${m.file}": [${roots.map((r) => '"' + r.id + '"').join(', ')}]`);
  }
  // the allowRoots object: one entry per line, closed at two spaces
  const re = /"allowRoots": \{[\s\S]*?\n  \}/;
  if (!re.test(text)) throw new Error('allowRoots not found in ' + file);
  // keep entries for chapters that are not ours
  const cur = JSON.parse(text).allowRoots || {};
  const others = Object.entries(cur).filter(([k]) => !k.startsWith('pl_') && k !== '_why_pl');
  const otherLines = others.map(([k, v]) => `    "${k}": ${JSON.stringify(v)}`);
  const all = otherLines.concat(entries);
  text = text.replace(re, '"allowRoots": {\n' + all.join(',\n') + '\n  }');
  if (!/"noRewardGroups"/.test(text)) {
    text = text.replace(/\n  "allowRoots": \{/, `\n  "noRewardGroups": { "groups": ["${GROUP_TITLE}"], "why": "The processing-line charts are reference: no rewards, nothing to claim (docs/quests.md, section 17)." },\n  "allowRoots": {`);
  }
  JSON.parse(text);
  fs.writeFileSync(file, crlf ? text.replace(/\n/g, '\r\n') : text);
}

const model = buildModel();
if (model.errors.length) {
  console.error(model.errors.join('\n'));
  process.exit(2);
}
const book = path.join(repo, 'pack', 'config', 'ftbquests', 'quests');
let bad = 0;
for (const m of model.chapters) {
  const quests = m.nodes.filter((nd) => !nd.link);
  const deps = quests.reduce((s, q) => s + q.deps.length, 0);
  const findings = layoutFindings(m);
  bad += findings.length;
  console.log(`${m.file}: ${quests.length} quests, ${deps} dependencies, ${m.nodes.length - quests.length} links, ${m.lines.length} drawn lines, ${findings.length} layout findings`);
  for (const f of findings) console.log('  ' + f);
  if (dry || (only && !only.has(m.file))) continue;
  fs.writeFileSync(path.join(book, 'chapters', m.file + '.snbt'), chapterSnbt(m));
}
if (!dry) {
  if (writeGroup(path.join(book, 'chapter_groups.snbt'))) console.log('added the group to chapter_groups.snbt');
  writeRoots(path.join(repo, 'tools', 'quests', 'lint-config.json'), model);
  console.log('wrote ' + (only ? [...only].join(', ') : model.chapters.map((m) => m.file).join(', ')));
}
process.exitCode = bad ? 1 : 0;
