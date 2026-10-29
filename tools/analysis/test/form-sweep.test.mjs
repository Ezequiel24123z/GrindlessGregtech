// QR-B1 forming sweep, checked without the game:
//   - the zone row exists, does not overlap another zone, and holds the fixture's band;
//   - the generated id list holds every multiblock the startup scripts register, once;
//   - the fixture compiles and keeps to Rhino's rules.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { buildIds, IDS_FILE } from '../form-sweep-ids.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const FIXTURE = path.join(ROOT, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_form_sweep.js');
const SOURCE = fs.readFileSync(FIXTURE, 'utf8');

function codeOnly(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/g, "''")
    .replace(/\/\/[^\n]*/g, '');
}

test('zones.json reserves the form_sweep band without overlap', () => {
  const zones = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'test', 'zones.json'), 'utf8')).zones;
  const z = zones.find((e) => e.id === 'form_sweep');
  assert.ok(z, 'row form_sweep');
  assert.deepEqual(z.x, [36064, 36127]);
  assert.deepEqual(z.z, [0, 127]);
  for (const o of zones) {
    if (o === z || !o.x || !o.z) continue;
    const xo = o.x[0] <= z.x[1] && z.x[0] <= o.x[1];
    const zo = o.z[0] <= z.z[1] && z.z[0] <= o.z[1];
    assert.ok(!(xo && zo), 'overlaps ' + o.id);
  }
});

test('the id list holds every registered multiblock exactly once', () => {
  const have = JSON.parse(fs.readFileSync(IDS_FILE, 'utf8'));
  const fresh = buildIds();
  const all = Object.values(have.eras).flat();
  assert.equal(new Set(all).size, all.length, 'duplicate ids');
  assert.deepEqual(have.eras, fresh.eras, 'stale list: run tools/analysis/form-sweep-ids.mjs --write');
  for (const id of Object.keys(have.where || {})) assert.ok(all.includes(id), 'where names an unknown id ' + id);
});

test('gg_test_form_sweep.js compiles and keeps to Rhino\'s rules', () => {
  assert.doesNotThrow(() => new vm.Script(SOURCE, { filename: 'gg_test_form_sweep.js' }));
  const code = codeOnly(SOURCE);
  assert.doesNotMatch(code, /\b(const|let)\s+[A-Za-z_$[{]/);
  assert.doesNotMatch(code, /=>/);
  assert.doesNotMatch(code, /Java\.to/);
  for (const m of SOURCE.matchAll(/\b(36[0-9]{3})\b/g)) {
    const x = Number(m[1]);
    assert.ok(x >= 36064 && x <= 36127, 'X ' + x + ' outside the band');
  }
});
