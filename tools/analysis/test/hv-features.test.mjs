// Tests for what the HV tier adds: the cleanroom condition that requires a built machine, the gate's leak checks
// (`without` + expect "unreachable"), ores that require an item first (the End's key), and vein gathering
// filtered by the drill's table.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadTierConfig } from '../lib/config.mjs';
import { gi, gt, mkDump, run, shaped, verdicts } from './helpers.mjs';

const TIERS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'tiers');
const linesOf = (list, id) => list.find((r) => r.target.id === id).lines.join('\n');

// ---------------------------------------------------------------- real tier config

test('tier hv: inherits from MV, drops the two End checks the Moon invalidates, and the cleanroom goes from unsupported to requiring the machine', () => {
  const { raw: mv } = loadTierConfig({ tier: 'mv' }, TIERS);
  const { raw: hv } = loadTierConfig({ tier: 'hv' }, TIERS);
  const ids = (cfg) => cfg.targets.map((t) => t.id);
  // v0.5.0: the End (and with it the ender eye and the blaze) belongs to MV; in HV the Moon also gives ilmenite and chromite
  for (const id of ['ilmenite-not-comes-from-end', 'end-ores-without-key']) {
    assert.ok(ids(mv).includes(id), `${id} should be in MV`);
    assert.ok(!ids(hv).includes(id), `${id} no longer applies in HV`);
  }
  for (const id of ['ender-eye-not-before-hv', 'dust-blaze-not-before-hv', 'rod-blaze-not-before-hv']) {
    assert.ok(!ids(mv).includes(id) && !ids(hv).includes(id), `${id}: the ender eye and the blaze already belong to MV`);
  }
  for (const id of ['end-key', 'ender-eye', 'end-ores-with-key']) assert.ok(ids(hv).includes(id), `${id} is inherited from MV`);
  // the HV hatch stops being optional (the same id replaces the MV one)
  assert.equal(mv.targets.find((t) => t.id === 'hatch-energy-hv').optional, true);
  assert.ok(!hv.targets.find((t) => t.id === 'hatch-energy-hv').optional);
  // the regression is inherited: AE2's whole base in LV, MV's EBF, and the leaks that still apply
  for (const id of ['component-256k', 'recipe-ebf-stable', 'recipe-aluminium-ebf', 'recipe-obsidian-arc']) assert.ok(ids(hv).includes(id), id);
  assert.ok(hv.autoTargets.some((t) => t.id === 'auto-lava-not-automatic'));
  // the cleanroom: the parent declares it unsupported and the child replaces it wholesale (maps merge key by key)
  assert.equal(mv.conditions.cleanroom.unsupported, true);
  assert.ok(hv.conditions.cleanroom.needsByField);
  assert.equal(hv.conditions.cleanroom.unsupported, undefined);
  assert.equal(hv.conditions.research.unsupported, true);
  assert.deepEqual(hv.contexts, mv.contexts);
  // machine registry entries add up: HV adds the gtceu:hv_ prefix to LV's and MV's
  assert.deepEqual(hv.machinesFromRegistry.map((m) => m.prefix), ['gtceu:lv_', 'gtceu:mv_', 'gtceu:hv_']);
});

test('tier hv: the "without" entries point at something that exists (synthetic, world entry, or build rule of a declared machine)', () => {
  const { raw } = loadTierConfig({ tier: 'hv' }, TIERS);
  const synthetic = new Set(raw.synthetic.map((s) => s.id));
  const world = new Set(raw.world.map((w) => w.id));
  const machines = raw.machines.map((m) => m.id || m.machine);
  for (const t of [...raw.targets, ...raw.autoTargets]) {
    for (const w of t.without || []) {
      if (w.startsWith('synthetic:')) assert.ok(synthetic.has(w.slice('synthetic:'.length)), `${t.id}: ${w}`);
      else if (w.startsWith('world:')) assert.ok(world.has(w.slice('world:'.length)), `${t.id}: ${w}`);
      else if (w.startsWith('build:') || w.startsWith('operate:')) {
        const re = new RegExp('^' + w.slice(w.indexOf(':') + 1).replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
        assert.ok(machines.some((m) => re.test(m)), `${t.id}: no machine id matches ${w}`);
      }
    }
  }
});

test('tier hv: the model builds with an almost-empty dump and no invalid selectors (targets fail with a reason, not with exceptions)', () => {
  const { raw } = loadTierConfig({ tier: 'hv' }, TIERS);
  const dump = mkDump({ recipes: [], items: ['gtceu:cleanroom', 'gtceu:vacuum_freezer'] });
  const r = run(dump, raw);
  assert.equal(r.out.verdict, 'FAIL');
  assert.ok(r.out.gate.length > 100 && r.out.auto.length > 50);
  assert.deepEqual(r.model.warnings.filter((w) => /invalid selector/.test(w)), []);
});

// ---------------------------------------------------------------- cleanroom condition

function cleanroomPack({ withControllerRecipe = true } = {}) {
  const clean = [{ type: 'cleanroom', cleanroom: 'cleanroom' }];
  const sterile = [{ type: 'cleanroom', cleanroom: 'sterile_cleanroom' }];
  const recipes = [
    ...(withControllerRecipe ? [shaped('t:cr', ['I'], { I: { item: 't:ingot' } }, 't:cleanroom')] : []),
    shaped('t:asm', ['I'], { I: { item: 't:ingot' } }, 't:assembler'),
    gt('t:chip_clean', 't:asm_type', { ins: [gi('t:ingot')], outs: [gi('t:chip')], conditions: clean }),
    gt('t:chip_sterile', 't:asm_type', { ins: [gi('t:ingot')], outs: [gi('t:sterile_chip')], conditions: sterile }),
    gt('t:chip_plain', 't:asm_type', { ins: [gi('t:ingot')], outs: [gi('t:plain_chip')] }),
  ];
  const cfg = {
    tier: 'chamber',
    unconditionalTypes: ['minecraft:crafting_shaped'],
    conditions: { cleanroom: { needsByField: { field: 'cleanroom', map: { cleanroom: ['run:t:cleanroom'] } } } },
    world: [{ id: 'ingots', mode: 'auto', items: ['t:ingot'] }],
    machines: [
      { machine: 't:assembler', types: ['t:asm_type'] },
      { machine: 't:cleanroom', types: [] },
    ],
    targets: [
      { id: 'chip', item: 't:chip' },
      { id: 'chip-sterile', item: 't:sterile_chip' },
      { id: 'chip-without-chamber', item: 't:plain_chip' },
      { id: 'chamber', item: 'run:t:cleanroom' },
    ],
    autoTargets: [{ id: 'auto-chip', item: 't:chip' }],
  };
  const dump = mkDump({ recipes, items: ['t:ingot', 't:cleanroom', 't:assembler'] });
  return { dump, cfg };
}

test('conditions.needsByField: a cleanroom recipe requires the built machine; the sterile one and the unconditioned ones don\'t change', () => {
  const { dump, cfg } = cleanroomPack();
  const r = run(dump, cfg);
  assert.deepEqual(verdicts(r.out.gate), { chip: 'PASS', 'chip-sterile': 'FAIL', 'chip-without-chamber': 'PASS', chamber: 'PASS' });
  // the cleanroom is built once (capital): it also counts for the auto step
  assert.deepEqual(verdicts(r.out.auto), { 'auto-chip': 'PASS' });
  // the sterile variant has no entry in the map: it's still an unsupported condition, and it says so
  assert.match(linesOf(r.out.gate, 'chip-sterile'), /condition cleanroom «sterile_cleanroom»/);
});

test('conditions.needsByField: without the cleanroom controller, recipes with the condition go undone and the chain names the machine', () => {
  const { dump, cfg } = cleanroomPack({ withControllerRecipe: false });
  const r = run(dump, cfg);
  assert.deepEqual(verdicts(r.out.gate), { chip: 'FAIL', 'chip-sterile': 'FAIL', 'chip-without-chamber': 'PASS', chamber: 'FAIL' });
  assert.match(linesOf(r.out.gate, 'chip'), /t:cleanroom/);
  assert.match(linesOf(r.out.gate, 'chip'), /cleanroom «cleanroom»|cleanroom: run:t:cleanroom|run:t:cleanroom/);
  assert.deepEqual(verdicts(r.out.auto), { 'auto-chip': 'FAIL' });
});

test('conditions.needs (no field): a condition is met by a specific built part', () => {
  const recipes = [
    shaped('t:cr', ['I'], { I: { item: 't:ingot' } }, 't:vacuum_cell'),
    gt('t:cold', 't:asm_type', { ins: [gi('t:ingot')], outs: [gi('t:cold_chip')], conditions: [{ type: 'vacuum' }] }),
    shaped('t:asm', ['I'], { I: { item: 't:ingot' } }, 't:assembler'),
  ];
  const cfg = (withIt) => ({
    tier: 'cond',
    unconditionalTypes: ['minecraft:crafting_shaped'],
    conditions: { vacuum: withIt ? { needs: ['t:vacuum_cell'] } : { unsupported: true } },
    world: [{ id: 'ingots', mode: 'auto', items: ['t:ingot'] }],
    machines: [{ machine: 't:assembler', types: ['t:asm_type'] }],
    targets: [{ id: 'cold', item: 't:cold_chip' }],
    autoTargets: [],
  });
  const dump = mkDump({ recipes, items: ['t:ingot', 't:assembler', 't:vacuum_cell'] });
  assert.equal(run(dump, cfg(true)).out.verdict, 'PASS');
  assert.equal(run(dump, cfg(false)).out.verdict, 'FAIL');
});

// ---------------------------------------------------------------- gate leak checks (without)

function freezerPack({ leak = false } = {}) {
  const recipes = [
    shaped('t:freezer_recipe', ['I'], { I: { item: 't:ingot' } }, 't:freezer'),
    gt('t:cool', 't:vac', { ins: [gi('t:hot')], outs: [gi('t:ti')] }),
    ...(leak ? [shaped('t:alt', ['H'], { H: { item: 't:hot' } }, 't:ti')] : []),
  ];
  const cfg = {
    tier: 'leak',
    unconditionalTypes: ['minecraft:crafting_shaped'],
    world: [{ id: 'w', mode: 'manual', bootstrap: true, items: ['t:ingot', 't:hot'] }],
    machines: [{ id: 't:freezer@mv2', machine: 't:freezer', types: ['t:vac'] }],
    targets: [
      { id: 'ti', item: 't:ti' },
      { id: 'ti-only-with-freezer', item: 't:ti', without: ['build:t:freezer*'], expect: 'unreachable' },
      { id: 'ti-without-glob', item: 't:ti', without: ['build:t:freezer'], expect: 'unreachable' },
      { id: 'ti-without-freezer', item: 't:ti', without: ['build:t:freezer*'] },
      { id: 'recipe-cold', kind: 'recipe', type: 't:vac' },
      { id: 'recipe-cold-without-freezer', kind: 'recipe', type: 't:vac', without: ['build:t:freezer*'] },
    ],
    autoTargets: [],
  };
  const dump = mkDump({ recipes, items: ['t:ingot', 't:hot', 't:ti', 't:freezer'] });
  return { dump, cfg };
}

test('gate with `without`: scope is recomputed without those rules; the @ variant needs an asterisk in the glob', () => {
  const { dump, cfg } = freezerPack();
  const r = run(dump, cfg);
  assert.deepEqual(verdicts(r.out.gate), {
    ti: 'PASS',
    'ti-only-with-freezer': 'PASS', // without a freezer there's no titanium: the dependency holds
    'ti-without-glob': 'FAIL', // «build:t:freezer» doesn't match «build:t:freezer@mv2»: the freezer is still there and titanium is obtained
    'ti-without-freezer': 'FAIL',
    'recipe-cold': 'PASS',
    'recipe-cold-without-freezer': 'FAIL',
  });
  assert.match(linesOf(r.out.gate, 'ti-only-with-freezer'), /can't be obtained in this tier, as it should be/);
  assert.match(linesOf(r.out.gate, 'ti-without-glob'), /LEAK/);
  // the blocking chain is computed over the view without those rules, and names the missing machine
  assert.match(linesOf(r.out.gate, 'ti-without-freezer'), /t:vac|t:freezer/);
  assert.match(r.text, /\[without build:t:freezer\*\]/);
});

test('gate with `without`: if another path to the item exists, the leak check fails and shows that path', () => {
  const { dump, cfg } = freezerPack({ leak: true });
  const r = run(dump, cfg);
  assert.equal(verdicts(r.out.gate)['ti-only-with-freezer'], 'FAIL');
  const text = linesOf(r.out.gate, 'ti-only-with-freezer');
  assert.match(text, /LEAK/);
  assert.match(text, /t:alt/);
  // and targets with no `without` aren't affected by the recomputed view
  assert.equal(verdicts(r.out.gate).ti, 'PASS');
});

// ---------------------------------------------------------------- ores that require an item first (the End's key)

function endPack({ key = true, drill = true } = {}) {
  const recipes = [
    ...(key ? [shaped('t:key_recipe', ['I'], { I: { item: 't:ingot' } }, 't:key')] : []),
    shaped('t:sample_recipe', ['RR'], { R: { item: 't:end_ore' } }, 't:sample'),
    shaped('t:drill_recipe', ['I'], { I: { item: 't:ingot' } }, 't:drill'),
    ...(drill ? [gt('t:end_drill', 't:drilling', { ins: [gi('t:sample', 1, 0)], outs: [gi('t:end_ore')] })] : []),
  ];
  const cfg = {
    tier: 'end',
    unconditionalTypes: ['minecraft:crafting_shaped'],
    world: [
      { id: 'ingots', mode: 'auto', items: ['t:ingot'] },
      { id: 'end-ores', mode: 'manual', bootstrap: true, needs: ['t:key'], items: ['t:end_ore'] },
    ],
    machines: [{ machine: 't:drill', types: ['t:drilling'] }],
    targets: [
      { id: 'ore', item: 't:end_ore' },
      { id: 'sample', item: 't:sample' },
      { id: 'ore-without-trip', item: 't:end_ore', without: ['world:end-ores'], expect: 'unreachable' },
    ],
    autoTargets: [{ id: 'auto-ore', item: 't:end_ore' }],
  };
  const dump = mkDump({ recipes, items: ['t:ingot', 't:key', 't:sample', 't:drill', 't:end_ore'] });
  return { dump, cfg };
}

test('manual world with `needs`: with the key the ores are gathered (one trip), the drill resupplies them, and without the trip there\'s no ore', () => {
  const { dump, cfg } = endPack();
  const r = run(dump, cfg);
  // without the trip rule there's no ore, nor a sample for the drill: the key's dependency holds
  assert.deepEqual(verdicts(r.out.gate), { ore: 'PASS', sample: 'PASS', 'ore-without-trip': 'PASS' });
  assert.deepEqual(verdicts(r.out.auto), { 'auto-ore': 'PASS' });
  assert.match(linesOf(r.out.auto, 'auto-ore'), /sustained with/);
});

test('manual world with `needs`: ores that only come from the trip count as bootstrap (they run out), not as a resupplied resource', () => {
  const { dump, cfg } = endPack({ drill: false });
  const r = run(dump, cfg);
  assert.deepEqual(verdicts(r.out.gate), { ore: 'PASS', sample: 'PASS', 'ore-without-trip': 'PASS' });
  assert.equal(verdicts(r.out.auto)['auto-ore'], 'FAIL');
  assert.match(linesOf(r.out.auto, 'auto-ore'), /manual bootstrap; not resupplied/);
});

test('manual world with `needs`: without the required item (the key) there\'s no ore, sample, or bootstrap; the chain names the key', () => {
  const { dump, cfg } = endPack({ key: false });
  const r = run(dump, cfg);
  assert.deepEqual(verdicts(r.out.gate), { ore: 'FAIL', sample: 'FAIL', 'ore-without-trip': 'PASS' });
  assert.match(linesOf(r.out.gate, 'ore'), /t:key/);
  assert.match(linesOf(r.out.gate, 'ore'), /end-ores/);
  // without the key nobody reaches the ore: the drill has no sample either
  assert.deepEqual(verdicts(r.out.auto), { 'auto-ore': 'FAIL' });
});

// ---------------------------------------------------------------- vein gathering filtered by the table

test('world with fromVeins: each ore\'s item is resolved from the dump\'s registry (addon, vanilla, or gtceu), with no overrides', () => {
  const veins = [
    { id: 'gtceu:germanite_vein', layer: 'netherrack', dims: ['minecraft:the_nether'], mats: ['gtceu:germanite', 'gtceu:iron'] },
    { id: 'gtceu:zirconium_vein', layer: 'endstone', dims: ['minecraft:the_end'], mats: ['gtca:red_zircon', 'gtca:green_fuchsite'] },
    { id: 'gtceu:copper_vein', layer: 'stone', dims: ['minecraft:overworld'], mats: ['gtceu:copper', 'gtceu:chalcopyrite', 'gtceu:endstone'] },
  ];
  const cfg = {
    tier: 'spaces',
    world: [{ id: 'ores', mode: 'manual', bootstrap: true, template: 'gtceu:raw_{m}', materials: [], fromVeins: { dimensions: ['minecraft:the_nether', 'minecraft:the_end', 'minecraft:overworld'] } }],
    targets: [
      { id: 'germanite', item: 'gtca:raw_germanite' }, // the material says gtceu:germanite, but the vein lives in the addon
      { id: 'iron', item: 'minecraft:raw_iron' }, // no gtceu:raw_iron: falls back to vanilla
      { id: 'zircon', item: 'gtca:raw_red_zircon' },
      { id: 'fuchsite', item: 'gtca:raw_green_fuchsite' },
      { id: 'chalcopyrite', item: 'gtceu:raw_chalcopyrite' },
      { id: 'copper', item: 'minecraft:raw_copper' },
      { id: 'stone-from-end', item: 'gtceu:raw_endstone' }, // doesn't exist: it isn't invented
    ],
    autoTargets: [],
  };
  const dump = mkDump({
    veins,
    items: ['gtca:raw_germanite', 'minecraft:raw_iron', 'gtca:raw_red_zircon', 'gtca:raw_green_fuchsite', 'gtceu:raw_chalcopyrite', 'minecraft:raw_copper'],
  });
  const r = run(dump, cfg);
  assert.deepEqual(verdicts(r.out.gate), {
    germanite: 'PASS', iron: 'PASS', zircon: 'PASS', fuchsite: 'PASS', chalcopyrite: 'PASS', copper: 'PASS', 'stone-from-end': 'FAIL',
  });
  // `overrides` still works as a fallback when the dump has no item under that name
  const fallback = run(mkDump({ veins: [veins[2]], items: ['t:my_copper'] }), {
    ...cfg, world: [{ ...cfg.world[0], overrides: { copper: 't:my_copper' } }], targets: [{ id: 'copper', item: 't:my_copper' }],
  });
  assert.deepEqual(verdicts(fallback.out.gate), { copper: 'PASS' });
});

test('world with fromVeins.requireItem: only veins with a sample in the table give ores; the rest of the registry doesn\'t', () => {
  const veins = [
    { id: 'gtceu:bauxite_vein_end', layer: 'endstone', dims: ['minecraft:the_end'], mats: ['gtceu:bauxite', 'gtceu:ilmenite'] },
    { id: 'gtceu:naquadah_vein', layer: 'endstone', dims: ['minecraft:the_end'], mats: ['gtceu:naquadah'] },
    { id: 'gtceu:scheelite_vein', layer: 'endstone', dims: ['minecraft:the_end'], mats: ['gtceu:scheelite'] },
    { id: 'gtceu:zirconium_vein', layer: 'endstone', dims: ['minecraft:the_end'], mats: ['gtca:red_zircon', 'gtceu:endstone'] },
    { id: 'gtceu:iron_vein', layer: 'stone', dims: ['minecraft:overworld'], mats: ['gtceu:hematite'] },
  ];
  const cfg = {
    tier: 'table-end',
    world: [{
      id: 'end-ores', mode: 'manual', bootstrap: true, template: 'gtceu:raw_{m}', materials: [],
      fromVeins: { dimensions: ['minecraft:the_end'], requireItem: 'grindless:vein_sample_{id}' },
    }],
    targets: [
      { id: 'bauxite', item: 'gtceu:raw_bauxite' },
      { id: 'ilmenite', item: 'gtceu:raw_ilmenite' },
      { id: 'scheelite', item: 'gtceu:raw_scheelite' },
      { id: 'zircon', item: 'gtca:raw_red_zircon' },
      { id: 'naquadah', item: 'gtceu:raw_naquadah' },
      { id: 'hematite', item: 'gtceu:raw_hematite' },
    ],
    autoTargets: [],
  };
  const dump = mkDump({
    veins,
    items: [
      'gtceu:raw_bauxite', 'gtceu:raw_ilmenite', 'gtceu:raw_scheelite', 'gtceu:raw_naquadah', 'gtceu:raw_hematite', 'gtca:raw_red_zircon',
      'grindless:vein_sample_bauxite_end', 'grindless:vein_sample_scheelite', 'grindless:vein_sample_zirconium',
    ],
  });
  const r = run(dump, cfg);
  // the ore of an addon material (gtca:red_zircon) lives in the addon's namespace (gtca:raw_red_zircon)
  assert.deepEqual(verdicts(r.out.gate), {
    bauxite: 'PASS', ilmenite: 'PASS', scheelite: 'PASS', zircon: 'PASS', naquadah: 'FAIL', hematite: 'FAIL',
  });
});
