// UHV's ZBLAN draw tower (package UHV-A10), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/uhv/zblan.js: one recipe type, one machine (3 x 11 x 3 tower), the preform, zirconium tetrafluoride;
//   - server_scripts/grindless/uhv/zblan.js: the tower's two steps (Earth orbit only), line 31's ZrF4 row, the controller;
//   - IV's fluorspar kiln (iv/fluorspar_kiln.js), where the captured HF goes back;
//   - en_us and es_es text for everything new.
// Proof reuse (docs/eras/uhv.md, Common): the dimension allowlist and lib/patterns.js are proven; this checks the recipe lookup and
// that the tower's recipes carry orbits.json's Earth orbit and nothing else.
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
const Z = plain(run.global.grindless.zblan);
const recipes = run.docs.recipes.recipes;
const read = (rel) => fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
const ORBITS = JSON.parse(read('data/grindless/tables/orbits.json'));
const row = (name) => Z.recipes.find((r) => r.name === name);
const side = (name) => Z.side.find((r) => r.name === name);
const dump = (id) => recipes.find((r) => r.i === id);
// GTM's builder puts the type in front of the path: the id passed is grindless:glass, dumped as grindless:zblan_draw/glass
const idOf = (r) => `grindless:${r.type}/${r.recipeId.split(':')[1]}`;
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const dimsOf = (r) => (r.j.recipeConditions || []).filter((c) => c.type === 'dimension');
const outputsOf = (r) => JSON.stringify(r.j.outputs || r.j.result || {});
const inputsOf = (r) => JSON.stringify(r.j.inputs || r.j.ingredients || r.j.key || {});
const VA_UHV = 1966080;

test('the stand-in runs the zblan scripts without errors, nothing clashing or skipped', () => {
  const errs = run.errors.filter((e) => /zblan|fluorspar_kiln/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(Z.clashes, []);
  assert.deepEqual(Z.skipped, []);
});

test('registration: the type, the machine, the preform and ZrF4 dust; F1\'s fibre and zirconia are not registered again', () => {
  assert.deepEqual(run.registry.machines.get('gtceu:zblan_draw_tower').recipeTypes, ['gtceu:zblan_draw']);
  assert.ok(run.registry.items.has('grindless:zblan_preform'));
  assert.ok(run.registry.materials.has('gtceu:zirconium_tetrafluoride'));
  assert.ok(run.registry.items.has('gtceu:zirconium_tetrafluoride_dust'));
  const src = read('startup_scripts/grindless/uhv/zblan.js');
  for (const n of ['zblan_fibre', 'zirconia']) assert.doesNotMatch(src, new RegExp(`^\\s+${n}\\s*:\\s*\\{`, 'm'), n + ' belongs to F1');
  assert.ok(run.registry.items.has('grindless:zblan_fibre'), 'F1 fibre');
});

test('pattern: 5 x 15 x 5 draw tower (spool hall, glass and pipe shaft, heatproof furnace) under a station truss roof, one controller, GTM part limits', () => {
  const s = run.docs.structures.structures['gtceu:zblan_draw_tower'];
  assert.ok(s, 'described');
  assert.equal(s.slices.length, 5);
  assert.ok(s.slices.every((sl) => sl.length === 15 && sl.every((r) => r.length === 5)), 'uniform slices');
  assert.equal(s.slices.flat().join('').split('').filter((c) => c === 'S').length, 1, 'one controller');
  for (const sl of s.slices) for (const r of sl) for (const c of r) assert.ok(c === ' ' || s.symbols[c], `symbol ${c}`);
  const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
  for (const a of ['energy_input', 'input_bus', 'input_hatch', 'output_bus', 'output_hatch']) assert.deepEqual(lim[a], { min: 1, max: 2 }, a);
  assert.ok(s.symbols.X.options.some((o) => o.kind === 'blocks' && o.blocks.includes('gtceu:clean_machine_casing')), 'floor casing');
  const truss = Object.entries(s.symbols).filter(([, v]) => (v.blocks || []).includes('grindless:station_truss_casing')).map(([k]) => k);
  assert.equal(truss.length, 1, 'station truss symbol');
  for (const sl of s.slices) for (const ch of sl[14]) assert.ok(ch === truss[0] || ch === s.slices[2][14][2], 'truss roof (the feed gearbox in the middle)');
  assert.equal(s.slices[2][14][2], 'G', 'feed gearbox');
});

test('recipe lookup: unique circuits, every row in the dump with its circuit, figures within UHV', () => {
  assert.deepEqual(Z.recipes.map((r) => r.name), ['glass', 'draw']);
  assert.deepEqual(Z.recipes.map((r) => r.circuit), [1, 2]);
  for (const r of Z.recipes) {
    assert.ok(Number.isInteger(r.duration) && r.duration > 0 && Number.isInteger(r.eut) && r.eut > 0 && r.eut <= VA_UHV, r.name);
    const rec = dump(idOf(r));
    assert.ok(rec, idOf(r));
    assert.equal(rec.t, 'gtceu:zblan_draw');
    assert.deepEqual(circuitOf(rec), [r.circuit], r.name);
  }
  for (const r of Z.recipes.concat(Z.side)) for (const x of r.itemsIn.concat(r.itemsOut)) assert.ok(x.count >= 1 && x.count <= 64, `${r.name} ${x.id}`);
});

test('orbit allowlist: every ZBLAN draw recipe carries orbits.json\'s Earth orbit and no other dimension', () => {
  assert.equal(Z.site, ORBITS.earth);
  const tower = recipes.filter((r) => r.t === 'gtceu:zblan_draw');
  assert.equal(tower.length, 2);
  for (const r of tower) assert.deepEqual(dimsOf(r).map((c) => [c.dimension, c.reverse]), [[ORBITS.earth, false]], r.i);
  assert.ok(!dimsOf(dump(idOf(side('zirconium_tetrafluoride')))).length, 'the ZrF4 row runs anywhere');
});

test('ZBLAN fibre is drawn only by the tower: one maker, 8 per preform, the preform only from circuit 1', () => {
  const makers = recipes.filter((r) => outputsOf(r).includes('"grindless:zblan_fibre"'));
  assert.deepEqual(makers.map((r) => r.i), [idOf(row('draw'))]);
  assert.deepEqual(row('draw').itemsIn, [{ id: 'grindless:zblan_preform', count: 1 }]);
  assert.deepEqual(row('draw').itemsOut, [{ id: 'grindless:zblan_fibre', count: 8 }]);
  const preforms = recipes.filter((r) => outputsOf(r).includes('"grindless:zblan_preform"'));
  assert.deepEqual(preforms.map((r) => r.i), [idOf(row('glass'))]);
});

test('glass: ZrF4 + Ba + La + Al + Na under HF from the kiln; the captured HF goes back to the fluorspar kiln as fluorite', () => {
  const glass = row('glass');
  assert.deepEqual(glass.itemsIn.map((i) => i.id), ['gtceu:zirconium_tetrafluoride_dust', 'gtceu:barium_dust', 'gtceu:lanthanum_dust',
    'gtceu:aluminium_dust', 'gtceu:sodium_dust', 'gtceu:quicklime_dust']);
  assert.deepEqual(glass.fluidsIn, [{ id: 'gtceu:hydrofluoric_acid', amount: 20000 }]);
  // atoms: 4 Ba + 1 La + 1 Al + 4 Na take 18 F -> 18,000 mB H; 2,000 mB HF + 1 CaO (2 dust) -> 1 CaF2 (3 dust) + 1,000 mB water
  const n = Object.fromEntries(glass.itemsIn.map((i) => [i.id, i.count]));
  const fluorine = n['gtceu:barium_dust'] * 2 + n['gtceu:lanthanum_dust'] * 3 + n['gtceu:aluminium_dust'] * 3 + n['gtceu:sodium_dust'];
  assert.deepEqual(glass.fluidsOut, [{ id: 'gtceu:hydrogen', amount: fluorine * 1000 }, { id: 'minecraft:water', amount: 1000 }]);
  assert.equal(glass.fluidsIn[0].amount - fluorine * 1000, (n['gtceu:quicklime_dust'] / 2) * 2000);
  assert.equal(n['gtceu:zirconium_tetrafluoride_dust'] % 5, 0, 'whole ZrF4 units');
  const kilnCharge = run.global.grindless.fluorsparKiln.charge;
  assert.deepEqual(glass.itemsOut, [{ id: 'grindless:zblan_preform', count: 1 }, { id: kilnCharge.fluorite.id, count: kilnCharge.fluorite.count }]);
  const kiln = dump('grindless:fluorspar_digestion/hydrofluoric_acid_from_fluorite');
  assert.ok(kiln, 'the kiln recipe');
  assert.ok(inputsOf(kiln).includes(kilnCharge.fluorite.id), 'the kiln takes the fluorite');
  assert.ok(outputsOf(kiln).includes('gtceu:hydrofluoric_acid'), 'the kiln gives HF back');
  const src = read('server_scripts/grindless/uhv/zblan.js');
  for (const word of ['fluorspar kiln', 'hydrogen', 'water', 'quicklime']) assert.match(src, new RegExp(word, 'i'), word);
});

test('line 31: ZrO2 + 4 HF -> ZrF4 + 2 H2O on GTM\'s chemical reactor, from F1\'s zirconia', () => {
  const r = side('zirconium_tetrafluoride');
  assert.equal(r.type, 'chemical_reactor');
  assert.deepEqual(r.itemsIn, [{ id: 'gtceu:zirconia_dust', count: 3 }]);
  assert.deepEqual(r.fluidsIn, [{ id: 'gtceu:hydrofluoric_acid', amount: 4000 }]);
  assert.deepEqual(r.itemsOut, [{ id: 'gtceu:zirconium_tetrafluoride_dust', count: 5 }]);
  assert.deepEqual(r.fluidsOut, [{ id: 'minecraft:water', amount: 2000 }]);
  const rec = dump(idOf(r));
  assert.ok(rec, idOf(r));
  assert.equal(rec.t, 'gtceu:chemical_reactor');
  const makers = recipes.filter((x) => outputsOf(x).includes('"gtceu:zirconium_tetrafluoride_dust"'));
  assert.deepEqual(makers.map((x) => x.i), [idOf(r)]);
});

test('controller: UHV hull + 2 UV motors + 2 UHV circuits', () => {
  const r = dump(Z.crafting.tower);
  assert.ok(r, Z.crafting.tower);
  const text = JSON.stringify(r.j);
  for (const id of ['gtceu:uhv_machine_hull', 'gtceu:uv_electric_motor', 'gtceu:circuits/uhv']) assert.ok(text.includes(id), id);
});

test('names: en_us and es_es for the machine, the type, the preform and ZrF4', () => {
  const lang = read('client_scripts/grindless/uhv_zblan_lang.js');
  const [en, es] = lang.split('es_es: {');
  assert.ok(es, 'es_es block');
  for (const part of [en, es]) for (const key of ['tower:', 'towerType:', 'towerTips:', 'zblan_preform:', 'zirconium_tetrafluoride:']) assert.ok(part.includes(key), key);
  for (const k of ['block.gtceu.zblan_draw_tower', 'gtceu.zblan_draw', 'grindless.machine.zblan_draw_tower.tooltip.', 'material.gtceu.']) assert.ok(lang.includes(`'${k}`), k);
  assert.match(lang, /i < 4/);
});
