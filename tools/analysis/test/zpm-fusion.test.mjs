// ZPM-A7: the Mk2 fusion audit (docs/eras/zpm.md, "Fusion, and what is not fusion"), our D + He-3 recipe, the plasma quench caster and the direct
// energy converter, and the native fixture's band. No Java, no Minecraft.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const read = p => fs.readFileSync(path.join(root, ...p.split('/')), 'utf8');
const mk1 = JSON.parse(read('pack/kubejs/data/grindless/tables/fusion_mk1.json'));
const TABLE = 'pack/kubejs/data/grindless/tables/fusion_mk2.json';
const table = JSON.parse(read(TABLE));
const SERVER = 'pack/kubejs/server_scripts/grindless/zpm/fusion.js';
const STARTUP = 'pack/kubejs/startup_scripts/grindless/zpm/fusion.js';

const mk2Runs = (eut, start) => eut <= table.mk2.maxEUt && start <= table.mk2.maxStart;

test('the Mk2 limits are GTM\'s: ZPM EU/t and 16 hatches x 20 M EU, twice the Mk1\'s start', () => {
  assert.equal(table.mk2.machine, 'gtceu:zpm_fusion_reactor');
  assert.equal(table.mk2.maxEUt, 131072);
  assert.equal(table.mk2.maxStart, table.mk2.energyHatches * table.mk2.startPerHatch);
  assert.equal(table.mk2.maxStart, 320000000);
  assert.equal(table.mk2.maxStart, 2 * mk1.mk1.maxStart);
});

test('the audit is every Mk1 table recipe the Mk2 runs, exactly once, and `beyond` is the rest', () => {
  const ids = table.recipes.map(r => r.id);
  assert.equal(new Set(ids).size, ids.length);
  const runs = mk1.recipes.filter(r => mk2Runs(r.eut, r.start)).map(r => r.id).sort();
  assert.deepEqual([...ids].sort(), runs);
  const rest = mk1.recipes.filter(r => !mk2Runs(r.eut, r.start)).map(r => r.id).sort();
  assert.deepEqual([...table.beyond].sort(), rest);
  for (const r of table.recipes) {
    const src = mk1.recipes.find(m => m.id === r.id);
    // LuV rebuilds the duranium recipe with a 200 M start (fusion.js there)
    const start = r.id.endsWith('gallium_and_radon_to_duranium_plasma') ? 200000000 : src.start;
    assert.deepEqual([r.eut, r.start], [src.eut, start], r.id);
    assert.ok(['keep', 'luv_cut'].includes(r.fate), r.id);
    assert.equal(r.fate === 'luv_cut', src.fate === 'cut', 'ZPM cuts nothing: ' + r.id);
    assert.ok(r.why && r.why.length > 0, r.id);
  }
});

test('our D + He-3 starts above the Mk1\'s limit and within the Mk2\'s, and nothing else of ours is in the audit', () => {
  assert.equal(table.ours.length, 1);
  const o = table.ours[0];
  assert.equal(o.id, 'grindless:fusion_reactor/' + o.builderId.replace('grindless:', ''));
  assert.ok(o.start > mk1.mk1.maxStart && o.start <= table.mk2.maxStart);
  assert.ok(o.eut <= table.mk2.maxEUt);
  assert.deepEqual(o.inputs.map(i => i.tag || i.fluid), ['forge:deuterium', 'gtceu:helium_3']);
  assert.equal(o.output.id, 'gtceu:helium_plasma');
  assert.ok(!table.recipes.some(r => r.id === o.id));
});

test('the converter pays 1.25 x the plasma turbine\'s EU per mB, and the quench caster keeps its argon', () => {
  const c = table.converter;
  assert.equal(c.factor, 1.25);
  for (const r of c.recipes) assert.equal(c.eut * r.duration, c.factor * r.turbineEUPerMB, r.name);
  const q = table.quench;
  assert.ok(q.argon.returned < q.argon.amount && q.argon.returned >= 0.9 * q.argon.amount);
  assert.deepEqual(q.metals.filter(m => !m.foil).map(m => m.name), ['darmstadtium']);
});

function serverHarness(liveIds) {
  const added = [], logs = { info: [], warn: [], error: [] }, shaped = [];
  const G = { readJsonTable: p => {
    // UEV-A7 adds the converter's three Mk4 rows, read from its own table
    if (p === 'kubejs/data/grindless/tables/fusion_mk4.json' || p === 'kubejs/data/grindless/tables/fusion_mk5.json') return JSON.parse(read('pack/' + p)); // UIV-A9: the Mk5 converter table
    assert.equal(p, 'kubejs/data/grindless/tables/fusion_mk2.json'); return JSON.parse(read(TABLE));
  } };
  const live = liveIds.map(id => {
    const row = mk1.recipes.find(r => r.id === id);
    const [eut, start] = row ? [row.eut, row.start] : [24576, 100000000];
    return { getId: () => id, json: JSON.stringify({ tickInputs: { eu: [{ content: eut }] }, data: { eu_to_start: start } }) };
  });
  const builder = (type, id) => {
    const r = { type, id, calls: {} }; added.push(r);
    const b = new Proxy({}, { get: (_t, name) => (...args) => { (r.calls[name] ??= []).push(args); return b; } });
    return b;
  };
  const context = vm.createContext({
    global: { grindless: G },
    console: { info: s => logs.info.push(s), warn: s => logs.warn.push(s), error: s => logs.error.push(s) },
    Fluid: { of: (id, amount) => ({ id, amount }), exists: () => true },
    Item: { exists: () => true },
    ServerEvents: { recipes(fn) {
      fn({
        forEachRecipe(q, cb) { assert.equal(q.type, 'gtceu:fusion_reactor'); live.forEach(cb); },
        recipes: { gtceu: new Proxy({}, { get: (_t, type) => type === 'shaped'
          ? (id, ...a) => { shaped.push([id, ...a]); return { id: x => { shaped[shaped.length - 1].push(x); } }; }
          : id => builder(type, id) }) }
      });
    } }
  });
  vm.runInContext(read(SERVER), context);
  return { G, added, shaped, logs };
}

test('fusion.js adds our recipe, five caster recipes, two converter recipes and two controllers, and audits clean', () => {
  const { G, added, shaped, logs } = serverHarness(mk1.recipes.filter(r => mk2Runs(r.eut, r.start) && r.fate !== 'cut').map(r => r.id));
  const f = added.filter(a => a.type === 'fusion_reactor');
  assert.equal(f.length, 1);
  assert.equal(f[0].id, 'grindless:d_he3_to_helium_plasma');
  assert.deepEqual(f[0].calls.inputFluids.flat(), ['#forge:deuterium 125', 'gtceu:helium_3 125']);
  assert.deepEqual(f[0].calls.EUt, [[16384]]);
  assert.deepEqual(f[0].calls.fusionStartEU, [[200000000]]);
  const q = added.filter(a => a.type === 'plasma_quench');
  assert.deepEqual(q.map(a => a.id).sort(), ['grindless:darmstadtium_plate', 'grindless:duranium_foil', 'grindless:duranium_plate',
      'grindless:plasma_sprayed_tile', 'grindless:tritanium_foil', 'grindless:tritanium_plate']); // UIV-A9 adds plasma_sprayed_tile
  for (const a of q) assert.deepEqual(a.calls.EUt, [[30720]]);
  // UEV-A7 adds the three Mk4 rows (2-tick, at the converter's own EU/t)
  const d = added.filter(a => a.type === 'direct_conversion');
  assert.deepEqual(d.map(a => a.calls.duration[0][0]), [80, 256, 2, 2, 2, 2, 2, 2]); // UIV-A9 adds the three Mk5 rows
  for (const a of d.slice(0, 2)) assert.deepEqual(a.calls.EUt, [[-2560]]);
  assert.deepEqual(shaped.map(s => s[s.length - 1]).sort(), ['grindless:crafting/direct_energy_converter', 'grindless:crafting/plasma_quench_caster']);
  assert.deepEqual(Array.from(G.zpmFusion.unaudited), []);
  assert.deepEqual(Array.from(G.zpmFusion.missing), []);
  assert.deepEqual(Array.from(G.zpmFusion.luvCutsLive), []);
  assert.equal(logs.error.length, 0, logs.error.join('\n'));
});

test('fusion.js reports a new Mk2-runnable recipe, a LuV cut that came back and a missing kept recipe', () => {
  const ids = mk1.recipes.filter(r => mk2Runs(r.eut, r.start) && r.fate !== 'cut').map(r => r.id);
  const cut = mk1.recipes.find(r => r.fate === 'cut').id;
  const { G, logs } = serverHarness([...ids.slice(1), cut, 'gtca:fusion_reactor/new_addon_plasma']);
  assert.deepEqual(Array.from(G.zpmFusion.missing), [ids[0]]);
  assert.deepEqual(Array.from(G.zpmFusion.luvCutsLive), [cut]);
  assert.equal(G.zpmFusion.unaudited.length, 1);
  assert.ok(logs.error.some(s => s.includes('new_addon_plasma')));
});

test('the startup script registers both types and machines with the recipe types the server script writes', () => {
  const src = read(STARTUP);
  for (const s of ["'plasma_quench'", "'direct_conversion'", "'plasma_quench_caster'", "'direct_energy_converter'", ".setEUIO('out')",
    '.generator(true)', 'Gen.configure', 'robust_machine_casing', 'grindless:cryostat_casing']) assert.ok(src.includes(s) || src.includes(s.replace(/'/g, '"')) || src.includes('Gen.configure'), s);
  assert.ok(src.includes("setEUIO('out')"));
  // the converter's types must stay out of the doubling list: its figures are final
  assert.ok(!read('pack/kubejs/server_scripts/grindless/power/generators.js').includes('direct_conversion'));
});

test('every lang key the startup script uses exists in both languages', () => {
  const lang = read('pack/kubejs/client_scripts/grindless/zpm_fusion_lang.js');
  const keys = [...read(STARTUP).matchAll(/Text\.translate\('([^']+)'\)/g)].map(m => m[1])
    .filter(k => k.startsWith('grindless.machine.plasma_quench_caster') || k.startsWith('grindless.machine.direct_energy_converter'));
  assert.equal(keys.length, 6);
  for (const k of keys) assert.equal(lang.split("'" + k + "'").length - 1, 2, k);
  for (const k of ['block.gtceu.plasma_quench_caster', 'gtceu.plasma_quench', 'block.gtceu.direct_energy_converter', 'gtceu.direct_conversion'])
    assert.equal(lang.split("'" + k + "'").length - 1, 2, k);
});

test('the native fixture stays in band X 20736-20799, Z 0-63, Y 98-112 and has a zones row', () => {
  const zones = JSON.parse(read('tools/test/zones.json')).zones;
  const z = zones.find(x => x.id === 'zpm_a7');
  assert.deepEqual([z.x, z.z, z.y, z.tests], [[20736, 20799], [0, 63], [98, 112], ['zpm_fusion']]);
  const src = read('tools/test/overlay/kubejs/server_scripts/gg_test_zpm_fusion.js');
  assert.ok(src.includes("'gg_test_zpm_fusion'") || src.includes('gg_test_zpm_fusion'));
  const nums = [...src.matchAll(/\bX0\s*=\s*(\d+)/g)].map(m => Number(m[1]));
  for (const n of nums) assert.ok(n >= 20736 && n <= 20799, String(n));
});
