// Loads a tier's configuration (tiers/<tier>.json) with optional inheritance (`extends`).
import fs from 'node:fs';
import path from 'node:path';
import { readPlaceTables, resolvePlaceTokens } from './places.mjs';
import { readJson } from './util.mjs';

const MERGED_LISTS = ['world', 'machines', 'machinesFromRegistry', 'synthetic', 'toolTags', 'unconditionalTypes', 'ignoreTypes'];
const TARGET_LISTS = ['targets', 'autoTargets', 'targetsFromVeins', 'autoTargetsFromVeins'];
const MERGED_MAPS = ['typeAliases', 'conditions', 'partAbilities', 'packages'];
// Era rule (lib/eras.mjs): always inherited, and a child element with the same id is merged field by field with the
// parent's (`{"id": "end", "era": "mv"}` is enough to move a resource to another era). A new element with no `era`
// belongs to the era of the file declaring it (its `era` or `tier`).
const ERA_LISTS = ['eraResources', 'eraItems'];
// Lists whose elements have an identity: a child element with the same id replaces the parent's instead of duplicating it.
const KEY_OF = {
  world: (e) => e.id,
  machines: (e) => e.id || e.machine,
  synthetic: (e) => e.id,
  targets: (e) => e.id,
  autoTargets: (e) => e.id,
  targetsFromVeins: (e) => e.idPrefix,
  autoTargetsFromVeins: (e) => e.idPrefix,
};

function mergeList(parentList, childList, key, drop) {
  const keyOf = KEY_OF[key];
  if (!keyOf) return [...parentList, ...childList];
  const childKeys = new Set(childList.map(keyOf).filter((k) => k !== undefined));
  const dropped = new Set(drop || []);
  return [...parentList.filter((e) => !childKeys.has(keyOf(e)) && !dropped.has(keyOf(e))), ...childList];
}

function mergeEraList(parentList, childList, era, drop) {
  const out = new Map();
  let anon = 0;
  for (const e of parentList) out.set(e.id ?? `#${anon++}`, { ...e });
  for (const e of childList) {
    const id = e.id ?? `#${anon++}`;
    out.set(id, out.has(id) ? { ...out.get(id), ...e } : { era, ...e });
  }
  const dropped = new Set(drop || []);
  return [...out.values()].filter((e) => !dropped.has(e.id));
}

/**
 * Parent file. An `extends` by name (no slashes) is looked up first in the layer's folder (`tiers/next/`) if the
 * analysis started there and that file isn't the one requesting it; otherwise, next to the requesting file (as usual).
 */
function parentFile(file, ext, ctx) {
  if (ctx.overlayDir && !/[\\/]/.test(ext)) {
    const candidate = path.join(ctx.overlayDir, `${ext}.json`);
    if (ctx.io.exists(candidate) && path.resolve(candidate) !== path.resolve(file)) return candidate;
  }
  return path.join(path.dirname(file), `${ext}.json`);
}

function loadFile(file, ctx, tierHint) {
  const resolved = path.resolve(file);
  if (ctx.stack.includes(resolved)) throw new Error(`circular inheritance in the configs: ${[...ctx.stack, resolved].join(' -> ')}`);
  if (!ctx.io.exists(file)) throw new Error(`config ${file} doesn't exist`);
  const raw = ctx.io.read(file);
  const era = raw.era || raw.tier || tierHint;
  if (!raw.extends) {
    for (const k of ERA_LISTS) raw[k] = mergeEraList([], raw[k] || [], era);
    return raw;
  }
  const parent = loadFile(parentFile(file, raw.extends, ctx), { ...ctx, stack: [...ctx.stack, resolved] });
  for (const k of MERGED_LISTS) raw[k] = mergeList(parent[k] || [], raw[k] || [], k);
  for (const k of MERGED_MAPS) raw[k] = { ...(parent[k] || {}), ...(raw[k] || {}) };
  raw.fluidContainers = raw.fluidContainers || parent.fluidContainers;
  raw.eraOrder = raw.eraOrder || parent.eraOrder;
  raw.eraSiblings = raw.eraSiblings || parent.eraSiblings;
  const inherit = raw.inheritTargets ? parent : {};
  for (const k of TARGET_LISTS) raw[k] = mergeList(inherit[k] || [], raw[k] || [], k, raw.dropTargets);
  raw.eraResources = mergeEraList(parent.eraResources || [], raw.eraResources || [], era);
  raw.eraItems = mergeEraList(parent.eraItems || [], raw.eraItems || [], era, raw.dropTargets);
  return raw;
}

/**
 * @param {{tier?: string, config?: string}} o  tier name or explicit path to a JSON file
 * @param {string} tiersDir folder containing tiers/<tier>.json
 * @returns {{raw: object, file: string}}
 *
 * A child tier (`extends: "steam"`) appends to the parent's lists and replaces every other field; with
 * `inheritTargets: true` it also inherits the parent's targets (targets, autoTargets and the ones generated from
 * veins). Maps (typeAliases, conditions, partAbilities) are merged key by key, with the child winning. A child
 * element with the same id as a parent one (world, machines, synthetics, targets) replaces it, and
 * `dropTargets: [ids]` removes inherited targets no longer valid in the tier (e.g. an LV leak check that stops
 * holding true in MV) and `eraItems` groups.
 * `eraOrder` is inherited; `eraResources` and `eraItems` are merged element by element (see ERA_LISTS).
 *
 * Next-version layer: a config outside `tiersDir` (tiers/next/hv.json, `extends: "../hv"`) makes name-based
 * `extends` across its whole chain get looked up in its folder first, so tiers/hv.json ends up inheriting from
 * tiers/next/mv.json. Inside the layer, a file inherits from its current version by path (`"../mv"`), never by name.
 * `io` ({exists, read}) is only changed by the tests, to load config trees in memory.
 */
export function loadTierConfig(o, tiersDir, io = { exists: fs.existsSync, read: readJson }) {
  const file = o.config ? path.resolve(o.config) : path.join(tiersDir, `${o.tier}.json`);
  if (!io.exists(file)) throw new Error(`config ${file} doesn't exist`);
  const overlayDir = path.resolve(path.dirname(file)) !== path.resolve(tiersDir) ? path.dirname(file) : null;
  const loaded = loadFile(file, { overlayDir, stack: [], io }, o.tier);
  // ${orbit:...}, ${place:...}, ${orbits} and ${places}: dimension ids from the pack's tables (lib/places.mjs). `o.tables` is the
  // tables object or folder (tests); by default the pack's own, read only when the config uses a token.
  const tables = o.tables && typeof o.tables === 'object' ? o.tables : () => readPlaceTables(o.tables || defaultTablesDir(tiersDir));
  const raw = resolvePlaceTokens(loaded, tables);
  raw.tier = raw.tier || o.tier;
  return { raw, file };
}

/** pack/kubejs/data/grindless/tables, from tools/analysis/tiers. */
export const defaultTablesDir = (tiersDir) => path.resolve(tiersDir, '..', '..', '..', 'pack', 'kubejs', 'data', 'grindless', 'tables');
