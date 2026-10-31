// Cumulative base-cost solver over normalized recipes (lib/normalize.mjs shape). Pure: no disk access.
//
//   const model = solveCosts(recipes, opts);   // cheapest way to make every key, as a scalar
//   const vec = model.vector(key);             // Map(base key -> amount) of that cheapest way, or null if unreachable
//
// A recipe is {id, inputs:[{alts, count, cap, consume, circuit?}], outputs:[{key, count, chance}], eut, amp, duration}.
// Keys are item ids or `fluid:<id>`; fluid amounts are mB. The vector of a key is per ONE native unit of it (1 item or 1 mB),
// so a consumer multiplies by what it consumes. `~eu` is the extra dimension for machine energy.
//
// Every choice that changes a number is an option, so the document can state it (cost_matrix.json):
//   isBase(key)        base resources: their cost is themselves. Recipes that make them are ignored.
//   weight(key)        what one unit of a base resource is worth in the score (default 1; 0 = free, e.g. water, air).
//   fluidUnitMb        mB that count as one "unit" when a fluid is weighed or when output units are split (default 1000).
//   allocation         'units' (default): the inputs are split over the expected output units of every output;
//                      'primary': only the first output exists for the cost (the others are lost byproducts);
//                      'full': every output bears the whole recipe cost (no free byproducts: nothing is cheap only because it
//                      is a by-product of a recipe whose main product pays).
//   chance             'expected' (default): count x chance; 'full': ignore chances; 'guaranteed': chance-1 outputs only.
//   noShare(key)       outputs that take no share of the cost (inert byproducts such as stone or water).
//   sourceAsBase       keys made by a recipe that consumes nothing (gas collector, ...) are base resources (default true).
//   euWeight           weight of 1 EU in the score used to PICK recipes (default 0). EU is always tracked in `~eu`.
//   excludeRecipe(rec) recipes to ignore (recycling, unpacking, ...).
// Non-consumed inputs (cap) and programmed circuits cost nothing; catalysts cost their expected consumption (count x consume).
// Tag inputs take the cheapest alternative. Items are finalized in increasing cost (Dijkstra / Knuth), each recipe fires once,
// so a chain that multiplies matter in a loop cannot pump a cost to zero; the chosen recipes form a DAG (`cuts` stays empty).

export const EU_KEY = '~eu';
const IMPROVE = 1 - 1e-9;
const CIRCUIT_KEY = 'gtceu:programmed_circuit';

export function globToRe(g) {
  return new RegExp('^' + g.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$');
}

export function globMatcher(globs) {
  const res = (globs || []).map(globToRe);
  return (s) => res.some((r) => r.test(s));
}

export function solveCosts(recipes, opts = {}) {
  const fluidUnitMb = opts.fluidUnitMb || 1000;
  const allocation = opts.allocation || 'units';
  const chanceMode = opts.chance || 'expected';
  const euWeight = opts.euWeight || 0;
  const eps = opts.freeEpsilon ?? 1e-4;
  const isBase = opts.isBase || (() => false);
  const weightOf = opts.weight || (() => 1);
  const noShare = opts.noShare || (() => false);
  const excluded = opts.excludeRecipe || (() => false);
  const unit = (key) => (key.startsWith('fluid:') ? 1 / fluidUnitMb : 1);

  const prepared = [];
  for (const r of recipes) {
    if (excluded(r)) continue;
    const ins = [];
    for (const i of r.inputs) {
      if (i.cap || !(i.consume > 0) || !(i.count > 0)) continue;
      if (i.alts.length === 1 && i.alts[0] === CIRCUIT_KEY) continue;
      ins.push({ alts: i.alts, amount: i.count * i.consume });
    }
    const outs = [];
    for (const o of r.outputs) {
      if (o.key.startsWith('research:') || !(o.count > 0)) continue;
      const n = chanceMode === 'full' ? o.count : chanceMode === 'guaranteed' ? (o.chance >= 1 ? o.count : 0) : o.count * o.chance;
      if (n > 0) outs.push({ key: o.key, n });
    }
    if (!outs.length) continue;
    const used = allocation === 'primary' ? outs.slice(0, 1) : outs;
    let denom = 0;
    for (const o of used) if (!noShare(o.key)) denom += o.n * unit(o.key);
    if (!(denom > 0)) continue;
    for (const o of used) o.d = allocation === 'full' ? o.n * unit(o.key) : denom;
    const eu = r.eut > 0 && !(r.euOut > 0) ? r.eut * (r.amp || 1) * (r.duration || 0) : 0;
    prepared.push({ id: r.id, ins, outs: used, eu });
  }

  const baseCache = new Map();
  const sources = new Set();
  if (opts.sourceAsBase !== false) for (const p of prepared) if (!p.ins.length) for (const o of p.outs) sources.add(o.key);
  const baseOf = (key) => {
    let b = baseCache.get(key);
    if (b === undefined) { b = sources.has(key) || isBase(key); baseCache.set(key, b); }
    return b;
  };
  const metricBase = (key) => {
    const w = weightOf(key);
    return (w > 0 ? w : eps) * unit(key);
  };

  const cost = new Map();
  const choice = new Map();
  // Knuth's generalisation of Dijkstra: items are finalized in increasing cost, and a recipe fires once, when the
  // cheapest alternative of each of its inputs is final. A cycle that multiplies matter (dust <-> small dust, packers
  // and unpackers) therefore cannot pump a cost down to zero, which plain relaxation does; the chosen recipes form a DAG.
  const seen = new Map();
  prepared.forEach((p, idx) => {
    p.ins.forEach((i, n) => {
      for (const a of new Set(i.alts)) {
        let l = seen.get(a);
        if (!l) seen.set(a, (l = []));
        l.push(idx * 256 + n);
      }
    });
  });
  const baseKeys = new Set();
  for (const p of prepared) {
    for (const i of p.ins) for (const a of i.alts) if (baseOf(a)) baseKeys.add(a);
    for (const o of p.outs) if (baseOf(o.key)) baseKeys.add(o.key);
  }

  const heapC = [];
  const heapK = [];
  const heapS = [];
  let seq = 0;
  const less = (a, b) => heapC[a] < heapC[b] || (heapC[a] === heapC[b] && heapS[a] < heapS[b]);
  const swap = (a, b) => {
    [heapC[a], heapC[b]] = [heapC[b], heapC[a]];
    [heapK[a], heapK[b]] = [heapK[b], heapK[a]];
    [heapS[a], heapS[b]] = [heapS[b], heapS[a]];
  };
  const heapPush = (c, k, ch) => {
    heapC.push(c); heapK.push({ k, ch }); heapS.push(seq++);
    let i = heapC.length - 1;
    while (i > 0) {
      const par = (i - 1) >> 1;
      if (!less(i, par)) break;
      swap(i, par);
      i = par;
    }
  };
  const heapPop = () => {
    const top = { c: heapC[0], ...heapK[0] };
    const lastC = heapC.pop(); const lastK = heapK.pop(); const lastS = heapS.pop();
    if (heapC.length) {
      heapC[0] = lastC; heapK[0] = lastK; heapS[0] = lastS;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < heapC.length && less(l, m)) m = l;
        if (r < heapC.length && less(r, m)) m = r;
        if (m === i) break;
        swap(i, m);
        i = m;
      }
    }
    return top;
  };

  for (const k of [...baseKeys].sort()) heapPush(metricBase(k), k, null);
  const waiting = prepared.map((p) => p.ins.length);
  const pickOf = prepared.map((p) => new Array(p.ins.length).fill(null));
  const satisfied = prepared.map((p) => new Uint8Array(p.ins.length));
  const fire = (idx) => {
    const p = prepared[idx];
    let total = euWeight * p.eu;
    p.ins.forEach((i, n) => { total += i.amount * cost.get(pickOf[idx][n]); });
    for (const o of p.outs) {
      if (baseOf(o.key) || noShare(o.key) || cost.has(o.key)) continue;
      heapPush((total / o.d) * unit(o.key), o.key, { idx, picks: pickOf[idx] });
    }
  };
  prepared.forEach((p, idx) => { if (!p.ins.length) fire(idx); });
  let relaxations = 0;
  const converged = true;
  while (heapC.length) {
    const { c, k, ch } = heapPop();
    if (cost.has(k)) continue;
    relaxations++;
    cost.set(k, c);
    if (ch) choice.set(k, ch);
    for (const ref of seen.get(k) || []) {
      const idx = ref >> 8;
      const n = ref & 255;
      if (satisfied[idx][n]) continue;
      satisfied[idx][n] = 1;
      pickOf[idx][n] = k;
      if (--waiting[idx] === 0) fire(idx);
    }
  }

  const memo = new Map();
  const active = new Set();
  const cuts = new Set();
  const vector = (key) => {
    if (baseOf(key)) return new Map([[key, 1]]);
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    const ch = choice.get(key);
    if (!ch) { memo.set(key, null); return null; }
    if (active.has(key)) { cuts.add(key); return new Map(); }
    active.add(key);
    const p = prepared[ch.idx];
    const acc = new Map();
    p.ins.forEach((i, n) => {
      const v = vector(ch.picks[n]);
      if (v) for (const [b, a] of v) acc.set(b, (acc.get(b) || 0) + a * i.amount);
    });
    if (p.eu > 0) acc.set(EU_KEY, (acc.get(EU_KEY) || 0) + p.eu);
    const f = unit(key) / p.outs.find((o) => o.key === key).d;
    for (const [b, a] of acc) acc.set(b, a * f);
    active.delete(key);
    memo.set(key, acc);
    return acc;
  };

  return {
    vector,
    converged,
    relaxations,
    cuts,
    recipesUsed: prepared.length,
    isBase: baseOf,
    sources,
    reachable: (key) => baseOf(key) || choice.has(key),
    recipeOf: (key) => (choice.has(key) ? prepared[choice.get(key).idx].id : null),
    metric: (key) => cost.get(key),
    // The chosen recipe of a key: its id, the picked inputs with amounts, and the output units it shares them over.
    choiceOf: (key) => {
      const ch = choice.get(key);
      if (!ch) return null;
      const p = prepared[ch.idx];
      return { id: p.id, denom: p.outs.find((o) => o.key === key).d, outs: p.outs, inputs: p.ins.map((i, n) => ({ key: ch.picks[n], amount: i.amount })) };
    },
  };
}

// Items, litres, EU and weighted score of a vector; the top contributors by weighted share.
export function summarize(vec, { weight = () => 1, fluidUnitMb = 1000, top = 3 } = {}) {
  let items = 0;
  let fluidL = 0;
  let freeItems = 0;
  let freeFluidL = 0;
  let eu = 0;
  let score = 0;
  const parts = [];
  for (const [k, a] of vec) {
    if (k === EU_KEY) { eu += a; continue; }
    const isFluid = k.startsWith('fluid:');
    const w = weight(k);
    const units = isFluid ? a / fluidUnitMb : a;
    if (w <= 0) { if (isFluid) freeFluidL += a / 1000; else freeItems += a; continue; }
    if (isFluid) fluidL += a / 1000; else items += a;
    score += units * w;
    parts.push([k, units * w]);
  }
  parts.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
  return {
    items, fluidL, freeItems, freeFluidL, eu, score,
    top: parts.slice(0, top).map(([k, s]) => ({ key: k, share: score > 0 ? s / score : 0 })),
  };
}
