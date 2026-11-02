import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTS as CIRCUITS } from '../uiv-chapter/circuits-data.mjs';
import { QUESTS as MACHINES } from '../uiv-chapter/machines-data.mjs';
import { QUESTS as LINES } from '../uiv-chapter/quests-data.mjs';

const byKey = Object.fromEntries([...CIRCUITS, ...MACHINES, ...LINES].map((q) => [q.key, q]));

// AF-Q2c dropped these three to clear layout lint; B13-QUE brought them back with re-solved layouts.
test('the UIV hatch, fusion ring and stored proof depend on their real inputs', () => {
  assert.ok(byKey.HATCH.deps.includes('HULL'));
  assert.ok(byKey.RING.deps.includes('HULL'));
  assert.ok(byKey.STORE.deps.includes('R_CENSUS'));
});
