// UHV's fibres and the space elevator (package UHV-A7), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/uhv/elevator.js: two recipe types, two machines (7 x 5 x 9 PBO plant, 11 x 5 x 5 tether ribbon works),
//     the GEO-assembled stage, six materials;
//   - server_scripts/grindless/uhv/elevator.js: the plant's five steps, the works' two, line 24's side steps, the blocks of GTCA's
//     space elevator, its GEO lift and the controllers' crafting;
//   - en_us and es_es text for everything new.
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
const E = plain(run.global.grindless.elevator);
const recipes = run.docs.recipes.recipes;
const row = (name) => E.recipes.find((r) => r.name === name);
const side = (name) => E.side.find((r) => r.name === name);
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const read = (rel) => fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
const outputsOf = (r) => JSON.stringify(r.j.outputs || r.j.result || {});
const MATERIALS = ['trichlorobenzene', 'dinitrotrichlorobenzene', 'polyphosphoric_acid', 'chlorodinitroresorcinol', 'diaminoresorcinol',
  'terephthalic_acid'];
const VA_UHV = 1966080;

test('the stand-in runs the elevator scripts without errors, nothing clashing or skipped', () => {
  const errs = run.errors.filter((e) => /uhv[\\/]elevator|uhv_elevator/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(E.clashes, []);
  assert.deepEqual(E.skipped, []);
});

test('registration: two recipe types, two machines, the stage and six materials; F1\'s ids are not registered again', () => {
  assert.deepEqual(run.registry.machines.get('gtceu:pbo_plant').recipeTypes, ['gtceu:pbo_synthesis']);
  assert.deepEqual(run.registry.machines.get('gtceu:tether_ribbon_works').recipeTypes, ['gtceu:tether_ribbon']);
  assert.ok(run.registry.items.has('grindless:geo_assembled_stage'));
  for (const n of MATERIALS) assert.ok(run.registry.materials.has('gtceu:' + n), n);
  const src = read('startup_scripts/grindless/uhv/elevator.js');
  for (const n of ['pbo_fibre', 'tether_ribbon_segment', 'tether_climber', 'pbo_dope']) {
    assert.doesNotMatch(src, new RegExp(`^\\s+${n}\\s*:\\s*\\{`, 'm'), n + ' belongs to F1');
  }
});

test('patterns: plant 7 x 5 x 9, works 11 x 5 x 5, one controller, GTM part limits; the works takes no hatches', () => {
  for (const [id, depth, height, width, casing, abilities] of [
    ['gtceu:pbo_plant', 9, 5, 7, 'gtceu:inert_machine_casing', ['energy_input', 'input_bus', 'input_hatch', 'output_bus', 'output_hatch']],
    ['gtceu:tether_ribbon_works', 5, 5, 11, 'gtceu:robust_machine_casing', ['energy_input', 'input_bus', 'output_bus']]
  ]) {
    const s = run.docs.structures.structures[id];
    assert.ok(s, id + ' described');
    assert.equal(s.slices.length, depth, id);
    assert.ok(s.slices.every((sl) => sl.length === height && sl.every((r) => r.length === width)), id + ' uniform slices');
    assert.equal(s.slices.flat().join('').split('').filter((c) => c === 'S').length, 1, id + ' one controller');
    for (const sl of s.slices) for (const r of sl) for (const c of r) assert.ok(s.symbols[c], `${id} symbol ${c}`);
    const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
    assert.deepEqual(Object.keys(lim).sort(), abilities.slice().sort(), id);
    for (const a of abilities) assert.deepEqual(lim[a], { min: 1, max: 2 }, `${id} ${a}`);
    assert.ok(s.symbols.X.options.some((o) => o.kind === 'blocks' && o.blocks.includes(casing)), id + ' casing');
  }
});

test('each machine: unique circuits, whole numbers, every row in the dump with its circuit', () => {
  for (const type of ['pbo_synthesis', 'tether_ribbon']) {
    const rows = E.recipes.filter((r) => r.type === type);
    const circuits = rows.map((r) => r.circuit);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of rows.filter((x) => !['bumper_weave', 'chain_braid', 'belt_trim_respin', 'horizon_braid', 'pbo_carrier_web', 'pbo_belt_web'].includes(x.name))) { // UXV-B1's c7, OpV-A0's c8 OpV-A1's c9 and MAX-A0's c10 rows are newer than the dump
      assert.ok(Number.isInteger(r.duration) && r.duration > 0 && Number.isInteger(r.eut) && r.eut > 0 && r.eut <= VA_UHV, r.name);
      const rec = recipes.find((x) => x.i === r.recipeId);
      assert.ok(rec, r.recipeId);
      assert.equal(rec.t, 'gtceu:' + type);
      assert.deepEqual(circuitOf(rec), [r.circuit], r.name);
    }
  }
  assert.deepEqual(E.recipes.filter((r) => r.type === 'pbo_synthesis').map((r) => r.name), ['nitrate', 'hydrolyse', 'reduce', 'polymerise', 'spin', 'chain_braid', 'belt_trim_respin', 'horizon_braid', 'pbo_carrier_web', 'pbo_belt_web']); // OpV-A0 appended c8, OpV-A1 c9, MAX-A0 c10, MAX-B1 c11-12
  assert.deepEqual(E.recipes.filter((r) => r.type === 'tether_ribbon').map((r) => r.name), ['ribbon', 'climber', 'mh_tether', 'worn_tether_scrap', 'bumper_weave', 'strand_ribbon']); // UIV-B2 appended two, UXV-B1 one, MAX-D3 one
});

test('line 24: trichlorobenzene to PBO fibre, every intermediate made before it is used', () => {
  const chain = [['nitrate', 'gtceu:dinitrotrichlorobenzene'], ['hydrolyse', 'gtceu:chlorodinitroresorcinol_dust'],
    ['reduce', 'gtceu:diaminoresorcinol_dust'], ['polymerise', 'gtceu:pbo_dope'], ['spin', 'grindless:pbo_fibre']];
  for (const [name, out] of chain) {
    const r = row(name);
    assert.ok(r.itemsOut.concat(r.fluidsOut).some((x) => x.id === out), `${name} -> ${out}`);
  }
  assert.ok(row('nitrate').fluidsIn.some((f) => f.id === 'gtceu:trichlorobenzene'));
  assert.ok(row('polymerise').itemsIn.some((i) => i.id === 'gtceu:terephthalic_acid_dust'));
  assert.ok(row('polymerise').fluidsIn.some((f) => f.id === 'gtceu:polyphosphoric_acid'));
  assert.equal(row('reduce').notConsumable, 'gtceu:palladium_dust');
  // PBO fibre, the ribbon segment and the climber come only from these machines
  for (const [id, prefix] of [['grindless:pbo_fibre', 'grindless:pbo_synthesis/'], ['grindless:tether_ribbon_segment', 'grindless:tether_ribbon/'],
    ['grindless:tether_climber', 'grindless:tether_ribbon/']]) {
    const makers = recipes.filter((r) => outputsOf(r).includes(`"${id}"`)).map((r) => r.i);
    assert.ok(makers.length > 0 && makers.every((i) => i.startsWith(prefix)), `${id}: ${makers}`);
  }
  assert.deepEqual(E.side.map((r) => r.name), ['trichlorobenzene', 'terephthalic_acid', 'polyphosphoric_acid']);
  assert.equal(side('trichlorobenzene').circuit, 3);
  assert.equal(side('terephthalic_acid').notConsumable, 'gtceu:cobalt_dust');
  for (const r of E.side) assert.ok(recipes.find((x) => x.i === r.recipeId), r.recipeId);
});

test('byproduct destinations: HCl back into the reducer, phosphoric acid back into PPA, every one named in the header', () => {
  assert.ok(row('polymerise').fluidsOut.some((f) => f.id === 'gtceu:hydrochloric_acid'));
  assert.ok(row('reduce').fluidsIn.some((f) => f.id === 'gtceu:hydrochloric_acid'));
  assert.ok(row('spin').fluidsOut.some((f) => f.id === 'gtceu:phosphoric_acid'));
  assert.ok(side('polyphosphoric_acid').fluidsIn.some((f) => f.id === 'gtceu:phosphoric_acid'));
  const src = read('server_scripts/grindless/uhv/elevator.js');
  for (const word of ['hydrochloric acid \\(', 'salt \\(', 'diluted sulfuric acid \\(', 'water \\(', 'phosphoric acid \\(', 'worn ribbon segment']) {
    assert.match(src, new RegExp(`//\\s+${word}`), word);
  }
});

test('GTCA\'s elevator: its structure blocks and controller have our recipes, motors mk 2-5 and the modules none', () => {
  const blocks = ['gtca:ultra_high_strength_concrete_floor', 'gtca:space_elevator_base_casing', 'gtca:space_elevator_support_structure',
    'gtca:space_elevator_internal_structure', 'gtca:space_elevator_cable', 'gtca:space_elevator_motor_mk_1'];
  for (const id of blocks) {
    const makers = recipes.filter((r) => r.i.startsWith('grindless:assembler/') && outputsOf(r).includes(`"${id}"`));
    assert.equal(makers.length, 1, id);
  }
  const circuits = E.blockRecipes.map((r) => r.circuit);
  assert.equal(new Set(circuits).size, circuits.length, 'block circuits');
  for (const n of [2, 3, 4, 5]) {
    assert.deepEqual(recipes.filter((r) => r.i.startsWith('grindless:') && outputsOf(r).includes(`gtca:space_elevator_motor_mk_${n}`)).map((r) => r.i), [], `mk ${n}`);
  }
  for (const t of ['gtceu:space_miner', 'gtceu:space_pump', 'gtceu:space_assembler']) {
    assert.deepEqual(recipes.filter((r) => r.t === t && r.i.startsWith('grindless:')).map((r) => r.i), [], t);
  }
  const ctrl = recipes.find((x) => x.i === E.crafting.elevator);
  assert.ok(ctrl, 'elevator controller crafting');
  assert.match(outputsOf(ctrl), /gtca:space_elevator/);
  assert.match(JSON.stringify(ctrl.j), /grindless:tether_climber/);
  for (const id of [E.crafting.plant, E.crafting.works, E.crafting.elevator]) {
    const r = recipes.find((x) => x.i === id);
    assert.ok(r, id);
    assert.equal(r.t, 'gtceu:assembly_line', id);
    assert.match(JSON.stringify(r.j), /"research"/, id);
  }
});

test('the GEO lift: climber kept, one ribbon segment worn, the stage out, UHV power, no fluids', () => {
  assert.equal(E.run.length, 1);
  const lift = recipes.find((x) => x.i === 'grindless:space_elevator/geo_lift');
  assert.ok(lift, 'geo_lift in the dump');
  assert.equal(lift.t, 'gtceu:space_elevator');
  const ins = lift.j.inputs.item.map((i) => ({ id: i.content.ingredient && i.content.ingredient.item, count: i.content.count, chance: i.chance }));
  assert.deepEqual(ins.find((i) => i.id === 'grindless:tether_climber'), { id: 'grindless:tether_climber', count: 1, chance: 0 });
  assert.deepEqual(ins.find((i) => i.id === 'grindless:tether_ribbon_segment'), { id: 'grindless:tether_ribbon_segment', count: 1, chance: 10000 });
  assert.deepEqual(circuitOf(lift), []);
  assert.deepEqual(lift.j.inputs.fluid || [], []);
  assert.deepEqual(E.run[0].itemsOut, [{ id: 'grindless:geo_assembled_stage', count: 1 }]);
  assert.equal(E.run[0].eut, VA_UHV);
  const makers = recipes.filter((r) => outputsOf(r).includes('"grindless:geo_assembled_stage"')).map((r) => r.i);
  assert.deepEqual(makers, ['grindless:space_elevator/geo_lift']);
});

test('names: en_us and es_es for both machines, both types, the stage and the materials', () => {
  const lang = read('client_scripts/grindless/uhv_elevator_lang.js');
  const [en, es] = lang.split('es_es: {');
  assert.ok(es, 'es_es block');
  for (const part of [en, es]) {
    for (const key of ['plant:', 'works:', 'plantType:', 'worksType:', 'plantTips:', 'worksTips:', 'geo_assembled_stage:']) assert.ok(part.includes(key), key);
    for (const n of MATERIALS) assert.ok(part.includes(`${n}:`), n);
  }
  for (const k of ['block.gtceu.pbo_plant', 'block.gtceu.tether_ribbon_works', 'gtceu.pbo_synthesis', 'gtceu.tether_ribbon', 'material.gtceu.']) assert.ok(lang.includes(`'${k}`), k);
  assert.match(lang, /i < 4/);
});
