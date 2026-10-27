// Deterministic KubeJS script order.
//   node tools/analysis/script-order.mjs [--check] [--strict]   verify the stamped `// priority:` headers (default)
//   node tools/analysis/script-order.mjs --write                 stamp/repair the headers (integrator only)
//   node tools/analysis/script-order.mjs --print <side>          expected load order of startup_scripts|server_scripts|client_scripts
//
// KubeJS 2001 sorts scripts only by `priority` (descending); ties keep the order of Files.walk, i.e. the filesystem's
// readdir order (NTFS collation on Windows, hash order on ext4/APFS). Every test so far ran on Windows, so the intended
// order is: band (tools/analysis/script_order.json, default 0) descending, ties in the Windows walk order. Each script
// then carries one header line `// priority: <int>` on line 1, strictly decreasing along that order, so the order no
// longer depends on the OS. The bench overlays tools/test/overlay/kubejs onto the instance, so each side is the union of
// pack/kubejs/<side> and the overlay; the shipped pack is that order restricted to pack files.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SIDES = ['startup_scripts', 'server_scripts', 'client_scripts'];
export const GAP = 100;
export const INT_MAX = 2147483647;
export const INT_MIN = -2147483648;
const ROOTS = ['pack/kubejs', 'tools/test/overlay/kubejs'];
// KubeJS ScriptFileInfo.preload: a trimmed line starting with `//` whose rest matches this is a property.
const PROPERTY = /^(\w+)\s*[:=]?\s*(-?\w+)$/;
// Keys ScriptFileInfo acts on: a stray comment with one of them changes load order or skips the script.
const LIVE_KEYS = new Set(['priority', 'ignored', 'ignore', 'packmode', 'requires']);
const HEADER = /^\/\/ priority: (-?\d+)$/;

// NTFS orders names by their upper-cased UTF-16 code units (ordinal): '.' and digits < letters < '_'.
export function ntfsKey(name) {
  let key = '';
  for (const ch of name) {
    const up = ch.toUpperCase();
    key += up.length === ch.length ? up : ch;
  }
  return key;
}
export function ntfsCompare(a, b) {
  const x = ntfsKey(a), y = ntfsKey(b);
  return x < y ? -1 : x > y ? 1 : 0;
}

// Pre-order walk of a set of relative file paths (forward slashes): a directory's entries come where it sorts.
export function walkOrder(files) {
  const tree = new Map();
  for (const f of files) {
    let node = tree;
    const parts = f.split('/');
    parts.forEach((p, i) => {
      if (i === parts.length - 1) node.set(p, null);
      else {
        if (!node.get(p)) node.set(p, new Map());
        node = node.get(p);
      }
    });
  }
  const out = [];
  const visit = (node, prefix) => {
    for (const name of [...node.keys()].sort(ntfsCompare)) {
      const child = node.get(name);
      if (child) visit(child, `${prefix}${name}/`);
      else out.push(prefix + name);
    }
  };
  visit(tree, '');
  return out;
}

export function bandOf(file, bands) {
  if (Object.hasOwn(bands, file)) return bands[file];
  let best = null;
  for (const k of Object.keys(bands)) if (k.endsWith('/') && file.startsWith(k) && (best === null || k.length > best.length)) best = k;
  return best === null ? 0 : bands[best];
}

// Intended order: band descending, ties in walk order (the sort is stable).
export function intendedOrder(files, bands) {
  return walkOrder(files)
    .map((f, i) => ({ f, i, b: bandOf(f, bands) }))
    .sort((a, b) => b.b - a.b || a.i - b.i)
    .map((x) => x.f);
}

// Header value of a file: line 1 `// priority: N`, else null.
export function readHeader(text) {
  const m = HEADER.exec(text.split(/\r?\n/, 1)[0]);
  return m ? Number(m[1]) : null;
}

// Property-pattern `//` lines after line 1 (a header's own line 1 is fine); [{line, text}]
export function hazards(text) {
  const out = [];
  text.split(/\r?\n/).forEach((l, i) => {
    if (i === 0 && HEADER.test(l)) return;
    const t = l.trim();
    const m = t.startsWith('//') ? PROPERTY.exec(t.substring(2).trim()) : null;
    if (m && LIVE_KEYS.has(m[1])) out.push({ line: i + 1, text: t });
  });
  return out;
}

// Values (or null) in intended order -> new values. Keeps the largest strictly decreasing set of existing values, fills
// the rest between the kept neighbours (step <= GAP) and widens the window only when there is no room.
export function assign(values) {
  const n = values.length;
  const cur = values.map((v) => (Number.isInteger(v) && v >= INT_MIN && v <= INT_MAX ? v : null));
  // longest strictly decreasing subsequence of the stamped values (O(n^2), n is a few hundred)
  const len = new Array(n).fill(0), prev = new Array(n).fill(-1);
  let bestEnd = -1;
  for (let i = 0; i < n; i++) {
    if (cur[i] === null) continue;
    len[i] = 1;
    for (let j = 0; j < i; j++) if (cur[j] !== null && cur[j] > cur[i] && len[j] + 1 > len[i]) { len[i] = len[j] + 1; prev[i] = j; }
    if (bestEnd < 0 || len[i] > len[bestEnd]) bestEnd = i;
  }
  const kept = new Array(n).fill(false);
  for (let i = bestEnd; i >= 0; i = prev[i]) kept[i] = true;
  const out = values.map((_, i) => (kept[i] ? cur[i] : null));
  let i = 0;
  while (i < n) {
    if (kept[i]) { i++; continue; }
    let a = i, b = i;
    while (b + 1 < n && !kept[b + 1]) b++;
    // widen over kept neighbours until the window allows a step of at least 10 (or cannot grow)
    for (;;) {
      const hi = a > 0 ? out[a - 1] : null, lo = b < n - 1 ? out[b + 1] : null;
      const k = b - a + 1;
      const step = Math.min(GAP, Math.floor(((hi ?? INT_MAX) - (lo ?? INT_MIN)) / (k + 1)));
      const canGrow = a > 0 || b < n - 1;
      if (step >= 10 || (step >= 1 && !canGrow)) {
        for (let x = 0; x < k; x++) out[a + x] = hi !== null ? hi - step * (x + 1) : lo !== null ? lo + step * (k - x) : GAP * (k - x);
        break;
      }
      if (!canGrow) throw new Error('no room for priorities');
      if (a > 0) a--;
      if (b < n - 1) b++;
    }
    for (let x = a; x <= b; x++) kept[x] = true;
    i = b + 1;
  }
  return out;
}

export function loadBands(root) {
  const p = path.join(root, 'tools/analysis/script_order.json');
  return JSON.parse(fs.readFileSync(p, 'utf8')).bands ?? {};
}

// Files of one side: relative path (from the kubejs root, e.g. server_scripts/grindless/x.js) -> [absolute paths]
export function collect(root, side) {
  const map = new Map();
  for (const r of ROOTS) {
    const base = path.join(root, r, side);
    if (!fs.existsSync(base)) continue;
    const walk = (dir, rel) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.isDirectory()) walk(path.join(dir, e.name), `${rel}${e.name}/`);
        else if (e.name.endsWith('.js')) {
          const key = rel + e.name;
          if (!map.has(key)) map.set(key, []);
          map.get(key).push({ abs: path.join(dir, e.name), root: r });
        }
      }
    };
    walk(base, `${side}/`);
  }
  return map;
}

export function plan(root, side, bands) {
  const files = collect(root, side);
  const order = intendedOrder([...files.keys()].map((f) => f.slice(side.length + 1)), bandsFor(bands, side)).map((f) => `${side}/${f}`);
  return order.map((rel) => {
    const text = fs.readFileSync(files.get(rel)[0].abs, 'utf8');
    return { rel, locs: files.get(rel), text, value: readHeader(text) };
  });
}
// Table keys are relative to the kubejs root; the walk works on side-relative paths.
function bandsFor(bands, side) {
  const out = {};
  for (const [k, v] of Object.entries(bands)) if (k.startsWith(`${side}/`)) out[k.slice(side.length + 1)] = v;
  return out;
}

export function check(root, { strict = false } = {}) {
  const bands = loadBands(root);
  const errors = [], notices = [];
  let total = 0;
  const known = new Set();
  for (const side of SIDES) {
    const items = plan(root, side, bands);
    total += items.length;
    items.forEach((it) => known.add(it.rel));
    let prev = null;
    const unstamped = [];
    for (const it of items) {
      for (const h of hazards(it.text)) errors.push(`${it.rel}:${h.line}: property-like comment "${h.text}" (KubeJS parse hazard)`);
      const m = /^\/\/ priority:\s*(-?\d+)/.exec(it.text);
      if (it.value === null) {
        if (m || /^\/\/\s*priority\b/i.test(it.text.split(/\r?\n/, 1)[0])) errors.push(`${it.rel}:1: malformed priority header`);
        else unstamped.push(it.rel);
        continue;
      }
      if (it.value > INT_MAX || it.value < INT_MIN) errors.push(`${it.rel}:1: priority ${it.value} out of int32`);
      else if (prev !== null && it.value >= prev.value) errors.push(`${it.rel}:1: priority ${it.value} breaks the order (after ${prev.rel} = ${prev.value})`);
      prev = it;
    }
    if (unstamped.length) (strict ? errors : notices).push(`${side}: ${unstamped.length} unstamped script(s), the integrator stamps them (first: ${unstamped[0]})`);
  }
  for (const k of Object.keys(bands)) {
    if (k.startsWith('_')) continue;
    const exists = k.endsWith('/') ? [...known].some((f) => f.startsWith(k)) : known.has(k);
    if (!exists) errors.push(`script_order.json: "${k}" matches no script`);
  }
  return { errors, notices, total };
}

export function write(root) {
  const bands = loadBands(root);
  let changed = 0;
  for (const side of SIDES) {
    const items = plan(root, side, bands);
    const values = assign(items.map((it) => it.value));
    items.forEach((it, i) => {
      if (it.value === values[i]) return;
      for (const loc of it.locs) {
        const text = fs.readFileSync(loc.abs, 'utf8');
        const eol = text.includes('\r\n') ? '\r\n' : '\n';
        const first = text.split(/\r?\n/, 1)[0];
        const line = `// priority: ${values[i]}`;
        const rest = /^\/\/\s*priority\s*[:=]?\s*-?\w*\s*$/.test(first) ? text.slice(first.length) : eol + text;
        fs.writeFileSync(loc.abs, line + rest);
      }
      changed++;
    });
  }
  return changed;
}

function main(argv) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const i = argv.indexOf('--print');
  if (i >= 0) {
    const bands = loadBands(root);
    for (const it of plan(root, argv[i + 1], bands)) console.log(it.rel);
    return 0;
  }
  if (argv.includes('--write')) {
    const n = write(root);
    const r = check(root);
    console.log(`script-order: stamped ${n} script(s)`);
    r.errors.slice(0, 20).forEach((e) => console.log(`FAIL ${e}`));
    return r.errors.length ? 1 : 0;
  }
  const r = check(root, { strict: argv.includes('--strict') });
  r.notices.forEach((n) => console.log(`NOTICE ${n}`));
  r.errors.slice(0, 25).forEach((e) => console.log(`FAIL ${e}`));
  if (r.errors.length > 25) console.log(`FAIL ... and ${r.errors.length - 25} more`);
  console.log(r.errors.length ? `script-order FAIL: ${r.errors.length} problem(s), run --write (integrator) or fix the table` : `ok script-order: ${r.total} scripts, deterministic order`);
  return r.errors.length ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
