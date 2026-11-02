// AF-V: the reachability validator proves what it claims. Conditions fail closed (M9-05), a biome condition is met by a key a trip
// grants (M1-09), a machine's amperage widens its EU/t ceiling (M4-07), and a machine whose pattern lacks a part its recipe needs
// does not run that recipe (M4-02).
import test from 'node:test';
import assert from 'node:assert/strict';
import { gt, gi, gf, mkDump, run, verdicts } from './helpers.mjs';

function condPack({ conds, conditions = {}, synthetic = [], machine = {}, eut = 8 }) {
  const recipes = [gt('t:r', 't:type', { ins: [gi('t:in')], outs: [gi('t:out')], eut, conditions: conds })];
  const cfg = {
    tier: 'lv',
    eraOrder: ['steam', 'lv'],
    conditions,
    synthetic,
    world: [{ id: 'earth', mode: 'manual', bootstrap: true, items: ['t:in', 't:m', 't:rocket'] }],
    machines: [{ machine: 't:m', types: ['t:type'], maxEUt: 32, ...machine }],
    targets: [{ id: 'out', item: 't:out' }],
  };
  return run(mkDump({ recipes, items: ['t:in', 't:out', 't:m', 't:rocket'] }), cfg);
}

// ---------------------------------------------------------------- M9-05: conditions fail closed

test('conditions: a condition type with no rule is an unmodelled gate (FAIL), counted in the stats', () => {
  const r = condPack({ conds: [{ type: 'weird_gate' }] });
  assert.equal(verdicts(r.out.gate).out, 'FAIL');
  assert.equal(r.model.stats.unmodelledConditions.weird_gate, 1);
});

test('conditions: an explicit ignore (type or wildcard) lets the recipe through', () => {
  assert.equal(verdicts(condPack({ conds: [{ type: 'weird_gate' }], conditions: { weird_gate: { ignore: true } } }).out.gate).out, 'PASS');
  assert.equal(verdicts(condPack({ conds: [{ type: 'weird_gate' }], conditions: { '*': { ignore: true } } }).out.gate).out, 'PASS');
});

test('conditions: a reversed condition is not modelled unless ignored', () => {
  const conditions = { weird_gate: { unsupported: true } };
  assert.equal(verdicts(condPack({ conds: [{ type: 'weird_gate' }], conditions }).out.gate).out, 'PASS');
  assert.equal(verdicts(condPack({ conds: [{ type: 'weird_gate', reverse: true }], conditions }).out.gate).out, 'FAIL');
  assert.equal(verdicts(condPack({ conds: [{ type: 'weird_gate', reverse: true }], conditions: { weird_gate: { ignore: true } } }).out.gate).out, 'PASS');
});

// ---------------------------------------------------------------- M1-09: biome met by a key a trip grants

const biome = { biome: { keyFrom: { field: 'biome', prefix: 'biome' } } };
const trip = (produces) => [{ id: 'trip', capital: ['t:rocket'], produces }];

test('biome keyFrom: the recipe applies only once a trip grants that biome', () => {
  const conds = [{ type: 'biome', biome: 't:desert' }];
  assert.equal(verdicts(condPack({ conds, conditions: biome }).out.gate).out, 'FAIL', 'no trip');
  assert.equal(verdicts(condPack({ conds, conditions: biome, synthetic: trip(['biome:t:desert']) }).out.gate).out, 'PASS');
  assert.equal(verdicts(condPack({ conds, conditions: biome, synthetic: trip(['biome:t:tundra']) }).out.gate).out, 'FAIL', 'another biome');
});

test('biome keyFrom: a condition without the field never holds', () => {
  assert.equal(verdicts(condPack({ conds: [{ type: 'biome' }], conditions: biome, synthetic: trip(['biome:t:desert']) }).out.gate).out, 'FAIL');
});

// ---------------------------------------------------------------- M4-07: amperage

test('energy.amperage multiplies the machine\'s EU/t ceiling and is recorded in the stats', () => {
  const at = (amperage) => condPack({ conds: undefined, eut: 120, machine: { maxEUt: undefined, energy: { voltage: 32, hatches: 1, ...(amperage ? { amperage } : {}) } } });
  assert.equal(verdicts(at().out.gate).out, 'FAIL', '32 V x 1 A');
  const four = at(4);
  assert.equal(verdicts(four.out.gate).out, 'PASS', '32 V x 4 A = 128');
  assert.equal(four.model.stats.rolledMachines[0].amperage, 4);
  assert.equal(four.model.stats.rolledMachines[0].maxEUt, 128);
});

// ---------------------------------------------------------------- M4-02: the pattern must carry the I/O the recipe needs

function ioPack({ abilities, ins = [gi('t:in')], fins = [], outs = [gi('t:out')], fouts = [] }) {
  const symbols = { S: { kind: 'controller' }, C: { kind: 'blocks', blocks: ['t:casing'] } };
  abilities.forEach((a, i) => { symbols['P' + i] = { kind: 'part', ability: a, limits: { min: 1, max: 1 } }; });
  const structures = { 't:m': { id: 't:m', slices: [['S' + abilities.map((_, i) => 'P' + i).join('') + 'C']], symbols } };
  const recipes = [gt('t:r', 't:type', { ins, fins, outs, fouts, eut: 8 })];
  const cfg = {
    tier: 'lv',
    eraOrder: ['steam', 'lv'],
    partAbilities: { input_bus: ['t:ibus'], input_hatch: ['t:ihatch'], output_bus: ['t:obus'], output_hatch: ['t:ohatch'] },
    world: [{ id: 'earth', mode: 'manual', bootstrap: true, items: ['t:in', 't:m', 't:casing', 't:ibus', 't:ihatch', 't:obus', 't:ohatch'] }],
    machines: [{ machine: 't:m', types: ['t:type'], maxEUt: 32, partsFromStructure: true }],
    targets: [{ id: 'out', item: 't:out' }, { id: 'fout', item: 'fluid:t:fout' }],
  };
  const items = ['t:in', 't:out', 't:m', 't:casing', 't:ibus', 't:ihatch', 't:obus', 't:ohatch'];
  return run(mkDump({ recipes, items, fluids: ['t:fout', 't:fin'], structures }), cfg);
}
const verdictOf = (r, id) => r.out.gate.find((x) => x.target.id === id);

test('I/O abilities: a pattern with no input bus does not run a recipe with an item input', () => {
  const r = ioPack({ abilities: ['output_bus'] });
  assert.equal(verdictOf(r, 'out').verdict, 'FAIL');
  assert.match(verdictOf(r, 'out').lines.join('\n'), /pattern has no input bus/);
  assert.equal(verdictOf(ioPack({ abilities: ['input_bus', 'output_bus'] }), 'out').verdict, 'PASS');
});

test('I/O abilities: fluid inputs need an input hatch and item outputs an output bus', () => {
  const noHatch = ioPack({ abilities: ['input_bus', 'output_bus'], fins: [gf('t:fin')] });
  assert.equal(verdictOf(noHatch, 'out').verdict, 'FAIL');
  assert.match(verdictOf(noHatch, 'out').lines.join('\n'), /no input hatch/);
  assert.equal(verdictOf(ioPack({ abilities: ['input_bus', 'input_hatch', 'output_bus'], fins: [gf('t:fin')] }), 'out').verdict, 'PASS');
  const noOut = ioPack({ abilities: ['input_bus'] });
  assert.match(verdictOf(noOut, 'out').lines.join('\n'), /no output bus/);
});

test('I/O abilities: a fluid product needs an output hatch', () => {
  const none = ioPack({ abilities: ['input_bus'], outs: [], fouts: [gf('t:fout')] });
  assert.equal(verdictOf(none, 'fout').verdict, 'FAIL');
  assert.match(verdictOf(none, 'fout').lines.join('\n'), /no output hatch/);
  assert.equal(verdictOf(ioPack({ abilities: ['input_bus', 'output_hatch'], outs: [], fouts: [gf('t:fout')] }), 'fout').verdict, 'PASS');
});
