// Carga de la configuración de un tier (tiers/<tier>.json) con herencia opcional (`extends`).
import fs from 'node:fs';
import path from 'node:path';
import { readJson } from './util.mjs';

const MERGED_LISTS = ['world', 'machines', 'machinesFromRegistry', 'synthetic', 'toolTags', 'unconditionalTypes', 'ignoreTypes'];
const TARGET_LISTS = ['targets', 'autoTargets', 'targetsFromVeins', 'autoTargetsFromVeins'];
const MERGED_MAPS = ['typeAliases', 'conditions', 'partAbilities'];
// Regla de eras (lib/eras.mjs): siempre se heredan y un elemento del hijo con el mismo id se combina campo a campo con el del
// padre (basta `{"id": "end", "era": "mv"}` para mover un recurso de era). Un elemento nuevo sin `era` es de la era del archivo
// que lo declara (`era` o `tier`).
const ERA_LISTS = ['eraResources', 'eraItems'];
// Listas cuyos elementos tienen identidad: un elemento del hijo con el mismo id sustituye al del padre en vez de duplicarlo.
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
 * Archivo del padre. Un `extends` por nombre (sin barras) se busca primero en la carpeta de la capa (`tiers/next/`) si el análisis
 * empezó en ella y ese archivo no es el que lo pide; si no, junto al archivo que lo pide (como siempre).
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
  if (ctx.stack.includes(resolved)) throw new Error(`herencia circular en las configuraciones: ${[...ctx.stack, resolved].join(' -> ')}`);
  if (!ctx.io.exists(file)) throw new Error(`no existe la configuración ${file}`);
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
  const inherit = raw.inheritTargets ? parent : {};
  for (const k of TARGET_LISTS) raw[k] = mergeList(inherit[k] || [], raw[k] || [], k, raw.dropTargets);
  raw.eraResources = mergeEraList(parent.eraResources || [], raw.eraResources || [], era);
  raw.eraItems = mergeEraList(parent.eraItems || [], raw.eraItems || [], era, raw.dropTargets);
  return raw;
}

/**
 * @param {{tier?: string, config?: string}} o  nombre del tier o ruta explícita a un JSON
 * @param {string} tiersDir carpeta que contiene tiers/<tier>.json
 * @returns {{raw: object, file: string}}
 *
 * Un tier hijo (`extends: "steam"`) añade a las listas del padre y sustituye el resto de campos; con `inheritTargets: true`
 * hereda además los objetivos (targets, autoTargets y los generados desde vetas) del padre. Los mapas (typeAliases,
 * conditions, partAbilities) se combinan clave a clave y gana el hijo. Un elemento del hijo con el mismo id que uno del
 * padre (mundo, máquinas, sintéticas, objetivos) lo sustituye, y `dropTargets: [ids]` quita objetivos heredados que ya no
 * valen en el tier (p. ej. una comprobación de fuga del LV que en MV deja de ser cierta) y grupos de `eraItems`.
 * `eraOrder` se hereda; `eraResources` y `eraItems` se combinan elemento a elemento (ver ERA_LISTS).
 *
 * Capa de la versión siguiente: una configuración fuera de `tiersDir` (tiers/next/hv.json, `extends: "../hv"`) hace que los
 * `extends` por nombre de toda su cadena se busquen antes en su carpeta, así que tiers/hv.json pasa a heredar de
 * tiers/next/mv.json. Dentro de la capa, un archivo hereda de su versión actual con la ruta (`"../mv"`), nunca por nombre.
 * `io` ({exists, read}) solo lo cambian las pruebas, para cargar árboles de configuración en memoria.
 */
export function loadTierConfig(o, tiersDir, io = { exists: fs.existsSync, read: readJson }) {
  const file = o.config ? path.resolve(o.config) : path.join(tiersDir, `${o.tier}.json`);
  if (!io.exists(file)) throw new Error(`no existe la configuración ${file}`);
  const overlayDir = path.resolve(path.dirname(file)) !== path.resolve(tiersDir) ? path.dirname(file) : null;
  const raw = loadFile(file, { overlayDir, stack: [], io }, o.tier);
  raw.tier = raw.tier || o.tier;
  return { raw, file };
}
