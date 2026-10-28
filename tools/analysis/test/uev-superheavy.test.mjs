// UEV-A2 (docs/eras/uev.md, "A2. Superheavy"): the heavy ion cyclotron's, recoil separator's and superheavy chemistry lab's tables
// and the older rows, checked without Minecraft by static recipe lookup.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const read = (name) => JSON.parse(fs.readFileSync(path.join(tables, name), 'utf8'));
const S = read('superheavy.json');
const HOT = read('hot_cell.json');
const CYC = S.types.heavy_ion_irradiation.recipes;
const SEP = S.types.recoil_separation.recipes;
const LAB = S.types.superheavy_chemistry.recipes;

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn), ids(r.charge));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const by = (rs, name) => {
  const r = rs.find((x) => x.name === name);
  assert.ok(r, name);
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
    walk(read(f), '');
  }
  return out;
}
const producers = (id) => allRows().filter(([, r]) => outputs(r).includes(id));
const consumers = (id) => allRows().filter(([, r]) => inputs(r).includes(id));
const textOf = (dir) => {
  const files = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (p.endsWith('.js')) files.push(p);
    }
  };
  walk(dir);
  return files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
};

test('every recipe has a unique name, a positive EU/t and duration; circuits are unique inside a type', () => {
  for (const [type, t] of Object.entries(S.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, `${type}/${r.name}`);
    }
  }
});

test('tennessine_sample and superheavy_census come only from the superheavy chemistry lab', () => {
  for (const id of ['grindless:tennessine_sample', 'grindless:superheavy_census']) {
    const ps = producers(id);
    assert.equal(ps.length, 1, id);
    assert.ok(ps[0][0].startsWith('superheavy.json:.types.superheavy_chemistry.'), id);
  }
  const server = textOf(path.join(kube, 'server_scripts'));
  for (const id of ['tennessine_sample', 'superheavy_census']) {
    assert.ok(!new RegExp(`grindless:${id}['"\`]\\s*\\)?\\s*\\.?\\s*(?:output|itemOutputs)`).test(server), id);
  }
});

test('no recipe consumes tennessine', () => {
  for (const id of ['grindless:tennessine_sample', 'grindless:tennessine_atoms']) {
    const cs = consumers(id);
    assert.deepEqual(cs.filter(([w]) => !w.startsWith('superheavy.json:.types.superheavy_chemistry.')).map(([w]) => w), [], id);
  }
  assert.deepEqual(consumers('grindless:tennessine_sample').map(([w]) => w), []);
});

test('the cyclotron keeps its SRF cavity and its helium chamber', () => {
  for (const r of CYC) {
    assert.ok(ids(r.kept).includes('grindless:nb3sn_srf_cavity'), r.name);
    assert.ok(!ids(r.itemsIn).includes('grindless:nb3sn_srf_cavity'), r.name);
    if (r.name !== 'ion_track') assert.ok(ids(r.charge).includes('gtceu:helium'), r.name);
  }
});

test('the six temporary EMI no-use ids are consumed by this package', () => {
  for (const id of [
    'grindless:ca48_oven_charge',
    'grindless:plutonium_244_target',
    'gtceu:curium_nitrate',
    'gtceu:californium_nitrate',
    'gtceu:berkelium_nitrate',
    'grindless:nb3sn_srf_cavity',
  ]) {
    assert.ok(consumers(id).length > 0, id);
  }
});

test('the activated wheel returns to the hot cell and tritium has a destination', () => {
  const row = by(HOT.recipes ?? HOT, 'target_wheel_return');
  assert.ok(inputs(row).includes('grindless:activated_target_wheel'));
  assert.ok(outputs(row).includes('grindless:target_wheel_blank'));
  const t = by(HOT.recipes ?? HOT, 'tritium_store');
  assert.ok(inputs(t).includes('gtceu:tritium') && outputs(t).includes('gtceu:helium_3'));
  assert.ok(producers('grindless:activated_target_wheel').some(([w]) => w.startsWith('superheavy.json:.types.heavy_ion_irradiation.')));
});

test('the older hot cell rows chain Cf-252 -> Cm-248 and Bk-249 -> Cf-249 into the cyclotron', () => {
  const rows = HOT.recipes ?? HOT;
  const cm = by(rows, 'californium_252_store');
  assert.ok(outputs(cm).includes('gtceu:curium_248_dust'));
  const cf = by(rows, 'berkelium_249_store');
  assert.ok(outputs(cf).includes('gtceu:californium_249_dust'));
  assert.ok(CYC.some((r) => inputs(r).includes('gtceu:curium_248_dust')));
  assert.ok(CYC.some((r) => inputs(r).includes('gtceu:californium_249_dust')));
  // UIV-A1 appended separator c6 (element 120)
  assert.ok(SEP.length === 6 && LAB.length === 2);
});

test('the cryogenic plant has the xenon row', () => {
  const js = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'ev', 'cryogenic_plant.js'), 'utf8');
  assert.ok(js.includes('xenon_cut') && js.includes('gtceu:xenon'));
});

