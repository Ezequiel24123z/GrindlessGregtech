// Parts a pack multiblock requires, read from the data description of its pattern (lib/patterns.js registers
// global.grindless.structures[<machine id>] and gg_dump.js dumps it to structures.json). This way the config doesn't
// hand-copy the patterns of machines other scripts implement: if they change, the analysis finds out on the next dump.
//
// Description: { id, slices: [[row, ...], ...], symbols: { <char>: symbol } } with symbols
//   { kind: 'controller'|'air'|'any' }
//   { kind: 'blocks',  blocks: [ids], limits? }          one of those blocks
//   { kind: 'frames',  materials: [names], limits? }     GT frames of those materials (gtceu:<material>_frame)
//   { kind: 'part',    ability: name, limits? }          a part with that ability (hatch, bus...)
//   { kind: 'oneOf',   options: [symbols] }              "casing OR part": options with min/exact are mandatory
// `abilityItems` (partAbilities in the config) says which items satisfy each ability in the analyzed tier.

const SKIP = new Set(['controller', 'air', 'any']);

const requiredByLimits = (o) => {
  const l = o.limits || {};
  return (l.exact !== undefined && l.exact !== null && l.exact >= 1) || (l.min !== undefined && l.min !== null && l.min >= 1);
};

function itemsOf(o, abilityItems, hasItem, problems) {
  let ids = [];
  if (o.kind === 'blocks') ids = o.blocks || [];
  else if (o.kind === 'frames') ids = (o.materials || []).map((m) => `gtceu:${m}_frame`);
  else if (o.kind === 'part') {
    if (!abilityItems[o.ability]) {
      const msg = `part «${o.ability}» isn't in the config's partAbilities (no way to know which items satisfy it)`;
      if (!problems.includes(msg)) problems.push(msg);
    }
    ids = abilityItems[o.ability] || [];
  }
  return [...new Set(ids)].filter((id) => hasItem(id));
}

function labelOf(o) {
  if (o.kind === 'blocks') return (o.blocks || []).slice(0, 3).join(' | ') + ((o.blocks || []).length > 3 ? ' | …' : '');
  if (o.kind === 'frames') return `${(o.materials || []).join('/')} frame`;
  if (o.kind === 'part') return `part «${o.ability}»`;
  return o.kind;
}

/**
 * Maximum number of parts with an ability the pattern allows: for each symbol, the sum of the limits (`exact` or
 * `max`, no limit = every cell) of its options with that ability, capped by the symbol's cell count.
 * Used to know how many energy hatches fit (GTM raises voltage one step with 2 or more of the same tier).
 */
export function abilityMaxCount(desc, ability) {
  const cells = {};
  for (const rows of desc.slices || []) {
    for (const row of rows) for (const ch of String(row)) if (ch !== ' ') cells[ch] = (cells[ch] || 0) + 1;
  }
  let total = 0;
  for (const [ch, sym] of Object.entries(desc.symbols || {})) {
    const n = cells[ch] || 0;
    if (n === 0) continue;
    const options = [];
    const walk = (o) => (o.kind === 'oneOf' ? (o.options || []).forEach(walk) : options.push(o));
    walk(sym);
    let perSymbol = 0;
    for (const o of options) {
      if (o.kind !== 'part' || o.ability !== ability) continue;
      const l = o.limits || {};
      const cap = l.exact ?? l.max;
      perSymbol += Math.min(cap === undefined || cap === null ? Infinity : cap, n);
    }
    total += Math.min(perSymbol, n);
  }
  return total;
}

/**
 * @returns {{selectors: {anyOf: string[], label: string}[], problems: string[]}}
 * Each selector is a capital slot (one of its alternatives must exist). A part with no known items for its
 * ability ends up as a slot with no alternatives (the analysis marks it impossible, by name).
 */
export function structureSelectors(desc, abilityItems, hasItem) {
  const problems = [];
  const selectors = [];
  const seen = new Set();
  const add = (anyOf, label) => {
    const key = anyOf.length > 0 ? anyOf.join('|') : `empty:${label}`;
    if (seen.has(key)) return;
    seen.add(key);
    selectors.push({ anyOf, label });
  };
  const used = new Set();
  for (const rows of desc.slices || []) for (const row of rows) for (const ch of String(row)) if (ch !== ' ') used.add(ch);
  for (const ch of used) {
    const sym = (desc.symbols || {})[ch];
    if (!sym) {
      problems.push(`the pattern uses symbol «${ch}» with no description`);
      continue;
    }
    if (SKIP.has(sym.kind)) continue;
    if (sym.kind !== 'oneOf') {
      add(itemsOf(sym, abilityItems, hasItem, problems), labelOf(sym));
      continue;
    }
    // "casing OR part": parts with a min/exact limit are mandatory; the other options fill the remaining cells
    const filler = [];
    const fillerLabels = [];
    const walk = (opts) => {
      for (const o of opts) {
        if (o.kind === 'oneOf') walk(o.options || []);
        else if (SKIP.has(o.kind)) continue;
        else if (requiredByLimits(o)) add(itemsOf(o, abilityItems, hasItem, problems), labelOf(o));
        else if (!(o.limits && o.limits.max === 0)) {
          filler.push(...itemsOf(o, abilityItems, hasItem, problems));
          fillerLabels.push(labelOf(o));
        }
      }
    };
    walk(sym.options || []);
    if (fillerLabels.length > 0) add([...new Set(filler)], fillerLabels.join(' | '));
  }
  return { selectors, problems };
}
