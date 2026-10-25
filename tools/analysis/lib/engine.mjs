// Reachability engine over a resources -> recipes -> resources hypergraph.
//   - lfp:  least fixed point (what can ever be made).
//   - gfp:  greatest fixed point restricted to a universe (what can be kept up with no manual intervention).
//   - blockCosts: Dijkstra over the hypergraph to pick the shortest blocking chain.
// A rule's "slot" is met if any of its alternatives (e.g. a tag's members) is available.

export class Graph {
  constructor() {
    this.keyIndex = new Map();
    this.keyNames = [];
    this.rules = [];
    this.nKeys = 0;
    this.nSlots = 0;
  }

  key(name) {
    let id = this.keyIndex.get(name);
    if (id === undefined) {
      id = this.keyNames.length;
      this.keyIndex.set(name, id);
      this.keyNames.push(name);
    }
    return id;
  }

  has(name) {
    return this.keyIndex.has(name);
  }

  /** rule = {name, kind, type, slots:[{alts:number[], cap:boolean, label, role}], outs:number[], meta} */
  addRule(rule) {
    rule.id = this.rules.length;
    this.rules.push(rule);
    return rule.id;
  }

  finalize() {
    const nR = this.rules.length;
    const nK = this.keyNames.length;
    this.nKeys = nK;
    this.slotOffset = new Int32Array(nR + 1);
    let total = 0;
    for (let r = 0; r < nR; r++) {
      this.slotOffset[r] = total;
      total += this.rules[r].slots.length;
    }
    this.slotOffset[nR] = total;
    this.nSlots = total;
    this.slotRule = new Int32Array(total);

    const wCount = new Int32Array(nK + 1);
    const pCount = new Int32Array(nK + 1);
    for (let r = 0; r < nR; r++) {
      const rule = this.rules[r];
      for (let s = 0; s < rule.slots.length; s++) {
        const slot = rule.slots[s];
        slot.alts = [...new Set(slot.alts)];
        this.slotRule[this.slotOffset[r] + s] = r;
        for (const a of slot.alts) wCount[a + 1]++;
      }
      rule.outs = [...new Set(rule.outs)];
      for (const o of rule.outs) pCount[o + 1]++;
    }
    for (let k = 0; k < nK; k++) {
      wCount[k + 1] += wCount[k];
      pCount[k + 1] += pCount[k];
    }
    this.watchStart = wCount;
    this.prodStart = pCount;
    this.watchG = new Int32Array(wCount[nK]);
    this.prodRule = new Int32Array(pCount[nK]);
    const wPos = wCount.slice(0, nK);
    const pPos = pCount.slice(0, nK);
    for (let r = 0; r < nR; r++) {
      const rule = this.rules[r];
      for (let s = 0; s < rule.slots.length; s++) {
        const gS = this.slotOffset[r] + s;
        for (const a of rule.slots[s].alts) this.watchG[wPos[a]++] = gS;
      }
      for (const o of rule.outs) this.prodRule[pPos[o]++] = r;
    }
  }

  producers(k) {
    const out = [];
    for (let p = this.prodStart[k]; p < this.prodStart[k + 1]; p++) out.push(this.prodRule[p]);
    return out;
  }
}

/**
 * Least fixed point.
 *  facts   : keys available from the start.
 *  enabled : Uint8Array per rule (1 = active); null = all.
 *  capOk   : if given, capital slots (not consumed) are taken as met when some alternative is in capOk.
 *  tolOk   : if given, "tolerant" slots (a machine's fuel, catalysts only sometimes consumed)
 *            are taken as met when some alternative is in tolOk; this way bootstrap loops (steam drives
 *            the drill that gives the coal that feeds the boiler) don't need a "pure" input.
 *  blocked : Uint8Array of keys removed from every source (era rule: resources from a later era); no rule
 *            produces them and no fact gives them, but the rules that give them as a byproduct still give the rest.
 */
export function lfp(g, { facts, enabled = null, capOk = null, tolOk = null, blocked = null }) {
  const nK = g.nKeys;
  const nR = g.rules.length;
  const nS = g.nSlots;
  const reached = new Uint8Array(nK);
  const level = new Int32Array(nK);
  const via = new Int32Array(nK).fill(-1);
  const slotSat = new Uint8Array(nS);
  const satBy = new Int32Array(nS).fill(-1);
  const capPick = new Int32Array(nS).fill(-1);
  const remaining = new Int32Array(nR);
  const fired = new Uint8Array(nR);
  const ruleLevel = new Int32Array(nR);
  const queue = new Int32Array(nK);
  let qh = 0;
  let qt = 0;

  const fire = (r) => {
    fired[r] = 1;
    const rule = g.rules[r];
    const so = g.slotOffset[r];
    let lvl = 0;
    for (let s = 0; s < rule.slots.length; s++) {
      const k = satBy[so + s];
      if (k >= 0 && level[k] > lvl) lvl = level[k];
    }
    ruleLevel[r] = lvl + 1;
    for (const o of rule.outs) {
      if (blocked && blocked[o]) continue;
      if (!reached[o]) {
        reached[o] = 1;
        level[o] = lvl + 1;
        via[o] = r;
        queue[qt++] = o;
      }
    }
  };

  for (let r = 0; r < nR; r++) {
    if (enabled && enabled[r] !== 1) {
      remaining[r] = -1;
      continue;
    }
    const rule = g.rules[r];
    remaining[r] = rule.slots.length;
    if (capOk || tolOk) {
      const so = g.slotOffset[r];
      for (let s = 0; s < rule.slots.length; s++) {
        const slot = rule.slots[s];
        const ok = slot.cap ? capOk : slot.tol ? tolOk : null;
        if (!ok) continue;
        const pick = slot.alts.find((a) => ok[a] === 1);
        if (pick !== undefined) {
          slotSat[so + s] = 1;
          capPick[so + s] = pick;
          remaining[r]--;
        }
      }
    }
  }
  for (let r = 0; r < nR; r++) if (remaining[r] === 0) fire(r);
  for (const k of facts) {
    if (blocked && blocked[k]) continue;
    if (!reached[k]) {
      reached[k] = 1;
      level[k] = 0;
      queue[qt++] = k;
    }
  }
  while (qh < qt) {
    const k = queue[qh++];
    for (let p = g.watchStart[k]; p < g.watchStart[k + 1]; p++) {
      const gS = g.watchG[p];
      if (slotSat[gS]) continue;
      const r = g.slotRule[gS];
      if (remaining[r] < 0) continue;
      slotSat[gS] = 1;
      satBy[gS] = k;
      if (--remaining[r] === 0) fire(r);
    }
  }
  return { reached, level, via, fired, ruleLevel, satBy, capPick, slotSat };
}

/**
 * Greatest fixed point ("sustains itself"): the largest subset S of `universe` such that every key in S is a
 * permanent fact or is produced by a live rule whose consumable slots have some alternative in S.
 * Cycles that feed themselves (the bit is made with bronze that comes from drilling) count as sustainable.
 *  universe : Uint8Array of candidate keys (usually whatever is reachable from auto + the manual bootstrap).
 *  enabled  : active rules.
 *  capOk    : capital slots must have some alternative in capOk (built once, by hand if needed).
 *  permanent: Uint8Array of keys with permanent support.
 */
export function gfp(g, { universe, enabled = null, capOk, permanent }) {
  const nK = g.nKeys;
  const nR = g.rules.length;
  const nS = g.nSlots;
  const inS = Uint8Array.from(universe);
  const eligible = new Uint8Array(nR);
  const alive = new Int32Array(nS);
  const ruleLive = new Uint8Array(nR);
  const support = new Int32Array(nK);

  for (let r = 0; r < nR; r++) {
    if (enabled && enabled[r] !== 1) continue;
    const rule = g.rules[r];
    let ok = true;
    for (const slot of rule.slots) {
      if (slot.cap && !slot.alts.some((a) => capOk[a] === 1)) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    eligible[r] = 1;
    const so = g.slotOffset[r];
    let live = true;
    for (let s = 0; s < rule.slots.length; s++) {
      const slot = rule.slots[s];
      if (slot.cap) continue;
      let c = 0;
      for (const a of slot.alts) if (inS[a]) c++;
      alive[so + s] = c;
      if (c === 0) live = false;
    }
    if (live) {
      ruleLive[r] = 1;
      for (const o of rule.outs) if (inS[o]) support[o]++;
    }
  }
  const queue = new Int32Array(nK);
  let qh = 0;
  let qt = 0;
  for (let k = 0; k < nK; k++) {
    if (!inS[k]) continue;
    if (permanent[k]) support[k]++;
    if (support[k] === 0) queue[qt++] = k;
  }
  while (qh < qt) {
    const k = queue[qh++];
    inS[k] = 0;
    for (let p = g.watchStart[k]; p < g.watchStart[k + 1]; p++) {
      const gS = g.watchG[p];
      const r = g.slotRule[gS];
      if (!eligible[r]) continue;
      const rule = g.rules[r];
      const s = gS - g.slotOffset[r];
      if (rule.slots[s].cap) continue;
      alive[gS]--;
      if (alive[gS] === 0 && ruleLive[r]) {
        ruleLive[r] = 0;
        for (const o of rule.outs) {
          if (inS[o] && --support[o] === 0) queue[qt++] = o;
        }
      }
    }
  }
  return { inS, ruleLive };
}

/**
 * "Sustains itself", grounded. The greatest fixed point (gfp) accepts any cycle that feeds itself, including
 * ones that create no matter (compress <-> decompress, dust <-> tiny dust). Here it's also required that every key
 * have a well-founded derivation from a permanent source: ingredients that get consumed always come from keys that
 * are already grounded, and only machine fuel and catalysts (`tol` slots) are allowed to close the loop
 * (bootstrap loop: steam -> drill -> coal -> boiler -> steam).
 * Iterates tol_0 = S, G_i = lfp(tolerant slots met with tol_i), tol_{i+1} = G_i until it settles.
 * Returns {S, G}: S is the gfp result and G the final lfp (G.reached = sustained keys, G.fired = sustained rules).
 */
export function groundedSustain(g, { universe, enabled = null, capOk, permanent }) {
  const S = gfp(g, { universe, enabled, capOk, permanent });
  const facts = [];
  for (let k = 0; k < g.nKeys; k++) if (permanent[k] && S.inS[k]) facts.push(k);
  let tol = S.inS;
  let G = null;
  let rounds = 0;
  for (; rounds < 64; rounds++) {
    G = lfp(g, { facts, enabled: S.ruleLive, capOk, tolOk: tol });
    let same = true;
    for (let k = 0; k < g.nKeys; k++) {
      if (tol[k] !== G.reached[k]) {
        same = false;
        break;
      }
    }
    if (same) break;
    tol = G.reached;
  }
  return { S, G, rounds };
}

class MinHeap {
  constructor() {
    this.c = [];
    this.k = [];
  }

  push(cost, key) {
    let i = this.c.length;
    this.c.push(cost);
    this.k.push(key);
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.c[p] <= this.c[i]) break;
      [this.c[p], this.c[i]] = [this.c[i], this.c[p]];
      [this.k[p], this.k[i]] = [this.k[i], this.k[p]];
      i = p;
    }
  }

  get size() {
    return this.c.length;
  }

  pop() {
    const cost = this.c[0];
    const key = this.k[0];
    const lc = this.c.pop();
    const lk = this.k.pop();
    if (this.c.length > 0) {
      this.c[0] = lc;
      this.k[0] = lk;
      let i = 0;
      const n = this.c.length;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < n && this.c[l] < this.c[m]) m = l;
        if (r < n && this.c[r] < this.c[m]) m = r;
        if (m === i) break;
        [this.c[m], this.c[i]] = [this.c[i], this.c[m]];
        [this.k[m], this.k[i]] = [this.k[i], this.k[m]];
        i = m;
      }
    }
    return [cost, key];
  }
}

/**
 * Minimum cost to "unblock" each key that isn't in `mask`: a key with no rule producing it (a root)
 * costs 1, and a rule costs 1 + the sum of what it's missing. `best[k]` is the lowest-cost rule that produces k.
 * `blocked`: keys no rule can ever give (removed from every source); they only count as a root, at `rootCost`'s cost.
 */
export function blockCosts(g, { mask, capMask = null, tolMask = null, enabled = null, rootCost = null, blocked = null }) {
  const nK = g.nKeys;
  const nR = g.rules.length;
  const cost = new Float64Array(nK).fill(Infinity);
  const best = new Int32Array(nK).fill(-1);
  const done = new Uint8Array(nK);
  const slotSat = new Uint8Array(g.nSlots);
  const remaining = new Int32Array(nR);
  const sum = new Float64Array(nR);
  const heap = new MinHeap();

  for (let k = 0; k < nK; k++) {
    if (mask[k]) {
      cost[k] = 0;
      heap.push(0, k);
      continue;
    }
    let c;
    if (rootCost) c = rootCost(k);
    else c = g.prodStart[k + 1] === g.prodStart[k] ? 1 : Infinity;
    if (c < Infinity) {
      cost[k] = c;
      heap.push(c, k);
    }
  }
  const relax = (r) => {
    const rc = 1 + sum[r];
    for (const o of g.rules[r].outs) {
      if (blocked && blocked[o]) continue;
      if (rc < cost[o]) {
        cost[o] = rc;
        best[o] = r;
        heap.push(rc, o);
      }
    }
  };
  for (let r = 0; r < nR; r++) {
    if (enabled && enabled[r] !== 1) {
      remaining[r] = -1;
      continue;
    }
    const rule = g.rules[r];
    remaining[r] = rule.slots.length;
    if (capMask || tolMask) {
      const so = g.slotOffset[r];
      for (let s = 0; s < rule.slots.length; s++) {
        const slot = rule.slots[s];
        const ok = slot.cap ? capMask : slot.tol ? tolMask : null;
        if (ok && slot.alts.some((a) => ok[a] === 1)) {
          slotSat[so + s] = 1;
          remaining[r]--;
        }
      }
    }
  }
  for (let r = 0; r < nR; r++) if (remaining[r] === 0) relax(r);
  while (heap.size > 0) {
    const [c, k] = heap.pop();
    if (done[k] || c > cost[k]) continue;
    done[k] = 1;
    for (let p = g.watchStart[k]; p < g.watchStart[k + 1]; p++) {
      const gS = g.watchG[p];
      if (slotSat[gS]) continue;
      const r = g.slotRule[gS];
      if (remaining[r] < 0) continue;
      slotSat[gS] = 1;
      sum[r] += c;
      if (--remaining[r] === 0) relax(r);
    }
  }
  return { cost, best };
}
