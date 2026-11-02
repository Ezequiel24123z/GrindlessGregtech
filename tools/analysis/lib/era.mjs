// Era rules of the analysis tools (Project Reforge, P2-T): the era a player needs to run a recipe, and the recipes usable at an era.
// Pure functions plus one startup-script scan; no Minecraft and no network. The cost matrix prices every era with the recipes of
// that era and below (cost-matrix.mjs); tools/analysis/line-audit.mjs keeps its own copy until a later package adopts this one.
//
// Rules (one definition, `recipeEra`):
//  - voltage: the lowest tier whose voltage covers the recipe's EU/t (capacity.mjs#tierOfEut; tier 0 = ULV, 1 = LV, ...);
//  - dimension: a recipe with dimension conditions runs in any of them (GTM ORs them), so it needs the earliest era that reaches
//    one of them; the era that reaches a dimension is the first era folder of pack/kubejs/startup_scripts/grindless/ that names its id;
//  - multiblock: a recipe type that only our multiblocks run belongs to the earliest era whose startup folder names one of them.
//    A type a singleblock also runs is limited by voltage only (the singleblock runs it at its tier), and so is a type GTM's own
//    multiblock of that name runs (our extra multiblocks such as the Stellar Forge reuse the type).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tierOfEut } from './capacity.mjs';

export const ERAS = ['steam', 'lv', 'mv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev', 'uiv', 'uxv', 'opv', 'max', 'maxplus'];

/** Index of an era name; ULV is the lowest voltage tier and prices with the Steam era (index 0, same as tierOfEut(8)). */
export const eraIdx = (e) => (e === 'ulv' ? 0 : ERAS.indexOf(e));

const here = path.dirname(fileURLToPath(import.meta.url));
export const STARTUP_DIR = path.join(here, '..', '..', '..', 'pack', 'kubejs', 'startup_scripts', 'grindless');
const ID_TOKEN = /\b(?:gtceu|grindless|gcyr|minecraft|gtca|extendedfeatures):[a-z0-9_]+/g;

export const PLANETS_FILE = path.join(STARTUP_DIR, '..', '..', 'data', 'grindless', 'tables', 'planets.json');

/**
 * M1-07: the era a player first reaches these places, which the first startup folder naming the id gets wrong (the Moon is named in
 * EV but reached in HV, the End named in IV, reached in MV, Earth orbit and Io orbit are named nowhere, the Overworld is named only
 * by a UHV script). The other dimensions of a planet in planets.json take the earliest era of the planet's dated dimensions.
 */
export const PLACE_ERAS = {
  'minecraft:overworld': 'steam',
  'minecraft:the_nether': 'lv',
  'minecraft:the_end': 'mv',
  'gcyr:luna': 'hv',
  'gcyr:overworld_orbit': 'luv',
  'grindless:io_orbit': 'luv',
};

/** Dates the places of `first` (id -> era index, edited in place): PLACE_ERAS, then the undated dimensions of every planet of `planets` ({planets: {key: {dimensions}}}). */
export function datePlaces(first, planets) {
  for (const [id, era] of Object.entries(PLACE_ERAS)) first.set(id, ERAS.indexOf(era));
  for (const p of Object.values((planets && planets.planets) || {})) {
    const dims = p.dimensions || [];
    const known = dims.filter((d) => first.has(d)).map((d) => first.get(d));
    if (!known.length) continue;
    const e = Math.min(...known);
    for (const d of dims) if (!first.has(d)) first.set(d, e);
  }
  return first;
}

/** Map id -> era index of the first era folder of `dir` that names it (a machine, a recipe type, an item, a dimension), places dated by datePlaces. */
export function scanStartupEras(dir = STARTUP_DIR, planetsFile = dir === STARTUP_DIR ? PLANETS_FILE : null) {
  const first = new Map();
  ERAS.forEach((era, idx) => {
    const d = path.join(dir, era);
    if (!fs.existsSync(d)) return;
    for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.js')).sort()) {
      for (const id of fs.readFileSync(path.join(d, f), 'utf8').match(ID_TOKEN) || []) if (!first.has(id)) first.set(id, idx);
    }
  });
  return planetsFile && fs.existsSync(planetsFile) ? datePlaces(first, JSON.parse(fs.readFileSync(planetsFile, 'utf8'))) : first;
}

/**
 * Era context: `startup` (id -> era index) and, per recipe type, its multiblock machine ids and whether a singleblock runs it.
 * `machines` is any iterable of {id, types, mb} (the dump's machines.json entries).
 */
export function buildEraContext({ startup = new Map(), own = new Set(), machines = [] } = {}) {
  const mbOfType = new Map();
  const single = new Set();
  const native = new Set();
  for (const m of machines) {
    for (const t of m.types || []) {
      if (!m.mb) { single.add(t); continue; }
      if (!own.has(m.id)) native.add(t);
      if (!mbOfType.has(t)) mbOfType.set(t, []);
      mbOfType.get(t).push(m.id);
    }
  }
  return { startup, mbOfType, single, native };
}

/** Ids of the multiblocks the startup scripts register by literal (event.create('name', 'multiblock')), as gtceu:name. */
export function scanOwnMultiblocks(dir = STARTUP_DIR) {
  const own = new Set();
  for (const era of ERAS) {
    const d = path.join(dir, era);
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.js'))) {
      for (const m of fs.readFileSync(path.join(d, f), 'utf8').matchAll(/\.create\(\s*['"]([a-z0-9_]+)['"]\s*,\s*['"]multiblock['"]/g)) own.add('gtceu:' + m[1]);
    }
  }
  return own;
}

let startupCache = null;
/** The context of a dump with the pack's real startup scripts (scanned once per process). */
export function loadEraContext(dump, startupDir = STARTUP_DIR) {
  if (!startupCache || startupCache.dir !== startupDir) startupCache = { dir: startupDir, map: scanStartupEras(startupDir), own: scanOwnMultiblocks(startupDir) };
  return buildEraContext({ startup: startupCache.map, own: startupCache.own, machines: dump && dump.machines ? [...dump.machines.values()] : [] });
}

/**
 * Earliest era index whose startup folder names a multiblock of the type. Undefined (voltage only) when a singleblock runs the
 * type, when GTM's own multiblock of that name runs it (our extra multiblocks reuse the type), or when none is known.
 */
export function typeEra(type, ctx) {
  if (ctx.single.has(type) || ctx.native.has(type)) return undefined;
  let best;
  for (const id of ctx.mbOfType.get(type) || []) {
    const e = ctx.startup.get(id);
    if (e !== undefined && (best === undefined || e < best)) best = e;
  }
  return best;
}

/** Era of the dimension conditions of a recipe (the earliest one: they are alternatives); 0 with none. */
export function dimensionEra(conditions, ctx) {
  let best;
  for (const c of conditions || []) {
    if (!c || typeof c.dimension !== 'string' || c.reverse) continue;
    const e = ctx.startup.get(c.dimension) ?? 0;
    if (best === undefined || e < best) best = e;
  }
  return best ?? 0;
}

/** Era index of one dimension id: the first era folder naming it (0 when none does), as `dimensionEra` reads it. */
export function dimensionIdEra(dimension, ctx) {
  return ctx.startup.get(dimension) ?? 0;
}

/** Era index a player needs to run a normalized recipe {type, eut, conditions}. */
export function recipeEra(r, ctx) {
  const volt = r.eut ? tierOfEut(r.eut) : 0;
  return Math.max(volt, dimensionEra(r.conditions, ctx), typeEra(r.type, ctx) ?? 0);
}

/** The recipes a player of the era (name or index) can run. */
export function availableAt(recipes, era, ctx) {
  const lim = typeof era === 'number' ? era : eraIdx(era);
  return recipes.filter((r) => recipeEra(r, ctx) <= lim);
}
