import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const read = p => fs.readFileSync(path.join(root, ...p.split('/')), 'utf8');
const startup = 'pack/kubejs/startup_scripts/grindless/';
function harness() {
  const registered = {}, recipes = [], removed = [], machines = [];
  const G = { parallelHatch: {
    part: () => ({ kind: 'part', ability: 'parallel_hatch', limits: { max: 1 } }),
    modifier: next => next, overclock: () => {}
  } };
  const context = vm.createContext({
    global: { grindless: G }, console,
    GTCEuStartupEvents: { registry(kind, fn) { registered[kind] = fn; } },
    GuiTextures: {}, FillDirection: {}, RotationState: {},
    Text: { translate: x => x },
    Java: { loadClass(name) {
      assert.equal(name, 'com.gregtechceu.gtceu.api.machine.multiblock.CleanroomType');
      return { CLEANROOM: 'cleanroom' };
    } },
    Fluid: { of: (id, amount) => ({ id, amount }) }
  });
  vm.runInContext(read(startup + 'lib/patterns.js'), context);
  // Deliberately different fake IDs: a hardcoded dimension in B3 must not pass.
  G.orbits = { earth: 'test:earth_orbit', dimensions: ['test:earth_orbit', 'test:outer_orbit'],
    allow(b) { this.dimensions.forEach(id => b.dimension(id)); return b; } };
  function record(target) {
    const b = new Proxy({}, { get(_t, name) { return (...args) => {
      (target.calls[name] ??= []).push(args); return b;
    }; } });
    return b;
  }
  vm.runInContext(read(startup + 'luv/orbital_industry.js'), context);
  registered['gtceu:recipe_type']({ create: id => record({ id, calls: {} }) });
  registered['gtceu:machine']({ create: id => {
    const m = { id, calls: {} }; machines.push(m); return record(m);
  } });
  context.ServerEvents = { recipes(fn) {
    fn({ remove: q => removed.push(q.id), recipes: { gtceu: new Proxy({}, {
      get(_t, type) { return (...args) => {
        const r = { type, id: args[0], args, calls: {} }; recipes.push(r); return record(r);
      }; }
    }) } });
  } };
  vm.runInContext(read('pack/kubejs/server_scripts/grindless/luv/orbital_industry.js'), context);
  return { G, recipes, removed, machines, context };
}
const calls = (r, key) => JSON.parse(JSON.stringify(r.calls[key] ?? []));
const count = (spec, char) => spec.slices.join('').split(char).length - 1;

test('smelter has a 3x3x7 shell, eight-coil hollow levitation core and six-block drawing tower', () => {
  const { G } = harness();
  const s = G.structures['gtceu:microgravity_smelter'];
  assert.equal(s.slices.length, 7);
  s.slices.forEach(rows => { assert.equal(rows.length, 9); rows.forEach(r => assert.equal(r.length, 3)); });
  assert.equal(count(s, 'K'), 8);
  assert.equal(s.slices[3][1], 'KAK');
  assert.equal(s.slices[3][2], 'CGC');
  assert.deepEqual(Array.from(s.slices[3].slice(3)), [' F ', ' G ', ' F ', ' G ', ' F ', ' G ']);
  s.slices.forEach((rows, z) => {
    if (z !== 3) assert.ok(rows.slice(3).every(row => row === '   '));
  });
});
test('wake shield is a 69-block octagonal 9x9 disc in front of a hollow 3x3x3 carousel', () => {
  const { G } = harness();
  const s = G.structures['gtceu:wake_shield_facility'];
  assert.equal(s.slices.length, 4);
  assert.equal(count(s, 'W'), 69);
  s.slices.forEach(rows => { assert.equal(rows.length, 9); rows.forEach(r => assert.equal(r.length, 9)); });
  assert.equal(s.slices[2][4], '   XAX   ');
  assert.equal(count(s, 'X') + count(s, 'S') + count(s, 'M'), 26);
});
test('both machines expose ME-ready parts, one maintenance cell and optional parallel hatch', () => {
  const { G, machines } = harness();
  for (const m of machines) {
    const s = G.structures['gtceu:' + m.id];
    assert.equal(count(s, 'S'), 1);
    assert.ok(s.slices.at(-1).some(row => row.includes('S')));
    assert.equal(count(s, 'M'), 1);
    assert.equal(s.symbols.M.ability, 'maintenance');
    assert.equal(s.symbols.M.limits.exact, 1);
    const parts = s.symbols.X.options.filter(p => p.kind === 'part');
    assert.deepEqual(Array.from(parts.map(p => p.ability)),
      ['energy_input', 'input_bus', 'output_bus', 'input_hatch', 'parallel_hatch']);
    assert.equal(parts.at(-1).limits.max, 1);
    assert.equal(calls(m, 'recipeModifier')[0][1], true);
  }
});
test('all six design routes retain exact quantities, circuits, costs, dimensions and cleanrooms', () => {
  const { G, recipes } = harness();
  const expected = [
    ['zblan_optical_pipe', 1, ['gtceu:zblan_dust'], [['gtceu:polytetrafluoroethylene', 72]], '4x gtceu:normal_optical_pipe', 7680, 400, true],
    ['whipple_shield_casing', 2, ['4x gtceu:aluminium_ingot', 'gtceu:titanium_dust', '2x gcyr:para_aramid_foil'], [['gtceu:hydrogen', 100]], '2x grindless:whipple_shield_casing', 7680, 200, false],
    ['containerless_naquadah_alloy', 3, ['2x gtceu:naquadah_dust', 'gtceu:osmiridium_dust', 'gtceu:trinium_dust'], [], '4x gtceu:naquadah_alloy_ingot', 30720, 2000, false],
    ['wake_uhpic_wafer', 1, ['gtceu:hpic_wafer', '4x gtceu:indium_gallium_phosphide_dust'], [['gtceu:naquadah', 288]], 'gtceu:uhpic_wafer', 30720, 600, true],
    ['wake_hpic_wafer', 2, ['gtceu:mpic_wafer', 'gtceu:indium_gallium_phosphide_dust'], [['gtceu:vanadium_gallium', 144]], 'gtceu:hpic_wafer', 7680, 600, true],
    ['triple_junction_wafer', 3, ['gtceu:germanium_plate', 'gtceu:gallium_arsenide_dust', 'gtceu:indium_gallium_phosphide_dust'], [], 'grindless:triple_junction_wafer', 7680, 400, true]
  ];
  for (const [name, circuit, items, fluids, output, eut, duration, cleanroom] of expected) {
    const r = recipes.find(r => r.id === 'grindless:' + name);
    assert.deepEqual(calls(r, 'circuit'), [[circuit]]);
    assert.deepEqual(calls(r, 'itemInputs'), [[items]]);
    assert.deepEqual(calls(r, 'inputFluids'), fluids.map(([id, amount]) => [{ id, amount }]));
    assert.deepEqual(calls(r, 'itemOutputs'), [[output]]);
    assert.deepEqual(calls(r, 'EUt'), [[eut]]);
    assert.deepEqual(calls(r, 'duration'), [[duration]]);
    assert.deepEqual(calls(r, 'dimension'), G.orbits.dimensions.map(id => [id]));
    assert.equal(!!r.calls.cleanroom, cleanroom);
    const m = G.orbitalIndustry.machines.find(m => m.type === r.type);
    assert.ok(items.length + 1 <= m.io[0], 'programmed circuit needs an input slot');
  }
  assert.equal(expected.length, G.orbitalIndustry.recipes.length);
});
test('pipe cut removes datapack recipes and requests late material-info clearing without rebuilding it', () => {
  const { recipes, removed } = harness();
  assert.deepEqual(removed, ['gtceu:arc_furnace/arc_normal_optical_pipe', 'gtceu:macerator/macerate_normal_optical_pipe']);
  const pipe = recipes.find(r => r.id === 'grindless:zblan_optical_pipe');
  assert.deepEqual(calls(pipe, 'removePreviousMaterialInfo'), [[]]);
  assert.equal(pipe.calls.addMaterialInfo, undefined);
  // GTRecipeBuilder.removeExistingMaterialInfo in pinned GTM 7.5.3 clears both maps.
  // The native fixture, not this stand-in, proves the recipes stay absent after injection.
});
test('ZBLAN uses the exact 53:20:4:3:20 cation ratio and 293 fluorine atoms in a quarter batch', () => {
  const { recipes } = harness();
  const r = recipes.find(r => r.id === 'grindless:zblan');
  // Pinned GTM 7.5.3 TagPrefix.dustSmall uses idPattern("small_%s_dust"),
  // which GTMaterialItems applies to the material name when registering its item.
  assert.deepEqual(calls(r, 'itemInputs'), [[[
    '53x gtceu:small_zirconium_dust', '20x gtceu:small_barium_dust',
    '4x gtceu:small_lanthanum_dust', '3x gtceu:small_aluminium_dust',
    '20x gtceu:small_sodium_dust'
  ]]]);
  const counts = calls(r, 'itemInputs')[0][0].map(s => Number(s.match(/^\d+/)[0]));
  assert.deepEqual(counts, [53, 20, 4, 3, 20]);
  assert.ok(counts.every(c => c <= 64));
  assert.equal(calls(r, 'inputFluids')[0][0].amount, (53 * 4 + 20 * 2 + 4 * 3 + 3 * 3 + 20) * 250);
  assert.deepEqual(calls(r, 'itemOutputs'), [['25x gtceu:zblan_dust']]);
  assert.equal(r.calls.dimension, undefined);
  assert.deepEqual(calls(r, 'EUt'), [[7680]]);
  assert.deepEqual(calls(r, 'duration'), [[200]]);
});
test('merged A1 provides B3 design IDs, non-decomposable ZBLAN and the station casing texture path', () => {
  const { G, context, machines } = harness();
  const registry = {}, materials = {};
  G.tables = {};
  G.readJsonTable = file => JSON.parse(read('pack/' + file));
  context.GTCEuStartupEvents = { registry(kind, fn) { registry[kind] = fn; } };
  context.StartupEvents = { registry() {} };
  context.GTMaterials = {};
  context.GTMaterialIconSet = { GLASS: 'glass' };
  context.GTMaterialFlags = { DISABLE_DECOMPOSITION: 'disable_decomposition' };
  vm.runInContext(read(startup + 'luv/foundation.js'), context);
  registry['gtceu:material']({ create(id) {
    materials[id] = {};
    const builder = new Proxy({}, { get(_target, method) {
      return (...args) => { materials[id][method] = args; return builder; };
    } });
    return builder;
  } });
  assert.deepEqual(Array.from(materials.zblan.flags), ['disable_decomposition']);
  assert.equal(materials.zblan.components, undefined, 'a glass blend must not use atomic-dust decomposition units');
  assert.equal(G.luvFoundation.ids.zblanDust, 'gtceu:zblan_dust');
  assert.equal(G.luvFoundation.ids.whippleShieldCasing, 'grindless:whipple_shield_casing');
  assert.equal(G.luvFoundation.ids.tripleJunctionWafer, 'grindless:triple_junction_wafer');
  assert.equal(G.luvFoundation.ids.tripleJunctionCell, 'grindless:triple_junction_cell');
  assert.equal(calls(machines.find(m => m.id === 'microgravity_smelter'), 'workableCasingModel')[0][0],
    'grindless:block/luv/station_truss_casing');
});
test('ground cutter keeps cleanroom; both controllers have exact LuV design parts', () => {
  const { recipes } = harness();
  const cut = recipes.find(r => r.type === 'cutter');
  assert.deepEqual(calls(cut, 'itemOutputs'), [['4x grindless:triple_junction_cell']]);
  assert.deepEqual(calls(cut, 'cleanroom'), [['cleanroom']]);
  assert.equal(cut.calls.dimension, undefined);
  const shaped = recipes.filter(r => r.type === 'shaped');
  assert.equal(shaped.length, 2);
  for (const r of shaped) {
    const [output, pattern, keys] = r.args;
    const histogram = {};
    pattern.join('').split('').filter(c => c !== ' ').forEach(c => { histogram[keys[c]] = (histogram[keys[c]] ?? 0) + 1; });
    assert.equal(histogram['#gtceu:circuits/luv'], 4);
    assert.equal(histogram['gtceu:luv_machine_hull'], 1);
    if (output.endsWith('microgravity_smelter')) {
      assert.equal(histogram['gtceu:luv_field_generator'], 1);
      assert.equal(histogram['gtceu:luv_electric_pump'], 2);
    } else assert.equal(histogram['gtceu:luv_emitter'], 2);
  }
});
test('controller faces exist and every English tooltip has a Spanish translation', () => {
  const { machines, context } = harness();
  const langs = {};
  context.ClientEvents = { lang(lang, fn) { langs[lang] = {}; fn({ add(_ns, key, value) { langs[lang][key] = value; } }); } };
  vm.runInContext(read('pack/kubejs/client_scripts/grindless/luv_orbital_industry_lang.js'), context);
  assert.deepEqual(Object.keys(langs.en_us).sort(), Object.keys(langs.es_es).sort());
  for (const m of machines) {
    const dir = path.join(root, 'pack', 'kubejs', 'assets', 'grindless', 'textures', 'block', 'multiblock', m.id);
    for (const name of ['overlay_front.png', 'overlay_front_active.png']) {
      const png = fs.readFileSync(path.join(dir, name));
      assert.equal(png.subarray(1, 4).toString(), 'PNG');
      assert.equal(png.readUInt32BE(16), 16);
      assert.equal(png.readUInt32BE(20), 16);
    }
  }
});
test('native fixture places four full shapes only inside its reserved band without starting Java', () => {
  const { G, context } = harness();
  const commands = [], log = [];
  let command, tick;
  context.Date = { now: () => 0 };
  context.console = { info: s => log.push(s) };
  context.ServerEvents = {
    customCommand(_name, fn) { command = fn; },
    tick(fn) { tick = fn; }
  };
  context.Item = { of: () => ({ getItem: () => ({}) }) };
  context.GTMaterials = { get: () => ({ hasFlag: () => true }) };
  context.GTMaterialFlags = {};
  context.Java = { loadClass(name) {
    if (name.endsWith('ResourceLocation') || name.endsWith('BlockPos')) return function () {};
    if (name.endsWith('ItemMaterialData')) return { getMaterialInfo: () => null };
    if (name.endsWith('MetaMachine')) return { getMachine: () => null };
    return {};
  } };
  vm.runInContext(read('tools/test/overlay/kubejs/server_scripts/gg_test_luv_orbital_industry.js'), context);
  context.Date.now = () => 10001;
  const server = {
    getRecipeManager: () => ({ byKey: () => ({ isPresent: () => false }) }),
    getLevel: () => ({}),
    runCommandSilent(s) { commands.push(s); return 1; }
  };
  assert.equal(command(), 1);
  tick({ server });
  assert.ok(!log.some(s => s.includes('|exception|')), log.join('\n'));
  const sets = commands.filter(s => s.includes(' run setblock '));
  assert.ok(sets.length > 250);
  const counts = {};
  for (const cmd of sets) {
    const match = /^execute in (\S+) run setblock (-?\d+) (-?\d+) (-?\d+) (.+) replace$/.exec(cmd);
    assert.ok(match, cmd);
    const [, dim, xs, ys, zs, id] = match;
    const [x, y, z] = [xs, ys, zs].map(Number);
    assert.ok(x >= 16128 && x <= 16191 && z >= 0 && z <= 15, cmd);
    assert.ok(y >= (dim === 'minecraft:overworld' ? 98 : 198), cmd);
    assert.ok(y <= (dim === 'minecraft:overworld' ? 112 : 214), cmd);
    if (/^gtceu:(microgravity_smelter|wake_shield_facility)\[/.test(id)) counts[dim] = (counts[dim] ?? 0) + 1;
  }
  assert.equal(counts['minecraft:overworld'], 2);
  assert.equal(counts[G.orbits.earth], 2);
});
