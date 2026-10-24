// Piezas que exige un multibloque del pack, leídas de la descripción en datos de su patrón (lib/patterns.js registra
// global.grindless.structures[<id de máquina>] y gg_dump.js la vuelca a structures.json). Así la configuración no copia a
// mano los patrones de las máquinas que están implementando otros: si cambian, el análisis se entera en el siguiente volcado.
//
// Descripción: { id, slices: [[fila, ...], ...], symbols: { <carácter>: símbolo } } con símbolos
//   { kind: 'controller'|'air'|'any' }
//   { kind: 'blocks',  blocks: [ids], limits? }          uno de esos bloques
//   { kind: 'frames',  materials: [nombres], limits? }   marcos de GT de esos materiales (gtceu:<material>_frame)
//   { kind: 'part',    ability: nombre, limits? }        una pieza con esa habilidad (escotilla, bus...)
//   { kind: 'oneOf',   options: [símbolos] }             "carcasa O pieza": las opciones con min/exact son obligatorias
// `abilityItems` (partAbilities en la configuración) dice qué objetos cumplen cada habilidad en el tier analizado.

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
      const msg = `la pieza «${o.ability}» no está en partAbilities de la configuración (no se sabe qué objetos la cumplen)`;
      if (!problems.includes(msg)) problems.push(msg);
    }
    ids = abilityItems[o.ability] || [];
  }
  return [...new Set(ids)].filter((id) => hasItem(id));
}

function labelOf(o) {
  if (o.kind === 'blocks') return (o.blocks || []).slice(0, 3).join(' | ') + ((o.blocks || []).length > 3 ? ' | …' : '');
  if (o.kind === 'frames') return `marco de ${(o.materials || []).join('/')}`;
  if (o.kind === 'part') return `pieza «${o.ability}»`;
  return o.kind;
}

/**
 * Máximo de piezas con una habilidad que admite el patrón: por cada símbolo, la suma de los límites (`exact` o `max`, sin
 * límite = todas las celdas) de sus opciones con esa habilidad, acotada por el número de celdas del símbolo.
 * Sirve para saber cuántas escotillas de energía caben (GTM sube un escalón la tensión con 2 o más del mismo nivel).
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
 * Cada selector es una ranura de capital (una de sus alternativas debe existir). Una pieza sin objetos conocidos para su
 * habilidad queda como ranura sin alternativas (el análisis la marca como imposible con su nombre).
 */
export function structureSelectors(desc, abilityItems, hasItem) {
  const problems = [];
  const selectors = [];
  const seen = new Set();
  const add = (anyOf, label) => {
    const key = anyOf.length > 0 ? anyOf.join('|') : `vacío:${label}`;
    if (seen.has(key)) return;
    seen.add(key);
    selectors.push({ anyOf, label });
  };
  const used = new Set();
  for (const rows of desc.slices || []) for (const row of rows) for (const ch of String(row)) if (ch !== ' ') used.add(ch);
  for (const ch of used) {
    const sym = (desc.symbols || {})[ch];
    if (!sym) {
      problems.push(`el patrón usa el símbolo «${ch}» sin descripción`);
      continue;
    }
    if (SKIP.has(sym.kind)) continue;
    if (sym.kind !== 'oneOf') {
      add(itemsOf(sym, abilityItems, hasItem, problems), labelOf(sym));
      continue;
    }
    // "carcasa O pieza": las piezas con límite mínimo/exacto son obligatorias; el resto de opciones rellenan las demás celdas
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
