// ZPM-C1: the validator's -Tier zpm. The real tiers/zpm.json (three substages, packages, the checks of docs/eras/zpm.md "Validator" and
// "Gate to UV") and the planted cases that must fail: neutronium in ZPM, a Mk2 recipe kept above its 320 M start, a Saturn product asked
// for before the Saturn substage. The engine itself (place tokens, packages, eu_to_start) is proven in luv-validator.test.mjs; the mini
// packs below only use the real config's pieces (its conditions, its check shapes, its era order).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultTablesDir, loadTierConfig } from '../lib/config.mjs';
import { readPlaceTables } from '../lib/places.mjs';
import { gi, gt, mkDump, run, verdicts } from './helpers.mjs';

const TIERS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'tiers');
const zpm = () => loadTierConfig({ tier: 'zpm' }, TIERS).raw;
const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));

test('real tiers (zpm): three substages in order after LuV, the dimension ids from the pack\'s tables and none hard-coded', () => {
  const raw = zpm();
  const at = (e) => raw.eraOrder.indexOf(e);
  for (const [a, b] of [['luv-io-orbit', 'zpm'], ['zpm', 'zpm-saturn'], ['zpm-saturn', 'zpm-uranus'], ['zpm-uranus', 'uv']]) assert.ok(at(a) >= 0 && at(a) < at(b), `${a} before ${b}`);
  assert.deepEqual(raw.eraSiblings, [['iv-venus', 'iv-mercury'], ['luv-europa', 'luv-ganymede']], 'Saturn and Uranus are not siblings');
  const t = readPlaceTables(defaultTablesDir(TIERS));
  const { saturn, uranus } = t.places.surfaces;
  const text = fs.readFileSync(path.join(TIERS, 'zpm.json'), 'utf8');
  for (const d of [...t.orbits.dimensions, ...Object.values(t.places.surfaces)]) assert.ok(!text.includes(`"${d}"`) && !text.includes(`:${d}"`), `${d} is hard-coded in zpm.json`);
  const res = byId(raw.eraResources);
  assert.equal(res.saturn.era, 'zpm-saturn');
  assert.deepEqual(res.saturn.dimensions, [saturn, `${saturn}_orbit`]);
  assert.equal(res.uranus.era, 'zpm-uranus');
  assert.deepEqual(res.uranus.dimensions, [uranus, `${uranus}_orbit`]);
  const syn = byId(raw.synthetic);
  assert.deepEqual(syn['saturn-trip'].produces, [`dim:${saturn}`, `dim:${saturn}_orbit`]);
  assert.deepEqual(syn['uranus-trip'].produces, [`dim:${uranus}`, `dim:${uranus}_orbit`]);
  assert.ok(syn['saturn-trip'].capital.includes('grindless:naquadah_fuel_tank'));
  assert.ok(syn['uranus-trip'].capital.includes('grindless:aerogel_fuel_tank'));
  assert.ok(raw.conditions.dimension.asKeysFor.includes(`${saturn}_orbit`) && raw.conditions.dimension.asKeysFor.includes(uranus), 'inherited from luv through the tokens');
  const site = byId(raw.targets);
  assert.deepEqual(site['site-saturn'].dimensions, [`${saturn}_orbit`]);
  assert.deepEqual(site['site-uranus'].dimensions, [`${uranus}_orbit`]);
  assert.deepEqual(site['site-kuiper'].dimensions, [t.orbits.earth]);
});

test('real tiers (zpm): a moved table id moves the config (no id is copied into zpm.json)', () => {
  const dir = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TEMP || process.env.TMPDIR || '.'), 'zpm-tables-'));
  try {
    const t = readPlaceTables(defaultTablesDir(TIERS));
    for (const f of ['places.json', 'orbits.json']) fs.copyFileSync(path.join(defaultTablesDir(TIERS), f), path.join(dir, f));
    const p = path.join(dir, 'places.json');
    const moved = fs.readFileSync(p, 'utf8').replaceAll(t.places.surfaces.saturn, 'grindless:ringed_world');
    fs.writeFileSync(p, moved);
    const o = path.join(dir, 'orbits.json');
    fs.writeFileSync(o, fs.readFileSync(o, 'utf8').replaceAll(`${t.places.surfaces.saturn}_orbit`, 'grindless:ringed_world_orbit'));
    const raw = loadTierConfig({ tier: 'zpm', tables: dir }, TIERS).raw;
    assert.deepEqual(byId(raw.eraResources).saturn.dimensions, ['grindless:ringed_world', 'grindless:ringed_world_orbit']);
    assert.deepEqual(byId(raw.targets)['site-saturn'].dimensions, ['grindless:ringed_world_orbit']);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('real tiers (zpm): every package is declared, every package: reference points at one, and each lands on a machine or an item', () => {
  const raw = zpm();
  const ids = Object.keys(raw.packages);
  for (const want of ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'B1', 'B2', 'B3', 'B4', 'B5']) assert.ok(ids.includes(want), `package ${want}`);
  const all = [...raw.machines, ...raw.synthetic, ...raw.targets, ...raw.eraResources, ...raw.eraItems, ...(raw.world || [])];
  for (const x of all) {
    for (const p of [x.package].flat().filter(Boolean)) assert.ok(ids.includes(p), `${x.id || x.machine}: package ${p} is not declared`);
  }
  for (const [id, p] of Object.entries(raw.packages).filter(([id]) => /^[AB][1-9]$/.test(id))) assert.ok(p.landedWhen?.length > 0 || p.landedWhenAny?.length > 0, `${id} has no landing mark`);
  const zpmTargets = raw.targets.filter((x) => [x.package].flat().some((p) => /^[AB]\d/.test(p || '')));
  assert.ok(zpmTargets.length >= 25, 'each package carries its checks');
});

test('real tiers (zpm): the Validator\'s checks exist and are leak checks (expect unreachable) with the right gate', () => {
  const raw = zpm();
  const t = byId(raw.targets);
  const un = (id, without, any) => {
    assert.equal(t[id].expect, 'unreachable', id);
    assert.deepEqual(t[id].without, without, id);
    if (any) for (const a of any) assert.ok(t[id].anyOf.includes(a), `${id}: ${a}`);
  };
  un('europium-only-mk1-or-reductor', ['operate:gtceu:luv_fusion_reactor', 'operate:gtceu:europium_reductor'], ['gtceu:europium_dust']);
  un('mk2-only-metals', ['operate:gtceu:zpm_fusion_reactor'], ['gtceu:duranium_dust', 'gtceu:tritanium_dust', 'gtceu:darmstadtium_dust']);
  un('tholin-only-titan', ['operate:gtceu:entry_probe_bay'], ['grindless:tholin']);
  un('plume-only', ['operate:gtceu:plume_sampler'], ['grindless:silica_nanograins', 'fluid:gtceu:enceladus_brine']);
  un('slurry-only-uranus', ['operate:gtceu:ice_giant_siphon'], ['fluid:gtceu:diamond_slurry']);
  un('qubit-only-fab', ['operate:gtceu:qubit_fab'], ['grindless:qubit_array']);
  un('si28-only-c5', ['grindless:hot_cell/silicon_28_enrichment'], ['grindless:silicon_28_dust']);
  un('radium-capsule-only-plant', ['operate:gtceu:waste_retrieval_plant'], ['grindless:radium_capsule']);
  un('implanter-after-uranus', ['synthetic:uranus-trip']);
  un('no-uv-neutronium', [], ['gtceu:neutronium_ingot', 'fluid:gtceu:neutronium']);
  un('no-uv-mk3', [], ['gtceu:uv_fusion_reactor']);
  un('no-uv-circuit', [], ['#gtceu:circuits/uhv']);
  for (const id of ['mk2-cut-americium_and_naquadria_to_neutronium_plasma', 'mk2-cut-oganesson']) un(id, []);
  // GTM's Mk1 checks that the Mk2 moves are replaced, and LuV's gate and `bacteria` checks stay
  for (const gone of ['europium-only-mk1', 'duranium-only-mk2', 'no-tritanium']) assert.ok(!t[gone], `${gone} is dropped`);
  for (const kept of ['bacteria-only-europa', 'brewery-bacteria-cut', 'mk1-no-osmium']) assert.ok(t[kept], `${kept} stays`);
  assert.equal(raw.conditions.eu_to_start.max, 320000000);
  assert.equal(raw.conditions.eu_to_start.field, 'eu');
  for (const id of ['gate-uv-hull', 'gate-mk2', 'gate-network-zpm', 'gate-saturn-runs', 'gate-uranus-runs', 'gate-stored', 'gate-charts']) assert.ok(t[id], id);
  // the model: the converter is an EU source and the network tier a synthetic step
  const syn = byId(raw.synthetic);
  assert.deepEqual(syn['direct-converter'].recipesOf, ['gtceu:direct_conversion']);
  assert.ok(syn['direct-converter'].produces.includes('eu:zpm'));
  assert.deepEqual(syn['wireless-zpm'].produces, ['eu:zpm', 'wireless:zpm']);
  assert.deepEqual(syn['wireless-zpm'].consumes, ['eu:luv']);
  assert.ok(syn['wireless-zpm'].capital.includes('grindless:zpm_smes_cell'));
  // naquadria only from the stored impure solution (LuV's, kept out of ZPM's own naquadria)
  const res = byId(raw.eraResources);
  assert.deepEqual(res.naquadria.onlyFrom, ['impure-solution']);
  assert.equal(res['impure-solution'].era, 'luv');
  assert.equal(res.naquadria.era, 'zpm');
  // the machines run on ZPM hatches and the direct converter is a generator
  const m = byId(raw.machines.map((x) => ({ ...x, id: x.machine })));
  assert.ok(m['gtceu:qubit_fab'].partAbilities.energy_input.includes('gtceu:zpm_wireless_energy_hatch_16a'));
  assert.ok(m['gtceu:direct_energy_converter'].partAbilities.energy_output.includes('gtceu:zpm_energy_output_hatch'));
});

// ------------------------------------------------------------------ planted cases on a mini pack

const NEUT = { id: 'no-neutronium', anyOf: ['t:neutronium'], without: [], expect: 'unreachable' };
const baseMini = (extra) => ({
  tier: 'zpm',
  world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ore', 't:mk2', 't:proc'] }],
  machines: [{ machine: 't:mk2', types: ['t:fusion'] }, { machine: 't:proc', types: ['t:proc'] }],
  ...extra,
});

test('planted: neutronium in ZPM fails the no-UV check; without it the validator passes', () => {
  const cfg = baseMini({ targets: [{ id: 'gate', item: 't:gadget' }, NEUT] });
  const clean = mkDump({ recipes: [gt('t:proc/gadget', 't:proc', { ins: [gi('t:ore')], outs: [gi('t:gadget')] })], items: ['t:ore', 't:mk2', 't:proc', 't:gadget'] });
  assert.deepEqual(verdicts(run(clean, cfg).out.gate), { gate: 'PASS', 'no-neutronium': 'PASS' });
  const planted = mkDump({
    recipes: [
      gt('t:proc/gadget', 't:proc', { ins: [gi('t:ore'), gi('t:neutronium')], outs: [gi('t:gadget')] }),
      gt('t:proc/neutronium', 't:proc', { ins: [gi('t:ore')], outs: [gi('t:neutronium')] }),
    ],
    items: ['t:ore', 't:mk2', 't:proc', 't:gadget', 't:neutronium'],
  });
  const r = run(planted, cfg);
  assert.equal(verdicts(r.out.gate)['no-neutronium'], 'FAIL');
  assert.equal(r.out.verdict, 'FAIL');
});

test('planted: a Mk2 recipe above 320 M kept fails (the real cap alone, or the cut check)', () => {
  const cap = zpm().conditions.eu_to_start;
  const recipes = [
    gt('t:fusion/duranium', 't:fusion', { outs: [gi('t:du')], eut: 16384, data: { eu_to_start: 200000000 } }),
    gt('t:fusion/oganesson', 't:fusion', { outs: [gi('t:og')], eut: 65536, data: { eu_to_start: 600000000 } }),
  ];
  const dump = mkDump({ recipes, items: ['t:ore', 't:mk2', 't:proc', 't:du', 't:og'] });
  const checks = [{ id: 'du', item: 't:du' }, { id: 'og-cut', kind: 'recipe', recipe: 't:fusion/oganesson', without: [], expect: 'unreachable' }];
  // the kept recipe above the cap never runs: the cap does the cut and the duranium run still works
  assert.deepEqual(verdicts(run(dump, baseMini({ conditions: { eu_to_start: cap }, targets: checks })).out.gate), { du: 'PASS', 'og-cut': 'PASS' });
  // a cap raised past the recipe's start (or no cap) lets the planted recipe run: the cut check fails
  const loose = run(dump, baseMini({ conditions: { eu_to_start: { field: 'eu', max: 640000000 } }, targets: checks }));
  assert.equal(verdicts(loose.out.gate)['og-cut'], 'FAIL');
  assert.equal(loose.out.verdict, 'FAIL');
});

test('planted: a Saturn product needed before the Saturn substage is an era violation', () => {
  const raw = zpm();
  const eraOrder = raw.eraOrder;
  const pack = (homeNeedsTholin) => {
    const dump = mkDump({
      recipes: [
        gt('t:proc/gadget', 't:proc', { ins: homeNeedsTholin ? [gi('t:ore'), gi('t:tholin')] : [gi('t:ore')], outs: [gi('t:gadget')] }),
        gt('t:titan/tholin', 't:titan', { ins: [gi('t:ore')], outs: [gi('t:tholin')], conditions: [{ type: 'dimension', dimension: 'grindless:saturn_orbit' }] }),
      ],
      items: ['t:ore', 't:proc', 't:titan', 't:gadget', 't:tholin'],
    });
    const cfg = {
      tier: 'zpm', eraOrder,
      world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ore', 't:proc', 't:titan'] }],
      machines: [{ machine: 't:proc', types: ['t:proc'] }, { machine: 't:titan', types: ['t:titan'] }],
      conditions: { dimension: { asKeysFor: ['grindless:saturn_orbit'] } },
      synthetic: [{ id: 'saturn-trip', produces: ['dim:grindless:saturn_orbit'] }],
      targets: [{ id: 'gadget', item: 't:gadget' }],
      eraResources: [{ id: 'saturn', era: 'zpm-saturn', label: 'Saturn', items: ['t:tholin'], dimensions: ['grindless:saturn_orbit'] }],
      eraItems: [{ id: 'home', era: 'zpm', label: 'ZPM at home', items: ['t:gadget'] }],
    };
    return run(dump, cfg);
  };
  const ok = pack(false);
  const bad = pack(true);
  const grp = (r) => r.out.eras.groups.find((x) => x.group.id === 'home');
  assert.equal(grp(ok).violations.length, 0);
  assert.deepEqual(grp(bad).violations.map((v) => v.item), ['t:gadget']);
  assert.deepEqual(grp(bad).violations[0].resources.map((x) => x.id), ['saturn']);
  assert.equal(bad.out.verdict, 'FAIL');
});
