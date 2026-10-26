import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const source = p => fs.readFileSync(path.join(root, ...p.split('/')), 'utf8');
const table = JSON.parse(source('pack/kubejs/data/grindless/tables/orbits.json'));
function harness() {
  const registry = {};
  const G = {
    readJsonTable: () => table,
    patterns: {
      controller: () => ({ kind: 'controller' }), block: () => ({}), frame: () => ({}),
      part: () => ({}), oneOf: () => ({}),
      register(id, spec) { G.spec = spec; }, build() {}
    },
    generators: { configure: b => b },
    freshRun: { afterWorking: () => () => {} }
  };
  const builds = [];
  const builder = new Proxy({}, { get(_t, name) { return (...args) => { builds.push([name, args]); return builder; }; } });
  const context = vm.createContext({
    global: { grindless: G },
    GTCEuStartupEvents: { registry(kind, fn) { registry[kind] = fn; } },
    GuiTextures: {}, FillDirection: {}, RotationState: {}, Text: { translate: x => x }
  });
  vm.runInContext(source('pack/kubejs/startup_scripts/grindless/lib/orbits.js'), context);
  vm.runInContext(source('pack/kubejs/startup_scripts/grindless/luv/orbital_solar.js'), context);
  registry['gtceu:recipe_type']({ create: () => builder });
  registry['gtceu:machine']({ create: () => builder });
  return { G, builds, context };
}
test('orbital table is a unique explicit allowlist; recipes OR all orbit conditions', () => {
  const { G } = harness();
  const dimensions = [];
  const recipe = { dimension(id) { dimensions.push(id); } };
  assert.equal(G.orbits.allow(recipe), recipe);
  assert.deepEqual(dimensions, table.dimensions);
  assert.equal(new Set(table.dimensions).size, table.dimensions.length);
  assert.ok(table.dimensions.includes(table.earth));
  assert.ok(!table.dimensions.includes('minecraft:overworld'));
});
test('orbital station is 19x3x9 with exactly 64 wing panels and one front controller', () => {
  const { G, builds } = harness();
  assert.equal(G.spec.slices.length, 9);
  let panels = 0, controllers = 0;
  G.spec.slices.forEach((slice, i) => {
    assert.equal(slice.length, 3);
    slice.forEach(row => {
      assert.equal(row.length, 19);
      panels += [...row].filter(c => c === 'P').length;
      if (row.includes('S')) { assert.equal(i, 8); controllers++; }
    });
  });
  assert.equal(panels, 64);
  assert.equal(controllers, 1);
  assert.equal(G.orbitalSolar.duration, 400);
  assert.ok(builds.some(([name]) => name === 'afterWorking'));
});
test('sky exposure counts all four orientations, including fully and partly covered panels', () => {
  const { G } = harness();
  for (const facing of ['north', 'south', 'east', 'west']) {
    const positions = [];
    let covered = 0;
    const pos = { offset(x,y,z) { return { above() { return {x,y:y+1,z}; } }; } };
    const machine = {
      getPos: () => pos, getFrontFacing: () => facing,
      getLevel: () => ({ canSeeSky(p) { positions.push(p); return positions.length > covered; } })
    };
    assert.equal(G.orbitalSolar.litPanels(machine), 64);
    assert.equal(new Set(positions.map(p => `${p.x}:${p.y}:${p.z}`)).size, 64);
    const step = { north: [0,-1], south: [0,1], east: [1,0], west: [-1,0] }[facing];
    const expected = [];
    for (let back = 4; back <= 7; back++) {
      for (let side = -9; side <= 9; side++) {
        if (Math.abs(side) < 2) continue;
        expected.push(`${-step[0]*back+step[1]*side}:2:${-step[1]*back-step[0]*side}`);
      }
    }
    assert.deepEqual(positions.map(p => `${p.x}:${p.y}:${p.z}`).sort(), expected.sort());
    positions.length = 0; covered = 1;
    assert.equal(G.orbitalSolar.litPanels(machine), 63);
    positions.length = 0; covered = 64;
    assert.equal(G.orbitalSolar.litPanels(machine), 0);
  }
});
test('solar output derives from authoritative sunlight; no nighttime or fuel doubling', () => {
  const { G, context } = harness();
  const recipes = [];
  G.readJsonTable = () => ({ sites: [{ dimension: table.earth, factor: 1.4 }] });
  const api = new Proxy({}, {
    get(_t, type) { return id => {
      const r = { type, id, calls: {} };
      const b = new Proxy({}, { get(_o, method) { return (...args) => { r.calls[method] = args; return b; }; } });
      recipes.push(r); return b;
    }; }
  });
  context.ServerEvents = { recipes: fn => fn({ recipes: { gtceu: api } }) };
  vm.runInContext(source('pack/kubejs/server_scripts/grindless/luv/orbital_solar.js'), context);
  const solar = recipes.find(r => r.type === 'orbital_solar');
  assert.deepEqual(Array.from(solar.calls.EUt), [-630]);
  assert.equal(solar.calls.EUt[0] * -64, 40320);
  assert.equal(40320 * 0.95, 38304);
  assert.deepEqual(Array.from(solar.calls.duration), [400]);
  assert.equal(solar.calls.daytime, undefined);
  assert.deepEqual(Array.from(solar.calls.dimension), [table.earth]);
  assert.equal(recipes.length, 4);
});
test('solar generator uses proven helper, no fuel multiplier and current run-start pricing', () => {
  const s = source('pack/kubejs/startup_scripts/grindless/luv/orbital_solar.js');
  assert.match(s, /G\.generators\.configure/);
  assert.match(s, /maxParallels: litPanels/);
  assert.match(s, /G\.freshRun\.afterWorking/);
  const generators = source('pack/kubejs/server_scripts/grindless/power/generators.js');
  assert.doesNotMatch(generators, /['"](?:gtceu:)?orbital_solar['"]/);
});
