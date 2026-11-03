// Capacity linter (Reforge RF-1A): every GTM recipe our scripts define must fit its machine's item slots and fluid tanks at the recipe's tier.
//
//   node tools/analysis/capacity-lint.mjs [--pack pack] [--quiet]        T0 check (also run by tools\Check-Fast.ps1)
//   node tools/analysis/capacity-lint.mjs --dump <dir> [--table <dir>] [--factors <solved.json>] [--top N]
//                                                                        lint every recipe of a bench dump (GTM originals included) before and after
//                                                                        the cost-curve pass: new overflows per era with the top offenders (RF-2A)
//   node tools/analysis/capacity-lint.mjs --write-snapshot <dump dir>    rebuild capacity_snapshot.json from a bench dump's machines.json
//   node tools/analysis/capacity-lint.mjs --write-known                  rewrite capacity_known.json (only after fixing recipes; it may only shrink)
//
// Data: capacity_snapshot.json is generated from a bench dump (gg_dump.js reports, per machine, its item handlers and fluid tanks as
// [kind, io, count, capacity] and, per recipe type, its max IO). Refresh after a GTM or machine-set change:
//   powershell -File tools\analysis\Invoke-Reachability.ps1 -Tier max -PackDir <copy of pack> -OutDir <out>   (bench; dump in <out>\dump)
//   node tools/analysis/capacity-lint.mjs --write-snapshot <out>\dump
// Rules and GTM 7.5.3 sources: tools/analysis/lib/capacity.mjs (header). Recipe tier = lowest tier whose voltage covers the EU/t; a recipe
// fits if a singleblock of its type at that tier (or the next one that exists) holds it, or a multiblock's hatches at tier+1 do.
// A recipe that fits only a multiblock is a warning (printed, not failing); one that fits nothing is an error.
// Ratchet: capacity_known.json lists today's errors (recipe id -> reason). T0 fails on a new error and on a fixed one still listed.
// Exit code: 0 clean, 1 new or stale entries (dump mode: an error missing from the known list, or a cost-curve overflow), 2 tool failure.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { staticDump } from './lib/kubejs_static.mjs';
import { buildSnapshot, checkRecipe } from './lib/capacity.mjs';
import { loadDump } from './lib/dump.mjs';
import { loadTables, withFactors, applyToDump, TABLE_DIR } from './lib/cost_curve.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PACK = path.resolve(here, '..', '..', 'pack');
export const SNAPSHOT_FILE = path.join(here, 'capacity_snapshot.json');
export const KNOWN_FILE = path.join(here, 'capacity_known.json');

const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeJson = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 1) + '\n');

/** Errors and warnings for the recipes: {errors: {id: reason}, warns: {id: reason}, total}. */
export function lintRecipes(recipes, snap) {
  const errors = {}, warns = {};
  let total = 0;
  for (const r of recipes) {
    if (!r.type.startsWith('gtceu:') && !snap.types[r.type]) continue;
    total++;
    const v = checkRecipe(r, snap);
    if (v.level === 'error') errors[r.id] = v.reasons.join(' | ');
    else if (v.level === 'warn') warns[r.id] = v.reasons.join(' | ');
  }
  return { errors, warns, total };
}

/** Compares the errors with the known list: {fresh: [id], stale: [id]}. */
export function diffKnown(errors, known) {
  const k = known.violations || {};
  return { fresh: Object.keys(errors).filter((id) => !(id in k)).sort(), stale: Object.keys(k).filter((id) => !(id in errors)).sort() };
}
/** Errors a rewrite would add to the known list (a rewrite may only shrink it). */
export const knownGrowthIds = (errors, known) => diffKnown(errors, known).fresh;

/** The largest consumed item count or fluid amount of a recipe json (what decides whether it overflows a slot or tank). */
function biggestInput(json) {
  let m = 0;
  const inputs = (json && json.inputs) || {};
  for (const e of inputs.item || []) { const c = e && e.content; m = Math.max(m, c && typeof c.count === 'number' ? c.count : 1); }
  for (const e of inputs.fluid || []) { const c = e && e.content; m = Math.max(m, c && typeof c.amount === 'number' ? c.amount : 0); }
  return m;
}

/**
 * What the cost curve does to capacity: lints a whole dump (GTM originals and ours) before and after the pass. A recipe the pass
 * scaled that errors afterwards but not before is an overflow, filed under the era of its key item.
 * Returns {total, before: {errors, warns}, after: {errors, warns}, byEra: {era: {selected, changed, overflows, newWarns, top: [{id, reason, biggest}]}}}.
 */
export function lintCurve(dump, tables, snap, { top = 10 } = {}) {
  const res = applyToDump(dump, tables);
  const before = lintRecipes([...dump.recipes.values()], snap);
  const after = lintRecipes([...res.recipes.values()], snap);
  const byEra = {};
  for (const [era, v] of Object.entries(res.byEra)) byEra[era] = { selected: v.selected, changed: v.changed, overflows: 0, newWarns: 0, top: [] };
  const eraOf = new Map(res.selected.map((s) => [s.id, s.era]));
  for (const id of res.changed.keys()) {
    const e = byEra[eraOf.get(id)];
    if (!e) continue;
    if (id in after.errors && !(id in before.errors)) {
      e.overflows++;
      e.top.push({ id, reason: after.errors[id], biggest: biggestInput(res.recipes.get(id).json) });
    } else if (id in after.warns && !(id in before.warns)) e.newWarns++;
  }
  for (const e of Object.values(byEra)) e.top = e.top.sort((a, b) => b.biggest - a.biggest || (a.id < b.id ? -1 : 1)).slice(0, top);
  return { total: after.total, before, after, byEra };
}

function dumpMain(argv, arg) {
  const factors = arg('--factors');
  const { tables, problems } = loadTables(path.resolve(arg('--table') || TABLE_DIR));
  if (problems.length) { console.log('FAIL capacity: cost-curve tables:\n  ' + problems.join('\n  ')); return 2; }
  let use = tables;
  if (factors) {
    const j = readJson(path.resolve(factors));
    if (!j.factors || typeof j.factors !== 'object') { console.log(`FAIL capacity: ${factors}: no "factors" object`); return 2; }
    use = withFactors(tables, j.factors);
  }
  const dump = loadDump(path.resolve(arg('--dump')), { log: null });
  const r = lintCurve(dump, use, readJson(SNAPSHOT_FILE), { top: Number(arg('--top')) || 10 });
  const nErr = Object.keys(r.after.errors).length;
  const known = fs.existsSync(KNOWN_FILE) ? readJson(KNOWN_FILE) : { violations: {} };
  const fresh = diffKnown(r.after.errors, known).fresh;
  const overflows = Object.values(r.byEra).reduce((a, e) => a + e.overflows, 0);
  console.log(`capacity (cost curve): ${r.total} recipes linted; errors ${Object.keys(r.before.errors).length} before, ${nErr} after; warnings ${Object.keys(r.before.warns).length} before, ${Object.keys(r.after.warns).length} after`);
  for (const [era, e] of Object.entries(r.byEra)) {
    console.log(`  ${era}: ${e.changed} scaled recipes, ${e.overflows} new overflows, ${e.newWarns} new multiblock-only`);
    for (const t of e.top) console.log(`    ${t.id} (largest input ${t.biggest}): ${t.reason}`);
  }
  // an error the known list does not carry, or any overflow the cost curve causes, fails the run (exit 1); warnings never do
  if (fresh.length || overflows) {
    console.log(`FAIL capacity: ${fresh.length} error(s) not in the known list, ${overflows} cost-curve overflow(s)`);
    for (const id of fresh.slice(0, 15)) console.log(`  NEW ${id}: ${r.after.errors[id]}`);
    return 1;
  }
  return 0;
}

function main(argv) {
  const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
  if (arg('--dump')) return dumpMain(argv, arg);
  const pack = path.resolve(arg('--pack') || DEFAULT_PACK);
  if (arg('--write-snapshot')) {
    const machines = readJson(path.join(path.resolve(arg('--write-snapshot')), 'machines.json'));
    if (!machines.capacity || !machines.recipeTypes.some((r) => r.io)) { console.log('FAIL capacity: the dump has no capacity data (gg_dump.js too old)'); return 2; }
    const snap = {
      format: 'gg-capacity-snapshot-1', note: 'Generated by capacity-lint.mjs --write-snapshot from a bench dump; do not edit by hand.',
      gtm: '7.5.3', stats: machines.capacity.stats ? { instantiated: machines.capacity.stats.instantiated, failed: machines.capacity.stats.failed } : undefined,
      ...buildSnapshot(machines)
    };
    writeJson(SNAPSHOT_FILE, snap);
    console.log(`ok capacity: snapshot written (${Object.keys(snap.types).length} recipe types, ${Object.keys(snap.singleblock).length} with singleblocks)`);
    return 0;
  }
  const snap = readJson(SNAPSHOT_FILE);
  const { dump } = staticDump(pack);
  const res = lintRecipes([...dump.recipes.values()], snap);
  if (argv.includes('--write-known')) {
    const known0 =  fs.existsSync(KNOWN_FILE) ? readJson(KNOWN_FILE) : { violations: {} };
    const grownIds = knownGrowthIds(res.errors, known0);
    const seedAt = argv.indexOf('--seed-known');
    const seedReason = seedAt >= 0 ? String(argv[seedAt + 1] || '').trim() : '';
    if (grownIds.length && !seedReason) {
      console.log(`refused: --write-known would ADD ${grownIds.length} violation(s); it may only shrink (fix the recipe, or pass --seed-known "<reason>"):`);
      for (const id of grownIds.slice(0, 15)) console.log(`  + ${id}: ${res.errors[id]}`);
      process.exit(1);
    }
    writeJson(KNOWN_FILE, { note: 'Today\'s capacity errors (recipe id -> reason). May only shrink; fix the recipe, then rerun --write-known.', violations: res.errors, ...(grownIds.length ? { seeded: [...(known0.seeded || []), { reason: seedReason, added: grownIds }] } : known0.seeded ? { seeded: known0.seeded } : {}) });
    console.log(`ok capacity: known list written (${Object.keys(res.errors).length})`);
    return 0;
  }
  const known = fs.existsSync(KNOWN_FILE) ? readJson(KNOWN_FILE) : { violations: {} };
  const d = diffKnown(res.errors, known);
  const nErr = Object.keys(res.errors).length;
  const head = `${res.total} recipes, ${nErr} known violations, ${Object.keys(res.warns).length} warnings`;
  if (d.fresh.length || d.stale.length) {
    console.log(`FAIL capacity: ${head}; ${d.fresh.length} new, ${d.stale.length} stale`);
    for (const id of d.fresh.slice(0, 15)) console.log(`  NEW ${id}: ${res.errors[id]}`);
    for (const id of d.stale.slice(0, 15)) console.log(`  STALE ${id} (fixed: remove it with --write-known)`);
    return 1;
  }
  console.log(`ok capacity: ${head}`);
  if (!argv.includes('--quiet')) for (const [id, w] of Object.entries(res.warns).slice(0, 5)) console.log(`  WARN ${id}: ${w}`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.log('FAIL capacity: tool failure: ' + (e && e.message)); process.exitCode = 2; }
}
