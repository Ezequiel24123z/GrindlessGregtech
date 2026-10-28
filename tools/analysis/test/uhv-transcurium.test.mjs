// UHV-A1 (docs/eras/uhv.md, "A1. Transcurium"): the high flux reactor's, the transuranium facility's, line 25's and the older rows'
// tables, checked without Minecraft by static recipe lookup. T1 is proof reuse (UV-A1's table-driven machines): no native test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const table = (name) => JSON.parse(fs.readFileSync(path.join(tables, name), 'utf8'));
const T = table('transcurium.json');
const FAB = table('transcurium_fabrication.json');
const PYRO = table('transcurium_pyroprocessing.json');
const TH = table('thorium.json');
const HOT = table('hot_cell.json');
const IRR = T.types.high_flux_irradiation.recipes;
const PROC = T.types.transuranium_processing.recipes;
const CHEM = T.types.chemical_reactor.recipes;

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn), ids(r.charge));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const by = (rs, name) => {
  const r = rs.find((x) => x.name === name);
  assert.ok(r, name);
  return r;
};

// every recipe-producing row of every table, as [table/type/name, recipe]
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
const producers = (id) => allRows().filter(([, r]) => outputs(r).includes(id)).map(([w, r]) => [w, r]);

test('every recipe has a unique name, a positive EU/t and duration; circuits are unique inside a type', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
      assert.ok(r.circuit >= 1 && r.circuit <= 32, `${type}/${r.name}: one recipe per lookup path needs a circuit`);
    }
  }
});

test('one recipe per lookup path: no recipe\'s ingredients are a subset of another\'s in its type', () => {
  const keys = (r) => new Set(inputs(r).concat([`circuit:${r.circuit}`]));
  for (const [type, t] of Object.entries(T.types)) {
    const ks = t.recipes.map(keys);
    for (let i = 0; i < ks.length; i++) {
      for (let j = i + 1; j < ks.length; j++) {
        const sub = (a, b) => [...a].every((k) => b.has(k));
        assert.ok(!sub(ks[i], ks[j]) && !sub(ks[j], ks[i]), `${type}: ${t.recipes[i].name} / ${t.recipes[j].name}`);
      }
    }
  }
});

test('the recipes fit the machines\' slots (startup maxIO; the circuit takes an item slot)', () => {
  const io = {
    high_flux_irradiation: { itemsIn: 3, itemsOut: 3, fluidsIn: 1, fluidsOut: 0 },
    transuranium_processing: { itemsIn: 4, itemsOut: 3, fluidsIn: 2, fluidsOut: 3 }
  };
  const startup = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', 'uhv', 'transcurium.js'), 'utf8');
  for (const [type, m] of Object.entries(io)) {
    assert.ok(startup.includes(`maxIO: { itemsIn: ${m.itemsIn}, itemsOut: ${m.itemsOut}, fluidsIn: ${m.fluidsIn}, fluidsOut: ${m.fluidsOut} }`), type);
    for (const r of T.types[type].recipes) {
      assert.ok(r.itemsIn.length + r.kept.length + 1 <= m.itemsIn, `${r.name} items in`);
      assert.ok(r.fluidsIn.length + r.charge.length <= m.fluidsIn, `${r.name} fluids in`);
      assert.ok(r.itemsOut.length <= m.itemsOut, `${r.name} items out`);
      assert.ok(r.fluidsOut.length <= m.fluidsOut, `${r.name} fluids out`);
    }
  }
});

test('berkelium-249 and californium-252 come only from the transuranium facility; thorium-229 only from its decay store', () => {
  for (const id of ['grindless:berkelium_249', 'grindless:californium_252']) {
    const p = producers(id);
    assert.deepEqual(p.map(([, r]) => r.name), ['separate'], id);
    assert.ok(p[0][0].includes('transuranium_processing'), id);
  }
  const th = producers('grindless:thorium_229');
  assert.deepEqual(th.map(([, r]) => r.name), ['decay_store']);
  const store = by(PROC, 'decay_store');
  assert.deepEqual(store.itemsIn, [{ id: 'gtceu:uranium_233_ingot', count: 8 }]);
  assert.ok(store.itemsOut.some((x) => x.id === 'gtceu:uranium_233_ingot' && x.count === 8), 'the uranium-233 comes back whole');
  const startup = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', 'uhv', 'transcurium.js'), 'utf8');
  assert.ok(startup.includes("TC.decayStore = 'decay_store'") && startup.includes('ModifierFunction.IDENTITY'), 'the decay store is never overclocked');
});

test('the uranium-233 driver loop closes: fuel plant c7 -> driver -> reactor -> spent -> pyroprocessing c5 -> uranium-233', () => {
  const fab = FAB.fabrication.find((s) => s.name === 'hfir_driver_element');
  assert.equal(fab.circuit, 7);
  assert.ok(ids(fab.itemsIn).includes('gtceu:uranium_233_ingot') && ids(fab.itemsOut).includes('grindless:hfir_driver_element'));
  const fabCircuits = table('uranium_cycle.json').fabrication.concat(table('thorium_fabrication.json').fabrication, FAB.fabrication).map((s) => s.circuit);
  assert.equal(new Set(fabCircuits).size, fabCircuits.length, 'fuel plant circuits');
  for (const name of ['transcurium_target', 'nickel_target']) {
    const r = by(IRR, name);
    const used = r.itemsIn.find((x) => x.id === 'grindless:hfir_driver_element').count;
    assert.equal(r.itemsOut.find((x) => x.id === 'grindless:spent_hfir_driver_element').count, used, name);
  }
  const pyro = PYRO.types.pyroprocessing.recipes.find((r) => r.name === 'hfir_driver');
  assert.equal(pyro.circuit, 5);
  assert.ok(!TH.types.pyroprocessing.recipes.some((r) => r.circuit === 5 || r.name === 'hfir_driver'), 'pyroprocessing circuit 5 is free');
  assert.ok(ids(pyro.itemsIn).includes('grindless:spent_hfir_driver_element') && ids(pyro.itemsOut).includes('gtceu:uranium_233_ingot'));
  // the spent drivers are made only by the reactor and used only by the cell
  // UEV-A1's Pu-242 target (tables/isotopes_facility.json) is driven in the same reactor
  assert.deepEqual(producers('grindless:spent_hfir_driver_element').map(([, r]) => r.name).sort(), ['nickel_target', 'plutonium_target', 'transcurium_target']);
  for (const src of ['uv/thorium.js', 'iv/uranium_cycle.js']) {
    const s = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', ...src.split('/')), 'utf8');
    assert.ok(s.includes(src.startsWith('uv') ? 'transcurium_pyroprocessing.json' : 'transcurium_fabrication.json'), src);
  }
});

test('the destinations: spent HDEHP -> phosphoric acid; curium -> the next target; fission products -> synroc', () => {
  assert.ok(outputs(by(PROC, 'incinerate')).includes('gtceu:phosphoric_acid'));
  assert.ok(inputs(by(PROC, 'incinerate')).includes('gtceu:spent_hdehp_solvent'));
  assert.ok(outputs(by(PROC, 'separate')).includes('gtceu:spent_hdehp_solvent'));
  assert.ok(outputs(by(PROC, 'separate')).includes('grindless:heavy_curium_oxide'));
  assert.ok(inputs(by(PROC, 'target')).includes('grindless:heavy_curium_oxide'));
  assert.ok(outputs(by(PROC, 'target')).includes('grindless:transcurium_target'));
  assert.ok(outputs(by(PROC, 'dissolve')).includes('gtceu:fission_product_liquor'));
  assert.ok(inputs(by(PROC, 'evaporate')).includes('gtceu:fission_product_liquor'));
  assert.ok(outputs(by(PROC, 'evaporate')).includes('gtnn:radioactive_waste'));
  // ZPM's waste retrieval plant (server_scripts/grindless/zpm/actinides.js, circuit 1) turns that waste into synroc
  const ac = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'zpm', 'actinides.js'), 'utf8');
  assert.ok(ac.includes("var WASTE = 'gtnn:radioactive_waste'") && ac.includes("var SYNROC = 'grindless:synroc_block'"));
  const retrieve = ac.slice(ac.indexOf("name: 'retrieve', circuit: 1,"), ac.indexOf('eut:', ac.indexOf("name: 'retrieve'")));
  assert.ok(/itemsIn: \[\{ id: WASTE/.test(retrieve) && /itemsOut: \[[^\]]*SYNROC/.test(retrieve), 'radioactive waste -> synroc');
  // the separation gives the solvent back less 1 %
  const sep = by(PROC, 'separate');
  const solventIn = sep.fluidsIn.find((f) => f.id === 'gtceu:hdehp_solvent').amount;
  const solventOut = sep.fluidsOut.find((f) => f.id === 'gtceu:hdehp_solvent').amount;
  assert.equal(solventOut + sep.fluidsOut.find((f) => f.id === 'gtceu:spent_hdehp_solvent').amount, solventIn);
});

test('line 25 makes the HDEHP solvent from GTM butyraldehyde, phosphorus, chlorine and kerosene', () => {
  const made = new Set();
  for (const r of CHEM) for (const id of outputs(r)) made.add(id);
  for (const id of ['gtceu:ethylhexenal', 'gtceu:ethylhexanol', 'gtceu:phosphoryl_chloride', 'gtceu:hdehp_extractant', 'gtceu:hdehp_solvent']) assert.ok(made.has(id), id);
  assert.ok(inputs(by(CHEM, 'ethylhexenal')).includes('gtceu:butyraldehyde'));
  assert.ok(inputs(by(CHEM, 'hdehp_solvent')).includes('gtceu:kerosene'));
  assert.ok(inputs(by(PROC, 'separate')).includes('gtceu:hdehp_solvent'));
});

test('the hot cell\'s mode 7 makes the nickel-62 targets for the reactor; modes stay unique', () => {
  const circuits = HOT.modes.map((m) => m.circuit);
  assert.equal(new Set(circuits).size, circuits.length);
  assert.ok(HOT.modes.some((m) => m.circuit === 7 && m.name === 'nickel_62'));
  const ni = HOT.recipes.find((r) => r.name === 'nickel_62_enrichment');
  assert.equal(ni.circuit, 7);
  assert.ok(outputs(ni).includes('grindless:nickel_62_target'));
  assert.ok(inputs(by(IRR, 'nickel_target')).includes('grindless:nickel_62_target'));
});

test('no UEV input, and every lang key the recipes need is written in en_us and es_es', () => {
  const rows = Object.values(T.types).flatMap((t) => t.recipes).concat(FAB.fabrication, PYRO.types.pyroprocessing.recipes);
  for (const r of rows) for (const id of inputs(r).concat(outputs(r))) assert.ok(!/(^|[:_])uev(_|$)/.test(id.split(':')[1] || ''), `${r.name}: ${id}`);
  // UIV-B2's rows (es254_extraction) carry their EMI line in uiv_rx_j1856_lang.js
  const lang = fs.readFileSync(path.join(kube, 'client_scripts', 'grindless', 'uhv_transcurium_lang.js'), 'utf8')
    + fs.readFileSync(path.join(kube, 'client_scripts', 'grindless', 'uiv_rx_j1856_lang.js'), 'utf8');
  for (const [type, t] of Object.entries(T.types)) {
    if (!t.dataKey) continue;
    for (const r of t.recipes) assert.ok(lang.includes(`'gtceu.recipe.${t.dataKey}.${r.name}'`), `${type}/${r.name}`);
  }
  for (const k of ['gtceu.recipe.grindless_pyroprocessing.hfir_driver', 'gtceu.recipe.grindless_hot_cell.nickel_62_enrichment']) assert.ok(lang.includes(`'${k}'`), k);
});
