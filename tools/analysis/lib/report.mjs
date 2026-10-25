// Text and JSON report.
import { blockedRoots, blockedRuleTree, blockedTree, derivationTree, describeRule, keyName, machinelessTree, renderTree } from './explain.mjs';
import { blockerFor, evalTarget, STATUS } from './analyze.mjs';
import { evaluateEras } from './eras.mjs';
import { asArray, sortedEntries } from './util.mjs';

const MARK = { PASS: 'PASS', FAIL: 'FAIL', WARN: 'WARN' };

const rootLabel = (g, k, why) => (keyName(g, k).startsWith('dead:') ? why.text : `${keyName(g, k)} (${why.text})`);

/** Of several candidate recipes, the one closest to being doable (lowest unlock cost). */
function closestRule(model, cache, res, mode, rules, view) {
  const bl = blockerFor(model, res, mode, cache, view);
  let best = rules[0];
  let bestCost = Infinity;
  for (const r of rules) {
    let c = 0;
    for (const slot of model.g.rules[r].slots) {
      if (slot.alts.some((a) => bl.mask[a] === 1)) continue;
      if (slot.cap && bl.capMask && slot.alts.some((a) => bl.capMask[a] === 1)) continue;
      let m = Infinity;
      for (const a of slot.alts) if (bl.cost[a] < m) m = bl.cost[a];
      c += m;
    }
    if (c < bestCost) {
      bestCost = c;
      best = r;
    }
  }
  return best;
}

function verdictOf(result, mode) {
  const allowFinite = !!result.target.allowFinite;
  if (result.ok) return MARK.PASS;
  // an optional target that isn't met gets a warning (WARN) but doesn't sink the verdict
  if (result.target.optional) return MARK.WARN;
  if (mode === 'auto' && result.status === STATUS.FINITE) return allowFinite ? MARK.PASS : MARK.WARN;
  return MARK.FAIL;
}

const blocking = (r) => r.verdict === MARK.FAIL || (r.verdict === MARK.WARN && !r.target.optional);

const STATUS_TEXT = {
  [STATUS.SUSTAINED]: 'regenerates on its own',
  [STATUS.FINITE]: 'only with a finite source (runs out)',
  [STATUS.BOOTSTRAP]: 'only thanks to the manual bootstrap; not resupplied',
  [STATUS.MANUAL]: 'only by hand-gathering it; no machine resupplies it',
  [STATUS.UNREACHABLE]: "can't be obtained",
};

function targetTitle(model, result) {
  const t = result.target;
  const keys = result.key !== null && result.key !== undefined && result.key >= 0 ? keyName(model.g, result.key) : '';
  const without = t.without && t.without.length > 0 ? `  [without ${t.without.join(', ')}]` : '';
  return `${t.label || t.id}${keys && t.label !== keys ? ` (${keys})` : ''}${without}`;
}

const WHY_TEXT = {
  'no-machine': (n) => `${n} with no registered machine to run them`,
  eut: (n, t) => `${n} above ${t.maxEUt} EU/t`,
  inputs: (n) => `${n} with some unreachable input or condition`,
};

/** Lines for the result of a leak check on recipes (expect + type/recipe, with or without machineless). */
function negativeRecipeLines(model, res, r, mode, view) {
  const g = model.g;
  const t = r.target;
  const L = [];
  const scope = [t.type ? `of type ${t.type}` : '', t.recipe ? `with id ${asArray(t.recipe).join(' | ')}` : '', t.output ? `that produce ${t.output}` : '']
    .filter(Boolean).join(' ');
  if (r.verdict === MARK.PASS) {
    if (r.defined.length === 0) {
      L.push(`there's no recipe ${scope} in the pack (removed or never existed), as it should be`);
      return L;
    }
    const why = Object.entries(r.why).map(([k, n]) => (WHY_TEXT[k] ? WHY_TEXT[k](n, t) : `${n} ${k}`));
    L.push(`${r.defined.length} recipe(s) ${scope} exist but none can be used in this tier${why.length > 0 ? ` (${why.join('; ')})` : ''}, as it should be`);
    return L;
  }
  L.push(`LEAK: ${r.hits.length} recipe(s) ${scope} can be used in this tier and shouldn't be: ${describeRule(g, r.hits[0])}${r.hits.length > 1 ? ` (+${r.hits.length - 1} more)` : ''}`);
  const lf = mode === 'gate' ? view.gate : view.susInf.G;
  const tree = t.machineless
    ? machinelessTree(model, lf, r.hits[0], mode === 'auto' ? res.gate.reached : null)
    : derivationTree(model, lf, null, undefined, r.hits[0]);
  L.push(...renderTree(model, tree, { prefix: '    ', levels: mode === 'gate' }).map((l) => '  ' + l));
  if (t.machineless) {
    const runners = model.runnersOf(g.rules[r.hits[0]].type);
    L.push(`  (only blocked because none of the registered machines that run it can be built: ${runners.slice(0, 4).join(', ')}${runners.length > 4 ? ' …' : ''})`);
  }
  return L;
}

/** Lines for a static site check (`kind: "site"`). */
function siteLines(model, r) {
  const t = r.target;
  const scope = [[...asArray(t.type), ...asArray(t.types)].join(', '), t.recipe ? `id ${asArray(t.recipe).join(' | ')}` : ''].filter(Boolean).join(', ');
  const where = asArray(t.dimensions).join(' or ');
  if (r.defined.length === 0) return [`there's no recipe of ${scope} in the pack (misspelled type or id?)`];
  const free = r.unconditioned > 0 ? `; ${r.unconditioned} allowed to run anywhere (${asArray(t.allowAnywhere).join(', ')})` : '';
  if (r.offenders.length === 0) return [`all ${r.defined.length} recipe(s) of ${scope} only run in ${where}${t.exact ? ' (each names all of them)' : ''}${free}`];
  const L = [`${r.offenders.length} of ${r.defined.length} recipe(s) of ${scope} don't keep to ${where}${free}:`];
  for (const o of r.offenders.slice(0, 12)) L.push(`  · ${model.g.rules[o.rule].name}: ${o.why}`);
  if (r.offenders.length > 12) L.push(`  … +${r.offenders.length - 12} more`);
  return L;
}

function evaluateAll(model, res, targets, mode, cache, opts) {
  const out = [];
  for (const t of targets) {
    const r = evalTarget(model, res, t, mode);
    r.verdict = verdictOf(r, mode);
    r.lines = [];
    const g = model.g;
    const view = r.view || res;
    if (r.kind === 'site') {
      r.lines.push(...siteLines(model, r));
      out.push(r);
      continue;
    }
    if (r.negative && r.kind === 'recipe') {
      // leak of a recipe (or a recipe type): PASS if no match can be used in this tier
      r.lines.push(...negativeRecipeLines(model, res, r, mode, view));
      out.push(r);
      continue;
    }
    if (r.negative) {
      // leak check (expect: "unreachable" in the gate, "not-automatic" in auto)
      if (r.verdict === MARK.PASS) {
        r.lines.push(mode === 'gate'
          ? "can't be obtained in this tier, as it should be"
          : `doesn't produce itself, as it should be (${STATUS_TEXT[r.status] || r.status})`);
      } else if (mode === 'gate') {
        r.lines.push("LEAK: it can be obtained in this tier and shouldn't be. Here's how:");
        const tree = derivationTree(model, view.gate, r.key);
        r.lines.push(...renderTree(model, tree, { prefix: '    ', levels: true }).map((l) => '  ' + l));
      } else {
        r.lines.push("LEAK: it produces itself and shouldn't. Here's how:");
        const tree = derivationTree(model, r.status === STATUS.SUSTAINED ? view.susInf.G : view.susAll.G, r.key);
        r.lines.push(...renderTree(model, tree, { prefix: '    ' }).map((l) => '  ' + l));
      }
      out.push(r);
      continue;
    }
    if (r.verdict === MARK.PASS) {
      if (r.kind === 'recipe') {
        const first = r.hits[0];
        r.lines.push(`usable recipe: ${describeRule(g, first)}${r.hits.length > 1 ? ` (+${r.hits.length - 1} more)` : ''}`);
      } else if (r.key !== null && mode === 'gate' && view.gate.via[r.key] >= 0) {
        r.lines.push(`level ${view.gate.level[r.key]} · ${describeRule(g, view.gate.via[r.key])}`);
      } else if (r.key !== null && mode === 'auto') {
        const sr = view.susInf.supportRule[r.key];
        r.lines.push(sr >= 0 ? `sustained with ${describeRule(g, sr)}` : 'permanent world resource');
      } else if (r.key !== null) r.lines.push('world resource');
      if (opts.verbose || (opts.explain && matches(opts.explain, t, model, r))) {
        const G = mode === 'gate' ? view.gate : view.susInf.G;
        const tree = r.kind === 'recipe' ? derivationTree(model, G, null, undefined, r.hits[0]) : derivationTree(model, G, r.key);
        r.lines.push(...renderTree(model, tree, { prefix: '    ', levels: mode === 'gate' }).map((l) => '  ' + l));
      }
    } else {
      r.lines.push(STATUS_TEXT[r.status] || '');
      if (t.optional) r.lines.push("(optional target: a warning, but it doesn't sink the verdict)");
      if (r.kind === 'recipe') {
        const near = r.defined.length > 0 ? closestRule(model, cache, res, mode, r.defined, view) : -1;
        if (r.defined.length === 0) {
          const withInput = t.input ? ' with input ' + asArray(t.input).join(' + ') : '';
          const inDim = t.dimension ? ` (valid in ${t.dimension})` : '';
          r.lines.push(`there's no recipe ${t.type ? 'of type ' + t.type : 'with id ' + asArray(t.recipe).join(' | ')}${t.type && t.recipe ? ' with id ' + asArray(t.recipe).join(' | ') : ''}${t.output ? ' that produces ' + t.output : ''}${withInput}${inDim} in the pack`);
        } else r.lines.push(`there are ${r.defined.length} recipe(s) of that type, but none can be completed (the closest: ${describeRule(g, near)})`);
        if (near >= 0) {
          const bl = blockerFor(model, res, mode, cache, view);
          const tree = blockedRuleTree(model, bl, near);
          r.lines.push(...renderTree(model, tree, { prefix: '    ' }).map((l) => '  ' + l));
          const roots = [...blockedRoots(tree)].map(([k, why]) => rootLabel(g, k, why));
          if (roots.length > 0) r.lines.push('  missing roots: ' + roots.slice(0, 6).join(' ; ') + (roots.length > 6 ? ' …' : ''));
        }
      } else if (r.key !== null && r.key !== undefined) {
        if (mode === 'auto' && r.status === STATUS.FINITE) {
          // There's a route, but it depends on a source that runs out: show the route, then what's missing to sustain it.
          const route = derivationTree(model, view.susAll.G, r.key);
          r.lines.push(...renderTree(model, route, { prefix: '    ' }).map((l) => '  ' + l));
        }
        const bl = blockerFor(model, res, mode, cache, view);
        const tree = blockedTree(model, bl, r.key);
        if (mode === 'auto' && r.status === STATUS.FINITE) r.lines.push('  to sustain it, missing:');
        r.lines.push(...renderTree(model, tree, { prefix: '    ' }).map((l) => '  ' + l));
        const roots = [...blockedRoots(tree)].map(([k, why]) => rootLabel(g, k, why));
        if (roots.length > 0) r.lines.push('  missing roots: ' + roots.slice(0, 6).join(' ; ') + (roots.length > 6 ? ' …' : ''));
      } else if (r.empty) {
        r.lines.push("the target doesn't resolve to any item (misspelled id, or empty tag?)");
      }
    }
    out.push(r);
  }
  return out;
}

function matches(needle, t, model, r) {
  const n = needle.toLowerCase();
  return (t.id || '').toLowerCase().includes(n) || (t.label || '').toLowerCase().includes(n) ||
    (r.key !== null && r.key !== undefined && keyName(model.g, r.key).toLowerCase().includes(n));
}

/** Passes that run: `both` (default) = gate, auto and eras; or just `gate`, `auto` or `eras`. */
export function passesOf(pass = 'both') {
  return { gate: pass === 'both' || pass === 'gate', auto: pass === 'both' || pass === 'auto', eras: pass === 'both' || pass === 'eras' };
}

export function analyze(model, res, opts = {}) {
  const cache = new Map();
  const run = passesOf(opts.pass);
  const gate = run.gate ? evaluateAll(model, res, model.cfg.targets, 'gate', cache, opts) : [];
  const auto = run.auto ? evaluateAll(model, res, model.cfg.autoTargets, 'auto', cache, opts) : [];
  const eras = run.eras ? evaluateEras(model, res) : null;
  const count = (arr, v) => arr.filter((x) => x.verdict === v).length;
  const verdict = gate.some(blocking) || auto.some(blocking) || (eras && eras.verdict === 'FAIL') ? 'FAIL' : 'PASS';
  return {
    gate, auto, eras, verdict,
    counts: {
      gate: { pass: count(gate, 'PASS'), warn: count(gate, 'WARN'), total: gate.length },
      auto: { pass: count(auto, 'PASS'), warn: count(auto, 'WARN'), total: auto.length },
      eras: eras && eras.active ? eras.counts : { pass: 0, warn: 0, total: 0 },
    },
  };
}

export function renderText(model, res, out, opts = {}) {
  const { cfg, dump, g } = model;
  const L = [];
  const modInfo = (dump.info && dump.info.mods ? dump.info.mods : []).filter((m) => /^(gtceu|kubejs|rhino|ae2)@/.test(m)).join(' ');
  L.push(`=== Static progression validation · tier "${cfg.tier}"${cfg.title ? ' (' + cfg.title + ')' : ''} ===`);
  L.push(`Dump    : ${dump.dir}`);
  L.push(`          ${dump.recipes.size} recipes · ${dump.items.size} items · ${dump.fluids.size} fluids · ${dump.tags.itemTags.size} item tags${modInfo ? ' · ' + modInfo : ''}`);
  L.push(`Model   : ${g.rules.length} rules · ${g.nKeys} resources · world: ${model.facts.manual.length} by hand, ${model.facts.auto.length} fixed, ${model.facts.bootstrap.length} bootstrap`);
  const added = [...dump.recipes.values()].filter((r) => r.added).length;
  // the recipe types the pack registers (startup_scripts/grindless/**: GTCEuStartupEvents.registry('gtceu:recipe_type'))
  const OUR_TYPES = [
    'gtceu:vein_drilling', 'gtceu:greenhouse', 'gtceu:coking', 'gtceu:steelmaking',
    'gtceu:sulfide_roasting', 'gtceu:arc_smelting', 'gtceu:solar_steam', 'gtceu:creature_simulation', 'gtceu:stargazing', 'gtceu:astrophotography',
    'gtceu:ore_processing', 'gtceu:bio_distillation', 'gtceu:radio_astronomy', 'gtceu:static_fire', 'gtceu:weather_control',
    'gtceu:refining', 'gtceu:reforming', 'gtceu:syngas', 'gtceu:composite_curing', 'gtceu:lunar_drilling',
    'gtceu:pgm_refining', 'gtceu:regolith_processing', 'gtceu:cryogenic_processing', 'gtceu:lunar_solar', 'gtceu:deep_space_tracking',
    'gtceu:atmosphere_processing', 'gtceu:solvent_extraction', 'gtceu:combined_cycle', 'gtceu:hot_rolling',
  ];
  const typesWithRecipes = new Set([...dump.recipes.values()].map((r) => r.type));
  L.push(`          ${added} recipes added by the pack's scripts · the pack's own types with recipes: ${OUR_TYPES.filter((t) => typesWithRecipes.has(t)).join(', ') || '(none: neither vein_drilling nor greenhouse)'}`);
  L.push(`Context : the factory is in dimension ${cfg.contextDimension}`);
  if (model.warnings.length > 0) {
    L.push('');
    L.push(`CONFIG WARNINGS (${model.warnings.length})`);
    for (const w of model.warnings.slice(0, opts.maxWarnings || 20)) L.push('  - ' + w);
    if (model.warnings.length > (opts.maxWarnings || 20)) L.push(`  … +${model.warnings.length - (opts.maxWarnings || 20)} more`);
  }
  const section = (title, list, counts) => {
    L.push('');
    L.push(`${title}   [${counts}]`);
    for (const r of list) {
      L.push(`  ${r.verdict}  ${targetTitle(model, r)}${r.verdict === 'PASS' && r.lines.length > 0 ? '  ·  ' + r.lines[0] : ''}`);
      const rest = r.verdict === 'PASS' ? r.lines.slice(1) : r.lines;
      for (const l of rest) L.push('        ' + l);
    }
  };
  const run = passesOf(opts.pass);
  if (run.gate) {
    section('STEP 1 · GATE — hand-gathering is allowed to start', out.gate,
      `${out.counts.gate.pass}/${out.counts.gate.total} PASS${out.counts.gate.warn ? `, ${out.counts.gate.warn} warnings` : ''}`);
  }
  if (run.auto) {
    section('STEP 2 · AUTO — no hand-gathering except the declared bootstrap', out.auto,
      `${out.counts.auto.pass}/${out.counts.auto.total} PASS${out.counts.auto.warn ? `, ${out.counts.auto.warn} warnings (finite or optional source)` : ''}`);
  }
  if (run.eras && out.eras && out.eras.active) {
    const e = out.eras;
    L.push('');
    L.push(`STEP 3 · ERAS — nothing from an era needs a resource that comes from a later era   [${e.counts.pass}/${e.counts.total} PASS${e.counts.warn ? `, ${e.counts.warn} warnings` : ''}]`);
    L.push('  resources per era (removed from every source: veins, byproducts, bees, addons, and the sources of its dimension):');
    for (const r of e.resources) {
      const what = [];
      if (r.keys > 0) what.push(`${r.keys} items and fluids`);
      if (r.dims.length > 0) what.push(`dimension ${r.dims.join(', ')}${r.sources.length > 0 ? ` (world sources: ${r.sources.join(', ')})` : ''}`);
      if (r.onlyFrom.length > 0) what.push(`only from ${r.onlyFrom.join(', ')}`);
      L.push(`    ${r.era.padEnd(5)} ${r.label}: ${what.join(' · ') || '(none)'}`);
    }
    for (const x of e.groups) {
      L.push(`  ${x.verdict}  ${x.group.era}: ${x.group.label}${x.verdict === 'PASS' ? '  ·  ' + x.lines[0] : ''}`);
      for (const l of x.verdict === 'PASS' ? x.lines.slice(1) : x.lines) L.push('        ' + l);
    }
    for (const x of e.exclusive) {
      L.push(`  ${x.verdict}  ${x.resource.era}: ${x.resource.label} only comes from ${x.resource.onlyFrom.join(', ')}${x.verdict === 'PASS' ? '  ·  ' + x.lines[0] : ''}`);
      for (const l of x.verdict === 'PASS' ? x.lines.slice(1) : x.lines) L.push('        ' + l);
    }
  }
  L.push('');
  L.push('NOTES');
  const dead = sortedEntries(model.stats.deadByType).slice(0, 8);
  if (dead.length > 0) L.push('  - recipe types with no usable machine in this tier (recipes): ' + dead.map(([t, n]) => `${t} ${n}`).join(', '));
  if (model.stats.emptyIngredient > 0) L.push(`  - ${model.stats.emptyIngredient} recipe inputs with no member at all (empty tag or unknown form; those recipes don't count)`);
  if (model.unresolved.length > 0) L.push('  - unresolved ingredient forms: ' + model.unresolved.slice(0, 6).join(', '));
  if (dump.tags.missing.size > 0) L.push(`  - ${dump.tags.missing.size} tags used by recipes aren't in the dump (treated as empty)`);
  if (dump.tags.empty.size > 0) L.push(`  - ${dump.tags.empty.size} tags exist but are empty in this pack`);
  if (model.stats.structureMachines > 0) L.push(`  - multiblock parts read from the pack's real pattern (structures.json): ${model.stats.structureMachineIds.join(', ')}`);
  if (model.stats.rolledMachines.length > 0) {
    const rolled = model.stats.rolledMachines.map((m) => `${m.machine} (${Number.isFinite(m.hatches) ? m.hatches : '2+'} hatch(es) of ${m.voltage} V -> ${m.maxEUt} V)`);
    L.push(`  - multiblock max voltage (GTM 7.5.3: 2 or more hatches of the same tier raise it one step): ${rolled.join(', ')}`);
  }
  if (model.stats.fluidVeins && model.stats.fluidVeins.length > 0) {
    const fv = model.stats.fluidVeins.map((v) => `${v.fluid} (${v.deposits.join(', ')})`);
    L.push(`  - fluid deposits that allow ${cfg.contextDimension}: ${fv.join(', ')}`);
  }
  if (model.stats.configRead && model.stats.configRead.length > 0) {
    L.push(`  - GTM config read from the dump: ${model.stats.configRead.map((c) => `${c.key}=${c.value}`).join(', ')}`);
  }
  if (model.stats.partsNotRequired.length > 0) {
    const byWhy = new Map();
    for (const p of model.stats.partsNotRequired) {
      const k = `${p.part} (${p.why})`;
      byWhy.set(k, [...(byWhy.get(k) || []), p.machine]);
    }
    for (const [k, machines] of byWhy) L.push(`  - part the GTM config doesn't require: ${k} in ${machines.join(', ')}`);
  }
  if (model.stats.veinsWithoutItem.length > 0) {
    L.push(`  - registry veins the drill's table doesn't offer (no sample or no drilling recipe: from other mods, set aside in veins_excluded.json, or waiting for their era; not checked): ${model.stats.veinsWithoutItem.join(', ')}`);
  }
  L.push('  - qualitative analysis: ignores quantities, times and yields; chance-based outputs count as produced.');
  L.push('');
  L.push(`VERDICT: ${out.verdict}  (${summaryParts(out, opts.pass).join(' · ')})`);
  return L.join('\n') + '\n';
}

/** Summary chunks ("gate 3/3 · auto 2/2 · eras 5/5") for the passes that ran. */
export function summaryParts(out, pass) {
  const run = passesOf(pass);
  const c = out.counts;
  const parts = [];
  if (run.gate) parts.push(`gate ${c.gate.pass}/${c.gate.total}${c.gate.warn ? ` (+${c.gate.warn} warnings)` : ''}`);
  if (run.auto) parts.push(`auto ${c.auto.pass}/${c.auto.total}${c.auto.warn ? ` (+${c.auto.warn} warnings)` : ''}`);
  if (run.eras && c.eras && c.eras.total > 0) parts.push(`eras ${c.eras.pass}/${c.eras.total}${c.eras.warn ? ` (+${c.eras.warn} warnings)` : ''}`);
  return parts;
}

export function toJson(model, res, out) {
  const g = model.g;
  const row = (r) => ({
    id: r.target.id, label: r.target.label || r.target.id, verdict: r.verdict, status: r.status,
    key: r.key !== null && r.key !== undefined ? keyName(g, r.key) : null, without: r.target.without || null, detail: r.lines,
  });
  const eras = out.eras && out.eras.active ? {
    verdict: out.eras.verdict, counts: out.eras.counts, resources: out.eras.resources,
    groups: out.eras.groups.map((x) => ({
      id: x.group.id, era: x.group.era, label: x.group.label, optional: !!x.group.optional, verdict: x.verdict, counts: x.counts,
      violations: x.violations, unreachable: x.unreachable, missing: x.missing, later: x.later, detail: x.lines,
    })),
    exclusive: out.eras.exclusive.map((x) => ({
      id: x.resource.id, era: x.resource.era, label: x.resource.label, onlyFrom: x.resource.onlyFrom, verdict: x.verdict,
      leaked: x.leaked, entries: x.entries, recycled: x.recycled || 0, detail: x.lines,
    })),
  } : null;
  return {
    tier: model.cfg.tier, verdict: out.verdict, counts: out.counts, warnings: model.warnings,
    gate: out.gate.map(row), auto: out.auto.map(row), eras,
    stats: {
      rules: g.rules.length, recipes: model.stats.recipes, deadByType: model.stats.deadByType, ignoredByType: model.stats.ignoredByType,
      structureMachines: model.stats.structureMachineIds, rolledMachines: model.stats.rolledMachines,
      fluidVeins: model.stats.fluidVeins, configRead: model.stats.configRead, veinsWithoutItem: model.stats.veinsWithoutItem,
      partsNotRequired: model.stats.partsNotRequired,
    },
  };
}
