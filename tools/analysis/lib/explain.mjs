// Derivation chains (why something is reached) and blocking chains (why it isn't).

export const keyName = (g, k) => g.keyNames[k];

export function describeRule(g, r) {
  const rule = g.rules[r];
  switch (rule.kind) {
    case 'recipe': return `${rule.type} · ${rule.name}`;
    case 'machine-build': return `build ${rule.name.slice(6)}`;
    case 'machine-run': return `operate ${rule.name.slice(8)}`;
    case 'world-auto': return `${rule.name}${rule.meta.finite ? ' (finite)' : ''}`;
    case 'world-manual': return `${rule.name} (by hand, a trip)`;
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
 * Tree of how `key` is reached from an lfp result (gate pass, or auto pass with the ground floor).
 * Capital slots the lfp took as already met are shown as leaves ("built once"), and tolerant ones
 * (fuel, catalysts) as "primed": kept up by the cycle itself.
 */
export function derivationTree(model, lf, key, lim = { depth: 5, kids: 5 }, fromRule = -1) {
  const g = model.g;
  const seen = new Set();
  const expand = (node, r, depth) => {
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
  };
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
    expand(node, r, depth);
    return node;
  };
  if (fromRule >= 0) {
    // root = one specific recipe (recipe-type targets, which have no key of their own)
    const root = { key: g.rules[fromRule].outs[0] ?? -1, depth: 0, rule: fromRule, ruleHead: true };
    expand(root, fromRule, 0);
    return root;
  }
  return walk(key, 0);
}

/**
 * Tree for a recipe whose machine is ignored (`machineless` targets): the inputs and conditions reachable in `lf`.
 * `capMask`: in the auto pass, what's built once (capital slots).
 */
export function machinelessTree(model, lf, r, capMask = null) {
  const g = model.g;
  const rule = g.rules[r];
  const root = { key: rule.outs[0] ?? -1, depth: 0, rule: r, ruleHead: true, note: 'inputs reached; only the machine is missing', kids: [] };
  for (const slot of rule.slots) {
    if (slot.role === 'machine') continue;
    const reached = slot.alts.filter((a) => lf.reached[a] === 1).sort((a, b) => lf.level[a] - lf.level[b]);
    if (reached.length > 0) {
      root.kids.push({ slot, child: derivationTree(model, lf, reached[0]) });
      continue;
    }
    const cap = capMask ? slot.alts.find((a) => capMask[a] === 1) : undefined;
    if (cap !== undefined) root.kids.push({ slot, child: { key: cap, depth: 1, capital: true } });
  }
  return root;
}

function rootReason(model, key) {
  const g = model.g;
  const name = g.keyNames[key];
  const dump = model.dump;
  if (name.startsWith('dead:')) return { code: 'dead-slot', text: name.slice(5) };
  if (name.startsWith('cond:')) return { code: 'cond', text: `condition ${name.slice(5)} isn't supported in this tier` };
  if (model.manualKeys.has(key)) return { code: 'manual-only', text: 'world resource only gathered by hand (no machine resupplies it)' };
  if (name.startsWith('fluid:')) {
    const id = name.slice(6);
    if (!dump.fluids.has(id)) return { code: 'unregistered', text: "the fluid doesn't exist in the registry" };
    if (model.disabledWorld.has(name)) return { code: 'disabled-world', text: `only given by the world "${model.disabledWorld.get(name)}", disabled` };
    return { code: 'no-source', text: 'no recipe or source produces it' };
  }
  if (!dump.items.has(name)) return { code: 'unregistered', text: "doesn't exist in the item registry (machine or item not implemented yet?)" };
  if (model.disabledWorld.has(name)) return { code: 'disabled-world', text: `only given by the world "${model.disabledWorld.get(name)}", disabled in the config` };
  return { code: 'no-recipe', text: "exists, but no recipe produces it and it isn't a world resource" };
}

/**
 * Cost of "adding a source" for a key the blocking analysis treats as a root: a world resource only
 * gathered by hand is the most natural (just automate it); the rest (no recipe, from mobs, dead slot) is worse.
 * A key that has active producers and isn't the world's isn't a root: its producers need to be unblocked.
 */
export function makeRootCost(model, enabled = null) {
  const g = model.g;
  return (k) => {
    const hasProducer = g.producers(k).some((r) => !enabled || enabled[r] === 1);
    // only manual world facts are roots by themselves; an ore that first requires a key has a producer rule
    const manual = model.manualFactKeys ? model.manualFactKeys.has(k) : model.manualKeys.has(k);
    // a resource the world would give but this config/dimension doesn't allow is the natural root even with other distant recipes
    const disabled = model.disabledWorld.has(g.keyNames[k]);
    if (hasProducer && !manual && !disabled) return Infinity;
    switch (rootReason(model, k).code) {
      case 'manual-only': return 1;
      case 'disabled-world': return 1;
      case 'no-recipe': return 2;
      default: return 4;
    }
  };
}

/**
 * Blocking tree with the cheapest chain to the missing roots (blocker = blockerFor's output).
 * `blocker.reasonOf(k)`, if it exists, gives a root's reason before `rootReason` (the era rule names
 * the later-era resource pulling on the chain this way).
 */
export function blockedTree(model, blocker, key, lim = { depth: 8, kids: 4 }) {
  const g = model.g;
  const { cost, best, mask, capMask } = blocker;
  const reasonOf = (k) => (blocker.reasonOf && blocker.reasonOf(k)) || rootReason(model, k);
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
        node.root = reasonOf(k);
        return node;
      }
      const prods = g.producers(k);
      if (prods.length === 0) {
        node.root = reasonOf(k);
        return node;
      }
      // No finite route: only dead-end cycles are left. Follow the recipe with fewest pending slots.
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

/** Blocking tree for one specific recipe: which slots aren't met and why (for recipe-type targets). */
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

/** Roots (sourceless leaves) of a blocking tree, without repeats. */
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
    if (!n.ruleRoot && !n.ruleHead && keyName(g, n.key).startsWith('dead:')) {
      lines.push(`${prefix}✗ ${n.root ? n.root.text : keyName(g, n.key).slice(5)}`);
      return;
    }
    const nm = n.ruleRoot || n.ruleHead ? describeRule(g, n.rule) : keyName(g, n.key);
    let line = `${prefix}${slotLabel ? '[' + slotLabel + '] ' : ''}${nm}`;
    if (n.ruleRoot) line += '  ✗ missing:';
    else if (n.ruleHead) line += n.note ? `  (${n.note})` : '  (usable recipe, needs:)';
    else if (n.fact) line += '  ← from the world / bootstrap';
    else if (n.capital) line += '  ← capital (built once)';
    else if (n.rule !== undefined) line += `  ← ${describeRule(g, n.rule)}`;
    if (n.level !== undefined && opts.levels) line += `  (level ${n.level})`;
    if (n.primed) line += '  ⟳ primed (the cycle itself resupplies it)';
    if (n.cycle) line += '  ↺ cycle (feeds itself)';
    if (n.seen) line += '  (already expanded above)';
    if (n.truncated) line += '  …';
    if (n.root) line += `  ✗ ${n.root.text}`;
    if (n.ok) line += '  ✓ already available';
    lines.push(line);
    for (const d of n.dead || []) {
      lines.push(`${prefix}      · ${describeRule(g, d.rule)}${d.slots.length ? ' — missing: ' + d.slots.join(', ') : ''}`);
    }
    const kids = n.kids || [];
    const maxKids = opts.maxKids || 6;
    kids.slice(0, maxKids).forEach((k) => walk(k.child, prefix + '    ', k.slot ? k.slot.label : '', depth + 1));
    if (kids.length > maxKids) lines.push(`${prefix}    … +${kids.length - maxKids} more`);
  };
  walk(node, opts.prefix || '', '', 0);
  return lines;
}
