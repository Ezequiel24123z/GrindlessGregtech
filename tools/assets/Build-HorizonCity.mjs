// Build-HorizonCity.mjs - the generated ruined city of grindless:horizon_city (package XP-Z1a), its sky ring and its preview sheet.
// Deterministic: a rerun leaves `git status` clean. No npm dependency: binary NBT and PNG are written with node:zlib.
//   node tools/assets/Build-HorizonCity.mjs [--preview <dir>]      (the sheet goes outside the repository; default: <tmp>/horizon-city-preview)
// Writes (all under pack/kubejs):
//   data/grindless/structures/horizon_city/*.nbt            the templates (gzip NBT, 1.20.1 folder name)
//   data/grindless/worldgen/template_pool/horizon_city/*    the pools
//   data/grindless/worldgen/structure/horizon_city.json    the jigsaw structure
//   data/grindless/worldgen/structure_set/horizon_city.json
//   data/grindless/tables/horizon_city.json                 arrival point and plaza template, read by XP-Z1b
//   assets/grindless/textures/sky/horizon_ring.png          the lensed ring of the sky
// Only vanilla and Architect's Palette blocks. Nothing with an inventory or a function, no text, no entity. Jigsaw blocks finalise to air.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const KUBE = path.join(ROOT, 'pack', 'kubejs');
const DATA = path.join(KUBE, 'data', 'grindless');
export const DIRS = {
  structures: path.join(DATA, 'structures', 'horizon_city'),
  pools: path.join(DATA, 'worldgen', 'template_pool', 'horizon_city'),
  structure: path.join(DATA, 'worldgen', 'structure', 'horizon_city.json'),
  structureSet: path.join(DATA, 'worldgen', 'structure_set', 'horizon_city.json'),
  table: path.join(DATA, 'tables', 'horizon_city.json'),
  ring: path.join(KUBE, 'assets', 'grindless', 'textures', 'sky', 'horizon_ring.png'),
};
const DATA_VERSION = 3465; // Minecraft 1.20.1
const GROUND_Y = 3; // the top layer of the flat generator (bedrock, 2 diorite, calcite)

// ---- deterministic noise ------------------------------------------------------------------------------------------------------------
function hash(...v) {
  let h = 2166136261 >>> 0;
  for (const n of v) { h ^= (n | 0) + 0x9e3779b9; h = Math.imul(h, 16777619) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; }
  h ^= h >>> 13; h = Math.imul(h, 3266489917) >>> 0; h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const strSeed = (s) => { let h = 5381; for (const c of s) h = (Math.imul(h, 33) + c.charCodeAt(0)) >>> 0; return h; };

// ---- block palette (vanilla and Architect's Palette only) -------------------------------------------------------------------------
const B = {
  quartz: 'minecraft:smooth_quartz', bricks: 'minecraft:quartz_bricks', pillar: 'minecraft:quartz_pillar[axis=y]', chiseled: 'minecraft:chiseled_quartz_block',
  calcite: 'minecraft:calcite', diorite: 'minecraft:polished_diorite', white: 'minecraft:white_concrete', grey: 'minecraft:light_gray_concrete',
  dark: 'minecraft:gray_concrete', endbrick: 'minecraft:end_stone_bricks', glass: 'minecraft:glass', pale_glass: 'minecraft:light_gray_stained_glass',
  tinted: 'minecraft:tinted_glass', bars: 'minecraft:iron_bars', lantern: 'minecraft:sea_lantern', slab: 'minecraft:quartz_slab[type=bottom]',
  slab_top: 'minecraft:quartz_slab[type=top]', plating: 'architects_palette:plating_block', heavy: 'architects_palette:heavy_calcite_bricks',
  onyx: 'architects_palette:onyx_bricks', moon: 'architects_palette:moonshale_bricks', tiles: 'architects_palette:olivestone_tiles',
  abyss: 'architects_palette:abyssaline_plating', cbricks: 'architects_palette:calcite_bricks', cracked: 'minecraft:cracked_stone_bricks',
};
const stairs = (facing, half = 'bottom') => `minecraft:quartz_stairs[facing=${facing},half=${half}]`;

function parseState(s) {
  const m = /^([a-z0-9_.-]+:[a-z0-9_./-]+)(?:\[(.*)\])?$/.exec(s);
  if (!m) throw new Error('bad block state ' + s);
  const out = { Name: m[1] };
  if (m[2]) {
    out.Properties = {};
    for (const kv of m[2].split(',')) { const [k, v] = kv.split('='); out.Properties[k] = v; }
  }
  return out;
}

// ---- templates ----------------------------------------------------------------------------------------------------------------------
const FACE = { north: [0, 0, -1], south: [0, 0, 1], west: [-1, 0, 0], east: [1, 0, 0] };
class Tpl {
  constructor(name, w, h, d) {
    this.name = name; this.w = w; this.h = h; this.d = d;
    this.cells = new Map(); // key -> state string
    this.jigs = new Map(); // key -> {facing,name,target,pool,final}
  }
  key(x, y, z) { return (y * this.d + z) * this.w + x; }
  inside(x, y, z) { return x >= 0 && y >= 0 && z >= 0 && x < this.w && y < this.h && z < this.d; }
  set(x, y, z, s) { if (this.inside(x, y, z)) { const k = this.key(x, y, z); if (s === null) this.cells.delete(k); else this.cells.set(k, s); } }
  get(x, y, z) { return this.cells.get(this.key(x, y, z)) || null; }
  fill(x0, y0, z0, x1, y1, z1, s) {
    for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) this.set(x, y, z, s);
  }
  shell(x0, y0, z0, x1, y1, z1, s) {
    for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) {
      if (x === x0 || x === x1 || z === z0 || z === z1) this.set(x, y, z, s);
    }
  }
  jig(x, y, z, facing, name, target, pool) {
    this.cells.delete(this.key(x, y, z));
    this.jigs.set(this.key(x, y, z), { x, y, z, facing, name, target, pool });
  }
  // the four ground connectors at the middle of each wall (aligned grid), or the listed sides only
  groundJigs(sides = ['north', 'south', 'west', 'east'], pool = 'grindless:horizon_city/ground') {
    for (const f of sides) {
      const x = f === 'west' ? 0 : f === 'east' ? this.w - 1 : this.w >> 1;
      const z = f === 'north' ? 0 : f === 'south' ? this.d - 1 : this.d >> 1;
      this.jig(x, 1, z, f, 'horizon_city:ground', 'horizon_city:ground', pool);
    }
  }
  blocks() { // sorted by y, z, x; each {pos, state index, nbt?}
    const palette = []; const index = new Map(); const list = [];
    const idx = (s) => { if (!index.has(s)) { index.set(s, palette.length); palette.push(s); } return index.get(s); };
    const all = [];
    for (const [k, s] of this.cells) all.push({ k, s });
    for (const [k, j] of this.jigs) all.push({ k, j });
    all.sort((a, b) => a.k - b.k);
    for (const e of all) {
      const x = e.k % this.w; const z = Math.floor(e.k / this.w) % this.d; const y = Math.floor(e.k / (this.w * this.d));
      if (e.j) {
        const state = `minecraft:jigsaw[orientation=${e.j.facing}_up]`;
        list.push({ pos: [x, y, z], state: idx(state), jig: e.j });
      } else list.push({ pos: [x, y, z], state: idx(e.s) });
    }
    return { palette, list };
  }
  count() { return this.cells.size + this.jigs.size; }
}

// ---- binary NBT (named root compound, gzip) -----------------------------------------------------------------------------------------
const T = { end: 0, int: 3, string: 8, list: 9, compound: 10 };
const wStr = (s) => { const b = Buffer.from(s, 'utf8'); const l = Buffer.alloc(2); l.writeUInt16BE(b.length); return Buffer.concat([l, b]); };
const wInt = (n) => { const b = Buffer.alloc(4); b.writeInt32BE(n); return b; };
const named = (type, name, payload) => Buffer.concat([Buffer.from([type]), wStr(name), payload]);
const nStr = (name, v) => named(T.string, name, wStr(v));
const nInt = (name, v) => named(T.int, name, wInt(v));
const nIntList = (name, a) => named(T.list, name, Buffer.concat([Buffer.from([T.int]), wInt(a.length), ...a.map(wInt)]));
const nList = (name, type, items) => named(T.list, name, Buffer.concat([Buffer.from([items.length ? type : T.end]), wInt(items.length), ...items]));
const compound = (...entries) => Buffer.concat([...entries, Buffer.from([T.end])]);
const nCompound = (name, ...entries) => named(T.compound, name, compound(...entries));

export function encodeTemplate(t) {
  const { palette, list } = t.blocks();
  const pal = palette.map((s) => {
    const st = parseState(s);
    const entries = [nStr('Name', st.Name)];
    if (st.Properties) entries.push(nCompound('Properties', ...Object.keys(st.Properties).sort().map((k) => nStr(k, st.Properties[k]))));
    return compound(...entries);
  });
  const blocks = list.map((b) => {
    const entries = [nIntList('pos', b.pos), nInt('state', b.state)];
    if (b.jig) {
      entries.push(nCompound('nbt',
        nStr('final_state', 'minecraft:air'), nStr('id', 'minecraft:jigsaw'), nStr('joint', 'aligned'),
        nStr('name', b.jig.name), nStr('pool', b.jig.pool), nStr('target', b.jig.target)));
    }
    return compound(...entries);
  });
  const root = Buffer.concat([
    Buffer.from([T.compound]), wStr(''),
    nList('blocks', T.compound, blocks),
    nInt('DataVersion', DATA_VERSION),
    nList('entities', T.compound, []),
    nList('palette', T.compound, pal),
    nIntList('size', [t.w, t.h, t.d]),
    Buffer.from([T.end]),
  ]);
  return zlib.gzipSync(root, { level: 9, mtime: 0 });
}

// ---- PNG ----------------------------------------------------------------------------------------------------------------------------
const crcTable = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const pngChunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const len = Buffer.alloc(4); const c = Buffer.alloc(4);
  len.writeUInt32BE(data.length); c.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, c]);
};
export function encodePng(w, h, rgba) { // rgba: Uint8Array w*h*4
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), pngChunk('IHDR', ihdr), pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })), pngChunk('IEND', Buffer.alloc(0))]);
}

// ---- shared pieces of architecture --------------------------------------------------------------------------------------------------
function pavement(t, y, x0, z0, x1, z1, seed) { // pale paving, a darker joint line every 8 blocks, a few cracked and missing slabs
  for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) {
    let s = ((x >> 2) + (z >> 2)) & 1 ? B.quartz : B.diorite;
    if (x % 8 === 0 || z % 8 === 0) s = B.grey;
    const r = hash(seed, x, z);
    if (r < 0.04) s = B.cbricks; else if (r < 0.055) s = B.heavy; else if (r < 0.065) s = B.cracked;
    t.set(x, y, z, s);
  }
}
function brokenPillar(t, x, z, y0, h, seed) { // a quartz column whose capital is gone
  const hh = Math.max(1, Math.round(h * (0.35 + 0.65 * hash(seed, x, z))));
  t.fill(x, y0, z, x, y0 + hh - 1, z, B.pillar);
  if (hh >= h) t.set(x, y0 + hh, z, B.chiseled);
}
function fallenBlocks(t, seed, n, x0, z0, x1, z1, y) { // loose rubble on the pavement
  for (let i = 0; i < n; i++) {
    const x = x0 + Math.floor(hash(seed, i, 1) * (x1 - x0 + 1)); const z = z0 + Math.floor(hash(seed, i, 2) * (z1 - z0 + 1));
    const pick = hash(seed, i, 3);
    t.set(x, y, z, pick < 0.3 ? B.cbricks : pick < 0.55 ? B.bricks : pick < 0.8 ? B.calcite : B.heavy);
    if (hash(seed, i, 4) < 0.35) t.set(x, y + 1, z, B.slab);
  }
}

// ---- ground templates ---------------------------------------------------------------------------------------------------------------
function startPlaza() {
  const t = new Tpl('start_plaza', 48, 9, 48); const s = strSeed('start');
  pavement(t, 0, 0, 0, 47, 47, s);
  for (let r = 0; r < 24; r++) { // a ring inlay of dark tiles around the centre
    for (let a = 0; a < 360; a += 2) {
      const x = Math.round(23.5 + r * Math.cos(a * 0.0174533)); const z = Math.round(23.5 + r * Math.sin(a * 0.0174533));
      if (r === 15 || r === 19) t.set(x, 0, z, B.onyx); else if (r === 17) t.set(x, 0, z, B.tiles);
    }
  }
  t.fill(20, 0, 20, 27, 0, 27, B.chiseled); t.fill(21, 1, 21, 26, 1, 26, B.bricks); t.fill(22, 2, 22, 25, 2, 25, B.quartz); // the dais
  for (let i = 0; i < 12; i++) { // a broken ring of columns
    const a = (i / 12) * 6.28318;
    brokenPillar(t, Math.round(23.5 + 18 * Math.cos(a)), Math.round(23.5 + 18 * Math.sin(a)), 1, 8, s);
  }
  t.fill(23, 3, 23, 24, 6, 24, B.pillar); t.set(23, 7, 23, B.chiseled); // a snapped obelisk
  fallenBlocks(t, s, 40, 2, 2, 45, 45, 1);
  t.groundJigs();
  return t;
}

function plazaGlass(variant) {
  const t = new Tpl('plaza_glass' + (variant ? '_b' : ''), 32, 10, 32); const s = strSeed('plaza_glass' + variant);
  pavement(t, 0, 0, 0, 31, 31, s);
  for (let z = 8; z <= 23; z++) for (let x = 8; x <= 23; x++) { // a glass floor lit from below
    t.set(x, 0, z, (x + z) % 4 === 0 ? B.lantern : (hash(s, x, z) < 0.08 ? B.tinted : B.glass));
  }
  for (const [px, pz] of [[7, 7], [24, 7], [7, 24], [24, 24], [15, 7], [16, 24], [7, 16], [24, 15]]) brokenPillar(t, px, pz, 1, variant ? 9 : 7, s + px);
  // a shattered glass canopy on part of the colonnade
  for (let z = 7; z <= 24; z++) for (let x = 7; x <= 24; x++) {
    if (hash(s, x, z, 9) < (variant ? 0.35 : 0.2) && (x === 7 || x === 24 || z === 7 || z === 24)) t.set(x, 8, z, hash(s, x, z, 2) < 0.5 ? B.pale_glass : B.glass);
  }
  fallenBlocks(t, s, 24, 1, 1, 30, 30, 1);
  t.groundJigs();
  return t;
}

function plazaPale(variant) {
  const t = new Tpl('plaza_pale' + (variant ? '_b' : ''), 32, 12, 32); const s = strSeed('plaza_pale' + variant);
  pavement(t, 0, 0, 0, 31, 31, s);
  t.fill(10, 1, 10, 21, 1, 21, B.bricks); t.fill(12, 2, 12, 19, 2, 19, B.quartz); // a stepped platform
  t.fill(14, 3, 14, 17, 3, 17, B.chiseled);
  for (const [px, pz] of [[11, 11], [20, 11], [11, 20], [20, 20]]) { t.fill(px, 2, pz, px, 4 + Math.floor(hash(s, px, pz) * 6), pz, B.pillar); }
  t.fill(3, 1, 3, 5, 1, 28, B.heavy); t.fill(26, 1, 3, 28, 1, 28, B.heavy); // long low benches
  if (variant) for (let x = 6; x <= 25; x += 3) brokenPillar(t, x, 4, 1, 10, s);
  fallenBlocks(t, s, 30, 1, 1, 30, 30, 1);
  t.groundJigs();
  return t;
}

function boulevard() { // 16 wide, two connectors at the ends of its long axis
  const t = new Tpl('boulevard', 16, 6, 32); const s = strSeed('boulevard');
  pavement(t, 0, 0, 0, 15, 31, s);
  t.fill(7, 0, 0, 8, 0, 31, B.onyx); // dark centre stripe
  for (const x of [1, 14]) for (let z = 3; z < 32; z += 8) {
    const h = 3 + Math.floor(hash(s, x, z) * 3);
    t.fill(x, 1, z, x, h, z, B.pillar);
    if (hash(s, x, z, 5) < 0.55) t.set(x, h + 1, z, B.lantern);
  }
  fallenBlocks(t, s, 10, 2, 2, 13, 29, 1);
  t.groundJigs(['north', 'south']);
  return t;
}

function colonnade() { // 32 along x, 16 along z; connectors west and east
  const t = new Tpl('colonnade', 32, 15, 16); const s = strSeed('colonnade');
  pavement(t, 0, 0, 0, 31, 15, s);
  for (const z of [3, 12]) for (let x = 2; x <= 29; x += 4) brokenPillar(t, x, z, 1, 13, s);
  for (const z of [3, 12]) for (let x = 2; x < 29; x += 4) { // lintels survive between some pairs of standing columns
    if (hash(s, x, z, 7) < 0.45) { t.fill(x, 14, z, x + 4, 14, z, B.bricks); t.fill(x + 1, 13, z, x + 3, 13, z, B.slab_top); }
  }
  fallenBlocks(t, s, 16, 1, 1, 30, 14, 1);
  t.groundJigs(['west', 'east']);
  return t;
}

function rubbleField() {
  const t = new Tpl('rubble_field', 32, 12, 32); const s = strSeed('rubble');
  pavement(t, 0, 0, 0, 31, 31, s);
  for (let i = 0; i < 9; i++) { // piles of fallen masonry
    const cx = 4 + Math.floor(hash(s, i, 1) * 24); const cz = 4 + Math.floor(hash(s, i, 2) * 24); const r = 2 + Math.floor(hash(s, i, 3) * 3);
    for (let z = -r; z <= r; z++) for (let x = -r; x <= r; x++) {
      const d = Math.sqrt(x * x + z * z); if (d > r) continue;
      const hgt = Math.max(1, Math.round((r - d) * 1.1 + hash(s, i, x, z) * 1.5));
      for (let y = 1; y <= hgt; y++) {
        const p = hash(s, i, x, z, y);
        t.set(cx + x, y, cz + z, p < 0.3 ? B.cbricks : p < 0.5 ? B.bricks : p < 0.7 ? B.calcite : p < 0.85 ? B.heavy : B.cracked);
      }
    }
  }
  for (let i = 0; i < 5; i++) { // a few toppled columns lying on the ground
    const x = 3 + Math.floor(hash(s, i, 9) * 20); const z = 3 + Math.floor(hash(s, i, 8) * 26); const len = 4 + Math.floor(hash(s, i, 7) * 5);
    for (let k = 0; k < len; k++) t.set(x + k, 1, z, 'minecraft:quartz_pillar[axis=x]');
  }
  t.groundJigs();
  return t;
}

function capRuin() { // a one-connector terminator: a low arch remnant
  const t = new Tpl('cap_ruin', 16, 8, 16); const s = strSeed('cap');
  pavement(t, 0, 0, 0, 15, 15, s);
  t.fill(5, 1, 7, 5, 6, 7, B.pillar); t.fill(10, 1, 7, 10, 3, 7, B.pillar); t.fill(5, 7, 7, 8, 7, 7, B.bricks);
  fallenBlocks(t, s, 8, 2, 2, 13, 13, 1);
  t.jig(8, 1, 0, 'north', 'horizon_city:ground', 'minecraft:empty', 'minecraft:empty');
  return t;
}

// ---- towers -------------------------------------------------------------------------------------------------------------------------
// A 32 x H x 32 template: plinth, stepped shaft with window bands and floors every 8, broken at the top, with ground doors on four sides
// and bridge doors (jigsaw connectors, pool horizon_city/bridges) at the listed floor levels.
function tower(name, o) {
  const t = new Tpl(name, 32, o.h, 32); const s = strSeed(name);
  const half = (y) => (y < 48 ? 14 : y < 100 ? 12 : 10);
  pavement(t, 0, 0, 0, 31, 31, s);
  t.fill(1, 1, 1, 30, 1, 30, B.bricks);
  for (let y = 1; y < o.h; y++) {
    const hw = half(y); const lo = 16 - hw; const hi = 15 + hw;
    const wy = y % 8; const band = wy === 3 || wy === 4;
    for (let z = lo; z <= hi; z++) for (let x = lo; x <= hi; x++) {
      const edge = x === lo || x === hi || z === lo || z === hi;
      if (edge) {
        const corner = (x === lo || x === hi) && (z === lo || z === hi);
        const nearCorner = Math.min(Math.abs(x - lo), Math.abs(x - hi)) < 2 && Math.min(Math.abs(z - lo), Math.abs(z - hi)) < 2;
        let b;
        if (corner || nearCorner) b = B.pillar;
        else if (y > 3 && band && ((x + z) % 4 !== 0)) b = hash(s, x, y, z) < 0.12 ? null : (hash(s, x, y, z, 1) < 0.3 ? B.pale_glass : B.glass);
        else if (wy === 0) b = B.plating;
        else b = hash(s, x, y, z, 2) < 0.5 ? B.white : B.grey;
        if (y < 4) b = B.bricks;
        t.set(x, y, z, b);
      } else if (y % 8 === 0 && y > 0) { // floors, with a ragged atrium and collapsed patches
        const atrium = Math.abs(x - 15.5) < 3.5 && Math.abs(z - 15.5) < 3.5;
        if (!atrium && hash(s, x >> 2, z >> 2, y) > 0.18) t.set(x, y, z, hash(s, x, z, y) < 0.8 ? B.quartz : B.slab);
      } else if (y < 6 && y > 0) {
        t.set(x, y, z, null);
      }
    }
    if (y % 8 === 1) for (const [cx, cz] of [[lo + 4, lo + 4], [hi - 4, lo + 4], [lo + 4, hi - 4], [hi - 4, hi - 4]]) if (y < 90) t.set(cx, y, cz, B.pillar);
  }
  // setback ledges
  for (const yy of [48, 100]) if (yy < o.h) { const lo = 16 - half(yy - 1); const hi = 15 + half(yy - 1); t.shell(lo, yy, lo, hi, yy, hi, B.onyx); t.shell(lo + 1, yy, lo + 1, hi - 1, yy, hi - 1, B.plating); }
  // damage: a cut that is jagged or slanted, plus bites out of the shell below it
  const cut = (x, z) => {
    const n = (hash(s, x >> 1, z >> 1) - 0.5) * 12 + (hash(s, x >> 2, z >> 2, 3) - 0.5) * 18;
    if (o.slice) return o.cut - (x - 4) * 1.5 + n * 0.4;
    return o.cut + Math.sin(x * 0.55) * 4 + Math.cos(z * 0.45) * 4 + n;
  };
  for (let z = 0; z < 32; z++) for (let x = 0; x < 32; x++) {
    let c = cut(x, z);
    const corner = Math.abs(x - 15.5) > 10.5 && Math.abs(z - 15.5) > 10.5;
    if (corner && hash(s, x, z, 4) < 0.5) c += 14 + hash(s, x, z, 5) * 14; // a few corner spires survive
    for (let y = Math.max(0, Math.floor(c) + 1); y < o.h; y++) t.set(x, y, z, null);
  }
  const bites = o.bites || 4;
  for (let i = 0; i < bites; i++) {
    const by = o.bitesFrom + Math.floor(hash(s, i, 11) * (o.cut - o.bitesFrom - 6));
    const side = Math.floor(hash(s, i, 12) * 4); const r = 4 + Math.floor(hash(s, i, 13) * 3);
    const cx = side === 0 ? 16 - half(by) : side === 1 ? 15 + half(by) : 8 + Math.floor(hash(s, i, 14) * 16);
    const cz = side === 2 ? 16 - half(by) : side === 3 ? 15 + half(by) : 8 + Math.floor(hash(s, i, 15) * 16);
    for (let y = by - r; y <= by + r; y++) for (let z = cz - r; z <= cz + r; z++) for (let x = cx - r; x <= cx + r; x++) {
      if ((x - cx) ** 2 + (y - by) ** 2 + (z - cz) ** 2 <= r * r && t.inside(x, y, z) && y > 60) t.set(x, y, z, null);
    }
  }
  // ground doors (5 wide, 4 high) through the wall, jigsaw connectors at the edge of the plinth
  t.fill(14, 1, 2, 18, 4, 3, null); t.fill(14, 1, 28, 18, 4, 29, null); t.fill(2, 1, 14, 3, 4, 18, null); t.fill(28, 1, 14, 29, 4, 18, null);
  t.fill(14, 1, 0, 18, 4, 1, null); t.fill(14, 1, 30, 18, 4, 31, null); t.fill(0, 1, 14, 1, 4, 18, null); t.fill(30, 1, 14, 31, 4, 18, null);
  for (let k = 0; k < 8; k++) { t.set(14 + (k % 5), 0, k < 5 ? 1 : 30, B.quartz); }
  t.groundJigs();
  // bridge doors: a 3 x 3 opening at floor level + 1, the connector in the wall
  for (const lvl of o.bridges) {
    const hw = half(lvl); const lo = 16 - hw; const hi = 15 + hw;
    for (const f of o.bridgeFaces) {
      const x = f === 'west' ? lo : f === 'east' ? hi : 16; const z = f === 'north' ? lo : f === 'south' ? hi : 16;
      const ax = f === 'north' || f === 'south';
      for (let dy = 1; dy <= 3; dy++) for (let d = -1; d <= 1; d++) t.set(ax ? x + d : x, lvl + dy, ax ? z : z + d, null);
      t.jig(x, lvl + 1, z, f, 'horizon_city:tower_bridge', 'horizon_city:bridge_in', 'grindless:horizon_city/bridges');
      for (let d = -1; d <= 1; d++) t.set(ax ? x + d : x, lvl, ax ? z : z + d, B.quartz);
    }
  }
  return t;
}

// ---- bridges ------------------------------------------------------------------------------------------------------------------------
// 7 wide, deck top at y 2, near connector (the one a tower or another span meets) at z = d-1 facing south, far connector at z 0 facing north.
function bridge(name, len, o) {
  const t = new Tpl(name, 7, 6, len); const s = strSeed(name);
  const end = o.broken ? len - Math.floor(len * 0.42) : 0; // z index where the span ends in air
  for (let z = len - 1; z >= end; z--) {
    const raggedHole = o.broken && z < end + 5 && hash(s, z, 1) < 0.5;
    for (let x = 0; x < 7; x++) {
      if (o.broken && z < end + 4 && hash(s, x, z, 2) < (end + 4 - z) * 0.22) continue; // the end crumbles
      const edge = x === 0 || x === 6;
      t.set(x, 2, z, edge ? B.plating : (x === 3 ? B.diorite : B.quartz));
      if (!raggedHole) t.set(x, 1, z, edge || x === 3 ? B.heavy : B.slab_top);
    }
    if (z % 6 === 0) { t.set(3, 0, z, B.plating); }
    if (z % 8 === 4) { t.set(0, 1, z, B.lantern); t.set(6, 1, z, B.lantern); }
    if (!(o.broken && z < end + 3)) {
      for (const x of [0, 6]) {
        const post = z % 4 === 0;
        t.set(x, 3, z, post ? B.pillar : B.bars);
        if (post) t.set(x, 4, z, hash(s, x, z, 6) < 0.5 ? B.chiseled : null);
        if (hash(s, x, z, 8) < 0.14) t.set(x, 3, z, null); // a railing gap
      }
    }
  }
  if (o.arch) for (let z = end + 2; z < len - 2; z++) { // an arch truss under the deck
    t.set(1, 0, z, B.plating); t.set(5, 0, z, B.plating);
  }
  t.jig(3, 3, len - 1, 'south', 'horizon_city:bridge_in', 'minecraft:empty', 'minecraft:empty');
  if (!o.broken) t.jig(3, 3, 0, 'north', 'horizon_city:bridge_far', 'horizon_city:bridge_in', 'grindless:horizon_city/bridges');
  return t;
}

function arrivalPlaza() { // placed once by XP-Z1b at the fixed arrival point; no connectors
  const t = new Tpl('arrival_plaza', 32, 6, 32); const s = strSeed('arrival');
  pavement(t, 0, 0, 0, 31, 31, s);
  for (let r = 0; r < 16; r++) for (let a = 0; a < 360; a += 2) {
    const x = Math.round(15.5 + r * Math.cos(a * 0.0174533)); const z = Math.round(15.5 + r * Math.sin(a * 0.0174533));
    if (r === 9 || r === 13) t.set(x, 0, z, B.onyx); else if (r < 4) t.set(x, 0, z, B.chiseled); else if (r === 11) t.set(x, 0, z, B.tiles);
  }
  for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.28318; brokenPillar(t, Math.round(15.5 + 14 * Math.cos(a)), Math.round(15.5 + 14 * Math.sin(a)), 1, 5, s); }
  for (const [x, z] of [[15, 15], [16, 15], [15, 16], [16, 16]]) t.set(x, 0, z, B.lantern);
  return t;
}

// ---- all templates, pools, wiring -----------------------------------------------------------------------------------------------------
export function buildTemplates() {
  const towers = [
    tower('tower_a', { h: 150, cut: 132, bitesFrom: 96, bridges: [56, 88], bridgeFaces: ['north', 'south', 'east', 'west'], bites: 5 }),
    tower('tower_b', { h: 126, cut: 104, slice: true, bitesFrom: 70, bridges: [56, 88], bridgeFaces: ['north', 'south'], bites: 4 }),
    tower('tower_c', { h: 96, cut: 80, bitesFrom: 64, bridges: [56], bridgeFaces: ['east', 'west', 'north'], bites: 3 }),
    tower('tower_d', { h: 164, cut: 146, bitesFrom: 104, bridges: [56, 88], bridgeFaces: ['east', 'west'], bites: 5 }),
  ];
  return [
    startPlaza(), plazaGlass(0), plazaGlass(1), plazaPale(0), plazaPale(1), boulevard(), colonnade(), rubbleField(), capRuin(),
    ...towers,
    bridge('bridge_span_a', 32, {}), bridge('bridge_span_b', 28, { arch: true }), bridge('bridge_broken_a', 30, { broken: true }), bridge('bridge_broken_b', 24, { broken: true }),
    arrivalPlaza(),
  ];
}

const element = (name) => ({ element_type: 'minecraft:single_pool_element', location: 'grindless:horizon_city/' + name, processors: 'minecraft:empty', projection: 'rigid' });
const pool = (fallback, items) => ({ fallback, elements: items.map(([name, weight]) => ({ weight, element: element(name) })) });

export const POOLS = {
  ground_start: pool('minecraft:empty', [['start_plaza', 1]]),
  ground: pool('grindless:horizon_city/caps', [
    ['plaza_glass', 2], ['plaza_glass_b', 2], ['plaza_pale', 2], ['plaza_pale_b', 2], ['boulevard', 3], ['colonnade', 2], ['rubble_field', 2],
    ['tower_a', 2], ['tower_b', 2], ['tower_c', 2], ['tower_d', 2],
  ]),
  caps: pool('minecraft:empty', [['cap_ruin', 1]]),
  bridges: pool('grindless:horizon_city/bridge_caps', [['bridge_span_a', 3], ['bridge_span_b', 2], ['bridge_broken_a', 2], ['bridge_broken_b', 2]]),
  bridge_caps: pool('minecraft:empty', [['bridge_broken_a', 1], ['bridge_broken_b', 1]]),
};
export const STRUCTURE = {
  type: 'minecraft:jigsaw', biomes: 'grindless:horizon_city', step: 'surface_structures', spawn_overrides: {}, terrain_adaptation: 'none',
  start_pool: 'grindless:horizon_city/ground_start', size: 7, start_height: { absolute: GROUND_Y }, max_distance_from_center: 96, use_expansion_hack: false,
};
export const STRUCTURE_SET = {
  structures: [{ structure: 'grindless:horizon_city', weight: 1 }],
  placement: { type: 'minecraft:random_spread', spacing: 20, separation: 13, salt: 20261102 },
};
export const TABLE = {
  _why: 'XP-Z1a: the final dimension grindless:horizon_city. Generated by tools/assets/Build-HorizonCity.mjs; XP-Z1b reads it. The arrival is the standing block at the middle of arrival_plaza.nbt; the plaza template is placed once, with its minimum corner at plaza.origin, in a loaded chunk.',
  dimension: 'grindless:horizon_city',
  ground_y: GROUND_Y,
  arrival: { x: 0, y: GROUND_Y + 1, z: 0, yaw: 0 },
  plaza: { template: 'grindless:horizon_city/arrival_plaza', origin: [-16, GROUND_Y, -16], size: [32, 6, 32] },
  structure: 'grindless:horizon_city',
};

// ---- the sky ring (a Schwarzschild-lensed Einstein ring: thin bright circle, brighter on one side, a faint second image, a dark centre) -----------
export const RING_SIZE = 2048; // XP-Z1a / P9-F1: 4x the first 512 px, which showed blocky at the sky object's in-game size
export function ringPixels(size = RING_SIZE) {
  const px = new Uint8Array(size * size * 4); const c = (size - 1) / 2; const R = size * 0.36;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = x - c; const dy = y - c; const r = Math.sqrt(dx * dx + dy * dy); const a = Math.atan2(dy, dx);
    const beam = 0.55 + 0.45 * Math.cos(a - 0.6); // one side of the ring is brighter
    const main = Math.exp(-(((r - R) / (size * 0.008)) ** 2)) * (0.55 + 0.9 * beam);
    const halo = Math.exp(-(((r - R) / (size * 0.05)) ** 2)) * 0.28 * (0.6 + 0.4 * beam);
    const inner = Math.exp(-(((r - R * 0.78) / (size * 0.004)) ** 2)) * 0.32 * (1 - beam * 0.5); // the second, fainter image
    const speck = hash(x, y, 17) > 1 - 0.0008 * (512 / size) ** 2 ? 0.5 : 0; // grain: stars lensed along the ring
    const onRing = Math.exp(-(((r - R) / (size * 0.02)) ** 2));
    const v = Math.min(1, main + halo + inner + speck * onRing);
    const i = (y * size + x) * 4;
    px[i] = Math.round(255 * Math.min(1, v * 1.00 + 0.0)); px[i + 1] = Math.round(255 * Math.min(1, v * 0.86)); px[i + 2] = Math.round(255 * Math.min(1, v * 0.62 + Math.max(0, halo * 0.5)));
    px[i + 3] = Math.round(255 * Math.min(1, v * 1.15));
  }
  return px;
}

// ---- preview sheet (outside the repository): a plan and an elevation of every template --------------------------------------------------------
function colourOf(state) {
  const n = state.replace(/\[.*$/, '');
  const table = [
    [/jigsaw/, [255, 0, 255]], [/glass/, [120, 190, 230]], [/sea_lantern/, [255, 235, 160]], [/iron_bars/, [90, 90, 100]],
    [/onyx|gray_concrete/, [50, 52, 60]], [/plating|abyssaline/, [120, 125, 140]], [/olivestone/, [150, 150, 110]],
    [/white_concrete|calcite|diorite/, [235, 235, 232]], [/quartz|chiseled/, [226, 220, 210]], [/light_gray/, [170, 170, 172]],
    [/heavy|bricks|stone|moonshale/, [190, 185, 175]],
  ];
  for (const [re, col] of table) if (re.test(n)) return col;
  return [200, 200, 200];
}
export function previewSheet(templates) {
  const pad = 6; const scale = (t) => (t.h > 60 || t.w > 40 ? 2 : 3);
  const tiles = templates.map((t) => {
    const sc = scale(t); const w = t.w * sc; const hPlan = t.d * sc; const hElev = t.h * sc;
    return { t, sc, w, hPlan, hElev };
  });
  const cols = 4; const rows = [];
  for (let i = 0; i < tiles.length; i += cols) rows.push(tiles.slice(i, i + cols));
  const rowH = rows.map((r) => Math.max(...r.map((q) => q.hPlan + q.hElev + pad * 3)));
  const colW = Array.from({ length: cols }, (_, c) => Math.max(0, ...rows.map((r) => (r[c] ? r[c].w + pad * 2 : 0))));
  const W = colW.reduce((a, b) => a + b, 0); const H = rowH.reduce((a, b) => a + b, 0);
  const img = new Uint8Array(W * H * 4); for (let i = 0; i < W * H; i++) { img[i * 4] = 24; img[i * 4 + 1] = 24; img[i * 4 + 2] = 34; img[i * 4 + 3] = 255; }
  const put = (x, y, c) => { if (x >= 0 && y >= 0 && x < W && y < H) { const i = (y * W + x) * 4; img[i] = c[0]; img[i + 1] = c[1]; img[i + 2] = c[2]; } };
  let oy = 0;
  rows.forEach((r, ri) => {
    let ox = 0;
    r.forEach((q, ci) => {
      const { t, sc } = q; const { palette, list } = t.blocks();
      const top = new Map(); const front = new Map();
      for (const b of list) {
        const [x, y, z] = b.pos; const col = colourOf(palette[b.state]);
        const kt = z * t.w + x; if (!top.has(kt) || top.get(kt).y < y) top.set(kt, { y, col });
        const kf = y * t.w + x; if (!front.has(kf) || front.get(kf).z > z) front.set(kf, { z, col });
      }
      const bx = ox + pad; const by = oy + pad;
      for (const [k, v] of top) { const x = k % t.w; const z = Math.floor(k / t.w); const shade = 0.55 + 0.45 * Math.min(1, v.y / Math.max(1, t.h * 0.5)); for (let a = 0; a < sc; a++) for (let b = 0; b < sc; b++) put(bx + x * sc + a, by + z * sc + b, v.col.map((c) => Math.round(c * shade))); }
      const ey = by + q.hPlan + pad;
      for (const [k, v] of front) { const x = k % t.w; const y = Math.floor(k / t.w); const shade = 1 - Math.min(0.45, v.z / (t.d * 2)); for (let a = 0; a < sc; a++) for (let b = 0; b < sc; b++) put(bx + x * sc + a, ey + (t.h - 1 - y) * sc + b, v.col.map((c) => Math.round(c * shade))); }
      ox += colW[ci];
    });
    oy += rowH[ri];
  });
  return { png: encodePng(W, H, img), order: tiles.map((q) => `${q.t.name} ${q.t.w}x${q.t.h}x${q.t.d}`) };
}

// ---- output -----------------------------------------------------------------------------------------------------------------------------
const json = (o) => JSON.stringify(o, null, 2) + '\n';
function write(file, data) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, data); }

export function run(previewDir) {
  const templates = buildTemplates();
  const want = new Set();
  for (const t of templates) { const f = path.join(DIRS.structures, t.name + '.nbt'); write(f, encodeTemplate(t)); want.add(f); }
  if (fs.existsSync(DIRS.structures)) for (const f of fs.readdirSync(DIRS.structures)) if (!want.has(path.join(DIRS.structures, f))) fs.rmSync(path.join(DIRS.structures, f));
  const poolFiles = new Set();
  for (const [n, p] of Object.entries(POOLS)) { const f = path.join(DIRS.pools, n + '.json'); write(f, json(p)); poolFiles.add(f); }
  if (fs.existsSync(DIRS.pools)) for (const f of fs.readdirSync(DIRS.pools)) if (!poolFiles.has(path.join(DIRS.pools, f))) fs.rmSync(path.join(DIRS.pools, f));
  write(DIRS.structure, json(STRUCTURE));
  write(DIRS.structureSet, json(STRUCTURE_SET));
  write(DIRS.table, json(TABLE));
  write(DIRS.ring, encodePng(RING_SIZE, RING_SIZE, ringPixels(RING_SIZE)));
  const dir = previewDir || path.join(os.tmpdir(), 'horizon-city-preview');
  const sheet = previewSheet(templates);
  write(path.join(dir, 'horizon_city_sheet.png'), sheet.png);
  write(path.join(dir, 'horizon_city_sheet.txt'), 'Plan above, elevation (seen from the south) below, per template, left to right, four per row:\n' + sheet.order.join('\n') + '\n');
  return { templates, previewDir: dir };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--preview');
  const { templates, previewDir } = run(i >= 0 ? process.argv[i + 1] : undefined);
  const big = templates.reduce((m, t) => (t.w * t.h * t.d > m.w * m.h * m.d ? t : m), templates[0]);
  console.log(`horizon city: ${templates.length} templates, largest ${big.name} ${big.w}x${big.h}x${big.d}; preview sheet ${path.join(previewDir, 'horizon_city_sheet.png')}`);
}
