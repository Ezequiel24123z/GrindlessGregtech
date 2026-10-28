// UHV-A3 (docs/eras/uhv.md, "A3. Water and betavoltaics"): the ultrapure water plant's, the betavoltaic fab's and the older rows'
// table (line 4, 11 and 22: the diamond lattice fab's circuits 5-6, the isotope column's circuit 3, the methanation), checked without
// Minecraft by static recipe lookup, with the pack's scripts run in the stand-in (lib/kubejs_static.mjs) so the ZPM rows of the same
// recipe types are in the lookup too. T1: none (UV-A1's table-driven machines, proof reuse).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const table = (name) => JSON.parse(fs.readFileSync(path.join(tables, name), 'utf8'));
const T = table('betavoltaics.json');
const TC = table('transcurium.json');
const HOT = table('hot_cell.json');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const G = run.global.grindless;
const BV = plain(G.betavoltaics);
const Q = plain(G.qubits);
const SS = plain(G.saturnSiphon);

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => (typeof x === 'string' ? x : x.id));
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn), ids(r.charge));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const rowsOf = (type) => T.types[type].recipes;
const by = (type, name) => {
  const r = rowsOf(type).find((x) => x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};

// every recipe-producing row of every table, as [table:where, recipe]
function allRows() {
  const out = [];
  for (const f of fs.readdirSync(tables).filter((n) => n.endsWith('.json'))) {
    const walk = (node, where) => {
      if (Array.isArray(node)) node.forEach((x, i) => walk(x, `${where}[${i}]`));
      else if (node && typeof node === 'object') {
        if (Array.isArray(node.itemsOut) || Array.isArray(node.fluidsOut)) out.push([`${f}:${where}`, node]);
        for (const [k, v] of Object.entries(node)) if (k !== 'itemsOut' && k !== 'fluidsOut') walk(v, `${where}.${k}`);
      }
    };
    walk(JSON.parse(fs.readFileSync(path.join(tables, f), 'utf8')), '');
  }
  return out;
}
const producers = (id) => allRows().filter(([, r]) => outputs(r).includes(id));

// lookup keys of a published recipe of any of the three scripts (this package's table rows, ZPM qubits, ZPM Saturn siphon)
function keysOf(r) {
  const k = new Set([`circuit:${r.circuit}`]);
  ids(r.itemsIn).forEach((id) => k.add(`i:${id}`));
  ids(r.kept).concat(ids(r.notConsumedItems), ids(r.notConsumed), r.worn ? [r.worn] : []).forEach((id) => k.add(`i:${id}`));
  ids(r.fluidsIn).concat(ids(r.charge), ids(r.notConsumedFluids)).forEach((id) => k.add(`f:${id}`));
  return k;
}

test('the scripts load: every row made, nothing skipped, no clash, both controllers', () => {
  const mine = run.errors.filter((e) => /betavoltaics|zpm\/(qubits|saturn_siphon)/.test(e.file || ''));
  assert.deepEqual(mine, []);
  const rows = Object.values(T.types).flatMap((t) => t.recipes);
  assert.equal(BV.recipes.length, rows.length);
  assert.deepEqual(BV.skipped, []);
  assert.deepEqual(BV.clashes, []);
  assert.deepEqual(BV.controllerRecipes, ['grindless:crafting/ultrapure_water_plant', 'grindless:crafting/betavoltaic_fab']);
  const made = new Set(run.docs.recipes.recipes.map((r) => r.i));
  for (const r of BV.recipes) assert.ok(made.has(r.recipeId), r.recipeId);
  const isotope = run.docs.recipes.recipes.find((r) => r.i === 'grindless:cryogenic_isotope_separation/carbon_12');
  assert.ok(JSON.stringify(isotope.j.recipeConditions).includes('grindless:saturn_orbit'), 'the C-12 column runs in Saturn orbit');
});

test('one recipe per lookup path, with the ZPM rows of the same types: unique circuits, no subset clash', () => {
  const all = BV.recipes.concat(Q.recipes, SS.recipes);
  for (const type of ['ultrapure_water', 'betavoltaic', 'diamond_cvd', 'cryogenic_isotope_separation']) {
    const rs = all.filter((r) => r.type === type);
    const circuits = rs.map((r) => r.circuit);
    assert.equal(new Set(circuits).size, circuits.length, `${type}: ${circuits}`);
    const ks = rs.map(keysOf);
    const sub = (a, b) => [...a].every((k) => b.has(k));
    for (let i = 0; i < ks.length; i++) {
      for (let j = i + 1; j < ks.length; j++) assert.ok(!sub(ks[i], ks[j]) && !sub(ks[j], ks[i]), `${type}: ${rs[i].name} / ${rs[j].name}`);
    }
  }
  assert.deepEqual(rowsOf('diamond_cvd').map((r) => r.circuit), [5, 6]);
  assert.deepEqual(rowsOf('cryogenic_isotope_separation').map((r) => r.circuit), [3]);
  // GTM's chemical reactor: the methanation's ingredients are ours alone (carbon-12 monoxide)
  assert.ok(inputs(by('chemical_reactor', 'carbon_12_methanation')).includes('gtceu:carbon_12_monoxide'));
});

test('the recipes fit the machines\' slots (startup maxIO; the circuit takes an item slot)', () => {
  const io = {
    ultrapure_water: ['uhv/betavoltaics.js', { itemsIn: 3, itemsOut: 0, fluidsIn: 2, fluidsOut: 2 }],
    betavoltaic: ['uhv/betavoltaics.js', { itemsIn: 2, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 }],
    diamond_cvd: ['zpm/qubits.js', { itemsIn: 4, itemsOut: 1, fluidsIn: 3, fluidsOut: 1 }],
    cryogenic_isotope_separation: ['zpm/saturn_siphon.js', null]
  };
  for (const [type, [file, m]] of Object.entries(io)) {
    const startup = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', ...file.split('/')), 'utf8');
    const max = m || { itemsIn: 1, itemsOut: 0, fluidsIn: 1, fluidsOut: 2 };
    if (m) assert.ok(startup.includes(`maxIO: { itemsIn: ${m.itemsIn}, itemsOut: ${m.itemsOut}, fluidsIn: ${m.fluidsIn}, fluidsOut: ${m.fluidsOut} }`), type);
    else assert.ok(startup.includes("type: 'cryogenic_isotope_separation', io: [1, 0, 1, 2]"), type);
    for (const r of rowsOf(type)) {
      assert.ok(r.itemsIn.length + r.kept.length + 1 <= max.itemsIn, `${r.name} items in`);
      assert.ok(r.fluidsIn.length + r.charge.length <= max.fluidsIn, `${r.name} fluids in`);
      assert.ok(r.itemsOut.length <= max.itemsOut, `${r.name} items out`);
      assert.ok(r.fluidsOut.length <= max.fluidsOut, `${r.name} fluids out`);
    }
  }
});

test('ultrapure water comes only from the plant, made from plain water', () => {
  const p = producers('gtceu:ultrapure_water');
  assert.deepEqual(p.map(([w]) => w), ['betavoltaics.json:.types.ultrapure_water.recipes[0]']);
  const made = run.docs.recipes.recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes('"gtceu:ultrapure_water"'));
  assert.deepEqual(made.map((r) => r.i), ['grindless:ultrapure_water/ultrapure_water']);
  const w = by('ultrapure_water', 'ultrapure_water');
  assert.ok(inputs(w).includes('minecraft:water'));
  assert.ok(!inputs(w).includes('gtceu:water'));
  assert.ok(ids(w.kept).includes('grindless:ion_exchange_resin'), 'the resin is kept');
  // the reverse osmosis concentrate leaves as salt water (GTM's electrolyser takes it)
  const water = w.fluidsIn.find((f) => f.id === 'minecraft:water').amount;
  assert.equal(w.fluidsOut.reduce((s, f) => s + f.amount, 0), water);
});

test('the betavoltaic cell holds nickel-63 from the HFIR on diamond diodes from the diamond lattice fab', () => {
  assert.deepEqual(producers('grindless:betavoltaic_cell').map(([, r]) => r.name), ['betavoltaic_cell']);
  const cell = by('betavoltaic', 'betavoltaic_cell');
  assert.ok(inputs(cell).includes('grindless:diamond_diode') && inputs(cell).includes('gtceu:nickel_63_plating_liquor'));
  const liquor = by('betavoltaic', 'plating_liquor');
  assert.ok(inputs(liquor).includes('grindless:nickel_63_target'));
  assert.ok(TC.types.high_flux_irradiation.recipes.some((r) => r.name === 'nickel_target' && outputs(r).includes('grindless:nickel_63_target')), 'the HFIR makes nickel-63');
  assert.deepEqual(producers('grindless:diamond_diode').map(([, r]) => r.name), ['diamond_diode']);
  const diode = by('diamond_cvd', 'diamond_diode');
  for (const id of ['grindless:cvd_diamond_plate', 'gtceu:boron_dust', 'gtceu:phosphorus_dust']) assert.ok(inputs(diode).includes(id), id);
  assert.ok(Q.recipes.some((r) => r.type === 'diamond_cvd' && ids(r.itemsOut).includes('grindless:cvd_diamond_plate')), 'the plate is ZPM\'s');
  // the spent bath closes: nitric acid back to circuit 1, the nickel-62 left over to the hot cell's mode 7
  const strip = by('betavoltaic', 'strip_bath');
  assert.ok(inputs(strip).includes('gtceu:depleted_nickel_plating_liquor') && outputs(cell).includes('gtceu:depleted_nickel_plating_liquor'));
  assert.ok(outputs(strip).includes('gtceu:nitric_acid') && inputs(liquor).includes('gtceu:nitric_acid'));
  assert.ok(outputs(strip).includes('gtceu:nickel_dust'));
  assert.ok(ids(HOT.recipes.find((r) => r.name === 'nickel_62_enrichment').itemsIn).includes('gtceu:nickel_dust'));
  // the fab refuses to void
  const startup = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', 'uhv', 'betavoltaics.js'), 'utf8');
  assert.ok(startup.includes("BV.fabNoVoiding = 'grindless.machine.betavoltaic_fab.no_voiding'"));
});

test('line 22: CO -> C-12 monoxide (Saturn orbit) -> methanation -> C-12 methane -> the C-12 spreader; the isotope column\'s rows untouched', () => {
  const c12 = by('cryogenic_isotope_separation', 'carbon_12');
  assert.equal(c12.dimension, 'grindless:saturn_orbit');
  assert.deepEqual(inputs(c12), ['gtceu:carbon_monoxide']);
  assert.ok(outputs(c12).includes('gtceu:carbon_12_monoxide'));
  // the 13C-enriched tails go back as carbon monoxide; the CO balance holds
  assert.ok(outputs(c12).includes('gtceu:carbon_monoxide'));
  assert.equal(c12.fluidsOut.reduce((s, f) => s + f.amount, 0), c12.fluidsIn[0].amount);
  const meth = by('chemical_reactor', 'carbon_12_methanation');
  assert.ok(inputs(meth).includes('gtceu:carbon_12_monoxide') && outputs(meth).includes('gtceu:carbon_12_methane') && outputs(meth).includes('minecraft:water'));
  const spreader = by('diamond_cvd', 'c12_diamond_spreader');
  assert.ok(inputs(spreader).includes('gtceu:carbon_12_methane'));
  assert.deepEqual(producers('grindless:c12_diamond_spreader').map(([, r]) => r.name), ['c12_diamond_spreader']);
  // ZPM's own isotope column rows (helium-3, deuterium) and diamond lattice fab rows keep their circuits and fluids; UEV-A7 adds boron-11 trifluoride
  const col = SS.recipes.filter((r) => r.type === 'cryogenic_isotope_separation');
  assert.deepEqual(col.map((r) => [r.name, r.circuit, ids(r.fluidsIn)]), [['helium_three', 1, ['gtceu:saturn_helium']], ['deuterium', 2, ['gtceu:hydrogen']],
    ['boron_11_trifluoride', 20, ['gtceu:boron_trifluoride']]]);
  // UEV-A3 adds the nanodiamond row at circuit 7
  assert.deepEqual(Q.recipes.filter((r) => r.type === 'diamond_cvd').map((r) => r.circuit), [1, 2, 3, 4, 7]);
});

test('no UEV input, and every lang key the package needs is written in en_us and es_es', () => {
  for (const r of Object.values(T.types).flatMap((t) => t.recipes)) {
    for (const id of inputs(r).concat(outputs(r))) assert.ok(!/(^|[:_])uev(_|$)/.test(id.split(':')[1] || ''), `${r.name}: ${id}`);
  }
  const lang = fs.readFileSync(path.join(kube, 'client_scripts', 'grindless', 'uhv_betavoltaics_lang.js'), 'utf8');
  for (const [type, t] of Object.entries(T.types)) {
    if (!t.dataKey) continue;
    for (const r of t.recipes) assert.ok(lang.includes(`'gtceu.recipe.${t.dataKey}.${r.name}'`), `${type}/${r.name}`);
  }
  const keys = ['block.gtceu.ultrapure_water_plant', 'block.gtceu.betavoltaic_fab', 'gtceu.ultrapure_water', 'gtceu.betavoltaic',
    'grindless.machine.betavoltaic_fab.no_voiding', 'item.grindless.diamond_diode', 'tooltip.grindless.diamond_diode.0', 'tooltip.grindless.diamond_diode.1',
    'material.gtceu.carbon_12_monoxide', 'material.gtceu.carbon_12_methane', 'material.gtceu.nickel_63_plating_liquor', 'material.gtceu.depleted_nickel_plating_liquor'];
  for (const m of ['ultrapure_water_plant', 'betavoltaic_fab']) for (let i = 0; i <= 2; i++) keys.push(`grindless.machine.${m}.tooltip.${i}`);
  for (const k of keys) assert.ok(lang.includes(`'${k}'`), k);
});
