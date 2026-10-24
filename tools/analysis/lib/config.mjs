// Carga de la configuración de un tier (tiers/<tier>.json) con herencia opcional (`extends`).
import fs from 'node:fs';
import path from 'node:path';
import { readJson } from './util.mjs';

const MERGED_LISTS = ['world', 'machines', 'machinesFromRegistry', 'synthetic', 'toolTags', 'unconditionalTypes', 'ignoreTypes'];
const TARGET_LISTS = ['targets', 'autoTargets', 'targetsFromVeins', 'autoTargetsFromVeins'];
const MERGED_MAPS = ['typeAliases', 'conditions', 'partAbilities'];
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

/**
 * @param {{tier?: string, config?: string}} o  nombre del tier o ruta explícita a un JSON
 * @param {string} tiersDir carpeta que contiene tiers/<tier>.json
 * @returns {{raw: object, file: string}}
 *
 * Un tier hijo (`extends: "steam"`) añade a las listas del padre y sustituye el resto de campos; con `inheritTargets: true`
 * hereda además los objetivos (targets, autoTargets y los generados desde vetas) del padre. Los mapas (typeAliases,
 * conditions, partAbilities) se combinan clave a clave y gana el hijo. Un elemento del hijo con el mismo id que uno del
 * padre (mundo, máquinas, sintéticas, objetivos) lo sustituye, y `dropTargets: [ids]` quita objetivos heredados que ya no
 * valen en el tier (p. ej. una comprobación de fuga del LV que en MV deja de ser cierta).
 */
export function loadTierConfig(o, tiersDir) {
  const file = o.config ? path.resolve(o.config) : path.join(tiersDir, `${o.tier}.json`);
  if (!fs.existsSync(file)) throw new Error(`no existe la configuración ${file}`);
  const raw = readJson(file);
  if (raw.extends) {
    const parent = loadTierConfig({ config: path.join(path.dirname(file), `${raw.extends}.json`) }, tiersDir).raw;
    for (const k of MERGED_LISTS) raw[k] = mergeList(parent[k] || [], raw[k] || [], k);
    for (const k of MERGED_MAPS) raw[k] = { ...(parent[k] || {}), ...(raw[k] || {}) };
    raw.fluidContainers = raw.fluidContainers || parent.fluidContainers;
    const inherit = raw.inheritTargets ? parent : {};
    for (const k of TARGET_LISTS) raw[k] = mergeList(inherit[k] || [], raw[k] || [], k, raw.dropTargets);
  }
  raw.tier = raw.tier || o.tier;
  return { raw, file };
}
