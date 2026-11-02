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
// Cost curve (Project Reforge, RF-2A; docs/reforge/02_cost_curve.md). The pack's pass (integration/cost_curve.js) scales consumed
// inputs by a per-era factor read from data/grindless/tables/cost_curve/<era>.json. These modes run that same rule on the dump:
//   --table <dir>        the tables of <dir> are applied to the dump before pricing (enabled tables only), so the matrix, the core
//                        index per era and the recipes' amounts are what the pack would produce. --out is optional here.
//   --factors <file>     with --table or --write-tables: a solved.json (see --solve); its factors replace the tables' and switch them on.
//   --solve              finds the item factor per era, MV first, so each era's core index is within `curve.solveTolerance` of
//                        anchor x rate^n given the factors of the lower eras (settings `curve` in cost_matrix.json). Prints the
//                        factors, the predicted index, the bypasses and the real-shortcut candidates; --out gets solved.json.
//                        Needs --table <dir> for the keys (default: the pack's tables). Several matrix runs per era: minutes.
//   --era <list>         with --solve: only these eras (the factors of the lower eras come from --factors, else 1).
//   --write-tables <dir> writes one disabled table per era (every factor 1.0) with the key items resolved from the dump and the
//                        config; include/exclude/override/remove already in <dir> are kept.
//
// How a cost is built: every recipe of the dump is normalized with the obtainability tier (tools/analysis/tiers), then
// lib/cost.mjs picks, for every item and fluid, the cheapest recipe chain down to base resources (vein-drill outputs, natural
// fluids, free world blocks, source recipes such as gas collectors) and expands it into a vector of base amounts. Settings
// that change numbers (allocation of multi-output recipes, chances, catalysts, cycles, free resources, excluded recipes)
// are in cost_matrix.json and printed in the document. Deterministic: the same dump and config give the same files.
//
// Era-aware pricing (Project Reforge, P2-T; lib/era.mjs): the cost of an era's key item is built only from recipes a player of
// that era can run (tier from EU/t, dimension, our multiblock's era), so a later route no longer prices an earlier item. A key
// unreachable at its own era is priced by the first later era that reaches it (`late`). Items nothing ever gives the player
// (hidden_until.json groups with until "never") are not key items. settings.eraAware=false gives the old single-model numbers;
// --trace/--why take --era <name> to look at one era's model.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDump } from './lib/dump.mjs';
import { loadTierConfig } from './lib/config.mjs';
import { prepareConfig } from './lib/model.mjs';
import { normalizeRecipe } from './lib/normalize.mjs';
import { solveCosts, summarize, globMatcher, EU_KEY } from './lib/cost.mjs';
import { loadRule, loadTables, withFactors, applyToDump, TABLE_DIR } from './lib/cost_curve.mjs';
import { ERAS, eraIdx as eraIndex, loadEraContext, recipeEra } from './lib/era.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(here, '..', '..');
const BEGIN = '<!-- cost-matrix:begin -->';
const END = '<!-- cost-matrix:end -->';
const USAGE = 'usage: node tools/analysis/cost-matrix.mjs --dump <dir> --out <dir> [--compare <old.csv>] [--config <file>] [--check]\n       node tools/analysis/cost-matrix.mjs --dump <dir> (--table <dir> [--factors <solved.json>] | --solve [--table <dir>] [--era <list>] | --write-tables <dir>) [--out <dir>] [--compare <old.csv>]';

function parseArgs(argv) {
  const a = { config: path.join(here, 'cost_matrix.json') };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (['--dump', '--out', '--compare', '--config', '--why', '--trace', '--table', '--factors', '--era', '--write-tables'].includes(k)) a[k.slice(2)] = argv[++i];
    else if (k === '--solve') a.solve = true;
    else if (k === '--check') a.check = true;
    else throw new Error(`unknown argument ${k}`);
  }
  a.curveMode = Boolean(a.table || a.solve || a['write-tables']);
  const light = a.trace || a.why || a.curveMode;
  if (!a.dump || (!a.out && !light)) throw new Error(USAGE);
  if (a.check && (light || !a.out)) throw new Error('--check goes with the matrix run (--dump and --out)');
  if (a.factors && !a.table && !a['write-tables']) throw new Error('--factors goes with --table or --write-tables');
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

/**
 * lib/normalize.mjs lists a shaped recipe's ingredients once per distinct pattern symbol, so nine tiny dusts crafted into one dust
 * count as one. The matrix needs the real number of cells: the same symbol repeated n times is n items. Only the cost model is
 * corrected here (the shared normalizer feeds the other analyses unchanged).
 */
export function fixShapedCounts(n, json) {
  if (n.shape !== 'shaped' || !json || !json.pattern || !json.key) return;
  const cells = new Map();
  for (const row of [].concat(json.pattern)) for (const ch of String(row)) if (ch !== ' ') cells.set(ch, (cells.get(ch) || 0) + 1);
  const syms = [...cells.keys()].filter((s) => json.key[s] !== undefined);
  if (syms.length !== n.inputs.length) return;
  syms.forEach((s, i) => { n.inputs[i].count *= cells.get(s); });
}

const normCache = new WeakMap();
function normalizeAll(dump, excl, settings = {}) {
  const key = JSON.stringify([excl, Boolean(settings.shapedCells)]);
  let per = normCache.get(dump);
  if (!per) normCache.set(dump, (per = new Map()));
  if (!per.has(key)) per.set(key, normalizeAllUncached(dump, excl, settings));
  return per.get(key);
}

/** Items no route ever gives the player (class C: hidden_until.json groups with until "never"); they are not key items. */
const neverCache = new Map();
export function neverItems(cfg) {
  const f = cfg.settings && cfg.settings.neverFile;
  if (!f) return new Set();
  const file = path.resolve(REPO, f);
  if (!neverCache.has(file)) {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    neverCache.set(file, new Set((j.groups || []).filter((g) => g.until === 'never').flatMap((g) => g.items || [])));
  }
  return neverCache.get(file);
}

function normalizeAllUncached(dump, excl, settings = {}) {
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
    if (settings.shapedCells) fixShapedCounts(n, rec.json);
    n.duration = (rec.json && rec.json.duration) || 0;
    if (types.has(rec.type) || types.has(al)) { drill.push(n); continue; }
    if (n.category && cats(n.category)) continue;
    if (ids(rec.id)) continue;
    recipes.push(n);
  }
  return { recipes, drill };
}

/** Every key slot of the config, with the candidates that exist in the dump: [{era, group, candidates, present}] and the slots with none. */
export function keyCandidates(cfg, dump) {
  const slots = [];
  const missing = [];
  const tiers = cfg.tiers;
  const never = neverItems(cfg);
  const exists = (k) => dump.items.has(k) && !never.has(k);
  const expand = (s, t) => s.replaceAll('${t}', t);
  const add = (era, group, candidates) => {
    const present = candidates.filter(exists);
    if (!present.length) { missing.push(`${era}/${group}: ${candidates[0]}`); return; }
    slots.push({ era, group, present });
  };
  for (const t of tiers) {
    for (const [g, cand] of Object.entries(cfg.groups)) if (g !== 'note') add(t, g, cand.map((c) => expand(c, t)));
    const mat = cfg.superconductorWire[t];
    if (mat) add(t, 'superconductor_wire', [`gtceu:${mat}_single_wire`]);
    const skipCircuit = globMatcher(cfg.circuits.skip || []);
    const circuits = (dump.tags.items(cfg.circuits.tagPrefix + t) || []).filter((c) => !skipCircuit(c));
    for (const c of [...circuits].sort()) add(t, 'circuit', [c]);
    if (cfg.capstones[t]) add(t, 'capstone', [`gtceu:${cfg.capstones[t]}`]);
    for (const c of cfg.controllers[t] || []) add(t, 'controller', [`gtceu:${c}`]);
  }
  return { slots, missing };
}

/**
 * The key rows. `pick(era, present)` returns {item, model} for a slot: the first candidate the model of that era reaches.
 * `late` on a row names the era whose recipes had to be used because the item is unreachable at its own era.
 */
function resolveKeys(cfg, dump, pick) {
  const { slots, missing } = keyCandidates(cfg, dump);
  const never = neverItems(cfg);
  const rows = slots.map(({ era, group, present }) => {
    const p = pick(era, present);
    return { era, group, item: p.item, alt: present.length > 1 && p.item !== present[0] ? present[0] : '', ...(p.late ? { late: p.late } : {}) };
  });
  const have = new Set(rows.map((r) => r.item));
  const lv = [...dump.items].filter((k) => k.startsWith('gtceu:lv_') && !have.has(k) && !never.has(k)).sort();
  for (const k of lv) {
    const p = pick('lv', [k]);
    rows.push({ era: 'lv', group: 'lv_item', item: k, alt: '', ...(p.late ? { late: p.late } : {}) });
  }
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

/**
 * Normalizes and prices a dump: {recipes, model, summ, weight, trivial}. The pricing is the same for the baseline and for a dump the cost curve rewrote.
 * `opts.limit` (era index) keeps only the recipes a player of that era can run (lib/era.mjs); without it every recipe prices.
 */
export function priceDump(dump, cfg, opts = {}) {
  const all = normalizeAll(dump, cfg.excludeRecipes, cfg.settings);
  let recipes = [...all.recipes];
  let drill = all.drill;
  if (opts.limit !== undefined) {
    const ctx = opts.ctx || loadEraContext(dump);
    recipes = recipes.filter((n) => recipeEra(n, ctx) <= opts.limit);
    drill = drill.filter((n) => recipeEra(n, ctx) <= opts.limit);
  }

  // Molten metals have no producing recipe in the dump (the melting is the machine's job); without this they would be
  // natural base resources and every alloy casing would look free. One item of the metal makes `mbPerItem` mB of it.
  // `always` also melts a metal some other recipe makes (a remelt return is not a primary route; GTM's own melt is a
  // recycling-category recipe the matrix excludes).
  let melts = 0;
  const meltCfg = cfg.settings.melt;
  if (meltCfg) {
    const made = new Set();
    for (const n of recipes) for (const o of n.outputs) made.add(o.key);
    for (const f of [...dump.fluids].sort()) {
      const fk = `fluid:${f}`;
      if (made.has(fk) && !meltCfg.always) continue;
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
    if (free(k)) return true;
    if (produced.has(k)) return false;
    if (baseItems(k)) return true;
    return k.startsWith('fluid:') ? unprodFluids(k.slice(6)) : unprodItems(k);
  };
  const s = cfg.settings;
  const model = solveCosts(recipes, {
    isBase, weight, noShare: noShareSet, fluidUnitMb: s.fluidUnitMb, allocation: s.allocation, chance: s.chance,
    sourceAsBase: s.sourceAsBase, euWeight: s.euWeight, freeEpsilon: s.freeEpsilon,
  });
  const summ = (v) => summarize(v, { weight, fluidUnitMb: s.fluidUnitMb, top: s.topContributors });
  return { recipes, model, summ, weight, trivial };
}

const CORE_GROUPS = ['hull', 'motor', 'pump', 'piston', 'conveyor', 'robot_arm', 'emitter', 'sensor', 'field_generator'];

/** Core index per era: the geometric mean of the nine core components' scores (the reading of docs/reforge/01_cost_matrix.md). */
export function coreIndex(rows, tiers) {
  const out = new Map();
  for (const t of tiers) {
    const xs = rows.filter((r) => r.era === t && CORE_GROUPS.includes(r.group) && r.status !== 'unreachable' && r.score > 0).map((r) => r.score);
    if (xs.length) out.set(t, { index: Math.exp(xs.reduce((s, x) => s + Math.log(x), 0) / xs.length), n: xs.length });
  }
  return out;
}

const rowModels = new WeakMap();
/** The era model that priced a row of pricedRows (its choices and vectors). */
export const modelOf = (row) => rowModels.get(row);

/**
 * Key rows priced per era. Era-aware (settings.eraAware, default on): each era's rows come from a model built only with the recipes
 * of that era and below, and a key unreachable at its own era is priced by the next era that reaches it (`late`).
 * `opts.eras` limits the eras priced (solver speed); `opts.eraAware === false` is the old single model with every recipe.
 */
export function pricedRows(dump, cfg, opts = {}) {
  const aware = cfg.settings.eraAware !== false && opts.eraAware !== false;
  const models = new Map();
  const ctx = aware ? (opts.eraCtx || loadEraContext(dump)) : null;
  const at = (lim) => {
    if (!models.has(lim)) models.set(lim, priceDump(dump, cfg, aware ? { limit: lim, ctx } : {}));
    return models.get(lim);
  };
  const only = opts.eras ? new Set(opts.eras) : null;
  const pick = (era, present) => {
    if (only && !only.has(era)) return { item: present[0], model: null };
    const e = eraIndex(era);
    const last = aware ? ERAS.length - 1 : e;
    for (let lim = e; lim <= last; lim++) {
      const m = at(lim);
      const item = present.find((k) => m.model.reachable(k));
      if (item) return { item, model: m, late: lim > e ? ERAS[lim] : undefined };
    }
    return { item: present[0], model: at(e) };
  };
  const picked = new Map();
  const { rows: keys, missing } = resolveKeys(cfg, dump, (era, present) => {
    const p = pick(era, present);
    picked.set(`${era}|${p.item}`, p.model);
    return p;
  });
  const rows = [];
  for (const r of keys) {
    if (only && !only.has(r.era)) continue;
    const m = picked.get(`${r.era}|${r.item}`) || (r.group === 'lv_item' ? at(eraIndex('lv')) : at(eraIndex(r.era)));
    const row = costRow(r, m.model, m.summ);
    rowModels.set(row, m);
    rows.push(row);
  }
  const top = only ? ([...models.values()].pop() || at(0)) : at(aware ? ERAS.length - 1 : 0);
  return { ...top, rows, missing, eraAware: aware, models };
}

/** The factors of a solved.json, or null. */
function readFactors(file) {
  if (!file) return null;
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!j.factors || typeof j.factors !== 'object') throw new Error(`${file}: no "factors" object`);
  return j.factors;
}

const curveOf = (cfg) => ({ anchor: 3, rate: 2.5, fluidFactorRatio: 1, tolerance: 0.1, solveTolerance: 0.03, maxIterations: 7, maxFactor: 4096, ...(cfg.curve || {}) });
/** Target core index of an era of the cost-curve table (MV = n 0). */
const targetOf = (curve, era) => { const n = loadRule().eras.indexOf(era); return n < 0 ? null : curve.anchor * Math.pow(curve.rate, n); };

function tablesFor(args, factors) {
  const { tables, problems } = loadTables(args.table || TABLE_DIR);
  if (problems.length) throw new Error('cost-curve tables:\n  ' + problems.join('\n  '));
  return factors ? withFactors(tables, factors) : tables;
}

/** The dump after the pass, plus what it did (applyToDump). */
export function curved(dump, tables) {
  const res = applyToDump(dump, tables);
  return { dump: { ...dump, recipes: res.recipes }, res };
}

/** Key items whose cheapest recipe was not changed by the pass, or whose score grew far less than its era's median. */
function bypassReport(before, after, res, curve) {
  const changed = res.changed;
  const growth = new Map();
  const byEra = new Map();
  for (const a of after.rows) {
    const b = before.rows.find((x) => x.item === a.item && x.era === a.era);
    if (!b || a.status === 'unreachable' || b.status === 'unreachable' || !(b.score > 0) || a.era === 'lv' || a.era === 'ulv' || a.era === 'steam') continue;
    const g = a.score / b.score;
    growth.set(a.item, g);
    if (!byEra.has(a.era)) byEra.set(a.era, []);
    byEra.get(a.era).push(g);
  }
  const out = [];
  for (const a of after.rows) {
    if (!growth.has(a.item)) continue;
    const ch = modelOf(a).model.choiceOf(a.item);
    const g = growth.get(a.item);
    const med = median(byEra.get(a.era));
    const direct = ch && !changed.has(ch.id);
    const weak = med > 1.5 && g < med * (curve.bypassShare ?? 0.25);
    if (direct || weak) out.push({ era: a.era, group: a.group, item: a.item, via: ch ? ch.id : null, growth: g, eraMedianGrowth: med, why: direct ? 'cheapest recipe not scaled' : 'grew far less than its era' });
  }
  return out;
}

function printEraTable(cfg, curve, base, after, factors) {
  const eras = loadRule().eras;
  const ib = coreIndex(base.rows, cfg.tiers);
  const ia = coreIndex(after.rows, cfg.tiers);
  console.log('era   item   fluid   index before   index after   target      after/target');
  for (const e of eras) {
    const f = factors && factors[e];
    const t = targetOf(curve, e);
    const b = ib.get(e);
    const a = ia.get(e);
    console.log(`${e.padEnd(5)} ${f ? String(f.item).padStart(6) : '     -'} ${f ? String(f.fluid).padStart(6) : '     -'}   ${b ? fmt(b.index).padStart(12) : '           -'}   ${a ? fmt(a.index).padStart(11) : '          -'}   ${fmt(t).padStart(9)}   ${a ? (a.index / t).toFixed(3) : '-'}`);
  }
}

function writeTables(dir, cfg, dump, factors) {
  const rule = loadRule();
  const { slots } = keyCandidates(cfg, dump);
  fs.mkdirSync(dir, { recursive: true });
  const skip = new Set(['ulv', 'lv', 'steam']);
  for (const era of rule.eras) {
    const keys = [...new Set(slots.filter((x) => x.era === era && !skip.has(x.era)).flatMap((x) => x.present))].sort();
    const f = path.join(dir, `${era}.json`);
    const old = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
    const t = {
      era, enabled: false, item: 1.0, fluid: 1.0, keys,
      include: old.include || [], exclude: old.exclude || [], remove: old.remove || [], override: old.override || {},
    };
    if (factors && factors[era]) { t.item = factors[era].item; t.fluid = factors[era].fluid; }
    fs.writeFileSync(f, JSON.stringify(t, null, 2) + '\n');
  }
  return rule.eras.length;
}

/**
 * The one measurement the solver loop and the factor check share: the pass with these factors, every table of the set switched on at
 * its factor (1 included, so a later era's `remove` list applies in both), then the era-aware pricing and the core index per era.
 * `eras` limits the eras priced (solver speed); the index of a priced era is the same either way.
 */
export function measure(dump, cfg, tables, factors, eras) {
  const { dump: d2, res } = curved(dump, withFactors(tables, factors));
  const priced = pricedRows(d2, cfg, eras ? { eras } : {});
  return { ...priced, res, dump: d2, index: coreIndex(priced.rows, cfg.tiers) };
}

export function solveFactors(args, cfg, dump) {
  const curve = curveOf(cfg);
  const rule = loadRule();
  const eras = args.era ? args.era.split(',') : rule.eras;
  const fixed = readFactors(args.factors) || {};
  const base = pricedRows(dump, cfg);
  const baseIdx = coreIndex(base.rows, cfg.tiers);
  const factors = {};
  for (const e of rule.eras) factors[e] = fixed[e] ? { ...fixed[e] } : { item: 1, fluid: 1 };
  const tables = tablesFor(args, null);
  const run = (fs_, eras_) => measure(dump, cfg, tables, fs_, eras_);
  const allOn = () => Object.fromEntries(rule.eras.map((e) => [e, { ...factors[e] }]));
  const predicted = {};
  const ratio = curve.fluidFactorRatio;
  const setFactor = (era, f) => { factors[era] = { item: f, fluid: Math.max(1, Math.round(f * ratio * 1e4) / 1e4) }; };
  const log = [];
  let solves = 0;
  const unsolved = [];
  const plateaus = [];
  for (const era of eras) {
    const target = targetOf(curve, era);
    const tryF = (f) => {
      setFactor(era, f);
      const r = run(allOn(), [era]);
      solves++;
      const idx = r.index.get(era);
      return idx ? idx.index : null;
    };
    const i0 = tryF(1);
    if (i0 === null) { unsolved.push(era); factors[era] = { item: 1, fluid: 1 }; log.push(`${era}: core index not priceable (a core component is unreachable); factor left at 1`); console.log(log[log.length - 1]); continue; }
    if (i0 >= target * (1 - curve.solveTolerance)) { setFactor(era, 1); log.push(`${era}: index ${fmt(i0)} already meets target ${fmt(target)} at factor 1`); console.log(log[log.length - 1]); continue; }
    const pts = [{ lf: 0, g: Math.log(i0 / target) }];
    const tried = [{ f: 1, idx: i0 }];
    // the table holds the factor to 3 decimals and the index jumps at some factors: measure the number that will be written
    const r3 = (x) => Math.max(1.001, Math.round(x * 1e3) / 1e3);
    let f = r3(target / i0);
    // factor 1 is a candidate too: the index can jump at the first factor above 1 (ceil of every count), so the nearest two are 1 and the first step
    let best = { f: 1, g: pts[0].g, idx: i0 };
    let plateau = false;
    for (let k = 0; k < curve.maxIterations; k++) {
      if (tried.some((x) => x.f === f)) break;
      const idx = tryF(f);
      if (idx === null) break;
      const g = Math.log(idx / target);
      pts.push({ lf: Math.log(f), g });
      tried.push({ f, idx });
      if (!best || Math.abs(g) < Math.abs(best.g)) best = { f, g, idx };
      console.log(`  ${era}: f=${f.toPrecision(4)} -> index ${fmt(idx)} (target ${fmt(target)}, ${(idx / target).toFixed(3)})`);
      if (Math.abs(g) <= curve.solveTolerance) break;
      const a = pts[pts.length - 2];
      const b = pts[pts.length - 1];
      // the index stopped answering to the factor: the cheapest route of some core item bypasses the scaled recipes
      if (b.lf > a.lf && idx < Math.exp(a.g) * target * 1.02 && g < -curve.solveTolerance) { plateau = true; break; }
      if (f >= curve.maxFactor) { plateau = true; break; }
      const slope = (b.g - a.g) / (b.lf - a.lf);
      let lfNext = Number.isFinite(slope) && slope > 0.05 ? b.lf - b.g / slope : b.lf - b.g;
      lfNext = Math.min(lfNext, b.lf + Math.log(8));
      f = r3(Math.min(Math.exp(lfNext), curve.maxFactor));
    }
    let pick = best ? best.f : 1;
    let shown = best ? best.idx : null;
    // a step in the index can look like a plateau: a candidate already inside the band is the answer, not the highest index
    if (plateau && best && Math.abs(Math.exp(best.g) - 1) <= curve.tolerance) plateau = false;
    if (plateau) {
      // the smallest factor that already gives (nearly) the best index: more only raises costs the index never sees
      const top = Math.max(...tried.map((x) => x.idx));
      const t0 = tried.filter((x) => x.idx >= top * 0.98).sort((x, y) => x.f - y.f)[0];
      pick = t0.f;
      shown = t0.idx;
      plateaus.push({ era, factor: pick, index: shown, target });
    }
    setFactor(era, pick <= 1 ? 1 : r3(pick));
    predicted[era] = shown;
    log.push(`${era}: item factor ${factors[era].item}, fluid ${factors[era].fluid}, index ${shown === null ? '-' : fmt(shown)} (target ${fmt(target)})${plateau ? ' PLATEAU: more factor does not raise the index, fix the routes' : ''}`);
    console.log(log[log.length - 1]);
  }
  const after = run(allOn());
  console.log(`\nsolved with ${solves + 1} matrix runs.\n`);
  printEraTable(cfg, curve, base, after, factors);
  for (const p of plateaus) {
    const groups = after.rows
      .filter((a) => a.era === p.era && CORE_GROUPS.includes(a.group) && a.status !== 'unreachable')
      .map((a) => { const b = base.rows.find((x) => x.item === a.item && x.era === a.era); return { g: a.group, grow: b && b.score > 0 ? a.score / b.score : null, via: modelOf(a).model.choiceOf(a.item)?.id }; })
      .filter((x) => x.grow !== null)
      .sort((x, y) => x.grow - y.grow)
      .slice(0, 3);
    console.log(`\n${p.era} plateau at x${p.factor} (index ${fmt(p.index)} of ${fmt(p.target)}); least-grown core groups: ${groups.map((x) => `${x.g} x${x.grow.toFixed(2)} via ${x.via}`).join('; ')}`);
  }
  const bypass = bypassReport(base, after, after.res, curve);
  console.log(`\n${bypass.length} bypasses (key items whose cheapest route escapes the scaled recipes):`);
  for (const b of bypass.slice(0, 60)) console.log(`  ${b.era}  ${b.group}  ${b.item}  via ${b.via}  x${b.growth.toFixed(2)} vs era median x${b.eraMedianGrowth.toFixed(2)}  (${b.why})`);
  const afterIdx = coreIndex(after.rows, cfg.tiers);
  const result = {
    note: 'Solved by tools/analysis/cost-matrix.mjs --solve. Factors per era; the tables stay disabled until a Phase 2 package switches them on.',
    curve: { anchor: curve.anchor, rate: curve.rate, fluidFactorRatio: curve.fluidFactorRatio, solveTolerance: curve.solveTolerance },
    factors,
    index: Object.fromEntries(rule.eras.map((e) => [e, { baseline: baseIdx.get(e)?.index ?? null, predicted: afterIdx.get(e)?.index ?? null, target: targetOf(curve, e) }])),
    unsolved,
    plateaus,
    changedRecipes: Object.fromEntries(Object.entries(after.res.byEra).map(([e, v]) => [e, v])),
    bypasses: bypass,
  };
  if (args.out) {
    fs.mkdirSync(args.out, { recursive: true });
    fs.writeFileSync(path.join(args.out, 'solved.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(`\nwrote ${path.join(args.out, 'solved.json')}`);
  }
  return { base, after, factors, predicted };
}

function curveMain(args, cfg, dump) {
  const curve = curveOf(cfg);
  if (args['write-tables']) {
    const n = writeTables(args['write-tables'], cfg, dump, readFactors(args.factors));
    console.log(`wrote ${n} tables to ${args['write-tables']} (disabled; key items from ${path.basename(path.dirname(path.resolve(args.dump)))})`);
    return;
  }
  if (args.solve) { solveFactors(args, cfg, dump); return; }
  const factors = readFactors(args.factors);
  const tables = tablesFor(args, factors);
  const base = pricedRows(dump, cfg);
  const enabled = tables.filter((t) => t.enabled).map((t) => t.era);
  const { res, rows: afterRows } = measure(dump, cfg, tables, Object.fromEntries(tables.filter((t) => t.enabled).map((t) => [t.era, { item: t.item, fluid: t.fluid }])));
  const after = { rows: afterRows };
  console.log(`cost curve: ${enabled.length ? 'enabled: ' + enabled.join(', ') : 'no table enabled (the dump is unchanged)'}; ${res.selected.length} recipes selected, ${res.changed.size} changed, ${res.removed.size} removed`);
  for (const [e, v] of Object.entries(res.byEra)) console.log(`  ${e}: ${v.selected} scaled, ${v.changed} changed (${v.items} item and ${v.fluids} fluid inputs)`);
  printEraTable(cfg, curve, base, after, factors || Object.fromEntries(tables.filter((t) => t.enabled).map((t) => [t.era, { item: t.item, fluid: t.fluid }])));
  if (args.out) {
    fs.mkdirSync(args.out, { recursive: true });
    const csv = ['era,group,item,status,score_before,score_after'];
    for (const a of after.rows) {
      const b = base.rows.find((x) => x.item === a.item && x.era === a.era);
      csv.push([a.era, a.group, a.item, a.status, num(b && b.score), num(a.score)].join(','));
    }
    fs.writeFileSync(path.join(args.out, '02_cost_curve_matrix.csv'), csv.join('\n') + '\n');
  }
  if (args.compare) console.log('\n' + compareReport(args.compare, after.rows));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const cfg = JSON.parse(fs.readFileSync(args.config, 'utf8'));
  const dump = loadDump(args.dump, { log: null });
  if (args.curveMode) { curveMain(args, cfg, dump); return; }
  if (args.trace || args.why) {
    const limit = args.era ? eraIndex(args.era) : undefined;
    const { recipes, model } = priceDump(dump, cfg, limit === undefined ? {} : { limit });
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
    for (const key of args.why.split(',')) {
      const roots = whyUnreachable(key, recipes, model);
      console.log(`${key}: ${model.reachable(key) ? 'reachable' : 'unreachable'}; ${roots.length} blockers:\n` + roots.slice(0, 14).map((x) => '  ' + x.slice(0, 420)).join('\n'));
    }
    return;
  }
  const { recipes, model, weight, trivial, rows: keyRows, missing } = pricedRows(dump, cfg);
  const rows = keyRows;
  const eraIdx = new Map(cfg.tiers.map((t, i) => [t, i]));
  const groupOrder = ['hull', 'motor', 'pump', 'piston', 'conveyor', 'robot_arm', 'emitter', 'sensor', 'field_generator', 'machine_casing', 'energy_hatch', 'energy_hatch_4a', 'energy_hatch_16a', 'superconductor_wire', 'circuit', 'capstone', 'controller', 'lv_item'];
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
  if (args.check) {
    const bad = gateViolations(seriesOf(rows, cfg.tiers), cfg.tiers, cfg.outliers.gate);
    for (const b of bad) console.log(`gate: ${b.series} ${b.from} -> ${b.era} x${fmt(b.ratio)} (${fmt(b.prev)} -> ${fmt(b.value)}), under x${cfg.outliers.gate.minRatio}`);
    console.log(`cost-matrix gate: ${bad.length} step(s) under x${cfg.outliers.gate.minRatio}`);
    if (bad.length) process.exitCode = 1;
  }
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
  const names = ['hull', 'motor', 'pump', 'piston', 'conveyor', 'robot_arm', 'emitter', 'sensor', 'field_generator', 'machine_casing', 'energy_hatch', 'energy_hatch_4a', 'energy_hatch_16a', 'superconductor_wire', 'circuit (cheapest)', 'circuit (median)', 'capstone', 'controller (median)'].filter((n) => series.has(n));
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
    const v = modelOf(r).model.vector(r.item);
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

/** Steps of the gated series that grow by less than gate.minRatio, except the owner-accepted ones (gate.accepted: series + era). Steps up to LV are only reviewed (principle 2). */
export function gateViolations(series, tiers, gate) {
  const out = [];
  if (!gate) return out;
  const first = tiers.indexOf('lv');
  for (const name of gate.series) {
    const m = series.get(name);
    if (!m) continue;
    let prev = null;
    for (const t of tiers) {
      const v = m.get(t);
      if (v === undefined) continue;
      if (prev && prev.v > 0 && tiers.indexOf(t) > first && v / prev.v < gate.minRatio
        && !(gate.accepted || []).some((a) => a.series === name && a.era === t)) {
        out.push({ series: name, era: t, from: prev.era, ratio: v / prev.v, prev: prev.v, value: v });
      }
      prev = { era: t, v };
    }
  }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
