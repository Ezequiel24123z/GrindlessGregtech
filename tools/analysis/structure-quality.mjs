// Shape quality of the pack's multiblocks (rubric: docs/quality/structures.md).
//   node tools/analysis/structure-quality.mjs [--dump <dir> | --static] [--top N] [--json] [--check] [--write-baseline]
// Source: a server dump's structures.json (--dump, default: the dir in tools/analysis/out/latest.txt) or the pack's scripts run
// in Node (--static, what T0 uses). --check compares with tools/analysis/structure_quality.json and fails (exit 1) only on
// new or worsened violations. --write-baseline rewrites that file (integrator, when a redesign lands).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeAll, baselineEntry, compare, renderReport } from './lib/structure_quality.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..', '..');
const packDir = path.join(repo, 'pack');
const baselineFile = path.join(here, 'structure_quality.json');
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };

export async function loadStructures(argv) {
  const has = (n) => argv.includes(n);
  const dumpDir = (() => { const i = argv.indexOf('--dump'); return i >= 0 ? argv[i + 1] : null; })();
  if (has('--static') || (!dumpDir && !fs.existsSync(path.join(here, 'out', 'latest.txt')))) {
    const { runPackScripts } = await import('./lib/kubejs_static.mjs');
    return runPackScripts(packDir).docs.structures.structures;
  }
  const dir = dumpDir || fs.readFileSync(path.join(here, 'out', 'latest.txt'), 'utf8').trim().split(/\r?\n/)[0];
  return JSON.parse(fs.readFileSync(path.join(dir, 'structures.json'), 'utf8')).structures;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const structures = await loadStructures(args);
  const analysis = analyzeAll(structures, packDir);
  if (args.includes('--write-baseline')) {
    const base = {};
    for (const [id, a] of Object.entries(analysis)) base[id] = baselineEntry(a);
    fs.writeFileSync(baselineFile, JSON.stringify(base, null, 1) + '\n');
    console.log(`baseline written: ${Object.keys(base).length} structures`);
  } else if (args.includes('--json')) {
    console.log(JSON.stringify(analysis, null, 1));
  } else if (args.includes('--check')) {
    const base = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
    const problems = compare(analysis, base);
    console.log(`structure-quality: ${Object.keys(analysis).length} structures, ${problems.length} new or worsened violations`);
    problems.slice(0, 20).forEach((p) => console.log('  ' + p));
    process.exit(problems.length ? 1 : 0);
  } else {
    console.log(renderReport(analysis, { top: Number(opt('--top')) || 25 }));
  }
}
