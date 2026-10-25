// Normalizes each recipe's raw JSON into {inputs, outputs, EU/t, conditions}.
// Resource keys are: the item id as-is ("minecraft:stick") and "fluid:<id>" for fluids.
import { asArray } from './util.mjs';

export const fluidKey = (id) => 'fluid:' + id;
const MAX_CHANCE = 10000;

function labelOf(tags, alts, fallback) {
  if (alts.length === 0) {
    if (tags.length > 0) return `#${tags.join('|#')} (empty or nonexistent tag in this pack)`;
    return fallback || '(empty)';
  }
  if (tags.length === 1) return '#' + tags[0];
  if (tags.length > 1) return '#' + tags.join('|#');
  return alts.length === 1 ? alts[0] : `${alts[0]} (+${alts.length - 1})`;
}

/**
 * Type that holds a "configurable" item's NBT (Productive Bees' honeycombs, honeycomb blocks and eggs carry the bee
 * in EntityTag.type). The NBT arrives as an object or as SNBT/JSON text: {EntityTag:{type:"productivebees:iron"}}.
 */
export function nbtType(nbt) {
  if (!nbt) return null;
  if (typeof nbt === 'object') return nbt.EntityTag && typeof nbt.EntityTag.type === 'string' ? nbt.EntityTag.type : null;
  const m = /["']?type["']?\s*:\s*["']([^"']+)["']/.exec(String(nbt));
  return m ? m[1] : null;
}

/**
 * An item's key: with `nbtTyped` (a Set of ids, only for the obtainability audit) items on that list with an NBT type
 * are split by type ("productivebees:configurable_honeycomb#productivebees:iron"); the rest of the analysis merges them into one id.
 */
export function itemKey(item, nbt, nbtTyped) {
  if (!nbtTyped || !nbtTyped.has(item)) return item;
  const t = nbtType(nbt);
  return t ? `${item}#${t}` : item;
}

/** Item ingredient (vanilla, Forge or GT) -> {alts:[ids], tags:[...], count, circuit?, bad?}. */
export function parseItemIngredient(j, tagIndex, st, nbtTyped = null) {
  const res = { alts: [], tags: [], count: 1 };
  const visit = (x) => {
    if (x === null || x === undefined) return;
    if (typeof x === 'string') {
      if (x.startsWith('#')) {
        res.tags.push(x.slice(1));
        res.alts.push(...tagIndex.items(x.slice(1)));
      } else res.alts.push(x);
      return;
    }
    if (Array.isArray(x)) {
      x.forEach(visit);
      return;
    }
    if (typeof x !== 'object') return;
    if (typeof x.count === 'number' && res.count === 1) res.count = x.count;
    switch (x.type) {
      case 'gtceu:sized':
        visit(x.ingredient);
        return;
      case 'gtceu:circuit':
        res.alts.push('gtceu:programmed_circuit');
        res.circuit = x.configuration;
        return;
      case 'gtceu:int_provider':
        visit(x.ingredient);
        return;
      case 'gtceu:fluid_container':
        res.bad = 'fluid_container';
        st.unresolved.add('gtceu:fluid_container');
        return;
      case 'forge:compound':
        asArray(x.children).forEach(visit);
        return;
      case 'forge:difference':
        visit(x.base);
        return;
      case 'forge:intersection':
        asArray(x.children).forEach(visit);
        return;
      default:
        break;
    }
    if (typeof x.item === 'string') res.alts.push(itemKey(x.item, x.nbt, nbtTyped));
    else if (typeof x.tag === 'string') {
      res.tags.push(x.tag);
      res.alts.push(...tagIndex.items(x.tag));
    } else if (!res.bad) {
      res.bad = 'unknown form';
      st.unresolved.add(String(x.type || JSON.stringify(x).slice(0, 60)));
    }
  };
  visit(j);
  res.alts = [...new Set(res.alts)];
  res.tags = [...new Set(res.tags)];
  return res;
}

/** GT fluid ingredient: {amount, value:[{fluid}|{tag}]} or {count_provider, inner}. */
export function parseFluidIngredient(j, tagIndex, st) {
  const res = { alts: [], tags: [], amount: 0 };
  const visitValue = (v) => {
    if (typeof v === 'string') {
      if (v.startsWith('#')) {
        res.tags.push(v.slice(1));
        res.alts.push(...tagIndex.fluids(v.slice(1)).map(fluidKey));
      } else res.alts.push(fluidKey(v));
      return;
    }
    if (Array.isArray(v)) {
      v.forEach(visitValue);
      return;
    }
    if (v && typeof v === 'object') {
      if (typeof v.fluid === 'string') res.alts.push(fluidKey(v.fluid));
      else if (typeof v.tag === 'string') {
        res.tags.push(v.tag);
        res.alts.push(...tagIndex.fluids(v.tag).map(fluidKey));
      }
    }
  };
  const visit = (x) => {
    if (x === null || x === undefined) return;
    if (typeof x === 'string') {
      visitValue(x);
      return;
    }
    if (Array.isArray(x)) {
      x.forEach(visit);
      return;
    }
    if (x.inner) {
      visit(x.inner);
      return;
    }
    if (typeof x.amount === 'number') res.amount = x.amount;
    if (x.value !== undefined) visitValue(x.value);
    else if (x.fluid || x.tag) visitValue(x);
    else {
      res.bad = 'forma desconocida';
      st.unresolved.add(JSON.stringify(x).slice(0, 60));
    }
  };
  visit(j);
  res.alts = [...new Set(res.alts)];
  res.tags = [...new Set(res.tags)];
  return res;
}

function euOf(content) {
  if (typeof content === 'number') return { voltage: Math.abs(content), amperage: 1 };
  if (content && typeof content === 'object') {
    return { voltage: Math.abs(Number(content.voltage || 0)), amperage: Number(content.amperage || 1) };
  }
  return { voltage: 0, amperage: 1 };
}

function pickOutput(parsed) {
  return parsed.alts.length > 0 ? parsed.alts[0] : null;
}

function normalizeGT(out, j, ctx) {
  const { tags, st } = ctx;
  const nbtTyped = typedOf(ctx);
  const addIn = (cap, c) => {
    const chance = c.chance === undefined ? MAX_CHANCE : c.chance;
    const maxChance = c.maxChance || MAX_CHANCE;
    if (cap === 'item') {
      const p = parseItemIngredient(c.content, tags, st, nbtTyped);
      out.inputs.push({
        kind: 'item', alts: p.alts, label: labelOf(p.tags, p.alts, p.bad), count: p.count,
        cap: chance === 0, cat: chance > 0 && chance < maxChance, consume: chance / maxChance, bad: p.bad, tags: p.tags,
      });
    } else if (cap === 'fluid') {
      const p = parseFluidIngredient(c.content, tags, st);
      out.inputs.push({
        kind: 'fluid', alts: p.alts, label: 'fluid:' + labelOf(p.tags, p.alts.map((a) => a.slice(6)), p.bad), count: p.amount,
        cap: chance === 0, cat: chance > 0 && chance < maxChance, consume: chance / maxChance, bad: p.bad, tags: p.tags,
      });
    } else out.otherCaps.add(cap);
  };
  const addOut = (cap, c) => {
    const chance = c.chance === undefined ? MAX_CHANCE : c.chance;
    const maxChance = c.maxChance || MAX_CHANCE;
    if (cap === 'item') {
      const p = parseItemIngredient(c.content, tags, st, nbtTyped);
      const k = pickOutput(p);
      if (k) out.outputs.push({ key: k, chance: chance / maxChance, count: p.count });
      else out.warn.push('output with no item: ' + labelOf(p.tags, p.alts, p.bad));
    } else if (cap === 'fluid') {
      const p = parseFluidIngredient(c.content, tags, st);
      const k = pickOutput(p);
      if (k) out.outputs.push({ key: k, chance: chance / maxChance, count: p.amount });
      else out.warn.push('fluid output with no fluid');
    }
  };
  for (const [cap, list] of Object.entries(j.inputs || {})) for (const c of asArray(list)) addIn(cap, c);
  for (const [cap, list] of Object.entries(j.outputs || {})) for (const c of asArray(list)) addOut(cap, c);
  for (const c of asArray((j.tickInputs || {}).eu)) {
    const e = euOf(c.content);
    if (e.voltage > out.eut) {
      out.eut = e.voltage;
      out.amp = e.amperage;
    }
  }
  for (const c of asArray((j.tickOutputs || {}).eu)) out.euOut = Math.max(out.euOut, euOf(c.content).voltage);
  out.conditions = [...asArray(j.recipeConditions)];
  // GT category (e.g. gtceu:macerator_recycling): tells apart recycling an item from the recipe that makes the material
  if (typeof j.category === 'string') out.category = j.category;
  // GT stores the EBF's temperature in `data`, not in conditions
  if (j.data && typeof j.data.ebf_temp === 'number') {
    out.temp = j.data.ebf_temp;
    out.conditions.push({ type: 'ebf_temp', temperature: j.data.ebf_temp });
  }
  out.shape = 'gt';
  return out;
}

/** Set of ids with NBT typing (cfg.nbtTyped, only for the obtainability audit), or null. */
const typedOf = (ctx) => (ctx.cfg && ctx.cfg.nbtTyped instanceof Set ? ctx.cfg.nbtTyped : null);

/**
 * Output of a non-GT recipe. Productive Bees nests the item ({item: {type: 'forge:nbt', item, nbt}} or
 * {item: {tag}}); a tag output gives the first member (whatever the game hands over).
 */
function resultOf(r, ctx) {
  if (!r) return [];
  if (typeof r === 'string') return [{ key: r, count: 1 }];
  if (Array.isArray(r)) return r.flatMap((x) => resultOf(x, ctx));
  if (r.item && typeof r.item === 'object') return resultOf(r.item, ctx).map((o) => ({ ...o, count: r.count || o.count }));
  if (typeof r.tag === 'string' && !r.item && !r.id) {
    const first = ctx.tags.items(r.tag)[0];
    return first ? [{ key: first, count: r.count || 1 }] : [];
  }
  const id = r.item || r.id || (typeof r.result === 'string' ? r.result : null);
  return id ? [{ key: itemKey(id, r.nbt, typedOf(ctx)), count: r.count || 1 }] : [];
}

function normalizeGeneric(out, j, ctx) {
  const { tags, st, cfg } = ctx;
  const nbtTyped = typedOf(ctx);
  const toolTags = cfg.toolTagSet;
  const pushFluidContainer = (ing) => {
    // A recipe with a container full of fluid (water bucket, creosote bucket...): needs the fluid and something to carry it in.
    const p = parseFluidIngredient(ing.fluid, tags, st);
    out.inputs.push({
      kind: 'fluid', alts: p.alts, label: 'fluid:' + labelOf(p.tags, p.alts.map((a) => a.slice(6)), p.bad), count: p.amount,
      cap: false, consume: 1, bad: p.bad, tags: p.tags,
    });
    out.inputs.push({
      kind: 'item', alts: cfg.fluidContainers || ['minecraft:bucket'], label: 'fluid container', count: 1,
      cap: true, consume: 0, tags: [],
    });
  };
  const pushItem = (ing, extra = {}) => {
    if (ing && !Array.isArray(ing) && ing.type === 'gtceu:fluid_container') {
      pushFluidContainer(ing);
      return;
    }
    const p = parseItemIngredient(ing, tags, st, nbtTyped);
    const cap = p.tags.length > 0 && p.tags.every((t) => toolTags.has(t));
    out.inputs.push({
      kind: cap ? 'tool' : 'item', alts: p.alts, label: labelOf(p.tags, p.alts, p.bad), count: p.count,
      cap, consume: cap ? 0 : 1, bad: p.bad, tags: p.tags, ...extra,
    });
  };
  if (out.type === 'ae2:inscriber' && j.ingredients && !Array.isArray(j.ingredients)) {
    // AE2 15: in "inscribe" mode the dies (top and bottom) aren't consumed; in "press" mode all three ingredients are.
    for (const [slot, ing] of Object.entries(j.ingredients)) {
      pushItem(ing, slot !== 'middle' && j.mode !== 'press' ? { cap: true, consume: 0, kind: 'die' } : {});
    }
    out.shape = 'ae2-inscriber';
  } else if (j.pattern && j.key) {
    const syms = new Set();
    for (const row of asArray(j.pattern)) for (const ch of String(row)) if (ch !== ' ') syms.add(ch);
    for (const s of syms) {
      if (j.key[s] === undefined) out.warn.push(`symbol "${s}" has no key`);
      else pushItem(j.key[s]);
    }
    out.shape = 'shaped';
  } else if (Array.isArray(j.ingredients)) {
    j.ingredients.forEach((x) => pushItem(x));
    out.shape = 'shapeless';
  } else {
    if (j.ingredients && typeof j.ingredients === 'object') Object.values(j.ingredients).forEach((x) => pushItem(x));
    for (const k of ['ingredient', 'template', 'base', 'addition', 'input']) if (j[k] !== undefined) pushItem(j[k]);
    out.shape = 'generic';
  }
  if (out.type === 'ae2:transform' && j.circumstance) {
    // World transformation: items are thrown into a fluid (water) or made to explode. The fluid acts as an "adjacent
    // to" condition; the rest (explosion) counts as an unsupported condition unless the config says otherwise.
    const c = j.circumstance;
    if (c.type === 'fluid' && c.tag) out.conditions.push({ type: 'adjacent_fluid', fluids: ['#' + c.tag] });
    else if (c.type === 'fluid' && c.fluid) out.conditions.push({ type: 'adjacent_fluid', fluids: [c.fluid] });
    else out.conditions.push({ type: `ae2_circumstance_${c.type}` });
  }
  for (const r of [...resultOf(j.result, ctx), ...resultOf(j.results, ctx), ...resultOf(j.output, ctx)]) {
    out.outputs.push({ key: r.key, chance: 1, count: r.count });
  }
  return out;
}

/** Productive Bees types read as bee rules when the config asks for `bees` (obtainability audit). */
export const BEE_TYPES = new Set([
  'productivebees:advanced_beehive', 'productivebees:bee_breeding', 'productivebees:bee_conversion', 'productivebees:bee_spawning',
  'productivebees:bee_fishing', 'productivebees:block_conversion', 'productivebees:centrifuge', 'productivebees:bottler',
]);
export const beeKey = (id) => 'bee:' + id;

/**
 * Productive Bees: bees are "bee:<id>" keys (capital: not consumed). The hive gives the bee's honeycombs (an
 * NBT-less configurable honeycomb is the bee's own), crossbreeding gives offspring, conversion changes a bee with
 * an item, nests drop bees, and fishing pulls them out of water (biomes are taken as reachable).
 */
function normalizeBees(out, j, ctx) {
  const { tags, st } = ctx;
  const nbtTyped = typedOf(ctx);
  const bee = (b) => (typeof b === 'string' ? b : b && typeof b.bee === 'string' ? b.bee : null);
  const beeIn = (b) => {
    const id = bee(b);
    if (id) out.inputs.push({ kind: 'bee', alts: [beeKey(id)], label: 'bee ' + id, count: 1, cap: true, consume: 0, tags: [] });
    else out.warn.push('bee with no id');
  };
  const beeOut = (b) => {
    const id = bee(b);
    if (id) out.outputs.push({ key: beeKey(id), chance: 1, count: 1 });
  };
  const itemIn = (ing, cap = false) => {
    const p = parseItemIngredient(ing, tags, st, nbtTyped);
    out.inputs.push({
      kind: 'item', alts: p.alts, label: labelOf(p.tags, p.alts, p.bad), count: p.count, cap, consume: cap ? 0 : 1, bad: p.bad, tags: p.tags,
    });
  };
  const fluidOut = (f, amount) => {
    const id = f.fluid || (f.tag ? tags.fluids(f.tag)[0] : null);
    if (id) out.outputs.push({ key: fluidKey(id), chance: 1, count: amount || 0 });
  };
  switch (out.type) {
    case 'productivebees:advanced_beehive':
      beeIn(j.ingredient);
      for (const r of asArray(j.results)) {
        for (const o of resultOf(r, ctx)) {
          const key = nbtTyped && nbtTyped.has(o.key) && bee(j.ingredient) ? `${o.key}#${bee(j.ingredient)}` : o.key;
          out.outputs.push({ key, chance: (r.chance || 100) / 100, count: o.count });
        }
      }
      break;
    case 'productivebees:bee_breeding':
      beeIn(j.parent1);
      beeIn(j.parent2);
      asArray(j.offspring).forEach(beeOut);
      break;
    case 'productivebees:bee_conversion':
      beeIn(j.source);
      if (j.item) itemIn(j.item);
      beeOut(j.result);
      break;
    case 'productivebees:bee_spawning':
      itemIn(j.ingredient, true);
      asArray(j.results).forEach(beeOut);
      break;
    case 'productivebees:bee_fishing':
      beeOut(j.bee);
      break;
    case 'productivebees:block_conversion':
      beeIn(j.bee);
      if (j.from && j.from.Name) itemIn({ item: j.from.Name });
      if (j.to && j.to.Name) out.outputs.push({ key: j.to.Name, chance: (j.chance || 100) / 100, count: 1 });
      break;
    case 'productivebees:centrifuge':
      itemIn(j.ingredient);
      for (const o of asArray(j.outputs)) {
        if (o.fluid) fluidOut(o.fluid, o.amount);
        else for (const r of resultOf(o, ctx)) out.outputs.push({ key: r.key, chance: (o.chance || 100) / 100, count: r.count });
      }
      break;
    case 'productivebees:bottler': {
      itemIn(j.input);
      const p = parseFluidIngredient(j.fluid, tags, st);
      out.inputs.push({ kind: 'fluid', alts: p.alts, label: 'fluid:' + labelOf(p.tags, p.alts.map((a) => a.slice(6)), p.bad), count: p.amount, cap: false, consume: 1, bad: p.bad, tags: p.tags });
      for (const r of resultOf(j.output, ctx)) out.outputs.push({ key: r.key, chance: 1, count: r.count });
      break;
    }
    default:
      break;
  }
  out.shape = 'bees';
  return out;
}

/**
 * ctx = {tags: TagIndex, st: stats, cfg: config with typeAliases and toolTagSet, gtTypes: Set of GT types}
 * Returns the normalized recipe (always an object).
 */
export function normalizeRecipe(rec, ctx) {
  const type = (ctx.cfg.typeAliases && ctx.cfg.typeAliases[rec.type]) || rec.type;
  const out = {
    id: rec.id, type, rawType: rec.type, added: rec.added, inputs: [], outputs: [], eut: 0, amp: 1, euOut: 0,
    conditions: [], shape: '', warn: [], otherCaps: new Set(),
  };
  const j = rec.json || {};
  if (ctx.cfg && ctx.cfg.bees && BEE_TYPES.has(rec.type)) return normalizeBees(out, j, ctx);
  const gtLike = ctx.gtTypes.has(rec.type) || ctx.gtTypes.has(type) ||
    (!j.pattern && !Array.isArray(j.ingredients) && (j.inputs || j.outputs || j.tickInputs || j.tickOutputs));
  return gtLike ? normalizeGT(out, j, ctx) : normalizeGeneric(out, j, ctx);
}
