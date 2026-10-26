// LuV-B10: GTM's Fusion Reactor Mk1 (docs/eras/luv.md, "Fusion, and what is not fusion", decisions 6, 19 and 20), the research chain
// the design makes explicit, and the native fixture's band. No Java, no Minecraft.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const read = p => fs.readFileSync(path.join(root, ...p.split('/')), 'utf8');
const TABLE = 'pack/kubejs/data/grindless/tables/fusion_mk1.json';
const table = JSON.parse(read(TABLE));
const P = 'gtceu:fusion_reactor/';

// Frozen subset of power-quests-1/results/server/kubejs-exported (gg-recipes-1, gg-items-1): every gtceu:fusion_reactor recipe
// with its EU/t and eu_to_start, and the fluids and items B10 uses. Checked against the dump when B10 was written.
const DUMP_FUSION = {
  neodymium_and_hydrogen_to_europium_plasma: [24576, 150e6], gold_and_aluminium_to_uranium_238_plasma: [24576, 140e6],
  silicon_and_magnesium_to_iron_plasma: [7680, 360e6], xenon_and_zinc_to_plutonium_239_plasma: [49152, 120e6],
  deuterium_and_tritium_to_helium_plasma: [4096, 40e6], beryllium_and_deuterium_to_nitrogen_plasma: [16384, 280e6],
  carbon_and_helium_3_to_oxygen_plasma: [4096, 180e6], sulfur_plasma: [10240, 240e6],
  mercury_and_magnesium_to_uranium_235_plasma: [24576, 140e6], titanium_and_duranium_to_tritanium_plasma: [30720, 200e6],
  californium: [122880, 120e6], krypton_and_cerium_to_plutonium_241_plasma: [49152, 240e6],
  silver_and_helium_3_to_tin_plasma: [49152, 280e6], silver_and_copper_to_osmium_plasma: [24578, 150e6],
  plutonium_based_liquid_fuel_excited: [30720, 220e6], enriched_naquadah_and_radon_to_naquadria_plasma: [49152, 400e6],
  lutenium_and_chromium_to_americium_plasma: [49152, 200e6], titanium_plasma: [49152, 100e6],
  naquadah_based_liquid_fuel_excited: [26000, 320e6], arsenic_and_ruthenium_to_darmstadtium_plasma: [30720, 200e6],
  calcium_plasma: [7680, 120e6], gallium_and_radon_to_duranium_plasma: [16384, 140e6],
  uranium_based_liquid_fuel_excited: [7680, 200e6], oganesson: [122880, 600e6],
  hydrogen_and_vanadium_to_chromium_plasma: [24576, 140e6], lantanum_and_silicon_to_lutetium_plasma: [7680, 80e6],
  gold_and_mercury_to_radon_plasma: [30720, 200e6], zinc_plasma: [49152, 180e6],
  potassium_and_fluorine_to_nickel_plasma: [30720, 480e6], carbon_and_magnesium_to_argon_plasma: [24576, 180e6],
  silver_and_lithium_to_indium_plasma: [24576, 280e6], americium_and_naquadria_to_neutronium_plasma: [98304, 600e6],
  plutonium_241_and_hydrogen_gas_to_americium_plasma: [98304, 500e6]
};
const DUMP_FLUIDS = new Set(['gtceu:gallium', 'gtceu:radon', 'gtceu:duranium', 'gtceu:neodymium', 'gtceu:hydrogen', 'gtceu:europium',
  'gtceu:magnesium', 'gtceu:oxygen', 'gtca:calcium_plasma_plasma', 'gtceu:silver', 'gtceu:copper', 'gtceu:osmium', 'gtceu:uranium_235',
  'gtceu:uranium', 'gtceu:gold', 'gtceu:aluminium', 'gtceu:mercury', 'gtceu:deuterium', 'gtceu:tritium', 'gtceu:helium_3',
  'gtceu:helium_plasma', 'gtceu:lutetium', 'gtceu:chromium', 'gtceu:lanthanum', 'gtceu:silicon', 'gtceu:vanadium']);
const DUMP_ITEMS = new Set(['gtceu:luv_fusion_reactor', 'gtceu:luv_energy_input_hatch', 'gtceu:luv_input_hatch', 'gtceu:luv_output_hatch',
  'gtceu:superconducting_coil', 'gtceu:fusion_casing', 'gtceu:fusion_glass', 'gtceu:high_performance_computation_array',
  'gtceu:research_station', 'gtceu:data_bank', 'gtceu:computer_casing', 'gtceu:advanced_computer_casing', 'gtceu:hpca_empty_component',
  'gtceu:hpca_heat_sink_component', 'gtceu:hpca_active_cooler_component', 'gtceu:hpca_computation_component', 'gtceu:data_orb',
  'gtceu:normal_optical_pipe', 'gtceu:uranium_rhodium_dinaquadide_double_wire', 'gtceu:uranium_rhodium_dinaquadide_dust',
  'gtceu:large_mixer', 'gtceu:zpm_energy_input_hatch']);
// GTM's research chain the design makes explicit (luv.md, "Research, explicit"), as it is in the dump
const RESEARCH = {
  'gtceu:assembler/computer_casing': 30720, 'gtceu:assembler/advanced_computer_casing': 30720,
  'gtceu:assembly_line/data_bank': 6000, 'gtceu:assembler/hpca_empty_component': 7680,
  'gtceu:assembler/hpca_heat_sink_component': 7680, 'gtceu:assembler/hpca_active_cooler_component': 7680,
  'gtceu:assembler/hpca_computation_component': 30720, 'gtceu:assembly_line/high_performance_computing_array': 100000,
  'gtceu:assembly_line/research_station': 100000, 'gtceu:mixer/uranium_rhodium_dinaquadide': 122880,
  'gtceu:research_station/1x_gtceu_luv_energy_input_hatch': 30720, 'gtceu:assembly_line/energy_hatch_zpm': 122880,
  'gtceu:assembly_line/fusion_reactor_mk1': 30720, 'gtceu:assembler/fusion_casing': 30720, 'gtceu:assembler/fusion_glass': 30720
};

const mk1Runs = (eut, start) => eut <= table.mk1.maxEUt && start <= table.mk1.maxStart;
const short = id => id.replace(P, '');
const byFate = fate => table.recipes.filter(r => r.fate === fate).map(r => short(r.id)).sort();

test('the audit lists every fusion recipe of the dump exactly once, with GTM\'s figures', () => {
  const ids = table.recipes.map(r => short(r.id));
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual([...ids].sort(), Object.keys(DUMP_FUSION).sort());
  for (const r of table.recipes) {
    assert.ok(r.id.startsWith(P), r.id);
    assert.deepEqual([r.eut, r.start], DUMP_FUSION[short(r.id)], r.id);
    assert.ok(r.why && r.why.length > 0 || r.fate === 'beyond', r.id);
    for (const i of r.inputs) assert.ok(i.tag.startsWith('forge:') && i.amount > 0, r.id);
    assert.ok(DUMP_FLUIDS.has(r.output.id) || r.fate === 'beyond', r.id + ' ' + r.output.id);
  }
});

test('the Mk1 limits are GTM\'s: LuV EU/t and 16 hatches x 10 M EU', () => {
  assert.equal(table.mk1.machine, 'gtceu:luv_fusion_reactor');
  assert.equal(table.mk1.maxEUt, 32768);
  assert.equal(table.mk1.maxStart, table.mk1.energyHatches * table.mk1.startPerHatch);
  assert.equal(table.mk1.maxStart, 160000000);
  // the Mk2 holds 16 x 20 M: the moved recipe is Mk2-only
  assert.ok(table.mk2Start > table.mk1.maxStart && table.mk2Start <= 320000000);
  assert.equal(table.mk2Start, 200000000);
});

test('decision 6 and 20: exactly three cuts, one move, five keeps, and every other recipe is beyond the Mk1', () => {
  assert.deepEqual(byFate('cut'), ['gold_and_aluminium_to_uranium_238_plasma', 'mercury_and_magnesium_to_uranium_235_plasma',
    'silver_and_copper_to_osmium_plasma']);
  assert.deepEqual(byFate('mk2'), ['gallium_and_radon_to_duranium_plasma']);
  assert.deepEqual(byFate('keep'), ['calcium_plasma', 'deuterium_and_tritium_to_helium_plasma', 'hydrogen_and_vanadium_to_chromium_plasma',
    'lantanum_and_silicon_to_lutetium_plasma', 'neodymium_and_hydrogen_to_europium_plasma']);
  for (const r of table.recipes) {
    assert.ok(['keep', 'cut', 'mk2', 'beyond'].includes(r.fate), r.id);
    // every recipe the Mk1 could run as GTM made it has a decision; nothing beyond it is touched
    assert.equal(mk1Runs(r.eut, r.start), r.fate !== 'beyond', r.id);
  }
  // after B10 the Mk1 runs only the kept five
  const runs = table.recipes.filter(r => r.fate !== 'cut').filter(r => mk1Runs(r.eut, r.fate === 'mk2' ? table.mk2Start : r.start));
  assert.deepEqual(runs.map(r => short(r.id)).sort(), byFate('keep'));
});

function harness(liveIds) {
  const removed = [], added = [], logs = { info: [], warn: [], error: [] };
  const G = { readJsonTable: p => { assert.equal(p, 'kubejs/data/grindless/tables/fusion_mk1.json'); return JSON.parse(read(TABLE)); } };
  const live = liveIds.map(id => {
    const row = table.recipes.find(r => r.id === id);
    const [eut, start] = row ? [row.eut, row.start] : [24576, 100000000];
    return { getId: () => id, json: JSON.stringify({ tickInputs: { eu: [{ content: eut }] }, data: { eu_to_start: start } }) };
  });
  const context = vm.createContext({
    global: { grindless: G },
    console: { info: s => logs.info.push(s), warn: s => logs.warn.push(s), error: s => logs.error.push(s) },
    Fluid: { of: (id, amount) => ({ id, amount }) },
    ServerEvents: { recipes(fn) {
      fn({
        forEachRecipe(q, cb) { assert.equal(q.type, 'gtceu:fusion_reactor'); live.forEach(cb); },
        remove(q) { removed.push(q.id); },
        recipes: { gtceu: { fusion_reactor(id) {
          const r = { id, calls: {} }; added.push(r);
          const b = new Proxy({}, { get: (_t, name) => (...args) => { (r.calls[name] ??= []).push(args); return b; } });
          return b;
        } } }
      });
    } }
  });
  vm.runInContext(read('pack/kubejs/server_scripts/grindless/luv/fusion.js'), context);
  return { G, removed, added, logs };
}

test('fusion.js cuts the three, rebuilds duranium under GTM\'s id with a 200 M start and GTM\'s fluid tags', () => {
  const { G, removed, added, logs } = harness(table.recipes.map(r => r.id));
  const dur = P + 'gallium_and_radon_to_duranium_plasma';
  assert.deepEqual([...removed].sort(), [...table.recipes.filter(r => r.fate === 'cut').map(r => r.id), dur].sort());
  assert.equal(added.length, 1);
  const r = added[0];
  // GTM's builder puts the type in front: gtceu:x is saved as gtceu:fusion_reactor/x, GTM's own id
  assert.equal(r.id, 'gtceu:gallium_and_radon_to_duranium_plasma');
  assert.deepEqual(r.calls.inputFluids, [['#forge:gallium 16'], ['#forge:radon 125']]);
  assert.deepEqual(JSON.parse(JSON.stringify(r.calls.outputFluids)), [[{ id: 'gtceu:duranium', amount: 16 }]]);
  assert.deepEqual(r.calls.EUt, [[16384]]);
  assert.deepEqual(r.calls.duration, [[32]]);
  assert.deepEqual(r.calls.fusionStartEU, [[200000000]]);
  assert.deepEqual(Array.from(G.fusion.unaudited), []);
  assert.deepEqual(Array.from(G.fusion.missing), []);
  assert.deepEqual(Array.from(G.fusion.errors), []);
  assert.equal(logs.error.length, 0, logs.error.join('\n'));
});

test('fusion.js reports a new Mk1-runnable recipe and never adds a duranium recipe GTM did not make', () => {
  const ids = table.recipes.map(r => r.id).filter(id => !id.endsWith('gallium_and_radon_to_duranium_plasma'));
  const { G, added, removed, logs } = harness([...ids, 'gtca:fusion_reactor/new_addon_plasma']);
  assert.equal(added.length, 0);
  assert.equal(removed.length, 3);
  assert.equal(G.fusion.unaudited.length, 1);
  assert.match(G.fusion.unaudited[0], /new_addon_plasma/);
  assert.deepEqual(Array.from(G.fusion.missing), [P + 'gallium_and_radon_to_duranium_plasma']);
  assert.ok(logs.error.some(s => s.includes('unaudited')));
});

test('the research chain and the Mk1\'s parts are GTM\'s, live, and nothing in the pack removes or hides them', () => {
  const ids = [...DUMP_ITEMS];
  const hidden = JSON.parse(read('pack/kubejs/data/grindless/tables/hidden_until.json'));
  const groups = hidden.groups || hidden.materials || Object.values(hidden).find(Array.isArray) || [];
  const hiddenItems = new Set(groups.flatMap(g => g.items || []));
  const removedRecipes = new Set(groups.flatMap(g => g.removeRecipes || []));
  for (const id of ids) assert.ok(!hiddenItems.has(id), id + ' is hidden');
  for (const id of Object.keys(RESEARCH)) assert.ok(!removedRecipes.has(id), id + ' is removed by hidden_until');
  const scripts = [];
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (p.endsWith('.js')) scripts.push(fs.readFileSync(p, 'utf8'));
  });
  walk(path.join(root, 'pack', 'kubejs', 'server_scripts'));
  const all = scripts.join('\n');
  for (const id of Object.keys(RESEARCH)) assert.ok(!all.includes("'" + id + "'"), id + ' is named by a server script');
  for (const id of ids) assert.ok(!new RegExp("remove\\(\\{\\s*output:\\s*'" + id + "'").test(all), id + ' output removed');
});

test('the native fixture stays in X 17920-17983, Z 0-63, Y 98-112 and pins the same figures', () => {
  const src = read('tools/test/overlay/kubejs/server_scripts/gg_test_luv_fusion.js');
  for (const id of table.recipes.filter(r => r.fate === 'cut').map(r => r.id)) assert.ok(src.includes("'" + id + "'"), id);
  for (const [id, eut] of Object.entries(RESEARCH).slice(0, 12)) assert.ok(src.includes("id: '" + id + "', eut: " + eut), id);
  assert.ok(src.includes('start: 200000000'));
  const commands = [], sets = [], log = [];
  let command, tick;
  const block = id => ({ id });
  const info = id => ({ getBlockState: () => ({ getBlock: () => block(id) }) });
  // a fake preview: a 15 x 3 x 15 ring with a controller (the size of GTM's Mk1), smaller boxes for the others
  const shape = (id, sx, sy, sz) => ({ getBlocks: () => Array.from({ length: sx }, (_x, x) => Array.from({ length: sy }, (_y, y) =>
    Array.from({ length: sz }, (_z, z) => info(x === sx >> 1 && y === 1 && z === 0 ? id : (x + z) % 3 === 0 ? 'gtceu:fusion_glass' : 'minecraft:air')))) });
  const sizes = { 'gtceu:luv_fusion_reactor': [15, 3, 15], 'gtceu:high_performance_computation_array': [5, 5, 5], 'gtceu:research_station': [5, 4, 7] };
  function List(a) { const arr = Array.isArray(a) ? a : []; return { size: () => arr.length, get: i => arr[i] }; }
  const context = vm.createContext({
    global: { grindless: { fusion: { removed: [], rebuilt: [], unaudited: [], missing: [], errors: [] } } },
    console: { info: s => log.push(s) }, Date: { now: () => 0 },
    Block: { getId: b => b.id },
    Fluid: { of: () => ({ getFluidStack: () => ({}) }) },
    ServerEvents: { customCommand(_n, fn) { command = fn; }, tick(fn) { tick = fn; } },
    Java: { loadClass(name) {
      if (name.endsWith('ResourceLocation')) return function (s) { this.s = s; };
      if (name.endsWith('BlockPos')) return function (x, y, z) { this.x = x; this.y = y; this.z = z; };
      if (name.endsWith('ArrayList')) return List;
      if (name.endsWith('MetaMachine')) return { getMachine: () => null };
      if (name.endsWith('GTRegistries')) return { MACHINES: { get: rl => ({ getMatchingShapes: () => [shape(rl.s, ...sizes[rl.s])] }) } };
      return {};
    } }
  });
  vm.runInContext(src, context);
  context.Date.now = () => 10001;
  const server = {
    getRecipeManager: () => ({ byKey: () => ({ isPresent: () => false }) }),
    getLevel: () => ({ setBlock(pos) { sets.push(pos); } }),
    runCommandSilent(s) { commands.push(s); return 1; }
  };
  assert.equal(command(), 1);
  tick({ server });
  assert.ok(!log.some(s => s.includes('|exception|')), log.join('\n'));
  assert.ok(sets.length > 50);
  for (const p of sets) assert.ok(p.x >= 17920 && p.x <= 17983 && p.z >= 0 && p.z <= 63 && p.y >= 98 && p.y <= 112, JSON.stringify(p));
  for (const c of commands) {
    const nums = c.replace(/^execute in minecraft:overworld run /, '').match(/-?\d+/g).map(Number);
    if (c.includes(' fill ')) {
      assert.ok(nums[0] >= 17920 && nums[3] <= 17983 && nums[1] >= 98 && nums[4] <= 112 && nums[2] >= 0 && nums[5] <= 63, c);
      assert.ok((nums[3] - nums[0] + 1) * (nums[4] - nums[1] + 1) * (nums[5] - nums[2] + 1) <= 32768, c);
    } else assert.ok(nums[0] >= 17920 && nums[2] <= 17983, c);
  }
  const agents = read('AGENTS.md');
  assert.match(agents, /\| LuV fusion and research \| 17920–17983/);
});
