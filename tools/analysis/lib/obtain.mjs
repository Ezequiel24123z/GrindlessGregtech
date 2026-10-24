// PASO OBTENCIÓN: auditoría de lo que no se consigue nunca, en ninguna era.
// Parte de todas las fuentes del mundo que el pack ya tiene (tablas de vetas por dimensión, yacimientos de fluidos, árboles y
// piedras de GT, abejas, lo que dan otros mods) y de todas las recetas de cualquier nivel (cada máquina registrada con el tope
// de EU/t de su nivel, los multibloques sin tope, la energía y las piezas se dan por conseguibles), y lista los objetos y
// fluidos de los espacios de nombres auditados que no se alcanzan, agrupados por material. Cada grupo se clasifica:
//   A  merece una fuente: abre una línea o una automatización (lo decide la configuración, con su razón);
//   B  llega con una era posterior de docs/viaje.md (sale de un planeta o de una veta apartada): ocultar hasta entonces;
//   C  no llegará nunca (material sin uso de GTM o de un addon, restos de addons): ocultar el objeto y sus recetas.
// Lo que ninguna regla clasifica sale como «?» y hace FAIL: es material nuevo que nadie ha mirado.
import { lfp } from './engine.mjs';
import { buildModel } from './model.mjs';
import { BEE_TYPES, beeKey } from './normalize.mjs';
import { asArray, makeGlobMatcher } from './util.mjs';

const nsOf = (id) => {
  const s = id.startsWith('fluid:') ? id.slice(6) : id;
  const c = s.indexOf(':');
  return c < 0 ? 'minecraft' : s.slice(0, c);
};
const pathOf = (id) => {
  const s = id.startsWith('fluid:') ? id.slice(6) : id;
  const c = s.indexOf(':');
  return c < 0 ? s : s.slice(c + 1);
};

export const DEFAULT_DIMENSIONS = ['minecraft:overworld', 'minecraft:the_nether', 'minecraft:the_end', 'grindless:flat', 'grindless:void'];
/** Eras del pack en orden (las de docs/viaje.md); `until` de la clase B es una de ellas y la de la clase C, "never". */
export const ERA_IDS = ['steam', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max'];
const DEFAULT_NBT_TYPED = ['productivebees:configurable_honeycomb', 'productivebees:configurable_comb', 'productivebees:spawn_egg_configurable_bee'];
const HIDDEN_TAG = 'c:hidden_from_recipe_viewers';

/** Mena cruda de un material de veta ("gtceu:ilmenite", "gcyr:xyz"): la del espacio del material, la de GT, la vanilla o cualquiera. */
function rawOreIds(dump, material) {
  const c = material.indexOf(':');
  const ns = c < 0 ? 'gtceu' : material.slice(0, c);
  const name = c < 0 ? material : material.slice(c + 1);
  for (const n of [ns, 'gtceu', 'minecraft']) if (dump.items.has(`${n}:raw_${name}`)) return [`${n}:raw_${name}`];
  const any = [...dump.items].filter((i) => pathOf(i) === `raw_${name}`);
  return any.sort();
}

/** Abejas que nombran las recetas de Productive Bees (colmena, cruce, conversión, nidos, pesca). */
function beeIds(dump) {
  const set = new Set();
  const add = (b) => {
    const id = typeof b === 'string' ? b : b && typeof b.bee === 'string' ? b.bee : null;
    if (id) set.add(id);
  };
  for (const r of dump.recipes.values()) {
    if (!BEE_TYPES.has(r.type)) continue;
    const j = r.json || {};
    if (r.type === 'productivebees:advanced_beehive') add(j.ingredient);
    add(j.parent1);
    add(j.parent2);
    asArray(j.offspring).forEach(add);
    add(j.source);
    add(j.result);
    if (r.type === 'productivebees:bee_spawning') asArray(j.results).forEach(add);
    add(j.bee);
  }
  return [...set].sort();
}

/**
 * Configuración derivada para buildModel: el mundo de la auditoría, todas las máquinas del registro, las recetas de tipos sin
 * máquina de GT (mesa de crafteo, horno, otros mods) sin condición, las condiciones ignoradas salvo la dimensión (clave dim:<id>),
 * los cubos de cada fluido y, con `bees`, las abejas.
 */
export function obtainConfig(dump, raw) {
  const ob = raw.obtain || {};
  const reach = ob.reachableDimensions || DEFAULT_DIMENSIONS;
  const audited = new Set(ob.audit || []);
  const skipNs = new Set(ob.ignoreNamespaces || []);
  const notFree = makeGlobMatcher(ob.notFree || []);
  const warnings = [];

  // 1) lo que dan los demás mods (vanilla, decoración, AE2, Productive Bees...): se da por conseguible salvo `notFree`
  const free = [];
  for (const id of dump.items) {
    const ns = nsOf(id);
    if (audited.has(ns) || skipNs.has(ns) || notFree(id)) continue;
    free.push(id);
  }
  for (const f of dump.fluids) {
    const ns = nsOf(f);
    if (audited.has(ns) || skipNs.has(ns) || notFree('fluid:' + f)) continue;
    free.push('fluid:' + f);
  }
  const world = [{ id: 'otros-mods', mode: 'auto', items: free, note: 'objetos y fluidos de los espacios de nombres no auditados' }];

  // 2) vetas de las tablas de las perforadoras en las dimensiones a las que se llega (requireRecipe: las que tienen receta; una
  // lista = varias perforadoras, p. ej. la de vetas y la lunar, cada una con su tipo de receta)
  const veins = ob.veins || {};
  const requireRecipes = Array.isArray(veins.requireRecipe) ? veins.requireRecipe : [veins.requireRecipe || null];
  requireRecipes.forEach((rr, i) => world.push({
    id: requireRecipes.length > 1 ? `vetas-${rr ? rr.type : i + 1}` : 'vetas', mode: 'auto', template: 'gtceu:raw_{m}',
    fromVeins: { dimensions: reach, ...(rr ? { requireRecipe: rr } : {}), ...(veins.requireItem ? { requireItem: veins.requireItem } : {}) },
    note: `menas crudas de las vetas de las tablas en las dimensiones a las que se llega${rr ? ` (con receta ${rr.type})` : ''}`,
  }));

  // 3) yacimientos de fluidos (peso > 0) en esas dimensiones, con la perforadora de fluidos si está registrada
  const rigs = ob.fluidRigs || [...dump.machines.keys()].filter((m) => /fluid_drilling_rig$/.test(m)).sort();
  const fv = (dump.fluidVeins || []).filter((v) => v.fluid && dump.fluids.has(v.fluid) && (v.weight === undefined || v.weight > 0) &&
    (v.dims === null || v.dims === undefined || v.dims.some((d) => reach.includes(d))));
  if (fv.length > 0) {
    world.push({
      id: 'yacimientos', mode: 'auto', ...(rigs.length > 0 ? { via: rigs } : {}),
      items: [...new Set(fv.map((v) => 'fluid:' + v.fluid))], note: 'yacimientos de fluidos con peso en las dimensiones a las que se llega',
    });
  }
  for (const w of asArray(ob.world)) world.push(w);

  // 4) cubos: el cubo de un fluido se llena y se vacía sin receta
  const synthetic = [...asArray(raw.synthetic)];
  for (const id of dump.items) {
    const ns = nsOf(id);
    if (!audited.has(ns) || !id.endsWith('_bucket')) continue;
    const fluid = id.slice(0, -'_bucket'.length);
    if (!dump.fluids.has(fluid)) continue;
    synthetic.push({ id: `llenar:${id}`, consumes: ['fluid:' + fluid, 'minecraft:bucket'], produces: [id] });
    synthetic.push({ id: `vaciar:${id}`, consumes: [id], produces: ['fluid:' + fluid] });
  }

  // 5) abejas: un huevo da su abeja y la incubadora da el huevo de una abeja que ya se tiene (huevo + golosina con el gen)
  const bees = ob.bees === undefined ? true : !!ob.bees;
  const extraFacts = reach.map((d) => 'dim:' + d);
  const nbtTyped = bees ? asArray((ob.beeOptions || {}).nbtTyped).concat(DEFAULT_NBT_TYPED) : [];
  if (bees) {
    const opts = ob.beeOptions || {};
    for (const b of asArray(opts.worldBees === undefined ? ['minecraft:bee'] : opts.worldBees)) extraFacts.push(beeKey(b));
    for (const b of beeIds(dump)) {
      const name = pathOf(b);
      let egg = null;
      if (b === 'minecraft:bee') egg = dump.items.has('minecraft:bee_spawn_egg') ? 'minecraft:bee_spawn_egg' : null;
      else if (dump.items.has(`${nsOf(b)}:spawn_egg_${name}`)) egg = `${nsOf(b)}:spawn_egg_${name}`;
      else if (dump.items.has('productivebees:spawn_egg_configurable_bee')) egg = `productivebees:spawn_egg_configurable_bee#${b}`;
      if (egg) {
        synthetic.push({ id: `huevo:${b}`, consumes: [egg], produces: [beeKey(b)] });
        synthetic.push({ id: `incubadora:${b}`, capital: [beeKey(b)], consumes: ['minecraft:egg'], produces: [egg] });
      }
      if (dump.items.has('productivebees:configurable_comb') && dump.items.has('productivebees:configurable_honeycomb')) {
        synthetic.push({ id: `bloque-panal:${b}`, consumes: [`productivebees:configurable_honeycomb#${b}`], produces: [`productivebees:configurable_comb#${b}`] });
        synthetic.push({ id: `panal:${b}`, consumes: [`productivebees:configurable_comb#${b}`], produces: [`productivebees:configurable_honeycomb#${b}`] });
      }
    }
  }

  // 6) tipos de receta sin máquina de GT: se hacen a mano o con un bloque de otro mod (conseguible); los de GT piden su máquina
  const aliases = raw.typeAliases || {};
  const gtTypes = new Set(dump.recipeTypes.keys());
  const freeTypes = new Set(asArray(raw.unconditionalTypes));
  for (const r of dump.recipes.values()) {
    const a = aliases[r.type] || r.type;
    if (!gtTypes.has(r.type) && !gtTypes.has(a) && !skipNs.has(nsOf(a))) freeTypes.add(a);
  }
  const ignoreTypes = [...asArray(raw.ignoreTypes), ...[...skipNs].map((ns) => `${ns}:*`)];

  // 7) claves de las fuentes de eras posteriores (se crean antes de cerrar el grafo; los hechos se dan en cada pasada)
  const later = laterStages(dump, ob);
  const extraKeys = later.flatMap((s) => s.keys);

  const derived = {
    ...raw,
    tier: raw.tier || 'obtain',
    unconditionalTypes: [...freeTypes],
    ignoreTypes,
    conditions: { '*': { ignore: true }, dimension: { asKeys: true }, ...(ob.conditions || {}) },
    world,
    machines: asArray(raw.machines),
    machinesFromRegistry: [{ prefix: '', multiblocks: true, maxEUtByTier: true, includeTypeless: true, excludeTypes: ['gtceu:dummy'] }],
    synthetic,
    targets: [], autoTargets: [], targetsFromVeins: [], autoTargetsFromVeins: [], eraItems: [], eraResources: [],
    nbtTyped, bees, extraFacts, extraKeys,
  };
  return { derived, later, warnings, reach };
}

/**
 * Fuentes de eras posteriores, en orden (`obtain.later`): dimensiones (sus vetas, todas, y las recetas con su condición),
 * vetas concretas (las del End apartadas en veins_excluded.json), materiales de veta sueltos (`materials`: sus menas crudas, para
 * una veta que el pack ya quitó del mundo y no sale en veins.json) y objetos sueltos. Cada etapa suma a las anteriores.
 */
function laterStages(dump, ob) {
  const out = [];
  for (const s of asArray(ob.later)) {
    const dims = asArray(s.dimensions);
    const veinIds = new Set(asArray(s.veins));
    const keys = dims.map((d) => 'dim:' + d);
    const mats = new Set(asArray(s.materials));
    for (const v of dump.veins || []) {
      if (veinIds.has(v.id) || (dims.length > 0 && v.dims.some((d) => dims.includes(d)))) for (const m of v.mats) mats.add(m);
    }
    for (const m of mats) keys.push(...rawOreIds(dump, m));
    // objetos del sitio (bloques del suelo de un planeta...): ids o globs contra el registro (sin los bloques de mena: una mena
    // en piedra de un planeta no dice que allí haya una veta)
    for (const it of asArray(s.items)) {
      if (/[*?]/.test(it)) {
        const match = makeGlobMatcher([it]);
        for (const id of dump.items) if (match(id) && !/_ore$/.test(id)) keys.push(id);
      } else keys.push(it);
    }
    out.push({ id: s.id, era: s.era || '', until: s.until || null, label: s.label || s.id, dimensions: dims, veins: [...veinIds], keys: [...new Set(keys)], materials: [...mats].sort() });
  }
  return out;
}

/** Formas de mena (las que salen de picar o perforar una veta): crudas, molidas, lavadas, refinadas, polvo impuro y purificado. */
export const isOreForm = (id) => !id.startsWith('fluid:') &&
  /^(raw_.+|crushed_.+_ore|purified_.+_ore|refined_.+_ore|impure_.+_dust|pure_.+_dust|.+_indicator)$/.test(pathOf(id));

/** Materiales de cada espacio de nombres según las formas del registro (polvo, lingote, gema, mena cruda, fluido). */
function materialSets(ids) {
  const sets = new Map();
  const add = (ns, m) => {
    if (!m) return;
    if (!sets.has(ns)) sets.set(ns, new Set());
    sets.get(ns).add(m);
  };
  for (const id of ids) {
    const ns = nsOf(id);
    const p = pathOf(id);
    if (id.startsWith('fluid:')) {
      add(ns, p.replace(/^molten_/, '').replace(/_plasma$/, ''));
      continue;
    }
    let m;
    if ((m = /^(.+)_dust$/.exec(p)) && !/^(small|tiny|impure|pure)_/.test(m[1])) add(ns, m[1]);
    else if ((m = /^(.+)_ingot$/.exec(p)) && !/^hot_/.test(m[1])) add(ns, m[1]);
    else if ((m = /^(.+)_gem$/.exec(p)) && !/^(chipped|flawed|flawless|exquisite)_/.test(m[1])) add(ns, m[1]);
    else if ((m = /^raw_(.+)$/.exec(p)) && !/_block$/.test(m[1])) add(ns, m[1]);
  }
  return sets;
}

/**
 * Palabras que forman las variantes de un material en GT (prefijos y sufijos de TagPrefix, cables, tuberías, herramientas) y las
 * de los addons (molido, espuma, nanitos). Un objeto va al grupo de un material solo si lo demás de su id son estas palabras:
 * gtceu:double_iron_plate es hierro; gtceu:industrial_steam_casing o gcyr:moon_stone no son formas del vapor ni de la piedra.
 */
const FORM_TOKENS = new Set([
  'tiny', 'small', 'impure', 'pure', 'crushed', 'purified', 'refined', 'raw', 'hot', 'double', 'dense', 'long', 'fine', 'chipped',
  'flawed', 'flawless', 'exquisite', 'molten', 'liquid', 'plasma', 'dust', 'ingot', 'gem', 'nugget', 'block', 'plate', 'foil', 'rod',
  'bolt', 'screw', 'ring', 'round', 'spring', 'gear', 'rotor', 'frame', 'lens', 'wire', 'ore', 'bucket', 'single', 'quadruple',
  'octal', 'hex', 'cable', 'normal', 'large', 'huge', 'nonuple', 'fluid', 'item', 'pipe', 'restrictive', 'buzz', 'saw', 'blade',
  'turbine', 'drill', 'head', 'chainsaw', 'tip', 'wrench', 'screwdriver', 'cutter', 'pickaxe', 'shovel', 'axe', 'hoe', 'sword',
  'file', 'hammer', 'knife', 'mortar', 'crowbar', 'mining', 'spade', 'scythe', 'butchery', 'plunger', 'mallet', 'crate', 'drum',
  'buzzsaw', 'shears', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'milled', 'froth', 'nanites', 'indicator',
]);

/**
 * Grupo de un objeto: el material más largo cuyo nombre aparece entero en el id y cuyo resto son palabras de forma
 * (iron < wrought_iron), o el propio objeto. Las máquinas registradas van solas.
 */
function makeGrouper(sets, machines) {
  const gt = sets.get('gtceu') || new Set();
  return (id) => {
    const ns = nsOf(id);
    if (machines.has(id)) return { group: id, material: null, ns };
    const own = sets.get(ns) || new Set();
    const p = pathOf(id).replace(/^flowing_/, '');
    const tok = p.split('_');
    const restIsForm = (i, j) => tok.every((t, x) => (x >= i && x < j) || FORM_TOKENS.has(t));
    let best = null;
    for (let i = 0; i < tok.length; i++) {
      for (let j = tok.length; j > i; j--) {
        if (best && j - i <= best.n) break;
        const cand = tok.slice(i, j).join('_');
        if (!own.has(cand) && !gt.has(cand)) continue;
        if (!restIsForm(i, j)) continue;
        best = { n: j - i, ns: own.has(cand) ? ns : 'gtceu', m: cand };
      }
    }
    if (!best) return { group: id, material: null, ns };
    return { group: best.ns === 'gtceu' ? best.m : `${best.ns}:${best.m}`, material: best.m, ns: best.ns };
  };
}

/**
 * Primera regla de la configuración que nombra el grupo (material o alguno de sus objetos). Filtros opcionales de la regla:
 * `partial` (true: solo grupos con formas sueltas; false: solo materiales enteros) y `forms: "ore"` (todas las formas que faltan
 * son de mena: el material se consigue por otra vía pero no tiene veta). `stage` elige qué reglas se miran:
 *   'first'    las A y B (deciden antes que nadie: darle una fuente ya, o su era);
 *   'after'    las C (solo si el grupo no llega con una era posterior: lo que llega no es "nunca");
 *   'fallback' las de reserva (`fallback: true`, de cualquier clase), al final.
 */
function makeClassifier(rules) {
  const compiled = asArray(rules).map((r, idx) => ({
    idx, rule: r, mats: makeGlobMatcher(asArray(r.materials)), items: makeGlobMatcher(asArray(r.items)), used: 0,
    any: asArray(r.materials).length === 0 && asArray(r.items).length === 0,
  }));
  const stageOf = (r) => (r.fallback ? 'fallback' : r.class === 'C' ? 'after' : 'first');
  const classify = (group, stage) => {
    for (const c of compiled) {
      if (stageOf(c.rule) !== stage) continue;
      if (c.rule.partial !== undefined && c.rule.partial === group.full) continue;
      if (c.rule.forms === 'ore' && !group.keys.every(isOreForm)) continue;
      if (c.any || c.mats(group.id) || group.keys.some((k) => c.items(k))) {
        c.used++;
        return c.rule;
      }
    }
    return null;
  };
  return { classify, compiled };
}

/**
 * Ejecuta la auditoría. Devuelve {verdict, groups, stats, later, unusedRules, warnings, model}.
 * opts.unlocks = false salta el cálculo de lo que abriría cada material (más rápido, para las pruebas que no lo miran).
 */
export function runObtain(dump, raw, opts = {}) {
  const t0 = Date.now();
  const ob = raw.obtain || {};
  const { derived, later, warnings } = obtainConfig(dump, raw);
  const model = buildModel(dump, derived);
  warnings.push(...model.warnings);
  const g = model.g;
  const baseFacts = [...model.facts.manual, ...model.facts.auto];
  const base = lfp(g, { facts: baseFacts });
  const idOf = (name) => g.keyIndex.get(name);
  const reachedIn = (res, name) => {
    const k = idOf(name);
    return k !== undefined && res.reached[k] === 1;
  };

  // auditados: objetos y fluidos de los espacios de nombres de `audit`, sin los fluidos "flowing_" ni lo que `ignore` aparta;
  // `ignoreOreBlocks`: los bloques de mena (piedra + material + "_ore") son bloques del mundo, no se listan (sí las formas
  // molidas, lavadas y refinadas: crushed_/purified_/refined_)
  const audited = new Set(ob.audit || []);
  const ignoreGlob = makeGlobMatcher(ob.ignore || []);
  const oreBlock = (id) => !!ob.ignoreOreBlocks && !id.startsWith('fluid:') && /_ore$/.test(id) && !/^(crushed|purified|refined)_/.test(pathOf(id));
  const ignore = (id) => ignoreGlob(id) || oreBlock(id);
  const auditedIds = [];
  for (const id of dump.items) if (audited.has(nsOf(id)) && !ignore(id)) auditedIds.push(id);
  for (const f of dump.fluids) if (audited.has(nsOf(f)) && !/^flowing_/.test(pathOf(f)) && !ignore('fluid:' + f)) auditedIds.push('fluid:' + f);
  const never = new Set(auditedIds.filter((n) => !reachedIn(base, n)));

  // grupos por material
  const grouper = makeGrouper(materialSets(auditedIds), dump.machines);
  const groups = new Map();
  for (const id of auditedIds) {
    const gi = grouper(id);
    if (!groups.has(gi.group)) groups.set(gi.group, { id: gi.group, material: gi.material, ns: gi.ns, all: [], keys: [] });
    const grp = groups.get(gi.group);
    grp.all.push(id);
    if (never.has(id)) grp.keys.push(id);
  }
  const neverGroups = [...groups.values()].filter((grp) => grp.keys.length > 0);
  const groupOfKey = new Map();
  for (const grp of neverGroups) for (const k of grp.keys) groupOfKey.set(k, grp);

  // recetas que piden (una ranura sin ninguna alternativa alcanzable con algo del grupo) o dan algo del grupo
  for (const grp of neverGroups) {
    grp.uses = new Set();
    grp.makes = new Set();
  }
  const neverIds = new Map();
  for (const k of never) {
    const id = idOf(k);
    if (id !== undefined) neverIds.set(id, groupOfKey.get(k));
  }
  for (let r = 0; r < g.rules.length; r++) {
    const rule = g.rules[r];
    if (rule.kind !== 'recipe') continue;
    for (const slot of rule.slots) {
      if (slot.alts.some((a) => base.reached[a] === 1)) continue;
      for (const a of slot.alts) {
        const grp = neverIds.get(a);
        if (grp) grp.uses.add(r);
      }
    }
    for (const o of rule.outs) {
      const grp = neverIds.get(o);
      if (grp) grp.makes.add(r);
    }
  }

  // qué dan las recetas que lo piden (pistas para la clase A) y qué se abriría si el material se consiguiera
  const outsOf = (grp) => {
    const counts = new Map();
    const own = new Set(grp.keys.map(idOf).filter((k) => k !== undefined));
    for (const r of grp.uses) {
      for (const o of g.rules[r].outs) {
        if (own.has(o)) continue;
        const name = g.keyNames[o];
        if (!counts.has(name)) counts.set(name, { key: name, n: 0, reached: base.reached[o] === 1 });
        counts.get(name).n++;
      }
    }
    return [...counts.values()].sort((a, b) => b.n - a.n || (a.key < b.key ? -1 : 1));
  };
  const typesOf = (set) => {
    const c = new Map();
    for (const r of set) c.set(g.rules[r].type, (c.get(g.rules[r].type) || 0) + 1);
    return [...c.entries()].sort((a, b) => b[1] - a[1]).map(([type, n]) => ({ type, n }));
  };
  for (const grp of neverGroups) {
    grp.gives = outsOf(grp);
    grp.useTypes = typesOf(grp.uses);
    grp.makeTypes = typesOf(grp.makes);
    grp.full = grp.keys.length === grp.all.length;
    grp.unlocks = null;
  }

  // eras posteriores: la primera etapa (acumulada) en la que el grupo se consigue
  const stageInfo = [];
  let facts = [...baseFacts];
  const pending = new Set(neverGroups);
  for (const s of later) {
    facts = [...facts, ...s.keys.map(idOf).filter((k) => k !== undefined)];
    const res = lfp(g, { facts });
    let n = 0;
    for (const grp of [...pending]) {
      if (grp.keys.some((k) => reachedIn(res, k))) {
        grp.later = { id: s.id, era: s.era, label: s.label, until: s.until };
        pending.delete(grp);
        n++;
      }
    }
    stageInfo.push({ id: s.id, era: s.era, label: s.label, groups: n, dimensions: s.dimensions, veins: s.veins, materials: s.materials.length });
  }

  // clasificación: reglas A y B, luego solo creativo, luego era posterior (lo que llega con una era no es "nunca", así que una
  // regla C no lo tapa), luego las reglas C y al final las de reserva; si no, «?»
  const { classify, compiled } = makeClassifier(ob.classes);
  const creative = makeGlobMatcher(ob.creative || []);
  // lo que el pack ya oculta: objetos y fluidos de la etiqueta (una etiqueta de objetos vacía se vuelca como [minecraft:barrier])
  const hiddenItems = dump.tags.itemTags.get(HIDDEN_TAG) || null;
  const hiddenFluids = dump.tags.fluidTags.get(HIDDEN_TAG) || null;
  const hiddenSet = hiddenItems || hiddenFluids
    ? new Set([...(hiddenItems || []).filter((id) => id !== 'minecraft:barrier'), ...(hiddenFluids || []).map((f) => 'fluid:' + f)])
    : null;
  const apply = (grp, rule, by) => {
    grp.cls = rule.class;
    grp.reason = rule.reason || '';
    grp.era = rule.era || (grp.later ? grp.later.era : '');
    grp.until = rule.class === 'C' ? 'never' : rule.until || (grp.later ? grp.later.until : null) || null;
    grp.keepRecipes = !!rule.keepRecipes;
    grp.source = rule.source || '';
    grp.by = by;
  };
  for (const grp of neverGroups) {
    const rule = classify(grp, 'first');
    if (rule) apply(grp, rule, 'config');
    else if (grp.keys.every((k) => creative(k))) {
      grp.cls = 'C';
      grp.reason = 'solo modo creativo';
      grp.until = 'never';
      grp.by = 'creativo';
    } else if (grp.later) {
      grp.cls = 'B';
      grp.era = grp.later.era;
      grp.until = grp.later.until || null;
      grp.reason = `sale de ${grp.later.label}`;
      grp.by = 'era';
    } else {
      const late = classify(grp, 'after') || classify(grp, 'fallback');
      if (late) apply(grp, late, 'config');
      else {
        grp.cls = '?';
        grp.reason = autoReason(grp, g, base, groupOfKey);
        grp.until = null;
        grp.by = 'sin clasificar';
      }
    }
    if (grp.cls === 'A') grp.until = null;
    if (grp.cls === 'B' && !ERA_IDS.includes(grp.until)) warnings.push(`${grp.id}: clase B sin «until» válido (la era en que llega: ${ERA_IDS.join(', ')}); la tabla de ocultos no lo puede ocultar`);
    grp.hidden = hiddenSet ? grp.keys.filter((k) => hiddenSet.has(k)).length : null;
  }

  // la ocultación del pack frente a la auditoría: nada que se consiga puede estar oculto (no se verían sus recetas) y, si se sabe
  // hasta qué era está implementado el pack (opts.implementedEra o info.json: hidden.implementedEra, que vuelca
  // integration/hidden.js), todo lo C y todo lo B de una era posterior tiene que estar oculto (si no, la tabla está vieja)
  let hiding = null;
  if (hiddenSet) {
    const era = opts.implementedEra || (dump.info && dump.info.hidden && dump.info.hidden.implementedEra) || null;
    const limit = ERA_IDS.indexOf(era);
    const obtainable = [...hiddenSet].filter((k) => reachedIn(base, k)).sort();
    let visible = null;
    if (limit >= 0) {
      visible = [];
      for (const grp of neverGroups) {
        if (grp.until !== 'never' && !(ERA_IDS.indexOf(grp.until) > limit)) continue;
        for (const k of grp.keys) if (!hiddenSet.has(k)) visible.push({ key: k, group: grp.id, until: grp.until });
      }
    }
    hiding = {
      items: [...hiddenSet].filter((k) => !k.startsWith('fluid:')).length, fluids: [...hiddenSet].filter((k) => k.startsWith('fluid:')).length,
      implementedEra: limit >= 0 ? era : null, obtainable, visible,
    };
  }

  // qué se abriría si el material se consiguiera (solo los de clase A y los sin clasificar, que es donde se decide): una pasada
  // con sus formas como hechos, sin las recetas que reciclan esas formas (moler o fundir una máquina imposible devolvería sus
  // materiales y "abriría" media tabla); cuenta lo que pasa a conseguirse fuera del propio grupo
  if (opts.unlocks !== false) {
    const limit = ob.unlockLimit === undefined ? 200 : ob.unlockLimit;
    const cand = neverGroups.filter((grp) => (grp.cls === 'A' || grp.cls === '?') && grp.gives.some((o) => !o.reached))
      .sort((a, b) => b.uses.size - a.uses.size).slice(0, limit);
    const recycling = (r) => /_recycling$/.test(String((g.rules[r].meta || {}).category || ''));
    for (const grp of cand) {
      const enabled = new Uint8Array(g.rules.length).fill(1);
      for (const r of grp.uses) if (recycling(r)) enabled[r] = 0;
      const res = lfp(g, { facts: [...baseFacts, ...grp.keys.map(idOf).filter((k) => k !== undefined)], enabled });
      const opened = new Set();
      let n = 0;
      for (const k of never) {
        if (groupOfKey.get(k) === grp || !reachedIn(res, k)) continue;
        n++;
        opened.add(groupOfKey.get(k).id);
      }
      grp.unlocks = { keys: n, groups: [...opened].sort() };
    }
  }

  const order = { A: 0, B: 1, C: 2, '?': 3 };
  neverGroups.sort((a, b) => order[a.cls] - order[b.cls] || (a.id < b.id ? -1 : 1));
  const count = (cls) => {
    const list = neverGroups.filter((grp) => grp.cls === cls);
    const recipes = new Set();
    for (const grp of list) for (const r of [...grp.uses, ...grp.makes]) recipes.add(r);
    return {
      groups: list.length,
      items: list.reduce((n, grp) => n + grp.keys.filter((k) => !k.startsWith('fluid:')).length, 0),
      fluids: list.reduce((n, grp) => n + grp.keys.filter((k) => k.startsWith('fluid:')).length, 0),
      recipes: recipes.size,
    };
  };
  const byClass = { A: count('A'), B: count('B'), C: count('C'), '?': count('?') };
  const allRecipes = new Set();
  for (const grp of neverGroups) for (const r of [...grp.uses, ...grp.makes]) allRecipes.add(r);
  const unusedRules = compiled.filter((c) => c.used === 0).map((c) => ({ index: c.idx, class: c.rule.class, reason: c.rule.reason || '', materials: asArray(c.rule.materials), items: asArray(c.rule.items) }));
  const hidingBad = !!hiding && (hiding.obtainable.length > 0 || (hiding.visible !== null && hiding.visible.length > 0));
  const verdict = byClass['?'].groups > 0 || hidingBad ? 'FAIL' : 'PASS';
  return {
    verdict, groups: neverGroups, byClass, later: stageInfo, unusedRules, warnings, model, base, hiding,
    stats: {
      audited: auditedIds.length, never: never.size, groups: neverGroups.length, recipes: allRecipes.size,
      full: neverGroups.filter((grp) => grp.full).length, partial: neverGroups.filter((grp) => !grp.full).length,
      hiddenKnown: !!hiddenSet, ms: Date.now() - t0, rules: g.rules.length,
    },
  };
}

/**
 * Razón automática de un grupo sin clasificar: que nada lo fabrica, que solo sale de sus propias formas o del reciclaje de lo
 * que se hace con él, o qué piden (de fuera) las recetas que lo dan.
 */
function autoReason(grp, g, base, groupOfKey) {
  if (grp.makes.size === 0) return grp.uses.size > 0 ? `nada lo fabrica; lo piden ${grp.uses.size} recetas` : 'sin recetas: solo está en el registro';
  const own = new Set(grp.keys);
  const madeFrom = new Set();
  for (const r of grp.uses) for (const o of g.rules[r].outs) madeFrom.add(g.keyNames[o]);
  const need = new Map();
  for (const r of grp.makes) {
    for (const slot of g.rules[r].slots) {
      if (slot.alts.some((a) => base.reached[a] === 1)) continue;
      const names = slot.alts.map((a) => g.keyNames[a]);
      if (names.some((n) => own.has(n) || madeFrom.has(n))) continue;
      const other = groupOfKey.get(names[0]);
      const label = other ? other.id : slot.label;
      need.set(label, (need.get(label) || 0) + 1);
    }
  }
  const top = [...need.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
  return top.length > 0 ? `sus recetas piden ${top.join(', ')}` : 'solo sale de sus propias formas o de reciclar lo que se hace con él';
}

const short = (list, n) => (list.length <= n ? list.join(', ') : `${list.slice(0, n).join(', ')} (+${list.length - n})`);
const ruleNames = (g, set, n) => short([...set].map((r) => g.rules[r].name).sort(), n);
const givesText = (grp, n = 4) => short(grp.gives.map((o) => `${o.key}${o.reached ? '' : ' (nuevo)'}`), n);

/** Por qué falla el paso: grupos sin clasificar y, si el volcado lo dice, una ocultación que no cuadra con la auditoría. */
function failWhy(res) {
  const why = [];
  if (res.byClass['?'].groups > 0) why.push(`${res.byClass['?'].groups} grupos sin clasificar`);
  if (res.hiding && res.hiding.obtainable.length > 0) why.push(`${res.hiding.obtainable.length} ocultos que se consiguen`);
  if (res.hiding && res.hiding.visible && res.hiding.visible.length > 0) why.push(`${res.hiding.visible.length} sin ocultar`);
  return why.join('; ');
}

/** Líneas de la ocultación del pack (etiqueta c:hidden_from_recipe_viewers) frente a la auditoría. */
function hidingLines(res, n = 20) {
  const h = res.hiding;
  if (!h) return [];
  const L = [`Ocultos en el pack (${HIDDEN_TAG}): ${h.items} objetos y ${h.fluids} fluidos; ${h.implementedEra
    ? `implementado hasta ${h.implementedEra}`
    : 'el volcado no dice hasta qué era está implementado (integration/hidden.js): no se mira lo que falta por ocultar'}`];
  L.push(`  se consiguen pero están ocultos: ${h.obtainable.length}${h.obtainable.length > 0 ? ' — ' + short(h.obtainable, n) : ''}`);
  if (h.visible) {
    L.push(`  tendrían que estar ocultos (C, o B de una era posterior a ${h.implementedEra}) y se ven: ${h.visible.length}${h.visible.length > 0
      ? ' — ' + short(h.visible.map((v) => `${v.key} (${v.group}, ${v.until})`), n) + ' (regenera la tabla de ocultos: --table)' : ''}`);
  }
  return L;
}

/** Informe de texto (consola y --out). */
export function renderObtainText(res, file) {
  const L = [];
  const s = res.stats;
  L.push('=== PASO OBTENCIÓN: lo que no se consigue nunca ===');
  if (file) L.push(`Config  : ${file}`);
  L.push(`Auditados: ${s.audited} objetos y fluidos; ${s.never} no se consiguen, en ${s.groups} grupos (${s.full} materiales enteros, ${s.partial} con formas sueltas); ${s.recipes} recetas los piden o los dan.`);
  L.push(`Modelo  : ${s.rules} reglas (${s.ms} ms)${s.hiddenKnown ? '' : '; el volcado no trae la etiqueta ' + HIDDEN_TAG + ' (no se sabe qué está ya oculto)'}`);
  for (const st of res.later) L.push(`Era posterior ${st.label} (${st.era}): ${st.groups} grupos`);
  L.push('');
  L.push('CLASE  GRUPOS  OBJETOS  FLUIDOS  RECETAS');
  for (const c of ['A', 'B', 'C', '?']) {
    const b = res.byClass[c];
    L.push(`${c.padEnd(6)} ${String(b.groups).padStart(6)}  ${String(b.items).padStart(7)}  ${String(b.fluids).padStart(7)}  ${String(b.recipes).padStart(7)}`);
  }
  if (res.hiding) {
    L.push('');
    L.push(...hidingLines(res));
  }
  for (const c of ['A', 'B', 'C', '?']) {
    const list = res.groups.filter((grp) => grp.cls === c);
    if (list.length === 0) continue;
    L.push('');
    L.push(`--- ${c} (${list.length}) ---`);
    for (const grp of list) {
      const extra = c === 'A' || c === '?' ? `; lo piden ${grp.uses.size} (${givesText(grp)})` : '';
      L.push(`  ${grp.id}${grp.full ? '' : ' [formas sueltas]'}: ${grp.keys.length} — ${grp.reason}${grp.era ? ` [${grp.era}]` : ''}${extra}`);
    }
  }
  if (res.unusedRules.length > 0) {
    L.push('');
    L.push('Reglas de clasificación sin uso (lo que nombran ya se consigue o no existe):');
    for (const u of res.unusedRules) L.push(`  #${u.index} ${u.class}: ${short([...u.materials, ...u.items], 6)} — ${u.reason}`);
  }
  if (res.warnings.length > 0) {
    L.push('');
    L.push(`Avisos (${res.warnings.length}):`);
    for (const w of res.warnings.slice(0, 30)) L.push('  ' + w);
  }
  L.push('');
  L.push(`VEREDICTO: ${res.verdict}${res.verdict === 'FAIL' ? ` (${failWhy(res)})` : ''}`);
  return L.join('\n') + '\n';
}

/** Resultado en JSON (--json): cada grupo con sus objetos y las recetas que lo piden o lo dan. */
export function obtainToJson(res) {
  const g = res.model.g;
  return {
    pass: 'obtain', verdict: res.verdict, stats: res.stats, byClass: res.byClass, later: res.later, unusedRules: res.unusedRules,
    warnings: res.warnings, hiding: res.hiding || null,
    groups: res.groups.map((grp) => ({
      id: grp.id, class: grp.cls, by: grp.by, reason: grp.reason, era: grp.era || '', until: grp.until || null, source: grp.source || '', full: grp.full,
      items: grp.keys, hidden: grp.hidden, later: grp.later || null,
      uses: [...grp.uses].map((r) => g.rules[r].name).sort(), makes: [...grp.makes].map((r) => g.rules[r].name).sort(),
      gives: grp.gives.slice(0, 20), unlocks: grp.unlocks,
    })),
  };
}

/**
 * Tabla de ocultos del pack (--table): pack/kubejs/data/grindless/tables/hidden_until.json, que lee
 * server_scripts/grindless/integration/hidden.js. Un grupo por material: los B con la era en que llegan (`until`), los C con
 * "never"; cada uno con sus objetos y fluidos. Los C llevan además `removeRecipes`: las recetas que solo existen para ellos
 * (una entrada que solo admite objetos C, o todas sus salidas C), que hidden.js quita del servidor. `previous` (la tabla que
 * ya había) conserva las recetas quitadas de los grupos que siguen siendo C: un volcado hecho con hidden.js activo ya no las trae.
 */
export function hiddenTable(res, opts = {}) {
  const g = res.model.g;
  const B = res.groups.filter((grp) => grp.cls === 'B');
  const C = res.groups.filter((grp) => grp.cls === 'C');
  const cIds = new Map();
  for (const grp of C) {
    for (const k of grp.keys) {
      const id = g.keyIndex.get(k);
      if (id !== undefined && !cIds.has(id)) cIds.set(id, grp);
    }
  }
  const removeOf = new Map(C.map((grp) => [grp, new Set()]));
  for (const rule of g.rules) {
    if (rule.kind !== 'recipe') continue;
    let owner = null;
    for (const slot of rule.slots) {
      if (slot.role === 'machine' || slot.role === 'cond') continue;
      if (slot.alts.length > 0 && slot.alts.every((a) => cIds.has(a))) {
        owner = cIds.get(slot.alts[0]);
        break;
      }
    }
    if (!owner && rule.outs.length > 0 && rule.outs.every((o) => cIds.has(o))) owner = cIds.get(rule.outs[0]);
    if (owner) removeOf.get(owner).add(rule.name);
  }
  const previous = new Map();
  for (const pg of asArray(opts.previous && opts.previous.groups)) {
    if (pg && pg.until === 'never' && Array.isArray(pg.removeRecipes)) previous.set(pg.material, pg.removeRecipes);
  }
  const entry = (grp) => {
    const e = {
      material: grp.id, until: grp.until, reason: grp.reason,
      items: grp.keys.filter((k) => !k.startsWith('fluid:')).sort(),
      fluids: grp.keys.filter((k) => k.startsWith('fluid:')).map((k) => k.slice(6)).sort(),
    };
    if (grp.cls === 'C') e.removeRecipes = grp.keepRecipes ? [] : [...new Set([...removeOf.get(grp), ...(previous.get(grp.id) || [])])].sort();
    if (grp.keepRecipes) e.keepRecipes = true;
    return e;
  };
  const rank = (u) => (u === 'never' ? ERA_IDS.length : ERA_IDS.indexOf(u));
  const groups = [...B, ...C].filter((grp) => grp.until).map(entry)
    .sort((a, b) => rank(a.until) - rank(b.until) || (a.material < b.material ? -1 : a.material > b.material ? 1 : 0));
  return {
    _source: `tools/analysis obtainability audit: node tools/analysis/reachability.mjs --pass obtain --dump <dump> --table <this file> (config tools/analysis/tiers/obtain.json${opts.dump ? `, dump ${opts.dump}` : ''}${opts.date ? `, ${opts.date}` : ''}). Do not edit by hand: change the audit config and regenerate.`,
    _how_it_is_used: [
      'server_scripts/grindless/integration/hidden.js reads it. Every group whose `until` is above IMPLEMENTED_ERA (the constant at the top of hidden.js) or is "never" gets its items and fluids into the tags c:hidden_from_recipe_viewers (EMI drops them from its index) and grindless:hidden_with_recipes (assets/emi/index/stacks/grindless_hidden_with_recipes.json disables that tag in EMI: every recipe with one of them as input, output or catalyst disappears from EMI too). Bumping IMPLEMENTED_ERA when an era lands shows that era\'s content again.',
      'until = era id of docs/viaje.md (steam, lv, mv, hv, ev, iv, luv, zpm, uv, uhv, uev, uiv, uxv, opv, max) in which the group can first be obtained (class B of the audit: planets, the excluded End veins and everything that hangs on them). Its recipes stay on the server, only hidden.',
      'until = "never": junk (class C of the audit): hidden for good and its removeRecipes are removed from the server (recipes that only exist for it: an ingredient that only accepts junk, or junk as every output). Nothing is unregistered: old saves keep every id.',
      'keepRecipes = true: a hidden item whose recipes stay, on the server and in EMI (the old items of earlier versions and their conversion into the new ones): only c:hidden_from_recipe_viewers.',
      'material = audit group: a GT material with all its forms (dust, ingot, plate, fluid, bucket...) or a single item; reason = why (from the audit config, in Spanish).',
      'Regenerating keeps the removeRecipes of the groups that are still junk (a dump taken with hidden.js active no longer has those recipes).',
    ],
    eras: ERA_IDS,
    groups,
  };
}

/** La tabla en texto: un grupo por línea (se lee y se compara bien). */
export function renderHiddenTable(table) {
  const head = { ...table };
  delete head.groups;
  const lines = JSON.stringify(head, null, 2).split('\n');
  lines.pop();
  lines[lines.length - 1] += ',';
  lines.push('  "groups": [');
  table.groups.forEach((grp, i) => lines.push('    ' + JSON.stringify(grp) + (i < table.groups.length - 1 ? ',' : '')));
  lines.push('  ]', '}');
  return lines.join('\n') + '\n';
}

/** Informe en Markdown (--md): tabla resumen, la lista A entera y las B y C compactas. */
export function renderObtainMarkdown(res, meta = {}) {
  const g = res.model.g;
  const s = res.stats;
  const L = [];
  L.push('# Auditoría de obtención');
  L.push('');
  L.push(`Volcado: \`${meta.dump || ''}\`. Generado con \`node tools/analysis/reachability.mjs --pass obtain\`${meta.date ? ` el ${meta.date}` : ''}.`);
  L.push('');
  L.push(`Se auditan ${s.audited} objetos y fluidos (${meta.namespaces || ''}). **${s.never} no se consiguen nunca**, en ${s.groups} grupos por material (${s.full} materiales enteros, ${s.partial} con formas sueltas), y ${s.recipes} recetas los piden o los dan.`);
  L.push('');
  L.push('| Clase | Qué hacer | Grupos | Objetos | Fluidos | Recetas |');
  L.push('|---|---|---:|---:|---:|---:|');
  const what = { A: 'darle una fuente', B: 'ocultar hasta su era', C: 'ocultar con sus recetas', '?': 'sin clasificar' };
  for (const c of ['A', 'B', 'C', '?']) {
    const b = res.byClass[c];
    if (c === '?' && b.groups === 0) continue;
    L.push(`| ${c} | ${what[c]} | ${b.groups} | ${b.items} | ${b.fluids} | ${b.recipes} |`);
  }
  L.push('');
  L.push(`Veredicto del paso: **${res.verdict}**${res.verdict === 'FAIL' ? ` (${failWhy(res)})` : ''}.${s.hiddenKnown ? '' : ` El volcado no trae la etiqueta \`${HIDDEN_TAG}\`: no se sabe qué está ya oculto.`}`);
  if (res.hiding) {
    L.push('');
    for (const line of hidingLines(res, 10)) L.push(line.startsWith('  ') ? `- ${line.trim()}` : line);
  }
  L.push('');
  L.push('## A: merecen una fuente');
  L.push('');
  const A = res.groups.filter((grp) => grp.cls === 'A');
  if (A.length === 0) L.push('Ninguno.');
  for (const grp of A) {
    L.push(`### ${grp.id}`);
    L.push('');
    L.push(`- **Por qué:** ${grp.reason}`);
    if (grp.source || grp.era) L.push(`- **Fuente propuesta:** ${grp.source || '—'}${grp.era ? ` (era ${grp.era})` : ''}`);
    L.push(`- **Formas (${grp.keys.length}):** ${grp.keys.map((k) => `\`${k}\``).join(', ')}`);
    L.push(`- **Recetas que lo piden (${grp.uses.size}):** ${[...grp.uses].map((r) => `\`${g.rules[r].name}\``).sort().join(', ') || '—'}`);
    L.push(`- **Dan:** ${grp.gives.map((o) => `\`${o.key}\`${o.reached ? '' : ' (hoy no se consigue)'}`).join(', ') || '—'}`);
    if (grp.unlocks) L.push(`- **Abriría:** ${grp.unlocks.keys} objetos/fluidos más${grp.unlocks.groups.length > 0 ? ` (${short(grp.unlocks.groups, 8)})` : ''}`);
    L.push(`- **Recetas que lo dan (${grp.makes.size}):** ${ruleNames(g, grp.makes, 12) || '—'}`);
    L.push('');
  }
  L.push('## B: llegan con una era posterior (ocultar hasta entonces)');
  L.push('');
  const compact = (list, head) => {
    const forms = list.reduce((n, grp) => n + grp.keys.length, 0);
    const recipes = new Set();
    for (const grp of list) for (const r of [...grp.uses, ...grp.makes]) recipes.add(r);
    L.push(`- **${head}** (${list.length} ${list.length === 1 ? 'grupo' : 'grupos'}, ${forms} ${forms === 1 ? 'forma' : 'formas'}, ${recipes.size} ${recipes.size === 1 ? 'receta' : 'recetas'}): ${list.map((grp) => `\`${grp.id}\``).join(', ')}`);
  };
  const byKey = (list, keyOf) => {
    const m = new Map();
    for (const grp of list) {
      const k = keyOf(grp);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(grp);
    }
    return m;
  };
  const B = res.groups.filter((grp) => grp.cls === 'B');
  if (B.length === 0) L.push('Ninguno.');
  for (const [k, list] of byKey(B, (grp) => `${grp.era || '—'}: ${grp.reason}`)) compact(list, k);
  L.push('');
  L.push('## C: no llegarán nunca (ocultar con sus recetas)');
  L.push('');
  const C = res.groups.filter((grp) => grp.cls === 'C');
  if (C.length === 0) L.push('Ninguno.');
  for (const [reason, list] of byKey(C, (grp) => grp.reason)) compact(list, reason);
  L.push('');
  const U = res.groups.filter((grp) => grp.cls === '?');
  if (U.length > 0) {
    L.push('## Sin clasificar');
    L.push('');
    for (const grp of U) L.push(`- \`${grp.id}\` (${grp.keys.length} formas; lo piden ${grp.uses.size}, lo dan ${grp.makes.size}): ${grp.reason}`);
    L.push('');
  }
  L.push('## Cómo se calcula');
  L.push('');
  L.push(`- **Fuentes del mundo:** las vetas de las tablas de la perforadora (las que tienen receta de perforación) en ${(meta.dimensions || []).map((d) => `\`${d}\``).join(', ')}; los yacimientos de fluidos con peso; los árboles de caucho, el mármol y el granito rojo; las abejas (nidos, cruces, conversiones, pesca y huevos de la incubadora); todo lo de los mods no auditados, salvo huevos de generación y objetos de creativo.`);
  L.push('- **Recetas:** todas, de cualquier nivel. Cada máquina del registro corre las recetas de hasta el voltaje de su nivel; los multibloques, sin tope; la energía, las piezas de los multibloques, la sala limpia y las demás condiciones se dan por conseguibles, salvo la dimensión.');
  L.push('- **Grupos:** cada objeto va al material más largo cuyo nombre lleva (polvo, lingote, placa... de un mismo material juntos); lo que no es de ningún material va solo. «Formas sueltas» = el material se consigue, pero esas formas no. Los bloques de mena (piedra + material) no se listan: son bloques del mundo.');
  L.push(`- **B automática:** el grupo se consigue al sumar las fuentes de una era posterior (${res.later.map((st) => `${st.label}: ${st.era}`).join('; ')}).`);
  L.push('');
  return L.join('\n');
}
