// UHV-A2 (docs/eras/uhv.md, "A2. Clock and crystals"): the nuclear clock lab's and the crystal growth furnace's table, the cutter rows,
// the iridium crucible and its return to EV's platinum plant, checked without Minecraft by static recipe lookup. T1: none.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const T = JSON.parse(fs.readFileSync(path.join(tables, 'crystals.json'), 'utf8'));
const CLOCK = T.types.nuclear_clock.recipes;
const GROW = T.types.crystal_growth.recipes.filter((r) => !/^(UXV|OpV|MAX)-/.test(r._why || '')); // UXV rows are pinned in uxv-spin_rows.test.mjs (A3) and uxv-spin_logic.test.mjs (c18); OpV rows in opv-*.test.mjs (A2: opv-circuits; D1's c23 ceb6_boule: opv-beam_hardware); OpV-A1's c19-20 in opv-components.test.mjs; OpV-A3's c22 in opv-field_press.test.mjs; OpV-B1's c24 in opv-tetron_optics.test.mjs
const CUT = T.types.cutter.recipes;
const ASM = T.types.assembler.recipes;
const PGM = T.types.pgm_refining.recipes;
const startup = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', 'uhv', 'crystals.js'), 'utf8');
const server = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'uhv', 'crystals.js'), 'utf8');
// UEV-A8's TGG and KTP rows keep their lang keys in the UEV file; UIV-A6's Eu-151 and Er:YSO rows in the UIV file; OpV-D1's ceb6_boule and OpV-A2's c21 in their own; OpV-A1's in opv_components_lang.js; OpV-A3's AlN boule in opv_field_press_lang.js; OpV-B1's c24 in opv_tetron_optics_lang.js
const lang = ['uhv_crystals_lang.js', 'uev_earth_orbit_lang.js', 'uiv_memories_cryostat_lang.js', 'uiv_mainframe_lang.js', 'uxv_spin_rows_lang.js', 'opv_beam_hardware_lang.js', 'opv_circuits_lang.js', 'opv_components_lang.js', 'opv_field_press_lang.js', 'opv_tetron_optics_lang.js', 'opv_antimatter_lang.js', 'max_shell_parts_lang.js', 'opv_pathfinder_lang.js', 'max_circuits_lang.js', 'max_interferometer_lang.js', 'max_rydberg_lang.js', 'max_imager_lang.js'].map((f) => fs.readFileSync(path.join(kube, 'client_scripts', 'grindless', f), 'utf8')).join('\n');

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn), ids(r.charge));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const by = (rs, name) => {
  const r = rs.find((x) => x.name === name);
  assert.ok(r, name);
  return r;
};
const CRUCIBLE = 'grindless:iridium_crucible';
const WORN = 'grindless:worn_iridium_crucible';
// tgg and ktp: UEV-A8 rows (docs/eras/uev.md, A8); eu151_yso and er_yso: UIV-A6 rows (docs/eras/uiv.md lines 15-16)
const BOULES = ['grindless:lithium_niobate_boule', 'grindless:vuv_caf2_boule', 'grindless:thorium_caf2_crystal', 'grindless:eu_yso_boule', 'grindless:inp_boule', 'grindless:tgg_boule', 'grindless:ktp_boule', 'grindless:eu151_yso_boule', 'grindless:er_yso_boule'];

// every recipe-producing row of every table, as [table/path, recipe]
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

test('every recipe has a unique name, a positive EU/t and duration; circuits are unique inside a type; the machines\' rows all carry one', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    // OpV-F3 rule: a circuit repeats inside a type only when the item ids (consumed and kept) differ
    const paths = t.recipes.filter((r) => r.circuit > 0).map((r) => `${r.circuit}|${[...new Set(ids(r.itemsIn).concat(ids(r.kept)))].sort().join(',')}`);
    assert.equal(new Set(paths).size, paths.length, type);
    for (const r of t.recipes) {
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
      if (t.dataKey) assert.ok(r.circuit >= 1 && r.circuit <= 32, `${type}/${r.name}: one recipe per lookup path needs a circuit`);
      for (const x of r.itemsIn.concat(r.itemsOut)) if (x.chance !== undefined) assert.ok(Number.isInteger(x.chance) && x.chance >= 1 && x.chance < 10000, `${r.name}: ${x.id}`);
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

test('the recipes fit the machines\' slots (startup maxIO; the circuit takes an item slot) and the platinum plant\'s', () => {
  const io = {
    nuclear_clock: { itemsIn: 4, itemsOut: 1, fluidsIn: 1, fluidsOut: 0 },
    crystal_growth: { itemsIn: 5, itemsOut: 2, fluidsIn: 2, fluidsOut: 0 }
  };
  for (const [type, m] of Object.entries(io)) {
    assert.ok(startup.includes(`maxIO: { itemsIn: ${m.itemsIn}, itemsOut: ${m.itemsOut}, fluidsIn: ${m.fluidsIn}, fluidsOut: ${m.fluidsOut} }`), type);
  }
  const pp = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', 'ev', 'platinum_plant.js'), 'utf8');
  const ppio = pp.match(/PP\.maxIO = \{ itemsIn: (\d+), itemsOut: (\d+), fluidsIn: (\d+), fluidsOut: (\d+) \}/);
  assert.ok(ppio, 'platinum plant maxIO');
  io.pgm_refining = { itemsIn: +ppio[1], itemsOut: +ppio[2], fluidsIn: +ppio[3], fluidsOut: +ppio[4] };
  for (const [type, m] of Object.entries(io)) {
    for (const r of T.types[type].recipes) {
      assert.ok(r.itemsIn.length + r.kept.length + 1 <= m.itemsIn, `${r.name} items in`);
      assert.ok(r.fluidsIn.length + r.charge.length <= m.fluidsIn, `${r.name} fluids in`);
      assert.ok(r.itemsOut.length <= m.itemsOut, `${r.name} items out`);
      assert.ok(r.fluidsOut.length <= m.fluidsOut, `${r.name} fluids out`);
    }
  }
});

test('the nuclear clock comes only from the lab; the comb from the lab\'s circuit 1 and its optics from the cutter', () => {
  const clock = producers('grindless:nuclear_clock');
  assert.equal(clock.length, 1);
  assert.ok(clock[0][0].startsWith('crystals.json:.types.nuclear_clock'), clock[0][0]);
  assert.equal(clock[0][1].name, 'clock');
  assert.ok(inputs(by(CLOCK, 'clock')).includes('grindless:thorium_caf2_crystal') && inputs(by(CLOCK, 'clock')).includes('grindless:vuv_frequency_comb'));
  assert.deepEqual(producers('grindless:vuv_frequency_comb').map(([, r]) => r.name), ['comb']);
  const comb = by(CLOCK, 'comb');
  assert.ok(inputs(comb).includes('grindless:fibre_laser_module') && inputs(comb).includes('grindless:vuv_caf2_optic'));
  assert.deepEqual(ids(comb.charge), ['gtceu:xenon'], 'the xenon is never used up');
  assert.deepEqual(producers('grindless:vuv_caf2_optic').map(([, r]) => r.name), ['vuv_caf2_optics']);
});

test('the nine boules each have their own circuit and a single maker; thorium-229 is used here, made only by the decay store', () => {
  const circuits = BOULES.map((id) => {
    const p = producers(id);
    // MAX-B3 c30 pulls a second Eu:YSO boule for line L23 (the max.md contract)
    assert.equal(p.length, id === 'grindless:eu_yso_boule' ? 2 : 1, id);
    assert.ok(p[0][0].startsWith('crystals.json:.types.crystal_growth'), id);
    return p[0][1].circuit;
  });
  assert.equal(new Set(circuits).size, BOULES.length);
  assert.equal(GROW.length, BOULES.length);
  assert.deepEqual(producers('grindless:thorium_229').map(([, r]) => r.name), ['decay_store']);
  assert.ok(inputs(by(GROW, 'thorium_caf2')).includes('grindless:thorium_229'));
  // the scavenger and the cap are kept, the argon is a charge
  assert.deepEqual(ids(by(GROW, 'vuv_caf2').kept), ['gtceu:lead_fluoride_dust']);
  assert.deepEqual(ids(by(GROW, 'thorium_caf2').kept), ['gtceu:lead_fluoride_dust']);
  assert.deepEqual(ids(by(GROW, 'inp').kept), ['gtceu:boron_trioxide_dust']);
  for (const r of GROW) assert.deepEqual(ids(r.charge), ['gtceu:argon'], r.name);
  // the boules that need cutting are cut, and nothing else is cut from them
  for (const [boule, wafer] of [['grindless:lithium_niobate_boule', 'grindless:lithium_niobate_wafer'], ['grindless:inp_boule', 'grindless:inp_wafer'], ['grindless:vuv_caf2_boule', 'grindless:vuv_caf2_optic']]) {
    const cut = CUT.filter((r) => inputs(r).includes(boule));
    assert.equal(cut.length, 1, boule);
    assert.ok(outputs(cut[0]).includes(wafer) && inputs(cut[0]).includes('minecraft:water'), boule);
  }
});

test('the iridium crucible wears out 1 run in 32 and the worn one goes back to iridium in EV\'s platinum plant', () => {
  for (const r of GROW) {
    const c = r.itemsIn.find((x) => x.id === CRUCIBLE);
    const w = r.itemsOut.find((x) => x.id === WORN);
    assert.ok(c && w, r.name);
    assert.equal(c.chance, 313, `${r.name}: about 1 in 32`);
    assert.equal(w.chance, c.chance, `${r.name}: the worn crucible comes out as often as one is used up`);
  }
  assert.deepEqual(producers(CRUCIBLE).map(([w, r]) => [w.split(':')[0], r.name]), [['crystals.json', 'iridium_crucible']]);
  const made = by(ASM, 'iridium_crucible');
  const ingots = made.itemsIn.find((x) => x.id === 'gtceu:iridium_ingot').count;
  // the worn crucible is consumed only by the platinum plant row
  const users = allRows().filter(([, r]) => inputs(r).includes(WORN));
  assert.deepEqual(users.map(([w, r]) => [w.split(':')[0], r.name]), [['crystals.json', 'iridium_crucible']]);
  const back = by(PGM, 'iridium_crucible');
  const ir = back.itemsOut.find((x) => x.id === 'gtceu:iridium_dust');
  assert.ok(ir && ir.count >= 1 && ir.count <= ingots, 'iridium comes back, never more than went in');
  assert.ok(back.itemsIn.some((x) => x.id === 'grindless:platinum_electrode' && x.chance === 10), 'the plant\'s electrode wears as in its other modes');
  assert.equal(T.types.pgm_refining.keep, true, 'it refuses voiding like the plant\'s mode 4');
  assert.equal(T.types.pgm_refining.idPrefix, 'uhv/');
  // the chlorine and hydrogen leave as hydrochloric acid, 1:1:1
  const amt = (xs, id) => xs.find((x) => x.id === id).amount;
  assert.equal(amt(back.fluidsIn, 'gtceu:chlorine'), amt(back.fluidsOut, 'gtceu:hydrochloric_acid'));
  assert.equal(amt(back.fluidsIn, 'gtceu:hydrogen'), amt(back.fluidsOut, 'gtceu:hydrochloric_acid'));
  // circuit 5 is free in the plant (its modes are 1-4)
  const pps = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'ev', 'platinum_plant.js'), 'utf8');
  const plantCircuits = [...pps.matchAll(/const \w+_CIRCUIT = (\d+)/g)].map((m) => +m[1]);
  assert.deepEqual(plantCircuits.sort(), [1, 2, 3, 4]);
  assert.ok(!plantCircuits.includes(back.circuit));
  assert.ok(server.includes("recipe.addDataBool(keepKey, true)") && server.includes('chancedInput') && server.includes('chancedOutput'));
});

test('the furnace refuses voiding; the package registers only its own four items, never an F1 id', () => {
  assert.ok(startup.includes("CR.furnaceNoVoiding = 'grindless.machine.crystal_growth_furnace.no_voiding'"));
  assert.ok(startup.includes('G.noVoiding.beforeWorking'));
  const own = ['vuv_frequency_comb', 'vuv_caf2_optic', 'iridium_crucible', 'worn_iridium_crucible'];
  for (const n of own) assert.ok(startup.includes(`${n}: { stack:`), n);
  const foundation = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', 'uhv', 'foundation.js'), 'utf8');
  for (const n of own) assert.ok(!foundation.includes(`'${n}'`) && !foundation.includes(`${n}:`), `${n} is not an F1 id`);
  for (const n of own) assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), `${n}.png`);
  for (const m of ['nuclear_clock_lab', 'crystal_growth_furnace']) {
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) {
      assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', m, f)), `${m}/${f}`);
    }
  }
});

test('no UEV input, and every lang key is written in en_us and es_es', () => {
  const rows = Object.values(T.types).flatMap((t) => t.recipes);
  for (const r of rows) for (const id of inputs(r).concat(outputs(r))) assert.ok(!/(^|[:_/])uev(_|$)/.test(id.split(':')[1] || ''), `${r.name}: ${id}`);
  const keys = [];
  for (const t of Object.values(T.types)) if (t.dataKey) for (const r of t.recipes) keys.push(`gtceu.recipe.${t.dataKey}.${r.name}`);
  for (const m of ['nuclear_clock_lab', 'crystal_growth_furnace']) {
    keys.push(`block.gtceu.${m}`);
    keys.push(`grindless.machine.${m}.tooltip.0`);
  }
  keys.push('gtceu.nuclear_clock', 'gtceu.crystal_growth', 'grindless.machine.crystal_growth_furnace.no_voiding');
  for (const n of ['vuv_frequency_comb', 'vuv_caf2_optic', 'iridium_crucible', 'worn_iridium_crucible']) keys.push(`item.grindless.${n}`, `tooltip.grindless.${n}.0`, `tooltip.grindless.${n}.1`);
  const str = "'(?:[^'\\\\]|\\\\.)+'";
  for (const k of keys) {
    // [key, en, es]: two non-empty strings follow the key
    const re = new RegExp(`\\['${k.replace(/\./g, '\\.')}',\\s*${str},\\s*${str}\\]`);
    assert.ok(re.test(lang), k);
  }
});

// MAX-CS: the server script itself in a sandbox on the shipped table or a probe table (the OpV-F3 tests of uev-electron_beam.test.mjs, per type)
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
  const machines = { lab: { machine: 'gtceu:nuclear_clock_lab', type: 'nuclear_clock', maxIO: { itemsIn: 4, itemsOut: 1, fluidsIn: 1, fluidsOut: 0 } },
    furnace: { machine: 'gtceu:crystal_growth_furnace', type: 'crystal_growth', maxIO: { itemsIn: 5, itemsOut: 2, fluidsIn: 2, fluidsOut: 0 } } };
  const ctx = {
    global: { grindless: { crystals: { machines }, platinumPlant: { maxIO: { itemsIn: 6, itemsOut: 6, fluidsIn: 6, fluidsOut: 6 } }, readJsonTable: () => JSON.parse(JSON.stringify(table)) } },
    ServerEvents: { recipes: (fn) => { handler = fn; } },
    Item: { exists: () => true },
    Fluid: { exists: () => true, of: (id, amount) => ({ id, amount }) },
    console: { info: () => {}, error: (s) => errors.push(String(s)) }
  };
  vm.createContext(ctx);
  vm.runInContext(server, ctx, { filename: 'crystals.js' });
  assert.equal(typeof handler, 'function');
  handler({ recipes: { gtceu: new Proxy({}, { get: (_, type) => (id) => builder(String(type), id) }) } });
  const CRS = ctx.global.grindless.crystals;
  return { errors, built, names: Array.from(CRS.recipes || [], (r) => `${r.type}/${r.name}`), clashes: Array.from(CRS.clashes || []) };
}
const circuitOf = (b) => (b.calls.find((c) => c[0] === 'circuit') || [])[1];
const probe = (circuit, name, items, out, extra = {}) => ({
  name, circuit, eut: 30, duration: 40, itemsIn: items.map((id) => ({ id, count: 1 })), kept: [], fluidsIn: [], charge: [],
  itemsOut: [{ id: out, count: 1 }], fluidsOut: [], ...extra
});
const probeTable = (type, rows) => ({ types: { [type]: { dataKey: 'probe_key', recipes: rows } } });

test('MAX-CS: the loader builds every shipped row unchanged: no problem, no skip, no clash, each on its own circuit', () => {
  const run = runLoader(T);
  assert.deepEqual(run.errors, []);
  const rows = Object.entries(T.types).flatMap(([type, t]) => t.recipes.map((r) => [type, r]));
  assert.equal(run.names.length, rows.length);
  assert.deepEqual(run.clashes, []);
  for (const [type, r] of rows) {
    const b = run.built.filter((x) => x.type === type && x.id === `grindless:${type}/${r.idPrefix || T.types[type].idPrefix || ''}${r.name}`);
    assert.equal(b.length, 1, `${type}/${r.name}: built once`);
    assert.equal(circuitOf(b[0]), r.circuit > 0 ? r.circuit : undefined, `${type}/${r.name}: circuit`);
  }
});

for (const type of ['crystal_growth', 'nuclear_clock']) {
  test(`MAX-CS: ${type}: two rows may share a circuit when their item inputs differ`, () => {
    const run = runLoader(probeTable(type, [
      probe(21, 'probe_a', ['minecraft:clay_ball', 'minecraft:flint'], 'minecraft:poppy'),
      probe(21, 'probe_b', ['minecraft:clay_ball', 'minecraft:snowball'], 'minecraft:allium')
    ]));
    assert.deepEqual(run.errors, []);
    assert.deepEqual(run.names, [`${type}/probe_a`, `${type}/probe_b`]);
    assert.deepEqual(run.clashes, []);
    for (const n of ['probe_a', 'probe_b']) assert.equal(circuitOf(run.built.find((x) => x.id === `grindless:${type}/${n}`)), 21, n);
  });

  test(`MAX-CS: ${type}: identical item inputs (ids, consumed or kept) are refused; circuits 33 and 0 are refused`, () => {
    const run = runLoader(probeTable(type, [
      probe(21, 'probe_a', ['minecraft:clay_ball', 'minecraft:flint'], 'minecraft:poppy'),
      probe(21, 'probe_same', [], 'minecraft:allium', { itemsIn: [{ id: 'minecraft:flint', count: 2 }, { id: 'minecraft:clay_ball', count: 1 }] }),
      probe(21, 'probe_kept', ['minecraft:clay_ball'], 'minecraft:allium', { kept: [{ id: 'minecraft:flint', count: 1 }] }),
      probe(33, 'probe_33', ['minecraft:stick'], 'minecraft:poppy'),
      probe(0, 'probe_0', ['minecraft:bone'], 'minecraft:poppy')
    ]));
    assert.deepEqual(run.names, [`${type}/probe_a`]);
    assert.equal(run.errors.length, 1);
    assert.match(run.errors[0], /probe_same: circuit 21 repeats probe_a with the same item inputs/);
    assert.match(run.errors[0], /probe_kept: circuit 21 repeats probe_a with the same item inputs/);
    assert.match(run.errors[0], /probe_33: name, circuit 33/);
    assert.match(run.errors[0], /probe_0: name, circuit 0/);
  });

  test(`MAX-CS: ${type}: a same-circuit pair whose item inputs are a subset is reported in clashes`, () => {
    const run = runLoader(probeTable(type, [
      probe(21, 'probe_a', ['minecraft:clay_ball'], 'minecraft:poppy'),
      probe(21, 'probe_b', ['minecraft:clay_ball', 'minecraft:snowball'], 'minecraft:allium'),
      probe(22, 'probe_c', ['minecraft:clay_ball'], 'minecraft:poppy')
    ]));
    assert.deepEqual(run.names, [`${type}/probe_a`, `${type}/probe_b`, `${type}/probe_c`]);
    assert.deepEqual(run.clashes, [`${type}/probe_a / probe_b`]);
    assert.equal(run.errors.length, 1);
    assert.match(run.errors[0], new RegExp(`subset of another's: ${type}/probe_a / probe_b$`));
  });
}
