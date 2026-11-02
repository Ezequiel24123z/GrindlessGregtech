// cost-matrix.mjs --table / --solve on a one-recipe-per-era fixture (RF-2A): the solver finds the factor that puts the core index
// on the curve, and the predicted index is what the rule gives. T0: local, deterministic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { measure, solveFactors, pricedRows, coreIndex, curved, fixShapedCounts, priceDump, keyCandidates, gateViolations } from '../cost-matrix.mjs';
import { loadRule, loadTables, withFactors, TABLE_DIR } from '../lib/cost_curve.mjs';
import { mkDump } from './helpers.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const rule = loadRule();
const realCfg = JSON.parse(fs.readFileSync(path.join(here, '..', 'cost_matrix.json'), 'utf8'));

// one key group (the hull), no controllers, circuits or capstones: the core index is the hull's score
const cfg = {
  ...realCfg,
  tiers: ['mv', 'hv'],
  groups: { hull: ['gtceu:${t}_machine_hull'] },
  superconductorWire: {},
  circuits: { tagPrefix: 'forge:circuits/' },
  capstones: {},
  controllers: {},
};

const plates = (n) => ({ content: { type: 'gtceu:sized', count: n, ingredient: { item: 'x:plate' } }, chance: 10000, maxChance: 10000, tierChanceBoost: 0 });
const water = (n) => ({ content: { amount: n, value: [{ fluid: 'x:acid' }] }, chance: 10000, maxChance: 10000, tierChanceBoost: 0 });
const hull = (tier, n, mb, eut) => ({
  id: `gtceu:assembler/hull_${tier}`,
  type: 'gtceu:assembler',
  json: {
    type: 'gtceu:assembler', duration: 100,
    inputs: { item: [plates(n)], fluid: mb ? [water(mb)] : [] },
    outputs: { item: [{ content: { type: 'gtceu:sized', count: 1, ingredient: { item: `gtceu:${tier}_machine_hull` } }, chance: 10000, maxChance: 10000, tierChanceBoost: 0 }], fluid: [] },
    tickInputs: { eu: [{ content: eut, chance: 10000, maxChance: 10000, tierChanceBoost: 0 }] },
    tickOutputs: { eu: [] },
    recipeConditions: [],
  },
});

// a recipe that consumes nothing makes a base resource (cost.mjs sourceAsBase)
const source = {
  id: 'x:plate_source',
  type: 'gtceu:rock_breaker',
  json: { type: 'gtceu:rock_breaker', duration: 20, inputs: {}, outputs: { item: [{ content: { type: 'gtceu:sized', count: 1, ingredient: { item: 'x:plate' } }, chance: 10000, maxChance: 10000, tierChanceBoost: 0 }], fluid: [] }, tickInputs: { eu: [{ content: 8, chance: 10000, maxChance: 10000, tierChanceBoost: 0 }] }, tickOutputs: { eu: [] }, recipeConditions: [] },
};
const dump = () => mkDump({ recipes: [source, hull('mv', 2, 0, 30), hull('hv', 4, 0, 120)], items: ['gtceu:mv_machine_hull', 'gtceu:hv_machine_hull'] });

test('the core index of a one-group era is the key item score', () => {
  const rows = pricedRows(dump(), cfg).rows;
  const idx = coreIndex(rows, cfg.tiers);
  assert.equal(idx.get('mv').index, 2);
  assert.equal(idx.get('hv').index, 4);
});

test('the committed tables forced off change nothing, enabled ones apply their factors, and a factor changes the index as the rule says', () => {
  const { tables } = loadTables(TABLE_DIR);
  const off = curved(dump(), tables.map((t) => ({ ...t, enabled: false })));
  assert.equal(off.res.changed.size, 0);
  const committed = curved(dump(), tables);
  const eras = tables.filter((t) => t.enabled && cfg.tiers.includes(t.era));
  assert.equal(committed.res.changed.size, eras.length);
  const idxC = coreIndex(pricedRows(committed.dump, cfg).rows, cfg.tiers);
  for (const t of eras) assert.ok(Math.abs(idxC.get(t.era).index - rule.scaledCount({ mv: 2, hv: 4 }[t.era], t.item, 'x:plate')) < 1e-6, t.era);
  const on = curved(dump(), withFactors(tables, { mv: { item: 2.5, fluid: 2.5 } }));
  assert.deepEqual([...on.res.changed.keys()], ['gtceu:assembler/hull_mv']);
  assert.equal(coreIndex(pricedRows(on.dump, cfg).rows, cfg.tiers).get('mv').index, 5);
});

test('--solve: factors that put each era on 3 x 2.5^n, MV first, within the tolerance', () => {
  const log = console.log;
  console.log = () => {};
  let res;
  try {
    res = solveFactors({ table: TABLE_DIR }, cfg, dump());
  } finally {
    console.log = log;
  }
  const mv = coreIndex(res.after.rows, cfg.tiers).get('mv').index;
  const hv = coreIndex(res.after.rows, cfg.tiers).get('hv').index;
  assert.ok(Math.abs(mv / 3 - 1) <= 0.1, `mv ${mv}`);
  assert.ok(Math.abs(hv / 7.5 - 1) <= 0.1, `hv ${hv}`);
});

test('--solve predicts what the factor check measures: a later era\'s remove list applies to an earlier era in both', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gg-cc-'));
  try {
    for (const f of fs.readdirSync(TABLE_DIR)) fs.copyFileSync(path.join(TABLE_DIR, f), path.join(dir, f));
    const hvT = JSON.parse(fs.readFileSync(path.join(dir, 'hv.json'), 'utf8'));
    hvT.remove = ['gtceu:assembler/bypass_mv'];
    fs.writeFileSync(path.join(dir, 'hv.json'), JSON.stringify(hvT));
    const bypass = hull('mv', 1, 0, 30);
    bypass.id = 'gtceu:assembler/bypass_mv';
    const d = mkDump({ recipes: [source, hull('mv', 2, 0, 30), bypass, hull('hv', 4, 0, 120)], items: ['gtceu:mv_machine_hull', 'gtceu:hv_machine_hull'] });
    const log = console.log;
    console.log = () => {};
    let res;
    try {
      res = solveFactors({ table: dir }, cfg, d);
    } finally {
      console.log = log;
    }
    const { tables } = loadTables(dir);
    const m = measure(d, cfg, tables, res.factors);
    for (const era of cfg.tiers) {
      assert.equal(res.predicted[era], m.index.get(era).index, `${era}: solver prediction vs factor check`);
      assert.equal(coreIndex(res.after.rows, cfg.tiers).get(era).index, m.index.get(era).index, `${era}: final measurement`);
    }
    assert.ok(m.res.removed.has('gtceu:assembler/bypass_mv'), 'the bypass is removed in the check');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('shaped recipes count every pattern cell, and an unmatched symbol table is left alone', () => {
  const n = { shape: 'shaped', inputs: [{ count: 1 }, { count: 1 }] };
  fixShapedCounts(n, { pattern: ['AAA', 'ABA', 'AAA'], key: { A: {}, B: {} } });
  assert.deepEqual(n.inputs.map((i) => i.count), [8, 1]);
  const odd = { shape: 'shaped', inputs: [{ count: 1 }] };
  fixShapedCounts(odd, { pattern: ['AB'], key: { A: {}, B: {} } });
  assert.equal(odd.inputs[0].count, 1);
  const shapeless = { shape: 'shapeless', inputs: [{ count: 1 }] };
  fixShapedCounts(shapeless, { pattern: ['AA'], key: { A: {} } });
  assert.equal(shapeless.inputs[0].count, 1);
});

test('melt.always: a metal another recipe makes still gets the synthetic melt from its ingot; off, it does not', () => {
  const d = () => mkDump({
    recipes: [source, { ...hull('mv', 2, 0, 30), id: 'x:remelt', json: { ...hull('mv', 2, 0, 30).json, outputs: { item: [], fluid: [{ content: { amount: 144, value: [{ fluid: 'x:metal' }] }, chance: 10000, maxChance: 10000, tierChanceBoost: 0 }] } } }],
    items: ['x:metal_ingot', 'gtceu:mv_machine_hull'], fluids: ['x:metal'],
  });
  const has = (always) => priceDump(d(), { ...cfg, settings: { ...cfg.settings, melt: { mbPerItem: 144, itemSuffixes: ['_ingot'], always } } })
    .recipes.some((r) => r.id === 'synthetic/melt/x:metal');
  assert.equal(has(true), true);
  assert.equal(has(false), false);
});

test('circuits.skip drops matching tag members from the key items', () => {
  const d = mkDump({ items: ['gtnn:a', 'gtceu:b'], tagsItem: { 'forge:circuits/mv': ['gtnn:a', 'gtceu:b'] } });
  const c = { ...cfg, tiers: ['mv'], groups: {}, circuits: { tagPrefix: 'forge:circuits/', skip: ['gtnn:*'] } };
  assert.deepEqual(keyCandidates(c, d).slots.map((s) => s.present[0]), ['gtceu:b']);
});

test('the committed circuits.skip drops only the never-obtainable circuit, not a live gtnn one', () => {
  assert.deepEqual(realCfg.circuits.skip, ['extendedfeatures:opv_universal_circuit']);
  const d = mkDump({ items: ['gtnn:a', 'extendedfeatures:opv_universal_circuit'], tagsItem: { 'forge:circuits/mv': ['gtnn:a', 'extendedfeatures:opv_universal_circuit'] } });
  const c = { ...realCfg, tiers: ['mv'], groups: {}, circuits: { tagPrefix: 'forge:circuits/', skip: realCfg.circuits.skip } };
  assert.deepEqual(keyCandidates(c, d).slots.map((s) => s.present[0]), ['gtnn:a']);
});

test('base: water is free before LuV, and raw_* is base only when no recipe makes it', () => {
  const rawMade = {
    id: 'x:make_raw', type: 'gtceu:assembler',
    json: { ...hull('mv', 2, 0, 30).json, outputs: { item: [{ content: { type: 'gtceu:sized', count: 1, ingredient: { item: 'x:raw_zinc' } }, chance: 10000, maxChance: 10000, tierChanceBoost: 0 }], fluid: [] } },
  };
  const d = mkDump({ recipes: [source, rawMade, hull('mv', 2, 0, 30)], items: ['x:raw_zinc', 'x:raw_tin', 'gtceu:mv_machine_hull'], fluids: ['minecraft:water'] });
  const { isBase } = priceDump(d, cfg).model;
  assert.equal(isBase('fluid:minecraft:water'), true);
  assert.equal(isBase('x:raw_tin'), true, 'no recipe makes it');
  assert.equal(isBase('x:raw_zinc'), false, 'a recipe makes it');
});

test('gateViolations: a step under the ratio fails, one at the ratio passes, and steps up to LV are not gated', () => {
  const tiers = ['ulv', 'lv', 'mv', 'hv'];
  const series = new Map([
    ['good', new Map([['lv', 10], ['mv', 13], ['hv', 17]])],
    ['flat', new Map([['lv', 10], ['mv', 12], ['hv', 15]])],
    ['early', new Map([['ulv', 10], ['lv', 11], ['mv', 15], ['hv', 20]])],
  ]);
  const v = gateViolations(series, tiers, { minRatio: 1.3, series: ['good', 'flat', 'early', 'absent'] });
  assert.deepEqual(v.map((x) => `${x.series}:${x.from}>${x.era}`), ['flat:lv>mv', 'flat:mv>hv']);
  assert.deepEqual(gateViolations(series, tiers, null), []);
});

test('the committed gate names the key-item series and a ratio above 1', () => {
  assert.ok(realCfg.outliers.gate.minRatio > 1);
  assert.ok(realCfg.outliers.gate.series.includes('hull') && realCfg.outliers.gate.series.includes('machine_casing'));
  assert.deepEqual(realCfg.groups.machine_casing, ['gtceu:${t}_machine_casing']);
});
