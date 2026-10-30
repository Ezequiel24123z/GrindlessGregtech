// UV's photonics (package UV-A6), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/uv/photonics.js: two recipe types, two machines (5 x 15 x 5 tower, 7 x 7 x 7 reactor with its gas
//     cabinet), nine items, four fluids;
//   - server_scripts/grindless/uv/photonics.js: the tower's four steps, the reactor's six, the side steps, the crafting;
//   - the extraction cascade's ytterbium strip (ev/extraction_cascade.js), the only source of ytterbium oxide;
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
const P = plain(run.global.grindless.photonics);
const EC = plain(run.global.grindless.extractionCascade || {});
const recipes = run.docs.recipes.recipes;
const row = (name) => P.recipes.find((r) => r.name === name);
const side = (name) => P.side.find((r) => r.name === name);
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const read = (rel) => fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
const outputsOf = (r) => JSON.stringify(r.j.outputs || r.j.result || {});
const NEW_ITEMS = ['yb_doped_preform', 'fibre_bragg_grating', 'gallium_arsenide_boule', 'gallium_arsenide_wafer', 'sapphire_boule',
  'sapphire_wafer', 'ingaas_epi_wafer', 'ingaas_diode_bar', 'nbn_film_wafer'];
const FLUIDS = ['germanium_tetrachloride', 'trimethylgallium', 'trimethylindium', 'acrylate_coating'];
const VA_UV = 491520;

test('the stand-in runs the photonics and cascade scripts without errors, nothing clashing or skipped', () => {
  const errs = run.errors.filter((e) => /photonics|extraction_cascade/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(P.clashes, []);
  assert.deepEqual(P.skipped, []);
});

test('registration: two recipe types, two machines, nine items, four fluids and ytterbium oxide', () => {
  assert.deepEqual(run.registry.machines.get('gtceu:fibre_draw_tower').recipeTypes, ['gtceu:fibre_draw']);
  assert.deepEqual(run.registry.machines.get('gtceu:mocvd_reactor').recipeTypes, ['gtceu:mocvd']);
  for (const n of NEW_ITEMS) assert.ok(run.registry.items.has('grindless:' + n), n);
  for (const n of FLUIDS) assert.ok(run.registry.fluids.has('gtceu:' + n), n);
  assert.ok(run.registry.materials.has('gtceu:ytterbium_oxide'));
  // F1's ids are reused, not registered again
  const src = read('startup_scripts/grindless/uv/photonics.js');
  for (const n of ['fibre_laser_module', 'ytterbium_fibre', 'ingaas_pump_module', 'laser_module_block', 'arsine']) {
    assert.doesNotMatch(src, new RegExp(`^\\s+${n}\\s*:\\s*\\{`, 'm'), n + ' belongs to F1');
  }
});

test('patterns: tower 5 x 15 x 5, reactor 7 x 7 x 7 with an inert gas cabinet, one controller, GTM part limits', () => {
  for (const [id, depth, height, width] of [['gtceu:fibre_draw_tower', 5, 15, 5], ['gtceu:mocvd_reactor', 7, 7, 7]]) {
    const s = run.docs.structures.structures[id];
    assert.ok(s, id + ' described');
    assert.equal(s.slices.length, depth, id);
    assert.ok(s.slices.every((sl) => sl.length === height && sl.every((r) => r.length === width)), id + ' uniform slices');
    assert.equal(s.slices.flat().join('').split('').filter((c) => c === 'S').length, 1, id + ' one controller');
    for (const sl of s.slices) for (const r of sl) for (const c of r) assert.ok(s.symbols[c], `${id} symbol ${c}`);
    const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
    for (const a of ['energy_input', 'input_bus', 'input_hatch', 'output_bus', 'output_hatch']) assert.deepEqual(lim[a], { min: 1, max: 2 }, `${id} ${a}`);
    assert.ok(s.symbols.X.options.some((o) => o.kind === 'blocks' && o.blocks.includes('gtceu:clean_machine_casing')), id + ' casing');
  }
  const reactor = run.docs.structures.structures['gtceu:mocvd_reactor'];
  const cabinet = Object.entries(reactor.symbols).filter(([, v]) => (v.blocks || []).includes('gtceu:inert_machine_casing'));
  assert.equal(cabinet.length, 1, 'gas cabinet symbol');
  assert.ok(reactor.slices.flat().join('').includes(cabinet[0][0]), 'gas cabinet used in the pattern');
});

test('each machine: unique circuits, whole numbers, every row in the dump with its circuit', () => {
  for (const type of ['fibre_draw', 'mocvd']) {
    const rows = P.recipes.filter((r) => r.type === type);
    const circuits = rows.map((r) => r.circuit);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of rows) {
      assert.ok(Number.isInteger(r.duration) && r.duration > 0 && Number.isInteger(r.eut) && r.eut > 0 && r.eut <= VA_UV, r.name);
      const rec = recipes.find((x) => x.i === `grindless:${type}/${r.recipeId.split(':')[1]}`);
      assert.ok(rec, r.recipeId);
      assert.deepEqual(circuitOf(rec), [r.circuit], r.name);
    }
  }
  assert.deepEqual(P.recipes.filter((r) => r.type === 'fibre_draw').map((r) => r.name), ['preform', 'draw', 'laser_module', 'refurbish']);
  assert.deepEqual(P.recipes.filter((r) => r.type === 'mocvd').map((r) => r.name),
    ['organometallics', 'ingaas_epi', 'diode_bars', 'nbn_film', 'pump_module', 'arsine_scrub']);
});

test('ytterbium oxide comes only from the cascade strip, and the preform needs it', () => {
  const makers = recipes.filter((r) => outputsOf(r).includes('gtceu:ytterbium_oxide_dust'));
  assert.deepEqual(makers.map((r) => r.i), ['grindless:solvent_extraction/ev/ytterbium_strip']);
  assert.deepEqual(circuitOf(makers[0]), [6]);
  const strip = (EC.recipes || []).find((r) => r.name === 'ytterbium_strip');
  if (strip) assert.equal(strip.mode, 'uv');
  assert.ok(row('preform').itemsIn.some((i) => i.id === 'gtceu:ytterbium_oxide_dust' && i.count === 1));
  assert.ok(row('preform').fluidsIn.some((f) => f.id === 'gtceu:germanium_tetrachloride'));
});

test('InGaAs needs indium and the gas cabinet; the pump module chain ends in F1\'s module', () => {
  assert.ok(row('organometallics').itemsIn.some((i) => i.id === 'gtceu:indium_dust'));
  assert.deepEqual(row('organometallics').fluidsOut.map((f) => f.id), ['gtceu:trimethylgallium', 'gtceu:trimethylindium']);
  const epi = row('ingaas_epi');
  assert.equal(epi.type, 'mocvd');
  assert.deepEqual(epi.fluidsIn.map((f) => f.id), ['gtceu:trimethylgallium', 'gtceu:trimethylindium', 'gtceu:arsine']);
  assert.deepEqual(row('pump_module').itemsOut, [{ id: 'grindless:ingaas_pump_module', count: 1 }]);
  assert.deepEqual(row('laser_module').itemsOut, [{ id: 'grindless:fibre_laser_module', count: 1 }]);
  assert.ok(row('laser_module').itemsIn.some((i) => i.id === 'grindless:ingaas_pump_module'));
  assert.deepEqual(row('draw').itemsOut, [{ id: 'grindless:ytterbium_fibre', count: 16 }]);
});

test('byproduct destinations: arsine scrubbed to arsenic, chlorine and methane out as fluids, salt and MgCl2 as dusts', () => {
  const scrub = row('arsine_scrub');
  assert.deepEqual(scrub.fluidsIn, [{ id: 'gtceu:arsine', amount: 1000 }]);
  assert.deepEqual(scrub.itemsOut, [{ id: 'gtceu:arsenic_dust', count: 1 }]);
  assert.deepEqual(scrub.fluidsOut, [{ id: 'gtceu:hydrogen', amount: 3000 }]);
  // every arsine produced has a consumer: the epi row and the scrubber
  const arsineOut = P.recipes.concat(P.side).filter((r) => r.fluidsOut.some((f) => f.id === 'gtceu:arsine')).map((r) => r.name);
  assert.deepEqual(arsineOut.sort(), ['arsine', 'ingaas_epi']);
  assert.deepEqual(row('preform').fluidsOut, [{ id: 'gtceu:chlorine', amount: 4400 }]);
  assert.deepEqual(side('arsine').itemsOut, [{ id: 'gtceu:magnesium_chloride_dust', count: 9 }]);
  const src = read('server_scripts/grindless/uv/photonics.js');
  for (const word of ['chlorine', 'methane', 'salt', 'magnesium chloride', 'glass']) assert.match(src, new RegExp(word, 'i'), word);
});

test('refurbish takes A3\'s spent laser module; the module block is an assembler recipe', () => {
  assert.deepEqual(row('refurbish').itemsIn, [{ id: 'grindless:spent_laser_module', count: 1 }, { id: 'grindless:ytterbium_fibre', count: 1 }]);
  const blk = recipes.find((x) => x.i === P.crafting.moduleBlock);
  assert.ok(blk, P.crafting.moduleBlock);
  for (const id of [P.crafting.tower, P.crafting.reactor]) assert.ok(recipes.find((x) => x.i === id), id);
});

test('side steps: arsine, acrylate, GaAs and sapphire boules and wafers, the grating', () => {
  assert.deepEqual(P.side.map((r) => r.name), ['arsine', 'acrylate_coating', 'gallium_arsenide_boule', 'gallium_arsenide_wafer',
    'sapphire_boule', 'sapphire_wafer', 'fibre_bragg_grating']);
  assert.equal(side('gallium_arsenide_boule').circuit, 6);
  assert.equal(side('acrylate_coating').circuit, 7);
  assert.deepEqual(side('sapphire_boule').itemsIn, [{ id: 'gtceu:sapphire_block', count: 1 }]);
  assert.equal(side('fibre_bragg_grating').notConsumable, 'gtceu:purple_glass_lens');
  for (const r of P.side.filter((x) => x.type === 'electric_blast_furnace')) assert.ok(r.temp > 0, r.name);
});

test('names: en_us and es_es for both machines, both types, the items and the fluids', () => {
  const lang = read('client_scripts/grindless/uv_photonics_lang.js');
  const [en, es] = lang.split('es_es: {');
  assert.ok(es, 'es_es block');
  for (const part of [en, es]) {
    for (const key of ['tower:', 'reactor:', 'towerType:', 'reactorType:', 'towerTips:', 'reactorTips:']) assert.ok(part.includes(key), key);
    for (const n of NEW_ITEMS.concat(FLUIDS, ['ytterbium_oxide'])) assert.ok(part.includes(`${n}:`), n);
  }
  for (const k of ['block.gtceu.fibre_draw_tower', 'block.gtceu.mocvd_reactor', 'gtceu.fibre_draw', 'gtceu.mocvd', 'material.gtceu.']) assert.ok(lang.includes(`'${k}`), k);
  assert.match(lang, /i < 1/);
});
