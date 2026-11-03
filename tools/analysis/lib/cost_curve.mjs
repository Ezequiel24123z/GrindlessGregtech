// The Node side of the cost-curve rule (Project Reforge, RF-2A). There is one implementation of the rule: the pack's pass
// (pack/kubejs/server_scripts/grindless/integration/cost_curve.js). This module loads that very file in a sandbox, takes what it
// publishes (global.grindless.costCurve) and applies it to a dump, so cost-matrix.mjs --table/--solve and capacity-lint.mjs --dump
// predict exactly what the pack does. docs/reforge/02_cost_curve.md has the rule.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const PASS_FILE = path.resolve(here, '..', '..', '..', 'pack', 'kubejs', 'server_scripts', 'grindless', 'integration', 'cost_curve.js');
export const TABLE_DIR = path.resolve(here, '..', '..', '..', 'pack', 'kubejs', 'data', 'grindless', 'tables', 'cost_curve');

let cached = null;
/** The rule as the pack publishes it: {eras, scaledCount, tierOfEut, validateTable, makeSelector, scaleRecipe}. */
export function loadRule(file = PASS_FILE) {
  if (cached && cached.file === file) return cached.rule;
  const global = {};
  const sandbox = { global, console: { info() {}, error() {}, log() {} }, ServerEvents: { recipes() {} }, JsonIO: {} };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  const rule = global.grindless && global.grindless.costCurve;
  if (!rule) throw new Error(`${file} does not publish global.grindless.costCurve`);
  cached = { file, rule };
  return rule;
}

export const eras = () => [...loadRule().eras];
export const scaledCount = (n, f, key) => loadRule().scaledCount(n, f, key);

/** Reads <dir>/<era>.json for every era that has a file. Returns {tables, problems}; an invalid table is a problem and is left out, as the pass does. */
export function loadTables(dir = TABLE_DIR) {
  const rule = loadRule();
  const tables = [];
  const problems = [];
  for (const era of rule.eras) {
    const f = path.join(dir, `${era}.json`);
    if (!fs.existsSync(f)) continue;
    let t;
    try {
      t = JSON.parse(fs.readFileSync(f, 'utf8'));
    } catch (e) {
      problems.push(`${era}.json: ${e.message}`);
      continue;
    }
    const p = rule.validateTable(t, era);
    if (p.length) problems.push(`${era}.json: ${p.join('; ')}`);
    else tables.push(t);
  }
  return { tables, problems };
}

/** A copy of the tables with a different switch and factors: byEra {era: {item, fluid}} turns those eras on, the rest off. keyFactor and pin are kept. */
export function withFactors(tables, byEra) {
  return tables.map((t) => {
    const f = byEra[t.era];
    return f ? { ...t, enabled: true, item: f.item, fluid: f.fluid } : { ...t, enabled: false, item: 1, fluid: 1 };
  });
}

/**
 * What the pass would do to the recipes of a dump ({id, type, json} each, as loadDump holds them).
 * Returns {changed: Map(id -> new json), removed: Set(ids), selected: [{id, era, via, enabled}], byEra: {era: {selected, changed, items, fluids}}}.
 * Only enabled tables change anything, as in the pack.
 */
export function applyToRecipes(recipes, tables) {
  const rule = loadRule();
  const sel = rule.makeSelector(tables);
  const changed = new Map();
  const removed = new Set();
  const selected = [];
  const byEra = {};
  const want = new Set(sel.removeIds);
  for (const rec of recipes) {
    const id = rec.id !== undefined ? rec.id : rec.i;
    const json = rec.json !== undefined ? rec.json : rec.j;
    if (want.has(id)) {
      removed.add(id);
      continue;
    }
    const s = sel.select(id, json, rec.type !== undefined ? rec.type : rec.t);
    if (s === null) continue;
    const e = (byEra[s.era] = byEra[s.era] || { selected: 0, changed: 0, items: 0, fluids: 0 });
    selected.push({ id, era: s.era, via: s.via, enabled: s.enabled });
    if (!s.enabled) continue;
    e.selected++;
    const type = rec.type !== undefined ? rec.type : rec.t !== undefined ? rec.t : json.type;
    const r = rule.scaleRecipe(json, s.item, s.fluid, s.pin, rule.isOrdered(type));
    if (!r.changed) continue;
    e.changed++;
    e.items += r.items;
    e.fluids += r.fluids;
    changed.set(id, JSON.parse(JSON.stringify(r.json)));
  }
  return { changed, removed, selected, byEra };
}

/** A dump's recipes after the pass: the same recipe objects, with the changed ones replaced by copies and the removed ones dropped. */
export function applyToDump(dump, tables) {
  const res = applyToRecipes(dump.recipes.values(), tables);
  const recipes = new Map();
  for (const [id, rec] of dump.recipes) {
    if (res.removed.has(id)) continue;
    recipes.set(id, res.changed.has(id) ? { ...rec, json: res.changed.get(id) } : rec);
  }
  return { ...res, recipes };
}
