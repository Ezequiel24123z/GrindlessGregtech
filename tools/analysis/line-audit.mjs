// Line audit (Project Reforge RF-3C): measures every process line of the quest charts from data and gives it a verdict.
//
//   node tools/analysis/line-audit.mjs --dump <kubejs-exported dir> --out <dir>
//
// A line is a cluster of a chart (tools/quests/processing-lines/pl-data-<era>.mjs). Per line it measures:
//   steps       the longest chain of processing steps in the chart (a machine, or an item-to-item step; a machine's own
//               output is not another step)
//   crossings   chart: links to nodes of earlier chapters, with the era each one reaches. content: from the dump's recipes, the\n//               pack's own multiblocks (era of their startup script folder) and end products of earlier lines that the line's\n//               recipes use, two or more eras back; verdicts read content when the chart has none
//   ends        end products, who uses them (other lines of the charts, recipes of the dump, key items of the cost matrix)
//   skip        a recipe of the dump that makes every end product without touching the line's intermediates, and in no more
//               steps from base resources than the line itself, and usable at or below the line's era (voltage tier, dimension,
//               multiblock era)
//   duplicate   another line sharing most of its intermediates
// Output: <out>/03_lines.csv and a per-era summary on stdout. Read-only: nothing in the pack changes. MAX is data only.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tierOfEut } from './lib/capacity.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, '..', '..');

export const ERAS = ['steam', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max', 'maxplus'];
// AGENTS.md principle 7: depth first, no count targets. The report shows descriptive depth statistics per era (longest real line,
// depth distribution, named long chains); nothing here is a quota and nothing asks for padding.
export const REAL_STEPS = 4;
export const LONG_CHAINS = 3;
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
    if (nd.link || !nd.from.length || nd.joined) return 0;
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

const refOf = (f) => (typeof f === 'string' ? f : f.k);
const NOT_END = ['info', 'by', 'ret', 'dest', 'raw', 'ours', 'machine'];
const resLabel = (res) => String(res || '').replace(/^fluid:/, '').replace(/^[a-z0-9_]+:/, '');

// Design lines of a cluster: the numbered rows where the data has them (pl-data-max.mjs: keys l<row>_<step>), otherwise each
// chain to its own end product (an item or fluid no other node of the cluster consumes), taken with its ancestors. A cluster with
// one chain end, or none (a loop), is one line. A chain end made twice (two nodes of one resource) counts once.
// A numbered row (#284) is its own nodes, every ancestor reached through `from` (nodes of other rows and the links they consume,
// which count as its crossings) and the cluster's unconsumed links. A row under REAL_STEPS whose last node (highest step) a node
// of another row consumes is not a line of its own: the consuming row already counts it. A row of REAL_STEPS or more stays.
export function splitChains(nodes) {
  const real = nodes.filter((nd) => !nd.link);
  const byKey = new Map(nodes.map((nd) => [nd.key, nd]));
  const consumed = new Set();
  for (const nd of nodes) for (const f of nd.from) consumed.add(refOf(f));
  if (real.length && real.every((nd) => /^l\d+_\d+$/.test(nd.key))) {
    const rowOf = (nd) => Number(/^l(\d+)_/.exec(nd.key)[1]);
    const stepOf = (nd) => Number(/_(\d+)$/.exec(nd.key)[1]);
    const rows = new Map();
    for (const nd of real) { const k = rowOf(nd); if (!rows.has(k)) rows.set(k, []); rows.get(k).push(nd); }
    const loose = nodes.filter((nd) => nd.link && !consumed.has(nd.key));
    // `rows` keeps a cluster's row labels when folding leaves one row (collectLines: multi); `own` carries the row's tags
    const parts = [...rows].map(([num, ns]) => {
      const own = new Set(ns.map((nd) => nd.key));
      const keep = new Set(own);
      const walk = (nd) => { for (const f of nd.from) { const src = byKey.get(refOf(f)); if (src && !keep.has(src.key)) { keep.add(src.key); walk(src); } } };
      for (const nd of ns) walk(nd);
      const up = nodes.filter((nd) => keep.has(nd.key) && !own.has(nd.key));
      return { num, ns, part: { label: `L${num}`, nodes: [...ns, ...up, ...loose], own: ns, sink: ns[ns.length - 1], rows: rows.size } };
    });
    const folds = ({ num, ns, part }) => {
      const last = ns.reduce((a, b) => (stepOf(b) > stepOf(a) ? b : a));
      return lineSteps(part.nodes) < REAL_STEPS && real.some((o) => rowOf(o) !== num && o.from.some((f) => refOf(f) === last.key));
    };
    const kept = parts.filter((p) => !folds(p));
    return (kept.length ? kept : parts).map((p) => p.part);
  }
  const seen = new Set();
  const sinks = [];
  for (const nd of real) {
    if (consumed.has(nd.key) || !nd.from.length || NOT_END.includes(nd.kind) || !nd.res || seen.has(nd.res)) continue;
    seen.add(nd.res); sinks.push(nd);
  }
  if (sinks.length <= 1) return [{ label: '', nodes, sink: sinks[0] || null }];
  return sinks.map((sink) => {
    const keep = new Set();
    const walk = (nd) => { if (!nd || keep.has(nd.key)) return; keep.add(nd.key); for (const f of nd.from) walk(byKey.get(refOf(f))); };
    walk(sink);
    // a link nothing consumes shows infrastructure the whole cluster runs on: every chain of the cluster keeps it
    return { label: resLabel(sink.res), nodes: nodes.filter((nd) => keep.has(nd.key) || (nd.link && !consumed.has(nd.key))), sink };
  });
}

// RF-3S (docs/eras/ev.md, "The rule: what the line audit counts"): the optional fields of a pl-data cluster or node.
//   role      power | resource | infrastructure | research | travel: the chain is not a production line if its test passes
//   line      a design-line id: clusters of one chapter with the same id are measured as one chain
//   extends   'pl_<era>:<cluster>': a chain of at most 3 steps that is a branch end of an older line (needs a consumer)
//   keepShort a reason: a production line under 4 steps may stay, and the audit lists the reason
export const ROLES = ['power', 'resource', 'infrastructure', 'research', 'travel'];
const TAGS = ['role', 'line', 'extends', 'keepShort'];

// Format problems of the four fields over a built model (pl-check.mjs reports them).
export function tagProblems(model) {
  const out = [];
  const has = (file, cluster) => model.chapters.some((c) => c.file === file && c.clusters && c.clusters[cluster]);
  const check = (where, o) => {
    if (o.role !== undefined && !ROLES.includes(o.role)) out.push(`${where}: unknown role ${JSON.stringify(o.role)} (${ROLES.join(', ')})`);
    if (o.line !== undefined && !(typeof o.line === 'string' && /^[A-Za-z0-9_.-]+$/.test(o.line))) out.push(`${where}: line must be an id string`);
    if (o.extends !== undefined) {
      const m = typeof o.extends === 'string' && /^(pl_[a-z]+):(\w+)$/.exec(o.extends);
      if (!m) out.push(`${where}: extends must be 'pl_<era>:<cluster>'`);
      else if (!has(m[1], m[2])) out.push(`${where}: extends names unknown cluster ${o.extends}`);
    }
    if (o.keepShort !== undefined && !(typeof o.keepShort === 'string' && o.keepShort.trim())) out.push(`${where}: keepShort must be a reason string`);
  };
  for (const ch of model.chapters) {
    if (!eraOfChapter(ch.file)) continue;
    for (const [ck, cl] of Object.entries(ch.clusters || {})) check(`${ch.file}/${ck}`, cl);
    for (const nd of ch.nodes) check(`${ch.file}/${nd.key}`, nd);
  }
  return out;
}

// Chain tags: the end node's own, then any product node's, then the cluster's.
const tagsOf = (nodes, sink, clusterDefs) => {
  const sources = [sink, ...nodes.filter((nd) => nd.kind === 'product'), ...clusterDefs].filter(Boolean);
  const out = {};
  for (const t of TAGS) { const s = sources.find((o) => o[t] !== undefined); if (s) out[t] = s[t]; }
  return out;
};

// Clusters of one chapter that share a `line` id are one group; a raw node whose item a sibling cluster makes continues that
// cluster's chain (it takes the product node as its source and adds no step).
function joinGroup(all, keys) {
  const sibling = (rn) => all.find((o) => o.cluster !== rn.cluster && !o.link && o.kind !== 'raw' && o.res === rn.res && o.from.length && !o.joined);
  const joined = new Set();
  const nodes = all.map((nd) => {
    if (nd.link || nd.kind !== 'raw' || !nd.res || nd.from.length) return nd;
    const sib = sibling(nd);
    if (!sib) return nd;
    joined.add(sib.key);
    return { ...nd, from: [sib.key], joined: true };
  });
  return { nodes, joined, keys };
}

// Lines of a built model (pl-model.mjs#buildModel): one record per design line of a pl_<era> chapter (see splitChains).
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
    const groups = new Map();
    for (const [cluster, all] of clusters) {
      const lid = ch.clusters[cluster]?.line;
      const gk = lid !== undefined ? `line:${lid}` : `cluster:${cluster}`;
      if (!groups.has(gk)) groups.set(gk, { keys: [], all: [] });
      groups.get(gk).keys.push(cluster);
      groups.get(gk).all.push(...all);
    }
    for (const g of groups.values()) {
      const cluster = g.keys.join('+');
      const grp = g.keys.length > 1 ? joinGroup(g.all, g.keys) : { nodes: g.all, joined: new Set(), keys: g.keys };
      const all = grp.nodes;
      const clusterDefs = g.keys.map((k) => ch.clusters[k]).filter(Boolean);
      const parts = splitChains(all);
      // a numbered cluster keeps its row labels when folding leaves it one row
      const multi = parts.length > 1 || (parts[0]?.rows || 0) > 1;
      for (const part of parts) {
        const nodes = part.nodes;
        const crossings = [];
        for (const nd of nodes) {
          if (!nd.link || nd.era || !nd.target) continue;
          const tEra = eraOfChapter(nd.target.chapter);
          if (tEra) crossings.push({ era: tEra, back: ERAS.indexOf(era) - ERAS.indexOf(tEra), to: `${nd.target.chapter}:${nd.target.cluster}`, key: nd.target.key });
        }
        const outKeys = new Set();
        for (const n2 of nodes) for (const f of n2.from) outKeys.add(refOf(f));
        const leaf = (nd) => !nd.link && !outKeys.has(nd.key) && nd.from.length && !['info', 'by', 'ret', 'dest', 'raw'].includes(nd.kind);
        let products;
        if (multi && part.sink) products = [part.sink];
        else {
          products = nodes.filter((nd) => !nd.link && nd.kind === 'product' && nd.res && !nd.machine && !grp.joined.has(nd.key));
          if (!products.length) products = nodes.filter((nd) => leaf(nd) && nd.res && !nd.machine);
        }
        const name = ch.clusters[g.keys[0]]?.name || g.keys[0];
        const lineId = ch.clusters[g.keys[0]]?.line;
        lines.push({
          era, cluster, clusters: g.keys, id: `${era}.${cluster}${multi ? `#${part.label}` : ''}`, name: multi ? `${name}: ${part.label}` : name,
          multi, nodes, crossings, products,
          ...tagsOf(part.own || nodes, part.sink, clusterDefs),
          lineId: lineId ?? '',
          steps: lineSteps(nodes),
          mbs: [...new Set(nodes.filter((nd) => !nd.link && (isMachine(nd))).map((nd) => nd.item))],
          machines: new Set(nodes.flatMap((nd) => (nd.machine || nd.kind === 'ours' ? [nd.item, ...(nd.types || []), ...(nd.by || [])] : (nd.by ? [].concat(nd.by) : [])))),
          ours: [...new Set(nodes.filter((nd) => nd.kind === 'ours').map((nd) => nd.item))],
          inner: new Set(nodes.filter((nd) => !nd.link && nd.kind !== 'raw' && !isMachine(nd) && nd.res).map((nd) => nd.res)),
          raws: new Set(nodes.filter((nd) => !nd.link && nd.kind === 'raw' && !nd.joined && nd.res).map((nd) => nd.res)),
        });
      }
    }
  }
  addStagedSteps(model, lines);
  return lines;
}

// A staged line (docs/eras/lines-steam-hv.md section 0) counts its later stage from its own start: a link node whose target
// cluster carries the same `line` id adds that earlier stage's steps (itself staged, recursively) to the stage that links to it.
function addStagedSteps(model, lines) {
  const lineOf = new Map();
  for (const ch of model.chapters) for (const [ck, cl] of Object.entries(ch.clusters || {})) if (cl.line !== undefined) lineOf.set(`${ch.file}:${ck}`, cl.line);
  const own = new Map();
  for (const l of lines) for (const c of l.clusters) own.set(`pl_${l.era}:${c}`, Math.max(own.get(`pl_${l.era}:${c}`) || 0, l.steps));
  const stageLinks = new Map();
  for (const l of lines) {
    if (l.lineId === '') continue;
    for (const nd of l.nodes) {
      if (!nd.link || !nd.target) continue;
      const to = `${nd.target.chapter}:${nd.target.cluster}`;
      if (lineOf.get(to) === l.lineId && !l.clusters.some((c) => `pl_${l.era}:${c}` === to)) {
        for (const c of l.clusters) { const k = `pl_${l.era}:${c}`; if (!stageLinks.has(k)) stageLinks.set(k, new Set()); stageLinks.get(k).add(to); }
      }
    }
  }
  const total = (k, seen = new Set()) => {
    if (seen.has(k)) return 0;
    seen.add(k);
    let up = 0;
    for (const t of stageLinks.get(k) || []) up = Math.max(up, total(t, seen));
    return (own.get(k) || 0) + up;
  };
  for (const l of lines) {
    if (l.lineId === '') continue;
    let up = 0;
    for (const c of l.clusters) for (const t of stageLinks.get(`pl_${l.era}:${c}`) || []) up = Math.max(up, total(t, new Set([`pl_${l.era}:${c}`])));
    l.steps += up;
  }
}
// Other lines that take this line's items: a link into one of its nodes, or the same item appearing in their nodes.
export function usedBy(lines) {
  const byRes = new Map();
  for (const l of lines) for (const nd of l.nodes) if (!nd.link && nd.res) { if (!byRes.has(nd.res)) byRes.set(nd.res, []); byRes.get(nd.res).push(l); }
  const out = new Map(lines.map((l) => [l.id, new Set()]));
  for (const l of lines) {
    for (const x of l.crossings) {
      const inCluster = lines.filter((o) => (o.clusters || [o.cluster]).some((c) => `pl_${o.era}:${c}` === x.to));
      const hit = x.key ? inCluster.filter((o) => o.nodes.some((nd) => nd.key === x.key)) : [];
      for (const tgt of hit.length ? hit : inCluster) if (tgt !== l) out.get(tgt.id).add(l.id);
    }
    for (const p of l.products) for (const o of byRes.get(p.res) || []) if (o !== l && o.id !== l.id && !(o.era === l.era && o.cluster === l.cluster)) out.get(l.id).add(o.id);
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
  const byId = new Map(usable.map((r) => [r.id, r]));
  // recipe types that output EU (generators): the power role's test
  const euTypes = new Set(recipes.filter((r) => r.euOut > 0).map((r) => r.type));
  // types the pack registers: every recipe of the type comes from our scripts (stock GT types also hold stock recipes)
  const stock = new Set(recipes.filter((r) => r.added === false).map((r) => r.type));
  const ourTypes = new Set(recipes.filter((r) => !stock.has(r.type)).map((r) => r.type));
  return { producers, consumers, depth, dOf, recDepth, unobtainable, typeCount, byId, ourTypes, euTypes };
}

// Era context of the pack: first era folder of pack/kubejs/startup_scripts/grindless/<era>/ naming an id (a machine, a
// recipe type, an item, a dimension) is the era that introduces it. `types` maps a recipe type to its multiblocks.
const ID_TOKEN = /\b(?:gtceu|grindless|gcyr|minecraft|gtca|extendedfeatures):[a-z0-9_]+/g;
export function scanStartupEras(dir) {
  const first = new Map();
  for (const era of ERAS) {
    const d = path.join(dir, era);
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.js')).sort()) {
      for (const id of fs.readFileSync(path.join(d, f), 'utf8').match(ID_TOKEN) || []) if (!first.has(id)) first.set(id, eraIdx(era));
    }
  }
  return first;
}

export function buildEraContext({ startup = new Map(), machines = [], lines = [] } = {}) {
  const mbOfType = new Map();
  for (const m of machines) if (m.mb) for (const t of m.types || []) { if (!mbOfType.has(t)) mbOfType.set(t, []); mbOfType.get(t).push(m.id); }
  const productEra = new Map();
  const put = (k, e) => { if (e >= 0 && (!productEra.has(k) || e < productEra.get(k))) productEra.set(k, e); };
  for (const l of lines) for (const p of l.products) put(p.res, eraIdx(l.era));
  return { startup, mbOfType, productEra };
}

// Era of a type: the earliest era naming one of its multiblocks; undefined when none is known.
const typeEra = (type, eraCtx) => {
  let best;
  for (const id of eraCtx.mbOfType.get(type) || []) { const e = eraCtx.startup.get(id); if (e !== undefined && (best === undefined || e < best)) best = e; }
  return best;
};

// Era a player needs to run a recipe: its voltage tier, the era that reaches its dimension, the era of its multiblock.
export function recipeEra(r, eraCtx) {
  let e = r.eut ? tierOfEut(r.eut) : 0;
  for (const c of r.conditions || []) if (c.dimension) e = Math.max(e, eraCtx.startup.get(c.dimension) ?? 0);
  return Math.max(e, typeEra(r.type, eraCtx) ?? 0);
}

// Content crossings: multiblocks the pack registers and end products of earlier chart lines (two or more eras back) that the
// line's recipes really use. Stock GT machines and commodity fluids are not crossings.
export function contentCrossings(line, facts, eraCtx) {
  const li = eraIdx(line.era);
  const found = new Map();
  const add = (kind, id, e) => { if (li - e >= 2 && !found.has(`${kind}:${id}`)) found.set(`${kind}:${id}`, { kind, id, era: ERAS[e], back: li - e }); };
  const own = ownedTypes(line, facts);
  const keys = new Set([...line.inner, ...line.raws]);
  for (const rid of own.ids.keys()) {
    const r = facts.byId.get(rid);
    if (!r) continue;
    const te = typeEra(r.type, eraCtx);
    if (te !== undefined && facts.ourTypes.has(r.type)) add('machine', r.type, te);
    for (const i of r.inputs) for (const a of i.alts) { const e = eraCtx.productEra.get(a); if (e !== undefined && !keys.has(a) && !/^(fluid:|minecraft:)/.test(a)) add('item', a, e); }
  }
  return [...found.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id));
}

const MATERIAL_FORM = /_(dust|ingot|nugget|plate|block|gem|rod|foil|cell|wire|gear|bolt|screw|ring|raw|crushed|purified|impure|pure)(_(small|tiny|long|fine|double|dense))?$/;
const materialOf = (k) => k.replace(/^fluid:/, '').replace(/^[^:]*:/, '').replace(/^(molten_|liquid_)/, '').replace(/^(small_|tiny_|hot_|dirty_|impure_|pure_|crushed_|purified_|centrifuged_|raw_|magnetic_)+/, '').replace(MATERIAL_FORM, '');

// Keys a recipe's inputs reach through producers of stock types (the GTM chain), with the hops to each; hop 0 is the recipe's own
// inputs. Bounded: three producers per key, `depth` hops.
export function routeClosure(r, facts, depth = 4) {
  const seen = new Map();
  let frontier = [r];
  for (let h = 0; h <= depth && frontier.length; h++) {
    const next = [];
    for (const rec of frontier) {
      for (const i of rec.inputs) {
        if (i.cap) continue;
        for (const a of i.alts) {
          if (seen.has(a)) continue;
          seen.set(a, h);
          let n = 0;
          for (const p of facts.producers.get(a) || []) { if (facts.ourTypes.has(p.type) || p.outputs[0]?.key !== a) continue; next.push(p); if (++n >= 3) break; }
        }
      }
    }
    frontier = next;
  }
  return seen;
}

// A fold (rule 4, "several steps in one"): one of the line's own recipes that makes `key` takes an input that the stock route `r`
// also reaches, but only through a GTM chain of two or more steps (hop 1 or later): the route is the chain the fold replaces.
export function foldReplaces(line, r, key, facts) {
  if (!(line.ours || []).length) return false;
  const own = ownedTypes(line, facts);
  const ins = new Set();
  for (const id of own.ids.keys()) {
    const o = facts.byId.get(id);
    if (!o || !o.outputs.some((x) => x.key === key)) continue;
    for (const i of o.inputs) if (!i.cap) for (const a of i.alts) ins.add(a);
  }
  if (!ins.size) return false;
  for (const [k, hop] of routeClosure(r, facts)) if (hop >= 1 && ins.has(k) && !line.inner.has(k)) return true;
  return false;
}

// A line is a fold when it is short, has a multiblock of ours, and every end product has a stock route it replaces.
export function isFold(line, facts) {
  if (!facts || !(line.ours || []).length || line.steps >= REAL_STEPS || !line.products.length) return false;
  return line.products.every((p) => (facts.producers.get(p.res) || []).some((r) => !facts.ourTypes.has(r.type) && r.outputs[0]?.key === p.res && r.outputs[0].chance >= 1 && foldReplaces(line, r, p.res, facts)));
}

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

// Items that exist only by breaking or tweaking the key, through a loot drop the recipe graph cannot see (Quark's glass shards come
// from breaking glass; the clear-glass tweak turns them back), so a route through one is circular.
const DERIVED_FROM = { 'minecraft:glass': new Set(['quark:clear_shard', 'quark:dirty_shard']) };

// An item of a material that has no vein (`until: never`): its listed forms, or any ore block of it (`material:<id>` entries; the
// groups list the crushed and purified forms, not the stone-variant ore blocks).
const STONES = '(?:[a-z0-9]+_)*';
export function isNoVein(k, never) {
  if (never.has(k)) return true;
  for (const e of never) {
    if (!e.startsWith('material:')) continue;
    const m = e.slice(9);
    if (k.endsWith(`${m}_ore`) && new RegExp(`^[a-z0-9_]+:${STONES}$`).test(k.slice(0, k.length - m.length - 4))) return true;
  }
  return false;
}

// Bootstrap routes that are not skips: a stock recipe the line is itself built from (docs/eras/lines-steam-hv.md section 2, S1).
// Patterns are recipe ids; a trailing `/*` matches every recipe of that type.
export const ACCEPTED_ROUTES = [
  { pattern: 'gtceu:primitive_blast_furnace/*', reason: 'the primitive blast furnace makes the steel the steam blast furnace is built from' },
];
export const acceptedRoute = (id) => ACCEPTED_ROUTES.find((a) => (a.pattern.endsWith('/*') ? String(id).startsWith(a.pattern.slice(0, -1)) : a.pattern === id));

// A recipe of the dump that makes `key` without any of the line's intermediates, in fewer steps than the line takes.
export function skipRoute(line, key, facts, eraCtx = null, x = {}) {
  const lineBase = Math.max(0, ...[...line.raws].map((k) => facts.dOf(k) ?? 0));
  const budget = lineBase + line.steps;
  const own = ownedTypes(line, facts);
  let best = null;
  for (const r of facts.producers.get(key) || []) {
    if (line.machines.has(r.type) || own.ids.has(r.id) || acceptedRoute(r.id)) continue;
    // a recipe of a later era is not a way round the line for a player of the line's era
    if (eraCtx && recipeEra(r, eraCtx) > eraIdx(line.era)) continue;
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
    // the four false positives of RF-3C (ev.md): an ore with no vein, a same-material loop, a parallel source, a fold's chain
    {
      const clo = routeClosure(r, facts);
      if (x.never && [...clo.keys()].some((k) => isNoVein(k, x.never))) continue;
      if ([...clo.keys()].some((k) => mat && materialOf(k) === mat)) continue;
      // a circular route: it needs the key itself (a coloured or tweaked variant is made from the key), so it is no shortcut to it
      if (clo.has(key) || [...(DERIVED_FROM[key] || [])].some((k) => clo.has(k))) continue;
      // a parallel source: an earlier counted line makes the key at any of its nodes, with this recipe's machine or an owned recipe
      if ((x.earlier || []).some((o) => (o.products.some((p) => p.res === key) || o.inner?.has(key)) && (o.machines.has(r.type) || ownedTypes(o, facts).ids.has(r.id)))) continue;
      if (foldReplaces(line, r, key, facts)) continue;
    }
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
const WEAR = /lubricant|coolant|battery|circuit|catalyst|filter|mold|lens|charge|water$|distilled/;
const wearOnly = (r) => r.inputs.every((i) => i.cap || i.circuit || i.alts.every((a) => WEAR.test(a)));
// LD-T2: a site machine's recipe also takes the site's own fluids and air, and consumable capture gear (bag, net, bit, sail)
const SITE_GEAR = /bag|net$|bit$|sail|probe|blade|nozzle/;
const siteOnly = (r) => r.inputs.every((i) => i.cap || i.circuit || i.alts.every((a) => a.startsWith('fluid:') || WEAR.test(a) || SITE_GEAR.test(a)));
// recycling, packing and decomposition are not uses of an item
const IGNORED_TYPE = /recycl|pack|decompos|macerat|arc_furnace|extractor/;
const INFRA_PART = /^(gtceu|gcyr|gtca|grindless):[a-z0-9_]*(casing|coil|hatch|hull|controller|panel|cell|insert|floor|support|heat_pipe|crucible|suit|rocket|station|shield|spool|net)(_[a-z0-9]+)?$/;
const RESEARCH_TYPE = /research|data_bank|telemetry|observatory/;
const RESEARCH_ITEM = /data|orb|chart|catalogue|catalog|survey|signal|model|record|image|map|list|research|flyby|computation|observat|telescope/;
const TRAVEL_TYPE = /rocket|station|landing|seed/;
const TRAVEL_ITEM = /rocket|station|landing|seed|tank|chart|model|singularity|probe|capsule|lander|_key$/;

// The declared roles of RF-3S (ev.md:481-500), tested against the dump's recipes. Approximate by design: each test is a few
// lines of evidence, not a proof. Returns { ok, why }; a role is never judged without a dump.
export function checkRole(l, facts, rc = {}) {
  if (!l.role) return null;
  if (!facts) return { ok: false, why: 'no dump to test it' };
  const cons = (k) => facts.consumers.get(k) || [];
  const prods = l.products;
  const fail = (why) => ({ ok: false, why });
  const ok = { ok: true, why: '' };
  switch (l.role) {
    case 'power':
      return !prods.length || [...l.machines].some((t) => facts.euTypes.has(t)) ? ok : fail('no machine of the line outputs EU');
    case 'resource': {
      if (!prods.length) return fail('no end product');
      for (const p of prods) {
        const mine = (facts.producers.get(p.res) || []).filter((r) => l.machines.has(r.type) || ownedTypes(l, facts).ids.has(r.id));
        if (!mine.length) return fail(`no recipe of the line makes ${p.res}`);
        if (!mine.some(siteOnly)) return fail(`${p.res} is made from consumed inputs, not only wear, charge, site fluids or air`);
        if (!rc.feeds?.get(p.res)?.size) return fail(`${p.res} feeds no other line`);
      }
      return ok;
    }
    case 'infrastructure': {
      if (!prods.length) return fail('no end product');
      const isInfra = (k) => rc.infra?.has(k) || INFRA_PART.test(k);
      const useful = (r) => !IGNORED_TYPE.test(r.type);
      for (const p of prods) {
        // a machine, hatch, casing or structure block is placed in the world: it needs no recipe consumer
        if (rc.infra?.has(p.res)) continue;
        const cs = cons(p.res).filter(useful);
        if (!cs.length) return fail(`${p.res} has no consumer`);
        // a consumer counts when an output of it, or of recipes up to three hops on, is infrastructure
        const reach = (keys, d) => keys.some((k) => isInfra(k)) || (d > 0 && keys.some((k) => cons(k).slice(0, 12).some((r2) => useful(r2) && reach(r2.outputs.map((o) => o.key), d - 1))));
        const hit = cs.filter((r) => reach(r.outputs.map((o) => o.key), 2)).length;
        if (hit * 2 < cs.length) return fail(`${p.res} mostly feeds recipes that lead to no machine, structure, casing or suit within 3 hops`);
      }
      return ok;
    }
    case 'research': {
      if (!prods.length) return fail('no end product');
      for (const p of prods) {
        const cs = cons(p.res).filter((r) => !IGNORED_TYPE.test(r.type));
        if (!cs.length) return fail(`${p.res} has no consumer`);
        if (!cs.every((r) => RESEARCH_TYPE.test(r.type) || r.inputs.some((i) => i.cap && i.alts.includes(p.res)) || r.outputs.some((o) => RESEARCH_ITEM.test(o.key)))) return fail(`${p.res} is consumed as material that does not lead to research`);
      }
      return ok;
    }
    case 'travel': {
      if (!prods.length) return fail('no end product');
      for (const p of prods) {
        const cs = cons(p.res).filter((r) => !IGNORED_TYPE.test(r.type));
        if (!cs.length) { if (TRAVEL_KEY.test(p.res)) continue; return fail(`${p.res} has no consumer`); }
        if (!cs.every((r) => TRAVEL_TYPE.test(r.type) || r.inputs.some((i) => i.cap && i.alts.includes(p.res)) || r.outputs.some((o) => TRAVEL_ITEM.test(o.key) || rc.infra?.has(o.key)))) return fail(`${p.res} is consumed as material that does not lead to travel`);
      }
      return ok;
    }
  }
  return fail(`unknown role ${l.role}`);
}

// kind: role (declared and tested), branch (extends, three steps or fewer), fold (rule 4), or production.
export function classify(l, facts, rc = {}) {
  const role = checkRole(l, facts, rc);
  if (role?.ok) return { kind: 'role', role };
  if (!role && l.extends && l.steps <= 3) return { kind: 'branch', role };
  if (!role && eraIdx(l.era) >= eraIdx('ev') && isFold(l, facts)) return { kind: 'fold', role };
  return { kind: 'production', role };
}

export function judge(l, { used, dup, skipped, endInfo, kind = 'production', role = null }) {
  const real = l.steps >= REAL_STEPS;
  // chart link nodes first; the dump's recipes (older multiblocks and end products really used) fill an incomplete chart
  const cross = [...l.crossings, ...(l.content || [])];
  const reach = Math.max(0, ...cross.map((c) => c.back));
  // Travel keys and similar are consumed by use, not by recipes.
  const dead = l.products.filter((p) => !p.end && !TRAVEL_KEY.test(p.res) && endInfo.get(p.res)?.n === 0 && !used.size);
  const allSkip = l.products.length > 0 && skipped.length === l.products.length;
  const noEnd = l.products.length === 0;
  const short = !real && eraIdx(l.era) >= eraIdx('ev');
  let verdict = 'keep';
  let reason = `${l.steps} steps, ${l.crossings.length} chart + ${(l.content || []).length} content crossings (reach ${reach}), used by ${used.size} lines`;
  // Skippability is only a lower-bound depth heuristic, so it never removes a line on its own.
  if (dead.length && dead.length === l.products.length && kind !== 'role') {
    verdict = 'remove'; reason = `no end product feeds a recipe or another line (decorative)`;
  } else if (dup && kind !== 'role') {
    verdict = 'merge'; reason = `shares ${dup.shared} intermediates with ${dup.of}`;
  } else if (kind === 'role') {
    reason = `role ${l.role}: ${reason}`;
  } else if (kind === 'fold') {
    reason = `fold: one multiblock replaces a GTM chain; ${reason}`;
  } else if (kind === 'branch') {
    if (!used.size && !cross.length && !l.products.some((p) => p.end)) { verdict = 'fix'; reason = 'branch end has no consumer'; }
    else reason = `branch end of ${l.extends}: ${reason}`;
  } else if (!real && l.keepShort) {
    // a declared short line stays at any era (#284); the short fix below stays EV+
    reason = `keepShort (${l.keepShort}): ${l.steps} steps; ${reason}`;
  } else if (short) {
    verdict = 'fix'; reason = `only ${l.steps} steps (a real line has ${REAL_STEPS}+)`;
  } else if (allSkip) {
    verdict = 'fix'; reason = `every end product has a shorter bypass recipe; make the line the better route`;
  } else if (dead.length) {
    verdict = 'fix'; reason = `${dead.length} end product(s) lead nowhere: ${dead.map((p) => p.res.replace(/^gtceu:/, '')).slice(0, 3).join(' ')}`;
  } else if (eraIdx(l.era) >= eraIdx('ev') && !cross.length && !used.size) {
    verdict = 'fix'; reason = `no crossing and no other line uses it: isolated`;
  } else if (eraIdx(l.era) >= eraIdx('luv') && cross.length && reach < 2) {
    verdict = 'fix'; reason = `crosses only ${reach <= 1 ? 'the previous era' : ''}: reach back two or more eras`;
  } else if (noEnd) {
    verdict = 'fix'; reason = 'no end product marked';
  }
  if (role && !role.ok) reason = `declared role ${l.role} fails: ${role.why}; ${reason}`;
  return { verdict, reason, real, reach, kind };
}

export function auditAll(model, facts, keyItems, { startup = new Map(), machines = [], never = new Set(), infra = new Set() } = {}) {
  const lines = collectLines(model);
  const eraCtx = facts ? buildEraContext({ startup, machines, lines }) : null;
  const used = usedBy(lines);
  const dups = findDuplicates(lines);
  const feeds = new Map();
  for (const o of lines) for (const k of o.raws) { if (!feeds.has(k)) feeds.set(k, new Set()); feeds.get(k).add(o.id); }
  const rowsOf = [];
  for (const l of lines) {
    const rcl = { infra: new Set([...infra, ...machines.map((m) => m.id)]), feeds: new Map([...feeds].map(([k, v]) => [k, new Set([...v].filter((id) => id !== l.id))])) };
    rowsOf.push({ l, ...classify(l, facts, rcl) });
  }
  const rows = [];
  for (const { l, kind, role } of rowsOf) {
    const endInfo = new Map();
    const skipped = [];
    const skipText = [];
    const earlier = rowsOf.filter((o) => o.kind === 'production' && eraIdx(o.l.era) < eraIdx(l.era)).map((o) => o.l);
    for (const p of l.products) {
      endInfo.set(p.res, facts ? consumerSummary(p.res, facts, keyItems) : { n: -1, reached: [] });
      if (facts && kind === 'production') { const s = skipRoute(l, p.res, facts, eraCtx, { never, earlier }); if (s) { skipped.push(p); skipText.push(`${p.res.replace(/^gtceu:/, '')} via ${s.id} (${s.type}, ${s.depth} < ${s.budget})`); } }
    }
    if (facts) l.content = contentCrossings(l, facts, eraCtx);
    const u = used.get(l.id);
    const j = judge(l, { used: u, dup: dups.get(l.id), skipped, endInfo, kind, role });
    rows.push({ line: l, used: u, dup: dups.get(l.id), skipText, endInfo, role, ...j });
  }
  return rows;
}

// Design lines of an era doc: the first table after "## New process lines" (or the "## Lines" table of max.md, rows L<n>).
// A row is [number, text of its line and chain cells]; later tables of the section (crossings) are not read.
export function parseDesignLines(md, era) {
  const lines = md.split(/\r?\n/);
  const head = era === 'max' ? /^## Lines\s*$/ : /^## New process lines\s*$/;
  const at = lines.findIndex((x) => head.test(x));
  if (at < 0) return [];
  const rows = [];
  let inTable = false;
  for (let i = at + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i])) break;
    const m = /^\|\s*L?(\d+)\s*\|(.*)\|\s*$/.exec(lines[i]);
    if (m) { inTable = true; const cells = m[2].split('|').map((c) => c.trim()); rows.push({ num: Number(m[1]), name: cells[0], text: cells.slice(0, 2).join(' '), cells }); }
    else if (inTable && !/^\|/.test(lines[i])) { if (lines[i].trim()) break; if (rows.length) inTable = 'ended'; }
    if (inTable === 'ended' && rows.length) break;
  }
  return rows;
}

const STOP = new Set(['the', 'and', 'of', 'to', 'in', 'a', 'for', 'with', 'from', 'on', 'per', 'its', 'uhv', 'uev', 'uv', 'zpm', 'luv', 'iv', 'ev', 'hv', 'mv', 'lv', 'stock', 'back']);
const tokensOf = (s) => String(s).normalize('NFKD').replace(/[^\x00-\x7f]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w) && (w.length > 2 || /\d/.test(w)));
const stagesOf = (row) => row.text.replace(/\([^)]*\)/g, ' ').split(/\u2192|->|:/).map(tokensOf).filter((t) => t.length);

// Design lines of an era found in `keys` (item and fluid ids): a line counts as found when at least 40% of its stages, and two
// of them when it has more than three, name an id of the set. A heuristic (names in the doc are prose); the audit doc confirms it by hand.
export function designPresence(rows, keys) {
  const sets = [...keys].map((k) => new Set(String(k).replace(/^fluid:/, '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)));
  return rows.map((row) => {
    const st = stagesOf(row);
    const hit = st.filter((tok) => sets.some((s) => tok.every((w) => s.has(w) || s.has(w.replace(/s$/, ''))))).length;
    return { row, hit, stages: st.length, found: st.length > 0 && hit >= Math.max(st.length > 3 ? 2 : 1, Math.ceil(st.length * 0.4)) };
  });
}

// Per era: design lines (era doc), chart lines, and design lines missing from the charts (and whether the dump has them).
export function designReport(era, rows, chartLines, dumpKeys, { built = null } = {}) {
  const chartKeys = new Set(chartLines.flatMap((l) => l.nodes.filter((nd) => !nd.link && nd.res).map((nd) => nd.res)));
  const design = built ? rows.filter((r) => built.has(r.num)) : rows;
  const planned = built ? rows.filter((r) => !built.has(r.num)) : [];
  const inChart = designPresence(design, chartKeys);
  const inDump = designPresence(design, dumpKeys);
  const missing = inChart.map((c, i) => ({ ...c, dump: inDump[i].found })).filter((c) => !c.found);
  return { era, design: design.length, chart: chartLines.length, planned: planned.length, missing, missingByCount: Math.max(0, design.length - chartLines.length) };
}
const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
export function toCsv(rows) {
  const head = ['era', 'line', 'name', 'steps', 'real', 'multiblocks', 'ours', 'crossings', 'crossing_eras', 'content_crossings', 'content_eras', 'reach_back', 'used_by_lines', 'end_products', 'end_consumers', 'skip_route', 'duplicate_of', 'verdict', 'reason', 'role', 'role_ok', 'line_id', 'extends', 'keep_short'];
  const out = [head.join(',')];
  for (const r of rows) {
    const l = r.line;
    out.push([
      l.era, l.cluster, q(l.name), l.steps, r.real ? 1 : 0, l.mbs.length, l.ours.length, l.crossings.length,
      q([...new Set(l.crossings.map((c) => c.era))].join(' ')), (l.content || []).length, q([...new Set((l.content || []).map((c) => c.era))].join(' ')), r.reach, q([...r.used].join(' ')),
      q(l.products.map((p) => p.res.replace(/^gtceu:/, '')).join(' ')),
      q(l.products.map((p) => { const e = r.endInfo.get(p.res); return `${p.res.replace(/^gtceu:/, '')}=${e.n}${e.reached.length ? '>' + e.reached.slice(0, 3).join('|') : ''}`; }).join('; ')),
      q(r.skipText.join('; ')), r.dup ? r.dup.of : '', r.verdict, q(r.reason),
      l.role ?? '', l.role ? (r.role?.ok ? 1 : 0) : '', l.lineId ?? '', q(l.extends ?? ''), q(l.keepShort ?? ''),
    ].join(','));
  }
  return out.join('\n') + '\n';
}

// Accepted blocks of the pack's structures (every block id of every symbol, oneOf alternatives included) plus the wireless table's
// cells (what census.mjs counts as script-used): parts placed in the world need no recipe consumer.
export function structureBlocks(structures, wirelessTable = null) {
  const out = new Set();
  const walk = (sym) => {
    if (!sym || typeof sym !== 'object') return;
    for (const b of sym.blocks || []) out.add(String(b));
    for (const o of sym.options || []) walk(o);
  };
  for (const s of (structures instanceof Map ? [...structures.values()] : Object.values(structures || {}))) for (const sym of Object.values(s?.symbols || {})) walk(sym);
  for (const r of wirelessTable?.tiers || []) if (r.cell && !/^grindless:horizon_/.test(r.cell)) out.add(r.cell);
  return out;
}

// The infrastructure set of the role checker: controllers, plus the blocks they accept.
export function infraSet(structures, wirelessTable = null) {
  return new Set([...(structures instanceof Map ? structures.keys() : Object.keys(structures || {})), ...structureBlocks(structures, wirelessTable)]);
}

export function eraSummary(rows) {
  const per = new Map(ERAS.map((e) => [e, { lines: 0, real: 0, crossings: 0, deep: 0, content: 0, keep: 0, fix: 0, merge: 0, remove: 0, prod: 0, role: 0, branch: 0, fold: 0, longest: 0, depth: {}, long: [] }]));
  for (const r of rows) {
    const s = per.get(r.line.era);
    const kind = r.kind || 'production';
    s.lines++; if (r.real && kind === 'production') { s.real++; s.longest = Math.max(s.longest, r.line.steps); s.depth[r.line.steps] = (s.depth[r.line.steps] || 0) + 1; s.long.push({ id: r.line.id, steps: r.line.steps }); }
    s.crossings += r.line.crossings.length; s.content += (r.line.content || []).length;
    if (r.real && kind === 'production') s.deep += [...r.line.crossings, ...(r.line.content || [])].filter((c) => c.back >= 2).length;
    if (s[r.verdict] !== undefined) s[r.verdict]++;
    s[kind === 'production' ? 'prod' : kind]++;
  }
  for (const s of per.values()) s.long = s.long.sort((a, b) => b.steps - a.steps || (a.id < b.id ? -1 : 1)).slice(0, LONG_CHAINS);
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
  const startup = scanStartupEras(path.join(REPO, 'pack', 'kubejs', 'startup_scripts', 'grindless'));
  const hidden = path.join(REPO, 'pack', 'kubejs', 'data', 'grindless', 'tables', 'hidden_until.json');
  const neverGroups = fs.existsSync(hidden) ? (JSON.parse(fs.readFileSync(hidden, 'utf8')).groups || []).filter((g) => g.until === 'never') : [];
  const never = new Set(neverGroups.flatMap((g) => [...(g.items || []), ...(g.material ? [`material:${g.material}`] : [])]));
  const wirelessFile = path.join(REPO, 'pack', 'kubejs', 'data', 'grindless', 'tables', 'wireless_energy.json');
  const infra = infraSet(idx.dump?.structures, fs.existsSync(wirelessFile) ? JSON.parse(fs.readFileSync(wirelessFile, 'utf8')) : null);
  const rows = auditAll(model, facts, keyItems, { startup, machines: [...idx.machines.values()], never, infra });
  fs.mkdirSync(opt.out, { recursive: true });
  fs.writeFileSync(path.join(opt.out, '03_lines.csv'), toCsv(rows));
  const per = eraSummary(rows);
  const dumpKeys = new Set([...facts.producers.keys(), ...facts.consumers.keys()]);
  const reports = [];
  for (const era of ERAS) {
    const doc = path.join(REPO, 'docs', 'eras', `${era}.md`);
    if (!fs.existsSync(doc)) continue;
    const drows = parseDesignLines(fs.readFileSync(doc, 'utf8'), era);
    const chart = rows.filter((r) => r.line.era === era).map((r) => r.line);
    if (!drows.length || !chart.length) continue;
    // max.md lists L47 and up as planned: they are shown apart, not as missing
    const built = era === 'max' ? new Set(chart.map((l) => Number(/^L(\d+)$/.exec(l.id.split('#')[1] || '')?.[1])).filter(Boolean)) : null;
    reports.push(designReport(era, drows, chart, dumpKeys, { built }));
  }
  const miss = ['era,number,line,in_dump,stages_found,stages'];
  const cnt = ['era,design_lines,chart_lines,real_lines,missing_by_count,missing_named,missing_in_dump,planned'];
  for (const r of reports) {
    for (const m of r.missing) miss.push([r.era, m.row.num, q(m.row.name), m.dump ? 1 : 0, m.hit, m.stages].join(','));
    cnt.push([r.era, r.design, r.chart, per.get(r.era).real, r.missingByCount, r.missing.length, r.missing.filter((m) => m.dump).length, r.planned].join(','));
  }
  fs.writeFileSync(path.join(opt.out, '03_design_lines.csv'), cnt.join('\n') + '\n');
  fs.writeFileSync(path.join(opt.out, '03_missing_lines.csv'), miss.join('\n') + '\n');
  const rep = new Map(reports.map((r) => [r.era, r]));
  console.log('era    design chart real | missing (count / named, in dump)  planned | cross content  keep fix merge remove  prod role branch fold   longest deep');
  for (const [e, s] of per) {
    if (!s.lines) continue;
    const r = rep.get(e);
    const d = r ? `${String(r.design).padStart(6)} ${String(r.chart).padStart(5)} ${String(s.real).padStart(4)} | ${String(r.missingByCount).padStart(7)} / ${String(r.missing.length).padStart(2)}, ${String(r.missing.filter((m) => m.dump).length).padStart(2)}  ${String(r.planned || '').padStart(14)}` : `${''.padStart(6)} ${String(s.lines).padStart(5)} ${String(s.real).padStart(4)} | ${''.padStart(25)}`;
    console.log(`${e.padEnd(6)} ${d} | ${String(s.crossings).padStart(5)} ${String(s.content).padStart(7)}  ${String(s.keep).padStart(4)} ${String(s.fix).padStart(3)} ${String(s.merge).padStart(5)}     ${String(s.remove).padStart(6)}  ${String(s.prod).padStart(4)} ${String(s.role).padStart(4)} ${String(s.branch).padStart(6)} ${String(s.fold).padStart(4)}       ${String(s.longest || '-').padStart(7)} ${String(s.deep).padStart(4)}`);
  }
  console.log('depth (descriptive, not a quota): real production lines by step count, longest chains');
  for (const [e, s] of per) {
     if (!s.real) continue;
     const dist = Object.keys(s.depth).map(Number).sort((a, b) => a - b).map((k) => `${k}:${s.depth[k]}`).join(' ');
     console.log(`${e.padEnd(6)} steps ${dist} | longest ${s.long.map((x) => `${x.id} (${x.steps})`).join(', ')}`);
  }
      for (const r of rows) {
        if (r.line.keepShort && r.kind === 'production') console.log(`keepShort ${r.line.id}: ${r.line.keepShort}`);
        if (r.line.role && !r.role?.ok) console.log(`role fails ${r.line.id}: ${r.line.role}: ${r.role?.why}`);
      }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main(process.argv.slice(2));
