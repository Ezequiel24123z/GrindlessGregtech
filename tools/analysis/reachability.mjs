#!/usr/bin/env node
// Static progression validator for Gregtech Grindless.
// Usage:  node tools/analysis/reachability.mjs --tier steam --dump <folder with recipes.json, tags.json, items.json ...>
// No dependencies; Node >= 18. Exit 0 = PASS, 1 = FAIL, 2 = usage/data error.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTierConfig } from './lib/config.mjs';
import { loadDump } from './lib/dump.mjs';
import { buildModel } from './lib/model.mjs';
import { runPasses } from './lib/analyze.mjs';
import { analyze, renderText, summaryParts, toJson } from './lib/report.mjs';
import { ERA_IDS, hiddenTable, obtainToJson, renderHiddenTable, renderObtainMarkdown, renderObtainText, runObtain } from './lib/obtain.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const PASSES = ['both', 'gate', 'auto', 'eras', 'obtain'];

function usage() {
  return `Usage: node reachability.mjs --tier <steam|lv|mv|hv|next/hv> --dump <folder> [options]
       node reachability.mjs --pass obtain --dump <folder> [--md <file>] [--table <file>] [--implemented <era>]
  --tier <name>       config in tiers/<name>.json (or --config <path>); next/<tier> = the next version's prepared layer
  --dump <folder>     gg_dump dump (recipes.json, tags.json, items.json, machines.json, veins.json, fluid_veins.json, config.json)
  --pass <both|gate|auto|eras|obtain>   which step to run (default both = all three: gate, auto, and the era rule;
                      obtain = audit of what is never obtained, using tiers/obtain.json if the tier has no "obtain" section)
  --dimension <id|all>  dimension where the factory is (default the tier's, Overworld); "all" = every one in \`contexts\`
  --out <file>        saves the text report in addition to printing it
  --json <file>       saves the result as JSON
  --md <file>         (obtain) saves the report in Markdown: a table by class, the full A list, and the compact B and C ones
  --table <file>      (obtain) writes the pack's hidden table (kubejs/data/grindless/tables/hidden_until.json): B groups with
                      their era and C with the recipes to remove; keeps the recipes the file already removed
  --implemented <era> (obtain) era up to which the pack is implemented (IMPLEMENTED_ERA from integration/hidden.js), to check
                      that every C and later B is hidden; defaults to the dump's (info.json: hidden.implementedEra)
  --explain <text>    prints the derivation of targets whose id/name contains the text (even if they give PASS)
  --verbose           prints the derivation of every target
  --quiet             only the verdict and summary
`;
}

function parseArgs(argv) {
  const o = { pass: 'both' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--tier') o.tier = next();
    else if (a === '--config') o.config = next();
    else if (a === '--dump') o.dump = next();
    else if (a === '--pass') o.pass = next();
    else if (a === '--dimension') o.dimension = next();
    else if (a === '--out') o.out = next();
    else if (a === '--json') o.json = next();
    else if (a === '--md') o.md = next();
    else if (a === '--table') o.table = next();
    else if (a === '--implemented') o.implemented = next();
    else if (a === '--explain') o.explain = next();
    else if (a === '--verbose') o.verbose = true;
    else if (a === '--quiet') o.quiet = true;
    else if (a === '-h' || a === '--help') o.help = true;
    else throw new Error(`unknown argument: ${a}`);
  }
  return o;
}

function loadConfig(o) {
  return loadTierConfig(o, path.join(here, 'tiers'));
}

/** Dimensions to check: the given one, or with "all" the tier's (`contexts`). */
function contextsOf(o, raw) {
  const home = raw.dimension || 'minecraft:overworld';
  if (o.dimension === 'all') return raw.contexts && raw.contexts.length > 0 ? raw.contexts : [home];
  return [o.dimension || home];
}

function runContext(raw, dump, o, dimension, file) {
  const t0 = Date.now();
  const model = buildModel(dump, { ...raw, dimension });
  const res = runPasses(model);
  const out = analyze(model, res, { verbose: o.verbose, explain: o.explain, pass: o.pass });
  const text = renderText(model, res, out, { pass: o.pass });
  const header = `Config  : ${file}\n`;
  const body = o.quiet ? text.split('\n').filter((l) => /^(===|Context|VERDICT|STEP|  (FAIL|WARN) )/.test(l)).join('\n') + '\n' : text;
  return { dimension, model, res, out, body: body.replace(/\n(Model {3}:)/, `\n${header}$1`), ms: Date.now() - t0 };
}

/**
 * obtain step: audit of what is never obtained (lib/obtain.mjs). Uses the tier's "obtain" section or, if it has none,
 * tiers/obtain.json. Exit 0 = everything classified and the pack's hiding matches (PASS), 1 = there are unclassified groups,
 * something hidden that's obtainable, or something that should be hidden and is visible (FAIL).
 */
function mainObtain(o, loaded) {
  const { raw, file } = loaded && loaded.raw.obtain ? loaded : loadTierConfig({ tier: 'obtain' }, path.join(here, 'tiers'));
  const dumpDir = path.resolve(o.dump);
  const dump = loadDump(dumpDir);
  if (o.implemented && !ERA_IDS.includes(o.implemented)) throw new Error(`--implemented ${o.implemented} isn't an era (${ERA_IDS.join(', ')})`);
  const res = runObtain(dump, raw, { implementedEra: o.implemented });
  const full = renderObtainText(res, file);
  const keep = (l) => /^(===|Config|Audited|CLASS|[ABC?] +\d|Hidden in the pack|  obtainable but|  should be|VERDICT)/.test(l);
  const text = o.quiet ? full.split('\n').filter(keep).join('\n') + '\n' : full;
  process.stdout.write(text);
  if (o.out) fs.writeFileSync(path.resolve(o.out), text, 'utf8');
  if (o.json) fs.writeFileSync(path.resolve(o.json), JSON.stringify(obtainToJson(res), null, 2), 'utf8');
  if (o.md) {
    const ob = raw.obtain || {};
    const md = renderObtainMarkdown(res, {
      dump: dumpDir, date: new Date().toISOString().slice(0, 10), namespaces: (ob.audit || []).join(', '),
      dimensions: ob.reachableDimensions,
    });
    fs.writeFileSync(path.resolve(o.md), md, 'utf8');
  }
  if (o.table) {
    // the pack's hidden table: merged with the existing one (keeps the recipes already removed from groups that are still C)
    const file = path.resolve(o.table);
    const previous = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
    const parts = dumpDir.split(/[\\/]/);
    const run = parts.indexOf('test-runs') >= 0 ? parts[parts.indexOf('test-runs') + 1] : parts[parts.length - 1];
    const table = hiddenTable(res, { previous, dump: run, date: new Date().toISOString().slice(0, 10) });
    fs.writeFileSync(file, renderHiddenTable(table), 'utf8');
    process.stdout.write(`Hidden table: ${file} (${table.groups.length} groups; ${table.groups.filter((x) => x.until === 'never').reduce((n, x) => n + x.removeRecipes.length, 0)} recipes to remove)\n`);
  }
  process.exit(res.verdict === 'PASS' ? 0 : 1);
}

function main() {
  const o = parseArgs(process.argv.slice(2));
  if (!PASSES.includes(o.pass)) throw new Error(`--pass ${o.pass} isn't valid (${PASSES.join(', ')})`);
  if (o.help || (!o.tier && !o.config && o.pass !== 'obtain') || !o.dump) {
    process.stdout.write(usage());
    process.exit(o.help ? 0 : 2);
  }
  const loaded = o.tier || o.config ? loadConfig(o) : null;
  // an audit config (an "obtain" section, e.g. tiers/obtain.json) only has that step
  if (o.pass === 'obtain' || (o.pass === 'both' && loaded && loaded.raw.obtain)) {
    mainObtain(o, loaded);
    return;
  }
  const { raw, file } = loaded;
  const dump = loadDump(path.resolve(o.dump));
  const runs = contextsOf(o, raw).map((d) => runContext(raw, dump, o, d, file));
  let text = '';
  for (const r of runs) {
    text += r.body;
    text += `(analysis in ${r.ms} ms)\n`;
  }
  const verdict = runs.every((r) => r.out.verdict === 'PASS') ? 'PASS' : 'FAIL';
  if (runs.length > 1) {
    text += '\nSUMMARY BY DIMENSION\n';
    for (const r of runs) text += `  ${r.dimension.padEnd(22)} ${r.out.verdict}  (${summaryParts(r.out, o.pass).join(' · ')})\n`;
    text += `OVERALL VERDICT: ${verdict}\n`;
  }
  process.stdout.write(text);
  if (o.out) fs.writeFileSync(path.resolve(o.out), text, 'utf8');
  if (o.json) {
    const one = (r) => ({ dimension: r.dimension, ...toJson(r.model, r.res, r.out) });
    const doc = runs.length === 1 ? one(runs[0]) : { tier: runs[0].model.cfg.tier, verdict, contexts: runs.map(one) };
    fs.writeFileSync(path.resolve(o.json), JSON.stringify(doc, null, 2), 'utf8');
  }
  process.exit(verdict === 'PASS' ? 0 : 1);
}

try {
  main();
} catch (e) {
  process.stderr.write(`ERROR: ${e.message}\n`);
  process.exit(2);
}
