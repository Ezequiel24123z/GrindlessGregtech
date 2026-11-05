// Draws a multiblock's structure description (lib/structure.mjs format) as SVG: a 3D view and its slices one by one.
// Used by structure-svg.mjs and the images of docs/multiblock-tutorial.md. Pure functions: a description in, an SVG string out.
//
// Axes (GTM 7.5.3 FactoryBlockPattern.start() = LEFT, UP, FRONT, relative to the controller's facing): slice 0 is the back
// and the last slice the front (the controller's face); rows go bottom to top; the characters of a row go left to right as
// you stand in front of the controller and look at it.

const FONT = 'Segoe UI, Helvetica, Arial, sans-serif';

const ABILITY = {
  energy_input: 'energy hatch',
  energy_output: 'dynamo hatch',
  input_bus: 'input bus',
  output_bus: 'output bus',
  input_hatch: 'input hatch',
  output_hatch: 'output hatch',
  muffler: 'muffler hatch',
  maintenance: 'maintenance hatch',
  steam: 'steam hatch',
  steam_input_bus: 'steam input bus',
  steam_output_bus: 'steam output bus',
};

const KEYWORD_COLORS = [
  [/coil/, '#c8742c'],
  [/glass|window|lens/, '#9fd6ea'],
  [/steam machine/, '#9a6b52'],
  [/brick/, '#a8553c'],
  [/pipe/, '#6f8aa6'],
  [/dirt|soil|farmland|grass|mud|moss/, '#7a5532'],
  [/gearbox/, '#8c7a5c'],
  [/firebox/, '#7f6a55'],
  [/bronze/, '#b9894a'],
  [/heatproof|invar/, '#cfc9b0'],
  [/stainless|clean/, '#d5dade'],
  [/tungsten/, '#5f6670'],
  [/titanium/, '#c4aecb'],
  [/steel|solid/, '#9ba5b0'],
];
const PALETTE = ['#b8c4d0', '#c9b98f', '#a3b59a', '#b59aa8', '#8fa9c9', '#d0a98a', '#9cc5b8', '#c7c18a', '#a9a0c9', '#c99a9a'];
const CONTROLLER = '#e8a33d';

/** 'gtceu:cupronickel_coil_block' -> 'cupronickel coil block' */
export function prettyId(id) {
  return String(id).replace(/^[^:]+:/, '').replace(/_/g, ' ');
}

function options(sym) {
  if (!sym) return [];
  return sym.kind === 'oneOf' ? (sym.options || []).flatMap(options) : [sym];
}

function limitsText(l, part) {
  if (!l) return '';
  if (l.exact !== undefined && l.exact !== null) return part ? ` ×${l.exact}` : ` (exactly ${l.exact})`;
  const a = [];
  if (l.min !== undefined && l.min !== null) a.push(`at least ${l.min}`);
  if (l.max !== undefined && l.max !== null) a.push(`at most ${l.max}`);
  return a.length ? ` (${a.join(', ')})` : '';
}

/** Plain-English meaning of one symbol, for the legend. */
export function describeSymbol(sym) {
  if (!sym) return 'unknown symbol';
  switch (sym.kind) {
    case 'controller': return 'controller (the block you click to open the machine)';
    case 'air': return 'air: must stay empty';
    case 'any': return 'anything';
    case 'blocks': return (sym.blocks || []).map(prettyId).join(' or ') + limitsText(sym.limits, false);
    case 'frames': return (sym.materials || []).map((m) => m.replace(/_/g, ' ')).join(' or ') + ' frame box' + limitsText(sym.limits, false);
    case 'part': return (ABILITY[sym.ability] || prettyId(sym.ability)) + limitsText(sym.limits, true);
    case 'oneOf': {
      const opts = options(sym);
      const main = opts.filter((o) => o.kind !== 'part').map(describeSymbol);
      const parts = opts.filter((o) => o.kind === 'part').map(describeSymbol);
      if (!main.length) return 'one of: ' + parts.join(', ');
      return main.join(' or ') + (parts.length ? '; hatches go in these cells too: ' + parts.join(', ') : '');
    }
    default: return sym.kind;
  }
}

function hexRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(h, to, t) {
  const a = hexRgb(h);
  const b = to === 'white' ? [255, 255, 255] : [0, 0, 0];
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

function luminance(h) {
  const [r, g, b] = hexRgb(h);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Color and look of every symbol of a description: { <char>: { color, solid, see } } (see = drawn see-through). */
export function symbolStyles(desc) {
  const out = {};
  const used = new Set();
  let next = 0;
  for (const [ch, sym] of Object.entries(desc.symbols || {})) {
    if (!sym || ch === ' ' || sym.kind === 'air' || sym.kind === 'any') { out[ch] = { color: null, solid: false, see: false }; continue; }
    if (sym.kind === 'controller') { out[ch] = { color: CONTROLLER, solid: true, see: false, controller: true }; continue; }
    const opts = options(sym);
    const main = opts.find((o) => o.kind !== 'part') || opts[0] || {};
    let color = null;
    let see = false;
    let frame = false;
    if (main.kind === 'frames') {
      frame = true;
      const m = (main.materials || [])[0] || '';
      color = /bronze|wood/.test(m) ? '#b08a55' : '#8a939c';
    }
    else if (main.kind === 'part') color = main.ability === 'muffler' ? '#4a4a4a' : '#5aa864';
    else {
      const id = prettyId((main.blocks || [])[0] || '');
      for (const [re, c] of KEYWORD_COLORS) if (re.test(id)) { color = c; break; }
      see = /glass|window|lens/.test(id);
    }
    if (!color || used.has(color)) color = PALETTE[next++ % PALETTE.length];
    used.add(color);
    out[ch] = { color, solid: true, see, frame };
  }
  return out;
}

function grid(desc) {
  const slices = (desc.slices || []).map((s) => s.map(String));
  const nz = slices.length;
  const ny = Math.max(0, ...slices.map((s) => s.length));
  const nx = Math.max(0, ...slices.flatMap((s) => s.map((r) => r.length)));
  const at = (x, y, z) => (z < 0 || z >= nz || y < 0 || x < 0 ? ' ' : ((slices[z][y] || '')[x] || ' '));
  return { slices, nx, ny, nz, at };
}

/** Number of cells of each symbol (spaces excluded). */
export function symbolCounts(desc) {
  const n = {};
  for (const s of desc.slices || []) for (const row of s) for (const ch of String(row)) if (ch !== ' ') n[ch] = (n[ch] || 0) + 1;
  return n;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function wrap(text, width) {
  const lines = [];
  let cur = '';
  for (const w of String(text).split(' ')) {
    if (cur && (cur + ' ' + w).length > width) { lines.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Legend block: one entry per symbol used, with its cell count. Returns { svg, height }. */
function legend(desc, styles, x0, y0, width) {
  const counts = symbolCounts(desc);
  const chars = Object.keys(desc.symbols || {}).filter((ch) => counts[ch]);
  const parts = [];
  let y = y0;
  const perLine = Math.max(40, Math.floor((width - 70) / 6.6));
  parts.push(`<text x="${x0}" y="${y + 13}" font-size="13" font-weight="600">Legend</text>`);
  y += 24;
  for (const ch of chars) {
    const st = styles[ch] || {};
    const fill = st.color || '#ffffff';
    const lines = wrap(`${describeSymbol(desc.symbols[ch])} (${counts[ch]} cell${counts[ch] === 1 ? '' : 's'})`, perLine);
    parts.push(`<rect x="${x0}" y="${y}" width="20" height="20" fill="${fill}" stroke="#555" stroke-width="0.8"${st.see ? ' fill-opacity="0.55"' : ''}/>`);
    parts.push(`<text x="${x0 + 10}" y="${y + 14.5}" font-size="12" font-weight="700" text-anchor="middle" fill="${luminance(fill) < 0.45 ? '#fff' : '#222'}">${esc(ch)}</text>`);
    lines.forEach((l, i) => parts.push(`<text x="${x0 + 30}" y="${y + 14.5 + i * 15}" font-size="12">${esc(l)}</text>`));
    y += Math.max(26, lines.length * 15 + 11);
  }
  parts.push(`<text x="${x0}" y="${y + 12}" font-size="11" fill="#666">A blank cell means any block can go there.</text>`);
  y += 22;
  return { svg: parts.join('\n'), height: y - y0 };
}

function camera(yawDeg, pitchDeg) {
  const t = (yawDeg * Math.PI) / 180;
  const p = (pitchDeg * Math.PI) / 180;
  return {
    r: [Math.cos(t), 0, -Math.sin(t)],
    u: [-Math.sin(t) * Math.sin(p), Math.cos(p), -Math.cos(t) * Math.sin(p)],
    d: [Math.sin(t) * Math.cos(p), Math.sin(p), Math.cos(t) * Math.cos(p)],
  };
}

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * 3D view of the structure from the front right, above.
 * opts: explode (set the slices side by side, back to front, with this gap in blocks between them), yaw, pitch, maxWidth,
 * legend (default true), axes (arrows naming slices, rows and characters), title, caption.
 */
export function renderIso(desc, opts = {}) {
  const { nx, ny, nz, at } = grid(desc);
  const styles = symbolStyles(desc);
  const gap = Number(opts.explode) || 0;
  const cam = camera(opts.yaw ?? 32, opts.pitch ?? 24);
  // World position of a cell: assembled, slice z sits at depth z; exploded, every slice is a slab at depth 0, moved right.
  const place = (x, z) => (gap > 0 ? [x + z * (nx + gap), 0] : [x, z]);
  const P = (x, y, z) => [dot([x, y, z], cam.r), -dot([x, y, z], cam.u)];
  const opaque = (ch) => { const s = styles[ch]; return !!(s && s.solid && !s.see); };

  const cubes = [];
  for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
    const ch = at(x, y, z);
    const st = styles[ch];
    if (!st || !st.solid) continue;
    const [X, Z] = place(x, z);
    cubes.push({ x, y, z, X, Z, st, depth: dot([X + 0.5, y + 0.5, Z + 0.5], cam.d) });
  }
  cubes.sort((a, b) => a.depth - b.depth);

  const corners = [];
  const [xEnd, zEnd] = gap > 0 ? [place(nx, nz - 1)[0], 1] : [nx, nz];
  for (const x of [0, xEnd]) for (const y of [0, ny]) for (const z of [0, zEnd]) corners.push(P(x, y, z));
  const extra = opts.axes ? 2.2 : 0.4;
  const minX = Math.min(...corners.map((c) => c[0])) - extra - (opts.axes ? 1.8 : 0);
  const maxX = Math.max(...corners.map((c) => c[0])) + extra + (opts.axes ? 3.5 : 0);
  const minY = Math.min(...corners.map((c) => c[1])) - extra;
  const maxY = Math.max(...corners.map((c) => c[1])) + extra + (gap > 0 ? 1.2 : 0);
  const maxWidth = opts.maxWidth || 640;
  const s = Math.min(46, maxWidth / (maxX - minX));
  const pad = 14;
  const titleH = opts.title ? 30 : 0;
  const tx = (p) => [(p[0] - minX) * s + pad, (p[1] - minY) * s + pad + titleH];
  const sw = Math.max(0.4, s / 40).toFixed(2);
  const poly = (pts, fill, extraAttr = '') =>
    `<polygon points="${pts.map((p) => tx(P(...p)).map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="#2a2a2a" stroke-width="${sw}" stroke-linejoin="round"${extraAttr}/>`;
  // Quad inset towards its centre, for the frame and controller marks.
  const inset = (q, k) => {
    const c = [0, 1, 2].map((i) => q.reduce((t, p) => t + p[i], 0) / 4);
    return q.map((p) => p.map((v, i) => c[i] + (v - c[i]) * k));
  };

  const body = [];
  for (const c of cubes) {
    const { X, Z, st } = c;
    const Y = c.y;
    const base = st.color;
    const see = st.see ? ' fill-opacity="0.45"' : '';
    const front = gap > 0 || !opaque(at(c.x, c.y, c.z + 1));
    const right = !opaque(at(c.x + 1, c.y, c.z));
    const top = !opaque(at(c.x, c.y + 1, c.z));
    const faces = [];
    if (right) faces.push([[[X + 1, Y, Z + 1], [X + 1, Y, Z], [X + 1, Y + 1, Z], [X + 1, Y + 1, Z + 1]], mix(base, 'black', 0.25)]);
    if (top) faces.push([[[X, Y + 1, Z + 1], [X + 1, Y + 1, Z + 1], [X + 1, Y + 1, Z], [X, Y + 1, Z]], mix(base, 'white', 0.28)]);
    if (front) faces.push([[[X, Y, Z + 1], [X + 1, Y, Z + 1], [X + 1, Y + 1, Z + 1], [X, Y + 1, Z + 1]], base, true]);
    for (const [q, fill, isFront] of faces) {
      body.push(poly(q, fill, see));
      if (st.frame) body.push(poly(inset(q, 0.62), mix(fill, 'black', 0.35)));
      if (st.controller && isFront) {
        body.push(poly(inset(q, 0.66), '#2b2b2b'));
        body.push(poly(inset(q, 0.38), '#ffd27a'));
      }
    }
  }

  const ann = [];
  if (gap > 0) {
    for (let z = 0; z < nz; z++) {
      const [X] = place(nx / 2, z);
      const p = tx(P(X, -0.35, 1));
      const name = z === 0 ? ' · back' : z === nz - 1 ? ' · front' : '';
      ann.push(`<text x="${p[0].toFixed(1)}" y="${(p[1] + 16).toFixed(1)}" font-size="13" font-weight="600" text-anchor="middle">Slice ${z + 1}${name}</text>`);
    }
  }
  if (opts.axes) {
    const arrow = (a, b, label, anchor, dx, dy) => {
      const A = tx(P(...a));
      const B = tx(P(...b));
      ann.push(`<line x1="${A[0].toFixed(1)}" y1="${A[1].toFixed(1)}" x2="${B[0].toFixed(1)}" y2="${B[1].toFixed(1)}" stroke="#c0392b" stroke-width="2.4" marker-end="url(#arrow)"/>`);
      const M = [(A[0] + B[0]) / 2 + dx, (A[1] + B[1]) / 2 + dy];
      label.split('\n').forEach((l, i) => ann.push(`<text x="${M[0].toFixed(1)}" y="${(M[1] + i * 16).toFixed(1)}" font-size="14" font-weight="600" fill="#c0392b" text-anchor="${anchor}">${esc(l)}</text>`));
    };
    arrow([nx + 0.7, 0, 0], [nx + 0.7, 0, nz], 'slices: first = back,\nlast = front', 'start', 14, 18);
    arrow([-0.7, 0, nz], [-0.7, ny, nz], 'rows:\nbottom → top', 'end', -10, 0);
    arrow([0, -0.8, nz + 0.3], [nx, -0.8, nz + 0.3], 'characters: left → right', 'middle', -10, 30);
  }

  const width = Math.ceil((maxX - minX) * s + pad * 2);
  let height = Math.ceil((maxY - minY) * s + pad * 2 + titleH);
  const parts = [];
  if (opts.title) parts.push(`<text x="${pad}" y="${pad + 14}" font-size="16" font-weight="700">${esc(opts.title)}</text>`);
  if (opts.caption) {
    parts.push(`<text x="${pad}" y="${height}" font-size="12" fill="#555">${esc(opts.caption)}</text>`);
    height += 18;
  }
  const W = Math.max(width, opts.legend === false ? 0 : 560);
  if (opts.legend !== false) {
    const lg = legend(desc, styles, pad, height + 4, W - pad * 2);
    parts.push(lg.svg);
    height += lg.height + 10;
  }
  return svgDoc(W, height, [...body, ...ann, ...parts].join('\n'));
}

/** The slices side by side, each drawn as seen from the front, with the legend. opts: maxWidth, title. */
export function renderSlices(desc, opts = {}) {
  const { slices, nx, ny, nz } = grid(desc);
  const styles = symbolStyles(desc);
  const maxWidth = opts.maxWidth || 980;
  const cs = Math.max(8, Math.min(24, Math.floor(300 / Math.max(nx, ny / 1.6))));
  const panelW = nx * cs;
  const panelH = ny * cs;
  const gapX = 26;
  const pad = 14;
  const titleH = opts.title ? 30 : 0;
  const hintH = 22;
  const perRow = Math.max(1, Math.floor((maxWidth - pad * 2 + gapX) / (panelW + gapX)));
  const rows = Math.ceil(nz / perRow);
  const blockH = panelH + 24 + 18;
  const parts = [];
  if (opts.title) parts.push(`<text x="${pad}" y="${pad + 14}" font-size="16" font-weight="700">${esc(opts.title)}</text>`);
  parts.push(`<text x="${pad}" y="${pad + titleH + 12}" font-size="12" fill="#555">Each slice as you see it standing in front of the controller: characters left → right, rows bottom → top.</text>`);
  for (let z = 0; z < nz; z++) {
    const col = z % perRow;
    const row = Math.floor(z / perRow);
    const x0 = pad + col * (panelW + gapX);
    const y0 = pad + titleH + hintH + row * blockH;
    const name = z === 0 ? 'back' : z === nz - 1 ? 'front' : '';
    parts.push(`<text x="${x0}" y="${y0 + 14}" font-size="12.5" font-weight="600">Slice ${z + 1}${name ? ' · ' + name : ''}</text>`);
    for (let y = 0; y < ny; y++) {
      const r = (slices[z][y] || '').padEnd(nx, ' ');
      for (let x = 0; x < nx; x++) {
        const ch = r[x];
        const st = styles[ch] || {};
        const cx = x0 + x * cs;
        const cy = y0 + 20 + (ny - 1 - y) * cs;
        const fill = ch === ' ' ? '#f3f3f3' : st.color || '#ffffff';
        parts.push(`<rect x="${cx}" y="${cy}" width="${cs}" height="${cs}" fill="${fill}" stroke="#888" stroke-width="0.6"${st.see ? ' fill-opacity="0.6"' : ''}/>`);
        if (ch !== ' ' && cs >= 13) {
          const ink = st.color ? (luminance(st.color) < 0.45 ? '#fff' : '#222') : '#999';
          parts.push(`<text x="${cx + cs / 2}" y="${cy + cs / 2 + cs * 0.2}" font-size="${(cs * 0.55).toFixed(1)}" font-family="Consolas, monospace" font-weight="700" text-anchor="middle" fill="${ink}">${esc(ch)}</text>`);
        }
      }
    }
  }
  const usedW = Math.min(nz, perRow) * (panelW + gapX) - gapX + pad * 2;
  const W = Math.max(usedW, 600);
  let height = pad + titleH + hintH + rows * blockH;
  const lg = legend(desc, styles, pad, height, W - pad * 2);
  parts.push(lg.svg);
  height += lg.height + 8;
  return svgDoc(W, height, parts.join('\n'));
}

function svgDoc(w, h, inner) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${Math.ceil(h)}" viewBox="0 0 ${w} ${Math.ceil(h)}" font-family="${FONT}">`,
    '<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
      '<path d="M0,0 L10,5 L0,10 z" fill="#c0392b"/></marker></defs>',
    `<rect width="100%" height="100%" fill="#ffffff"/>`,
    inner,
    '</svg>',
    '',
  ].join('\n');
}
