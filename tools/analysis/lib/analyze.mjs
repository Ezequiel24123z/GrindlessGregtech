// Runs the analysis passes and evaluates the targets.
//   "gate" pass  : the whole world (manual + auto) -> can the gate be made with no commands?
//   "auto" pass  : no manual gathering except the declared bootstrap -> is there sustainable auto-generation?
import { blockCosts, groundedSustain, lfp } from './engine.mjs';
import { makeRootCost } from './explain.mjs';
import { asArray, makeGlobMatcher } from './util.mjs';

export const STATUS = {
  SUSTAINED: 'sustained', // regenerates on its own
  FINITE: 'finite', // only with a source that runs out (the steam miner)
  BOOTSTRAP: 'bootstrap', // only thanks to the manual bootstrap, not resupplied
  MANUAL: 'manual', // only by hand
  UNREACHABLE: 'unreachable',
};
const RANK = [STATUS.UNREACHABLE, STATUS.MANUAL, STATUS.BOOTSTRAP, STATUS.FINITE, STATUS.SUSTAINED];

export function runPasses(model) {
  const { g } = model;
  const nR = g.rules.length;
  const nK = g.nKeys;
  const all = new Uint8Array(nR).fill(1);
  const gateFacts = [...model.facts.manual, ...model.facts.auto];
  const gate = lfp(g, { facts: gateFacts, enabled: all });

  const enAuto = new Uint8Array(nR).fill(1);
  const enAutoInf = new Uint8Array(nR).fill(1);
  // manual gathering that requires an item first (the End key) isn't a source in auto: its resources count as a
  // bootstrap (one-off) if the gate reaches that item
  const dynBootstrap = [];
  g.rules.forEach((r, i) => {
    if (r.kind === 'machine-build') {
      enAuto[i] = 0;
      enAutoInf[i] = 0;
    } else if (r.kind === 'world-auto' && r.meta.finite) enAutoInf[i] = 0;
    else if (r.kind === 'world-manual') {
      enAuto[i] = 0;
      enAutoInf[i] = 0;
      if (r.meta.bootstrap && gate.fired[i] === 1) dynBootstrap.push(...r.outs);
    }
  });
  const seed = [...model.facts.auto, ...model.facts.bootstrap, ...dynBootstrap];
  const prod = lfp(g, { facts: seed, enabled: enAuto, capOk: gate.reached });
  const permanent = new Uint8Array(nK);
  for (const k of model.facts.auto) permanent[k] = 1;
  const sustain = (enabled) => {
    const r = groundedSustain(g, { universe: prod.reached, enabled, capOk: gate.reached, permanent });
    // inS = sustained keys, ruleLive = rules that can be kept up, supportRule = the rule that founds them.
    return { inS: r.G.reached, ruleLive: r.G.fired, supportRule: r.G.via, level: r.G.level, G: r.G, S: r.S, rounds: r.rounds };
  };
  // A target can ask to be sustained "without" certain rules (globs over their names): its own view of the auto pass.
  const views = new Map();
  const viewFor = (without) => {
    const list = [...(without || [])].sort();
    const sig = list.join('|');
    if (!views.has(sig)) {
      const match = makeGlobMatcher(list);
      const drop = (en) => {
        if (list.length === 0) return en;
        const e = Uint8Array.from(en);
        g.rules.forEach((r, i) => {
          if (match(r.name)) e[i] = 0;
        });
        return e;
      };
      const enInf = drop(enAutoInf);
      const enAll = drop(enAuto);
      views.set(sig, { sig, enAutoInf: enInf, enAuto: enAll, susInf: sustain(enInf), susAll: sustain(enAll) });
    }
    return views.get(sig);
  };
  const base = viewFor([]);
  // Same for the gate: `without` on a gate target recalculates it without those rules (e.g. "titanium isn't obtained
  // without the vacuum freezer": expect "unreachable" + without ["build:gtceu:vacuum_freezer"]).
  const gateViews = new Map();
  const gateViewFor = (without) => {
    const list = [...(without || [])].sort();
    if (list.length === 0) return null;
    const sig = list.join('|');
    if (!gateViews.has(sig)) {
      const match = makeGlobMatcher(list);
      const en = Uint8Array.from(all);
      g.rules.forEach((r, i) => {
        if (match(r.name)) en[i] = 0;
      });
      gateViews.set(sig, { sig, all: en, gate: lfp(g, { facts: gateFacts, enabled: en }) });
    }
    return gateViews.get(sig);
  };
  return { gate, prod, susInf: base.susInf, susAll: base.susAll, enAuto, enAutoInf, all, viewFor, gateViewFor };
}

export function keyStatus(res, k, view = res) {
  if (view.susInf.inS[k]) return STATUS.SUSTAINED;
  if (view.susAll.inS[k]) return STATUS.FINITE;
  if (res.prod.reached[k]) return STATUS.BOOTSTRAP;
  if (res.gate.reached[k]) return STATUS.MANUAL;
  return STATUS.UNREACHABLE;
}

const betterThan = (a, b) => RANK.indexOf(a) > RANK.indexOf(b);

/** A recipe "works" in a pass if all of its slots are met. */
function recipeUsable(model, res, mode, r, view) {
  if (mode === 'gate') return (view && view.gate ? view.gate : res.gate).fired[r] === 1;
  return view.susInf.ruleLive[r] === 1;
}

function recipeMatches(model, rule, t, nameMatch) {
  const g = model.g;
  if (rule.kind !== 'recipe' || (t.type && rule.type !== t.type)) return false;
  if (nameMatch && !nameMatch(rule.name)) return false;
  if (t.output && !rule.outs.some((o) => g.keyNames[o] === t.output)) return false;
  if (t.input && !asArray(t.input).every((inp) => rule.slots.some((s) => s.alts.some((a) => g.keyNames[a] === inp)))) return false;
  if (t.dimension) {
    const dims = rule.meta.dims || [];
    if ((rule.meta.notDims || []).includes(t.dimension)) return false;
    if (dims.length > 0 && !dims.includes(t.dimension)) return false;
  }
  return true;
}

/**
 * `machineless` (leak checks for addon recipes): could the recipe be completed if its machine existed?
 * The machine slot is ignored (an addon's controller may have no recipe, or appear later) and everything else is
 * required: a registered machine runs it, it fits in `maxEUt`, and all its inputs and conditions are reached.
 * Returns 'usable' or the reason: 'no-machine' | 'eut' | 'inputs'.
 */
function machinelessVerdict(model, res, mode, rule, view, t) {
  if (t.maxEUt !== undefined && rule.meta.eut > t.maxEUt) return 'eut';
  if (model.runnersOf(rule.type).length === 0) return 'no-machine';
  const sus = mode === 'auto' ? view.susInf : null;
  const gate = mode === 'gate' ? (view && view.gate ? view.gate : res.gate) : null;
  for (const slot of rule.slots) {
    if (slot.role === 'machine') continue;
    const ok = mode === 'gate'
      ? slot.alts.some((a) => gate.reached[a] === 1)
      : slot.alts.some((a) => sus.inS[a] === 1 || (slot.cap && res.gate.reached[a] === 1));
    if (!ok) return 'inputs';
  }
  return 'usable';
}

/**
 * `kind: "site"` (static: the same in every pass, whether or not the recipes can be completed): every recipe of `type`/`types`
 * and/or with an id matching `recipe` (globs) carries dimension conditions, all of them among `dimensions` (GTM ORs a recipe's
 * dimension conditions), and no reversed one. It checks the "Site machines" rule (the Moon's machines only run on the Moon) and
 * the fuels' allowlist of air dimensions. `exact: true`: every recipe names every dimension of the list; `allowAnywhere`: id
 * globs of recipes that may carry no dimension condition (fuels that carry their own oxidizer). No matching recipe = FAIL.
 */
function evalSite(model, t) {
  const g = model.g;
  const types = new Set([...asArray(t.type), ...asArray(t.types)]);
  const nameMatch = t.recipe ? makeGlobMatcher(asArray(t.recipe)) : null;
  const anywhere = makeGlobMatcher(asArray(t.allowAnywhere));
  const site = asArray(t.dimensions);
  const defined = [];
  const offenders = [];
  let unconditioned = 0;
  for (const rule of g.rules) {
    if (rule.kind !== 'recipe' || (types.size > 0 && !types.has(rule.type)) || (nameMatch && !nameMatch(rule.name))) continue;
    defined.push(rule.id);
    const dims = rule.meta.dims || [];
    const notDims = rule.meta.notDims || [];
    let why = null;
    if (notDims.length > 0) why = `a reversed condition (outside ${notDims.join(', ')}): with GTM's OR it holds almost everywhere`;
    else if (dims.length === 0) {
      if (anywhere(rule.name)) unconditioned++;
      else why = 'no dimension condition: it runs anywhere';
    } else {
      const extra = dims.filter((d) => !site.includes(d));
      const missing = t.exact ? site.filter((d) => !dims.includes(d)) : [];
      if (extra.length > 0) why = `also runs in ${extra.join(', ')}`;
      else if (missing.length > 0) why = `doesn't run in ${missing.join(', ')}`;
    }
    if (why) offenders.push({ rule: rule.id, why });
  }
  const ok = defined.length > 0 && offenders.length === 0;
  return { target: t, view: null, kind: 'site', ok, status: ok ? STATUS.SUSTAINED : STATUS.UNREACHABLE, defined, offenders, unconditioned, key: null };
}

/**
 * Evaluates a target in 'gate' mode (reachable by hand) or 'auto' mode (sustainable).
 * Returns {target, ok, status, key, detail}.
 */
export function evalTarget(model, res, t, mode) {
  if (t.kind === 'site') return evalSite(model, t);
  const g = model.g;
  // `without` (globs over rule names): in auto, a view of the auto pass; in the gate, reachability recalculated without those rules
  const view = mode === 'auto' ? res.viewFor(t.without) : res.gateViewFor(t.without);
  const gateOf = view && view.gate ? view.gate : res.gate;
  // Leak checks: in the gate (expect "unreachable") it must not be obtainable even by hand; in auto
  // (expect "not-automatic") it must not be able to sustain itself alone (it may exist as a block placed once, not as a resupplied resource).
  const neg = (mode === 'gate' && t.expect === 'unreachable') || (mode === 'auto' && t.expect === 'not-automatic');
  const resolveKeys = (x) => asArray(x).flatMap((s) => model.resolve(s, `target ${t.id}`));
  const statusOf = (k) => {
    if (mode === 'gate') return gateOf.reached[k] ? STATUS.MANUAL : STATUS.UNREACHABLE;
    return keyStatus(res, k, view);
  };
  const okStatus = (s) => (mode === 'gate' ? s !== STATUS.UNREACHABLE : s === STATUS.SUSTAINED);

  if ((t.type || t.recipe) && (t.kind === 'recipe' || !t.item)) {
    // `recipe`: globs over the recipe's id (alone or together with `type`). `expect` also applies here: a leak check
    // on one specific recipe ("an addon's platinum line can't be used") is PASS if no match can be used.
    const nameMatch = t.recipe ? makeGlobMatcher(asArray(t.recipe)) : null;
    const hits = [];
    const defined = [];
    const why = {};
    for (const rule of g.rules) {
      if (!recipeMatches(model, rule, t, nameMatch)) continue;
      defined.push(rule.id);
      if (t.machineless) {
        const v = machinelessVerdict(model, res, mode, rule, view, t);
        if (v === 'usable') hits.push(rule.id);
        else why[v] = (why[v] || 0) + 1;
      } else if (recipeUsable(model, res, mode, rule.id, view)) hits.push(rule.id);
    }
    const used = hits.length > 0;
    return {
      target: t, view, kind: 'recipe', ok: neg ? !used : used, negative: !!neg,
      status: used ? (mode === 'gate' ? STATUS.MANUAL : STATUS.SUSTAINED) : STATUS.UNREACHABLE,
      hits, defined, why, key: null,
    };
  }

  const items = resolveKeys(t.item || t.fluid || t.anyOf);
  if (t.allOf) {
    const keys = resolveKeys(t.allOf).filter((n) => g.has(n)).map((n) => g.key(n));
    const st = keys.map(statusOf);
    const worst = st.reduce((w, s) => (betterThan(w, s) ? s : w), STATUS.SUSTAINED);
    const bad = keys.filter((k, i) => !okStatus(st[i]));
    return { target: t, view, kind: 'allOf', ok: bad.length === 0, status: worst, keys, badKeys: bad, key: bad[0] ?? keys[0] };
  }
  if (items.length === 0) {
    return { target: t, view, kind: 'item', ok: !!neg, status: STATUS.UNREACHABLE, key: null, empty: true, negative: neg };
  }
  let bestKey = null;
  let bestStatus = STATUS.UNREACHABLE;
  let bestLevel = Infinity;
  for (const n of items) {
    if (!g.has(n)) continue;
    const k = g.key(n);
    const s = statusOf(k);
    const lvl = mode === 'gate' ? gateOf.level[k] : res.prod.level[k];
    if (bestKey === null || betterThan(s, bestStatus) || (s === bestStatus && lvl < bestLevel)) {
      bestKey = k;
      bestStatus = s;
      bestLevel = lvl;
    }
  }
  if (neg) {
    // Leak check: the item must NOT be obtainable in this tier (e.g. GT's silicon before MV), or,
    // in auto, must not be able to produce itself alone (e.g. lava: it's boiler fuel, that would be an energy loop).
    const leaked = bestKey !== null && (mode === 'gate'
      ? bestStatus !== STATUS.UNREACHABLE
      : bestStatus === STATUS.SUSTAINED || bestStatus === STATUS.FINITE);
    return { target: t, view, kind: 'item', ok: !leaked, status: bestStatus, key: bestKey, negative: true, candidates: items.length };
  }
  return { target: t, view, kind: t.fluid ? 'fluid' : 'item', ok: bestKey !== null && okStatus(bestStatus), status: bestStatus, key: bestKey, candidates: items.length };
}

/** Blocking costs for a mask (gate: manual reach; auto: what's sustainable). Computed on demand. */
export function blockerFor(model, res, mode, cache, view = res) {
  const ck = mode === 'gate' ? `gate|${view.sig || ''}` : `auto|${view.sig || ''}`;
  if (cache.has(ck)) return cache.get(ck);
  let out;
  if (mode === 'gate') {
    // `view` is `res` itself (the whole gate) or a view of the gate without certain rules (`all` = active rules)
    out = {
      ...blockCosts(model.g, { mask: view.gate.reached, enabled: view.all, rootCost: makeRootCost(model, view.all) }),
      mask: view.gate.reached, capMask: null,
    };
  } else {
    out = {
      ...blockCosts(model.g, {
        mask: view.susInf.inS, capMask: res.gate.reached, enabled: view.enAutoInf, rootCost: makeRootCost(model, view.enAutoInf),
      }),
      mask: view.susInf.inS, capMask: res.gate.reached,
    };
  }
  cache.set(ck, out);
  return out;
}
