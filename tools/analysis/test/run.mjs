// Runs all unit tests (*.test.mjs) of the analysis suite and of the quest tools with Node's test runner, without depending on shell globs.
// File names are passed relative to tools/ (cwd) so the command line stays under Windows' 32,767-character limit.
//   node tools/analysis/test/run.mjs [--test-reporter=spec]
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const tools = path.resolve(here, '../..');
const roots = ['analysis/test', 'quests/test'];
const files = roots.flatMap((r) =>
  fs.readdirSync(path.join(tools, r)).filter((f) => f.endsWith('.test.mjs')).sort().map((f) => `${r}/${f}`));
const r = spawnSync(process.execPath, ['--test', ...process.argv.slice(2), ...files], { stdio: 'inherit', cwd: tools });
process.exit(r.status === null ? 1 : r.status);
