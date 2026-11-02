// Process audit CLI (lib/process_audit.mjs): what of ours is uncraftable, useless, unexplained or dishonest.
//
//   node tools/analysis/process-audit.mjs [--dump <dir>] [--registry <file>] [--json out.json] [--write-baseline] [--seed-baseline "<reason>"] [--quiet]
//   node tools/analysis/process-audit.mjs --make-registry [file]    (runs the static KubeJS stand-in, about 6 minutes, and caches its registry)
//
// --dump defaults to the line in tools/analysis/out/latest.txt; --registry to tools/analysis/out/registry.json (gitignored).
// Exit code: 0 no new or stale findings against tools/analysis/process_audit.json, 1 new or stale findings, 2 tool failure or missing inputs.
// --write-baseline only removes fixed keys (it refuses new findings); --seed-baseline "<reason>" is the explicit way to add.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDump } from './lib/dump.mjs';
import { loadEmiData } from './lib/emi_coverage.mjs';
import { auditProcesses, newFindings, questRewards, renderAuditText } from './lib/process_audit.mjs';
import { readJson } from './lib/util.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PACK = path.resolve(here, '..', '..', 'pack');
export const DEFAULT_BASELINE = path.join(here, 'process_audit.json');
export const DEFAULT_REGISTRY = path.join(here, 'out', 'registry.json');
const LATEST = path.join(here, 'out', 'latest.txt');

/** Writes the cached registry of the static stand-in (slow: it runs every script of the pack). */
export async function makeRegistry(file = DEFAULT_REGISTRY, pack = DEFAULT_PACK) {
  const { runPackScripts } = await import('./lib/kubejs_static.mjs');
  const run = runPackScripts(pack);
  const R = run.registry;
  const o = {
    items: [...R.items.values()], fluids: [...R.fluids.values()], blocks: [...R.blocks.values()], machines: [...R.machines.values()],
    recipeTypes: [...R.recipeTypes.values()], materials: [...R.materials.values()], modifiedMaterials: [...R.modifiedMaterials],
    lang: run.lang,
  };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(o));
  return o;
}

/** Items the obtain rules take from the world, mobs or quests: tiers/obtain.json's world sources. */
export function worldItemsOf(obtainFile = path.join(here, 'tiers', 'obtain.json')) {
  const out = new Set();
  const j = readJson(obtainFile);
  for (const w of (j.obtain && j.obtain.world) || []) for (const i of w.items || []) out.add(i);
  return out;
}

export function runAudit({ dumpDir, registryFile = DEFAULT_REGISTRY, pack = DEFAULT_PACK } = {}) {
  const dump = loadDump(dumpDir, { log: null });
  const registry = readJson(registryFile);
  const cfg = fs.existsSync(DEFAULT_BASELINE) ? readJson(DEFAULT_BASELINE).options || {} : {};
  const coverage = readJson(path.join(here, 'emi_coverage.json'));
  const endProducts = coverage.endProducts || {};
  const res = auditProcesses({ dump, registry, cfg, emi: loadEmiData(pack), endProducts, pendingUses: coverage.pendingUses || [], worldItems: worldItemsOf(), rewards: questRewards(pack), packDir: pack });
  return { res, dump, registry };
}

/**
 * The baseline after `--write-baseline` (only shrinks: a finding absent from the old keys and pending lists is refused, so a new
 * defect cannot be baselined by regeneration) or `--seed-baseline "<reason>"` (the explicit, reasoned way to add; the reason is
 * kept in the file). Returns the new document, or {error}.
 */
export function rewriteBaseline(res, baseline, seedReason = null) {
  const old = new Set([...(baseline.keys || []), ...(baseline.pending || [])]);
  const added = res.findings.filter((f) => !old.has(f.key)).map((f) => f.key);
  if (added.length > 0 && !seedReason) {
    return { error: `refused: ${added.length} findings are new against the baseline (it only shrinks), e.g. ${added.slice(0, 5).join(', ')}. Fix them; an owner-approved seeding uses --seed-baseline "<reason>".` };
  }
  const now = new Set(res.findings.map((f) => f.key));
  const doc = {
    format: 'gg-process-audit-1',
    _comment: 'Findings of tools/analysis/process-audit.mjs known when P8-A refreshed it; the audit fails on keys listed in neither list and on listed keys that no longer occur. The list only shrinks: remove a key when its finding is fixed (--write-baseline); adding needs --seed-baseline "<reason>". pending: findings of packages still in flight. options.ignore: globs of ids the audit skips.',
    options: baseline.options || { ignore: [] },
    counts: res.counts,
    keys: [...(baseline.keys || []).filter((k) => now.has(k)), ...added].sort(),
    pending: (baseline.pending || []).filter((k) => now.has(k)),
  };
  if (added.length > 0) doc.seeded = [...(baseline.seeded || []), { reason: seedReason, keys: added.length }];
  else if (baseline.seeded) doc.seeded = baseline.seeded;
  return doc;
}

/** Baseline keys (keys and pending) whose finding no longer occurs. */
export function staleKeys(res, baseline) {
  const now = new Set(res.findings.map((f) => f.key));
  return [...((baseline && baseline.keys) || []), ...((baseline && baseline.pending) || [])].filter((k) => !now.has(k));
}

async function main(argv) {
  const opt = { dump: null, registry: DEFAULT_REGISTRY, json: null, write: false, seed: null, quiet: false, make: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dump') opt.dump = path.resolve(argv[++i]);
    else if (a === '--registry') opt.registry = path.resolve(argv[++i]);
    else if (a === '--json') opt.json = path.resolve(argv[++i]);
    else if (a === '--write-baseline') opt.write = true;
    else if (a === '--seed-baseline') opt.seed = argv[++i] || '';
    else if (a === '--quiet') opt.quiet = true;
    else if (a === '--make-registry') opt.make = argv[i + 1] && !argv[i + 1].startsWith('--') ? path.resolve(argv[++i]) : DEFAULT_REGISTRY;
    else {
      process.stderr.write(`unknown option ${a}\n`);
      return 2;
    }
  }
  if (opt.make) {
    await makeRegistry(opt.make);
    process.stdout.write(`registry written to ${opt.make}\n`);
    return 0;
  }
  if (!opt.dump && fs.existsSync(LATEST)) opt.dump = fs.readFileSync(LATEST, 'utf8').trim();
  if (!opt.dump || !fs.existsSync(opt.registry)) {
    process.stderr.write('needs a dump (--dump or tools/analysis/out/latest.txt) and a registry (--registry or --make-registry)\n');
    return 2;
  }
  const { res } = runAudit({ dumpDir: opt.dump, registryFile: opt.registry });
  const baseline = fs.existsSync(DEFAULT_BASELINE) ? readJson(DEFAULT_BASELINE) : { keys: [] };
  if (opt.write || opt.seed) {
    const doc = rewriteBaseline(res, baseline, opt.seed);
    if (doc.error) {
      process.stderr.write(doc.error + '\n');
      return 1;
    }
    fs.writeFileSync(DEFAULT_BASELINE, JSON.stringify(doc, null, 1) + '\n');
    process.stdout.write(`baseline written: ${doc.keys.length} keys, ${(doc.pending || []).length} pending\n`);
    return 0;
  }
  const fresh = newFindings(res, baseline);
  const stale = staleKeys(res, baseline);
  process.stdout.write((opt.quiet ? `Process audit: ${res.findings.length} findings, ${fresh.length} new, ${stale.length} stale` : renderAuditText(res, baseline)) + '\n');
  for (const k of stale.slice(0, 15)) process.stdout.write(`  STALE ${k} (fixed: remove it with --write-baseline)\n`);
  if (opt.json) fs.writeFileSync(opt.json, JSON.stringify(res.findings, null, 1));
  return fresh.length > 0 || stale.length > 0 ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((c) => process.exit(c), (e) => { process.stderr.write(String(e && e.stack || e) + '\n'); process.exit(2); });
}
