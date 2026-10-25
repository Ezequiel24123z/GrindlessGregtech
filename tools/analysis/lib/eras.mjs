// Era rule (decision of 2026-10-24): nothing from an era can need a resource that comes from a later era.
//
// Config (tiers/<tier>.json; inherited and merged by id, see lib/config.mjs):
//   eraOrder        order of the eras: ["steam", "lv", "mv", "hv", "ev", "iv", ...].
//   eraSiblings     [[era, ...], ...]: substages reached together (IV's Venus and Mercury, one trip); each counts as later than
//                   the others, so nothing of one may need a resource of another.
//   eraResources[]  what each era brings: {id, era, label, items?, exclude?, dimensions?, onlyFrom?, note}
//     items         globs over item and fluid keys (`fluid:gtceu:titanium`): those keys are removed from EVERY source
//                   (no recipe gives them, even though the recipe still gives the rest; no world fact; no vein, bee,
//                   or addon recipe). This way, whatever is of that material counts, wherever it comes from.
//     dimensions    removes the world sources gathered there (the `world` entry's `origin`, or its `fromVeins`
//                   dimensions) and the recipes only valid there (dimension condition).
//     onlyFrom      exclusivity check: [ids of other resources] (e.g. ["moon"]); without them, no key of this
//                   resource should be reached ("titanium only comes from the Moon"). If it does, LEAK with the sources it
//                   comes through (rules that give it without consuming it and whose inputs don't carry it; recycling doesn't count as a source).
//   eraItems[]      what belongs to each era: {id, era, label, items?, exclude?, inputsOf?, optional?, note}
//     items         ids or globs (with * or ?) against the registry and the graph (items, `fluid:`, built machines `m:<id>`).
//                   An item that matches a glob and is itself from a later resource (gtceu:hv_titanium_drill, the
//                   HV tool with a titanium head) doesn't count as this era's: it belongs to that resource. An explicit one does.
//     inputsOf      globs over recipe ids: each input (slot) of those recipes is an item of the era; met by
//                   any of its alternatives (the HV drill's bit and samples: grindless:vein_drilling/hv/*).
//     optional      if it fails, WARN (whatever hasn't arrived yet: GCYR's rocket in stainless steel).
// Check: each item of era E is reached (same as the gate: hand-gathering counts) with ALL resources from eras
// later than E removed. An era's output items (the EV hull HV makes as its gate) belong to the next era.
// A violation carries the shortest chain to the later resource pulling on it.
import { blockCosts, lfp } from './engine.mjs';
import { blockedRoots, blockedTree, derivationTree, describeRule, makeRootCost, renderTree } from './explain.mjs';
import { asArray, makeGlobMatcher } from './util.mjs';

// keys that aren't material (machines, energy, dead slots, dimension keys, research...): a resource never removes them. NBT outputs the
// normalizer doesn't reduce (Productive Bees' configurable honeycombs) stay as non-string keys: they don't count either.
const SPECIAL = /^(m|run|eu|ae|dead|cond|dim|research):/;
const isName = (n) => typeof n === 'string';
const INPUT_ROLES = new Set(['item', 'fluid', 'tool', 'die']);
const hasGlob = (s) => /[*?]/.test(s);
const MAX_DETAIL = 25;

function eraLabel(r) {
  return `${r.label || r.id} (${r.era})`;
}

/** Config resources and item groups, resolved against the graph and the dump's registry. */
export function prepareEras(model) {
  const { cfg, g, dump, warnings } = model;
  const order = cfg.eraOrder || [];
  const idx = new Map(order.map((e, i) => [e, i]));
  // eraSiblings (IV, 2026-10-25): [[era, ...], ...] substages reached together (IV's Venus and Mercury, one trip): each is "later"
  // than the others, so nothing of one may need what another brings, while both keep their place in eraOrder for everything else.
  const sibOf = new Map();
  (cfg.eraSiblings || []).forEach((set, i) => {
    for (const e of asArray(set)) {
      if (!idx.has(e)) warnings.push(`era rule: sibling era «${e}» isn't in eraOrder; ignored`);
      else sibOf.set(e, i);
    }
  });
  const isLater = (era, than) => idx.get(era) > idx.get(than) || (era !== than && sibOf.has(era) && sibOf.get(era) === sibOf.get(than));
  const active = cfg.eraItems.length > 0 || cfg.eraResources.length > 0;
  if (active && order.length === 0) warnings.push('era rule: there are eraResources/eraItems but eraOrder is missing; not checked');
  const known = (what, id, era) => {
    if (idx.has(era)) return true;
    warnings.push(`era rule: ${what} ${id} has era «${era}», which isn't in eraOrder; ignored`);
    return false;
  };

  const resources = [];
  for (const r of cfg.eraResources) {
    if (!known('resource', r.id, r.era)) continue;
    const match = makeGlobMatcher(asArray(r.items));
    const excl = makeGlobMatcher(asArray(r.exclude));
    const keys = [];
    if (r.items) {
      for (let k = 0; k < g.nKeys; k++) {
        const n = g.keyNames[k];
        if (isName(n) && !SPECIAL.test(n) && match(n) && !excl(n)) keys.push(k);
      }
      if (keys.length === 0) warnings.push(`era rule: resource ${r.id} (${asArray(r.items).join(', ')}) matches no item or fluid in the pack`);
    }
    const dims = asArray(r.dimensions);
    resources.push({ ...r, label: r.label || r.id, keys, dims, rank: idx.get(r.era), onlyFrom: asArray(r.onlyFrom) });
  }
  const resById = new Map(resources.map((r) => [r.id, r]));

  const graphKeyOf = (name) => g.keyIndex.get(name);
  // does it exist in the pack? For items and fluids, the dump's registry rules: a target naming something that
  // doesn't exist yet creates its key in the graph, so having a key isn't enough.
  const exists = (name) => {
    if (name.startsWith('fluid:')) return dump.fluids.has(name.slice(6));
    if (name.startsWith('m:') || name.startsWith('run:')) return model.entriesById.has(name.slice(name.indexOf(':') + 1));
    if (SPECIAL.test(name)) return graphKeyOf(name) !== undefined;
    return dump.items.has(name);
  };
  let universe = null;
  const candidates = () => {
    if (!universe) {
      // items and fluids from the registry, plus non-material keys (built machines m:, energy...)
      universe = new Set();
      for (const i of dump.items) universe.add(i);
      for (const f of dump.fluids) universe.add('fluid:' + f);
      for (const n of g.keyNames) if (isName(n) && /^(m|run|eu|ae):/.test(n)) universe.add(n);
    }
    return universe;
  };

  const groups = [];
  for (const grp of cfg.eraItems) {
    if (!known('item group', grp.id, grp.era)) continue;
    const excl = makeGlobMatcher(asArray(grp.exclude));
    const items = [];
    const seen = new Set();
    for (const s of asArray(grp.items)) {
      if (hasGlob(s)) {
        const m = makeGlobMatcher([s]);
        let n = 0;
        for (const name of candidates()) {
          if (!m(name) || excl(name) || seen.has(name)) continue;
          seen.add(name);
          items.push({ name, pattern: true, key: graphKeyOf(name) });
          n++;
        }
        if (n === 0) warnings.push(`era rule: pattern ${s} of group ${grp.id} matches nothing`);
      } else if (!seen.has(s)) {
        seen.add(s);
        items.push({ name: s, pattern: false, key: graphKeyOf(s), missing: !exists(s) });
      }
    }
    if (grp.inputsOf) {
      const rm = makeGlobMatcher(asArray(grp.inputsOf));
      const slots = new Map();
      let recipes = 0;
      for (const rule of g.rules) {
        if (rule.kind !== 'recipe' || !rm(rule.name)) continue;
        recipes++;
        for (const slot of rule.slots) {
          if (!INPUT_ROLES.has(slot.role) || slot.dead) continue;
          const sig = [...slot.alts].sort((a, b) => a - b).join(',');
          if (!slots.has(sig)) slots.set(sig, { name: slot.label, pattern: false, alts: [...slot.alts], recipes: 0, example: rule.name });
          slots.get(sig).recipes++;
        }
      }
      if (recipes === 0) warnings.push(`era rule: inputsOf ${asArray(grp.inputsOf).join(', ')} of group ${grp.id} matches no recipe`);
      for (const s of slots.values()) if (!seen.has(s.name)) items.push(s);
    }
    groups.push({ ...grp, label: grp.label || grp.id, rank: idx.get(grp.era), items });
  }
  for (const r of resources) {
    for (const id of r.onlyFrom) if (!resById.has(id)) warnings.push(`era rule: onlyFrom of ${r.id} names resource ${id}, which isn't in eraResources`);
  }
  return { order, idx, isLater, resources, resById, groups, active: active && order.length > 0 };
}

/**
 * "Without these resources" view: the gate's reach with their keys removed from every source, without the world
 * sources from their dimensions, and without the recipes that are only valid there.
 */
export function eraView(model, resList) {
  const g = model.g;
  const blocked = new Uint8Array(g.nKeys);
  const keyRes = new Map();
  for (const r of resList) {
    for (const k of r.keys) {
      blocked[k] = 1;
      if (!keyRes.has(k)) keyRes.set(k, r);
    }
  }
  const dims = new Set(resList.flatMap((r) => r.dims));
  const dimRes = (d) => resList.find((r) => r.dims.includes(d));
  const enabled = new Uint8Array(g.rules.length).fill(1);
  const lostWorld = new Map();
  const facts = [];
  for (const s of model.worldSources) {
    const off = s.origin.length > 0 && s.origin.every((d) => dims.has(d));
    if (off) {
      if (s.rule !== undefined) enabled[s.rule] = 0;
      for (const k of s.keys) if (!lostWorld.has(k)) lostWorld.set(k, { source: s, resource: dimRes(s.origin[0]) });
    } else if (s.kind === 'manual' || s.kind === 'auto') facts.push(...s.keys);
  }
  if (dims.size > 0) {
    // recipes only valid in those dimensions, and the generator rules copied from them (synthetic recipesOf: the Venus engine's heat)
    g.rules.forEach((rule, i) => {
      const ds = rule.meta && rule.meta.dims;
      if ((rule.kind === 'recipe' || rule.kind === 'synthetic') && ds && ds.length > 0 && ds.every((d) => dims.has(d))) enabled[i] = 0;
    });
  }
  const lf = lfp(g, { facts, enabled, blocked });
  const reasonOf = (k) => {
    if (blocked[k]) {
      const r = keyRes.get(k);
      return { code: 'later-era', resource: r, text: `resource from a later era: ${eraLabel(r)}` };
    }
    if (!lf.reached[k] && lostWorld.has(k)) {
      const { source, resource } = lostWorld.get(k);
      return { code: 'later-era', resource, text: `only comes from ${source.origin.join(', ')} (source «${source.id}»): resource from a later era, ${eraLabel(resource)}` };
    }
    return null;
  };
  const view = { resList, blocked, enabled, facts, lf, reasonOf, blocker: null };
  view.blockerOf = () => {
    if (!view.blocker) {
      const base = makeRootCost(model, enabled);
      const rootCost = (k) => (reasonOf(k) ? 1 : base(k));
      const bc = blockCosts(g, { mask: lf.reached, enabled, rootCost, blocked });
      view.blocker = { ...bc, mask: lf.reached, capMask: null, reasonOf };
    }
    return view.blocker;
  };
  return view;
}

/** Later resources named by a blocking tree. */
function laterIn(tree) {
  const out = new Map();
  for (const why of blockedRoots(tree).values()) if (why.code === 'later-era' && why.resource) out.set(why.resource.id, why.resource);
  return [...out.values()];
}

function itemTree(model, view, it) {
  const bl = view.blockerOf();
  const keys = it.alts || (it.key !== undefined ? [it.key] : []);
  if (keys.length === 0) return null;
  let pick = keys[0];
  for (const k of keys) if (bl.cost[k] < bl.cost[pick]) pick = k;
  return blockedTree(model, bl, pick);
}

function itemName(it) {
  return it.alts && it.recipes ? `${it.name}  (input of ${it.recipes} recipe(s), e.g. ${it.example})` : it.name;
}

/** Prunes nodes already expanded in an earlier chain of the group (shown as "already expanded above"). */
function pruneSeen(tree, seen) {
  const walk = (n, depth) => {
    if (!n || n.ruleRoot) return;
    if (depth > 0 && n.kids && n.kids.length > 0 && seen.has(n.key)) {
      n.kids = [];
      n.seen = true;
      return;
    }
    if (n.kids && n.kids.length > 0) seen.add(n.key);
    for (const k of n.kids || []) walk(k.child, depth + 1);
  };
  walk(tree, 0);
  return tree;
}

function evalGroup(model, res, eras, grp, viewFor) {
  const view = viewFor(grp.era);
  const later = eras.resources.filter((r) => eras.isLater(r.era, grp.era));
  const buckets = { ok: [], violation: [], unreachable: [], missing: [], later: [] };
  for (const it of grp.items) {
    const keys = it.alts || (it.key !== undefined ? [it.key] : []);
    if (it.missing) buckets.missing.push(it);
    else if (it.pattern && keys.length > 0 && keys.every((k) => view.blocked[k])) buckets.later.push(it);
    else if (keys.some((k) => view.lf.reached[k])) buckets.ok.push(it);
    else if (keys.some((k) => res.gate.reached[k])) buckets.violation.push(it);
    else if (it.pattern) buckets.unreachable.push(it);
    else buckets.unreachable.push({ ...it, explicit: true });
  }
  const explicitUnreachable = buckets.unreachable.filter((it) => it.explicit);
  const checked = buckets.ok.length + buckets.violation.length;
  let verdict = 'PASS';
  if (buckets.violation.length > 0 || buckets.missing.length > 0) verdict = grp.optional ? 'WARN' : 'FAIL';
  else if (explicitUnreachable.length > 0) verdict = 'WARN';
  const after = `later than ${grp.era}${later.length > 0 ? '' : ' (none declared)'}`;
  const extras = [];
  if (buckets.later.length > 0) extras.push(`${buckets.later.length} already belong to a later resource and don't count`);
  if (buckets.unreachable.length > 0) extras.push(`${buckets.unreachable.length} aren't made in this tier`);
  if (buckets.missing.length > 0) extras.push(`${buckets.missing.length} don't exist in the registry`);
  const summary = buckets.violation.length > 0
    ? `${buckets.violation.length} of ${checked} need a resource from an era later than ${grp.era}`
    : `${buckets.ok.length}/${checked} with no resources from eras ${after}`;
  const lines = [`${summary}${extras.length > 0 ? ` (${extras.join('; ')})` : ''}`];
  if (grp.optional && verdict !== 'PASS') lines.push("(optional group: a warning, but it doesn't sink the verdict)");
  // chains in the same group share segments (the suit's four pieces all need the same fabric): each segment is expanded once
  const seen = new Set();
  const violations = [];
  for (const it of buckets.violation) {
    const tree = itemTree(model, view, it);
    const res2 = tree ? laterIn(tree) : [];
    violations.push({ item: it.name, resources: res2.map((r) => ({ id: r.id, era: r.era, label: r.label })), tree });
  }
  violations.slice(0, MAX_DETAIL).forEach((v, i) => {
    const it = buckets.violation[i];
    lines.push(`  ✗ ${itemName(it)} — needs ${v.resources.length > 0 ? v.resources.map(eraLabel).join(', ') : 'a later resource'}`);
    if (v.tree) lines.push(...renderTree(model, pruneSeen(v.tree, seen), { prefix: '      ' }));
  });
  if (violations.length > MAX_DETAIL) lines.push(`  … +${violations.length - MAX_DETAIL} more violations (all in the JSON)`);
  for (const it of buckets.missing) lines.push(`  ? ${it.name} — doesn't exist in the registry${grp.optional ? " (hasn't arrived yet)" : ' (misspelled id?)'}`);
  for (const it of explicitUnreachable.slice(0, MAX_DETAIL)) {
    const tree = itemTree(model, view, it);
    const res2 = tree ? laterIn(tree) : [];
    const why = tree ? "isn't made in this tier even with every resource" : "is in the registry, but no recipe or source in the model gives it";
    lines.push(`  ? ${itemName(it)} — ${why} (the rule can't be checked)${res2.length > 0 ? `; it also needs ${res2.map(eraLabel).join(', ')}` : ''}`);
    if (tree) lines.push(...renderTree(model, pruneSeen(tree, seen), { prefix: '      ' }));
  }
  const list = (arr) => arr.slice(0, 8).map((it) => it.name).join(', ') + (arr.length > 8 ? ` … +${arr.length - 8}` : '');
  if (buckets.later.length > 0) lines.push(`  · from a later resource (don't count as this era's): ${list(buckets.later)}`);
  const patternUnreachable = buckets.unreachable.filter((it) => !it.explicit);
  if (patternUnreachable.length > 0) lines.push(`  · not made in this tier (not checked): ${list(patternUnreachable)}`);
  return {
    group: grp, verdict, lines,
    counts: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])),
    violations: violations.map((v) => ({ item: v.item, resources: v.resources })),
    unreachable: buckets.unreachable.map((it) => it.name),
    missing: buckets.missing.map((it) => it.name),
    later: buckets.later.map((it) => it.name),
  };
}

/** "Titanium only comes from the Moon": without the `onlyFrom` resources, no key of the resource is reached. */
function evalExclusive(model, eras, r) {
  const g = model.g;
  const sources = r.onlyFrom.map((id) => eras.resById.get(id)).filter(Boolean);
  const view = eraView(model, sources);
  const own = new Uint8Array(g.nKeys);
  for (const k of r.keys) own[k] = 1;
  const leaked = r.keys.filter((k) => view.lf.reached[k]);
  const from = sources.map((s) => s.label || s.id).join(', ') || '(no known resource)';
  const lines = [];
  if (leaked.length === 0) {
    lines.push(`none of its ${r.keys.length} items and fluids come out without ${from}, as it should be`);
    return { resource: r, verdict: 'PASS', lines, leaked: [], entries: [] };
  }
  // entry points: rules that give a key of the resource without consuming any. It only counts as a source if its
  // inputs are also reached without the resource itself; otherwise it recycles what already carries the resource
  // (macerating an EV motor gives titanium) and doesn't count.
  const pure = eraView(model, [...sources, r]);
  const isSource = (i) => g.rules[i].slots.every((slot) => slot.alts.some((a) => pure.lf.reached[a] === 1));
  const entries = [];
  let recycled = 0;
  g.rules.forEach((rule, i) => {
    if (!view.lf.fired[i] || !rule.outs.some((o) => own[o])) return;
    const so = g.slotOffset[i];
    for (let s = 0; s < rule.slots.length; s++) {
      const by = view.lf.satBy[so + s] >= 0 ? view.lf.satBy[so + s] : view.lf.capPick[so + s];
      if (by >= 0 && own[by]) return;
    }
    if (!isSource(i)) {
      recycled++;
      return;
    }
    entries.push({ rule: i, level: view.lf.ruleLevel[i], outs: rule.outs.filter((o) => own[o]) });
  });
  const factEntries = view.facts.filter((k) => own[k]);
  entries.sort((a, b) => a.level - b.level);
  // grouped by the resource key they bring in: «gtceu:rutile_dust ← 8 rules: ...»
  const byKey = new Map();
  for (const k of factEntries) byKey.set(k, ['from the world (a world source not from ' + from + ')']);
  for (const e of entries) {
    for (const o of e.outs) {
      if (!byKey.has(o)) byKey.set(o, []);
      byKey.get(o).push(describeRule(g, e.rule));
    }
  }
  lines.push(`LEAK: ${leaked.length} of its ${r.keys.length} items and fluids come out without ${from}. They come in through ${entries.length + factEntries.length} source(s) in ${byKey.size} key(s)${recycled > 0 ? ` (and ${recycled} recipe(s) that recycle what already carries it, which don't count)` : ''}:`);
  const keyList = [...byKey.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [k, how] of keyList.slice(0, 12)) {
    lines.push(`  · ${g.keyNames[k]}  ← ${how.length > 1 ? `${how.length} sources: ` : ''}${how.slice(0, 3).join(' ; ')}${how.length > 3 ? ' …' : ''}`);
  }
  if (keyList.length > 12) lines.push(`  … +${keyList.length - 12} more keys (all in the JSON)`);
  const first = entries.length > 0 ? entries[0].outs[0] : factEntries[0];
  if (first !== undefined) {
    lines.push(`  the first one reached (${g.keyNames[first]}):`);
    lines.push(...renderTree(model, derivationTree(model, view.lf, first, { depth: 2, kids: 4 }), { prefix: '      ', maxKids: 4 }));
  }
  return {
    resource: r, verdict: r.optional ? 'WARN' : 'FAIL', lines, recycled,
    leaked: leaked.map((k) => g.keyNames[k]),
    entries: [...factEntries.map((k) => `world → ${g.keyNames[k]}`), ...entries.map((e) => `${describeRule(g, e.rule)} → ${e.outs.map((o) => g.keyNames[o]).join(', ')}`)],
  };
}

/** Evaluates the era rule: item groups and exclusivity checks. */
export function evaluateEras(model, res) {
  const eras = prepareEras(model);
  const out = { active: eras.active, resources: [], groups: [], exclusive: [], counts: { pass: 0, warn: 0, total: 0 }, verdict: 'PASS' };
  if (!eras.active) return out;
  const views = new Map();
  const viewFor = (era) => {
    if (!views.has(era)) views.set(era, eraView(model, eras.resources.filter((r) => eras.isLater(r.era, era))));
    return views.get(era);
  };
  out.resources = eras.resources.map((r) => {
    const sources = model.worldSources.filter((s) => s.origin.length > 0 && s.origin.every((d) => r.dims.includes(d))).map((s) => s.id);
    return { id: r.id, era: r.era, label: r.label, keys: r.keys.length, dims: r.dims, sources, onlyFrom: r.onlyFrom };
  });
  for (const grp of eras.groups) out.groups.push(evalGroup(model, res, eras, grp, viewFor));
  for (const r of eras.resources) if (r.onlyFrom.length > 0) out.exclusive.push(evalExclusive(model, eras, r));
  const all = [...out.groups, ...out.exclusive];
  out.counts = {
    pass: all.filter((x) => x.verdict === 'PASS').length,
    warn: all.filter((x) => x.verdict === 'WARN').length,
    total: all.length,
  };
  out.verdict = all.some((x) => x.verdict === 'FAIL') ? 'FAIL' : 'PASS';
  return out;
}
