// LuV B6, Io's surface: the fumarole condenser and the volcanic intake (startup_scripts/grindless/luv/io_surface.js and
// server_scripts/grindless/luv/io_surface.js). Pins every id against a native registry snapshot (fixtures/luv-b6-registry-ids.json)
// and A1's registrations, Io's id to the places table, the patterns' shape and radiation vault rule, the module count of the intake in
// all four facings, the recipes' lookup keys and the generator contract (no regress, no fuel doubling, a fresh start every run).
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
const IDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/analysis/fixtures/luv-b6-registry-ids.json'), 'utf8'));
const PLACES = JSON.parse(read('kubejs/data/grindless/tables/places.json'));
const STARTUP = 'kubejs/startup_scripts/grindless/luv/io_surface.js';
const SERVER = 'kubejs/server_scripts/grindless/luv/io_surface.js';

function a1() {
  const { G } = runServerScripts({
    packRoot: PACK, scripts: [], startup: ['kubejs/startup_scripts/grindless/luv/foundation.js'], recipes: {},
    before(sandbox) { sandbox.global.grindless.tables = {}; },
  });
  return G.luvFoundation;
}
const A1 = a1();
const OURS = new Set(['gtceu:fumarole_condenser', 'gtceu:volcanic_intake']);
const ITEMS = new Set([...IDS.items, ...A1.items, ...A1.blocks, A1.ids.denseTitaniumPlate, ...OURS]);
const FLUIDS = new Set(IDS.fluids);

function run() {
  const asked = { items: new Set(), fluids: new Set() };
  const r = runServerScripts({
    packRoot: PACK, scripts: [SERVER], recipes: {},
    startup: ['kubejs/startup_scripts/grindless/lib/places.js', STARTUP],
    items: (id) => { asked.items.add(id); return ITEMS.has(id); },
    fluids: (id) => { asked.fluids.add(id); return FLUIDS.has(id); },
  });
  return { ...r, asked };
}
const RUN = run();
const IO = RUN.G.ioSurface;
const calls = (r, m) => r.calls.filter((c) => c[0] === m).map((c) => c.slice(1));
const one = (r, m) => { const c = calls(r, m); assert.equal(c.length, 1, `${r.id}: one ${m}`); return c[0]; };
const stackId = (s) => String(s).replace(/^\d+x /, '');

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

test('Io is read only from the places table', () => {
  assert.equal(PLACES.surfaces.io, 'grindless:io');
  for (const f of [STARTUP, SERVER]) assert.doesNotMatch(read(f), /grindless:io['"]/, f);
  const onIo = RUN.built.filter((r) => calls(r, 'dimension').length > 0);
  assert.deepEqual(onIo.map((r) => r.id).sort(),
    ['grindless:collect', 'grindless:patera', 'grindless:sulfur_concrete_basalt', 'grindless:sulfur_concrete_black_sand']);
  for (const r of onIo) assert.deepEqual(calls(r, 'dimension'), [[PLACES.surfaces.io]], r.id);
});

test('every id is in the native registry snapshot or registered by A1/B6', () => {
  assert.deepEqual(RUN.logs.filter(([l]) => l === 'error'), []);
  const used = new Set();
  for (const r of RUN.built) {
    for (const m of ['itemInputs', 'itemOutputs', 'chancedInput']) for (const args of calls(r, m)) {
      (m === 'chancedInput' ? [args[0]] : args).forEach((s) => used.add(stackId(s)));
    }
    if (r.type === 'gtceu:shaped') used.add(r.id);
    for (const m of ['inputFluids', 'outputFluids', 'notConsumableFluid']) for (const args of calls(r, m)) {
      args.forEach((f) => assert.ok(FLUIDS.has(f.fluid), `${r.id}: fluid ${f.fluid}`));
    }
  }
  for (const spec of [IO.condenser.spec, IO.intake.spec]) patternBlocks(spec).forEach((id) => used.add(id));
  for (const id of used) assert.ok(ITEMS.has(id), `unknown id ${id}`);
  // the traps of the brief: HSS-S is hsss, the LuV dynamo is an energy output hatch
  assert.ok(used.has('gtceu:hsss_frame'));
  assert.ok(!IDS.items.includes('gtceu:luv_dynamo_hatch'));
  for (const id of ['grindless:ionian_sublimate', 'grindless:heat_exchanger_bundle', 'grindless:radiation_vault_casing',
    'grindless:sulfur_concrete_casing']) {
    assert.equal(A1.packages[id], 'B6', id);
    assert.ok(used.has(id), id);
  }
});

test('shaped controller recipes use real parts', () => {
  const src = read(SERVER);
  for (const id of ['gtceu:luv_electric_pump', 'gtceu:luv_electric_motor', 'gtceu:luv_machine_hull']) {
    assert.match(src, new RegExp(`'${id}'`));
    assert.ok(ITEMS.has(id), id);
  }
});

test('condenser: 5x15x5, three fumaroles under the column, vault housing with every part', () => {
  const s = IO.condenser.spec;
  assert.equal(s.slices.length, 5);
  let fumaroles = 0, controllers = 0;
  s.slices.forEach((rows, si) => {
    assert.equal(rows.length, 15);
    rows.forEach((row, ri) => {
      assert.equal(row.length, 5);
      for (let ci = 0; ci < 5; ci++) {
        if (row[ci] === 'F') { fumaroles++; assert.equal(ri, 0); assert.equal(ci, 2); }
        if (row[ci] === 'S') { controllers++; assert.equal(si, 4); }
      }
    });
  });
  assert.equal(fumaroles, IO.condenser.fumaroles);
  assert.equal(controllers, 1);
  assert.deepEqual(s.symbols.F, { kind: 'block', args: ['biomesoplenty:brimstone_fumarole'] });
  const x = s.symbols.X;
  assert.deepEqual(x.args[0].args, ['grindless:radiation_vault_casing', { min: 24 }]);
  const parts = x.args.filter((p) => p.kind === 'part').map((p) => p.ability || p.args[0]);
  assert.deepEqual(parts.sort(), ['energy_input', 'input_bus', 'input_hatch', 'output_bus', 'output_hatch', 'parallel_hatch']);
});

test('intake: 11x12x5 on magma, vault room, four mirrored 3x3x3 module slots', () => {
  const s = IO.intake.spec;
  assert.equal(s.slices.length, 5);
  const count = (ch) => s.slices.flat().join('').split(ch).length - 1;
  s.slices.forEach((rows) => { assert.equal(rows.length, 12); rows.forEach((r) => assert.equal(r.length, 11)); });
  assert.equal(count('M'), 9);
  assert.equal(count('S'), 1);
  for (const m of 'abcd') assert.equal(count(m), 27, m);
  assert.deepEqual(s.symbols.M, { kind: 'block', args: ['minecraft:magma_block'] });
  assert.deepEqual(s.symbols.a, { kind: 'block', args: ['gtceu:titanium_turbine_casing'] });
  for (const m of 'bcd') assert.deepEqual(s.symbols[m].args.map((p) => p.kind), ['block', 'air']);
  assert.deepEqual(s.symbols.X.args[0].args, ['grindless:radiation_vault_casing', { min: 30 }]);
  const key = (c) => `${c.up}:${c.back}:${c.side}`;
  const all = new Set(IO.intake.moduleCells.flat().map(key));
  assert.equal(all.size, 108);
  // mirror images left-right and front-back: the count does not depend on how columns or slices run
  for (const c of IO.intake.moduleCells.flat()) {
    assert.ok(all.has(key({ ...c, side: -c.side })));
    assert.ok(all.has(key({ ...c, back: 4 - c.back })));
  }
});

function startupHarness() {
  const registry = {};
  const builds = [];
  const builder = new Proxy({}, { get(_t, name) { return (...args) => { builds.push([String(name), args]); return builder; }; } });
  const stub = (kind) => (...args) => ({ kind, args });
  const G = {
    readJsonTable: (p) => JSON.parse(read(p)),
    patterns: { controller: stub('controller'), block: stub('block'), frame: stub('frame'), part: stub('part'), oneOf: stub('oneOf'),
      air: stub('air'), register() {}, build() {} },
    parallelHatch: { part: stub('ph'), modifier: (n) => n, overclock: () => null },
    noVoiding: { modifier: (o, n) => ({ noVoiding: o, next: n }), beforeWorking: (o) => ({ before: o }) },
    generators: { modifier: (o) => ({ gen: o }), display: () => () => {} },
    freshRun: { afterWorking: (n) => ({ fresh: n }) },
  };
  const ctx = vm.createContext({
    global: { grindless: G }, console,
    GTCEuStartupEvents: { registry(kind, fn) { registry[kind] = fn; } },
    GuiTextures: {}, FillDirection: {}, RotationState: {}, GTSoundEntries: {}, Text: { translate: (x) => x },
    Block: { getBlock: (id) => id },
  });
  vm.runInContext(read('kubejs/startup_scripts/grindless/lib/places.js'), ctx);
  vm.runInContext(read(STARTUP), ctx);
  registry['gtceu:recipe_type']({ create: () => builder });
  registry['gtceu:machine']({ create: (...a) => { builds.push(['create', a]); return builder; } });
  return { G, builds };
}

test('complete turbine modules are counted in the world for every facing', () => {
  const { G } = startupHarness();
  const I = G.ioSurface.intake;
  const step = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] };
  for (const facing of Object.keys(step)) {
    const st = step[facing];
    const turbines = new Set();
    const place = (cells) => cells.forEach((p) => turbines.add(`${-st[0] * p.back + st[1] * p.side}:${p.up}:${-st[1] * p.back - st[0] * p.side}`));
    const machine = {
      getLevel: () => ({ getBlockState: (p) => ({ is: (b) => b === 'gtceu:titanium_turbine_casing' && turbines.has(`${p.x}:${p.y}:${p.z}`) }) }),
      getFrontFacing: () => facing,
      getPos: () => ({ offset: (x, y, z) => ({ x, y, z }) }),
    };
    place(I.moduleCells[0]);
    assert.equal(I.modules(machine), 1, facing);
    place(I.moduleCells[1]);
    assert.equal(I.modules(machine), 2, facing);
    place(I.moduleCells[2].slice(0, 26));
    assert.equal(I.modules(machine), 2, `${facing}: a partial module does not count`);
    place(I.moduleCells[2]);
    place(I.moduleCells[3]);
    assert.equal(I.modules(machine), 4, facing);
  }
});

test('machines: condenser keeps everything and takes the parallel hatch; intake is a no-regress fresh-start generator', () => {
  const { builds } = startupHarness();
  const at = (name) => builds.findIndex(([n, a]) => n === 'create' && a[0] === name);
  const cond = builds.slice(at('fumarole_condenser'), at('volcanic_intake'));
  const intake = builds.slice(at('volcanic_intake'));
  const arg = (list, name) => (list.find(([n]) => n === name) || [null, []])[1];
  assert.equal(arg(cond, 'recipeModifier')[0].noVoiding.which, 'both');
  assert.equal(arg(cond, 'recipeModifier')[1], true);
  assert.equal(arg(cond, 'beforeWorking')[0].before.which, 'both');
  assert.deepEqual(arg(intake, 'generator'), [true]);
  assert.deepEqual(arg(intake, 'regressWhenWaiting'), [false]);
  assert.equal(arg(intake, 'recipeModifier')[1], true);
  assert.equal(typeof arg(intake, 'recipeModifier')[0].gen.maxParallels, 'function');
  assert.deepEqual(arg(intake, 'afterWorking'), [{ fresh: 'volcanic_intake' }]);
  const lib = read('kubejs/startup_scripts/grindless/lib/parallel_hatch.js');
  assert.match(lib, /'gtceu:fumarole_condenser'/);
  // the fuel-free intake is not doubled like a fuel
  assert.doesNotMatch(read('kubejs/server_scripts/grindless/power/generators.js'), /volcanic_heat/);
});

test('recipes: one lookup path each; the intake pays 32,768 EU/t per module from a kept SO2 charge', () => {
  const byType = {};
  for (const r of RUN.built) (byType[r.type] = byType[r.type] || []).push(r);
  const cond = byType['gtceu:fumarole_condensing'];
  assert.equal(cond.length, 4);
  const keys = cond.map((r) => JSON.stringify([calls(r, 'circuit'), calls(r, 'itemInputs').flat().map(stackId).sort(),
    calls(r, 'inputFluids').flat().map((f) => f.fluid)]));
  assert.equal(new Set(keys).size, cond.length);
  const c = Object.fromEntries(cond.map((r) => [r.id, r]));
  assert.deepEqual(one(c['grindless:collect'], 'circuit'), [1]);
  assert.deepEqual(calls(c['grindless:collect'], 'itemInputs'), []);
  assert.deepEqual(one(c['grindless:collect'], 'outputFluids'), [{ fluid: 'gtceu:sulfur_dioxide', amount: 4000 }]);
  assert.deepEqual(one(c['grindless:collect'], 'itemOutputs'), ['8x gtceu:sulfur_dust', '1x grindless:ionian_sublimate']);
  assert.deepEqual(one(c['grindless:separate'], 'circuit'), [2]);
  assert.deepEqual(one(c['grindless:separate'], 'notConsumableFluid'), [{ fluid: 'gtceu:hydrochloric_acid', amount: 1000 }]);
  assert.deepEqual(calls(c['grindless:separate'], 'dimension'), []);
  assert.deepEqual(one(c['grindless:separate'], 'itemOutputs'), ['2x gtceu:germanium_dust', '1x gtceu:indium_dust']);
  for (const n of ['basalt', 'black_sand']) assert.deepEqual(one(c[`grindless:sulfur_concrete_${n}`], 'circuit'), [3]);
  const [heat] = byType['gtceu:volcanic_heat'];
  assert.equal(byType['gtceu:volcanic_heat'].length, 1);
  assert.deepEqual(one(heat, 'EUt'), [-32768]);
  assert.deepEqual(one(heat, 'duration'), [400]);
  assert.deepEqual(one(heat, 'notConsumableFluid'), [{ fluid: 'gtceu:sulfur_dioxide', amount: 4000 }]);
  assert.deepEqual(one(heat, 'chancedInput'), ['grindless:heat_exchanger_bundle', 56, 0]);
  assert.equal(32768 * IO.intake.maxModules, 131072);
  assert.equal(Math.round(10000 / (3600 * 20 / 400)), 56);
  const vault = RUN.built.find((r) => r.id === 'grindless:luv/radiation_vault_casing');
  assert.deepEqual(one(vault, 'itemInputs'), ['2x gtceu:dense_titanium_plate', '2x gtceu:tantalum_plate', 'gtceu:hsss_frame']);
});
