// UEV-A4 (docs/eras/uev.md, "A4. Electron beam and superalloy"): the electron beam furnace's and the single-crystal foundry's table, lines
// 11, 12, 13, 33 and 38, checked without Minecraft by static recipe lookup. T1 is proof reuse (plain lib/patterns.js multiblocks and the
// table-driven generator of UHV-A2): no native test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const read = (p) => fs.readFileSync(p, 'utf8');
const T = JSON.parse(read(path.join(tables, 'electron_beam.json')));
const startup = read(path.join(kube, 'startup_scripts', 'grindless', 'uev', 'electron_beam.js'));
// UIV-A3 appended c7 nb_ta_button; its recipe key lives in the melter's lang file.
const lang = read(path.join(kube, 'client_scripts', 'grindless', 'uev_electron_beam_lang.js'))
    + read(path.join(kube, 'client_scripts', 'grindless', 'uiv_levitation_melter_lang.js'))
    + read(path.join(kube, 'client_scripts', 'grindless', 'uiv_matrioshka_lang.js')); // UIV-A10's tin_distill

const GTM = new Set(['mixer', 'assembler', 'compressor', 'bender', 'macerator', 'chemical_reactor', 'electric_blast_furnace']);
const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn), ids(r.charge));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const by = (type, name) => {
  const r = T.types[type].recipes.find((x) => x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};

// every recipe-producing row of every table, as [file:type/name, recipe]
function allRows() {
  const out = [];
  for (const f of fs.readdirSync(tables).filter((n) => n.endsWith('.json'))) {
    const walk = (node, where) => {
      if (Array.isArray(node)) node.forEach((x, i) => walk(x, `${where}[${i}]`));
      else if (node && typeof node === 'object') {
        if (Array.isArray(node.itemsOut) || Array.isArray(node.fluidsOut)) out.push([`${f}:${where}:${node.name}`, node]);
        for (const [k, v] of Object.entries(node)) if (k !== 'itemsOut' && k !== 'fluidsOut') walk(v, `${where}.${k}`);
      }
    };
    walk(JSON.parse(read(path.join(tables, f))), '');
  }
  return out;
};
const producers = (id) => allRows().filter(([, r]) => outputs(r).includes(id));
const typeOf = (where) => where.split(':')[1].split('.').filter(Boolean)[1];

// the server scripts, recursively
function serverScripts(dir = path.join(kube, 'server_scripts')) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? serverScripts(p) : p.endsWith('.js') ? [p] : [];
  });
}

test('every recipe has a unique name, a positive EU/t and duration; circuits are unique inside a type', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
      assert.ok(GTM.has(type) ? r.circuit >= 0 && r.circuit <= 32 : r.circuit >= 1 && r.circuit <= 32, `${type}/${r.name}: circuit`);
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

test('every recipe of the two types fits the slots registered in the startup script', () => {
  const io = (key) => {
    const m = startup.match(new RegExp(`maxIO: \\{ itemsIn: (\\d+), itemsOut: (\\d+), fluidsIn: (\\d+), fluidsOut: (\\d+) \\}`, 'g'));
    assert.equal(m.length, 2);
    const k = key === 'electron_beam_refining' ? 0 : 1;
    const [a, b, c, d] = m[k].match(/\d+/g).map(Number);
    return { a, b, c, d };
  };
  for (const type of ['electron_beam_refining', 'single_crystal_casting']) {
    const s = io(type);
    for (const r of T.types[type].recipes) {
      assert.ok(r.itemsIn.length + r.kept.length + 1 <= s.a, `${type}/${r.name}: item inputs`);
      assert.ok(r.itemsOut.length <= s.b, `${type}/${r.name}: item outputs`);
      assert.ok(r.fluidsIn.length + r.charge.length <= s.c, `${type}/${r.name}: fluid inputs`);
      assert.ok(r.fluidsOut.length <= s.d, `${type}/${r.name}: fluid outputs`);
    }
  }
  // the SRF works (uv/cold.js) holds 4 item inputs, 2 outputs, 2 fluid inputs
  for (const r of T.types.srf_cavity.recipes) {
    assert.ok(r.itemsIn.length + 1 <= 4 && r.itemsOut.length <= 2 && r.fluidsIn.length + r.charge.length <= 2, r.name);
  }
});

test('6N hafnium, tantalum and niobium come only from the electron beam furnace', () => {
  for (const id of ['six_n_hafnium', 'six_n_tantalum', 'six_n_niobium', 'six_n_rhenium']) {
    const ps = producers(`grindless:${id}`);
    assert.ok(ps.length >= 1, id);
    for (const [w] of ps) assert.equal(typeOf(w), 'electron_beam_refining', `${id}: ${w}`);
    for (const f of serverScripts()) {
      if (f.endsWith(path.join('uev', 'electron_beam.js'))) continue;
      // UEV-A5's HfTaCN billet (uhv/propulsion.js, SPS c4) consumes 6N hafnium; consumers are fine, producers are not
      if (id === 'six_n_hafnium' && f.endsWith(path.join('uhv', 'propulsion.js'))) continue;
      assert.ok(!read(f).includes(`grindless:${id}`), `${id} named in ${path.relative(kube, f)}`);
    }
  }
});

test('SX parts come only from the single-crystal foundry', () => {
  for (const id of ['sx_blade', 'sx_pump_impeller', 'brayton_turbine_wheel']) {
    const ps = producers(`grindless:${id}`);
    assert.ok(ps.length === 1, id);
    assert.equal(typeOf(ps[0][0]), 'single_crystal_casting', id);
  }
  for (const f of serverScripts()) {
    if (f.endsWith(path.join('uev', 'electron_beam.js'))) continue;
    for (const id of ['sx_blade', 'sx_pump_impeller', 'brayton_turbine_wheel']) {
      // UEV-B1: the DFD Mk2 row of the thruster works is the wheel's one use (uev.md machine 7, c3)
      if (id === 'brayton_turbine_wheel' && f.endsWith(path.join('uv', 'propulsion.js'))) continue;
      assert.ok(!read(f).includes(`grindless:${id}`), `${id} named in ${path.relative(kube, f)}`);
    }
  }
});

test('the blade waits on Barnard\'s rhenium: the 6N rhenium row eats GTM\'s rhenium ingot and the alloy only 6N rhenium', () => {
  assert.deepEqual(ids(by('electron_beam_refining', 'rhenium').itemsIn), ['gtceu:rhenium_ingot']);
  assert.ok(inputs(by('mixer', 'sx_master_alloy')).includes('grindless:six_n_rhenium'));
  assert.ok(!inputs(by('mixer', 'sx_master_alloy')).includes('gtceu:rhenium_ingot'));
  assert.ok(inputs(by('single_crystal_casting', 'sx_blade')).includes('grindless:sx_master_alloy_dust'));
});

test('rhenium is GTM\'s bare element: it gets its ingot in materialModification, never a second material of that name', () => {
  assert.doesNotMatch(startup, /event\.create\('rhenium'\)/);
  const mod = startup.slice(startup.indexOf('GTCEuStartupEvents.materialModification'));
  assert.match(mod, /GTMaterials\.get\('rhenium'\)/);
  assert.match(mod, /ensureSet\(PropertyKey\.INGOT, true\)/);
  const run = runPackScripts(path.join(root, 'pack'));
  assert.ok(run.registry.modifiedMaterials.has('gtceu:rhenium'), 'the static run records the form it adds');
  assert.ok(run.registry.modifiedMaterials.has('gtceu:ytterbium'), 'UV\'s ytterbium too');
  assert.ok(!run.registry.materials.has('gtceu:rhenium'));
});

test('gates are remelted and the dross has a destination; the foundry refuses to void', () => {
  for (const r of T.types.single_crystal_casting.recipes) {
    assert.ok(outputs(r).some((o) => o === 'grindless:sx_gate' || o === 'grindless:sx_dross'), r.name);
  }
  assert.deepEqual(outputs(by('macerator', 'sx_gate_remelt')), ['grindless:sx_master_alloy_dust']);
  assert.ok(startup.includes('G.noVoiding.modifier') && startup.includes('G.noVoiding.beforeWorking'));
});

test('Zr goes to line 33 (YSZ) and Nb to line 38 (the Nb3Sn cavity)', () => {
  assert.ok(inputs(by('chemical_reactor', 'zirconia_hydrolysis')).includes('grindless:zirconium_chloride_dust'));
  assert.ok(outputs(by('chemical_reactor', 'zirconia_hydrolysis')).includes('gtceu:zirconia_dust'));
  assert.ok(inputs(by('mixer', 'ysz_powder')).includes('gtceu:zirconia_dust'));
  assert.deepEqual(outputs(by('compressor', 'ysz_ingot')), ['grindless:ysz_ingot']);
  assert.ok(inputs(by('electron_beam_refining', 'ysz_coating')).includes('grindless:ysz_ingot'));
  assert.deepEqual(outputs(by('bender', 'rrr_niobium_sheet')), ['grindless:rrr_niobium_sheet']);
  assert.deepEqual(inputs(by('bender', 'rrr_niobium_sheet')), ['grindless:six_n_niobium']);
  const sn = by('srf_cavity', 'nb3sn_diffusion');
  assert.equal(sn.circuit, 5);
  assert.ok(inputs(sn).includes('grindless:srf_cavity'));
  assert.deepEqual(outputs(sn), ['grindless:nb3sn_srf_cavity']);
});

test('UV\'s circuits 1-4 on srf_cavity are untouched; the new row never duplicates an input set of UV\'s', () => {
  const cold = read(path.join(kube, 'server_scripts', 'grindless', 'uv', 'cold.js'));
  // UIV-A2 adds c5 (para_h2_target, the pulser's solid target): the only circuit-5 row, and nothing above it
  assert.ok(/circuit: 4/.test(cold) && (cold.match(/circuit: 5/g) || []).length === 1 && /name: 'para_h2_target', type: 'srf_cavity', circuit: 5/.test(cold) && !/circuit: 6/.test(cold));
  assert.ok(!startup.includes("registry('gtceu:recipe_type'") || !startup.includes("create('srf_cavity')"));
});

test('NaF and KF return to the kiln: the reductions leave alkali fluoride, which has no other use', () => {
  assert.ok(outputs(by('chemical_reactor', 'tantalum_sodium_reduction')).includes('grindless:alkali_fluoride_dust'));
  assert.ok(outputs(by('chemical_reactor', 'niobium_sodium_reduction')).includes('grindless:alkali_fluoride_dust'));
});

test('every new item is named and tooltipped in en_us and es_es, and every item the table makes is registered', () => {
  const items = [...startup.matchAll(/^ {4}(\w+): \{ stack: \d+ \}/gm)].map((m) => m[1]);
  assert.ok(items.length >= 33, `${items.length} items`);
  for (const n of items) assert.ok(lang.includes(`['${n}',`), `lang: ${n}`);
  const registered = new Set(items.map((n) => `grindless:${n}`));
  const f1 = read(path.join(kube, 'startup_scripts', 'grindless', 'uev', 'foundation.js'));
  const uv = read(path.join(kube, 'startup_scripts', 'grindless', 'uv', 'cold.js'));
  // UIV-A3 appends c7 (nb_ta_button) and registers its items in its own startup
  const a3 = read(path.join(kube, 'startup_scripts', 'grindless', 'uiv', 'levitation_melter.js'));
  // UIV-A10 appends tin_distill (c8) and registers eb_distilled_tin in its own startup
  const a10 = read(path.join(kube, 'startup_scripts', 'grindless', 'uiv', 'matrioshka.js'));
  for (const [, r] of allRows().filter(([w]) => w.startsWith('electron_beam.json'))) {
    for (const id of outputs(r).concat(ids(r.itemsIn))) {
      if (!id.startsWith('grindless:')) continue;
      const n = id.slice('grindless:'.length);
      assert.ok(registered.has(id) || f1.includes(n) || uv.includes(n) || a3.includes(n) || a10.includes(n), `${id} is registered nowhere`);
    }
  }
  for (const key of ['block.gtceu.electron_beam_furnace', 'block.gtceu.single_crystal_foundry', 'gtceu.electron_beam_refining', 'gtceu.single_crystal_casting']) {
    assert.ok(lang.includes(`'${key}'`), key);
  }
  for (const [type, dataKey] of [['electron_beam_refining', 'grindless_electron_beam'], ['single_crystal_casting', 'grindless_single_crystal_casting']]) {
    for (const r of T.types[type].recipes) assert.ok(lang.includes(`'gtceu.recipe.${dataKey}.${r.name}'`), `${type}/${r.name}`);
  }
});

test('the eight older rows exist: cascade circuits 8-11, platinum plant circuits 7-8, kiln HF and CaF2', () => {
  const sv = path.join(kube, 'server_scripts', 'grindless');
  const casc = read(path.join(sv, 'ev', 'extraction_cascade.js'));
  for (const [n, c] of [['zr_hf_cut', 8], ['tantalum_cut', 9], ['terbium_strip', 10], ['lanthanum_yttrium_strip', 11]]) {
    assert.match(casc, new RegExp(`name: '${n}', mode: 'uev', circuit: ${c}\\b`), n);
  }
  const pp = read(path.join(sv, 'ev', 'platinum_plant.js'));
  assert.match(pp, /name: 'sx_dross', circuit: 7/);
  assert.match(pp, /name: 'eb_skull', circuit: 8/);
  assert.match(pp, /KEEP_KEY, true/);
  const fk = read(path.join(sv, 'iv', 'fluorspar_kiln.js'));
  assert.match(fk, /name: 'hf_from_alkali_fluoride'/);
  assert.match(fk, /name: 'calcium_fluoride_return'/);
});
