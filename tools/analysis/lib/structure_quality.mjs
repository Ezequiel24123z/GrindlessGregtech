// Shape metrics of the pack's multiblock patterns (global.grindless.structures, see lib/structure.mjs for the description
// format). Pure functions: no file access except `locate`/`eraOfStructure`, which read the startup scripts.
//
// Rules of the standard (docs/quality/structures.md): no solid or hollow mono-block boxes, enough distinct blocks, a dominant
// block share cap, functional detail. `scoreOf` turns the findings into a "boring" score (0 = fine) used to rank.
import fs from 'node:fs';
import path from 'node:path';

const FUNCTIONAL = {
  glass: /glass|window|lens|viewport/,
  pipe: /pipe|conduit|duct|tube/,
  frame: /_frame$|frame$/,
  coil: /coil|magnet|winding/,
  machine: /machine_casing|gearbox|firebox|intake|engine|turbine|rotor|filter|vent|drill|emitter|sensor|field_gen|tank|reactor|heat_?exchanger|pump|boiler|furnace|hull|computer|processor|chamber|cooler|cryo|condenser|stator|nozzle/,
};

const FUNCTION_KEYS = Object.keys(FUNCTIONAL);

function walkOptions(sym, out = []) {
  if (!sym) return out;
  if (sym.kind === 'oneOf') (sym.options || []).forEach((o) => walkOptions(o, out));
  else out.push(sym);
  return out;
}

/** Block ids a symbol stands for (frames expand to gtceu:<material>_frame); parts are reported apart. */
function symbolBlocks(sym) {
  const blocks = [];
  const parts = [];
  for (const o of walkOptions(sym)) {
    if (o.kind === 'blocks') blocks.push(...(o.blocks || []));
    else if (o.kind === 'frames') blocks.push(...(o.materials || []).map((m) => `gtceu:${m}_frame`));
    else if (o.kind === 'part') parts.push(o.ability);
  }
  return { blocks, parts };
}

// The block a symbol is displayed as in the formed machine: its first block (casing in a casing-or-hatch cell).
function primary(sym) {
  const { blocks } = symbolBlocks(sym);
  return blocks.length ? blocks[0] : null;
}

/** Metrics of one structure description. */
export function measure(desc) {
  const slices = (desc.slices || []).map((s) => s.map(String));
  const nz = slices.length;
  const ny = Math.max(0, ...slices.map((s) => s.length));
  const nx = Math.max(0, ...slices.flatMap((s) => s.map((r) => r.length)));
  const symbols = desc.symbols || {};
  const kindOf = (ch) => (ch === ' ' ? 'air' : (symbols[ch] || {}).kind || 'air');
  const solid = (ch) => !['air', 'any'].includes(kindOf(ch));

  const bySym = {};
  let cells = 0;
  let surface = 0;
  let surfaceFilled = 0;
  let interior = 0;
  let interiorFilled = 0;
  let anyCells = 0;
  const grid = [];
  slices.forEach((rows, z) => {
    for (let y = 0; y < ny; y++) {
      const row = (rows[y] || '').padEnd(nx, ' ');
      for (let x = 0; x < nx; x++) {
        const ch = row[x];
        const edge = x === 0 || y === 0 || z === 0 || x === nx - 1 || y === ny - 1 || z === nz - 1;
        const on = solid(ch);
        grid.push({ ch, edge, on });
        if (kindOf(ch) === 'any') anyCells++;
        if (edge) { surface++; if (on) surfaceFilled++; } else { interior++; if (on) interiorFilled++; }
        if (on) { cells++; bySym[ch] = (bySym[ch] || 0) + 1; }
      }
    }
  });
  const volume = nx * ny * nz;

  // distinct block ids by their displayed (primary) block, apart from the part abilities in the structure
  const primaryCells = {};
  const allBlocks = new Set();
  const abilities = new Set();
  for (const [ch, n] of Object.entries(bySym)) {
    const sym = symbols[ch];
    if (!sym || sym.kind === 'controller') continue;
    const { blocks, parts } = symbolBlocks(sym);
    blocks.forEach((b) => allBlocks.add(b));
    parts.forEach((p) => abilities.add(p));
    const p = primary(sym);
    if (p) primaryCells[p] = (primaryCells[p] || 0) + n;
  }
  const decorative = Object.values(primaryCells).reduce((a, b) => a + b, 0);
  const ranked = Object.entries(primaryCells).sort((a, b) => b[1] - a[1]);
  const dominant = ranked.length ? ranked[0] : ['', 0];
  const dominantShare = decorative ? dominant[1] / decorative : 1;
  const blockTypes = ranked.length;

  const functional = {};
  for (const k of FUNCTION_KEYS) functional[k] = [...allBlocks].some((b) => FUNCTIONAL[k].test(b.replace(/^[^:]+:/, '')));

  const fillRatio = volume ? cells / volume : 0;
  const solidCuboid = cells > 0 && cells === volume;
  const hollowBox = !solidCuboid && interior > 0 && interiorFilled === 0 && surface > 0 && surfaceFilled / surface >= 0.85;
  // a box whose whole bulk is one block, whatever the hatches in it: nearly full and nearly mono-block
  const monoBlock = fillRatio >= 0.85 && dominantShare >= 0.8;
  const shell = hollowBox || (interior > 0 && interiorFilled / interior < 0.1 && surfaceFilled / surface >= 0.85);

  return {
    bbox: [nx, ny, nz],
    volume,
    cells,
    fill: round(fillRatio),
    blockTypes,
    abilities: abilities.size,
    dominant: dominant[0],
    dominantShare: round(dominantShare),
    solidCuboid,
    hollowBox: !!shell,
    monoBlock,
    surfaceFilled: round(surface ? surfaceFilled / surface : 0),
    interiorFilled: round(interior ? interiorFilled / interior : 0),
    functional: FUNCTION_KEYS.filter((k) => functional[k]),
  };
}

function round(n) {
  return Math.round(n * 1000) / 1000;
}

/** Findings that are violations of the rubric (kept in the baseline; the gate fails only on new or worse ones). */
export function violations(m) {
  const v = [];
  if (m.solidCuboid) v.push('solid-cuboid');
  if (m.hollowBox && m.blockTypes <= 2) v.push('hollow-box');
  if (m.monoBlock && !m.solidCuboid) v.push('mono-block');
  if (m.dominantShare > 0.7 && m.cells >= 30) v.push('dominant-share');
  if (m.blockTypes < 3) v.push('few-block-types');
  if (m.functional.length < 2) v.push('no-functional-detail');
  return v;
}

/** Boring score: higher = worse. Size makes a mono-block box worse (more of the same). */
export function scoreOf(m) {
  const v = violations(m);
  let s = 0;
  if (v.includes('solid-cuboid')) s += 40;
  if (v.includes('hollow-box')) s += 30;
  if (v.includes('mono-block')) s += 25;
  if (v.includes('dominant-share')) s += Math.round((m.dominantShare - 0.7) * 100);
  if (v.includes('few-block-types')) s += 10 * (3 - m.blockTypes);
  if (v.includes('no-functional-detail')) s += 10;
  s += Math.min(20, Math.round(Math.log2(Math.max(m.cells, 1))));
  return s;
}

// ---------------------------------------------------------------------------------------------- provenance

/** Era key from the startup script path: .../grindless/<era>/file.js. */
export function eraFromPath(file) {
  const m = /startup_scripts[\\/]grindless[\\/]([^\\/]+)[\\/]/.exec(file || '');
  return m ? m[1] : 'unknown';
}

const ERA_NAME_HINTS = [
  [/^gtceu:(mega_|stellar|hyper)/, 'mega'],
  [/steam/, 'steam'],
];

function listJs(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listJs(p, out);
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}

/**
 * Where each structure is registered: scans the startup scripts for the short id (quoted, or as a name argument) and
 * returns { id: 'rel/path.js:line' }. Ids built from a template are found by their unique short name or not at all.
 */
export function locateAll(ids, packDir) {
  const root = path.join(packDir, 'kubejs', 'startup_scripts', 'grindless');
  const files = fs.existsSync(root) ? listJs(root).filter((f) => !/[\\/]lib[\\/]/.test(f)) : [];
  const texts = files.map((f) => ({ f, lines: fs.readFileSync(f, 'utf8').split(/\r?\n/) }));
  const out = {};
  for (const id of ids) {
    const short = id.replace(/^[^:]+:/, '');
    const re = new RegExp(`['"\`](?:[a-z_]+:)?${short.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`);
    let hit = null;
    const strict = /(multiblock|machine|register|\bid\b|\bname\s*:|pattern|create|\()/i;
    for (const test of [(l) => re.test(l) && strict.test(l), (l) => re.test(l) && !/^\s*\/\//.test(l)]) {
      for (const { f, lines } of texts) {
        const i = lines.findIndex(test);
        if (i >= 0) { hit = `${path.relative(packDir, f).replace(/\\/g, '/')}:${i + 1}`; break; }
      }
      if (hit) break;
    }
    out[id] = hit;
  }
  return out;
}

export function eraOf(id, where) {
  if (where) return eraFromPath(where);
  for (const [re, era] of ERA_NAME_HINTS) if (re.test(id)) return era;
  return 'unknown';
}

// ---------------------------------------------------------------------------------------------- Rhino loop-const

/**
 * `const` declared inside a for/while body. Rhino (KubeJS 1.20.1) initialises such a const once per function call and keeps
 * the first iteration's value, while Node/V8 re-initialises it each pass; so a slice generator that writes
 * `const edge = x === 0 || ...` inside its loops builds a solid block in game but a hollow shape in the T0 stand-in. Returns
 * [{ line, text }] (1-based). Heuristic on indentation, enough for the pack's code style.
 */
export function findLoopConsts(text) {
  const lines = text.split(/\r?\n/);
  const found = [];
  const stack = []; // indents of open loop headers
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l.trim() || /^\s*\/\//.test(l)) continue;
    const indent = l.length - l.trimStart().length;
    while (stack.length && indent <= stack[stack.length - 1]) stack.pop();
    if (stack.length && /^\s*const\s/.test(l)) found.push({ line: i + 1, text: l.trim() });
    if (/^\s*(for|while)\s*\(.*\)\s*\{\s*$/.test(l)) stack.push(indent);
  }
  return found;
}

export function scanLoopConsts(packDir, sub = 'startup_scripts') {
  const root = path.join(packDir, 'kubejs', sub);
  const out = [];
  if (!fs.existsSync(root)) return out;
  for (const f of listJs(root)) {
    for (const h of findLoopConsts(fs.readFileSync(f, 'utf8'))) out.push({ file: path.relative(packDir, f).replace(/\\/g, '/'), ...h });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------- report and gate

/** All structures: { id: { era, where, ...metrics, violations, score } }. */
export function analyzeAll(structures, packDir) {
  const ids = Object.keys(structures).sort();
  const where = packDir ? locateAll(ids, packDir) : {};
  const out = {};
  for (const id of ids) {
    const m = measure(structures[id]);
    out[id] = { era: eraOf(id, where[id]), where: where[id] || null, ...m, violations: violations(m), score: scoreOf(m) };
  }
  return out;
}

export const ERA_ORDER = ['steam', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'mega', 'power', 'unknown'];

/** Compact baseline entry: what the gate compares. */
export function baselineEntry(a) {
  return { v: a.violations, bt: a.blockTypes, ds: a.dominantShare, c: a.cells };
}

/**
 * Gate: a structure fails when it has a violation the baseline lacks, or the same ones with fewer block types or a higher
 * dominant share (worse), or it is new and has any violation. Structures that improved or vanished never fail.
 */
export function compare(current, baseline) {
  const problems = [];
  for (const [id, a] of Object.entries(current)) {
    const b = baseline[id];
    if (!b) {
      if (a.violations.length) problems.push(`${id}: new structure with ${a.violations.join(', ')}`);
      continue;
    }
    const fresh = a.violations.filter((x) => !b.v.includes(x));
    if (fresh.length) problems.push(`${id}: new violation ${fresh.join(', ')}`);
    else if (a.violations.length && (a.blockTypes < b.bt || a.dominantShare > b.ds + 0.02)) {
      problems.push(`${id}: worse than baseline (block types ${b.bt} -> ${a.blockTypes}, dominant share ${b.ds} -> ${a.dominantShare})`);
    }
  }
  return problems;
}

export function renderReport(analysis, { top = 25 } = {}) {
  const rows = Object.entries(analysis).map(([id, a]) => ({ id, ...a }));
  const lines = [];
  const fmt = (r) => `${r.id} | ${r.bbox.join('x')} | cells ${r.cells} | types ${r.blockTypes} | dom ${r.dominantShare} (${r.dominant}) | ${r.violations.join(',') || '-'} | score ${r.score}${r.where ? ' | ' + r.where : ''}`;
  lines.push(`structures: ${rows.length}; with violations: ${rows.filter((r) => r.violations.length).length}`);
  lines.push(`## Boring ranking (top ${top})`);
  rows.sort((a, b) => b.score - a.score).slice(0, top).forEach((r, i) => lines.push(`${i + 1}. ${fmt(r)}`));
  for (const era of ERA_ORDER) {
    const list = rows.filter((r) => r.era === era);
    if (!list.length) continue;
    lines.push(`## ${era} (${list.length}, failing ${list.filter((r) => r.violations.length).length})`);
    list.sort((a, b) => b.score - a.score).forEach((r) => lines.push(`- ${fmt(r)}`));
  }
  return lines.join('\n');
}
