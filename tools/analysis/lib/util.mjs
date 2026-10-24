// Pequeñas utilidades sin dependencias.
import fs from 'node:fs';

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** Convierte un glob simple (`*` y `?`) en RegExp anclada. */
export function globToRegExp(glob) {
  const esc = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  return new RegExp('^' + esc + '$');
}

export function makeGlobMatcher(globs) {
  const exact = new Set();
  const regs = [];
  for (const g of globs || []) {
    if (/[*?]/.test(g)) regs.push(globToRegExp(g));
    else exact.add(g);
  }
  return (s) => exact.has(s) || regs.some((r) => r.test(s));
}

export function asArray(x) {
  if (x === undefined || x === null) return [];
  return Array.isArray(x) ? x : [x];
}

export function sortedEntries(obj) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
}
