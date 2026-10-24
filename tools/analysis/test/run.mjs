// Lanza todas las pruebas (*.test.mjs) con el ejecutor de Node, sin depender de globs del shell ni de la versión.
//   node tools/analysis/test/run.mjs [--test-reporter=spec]
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.test.mjs')).sort().map((f) => path.join(dir, f));
const r = spawnSync(process.execPath, ['--test', ...process.argv.slice(2), ...files], { stdio: 'inherit' });
process.exit(r.status === null ? 1 : r.status);
