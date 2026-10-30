// UHV on Mercury's ground (package UHV-B2), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/uhv/mercury.js: two recipe types, two machines (9 x 5 x 3 excavator, 9 x 9 x 5 furnace), seven items;
//   - server_scripts/grindless/uhv/mercury.js: the excavator's dig, the furnace's three steps, the side rows, the controllers;
//   - server_scripts/grindless/uv/materials.js: line 20's MgB2 powder-in-tube row (circuit 5);
//   - en_us and es_es text for everything new.
// Proof reuse (docs/eras/uhv.md, Common): IV's Mercury daylight rule (iv/mercury.js, .daytime(false)) and lib/patterns.js are proven;
// this checks the recipe lookup and that every furnace recipe carries Mercury and the day-side condition.
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
const HM = plain(run.global.grindless.uhvMercury);
const MAT = plain(run.global.grindless.materials);
const recipes = run.docs.recipes.recipes;
const read = (rel) => fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
const row = (name) => HM.recipes.find((r) => r.name === name);
const dump = (id) => recipes.find((r) => r.i === id);
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const dimsOf = (r) => (r.j.recipeConditions || []).filter((c) => c.type === 'dimension');
const dayOf = (r) => (r.j.recipeConditions || []).filter((c) => c.type === 'daytime');
const outputsOf = (r) => JSON.stringify(r.j.outputs || r.j.result || {});
const MERCURY = 'gcyr:mercury';
const VA_UHV = 1966080;
const UEV = /uev|uiv|uxv|opv|max_/;

test('the stand-in runs the mercury scripts without errors, nothing clashing or skipped', () => {
  const errs = run.errors.filter((e) => /uhv[\\/]mercury|uv[\\/]materials|uhv_mercury_lang/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(HM.clashes, []);
  assert.deepEqual(HM.skipped, []);
  assert.deepEqual(MAT.skipped, []);
  assert.deepEqual(MAT.clashes, []);
});

test('registration: two types, two machines, seven items; F1\'s ids are not registered again', () => {
  assert.deepEqual(run.registry.machines.get('gtceu:regolith_excavator').recipeTypes, ['gtceu:regolith_excavation']);
  assert.deepEqual(run.registry.machines.get('gtceu:solar_vapour_furnace').recipeTypes, ['gtceu:solar_vaporisation']);
  for (const n of ['mercury_regolith', 'stripped_mercury_regolith', 'excavator_bucket_drum', 'regolith_crucible_lining', 'silicon_monoxide_dust',
    'alumina_calcia_residue', 'iron_tube']) {
    assert.ok(run.registry.items.has('grindless:' + n), n);
    assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'item', n + '.png')), n + ' texture');
  }
  const F1 = plain(run.global.grindless.uhvFoundation);
  const f1ids = JSON.stringify(F1);
  for (const id of HM.items) assert.ok(!f1ids.includes(`"${id}"`), id + ' is F1\'s');
  for (const m of ['regolith_excavator', 'solar_vapour_furnace']) {
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) {
      assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'block', 'multiblock', m, f)), `${m}/${f}`);
    }
  }
});

function shape(id, w, d, h) {
  const s = run.docs.structures.structures[id];
  assert.ok(s, id + ' described');
  assert.equal(s.slices.length, d, id + ' depth');
  assert.ok(s.slices.every((sl) => sl.length === h && sl.every((r) => r.length === w)), id + ' uniform slices');
  assert.equal(s.slices.flat().join('').split('').filter((c) => c === 'S').length, 1, id + ' one controller');
  for (const sl of s.slices) for (const r of sl) for (const c of r) if (c !== ' ') assert.ok(s.symbols[c], `${id} symbol ${c}`);
  return s;
}
const blockSymbols = (s, id) => Object.entries(s.symbols).filter(([, v]) => (v.blocks || []).includes(id)).map(([k]) => k);
const count = (s, ch) => s.slices.flat().join('').split('').filter((c) => c === ch).length;

test('excavator pattern: 9 x 5 x 3, heat-shield brick chassis, two drums on frame arms, GTM part limits', () => {
  const s = shape('gtceu:regolith_excavator', 9, 5, 3);
  const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
  assert.deepEqual(Object.keys(lim).sort(), ['energy_input', 'input_bus', 'output_bus']);
  assert.ok(s.symbols.X.options.some((o) => o.kind === 'blocks' && o.blocks.includes('grindless:hermean_heat_shield_brick')), 'chassis brick');
  const gear = blockSymbols(s, 'gtceu:tungstensteel_gearbox');
  assert.equal(gear.length, 1);
  assert.equal(count(s, gear[0]), 12, 'two drums of six gearboxes');
});

test('furnace pattern: 9 x 9 x 5, ten heliostats, condenser plates, firebox receiver, an output hatch for the Na-K', () => {
  const s = shape('gtceu:solar_vapour_furnace', 9, 9, 5);
  const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
  assert.deepEqual(Object.keys(lim).sort(), ['energy_input', 'input_bus', 'output_bus', 'output_hatch']);
  assert.equal(count(s, blockSymbols(s, 'grindless:heliostat_mirror')[0]), 10, 'mirrors');
  assert.ok(count(s, blockSymbols(s, 'grindless:night_sky_radiator')[0]) >= 6, 'condenser plates');
  assert.equal(count(s, blockSymbols(s, 'gtceu:tungstensteel_firebox_casing')[0]), 25, '5 x 5 receiver');
});

test('recipe lookup: every row in the dump, each furnace step with its own circuit, figures within UHV', () => {
  const furnace = HM.recipes.filter((r) => r.type === 'solar_vaporisation');
  assert.deepEqual(furnace.map((r) => [r.name, r.circuit]), [['low_fraction', 1], ['high_fraction', 2], ['sinter_lining', 3]]);
  for (const r of HM.recipes) {
    assert.ok(Number.isInteger(r.duration) && r.duration > 0 && Number.isInteger(r.eut) && r.eut > 0 && r.eut <= VA_UHV, r.name);
    const rec = dump(r.recipeId);
    assert.ok(rec, r.recipeId);
    assert.equal(rec.t, 'gtceu:' + r.type);
    assert.deepEqual(circuitOf(rec), r.circuit === null ? [] : [r.circuit], r.name);
    for (const x of r.itemsIn.concat(r.itemsOut)) assert.ok(x.count >= 1 && x.count <= 64, `${r.name} ${x.id}`);
  }
  assert.equal(recipes.filter((r) => r.t === 'gtceu:solar_vaporisation').length, 3);
  assert.equal(recipes.filter((r) => r.t === 'gtceu:regolith_excavation').length, 1);
});

test('daylight rule: every furnace recipe needs Mercury and the day side; the excavator needs Mercury; the side rows run anywhere', () => {
  assert.equal(HM.site, MERCURY);
  for (const r of recipes.filter((x) => x.t === 'gtceu:solar_vaporisation')) {
    assert.deepEqual(dimsOf(r).map((c) => [c.dimension, c.reverse]), [[MERCURY, false]], r.i);
    assert.deepEqual(dayOf(r).map((c) => c.args), [[false]], r.i + ' day side');
  }
  const dig = dump(row('dig').recipeId);
  assert.deepEqual(dimsOf(dig).map((c) => [c.dimension, c.reverse]), [[MERCURY, false]]);
  assert.deepEqual(dayOf(dig), [], 'the excavator digs day and night');
  for (const r of HM.recipes.filter((x) => !/regolith_excavation|solar_vaporisation/.test(x.type))) {
    assert.deepEqual((dump(r.recipeId).j.recipeConditions || []).filter((c) => c.type !== 'research'), [], r.name);
  }
  // the same rule as IV's solar field
  assert.match(read('server_scripts/grindless/iv/mercury.js'), /\.daytime\(false\)/);
});

test('Mercury regolith comes only from the excavator: worn drum, IV\'s sample kept', () => {
  const makers = recipes.filter((r) => outputsOf(r).includes('"grindless:mercury_regolith"'));
  assert.deepEqual(makers.map((r) => r.i), [row('dig').recipeId]);
  const dig = row('dig');
  assert.deepEqual(dig.itemsOut, [{ id: 'grindless:mercury_regolith', count: 64 }]);
  assert.deepEqual(dig.notConsumed, ['grindless:vein_sample_iridosmine_mercury']);
  assert.deepEqual(dig.wear, { id: 'grindless:excavator_bucket_drum', chance: 313 });
  const drum = recipes.filter((r) => outputsOf(r).includes('"grindless:excavator_bucket_drum"'));
  assert.deepEqual(drum.map((r) => r.t), ['gtceu:assembler']);
});

test('the furnace makes no osmium, iridium or any UEV material; its lining wears 1 in 16 and is sintered from the residue', () => {
  for (const r of recipes.filter((x) => x.t === 'gtceu:solar_vaporisation')) assert.doesNotMatch(outputsOf(r), /osmium|iridium|iridosmine|naquadah/, r.i);
  for (const r of HM.recipes) assert.doesNotMatch(JSON.stringify(r), UEV, r.name);
  assert.deepEqual(row('low_fraction').wear, { id: 'grindless:regolith_crucible_lining', chance: 625 });
  assert.deepEqual(row('high_fraction').wear, { id: 'grindless:regolith_crucible_lining', chance: 625 });
  assert.deepEqual(row('sinter_lining').itemsIn, [{ id: 'grindless:alumina_calcia_residue', count: 4 }]);
  const linings = recipes.filter((r) => outputsOf(r).includes('"grindless:regolith_crucible_lining"')).map((r) => r.t).sort();
  assert.deepEqual(linings, ['gtceu:electric_blast_furnace', 'gtceu:solar_vaporisation'], 'the starter lining and the sinter');
});

test('line 19: regolith -> low -> stripped -> high -> residue -> electrolyser -> aluminium (B3\'s reflector film)', () => {
  assert.deepEqual(row('low_fraction').itemsIn, [{ id: 'grindless:mercury_regolith', count: 16 }]);
  assert.ok(row('low_fraction').itemsOut.some((x) => x.id === 'grindless:stripped_mercury_regolith' && x.count === 12));
  assert.deepEqual(row('low_fraction').fluidsOut, [{ id: 'gtceu:sodium_potassium', amount: 500 }]);
  assert.deepEqual(row('high_fraction').itemsIn, [{ id: 'grindless:stripped_mercury_regolith', count: 12 }]);
  assert.ok(row('high_fraction').itemsOut.some((x) => x.id === 'grindless:alumina_calcia_residue' && x.count === 4));
  const el = row('alumina_calcia');
  assert.equal(el.type, 'electrolyzer');
  assert.deepEqual(el.itemsIn, [{ id: 'grindless:alumina_calcia_residue', count: 1 }]);
  assert.ok(el.itemsOut.some((x) => x.id === 'gtceu:aluminium_dust' && x.count === 2));
  assert.ok(dump(el.recipeId), el.recipeId);
  // every new intermediate has a user
  for (const id of ['grindless:stripped_mercury_regolith', 'grindless:silicon_monoxide_dust', 'grindless:alumina_calcia_residue', 'grindless:iron_tube',
    'grindless:regolith_crucible_lining', 'grindless:excavator_bucket_drum']) {
    assert.ok(recipes.some((r) => JSON.stringify(r.j.inputs || {}).includes(`"${id}"`)), id + ' used');
  }
});

test('line 20: the MgB2 powder-in-tube row, circuit 5, in an iron tube; GTM\'s mixer makes the powder from Mercury\'s magnesium', () => {
  const r = MAT.recipes.find((x) => x.name === 'mgb2_wire');
  assert.ok(r, 'mgb2_wire');
  assert.deepEqual([r.type, r.circuit, r.recipeId], ['powder_in_tube', 5, 'grindless:powder_in_tube/mgb2_wire']);
  assert.deepEqual(r.itemsIn, [{ id: 'gtceu:magnesium_diboride_dust', count: 4 }, { id: 'grindless:iron_tube', count: 1 }]);
  assert.deepEqual(r.itemsOut, [{ id: 'gtceu:magnesium_diboride_single_wire', count: 8 }, { id: 'gtceu:iron_dust', count: 1 }]);
  const d = dump(r.recipeId);
  assert.ok(d, r.recipeId);
  assert.deepEqual(circuitOf(d), [5]);
  const circuits = MAT.recipes.filter((x) => x.type === 'powder_in_tube').map((x) => x.circuit);
  assert.equal(new Set(circuits).size, circuits.length, 'unique PIT circuits');
  assert.ok(row('high_fraction').itemsOut.some((x) => x.id === 'gtceu:magnesium_dust'), 'Mercury magnesium');
  assert.match(read('server_scripts/grindless/uv/materials.js'), /5 mgb2_wire/, 'header line');
});

test('controllers: assembly lines with station research, UHV hull + 3 UHV part families + UHV circuits + 3 line items + tritanium', () => {
  assert.deepEqual(HM.crafting, ['grindless:assembly_line/regolith_excavator', 'grindless:assembly_line/solar_vapour_furnace']);
  const parts = { 'grindless:assembly_line/regolith_excavator': 'gtceu:uhv_electric_motor', 'grindless:assembly_line/solar_vapour_furnace': 'gtceu:uhv_sensor' };
  for (const id of HM.crafting) {
    const r = dump(id);
    assert.ok(r, id);
    assert.equal(r.t, 'gtceu:assembly_line', id);
    const text = JSON.stringify(r.j);
    for (const p of ['gtceu:uhv_machine_hull', parts[id], 'gtceu:circuits/uhv', 'gtceu:tritanium', '"research"']) assert.ok(text.includes(p), `${id} ${p}`);
  }
});

test('names: en_us and es_es for both machines, both types and every item', () => {
  const lang = read('client_scripts/grindless/uhv_mercury_lang.js');
  const [en, es] = lang.split('es_es: {');
  assert.ok(es, 'es_es block');
  for (const part of [en, es]) {
    for (const key of ['regolith_excavator:', 'solar_vapour_furnace:', 'tips:', 'type:'].concat(HM.items.map((id) => id.split(':')[1] + ':'))) {
      assert.ok(part.includes(key), key);
    }
  }
  for (const k of ['block.gtceu.', 'gtceu.regolith_excavation', 'gtceu.solar_vaporisation', 'grindless.machine.', 'item.grindless.', 'tooltip.grindless.']) {
    assert.ok(lang.includes(`'${k}`), k);
  }
  assert.match(lang, /i < 4/);
});
