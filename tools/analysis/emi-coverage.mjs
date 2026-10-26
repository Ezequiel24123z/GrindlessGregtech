// EMI coverage audit (lib/emi_coverage.mjs): every item, block item, fluid and machine the pack registers must show in EMI how it is
// obtained and, unless it is an end product, what it is for.
//
//   node tools/analysis/emi-coverage.mjs [--pack pack] [--dump <native dump dir>] [--json out.json] [--expect file] [--quiet]
//
// Without --dump the recipes come from the pack's own scripts run in the static KubeJS stand-in (lib/kubejs_static.mjs): no
// Minecraft, what the Node test suite runs. With --dump the recipes are a native server dump's (gg_dump.js), which also has what the
// scripts derive from the mods' recipes, and the declared derived routes are checked against it. --expect writes the list the
// native client fixture asks EMI about (tools/test/overlay/kubejs/config/gg_test_emi_coverage_expect.json).
// Exit code: 0 no gaps and no problems, 1 gaps or problems, 2 tool failure.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDump } from './lib/dump.mjs';
import { staticDump } from './lib/kubejs_static.mjs';
import { auditEmiCoverage, fixtureExpectations, loadEmiData, renderCoverageText, renderExpectations } from './lib/emi_coverage.mjs';
import { readJson } from './lib/util.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_CONFIG = path.join(here, 'emi_coverage.json');
export const DEFAULT_PACK = path.resolve(here, '..', '..', 'pack');
export const DEFAULT_EXPECT = path.resolve(here, '..', 'test', 'overlay', 'kubejs', 'config', 'gg_test_emi_coverage_expect.json');

/** The whole audit: {res, run, dump}. */
export function runCoverage({ pack = DEFAULT_PACK, dumpDir = null, config = DEFAULT_CONFIG } = {}) {
  const { dump: sdump, run } = staticDump(pack);
  const dump = dumpDir ? loadDump(dumpDir, { log: null }) : sdump;
  if (dumpDir) {
    // the native dump carries no structures of a newer pack, and only the tags a recipe uses: keep the stand-in's (the patterns and
    // the tags come from the same scripts)
    for (const [k, v] of sdump.structures) if (!dump.structures.has(k)) dump.structures.set(k, v);
    for (const [t, ids] of sdump.tags.itemTags) if (!dump.tags.itemTags.has(t)) dump.tags.itemTags.set(t, ids);
    for (const [t, ids] of sdump.tags.fluidTags) if (!dump.tags.fluidTags.has(t)) dump.tags.fluidTags.set(t, ids);
  }
  const res = auditEmiCoverage({ dump, registry: run.registry, cfg: readJson(config), emi: loadEmiData(pack), lang: run.lang, native: !!dumpDir });
  res.standInErrors = run.errors;
  return { res, run, dump };
}

function main(argv) {
  const opt = { pack: DEFAULT_PACK, dumpDir: null, json: null, expect: null, quiet: false, config: DEFAULT_CONFIG };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--pack') opt.pack = path.resolve(argv[++i]);
    else if (a === '--dump') opt.dumpDir = path.resolve(argv[++i]);
    else if (a === '--json') opt.json = path.resolve(argv[++i]);
    else if (a === '--config') opt.config = path.resolve(argv[++i]);
    else if (a === '--expect') opt.expect = argv[i + 1] && !argv[i + 1].startsWith('--') ? path.resolve(argv[++i]) : DEFAULT_EXPECT;
    else if (a === '--quiet') opt.quiet = true;
    else {
      process.stderr.write(`unknown option ${a}\n`);
      return 2;
    }
  }
  const { res } = runCoverage(opt);
  if (!opt.quiet) process.stdout.write(renderCoverageText(res) + '\n');
  else process.stdout.write(`EMI coverage: ${res.counts.audited} audited, ${res.gaps.length} gaps, ${res.problems.length} problems\n`);
  if (opt.json) fs.writeFileSync(opt.json, JSON.stringify(res, null, 2));
  if (opt.expect) {
    fs.writeFileSync(opt.expect, renderExpectations(fixtureExpectations(res)));
    process.stdout.write(`wrote ${path.relative(process.cwd(), opt.expect)}\n`);
  }
  return res.gaps.length === 0 && res.problems.length === 0 ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (e) {
    process.stderr.write(String(e && e.stack ? e.stack : e) + '\n');
    process.exitCode = 2;
  }
}
