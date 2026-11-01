// Tests of tools/analysis/assets-audit.mjs on small synthetic fixtures: PNGs built here with node:zlib, a fixture pack in a temp
// directory, and (when the pack ships one) a real .ogg for the Vorbis decoder.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {
  ROOT, decodePng, analysePixels, clusterRecolours, toCsv, parseWiring, auditTextures, evaluateStartup, analyseSamples, decodeVorbis,
} from '../assets-audit.mjs';

const crcTable = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const len = Buffer.alloc(4), c = Buffer.alloc(4);
  len.writeUInt32BE(data.length); c.writeUInt32BE(crc(body));
  return Buffer.concat([len, body, c]);
};
// an RGBA PNG; fn(x, y) returns [r, g, b, a]; filter 1 (sub) on every row to exercise the unfilter
function png(w, h, fn) {
  const rows = [];
  for (let y = 0; y < h; y++) {
    const row = Buffer.alloc(1 + w * 4);
    row[0] = 1;
    let prev = [0, 0, 0, 0];
    for (let x = 0; x < w; x++) {
      const px = fn(x, y);
      for (let c = 0; c < 4; c++) row[1 + x * 4 + c] = (px[c] - prev[c]) & 255;
      prev = px;
    }
    rows.push(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(Buffer.concat(rows))), chunk('IEND', Buffer.alloc(0))]);
}
// a shaded blob on a transparent ground, tinted by (r, g, b)
const blob = (tint) => (x, y) => {
  const inside = (x - 7.5) ** 2 + (y - 7.5) ** 2 < 36;
  if (!inside) return [0, 0, 0, 0];
  const shade = 1 - (x + y) / 30;
  return tint.map((t) => Math.round(Math.max(0, Math.min(255, t * (0.4 + shade * 0.8))))).concat(255);
};

test('decodePng reads filtered RGBA rows back exactly', () => {
  const img = decodePng(png(4, 3, (x, y) => [x * 50, y * 80, 7, x === 0 ? 0 : 255]));
  assert.equal(img.w, 4); assert.equal(img.h, 3);
  assert.deepEqual([...img.rgba.slice(4 * 4, 4 * 5)], [0, 80, 7, 0]);
  assert.deepEqual([...img.rgba.slice(((2 * 4) + 3) * 4, ((2 * 4) + 4) * 4)], [150, 160, 7, 255]);
  assert.ok(decodePng(Buffer.from('nope')).error);
});

test('analysePixels measures a strip by its first frame', () => {
  const s = analysePixels(decodePng(png(16, 48, blob([200, 60, 60]))));
  assert.equal(s.frames, 3); assert.ok(s.opaqueFrac > 0.3 && s.opaqueFrac < 0.6); assert.ok(s.light > 0);
  assert.ok(s.hue < 20 || s.hue > 340);
});

test('clusterRecolours groups a silhouette in several tints and leaves a different shape alone', () => {
  const st = new Map();
  st.set('a', analysePixels(decodePng(png(16, 16, blob([200, 60, 60])))));
  st.set('b', analysePixels(decodePng(png(16, 16, blob([60, 80, 220])))));
  st.set('c', analysePixels(decodePng(png(16, 16, (x, y) => (x < 4 || y < 4 ? [0, 0, 0, 0] : [10 + x * 9, 120, 90 + y * 5, 255])))));
  const cl = clusterRecolours(st);
  assert.ok(cl.has('a') && cl.has('b') && cl.get('a').size === 2);
  assert.ok(!cl.has('c'));
});

test('toCsv quotes commas and quotes and joins lists', () => {
  assert.equal(toCsv([{ a: 'x,y', b: ['p', 'q'], c: 'say "hi"' }], ['a', 'b', 'c']), 'a,b,c\n"x,y",p;q,"say ""hi"""\n');
});

test('parseWiring reads the WIRING map with line numbers', () => {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'aa-')), 'sounds.js');
  fs.writeFileSync(f, "(function () {\n  const WIRING = {\n    'gtceu:a': 'loop_a',\n    'gtceu:b': 'loop_b',\n  }\n  const x = { 'gtceu:c': 'no' }\n})()\n");
  const m = parseWiring(f);
  assert.deepEqual([...m.keys()], ['gtceu:a', 'gtceu:b']);
  assert.equal(m.get('gtceu:b').line, 4);
});

test('auditTextures finds a missing, an orphan, an animated strip without mcmeta and a recolour pair in a fixture pack', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aa-pack-'));
  const startup = path.join(root, 'pack', 'kubejs', 'startup_scripts', 'grindless', 'lv');
  const tex = path.join(root, 'pack', 'kubejs', 'assets', 'grindless', 'textures', 'item');
  fs.mkdirSync(startup, { recursive: true }); fs.mkdirSync(tex, { recursive: true });
  fs.writeFileSync(path.join(startup, 'items.js'), [
    "StartupEvents.registry('item', function (event) {",
    "  event.create('grindless:red_thing')",
    "  event.create('grindless:blue_thing')",
    "  event.create('grindless:ghost_thing')",
    "  event.create('grindless:moving_thing')",
    '})',
  ].join('\n'));
  fs.writeFileSync(path.join(tex, 'red_thing.png'), png(16, 16, blob([200, 60, 60])));
  fs.writeFileSync(path.join(tex, 'blue_thing.png'), png(16, 16, blob([60, 80, 220])));
  fs.writeFileSync(path.join(tex, 'moving_thing.png'), png(16, 32, blob([90, 200, 90])));
  fs.writeFileSync(path.join(tex, 'stray.png'), png(16, 16, (x, y) => [x * 10, y * 10, 100, 255]));
  const { rows } = auditTextures({ root, packDir: 'pack' });
  const by = Object.fromEntries(rows.map((r) => [r.path, r]));
  assert.ok(by['grindless:item/ghost_thing'].categories.includes('missing'));
  assert.ok(by['grindless:item/stray'].categories.includes('orphan'));
  assert.ok(by['grindless:item/moving_thing'].detail.some((d) => /mcmeta/.test(d)));
  assert.ok(by['grindless:item/red_thing'].categories.includes('recolour') && by['grindless:item/blue_thing'].categories.includes('recolour'));
  assert.equal(by['grindless:item/red_thing'].era, 'lv');
});

test('a texture named by full path in a JSON file (sky renderer) is referenced', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aa-pack-'));
  const base = path.join(root, 'pack', 'kubejs', 'assets', 'grindless');
  fs.mkdirSync(path.join(base, 'textures', 'sky'), { recursive: true });
  fs.mkdirSync(path.join(base, 'gcyr', 'planet_assets', 'sky_renderers'), { recursive: true });
  fs.mkdirSync(path.join(root, 'pack', 'kubejs', 'startup_scripts', 'grindless', 'lv'), { recursive: true });
  fs.writeFileSync(path.join(base, 'textures', 'sky', 'moon.png'), png(16, 16, blob([200, 60, 60])));
  fs.writeFileSync(path.join(base, 'textures', 'sky', 'lost.png'), png(16, 16, (x, y) => [x * 10, y * 10, 100, 255]));
  fs.writeFileSync(path.join(base, 'gcyr', 'planet_assets', 'sky_renderers', 'w.json'), '{ "sky_objects": [ { "texture": "grindless:textures/sky/moon.png" } ] }');
  const { rows } = auditTextures({ root, packDir: 'pack' });
  const by = Object.fromEntries(rows.map((r) => [r.path, r]));
  assert.ok(!by['grindless:sky/moon'].categories.includes('orphan'));
  assert.ok(by['grindless:sky/lost'].categories.includes('orphan'));
});

test('evaluateStartup records the calls on builders and the GTM sound entry', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aa-pack-'));
  const dir = path.join(root, 'pack', 'kubejs', 'startup_scripts', 'grindless', 'steam');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'm.js'), "GTCEuStartupEvents.registry('gtceu:recipe_type', function (e) { e.create('foo').setSound(GTSoundEntries.FIRE) })");
  const r = evaluateStartup(root, 'pack');
  assert.deepEqual(r.errors, []);
  assert.equal(r.recipeType.length, 1);
  assert.equal(r.recipeType[0].calls[0].args[0].__gtSound, 'FIRE');
});

test('textures named by built strings (cover renderer, tiered overlay, dormant workable model) are referenced', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aa-pack-'));
  const dir = path.join(root, 'pack', 'kubejs', 'startup_scripts', 'grindless', 'lv');
  const tex = path.join(root, 'pack', 'kubejs', 'assets', 'grindless', 'textures', 'block');
  for (const d of ['cover', 'machines/hv_hatch', 'multiblock/dormant']) fs.mkdirSync(path.join(tex, ...d.split('/')), { recursive: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'b.js'), [
    "ForgeModEvents.onGenericEvent('x.Event', 'x.CoverDefinition', function (event) {",
    "  var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')",
    "  var CD = Java.loadClass('x.CoverDefinition')",
    "  new CD(new RL('grindless', 'c'), function () {}, function () {",
    "    var SCR = Java.loadClass('x.SimpleCoverRenderer'), R = Java.loadClass('net.minecraft.resources.ResourceLocation')",
    "    return new SCR(new R('grindless', 'block/cover/c_' + 'lv'), new R('grindless', 'block/cover/c_emissive'))",
    "  })",
    '})',
    "GTCEuStartupEvents.registry('gtceu:machine', function (event) {",
    "  var RL = Java.loadClass('net.minecraft.resources.ResourceLocation')",
    "  event.create('hatch', 'custom').tiers(6, 7).definition(function (tier, b) {",
    "    b['overlayTieredHullModel(net.minecraft.resources.ResourceLocation)'](new RL('grindless', 'block/machines/' + (tier === 7 ? 'hv_hatch' : 'lv_hatch')))",
    "  })",
    "  if (false) event.create('plant', 'multiblock').workableCasingModel('grindless:block/x', 'grindless:block/multiblock/dormant')",
    '})',
  ].join('\n'));
  const px = png(16, 16, (x, y) => [x * 10, y * 10, 100, 255]);
  fs.writeFileSync(path.join(tex, 'cover', 'c_lv.png'), px);
  fs.writeFileSync(path.join(tex, 'cover', 'c_emissive.png'), px);
  fs.writeFileSync(path.join(tex, 'machines', 'hv_hatch', 'overlay_front.png'), px);
  fs.writeFileSync(path.join(tex, 'multiblock', 'dormant', 'overlay_front.png'), px);
  fs.writeFileSync(path.join(tex, 'multiblock', 'dormant', 'overlay_front_active.png'), px);
  const { rows } = auditTextures({ root, packDir: 'pack' });
  const orphans = rows.filter((r) => r.categories.includes('orphan')).map((r) => r.path);
  assert.deepEqual(orphans, []);
});

test('analyseSamples reports level, peak and a short envelope cycle', () => {
  const rate = 8000, s = new Float32Array(rate * 6);
  for (let i = 0; i < s.length; i++) s[i] = 0.5 * Math.sin(2 * Math.PI * 440 * i / rate) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 2 * i / rate));
  const a = analyseSamples(s, rate);
  assert.equal(a.seconds, 6);
  assert.ok(a.peakDb < -5 && a.peakDb > -7, `peak ${a.peakDb}`);
  assert.ok(a.cycleStrength > 0.85 && a.cycleSeconds <= 0.52, `cycle ${a.cycleSeconds} ${a.cycleStrength}`);
});

test('decodeVorbis decodes a real loop of the pack to a plausible length and level', (t) => {
  const dir = path.join(ROOT, 'pack', 'kubejs', 'assets', 'grindless', 'sounds');
  const ogg = fs.existsSync(dir) ? fs.readdirSync(dir).find((n) => n.endsWith('.ogg')) : null;
  if (!ogg) return t.skip('no .ogg in the pack');
  const d = decodeVorbis(fs.readFileSync(path.join(dir, ogg)));
  assert.equal(d.channels, 1);
  const a = analyseSamples(d.samples, d.rate);
  assert.ok(a.seconds > 1 && a.seconds < 30, `length ${a.seconds}`);
  assert.ok(a.rmsDb < 0 && a.rmsDb > -60, `rms ${a.rmsDb}`);
});
