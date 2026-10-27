// UV's propulsion (package UV-A11), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/uv/propulsion.js: two recipe types, two machines with valid patterns, eight items, F1's tank untouched;
//   - server_scripts/grindless/uv/propulsion.js: the winder's tier 11 tank, the works' ion / Hall / pod steps, the side parts, the
//     controllers' crafting;
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
const P = plain(run.global.grindless.propulsion);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const row = (name) => P.recipes.find((r) => r.name === name);
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const outputs = (r) => JSON.stringify(r.j.outputs || r.j.result || {});
const inputs = (r) => JSON.stringify(r.j.inputs || r.j.ingredients || {});
const read = (rel) => fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
const NEW_ITEMS = ['ion_thruster', 'hall_thruster', 'thruster_pod', 'molybdenum_grid', 'lanthanum_hexaboride_cathode', 'bn_discharge_channel',
  'uv_electromagnet', 'propellant_tank'];
const MACHINES = [['gtceu:cryotank_winder', 'gtceu:cryotank_winding'], ['gtceu:thruster_works', 'gtceu:thruster_assembly']];
const TANK = 'grindless:bnnt_fuel_tank';
const VA_UV = 491520;

test('the stand-in runs the propulsion scripts without errors, nothing clashing or skipped', () => {
  const errs = run.errors.filter((e) => /uv[\\/]propulsion|uv_propulsion_lang/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(P.clashes, []);
  assert.deepEqual(P.skipped, []);
});

test('registration: two recipe types, two machines, eight items; the BNNT tank stays F1\'s', () => {
  for (const [machine, type] of MACHINES) {
    assert.ok(run.registry.recipeTypes.has(type), type);
    assert.deepEqual(run.registry.machines.get(machine).recipeTypes, [type]);
  }
  for (const n of NEW_ITEMS) assert.ok(run.registry.items.has('grindless:' + n), n);
  const src = read('startup_scripts/grindless/uv/propulsion.js');
  assert.ok(!/\.create\([^)]*(fuel_tank|'gcyr:)/.test(src), 'no tank registration here');
  assert.equal(P.ids.bnntFuelTank, run.global.grindless.uvFoundation.ids.bnntFuelTank);
  const foundation = read('startup_scripts/grindless/uv/foundation.js');
  assert.match(foundation, /bnnt_fuel_tank/);
});

test('patterns: 7 x 7 x 9, one controller in the front slice, every symbol defined, GTM part limits', () => {
  for (const [id] of MACHINES) {
    const s = run.docs.structures.structures[id];
    assert.ok(s, id + ' described');
    assert.equal(s.slices.length, 9, id + ' depth');
    assert.ok(s.slices.every((sl) => sl.length === 7 && sl.every((r) => r.length === 7)), `${id} uniform 7 x 7 slices`);
    const all = s.slices.flat().join('');
    assert.equal(all.split('').filter((c) => c === 'S').length, 1, id + ' one controller');
    assert.ok(s.slices[s.slices.length - 1].join('').includes('S'), id + ' controller in the front slice');
    for (const c of all) assert.ok(s.symbols[c], `${id} symbol ${c}`);
    const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
    assert.deepEqual(lim.energy_input, { min: 1, max: 2 }, id);
    assert.ok(lim.input_bus && lim.input_hatch && lim.output_bus, id + ' buses and the input hatch');
    assert.ok(Object.values(s.symbols).flatMap((v) => v.blocks || []).includes('gtceu:uv_machine_casing'), id + ' casing');
  }
  const works = run.docs.structures.structures['gtceu:thruster_works'];
  const lim = Object.fromEntries(works.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
  assert.ok(lim.output_hatch, 'the works returns the firing gas');
});

test('the winder: the tier 11 tank from the aerogel tank, both yarns, hBN, epoxy and the chart kept', () => {
  const steps = P.recipes.filter((r) => r.type === 'cryotank_winding');
  assert.deepEqual(steps.map((r) => [r.name, r.circuit]), [['bnnt_fuel_tank', 1]]);
  const r = row('bnnt_fuel_tank');
  assert.deepEqual(r.itemsIn, [{ id: 'grindless:aerogel_fuel_tank', count: 1 }, { id: 'grindless:bnnt_yarn', count: 16 },
    { id: 'grindless:carbon_nanotube_yarn', count: 16 }, { id: 'grindless:hbn_dust', count: 4 }]);
  assert.deepEqual(r.fluidsIn, [{ id: 'gtceu:epoxy', amount: 1000 }]);
  assert.deepEqual(r.notConsumed, ['grindless:pluto_kuiper_chart']);
  assert.deepEqual(r.itemsOut, [{ id: TANK, count: 1 }]);
  assert.equal(r.eut, VA_UV);
  assert.equal(r.duration, 1200);
  const rec = byId(r.recipeId);
  assert.ok(rec, r.recipeId);
  assert.deepEqual(circuitOf(rec), [1]);
  const io = P.winderIO;
  assert.ok(r.itemsIn.length + r.notConsumed.length + 1 <= io.itemsIn && r.fluidsIn.length <= io.fluidsIn);
});

test('the BNNT tank comes only from the winder, and the winder consumes A8\'s BNNT yarn', () => {
  const makers = recipes.filter((r) => outputs(r).includes(`"${TANK}"`));
  assert.ok(makers.length >= 1);
  assert.deepEqual([...new Set(makers.map((r) => r.t))], ['gtceu:cryotank_winding']);
  assert.ok(inputs(byId(row('bnnt_fuel_tank').recipeId)).includes('"grindless:bnnt_yarn"'));
});

test('the works: ion on xenon, Hall on krypton (the Kuiper row), 90 % of the gas back, the pod from both', () => {
  const steps = P.recipes.filter((r) => r.type === 'thruster_assembly');
  assert.deepEqual(steps.map((r) => [r.name, r.circuit]), [['ion_thruster', 1], ['hall_thruster', 2], ['thruster_pod', 3],
    ['ican_rocket_motor', 4], ['oganesson_propellant_pod', 5]]);
  const ion = row('ion_thruster');
  assert.ok(ion.itemsIn.some((x) => x.id === 'grindless:printed_thruster_chamber' && x.count === 1), 'A8\'s printed chamber');
  assert.ok(ion.itemsIn.some((x) => x.id === 'grindless:molybdenum_grid' && x.count === 2));
  assert.deepEqual(ion.fluidsIn, [{ id: 'gtceu:xenon', amount: 4000 }]);
  assert.deepEqual(ion.fluidsOut, [{ id: 'gtceu:xenon', amount: 3600 }]);
  const hall = row('hall_thruster');
  assert.ok(hall.itemsIn.some((x) => x.id === 'grindless:uv_electromagnet' && x.count === 4));
  assert.deepEqual(hall.fluidsIn, [{ id: 'gtceu:krypton', amount: 4000 }]);
  assert.deepEqual(hall.fluidsOut, [{ id: 'gtceu:krypton', amount: 3600 }]);
  const pod = row('thruster_pod');
  assert.deepEqual(pod.itemsIn.map((x) => x.id), ['grindless:ion_thruster', 'grindless:hall_thruster', '#gtceu:circuits/uv', 'grindless:propellant_tank']);
  assert.deepEqual(pod.itemsOut, [{ id: 'grindless:thruster_pod', count: 1 }]);
  for (const r of steps) {
    const rec = byId(r.recipeId);
    assert.ok(rec, r.recipeId);
    assert.deepEqual(circuitOf(rec), [r.circuit]);
    assert.ok(r.itemsIn.length + 1 <= P.worksIO.itemsIn, r.name);
  }
  assert.ok(inputs(byId(hall.recipeId)).includes('gtceu:krypton'), 'the recipe JSON takes krypton');
  const kuiper = run.global.grindless.uvFoundation.ids.kuiperNobleGas;
  assert.ok(kuiper, 'F1 registers the Kuiper noble gas mix that B4 splits into krypton');
});

test('side steps: every thruster part has one maker on a GTM machine', () => {
  const side = Object.fromEntries(P.side.map((r) => [r.name, r]));
  assert.deepEqual(Object.keys(side).sort(), ['bn_discharge_channel', 'lanthanum_hexaboride_cathode', 'molybdenum_grid', 'propellant_tank',
    'uv_electromagnet']);
  assert.deepEqual(side.molybdenum_grid.notConsumed, ['gtceu:sapphire_lens']);
  assert.equal(side.lanthanum_hexaboride_cathode.temp, 2500);
  assert.deepEqual(side.lanthanum_hexaboride_cathode.itemsIn, [{ id: 'gtceu:lanthanum_dust', count: 1 }, { id: 'gtceu:boron_dust', count: 6 }]);
  assert.ok(side.bn_discharge_channel.itemsIn.some((x) => x.id === 'grindless:hbn_dust'), 'machine 13\'s hBN');
  assert.notEqual(side.uv_electromagnet.circuit, side.propellant_tank.circuit);
  for (const r of P.side) assert.ok(byId(r.recipeId), r.recipeId);
  for (const n of ['molybdenum_grid', 'lanthanum_hexaboride_cathode', 'bn_discharge_channel', 'uv_electromagnet', 'propellant_tank']) {
    const makers = recipes.filter((r) => outputs(r).includes(`"grindless:${n}"`));
    assert.equal(makers.length, 1, n);
  }
});

test('the controllers are craftable', () => {
  const ids = recipes.map((r) => r.i);
  for (const id of Object.values(P.crafting)) assert.ok(ids.includes(id), id);
});

test('names: en_us and es_es for the machines, the types and the items', () => {
  const lang = read('client_scripts/grindless/uv_propulsion_lang.js');
  const [en, es] = lang.split('es_es: {');
  assert.ok(es, 'es_es block');
  for (const part of [en, es]) {
    for (const key of ['winder:', 'works:', 'winderType:', 'worksType:', 'winderTips:', 'worksTips:']) assert.ok(part.includes(key), key);
    for (const n of NEW_ITEMS) assert.ok(part.includes(`${n}:`), n);
  }
  for (const k of ['block.gtceu.cryotank_winder', 'block.gtceu.thruster_works', 'gtceu.cryotank_winding', 'gtceu.thruster_assembly']) {
    assert.ok(lang.includes(`'${k}`), k);
  }
  assert.match(lang, /i < 4/);
});

test('every new item has an icon', () => {
  for (const n of NEW_ITEMS) assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'item', n + '.png')), n);
});
