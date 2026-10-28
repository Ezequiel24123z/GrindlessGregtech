// UEV-A3 (docs/eras/uev.md, "A3. Megabar"): the megabar press's table, lines 7/8/9 and the two older rows, checked without
// Minecraft by static lookup. T1 is proof reuse (table-driven machines): no native test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const T = JSON.parse(fs.readFileSync(path.join(tables, 'megabar.json'), 'utf8'));
const PRESS = T.types.megabar_synthesis.recipes;

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.notConsumedItems), ids(r.fluidsIn));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const by = (name, type = 'megabar_synthesis') => {
  const r = T.types[type].recipes.find((x) => x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};

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
const producers = (id) => allRows().filter(([, r]) => outputs(r).includes(id)).map(([w]) => w);

function scripts(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...scripts(p));
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}

test('names unique, EU/t and duration positive, circuits unique per type', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
    }
  }
});

test('press recipes fit the 4 item / 2 output, 1 fluid slots', () => {
  for (const r of PRESS) {
    assert.ok(ids(r.itemsIn).length + ids(r.notConsumedItems).length <= 4, r.name);
    assert.ok(ids(r.itemsOut).length <= 2, r.name);
    assert.ok(ids(r.fluidsIn).length <= 1 && ids(r.fluidsOut).length <= 1, r.name);
  }
  assert.match(read('startup_scripts', 'grindless', 'uev', 'megabar.js'), /megabar_press/);
});

test('(La,Y)H10 and nanotwinned diamond come only from the press', () => {
  for (const id of ['gtceu:lay_superhydride_ingot', 'grindless:nanotwinned_diamond']) {
    const from = producers(id);
    assert.equal(from.length, 1, `${id}: ${from}`);
    assert.ok(from[0].startsWith('megabar.json:'), from[0]);
    assert.ok(from[0].includes('megabar_synthesis'), from[0]);
  }
  assert.ok(by('superhydride').itemsOut.some((o) => o.id === 'gtceu:lay_superhydride_ingot'));
  assert.ok(by('nanotwinned_diamond').itemsOut.some((o) => o.id === 'grindless:nanotwinned_diamond'));
});

test('the superhydride cable has a producer: wire from PIT, GTM covers it; F1 recipes untouched', () => {
  const mat = read('server_scripts', 'grindless', 'uv', 'materials.js');
  assert.match(mat, /row\('lay_wire', 'powder_in_tube'[\s\S]*?gtceu:lay_superhydride_dust[\s\S]*?gtceu:lay_superhydride_single_wire/);
  const f1 = read('server_scripts', 'grindless', 'uev', 'foundation.js');
  assert.match(f1, /lay_superhydride_single_cable/);
  const srv = read('server_scripts', 'grindless', 'uev', 'megabar.js');
  assert.match(srv, /lay_superhydride/);
  assert.match(srv, /wiremill/);
  assert.match(srv, /extruder/);
});

test('the anvil wears: a chanced input on circuit 1', () => {
  const r = by('superhydride');
  assert.equal(r.circuit, 1);
  const anvil = r.itemsIn.find((x) => x.id === 'grindless:nanotwinned_diamond_anvil');
  assert.ok(anvil && anvil.chance > 0 && anvil.chance < 10000);
  assert.ok(!by('nanotwinned_diamond').itemsIn.some((x) => x.id === 'grindless:nanotwinned_diamond_anvil'));
});

test('a compressor recipe consumes onion carbon', () => {
  assert.ok(inputs(by('nanodiamond_pellet', 'compressor')).includes('grindless:onion_carbon'));
  assert.ok(inputs(by('nanodiamond_pellet', 'compressor')).length >= 1);
});

test('the older rows exist', () => {
  const q = read('server_scripts', 'grindless', 'zpm', 'qubits.js');
  assert.match(q, /name: 'nanodiamond', type: 'diamond_cvd'/);
  assert.match(q, /grindless:nanodiamond_dust/);
  assert.ok(inputs(by('nanodiamond_cleaning', 'chemical_reactor')).includes('grindless:nanodiamond_dust'));
});

test('the quench is named fiction and en_us / es_es have the same keys', () => {
  const lang = read('client_scripts', 'grindless', 'uev_megabar_lang.js');
  assert.match(lang, /Fiction:/);
  assert.match(lang, /Ficción:/);
  const startup = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', 'uev', 'megabar.js'), 'utf8');
  for (const n of ['la_y_foil', 'nanotwinned_diamond_anvil', 'nanodiamond_pellet']) {
    assert.ok(new RegExp(`\\b${n}:`).test(startup), n);
    assert.ok(lang.includes(`'${n}'`), n);
  }
});
