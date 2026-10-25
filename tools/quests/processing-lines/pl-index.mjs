// Recipe index over a gg_dump (kubejs-exported), built with the repository's own loaders (tools/analysis/lib), for the
// processing-lines checker and for looking things up while writing the data.
//
//   node tools/quests/processing-lines/pl-index.mjs --dump <kubejs-exported> <command> [; <command>...]
//     q <key> [<key>...]        producers and consumers of an item, or of fluid:<id>
//     p <key> [<type>]          producers only (optionally of one recipe type); c <key> [<type>]: consumers only
//     r <recipe id>             one recipe, normalized
//     t <recipe type> [<text>]  recipes of a type (id contains text)
//     s <text>                  item and fluid ids containing text
//
// Keys: item ids as they are ("gtceu:sulfur_dust") and "fluid:<id>" for fluids ("fluid:gtceu:sulfuric_acid").
// PL_LIMIT (default 40) caps the lines per list.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDump } from '../../analysis/lib/dump.mjs';
import { normalizeRecipe } from '../../analysis/lib/normalize.mjs';
import { prepareConfig } from '../../analysis/lib/model.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
// the checkout this folder lives in (tools/quests/processing-lines)
export const REPO = path.resolve(here, '..', '..', '..');

export async function loadIndex({ dump, quiet = true } = {}) {
  if (!dump) throw new Error('no dump: pass --dump <the kubejs-exported folder of a gg_dump run>');
  const tierCfg = JSON.parse(fs.readFileSync(path.join(REPO, 'tools', 'analysis', 'tiers', 'steam.json'), 'utf8'));
  const cfg = prepareConfig({ typeAliases: tierCfg.typeAliases, toolTags: tierCfg.toolTags, ignoreTypes: tierCfg.ignoreTypes });
  const d = loadDump(dump, { log: quiet ? null : undefined });
  const st = { unresolved: new Set() };
  const nctx = { tags: d.tags, st, cfg, gtTypes: new Set(d.recipeTypes.keys()) };
  const recipes = new Map();
  const producers = new Map();
  const consumers = new Map();
  const push = (m, k, r) => { if (!m.has(k)) m.set(k, []); m.get(k).push(r); };
  for (const rec of d.recipes.values()) {
    if (cfg.ignoreMatch(rec.type)) continue;
    // recipes the bench's test overlay adds (gg_test:...) are not part of the pack
    if (String(rec.id).startsWith('gg_test:')) continue;
    const n = normalizeRecipe(rec, nctx);
    recipes.set(n.id, n);
    const ins = new Set();
    for (const i of n.inputs) for (const a of i.alts) ins.add(a);
    for (const k of ins) push(consumers, k, n);
    const outs = new Set(n.outputs.map((o) => o.key));
    for (const k of outs) push(producers, k, n);
  }
  return { dump: d, recipes, producers, consumers, items: d.items, fluids: d.fluids, tags: d.tags, machines: d.machines, recipeTypes: d.recipeTypes };
}

export function inputKeys(n) {
  const s = new Set();
  for (const i of n.inputs) for (const a of i.alts) s.add(a);
  return s;
}

export function outputKeys(n) {
  return new Set(n.outputs.map((o) => o.key));
}

const short = (k) => k.replace(/^fluid:/, '~').replace(/^gtceu:/, '').replace(/^minecraft:/, 'mc:');

export function describe(n) {
  const ins = n.inputs.map((i) => {
    const what = i.alts.length === 0 ? i.label : i.alts.length === 1 ? short(i.alts[0]) : (i.tags && i.tags.length ? '#' + i.tags.join('|#') : short(i.alts[0]) + `(+${i.alts.length - 1})`);
    const amt = i.count && i.count !== 1 ? i.count + 'x' : '';
    return amt + what + (i.cap ? '[nc]' : '');
  });
  const outs = n.outputs.map((o) => (o.count && o.count !== 1 ? o.count + 'x' : '') + short(o.key) + (o.chance < 1 ? `@${Math.round(o.chance * 1000) / 10}%` : ''));
  const cond = (n.conditions || []).map((c) => c.type + (c.dimension ? '=' + c.dimension : '') + (c.temperature ? '=' + c.temperature : '')).filter(Boolean);
  return `${n.type} ${n.id}: ${ins.join(' + ')} -> ${outs.join(' + ')}${n.eut ? `  [${n.eut} EU/t]` : ''}${cond.length ? '  {' + cond.join(', ') + '}' : ''}`;
}

async function main(argv) {
  const opt = { dump: null };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dump') opt.dump = argv[++i];
    else rest.push(argv[i]);
  }
  const idx = await loadIndex(opt);
  // several commands in one load: "q a b ; t type filter ; s text"
  const cmds = rest.join(' ').split(';').map((s) => s.trim().split(/\s+/).filter(Boolean)).filter((c) => c.length);
  for (const c of cmds) run(idx, c[0], c.slice(1));
}

function run(idx, cmd, args) {
  const limit = Number(process.env.PL_LIMIT || 40);
  if (cmd === 'q') {
    for (const k of args) {
      const p = idx.producers.get(k) || [];
      const c = idx.consumers.get(k) || [];
      console.log(`== ${k}  (${idx.items.has(k) ? 'item' : idx.fluids.has(k.replace(/^fluid:/, '')) ? 'fluid' : 'NOT REGISTERED'}): ${p.length} producers, ${c.length} consumers`);
      p.filter((n) => n.category !== 'gtceu:macerator_recycling' && n.category !== 'gtceu:arc_furnace_recycling').slice(0, limit).forEach((n) => console.log('  + ' + describe(n)));
      if (p.length > limit) console.log(`  + ... ${p.length - limit} more`);
      c.slice(0, limit).forEach((n) => console.log('  - ' + describe(n)));
      if (c.length > limit) console.log(`  - ... ${c.length - limit} more`);
    }
  } else if (cmd === 'r') {
    for (const id of args) { const n = idx.recipes.get(id); console.log(n ? describe(n) : 'no recipe ' + id); }
  } else if (cmd === 't') {
    const [type, filter] = args;
    let k = 0;
    for (const n of idx.recipes.values()) if (n.type === type && (!filter || n.id.includes(filter))) { if (k++ < 200) console.log(describe(n)); }
    console.log(`== ${type} ${filter || ''}: ${k} recipes`);
  } else if (cmd === 'p' || cmd === 'c') {
    // p <key> [type]: producers only; c <key> [type]: consumers only (optionally of one type)
    const [k, type] = args;
    const list = ((cmd === 'p' ? idx.producers : idx.consumers).get(k) || []).filter((n) => !type || n.type === type)
      .filter((n) => n.category !== 'gtceu:macerator_recycling' && n.category !== 'gtceu:arc_furnace_recycling');
    console.log(`== ${cmd === 'p' ? 'producers' : 'consumers'} of ${k}${type ? ' (' + type + ')' : ''}: ${list.length}`);
    list.slice(0, limit).forEach((n) => console.log('  ' + describe(n)));
  } else if (cmd === 's') {
    const t = args[0];
    const hits = [...idx.items].filter((i) => i.includes(t)).slice(0, 80);
    const fl = [...idx.fluids].filter((i) => i.includes(t)).slice(0, 40).map((f) => 'fluid:' + f);
    console.log([...hits, ...fl].join('\n'));
  } else {
    console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(0, 13).join('\n'));
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main(process.argv.slice(2));
