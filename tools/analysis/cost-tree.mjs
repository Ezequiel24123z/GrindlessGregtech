#!/usr/bin/env node
// Cost tree of one or more targets (the cost matrix's solver and configuration), as a JSON result and a self-contained HTML page.
//
//   node tools/analysis/cost-tree.mjs --dump <dir> --preset hyperstargate --html out.html [--json out.json]
//   node tools/analysis/cost-tree.mjs --dump <dir> --target "Label=item[+item*n]" --target "One=recipe:<id>" --name X --html out.html
//
// A target is an item, a multiblock controller (its formed structure's blocks are included) or recipe:<id>. See lib/cost_tree.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDump } from './lib/dump.mjs';
import { loadTierConfig } from './lib/config.mjs';
import { globMatcher } from './lib/cost.mjs';
import { ERAS, loadEraContext, recipeEra } from './lib/era.mjs';
import { priceDump } from './cost-matrix.mjs';
import { HYPERSTARGATE_PRESET, parseTargetSpec, structureBom, cheapestOf, buildCostTree, compareRows } from './lib/cost_tree.mjs';
import { renderHtml } from './lib/cost_tree_html.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const a = { targets: [], maxNodes: 5000 };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const v = () => { if (i + 1 >= argv.length) throw new Error(`${k} needs a value`); return argv[++i]; };
    if (k === '--dump') a.dump = v();
    else if (k === '--target') a.targets.push(v());
    else if (k === '--preset') a.preset = v();
    else if (k === '--name') a.name = v();
    else if (k === '--html') a.html = v();
    else if (k === '--json') a.json = v();
    else if (k === '--max-nodes') a.maxNodes = Number(v());
    else throw new Error(`unknown argument ${k}`);
  }
  return a;
}

function describeOptions(cfg) {
  const s = cfg.settings;
  const b = cfg.base;
  const ex = cfg.excludeRecipes || {};
  const list = (x) => (x && x.length ? x.join(', ') : 'none');
  return [
    `Allocation <code>${s.allocation}</code>, byproduct chance <code>${JSON.stringify(s.chance)}</code>, 1 fluid unit = ${s.fluidUnitMb} mB.`,
    `Excluded recipe types: ${list(ex.types)}; categories: ${list(ex.categories)}; ids: ${list(ex.ids)}.`,
    `Melt rule: ${s.melt ? `a metal with no producing recipe melts from its item (${s.melt.mbPerItem} mB per item)${s.melt.always ? ', always' : ''}` : 'none'}.`,
    `Base resources: ${list(b.items)} (items); unproduced items ${list(b.unproducedItems)}; unproduced fluids ${list(b.unproducedFluids)}.`,
    `Weights: ${(b.weights || []).map((w) => `${w.match} = ${w.weight}`).join('; ') || 'all 1'}. Free resources (weight 0): ${list(b.free)}.`,
    'The tree follows the solver: ONE recipe per item (the cheapest), tag inputs take the cheapest alternative, non-consumed inputs and circuits cost nothing.',
    'The dial branch counts one dial run and its inputs; the recharge loop (spent dial charge) is not included.',
  ];
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.dump) throw new Error('--dump <dir> is required');
  const preset = args.preset === 'hyperstargate' ? HYPERSTARGATE_PRESET : null;
  if (args.preset && !preset) throw new Error(`unknown preset ${args.preset}`);
  const specs = [...(preset && !args.targets.length ? preset.targets : []), ...args.targets].map(parseTargetSpec);
  if (!specs.length) throw new Error('give --preset or at least one --target');

  const cfg = JSON.parse(fs.readFileSync(path.join(here, 'cost_matrix.json'), 'utf8'));
  const dump = loadDump(args.dump, { log: null });
  const { recipes, model, weight } = priceDump(dump, cfg);
  const ctx = loadEraContext(dump);
  const abilityItems = loadTierConfig({ tier: 'maxplus' }, path.join(here, 'tiers')).raw.partAbilities || {};
  const pick = (ids) => cheapestOf(model, ids.filter((k) => dump.items.has(k) || model.reachable(k)));

  const problems = [];
  const targets = specs.map((t) => {
    if (t.kind === 'recipe') return t;
    const entries = new Map();
    const add = (k, n) => entries.set(k, (entries.get(k) || 0) + n);
    const desc = dump.structures && dump.structures.get(t.key);
    if (desc) {
      const bom = structureBom(desc, abilityItems, pick);
      for (const [k, n] of bom.items) add(k, n);
      for (const p of bom.problems) problems.push(`${t.key}: ${p}`);
    } else add(t.key, 1);
    for (const e of t.extras) add(e.key, e.qty);
    return { ...t, entries: [...entries].map(([key, qty]) => ({ key, qty })) };
  });

  const res = buildCostTree({
    model, weight, recipes, targets, name: args.name || (preset && !args.targets.length ? preset.name : 'Total'),
    fluidUnitMb: cfg.settings.fluidUnitMb, maxNodes: args.maxNodes, allocation: cfg.settings.allocation, chance: cfg.settings.chance,
    noShare: globMatcher(cfg.base.noShareOutputs),
    eraOf: (r) => ERAS[recipeEra(r, ctx)] ?? '-',
    machineOf: (type) => (ctx.mbOfType.get(type) || [])[0] || type,
  });
  res.checks.problems.push(...problems);

  const comparison = preset ? compareRows(res, preset) : [];
  const S = res.summary;
  console.log(`${res.name}: crafts ${Math.round(S.crafts)}, EU ${S.eu.toExponential(3)}, types ${S.recipeTypes}, items ${S.distinctItems} (${S.craftedItems} crafted, ${S.baseItems} base), creative ${S.creativeItems}`);
  console.log(`consistency ${res.consistency.ok ? 'ok' : 'MISMATCH'}; unreachable ${res.checks.unreachable.length}; cycles ${res.checks.cycles.length}; problems ${res.checks.problems.length}; solver ${res.checks.solver.converged ? 'converged' : 'NOT converged'}`);
  for (const c of comparison) console.log(`  ${c.flag ? '!' : ' '} ${c.id.padEnd(10)} ${String(c.value === null ? '-' : Number(c.value.toPrecision(4))).padStart(12)} docs ${c.docs}${c.gap === null ? '' : ` (${(100 * c.gap).toFixed(1)}%)`}`);
  for (const p of res.checks.problems.slice(0, 10)) console.log(`  problem: ${p}`);

  if (args.json) fs.writeFileSync(args.json, JSON.stringify({ ...res, comparison }));
  if (args.html) {
    fs.writeFileSync(args.html, renderHtml(res, {
      comparison, options: describeOptions(cfg), title: `${res.name}: cost tree`,
      subtitle: `${targets.map((t) => t.label).join(' + ')} - one recipe per item (the solver's cheapest), generated by tools/analysis/cost-tree.mjs`,
    }));
  }
}

try { main(); } catch (e) { console.error(`cost-tree: ${e.message}`); process.exit(1); }
