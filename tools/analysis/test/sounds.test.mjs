// Working-sound loops (QR-E0, docs/quality/sounds.md): the spec (tools/assets/sounds.json), the shipped sounds.json, the .ogg files and
// the recipe-type wiring in startup_scripts/grindless/sounds.js must agree, and every loop stays inside the size budget.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { decodeVorbis, analyseSamples } from '../assets-audit.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const spec = JSON.parse(fs.readFileSync(path.join(root, 'tools/assets/sounds.json'), 'utf8'));
const assets = path.join(root, 'pack/kubejs/assets/grindless');
const index = JSON.parse(fs.readFileSync(path.join(assets, 'sounds.json'), 'utf8'));
const script = fs.readFileSync(path.join(root, 'pack/kubejs/startup_scripts/grindless/sounds.js'), 'utf8');
const MAX_BYTES = 100 * 1024;
const MAX_SECONDS = 12;
const RMS_RANGE = [-33, -20]; // mastered to -24 dBFS RMS; impulsive files may sit lower
const PEAK_MAX = -2; // mastered to -3 dBFS, the Vorbis encoder may overshoot a little

const wiring = {};
const block = script.match(/const WIRING = \{([\s\S]*?)\n  \}/);
for (const m of (block ? block[1] : '').matchAll(/'([^']+)':\s*'([^']+)'/g)) wiring[m[1]] = m[2];

test('every spec row is complete and unique', () => {
  const ids = new Set();
  for (const s of spec.sounds) {
    assert.match(s.id, /^[a-z0-9_]+$/, `bad id ${s.id}`);
    assert.ok(!ids.has(s.id), `duplicate ${s.id}`);
    ids.add(s.id);
    assert.ok(s.prompt && s.prompt.length > 20, `${s.id}: prompt`);
    assert.ok(s.duration >= 0.5 && s.duration <= 30, `${s.id}: duration outside the ElevenLabs 0.5-30 s range`);
    assert.ok(s.volume > 0 && s.volume <= 1, `${s.id}: volume`);
    assert.ok(Number.isInteger(s.quality), `${s.id}: quality`);
    assert.match(s.recipeType, /^gtceu:[a-z0-9_]+$/, `${s.id}: recipeType`);
  }
});

test('sounds.json lists exactly the spec rows whose .ogg exists, with the spec volume', () => {
  const expected = spec.sounds.filter((s) => fs.existsSync(path.join(assets, 'sounds', `${s.id}.ogg`))).map((s) => s.id).sort();
  assert.deepEqual(Object.keys(index), expected);
  for (const s of spec.sounds) {
    const e = index[s.id];
    if (!e) continue;
    assert.equal(e.sounds.length, 1);
    assert.equal(e.sounds[0].name, `grindless:${s.id}`);
    assert.equal(e.sounds[0].volume, s.volume);
  }
});

test('no stray .ogg without a spec row, every loop is Ogg and within the size budget', () => {
  const ids = new Set(spec.sounds.map((s) => s.id));
  for (const f of fs.readdirSync(path.join(assets, 'sounds'))) {
    assert.match(f, /\.ogg$/, `${f}: only .ogg`);
    assert.ok(ids.has(f.replace(/\.ogg$/, '')), `${f}: no row in tools/assets/sounds.json`);
    const buf = fs.readFileSync(path.join(assets, 'sounds', f));
    assert.equal(buf.subarray(0, 4).toString('latin1'), 'OggS', `${f}: not an Ogg stream`);
    assert.ok(buf.length <= MAX_BYTES, `${f}: ${buf.length} bytes, budget ${MAX_BYTES}`);
  }
});

test('sounds.js wires every spec row to its recipe type, and nothing else', () => {
  const fromSpec = Object.fromEntries(spec.sounds.map((s) => [s.recipeType, s.id]));
  assert.deepEqual(wiring, fromSpec);
});

// Every event of the index must have its file, mono, short, within budget and inside the level bounds (docs/quality/sounds.md).
function checkSounds(ids, dir) {
  const problems = [];
  for (const id of ids) {
    const file = path.join(dir, `${id}.ogg`);
    if (!fs.existsSync(file)) { problems.push(`${id}: no .ogg file`); continue; }
    const buf = fs.readFileSync(file);
    if (buf.length > MAX_BYTES) problems.push(`${id}: ${buf.length} bytes, budget ${MAX_BYTES}`);
    let d;
    try { d = decodeVorbis(buf); } catch (e) { problems.push(`${id}: cannot decode (${e.message})`); continue; }
    if (d.channels !== 1) problems.push(`${id}: ${d.channels} channels, loops must be mono`);
    const r = analyseSamples(d.samples, d.rate);
    if (r.seconds > MAX_SECONDS) problems.push(`${id}: ${r.seconds} s, at most ${MAX_SECONDS}`);
    if (r.rmsDb < RMS_RANGE[0] || r.rmsDb > RMS_RANGE[1]) problems.push(`${id}: rms ${r.rmsDb} dBFS outside ${RMS_RANGE.join('..')}`);
    if (r.peakDb > PEAK_MAX) problems.push(`${id}: peak ${r.peakDb} dBFS above ${PEAK_MAX}`);
  }
  return problems;
}

test('every event in the index has its .ogg, mono, at most 12 s, in budget and inside the level bounds', () => {
  assert.deepEqual(checkSounds(Object.keys(index), path.join(assets, 'sounds')), []);
});

test('every spec row is in the index (no event is silent)', () => {
  assert.deepEqual(spec.sounds.map((s) => s.id).filter((id) => !index[id]), []);
});

test('the sound gate reports a missing file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sounds-'));
  try {
    const real = fs.readdirSync(path.join(assets, 'sounds'))[0];
    fs.copyFileSync(path.join(assets, 'sounds', real), path.join(dir, 'good.ogg'));
    const problems = checkSounds(['good', 'absent'], dir);
    assert.deepEqual(problems, ['absent: no .ogg file']);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});