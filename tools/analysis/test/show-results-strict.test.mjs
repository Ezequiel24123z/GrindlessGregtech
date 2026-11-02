// M9-02: the native summary (Show-GGResults.ps1 -Strict) must not say PASS without proof. Synthetic results only, no Minecraft.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../test/Show-GGResults.ps1');
const pwsh = ['pwsh', 'powershell'].find((n) => spawnSync(n, ['-NoProfile', '-Command', 'exit 0']).status === 0);
const ok = (name) => ({ name, status: 'PASS', seconds: 1, detail: '' });

function run({ request, stages, log = [], strict = true, lookup = false }) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'gg-show-'));
  const res = path.join(out, 'results');
  fs.mkdirSync(path.join(res, 'server/logs'), { recursive: true });
  if (lookup) {
    fs.mkdirSync(path.join(res, 'server/kubejs-exported/dump'), { recursive: true });
    fs.writeFileSync(path.join(res, 'server/kubejs-exported/dump/lookup_unreachable.json'), '{"unreachable":[]}');
  }
  fs.writeFileSync(path.join(out, 'request.json'), JSON.stringify({ suite: 'server', runId: 'x', commands: [], waitForLog: [], ...request }));
  fs.writeFileSync(path.join(res, 'stages.json'), JSON.stringify(stages));
  fs.writeFileSync(path.join(res, 'server/logs/latest.log'), log.join('\n') + '\n');
  const args = ['-NoProfile', '-File', script, '-OutDir', out];
  if (strict) args.push('-Strict');
  const r = spawnSync(pwsh, args, { encoding: 'utf8' });
  const summary = JSON.parse(fs.readFileSync(path.join(out, 'summary.json'), 'utf8'));
  return { code: r.status, summary };
}

const base = ['boot', 'shutdown'].map(ok);
const pass = (suite, n = 2) => Array.from({ length: n }, (_, i) => `[10:00:00] [Server thread/INFO] [KubeJS Server/]: GGTEST|${suite}|c${i}|PASS`);
const checks = { commands: ['kubejs custom_command gg_test_lookup_x'], waitForLog: ['GGTEST\\|lookup\\|DONE@@180'] };
const stages = [...base, ok('commands'), ok('wait-markers')];

test('strict: a run with its declared checks passes', { skip: !pwsh }, () => {
  const r = run({ request: checks, stages, log: pass('lookup') });
  assert.equal(r.code, 0, JSON.stringify(r.summary.strictReasons));
  assert.equal(r.summary.verdict, 'PASS');
});

test('strict: zero checks fail, lenient mode still passes (the old behaviour)', { skip: !pwsh }, () => {
  const r = run({ request: checks, stages });
  assert.equal(r.code, 1);
  assert.match(r.summary.strictReasons.join(), /zero GGTEST PASS/);
  assert.equal(run({ request: checks, stages, strict: false }).code, 0);
});

test('strict: a declared check set that never reported PASS fails', { skip: !pwsh }, () => {
  const r = run({ request: checks, stages, log: pass('other') });
  assert.equal(r.code, 1);
  assert.match(r.summary.strictReasons.join(), /declared check set 'lookup'/);
});

test('strict: a missing declared stage fails', { skip: !pwsh }, () => {
  const r = run({ request: checks, stages: [...base, ok('commands')], log: pass('lookup') });
  assert.equal(r.code, 1);
  assert.match(r.summary.strictReasons.join(), /stage 'wait-markers' missing/);
});

test('strict: an unexpected ERROR line fails', { skip: !pwsh }, () => {
  const r = run({ request: checks, stages, log: [...pass('lookup'), '[10:00:01] [Server thread/ERROR] [minecraft/Foo]: something broke'] });
  assert.equal(r.code, 1);
  assert.match(r.summary.strictReasons.join(), /ERROR line/);
});

test('strict: dump and gallery utility runs are exempt from the check count', { skip: !pwsh }, () => {
  const dump = run({ request: { commands: ['kubejs custom_command gg_dump'], waitForLog: [] }, stages: [...base, ok('commands')], lookup: true });
  assert.equal(dump.code, 0, JSON.stringify(dump.summary.strictReasons));
  const gal = run({ request: { commands: ['kubejs custom_command gg_gallery_x'] }, stages: [...base, ok('commands')] });
  assert.equal(gal.code, 0, JSON.stringify(gal.summary.strictReasons));
  const mixed = run({ request: { commands: ['kubejs custom_command gg_dump;;kubejs custom_command gg_test_lookup_x'] }, stages: [...base, ok('commands')], lookup: true });
  assert.equal(mixed.code, 1, 'a dump next to a real test is not a utility run');
});

test('strict: a dump without the recipe-lookup export is an incomplete proof', { skip: !pwsh }, () => {
  const r = run({ request: { commands: ['kubejs custom_command gg_dump'] }, stages: [...base, ok('commands')] });
  assert.equal(r.code, 1);
  assert.match(r.summary.strictReasons.join(), /lookup_unreachable\.json.*incomplete/);
});
