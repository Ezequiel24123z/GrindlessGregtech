// EMI-1: recipe info lines must fit the wrapped cap (startup_scripts/grindless/integration/recipe_info_wrap.js) and every dimension of ours
// has a marker with an English name (startup_scripts/grindless/integration/dimension_markers.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../assets-audit.mjs';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { unresolvedDataInfoKeys, loadDumpRecipes } from '../data-info-keys.mjs';

const KUBEJS = path.join(ROOT, 'pack', 'kubejs');
const read = (...p) => fs.readFileSync(path.join(KUBEJS, ...p), 'utf8');

// 8 wrapped lines of about 26 characters at the default font in the narrowest box (150 px), less word-wrap slack
export const MAX_INFO_CHARS = 190;

// Texts already over the cap when the check was added; they end with "..." in EMI until their packages shorten them. A new text may not join.
const KNOWN_LONG = new Set([]);

const clientDir = path.join(KUBEJS, 'client_scripts', 'grindless');
const PACK = path.join(ROOT, 'pack');
// the effective en_us: ClientEvents.lang callbacks evaluated, entries split over several lines included
let effective = null;
const enUs = () => effective || (effective = runPackScripts(PACK).lang.en_us || {});

test('no recipe info text of ours is longer than the wrapped cap', () => {
  const tooLong = [];
  const stale = [];
  const lang = enUs();
  for (const [k, v] of Object.entries(lang)) {
    if (!k.startsWith('gtceu.recipe.')) continue;
    if (String(v).length > MAX_INFO_CHARS && !KNOWN_LONG.has(k)) tooLong.push(`${k} (${String(v).length} > ${MAX_INFO_CHARS})`);
  }
  for (const k of KNOWN_LONG) if (lang[k] === undefined) stale.push(k);
  assert.deepEqual(tooLong, [], 'shorten these recipe info texts');
  assert.deepEqual(stale, [], 'remove these from KNOWN_LONG (the text is gone)');
});

test('no two items or blocks of ours share an English name', () => {
  const byName = new Map();
  for (const [k, v] of Object.entries(enUs())) {
    const m = /^(?:item|block)\.grindless\.([a-z0-9_]+)$/.exec(k);
    if (!m) continue;
    if (!byName.has(v)) byName.set(v, new Set());
    byName.get(v).add(m[1]);
  }
  const dup = [...byName].filter(([, ids]) => ids.size > 1).map(([n, ids]) => [n, [...ids]]).map(([n, ids]) => `${n}: ${ids.join(', ')}`);
  assert.deepEqual(dup, [], 'give each id its own name');
});

test('the data-info key check finds a missing note and accepts a present one', () => {
  const recipes = [
    { i: 'x/present',     t: 'gtceu:fluorspar_digestion', j: { data: { grindless_fluorspar_kiln: 'hf_from_alkali_fluoride' } } },
        { i: 'x/absent', t: 'gtceu:fluorspar_digestion', j: { data: { grindless_fluorspar_kiln: 'no_such_recipe_zz' } } },
  ];
  const r = unresolvedDataInfoKeys({ packDir: PACK, recipes, lang: enUs() });
  assert.ok(r.evaluations >= 2 && r.errors === 0);
  assert.deepEqual([...r.missing.keys()], ['gtceu.recipe.grindless_fluorspar_kiln.no_such_recipe_zz']);
});

// needs the clean native dump (GG_DUMP); skipped without it (T0 has none)
const DUMP = process.env.GG_DUMP && fs.existsSync(path.join(process.env.GG_DUMP, 'recipes.json')) ? process.env.GG_DUMP : null;

test('every native recipe note a registered info callback asks for has an English text', { skip: !DUMP }, () => {
  const r = unresolvedDataInfoKeys({ packDir: PACK, recipes: loadDumpRecipes(DUMP), lang: enUs() });
  assert.ok(r.evaluations > 1000);
  assert.deepEqual([...r.missing.keys()], []);
});

test('the combined cycle script copies the air flag with the dimensions it copies', () => {
  const src = read('server_scripts', 'grindless', 'ev', 'combined_cycle_and_hot_mill.js');
  assert.match(src, /air: where\.site === 'copied' && Number\(\(j\.data \|\| \{\}\)\.grindless_air\) > 0/);
  assert.match(src, /if \(p\.air\) b\.addData\('grindless_air', 1\)/);
});

test('every dimension of ours has a marker row and an English name', () => {
  const rows = [...read('startup_scripts', 'grindless', 'integration', 'dimension_markers.js').matchAll(/\['([a-z0-9_]+:[a-z0-9_]+)', '([a-z0-9_]+:[a-z0-9_]+)', (\d+)\]/g)];
  const ids = new Set(rows.map((m) => m[1]));
  assert.equal(ids.size, rows.length, 'duplicate marker row');
  for (const m of rows) assert.ok(Number(m[3]) >= 0 && Number(m[3]) < 99, `tier of ${m[1]}`);
  const lang = read('client_scripts', 'grindless', 'dimension_markers_lang.js');
  const names = new Set([...lang.matchAll(/'([a-z0-9_]+\.[a-z0-9_]+)': '[^']+'/g)].map((m) => m[1]));
  const wanted = fs.readdirSync(path.join(KUBEJS, 'data', 'grindless', 'dimension')).filter((n) => n.endsWith('.json')).map((n) => 'grindless:' + n.slice(0, -5));
  for (const w of wanted) assert.ok(ids.has(w), `no marker row for ${w}`);
  for (const id of ids) assert.ok(names.has(id.replace(':', '.')), `no English name for ${id}`);
  assert.equal(names.size, ids.size, 'a name without a marker row');
});
