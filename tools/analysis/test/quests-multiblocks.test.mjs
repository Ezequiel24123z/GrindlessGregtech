import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hid, layoutBands, COLS, PITCH_X, PITCH_Y } from '../../quests/multiblocks/mb-lib.mjs';
import { oursFromScripts, classify } from '../../quests/multiblocks/gen.mjs';
import { gateTiers } from '../../quests/multiblocks/mb-data.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

test('variable-registered controller is ours, in its folder; built-in ids stay out', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mbours-'));
  fs.mkdirSync(path.join(root, 'uev'));
  fs.writeFileSync(path.join(root, 'uev', 'a.js'), "const L = [{ name: 'foo_lab' }, { name: 'cleanroom' }, { name: 'bar_ring', type: 'x', lang: 'Bar Ring' }];\nL.forEach((m) => event.create(m.name, 'multiblock'));\n");
  const lang = new Map([['uev', "['block.gtceu.foo_lab', 'Foo Lab', 'x'],"]]);
  const conflicts = [];
  const ours = oursFromScripts(root, ['gtceu:foo_lab', 'gtceu:cleanroom', 'gtceu:bar_ring'], lang, path.join(root, 'none'), conflicts);
  assert.equal(ours.get('gtceu:foo_lab'), 'uev');
  assert.equal(ours.get('gtceu:bar_ring'), 'uev', 'named by its own lang: field');
  assert.equal(ours.has('gtceu:cleanroom'), false);
  assert.equal(conflicts.length, 0);
  fs.rmSync(root, { recursive: true });
});

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

test('a controller whose tier is after the implemented era gets no quest; gates stop at the implemented era', () => {
  const machines = [{ id: 'gtceu:a', mb: 1 }, { id: 'gtceu:b', mb: 1 }, { id: 'x:c', mb: 1 }, { id: 'x:d', mb: 1 }];
  const ours = new Map([['gtceu:a', 'uev'], ['gtceu:b', 'uiv']]);
  const reach = new Map([['x:c', 'uhv']]);
  const r = classify({ machines, items: null, hidden: new Set(), ours, reach, nominal: new Map([['x:c', 'uiv']]), implemented: 'uev' });
  assert.deepEqual(r.controllers.map((c) => [c.id, c.tier]), [['gtceu:a', 'uev']]);
  assert.deepEqual(r.excluded.map((e) => e.why), ['uiv is after the implemented era uev', 'uiv is after the implemented era uev', 'no gate up to uev reaches it']);
  assert.equal(classify({ machines, items: null, hidden: new Set(), ours, reach }).controllers.length, 3, 'no implemented era: no cut');
  assert.deepEqual(gateTiers('uev', (t) => t !== 'mv'), ['steam', 'lv', 'hv', 'ev', 'iv', 'luv', 'zpm', 'uv', 'uhv', 'uev']);
});