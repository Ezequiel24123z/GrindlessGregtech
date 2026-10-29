// Recipe quality gate (tools/analysis/recipe-quality.mjs): the recipes of our controllers, multiblock parts, hatches, single blocks and
// high-tier components must climb with the tier (docs/quality/recipes.md has the ladder and its rationale).
//
//   extractFacts(model, cfg)   model = {recipes, recipeFiles, registry, structures} (the static KubeJS stand-in's) -> plain facts
//   evaluate(facts, cfg)       facts + rules -> findings [{code, recipe, output, cls, tier, ...}]
//   compareBaseline(findings, cfg.baseline) -> {fresh, stale}: T0 fails only on `fresh` (new violations) and on `stale` (fixed ones
//                              still listed, so the ratchet only moves forward).
// Everything after extractFacts is pure and works on JSON, so the tests run on tiny in-memory facts.

export const TIER_NAMES = ['steam', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv'];
const TIER_PREFIX = new Map([['ulv', 0], ['lv', 1], ['mv', 2], ['hv', 3], ['ev', 4], ['iv', 5], ['luv', 6], ['zpm', 7], ['uv', 8], ['uhv', 9], ['uev', 10], ['uiv', 11]]);
const FORM_RANK = { crafting: 0, machine: 1, assembler: 1, assembly_line: 2 };
const CRAFT_TYPE = /(^|:)(crafting_)?(shaped|shapeless)(_strict)?$|crafting_shaped_strict$/;
const HATCH = /(^|_)(hatch|input_bus|output_bus|dynamo_hatch|energy_hatch|laser_(source|target)|rotor_holder|maintenance)(_|$)|_bus$/;
const SERVER_ERA = /server_scripts\/grindless\/([a-z_]+)\//;

export const tierOfEra = (era, cfg) => (era in cfg.eraTier ? cfg.eraTier[era] : null);
export function tierOfId(id) {
  const m = /^[a-z0-9_]+:([a-z]+)_/.exec(id);
  return m && TIER_PREFIX.has(m[1]) ? TIER_PREFIX.get(m[1]) : null;
}
export const eraOfFile = (file) => (SERVER_ERA.exec(String(file || '').replace(/\\/g, '/')) || [])[1] || null;

// ---------------------------------------------------------------- facts from the static model

const ingName = (ing) => {
  if (!ing) return null;
  if (Array.isArray(ing)) return ingName(ing[0]);
  if (ing.ingredient) return ingName(ing.ingredient);
  if (ing.item) return String(ing.item);
  if (ing.tag) return '#' + ing.tag;
  if (ing.fluid) return 'fluid:' + ing.fluid;
  return null;
};

function formOf(r) {
  if (CRAFT_TYPE.test(r.type) || /crafting_(shaped|shapeless)/.test(r.type)) return 'crafting';
  if (r.type === 'gtceu:assembly_line') return 'assembly_line';
  if (r.type === 'gtceu:assembler' || r.type === 'gtceu:circuit_assembler' || r.type === 'gtceu:circuit_assembly_line') return 'assembler';
  return 'machine';
}

function researchOf(json) {
  const s = JSON.stringify(json.recipeConditions || json.conditions || json.data || '');
  if (/data_module/.test(s)) return 'station';
  if (/research|data_stick|data_orb/.test(s)) return 'scanner';
  return null;
}

function recipeIO(r) {
  const j = r.json || {};
  const items = [];
  const fluids = [];
  const outputs = [];
  let count = 1;
  if (formOf(r) === 'crafting') {
    if (j.pattern && j.key) {
      const used = new Set(j.pattern.join('').split('').filter((c) => c !== ' '));
      for (const c of used) if (j.key[c]) items.push(ingName(j.key[c]));
    } else for (const i of j.ingredients || []) items.push(ingName(i));
    const res = j.result;
    outputs.push(String(res && (res.item || res.id) || ''));
    count = Number(res && res.count) || 1;
  } else {
    for (const c of (j.inputs && j.inputs.item) || []) items.push(ingName(c.content));
    for (const c of (j.inputs && j.inputs.fluid) || []) {
      const v = c.content && c.content.value;
      const f = Array.isArray(v) && v[0] ? (v[0].fluid || (v[0].tag && v[0].tag.replace(/^forge:/, 'gtceu:'))) : null;
      if (f) fluids.push(String(f));
    }
    for (const c of (j.outputs && j.outputs.item) || []) outputs.push(ingName(c.content));
  }
  return { items: items.filter(Boolean), fluids, outputs: outputs.filter(Boolean), count };
}

/**
 * Plain, serialisable facts: one entry per recipe the pack's scripts add whose output is something we classify, plus the sets that
 * classify it. `ours` ids are registered by our startup scripts; a *domain* input is one of them or a product of a recipe type we
 * registered (a line product), see docs/quality/recipes.md.
 */
export function extractFacts(model) {
  const { recipes, recipeFiles, registry, structures } = model;
  const isOurs = (e) => e && /startup_scripts\/grindless\//.test(String(e.file || '').replace(/\\/g, '/'));
  const ours = new Set();
  for (const m of [registry.items, registry.blocks, registry.machines, registry.fluids]) for (const e of m.values()) if (isOurs(e)) ours.add(e.id);
  const ownTypes = new Set([...registry.recipeTypes.values()].filter(isOurs).map((t) => t.id));
  const lineProducts = new Set();
  for (const r of recipes.values()) if (r.added && ownTypes.has(r.type)) for (const o of recipeIO(r).outputs) lineProducts.add(o);
  const domain = (id) => ours.has(id.replace(/^fluid:/, '')) || id.startsWith('grindless:') || lineProducts.has(id);

  const controllers = [...structures.keys()];
  const ctrlSet = new Set(controllers);
  const partSet = new Set();
  for (const s of structures.values()) for (const sym of Object.values(s.symbols || {})) for (const b of sym.blocks || []) if (!ctrlSet.has(b)) partSet.add(String(b));
  const machines = [...registry.machines.values()].filter((m) => isOurs(m) && !ctrlSet.has(m.id)).map((m) => m.id);
  const machineSet = new Set(machines);
  const outRecipes = [];
  for (const r of recipes.values()) {
    if (!r.added) continue;
    const io = recipeIO(r);
    if (io.outputs.length === 0) continue;
    const form = formOf(r);
    if (form === 'machine') {
      // only recipes that make a classified product matter; process recipes (ore, vein, chemistry) are not this gate's business
      if (!io.outputs.some((o) => ctrlSet.has(o) || partSet.has(o) || machineSet.has(o))) continue;
    }
    const file = recipeFiles.get(r.id) || null;
    outRecipes.push({
      id: r.id, file, form, type: r.type, outputs: io.outputs, count: io.count,
      items: io.items.map((id) => ({ id, domain: domain(id) })),
      fluids: io.fluids.map((id) => ({ id, domain: domain(id) })),
      research: researchOf(r.json || {}),
    });
  }
  // the whole recipe graph (ours only), compact, for the chain-depth metric
  const graph = [];
  for (const r of recipes.values()) {
    if (!r.added) continue;
    const io = recipeIO(r);
    if (io.outputs.length) graph.push({ o: io.outputs, i: [...new Set(io.items)], f: io.fluids });
  }
  return { controllers, parts: [...partSet], machines, ours: [...ours], graph, recipes: outRecipes };
}

// ---------------------------------------------------------------- the ladder

const stem = (id) => String(id).replace(/^#?[a-z0-9_.]+:/, '').replace(/^(raw|crushed|purified)_/, '')
  .replace(/_(block|ingot|nugget|dust|tiny_dust|small_dust|plate|rod|bolt|screw|gem|storage_block|item)$/, '');

/** Class of an output: controller | part | hatch | single | component. */
export function classify(id, facts) {
  if (facts.controllers.includes(id)) return 'controller';
  const tail = id.replace(/^[a-z0-9_]+:/, '');
  if (facts.machines.includes(id)) return HATCH.test(tail) ? 'hatch' : 'single';
  if (facts.parts.includes(id)) return 'part';
  if (/^gtceu:/.test(id) && tierOfId(id) !== null && !/_(machine_hull|machine_casing)$/.test(tail)) return HATCH.test(tail) ? 'hatch' : 'single';
  if (HATCH.test(tail) && tierOfId(id) !== null) return 'hatch';
  return 'component';
}

function tierOf(rec, output, cfg) {
  const era = eraOfFile(rec.file);
  const t = era ? tierOfEra(era, cfg) : null;
  if (t !== null) return t;
  const p = tierOfId(output);
  if (p !== null) return p;
  let max = null;
  for (const i of rec.items) { const x = tierOfId(i.id); if (x !== null && (max === null || x > max)) max = x; }
  return max;
}

const fluidMatches = (rec, list) => rec.fluids.some((f) => list.some((p) => new RegExp(p).test(f.id)));

function controllerRules(rec, t, cfg) {
  const v = [];
  const domain = rec.items.filter((i) => i.domain).length + rec.fluids.filter((i) => i.domain).length;
  const distinct = new Set([...rec.items.map((i) => i.id), ...rec.fluids.map((f) => 'f:' + f.id)]).size;
  const rank = FORM_RANK[rec.form];
  if (t >= 6 && rank < 2) v.push(['C-FORM', 'assembly line']);
  else if (t >= 4 && rank < 1) v.push(['C-FORM', 'assembler or a recipe of its own line']);
  if (t >= 4 && t < 6 && rec.fluids.length < 1) v.push(['C-FLUID', 'at least 1 fluid']);
  if (t === 6 && !(fluidMatches(rec, cfg.solder) && fluidMatches(rec, cfg.luvFluids))) v.push(['C-FLUID', 'soldering alloy plus lubricant or a polymer']);
  if (t === 7 && rec.research !== 'scanner' && rec.research !== 'station') v.push(['C-RESEARCH', 'scanner research']);
  if (t >= 8) {
    if (rec.research !== 'station') v.push(['C-RESEARCH', 'station research']);
    if (!(rec.fluids.some((f) => f.domain) || fluidMatches(rec, cfg.eraFluids))) v.push(['C-FLUID', 'an era fluid (UHV+)']);
  }
  const needDomain = t >= 8 ? 3 : t >= 4 ? 2 : 1;
  if (domain < needDomain) v.push(['C-DOMAIN', `at least ${needDomain} domain input(s)`]);
  if (t >= 2 && distinct < 5) v.push(['C-DISTINCT', 'at least 5 distinct ingredients']);
  return v;
}

const BULK_PART = /(casing|coil|glass|firebox|gearbox|pipe_casing|machine_casing|block|frame|wall|brick|plating|vent|grating|heat_shield)$/;

function partRules(rec, t, output) {
  const v = [];
  if (t >= 4 && rec.form === 'crafting') v.push(['P-FORM', 'assembler (with a fluid) or harder']);
  if (t >= 6 && rec.form === 'assembler') {
    const tail = String(output).replace(/^[a-z0-9_]+:/, '');
    if (!BULK_PART.test(tail) && rec.form !== 'assembly_line') v.push(['P-FORM', 'assembly line (a complex part)']);
    if (BULK_PART.test(tail) && rec.fluids.length < 1) v.push(['P-FLUID', 'an era fluid']);
    if (BULK_PART.test(tail) && !rec.items.some((i) => i.domain)) v.push(['P-DOMAIN', 'at least one era component']);
  }
  return v;
}

function hatchRules(rec, t) {
  const v = [];
  if (t >= 6 && rec.form !== 'assembly_line') v.push(['H-FORM', 'assembly line']);
  else if (t >= 4 && rec.form === 'crafting') v.push(['H-FORM', 'assembler with a fluid or harder']);
  return v;
}

function singleRules(rec, t) {
  const v = [];
  if (t >= 6 && rec.form !== 'assembly_line') v.push(['S-FORM', 'assembly line']);
  else if (t >= 4 && t < 6 && rec.form === 'assembler' && rec.fluids.length < 1) v.push(['S-FLUID', 'at least 1 fluid']);
  return v;
}

// ---------------------------------------------------------------- item complexity (every era, every item of ours)

const FORM_BONUS = { crafting: 0, machine: 1, assembler: 1, assembly_line: 2 };

/** Strongly connected components (Tarjan): node -> component number. The partition does not depend on visit order. */
function components(nodes, adj) {
  const index = new Map(), low = new Map(), comp = new Map(), stack = [], on = new Set();
  let n = 0, c = 0;
  const visit = (v) => {
    index.set(v, n); low.set(v, n); n++; stack.push(v); on.add(v);
    for (const w of adj.get(v)) {
      if (!index.has(w)) { visit(w); low.set(v, Math.min(low.get(v), low.get(w))); }
      else if (on.has(w)) low.set(v, Math.min(low.get(v), index.get(w)));
    }
    if (low.get(v) === index.get(v)) { let w; do { w = stack.pop(); on.delete(w); comp.set(w, c); } while (w !== v); c++; }
  };
  for (const v of nodes) if (!index.has(v)) visit(v);
  return comp;
}

/** steps from raw: 0 when nothing of ours makes it, else 1 + the shallowest recipe's deepest input. A fixed point over the
 *  whole graph (every step adds 1, so it is unique), never dependent on query order. Items our recipes only make inside a
 *  loop they never bootstrap (an ender pearl from a model made of ender pearls, a sample also brought back by hand) get
 *  the loop's edge back counted as raw. */
export function depthMap(graph) {
  const d = new Map();
  for (const g of graph) for (const o of g.o) d.set(o, Infinity);
  const get = (id) => (d.has(id) ? d.get(id) : 0);
  const relax = (cut) => {
    for (let changed = true; changed;) {
      changed = false;
      for (const g of graph) {
        for (const o of g.o) {
          let m = 0;
          for (const i of g.i) if (i !== o && !cut(o, i)) { const v = get(i); if (v > m) m = v; if (m === Infinity) break; }
          if (1 + m < d.get(o)) { d.set(o, 1 + m); changed = true; }
        }
      }
    }
  };
  relax(() => false);
  const loose = [...d.keys()].filter((id) => d.get(id) === Infinity);
  if (loose.length) {
    const set = new Set(loose);
    const adj = new Map(loose.map((id) => [id, new Set()]));
    for (const g of graph) for (const o of g.o) if (set.has(o)) for (const i of g.i) if (i !== o && set.has(i)) adj.get(o).add(i);
    const comp = components(loose, adj);
    relax((o, i) => set.has(o) && set.has(i) && comp.get(o) === comp.get(i));
  }
  return (id) => { const v = get(id); return Number.isFinite(v) ? v : 0; };
}

export function complexity(rec, depth) {
  const distinct = new Set(rec.items.map((i) => i.id)).size;
  const d = Math.min(depth, 6);
  return d + Math.min(distinct, 8) * 0.5 + Math.min(rec.fluids.length, 2) * 0.5 + (FORM_BONUS[rec.form] || 0) + (rec.research ? 1 : 0);
}

const isOwned = (id, owned, cfg) => owned.has(id) || /^grindless:/.test(id) || (cfg.addonNamespaces || []).some((n) => id.startsWith(n + ':'));

function componentRules(rec, t, output, cfg, ctx) {
  const v = [];
  if (t === null || t < 5 || !isOwned(output, ctx.owned, cfg)) return v;
  const distinct = new Set(rec.items.map((i) => i.id)).size;
  const os = stem(output);
  const conversion = rec.items.some((i) => stem(i.id) === os);
  const unpack = rec.count > 1 && distinct <= 1;
  const ignored = (cfg.manualIgnore || []).some((p) => new RegExp(p).test(rec.id) || new RegExp(p).test(output));
  if (rec.form === 'crafting' && !conversion && !unpack && !ignored) v.push(['C-MANUAL', 'machine-made: assembler with a fluid, or an assembly line']);
  if (rec.form !== 'machine' && !conversion && !unpack && !ignored) {
    const floor = (cfg.complexFloor || {})[t];
    if (floor !== undefined && complexity(rec, ctx.depth(output)) < floor) v.push(['C-COMPLEX', `complexity score >= ${floor} (steps from raw, distinct inputs, fluids, machine form)`]);
  }
  return v;
}

function sosoRules(rec, t, output, cfg) {
  if (t === null || t < cfg.sosoFromTier || rec.form !== 'crafting' || rec.fluids.length > 0) return [];
  const distinct = new Set(rec.items.map((i) => i.id)).size;
  if (distinct > cfg.sosoMaxDistinct) return [];
  const os = stem(output);
  if (rec.items.some((i) => stem(i.id) === os)) return []; // packing, unpacking and tier conversions of one thing
  if (cfg.sosoIgnore.some((p) => new RegExp(p).test(rec.id) || new RegExp(p).test(output))) return [];
  return [['X-SOSO', `more than ${cfg.sosoMaxDistinct} distinct inputs, a fluid or a machine of its tier`]];
}

/** Every violation: [{code, recipe, output, cls, tier, era, file, form, target, distinct, domain, fluids}]. Sorted. */
export function evaluate(rawFacts, cfg) {
  const facts = { ...rawFacts, controllers: [...rawFacts.controllers, ...(cfg.extraControllers || [])] };
  const out = [];
  const ctx = { owned: new Set(facts.ours || []), depth: depthMap(facts.graph || []) };
  for (const rec of facts.recipes) {
    for (const output of rec.outputs) {
      const cls = classify(output, facts);
      const t = tierOf(rec, output, cfg);
      if (t === null) continue;
      let v;
      if (cls === 'controller') v = controllerRules(rec, t, cfg);
      else if (cls === 'part') v = partRules(rec, t, output);
      else if (cls === 'hatch') v = hatchRules(rec, t);
      else if (cls === 'single') v = singleRules(rec, t);
      else v = [...sosoRules(rec, t, output, cfg), ...componentRules(rec, t, output, cfg, ctx)];
      for (const [code, target] of v) {
        out.push({
          code, recipe: rec.id, output, cls, tier: t, era: TIER_NAMES[t], file: rec.file, form: rec.form, target,
          distinct: new Set([...rec.items.map((i) => i.id), ...rec.fluids.map((f) => 'f:' + f.id)]).size,
          domain: rec.items.filter((i) => i.domain).length + rec.fluids.filter((i) => i.domain).length,
          fluids: rec.fluids.length, research: rec.research,
        });
      }
    }
  }
  return out.sort((a, b) => a.tier - b.tier || a.output.localeCompare(b.output) || a.code.localeCompare(b.code) || a.recipe.localeCompare(b.recipe));
}

const key = (f) => `${f.recipe}|${f.output}`;

/** baseline: {"recipe|output": ["CODE", ...]}. fresh: violations not listed; stale: listed codes no longer violated. */
export function compareBaseline(findings, baseline) {
  const got = new Map();
  for (const f of findings) { const k = key(f); if (!got.has(k)) got.set(k, new Set()); got.get(k).add(f.code); }
  const fresh = findings.filter((f) => !((baseline[key(f)] || []).includes(f.code)));
  const stale = [];
  for (const [k, codes] of Object.entries(baseline)) for (const c of codes) if (!(got.get(k) && got.get(k).has(c))) stale.push(`${k}|${c}`);
  return { fresh, stale };
}

export function baselineOf(findings) {
  const b = {};
  for (const f of findings) { const k = key(f); (b[k] = b[k] || []); if (!b[k].includes(f.code)) b[k].push(f.code); }
  return Object.fromEntries(Object.entries(b).sort(([a], [c]) => a.localeCompare(c)));
}

export function renderText(findings, { fresh = null, stale = [] } = {}) {
  const lines = [];
  const by = {};
  for (const f of findings) (by[f.era] = by[f.era] || []).push(f);
  for (const [era, list] of Object.entries(by)) lines.push(`${era}: ${list.length} violation(s) in ${new Set(list.map((f) => f.output)).size} output(s)`);
  if (fresh) {
    for (const f of fresh) lines.push(`NEW ${f.code} ${f.output} (${f.cls}, ${f.era}) recipe ${f.recipe} [${f.form}] ${f.file || '?'} -> ${f.target}`);
    for (const s of stale) lines.push(`STALE baseline ${s}: fixed, remove it (node tools/analysis/recipe-quality.mjs --write-baseline)`);
  }
  return lines.join('\n');
}
