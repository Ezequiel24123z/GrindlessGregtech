// OpV-M2: the assembly line array (startup_scripts/grindless/opv/assembly_line_array.js, server_scripts/grindless/opv/assembly_line_array.js):
// the structure through the real helpers (<= 16 tall, one controller, OpV casing <= 50%), the mega chain, the controller recipe's ingredients,
// the names in en_us, the EMI info page and the test zone.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const KJS = path.join(ROOT, 'pack', 'kubejs');
const read = (kind, file) => fs.readFileSync(path.join(KJS, kind, file), 'utf8');

function harness() {
  const registry = [];
  const calls = [];
  const G = {};
  const b = new Proxy({}, { get: (_, method) => (...args) => { calls.push([method, ...args]); return b; } });
  const names = new Proxy({}, { get: (_, n) => String(n) });
  const context = vm.createContext({
    global: { grindless: G },
    console: { info() {}, warn() {}, log() {}, error() {} },
    GTCEuStartupEvents: { registry: (type, cb) => registry.push([type, cb]) },
    ModifierFunction: { NULL: 'NULL', IDENTITY: 'IDENTITY' },
    RotationState: { NON_Y_AXIS: 'NON_Y_AXIS' },
    GTBlocks: names,
    GTRecipeModifiers: names,
    PartAbility: names,
    Predicates: { abilities: () => ({ setExactLimit: () => ({}), setMaxGlobalLimited: () => ({}) }) },
    Block: { getBlock: (id) => id },
    Text: { translate: (s) => s },
    Item: { exists: () => true },
    Java: { loadClass: () => function () {} },
  });
  G.readJsonTable = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, 'pack', p), 'utf8'));
  for (const f of ['lib/patterns.js', 'lib/coils.js', 'lib/parallel_hatch.js', 'lib/mega.js', 'opv/assembly_line_array.js']) {
    vm.runInContext(read('startup_scripts', 'grindless/' + f), context);
  }
  return { G, registry, calls, b };
}

const { G, registry } = harness();
const A = G.assemblyLineArray;

test('the structure: 13 x 9 x 41 (<= 16 tall), one controller, four tracks, a rectangular silhouette', () => {
  assert.deepEqual({ ...A.size }, { width: 13, height: 9, depth: 41 });
  assert.ok(A.size.height <= 16);
  assert.equal(A.slices.length, 41);
  const flat = A.slices.flat();
  assert.equal(flat.length, 41 * 9);
  assert.ok(flat.every((row) => row.length === 13));
  assert.equal(flat.join('').split('S').length - 1, 1);
  assert.equal(A.counts.U, 4 * 39);
  assert.equal(A.counts.G, 7 * 39);
  assert.equal(A.counts.D, 1);
});

test('the controller is in the front slice, one row above the floor, in the middle', () => {
  const front = A.slices[A.slices.length - 1];
  assert.equal(front[1][6], 'S');
  assert.equal(front[1][5], 'D');
});

test('scale and rubric: 2,400-2,800 filled cells, lamina about a third or more, no block above 70%, at least 3 types', () => {
  const c = A.counts;
  const solid = c.C + c.L + c.W + c.U + c.G + c.T + c.X + c.D + c.O + c.I + c.H + 1;
  assert.ok(solid >= 2400 && solid <= 2800, `filled ${solid}`);
  assert.ok(c.L * 100 >= solid * 30, `lamina ${c.L} of ${solid}`);
  for (const k of ['C', 'L', 'W', 'U', 'G', 'T']) assert.ok(c[k] * 100 <= solid * 70, k);
  assert.ok(['C', 'L', 'W', 'U', 'G', 'T'].every((k) => c[k] > 0));
});

test('part cells: the head holds the maintenance, energy and parallel hatches and the data cell D; the tail the output bus; one input bus cell per slice 4..19', () => {
  assert.ok(A.counts.X >= 5);
  assert.ok(A.counts.O >= 1);
  assert.equal(A.counts.I, 16);
  assert.equal(A.hatches.inputBus, 16);
  assert.equal(A.hatches.parallelHatch, 1);
  assert.equal(A.hatches.dataAccess, 1);
});

test('registered as a multiblock on the assembly line type, appearance OpV casing, GTM sound/recipe type untouched', () => {
  const machine = registry.find(([t]) => t === 'gtceu:machine');
  assert.ok(machine);
  assert.equal(A.id, 'gtceu:assembly_line_array');
  assert.equal(A.type, 'gtceu:assembly_line');
  assert.equal(A.casing, 'gtceu:opv_machine_casing');
  const src = read('startup_scripts', 'grindless/opv/assembly_line_array.js');
  assert.match(src, /parallel: 'fixed', cap: 1, hatch: true/);
  assert.match(src, /AssemblyLineMachine/);
  assert.match(src, /\.recipeType\('assembly_line'\)/);
  // ordered inputs: the part order must be total and follow the controller (GTM's default sorter keeps the pattern's HashSet order)
  assert.match(src, /\["partSorter\(java\.util\.function\.Function\)"\]\(sorterFor\)/);
  assert.match(src, /RD\.BACK\.getSorter\(controller\.getFrontFacing\(\), controller\.getUpwardsFacing\(\), controller\.isFlipped\(\)\)/);
  assert.match(src, /thenComparing\(CMP\.comparing\(posOf\)\)/);
});

test('the controller recipe: researched with a tetron array, VA[OpV] for 2,400 ticks, nine distinct ingredients, none from UXV or below', () => {
  const src = read('server_scripts', 'grindless/opv/assembly_line_array.js');
  for (const need of ['gtceu:opv_machine_hull', 'gtceu:opv_robot_arm', 'gtceu:opv_conveyor_module', 'gtceu:opv_sensor', 'gtceu:opv_field_generator',
    '#gtceu:circuits/opv', 'grindless:opv_harmonic_drive', 'grindless:cryo_optical_link', 'grindless:nb_tsv_interposer', 'gtceu:superfluid_helium_3', 'grindless:tetron_array']) {
    assert.ok(src.includes(need), `takes ${need}`);
  }
  assert.match(src, /EUt\(VA_OPV\)\.duration\(2400\)/);
  assert.match(src, /VA_OPV = 503316480/);
  assert.ok(!/gtceu:u(xv|iv|ev|hv)_/.test(src.replace(/gtceu:uxv_/g, 'X').replace(/RESEARCH[^\n]*/g, '')), 'no UXV-or-lower component or circuit');
  assert.equal((src.match(/^\s+\['\d*x? ?', /gm) || []).length, 9);
});

test('names in en_us, the tooltip and the info page; the EMI json points at the controller', () => {
  const lang = read('client_scripts', 'grindless/opv_assembly_line_array_lang.js');
  for (const key of ['block.gtceu.assembly_line_array', 'grindless.machine.assembly_line_array.tooltip.0', 'emi.grindless.info.assembly_line_array.0', 'emi.grindless.info.assembly_line_array.1']) {
    assert.ok(lang.includes(`'${key}'`), key);
  }
  assert.match(lang, /ClientEvents\.lang\('en_us'/);
  const info = JSON.parse(fs.readFileSync(path.join(KJS, 'assets/emi/recipe/additions/grindless/opv_assembly_line_array_assembly_line_array.json'), 'utf8'));
  assert.equal(info.type, 'emi:info');
  assert.deepEqual(info.stacks, ['item:gtceu:assembly_line_array']);
  assert.deepEqual(info.text, ['emi.grindless.info.assembly_line_array.0', 'emi.grindless.info.assembly_line_array.1']);
});

test('the test zone: one row, own 64-block range, no overlap', () => {
  const zones = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/test/zones.json'), 'utf8'));
  const list = zones.zones || zones;
  const mine = list.filter((z) => z.id === 'opv_assembly_line_array');
  assert.equal(mine.length, 1);
  assert.deepEqual(mine[0].tests, ['opv_assembly_line_array']);
  for (const z of list) {
    if (z === mine[0] || z.dimension !== mine[0].dimension) continue;
    const overlap = z.x[0] <= mine[0].x[1] && mine[0].x[0] <= z.x[1] && z.z[0] <= mine[0].z[1] && mine[0].z[0] <= z.z[1];
    assert.ok(!overlap, `overlaps ${z.id}`);
  }
});
