// XP-H5: the horizon capacitor bank (docs/eras/maxplus.md, machine 15): the ring, the cell and the table, read from what the stand-in registers.
// The network arithmetic and the placement run in wireless_network.test.mjs's harness and the in-game T1 (gg_test_maxplus_bank.js).
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const run = runPackScripts(pack);
const G = run.global.grindless;
const W = G.wireless;

test('the bank registers without errors: the cell block, the machine and its ring', () => {
  const mine = run.errors.filter((e) => /capacitor_bank|wireless_energy/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.ok(run.registry.blocks.has('grindless:horizon_capacitor'), 'the capacitor is a block');
  assert.ok(run.registry.machines.has('gtceu:horizon_capacitor_bank'), 'the bank is a machine');
});

test('the table: one capacitor of 2^48 EU at tier 14, a bank of 40 slots at Sgr A* orbit', () => {
  const cell = W.table.maxplusCells[0];
  assert.equal(cell.cell, 'grindless:horizon_capacitor');
  assert.equal(cell.tier, 14);
  assert.equal(BigInt(cell.capacity), 2n ** 48n);
  assert.equal(W.table.maxplusBank.id, 'gtceu:horizon_capacitor_bank');
  assert.equal(W.table.maxplusBank.site, 'gcyr:black_hole_orbit');
  assert.equal(W.bankId, 'gtceu:horizon_capacitor_bank');
  assert.equal(BigInt(W.table.maxplusBank.slots) * 2n ** 48n, 11258999068426240n, 'the bank\'s capacity');
});

test('the dial: the bank holds one dial (1,200 x 2^43 EU) and 80 ticks over', () => {
  const dial = BigInt(W.table.maxplusBank.dialMultiplier) * 2n ** BigInt(W.table.maxplusBank.dialExponent);
  assert.equal(dial, 10555311626649600n);
  const bank = 40n * 2n ** 48n;
  assert.ok(bank >= dial);
  assert.equal((bank - dial) / 2n ** 43n, 80n);
});

test('the capacitor is no tower cell: not in W.cells, and the tower\'s pattern does not take it', () => {
  assert.ok(!('grindless:horizon_capacitor' in W.cells));
  assert.ok(!W.cellIds.includes('grindless:horizon_capacitor'));
  assert.ok(!W.table.tiers.some((t) => t.cell === 'grindless:horizon_capacitor'));
});

test('the ring: 25 x 5 x 25, 40 capacitor slots, the controller in the middle of the front', () => {
  const { slices } = G.maxPlusCapacitorBank.spec;
  assert.equal(slices.length, 25);
  for (const rows of slices) {
    assert.equal(rows.length, 5);
    for (const row of rows) assert.equal(row.length, 25);
  }
  const all = slices.flat().join('');
  assert.equal([...all].filter((c) => c === 'C').length, 40);
  assert.equal([...all].filter((c) => c === 'S').length, 1);
  assert.equal(slices[24][1][12], 'S');
  assert.ok(slices.every((rows) => rows[2].split('').every((c) => ' CKA'.includes(c))), 'the slot row is slots, superconducting coils and corner pillars');
  assert.equal([...all].filter((c) => c === 'K').length, 52, 'a coil in every slot row cell that is not a slot or a corner');
  assert.equal([...all].filter((c) => c === 'L').length, 24, 'the glass band over the coils');
  assert.ok(slices[12].every((row) => row.slice(1, 24).trim() === ''), 'the inside of the ring is empty');
});
