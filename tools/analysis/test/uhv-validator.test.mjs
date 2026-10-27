// UHV-C1: the validator's -Tier uhv. The real tiers/uhv.json (substages uhv, uhv-mercury, uhv-proxima, packages, the checks of
// docs/eras/uhv.md "Validator" and "Gate to UEV"), the planted cases that must fail (berkelium outside the facility, a UEV item in a UHV
// recipe, a Proxima product before uhv-proxima, a doubled swarm station) and the re-count of the design's process lines and crossings.
// The planted mini packs reuse the real config's own pieces (its targets, era order and era resources), so a weakened check fails here.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultTablesDir, loadTierConfig } from '../lib/config.mjs';
import { readPlaceTables, resolvePlaceTokens } from '../lib/places.mjs';
import { gi, gt, mkDump, run, verdicts } from './helpers.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIERS = path.join(HERE, '..', 'tiers');
const ROOT = path.join(HERE, '..', '..', '..');
const uhv = () => loadTierConfig({ tier: 'uhv' }, TIERS).raw;
const uhvFile = () => JSON.parse(fs.readFileSync(path.join(TIERS, 'uhv.json'), 'utf8'));
const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
const target = (id) => byId(uhv().targets)[id];
const BERKELIUM = 'grindless:berkelium_249';
const FACILITY = 'gtceu:transuranium_facility';

test('real tiers (uhv): three substages in order after UV, Proxima ids from tokens, none hard-coded', () => {
  const raw = uhv();
  assert.equal(raw.tier, 'uhv');
  assert.equal(uhvFile().extends, 'uv');
  const at = (e) => raw.eraOrder.indexOf(e);
  for (const [a, b] of [['uv-pluto', 'uhv'], ['uhv', 'uhv-mercury'], ['uhv-mercury', 'uhv-proxima'], ['uhv-proxima', 'uev']]) assert.ok(at(a) >= 0 && at(a) < at(b), `${a} before ${b}`);
  assert.deepEqual(raw.eraSiblings.at(-1), ['uhv-mercury', 'uhv-proxima']);
  const t = readPlaceTables(defaultTablesDir(TIERS));
  assert.deepEqual(resolvePlaceTokens({ a: '${orbit:proxima_b}' }, t), { a: 'grindless:proxima_b_orbit' });
  const text = fs.readFileSync(path.join(TIERS, 'uhv.json'), 'utf8');
  for (const d of ['gcyr:proxima_centauri_b', 'gcyr:proxima_centauri_b_orbit', 'grindless:proxima_b_orbit']) assert.ok(!text.includes(`"${d}"`), `${d} is hard-coded in uhv.json`);
  const proxima = byId(raw.eraResources).proxima;
  assert.equal(proxima.era, 'uhv-proxima');
  assert.deepEqual(uhvFile().eraResources.find((x) => x.id === 'proxima').dimensions, ['${place:proxima_b}', '${orbit:proxima_b}']);
  assert.deepEqual(proxima.dimensions, ['gcyr:proxima_centauri_b', 'grindless:proxima_b_orbit']);
  assert.ok(byId(uhvFile().targets)['site-proxima-orbit'].dimensions.includes('${orbit:proxima_b}'));
});

test('real tiers (uhv): every package is declared and lands on a machine or an item; F1 ids are not re-registered', () => {
  const raw = uhv();
  const f = uhvFile();
  for (const want of ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7']) {
    assert.ok(f.packages[want], `package ${want}`);
    assert.ok(f.packages[want].landedWhen?.length > 0 || f.packages[want].landedWhenAny?.length > 0, `${want} has no landing mark`);
  }
  const ids = Object.keys(raw.packages);
  for (const x of [...f.machines, ...f.synthetic, ...f.targets, ...f.eraResources, ...f.eraItems]) {
    for (const p of [x.package].flat().filter(Boolean)) assert.ok(ids.includes(p), `${x.id || x.machine}: package ${p} is not declared`);
  }
});

test('real tiers (uhv): the Validator\'s leak checks are unreachable checks gated on the right machines', () => {
  const t = byId(uhv().targets);
  const un = (id, without) => {
    assert.ok(t[id], id);
    assert.equal(t[id].expect, 'unreachable', id);
    for (const w of without) assert.ok(t[id].without.includes(w), `${id}: ${w}`);
  };
  un('transuranics-only-facility', [`operate:high_flux_reactor*`.replace('operate:', 'operate:gtceu:'), `operate:${FACILITY}*`]);
  for (const b of [BERKELIUM, 'grindless:californium_252', 'grindless:nickel_63_target', 'grindless:thorium_229']) assert.ok(t['transuranics-only-facility'].anyOf.includes(b), b);
  un('segments-only-foundry', ['operate:gtceu:swarm_segment_foundry*']);
  un('proxima-ice-only-drill', ['operate:gtceu:cold_trap_drill*']);
  un('proxima-liquors-only-heap', ['operate:gtceu:biomining_heap*']);
  un('chart-only-astrometer', ['operate:gtceu:baseline_astrometer*']);
  for (const id of ['gate-warp-open', 'gate-warp-sustain', 'gate-uev-casing', 'gate-chart', 'gate-swarm-c2', 'gate-run-cold-trap-drilling', 'gate-run-biomining']) assert.ok(t[id], id);
  const syn = byId(uhv().synthetic);
  assert.ok(syn['swarm-station'].recipesOf.includes('gtceu:dyson_swarm'));
  assert.ok(syn['research-chart'].produces.includes('research:1x_grindless_stellar_neighbourhood_chart'));
});

// ------------------------------------------------------------------ planted cases on a mini pack (the real targets and era data)

const mini = (extra) => ({
  tier: 'uhv',
  world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ore', FACILITY, 't:proc'] }],
  machines: [{ machine: FACILITY, types: ['gtceu:transuranium_processing'] }, { machine: 't:proc', types: ['t:proc'] }],
  ...extra,
});

test('planted: berkelium made outside the facility fails transuranics-only-facility; from the facility alone it passes', () => {
  const chk = target('transuranics-only-facility');
  const cfg = mini({ targets: [{ id: 'gate', item: 't:gadget' }, chk] });
  const items = ['t:ore', FACILITY, 't:proc'];
  const fac = gt('t:facility/bk', 'gtceu:transuranium_processing', { ins: [gi('t:ore')], outs: [gi(BERKELIUM)] });
  const gadget = gt('t:proc/gadget', 't:proc', { ins: [gi(BERKELIUM)], outs: [gi('t:gadget')] });
  assert.deepEqual(verdicts(run(mkDump({ recipes: [fac, gadget], items }), cfg).out.gate), { gate: 'PASS', 'transuranics-only-facility': 'PASS' });
  const leak = gt('t:proc/bk', 't:proc', { ins: [gi('t:ore')], outs: [gi(BERKELIUM)] });
  const r = run(mkDump({ recipes: [fac, gadget, leak], items }), cfg);
  assert.equal(verdicts(r.out.gate)['transuranics-only-facility'], 'FAIL');
  assert.equal(r.out.verdict, 'FAIL');
});

// A group of the real era data over a mini pack: one recipe of the group's item needs `needs`, which the dump may place in an era.
function eraPack(groupId, resourceId, makeResource, consumer, dim) {
  const raw = uhv();
  const res = byId(raw.eraResources)[resourceId];
  const group = byId(raw.eraItems)[groupId];
  const dump = mkDump({
    recipes: [
      gt('t:proc/gadget', 't:proc', { ins: [gi('t:ore'), ...(consumer ? [gi(consumer)] : [])], outs: [gi('t:gadget')] }),
      ...(consumer ? [gt('t:maker/made', 't:proc', { ins: [gi('t:ore')], outs: [gi(consumer)], conditions: dim ? [{ type: 'dimension', dimension: dim }] : [] })] : []),
    ],
    items: ['t:ore', 't:proc', 't:gadget', ...(consumer ? [consumer] : [])],
  });
  const cfg = {
    tier: 'uhv', eraOrder: raw.eraOrder,
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ore', 't:proc'] }],
    machines: [{ machine: 't:proc', types: ['t:proc'] }],
    conditions: dim ? { dimension: { asKeysFor: [dim] } } : {},
    synthetic: dim ? [{ id: 'trip', produces: [`dim:${dim}`] }] : [],
    targets: [{ id: 'gadget', item: 't:gadget' }],
    eraResources: [{ ...res, ...makeResource }],
    eraItems: [{ id: group.id, era: group.era, label: group.label, items: ['t:gadget'] }],
  };
  return run(dump, cfg);
}
const grp = (r, id) => r.out.eras.groups.find((x) => x.group.id === id);

test('planted: a UEV item consumed by a UHV recipe is an era violation (the real uhv group and uev resource)', () => {
  const clean = eraPack('uhv-home', 'uev', { items: ['gtceu:uev_machine_casing'] }, null);
  assert.equal(grp(clean, 'uhv-home').violations.length, 0);
  const bad = eraPack('uhv-home', 'uev', { items: ['gtceu:uev_machine_casing'] }, 'gtceu:uev_machine_casing');
  assert.deepEqual(grp(bad, 'uhv-home').violations.map((v) => v.item), ['t:gadget']);
  assert.deepEqual(grp(bad, 'uhv-home').violations[0].resources.map((x) => x.id), ['uev']);
  assert.equal(bad.out.verdict, 'FAIL');
});

test('planted: a Proxima product needed before uhv-proxima is an era violation (the real era order and Proxima resource)', () => {
  const clean = eraPack('uhv-home', 'proxima', { items: ['grindless:proxima_ice_core'] }, null);
  assert.equal(grp(clean, 'uhv-home').violations.length, 0);
  const bad = eraPack('uhv-home', 'proxima', { items: ['grindless:proxima_ice_core'] }, 'grindless:proxima_ice_core');
  assert.deepEqual(grp(bad, 'uhv-home').violations.map((v) => v.item), ['t:gadget']);
  assert.deepEqual(grp(bad, 'uhv-home').violations[0].resources.map((x) => x.id), ['proxima']);
  assert.equal(bad.out.verdict, 'FAIL');
});

// ------------------------------------------------------------------ the swarm station: final figures, never doubled

const GENERATORS_JS = path.join(ROOT, 'pack', 'kubejs', 'server_scripts', 'grindless', 'power', 'generators.js');
const SWARM = 'gtceu:dyson_swarm';
const doubledTypes = (src) => {
  const m = /var TYPES = \[([\s\S]*?)\]/.exec(src);
  assert.ok(m, 'generators.js keeps its TYPES list');
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
};

/** The problems of the swarm station: its type in the doubling list, or a modelled EU/t that is not the recipes' final figure. */
function swarmProblems(synthetic, types, eut) {
  const out = [];
  if (types.includes(SWARM)) out.push(`${SWARM} is in generators.js TYPES: its recipes would be doubled`);
  const s = byId(synthetic)['swarm-station'];
  if (!s || !s.recipesOf?.includes(SWARM)) out.push('swarm-station does not model the swarm type');
  else if (s.euPerTick !== eut) out.push(`swarm-station: ${s.euPerTick} EU/t modelled, the pack says ${eut}`);
  return out;
}

test('real pack: the swarm station is modelled at its final figure and stays out of the doubling list', () => {
  const types = doubledTypes(fs.readFileSync(GENERATORS_JS, 'utf8'));
  const s = byId(uhv().synthetic)['swarm-station'];
  assert.deepEqual(swarmProblems(uhv().synthetic, types, s.euPerTick), []);
  assert.ok(s.produces.includes('eu:uhv'));
});

test('planted: a doubled swarm station fails (its type added to TYPES, or its figure written x2)', () => {
  const s = byId(uhv().synthetic)['swarm-station'];
  const src = fs.readFileSync(GENERATORS_JS, 'utf8').replace(/var TYPES = \[/, `var TYPES = ['${SWARM}', `);
  assert.deepEqual(swarmProblems(uhv().synthetic, doubledTypes(src), s.euPerTick), [`${SWARM} is in generators.js TYPES: its recipes would be doubled`]);
  const p2 = swarmProblems(uhv().synthetic, doubledTypes(fs.readFileSync(GENERATORS_JS, 'utf8')), s.euPerTick / 2);
  assert.equal(p2.length, 1);
  assert.ok(p2[0].startsWith('swarm-station: '));
});

// ------------------------------------------------------------------ re-count of docs/eras/uhv.md "New process lines"

function recount() {
  const md = fs.readFileSync(path.join(ROOT, 'docs', 'eras', 'uhv.md'), 'utf8');
  const start = md.indexOf('## New process lines');
  const sec = md.slice(start, md.indexOf('\n## ', start + 5));
  const rows = sec.split('\n').filter((l) => /^\| \d+ \|/.test(l)).map((l) => l.split('|').map((s) => s.trim()));
  const arrows = rows.map((r) => (r[2].match(/\u2192/g) || []).length);
  const stated = rows.map((r) => Number(r[3]));
  const cross = sec.slice(sec.indexOf('**Crossings')).split('\n')
    .filter((l) => l.startsWith('|') && !l.startsWith('|---') && !l.includes('Older line')).map((l) => l.split('|').map((s) => s.trim())[3]);
  return { lines: rows.length, arrows, stated, steps: stated.reduce((a, b) => a + b, 0) / stated.length, cross };
}

test('re-count: the design\'s lines (each at least four arrows), their steps and the crossings with ZPM or older', (t) => {
  const { lines, arrows, stated, steps, cross } = recount();
  const eras = cross.reduce((m, e) => ({ ...m, [e]: (m[e] || 0) + 1 }), {});
  t.diagnostic(`lines ${lines}, steps ${steps.toFixed(2)} (min ${Math.min(...stated)}), arrows min ${Math.min(...arrows)}, crossings ${cross.length} ${JSON.stringify(eras)}`);
  assert.ok(arrows.every((a) => a >= 4), 'every line has at least four arrows');
  assert.ok(Math.min(...stated) >= 6, 'none under 6 steps');
  for (const e of cross) assert.ok(['ULV', 'LV', 'MV', 'HV', 'EV', 'IV', 'LuV', 'ZPM'].includes(e), `crossing with ${e} is not two eras back`);
  assert.equal(lines, 32);
  assert.equal(steps.toFixed(1), '7.0');
  assert.equal(cross.length, 40);
});
