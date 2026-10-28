#!/usr/bin/env node
// Generates the Multiblocks chapter (pack/config/ftbquests/quests/chapters/multiblocks.snbt): one quest per craftable multiblock
// controller, in one band per voltage tier (docs/quests.md, section 19).
//
//   node tools/quests/multiblocks/gen.mjs --dump <kubejs-exported or dump dir> [--write] [--list]
//
// Without --write: prints the band counts, the exclusions, the folder-vs-reachability mismatches and a diff against the file on disk.
// With --write: writes the chapter and its exceptions in tools/quests/lint-config.json (allowRoots, allowIsolated: it is a map,
// nothing depends on anything). Run it after processing-lines/pl-gen.mjs, which rewrites the allowIsolated block.
//
// Which controllers: machines.json entries with mb = 1 whose item exists, minus every id hidden by tables/hidden_until.json.
// Where: ours (startup_scripts/grindless/<folder>/*.js, event.create(name, 'multiblock')) by folder when it is an era id; everyone else,
// and ours in other folders, by the earliest tier whose gate reaches the controller (tools/analysis/reachability.mjs's model).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CHAPTER, GATE_TIERS, ERA_FOLDERS, TIERS, OVERRIDES } from './mb-data.mjs';
import { layoutBands, chapterSnbt, tierName, hid } from './mb-lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, '..', '..', '..');
const CHAPTER_FILE = path.join(REPO, 'pack', 'config', 'ftbquests', 'quests', 'chapters', CHAPTER.file + '.snbt');
const LINT_CONFIG = path.join(REPO, 'tools', 'quests', 'lint-config.json');
const STARTUP = path.join(REPO, 'pack', 'kubejs', 'startup_scripts', 'grindless');
const HIDDEN = path.join(REPO, 'pack', 'kubejs', 'data', 'grindless', 'tables', 'hidden_until.json');

// ---------------------------------------------------------------- inputs
export function titleOf(id) {
  return id.split(':')[1].split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function findDump(dir) {
  for (const d of [dir, path.join(dir, 'dump'), path.join(dir, 'kubejs-exported')]) {
    if (fs.existsSync(path.join(d, 'machines.json'))) return d;
  }
  throw new Error(`machines.json not found in ${dir} (pass a gg_dump folder)`);
}

// our multiblocks: machine id -> startup folder.
// 1) literal event.create('name', 'multiblock'); 2) controllers registered through variables: for each script mentioning 'multiblock', every
// dump multiblock gtceu:x whose name is a quoted token in the script (or in a data/grindless/tables/*.json the script names) AND that has a
// block.gtceu.x name in client_scripts/grindless/*_lang.js (a GTM/addon id quoted in our script has none). Literal wins; conflicts are returned.
export function oursFromScripts(root = STARTUP, candidates = [], langText = '', tablesDir = path.join(REPO, 'pack', 'kubejs', 'data', 'grindless', 'tables'), conflicts = []) {
  const out = new Map();
  const langOf = (f) => (langText instanceof Map ? langText.get(f) || '' : '');
  const langAll = langText instanceof Map ? [...langText.values()].join('\n') : langText;
  const literal = new Set();
  const loose = new Map(); // id -> [{ folder, hasCreate }]
  const tables = fs.existsSync(tablesDir) ? fs.readdirSync(tablesDir).filter((f) => f.endsWith('.json')) : [];
  const walk = (dir, folder) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, folder || e.name);
      else if (e.name.endsWith('.js') && folder) {
        const text = fs.readFileSync(p, 'utf8');
        for (const m of text.matchAll(/\.create\(\s*['"]([a-z0-9_]+)['"]\s*,\s*['"]multiblock['"]/g)) {
          out.set('gtceu:' + m[1], folder);
          literal.add('gtceu:' + m[1]);
        }
        if (!/['"]multiblock['"]/.test(text)) continue;
        let hay = text;
        for (const t of tables) if (text.includes(t) || text.includes(t.replace(/\.json$/, ''))) hay += '\n' + fs.readFileSync(path.join(tablesDir, t), 'utf8');
        const hasCreate = /\.create\(/.test(text);
        for (const id of candidates) {
          const n = id.split(':')[1];
          if (id.startsWith('gtceu:') && new RegExp(`['"]${n}['"]`).test(hay) && langAll.includes(`block.gtceu.${n}'`)) {
            if (!loose.has(id)) loose.set(id, []);
            loose.get(id).push({ folder, hasCreate });
          }
        }
      }
    }
  };
  walk(root, '');
  for (const [id, hits] of loose) {
    if (literal.has(id)) continue;
    const folders = [...new Set(hits.map((h) => h.folder))];
    const named = folders.filter((f) => langOf(f).includes(`block.gtceu.${id.split(':')[1]}'`));
    const pool = named.length ? hits.filter((h) => named.includes(h.folder)) : hits;
    const poolFolders = [...new Set(pool.map((h) => h.folder))];
    const pick = poolFolders.length === 1 ? poolFolders[0] : (pool.find((h) => h.hasCreate) || pool[0]).folder;
    if (poolFolders.length > 1) conflicts.push({ id, folders: poolFolders, chosen: pick });
    out.set(id, pick);
  }
  return out;
}

// ids hidden by hidden_until.json at the dump's implemented era (hidden.js: until above it, or "never"; keepRecipes groups too)
export function hiddenIds(table, implemented) {
  const eras = table.eras || TIERS;
  const cut = eras.indexOf(implemented);
  const ids = new Set();
  for (const g of table.groups) {
    const idx = eras.indexOf(g.until);
    if (g.until === 'never' || g.keepRecipes || idx < 0 || idx > cut) for (const i of g.items || []) ids.add(i);
  }
  return ids;
}

// earliest gate tier that reaches each id: Map id -> tier (absent: none of GATE_TIERS)
async function reachTiers(dumpDir, ids) {
  const lib = (p) => import(pathToFileURL(path.join(REPO, 'tools', 'analysis', 'lib', p)).href);
  const { loadTierConfig } = await lib('config.mjs');
  const { loadDump } = await lib('dump.mjs');
  const { buildModel } = await lib('model.mjs');
  const { runPasses } = await lib('analyze.mjs');
  const log = console.log;
  console.log = () => {};
  const out = new Map();
  try {
    const dump = loadDump(dumpDir);
    for (const tier of GATE_TIERS) {
      const { raw } = loadTierConfig({ tier }, path.join(REPO, 'tools', 'analysis', 'tiers'));
      const model = buildModel(dump, raw);
      const res = runPasses(model);
      for (const id of ids) {
        if (out.has(id) || !model.g.has(id)) continue;
        if (res.gate.reached[model.g.key(id)]) out.set(id, tier);
      }
    }
  } finally {
    console.log = log;
  }
  return out;
}

// nominal tier of one recipe json: the machine hull input, else the highest circuit tag tier, else null
export function recipeNominal(j) {
  const { result, outputs, ...inputs } = j;
  const s = JSON.stringify(inputs);
  const hull = [...s.matchAll(/gtceu:([a-z]+)_machine_hull/g)].map((m) => m[1]).filter((t) => TIERS.includes(t));
  if (hull.length) return hull.reduce((a, b) => (TIERS.indexOf(b) < TIERS.indexOf(a) ? b : a));
  const circ = [...s.matchAll(/(?:forge|gtceu):circuits\/([a-z]+)/g)].map((m) => m[1]).filter((t) => TIERS.includes(t));
  if (circ.length) return circ.reduce((a, b) => (TIERS.indexOf(b) > TIERS.indexOf(a) ? b : a));
  return null;
}

// Map id -> nominal tier: the minimum over every recipe that outputs the controller
export function nominalTiers(recipes, ids) {
  const idSet = new Set(ids);
  const out = new Map();
  const outputsOf = (j) => {
    const found = new Set();
    for (const m of JSON.stringify({ r: j.result, o: j.outputs }).matchAll(/"(?:item|id)":"([a-z0-9_.-]+:[a-z0-9_/.-]+)"/g)) if (idSet.has(m[1])) found.add(m[1]);
    return found;
  };
  for (const raw of recipes) {
    const r = typeof raw === 'string' ? raw : JSON.stringify(raw);
    if (!/machine_hull|circuits\//.test(r) || ![...idSet].some((id) => r.includes(id))) continue;
    const j = (typeof raw === 'string' ? JSON.parse(raw) : raw).j;
    if (!j) continue;
    const outs = outputsOf(j);
    if (!outs.size) continue;
    const nom = recipeNominal(j);
    if (!nom) continue;
    for (const id of outs) {
      const cur = out.get(id);
      if (!cur || TIERS.indexOf(nom) < TIERS.indexOf(cur)) out.set(id, nom);
    }
  }
  return out;
}

// ---------------------------------------------------------------- the decision, pure so the test can feed it
export function classify({ machines, items, hidden, ours, reach, nominal = new Map() }) {
  const controllers = [];
  const excluded = [];
  const mismatches = [];
  const shifted = [];
  for (const m of machines) {
    if (m.mb !== 1) continue;
    const id = m.id;
    if (hidden.has(id)) { excluded.push({ id, why: 'hidden by hidden_until.json' }); continue; }
    if (items && !items.has(id)) { excluded.push({ id, why: 'no controller item in the dump' }); continue; }
    const folder = ours.get(id);
    const reached = reach.get(id) || null;
    let tier;
    if (OVERRIDES[id]) tier = OVERRIDES[id].tier;
    else if (folder && ERA_FOLDERS.has(folder)) {
      tier = folder;
      if (reached !== folder) mismatches.push({ id, folder, reached });
    } else if (reached) {
      const nom = nominal.get(id);
      tier = nom && TIERS.indexOf(nom) > TIERS.indexOf(reached) ? nom : reached;
      if (nom && nom !== reached) shifted.push({ id, reach: reached, nominal: nom, chosen: tier });
    }
    else { excluded.push({ id, why: folder ? `ours in "${folder}": not an era folder and no gate reaches it` : 'no gate up to uhv reaches it' }); continue; }
    controllers.push({ id, name: titleOf(id), tier, ours: !!folder });
  }
  return { controllers, excluded, mismatches, shifted };
}

// ---------------------------------------------------------------- lint-config.json: the chapter is a map, so every quest is a root and alone
const WHY = 'Multiblocks: a map of controllers by tier, no dependencies on purpose; nothing in the book depends on it (docs/quests.md, section 19).';

export function upsertEntry(text, section, key, ids, why, before) {
  const crlf = text.includes('\r\n');
  let t = text.replace(/\r\n/g, '\n');
  const line = (k, v) => `    "${k}": ${v}`;
  const entries = [line('_why_' + key, JSON.stringify(why)), line(key, JSON.stringify(ids))];
  const re = new RegExp(`"${section}": \\{[\\s\\S]*?\\n  \\}`);
  if (re.test(t)) {
    const body = re.exec(t)[0];
    const kept = body.split('\n').slice(1, -1).filter((l) => !l.startsWith(`    "${key}"`) && !l.startsWith(`    "_why_${key}"`)).map((l) => l.replace(/,$/, ''));
    t = t.replace(re, `"${section}": {\n` + kept.concat(entries).join(',\n') + '\n  }');
  } else {
    const block = `"${section}": {\n` + entries.join(',\n') + '\n  }';
    t = t.replace(new RegExp(`\\n  "${before}": `), `\n  ${block},\n  "${before}": `);
    if (!t.includes(block)) throw new Error(`could not add ${section} to lint-config.json`);
  }
  JSON.parse(t);
  return crlf ? t.replace(/\n/g, '\r\n') : t;
}

// ---------------------------------------------------------------- CLI
async function main() {
  const args = process.argv.slice(2);
  const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
  if (!opt('--dump')) {
    console.error('Usage: node tools/quests/multiblocks/gen.mjs --dump <gg_dump folder> [--write]');
    process.exit(2);
  }
  const dumpDir = findDump(path.resolve(opt('--dump')));
  const read = (f) => JSON.parse(fs.readFileSync(path.join(dumpDir, f), 'utf8'));
  const machines = read('machines.json').machines.slice().sort((a, b) => a.id.localeCompare(b.id));
  const items = new Set(read('items.json').items);
  let implemented = 'uhv';
  if (fs.existsSync(path.join(dumpDir, 'info.json'))) {
    const info = read('info.json');
    implemented = (info.hidden && info.hidden.implementedEra) || implemented;
  }
  const hidden = hiddenIds(JSON.parse(fs.readFileSync(HIDDEN, 'utf8')), implemented);
  const langDir = path.join(REPO, 'pack', 'kubejs', 'client_scripts', 'grindless');
  const langByFolder = new Map();
  for (const f of fs.readdirSync(langDir).filter((x) => x.endsWith('_lang.js'))) {
    const folder = f.split('_')[0];
    langByFolder.set(folder, (langByFolder.get(folder) || '') + '\n' + fs.readFileSync(path.join(langDir, f), 'utf8'));
  }
  const conflicts = [];
  const ours = oursFromScripts(STARTUP, machines.filter((m) => m.mb === 1).map((m) => m.id), langByFolder, undefined, conflicts);
  for (const c of conflicts) console.log(`ownership conflict: ${c.id} in ${c.folders.join(', ')} -> ${c.chosen}`);
  const candidates = machines.filter((m) => m.mb === 1 && !hidden.has(m.id) && items.has(m.id)).map((m) => m.id);
  const reach = await reachTiers(dumpDir, candidates);
  const nominal = nominalTiers(read('recipes.json').recipes, candidates);
  const { controllers, excluded, mismatches, shifted } = classify({ machines, items, hidden, ours, reach, nominal });
  const bands = layoutBands(controllers);
  const out = chapterSnbt(bands);

  console.log(`dump ${dumpDir} (implemented era ${implemented}); ${machines.filter((m) => m.mb === 1).length} multiblock machines, ${controllers.length} quests`);
  for (const b of bands) console.log(`  ${tierName(b.tier).padEnd(6)} ${String(b.cells.length).padStart(3)} (ours ${b.cells.filter((c) => c.ours).length})`);
  console.log(`excluded ${excluded.length}:`);
  for (const e of excluded) console.log(`  ${e.id}: ${e.why}`);
  const missingOurs = [...ours.keys()].filter((id) => !machines.some((m) => m.id === id && m.mb === 1));
  if (missingOurs.length) console.log(`ours registered but not a multiblock in the dump: ${missingOurs.join(', ')}`);
  console.log(`folder vs reachability (folder wins), ${mismatches.length}:`);
  for (const m of mismatches) console.log(`  ${m.id}: folder ${m.folder}, gate ${m.reached || 'none'}`);
  const manual = Object.keys(OVERRIDES);
  if (manual.length) console.log(`overrides: ${manual.map((id) => `${id} -> ${OVERRIDES[id].tier} (${OVERRIDES[id].why})`).join('; ')}`);

  const prev = fs.existsSync(CHAPTER_FILE) ? fs.readFileSync(CHAPTER_FILE, 'utf8') : '';
  const idsOf = (s) => new Set([...s.matchAll(/\n\t\t\tid: "([0-9A-F]{16})"/g)].map((m) => m[1]));
  const a = idsOf(prev), b = idsOf(out);
  console.log(`diff vs ${path.relative(REPO, CHAPTER_FILE)}: ${prev === out ? 'identical' : `+${[...b].filter((x) => !a.has(x)).length} -${[...a].filter((x) => !b.has(x)).length} quests, bytes differ`}`);
  if (args.includes('--list')) {
    console.log(`non-ours nominal != reach, ${shifted.length}:`);
    for (const s of shifted) console.log(`  ${s.id}: reach ${s.reach}, nominal ${s.nominal}, chosen ${s.chosen}`);
  }
  if (args.includes('--list')) for (const b2 of bands) console.log(tierName(b2.tier) + ': ' + b2.cells.map((c) => c.id.split(':')[1] + (c.ours ? '*' : '')).join(' '));

  if (args.includes('--write')) {
    fs.writeFileSync(CHAPTER_FILE, out);
    const ids = bands.flatMap((b2) => [hid('multiblocks:label:' + b2.tier), ...b2.cells.map((c) => hid('multiblocks:' + c.id))]);
    // the first quest is the chapter's start (autofocus); the others are allowed
    const sorted = ids.slice().sort();
    let cfg = fs.readFileSync(LINT_CONFIG, 'utf8');
    cfg = upsertEntry(cfg, 'allowRoots', CHAPTER.file, sorted, WHY, 'allowLongEdges');
    cfg = upsertEntry(cfg, 'allowIsolated', CHAPTER.file, sorted, WHY, 'allowLongEdges');
    fs.writeFileSync(LINT_CONFIG, cfg);
    console.log('wrote ' + path.relative(REPO, CHAPTER_FILE) + ' and its lint exceptions');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
}
