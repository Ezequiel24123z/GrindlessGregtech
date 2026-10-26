// Spike S0-3 and the Io-orbit slot (LuV-B7) for the quest generators: the packages the LuV data files (luv-chapter/quests-data.mjs,
// processing-lines/pl-data-luv.mjs and power-data.mjs) add to their hand-listed LANDED sets. Read from
// pack/kubejs/data/grindless/tables/stations.json with the rule of pack/kubejs/startup_scripts/grindless/lib/stations.js, so the
// book names only the machine the pack registers:
//   mode 'sulfur_iodine'  second is null: the Io sulfur-iodine plant (B7S)
//        'tether'         enabled and second is Io orbit (IO_ORBIT; any other second orbit is refused): the flux-tube tether (B7T)
//        'pending'        stations off and second set: S0-3 has not concluded, neither machine
//   S03                   enabled is true: the stations themselves (Earth orbit and what needs its products)
// B7T and B7S never come together. After the table flips, regenerate the chapters (docs/quests.md, section 14).
//
// Tests inject a table with GG_STATIONS_TABLE: a path to a JSON file, or the JSON text itself (it starts with "{").
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const TABLES = path.join(REPO, 'pack', 'kubejs', 'data', 'grindless', 'tables');
export const STATIONS_FILE = path.join(TABLES, 'stations.json');
// the slot's second station (lib/stations.js's IO_ORBIT)
export const IO_ORBIT = 'grindless:io_orbit';

// the orbits lib/orbits.js accepts (tables/orbits.json)
function orbits() {
  return JSON.parse(fs.readFileSync(path.join(TABLES, 'orbits.json'), 'utf8')).dimensions || [];
}

// lib/stations.js's checks and mode
export function stationsMode(table) {
  if (!table || typeof table.enabled !== 'boolean' || typeof table.first !== 'string') throw new Error('invalid stations table');
  const known = orbits();
  if (!known.includes(table.first)) throw new Error('first is not an orbit of tables/orbits.json: ' + table.first);
  const second = table.second === undefined ? null : table.second;
  if (second !== null && (typeof second !== 'string' || !known.includes(second) || second === table.first)) {
    throw new Error('second must be null or another orbit of tables/orbits.json: ' + second);
  }
  return second === null ? 'sulfur_iodine' : second !== IO_ORBIT ? fail() : table.enabled ? 'tether' : 'pending';
  function fail() { throw new Error('second must be null or ' + IO_ORBIT + ': ' + second); }
}

// the packages the table lands: S03, and B7T or B7S
export function stationPackages(table) {
  const mode = stationsMode(table);
  return [
    ...(table.enabled === true ? ['S03'] : []),
    ...(mode === 'tether' ? ['B7T'] : mode === 'sulfur_iodine' ? ['B7S'] : []),
  ];
}

// the table: injected (a path or JSON text), or the pack's
export function readStations(source = process.env.GG_STATIONS_TABLE || STATIONS_FILE) {
  const text = String(source).trim().startsWith('{') ? String(source) : fs.readFileSync(source, 'utf8');
  return JSON.parse(text);
}

export const STATIONS = readStations();
export const MODE = stationsMode(STATIONS);
export const STATION_PACKAGES = stationPackages(STATIONS);
