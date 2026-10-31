// UIV-C1: the validator's -Tier uiv. The real tiers/uiv.json (substages uiv, uiv-rxj1856, uiv-j0437, uiv-cygnus, the checks of
// docs/eras/uiv.md "Validator" and "Gate to UXV"), the planted cases that must fail (titanium-50 outside the calutron, a UXV item in a
// UIV recipe, a Cygnus X-1 product before uiv-cygnus, a doubled Mk5 DEC row) and the re-count of the design's lines, crossings and older modes.
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
const uiv = () => loadTierConfig({ tier: 'uiv' }, TIERS).raw;
const uivFile = () => JSON.parse(fs.readFileSync(path.join(TIERS, 'uiv.json'), 'utf8'));
const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
const target = (id) => byId(uiv().targets)[id];
const TI50 = 'gtceu:titanium_50_chloride_dust';
const CALUTRON = 'gtceu:calutron';

test('real tiers (uiv): four substages in order after UEV, siblings, ids from the era data', () => {
  const raw = uiv();
  assert.equal(raw.tier, 'uiv');
  assert.equal(uivFile().extends, 'uev');
  const at = (e) => raw.eraOrder.indexOf(e);
  for (const [a, b] of [['uev-sirius', 'uiv'], ['uiv', 'uiv-rxj1856'], ['uiv', 'uiv-j0437'], ['uiv-rxj1856', 'uiv-cygnus'], ['uiv-j0437', 'uiv-cygnus'], ['uiv-cygnus', 'uxv']]) assert.ok(at(a) >= 0 && at(a) < at(b), `${a} before ${b}`);
  assert.deepEqual(raw.eraSiblings.at(-1), ['uiv-rxj1856', 'uiv-j0437']);
  const res = byId(raw.eraResources);
  assert.equal(res.rxj1856.era, 'uiv-rxj1856');
  assert.equal(res.j0437.era, 'uiv-j0437');
  assert.equal(res.cygnus.era, 'uiv-cygnus');
  assert.equal(res.uxv.era, 'uxv');
});

test('real tiers (uiv): every package is declared and lands; every reference names a declared package', () => {
  const raw = uiv();
  const f = uivFile();
  for (const want of ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'B1', 'B2', 'B3', 'B4', 'B5', 'W', 'M1', 'M2']) {
    assert.ok(f.packages[want], `package ${want}`);
    assert.ok(f.packages[want].landedWhen?.length > 0 || f.packages[want].landedWhenAny?.length > 0, `${want} has no landing mark`);
  }
  const ids = Object.keys(raw.packages);
  for (const x of [...f.machines, ...f.synthetic, ...f.targets, ...f.eraResources, ...f.eraItems]) {
    for (const p of [x.package].flat().filter(Boolean)) assert.ok(ids.includes(p), `${x.id || x.machine}: package ${p} is not declared`);
  }
});

test('real tiers (uiv): the Validator\'s leak checks are unreachable checks gated on the right machines', () => {
  const t = byId(uiv().targets);
  const un = (id, without, any) => {
    assert.ok(t[id], id);
    assert.equal(t[id].expect, 'unreachable', id);
    for (const w of without) assert.ok(t[id].without.includes(w), `${id}: ${w}`);
    if (any) assert.ok(t[id].anyOf.includes(any), `${id}: ${any}`);
  };
  un('isotopes-only-calutron', [`operate:${CALUTRON}*`], TI50);
  un('isotopes-only-calutron', [`operate:${CALUTRON}*`], 'gtceu:titanium_50_dust');
  un('mk5-plasmas-only-mk5', ['operate:gtceu:uiv_fusion_reactor*']);
  un('mk4-plasmas-only-mk4', ['operate:gtceu:uev_fusion_reactor*', 'operate:gtceu:uiv_fusion_reactor*']);
  for (const id of ['site-rx', 'site-j0437', 'site-cygnus', 'gate-uxv-casing', 'gate-cygnus-orbit', 'gate-kerr-chart']) assert.ok(t[id], id);
  assert.ok(Object.keys(t).filter((k) => t[k].expect === 'unreachable').length >= 20, 'the 20 leak checks');
  const syn = byId(uiv().synthetic);
  assert.ok(syn['wireless-uiv'].produces.includes('eu:uiv'));
  assert.ok(syn['research-kerr-chart'].produces.includes('research:1x_grindless_kerr_chart'));
  // UXV-FX: the Matrioshka writes the rad-hard research before the jumps, so no synthetic makes it and the computer and works are home checks
  assert.ok(!Object.values(syn).some((s) => (s.produces || []).includes('research:rad_hard_controller')), 'no rad-hard research bootstrap');
  const home = byId(uiv().eraItems)['uiv-home'];
  for (const m of ['m:gtceu:matrioshka_computer', 'm:gtceu:droplet_radiator_works']) assert.ok(home.items.includes(m) && !home.optional, m);
});

// ------------------------------------------------------------------ planted cases on a mini pack (the real targets and era data)

const mini = (extra) => ({
  tier: 'uiv',
  world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ore', CALUTRON, 't:proc'] }],
  machines: [{ machine: CALUTRON, types: ['gtceu:calutron_separation'] }, { machine: 't:proc', types: ['t:proc'] }],
  ...extra,
});

test('planted: titanium-50 made outside the calutron fails isotopes-only-calutron; from the calutron alone it passes', () => {
  const chk = target('isotopes-only-calutron');
  const cfg = mini({ targets: [{ id: 'gate', item: 't:gadget' }, { ...chk, anyOf: [TI50] }] });
  const items = ['t:ore', CALUTRON, 't:proc'];
  const cal = gt('t:cal/ti50', 'gtceu:calutron_separation', { ins: [gi('t:ore')], outs: [gi(TI50)] });
  const gadget = gt('t:proc/gadget', 't:proc', { ins: [gi(TI50)], outs: [gi('t:gadget')] });
  assert.deepEqual(verdicts(run(mkDump({ recipes: [cal, gadget], items }), cfg).out.gate), { gate: 'PASS', 'isotopes-only-calutron': 'PASS' });
  const leak = gt('t:proc/ti50', 't:proc', { ins: [gi('t:ore')], outs: [gi(TI50)] });
  const r = run(mkDump({ recipes: [cal, gadget, leak], items }), cfg);
  assert.equal(verdicts(r.out.gate)['isotopes-only-calutron'], 'FAIL');
  assert.equal(r.out.verdict, 'FAIL');
});

// A group of the real era data over a mini pack: one recipe of the group's item needs `consumer`, which the dump may place in an era.
function eraPack(groupId, resourceId, makeResource, consumer, dim) {
  const raw = uiv();
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
    tier: 'uiv', eraOrder: raw.eraOrder,
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

test('planted: a UXV item consumed by a UIV recipe is an era violation (the real uiv group and uxv resource)', () => {
  const clean = eraPack('uiv-home', 'uxv', { items: ['gtceu:uxv_machine_casing'] }, null);
  assert.equal(grp(clean, 'uiv-home').violations.length, 0);
  const bad = eraPack('uiv-home', 'uxv', { items: ['gtceu:uxv_machine_casing'] }, 'gtceu:uxv_machine_casing');
  assert.deepEqual(grp(bad, 'uiv-home').violations.map((v) => v.item), ['t:gadget']);
  assert.deepEqual(grp(bad, 'uiv-home').violations[0].resources.map((x) => x.id), ['uxv']);
  assert.equal(bad.out.verdict, 'FAIL');
});

test('planted: a Cygnus X-1 product needed before uiv-cygnus is an era violation (the real era order and Cygnus resource)', () => {
  const clean = eraPack('uiv-home', 'cygnus', { items: ['grindless:kerr_probe_data'] }, null);
  assert.equal(grp(clean, 'uiv-home').violations.length, 0);
  const bad = eraPack('uiv-home', 'cygnus', { items: ['grindless:kerr_probe_data'] }, 'grindless:kerr_probe_data');
  assert.deepEqual(grp(bad, 'uiv-home').violations.map((v) => v.item), ['t:gadget']);
  assert.deepEqual(grp(bad, 'uiv-home').violations[0].resources.map((x) => x.id), ['cygnus']);
  assert.equal(bad.out.verdict, 'FAIL');
});

// ------------------------------------------------------------------ the Mk5 DEC converter: final rows, never doubled

const DEC_JSON = path.join(ROOT, 'pack', 'kubejs', 'data', 'grindless', 'tables', 'fusion_mk5.json');
const GENERATORS_JS = path.join(ROOT, 'pack', 'kubejs', 'server_scripts', 'grindless', 'power', 'generators.js');
const DEC = 'gtceu:direct_conversion';
const PARALLELS = 128;
const decTypes = (src) => {
  const m = /var TYPES = \[([\s\S]*?)\]/.exec(src);
  assert.ok(m, 'generators.js keeps its TYPES list');
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
};
/** Final rows: [{eut, total}] per plasma. A row doubled by the generator doubling, or by a doubled EU/t, no longer matches eut*duration. */
const DESIGN_ROWS = { uiv_he3he3_plasma: [524288, 67108864], uiv_pli6_plasma: [393216, 50331648], uiv_pn15_plasma: [786432, 100663296] };

function decProblems(rows, types) {
  const out = [];
  for (const t of [DEC, 'gtceu:penrose_extraction', 'gtceu:decay_heat']) if (types.includes(t)) out.push(`${t} is in generators.js TYPES: its rows would be doubled`);
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

test('real pack: the Mk5 DEC rows are at their final figures and the types stay out of the doubling list', () => {
  const types = decTypes(fs.readFileSync(GENERATORS_JS, 'utf8'));
  assert.deepEqual(decProblems(realRows(), types), []);
});

test('planted: a doubled Mk5 DEC row fails (type added to TYPES, or a row written x2)', () => {
  const src = fs.readFileSync(GENERATORS_JS, 'utf8').replace(/var TYPES = \[/, `var TYPES = ['${DEC}', `);
  assert.deepEqual(decProblems(realRows(), decTypes(src)), [`${DEC} is in generators.js TYPES: its rows would be doubled`]);
  const rows = realRows();
  rows.uiv_he3he3_plasma = { eut: rows.uiv_he3he3_plasma.eut * 2, total: rows.uiv_he3he3_plasma.total };
  const p = decProblems(rows, decTypes(fs.readFileSync(GENERATORS_JS, 'utf8')));
  assert.equal(p.length, 1);
  assert.ok(p[0].startsWith('uiv_he3he3_plasma: '));
});

// ------------------------------------------------------------------ re-count of docs/eras/uiv.md (lines, crossings, older modes)

const section = (md, head) => {
  const start = md.indexOf(head);
  return md.slice(start, md.indexOf('\n## ', start + 5));
};
function recount() {
  const md = fs.readFileSync(path.join(ROOT, 'docs', 'eras', 'uiv.md'), 'utf8');
  const sec = section(md, '## New process lines');
  const at = sec.indexOf('Crossings with lines two or more eras back');
  const rows = sec.slice(0, at).split('\n').filter((l) => /^\| \d+ \|/.test(l)).map((l) => l.split('|').map((s) => s.trim()));
  const arrows = rows.map((r) => (r[2].match(/\u2192/g) || []).length);
  const stated = rows.map((r) => Number(r[3]));
  const cross = sec.slice(at).split('\n').filter((l) => l.startsWith('|') && !l.startsWith('|---') && !/Older line|Era/.test(l)).map((l) => l.split('|').map((s) => s.trim())[4]);
  const older = section(md, '## Older machines, new modes').split('\n').filter((l) => l.startsWith('|') && !l.startsWith('|---') && !l.startsWith('| Machine'));
  return { lines: rows.length, arrows, stated, steps: stated.reduce((a, b) => a + b, 0), cross, older: older.length };
}

test('re-count: the design\'s lines (each at least four arrows), steps, crossings with UHV or older and older-machine modes (reported as found)', (t) => {
  const { lines, arrows, stated, steps, cross, older } = recount();
  const eras = cross.reduce((m, e) => ({ ...m, [e]: (m[e] || 0) + 1 }), {});
  t.diagnostic(`lines ${lines}, steps ${steps} (min ${Math.min(...stated)}), arrows ${arrows.reduce((a, b) => a + b, 0)} (min ${Math.min(...arrows)}), crossings ${cross.length} ${JSON.stringify(eras)}, older modes ${older}`);
  assert.ok(lines > 0 && cross.length > 0 && older > 0, 'the tables were found');
  assert.ok(arrows.every((a) => a >= 4), 'every line has at least four arrows');
  for (const e of cross) assert.ok(['ULV', 'LV', 'MV', 'HV', 'EV', 'IV', 'LuV', 'ZPM', 'UV', 'UHV'].includes(e), `crossing with ${e} is not two eras back`);
});
