// KubeJS's Rhino leaves Math.PI undefined (.github/instructions/kubejs.instructions.md): code that uses it silently becomes NaN, so a
// structure drawn from angles loses its cells in game (hatch ports, magnets, spokes) while Node, where the static checks run, draws it
// whole. Batch 16 found four shape files hit by it (the Mk5's hatches were missing in the dump). Pack scripts write the literal instead.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const kube = path.resolve(here, '..', '..', '..', 'pack', 'kubejs');

function* scripts(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* scripts(p);
    else if (e.name.endsWith('.js')) yield p;
  }
}

test('no pack script uses Math.PI in code (undefined in KubeJS Rhino)', () => {
  const bad = [];
  for (const top of ['startup_scripts', 'server_scripts', 'client_scripts']) {
    const dir = path.join(kube, top);
    if (!fs.existsSync(dir)) continue;
    for (const f of scripts(dir)) {
      const code = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      if (/\bMath\.PI\b/.test(code)) bad.push(path.relative(kube, f).replace(/\\/g, '/'));
    }
  }
  assert.deepEqual(bad, []);
});
