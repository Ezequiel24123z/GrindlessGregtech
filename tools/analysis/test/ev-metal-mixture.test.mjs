// LD-EV2: the metal mixture separation row (ev/metal_mixture.js) keeps its contract: 900 EU/t, five small dusts, no titanium, and an info page.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'pack', 'kubejs');
const script = fs.readFileSync(path.join(root, 'server_scripts', 'grindless', 'ev', 'metal_mixture.js'), 'utf8');
const code = script.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');

test('metal mixture row: 900 EU/t, one mixture in, the five small dusts out', () => {
  assert.match(code, /centrifuge\('grindless:metal_mixture_separation'\)/);
  assert.match(code, /itemInputs\('gtceu:metal_mixture_dust'\)/);
  assert.match(code, /\.EUt\(900\)/);
  for (const m of ['hematite', 'bauxite', 'pyrolusite', 'barite', 'chromite']) assert.ok(code.includes(`'gtceu:small_${m}_dust'`), m);
});

test('metal mixture row: no ilmenite or titanium', () => {
  assert.doesNotMatch(code, /ilmenite|titanium|rutile/i);
});

test('metal mixture row: the EMI info page points at the dust and its keys exist in en_us and es_es', () => {
  const page = JSON.parse(fs.readFileSync(path.join(root, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'ev_metal_mixture.json'), 'utf8'));
  assert.deepEqual(page.stacks, ['item:gtceu:metal_mixture_dust']);
  const lang = fs.readFileSync(path.join(root, 'client_scripts', 'grindless', 'ev_metal_mixture_lang.js'), 'utf8');
  for (const key of page.text) assert.equal(lang.split(`'${key}'`).length - 1, 2, key);
});
