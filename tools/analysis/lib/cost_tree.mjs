// Cost tree of a target (an item, a multiblock controller with its formed structure, or one recipe), pure: no disk access.
//
//   const res = buildCostTree({ model, weight, recipes, targets, eraOf, machineOf, ... });
//
// `model` is a lib/cost.mjs solveCosts model (it chooses ONE recipe per item); `recipes` are the normalized recipes it solved
// (lib/normalize.mjs shape). The tree expands the model's chosen recipes from the targets with quantities:
//   - a recipe fires `runsPer` times per native unit of its output (1 item, 1 mB), as the solver divides it: unit(key) / d, where d is
//     the recipe's output share (allocation 'full': the expected count of that output, so a 4-plate recipe fires once per 4 plates);
//   - the inputs of a run are the picked alternatives (tag inputs take the cheapest one), non-consumed inputs and circuits cost nothing;
//   - base resources (model.isBase) are the leaves; `weight` says what a unit of one is worth (0 = free, e.g. water).
// Every quantity is linear in the demand, so the totals are computed once over the DAG (demand propagated in topological order) and
// a node of the tree is `need x unitTotals(item)`: the tree's root equals the summary by construction, and `consistency` proves it.
// Metrics of a node, in this order: [base units, EU, crafts]. Base units = items + fluid units (fluidUnitMb per unit) x weight.

export const METRICS = ['base', 'eu', 'crafts'];
const CIRCUIT_KEY = 'gtceu:programmed_circuit';
const CLOSE_RATIO = 1.1;

/** The Hyperstargate: three branches and the figures it is compared with (docs/eras/maxplus.md :414-456, docs/research/gtnh-stargate.md s5, s7). */
export const HYPERSTARGATE_PRESET = {
  name: 'Hyperstargate',
  targets: [
    'Build=gtceu:hyperstargate',
    'Capacitor bank=gtceu:horizon_capacitor_bank',
    'One dial=recipe:grindless:hyperstargate_dial/hyperstargate_dial',
  ],
  gridKeys: [
    'grindless:hyperstargate_ring_block', 'grindless:hyperstargate_chevron_upgrade', 'grindless:hyperstargate_chevron_block',
    'grindless:hyperstargate_locked_chevron', 'grindless:iris_blade', 'grindless:horizon_iris', 'grindless:horizon_capacitor',
    'grindless:hyperstargate_power_unit', 'grindless:hyperstargate_base', 'gtceu:hyperstargate', 'grindless:hyperstargate_interface',
  ],
  // docs: the figure maxplus.md states; gtnh: the baseline (gtnh-stargate.md s5); target: [lo, hi] (s7.1); each metric is a spec for metricValue()
  comparison: [
    { id: 'grid', label: 'Grid crafts (all grid rows)', unit: 'crafts', spec: { runsOf: 'grid' }, docs: 1212, gtnh: 140, target: [1200, 1600] },
    { id: 'ring', label: 'Ring block crafts', unit: 'crafts', spec: { runsOf: ['grindless:hyperstargate_ring_block'] }, docs: 528 },
    { id: 'upgrade', label: 'Chevron upgrade crafts', unit: 'crafts', spec: { runsOf: ['grindless:hyperstargate_chevron_upgrade'] }, docs: 360 },
    { id: 'chevron', label: 'Chevron block crafts', unit: 'crafts', spec: { runsOf: ['grindless:hyperstargate_chevron_block'] }, docs: 36 },
    { id: 'blade', label: 'Iris blade crafts', unit: 'crafts', spec: { runsOf: ['grindless:iris_blade'] }, docs: 240 },
    { id: 'frame', label: 'Horizon frame part', unit: 'items', spec: { count: 'grindless:horizon_frame_part' }, docs: 13440, gtnh: 1398, target: [10000, 14000] },
    { id: 'plate', label: 'Horizon compressed plate', unit: 'items', spec: { count: 'grindless:horizon_compressed_plate' }, docs: 15744, gtnh: 1630, target: [10000, 20000] },
    { id: 'fieldgen', label: 'MAX+ field generator', unit: 'items', spec: { count: 'grindless:maxplus_field_generator' }, docs: 4192, gtnh: 424, target: [4000, 4500] },
    { id: 'contain', label: 'Horizon containment plate', unit: 'items', spec: { count: 'grindless:horizon_containment_plate' }, docs: 6000, gtnh: 601, target: [5400, 6600] },
    { id: 'processor', label: 'Horizon processor', unit: 'items', spec: { count: 'grindless:horizon_processor' }, docs: 155000, gtnh: 19800, target: [100000, 200000] },
    { id: 'shielding', label: 'Horizon shielding', unit: 'items', spec: { count: 'grindless:horizon_shielding' }, docs: 380000, gtnh: 378000 },
    { id: 'conduit', label: 'Horizon conduit', unit: 'items', spec: { count: 'grindless:horizon_conduit' }, docs: 380000, gtnh: 378000 },
    { id: 'core', label: 'Core crystals', unit: 'items', spec: { count: 'grindless:horizon_core_crystal' }, docs: 64, gtnh: 1 },
    { id: 'creative', label: 'Creative items', unit: 'items', spec: { creative: true }, docs: 48, gtnh: 40 },
    { id: 'types', label: 'Distinct recipe types', unit: 'types', spec: { types: true }, docs: 120, gtnh: 32, target: [100, 150] },
    { id: 'kerr', label: 'Kerr condensate', unit: 'mB', spec: { count: 'fluid:gtceu:kerr_condensate' }, docs: 2e10, target: [1e10, 1e13] },
    { id: 'he3', label: 'Superfluid helium-3', unit: 'mB', spec: { count: 'fluid:gtceu:superfluid_helium_3' }, docs: 5e9 },
    { id: 'dial', label: 'EU of one dial', unit: 'EU', spec: { branchEu: 'One dial' }, docs: 1.05553116266496e16 },
  ],
};

const unitOf = (key, fluidUnitMb) => (key.startsWith('fluid:') ? 1 / fluidUnitMb : 1);

/** "[Label=]item", "[Label=]recipe:<id>", optionally followed by "+item*n" extras. */
export function parseTargetSpec(text) {
  let label = null;
  let body = String(text);
  const eq = body.indexOf('=');
  if (eq > 0 && !body.slice(0, eq).includes(':')) { label = body.slice(0, eq).trim(); body = body.slice(eq + 1); }
  const parts = body.split('+').map((s) => s.trim()).filter(Boolean);
  if (!parts.length) throw new Error(`empty target "${text}"`);
  const main = parts.shift();
  const extras = parts.map((p) => {
    const m = /^(.+?)(?:\*(\d+(?:\.\d+)?))?$/.exec(p);
    return { key: m[1], qty: m[2] ? Number(m[2]) : 1 };
  });
  const recipe = main.startsWith('recipe:');
  const key = recipe ? main.slice(7) : main;
  return { label: label || key, kind: recipe ? 'recipe' : 'item', key, extras };
}

/**
 * Bill of materials of a formed structure (lib/structure.mjs description): the controller and every cell's block with counts.
 * `pickItem(ids)` chooses one item among alternatives (the cheapest reachable). Rules: a cell of "A or B" first takes the options
 * with a min or exact limit (their count), the remaining cells take the first other option (the pattern's primary choice).
 * @returns {{items: Map<string, number>, problems: string[]}}
 */
export function structureBom(desc, abilityItems, pickItem) {
  const items = new Map();
  const problems = [];
  const add = (key, n) => { if (key && n > 0) items.set(key, (items.get(key) || 0) + n); };
  const cells = new Map();
  for (const rows of desc.slices || []) for (const row of rows) for (const ch of String(row)) if (ch !== ' ') cells.set(ch, (cells.get(ch) || 0) + 1);
  const idsOf = (o) => {
    if (o.kind === 'blocks') return o.blocks || [];
    if (o.kind === 'frames') return (o.materials || []).map((m) => `gtceu:${m}_frame`);
    if (o.kind === 'part') {
      if (!abilityItems[o.ability]) problems.push(`part "${o.ability}" has no item in partAbilities`);
      return abilityItems[o.ability] || [];
    }
    return [];
  };
  const resolve = (sym, n) => {
    if (!sym || n <= 0) return;
    if (sym.kind === 'controller') add(desc.id, n);
    else if (sym.kind === 'air' || sym.kind === 'any') return;
    else if (sym.kind === 'oneOf') {
      const flat = [];
      const walk = (os) => { for (const o of os) if (o.kind === 'oneOf') walk(o.options || []); else flat.push(o); };
      walk(sym.options || []);
      let left = n;
      const rest = [];
      for (const o of flat) {
        if (o.kind === 'air' || o.kind === 'any' || o.kind === 'controller') continue;
        const l = o.limits || {};
        const need = l.exact ?? l.min;
        if (need >= 1) {
          const c = Math.min(left, need);
          add(pickItem(idsOf(o)), c);
          left -= c;
        } else if (!(l.max === 0)) rest.push(o);
      }
      if (left > 0 && rest.length) resolve(rest[0], left);
    } else add(pickItem(idsOf(sym)), n);
  };
  for (const [ch, n] of cells) {
    const sym = (desc.symbols || {})[ch];
    if (!sym) problems.push(`symbol "${ch}" has no description`);
    else resolve(sym, n);
  }
  return { items, problems };
}

/** Which of `candidates` a target expansion should use: the reachable one with the lowest solver metric, else the first. */
export function cheapestOf(model, candidates) {
  let best = null;
  let bestC = Infinity;
  for (const k of candidates) {
    if (!model.reachable(k)) continue;
    const c = model.metric(k) ?? 0;
    if (c < bestC) { bestC = c; best = k; }
  }
  return best ?? candidates[0] ?? null;
}

/**
 * @param {object} o
 *   model, weight(key), fluidUnitMb, recipes (normalized, the ones the model solved), allocation, chance, noShare(key)
 *   targets: [{label, kind:'item'|'recipe', key, entries?: [{key, qty}]}]   (an item target has entries; a recipe target a recipe id)
 *   name, eraOf(recipe) -> era name, machineOf(type) -> string, isCreative(key), maxNodes
 */
export function buildCostTree(o) {
  const { model, weight, recipes, targets } = o;
  const fluidUnitMb = o.fluidUnitMb || 1000;
  const eraOf = o.eraOf || (() => '-');
  const machineOf = o.machineOf || (() => '-');
  const isCreative = o.isCreative || ((k) => /(^|[:_])creative_/.test(k) || /:infinite_/.test(k));
  const unit = (k) => unitOf(k, fluidUnitMb);
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const euOf = (r) => (r.eut > 0 && !(r.euOut > 0) ? r.eut * (r.amp || 1) * (r.duration || 0) : 0);

  const infos = new Map();
  const infoOf = (key) => {
    let f = infos.get(key);
    if (f) return f;
    if (model.isBase(key)) f = { kind: 'base', w: weight(key) * unit(key) };
    else {
      const ch = model.choiceOf(key);
      const rec = ch && byId.get(ch.id);
      if (!ch || !rec) f = { kind: 'none' };
      else {
        const inputs = new Map();
        for (const i of ch.inputs) inputs.set(i.key, (inputs.get(i.key) || 0) + i.amount);
        f = {
          kind: 'crafted', recipe: rec, id: ch.id, type: rec.type, runsPer: unit(key) / ch.denom, inputs: [...inputs],
          eu: euOf(rec), dur: rec.duration || 0, era: eraOf(rec), machine: machineOf(rec.type),
        };
      }
    }
    infos.set(key, f);
    return f;
  };

  const cycles = new Set();
  const unitMemo = new Map();
  const active = new Set();
  const ZERO = Object.freeze({ base: 0, eu: 0, crafts: 0, time: 0 });
  const unitTotals = (key) => {
    const hit = unitMemo.get(key);
    if (hit) return hit;
    const f = infoOf(key);
    if (f.kind === 'base') { const t = { base: f.w, eu: 0, crafts: 0, time: 0 }; unitMemo.set(key, t); return t; }
    if (f.kind === 'none') return ZERO;
    if (active.has(key)) { cycles.add(key); return ZERO; }
    active.add(key);
    const t = { base: 0, eu: f.runsPer * f.eu, crafts: f.runsPer, time: f.runsPer * f.dur };
    for (const [k, amount] of f.inputs) {
      const u = unitTotals(k);
      const m = f.runsPer * amount;
      t.base += m * u.base; t.eu += m * u.eu; t.crafts += m * u.crafts; t.time += m * u.time;
    }
    active.delete(key);
    unitMemo.set(key, t);
    return t;
  };

  // A recipe target: its own run, then the cheapest alternative of each consumed input.
  const recipeTargetInputs = (rec) => {
    const out = [];
    for (const i of rec.inputs) {
      if (i.cap || !(i.consume > 0) || !(i.count > 0)) continue;
      if (i.alts.length === 1 && i.alts[0] === CIRCUIT_KEY) continue;
      out.push({ key: cheapestOf(model, i.alts), qty: i.count * i.consume });
    }
    return out;
  };

  // Branches: [{label, own: {eu, crafts, time}, entries: [{key, qty}], recipeId?}]
  const problems = [];
  const branches = targets.map((t) => {
    if (t.kind === 'recipe') {
      const rec = byId.get(t.key);
      if (!rec) { problems.push(`recipe ${t.key} is not in the model (excluded or unknown)`); return { label: t.label, own: { eu: 0, crafts: 0, time: 0 }, entries: [] }; }
      return { label: t.label, recipe: rec, own: { eu: euOf(rec), crafts: 1, time: rec.duration || 0 }, entries: recipeTargetInputs(rec) };
    }
    return { label: t.label, own: { eu: 0, crafts: 0, time: 0 }, entries: t.entries };
  });

  // Demand over the DAG of chosen recipes, parents before children.
  const order = [];
  const seen = new Set();
  const visiting = new Set();
  const visit = (key) => {
    if (seen.has(key)) return;
    if (visiting.has(key)) { cycles.add(key); return; }
    visiting.add(key);
    const f = infoOf(key);
    if (f.kind === 'crafted') for (const [k] of f.inputs) visit(k);
    visiting.delete(key);
    seen.add(key);
    order.push(key);
  };
  const demand = new Map();
  for (const b of branches) for (const e of b.entries) { visit(e.key); demand.set(e.key, (demand.get(e.key) || 0) + e.qty); }
  order.reverse();
  const rows = new Map();
  const totals = { crafts: 0, eu: 0, time: 0, base: 0 };
  for (const b of branches) { totals.crafts += b.own.crafts; totals.eu += b.own.eu; totals.time += b.own.time; }
  const typeStats = new Map();
  const eraStats = new Map();
  const bump = (m, name, runs, eu, time) => {
    const s = m.get(name) || { name, crafts: 0, eu: 0, time: 0, items: 0 };
    s.crafts += runs; s.eu += eu; s.time += time; s.items += 1;
    m.set(name, s);
  };
  for (const b of branches) if (b.recipe) {
    bump(typeStats, b.recipe.type, b.own.crafts, b.own.eu, b.own.time);
    bump(eraStats, eraOf(b.recipe), b.own.crafts, b.own.eu, b.own.time);
  }
  for (const key of order) {
    const d = demand.get(key) || 0;
    const f = infoOf(key);
    const row = { key, count: d, base: f.kind === 'base', unreachable: f.kind === 'none', free: f.kind === 'base' && !(f.w > 0), creative: isCreative(key) };
    if (f.kind === 'crafted') {
      const runs = d * f.runsPer;
      Object.assign(row, { runs, recipe: f.id, type: f.type, machine: f.machine, era: f.era, eu: runs * f.eu, time: runs * f.dur });
      totals.crafts += runs; totals.eu += row.eu; totals.time += row.time;
      bump(typeStats, f.type, runs, row.eu, row.time);
      bump(eraStats, f.era, runs, row.eu, row.time);
      for (const [k, amount] of f.inputs) demand.set(k, (demand.get(k) || 0) + runs * amount);
    } else if (f.kind === 'base') totals.base += d * f.w;
    rows.set(key, row);
  }

  // Tree
  const rootU = { base: 0, eu: 0, crafts: 0, time: 0 };
  for (const b of branches) {
    rootU.eu += b.own.eu; rootU.crafts += b.own.crafts; rootU.time += b.own.time;
    for (const e of b.entries) { const u = unitTotals(e.key); rootU.base += e.qty * u.base; rootU.eu += e.qty * u.eu; rootU.crafts += e.qty * u.crafts; rootU.time += e.qty * u.time; }
  }
  const rootV = [rootU.base, rootU.eu, rootU.crafts];
  const vOf = (q, u) => [q * u.base, q * u.eu, q * u.crafts];

  const recipeIdx = new Map();
  const machineIdx = new Map();
  const eraIdx = new Map();
  const tab = (m, v) => { if (!m.has(v)) m.set(v, m.size); return m.get(v); };
  let nodeCount = 0;
  const build = (key, q, thr) => {
    const f = infoOf(key);
    const u = unitTotals(key);
    const node = { n: key, q, v: vOf(q, u) };
    nodeCount++;
    if (f.kind === 'base') { node.b = 1; return node; }
    if (f.kind === 'none') { node.x = 1; return node; }
    const runs = q * f.runsPer;
    node.r = runs;
    node.i = tab(recipeIdx, f.id);
    node.m = tab(machineIdx, f.machine);
    node.y = tab(eraIdx, f.era);
    const own = [0, runs * f.eu, runs];
    const kids = [];
    const shown = [0, 0, 0];
    for (const [k, amount] of f.inputs) {
      const qi = runs * amount;
      const ui = unitTotals(k);
      const vi = vOf(qi, ui);
      if (!vi.some((x, m) => rootV[m] > 0 && x / rootV[m] >= thr)) continue;
      kids.push(build(k, qi, thr));
      for (let m = 0; m < 3; m++) shown[m] += vi[m];
    }
    kids.sort((a, b) => b.v[0] - a.v[0] || b.v[1] - a.v[1] || b.v[2] - a.v[2] || (a.n < b.n ? -1 : 1));
    const rest = node.v.map((x, m) => Math.max(0, x - own[m] - shown[m]));
    if (rest.some((x, m) => rootV[m] > 0 && x / rootV[m] > 1e-9)) { kids.push({ n: '(smaller inputs)', q: 0, v: rest, o: 1 }); nodeCount++; }
    if (kids.length) node.c = kids;
    return node;
  };
  const buildAll = (thr) => {
    nodeCount = 0;
    recipeIdx.clear(); machineIdx.clear(); eraIdx.clear();
    const bnodes = branches.map((b) => {
      const entries = b.entries.map((e) => ({ e, v: vOf(e.qty, unitTotals(e.key)) }));
      const v = [0, 0, 0];
      for (const x of entries) for (let m = 0; m < 3; m++) v[m] += x.v[m];
      v[1] += b.own.eu; v[2] += b.own.crafts;
      const node = { n: b.label, q: 1, v, br: 1 };
      nodeCount++;
      if (b.recipe) { node.i = tab(recipeIdx, b.recipe.id); node.m = tab(machineIdx, machineOf(b.recipe.type)); node.y = tab(eraIdx, eraOf(b.recipe)); node.r = 1; }
      entries.sort((a, c) => c.v[0] - a.v[0] || c.v[1] - a.v[1] || c.v[2] - a.v[2] || (a.e.key < c.e.key ? -1 : 1));
      const kids = [];
      const shown = [0, 0, 0];
      for (const x of entries) {
        if (!x.v.some((val, m) => rootV[m] > 0 && val / rootV[m] >= thr) && kids.length >= 12) continue;
        kids.push(build(x.e.key, x.e.qty, thr));
        for (let m = 0; m < 3; m++) shown[m] += x.v[m];
      }
      const own = [0, b.own.eu, b.own.crafts];
      const rest = v.map((val, m) => Math.max(0, val - own[m] - shown[m]));
      if (rest.some((val, m) => rootV[m] > 0 && val / rootV[m] > 1e-9)) { kids.push({ n: '(smaller parts)', q: 0, v: rest, o: 1 }); nodeCount++; }
      if (kids.length) node.c = kids;
      return node;
    });
    nodeCount++;
    return { n: o.name || 'Total', q: 1, v: rootV.slice(), br: 1, c: bnodes };
  };
  const maxNodes = o.maxNodes || 5000;
  let thr = 1e-4;
  let tree = buildAll(thr);
  while (nodeCount > maxNodes && thr < 0.5) { thr *= 1.6; tree = buildAll(thr); }
  const tables = { recipes: [...recipeIdx.keys()], machines: [...machineIdx.keys()], eras: [...eraIdx.keys()] };

  // Aggregates
  const itemRows = [...rows.values()];
  const bases = itemRows.filter((r) => r.base).map((r) => ({ key: r.key, qty: r.count, units: r.count * infoOf(r.key).w, fluid: r.key.startsWith('fluid:'), free: r.free }))
    .sort((a, b) => b.units - a.units || b.qty - a.qty || (a.key < b.key ? -1 : 1));
  const crafted = itemRows.filter((r) => r.recipe).sort((a, b) => b.eu - a.eu || b.runs - a.runs || (a.key < b.key ? -1 : 1));
  const types = [...typeStats.values()].sort((a, b) => b.crafts - a.crafts || (a.name < b.name ? -1 : 1));
  const eras = [...eraStats.values()].sort((a, b) => b.crafts - a.crafts || (a.name < b.name ? -1 : 1));
  const creative = itemRows.filter((r) => r.creative && r.count > 0).map((r) => ({ key: r.key, count: r.count })).sort((a, b) => (a.key < b.key ? -1 : 1));
  const summary = {
    crafts: totals.crafts, eu: totals.eu, timeTicks: totals.time, baseUnits: totals.base,
    recipeTypes: types.length, distinctItems: itemRows.length, craftedItems: crafted.length, baseItems: bases.length,
    creativeItems: creative.reduce((s, c) => s + c.count, 0),
  };
  const consistency = {
    base: { tree: rootV[0], summary: summary.baseUnits }, eu: { tree: rootV[1], summary: summary.eu }, crafts: { tree: rootV[2], summary: summary.crafts },
  };
  consistency.ok = Object.values(consistency).every((c) => Math.abs(c.tree - c.summary) <= 1e-6 * Math.max(1, Math.abs(c.summary)));

  // Checks
  const unreachable = itemRows.filter((r) => r.unreachable).map((r) => ({ key: r.key, count: r.count })).sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : 1));
  for (const b of branches) for (const e of b.entries) model.vector(e.key);
  const cutKeys = new Set([...cycles, ...model.cuts]);
  const producers = new Map();
  for (const r of recipes) for (const out of r.outputs) { if (!producers.has(out.key)) producers.set(out.key, []); producers.get(out.key).push(r); }
  const chanceMode = o.chance || 'expected';
  const outN = (out) => (chanceMode === 'full' ? out.count : chanceMode === 'guaranteed' ? (out.chance >= 1 ? out.count : 0) : out.count * out.chance);
  const noShare = o.noShare || (() => false);
  const costVia = (rec, key) => {
    const outs = rec.outputs.map((x) => ({ key: x.key, n: outN(x) })).filter((x) => x.n > 0 && !x.key.startsWith('research:'));
    const used = o.allocation === 'primary' ? outs.slice(0, 1) : outs;
    const mine = used.find((x) => x.key === key);
    if (!mine) return null;
    let d = 0;
    for (const x of used) if (!noShare(x.key)) d += x.n * unit(x.key);
    if (o.allocation === 'full') d = mine.n * unit(key);
    if (!(d > 0)) return null;
    let total = 0;
    for (const i of rec.inputs) {
      if (i.cap || !(i.consume > 0) || !(i.count > 0)) continue;
      if (i.alts.length === 1 && i.alts[0] === CIRCUIT_KEY) continue;
      let best = Infinity;
      for (const a of i.alts) { const c = model.metric(a); if (c !== undefined && c < best) best = c; }
      if (best === Infinity) return null;
      total += i.count * i.consume * best;
    }
    return (total / d) * unit(key);
  };
  const close = [];
  for (const r of crafted) {
    const m = model.metric(r.key);
    if (!(m > 0)) continue;
    for (const p of producers.get(r.key) || []) {
      if (p.id === r.recipe) continue;
      const c = costVia(p, r.key);
      if (c !== null && c <= m * CLOSE_RATIO) close.push({ key: r.key, count: r.count, chosen: r.recipe, alt: p.id, ratio: c / m });
    }
  }
  close.sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : 1));
  const sharedRuns = [];
  const byRecipe = new Map();
  for (const r of crafted) { if (!byRecipe.has(r.recipe)) byRecipe.set(r.recipe, []); byRecipe.get(r.recipe).push(r.key); }
  for (const [id, keys] of byRecipe) if (keys.length > 1) sharedRuns.push({ recipe: id, items: keys });

  return {
    name: o.name || 'Total',
    summary, consistency, tree, tables, treeThreshold: thr, treeNodes: nodeCount,
    items: crafted, bases, creative, types, eras,
    branches: branches.map((b) => ({ label: b.label, recipe: b.recipe ? b.recipe.id : null, ownEu: b.own.eu, entries: b.entries.length })),
    checks: {
      unreachable, cycles: [...cutKeys].sort(), close: close.slice(0, 60), closeTotal: close.length, sharedRuns: sharedRuns.slice(0, 40), sharedRunsTotal: sharedRuns.length,
      problems, solver: { converged: model.converged, improvementsLeft: model.improvementsLeft },
    },
    rows: Object.fromEntries(itemRows.map((r) => [r.key, { count: r.count, runs: r.runs ?? 0, base: r.base, creative: r.creative }])),
    branchEu: Object.fromEntries(branches.map((b) => [b.label, b.own.eu])),
  };
}

/** Value of one comparison spec on a result (null when the item is not in the expansion). */
export function metricValue(res, spec, preset = HYPERSTARGATE_PRESET) {
  const rows = res.rows;
  if (spec.count) return rows[spec.count] ? rows[spec.count].count : 0;
  if (spec.runsOf) {
    const keys = spec.runsOf === 'grid' ? preset.gridKeys : spec.runsOf;
    return keys.reduce((s, k) => s + (rows[k] ? rows[k].runs : 0), 0);
  }
  if (spec.creative) return res.summary.creativeItems;
  if (spec.types) return res.summary.recipeTypes;
  if (spec.branchEu) return res.branchEu[spec.branchEu] ?? null;
  return null;
}

/** The comparison table: computed vs docs, GTNH and the 10x target; `flag` when the gap to the docs exceeds 20%. */
export function compareRows(res, preset = HYPERSTARGATE_PRESET) {
  return preset.comparison.map((c) => {
    const value = metricValue(res, c.spec, preset);
    const gap = c.docs > 0 && value !== null ? (value - c.docs) / c.docs : null;
    const inTarget = c.target && value !== null ? value >= c.target[0] && value <= c.target[1] : null;
    return { id: c.id, label: c.label, unit: c.unit, value, docs: c.docs, gap, flag: gap !== null && Math.abs(gap) > 0.2, gtnh: c.gtnh ?? null, target: c.target || null, inTarget };
  });
}
