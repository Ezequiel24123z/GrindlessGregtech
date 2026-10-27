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

function serverHarness(liveIds, known = () => true) {
  const logs = { info: [], warn: [], error: [] };
  const added = [];
  const G = { readJsonTable: p => { assert.equal(p, 'kubejs/data/grindless/tables/fusion_mk3.json'); return JSON.parse(read(TABLE)); } };
  const live = liveIds.map(id => {
    const row = table.recipes.find(r => r.id === id);
    const [eut, start] = row ? [row.eut, row.start] : [24576, 100000000];
    return { getId: () => id, json: JSON.stringify({ tickInputs: { eu: [{ content: eut }] }, data: { eu_to_start: start } }) };
  });
  const builder = (type, id) => {
    const rec = { type, id, calls: {} };
    added.push(rec);
    const b = new Proxy({}, { get: (_, k) => {
      if (k === 'id') return x => { rec.id = x; return b; };
      return (...a) => { (rec.calls[k] ||= []).push(a); return b; };
    } });
    return b;
  };
  const gtceu = new Proxy({}, { get: (_, type) => (id, ...rest) => {
    if (type === 'shaped') { const b = builder(type, null); rec2(b, id, rest); return b; }
    return builder(type, id);
  } });
  const rec2 = (b, out, rest) => { added[added.length - 1].shaped = { out, rest }; };
  const context = vm.createContext({
    global: { grindless: G },
    Item: { exists: known },
    Fluid: { exists: known, of: (id, amount) => ({ id, amount }) },
    console: { info: s => logs.info.push(s), warn: s => logs.warn.push(s), error: s => logs.error.push(s) },
    ServerEvents: { recipes(fn) {
      fn({ recipes: { gtceu }, forEachRecipe(q, cb) { assert.equal(q.type, 'gtceu:fusion_reactor'); live.forEach(cb); } });
    } }
  });
  vm.runInContext(read(SERVER), context);
  return { G, logs, added };
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

test('chamber recipes: capsule + circuit, 2 % module wear in and out, helium (and hydrogen) out, 5x the Mk3 EU/t as a generator', () => {
  const { added, G, logs } = serverHarness([]);
  assert.equal(logs.error.length, 0, logs.error.join(' | '));
  const rows = added.filter(r => r.type === 'laser_fusion');
  assert.deepEqual(rows.map(r => r.id), ['grindless:laser_fusion/pb11', 'grindless:laser_fusion/d_he3']);
  const [a, b] = rows;
  assert.deepEqual(a.calls.itemInputs, [['1x grindless:pb11_capsule']]);
  assert.deepEqual(b.calls.itemInputs, [['1x grindless:d_he3_capsule']]);
  assert.deepEqual([a.calls.circuit[0][0], b.calls.circuit[0][0]], [1, 2]);
  for (const r of rows) {
    assert.deepEqual(r.calls.chancedInput, [['1x grindless:fibre_laser_module', 200, 0]]);
    assert.deepEqual(r.calls.chancedOutput, [['1x grindless:spent_laser_module', 200, 0]]);
    assert.equal(r.calls.EUt[0][0], -2621440);
  }
  assert.deepEqual([a.calls.duration[0][0], b.calls.duration[0][0]], [400, 600]);
  assert.deepEqual(a.calls.outputFluids.map(x => x[0].amount), [3000]);
  assert.deepEqual(b.calls.outputFluids.map(x => [x[0].id, x[0].amount]), [['gtceu:helium', 1000], ['gtceu:hydrogen', 1000]]);
  assert.equal(G.uvFusion.chamber.length, 2);
});

test('chamber crafting recipe and decaborane row are added; unknown ids skip with an error instead of a half recipe', () => {
  const { added } = serverHarness([]);
  const craft = added.find(r => r.id === 'grindless:crafting/laser_fusion_chamber');
  assert.ok(craft && craft.shaped.out === 'gtceu:laser_fusion_chamber');
  const d = added.find(r => r.id === 'grindless:chemical_reactor/decaborane');
  assert.ok(d);
  assert.deepEqual(d.calls.inputFluids.map(x => [x[0].id, x[0].amount]), [['gtceu:boron_11_trifluoride', 3000], ['gtceu:hydrogen', 6000]]);
  assert.deepEqual(d.calls.outputFluids.map(x => [x[0].id, x[0].amount]), [['gtceu:decaborane', 1000], ['gtceu:hydrofluoric_acid', 9000]]);
  const s = serverHarness([], id => !/boron_11_trifluoride|pb11_capsule/.test(id));
  assert.equal(s.added.filter(r => r.type === 'laser_fusion' || r.id === 'grindless:chemical_reactor/decaborane').length, 0);
  assert.ok(s.logs.error.length >= 2);
});

test('hot cell: boron-11 is circuit 6 and its row feeds the trifluoride the decaborane route consumes', () => {
  const hc = JSON.parse(read('pack/kubejs/data/grindless/tables/hot_cell.json'));
  assert.ok(hc.modes.some(m => m.circuit === 6 && m.name === 'boron_11'));
  assert.equal(new Set(hc.modes.map(m => m.circuit)).size, hc.modes.length);
  const r = hc.recipes.find(x => x.name === 'boron_11_enrichment');
  assert.equal(r.circuit, 6);
  assert.ok(r.fluidsOut.some(f => f.id === 'gtceu:boron_11_trifluoride'));
  assert.ok(r.fluidsOut.some(f => f.id === 'gtceu:boron_10_trifluoride'));
  assert.ok(r.eut <= 7680 * 2);
});

test('lattice fab: the capsule rows use free circuits 3 and 4 and make the two capsules', () => {
  const src = read('pack/kubejs/server_scripts/grindless/zpm/qubits.js');
  assert.match(src, /name: 'pb11_capsule', type: 'diamond_cvd', circuit: 3/);
  assert.match(src, /name: 'd_he3_capsule', type: 'diamond_cvd', circuit: 4/);
  assert.match(src, /gtceu:decaborane/);
  assert.match(src, /grindless:d_he3_capsule/);
});

function startupPattern() {
  const src = read('pack/kubejs/startup_scripts/grindless/uv/fusion.js');
  return src;
}

test('chamber startup: 13 x 13 x 13 shell with 32 laser module blocks on the beam ring, UV casing, spent module item', () => {
  const src = startupPattern();
  assert.match(src, /gtceu:laser_fusion_chamber/);
  assert.match(src, /gtceu:uv_machine_casing/);
  assert.match(src, /grindless:laser_module_block/);
  assert.match(src, /grindless:spent_laser_module/);
  assert.match(src, /'CLLLLCCCLLLLC'/);
  const ring = 'CLLLLCCCLLLLC';
  const perimeter = (z, x) => ring[(z === 0 || z === 12) ? x : z];
  let lasers = 0;
  for (let z = 0; z < 13; z++) for (let x = 0; x < 13; x++) if ((z === 0 || z === 12 || x === 0 || x === 12) && perimeter(z, x) === 'L') lasers++;
  assert.equal(lasers, 32);
  assert.match(src, /SIZE = 13/);
});

test('chamber lang: both locales name the machine, recipe type, no-voiding reason and spent module', () => {
  const src = read('pack/kubejs/client_scripts/grindless/uv_fusion_lang.js');
  for (const k of ['block.gtceu.laser_fusion_chamber', 'gtceu.laser_fusion', 'grindless.machine.laser_fusion_chamber.no_voiding', 'item.grindless.spent_laser_module']) {
    assert.equal(src.split("'" + k + "'").length - 1, 2, k + ' in en_us and es_es');
  }
});
