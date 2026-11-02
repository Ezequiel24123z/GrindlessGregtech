import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pwsh = spawnSync('pwsh', ['-NoProfile', '-Command', '1'], { encoding: 'utf8' }).status === 0;
const posix = process.platform !== 'win32';
const read = (...p) => fs.readFileSync(path.join(repo, ...p), 'utf8');
const ps = (args, opts = {}) => spawnSync('pwsh', ['-NoProfile', '-File', ...args], { encoding: 'utf8', cwd: repo, ...opts });

test('release tools: packwiz and bootstrap are pinned by digest, not by a moving branch', () => {
  const gp = read('tools', 'Get-Packwiz.ps1');
  assert.doesNotMatch(gp, /workflows\/go\/main/, 'Get-Packwiz must not follow main');
  assert.match(gp, /actions\/runs\/\$runId/);
  assert.match(gp, /\$sha256 = '[0-9A-F]{64}'/);
  assert.match(gp, /digest mismatch/);
  const bp = read('tools', 'prism', 'Build-PrismInstance.ps1');
  assert.match(bp, /\$bootSha256 = '[0-9A-F]{64}'/);
  assert.match(bp, /digest mismatch/);
});

test('release tools: the bundled bootstrap licence is the full MIT text', () => {
  const lic = read('tools', 'prism', 'packwiz-installer-bootstrap.LICENSE.txt');
  assert.match(lic, /MIT License/);
  assert.match(lic, /Permission is hereby granted, free of charge/);
  assert.match(lic, /THE SOFTWARE IS PROVIDED "AS IS"/);
});

test('prism zip carries the jar and the full licence text', { skip: !pwsh }, () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'gg-prism-'));
  const r = ps([path.join(repo, 'tools', 'prism', 'Build-PrismInstance.ps1'), '-Channel', 'v0.0.0-test', '-OutDir', out]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const zip = path.join(out, 'Gregtech-Grindless-v0.0.0-test.zip');
  const list = spawnSync('python3', ['-c', 'import sys,zipfile;z=zipfile.ZipFile(sys.argv[1]);[print(n) for n in z.namelist()];print("LIC>>"+z.read([n for n in z.namelist() if n.endswith("bootstrap.LICENSE.txt")][0]).decode())', zip], { encoding: 'utf8' });
  assert.equal(list.status, 0, list.stderr);
  assert.match(list.stdout, /\.minecraft\/packwiz-installer-bootstrap\.jar/);
  assert.match(list.stdout, /\.minecraft\/packwiz-installer-bootstrap\.LICENSE\.txt/);
  assert.match(list.stdout, /Permission is hereby granted, free of charge/);
  assert.match(list.stdout, /THE SOFTWARE IS PROVIDED "AS IS"/);
});

function fakeGh({ runs, assets, draft = false }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gg-gh-'));
  const f = path.join(dir, 'gh');
  fs.writeFileSync(f, `#!/bin/sh
if [ "$1" = "run" ]; then cat <<'EOF'
${JSON.stringify(runs)}
EOF
else cat <<'EOF'
${JSON.stringify({ assets: assets.map((name) => ({ name })), isDraft: draft })}
EOF
fi
`);
  fs.chmodSync(f, 0o755);
  return f;
}

test('Test-Promotion blocks on a wrong SHA, version, red T0 or missing Prism asset', { skip: !pwsh || !posix }, () => {
  const sha = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', cwd: repo }).stdout.trim();
  const ver = /^version\s*=\s*"([^"]+)"/m.exec(read('pack', 'pack.toml'))[1];
  const run = (gh, extra = []) => ps([path.join(repo, 'tools', 'release', 'Test-Promotion.ps1'), '-Sha', sha, '-Version', ver, '-GhExe', gh, ...extra]);
  const green = [{ headSha: sha, status: 'completed', conclusion: 'success' }];
  const zip = `Gregtech-Grindless-v${ver}.zip`;

  const ok = run(fakeGh({ runs: green, assets: [zip] }));
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /PROMOTION OK/);

  const red = run(fakeGh({ runs: [{ headSha: sha, status: 'completed', conclusion: 'failure' }], assets: [zip] }));
  assert.equal(red.status, 1);
  assert.match(red.stdout, /FAIL\s+t0-success/);

  const other = run(fakeGh({ runs: [{ headSha: 'f'.repeat(40), status: 'completed', conclusion: 'success' }], assets: [zip] }));
  assert.equal(other.status, 1, 'a green run of another SHA proves nothing');

  const noAsset = run(fakeGh({ runs: green, assets: [] }));
  assert.equal(noAsset.status, 1);
  assert.match(noAsset.stdout, /FAIL\s+prism-asset/);

  const skip = run(fakeGh({ runs: green, assets: [] }), ['-SkipRelease']);
  assert.equal(skip.status, 0, skip.stdout);
  assert.match(skip.stdout, /SKIP\s+prism-asset/);

  const wrongVer = spawnSync('pwsh', ['-NoProfile', '-File', path.join(repo, 'tools', 'release', 'Test-Promotion.ps1'), '-Sha', sha, '-Version', '9.9.9', '-GhExe', fakeGh({ runs: green, assets: [zip] })], { encoding: 'utf8', cwd: repo });
  assert.equal(wrongVer.status, 1);
  assert.match(wrongVer.stdout, /FAIL\s+pack-version/);

  const badSha = spawnSync('pwsh', ['-NoProfile', '-File', path.join(repo, 'tools', 'release', 'Test-Promotion.ps1'), '-Sha', 'main', '-Version', ver, '-GhExe', fakeGh({ runs: green, assets: [zip] })], { encoding: 'utf8', cwd: repo });
  assert.equal(badSha.status, 1);
  assert.match(badSha.stdout, /FAIL\s+sha-format/);
});
