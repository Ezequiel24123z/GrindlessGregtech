// T2 log baseline (AF-K2, audit M8-12): every WARN and ERROR line the pack's own scripts write must be a known one, and the known list only shrinks.
//   node tools/analysis/log-baseline.mjs --log <kubejs log> [--log <more>] [--static] [--pack <dir>] [--init]
//   --log     a KubeJS log (kubejs/logs/{startup,server,client}.log of a bench run, '[hh:mm:ss] [WARN] file#line: text'); only lines of the
//             pack's scripts (file under grindless/) at WARN or ERROR are read. Lines are normalised: the time, the script line and numbers go.
//   --static  also run the T0 stand-in (lib/kubejs_static.mjs) and take its console.error and console.warn lines, under their own key.
//   --init    write log_known.json from what was read now (the first seed, or a deliberate re-baseline by the integrator).
// Exit 1: a line that is not in log_known.json (fix the script, or the integrator adds it with the reason). Lines in the file that no
// longer appear are listed as 'gone' (delete them: the list only shrinks) but do not fail. Exit 2: tool failure.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from './lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const KNOWN = path.join(here, 'log_known.json');
const args = process.argv.slice(2);
const values = (flag) => args.flatMap((a, i) => (a === flag && args[i + 1] ? [args[i + 1]] : []));
const pack = values('--pack')[0] ? path.resolve(values('--pack')[0]) : path.join(here, '..', '..', 'pack');

export const normalise = (text) => String(text).replace(/\s+/g, ' ').replace(/\d+(?:\.\d+)?/g, '#').trim().slice(0, 240);

/** WARN and ERROR lines of the pack's own scripts in a KubeJS log. */
export function pickLog(text) {
  const out = new Set();
  for (const raw of String(text).split(/\r?\n/)) {
    const m = /^\[[\d:]+\]\s+\[(WARN|ERROR)\]\s+(\S+?)(?:#\d+)?:\s+(.*)$/.exec(raw);
    if (!m || !/(^|\/)grindless\//.test(m[2])) continue;
    out.add(m[1] + ' ' + m[2].replace(/^.*?(grindless\/)/, '$1') + ': ' + normalise(m[3]));
  }
  return out;
}

/** console.error and console.warn lines the T0 stand-in collected. */
export function pickStatic(run) {
  const out = new Set();
  for (const l of run.logs) {
    if (l.level !== 'warn' && l.level !== 'error') continue;
    out.add(l.level.toUpperCase() + ' ' + String(l.file).replace(/^.*?(grindless\/)/, '$1') + ': ' + normalise(l.text));
  }
  return out;
}

export function compare(found, known) {
  const knownSet = new Set(known);
  return {
    unknown: [...found].filter((l) => !knownSet.has(l)).sort(),
    gone: [...knownSet].filter((l) => !found.has(l)).sort(),
  };
}

function main() {
  const logs = values('--log');
  const wantStatic = args.includes('--static');
  if (logs.length === 0 && !wantStatic) {
    console.log('log-baseline: give --log <file> and/or --static');
    process.exit(2);
  }
  const found = { log: new Set(), static: new Set() };
  for (const f of logs) {
    if (!fs.existsSync(f)) { console.log('log-baseline: no such log ' + f); process.exit(2); }
    for (const l of pickLog(fs.readFileSync(f, 'utf8'))) found.log.add(l);
  }
  if (wantStatic) found.static = pickStatic(runPackScripts(pack));
  const known = fs.existsSync(KNOWN) ? JSON.parse(fs.readFileSync(KNOWN, 'utf8')) : { log: [], static: [] };
  if (args.includes('--init')) {
    const next = { log: logs.length ? [...found.log].sort() : known.log || [], static: wantStatic ? [...found.static].sort() : known.static || [] };
    fs.writeFileSync(KNOWN, JSON.stringify(next, null, 2) + '\n');
    console.log('log-baseline: wrote ' + next.log.length + ' log and ' + next.static.length + ' static lines to log_known.json');
    return;
  }
  let failed = false;
  for (const key of ['log', 'static']) {
    if (key === 'log' ? logs.length === 0 : !wantStatic) continue;
    const { unknown, gone } = compare(found[key], known[key] || []);
    console.log((unknown.length ? 'FAIL ' : 'ok   ') + key + ': ' + found[key].size + ' lines, ' + unknown.length + ' new, ' + gone.length + ' gone');
    for (const l of unknown.slice(0, 12)) console.log('     new:  ' + l);
    if (unknown.length > 12) console.log('     ... ' + (unknown.length - 12) + ' more');
    for (const l of gone.slice(0, 12)) console.log('     gone: ' + l);
    if (unknown.length) failed = true;
  }
  process.exit(failed ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (e) { console.log('log-baseline: tool failure: ' + String(e && e.message ? e.message : e).slice(0, 200)); process.exit(2); }
}
