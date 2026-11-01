// Draws the FTB Quests book the way the questbook lays it out: one SVG per chapter, an index page, a summary CSV and one
// CSV per chapter (quests, tasks, rewards). Offline, deterministic, no npm dependencies, read-only on the book.
//
//   node tools/quests/render-book.mjs [--book <quests dir>] --out <dir>
//   node tools/quests/render-book.mjs --compare <before dir> <after dir> [--out <dir>]
//
// --out receives: index.html, chapters.csv, book.json (the model --compare reads), svg/<chapter>.svg and
// csv/<chapter>.csv. --compare writes index.html plus one <chapter>.html per chapter (before | after, with the changes).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadBook } from './lib/book.mjs';
import { questLabel, stripCodes } from './lib/checks.mjs';

const UNIT = 64; // pixels per quest-grid unit
const PAD = 2; // grid units around the content

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const f1 = (n) => Number(n.toFixed(1));
const rewardKinds = (q) => q.rewards.map((r) => r.type || '?');
const short = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

// Plain model of a book: what both the SVG and the compare mode need, and what book.json stores.
export function modelOf(book) {
  const chapters = book.chapters.map((ch) => {
    const quests = ch.quests.map((q) => ({
      id: q.id,
      title: questLabel(q),
      hasTitle: !!q.title,
      icon: typeof q.icon === 'string' ? q.icon : (q.icon && q.icon.id) || '',
      x: q.x, y: q.y, size: q.size, shape: q.shape,
      deps: q.deps, optional: q.optional, hideLines: q.hideDependencyLines, invisible: q.invisible,
      tasks: q.tasks.map((t) => t.type + (t.itemId ? ':' + t.itemId : '')),
      rewards: q.rewards.map((r) => r.type + (r.itemId ? ':' + r.itemId : '') + (r.count ? 'x' + r.count : '') + (r.xp ? ' ' + r.xp + 'xp' : '')),
    }));
    return {
      filename: ch.filename,
      title: stripCodes(ch.title) || ch.filename,
      group: (book.groups.find((g) => g.id === ch.group) || {}).title || '',
      icon: typeof ch.icon === 'string' ? ch.icon : '',
      quests,
      links: ch.links.map((l) => {
        const t = book.questById.get(l.linked);
        return { id: l.id, linked: l.linked, title: t ? questLabel(t) : l.linked, x: l.x, y: l.y, size: l.size, shape: l.shape || ch.defaultShape };
      }),
      images: ch.images.map((i) => ({
        x: num(i.x), y: num(i.y), width: num(i.width, 1), height: num(i.height, 1),
        image: String(i.image ?? ''), text: i.text !== undefined ? [].concat(i.text).map(String).join(' ') : '',
      })),
      // dependencies whose parent lives in another chapter: drawn as a note, not as a line
      external: ch.quests.flatMap((q) => q.deps.filter((d) => book.questById.has(d) && book.questById.get(d).chapter !== ch).map((d) => ({ to: q.id, from: questLabel(book.questById.get(d)), chapter: book.questById.get(d).chapter.filename }))),
    };
  });
  for (const c of chapters) {
    c.counts = {
      quests: c.quests.length,
      dependencies: c.quests.reduce((n, q) => n + q.deps.length, 0),
      tasks: c.quests.reduce((n, q) => n + q.tasks.length, 0),
      rewards: c.quests.reduce((n, q) => n + q.rewards.length, 0),
      links: c.links.length,
      images: c.images.length,
    };
  }
  return { generator: 'render-book', chapters };
}

function shapeParts(shape, cx, cy, r) {
  const poly = (n, rot = -Math.PI / 2) => {
    const pts = [];
    for (let i = 0; i < n; i++) { const a = rot + (i * 2 * Math.PI) / n; pts.push(`${f1(cx + r * Math.cos(a))},${f1(cy + r * Math.sin(a))}`); }
    return [`polygon`, `points="${pts.join(' ')}"`];
  };
  switch (shape) {
    case 'square': return [`rect`, `x="${f1(cx - r)}" y="${f1(cy - r)}" width="${f1(2 * r)}" height="${f1(2 * r)}"`];
    case 'rsquare': return [`rect`, `x="${f1(cx - r)}" y="${f1(cy - r)}" width="${f1(2 * r)}" height="${f1(2 * r)}" rx="${f1(r * 0.3)}"`];
    case 'diamond': return poly(4);
    case 'pentagon': return poly(5);
    case 'hexagon': return poly(6, 0);
    case 'octagon': return poly(8, Math.PI / 8);
    case 'gear': return poly(12, 0);
    default: return [`circle`, `cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}"`];
  }
}

function shapeEl(shape, cx, cy, r, attrs, inner = '') {
  const [tag, geo] = shapeParts(shape, cx, cy, r);
  return `<${tag} ${geo} ${attrs}>${inner}</${tag}>`;
}

export function chapterSvg(ch) {
  const boxes = [];
  for (const q of ch.quests) boxes.push([q.x, q.y, q.size]);
  for (const l of ch.links) boxes.push([l.x, l.y, l.size]);
  let x0 = 0, y0 = 0, x1 = 0, y1 = 0;
  const grow = (ax, ay, bx, by) => { x0 = Math.min(x0, ax); y0 = Math.min(y0, ay); x1 = Math.max(x1, bx); y1 = Math.max(y1, by); };
  boxes.forEach(([x, y, s], i) => (i === 0 ? ((x0 = x - s / 2), (y0 = y - s / 2), (x1 = x + s / 2), (y1 = y + s / 2)) : grow(x - s / 2, y - s / 2, x + s / 2, y + s / 2)));
  for (const im of ch.images) grow(im.x - im.width / 2, im.y - im.height / 2, im.x + im.width / 2, im.y + im.height / 2);
  x0 -= PAD; y0 -= PAD; x1 += PAD; y1 += PAD + 0.5;
  const W = Math.round((x1 - x0) * UNIT), H = Math.round((y1 - y0) * UNIT) + 40;
  const px = (x) => f1((x - x0) * UNIT);
  const py = (y) => f1((y - y0) * UNIT + 40);
  const byId = new Map(ch.quests.map((q) => [q.id, q]));
  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Segoe UI, Arial, sans-serif">`);
  out.push('<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#8a94a6"/></marker></defs>');
  out.push(`<rect width="${W}" height="${H}" fill="#14171f"/>`);
  out.push(`<text x="12" y="26" fill="#e8ecf4" font-size="18" font-weight="600">${esc(ch.title)} <tspan fill="#8a94a6" font-size="13">${esc(ch.group)} · ${ch.counts.quests} quests · ${ch.counts.tasks} tasks · ${ch.counts.rewards} rewards</tspan></text>`);
  for (const im of ch.images) {
    out.push(`<rect x="${px(im.x - im.width / 2)}" y="${py(im.y - im.height / 2)}" width="${f1(im.width * UNIT)}" height="${f1(im.height * UNIT)}" fill="none" stroke="#5c6a85" stroke-dasharray="4 3"/>`);
    out.push(`<text x="${px(im.x)}" y="${py(im.y)}" fill="#5c6a85" font-size="11" text-anchor="middle">${esc(short(im.text || im.image, 40))}</text>`);
  }
  const linkById = new Map(ch.links.map((l) => [l.id, l]));
  const buttonsOf = (id) => [...(byId.has(id) ? [byId.get(id)] : []), ...ch.links.filter((l) => l.linked === id)];
  const edges = [];
  for (const q of ch.quests) for (const d of q.deps) for (const p of buttonsOf(d)) edges.push([p, q, q.hideLines]);
  for (const l of ch.links) {
    const mirrored = ch.quests.length ? null : null;
    void mirrored;
  }
  for (const [p, q, hidden] of edges) {
    const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const sx = p.x + (ux * Math.max(0.1, p.size)) / 2, sy = p.y + (uy * Math.max(0.1, p.size)) / 2;
    const ex = q.x - (ux * (Math.max(0.1, q.size) / 2 + 0.08)), ey = q.y - (uy * (Math.max(0.1, q.size) / 2 + 0.08));
    out.push(`<line x1="${px(sx)}" y1="${py(sy)}" x2="${px(ex)}" y2="${py(ey)}" stroke="${hidden ? '#4a5160' : '#8a94a6'}" stroke-width="1.5"${hidden ? ' stroke-dasharray="3 3"' : ''} marker-end="url(#ah)"/>`);
  }
  const externalTo = new Map();
  for (const e of ch.external) { if (!externalTo.has(e.to)) externalTo.set(e.to, []); externalTo.get(e.to).push(e); }
  for (const q of ch.quests) {
    const cx = (q.x - x0) * UNIT, cy = (q.y - y0) * UNIT + 40, r = (Math.max(0.1, q.size) * UNIT * 0.8) / 2;
    const root = q.deps.length === 0;
    const fill = q.optional ? '#2a3350' : root ? '#3a2f12' : '#1f3a2c';
    const stroke = root ? '#e6b422' : q.optional ? '#7e8fc4' : '#4cc38a';
    out.push(shapeEl(q.shape, cx, cy, r, `fill="${fill}" stroke="${stroke}" stroke-width="2"${q.optional ? ' stroke-dasharray="5 3"' : ''}${q.invisible ? ' opacity="0.45"' : ''}`, `<title>${esc(q.id)} ${esc(q.icon)}</title>`));
    const label = q.hasTitle ? q.title : (q.icon || q.title);
    out.push(`<text x="${f1(cx)}" y="${f1(cy + r + 13)}" fill="${q.hasTitle ? '#dfe5f2' : '#c9a86a'}" font-size="11" text-anchor="middle">${esc(short(label, 26))}</text>`);
    const ext = externalTo.get(q.id);
    if (ext) out.push(`<text x="${f1(cx)}" y="${f1(cy - r - 4)}" fill="#7e8fc4" font-size="9" text-anchor="middle">← ${esc(short(ext.map((e) => e.chapter).join(', '), 30))}</text>`);
    if (q.tasks.length > 1) out.push(`<text x="${f1(cx)}" y="${f1(cy + 4)}" fill="#e8ecf4" font-size="11" text-anchor="middle">${q.tasks.length}</text>`);
  }
  for (const l of ch.links) {
    const cx = (l.x - x0) * UNIT, cy = (l.y - y0) * UNIT + 40, r = (Math.max(0.1, l.size) * UNIT * 0.8) / 2;
    out.push(shapeEl(l.shape, cx, cy, r, 'fill="none" stroke="#7e8fc4" stroke-width="2" stroke-dasharray="2 3"'));
    out.push(`<text x="${f1(cx)}" y="${f1(cy + r + 13)}" fill="#7e8fc4" font-size="11" text-anchor="middle">↗ ${esc(short(l.title, 24))}</text>`);
  }
  void linkById;
  out.push('</svg>');
  return out.join('\n');
}

const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const csvRow = (cells) => cells.map(csvCell).join(',');

export function summaryCsv(model) {
  const rows = [csvRow(['chapter', 'title', 'group', 'quests', 'dependencies', 'tasks', 'rewards', 'quest_links', 'images'])];
  for (const c of model.chapters) rows.push(csvRow([c.filename, c.title, c.group, c.counts.quests, c.counts.dependencies, c.counts.tasks, c.counts.rewards, c.counts.links, c.counts.images]));
  return rows.join('\n') + '\n';
}

export function chapterCsv(ch) {
  const rows = [csvRow(['id', 'title', 'x', 'y', 'size', 'shape', 'optional', 'dependencies', 'tasks', 'rewards'])];
  for (const q of ch.quests) rows.push(csvRow([q.id, q.title, q.x, q.y, q.size, q.shape, q.optional, q.deps.join(' '), q.tasks.join(' | '), q.rewards.join(' | ')]));
  return rows.join('\n') + '\n';
}

const PAGE_CSS = 'body{background:#0e1016;color:#dfe5f2;font:14px Segoe UI,Arial,sans-serif;margin:24px}a{color:#7fb0ff}table{border-collapse:collapse}td,th{border:1px solid #2a3040;padding:4px 10px;text-align:left}th{background:#1a1f2b}.n{text-align:right}.chg{color:#ffd166}.cols{display:flex;gap:16px;align-items:flex-start}.cols>div{overflow:auto;max-height:90vh;border:1px solid #2a3040}h2{margin:.3em 0}';
const page = (title, body) => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${PAGE_CSS}</style></head><body>\n${body}\n</body></html>\n`;

export function indexHtml(model) {
  const rows = model.chapters.map((c) => `<tr><td><a href="svg/${esc(c.filename)}.svg">${esc(c.title)}</a></td><td>${esc(c.group)}</td><td class="n">${c.counts.quests}</td><td class="n">${c.counts.tasks}</td><td class="n">${c.counts.rewards}</td><td><a href="csv/${esc(c.filename)}.csv">csv</a></td></tr>`);
  const tot = (k) => model.chapters.reduce((n, c) => n + c.counts[k], 0);
  return page('Quest book', `<h1>Quest book</h1><table><tr><th>Chapter</th><th>Group</th><th>Quests</th><th>Tasks</th><th>Rewards</th><th></th></tr>\n${rows.join('\n')}\n<tr><th>${model.chapters.length} chapters</th><th></th><th class="n">${tot('quests')}</th><th class="n">${tot('tasks')}</th><th class="n">${tot('rewards')}</th><th></th></tr></table>`);
}

export function renderBook(bookDir, outDir) {
  const model = modelOf(loadBook(bookDir));
  fs.mkdirSync(path.join(outDir, 'svg'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'csv'), { recursive: true });
  for (const c of model.chapters) {
    fs.writeFileSync(path.join(outDir, 'svg', c.filename + '.svg'), chapterSvg(c));
    fs.writeFileSync(path.join(outDir, 'csv', c.filename + '.csv'), chapterCsv(c));
  }
  fs.writeFileSync(path.join(outDir, 'chapters.csv'), summaryCsv(model));
  fs.writeFileSync(path.join(outDir, 'book.json'), JSON.stringify(model, null, 1));
  fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml(model));
  return model;
}

// Differences between two chapter models: counts, added, removed, moved/resized/reshaped and retitled quests.
export function diffChapter(a, b) {
  const d = { counts: [], added: [], removed: [], moved: [], retitled: [] };
  const keys = new Set([...Object.keys(a ? a.counts : {}), ...Object.keys(b ? b.counts : {})]);
  for (const k of keys) {
    const x = a ? a.counts[k] : 0, y = b ? b.counts[k] : 0;
    if (x !== y) d.counts.push({ key: k, before: x, after: y });
  }
  const qa = new Map((a ? a.quests : []).map((q) => [q.id, q]));
  const qb = new Map((b ? b.quests : []).map((q) => [q.id, q]));
  for (const [id, q] of qb) {
    const o = qa.get(id);
    if (!o) { d.added.push(q); continue; }
    if (o.x !== q.x || o.y !== q.y || o.size !== q.size || o.shape !== q.shape) d.moved.push({ id, title: q.title, from: { x: o.x, y: o.y, size: o.size, shape: o.shape }, to: { x: q.x, y: q.y, size: q.size, shape: q.shape } });
    if (o.title !== q.title) d.retitled.push({ id, from: o.title, to: q.title });
  }
  for (const [id, q] of qa) if (!qb.has(id)) d.removed.push(q);
  return d;
}

const changed = (d) => d.counts.length || d.added.length || d.removed.length || d.moved.length || d.retitled.length;

function diffHtml(d) {
  const li = [];
  for (const c of d.counts) li.push(`<li class="chg">${esc(c.key)}: ${c.before} → ${c.after}</li>`);
  for (const q of d.added) li.push(`<li>added: ${esc(q.title)} (${q.x}, ${q.y})</li>`);
  for (const q of d.removed) li.push(`<li>removed: ${esc(q.title)} (${q.x}, ${q.y})</li>`);
  for (const m of d.moved) li.push(`<li>moved: ${esc(m.title)} (${m.from.x}, ${m.from.y}) → (${m.to.x}, ${m.to.y})${m.from.size !== m.to.size ? ` size ${m.from.size} → ${m.to.size}` : ''}${m.from.shape !== m.to.shape ? ` shape ${esc(m.from.shape)} → ${esc(m.to.shape)}` : ''}</li>`);
  for (const t of d.retitled) li.push(`<li>retitled: ${esc(t.from)} → ${esc(t.to)}</li>`);
  return li.length ? `<ul>${li.join('')}</ul>` : '<p>No changes.</p>';
}

export function compareBooks(beforeDir, afterDir, outDir) {
  const read = (d) => JSON.parse(fs.readFileSync(path.join(d, 'book.json'), 'utf8'));
  const A = read(beforeDir), B = read(afterDir);
  fs.mkdirSync(outDir, { recursive: true });
  const rel = (d, sub) => path.relative(outDir, path.join(d, sub)).split(path.sep).join('/');
  const ma = new Map(A.chapters.map((c) => [c.filename, c]));
  const mb = new Map(B.chapters.map((c) => [c.filename, c]));
  const names = [...new Set([...B.chapters.map((c) => c.filename), ...A.chapters.map((c) => c.filename)])];
  const rows = [];
  for (const n of names) {
    const a = ma.get(n), b = mb.get(n);
    const d = diffChapter(a, b);
    const title = (b || a).title;
    const pane = (c, dir) => (c ? `<img src="${esc(rel(dir, 'svg/' + n + '.svg'))}" alt="${esc(n)}">` : '<p>(chapter does not exist)</p>');
    fs.writeFileSync(path.join(outDir, n + '.html'), page(title, `<p><a href="index.html">← index</a></p><h2>${esc(title)}</h2>${diffHtml(d)}<div class="cols"><div><h3>Before</h3>${pane(a, beforeDir)}</div><div><h3>After</h3>${pane(b, afterDir)}</div></div>`));
    const cell = (k) => { const x = a ? a.counts[k] : 0, y = b ? b.counts[k] : 0; return x === y ? `<td class="n">${y}</td>` : `<td class="n chg">${x} → ${y}</td>`; };
    rows.push(`<tr><td><a href="${esc(n)}.html">${esc(title)}</a>${!a ? ' (new)' : !b ? ' (removed)' : ''}</td>${cell('quests')}${cell('tasks')}${cell('rewards')}<td class="n">${d.added.length}</td><td class="n">${d.removed.length}</td><td class="n">${d.moved.length}</td><td>${changed(d) ? '<span class="chg">changed</span>' : ''}</td></tr>`);
  }
  fs.writeFileSync(path.join(outDir, 'index.html'), page('Quest book: before and after', `<h1>Quest book: before and after</h1><table><tr><th>Chapter</th><th>Quests</th><th>Tasks</th><th>Rewards</th><th>Added</th><th>Removed</th><th>Moved</th><th></th></tr>\n${rows.join('\n')}</table>`));
  return names.length;
}

function main(argv) {
  const a = { book: null, out: null, compare: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--book') a.book = argv[++i];
    else if (argv[i] === '--out') a.out = argv[++i];
    else if (argv[i] === '--compare') { a.compare = [argv[++i], argv[++i]]; }
    else throw new Error('unknown argument ' + argv[i]);
  }
  if (a.compare) {
    if (!a.compare[0] || !a.compare[1]) throw new Error('--compare needs <before dir> <after dir>');
    const out = path.resolve(a.out || path.join(path.dirname(path.resolve(a.compare[1])), 'compare'));
    const n = compareBooks(path.resolve(a.compare[0]), path.resolve(a.compare[1]), out);
    console.log(`compared ${n} chapters -> ${path.join(out, 'index.html')}`);
    return;
  }
  if (!a.out) throw new Error('usage: render-book.mjs [--book <dir>] --out <dir> | --compare <before> <after> [--out <dir>]');
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const bookDir = path.resolve(a.book || path.join(repo, 'pack', 'config', 'ftbquests', 'quests'));
  const m = renderBook(bookDir, path.resolve(a.out));
  console.log(`${m.chapters.length} chapters, ${m.chapters.reduce((n, c) => n + c.counts.quests, 0)} quests -> ${path.resolve(a.out)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv);
