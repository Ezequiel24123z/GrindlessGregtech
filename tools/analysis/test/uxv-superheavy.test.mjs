// UXV-A1 (docs/eras/uxv.md, "A1. Superheavies III"): the isotope, cyclotron, separator, chem lab, plating, actinide and sintering rows,
// checked without Minecraft. T1 is proof reuse (table-driven rows of unchanged mechanisms): no native test.
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
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const rows = (file, type) => table(file).types[type].recipes;
const by = (rs, name) => {
  const r = rs.find((x) => x.name === name);
  assert.ok(r, name);
  return r;
};

const CAL = rows('isotopes.json', 'calutron_separation');
const IRR = rows('superheavy.json', 'heavy_ion_irradiation');
const REC = rows('superheavy.json', 'recoil_separation');
const CHEM = rows('superheavy.json', 'superheavy_chemistry');
const TRANS = rows('transcurium.json', 'transuranium_processing');
const FAC = rows('isotopes_facility.json', 'transuranium_processing');

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
const scripts = () => jsFiles(path.join(kube, 'server_scripts')).map((f) => [path.relative(kube, f), fs.readFileSync(f, 'utf8')]);
const ACT = text('server_scripts', 'grindless', 'zpm', 'actinides.js');
const SINT = text('server_scripts', 'grindless', 'uxv', 'superheavy.js');

test('calutron: fermium-257 (c10) and tungsten-184 (c13) leave the rest in stock', () => {
  for (const [name, circuit, input, iso] of [['fermium_257', 10, 'gtceu:fermium_dust', 'gtceu:fermium_257_dust'], ['tungsten_184', 13, 'gtceu:tungsten_dust', 'gtceu:tungsten_184_dust']]) {
    const r = by(CAL, name);
    assert.equal(r.circuit, circuit);
    assert.equal(r.eut, 1966080);
    assert.deepEqual(r.itemsIn, [{ id: input, count: 4 }]);
    assert.deepEqual(r.itemsOut, [{ id: iso, count: 1 }, { id: input, count: 3 }]);
    assert.match(r._, /UXV-A1/);
  }
  const used = CAL.map((r) => r.circuit);
  assert.equal(new Set(used).size, used.length);
});

test('cyclotron: elements 121 (c9) and 122 (c10) keep the cavity and helium, spend the target', () => {
  for (const [name, circuit, target, gas] of [['element_121', 9, 'grindless:es254_target', 'gtceu:element_121_recoil_gas'], ['element_122', 10, 'grindless:fm257_target', 'gtceu:element_122_recoil_gas']]) {
    const r = by(IRR, name);
    assert.equal(r.circuit, circuit);
    assert.deepEqual(ids(r.itemsIn), [target, 'grindless:ti50_oven_charge']);
    assert.deepEqual(ids(r.kept), ['grindless:nb3sn_srf_cavity']);
    assert.deepEqual(ids(r.charge), ['gtceu:helium']);
    assert.deepEqual(r.itemsOut, [{ id: 'grindless:spent_actinide_target', count: 1 }]);
    assert.deepEqual(r.fluidsOut, [{ id: gas, amount: 1000 }]);
  }
  const used = IRR.map((r) => r.circuit);
  assert.equal(new Set(used).size, used.length);
});

test('recoil separator and chem lab: atoms, captures and census III', () => {
  for (const [n, c, gas, atoms] of [['element_121_atoms', 8, 'gtceu:element_121_recoil_gas', 'grindless:element_121_atoms'], ['element_122_atoms', 9, 'gtceu:element_122_recoil_gas', 'grindless:element_122_atoms']]) {
    const r = by(REC, n);
    assert.equal(r.circuit, c);
    assert.deepEqual(ids(r.itemsIn), ['grindless:etched_membrane']);
    assert.deepEqual(ids(r.fluidsIn), [gas]);
    assert.deepEqual(ids(r.itemsOut), [atoms]);
    assert.deepEqual(r.fluidsOut, [{ id: 'gtceu:helium', amount: 1000 }]);
  }
  for (const [n, c, atoms, out] of [['element_121_catch', 8, 'grindless:element_121_atoms', 'grindless:element_121_recoil'], ['element_122_catch', 9, 'grindless:element_122_atoms', 'grindless:element_122_recoil']]) {
    const r = by(CHEM, n);
    assert.equal(r.circuit, c);
    assert.deepEqual(ids(r.itemsIn), [atoms, 'grindless:sealed_capsule']);
    assert.deepEqual(ids(r.itemsOut), [out]);
  }
  const census = by(CHEM, 'census_iii');
  assert.equal(census.circuit, 10);
  assert.deepEqual(ids(census.itemsIn), ['grindless:element_121_recoil', 'grindless:element_122_recoil', 'grindless:sealed_capsule']);
  assert.deepEqual(ids(census.itemsOut), ['grindless:superheavy_census_iii']);
  for (const t of [REC, CHEM]) {
    const used = t.map((r) => r.circuit);
    assert.equal(new Set(used).size, used.length);
  }
});

test('plating: circuits 10 and 11, free of the facility rows 7-8 and es254_extraction 9; the bath is mostly recovered', () => {
  const taken = new Set([...TRANS, ...FAC].filter((r) => !/^(fm257|cm248)_plating$/.test(r.name)).map((r) => r.circuit));
  for (const [n, c, dust, out] of [['fm257_plating', 10, 'gtceu:fermium_257_dust', 'grindless:fm257_plated_blank'], ['cm248_plating', 11, 'gtceu:curium_248_dust', 'grindless:cm248_plated_blank']]) {
    const r = by(TRANS, n);
    assert.equal(r.circuit, c);
    assert.ok(!taken.has(c));
    assert.deepEqual(ids(r.itemsIn), [dust, 'gtceu:titanium_plate']);
    assert.deepEqual(r.itemsOut, [{ id: out, count: 1 }]);
    assert.deepEqual(r.fluidsIn, [{ id: 'gtceu:nitric_acid', amount: 250 }]);
    assert.deepEqual(r.fluidsOut, [{ id: 'gtceu:nitric_acid', amount: 200 }]);
  }
});

test('actinides: the spent target is retrieved (c6) and the MNT gas is partitioned (c7)', () => {
  assert.match(ACT, /UXV-A1/);
  assert.match(ACT, /name: 'spent_target_retrieve', circuit: 6/);
  assert.match(ACT, /id: 'grindless:spent_actinide_target', count: 1/);
  assert.match(ACT, /name: 'mnt_fragments', circuit: 7/);
  assert.match(ACT, /id: 'gtceu:mnt_product_gas', amount: 1000/);
  assert.match(ACT, /id: 'gtceu:mercury', amount: 500/);
  const circuits = (arr) => [...ACT.slice(ACT.indexOf(`var ${arr} = [`), ACT.indexOf(']\n\n', ACT.indexOf(`var ${arr} = [`))).matchAll(/circuit: (\d+)/g)].map((m) => m[1]);
  for (const arr of ['RETRIEVAL', 'PARTITION']) {
    const c = circuits(arr);
    assert.equal(new Set(c).size, c.length, arr);
  }
});

test('sintering: two targets, circuits 8 and 9 of the sinterer, argon', () => {
  assert.match(SINT, /name: 'fm257_target', circuit: 8, input: 'grindless:fm257_plated_blank', output: 'grindless:fm257_target'/);
  assert.match(SINT, /name: 'cm248_target', circuit: 9, input: 'grindless:cm248_plated_blank', output: 'grindless:cm248_target'/);
  assert.match(SINT, /spark_plasma_sintering/);
  assert.doesNotMatch(SINT, /\/\/ priority:/);
  const prop = text('server_scripts', 'grindless', 'uhv', 'propulsion.js');
  const used = [...prop.matchAll(/circuit: (\d+)/g)].map((m) => Number(m[1]));
  assert.ok(!used.includes(8) && !used.includes(9));
});

test('only from: each A1 product has no other producer in the pack', () => {
  const tableOnly = {
    'gtceu:fermium_257_dust': 'isotopes.json',
    'gtceu:tungsten_184_dust': 'isotopes.json',
    'grindless:element_121_recoil': 'superheavy.json',
    'grindless:element_122_recoil': 'superheavy.json',
    'grindless:superheavy_census_iii': 'superheavy.json',
    'grindless:spent_actinide_target': 'superheavy.json',
    'grindless:fm257_plated_blank': 'transcurium.json',
    'grindless:cm248_plated_blank': 'transcurium.json',
    'grindless:element_121_atoms': 'superheavy.json',
    'grindless:element_122_atoms': 'superheavy.json'
  };
  for (const [id, file] of Object.entries(tableOnly)) {
    const from = tableProducers(id);
    assert.ok(from.length >= 1 && from.every((w) => w.startsWith(file)), `${id}: ${from}`);
  }
  for (const id of ['grindless:fm257_target', 'grindless:cm248_target']) {
    assert.equal(tableProducers(id).length, 0, id);
    const hits = scripts().filter(([, s]) => s.includes(`itemOutputs('1x ' + r.output)`) || s.includes(id)).map(([p]) => p);
    assert.deepEqual(hits.filter((p) => !p.includes('uxv')), [], id);
  }
});

test('lang parity: every key in en_us and es_es, every item and gas named, EMI info present', () => {
  const lang = text('client_scripts', 'grindless', 'uxv_superheavy_lang.js');
  assert.match(lang, /\['en_us', 'es_es'\]/);
  for (const n of ['element_121_atoms', 'element_122_atoms', 'fm257_plated_blank', 'cm248_plated_blank']) {
    assert.ok(lang.includes(`'${n}'`), n);
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), n);
    assert.ok(text('startup_scripts', 'grindless', 'uxv', 'superheavy.js').includes(n));
  }
  for (const n of ['element_121_recoil_gas', 'element_122_recoil_gas']) assert.ok(lang.includes(`'${n}'`), n);
  for (const key of ['fermium_257', 'tungsten_184', 'element_121', 'element_122', 'element_121_atoms', 'element_122_atoms', 'element_121_catch', 'element_122_catch', 'census_iii', 'fm257_plating', 'cm248_plating']) {
    assert.ok(lang.includes(`.${key}'`), key);
  }
  const entries = [...lang.matchAll(/^ {8}\['([a-z0-9_.]+)',\r?\n\s+'([^\r\n]+)',\r?\n\s+'([^\r\n]+)'\]/gm)];
  assert.ok(entries.length >= 12);
  const info = JSON.parse(text('assets', 'emi', 'recipe', 'additions', 'grindless', 'uxv_superheavy_stock.json'));
  assert.equal(info.type, 'emi:info');
  assert.ok(lang.includes(info.text[0]));
});

test('F1 rule for A1 is gone and the older pinned ids are untouched', () => {
  const obtain = fs.readFileSync(path.join(root, 'tools', 'analysis', 'tiers', 'obtain.json'), 'utf8');
  assert.ok(!obtain.includes('"era": "UXV (A1)"'));
  assert.ok(obtain.includes('"era": "UXV (A2)"'));
  assert.equal(by(IRR, 'es254_bombard').circuit, 8);
  assert.equal(by(TRANS, 'es254_extraction').circuit, 9);
});
