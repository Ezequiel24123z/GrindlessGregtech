// Generates the Processing Lines chapters (pack/config/ftbquests/quests/chapters/pl_*.snbt) and the Power tab (power.snbt)
// from the data files (pl-data-*.mjs, power-data.mjs).
//
//   node tools/quests/processing-lines/pl-gen.mjs [--only pl_lv,power] [--dry] [--print]
//
// --print writes nothing: the chapters' SNBT (with --only, just those) goes to stdout, the counts to stderr (the tests use it with
// GG_STATIONS_TABLE, tools/quests/luv-stations.mjs, to draw pl_luv and power for each mode of tables/stations.json).
//
// Writes, in this checkout:
//   - one chapter file per data file, in the book's format (tabs, LF, no BOM, keys sorted, inline task compounds);
//   - the "Processing Lines" group in chapter_groups.snbt (added once, after the others; Power goes in its data file's group);
//   - the charts' starting points in tools/quests/lint-config.json (allowRoots: every line starts from its raw inputs), and
//     the Power tab's exemptions there (no rewards, quantities in its text, its stand-alone nodes);
// Prints, per chapter, the quests and dependencies FTB Quests will load (GG_QUESTS_EXPECTED in gg_test_quests.js) and the
// layout findings of what the game draws (quest links included, which the book linter does not see).
// Ids are derived from the chapter file and the node key (pl-model.mjs#hid), so a regeneration keeps every id.
import fs from 'node:fs';
import path from 'node:path';
import { buildModel, layoutFindings, GROUP_ID, GROUP_TITLE, REPO, BOOK, hid } from './pl-model.mjs';
import { KINDS } from './pl-lib.mjs';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const repo = REPO;
const only = opt('--only', '') ? new Set(opt('--only', '').split(',')) : null;
const print = args.includes('--print');
const dry = args.includes('--dry') || print;
const log = print ? console.error : console.log;

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

// ---------------------------------------------------------------- the Power tab's numbers as text (pl-lib.mjs#P)

// 1234567 -> "1,234,567"; from 100 million on, three significant digits and a word; fractions to two decimals
export function num(v) {
  const sig3 = (x) => String(Number(x.toPrecision(3)));
  // rounded first, so 999,948,288 reads "1 billion", not "1000 million"
  const r = Math.abs(v) >= 1e8 ? Number(v.toPrecision(3)) : v;
  if (Math.abs(r) >= 1e9) return sig3(r / 1e9) + ' billion';
  if (Math.abs(r) >= 1e8) return sig3(r / 1e6) + ' million';
  if (Number.isInteger(v)) return v.toLocaleString('en-US');
  return String(Math.round(v * 100) / 100);
}
const TIER_NAMES = { ulv: 'ULV', lv: 'LV', mv: 'MV', hv: 'HV', ev: 'EV', iv: 'IV', luv: 'LuV', zpm: 'ZPM', uv: 'UV', uhv: 'UHV', uev: 'UEV', uiv: 'UIV', uxv: 'UXV' };
const tierName = (t) => TIER_NAMES[String(t).toLowerCase()] || String(t);

function headline(f) {
  switch (f.t) {
    case 'single': return `${num(f.eut)} EU/t`;
    case 'run': return f.line ? null : `${num(f.eut)} EU/t${f.per ? ' ' + f.per : ''}${f.where ? ' ' + f.where : ''}`;
    case 'uses': return `uses ${num(f.eut)} EU/t`;
    case 'max': return `up to ${num(f.total)} EU/t`;
    case 'steam': return `${num(f.mbt)} mB/t of steam`;
    case 'engine': return `${num(f.eut)} EU/t, ${num(f.boosted)} boosted`;
    case 'turbine': return `${num(f.eut)} EU/t times the rotor's power`;
    case 'cover': return `${num(f.eut)} EU/t in clear sun`;
    case 'toll': return `a ${num(f.percent)}% toll, paid in AE energy`;
    case 'wslots': return `${num(f.n)} cell slots`;
    case 'wnet': return `${num(f.eut)} EU/t into the network`;
    default: return null;
  }
}

// the lists that go in the description, one paragraph per kind of figure (and per unit)
function figLines(figs) {
  const groups = [];
  const add = (label, entry) => {
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.entries.push(entry);
    else groups.push({ label, entries: [entry] });
  };
  for (const f of figs) {
    if (f.t === 'fuel') add('EU per ' + (f.unit || (f.key.startsWith('fluid:') ? 'mB' : 'item')), `${f.name ? f.name + ' ' : ''}${num(f.eu)}${f.note ? ' ' + f.note : ''}`);
    else if (f.t === 'steamFuel') add('Buckets of steam', `${f.name} ${num(f.buckets)}`);
    else if (f.t === 'ccSteam') add('Steam per mB of fuel', `${f.name} ${num(f.mb)} mB`);
    else if (f.t === 'battery') add('Holds', `${f.name} ${num(f.eu)} EU`);
    else if (f.t === 'cable') add('Loss per block and amp', `${f.name} ${f.loss ? num(f.loss) + ' EU' : 'none'} (${tierName(f.tier)}, ${f.amps} A)`);
    else if (f.t === 'run' && f.line) add(f.label || 'A run', `${f.name} ${num(f.eut)} EU/t`);
    else if (f.t === 'engine') add('With the boost', `each mB goes ${f.factor === 2 ? 'twice' : num(f.factor) + ' times'} as far`);
    else if (f.t === 'anywhere') groups.push({ plain: 'Off Earth it runs only on ' + andList(f.fuels.map((x) => x.name)) });
    else if (f.t === 'wcell') add('Holds', `${f.name} ${f.eu.toLocaleString('en-US')} EU`);
    else if (f.t === 'wloss') groups.push({ plain: `${num(f.percent)}% of what goes in is lost on the way` });
    else if (f.t === 'wamps') groups.push({ plain: `Comes in ${andList(f.amps.map(String))} A, ${tierName(f.from)} to ${tierName(f.to)}` });
    else if (f.t === 'wcover') groups.push({ plain: `${f.amps} A of its tier, ${tierName(f.from)} to ${tierName(f.to)}` });
  }
  return groups.map((g) => (g.plain ? g.plain + '.' : `${g.label}: ${g.entries.join(', ')}.`));
}
const andList = (xs) => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]);

export function nodeText(nd) {
  const figs = nd.figs || [];
  const heads = figs.map(headline).filter(Boolean).join(', ');
  // tier: the voltage tier (or the Steam Age) the node comes online in, ahead of its numbers
  const lead = nd.tier ? (nd.tier === 'steam' ? 'Steam Age' : tierName(nd.tier)) + (heads ? ': ' + heads : '') : heads;
  const joined = [lead, nd.sub].filter(Boolean).join('. ');
  const sub = lead ? joined.charAt(0).toUpperCase() + joined.slice(1) : joined;
  const desc = [...[].concat(nd.desc || []), ...figLines(figs)];
  return { sub, desc };
}

function questSnbt(nd, indent) {
  const inner = indent + '\t';
  const f = {};
  const text = nodeText(nd);
  if (nd.deps.length) f.dependencies = 'dependencies: [' + nd.deps.map(str).join(', ') + ']';
  if (nd.deps.length > 1 && nd.anyOf) f.dependency_requirement = 'dependency_requirement: "one_completed"';
  if (text.desc.length) f.description = list('description', text.desc.map(str), inner);
  f.icon = 'icon: ' + str(nd.item);
  f.id = 'id: ' + str(nd.id);
  if (nd.shape) f.shape = 'shape: ' + str(nd.shape);
  f.size = 'size: ' + dnum(nd.size);
  if (text.sub) f.subtitle = 'subtitle: ' + str(text.sub);
  // a tier marker, later content and a placeholder only take the checkmark: nothing to hold yet
  const checkOnly = KINDS[nd.kind] && KINDS[nd.kind].checkOnly;
  const tasks = [
    ...(checkOnly ? [] : [compound({ id: str(hid('task|' + nd.chapter + '|' + nd.key + '|item')), item: str(nd.item), optional_task: 'true', type: '"item"' })]),
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

// a chapter group's id by its title in chapter_groups.snbt (the Processing Lines group is ours: its id is fixed)
function groupId(title) {
  if (title === GROUP_TITLE) return GROUP_ID;
  const text = fs.readFileSync(path.join(BOOK, 'chapter_groups.snbt'), 'utf8');
  const m = new RegExp('\\{ id: "([0-9A-F]{16})", title: "' + title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '" \\}').exec(text);
  if (!m) throw new Error(`no chapter group titled "${title}" in chapter_groups.snbt`);
  return m[1];
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
    '\tgroup: ' + str(groupId(m.groupTitle)),
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

// The linter's exceptions for the generated chapters: a targeted text edit, so the rest of lint-config.json keeps its formatting.
//   allowRoots      every chart starts from its own raw inputs (one root per input)
//   noRewardGroups  the charts give no rewards (the Processing Lines group, and the Power tab inside Quality of Life)
//   quantityOk      the Power tab's numbers are its point (a chapter-wide entry)
const WHY_ROOTS = {
  _why_pl: 'Processing Lines (pl_*): every line starts from its own raw inputs, so a chart has one starting point per input. The charts are reference only: no quest outside the group depends on them (docs/quests.md, section 17).',
  _why_power: 'Power: every generator starts from its own fuel, so the tab has one starting point per fuel and per generator that burns nothing. It is reference only: no quest outside it depends on it (docs/quests.md, section 18).',
};
const POWER = 'power';

function writeRoots(file, model) {
  const raw = fs.readFileSync(file, 'utf8');
  const crlf = raw.includes('\r\n');
  let text = raw.replace(/\r\n/g, '\n');
  const ours = new Set(model.chapters.map((m) => m.file));
  const hasPower = ours.has(POWER);
  const entries = [`    "_why_pl": ${JSON.stringify(WHY_ROOTS._why_pl)}`];
  if (hasPower) entries.push(`    "_why_power": ${JSON.stringify(WHY_ROOTS._why_power)}`);
  for (const m of model.chapters) {
    const roots = m.nodes.filter((nd) => !nd.link && nd.deps.length === 0).sort((a, b) => a.x - b.x || a.y - b.y);
    entries.push(`    "${m.file}": [${roots.map((r) => '"' + r.id + '"').join(', ')}]`);
  }
  // the allowRoots object: one entry per line, closed at two spaces
  const re = /"allowRoots": \{[\s\S]*?\n  \}/;
  if (!re.test(text)) throw new Error('allowRoots not found in ' + file);
  // keep entries for chapters that are not ours
  const cur = JSON.parse(text).allowRoots || {};
  const others = Object.entries(cur).filter(([k]) => !ours.has(k) && !k.startsWith('pl_') && !(k in WHY_ROOTS));
  const otherLines = others.map(([k, v]) => `    "${k}": ${JSON.stringify(v)}`);
  const all = otherLines.concat(entries);
  text = text.replace(re, '"allowRoots": {\n' + all.join(',\n') + '\n  }');
  // quests that stand alone on purpose (alone: true in the data): the block is written again from the data every time
  const alone = model.chapters.map((m) => [m.file, m.nodes.filter((nd) => nd.alone && !nd.link).map((nd) => nd.id)]).filter(([, ids]) => ids.length);
  text = text.replace(/\n {2}"allowIsolated": \{[\s\S]*?\n {2}\},/, '');
  if (alone.length) {
    const isoLines = ['    "_why": "Quests that stand alone on purpose: alone: true in a processing-lines data file (docs/quests.md, section 17)."',
      ...alone.map(([k, ids]) => `    "${k}": [${ids.map((id) => '"' + id + '"').join(', ')}]`)];
    const block = '"allowIsolated": {\n' + isoLines.join(',\n') + '\n  }';
    text = text.replace(/\n {2}"allowLongEdges": /, `\n  ${block},\n  "allowLongEdges": `);
    if (!text.includes(block)) throw new Error('could not write allowIsolated in ' + file);
  }
  const noReward = hasPower
    ? `"noRewardGroups": { "groups": ["${GROUP_TITLE}"], "chapters": ["${POWER}"], "why": "The processing-line charts and the Power tab are reference: no rewards, nothing to claim (docs/quests.md, sections 17 and 18)." }`
    : `"noRewardGroups": { "groups": ["${GROUP_TITLE}"], "why": "The processing-line charts are reference: no rewards, nothing to claim (docs/quests.md, section 17)." }`;
  if (/"noRewardGroups": \{[^\n]*\}/.test(text)) text = text.replace(/"noRewardGroups": \{[^\n]*\}/, noReward);
  else text = text.replace(/\n  "allowRoots": \{/, `\n  ${noReward},\n  "allowRoots": {`);
  if (hasPower && !text.includes(`{ "chapter": "${POWER}"`)) {
    const entry = `{ "chapter": "${POWER}", "why": "Power (docs/quests.md, section 18): EU/t, EU per mB of fuel and steam per tick are the tab's point, and pl-check.mjs checks every one against the dump." }`;
    text = text.replace(/"quantityOk": \[\n/, `"quantityOk": [\n    ${entry},\n`);
    if (!text.includes(entry)) throw new Error('quantityOk not found in ' + file);
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
  log(`${m.file}: ${quests.length} quests, ${deps} dependencies, ${m.nodes.length - quests.length} links, ${m.lines.length} drawn lines, ${findings.length} layout findings`);
  for (const f of findings) log('  ' + f);
  if (print && (!only || only.has(m.file))) process.stdout.write(chapterSnbt(m));
  if (dry || (only && !only.has(m.file))) continue;
  fs.writeFileSync(path.join(book, 'chapters', m.file + '.snbt'), chapterSnbt(m));
}
if (!dry) {
  if (writeGroup(path.join(book, 'chapter_groups.snbt'))) console.log('added the group to chapter_groups.snbt');
  writeRoots(path.join(repo, 'tools', 'quests', 'lint-config.json'), model);
  console.log('wrote ' + (only ? [...only].join(', ') : model.chapters.map((m) => m.file).join(', ')));
}
process.exitCode = bad ? 1 : 0;
