// MEGA-0: the pure arithmetic of lib/mega.js (coil ceiling, energy cap, discount), run from the shipped file with the KubeJS globals stubbed.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const file = path.join(root, 'pack', 'kubejs', 'startup_scripts', 'grindless', 'lib', 'mega.js');

const sandbox = { global: {}, console };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
const mega = sandbox.global.grindless.mega;
const F = mega.formulas;

test('mega.js exports the family API', () => {
  for (const name of ['coilParallel', 'coilDiscount', 'withHatch', 'chain', 'install', 'modules', 'formulas']) {
    assert.ok(mega[name], name);
  }
});

test('coilCeiling: 2^floor(K/900), capped', () => {
  assert.equal(F.coilCeiling(1800, null), 4);
  assert.equal(F.coilCeiling(2700, null), 8);
  assert.equal(F.coilCeiling(3600, null), 16);
  assert.equal(F.coilCeiling(10800, 64), 64);
  assert.equal(F.coilCeiling(10800, null), 4096);
  assert.equal(F.coilCeiling(1799, null), 2);
  assert.equal(F.coilCeiling(0, null), 1);
  assert.equal(F.coilCeiling(NaN, null), 1);
});

test('energyCap: floor(max voltage / EU per tick of one copy)', () => {
  assert.equal(F.energyCap(512, 30), 17);
  assert.equal(F.energyCap(8192, 30), 273);
  assert.equal(F.energyCap(30, 30), 1);
  assert.equal(F.energyCap(29, 30), 0);
  assert.equal(F.energyCap(0, 30), 0);
  assert.equal(F.energyCap(512, 0), Infinity);
});

test('parallels = min(coil, inputs, energy); no copy fits gives 0', () => {
  assert.equal(F.parallels(4096, 17, 64), 17);
  assert.equal(F.parallels(4096, 273, 64), 64);
  assert.equal(F.parallels(4, 273, 64), 4);
  assert.equal(F.parallels(4, 273, null), 4);
  assert.equal(F.parallels(4, 0, 64), 0);
  assert.equal(F.parallels(4, 5, 0), 0);
});

test('discountMultiplier: 0.95 per coil step above Cupronickel, floor 0.80', () => {
  const m = (k) => F.discountMultiplier(k, 0.95, 0.8);
  assert.equal(m(1800), 1);
  assert.ok(Math.abs(m(2700) - 0.95) < 1e-9);
  assert.ok(Math.abs(m(3600) - 0.9025) < 1e-9);
  assert.ok(Math.abs(m(4500) - 0.857375) < 1e-9);
  assert.ok(Math.abs(m(5400) - 0.8145) < 1e-3);
  assert.equal(m(10800), 0.8);
  assert.equal(m(900), 1);
});

test('MEGA-0c: fixedParallel is exported and ceiling() multiplies min(base, cap) by the hatch', () => {
  assert.ok(mega.fixedParallel);
  assert.equal(F.ceiling(8, null, 1), 8);
  assert.equal(F.ceiling(4, null, 4), 16);
  assert.equal(F.ceiling(1024, 64, 1), 64);
  assert.equal(F.ceiling(1024, 64, 4), 256);
  assert.equal(F.ceiling(4096, null, 4), 16384);
  assert.equal(F.ceiling(64, null, 1024), 65536);
  assert.equal(F.ceiling(8, null, 0), 8);
  assert.equal(F.ceiling(8, null, undefined), 8);
  assert.equal(F.ceiling(0, null, 2), 2);
});

test('MEGA-0c: the energy cap still binds a fixed ceiling', () => {
  assert.equal(F.parallels(F.ceiling(8, null, 1), F.energyCap(128, 30), null), 4);
  assert.equal(F.parallels(F.ceiling(8, null, 1), F.energyCap(32, 30), null), 1);
  assert.equal(F.parallels(F.ceiling(4, null, 4), F.energyCap(2048, 30), 100), 16);
});

test('MEGA-0c: chain builds fixed and coil-times-hatch lists in the proven order', () => {
  sandbox.GTRecipeModifiers = { OC_PERFECT_SUBTICK: 'oc', OC_NON_PERFECT: 'nonoc', BATCH_MODE: 'batch' };
  const fixed = mega.chain({ parallel: 'fixed', cap: 8, batch: false });
  assert.equal(fixed.length, 2);
  assert.equal(typeof fixed[0], 'function');
  assert.equal(fixed[1], 'oc');
  const coil = mega.chain({ hatch: true, discount: { rate: 0.95, floor: 0.8 } });
  assert.equal(coil.length, 4);
  assert.equal(coil[3], 'batch');
  assert.equal(mega.chain({ parallel: 'none', batch: false }).length, 1);
});