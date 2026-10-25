// Builds the rule graph from the dump and the tier configuration.
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
  // Dimension where the factory sits for this analysis: filters recipes with a dimension condition and fluid deposits.
  // Defaults to the Overworld; the CLI overrides it (--dimension), and `contexts` lists the ones to check.
  cfg.contextDimension = raw.dimension || 'minecraft:overworld';
  // A "fluid" target is treated as an item whose key carries the fluid: prefix.
  const fixTarget = (t) => (t.fluid !== undefined
    ? { ...t, item: asArray(t.fluid).map((f) => (String(f).startsWith('fluid:') ? f : 'fluid:' + f)) }
    : t);
  cfg.targets = (raw.targets || []).map(fixTarget);
  cfg.autoTargets = (raw.autoTargets || []).map(fixTarget);
  // Era rule (lib/eras.mjs): order of the eras, the resources each one brings, and the items that belong to it.
  cfg.era = raw.era || raw.tier;
  cfg.eraOrder = raw.eraOrder || [];
  cfg.eraSiblings = raw.eraSiblings || [];
  cfg.eraResources = raw.eraResources || [];
  cfg.eraItems = raw.eraItems || [];
  // Obtainability audit (lib/obtain.mjs): items with NBT by type, bee recipes as rules, and keys/facts with no item
  // in the registry (dim:<id> for dimensions, bee:<id> for bees).
  cfg.nbtTyped = raw.nbtTyped ? new Set(raw.nbtTyped) : null;
  cfg.bees = !!raw.bees;
  cfg.extraFacts = raw.extraFacts || [];
  cfg.extraKeys = raw.extraKeys || [];
  return cfg;
}

/** Keys (items or fluids) a config selector names. */
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
    warnings.push(`invalid selector in ${ctx}: ${JSON.stringify(sel)}`);
    return [];
  };
  const label = (sel) => {
    if (typeof sel === 'string') return sel;
    if (Array.isArray(sel)) return sel.length === 1 ? label(sel[0]) : `(${sel.map(label).join(' | ')})`;
    if (sel && sel.label) return sel.label;
    if (sel && sel.fuelOf) return `fuel for ${sel.fuelOf}`;
    if (sel && sel.anyOf) return label(sel.anyOf);
    return JSON.stringify(sel);
  };
  return { resolve, label };
}

/** Voltage of each GT tier (V[0] = ULV ... V[14] = MAX). */
const V = [8, 32, 128, 512, 2048, 8192, 32768, 131072, 524288, 2097152, 8388608, 33554432, 134217728, 536870912, 2147483647];

/** GTM's voltage tiers, lowest first: the folders of the pack's family recipes (`TIERS` in startup_scripts/grindless/lv/multis.js). */
export const TIER_NAMES = ['ulv', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max'];

/**
 * The tier a family recipe is filed under: the highest tier named by a folder of its id path ('' = none), as `rules.recipeTier`
 * in lv/multis.js (grindless:vein_drilling/ev/ilmenite_moon_titanium -> ev).
 */
export function recipeTierOf(id) {
  const path = id.includes(':') ? id.slice(id.indexOf(':') + 1) : id;
  const parts = path.split('/');
  let best = -1;
  for (let i = 0; i < parts.length - 1; i++) best = Math.max(best, TIER_NAMES.indexOf(parts[i]));
  return best < 0 ? '' : TIER_NAMES[best];
}

/**
 * The pack's family veto (lv/multis.js): `vetoAbove: <tier>` skips the recipes filed under a folder above that tier
 * (`rules.isAboveTier`: the LV, MV and HV drills and greenhouses, the sealed dome); `onlyTier: <tier>` runs only that tier's folder
 * (`rules.recipeTier(recipe) !== tier`: the EV tripod), and `onlyTier: ""` only the recipes with no tier folder (the steam drill and
 * greenhouse, steam/machines.js, since 2026-10-25). `onlyRecipes: [id globs]` (IV, 2026-10-25) runs only the recipes those globs
 * name: two machines of one type and folder that veto each other's recipes by prefix (the pressurized drill takes only
 * vein_drilling/iv/pressurized_*, the Mercury drill only vein_drilling/iv/mercury_*).
 */
function tierAllows(e, recipeId) {
  if (e.onlyRecipesMatch && !e.onlyRecipesMatch(recipeId)) return false;
  if (e.vetoAbove === undefined && e.onlyTier === undefined) return true;
  const t = recipeTierOf(recipeId);
  if (e.onlyTier !== undefined) return t === e.onlyTier;
  return t === '' || TIER_NAMES.indexOf(t) <= TIER_NAMES.indexOf(e.vetoAbove);
}

/** A vein's material without its namespace if it's GT's ("gtceu:iron" -> "iron"); an addon's keeps it ("gtca:red_zircon"). */
const veinMaterialName = (m) => (m.startsWith('gtceu:') ? m.slice(6) : m);
/** A vein's id without its namespace or the "_vein" chunk (even mid-string): redstone_vein_ow -> redstone_ow. */
const bareVeinId = (short) => short.replace(/_vein(?=_|$)/, '');

/**
 * Materials of the veins that match the filter; without veins.json the fallback list is used.
 * `offered(vein, from)` applies `requireItem`/`requireRecipe` (the veins the drill's table offers), e.g. the
 * End's veins the pack offers, not the ones GTM or an addon registers, nor the ones the pack sets aside.
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

/** Recipe types a registered machine accepts: its own plus the vanilla ones GT clones (proxies). */
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

  // 1) Normalized recipes
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

  // Does the drill's table offer the vein? `requireItem`: its item exists (the sample). `requireRecipe: {type, input}`:
  // some recipe of that type takes that item as input; this is what matters when the pack sets a vein aside and leaves its
  // sample registered (hidden, converted into an empty probe) but with no drilling recipes. {id}/{short} as in targets.
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

  // A slot with no alternative at all (empty tag, no machine in the tier) falls back on a "dead:" key with no
  // producers: it's never reached, but in the blocking analysis it acts as a nameable root.
  // tol = a slot that's tolerant for sustainability purposes: a machine's fuel or a catalyst only sometimes consumed.
  const slotOf = (keys, cap, label, role, tol = false) => ({
    alts: (keys.length > 0 ? keys : [`dead:${label}`]).map((k) => g.key(k)), cap, label, role, tol, dead: keys.length === 0,
  });
  const addRule = (name, kind, type, slots, outs, meta = {}) =>
    g.addRule({ name, kind, type, slots, outs: outs.map((k) => g.key(k)), meta });

  // 2) World
  const facts = { manual: [], auto: [], bootstrap: [] };
  // world sources that contribute something in this analysis, with their origin (era rule): {id, origin, keys, kind, rule?}
  const worldSources = [];
  const manualRuleKeys = [];
  const worldInfo = [];
  const disabledWorld = new Map();
  const ctxDim = cfg.contextDimension;
  // GTM config switches the analysis reads (dumped in config.json): key -> value (true/false/null).
  const usedConfig = new Map();
  const configWarned = new Set();
  // `known` tells apart "the config has a different value" from "it couldn't be read": a part conditioned on the config
  // is still required if it can't be read (the cautious choice), while a requirement check is taken as unmet.
  const configState = (spec, wid, whenUnknown = 'treated as unmet') => {
    const key = spec.config;
    const want = spec.equals === undefined ? true : spec.equals;
    const have = dump.config ? dump.config[key] : undefined;
    usedConfig.set(key, have === undefined ? null : have);
    if (have === undefined || have === null) {
      const why = dump.config ? 'could not be read in the dump' : 'the dump has no config.json';
      if (!configWarned.has(key)) {
        configWarned.add(key);
        warnings.push(`${wid}: can't check config ${key} (${why}); ${whenUnknown}`);
      }
      return { ok: false, known: false, text: `config ${key} unknown (${why})` };
    }
    return { ok: have === want, known: true, have, text: `config ${key} = ${have}, wants ${want}` };
  };
  // Fluid deposits (GTM's fluid drilling rig): allows the dimension if its filter is null or includes it.
  const fluidVeinInfo = new Map();
  // Raw ore item for a vein material, resolved against the dump's registry: the material's own namespace if it has one
  // (gtca:red_zircon -> gtca:raw_red_zircon), otherwise the template's (gtceu:raw_{m}), vanilla's (minecraft:raw_iron), or
  // any other mod that registers it (gtca:raw_germanite). `overrides` is only a fallback: it only applies if the dump has
  // no item with that name. Returns the ids that exist (none = "no item").
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
      tplInfo = `${mats.length} materials (${from.source}), ${missing} with no item`;
    }
    for (const it of asArray(entry.items)) {
      const ks = resolve(it, wid);
      if (ks.length === 0) warnings.push(`${wid}: "${it}" has no members in this pack`);
      for (const k of ks) {
        if (!k.startsWith('fluid:') && !dump.items.has(k)) warnings.push(`${wid}: item ${k} doesn't exist in the registry`);
        else if (k.startsWith('fluid:') && !dump.fluids.has(k.slice(6))) warnings.push(`${wid}: fluid ${k.slice(6)} doesn't exist in the registry`);
        else keys.push(k);
      }
    }
    if (entry.fromFluidVeins) {
      const spec = entry.fromFluidVeins === true ? {} : entry.fromFluidVeins;
      const only = spec.fluids ? new Set(asArray(spec.fluids)) : null;
      if (!dump.fluidVeins) warnings.push(`${wid}: the dump has no fluid_veins.json`);
      else {
        const ineligible = new Map();
        for (const v of dump.fluidVeins) {
          if (!v.fluid || (only && !only.has(v.fluid))) continue;
          if (!dump.fluids.has(v.fluid)) {
            warnings.push(`${wid}: deposit ${v.id} gives ${v.fluid}, which doesn't exist in the registry`);
            continue;
          }
          const k = 'fluid:' + v.fluid;
          if (v.dims === null || v.dims.includes(ctxDim)) {
            keys.push(k);
            if (!fluidVeinInfo.has(v.fluid)) fluidVeinInfo.set(v.fluid, []);
            fluidVeinInfo.get(v.fluid).push(v.id);
          } else {
            ineligible.set(k, `deposit ${v.id} only allows ${v.dims.length > 0 ? v.dims.join(', ') : 'no dimension'}; this analysis is in ${ctxDim}`);
          }
        }
        for (const [k, why] of ineligible) if (!keys.includes(k) && !disabledWorld.has(k)) disabledWorld.set(k, why);
      }
    }
    keys = [...new Set(keys)];
    // does the world give this in this analysis? (enabled, dimension, GTM config requirements)
    let off = entry.enabled === false ? wid : null;
    if (off === null && entry.dimensions && !entry.dimensions.includes(ctxDim)) off = `${wid} (only in ${entry.dimensions.join(', ')})`;
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
    // sustainedIf: with the config met the source never runs out; otherwise it only gives a finite amount (WARN)
    const sustained = entry.sustainedIf ? configState(entry.sustainedIf, wid).ok : true;
    // where the source is gathered: `origin` or its veins' dimensions. The era rule removes sources
    // from a dimension that is a later era's resource (the trip to the End, to the Moon...).
    const origin = entry.origin ? asArray(entry.origin) : entry.fromVeins ? asArray(entry.fromVeins.dimensions || ['minecraft:overworld']) : [];
    const source = { id: wid, origin, keys };
    if (entry.mode === 'manual') {
      if (entry.needs && keys.length > 0) {
        // hand-gathering that first requires a crafted item (the End key): it's a rule, not a world fact
        const slots = asArray(entry.needs).map((n) => slotOf(resolve(n, wid), true, selLabel(n), 'capital'));
        source.rule = addRule(`world:${wid}`, 'world-manual', 'world', slots, keys, { bootstrap: !!entry.bootstrap, note: entry.note || '' });
        source.kind = 'rule';
        manualRuleKeys.push(...keys);
      } else {
        source.kind = 'manual';
        facts.manual.push(...keys);
        if (entry.bootstrap) facts.bootstrap.push(...keys);
      }
    } else if (entry.via && entry.via.length > 0) {
      const slots = [slotOf(entry.via.map((v) => 'run:' + v), false, `machine ${entry.via.join(' | ')}`, 'machine')];
      source.rule = addRule(`world:${wid}`, 'world-auto', 'world', slots, keys, { finite: !!entry.finite || !sustained, note: entry.note || '' });
      source.kind = 'rule';
    } else {
      source.kind = 'auto';
      facts.auto.push(...keys);
    }
    worldSources.push(source);
  });
  stats.fluidVeins = [...fluidVeinInfo.entries()].map(([fluid, ids]) => ({ fluid, deposits: ids }));
  stats.configRead = [...usedConfig.entries()].map(([key, value]) => ({ key, value }));

  // 3) Machines: m:<id> (can be built) and run:<id> (works: built + whatever it consumes while running)
  // machinesFromRegistry: adds registered machines in bulk with a prefix (e.g. all gtceu:lv_*) with their
  // real recipe types; an explicit `machines` entry with the same id takes priority. `maxEUtByTier`: a single-block
  // machine's EU/t cap is its own tier's voltage (V[tier] from the registry; multiblocks have no cap);
  // `includeTypeless`: also the ones with no recipe type (the fluid drilling rig), for use in `via`.
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
      fromRegistry.push({ machine: mid, types, maxEUt, needs: spec.needs, parts: spec.parts, note: `from the registry (${spec.prefix}*)` });
    }
  }
  stats.machinesFromRegistry = fromRegistry.length;
  const entriesById = new Map();
  const typeIndex = new Map();
  for (const e0 of [...cfg.machines, ...fromRegistry]) {
    const id = e0.id || e0.machine;
    // an optional machine that isn't registered yet (another package's, still unmerged) has no structure either: no warnings about it
    const pending = !!e0.optional && dump.machines.size > 0 && !dump.machines.has(e0.machine);
    // energy: max voltage of an electric multiblock per GTM 7.5.3 (WorkableElectricMultiblockMachine.getMaxVoltage): with
    // 2 or more energy hatches of the highest tier it counts as one step higher (V[tier + 1] = 4x the hatch's voltage).
    // It counts hatches, not amperage: two LV hatches (2 A each) or two 1 A ones give the same result, 128 V (MV).
    // `hatches` = how many the pattern allows (if missing and the pack has a structure, it's read from there).
    let e = e0;
    if (e0.energy) {
      const ability = e0.energy.ability || 'energy_input';
      const desc = e0.partsFromStructure ? dump.structures.get(e0.machine) : null;
      let hatches = e0.energy.hatches;
      if (hatches === undefined && desc) hatches = abilityMaxCount(desc, ability);
      if (hatches === undefined) {
        if (!pending) warnings.push(`${id}: energy has no «hatches» and no structure to read the «${ability}» hatches from; counting 1`);
        hatches = 1;
      }
      if (typeof e0.energy.voltage !== 'number') warnings.push(`${id}: energy.voltage must be a number (the hatch's voltage)`);
      const maxEUt = hatches >= 2 ? e0.energy.voltage * 4 : e0.energy.voltage;
      e = { ...e0, maxEUt };
      stats.rolledMachines.push({ machine: id, hatches, voltage: e0.energy.voltage, maxEUt });
    }
    // coilTemp: an EBF's coil temperature. GTM adds 100 K per voltage step above MV
    // (GTRecipeModifiers.ebfOverclock) and rejects recipes whose ebf_temp is higher.
    if (e0.coilTemp !== undefined) {
      const volt = e.maxEUt;
      const tier = typeof volt === 'number' && volt > 0 ? Math.round(Math.log(volt / 8) / Math.log(4)) : 2;
      e = { ...e, maxTemp: e0.coilTemp + 100 * Math.max(0, tier - 2) };
    }
    if (entriesById.has(id)) warnings.push(`duplicate machine in the configuration: ${id}`);
    for (const f of ['vetoAbove', 'onlyTier']) {
      const ok = TIER_NAMES.includes(e[f]) || (f === 'onlyTier' && e[f] === '');
      if (e[f] !== undefined && !ok) warnings.push(`${id}: ${f} «${e[f]}» isn't a tier (${TIER_NAMES.join(', ')}${f === 'onlyTier' ? ', or "" for the recipes with no tier folder' : ''})`);
    }
    if (e0.onlyRecipes !== undefined) {
      const globs = asArray(e0.onlyRecipes);
      if (globs.length === 0) warnings.push(`${id}: onlyRecipes is empty: the machine runs no recipe`);
      e = { ...e, onlyRecipesMatch: makeGlobMatcher(globs) };
    }
    entriesById.set(id, e);
    const reg = dump.machines.get(e.machine);
    if (dump.machines.size > 0 && e.machine.startsWith('gtceu:') && !reg && !e.optional) {
      warnings.push(`machine ${e.machine} isn't registered in this pack`);
    }
    if (reg && e.types && e.types.length > 0) {
      const allowed = typesOfRegistered(dump, reg);
      const bad = e.types.filter((t) => !allowed.has(t));
      if (bad.length > 0) {
        warnings.push(`${e.machine}: the config says it processes ${bad.join(', ')} but the registry says ${reg.types.join(', ') || '(nothing)'}`);
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
          warnings.push(`${id}: ${what} ${k} doesn't exist in the registry (misspelled id, or not implemented yet?)`);
        }
      }
    };
    if (!e.machine.startsWith('gtceu:')) checkIds([e.machine], 'the machine');
    // partsFromStructure: parts come from the pattern description the pack dumps (structures.json); if the
    // dump doesn't carry it, the config's `parts` are used.
    let partSels = asArray(e.parts);
    let partsFrom = 'config';
    if (e.partsFromStructure) {
      const desc = dump.structures.get(e.machine);
      if (desc) {
        // the machine's `partAbilities` (e.g. requiring the MV hatch) overrides the tier's key by key
        const abilityItems = e.partAbilities ? { ...cfg.partAbilities, ...e.partAbilities } : cfg.partAbilities;
        const sd = structureSelectors(desc, abilityItems, (i) => dump.items.size === 0 || dump.items.has(i));
        for (const p of sd.problems) warnings.push(`${id}: ${p}`);
        partSels = sd.selectors;
        // requireAbilities (IV, 2026-10-25): a variant built WITH an optional part its real pattern offers (a plant of ours formed with
        // the IV parallel hatch); the pattern must have a cell for it
        for (const ab of asArray(e.requireAbilities)) {
          if (abilityMaxCount(desc, ab) === 0) warnings.push(`${id}: requireAbilities «${ab}»: ${e.machine}'s pattern has no part with that ability`);
          const items = (abilityItems[ab] || []).filter((i) => dump.items.size === 0 || dump.items.has(i));
          if (!abilityItems[ab]) warnings.push(`${id}: requireAbilities «${ab}» isn't in the config's partAbilities`);
          partSels.push({ anyOf: items, label: `part «${ab}» (this variant's)` });
        }
        partsFrom = 'structure';
        stats.structureMachines++;
        stats.structureMachineIds.push(e.machine);
      } else if (!pending) {
        warnings.push(`${id}: the dump doesn't carry ${e.machine}'s structure${partSels.length > 0 ? "; using the config's parts" : ' and there are no parts in the config either'}`);
      }
    }
    for (const p of partSels) {
      // {anyOf, onlyIf:{config,equals}}: a part GTM only requires with that config value (e.g. the maintenance hatch
      // with machines.enableMaintenance); if the config can't be read it's still required
      if (p && typeof p === 'object' && !Array.isArray(p) && p.onlyIf) {
        const r = configState(p.onlyIf, `parts of ${id}`, 'the part is still required');
        if (r.known && !r.ok) {
          stats.partsNotRequired.push({ machine: id, part: selLabel(p), why: `config ${p.onlyIf.config} = ${r.have}; only required with ${p.onlyIf.equals === undefined ? true : p.onlyIf.equals}` });
          continue;
        }
      }
      const keys = resolve(p, `parts of ${id}`);
      checkIds(keys.filter((k) => !k.startsWith('fluid:')), 'the part');
      buildSlots.push(slotOf(keys, true, selLabel(p), 'part'));
    }
    addRule(`build:${id}`, 'machine-build', 'machine', buildSlots, ['m:' + id], { assumed: !!e.assumed, partsFrom });
    const runSlots = [slotOf(['m:' + id], true, `${id} built`, 'machine-built')];
    for (const n of asArray(e.needs)) {
      const keys = resolve(n, `needs of ${id}`);
      checkIds(keys.filter((k) => k.startsWith('fluid:')), 'the fluid');
      runSlots.push(slotOf(keys, false, selLabel(n), 'need', true));
    }
    addRule(`operate:${id}`, 'machine-run', 'machine', runSlots, ['run:' + id], { maxEUt: e.maxEUt });
  }

  // 4) Synthetic rules (production that isn't a recipe: boilers, the primitive pump...). `recipesOf` ones (a generator's own
  // recipe type) are added after the recipes, below: they copy each recipe's slots.
  for (const s of cfg.synthetic) {
    if (s.recipesOf !== undefined) continue;
    const slots = [];
    const machineIds = asArray(s.machines);
    for (const m of machineIds) if (!entriesById.has(m)) warnings.push(`synthetic ${s.id}: machine ${m} isn't in machines`);
    if (machineIds.length > 0) slots.push(slotOf(machineIds.map((m) => 'run:' + m), false, `machine ${machineIds.join(' | ')}`, 'machine'));
    for (const c of asArray(s.consumes)) slots.push(slotOf(resolve(c, s.id), false, selLabel(c), 'input'));
    for (const c of asArray(s.capital)) slots.push(slotOf(resolve(c, s.id), true, selLabel(c), 'capital'));
    const outs = asArray(s.produces).flatMap((p) => resolve(p, s.id));
    addRule(`synthetic:${s.id}`, 'synthetic', 'synthetic', slots, outs, { note: s.note || '' });
  }

  // 5) Recipes
  const ruleOfRecipe = new Map();
  for (const n of norm) {
    const slots = [];
    if (!cfg.unconditionalTypes.has(n.type)) {
      const all = typeIndex.get(n.type) || [];
      const euOk = (e) => (e.maxEUt === undefined ? Infinity : e.maxEUt) >= n.eut;
      const tempOk = (e) => e.maxTemp === undefined || n.temp === undefined || e.maxTemp >= n.temp;
      const tierOk = (e) => tierAllows(e, n.id);
      const cands = all.filter((e) => euOk(e) && tempOk(e) && tierOk(e));
      let lbl = `machine for ${n.type}`;
      if (cands.length === 0) {
        if (all.length === 0) lbl = `there's no machine for ${n.type} in this tier`;
        else if (all.some((e) => euOk(e) && tempOk(e) && e.onlyRecipesMatch)) lbl = `no ${n.type} machine of this tier takes ${n.id} (the family's veto: its tier folders and the machines' recipe allowlists)`;
        else if (all.some((e) => euOk(e) && tempOk(e))) lbl = `no ${n.type} machine of this tier runs the recipes filed under ${recipeTierOf(n.id)}/ (the family's tier veto)`;
        else if (all.some(euOk)) lbl = `no ${n.type} machine reaches ${n.temp} K (this tier's coils)`;
        else lbl = `no ${n.type} machine accepts ${n.eut} EU/t`;
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
    // GTM ORs the dimension conditions of one recipe (DimensionCondition.isOr, RecipeHelper.checkConditions): together they make
    // one slot, met when any of them is. Obtainability audit (asKeys): a dimension condition needs the dim:<id> key, a fact for
    // each dimension that's reached (and another pass adds the later eras' ones). `asKeysFor: [ids]` does the same only for those
    // dimensions: a base outside the factory (the Moon), whose key is given by a tier rule (the trip). The others are compared
    // against the factory's dimension (cfg.contextDimension). A reverse condition ("outside X") that is keyed, or any condition
    // that holds in the factory's dimension, meets the slot outright.
    const dimCfg = cfg.conditions.dimension;
    const keyedDim = (c) => !!dimCfg && !!(dimCfg.asKeys || asArray(dimCfg.asKeysFor).includes(c.dimension));
    const dimGroup = n.conditions.filter((c) => c.type === 'dimension' && typeof c.dimension === 'string' && (keyedDim(c) || !(dimCfg && dimCfg.ignore)));
    if (dimGroup.length > 0) {
      let met = false;
      const keys = [];
      for (const c of dimGroup) {
        if (keyedDim(c)) {
          if (c.reverse === true) met = true;
          else keys.push('dim:' + c.dimension);
        } else if ((c.reverse === true) !== (c.dimension === ctxDim)) {
          met = true;
        }
      }
      if (!met) {
        const where = dimGroup.map((c) => (c.reverse === true ? 'outside ' : 'in ') + c.dimension).join(' or ');
        slots.push(keys.length > 0 ? slotOf(keys, true, where, 'cond') : slotOf([], false, `only applies ${where}; the factory is in ${ctxDim}`, 'cond'));
      }
    }
    for (const c of n.conditions) {
      if (dimGroup.includes(c)) continue;
      const rule = cfg.conditions[c.type] || cfg.conditions['*'];
      if (!rule || rule.ignore || c.reverse === true) continue;
      if (rule.researchKeys) {
        // GTM's assembly line research (ResearchCondition; with machines.enableResearch the line's data access hatch only offers
        // the recipes its data sticks name): met once the research exists, the research:<id> key a scanner recipe's data stick
        // carries (normalize.mjs). Any of the condition's entries will do.
        const ids = asArray(c.research).map((x) => (x && typeof x.researchId === 'string' ? x.researchId : null)).filter(Boolean);
        if (ids.length === 0) slots.push(slotOf(['cond:' + c.type], true, `condition ${c.type} with no research id`, 'cond'));
        else slots.push(slotOf(ids.map((id) => 'research:' + id), true, `research ${ids.join(' | ')}`, 'cond'));
        continue;
      }
      if (rule.unsupported) slots.push(slotOf(['cond:' + c.type], true, `condition ${c.type}`, 'cond'));
      else if (rule.needs || rule.needsByField) {
        // the condition is met with a built machine or item (the clean room): a capital slot. `needsByField`
        // picks based on a field of the condition (cleanroom: "cleanroom" or "sterile_cleanroom"); with no entry, it can't be met.
        let sel = rule.needs;
        let what = c.type;
        if (rule.needsByField) {
          const variant = String(c[rule.needsByField.field]);
          sel = rule.needsByField.map[variant] !== undefined ? rule.needsByField.map[variant] : rule.needsByField.default;
          what = `${c.type} «${variant}»`;
        }
        if (sel === undefined || sel === null) slots.push(slotOf(['cond:' + c.type], true, `condition ${what}`, 'cond'));
        else slots.push(slotOf(resolve(sel, `condition ${c.type}`), true, `${what}: ${selLabel(sel)}`, 'cond'));
      } else if (rule.field && rule.max !== undefined) {
        // a numeric condition with a cap in this tier (e.g. the EBF's coil temperature): above it, the recipe doesn't apply
        const value = Number(c[rule.field]);
        if (value > rule.max) slots.push(slotOf([], false, `${c.type} ${value} (this tier reaches ${rule.max})`, 'cond'));
      } else if (rule.fluidsFrom) {
        for (const f of asArray(c[rule.fluidsFrom])) {
          slots.push(slotOf(resolve('fluid:' + f, `condition ${c.type}`), true, `next to ${f}`, 'cond'));
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

  // 5b) Generators of the pack's own recipe types (IV, 2026-10-25): `{id, recipesOf: [types], recipe?: [id globs], produces}` adds one
  // rule per recipe of those types, named synthetic:<id>, with that recipe's slots (its machine, fuel, dimension and other conditions)
  // and the synthetic's products (the energy key). The reactor's cores, the Venus engine's ground heat, the Mercury field's sunlight and
  // the RTG's pellet are read from the dump, so a recipe that changes changes the source; `without: ["synthetic:<id>"]` drops them all.
  for (const s of cfg.synthetic) {
    if (s.recipesOf === undefined) continue;
    const types = new Set(asArray(s.recipesOf));
    const nameMatch = s.recipe ? makeGlobMatcher(asArray(s.recipe)) : null;
    const outs = asArray(s.produces).flatMap((p) => resolve(p, s.id));
    let count = 0;
    for (const n of norm) {
      if (!types.has(n.type) || (nameMatch && !nameMatch(n.id))) continue;
      const rid = ruleOfRecipe.get(n.id);
      if (rid === undefined) continue;
      const rule = g.rules[rid];
      const slots = rule.slots.map((slot) => ({ ...slot, alts: [...slot.alts] }));
      addRule(`synthetic:${s.id}`, 'synthetic', 'synthetic', slots, outs, { note: s.note || '', recipe: n.id, dims: rule.meta.dims, notDims: rule.meta.notDims });
      count++;
    }
    if (count === 0) warnings.push(`synthetic ${s.id}: no recipe of ${[...types].join(', ')}${s.recipe ? ` matching ${asArray(s.recipe).join(', ')}` : ''} in the pack`);
  }
  stats.rules = g.rules.length;

  // Targets generated from the registry's veins: one per vein ("some ore from each Nether vein").
  //   {idPrefix, labelPrefix, dimensions, layers?, exclusiveFrom?, requireItem?, requireRecipe?, without?, allowFinite?, optional?}
  //   plus one of these forms:
  //   - ore:    {template, mode: 'anyOf'|'allOf'} -> a target over the vein's raw ores (with `exclusiveFrom`, only the
  //            ores that don't come from the veins of those dimensions; with none, the vein is skipped). Each ore's item is
  //            resolved against the dump's registry (the material's namespace, the template, vanilla, or another mod); `overrides`
  //            is only a fallback.
  //   - recipe: {target: {...}} -> the item is copied with {id} (the vein's id without the "_vein" chunk: redstone_vein_ow -> redstone_ow)
  //            and {short} (id without namespace) substituted in its text; e.g.
  //            {kind:'recipe', type:'gtceu:vein_drilling', input:'grindless:vein_sample_{id}'}
  //   `requireRecipe` ({type, input} with {id}/{short}): only the veins the drill's table offers, i.e. the ones that
  //   have a recipe of that type taking their sample; `requireItem` (looser): the ones that have the item. The rest have no
  //   target (veins from other mods, set aside in veins_excluded.json, or waiting for their era) and are listed in the notes.
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
        warnings.push(`${which}: the dump has no veins.json`);
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
        const base = { id: `${spec.idPrefix || 'vein-'}${short}`, label: `${spec.labelPrefix || 'Vein'} ${short}`, ...extras };
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
          if (!exclusive) warnings.push(`${which}: vein ${short} has no ore with an item (${spec.template})`);
          continue;
        }
        out.push({ ...base, [spec.mode === 'all' ? 'allOf' : 'anyOf']: items });
        n++;
      }
      if (n === 0) warnings.push(`${which}: no vein matches ${JSON.stringify(spec.dimensions || ['minecraft:overworld'])}`);
      stats.veinTargets += n;
    }
    return out;
  };
  cfg.targets.push(...veinTargets(cfg.targetsFromVeins, 'targetsFromVeins'));
  cfg.autoTargets.push(...veinTargets(cfg.autoTargetsFromVeins, 'autoTargetsFromVeins'));
  // `expect` is a leak check and each pass only allows one: without this warning, an `expect` in the wrong list would be silently ignored.
  for (const t of cfg.targets) {
    if (t.expect && t.expect !== 'unreachable') warnings.push(`target ${t.id}: expect «${t.expect}» isn't valid in targets (the gate only allows «unreachable»)`);
  }
  for (const t of cfg.autoTargets) {
    if (t.expect && t.expect !== 'not-automatic') warnings.push(`target ${t.id}: expect «${t.expect}» isn't valid in autoTargets (it only allows «not-automatic»)`);
  }

  // Registered machines (not just the ones in the config) that run a recipe type; `machineless` leak checks use this
  // to tell an orphan recipe (no machine runs it) from one somebody could run.
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
    if (t.machineless && !(t.kind === 'recipe' || t.type || t.recipe)) warnings.push(`target ${t.id}: machineless only applies to recipe-type targets`);
    if (t.maxEUt !== undefined && !t.machineless) warnings.push(`target ${t.id}: maxEUt is only used together with machineless`);
  }

  // Target and fact keys are created before closing the graph so they can be looked up even if nothing produces them.
  const targetKeys = (t) => [...asArray(t.item), ...asArray(t.fluid), ...asArray(t.anyOf), ...asArray(t.allOf), ...asArray(t.input), ...asArray(t.output)];
  for (const t of [...cfg.targets, ...cfg.autoTargets]) {
    for (const k of targetKeys(t)) for (const kk of resolve(k, `target ${t.id}`)) g.key(kk);
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
