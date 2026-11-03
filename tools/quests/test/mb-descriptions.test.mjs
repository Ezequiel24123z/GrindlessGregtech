import test from 'node:test';
import assert from 'node:assert/strict';
import { describeController, describeAll, niceName, mainProducts, structureParts, tooltipsFromLang, DESC_MAX_CHARS, chapterSnbt, layoutBands } from '../multiblocks/mb-lib.mjs';

const base = { name: 'Electric Blast Furnace', ours: false, origin: 'GregTech', tooltip: null, types: ['gtceu:electric_blast_furnace'], io: [3, 3, 1, 1],
  products: [{ id: 'gtceu:hsla_steel_ingot', n: 4 }, { id: 'gtceu:steel_ingot', n: 2 }], parts: { casing: 'gtceu:heatproof_machine_casing', coil: 'gtceu:cupronickel_coil_block' },
  inputs: ['gtceu:mv_machine_hull', '#forge:plates/steel', '#gtceu:circuits/mv'], usedBy: ['Large Mixer'] };

test('names from ids and tags', () => {
  assert.equal(niceName('gtceu:steel_ingot'), 'Steel Ingot');
  assert.equal(niceName('#forge:plates/steel'), 'Steel plates');
  assert.equal(niceName('#gtceu:circuits/hv'), 'HV circuits');
});

test('a machine without a tooltip says what it is for, what it needs and what it unlocks', () => {
  const d = describeController(base);
  assert.match(d, /^A GregTech multiblock for Electric Blast Furnace recipes\./);
  assert.match(d, /Build it mostly from Heatproof Machine Casing, with Cupronickel coils\./);
  assert.match(d, /crafted from MV Machine Hull, Steel plates and MV circuits\./);
  assert.match(d, /Unlocks HSLA Steel Ingot and Steel Ingot\./);
  assert.match(d, /Automate it through input item buses and fluid hatches and output item buses and fluid hatches\./);
});

test('our tooltip leads the text, dashes are removed and the length is capped', () => {
  const d = describeController({ ...base, ours: true, origin: 'Grindless', tooltip: '§7Gas turbine \u2014 power plus steam' });
  assert.ok(d.startsWith('Gas turbine, power plus steam.'));
  assert.match(d, /Runs Electric Blast Furnace recipes\./);
  const long = describeController({ ...base, tooltip: 'x'.repeat(100), types: ['a:one', 'a:two', 'a:three', 'a:four'], usedBy: ['A', 'B', 'C'] });
  assert.ok(long.length <= DESC_MAX_CHARS);
});

test('no recipe types: no invented behaviour', () => {
  const d = describeController({ name: 'X', ours: false, origin: 'GregTech', types: [], io: null, products: [], parts: null, inputs: [], usedBy: [] });
  assert.equal(d, 'A GregTech multiblock.');
});

test('the main casing and coil come from the structure', () => {
  const st = { slices: [['CCC', 'CKC', 'CSC']], symbols: { S: { kind: 'controller' }, C: { kind: 'blocks', blocks: ['gtceu:heatproof_machine_casing'] }, K: { kind: 'blocks', blocks: ['gtceu:cupronickel_coil_block'] } } };
  assert.deepEqual(structureParts(st), { casing: 'gtceu:heatproof_machine_casing', coil: 'gtceu:cupronickel_coil_block' });
});

test('tooltips are read from the lang scripts', () => {
  const m = tooltipsFromLang("add('grindless.machine.foo.tooltip.0', '§7It\\'s a foo.')\nadd('grindless.machine.foo.tooltip.1', 'no')");
  assert.equal(m.get('foo'), "§7It's a foo.");
});

test('describeAll is deterministic and feeds the chapter', () => {
  const controllers = [{ id: 'gtceu:ebf', name: 'Ebf', tier: 'mv', ours: false }, { id: 'gtceu:mixer', name: 'Mixer', tier: 'mv', ours: false }];
  const machines = [{ id: 'gtceu:ebf', types: ['gtceu:blast'] }, { id: 'gtceu:mixer', types: [] }];
  const recipes = [
    { i: 'a', t: 'gtceu:blast', j: { outputs: { item: [{ content: { ingredient: { item: 'gtceu:steel_ingot' } } }] } } },
    { i: 'b', t: 'minecraft:crafting_shaped', j: { pattern: ['XX'], key: { X: { item: 'gtceu:ebf' } }, result: { item: 'gtceu:mixer' } } },
  ];
  const args = { controllers, machines, recipeTypes: [{ id: 'gtceu:blast', io: [1, 1, 0, 0] }], recipes, structures: {}, tooltips: new Map() };
  const a = describeAll(args);
  assert.deepEqual([...a], [...describeAll(args)]);
  assert.match(a.get('gtceu:ebf'), /Unlocks Steel Ingot\..*Also needed to craft Mixer\./);
  const snbt = chapterSnbt(layoutBands(controllers.map((c) => ({ ...c, desc: a.get(c.id) }))));
  assert.match(snbt, /description: \["A GregTech multiblock for Blast recipes\./);
});


test('names: lang first, then acronyms', () => {
  const lang = { 'item.grindless.aln_powder': 'AlN Powder', 'material.gtceu.cobalt_iron': 'CoFe Alloy' };
  assert.equal(niceName('grindless:aln_powder', lang), 'AlN Powder');
  assert.equal(niceName('gtceu:cobalt_iron_dust', lang), 'CoFe Alloy Dust');
  assert.equal(niceName('gtceu:advanced_ebf'), 'Advanced EBF');
  assert.equal(niceName('gtceu:mega_lcr'), 'Mega LCR');
  assert.equal(niceName('gtceu:ev_vein_drill'), 'EV Vein Drill');
});

test('products: consumed outputs before nuggets', () => {
  const rec = (o) => ({ t: 'x', j: { outputs: { item: [{ content: { ingredient: { item: o } } }] } } });
  const out = mainProducts([rec('gtceu:aluminium_nugget'), rec('gtceu:aluminium_nugget'), rec('gtceu:aluminium_ingot')], ['x'], 4, new Map([['gtceu:aluminium_ingot', 3]]));
  assert.equal(out[0].id, 'gtceu:aluminium_ingot');
  assert.equal(out[out.length - 1].id, 'gtceu:aluminium_nugget');
});

test('products: recycling rows never name a product', () => {
  const rec = (o, category) => ({ t: 'x', j: { category, outputs: { item: [{ content: { ingredient: { item: o } } }] } } });
  const rows = [rec('gtceu:titanium_dust', 'gtceu:macerator_recycling'), rec('gtceu:titanium_dust', 'gtceu:macerator_recycling'), rec('gtceu:wood_dust', 'gtceu:macerator')];
  assert.deepEqual(mainProducts(rows, ['x']).map((p) => p.id), ['gtceu:wood_dust']);
});