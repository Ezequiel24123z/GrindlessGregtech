// Dimension ids from the pack's own tables (LuV, 2026-10-26), so a tier config never hard-codes the ids the travel spikes fix:
// pack/kubejs/data/grindless/tables/orbits.json (`earth`, `dimensions`) and places.json (`surfaces`), the same tables
// startup_scripts/grindless/lib/orbits.js and places.js read.
//
// In any string of a tier config:
//   ${orbit:earth}      the Earth orbit (orbits.json `earth`)
//   ${orbit:<place>}    the orbit of a surface in places.json: the orbits.json dimension named <surface>_orbit
//   ${place:<place>}    a surface in places.json (asteroid_belt, io, europa, ganymede)
// and, as a whole array element, ${orbits} (every orbit) and ${places} (every surface) expand into several elements.
// An unknown name, or a table that can't be read, is a config error: the analysis stops instead of checking the wrong world.
import fs from 'node:fs';
import path from 'node:path';

const TOKEN = /\$\{(orbit|place):([a-z0-9_]+)\}/g;
const LISTS = { '${orbits}': (t) => t.orbits.dimensions, '${places}': (t) => Object.values(t.places.surfaces) };

/** The two tables from a folder (pack/kubejs/data/grindless/tables), validated as the startup scripts validate them. */
export function readPlaceTables(dir) {
  const read = (name) => {
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) throw new Error(`place tables: ${file} doesn't exist`);
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  };
  return checkPlaceTables({ orbits: read('orbits.json'), places: read('places.json') });
}

export function checkPlaceTables(t) {
  const o = t && t.orbits;
  const p = t && t.places;
  if (!o || !Array.isArray(o.dimensions) || o.dimensions.length === 0 || !o.dimensions.includes(o.earth)) {
    throw new Error('place tables: orbits.json needs `dimensions` and an `earth` among them');
  }
  if (!p || !p.surfaces || typeof p.surfaces !== 'object' || Object.keys(p.surfaces).length === 0) {
    throw new Error('place tables: places.json needs `surfaces`');
  }
  return t;
}

function orbitOf(t, name) {
  if (name === 'earth') return t.orbits.earth;
  const surface = t.places.surfaces[name];
  if (!surface) throw new Error(`place tables: \${orbit:${name}}: ${name} isn't a surface in places.json`);
  const orbit = `${surface}_orbit`;
  if (!t.orbits.dimensions.includes(orbit)) throw new Error(`place tables: \${orbit:${name}}: ${orbit} isn't in orbits.json`);
  return orbit;
}

function placeOf(t, name) {
  const id = t.places.surfaces[name];
  if (!id) throw new Error(`place tables: \${place:${name}}: ${name} isn't a surface in places.json`);
  return id;
}

const usesTokens = (x) => (typeof x === 'string' ? x.includes('${') : Array.isArray(x) ? x.some(usesTokens)
  : x && typeof x === 'object' ? Object.values(x).some(usesTokens) : false);

/**
 * Replaces the tokens in a loaded config. `tables` is the tables object ({orbits, places}) or a function returning it, only
 * called when the config uses a token (configs without tokens never read the pack).
 */
export function resolvePlaceTokens(raw, tables) {
  if (!usesTokens(raw)) return raw;
  const t = checkPlaceTables(typeof tables === 'function' ? tables() : tables);
  const str = (s) => s.replace(TOKEN, (_, kind, name) => (kind === 'orbit' ? orbitOf(t, name) : placeOf(t, name)));
  const walk = (x) => {
    if (typeof x === 'string') {
      if (LISTS[x]) throw new Error(`place tables: ${x} only works as an array element`);
      return str(x);
    }
    if (Array.isArray(x)) return x.flatMap((e) => (typeof e === 'string' && LISTS[e] ? [...LISTS[e](t)] : [walk(e)]));
    if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, walk(v)]));
    return x;
  };
  const out = walk(raw);
  const left = JSON.stringify(out).match(/\$\{[^}]*\}/);
  if (left) throw new Error(`place tables: unknown token ${left[0]}`);
  return out;
}
