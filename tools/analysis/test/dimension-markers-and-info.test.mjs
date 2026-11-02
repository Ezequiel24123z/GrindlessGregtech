// EMI-1: recipe info lines must fit the wrapped cap (startup_scripts/grindless/integration/recipe_info_wrap.js) and every dimension of ours
// has a marker with an English name (startup_scripts/grindless/integration/dimension_markers.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../assets-audit.mjs';

const KUBEJS = path.join(ROOT, 'pack', 'kubejs');
const read = (...p) => fs.readFileSync(path.join(KUBEJS, ...p), 'utf8');

// 8 wrapped lines of about 26 characters at the default font in the narrowest box (150 px), less word-wrap slack
export const MAX_INFO_CHARS = 190;

// Texts already over the cap when the check was added; they end with "..." in EMI until their packages shorten them. A new text may not join.
const KNOWN_LONG = new Set([
  'gtceu.recipe.grindless_condensate_assembler.horizon_containment_plate',
  'gtceu.recipe.grindless_condensate_assembler.horizon_frame_part',
  'gtceu.recipe.grindless_black_hole_bomb.condensate_tap',
  'gtceu.recipe.grindless_hyper_assembly_array.hyperstargate_base',
  'gtceu.recipe.grindless_hyper_assembly_array.creative_energy',
  'gtceu.recipe.grindless_horizon_flux_clamp.horizon_flux_clamp',
  'gtceu.recipe.grindless_horizon_interferometry.cloud_phase_map',
  'gtceu.recipe.grindless_rydberg_assembly.rydberg_logic_array',
]);

const clientDir = path.join(KUBEJS, 'client_scripts', 'grindless');
const LINE = /'(gtceu\.recipe\.[^']+)'\s*,\s*'((?:[^'\\]|\\.)*)'/;

test('no recipe info text of ours is longer than the wrapped cap', () => {
  const tooLong = [];
  const stale = [];
  const seen = new Set();
  for (const f of fs.readdirSync(clientDir).filter((n) => n.endsWith('.js'))) {
    for (const line of fs.readFileSync(path.join(clientDir, f), 'utf8').split(/\r?\n/)) {
      const m = LINE.exec(line);
      if (!m) continue;
      seen.add(m[1]);
      if (m[2].length > MAX_INFO_CHARS && !KNOWN_LONG.has(m[1])) tooLong.push(`${f}: ${m[1]} (${m[2].length} > ${MAX_INFO_CHARS})`);
    }
  }
  for (const k of KNOWN_LONG) if (!seen.has(k)) stale.push(k);
  assert.deepEqual(tooLong, [], 'shorten these recipe info texts');
  assert.deepEqual(stale, [], 'remove these from KNOWN_LONG (the text is gone)');
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
