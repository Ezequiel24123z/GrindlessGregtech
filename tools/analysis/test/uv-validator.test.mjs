// UV-C1: the validator's -Tier uv. The real tiers/uv.json (three substages, packages, the checks of docs/eras/uv.md "Validator" and
// "Gate to UHV"), the planted cases that must fail (neutronium outside the Mk3, a UHV circuit in a UV recipe other than the Mk3's, a Pluto
// product asked for before the Pluto substage, a doubled generator) and the re-count of the design's process lines and crossings. The
// planted mini packs use the real config's own pieces (its targets, its era order, its era resources), so a weakened check fails here.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultTablesDir, loadTierConfig } from '../lib/config.mjs';
import { readPlaceTables } from '../lib/places.mjs';
import { gi, gt, mkDump, run, verdicts } from './helpers.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIERS = path.join(HERE, '..', 'tiers');
const ROOT = path.join(HERE, '..', '..', '..');
const TABLES = path.join(ROOT, 'pack', 'kubejs', 'data', 'grindless', 'tables');
const uv = () => loadTierConfig({ tier: 'uv' }, TIERS).raw;
const uvFile = () => JSON.parse(fs.readFileSync(path.join(TIERS, 'uv.json'), 'utf8'));
const table = (f) => JSON.parse(fs.readFileSync(path.join(TABLES, f), 'utf8'));
const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
const mById = (list) => Object.fromEntries(list.map((x) => [x.id || x.machine, x]));
const MK3 = 'gtceu:uv_fusion_reactor';
const MK3_ASSEMBLY = 'gtceu:assembly_line/fusion_reactor_mk3';
const MAINFRAME = 'gtceu:wetware_processor_mainframe';

test('real tiers (uv): three substages in order after ZPM, the dimension ids from the pack\'s tables and none hard-coded', () => {
  const raw = uv();
  assert.equal(raw.tier, 'uv');
  assert.equal(uvFile().extends, 'zpm');
  const at = (e) => raw.eraOrder.indexOf(e);
  for (const [a, b] of [['zpm-uranus', 'uv'], ['uv', 'uv-neptune'], ['uv-neptune', 'uv-pluto'], ['uv-pluto', 'uhv']]) assert.ok(at(a) >= 0 && at(a) < at(b), `${a} before ${b}`);
  const t = readPlaceTables(defaultTablesDir(TIERS));
  const { neptune, pluto } = t.places.surfaces;
  assert.ok(neptune && pluto, 'places.json has Neptune and Pluto');
  const text = fs.readFileSync(path.join(TIERS, 'uv.json'), 'utf8');
  for (const d of [...t.orbits.dimensions, ...Object.values(t.places.surfaces)]) assert.ok(!text.includes(`"${d}"`) && !text.includes(`:${d}"`), `${d} is hard-coded in uv.json`);
  const res = byId(raw.eraResources);
  assert.equal(res.neptune.era, 'uv-neptune');
  assert.deepEqual(res.neptune.dimensions, [neptune, `${neptune}_orbit`]);
  assert.equal(res.pluto.era, 'uv-pluto');
  assert.deepEqual(res.pluto.dimensions, [pluto, `${pluto}_orbit`]);
  const syn = byId(raw.synthetic);
  assert.deepEqual(syn['neptune-trip'].produces, [`dim:${neptune}`, `dim:${neptune}_orbit`]);
  assert.deepEqual(syn['pluto-trip'].produces, [`dim:${pluto}`, `dim:${pluto}_orbit`]);
  assert.ok(syn['pluto-trip'].capital.includes('grindless:bnnt_fuel_tank'), 'Pluto needs the tier 11 tank');
  const site = byId(raw.targets);
  assert.deepEqual(site['site-neptune'].dimensions, [`${neptune}_orbit`]);
  assert.deepEqual(site['site-neptune-siphon'].dimensions, [`${neptune}_orbit`]);
  assert.deepEqual(site['site-pluto'].dimensions, [`${pluto}_orbit`]);
  assert.deepEqual(site['site-earth-orbit'].dimensions, [t.orbits.earth]);
  // ZPM's Uranus site is narrowed: the siphon type is shared with Neptune's rows, so the Uranus rows are named
  assert.ok(!site['site-uranus'].types.includes('gtceu:ice_giant_siphon'));
  assert.equal(site['site-uranus-siphon'].recipe.length, 4);
});

test('real tiers (uv): every package is declared, every package: reference points at one, and each lands on a machine or an item', () => {
  const raw = uv();
  const own = uvFile().packages;
  for (const want of ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'B1', 'B2', 'B3', 'B4', 'B5']) {
    assert.ok(own[want], `package ${want}`);
    assert.ok(own[want].landedWhen?.length > 0 || own[want].landedWhenAny?.length > 0, `${want} has no landing mark`);
  }
  const ids = Object.keys(raw.packages);
  const f = uvFile();
  for (const x of [...f.machines, ...f.synthetic, ...f.targets, ...f.eraResources, ...f.eraItems]) {
    for (const p of [x.package].flat().filter(Boolean)) assert.ok(ids.includes(p), `${x.id || x.machine}: package ${p} is not declared`);
  }
});

test('real tiers (uv): the Validator\'s checks exist, are leak checks with the right gate, and ZPM\'s "no UV" checks are dropped', () => {
  const raw = uv();
  const t = byId(raw.targets);
  const un = (id, without, any) => {
    assert.ok(t[id], id);
    assert.equal(t[id].expect, 'unreachable', id);
    assert.deepEqual(t[id].without, without, id);
    if (any) for (const a of any) assert.ok(t[id].anyOf.includes(a), `${id}: ${a}`);
  };
  un('neutronium-only-mk3', [`operate:${MK3}`], ['gtceu:neutronium_ingot', 'fluid:gtceu:neutronium']);
  un('mk3-recipes-only-mk3', [`operate:${MK3}`]);
  assert.deepEqual(t['mk3-recipes-only-mk3'].recipe, table('fusion_mk3.json').mk3Only);
  // GTM's wrap_circuits_uhv only bundles circuits that already exist
  un('uhv-circuit-only-mk3', [MK3_ASSEMBLY, 'gtceu:assembler/wrap_circuits_uhv']);
  assert.equal(t['uhv-circuit-only-mk3'].input, MAINFRAME);
  // without `type` or `recipe` the engine reads a recipe check as an empty item check, which a leak check always passes
  assert.deepEqual(t['uhv-circuit-only-mk3'].recipe, ['*']);
  un('n15-only-triton', ['operate:gtceu:triton_geyser_sampler*']);
  un('neptune-gas-only-siphon', ['operate:gtceu:neptune_deep_siphon*']);
  un('cores-only-penetrator', ['operate:gtceu:penetrator_probe_bay*']);
  un('planetesimal-only-interceptor', ['operate:gtceu:kuiper_interceptor_bay*']);
  un('antiprotons-only-synchrotron', ['operate:gtceu:synchrotron*']);
  un('probe-only-launcher', ['operate:gtceu:laser_sail_launcher*']);
  // each leak check stops every entry of its machine: a bare operate:X would leave X@zpm2 running
  const entries = raw.machines.map((m) => m.id || m.machine);
  for (const x of raw.targets) for (const w of x.without || []) {
    if (!w.startsWith('operate:') || w.endsWith('*')) continue;
    assert.ok(!entries.includes(w.slice('operate:'.length) + '@zpm2'), `${x.id}: ${w} misses the @zpm2 variant`);
  }
  for (const id of ['kuiper-gas-only-annealer', 'proxima-only-station', 'heat-only-works', 'yb-only-strip', 'tholin-only-titan']) assert.equal(t[id]?.expect, 'unreachable', id);
  for (const gone of ['no-uv-neutronium', 'no-uv-mk3', 'no-uv-circuit']) assert.ok(!t[gone], `${gone} is dropped`);
  assert.ok(!Object.keys(t).some((k) => k.startsWith('mk2-cut-')), 'the Mk2 cut checks move to mk3-recipes-only-mk3');
  for (const kept of ['europium-only-mk1-or-reductor', 'mk2-only-metals', 'plume-only', 'qubit-only-fab']) assert.ok(t[kept], `${kept} stays`);
  assert.equal(raw.conditions.eu_to_start.max, 640000000);
  for (const id of ['gate-uhv-hull', 'gate-mk3', 'gate-network-uv', 'gate-stored', 'gate-proxima', 'gate-mainframes', 'gate-parallel']) assert.ok(t[id], id);
  for (const type of ['accelerator_driven', 'laser_fusion', 'muon_catalysed_fusion', 'triton_plume', 'penetrator_probe', 'ice_fractionation',
    'kuiper_intercept', 'ice_annealing', 'precursor_probe', 'light_sail', 'antimatter_storage']) {
    const run1 = Object.values(t).find((x) => x.id.startsWith('gate-run-') && x.type === `gtceu:${type}`);
    assert.ok(run1 && run1.expect !== 'unreachable', `gate run of ${type}`);
  }
  assert.deepEqual(t['gate-run-neptune-siphon'].recipe, ['grindless:ice_giant_siphon/neptune_*']);
  // the Mk3 runs the six mk3Only recipes and the Mk1 and Mk2 do not
  const m = mById(raw.machines);
  const six = table('fusion_mk3.json').mk3Only;
  assert.ok(m[MK3], 'the Mk3 is modelled');
  assert.ok(!m[MK3].exceptRecipes, 'the Mk3 runs every fusion recipe');
  for (const id of ['gtceu:luv_fusion_reactor', 'gtceu:zpm_fusion_reactor']) for (const r of six) assert.ok(m[id].exceptRecipes.includes(r), `${id} cut: ${r}`);
  // naquadria: the stored impure solution or the Mk3's own recipe
  const res = byId(raw.eraResources);
  assert.deepEqual(res.naquadria.onlyFrom, ['impure-solution', 'mk3']);
  assert.equal(res.mk3.era, 'uv');
  // the network's tier is a synthetic step, built from ZPM's
  const syn = byId(raw.synthetic);
  assert.deepEqual(syn['wireless-uv'].produces, ['eu:uv', 'wireless:uv']);
  assert.deepEqual(syn['wireless-uv'].consumes, ['eu:zpm']);
  assert.ok(syn['wireless-uv'].capital.includes('grindless:uv_smes_cell'));
  // before the jump the UV recipes run on the ZPM grid (uv.md: two ZPM hatches give UV voltage); eu:uv needs the gravi star
  assert.deepEqual(m[MK3].needs, ['eu:zpm'], 'the Mk3 comes before the gravi star');
  const home = raw.machines.filter((x) => !x.id && x.machine !== MK3 && (x.needs || []).includes('eu:uv'));
  assert.ok(home.length >= 25, `UV recipe multiblocks: ${home.length}`);
  for (const x of home) {
    const v = m[`${x.machine}@zpm2`];
    assert.ok(v, `${x.machine} has a two-ZPM-hatch entry`);
    assert.deepEqual([v.energy, v.needs], [{ voltage: 131072, hatches: 2 }, ['eu:zpm']], x.machine);
    assert.deepEqual(v.onlyRecipes, x.onlyRecipes, `${x.machine}: same recipe filter`);
  }
});

// ------------------------------------------------------------------ the generators: final figures, never doubled

const GEN_TYPES = { 'accelerator-driven': 'gtceu:accelerator_driven', 'laser-fusion': 'gtceu:laser_fusion', 'muon-catalysed-fusion': 'gtceu:muon_catalysed_fusion' };
const tableFigures = () => ({
  'gtceu:accelerator_driven': table('thorium.json').types.accelerator_driven.recipes.map((r) => r.eut),
  'gtceu:laser_fusion': [table('fusion_mk3.json').chamber.eut],
  'gtceu:muon_catalysed_fusion': table('accelerators.json').types.muon_catalysed_fusion.recipes.map((r) => r.eut),
});
const doubledTypes = (src) => {
  const m = /var TYPES = \[([\s\S]*?)\]/.exec(src);
  assert.ok(m, 'generators.js keeps its TYPES list');
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
};
const GENERATORS_JS = path.join(ROOT, 'pack', 'kubejs', 'server_scripts', 'grindless', 'power', 'generators.js');

/** The problems of the three UV generators: a type in the doubling list, or a modelled EU/t that is not the table's final figure. */
function generatorProblems(synthetic, types, figures) {
  const out = [];
  const syn = byId(synthetic);
  for (const [id, type] of Object.entries(GEN_TYPES)) {
    if (types.includes(type)) out.push(`${type} is in generators.js TYPES: its recipes would be doubled`);
    const s = syn[id];
    if (!s || !s.recipesOf?.includes(type)) { out.push(`${id} does not model ${type}`); continue; }
    for (const eut of figures[type]) if (s.euPerTick !== eut) out.push(`${id}: ${s.euPerTick} EU/t modelled, the table says ${eut}`);
  }
  return out;
}

test('real pack: the three UV generators are written at final figures and stay out of the doubling list', () => {
  const types = doubledTypes(fs.readFileSync(GENERATORS_JS, 'utf8'));
  assert.deepEqual(generatorProblems(uv().synthetic, types, tableFigures()), []);
  for (const id of Object.keys(GEN_TYPES)) assert.ok(byId(uv().synthetic)[id].produces.includes('eu:uv'), `${id} gives UV power`);
});

test('planted: a doubled generator fails (its type added to TYPES, or its figure written x2)', () => {
  const src = fs.readFileSync(GENERATORS_JS, 'utf8').replace("'gcyr:dyson_controller'", "'gcyr:dyson_controller', 'gtceu:laser_fusion'");
  const p1 = generatorProblems(uv().synthetic, doubledTypes(src), tableFigures());
  assert.deepEqual(p1, ['gtceu:laser_fusion is in generators.js TYPES: its recipes would be doubled']);
  const figures = tableFigures();
  figures['gtceu:accelerator_driven'] = figures['gtceu:accelerator_driven'].map((x) => x * 2);
  const p2 = generatorProblems(uv().synthetic, doubledTypes(fs.readFileSync(GENERATORS_JS, 'utf8')), figures);
  assert.equal(p2.length, 2);
  assert.ok(p2.every((x) => x.startsWith('accelerator-driven: 1572864 EU/t modelled')));
});

// ------------------------------------------------------------------ planted cases on a mini pack (the real targets)

const target = (id) => byId(uv().targets)[id];
const mini = (extra) => ({
  tier: 'uv',
  world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ore', MK3, 't:proc', 'gtceu:assembly_line'] }],
  machines: [{ machine: MK3, types: ['gtceu:fusion_reactor'] }, { machine: 't:proc', types: ['t:proc'] }, { machine: 'gtceu:assembly_line', types: ['gtceu:assembly_line'] }],
  ...extra,
});

test('planted: neutronium made outside the Mk3 fails neutronium-only-mk3; from the Mk3 alone it passes', () => {
  const chk = target('neutronium-only-mk3');
  const cfg = mini({ targets: [{ id: 'gate', item: 't:gadget' }, chk] });
  const mk3 = gt('gtceu:fusion_reactor/americium_and_naquadria_to_neutronium_plasma', 'gtceu:fusion_reactor', { ins: [gi('t:ore')], outs: [gi('gtceu:neutronium_ingot')] });
  const gadget = gt('t:proc/gadget', 't:proc', { ins: [gi('gtceu:neutronium_ingot')], outs: [gi('t:gadget')] });
  const clean = mkDump({ recipes: [mk3, gadget], items: ['t:ore', MK3, 't:proc', 'gtceu:assembly_line'] });
  assert.deepEqual(verdicts(run(clean, cfg).out.gate), { gate: 'PASS', 'neutronium-only-mk3': 'PASS' });
  const leak = gt('t:proc/neutronium', 't:proc', { ins: [gi('t:ore')], outs: [gi('gtceu:neutronium_ingot')] });
  const r = run(mkDump({ recipes: [mk3, gadget, leak], items: ['t:ore', MK3, 't:proc', 'gtceu:assembly_line'] }), cfg);
  assert.equal(verdicts(r.out.gate)['neutronium-only-mk3'], 'FAIL');
  assert.equal(r.out.verdict, 'FAIL');
});

test('planted: a UHV mainframe consumed by a UV recipe other than the Mk3\'s fails uhv-circuit-only-mk3', () => {
  const chk = target('uhv-circuit-only-mk3');
  const cfg = mini({ targets: [{ id: 'mk3', item: MK3 }, chk] });
  const mf = gt('t:proc/mainframe', 't:proc', { ins: [gi('t:ore')], outs: [gi(MAINFRAME)] });
  const mk3 = gt(MK3_ASSEMBLY, 'gtceu:assembly_line', { ins: [gi(MAINFRAME, 4)], outs: [gi(MK3)] });
  const items = ['t:ore', MK3, 't:proc', 'gtceu:assembly_line'];
  assert.deepEqual(verdicts(run(mkDump({ recipes: [mf, mk3], items }), cfg).out.gate), { mk3: 'PASS', 'uhv-circuit-only-mk3': 'PASS' });
  const leak = gt('t:proc/uv_gadget', 't:proc', { ins: [gi(MAINFRAME)], outs: [gi('t:gadget')] });
  const r = run(mkDump({ recipes: [mf, mk3, leak], items }), cfg);
  assert.equal(verdicts(r.out.gate)['uhv-circuit-only-mk3'], 'FAIL');
  assert.equal(r.out.verdict, 'FAIL');
});

test('planted: a Pluto product needed before the Pluto substage is an era violation (the real era order and Pluto resource)', () => {
  const raw = uv();
  const pluto = byId(raw.eraResources).pluto;
  const [, plutoOrbit] = pluto.dimensions;
  const home = byId(raw.eraItems)['uv-home'];
  const pack = (homeNeedsCore) => {
    const dump = mkDump({
      recipes: [
        gt('t:proc/gadget', 't:proc', { ins: homeNeedsCore ? [gi('t:ore'), gi('t:core')] : [gi('t:ore')], outs: [gi('t:gadget')] }),
        gt('t:penetrator/core', 't:penetrator', { ins: [gi('t:ore')], outs: [gi('t:core')], conditions: [{ type: 'dimension', dimension: plutoOrbit }] }),
      ],
      items: ['t:ore', 't:proc', 't:penetrator', 't:gadget', 't:core'],
    });
    const cfg = {
      tier: 'uv', eraOrder: raw.eraOrder,
      world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ore', 't:proc', 't:penetrator'] }],
      machines: [{ machine: 't:proc', types: ['t:proc'] }, { machine: 't:penetrator', types: ['t:penetrator'] }],
      conditions: { dimension: { asKeysFor: [plutoOrbit] } },
      synthetic: [{ id: 'pluto-trip', produces: [`dim:${plutoOrbit}`] }],
      targets: [{ id: 'gadget', item: 't:gadget' }],
      eraResources: [{ ...pluto, items: ['t:core'] }],
      eraItems: [{ id: home.id, era: home.era, label: home.label, items: ['t:gadget'] }],
    };
    return run(dump, cfg);
  };
  const grp = (r) => r.out.eras.groups.find((x) => x.group.id === 'uv-home');
  assert.equal(grp(pack(false)).violations.length, 0);
  const bad = pack(true);
  assert.deepEqual(grp(bad).violations.map((v) => v.item), ['t:gadget']);
  assert.deepEqual(grp(bad).violations[0].resources.map((x) => x.id), ['pluto']);
  assert.equal(bad.out.verdict, 'FAIL');
});

// ------------------------------------------------------------------ re-count of docs/eras/uv.md "New process lines"

function recount() {
  const md = fs.readFileSync(path.join(ROOT, 'docs', 'eras', 'uv.md'), 'utf8');
  const start = md.indexOf('## New process lines');
  const sec = md.slice(start, md.indexOf('\n## ', start + 5));
  const rows = sec.split('\n').filter((l) => /^\| \d+ \|/.test(l)).map((l) => l.split('|').map((s) => s.trim()));
  const arrows = rows.map((r) => (r[3].match(/\u2192/g) || []).length);
  const cross = sec.slice(sec.indexOf('**Crossings')).split('\n')
    .filter((l) => l.startsWith('|') && !l.startsWith('|---') && !l.includes('Older line')).map((l) => l.split('|').map((s) => s.trim())[3]);
  return { lines: rows.length, arrows, steps: arrows.reduce((a, b) => a + b + 1, 0) / arrows.length, cross };
}

test('re-count: 22 lines of at least four arrows averaging 6.9 steps, and 24 crossings with LuV or older', (t) => {
  const { lines, arrows, steps, cross } = recount();
  const eras = cross.reduce((m, e) => ({ ...m, [e]: (m[e] || 0) + 1 }), {});
  t.diagnostic(`lines ${lines}, arrows ${arrows.join(',')}, steps ${steps.toFixed(2)} (min ${Math.min(...arrows) + 1}), crossings ${cross.length} ${JSON.stringify(eras)}`);
  assert.equal(lines, 22);
  assert.ok(arrows.every((a) => a >= 4), 'every line has at least four arrows');
  assert.equal(steps.toFixed(1), '6.9');
  assert.equal(Math.min(...arrows) + 1, 5, 'the shortest line has 5 steps (line 21, as the design names it)');
  assert.equal(cross.length, 24);
  for (const e of cross) assert.ok(['ULV', 'LV', 'MV', 'HV', 'EV', 'IV', 'LuV'].includes(e), `crossing with ${e} is not two eras back`);
});
