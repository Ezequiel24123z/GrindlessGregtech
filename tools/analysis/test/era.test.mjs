// Era-aware pricing (P2-T): a cost matrix era is priced only with the recipes and sources a player can use at that era.
// Fixtures only (in-memory dumps and injected era contexts); T0: local, deterministic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pricedRows, coreIndex, keyCandidates } from '../cost-matrix.mjs';
import { buildEraContext, recipeEra, eraIdx, scanStartupEras } from '../lib/era.mjs';
import { mkDump, gt, gi } from './helpers.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const realCfg = JSON.parse(fs.readFileSync(path.join(here, '..', 'cost_matrix.json'), 'utf8'));
const cfg = {
  ...realCfg,
  tiers: ['mv', 'hv'],
  groups: { hull: ['gtceu:${t}_machine_hull'] },
  superconductorWire: {},
  circuits: { tagPrefix: 'forge:circuits/' },
  capstones: {},
  controllers: {},
};
const ITEMS = ['gtceu:mv_machine_hull', 'gtceu:hv_machine_hull'];
const plateSource = gt('x:plate_source', 'gtceu:rock_breaker', { outs: [gi('x:plate')], eut: 8 });
const hull = (id, tier, plates, o = {}) => gt(id, o.type || 'gtceu:assembler', { ins: [gi('x:plate', plates)], outs: [gi(`gtceu:${tier}_machine_hull`)], eut: o.eut ?? 30, conditions: o.conditions });
const index = (dump, ctx) => coreIndex(pricedRows(dump, cfg, { eraCtx: ctx }).rows, cfg.tiers);

test('a cheaper route of a later era does not price an earlier key item', () => {
  const dump = mkDump({ recipes: [plateSource, hull('x:mv_slow', 'mv', 4, { eut: 120 }), hull('x:mv_ev', 'mv', 1, { eut: 2048 }), hull('x:hv', 'hv', 4, { eut: 512 })], items: ITEMS });
  const ctx = buildEraContext({ machines: [{ id: 'x:asm', types: ['gtceu:assembler'] }] });
  assert.equal(recipeEra({ eut: 2048, type: 'gtceu:assembler', conditions: [] }, ctx), eraIdx('ev'));
  assert.equal(index(dump, ctx).get('mv').index, 4);
  assert.equal(coreIndex(pricedRows(dump, { ...cfg, settings: { ...cfg.settings, eraAware: false } }).rows, cfg.tiers).get('mv').index, 1);
});

test('a dimension-locked source or recipe counts from the era that reaches the dimension', () => {
  const dim = [{ type: 'dimension', dimension: 'x:far' }];
  const dump = mkDump({ recipes: [plateSource, hull('x:mv', 'mv', 4), hull('x:mv_far', 'mv', 1, { conditions: dim }), hull('x:hv', 'hv', 4, { eut: 120 })], items: ITEMS });
  const ctx = buildEraContext({ startup: new Map([['x:far', eraIdx('hv')]]), machines: [{ id: 'x:asm', types: ['gtceu:assembler'] }] });
  const idx = index(dump, ctx);
  assert.equal(idx.get('mv').index, 4, 'not before the dimension is reachable');
  assert.equal(idx.get('hv').index, 4, 'the hv hull has no cheaper route of its own');
  const far = mkDump({ recipes: [plateSource, hull('x:mv', 'mv', 4), hull('x:mv_far', 'mv', 1, { conditions: dim })], items: ITEMS });
  const late = pricedRows(far, { ...cfg, tiers: ['mv'] }, { eraCtx: ctx }).rows.find((r) => r.item === 'gtceu:mv_machine_hull');
  assert.equal(late.score, 4);
});

test('a type only our multiblock runs belongs to the era of that multiblock; a singleblock keeps it voltage-limited', () => {
  const machines = [{ id: 'x:big', types: ['x:big_type'], mb: true }, { id: 'x:small', types: ['x:small_type'] }, { id: 'x:big2', types: ['x:small_type'], mb: true }];
  const ctx = buildEraContext({ startup: new Map([['x:big', 5], ['x:big2', 5]]), own: new Set(['x:big', 'x:big2']), machines });
  assert.equal(recipeEra({ eut: 30, type: 'x:big_type', conditions: [] }, ctx), 5);
  assert.equal(recipeEra({ eut: 120, type: 'x:small_type', conditions: [] }, ctx), eraIdx('mv'));
  // M2-02 (a): a type that a multiblock of GTM's own (not ours) runs is limited by voltage only, whatever the multiblock's id
  const native = buildEraContext({ startup: new Map([['gtceu:fusion_reactor_1', 5]]), machines: [{ id: 'gtceu:fusion_reactor_1', types: ['gtceu:fusion_reactor'], mb: true }] });
  assert.equal(recipeEra({ eut: 30, type: 'gtceu:fusion_reactor', conditions: [] }, native), eraIdx('lv'));
});

test('items nothing ever gives the player (class C) are not key items; unreachable keys are priced by a later era and flagged', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'era-never-'));
  const never = path.join(dir, 'hidden_until.json');
  fs.writeFileSync(never, JSON.stringify({ groups: [{ material: 'm', until: 'never', items: ['gtceu:mv_machine_hull'] }, { material: 'k', until: 'mv', items: ['gtceu:hv_machine_hull'] }] }));
  try {
    const dump = mkDump({ recipes: [plateSource, hull('x:mv', 'mv', 4), hull('x:hv', 'hv', 4, { eut: 120 })], items: ITEMS });
    const cfgNever = { ...cfg, settings: { ...cfg.settings, neverFile: never } };
    const { slots, missing } = keyCandidates(cfgNever, dump);
    assert.deepEqual(slots.map((s) => s.present[0]), ['gtceu:hv_machine_hull']);
    assert.equal(missing.length, 1);
    assert.deepEqual(pricedRows(dump, cfgNever, { eraCtx: buildEraContext() }).rows.map((r) => r.item), ['gtceu:hv_machine_hull']);

    const lateDump = mkDump({ recipes: [plateSource, hull('x:mv_ev', 'mv', 2, { eut: 2048 })], items: ['gtceu:mv_machine_hull'] });
    const row = pricedRows(lateDump, { ...cfg, tiers: ['mv'] }, { eraCtx: buildEraContext() }).rows[0];
    assert.equal(row.status, 'ok');
    assert.equal(row.late, 'ev');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('the startup scan gives the first era folder that names an id', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'era-scan-'));
  try {
    for (const [era, body] of [['lv', 'gtceu:a gtceu:b'], ['hv', 'gtceu:b gcyr:c'], ['moon', 'gtceu:z']]) {
      fs.mkdirSync(path.join(dir, era));
      fs.writeFileSync(path.join(dir, era, 'x.js'), body);
    }
    const m = scanStartupEras(dir);
    assert.equal(m.get('gtceu:a'), eraIdx('lv'));
    assert.equal(m.get('gtceu:b'), eraIdx('lv'));
    assert.equal(m.get('gcyr:c'), eraIdx('hv'));
    assert.equal(m.has('gtceu:z'), false, 'folders that are not eras are not scanned');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
