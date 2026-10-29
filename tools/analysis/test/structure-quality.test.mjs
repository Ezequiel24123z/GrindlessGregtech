// Shape quality gate (rubric: docs/quality/structures.md).
//   - synthetic fixtures prove measure / violations / compare;
//   - no `const` declared inside a loop in startup_scripts: Rhino initialises it once per call, so a pattern builder that
//     computes `const edge = ...` per cell collapses into a solid block in game while Node (T0) still sees the hollow shape;
//   - every Pat.frame material is a GTM frame material seen natively (an unknown id aborts startup);
//   - the pack's structures (static run) do not get worse than tools/analysis/structure_quality.json.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { measure, violations, compare, findLoopConsts, scanLoopConsts, analyzeAll, baselineEntry } from '../lib/structure_quality.mjs';
import { loadStructures } from '../structure-quality.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const PACK = path.resolve(here, '..', '..', '..', 'pack');

const sym = {
  C: { kind: 'blocks', blocks: ['gtceu:casing'] },
  G: { kind: 'blocks', blocks: ['minecraft:glass'] },
  F: { kind: 'frames', materials: ['steel'] },
  '@': { kind: 'controller' },
};
const full = (ch, w, h, d) => Array.from({ length: d }, () => Array.from({ length: h }, () => ch.repeat(w)));

test('a solid single-block cuboid is flagged', () => {
  const s = full('C', 5, 5, 5);
  s[4][2] = 'CC@CC';
  const v = violations(measure({ id: 'x', slices: s, symbols: sym }));
  assert.ok(v.includes('solid-cuboid'));
  assert.ok(v.includes('few-block-types'));
});

test('a varied structure is clean', () => {
  const s = [
    ['CFC', 'GGG', 'CFC'],
    ['FCF', 'G G', 'FCF'],
    ['C@C', 'GGG', 'CFC'],
  ];
  const m = measure({ id: 'y', slices: s, symbols: sym });
  assert.equal(m.solidCuboid, false);
  assert.ok(m.blockTypes >= 3);
});

test('compare fails only on new or worsened violations', () => {
  const bad = { violations: ['solid-cuboid'], blockTypes: 1, dominantShare: 0.9, cells: 100 };
  const base = { a: baselineEntry(bad) };
  assert.deepEqual(compare({ a: bad }, base), []);
  assert.ok(compare({ a: { ...bad, violations: ['solid-cuboid', 'mono-block'] } }, base).length > 0);
  assert.ok(compare({ b: bad }, base).length > 0);
  assert.deepEqual(compare({ b: { ...bad, violations: [] } }, base), []);
});

test('findLoopConsts flags const inside loops only', () => {
  assert.equal(findLoopConsts('for (var i=0;i<3;i++) {\n  const e = i === 0\n}').length, 1);
  assert.equal(findLoopConsts('for (var i=0;i<3;i++) {\n  var e = i === 0\n}').length, 0);
  assert.equal(findLoopConsts('const a = 1\nfunction f(){ const b = 2 }').length, 0);
});

test('startup_scripts declare no const inside a loop (Rhino keeps the first iteration value)', () => {
  const hits = scanLoopConsts(PACK);
  assert.deepEqual(hits.map((h) => `${h.file}:${h.line}`), []);
});

let packStructures = null;
const loadPack = () => (packStructures ??= loadStructures(['--static']));

// GTM material ids already seen as gtceu:<m>_frame in a native dump. Pat.frame throws at startup on an unknown id
// ('tungstensteel' aborted every later GTM registration), and the Node stand-in cannot tell. Add a material only after
// confirming its frame block in a dump; GTM ids use underscores (tungsten_steel, stainless_steel).
const KNOWN_FRAME_MATERIALS = new Set([
  'aluminium', 'bronze', 'hsss', 'naquadah_alloy', 'stainless_steel', 'steel', 'titanium', 'tungsten_steel',
]);

test('every Pat.frame material is a known GTM frame material', async () => {
  const bad = [];
  const walk = (o, id) => {
    if (!o || typeof o !== 'object') return;
    if (o.kind === 'frames') (o.materials || []).forEach((m) => KNOWN_FRAME_MATERIALS.has(m) || bad.push(`${id}: ${m}`));
    else Object.values(o).forEach((v) => walk(v, id));
  };
  for (const s of Object.values(await loadPack())) walk(s.symbols, s.id);
  assert.deepEqual(bad, []);
});

test('pack structures do not regress against the baseline', async () => {
  const structures = await loadPack();
  const analysis = analyzeAll(structures, PACK);
  const base = JSON.parse(fs.readFileSync(path.join(here, '..', 'structure_quality.json'), 'utf8'));
  assert.deepEqual(compare(analysis, base), []);
});
