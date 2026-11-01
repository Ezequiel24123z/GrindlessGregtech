// Per-era census of the pack: what each era registers, how many recipes and quests it has, and the suspicious content found on the way.
//   node tools/analysis/census.mjs --dump <kubejs-exported dump folder> [--errors <kubejs-errors.txt>] [--out <folder>]
// Sources: the pack's scripts run in Node (lib/kubejs_static.mjs, about 6 minutes), the dump (lib/dump.mjs) and the quest chapters.
// Writes <out>/00_census.json (counts), 00_recipe_cost_by_era.csv, 00_unused_items.csv, 00_lang_gaps.csv, 00_asset_gaps.csv,
// 00_quest_refs.csv, 00_duplicate_recipes.csv and 00_dropped_inputs.csv (default <out>: docs/reforge/data), and prints a summary.
// Counting rules: registered things take the era from the startup script folder; recipes take it from the server script folder that
// adds them (recipes no script adds are "base"); quests take it from the chapter file name (<era>_age, pl_<era>).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from './lib/kubejs_static.mjs';
import { loadDump } from './lib/dump.mjs';
import { auditTextures } from './assets-audit.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const dumpDir = arg('dump');
if (!dumpDir) { console.error('usage: node tools/analysis/census.mjs --dump <dump folder> [--errors <file>] [--out <folder>]'); process.exit(2); }
const outDir = arg('out', path.join(repo, 'docs', 'reforge', 'data'));
const errFile = arg('errors', null);
fs.mkdirSync(outDir, { recursive: true });

const ERAS = ['steam', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max', 'maxplus'];
const startupEra = (f) => (/startup_scripts[\\/]grindless[\\/]([^\\/]+)/.exec(String(f)) || [])[1]?.replace(/\.js$/, '') || 'other';
const serverEra = (f) => (/server_scripts[\\/]grindless[\\/]([^\\/]+)/.exec(String(f)) || [])[1]?.replace(/\.js$/, '') || 'other';
const eraRank = (e) => { const i = ERAS.indexOf(e); return i < 0 ? 99 : i; };
const csv = (name, header, rows) => fs.writeFileSync(path.join(outDir, name), [header.join(','), ...rows.map((r) => r.map((c) => /[",\n]/.test(String(c)) ? '"' + String(c).replace(/"/g, '""') + '"' : c).join(','))].join('\n') + '\n');
const bump = (o, k, f = 'n', by = 1) => { (o[k] = o[k] || {})[f] = (o[k][f] || 0) + by; };

const pack = path.join(repo, 'pack');
const run = runPackScripts(pack);
const reg = run.registry;
const dump = loadDump(dumpDir, { log: null });

const census = {};
const bumpE = (e, f, by) => bump(census, e, f, by);
for (const it of reg.items.values()) bumpE(startupEra(it.file), it.kind === 'block' || it.block ? 'blockItems' : 'items');
for (const f of reg.fluids.values()) bumpE(startupEra(f.file), 'fluids');
for (const m of reg.machines.values()) bumpE(startupEra(m.file), m.kind === 'multiblock' ? 'multiblocks' : 'otherMachines');

// recipes by era, with cost figures for the recipes our scripts add
const cost = {};
const recipeEra = new Map();
for (const r of dump.recipes.values()) {
  const file = run.recipeFiles && (run.recipeFiles.get ? run.recipeFiles.get(r.id) : run.recipeFiles[r.id]);
  const era = file ? serverEra(file) : r.added ? 'unmapped' : 'base';
  recipeEra.set(r.id, era);
  bumpE(era, 'recipes');
  const j = r.json || {};
  if (!r.added || !j.inputs) continue;
  const items = (j.inputs.item || []).filter((c) => (c.content || {}).type !== 'gtceu:circuit');
  const n = items.reduce((s, c) => s + ((c.content || {}).count || 1), 0);
  const mb = (j.inputs.fluid || []).reduce((s, c) => s + ((c.content || {}).amount || 0), 0);
  const eut = ((((j.tickInputs || {}).eu || [])[0] || {}).content) || 0;
  const c = (cost[era] = cost[era] || { n: 0, items: [], mb: [], dur: [], eut: [] });
  c.n++; c.items.push(n); c.mb.push(mb); c.dur.push(j.duration || 0); c.eut.push(eut);
}
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
csv('00_recipe_cost_by_era.csv', ['era', 'scriptedGtRecipes', 'medianItems', 'meanItems', 'medianFluidMb', 'meanFluidMb', 'medianDurationTicks', 'medianEut'],
  Object.entries(cost).sort((a, b) => eraRank(a[0]) - eraRank(b[0])).map(([e, c]) => [e, c.n, med(c.items), mean(c.items).toFixed(1), med(c.mb), mean(c.mb).toFixed(0), med(c.dur), med(c.eut)]));

// quests by chapter
const qdir = path.join(pack, 'config', 'ftbquests', 'quests', 'chapters');
const questItems = new Map();
const questEraItems = new Map();
for (const f of fs.readdirSync(qdir).filter((x) => x.endsWith('.snbt'))) {
  const txt = fs.readFileSync(path.join(qdir, f), 'utf8');
  const name = f.replace(/\.snbt$/, '');
  const era = (/^(?:pl_)?(\w+?)(?:_age)?$/.exec(name) || [])[1];
  const kind = name.startsWith('pl_') ? 'lineQuests' : name.endsWith('_age') ? 'ageQuests' : 'otherQuests';
  const count = (txt.match(/^\t\t\tid: "/gm) || []).length;
  bumpE(kind === 'otherQuests' ? 'other' : era, kind, count);
  for (const m of txt.matchAll(/\bitem: "([a-z0-9_.]+:[a-z0-9_./]+)"/g)) { const s = questItems.get(m[1]) || new Set(); s.add(name); questItems.set(m[1], s); }
  // optional tasks of a production line chapter follow the line, not the era: they do not count for the era check
  for (const line of txt.split('\n')) {
    if (name.startsWith('pl_') && /optional_task: true/.test(line)) continue;
    for (const m of line.matchAll(/\bitem: "([a-z0-9_.]+:[a-z0-9_./]+)"/g)) { const s = questEraItems.get(m[1]) || new Set(); s.add(name); questEraItems.set(m[1], s); }
  }
}

// raw usage of ids in recipe inputs, for the unused-item pass
const used = new Set();
const idRe = /[a-z0-9_.]+:[a-z0-9_/.]+/g;
for (const r of dump.recipes.values()) {
  const j = { ...(r.json || {}) };
  delete j.outputs; delete j.result; delete j.output;
  for (const m of JSON.stringify(j).matchAll(idRe)) used.add(m[0]);
}
const machineIds = new Set([...reg.machines.keys()]);
// uses the dump cannot see: ids placed by palettes and aliases in startup patterns, cells read from the formed tower, covers placed by
// a right-click, and tool items with a right-click handler
const walkJs = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walkJs(path.join(d, e.name)) : e.name.endsWith('.js') ? [path.join(d, e.name)] : [])) : []);
const codeLines = (f) => fs.readFileSync(f, 'utf8').split('\n').filter((l) => !/^\s*\/\//.test(l));
const scriptUsed = new Set();
const ID = '(grindless:[a-z0-9_]+)';
for (const f of walkJs(path.join(pack, 'kubejs', 'startup_scripts', 'grindless'))) {
  const text = codeLines(f).join('\n');
  for (const m of text.matchAll(new RegExp(`\\b[A-Z0-9]\\s*:\\s*'${ID}'`, 'g'))) scriptUsed.add(m[1]);
  for (const m of text.matchAll(/rings:\s*\[([^\]]*)\]/g)) for (const x of m[1].matchAll(new RegExp(`'${ID}'`, 'g'))) scriptUsed.add(x[1]);
  for (const m of text.matchAll(new RegExp(`(?:const|let|var)\\s+(\\w+)\\s*=\\s*'${ID}'`, 'g'))) {
    const uses = text.split('\n').filter((l) => new RegExp(`\\b${m[1]}\\b`).test(l) && !/\bcreate\(/.test(l) && !new RegExp(`(?:const|let|var)\\s+${m[1]}\\b`).test(l));
    if (uses.length) scriptUsed.add(m[2]);
  }
}
for (const f of walkJs(path.join(pack, 'kubejs', 'server_scripts', 'grindless'))) {
  const text = codeLines(f).join('\n');
  if (!/(?:ItemEvents|BlockEvents)\.\w*[rR]ightClicked/.test(text)) continue;
  for (const m of text.matchAll(new RegExp(`'${ID}'`, 'g'))) scriptUsed.add(m[1]);
}
const wireless = JSON.parse(fs.readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', 'wireless_energy.json'), 'utf8'));
// MAX+ cells stay listed until the MAX+ packages land (docs/reforge/08_cleanup.md U9)
for (const r of wireless.tiers || []) if (r.cell && !/^grindless:horizon_/.test(r.cell)) scriptUsed.add(r.cell);
const wirelessCover = (id) => /_wireless_(energy|dynamo)_cover$/.test(id) && reg.machines.has('gtceu:wireless_energy_tower');
// inert byproducts with no use by design: the tooltip tells the player to void them (AGENTS.md principle 3; docs/reforge/08_cleanup.md U6)
const voidedByproducts = new Set(['grindless:alkali_sulfate_dust']);
const structuresText = JSON.stringify(dump.structures || {});
const unused = [];
for (const it of reg.items.values()) {
  if (!it.id.startsWith('grindless:')) continue;
  if (used.has(it.id) || questItems.has(it.id) || machineIds.has(it.id) || scriptUsed.has(it.id) || voidedByproducts.has(it.id) || wirelessCover(it.id) || structuresText.includes('"' + it.id + '"')) continue;
  unused.push([it.id, startupEra(it.file), it.file]);
}
unused.sort((a, b) => eraRank(a[1]) - eraRank(b[1]) || (a[0] < b[0] ? -1 : 1));
csv('00_unused_items.csv', ['id', 'era', 'file'], unused);

// lang gaps: our items and blocks with no en_us name
const lang = run.lang instanceof Map ? Object.fromEntries(run.lang) : (run.lang || {});
const en = new Set(Object.keys(lang.en_us || {}));
const langGaps = [];
const nameKey = (ns, id, kind) => `${kind}.${ns}.${id}`;
for (const it of reg.items.values()) {
  const [ns, id] = it.id.split(':');
  if (ns !== 'grindless') continue;
  const k = nameKey(ns, id, it.kind === 'block' || it.block ? 'block' : 'item');
  if (!en.has(k) && !en.has(nameKey(ns, id, 'item')) && !en.has(nameKey(ns, id, 'block'))) langGaps.push([it.id, 'no name in en_us']);
}
csv('00_lang_gaps.csv', ['key', 'problem'], langGaps);

// textures and sounds
// the assets audit is the authority for textures: layered and custom-model items resolve there
const assetGaps = [];
for (const r of auditTextures({ root: repo }).rows) {
  if (r.categories.includes('missing') && r.owner.startsWith('grindless:')) assetGaps.push([r.owner, r.era, `no texture file: ${r.path}`]);
}
const sounds = (() => { try { return new Set(fs.readdirSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'sounds')).map((x) => x.replace(/\.ogg$/, ''))); } catch { return new Set(); } })();
for (const m of reg.machines.values()) if (m.kind === 'multiblock' && !sounds.has('loop_' + m.id.split(':')[1])) assetGaps.push([m.id, startupEra(m.file), 'no loop sound']);
csv('00_asset_gaps.csv', ['id', 'era', 'problem'], assetGaps);

// quest item references that do not resolve, or resolve to hidden or wrong-era content
const dumpItems = new Set(dump.items);
const itemEra = new Map(); for (const it of reg.items.values()) itemEra.set(it.id, startupEra(it.file));
for (const m of reg.machines.values()) itemEra.set(m.id, startupEra(m.file));
const refRows = [];
for (const [id, chapters] of questItems) {
  const problems = [];
  if (!dumpItems.has(id) && id !== 'minecraft:air') problems.push('not in dump');
  const qe = [...(questEraItems.get(id) || [])].map((c) => (/^(?:pl_)?(\w+?)(?:_age)?$/.exec(c) || [])[1]);
  const ie = itemEra.get(id);
  if (ie && ERAS.includes(ie)) for (const e of qe) if (ERAS.includes(e) && eraRank(ie) > eraRank(e)) problems.push(`item from ${ie} used in ${e} chapter`);
  if (problems.length) refRows.push([id, [...chapters].join(' '), problems.join('; ')]);
}
csv('00_quest_refs.csv', ['item', 'chapters', 'problem'], refRows);

// duplicate recipes: same type, inputs and outputs under different ids
const sig = new Map();
for (const r of dump.recipes.values()) {
  const j = r.json || {};
  if (!r.added) continue;
  const key = r.type + '|' + JSON.stringify(j.inputs || j.ingredients || j.key || null) + '|' + JSON.stringify(j.outputs || j.result || j.output || null);
  (sig.get(key) || sig.set(key, []).get(key)).push(r.id);
}
const dups = [...sig.values()].filter((v) => v.length > 1);
csv('00_duplicate_recipes.csv', ['recipeIds'], dups.map((v) => [v.join(' ')]));

// dropped ingredients ("Trying to add more inputs/outputs than RecipeType can support") from the server log
const dropped = [];
if (errFile && fs.existsSync(errFile)) {
  for (const line of fs.readFileSync(errFile, 'utf8').split(/\r?\n/)) {
    if (!/more (inputs|outputs).*than RecipeType can support/i.test(line)) continue;
    const m = /([a-z_]+:[a-z0-9_\/.]+).*?(item|fluid)(Inputs|Outputs).*?(\d+)/i.exec(line) || [];
    dropped.push([line.replace(/^.*?\]\s*/, '').slice(0, 220), m[1] || '', recipeEra.get(m[1]) || '']);
  }
  csv('00_dropped_inputs.csv', ['message', 'recipe', 'era'], dropped);
}

const summary = { eras: [...ERAS.filter((e) => census[e]), ...Object.keys(census).filter((e) => !ERAS.includes(e)).sort()].map((e) => ({ era: e, ...census[e] })), totals: { unusedItems: unused.length, langGaps: langGaps.length, assetGaps: assetGaps.length, questRefProblems: refRows.length, duplicateRecipeGroups: dups.length, droppedInputWarnings: dropped.length } };
fs.writeFileSync(path.join(outDir, '00_census.json'), JSON.stringify(summary, null, 1) + '\n');
console.log(JSON.stringify(summary.totals));
const byEra = (rows, i) => rows.reduce((o, r) => { o[r[i]] = (o[r[i]] || 0) + 1; return o; }, {});
console.log('class table: unused by era ' + JSON.stringify(byEra(unused, 1)) + '; texture gaps ' + assetGaps.filter((r) => r[2] !== 'no loop sound').length + '; sound gaps ' + assetGaps.filter((r) => r[2] === 'no loop sound').length + '; quest refs ' + JSON.stringify(byEra(refRows, 2)));
for (const e of summary.eras) console.log(JSON.stringify(e));
