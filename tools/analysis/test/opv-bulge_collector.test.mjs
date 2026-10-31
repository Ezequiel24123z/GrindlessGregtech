// OpV-R3 (collector nodes and the bulge collector): the collector node works and the bulge collector (machines 17 and 18, line 40), refinery c7,
// their controller lines and the structure of startup_scripts/grindless/opv/bulge_collector.js. The balance rule (power-balance-rule.txt of the
// recovery contracts): the three collector rows share one duration = ceil(1.5 x fullCost(pack) / 2^26 / 100) x 100 and the EU a pack returns is
// 1.3 to 2.5 times its full cost. T1 is gg_test_opv_bulge_collector.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const BC = run.global.grindless.bulgeCollector;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const plain = (x) => JSON.parse(JSON.stringify(x));
const ids = (list) => plain(list.map((x) => [x.id, x.count]));
const kube = (...p) => fs.readFileSync(path.join(pack, 'kubejs', ...p), 'utf8');
const table = (name) => JSON.parse(kube('data', 'grindless', 'tables', name + '.json'));
const SITE = 'grindless:terzan5_core';
const V_UXV = 2 ** 27;
const VA_OPV = 503316480;
const MACHINES = ['collector_node_works', 'bulge_collector'];
const TYPES = ['collector_node_assembly', 'bulge_light_collection'];
const DIMS = [[9, 5, 13], [13, 7, 13]];

const rows = new Map();
for (const file of ['replication', 'bulge_collector']) {
  for (const [type, def] of Object.entries(table(file).types)) for (const r of def.recipes) rows.set(r.name, { ...r, type });
}
const row = (n) => rows.get(n);
const eu = (n) => row(n).eut * row(n).duration;
const BC_ROWS = BC.recipes;
const rec = (name) => BC_ROWS.find((r) => r.name === name);

// Cost model, in EU. Every row's cost is its eut x duration; an item made by a row costs (the row + its inputs) / its output count. Named assumptions
// (the doc's design leaves these open), each one the cheaper reading for the collector or an explicit unknown step:
//  A1 the four outputs of debris c2 share its cost equally (2 metal + 2 silicate fractions)           [tables/replication.json debris_fractions]
//  A2 the CO the carbonyl loop loses (100 mB per cycle), graphite plates, oxygen and spent anodes cost nothing [replication.json c1, c2, c5]
//  A3 the vitamin kit V and the node power transmitter T are assembler rows at VA[OpV] for 400 t (server_scripts/grindless/opv/pathfinder.js:35, :40)
//     fed by ONE unknown upstream step each, which costs VA[OpV] x 1200 t (the binding rule for an unknown step)
//  A4 refinery c7 returns 8 Si alloy powder per 4 spent nodes (a pack's spent nodes), valued at the Si cost, minus the c7 run itself
const UNKNOWN_STEP = VA_OPV * 1200;
const T = VA_OPV * 400 + UNKNOWN_STEP;
const V = VA_OPV * 400 + UNKNOWN_STEP;
function costs() {
  const debris = eu('bulge_debris_harvest') / 4;
  const fraction = (eu('debris_fractions') + 4 * debris) / 4;
  const carbonyl = eu('metal_carbonyl_synthesis') + 2 * fraction;
  const feni = (eu('carbonyl_decomposition') + carbonyl) / 2;
  const feedstock = (eu('metal_feedstock_sinter') + 2 * feni) / 4;
  const pellet = (eu('ffc_pellet_press') + 2 * fraction) / 2;
  const si = (eu('ffc_salt_bath') + 4 * pellet) / 2;
  const casing = (eu('cluster_casing_sinter') + 4 * si) / 2;
  const seed = eu('probe_self_copy') + 16 * feedstock + 8 * casing + V;
  const ribbon = (eu('node_si_ribbon') + 2 * si) / 2;
  const film = eu('node_pv_film') + 2 * ribbon + fraction;
  const node = eu('collector_node_assembly') + 2 * film + T + casing;
  const pack = eu('node_pack_deploy') + 4 * node + seed;
  const recovered = 8 * si - eu('spent_node_recovery');
  return { debris, fraction, feedstock, si, casing, seed, ribbon, film, node, pack, recovered, fullCost: pack - recovered };
}
const COST = costs();
const SHARED = Math.ceil((1.5 * COST.fullCost) / 2 ** 26 / 100) * 100;

test('the stand-in runs the OpV-R3 scripts without errors, nothing skipped, no lookup clash', () => {
  const mine = run.errors.filter((e) => /bulge_collector|replication/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(BC.skipped), []);
  assert.deepEqual(plain(BC.clashes), []);
  assert.deepEqual(plain(run.global.grindless.replication.skipped), []);
});

test('each machine is registered on its recipe type with one controller and its designed size', () => {
  MACHINES.forEach((m, i) => {
    const reg = run.registry.machines.get('gtceu:' + m);
    assert.ok(reg, m);
    assert.deepEqual(reg.recipeTypes, ['gtceu:' + TYPES[i]]);
    const s = run.docs.structures.structures['gtceu:' + m];
    assert.ok(s, m + ' structure');
    const cells = s.slices.flatMap((sl) => sl.join('').split(''));
    assert.equal(cells.filter((c) => c === 'S').length, 1, m + ' one controller');
    for (const sl of s.slices) for (const r of sl) for (const c of r) assert.ok(c === ' ' || s.symbols[c], m + ' symbol ' + c);
    assert.deepEqual([s.slices[0][0].length, s.slices[0].length, s.slices.length], DIMS[i]);
  });
  const dynamo = run.docs.structures.structures['gtceu:bulge_collector'].symbols.X;
  assert.ok(JSON.stringify(dynamo).includes('energy_output'), 'dynamo hatch part');
  assert.ok(JSON.stringify(dynamo.options.find((o) => o.ability === 'energy_output').limits).includes('"max":1'), 'one dynamo hatch');
});

test('node works c1-c4: ribbon, film, node, deployed pack; 268,435,456 EU/t, Terzan 5 only, no output returns as an input', () => {
  const t = BC_ROWS.filter((r) => r.type === 'collector_node_assembly');
  assert.deepEqual(plain(t.map((r) => r.circuit)), [1, 2, 3, 4]);
  for (const r of t) assert.deepEqual([r.eut, r.site, r.duration], [2 * V_UXV, SITE, 400], r.name);
  assert.deepEqual(ids(rec('node_si_ribbon').itemsIn), [['grindless:si_alloy_powder', 2]]);
  assert.deepEqual(ids(rec('node_si_ribbon').itemsOut), [['grindless:si_ribbon', 2]]);
  assert.deepEqual(ids(rec('node_pv_film').itemsIn), [['grindless:si_ribbon', 2], ['grindless:silicate_debris_fraction', 1]]);
  assert.deepEqual(ids(rec('node_pv_film').itemsOut), [['grindless:pv_collector_film', 1]]);
  assert.deepEqual(ids(rec('collector_node_assembly').itemsIn),
    [['grindless:pv_collector_film', 2], ['grindless:node_power_transmitter', 1], ['grindless:cluster_sinter_casing', 1]]);
  assert.deepEqual(ids(rec('collector_node_assembly').itemsOut), [['grindless:collector_node', 1]]);
  assert.deepEqual(ids(rec('node_pack_deploy').itemsIn), [['grindless:collector_node', 4], ['grindless:probe_seed', 1]]);
  assert.deepEqual(ids(rec('node_pack_deploy').itemsOut), [['grindless:deployed_node_pack', 1]]);
  for (const r of t) {
    const inIds = new Set(r.itemsIn.concat(r.kept, r.wear).map((x) => x.id));
    for (const o of r.itemsOut) assert.ok(!inIds.has(o.id), `${r.name}: ${o.id} returns as its own input`);
  }
  assert.ok(!JSON.stringify(BC_ROWS).includes('kerf'), 'the kerf recycle is dropped');
});

test('collector c1-c3: 1, 4 and 16 packs on one OpV 4 A dynamo hatch (2^26, 2^28, 2^30), one shared duration, packs consumed, census on c3', () => {
  const g = BC_ROWS.filter((r) => r.type === 'bulge_light_collection');
  assert.deepEqual(plain(g.map((r) => [r.circuit, r.eut, r.generator, r.site])), [[1, 2 ** 26, true, SITE], [2, 2 ** 28, true, SITE], [3, 2 ** 30, true, SITE]]);
  assert.deepEqual(plain(g.map((r) => r.kept.length + r.wear.length)), [0, 0, 0]);
  assert.deepEqual(plain(g.map((r) => ids(r.itemsIn))), [[['grindless:deployed_node_pack', 1]], [['grindless:deployed_node_pack', 4]], [['grindless:deployed_node_pack', 16]]]);
  assert.deepEqual(ids(g[0].itemsOut), [['grindless:spent_collector_node', 4]]);
  assert.deepEqual(ids(g[1].itemsOut), [['grindless:spent_collector_node', 16]]);
  assert.deepEqual(ids(g[2].itemsOut), [['grindless:spent_collector_node', 64], ['grindless:bulge_light_census', 1]]);
  assert.equal(new Set(g.map((r) => r.duration)).size, 1, 'one shared duration');
  const hatch4a = 2 ** 31; // an OpV hatch: V[OpV] = 2^29 x 4 A = 2^31 EU/t, above the largest row (2^30)
  for (const r of g) assert.ok(r.eut <= hatch4a, r.name);
  for (const r of BC_ROWS.concat(run.global.grindless.replication.recipes)) assert.ok(r.eut < 2 ** 31, `${r.name}: below 2^31`);
  for (const r of g) assert.ok(JSON.stringify(find(`grindless:${r.type}/${r.name}`).j.recipeConditions || []).includes(SITE), `${r.name}: dimension lock`);
});

test('balance: the shared duration follows from fullCost(pack) and the pack returns 1.3-2.5x its cost in EU (design 2,400 t returned about 0.13x)', () => {
  // the lookup of every named cost against the rows: a pack is a whole seed run + 16 feedstock + 8 casings, 4 nodes, c4, minus the Si c7 returns
  assert.ok(COST.fullCost > 0 && COST.recovered > 0 && COST.recovered < COST.pack / 4, 'c7 returns a part of the cost, not most of it');
  assert.equal(rec('bulge_light_1').duration, SHARED, `shared duration is ${SHARED} (fullCost ${COST.fullCost})`);
  for (const r of BC_ROWS.filter((x) => x.type === 'bulge_light_collection')) {
    const packs = Number(r.itemsIn[0].count);
    const ratio = (r.eut * r.duration) / (packs * COST.fullCost);
    assert.ok(ratio >= 1.3 && ratio <= 2.5, `${r.name}: ratio ${ratio}`);
  }
  const designRatio = (2 ** 26 * 2400) / COST.fullCost;
  assert.ok(designRatio < 0.01, 'the design 2,400 t was far below one pack: ' + designRatio);
});

test('refinery c7: 4 spent nodes -> 8 Si alloy powder (half of their silicon), circuit 7, Terzan 5 only', () => {
  const r = run.global.grindless.replication.recipes.find((x) => x.name === 'spent_node_recovery');
  assert.deepEqual([r.type, r.circuit, r.eut, r.site], ['replication_refining', 7, 2 * V_UXV, SITE]);
  assert.deepEqual(ids(r.itemsIn), [['grindless:spent_collector_node', 4]]);
  assert.deepEqual(ids(r.itemsOut), [['grindless:si_alloy_powder', 8]]);
  // a pack's four nodes hold 4 x 2 films x 2 ribbons x 1 Si = 16 Si; 8 come back
  assert.equal(8 / (4 * 2 * 2), 0.5);
});

test('controller lines: OpV hull, components, circuits (4 and 8), research item; VA[OpV]; no component below OpV', () => {
  assert.deepEqual(plain(BC.controllerRecipes), MACHINES.map((m) => `grindless:assembly_line/${m}`));
  for (const m of MACHINES) {
    const r = find(`grindless:assembly_line/${m}`);
    assert.ok(r, m);
    const j = JSON.stringify(r.j);
    assert.ok(j.includes('opv_machine_hull'), `${m}: OpV hull`);
    assert.ok(j.includes('circuits/opv'), `${m}: OpV circuits`);
    assert.ok(!/gtceu:(uxv|uiv|uev|uhv|max|zpm|uv)_/.test(j), `${m}: no component below OpV, no MAX id`);
  }
  assert.ok(JSON.stringify(find('grindless:assembly_line/collector_node_works').j).includes('cluster_sinter_casing'));
  assert.ok(JSON.stringify(find('grindless:assembly_line/bulge_collector').j).includes('collector_node'));
  const s = kube('server_scripts', 'grindless', 'opv', 'bulge_collector.js');
  assert.match(s, /'8x #gtceu:circuits\/opv'/);
  assert.ok(!s.includes('event.custom'), 'every recipe goes through the builder');
});

test('names, items, info pages and lang exist in en_us and es_es', () => {
  for (const m of MACHINES) {
    const k = 'block.gtceu.' + m;
    assert.ok(run.lang.en_us[k] && run.lang.es_es[k], k);
    assert.notEqual(run.lang.en_us[k], run.lang.es_es[k]);
    for (const n of [0, 1]) {
      const info = `emi.grindless.info.${m}.${n}`;
      assert.ok(run.lang.en_us[info] && run.lang.es_es[info], info);
    }
  }
  TYPES.forEach((t) => assert.ok(run.lang.en_us['gtceu.' + t] && run.lang.es_es['gtceu.' + t], t));
  for (const it of ['si_ribbon', 'pv_collector_film']) {
    for (const k of [`item.grindless.${it}`, `tooltip.grindless.${it}.0`, `tooltip.grindless.${it}.1`]) assert.ok(run.lang.en_us[k] && run.lang.es_es[k], k);
  }
  for (const r of BC_ROWS) assert.ok(run.lang.en_us[`gtceu.recipe.${r.dataKey}.${r.name}`], r.name);
  assert.ok(run.lang.en_us['gtceu.recipe.grindless_replication_refining.spent_node_recovery']);
});

test('the texture generator is documented and the faces and items exist', () => {
  const gen = fs.readFileSync(path.join(root, 'tools', 'assets', 'Build-OpVBulgeCollectorTextures.ps1'), 'utf8');
  assert.match(gen, /\.SYNOPSIS/);
  const tex = path.join(pack, 'kubejs', 'assets', 'grindless', 'textures');
  for (const m of MACHINES) {
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) assert.ok(fs.existsSync(path.join(tex, 'block', 'multiblock', m, f)), `${m}/${f}`);
  }
  for (const it of ['si_ribbon', 'pv_collector_film']) assert.ok(fs.existsSync(path.join(tex, 'item', it + '.png')), it);
});
