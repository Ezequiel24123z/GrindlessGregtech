// LuV B7, Io orbit: the flux-tube tether and its written fallback, the Io sulfur-iodine plant (startup_scripts/grindless/lib/stations.js,
// startup_scripts/grindless/luv/io_orbit.js, server_scripts/grindless/luv/io_orbit.js). tables/stations.json is the one switch: each test
// runs the scripts under the three modes (pending, tether, sulfur_iodine) with an injected table. Pins every id against the native
// registry of luv-c3-s1 (fixtures/luv-b7-registry-ids.json), the patterns' shape and radiation vault rule, the module count in all four
// facings, the parallel cap, the generator contract (no regress, not doubled, a fresh start every run) and the recipes of each mode.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { runServerScripts } from '../lib/kubejs_recipes_sandbox.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PACK = path.join(ROOT, 'pack');
const read = (p) => fs.readFileSync(path.join(PACK, p), 'utf8');
const IDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/analysis/fixtures/luv-b7-registry-ids.json'), 'utf8'));
const STATIONS_PATH = 'kubejs/data/grindless/tables/stations.json';
const STATIONS = JSON.parse(read(STATIONS_PATH));
const PLACES = JSON.parse(read('kubejs/data/grindless/tables/places.json'));
const ORBITS = JSON.parse(read('kubejs/data/grindless/tables/orbits.json'));
const LIBS = ['kubejs/startup_scripts/grindless/lib/orbits.js', 'kubejs/startup_scripts/grindless/lib/places.js',
  'kubejs/startup_scripts/grindless/lib/stations.js'];
const STARTUP = 'kubejs/startup_scripts/grindless/luv/io_orbit.js';
const SERVER = 'kubejs/server_scripts/grindless/luv/io_orbit.js';
const FIXTURE = path.join(ROOT, 'tools/test/overlay/kubejs/server_scripts/gg_test_luv_io_orbit.js');
const OURS = new Set(['gtceu:flux_tube_tether', 'gtceu:sulfur_iodine_plant']);
const ITEMS = new Set([...IDS.items, ...OURS]);
const FLUIDS = new Set(IDS.fluids);

const TABLES = {
  pending: { ...STATIONS, enabled: false, second: 'grindless:io_orbit' },
  tether: { ...STATIONS, enabled: true, second: 'grindless:io_orbit' },
  sulfur_iodine: { ...STATIONS, enabled: true, second: null },
};
const withTable = (table) => (p) => (p === STATIONS_PATH ? JSON.parse(JSON.stringify(table)) : JSON.parse(read(p)));

function recipes(mode) {
  return runServerScripts({
    packRoot: PACK, scripts: [SERVER], recipes: {}, startup: [...LIBS, STARTUP],
    items: (id) => ITEMS.has(id), fluids: (id) => FLUIDS.has(id),
    before(sandbox) { sandbox.global.grindless.readJsonTable = withTable(TABLES[mode]); },
  });
}
const RUNS = Object.fromEntries(Object.keys(TABLES).map((m) => [m, recipes(m)]));
const calls = (r, m) => r.calls.filter((c) => c[0] === m).map((c) => c.slice(1));
const one = (r, m) => { const c = calls(r, m); assert.equal(c.length, 1, `${r.id}: one ${m}`); return c[0]; };
const stackId = (s) => String(s).replace(/^\d+x /, '');

// the startup script with its registries run against recording stubs
function startup(table, extra = {}) {
  const registry = {};
  const builds = [];
  const builder = new Proxy({}, { get(_t, name) { return (...args) => { builds.push([String(name), args]); return builder; }; } });
  const stub = (kind) => (...args) => ({ kind, args });
  const logs = [];
  const G = {
    readJsonTable: withTable(table),
    patterns: { controller: stub('controller'), block: stub('block'), frame: stub('frame'), part: stub('part'), oneOf: stub('oneOf'),
      air: stub('air'), register() {}, build() {} },
    noVoiding: { modifier: (o, n) => ({ noVoiding: o, next: n }), beforeWorking: (o) => ({ before: o }) },
    generators: { modifier: (o) => ({ gen: o }), display: () => () => {} },
    freshRun: { afterWorking: (n) => ({ fresh: n }) },
  };
  const ctx = vm.createContext({
    global: { grindless: G }, console: { info: (...m) => logs.push(['info', m.join(' ')]), error: (...m) => logs.push(['error', m.join(' ')]) },
    GTCEuStartupEvents: { registry(kind, fn) { registry[kind] = fn; } },
    GuiTextures: {}, FillDirection: {}, RotationState: {}, GTSoundEntries: {}, Text: { translate: (x) => x },
    Block: { getBlock: (id) => id }, ...extra,
  });
  for (const f of [...LIBS, STARTUP]) vm.runInContext(read(f), ctx, { filename: f });
  const types = [];
  registry['gtceu:recipe_type']({ create: (id) => { types.push(id); return builder; } });
  registry['gtceu:machine']({ create: (...a) => { builds.push(['create', a]); return builder; } });
  return { G, builds, types, logs };
}

// every block a pattern names, walking oneOf
function patternBlocks(spec) {
  const out = new Set();
  const walk = (p) => {
    if (p.kind === 'block') [].concat(p.args[0]).forEach((id) => out.add(id));
    if (p.kind === 'frame') [].concat(p.args[0]).forEach((m) => out.add(`gtceu:${m}_frame`));
    if (p.kind === 'oneOf') p.args.forEach(walk);
  };
  Object.values(spec.symbols).forEach(walk);
  return out;
}
const count = (spec, ch) => spec.slices.flat().join('').split(ch).length - 1;

test('stations.js: one table, three modes; a bad second orbit is refused', () => {
  // the real table may be in any mode (the coordinator flips it after S0-3); every mode is checked with an injected table
  assert.ok(['pending', 'tether', 'sulfur_iodine'].includes(startup(STATIONS).G.stations.b7));
  assert.ok(ORBITS.dimensions.includes('grindless:io_orbit'));
  for (const [mode, table] of Object.entries(TABLES)) {
    const { G } = startup(table);
    assert.equal(G.stations.b7, mode);
    assert.deepEqual({ ...G.stations.switches }, { stations: table.enabled, tether: mode === 'tether', sulfur_iodine: mode === 'sulfur_iodine' });
  }
  // no station at all (S0-3 failed outright): the fallback too
  assert.equal(startup({ ...STATIONS, enabled: false, second: null }).G.stations.b7, 'sulfur_iodine');
  assert.throws(() => startup({ ...STATIONS, enabled: true, second: 'grindless:io' }), /second must be null or another orbit/);
  assert.throws(() => startup({ ...STATIONS, enabled: true, second: STATIONS.first }), /second must be null or another orbit/);
  // the slot is Io orbit's: another moon's orbit is refused, not silently given a tether written for Io
  assert.throws(() => startup({ ...STATIONS, enabled: true, second: 'grindless:europa_orbit' }), /second must be null or grindless:io_orbit/);
  assert.throws(() => startup({ ...STATIONS, enabled: 'yes' }), /invalid stations table/);
});

test('only the active design is registered: nothing while pending, the tether or the plant otherwise', () => {
  const machines = (b) => b.builds.filter(([n]) => n === 'create').map(([, a]) => a[0]);
  const p = startup(TABLES.pending);
  assert.deepEqual(p.types, []);
  assert.deepEqual(machines(p), []);
  const t = startup(TABLES.tether);
  assert.deepEqual(t.types, ['electrodynamic_tether']);
  assert.deepEqual(machines(t), ['flux_tube_tether']);
  const s = startup(TABLES.sulfur_iodine);
  assert.deepEqual(s.types, ['thermochemical_hydrogen']);
  assert.deepEqual(machines(s), ['sulfur_iodine_plant']);
  for (const b of [p, t, s]) assert.deepEqual(b.logs.filter(([l]) => l === 'error'), []);
});

test('tether: a no-regress, fresh-start generator of two reels; not doubled like a fuel', () => {
  const { builds, G } = startup(TABLES.tether);
  const arg = (name) => (builds.find(([n]) => n === name) || [null, []])[1];
  assert.deepEqual(arg('generator'), [true]);
  assert.deepEqual(arg('regressWhenWaiting'), [false]);
  assert.deepEqual(JSON.parse(JSON.stringify(arg('recipeModifier')[0])), { gen: { maxParallels: 2, name: 'flux_tube_tether' } });
  assert.equal(arg('recipeModifier')[1], true);
  assert.deepEqual(arg('afterWorking'), [{ fresh: 'flux_tube_tether' }]);
  assert.deepEqual(arg('workableCasingModel'), ['grindless:block/luv/station_truss_casing', 'grindless:block/multiblock/flux_tube_tether']);
  assert.equal(G.ioOrbit.tether.site, 'grindless:io_orbit');
  assert.doesNotMatch(read('kubejs/server_scripts/grindless/power/generators.js'), /electrodynamic_tether/);
  for (const f of ['textures/block/multiblock/flux_tube_tether/overlay_front.png', 'textures/block/luv/station_truss_casing.png']) {
    assert.ok(fs.existsSync(path.join(PACK, 'kubejs/assets/grindless', f)), f);
  }
});

test('plant: keeps everything (modifier and beforeWorking) and starts fresh every run', () => {
  const { builds } = startup(TABLES.sulfur_iodine);
  const arg = (name) => (builds.find(([n]) => n === name) || [null, []])[1];
  assert.equal(arg('recipeModifier')[0].noVoiding.which, 'both');
  assert.equal(typeof arg('recipeModifier')[0].next, 'function');
  assert.equal(arg('recipeModifier')[1], true);
  assert.equal(arg('beforeWorking')[0].before.which, 'both');
  assert.deepEqual(arg('afterWorking'), [{ fresh: 'sulfur_iodine_plant' }]);
  assert.equal(builds.some(([n]) => n === 'generator'), false);
  assert.deepEqual(arg('workableCasingModel'), ['grindless:block/luv/radiation_vault_casing', 'grindless:block/multiblock/sulfur_iodine_plant']);
  assert.ok(fs.existsSync(path.join(PACK, 'kubejs/assets/grindless/textures/block/multiblock/sulfur_iodine_plant/overlay_front.png')));
});

test('tether pattern: 5x15x5 deployer, truss edges, vault faces with every part, two 3-gearbox reels, a 10-block stub', () => {
  const s = RUNS.tether.G.ioOrbit.tether.spec;
  assert.equal(s.slices.length, 5);
  s.slices.forEach((rows) => { assert.equal(rows.length, 15); rows.forEach((r) => assert.equal(r.length, 5)); });
  assert.equal(count(s, 'S'), 1);
  assert.equal(count(s, 'H'), 1);
  assert.equal(count(s, 'R'), 6);
  assert.equal(count(s, 'L'), 11);
  assert.equal(count(s, 'T'), 44);
  assert.equal(count(s, 'X'), 51);
  // the stub is one column from the roof up, over the deployer's centre; the port sits on the roof beside it
  for (let ri = 4; ri < 15; ri++) assert.equal(s.slices[2][ri][2], 'L', `row ${ri}`);
  assert.equal(s.slices[1][4][2], 'H');
  assert.equal(s.slices[4][2][2], 'S');
  assert.deepEqual(s.symbols.H, { kind: 'part', args: ['input_hatch', { exact: 1 }] });
  assert.deepEqual(s.symbols.R, { kind: 'block', args: ['gtceu:tungstensteel_gearbox'] });
  assert.deepEqual(s.symbols.T, { kind: 'block', args: ['grindless:station_truss_casing'] });
  assert.deepEqual(s.symbols.L, { kind: 'frame', args: [['aluminium']] });
  const x = s.symbols.X;
  // decision 7: every hatch and bus sits in a vault face; the vault minimum leaves room for exactly the parts' maximum
  assert.deepEqual(x.args[0].args, ['grindless:radiation_vault_casing', { min: 46 }]);
  const parts = x.args.filter((p) => p.kind === 'part');
  assert.deepEqual(parts.map((p) => p.args[0]).sort(), ['energy_output', 'input_bus']);
  const maxParts = parts.reduce((n, p) => n + (p.args[1].max || p.args[1].exact), 0);
  assert.equal(51 - maxParts, 46);
});

test('plant pattern: 11x14x5 on 25 magma, a vault room with every part, Bunsen reactor and HI column, four mirrored module slots', () => {
  const P = RUNS.sulfur_iodine.G.ioOrbit.plant;
  const s = P.spec;
  assert.equal(s.slices.length, 5);
  s.slices.forEach((rows) => { assert.equal(rows.length, 14); rows.forEach((r) => assert.equal(r.length, 11)); });
  assert.equal(count(s, 'M'), 25);
  assert.equal(count(s, 'P'), 25);
  assert.equal(count(s, 'S'), 1);
  assert.equal(count(s, 'X'), 56);
  assert.equal(count(s, 'Q'), 6);
  assert.equal(count(s, 'B'), 27 + 6 * 8);
  for (const m of 'abcd') assert.equal(count(s, m), 27, m);
  assert.deepEqual(s.symbols.M, { kind: 'block', args: ['minecraft:magma_block'] });
  assert.deepEqual(s.symbols.B, { kind: 'block', args: ['gtceu:inert_machine_casing'] });
  assert.deepEqual(s.symbols.Q, { kind: 'block', args: ['gtceu:ptfe_pipe_casing'] });
  assert.deepEqual(s.symbols.a, { kind: 'block', args: ['gtceu:robust_machine_casing'] });
  for (const m of 'bcd') assert.deepEqual(s.symbols[m].args.map((p) => p.kind), ['block', 'air']);
  const x = s.symbols.X;
  assert.deepEqual(x.args[0].args, ['grindless:radiation_vault_casing', { min: 46 }]);
  const parts = x.args.filter((p) => p.kind === 'part');
  assert.deepEqual(parts.map((p) => p.args[0]).sort(), ['energy_input', 'input_bus', 'input_hatch', 'output_hatch']);
  assert.equal(56 - parts.reduce((n, p) => n + p.args[1].max, 0), 46);
  const key = (c) => `${c.up}:${c.back}:${c.side}`;
  const all = new Set(P.moduleCells.flat().map(key));
  assert.equal(all.size, 108);
  for (const c of P.moduleCells.flat()) {
    assert.ok(all.has(key({ ...c, side: -c.side })));
    assert.ok(all.has(key({ ...c, back: 4 - c.back })));
  }
});

test('plant: complete decomposer modules are counted in the world for every facing', () => {
  const { G } = startup(TABLES.sulfur_iodine);
  const P = G.ioOrbit.plant;
  const step = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] };
  for (const facing of Object.keys(step)) {
    const st = step[facing];
    const placed = new Set();
    const place = (cells) => cells.forEach((p) => placed.add(`${-st[0] * p.back + st[1] * p.side}:${p.up}:${-st[1] * p.back - st[0] * p.side}`));
    const machine = {
      getLevel: () => ({ getBlockState: (p) => ({ is: (b) => b === 'gtceu:robust_machine_casing' && placed.has(`${p.x}:${p.y}:${p.z}`) }) }),
      getFrontFacing: () => facing,
      getPos: () => ({ offset: (x, y, z) => ({ x, y, z }) }),
    };
    assert.equal(P.modules(machine), 0, facing);
    place(P.moduleCells[0]);
    assert.equal(P.modules(machine), 1, facing);
    place(P.moduleCells[1]);
    place(P.moduleCells[2].slice(0, 26));
    assert.equal(P.modules(machine), 2, `${facing}: a partial module does not count`);
    place(P.moduleCells[2]);
    place(P.moduleCells[3]);
    assert.equal(P.modules(machine), 4, facing);
  }
});

test('plant: one parallel per module, capped by the energy hatches, never more than GTM\'s ParallelLogic allows', () => {
  const asked = [];
  const built = [];
  const chain = { inputModifier: (x) => { built.push(['in', x]); return chain; }, outputModifier: (x) => { built.push(['out', x]); return chain; },
    eutMultiplier: (x) => { built.push(['eut', x]); return chain; }, parallels: (x) => { built.push(['par', x]); return chain; }, build: () => 'built' };
  const classes = {
    'com.gregtechceu.gtceu.api.recipe.content.ContentModifier': { multiplier: (n) => `x${n}` },
    'com.gregtechceu.gtceu.api.recipe.modifier.ParallelLogic': { getParallelAmountWithoutEU: (m, r, n) => { asked.push(n); return Math.min(n, m.fit); } },
    'com.gregtechceu.gtceu.api.recipe.RecipeHelper': { getRealEUtWithIO: () => ({ isEmpty: () => false, isInput: () => true, getTotalEU: () => 30 }) },
  };
  const { G } = startup(TABLES.sulfur_iodine, {
    Java: { loadClass: (n) => classes[n] }, ModifierFunction: { NULL: 'NULL', builder: () => chain },
  });
  const P = G.ioOrbit.plant;
  const machineWith = (modules, volts, fit) => {
    const placed = new Set();
    P.moduleCells.slice(0, modules).flat().forEach((p) => placed.add(`${-p.side}:${p.up}:${p.back}`));
    return {
      fit,
      getOverclockVoltage: () => volts,
      getLevel: () => ({ getBlockState: (q) => ({ is: () => placed.has(`${q.x}:${q.y}:${q.z}`) }) }),
      getFrontFacing: () => 'north',
      getPos: () => ({ offset: (x, y, z) => ({ x, y, z }) }),
    };
  };
  assert.equal(P.modifier(machineWith(4, 8192, 99), {}), 'built');
  assert.deepEqual(asked, [4]);
  assert.deepEqual(built, [['in', 'x4'], ['out', 'x4'], ['eut', 4], ['par', 4]]);
  // an LV hatch (32 V) carries one 30 EU/t copy
  P.modifier(machineWith(4, 32, 99), {});
  assert.equal(asked.at(-1), 1);
  // the inputs or the output room allow fewer copies
  built.length = 0;
  P.modifier(machineWith(3, 8192, 2), {});
  assert.deepEqual(built, [['in', 'x2'], ['out', 'x2'], ['eut', 2], ['par', 2]]);
  assert.equal(P.modifier(machineWith(0, 8192, 99), {}), 'NULL');
});

test('recipes follow the switch: none while pending', () => {
  assert.deepEqual(RUNS.pending.built, []);
  for (const m of Object.keys(RUNS)) assert.deepEqual(RUNS[m].logs.filter(([l]) => l === 'error'), [], m);
});

test('tether mode: Io orbit only, two reels of 65,536 EU/t, a spool an hour, 50 mB of argon a run; the spool and the controller', () => {
  const byId = Object.fromEntries(RUNS.tether.built.map((r) => [r.id, r]));
  assert.deepEqual(Object.keys(byId).sort(), ['grindless:luv/tether_spool', 'grindless:plasma_torus', 'gtceu:flux_tube_tether']);
  const t = byId['grindless:plasma_torus'];
  assert.equal(t.type, 'gtceu:electrodynamic_tether');
  assert.deepEqual(one(t, 'circuit'), [1]);
  assert.deepEqual(one(t, 'chancedInput'), ['grindless:tether_spool', 28, 0]);
  assert.deepEqual(one(t, 'inputFluids'), [{ fluid: 'gtceu:argon', amount: 25 }]);
  assert.deepEqual(one(t, 'EUt'), [-65536]);
  assert.deepEqual(one(t, 'duration'), [400]);
  assert.deepEqual(calls(t, 'dimension'), [['grindless:io_orbit']]);
  const reels = RUNS.tether.G.ioOrbit.tether.reels;
  assert.equal(65536 * reels, 131072);
  assert.equal(25 * reels, 50);
  const runsPerHour = (3600 * 20) / 400;
  assert.ok(Math.abs((28 * reels / 10000) * runsPerHour - 1) < 0.01);
  const s = byId['grindless:luv/tether_spool'];
  assert.equal(s.type, 'gtceu:assembler');
  assert.deepEqual(one(s, 'itemInputs'), ['64x gtceu:aluminium_foil', '8x gcyr:para_aramid_foil', 'grindless:whipple_shield_casing']);
  assert.deepEqual(one(s, 'itemOutputs'), ['grindless:tether_spool']);
  assert.deepEqual(one(s, 'EUt'), [7680]);
  assert.deepEqual(one(s, 'duration'), [400]);
  assert.equal(byId['gtceu:flux_tube_tether'].type, 'gtceu:shaped');
  assert.deepEqual(one(byId['gtceu:flux_tube_tether'], 'id'), ['grindless:crafting/flux_tube_tether']);
});

test('sulfur-iodine mode: Io only, water to hydrogen and oxygen over kept charges, 20 mB of hydrogen a tick with four modules', () => {
  const byId = Object.fromEntries(RUNS.sulfur_iodine.built.map((r) => [r.id, r]));
  assert.deepEqual(Object.keys(byId).sort(), ['grindless:sulfur_iodine', 'gtceu:sulfur_iodine_plant']);
  const r = byId['grindless:sulfur_iodine'];
  assert.equal(r.type, 'gtceu:thermochemical_hydrogen');
  assert.deepEqual(one(r, 'circuit'), [1]);
  assert.deepEqual(one(r, 'inputFluids'), [{ fluid: 'minecraft:water', amount: 1000 }]);
  assert.deepEqual(one(r, 'notConsumableFluid'), [{ fluid: 'gtceu:sulfuric_acid', amount: 2000 }]);
  assert.deepEqual(one(r, 'notConsumable'), ['8x gtceu:iodine_dust']);
  assert.deepEqual(one(r, 'outputFluids'), [{ fluid: 'gtceu:hydrogen', amount: 2000 }, { fluid: 'gtceu:oxygen', amount: 1000 }]);
  assert.deepEqual(one(r, 'EUt'), [30]);
  assert.deepEqual(one(r, 'duration'), [400]);
  assert.deepEqual(calls(r, 'dimension'), [[PLACES.surfaces.io]]);
  assert.equal(2000 / 400 * RUNS.sulfur_iodine.G.ioOrbit.plant.maxModules, 20);
  assert.deepEqual(one(byId['gtceu:sulfur_iodine_plant'], 'id'), ['grindless:crafting/sulfur_iodine_plant']);
  // no spool in this mode: it stays an A1 registration with no route, hidden (its group says unless tether)
  assert.ok(!JSON.stringify(RUNS.sulfur_iodine.built).includes('tether_spool'));
});

test('every id is in the native registry snapshot (luv-c3-s1); dimension ids only from the tables', () => {
  const used = new Set();
  for (const mode of ['tether', 'sulfur_iodine']) {
    for (const r of RUNS[mode].built) {
      for (const m of ['itemInputs', 'itemOutputs', 'chancedInput', 'notConsumable']) for (const args of calls(r, m)) {
        (m === 'chancedInput' ? [args[0]] : args.flat()).forEach((s) => { const id = stackId(s); if (!id.startsWith('#')) used.add(id); });
      }
      if (r.type === 'gtceu:shaped') used.add(r.id);
      for (const m of ['inputFluids', 'outputFluids', 'notConsumableFluid']) for (const args of calls(r, m)) {
        args.forEach((f) => assert.ok(FLUIDS.has(f.fluid), `${r.id}: fluid ${f.fluid}`));
      }
    }
  }
  const IOO = RUNS.tether.G.ioOrbit;
  for (const spec of [IOO.tether.spec, IOO.plant.spec]) patternBlocks(spec).forEach((id) => used.add(id));
  for (const id of used) assert.ok(ITEMS.has(id), `unknown id ${id}`);
  const src = read(SERVER);
  for (const id of ['gtceu:luv_electric_motor', 'gtceu:luv_electric_pump', 'gtceu:luv_sensor', 'gtceu:luv_machine_hull']) {
    assert.match(src, new RegExp(`'${id}'`));
    assert.ok(ITEMS.has(id), id);
  }
  // the traps: the LuV dynamo is an energy output hatch; GTM has no quadruple output hatch id
  assert.ok(!IDS.items.includes('gtceu:luv_dynamo_hatch'));
  for (const f of [STARTUP, SERVER]) assert.doesNotMatch(read(f), /'grindless:io(_orbit)?'/, f);
});

test('controller recipes match no other shaped recipe of the pack', () => {
  const dir = path.join(PACK, 'kubejs/server_scripts');
  const files = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : files.push(path.join(d, e.name))));
  walk(dir);
  for (const shape of ["['MSM', 'CHC', 'C C']", "['PSP', 'CHC', 'C C']"]) {
    const hits = files.filter((f) => f.endsWith('.js') && fs.readFileSync(f, 'utf8').includes(shape));
    assert.deepEqual(hits.map((f) => path.relative(dir, f).replace(/\\/g, '/')), ['grindless/luv/io_orbit.js'], shape);
  }
});

test('names: en_us and es_es carry the same keys, every key the machines translate', () => {
  const src = read('kubejs/client_scripts/grindless/luv_io_orbit_lang.js');
  const [en, es] = src.split("ClientEvents.lang('es_es'");
  const keys = (s) => [...s.matchAll(/add\('([^']+)'/g)].map((m) => m[1]).sort();
  assert.deepEqual(keys(en), keys(es));
  const used = [...read(STARTUP).matchAll(/'(grindless\.machine\.[a-z_.0-9]+)'/g)].map((m) => m[1]);
  for (const k of used) if (!/\.$/.test(k)) assert.ok(keys(en).includes(k), k);
  for (const k of ['block.gtceu.flux_tube_tether', 'block.gtceu.sulfur_iodine_plant', 'gtceu.electrodynamic_tether', 'gtceu.thermochemical_hydrogen']) {
    assert.ok(keys(en).includes(k), k);
  }
});

test('the spool stays hidden unless the tether is the active design', () => {
  const table = JSON.parse(read('kubejs/data/grindless/tables/hidden_until.json'));
  const g = table.groups.find((x) => x.material === 'grindless:tether_spool');
  assert.ok(g, 'the spool keeps its hidden-table group');
  assert.equal(g.unless, 'tether');
  assert.ok('tether' in startup(TABLES.pending).G.stations.switches);
});

test('the native fixture uses only registered ids and its own band', { skip: !fs.existsSync(FIXTURE) && 'fixture not written yet' }, () => {
  const src = fs.readFileSync(FIXTURE, 'utf8');
  assert.doesNotThrow(() => new vm.Script(src));
  const literal = new Set([...src.matchAll(/'([a-z0-9_]+:[a-z0-9_/]+)'/g)].map((m) => m[1]));
  const known = new Set([...ITEMS, ...FLUIDS, 'grindless:io_orbit', 'gtceu:electrodynamic_tether', 'gtceu:thermochemical_hydrogen',
    'minecraft:air', 'minecraft:overworld', 'grindless:sulfur_iodine', 'grindless:plasma_torus', 'grindless:luv/tether_spool', 'grindless:crafting/flux_tube_tether',
    'grindless:crafting/sulfur_iodine_plant', 'grindless:hidden_with_recipes', 'c:hidden_from_recipe_viewers']);
  for (const id of literal) {
    if (/^(gtceu|grindless):(electrodynamic_tether|thermochemical_hydrogen|assembler|shaped)\//.test(id)) continue;
    assert.ok(known.has(id), `fixture id ${id}`);
  }
  assert.match(src, /18432/);
  assert.match(src, /18495/);
});
