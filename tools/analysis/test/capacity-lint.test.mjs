import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRecipe, tierOfEut, buildSnapshot } from '../lib/capacity.mjs';
import { diffKnown, lintCurve } from '../capacity-lint.mjs';
import { loadTables, withFactors, TABLE_DIR } from '../lib/cost_curve.mjs';
import { mkDump } from './helpers.mjs';

const fl = (fluid, amount) => ({ content: { amount, value: [{ fluid }] } });
const it = (item, count) => ({ content: { type: 'gtceu:sized', count, ingredient: { item } } });
const rec = (type, eut, inputs = {}, outputs = {}) => ({ id: 'x/y', type, json: { inputs, outputs, tickInputs: { eu: [{ content: eut }] } } });

// A mixer that exists only as a singleblock at LuV (6 item slots, 2 input tanks of 64 B) and a chemical reactor with a multiblock.
const snap = {
  types: { 'gtceu:mixer': { io: [6, 1, 2, 1] }, 'gtceu:chemical_reactor': { io: [2, 2, 3, 2] } },
  singleblock: { 'gtceu:mixer': { 6: { iIn: 6, iOut: 1, fIn: { tanks: 2, cap: 64000 }, fOut: { tanks: 1, cap: 64000 } } } },
  multiblockTypes: ['gtceu:chemical_reactor'],
  hatch: { fluidIn: { 6: 512000 }, fluidOut: { 6: 512000 }, itemIn: {}, itemOut: {} }
};

test('capacity: tierOfEut picks the lowest tier whose voltage covers the EU/t', () => {
  assert.equal(tierOfEut(0), 0);
  assert.equal(tierOfEut(32), 1);
  assert.equal(tierOfEut(33), 2);
  assert.equal(tierOfEut(30720), 6);
});

test('capacity: 73.25 B of fluorine does not fit a LuV mixer tank (the bug that started this check)', () => {
  const v = checkRecipe(rec('gtceu:mixer', 30720, { fluid: [fl('gtceu:fluorine', 73250)] }), snap);
  assert.equal(v.level, 'error');
  assert.match(v.reasons.join(), /fluorine 73250 mB > 64000 mB/);
  assert.equal(checkRecipe(rec('gtceu:mixer', 30720, { fluid: [fl('gtceu:fluorine', 64000)] }), snap).level, 'ok');
});

test('capacity: a sized ingredient spans slots and the circuit takes one of the type\'s item inputs (M9-07)', () => {
  const six = [1, 2, 3, 4, 5, 6].map((n) => it('a:i' + n, 64));
  const circuit = { content: { type: 'gtceu:circuit', configuration: 1 } };
  assert.equal(checkRecipe(rec('gtceu:mixer', 30720, { item: [...six.slice(0, 5), circuit] }), snap).level, 'ok');
  const over = checkRecipe(rec('gtceu:mixer', 30720, { item: [...six, circuit] }), snap);
  assert.equal(over.level, 'error');
  assert.match(over.reasons.join(), /7 item inputs \(1 circuit\) > type max 6/);
  assert.equal(checkRecipe(rec('gtceu:mixer', 30720, { item: [it('a:i', 6 * 64 + 1)] }), snap).level, 'error');
});

test('capacity: more stacks than the type supports is an error even for a multiblock type', () => {
  const v = checkRecipe(rec('gtceu:chemical_reactor', 480, { item: [it('a:a', 1), it('a:b', 1), it('a:c', 1)] }), snap);
  assert.equal(v.level, 'error');
  assert.match(v.reasons[0], /3 item inputs > type max 2/);
});

test('capacity: a multiblock hatch holds what no singleblock tank does (warning, not error); too much for both is an error', () => {
  assert.equal(checkRecipe(rec('gtceu:chemical_reactor', 480, { fluid: [fl('a:f', 100000)] }), snap).level, 'error');
  const s2 = { ...snap, singleblock: { 'gtceu:chemical_reactor': { 6: { iIn: 2, iOut: 2, fIn: { tanks: 3, cap: 16000 }, fOut: { tanks: 2, cap: 16000 } } } } };
  assert.equal(checkRecipe(rec('gtceu:chemical_reactor', 30720, { fluid: [fl('a:f', 100000)] }), s2).level, 'warn');
});

test('capacity: unknown recipe types are not checked (warning)', () => {
  assert.equal(checkRecipe(rec('x:unknown', 30), snap).level, 'warn');
});

test('capacity: the snapshot builder reads the dump format', () => {
  const s = buildSnapshot({
    recipeTypes: [{ id: 'gtceu:mixer', io: [6, 1, 2, 1] }],
    machines: [
      { id: 'gtceu:luv_mixer', tier: 6, types: ['gtceu:mixer'], cap: [['i', 'IN', 6, 0], ['i', 'OUT', 1, 0], ['f', 'IN', 2, 16000], ['f', 'OUT', 1, 16000], ['i', 'IN', 1, 0]] },
      { id: 'gtceu:luv_input_hatch', tier: 6, types: [], cap: [['f', 'IN', 1, 512000], ['i', 'IN', 1, 0]] },
      { id: 'gtceu:luv_big_mixer', tier: 6, types: ['gtceu:mixer'], mb: 1 }
    ]
  });
  assert.deepEqual(s.singleblock['gtceu:mixer'][6], { iIn: 6, iOut: 1, fIn: { tanks: 2, cap: 16000 }, fOut: { tanks: 1, cap: 16000 } });
  assert.equal(s.hatch.fluidIn[6], 512000);
  assert.deepEqual(s.multiblockTypes, ['gtceu:mixer']);
});

test('capacity: the known list is a ratchet (new and stale entries fail)', () => {
  const d = diffKnown({ a: 'x', b: 'y' }, { violations: { b: 'y', c: 'z' } });
  assert.deepEqual(d, { fresh: ['a'], stale: ['c'] });
});

test('capacity --dump: the cost-curve pass pushes a LuV recipe over its tank, and only that recipe is reported', () => {
  const out = (item) => ({ item: [{ content: { type: 'gtceu:sized', count: 1, ingredient: { item } }, chance: 10000, maxChance: 10000 }] });
  const mixer = (id, item, mb) => ({ id, type: 'gtceu:mixer', json: { type: 'gtceu:mixer', duration: 100, inputs: { fluid: [{ content: { amount: mb, value: [{ fluid: 'a:f' }] }, chance: 10000, maxChance: 10000 }] }, outputs: out(item), tickInputs: { eu: [{ content: 30720, chance: 10000, maxChance: 10000 }] } } });
  const dump = mkDump({ recipes: [mixer('gtceu:mixer/key', 'gtceu:luv_electric_motor', 40000), mixer('gtceu:mixer/other', 'a:unrelated', 40000)] });
  const { tables } = loadTables(TABLE_DIR);
  const off = lintCurve(dump, withFactors(tables, {}), snap);
  assert.deepEqual(Object.keys(off.after.errors), []);
  const on = lintCurve(dump, withFactors(tables, { luv: { item: 2, fluid: 2 } }), snap);
  assert.deepEqual(Object.keys(on.after.errors), ['gtceu:mixer/key']);
  assert.equal(on.byEra.luv.overflows, 1);
  assert.equal(on.byEra.luv.top[0].biggest, 80000);
  assert.match(on.byEra.luv.top[0].reason, /80000 mB > 64000 mB/);
});
