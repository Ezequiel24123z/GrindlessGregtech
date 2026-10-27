// UV-A3: the Mk3 fusion audit (docs/eras/uv.md, "The Mk3 audit"), the laser fusion chamber's table, recipes and structure, the hot cell's boron-11 row,
// the decaborane chemistry and the lattice fab's capsule rows. No Java, no Minecraft.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const read = p => fs.readFileSync(path.join(root, ...p.split('/')), 'utf8');
const mk1 = JSON.parse(read('pack/kubejs/data/grindless/tables/fusion_mk1.json'));
const mk2 = JSON.parse(read('pack/kubejs/data/grindless/tables/fusion_mk2.json'));
const TABLE = 'pack/kubejs/data/grindless/tables/fusion_mk3.json';
const table = JSON.parse(read(TABLE));
const SERVER = 'pack/kubejs/server_scripts/grindless/uv/fusion.js';

const mk3Runs = (eut, start) => eut <= table.mk3.maxEUt && start <= table.mk3.maxStart;

test('the Mk3 limits are GTM\'s: UV EU/t and 16 hatches x 40 M EU, twice the Mk2\'s start', () => {
  assert.equal(table.mk3.machine, 'gtceu:uv_fusion_reactor');
  assert.equal(table.mk3.maxEUt, 524288);
  assert.equal(table.mk3.maxStart, table.mk3.energyHatches * table.mk3.startPerHatch);
  assert.equal(table.mk3.maxStart, 640000000);
  assert.equal(table.mk3.maxStart, 2 * mk2.mk2.maxStart);
});

test('the audit is the Mk2 audit plus the six Mk3-only recipes, each exactly once', () => {
  const ids = table.recipes.map(r => r.id);
  assert.equal(new Set(ids).size, ids.length);
  const older = mk2.recipes.map(r => r.id);
  assert.deepEqual(ids.filter(id => older.includes(id)).sort(), [...older].sort());
  const extra = ids.filter(id => !older.includes(id)).sort();
  assert.deepEqual(extra, [...mk2.beyond].sort());
  assert.deepEqual([...table.mk3Only].sort(), extra);
  for (const r of table.recipes) {
    const src = mk1.recipes.find(m => m.id === r.id);
    assert.ok(src, 'the Mk1 table knows ' + r.id);
    const start = r.id.endsWith('gallium_and_radon_to_duranium_plasma') ? 200000000 : src.start;
    assert.deepEqual([r.eut, r.start], [src.eut, start], r.id);
    assert.ok(mk3Runs(r.eut, r.start), r.id);
    assert.ok(['keep', 'luv_cut'].includes(r.fate), r.id);
    assert.ok(r.why && r.why.length > 0, r.id);
    const old = mk2.recipes.find(m => m.id === r.id);
    if (old) assert.equal(r.fate, old.fate, 'UV cuts nothing: ' + r.id);
  }
});

test('the Mk3-only recipes are the ones above the Mk2\'s start; every Mk1 table recipe the Mk3 can run is listed', () => {
  for (const id of table.mk3Only) {
    const r = table.recipes.find(x => x.id === id);
    assert.ok(r.start > mk2.mk2.maxStart && r.start <= table.mk3.maxStart, id);
    assert.equal(r.fate, 'keep', id);
  }
  const runs = mk1.recipes.filter(r => mk3Runs(r.eut, r.start)).map(r => r.id);
  for (const id of runs) assert.ok(table.recipes.some(r => r.id === id), 'unlisted: ' + id);
});

test('UV adds no Mk3 recipe of its own, and the table\'s chamber rows match the contract', () => {
  assert.deepEqual(table.ours, []);
  const c = table.chamber;
  assert.equal(c.machine, 'gtceu:laser_fusion_chamber');
  assert.equal(c.type, 'gtceu:laser_fusion');
  assert.equal(c.eut, 5 * 524288);
  assert.deepEqual(c.recipes.map(r => [r.name, r.capsule, r.duration, r.helium, r.hydrogen]), [
    ['pb11', 'grindless:pb11_capsule', 400, 3000, 0],
    ['d_he3', 'grindless:d_he3_capsule', 600, 1000, 1000]
  ]);
});

function serverHarness(liveIds) {
  const logs = { info: [], warn: [], error: [] };
  const G = { readJsonTable: p => { assert.equal(p, 'kubejs/data/grindless/tables/fusion_mk3.json'); return JSON.parse(read(TABLE)); } };
  const live = liveIds.map(id => {
    const row = table.recipes.find(r => r.id === id);
    const [eut, start] = row ? [row.eut, row.start] : [24576, 100000000];
    return { getId: () => id, json: JSON.stringify({ tickInputs: { eu: [{ content: eut }] }, data: { eu_to_start: start } }) };
  });
  const context = vm.createContext({
    global: { grindless: G },
    console: { info: s => logs.info.push(s), warn: s => logs.warn.push(s), error: s => logs.error.push(s) },
    ServerEvents: { recipes(fn) {
      fn({ forEachRecipe(q, cb) { assert.equal(q.type, 'gtceu:fusion_reactor'); live.forEach(cb); } });
    } }
  });
  vm.runInContext(read(SERVER), context);
  return { G, logs };
}

test('fusion.js audits clean: every live recipe listed, LuV\'s three cuts absent', () => {
  const live = table.recipes.filter(r => r.fate === 'keep').map(r => r.id);
  const { G, logs } = serverHarness(live);
  assert.equal(logs.error.length, 0);
  assert.equal(G.uvFusion.audited.length, live.length);
  assert.equal(G.uvFusion.unaudited.length, 0);
  assert.equal(G.uvFusion.missing.length, 0);
  assert.equal(G.uvFusion.luvCutsLive.length, 0);
});

test('fusion.js flags an unlisted recipe the Mk3 can run, and one that comes back after LuV cut it', () => {
  const live = table.recipes.map(r => r.id).concat(['gtceu:fusion_reactor/some_new_recipe']);
  const { G, logs } = serverHarness(live);
  assert.equal(G.uvFusion.unaudited.length, 1);
  assert.match(G.uvFusion.unaudited[0], /some_new_recipe/);
  assert.equal(G.uvFusion.luvCutsLive.length, 3);
  assert.ok(logs.error.some(s => /unaudited Mk3 recipe/.test(s)));
});

test('fusion.js reports a listed keep recipe that is not in the manager', () => {
  const live = table.recipes.filter(r => r.fate === 'keep').map(r => r.id).slice(1);
  const { G } = serverHarness(live);
  assert.equal(G.uvFusion.missing.length, 1);
});
