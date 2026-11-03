// FIX-IDS guard: a recipe id carries its type once. GTM's KubeJS builder prefixes the type to the path it is given, so a script
// that passes 'grindless:<type>/<name>' ends up with 'grindless:<type>/<type>/<name>'. Scripts pass 'grindless:<name>' instead.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');

const DOUBLED = /^[a-z0-9_.-]+:([a-z0-9_]+)\/\1\//;
const doubledIds = (ids) => ids.filter((id) => DOUBLED.test(id));

test('the guard flags a doubled id and passes a single one', () => {
  assert.deepEqual(doubledIds(['grindless:pgm_refining/pgm_refining/uhv/iridium_crucible']), ['grindless:pgm_refining/pgm_refining/uhv/iridium_crucible']);
  assert.deepEqual(doubledIds(['grindless:pgm_refining/uhv/iridium_crucible', 'grindless:assembler/uhv/assembler_part', 'gtceu:assembler/x']), []);
});

test('the static run has no doubled recipe id and every id is unique', () => {
  const recipes = runPackScripts(pack).docs.recipes.recipes;
  const ids = recipes.map((r) => r.i);
  assert.deepEqual(doubledIds(ids), []);
  assert.equal(new Set(ids).size, ids.length, 'recipe ids are unique');
});
