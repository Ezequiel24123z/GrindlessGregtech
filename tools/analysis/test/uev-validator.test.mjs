// UEV-C1: the validator's -Tier uev. The real tiers/uev.json (substages uev, uev-alpha, uev-barnard, uev-sirius, the checks of
// docs/eras/uev.md "Validator" and "Gate to UIV"), the planted cases that must fail (tennessine outside machines 2-4, a UIV item in a
// UEV recipe, a Barnard product before uev-barnard, a doubled Mk4 DEC row) and the re-count of the design's process lines and crossings.
// The planted mini packs reuse the real config's own pieces (its targets, era order and era resources), so a weakened check fails here.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTierConfig } from '../lib/config.mjs';
import { gi, gt, mkDump, run, verdicts } from './helpers.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIERS = path.join(HERE, '..', 'tiers');
const ROOT = path.join(HERE, '..', '..', '..');
const uev = () => loadTierConfig({ tier: 'uev' }, TIERS).raw;
const uevFile = () => JSON.parse(fs.readFileSync(path.join(TIERS, 'uev.json'), 'utf8'));
const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
const target = (id) => byId(uev().targets)[id];
const TENNESSINE = 'grindless:tennessine_atoms';
const CHAIN = 'gtceu:superheavy_chemistry_lab';

test('real tiers (uev): four substages in order after UHV, siblings, ids from the era data', () => {
  const raw = uev();
  assert.equal(raw.tier, 'uev');
  assert.equal(uevFile().extends, 'uhv');
  const at = (e) => raw.eraOrder.indexOf(e);
  for (const [a, b] of [['uhv-proxima', 'uev'], ['uev', 'uev-alpha'], ['uev-alpha', 'uev-barnard'], ['uev-barnard', 'uev-sirius'], ['uev-sirius', 'uiv']]) assert.ok(at(a) >= 0 && at(a) < at(b), `${a} before ${b}`);
  assert.deepEqual(raw.eraSiblings.at(-1), ['uev-alpha', 'uev-barnard']);
  const res = byId(raw.eraResources);
  assert.equal(res.barnard.era, 'uev-barnard');
  assert.equal(res.alpha.era, 'uev-alpha');
  assert.equal(res.sirius.era, 'uev-sirius');
  assert.equal(res.uiv.era, 'uiv');
});

test('real tiers (uev): every package is declared and lands; every reference names a declared package', () => {
  const raw = uev();
  const f = uevFile();
  for (const want of ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2', 'B3', 'B4', 'B5', 'W']) {
    assert.ok(f.packages[want], `package ${want}`);
    assert.ok(f.packages[want].landedWhen?.length > 0 || f.packages[want].landedWhenAny?.length > 0, `${want} has no landing mark`);
  }
  const ids = Object.keys(raw.packages);
  for (const x of [...f.machines, ...f.synthetic, ...f.targets, ...f.eraResources, ...f.eraItems]) {
    for (const p of [x.package].flat().filter(Boolean)) assert.ok(ids.includes(p), `${x.id || x.machine}: package ${p} is not declared`);
  }
});

test('real tiers (uev): the Validator\'s leak checks are unreachable checks gated on the right machines', () => {
  const t = byId(uev().targets);
  const un = (id, without, any) => {
    assert.ok(t[id], id);
    assert.equal(t[id].expect, 'unreachable', id);
    for (const w of without) assert.ok(t[id].without.includes(w), `${id}: ${w}`);
    if (any) assert.ok(t[id].anyOf.includes(any), `${id}: ${any}`);
  };
  un('isotopes-only-calutron', ['operate:gtceu:calutron*']);
  un('superheavy-only-chain', ['operate:gtceu:heavy_ion_cyclotron*', 'operate:gtceu:recoil_separator*', `operate:${CHAIN}*`], TENNESSINE);
  un('megabar-only-press', ['operate:gtceu:megabar_press*']);
  un('fe16n2-only-works', ['operate:gtceu:nitride_magnet_works*'], 'gtceu:fe16n2_dust');
  un('mk4-plasmas-only-mk4', ['operate:gtceu:uev_fusion_reactor*']);
  un('barnard-rock-only-drill', ['operate:gtceu:barnard_core_drill*'], 'grindless:barnard_core_rock');
  un('pellets-only-containment', ['operate:gtceu:containment_works*'], 'grindless:degenerate_pellet');
  for (const id of ['site-warp-gate']) assert.ok(t[id], id);
  const syn = byId(uev().synthetic);
  assert.ok(syn['swarm-station'].produces.includes('eu:uev'));
  assert.ok(syn['research-pulsar-chart'].produces.includes('research:1x_grindless_pulsar_navigation_chart'));
});

// ------------------------------------------------------------------ planted cases on a mini pack (the real targets and era data)

const mini = (extra) => ({
  tier: 'uev',
  world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ore', CHAIN, 't:proc'] }],
  machines: [{ machine: CHAIN, types: ['gtceu:superheavy_chemistry'] }, { machine: 't:proc', types: ['t:proc'] }],
  ...extra,
});

test('planted: tennessine made outside machines 2-4 fails superheavy-only-chain; from the chain alone it passes', () => {
  const chk = target('superheavy-only-chain');
  const cfg = mini({ targets: [{ id: 'gate', item: 't:gadget' }, chk] });
  const items = ['t:ore', CHAIN, 't:proc'];
  const lab = gt('t:lab/ts', 'gtceu:superheavy_chemistry', { ins: [gi('t:ore')], outs: [gi(TENNESSINE)] });
  const gadget = gt('t:proc/gadget', 't:proc', { ins: [gi(TENNESSINE)], outs: [gi('t:gadget')] });
  assert.deepEqual(verdicts(run(mkDump({ recipes: [lab, gadget], items }), cfg).out.gate), { gate: 'PASS', 'superheavy-only-chain': 'PASS' });
  const leak = gt('t:proc/ts', 't:proc', { ins: [gi('t:ore')], outs: [gi(TENNESSINE)] });
  const r = run(mkDump({ recipes: [lab, gadget, leak], items }), cfg);
  assert.equal(verdicts(r.out.gate)['superheavy-only-chain'], 'FAIL');
  assert.equal(r.out.verdict, 'FAIL');
});

// A group of the real era data over a mini pack: one recipe of the group's item needs `consumer`, which the dump may place in an era.
function eraPack(groupId, resourceId, makeResource, consumer, dim) {
  const raw = uev();
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
    tier: 'uev', eraOrder: raw.eraOrder,
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

test('planted: a UIV item consumed by a UEV recipe is an era violation (the real uev group and uiv resource)', () => {
  const clean = eraPack('uev-home', 'uiv', { items: ['gtceu:uiv_machine_casing'] }, null);
  assert.equal(grp(clean, 'uev-home').violations.length, 0);
  const bad = eraPack('uev-home', 'uiv', { items: ['gtceu:uiv_machine_casing'] }, 'gtceu:uiv_machine_casing');
  assert.deepEqual(grp(bad, 'uev-home').violations.map((v) => v.item), ['t:gadget']);
  assert.deepEqual(grp(bad, 'uev-home').violations[0].resources.map((x) => x.id), ['uiv']);
  assert.equal(bad.out.verdict, 'FAIL');
});

test('planted: a Barnard product needed before uev-barnard is an era violation (the real era order and Barnard resource)', () => {
  const clean = eraPack('uev-home', 'barnard', { items: ['grindless:barnard_core_rock'] }, null);
  assert.equal(grp(clean, 'uev-home').violations.length, 0);
  const bad = eraPack('uev-home', 'barnard', { items: ['grindless:barnard_core_rock'] }, 'grindless:barnard_core_rock');
  assert.deepEqual(grp(bad, 'uev-home').violations.map((v) => v.item), ['t:gadget']);
  assert.deepEqual(grp(bad, 'uev-home').violations[0].resources.map((x) => x.id), ['barnard']);
  assert.equal(bad.out.verdict, 'FAIL');
});

// ------------------------------------------------------------------ the Mk4 DEC converter: final rows, never doubled

const DEC_JSON = path.join(ROOT, 'pack', 'kubejs', 'data', 'grindless', 'tables', 'fusion_mk4.json');
const GENERATORS_JS = path.join(ROOT, 'pack', 'kubejs', 'server_scripts', 'grindless', 'power', 'generators.js');
const DEC = 'gtceu:direct_conversion';
const PARALLELS = 128;
const decTypes = (src) => {
  const m = /var TYPES = \[([\s\S]*?)\]/.exec(src);
  assert.ok(m, 'generators.js keeps its TYPES list');
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
};
/** Final rows: [{eut, total}] per plasma. A row doubled by the generator doubling, or by a doubled EU/t, no longer matches eut*duration. */
const DESIGN_ROWS = { uev_dhe3_plasma: [131072, 16777216], uev_pb11_plasma: [98304, 12582912], uev_polarised_plasma: [196608, 25165824] };

function decProblems(rows, types) {
  const out = [];
  if (types.includes(DEC)) out.push(`${DEC} is in generators.js TYPES: its rows would be doubled`);
  for (const [id, [eut, total]] of Object.entries(DESIGN_ROWS)) {
    const r = rows[id];
    if (!r) out.push(`${id}: row missing`);
    else if (r.eut !== eut || r.total !== total || r.eut * PARALLELS !== r.total) out.push(`${id}: ${r.eut} EU/t, ${r.total} total (design ${eut}, ${total})`);
  }
  return out;
}
function realRows() {
  const j = JSON.parse(fs.readFileSync(DEC_JSON, 'utf8'));
  const found = {};
  const walk = (o) => {
    if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === 'object') {
      const id = Object.keys(DESIGN_ROWS).find((k) => JSON.stringify(o).includes(`"${k}"`) && o.eut !== undefined);
      if (id && o.total !== undefined && !found[id]) found[id] = { eut: o.eut, total: o.total };
      Object.values(o).forEach(walk);
    }
  };
  walk(j);
  return found;
}

test('real pack: the Mk4 DEC rows are at their final figures and the type stays out of the doubling list', () => {
  const types = decTypes(fs.readFileSync(GENERATORS_JS, 'utf8'));
  assert.deepEqual(decProblems(realRows(), types), []);
});

test('planted: a doubled Mk4 DEC row fails (type added to TYPES, or a row written x2)', () => {
  const src = fs.readFileSync(GENERATORS_JS, 'utf8').replace(/var TYPES = \[/, `var TYPES = ['${DEC}', `);
  assert.deepEqual(decProblems(realRows(), decTypes(src)), [`${DEC} is in generators.js TYPES: its rows would be doubled`]);
  const rows = realRows();
  rows.uev_dhe3_plasma = { eut: rows.uev_dhe3_plasma.eut * 2, total: rows.uev_dhe3_plasma.total };
  const p = decProblems(rows, decTypes(fs.readFileSync(GENERATORS_JS, 'utf8')));
  assert.equal(p.length, 1);
  assert.ok(p[0].startsWith('uev_dhe3_plasma: '));
});

// ------------------------------------------------------------------ re-count of docs/eras/uev.md "New process lines"

function recount() {
  const md = fs.readFileSync(path.join(ROOT, 'docs', 'eras', 'uev.md'), 'utf8');
  const start = md.indexOf('## New process lines');
  const sec = md.slice(start, md.indexOf('\n## ', start + 5));
  const at = sec.indexOf('Crossings with lines two or more eras back');
  const rows = sec.slice(0, at).split('\n').filter((l) => /^\| \d+ \|/.test(l)).map((l) => l.split('|').map((s) => s.trim()));
  const arrows = rows.map((r) => (r[2].match(/\u2192/g) || []).length);
  const stated = rows.map((r) => Number(r[3]));
  const cross = sec.slice(at).split('\n').filter((l) => l.startsWith('|') && !l.startsWith('|---') && !/Older line|Era/.test(l)).map((l) => l.split('|').map((s) => s.trim())[4]);
  return { lines: rows.length, arrows, stated, steps: stated.reduce((a, b) => a + b, 0), cross };
}

test('re-count: the design\'s lines (each at least four arrows), their steps and the crossings with UV or older (reported as found)', (t) => {
  const { lines, arrows, stated, steps, cross } = recount();
  const eras = cross.reduce((m, e) => ({ ...m, [e]: (m[e] || 0) + 1 }), {});
  t.diagnostic(`lines ${lines}, steps ${steps} (avg ${(steps / lines).toFixed(2)}, min ${Math.min(...stated)}), arrows min ${Math.min(...arrows)}, crossings ${cross.length} ${JSON.stringify(eras)}`);
  assert.ok(lines > 0 && cross.length > 0, 'the tables were found');
  assert.ok(arrows.every((a) => a >= 4), 'every line has at least four arrows');
  assert.ok(Math.min(...stated) >= 6, 'none under 6 steps');
  for (const e of cross) assert.ok(['ULV', 'LV', 'MV', 'HV', 'EV', 'IV', 'LuV', 'ZPM', 'UV'].includes(e), `crossing with ${e} is not two eras back`);
});
