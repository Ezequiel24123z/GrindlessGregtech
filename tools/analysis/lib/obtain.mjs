// OBTAIN STEP: audit of what is never obtained, in any era.
// Starts from every world source the pack already has (per-dimension vein tables, fluid deposits, GT trees and
// stones, bees, whatever other mods give) and every recipe of any tier (each registered machine with its tier's EU/t
// cap, multiblocks with no cap, energy and parts taken as obtainable), and lists the items and
// fluids of the audited namespaces that aren't reached, grouped by material. Each group is classified:
//   A  deserves a source: opens a line or an automation (the config decides, with its reason);
//   B  arrives with a later era from docs/journey.md (comes from a planet or a set-aside vein): hide until then;
//   C  will never arrive (material with no use in GTM or an addon, addon leftovers): hide the item and its recipes.
// Whatever no rule classifies comes out as «?» and fails: it's new material nobody has looked at.
import { lfp } from './engine.mjs';
import { buildModel } from './model.mjs';
import { BEE_TYPES, beeKey } from './normalize.mjs';
import { asArray, makeGlobMatcher } from './util.mjs';

const nsOf = (id) => {
  const s = id.startsWith('fluid:') ? id.slice(6) : id;
  const c = s.indexOf(':');
  return c < 0 ? 'minecraft' : s.slice(0, c);
};
const pathOf = (id) => {
  const s = id.startsWith('fluid:') ? id.slice(6) : id;
  const c = s.indexOf(':');
  return c < 0 ? s : s.slice(c + 1);
};

export const DEFAULT_DIMENSIONS = ['minecraft:overworld', 'minecraft:the_nether', 'minecraft:the_end', 'grindless:flat', 'grindless:void'];
/** Eras del pack en orden (las de docs/viaje.md); `until` de la clase B es una de ellas y la de la clase C, "never". */
export const ERA_IDS = ['steam', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max'];
const DEFAULT_NBT_TYPED = ['productivebees:configurable_honeycomb', 'productivebees:configurable_comb', 'productivebees:spawn_egg_configurable_bee'];
const HIDDEN_TAG = 'c:hidden_from_recipe_viewers';

/** Raw ore of a vein material ("gtceu:ilmenite", "gcyr:xyz"): the material's own namespace, GT's, vanilla's, or any other. */
function rawOreIds(dump, material) {
  const c = material.indexOf(':');
  const ns = c < 0 ? 'gtceu' : material.slice(0, c);
  const name = c < 0 ? material : material.slice(c + 1);
  for (const n of [ns, 'gtceu', 'minecraft']) if (dump.items.has(`${n}:raw_${name}`)) return [`${n}:raw_${name}`];
  const any = [...dump.items].filter((i) => pathOf(i) === `raw_${name}`);
  return any.sort();
}

/** Bees named by Productive Bees recipes (hive, crossbreeding, conversion, nests, fishing). */
function beeIds(dump) {
  const set = new Set();
  const add = (b) => {
    const id = typeof b === 'string' ? b : b && typeof b.bee === 'string' ? b.bee : null;
    if (id) set.add(id);
  };
  for (const r of dump.recipes.values()) {
    if (!BEE_TYPES.has(r.type)) continue;
    const j = r.json || {};
    if (r.type === 'productivebees:advanced_beehive') add(j.ingredient);
    add(j.parent1);
    add(j.parent2);
    asArray(j.offspring).forEach(add);
    add(j.source);
    add(j.result);
    if (r.type === 'productivebees:bee_spawning') asArray(j.results).forEach(add);
    add(j.bee);
  }
  return [...set].sort();
}

/**
 * Config derived for buildModel: the audit's world, every registered machine, recipe types with no GT machine
 * (crafting table, furnace, other mods) with no condition, conditions ignored except dimension (dim:<id> key),
 * each fluid's buckets, and, with `bees`, the bees.
 */
export function obtainConfig(dump, raw) {
  const ob = raw.obtain || {};
  const reach = ob.reachableDimensions || DEFAULT_DIMENSIONS;
  const audited = new Set(ob.audit || []);
  const skipNs = new Set(ob.ignoreNamespaces || []);
  const notFree = makeGlobMatcher(ob.notFree || []);
  const warnings = [];

  // 1) whatever other mods give (vanilla, decoration, AE2, Productive Bees...): taken as obtainable except `notFree`
  const free = [];
  for (const id of dump.items) {
    const ns = nsOf(id);
    if (audited.has(ns) || skipNs.has(ns) || notFree(id)) continue;
    free.push(id);
  }
  for (const f of dump.fluids) {
    const ns = nsOf(f);
    if (audited.has(ns) || skipNs.has(ns) || notFree('fluid:' + f)) continue;
    free.push('fluid:' + f);
  }
  const world = [{ id: 'other-mods', mode: 'auto', items: free, note: "items and fluids from the unaudited namespaces" }];

  // 2) veins from the drill tables in the dimensions that are reached (requireRecipe: the ones with a recipe; a
  // list = several drills, e.g. the vein one and the lunar one, each with its own recipe type)
  const veins = ob.veins || {};
  const requireRecipes = Array.isArray(veins.requireRecipe) ? veins.requireRecipe : [veins.requireRecipe || null];
  requireRecipes.forEach((rr, i) => world.push({
    id: requireRecipes.length > 1 ? `veins-${rr ? rr.type : i + 1}` : 'veins', mode: 'auto', template: 'gtceu:raw_{m}',
    fromVeins: { dimensions: reach, ...(rr ? { requireRecipe: rr } : {}), ...(veins.requireItem ? { requireItem: veins.requireItem } : {}) },
    note: `raw ores from the table veins in the dimensions that are reached${rr ? ` (with recipe ${rr.type})` : ''}`,
  }));

  // 3) fluid deposits (weight > 0) in those dimensions, with the fluid drilling rig if registered
  const rigs = ob.fluidRigs || [...dump.machines.keys()].filter((m) => /fluid_drilling_rig$/.test(m)).sort();
  const fv = (dump.fluidVeins || []).filter((v) => v.fluid && dump.fluids.has(v.fluid) && (v.weight === undefined || v.weight > 0) &&
    (v.dims === null || v.dims === undefined || v.dims.some((d) => reach.includes(d))));
  if (fv.length > 0) {
    world.push({
      id: 'deposits', mode: 'auto', ...(rigs.length > 0 ? { via: rigs } : {}),
      items: [...new Set(fv.map((v) => 'fluid:' + v.fluid))], note: 'fluid deposits with weight in the dimensions that are reached',
    });
  }
  for (const w of asArray(ob.world)) world.push(w);

  // 4) buckets: a fluid's bucket is filled and emptied with no recipe
  const synthetic = [...asArray(raw.synthetic)];
  for (const id of dump.items) {
    const ns = nsOf(id);
    if (!audited.has(ns) || !id.endsWith('_bucket')) continue;
    const fluid = id.slice(0, -'_bucket'.length);
    if (!dump.fluids.has(fluid)) continue;
    synthetic.push({ id: `fill:${id}`, consumes: ['fluid:' + fluid, 'minecraft:bucket'], produces: [id] });
    synthetic.push({ id: `empty:${id}`, consumes: [id], produces: ['fluid:' + fluid] });
  }

  // 5) bees: an egg gives its bee, and the incubator gives the egg of a bee you already have (egg + treat with the gene)
  const bees = ob.bees === undefined ? true : !!ob.bees;
  const extraFacts = reach.map((d) => 'dim:' + d);
  const nbtTyped = bees ? asArray((ob.beeOptions || {}).nbtTyped).concat(DEFAULT_NBT_TYPED) : [];
  if (bees) {
    const opts = ob.beeOptions || {};
    for (const b of asArray(opts.worldBees === undefined ? ['minecraft:bee'] : opts.worldBees)) extraFacts.push(beeKey(b));
    for (const b of beeIds(dump)) {
      const name = pathOf(b);
      let egg = null;
      if (b === 'minecraft:bee') egg = dump.items.has('minecraft:bee_spawn_egg') ? 'minecraft:bee_spawn_egg' : null;
      else if (dump.items.has(`${nsOf(b)}:spawn_egg_${name}`)) egg = `${nsOf(b)}:spawn_egg_${name}`;
      else if (dump.items.has('productivebees:spawn_egg_configurable_bee')) egg = `productivebees:spawn_egg_configurable_bee#${b}`;
      if (egg) {
        synthetic.push({ id: `egg:${b}`, consumes: [egg], produces: [beeKey(b)] });
        synthetic.push({ id: `incubator:${b}`, capital: [beeKey(b)], consumes: ['minecraft:egg'], produces: [egg] });
      }
      if (dump.items.has('productivebees:configurable_comb') && dump.items.has('productivebees:configurable_honeycomb')) {
        synthetic.push({ id: `honeycomb-block:${b}`, consumes: [`productivebees:configurable_honeycomb#${b}`], produces: [`productivebees:configurable_comb#${b}`] });
        synthetic.push({ id: `honeycomb:${b}`, consumes: [`productivebees:configurable_comb#${b}`], produces: [`productivebees:configurable_honeycomb#${b}`] });
      }
    }
  }

  // 6) recipe types with no GT machine: made by hand or with another mod's block (obtainable); GT's types need their machine
  const aliases = raw.typeAliases || {};
  const gtTypes = new Set(dump.recipeTypes.keys());
  const freeTypes = new Set(asArray(raw.unconditionalTypes));
  for (const r of dump.recipes.values()) {
    const a = aliases[r.type] || r.type;
    if (!gtTypes.has(r.type) && !gtTypes.has(a) && !skipNs.has(nsOf(a))) freeTypes.add(a);
  }
  const ignoreTypes = [...asArray(raw.ignoreTypes), ...[...skipNs].map((ns) => `${ns}:*`)];

  // 7) keys for later-era sources (created before closing the graph; the facts are given on each pass)
  const later = laterStages(dump, ob);
  const extraKeys = later.flatMap((s) => s.keys);

  const derived = {
    ...raw,
    tier: raw.tier || 'obtain',
    unconditionalTypes: [...freeTypes],
    ignoreTypes,
    conditions: { '*': { ignore: true }, dimension: { asKeys: true }, ...(ob.conditions || {}) },
    world,
    machines: asArray(raw.machines),
    machinesFromRegistry: [{ prefix: '', multiblocks: true, maxEUtByTier: true, includeTypeless: true, excludeTypes: ['gtceu:dummy'] }],
    synthetic,
    targets: [], autoTargets: [], targetsFromVeins: [], autoTargetsFromVeins: [], eraItems: [], eraResources: [],
    nbtTyped, bees, extraFacts, extraKeys,
  };
  return { derived, later, warnings, reach };
}

/**
 * Later-era sources, in order (`obtain.later`): dimensions (all their veins, and the recipes with their condition),
 * specific veins (the End's, set aside in veins_excluded.json), loose vein materials (`materials`: their raw ores, for
 * a vein the pack already removed from the world and that no longer appears in veins.json), and loose items. Each stage
 * adds to the previous ones.
 */
function laterStages(dump, ob) {
  const out = [];
  for (const s of asArray(ob.later)) {
    const dims = asArray(s.dimensions);
    const veinIds = new Set(asArray(s.veins));
    const keys = dims.map((d) => 'dim:' + d);
    const mats = new Set(asArray(s.materials));
    for (const v of dump.veins || []) {
      if (veinIds.has(v.id) || (dims.length > 0 && v.dims.some((d) => dims.includes(d)))) for (const m of v.mats) mats.add(m);
    }
    for (const m of mats) keys.push(...rawOreIds(dump, m));
    // site items (a planet's ground blocks...): ids or globs against the registry (not ore blocks: a planet's ore
    // in stone doesn't mean there's a vein there)
    for (const it of asArray(s.items)) {
      if (/[*?]/.test(it)) {
        const match = makeGlobMatcher([it]);
        for (const id of dump.items) if (match(id) && !/_ore$/.test(id)) keys.push(id);
      } else keys.push(it);
    }
    out.push({ id: s.id, era: s.era || '', until: s.until || null, label: s.label || s.id, dimensions: dims, veins: [...veinIds], keys: [...new Set(keys)], materials: [...mats].sort() });
  }
  return out;
}

/** Ore forms (the ones that come from mining or drilling a vein): raw, crushed, washed, refined, impure and purified dust. */
export const isOreForm = (id) => !id.startsWith('fluid:') &&
  /^(raw_.+|crushed_.+_ore|purified_.+_ore|refined_.+_ore|impure_.+_dust|pure_.+_dust|.+_indicator)$/.test(pathOf(id));

/** Materials of each namespace per the registry's forms (dust, ingot, gem, raw ore, fluid). */
function materialSets(ids) {
  const sets = new Map();
  const add = (ns, m) => {
    if (!m) return;
    if (!sets.has(ns)) sets.set(ns, new Set());
    sets.get(ns).add(m);
  };
  for (const id of ids) {
    const ns = nsOf(id);
    const p = pathOf(id);
    if (id.startsWith('fluid:')) {
      add(ns, p.replace(/^molten_/, '').replace(/_plasma$/, ''));
      continue;
    }
    let m;
    if ((m = /^(.+)_dust$/.exec(p)) && !/^(small|tiny|impure|pure)_/.test(m[1])) add(ns, m[1]);
    else if ((m = /^(.+)_ingot$/.exec(p)) && !/^hot_/.test(m[1])) add(ns, m[1]);
    else if ((m = /^(.+)_gem$/.exec(p)) && !/^(chipped|flawed|flawless|exquisite)_/.test(m[1])) add(ns, m[1]);
    else if ((m = /^raw_(.+)$/.exec(p)) && !/_block$/.test(m[1])) add(ns, m[1]);
  }
  return sets;
}

/**
 * Words that make up a material's variants in GT (TagPrefix prefixes and suffixes, cables, pipes, tools) and addons'
 * (milled, foam, nanites). An item only goes in a material's group if the rest of its id is these words:
 * gtceu:double_iron_plate is iron; gtceu:industrial_steam_casing or gcyr:moon_stone aren't forms of steam or stone.
 */
const FORM_TOKENS = new Set([
  'tiny', 'small', 'impure', 'pure', 'crushed', 'purified', 'refined', 'raw', 'hot', 'double', 'dense', 'long', 'fine', 'chipped',
  'flawed', 'flawless', 'exquisite', 'molten', 'liquid', 'plasma', 'dust', 'ingot', 'gem', 'nugget', 'block', 'plate', 'foil', 'rod',
  'bolt', 'screw', 'ring', 'round', 'spring', 'gear', 'rotor', 'frame', 'lens', 'wire', 'ore', 'bucket', 'single', 'quadruple',
  'octal', 'hex', 'cable', 'normal', 'large', 'huge', 'nonuple', 'fluid', 'item', 'pipe', 'restrictive', 'buzz', 'saw', 'blade',
  'turbine', 'drill', 'head', 'chainsaw', 'tip', 'wrench', 'screwdriver', 'cutter', 'pickaxe', 'shovel', 'axe', 'hoe', 'sword',
  'file', 'hammer', 'knife', 'mortar', 'crowbar', 'mining', 'spade', 'scythe', 'butchery', 'plunger', 'mallet', 'crate', 'drum',
  'buzzsaw', 'shears', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'milled', 'froth', 'nanites', 'indicator',
]);

/**
 * An item's group: the longest material whose name appears whole in the id with the rest being form words
 * (iron < wrought_iron), or the item itself. Registered machines go alone.
 */
function makeGrouper(sets, machines) {
  const gt = sets.get('gtceu') || new Set();
  return (id) => {
    const ns = nsOf(id);
    if (machines.has(id)) return { group: id, material: null, ns };
    const own = sets.get(ns) || new Set();
    const p = pathOf(id).replace(/^flowing_/, '');
    const tok = p.split('_');
    const restIsForm = (i, j) => tok.every((t, x) => (x >= i && x < j) || FORM_TOKENS.has(t));
    let best = null;
    for (let i = 0; i < tok.length; i++) {
      for (let j = tok.length; j > i; j--) {
        if (best && j - i <= best.n) break;
        const cand = tok.slice(i, j).join('_');
        if (!own.has(cand) && !gt.has(cand)) continue;
        if (!restIsForm(i, j)) continue;
        best = { n: j - i, ns: own.has(cand) ? ns : 'gtceu', m: cand };
      }
    }
    if (!best) return { group: id, material: null, ns };
    return { group: best.ns === 'gtceu' ? best.m : `${best.ns}:${best.m}`, material: best.m, ns: best.ns };
  };
}

/**
 * First config rule that names the group (material or one of its items). Optional rule filters:
 * `partial` (true: only groups with loose forms; false: only whole materials) and `forms: "ore"` (every missing form
 * is an ore form: the material is obtainable another way but has no vein). `stage` picks which rules are checked:
 *   'first'    the A and B ones (decided before anything else: give it a source now, or its era);
 *   'after'    the C ones (only if the group doesn't arrive with a later era: what arrives isn't "never");
 *   'fallback' the fallback ones (`fallback: true`, any class), at the end.
 */
function makeClassifier(rules) {
  const compiled = asArray(rules).map((r, idx) => ({
    idx, rule: r, mats: makeGlobMatcher(asArray(r.materials)), items: makeGlobMatcher(asArray(r.items)), used: 0,
    any: asArray(r.materials).length === 0 && asArray(r.items).length === 0,
  }));
  const stageOf = (r) => (r.fallback ? 'fallback' : r.class === 'C' ? 'after' : 'first');
  const classify = (group, stage) => {
    for (const c of compiled) {
      if (stageOf(c.rule) !== stage) continue;
      if (c.rule.partial !== undefined && c.rule.partial === group.full) continue;
      if (c.rule.forms === 'ore' && !group.keys.every(isOreForm)) continue;
      if (c.any || c.mats(group.id) || group.keys.some((k) => c.items(k))) {
        c.used++;
        return c.rule;
      }
    }
    return null;
  };
  return { classify, compiled };
}

/**
 * Runs the audit. Returns {verdict, groups, stats, later, unusedRules, warnings, model}.
 * opts.unlocks = false skips computing what each material would unlock (faster, for tests that don't look at it).
 */
export function runObtain(dump, raw, opts = {}) {
  const t0 = Date.now();
  const ob = raw.obtain || {};
  const { derived, later, warnings } = obtainConfig(dump, raw);
  const model = buildModel(dump, derived);
  warnings.push(...model.warnings);
  const g = model.g;
  const baseFacts = [...model.facts.manual, ...model.facts.auto];
  const base = lfp(g, { facts: baseFacts });
  const idOf = (name) => g.keyIndex.get(name);
  const reachedIn = (res, name) => {
    const k = idOf(name);
    return k !== undefined && res.reached[k] === 1;
  };

  // audited: items and fluids of the `audit` namespaces, without "flowing_" fluids or whatever `ignore` sets aside;
  // `ignoreOreBlocks`: ore blocks (stone + material + "_ore") are world blocks, not listed (but the milled, washed
  // and refined forms are: crushed_/purified_/refined_)
  const audited = new Set(ob.audit || []);
  const ignoreGlob = makeGlobMatcher(ob.ignore || []);
  const oreBlock = (id) => !!ob.ignoreOreBlocks && !id.startsWith('fluid:') && /_ore$/.test(id) && !/^(crushed|purified|refined)_/.test(pathOf(id));
  const ignore = (id) => ignoreGlob(id) || oreBlock(id);
  const auditedIds = [];
  for (const id of dump.items) if (audited.has(nsOf(id)) && !ignore(id)) auditedIds.push(id);
  for (const f of dump.fluids) if (audited.has(nsOf(f)) && !/^flowing_/.test(pathOf(f)) && !ignore('fluid:' + f)) auditedIds.push('fluid:' + f);
  const never = new Set(auditedIds.filter((n) => !reachedIn(base, n)));

  // groups by material
  const grouper = makeGrouper(materialSets(auditedIds), dump.machines);
  const groups = new Map();
  for (const id of auditedIds) {
    const gi = grouper(id);
    if (!groups.has(gi.group)) groups.set(gi.group, { id: gi.group, material: gi.material, ns: gi.ns, all: [], keys: [] });
    const grp = groups.get(gi.group);
    grp.all.push(id);
    if (never.has(id)) grp.keys.push(id);
  }
  const neverGroups = [...groups.values()].filter((grp) => grp.keys.length > 0);
  const groupOfKey = new Map();
  for (const grp of neverGroups) for (const k of grp.keys) groupOfKey.set(k, grp);

  // recipes that need (a slot with no alternative reachable from anything in the group) or give something from the group
  for (const grp of neverGroups) {
    grp.uses = new Set();
    grp.makes = new Set();
  }
  const neverIds = new Map();
  for (const k of never) {
    const id = idOf(k);
    if (id !== undefined) neverIds.set(id, groupOfKey.get(k));
  }
  for (let r = 0; r < g.rules.length; r++) {
    const rule = g.rules[r];
    if (rule.kind !== 'recipe') continue;
    for (const slot of rule.slots) {
      if (slot.alts.some((a) => base.reached[a] === 1)) continue;
      for (const a of slot.alts) {
        const grp = neverIds.get(a);
        if (grp) grp.uses.add(r);
      }
    }
    for (const o of rule.outs) {
      const grp = neverIds.get(o);
      if (grp) grp.makes.add(r);
    }
  }

  // what the recipes that need it give (hints for class A), and what would unlock if the material were obtained
  const outsOf = (grp) => {
    const counts = new Map();
    const own = new Set(grp.keys.map(idOf).filter((k) => k !== undefined));
    for (const r of grp.uses) {
      for (const o of g.rules[r].outs) {
        if (own.has(o)) continue;
        const name = g.keyNames[o];
        if (!counts.has(name)) counts.set(name, { key: name, n: 0, reached: base.reached[o] === 1 });
        counts.get(name).n++;
      }
    }
    return [...counts.values()].sort((a, b) => b.n - a.n || (a.key < b.key ? -1 : 1));
  };
  const typesOf = (set) => {
    const c = new Map();
    for (const r of set) c.set(g.rules[r].type, (c.get(g.rules[r].type) || 0) + 1);
    return [...c.entries()].sort((a, b) => b[1] - a[1]).map(([type, n]) => ({ type, n }));
  };
  for (const grp of neverGroups) {
    grp.gives = outsOf(grp);
    grp.useTypes = typesOf(grp.uses);
    grp.makeTypes = typesOf(grp.makes);
    grp.full = grp.keys.length === grp.all.length;
    grp.unlocks = null;
  }

  // later eras: the first (cumulative) stage in which the group is obtained
  const stageInfo = [];
  let facts = [...baseFacts];
  const pending = new Set(neverGroups);
  for (const s of later) {
    facts = [...facts, ...s.keys.map(idOf).filter((k) => k !== undefined)];
    const res = lfp(g, { facts });
    let n = 0;
    for (const grp of [...pending]) {
      if (grp.keys.some((k) => reachedIn(res, k))) {
        grp.later = { id: s.id, era: s.era, label: s.label, until: s.until };
        pending.delete(grp);
        n++;
      }
    }
    stageInfo.push({ id: s.id, era: s.era, label: s.label, groups: n, dimensions: s.dimensions, veins: s.veins, materials: s.materials.length });
  }

  // classification: A and B rules, then creative-only, then later era (what arrives with an era isn't "never", so a
  // C rule doesn't cover it), then the C rules, and finally the fallback ones; otherwise, «?»
  const { classify, compiled } = makeClassifier(ob.classes);
  const creative = makeGlobMatcher(ob.creative || []);
  // what the pack already hides: items and fluids from the tag (an empty item tag dumps as [minecraft:barrier])
  const hiddenItems = dump.tags.itemTags.get(HIDDEN_TAG) || null;
  const hiddenFluids = dump.tags.fluidTags.get(HIDDEN_TAG) || null;
  const hiddenSet = hiddenItems || hiddenFluids
    ? new Set([...(hiddenItems || []).filter((id) => id !== 'minecraft:barrier'), ...(hiddenFluids || []).map((f) => 'fluid:' + f)])
    : null;
  const apply = (grp, rule, by) => {
    grp.cls = rule.class;
    grp.reason = rule.reason || '';
    grp.era = rule.era || (grp.later ? grp.later.era : '');
    grp.until = rule.class === 'C' ? 'never' : rule.until || (grp.later ? grp.later.until : null) || null;
    grp.keepRecipes = !!rule.keepRecipes;
    grp.source = rule.source || '';
    grp.by = by;
  };
  for (const grp of neverGroups) {
    const rule = classify(grp, 'first');
    if (rule) apply(grp, rule, 'config');
    else if (grp.keys.every((k) => creative(k))) {
      grp.cls = 'C';
      grp.reason = 'creative mode only';
      grp.until = 'never';
      grp.by = 'creative';
    } else if (grp.later) {
      grp.cls = 'B';
      grp.era = grp.later.era;
      grp.until = grp.later.until || null;
      grp.reason = `comes from ${grp.later.label}`;
      grp.by = 'era';
    } else {
      const late = classify(grp, 'after') || classify(grp, 'fallback');
      if (late) apply(grp, late, 'config');
      else {
        grp.cls = '?';
        grp.reason = autoReason(grp, g, base, groupOfKey);
        grp.until = null;
        grp.by = 'unclassified';
      }
    }
    if (grp.cls === 'A') grp.until = null;
    if (grp.cls === 'B' && !ERA_IDS.includes(grp.until)) warnings.push(`${grp.id}: class B with no valid «until» (the era it arrives in: ${ERA_IDS.join(', ')}); the hidden table can't hide it`);
    grp.hidden = hiddenSet ? grp.keys.filter((k) => hiddenSet.has(k)).length : null;
  }

  // the pack's hiding vs. the audit: nothing obtainable can be hidden (its recipes wouldn't be seen), and if we know
  // which era the pack has implemented up to (opts.implementedEra or info.json: hidden.implementedEra, dumped by
  // integration/hidden.js), every C and every B from a later era must be hidden (otherwise the table is stale)
  let hiding = null;
  if (hiddenSet) {
    const era = opts.implementedEra || (dump.info && dump.info.hidden && dump.info.hidden.implementedEra) || null;
    const limit = ERA_IDS.indexOf(era);
    const obtainable = [...hiddenSet].filter((k) => reachedIn(base, k)).sort();
    let visible = null;
    if (limit >= 0) {
      visible = [];
      for (const grp of neverGroups) {
        if (grp.until !== 'never' && !(ERA_IDS.indexOf(grp.until) > limit)) continue;
        for (const k of grp.keys) if (!hiddenSet.has(k)) visible.push({ key: k, group: grp.id, until: grp.until });
      }
    }
    hiding = {
      items: [...hiddenSet].filter((k) => !k.startsWith('fluid:')).length, fluids: [...hiddenSet].filter((k) => k.startsWith('fluid:')).length,
      implementedEra: limit >= 0 ? era : null, obtainable, visible,
    };
  }

  // what would unlock if the material were obtained (only for class A and unclassified, since that's where it's decided): one
  // pass with its forms as facts, without the recipes that recycle those forms (milling or smelting an impossible machine
  // would give back its materials and "unlock" half the table); counts what becomes obtainable outside the group itself
  if (opts.unlocks !== false) {
    const limit = ob.unlockLimit === undefined ? 200 : ob.unlockLimit;
    const cand = neverGroups.filter((grp) => (grp.cls === 'A' || grp.cls === '?') && grp.gives.some((o) => !o.reached))
      .sort((a, b) => b.uses.size - a.uses.size).slice(0, limit);
    const recycling = (r) => /_recycling$/.test(String((g.rules[r].meta || {}).category || ''));
    for (const grp of cand) {
      const enabled = new Uint8Array(g.rules.length).fill(1);
      for (const r of grp.uses) if (recycling(r)) enabled[r] = 0;
      const res = lfp(g, { facts: [...baseFacts, ...grp.keys.map(idOf).filter((k) => k !== undefined)], enabled });
      const opened = new Set();
      let n = 0;
      for (const k of never) {
        if (groupOfKey.get(k) === grp || !reachedIn(res, k)) continue;
        n++;
        opened.add(groupOfKey.get(k).id);
      }
      grp.unlocks = { keys: n, groups: [...opened].sort() };
    }
  }

  const order = { A: 0, B: 1, C: 2, '?': 3 };
  neverGroups.sort((a, b) => order[a.cls] - order[b.cls] || (a.id < b.id ? -1 : 1));
  const count = (cls) => {
    const list = neverGroups.filter((grp) => grp.cls === cls);
    const recipes = new Set();
    for (const grp of list) for (const r of [...grp.uses, ...grp.makes]) recipes.add(r);
    return {
      groups: list.length,
      items: list.reduce((n, grp) => n + grp.keys.filter((k) => !k.startsWith('fluid:')).length, 0),
      fluids: list.reduce((n, grp) => n + grp.keys.filter((k) => k.startsWith('fluid:')).length, 0),
      recipes: recipes.size,
    };
  };
  const byClass = { A: count('A'), B: count('B'), C: count('C'), '?': count('?') };
  const allRecipes = new Set();
  for (const grp of neverGroups) for (const r of [...grp.uses, ...grp.makes]) allRecipes.add(r);
  const unusedRules = compiled.filter((c) => c.used === 0).map((c) => ({ index: c.idx, class: c.rule.class, reason: c.rule.reason || '', materials: asArray(c.rule.materials), items: asArray(c.rule.items) }));
  const hidingBad = !!hiding && (hiding.obtainable.length > 0 || (hiding.visible !== null && hiding.visible.length > 0));
  const verdict = byClass['?'].groups > 0 || hidingBad ? 'FAIL' : 'PASS';
  return {
    verdict, groups: neverGroups, byClass, later: stageInfo, unusedRules, warnings, model, base, hiding,
    stats: {
      audited: auditedIds.length, never: never.size, groups: neverGroups.length, recipes: allRecipes.size,
      full: neverGroups.filter((grp) => grp.full).length, partial: neverGroups.filter((grp) => !grp.full).length,
      hiddenKnown: !!hiddenSet, ms: Date.now() - t0, rules: g.rules.length,
    },
  };
}

/**
 * Automatic reason for an unclassified group: that nothing makes it, that it only comes from its own forms or from
 * recycling what's made from it, or what the recipes that give it need (from outside).
 */
function autoReason(grp, g, base, groupOfKey) {
  if (grp.makes.size === 0) return grp.uses.size > 0 ? `nothing makes it; ${grp.uses.size} recipes need it` : "no recipes: it's only in the registry";
  const own = new Set(grp.keys);
  const madeFrom = new Set();
  for (const r of grp.uses) for (const o of g.rules[r].outs) madeFrom.add(g.keyNames[o]);
  const need = new Map();
  for (const r of grp.makes) {
    for (const slot of g.rules[r].slots) {
      if (slot.alts.some((a) => base.reached[a] === 1)) continue;
      const names = slot.alts.map((a) => g.keyNames[a]);
      if (names.some((n) => own.has(n) || madeFrom.has(n))) continue;
      const other = groupOfKey.get(names[0]);
      const label = other ? other.id : slot.label;
      need.set(label, (need.get(label) || 0) + 1);
    }
  }
  const top = [...need.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
  return top.length > 0 ? `its recipes need ${top.join(', ')}` : 'it only comes from its own forms or from recycling what is made from it';
}

const short = (list, n) => (list.length <= n ? list.join(', ') : `${list.slice(0, n).join(', ')} (+${list.length - n})`);
const ruleNames = (g, set, n) => short([...set].map((r) => g.rules[r].name).sort(), n);
const givesText = (grp, n = 4) => short(grp.gives.map((o) => `${o.key}${o.reached ? '' : ' (new)'}`), n);

/** Why the step fails: unclassified groups and, if the dump says so, hiding that doesn't match the audit. */
function failWhy(res) {
  const why = [];
  if (res.byClass['?'].groups > 0) why.push(`${res.byClass['?'].groups} unclassified groups`);
  if (res.hiding && res.hiding.obtainable.length > 0) why.push(`${res.hiding.obtainable.length} hidden but obtainable`);
  if (res.hiding && res.hiding.visible && res.hiding.visible.length > 0) why.push(`${res.hiding.visible.length} not hidden`);
  return why.join('; ');
}

/** Lines for the pack's hiding (c:hidden_from_recipe_viewers tag) vs. the audit. */
function hidingLines(res, n = 20) {
  const h = res.hiding;
  if (!h) return [];
  const L = [`Hidden in the pack (${HIDDEN_TAG}): ${h.items} items and ${h.fluids} fluids; ${h.implementedEra
    ? `implemented up to ${h.implementedEra}`
    : "the dump doesn't say which era is implemented (integration/hidden.js): what's left to hide isn't checked"}`];
  L.push(`  obtainable but hidden: ${h.obtainable.length}${h.obtainable.length > 0 ? ' — ' + short(h.obtainable, n) : ''}`);
  if (h.visible) {
    L.push(`  should be hidden (C, or B from an era later than ${h.implementedEra}) and are visible: ${h.visible.length}${h.visible.length > 0
      ? ' — ' + short(h.visible.map((v) => `${v.key} (${v.group}, ${v.until})`), n) + ' (regenerate the hidden table: --table)' : ''}`);
  }
  return L;
}

/** Text report (console and --out). */
export function renderObtainText(res, file) {
  const L = [];
  const s = res.stats;
  L.push('=== OBTAIN STEP: what is never obtained ===');
  if (file) L.push(`Config  : ${file}`);
  L.push(`Audited : ${s.audited} items and fluids; ${s.never} are never obtained, in ${s.groups} groups (${s.full} whole materials, ${s.partial} with loose forms); ${s.recipes} recipes need or give them.`);
  L.push(`Model   : ${s.rules} rules (${s.ms} ms)${s.hiddenKnown ? '' : '; the dump has no ' + HIDDEN_TAG + ' tag (what is already hidden is unknown)'}`);
  for (const st of res.later) L.push(`Later era ${st.label} (${st.era}): ${st.groups} groups`);
  L.push('');
  L.push('CLASS  GROUPS  ITEMS  FLUIDS  RECIPES');
  for (const c of ['A', 'B', 'C', '?']) {
    const b = res.byClass[c];
    L.push(`${c.padEnd(6)} ${String(b.groups).padStart(6)}  ${String(b.items).padStart(7)}  ${String(b.fluids).padStart(7)}  ${String(b.recipes).padStart(7)}`);
  }
  if (res.hiding) {
    L.push('');
    L.push(...hidingLines(res));
  }
  for (const c of ['A', 'B', 'C', '?']) {
    const list = res.groups.filter((grp) => grp.cls === c);
    if (list.length === 0) continue;
    L.push('');
    L.push(`--- ${c} (${list.length}) ---`);
    for (const grp of list) {
      const extra = c === 'A' || c === '?' ? `; ${grp.uses.size} recipes need it (${givesText(grp)})` : '';
      L.push(`  ${grp.id}${grp.full ? '' : ' [loose forms]'}: ${grp.keys.length} — ${grp.reason}${grp.era ? ` [${grp.era}]` : ''}${extra}`);
    }
  }
  if (res.unusedRules.length > 0) {
    L.push('');
    L.push("Unused classification rules (what they name is already obtained, or doesn't exist):");
    for (const u of res.unusedRules) L.push(`  #${u.index} ${u.class}: ${short([...u.materials, ...u.items], 6)} — ${u.reason}`);
  }
  if (res.warnings.length > 0) {
    L.push('');
    L.push(`Warnings (${res.warnings.length}):`);
    for (const w of res.warnings.slice(0, 30)) L.push('  ' + w);
  }
  L.push('');
  L.push(`VERDICT: ${res.verdict}${res.verdict === 'FAIL' ? ` (${failWhy(res)})` : ''}`);
  return L.join('\n') + '\n';
}

/** Result in JSON (--json): each group with its items and the recipes that need or give it. */
export function obtainToJson(res) {
  const g = res.model.g;
  return {
    pass: 'obtain', verdict: res.verdict, stats: res.stats, byClass: res.byClass, later: res.later, unusedRules: res.unusedRules,
    warnings: res.warnings, hiding: res.hiding || null,
    groups: res.groups.map((grp) => ({
      id: grp.id, class: grp.cls, by: grp.by, reason: grp.reason, era: grp.era || '', until: grp.until || null, source: grp.source || '', full: grp.full,
      items: grp.keys, hidden: grp.hidden, later: grp.later || null,
      uses: [...grp.uses].map((r) => g.rules[r].name).sort(), makes: [...grp.makes].map((r) => g.rules[r].name).sort(),
      gives: grp.gives.slice(0, 20), unlocks: grp.unlocks,
    })),
  };
}

/**
 * The pack's hidden table (--table): pack/kubejs/data/grindless/tables/hidden_until.json, read by
 * server_scripts/grindless/integration/hidden.js. One group per material: the B ones with the era they arrive in
 * (`until`), the C ones with "never"; each with its items and fluids. C ones also carry `removeRecipes`: recipes that
 * only exist for them (an input slot that only accepts C items, or every output C), which hidden.js removes from the
 * server. `previous` (the table that already existed) keeps the removed recipes of groups that are still C: a dump
 * taken with hidden.js active no longer carries them.
 */
export function hiddenTable(res, opts = {}) {
  const g = res.model.g;
  const B = res.groups.filter((grp) => grp.cls === 'B');
  const C = res.groups.filter((grp) => grp.cls === 'C');
  const cIds = new Map();
  for (const grp of C) {
    for (const k of grp.keys) {
      const id = g.keyIndex.get(k);
      if (id !== undefined && !cIds.has(id)) cIds.set(id, grp);
    }
  }
  const removeOf = new Map(C.map((grp) => [grp, new Set()]));
  for (const rule of g.rules) {
    if (rule.kind !== 'recipe') continue;
    let owner = null;
    for (const slot of rule.slots) {
      if (slot.role === 'machine' || slot.role === 'cond') continue;
      if (slot.alts.length > 0 && slot.alts.every((a) => cIds.has(a))) {
        owner = cIds.get(slot.alts[0]);
        break;
      }
    }
    if (!owner && rule.outs.length > 0 && rule.outs.every((o) => cIds.has(o))) owner = cIds.get(rule.outs[0]);
    if (owner) removeOf.get(owner).add(rule.name);
  }
  const previous = new Map();
  for (const pg of asArray(opts.previous && opts.previous.groups)) {
    if (pg && pg.until === 'never' && Array.isArray(pg.removeRecipes)) previous.set(pg.material, pg.removeRecipes);
  }
  const entry = (grp) => {
    const e = {
      material: grp.id, until: grp.until, reason: grp.reason,
      items: grp.keys.filter((k) => !k.startsWith('fluid:')).sort(),
      fluids: grp.keys.filter((k) => k.startsWith('fluid:')).map((k) => k.slice(6)).sort(),
    };
    if (grp.cls === 'C') e.removeRecipes = grp.keepRecipes ? [] : [...new Set([...removeOf.get(grp), ...(previous.get(grp.id) || [])])].sort();
    if (grp.keepRecipes) e.keepRecipes = true;
    return e;
  };
  const rank = (u) => (u === 'never' ? ERA_IDS.length : ERA_IDS.indexOf(u));
  const groups = [...B, ...C].filter((grp) => grp.until).map(entry)
    .sort((a, b) => rank(a.until) - rank(b.until) || (a.material < b.material ? -1 : a.material > b.material ? 1 : 0));
  return {
    _source: `tools/analysis obtainability audit: node tools/analysis/reachability.mjs --pass obtain --dump <dump> --table <this file> (config tools/analysis/tiers/obtain.json${opts.dump ? `, dump ${opts.dump}` : ''}${opts.date ? `, ${opts.date}` : ''}). Do not edit by hand: change the audit config and regenerate.`,
    _how_it_is_used: [
      'server_scripts/grindless/integration/hidden.js reads it. Every group whose `until` is above IMPLEMENTED_ERA (the constant at the top of hidden.js) or is "never" gets its items and fluids into the tags c:hidden_from_recipe_viewers (EMI drops them from its index) and grindless:hidden_with_recipes (assets/emi/index/stacks/grindless_hidden_with_recipes.json disables that tag in EMI: every recipe with one of them as input, output or catalyst disappears from EMI too). Bumping IMPLEMENTED_ERA when an era lands shows that era\'s content again.',
      'until = era id of docs/journey.md (steam, lv, mv, hv, ev, iv, luv, zpm, uv, uhv, uev, uiv, uxv, opv, max) in which the group can first be obtained (class B of the audit: planets, the excluded End veins and everything that hangs on them). Its recipes stay on the server, only hidden.',
      'until = "never": junk (class C of the audit): hidden for good and its removeRecipes are removed from the server (recipes that only exist for it: an ingredient that only accepts junk, or junk as every output). Nothing is unregistered: old saves keep every id.',
      'keepRecipes = true: a hidden item whose recipes stay, on the server and in EMI (the old items of earlier versions and their conversion into the new ones): only c:hidden_from_recipe_viewers.',
      'material = audit group: a GT material with all its forms (dust, ingot, plate, fluid, bucket...) or a single item; reason = why (from the audit config).',
      'Regenerating keeps the removeRecipes of the groups that are still junk (a dump taken with hidden.js active no longer has those recipes).',
    ],
    eras: ERA_IDS,
    groups,
  };
}

/** The table as text: one group per line (reads and diffs well). */
export function renderHiddenTable(table) {
  const head = { ...table };
  delete head.groups;
  const lines = JSON.stringify(head, null, 2).split('\n');
  lines.pop();
  lines[lines.length - 1] += ',';
  lines.push('  "groups": [');
  table.groups.forEach((grp, i) => lines.push('    ' + JSON.stringify(grp) + (i < table.groups.length - 1 ? ',' : '')));
  lines.push('  ]', '}');
  return lines.join('\n') + '\n';
}

/** Markdown report (--md): summary table, the full A list, and compact B and C ones. */
export function renderObtainMarkdown(res, meta = {}) {
  const g = res.model.g;
  const s = res.stats;
  const L = [];
  L.push('# Obtainability audit');
  L.push('');
  L.push(`Dump: \`${meta.dump || ''}\`. Generated with \`node tools/analysis/reachability.mjs --pass obtain\`${meta.date ? ` on ${meta.date}` : ''}.`);
  L.push('');
  L.push(`Auditing ${s.audited} items and fluids (${meta.namespaces || ''}). **${s.never} are never obtained**, in ${s.groups} groups by material (${s.full} whole materials, ${s.partial} with loose forms), and ${s.recipes} recipes need or give them.`);
  L.push('');
  L.push('| Class | What to do | Groups | Items | Fluids | Recipes |');
  L.push('|---|---|---:|---:|---:|---:|');
  const what = { A: 'give it a source', B: 'hide until its era', C: 'hide with its recipes', '?': 'unclassified' };
  for (const c of ['A', 'B', 'C', '?']) {
    const b = res.byClass[c];
    if (c === '?' && b.groups === 0) continue;
    L.push(`| ${c} | ${what[c]} | ${b.groups} | ${b.items} | ${b.fluids} | ${b.recipes} |`);
  }
  L.push('');
  L.push(`Step verdict: **${res.verdict}**${res.verdict === 'FAIL' ? ` (${failWhy(res)})` : ''}.${s.hiddenKnown ? '' : ` The dump has no \`${HIDDEN_TAG}\` tag: what is already hidden is unknown.`}`);
  if (res.hiding) {
    L.push('');
    for (const line of hidingLines(res, 10)) L.push(line.startsWith('  ') ? `- ${line.trim()}` : line);
  }
  L.push('');
  L.push('## A: deserve a source');
  L.push('');
  const A = res.groups.filter((grp) => grp.cls === 'A');
  if (A.length === 0) L.push('None.');
  for (const grp of A) {
    L.push(`### ${grp.id}`);
    L.push('');
    L.push(`- **Why:** ${grp.reason}`);
    if (grp.source || grp.era) L.push(`- **Proposed source:** ${grp.source || '—'}${grp.era ? ` (era ${grp.era})` : ''}`);
    L.push(`- **Forms (${grp.keys.length}):** ${grp.keys.map((k) => `\`${k}\``).join(', ')}`);
    L.push(`- **Recipes that need it (${grp.uses.size}):** ${[...grp.uses].map((r) => `\`${g.rules[r].name}\``).sort().join(', ') || '—'}`);
    L.push(`- **Give:** ${grp.gives.map((o) => `\`${o.key}\`${o.reached ? '' : " (not obtained today)"}`).join(', ') || '—'}`);
    if (grp.unlocks) L.push(`- **Would unlock:** ${grp.unlocks.keys} more items/fluids${grp.unlocks.groups.length > 0 ? ` (${short(grp.unlocks.groups, 8)})` : ''}`);
    L.push(`- **Recipes that give it (${grp.makes.size}):** ${ruleNames(g, grp.makes, 12) || '—'}`);
    L.push('');
  }
  L.push('## B: arrive with a later era (hide until then)');
  L.push('');
  const compact = (list, head) => {
    const forms = list.reduce((n, grp) => n + grp.keys.length, 0);
    const recipes = new Set();
    for (const grp of list) for (const r of [...grp.uses, ...grp.makes]) recipes.add(r);
    L.push(`- **${head}** (${list.length} ${list.length === 1 ? 'group' : 'groups'}, ${forms} ${forms === 1 ? 'form' : 'forms'}, ${recipes.size} ${recipes.size === 1 ? 'recipe' : 'recipes'}): ${list.map((grp) => `\`${grp.id}\``).join(', ')}`);
  };
  const byKey = (list, keyOf) => {
    const m = new Map();
    for (const grp of list) {
      const k = keyOf(grp);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(grp);
    }
    return m;
  };
  const B = res.groups.filter((grp) => grp.cls === 'B');
  if (B.length === 0) L.push('None.');
  for (const [k, list] of byKey(B, (grp) => `${grp.era || '—'}: ${grp.reason}`)) compact(list, k);
  L.push('');
  L.push('## C: will never arrive (hide with their recipes)');
  L.push('');
  const C = res.groups.filter((grp) => grp.cls === 'C');
  if (C.length === 0) L.push('None.');
  for (const [reason, list] of byKey(C, (grp) => grp.reason)) compact(list, reason);
  L.push('');
  const U = res.groups.filter((grp) => grp.cls === '?');
  if (U.length > 0) {
    L.push('## Unclassified');
    L.push('');
    for (const grp of U) L.push(`- \`${grp.id}\` (${grp.keys.length} forms; ${grp.uses.size} need it, ${grp.makes.size} give it): ${grp.reason}`);
    L.push('');
  }
  L.push('## How it is computed');
  L.push('');
  L.push(`- **World sources:** the drill's table veins (the ones with a drilling recipe) in ${(meta.dimensions || []).map((d) => `\`${d}\``).join(', ')}; weighted fluid deposits; rubber trees, marble and red granite; bees (nests, crossbreeding, conversions, fishing and incubator eggs); everything from the unaudited mods, except spawn eggs and creative items.`);
  L.push("- **Recipes:** all of them, of any tier. Each registered machine runs recipes up to its tier's voltage; multiblocks, with no cap; energy, multiblock parts, the clean room and the other conditions are taken as obtainable, except dimension.");
  L.push("- **Groups:** each item goes to the longest material whose name it carries (dust, ingot, plate... of the same material together); whatever belongs to no material goes alone. \u00abLoose forms\u00bb = the material is obtainable, but those forms aren't. Ore blocks (stone + material) aren't listed: they're world blocks.");
  L.push(`- **Automatic B:** the group is obtained once a later era's sources are added (${res.later.map((st) => `${st.label}: ${st.era}`).join('; ')}).`);
  L.push('');
  return L.join('\n');
}
