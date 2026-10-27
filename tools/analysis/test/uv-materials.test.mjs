// UV's materials (package UV-A8), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/uv/materials.js: three recipe types, three machines with valid patterns, twelve items, two materials;
//   - server_scripts/grindless/uv/materials.js: the reactor's four steps, the line's three, the printer's rows from
//     data/grindless/tables/am_powders.json, the side steps, GTM's EnTED wire routes removed, the controllers' crafting;
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
const M = plain(run.global.grindless.materials);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const row = (name) => M.recipes.find((r) => r.name === name);
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const outputs = (r) => JSON.stringify(r.j.outputs || r.j.result || {});
const inputs = (r) => JSON.stringify(r.j.inputs || r.j.ingredients || {});
const read = (rel) => fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
const table = JSON.parse(read('data/grindless/tables/am_powders.json'));
const NEW_ITEMS = ['bnnt_dust', 'silver_tube', 'pit_billet', 'near_net_neutronium_gear', 'near_net_darmstadtium_rotor', 'near_net_tritanium_gear',
  'near_net_thruster_chamber', 'near_net_array_mount', 'near_net_probe_frame', 'printed_thruster_chamber', 'printed_array_mount', 'printed_probe_frame'];
const MATERIALS = ['boric_acid', 'boron_trioxide'];
const MACHINES = [['gtceu:boron_nitride_reactor', 'gtceu:boron_nitride', 7, 7, 9], ['gtceu:powder_in_tube_line', 'gtceu:powder_in_tube', 3, 5, 15],
  ['gtceu:powder_bed_printer', 'gtceu:powder_bed_fusion', 7, 7, 7]];
const WIRE = 'gtceu:enriched_naquadah_trinium_europium_duranide_single_wire';
const VA_ZPM = 122880;
const VA_UV = 491520;

test('the stand-in runs the materials scripts without errors, nothing clashing, the table clean', () => {
  const errs = run.errors.filter((e) => /uv[\\/]materials|uv_materials_lang/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(M.clashes, []);
  assert.deepEqual(M.skipped, []);
  assert.deepEqual(M.tableProblems, []);
});

test('registration: three recipe types, three machines, twelve items, F1 items not re-registered', () => {
  for (const [machine, type] of MACHINES) {
    assert.ok(run.registry.recipeTypes.has(type), type);
    assert.deepEqual(run.registry.machines.get(machine).recipeTypes, [type]);
  }
  for (const n of NEW_ITEMS) assert.ok(run.registry.items.has('grindless:' + n), n);
  const src = read('startup_scripts/grindless/uv/materials.js');
  for (const f1 of ['hbn_dust', 'bnnt_yarn', 'ented_powder', 'am_powder']) assert.ok(!new RegExp(`^\\s+\\w*${f1}\\s*:\\s*\\{`, 'm').test(src), f1 + ' is F1');
});

test('patterns: one controller in the front slice, the contract sizes, every symbol defined, GTM part limits', () => {
  for (const [id, , width, height, depth] of MACHINES) {
    const s = run.docs.structures.structures[id];
    assert.ok(s, id + ' described');
    assert.equal(s.slices.length, depth, id + ' depth');
    assert.ok(s.slices.every((sl) => sl.length === height && sl.every((r) => r.length === width)), `${id} uniform ${width} x ${height} slices`);
    const all = s.slices.flat().join('');
    assert.equal(all.split('').filter((c) => c === 'S').length, 1, id + ' one controller');
    assert.ok(s.slices[s.slices.length - 1].join('').includes('S') || s.slices[0].join('').includes('S'), id + ' controller in an end slice');
    for (const c of all) assert.ok(s.symbols[c], `${id} symbol ${c}`);
    const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
    assert.deepEqual(lim.energy_input, { min: 1, max: 2 }, id);
    assert.ok(Object.values(s.symbols).flatMap((v) => v.blocks || []).includes('gtceu:uv_machine_casing'), id + ' casing');
  }
});

test('the reactor: four steps on circuits 1 to 4, the contract numbers', () => {
  const steps = M.recipes.filter((r) => r.type === 'boron_nitride');
  assert.deepEqual(steps.map((r) => [r.name, r.circuit]), [['hbn', 1], ['bnnt', 2], ['bnnt_yarn', 3], ['hbn_boron_10', 4]]);
  assert.deepEqual(row('hbn').itemsIn, [{ id: 'gtceu:boron_trioxide_dust', count: 2 }]);
  assert.deepEqual(row('hbn').fluidsOut, [{ id: 'gtceu:steam', amount: 3000 }, { id: 'gtceu:ammonia', amount: 500 }]);
  assert.deepEqual(row('bnnt').fluidsIn, row('bnnt').fluidsOut, 'the hydrogen carrier comes back');
  assert.deepEqual(row('bnnt_yarn').itemsOut, [{ id: 'grindless:bnnt_yarn', count: 1 }, { id: 'grindless:hbn_dust', count: 1 }]);
  for (const r of steps) {
    assert.equal(r.eut, VA_ZPM, r.name);
    const rec = byId(r.recipeId);
    assert.ok(rec, r.recipeId);
    assert.deepEqual(circuitOf(rec), [r.circuit]);
  }
});

test('BNNT yarn comes only from the boron nitride reactor', () => {
  const makers = recipes.filter((r) => outputs(r).includes('"grindless:bnnt_yarn"'));
  assert.ok(makers.length >= 1);
  assert.deepEqual([...new Set(makers.map((r) => r.t))], ['gtceu:boron_nitride']);
});

test('the hot cell\'s boron-10 trifluoride has a destination: the reactor\'s circuit 4', () => {
  const r = row('hbn_boron_10');
  assert.deepEqual(r.fluidsIn, [{ id: 'gtceu:boron_10_trifluoride', amount: 1000 }, { id: 'gtceu:ammonia', amount: 1000 }]);
  assert.deepEqual(r.fluidsOut, [{ id: 'gtceu:hydrofluoric_acid', amount: 3000 }]);
  const users = recipes.filter((x) => inputs(x).includes('"gtceu:boron_10_trifluoride"'));
  assert.ok(users.some((x) => x.t === 'gtceu:boron_nitride'));
});

test('the line: GTM\'s EnTED composition, the billet, 16 wires and the sheath back', () => {
  const steps = M.recipes.filter((r) => r.type === 'powder_in_tube');
  assert.deepEqual(steps.map((r) => [r.name, r.circuit]), [['ented_powder', 1], ['pit_billet', 2], ['ented_wire', 3], ['rtan_wire', 4], ['mgb2_wire', 5]]);
  assert.deepEqual(row('ented_powder').itemsIn.map((x) => [x.id, x.count]), [['gtceu:enriched_naquadah_dust', 4], ['gtceu:trinium_dust', 3],
    ['gtceu:europium_dust', 2], ['gtceu:duranium_dust', 1]]);
  assert.deepEqual(row('ented_powder').itemsOut, [{ id: 'grindless:ented_powder', count: 10 }]);
  assert.deepEqual(row('pit_billet').itemsIn, [{ id: 'grindless:ented_powder', count: 4 }, { id: 'grindless:silver_tube', count: 1 }]);
  assert.deepEqual(row('ented_wire').itemsOut, [{ id: WIRE, count: 16 }, { id: 'gtceu:silver_dust', count: 1 }]);
  assert.equal(row('ented_wire').eut, VA_UV);
  for (const r of steps) assert.ok(byId(r.recipeId), r.recipeId);
  const io = M.lineIO;
  for (const r of steps) assert.ok(r.itemsIn.length + 1 <= io.itemsIn && r.itemsOut.length <= io.itemsOut && r.fluidsIn.length === 0, r.name);
});

test('EnTED single wire: only the line adds it, GTM\'s wiremill, extruder and crafting routes are removed', () => {
  const makers = recipes.filter((r) => outputs(r).includes(`"${WIRE}"`));
  assert.deepEqual([...new Set(makers.map((r) => r.t))], ['gtceu:powder_in_tube']);
  const out = (id) => ({ item: [{ content: { type: 'gtceu:sized', count: 1, ingredient: { item: id } }, chance: 10000 }], fluid: [] });
  const originals = [
    { i: 'gtceu:wiremill/mill_enriched_naquadah_trinium_europium_duranide_wire', t: 'gtceu:wiremill', j: { outputs: out(WIRE) } },
    { i: 'gtceu:extruder/extrude_enriched_naquadah_trinium_europium_duranide_wire_quadruple', t: 'gtceu:extruder',
      j: { outputs: out('gtceu:enriched_naquadah_trinium_europium_duranide_quadruple_wire') } },
    { i: 'gtceu:shaped/enriched_naquadah_trinium_europium_duranide_wire_single', t: 'minecraft:crafting_shaped', j: { result: { item: WIRE } } },
    { i: 'gtceu:wiremill/mill_enriched_naquadah_trinium_europium_duranide_wire_fine', t: 'gtceu:wiremill',
      j: { outputs: out('gtceu:fine_enriched_naquadah_trinium_europium_duranide_wire') } },
    { i: 'gtceu:packer/package_enriched_naquadah_trinium_europium_duranide_double_wire', t: 'gtceu:packer',
      j: { outputs: out('gtceu:enriched_naquadah_trinium_europium_duranide_double_wire') } }
  ];
  const r2 = runPackScripts(pack, { originals });
  assert.equal(plain(r2.global.grindless.materials).wireRemoved, 3, 'wiremill, extruder and shaped matched; fine wire and packer kept');
  const filters = r2.removals.filter((x) => /uv[\\/]materials/.test(String(x.file))).map((x) => JSON.parse(x.filter));
  assert.equal(filters.length, M.wireRemovals.length);
  assert.ok(filters.every((f) => f.id || (['gtceu:wiremill', 'gtceu:extruder'].includes(f.type) && f.output)), 'every filter is narrow');
});

test('the printer: every metal atomised under argon with its argon back', () => {
  for (const m of table.metals) {
    const r = row('atomise_' + m.name);
    assert.ok(r, m.name);
    assert.equal(r.circuit, table.atomise.circuit);
    assert.deepEqual(r.itemsIn, [{ id: m.ingot, count: table.atomise.ingots }]);
    assert.deepEqual(r.itemsOut, [{ id: m.powder, count: table.atomise.ingots }]);
    assert.deepEqual(r.fluidsIn, [{ id: table.argon, amount: table.atomise.argonIn }]);
    assert.deepEqual(r.fluidsOut, [{ id: table.argon, amount: table.atomise.argonBack }]);
    assert.ok(table.atomise.argonBack < table.atomise.argonIn && table.atomise.argonBack > 0);
  }
});

test('the printer: every part prints with powder back and 2 % module wear, and presses with all its argon back', () => {
  assert.equal(table.module.id, 'grindless:fibre_laser_module');
  assert.equal(table.module.spent, 'grindless:spent_laser_module');
  assert.equal(table.module.wear, 200);
  for (const p of table.parts) {
    const metal = table.metals.find((m) => m.name === p.metal);
    const print = row('print_' + p.name);
    assert.deepEqual(print.itemsIn, [{ id: metal.powder, count: p.powderIn }], p.name);
    assert.deepEqual(print.itemsOut, [{ id: p.nearNet, count: 1 }, { id: metal.powder, count: p.powderBack }], p.name);
    assert.ok(p.powderBack > 0 && p.powderBack < p.powderIn, p.name);
    assert.deepEqual(print.wear, { module: table.module.id, spent: table.module.spent, chance: table.module.wear });
    const rec = byId(print.recipeId);
    assert.ok(rec, print.recipeId);
    assert.ok(rec.j.inputs.item.some((i) => i.chance === 200 && JSON.stringify(i).includes('"grindless:fibre_laser_module"')), 'module chanced in');
    assert.ok(rec.j.outputs.item.some((i) => i.chance === 200 && JSON.stringify(i).includes('"grindless:spent_laser_module"')), 'spent module chanced out');
    assert.deepEqual(circuitOf(rec), [p.circuit]);
    const press = row('press_' + p.name);
    assert.deepEqual(press.itemsIn, [{ id: p.nearNet, count: 1 }]);
    assert.deepEqual(press.itemsOut, [{ id: p.output, count: 1 }]);
    assert.deepEqual(press.fluidsIn, press.fluidsOut, p.name + ' argon back');
    assert.equal(press.fluidsIn[0].id, table.argon);
    if (p.gtm) assert.ok(p.powderIn - p.powderBack < 4, p.name + ' cheaper than GTM\'s 4 ingots');
  }
});

test('the table\'s items are registered here or by F1', () => {
  const f1 = run.global.grindless.uvFoundation;
  for (const p of table.parts) {
    assert.ok(run.registry.items.has(p.nearNet), p.nearNet);
    if (!p.gtm) assert.ok(run.registry.items.has(p.output), p.output);
  }
  for (const m of table.metals) assert.ok(run.registry.items.has(m.powder) || JSON.stringify(plain(f1 || {})).includes(m.powder), m.powder);
});

test('side steps: boric acid from borax, boron trioxide in the blast furnace, silver tubes in the extruder', () => {
  const side = Object.fromEntries(M.side.map((r) => [r.name, r]));
  assert.deepEqual(side.boric_acid.itemsIn, [{ id: 'gtceu:borax_dust', count: 1 }]);
  assert.ok(side.boric_acid.itemsOut.some((x) => x.id === 'gtceu:salt_dust'), 'the salt has a destination');
  assert.deepEqual(side.boron_trioxide.itemsOut, [{ id: 'gtceu:boron_trioxide_dust', count: 1 }]);
  assert.equal(side.boron_trioxide.temp, 1000);
  assert.deepEqual(side.silver_tube.notConsumed, ['gtceu:tiny_pipe_extruder_mold']);
  for (const r of M.side) assert.ok(byId(r.recipeId), r.recipeId);
  // the reactor's line closes: borax -> boric acid -> boron trioxide -> hBN
  assert.equal(row('hbn').itemsIn[0].id, side.boron_trioxide.itemsOut[0].id);
});

test('the controllers are craftable', () => {
  const ids = recipes.map((r) => r.i);
  for (const id of Object.values(M.crafting)) assert.ok(ids.includes(id), id);
});

test('names: en_us and es_es for the machines, the types, the items and the materials', () => {
  const lang = read('client_scripts/grindless/uv_materials_lang.js');
  const [en, es] = lang.split('es_es: {');
  assert.ok(es, 'es_es block');
  for (const part of [en, es]) {
    for (const key of ['reactor:', 'line:', 'printer:', 'reactorType:', 'lineType:', 'printerType:', 'reactorTips:', 'lineTips:', 'printerTips:']) assert.ok(part.includes(key), key);
    for (const n of NEW_ITEMS.concat(MATERIALS)) assert.ok(part.includes(`${n}:`), n);
  }
  for (const k of ['block.gtceu.boron_nitride_reactor', 'block.gtceu.powder_in_tube_line', 'block.gtceu.powder_bed_printer', 'gtceu.boron_nitride',
    'gtceu.powder_in_tube', 'gtceu.powder_bed_fusion', 'material.gtceu.']) assert.ok(lang.includes(`'${k}`), k);
  assert.match(lang, /i < 4/);
});
