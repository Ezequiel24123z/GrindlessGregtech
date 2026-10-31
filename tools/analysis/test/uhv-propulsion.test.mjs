// UHV's ceramics and the level 8 rocket (package UHV-A8), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/uhv/propulsion.js: the spark plasma sinterer (5 x 5 x 7) and its type, the TaC liner, the oganesson pod,
//     boron carbide and the UHTC blend, the ICAN rocket motor (createCustom: a no-op in the stand-in, so only its source is checked);
//   - server_scripts/grindless/uhv/propulsion.js: the sinterer's three steps, line 26's side steps (zirconia from red zircon, B4C, ZrB2,
//     the blend), the controller's crafting, the motor's loot table and tool tag;
//   - server_scripts/grindless/uv/propulsion.js: the thruster works' two UHV rows (the ICAN motor on the GEO-assembled stage, the pod);
//   - en_us and es_es text, the motor's blockstate and models.
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
const P = plain(run.global.grindless.uhvPropulsion);
const W = plain(run.global.grindless.propulsion);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const row = (name) => P.recipes.find((r) => r.name === name);
const side = (name) => P.side.find((r) => r.name === name);
const works = (name) => W.recipes.find((r) => r.name === name);
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const outputsOf = (r) => JSON.stringify(r.j.outputs || r.j.result || {});
const inputsOf = (r) => JSON.stringify(r.j.inputs || r.j.ingredients || r.j.key || {});
const read = (rel) => fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
const VA_UHV = 1966080;
const MOTOR = 'grindless:ican_rocket_motor';

test('the stand-in runs the propulsion scripts without errors, nothing clashing or skipped', () => {
  const errs = run.errors.filter((e) => /uhv[\\/]propulsion|uv[\\/]propulsion|uhv_propulsion_lang/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(P.clashes, []);
  assert.deepEqual(P.skipped, []);
  assert.deepEqual(W.clashes, []);
  assert.deepEqual(W.skipped, []);
});

test('registration: the sinterer and its type, two items, two materials; F1\'s ids are not registered again', () => {
  assert.deepEqual(run.registry.machines.get('gtceu:spark_plasma_sinterer').recipeTypes, ['gtceu:spark_plasma_sintering']);
  for (const n of ['tantalum_carbide_liner', 'oganesson_propellant_pod']) assert.ok(run.registry.items.has('grindless:' + n), n);
  for (const n of ['boron_carbide', 'uhtc_blend']) assert.ok(run.registry.materials.has('gtceu:' + n), n);
  const src = read('startup_scripts/grindless/uhv/propulsion.js');
  for (const n of ['uhtc_tile', 'uhtc_nozzle', 'zirconia', 'zirconium_diboride', 'oganesson_propellant']) {
    assert.doesNotMatch(src, new RegExp(`^\\s+${n}\\s*:\\s*\\{`, 'm'), n + ' belongs to F1');
  }
  const F = run.global.grindless.uhvFoundation;
  assert.ok(F, 'F1 published');
  assert.match(read('startup_scripts/grindless/uhv/foundation.js'), /zirconium_diboride/);
});

test('the ICAN motor: a GCYR RocketMotorBlock at tier 6 through createCustom, block and item; blockstate and models present', () => {
  const src = read('startup_scripts/grindless/uhv/propulsion.js');
  assert.match(src, /argent_matter\.gcyr\.common\.block\.RocketMotorBlock'/);
  assert.match(src, /const MOTOR_TIER = 6\b/);
  assert.equal((src.match(/event\.createCustom\(MOTOR,/g) || []).length, 2, 'block and item');
  assert.equal(P.motor, MOTOR);
  assert.equal(P.motorTier, '6');
  // with the BNNT tank (UV-A11, tier 11) the rocket is level floor((6 + 11) / 2) = 8, Proxima b's
  assert.equal(Math.floor((Number(P.motorTier) + 11) / 2), 8);
  const assets = path.join(pack, 'kubejs', 'assets', 'grindless');
  const state = JSON.parse(fs.readFileSync(path.join(assets, 'blockstates', 'ican_rocket_motor.json'), 'utf8'));
  assert.equal(state.variants[''].model, 'grindless:block/ican_rocket_motor');
  const model = JSON.parse(fs.readFileSync(path.join(assets, 'models', 'block', 'ican_rocket_motor.json'), 'utf8'));
  assert.equal(model.parent, 'minecraft:block/cube_bottom_top');
  for (const face of ['top', 'side', 'bottom']) {
    assert.equal(model.textures[face], `grindless:block/uhv/ican_rocket_motor_${face}`);
    assert.ok(fs.existsSync(path.join(assets, 'textures', 'block', 'uhv', `ican_rocket_motor_${face}.png`)), face);
  }
  const item = JSON.parse(fs.readFileSync(path.join(assets, 'models', 'item', 'ican_rocket_motor.json'), 'utf8'));
  assert.equal(item.parent, 'grindless:block/ican_rocket_motor');
  const server = read('server_scripts/grindless/uhv/propulsion.js');
  assert.match(server, /addSimpleBlock\(MOTOR\)/);
  assert.match(server, /minecraft:mineable\/pickaxe/);
});

test('pattern: 5 x 5 x 7, one controller in the front slice, every symbol defined, GTM part limits, no hatches', () => {
  const s = run.docs.structures.structures['gtceu:spark_plasma_sinterer'];
  assert.ok(s, 'described');
  assert.equal(s.slices.length, 7);
  assert.ok(s.slices.every((sl) => sl.length === 5 && sl.every((r) => r.length === 5)), 'uniform 5 x 5 slices');
  const all = s.slices.flat().join('');
  assert.equal(all.split('').filter((c) => c === 'S').length, 1);
  assert.ok(s.slices[s.slices.length - 1].join('').includes('S'), 'controller in the front slice');
  for (const c of all) assert.ok(s.symbols[c], `symbol ${c}`);
  const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
  assert.deepEqual(Object.keys(lim).sort(), ['energy_input', 'input_bus', 'output_bus']);
  for (const a of Object.keys(lim)) assert.deepEqual(lim[a], { min: 1, max: 2 }, a);
  assert.ok(s.symbols.X.options.some((o) => o.kind === 'blocks' && o.blocks.includes('gtceu:robust_machine_casing')), 'casing');
});

test('the sinterer: tile, liner, nozzle on circuits 1-3, every row in the dump with its circuit and within the IO', () => {
  // UEV-A5 appended the HfTaCN billet (c4), UIV-A5 the B4C sputter target (c5)
  assert.deepEqual(P.recipes.map((r) => [r.name, r.circuit]), [['uhtc_tile', 1], ['tantalum_carbide_liner', 2], ['uhtc_nozzle', 3], ['hftacn_billet', 4], ['b4c_target', 5], ['nb_target', 6], ['w_target', 7],
    ['ir_target_rod', 11], ['li6h_tile', 12], ['tizrv_target', 13], ['chain_composite_rod', 16], ['chain_composite_rotor', 17], ['opv_harmonic_drive', 10],
    ['wc_sputter_target', 14], ['gamma_absorber_tile', 15], ['exotic_composite_billet', 21], ['radiator_collector_shell', 18], ['payload_casing', 22], ['ta_hf_c_billet', 20]]); // MAX-R1 c20 (L36); // MAX-D1 c18 (L15) and c22 (L24); OpV-D1 c11-13 (Ir target rod, 6LiH tile, TiZrV target); OpV-A1 c16-17 (opv.md's c8-9 are UXV-A1's) and c10; OpV-B1 c14; OpV-B3a c15
  const tile = row('uhtc_tile');
  assert.deepEqual(tile.itemsIn, [{ id: 'gtceu:uhtc_blend_dust', count: 8 }, { id: 'gtceu:graphite_dust', count: 1 }]);
  assert.deepEqual(tile.itemsOut, [{ id: 'grindless:uhtc_tile', count: 2 }, { id: 'gtceu:carbon_dust', count: 1 }]);
  assert.deepEqual(row('tantalum_carbide_liner').itemsIn, [{ id: 'gtceu:tantalum_dust', count: 2 }, { id: 'gtceu:carbon_dust', count: 2 }]);
  const nozzle = row('uhtc_nozzle');
  assert.deepEqual(nozzle.itemsIn, [{ id: 'grindless:uhtc_tile', count: 4 }, { id: 'grindless:tantalum_carbide_liner', count: 1 }]);
  assert.deepEqual(nozzle.itemsOut, [{ id: 'grindless:uhtc_nozzle', count: 1 }]);
  assert.equal(nozzle.eut, VA_UHV);
  for (const r of P.recipes) {
    const rec = byId(r.recipeId);
    assert.ok(rec, r.recipeId);
    assert.equal(rec.t, 'gtceu:spark_plasma_sintering');
    assert.deepEqual(circuitOf(rec), [r.circuit], r.name);
    assert.ok(r.itemsIn.length + 1 <= P.io.itemsIn && r.itemsOut.length <= P.io.itemsOut, r.name);
    assert.ok(Number.isInteger(r.eut) && r.eut > 0 && r.eut <= VA_UHV && Number.isInteger(r.duration) && r.duration > 0, r.name);
  }
  // the tile and the nozzle come only from the sinterer
  for (const id of ['grindless:uhtc_tile', 'grindless:uhtc_nozzle', 'grindless:tantalum_carbide_liner']) {
    const makers = recipes.filter((r) => outputsOf(r).includes(`"${id}"`)).map((r) => r.i);
    assert.ok(makers.length > 0 && makers.every((i) => i.startsWith('grindless:spark_plasma_sintering/')), `${id}: ${makers}`);
  }
});

test('line 26\'s side steps: zirconia from red zircon, boron carbide, ZrB2 with its CO, the blend; zirconia has a maker', () => {
  assert.deepEqual(P.side.map((r) => [r.name, r.type]), [['zirconia', 'electric_blast_furnace'], ['boron_carbide', 'electric_blast_furnace'],
    ['zirconium_diboride', 'electric_blast_furnace'], ['uhtc_blend', 'mixer']]);
  const zr = side('zirconia');
  assert.deepEqual(zr.itemsIn, [{ id: 'gtca:red_zircon_dust', count: 4 }]);
  assert.deepEqual(zr.itemsOut, [{ id: 'gtceu:zirconia_dust', count: 3 }, { id: 'gtceu:silicon_dioxide_dust', count: 1 }]);
  assert.equal(zr.temp, 2100);
  for (const r of P.side.filter((x) => x.type === 'electric_blast_furnace')) assert.ok(r.temp > 0, r.name);
  assert.match(read('server_scripts/grindless/uhv/propulsion.js'), /recipe\.blastFurnaceTemp\(r\.temp\)/);
  assert.deepEqual(side('boron_carbide').itemsOut, [{ id: 'gtceu:boron_carbide_dust', count: 5 }]);
  const zrb2 = side('zirconium_diboride');
  assert.deepEqual(zrb2.itemsIn, [{ id: 'gtceu:zirconia_dust', count: 6 }, { id: 'gtceu:boron_carbide_dust', count: 5 }, { id: 'gtceu:carbon_dust', count: 3 }]);
  assert.deepEqual(zrb2.itemsOut, [{ id: 'gtceu:zirconium_diboride_dust', count: 6 }]);
  assert.deepEqual(zrb2.fluidsOut, [{ id: 'gtceu:carbon_monoxide', amount: 4000 }]);
  assert.deepEqual(side('uhtc_blend').itemsIn, [{ id: 'gtceu:zirconium_diboride_dust', count: 6 }, { id: 'gtca:silicon_carbide_dust', count: 2 }]);
  for (const r of P.side) {
    const rec = byId(r.recipeId);
    assert.ok(rec, r.recipeId);
    assert.equal(rec.t, 'gtceu:' + r.type);
  }
  // A10's ZrF4 row takes this zirconia: our maker is the one that makes it
  const zirconiaMakers = recipes.filter((r) => outputsOf(r).includes('"gtceu:zirconia_dust"')).map((r) => r.i);
  assert.ok(zirconiaMakers.includes('grindless:electric_blast_furnace/zirconia'), zirconiaMakers.join(', '));
  assert.ok(recipes.some((r) => r.i.startsWith('grindless:') && inputsOf(r).includes('gtceu:zirconia_dust') && r.i !== side('zirconium_diboride').recipeId),
    'A10\'s zirconium tetrafluoride takes zirconia');
  const src = read('server_scripts/grindless/uhv/propulsion.js');
  for (const word of ['carbon monoxide \\(ZrB2\\)', 'carbon dust \\(c1\\)', 'silicon dioxide \\(zircon\\)']) assert.match(src, new RegExp(`//\\s+${word}`), word);
});

test('the thruster works: the ICAN motor consumes the GEO-assembled stage, the pod takes oganesson propellant', () => {
  const motor = works('ican_rocket_motor');
  assert.equal(motor.type, 'thruster_assembly');
  assert.equal(motor.circuit, 4);
  assert.deepEqual(motor.itemsIn, [{ id: 'grindless:ican_pellet', count: 1 }, { id: 'grindless:uhtc_nozzle', count: 1 },
    { id: 'grindless:sic_power_module', count: 2 }, { id: 'grindless:geo_assembled_stage', count: 1 }]);
  assert.deepEqual(motor.itemsOut, [{ id: MOTOR, count: 1 }]);
  assert.equal(motor.eut, VA_UHV);
  const pod = works('oganesson_propellant_pod');
  assert.equal(pod.circuit, 5);
  assert.deepEqual(pod.itemsIn, [{ id: 'grindless:propellant_tank', count: 1 }]);
  assert.deepEqual(pod.fluidsIn, [{ id: 'gtceu:oganesson_propellant', amount: 1000 }]);
  assert.deepEqual(pod.itemsOut, [{ id: 'grindless:oganesson_propellant_pod', count: 1 }]);
  for (const r of [motor, pod]) {
    const rec = byId(r.recipeId);
    assert.ok(rec, r.recipeId);
    assert.equal(rec.t, 'gtceu:thruster_assembly');
    assert.deepEqual(circuitOf(rec), [r.circuit], r.name);
    assert.ok(r.itemsIn.length + 1 <= W.worksIO.itemsIn, r.name);
  }
  assert.ok(inputsOf(byId(motor.recipeId)).includes('grindless:geo_assembled_stage'), 'the recipe JSON takes the stage');
  const consumers = recipes.filter((r) => inputsOf(r).includes('"grindless:geo_assembled_stage"')).map((r) => r.i);
  assert.deepEqual(consumers, ['grindless:thruster_assembly/ican_rocket_motor']);
  const makers = recipes.filter((r) => outputsOf(r).includes(`"${MOTOR}"`)).map((r) => r.i);
  assert.deepEqual(makers, ['grindless:thruster_assembly/ican_rocket_motor']);
});

test('the controller is an assembly line: UHV hull, UHV pistons, UHV circuits, tritanium and station research', () => {
  const ctrl = byId(P.crafting.sinterer);
  assert.ok(ctrl, P.crafting.sinterer);
  assert.equal(ctrl.t, 'gtceu:assembly_line');
  assert.match(outputsOf(ctrl), /gtceu:spark_plasma_sinterer/);
  const j = JSON.stringify(ctrl.j);
  for (const id of ['gtceu:uhv_machine_hull', 'gtceu:uhv_electric_piston', 'gtceu:circuits/uhv', 'gtceu:tritanium', '"research"']) assert.ok(j.includes(id), id);
});

test('names: en_us and es_es for the machine, its type, the items, the motor and the materials', () => {
  const lang = read('client_scripts/grindless/uhv_propulsion_lang.js');
  const [en, es] = lang.split('es_es: {');
  assert.ok(es, 'es_es block');
  for (const part of [en, es]) {
    for (const key of ['sinterer:', 'sinterType:', 'sintererTips:', 'motor:', 'tantalum_carbide_liner:', 'oganesson_propellant_pod:',
      'boron_carbide:', 'uhtc_blend:']) assert.ok(part.includes(key), key);
  }
  for (const k of ['block.gtceu.spark_plasma_sinterer', 'gtceu.spark_plasma_sintering', 'block.grindless.ican_rocket_motor', 'material.gtceu.']) {
    assert.ok(lang.includes(`'${k}`), k);
  }
  assert.match(lang, /i < 4/);
});
