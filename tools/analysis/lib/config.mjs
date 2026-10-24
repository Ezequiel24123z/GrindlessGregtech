// Carga de la configuración de un tier (tiers/<tier>.json) con herencia opcional (`extends`).
import fs from 'node:fs';
import path from 'node:path';
import { readJson } from './util.mjs';

const MERGED_LISTS = ['world', 'machines', 'machinesFromRegistry', 'synthetic', 'toolTags', 'unconditionalTypes', 'ignoreTypes'];

/**
 * @param {{tier?: string, config?: string}} o  nombre del tier o ruta explícita a un JSON
 * @param {string} tiersDir carpeta que contiene tiers/<tier>.json
 * @returns {{raw: object, file: string}}
 *
 * Un tier hijo (`extends: "steam"`) añade a las listas del padre y sustituye el resto de campos; con `inheritTargets: true`
 * hereda además los objetivos (targets y autoTargets) del padre.
 */
export function loadTierConfig(o, tiersDir) {
  const file = o.config ? path.resolve(o.config) : path.join(tiersDir, `${o.tier}.json`);
  if (!fs.existsSync(file)) throw new Error(`no existe la configuración ${file}`);
  const raw = readJson(file);
  if (raw.extends) {
    const parent = loadTierConfig({ config: path.join(path.dirname(file), `${raw.extends}.json`) }, tiersDir).raw;
    for (const k of MERGED_LISTS) raw[k] = [...(parent[k] || []), ...(raw[k] || [])];
    raw.typeAliases = { ...(parent.typeAliases || {}), ...(raw.typeAliases || {}) };
    raw.conditions = { ...(parent.conditions || {}), ...(raw.conditions || {}) };
    raw.fluidContainers = raw.fluidContainers || parent.fluidContainers;
    const inherit = raw.inheritTargets ? parent : {};
    raw.targets = [...(inherit.targets || []), ...(raw.targets || [])];
    raw.autoTargets = [...(inherit.autoTargets || []), ...(raw.autoTargets || [])];
  }
  raw.tier = raw.tier || o.tier;
  return { raw, file };
}
