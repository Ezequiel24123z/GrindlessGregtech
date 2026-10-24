// Cadenas de derivación (por qué se alcanza algo) y de bloqueo (por qué no).

export const keyName = (g, k) => g.keyNames[k];

export function describeRule(g, r) {
  const rule = g.rules[r];
  switch (rule.kind) {
    case 'recipe': return `${rule.type} · ${rule.name}`;
    case 'machine-build': return `construir ${rule.name.slice(10)}`;
    case 'machine-run': return `operar ${rule.name.slice(7)}`;
    case 'world-auto': return `${rule.name}${rule.meta.finite ? ' (finito)' : ''}`;
    default: return rule.name;
  }
}

function pickSlotKid(model, lf, r, s) {
  const g = model.g;
  const gS = g.slotOffset[r] + s;
  const viaQueue = lf.satBy[gS];
  if (viaQueue >= 0) return { kid: viaQueue, pre: false };
  return { kid: lf.capPick[gS], pre: true };
}

/**
 * Árbol de cómo se llega a `key` con el resultado de un lfp (paso gate, o paso auto con suelo).
 * Las ranuras de capital que el lfp dio por cumplidas de antemano se muestran como hojas ("se construye una vez") y las
 * tolerantes (combustible, catalizadores) como "cebado": se mantienen en el propio ciclo.
 */
export function derivationTree(model, lf, key, lim = { depth: 5, kids: 5 }) {
  const g = model.g;
  const seen = new Set();
  const walk = (k, depth) => {
    const node = { key: k, depth };
    const r = lf.via[k];
    if (r < 0) {
      node.fact = true;
      return node;
    }
    node.rule = r;
    node.level = lf.level[k];
    if (seen.has(k)) {
      node.seen = true;
      return node;
    }
    if (depth >= lim.depth) {
      node.truncated = true;
      return node;
    }
    seen.add(k);
    node.kids = [];
    const rule = g.rules[r];
    for (let s = 0; s < rule.slots.length; s++) {
      const slot = rule.slots[s];
      const { kid, pre } = pickSlotKid(model, lf, r, s);
      if (kid < 0 || slot.role === 'machine-built') continue;
      if (pre && slot.cap) {
        node.kids.push({ slot, child: { key: kid, depth: depth + 1, capital: true } });
        continue;
      }
      const child = walk(kid, depth + 1);
      if (pre && slot.tol) child.primed = true;
      node.kids.push({ slot, child });
    }
    return node;
  };
  return walk(key, 0);
}

function rootReason(model, key) {
  const g = model.g;
  const name = g.keyNames[key];
  const dump = model.dump;
  if (name.startsWith('dead:')) return { code: 'dead-slot', text: name.slice(5) };
  if (name.startsWith('cond:')) return { code: 'cond', text: `condición ${name.slice(5)} no soportada en este tier` };
  if (model.manualKeys.has(key)) return { code: 'manual-only', text: 'recurso del mundo que solo se recoge a mano (ninguna máquina lo repone)' };
  if (name.startsWith('fluid:')) {
    const id = name.slice(6);
    if (!dump.fluids.has(id)) return { code: 'unregistered', text: 'el fluido no existe en el registro' };
    if (model.disabledWorld.has(name)) return { code: 'disabled-world', text: `solo lo da el mundo "${model.disabledWorld.get(name)}", deshabilitado` };
    return { code: 'no-source', text: 'ninguna receta ni fuente lo produce' };
  }
  if (!dump.items.has(name)) return { code: 'unregistered', text: 'no existe en el registro de objetos (¿máquina u objeto aún sin implementar?)' };
  if (model.disabledWorld.has(name)) return { code: 'disabled-world', text: `solo lo da el mundo "${model.disabledWorld.get(name)}", deshabilitado en la config` };
  return { code: 'no-recipe', text: 'existe, pero ninguna receta lo produce y no es un recurso del mundo' };
}

/**
 * Coste de "añadir una fuente" para una clave que el análisis de bloqueo trata como raíz: un recurso del mundo que solo
 * se recoge a mano es lo más natural (basta automatizarlo); lo demás (sin receta, de mobs, ranura muerta) es peor.
 * Una clave que tiene productores activos y no es del mundo no es raíz: hay que desbloquear sus productores.
 */
export function makeRootCost(model, enabled = null) {
  const g = model.g;
  return (k) => {
    const hasProducer = g.producers(k).some((r) => !enabled || enabled[r] === 1);
    const manual = model.manualKeys.has(k);
    if (hasProducer && !manual) return Infinity;
    switch (rootReason(model, k).code) {
      case 'manual-only': return 1;
      case 'no-recipe': return 2;
      case 'disabled-world': return 3;
      default: return 4;
    }
  };
}

/** Árbol de bloqueo con la cadena más barata hasta las raíces que faltan (blocker = salida de blockerFor). */
export function blockedTree(model, blocker, key, lim = { depth: 8, kids: 4 }) {
  const g = model.g;
  const { cost, best, mask, capMask } = blocker;
  const expandRule = (node, r, depth, path) => {
    node.kids = [];
    const rule = g.rules[r];
    for (const slot of rule.slots) {
      if (slot.alts.some((a) => mask[a] === 1)) continue;
      if (slot.cap && capMask && slot.alts.some((a) => capMask[a] === 1)) continue;
      let pick = -1;
      for (const a of slot.alts) {
        if (path.has(a)) continue;
        if (pick < 0 || cost[a] < cost[pick]) pick = a;
      }
      if (pick < 0) {
        node.kids.push({ slot, child: { key: slot.alts[0], depth: depth + 1, cycle: true } });
      } else node.kids.push({ slot, child: walk(pick, depth + 1, path) });
    }
  };
  const walk = (k, depth, path) => {
    const node = { key: k, depth, cost: cost[k] };
    if (mask[k]) {
      node.ok = true;
      return node;
    }
    let r = best[k];
    if (r < 0) {
      if (cost[k] < Infinity) {
        node.root = rootReason(model, k);
        return node;
      }
      const prods = g.producers(k);
      if (prods.length === 0) {
        node.root = rootReason(model, k);
        return node;
      }
      // Sin ruta finita: solo quedan ciclos sin salida. Se sigue la receta con menos ranuras pendientes.
      let pick = -1;
      let pickOpen = Infinity;
      for (const p of prods) {
        const open = g.rules[p].slots.filter((sl) => !sl.alts.some((a) => mask[a] === 1)).length;
        if (open < pickOpen) {
          pickOpen = open;
          pick = p;
        }
      }
      r = pick;
    }
    node.rule = r;
    if (path.has(k) || depth >= lim.depth) {
      node.truncated = true;
      return node;
    }
    path.add(k);
    expandRule(node, r, depth, path);
    path.delete(k);
    return node;
  };
  return walk(key, 0, new Set());
}

/** Árbol de bloqueo de una receta concreta: qué ranuras no se cumplen y por qué (para objetivos de tipo receta). */
export function blockedRuleTree(model, blocker, r, lim = { depth: 8, kids: 4 }) {
  const g = model.g;
  const { cost, mask, capMask } = blocker;
  const root = { key: g.rules[r].outs[0] ?? -1, rule: r, depth: 0, ruleRoot: true, kids: [] };
  for (const slot of g.rules[r].slots) {
    if (slot.alts.some((a) => mask[a] === 1)) continue;
    if (slot.cap && capMask && slot.alts.some((a) => capMask[a] === 1)) continue;
    let pick = slot.alts[0];
    for (const a of slot.alts) if (cost[a] < cost[pick]) pick = a;
    root.kids.push({ slot, child: blockedTree(model, blocker, pick, lim) });
  }
  return root;
}

/** Raíces (hojas sin fuente) de un árbol de bloqueo, sin repetir. */
export function blockedRoots(tree) {
  const out = new Map();
  const walk = (n) => {
    if (!n) return;
    if (n.root) out.set(n.key, n.root);
    for (const k of n.kids || []) walk(k.child);
  };
  walk(tree);
  return out;
}

export function renderTree(model, node, opts = {}) {
  const g = model.g;
  const lines = [];
  const walk = (n, prefix, slotLabel, depth) => {
    if (!n.ruleRoot && keyName(g, n.key).startsWith('dead:')) {
      lines.push(`${prefix}✗ ${n.root ? n.root.text : keyName(g, n.key).slice(5)}`);
      return;
    }
    const nm = n.ruleRoot ? describeRule(g, n.rule) : keyName(g, n.key);
    let line = `${prefix}${slotLabel ? '[' + slotLabel + '] ' : ''}${nm}`;
    if (n.ruleRoot) line += '  ✗ le falta:';
    else if (n.fact) line += '  ← del mundo / arranque';
    else if (n.capital) line += '  ← capital (se construye una vez)';
    else if (n.rule !== undefined) line += `  ← ${describeRule(g, n.rule)}`;
    if (n.level !== undefined && opts.levels) line += `  (nivel ${n.level})`;
    if (n.primed) line += '  ⟳ cebado (el propio ciclo lo repone)';
    if (n.cycle) line += '  ↺ ciclo (se alimenta de sí mismo)';
    if (n.seen) line += '  (ya expandido arriba)';
    if (n.truncated) line += '  …';
    if (n.root) line += `  ✗ ${n.root.text}`;
    if (n.ok) line += '  ✓ ya disponible';
    lines.push(line);
    for (const d of n.dead || []) {
      lines.push(`${prefix}      · ${describeRule(g, d.rule)}${d.slots.length ? ' — falta: ' + d.slots.join(', ') : ''}`);
    }
    const kids = n.kids || [];
    const maxKids = opts.maxKids || 6;
    kids.slice(0, maxKids).forEach((k) => walk(k.child, prefix + '    ', k.slot ? k.slot.label : '', depth + 1));
    if (kids.length > maxKids) lines.push(`${prefix}    … +${kids.length - maxKids} más`);
  };
  walk(node, opts.prefix || '', '', 0);
  return lines;
}
