import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hid, layoutBands, COLS, PITCH_X, PITCH_Y } from '../../quests/multiblocks/mb-lib.mjs';

const mk = (n, tier, ours = false, name = 'M' + String(n).padStart(3, '0')) => ({ id: 'gtceu:m' + n, name, tier, ours });

test('hid is stable and in range', () => {
  assert.equal(hid('multiblocks:gtceu:x'), hid('multiblocks:gtceu:x'));
  assert.notEqual(hid('a'), hid('b'));
  for (let i = 0; i < 200; i++) {
    const h = hid('seed' + i);
    assert.match(h, /^[1-7][0-9A-F]{15}$/);
  }
});

test('bands follow tier order, empty ones are skipped', () => {
  const bands = layoutBands([mk(1, 'ev'), mk(2, 'lv'), mk(3, 'steam'), mk(4, 'uev')]);
  assert.deepEqual(bands.map((b) => b.tier), ['steam', 'lv', 'ev', 'uev']);
});

test('rows wrap at 12 columns and ours come first', () => {
  const list = [];
  for (let i = 0; i < 14; i++) list.push(mk(i, 'mv'));
  list.push(mk(99, 'mv', true, 'Zzz'));
  const [b] = layoutBands(list);
  assert.equal(b.cells[0].ours, true);
  assert.equal(b.cells[COLS].y, b.label.y + PITCH_Y);
  assert.equal(b.cells[COLS].x, PITCH_X);
  assert.equal(b.cells[COLS - 1].x, PITCH_X * COLS);
});

test('no overlapping cells', () => {
  const list = [];
  for (const t of ['steam', 'lv', 'mv']) for (let i = 0; i < 30; i++) list.push(mk(t.length * 100 + i, t));
  const seen = new Set();
  for (const b of layoutBands(list)) {
    for (const p of [b.label, ...b.cells]) {
      const k = p.x + ',' + p.y;
      assert.ok(!seen.has(k), k);
      seen.add(k);
    }
  }
});
