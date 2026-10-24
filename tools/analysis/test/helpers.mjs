// Utilidades de las pruebas: volcados y configuraciones en memoria (nada se escribe en disco).
import { makeDump } from '../lib/dump.mjs';
import { buildModel } from '../lib/model.mjs';
import { runPasses } from '../lib/analyze.mjs';
import { analyze, renderText } from '../lib/report.mjs';

/** Entrada de receta GT: objeto con cantidad y probabilidad de gasto (10000 = siempre, 0 = no se gasta). */
export const gi = (item, count = 1, chance = 10000) => ({
  content: { type: 'gtceu:sized', count, ingredient: { item } }, chance, maxChance: 10000, tierChanceBoost: 0,
});
export const gtag = (tag, count = 1, chance = 10000) => ({
  content: { type: 'gtceu:sized', count, ingredient: { tag } }, chance, maxChance: 10000, tierChanceBoost: 0,
});
export const gf = (fluid, amount = 1000, chance = 10000) => ({
  content: { amount, value: [{ fluid }] }, chance, maxChance: 10000, tierChanceBoost: 0,
});

/** Receta de máquina GT (inputs/outputs/tickInputs por capacidad). */
export const gt = (id, type, { ins = [], outs = [], fins = [], fouts = [], eut = 8, conditions, data } = {}) => ({
  id,
  type,
  json: {
    type,
    inputs: { item: ins, fluid: fins },
    outputs: { item: outs, fluid: fouts },
    tickInputs: { eu: [{ content: eut, chance: 10000, maxChance: 10000, tierChanceBoost: 0 }] },
    ...(conditions ? { recipeConditions: conditions } : {}),
    ...(data ? { data } : {}),
  },
});

export const shaped = (id, pattern, key, result, count = 1) => ({
  id, type: 'minecraft:crafting_shaped', json: { type: 'minecraft:crafting_shaped', pattern, key, result: { item: result, count } },
});
export const shapeless = (id, ingredients, result, count = 1) => ({
  id, type: 'minecraft:crafting_shapeless', json: { type: 'minecraft:crafting_shapeless', ingredients, result: { item: result, count } },
});
export const smelting = (id, input, result) => ({
  id, type: 'minecraft:smelting', json: { type: 'minecraft:smelting', ingredient: { item: input }, result },
});

function collectItems(x, out) {
  if (Array.isArray(x)) x.forEach((v) => collectItems(v, out));
  else if (x && typeof x === 'object') {
    for (const [k, v] of Object.entries(x)) {
      if ((k === 'item' || k === 'result') && typeof v === 'string') out.add(v);
      else collectItems(v, out);
    }
  }
}

/** Volcado en memoria; los objetos del registro salen de las propias recetas más `items`. */
export function mkDump({ recipes = [], items = [], fluids = [], tagsItem = {}, tagsFluid = {}, machines = [], recipeTypes = [], veins = null, fluidVeins = null, config = null, structures = null } = {}) {
  const all = new Set(items);
  collectItems(recipes.map((r) => r.json), all);
  return makeDump('(memoria)', {
    recipes: { recipes: recipes.map((r) => JSON.stringify({ i: r.id, t: r.type, ...(r.added ? { a: 1 } : {}), j: r.json })) },
    items: { items: [...all], fluids },
    tags: { item: tagsItem, fluid: tagsFluid },
    machines: { machines, recipeTypes },
    veins: veins ? { veins } : null,
    fluidVeins: fluidVeins ? { veins: fluidVeins } : null,
    config: config ? { gtceu: config } : null,
    structures: structures ? { structures } : null,
    info: null,
  });
}

export function run(dump, cfg, opts = {}) {
  const model = buildModel(dump, cfg);
  const res = runPasses(model);
  const out = analyze(model, res, opts);
  return { model, res, out, text: renderText(model, res, out, { pass: opts.pass || 'both' }) };
}

/** {id: PASS|FAIL|WARN} de una lista de resultados. */
export const verdicts = (list) => Object.fromEntries(list.map((r) => [r.target.id, r.verdict]));

const MINI_ITEMS = ['t:coal', 't:log', 't:sapling', 't:rock', 't:raw', 't:ingot', 't:bit', 't:sample', 't:casing'];
const MINI_FLUIDS = ['t:water', 't:steam'];

/**
 * Mini pack de vapor: mena -> lingote (horno con combustible) -> broca -> perforadora que da mena; invernadero que da
 * troncos; caldera (troncos + agua -> vapor); bomba (agua). Sirve de referencia "todo bien" y de base para las mutaciones.
 */
export function miniPack({ drillEut = 8, extraRecipes = [] } = {}) {
  const I = { I: { item: 't:ingot' } };
  const recipes = [
    smelting('t:ingot_from_raw', 't:raw', 't:ingot'),
    shaped('t:bit', ['I'], I, 't:bit'),
    shaped('t:furnace', ['R'], { R: { item: 't:rock' } }, 't:furnace'),
    shaped('t:boiler', ['II'], I, 't:boiler'),
    shaped('t:casing', ['III'], I, 't:casing'),
    shaped('t:drill', ['IC'], { I: { item: 't:ingot' }, C: { item: 't:casing' } }, 't:drill'),
    shaped('t:greenhouse', ['IIC'], { I: { item: 't:ingot' }, C: { item: 't:casing' } }, 't:greenhouse'),
    shaped('t:pump', ['IIII'], I, 't:pump'),
    shaped('t:sample', ['R'], { R: { item: 't:raw' } }, 't:sample'),
    gt('t:drilling', 't:drilling', { ins: [gi('t:sample', 1, 0), gi('t:bit', 1, 1000)], outs: [gi('t:raw')], eut: drillEut }),
    gt('t:greenhouse_logs', 't:greenhouse', { ins: [gi('t:sapling', 1, 0)], outs: [gi('t:log')], eut: 4 }),
    ...extraRecipes,
  ];
  const cfg = {
    tier: 'mini',
    unconditionalTypes: ['minecraft:crafting_shaped', 'minecraft:crafting_shapeless'],
    world: [
      { id: 'arboles', mode: 'manual', bootstrap: true, items: ['t:log', 't:sapling', 't:rock', 't:raw'] },
      { id: 'agua', mode: 'manual', bootstrap: true, items: ['fluid:t:water'] },
      { id: 'bomba', mode: 'auto', via: ['t:pump'], items: ['fluid:t:water'] },
    ],
    machines: [
      { machine: 't:furnace', types: ['minecraft:smelting'], needs: [['t:log', 't:coal']] },
      { machine: 't:boiler', types: [] },
      { machine: 't:pump', types: [] },
      { machine: 't:drill', types: ['t:drilling'], maxEUt: 32, needs: ['fluid:t:steam'], parts: ['t:casing'] },
      { machine: 't:greenhouse', types: ['t:greenhouse'], maxEUt: 32, needs: ['fluid:t:steam'], parts: ['t:casing'] },
    ],
    synthetic: [
      { id: 'caldera', machines: ['t:boiler'], consumes: [['t:log', 't:coal'], 'fluid:t:water'], produces: ['fluid:t:steam'] },
    ],
    targets: [
      { id: 'perforadora', item: 't:drill' },
      { id: 'invernadero', item: 't:greenhouse' },
      { id: 'receta-perforacion', kind: 'recipe', type: 't:drilling' },
    ],
    autoTargets: [
      { id: 'auto-mena', item: 't:raw' },
      { id: 'auto-troncos', item: 't:log' },
      { id: 'auto-lingote', item: 't:ingot' },
      { id: 'auto-agua', fluid: 't:water' },
      { id: 'auto-vapor', fluid: 't:steam' },
    ],
  };
  const dump = mkDump({ recipes, items: MINI_ITEMS, fluids: MINI_FLUIDS });
  return { dump, cfg, recipes };
}

/** Quita recetas por id del mini pack y reconstruye el volcado. */
export function without(pack, ...ids) {
  const recipes = pack.recipes.filter((r) => !ids.includes(r.id));
  return { ...pack, recipes, dump: mkDump({ recipes, items: MINI_ITEMS, fluids: MINI_FLUIDS }) };
}
