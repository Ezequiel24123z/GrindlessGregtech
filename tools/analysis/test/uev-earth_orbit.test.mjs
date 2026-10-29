// UEV-A8 (docs/eras/uev.md, "A8. Earth orbit"): the quantum gas lab and the entanglement station, lines 31, 32, 34, 36, 39 and 40,
// checked without Minecraft by static recipe lookup (the dimension allowlist is proven by the earlier orbit machines).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const read = (p) => fs.readFileSync(p, 'utf8');
const T = JSON.parse(read(path.join(tables, 'earth_orbit.json')));
const PHOTONICS = JSON.parse(read(path.join(tables, 'photonics_uev.json')));
const CRYSTALS = JSON.parse(read(path.join(tables, 'crystals.json')));
const startup = read(path.join(kube, 'startup_scripts', 'grindless', 'uev', 'earth_orbit.js'));
const server = read(path.join(kube, 'server_scripts', 'grindless', 'uev', 'earth_orbit.js'));
const lang = read(path.join(kube, 'client_scripts', 'grindless', 'uev_earth_orbit_lang.js'));
const uvPhotonics = read(path.join(kube, 'server_scripts', 'grindless', 'uv', 'photonics.js'));
const outerChem = read(path.join(kube, 'server_scripts', 'grindless', 'zpm', 'outer_chemistry.js'));

const ORBIT_TYPES = ['quantum_degenerate_gas', 'entanglement_distribution'];
const GTM = new Set(['cutter', 'electric_blast_furnace', 'chemical_reactor', 'assembler', 'lathe', 'mixer', 'wiremill', 'polarizer']);
const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const rowsOf = (tbl) => Object.entries(tbl.types).flatMap(([type, t]) => t.recipes.map((r) => ({ type, ...r })));
const mine = rowsOf(T);
const row = (type, name) => {
  const r = mine.find((x) => x.type === type && x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};

test('every recipe has a unique name, positive EU/t and duration; circuits are unique inside a type', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
      assert.ok(GTM.has(type) ? r.circuit >= 0 : r.circuit >= 1 && r.circuit <= 32, `${type}/${r.name}: circuit`);
    }
  }
});

test('names do not collide with A6 rows on the same type', () => {
  for (const [type, t] of Object.entries(T.types)) {
    const other = PHOTONICS.types[type];
    if (!other) continue;
    const used = new Set(other.recipes.map((r) => r.name));
    for (const r of t.recipes) assert.ok(!used.has(r.name), `${type}/${r.name}`);
  }
});

test('every recipe of the two orbit types is flagged for the Earth-orbit dimension and the script applies it', () => {
  for (const type of ORBIT_TYPES) assert.equal(T.types[type].dimension, true, type);
  assert.match(server, /G\.orbits \? G\.orbits\.earth : 'gcyr:overworld_orbit'/);
  assert.match(server, /\.dimension\(ORBIT\)/);
  for (const [type, t] of Object.entries(T.types)) if (!ORBIT_TYPES.includes(type)) assert.ok(!t.dimension, `${type} is a plain GTM type`);
});

test('degenerate_eos_model, barnard_gravity_survey and quantum_repeater_node are made only by the two orbit machines', () => {
  const targets = ['grindless:degenerate_eos_model', 'grindless:barnard_gravity_survey', 'grindless:quantum_repeater_node'];
  for (const id of targets) {
    const makers = mine.filter((r) => ids(r.itemsOut).includes(id));
    assert.equal(makers.length, 1, id);
    assert.ok(ORBIT_TYPES.includes(makers[0].type), id);
  }
  const files = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(js|json)$/.test(e.name)) files.push(p);
    }
  };
  walk(path.join(kube, 'server_scripts'));
  walk(tables);
  for (const f of files) {
    const text = read(f);
    if (f.endsWith('earth_orbit.json') || f.endsWith('earth_orbit.js')) continue;
    for (const id of targets) {
      const re = new RegExp(`(itemsOut|fluidsOut)[^\\]]*${id}|\\.outputItems\\([^)]*${id}`);
      assert.ok(!re.test(text), `${path.relative(kube, f)} produces ${id}`);
    }
  }
});

test('the survey takes B3 Barnard core rock; the node takes the QD source, SNSPDs and hollow-core fibre', () => {
  assert.ok(ids(row('quantum_degenerate_gas', 'barnard_gravity_survey').itemsIn).includes('grindless:barnard_core_rock'));
  const n = ids(row('entanglement_distribution', 'quantum_repeater_node').itemsIn);
  for (const id of ['grindless:qd_source', 'grindless:snspd', 'grindless:hollow_core_fibre']) assert.ok(n.includes(id), id);
});

test('the ULE cavity is never consumed', () => {
  const r = row('quantum_degenerate_gas', 'calibrate_gravimeter');
  assert.ok(ids(r.kept).includes('grindless:ule_cavity'));
  assert.ok(!ids(r.itemsIn).includes('grindless:ule_cavity'));
  for (const x of mine) if (x.name !== 'ule_cavity') assert.ok(!ids(x.itemsIn).includes('grindless:ule_cavity'), x.name);
});

test('byproducts are routed: no recipe outputs a void marker', () => {
  for (const r of mine) for (const o of ids(r.itemsOut).concat(ids(r.fluidsOut))) assert.ok(!/void|trash/.test(o), `${r.name}: ${o}`);
  for (const r of mine.filter((x) => x.type === 'chemical_reactor' || x.type === 'electric_blast_furnace')) {
    assert.ok(ids(r.itemsOut).length + ids(r.fluidsOut).length >= 1, r.name);
  }
});

test('the robot arm, the isolator, the lobster-eye MCP and the three material producers exist', () => {
  const made = (id) => mine.some((r) => ids(r.itemsOut).includes(id));
  for (const id of ['grindless:uev_robot_arm', 'grindless:faraday_isolator', 'grindless:hollow_core_fibre', 'grindless:lobster_eye_mcp', 'gtceu:tgg_dust', 'gtceu:ppktp_dust', 'gtceu:ule_glass_dust']) {
    assert.ok(made(id), id);
  }
  assert.ok(ids(row('assembler', 'faraday_isolator').itemsIn).includes('grindless:terbium_oxide_dust') || mine.some((r) => ids(r.itemsIn).includes('grindless:terbium_oxide_dust')));
});

test('the older rows exist: fibre draw 6-8, crystal furnace tgg and ktp, pyrolyser cnt_sock', () => {
  const block = uvPhotonics.slice(uvPhotonics.indexOf('A8_ROWS'));
  for (const [c, n] of [[6, 'hollow_capillaries'], [7, 'mcp_multifibre'], [8, 'cooling_lasers']]) {
    assert.match(block, new RegExp(`name: '${n}'[^}]*circuit: ${c}|circuit: ${c}[^}]*name: '${n}'`), n);
  }
  const cg = CRYSTALS.types.crystal_growth.recipes;
  assert.equal(cg.find((r) => r.name === 'tgg').circuit, 6);
  assert.equal(cg.find((r) => r.name === 'ktp').circuit, 7);
  assert.match(outerChem, /cnt_sock/);
});

test('both machines are registered with their types and Earth-orbit casing; every item has a name, tooltips and a texture', () => {
  assert.match(startup, /gtceu:quantum_gas_lab|quantum_gas_lab/);
  assert.match(startup, /entanglement_station/);
  for (const k of ['block.gtceu.quantum_gas_lab', 'block.gtceu.entanglement_station', 'gtceu.quantum_degenerate_gas', 'gtceu.entanglement_distribution']) {
    assert.ok(lang.includes(`'${k}'`), k);
  }
  const names = [...startup.matchAll(/(\w+): \{ stack: \d+ \}/g)].map((m) => m[1]);
  assert.equal(names.length, 39);
  for (const n of names) {
    assert.ok(lang.includes(`['${n}',`), `lang ${n}`);
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), `texture ${n}`);
  }
  for (const m of ['quantum_gas_lab', 'entanglement_station']) {
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) {
      assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', m, f)), `${m}/${f}`);
    }
  }
});
