// UHV's Proxima life (package UHV-B4; docs/eras/uhv.md, machines 12, 26, 27, 28 and 30, lines 13, 14 and 15), no game needed. The
// pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/uhv/proxima_life.js: five recipe types and machines, fifteen items, two liquids;
//   - server_scripts/grindless/uhv/proxima_life.js: data/grindless/tables/proxima_life.json's rows and the five controllers;
//   - the older rows: LuV's biofoundry circuits 11-16 (biofoundry.json) and the algae bioreactor's far-red row (luv/europa.js);
//   - en_us and es_es text for everything new.
// Proof reuse (docs/eras/uhv.md, Common): the dimension allowlist (lib/places.js), lib/patterns.js and the table-driven machines are
// proven; this checks the recipe lookup and the Proxima and Earth allowlists. T1: none.
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
const PL = plain(run.global.grindless.proximaLife);
const recipes = run.docs.recipes.recipes;
const read = (rel) => fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
const T = JSON.parse(read('data/grindless/tables/proxima_life.json'));
const dump = (id) => recipes.find((r) => r.i === id);
const circuitOf = (r) => ((r.j.inputs || {}).item || []).filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const dimsOf = (r) => (r.j.recipeConditions || []).filter((c) => c.type === 'dimension').map((c) => c.dimension);
const ins = (r) => JSON.stringify(r.j.inputs || r.j.ingredients || r.j.key || {});
const outs = (r) => JSON.stringify(r.j.outputs || r.j.result || {});
const has = (json, id) => json.includes(`"${id}"`);
const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));

const PROXIMA = 'gcyr:proxima_centauri_b';
const VA_UHV = 1966080;
const MACHINES = {
  rover: ['gtceu:xenoflora_rover_bay', 'xenoflora_rover', { itemsIn: 3, itemsOut: 3, fluidsIn: 0, fluidsOut: 0 }, 'proxima_b'],
  facility: ['gtceu:sample_receiving_facility', 'sample_receiving', { itemsIn: 3, itemsOut: 2, fluidsIn: 1, fluidsOut: 0 }, 'earth'],
  greenhouse: ['gtceu:xenobotany_greenhouse', 'xenobotany', { itemsIn: 3, itemsOut: 1, fluidsIn: 2, fluidsOut: 2 }, 'proxima_b'],
  plant: ['gtceu:xenobiochem_plant', 'xenobiochemistry', { itemsIn: 4, itemsOut: 2, fluidsIn: 2, fluidsOut: 2 }, 'proxima_b'],
  vat: ['gtceu:radiotrophic_vat', 'radiotrophic', { itemsIn: 3, itemsOut: 1, fluidsIn: 1, fluidsOut: 1 }, 'proxima_b']
};
const OURS = Object.values(MACHINES).map((m) => m[1]);
const GTM = ['chemical_reactor', 'assembler', 'centrifuge'];
const rows = () => Object.entries(T.types).flatMap(([type, t]) => t.recipes.map((r) => ({ ...r, type, dataKey: t.dataKey })));

test('the stand-in runs the Proxima life scripts without errors, nothing clashing or skipped', () => {
  const errs = run.errors.filter((e) => /proxima_life/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(PL.clashes, []);
  assert.deepEqual(PL.skipped, []);
  assert.equal(PL.recipes.length, rows().length);
});

test('registration: five types and machines, fifteen items, two liquids; F1\'s ids are not registered again', () => {
  for (const [key, [machine, type]] of Object.entries(MACHINES)) {
    assert.deepEqual(run.registry.machines.get(machine).recipeTypes, [`gtceu:${type}`], key);
    assert.ok(run.registry.recipeTypes.has(`gtceu:${type}`), type);
  }
  assert.equal(Object.keys(PL.items).length, 15);
  for (const n of Object.keys(PL.items)) assert.ok(run.registry.items.has(`grindless:${n}`), n);
  for (const n of ['far_red_pigment', 'clarified_xeno_lysate']) assert.ok(run.registry.materials.has(`gtceu:${n}`), n);
  const src = read('startup_scripts/grindless/uhv/proxima_life.js');
  const f1 = ['proxima_flora_sample', 'proxima_regolith_survey', 'characterised_xeno_strain', 'xeno_genome_data', 'proxima_ice_core',
    'chitosan_scaffold', 'xeno_radioprotectant', 'infrared_pigment', 'bsl4_casing', 'hangar_casing', 'ultrapure_water'];
  for (const n of f1) {
    assert.doesNotMatch(src, new RegExp(`^\\s+${n}\\s*:\\s*\\{`, 'm'), n + ' belongs to F1');
    assert.ok(run.registry.items.has(`grindless:${n}`) || run.registry.materials.has(`gtceu:${n}`) || run.registry.blocks?.has?.(`grindless:${n}`), n);
  }
});

test('patterns: each machine is its declared size, one controller, every symbol defined, its casing in the part layer', () => {
  for (const [key, [machine]] of Object.entries(MACHINES)) {
    const m = PL.machines[key];
    const s = run.docs.structures.structures[machine];
    assert.ok(s, machine);
    assert.equal(s.slices.length, m.depth, key);
    assert.ok(s.slices.every((sl) => sl.length === m.height && sl.every((r) => r.length === m.width)), key + ' uniform slices');
    assert.equal(s.slices.flat().join('').split('').filter((c) => c === 'S').length, 1, key + ' one controller');
    for (const sl of s.slices) for (const r of sl) for (const c of r) assert.ok(s.symbols[c], `${key}: symbol ${c}`);
    assert.ok(s.symbols.X.options.some((o) => o.kind === 'blocks' && o.blocks.includes(m.casing)), key + ' casing');
    const abilities = s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => o.ability);
    assert.ok(abilities.includes('energy_input') && abilities.includes('input_bus'), key);
  }
});

test('the recipes fit the machines\' slots (startup maxIO; the circuit takes an item slot)', () => {
  const startup = read('startup_scripts/grindless/uhv/proxima_life.js');
  for (const [key, [, type, io]] of Object.entries(MACHINES)) {
    assert.ok(startup.includes(`maxIO: { itemsIn: ${io.itemsIn}, itemsOut: ${io.itemsOut}, fluidsIn: ${io.fluidsIn}, fluidsOut: ${io.fluidsOut} }`), key);
    for (const r of T.types[type].recipes) {
      assert.ok(r.itemsIn.length + r.kept.length + 1 <= io.itemsIn, `${r.name} items in`);
      assert.ok(r.fluidsIn.length <= io.fluidsIn, `${r.name} fluids in`);
      assert.ok(r.itemsOut.length <= io.itemsOut, `${r.name} items out`);
      assert.ok(r.fluidsOut.length <= io.fluidsOut, `${r.name} fluids out`);
    }
  }
});

test('recipe lookup: unique names and circuits, no subsets inside a type, every row in the dump with its circuit and data key', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    if (OURS.includes(type)) assert.ok(t.recipes.every((r) => r.circuit >= 1 && r.circuit <= 32), type + ' needs circuits');
    else assert.ok(GTM.includes(type) && t.recipes.every((r) => r.circuit === 0), type);
    const keys = t.recipes.map((r) => new Set(inputs(r).concat([`circuit:${r.circuit}`])));
    const sub = (a, b) => [...a].every((k) => b.has(k));
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) assert.ok(!sub(keys[i], keys[j]) && !sub(keys[j], keys[i]), `${type}: ${t.recipes[i].name} / ${t.recipes[j].name}`);
    }
  }
  for (const r of rows()) {
    const id = `grindless:${r.type}/${r.name}`;
    const d = dump(id);
    assert.ok(d, id);
    assert.equal(PL.recipes.find((x) => x.type === r.type && x.name === r.name).recipeId, id);
    assert.deepEqual(circuitOf(d), r.circuit > 0 ? [r.circuit] : [], id);
    assert.ok(Number.isInteger(r.eut) && r.eut > 0 && r.eut <= VA_UHV && Number.isInteger(r.duration) && r.duration > 0, id);
    if (r.dataKey) assert.equal(PL.recipes.find((x) => x.recipeId === id).dataKey, r.dataKey, id + ' data key');
  }
  assert.ok(read('server_scripts/grindless/uhv/proxima_life.js').includes('recipe.addDataString(rec.dataKey, rec.name)'));
  // GTM's own rows of these types are never shadowed: ours are keyed by our own items (the casings by their own outputs, without a circuit)
  const CASINGS = ['bsl4_casing', 'hangar_casing'];
  for (const r of rows().filter((x) => GTM.includes(x.type) && !CASINGS.includes(x.name))) assert.ok(inputs(r).some((i) => i.startsWith('grindless:')), r.name);
});

test('F1\'s casings: one assembler recipe each, 2 a craft, the only maker, so all five multiblocks can be built', () => {
  for (const n of ['bsl4_casing', 'hangar_casing']) {
    const d = dump(`grindless:assembler/${n}`);
    assert.ok(d, n);
    assert.deepEqual(circuitOf(d), [], n);
    assert.equal(T.types.assembler.recipes.find((r) => r.name === n).itemsOut[0].count, 2, n);
    assert.deepEqual(recipes.filter((x) => has(outs(x), `grindless:${n}`)).map((x) => x.i), [d.i], n);
  }
  for (const m of Object.values(PL.machines)) assert.ok(['grindless:bsl4_casing', 'grindless:hangar_casing'].includes(m.casing), m.name);
});

test('allowlists: the rover bay, greenhouse, plant and vat run only on Proxima b; the receiving facility only on Earth; GTM rows anywhere', () => {
  for (const r of rows()) {
    const d = dump(`grindless:${r.type}/${r.name}`);
    const m = Object.values(MACHINES).find((x) => x[1] === r.type);
    if (!m) {
      assert.equal(r.site, undefined, r.name);
      assert.deepEqual(dimsOf(d), [], r.name);
      continue;
    }
    assert.equal(r.site, m[3], r.name);
    assert.deepEqual(dimsOf(d), [m[3] === 'earth' ? 'minecraft:overworld' : PROXIMA], `${r.type}/${r.name}`);
  }
});

test('flora samples: only the rover bay makes them and only the receiving facility uses them', () => {
  const SAMPLE = 'grindless:proxima_flora_sample';
  const made = recipes.filter((r) => has(outs(r), SAMPLE)).map((r) => r.i);
  assert.deepEqual(made, ['grindless:xenoflora_rover/survey']);
  const used = recipes.filter((r) => has(ins(r), SAMPLE)).map((r) => r.i).sort();
  assert.deepEqual(used, ['grindless:sample_receiving/isolate', 'grindless:sample_receiving/receive']);
  // the rover wears out 1 run in 8 and its americium source comes back as often; the approach data is kept
  const survey = dump('grindless:xenoflora_rover/survey');
  assert.ok(/"chance":1250/.test(JSON.stringify(survey.j.inputs.item)), 'chanced rover');
  assert.ok(/"chance":0[,}]/.test(JSON.stringify(survey.j.inputs.item)) && has(ins(survey), 'grindless:proxima_approach_data'), 'kept data');
  assert.ok(/"chance":1250/.test(JSON.stringify(survey.j.outputs.item)) && has(outs(survey), 'grindless:americium_micro_source'));
});

test('every intermediate has a destination; the residues go to standing machines', () => {
  const consumed = (id) => recipes.some((r) => has(ins(r), id));
  for (const id of ['grindless:proxima_rover', 'grindless:xeno_biomass', 'grindless:xeno_mushroom', 'grindless:melanised_biomass',
    'grindless:sterilised_flora_extract', 'grindless:sterilised_ice_organics', 'grindless:melanin_extract',
    'grindless:melanin_chitosan_composite', 'grindless:characterised_xeno_strain', 'grindless:chitosan_scaffold',
    'gtceu:far_red_pigment', 'gtceu:clarified_xeno_lysate', 'gtceu:biomass', 'gtceu:salt_water']) assert.ok(consumed(id), id);
  assert.ok(outs(dump('grindless:assembler/flare_shield_panel')).includes('grindless:flare_shield_panel'));
  // the rover is assembled from UV's heat source, A3's betavoltaics and UV's germanium crystal
  const rover = ins(dump('grindless:assembler/proxima_rover'));
  for (const id of ['grindless:americium_micro_source', 'grindless:betavoltaic_cell', 'grindless:hpge_crystal']) assert.ok(has(rover, id), id);
});

test('controllers: UHV hull and circuits, a shaped pattern no other crafting recipe uses (mirrors too)', () => {
  assert.equal(PL.controllerRecipes.length, 5);
  const shaped = recipes.filter((r) => r.t === 'minecraft:crafting_shaped');
  const norm = (j, mirror) => {
    const pat = j.pattern.map((row) => (mirror ? row.split('').reverse().join('') : row));
    const width = Math.max(...pat.map((x) => x.length));
    const grid = pat.map((row) => row.padEnd(width, ' ').split('').map((c) => (c === ' ' ? '' : JSON.stringify(j.key[c]))));
    return JSON.stringify(grid);
  };
  for (const [key, [machine]] of Object.entries(MACHINES)) {
    const id = `grindless:crafting/${PL.machines[key].name}`;
    const d = dump(id);
    assert.ok(d && PL.controllerRecipes.includes(id), id);
    assert.ok(outs(d).includes(machine), id);
    assert.ok(ins(d).includes('gtceu:uhv_machine_hull') && ins(d).includes('gtceu:circuits/uhv'), id);
    const mine = norm(d.j, false);
    for (const o of shaped) {
      if (o.i === id) continue;
      assert.ok(norm(o.j, false) !== mine && norm(o.j, true) !== mine, `${id} matches ${o.i}`);
    }
  }
});

test('older rows: the biofoundry\'s xeno steps 11-16 and the algae bioreactor\'s far-red row, Proxima b only', () => {
  const BFT = JSON.parse(read('data/grindless/tables/biofoundry.json'));
  const xeno = BFT.recipes.filter((r) => r.circuit > 10);
  const NAMES = ['far_red_gene_cassette', 'engineered_far_red_algae', 'cladosporium_culture', 'chromobacterium_culture', 'sphingomonas_culture',
    'sporosarcina_culture'];
  assert.deepEqual(xeno.map((r) => [r.circuit, r.name]), NAMES.map((n, i) => [11 + i, n]));
  assert.deepEqual(BFT.steps.filter((s) => s.circuit > 10).map((s) => [s.circuit, s.name]), NAMES.map((n, i) => [11 + i, n]));
  const bf = plain(run.global.grindless.biofoundry);
  assert.deepEqual(bf.clashes, []);
  for (const r of xeno) {
    const d = dump(`grindless:sterile_culture/${r.name}`);
    assert.ok(d, r.name);
    assert.deepEqual(circuitOf(d), [r.circuit], r.name);
    assert.ok(has(outs(d), `grindless:${r.name}`), r.name);
    assert.ok(r.eut <= VA_UHV && r.itemsIn.length + 1 <= 5 && r.fluidsIn.length <= 2, r.name);
    for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][`gtceu.recipe.grindless_biofoundry.${r.name}`], `${lang} ${r.name}`);
    // the biofoundry is each culture's only maker
    assert.deepEqual(recipes.filter((x) => has(outs(x), `grindless:${r.name}`)).map((x) => x.i), [d.i], r.name);
  }
  assert.ok(has(ins(dump('grindless:sterile_culture/far_red_gene_cassette')), 'grindless:xeno_genome_data'));
  assert.ok(has(ins(dump('grindless:sterile_culture/engineered_far_red_algae')), 'grindless:algae_culture'));
  assert.ok(has(ins(dump('grindless:radiotrophic/melanised_biomass')), 'grindless:cladosporium_culture'));

  const farRed = dump('grindless:bioreactor/uhv/far_red_algae');
  assert.ok(farRed && run.global.grindless.europa.recipes.includes(farRed.i));
  assert.deepEqual(dimsOf(farRed), [PROXIMA]);
  assert.deepEqual(circuitOf(farRed), [3]);
  const algae = farRed.j.inputs.item.find((i) => JSON.stringify(i).includes('grindless:engineered_far_red_algae'));
  assert.equal(algae.chance, 0, 'the algae are kept');
  assert.ok(has(outs(farRed), 'gtceu:biomass') && has(outs(farRed), 'gtceu:oxygen'));
  assert.deepEqual(recipes.filter((x) => has(ins(x), 'grindless:engineered_far_red_algae')).map((x) => x.i), [farRed.i]);
});

test('no UEV input, and every lang key the package needs is written in en_us and es_es', () => {
  for (const r of rows()) for (const id of inputs(r).concat(outputs(r))) assert.ok(!/(^|[:_])uev(_|$)/.test(id.split(':')[1] || ''), `${r.name}: ${id}`);
  const keys = [];
  for (const [key, [, type]] of Object.entries(MACHINES)) {
    const n = PL.machines[key].name;
    keys.push(`block.gtceu.${n}`, `gtceu.${type}`, ...[0, 1, 2].map((i) => `grindless.machine.${n}.tooltip.${i}`));
  }
  for (const r of rows()) if (r.dataKey) keys.push(`gtceu.recipe.${r.dataKey}.${r.name}`);
  for (const n of Object.keys(PL.items)) keys.push(`item.grindless.${n}`, `tooltip.grindless.${n}.0`, `tooltip.grindless.${n}.1`);
  for (const n of Object.keys(PL.materials)) keys.push(`material.gtceu.${n}`);
  for (const lang of ['en_us', 'es_es']) for (const k of keys) assert.ok(run.lang[lang] && run.lang[lang][k], `${lang}: ${k}`);
  for (const k of keys) assert.notEqual(run.lang.en_us[k], undefined);
});
