// M9-10: Update-PackIndex -PackDir <copy> and script-order --pack must write only the supplied pack, never the source checkout.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { check, write } from '../script-order.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const body = 'console.log(1)\n';

function snapshot(dir) {
  const out = {};
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out[path.relative(dir, p)] = fs.readFileSync(p, 'latin1');
    }
  };
  walk(dir);
  return out;
}

function twoPacks() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'pack-iso-'));
  const root = path.join(base, 'source');
  const files = {
    'tools/analysis/script_order.json': JSON.stringify({ bands: {} }),
    'pack/pack.toml': 'name = "x"\n',
    'pack/kubejs/server_scripts/a.js': body, // unstamped
    'pack/kubejs/server_scripts/b.js': `// priority: 5\n${body}`, // stale
    'tools/test/overlay/kubejs/server_scripts/o.js': body, // overlay, unstamped
  };
  for (const [rel, text] of Object.entries(files)) {
    const p = path.join(root, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, text);
  }
  const copy = path.join(base, 'copy-pack');
  fs.cpSync(path.join(root, 'pack'), copy, { recursive: true });
  return { base, root, copy };
}

test('script-order write with packDir stamps only the copy (source pack and overlay stay byte-identical)', () => {
  const { root, copy } = twoPacks();
  const before = snapshot(root);
  assert.ok(write(root, { packDir: copy }) > 0);
  assert.deepEqual(snapshot(root), before, 'source checkout untouched');
  assert.match(fs.readFileSync(path.join(copy, 'kubejs/server_scripts/a.js'), 'utf8'), /^\/\/ priority: -?\d+\n/);
  assert.match(fs.readFileSync(path.join(copy, 'kubejs/server_scripts/b.js'), 'utf8'), /^\/\/ priority: -?\d+\n/);
  assert.equal(write(root, { packDir: copy }), 0, 'idempotent');
  assert.deepEqual(check(root, { packDir: copy }).errors, []);
});

test('Update-PackIndex -PackDir <copy> leaves the source checkout byte-identical', (t) => {
  const pwsh = ['pwsh', 'powershell'].find((n) => spawnSync(n, ['-NoProfile', '-Command', 'exit 0']).status === 0);
  if (!pwsh) return t.skip('no PowerShell on this machine');
  const { root, copy } = twoPacks();
  // the real tool runs against the copy; only the scripts of the repo it lives in are the "source"
  const tools = path.join(root, 'tools');
  for (const f of ['Update-PackIndex.ps1']) fs.copyFileSync(path.join(repo, 'tools', f), path.join(tools, f));
  fs.mkdirSync(path.join(tools, 'analysis'), { recursive: true });
  fs.copyFileSync(path.join(repo, 'tools/analysis/script-order.mjs'), path.join(tools, 'analysis/script-order.mjs'));
  const fake = path.join(root, process.platform === 'win32' ? 'packwiz.cmd' : 'packwiz.sh');
  fs.writeFileSync(fake, process.platform === 'win32' ? '@exit /b 0\r\n' : '#!/bin/sh\nexit 0\n');
  fs.chmodSync(fake, 0o755);
  const before = snapshot(root);
  const r = spawnSync(pwsh, ['-NoProfile', '-File', path.join(tools, 'Update-PackIndex.ps1'), '-PackDir', copy, '-Packwiz', fake], {
    encoding: 'utf8', env: { ...process.env, GG_NODE: process.execPath },
  });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.deepEqual(snapshot(root), before, 'source checkout untouched');
  assert.match(fs.readFileSync(path.join(copy, 'kubejs/server_scripts/a.js'), 'utf8'), /^\/\/ priority: -?\d+\n/);
});
