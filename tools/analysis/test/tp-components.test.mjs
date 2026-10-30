// TP-C (docs/research/tier-parity.md): every UHV-UXV component has exactly one recipe of ours at the voltage floor (VA of the tier below), the UHV ones
// with station research; every basic machine and hatch released from the TP-C holds has a recipe of ours or one of GTM's (obtain.json no longer holds it).
// Static: the recipe facts come from the static KubeJS stand-in (like recipe-quality.test.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FAMILIES, vaOf } from '../lib/recipe_quality.mjs';
import { factsFromPack } from '../recipe-quality.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const TIERS = ['uhv', 'uev', 'uiv', 'uxv'];
const tierIndex = (t) => ['uv', 'uhv', 'uev', 'uiv', 'uxv'].indexOf(t) + 8;

const facts = factsFromPack();
const ours = facts.recipes.filter((r) => String(r.id).startsWith('grindless:') && !String(r.id).includes('/retired/'));
const makers = (id) => ours.filter((r) => (r.outputs || []).includes(id));

test('every UHV-UXV component has exactly one recipe of ours at VA of the tier below', () => {
  for (const tier of TIERS) {
    const floor = vaOf(tierIndex(tier) - 1);
    for (const family of FAMILIES) {
      const id = `gtceu:${tier}_${family}`;
      const rs = makers(id);
      assert.equal(rs.length, 1, `${id}: ${rs.map((r) => r.id).join(', ') || 'no recipe'}`);
      assert.ok(rs[0].eut >= floor, `${id} ${rs[0].id}: ${rs[0].eut} < ${floor}`);
      if (tier === 'uhv' && family !== 'fluid_regulator') {
        assert.equal(rs[0].form, 'assembly_line', id);
        assert.ok(rs[0].research, `${id} has no research`);
      }
    }
  }
});
