// Tier configs (tools/analysis/tiers/*.json): a machine entry is keyed by `id || machine` (lib/config.mjs KEY_OF), and an entry with the
// same key replaces the earlier one, in the same file or in a tier it extends. A replacement that drops recipe types makes them vanish
// from the model without a word: D4-SHAPE-UXV-B's renamed vdW stacker entry hid UEV's vdw_assembly and failed every gate from UXV up
// (dump 9f6c318722c0). A variant of a machine (other hatches, a later voltage) needs its own id, such as "gtceu:vdw_stacker@uxv".
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'tiers');
const raw = Object.fromEntries(fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
  .map((f) => [f.slice(0, -5), JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))]));
const key = (e) => e.id || e.machine;

test('no tier file lists two machine entries with the same key', () => {
  const dups = [];
  for (const [name, t] of Object.entries(raw)) {
    const seen = new Set();
    for (const e of t.machines || []) {
      if (seen.has(key(e))) dups.push(`${name}: ${key(e)}`);
      seen.add(key(e));
    }
  }
  assert.deepEqual(dups, [], 'give each variant its own id (machine@variant)');
});

test('an entry that replaces an inherited one keeps every recipe type of it', () => {
  const lost = [];
  for (const [name, t] of Object.entries(raw)) {
    const chain = [];
    for (let p = t.extends; p && raw[p]; p = raw[p].extends) chain.push(p);
    const inherited = new Map();
    for (const a of chain.reverse()) for (const e of raw[a].machines || []) inherited.set(key(e), { e, from: a });
    for (const e of t.machines || []) {
      const parent = inherited.get(key(e));
      if (!parent || !e.types || !parent.e.types) continue;
      const missing = parent.e.types.filter((x) => !e.types.includes(x));
      if (missing.length) lost.push(`${name}: ${key(e)} drops ${missing.join(', ')} (declared in ${parent.from})`);
    }
  }
  assert.deepEqual(lost, [], 'a variant with other types needs its own id (machine@variant), or the replacement must list the inherited types');
});
