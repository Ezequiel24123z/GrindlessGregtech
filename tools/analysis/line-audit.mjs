// Line audit (Project Reforge RF-3C): measures every process line of the quest charts from data and gives it a verdict.
//
//   node tools/analysis/line-audit.mjs --dump <kubejs-exported dir> --out <dir>
//
// A line is a cluster of a chart (tools/quests/processing-lines/pl-data-<era>.mjs). Per line it measures:
//   steps       the longest chain of processing steps in the chart (a machine, or an item-to-item step; a machine's own
//               output is not another step)
//   crossings   links to nodes of earlier chapters, with the era each one reaches
//   ends        end products, who uses them (other lines of the charts, recipes of the dump, key items of the cost matrix)
//   skip        a recipe of the dump that makes every end product without touching the line's intermediates, and in no more
//               steps from base resources than the line itself
//   duplicate   another line sharing most of its intermediates
// Output: <out>/03_lines.csv and a per-era summary on stdout. Read-only: nothing in the pack changes. MAX is data only.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, '..', '..');

export const ERAS = ['steam', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max'];
// AGENTS.md:18: progression multiblocks x1.35 per era from EV, and about x1.5 lines per era from UV (guide, not quota)
export const GUIDE = { ev: 11, iv: 15, luv: 20, zpm: 27, uv: 36 };
export const REAL_STEPS = 4;
const NOISE_TYPE = /recycling|decomposition/;
const NOISE_ID = /\/uncraft|_recycling|\/unpack|decompress|decomposition_|packer\/package_|_dust_assembling_|cool_hot_|\/compress|\/pack_|_to_dust_/;

const eraOfChapter = (file) => {
  const m = /^pl_(.+)$/.exec(file);
  return m && ERAS.includes(m[1]) ? m[1] : null;
};
const isMachine = (nd) => nd.kind === 'ours' || nd.kind === 'machine';

// Real steps of a line: the most steps on any chain of nodes. A node is a step when it is a machine, or an item made
// straight from items (no machine node between); an item made by a machine node is that machine's step.
export function lineSteps(nodes) {
  const byKey = new Map(nodes.map((n) => [n.key, n]));
  const cost = new Map();
  const stepOf = (nd) => {
    if (nd.link || !nd.from.length) return 0;
    const srcs = nd.from.map((f) => byKey.get(typeof f === 'string' ? f : f.k)).filter(Boolean);
    if (isMachine(nd)) return 1;
    return srcs.some(isMachine) ? 0 : srcs.length ? 1 : 0;
  };
  const visiting = new Set();
  const best = (nd) => {
    if (cost.has(nd.key)) return cost.get(nd.key);
    if (visiting.has(nd.key)) return 0;
    visiting.add(nd.key);
    let up = 0;
    for (const f of nd.from) {
      const src = byKey.get(typeof f === 'string' ? f : f.k);
      if (src) up = Math.max(up, best(src));
    }
    visiting.delete(nd.key);
    const v = up + stepOf(nd);
    cost.set(nd.key, v);
    return v;
  };
  let max = 0;
  for (const nd of nodes) max = Math.max(max, best(nd));
  return max;
}

// Lines of a built model (pl-model.mjs#buildModel): one record per cluster of a pl_<era> chapter.
export function collectLines(model) {
  const lines = [];
  for (const ch of model.chapters) {
    const era = eraOfChapter(ch.file);
    if (!era) continue;
    const clusters = new Map();
    for (const nd of ch.nodes) {
      if (!clusters.has(nd.cluster)) clusters.set(nd.cluster, []);
      clusters.get(nd.cluster).push(nd);
    }
    for (const [cluster, nodes] of clusters) {
      const crossings = [];
      for (const nd of nodes) {
        if (!nd.link || nd.era || !nd.target) continue;
        const tEra = eraOfChapter(nd.target.chapter);
        if (tEra) crossings.push({ era: tEra, back: ERAS.indexOf(era) - ERAS.indexOf(tEra), to: `${nd.target.chapter}:${nd.target.cluster}` });
      }
      const outKeys = new Set();
      for (const n2 of nodes) for (const f of n2.from) outKeys.add(typeof f === 'string' ? f : f.k);
      const leaf = (nd) => !nd.link && !outKeys.has(nd.key) && nd.from.length && !['info', 'by', 'ret', 'dest', 'raw'].includes(nd.kind);
      let products = nodes.filter((nd) => !nd.link && nd.kind === 'product' && nd.res && !nd.machine);
      if (!products.length) products = nodes.filter((nd) => leaf(nd) && nd.res && !nd.machine);
      lines.push({
        era, cluster, id: `${era}.${cluster}`, name: ch.clusters[cluster]?.name || cluster, nodes, crossings, products,
        steps: lineSteps(nodes),
        mbs: [...new Set(nodes.filter((nd) => !nd.link && (isMachine(nd))).map((nd) => nd.item))],
        machines: new Set(nodes.flatMap((nd) => (nd.machine || nd.kind === 'ours' ? [nd.item, ...(nd.types || []), ...(nd.by || [])] : (nd.by ? [].concat(nd.by) : [])))),
        ours: [...new Set(nodes.filter((nd) => nd.kind === 'ours').map((nd) => nd.item))],
        inner: new Set(nodes.filter((nd) => !nd.link && nd.kind !== 'raw' && !isMachine(nd) && nd.res).map((nd) => nd.res)),
        raws: new Set(nodes.filter((nd) => !nd.link && nd.kind === 'raw' && nd.res).map((nd) => nd.res)),
      });
    }
  }
  return lines;
}

// Other lines that take this line's items: a link into one of its nodes, or the same item appearing in their nodes.
export function usedBy(lines) {
  const byRes = new Map();
  for (const l of lines) for (const nd of l.nodes) if (!nd.link && nd.res) { if (!byRes.has(nd.res)) byRes.set(nd.res, []); byRes.get(nd.res).push(l); }
  const out = new Map(lines.map((l) => [l.id, new Set()]));
  for (const l of lines) {
    for (const x of l.crossings) { const tgt = lines.find((o) => `pl_${o.era}:${o.cluster}` === x.to); if (tgt && tgt !== l) out.get(tgt.id).add(l.id); }
    for (const p of l.products) for (const o of byRes.get(p.res) || []) if (o !== l && o.id !== l.id) out.get(l.id).add(o.id);
  }
  return out;
}

// Duplicates: two lines whose intermediates (not raw inputs) overlap on most of the smaller one, or that make the same product.
export function findDuplicates(lines, { minShared = 4, ratio = 0.75 } = {}) {
  const dup = new Map();
  for (const a of lines) {
    for (const b of lines) {
      if (a === b || ERAS.indexOf(b.era) > ERAS.indexOf(a.era) || (b.era === a.era && b.cluster >= a.cluster)) continue;
      const shared = [...a.inner].filter((k) => b.inner.has(k));
      const small = Math.min(a.inner.size, b.inner.size);
      const sameProduct = a.products.length && a.products.every((p) => b.products.some((q) => q.res === p.res));
      if ((shared.length >= minShared && shared.length / Math.max(1, small) >= ratio) || (sameProduct && shared.length >= 2)) {
        const prev = dup.get(a.id);
        if (!prev || shared.length > prev.shared) dup.set(a.id, { of: b.id, shared: shared.length });
      }
    }
  }
  return dup;
}

// Index over the dump's recipes: usable producers and consumers, and the fewest steps from base resources of every key.
export function buildFacts(recipes) {
  const usable = [];
  for (const r of recipes) {
    if (NOISE_TYPE.test(r.category || r.type || '') || NOISE_ID.test(r.id)) continue;
    usable.push(r);
  }
  const producers = new Map();
  const consumers = new Map();
  const push = (m, k, r) => { if (!m.has(k)) m.set(k, []); m.get(k).push(r); };
  for (const r of usable) {
    for (const o of new Set(r.outputs.map((x) => x.key))) push(producers, o, r);
    const ins = new Set();
    for (const i of r.inputs) for (const a of i.alts) ins.add(a);
    for (const k of ins) push(consumers, k, r);
  }
  const depth = new Map();
  const dOf = (k) => (producers.has(k) ? depth.get(k) : 0);
  const recDepth = (r) => {
    let m = 0;
    for (const i of r.inputs) {
      if (i.cap || !i.alts.length) continue;
      let best;
      for (const a of i.alts) { const d = dOf(a); if (d !== undefined && (best === undefined || d < best)) best = d; }
      if (best === undefined) return undefined;
      m = Math.max(m, best);
    }
    return m + 1;
  };
  for (let changed = true, round = 0; changed && round < 200; round++) {
    changed = false;
    for (const r of usable) {
      const d = recDepth(r);
      if (d === undefined) continue;
      for (const o of r.outputs) { const cur = depth.get(o.key); if (cur === undefined || d < cur) { depth.set(o.key, d); changed = true; } }
    }
  }
  // molten metals nothing makes: only a solidifier takes them, so a route through one is not a route from base resources
  const unobtainable = (k) => k.startsWith('fluid:') && !producers.has(k) && (consumers.get(k) || []).some((r) => r.type === 'gtceu:fluid_solidifier');
  const typeCount = new Map();
  for (const r of usable) typeCount.set(r.type, (typeCount.get(r.type) || 0) + 1);
  return { producers, consumers, depth, dOf, recDepth, unobtainable, typeCount };
}

const MATERIAL_FORM = /_(dust|ingot|nugget|plate|block|gem|rod|foil|cell|wire|gear|bolt|screw|ring|raw|crushed|purified|impure|pure)(_(small|tiny|long|fine|double|dense))?$/;
const materialOf = (k) => k.replace(/^fluid:/, '').replace(/^[^:]*:/, '').replace(/^(molten_|liquid_)/, '').replace(/^(small_|tiny_|hot_|dirty_|impure_|pure_|crushed_|purified_|centrifuged_|raw_)+/, '').replace(MATERIAL_FORM, '');

// Recipe types the line "owns": most of that type's recipes are recipes of the line itself.
export function ownedTypes(line, facts) {
  if (line.owned) return line.owned;
  const keys = new Set([...line.inner, ...line.raws, ...line.products.map((p) => p.res)]);
  const mine = new Map();
  for (const k of line.inner) for (const r of facts.producers.get(k) || []) if (r.inputs.some((i) => i.alts.some((a) => keys.has(a)))) mine.set(r.id, r.type);
  const recipeTypes = new Map();
  for (const t of mine.values()) recipeTypes.set(t, (recipeTypes.get(t) || 0) + 1);
  line.owned = { ids: mine, recipeTypes };
  return line.owned;
}

// A recipe of the dump that makes `key` without any of the line's intermediates, in fewer steps than the line takes.
export function skipRoute(line, key, facts) {
  const lineBase = Math.max(0, ...[...line.raws].map((k) => facts.dOf(k) ?? 0));
  const budget = lineBase + line.steps;
  const own = ownedTypes(line, facts);
  let best = null;
  for (const r of facts.producers.get(key) || []) {
    if (line.machines.has(r.type) || own.ids.has(r.id)) continue;
    // a type the line itself runs (a custom machine's own recipes are the line, not a way round it)
    const total = (facts.typeCount.get(r.type) || 1);
    if ((own.recipeTypes.get(r.type) || 0) / total >= 0.5) continue;
    // a main output only: a recipe that merely drops it as a byproduct is not a route to it
    if (r.outputs[0]?.key !== key || r.outputs[0].chance < 1) continue;
    const ins = r.inputs.flatMap((i) => i.alts);
    if (ins.some((a) => facts.unobtainable(a))) continue;
    if (ins.some((a) => line.inner.has(a) && a !== key)) continue;
    // the same material in another form (ingot to dust, block to plate) is a conversion, not a route
    const mat = materialOf(key);
    if (ins.some((a) => materialOf(a) === mat)) continue;
    const d = facts.recDepth(r);
    if (d === undefined || d >= budget) continue;
    if (!best || d < best.depth) best = { id: r.id, type: r.type, depth: d, budget };
  }
  return best;
}

// Key-item eras from docs/reforge/01_cost_matrix.csv (era,group,item,...): what an end product's consumers make.
export function loadKeyItems(csvText) {
  const m = new Map();
  const rows = csvText.split(/\r?\n/).filter(Boolean);
  for (const row of rows.slice(1)) { const c = row.split(','); if (c[2] && !m.has(c[2])) m.set(c[2], c[0]); }
  return m;
}

export function consumerSummary(key, facts, keyItems) {
  const cs = (facts.consumers.get(key) || []);
  const reached = new Set();
  for (const r of cs) for (const o of r.outputs) if (keyItems.has(o.key)) reached.add(`${keyItems.get(o.key)}:${o.key.replace(/^gtceu:/, '')}`);
  return { n: cs.length, reached: [...reached].sort() };
}

const TRAVEL_KEY = /^grindless:\w+_key$/;
const eraIdx = (e) => ERAS.indexOf(e);

export function judge(l, { used, dup, skipped, endInfo }) {
  const real = l.steps >= REAL_STEPS;
  const reach = Math.max(0, ...l.crossings.map((c) => c.back));
  // Travel keys and similar are consumed by use, not by recipes.
  const dead = l.products.filter((p) => !p.end && !TRAVEL_KEY.test(p.res) && endInfo.get(p.res)?.n === 0 && !used.size);
  const allSkip = l.products.length > 0 && skipped.length === l.products.length;
  const noEnd = l.products.length === 0;
  let verdict = 'keep';
  let reason = `${l.steps} steps, ${l.crossings.length} crossings (reach ${reach}), used by ${used.size} lines`;
  if (l.era === 'max') return { verdict: 'data-only', reason: 'MAX: RF-7A decides', real, reach };
  // Skippability is only a lower-bound depth heuristic, so it never removes a line on its own.
  if (dead.length && dead.length === l.products.length) {
    verdict = 'remove'; reason = `no end product feeds a recipe or another line (decorative)`;
  } else if (dup) {
    verdict = 'merge'; reason = `shares ${dup.shared} intermediates with ${dup.of}`;
  } else if (!real && eraIdx(l.era) >= eraIdx('ev')) {
    verdict = 'fix'; reason = `only ${l.steps} steps (a real line has ${REAL_STEPS}+)`;
  } else if (allSkip) {
    verdict = 'fix'; reason = `every end product has a shorter bypass recipe; make the line the better route`;
  } else if (dead.length) {
    verdict = 'fix'; reason = `${dead.length} end product(s) lead nowhere: ${dead.map((p) => p.res.replace(/^gtceu:/, '')).slice(0, 3).join(' ')}`;
  } else if (eraIdx(l.era) >= eraIdx('ev') && !l.crossings.length && !used.size) {
    verdict = 'fix'; reason = `no crossing and no other line uses it: isolated`;
  } else if (eraIdx(l.era) >= eraIdx('luv') && l.crossings.length && reach < 2) {
    verdict = 'fix'; reason = `crosses only ${reach <= 1 ? 'the previous era' : ''}: reach back two or more eras`;
  } else if (noEnd) {
    verdict = 'fix'; reason = 'no end product marked';
  }
  return { verdict, reason, real, reach };
}

export function auditAll(model, facts, keyItems) {
  const lines = collectLines(model);
  const used = usedBy(lines);
  const dups = findDuplicates(lines);
  const rows = [];
  for (const l of lines) {
    const endInfo = new Map();
    const skipped = [];
    const skipText = [];
    for (const p of l.products) {
      endInfo.set(p.res, facts ? consumerSummary(p.res, facts, keyItems) : { n: -1, reached: [] });
      if (facts) { const s = skipRoute(l, p.res, facts); if (s) { skipped.push(p); skipText.push(`${p.res.replace(/^gtceu:/, '')} via ${s.id} (${s.type}, ${s.depth} < ${s.budget})`); } }
    }
    const u = used.get(l.id);
    const j = judge(l, { used: u, dup: dups.get(l.id), skipped, endInfo });
    rows.push({ line: l, used: u, dup: dups.get(l.id), skipText, endInfo, ...j });
  }
  return rows;
}

const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
export function toCsv(rows) {
  const head = ['era', 'line', 'name', 'steps', 'real', 'multiblocks', 'ours', 'crossings', 'crossing_eras', 'reach_back', 'used_by_lines', 'end_products', 'end_consumers', 'skip_route', 'duplicate_of', 'verdict', 'reason'];
  const out = [head.join(',')];
  for (const r of rows) {
    const l = r.line;
    out.push([
      l.era, l.cluster, q(l.name), l.steps, r.real ? 1 : 0, l.mbs.length, l.ours.length, l.crossings.length,
      q([...new Set(l.crossings.map((c) => c.era))].join(' ')), r.reach, q([...r.used].join(' ')),
      q(l.products.map((p) => p.res.replace(/^gtceu:/, '')).join(' ')),
      q(l.products.map((p) => { const e = r.endInfo.get(p.res); return `${p.res.replace(/^gtceu:/, '')}=${e.n}${e.reached.length ? '>' + e.reached.slice(0, 3).join('|') : ''}`; }).join('; ')),
      q(r.skipText.join('; ')), r.dup ? r.dup.of : '', r.verdict, q(r.reason),
    ].join(','));
  }
  return out.join('\n') + '\n';
}

export function eraSummary(rows) {
  const per = new Map(ERAS.map((e) => [e, { lines: 0, real: 0, crossings: 0, keep: 0, fix: 0, merge: 0, remove: 0 }]));
  for (const r of rows) {
    const s = per.get(r.line.era);
    s.lines++; if (r.real) s.real++; s.crossings += r.line.crossings.length;
    if (s[r.verdict] !== undefined) s[r.verdict]++;
  }
  return per;
}

async function main(argv) {
  const opt = { dump: null, out: null };
  for (let i = 0; i < argv.length; i++) { if (argv[i] === '--dump') opt.dump = argv[++i]; else if (argv[i] === '--out') opt.out = argv[++i]; }
  if (!opt.dump || !opt.out) { console.error('usage: node tools/analysis/line-audit.mjs --dump <dir> --out <dir>'); process.exit(2); }
  const { buildModel } = await import('../quests/processing-lines/pl-model.mjs');
  const { loadIndex } = await import('../quests/processing-lines/pl-index.mjs');
  const model = buildModel();
  const idx = await loadIndex({ dump: opt.dump });
  const facts = buildFacts([...idx.recipes.values()]);
  const csvPath = path.join(REPO, 'docs', 'reforge', '01_cost_matrix.csv');
  const keyItems = fs.existsSync(csvPath) ? loadKeyItems(fs.readFileSync(csvPath, 'utf8')) : new Map();
  const rows = auditAll(model, facts, keyItems);
  fs.mkdirSync(opt.out, { recursive: true });
  fs.writeFileSync(path.join(opt.out, '03_lines.csv'), toCsv(rows));
  const per = eraSummary(rows);
  console.log('era    lines real cross  keep fix merge remove   guide');
  for (const [e, s] of per) if (s.lines) console.log(`${e.padEnd(6)} ${String(s.lines).padStart(5)} ${String(s.real).padStart(4)} ${String(s.crossings).padStart(5)}  ${String(s.keep).padStart(4)} ${String(s.fix).padStart(3)} ${String(s.merge).padStart(5)} ${String(s.remove).padStart(6)}   ${GUIDE[e] ?? ''}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main(process.argv.slice(2));
