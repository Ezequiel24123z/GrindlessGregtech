// Static reachability of our machines: a fixpoint over the pack's own recipes (static run, no game).
// Tracked: grindless: items and fluids and our multiblock controllers that some recipe of ours makes, plus the foreign ids of the
// bridge (recipe_bridge.json: items, fluids and tags like #gtceu:circuits/uiv that only our recipes make; see bridgeFromDump).
// Anything else (vanilla, GTM materials, other mods) is assumed obtainable: the static run does not see those recipes.
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
export function deadlocks(dump, { assumed = [], bridge = null, owned = [], pending = [] } = {}) {
  const parsed = parseRecipes([...dump.recipes.values()]);
  const ownedRe = owned.map((p) => new RegExp(p));
  const ownedMatch = (x) => ownedRe.some((r) => r.test(x));
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
  const bridgeAlt = (bridge && bridge.alt) || {};
  const bridgeIds = new Set(Object.keys(bridgeAlt));
  const bridgeTags = (bridge && bridge.tags) || {};
  // `owned` ids (gtceu tier components of UHV and above) are ours without a GTM recipe: tracked even when no recipe of ours makes
  // them. Those some recipe uses and nothing makes are `unproduced`; `pending` lists the ones allowed to stay so until their recipe
  // lands (they count as obtainable, the ratchet: a new unproduced id and a pending id that got a recipe both show up in the result).
  const used = new Set();
  for (const p of parsed) for (const i of p.ins) for (const o of i.one ? [i.one] : i.any) if (o.item && ownedMatch(o.item)) used.add(o.item);
  const unproduced = [...used].filter((x) => !produced.has(x)).sort();
  const pendingSet = new Set(pending);
  for (const x of pendingSet) if (!produced.has(x)) free.add(x);
  const tracked = (x) => !free.has(x) && (produced.has(x) || bridgeIds.has(x) || ownedMatch(x)) && (x.startsWith('grindless:') || x.startsWith('f:grindless:') || machines.has(x) || bridgeIds.has(x) || ownedMatch(x));
  const avail = new Set();
  const has = (x) => !tracked(x) || avail.has(x);
  const okOne = (o) => (o.item ? has(o.item) : o.tag ? (bridgeTags[o.tag] || tagMembers(o.tag) || ['#']).some((y) => y.startsWith('#') || has(y)) : true);
  // A foreign research item is met by the scanner route the static run cannot see (the full obtain model accepts it), so it never blocks.
  const okIng = (i) => (i.research && i.one && i.one.item && !i.one.item.startsWith('grindless:') && !machines.has(i.one.item)) || (i.one ? okOne(i.one) : i.any.some(okOne));
  const okFluid = (alts) => alts.some((f) => f.startsWith('ft:') || has(f));
  const typeOk = (t) => !ourTypes.has(t) || (typeMachines.get(t) || []).some(has);
  const fired = new Set();
  for (let changed = true; changed;) {
    changed = false;
    for (const [x, paths] of Object.entries(bridgeAlt)) if (!avail.has(x) && paths.some((slots) => slots.every((ids) => ids.some(has)))) { avail.add(x); changed = true; }
    for (const p of parsed) {
      if (fired.has(p.id) || !typeOk(p.type) || !p.ins.every(okIng) || !p.fins.every(okFluid)) continue;
      fired.add(p.id);
      for (const o of [...p.outs, ...p.fouts]) if (!avail.has(o)) { avail.add(o); changed = true; }
    }
  }
  const dead = [...new Set([...produced, ...bridgeIds])].filter((x) => tracked(x) && !avail.has(x));
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
  const deps = new Map(dead.map((x) => [x, [...new Set(why(x).flatMap((w) => w.missing).flatMap((m) => m.replace(/^research |^one of /, '').split('|')).flatMap((y) => (y.startsWith('#') ? bridgeTags[y.slice(1)] || [] : [y])).filter((y) => deadSet.has(y)))]]));
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
  return { deadMachines: dead.filter((x) => machines.has(x)).sort(), dead: dead.sort(), cycles, why, unproduced, pendingNow: [...pendingSet].filter((x) => produced.has(x)).sort() };
}

// Bridge for the foreign ids (gtceu materials, other mods' items, circuit tags): what only our recipes lead to. From a release dump
// (the full-obtain model of reachability.mjs with tiers/obtain.json) switch our recipes off and take every non-grindless item or fluid
// that is then out of reach and has a producing recipe. For each, `alt` lists the recipes that make it as alternative paths
// ([slot = ids of which one is needed]); a slot the static run cannot track (a raw input, a machine) is dropped as free, and an id with
// a free path is not listed. The static run sees only our recipes, so this is what lets it tell a real deadlock (rhenium only the
// drill mines, einsteinium only the separator makes, a circuit tag only our mainframe fills) from an entry through a GTM recipe.
// `tags` lists the item tags we consume whose members are all bridge or grindless: ids. Deterministic, sorted, no network; the lazy
// imports keep the model out of T0. Returns {tags, alt: {id: [path = [slot = [ids]]]}}; fluids are written f:<id>.
export async function bridgeFromDump(dump, tiersDir) {
  const A = (f) => import(new URL(f, import.meta.url).href);
  const [{ loadTierConfig }, { obtainConfig }, { buildModel }, { lfp }] = await Promise.all([A('./config.mjs'), A('./obtain.mjs'), A('./model.mjs'), A('./engine.mjs')]);
  const { raw } = loadTierConfig({ tier: 'obtain' }, tiersDir);
  const model = buildModel(dump, obtainConfig(dump, raw).derived);
  const g = model.g;
  const facts = [...model.facts.manual, ...model.facts.auto];
  const isOurs = (r) => (r.kind === 'recipe' ? r.name.startsWith('grindless:') : r.kind === 'synthetic' && String((r.meta && r.meta.recipe) || '').startsWith('grindless:'));
  const enabled = new Uint8Array(g.rules.length).fill(1);
  g.rules.forEach((r, i) => { if (isOurs(r)) enabled[i] = 0; });
  const without = lfp(g, { facts, enabled });
  const names = g.keyNames;
  const machineKey = (k) => /^(m|run):/.test(names[k]);
  const sname = (k) => names[k].replace(/^fluid:/, 'f:');
  const ours = (k) => /^(fluid:)?grindless:/.test(names[k]);
  const producers = new Map();
  g.rules.forEach((r) => { for (const o of r.outs) (producers.get(o) || producers.set(o, []).get(o)).push(r); });
  const stuck = (k) => without.reached[k] !== 1 && !machineKey(k) && producers.has(k);
  const alt = {};
  for (let k = 0; k < names.length; k++) {
    if (ours(k) || !stuck(k)) continue;
    const paths = new Map();
    let free = false;
    for (const r of producers.get(k)) {
      if (r.kind === 'synthetic' && /^synthetic:empty/.test(r.name)) continue; // a bucket nobody can obtain // a bucket nobody can obtain
      const slots = [];
      for (const s of r.slots) {
        if (s.alts.some((a) => without.reached[a] === 1)) continue; // met without us
        const ids = s.alts.filter((a) => !machineKey(a) && (ours(a) || stuck(a))).map(sname).sort();
        if (ids.length > 0) slots.push(ids);
      }
      if (slots.length === 0) { free = true; break; }
      slots.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      paths.set(JSON.stringify(slots), slots);
    }
    if (!free) alt[sname(k)] = [...paths.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  }
  const wanted = new Set();
  for (const p of parseRecipes([...dump.recipes.values()].filter((r) => r.id.startsWith('grindless:')))) {
    for (const i of p.ins) for (const o of i.one ? [i.one] : i.any) if (o.tag) wanted.add(o.tag);
  }
  const tags = {};
  for (const t of [...wanted].sort()) {
    const members = (dump.tags.itemTags.get(t) || []).filter((m) => m !== 'minecraft:barrier');
    const unobtainable = (m) => { const k = g.keyIndex.get(m); return k === undefined || without.reached[k] !== 1; };
    if (members.some((m) => alt[m] || m.startsWith('grindless:')) && members.every((m) => alt[m] || m.startsWith('grindless:') || unobtainable(m))) tags[t] = members.filter((m) => alt[m] || m.startsWith('grindless:')).sort();
  }
  return { tags, alt: Object.fromEntries(Object.entries(alt).sort(([a], [b]) => a.localeCompare(b))) };
}