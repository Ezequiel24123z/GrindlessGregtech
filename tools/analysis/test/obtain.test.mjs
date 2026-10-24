// Auditoría de obtención (--pass obtain, lib/obtain.mjs): fuentes del mundo, máquinas de cualquier nivel, abejas, grupos por
// material, clasificación A/B/C, pistas, informes y la CLI. Un mini pack con todo lo que la auditoría distingue.
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
/** Entrada/salida GT con NBT (los panales y huevos de Productive Bees); el NBT va como texto, igual que en el volcado. */
const gnbt = (item, nbt, count = 1) => ({
  content: { type: 'gtceu:sized', count, ingredient: { type: 'forge:nbt', item, nbt } }, chance: 10000, maxChance: 10000, tierChanceBoost: 0,
});
const bee = (id, type, json) => ({ id, type, json: { type, ...json } });
const machine = (id, tier, types, mb = false) => ({ id, tier, types, ...(mb ? { mb: 1 } : {}) });
const stick = { S: { item: 'minecraft:stick' } };

function pack({ drillRecipe = true, extraRecipes = [], classes, tagsItem = {}, tagsFluid = {}, info = null, extra = {}, obtain = {} } = {}) {
  const recipes = [
    // máquinas: todas se fabrican con un palo, salvo la perdida (ninguna receta da su controlador)
    ...['gtceu:lv_macerator', 'gtceu:lv_electrolyzer', 'gtceu:lv_mixer', 'gtceu:lv_centrifuge', 'gtceu:lv_chemical_reactor',
      'gtceu:lv_vein_drill', 'gtceu:big_smelter', 'gtceu:mv_fluid_drilling_rig', 'gtceu:lv_gas_collector', 'grindless:vein_sample_a']
      .map((m) => shaped(`t:${m}`, ['S'], stick, m)),
    ...(drillRecipe ? [gt('t:drill_a', 'gtceu:vein_drilling', { ins: [gi('grindless:vein_sample_a', 1, 0)], outs: [gi('gtceu:raw_alpha')] })] : []),
    gt('t:mac_alpha', 'gtceu:macerator', { ins: [gi('gtceu:raw_alpha')], outs: [gi('gtceu:alpha_dust')] }),
    gt('t:mac_beta', 'gtceu:macerator', { ins: [gi('gtceu:raw_beta')], outs: [gi('gtceu:beta_dust')] }),
    gt('t:mac_gamma', 'gtceu:macerator', { ins: [gi('gtceu:raw_gamma')], outs: [gi('gtceu:gamma_dust')] }),
    gt('t:mac_theta', 'gtceu:macerator', { ins: [gi('gtceu:raw_theta')], outs: [gi('gtceu:crushed_theta_ore')] }),
    gt('t:mix_theta', 'gtceu:mixer', { ins: [gi('gtceu:alpha_dust')], outs: [gi('gtceu:theta_dust')], eut: 30 }),
    // 600 EU/t: ninguna máquina de un bloque de LV llega; el multibloque (sin tope) sí corre su tipo
    gt('t:mac_hot', 'gtceu:macerator', { ins: [gi('gtceu:alpha_dust')], outs: [gi('gtceu:hot_dust')], eut: 600 }),
    gt('t:big', 'gtceu:big_smelting', { ins: [gi('gtceu:alpha_dust')], outs: [gi('gtceu:big_dust')], eut: 100000 }),
    gt('t:lost', 'gtceu:lost_type', { ins: [gi('gtceu:alpha_dust')], outs: [gi('gtceu:omega_dust')] }),
    // perlita: solo se empaqueta a sí misma; su electrólisis da polvo de obsidiana (que también sale de moler obsidiana)
    shaped('t:perlite_pack', ['SSS', 'SSS', 'SSS'], { S: { item: 'gtceu:small_perlite_dust' } }, 'gtceu:perlite_dust'),
    shaped('t:perlite_unpack', ['P'], { P: { item: 'gtceu:perlite_dust' } }, 'gtceu:small_perlite_dust', 4),
    shaped('t:perlite_tiny', ['P'], { P: { item: 'gtceu:perlite_dust' } }, 'gtceu:tiny_perlite_dust', 9),
    gt('t:electro_perlite', 'gtceu:electrolyzer', { ins: [gi('gtceu:perlite_dust', 3)], outs: [gi('gtceu:obsidian_dust', 2)], fouts: [gf('minecraft:water')], eut: 30 }),
    gt('t:mac_obsidian', 'gtceu:macerator', { ins: [gi('minecraft:obsidian')], outs: [gi('gtceu:obsidian_dust')] }),
    // dimensiones: el Nether está; la Luna, en una era posterior
    gt('t:air_nether', 'gtceu:gas_collector', { fouts: [gf('gtceu:nether_air')], conditions: [{ type: 'dimension', dimension: 'minecraft:the_nether' }] }),
    gt('t:air_moon', 'gtceu:gas_collector', { fouts: [gf('gtceu:moon_air')], conditions: [{ type: 'dimension', dimension: 'gcyr:luna' }] }),
    // abejas: el hierro sale de convertir la abeja vanilla; su huevo + hierro da el huevo del oro (incubadora y vuelta)
    bee('t:conv_iron', 'productivebees:bee_conversion', { source: 'minecraft:bee', result: 'productivebees:iron', item: { item: 'minecraft:iron_block' } }),
    bee('t:hive_iron', 'productivebees:advanced_beehive', { ingredient: 'productivebees:iron', results: [{ item: { type: 'forge:nbt', item: COMB, nbt: { EntityTag: { type: 'productivebees:iron' } } } }] }),
    bee('t:hive_gold', 'productivebees:advanced_beehive', { ingredient: 'productivebees:gold', results: [{ item: { item: COMB } }] }),
    bee('t:hive_naq', 'productivebees:advanced_beehive', { ingredient: 'productivebees:naq', results: [{ item: { type: 'forge:nbt', item: COMB, nbt: { EntityTag: { type: 'productivebees:naq' } } } }] }),
    gt('t:egg_gold', 'gtceu:chemical_reactor', { ins: [gnbt(EGG, '{"EntityTag": {"type": "productivebees:iron"}}'), gi('minecraft:iron_block')], outs: [gnbt(EGG, '{"EntityTag": {"type": "productivebees:gold"}}')] }),
    gt('t:comb_iron', 'gtceu:centrifuge', { ins: [gnbt(COMB, '{EntityTag:{type:"productivebees:iron"}}')], outs: [gi('gtceu:delta_dust')] }),
    gt('t:comb_gold', 'gtceu:centrifuge', { ins: [gnbt(COMB, '{EntityTag:{type:"productivebees:gold"}}')], outs: [gi('gtceu:zeta_dust')] }),
    gt('t:comb_naq', 'gtceu:centrifuge', { ins: [gnbt(COMB, '{EntityTag:{type:"productivebees:naq"}}')], outs: [gi('gtceu:epsilon_dust')] }),
    gt('t:iota', 'gtceu:mixer', { ins: [gi('gtceu:epsilon_dust')], outs: [gi('gtceu:iota_dust')] }),
    // un huevo sin NBT no es un hecho del mundo (notFree)
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
      later: [{ id: 'luna', era: 'EV', until: 'ev', label: 'la Luna', dimensions: ['gcyr:luna'] }],
      classes: classes || [
        { class: 'A', materials: ['perlite'], era: 'LV', source: 'veta del Nether', reason: 'su electrólisis da polvo de obsidiana' },
        { class: 'C', materials: ['beta'], reason: 'su veta no está en la tabla' },
        { class: 'C', materials: ['gtceu:industrial_alpha_casing'], reason: 'sin receta' },
        { class: 'C', materials: ['no_existe'], reason: 'regla que no nombra nada' },
        { class: 'C', fallback: true, partial: true, forms: 'ore', reason: 'sin veta' },
      ],
      ...obtain,
    },
  };
  return { dump, cfg, recipes };
}

const group = (res, id) => res.groups.find((g) => g.id === id);
const never = (res) => new Set(res.groups.flatMap((g) => g.keys));

test('obtain: fuentes del mundo (tabla de vetas, otros mods, dimensiones, yacimientos y cubos)', () => {
  const { dump, cfg } = pack();
  const res = runObtain(dump, cfg, { unlocks: false });
  const nv = never(res);
  assert.ok(!nv.has('gtceu:alpha_dust'), 'la veta de la tabla da su mena');
  assert.ok(nv.has('gtceu:raw_beta') && nv.has('gtceu:beta_dust'), 'una veta sin receta de perforación no cuenta');
  assert.ok(!nv.has('gtceu:obsidian_dust'), 'lo de otros mods (obsidiana) es un hecho');
  assert.ok(!nv.has('fluid:gtceu:nether_air'), 'receta del Nether: dimensión alcanzable');
  assert.ok(!nv.has('fluid:gtceu:oil') && !nv.has('gtceu:oil_bucket'), 'yacimiento con peso + su cubo');
  assert.ok(nv.has('fluid:gtceu:salt_water') && nv.has('gtceu:salt_water_bucket'), 'yacimiento de peso 0 no cuenta');
  assert.ok(!nv.has('fluid:gtceu:flowing_oil'), 'los fluidos flowing_ no se auditan');
  assert.ok(!nv.has('gtceu:stone_alpha_ore'), 'los bloques de mena no se listan');
});

test('obtain: máquinas del registro con el tope de su nivel; multibloques sin tope; sin controlador no hay máquina', () => {
  const res = runObtain(pack().dump, pack().cfg, { unlocks: false });
  const nv = never(res);
  assert.ok(nv.has('gtceu:hot_dust'), '600 EU/t no cabe en una máquina LV');
  assert.ok(!nv.has('gtceu:big_dust'), 'el multibloque corre cualquier EU/t');
  assert.ok(nv.has('gtceu:omega_dust') && nv.has('gtceu:lost_machine'), 'el tipo de una máquina sin receta no corre');
});

test('obtain: abejas (conversión, colmena con panal por tipo, huevo de incubadora) y huevos que no son hechos', () => {
  const res = runObtain(pack().dump, pack().cfg, { unlocks: false });
  const nv = never(res);
  assert.ok(!nv.has('gtceu:delta_dust'), 'panal del hierro: abeja convertida desde la vanilla');
  assert.ok(!nv.has('gtceu:zeta_dust'), 'panal del oro: huevo del hierro (incubadora) -> huevo del oro -> abeja -> panal');
  assert.ok(nv.has('gtceu:epsilon_dust'), 'la abeja naq no tiene fuente: su panal no sale');
  assert.ok(nv.has('gtceu:eta_dust'), 'un huevo de generación no es un hecho del mundo');
});

test('obtain: grupos por material (formas juntas, máquinas y piezas solas, formas sueltas)', () => {
  const res = runObtain(pack().dump, pack().cfg, { unlocks: false });
  const perlite = group(res, 'perlite');
  assert.deepEqual([...perlite.keys].sort(), ['gtceu:perlite_dust', 'gtceu:small_perlite_dust', 'gtceu:tiny_perlite_dust']);
  assert.equal(perlite.full, true);
  const theta = group(res, 'theta');
  assert.equal(theta.full, false, 'el polvo de theta sale del mezclador');
  assert.deepEqual([...theta.keys].sort(), ['gtceu:crushed_theta_ore', 'gtceu:raw_theta']);
  assert.ok(theta.keys.every(isOreForm));
  assert.ok(group(res, 'gtceu:industrial_alpha_casing'), 'carcasa: palabras que no son de forma, va sola');
  assert.ok(group(res, 'gtceu:lost_machine'), 'una máquina registrada va sola');
  assert.ok(group(res, 'salt_water').keys.includes('gtceu:salt_water_bucket'), 'el cubo va con su fluido');
});

test('obtain: clasificación (reglas, creativo, era posterior, reglas de reserva, sin clasificar y reglas sin uso)', () => {
  const res = runObtain(pack().dump, pack().cfg, { unlocks: false });
  assert.equal(group(res, 'perlite').cls, 'A');
  assert.equal(group(res, 'perlite').era, 'LV');
  assert.equal(group(res, 'beta').cls, 'C');
  assert.equal(group(res, 'gtceu:creative_tank').cls, 'C');
  assert.equal(group(res, 'gtceu:creative_tank').by, 'creativo');
  assert.equal(group(res, 'gamma').cls, 'B', 'la veta de la Luna');
  assert.equal(group(res, 'gamma').era, 'EV');
  assert.equal(group(res, 'moon_air').cls, 'B', 'la receta con condición de la Luna');
  assert.equal(group(res, 'theta').cls, 'C', 'regla de reserva: formas de mena sueltas');
  assert.equal(group(res, 'omega').cls, '?');
  assert.equal(res.verdict, 'FAIL', 'hay grupos sin clasificar');
  assert.ok(res.unusedRules.some((u) => u.materials.includes('no_existe')));
  assert.ok(res.byClass.A.groups === 1 && res.byClass['?'].groups > 0);
});

test('obtain: con todo clasificado el paso da PASS; ni una regla C ni una de reserva tapan la era posterior', () => {
  const classes = [
    { class: 'A', materials: ['perlite'], reason: 'r' },
    { class: 'C', materials: ['gamma'], reason: 'una C no tapa la Luna' },
    { class: 'C', fallback: true, materials: ['*'], reason: 'todo lo demás' },
  ];
  const res = runObtain(pack().dump, { ...pack().cfg, obtain: { ...pack().cfg.obtain, classes } }, { unlocks: false });
  assert.equal(res.verdict, 'PASS');
  assert.equal(group(res, 'gamma').cls, 'B', 'la era posterior gana a las reglas C');
  assert.equal(group(res, 'omega').cls, 'C');
  assert.ok(res.unusedRules.some((u) => u.materials.includes('gamma')), 'la regla C tapada sale como sin uso');
});

test('obtain: pistas (qué dan sus recetas, qué abriría) y recetas que lo piden o lo dan', () => {
  const res = runObtain(pack().dump, pack().cfg);
  const perlite = group(res, 'perlite');
  const uses = [...perlite.uses].map((r) => res.model.g.rules[r].name);
  assert.ok(uses.includes('t:electro_perlite'));
  assert.ok(perlite.gives.some((o) => o.key === 'gtceu:obsidian_dust' && o.reached));
  assert.equal(perlite.unlocks, null, 'lo que da ya se consigue: no se calcula');
  const eps = group(res, 'epsilon');
  assert.deepEqual(eps.unlocks.groups, ['iota'], 'el épsilon abriría el iota');
  const makes = [...group(res, 'beta').makes].map((r) => res.model.g.rules[r].name);
  assert.deepEqual(makes, ['t:mac_beta']);
});

test('obtain (mutación): sin la receta de perforación la veta deja de contar y su material sale sin clasificar', () => {
  const res = runObtain(pack({ drillRecipe: false }).dump, pack({ drillRecipe: false }).cfg, { unlocks: false });
  const alpha = group(res, 'alpha');
  assert.ok(alpha && alpha.keys.includes('gtceu:alpha_dust'));
  assert.equal(alpha.cls, '?');
  assert.equal(res.verdict, 'FAIL');
});

test('obtain: informes de texto, JSON y Markdown', () => {
  const res = runObtain(pack().dump, pack().cfg);
  const text = renderObtainText(res, 'obtain.json');
  assert.match(text, /PASO OBTENCIÓN/);
  assert.match(text, /VEREDICTO: FAIL \(\d+ grupos sin clasificar\)/);
  const md = renderObtainMarkdown(res, { dump: 'd', namespaces: 'gtceu', dimensions: ['minecraft:overworld'] });
  assert.match(md, /\| Clase \| Qué hacer \| Grupos \| Objetos \| Fluidos \| Recetas \|/);
  assert.match(md, /### perlite[\s\S]*t:electro_perlite/);
  assert.match(md, /EV: sale de la Luna[^\n]*`gamma`/);
  assert.match(md, /su veta no está en la tabla[^\n]*`beta`/);
  assert.match(md, /## Sin clasificar[\s\S]*`omega`/);
  const json = obtainToJson(res);
  assert.equal(json.pass, 'obtain');
  assert.ok(json.groups.find((g) => g.id === 'beta').makes.includes('t:mac_beta'));
});

test('tabla de ocultos (--table): B con su era, C con las recetas que solo existen para ellos, keepRecipes y la tabla anterior', () => {
  const extraRecipes = [
    // conversión de partida vieja: la broca vieja (nunca obtenible) se convierte en algo que sí sale
    shaped('t:old_to_new', ['O'], { O: { item: 'grindless:old_bit' } }, 'gtceu:alpha_dust'),
    shaped('t:old_scrap', ['S'], { S: { item: 'gtceu:junk_scrap' } }, 'gtceu:alpha_dust'),
    // entrada B sin etapa (omega, LuV) y salidas C (beta) + B (gamma): se queda
    gt('t:mixed', 'gtceu:mixer', { ins: [gi('gtceu:omega_dust')], outs: [gi('gtceu:beta_dust'), gi('gtceu:gamma_dust')] }),
  ];
  const classes = [
    { class: 'A', materials: ['perlite'], reason: 'a' },
    { class: 'B', materials: ['omega'], until: 'luv', reason: 'llega en LuV' },
    { class: 'C', materials: ['beta'], reason: 'sin veta' },
    { class: 'C', materials: ['grindless:old_bit'], keepRecipes: true, reason: 'partidas viejas' },
    { class: 'C', fallback: true, materials: ['*'], reason: 'resto' },
  ];
  const p = pack({ extraRecipes, classes });
  const res = runObtain(p.dump, p.cfg, { unlocks: false });
  const table = hiddenTable(res, { previous: { groups: [{ material: 'beta', until: 'never', removeRecipes: ['t:ya_quitada'] }] } });
  const byMat = Object.fromEntries(table.groups.map((x) => [x.material, x]));
  assert.equal(byMat.gamma.until, 'ev', 'B con la era de la etapa');
  assert.equal(byMat.omega.until, 'luv', 'B con la era de su regla');
  assert.ok(!('removeRecipes' in byMat.gamma), 'las recetas de un B se quedan');
  assert.deepEqual(byMat.salt_water.fluids, ['gtceu:salt_water']);
  assert.ok(byMat.salt_water.items.includes('gtceu:salt_water_bucket'));
  assert.equal(byMat.beta.until, 'never');
  assert.ok(byMat.beta.removeRecipes.includes('t:mac_beta'), 'entrada que solo admite un C');
  assert.ok(byMat.beta.removeRecipes.includes('t:ya_quitada'), 'conserva lo que ya quitaba la tabla anterior');
  assert.ok(!table.groups.some((x) => (x.removeRecipes || []).includes('t:mixed')), 'una salida C junto a una B no basta');
  assert.deepEqual(byMat['grindless:old_bit'].removeRecipes, [], 'keepRecipes: la conversión se queda');
  assert.equal(byMat['grindless:old_bit'].keepRecipes, true, 'y la tabla lo dice (hidden.js no oculta sus recetas en EMI)');
  assert.ok(!('keepRecipes' in byMat.beta));
  assert.ok(byMat['gtceu:junk_scrap'].removeRecipes.includes('t:old_scrap'));
  assert.ok(!table.groups.some((x) => x.material === 'perlite' || x.material === 'alpha'), 'ni los A ni los que se consiguen');
  const ranks = table.groups.map((x) => (x.until === 'never' ? 99 : ERA_IDS.indexOf(x.until)));
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b), 'ordenada por era, "never" al final');
  const text = renderHiddenTable(table);
  assert.deepEqual(JSON.parse(text), JSON.parse(JSON.stringify(table)), 'el texto es la tabla en JSON');
  assert.equal(text.split('\n').filter((l) => l.startsWith('    {"material"')).length, table.groups.length, 'un grupo por línea');
});

test('obtain: la ocultación del pack (c:hidden_from_recipe_viewers) cuadra con la auditoría; mutaciones: algo que se consigue oculto, un C a la vista', () => {
  const HT = 'c:hidden_from_recipe_viewers';
  const classes = [
    { class: 'A', materials: ['perlite'], reason: 'r' },
    { class: 'C', fallback: true, materials: ['*'], reason: 'todo lo demás' },
  ];
  const plain = pack({ classes });
  const res0 = runObtain(plain.dump, plain.cfg, { unlocks: false });
  assert.equal(res0.hiding, null, 'sin la etiqueta en el volcado no se mira');
  assert.equal(res0.verdict, 'PASS');
  // lo que integration/hidden.js ocultaría con el pack implementado hasta LV: todo lo C y lo B de EV en adelante (la Luna)
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
  assert.equal(group(res, 'salt_water').hidden, group(res, 'salt_water').keys.length, 'cuenta objetos y fluidos ocultos');
  let text = renderObtainText(res);
  assert.match(text, /Ocultos en el pack \(c:hidden_from_recipe_viewers\): \d+ objetos y 2 fluidos; implementado hasta lv/);
  assert.match(text, /se consiguen pero están ocultos: 0/);
  assert.equal(obtainToJson(res).hiding.implementedEra, 'lv');

  // mutación: algo que se consigue (polvo de alfa, de la tabla de vetas) también oculto
  const m1 = withTags([...items, 'gtceu:alpha_dust'], fluids, info);
  res = runObtain(m1.dump, m1.cfg, { unlocks: false });
  assert.deepEqual(res.hiding.obtainable, ['gtceu:alpha_dust']);
  assert.equal(res.verdict, 'FAIL');
  assert.match(renderObtainText(res), /VEREDICTO: FAIL \(1 ocultos que se consiguen\)/);

  // mutación: un C y un fluido C a la vista (tabla de ocultos vieja)
  const m2 = withTags(items.filter((k) => k !== 'gtceu:beta_dust'), [], info);
  res = runObtain(m2.dump, m2.cfg, { unlocks: false });
  assert.deepEqual(res.hiding.visible.map((v) => v.key).sort(), ['fluid:gtceu:moon_air', 'fluid:gtceu:salt_water', 'gtceu:beta_dust']);
  assert.equal(res.verdict, 'FAIL');
  text = renderObtainText(res);
  assert.match(text, /se ven: 3 — [^\n]*gtceu:beta_dust \(beta, never\)[^\n]*regenera la tabla/);
  assert.match(renderObtainMarkdown(res, {}), /- tendrían que estar ocultos[^\n]*: 3/);

  // sin la era implementada (volcado sin hidden.js) no se mira lo que falta; opts.implementedEra (--implemented) la da
  const m3 = withTags(items.filter((k) => k !== 'gtceu:beta_dust'), fluids, null);
  res = runObtain(m3.dump, m3.cfg, { unlocks: false });
  assert.equal(res.hiding.visible, null);
  assert.equal(res.verdict, 'PASS');
  res = runObtain(m3.dump, m3.cfg, { unlocks: false, implementedEra: 'lv' });
  assert.deepEqual(res.hiding.visible.map((v) => v.key), ['gtceu:beta_dust']);

  // implementado hasta EV: la Luna (B, ev) ya se ve; solo los C tienen que estar ocultos
  const ev = res0.groups.filter((g) => g.until === 'never').flatMap((g) => g.keys);
  const m4 = withTags(ev.filter((k) => !k.startsWith('fluid:')), ev.filter((k) => k.startsWith('fluid:')).map((k) => k.slice(6)), { hidden: { implementedEra: 'ev' } });
  res = runObtain(m4.dump, m4.cfg, { unlocks: false });
  assert.deepEqual(res.hiding.visible, []);
  assert.equal(res.verdict, 'PASS');

  // una etiqueta de objetos vacía se vuelca como [minecraft:barrier]
  const empty = withTags(['minecraft:barrier'], [], null);
  assert.equal(runObtain(empty.dump, empty.cfg, { unlocks: false }).hiding.items, 0);
});

test('obtain: la Luna alcanzable con su perforadora (requireRecipe en lista) y etapa con materiales de una veta quitada del mundo', () => {
  const MOON = 'gcyr:luna';
  const extra = {
    items: ['gtceu:raw_kappa', 'gtceu:raw_lambda'],
    machines: [machine('gtceu:lunar_drill', 3, ['gtceu:lunar_drilling'], true)],
    recipeTypes: ['gtceu:lunar_drilling'],
    veins: [{ id: 'grindless:kappa_vein_moon', layer: 'moon', dims: [MOON], mats: ['gtceu:kappa'] }],
  };
  const extraRecipes = [
    shaped('t:lunar_drill', ['S'], stick, 'gtceu:lunar_drill'),
    // la muestra lunar pide dos menas crudas de su veta: se pican a mano en la primera visita
    shaped('t:sample_kappa', ['KK'], { K: { item: 'gtceu:raw_kappa' } }, 'grindless:vein_sample_kappa_moon'),
    gt('t:lunar_kappa', 'gtceu:lunar_drilling', { ins: [gi('grindless:vein_sample_kappa_moon', 1, 0)], outs: [gi('gtceu:raw_kappa', 3)], conditions: [{ type: 'dimension', dimension: MOON }] }),
    gt('t:mac_kappa', 'gtceu:macerator', { ins: [gi('gtceu:raw_kappa')], outs: [gi('gtceu:kappa_dust')] }),
    gt('t:mac_lambda', 'gtceu:macerator', { ins: [gi('gtceu:raw_lambda')], outs: [gi('gtceu:lambda_dust')] }),
  ];
  const drills = [
    { type: 'gtceu:vein_drilling', input: 'grindless:vein_sample_{id}' },
    { type: 'gtceu:lunar_drilling', input: 'grindless:vein_sample_{id}' },
  ];
  const later = [{ id: 'marte', era: 'EV', until: 'ev', label: 'Marte', materials: ['lambda'] }];
  const classes = [{ class: 'C', fallback: true, materials: ['*'], reason: 'resto' }];
  const run = (obtain) => {
    const p = pack({ extraRecipes, extra, classes, obtain: { later, ...obtain } });
    return runObtain(p.dump, p.cfg, { unlocks: false });
  };
  const withMoon = ['minecraft:overworld', 'minecraft:the_nether', MOON];

  let res = run({ reachableDimensions: withMoon, veins: { requireRecipe: drills } });
  assert.ok(!never(res).has('gtceu:kappa_dust') && !never(res).has('gtceu:raw_kappa'), 'la veta lunar con receta de la perforadora lunar da su mena');
  assert.equal(group(res, 'lambda').cls, 'B', 'los materiales de la etapa dan sus menas crudas');
  assert.equal(group(res, 'lambda').until, 'ev');
  assert.equal(res.later.find((s) => s.id === 'marte').materials, 1, 'un material de veta en la etapa');

  // mutación: solo la perforadora de vetas (la lunar no cuenta) -> la muestra pide la mena que solo daría la veta: nunca
  res = run({ reachableDimensions: withMoon, veins: { requireRecipe: drills[0] } });
  assert.ok(never(res).has('gtceu:kappa_dust'));
  // mutación: la Luna fuera de las dimensiones alcanzables -> ni la veta ni la receta con condición de la Luna
  res = run({ veins: { requireRecipe: drills } });
  assert.ok(never(res).has('gtceu:raw_kappa'));
});

test('normalize: NBT por tipo (objeto, SNBT, JSON) solo para los objetos de la lista', () => {
  assert.equal(nbtType({ EntityTag: { type: 'productivebees:iron' } }), 'productivebees:iron');
  assert.equal(nbtType('{EntityTag:{type:"productivebees:iron"}}'), 'productivebees:iron');
  assert.equal(nbtType('{"EntityTag": {"type": "productivebees:iron"}}'), 'productivebees:iron');
  const typed = new Set([COMB]);
  assert.equal(itemKey(COMB, { EntityTag: { type: 'x:y' } }, typed), `${COMB}#x:y`);
  assert.equal(itemKey(COMB, { EntityTag: { type: 'x:y' } }, null), COMB, 'sin la lista, como siempre');
  const st = { unresolved: new Set() };
  const p = parseItemIngredient({ type: 'forge:nbt', item: COMB, nbt: '{EntityTag:{type:"a:b"}}' }, { items: () => [] }, st, typed);
  assert.deepEqual(p.alts, [`${COMB}#a:b`]);
});

test('tiers/obtain.json: hereda de steam, audita GT y todas sus reglas tienen clase y razón', () => {
  const { raw } = loadTierConfig({ tier: 'obtain' }, path.join(here, '..', 'tiers'));
  assert.ok(raw.obtain.audit.includes('gtceu') && raw.obtain.audit.includes('grindless'));
  assert.ok(raw.unconditionalTypes.includes('minecraft:crafting_shaped'), 'heredado de steam');
  assert.ok(raw.synthetic.some((s) => s.id === 'caldera-solida'), 'las calderas de steam dan el vapor');
  for (const c of raw.obtain.classes) {
    assert.ok(['A', 'B', 'C'].includes(c.class), JSON.stringify(c));
    assert.ok(c.reason && c.reason.length > 5, JSON.stringify(c));
    if (c.class === 'B') assert.ok(ERA_IDS.includes(c.until), `B sin era válida en until: ${JSON.stringify(c.materials)}`);
  }
  for (const l of raw.obtain.later) assert.ok(ERA_IDS.includes(l.until), `etapa posterior sin era válida en until: ${l.id}`);
  assert.ok(!raw.obtain.classes.some((c) => (c.materials || []).includes('perlite')), 'la perlita ya sale del tamiz LV (lv/perlite.js)');
});

test('CLI: --pass obtain con --config escribe texto, JSON y Markdown y sale 1 si hay grupos sin clasificar', () => {
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
    assert.match(r.stdout, /VEREDICTO: FAIL/);
    assert.match(fs.readFileSync(path.join(work, 'o.md'), 'utf8'), /## A: merecen una fuente/);
    assert.equal(JSON.parse(fs.readFileSync(path.join(work, 'o.json'), 'utf8')).pass, 'obtain');
    const hidden = JSON.parse(fs.readFileSync(path.join(work, 'h.json'), 'utf8'));
    assert.ok(hidden.groups.some((x) => x.material === 'beta' && x.until === 'never' && x.removeRecipes.includes('t:mac_beta')));
    assert.match(r.stdout, /Tabla de ocultos: .*h\.json \(\d+ grupos; \d+ recetas a quitar\)/);
    const bad = spawnSync(process.execPath, [cli, '--pass', 'nada', '--dump', path.join(work, 'dump')], { encoding: 'utf8' });
    assert.equal(bad.status, 2);
    assert.match(bad.stderr, /obtain/);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
});
