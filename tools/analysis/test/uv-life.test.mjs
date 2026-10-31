// UV's life (package UV-A10), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/uv/life.js: one item (the algae culture), two recipe types, two machines (11 x 9 x 11 ark biosphere,
//     7 x 7 x 7 neural culture vat);
//   - server_scripts/grindless/uv/life.js: the ark's cycle, seed and inoculation, the vat's two batches, the crafting;
//   - en_us and es_es text for the machines, types and the item.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const L = plain(run.global.grindless.life);
const recipes = run.docs.recipes.recipes;
const row = (name) => L.recipes.find((r) => r.name === name);
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const read = (rel) => fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
const outputsOf = (r) => JSON.stringify(r.j.outputs || r.j.result || {});
const fl = (list, id) => (list.find((f) => f.id === id) || { amount: 0 }).amount;
const VA_UV = 491520;

test('the stand-in runs the life scripts without errors, nothing clashing or skipped', () => {
  const errs = run.errors.filter((e) => /[\\/]life\.js|uv_life_lang/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(L.clashes, []);
  assert.deepEqual(L.skipped, []);
});

test('registration: the algae culture, two recipe types, two machines; nothing of F1 registered again', () => {
  assert.deepEqual(run.registry.machines.get('gtceu:ark_biosphere').recipeTypes, ['gtceu:closed_ecosystem']);
  assert.deepEqual(run.registry.machines.get('gtceu:neural_culture_vat').recipeTypes, ['gtceu:neural_culture']);
  for (const t of ['closed_ecosystem', 'neural_culture']) assert.ok(run.registry.recipeTypes.has('gtceu:' + t), t);
  assert.ok(run.registry.items.has('grindless:algae_culture'));
  const src = read('startup_scripts/grindless/uv/life.js');
  assert.doesNotMatch(src, /StartupEvents\.registry\('(block|fluid)'/);
  assert.doesNotMatch(src, /GTCEuStartupEvents\.registry\('gtceu:material'/);
  const created = [...src.matchAll(/event\.create\(([^)]+)\)/g)].map((m) => m[1]);
  assert.deepEqual(created, ['L.algaeCulture', 'ARK_TYPE', 'VAT_TYPE', "'ark_biosphere', 'multiblock'", "'neural_culture_vat', 'multiblock'"]);
});

test('patterns: ark 11 wide x 9 high x 11 deep with ring and core, vat 7 x 7 x 7 with incubators, bioprinter and filters', () => {
  const dims = { 'gtceu:ark_biosphere': [11, 9, 11], 'gtceu:neural_culture_vat': [7, 7, 7] };
  for (const [id, [width, height, depth]] of Object.entries(dims)) {
    const s = run.docs.structures.structures[id];
    assert.ok(s, id + ' described');
    assert.equal(s.slices.length, depth, id);
    assert.ok(s.slices.every((sl) => sl.length === height && sl.every((r) => r.length === width)), id + ' uniform slices');
    assert.equal(s.slices.flat().join('').split('').filter((c) => c === 'S').length, 1, id + ' one controller');
    for (const sl of s.slices) for (const r of sl) for (const c of r) assert.ok(c === ' ' || s.symbols[c], `${id} symbol ${c}`);
    const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
    for (const a of ['energy_input', 'input_bus', 'input_hatch', 'output_bus', 'output_hatch']) assert.ok(lim[a] && lim[a].min === 1, `${id} ${a}`);
    assert.equal(lim.energy_input.max, 2, id + ' energy');
    assert.equal(s.slices[depth - 1][1][(width - 1) / 2], 'S', id + ' controller front middle, row 1');
  }
  const count = (s, block) => {
    const syms = Object.entries(s.symbols).filter(([, v]) => v.kind === 'blocks' && v.blocks.includes(block)).map(([k]) => k);
    return s.slices.flat().join('').split('').filter((c) => syms.includes(c)).length;
  };
  const ark = run.docs.structures.structures['gtceu:ark_biosphere'];
  assert.equal(count(ark, 'gtceu:inert_machine_casing'), 27, '3 x 3 x 3 anaerobic core');
  assert.equal(count(ark, 'gtceu:white_lamp'), 24, 'a 7 x 7 ring of lamps');
  assert.ok(count(ark, 'gtceu:laminated_glass') > 200, 'glass dome and tube ring');
  assert.equal(ark.slices.map((sl) => sl[8]).join('').replace(/ /g, '').length, 25, '5 x 5 cap');
  assert.ok(ark.symbols.X.options.some((o) => o.kind === 'blocks' && o.blocks.includes('gtceu:uv_machine_casing')), 'UV casing floor');
  const vat = run.docs.structures.structures['gtceu:neural_culture_vat'];
  assert.equal(count(vat, 'gtceu:heatproof_machine_casing'), 12, 'four incubator columns of three');
  assert.equal(count(vat, 'gtceu:robust_machine_casing'), 2, 'the bioprinter');
  assert.equal(count(vat, 'gtceu:filter_casing'), 9, '3 x 3 filter ceiling');
  assert.equal(count(vat, 'gtceu:cleanroom_glass'), 36, 'four 3 x 3 windows');
  assert.ok(vat.symbols.X.options.some((o) => o.kind === 'blocks' && o.blocks.includes('gtceu:plascrete')), 'plascrete floor');
});

test('each machine: unique circuits, whole numbers, UV VA at most, every row in the dump with its circuit', () => {
  for (const type of ['closed_ecosystem', 'neural_culture']) {
    const rows = L.recipes.filter((r) => r.type === type);
    const circuits = rows.map((r) => r.circuit);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of rows) {
      assert.ok(Number.isInteger(r.duration) && r.duration > 0 && Number.isInteger(r.eut) && r.eut > 0 && r.eut <= VA_UV, r.name);
      const rec = recipes.find((x) => x.i === r.recipeId);
      assert.ok(rec, r.recipeId);
      assert.equal(rec.t, 'gtceu:' + type);
      assert.deepEqual(circuitOf(rec), [r.circuit], r.name);
      const ids = r.itemsIn.map((x) => x.id).concat(r.notConsumable);
      for (const id of ids) assert.doesNotMatch(id, /uhv|uev|uiv/, r.name + ': no UHV-only input');
    }
  }
  assert.deepEqual(L.recipes.map((r) => [r.type, r.name, r.circuit]), [
    ['closed_ecosystem', 'closed_cycle', 1], ['closed_ecosystem', 'culture_seed', 2], ['closed_ecosystem', 'algae_inoculation', 3],
    ['neural_culture', 'stem_cell_batch', 1], ['neural_culture', 'neuro_processor_batch', 2],
    ['closed_ecosystem', 'ark_genome_set', 4]]); // MAX-B4 (L12 step 3) appended
  for (const id of [L.crafting.ark, L.crafting.vat]) assert.ok(recipes.find((x) => x.i === id), id);
});

test('the ark closes its air: CO2 in, O2 back, cultures kept; growth medium and biomass out', () => {
  const c1 = row('closed_cycle');
  assert.deepEqual(c1.notConsumable, ['grindless:algae_culture', 'grindless:archaeal_culture']);
  assert.deepEqual(c1.itemsIn, []);
  assert.equal(fl(c1.fluidsIn, 'gtceu:carbon_dioxide'), 1000);
  assert.equal(fl(c1.fluidsIn, 'gtceu:ammonia'), 250);
  assert.equal(fl(c1.fluidsOut, 'gtceu:oxygen'), 500);
  assert.equal(fl(c1.fluidsOut, 'gtceu:raw_growth_medium'), 500);
  assert.equal(fl(c1.fluidsOut, 'gtceu:biomass'), 250);
  assert.equal(c1.eut, 122880);
  const seed = row('culture_seed');
  for (const id of ['grindless:algae_culture', 'grindless:archaeal_culture']) {
    assert.equal(seed.itemsOut.find((x) => x.id === id).count, 2 * seed.itemsIn.find((x) => x.id === id).count, id + ' doubled');
  }
  const ino = row('algae_inoculation');
  assert.deepEqual(ino.itemsIn, [{ id: 'gtceu:agar_dust', count: 1 }]);
  assert.deepEqual(ino.itemsOut, [{ id: 'grindless:algae_culture', count: 1 }]);
  const makers = recipes.filter((r) => outputsOf(r).includes('grindless:algae_culture')).map((r) => r.i).sort();
  assert.deepEqual(makers, ['grindless:closed_ecosystem/algae_inoculation', 'grindless:closed_ecosystem/culture_seed']);
});

test('the vat batches GTM\'s wetware from the ark\'s medium; GTM\'s own routes stay', () => {
  const c1 = row('stem_cell_batch');
  assert.deepEqual(c1.notConsumable, ['grindless:neural_organoid']);
  assert.equal(fl(c1.fluidsIn, 'gtceu:raw_growth_medium'), 1000, 'the ark\'s medium');
  assert.deepEqual(c1.itemsOut, [{ id: 'gtceu:stem_cells', count: 64 }]);
  assert.equal(c1.eut, VA_UV);
  const c2 = row('neuro_processor_batch');
  assert.deepEqual(c2.itemsIn, [{ id: 'gtceu:stem_cells', count: 8 }, { id: 'gtceu:wetware_printed_circuit_board', count: 1 }]);
  assert.equal(fl(c2.fluidsIn, 'gtceu:sterilized_growth_medium'), 1000);
  assert.deepEqual(c2.itemsOut, [{ id: 'gtceu:neuro_processing_unit', count: 4 }]);
  for (const r of [c1, c2]) assert.equal(fl(r.fluidsOut, 'gtceu:biomass'), 250, r.name + ' spent medium');
  const src = read('server_scripts/grindless/uv/life.js');
  assert.doesNotMatch(src, /\.remove\(/, 'no GTM recipe removed');
});

test('byproduct destinations are written down', () => {
  const src = read('server_scripts/grindless/uv/life.js');
  for (const word of ['oxygen', 'raw growth medium', 'biomass', 'failed cultures']) assert.match(src, new RegExp(`//\\s+${word} .*-> `, 'i'), word);
});

test('names: en_us and es_es for both machines, both types and the item', () => {
  const lang = read('client_scripts/grindless/uv_life_lang.js');
  const [en, es] = lang.split('es_es: {');
  assert.ok(es, 'es_es block');
  for (const part of [en, es]) {
    for (const key of ['ark:', 'vat:', 'arkType:', 'vatType:', 'algae:', 'algaeTip:', 'arkTips:', 'vatTips:']) assert.ok(part.includes(key), key);
  }
  for (const k of ['block.gtceu.ark_biosphere', 'block.gtceu.neural_culture_vat', 'gtceu.closed_ecosystem', 'gtceu.neural_culture',
    'item.grindless.algae_culture', 'item.grindless.algae_culture.tooltip', 'grindless.machine.ark_biosphere.tooltip.',
    'grindless.machine.neural_culture_vat.tooltip.']) assert.ok(lang.includes(`'${k}`), k);
  assert.match(lang, /i < 1/);
});
