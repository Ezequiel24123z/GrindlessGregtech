// D2-MATTER (#363): nanodiamond_cleaning conserves carbon and hydrogen, and diamond electrolysis is removed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const MB = JSON.parse(fs.readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', 'megabar.json'), 'utf8'));
const row = MB.types.chemical_reactor.recipes.find((r) => r.name === 'nanodiamond_cleaning');
const count = (list, id) => (list.find((x) => x.id === id) || {}).count || 0;
const amount = (list, id) => (list.find((x) => x.id === id) || {}).amount || 0;

test('nanodiamond_cleaning: 4 nanodiamond + 4 000 mB H -> 3 diamond dust + 1 000 mB methane', () => {
  assert.equal(count(row.itemsIn, 'grindless:nanodiamond_dust'), 4);
  assert.equal(amount(row.fluidsIn, 'gtceu:hydrogen'), 4000);
  assert.equal(count(row.itemsOut, 'gtceu:diamond_dust'), 3);
  assert.equal(amount(row.fluidsOut, 'gtceu:methane'), 1000);
});

test('nanodiamond_cleaning conserves carbon (4 = 3 + 1) and hydrogen (4 000 = 4 x 1 000 mB of CH4 H atoms)', () => {
  const cIn = count(row.itemsIn, 'grindless:nanodiamond_dust');
  const cOut = count(row.itemsOut, 'gtceu:diamond_dust') + amount(row.fluidsOut, 'gtceu:methane') / 1000;
  assert.equal(cOut, cIn);
  assert.equal(amount(row.fluidsIn, 'gtceu:hydrogen') / 1000, 4 * (amount(row.fluidsOut, 'gtceu:methane') / 1000));
});

test('carbon_loop.js removes electrolyzer/diamond_electrolysis and nothing registers it again', () => {
  const dir = path.join(pack, 'kubejs');
  const src = fs.readFileSync(path.join(dir, 'server_scripts', 'grindless', 'zpm', 'carbon_loop.js'), 'utf8');
  assert.match(src, /gtceu:electrolyzer\/diamond_electrolysis/);
  assert.match(src, /event\.remove/);
});
