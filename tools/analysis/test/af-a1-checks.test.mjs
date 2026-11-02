// AF-A1: the analysis checks must fail on what they claim (audit rows M9-01, M9-06..09, M9-20, M8-04, M2-15).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { auditProcesses, questRewards, rewardItems } from '../lib/process_audit.mjs';
import { rewriteBaseline, staleKeys } from '../process-audit.mjs';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { checkRecipe, circuitsOf, isCircuit, itemsOf, layoutOverflows, parseCapacityWarning, ratchetDiff } from '../lib/capacity.mjs';
import { knownGrowthIds } from '../capacity-lint.mjs';
import { knownGrowth } from '../lib/emi_coverage.mjs';
import { gi, gt, mkDump } from './helpers.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'gg-afa1-'));
const put = (root, rel, text) => {
  const f = path.join(root, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, text);
};
const file = (era) => `startup_scripts/grindless/${era}/x.js`;
const reg = ({ items = [], machines = [] } = {}) => ({
  items: items.map((id) => ({ id, kind: 'item', file: file('hv') })),
  blocks: new Map(),
  fluids: [],
  machines: machines.map((m) => ({ id: m.id, kind: 'multiblock', recipeTypes: m.types || [], file: file('hv') })),
  recipeTypes: [{ id: 'gtceu:mixer', file: file('hv') }],
  materials: [],
  modifiedMaterials: [],
  lang: { en_us: {} },
});

// ---- M9-01: only a quest reward counts as getting an item
test('M9-01: rewardItems reads item rewards only, not tasks, icons or descriptions', () => {
  const snbt = `{ quests: [ { icon: "a:icon" tasks: [ { item: "a:task", type: "item" } ] description: ["a:desc"]
    rewards: [ { id: "1", item: "a:reward", type: "item" } { id: "2", type: "xp", xp: 10 } { id: "3", item: { id: "a:obj", Count: 2 }, type: "item" } ] } ] }`;
  assert.deepEqual(rewardItems(snbt).sort(), ['a:obj', 'a:reward']);
});

test('M9-01: questRewards ignores kubejs data tables and non-snbt files', () => {
  const root = tmp();
  put(root, 'config/ftbquests/quests/chapters/c.snbt', '{ quests: [ { rewards: [ { item: "grindless:given", type: "item" } ] tasks: [ { item: "grindless:only_task", type: "item" } ] } ] }');
  put(root, 'kubejs/data/grindless/tables/t.json', '{"x":"grindless:in_table"}');
  const r = questRewards(root);
  assert.ok(r.has('grindless:given'));
  assert.ok(!r.has('grindless:only_task') && !r.has('grindless:in_table'));
});

test('M9-01: a quest reward does not waive a byproduct-only item', () => {
  const dump = mkDump({
    recipes: [{ ...gt('grindless:r/x', 'gtceu:mixer', { ins: [gi('grindless:a', 1)], outs: [gi('grindless:slag', 1, 1000)] }), added: true }],
    recipeTypes: ['gtceu:mixer'],
  });
  const r = auditProcesses({ dump, registry: reg({ items: ['grindless:a', 'grindless:slag'] }), rewards: new Set(['grindless:slag']) });
  assert.ok(r.findings.some((f) => /slag/.test(f.id) && /byproduct|no_use/.test(f.kind)), r.findings.map((f) => f.kind + ' ' + f.id).join());
});

test('M2-15: a near-trivial step is reported, never a finding', () => {
  const dump = mkDump({
    recipes: [{ ...gt('grindless:r/trivial', 'gtceu:mixer', { ins: [gi('grindless:a', 4), gi('grindless:dust', 1)], outs: [gi('grindless:b', 4)] }), added: true }],
    recipeTypes: ['gtceu:mixer'],
  });
  const r = auditProcesses({ dump, registry: reg({ items: ['grindless:a', 'grindless:b', 'grindless:dust'] }) });
  assert.ok(Array.isArray(r.nearTrivial));
  assert.ok(!r.findings.some((f) => f.kind === 'near_trivial'));
});

// ---- M9-09: baseline rewrites only shrink
test('M9-09: process baseline rewrite refuses growth, drops fixed keys, seeds only with a reason', () => {
  const baseline = { keys: ['k:old', 'k:fixed'], pending: [], options: { ignore: [] } };
  const res = { findings: [{ key: 'k:old' }, { key: 'k:new' }], counts: {} };
  assert.match(rewriteBaseline(res, baseline).error, /refused/);
  assert.deepEqual(staleKeys(res, baseline), ['k:fixed']);
  const shrunk = rewriteBaseline({ findings: [{ key: 'k:old' }], counts: {} }, baseline);
  assert.deepEqual(shrunk.keys, ['k:old']);
  const seeded = rewriteBaseline(res, baseline, 'owner approved');
  assert.deepEqual(seeded.keys, ['k:new', 'k:old']);
  assert.equal(seeded.seeded[0].reason, 'owner approved');
});

test('M9-09: capacity and EMI known lists detect growth', () => {
  assert.deepEqual(knownGrowthIds({ a: 'x', b: 'y' }, { violations: { a: 'x' } }), ['b']);
  assert.deepEqual(knownGrowthIds({ a: 'x' }, { violations: { a: 'x', c: 'z' } }), []);
  assert.deepEqual(knownGrowth({ noUse: ['a'] }, { noUse: ['a', 'b'], routes: ['r'] }), { noUse: ['b'], routes: ['r'] });
  assert.deepEqual(knownGrowth({ noUse: ['a', 'b'] }, { noUse: ['a'] }), {});
});

// ---- M9-06: GTValues constants of GTM 7.5.3
test('M9-06: the stand-in models V, VA, VH and VHA as GTM does', () => {
  const root = tmp();
  put(root, 'kubejs/server_scripts/g.js', 'global.vals = { V1: GTValues.V[1], VA1: GTValues.VA[1], VA6: GTValues.VA[6], VH1: GTValues.VH[1], VHA1: GTValues.VHA[1], VHA14: GTValues.VHA[14] };');
  const run = runPackScripts(root);
  assert.deepEqual(run.errors.filter((e) => e.stage !== 'console.error'), []);
  assert.deepEqual(run.global.vals, { V1: 32, VA1: 30, VA6: 30720, VH1: 16, VHA1: 15, VHA14: 1006632960 });
});

// ---- M9-07: circuits, raw or sized, are one thing
const circuit = (cfg) => ({ content: { type: 'gtceu:circuit', configuration: cfg } });
const sizedCircuit = (cfg) => ({ content: { type: 'gtceu:sized', count: 1, ingredient: { type: 'gtceu:circuit', configuration: cfg } } });
test('M9-07: raw and sized circuits are recognised alike and take no ordinary slot', () => {
  for (const c of [circuit(3), sizedCircuit(3)]) assert.ok(isCircuit(c.content));
  assert.equal(itemsOf([circuit(1), sizedCircuit(2), gi('a:b', 5)]).length, 1);
  assert.equal(circuitsOf([circuit(1), sizedCircuit(2), gi('a:b', 5)]), 2);
});

test('M9-07: the circuit counts against the type\'s entry limit in both forms; zero inputs still passes', () => {
  const snap = { types: { 'gtceu:mixer': { io: [2, 1, 1, 1] } }, singleblock: {}, multiblockTypes: [], hatch: {} };
  const rec = (items) => ({ id: 'x', type: 'gtceu:mixer', json: { inputs: { item: items, fluid: [] }, outputs: {}, tickInputs: { eu: [{ content: 8 }] } } });
  for (const c of [circuit, sizedCircuit]) {
    assert.equal(checkRecipe(rec([gi('a:a', 1), c(1)]), snap).level, 'ok');
    const v = checkRecipe(rec([gi('a:a', 1), gi('a:b', 1), c(1)]), snap);
    assert.equal(v.level, 'error');
    assert.match(v.reasons.join(), /3 item inputs \(1 circuit\) > type max 2/);
  }
  assert.equal(checkRecipe(rec([]), snap).level, 'ok');
});

// ---- M9-08: the real GTM wording
test('M9-08: parseCapacityWarning reads GTM\'s actual overflow wording, inputs and outputs', () => {
  const inp = parseCapacityWarning('[12:00:00] [Server thread/WARN] [KubeJS Server/]: Recipe grindless:m9_overflow is trying to add more inputs than its recipe type can support, Max item inputs: 0');
  assert.deepEqual(inp, { recipe: 'grindless:m9_overflow', side: 'inputs', kind: 'item', max: 0 });
  const out = parseCapacityWarning('Recipe grindless:x/y is trying to add more outputs than its recipe type can support, Max fluid outputs: 2');
  assert.deepEqual(out, { recipe: 'grindless:x/y', side: 'outputs', kind: 'fluid', max: 2 });
  assert.ok(parseCapacityWarning('Trying to add more inputs than RecipeType can support'));
  assert.equal(parseCapacityWarning('Recipe a:b is fine'), null);
});

// ---- M8-04 and M9-20
test('M8-04: layoutOverflows flags the circuit that has no slot, and unknown layouts are skipped', () => {
  const r = (id, items) => ({ id, type: 'gtceu:mixer', json: { inputs: { item: items, fluid: [] }, outputs: { item: [], fluid: [] } } });
  const io = (t) => (t === 'gtceu:mixer' ? [3, 1, 1, 1] : null);
  const out = layoutOverflows([r('ok', [gi('a:a'), gi('a:b'), circuit(1)]), r('bad', [gi('a:a'), gi('a:b'), gi('a:c'), sizedCircuit(4)]), { ...r('skip', []), type: 'x:y' }], io);
  assert.deepEqual(Object.keys(out), ['bad']);
  assert.match(out.bad, /4 item inputs > layout 3/);
});

test('M9-20: ratchetDiff reports new and stale keys', () => {
  assert.deepEqual(ratchetDiff(['a', 'b'], ['a', 'c']), { fresh: ['b'], stale: ['c'] });
});

test('M8-04: the stand-in records setMaxIOSize per recipe type', () => {
  const root = tmp();
  put(root, 'kubejs/startup_scripts/t.js', "GTCEuStartupEvents.registry('gtceu:recipe_type', (event) => { event.create('afa1_type').setMaxIOSize(3, 2, 1, 1); });");
  const run = runPackScripts(root);
  assert.deepEqual(run.registry.recipeTypes.get('gtceu:afa1_type').maxIO, [3, 2, 1, 1]);
});

test('M9-20: check-static fails on a console.error that is not baselined', async () => {
  const { spawnSync } = await import('node:child_process');
  const root = tmp();
  put(root, 'kubejs/server_scripts/e.js', "console.error('afa1 brand new problem');");
  const here = path.dirname(fileURLToPath(import.meta.url));
  const r = spawnSync(process.execPath, [path.join(here, '..', 'check-static.mjs'), '--pack', root], { encoding: 'utf8' });
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /FAIL console-error/);
  assert.match(r.stdout, /new console\.error: .*afa1 brand new problem/);
});
