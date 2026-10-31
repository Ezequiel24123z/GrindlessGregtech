// UEV-A4 (docs/eras/uev.md, "A4. Electron beam and superalloy"): the electron beam furnace's and the single-crystal foundry's table, lines
// 11, 12, 13, 33 and 38, checked without Minecraft by static recipe lookup. T1 is proof reuse (plain lib/patterns.js multiblocks and the
// table-driven generator of UHV-A2): no native test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
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
    + read(path.join(kube, 'client_scripts', 'grindless', 'uiv_matrioshka_lang.js')) // UIV-A10's tin_distill
    + read(path.join(kube, 'client_scripts', 'grindless', 'uxv_spin_rows_lang.js')) // UXV-A3's c9-20 and c27-29
    + read(path.join(kube, 'client_scripts', 'grindless', 'opv_beam_hardware_lang.js')) // OpV-D1's c24-26 and c30-31
    + read(path.join(kube, 'client_scripts', 'grindless', 'opv_census_iv_lang.js')) // OpV-B2's c23 ni_chain_thaw
    + read(path.join(kube, 'client_scripts', 'grindless', 'opv_components_lang.js')) // OpV-A1's c21 mesh_belt_weld
    + read(path.join(kube, 'client_scripts', 'grindless', 'opv_field_press_lang.js')) // OpV-A3's c22 W-Re can and its re-melt
    + read(path.join(kube, 'client_scripts', 'grindless', 'opv_pathfinder_lang.js')); // OpV-R1 EB c24

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

test('every recipe has a unique name, a positive EU/t and duration; a circuit repeats inside a type only with other item inputs', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    // OpV-F3: the loader refuses a repeat whose item ids (consumed and kept) are the same set
    const paths = t.recipes.filter((r) => r.circuit > 0).map((r) => `${r.circuit}|${[...new Set(ids(r.itemsIn).concat(ids(r.kept)))].sort().join(',')}`);
    assert.equal(new Set(paths).size, paths.length, type);
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

// OpV-F3: the server script itself in a sandbox, on the shipped table or a probe table, with the startup script's slots and UV's
// cryomodule works; every id exists and every GT builder call is recorded. Arrays made in the sandbox are copied out before deepEqual.
const SERVER = path.join(kube, 'server_scripts', 'grindless', 'uev', 'electron_beam.js');
function machinesOf() {
  const out = {};
  const re = /(\w+): \{\s*name: '(\w+)',\s*machine: '([^']+)',\s*type: '(\w+)'[\s\S]*?maxIO: \{ itemsIn: (\d+), itemsOut: (\d+), fluidsIn: (\d+), fluidsOut: (\d+) \}/g;
  for (const m of startup.matchAll(re)) out[m[1]] = { name: m[2], machine: m[3], type: m[4], maxIO: { itemsIn: +m[5], itemsOut: +m[6], fluidsIn: +m[7], fluidsOut: +m[8] } };
  assert.deepEqual(Object.keys(out), ['furnace', 'foundry']);
  return out;
}
function worksIO() {
  const m = read(path.join(kube, 'startup_scripts', 'grindless', 'uv', 'cold.js')).match(/C\.worksIO = \{ itemsIn: (\d+), itemsOut: (\d+), fluidsIn: (\d+), fluidsOut: (\d+) \}/);
  assert.ok(m, 'uv/cold.js: worksIO');
  return { itemsIn: +m[1], itemsOut: +m[2], fluidsIn: +m[3], fluidsOut: +m[4] };
}
function runLoader(table) {
  const errors = [];
  const built = [];
  let handler = null;
  const builder = (type, id) => {
    const rec = { type, id, calls: [] };
    built.push(rec);
    const b = new Proxy({}, { get: (_, k) => (...args) => { rec.calls.push([String(k), ...args]); return b; } });
    return b;
  };
  const EB = { machines: machinesOf() };
  const ctx = {
    global: { grindless: { electronBeam: EB, cold: { worksIO: worksIO() }, readJsonTable: () => JSON.parse(JSON.stringify(table)) } },
    ServerEvents: { recipes: (fn) => { handler = fn; } },
    Item: { exists: () => true },
    Fluid: { exists: () => true, of: (id, amount) => ({ id, amount }) },
    console: { info: () => {}, error: (s) => errors.push(String(s)) }
  };
  vm.createContext(ctx);
  vm.runInContext(read(SERVER), ctx, { filename: SERVER });
  assert.equal(typeof handler, 'function', 'ServerEvents.recipes handler');
  handler({ recipes: { gtceu: new Proxy({}, { get: (_, type) => (id) => builder(String(type), id) }) } });
  return { EB, errors, built, names: Array.from(EB.recipes || [], (r) => r.name), clashes: Array.from(EB.clashes || []) };
}
const circuitOf = (b) => (b.calls.find((c) => c[0] === 'circuit') || [])[1];
const probe = (circuit, name, items, out, extra = {}) => ({
  name, circuit, eut: 30, duration: 40, itemsIn: items.map((id) => ({ id, count: 1 })), kept: [], fluidsIn: [], charge: [],
  itemsOut: [{ id: out, count: 1 }], fluidsOut: [], ...extra
});
const probeTable = (rows) => ({ types: { electron_beam_refining: { dataKey: 'grindless_electron_beam', recipes: rows } } });

test('the loader builds every shipped row unchanged: no problem, no skip, no clash, each on its own circuit', () => {
  const run = runLoader(T);
  assert.deepEqual(run.errors, []);
  const rows = Object.entries(T.types).flatMap(([type, t]) => t.recipes.map((r) => [type, r]));
  assert.equal(run.names.length, rows.length);
  assert.equal(run.EB.skipped.length, 0);
  assert.deepEqual(run.clashes, []);
  for (const [type, r] of rows) {
    const b = run.built.filter((x) => x.type === type && x.id === `grindless:${r.name}`);
    assert.equal(b.length, 1, `${type}/${r.name}: built once`);
    assert.equal(circuitOf(b[0]), r.circuit > 0 ? r.circuit : undefined, `${type}/${r.name}: circuit`);
  }
  assert.equal(run.EB.controllerRecipes.length, 2);
});

test('OpV-F3: two rows of a type may share a circuit when their item inputs differ', () => {
  const run = runLoader(probeTable([
    probe(21, 'probe_a', ['minecraft:clay_ball', 'minecraft:flint'], 'minecraft:poppy'),
    probe(21, 'probe_b', ['minecraft:clay_ball', 'minecraft:snowball'], 'minecraft:allium')
  ]));
  assert.deepEqual(run.errors, []);
  assert.deepEqual(run.names, ['probe_a', 'probe_b']);
  assert.deepEqual(run.clashes, []);
  for (const n of ['probe_a', 'probe_b']) assert.equal(circuitOf(run.built.find((x) => x.id === `grindless:${n}`)), 21, n);
});

test('OpV-F3: a repeat with identical item inputs (ids, consumed or kept) is still refused; the circuit stays 1..32', () => {
  const run = runLoader(probeTable([
    probe(21, 'probe_a', ['minecraft:clay_ball', 'minecraft:flint'], 'minecraft:poppy'),
    probe(21, 'probe_same', [], 'minecraft:allium', { itemsIn: [{ id: 'minecraft:flint', count: 2 }, { id: 'minecraft:clay_ball', count: 1 }] }),
    probe(21, 'probe_kept', ['minecraft:clay_ball'], 'minecraft:allium', { kept: [{ id: 'minecraft:flint', count: 1 }] }),
    probe(33, 'probe_33', ['minecraft:stick'], 'minecraft:poppy'),
    probe(0, 'probe_0', ['minecraft:bone'], 'minecraft:poppy')
  ]));
  assert.deepEqual(run.names, ['probe_a']);
  assert.equal(run.errors.length, 1);
  assert.match(run.errors[0], /electron_beam_refining\/probe_same: circuit 21 repeats probe_a with the same item inputs/);
  assert.match(run.errors[0], /electron_beam_refining\/probe_kept: circuit 21 repeats probe_a with the same item inputs/);
  assert.match(run.errors[0], /electron_beam_refining\/probe_33: name, circuit 33/);
  assert.match(run.errors[0], /electron_beam_refining\/probe_0: name, circuit 0/);
});

test('OpV-F3: a same-circuit pair whose item inputs are a subset is reported in clashes', () => {
  const run = runLoader(probeTable([
    probe(21, 'probe_a', ['minecraft:clay_ball'], 'minecraft:poppy'),
    probe(21, 'probe_b', ['minecraft:clay_ball', 'minecraft:snowball'], 'minecraft:allium'),
    probe(22, 'probe_c', ['minecraft:clay_ball'], 'minecraft:poppy')
  ]));
  assert.deepEqual(run.names, ['probe_a', 'probe_b', 'probe_c']);
  assert.deepEqual(run.clashes, ['electron_beam_refining/probe_a / probe_b']);
  assert.equal(run.errors.length, 1);
  assert.match(run.errors[0], /subset of another's: electron_beam_refining\/probe_a \/ probe_b$/);
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
      // OpV-A2's MOCVD gate stack (uv/photonics.js, c19) consumes 6N hafnium
      if (id === 'six_n_hafnium' && f.endsWith(path.join('uv', 'photonics.js'))) continue;
      // UXV-A2's hot strip mill foil and gum-metal blend (uxv/spin_feed.js) only consume 6N tantalum and niobium
      if ((id === 'six_n_tantalum' || id === 'six_n_niobium') && f.endsWith(path.join('uxv', 'spin_feed.js'))) continue;
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
  // MAX-A2's two rows make a bulk and a rod, not a cast with a gate
  for (const r of T.types.single_crystal_casting.recipes.filter((x) => !/^MAX-A2/.test(x._why || ''))) {
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
  // UIV-A9 adds c6 (polarised_h_ice): the only circuit-6 row, and nothing above it
  // UIV-B3 adds c7 (solid_neon_cone): the only circuit-7 row
  // OpV-A2 adds c8 (rrr_nb_target, the Nb TSV sputter target): the only circuit-8 row, and nothing above it
  assert.ok(/circuit: 4/.test(cold) && (cold.match(/circuit: 5/g) || []).length === 1 && /name: 'para_h2_target', type: 'srf_cavity', circuit: 5/.test(cold) && (cold.match(/circuit: 6/g) || []).length === 1 && /name: 'polarised_h_ice', type: 'srf_cavity', circuit: 6/.test(cold) && (cold.match(/circuit: 7/g) || []).length === 1 && /name: 'solid_neon_cone', type: 'srf_cavity', circuit: 7/.test(cold) && (cold.match(/circuit: 8/g) || []).length === 1 && /name: 'rrr_nb_target', type: 'srf_cavity', circuit: 8/.test(cold) && !/circuit: (9|[1-3]\d)\b/.test(cold));
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
  const a10 = read(path.join(kube, 'startup_scripts', 'grindless', 'uev', 'composites.js')) + read(path.join(kube, 'startup_scripts', 'grindless', 'uiv', 'matrioshka.js'))
    // UXV-A3's c9-20 and c27-29 rows: their items are registered in its own startup (UXV-A2's 5N and 7N grades in spin_feed.js)
    + read(path.join(kube, 'startup_scripts', 'grindless', 'uxv', 'spin_rows.js')) + read(path.join(kube, 'startup_scripts', 'grindless', 'uxv', 'spin_feed.js')) + read(path.join(kube, 'startup_scripts', 'grindless', 'uxv', 'foundation.js'))
    // OpV-D1's c24-26 and c30-31 (opv/beam_hardware.js; c31 takes A2's nbtin_film_wafer, opv/circuits.js)
    // OpV-B2's c23 returns UIV's cage_part (uiv/foundation.js); OpV packages register their items under startup_scripts/grindless/opv/
    // OpV-A1's c21 (mesh_belt_weld): its belt and trim are registered in opv/components.js
    // OpV-E1's c23 (positron_cell_seal) seals its own cell (opv/pair_converter.js) into F1's dense positron cell (opv/foundation.js)
    // OpV-B3a's c21, c22 and c32 rows are registered in opv/antimatter.js (read with the opv directory below)
    // OpV-A3's c22 rows (W-Re can and re-melt): the can items in opv/field_press.js, the chain lamina stack in opv/foundation.js
    + read(path.join(kube, 'startup_scripts', 'grindless', 'uiv', 'foundation.js'))
    + read(path.join(kube, 'startup_scripts', 'grindless', 'max', 'foundation.js')) // MAX-A2's c25 bulk and c27 rod, registered by MAX-F
    + fs.readdirSync(path.join(kube, 'startup_scripts', 'grindless', 'opv')).filter((f) => f.endsWith('.js')).map((f) => read(path.join(kube, 'startup_scripts', 'grindless', 'opv', f))).join('\n');
  // OpV-B2's c23 thaws OpV-A0's caged_ni_chain and OpV-A1's c21 takes A0's chain_mesh_weave: both registered in opv/chain_matter.js
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
    const rowLang = lang + read(path.join(kube, 'client_scripts', 'grindless', 'opv_pair_converter_lang.js'))
      + read(path.join(kube, 'client_scripts', 'grindless', 'opv_antimatter_lang.js')) // OpV-B3a's c21, c22 and c32 row names
      + read(path.join(kube, 'client_scripts', 'grindless', 'max_components_lang.js'))
      + read(path.join(kube, 'client_scripts', 'grindless', 'max_membrane_line_lang.js')); // MAX-A2's c25 and c27, MAX-B1's c26, c30, c31
    for (const r of T.types[type].recipes) assert.ok(rowLang.includes(`'gtceu.recipe.${dataKey}.${r.name}'`), `${type}/${r.name}`);
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
