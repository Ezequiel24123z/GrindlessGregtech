#!/usr/bin/env node
// Cost matrix: the cumulative base cost of key items per era, from the bench's recipe dump (not from the JS).
//
//   node tools/analysis/cost-matrix.mjs --dump <dump dir> --out <dir> [--compare <old.csv>] [--config <file>]
//
//   --dump     a gg_dump folder (recipes.json, items.json, tags.json, ...). Read only; no Minecraft run.
//   --out      writes 01_cost_matrix.csv (one row per key item) and 01_cost_matrix.md. The markdown keeps whatever is
//              outside the <!-- cost-matrix:begin/end --> markers (the hand-written "Proposed curve"), so a re-run only
//              refreshes the generated tables.
//   --compare  an older 01_cost_matrix.csv: prints, for every group and era, the new/old cost ratio and the 10 items that
//              moved most. Phase 2 uses it to report before/after numbers of a curve applied from data and tables.
//   --config   default tools/analysis/cost_matrix.json: key items, base resources, recipe exclusions, outlier bands.
//   --why      an item id (comma list): prints the items nothing can make that block it (debug aid for unreachable key items; writes nothing).
//   --trace    an item id (comma list): prints the cheapest recipe chain with per-unit costs, 5 levels deep (debug aid; writes nothing).
//
// How a cost is built: every recipe of the dump is normalized with the obtainability tier (tools/analysis/tiers), then
// lib/cost.mjs picks, for every item and fluid, the cheapest recipe chain down to base resources (vein-drill outputs, natural
// fluids, free world blocks, source recipes such as gas collectors) and expands it into a vector of base amounts. Settings
// that change numbers (allocation of multi-output recipes, chances, catalysts, cycles, free resources, excluded recipes)
// are in cost_matrix.json and printed in the document. Deterministic: the same dump and config give the same files.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDump } from './lib/dump.mjs';
import { loadTierConfig } from './lib/config.mjs';
import { prepareConfig } from './lib/model.mjs';
import { normalizeRecipe } from './lib/normalize.mjs';
import { solveCosts, summarize, globMatcher, EU_KEY } from './lib/cost.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const BEGIN = '<!-- cost-matrix:begin -->';
const END = '<!-- cost-matrix:end -->';

function parseArgs(argv) {
  const a = { config: path.join(here, 'cost_matrix.json') };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (['--dump', '--out', '--compare', '--config', '--why', '--trace'].includes(k)) a[k.slice(2)] = argv[++i];
    else throw new Error(`unknown argument ${k}`);
  }
  if (!a.dump || !a.out) throw new Error('usage: node tools/analysis/cost-matrix.mjs --dump <dir> --out <dir> [--compare <old.csv>] [--config <file>]');
  return a;
}

const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

function fmt(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '-';
  if (n >= 1000) return Math.round(n).toLocaleString('en-US');
  if (n >= 100) return n.toFixed(0);
  if (n >= 10) return n.toFixed(1);
  return n.toFixed(2);
}
const num = (n) => (Number.isFinite(n) ? String(Math.round(n * 1e4) / 1e4) : '');

function normalizeAll(dump, excl) {
  const { raw } = loadTierConfig({ tier: 'obtain' }, path.join(here, 'tiers'));
  const cfg = prepareConfig(raw);
  const ctx = { tags: dump.tags, st: { unresolved: new Set() }, cfg, gtTypes: new Set(dump.recipeTypes.keys()) };
  const types = new Set(excl.types || []);
  const cats = globMatcher(excl.categories);
  const ids = globMatcher(excl.ids);
  const recipes = [];
  const drill = [];
  for (const rec of dump.recipes.values()) {
    const al = cfg.typeAliases[rec.type] || rec.type;
    if (cfg.ignoreMatch(rec.type) || cfg.ignoreMatch(al)) continue;
    const n = normalizeRecipe(rec, ctx);
    n.duration = (rec.json && rec.json.duration) || 0;
    if (types.has(rec.type) || types.has(al)) { drill.push(n); continue; }
    if (n.category && cats(n.category)) continue;
    if (ids(rec.id)) continue;
    recipes.push(n);
  }
  return { recipes, drill };
}

function resolveKeys(cfg, dump, model) {
  const rows = [];
  const missing = [];
  const tiers = cfg.tiers;
  const exists = (k) => dump.items.has(k);
  const expand = (s, t) => s.replaceAll('${t}', t);
  const add = (era, group, candidates) => {
    const present = candidates.filter(exists);
    if (!present.length) { missing.push(`${era}/${group}: ${candidates[0]}`); return; }
    const pick = present.find((k) => model.reachable(k)) || present[0];
    rows.push({ era, group, item: pick, alt: present.length > 1 && pick !== present[0] ? present[0] : '' });
  };
  for (const t of tiers) {
    for (const [g, cand] of Object.entries(cfg.groups)) if (g !== 'note') add(t, g, cand.map((c) => expand(c, t)));
    const mat = cfg.superconductorWire[t];
    if (mat) add(t, 'superconductor_wire', [`gtceu:${mat}_single_wire`]);
    const circuits = dump.tags.items(cfg.circuits.tagPrefix + t) || [];
    for (const c of [...circuits].sort()) add(t, 'circuit', [c]);
    if (cfg.capstones[t]) add(t, 'capstone', [`gtceu:${cfg.capstones[t]}`]);
    for (const c of cfg.controllers[t] || []) add(t, 'controller', [`gtceu:${c}`]);
  }
  const have = new Set(rows.map((r) => r.item));
  const lv = [...dump.items].filter((k) => k.startsWith('gtceu:lv_') && !have.has(k)).sort();
  for (const k of lv) rows.push({ era: 'lv', group: 'lv_item', item: k, alt: '' });
  return { rows, missing };
}

function costRow(r, model, summ) {
  const vec = model.vector(r.item);
  if (!vec) return { ...r, status: 'unreachable' };
  return { ...r, status: model.cuts.has(r.item) ? 'cut' : 'ok', ...summ(vec) };
}

function seriesOf(rows, tiers) {
  const by = new Map();
  const put = (name, era, v) => {
    if (!by.has(name)) by.set(name, new Map());
    const m = by.get(name);
    if (!m.has(era)) m.set(era, []);
    m.get(era).push(v);
  };
  for (const r of rows) {
    if (r.status === 'unreachable' || !tiers.includes(r.era)) continue;
    if (r.group === 'controller') put('controller (median)', r.era, r.score);
    else if (r.group === 'circuit') { put('circuit (cheapest)', r.era, r.score); put('circuit (median)', r.era, r.score); }
    else if (r.group === 'lv_item') continue;
    else put(r.group, r.era, r.score);
  }
  const out = new Map();
  for (const [name, m] of by) {
    const e = new Map();
    for (const [era, xs] of m) e.set(era, name === 'circuit (cheapest)' ? Math.min(...xs) : median(xs));
    out.set(name, e);
  }
  return out;
}

function compareReport(oldCsv, rows) {
  const lines = fs.readFileSync(oldCsv, 'utf8').trim().split(/\r?\n/);
  const head = lines[0].split(',');
  const col = (n) => head.indexOf(n);
  const old = new Map();
  for (const l of lines.slice(1)) {
    const f = l.split(',');
    old.set(f[col('item')], { era: f[col('era')], group: f[col('group')], score: Number(f[col('score')]) });
  }
  const moves = [];
  const byGroup = new Map();
  for (const r of rows) {
    const o = old.get(r.item);
    if (!o || !(o.score > 0) || r.status === 'unreachable') continue;
    const ratio = r.score / o.score;
    moves.push({ item: r.item, era: r.era, ratio, before: o.score, after: r.score });
    const k = `${r.era}|${r.group}`;
    if (!byGroup.has(k)) byGroup.set(k, []);
    byGroup.get(k).push(ratio);
  }
  const out = ['era  group                    n   median new/old'];
  for (const [k, xs] of [...byGroup].sort()) out.push(`${k.replace('|', '  ').padEnd(30)} ${String(xs.length).padStart(3)}  ${median(xs).toFixed(3)}`);
  moves.sort((a, b) => Math.abs(Math.log(b.ratio)) - Math.abs(Math.log(a.ratio)) || (a.item < b.item ? -1 : 1));
  out.push('', 'largest moves:');
  for (const m of moves.slice(0, 10)) out.push(`  ${m.item}  x${m.ratio.toFixed(3)}  (${fmt(m.before)} -> ${fmt(m.after)})`);
  return out.join('\n');
}

function whyUnreachable(key, recipes, model) {
  const producers = new Map();
  for (const r of recipes) for (const o of r.outputs) { if (!producers.has(o.key)) producers.set(o.key, []); producers.get(o.key).push(r); }
  const roots = new Set();
  const chain = [];
  const seen = new Set();
  const line = (r) => `${r.id}: ${r.inputs.filter((i) => !i.cap && i.consume > 0).map((i) => `${i.alts.slice(0, 2).join('|') || i.label}=${i.alts.some((a) => model.reachable(a)) ? 'ok' : 'NO'}`).join(', ')}`;
  const walk = (k) => {
    if (seen.has(k)) return;
    seen.add(k);
    const ps = producers.get(k) || [];
    if (!ps.length) { roots.add(`${k} (no recipe makes it)`); return; }
    for (const r of ps) {
      chain.push(line(r));
      for (const i of r.inputs) {
        if (i.cap || !(i.consume > 0)) continue;
        if (!i.alts.length) { roots.add(`${r.id}: input with no resolvable item (${i.label})`); continue; }
        if (i.alts.every((a) => !model.reachable(a))) for (const a of i.alts.slice(0, 3)) walk(a);
      }
    }
  };
  walk(key);
  const out = [...roots].sort();
  if (!out.length) out.push('(a cycle with no outside source) recipes on it:', ...chain.slice(0, 8));
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const cfg = JSON.parse(fs.readFileSync(args.config, 'utf8'));
  const dump = loadDump(args.dump, { log: null });
  const { recipes, drill } = normalizeAll(dump, cfg.excludeRecipes);

  // Molten metals have no producing recipe in the dump (the melting is the machine's job); without this they would be
  // natural base resources and every alloy casing would look free. One item of the metal makes `mbPerItem` mB of it.
  let melts = 0;
  const meltCfg = cfg.settings.melt;
  if (meltCfg) {
    const made = new Set();
    for (const n of recipes) for (const o of n.outputs) made.add(o.key);
    for (const f of [...dump.fluids].sort()) {
      const fk = `fluid:${f}`;
      if (made.has(fk)) continue;
      const item = meltCfg.itemSuffixes.map((s) => f + s).find((k) => dump.items.has(k));
      if (!item) continue;
      recipes.push({
        id: `synthetic/melt/${f}`, type: 'synthetic:melt', category: 'melt', eut: 0, amp: 1, euOut: 0, duration: 0,
        inputs: [{ kind: 'item', alts: [item], count: 1, cap: false, cat: 'item', consume: 1, label: item, tags: [] }],
        outputs: [{ key: fk, chance: 1, count: meltCfg.mbPerItem }],
      });
      melts++;
    }
  }
  const produced = new Set();
  cfg._melts = melts;
  for (const n of recipes) for (const o of n.outputs) produced.add(o.key);
  const explicit = new Set();
  for (const n of drill) for (const o of n.outputs) explicit.add(o.key);
  const baseItems = globMatcher(cfg.base.items);
  const notBase = globMatcher(cfg.base.notBase);
  const unprodItems = globMatcher(cfg.base.unproducedItems);
  const unprodFluids = globMatcher(cfg.base.unproducedFluids);
  const free = globMatcher(cfg.base.free);
  const noShareSet = globMatcher(cfg.base.noShareOutputs);
  const trivial = globMatcher(cfg.base.trivial);
  const weightRules = (cfg.base.weights || []).map((w) => ({ m: globMatcher([w.match]), w: w.weight }));
  const weight = (k) => {
    if (free(k)) return 0;
    for (const r of weightRules) if (r.m(k)) return r.w;
    return 1;
  };
  const isBase = (k) => {
    if (explicit.has(k)) return true;
    if (notBase(k)) return false;
    if (baseItems(k)) return true;
    if (produced.has(k)) return false;
    return k.startsWith('fluid:') ? unprodFluids(k.slice(6)) : unprodItems(k);
  };
  const s = cfg.settings;
  const model = solveCosts(recipes, {
    isBase, weight, noShare: noShareSet, fluidUnitMb: s.fluidUnitMb, allocation: s.allocation, chance: s.chance,
    sourceAsBase: s.sourceAsBase, euWeight: s.euWeight, freeEpsilon: s.freeEpsilon,
  });
  const summ = (v) => summarize(v, { weight, fluidUnitMb: s.fluidUnitMb, top: s.topContributors });

  if (args.trace) {
    const show = (key, factor, depth, seen) => {
      const ch = model.choiceOf(key);
      const pad = '  '.repeat(depth);
      const m = model.metric(key);
      if (model.isBase(key)) { console.log(`${pad}${key}  x${factor.toPrecision(3)}  BASE metric=${m}`); return; }
      if (!ch) { console.log(`${pad}${key}  x${factor.toPrecision(3)}  (none)`); return; }
      console.log(`${pad}${key}  x${factor.toPrecision(3)}  unit=${m?.toPrecision(3)}  via ${ch.id}  denom=${ch.denom.toPrecision(3)} outs=${ch.outs.map((o) => `${o.key}:${o.n}`).join(',')}`);
      if (depth >= 5 || seen.has(key)) return;
      const next = new Set(seen).add(key);
      for (const i of ch.inputs) show(i.key, (factor * i.amount) / ch.denom, depth + 1, next);
    };
    for (const key of args.trace.split(',')) show(key, 1, 0, new Set());
    return;
  }
  if (args.why) {
    for (const key of args.why.split(',')) {
      const roots = whyUnreachable(key, recipes, model);
      console.log(`${key}: ${model.reachable(key) ? 'reachable' : 'unreachable'}; ${roots.length} blockers:\n` + roots.slice(0, 14).map((x) => '  ' + x.slice(0, 420)).join('\n'));
    }
    return;
  }
  const { rows: keys, missing } = resolveKeys(cfg, dump, model);
  const rows = keys.map((r) => costRow(r, model, summ));
  const eraIdx = new Map(cfg.tiers.map((t, i) => [t, i]));
  const groupOrder = ['hull', 'motor', 'pump', 'piston', 'conveyor', 'robot_arm', 'emitter', 'sensor', 'field_generator', 'energy_hatch', 'energy_hatch_4a', 'energy_hatch_16a', 'superconductor_wire', 'circuit', 'capstone', 'controller', 'lv_item'];
  rows.sort((a, b) => eraIdx.get(a.era) - eraIdx.get(b.era) || groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group) || (a.item < b.item ? -1 : 1));

  fs.mkdirSync(args.out, { recursive: true });
  const csv = ['era,group,item,status,score,items,fluid_l,free_fluid_l,eu,top1,top1_share,top2,top2_share,top3,top3_share'];
  for (const r of rows) {
    const t = r.top || [];
    const cells = [r.era, r.group, r.item, r.status, num(r.score), num(r.items), num(r.fluidL), num(r.freeFluidL), num(r.eu)];
    for (let i = 0; i < 3; i++) cells.push(t[i] ? t[i].key : '', t[i] ? num(t[i].share) : '');
    csv.push(cells.join(','));
  }
  fs.writeFileSync(path.join(args.out, '01_cost_matrix.csv'), csv.join('\n') + '\n');

  const md = renderMarkdown({ cfg, rows, missing, model, recipes, trivial, dump, args, weight });
  const mdPath = path.join(args.out, '01_cost_matrix.md');
  let full;
  if (fs.existsSync(mdPath)) {
    const old = fs.readFileSync(mdPath, 'utf8');
    const a = old.indexOf(BEGIN);
    const b = old.indexOf(END);
    full = a >= 0 && b > a ? old.slice(0, a) + md + old.slice(b + END.length) : old.trimEnd() + '\n\n' + md + '\n';
  } else full = '# Reforge 01: cost matrix\n\n' + md + '\n';
  fs.writeFileSync(mdPath, full);

  const ok = rows.filter((r) => r.status !== 'unreachable').length;
  console.log(`cost matrix: ${ok}/${rows.length} key items priced, ${rows.length - ok} unreachable, ${model.recipesUsed} recipes, non-loop improvements left: ${model.improvementsLeft} (${model.improvements} applied, ${model.evaluations} evaluations)`);
  if (args.compare) console.log('\n' + compareReport(args.compare, rows));
}

function renderMarkdown({ cfg, rows, missing, model, recipes, trivial, dump, args, weight }) {
  const tiers = cfg.tiers;
  const L = [];
  const o = cfg.outliers;
  L.push(BEGIN, '');
  L.push('_Generated by `tools/analysis/cost-matrix.mjs` from the bench recipe dump; do not edit between the markers (re-run it). The CSV next to this file has one row per key item._', '');
  L.push('## Method and settings', '');
  L.push(`- Dump: \`${path.basename(path.dirname(path.resolve(args.dump)))}\` (${dump.recipes.size.toLocaleString('en-US')} recipes; ${recipes.length.toLocaleString('en-US')} used after the exclusions below). The cost of a key item is the base resources of the cheapest recipe chain, expanded through every intermediate.`);
  L.push(`- **Score** = base items + fluid litres, 1 per item and 1 per ${cfg.settings.fluidUnitMb} mB. Free resources (${cfg.base.free.join(', ')}) are tracked but score 0; machines (capital), tools and non-consumed inputs cost nothing, programmed circuits are free. EU is tracked (column \`eu\`) but not part of the score or of the recipe choice.`);
  L.push(`- **Base resources**: outputs of \`${cfg.base.drillOutputsOfTypes.join(', ')}\` (vein-drill ores and stone), raw ores (\`${cfg.base.items.join(', ')}\` except \`${(cfg.base.notBase || []).join(', ')}\`), natural fluids (every fluid no recipe makes, except ${cfg._melts || 0} molten metals that count as their ingot at ${cfg.settings.melt ? cfg.settings.melt.mbPerItem : 0} mB per item), world items no recipe makes (${cfg.base.unproducedItems.join(', ')}), and the outputs of recipes that consume nothing (gas collectors and similar sources).`);
  const allocText = { full: 'every output bears the whole recipe cost, so nothing is cheap just because it is a byproduct', units: 'inputs split over the expected output units of every output', primary: 'only the first output carries the cost' }[cfg.settings.allocation];
  L.push(`- **Multi-output recipes**: \`${cfg.settings.allocation}\` (${allocText}; outputs that are inert byproducts are never made for their own sake: ${cfg.base.noShareOutputs.join(', ')}). **Chanced outputs**: \`${cfg.settings.chance}\` (count x chance). **Catalysts**: expected consumption. **Tag inputs**: the cheapest member. **Loops**: items are priced in increasing cost and each recipe fires once, so a loop that multiplies matter (dust packing and unpacking) cannot pump a cost down.`);
  L.push(`- **Recipe choice**: the cheapest acyclic chain by score, ties by dump order. Items are first priced in increasing cost (Knuth), then a label-correcting pass lets a cheaper route through a dearer intermediate replace an item's choice (per-unit division, e.g. 1 plate -> 4 foil, is not monotonic), but only when the item is not already in the derivation of the candidate's inputs. Excluded: types \`${cfg.excludeRecipes.types.join(', ')}\`, categories \`${cfg.excludeRecipes.categories.join(', ')}\`, ids \`${cfg.excludeRecipes.ids.join(', ')}\`.`);
  L.push(`- **Self-check**: non-loop improvements left: ${model.improvementsLeft} (${model.improvements.toLocaleString('en-US')} applied in ${model.evaluations.toLocaleString('en-US')} recipe evaluations; ${model.relaxations.toLocaleString('en-US')} items priced by the first pass). ${model.improvementsLeft === 0 ? 'Fixed point reached.' : '**Not a fixed point.**'}`, '');

  const series = seriesOf(rows, tiers);
  const names = ['hull', 'motor', 'pump', 'piston', 'conveyor', 'robot_arm', 'emitter', 'sensor', 'field_generator', 'energy_hatch', 'energy_hatch_4a', 'energy_hatch_16a', 'superconductor_wire', 'circuit (cheapest)', 'circuit (median)', 'capstone', 'controller (median)'].filter((n) => series.has(n));
  L.push('## Cost per era (score)', '');
  L.push('| Era | ' + names.join(' | ') + ' |', '|---|' + names.map(() => '---:').join('|') + '|');
  for (const t of tiers) {
    const cells = names.map((n) => fmt(series.get(n).get(t) ?? null));
    if (cells.some((c) => c !== '-')) L.push(`| ${t} | ${cells.join(' | ')} |`);
  }
  L.push('');

  L.push('## Era-to-era ratios (cost of the era / cost of the previous era with a value)', '');
  L.push('| Era | ' + names.join(' | ') + ' |', '|---|' + names.map(() => '---:').join('|') + '|');
  const ratios = new Map();
  for (const n of names) {
    const m = series.get(n);
    let prev = null;
    const r = new Map();
    for (const t of tiers) {
      const v = m.get(t);
      if (v === undefined) continue;
      if (prev !== null && prev > 0) r.set(t, { ratio: v / prev });
      prev = v;
    }
    ratios.set(n, r);
  }
  const prevEraOf = (n, t) => { const ks = [...series.get(n).keys()].filter((e) => eraIdxOf(tiers, e) < eraIdxOf(tiers, t)); return ks.length ? ks[ks.length - 1] : null; };
  for (const t of tiers) {
    const cells = names.map((n) => { const r = ratios.get(n).get(t); return r ? 'x' + fmt(r.ratio) : '-'; });
    if (cells.some((c) => c !== '-')) L.push(`| ${t} | ${cells.join(' | ')} |`);
  }
  L.push('');

  L.push('## Composition of a typical item per era (median of the component groups)', '');
  L.push('| Era | Median score | Median base items | Median fluid L | Median EU | Free fluid L (air, water) |', '|---|---:|---:|---:|---:|---:|');
  const comp = new Set(['motor', 'pump', 'piston', 'conveyor', 'robot_arm', 'emitter', 'sensor', 'field_generator']);
  for (const t of tiers) {
    const rs = rows.filter((r) => r.era === t && comp.has(r.group) && r.status !== 'unreachable');
    if (rs.length) L.push(`| ${t} | ${fmt(median(rs.map((r) => r.score)))} | ${fmt(median(rs.map((r) => r.items)))} | ${fmt(median(rs.map((r) => r.fluidL)))} | ${fmt(median(rs.map((r) => r.eu)))} | ${fmt(median(rs.map((r) => r.freeFluidL)))} |`);
  }
  L.push('');

  L.push('## Era capstones', '');
  L.push('| Era | Capstone | Score | Items | Fluid L | EU | Top contributors |', '|---|---|---:|---:|---:|---:|---|');
  for (const r of rows.filter((x) => x.group === 'capstone')) {
    if (r.status === 'unreachable') L.push(`| ${r.era} | \`${r.item}\` | unreachable | | | | |`);
    else L.push(`| ${r.era} | \`${r.item}\` | ${fmt(r.score)} | ${fmt(r.items)} | ${fmt(r.fluidL)} | ${fmt(r.eu)} | ${r.top.map((x) => `${x.key} ${Math.round(x.share * 100)}%`).join(', ')} |`);
  }
  L.push('');

  L.push('## Outliers', '');
  L.push(`Flags: **regress** = cheaper than the previous era's equivalent; **band** = ratio to the previous era outside the band (tier groups x${o.tierRatioBand[0]}..x${o.tierRatioBand[1]}, era medians of circuits and controllers x${o.eraMedianRatioBand[0]}..x${o.eraMedianRatioBand[1]}); **trivial** = one trivial base input is at least ${Math.round(o.dominanceShare * 100)}% of the cost; **cheap LV** = LV item under ${o.lvCheapScore}; **unreachable** = no chain to base resources in this dump.`, '');
  const flags = [];
  for (const n of names) {
    const band = n.includes('(') ? o.eraMedianRatioBand : o.tierRatioBand;
    const m = series.get(n);
    for (const [t, r] of ratios.get(n)) {
      const pe = prevEraOf(n, t);
      if (r.ratio < 1) flags.push({ kind: 'regress', era: t, what: n, detail: `x${fmt(r.ratio)} vs ${pe} (${fmt(m.get(pe))} -> ${fmt(m.get(t))})`, sev: 1 / Math.max(r.ratio, 1e-9) });
      else if (t !== 'ulv' && (r.ratio < band[0] || r.ratio > band[1])) flags.push({ kind: 'band', era: t, what: n, detail: `x${fmt(r.ratio)} vs ${pe} (${fmt(m.get(pe))} -> ${fmt(m.get(t))})`, sev: r.ratio > band[1] ? r.ratio / band[1] : band[0] / r.ratio });
    }
  }
  for (const r of rows) {
    if (r.status === 'unreachable') continue;
    if (r.top.length && r.top[0].share >= o.dominanceShare && trivial(r.top[0].key) && r.group !== 'lv_item') flags.push({ kind: 'trivial', era: r.era, what: r.item, detail: `${r.top[0].key} is ${Math.round(r.top[0].share * 100)}% of ${fmt(r.score)}`, sev: r.top[0].share });
  }
  const lvCheap = rows.filter((r) => r.era === 'lv' && r.status !== 'unreachable' && r.score < o.lvCheapScore).sort((a, b) => a.score - b.score || (a.item < b.item ? -1 : 1));
  for (const r of lvCheap.slice(0, o.maxLvFlags)) flags.push({ kind: 'cheap LV', era: 'lv', what: r.item, detail: `score ${fmt(r.score)} (${r.top.map((x) => x.key).join(', ')})`, sev: 1 / Math.max(r.score, 0.01) });
  const unreach = rows.filter((r) => r.status === 'unreachable' && !(r.group === 'lv_item'));
  for (const r of unreach) flags.push({ kind: 'unreachable', era: r.era, what: r.item, detail: 'no recipe chain to base resources', sev: 0 });
  flags.sort((a, b) => (b.sev - a.sev) || (a.what < b.what ? -1 : 1));
  const rank = { regress: 0, band: 1, trivial: 2, 'cheap LV': 3, unreachable: 4 };
  flags.sort((a, b) => rank[a.kind] - rank[b.kind] || b.sev - a.sev || (a.what < b.what ? -1 : 1));
  L.push(`${flags.length} flags (${lvCheap.length} LV items under the cheap threshold, ${Math.min(lvCheap.length, o.maxLvFlags)} listed).`, '');
  L.push('| Flag | Era | Item or series | Detail |', '|---|---|---|---|');
  for (const f of flags) L.push(`| ${f.kind} | ${f.era} | \`${f.what}\` | ${f.detail} |`);
  L.push('');
  if (missing.length) {
    L.push('## Key items not in the dump', '', missing.map((m) => `- ${m}`).join('\n'), '');
  }

  const contrib = new Map();
  for (const r of rows) {
    if (r.status === 'unreachable' || r.group === 'lv_item') continue;
    const v = model.vector(r.item);
    for (const [k, a] of v) {
      if (k === EU_KEY) continue;
      const w = weight(k);
      if (w <= 0) continue;
      const u = (k.startsWith('fluid:') ? a / cfg.settings.fluidUnitMb : a) * w;
      contrib.set(k, (contrib.get(k) || 0) + u / r.score);
    }
  }
  const topBase = [...contrib].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, 25);
  L.push('## Base resources the key items draw on (sum over key items of the share of their score)', '');
  L.push('| Base resource | Sum of shares |', '|---|---:|');
  for (const [k, v] of topBase) L.push(`| \`${k}\` | ${fmt(v)} |`);
  L.push('', END);
  return L.join('\n');
}

const eraIdxOf = (tiers, t) => tiers.indexOf(t);

main();
