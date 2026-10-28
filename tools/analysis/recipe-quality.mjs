// Recipe quality gate (lib/recipe_quality.mjs): our controllers, multiblock parts, hatches, single blocks and high-tier components must
// climb the ladder in docs/quality/recipes.md instead of being crafting-table recipes.
//
//   node tools/analysis/recipe-quality.mjs [--pack pack] [--facts file] [--json out.json] [--md] [--write-baseline] [--quiet]
//
// Reads the pack's scripts in the static KubeJS stand-in (no Minecraft). --facts reuses a facts file written by a previous run
// (the stand-in takes a few minutes; default tools/analysis/out/recipe_quality_facts.json is written on every run).
// Exit code: 0 no new violations and no stale baseline entries, 1 otherwise, 2 tool failure.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { staticDump } from './lib/kubejs_static.mjs';
import { baselineOf, compareBaseline, evaluate, extractFacts, renderText, TIER_NAMES } from './lib/recipe_quality.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_CONFIG = path.join(here, 'recipe_quality.json');
export const DEFAULT_PACK = path.resolve(here, '..', '..', 'pack');
const DEFAULT_FACTS = path.join(here, 'out', 'recipe_quality_facts.json');

export const loadConfig = (file = DEFAULT_CONFIG) => JSON.parse(fs.readFileSync(file, 'utf8'));

export function factsFromPack(pack = DEFAULT_PACK) {
  const { dump, run } = staticDump(pack);
  return extractFacts({ recipes: dump.recipes, recipeFiles: run.recipeFiles, registry: run.registry, structures: dump.structures });
}

/** Best-effort file:line of the recipe: its id, the id's tail, the output's tail, or the line that builds `grindless:crafting/`. */
export function locate(findings, pack = DEFAULT_PACK) {
  const cache = new Map();
  const lines = (file) => {
    if (!cache.has(file)) {
      const p = path.join(pack, file);
      cache.set(file, fs.existsSync(p) ? fs.readFileSync(p, 'utf8').split(/\r?\n/) : []);
    }
    return cache.get(file);
  };
  for (const f of findings) {
    if (!f.file) continue;
    const ls = lines(f.file);
    const tail = (s) => s.replace(/^.*[:/]/, '');
    const probes = [f.recipe, tail(f.recipe), tail(f.output), f.recipe.replace(/[^/]*$/, '')];
    let at = 0;
    for (const p of probes) {
      if (!p || p.length < 3) continue;
      const i = ls.findIndex((l) => l.includes(p));
      if (i >= 0) { at = i + 1; break; }
    }
    f.line = at || 1;
  }
  return findings;
}

function arg(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : null;
}

function main(argv) {
  const pack = arg(argv, '--pack') || DEFAULT_PACK;
  const factsFile = arg(argv, '--facts');
  let facts;
  if (factsFile) facts = JSON.parse(fs.readFileSync(factsFile, 'utf8'));
  else {
    facts = factsFromPack(pack);
    fs.mkdirSync(path.dirname(DEFAULT_FACTS), { recursive: true });
    fs.writeFileSync(DEFAULT_FACTS, JSON.stringify(facts));
  }
  const cfg = loadConfig();
  const findings = locate(evaluate(facts, cfg), pack);
  if (argv.includes('--write-baseline')) {
    const { baseline, ...rest } = cfg;
    cfg.baseline = baselineOf(findings);
    const body = Object.entries(cfg.baseline).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n');
    const head = JSON.stringify(rest, null, 1).replace(/\n}$/, '');
    fs.writeFileSync(DEFAULT_CONFIG, `${head},\n "baseline": {\n${body}\n }\n}\n`);
    process.stdout.write(`baseline: ${Object.keys(cfg.baseline).length} recipe/output pairs\n`);
    return 0;
  }
  const { fresh, stale } = compareBaseline(findings, cfg.baseline || {});
  const jsonOut = arg(argv, '--json');
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ findings, fresh, stale }, null, 1));
  if (argv.includes('--md')) {
    for (let t = 0; t < TIER_NAMES.length; t++) {
      const list = findings.filter((f) => f.tier === t);
      if (list.length === 0) continue;
      process.stdout.write(`\n### ${TIER_NAMES[t]}\n\n| Output | Class | Now | Missing | File:line |\n|---|---|---|---|---|\n`);
      const groups = new Map();
      for (const f of list) { const k = f.recipe + '|' + f.output; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(f); }
      for (const g of groups.values()) {
        const f = g[0];
        const at = f.file ? f.file.replace('kubejs/server_scripts/grindless/', '') + ':' + f.line : '?';
        process.stdout.write(`| \`${f.output.replace(/^gtceu:/, '')}\` | ${f.cls} | ${f.form}${f.research ? '+' + f.research : ''} | ${g.map((x) => x.code).join(' ')} | ${at} |\n`);
      }
    }
  } else if (!argv.includes('--quiet')) process.stdout.write(renderText(findings, { fresh, stale }) + '\n');
  return fresh.length + stale.length > 0 ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { process.stderr.write(String(e && e.stack || e) + '\n'); process.exitCode = 2; }
}
