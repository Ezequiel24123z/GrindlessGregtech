// UIV-A1 (docs/eras/uiv.md, "A1. Isotopes and element 120"): the isotope, reductor, hot cell, superheavy, photonics and own rows, checked
// without Minecraft by static recipe lookup. T1 is proof reuse (table-driven rows of unchanged mechanisms): no native test.
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
const text = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn), ids(r.charge));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const rows = (file, type) => table(file).types[type].recipes;
const by = (rs, name) => {
  const r = rs.find((x) => x.name === name);
  assert.ok(r, name);
  return r;
};
const countOf = (xs, id) => xs.find((x) => x.id === id)?.count;

const CAL = rows('isotopes.json', 'calutron_separation');
const PYRO = rows('transcurium_pyroprocessing.json', 'pyroprocessing');
const HFIR = table('hot_cell.json').recipes;
const IRR = rows('superheavy.json', 'heavy_ion_irradiation');
const REC = rows('superheavy.json', 'recoil_separation');
const MBE = rows('photonics.json', 'molecular_beam_epitaxy');
const OWN = table('isotopes_uiv.json').types;

function allTableRows() {
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
const tableProducers = (id) => allTableRows().filter(([, r]) => outputs(r).includes(id)).map(([w]) => w);

function jsFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...jsFiles(p));
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}
const scriptsMentioning = (id) =>
  jsFiles(path.join(kube, 'server_scripts')).filter((f) => !f.includes(`${path.sep}uiv${path.sep}`) && text(path.relative(kube, f)).includes(id));

test('the three calutron rows: circuits 7-9, one input item, the isotope plus the depleted rest to stock', () => {
  const want = [['titanium_50', 7, 'gtceu:titanium_tetrachloride_ice_dust', 'gtceu:titanium_50_chloride_dust'],
    ['europium_151', 8, 'gtceu:europium_oxide_dust', 'gtceu:europium_151_dust'],
    ['nickel_58', 9, 'gtceu:nickel_chloride_dust', 'gtceu:nickel_58_chloride_dust']];
  for (const [name, circuit, input, iso] of want) {
    const r = by(CAL, name);
    assert.equal(r.circuit, circuit);
    assert.equal(r.eut, 1966080);
    assert.deepEqual(ids(r.itemsIn), [input]);
    assert.ok(ids(r.itemsOut).includes(iso));
    assert.ok(ids(r.itemsOut).includes(input), `${name}: the depleted rest goes to stock`);
    const consumed = r.itemsIn[0].count;
    const returned = r.itemsOut.reduce((s, x) => s + x.count, 0);
    assert.equal(consumed, returned, `${name}: mass in = mass out`);
    assert.ok(!r.fluidsIn.length && !r.fluidsOut.length);
  }
  assert.equal(new Set(CAL.map((r) => r.circuit)).size, CAL.length);
});

test('calutron is the only route for Ti-50 chloride, Eu-151 and Ni-58 chloride', () => {
  for (const id of ['gtceu:titanium_50_chloride_dust', 'gtceu:europium_151_dust', 'gtceu:nickel_58_chloride_dust']) {
    const p = tableProducers(id);
    assert.equal(p.length, 1, `${id}: ${p}`);
    assert.ok(p[0].startsWith('isotopes.json:.types.calutron_separation'), p[0]);
    assert.deepEqual(scriptsMentioning(id), [], id);
  }
});

test('pyroprocessing rows: circuits 6-8, at most 3 inputs with the circuit, Ti-50 sponge, Ni-58 metal and Li-6 metal', () => {
  const ti = by(PYRO, 'titanium_50_sponge');
  const ni = by(PYRO, 'nickel_58_metal');
  const li = by(PYRO, 'lithium_6_metal');
  assert.deepEqual([ti.circuit, ni.circuit, li.circuit], [6, 7, 8]);
  assert.deepEqual(ids(ti.itemsOut), ['gtceu:titanium_50_sponge_dust', 'gtceu:magnesium_chloride_dust']);
  assert.deepEqual(ids(ni.itemsOut), ['gtceu:nickel_58_dust']);
  assert.deepEqual(ids(li.itemsOut), ['gtceu:lithium_6_metal_dust']);
  assert.ok(inputs(li).includes('gtceu:lithium_6_dust') && li.kept.length === 1);
  assert.equal(new Set(PYRO.map((r) => r.circuit)).size, PYRO.length);
  for (const r of [ti, ni, li]) assert.ok(r.itemsIn.length + r.kept.length + 1 <= 3, r.name);
  for (const id of ['gtceu:titanium_50_sponge_dust', 'gtceu:nickel_58_dust', 'gtceu:lithium_6_metal_dust']) {
    assert.equal(tableProducers(id).length, 1, id);
    assert.deepEqual(scriptsMentioning(id), [], id);
  }
});

test('europium reductor: Tb metal (c6) and Gd, Er, Pr oxides cut from the depleted liquor (c7-9): more in than back, no metal rows', () => {
  const src = text('server_scripts', 'grindless', 'zpm', 'europium.js');
  const block = (name, circuit) => {
    const at = src.indexOf("name: '" + name + "', circuit: " + circuit + ',');
    assert.ok(at > 0, name);
    return src.slice(at, src.indexOf('eut: ZPM_VA', at));
  };
  const tb = block('terbium_reduction', 6);
  assert.ok(tb.includes("'grindless:terbium_oxide_dust', count: 1") && tb.includes('id: LANTHANUM, count: 2') && tb.includes("'gtceu:terbium_dust', count: 2"));
  for (const [name, circuit, oxide] of [['gadolinium_oxide', 7, 'gtceu:gadolinium_oxide_dust'], ['erbium_oxide', 8, 'gtceu:erbium_oxide_dust'], ['praseodymium_oxide', 9, 'gtceu:praseodymium_oxide_dust']]) {
    const b = block(name, circuit);
    assert.ok(b.includes("'" + oxide + "', count: 5"), name);
    assert.ok(b.includes('{ id: DEPLETED, amount: 4000 }') && b.includes('{ id: DEPLETED, amount: 3000 }'), name + ': the rest of the liquor returns');
    assert.equal(src.split("'" + oxide + "'").length - 1, 1, oxide + ' produced once');
  }
  assert.ok(block('praseodymium_oxide', 9).includes("'gtceu:oxygen', amount: 2000"), 'Pr(IV) is oxidative');
  assert.ok(!/gtceu:(gadolinium|erbium|praseodymium)_dust/.test(src));
});

test('hot cell: the Cf-249 target wheel (circuit 12) and the activated wheel still returns through the hot cell; Si-28 stays IV\'s', () => {
  const r = by(HFIR, 'cf249_target_wheel');
  assert.equal(r.circuit, 12);
  assert.deepEqual(ids(r.itemsIn).sort(), ['gtceu:californium_249_dust', 'grindless:target_wheel_blank'].sort());
  assert.deepEqual(ids(r.itemsOut), ['grindless:cf249_target_wheel']);
  assert.equal(HFIR.filter((x) => x.circuit === 12).length, 1);
  assert.deepEqual(ids(by(HFIR, 'target_wheel_return').itemsIn), ['grindless:activated_target_wheel']);
  assert.deepEqual(tableProducers('grindless:target_wheel_blank').filter((w) => w.startsWith('hot_cell.json')).length, 1);
  assert.ok(HFIR.some((x) => x.name === 'silicon_28_enrichment' && x.circuit === 5 || x.name === 'silicon_28_enrichment'));
  assert.ok(!HFIR.some((x) => x.name !== 'silicon_28_enrichment' && ids(x.itemsOut).includes('grindless:silicon_28_dust')));
  assert.equal(tableProducers('grindless:cf249_target_wheel').length, 1);
});

test('element 120 comes only from the cyclotron and the separator; nothing outputs Pu-244', () => {
  const c = by(IRR, 'element_120');
  assert.equal(c.circuit, 7);
  assert.deepEqual(ids(c.itemsIn), ['grindless:cf249_target_wheel', 'grindless:ti50_oven_charge']);
  assert.deepEqual(ids(c.kept), ['grindless:nb3sn_srf_cavity']);
  assert.deepEqual(ids(c.itemsOut), ['grindless:activated_target_wheel']);
  assert.deepEqual(ids(c.fluidsOut), ['gtceu:element_120_recoil_gas']);
  assert.ok(c.itemsIn.length + c.kept.length + 1 <= 4);
  const s = by(REC, 'element_120');
  assert.equal(s.circuit, 6);
  assert.deepEqual(ids(s.itemsIn), ['grindless:etched_membrane']);
  assert.deepEqual(ids(s.fluidsIn), ['gtceu:element_120_recoil_gas']);
  assert.deepEqual(ids(s.itemsOut), ['grindless:element_120_recoil']);
  assert.equal(new Set(IRR.map((r) => r.circuit)).size, IRR.length);
  assert.equal(new Set(REC.map((r) => r.circuit)).size, REC.length);
  for (const id of ['grindless:element_120_recoil', 'gtceu:element_120_recoil_gas']) {
    assert.equal(tableProducers(id).length, 1, id);
    assert.deepEqual(scriptsMentioning(id), [], id);
  }
  assert.deepEqual(allTableRows().filter(([, r]) => outputs(r).some((i) => /plutonium_244/.test(i) && !/target/.test(i) && i.endsWith('_dust')) && inputs(r).includes('grindless:element_120_recoil')), []);
});

test('MBE row: circuit 4, the multilayer grown on glass; the cage line from NiCl2 to the cage part', () => {
  const m = by(MBE, 'ni58_ti_multilayer');
  assert.equal(m.circuit, 4);
  assert.equal(new Set(MBE.map((r) => r.circuit)).size, MBE.length);
  assert.ok(inputs(m).includes('gtceu:nickel_58_dust'));
  assert.deepEqual(ids(m.itemsOut), ['grindless:ni58_ti_multilayer']);
  const A = OWN.assembler.recipes;
  assert.deepEqual(A.map((r) => r.circuit), [29, 30, 31, 32]);
  assert.deepEqual(ids(by(A, 'neutron_supermirror').itemsIn),   ['grindless:ni58_ti_multilayer',   'gtceu:aluminium_plate']);
      assert.deepEqual(ids(by(A, 'neutron_guide').itemsIn), ['grindless:neutron_supermirror', 'gtceu:aluminium_frame']);
      assert.deepEqual(ids(by(A, 'cage_part').itemsIn), ['grindless:neutron_guide', 'gtceu:stainless_steel_plate']);
      assert.deepEqual(ids(by(A, 'ti50_oven_charge').itemsIn), ['gtceu:titanium_50_dust', 'gtceu:titanium_foil']);
  assert.deepEqual(ids(by(A, 'ti50_oven_charge').itemsOut), ['grindless:ti50_oven_charge']);
  assert.equal(by(OWN.chemical_reactor.recipes, 'nickel_chloride').circuit, 30);
  assert.equal(OWN.vacuum_freezer.recipes[0].circuit, 0);
  assert.deepEqual(ids(OWN.vacuum_freezer.recipes[0].itemsOut), ['gtceu:titanium_tetrachloride_ice_dust']);
  for (const id of ['grindless:cage_part', 'grindless:neutron_guide', 'grindless:neutron_supermirror', 'grindless:ni58_ti_multilayer', 'grindless:ti50_oven_charge']) {
    assert.equal(tableProducers(id).length, 1, id);
    assert.deepEqual(scriptsMentioning(id), [], id);
  }
});

test('no UIV circuit hides a UIV row behind the UEV hatch name; no row names the UIV parallel hatch', () => {
  for (const f of ['startup_scripts/grindless/uiv/isotopes.js', 'server_scripts/grindless/uiv/isotopes.js', 'data/grindless/tables/isotopes_uiv.json']) {
    assert.ok(!text(...f.split('/')).includes('uiv_parallel_hatch'), f);
  }
});

test('lang: every new item, material and recipe line is in en_us and es_es, and every item has two tooltips', () => {
  const src = text('client_scripts', 'grindless', 'uiv_isotopes_lang.js');
  const items = [...src.matchAll(/\['item', '([a-z0-9_]+)',\r?\n\s+\[([^\]]*)\],\r?\n\s+\[([^\]]*)\]\]/g)];
  assert.equal(items.length, 4);
  for (const [, n, en, es] of items) {
    assert.equal(en.split("', '").length, 3, n);
    assert.equal(es.split("', '").length, 3, n);
  }
  const reg = text('startup_scripts', 'grindless', 'uiv', 'isotopes.js');
  for (const n of ['cf249_target_wheel', 'ni58_ti_multilayer', 'neutron_supermirror', 'neutron_guide']) assert.ok(reg.includes(n) && src.includes(`'${n}'`), n);
  for (const n of ['titanium_tetrachloride_ice', 'titanium_50_chloride', 'titanium_50_sponge', 'nickel_chloride', 'nickel_58_chloride', 'lithium_6_metal', 'element_120_recoil_gas']) {
    assert.ok(reg.includes(`${n}:`) && src.includes(`['${n}',`), n);
  }
  const lines = [...src.matchAll(/\['(gtceu\.recipe\.[a-z0-9_.]+)',\r?\n\s+'[^\r\n]+',\r?\n\s+'[^\r\n]+'\]/g)];
  assert.equal(lines.length, 10);
});
