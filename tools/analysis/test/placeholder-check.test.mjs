// The placeholder check (tools/analysis/placeholder-check.mjs, mega audit #202 M2-04): a UEV+ item made from an LV-grade input is flagged,
// in GT machine recipes (consumed inputs only) and in crafting recipes. T0: local and deterministic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { placeholderRows, isLvGrade, shapeOf } from '../placeholder-check.mjs';

const gtIn = (item, count = 1, extra = {}) => ({ content: { type: 'gtceu:sized', count, ingredient: { item } }, chance: 10000, maxChance: 10000, ...extra });
const gtTag = (tag, count = 1) => ({ content: { type: 'gtceu:sized', count, ingredient: { tag } }, chance: 10000, maxChance: 10000 });
const gt = (id, out, ins) => ({ id, json: { type: 'gtceu:assembler', inputs: { item: ins, fluid: [] }, outputs: { item: [gtIn(out)] } } });

test('LV-grade inputs: the placeholder materials, their tags and a wooden chest; not their high-tier look-alikes', () => {
  for (const id of ['gtceu:lead_quadruple_wire', 'gtceu:iron_plate', 'minecraft:iron_bars', 'gtceu:red_alloy_single_cable', 'gtceu:tin_single_wire',
    'gtceu:bronze_plate', 'gtceu:copper_single_cable', '#forge:plates/iron', '#forge:chests/wooden', 'minecraft:chest']) assert.ok(isLvGrade(id), id);
  for (const id of ['gtceu:neutronium_plate', 'gtceu:europium_single_cable', 'gtceu:annealed_copper_single_cable', 'gtceu:ironwood_plate',
    '#forge:plates/neutronium', 'gtceu:uev_quantum_chest']) assert.ok(!isLvGrade(id), id);
});

test('a UEV+ item made from an LV-grade consumed input is flagged; a catalyst, a lower-tier output and an own-tier recipe are not', () => {
  const rows = placeholderRows([
    gt('gtceu:assembler/energy_hatch_4a_uev', 'gtceu:uev_energy_input_hatch_4a', [gtIn('gtceu:uev_energy_input_hatch'), gtIn('gtceu:lead_quadruple_wire', 3), gtTag('forge:plates/iron', 3)]),
    gt('grindless:assembly_line/uev_energy_input_hatch_4a', 'gtceu:uev_energy_input_hatch_4a', [gtIn('gtceu:uev_energy_input_hatch', 2), gtIn('gtceu:lay_superhydride_quadruple_cable', 2)]),
    gt('gtceu:assembler/energy_hatch_4a_uhv', 'gtceu:uhv_energy_input_hatch_4a', [gtIn('gtceu:uhv_energy_input_hatch'), gtIn('gtceu:lead_quadruple_wire', 2)]),
    gt('grindless:x/catalyst', 'grindless:max_sensor', [gtIn('gtceu:iron_plate', 1, { chance: 0 }), gtIn('grindless:max_part')]),
    { id: 'gtceu:shaped/uev_battery_buffer_4x', json: { type: 'minecraft:crafting_shaped', key: { W: { item: 'gtceu:lead_quadruple_wire' }, C: { tag: 'forge:chests/wooden' }, H: { item: 'gtceu:uev_machine_hull' } }, result: { item: 'gtceu:uev_battery_buffer_4x' } } },
    { id: 'gtceu:shapeless/opv_x', json: { type: 'minecraft:crafting_shapeless', ingredients: [{ item: 'gtceu:opv_machine_hull' }, { item: 'gtceu:tin_single_wire' }], result: { item: 'gtceu:opv_diode', count: 1 } } },
  ]);
  assert.deepEqual(rows.map((r) => r.id), ['gtceu:assembler/energy_hatch_4a_uev', 'gtceu:shaped/uev_battery_buffer_4x', 'gtceu:shapeless/opv_x']);
  assert.deepEqual(rows[0].lv, ['gtceu:lead_quadruple_wire', '#forge:plates/iron']);
  assert.deepEqual(rows[1].lv, ['gtceu:lead_quadruple_wire', '#forge:chests/wooden']);
});

test('shapeOf reads the primary output and consumed inputs of GT and crafting recipes, and nothing else', () => {
  assert.equal(shapeOf({ type: 'minecraft:smelting', ingredient: { item: 'a:b' }, result: 'a:c' }), null);
  assert.deepEqual(shapeOf(gt('x', 'gtceu:max_emitter', [gtIn('a:b', 2)]).json), { out: 'gtceu:max_emitter', ins: ['a:b'] });
});
