// Tests for the era rule (lib/eras.mjs): nothing from an era can need a resource that comes from a later era.
// Mini pack: Earth gives ore and bauxite; steel comes from ore; titanium comes from ilmenite, which is only gathered on the Moon
// (with the rocket); the End gives its ore with the key. Each era's items are checked with later resources removed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadTierConfig } from '../lib/config.mjs';
import { lfp, Graph } from '../lib/engine.mjs';
import { gi, gt, mkDump, run, shaped, verdicts } from './helpers.mjs';

const TIERS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'tiers');
const S = (id, inputs, result) => shaped(id, [Object.keys(inputs).join('')], Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, { item: v }])), result);
const groupOf = (r, id) => r.out.eras.groups.find((x) => x.group.id === id);
const textOf = (r, id) => groupOf(r, id).lines.join('\n');

/**
 * options (mutations): scannerTi (the HV scanner needs a titanium plate), bitTi (the HV drill needs the titanium bit),
 * leak (bauxite electrolysis gives titanium dust as a byproduct), mvEnd (an MV item needs the End's ore),
 * hullW (the EV hull needs tungsten), onlyFrom ("titanium only comes from the Moon" check).
 */
function eraPack(o = {}) {
  const recipes = [
    S('t:ingot', { O: 't:ore' }, 't:ingot'),
    S('t:steel_plate', { I: 't:ingot' }, 't:steel_plate'),
    S('t:rocket', { P: 't:steel_plate' }, 't:rocket'),
    S('t:end_key', { I: 't:ingot' }, 't:end_key'),
    S('t:ti_dust', { R: 't:raw_ilmenite' }, 't:ti_dust'),
    S('t:ti_plate', { D: 't:ti_dust' }, 't:ti_plate'),
    S('t:ti_bit', { T: 't:ti_plate' }, 't:ti_bit'),
    S('t:hv_bit', { P: 't:steel_plate' }, 't:hv_bit'),
    S('t:hv_ti_tool', { T: 't:ti_plate' }, 't:hv_ti_tool'),
    S('t:hv_scanner', o.scannerTi ? { P: 't:steel_plate', T: 't:ti_plate' } : { P: 't:steel_plate' }, 't:hv_scanner'),
    S('t:ev_hull', o.hullW ? { T: 't:ti_plate', W: 't:w_dust' } : { T: 't:ti_plate' }, 't:ev_hull'),
    S('t:mv_thing', o.mvEnd ? { I: 't:ingot', E: 't:end_ore' } : { I: 't:ingot' }, 't:mv_thing'),
    S('t:al_thing', { A: 't:al_dust' }, 't:al_thing'),
    S('t:sample', { O: 't:ore' }, 't:sample'),
    S('t:drill', { P: 't:steel_plate' }, 't:drill'),
    S('t:electrolyzer', { P: 't:steel_plate' }, 't:electrolyzer'),
    gt('t:drill/hv/a', 't:drilling', { ins: [gi('t:sample', 1, 0), gi(o.bitTi ? 't:ti_bit' : 't:hv_bit', 1, 1000)], outs: [gi('t:ore')] }),
    gt('t:electro/bauxite', 't:electrolyzer', { ins: [gi('t:bauxite')], outs: o.leak ? [gi('t:al_dust'), gi('t:ti_dust', 1, 2000)] : [gi('t:al_dust')] }),
    // recycling: undoing the EV hull gives back titanium (not a source: the hull already carries titanium)
    gt('t:electro/recycle_ev_hull', 't:electrolyzer', { ins: [gi('t:ev_hull')], outs: [gi('t:ti_dust')] }),
  ];
  const titanium = { id: 'titanium', era: 'ev', label: 'titanium', items: ['t:*ti_*', 't:raw_ilmenite'] };
  if (o.onlyFrom) titanium.onlyFrom = ['moon'];
  const cfg = {
    tier: 'hv',
    eraOrder: ['steam', 'lv', 'mv', 'hv', 'ev', 'iv'],
    unconditionalTypes: ['minecraft:crafting_shaped'],
    world: [
      { id: 'earth', mode: 'manual', bootstrap: true, items: ['t:ore', 't:bauxite'] },
      { id: 'moon-ores', mode: 'manual', bootstrap: true, needs: ['t:rocket'], origin: ['t:luna'], items: ['t:raw_ilmenite'] },
      { id: 'end-ores', mode: 'manual', bootstrap: true, needs: ['t:end_key'], origin: ['minecraft:the_end'], items: ['t:end_ore'] },
    ],
    machines: [
      { machine: 't:drill', types: ['t:drilling'] },
      { machine: 't:electrolyzer', types: ['t:electrolyzer'] },
    ],
    targets: [],
    autoTargets: [],
    eraResources: [
      { id: 'end', era: 'hv', label: 'the End', dimensions: ['minecraft:the_end'] },
      { id: 'moon', era: 'ev', label: 'the Moon', dimensions: ['t:luna'] },
      titanium,
      { id: 'tungsten', era: 'iv', label: 'tungsten', items: ['t:w_*'] },
    ],
    eraItems: [
      { id: 'mv-items', era: 'mv', items: ['t:mv_thing', 't:al_thing'] },
      { id: 'hv-pattern', era: 'hv', items: ['t:hv_*'] },
      { id: 'hv-explicit', era: 'hv', items: ['t:hv_scanner', 't:hv_bit'] },
      { id: 'hv-drill', era: 'hv', inputsOf: ['t:drill/hv/*'] },
      { id: 'hv-optional', era: 'hv', optional: true, items: ['t:not_arrived_yet'] },
      { id: 'output-hv', era: 'ev', items: ['t:ev_hull'] },
    ],
  };
  const dump = mkDump({ recipes, items: ['t:ore', 't:bauxite', 't:raw_ilmenite', 't:end_ore', 't:w_dust', 't:al_dust'] });
  return { dump, cfg };
}

const verdictsOf = (r) => Object.fromEntries(r.out.eras.groups.map((x) => [x.group.id, x.verdict]));

// ---------------------------------------------------------------- reference and mutations

test('eras: the reference pack passes; the optional one that doesn\'t exist yet warns without sinking the verdict', () => {
  const { dump, cfg } = eraPack();
  const r = run(dump, cfg, { pass: 'eras' });
  assert.deepEqual(verdictsOf(r), {
    'mv-items': 'PASS', 'hv-pattern': 'PASS', 'hv-explicit': 'PASS', 'hv-drill': 'PASS', 'hv-optional': 'WARN', 'output-hv': 'PASS',
  });
  assert.equal(r.out.verdict, 'PASS');
  assert.deepEqual(r.out.gate, []);
  assert.deepEqual(r.out.auto, []);
  assert.match(textOf(r, 'hv-optional'), /t:not_arrived_yet — doesn't exist in the registry \(hasn't arrived yet\)/);
  assert.match(r.text, /STEP 3 · ERAS/);
  assert.match(r.text, /VERDICT: PASS {2}\(eras 5\/6 \(\+1 warnings\)\)/);
});

test('eras (mutation): an HV item that needs titanium gives FAIL with the shortest chain to the EV resource', () => {
  const { dump, cfg } = eraPack({ scannerTi: true });
  const r = run(dump, cfg, { pass: 'eras' });
  assert.equal(verdictsOf(r)['hv-explicit'], 'FAIL');
  assert.equal(r.out.verdict, 'FAIL');
  const g = groupOf(r, 'hv-explicit');
  assert.deepEqual(g.violations, [{ item: 't:hv_scanner', resources: [{ id: 'titanium', era: 'ev', label: 'titanium' }] }]);
  const text = textOf(r, 'hv-explicit');
  assert.match(text, /1 of 2 need a resource from an era later than hv/);
  assert.match(text, /✗ t:hv_scanner — needs titanium \(ev\)/);
  assert.match(text, /\[t:ti_plate\] t:ti_plate {2}✗ resource from a later era: titanium \(ev\)/);
  // the chain is the shortest: it reaches the titanium plate and doesn't go down to ilmenite or the Moon
  assert.doesNotMatch(text, /raw_ilmenite|t:luna/);
  // the same item in the pattern is also a violation (it isn't titanium itself)
  assert.equal(verdictsOf(r)['hv-pattern'], 'FAIL');
});

test('eras: in a pattern, something that already belongs to a later resource (the HV titanium tool) doesn\'t count; if named explicitly, it\'s a violation', () => {
  const { dump, cfg } = eraPack();
  const r = run(dump, cfg, { pass: 'eras' });
  const g = groupOf(r, 'hv-pattern');
  assert.deepEqual(g.later, ['t:hv_ti_tool']);
  assert.equal(g.verdict, 'PASS');
  assert.match(textOf(r, 'hv-pattern'), /from a later resource \(don't count as this era's\): t:hv_ti_tool/);
  const named = run(dump, { ...cfg, eraItems: [{ id: 'hv-named', era: 'hv', items: ['t:hv_ti_tool'] }] }, { pass: 'eras' });
  assert.equal(verdictsOf(named)['hv-named'], 'FAIL');
  assert.match(textOf(named, 'hv-named'), /t:hv_ti_tool {2}✗ resource from a later era: titanium \(ev\)/);
});

test('eras: inputsOf takes each recipe input (the HV drill\'s bit) and flags the one that needs titanium', () => {
  const { dump, cfg } = eraPack({ bitTi: true });
  const r = run(dump, cfg, { pass: 'eras' });
  const g = groupOf(r, 'hv-drill');
  assert.equal(g.verdict, 'FAIL');
  assert.deepEqual(g.violations.map((v) => v.item), ['t:ti_bit']);
  assert.equal(g.counts.ok, 1, 'the sample (capital) is Earth\'s and passes');
  assert.match(textOf(r, 'hv-drill'), /✗ t:ti_bit {2}\(input of 1 recipe\(s\), e\.g\. t:drill\/hv\/a\) — needs titanium \(ev\)/);
});

test('eras: a later dimension removes its world sources; an MV item that needs the End\'s ore gives FAIL and names the source', () => {
  const { dump, cfg } = eraPack({ mvEnd: true });
  const r = run(dump, cfg, { pass: 'eras' });
  assert.equal(verdictsOf(r)['mv-items'], 'FAIL');
  const text = textOf(r, 'mv-items');
  assert.match(text, /t:mv_thing — needs the End \(hv\)/);
  assert.match(text, /t:end_ore {2}✗ only comes from minecraft:the_end \(source «end-ores»\): resource from a later era, the End \(hv\)/);
  // for HV items the End isn't later: the same item in an HV group passes
  const hv = run(dump, { ...cfg, eraItems: [{ id: 'hv-with-end', era: 'hv', items: ['t:mv_thing'] }] }, { pass: 'eras' });
  assert.equal(verdictsOf(hv)['hv-with-end'], 'PASS');
});

test('eras: a later-era byproduct is removed from the recipe, but the recipe still gives the rest', () => {
  const { dump, cfg } = eraPack({ leak: true });
  const r = run(dump, cfg, { pass: 'eras' });
  // bauxite electrolysis gives titanium for free: the aluminium still counts for MV
  assert.equal(verdictsOf(r)['mv-items'], 'PASS');
  assert.equal(groupOf(r, 'mv-items').counts.ok, 2);
});

test('eras: an era\'s output belongs to the next one; the EV hull can need titanium (EV) but not tungsten (IV)', () => {
  const ok = run(eraPack().dump, eraPack().cfg, { pass: 'eras' });
  assert.equal(verdictsOf(ok)['output-hv'], 'PASS');
  const { dump, cfg } = eraPack({ hullW: true });
  const r = run(dump, { ...cfg, world: [...cfg.world, { id: 'tungsten-test', mode: 'manual', items: ['t:w_dust'] }] }, { pass: 'eras' });
  assert.equal(verdictsOf(r)['output-hv'], 'FAIL');
  assert.match(textOf(r, 'output-hv'), /t:ev_hull — needs tungsten \(iv\)/);
});

test('eras: an explicit item that isn\'t made even with everything warns (the rule can\'t be checked) and says which later resource it needs', () => {
  const { dump, cfg } = eraPack({ hullW: true });
  const r = run(dump, cfg, { pass: 'eras' });
  // with no tungsten source the EV hull isn't made in this tier: a warning, not a violation
  assert.equal(verdictsOf(r)['output-hv'], 'WARN');
  assert.match(textOf(r, 'output-hv'), /t:ev_hull — isn't made in this tier even with every resource \(the rule can't be checked\); it also needs tungsten \(iv\)/);
  assert.equal(r.out.verdict, 'PASS');
});

// ---------------------------------------------------------------- exclusivity: "titanium only comes from the Moon"

test('eras (onlyFrom): with no leaks, no titanium key comes out without the Moon; with bauxite giving titanium, LEAK with its source (recycling doesn\'t count)', () => {
  const clean = run(eraPack({ onlyFrom: true }).dump, eraPack({ onlyFrom: true }).cfg, { pass: 'eras' });
  const ex = clean.out.eras.exclusive;
  assert.equal(ex.length, 1);
  assert.equal(ex[0].verdict, 'PASS', 'undoing the EV hull gives titanium, but the hull already needs the Moon\'s titanium');
  assert.match(ex[0].lines[0], /none of its \d+ items and fluids come out without the Moon/);
  const { dump, cfg } = eraPack({ onlyFrom: true, leak: true });
  const r = run(dump, cfg, { pass: 'eras' });
  const leak = r.out.eras.exclusive[0];
  assert.equal(leak.verdict, 'FAIL');
  assert.equal(r.out.verdict, 'FAIL');
  const text = leak.lines.join('\n');
  assert.match(text, /LEAK: \d+ of its \d+ items and fluids come out without the Moon\. They come in through 1 source\(s\) in 1 key\(s\) \(and 1 recipe\(s\) that recycle what already carries it, which don't count\)/);
  assert.match(text, /· t:ti_dust {2}← t:electrolyzer · t:electro\/bauxite/);
  assert.doesNotMatch(text, /← .*recycle_ev_hull/);
  assert.equal(leak.recycled, 1);
  assert.ok(leak.leaked.includes('t:ti_plate'));
  assert.ok(!leak.leaked.includes('t:raw_ilmenite'), 'ilmenite only comes from the Moon');
  assert.match(r.text, /FAIL {2}ev: titanium only comes from moon/);
});

// ---------------------------------------------------------------- a base outside the factory: conditions.dimension.asKeysFor

/** The lunar drill: its recipe is only valid on the Moon (dimension condition), and the trip (synthetic) gives the dim:t:luna key. */
function lunarPack({ asKeys = true } = {}) {
  const moon = [{ type: 'dimension', dimension: 't:luna' }];
  const recipes = [
    S('t:ingot', { O: 't:ore' }, 't:ingot'),
    S('t:steel_plate', { I: 't:ingot' }, 't:steel_plate'),
    S('t:rocket', { P: 't:steel_plate' }, 't:rocket'),
    S('t:lunar_drill', { P: 't:steel_plate' }, 't:lunar_drill'),
    S('t:lunar_sample', { R: 't:raw_ilmenite' }, 't:lunar_sample'),
    S('t:ti_dust', { R: 't:raw_ilmenite' }, 't:ti_dust'),
    gt('t:lunar/ilmenite', 't:lunar', { ins: [gi('t:lunar_sample', 1, 0)], outs: [gi('t:raw_ilmenite')], conditions: moon }),
  ];
  const cfg = {
    tier: 'hv',
    eraOrder: ['steam', 'lv', 'mv', 'hv', 'ev', 'iv'],
    unconditionalTypes: ['minecraft:crafting_shaped'],
    ...(asKeys ? { conditions: { dimension: { asKeysFor: ['t:luna'] } } } : {}),
    world: [
      { id: 'earth', mode: 'manual', bootstrap: true, items: ['t:ore'] },
      { id: 'moon-ores', mode: 'manual', bootstrap: true, needs: ['dim:t:luna'], origin: ['t:luna'], items: ['t:raw_ilmenite'] },
    ],
    machines: [{ machine: 't:lunar_drill', types: ['t:lunar'] }],
    synthetic: [{ id: 'moon-trip', capital: ['t:rocket'], produces: ['dim:t:luna'] }],
    targets: [
      { id: 'ilmenite', item: 't:raw_ilmenite' },
      { id: 'ilmenite-without-trip', item: 't:raw_ilmenite', without: ['synthetic:moon-trip'], expect: 'unreachable' },
    ],
    autoTargets: [
      { id: 'auto-ilmenite', item: 't:raw_ilmenite' },
      { id: 'auto-titanium', item: 't:ti_dust' },
    ],
    eraResources: [
      { id: 'moon', era: 'ev', label: 'the Moon', dimensions: ['t:luna'] },
      { id: 'titanium', era: 'ev', label: 'titanium', items: ['t:ti_*', 't:raw_ilmenite'], onlyFrom: ['moon'] },
    ],
    eraItems: [
      { id: 'hv-items', era: 'hv', items: ['t:lunar_drill', 't:rocket'] },
      { id: 'output-hv', era: 'ev', items: ['t:ti_dust'] },
    ],
  };
  return { dump: mkDump({ recipes, items: ['t:ore', 't:raw_ilmenite'] }), cfg };
}

test('asKeysFor: the recipe only valid on the Moon needs the trip\'s key; with it, lunar ilmenite is automated and still belongs to the Moon', () => {
  const { dump, cfg } = lunarPack();
  const r = run(dump, cfg);
  assert.deepEqual(verdicts(r.out.gate), { ilmenite: 'PASS', 'ilmenite-without-trip': 'PASS' });
  assert.deepEqual(verdicts(r.out.auto), { 'auto-ilmenite': 'PASS', 'auto-titanium': 'PASS' });
  const rule = r.model.g.rules.find((x) => x.name === 't:lunar/ilmenite');
  assert.ok(rule.slots.some((s) => s.cap && s.alts.some((a) => r.model.g.keyNames[a] === 'dim:t:luna')), 'the condition\'s slot is the trip\'s key');
  assert.deepEqual(rule.meta.dims, ['t:luna']);
  // the era rule and exclusivity remove the lunar recipe along with the Moon
  assert.equal(r.out.eras.exclusive[0].verdict, 'PASS');
  assert.deepEqual(verdictsOf(r), { 'hv-items': 'PASS', 'output-hv': 'PASS' });
  assert.equal(r.out.verdict, 'PASS');
});

test('asKeysFor: without it, the lunar recipe doesn\'t apply at Earth\'s factory, and ilmenite only comes from the hand-done trip', () => {
  const { dump, cfg } = lunarPack({ asKeys: false });
  const r = run(dump, cfg);
  assert.equal(verdicts(r.out.gate).ilmenite, 'PASS');
  assert.equal(verdicts(r.out.auto)['auto-ilmenite'], 'FAIL');
  const rule = r.model.g.rules.find((x) => x.name === 't:lunar/ilmenite');
  assert.ok(rule.slots.some((s) => s.dead && /only applies in t:luna; the factory is in minecraft:overworld/.test(s.label)));
});

// ---------------------------------------------------------------- engine: keys removed from every source

test('lfp with `blocked`: the rule still gives its other outputs, and removed facts don\'t count', () => {
  const g = new Graph();
  const a = g.key('a');
  const b = g.key('b');
  const c = g.key('c');
  const d = g.key('d');
  g.addRule({ name: 'r1', kind: 'recipe', slots: [{ alts: [a] }], outs: [b, c], meta: {} });
  g.addRule({ name: 'r2', kind: 'recipe', slots: [{ alts: [c] }], outs: [d], meta: {} });
  g.finalize();
  const blocked = new Uint8Array(g.nKeys);
  blocked[c] = 1;
  const lf = lfp(g, { facts: [a], blocked });
  assert.deepEqual([lf.reached[a], lf.reached[b], lf.reached[c], lf.reached[d]], [1, 1, 0, 0]);
  const lf2 = lfp(g, { facts: [a, c], blocked });
  assert.equal(lf2.reached[c], 0);
});

// ---------------------------------------------------------------- config: inheritance and the next-version layer

function memoryTiers(files) {
  const root = path.resolve('/memory/tiers');
  const map = new Map(Object.entries(files).map(([name, doc]) => [path.join(root, name), doc]));
  return {
    root,
    io: { exists: (f) => map.has(path.resolve(f)), read: (f) => structuredClone(map.get(path.resolve(f))) },
  };
}

test('era config: inherited; a new element belongs to its file\'s era, and one with the same id is merged field by field', () => {
  const { root, io } = memoryTiers({
    'steam.json': { tier: 'steam', eraOrder: ['steam', 'lv', 'mv'], eraItems: [{ id: 'a', items: ['x:a'] }, { id: 'b', era: 'lv', items: ['x:b'] }] },
    'lv.json': {
      tier: 'lv', extends: 'steam', inheritTargets: true, dropTargets: ['b'],
      eraResources: [{ id: 'nether', label: 'the Nether', dimensions: ['minecraft:the_nether'] }],
      eraItems: [{ id: 'c', items: ['x:c'] }],
    },
    'mv.json': { tier: 'mv', extends: 'lv', eraResources: [{ id: 'nether', era: 'mv' }], eraItems: [{ id: 'a', optional: true }] },
  });
  const lv = loadTierConfig({ tier: 'lv' }, root, io).raw;
  assert.deepEqual(lv.eraOrder, ['steam', 'lv', 'mv']);
  assert.deepEqual(lv.eraItems.map((e) => [e.id, e.era]), [['a', 'steam'], ['c', 'lv']]);
  assert.deepEqual(lv.eraResources.map((e) => [e.id, e.era]), [['nether', 'lv']]);
  const mv = loadTierConfig({ tier: 'mv' }, root, io).raw;
  // the patch only changes what it says: the Nether keeps its name and dimensions; group a keeps its era and items
  assert.deepEqual(mv.eraResources, [{ id: 'nether', era: 'mv', label: 'the Nether', dimensions: ['minecraft:the_nether'] }]);
  assert.deepEqual(mv.eraItems.find((e) => e.id === 'a'), { id: 'a', era: 'steam', items: ['x:a'], optional: true });
});

test('config: the tiers/next/ layer makes the whole chain inherit from its files (next/hv -> hv -> next/mv -> mv)', () => {
  const { root, io } = memoryTiers({
    'mv.json': { tier: 'mv', targets: [{ id: 'mv-current' }], world: [{ id: 'w-mv' }] },
    'hv.json': { tier: 'hv', extends: 'mv', inheritTargets: true, targets: [{ id: 'hv-current' }], eraResources: [{ id: 'end', label: 'the End' }] },
    'next/mv.json': {
      tier: 'mv', extends: '../mv', inheritTargets: true, targets: [{ id: 'mv-next' }], world: [{ id: 'end-ores' }],
      eraResources: [{ id: 'end', label: 'the End' }],
    },
    'next/hv.json': { tier: 'hv', extends: '../hv', inheritTargets: true, eraResources: [{ id: 'end', era: 'mv' }] },
  });
  const now = loadTierConfig({ tier: 'hv' }, root, io).raw;
  assert.deepEqual(now.targets.map((t) => t.id), ['mv-current', 'hv-current']);
  assert.deepEqual(now.eraResources.map((r) => [r.id, r.era]), [['end', 'hv']]);
  const next = loadTierConfig({ tier: 'next/hv' }, root, io).raw;
  assert.equal(next.tier, 'hv');
  assert.deepEqual(next.targets.map((t) => t.id), ['mv-current', 'mv-next', 'hv-current']);
  assert.deepEqual(next.world.map((w) => w.id), ['w-mv', 'end-ores']);
  assert.deepEqual(next.eraResources.map((r) => [r.id, r.era]), [['end', 'mv']]);
  // outside the layer nothing changes: the regular mv still has no End
  assert.deepEqual(loadTierConfig({ tier: 'mv' }, root, io).raw.world.map((w) => w.id), ['w-mv']);
  // a layer file that names itself by name would create a cycle: it's detected
  const loop = memoryTiers({ 'mv.json': { tier: 'mv' }, 'next/mv.json': { tier: 'mv', extends: 'mv' } });
  assert.throws(() => loadTierConfig({ tier: 'next/mv' }, loop.root, loop.io), /circular inheritance/);
});

// ---------------------------------------------------------------- real configs

test('real tiers: era order is inherited and every resource and group has an era from the order', () => {
  for (const tier of ['steam', 'lv', 'mv', 'hv', 'ev', 'iv']) {
    const { raw } = loadTierConfig({ tier }, TIERS);
    assert.ok(raw.eraOrder && raw.eraOrder.length >= 6, `${tier}: eraOrder`);
    for (const e of [...raw.eraResources, ...raw.eraItems]) assert.ok(raw.eraOrder.includes(e.era), `${tier}: ${e.id} has era ${e.era}`);
    const ids = raw.eraItems.map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length, `${tier}: duplicate eraItems ids`);
    for (const set of raw.eraSiblings || []) for (const e of set) assert.ok(raw.eraOrder.includes(e), `${tier}: sibling ${e}`);
  }
});

test('real tiers (iv): home, then Venus and Mercury as sibling substages; naquadah only from Venus, iridium and osmium only from Mercury (2026-10-25)', () => {
  const { raw } = loadTierConfig({ tier: 'iv' }, TIERS);
  const o = raw.eraOrder;
  assert.ok(o.indexOf('ev-mars') < o.indexOf('iv') && o.indexOf('iv') < o.indexOf('iv-venus') && o.indexOf('iv-mercury') < o.indexOf('luv'));
  assert.deepEqual(raw.eraSiblings, [['iv-venus', 'iv-mercury']]);
  const res = Object.fromEntries(raw.eraResources.map((r) => [r.id, r]));
  assert.equal(res.venus.era, 'iv-venus');
  assert.equal(res.naquadah.era, 'iv-venus');
  assert.deepEqual(res.naquadah.onlyFrom, ['venus']);
  assert.ok(res.naquadah.exclude.includes('*naquadria*'), 'naquadria is ZPM');
  assert.equal(res.mercury.era, 'iv-mercury');
  assert.equal(res['iridium-osmium'].era, 'iv-mercury');
  assert.deepEqual(res['iridium-osmium'].onlyFrom, ['mercury']);
  assert.deepEqual(res.titanium.onlyFrom, ['moon', 'venus'], 'decision 9: TiF3 titanium from Venus is accepted from IV on');
  assert.ok(res.venus.items.includes('gcyr:venusian_*'), 'hv.json\'s ground globs survive the merge');
  // the trips and the generators
  const syn = Object.fromEntries(raw.synthetic.map((s) => [s.id, s]));
  assert.deepEqual(syn['inner-trip'].produces, ['dim:gcyr:venus', 'dim:gcyr:mercury']);
  for (const p of ['gcyr:elite_fuel_tank', 'gcyr:elite_rocket_motor', 'gcyr:space_suit_thermal_upgrade_smithing_template']) assert.ok(syn['inner-trip'].capital.includes(p), p);
  for (const [id, type] of [['fission', 'gtceu:fission_core'], ['venus-heat', 'gtceu:venus_heat'], ['mercury-solar', 'gtceu:mercury_solar'], ['rtg', 'gtceu:radioisotope_decay']]) {
    assert.deepEqual(syn[id].recipesOf, [type], id);
  }
  assert.deepEqual(raw.conditions.dimension.asKeysFor, ['gcyr:luna', 'gcyr:mars', 'gcyr:venus', 'gcyr:mercury', 'minecraft:the_end']);
  assert.ok(raw.conditions.research.researchKeys);
  // the two IV drills veto each other's prefix
  const m = Object.fromEntries(raw.machines.map((e) => [e.id || e.machine, e]));
  assert.deepEqual(m['gtceu:pressurized_vein_drill'].onlyRecipes, ['grindless:vein_drilling/iv/pressurized_*']);
  assert.deepEqual(m['gtceu:mercury_vein_drill'].onlyRecipes, ['grindless:vein_drilling/iv/mercury_*']);
  // what waits for Mercury's iridium is no home item
  const items = Object.fromEntries(raw.eraItems.map((g) => [g.id, g]));
  for (const it of ['gtceu:iv_emitter', 'gtceu:iv_sensor', 'gtceu:iv_voltage_coil', 'gtceu:iv_electrolyzer']) {
    assert.ok(items['iv-gtm'].exclude.includes(it) && items['iv-mercury-gtm'].items.includes(it), it);
  }
  assert.equal(items['output-iv'].era, 'luv');
  // the wireless network's IV hatches and covers take the IV sensor or emitter: they wait for Mercury; its IV capacitor cell is a home item
  assert.ok(items['iv-gtm'].exclude.includes('gtceu:iv_wireless_*'));
  assert.equal(items['iv-mercury-wireless'].era, 'iv-mercury');
  assert.deepEqual(items['iv-mercury-wireless'].items, ['gtceu:iv_wireless_*', 'grindless:iv_wireless_*_cover']);
  assert.equal(items['iv-wireless-home'].era || 'iv', 'iv');
  for (const t of ['uranium-not-before-iv', 'radon-not-before-iv', 'quantum-eye-not-before-iv', 'deuterium-not-made']) assert.ok(raw.dropTargets.includes(t), t);
});

test('real tiers (hv): titanium, helium-3 and the Moon belong to EV and only come from the Moon, the End to MV; the stainless bit, the rocket and GCYR\'s suit belong to HV (v0.5.0)', () => {
  const { raw } = loadTierConfig({ tier: 'hv' }, TIERS);
  const res = Object.fromEntries(raw.eraResources.map((r) => [r.id, r]));
  assert.equal(res.titanium.era, 'ev');
  assert.equal(res.moon.era, 'ev');
  assert.deepEqual(res.moon.dimensions, ['gcyr:luna']);
  assert.equal(res.end.era, 'mv');
  assert.equal(res.nether.era, 'lv');
  for (const id of ['naquadah', 'iridium-osmium', 'venus', 'mercury']) assert.equal(res[id].era, 'iv', id);
  // Mars is EV's second substage (ev-mars, 2026-10-25): its tungsten belongs to it, after the Moon's ev and before iv
  for (const id of ['tungsten', 'mars']) assert.equal(res[id].era, 'ev-mars', id);
  assert.ok(raw.eraOrder.indexOf('ev') < raw.eraOrder.indexOf('ev-mars') && raw.eraOrder.indexOf('ev-mars') < raw.eraOrder.indexOf('iv'));
  assert.deepEqual(res.titanium.onlyFrom, ['moon']);
  assert.deepEqual(res['helium-3'].onlyFrom, ['moon']);
  const items = Object.fromEntries(raw.eraItems.map((g) => [g.id, g]));
  for (const id of ['hv-rocket', 'hv-suit', 'hv-bit-stainless']) assert.ok(!items[id].optional, `${id} has already arrived: not optional`);
  for (const it of ['gcyr:rocket_scanner', 'gcyr:launch_pad', 'gcyr:basic_fuel_tank', 'gcyr:basic_rocket_motor', 'gcyr:seat']) assert.ok(items['hv-rocket'].items.includes(it), it);
  assert.equal(items['output-hv'].era, 'ev');
  assert.deepEqual(items['output-hv'].items.slice(0, 3), ['gtceu:ev_machine_hull', 'gtceu:ev_electric_motor', 'gtceu:ev_electric_pump']);
  // the lunar base is the output to EV; the lunar drill's controller is built in HV
  assert.equal(items['output-hv-moon'].era, 'ev');
  assert.equal(items['hv-moon'].era, 'hv');
  assert.ok(!items['hv-items'].items.includes('grindless:end_key'), 'the End\'s key belongs to MV');
  assert.equal(items['mv-end'].era, 'mv');
  assert.equal(items['hv-gtm'].era, 'hv');
  assert.equal(items['steam-machines'].era, 'steam');
  assert.equal(items['output-steam'].era, 'lv');
  // no target names the titanium bit anymore except the check that it isn't made
  const named = [...raw.targets, ...raw.autoTargets, ...raw.autoTargetsFromVeins.map((s) => s.target || {})]
    .filter((t) => JSON.stringify([t.item, t.input]).includes('grindless:titanium_drill_bit'));
  assert.deepEqual(named.map((t) => [t.id, t.expect]), [['bit-titanium-not-made', 'unreachable']]);
  // veins are counted by the drill's recipes (the vein one or the lunar one), not by whether their sample exists
  const veinSpecs = [...raw.world.filter((w) => w.fromVeins).map((w) => w.fromVeins), ...raw.targetsFromVeins, ...raw.autoTargetsFromVeins];
  for (const s of veinSpecs.filter((x) => x.requireItem || x.requireRecipe)) {
    assert.equal(s.requireItem, undefined);
    const lunar = (s.dimensions || []).includes('gcyr:luna');
    assert.deepEqual(s.requireRecipe, { type: lunar ? 'gtceu:lunar_drilling' : 'gtceu:vein_drilling', input: 'grindless:vein_sample_{id}' });
  }
});

test('real tiers (v0.5.0): the End is in MV, the trip to the Moon gives the lunar base\'s key, and the tiers/next/ layer has already merged in', () => {
  const { raw: mv } = loadTierConfig({ tier: 'mv' }, TIERS);
  const { raw: hv } = loadTierConfig({ tier: 'hv' }, TIERS);
  for (const cfg of [mv, hv]) {
    assert.equal(cfg.eraResources.find((r) => r.id === 'end').era, 'mv');
    assert.ok(cfg.world.some((w) => w.id === 'end-ores'));
  }
  const ids = (cfg) => cfg.targets.map((t) => t.id);
  for (const id of ['end-key', 'ender-eye', 'end-ores-with-key', 'ilmenite-not-comes-from-end', 'scheelite-not-comes-from-end']) assert.ok(ids(mv).includes(id), id);
  // in HV the Moon also gives ilmenite and chromite: those two End checks stop holding
  for (const id of ['ilmenite-not-comes-from-end', 'end-ores-without-key']) assert.ok(!ids(hv).includes(id), id);
  assert.ok(!mv.world.some((w) => w.id === 'moon-ores'), 'MV doesn\'t reach the Moon');
  const moonOres = hv.world.find((w) => w.id === 'moon-ores');
  assert.deepEqual(moonOres.needs, ['dim:gcyr:luna']);
  assert.ok(moonOres.fromVeins.dimensions.includes('gcyr:luna'));
  assert.deepEqual(hv.synthetic.find((s) => s.id === 'moon-trip').produces, ['dim:gcyr:luna']);
  assert.deepEqual(hv.conditions.dimension.asKeysFor, ['gcyr:luna']);
  assert.equal(mv.conditions.dimension, undefined, 'in MV lunar recipes still don\'t apply');
  assert.ok(hv.machines.some((m) => m.machine === 'gtceu:lunar_drill' && m.types.includes('gtceu:lunar_drilling')));
  assert.ok(hv.autoTargets.some((t) => t.id === 'auto-titanium' && !t.expect));
  assert.ok(!hv.autoTargets.some((t) => t.id === 'auto-titanium-not-in-hv'));
  assert.ok(!fs.existsSync(path.join(TIERS, 'next', 'hv.json')) && !fs.existsSync(path.join(TIERS, 'next', 'mv.json')));
});

test('real tiers (ev, 2026-10-25): the Moon and Mars substages, the Martian resources only from Mars, the trips\' keys, the tier veto and B7', () => {
  const { raw: ev } = loadTierConfig({ tier: 'ev' }, TIERS);
  const res = Object.fromEntries(ev.eraResources.map((r) => [r.id, r]));
  for (const id of ['moon', 'titanium', 'helium-3']) assert.equal(res[id].era, 'ev', id);
  for (const id of ['mars', 'tungsten', 'merrillite', 'samarium', 'martian-ice']) assert.equal(res[id].era, 'ev-mars', id);
  for (const id of ['deuterium', 'radioactives', 'quantum', 'venus', 'naquadah', 'mercury', 'iridium-osmium']) assert.equal(res[id].era, 'iv', id);
  for (const id of ['tungsten', 'merrillite', 'samarium', 'martian-ice', 'deuterium']) assert.deepEqual(res[id].onlyFrom, ['mars'], id);
  assert.deepEqual(ev.conditions.dimension.asKeysFor, ['gcyr:luna', 'gcyr:mars']);
  const trip = ev.synthetic.find((s) => s.id === 'mars-trip');
  assert.deepEqual(trip.produces, ['dim:gcyr:mars']);
  for (const part of ['gcyr:advanced_fuel_tank', 'gcyr:advanced_rocket_motor']) assert.ok(trip.capital.includes(part), part);
  assert.deepEqual(ev.world.find((w) => w.id === 'mars-ores').needs, ['dim:gcyr:mars']);
  // the family tier veto: the tripod only runs its ev/ folder, the dome and the LV-HV drills and greenhouses skip the folders above them
  const machine = (cfg, id) => cfg.machines.find((m) => (m.id || m.machine) === id);
  assert.equal(machine(ev, 'gtceu:ev_vein_drill').onlyTier, 'ev');
  assert.equal(machine(ev, 'gtceu:sealed_dome').vetoAbove, 'ev');
  for (const t of ['lv', 'mv', 'hv']) {
    for (const kind of ['vein_drill', 'greenhouse']) assert.equal(machine(ev, `gtceu:${t}_${kind}`).vetoAbove, t, `${t}_${kind}`);
  }
  assert.equal(machine(ev, 'gtceu:steam_vein_drill').onlyTier, '', 'the steam drill only runs unfiled steam recipes (steam/machines.js)');
  assert.equal(machine(ev, 'gtceu:steam_greenhouse').onlyTier, '');
  // B7 (merged 2026-10-25): both machines are modeled; the combined-cycle plant is one more EV source, never a required one
  for (const id of ['gtceu:combined_cycle_plant', 'gtceu:hot_strip_mill']) assert.ok(machine(ev, id) && !machine(ev, id).optional, id);
  assert.deepEqual(ev.synthetic.find((s) => s.id === 'combined-cycle').produces, ['eu:ev']);
  assert.ok(ev.targets.find((t) => t.id === 'site-fuels-air').types.includes('gtceu:combined_cycle'));
  // what HV declared and EV no longer holds is dropped; the radioactive and quantum eye checks are real (not optional)
  const ids = ev.targets.map((t) => t.id);
  for (const id of ['bit-titanium-not-made', 'scheelite-not-comes-from-end']) assert.ok(!ids.includes(id), id);
  for (const id of ['uranium-not-before-iv', 'radon-not-before-iv', 'quantum-eye-not-before-iv']) {
    const t = ev.targets.find((x) => x.id === id);
    assert.ok(t && t.expect === 'unreachable' && !t.optional, id);
  }
  const sites = ev.targets.filter((t) => t.kind === 'site').map((t) => t.id);
  for (const id of ['site-moon-machines', 'site-mars-machines', 'site-fuels-air']) assert.ok(sites.includes(id), id);
  const items = Object.fromEntries(ev.eraItems.map((g) => [g.id, g]));
  assert.equal(items['ev-mars'].era, 'ev-mars');
  assert.equal(items['output-ev'].era, 'iv');
  assert.equal(items['hv-gtm'].era, 'hv', 'merging an exclusion keeps the parent\'s era');
  assert.ok(items['hv-gtm'].exclude.includes('gtceu:hv_fluid_drilling_rig') && items['ev-mars'].items.includes('gtceu:hv_fluid_drilling_rig'));
});
