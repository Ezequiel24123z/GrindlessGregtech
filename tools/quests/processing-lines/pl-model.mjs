// Builds the processing-lines model from the data files: absolute positions, stable ids, dependencies, and the lines
// FTB Quests 2001.4 will actually draw (QuestPanel#drawOffsetBackground: every QuestButton, links included, draws a line to
// every button of each of its quest's dependencies, so a link repeats every line of the quest it mirrors).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { KINDS } from './pl-lib.mjs';
import { parse as parseSnbt } from '../lib/snbt.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
// the checkout this folder lives in (tools/quests/processing-lines)
export const REPO = path.resolve(here, '..', '..', '..');
export const BOOK = path.join(REPO, 'pack', 'config', 'ftbquests', 'quests');
export const TIERS = ['steam', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv'];
export const ALL = [];
for (const f of [...TIERS.map((t) => `pl-data-${t}.mjs`), 'power-data.mjs']) {
  const file = path.join(here, f);
  if (fs.existsSync(file)) ALL.push((await import(pathToFileURL(file).href)).default);
}
export const GROUP_TITLE = 'Processing Lines';
export const GAP_X = 3;
export const GAP_Y = 2.5;
const GRID = 0.25;

export function hid(seed) {
  const b = crypto.createHash('sha256').update('grindless-processing-lines|' + seed).digest().subarray(0, 8);
  b[0] = (b[0] & 0x7f) | 0x10;
  return Buffer.from(b).toString('hex').toUpperCase();
}

export const GROUP_ID = hid('group');

const snap = (v) => Math.ceil(v / GRID - 1e-9) * GRID;

export function buildModel(chapters = ALL) {
  const errors = [];
  const byFile = new Map();
  for (const ch of chapters) {
    const m = { ...ch, id: hid('chapter|' + ch.file), groupTitle: ch.group || GROUP_TITLE, nodes: [], byKey: new Map(), held: new Set() };
    byFile.set(ch.file, m);
    // place the clusters: bands top to bottom, clusters left to right, top-aligned, GAP_X/GAP_Y apart
    let bandY = 0;
    const placed = new Set();
    const keys = new Set();
    // pkg (on a node or its cluster): the content package that makes it. With ch.landed (a Set), a node whose package has not
    // landed keeps its place in the layout but is left out, with every arrow into or out of it; pending: { <pkg>: { ...opts } }
    // overrides a node's options while that package has not landed. Landing a package is adding it to the set.
    const held = (pkg) => !!(ch.landed && pkg && !ch.landed.has(pkg));
    for (const band of ch.bands) {
      let offX = 0;
      let bandH = 0;
      for (const ck of band) {
        const cl = ch.clusters[ck];
        if (!cl) { errors.push(`${ch.file}: band names unknown cluster ${ck}`); continue; }
        placed.add(ck);
        const sizes = cl.nodes.map((nd) => nd.size ?? KINDS[nd.kind].size);
        const minX = Math.min(...cl.nodes.map((nd, i) => nd.x - sizes[i] / 2));
        const maxX = Math.max(...cl.nodes.map((nd, i) => nd.x + sizes[i] / 2));
        const minY = Math.min(...cl.nodes.map((nd, i) => nd.y - sizes[i] / 2));
        const maxY = Math.max(...cl.nodes.map((nd, i) => nd.y + sizes[i] / 2));
        const dx = snap(offX - minX);
        const dy = snap(bandY - minY);
        cl.nodes.forEach((nd, i) => {
          if (keys.has(nd.key)) errors.push(`${ch.file}: duplicate node key ${nd.key}`);
          keys.add(nd.key);
          if (held(nd.pkg ?? cl.pkg)) { m.held.add(nd.key); return; }
          for (const [pkg, opts] of Object.entries(nd.pending || {})) if (held(pkg)) nd = { ...nd, ...opts };
          const kind = KINDS[nd.kind];
          if (!kind) errors.push(`${ch.file}/${nd.key}: unknown kind ${nd.kind}`);
          const node = {
            ...nd,
            cluster: ck,
            chapter: ch.file,
            x: nd.x + dx,
            y: nd.y + dy,
            size: sizes[i],
            shape: nd.shape ?? kind.shape,
            id: hid('quest|' + ch.file + '|' + nd.key),
          };
          if (nd.link) node.id = hid('link|' + ch.file + '|' + nd.key);
          m.nodes.push(node);
          m.byKey.set(nd.key, node);
        });
        offX = dx + maxX + GAP_X;
        bandH = Math.max(bandH, maxY - minY);
      }
      bandY = snap(bandY + bandH + GAP_Y);
    }
    for (const ck of Object.keys(ch.clusters)) if (!placed.has(ck)) errors.push(`${ch.file}: cluster ${ck} is in no band`);
  }
  // resolve links and dependencies
  const eraBook = new Map();
  // GG_QUESTS_ERA_DIR: a folder whose <chapter>.snbt stands in for the book's (the tests draw a chart for another
  // tables/stations.json against the luv_age generated for it)
  const eraDir = process.env.GG_QUESTS_ERA_DIR;
  const eraQuest = (chapter, id) => {
    if (!eraBook.has(chapter)) {
      const over = eraDir && path.join(eraDir, chapter + '.snbt');
      const file = over && fs.existsSync(over) ? over : path.join(BOOK, 'chapters', chapter + '.snbt');
      const quests = new Map();
      if (fs.existsSync(file)) {
        for (const q of parseSnbt(fs.readFileSync(file, 'utf8')).quests || []) {
          const items = new Set();
          const add = (it) => { if (typeof it === 'string') items.add(it); else if (it && typeof it.id === 'string') items.add(it.id); };
          add(q.icon);
          for (const t of q.tasks || []) add(t.item);
          quests.set(String(q.id), { id: String(q.id), chapter, title: String(q.title || ''), deps: [].concat(q.dependencies || []).map(String), items, era: true });
        }
      }
      eraBook.set(chapter, quests);
    }
    return eraBook.get(chapter).get(id) || null;
  };
  const resolveRef = (ref, where) => {
    if (ref.includes('#')) {
      const [chapter, id] = ref.split('#');
      const q = eraQuest(chapter, id);
      if (!q) errors.push(`${where}: link to unknown quest ${ref}`);
      return q;
    }
    const [file, key] = ref.split(':');
    const target = byFile.get(file);
    const node = target && target.byKey.get(key);
    if (!node) { errors.push(`${where}: link to unknown node ${ref}`); return null; }
    if (node.link) { errors.push(`${where}: link to a link ${ref}`); return null; }
    return node;
  };
  for (const m of byFile.values()) {
    for (const nd of m.nodes) {
      if (nd.link) {
        nd.target = resolveRef(nd.link, `${m.file}/${nd.key}`);
        if (nd.target && nd.target.chapter === m.file) errors.push(`${m.file}/${nd.key}: a link inside its own chapter repeats every line of ${nd.link}`);
      }
    }
    const seen = new Map();
    for (const nd of m.nodes) {
      if (!nd.target) continue;
      if (seen.has(nd.target.id)) errors.push(`${m.file}/${nd.key}: ${nd.link} is linked twice (also ${seen.get(nd.target.id)}): FTB draws every line of a quest at each of its links`);
      seen.set(nd.target.id, nd.key);
    }
  }
  for (const m of byFile.values()) {
    for (const nd of m.nodes) {
      nd.deps = [];
      nd.arrows = [];
      for (const f of nd.from) {
        const e = typeof f === 'string' ? { k: f } : f;
        if (m.held.has(e.k)) continue;
        const src = m.byKey.get(e.k);
        if (!src) { errors.push(`${m.file}/${nd.key}: arrow from unknown node ${e.k}`); continue; }
        if (nd.link) { errors.push(`${m.file}/${nd.key}: a link cannot have arrows into it`); continue; }
        const depQuest = src.link ? src.target : src;
        if (!depQuest) continue;
        if (!nd.deps.includes(depQuest.id)) nd.deps.push(depQuest.id);
        nd.arrows.push({ ...e, src, dst: nd, srcRes: src.link ? src.target : src });
      }
    }
  }
  // lines FTB Quests draws in each chapter
  for (const m of byFile.values()) {
    const buttons = m.nodes.map((nd) => ({ node: nd, quest: nd.link ? nd.target : nd })).filter((b) => b.quest);
    const lines = [];
    for (const b of buttons) {
      for (const depId of b.quest.deps || []) {
        for (const o of buttons) if (o.quest.id === depId) lines.push({ from: o.node, to: b.node });
      }
    }
    m.lines = lines;
  }
  return { chapters: [...byFile.values()], byFile, errors };
}

const half = (nd) => Math.max(0.1, nd.size) / 2;

function segIntersect(a, b, c, d) {
  const o = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
}

function segHitsBox(a, b, box) {
  let t0 = 0, t1 = 1;
  const dx = b.x - a.x, dy = b.y - a.y;
  const p = [-dx, dx, -dy, dy];
  const q = [a.x - box.x0, box.x1 - a.x, a.y - box.y0, box.y1 - a.y];
  for (let i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-12) { if (q[i] < 0) return false; continue; }
    const t = q[i] / p[i];
    if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
  }
  return t1 - t0 > 1e-6;
}

// The layout rules of docs/quests.md (section 4) applied to what the game draws, quest links included.
export function layoutFindings(m) {
  const out = [];
  const label = (nd) => `${nd.key}${nd.link ? '(link)' : ''}`;
  const ns = m.nodes;
  for (const nd of ns) {
    const off = (v) => Math.abs(v / GRID - Math.round(v / GRID)) > 1e-6;
    if (off(nd.x) || off(nd.y)) out.push(`off-grid ${label(nd)} (${nd.x}, ${nd.y})`);
  }
  for (let i = 0; i < ns.length; i++) {
    for (let j = i + 1; j < ns.length; j++) {
      const a = ns[i], b = ns[j];
      const gap = Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) - half(a) - half(b);
      if (gap < -0.01) out.push(`overlap ${label(a)} / ${label(b)}`);
      else if (gap < 0.24) out.push(`crowded ${label(a)} / ${label(b)} (${gap.toFixed(2)})`);
    }
  }
  for (const l of m.lines) {
    const { from, to } = l;
    const len = Math.hypot(to.x - from.x, to.y - from.y);
    if (to.x < from.x - 0.01) out.push(`backward ${label(from)} -> ${label(to)}`);
    else if (Math.abs(to.x - from.x) <= 0.01 && Math.abs(to.y - from.y) > 3.01) out.push(`vertical-long ${label(from)} -> ${label(to)}`);
    if (len > 5.01) out.push(`long-edge ${label(from)} -> ${label(to)} (${len.toFixed(2)})`);
    for (const o of ns) {
      if (o === from || o === to) continue;
      const h = half(o) * 0.9;
      if (segHitsBox(from, to, { x0: o.x - h, x1: o.x + h, y0: o.y - h, y1: o.y + h })) out.push(`through-node ${label(from)} -> ${label(to)} under ${label(o)}`);
    }
  }
  for (let i = 0; i < m.lines.length; i++) {
    for (let j = i + 1; j < m.lines.length; j++) {
      const a = m.lines[i], b = m.lines[j];
      if (a.from === b.from || a.from === b.to || a.to === b.from || a.to === b.to) continue;
      if (segIntersect(a.from, a.to, b.from, b.to)) out.push(`crossing ${label(a.from)} -> ${label(a.to)} x ${label(b.from)} -> ${label(b.to)}`);
    }
  }
  return out;
}
