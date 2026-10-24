// Construye el grafo de reglas a partir del volcado y de la configuración del tier.
import { Graph } from './engine.mjs';
import { fluidKey, normalizeRecipe } from './normalize.mjs';
import { abilityMaxCount, structureSelectors } from './structure.mjs';
import { asArray, makeGlobMatcher } from './util.mjs';

export function prepareConfig(raw) {
  const cfg = { ...raw };
  cfg.unconditionalTypes = new Set(raw.unconditionalTypes || []);
  cfg.typeAliases = raw.typeAliases || {};
  cfg.ignoreMatch = makeGlobMatcher(raw.ignoreTypes || []);
  cfg.toolTagSet = new Set(raw.toolTags || []);
  cfg.fluidContainers = raw.fluidContainers || ['minecraft:bucket'];
  cfg.conditions = raw.conditions || {};
  cfg.world = raw.world || [];
  cfg.machines = raw.machines || [];
  cfg.machinesFromRegistry = raw.machinesFromRegistry || [];
  cfg.partAbilities = raw.partAbilities || {};
  cfg.targetsFromVeins = raw.targetsFromVeins || [];
  cfg.autoTargetsFromVeins = raw.autoTargetsFromVeins || [];
  cfg.synthetic = raw.synthetic || [];
  // Dimensión en la que se hace la fábrica en este análisis: filtra las recetas con condición de dimensión y los yacimientos
  // de fluidos. Por defecto el Overworld; la CLI la sustituye (--dimension) y `contexts` lista las que hay que comprobar.
  cfg.contextDimension = raw.dimension || 'minecraft:overworld';
  // Un objetivo "fluid" se trata como un objeto cuya clave lleva el prefijo fluid:.
  const fixTarget = (t) => (t.fluid !== undefined
    ? { ...t, item: asArray(t.fluid).map((f) => (String(f).startsWith('fluid:') ? f : 'fluid:' + f)) }
    : t);
  cfg.targets = (raw.targets || []).map(fixTarget);
  cfg.autoTargets = (raw.autoTargets || []).map(fixTarget);
  // Regla de eras (lib/eras.mjs): orden de las eras, recursos que trae cada una y objetos que le pertenecen.
  cfg.era = raw.era || raw.tier;
  cfg.eraOrder = raw.eraOrder || [];
  cfg.eraResources = raw.eraResources || [];
  cfg.eraItems = raw.eraItems || [];
  // Auditoría de obtención (lib/obtain.mjs): objetos con NBT por tipo, recetas de abejas como reglas y claves/hechos sin objeto
  // en el registro (dim:<id> de las dimensiones, bee:<id> de las abejas).
  cfg.nbtTyped = raw.nbtTyped ? new Set(raw.nbtTyped) : null;
  cfg.bees = !!raw.bees;
  cfg.extraFacts = raw.extraFacts || [];
  cfg.extraKeys = raw.extraKeys || [];
  return cfg;
}

/** Claves (objetos o fluidos) que nombra un selector de la configuración. */
function makeResolver(dump, normList, warnings) {
  const fuelCache = new Map();
  const fuelOf = (type, kind) => {
    const ck = type + '|' + kind;
    if (fuelCache.has(ck)) return fuelCache.get(ck);
    const set = new Set();
    for (const n of normList) {
      if (n.type !== type) continue;
      for (const i of n.inputs) if (i.kind === kind) i.alts.forEach((a) => set.add(a));
    }
    const arr = [...set];
    fuelCache.set(ck, arr);
    return arr;
  };
  const resolve = (sel, ctx = '') => {
    if (sel === null || sel === undefined) return [];
    if (Array.isArray(sel)) return sel.flatMap((s) => resolve(s, ctx));
    if (typeof sel === 'string') {
      if (sel.startsWith('fluid:#')) return dump.tags.fluids(sel.slice(7)).map(fluidKey);
      if (sel.startsWith('#')) return dump.tags.items(sel.slice(1));
      return [sel];
    }
    if (sel.anyOf) return resolve(sel.anyOf, ctx);
    if (sel.fuelOf) return fuelOf(sel.fuelOf, sel.kind || 'item');
    warnings.push(`selector no válido en ${ctx}: ${JSON.stringify(sel)}`);
    return [];
  };
  const label = (sel) => {
    if (typeof sel === 'string') return sel;
    if (Array.isArray(sel)) return sel.length === 1 ? label(sel[0]) : `(${sel.map(label).join(' | ')})`;
    if (sel && sel.label) return sel.label;
    if (sel && sel.fuelOf) return `combustible de ${sel.fuelOf}`;
    if (sel && sel.anyOf) return label(sel.anyOf);
    return JSON.stringify(sel);
  };
  return { resolve, label };
}

/** Voltaje de cada nivel de GT (V[0] = ULV ... V[14] = MAX). */
const V = [8, 32, 128, 512, 2048, 8192, 32768, 131072, 524288, 2097152, 8388608, 33554432, 134217728, 536870912, 2147483647];

/** Material de una veta sin espacio de nombres si es de GT ("gtceu:iron" -> "iron"); el de un addon lo conserva ("gtca:red_zircon"). */
const veinMaterialName = (m) => (m.startsWith('gtceu:') ? m.slice(6) : m);
/** Id de una veta sin espacio de nombres ni el trozo "_vein" (también en medio): redstone_vein_ow -> redstone_ow. */
const bareVeinId = (short) => short.replace(/_vein(?=_|$)/, '');

/**
 * Materiales de las vetas que cumplen el filtro; sin veins.json se usa la lista de reserva.
 * `offered(veta, from)` aplica `requireItem`/`requireRecipe` (las vetas que la tabla de la perforadora ofrece), p. ej. las
 * vetas del End que el pack ofrece y no las que registra GTM o un addon, ni las que el pack aparta.
 */
function veinMaterials(dump, from, fallback, offered) {
  if (!dump.veins) return { mats: fallback || [], source: 'config' };
  const dims = new Set(from.dimensions || ['minecraft:overworld']);
  const layers = from.layers ? new Set(from.layers) : null;
  const mats = new Set();
  for (const v of dump.veins) {
    if (!v.dims.some((d) => dims.has(d))) continue;
    if (layers && !layers.has(v.layer)) continue;
    if (!offered(v, from)) continue;
    for (const m of v.mats) mats.add(veinMaterialName(m));
  }
  return { mats: [...mats].sort(), source: 'veins.json' };
}

/** Tipos de receta que admite una máquina registrada: los suyos más los vanilla que GT clona (proxies). */
function typesOfRegistered(dump, reg) {
  const set = new Set(reg.types);
  for (const t of reg.types) {
    const rt = dump.recipeTypes.get(t);
    if (rt) for (const p of rt.proxies || []) set.add(p);
  }
  return set;
}

export function buildModel(dump, rawCfg) {
  const cfg = prepareConfig(rawCfg);
  const g = new Graph();
  const warnings = [];
  const st = { unresolved: new Set() };
  const stats = {
    recipes: dump.recipes.size, ignoredByType: {}, deadByType: {}, emptyIngredient: 0, badIngredient: 0,
    templateMissing: 0, rules: 0, structureMachines: 0, structureMachineIds: [], rolledMachines: [], veinTargets: 0, veinsWithoutItem: [],
    partsNotRequired: [],
  };

  // 1) Recetas normalizadas
  const gtTypes = new Set(dump.recipeTypes.keys());
  const nctx = { tags: dump.tags, st, cfg, gtTypes };
  const norm = [];
  for (const rec of dump.recipes.values()) {
    const aliased = cfg.typeAliases[rec.type] || rec.type;
    if (cfg.ignoreMatch(rec.type) || cfg.ignoreMatch(aliased)) {
      stats.ignoredByType[rec.type] = (stats.ignoredByType[rec.type] || 0) + 1;
      continue;
    }
    norm.push(normalizeRecipe(rec, nctx));
  }
  const { resolve, label: selLabel } = makeResolver(dump, norm, warnings);

  // ¿La tabla de la perforadora ofrece la veta? `requireItem`: existe su objeto (la muestra). `requireRecipe: {type, input}`:
  // alguna receta de ese tipo toma ese objeto como entrada; es lo que vale cuando el pack aparta una veta y deja su muestra
  // registrada (oculta, se convierte en una sonda vacía) pero sin recetas de perforación. {id}/{short} como en los objetivos.
  const recipeInputs = new Map();
  const inputsOfType = (type) => {
    if (!recipeInputs.has(type)) {
      const set = new Set();
      for (const n of norm) if (n.type === type) for (const i of n.inputs) for (const a of i.alts) set.add(a);
      recipeInputs.set(type, set);
    }
    return recipeInputs.get(type);
  };
  const veinOffered = (v, spec) => {
    const short = v.id.includes(':') ? v.id.split(':')[1] : v.id;
    const fill = (s) => s.split('{id}').join(bareVeinId(short)).split('{short}').join(short);
    if (spec.requireItem && !dump.items.has(fill(spec.requireItem))) return false;
    if (spec.requireRecipe && !inputsOfType(spec.requireRecipe.type).has(fill(spec.requireRecipe.input))) return false;
    return true;
  };

  // Una ranura sin ninguna alternativa (etiqueta vacía, ninguna máquina del tier) se apoya en una clave "dead:" sin
  // productores: nunca se alcanza, pero en el análisis de bloqueo actúa como una raíz que se puede nombrar.
  // tol = ranura tolerante en la sostenibilidad: combustible de una máquina o catalizador que solo se gasta a veces.
  const slotOf = (keys, cap, label, role, tol = false) => ({
    alts: (keys.length > 0 ? keys : [`dead:${label}`]).map((k) => g.key(k)), cap, label, role, tol, dead: keys.length === 0,
  });
  const addRule = (name, kind, type, slots, outs, meta = {}) =>
    g.addRule({ name, kind, type, slots, outs: outs.map((k) => g.key(k)), meta });

  // 2) Mundo
  const facts = { manual: [], auto: [], bootstrap: [] };
  // fuentes del mundo que aportan algo en este análisis, con su origen (regla de eras): {id, origin, keys, kind, rule?}
  const worldSources = [];
  const manualRuleKeys = [];
  const worldInfo = [];
  const disabledWorld = new Map();
  const ctxDim = cfg.contextDimension;
  // Interruptores de la config de GTM que lee el análisis (se vuelcan en config.json): clave -> valor (true/false/null).
  const usedConfig = new Map();
  const configWarned = new Set();
  // `known` distingue "la config vale otra cosa" de "no se pudo leer": quien pide una pieza condicionada a la config la sigue exigiendo
  // si no se puede leer (lo prudente), y quien pide un requisito lo da por no cumplido.
  const configState = (spec, wid, whenUnknown = 'se trata como no cumplida') => {
    const key = spec.config;
    const want = spec.equals === undefined ? true : spec.equals;
    const have = dump.config ? dump.config[key] : undefined;
    usedConfig.set(key, have === undefined ? null : have);
    if (have === undefined || have === null) {
      const why = dump.config ? 'no se pudo leer en el volcado' : 'el volcado no trae config.json';
      if (!configWarned.has(key)) {
        configWarned.add(key);
        warnings.push(`${wid}: no se puede comprobar la config ${key} (${why}); ${whenUnknown}`);
      }
      return { ok: false, known: false, text: `config ${key} desconocida (${why})` };
    }
    return { ok: have === want, known: true, have, text: `config ${key} = ${have}, se pide ${want}` };
  };
  // Yacimientos de fluidos (perforadora de fluidos de GTM): admite la dimensión si su filtro es null o la incluye.
  const fluidVeinInfo = new Map();
  // Objeto de la mena cruda de un material de una veta, resuelto con el registro del volcado: el del espacio de nombres del propio
  // material si lo trae (gtca:red_zircon -> gtca:raw_red_zircon), si no el de la plantilla (gtceu:raw_{m}), el vanilla
  // (minecraft:raw_iron) o el de cualquier otro mod que lo registre (gtca:raw_germanite). `overrides` queda de reserva: solo
  // vale si el volcado no tiene ningún objeto con ese nombre. Devuelve los ids que existen (ninguno = "sin objeto").
  let pathIndex = null;
  const namespacesWithPath = (path) => {
    if (!pathIndex) {
      pathIndex = new Map();
      for (const id of dump.items) {
        const colon = id.indexOf(':');
        if (colon < 0) continue;
        const p = id.slice(colon + 1);
        if (!pathIndex.has(p)) pathIndex.set(p, []);
        pathIndex.get(p).push(id.slice(0, colon));
      }
    }
    return pathIndex.get(path) || [];
  };
  const rawIdsOf = (spec, m) => {
    const sep = m.indexOf(':');
    const ownNs = sep >= 0 ? m.slice(0, sep) : null;
    const name = sep >= 0 ? m.slice(sep + 1) : m;
    const colon = spec.template.indexOf(':');
    const tplNs = colon >= 0 ? spec.template.slice(0, colon) : 'minecraft';
    const path = (colon >= 0 ? spec.template.slice(colon + 1) : spec.template).replace('{m}', name);
    const have = namespacesWithPath(path);
    for (const ns of [ownNs, tplNs, 'minecraft']) if (ns && have.includes(ns)) return [`${ns}:${path}`];
    if (have.length > 0) return [...have].sort().map((ns) => `${ns}:${path}`);
    return spec.overrides && spec.overrides[m] && dump.items.has(spec.overrides[m]) ? [spec.overrides[m]] : [];
  };
  cfg.world.forEach((entry, idx) => {
    const wid = entry.id || `world[${idx}]`;
    let keys = [];
    let tplInfo = '';
    if (entry.template) {
      const from = entry.fromVeins
        ? veinMaterials(dump, entry.fromVeins, entry.materials, veinOffered)
        : { mats: entry.materials || [], source: 'config' };
      const mats = [...new Set([...from.mats, ...(entry.extraMaterials || [])])];
      let missing = 0;
      for (const m of mats) {
        const ids = rawIdsOf(entry, m);
        if (ids.length > 0) keys.push(...ids);
        else missing++;
      }
      stats.templateMissing += missing;
      tplInfo = `${mats.length} materiales (${from.source}), ${missing} sin objeto`;
    }
    for (const it of asArray(entry.items)) {
      const ks = resolve(it, wid);
      if (ks.length === 0) warnings.push(`${wid}: "${it}" no tiene miembros en este pack`);
      for (const k of ks) {
        if (!k.startsWith('fluid:') && !dump.items.has(k)) warnings.push(`${wid}: el objeto ${k} no existe en el registro`);
        else if (k.startsWith('fluid:') && !dump.fluids.has(k.slice(6))) warnings.push(`${wid}: el fluido ${k.slice(6)} no existe en el registro`);
        else keys.push(k);
      }
    }
    if (entry.fromFluidVeins) {
      const spec = entry.fromFluidVeins === true ? {} : entry.fromFluidVeins;
      const only = spec.fluids ? new Set(asArray(spec.fluids)) : null;
      if (!dump.fluidVeins) warnings.push(`${wid}: el volcado no trae fluid_veins.json`);
      else {
        const ineligible = new Map();
        for (const v of dump.fluidVeins) {
          if (!v.fluid || (only && !only.has(v.fluid))) continue;
          if (!dump.fluids.has(v.fluid)) {
            warnings.push(`${wid}: el yacimiento ${v.id} da ${v.fluid}, que no existe en el registro`);
            continue;
          }
          const k = 'fluid:' + v.fluid;
          if (v.dims === null || v.dims.includes(ctxDim)) {
            keys.push(k);
            if (!fluidVeinInfo.has(v.fluid)) fluidVeinInfo.set(v.fluid, []);
            fluidVeinInfo.get(v.fluid).push(v.id);
          } else {
            ineligible.set(k, `el yacimiento ${v.id} solo admite ${v.dims.length > 0 ? v.dims.join(', ') : 'ninguna dimensión'}; este análisis es en ${ctxDim}`);
          }
        }
        for (const [k, why] of ineligible) if (!keys.includes(k) && !disabledWorld.has(k)) disabledWorld.set(k, why);
      }
    }
    keys = [...new Set(keys)];
    // ¿el mundo da esto en este análisis? (enabled, dimensión, requisitos de la config de GTM)
    let off = entry.enabled === false ? wid : null;
    if (off === null && entry.dimensions && !entry.dimensions.includes(ctxDim)) off = `${wid} (solo en ${entry.dimensions.join(', ')})`;
    if (off === null) {
      for (const spec of asArray(entry.requires)) {
        const r = configState(spec, wid);
        if (!r.ok) {
          off = `${wid} (${r.text})`;
          break;
        }
      }
    }
    worldInfo.push({ id: wid, mode: entry.mode, count: keys.length, enabled: off === null, note: entry.note || '', tplInfo, via: entry.via });
    if (off !== null) {
      for (const k of keys) if (!disabledWorld.has(k)) disabledWorld.set(k, off);
      return;
    }
    // sustainedIf: con la config cumplida la fuente no se agota; si no, solo da una cantidad finita (WARN)
    const sustained = entry.sustainedIf ? configState(entry.sustainedIf, wid).ok : true;
    // origen de la fuente (dónde se recoge): `origin` o las dimensiones de sus vetas. La regla de eras quita las fuentes
    // de una dimensión que es recurso de una era posterior (el viaje al End, a la Luna...).
    const origin = entry.origin ? asArray(entry.origin) : entry.fromVeins ? asArray(entry.fromVeins.dimensions || ['minecraft:overworld']) : [];
    const source = { id: wid, origin, keys };
    if (entry.mode === 'manual') {
      if (entry.needs && keys.length > 0) {
        // recolección a mano que exige antes un objeto que se fabrica (la llave del End): es una regla, no un hecho del mundo
        const slots = asArray(entry.needs).map((n) => slotOf(resolve(n, wid), true, selLabel(n), 'capital'));
        source.rule = addRule(`mundo:${wid}`, 'world-manual', 'world', slots, keys, { bootstrap: !!entry.bootstrap, note: entry.note || '' });
        source.kind = 'rule';
        manualRuleKeys.push(...keys);
      } else {
        source.kind = 'manual';
        facts.manual.push(...keys);
        if (entry.bootstrap) facts.bootstrap.push(...keys);
      }
    } else if (entry.via && entry.via.length > 0) {
      const slots = [slotOf(entry.via.map((v) => 'run:' + v), false, `máquina ${entry.via.join(' | ')}`, 'machine')];
      source.rule = addRule(`mundo:${wid}`, 'world-auto', 'world', slots, keys, { finite: !!entry.finite || !sustained, note: entry.note || '' });
      source.kind = 'rule';
    } else {
      source.kind = 'auto';
      facts.auto.push(...keys);
    }
    worldSources.push(source);
  });
  stats.fluidVeins = [...fluidVeinInfo.entries()].map(([fluid, ids]) => ({ fluid, deposits: ids }));
  stats.configRead = [...usedConfig.entries()].map(([key, value]) => ({ key, value }));

  // 3) Máquinas: m:<id> (se puede construir) y run:<id> (funciona: construida + lo que consume al operar)
  // machinesFromRegistry: añade en bloque las máquinas registradas con un prefijo (p. ej. todas las gtceu:lv_*) con sus
  // tipos de receta reales; una entrada explícita de `machines` con el mismo id tiene prioridad. `maxEUtByTier`: el tope de
  // EU/t de cada máquina de un bloque es el voltaje de su propio nivel (V[tier] del registro; los multibloques, sin tope);
  // `includeTypeless`: también las que no tienen tipo de receta (la perforadora de fluidos), para usarlas en `via`.
  const explicitIds = new Set(cfg.machines.map((e) => e.id || e.machine));
  const fromRegistry = [];
  for (const spec of cfg.machinesFromRegistry) {
    const excluded = makeGlobMatcher(spec.exclude || []);
    const skipTypes = new Set(spec.excludeTypes || ['gtceu:dummy']);
    for (const [mid, reg] of dump.machines) {
      if (!mid.startsWith(spec.prefix) || excluded(mid) || explicitIds.has(mid)) continue;
      if (reg.mb && !spec.multiblocks) continue;
      const types = reg.types.filter((t) => !skipTypes.has(t));
      if (types.length === 0 && !spec.includeTypeless) continue;
      explicitIds.add(mid);
      const maxEUt = spec.maxEUtByTier ? (reg.mb ? undefined : V[Math.max(0, Math.min(V.length - 1, Number(reg.tier) || 0))]) : spec.maxEUt;
      fromRegistry.push({ machine: mid, types, maxEUt, needs: spec.needs, parts: spec.parts, note: `del registro (${spec.prefix}*)` });
    }
  }
  stats.machinesFromRegistry = fromRegistry.length;
  const entriesById = new Map();
  const typeIndex = new Map();
  for (const e0 of [...cfg.machines, ...fromRegistry]) {
    const id = e0.id || e0.machine;
    // energy: tensión máxima de un multibloque eléctrico según GTM 7.5.3 (WorkableElectricMultiblockMachine.getMaxVoltage): con
    // 2 o más escotillas de energía del nivel más alto cuenta como un escalón más (V[nivel + 1] = 4 x la tensión de la
    // escotilla). Cuenta escotillas, no amperios: dos escotillas LV (2 A cada una) o dos de 1 A dan igual, 128 V (MV).
    // `hatches` = cuántas admite el patrón (si falta y hay estructura del pack, sale de ella).
    let e = e0;
    if (e0.energy) {
      const ability = e0.energy.ability || 'energy_input';
      const desc = e0.partsFromStructure ? dump.structures.get(e0.machine) : null;
      let hatches = e0.energy.hatches;
      if (hatches === undefined && desc) hatches = abilityMaxCount(desc, ability);
      if (hatches === undefined) {
        warnings.push(`${id}: energy sin «hatches» y sin estructura de la que leer las escotillas «${ability}»; se cuenta 1`);
        hatches = 1;
      }
      if (typeof e0.energy.voltage !== 'number') warnings.push(`${id}: energy.voltage debe ser un número (la tensión de la escotilla)`);
      const maxEUt = hatches >= 2 ? e0.energy.voltage * 4 : e0.energy.voltage;
      e = { ...e0, maxEUt };
      stats.rolledMachines.push({ machine: id, hatches, voltage: e0.energy.voltage, maxEUt });
    }
    // coilTemp: temperatura de las bobinas de un EBF. GTM suma 100 K por cada escalón de tensión por encima de MV
    // (GTRecipeModifiers.ebfOverclock) y rechaza las recetas cuyo ebf_temp es mayor.
    if (e0.coilTemp !== undefined) {
      const volt = e.maxEUt;
      const tier = typeof volt === 'number' && volt > 0 ? Math.round(Math.log(volt / 8) / Math.log(4)) : 2;
      e = { ...e, maxTemp: e0.coilTemp + 100 * Math.max(0, tier - 2) };
    }
    if (entriesById.has(id)) warnings.push(`máquina duplicada en la configuración: ${id}`);
    entriesById.set(id, e);
    const reg = dump.machines.get(e.machine);
    if (dump.machines.size > 0 && e.machine.startsWith('gtceu:') && !reg && !e.optional) {
      warnings.push(`la máquina ${e.machine} no está registrada en este pack`);
    }
    if (reg && e.types && e.types.length > 0) {
      const allowed = typesOfRegistered(dump, reg);
      const bad = e.types.filter((t) => !allowed.has(t));
      if (bad.length > 0) {
        warnings.push(`${e.machine}: la configuración dice que procesa ${bad.join(', ')} pero el registro dice ${reg.types.join(', ') || '(nada)'}`);
      }
    }
    const types = new Set(e.types || (reg ? reg.types : []));
    for (const t of [...types]) {
      const rt = dump.recipeTypes.get(t);
      if (rt) for (const p of rt.proxies || []) types.add(p);
    }
    for (const t of types) {
      if (!typeIndex.has(t)) typeIndex.set(t, []);
      typeIndex.get(t).push(e);
    }
    const buildSlots = [slotOf([e.machine], true, e.machine, 'machine-item')];
    const checkIds = (keys, what) => {
      for (const k of keys) {
        if (k.startsWith('fluid:') ? dump.fluids.size > 0 && !dump.fluids.has(k.slice(6)) : dump.items.size > 0 && !dump.items.has(k)) {
          warnings.push(`${id}: ${what} ${k} no existe en el registro (¿id mal escrito o aún sin implementar?)`);
        }
      }
    };
    if (!e.machine.startsWith('gtceu:')) checkIds([e.machine], 'la máquina');
    // partsFromStructure: las piezas salen de la descripción del patrón que vuelca el pack (structures.json); si el
    // volcado no la trae se usan las `parts` de la configuración.
    let partSels = asArray(e.parts);
    let partsFrom = 'config';
    if (e.partsFromStructure) {
      const desc = dump.structures.get(e.machine);
      if (desc) {
        // `partAbilities` de la máquina (p. ej. exigir la escotilla MV) tapa clave a clave los del tier
        const abilityItems = e.partAbilities ? { ...cfg.partAbilities, ...e.partAbilities } : cfg.partAbilities;
        const sd = structureSelectors(desc, abilityItems, (i) => dump.items.size === 0 || dump.items.has(i));
        for (const p of sd.problems) warnings.push(`${id}: ${p}`);
        partSels = sd.selectors;
        partsFrom = 'estructura';
        stats.structureMachines++;
        stats.structureMachineIds.push(e.machine);
      } else {
        warnings.push(`${id}: el volcado no trae la estructura de ${e.machine}${partSels.length > 0 ? '; se usan las partes de la configuración' : ' ni hay partes en la configuración'}`);
      }
    }
    for (const p of partSels) {
      // {anyOf, onlyIf:{config,equals}}: pieza que GTM solo exige con ese valor de la config (p. ej. la escotilla de mantenimiento
      // con machines.enableMaintenance); si la config no se puede leer se sigue exigiendo
      if (p && typeof p === 'object' && !Array.isArray(p) && p.onlyIf) {
        const r = configState(p.onlyIf, `parts de ${id}`, 'la pieza se sigue exigiendo');
        if (r.known && !r.ok) {
          stats.partsNotRequired.push({ machine: id, part: selLabel(p), why: `config ${p.onlyIf.config} = ${r.have}; solo se exige con ${p.onlyIf.equals === undefined ? true : p.onlyIf.equals}` });
          continue;
        }
      }
      const keys = resolve(p, `parts de ${id}`);
      checkIds(keys.filter((k) => !k.startsWith('fluid:')), 'la parte');
      buildSlots.push(slotOf(keys, true, selLabel(p), 'part'));
    }
    addRule(`construir:${id}`, 'machine-build', 'machine', buildSlots, ['m:' + id], { assumed: !!e.assumed, partsFrom });
    const runSlots = [slotOf(['m:' + id], true, `${id} construida`, 'machine-built')];
    for (const n of asArray(e.needs)) {
      const keys = resolve(n, `needs de ${id}`);
      checkIds(keys.filter((k) => k.startsWith('fluid:')), 'el fluido');
      runSlots.push(slotOf(keys, false, selLabel(n), 'need', true));
    }
    addRule(`operar:${id}`, 'machine-run', 'machine', runSlots, ['run:' + id], { maxEUt: e.maxEUt });
  }

  // 4) Reglas sintéticas (producción que no es una receta: calderas, bomba primitiva...)
  for (const s of cfg.synthetic) {
    const slots = [];
    const machineIds = asArray(s.machines);
    for (const m of machineIds) if (!entriesById.has(m)) warnings.push(`sintética ${s.id}: la máquina ${m} no está en machines`);
    if (machineIds.length > 0) slots.push(slotOf(machineIds.map((m) => 'run:' + m), false, `máquina ${machineIds.join(' | ')}`, 'machine'));
    for (const c of asArray(s.consumes)) slots.push(slotOf(resolve(c, s.id), false, selLabel(c), 'input'));
    for (const c of asArray(s.capital)) slots.push(slotOf(resolve(c, s.id), true, selLabel(c), 'capital'));
    const outs = asArray(s.produces).flatMap((p) => resolve(p, s.id));
    addRule(`sintética:${s.id}`, 'synthetic', 'synthetic', slots, outs, { note: s.note || '' });
  }

  // 5) Recetas
  const ruleOfRecipe = new Map();
  for (const n of norm) {
    const slots = [];
    if (!cfg.unconditionalTypes.has(n.type)) {
      const all = typeIndex.get(n.type) || [];
      const euOk = (e) => (e.maxEUt === undefined ? Infinity : e.maxEUt) >= n.eut;
      const tempOk = (e) => e.maxTemp === undefined || n.temp === undefined || e.maxTemp >= n.temp;
      const cands = all.filter((e) => euOk(e) && tempOk(e));
      let lbl = `máquina de ${n.type}`;
      if (cands.length === 0) {
        if (all.length === 0) lbl = `no hay máquina para ${n.type} en este tier`;
        else if (all.some(euOk)) lbl = `ninguna máquina de ${n.type} llega a ${n.temp} K (bobinas del tier)`;
        else lbl = `ninguna máquina de ${n.type} admite ${n.eut} EU/t`;
      }
      slots.push(slotOf(cands.map((e) => 'run:' + (e.id || e.machine)), false, lbl, 'machine'));
      if (cands.length === 0) stats.deadByType[n.type] = (stats.deadByType[n.type] || 0) + 1;
    }
    for (const i of n.inputs) {
      if (i.alts.length === 0) {
        stats.emptyIngredient++;
        if (i.bad) stats.badIngredient++;
      }
      slots.push(slotOf(i.alts, !!i.cap, i.label, i.kind, !!i.cat));
    }
    for (const c of n.conditions) {
      if (c.type === 'dimension' && typeof c.dimension === 'string' && cfg.conditions.dimension && cfg.conditions.dimension.asKeys) {
        // auditoría de obtención: la receta pide la clave dim:<id>, un hecho para cada dimensión a la que se llega (y otra pasada
        // añade las de las eras posteriores). La condición inversa ("fuera de X") se cumple en cualquier otra dimensión.
        if (c.reverse !== true) slots.push(slotOf(['dim:' + c.dimension], true, `en ${c.dimension}`, 'cond'));
        continue;
      }
      if (c.type === 'dimension' && typeof c.dimension === 'string' && !(cfg.conditions.dimension && cfg.conditions.dimension.ignore)) {
        // la fábrica está en una dimensión concreta (cfg.contextDimension): la receta solo vale donde dice su condición
        const here = c.dimension === ctxDim;
        if (c.reverse === true ? here : !here) {
          slots.push(slotOf([], false, `solo vale ${c.reverse === true ? 'fuera de' : 'en'} ${c.dimension}; la fábrica está en ${ctxDim}`, 'cond'));
        }
        continue;
      }
      const rule = cfg.conditions[c.type] || cfg.conditions['*'];
      if (!rule || rule.ignore || c.reverse === true) continue;
      if (rule.unsupported) slots.push(slotOf(['cond:' + c.type], true, `condición ${c.type}`, 'cond'));
      else if (rule.needs || rule.needsByField) {
        // la condición se cumple con una máquina o un objeto construido (la sala limpia): una ranura de capital. `needsByField`
        // elige según un campo de la condición (cleanroom: "cleanroom" o "sterile_cleanroom"); sin entrada, no se puede cumplir.
        let sel = rule.needs;
        let what = c.type;
        if (rule.needsByField) {
          const variant = String(c[rule.needsByField.field]);
          sel = rule.needsByField.map[variant] !== undefined ? rule.needsByField.map[variant] : rule.needsByField.default;
          what = `${c.type} «${variant}»`;
        }
        if (sel === undefined || sel === null) slots.push(slotOf(['cond:' + c.type], true, `condición ${what}`, 'cond'));
        else slots.push(slotOf(resolve(sel, `condición ${c.type}`), true, `${what}: ${selLabel(sel)}`, 'cond'));
      } else if (rule.field && rule.max !== undefined) {
        // condición numérica con tope en este tier (p. ej. la temperatura de bobinas del EBF): por encima, la receta no vale
        const value = Number(c[rule.field]);
        if (value > rule.max) slots.push(slotOf([], false, `${c.type} ${value} (este tier llega a ${rule.max})`, 'cond'));
      } else if (rule.fluidsFrom) {
        for (const f of asArray(c[rule.fluidsFrom])) {
          slots.push(slotOf(resolve('fluid:' + f, `condición ${c.type}`), true, `junto a ${f}`, 'cond'));
        }
      }
    }
    const dimConds = n.conditions.filter((c) => c.type === 'dimension' && typeof c.dimension === 'string');
    const rid = addRule(n.id, 'recipe', n.type, slots, n.outputs.map((o) => o.key), {
      eut: n.eut, added: n.added, rawType: n.rawType, warn: n.warn, category: n.category,
      dims: dimConds.filter((c) => c.reverse !== true).map((c) => c.dimension),
      notDims: dimConds.filter((c) => c.reverse === true).map((c) => c.dimension),
    });
    ruleOfRecipe.set(n.id, rid);
  }
  stats.rules = g.rules.length;

  // Objetivos generados a partir de las vetas del registro: uno por veta ("alguna mena de cada veta del Nether").
  //   {idPrefix, labelPrefix, dimensions, layers?, exclusiveFrom?, requireItem?, requireRecipe?, without?, allowFinite?, optional?}
  //   más una de estas formas:
  //   - mena:  {template, mode: 'anyOf'|'allOf'} -> objetivo sobre las menas crudas de la veta (si hay `exclusiveFrom`, solo las
  //            menas que no salen en las vetas de esas dimensiones; sin ninguna se salta la veta). El objeto de cada mena se
  //            resuelve con el registro del volcado (espacio de nombres del material, plantilla, vanilla u otro mod); `overrides`
  //            solo queda de reserva.
  //   - receta: {target: {...}} -> el objeto se copia con {id} (id de la veta sin el trozo "_vein": redstone_vein_ow -> redstone_ow)
  //            y {short} (id sin espacio de nombres) sustituidos en sus textos; p. ej.
  //            {kind:'recipe', type:'gtceu:vein_drilling', input:'grindless:vein_sample_{id}'}
  //   `requireRecipe` ({type, input} con {id}/{short}): solo las vetas que la tabla de la perforadora ofrece, es decir, las que
  //   tienen una receta de ese tipo que toma su muestra; `requireItem` (más flojo): las que tienen el objeto. Las demás no tienen
  //   objetivo (vetas de otros mods, apartadas en veins_excluded.json o que esperan a su era) y se listan en las notas.
  const veinMats = (v) => v.mats.map(veinMaterialName);
  const materialsIn = (dims) => {
    const set = new Set();
    const ds = new Set(dims);
    for (const v of dump.veins || []) if (v.dims.some((d) => ds.has(d))) for (const m of veinMats(v)) set.add(m);
    return set;
  };
  const veinTargets = (specs, which) => {
    const out = [];
    for (const spec of specs) {
      if (!dump.veins) {
        warnings.push(`${which}: el volcado no trae veins.json`);
        continue;
      }
      const dims = new Set(spec.dimensions || ['minecraft:overworld']);
      const layers = spec.layers ? new Set(spec.layers) : null;
      const exclusive = spec.exclusiveFrom ? materialsIn(spec.exclusiveFrom) : null;
      const extras = {
        ...(spec.without ? { without: spec.without } : {}),
        ...(spec.allowFinite ? { allowFinite: true } : {}),
        ...(spec.optional ? { optional: true } : {}),
      };
      let n = 0;
      for (const v of dump.veins) {
        if (!v.dims.some((d) => dims.has(d))) continue;
        if (layers && !layers.has(v.layer)) continue;
        const short = v.id.includes(':') ? v.id.split(':')[1] : v.id;
        if (!veinOffered(v, spec)) {
          if (!stats.veinsWithoutItem.includes(v.id)) stats.veinsWithoutItem.push(v.id);
          continue;
        }
        const base = { id: `${spec.idPrefix || 'veta-'}${short}`, label: `${spec.labelPrefix || 'Veta'} ${short}`, ...extras };
        if (spec.target) {
          const fill = (x) => (typeof x === 'string'
            ? x.split('{id}').join(bareVeinId(short)).split('{short}').join(short)
            : Array.isArray(x) ? x.map(fill) : x);
          const t = {};
          for (const [k, val] of Object.entries(spec.target)) t[k] = fill(val);
          out.push({ ...base, ...t });
          n++;
          continue;
        }
        const mats = veinMats(v).filter((m) => !exclusive || !exclusive.has(m));
        const items = [...new Set(mats.flatMap((m) => rawIdsOf(spec, m)))];
        if (items.length === 0) {
          if (!exclusive) warnings.push(`${which}: la veta ${short} no tiene ninguna mena con objeto (${spec.template})`);
          continue;
        }
        out.push({ ...base, [spec.mode === 'all' ? 'allOf' : 'anyOf']: items });
        n++;
      }
      if (n === 0) warnings.push(`${which}: ninguna veta cumple ${JSON.stringify(spec.dimensions || ['minecraft:overworld'])}`);
      stats.veinTargets += n;
    }
    return out;
  };
  cfg.targets.push(...veinTargets(cfg.targetsFromVeins, 'targetsFromVeins'));
  cfg.autoTargets.push(...veinTargets(cfg.autoTargetsFromVeins, 'autoTargetsFromVeins'));
  // `expect` es una comprobación de fuga y cada paso admite una: sin este aviso un `expect` en la lista equivocada se ignoraría.
  for (const t of cfg.targets) {
    if (t.expect && t.expect !== 'unreachable') warnings.push(`objetivo ${t.id}: expect «${t.expect}» no vale en targets (la puerta solo admite «unreachable»)`);
  }
  for (const t of cfg.autoTargets) {
    if (t.expect && t.expect !== 'not-automatic') warnings.push(`objetivo ${t.id}: expect «${t.expect}» no vale en autoTargets (solo admite «not-automatic»)`);
  }

  // Máquinas registradas (no solo las de la configuración) que ejecutan un tipo de receta; las comprobaciones `machineless` de
  // fuga distinguen así la receta huérfana (ninguna máquina la corre) de la que alguien podría correr.
  const runnerCache = new Map();
  const runnersOf = (type) => {
    if (!runnerCache.has(type)) {
      const ids = [];
      for (const [mid, reg] of dump.machines) if (typesOfRegistered(dump, reg).has(type)) ids.push(mid);
      runnerCache.set(type, ids);
    }
    return runnerCache.get(type);
  };
  for (const t of [...cfg.targets, ...cfg.autoTargets]) {
    if (t.machineless && !(t.kind === 'recipe' || t.type || t.recipe)) warnings.push(`objetivo ${t.id}: machineless solo vale en objetivos de tipo receta`);
    if (t.maxEUt !== undefined && !t.machineless) warnings.push(`objetivo ${t.id}: maxEUt solo se usa junto a machineless`);
  }

  // Las claves de objetivos y hechos se crean antes de cerrar el grafo para poder consultarlas aunque nadie las produzca.
  const targetKeys = (t) => [...asArray(t.item), ...asArray(t.fluid), ...asArray(t.anyOf), ...asArray(t.allOf), ...asArray(t.input), ...asArray(t.output)];
  for (const t of [...cfg.targets, ...cfg.autoTargets]) {
    for (const k of targetKeys(t)) for (const kk of resolve(k, `objetivo ${t.id}`)) g.key(kk);
  }
  for (const k of [...facts.manual, ...facts.auto, ...facts.bootstrap]) g.key(k);
  for (const k of cfg.extraFacts) facts.auto.push(k);
  for (const k of [...cfg.extraFacts, ...cfg.extraKeys]) g.key(k);
  g.finalize();
  for (const s of worldSources) s.keys = [...new Set(s.keys)].map((k) => g.keyIndex.get(k)).filter((k) => k !== undefined);

  const toIds = (arr) => [...new Set(arr)].map((k) => g.key(k));
  const factIds = { manual: toIds(facts.manual), auto: toIds(facts.auto), bootstrap: toIds(facts.bootstrap) };
  return {
    g, cfg, dump, warnings, stats, st, norm, resolve, selLabel, entriesById, typeIndex, ruleOfRecipe, disabledWorld, worldInfo, runnersOf,
    worldSources,
    facts: factIds,
    manualKeys: new Set([...factIds.manual, ...toIds(manualRuleKeys)]),
    manualFactKeys: new Set(factIds.manual),
    unresolved: [...st.unresolved],
  };
}
