// Packages of an era that land one at a time (LuV, 2026-10-26): a tier config names them and tags the elements that need them, so the
// validator can carry the whole era's design while some packages are still being built.
//
//   packages: { "<id>": { label, landedWhen: [ids], landedWhenAny: [ids], landedWhenAbsent: [ids], note } }
//     landedWhen   what the dump must carry for the package to count as landed: item or machine ids, `fluid:<id>`, or
//                  `recipe:<id>` (a recipe id). Every one must be there; an empty list means it has always landed.
//     landedWhenAny  at least one of these must be there (a slot with two designs: the tether or the sulfur–iodine plant).
//     landedWhenAbsent  none of these may be there (a package whose mark is a cut: the Mk1's transmutations).
//   any element of targets, autoTargets, machines, eraItems, eraResources, world, synthetic, targetsFromVeins or
//   autoTargetsFromVeins may carry `package: "<id>"` or `package: ["<id>", ...]` (it needs all of them).
//
// While a package is pending (the dump lacks something it lists):
//   - targets and autoTargets become optional (WARN, labelled "[pending <id>]"): they are listed as missing, not failed;
//   - machines become optional (no registry or structure warnings), eraItems groups and eraResources too;
//   - world entries, synthetics and the vein-generated targets are left out (their veins and items don't exist yet).
// Once the dump carries the package, every element tagged with it is required again, with no edit to the config.
import { asArray } from './util.mjs';

const OPTIONAL_LISTS = ['targets', 'autoTargets', 'machines', 'eraItems', 'eraResources'];
const DROPPED_LISTS = ['world', 'synthetic', 'targetsFromVeins', 'autoTargetsFromVeins'];

function present(dump, id) {
  if (id.startsWith('recipe:')) return dump.recipes.has(id.slice(7));
  if (id.startsWith('fluid:')) return dump.fluids.has(id.slice(6));
  return dump.items.has(id) || dump.machines.has(id);
}

/**
 * @returns {{raw: object, packages: Array<{id, label, landed, missing}>, warnings: string[]}} a copy of the config with the
 *   pending packages' elements made optional or left out.
 */
export function applyPackages(raw, dump) {
  const decl = raw.packages || {};
  const warnings = [];
  const packages = Object.entries(decl).map(([id, p]) => {
    const missing = asArray(p && p.landedWhen).filter((x) => !present(dump, x));
    const any = asArray(p && p.landedWhenAny);
    if (any.length > 0 && !any.some((x) => present(dump, x))) missing.push(`one of ${any.join(' | ')}`);
    for (const x of asArray(p && p.landedWhenAbsent)) if (present(dump, x)) missing.push(`no ${x} (still there)`);
    return { id, label: (p && p.label) || id, landed: missing.length === 0, missing };
  });
  const byId = new Map(packages.map((p) => [p.id, p]));
  const hasTagged = OPTIONAL_LISTS.concat(DROPPED_LISTS).some((k) => asArray(raw[k]).some((e) => e && e.package !== undefined));
  if (packages.length === 0 && !hasTagged) return { raw, packages, warnings };
  const pendingOf = (e, where) => {
    const ids = asArray(e.package);
    const out = [];
    for (const id of ids) {
      const p = byId.get(id);
      if (!p) warnings.push(`${where}: package «${id}» isn't declared in the config's packages`);
      else if (!p.landed) out.push(id);
    }
    return out;
  };
  const nameOf = (e) => e.id || e.idPrefix || e.machine || '?';
  const out = { ...raw };
  for (const k of OPTIONAL_LISTS) {
    if (!Array.isArray(raw[k])) continue;
    out[k] = raw[k].map((e) => {
      if (!e || e.package === undefined) return e;
      const pending = pendingOf(e, `${k} ${nameOf(e)}`);
      if (pending.length === 0) return e;
      const tag = `[pending ${pending.join(', ')}] `;
      const x = { ...e, optional: true, pending };
      if (k === 'targets' || k === 'autoTargets' || k === 'eraItems' || k === 'eraResources') x.label = tag + (e.label || e.id);
      return x;
    });
  }
  for (const k of DROPPED_LISTS) {
    if (!Array.isArray(raw[k])) continue;
    out[k] = raw[k].filter((e) => !e || e.package === undefined || pendingOf(e, `${k} ${nameOf(e)}`).length === 0);
  }
  return { raw: out, packages, warnings };
}
