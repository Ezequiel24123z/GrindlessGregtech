// Era order check (QR-F5): a recipe that builds a machine, in server_scripts/grindless/<era>/ must not take an item, fluid or research item that is first
// available in a later era. Static, no game.
//   era of the recipe  = eraOfFile(its server script), tier from recipe_quality.json eraTier (tierOfEra); raised to the tier prefix of
//                        its outputs (tierOfId) when a file holds recipes of a higher tier than its folder.
//   era of an input    = the startup-script folder registering it (startup_scripts/grindless/<era>/): our items, blocks, fluids and
//                        the gtceu: materials we register (gtceu:<material>_<form>), mapped through the same eraTier;
//                        every other id (GTM's, other mods') has no known era and is skipped: tier-prefix guesses were too noisy.
//   skipped            = eras without a tier in eraTier (integration, power, lib...), tags, and inputs with no known era.
//   scope              = recipes whose output is a machine (controllers, hatches): the deadlock-prone ones; process recipes mix eras freely.
//   alternatives       = an `any` slot is a violation only when every alternative is later.
// Caught on 5961795f: sic_fibre (UEV) and atom_interferometer (UEV) in UV machines (roots 1, 2), solid_neon_cone (UIV) in
// superfluid_helium_plant and thorium_caf2_crystal in accelerator_driven_reactor (root 3).
import { eraOfFile, tierOfEra, tierOfId } from './recipe_quality.mjs';
import { parseRecipes } from './recipe_cycles.mjs';

// Exceptions by input id -> one-line reason. Registration placement only: each item is made by an earlier machine with no dimension
// or site lock, so the uv/uhv recipes that take it are reachable in their era. Remove an entry if its producer moves later.
export const ALLOW = {
  'grindless:fused_silica_tube': 'registered in uev/earth_orbit.js; made by the plain GTM EBF at UV voltage, 3600 K, no orbit lock (tables/earth_orbit.json:80)',
  'grindless:iron_tube': 'registered in uhv/mercury.js; made by the GTM extruder at HV with a tiny pipe mold (server uhv/mercury.js:78)',
  'grindless:sporosarcina_culture': 'registered in uhv/proxima_life.js; made by the LuV biofoundry, circuit 16, at IV voltage (tables/biofoundry.json:159)',
};

const STARTUP_ERA = /startup_scripts\/grindless\/([a-z_]+)\//;
const startupEra = (file) => (STARTUP_ERA.exec(String(file || '').replace(/\\/g, '/')) || [])[1] || null;

export function eraOrderViolations({ dump, run }, cfg) {
  const reg = run.registry;
  const ourEra = new Map();
  for (const m of [reg.items, reg.blocks, reg.fluids]) for (const [id, e] of m || []) if (startupEra(e.file)) ourEra.set(id, startupEra(e.file));
  const matEra = new Map();
  for (const [id, m] of reg.materials || []) if (startupEra(m.file)) matEra.set(String(id).replace(/^gtceu:/, ''), startupEra(m.file));
  const eraOf = (id) => {
    if (ourEra.has(id)) return ourEra.get(id);
    const [ns, tail] = id.split(/:(.*)/);
    if (ns !== 'gtceu') return null;
    for (let i = tail.lastIndexOf('_'); i > 0; i = tail.lastIndexOf('_', i - 1)) if (matEra.has(tail.slice(0, i))) return matEra.get(tail.slice(0, i));
    return matEra.get(tail) || null;
  };
  const tierOfInput = (id) => { const e = eraOf(id); return e ? tierOfEra(e, cfg) : null; };
  const out = [];
  for (const p of parseRecipes([...dump.recipes.values()])) {
    const era = eraOfFile(run.recipeFiles.get(p.id));
    if (!p.outs.some((o) => dump.machines.has(o))) continue; // only recipes that build a machine
    const fileTier = era === null ? null : tierOfEra(era, cfg);
    if (fileTier === null) continue;
    const tier = Math.max(fileTier, ...p.outs.map((o) => tierOfId(o) ?? -1)); // a low-era file may hold e.g. uev_wireless_* recipes

    const slots = [...p.ins.map((i) => (i.one ? [i.one] : i.any)), ...p.fins.map((f) => f.map((x) => ({ fluid: x })))];
    for (const alts of slots) {
      const ts = alts.map((o) => (o.item ? tierOfInput(o.item) : o.fluid ? tierOfInput(o.fluid.replace(/^f:/, '')) : null));
      if (ts.length === 0 || ts.some((t) => t === null || t <= tier)) continue;
      const id = alts[0].item || alts[0].fluid;
      if (ALLOW[id]) continue;
      out.push({ recipe: p.id, era, input: id, inputEra: eraOf(id.replace(/^f:/, '')) });
    }
  }
  return out.sort((a, b) => (a.recipe + a.input).localeCompare(b.recipe + b.input));
}
