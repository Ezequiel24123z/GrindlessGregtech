#!/usr/bin/env node
// Offline audit of every asset the pack ships under grindless: plus the GTM textures and sounds our machines use (Project Reforge
// RF-6A). It reads, it never writes anything but its two CSVs:
//   docs/reforge/data/06_textures.csv   one row per texture file and per texture reference that has no file
//   docs/reforge/data/06_sounds.csv     one row per sound file, per sound event and per machine
// Textures: PNGs are decoded with node:zlib; references come from the startup scripts, run in a node:vm sandbox in which every KubeJS
// or GTM binding is a stand-in that records the calls made on it (the same trick as test/assets_overlays.test.mjs). Sounds: Ogg Vorbis
// is decoded here in pure JS (the pack ships no WAV sources: the loops are AI-generated and encoded once), so levels, loop seams and
// brightness are measured on the real samples. No npm dependencies, no game, no network.
//
//   node tools/analysis/assets-audit.mjs [--out docs/reforge/data] [--pack pack] [--gtm-jar path/to/gtceu.jar] [--summary]
//
// --gtm-jar optionally checks that the gtceu: textures our scripts reference exist and measures the GTM sounds our machines fall
// back on; without it those rows say "unchecked". --summary prints the per-era and worst-30 tables the report quotes.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..', '..');

export const ERAS = ['steam', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max', 'maxplus'];

// Thresholds, stated in docs/reforge/06_assets_audit.md.
export const LIMITS = {
  recolourCorr: 0.97, recolourHue: 12, recolourSat: 0.15, recolourLum: 0.08,
  minOpaqueForRecolour: 24, overlayOpaque: 0.6, lightingInverted: -0.08, lowDetailColours: 3, eraLumZ: 3,
  soundRmsLoud: -14, soundRmsQuiet: -34, soundRelative: 4, soundPeak: -1, seamJumpRatio: 4, seamLevelDb: 3,
  soundHf: 0.45, soundCycleStrength: 0.85, soundCycleSeconds: 2, soundMinSeconds: 4, soundMaxSeconds: 12, sharedLoopControllers: 5,
};

const rel = (root, p) => path.relative(root, p).split(path.sep).join('/');
function walk(dir, ext) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, ext));
    else if (!ext || e.name.endsWith(ext)) out.push(p);
  }
  return out.sort();
}
const eraOfPath = (p) => {
  const m = /startup_scripts[\\/]grindless[\\/]([^\\/]+)/.exec(p);
  return m && ERAS.includes(m[1]) ? m[1] : m ? 'other' : 'other';
};
const eraOfAsset = (p) => {
  for (const seg of p.split(/[\\/:_]/)) if (ERAS.includes(seg)) return seg;
  return 'other';
};

// ------------------------------------------------------------------ PNG

// Decodes a PNG to RGBA. Returns { w, h, rgba } or { error }.
export function decodePng(buf) {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  if (buf.length < 33 || sig.some((b, i) => buf[i] !== b)) return { error: 'not a PNG' };
  let pos = 8, w = 0, h = 0, depth = 0, ctype = 0, interlace = 0;
  let plte = null, trns = null;
  const idat = [];
  while (pos + 8 <= buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString('latin1', pos + 4, pos + 8), data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; ctype = data[9]; interlace = data[12]; }
    else if (type === 'PLTE') plte = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (!w || !h) return { error: 'no IHDR' };
  if (interlace) return { error: 'interlaced PNG not supported' };
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ctype];
  if (!channels) return { error: `colour type ${ctype}` };
  let raw;
  try { raw = zlib.inflateSync(Buffer.concat(idat)); } catch (e) { return { error: `inflate: ${e.message}` }; }
  const bpp = Math.max(1, (channels * depth) >> 3), stride = (w * channels * depth + 7) >> 3;
  if (raw.length < (stride + 1) * h) return { error: 'truncated data' };
  const px = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, dst = y * stride;
    for (let i = 0; i < stride; i++) {
      const x = raw[src + i];
      const a = i >= bpp ? px[dst + i - bpp] : 0, b = y ? px[dst - stride + i] : 0, c = i >= bpp && y ? px[dst - stride + i - bpp] : 0;
      let v;
      if (f === 0) v = x;
      else if (f === 1) v = x + a;
      else if (f === 2) v = x + b;
      else if (f === 3) v = x + ((a + b) >> 1);
      else {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      }
      px[dst + i] = v & 255;
    }
  }
  const rgba = new Uint8Array(w * h * 4);
  const sample = (y, idx) => { // idx-th sample of row y, scaled to 0..255 for depths <8, raw for 8, high byte for 16
    if (depth === 8) return px[y * stride + idx];
    if (depth === 16) return px[y * stride + idx * 2];
    const bit = idx * depth, byte = px[y * stride + (bit >> 3)], shift = 8 - depth - (bit & 7);
    return (byte >> shift) & ((1 << depth) - 1);
  };
  const scale = depth < 8 ? 255 / ((1 << depth) - 1) : 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (ctype === 3) {
        const i = sample(y, x);
        rgba[o] = plte ? plte[i * 3] : 0; rgba[o + 1] = plte ? plte[i * 3 + 1] : 0; rgba[o + 2] = plte ? plte[i * 3 + 2] : 0;
        rgba[o + 3] = trns && i < trns.length ? trns[i] : 255;
      } else if (ctype === 0 || ctype === 4) {
        const g = Math.round(sample(y, x * channels) * scale);
        rgba[o] = rgba[o + 1] = rgba[o + 2] = g;
        rgba[o + 3] = ctype === 4 ? Math.round(sample(y, x * 2 + 1) * scale) : 255;
        if (ctype === 0 && trns && trns.length >= 2) {
          const key = depth === 16 ? trns.readUInt16BE(0) >> 8 : trns.readUInt16BE(0);
          if (Math.round(sample(y, x) * (depth < 8 ? 1 : 1)) === key) rgba[o + 3] = 0;
        }
      } else {
        for (let c = 0; c < 3; c++) rgba[o + c] = sample(y, x * channels + c);
        rgba[o + 3] = ctype === 6 ? sample(y, x * 4 + 3) : 255;
        if (ctype === 2 && trns && trns.length >= 6 && depth === 8 && rgba[o] === trns[1] && rgba[o + 1] === trns[3] && rgba[o + 2] === trns[5]) rgba[o + 3] = 0;
      }
    }
  }
  return { w, h, rgba };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  let h = 0, s = 0;
  if (d > 1e-9) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return { h, s, l };
}
const hueDiff = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

// Per-texture measures on the first frame (a strip is w wide and k*w high).
export function analysePixels(img) {
  const { w, h, rgba } = img;
  const frames = h > w && h % w === 0 ? h / w : 1, fh = frames > 1 ? w : h;
  const n = w * fh;
  const colours = new Set();
  const lum = new Float64Array(n);
  const mask = [];
  let opaque = 0, trans = 0, sumL = 0, sumX = 0, sumY = 0, sumS = 0, hueW = 0, magenta = 0, tl = 0, tlN = 0, br = 0, brN = 0, semi = 0;
  const hash = (s) => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0).toString(16); };
  const pixelBytes = [];
  for (let y = 0; y < fh; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4, a = rgba[o + 3], i = y * w + x;
      pixelBytes.push(rgba[o], rgba[o + 1], rgba[o + 2], a);
      if (a === 0) { trans++; mask.push(0); continue; }
      mask.push(1);
      if (a < 255) semi++;
      opaque++;
      const r = rgba[o], g = rgba[o + 1], b = rgba[o + 2];
      colours.add((r << 16) | (g << 8) | b);
      if ((r === 255 && g === 0 && b === 255) || (r === 0 && g === 0 && b === 0)) magenta++;
      const hs = rgbToHsl(r, g, b);
      lum[i] = hs.l; sumL += hs.l; sumS += hs.s;
      sumX += Math.cos(hs.h * Math.PI / 180) * hs.s; sumY += Math.sin(hs.h * Math.PI / 180) * hs.s; hueW += hs.s;
      if (x + y < w / 2 + fh / 2 - 1) { tl += hs.l; tlN++; } else if (x + y > w / 2 + fh / 2) { br += hs.l; brN++; }
    }
  }
  const meanL = opaque ? sumL / opaque : 0;
  let hue = hueW > 1e-9 ? Math.atan2(sumY, sumX) * 180 / Math.PI : 0;
  if (hue < 0) hue += 360;
  return {
    w, h, frames, n, opaque, opaqueFrac: n ? opaque / n : 0, transparent: trans, semi, colours: colours.size,
    lum: meanL, hue, sat: opaque ? sumS / opaque : 0, light: tlN && brN ? tl / tlN - br / brN : 0,
    magentaBlack: opaque > 0 && magenta === opaque, maskHash: hash(mask.join('')), pixelHash: hash(pixelBytes.join(',')), lumArr: lum, maskArr: mask,
  };
}

function pearson(a, b, mask) {
  let n = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) if (mask[i]) { n++; ma += a[i]; mb += b[i]; }
  if (n < 2) return 0;
  ma /= n; mb /= n;
  let sab = 0, saa = 0, sbb = 0;
  for (let i = 0; i < a.length; i++) if (mask[i]) { const x = a[i] - ma, y = b[i] - mb; sab += x * y; saa += x * x; sbb += y * y; }
  return saa < 1e-9 || sbb < 1e-9 ? 0 : sab / Math.sqrt(saa * sbb);
}

// Clusters of recolour-only textures: same silhouette, same luminance structure, a different colour (or pixel-identical).
export function clusterRecolours(stats) {
  const parent = new Map();
  const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(rb < ra ? ra : rb, rb < ra ? rb : ra); };
  const groups = new Map();
  for (const [id, s] of stats) {
    parent.set(id, id);
    if (s.opaque < LIMITS.minOpaqueForRecolour) continue;
    const key = `${s.w}x${s.h}:${s.maskHash}`;
    (groups.get(key) || groups.set(key, []).get(key)).push(id);
  }
  const identical = new Set();
  for (const ids of groups.values()) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = stats.get(ids[i]), b = stats.get(ids[j]);
        if (a.pixelHash === b.pixelHash) { union(ids[i], ids[j]); identical.add(ids[i]); identical.add(ids[j]); continue; }
        if (pearson(a.lumArr, b.lumArr, a.maskArr) < LIMITS.recolourCorr) continue;
        if (hueDiff(a.hue, b.hue) > LIMITS.recolourHue || Math.abs(a.sat - b.sat) > LIMITS.recolourSat || Math.abs(a.lum - b.lum) > LIMITS.recolourLum) union(ids[i], ids[j]);
      }
    }
  }
  const sizes = new Map();
  for (const id of parent.keys()) sizes.set(find(id), (sizes.get(find(id)) || 0) + 1);
  const out = new Map();
  for (const id of parent.keys()) { const root = find(id), size = sizes.get(root); if (size > 1) out.set(id, { cluster: root, size, identical: identical.has(id) }); }
  return out;
}

// ------------------------------------------------------------------ zip (only to read the GTM jar)

export function openZip(file) {
  const buf = fs.readFileSync(file);
  let e = buf.length - 22;
  while (e >= 0 && buf.readUInt32LE(e) !== 0x06054b50) e--;
  if (e < 0) throw new Error('not a zip');
  const count = buf.readUInt16LE(e + 10);
  let p = buf.readUInt32LE(e + 16);
  const entries = new Map();
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20), nl = buf.readUInt16LE(p + 28), el = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32), lh = buf.readUInt32LE(p + 42);
    entries.set(buf.toString('utf8', p + 46, p + 46 + nl), { method, csize, lh });
    p += 46 + nl + el + cl;
  }
  return {
    has: (n) => entries.has(n),
    read(n) {
      const en = entries.get(n);
      if (!en) return null;
      const start = en.lh + 30 + buf.readUInt16LE(en.lh + 26) + buf.readUInt16LE(en.lh + 28);
      const data = buf.subarray(start, start + en.csize);
      return en.method === 0 ? data : zlib.inflateRawSync(data);
    },
  };
}

// ------------------------------------------------------------------ the sandbox

function makeStandIns(onCall) {
  const hidden = new Set(['then', 'toJSON', 'constructor', 'prototype', '__proto__']);
  function standIn(owner) {
    return new Proxy(function () {}, {
      get(t, prop) {
        if (prop === Symbol.toPrimitive) return (hint) => (hint === 'number' ? 0 : '');
        if (typeof prop === 'symbol' || hidden.has(prop)) return undefined;
        if (prop === 'toString' || prop === 'valueOf') return () => '';
        if (prop === 'length' || prop === 'size') return 0;
        return new Proxy(function () {}, {
          apply(_t, _this, args) { onCall(owner, prop, args); return owner ? owner.proxy : standIn(null); },
          get(_t, p2) {
            if (p2 === Symbol.toPrimitive) return (hint) => (hint === 'number' ? 0 : '');
            if (typeof p2 === 'symbol' || hidden.has(p2)) return undefined;
            return standIn(null);
          },
        });
      },
      apply() { return standIn(null); },
      construct() { return standIn(null); },
      set() { return true; },
      has() { return false; },
      ownKeys() { return []; },
      getOwnPropertyDescriptor() { return undefined; },
    });
  }
  function builder(info) {
    const owner = { ...info, calls: [] };
    owner.proxy = standIn(owner);
    return owner;
  }
  return { standIn, builder };
}

function kubejsOrder(files) {
  const prio = (f) => {
    const m = /^\s*\/\/\s*priority\s*:\s*(-?\d+)/m.exec(fs.readFileSync(f, 'utf8').split('\n').slice(0, 5).join('\n'));
    return m ? Number(m[1]) : 0;
  };
  return files.map((f) => ({ f, p: prio(f) })).sort((a, b) => b.p - a.p || (a.f < b.f ? -1 : a.f > b.f ? 1 : 0)).map((x) => x.f);
}

// Runs the startup scripts; returns the builders (with every call made on them) of items, blocks, fluids, machines and recipe types,
// the sound events and every error met.
export function evaluateStartup(root, packDirName = 'pack') {
  const startup = path.join(root, packDirName, 'kubejs', 'startup_scripts', 'grindless');
  const errors = [];
  const reg = { item: [], block: [], fluid: [], machine: [], recipeType: [], soundEvent: [] };
  const registries = [];
  let currentFile = '';
  const onCall = (owner, method, args) => {
    if (!owner) return;
    owner.calls.push({ method, args });
    if (method !== 'definition') return;
    const tiers = owner.calls.filter((c) => c.method === 'tiers').flatMap((c) => c.args).filter((n) => typeof n === 'number');
    for (const fn of args) {
      if (typeof fn !== 'function') continue;
      for (const t of tiers.length ? tiers : [1]) {
        try { fn(t, owner.proxy); } catch (e) { errors.push(`${owner.file} (${owner.id} definition): ${e && e.message}`); }
      }
    }
  };
  const { standIn, builder } = makeStandIns(onCall);
  const shared = {};
  const classRefs = [];
  const genericEvents = [];
  // Java.loadClass: a ResourceLocation keeps its text, so the strings scripts build reach the builder calls; the arguments of every
  // renderer constructor are recorded (covers, models) and CoverDefinition's supplier is run once so its renderer is built.
  const javaClass = (name) => {
    const base = standIn(null);
    const isRL = /\.ResourceLocation$/.test(name);
    return new Proxy(function () {}, {
      get(_t, p) { return typeof p === 'symbol' || hidden.has(p) ? undefined : base[p]; },
      apply() { return standIn(null); },
      construct(_t, args) {
        if (isRL) {
          const text = args.length > 1 ? `${args[0]}:${args[1]}` : String(args[0]);
          return { __rl: text, toString: () => text };
        }
        if (/Renderer$/.test(name)) classRefs.push({ cls: name, file: currentFile, args: args.map(textOf).filter((s) => typeof s === 'string') });
        if (/\.CoverDefinition$/.test(name)) {
          const fns = args.filter((a) => typeof a === 'function');
          const last = fns[fns.length - 1];
          if (last) { try { last(); } catch (e) { errors.push(`${currentFile} (CoverDefinition renderer): ${e && e.message}`); } }
        }
        return standIn(null);
      },
    });
  };
  const hidden = new Set(['then', 'toJSON', 'constructor', 'prototype', '__proto__']);
  const textOf = (a) => (a && typeof a === 'object' && typeof a.__rl === 'string' ? a.__rl : a);

  const context = vm.createContext({ console: { log() {}, info() {}, warn() {}, error() {}, debug() {} } });
  const realGlobals = vm.runInContext('globalThis', context);
  const gameFile = (p) => path.join(root, packDirName, ...String(p).split(/[\\/]/));
  const bindings = {
    global: shared,
    Java: new Proxy({ loadClass: (name) => javaClass(String(name)) }, { get: (t, p) => (p in t ? t[p] : standIn(null)[p]) }),
    ForgeModEvents: { onGenericEvent(_a, _b, fn) { if (typeof fn === 'function') genericEvents.push({ fn, file: currentFile }); }, onEvent() {} },
    GTSoundEntries: new Proxy({}, { get: (_t, n) => (typeof n === 'string' ? { __gtSound: n } : undefined) }),
    JsonIO: {
      readJson(p) { const f = gameFile(p); return fs.existsSync(f) ? { text: fs.readFileSync(f, 'utf8') } : null; },
      toPrettyString(json) { return json && typeof json.text === 'string' ? json.text : JSON.stringify(json); },
      read(p) {
        const f = gameFile(p);
        if (!fs.existsSync(f)) return null;
        const obj = JSON.parse(fs.readFileSync(f, 'utf8'));
        return Object.assign(obj, { get: (k) => obj[k] });
      },
      write() {},
    },
    GTCEuStartupEvents: {
      registry(type, cb) { registries.push({ type: String(type), cb, file: currentFile }); },
      materialModification() {}, materialModifications() {}, craftingComponents() {}, oreVeins() {}, fluidVeins() {}, bedrockOreVeins() {},
    },
    StartupEvents: { registry(type, cb) { registries.push({ type: String(type), cb, file: currentFile }); }, init() {}, postInit() {} },
    ClientEvents: { lang() {} },
  };
  const scope = new Proxy({}, {
    has: (_t, name) => typeof name === 'string',
    get(_t, name) {
      if (name === Symbol.unscopables || typeof name === 'symbol') return undefined;
      if (Object.prototype.hasOwnProperty.call(bindings, name)) return bindings[name];
      if (name in realGlobals) return realGlobals[name];
      bindings[name] = standIn(null);
      return bindings[name];
    },
    set(_t, name, value) { bindings[name] = value; return true; },
  });
  context.__scope = scope;
  for (const file of kubejsOrder(walk(startup, '.js'))) {
    currentFile = rel(root, file);
    try { vm.runInContext(`with (__scope) {\n${fs.readFileSync(file, 'utf8')}\n}`, context, { filename: file }); } catch (e) { errors.push(`${currentFile}: ${e && e.message}`); }
  }
  const order = ['gtceu:element', 'gtceu:material', 'gtceu:recipe_category', 'gtceu:recipe_type', 'block', 'item', 'fluid', 'gtceu:machine'];
  const rank = (t) => (order.includes(t) ? order.indexOf(t) : order.length);
  const bucket = { item: 'item', block: 'block', fluid: 'fluid', 'gtceu:machine': 'machine', 'gtceu:recipe_type': 'recipeType', sound_event: 'soundEvent' };
  for (const r of registries.slice().sort((a, b) => rank(a.type) - rank(b.type))) {
    const list = reg[bucket[r.type]];
    const event = list
      ? {
        create(id, type) {
          const b = builder({ id: String(id), type: type === undefined ? 'default' : String(type), file: r.file, era: eraOfPath(r.file) });
          list.push(b);
          return b.proxy;
        },
      }
      : standIn(null);
    try { r.cb(event); } catch (e) { errors.push(`${r.file} (${r.type} registry): ${e && e.message}`); }
  }
  for (const ev of genericEvents) {
    currentFile = ev.file;
    try { ev.fn(standIn(null)); } catch (e) { errors.push(`${ev.file} (generic event): ${e && e.message}`); }
  }
  return { ...reg, classRefs: classRefs.map((c) => ({ ...c, era: eraOfPath(c.file) })), errors };
}

// ------------------------------------------------------------------ texture references

const nsPath = (rl, def = 'grindless') => { const i = rl.indexOf(':'); return i < 0 ? [def, rl] : [rl.slice(0, i), rl.slice(i + 1)]; };
const textOfArg = (a) => (a && typeof a === 'object' && typeof a.__rl === 'string' ? a.__rl : a);
const strings = (args) => args.map(textOfArg).filter((a) => typeof a === 'string');
const baseMethod = (m) => String(m).replace(/\(.*$/, '');
const looksTexture = (s) => /^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(s) && /\/(item|block|fluid|entity|gui)\/|^[a-z]+:(item|block|fluid)\//.test(s);

// One list of { ref, owner, kind, era, file } for the assets the registrations point at.
export function collectReferences(startup, assetsDir, { root = ROOT, startupDir = null } = {}) {
  const refs = [];
  const modelTextures = (modelRl) => {
    const [ns, p] = nsPath(modelRl);
    const f = path.join(assetsDir, ns, 'models', ...p.split('/')) + '.json';
    if (!fs.existsSync(f)) return null;
    try { const j = JSON.parse(fs.readFileSync(f, 'utf8')); return Object.values(j.textures || {}).filter((v) => typeof v === 'string' && !v.startsWith('#')); } catch { return []; }
  };
  const add = (b, kind, ref, extra = {}) => refs.push({ ref, owner: b.id, kind, era: b.era, file: b.file, ...extra });
  for (const kind of ['item', 'block']) {
    for (const b of startup[kind]) {
      const explicit = [];
      let modelFound = false;
      for (const c of b.calls) {
        if (!/texture|model/i.test(c.method)) continue;
        for (const s of strings(c.args)) {
          if (/model/i.test(c.method) && !/texture/i.test(c.method)) {
            const t = modelTextures(s);
            if (t) { modelFound = true; t.forEach((x) => explicit.push(x)); }
          }
          if (looksTexture(s)) explicit.push(s);
        }
      }
      const local = nsPath(b.id)[1];
      if (explicit.length === 0 && !modelFound) add(b, kind, `grindless:${kind}/${local}`, { implicit: true });
      for (const e of new Set(explicit)) add(b, kind, e);
    }
  }
  for (const b of startup.fluid) {
    const explicit = [];
    for (const c of b.calls) if (/texture/i.test(c.method)) strings(c.args).filter(looksTexture).forEach((s) => explicit.push(s));
    if (!explicit.length) refs.push({ ref: '', owner: b.id, kind: 'fluid', era: b.era, file: b.file, tintOnly: true });
    for (const e of new Set(explicit)) add(b, 'fluid', e);
  }
  for (const b of startup.machine) {
    for (const c of b.calls) {
      if (!/(Model|Renderer)$/.test(baseMethod(c.method))) continue;
      const ss = strings(c.args);
      if (!ss.length) continue;
      ss.slice(0, -1).forEach((s) => add(b, 'machine_base', s));
      add(b, b.type === 'multiblock' ? 'overlay_multiblock' : 'overlay_machine', ss[ss.length - 1]);
    }
  }
  // renderers built outside a registration (covers): the textures their constructors name
  for (const c of startup.classRefs || []) {
    for (const s of c.args.filter(looksTexture)) refs.push({ ref: s, owner: c.cls.split('.').pop(), kind: 'renderer', era: c.era, file: c.file });
  }
  // a model call's literal texture paths in branches the sandbox does not take (the plant or the tether in Io orbit)
  const seen = new Set(refs.map((r) => r.ref));
  for (const f of startupDir ? walk(startupDir, '.js') : []) {
    const text = fs.readFileSync(f, 'utf8');
    for (const m of text.matchAll(/\.\w*Model\(\s*'([a-z0-9_.-]+:[a-z0-9_./-]+)'\s*(?:,\s*'([a-z0-9_.-]+:[a-z0-9_./-]+)')?\s*\)/g)) {
      const ref = m[2] || m[1];
      if (seen.has(ref) || !looksTexture(ref)) continue;
      seen.add(ref);
      const file = rel(root, f);
      refs.push({ ref, owner: 'literal', kind: 'overlay_multiblock', era: eraOfPath(file), file });
    }
  }
  return refs;
}

// ------------------------------------------------------------------ the texture audit

export function auditTextures({ root = ROOT, packDir = 'pack', gtmJar = null, startup = null } = {}) {
  const assetsDir = path.join(root, packDir, 'kubejs', 'assets');
  startup = startup || evaluateStartup(root, packDir);
  const refs = collectReferences(startup, assetsDir, { root, startupDir: path.join(root, packDir, 'kubejs', 'startup_scripts', 'grindless') });
  const zip = gtmJar ? openZip(gtmJar) : null;
  const files = walk(assetsDir, '.png').filter((f) => /[\\/]textures[\\/]/.test(f));
  const rlOf = (f) => {
    const r = path.relative(assetsDir, f).split(path.sep);
    return `${r[0]}:${r.slice(2).join('/').replace(/\.png$/, '')}`;
  };
  const fileOf = (rl) => { const [ns, p] = nsPath(rl); return path.join(assetsDir, ns, 'textures', ...p.split('/')) + '.png'; };
  const rows = new Map();
  const stats = new Map();
  for (const f of files) {
    const rl = rlOf(f);
    const dec = decodePng(fs.readFileSync(f));
    const row = { path: rl, file: rel(root, f), kind: 'file', era: eraOfAsset(rl), owner: '', refs: 0, exists: true, categories: new Set(), detail: [], w: 0, h: 0, frames: 1 };
    if (dec.error) { row.categories.add('inconsistent'); row.detail.push(`undecodable: ${dec.error}`); } else {
      const s = analysePixels(dec);
      Object.assign(row, { w: s.w, h: s.h, frames: s.frames, opaque: +s.opaqueFrac.toFixed(3), colours: s.colours, lum: +s.lum.toFixed(3), hue: Math.round(s.hue), sat: +s.sat.toFixed(3), light: +s.light.toFixed(3), maskHash: s.maskHash });
      stats.set(rl, s);
    }
    rows.set(rl, row);
  }
  // references
  const ownerEra = new Map();
  const missing = [];
  for (const r of refs) {
    if (r.tintOnly) { missing.push({ ...r, tint: true }); continue; }
    const [ns] = nsPath(r.ref);
    if (r.kind === 'overlay_multiblock' || r.kind === 'overlay_machine') {
      const dir = path.dirname(fileOf(`${r.ref}/x`));
      const have = fs.existsSync(dir) ? fs.readdirSync(dir).filter((n) => n.endsWith('.png')) : [];
      const need = r.kind === 'overlay_multiblock' ? ['overlay_front', 'overlay_front_active'] : [];
      const lacks = need.filter((n) => !have.includes(`${n}.png`));
      if (ns !== 'grindless') { missing.push({ ...r, external: true }); continue; }
      if (r.kind === 'overlay_machine' && !have.some((n) => n.startsWith('overlay_'))) lacks.push('overlay_*');
      for (const l of lacks) missing.push({ ...r, ref: `${r.ref}/${l}` });
      for (const n of have) {
        const row = rows.get(`${r.ref}/${n.replace(/\.png$/, '')}`);
        if (row) { row.refs++; row.owner = row.owner || r.owner; row.era = r.era !== 'other' ? r.era : row.era; row.kind = r.kind; }
      }
      continue;
    }
    if (ns !== 'grindless') { missing.push({ ...r, external: true }); continue; }
    const row = rows.get(r.ref);
    if (!row) { missing.push(r); continue; }
    row.refs++;
    if (!row.owner) { row.owner = r.owner; ownerEra.set(r.ref, r.era); row.kind = r.kind; if (r.era !== 'other') row.era = r.era; }
  }
  // hand-written models also reference textures
  for (const f of walk(path.join(assetsDir, 'grindless', 'models'), '.json')) {
    try {
      const j = JSON.parse(fs.readFileSync(f, 'utf8'));
      for (const v of Object.values(j.textures || {})) if (typeof v === 'string' && rows.has(v)) { const row = rows.get(v); row.refs++; row.owner = row.owner || `model:${rel(assetsDir, f)}`; }
    } catch { /* ignore unparsable */ }
  }
  // JSON that names a texture by its full path (sky renderers) also references it
  for (const f of walk(path.join(assetsDir, 'grindless'), '.json')) {
    if (/[\\/]models[\\/]/.test(f)) continue;
    let text = '';
    try { text = fs.readFileSync(f, 'utf8'); } catch { continue; }
    for (const m of text.matchAll(/"([a-z0-9_.-]+):textures\/([a-z0-9_./-]+)\.png"/g)) {
      const row = rows.get(`${m[1]}:${m[2]}`);
      if (row) { row.refs++; row.owner = row.owner || `json:${rel(assetsDir, f)}`; }
    }
  }
  // per-file categories
  const clusters = clusterRecolours(stats);
  const eraLum = new Map();
  for (const [rl, s] of stats) { const k = `${rows.get(rl).era}`; (eraLum.get(k) || eraLum.set(k, []).get(k)).push(s.lum); }
  const eraStat = new Map();
  for (const [k, v] of eraLum) { const m = v.reduce((a, b) => a + b, 0) / v.length; eraStat.set(k, { m, sd: Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length) || 1, n: v.length }); }
  for (const [rl, row] of rows) {
    const s = stats.get(rl);
    if (row.kind === 'file' && row.refs === 0) { row.categories.add('orphan'); row.detail.push('no registration or model references it'); }
    if (!s) continue;
    const isOverlay = /overlay_/.test(rl);
    if (s.opaque === 0) { row.categories.add('placeholder'); row.detail.push('fully transparent'); }
    else if (s.magentaBlack) { row.categories.add('placeholder'); row.detail.push('magenta/black'); }
    else if (s.colours === 1 && s.opaqueFrac > 0.9 && !isOverlay) { row.categories.add('placeholder'); row.detail.push('single flat colour'); }
    const strip = s.w === 16 && s.frames > 1;
    if (!isOverlay && !strip && (s.w !== 16 || s.h !== 16) && !/^grindless:(gui|entity)/.test(rl)) { row.categories.add('inconsistent'); row.detail.push(`size ${s.w}x${s.h}`); }
    if (s.frames > 1 && !fs.existsSync(`${fileOf(rl)}.mcmeta`)) { row.categories.add('inconsistent'); row.detail.push('animated strip without .mcmeta'); }
    if (isOverlay && !/_active/.test(rl) && s.opaqueFrac > LIMITS.overlayOpaque) { row.categories.add('inconsistent'); row.detail.push(`overlay ${(s.opaqueFrac * 100) | 0}% opaque`); }
    if (!isOverlay && s.opaque >= 40 && s.light < LIMITS.lightingInverted) { row.categories.add('inconsistent'); row.detail.push(`lit from the bottom-right (${s.light.toFixed(2)})`); }
    if (!isOverlay && s.colours > 1 && s.colours <= LIMITS.lowDetailColours && s.opaque >= 40) { row.categories.add('inconsistent'); row.detail.push(`only ${s.colours} colours`); }
    const es = eraStat.get(row.era);
    if (!isOverlay && es && es.n >= 30 && Math.abs(s.lum - es.m) / es.sd > LIMITS.eraLumZ) { row.categories.add('inconsistent'); row.detail.push(`luminance outlier for ${row.era} (${s.lum.toFixed(2)} vs ${es.m.toFixed(2)})`); }
    const cl = clusters.get(rl);
    if (cl) { row.categories.add('recolour'); row.cluster = cl.cluster; row.clusterSize = cl.size; row.detail.push(cl.identical ? `identical to ${cl.size - 1} other` : `recolour of ${cl.size - 1} other`); }
  }
  const out = [...rows.values()];
  for (const m of missing) {
    const external = m.external, tint = m.tint;
    let exists = null;
    if (external) {
      const [ns, p] = nsPath(m.ref);
      if (m.kind.startsWith('overlay')) exists = null;
      else if (ns === 'gtceu' && zip) exists = zip.has(`assets/gtceu/textures/${p}.png`);
    }
    const row = { path: m.ref, file: '', kind: m.kind, era: m.era, owner: m.owner, refs: 1, exists: external ? (exists === null ? 'unchecked' : exists) : false, categories: new Set(), detail: [], w: 0, h: 0, frames: 0, registrant: m.file };
    if (tint) { row.categories.add('placeholder'); row.detail.push('fluid with no own texture (tint only)'); }
    else if (external) { row.categories.add('external'); if (exists === false) { row.categories.add('missing'); row.detail.push('gtceu texture not in the jar'); } }
    else { row.categories.add('missing'); row.detail.push(m.implicit ? 'default texture path has no file' : 'referenced texture has no file'); }
    out.push(row);
  }
  for (const r of out) { r.categories = [...r.categories].sort(); }
  out.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : a.owner < b.owner ? -1 : 1));
  return { rows: out, errors: startup.errors, startup };
}

// ------------------------------------------------------------------ Ogg Vorbis

class Bits {
  constructor(buf) { this.b = buf; this.pos = 0; this.eof = false; }
  read(n) {
    let v = 0;
    for (let i = 0; i < n; i++) {
      const byte = this.pos >> 3;
      if (byte >= this.b.length) { this.eof = true; this.pos++; continue; }
      v += ((this.b[byte] >> (this.pos & 7)) & 1) * 2 ** i;
      this.pos++;
    }
    return v;
  }
}
const ilog = (x) => { let n = 0; while (x > 0) { n++; x = Math.floor(x / 2); } return n; };
function f32(x) { const m = x % 2097152, s = x >= 2147483648, e = Math.floor((x % 2147483648) / 2097152); const v = m * 2 ** (e - 788); return s ? -v : v; }

export function oggPackets(buf) {
  const packets = [];
  let cur = [], pos = 0, lastGranule = 0;
  while (pos + 27 <= buf.length && buf.toString('latin1', pos, pos + 4) === 'OggS') {
    const nseg = buf[pos + 26], gran = buf.readUInt32LE(pos + 6) + buf.readUInt32LE(pos + 10) * 4294967296;
    if (gran > 0 && gran < 2 ** 52) lastGranule = gran;
    let p = pos + 27 + nseg;
    for (let i = 0; i < nseg; i++) {
      const l = buf[pos + 27 + i];
      cur.push(buf.subarray(p, p + l)); p += l;
      if (l < 255) { packets.push(Buffer.concat(cur)); cur = []; }
    }
    pos = p;
  }
  return { packets, lastGranule };
}

function makeFft(n) {
  const cos = new Float64Array(n / 2), sin = new Float64Array(n / 2), rev = new Uint32Array(n);
  for (let i = 0; i < n / 2; i++) { cos[i] = Math.cos(2 * Math.PI * i / n); sin[i] = Math.sin(2 * Math.PI * i / n); }
  const bits = Math.log2(n);
  for (let i = 0; i < n; i++) { let r = 0; for (let b = 0; b < bits; b++) if (i & (1 << b)) r |= 1 << (bits - 1 - b); rev[i] = r; }
  // in place, exponent sign +i (the inverse direction, unnormalised)
  return (re, im) => {
    for (let i = 0; i < n; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (let size = 2; size <= n; size <<= 1) {
      const half = size >> 1, step = n / size;
      for (let i = 0; i < n; i += size) {
        for (let j = 0, k = 0; j < half; j++, k += step) {
          const a = i + j, b = a + half, tr = re[b] * cos[k] - im[b] * sin[k], ti = re[b] * sin[k] + im[b] * cos[k];
          re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        }
      }
    }
  };
}
const fftCache = new Map();
const fftOf = (n) => fftCache.get(n) || fftCache.set(n, makeFft(n)).get(n);

const INVERSE_DB = (() => { const t = new Float64Array(256), k = Math.log(1 / 1.0649863e-7) / 255; for (let i = 0; i < 256; i++) t[i] = 1.0649863e-7 * Math.exp(k * i); return t; })();

function parseSetup(buf, channels) {
  const br = new Bits(buf);
  br.read(56); // 0x05 + "vorbis"
  const books = [];
  const nbooks = br.read(8) + 1;
  for (let b = 0; b < nbooks; b++) {
    if (br.read(24) !== 0x564342) throw new Error('bad codebook sync');
    const dim = br.read(16), entries = br.read(24), ordered = br.read(1);
    const len = new Array(entries).fill(0);
    if (!ordered) {
      const sparse = br.read(1);
      for (let i = 0; i < entries; i++) len[i] = sparse ? (br.read(1) ? br.read(5) + 1 : 0) : br.read(5) + 1;
    } else {
      let cur = br.read(5) + 1, i = 0;
      while (i < entries) { const n = br.read(ilog(entries - i)); for (let j = 0; j < n && i + j < entries; j++) len[i + j] = cur; cur++; i += n; }
    }
    const root = {};
    for (let i = 0; i < entries; i++) {
      if (!len[i]) continue;
      const place = (node, depth) => {
        if (depth === len[i]) { if (node.e === undefined && !node[0] && !node[1]) { node.e = i; return true; } return false; }
        if (node.e !== undefined) return false;
        for (const bit of [0, 1]) { node[bit] = node[bit] || {}; if (place(node[bit], depth + 1)) return true; }
        return false;
      };
      place(root, 0);
    }
    const lookup = br.read(4);
    let min = 0, delta = 0, vbits = 0, seq = 0, mult = [], lv = 0;
    if (lookup === 1 || lookup === 2) {
      min = f32(br.read(32)); delta = f32(br.read(32)); vbits = br.read(4) + 1; seq = br.read(1);
      if (lookup === 1) { lv = 0; while (Math.pow(lv + 1, dim) <= entries) lv++; } else lv = entries * dim;
      for (let i = 0; i < lv; i++) mult.push(br.read(vbits));
    }
    const cache = new Map();
    const vec = (idx) => {
      if (cache.has(idx)) return cache.get(idx);
      const v = new Float64Array(dim);
      let last = 0;
      for (let j = 0; j < dim; j++) {
        const m = lookup === 1 ? mult[Math.floor(idx / Math.pow(lv, j)) % lv] : mult[idx * dim + j];
        v[j] = m * delta + min + last;
        if (seq) last = v[j];
      }
      cache.set(idx, v);
      return v;
    };
    books.push({ dim, root, lookup, vec });
  }
  const ntime = br.read(6) + 1;
  for (let i = 0; i < ntime; i++) br.read(16);
  const floors = [];
  const nfloors = br.read(6) + 1;
  for (let i = 0; i < nfloors; i++) {
    if (br.read(16) !== 1) throw new Error('floor type 0 not supported');
    const nparts = br.read(5), classes = [];
    let maxc = -1;
    for (let p = 0; p < nparts; p++) { classes.push(br.read(4)); maxc = Math.max(maxc, classes[p]); }
    const cls = [];
    for (let c = 0; c <= maxc; c++) {
      const dim = br.read(3) + 1, sub = br.read(2), master = sub ? br.read(8) : -1, books2 = [];
      for (let k = 0; k < (1 << sub); k++) books2.push(br.read(8) - 1);
      cls.push({ dim, sub, master, books: books2 });
    }
    const mult = br.read(2) + 1, rbits = br.read(4);
    const xs = [0, 1 << rbits];
    for (let p = 0; p < nparts; p++) for (let j = 0; j < cls[classes[p]].dim; j++) xs.push(br.read(rbits));
    const order = xs.map((_, i) => i).sort((a, b) => xs[a] - xs[b] || a - b);
    const lo = [], hi = [];
    for (let k = 2; k < xs.length; k++) {
      let l = 0, h = 1;
      for (let j = 0; j < k; j++) { if (xs[j] < xs[k] && xs[j] > xs[l]) l = j; if (xs[j] > xs[k] && xs[j] < xs[h]) h = j; }
      lo[k] = l; hi[k] = h;
    }
    floors.push({ classes, cls, mult, rbits, xs, order, lo, hi });
  }
  const residues = [];
  const nres = br.read(6) + 1;
  for (let i = 0; i < nres; i++) {
    const type = br.read(16), begin = br.read(24), end = br.read(24), psize = br.read(24) + 1, ncls = br.read(6) + 1, cbook = br.read(8);
    const casc = [];
    for (let c = 0; c < ncls; c++) { const low = br.read(3), high = br.read(1) ? br.read(5) : 0; casc.push(high * 8 + low); }
    const rb = casc.map((cv) => { const a = []; for (let j = 0; j < 8; j++) a.push(cv & (1 << j) ? br.read(8) : -1); return a; });
    residues.push({ type, begin, end, psize, ncls, cbook, books: rb });
  }
  const mappings = [];
  const nmap = br.read(6) + 1;
  for (let i = 0; i < nmap; i++) {
    br.read(16);
    const nsub = br.read(1) ? br.read(4) + 1 : 1, coupling = [];
    if (br.read(1)) { const steps = br.read(8) + 1; for (let s = 0; s < steps; s++) coupling.push([br.read(ilog(channels - 1)), br.read(ilog(channels - 1))]); }
    br.read(2);
    const mux = [];
    if (nsub > 1) for (let c = 0; c < channels; c++) mux.push(br.read(4)); else for (let c = 0; c < channels; c++) mux.push(0);
    const subs = [];
    for (let s = 0; s < nsub; s++) { br.read(8); subs.push({ floor: br.read(8), residue: br.read(8) }); }
    mappings.push({ coupling, mux, subs });
  }
  const modes = [];
  const nmodes = br.read(6) + 1;
  for (let i = 0; i < nmodes; i++) { const flag = br.read(1); br.read(16); br.read(16); modes.push({ flag, mapping: br.read(8) }); }
  return { books, floors, residues, mappings, modes };
}

function huff(br, book) {
  let node = book.root;
  while (node.e === undefined) { node = node[br.read(1)]; if (!node || br.eof) return -1; }
  return node.e;
}

function floorDecode(br, fl, books, n2) {
  if (!br.read(1)) return null;
  const range = [256, 128, 86, 64][fl.mult - 1], bits = ilog(range - 1);
  const y = [br.read(bits), br.read(bits)];
  let off = 2;
  for (const cidx of fl.classes) {
    const c = fl.cls[cidx];
    let cval = 0;
    const csub = (1 << c.sub) - 1;
    if (c.sub) cval = huff(br, books[c.master]);
    for (let j = 0; j < c.dim; j++) {
      const bk = c.books[cval & csub];
      cval >>= c.sub;
      y[off + j] = bk >= 0 ? huff(br, books[bk]) : 0;
    }
    off += c.dim;
  }
  const rp = (x0, y0, x1, y1, x) => { const dy = y1 - y0, adx = x1 - x0, off2 = Math.trunc(Math.abs(dy) * (x - x0) / adx); return dy < 0 ? y0 - off2 : y0 + off2; };
  const fy = new Array(y.length), s2 = new Array(y.length).fill(false);
  fy[0] = y[0]; fy[1] = y[1]; s2[0] = s2[1] = true;
  for (let i = 2; i < y.length; i++) {
    const lo = fl.lo[i], hi = fl.hi[i], pred = rp(fl.xs[lo], fy[lo], fl.xs[hi], fy[hi], fl.xs[i]), v = y[i];
    const highroom = range - pred, lowroom = pred, room = (highroom < lowroom ? highroom : lowroom) * 2;
    if (v) {
      s2[lo] = s2[hi] = s2[i] = true;
      if (v >= room) fy[i] = highroom > lowroom ? v - lowroom + pred : pred - v + highroom - 1;
      else fy[i] = v & 1 ? pred - ((v + 1) >> 1) : pred + (v >> 1);
    } else { s2[i] = false; fy[i] = pred; }
  }
  const out = new Float64Array(n2);
  let lx = 0, ly = fy[fl.order[0]] * fl.mult;
  const line = (x0, y0, x1, y1) => {
    const dy = y1 - y0, adx = x1 - x0, base = Math.trunc(dy / adx), sy = dy < 0 ? base - 1 : base + 1;
    const ady = Math.abs(dy) - Math.abs(base) * adx;
    let yy = y0, err = 0;
    if (x0 < n2) out[x0] = INVERSE_DB[Math.max(0, Math.min(255, yy))];
    for (let x = x0 + 1; x < Math.min(x1, n2); x++) {
      err += ady;
      if (err >= adx) { err -= adx; yy += sy; } else yy += base;
      out[x] = INVERSE_DB[Math.max(0, Math.min(255, yy))];
    }
  };
  let hx = 0, hy = ly;
  for (let k = 1; k < fl.order.length; k++) {
    const i = fl.order[k];
    if (!s2[i]) continue;
    hy = fy[i] * fl.mult; hx = fl.xs[i];
    if (hx > lx) line(lx, ly, hx, hy);
    lx = hx; ly = hy;
  }
  for (let x = hx; x < n2; x++) out[x] = INVERSE_DB[Math.max(0, Math.min(255, hy))];
  return out;
}

function residueDecode(br, res, books, vecs, skip, n2) {
  const ch = vecs.length, type2 = res.type === 2;
  const size = type2 ? n2 * ch : n2;
  const begin = Math.min(res.begin, size), end = Math.min(res.end, size);
  const toRead = end - begin, parts = Math.floor(toRead / res.psize);
  if (toRead <= 0) return;
  const target = type2 ? [new Float64Array(size)] : vecs;
  if (type2 && skip.every(Boolean)) return;
  const cb = books[res.cbook], cw = cb.dim;
  const classes = target.map(() => new Array(parts + cw).fill(0));
  for (let pass = 0; pass < 8; pass++) {
    let pc = 0;
    while (pc < parts) {
      if (pass === 0) {
        for (let j = 0; j < target.length; j++) {
          let t = huff(br, cb);
          if (t < 0) return;
          for (let i = cw - 1; i >= 0; i--) { classes[j][pc + i] = t % res.ncls; t = Math.floor(t / res.ncls); }
        }
      }
      for (let i = 0; i < cw && pc < parts; i++, pc++) {
        for (let j = 0; j < target.length; j++) {
          if (!type2 && skip[j]) continue;
          const bk = res.books[classes[j][pc]][pass];
          if (bk < 0) continue;
          const book = books[bk], off = begin + pc * res.psize;
          if (res.type === 0) {
            const step = res.psize / book.dim;
            for (let k = 0; k < step; k++) { const e = huff(br, book); if (e < 0) return; const v = book.vec(e); for (let d = 0; d < book.dim; d++) target[j][off + k + d * step] += v[d]; }
          } else {
            for (let k = 0; k < res.psize; k += book.dim) { const e = huff(br, book); if (e < 0) return; const v = book.vec(e); for (let d = 0; d < book.dim; d++) target[j][off + k + d] += v[d]; }
          }
        }
      }
    }
  }
  if (type2) for (let c = 0; c < ch; c++) for (let i = 0; i < n2; i++) vecs[c][i] = target[0][i * ch + c];
}

function imdct(coef, n) {
  const re = new Float64Array(n), im = new Float64Array(n), n0 = 0.5 + n / 4;
  for (let k = 0; k < n / 2; k++) { const a = 2 * Math.PI * n0 * k / n; re[k] = coef[k] * Math.cos(a); im[k] = coef[k] * Math.sin(a); }
  fftOf(n)(re, im);
  const y = new Float64Array(n);
  for (let m = 0; m < n; m++) { const a = Math.PI * (m + n0) / n; y[m] = re[m] * Math.cos(a) - im[m] * Math.sin(a); }
  return y;
}

// Decodes an Ogg Vorbis file to Float32 samples of channel 0. Returns { rate, channels, samples } or throws.
export function decodeVorbis(buf) {
  const { packets, lastGranule } = oggPackets(buf);
  if (packets.length < 4) throw new Error('not enough packets');
  const id = packets[0];
  if (id[0] !== 1 || id.toString('latin1', 1, 7) !== 'vorbis') throw new Error('not Vorbis');
  const channels = id[11], rate = id.readUInt32LE(12), bs0 = 1 << (id[28] & 15), bs1 = 1 << (id[28] >> 4);
  const setup = parseSetup(packets[2], channels);
  const modeBits = ilog(setup.modes.length - 1);
  const windows = new Map();
  const windowOf = (n, flag, prev, next) => {
    const key = `${n}:${flag}:${prev}:${next}`;
    if (windows.has(key)) return windows.get(key);
    const w = new Float64Array(n);
    const ls = flag && !prev ? n / 4 - bs0 / 4 : 0, le = flag && !prev ? n / 4 + bs0 / 4 : n / 2, ln = le - ls;
    const rs = flag && !next ? (3 * n) / 4 - bs0 / 4 : n / 2, re = flag && !next ? (3 * n) / 4 + bs0 / 4 : n, rn = re - rs;
    for (let i = 0; i < n; i++) {
      if (i < ls) w[i] = 0;
      else if (i < le) w[i] = Math.sin(Math.PI / 2 * Math.sin((i - ls + 0.5) / ln * Math.PI / 2) ** 2);
      else if (i < rs) w[i] = 1;
      else if (i < re) w[i] = Math.sin(Math.PI / 2 * Math.sin((i - rs + 0.5) / rn * Math.PI / 2 + Math.PI / 2) ** 2);
      else w[i] = 0;
    }
    windows.set(key, w);
    return w;
  };
  let prevN = 0, start = 0, total = 0, first = true;
  const chunks = [];
  for (let pi = 3; pi < packets.length; pi++) {
    const br = new Bits(packets[pi]);
    if (br.read(1) !== 0) continue;
    const mode = setup.modes[br.read(modeBits)];
    if (!mode) continue;
    const n = mode.flag ? bs1 : bs0, n2 = n / 2;
    let prev = 0, next = 0;
    if (mode.flag) { prev = br.read(1); next = br.read(1); }
    const map = setup.mappings[mode.mapping];
    const floors = [];
    for (let c = 0; c < channels; c++) floors.push(floorDecode(br, setup.floors[map.subs[map.mux[c]].floor], setup.books, n2));
    const nz = floors.map((f) => f !== null);
    for (const [m, a] of map.coupling) if (nz[m] || nz[a]) nz[m] = nz[a] = true;
    const vecs = [];
    for (let c = 0; c < channels; c++) vecs.push(new Float64Array(n2));
    map.subs.forEach((sub, si) => {
      const idx = [];
      for (let c = 0; c < channels; c++) if (map.mux[c] === si) idx.push(c);
      residueDecode(br, setup.residues[sub.residue], setup.books, idx.map((c) => vecs[c]), idx.map((c) => !nz[c]), n2);
    });
    for (let s = map.coupling.length - 1; s >= 0; s--) {
      const [mi, ai] = map.coupling[s], M = vecs[mi], A = vecs[ai];
      for (let i = 0; i < n2; i++) {
        const m = M[i], a = A[i];
        if (m > 0) { if (a > 0) { A[i] = m - a; } else { A[i] = m; M[i] = m + a; } } else if (a > 0) { A[i] = m + a; } else { A[i] = m; M[i] = m - a; }
      }
    }
    const win = windowOf(n, mode.flag, prev, next);
    const coef = new Float64Array(n2);
    const ch0 = floors[0];
    if (ch0) for (let i = 0; i < n2; i++) coef[i] = vecs[0][i] * ch0[i];
    const y = nz[0] ? imdct(coef, n) : new Float64Array(n);
    // block centres are prevN/4 + n/4 apart, so a window starts 3/4 prevN - n/4 after the previous one
    if (first) { start = 0; first = false; } else start += (3 * prevN) / 4 - n / 4;
    chunks.push({ start, n, y, win });
    prevN = n;
    total = Math.max(total, start + n);
  }
  const acc = new Float64Array(Math.ceil(total) + 1);
  for (const c of chunks) for (let i = 0; i < c.n; i++) acc[Math.round(c.start) + i] += c.y[i] * c.win[i];
  const first0 = chunks.length ? chunks[0].n / 2 : 0;
  let len = lastGranule > 0 ? lastGranule : acc.length - first0;
  len = Math.min(len, acc.length - first0);
  const samples = new Float32Array(Math.max(0, len));
  for (let i = 0; i < samples.length; i++) samples[i] = acc[first0 + i];
  return { rate, channels, samples };
}

// ------------------------------------------------------------------ sound measures

const db = (x) => 20 * Math.log10(Math.max(x, 1e-9));
export function analyseSamples(samples, rate) {
  const n = samples.length;
  let sq = 0, peak = 0;
  for (let i = 0; i < n; i++) { sq += samples[i] * samples[i]; peak = Math.max(peak, Math.abs(samples[i])); }
  const rms = Math.sqrt(sq / Math.max(1, n));
  const seg = Math.max(1, Math.round(rate * 0.05));
  const levelOf = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += samples[i] * samples[i]; return db(Math.sqrt(s / Math.max(1, b - a))); };
  const levelMismatch = n > 2 * seg ? Math.abs(levelOf(0, seg) - levelOf(n - seg, n)) : 0;
  let dsum = 0;
  for (let i = 1; i < n; i++) dsum += (samples[i] - samples[i - 1]) ** 2;
  const dRms = Math.sqrt(dsum / Math.max(1, n - 1));
  const seamRatio = n > 1 && dRms > 1e-9 ? Math.abs(samples[0] - samples[n - 1]) / dRms : 0;
  // brightness: share of power above 4 kHz in 2048-sample frames
  const N = 2048, fft = fftOf(N);
  let hi = 0, all = 0;
  const hann = new Float64Array(N);
  for (let i = 0; i < N; i++) hann[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
  for (let s = 0; s + N <= n; s += N * 2) {
    const re = new Float64Array(N), im = new Float64Array(N);
    for (let i = 0; i < N; i++) re[i] = samples[s + i] * hann[i];
    fft(re, im);
    for (let k = 1; k < N / 2; k++) { const p = re[k] * re[k] + im[k] * im[k]; all += p; if (k * rate / N >= 4000) hi += p; }
  }
  // envelope autocorrelation: a short period means a tiled loop or a rhythmic pulse
  const frame = Math.max(1, Math.round(rate * 0.02)), env = [];
  for (let s = 0; s + frame <= n; s += frame) { let e = 0; for (let i = s; i < s + frame; i++) e += samples[i] * samples[i]; env.push(Math.sqrt(e / frame)); }
  const mean = env.reduce((a, b) => a + b, 0) / Math.max(1, env.length);
  const ev = env.map((x) => x - mean), den = ev.reduce((a, b) => a + b * b, 0);
  let bestLag = 0, best = 0;
  const minLag = Math.round(0.15 / 0.02), maxLag = Math.min(env.length >> 1, Math.round(LIMITS.soundCycleSeconds * 3 / 0.02));
  if (den > 1e-12) {
    const rs = [];
    for (let lag = minLag; lag <= maxLag; lag++) {
      let s = 0;
      for (let i = 0; i + lag < ev.length; i++) s += ev[i] * ev[i + lag];
      rs.push(s / den * (ev.length / (ev.length - lag)));
    }
    best = Math.max(0, ...rs);
    bestLag = best > 0 ? minLag + rs.findIndex((r) => r >= best * 0.95) : 0;
  }
  return {
    seconds: +(n / rate).toFixed(2), rmsDb: +db(rms).toFixed(1), peakDb: +db(peak).toFixed(1), levelMismatchDb: +levelMismatch.toFixed(1),
    seamRatio: +seamRatio.toFixed(1), hfShare: +(all ? hi / all : 0).toFixed(3), cycleStrength: +best.toFixed(2), cycleSeconds: +(bestLag * 0.02).toFixed(2),
  };
}

// ------------------------------------------------------------------ the sound audit

const normType = (t) => (t.includes(':') ? t : `gtceu:${t}`);

export function parseWiring(soundsJs) {
  const lines = fs.readFileSync(soundsJs, 'utf8').split('\n');
  const map = new Map();
  let inside = false;
  lines.forEach((l, i) => {
    if (/const WIRING = \{/.test(l)) { inside = true; return; }
    if (inside && /^\s*\}/.test(l)) inside = false;
    const m = inside && /^\s*'([^']+)'\s*:\s*'([^']+)'/.exec(l);
    if (m) map.set(m[1], { event: m[2], line: i + 1 });
  });
  return map;
}

export function auditSounds({ root = ROOT, packDir = 'pack', gtmJar = null, startup = null } = {}) {
  startup = startup || evaluateStartup(root, packDir);
  const assets = path.join(root, packDir, 'kubejs', 'assets', 'grindless');
  const soundsJs = path.join(root, packDir, 'kubejs', 'startup_scripts', 'grindless', 'sounds.js');
  const wiring = fs.existsSync(soundsJs) ? parseWiring(soundsJs) : new Map();
  const index = fs.existsSync(path.join(assets, 'sounds.json')) ? JSON.parse(fs.readFileSync(path.join(assets, 'sounds.json'), 'utf8')) : {};
  const specFile = path.join(root, 'tools', 'assets', 'sounds.json');
  const spec = fs.existsSync(specFile) ? JSON.parse(fs.readFileSync(specFile, 'utf8')).sounds || [] : [];
  const specById = new Map(spec.map((s) => [s.id, s]));
  const rows = [];
  const fileLevels = new Map();
  const zip = gtmJar ? openZip(gtmJar) : null;
  const measure = (buf) => { const d = decodeVorbis(buf); return analyseSamples(d.samples, d.rate); };
  const rel2 = (f) => rel(root, f);
  // our sound files
  const files = walk(path.join(assets, 'sounds'), '.ogg');
  const ids = new Set(files.map((f) => path.basename(f, '.ogg')));
  for (const id of new Set([...ids, ...Object.keys(index), ...spec.map((s) => s.id)])) {
    const file = path.join(assets, 'sounds', `${id}.ogg`);
    const row = { kind: 'file', id: `grindless:${id}`, source: 'grindless', file: ids.has(id) ? rel2(file) : '', categories: new Set(), detail: [] };
    const ix = index[id] && index[id].sounds && index[id].sounds[0];
    row.volume = ix ? ix.volume : '';
    row.attenuation = ix ? ix.attenuation_distance : '';
    row.stream = ix ? ix.stream : '';
    if (!ids.has(id)) { row.categories.add('missing'); row.detail.push('sound event without a file'); } else if (!ix) { row.categories.add('missing'); row.detail.push('file without an index entry'); }
    if (ids.has(id)) {
      row.bytes = fs.statSync(file).size;
      try { Object.assign(row, measure(fs.readFileSync(file))); fileLevels.set(id, row); } catch (e) { row.categories.add('undecodable'); row.detail.push(e.message); }
    }
    const sp = specById.get(id);
    row.specType = sp ? sp.recipeType : '';
    rows.push(row);
  }
  const eff = (r) => (r.rmsDb === undefined ? NaN : r.rmsDb + db(Number(r.volume) || 1));
  const levels = [...fileLevels.values()].map(eff).filter(Number.isFinite).sort((a, b) => a - b);
  const median = levels.length ? levels[levels.length >> 1] : 0;
  for (const r of rows) {
    if (r.kind !== 'file' || r.rmsDb === undefined) continue;
    r.effectiveDb = +eff(r).toFixed(1);
    const cat = (c, d) => { r.categories.add(c); r.detail.push(d); };
    if (r.peakDb > LIMITS.soundPeak) cat('level', `peak ${r.peakDb} dBFS`);
    if (r.rmsDb > LIMITS.soundRmsLoud) cat('level', `rms ${r.rmsDb} dBFS too loud`);
    if (r.rmsDb < LIMITS.soundRmsQuiet) cat('level', `rms ${r.rmsDb} dBFS too quiet`);
    if (Math.abs(r.effectiveDb - median) > LIMITS.soundRelative) cat('level', `${(r.effectiveDb - median).toFixed(1)} dB from the pack median once volume is applied`);
    if (r.seconds < LIMITS.soundMinSeconds || r.seconds > LIMITS.soundMaxSeconds) cat('loop', `length ${r.seconds}s`);
    if (r.seamRatio > LIMITS.seamJumpRatio) cat('loop', `seam jump x${r.seamRatio} the typical sample step`);
    if (r.levelMismatchDb > LIMITS.seamLevelDb) cat('loop', `start/end level differ by ${r.levelMismatchDb} dB`);
    if (r.hfShare > LIMITS.soundHf) cat('annoying', `${(r.hfShare * 100) | 0}% of the energy above 4 kHz`);
    if (r.cycleStrength > LIMITS.soundCycleStrength && r.cycleSeconds < LIMITS.soundCycleSeconds) cat('annoying', `envelope repeats every ${r.cycleSeconds}s (strength ${r.cycleStrength})`);
  }
  // recipe types and the sounds they end up with
  const typeSound = new Map();
  for (const t of startup.recipeType) {
    const id = normType(t.id);
    let gtm = '';
    for (const c of t.calls) if (c.method === 'setSound') for (const a of c.args) if (a && a.__gtSound) gtm = a.__gtSound;
    typeSound.set(id, { gtm, ours: true });
  }
  const users = new Map();
  const machineRows = [];
  for (const m of startup.machine) {
    const types = [];
    let unknownTypes = 0;
    for (const c of m.calls) if (c.method === 'recipeType' || c.method === 'recipeTypes') for (const a of c.args) { if (typeof a === 'string') types.push(normType(a)); else unknownTypes++; }
    let sound = '', source = '';
    for (const t of types) {
      const w = wiring.get(t);
      if (w) { sound = `grindless:${w.event}`; source = 'wired loop'; break; }
    }
    if (!sound) {
      let gtm = '';
      for (const c of m.calls) if (c.method === 'setSound') for (const a of c.args) if (a && a.__gtSound) gtm = a.__gtSound;
      if (!gtm) for (const t of types) if (typeSound.get(t) && typeSound.get(t).gtm) gtm = typeSound.get(t).gtm;
      if (gtm) { sound = `gtceu:${gtm.toLowerCase()}`; source = 'GTM sound entry'; } else if (types.some((t) => !typeSound.has(t)) || unknownTypes) { sound = '(GTM recipe type default)'; source = 'GTM built-in'; } else { source = 'none'; }
    }
    const row = { kind: 'machine', id: m.id, source: m.type === 'multiblock' ? 'multiblock' : 'machine', era: m.era, file: m.file, soundOf: sound, soundSource: source, recipeTypes: types.join(' '), categories: new Set(), detail: [] };
    if (m.type === 'multiblock') {
      if (source === 'none') { row.categories.add('missing'); row.detail.push('no recipe-type sound'); }
      if (sound.startsWith('grindless:')) (users.get(sound) || users.set(sound, []).get(sound)).push(row);
    }
    machineRows.push(row);
  }
  for (const [s, list] of users) {
    for (const r of list) r.shared = list.length;
    const f = fileLevels.get(s.slice(10));
    if (list.length > LIMITS.sharedLoopControllers) for (const r of list) { r.categories.add('repeated'); r.detail.push(`loop shared by ${list.length} controllers`); }
    if (f) f.usedBy = list.length;
  }
  const wired = new Set([...wiring.values()].map((w) => w.event));
  for (const r of rows) {
    if (r.kind !== 'file') continue;
    const id = r.id.slice(10);
    r.usedBy = (users.get(r.id) || []).length;
    r.wired = wired.has(id) ? [...wiring].find(([, v]) => v.event === id)[0] : '';
    if (!wired.has(id)) { r.categories.add('orphan'); r.detail.push('not in WIRING'); }
  }
  // GTM entries our machines fall back on
  const gtmRows = [];
  const gtmUsed = new Map();
  for (const r of machineRows) if (r.soundSource === 'GTM sound entry') (gtmUsed.get(r.soundOf) || gtmUsed.set(r.soundOf, []).get(r.soundOf)).push(r);
  for (const [s, list] of [...gtmUsed].sort()) {
    const row = { kind: 'gtm_file', id: s, source: 'gtceu', file: '', usedBy: list.length, categories: new Set(), detail: [] };
    if (zip) {
      try {
        const j = JSON.parse(zip.read('assets/gtceu/sounds.json').toString('utf8'));
        const ev = j[s.slice(6)];
        const name = ev && ev.sounds && ev.sounds[0] && (ev.sounds[0].name || ev.sounds[0]);
        const p = name && `assets/gtceu/sounds/${String(name).replace(/^gtceu:/, '')}.ogg`;
        if (p && zip.has(p)) { row.file = p; Object.assign(row, measure(zip.read(p))); row.volume = ev.sounds[0].volume || 1; } else row.detail.push('sound file not found in the jar');
      } catch (e) { row.detail.push(`unreadable: ${e.message}`); }
    } else row.detail.push('unchecked (no --gtm-jar)');
    gtmRows.push(row);
  }
  const all = [...rows, ...gtmRows, ...machineRows];
  for (const r of all) r.categories = [...r.categories].sort();
  return { rows: all, wiring, median, errors: startup.errors };
}

// ------------------------------------------------------------------ CSV and CLI

export function toCsv(rows, columns) {
  const cell = (v) => {
    if (v === undefined || v === null) return '';
    const s = Array.isArray(v) ? v.join(';') : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return `${columns.join(',')}\n${rows.map((r) => columns.map((c) => cell(r[c])).join(',')).join('\n')}\n`;
}
export const TEXTURE_COLUMNS = ['path', 'kind', 'era', 'owner', 'refs', 'exists', 'categories', 'detail', 'w', 'h', 'frames', 'opaque', 'colours', 'lum', 'hue', 'sat', 'light', 'cluster', 'clusterSize', 'maskHash', 'file', 'registrant'];
export const SOUND_COLUMNS = ['kind', 'id', 'source', 'era', 'categories', 'detail', 'soundOf', 'soundSource', 'recipeTypes', 'shared', 'file', 'bytes', 'seconds', 'rmsDb', 'peakDb', 'effectiveDb', 'volume', 'attenuation', 'levelMismatchDb', 'seamRatio', 'hfShare', 'cycleStrength', 'cycleSeconds', 'usedBy', 'wired', 'specType'];

function flatten(rows) { return rows.map((r) => ({ ...r, detail: Array.isArray(r.detail) ? r.detail.join(' | ') : r.detail })); }

export function summarise(tex, snd) {
  const lines = [];
  const cats = ['missing', 'placeholder', 'inconsistent', 'recolour', 'orphan'];
  lines.push('### textures per era and category (files)');
  lines.push(`| era | files | ${cats.join(' | ')} |`, `|${'---|'.repeat(cats.length + 2)}`);
  for (const era of [...ERAS, 'other']) {
    const rs = tex.filter((r) => r.era === era);
    if (!rs.length) continue;
    lines.push(`| ${era} | ${rs.filter((r) => r.kind !== 'external').length} | ${cats.map((c) => rs.filter((r) => r.categories.includes(c)).length).join(' | ')} |`);
  }
  for (const c of cats) {
    const rs = tex.filter((r) => r.categories.includes(c)).sort((a, b) => b.categories.length - a.categories.length || (b.clusterSize || 0) - (a.clusterSize || 0) || (a.path < b.path ? -1 : 1)).slice(0, 30);
    lines.push('', `### worst 30 ${c}`);
    rs.forEach((r) => lines.push(`- ${r.path} (${r.era}) ${r.detail.join('; ')}`));
  }
  const sc = ['missing', 'repeated', 'level', 'loop', 'annoying', 'orphan'];
  lines.push('', '### sounds', `| kind | rows | ${sc.join(' | ')} |`, `|${'---|'.repeat(sc.length + 2)}`);
  for (const k of ['file', 'gtm_file', 'machine']) {
    const rs = snd.filter((r) => r.kind === k);
    lines.push(`| ${k} | ${rs.length} | ${sc.map((c) => rs.filter((r) => r.categories.includes(c)).length).join(' | ')} |`);
  }
  return lines.join('\n');
}

export function main(argv) {
  const arg = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
  const out = path.resolve(ROOT, arg('--out', path.join('docs', 'reforge', 'data')));
  const packDir = arg('--pack', 'pack');
  const gtmJar = arg('--gtm-jar', null);
  const t0 = Date.now();
  const startup = evaluateStartup(ROOT, packDir);
  const tex = auditTextures({ root: ROOT, packDir, gtmJar, startup });
  const snd = auditSounds({ root: ROOT, packDir, gtmJar, startup });
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, '06_textures.csv'), toCsv(flatten(tex.rows), TEXTURE_COLUMNS));
  fs.writeFileSync(path.join(out, '06_sounds.csv'), toCsv(flatten(snd.rows), SOUND_COLUMNS));
  console.log(`assets-audit: ${tex.rows.length} texture rows, ${snd.rows.length} sound rows, ${tex.errors.length} sandbox errors, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  if (argv.includes('--summary')) console.log(summarise(tex.rows, snd.rows));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
