// Auditoría de obtención (--pass obtain, lib/obtain.mjs): fuentes del mundo, máquinas de cualquier nivel, abejas, grupos por
// material, clasificación A/B/C, pistas, informes y la CLI. Un mini pack con todo lo que la auditoría distingue.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { gf, gi, gt, mkDump, shaped } from './helpers.mjs';
import { runObtain, renderObtainText, renderObtainMarkdown, obtainToJson, isOreForm } from '../lib/obtain.mjs';
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

function pack({ drillRecipe = true, extraRecipes = [], classes } = {}) {
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
    'gtceu:stone_alpha_ore',
  ];
  const fluids = ['minecraft:water', 'gtceu:oil', 'gtceu:flowing_oil', 'gtceu:salt_water', 'gtceu:nether_air', 'gtceu:moon_air'];
  const machines = [
    machine('gtceu:lv_macerator', 1, ['gtceu:macerator']), machine('gtceu:lv_electrolyzer', 1, ['gtceu:electrolyzer']),
    machine('gtceu:lv_mixer', 1, ['gtceu:mixer']), machine('gtceu:lv_centrifuge', 1, ['gtceu:centrifuge']),
    machine('gtceu:lv_chemical_reactor', 1, ['gtceu:chemical_reactor']), machine('gtceu:lv_vein_drill', 1, ['gtceu:vein_drilling']),
    machine('gtceu:lv_gas_collector', 1, ['gtceu:gas_collector']), machine('gtceu:big_smelter', 0, ['gtceu:big_smelting'], true),
    machine('gtceu:mv_fluid_drilling_rig', 2, ['gtceu:dummy'], true), machine('gtceu:lost_machine', 1, ['gtceu:lost_type']),
  ];
  const recipeTypes = ['gtceu:macerator', 'gtceu:electrolyzer', 'gtceu:mixer', 'gtceu:centrifuge', 'gtceu:chemical_reactor',
    'gtceu:vein_drilling', 'gtceu:gas_collector', 'gtceu:big_smelting', 'gtceu:lost_type', 'gtceu:dummy'].map((id) => ({ id }));
  const veins = [
    { id: 'gtceu:a_vein', layer: 'stone', dims: ['minecraft:overworld'], mats: ['gtceu:alpha'] },
    { id: 'gtceu:b_vein', layer: 'stone', dims: ['minecraft:overworld'], mats: ['gtceu:beta'] },
    { id: 'gcyr:gamma_vein_moon', layer: 'moon', dims: ['gcyr:luna'], mats: ['gtceu:gamma'] },
  ];
  const fluidVeins = [
    { id: 'gtceu:oil_deposit', fluid: 'gtceu:oil', weight: 20, dims: ['minecraft:overworld'] },
    { id: 'gtceu:salt_water_deposit', fluid: 'gtceu:salt_water', weight: 0, dims: ['minecraft:overworld'] },
  ];
  const dump = mkDump({ recipes, items, fluids, machines, recipeTypes, veins, fluidVeins });
  const cfg = {
    tier: 'obtain-test',
    obtain: {
      audit: ['gtceu', 'grindless'],
      reachableDimensions: ['minecraft:overworld', 'minecraft:the_nether'],
      notFree: ['*:*spawn_egg*'],
      veins: { requireRecipe: { type: 'gtceu:vein_drilling', input: 'grindless:vein_sample_{id}' } },
      ignoreOreBlocks: true,
      creative: ['*:creative_*'],
      later: [{ id: 'luna', era: 'EV', label: 'la Luna', dimensions: ['gcyr:luna'] }],
      classes: classes || [
        { class: 'A', materials: ['perlite'], era: 'LV', source: 'veta del Nether', reason: 'su electrólisis da polvo de obsidiana' },
        { class: 'C', materials: ['beta'], reason: 'su veta no está en la tabla' },
        { class: 'C', materials: ['gtceu:industrial_alpha_casing'], reason: 'sin receta' },
        { class: 'C', materials: ['no_existe'], reason: 'regla que no nombra nada' },
        { class: 'C', fallback: true, partial: true, forms: 'ore', reason: 'sin veta' },
      ],
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
  }
  assert.ok(raw.obtain.classes.some((c) => c.class === 'A' && c.materials.includes('perlite')));
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
      '--md', path.join(work, 'o.md'), '--json', path.join(work, 'o.json'), '--quiet'], { encoding: 'utf8' });
    assert.equal(r.status, 1, r.stderr);
    assert.match(r.stdout, /VEREDICTO: FAIL/);
    assert.match(fs.readFileSync(path.join(work, 'o.md'), 'utf8'), /## A: merecen una fuente/);
    assert.equal(JSON.parse(fs.readFileSync(path.join(work, 'o.json'), 'utf8')).pass, 'obtain');
    const bad = spawnSync(process.execPath, [cli, '--pass', 'nada', '--dump', path.join(work, 'dump')], { encoding: 'utf8' });
    assert.equal(bad.status, 2);
    assert.match(bad.stderr, /obtain/);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
});
