// Static reachability of our machines: a fixpoint over the pack's own recipes (static run, no game).
// Tracked: grindless: items and fluids and our multiblock controllers that some recipe of ours makes. Anything else
// (vanilla, GTM materials, other mods) is assumed obtainable: the static run does not see those recipes.
// A recipe fires when its type is runnable (a GT type of ours needs one of its machines), every item, fluid and research
// item is available. A controller that never becomes available is a deadlock, usually a cycle: its recipe, research item
// or a domain input can only be made by the machine itself or by something downstream of it.

const ingOf = (x) => {
  if (!x) return [];
  if (Array.isArray(x)) return [{ any: x.flatMap(ingOf).map((y) => y.one || y) }];
  if (typeof x === 'string') return [{ one: x.startsWith('#') ? { tag: x.slice(1) } : { item: x } }];
  if (x.item) return [{ one: { item: x.item } }];
  if (x.tag) return [{ one: { tag: x.tag } }];
  if (x.ingredient) return ingOf(x.ingredient);
  return [];
};

export function parseRecipes(recipes) {
  const out = [];
  for (const r of recipes) {
    const j = r.json || {};
    const ins = []; const outs = []; const fins = []; const fouts = [];
    if (j.inputs || j.outputs) {
      for (const c of (j.inputs && j.inputs.item) || []) { const ct = c.content || {}; if (ct.type !== 'gtceu:circuit') ins.push(...ingOf(ct.ingredient)); }
      for (const c of (j.outputs && j.outputs.item) || []) { if (c.chance === 0) continue; for (const o of ingOf((c.content || {}).ingredient)) if (o.one && o.one.item) outs.push(o.one.item); }
      for (const c of (j.inputs && j.inputs.fluid) || []) {
        const f = ((c.content || {}).value || []).map((y) => (y.fluid ? 'f:' + y.fluid : y.tag ? 'ft:' + y.tag : null)).filter(Boolean);
        if (f.length) fins.push(f);
      }
      for (const c of (j.outputs && j.outputs.fluid) || []) for (const y of (c.content || {}).value || []) if (y.fluid) fouts.push('f:' + y.fluid);
      for (const rc of j.recipeConditions || []) for (const ri of rc.researchItems || []) for (const i of ingOf(ri)) ins.push({ ...i, research: true });
    } else if (j.result || j.output) {
      const res = j.result || j.output;
      const rid = typeof res === 'string' ? res : res.item || res.id;
      if (rid) outs.push(rid);
      if (j.key) for (const v of Object.values(j.key)) ins.push(...ingOf(v));
      if (j.ingredients) for (const v of [].concat(j.ingredients)) ins.push(...ingOf(v));
      for (const k of ['ingredient', 'base', 'addition', 'template']) if (j[k]) ins.push(...ingOf(j[k]));
    } else continue;
    out.push({ id: r.id, type: r.type || j.type, ins, outs, fins, fouts });
  }
  return out;
}

// dump: staticDump(...).dump (recipes, machines, recipeTypes, tags). assumed: ids obtainable outside recipes (loot, events).
export function deadlocks(dump, { assumed = [] } = {}) {
  const parsed = parseRecipes([...dump.recipes.values()]);
  const ourTypes = new Set([...dump.recipeTypes.keys()]);
  const machines = new Set([...dump.machines.keys()]);
  const typeMachines = new Map();
  for (const m of dump.machines.values()) {
    for (const t of m.recipeTypes || []) {
      const k = String(t).includes(':') ? String(t) : 'gtceu:' + t;
      if (!typeMachines.has(k)) typeMachines.set(k, []);
      typeMachines.get(k).push(m.id);
    }
  }
  const tagsItem = (dump.tags && (dump.tags.item || dump.tags.items)) || {};
  const tagMembers = (t) => { const v = tagsItem instanceof Map ? tagsItem.get(t) : tagsItem[t]; return v ? [...v].map(String) : null; };
  const produced = new Set();
  for (const p of parsed) for (const o of [...p.outs, ...p.fouts]) produced.add(o);
  const free = new Set(assumed);
  const tracked = (x) => !free.has(x) && produced.has(x) && (x.startsWith('grindless:') || x.startsWith('f:grindless:') || machines.has(x));
  const avail = new Set();
  const has = (x) => !tracked(x) || avail.has(x);
  const okOne = (o) => (o.item ? has(o.item) : o.tag ? (tagMembers(o.tag) || ['#']).some((y) => y.startsWith('#') || has(y)) : true);
  const okIng = (i) => (i.one ? okOne(i.one) : i.any.some(okOne));
  const okFluid = (alts) => alts.some((f) => f.startsWith('ft:') || has(f));
  const typeOk = (t) => !ourTypes.has(t) || (typeMachines.get(t) || []).some(has);
  const fired = new Set();
  for (let changed = true; changed;) {
    changed = false;
    for (const p of parsed) {
      if (fired.has(p.id) || !typeOk(p.type) || !p.ins.every(okIng) || !p.fins.every(okFluid)) continue;
      fired.add(p.id);
      for (const o of [...p.outs, ...p.fouts]) if (!avail.has(o)) { avail.add(o); changed = true; }
    }
  }
  const dead = [...produced].filter((x) => tracked(x) && !avail.has(x));
  const deadSet = new Set(dead);
  const why = (x) => parsed.filter((p) => p.outs.includes(x) || p.fouts.includes(x)).map((p) => ({
    recipe: p.id,
    type: typeOk(p.type) ? null : p.type,
    missing: [
      ...p.ins.filter((i) => !okIng(i)).map((i) => (i.research ? 'research ' : '') + (i.one ? i.one.item || '#' + i.one.tag : 'one of ' + i.any.map((o) => o.item || '#' + o.tag).join('|'))),
      ...p.fins.filter((a) => !okFluid(a)).map((a) => a.join('|')),
      ...(typeOk(p.type) ? [] : (typeMachines.get(p.type) || []).filter((m) => deadSet.has(m))),
    ],
  }));
  // strongly connected components of the dead graph (x -> each dead thing one of its recipes misses); root = blocked only from inside
  const deps = new Map(dead.map((x) => [x, [...new Set(why(x).flatMap((w) => w.missing).flatMap((m) => m.replace(/^research |^one of /, '').split('|')).filter((y) => deadSet.has(y)))]]));
  let n = 0; const stack = []; const on = new Set(); const index = new Map(); const low = new Map(); const sccs = [];
  const visit = (v) => {
    index.set(v, n); low.set(v, n); n++; stack.push(v); on.add(v);
    for (const w of deps.get(v)) {
      if (!index.has(w)) { visit(w); low.set(v, Math.min(low.get(v), low.get(w))); } else if (on.has(w)) low.set(v, Math.min(low.get(v), index.get(w)));
    }
    if (low.get(v) === index.get(v)) { const c = []; let w; do { w = stack.pop(); on.delete(w); c.push(w); } while (w !== v); sccs.push(c.sort()); }
  };
  for (const x of dead) if (!index.has(x)) visit(x);
  const cycles = sccs.filter((c) => c.length > 1 || deps.get(c[0]).includes(c[0]))
    .map((c) => ({ members: c, root: c.every((x) => deps.get(x).every((y) => c.includes(y))) }))
    .sort((a, b) => b.root - a.root || a.members.length - b.members.length);
  return { deadMachines: dead.filter((x) => machines.has(x)).sort(), dead: dead.sort(), cycles, why };
}
