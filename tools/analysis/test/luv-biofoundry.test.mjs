// LuV biofoundry (package LuV-A5, startup_scripts/grindless/luv/biofoundry.js, server_scripts/grindless/luv/biofoundry.js,
// data/grindless/tables/biofoundry.json): the machine, its sealed hall and its recipes as the stand-in sees them, every outside id they
// name pinned to the list checked against the native registry (Node mocks accept any id; a wrong GT id only fails in game), the step
// names in both languages, and the Universal Assembly Factory's guard that keeps GTM's NPU recipe off two LuV hatches (spike S0-4).
//   GG_NATIVE_DUMP=<kubejs-exported folder of a gg_dump run> also checks the pinned ids against that dump's registry and recipes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const kubejs = path.join(pack, 'kubejs');
const table = JSON.parse(fs.readFileSync(path.join(kubejs, 'data', 'grindless', 'tables', 'biofoundry.json'), 'utf8'));

// checked against the native registry of run 20261025-222752-server-58e (items.json, fluids, recipes.json) on 2026-10-26
const VERIFIED_BLOCKS = [
  'gtceu:plascrete', 'gtceu:cleanroom_glass', 'gtceu:laminated_glass', 'gtceu:clean_machine_casing', 'gtceu:heatproof_machine_casing',
  'gtceu:steel_pipe_casing', 'minecraft:iron_door',
  ...['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green',
    'red', 'black'].flatMap((c) => [`gtceu:${c}_lamp`, `gtceu:${c}_borderless_lamp`]),
];
const VERIFIED_ITEMS = ['minecraft:wheat_seeds', 'minecraft:beetroot_seeds', 'gtceu:luv_machine_hull', 'gtceu:luv_electric_pump', 'gtceu:luv_sensor'];
const VERIFIED_FLUIDS = ['gtceu:bacteria'];
const VERIFIED_STAGES = [
  'gtceu:chemical_reactor/collagen_from_bone', 'gtceu:chemical_reactor/collagen_from_bone_meal', 'gtceu:mixer/gelatin_mixture',
  'gtceu:centrifuge/gelatin', 'gtceu:autoclave/agar', 'gtceu:large_chemical_reactor/bacterial_sludge',
  'gtceu:brewery/enriched_bacterial_sludge_from_u235', 'gtceu:distillery/mutagen', 'gtceu:mixer/raw_growth_medium',
  'gtceu:fluid_heater/sterile_growth_medium', 'gtceu:large_chemical_reactor/stem_cells',
];
// the plans' given and linked keys (the ids GTM's live stages resolve to)
const VERIFIED_KEYS = [
  'i:minecraft:bone', 'i:minecraft:bone_meal', 'i:gtceu:collagen_dust', 'f:gtceu:gelatin_mixture', 'i:gtceu:gelatin_dust', 'f:gtceu:bacteria',
  'f:gtceu:bacterial_sludge', 'f:gtceu:enriched_bacterial_sludge', 'f:gtceu:mutagen', 'f:gtceu:raw_growth_medium', 'i:gtceu:osmiridium_dust',
];
// LuV-A1 registers these (startup_scripts/grindless/luv/foundation.js)
const A1_ITEMS = ['grindless:engineered_barley_seed', 'grindless:engineered_tobacco_seed'];
const NPU_RECIPE = 'gtceu:circuit_assembler/neuro_processor';

const run = runPackScripts(pack);

test('the biofoundry registers on its own type, with the sealed 9 x 6 x 9 hall', () => {
  // without GTM's live recipes (event.originalRecipes is empty here) the composed steps are skipped, and say why; nothing else may fail
  const ours = run.errors.filter((e) => /biofoundry/.test(String(e.file)) &&
    !(e.stage === 'console.error' && /biofoundry skipped [a-z_]+: no source recipe gtceu:/.test(e.message)));
  assert.deepEqual(ours, [], ours.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  const skipped = run.errors.filter((e) => /biofoundry skipped/.test(e.message)).map((e) => /skipped ([a-z_]+):/.exec(e.message)[1]).sort();
  assert.deepEqual(skipped, table.composed.map((p) => p.name).sort());
  assert.deepEqual(run.registry.machines.get('gtceu:biofoundry').recipeTypes, ['gtceu:sterile_culture']);
  assert.ok(run.registry.recipeTypes.has('gtceu:sterile_culture'));
  const s = run.docs.structures.structures['gtceu:biofoundry'];
  assert.ok(s, 'structure description');
  assert.equal(s.slices.length, 9);
  for (const slice of s.slices) {
    assert.equal(slice.length, 6, 'at most 16 high: 6 rows');
    for (const row of slice) assert.equal(row.length, 9);
  }
  const count = (ch) => s.slices.flat().join('').split(ch).length - 1;
  assert.equal(count('S'), 1);
  assert.ok(s.slices[8].some((row) => row.includes('S')), 'the controller is in the front slice');
  assert.equal(count('X'), 21, 'the service wall\'s part cells');
  assert.equal(count('D'), 4, 'two iron doors, two halves each');
});

test('every block of the hall and every outside id of its recipes is one checked against the native registry', () => {
  const s = run.docs.structures.structures['gtceu:biofoundry'];
  const blocks = new Set();
  const walk = (d) => {
    for (const b of d.blocks || []) blocks.add(b);
    for (const o of d.options || []) walk(o);
  };
  Object.values(s.symbols).forEach(walk);
  assert.deepEqual([...blocks].filter((b) => !VERIFIED_BLOCKS.includes(b)), [], 'pattern blocks not verified');

  const stages = table.composed.flatMap((p) => p.stages);
  assert.deepEqual(stages.filter((id) => !VERIFIED_STAGES.includes(id)), [], 'stage recipes not verified');
  const keys = table.composed.flatMap((p) => [...Object.keys(p.given), ...p.linked]);
  assert.deepEqual(keys.filter((k) => !VERIFIED_KEYS.includes(k)), [], 'plan keys not verified');
  // circuits 11-16 are UHV-B4's xeno rows, checked by uhv-proxima_life.test.mjs
  for (const r of table.recipes.filter((x) => x.circuit <= 10)) {
    for (const x of [...r.itemsIn, ...r.itemsOut]) assert.ok(VERIFIED_ITEMS.includes(x.id) || A1_ITEMS.includes(x.id), x.id);
    for (const x of [...r.fluidsIn, ...r.fluidsOut]) assert.ok(VERIFIED_FLUIDS.includes(x.id), x.id);
  }
  for (const id of A1_ITEMS) assert.ok(run.registry.items.has(id), `${id} (LuV-A1)`);
  const server = fs.readFileSync(path.join(kubejs, 'server_scripts', 'grindless', 'luv', 'biofoundry.js'), 'utf8');
  for (const id of server.match(/'gtceu:luv_[a-z_]+'/g).map((x) => x.slice(1, -1))) assert.ok(VERIFIED_ITEMS.includes(id), id);
});

test('one circuit per step, the seeds as the table writes them, and the controller recipe', () => {
  const all = [...table.composed, ...table.recipes].filter((r) => r.circuit <= 10);
  assert.deepEqual(all.map((r) => r.circuit).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(table.steps.filter((s) => s.circuit <= 10).map((s) => s.name), all.slice().sort((a, b) => a.circuit - b.circuit).map((r) => r.name));
  const recipes = run.docs.recipes.recipes;
  const xeno = table.recipes.filter((r) => r.circuit > 10).map((r) => `grindless:sterile_culture/${r.name}`);
  const ours = recipes.filter((r) => r.t === 'gtceu:sterile_culture' && !xeno.includes(r.i)).map((r) => r.i).sort();
  // the composed steps need GTM's live recipes (event.originalRecipes is empty here): only the seeds come out
  assert.deepEqual(ours, ['grindless:sterile_culture/engineered_barley_seed', 'grindless:sterile_culture/engineered_tobacco_seed']);
  const ctrl = recipes.find((r) => r.i === 'grindless:assembly_line/biofoundry');
  assert.ok(ctrl, 'grindless:assembly_line/biofoundry');
  assert.equal(ctrl.t, 'gtceu:assembly_line');
  assert.equal(ctrl.j.tickInputs.eu[0].content, 7680);
});

test('the composer reads small and tiny dust tags as GTM\'s items (mutagen\'s tiny U-235)', () => {
  const ctx = { global: {}, Item: { exists: () => true }, Fluid: { exists: () => true }, console };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(kubejs, 'server_scripts', 'grindless', 'lib', 'compose.js'), 'utf8'), ctx);
  const C = ctx.global.grindless.compose;
  assert.equal(C.itemOfTag('forge:tiny_dusts/uranium_235'), 'gtceu:tiny_uranium_235_dust');
  assert.equal(C.itemOfTag('forge:small_dusts/agar'), 'gtceu:small_agar_dust');
  assert.equal(C.itemOfTag('forge:dusts/meat'), 'gtceu:meat_dust');
});

test('every step, the type, the tooltips and the voiding refusal are named in en_us and es_es', () => {
  const problems = [];
  for (const lang of ['en_us', 'es_es']) {
    const L = run.lang[lang] || {};
    const keys = ['block.gtceu.biofoundry', 'gtceu.sterile_culture', 'grindless.machine.biofoundry.no_voiding',
      ...[0, 1, 2, 3].map((i) => `grindless.machine.biofoundry.tooltip.${i}`),
      ...table.steps.map((s) => `gtceu.recipe.grindless_biofoundry.${s.name}`),
      'emi.grindless.info.engineered_seeds.0', 'emi.grindless.info.engineered_seeds.1'];
    for (const k of keys) if (!L[k]) problems.push(`${lang} ${k}`);
  }
  assert.deepEqual(problems, []);
});

test('the Universal Assembly Factory runs GTM\'s NPU recipe only on a ZPM hatch, never on two LuV hatches', () => {
  let modifiers = {};
  const chain = (id) => new Proxy({}, {
    get: (t, k) => (...args) => {
      if (k === 'recipeModifier') modifiers[id] = args[0];
      return chain(id);
    },
  });
  const ctx = {
    global: { grindless: {
      patterns: { controller: () => ({}), block: () => ({}), frame: () => ({}), air: () => ({}), part: () => ({}), oneOf: () => ({}), register: () => {}, build: () => {} },
      lv: { bores: (veto) => veto },
    } },
    GTCEuStartupEvents: { registry: (kind, cb) => cb({ create: (id) => chain(id) }) },
    RotationState: {}, GTBlocks: {}, Text: { translate: (k) => k }, console,
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(kubejs, 'startup_scripts', 'grindless', 'mv', 'leisure_factories.js'), 'utf8'), ctx);
  assert.equal(ctx.global.grindless.universalFactories.hatchVoltageLocked[NPU_RECIPE], 131072);
  const veto = modifiers.universal_assembly_factory;
  const type = { registryName: 'gtceu:circuit_assembler' };
  const machine = (v) => ({ getRecipeType: () => type, getEnergyContainer: () => ({ getHighestInputVoltage: () => v }) });
  const recipe = (id) => ({ getType: () => type, getId: () => id });
  assert.equal(veto(machine(32768), recipe(NPU_RECIPE)), true, 'two LuV hatches (each 32,768 V): refused');
  assert.equal(veto(machine(131072), recipe(NPU_RECIPE)), false, 'a ZPM hatch: allowed');
  assert.equal(veto(machine(32768), recipe('gtceu:circuit_assembler/wetware_board')), false, 'other recipes keep the two-hatch rule');
  assert.equal(veto({ getRecipeType: () => type, getEnergyContainer: () => { throw new Error('no hatches'); } }, recipe(NPU_RECIPE)), true);
  // the other three factories keep the mode veto only
  assert.equal(modifiers.universal_processing_factory(machine(32768), recipe(NPU_RECIPE)), false);
});

// GT--'s wetware recipe as the native dump has it (gtnn 1.3.10): the re-tier test feeds it to the stand-in as the original
const GTNN_WETWARE = {
  i: 'gtnn:circuit_assembly_line/wetware_processor_luv_soldering_alloy', t: 'gtceu:circuit_assembly_line',
  j: {
    type: 'gtceu:circuit_assembly_line', duration: 600, category: 'gtceu:circuit_assembly_line',
    recipeConditions: [{ research: [{ researchId: '1x_gtnn_etched_wetware_processor_base', dataItem: { id: 'gtceu:data_stick', Count: 1,
      tag: { assembly_line_research: { research_type: 'gtceu:circuit_assembly_line', research_id: '1x_gtnn_etched_wetware_processor_base' } } } }],
      type: 'research' }],
    tickInputs: { eu: [{ content: 38400 }] },
    inputs: {
      fluid: [{ content: { amount: 72, value: [{ tag: 'forge:soldering_alloy' }] } }],
      item: [['gtceu:neuro_processing_unit', 16], ['gtceu:crystal_cpu', 16], ['gtnn:warp_nano_cpu_chip', 1], ['gtnn:wrap_advanced_smd_capacitor', 8],
        ['gtnn:wrap_advanced_smd_transistor', 8], ['gtceu:yttrium_barium_cuprate_quadruple_wire', 8]]
        .map(([item, count]) => ({ content: { type: 'gtceu:sized', count, ingredient: { item } } })),
    },
    outputs: { item: [{ content: { type: 'gtceu:sized', count: 32, ingredient: { item: 'gtceu:wetware_processor' } } }] },
  },
};

test('GT--\'s wetware recipe comes back at LuV voltage with the same energy, its inputs in order and its research id', () => {
  const r = runPackScripts(pack, { originals: [GTNN_WETWARE] });
  const mine = r.errors.filter((e) => /circuit_line/.test(String(e.file)) && !/no gtceu:molten_cerrobase_140 route/.test(e.message));
  assert.deepEqual(mine, [], mine.map((e) => e.message).join('\n'));
  assert.ok(r.logs.some((l) => /circuit_line/.test(l.file) && /\(38400 EU\/t x 600 t\) -> grindless:circuit_assembly_line\/wetware_processor_luv \(30720 EU\/t x 750 t\)/.test(l.text)));
  const added = r.docs.recipes.recipes.find((x) => x.i === 'grindless:circuit_assembly_line/wetware_processor_luv');
  assert.ok(added, 'the re-tiered recipe');
  assert.equal(added.t, 'gtceu:circuit_assembly_line');
  assert.equal(added.j.tickInputs.eu[0].content, 30720);
  assert.deepEqual(added.j.inputs.item.map((x) => x.content.ingredient.item + ' x' + x.content.count),
    GTNN_WETWARE.j.inputs.item.map((x) => x.content.ingredient.item + ' x' + x.content.count), 'the same inputs, in the same order');
  assert.deepEqual(added.j.inputs.fluid.map((x) => x.content.value[0].fluid + ' ' + x.content.amount), ['gtceu:soldering_alloy 72']);
  assert.deepEqual(added.j.outputs.item.map((x) => x.content.ingredient.item + ' x' + x.content.count), ['gtceu:wetware_processor x32']);
  assert.ok(JSON.stringify(added.j.recipeConditions).includes('1x_gtnn_etched_wetware_processor_base'), 'research id');
  assert.ok(r.removals.some((x) => x.filter.includes(GTNN_WETWARE.i)), 'GT--\'s original removed by id');
  // without the original nothing is removed, and it says why
  const none = runPackScripts(pack);
  assert.ok(!none.removals.some((x) => x.filter.includes(GTNN_WETWARE.i)));
  assert.ok(none.errors.some((e) => /circuit_line/.test(String(e.file)) && /left as it is: no original recipe/.test(e.message)));
});

// GTM's melting of one cerrobase ingot as the native dump has it (C3 run luv-c3-s1): the molten route copies its price
const CERROBASE_MELT = {
  i: 'gtceu:extractor/extract_cerrobase_140_ingot', t: 'gtceu:extractor',
  j: {
    type: 'gtceu:extractor', duration: 181, category: 'gtceu:extractor', tickInputs: { eu: [{ content: 120 }] },
    inputs: { item: [{ content: { type: 'gtceu:sized', count: 1, ingredient: { tag: 'forge:ingots/cerrobase_140' } } }] },
    outputs: { fluid: [{ content: { amount: 144, value: [{ fluid: 'gtceu:cerrobase_140' }] } }] },
  },
};
const MOLTEN_CERROBASE = 'gtceu:molten_cerrobase_140';
const LINE_RECIPE = 'gtnn:assembly_line/circuit_assembly_line';

test('molten cerrobase 140 has a route: GTM\'s liquid in the fluid heater at GTM\'s melting price, so GT--\'s line can be built', () => {
  const r = runPackScripts(pack, { originals: [CERROBASE_MELT] });
  const mine = r.errors.filter((e) => /circuit_line/.test(String(e.file)) && !/wetware_processor_luv_soldering_alloy left as it is/.test(e.message));
  assert.deepEqual(mine, [], mine.map((e) => e.message).join('\n'));
  const added = r.docs.recipes.recipes.find((x) => x.i === 'grindless:fluid_heater/molten_cerrobase_140');
  assert.ok(added, 'grindless:fluid_heater/molten_cerrobase_140');
  assert.equal(added.t, 'gtceu:fluid_heater');
  assert.equal(added.j.tickInputs.eu[0].content, 120);
  // the stand-in keeps no duration: the script's own line says it
  assert.ok(r.logs.some((l) => /circuit_line/.test(l.file) &&
    /grindless:fluid_heater\/molten_cerrobase_140: 144 mB gtceu:cerrobase_140 -> gtceu:molten_cerrobase_140, 120 EU\/t x 181 t \(from gtceu:extractor\/extract_cerrobase_140_ingot\)/.test(l.text)));
  assert.deepEqual(added.j.inputs.fluid.map((x) => x.content.value[0].fluid + ' ' + x.content.amount), ['gtceu:cerrobase_140 144']);
  assert.deepEqual(added.j.outputs.fluid.map((x) => x.content.value[0].fluid + ' ' + x.content.amount), [MOLTEN_CERROBASE + ' 144']);
  assert.deepEqual(added.j.inputs.item.map((x) => x.content.type === 'gtceu:circuit' ? 'circuit ' + x.content.configuration : JSON.stringify(x.content)),
    ['circuit 1'], 'only the programmed circuit');
  // the only fluid heater recipe that takes liquid cerrobase: one recipe per lookup path
  assert.equal(r.docs.recipes.recipes.filter((x) => x.t === 'gtceu:fluid_heater' && JSON.stringify(x.j.inputs || {}).includes('cerrobase_140')).length, 1);
  // without GTM's ingot extraction there is no price to copy: no recipe, and it says why
  const none = runPackScripts(pack);
  assert.ok(!none.docs.recipes.recipes.some((x) => x.i === 'grindless:fluid_heater/molten_cerrobase_140'));
  assert.ok(none.errors.some((e) => /circuit_line/.test(String(e.file)) && /no gtceu:molten_cerrobase_140 route/.test(e.message)));
});

test('molten cerrobase 140 is no longer hidden (its recipe is ours: EMI drops a recipe with a stack hidden with its recipes)', () => {
  const hidden = JSON.parse(fs.readFileSync(path.join(kubejs, 'data', 'grindless', 'tables', 'hidden_until.json'), 'utf8')).groups;
  assert.deepEqual(hidden.filter((g) => (g.fluids || []).includes(MOLTEN_CERROBASE)).map((g) => g.material), []);
  const rules = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'analysis', 'tiers', 'obtain.json'), 'utf8')).obtain.classes;
  // v0.8.0: the hidden table was regenerated from C3's dump, taken before this recipe; an A rule (a source, never hidden) names it for
  // cerrobase 140 and the line until the next dump finds both obtainable (v0.11.0's obtain dump 20261028-014809 did: the rule is gone)
  assert.deepEqual(rules.filter((c) => (c.materials || []).includes('cerrobase_140') && c.class !== 'A'), [], 'no obtain rule hides cerrobase 140');
  const line = rules.find((c) => (c.materials || []).includes('gtnn:circuit_assembly_line'));
  assert.ok(!line || (line.class === 'A' ? /fluid_heater\/molten_cerrobase_140/.test(line.source) : line.until === 'luv' && !/missing molten cerrobase/.test(line.reason)),
    'the line is LuV content with a source for its molten cerrobase');
});

test('GG_NATIVE_DUMP: the pinned ids exist in a native dump', { skip: !process.env.GG_NATIVE_DUMP }, () => {
  const dir = process.env.GG_NATIVE_DUMP;
  const reg = JSON.parse(fs.readFileSync(path.join(dir, 'items.json'), 'utf8'));
  const items = new Set(reg.items);
  const fluids = new Set(reg.fluids);
  const recipeIds = new Set(JSON.parse(fs.readFileSync(path.join(dir, 'recipes.json'), 'utf8')).recipes.map((s) => JSON.parse(s).i));
  // a dump taken with A5 loaded has our re-tiered wetware recipe instead of GT--'s (removed by id); an older one has GT--'s
  const retiered = recipeIds.has('grindless:circuit_assembly_line/wetware_processor_luv');
  assert.notEqual(retiered, recipeIds.has(GTNN_WETWARE.i), 'exactly one of GT--\'s wetware recipe and ours');
  const missing = [
    ...[...VERIFIED_BLOCKS, ...VERIFIED_ITEMS].filter((id) => !items.has(id)),
    ...VERIFIED_FLUIDS.filter((id) => !fluids.has(id)),
    ...[...VERIFIED_STAGES, NPU_RECIPE, 'gtceu:scanner/1_x_gtnn_etched_wetware_processor_base'].filter((id) => !recipeIds.has(id)),
    ...['gtceu:soldering_alloy'].filter((id) => !fluids.has(id)),
    ...GTNN_WETWARE.j.inputs.item.map((x) => x.content.ingredient.item).filter((id) => !items.has(id)),
    ...VERIFIED_KEYS.filter((k) => !(k.startsWith('i:') ? items : fluids).has(k.slice(2))),
  ];
  assert.deepEqual(missing, []);
  const all = JSON.parse(fs.readFileSync(path.join(dir, 'recipes.json'), 'utf8')).recipes.map((s) => JSON.parse(s));
  if (retiered) {
    const ours = all.find((r) => r.i === 'grindless:circuit_assembly_line/wetware_processor_luv');
    assert.equal(ours.j.tickInputs.eu[0].content, 30720);
    assert.equal(ours.j.duration, 750);
    assert.deepEqual(ours.j.inputs.item.map((x) => JSON.stringify(x.content.ingredient) + x.content.count),
      GTNN_WETWARE.j.inputs.item.map((x) => JSON.stringify(x.content.ingredient) + x.content.count), 'GT--\'s inputs, in order');
  } else {
    const live = all.find((r) => r.i === GTNN_WETWARE.i);
    const shape = (j) => JSON.stringify([j.duration, j.tickInputs, j.recipeConditions, j.inputs.item, j.inputs.fluid, j.outputs.item]);
    assert.equal(shape(live.j), shape(GTNN_WETWARE.j), 'the pinned copy of GT--\'s wetware recipe is the native one');
  }
  // molten cerrobase: GTM's ingot melt as pinned, the fluids exist, and GT--'s line asks for the molten one through its tag
  const melt = all.find((x) => x.i === CERROBASE_MELT.i);
  const meltShape = (j) => JSON.stringify([j.duration, j.tickInputs, j.inputs, j.outputs]);
  assert.equal(meltShape(melt.j), meltShape(CERROBASE_MELT.j), 'the pinned copy of GTM\'s cerrobase ingot melt is the native one');
  for (const f of ['gtceu:cerrobase_140', MOLTEN_CERROBASE]) assert.ok(fluids.has(f), f);
  const tags = JSON.parse(fs.readFileSync(path.join(dir, 'tags.json'), 'utf8'));
  assert.deepEqual((tags.fluid || {})['forge:molten_cerrobase_140'], [MOLTEN_CERROBASE]);
  assert.ok(!((tags.fluid || {})['forge:cerrobase_140'] || []).includes(MOLTEN_CERROBASE), 'the heater\'s input tag never matches its output');
  const line = all.find((x) => x.i === LINE_RECIPE);
  assert.ok(JSON.stringify(line.j.inputs.fluid).includes('"forge:molten_cerrobase_140"'), 'GT--\'s line takes molten cerrobase');
  const made = all.filter((x) => JSON.stringify(x.j.outputs || {}).includes('"' + MOLTEN_CERROBASE + '"')).map((x) => x.i);
  assert.ok(made.every((id) => id === 'grindless:fluid_heater/molten_cerrobase_140'), 'only our route makes it: ' + made.join(', '));
});
