// T0 static check of the pack's KubeJS scripts, used by tools/Check-Fast.ps1. No Minecraft, no network.
//   node tools/analysis/check-static.mjs [--pack <dir>]
// Runs every startup, server and client script through lib/kubejs_static.mjs (Node `vm`), then checks:
//   scripts   no script throws while loading or in an event callback (syntax errors included).
//   console-error  console.error lines the stand-in logs are a ratchet against console_error_known.json (M9-20): new or stale fails.
//   layout    no recipe has more entries on a side than its type lays out (M8-04), against layout_known.json (shrink-only).
//             --write-baselines drops fixed entries; --seed-baselines "<reason>" is the only way to add (recorded in the file).
//   lang      counts the en_us keys the scripts add (English is the only language).
//   english-only  no es_es key, block, column or file anywhere under pack/kubejs (EN-1; the owner's rule: nothing in Spanish).
//   scope     no new top-level declaration in a script and no new const/let in a callback (lib/scope_rules.mjs, AF-K2 M8-15); the
//             ones that exist are counted per file in scope_baseline.json, which only shrinks: a count above it fails.
//             --scope-baseline prints the current counts as that file's JSON.
//   recipe-guard  every ServerEvents.recipes handler is registered through global.grindless.recipes (lib/recipes_guard.js) or is one try/catch (AF-K3, M8-07).
//   registry  every machine, recipe type and grindless: item/block the scripts register has an en_us name.
// Prints one line per check; problems follow (at most 8 per check). Exit 0 = clean, 1 = problems, 2 = tool failure.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { runPackScripts, spanishFindings } from './lib/kubejs_static.mjs';
import { scopeFindings } from './lib/scope_rules.mjs';
import { unguardedRecipeHandlers } from './lib/recipes_guard_rule.mjs';
import { layoutOverflows, ratchetDiff } from './lib/capacity.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const recipeId = (r) => String(r.i);
const repo = path.resolve(here, '..', '..');
const i = process.argv.indexOf('--pack');
const packDir = i > 0 ? path.resolve(process.argv[i + 1]) : path.join(repo, 'pack');
const MAX = 8;

const scopeCounts = () => {
  const counts = {};
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js')) {
        const f = scopeFindings(fs.readFileSync(p, 'utf8'));
        if (f.topLevel.length || f.callbackLexical.length) counts[path.relative(packDir, p).split(path.sep).join('/')] = { topLevel: f.topLevel.length, callbackLexical: f.callbackLexical.length };
      }
    }
  };
  for (const k of ['startup_scripts', 'server_scripts', 'client_scripts']) if (fs.existsSync(path.join(packDir, 'kubejs', k))) walk(path.join(packDir, 'kubejs', k));
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => (a < b ? -1 : 1)));
};
if (process.argv.includes('--scope-baseline')) {
  console.log(JSON.stringify(scopeCounts(), null, 2));
  process.exit(0);
}

let run;
try {
  run = runPackScripts(packDir);
} catch (e) {
  console.log('check-static: tool failure: ' + String(e && e.message ? e.message : e).slice(0, 200));
  process.exit(2);
}

const lines = [];
let failed = false;
const report = (name, problems, info) => {
  lines.push((problems.length ? 'FAIL ' : 'ok   ') + name + (info ? ': ' + info : ''));
  for (const p of problems.slice(0, MAX)) lines.push('     ' + p);
  if (problems.length > MAX) lines.push('     ... ' + (problems.length - MAX) + ' more');
  if (problems.length) failed = true;
};

const thrown = run.errors.filter((e) => e.stage !== 'console.error');
const consoleErrors = run.errors.length - thrown.length;
// kubejs_static keeps 3 stack lines, which for a SyntaxError are the location and source, not the message: re-parse for it.
const describe = (e) => {
  if (/load$/.test(e.stage)) {
    try { new vm.Script(fs.readFileSync(path.join(packDir, e.file), 'utf8'), { filename: e.file }); } catch (se) {
      if (se instanceof SyntaxError) {
        const at = String(se.stack).split('\n')[0];
        return e.file + ' [' + e.stage + '] ' + se.name + ': ' + se.message + ' (' + at + ')';
      }
    }
  }
  return e.file + ' [' + e.stage + '] ' + String(e.message).slice(0, 160);
};
report('scripts', thrown.map(describe),
  thrown.length + ' exceptions, ' + consoleErrors + ' console.error (baselined in console_error_known.json)');

// M9-20: console.error lines from the stand-in are a ratchet, not a count. Each distinct "file: message" is known (a stand-in limitation
// named in the baseline) or it fails; a known line that stopped appearing is stale and fails too, so the list can only shrink.
const consoleKey = (e) => (e.file + ': ' + String(e.message)).slice(0, 220);
const consoleKnownFile = path.join(here, 'console_error_known.json');
const consoleKnown = fs.existsSync(consoleKnownFile) ? JSON.parse(fs.readFileSync(consoleKnownFile, 'utf8')) : { known: {} };
const consoleNow = {};
for (const e of run.errors.filter((x) => x.stage === 'console.error')) consoleNow[consoleKey(e)] = (consoleNow[consoleKey(e)] || 0) + 1;
const cd = ratchetDiff(Object.keys(consoleNow), Object.keys(consoleKnown.known || {}));
const consoleProblems = [
  ...cd.fresh.map((k) => 'new console.error: ' + k),
  ...cd.stale.map((k) => 'stale (no longer logged; remove it from console_error_known.json): ' + k),
  ...Object.keys(consoleNow).filter((k) => k in (consoleKnown.known || {}) && consoleNow[k] > (consoleKnown.known[k].count || 1)).map((k) => 'console.error repeated more often than baselined: ' + k),
];
report('console-error', consoleProblems, Object.keys(consoleNow).length + ' distinct, ' + cd.fresh.length + ' new');

// M8-04: no recipe may have more entries on a side than its type lays out. Our types' layouts come from setMaxIOSize in the scripts
// (recorded by the stand-in); GTM's from the bench's capacity snapshot. Known overflows are baselined in layout_known.json (shrink-only).
const snapFile = path.join(here, 'capacity_snapshot.json');
const snapTypes = fs.existsSync(snapFile) ? JSON.parse(fs.readFileSync(snapFile, 'utf8')).types || {} : {};
const layoutOf = (typeId) => {
  const mine = run.registry.recipeTypes.get(typeId);
  if (mine && mine.maxIO && mine.maxIO.length === 4) return mine.maxIO;
  const snap = snapTypes[typeId];
  return snap && snap.io ? snap.io : null;
};
const staticRecipes = (run.docs.recipes.recipes || []).map((r) => ({ id: recipeId(r), type: r.t, json: r.j }));
const overflow = layoutOverflows(staticRecipes, layoutOf);
const layoutKnownFile = path.join(here, 'layout_known.json');
const layoutKnown = fs.existsSync(layoutKnownFile) ? JSON.parse(fs.readFileSync(layoutKnownFile, 'utf8')) : { violations: {} };
const ld = ratchetDiff(Object.keys(overflow), Object.keys(layoutKnown.violations || {}));
report('layout', [
  ...ld.fresh.map((k) => 'over the type layout: ' + k + ' (' + overflow[k] + ')'),
  ...ld.stale.map((k) => 'stale (fixed; remove it from layout_known.json): ' + k),
], Object.keys(overflow).length + ' over the layout, ' + ld.fresh.length + ' new');
const writeBaselines = process.argv.includes('--write-baselines');
const seedAt = process.argv.indexOf('--seed-baselines');
const seedReason = seedAt > 0 ? String(process.argv[seedAt + 1] || '').trim() : '';
if (writeBaselines || seedAt > 0) {
  // shrink-only (M9-09): a rewrite may drop stale entries, never add new ones; adding is --seed-baselines "<reason>", recorded in the file.
  if ((cd.fresh.length || ld.fresh.length) && !seedReason) {
    console.log(lines.join('\n'));
    console.log('refused: --write-baselines would add entries; fix them or pass --seed-baselines "<reason>"');
    process.exit(1);
  }
  const keep = (known, now) => Object.fromEntries(Object.keys(now).map((k) => [k, (known[k]) || null]));
  const seededAdd = [...cd.fresh, ...ld.fresh];
  const withSeed = (doc, prev) => (seededAdd.length ? { ...doc, seeded: [...(prev.seeded || []), { reason: seedReason, added: seededAdd }] } : prev.seeded ? { ...doc, seeded: prev.seeded } : doc);
  fs.writeFileSync(layoutKnownFile, JSON.stringify(withSeed({ note: 'Recipes with more entries on a side than their recipe type lays out (M8-04). May only shrink: fix the layout or the recipe, then rerun check-static.mjs --write-baselines.', violations: overflow }, layoutKnown), null, 1) + '\n');
  const knownOut = {};
  for (const [k, n] of Object.entries(consoleNow)) knownOut[k] = { count: n, why: (consoleKnown.known && consoleKnown.known[k] && consoleKnown.known[k].why) || seedReason };
  fs.writeFileSync(consoleKnownFile, JSON.stringify(withSeed({ note: 'console.error lines the KubeJS stand-in logs ("file: message" -> count and why). May only shrink: fix the cause, then rerun check-static.mjs --write-baselines.', known: knownOut }, consoleKnown), null, 1) + '\n');
}

const en = run.lang.en_us || {};
report('lang', [], Object.keys(en).length + ' en_us keys');
report('english-only', spanishFindings(packDir).map((f) => 'Spanish is not allowed (EN-1): ' + f), 'no es_es text, key, block or file under pack/kubejs');

const baselineFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'scope_baseline.json');
const baseline = fs.existsSync(baselineFile) ? JSON.parse(fs.readFileSync(baselineFile, 'utf8')) : {};
const scopeProblems = [];
let scopeKnown = 0;
for (const [file, c] of Object.entries(scopeCounts())) {
  const b = baseline[file] || { topLevel: 0, callbackLexical: 0 };
  scopeKnown += Math.min(b.topLevel, c.topLevel) + Math.min(b.callbackLexical, c.callbackLexical);
  if (c.topLevel > b.topLevel) scopeProblems.push(file + ': ' + c.topLevel + ' top-level declaration(s), ' + b.topLevel + ' allowed (wrap the script in an IIFE)');
  if (c.callbackLexical > b.callbackLexical) scopeProblems.push(file + ': ' + c.callbackLexical + ' const/let in a callback, ' + b.callbackLexical + ' allowed (use var; this Rhino throws on a redeclaration)');
}
report('scope', scopeProblems, scopeKnown + ' known in scope_baseline.json (only shrinks)');

const guardProblems = [];
let handlers = 0;
const walkServer = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walkServer(p);
    else if (e.name.endsWith('.js')) {
      const src = fs.readFileSync(p, 'utf8');
      handlers += (src.match(/\bServerEvents\s*\.\s*recipes\s*\(|\bglobal\.grindless\.recipes\s*\(/g) || []).length;
      for (const h of unguardedRecipeHandlers(src)) guardProblems.push(path.relative(packDir, p).split(path.sep).join('/') + ':' + h.line + ': ServerEvents.recipes handler is not guarded (register it with global.grindless.recipes(name, fn), lib/recipes_guard.js)');
    }
  }
};
if (fs.existsSync(path.join(packDir, 'kubejs', 'server_scripts'))) walkServer(path.join(packDir, 'kubejs', 'server_scripts'));
report('recipe-guard', guardProblems, handlers + ' recipe handler registrations, none unguarded (a throw in one cannot end the others)');

const named = (keys) => keys.some((k) => k in en);
const unnamed = [];
for (const m of run.registry.machines.values()) {
  if (!named(['block.' + m.id.replace(':', '.')])) unnamed.push('machine ' + m.id + ' (' + m.file + ')');
}
for (const t of run.registry.recipeTypes.values()) {
  if (!named(['gtceu.' + t.id.split(':')[1]])) unnamed.push('recipe type ' + t.id + ' (' + t.file + ')');
}
let items = 0;
for (const it of run.registry.items.values()) {
  if (!it.id.startsWith('grindless:')) continue;
  items++;
  const k = it.id.replace(':', '.');
  if (!named(['item.' + k, 'block.' + k])) unnamed.push('item ' + it.id + ' (' + it.file + ')');
}
report('registry', unnamed, run.registry.machines.size + ' machines, ' + run.registry.recipeTypes.size + ' recipe types, ' + items + ' grindless items');

console.log(lines.join('\n'));
process.exit(failed ? 1 : 0);
