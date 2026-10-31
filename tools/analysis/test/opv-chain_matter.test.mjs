// OpV-A0 chain matter (docs/eras/opv.md "A0. Bulge relay, chain matter and the hull", process lines 1 and 2), no game needed: the 8 items of
// startup_scripts/grindless/opv/chain_matter.js, the 11 OpV-A0 rows of tables/vela_pasta.json at SGR 1806-20, the PBO plant's c8 braid
// (server_scripts/grindless/uhv/elevator.js) and the strand cable covering (server_scripts/grindless/opv/bulge_relay.js).
// T1 is gg_test_opv_chain_matter (tools/test/overlay/kubejs/server_scripts/gg_test_opv_chain_matter.js).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const side = (r, s) => JSON.stringify((r.j && r.j[s]) || {});
const producers = (id) => recipes.filter((r) => side(r, 'outputs').includes(`"${id}"`)).map((r) => r.i);
const consumers = (id) => recipes.filter((r) => side(r, 'inputs').includes(`"${id}"`)).map((r) => r.i);
const itemsOf = (r, s) => r.j[s].item.filter((e) => e.content.type !== 'gtceu:circuit').map((e) => [e.content.ingredient.item, e.content.count]);
const ids = (list) => plain(list.map((x) => [x.id, x.count]));
const SGR = 'grindless:sgr1806_orbit';
const ITEMS = ['chain_crust_slab', 'caged_chain_phase', 'chain_lattice_slab', 'caged_chain_lattice', 'chain_lamina', 'chain_mesh_weave', 'caged_ni_chain',
  'pbo_braided_chain_wire'];
const table = JSON.parse(fs.readFileSync(path.join(kube, 'data', 'grindless', 'tables', 'vela_pasta.json'), 'utf8'));
const mine = () => Object.entries(table.types).flatMap(([type, t]) => t.recipes.filter((r) => /^OpV-A0/.test(r._why || '')).map((r) => ({ type, ...r })));
const VP = run.global.grindless.velaPasta;
const rec = (type, name) => VP.recipes.find((r) => r.type === type && r.name === name);

test('the stand-in runs chain_matter.js, vela_pasta.js, elevator.js and bulge_relay.js without errors; nothing skipped, no clash', () => {
  const errs = run.errors.filter((e) => /chain_matter|vela_pasta|uhv[\\/]elevator|bulge_relay/.test(String(e.file)) && !/no original recipe/.test(String(e.message)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(VP.skipped), []);
  assert.deepEqual(plain(VP.clashes), []);
  const E = run.global.grindless.elevator;
  assert.deepEqual(plain(E.skipped || []), []);
  assert.deepEqual(plain(E.clashes || []), []);
  assert.deepEqual(plain(run.global.grindless.opvBulgeRelay.skipped), []);
});

test('8 items registered by opv/chain_matter.js, named and tooltipped in en_us and es_es, each with its texture', () => {
  const C = plain(run.global.grindless.opvChainMatter);
  assert.deepEqual([...C.items].sort(), ITEMS.map((n) => `grindless:${n}`).sort());
  assert.equal(C.site, SGR);
  assert.equal(C.ids.cagedNiChain, 'grindless:caged_ni_chain', 'OpV-B2 reads this id');
  assert.equal(C.ids.chainMeshWeave, 'grindless:chain_mesh_weave', 'OpV-A1 reads this id');
  for (const n of ITEMS) {
    const it = run.registry.items.get(`grindless:${n}`);
    assert.ok(it && /opv[\\/]chain_matter\.js$/.test(String(it.file)), `${n} registered by chain_matter.js`);
    for (const lang of ['en_us', 'es_es']) {
      assert.ok(run.lang[lang][`item.grindless.${n}`], `${lang} names ${n}`);
      assert.ok(run.lang[lang][`tooltip.grindless.${n}.0`], `${lang} tooltip ${n}.0`);
      assert.ok(run.lang[lang][`tooltip.grindless.${n}.1`], `${lang} tooltip ${n}.1`);
    }
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), `${n} texture`);
  }
  for (const id of ['grindless:ni_chain_slab', 'grindless:chain_lamina_stack', 'gtceu:chain_strand_ingot', 'gtceu:chain_strand_single_wire', 'gtceu:chain_strand_single_cable']) {
    const it = run.registry.items.get(id);
    assert.ok(!it || !/chain_matter\.js$/.test(String(it.file)), `${id} is F1's, not registered here`);
  }
});

test('the 11 OpV-A0 rows: circuits 3-5 on each pasta machine, all at SGR 1806-20 with the dimension lock and a circuit in the recipe', () => {
  const rows = mine();
  assert.deepEqual(rows.map((r) => [r.type, r.name, r.circuit]), [
    ['pasta_extraction', 'chain_crust', 3], ['pasta_extraction', 'ni_chain', 4], ['pasta_extraction', 'chain_lattice', 5],
    ['pasta_sorting', 'chain_caging', 3], ['pasta_sorting', 'ni_chain_caging', 4], ['pasta_sorting', 'lattice_caging', 5],
    ['pasta_drawing', 'chain_strand_drawing', 3], ['pasta_drawing', 'chain_wire_drawing', 4],
    ['pasta_lamination', 'chain_lamina', 3], ['pasta_lamination', 'chain_lamina_stack', 4], ['pasta_lamination', 'chain_mesh_weave', 5]]);
  for (const r of rows) {
    assert.equal(r.site, SGR, r.name);
    assert.ok(Number.isInteger(r.eut) && r.eut > 0 && r.eut <= 134217728, `${r.name}: a UXV energy hatch carries it`);
    assert.ok(Number.isInteger(r.duration) && r.duration > 0 && r.duration <= 1200, r.name);
    const g = find(`grindless:${r.type}/${r.name}`);
    assert.ok(g && g.t === `gtceu:${r.type}`, `recipe grindless:${r.type}/${r.name}`);
    assert.ok(JSON.stringify(g.j.recipeConditions || []).includes(SGR), `${r.name} carries the SGR dimension lock`);
    assert.ok(side(g, 'inputs').includes(`"configuration":${r.circuit}`), `${r.name} takes circuit ${r.circuit}`);
  }
  for (const type of ['pasta_extraction', 'pasta_sorting', 'pasta_drawing', 'pasta_lamination']) {
    const cs = VP.recipes.filter((r) => r.type === type).map((r) => r.circuit);
    assert.equal(new Set(cs).size, cs.length, `${type}: unique circuits`);
  }
});

test('extraction: the bulge chart kept and a pellet worn at 10% at every row; one slab out', () => {
  for (const [name, out, dur] of [['chain_crust', 'grindless:chain_crust_slab', 600], ['ni_chain', 'grindless:ni_chain_slab', 1200], ['chain_lattice', 'grindless:chain_lattice_slab', 600]]) {
    const r = rec('pasta_extraction', name);
    assert.deepEqual([r.eut, r.duration], [134217728, dur], name);
    assert.deepEqual(ids(r.kept), [['grindless:bulge_chart', 1]], name);
    assert.deepEqual(plain(r.wear.map((x) => [x.id, x.chance])), [['grindless:neutronium_pellet', 1000]], name);
    assert.deepEqual(ids(r.itemsOut), [[out, 1]], name);
  }
});

test('sorting: each slab closed in a consumed cage part; the unchained iron falls out as GT iron dust', () => {
  const c3 = rec('pasta_sorting', 'chain_caging');
  assert.deepEqual(ids(c3.itemsIn), [['grindless:chain_crust_slab', 1], ['grindless:cage_part', 1]]);
  assert.deepEqual(ids(c3.itemsOut), [['grindless:caged_chain_phase', 1], ['gtceu:iron_dust', 2]]);
  const c4 = rec('pasta_sorting', 'ni_chain_caging');
  assert.deepEqual(ids(c4.itemsIn), [['grindless:ni_chain_slab', 1], ['grindless:cage_part', 1]]);
  assert.deepEqual(ids(c4.itemsOut), [['grindless:caged_ni_chain', 1]]);
  const c5 = rec('pasta_sorting', 'lattice_caging');
  assert.deepEqual(ids(c5.itemsIn), [['grindless:chain_lattice_slab', 1], ['grindless:cage_part', 1]]);
  assert.deepEqual(ids(c5.itemsOut), [['grindless:caged_chain_lattice', 1], ['gtceu:iron_dust', 2]]);
  for (const r of [c3, c4, c5]) assert.deepEqual(plain(r.kept), [], `${r.name}: the cage is consumed, not kept`);
});

test('line 1: phase -> 4 strand ingots -> 2 wires each -> PBO braid (c8) -> strand cable, the GTM covering', () => {
  const d3 = rec('pasta_drawing', 'chain_strand_drawing');
  assert.deepEqual(ids(d3.itemsIn), [['grindless:caged_chain_phase', 1]]);
  assert.deepEqual(ids(d3.itemsOut), [['gtceu:chain_strand_ingot', 4]]);
  const d4 = rec('pasta_drawing', 'chain_wire_drawing');
  assert.deepEqual(ids(d4.itemsIn), [['gtceu:chain_strand_ingot', 1]]);
  assert.deepEqual(ids(d4.itemsOut), [['gtceu:chain_strand_single_wire', 2]]);
  const b = run.global.grindless.elevator.recipes.find((r) => r.name === 'chain_braid');
  assert.ok(b, 'elevator.js row chain_braid');
  assert.deepEqual([b.type, b.circuit, b.eut, b.duration], ['pbo_synthesis', 8, 1966080, 200]);
  assert.deepEqual(ids(b.itemsIn), [['gtceu:chain_strand_single_wire', 1], ['grindless:pbo_fibre', 2]]);
  assert.deepEqual(ids(b.itemsOut), [['grindless:pbo_braided_chain_wire', 1]]);
  const g = find(b.recipeId);
  assert.ok(g && g.t === 'gtceu:pbo_synthesis', b.recipeId);
  assert.ok(side(g, 'inputs').includes('"configuration":8'), 'circuit 8');
  const c = find('grindless:assembler/chain_strand_single_cable');
  assert.ok(c && c.t === 'gtceu:assembler', 'recipe grindless:assembler/chain_strand_single_cable');
  assert.deepEqual(itemsOf(c, 'inputs'), [['grindless:pbo_braided_chain_wire', 1], ['gtceu:polyphenylene_sulfide_foil', 1], ['gtceu:polyvinyl_chloride_foil', 1]]);
  assert.deepEqual(c.j.inputs.fluid.map((f) => [f.content.value[0].fluid, f.content.amount]), [['gtceu:silicone_rubber', 72]]);
  assert.deepEqual(itemsOf(c, 'outputs'), [['gtceu:chain_strand_single_cable', 1]]);
  assert.equal(c.j.tickInputs.eu[0].content, 7, 'VA[ULV], as GTM\'s covering');
  assert.ok(!side(c, 'inputs').includes('gtceu:circuit'), 'no circuit, as GTM\'s covering');
  assert.match(fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'opv', 'bulge_relay.js'), 'utf8'), /c\.EUt\(7\)\.duration\(100\)/);
});

test('line 2: lattice -> 4 laminae -> 2 laminae on a lasagna plate -> F1\'s lamina stack; the mesh weave for OpV-A1', () => {
  const l3 = rec('pasta_lamination', 'chain_lamina');
  assert.deepEqual(ids(l3.itemsIn), [['grindless:caged_chain_lattice', 1]]);
  assert.deepEqual(ids(l3.itemsOut), [['grindless:chain_lamina', 4]]);
  const l4 = rec('pasta_lamination', 'chain_lamina_stack');
  assert.deepEqual(ids(l4.itemsIn), [['grindless:chain_lamina', 2], ['grindless:lasagna_plate', 1]]);
  assert.deepEqual(ids(l4.itemsOut), [['grindless:chain_lamina_stack', 1]]);
  const l5 = rec('pasta_lamination', 'chain_mesh_weave');
  assert.deepEqual(ids(l5.itemsIn), [['grindless:pbo_fibre', 4], ['gtceu:chain_strand_single_wire', 2]]);
  assert.deepEqual(ids(l5.itemsOut), [['grindless:chain_mesh_weave', 1]]);
});

test('every new item has exactly its one maker; every one but the two hand-offs (A1, B2) has a consumer', () => {
  const maker = {
    chain_crust_slab: 'grindless:pasta_extraction/chain_crust', chain_lattice_slab: 'grindless:pasta_extraction/chain_lattice',
    caged_chain_phase: 'grindless:pasta_sorting/chain_caging', caged_ni_chain: 'grindless:pasta_sorting/ni_chain_caging',
    caged_chain_lattice: 'grindless:pasta_sorting/lattice_caging', chain_lamina: 'grindless:pasta_lamination/chain_lamina',
    chain_mesh_weave: 'grindless:pasta_lamination/chain_mesh_weave', pbo_braided_chain_wire: run.global.grindless.elevator.recipes.find((r) => r.name === 'chain_braid').recipeId
  };
  for (const n of ITEMS) {
    assert.deepEqual(producers(`grindless:${n}`), [maker[n]], `${n} only from ${maker[n]}`);
    if (n === 'chain_mesh_weave' || n === 'caged_ni_chain') continue; // OpV-A1's and OpV-B2's electron beam rows
    assert.ok(consumers(`grindless:${n}`).length >= 1, `${n} has a consumer`);
  }
  assert.ok(producers('grindless:ni_chain_slab').includes('grindless:pasta_extraction/ni_chain'));
  assert.ok(producers('grindless:chain_lamina_stack').includes('grindless:pasta_lamination/chain_lamina_stack'));
  assert.ok(producers('gtceu:chain_strand_ingot').includes('grindless:pasta_drawing/chain_strand_drawing'));
  assert.ok(producers('gtceu:chain_strand_single_cable').includes('grindless:assembler/chain_strand_single_cable'));
  assert.ok(consumers('gtceu:chain_strand_single_cable').includes('grindless:assembly_line/opv_machine_hull'), 'the hull takes the cable');
  assert.ok(consumers('grindless:chain_lamina_stack').includes('grindless:assembly_line/opv_machine_hull'), 'the hull takes the stack');
});

test('EMI lines: every OpV-A0 row named in both languages', () => {
  for (const r of mine()) {
    const key = `gtceu.recipe.${table.types[r.type].dataKey}.${r.name}`;
    for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][key], `${lang} has ${key}`);
  }
});

test('T1: the overlay exists and its zone row lists it', () => {
  assert.ok(fs.existsSync(path.join(root, 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_opv_chain_matter.js')));
  const z = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'test', 'zones.json'), 'utf8'));
  const rows = z.zones || z.bands || z;
  assert.ok(rows.find((b) => b.id === 'opv_bulge_relay').tests.includes('opv_chain_matter'));
});
