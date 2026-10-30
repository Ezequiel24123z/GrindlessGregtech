// TP-S0F: highTierContent is on, so GTM registers the UHV-OpV components, machines, hulls and hatches. KubeJS must not create the UEV, UIV
// and UXV hull and hatches (same ids, same classes: a clash) and GTM's duplicate recipes for them are removed, ours stay the only ones.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts, GTM_HIGH_TIER_IDS } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const TIERS = ['uev', 'uiv', 'uxv'];
// GTM's own recipes for exactly these outputs, from the post-flip native dump
const GTM_DUPLICATES = TIERS.flatMap((t) => [`gtceu:shaped/${t}_machine_hull`, `gtceu:assembler/energy_hatch_16a_${t}`, `gtceu:assembler/dynamo_hatch_16a_${t}`]);
const run = runPackScripts(pack);

test('gtceu.yaml turns highTierContent on', () => {
  const yaml = fs.readFileSync(path.join(pack, 'config', 'gtceu.yaml'), 'utf8');
  assert.match(yaml, /^\s*highTierContent: true\s*$/m);
  assert.doesNotMatch(yaml, /highTierContent: false/);
});

test('no KubeJS script creates a hull or an energy hatch builder', () => {
  const dir = path.join(pack, 'kubejs', 'startup_scripts');
  const bad = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) walk(f);
      else if (/\.js$/.test(e.name) && /create\('(machine_hull|energy_input_hatch|energy_output_hatch)(_16a)?',\s*'custom'\)/.test(fs.readFileSync(f, 'utf8'))) bad.push(f);
    }
  };
  walk(dir);
  assert.deepEqual(bad, []);
  assert.equal(GTM_HIGH_TIER_IDS.length, 15);
  for (const id of GTM_HIGH_TIER_IDS) assert.ok(run.registry.machines.get(id).seeded, `${id} is created by KubeJS`);
});

test('each tier removes exactly GTM\'s three duplicates and keeps our recipe as the only one of the 15 outputs', () => {
  for (const t of TIERS) {
    const src = fs.readFileSync(path.join(pack, 'kubejs', 'server_scripts', 'grindless', t, 'foundation.js'), 'utf8');
    assert.match(src, new RegExp(`\\['shaped/${t}_machine_hull', 'assembler/energy_hatch_16a_${t}', 'assembler/dynamo_hatch_16a_${t}'\\]`));
  }
  assert.equal(GTM_DUPLICATES.length, 9);
  const ours = run.docs.recipes.recipes.filter((r) => /^grindless:assembly_line\/(uev|uiv|uxv)_(machine_hull|energy_)/.test(r.i));
  assert.equal(ours.length, 15);
  for (const id of GTM_DUPLICATES) assert.ok(!run.docs.recipes.recipes.some((r) => r.i === id), `${id} should not exist`);
});
