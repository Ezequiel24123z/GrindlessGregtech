// Construye el grafo de reglas a partir del volcado y de la configuración del tier.
import { Graph } from './engine.mjs';
import { fluidKey, normalizeRecipe } from './normalize.mjs';
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
  cfg.synthetic = raw.synthetic || [];
  // Un objetivo "fluid" se trata como un objeto cuya clave lleva el prefijo fluid:.
  const fixTarget = (t) => (t.fluid !== undefined
    ? { ...t, item: asArray(t.fluid).map((f) => (String(f).startsWith('fluid:') ? f : 'fluid:' + f)) }
    : t);
  cfg.targets = (raw.targets || []).map(fixTarget);
  cfg.autoTargets = (raw.autoTargets || []).map(fixTarget);
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
    if (sel && sel.fuelOf) return `combustible de ${sel.fuelOf}`;
    if (sel && sel.anyOf) return label(sel.anyOf);
    return JSON.stringify(sel);
  };
  return { resolve, label };
}

/** Materiales (sin espacio de nombres) de las vetas que cumplen el filtro; sin veins.json se usa la lista de reserva. */
function veinMaterials(dump, from, fallback) {
  if (!dump.veins) return { mats: fallback || [], source: 'config' };
  const dims = new Set(from.dimensions || ['minecraft:overworld']);
  const layers = from.layers ? new Set(from.layers) : null;
  const mats = new Set();
  for (const v of dump.veins) {
    if (!v.dims.some((d) => dims.has(d))) continue;
    if (layers && !layers.has(v.layer)) continue;
    for (const m of v.mats) mats.add(m.includes(':') ? m.split(':')[1] : m);
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
    templateMissing: 0, rules: 0,
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
  const worldInfo = [];
  const disabledWorld = new Map();
  cfg.world.forEach((entry, idx) => {
    const wid = entry.id || `world[${idx}]`;
    let keys = [];
    let tplInfo = '';
    if (entry.template) {
      const from = entry.fromVeins
        ? veinMaterials(dump, entry.fromVeins, entry.materials)
        : { mats: entry.materials || [], source: 'config' };
      const mats = [...new Set([...from.mats, ...(entry.extraMaterials || [])])];
      let missing = 0;
      for (const m of mats) {
        const id = entry.template.replace('{m}', m);
        if (dump.items.has(id)) keys.push(id);
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
    keys = [...new Set(keys)];
    worldInfo.push({ id: wid, mode: entry.mode, count: keys.length, enabled: entry.enabled !== false, note: entry.note || '', tplInfo, via: entry.via });
    if (entry.enabled === false) {
      for (const k of keys) if (!disabledWorld.has(k)) disabledWorld.set(k, wid);
      return;
    }
    if (entry.mode === 'manual') {
      facts.manual.push(...keys);
      if (entry.bootstrap) facts.bootstrap.push(...keys);
    } else if (entry.via && entry.via.length > 0) {
      const slots = [slotOf(entry.via.map((v) => 'run:' + v), false, `máquina ${entry.via.join(' | ')}`, 'machine')];
      addRule(`mundo:${wid}`, 'world-auto', 'world', slots, keys, { finite: !!entry.finite, note: entry.note || '' });
    } else {
      facts.auto.push(...keys);
    }
  });

  // 3) Máquinas: m:<id> (se puede construir) y run:<id> (funciona: construida + lo que consume al operar)
  // machinesFromRegistry: añade en bloque las máquinas registradas con un prefijo (p. ej. todas las gtceu:lv_*) con sus
  // tipos de receta reales; una entrada explícita de `machines` con el mismo id tiene prioridad.
  const explicitIds = new Set(cfg.machines.map((e) => e.id || e.machine));
  const fromRegistry = [];
  for (const spec of cfg.machinesFromRegistry) {
    const excluded = makeGlobMatcher(spec.exclude || []);
    const skipTypes = new Set(spec.excludeTypes || ['gtceu:dummy']);
    for (const [mid, reg] of dump.machines) {
      if (!mid.startsWith(spec.prefix) || excluded(mid) || explicitIds.has(mid)) continue;
      if (reg.mb && !spec.multiblocks) continue;
      const types = reg.types.filter((t) => !skipTypes.has(t));
      if (types.length === 0) continue;
      explicitIds.add(mid);
      fromRegistry.push({ machine: mid, types, maxEUt: spec.maxEUt, needs: spec.needs, parts: spec.parts, note: `del registro (${spec.prefix}*)` });
    }
  }
  stats.machinesFromRegistry = fromRegistry.length;
  const entriesById = new Map();
  const typeIndex = new Map();
  for (const e of [...cfg.machines, ...fromRegistry]) {
    const id = e.id || e.machine;
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
    for (const p of asArray(e.parts)) {
      const keys = resolve(p, `parts de ${id}`);
      checkIds(keys.filter((k) => !k.startsWith('fluid:')), 'la parte');
      buildSlots.push(slotOf(keys, true, selLabel(p), 'part'));
    }
    addRule(`construir:${id}`, 'machine-build', 'machine', buildSlots, ['m:' + id], { assumed: !!e.assumed });
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
      const cands = all.filter((e) => (e.maxEUt === undefined ? Infinity : e.maxEUt) >= n.eut);
      const lbl = cands.length > 0
        ? `máquina de ${n.type}`
        : all.length === 0 ? `no hay máquina para ${n.type} en este tier` : `ninguna máquina de ${n.type} admite ${n.eut} EU/t`;
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
      const rule = cfg.conditions[c.type] || cfg.conditions['*'];
      if (!rule || rule.ignore || c.reverse === true) continue;
      if (rule.unsupported) slots.push(slotOf(['cond:' + c.type], true, `condición ${c.type}`, 'cond'));
      else if (rule.fluidsFrom) {
        for (const f of asArray(c[rule.fluidsFrom])) {
          slots.push(slotOf(resolve('fluid:' + f, `condición ${c.type}`), true, `junto a ${f}`, 'cond'));
        }
      }
    }
    const rid = addRule(n.id, 'recipe', n.type, slots, n.outputs.map((o) => o.key), {
      eut: n.eut, added: n.added, rawType: n.rawType, warn: n.warn,
    });
    ruleOfRecipe.set(n.id, rid);
  }
  stats.rules = g.rules.length;

  // Las claves de objetivos y hechos se crean antes de cerrar el grafo para poder consultarlas aunque nadie las produzca.
  const targetKeys = (t) => [...asArray(t.item), ...asArray(t.fluid), ...asArray(t.anyOf), ...asArray(t.allOf), ...asArray(t.input), ...asArray(t.output)];
  for (const t of [...cfg.targets, ...cfg.autoTargets]) {
    for (const k of targetKeys(t)) for (const kk of resolve(k, `objetivo ${t.id}`)) g.key(kk);
  }
  for (const k of [...facts.manual, ...facts.auto, ...facts.bootstrap]) g.key(k);
  g.finalize();

  const toIds = (arr) => [...new Set(arr)].map((k) => g.key(k));
  const factIds = { manual: toIds(facts.manual), auto: toIds(facts.auto), bootstrap: toIds(facts.bootstrap) };
  return {
    g, cfg, dump, warnings, stats, st, norm, resolve, selLabel, entriesById, typeIndex, ruleOfRecipe, disabledWorld, worldInfo,
    facts: factIds,
    manualKeys: new Set(factIds.manual),
    unresolved: [...st.unresolved],
  };
}
