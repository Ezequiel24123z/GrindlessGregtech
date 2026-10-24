// Normaliza el JSON crudo de cada receta a {entradas, salidas, EU/t, condiciones}.
// Las claves de recurso son: id de objeto tal cual ("minecraft:stick") y "fluid:<id>" para fluidos.
import { asArray } from './util.mjs';

export const fluidKey = (id) => 'fluid:' + id;
const MAX_CHANCE = 10000;

function labelOf(tags, alts, fallback) {
  if (alts.length === 0) {
    if (tags.length > 0) return `#${tags.join('|#')} (etiqueta vacía o inexistente en este pack)`;
    return fallback || '(vacío)';
  }
  if (tags.length === 1) return '#' + tags[0];
  if (tags.length > 1) return '#' + tags.join('|#');
  return alts.length === 1 ? alts[0] : `${alts[0]} (+${alts.length - 1})`;
}

/** Ingrediente de objeto (vanilla, Forge o GT) -> {alts:[ids], tags:[...], count, circuit?, bad?}. */
export function parseItemIngredient(j, tagIndex, st) {
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
    if (typeof x.item === 'string') res.alts.push(x.item);
    else if (typeof x.tag === 'string') {
      res.tags.push(x.tag);
      res.alts.push(...tagIndex.items(x.tag));
    } else if (!res.bad) {
      res.bad = 'forma desconocida';
      st.unresolved.add(String(x.type || JSON.stringify(x).slice(0, 60)));
    }
  };
  visit(j);
  res.alts = [...new Set(res.alts)];
  res.tags = [...new Set(res.tags)];
  return res;
}

/** Ingrediente de fluido de GT: {amount, value:[{fluid}|{tag}]} o {count_provider, inner}. */
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
  const addIn = (cap, c) => {
    const chance = c.chance === undefined ? MAX_CHANCE : c.chance;
    const maxChance = c.maxChance || MAX_CHANCE;
    if (cap === 'item') {
      const p = parseItemIngredient(c.content, tags, st);
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
      const p = parseItemIngredient(c.content, tags, st);
      const k = pickOutput(p);
      if (k) out.outputs.push({ key: k, chance: chance / maxChance, count: p.count });
      else out.warn.push('salida sin objeto: ' + labelOf(p.tags, p.alts, p.bad));
    } else if (cap === 'fluid') {
      const p = parseFluidIngredient(c.content, tags, st);
      const k = pickOutput(p);
      if (k) out.outputs.push({ key: k, chance: chance / maxChance, count: p.amount });
      else out.warn.push('salida de fluido sin fluido');
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
  out.conditions = asArray(j.recipeConditions);
  out.shape = 'gt';
  return out;
}

function resultOf(r) {
  if (!r) return [];
  if (typeof r === 'string') return [{ key: r, count: 1 }];
  if (Array.isArray(r)) return r.flatMap(resultOf);
  const id = r.item || r.id || (typeof r.result === 'string' ? r.result : null);
  return id ? [{ key: id, count: r.count || 1 }] : [];
}

function normalizeGeneric(out, j, ctx) {
  const { tags, st, cfg } = ctx;
  const toolTags = cfg.toolTagSet;
  const pushFluidContainer = (ing) => {
    // Receta con un recipiente lleno de fluido (cubo de agua, de creosota...): hace falta el fluido y algo donde llevarlo.
    const p = parseFluidIngredient(ing.fluid, tags, st);
    out.inputs.push({
      kind: 'fluid', alts: p.alts, label: 'fluid:' + labelOf(p.tags, p.alts.map((a) => a.slice(6)), p.bad), count: p.amount,
      cap: false, consume: 1, bad: p.bad, tags: p.tags,
    });
    out.inputs.push({
      kind: 'item', alts: cfg.fluidContainers || ['minecraft:bucket'], label: 'recipiente de fluidos', count: 1,
      cap: true, consume: 0, tags: [],
    });
  };
  const pushItem = (ing, extra = {}) => {
    if (ing && !Array.isArray(ing) && ing.type === 'gtceu:fluid_container') {
      pushFluidContainer(ing);
      return;
    }
    const p = parseItemIngredient(ing, tags, st);
    const cap = p.tags.length > 0 && p.tags.every((t) => toolTags.has(t));
    out.inputs.push({
      kind: cap ? 'tool' : 'item', alts: p.alts, label: labelOf(p.tags, p.alts, p.bad), count: p.count,
      cap, consume: cap ? 0 : 1, bad: p.bad, tags: p.tags, ...extra,
    });
  };
  if (j.pattern && j.key) {
    const syms = new Set();
    for (const row of asArray(j.pattern)) for (const ch of String(row)) if (ch !== ' ') syms.add(ch);
    for (const s of syms) {
      if (j.key[s] === undefined) out.warn.push(`símbolo "${s}" sin clave`);
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
  for (const r of [...resultOf(j.result), ...resultOf(j.results), ...resultOf(j.output)]) {
    out.outputs.push({ key: r.key, chance: 1, count: r.count });
  }
  return out;
}

/**
 * ctx = {tags: TagIndex, st: estadísticas, cfg: config con typeAliases y toolTagSet, gtTypes: Set de tipos GT}
 * Devuelve la receta normalizada (siempre un objeto).
 */
export function normalizeRecipe(rec, ctx) {
  const type = (ctx.cfg.typeAliases && ctx.cfg.typeAliases[rec.type]) || rec.type;
  const out = {
    id: rec.id, type, rawType: rec.type, added: rec.added, inputs: [], outputs: [], eut: 0, amp: 1, euOut: 0,
    conditions: [], shape: '', warn: [], otherCaps: new Set(),
  };
  const j = rec.json || {};
  const gtLike = ctx.gtTypes.has(rec.type) || ctx.gtTypes.has(type) ||
    (!j.pattern && !Array.isArray(j.ingredients) && (j.inputs || j.outputs || j.tickInputs || j.tickOutputs));
  return gtLike ? normalizeGT(out, j, ctx) : normalizeGeneric(out, j, ctx);
}
