// QR-F3: static deadlock check (tools/analysis/recipe-cycles.mjs), no game needed.
//   - synthetic: a controller researched or built with its own product is a root cycle; a bootstrap recipe breaks it;
//   - the pack: every controller our recipes make is reachable from our own recipes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { deadlocks } from '../lib/recipe_cycles.mjs';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { staticDump } from '../lib/kubejs_static.mjs';
import { eraOrderViolations } from '../lib/era_order.mjs';
import { BRIDGE_FILE, DEFAULT_PACK, loadCyclesConfig, packDeadlocks } from '../recipe-cycles.mjs';

const gt = (id, type, items, out, research = []) => ({ id, type, json: {
  inputs: { item: items.map((i) => ({ content: { type: 'gtceu:sized', count: 1, ingredient: { item: i } } })) },
  outputs: { item: [{ content: { type: 'gtceu:sized', count: 1, ingredient: { item: out } } }] },
  recipeConditions: research.length ? [{ type: 'research', researchItems: research.map((r) => ({ item: r })) }] : [],
} });
const dump = (recipes) => ({
  recipes: new Map(recipes.map((r) => [r.id, r])),
  machines: new Map([['gtceu:works', { id: 'gtceu:works', recipeTypes: ['gtceu:works_type'] }]]),
  recipeTypes: new Map([['gtceu:works_type', { id: 'gtceu:works_type' }]]),
  tags: {},
});

test('a controller researched with its own product is a root cycle', () => {
  const r = deadlocks(dump([
    gt('a/works', 'gtceu:assembly_line', ['minecraft:iron_ingot'], 'gtceu:works', ['grindless:widget']),
    gt('b/widget', 'gtceu:works_type', ['minecraft:stone'], 'grindless:widget'),
  ]));
  assert.deepEqual(r.deadMachines, ['gtceu:works']);
  assert.equal(r.cycles.length, 1);
  assert.ok(r.cycles[0].root);
  assert.deepEqual(r.cycles[0].members, ['grindless:widget', 'gtceu:works']);
});

test('an earlier route to the item breaks the cycle; vanilla and GTM ids are assumed obtainable', () => {
  const r = deadlocks(dump([
    gt('a/works', 'gtceu:assembly_line', ['gtceu:iv_machine_hull'], 'gtceu:works', ['grindless:widget']),
    gt('b/widget', 'gtceu:works_type', ['minecraft:stone'], 'grindless:widget'),
    gt('c/widget', 'gtceu:assembler', ['minecraft:stone', 'minecraft:stone'], 'grindless:widget'),
  ]));
  assert.deepEqual(r.deadMachines, []);
  assert.deepEqual(r.cycles, []);
});

const pack = () => (pack.memo ||= staticDump(DEFAULT_PACK)); // one static run for both pack checks

test('every controller our recipes make is reachable from our own recipes', { timeout: 900000 }, () => {
  const r = packDeadlocks(DEFAULT_PACK, pack().dump);
  const roots = r.cycles.filter((c) => c.root).map((c) => c.members.join(' '));
  assert.deepEqual(r.deadMachines, [], `root cycles: ${roots.join(' / ')}; run node tools/analysis/recipe-cycles.mjs`);
  assert.deepEqual(r.unproduced.filter((x) => !loadCyclesConfig().pending.includes(x)), [], 'a tier component our recipes use has no recipe: add it, or list it in recipe_cycles.json (node tools/analysis/recipe-cycles.mjs --write-pending)');
  assert.deepEqual(r.pendingNow, [], 'now made by a recipe: remove from recipe_cycles.json pending');
});

test('tier components of UHV and above are tracked as ours: one nothing makes blocks its users unless pending, a made one is checked', () => {
  const owned = ['^gtceu:(uhv|uev)_electric_motor$'];
  const d = dump([gt('a/works', 'gtceu:assembly_line', ['gtceu:uhv_electric_motor'], 'gtceu:works')]);
  assert.deepEqual(deadlocks(d).deadMachines, [], 'foreign ids are assumed obtainable by default');
  const r = deadlocks(d, { owned });
  assert.deepEqual(r.unproduced, ['gtceu:uhv_electric_motor']);
  assert.deepEqual(r.deadMachines, ['gtceu:works']);
  assert.deepEqual(deadlocks(d, { owned, pending: ['gtceu:uhv_electric_motor'] }).deadMachines, []);
  const made = dump([...d.recipes.values(), gt('b/motor', 'gtceu:assembler', ['minecraft:stone'], 'gtceu:uhv_electric_motor')]);
  const r2 = deadlocks(made, { owned, pending: ['gtceu:uhv_electric_motor'] });
  assert.deepEqual(r2.pendingNow, ['gtceu:uhv_electric_motor']);
  assert.deepEqual(r2.deadMachines, []);
});

test('the current pack has no era inversion in machine recipes beyond the allowlist', { timeout: 900000 }, () => {
  const cfg = JSON.parse(fs.readFileSync(fileURLToPath(new URL('../recipe_quality.json', import.meta.url)), 'utf8'));
  const v = eraOrderViolations(pack(), cfg);
  assert.deepEqual(v.map((x) => `${x.recipe} <- ${x.input} (${x.era} < ${x.inputEra})`), []);
});

// QR-F5: foreign ids that only our recipes make (the bridge, tools/analysis/recipe_bridge.json) are tracked like grindless: ids.
const BRIDGE = { alt: Object.fromEntries(['gtceu:rhenium_dust', 'gtceu:rhea_ingot', 'gtceu:einsteinium_dust', 'gtceu:solid_neon_cone', 'gtnn:optical_mainframe'].map((id) => [id, []])), tags: { 'gtceu:circuits/uiv': ['gtnn:optical_mainframe'] } };
const tagGt = (id, type, tag, out) => { const r = gt(id, type, [], out); r.json.inputs.item = [{ content: { type: 'gtceu:sized', count: 1, ingredient: { tag } } }]; return r; };
const roots = { // controller built from an item only its own products lead to
  'root 4 barnard_core_drill: rhenium_pellet <- rhenium dust only the drill mines': ['gtceu:rhenium_dust', 'grindless:rhenium_pellet'],
  'root 5 levitation_melter: rhea parts <- rhea only the melter makes': ['gtceu:rhea_ingot', 'grindless:rhea_part'],
  'root 7 neutron_drip_separator: es254_target <- einsteinium only the separator makes': ['gtceu:einsteinium_dust', 'grindless:es254_target'],
  'roots 3 superfluid_helium_plant / accelerator_driven_reactor: a foreign intermediate in the chain': ['gtceu:solid_neon_cone', 'grindless:cone_part'],
};
for (const [name, [foreign, ours]] of Object.entries(roots)) {
  test(`bridge: ${name}`, () => {
    const d = dump([
      gt('a/works', 'gtceu:assembly_line', [ours], 'gtceu:works'),
      gt('b/ours', 'gtceu:assembler', [foreign], ours),
      gt('c/foreign', 'gtceu:works_type', ['minecraft:stone'], foreign),
    ]);
    assert.deepEqual(deadlocks(d).deadMachines, [], 'without the bridge the foreign id is assumed obtainable');
    assert.deepEqual(deadlocks(d, { bridge: BRIDGE }).deadMachines, ['gtceu:works']);
  });
}

test('bridge: root 6 six controllers take #gtceu:circuits/uiv whose only obtainable member is our optical mainframe', () => {
  const d = dump([
    tagGt('a/works', 'gtceu:assembly_line', 'gtceu:circuits/uiv', 'gtceu:works'),
    gt('b/mainframe', 'gtceu:assembler', ['grindless:photonic_part'], 'gtnn:optical_mainframe'),
    gt('c/part', 'gtceu:works_type', ['minecraft:stone'], 'grindless:photonic_part'),
  ]);
  d.tags = { itemTags: new Map([['gtceu:circuits/uiv', ['gtnn:optical_mainframe', 'gtnn:cosmic_assembly']]]), item: new Map() };
  d.tags.item = d.tags.itemTags;
  assert.deepEqual(deadlocks(d).deadMachines, []);
  assert.deepEqual(deadlocks(d, { bridge: BRIDGE }).deadMachines, ['gtceu:works']);
});

test('the committed bridge lists the foreign ids of roots 3-7', () => {
  const b = JSON.parse(fs.readFileSync(BRIDGE_FILE, 'utf8'));
  for (const id of ['gtceu:rhenium_dust', 'gtceu:rhea_ingot', 'gtceu:einsteinium_dust', 'gtnn:optical_mainframe']) assert.ok(b.alt[id], id);
  assert.deepEqual(b.tags['gtceu:circuits/uiv'], ['gtnn:optical_mainframe']);
});