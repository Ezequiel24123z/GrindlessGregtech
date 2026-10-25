// Tests for what the MV tier adds: config inheritance by id, per-machine parts, GTM config read as booleans
// and the reason a fluid deposit doesn't allow the dimension.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadTierConfig } from '../lib/config.mjs';
import { gf, gi, gt, mkDump, run, shaped, shapeless, verdicts } from './helpers.mjs';

const TIERS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'tiers');
const linesOf = (list, id) => list.find((r) => r.target.id === id).lines.join('\n');
const dups = (ids) => ids.filter((id, i) => ids.indexOf(id) !== i);

// ---------------------------------------------------------------- real tier config

for (const tier of ['steam', 'lv', 'mv', 'hv']) {
  test(`tier ${tier} config: unique ids, every target has a valid shape, and "without" entries point at synthetics that exist`, () => {
    const { raw } = loadTierConfig({ tier }, TIERS);
    assert.deepEqual(dups(raw.targets.map((t) => t.id)), [], 'duplicate target ids');
    assert.deepEqual(dups(raw.autoTargets.map((t) => t.id)), [], 'duplicate autoTargets ids');
    assert.deepEqual(dups(raw.machines.map((m) => m.id || m.machine)), [], 'duplicate machines');
    assert.deepEqual(dups(raw.synthetic.map((s) => s.id)), [], 'duplicate synthetics');
    assert.deepEqual(dups(raw.world.map((w) => w.id).filter(Boolean)), [], 'duplicate world entries');
    const synthetic = new Set(raw.synthetic.map((s) => s.id));
    for (const t of [...raw.targets, ...raw.autoTargets]) {
      assert.ok(t.item || t.fluid || t.anyOf || t.allOf || t.kind === 'recipe', `target ${t.id} has no item, fluid, anyOf, allOf, or kind`);
      for (const w of t.without || []) {
        if (w.startsWith('synthetic:')) assert.ok(synthetic.has(w.slice('synthetic:'.length)), `${t.id}: without "${w}" but that synthetic doesn't exist`);
      }
    }
    assert.deepEqual(dups(raw.targets.map((t) => t.label)), [], 'duplicate labels: two targets say the same thing');
  });
}

test('child tier: an element with the same id replaces the parent\'s, and dropTargets removes what no longer applies', () => {
  const { raw: lv } = loadTierConfig({ tier: 'lv' }, TIERS);
  const { raw: mv } = loadTierConfig({ tier: 'mv' }, TIERS);
  const ids = (cfg) => cfg.targets.map((t) => t.id);
  // LV's leak checks stop holding in MV: they're gone, replaced by the positive target
  for (const id of ['silicon-gt-not-before-mv', 'coil-kanthal-not-before-mv']) {
    assert.ok(ids(lv).includes(id));
    assert.ok(!ids(mv).includes(id));
  }
  assert.ok(ids(mv).includes('silicon-gt') && ids(mv).includes('coil-kanthal'));
  // the rest of LV's targets are inherited (regression): including the leaks that still apply
  assert.ok(ids(mv).includes('recipe-aluminium-ebf') && ids(mv).includes('recipe-obsidian-arc'));
  assert.ok(mv.autoTargets.some((t) => t.id === 'auto-lava-not-automatic'));
  // LV's EBF is inherited with its id, and MV's variants are added with their own ids
  const ebf = mv.machines.filter((m) => m.machine === 'gtceu:electric_blast_furnace').map((m) => m.id || m.machine).sort();
  assert.deepEqual(ebf, [
    'gtceu:electric_blast_furnace', 'gtceu:electric_blast_furnace@lv-kanthal', 'gtceu:electric_blast_furnace@mv-cupronickel',
    'gtceu:electric_blast_furnace@mv-kanthal',
  ]);
  // maps are merged key by key: MV adds MV hatches to the abilities and inherits the conditions
  assert.ok(mv.partAbilities.energy_input.includes('gtceu:lv_energy_input_hatch') && mv.partAbilities.energy_input.includes('gtceu:mv_energy_input_hatch'));
  assert.deepEqual(mv.partAbilities.maintenance, ['gtceu:maintenance_hatch']);
  assert.equal(mv.conditions.environmental_hazard.unsupported, true);
  assert.deepEqual(mv.contexts, lv.contexts);
});

// ---------------------------------------------------------------- per-machine parts

function hatchPack() {
  const recipes = [
    shaped('t:drill', ['H'], { H: { item: 't:hull' } }, 't:drill'),
    shaped('t:hatch_lv', ['I'], { I: { item: 't:ingot' } }, 't:lv_hatch'),
    shaped('t:casing', ['I'], { I: { item: 't:ingot' } }, 't:casing'),
    shaped('t:hull', ['I'], { I: { item: 't:ingot' } }, 't:hull'),
    shaped('t:mv_hatch_recipe', ['X'], { X: { item: 't:never' } }, 't:mv_hatch'),
  ];
  const structures = {
    't:drill': {
      id: 't:drill',
      slices: [['XXS']],
      symbols: {
        S: { kind: 'controller' },
        X: { kind: 'oneOf', options: [{ kind: 'blocks', blocks: ['t:casing'], limits: { min: 1 } }, { kind: 'part', ability: 'energy_input', limits: { max: 2 } }] },
      },
    },
  };
  const cfg = (machineAbilities) => ({
    tier: 'parts',
    unconditionalTypes: ['minecraft:crafting_shaped'],
    partAbilities: { energy_input: ['t:lv_hatch', 't:mv_hatch'] },
    world: [{ id: 'w', mode: 'manual', items: ['t:ingot'] }],
    machines: [{ machine: 't:drill', types: [], partsFromStructure: true, ...(machineAbilities ? { partAbilities: machineAbilities } : {}) }],
    targets: [{ id: 'machine', item: 'm:t:drill' }],
    autoTargets: [],
  });
  const dump = mkDump({ recipes, items: ['t:ingot', 't:drill', 't:never', 't:lv_hatch', 't:mv_hatch'], structures });
  return { dump, cfg };
}

test('machines[].partAbilities: the machine only requires the hatch it names, even if the tier allows others for that ability', () => {
  const { dump, cfg } = hatchPack();
  // with the tier's list, the LV hatch is enough
  assert.equal(run(dump, cfg()).out.verdict, 'PASS');
  // the machine requires the MV hatch, which nobody knows how to make: the chain names it
  const r = run(dump, cfg({ energy_input: ['t:mv_hatch'] }));
  assert.equal(r.out.verdict, 'FAIL');
  assert.match(linesOf(r.out.gate, 'machine'), /t:mv_hatch/);
  // the override is key by key and doesn't touch the other abilities
  assert.deepEqual(verdicts(run(dump, cfg({ other_ability: ['t:x'] })).out.gate), { machine: 'PASS' });
});

// ---------------------------------------------------------------- GTM config as booleans

test('config.json: booleans written as text by older dumps are read as booleans', () => {
  const dump = mkDump({ config: { a: 'true', b: 'false', c: null, d: true, e: 5, f: 'other' } });
  assert.deepEqual(dump.config, { a: true, b: false, c: null, d: true, e: 5, f: 'other' });
});

// ---------------------------------------------------------------- parts that depend on GTM config

test('parts with onlyIf: GTM doesn\'t require the part when the config says not to (maintenance), and it\'s still required if it can\'t be read', () => {
  const recipes = [
    shaped('t:ebf_recipe', ['H'], { H: { item: 't:hull' } }, 't:ebf'),
    shaped('t:hull_recipe', ['I'], { I: { item: 't:ingot' } }, 't:hull'),
  ];
  const cfg = {
    tier: 'maintenance',
    unconditionalTypes: ['minecraft:crafting_shaped'],
    world: [{ id: 'w', mode: 'manual', items: ['t:ingot'] }],
    machines: [{
      machine: 't:ebf', types: [],
      parts: ['t:hull', { anyOf: ['t:maintenance'], onlyIf: { config: 'machines.enableMaintenance', equals: true } }],
    }],
    targets: [{ id: 'ebf', item: 'm:t:ebf' }],
    autoTargets: [],
  };
  const dump = (config) => mkDump({ recipes, items: ['t:ingot', 't:ebf', 't:hull', 't:maintenance'], config });
  // with maintenance on, the hatch (which nobody makes) is mandatory
  const on = run(dump({ 'machines.enableMaintenance': true }), cfg);
  assert.equal(on.out.verdict, 'FAIL');
  assert.match(linesOf(on.out.gate, 'ebf'), /t:maintenance/);
  assert.deepEqual(on.model.stats.partsNotRequired, []);
  // without maintenance the machine is built without it, and the report says so
  const off = run(dump({ 'machines.enableMaintenance': false }), cfg);
  assert.equal(off.out.verdict, 'PASS');
  assert.equal(off.model.stats.partsNotRequired.length, 1);
  assert.match(off.text, /part the GTM config doesn't require: .*machines\.enableMaintenance = false; only required with true.* in t:ebf/);
  // unreadable config or no config.json: still required, and it warns
  const unknown = run(dump(null), cfg);
  assert.equal(unknown.out.verdict, 'FAIL');
  assert.match(unknown.model.warnings.join('\n'), /can't check config machines\.enableMaintenance \(the dump has no config\.json\); the part is still required/);
});

// ---------------------------------------------------------------- vein targets with the drill's table

test('vein targets: requireItem skips veins with no item in the table (other mods) and lists them; {id} strips "_vein" in the middle too', () => {
  const veins = [
    { id: 'gtceu:redstone_vein_ow', layer: 'deepslate', dims: ['minecraft:overworld'], mats: ['gtceu:ruby'] },
    { id: 'gtceu:topaz_vein', layer: 'netherrack', dims: ['minecraft:the_nether'], mats: ['gtceu:topaz'] },
    { id: 'gtnn:apatite_vein_tf', layer: 'tf', dims: ['minecraft:overworld'], mats: ['gtceu:apatite'] },
  ];
  const recipes = [
    gt('t:drill_ow', 'gtceu:vein_drilling', { ins: [gi('grindless:vein_sample_redstone_ow', 1, 0)], outs: [gi('gtceu:raw_ruby')] }),
  ];
  const cfg = {
    tier: 'table',
    machines: [{ machine: 't:drill', types: ['gtceu:vein_drilling'] }],
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:drill', 'grindless:vein_sample_redstone_ow', 'grindless:vein_sample_topaz'] }],
    targets: [],
    autoTargets: [],
    autoTargetsFromVeins: [{
      idPrefix: 'p-', dimensions: ['minecraft:overworld', 'minecraft:the_nether'], requireItem: 'grindless:vein_sample_{id}',
      target: { kind: 'recipe', type: 'gtceu:vein_drilling', input: 'grindless:vein_sample_{id}' },
    }],
  };
  const dump = mkDump({ recipes, veins, items: ['t:drill', 'gtceu:raw_ruby', 'grindless:vein_sample_redstone_ow', 'grindless:vein_sample_topaz'] });
  const r = run(dump, cfg);
  assert.deepEqual(r.out.auto.map((x) => x.target.id), ['p-redstone_vein_ow', 'p-topaz_vein']);
  assert.equal(r.out.auto[0].target.input, 'grindless:vein_sample_redstone_ow');
  assert.equal(r.out.auto[0].verdict, 'PASS');
  // the Nether vein's has no recipe: FAIL; the other mod's isn't even a target
  assert.equal(r.out.auto[1].verdict, 'FAIL');
  assert.deepEqual(r.model.stats.veinsWithoutItem, ['gtnn:apatite_vein_tf']);
  assert.match(r.text, /registry veins the drill's table doesn't offer \(no sample or no drilling recipe.*; not checked\): gtnn:apatite_vein_tf/);
  // requireRecipe looks at the recipes: the topaz sample exists (like a hidden sample from a set-aside vein) but no
  // drilling recipe takes it, so the vein has no target; neither does the other mod's
  const byRecipe = run(dump, {
    ...cfg,
    autoTargetsFromVeins: [{
      ...cfg.autoTargetsFromVeins[0], requireItem: undefined,
      requireRecipe: { type: 'gtceu:vein_drilling', input: 'grindless:vein_sample_{id}' },
    }],
  });
  assert.deepEqual(byRecipe.out.auto.map((x) => [x.target.id, x.verdict]), [['p-redstone_vein_ow', 'PASS']]);
  assert.deepEqual(byRecipe.model.stats.veinsWithoutItem, ['gtceu:topaz_vein', 'gtnn:apatite_vein_tf']);
});

test('world with fromVeins.requireRecipe: a set-aside vein (registered sample, no drilling recipe) gives no ore on the trip', () => {
  const veins = [
    { id: 'gtceu:bauxite_vein_end', layer: 'endstone', dims: ['minecraft:the_end'], mats: ['gtceu:bauxite', 'gtceu:ilmenite'] },
    { id: 'gtceu:scheelite_vein', layer: 'endstone', dims: ['minecraft:the_end'], mats: ['gtceu:scheelite', 'gtceu:tungstate'] },
  ];
  const recipes = [
    gt('t:drill_end', 'gtceu:vein_drilling', { ins: [gi('grindless:vein_sample_bauxite_end', 1, 0)], outs: [gi('gtceu:raw_bauxite')] }),
    // the set-aside sample only converts into an empty probe
    shapeless('t:probe_from_scheelite', [{ item: 'grindless:vein_sample_scheelite' }], 'grindless:empty_vein_probe'),
  ];
  const world = (from) => [{ id: 'end-ores', mode: 'manual', bootstrap: true, template: 'gtceu:raw_{m}', materials: [], fromVeins: { dimensions: ['minecraft:the_end'], ...from } }];
  const cfg = (from) => ({
    tier: 'end', unconditionalTypes: ['minecraft:crafting_shapeless'], world: world(from),
    targets: [{ id: 'bauxite', item: 'gtceu:raw_bauxite' }, { id: 'ilmenite', item: 'gtceu:raw_ilmenite' }, { id: 'scheelite', item: 'gtceu:raw_scheelite' }],
    autoTargets: [],
  });
  const dump = mkDump({
    recipes, veins,
    items: ['gtceu:raw_bauxite', 'gtceu:raw_ilmenite', 'gtceu:raw_scheelite', 'gtceu:raw_tungstate', 'grindless:vein_sample_bauxite_end', 'grindless:vein_sample_scheelite'],
  });
  // with requireItem the hidden sample still counts the scheelite vein
  assert.deepEqual(verdicts(run(dump, cfg({ requireItem: 'grindless:vein_sample_{id}' })).out.gate), { bauxite: 'PASS', ilmenite: 'PASS', scheelite: 'PASS' });
  // with requireRecipe only veins with a drilling recipe count: bauxite's (with its ilmenite) does, scheelite's doesn't
  const r = run(dump, cfg({ requireRecipe: { type: 'gtceu:vein_drilling', input: 'grindless:vein_sample_{id}' } }));
  assert.deepEqual(verdicts(r.out.gate), { bauxite: 'PASS', ilmenite: 'PASS', scheelite: 'FAIL' });
});

// ---------------------------------------------------------------- reason a deposit blocks

test('a deposit that doesn\'t allow the dimension is the missing root even if another distant recipe produces the fluid', () => {
  const recipes = [
    gt('t:soul_oil', 't:centrifuge', { ins: [gi('t:soul_sand')], fouts: [gf('t:oil')] }),
    shaped('t:rig_recipe', ['I'], { I: { item: 't:ingot' } }, 't:rig'),
  ];
  const cfg = (dimension) => ({
    tier: 'oil',
    dimension,
    unconditionalTypes: ['minecraft:crafting_shaped'],
    machines: [{ machine: 't:rig', types: [] }, { machine: 't:centrifuge', types: ['t:centrifuge'] }],
    world: [
      { id: 'ingots', mode: 'manual', bootstrap: true, items: ['t:ingot'] },
      { id: 'deposits', mode: 'auto', via: ['t:rig'], fromFluidVeins: true },
    ],
    targets: [],
    autoTargets: [{ id: 'oil', fluid: 't:oil' }],
  });
  const dump = mkDump({
    recipes, items: ['t:ingot', 't:rig', 't:centrifuge', 't:soul_sand'], fluids: ['t:oil'],
    fluidVeins: [{ id: 'gtceu:oil_deposit', fluid: 't:oil', weight: 20, dims: ['minecraft:overworld'] }],
  });
  assert.equal(run(dump, cfg('minecraft:overworld')).out.verdict, 'PASS');
  const flat = run(dump, cfg('grindless:flat'));
  assert.equal(flat.out.verdict, 'FAIL');
  const text = linesOf(flat.out.auto, 'oil');
  assert.match(text, /deposit gtceu:oil_deposit only allows minecraft:overworld; this analysis is in grindless:flat/);
  assert.doesNotMatch(text, /soul_sand/);
});
