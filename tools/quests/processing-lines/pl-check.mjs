// Checks every arrow of the Processing Lines charts against a recipe dump (gg_dump's kubejs-exported), with the repository's
// own loaders (tools/analysis/lib). An arrow A -> B passes when:
//   item -> item        some recipe takes A and gives B (recycling recipes do not count; `by` limits the recipe types);
//   item -> machine M   some recipe of M's types takes A;
//   machine M -> item   some recipe of M's types gives B and takes one of the items drawn into M (any, if none is drawn);
//   machine -> machine  some recipe takes the first controller and gives the second (how it is built);
//   summary A -> B      { via: [I1, I2, ...] }: every step A -> I1 -> I2 -> ... -> B passes as item -> item.
// Also: every icon and task item exists and is not hidden in EMI (the dump's c:hidden_from_recipe_viewers, and
// hidden_until.json groups after IMPLEMENTED_ERA), every machine's recipe types exist, and every leaf states where it ends.
//
//   node tools/quests/processing-lines/pl-check.mjs --dump <kubejs-exported> [--out <report.md>] [--era iv]
//        [--dump-table <hidden_until.json>]
//
// --dump is the kubejs-exported folder of a gg_dump run (test-runs/<run>/results/server/kubejs-exported). --out writes the
// full report (every arrow with the recipe that proves it, and the summary arrows); without it only the totals and the
// problems are printed. --dump-table is the hidden table the dump was taken with; by default it is read from the run's
// upload.zip, three folders up from the dump.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { buildModel, REPO } from './pl-model.mjs';
import { loadIndex, inputKeys, outputKeys } from './pl-index.mjs';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const dumpDir = opt('--dump', null);
if (!dumpDir) {
  console.error('usage: node pl-check.mjs --dump <kubejs-exported folder of a gg_dump run> [--out <report.md>] [--era <era>] [--dump-table <file>]');
  process.exit(2);
}
const repo = REPO;
const outFile = opt('--out', null);
const ERAS = ['steam', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max'];
// the era EMI shows today: hidden.js's IMPLEMENTED_ERA in this checkout (the dump may come from an earlier switch)
const hiddenJs = fs.readFileSync(path.join(repo, 'pack', 'kubejs', 'server_scripts', 'grindless', 'integration', 'hidden.js'), 'utf8');
const implemented = opt('--era', (/const IMPLEMENTED_ERA = '([a-z]+)'/.exec(hiddenJs) || [])[1] || 'ev');

// one entry of a zip file (the bench's upload.zip: no zip64, stored or deflated)
function readZipEntry(file, name) {
  const buf = fs.readFileSync(file);
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) return null;
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let n = 0; n < count && buf.readUInt32LE(p) === 0x02014b50; n++) {
    const method = buf.readUInt16LE(p + 10);
    const size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const skip = nameLen + buf.readUInt16LE(p + 30) + buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    if (buf.toString('utf8', p + 46, p + 46 + nameLen).replace(/\\/g, '/') === name) {
      const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
      const data = buf.subarray(start, start + size);
      return method === 0 ? data : method === 8 ? zlib.inflateRawSync(data) : null;
    }
    p += 46 + skip;
  }
  return null;
}

const model = buildModel();
if (model.errors.length) { console.error(model.errors.join('\n')); process.exit(2); }
const idx = await loadIndex({ dump: dumpDir });
// a machine node without explicit recipe types runs the ones machines.json lists for its controller
for (const m of model.chapters) {
  for (const nd of m.nodes) {
    if (!nd.machine || nd.types.length) continue;
    const reg = idx.machines.get(nd.item);
    nd.types = reg && Array.isArray(reg.types) ? reg.types : [];
    if (!nd.types.length) nd.typeless = true;
  }
}

const hiddenTag = new Set((idx.tags.itemTags.get('c:hidden_from_recipe_viewers') || []));
const hiddenFluidTag = new Set((idx.tags.fluidTags.get('c:hidden_from_recipe_viewers') || []));
const readJson = (text) => JSON.parse(String(text).replace(/^\uFEFF/, ''));
const table = readJson(fs.readFileSync(path.join(repo, 'pack', 'kubejs', 'data', 'grindless', 'tables', 'hidden_until.json'), 'utf8'));
const dumpEra = (idx.dump.info && idx.dump.info.hidden && idx.dump.info.hidden.implementedEra) || 'ev';
const rankOf = (g) => (g.until === 'never' ? ERAS.length : ERAS.indexOf(g.until));
const lateItem = new Map();
const lateFluid = new Map();
for (const g of table.groups || []) {
  if (rankOf(g) <= ERAS.indexOf(implemented)) continue;
  for (const i of g.items || []) lateItem.set(i, g.until);
  for (const f of g.fluids || []) lateFluid.set(f, g.until);
}
// the dump's tag was written at dumpEra with the table of that run (the current table drops the eras it already shows):
// what that table hid until an era up to the current switch shows again, whatever else the tag hides (junk, old items,
// removed machines) stays hidden
let dumpTable = table;
let dumpTableFrom = 'the current hidden_until.json';
const tableArg = opt('--dump-table', null);
const upload = path.resolve(dumpDir, '..', '..', '..', 'upload.zip');
if (tableArg) {
  dumpTable = readJson(fs.readFileSync(tableArg, 'utf8'));
  dumpTableFrom = tableArg;
} else if (fs.existsSync(upload)) {
  const raw = readZipEntry(upload, 'pack/kubejs/data/grindless/tables/hidden_until.json');
  if (raw) { dumpTable = readJson(raw.toString('utf8')); dumpTableFrom = upload; }
}
if (dumpTable === table && dumpEra !== implemented) {
  console.log(`note: the dump was taken with EMI at ${dumpEra} and the switch is now at ${implemented}, but the run's hidden table was not found (pass --dump-table): items that showed up since then count as hidden`);
}
const dumpItem = new Map();
const dumpFluid = new Map();
for (const g of dumpTable.groups || []) {
  for (const i of g.items || []) dumpItem.set(i, rankOf(g));
  for (const f of g.fluids || []) dumpFluid.set(f, rankOf(g));
}
const stillHidden = (id, dumpMap) => {
  const r = dumpMap.get(id);
  return r === undefined || r <= ERAS.indexOf(dumpEra) || r > ERAS.indexOf(implemented);
};

const recycling = (r) => typeof r.category === 'string' && r.category.endsWith('_recycling');
const keysOf = (nd) => [nd.res, ...(nd.alt || [])];

function itemToItem(a, b, types, allowRecycling = false) {
  const hits = [];
  for (const ka of a) {
    for (const r of idx.consumers.get(ka) || []) {
      if ((!allowRecycling && recycling(r)) || (types && !types.includes(r.type))) continue;
      const outs = outputKeys(r);
      if (b.some((kb) => outs.has(kb))) hits.push(r);
    }
  }
  return hits;
}

function drawnInputs(m) {
  return m.arrows.filter((e) => !e.srcRes.machine).flatMap((e) => keysOf(e.srcRes));
}

function checkArrow(e) {
  const A = e.srcRes;
  const B = e.dst;
  const types = e.by || (B.machine ? null : B.by) || null;
  if (e.via) {
    const chain = [keysOf(A), ...e.via.map((k) => [k]), keysOf(B)];
    if (A.machine || B.machine) return { ok: false, why: 'a summary arrow joins items, not machines' };
    const steps = [];
    for (let i = 0; i + 1 < chain.length; i++) {
      const hits = itemToItem(chain[i], chain[i + 1], null);
      if (!hits.length) return { ok: false, why: `no recipe takes ${chain[i][0]} and gives ${chain[i + 1][0]}` };
      steps.push(hits[0].id);
    }
    return { ok: true, recipes: steps, summary: e.via };
  }
  if (!A.machine && !B.machine) {
    // GTM files block-to-dust grinding (cobblestone to stone dust) under its recycling categories: an arrow says so with recycle
    const hits = itemToItem(keysOf(A), keysOf(B), types, !!(e.recycle || B.recycle));
    return hits.length ? { ok: true, recipes: [hits[0].id], n: hits.length } : { ok: false, why: `no recipe${types ? ' of ' + types.join('|') : ''} takes ${A.res} and gives ${B.res}` };
  }
  if (!A.machine && B.machine) {
    const hits = keysOf(A).flatMap((k) => (idx.consumers.get(k) || []).filter((r) => B.types.includes(r.type) && !recycling(r)));
    return hits.length ? { ok: true, recipes: [hits[0].id], n: hits.length } : { ok: false, why: `no ${B.types.join('|')} recipe takes ${A.res}` };
  }
  if (A.machine && !B.machine) {
    const ins = drawnInputs(A);
    const hits = keysOf(B).flatMap((k) => (idx.producers.get(k) || []).filter((r) => A.types.includes(r.type) && !recycling(r)
      && (ins.length === 0 || ins.some((i) => inputKeys(r).has(i)))));
    return hits.length ? { ok: true, recipes: [hits[0].id], n: hits.length } : { ok: false, why: `no ${A.types.join('|')} recipe gives ${B.res}${ins.length ? ' from ' + ins.join(' or ') : ''}` };
  }
  const hits = itemToItem([A.item], [B.item], null);
  return hits.length ? { ok: true, recipes: [hits[0].id], build: true } : { ok: false, why: `no recipe builds ${B.item} from ${A.item}` };
}

const lines = ['# Processing lines: arrow check', '', `Dump: \`${dumpDir}\` (EMI switch at ${dumpEra} when dumped). Implemented era now: ${implemented}.`, ''];
let fails = 0;
let total = 0;
let allIssues = 0;
const summaries = [];
for (const m of model.chapters) {
  const issues = [];
  const verified = [];
  // what every node shows
  for (const nd of m.nodes) {
    if (nd.link) continue;
    if (!idx.items.has(nd.item)) issues.push(`${nd.key}: item ${nd.item} does not exist`);
    if (hiddenTag.has(nd.item) && stillHidden(nd.item, dumpItem)) issues.push(`${nd.key}: ${nd.item} is hidden in EMI (c:hidden_from_recipe_viewers)`);
    if (lateItem.has(nd.item)) issues.push(`${nd.key}: ${nd.item} waits for ${lateItem.get(nd.item)} (hidden_until.json)`);
    if (nd.fluid) {
      if (!idx.fluids.has(nd.fluid)) issues.push(`${nd.key}: fluid ${nd.fluid} does not exist`);
      if (hiddenFluidTag.has(nd.fluid) && stillHidden(nd.fluid, dumpFluid)) issues.push(`${nd.key}: fluid ${nd.fluid} is hidden in EMI`);
      if (lateFluid.has(nd.fluid)) issues.push(`${nd.key}: fluid ${nd.fluid} waits for ${lateFluid.get(nd.fluid)}`);
    }
    if (nd.machine && nd.typeless) issues.push(`${nd.key}: no recipe types for ${nd.item} (machines.json has none: give them)`);
    if (nd.machine) for (const t of nd.types) if (!idx.recipeTypes.has(t) && ![...idx.recipes.values()].some((r) => r.type === t)) issues.push(`${nd.key}: recipe type ${t} unknown`);
  }
  // leaves
  const hasOut = new Set();
  for (const mm of model.chapters) for (const nd of mm.nodes) for (const e of nd.arrows) hasOut.add(e.srcRes.id);
  for (const nd of m.nodes) {
    if (nd.link || nd.machine || hasOut.has(nd.id)) continue;
    if (['product', 'ret', 'dest'].includes(nd.kind)) continue;
    if (!nd.end) issues.push(`${nd.key}: a leaf with no destination (give it an arrow, kind 'product', or end: '...')`);
  }
  // arrows
  for (const nd of m.nodes) {
    for (const e of nd.arrows) {
      total++;
      const r = checkArrow(e);
      const name = `${e.src.key}${e.src.link ? ' (' + e.src.link + ')' : ''} -> ${nd.key}`;
      if (!r.ok) { fails++; issues.push(`ARROW ${name}: ${r.why}`); continue; }
      verified.push(`${name}: ${r.recipes.join(' + ')}${r.n > 1 ? ` (and ${r.n - 1} more)` : ''}${r.build ? ' (built from)' : ''}`);
      if (r.summary) summaries.push(`${m.file}: ${e.srcRes.title} -> ${nd.title}, through ${r.summary.join(', ')} (${r.recipes.join(', ')})`);
    }
  }
  lines.push(`## ${m.file}: ${m.nodes.length} nodes, ${verified.length} arrows verified, ${issues.length} issues`, '');
  allIssues += issues.length;
  for (const i of issues) lines.push('- **' + i + '**');
  if (issues.length) lines.push('');
  for (const v of verified) lines.push('- ' + v);
  lines.push('');
  console.log(`${m.file}: ${verified.length} arrows verified, ${issues.length} issues`);
  for (const i of issues) console.log('  ' + i);
}
lines.push('## Summary arrows (named intermediates)', '');
for (const s of summaries) lines.push('- ' + s);
if (outFile) {
  fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
  fs.writeFileSync(outFile, lines.join('\n') + '\n');
}
console.log(`total: ${total} arrows, ${fails} failing, ${allIssues} issues; ${summaries.length} summary arrows; hidden table at dump time: ${dumpTableFrom}${outFile ? '; report ' + outFile : ''}`);
process.exitCode = allIssues ? 1 : 0;
