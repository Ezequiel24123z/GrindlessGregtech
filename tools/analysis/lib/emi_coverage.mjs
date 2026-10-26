// EMI coverage audit: does EMI show how to obtain, and what to do with, every item, block item and fluid the pack registers?
//
// The model is EMI 1.1.22's own (dev.emi.emi.registry.EmiRecipes, EmiHidden) fed by the plugins this stack runs:
//   - GTM 7.5.3 (GTRecipeEMICategory): one category per GT recipe type, every recipe of it, except the electric furnace's (its category
//     is never registered: GTRecipeCategory#shouldRegisterDisplays) and the dummy type (not XEI-visible). A not-consumed input
//     (chance 0, a circuit) is an EMI catalyst; EMI indexes catalysts as uses too (EmiRecipes.Manager: byInput takes getCatalysts()).
//     The recipe widget also turns conditions into stacks (conditionStacks): every dimension condition is an input slot with the
//     dimension's marker block, and the assembly line's research is a catalyst slot with the data item.
//   - GTM's multiblock info (MultiblockInfoEmiRecipe): the controller as output and the blocks of the pattern preview as inputs. The
//     preview (BlockPattern#getPreview) puts in each cell the first candidate of the predicate it picks, so only the first block of a
//     predicate can show up; the parts list holds at most 18 stacks (PatternPreviewWidget).
//   - EMI's vanilla plugin (crafting, KubeJS's shaped/shapeless, cooking, stonecutting, smithing) and AE2's (transform, inscriber,
//     charger).
//   - EMI's data recipes: assets/emi/recipe/additions/**.json, type emi:info (an EmiInfoRecipe: its stacks are inputs AND outputs, so
//     the page shows under both "recipes" and "uses") and emi:world_interaction. EMI only reads them in the emi namespace.
//   - EMI's index data (assets/emi/index/stacks/*.json): a disabled stack drops every recipe that has it as an input, output or
//     catalyst (an ingredient only when all its stacks are disabled, EmiHidden#isDisabled).
// An item hidden from the index only (c:hidden_from_recipe_viewers without grindless:hidden_with_recipes: the old items of earlier
// versions kept for saves) is listed apart, with its conversion recipe.
//
// Acquisition: a visible recipe or page with the item as an output. Use: a visible recipe or page with it as an input or catalyst.
// End products (machines, tools, final rewards: tools/analysis/emi_coverage.json) need no use. Recipes the static stand-in cannot see
// (derived by a script from the mods' own recipes) are declared in the same file and verified against a native dump when given.
import fs from 'node:fs';
import path from 'node:path';
import { normalizeRecipe } from './normalize.mjs';
import { makeGlobMatcher } from './util.mjs';

export const INVISIBLE_GT_TYPES = ['gtceu:electric_furnace', 'gtceu:dummy'];
const VANILLA_CATEGORIES = {
  'minecraft:crafting_shaped': 'minecraft:crafting',
  'minecraft:crafting_shapeless': 'minecraft:crafting',
  'kubejs:shaped': 'minecraft:crafting',
  'kubejs:shapeless': 'minecraft:crafting',
  'gtceu:shaped': 'minecraft:crafting',
  'gtceu:shapeless': 'minecraft:crafting',
  'gtceu:crafting_shaped_strict': 'minecraft:crafting',
  'gtceu:crafting_shaped_energy_transfer': 'minecraft:crafting',
  'gtceu:crafting_shaped_fluid_container': 'minecraft:crafting',
  'gtceu:crafting_shapeless_fluid_container': 'minecraft:crafting',
  'gtceu:crafting_tool_head_replace': 'minecraft:crafting',
  'gtceu:crafting_facade_cover': 'minecraft:crafting',
  'minecraft:smelting': 'minecraft:smelting',
  'minecraft:blasting': 'minecraft:blasting',
  'minecraft:smoking': 'minecraft:smoking',
  'minecraft:campfire_cooking': 'minecraft:campfire_cooking',
  'minecraft:stonecutting': 'minecraft:stonecutting',
  'minecraft:smithing_transform': 'minecraft:smithing',
  'ae2:transform': 'ae2:item_transformation',
  'ae2:inscriber': 'ae2:inscriber',
  'ae2:charger': 'ae2:charger',
};
const MAX_PREVIEW_PARTS = 18;

// ------------------------------------------------------------------------------------------------ EMI data files

/** EMI's ingredient text ("item:id", "fluid:id", "#item:tag", "#fluid:tag", a bare id) -> {kind, id|tag}. */
export function parseEmiStack(s) {
  const t = String(s).trim();
  const tag = t.startsWith('#');
  const body = tag ? t.slice(1) : t;
  const m = /^(item|fluid|block):(.+)$/.exec(body);
  const kind = m ? (m[1] === 'block' ? 'item' : m[1]) : 'item';
  const id = m ? m[2] : body;
  return tag ? { kind, tag: id } : { kind, id };
}

function walkJson(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkJson(p));
    else if (e.name.endsWith('.json')) out.push(p);
  }
  return out;
}

/**
 * The pack's EMI data (kubejs/assets/emi/...): pages (recipe/additions) and disabled stacks (index/stacks). Pages outside the emi
 * namespace are reported: EMI never reads them.
 */
export function loadEmiData(packDir) {
  const assets = path.join(packDir, 'kubejs', 'assets');
  const pages = [];
  const problems = [];
  const additions = path.join(assets, 'emi', 'recipe', 'additions');
  for (const f of walkJson(additions)) {
    const rel = path.relative(path.join(assets, 'emi'), f).split(path.sep).join('/');
    let j;
    try {
      j = JSON.parse(fs.readFileSync(f, 'utf8'));
    } catch (e) {
      problems.push(`${rel}: not JSON (${e.message})`);
      continue;
    }
    const arr = (k) => (Array.isArray(j[k]) ? j[k] : j[k] === undefined ? [] : [j[k]]);
    const id = 'emi:/generated/' + rel;
    if (j.type === 'emi:info') pages.push({ id, file: rel, type: 'emi:info', stacks: arr('stacks').map(parseEmiStack), text: arr('text').map(String) });
    else if (j.type === 'emi:world_interaction') {
      pages.push({ id, file: rel, type: 'emi:world_interaction', inputs: [...arr('left'), ...arr('right')].map(parseEmiStack), outputs: arr('output').map(parseEmiStack), text: [] });
    } else problems.push(`${rel}: type ${j.type} is not emi:info or emi:world_interaction`);
  }
  // pages in other namespaces: EMI's loader skips them
  if (fs.existsSync(assets)) {
    for (const ns of fs.readdirSync(assets)) {
      if (ns === 'emi') continue;
      for (const f of walkJson(path.join(assets, ns, 'recipe', 'additions'))) problems.push(`${path.relative(assets, f)}: EMI only reads recipe/additions in the emi namespace`);
    }
  }
  const disabled = [];
  for (const f of walkJson(path.join(assets, 'emi', 'index', 'stacks'))) {
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (j.disable !== true) continue;
    for (const s of j.removed || []) disabled.push(parseEmiStack(s));
  }
  return { pages, disabled, problems };
}

// ------------------------------------------------------------------------------------------------ the audit

const FLUID = 'fluid:';

// GTM 7.5.3 shows a dimension condition as an INPUT slot holding the dimension's marker (DimensionCondition#setupDimensionMarkers, added
// by GTRecipeWidget for every DimensionCondition): GTRegistries.DIMENSION_MARKERS, filled by GTM (GTDimensionMarkers) and GCYR
// (GCYRDimensionMarkers), or a barrier for a dimension with no marker. Overridable with emi_coverage.json's dimensionMarkers.
export const DIMENSION_MARKERS = {
  'minecraft:overworld': 'gtceu:overworld_marker',
  'minecraft:the_nether': 'gtceu:the_nether_marker',
  'minecraft:the_end': 'gtceu:the_end_marker',
  'gcyr:luna': 'gcyr:luna_marker',
  'gcyr:mars': 'gcyr:mars_marker',
  'gcyr:mercury': 'gcyr:mercury_marker',
  'gcyr:venus': 'gcyr:venus_marker',
};
export const MARKER_FALLBACK = 'minecraft:barrier';

/**
 * The stacks GTM's recipe widget adds to a GT recipe for its conditions, as EMI ingredients: [{role, alts, label}].
 *   dimension  one INPUT slot per DimensionCondition (each of an OR list), with the dimension's marker
 *   research   the assembly line's research slot (ItemRecipeCapability#applyWidgetInfo): a CATALYST holding the data item of every
 *              research entry (a data stick unless the entry names another), one ingredient
 * GTM draws every other condition as a line of text, with no stack.
 */
export function conditionStacks(conditions, cfg = {}) {
  const markers = { ...DIMENSION_MARKERS, ...(cfg.dimensionMarkers || {}) };
  const out = [];
  for (const c of conditions || []) {
    if (!c || typeof c !== 'object') continue;
    if (c.type === 'dimension' && typeof c.dimension === 'string') {
      const m = markers[c.dimension] || cfg.dimensionMarkerFallback || MARKER_FALLBACK;
      out.push({ role: 'input', alts: [m], label: `dimension marker ${m} (${c.dimension})` });
    } else if (c.type === 'research') {
      const items = (Array.isArray(c.research) ? c.research : [])
        .map((e) => (e && e.dataItem && (e.dataItem.id || e.dataItem.item)) || 'gtceu:data_stick');
      const alts = [...new Set(items.length > 0 ? items : ['gtceu:data_stick'])];
      out.push({ role: 'catalyst', alts, label: `research data ${alts.join('|')}` });
    }
  }
  return out;
}

/** Blocks the multiblock preview can place: the first block of every block predicate of the pattern (see the header). */
export function previewBlocks(structure) {
  const out = [];
  const visit = (p) => {
    if (!p || typeof p !== 'object') return;
    if (p.kind === 'blocks' && Array.isArray(p.blocks) && p.blocks.length > 0) out.push(p.blocks[0]);
    else if (p.kind === 'oneOf' && Array.isArray(p.options)) p.options.forEach(visit);
  };
  for (const sym of Object.values(structure.symbols || {})) visit(sym);
  return [...new Set(out)];
}

/**
 * dump: lib/dump.mjs format (static or native). registry: kubejs_static's registry (what the pack registers). cfg: emi_coverage.json.
 * emi: loadEmiData(). lang: {en_us: {key: text}, es_es: {...}} (translations the pack adds), or null to skip the text check.
 */
export function auditEmiCoverage({ dump, registry, cfg, emi, lang = null, native = false }) {
  const st = { unresolved: new Set() };
  const gtTypes = new Set([...dump.recipeTypes.keys(), ...registry.recipeTypes.keys()]);
  const ctx = { tags: dump.tags, st, cfg: { typeAliases: {}, toolTagSet: new Set() }, gtTypes };
  const invisibleTypes = new Set([...(cfg.invisibleTypes || INVISIBLE_GT_TYPES)]);

  // ---- what EMI disables (drops with their recipes) and what it only keeps out of its index
  const disabled = new Set();
  for (const d of emi.disabled) {
    if (d.tag) (d.kind === 'fluid' ? dump.tags.fluids(d.tag).map((f) => FLUID + f) : dump.tags.items(d.tag)).forEach((k) => disabled.add(k));
    else disabled.add(d.kind === 'fluid' ? FLUID + d.id : d.id);
  }
  const indexHidden = new Set(dump.tags.items('c:hidden_from_recipe_viewers'));

  // ---- EMI's recipes: {id, category, source, inputs: Set, catalysts: Set, outputs: Set}
  const recipes = [];
  const invisible = [];
  const unknownTypes = new Map();
  const categoryOf = (type) => {
    if (VANILLA_CATEGORIES[type]) return VANILLA_CATEGORIES[type];
    if (invisibleTypes.has(type)) return null;
    if (gtTypes.has(type) || type.startsWith('gtceu:')) return type;
    return undefined;
  };
  for (const r of dump.recipes.values()) {
    const n = normalizeRecipe(r, ctx);
    let cat = categoryOf(r.type);
    // a GT recipe in a sub-category (GTM's ore crushing, recycling...) shows in that category's EMI tab (GTRecipeEMICategory)
    if (cat && n.shape === 'gt' && typeof n.category === 'string' && n.category !== '' && !VANILLA_CATEGORIES[r.type]) cat = n.category;
    const rec = { id: r.id, category: cat, source: 'recipe', type: r.type, inputs: new Set(), catalysts: new Set(), outputs: new Set() };
    // EMI drops a recipe when any output stack is disabled, or any input or catalyst ingredient has only disabled stacks
    // (EmiRecipes#bake's invalidator, EmiHidden#isDisabled; GTM gives each slot, and each tag of a slot, its own ingredient)
    const disabledBy = [];
    for (const i of n.inputs) {
      const alts = i.alts.filter((a) => a !== 'gtceu:programmed_circuit' || i.alts.length === 1);
      if (alts.length > 0 && alts.every((a) => disabled.has(a))) disabledBy.push((i.cap ? 'catalyst ' : 'input ') + i.label);
      for (const a of alts) (i.cap ? rec.catalysts : rec.inputs).add(a);
    }
    for (const o of n.outputs) {
      if (o.key.startsWith('research:')) continue;
      if (disabled.has(o.key)) disabledBy.push('output ' + o.key);
      rec.outputs.add(o.key);
    }
    // the stacks GTM's recipe widget adds for its conditions are EMI ingredients like any slot, so a disabled one drops the recipe too
    if (n.shape === 'gt') {
      for (const s of conditionStacks(n.conditions, cfg)) {
        if (s.alts.every((a) => disabled.has(a))) disabledBy.push(s.label);
        for (const a of s.alts) (s.role === 'catalyst' ? rec.catalysts : rec.inputs).add(a);
      }
    }
    const dropped = disabledBy.length > 0;
    if (cat === null) {
      invisible.push(rec);
      continue;
    }
    if (cat === undefined) {
      unknownTypes.set(r.type, (unknownTypes.get(r.type) || 0) + 1);
      rec.category = r.type;
      rec.unknownType = true;
    }
    if (dropped) {
      rec.dropped = true;
      rec.disabledBy = disabledBy;
      invisible.push(rec);
      continue;
    }
    recipes.push(rec);
  }
  const keyOf = (s) => (s.kind === 'fluid' ? FLUID + s.id : s.id);
  const expand = (s) => (s.tag ? (s.kind === 'fluid' ? dump.tags.fluids(s.tag).map((f) => FLUID + f) : dump.tags.items(s.tag)) : [keyOf(s)]);
  for (const p of emi.pages) {
    const ins = (p.type === 'emi:info' ? p.stacks : p.inputs).flatMap(expand);
    const outs = (p.type === 'emi:info' ? p.stacks : p.outputs).flatMap(expand);
    recipes.push({ id: p.id, category: p.type === 'emi:info' ? 'emi:info' : 'emi:world_interaction', source: 'page', file: p.file, inputs: new Set(ins), catalysts: new Set(), outputs: new Set(outs) });
  }
  const previewWarnings = [];
  for (const [machine, s] of dump.structures) {
    const parts = previewBlocks(s);
    if (parts.length + 1 > MAX_PREVIEW_PARTS) previewWarnings.push(`${machine}: ${parts.length + 1} preview stacks, EMI's parts list shows ${MAX_PREVIEW_PARTS}`);
    recipes.push({ id: machine, category: 'gtceu:multiblock_info', source: 'preview', inputs: new Set(parts.slice(0, MAX_PREVIEW_PARTS - 1)), catalysts: new Set(), outputs: new Set([machine]) });
  }

  const madeBy = new Map();
  const usedBy = new Map();
  const push = (m, k, r) => { if (!m.has(k)) m.set(k, []); m.get(k).push(r); };
  for (const r of recipes) {
    for (const k of r.outputs) push(madeBy, k, r);
    for (const k of r.inputs) push(usedBy, k, r);
    for (const k of r.catalysts) push(usedBy, k, r);
  }
  const invisibleMade = new Map();
  for (const r of invisible) for (const k of r.outputs) push(invisibleMade, k, r);
  // a route listed in pendingRoutes is dropped only until a later package of the era merges: what it alone gives is pending, not a gap
  const pendingIds = new Set((cfg.pendingRoutes || []).map((p) => p.id));
  const pendingMade = new Map();
  const pendingUsed = new Map();
  for (const r of invisible) {
    if (!r.dropped || !pendingIds.has(r.id)) continue;
    for (const k of r.outputs) push(pendingMade, k, r);
    for (const k of [...r.inputs, ...r.catalysts]) push(pendingUsed, k, r);
  }

  // ---- what is audited
  const endProduct = makeGlobMatcher(cfg.endProducts ? cfg.endProducts.globs || [] : []);
  const endItems = new Map(((cfg.endProducts && cfg.endProducts.items) || []).map((e) => [e.id, e.reason || '']));
  const exceptions = new Map((cfg.exceptions || []).map((e) => [e.id + '|' + e.role, e]));
  const derived = cfg.derived || [];
  const audited = [];
  for (const it of registry.items.values()) audited.push({ key: it.id, kind: 'item', file: it.file, material: it.material || null });
  for (const m of registry.machines.values()) audited.push({ key: m.id, kind: 'machine', file: m.file });
  for (const f of registry.fluids.values()) audited.push({ key: FLUID + f.id, kind: 'fluid', file: f.file, material: f.material || null });

  const results = [];
  const legacy = [];
  const hiddenOurs = [];
  const missingInDump = [];
  for (const a of audited) {
    const k = a.key;
    const inRegistry = a.kind === 'fluid' ? dump.fluids.has(k.slice(FLUID.length)) : dump.items.has(k);
    if (native && !inRegistry) {
      missingInDump.push(k);
      continue;
    }
    if (disabled.has(k)) {
      hiddenOurs.push({ key: k, why: 'disabled in EMI (grindless:hidden_with_recipes: its era is not implemented yet)' });
      continue;
    }
    if (indexHidden.has(k)) {
      const conv = (usedBy.get(k) || []).map((r) => r.id);
      legacy.push({ key: k, conversions: conv });
      continue;
    }
    const made = madeBy.get(k) || [];
    const used = usedBy.get(k) || [];
    const isEnd = a.kind === 'machine' || endProduct(k) || endItems.has(k);
    const dec = derived.filter((d) => d.id === k);
    const row = {
      key: k, kind: a.kind, file: a.file, end: isEnd, endReason: a.kind === 'machine' ? 'machine' : endItems.get(k) || (isEnd ? 'end product' : ''),
      made: made.map((r) => ({ id: r.id, category: r.category, source: r.source })),
      used: used.map((r) => ({ id: r.id, category: r.category, source: r.source })),
      derived: dec,
      invisibleMade: (invisibleMade.get(k) || []).map((r) => ({ id: r.id, type: r.type, dropped: !!r.dropped })),
      gaps: [],
      excepted: [],
      pending: [],
    };
    const need = [['acquisition', made.length + dec.filter((d) => d.role === 'acquisition').length], ['use', isEnd ? 1 : used.length + dec.filter((d) => d.role === 'use').length]];
    for (const [role, n] of need) {
      if (n > 0) continue;
      const ex = exceptions.get(k + '|' + role);
      const viaPending = ((role === 'acquisition' ? pendingMade : pendingUsed).get(k) || []).map((r) => r.id);
      if (ex) row.excepted.push({ role, reason: ex.reason });
      else if (viaPending.length) row.pending.push({ role, routes: viaPending });
      else row.gaps.push(role);
    }
    // what EMI cannot draw needs words: a route of a type it never shows (GTM's electric furnace), and a block whose only use is a
    // place in a structure (the multiblock preview shows only the first block of each predicate, in at most 18 stacks)
    const pages = (cfg.requirePages || {});
    if (pages.invisibleRoutes !== false && row.invisibleMade.some((r) => !r.dropped) && !made.some((r) => r.source === 'page')) {
      row.gaps.push('page for a route EMI cannot show');
    }
    if (pages.previewOnlyUses !== false && !isEnd && used.length > 0 && used.every((r) => r.source === 'preview' || r.category === 'minecraft:crafting')
      && used.some((r) => r.source === 'preview')) {
      row.gaps.push('page for a structure block');
    }
    results.push(row);
  }

  // ---- the declarations and the pages themselves
  const problems = [...emi.problems];
  const ours = (k) => (k.startsWith(FLUID) ? registry.fluids.has(k.slice(FLUID.length)) : registry.items.has(k) || registry.machines.has(k));
  const known = (k) => (k.startsWith(FLUID) ? dump.fluids.has(k.slice(FLUID.length)) : dump.items.has(k)) || ours(k);
  for (const p of emi.pages) {
    for (const s of [...(p.stacks || []), ...(p.inputs || []), ...(p.outputs || [])]) {
      if (s.tag) {
        if ((s.kind === 'fluid' ? dump.tags.fluids(s.tag) : dump.tags.items(s.tag)).length === 0) problems.push(`${p.file}: tag #${s.tag} has no members`);
      } else if (!known(keyOf(s)) && (s.id.startsWith('grindless:') || s.id.startsWith('gtceu:'))) problems.push(`${p.file}: ${keyOf(s)} is not registered`);
    }
    if (lang) {
      for (const t of p.text) for (const language of ['en_us', 'es_es']) if (!lang[language] || lang[language][t] === undefined) problems.push(`${p.file}: no ${language} text for ${t}`);
    }
    if (p.type === 'emi:info' && p.text.length === 0) problems.push(`${p.file}: an info page with no text`);
  }
  const ourKeys = new Set(audited.map((a) => a.key));
  for (const d of derived) {
    if (!ourKeys.has(d.id)) problems.push(`derived route for ${d.id}: not an item of the pack`);
    if (!['acquisition', 'use'].includes(d.role)) problems.push(`derived route for ${d.id}: role ${d.role} is not acquisition or use`);
  }
  for (const e of cfg.exceptions || []) if (!ourKeys.has(e.id)) problems.push(`exception for ${e.id}: not an item of the pack`);
  for (const e of (cfg.endProducts && cfg.endProducts.items) || []) if (!ourKeys.has(e.id)) problems.push(`end product ${e.id}: not an item of the pack`);

  // a declared derived route must show in a native dump (the stand-in cannot see it, the dump can)
  const derivedChecks = [];
  if (native) {
    for (const d of derived) {
      const list = (d.role === 'acquisition' ? madeBy : usedBy).get(d.id) || [];
      const hit = list.filter((r) => r.category === d.category);
      derivedChecks.push({ ...d, found: hit.length, sample: hit.slice(0, 3).map((r) => r.id) });
      if (hit.length === 0) problems.push(`derived route for ${d.id} (${d.role} in ${d.category}): no such recipe in the dump`);
    }
  }

  const gaps = results.filter((r) => r.gaps.length > 0);

  // a recipe of ours that EMI drops for a disabled stack takes a whole route out of view (the observation that makes a chart, the drill
  // run that uses a sample), even when another route keeps the item covered: the recipe must not carry the hidden stack
  const shown = new Set(results.map((r) => r.key));
  const allDropped = invisible.filter((r) => r.dropped).map((r) => ({
    id: r.id, type: r.type, disabledBy: r.disabledBy, ours: [...new Set([...r.outputs, ...r.inputs, ...r.catalysts])].filter((k) => shown.has(k)),
  })).filter((d) => d.ours.length > 0);
  // a pending route waits for a later package of the era under construction: it may only be dropped for our own stacks disabled until
  // their era, and a stale entry (no longer dropped) is a problem, so each one is deleted when its package merges
  const untilEra = new Set(hiddenOurs.map((h) => h.key));
  const pending = new Map((cfg.pendingRoutes || []).map((p) => [p.id, p]));
  const pendingRoutes = [];
  const droppedRoutes = [];
  for (const d of allDropped) {
    const p = pending.get(d.id);
    if (p && d.disabledBy.every((b) => untilEra.has(b.slice(b.indexOf(' ') + 1)))) pendingRoutes.push({ ...d, reason: p.reason || '' });
    else droppedRoutes.push(d);
  }
  for (const p of pending.values()) if (!pendingRoutes.some((d) => d.id === p.id)) problems.push(`pending route ${p.id}: EMI no longer drops it for stacks disabled until their era; delete the entry`);
  for (const d of droppedRoutes) problems.push(`${d.id} (${d.type}): EMI drops it for ${d.disabledBy.join(', ')}, hiding a route of ${d.ours.join(', ')}`);

  // every process of ours (a recipe type our scripts register) shows at least one recipe, unless EMI never shows its type
  const processes = [];
  const byCategory = new Map();
  for (const r of recipes) byCategory.set(r.category, (byCategory.get(r.category) || 0) + 1);
  const derivedTypes = new Set([...derived.map((d) => d.category), ...(cfg.derivedProcesses || []).map((p) => p.type)]);
  for (const t of registry.recipeTypes.keys()) {
    if (invisibleTypes.has(t)) continue;
    const n = byCategory.get(t) || 0;
    const users = [...registry.machines.values()].filter((m) => m.recipeTypes.includes(t)).map((m) => m.id);
    processes.push({ type: t, recipes: n, machines: users });
    const pendingOnly = invisible.some((r) => r.type === t && r.dropped && pendingIds.has(r.id));
    if (n === 0 && !pendingOnly && (native || !derivedTypes.has(t))) {
      const ex = exceptions.get(t + '|process');
      if (!ex) problems.push(`process ${t} (${users.join(', ') || 'no machine'}): no recipe EMI could show`);
    }
  }
  for (const p of cfg.derivedProcesses || []) if (!registry.recipeTypes.has(p.type)) problems.push(`derived process ${p.type}: not a recipe type of the pack`);
  return {
    native,
    counts: {
      audited: results.length, items: results.filter((r) => r.kind === 'item').length, machines: results.filter((r) => r.kind === 'machine').length,
      fluids: results.filter((r) => r.kind === 'fluid').length, recipes: recipes.length, pages: emi.pages.length, invisible: invisible.length,
    },
    results, gaps, legacy, hiddenOurs, missingInDump, problems, previewWarnings, derivedChecks, processes, droppedRoutes, pendingRoutes,
    unknownTypes: [...unknownTypes.entries()].map(([type, n]) => ({ type, n })),
    viaPagesOnly: results.filter((r) => (r.made.length > 0 && r.made.every((m) => m.source === 'page')) || (!r.end && r.used.length > 0 && r.used.every((m) => m.source === 'page'))).map((r) => r.key),
    invisibleRoutes: results.filter((r) => r.invisibleMade.length > 0).map((r) => ({ key: r.key, routes: r.invisibleMade })),
  };
}

// ------------------------------------------------------------------------------------------------ reports

export function renderCoverageText(res) {
  const L = [];
  const c = res.counts;
  L.push(`EMI coverage (${res.native ? 'native dump' : 'static stand-in'}): ${c.audited} audited (${c.items} items, ${c.machines} machines, ${c.fluids} fluids); ` +
    `${c.recipes} EMI recipes and pages, ${c.pages} of our pages; ${c.invisible} recipes EMI does not show`);
  L.push(`Gaps: ${res.gaps.length}`);
  for (const g of res.gaps) {
    L.push(`  ✗ ${g.key} (${g.kind}, ${g.file}): no ${g.gaps.join(' and no ')}` +
      (g.invisibleMade.length ? ` — made only where EMI does not look: ${g.invisibleMade.map((r) => r.id + (r.dropped ? ' (disabled stack)' : ' (' + r.type + ')')).join(', ')}` : ''));
  }
  const ex = res.results.filter((r) => r.excepted.length > 0);
  L.push(`Recipes of ours EMI drops for a disabled stack (assets/emi/index/stacks): ${res.droppedRoutes.length}`);
  if (res.pendingRoutes && res.pendingRoutes.length) {
    L.push(`Pending routes (dropped only for stacks disabled until their era): ${res.pendingRoutes.length}`);
    for (const d of res.pendingRoutes) L.push(`  · ${d.id}: ${d.disabledBy.join(', ')} — ${d.reason}`);
    for (const r of res.results.filter((x) => x.pending && x.pending.length)) L.push(`  · ${r.key}: ${r.pending.map((p) => p.role + ' only through ' + p.routes.join(', ')).join('; ')}`);
  }
  if (ex.length) {
    L.push(`Justified exceptions: ${ex.length}`);
    for (const r of ex) L.push(`  · ${r.key}: ${r.excepted.map((e) => e.role + ' — ' + e.reason).join('; ')}`);
  }
  if (res.invisibleRoutes.length) {
    L.push(`Routes EMI cannot show (another visible route or page must cover them): ${res.invisibleRoutes.length}`);
    for (const r of res.invisibleRoutes) L.push(`  · ${r.key}: ${r.routes.map((x) => x.id + (x.dropped ? ' (disabled stack)' : ' (' + x.type + ')')).join(', ')}`);
  }
  if (res.viaPagesOnly.length) L.push(`Shown only through an info page: ${res.viaPagesOnly.join(', ')}`);
  L.push(`Legacy items (hidden from EMI's index, kept for old saves): ${res.legacy.length}`);
  for (const l of res.legacy) L.push(`  · ${l.key}: conversion ${l.conversions.join(', ') || 'NONE'}`);
  if (res.hiddenOurs.length) L.push(`Ours, disabled until their era: ${res.hiddenOurs.map((h) => h.key).join(', ')}`);
  if (res.missingInDump.length) L.push(`Registered by the scripts but not in the dump (older dump?): ${res.missingInDump.join(', ')}`);
  if (res.derivedChecks.length) L.push(`Derived routes found in the dump: ${res.derivedChecks.map((d) => d.id + ' ' + d.role + ' ' + d.found).join(', ')}`);
  if (res.unknownTypes.length) L.push(`Recipe types of unknown EMI visibility (counted as shown): ${res.unknownTypes.map((t) => t.type + ' ' + t.n).join(', ')}`);
  for (const w of res.previewWarnings) L.push(`  ! preview: ${w}`);
  L.push(`Problems: ${res.problems.length}`);
  for (const p of res.problems) L.push(`  ✗ ${p}`);
  return L.join('\n');
}

/** The expectation file's text: one line per item, so a change shows as a one-line diff. */
export function renderExpectations(exp) {
  const L = ['{'];
  L.push(`  "format": ${JSON.stringify(exp.format)},`);
  L.push(`  "note": ${JSON.stringify(exp.note)},`);
  L.push('  "items": [');
  exp.items.forEach((it, i) => L.push('    ' + JSON.stringify(it) + (i < exp.items.length - 1 ? ',' : '')));
  L.push('  ],');
  L.push(`  "pages": ${JSON.stringify(exp.pages)},`);
  L.push(`  "legacy": ${JSON.stringify(exp.legacy)},`);
  L.push(`  "hidden": ${JSON.stringify(exp.hidden)}`);
  L.push('}');
  return L.join('\n') + '\n';
}

/** What the native client fixture (gg_test_emi_coverage.js) asks EMI for: every audited key and the routes the audit expects. */
export function fixtureExpectations(res) {
  const cats = (list, extra) => [...new Set([...list.map((r) => r.category), ...extra])].sort();
  const declared = (r, role) => r.derived.filter((d) => d.role === role).map((d) => d.category);
  const waived = (r, role) => r.excepted.some((e) => e.role === role) || (r.pending || []).some((p) => p.role === role);
  return {
    format: 'gg-emi-coverage-1',
    note: 'Generated by node tools/analysis/emi-coverage.mjs --expect; do not edit by hand (the Node suite fails when it is stale).',
    items: res.results.map((r) => ({
      id: r.key.startsWith(FLUID) ? r.key.slice(FLUID.length) : r.key,
      kind: r.key.startsWith(FLUID) ? 'fluid' : 'item',
      needUse: !r.end && !waived(r, 'use'),
      needMade: !waived(r, 'acquisition'),
      made: cats(r.made, declared(r, 'acquisition')),
      used: cats(r.used, declared(r, 'use')),
    })).sort((a, b) => (a.kind + a.id < b.kind + b.id ? -1 : 1)),
    pages: [...new Set(res.results.flatMap((r) => [...r.made, ...r.used]).filter((m) => m.source === 'page').map((m) => m.id))].sort(),
    legacy: res.legacy.map((l) => ({ id: l.key, conversions: l.conversions })),
    hidden: res.hiddenOurs.map((h) => h.key),
  };
}
