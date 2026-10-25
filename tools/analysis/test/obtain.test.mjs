// Obtain audit (--pass obtain, lib/obtain.mjs): world sources, machines of any tier, bees, groups by
// material, A/B/C classification, hints, reports and the CLI. A mini pack with everything the audit tells apart.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { gf, gi, gt, mkDump, shaped } from './helpers.mjs';
import { runObtain, renderObtainText, renderObtainMarkdown, obtainToJson, isOreForm, hiddenTable, renderHiddenTable, ERA_IDS } from '../lib/obtain.mjs';
import { itemKey, nbtType, parseItemIngredient } from '../lib/normalize.mjs';
import { loadTierConfig } from '../lib/config.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const COMB = 'productivebees:configurable_honeycomb';
const EGG = 'productivebees:spawn_egg_configurable_bee';
/** GT input/output with NBT (Productive Bees' honeycombs and eggs); the NBT goes as text, same as in the dump. */
const gnbt = (item, nbt, count = 1) => ({
  content: { type: 'gtceu:sized', count, ingredient: { type: 'forge:nbt', item, nbt } }, chance: 10000, maxChance: 10000, tierChanceBoost: 0,
});
const bee = (id, type, json) => ({ id, type, json: { type, ...json } });
const machine = (id, tier, types, mb = false) => ({ id, tier, types, ...(mb ? { mb: 1 } : {}) });
const stick = { S: { item: 'minecraft:stick' } };

function pack({ drillRecipe = true, extraRecipes = [], classes, tagsItem = {}, tagsFluid = {}, info = null, extra = {}, obtain = {} } = {}) {
  const recipes = [
    // machines: all are made with a stick, except the lost one (no recipe gives its controller)
    ...['gtceu:lv_macerator', 'gtceu:lv_electrolyzer', 'gtceu:lv_mixer', 'gtceu:lv_centrifuge', 'gtceu:lv_chemical_reactor',
      'gtceu:lv_vein_drill', 'gtceu:big_smelter', 'gtceu:mv_fluid_drilling_rig', 'gtceu:lv_gas_collector', 'grindless:vein_sample_a']
      .map((m) => shaped(`t:${m}`, ['S'], stick, m)),
    ...(drillRecipe ? [gt('t:drill_a', 'gtceu:vein_drilling', { ins: [gi('grindless:vein_sample_a', 1, 0)], outs: [gi('gtceu:raw_alpha')] })] : []),
    gt('t:mac_alpha', 'gtceu:macerator', { ins: [gi('gtceu:raw_alpha')], outs: [gi('gtceu:alpha_dust')] }),
    gt('t:mac_beta', 'gtceu:macerator', { ins: [gi('gtceu:raw_beta')], outs: [gi('gtceu:beta_dust')] }),
    gt('t:mac_gamma', 'gtceu:macerator', { ins: [gi('gtceu:raw_gamma')], outs: [gi('gtceu:gamma_dust')] }),
    gt('t:mac_theta', 'gtceu:macerator', { ins: [gi('gtceu:raw_theta')], outs: [gi('gtceu:crushed_theta_ore')] }),
    gt('t:mix_theta', 'gtceu:mixer', { ins: [gi('gtceu:alpha_dust')], outs: [gi('gtceu:theta_dust')], eut: 30 }),
    // 600 EU/t: no single-block LV machine reaches it; the multiblock (no cap) runs its type fine
    gt('t:mac_hot', 'gtceu:macerator', { ins: [gi('gtceu:alpha_dust')], outs: [gi('gtceu:hot_dust')], eut: 600 }),
    gt('t:big', 'gtceu:big_smelting', { ins: [gi('gtceu:alpha_dust')], outs: [gi('gtceu:big_dust')], eut: 100000 }),
    gt('t:lost', 'gtceu:lost_type', { ins: [gi('gtceu:alpha_dust')], outs: [gi('gtceu:omega_dust')] }),
    // perlite: only packs itself; its electrolysis gives obsidian dust (which also comes from grinding obsidian)
    shaped('t:perlite_pack', ['SSS', 'SSS', 'SSS'], { S: { item: 'gtceu:small_perlite_dust' } }, 'gtceu:perlite_dust'),
    shaped('t:perlite_unpack', ['P'], { P: { item: 'gtceu:perlite_dust' } }, 'gtceu:small_perlite_dust', 4),
    shaped('t:perlite_tiny', ['P'], { P: { item: 'gtceu:perlite_dust' } }, 'gtceu:tiny_perlite_dust', 9),
    gt('t:electro_perlite', 'gtceu:electrolyzer', { ins: [gi('gtceu:perlite_dust', 3)], outs: [gi('gtceu:obsidian_dust', 2)], fouts: [gf('minecraft:water')], eut: 30 }),
    gt('t:mac_obsidian', 'gtceu:macerator', { ins: [gi('minecraft:obsidian')], outs: [gi('gtceu:obsidian_dust')] }),
    // dimensions: the Nether is reachable; the Moon is in a later era
    gt('t:air_nether', 'gtceu:gas_collector', { fouts: [gf('gtceu:nether_air')], conditions: [{ type: 'dimension', dimension: 'minecraft:the_nether' }] }),
    gt('t:air_moon', 'gtceu:gas_collector', { fouts: [gf('gtceu:moon_air')], conditions: [{ type: 'dimension', dimension: 'gcyr:luna' }] }),
    // bees: iron comes from converting the vanilla bee; its egg + iron gives the gold egg (incubator and back)
    bee('t:conv_iron', 'productivebees:bee_conversion', { source: 'minecraft:bee', result: 'productivebees:iron', item: { item: 'minecraft:iron_block' } }),
    bee('t:hive_iron', 'productivebees:advanced_beehive', { ingredient: 'productivebees:iron', results: [{ item: { type: 'forge:nbt', item: COMB, nbt: { EntityTag: { type: 'productivebees:iron' } } } }] }),
    bee('t:hive_gold', 'productivebees:advanced_beehive', { ingredient: 'productivebees:gold', results: [{ item: { item: COMB } }] }),
    bee('t:hive_naq', 'productivebees:advanced_beehive', { ingredient: 'productivebees:naq', results: [{ item: { type: 'forge:nbt', item: COMB, nbt: { EntityTag: { type: 'productivebees:naq' } } } }] }),
    gt('t:egg_gold', 'gtceu:chemical_reactor', { ins: [gnbt(EGG, '{"EntityTag": {"type": "productivebees:iron"}}'), gi('minecraft:iron_block')], outs: [gnbt(EGG, '{"EntityTag": {"type": "productivebees:gold"}}')] }),
    gt('t:comb_iron', 'gtceu:centrifuge', { ins: [gnbt(COMB, '{EntityTag:{type:"productivebees:iron"}}')], outs: [gi('gtceu:delta_dust')] }),
    gt('t:comb_gold', 'gtceu:centrifuge', { ins: [gnbt(COMB, '{EntityTag:{type:"productivebees:gold"}}')], outs: [gi('gtceu:zeta_dust')] }),
    gt('t:comb_naq', 'gtceu:centrifuge', { ins: [gnbt(COMB, '{EntityTag:{type:"productivebees:naq"}}')], outs: [gi('gtceu:epsilon_dust')] }),
    gt('t:iota', 'gtceu:mixer', { ins: [gi('gtceu:epsilon_dust')], outs: [gi('gtceu:iota_dust')] }),
    // an egg with no NBT isn't a world fact (notFree)
    gt('t:eta', 'gtceu:chemical_reactor', { ins: [gi(EGG)], outs: [gi('gtceu:eta_dust')] }),
    ...extraRecipes,
  ];
  const items = [
    'minecraft:stick', 'minecraft:obsidian', 'minecraft:iron_block', 'minecraft:egg', 'minecraft:bucket', 'productivebees:wax', COMB,
    'productivebees:configurable_comb', EGG, 'gtceu:raw_beta', 'gtceu:raw_gamma', 'gtceu:raw_theta', 'gtceu:lost_machine',
    'gtceu:industrial_alpha_casing', 'gtceu:oil_bucket', 'gtceu:salt_water_bucket', 'gtceu:creative_tank', 'grindless:vein_sample_b',
    'gtceu:stone_alpha_ore', ...(extra.items || []),
  ];
  const fluids = ['minecraft:water', 'gtceu:oil', 'gtceu:flowing_oil', 'gtceu:salt_water', 'gtceu:nether_air', 'gtceu:moon_air'];
  const machines = [
    machine('gtceu:lv_macerator', 1, ['gtceu:macerator']), machine('gtceu:lv_electrolyzer', 1, ['gtceu:electrolyzer']),
    machine('gtceu:lv_mixer', 1, ['gtceu:mixer']), machine('gtceu:lv_centrifuge', 1, ['gtceu:centrifuge']),
    machine('gtceu:lv_chemical_reactor', 1, ['gtceu:chemical_reactor']), machine('gtceu:lv_vein_drill', 1, ['gtceu:vein_drilling']),
    machine('gtceu:lv_gas_collector', 1, ['gtceu:gas_collector']), machine('gtceu:big_smelter', 0, ['gtceu:big_smelting'], true),
    machine('gtceu:mv_fluid_drilling_rig', 2, ['gtceu:dummy'], true), machine('gtceu:lost_machine', 1, ['gtceu:lost_type']),
    ...(extra.machines || []),
  ];
  const recipeTypes = ['gtceu:macerator', 'gtceu:electrolyzer', 'gtceu:mixer', 'gtceu:centrifuge', 'gtceu:chemical_reactor',
    'gtceu:vein_drilling', 'gtceu:gas_collector', 'gtceu:big_smelting', 'gtceu:lost_type', 'gtceu:dummy', ...(extra.recipeTypes || [])].map((id) => ({ id }));
  const veins = [
    { id: 'gtceu:a_vein', layer: 'stone', dims: ['minecraft:overworld'], mats: ['gtceu:alpha'] },
    { id: 'gtceu:b_vein', layer: 'stone', dims: ['minecraft:overworld'], mats: ['gtceu:beta'] },
    { id: 'gcyr:gamma_vein_moon', layer: 'moon', dims: ['gcyr:luna'], mats: ['gtceu:gamma'] },
    ...(extra.veins || []),
  ];
  const fluidVeins = [
    { id: 'gtceu:oil_deposit', fluid: 'gtceu:oil', weight: 20, dims: ['minecraft:overworld'] },
    { id: 'gtceu:salt_water_deposit', fluid: 'gtceu:salt_water', weight: 0, dims: ['minecraft:overworld'] },
  ];
  const dump = mkDump({ recipes, items, fluids, machines, recipeTypes, veins, fluidVeins, tagsItem, tagsFluid, info });
  const cfg = {
    tier: 'obtain-test',
    obtain: {
      audit: ['gtceu', 'grindless'],
      reachableDimensions: ['minecraft:overworld', 'minecraft:the_nether'],
      notFree: ['*:*spawn_egg*'],
      veins: { requireRecipe: { type: 'gtceu:vein_drilling', input: 'grindless:vein_sample_{id}' } },
      ignoreOreBlocks: true,
      creative: ['*:creative_*'],
      later: [{ id: 'moon', era: 'EV', until: 'ev', label: 'the Moon', dimensions: ['gcyr:luna'] }],
      classes: classes || [
        { class: 'A', materials: ['perlite'], era: 'LV', source: 'Nether vein', reason: 'its electrolysis gives obsidian dust' },
        { class: 'C', materials: ['beta'], reason: 'its vein isn\'t in the table' },
        { class: 'C', materials: ['gtceu:industrial_alpha_casing'], reason: 'no recipe' },
        { class: 'C', materials: ['does_not_exist'], reason: 'rule that doesn\'t name anything' },
        { class: 'C', fallback: true, partial: true, forms: 'ore', reason: 'no vein' },
      ],
      ...obtain,
    },
  };
  return { dump, cfg, recipes };
}

const group = (res, id) => res.groups.find((g) => g.id === id);
const never = (res) => new Set(res.groups.flatMap((g) => g.keys));

test('obtain: world sources (vein table, other mods, dimensions, deposits and buckets)', () => {
  const { dump, cfg } = pack();
  const res = runObtain(dump, cfg, { unlocks: false });
  const nv = never(res);
  assert.ok(!nv.has('gtceu:alpha_dust'), 'the vein in the table gives its ore');
  assert.ok(nv.has('gtceu:raw_beta') && nv.has('gtceu:beta_dust'), 'a vein with no drilling recipe doesn\'t count');
  assert.ok(!nv.has('gtceu:obsidian_dust'), 'the other-mod one (obsidian) is a fact');
  assert.ok(!nv.has('fluid:gtceu:nether_air'), 'Nether recipe: reachable dimension');
  assert.ok(!nv.has('fluid:gtceu:oil') && !nv.has('gtceu:oil_bucket'), 'deposit with weight + its bucket');
  assert.ok(nv.has('fluid:gtceu:salt_water') && nv.has('gtceu:salt_water_bucket'), 'a weight-0 deposit doesn\'t count');
  assert.ok(!nv.has('fluid:gtceu:flowing_oil'), 'flowing_ fluids aren\'t audited');
  assert.ok(!nv.has('gtceu:stone_alpha_ore'), 'ore blocks aren\'t listed');
});

test('obtain: registry machines capped at their tier; multiblocks uncapped; no controller means no machine', () => {
  const res = runObtain(pack().dump, pack().cfg, { unlocks: false });
  const nv = never(res);
  assert.ok(nv.has('gtceu:hot_dust'), '600 EU/t doesn\'t fit in an LV machine');
  assert.ok(!nv.has('gtceu:big_dust'), 'the multiblock runs any EU/t');
  assert.ok(nv.has('gtceu:omega_dust') && nv.has('gtceu:lost_machine'), 'a machine type with no recipe doesn\'t run');
});

test('obtain: bees (conversion, hive with a honeycomb per type, incubator egg) and eggs that aren\'t facts', () => {
  const res = runObtain(pack().dump, pack().cfg, { unlocks: false });
  const nv = never(res);
  assert.ok(!nv.has('gtceu:delta_dust'), 'iron honeycomb: bee converted from vanilla');
  assert.ok(!nv.has('gtceu:zeta_dust'), 'gold honeycomb: iron egg (incubator) -> gold egg -> bee -> honeycomb');
  assert.ok(nv.has('gtceu:epsilon_dust'), 'the naq bee has no source: its honeycomb doesn\'t come out');
  assert.ok(nv.has('gtceu:eta_dust'), 'a generation egg isn\'t a world fact');
});

test('obtain: groups by material (combined forms, standalone machines and parts, loose forms)', () => {
  const res = runObtain(pack().dump, pack().cfg, { unlocks: false });
  const perlite = group(res, 'perlite');
  assert.deepEqual([...perlite.keys].sort(), ['gtceu:perlite_dust', 'gtceu:small_perlite_dust', 'gtceu:tiny_perlite_dust']);
  assert.equal(perlite.full, true);
  const theta = group(res, 'theta');
  assert.equal(theta.full, false, 'theta dust comes from the mixer');
  assert.deepEqual([...theta.keys].sort(), ['gtceu:crushed_theta_ore', 'gtceu:raw_theta']);
  assert.ok(theta.keys.every(isOreForm));
  assert.ok(group(res, 'gtceu:industrial_alpha_casing'), 'casing: words that aren\'t a form, goes alone');
  assert.ok(group(res, 'gtceu:lost_machine'), 'a registered machine goes alone');
  assert.ok(group(res, 'salt_water').keys.includes('gtceu:salt_water_bucket'), 'the bucket goes with its fluid');
});

test('obtain: classification (rules, creative, later era, fallback rules, unclassified, and unused rules)', () => {
  const res = runObtain(pack().dump, pack().cfg, { unlocks: false });
  assert.equal(group(res, 'perlite').cls, 'A');
  assert.equal(group(res, 'perlite').era, 'LV');
  assert.equal(group(res, 'beta').cls, 'C');
  assert.equal(group(res, 'gtceu:creative_tank').cls, 'C');
  assert.equal(group(res, 'gtceu:creative_tank').by, 'creative');
  assert.equal(group(res, 'gamma').cls, 'B', 'the Moon\'s vein');
  assert.equal(group(res, 'gamma').era, 'EV');
  assert.equal(group(res, 'moon_air').cls, 'B', 'the recipe with the Moon\'s condition');
  assert.equal(group(res, 'theta').cls, 'C', 'fallback rule: loose ore forms');
  assert.equal(group(res, 'omega').cls, '?');
  assert.equal(res.verdict, 'FAIL', 'there are unclassified groups');
  assert.ok(res.unusedRules.some((u) => u.materials.includes('does_not_exist')));
  assert.ok(res.byClass.A.groups === 1 && res.byClass['?'].groups > 0);
});

test('obtain: with everything classified the step gives PASS; neither a C rule nor a fallback one covers up the later era', () => {
  const classes = [
    { class: 'A', materials: ['perlite'], reason: 'r' },
    { class: 'C', materials: ['gamma'], reason: 'a C doesn\'t cover the Moon' },
    { class: 'C', fallback: true, materials: ['*'], reason: 'everything else' },
  ];
  const res = runObtain(pack().dump, { ...pack().cfg, obtain: { ...pack().cfg.obtain, classes } }, { unlocks: false });
  assert.equal(res.verdict, 'PASS');
  assert.equal(group(res, 'gamma').cls, 'B', 'the later era wins over the C rules');
  assert.equal(group(res, 'omega').cls, 'C');
  assert.ok(res.unusedRules.some((u) => u.materials.includes('gamma')), 'the covered-up C rule shows up as unused');
});

test('obtain: hints (what its recipes give, what it would unlock) and recipes that need or give it', () => {
  const res = runObtain(pack().dump, pack().cfg);
  const perlite = group(res, 'perlite');
  const uses = [...perlite.uses].map((r) => res.model.g.rules[r].name);
  assert.ok(uses.includes('t:electro_perlite'));
  assert.ok(perlite.gives.some((o) => o.key === 'gtceu:obsidian_dust' && o.reached));
  assert.equal(perlite.unlocks, null, 'what it gives is already obtained: not computed');
  const eps = group(res, 'epsilon');
  assert.deepEqual(eps.unlocks.groups, ['iota'], 'epsilon would unlock iota');
  const makes = [...group(res, 'beta').makes].map((r) => res.model.g.rules[r].name);
  assert.deepEqual(makes, ['t:mac_beta']);
});

test('obtain (mutation): without the drilling recipe the vein stops counting and its material comes out unclassified', () => {
  const res = runObtain(pack({ drillRecipe: false }).dump, pack({ drillRecipe: false }).cfg, { unlocks: false });
  const alpha = group(res, 'alpha');
  assert.ok(alpha && alpha.keys.includes('gtceu:alpha_dust'));
  assert.equal(alpha.cls, '?');
  assert.equal(res.verdict, 'FAIL');
});

test('obtain: text, JSON and Markdown reports', () => {
  const res = runObtain(pack().dump, pack().cfg);
  const text = renderObtainText(res, 'obtain.json');
  assert.match(text, /OBTAIN STEP/);
  assert.match(text, /VERDICT: FAIL \(\d+ unclassified groups\)/);
  const md = renderObtainMarkdown(res, { dump: 'd', namespaces: 'gtceu', dimensions: ['minecraft:overworld'] });
  assert.match(md, /\| Class \| What to do \| Groups \| Items \| Fluids \| Recipes \|/);
  assert.match(md, /### perlite[\s\S]*t:electro_perlite/);
  assert.match(md, /EV: comes from the Moon[^\n]*`gamma`/);
  assert.match(md, /its vein isn't in the table[^\n]*`beta`/);
  assert.match(md, /## Unclassified[\s\S]*`omega`/);
  const json = obtainToJson(res);
  assert.equal(json.pass, 'obtain');
  assert.ok(json.groups.find((g) => g.id === 'beta').makes.includes('t:mac_beta'));
});

test('hidden table (--table): B with its era, C with recipes that only exist for them, keepRecipes and the previous table', () => {
  const extraRecipes = [
    // old-save conversion: the old bit (never obtainable) converts into something that does come out
    shaped('t:old_to_new', ['O'], { O: { item: 'grindless:old_bit' } }, 'gtceu:alpha_dust'),
    shaped('t:old_scrap', ['S'], { S: { item: 'gtceu:junk_scrap' } }, 'gtceu:alpha_dust'),
    // B input with no stage (omega, LuV) and C (beta) + B (gamma) outputs: it stays
    gt('t:mixed', 'gtceu:mixer', { ins: [gi('gtceu:omega_dust')], outs: [gi('gtceu:beta_dust'), gi('gtceu:gamma_dust')] }),
  ];
  const classes = [
    { class: 'A', materials: ['perlite'], reason: 'a' },
    { class: 'B', materials: ['omega'], until: 'luv', reason: 'arrives in LuV' },
    { class: 'C', materials: ['beta'], reason: 'no vein' },
    { class: 'C', materials: ['grindless:old_bit'], keepRecipes: true, reason: 'old saves' },
    { class: 'C', fallback: true, materials: ['*'], reason: 'rest' },
  ];
  const p = pack({ extraRecipes, classes });
  const res = runObtain(p.dump, p.cfg, { unlocks: false });
  const table = hiddenTable(res, { previous: { groups: [{ material: 'beta', until: 'never', removeRecipes: ['t:ya_quitada'] }] } });
  const byMat = Object.fromEntries(table.groups.map((x) => [x.material, x]));
  assert.equal(byMat.gamma.until, 'ev', 'B with the stage\'s era');
  assert.equal(byMat.omega.until, 'luv', 'B with its rule\'s era');
  assert.ok(!('removeRecipes' in byMat.gamma), 'a B\'s recipes stay');
  assert.deepEqual(byMat.salt_water.fluids, ['gtceu:salt_water']);
  assert.ok(byMat.salt_water.items.includes('gtceu:salt_water_bucket'));
  assert.equal(byMat.beta.until, 'never');
  assert.ok(byMat.beta.removeRecipes.includes('t:mac_beta'), 'an input that only accepts a C');
  assert.ok(byMat.beta.removeRecipes.includes('t:ya_quitada'), 'keeps what the previous table already removed');
  assert.ok(!table.groups.some((x) => (x.removeRecipes || []).includes('t:mixed')), 'a C output alongside a B isn\'t enough');
  assert.deepEqual(byMat['grindless:old_bit'].removeRecipes, [], 'keepRecipes: the conversion stays');
  assert.equal(byMat['grindless:old_bit'].keepRecipes, true, 'and the table says so (hidden.js doesn\'t hide its recipes in EMI)');
  assert.ok(!('keepRecipes' in byMat.beta));
  assert.ok(byMat['gtceu:junk_scrap'].removeRecipes.includes('t:old_scrap'));
  assert.ok(!table.groups.some((x) => x.material === 'perlite' || x.material === 'alpha'), 'neither the A\'s nor the obtainable ones');
  const ranks = table.groups.map((x) => (x.until === 'never' ? 99 : ERA_IDS.indexOf(x.until)));
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b), 'sorted by era, "never" last');
  const text = renderHiddenTable(table);
  assert.deepEqual(JSON.parse(text), JSON.parse(JSON.stringify(table)), 'the text is the table as JSON');
  assert.equal(text.split('\n').filter((l) => l.startsWith('    {"material"')).length, table.groups.length, 'one group per line');
});

test('obtain: the pack\'s hiding (c:hidden_from_recipe_viewers) matches the audit; mutations: something obtainable but hidden, a visible C', () => {
  const HT = 'c:hidden_from_recipe_viewers';
  const classes = [
    { class: 'A', materials: ['perlite'], reason: 'r' },
    { class: 'C', fallback: true, materials: ['*'], reason: 'everything else' },
  ];
  const plain = pack({ classes });
  const res0 = runObtain(plain.dump, plain.cfg, { unlocks: false });
  assert.equal(res0.hiding, null, 'without the tag in the dump, it isn\'t checked');
  assert.equal(res0.verdict, 'PASS');
  // what integration/hidden.js would hide with the pack implemented up to LV: everything C and the B's from EV onward (the Moon)
  const keys = res0.groups.filter((g) => g.until === 'never' || ERA_IDS.indexOf(g.until) > ERA_IDS.indexOf('lv')).flatMap((g) => g.keys);
  assert.ok(keys.includes('gtceu:gamma_dust') && keys.includes('fluid:gtceu:salt_water'));
  const items = keys.filter((k) => !k.startsWith('fluid:'));
  const fluids = keys.filter((k) => k.startsWith('fluid:')).map((k) => k.slice(6));
  const info = { hidden: { implementedEra: 'lv' } };
  const withTags = (itemList, fluidList, inf) => pack({ classes, tagsItem: { [HT]: itemList }, tagsFluid: { [HT]: fluidList }, info: inf });

  const ok = withTags(items, fluids, info);
  let res = runObtain(ok.dump, ok.cfg, { unlocks: false });
  assert.deepEqual(res.hiding, { items: items.length, fluids: fluids.length, implementedEra: 'lv', obtainable: [], visible: [] });
  assert.equal(res.verdict, 'PASS');
  assert.equal(group(res, 'salt_water').hidden, group(res, 'salt_water').keys.length, 'counts hidden items and fluids');
  let text = renderObtainText(res);
  assert.match(text, /Hidden in the pack \(c:hidden_from_recipe_viewers\): \d+ items and 2 fluids; implemented up to lv/);
  assert.match(text, /obtainable but hidden: 0/);
  assert.equal(obtainToJson(res).hiding.implementedEra, 'lv');

  // mutation: something obtainable (alpha dust, from the vein table) also hidden
  const m1 = withTags([...items, 'gtceu:alpha_dust'], fluids, info);
  res = runObtain(m1.dump, m1.cfg, { unlocks: false });
  assert.deepEqual(res.hiding.obtainable, ['gtceu:alpha_dust']);
  assert.equal(res.verdict, 'FAIL');
  assert.match(renderObtainText(res), /VERDICT: FAIL \(1 hidden but obtainable\)/);

  // mutation: a C and a C fluid visible (old hidden table)
  const m2 = withTags(items.filter((k) => k !== 'gtceu:beta_dust'), [], info);
  res = runObtain(m2.dump, m2.cfg, { unlocks: false });
  assert.deepEqual(res.hiding.visible.map((v) => v.key).sort(), ['fluid:gtceu:moon_air', 'fluid:gtceu:salt_water', 'gtceu:beta_dust']);
  assert.equal(res.verdict, 'FAIL');
  text = renderObtainText(res);
  assert.match(text, /visible: 3 — [^\n]*gtceu:beta_dust \(beta, never\)[^\n]*regenerate the hidden table/);
  assert.match(renderObtainMarkdown(res, {}), /- should be hidden[^\n]*: 3/);

  // with no implemented era (a dump with no hidden.js) what's missing isn't checked; opts.implementedEra (--implemented) supplies it
  const m3 = withTags(items.filter((k) => k !== 'gtceu:beta_dust'), fluids, null);
  res = runObtain(m3.dump, m3.cfg, { unlocks: false });
  assert.equal(res.hiding.visible, null);
  assert.equal(res.verdict, 'PASS');
  res = runObtain(m3.dump, m3.cfg, { unlocks: false, implementedEra: 'lv' });
  assert.deepEqual(res.hiding.visible.map((v) => v.key), ['gtceu:beta_dust']);

  // implemented up to EV: the Moon (B, ev) is already visible; only the C's must be hidden
  const ev = res0.groups.filter((g) => g.until === 'never').flatMap((g) => g.keys);
  const m4 = withTags(ev.filter((k) => !k.startsWith('fluid:')), ev.filter((k) => k.startsWith('fluid:')).map((k) => k.slice(6)), { hidden: { implementedEra: 'ev' } });
  res = runObtain(m4.dump, m4.cfg, { unlocks: false });
  assert.deepEqual(res.hiding.visible, []);
  assert.equal(res.verdict, 'PASS');

  // an empty item tag dumps as [minecraft:barrier]
  const empty = withTags(['minecraft:barrier'], [], null);
  assert.equal(runObtain(empty.dump, empty.cfg, { unlocks: false }).hiding.items, 0);
});

test('obtain: the reachable Moon with its drill (requireRecipe in a list) and a stage with materials from a vein removed from the world', () => {
  const MOON = 'gcyr:luna';
  const extra = {
    items: ['gtceu:raw_kappa', 'gtceu:raw_lambda'],
    machines: [machine('gtceu:lunar_drill', 3, ['gtceu:lunar_drilling'], true)],
    recipeTypes: ['gtceu:lunar_drilling'],
    veins: [{ id: 'grindless:kappa_vein_moon', layer: 'moon', dims: [MOON], mats: ['gtceu:kappa'] }],
  };
  const extraRecipes = [
    shaped('t:lunar_drill', ['S'], stick, 'gtceu:lunar_drill'),
    // the lunar sample needs two raw ores from its vein: hand-gathered on the first visit
    shaped('t:sample_kappa', ['KK'], { K: { item: 'gtceu:raw_kappa' } }, 'grindless:vein_sample_kappa_moon'),
    gt('t:lunar_kappa', 'gtceu:lunar_drilling', { ins: [gi('grindless:vein_sample_kappa_moon', 1, 0)], outs: [gi('gtceu:raw_kappa', 3)], conditions: [{ type: 'dimension', dimension: MOON }] }),
    gt('t:mac_kappa', 'gtceu:macerator', { ins: [gi('gtceu:raw_kappa')], outs: [gi('gtceu:kappa_dust')] }),
    gt('t:mac_lambda', 'gtceu:macerator', { ins: [gi('gtceu:raw_lambda')], outs: [gi('gtceu:lambda_dust')] }),
  ];
  const drills = [
    { type: 'gtceu:vein_drilling', input: 'grindless:vein_sample_{id}' },
    { type: 'gtceu:lunar_drilling', input: 'grindless:vein_sample_{id}' },
  ];
  const later = [{ id: 'mars', era: 'EV', until: 'ev', label: 'Mars', materials: ['lambda'] }];
  const classes = [{ class: 'C', fallback: true, materials: ['*'], reason: 'rest' }];
  const run = (obtain) => {
    const p = pack({ extraRecipes, extra, classes, obtain: { later, ...obtain } });
    return runObtain(p.dump, p.cfg, { unlocks: false });
  };
  const withMoon = ['minecraft:overworld', 'minecraft:the_nether', MOON];

  let res = run({ reachableDimensions: withMoon, veins: { requireRecipe: drills } });
  assert.ok(!never(res).has('gtceu:kappa_dust') && !never(res).has('gtceu:raw_kappa'), 'the lunar vein with the lunar drill\'s recipe gives its ore');
  assert.equal(group(res, 'lambda').cls, 'B', 'the stage\'s materials give their raw ores');
  assert.equal(group(res, 'lambda').until, 'ev');
  assert.equal(res.later.find((s) => s.id === 'mars').materials, 1, 'a vein material in the stage');

  // mutation: only the vein drill (the lunar one doesn't count) -> the sample needs the ore only the vein would give: never
  res = run({ reachableDimensions: withMoon, veins: { requireRecipe: drills[0] } });
  assert.ok(never(res).has('gtceu:kappa_dust'));
  // mutation: the Moon outside the reachable dimensions -> neither the vein nor the recipe with the Moon's condition
  res = run({ veins: { requireRecipe: drills } });
  assert.ok(never(res).has('gtceu:raw_kappa'));
});

test('normalize: NBT by type (object, SNBT, JSON) only for the listed items', () => {
  assert.equal(nbtType({ EntityTag: { type: 'productivebees:iron' } }), 'productivebees:iron');
  assert.equal(nbtType('{EntityTag:{type:"productivebees:iron"}}'), 'productivebees:iron');
  assert.equal(nbtType('{"EntityTag": {"type": "productivebees:iron"}}'), 'productivebees:iron');
  const typed = new Set([COMB]);
  assert.equal(itemKey(COMB, { EntityTag: { type: 'x:y' } }, typed), `${COMB}#x:y`);
  assert.equal(itemKey(COMB, { EntityTag: { type: 'x:y' } }, null), COMB, 'without the list, as always');
  const st = { unresolved: new Set() };
  const p = parseItemIngredient({ type: 'forge:nbt', item: COMB, nbt: '{EntityTag:{type:"a:b"}}' }, { items: () => [] }, st, typed);
  assert.deepEqual(p.alts, [`${COMB}#a:b`]);
});

test('tiers/obtain.json: inherits from steam, audits GT, and all its rules have a class and a reason', () => {
  const { raw } = loadTierConfig({ tier: 'obtain' }, path.join(here, '..', 'tiers'));
  assert.ok(raw.obtain.audit.includes('gtceu') && raw.obtain.audit.includes('grindless'));
  assert.ok(raw.unconditionalTypes.includes('minecraft:crafting_shaped'), 'inherited from steam');
  assert.ok(raw.synthetic.some((s) => s.id === 'boiler-solid'), 'steam\'s boilers give the steam');
  for (const c of raw.obtain.classes) {
    assert.ok(['A', 'B', 'C'].includes(c.class), JSON.stringify(c));
    assert.ok(c.reason && c.reason.length > 5, JSON.stringify(c));
    if (c.class === 'B') assert.ok(ERA_IDS.includes(c.until), `B with no valid era in until: ${JSON.stringify(c.materials)}`);
  }
  for (const l of raw.obtain.later) assert.ok(ERA_IDS.includes(l.until), `later stage with no valid era in until: ${l.id}`);
  assert.ok(!raw.obtain.classes.some((c) => (c.materials || []).includes('perlite')), 'perlite already comes from the LV sieve (lv/perlite.js)');
  // EV (2026-10-25): Mars is reached, so it is no longer a later stage; the titanium drill bit is a drill bit again (not C)
  assert.ok(raw.obtain.reachableDimensions.includes('gcyr:mars') && raw.obtain.reachableDimensions.includes('gcyr:luna'));
  assert.ok(!raw.obtain.later.some((l) => l.id === 'mars' || (l.dimensions || []).includes('gcyr:mars')));
  assert.ok(raw.obtain.world.some((w) => w.id === 'mars-ground'));
  assert.ok(!raw.obtain.classes.some((c) => (c.materials || []).includes('grindless:titanium_drill_bit')));
  assert.equal(raw.obtain.classes.find((c) => (c.materials || []).includes('deuterium')).until, 'iv');
});

test('CLI: --pass obtain with --config writes text, JSON and Markdown and exits 1 if there are unclassified groups', () => {
  const work = path.join(here, '..', '.work', 'test-obtain-cli');
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(path.join(work, 'dump'), { recursive: true });
  try {
    const { recipes, cfg } = pack();
    const d = pack().dump;
    const w = (name, doc) => fs.writeFileSync(path.join(work, 'dump', name), JSON.stringify(doc), 'utf8');
    w('recipes.json', { recipes: recipes.map((r) => JSON.stringify({ i: r.id, t: r.type, j: r.json })) });
    w('items.json', { items: [...d.items], fluids: [...d.fluids] });
    w('tags.json', { item: {}, fluid: {} });
    w('machines.json', { machines: [...d.machines.values()], recipeTypes: [...d.recipeTypes.values()] });
    w('veins.json', { veins: d.veins });
    w('fluid_veins.json', { veins: d.fluidVeins });
    fs.writeFileSync(path.join(work, 'obtain.json'), JSON.stringify(cfg), 'utf8');
    const cli = path.join(here, '..', 'reachability.mjs');
    const r = spawnSync(process.execPath, [cli, '--config', path.join(work, 'obtain.json'), '--dump', path.join(work, 'dump'),
      '--md', path.join(work, 'o.md'), '--json', path.join(work, 'o.json'), '--table', path.join(work, 'h.json'), '--quiet'], { encoding: 'utf8' });
    assert.equal(r.status, 1, r.stderr);
    assert.match(r.stdout, /VERDICT: FAIL/);
    assert.match(fs.readFileSync(path.join(work, 'o.md'), 'utf8'), /## A: deserve a source/);
    assert.equal(JSON.parse(fs.readFileSync(path.join(work, 'o.json'), 'utf8')).pass, 'obtain');
    const hidden = JSON.parse(fs.readFileSync(path.join(work, 'h.json'), 'utf8'));
    assert.ok(hidden.groups.some((x) => x.material === 'beta' && x.until === 'never' && x.removeRecipes.includes('t:mac_beta')));
    assert.match(r.stdout, /Hidden table: .*h\.json \(\d+ groups; \d+ recipes to remove\)/);
    const bad = spawnSync(process.execPath, [cli, '--pass', 'nada', '--dump', path.join(work, 'dump')], { encoding: 'utf8' });
    assert.equal(bad.status, 2);
    assert.match(bad.stderr, /obtain/);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
});
