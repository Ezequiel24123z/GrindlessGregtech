// UV's edge (package UV-B5), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/uv/edge.js: two recipe types, two machines with valid patterns, the precursor probe, F1's ids untouched;
//   - server_scripts/grindless/uv/edge.js: the bay's heliopause data, the interferometer's Sgr A* image, the probe, the crafting;
//   - GTM's UHV energy hatch re-added under its own id with every input (a second run with a stand-in original);
//   - the heliopause data and the image come only from Pluto orbit; en_us and es_es text for everything new.
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
const E = plain(run.global.grindless.uvEdge);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const row = (name) => E.recipes.concat(E.support).find((r) => r.name === name);
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const outputs = (r) => JSON.stringify(r.j.outputs || r.j.result || {});
const inputs = (r) => JSON.stringify(r.j.inputs || r.j.ingredients || {});
const read = (rel) => fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
const code = (rel) => read(rel).replace(/^\s*\/\/.*$/gm, '');
const MACHINES = [['gtceu:precursor_probe_bay', 'gtceu:precursor_probe', 11, 7, 7], ['gtceu:event_horizon_interferometer', 'gtceu:event_horizon_imaging', 9, 5, 9]];
const ORBIT = 'grindless:pluto_orbit';
const HELIOPAUSE = 'grindless:heliopause_data';
const IMAGE = 'grindless:sgr_a_star_image';
const HATCH = 'gtceu:assembly_line/energy_hatch_uhv';

test('the stand-in runs the edge scripts without errors, nothing clashing or skipped', () => {
  // without GTM's originals the hatch reports "no original recipe" (checked below)
  const errs = run.errors.filter((e) => /uv[\\/]edge|uv_edge_lang/.test(String(e.file)) && !/UHV energy hatch/.test(String(e.message)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(E.clashes, []);
  assert.deepEqual(E.skipped, []);
});

test('registration: two recipe types, two machines, the probe; the heliopause data and the image stay F1\'s', () => {
  for (const [machine, type] of MACHINES) {
    assert.ok(run.registry.recipeTypes.has(type), type);
    assert.deepEqual(run.registry.machines.get(machine).recipeTypes, [type]);
  }
  assert.ok(run.registry.items.has('grindless:precursor_probe'));
  const ids = run.global.grindless.uvFoundation.ids;
  assert.equal(ids.heliopauseData, HELIOPAUSE);
  assert.equal(ids.sgrAStarImage, IMAGE);
  assert.ok(!/heliopause_data|sgr_a_star_image/.test(code('startup_scripts/grindless/uv/edge.js')), 'no F1 id registered again');
  assert.equal(E.orbit, ORBIT);
});

test('patterns: the bay 7 x 7 x 11 and the interferometer 9 x 5 x 9, one controller in the front slice, station truss, GTM part limits', () => {
  for (const [id, , depth, height, width] of MACHINES) {
    const s = run.docs.structures.structures[id];
    assert.ok(s, id + ' described');
    assert.equal(s.slices.length, depth, id + ' depth');
    assert.ok(s.slices.every((sl) => sl.length === height && sl.every((r) => r.length === width)), `${id} uniform slices`);
    const all = s.slices.flat().join('');
    assert.equal(all.split('').filter((c) => c === 'S').length, 1, id + ' one controller');
    assert.ok(s.slices[s.slices.length - 1].join('').includes('S'), id + ' controller in the front slice');
    for (const c of all) if (c !== ' ') assert.ok(s.symbols[c], `${id} symbol ${c}`);
    const lim = Object.fromEntries(s.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
    assert.deepEqual(lim.energy_input, { min: 1, max: 2 }, id);
    assert.ok(lim.input_bus && lim.output_bus, id + ' buses');
    assert.ok(Object.values(s.symbols).flatMap((v) => v.blocks || []).includes('grindless:station_truss_casing'), id + ' casing');
  }
  const blocks = (id) => Object.values(run.docs.structures.structures[id].symbols).flatMap((v) => v.blocks || []);
  assert.ok(blocks('gtceu:precursor_probe_bay').includes('gtceu:computer_casing'), 'the deep-space relay');
  assert.ok(blocks('gtceu:event_horizon_interferometer').includes('gtceu:aluminium_block'), 'the dish');
  assert.ok(blocks('gtceu:event_horizon_interferometer').includes('gtceu:advanced_computer_casing'), 'the maser clock');
});

test('the bay: probe + 4 ICAN pellets, circuit 1, Pluto orbit -> heliopause data, 2 A UV x 6,000 t', () => {
  const r = row('heliopause_data');
  assert.equal(r.type, 'precursor_probe');
  assert.deepEqual(r.itemsIn, [{ id: 'grindless:precursor_probe', count: 1 }, { id: 'grindless:ican_pellet', count: 4 }]);
  assert.deepEqual(r.itemsOut, [{ id: HELIOPAUSE, count: 1 }]);
  assert.deepEqual([r.eut, r.amps, r.duration], [491520, 2, 6000]);
  const rec = byId(r.recipeId);
  assert.ok(rec, r.recipeId);
  assert.deepEqual(circuitOf(rec), [1]);
  assert.ok(JSON.stringify(rec.j.recipeConditions || []).includes(ORBIT), 'dimension condition');
});

test('the interferometer: catalogue kept + HPGe crystal + 4 data orbs, circuit 1, Pluto orbit -> the Sgr A* image, VA[UV] x 8,000 t', () => {
  const r = row('sgr_a_star_image');
  assert.equal(r.type, 'event_horizon_imaging');
  assert.deepEqual(r.itemsIn, [{ id: 'grindless:hpge_crystal', count: 1 }, { id: 'gtceu:data_orb', count: 4 }]);
  assert.deepEqual(r.notConsumed, ['grindless:multimessenger_catalogue']);
  assert.deepEqual(r.itemsOut, [{ id: IMAGE, count: 1 }]);
  assert.deepEqual([r.eut, r.amps, r.duration], [491520, 1, 8000]);
  const rec = byId(r.recipeId);
  assert.ok(rec, r.recipeId);
  assert.deepEqual(circuitOf(rec), [1]);
  assert.ok(JSON.stringify(rec.j.recipeConditions || []).includes(ORBIT), 'dimension condition');
});

test('the heliopause data and the Sgr A* image come only from Pluto orbit; the sail launcher keeps the data', () => {
  assert.deepEqual(recipes.filter((r) => outputs(r).includes(`"${HELIOPAUSE}"`)).map((r) => r.i), [row('heliopause_data').recipeId]);
  assert.deepEqual(recipes.filter((r) => outputs(r).includes(`"${IMAGE}"`)).map((r) => r.i), [row('sgr_a_star_image').recipeId]);
  assert.ok(recipes.some((r) => r.i !== row('heliopause_data').recipeId && inputs(r).includes(`"${HELIOPAUSE}"`)), 'a consumer of the data');
});

test('support: the probe (A2\'s RTGs, A11\'s pod, the HPGe spectrometer, the printed frame) is the ICAN pellets\' companion; controllers craftable', () => {
  const p = row('precursor_probe');
  assert.equal(p.type, 'assembler');
  assert.deepEqual(p.itemsIn, [{ id: 'grindless:probe_rtg', count: 2 }, { id: 'grindless:thruster_pod', count: 1 },
    { id: 'grindless:hpge_crystal', count: 1 }, { id: 'gtceu:uv_sensor', count: 1 }, { id: 'grindless:printed_probe_frame', count: 1 }]);
  assert.ok(byId(p.recipeId), p.recipeId);
  const makers = recipes.filter((r) => outputs(r).includes('"grindless:precursor_probe"'));
  assert.deepEqual(makers.map((r) => r.i), [p.recipeId]);
  assert.ok(recipes.some((r) => r.t === 'gtceu:precursor_probe' && inputs(r).includes('"grindless:ican_pellet"')), 'ICAN pellet consumer');
  const ids = recipes.map((r) => r.i);
  for (const id of Object.values(E.crafting)) assert.ok(ids.includes(id), id);
});

test('the UHV energy hatch: without GTM\'s original the stand-in reports it and adds nothing; the source re-adds it with the image\'s research', () => {
  assert.match(String(E.hatchError), /no original recipe/);
  assert.ok(!byId(HATCH));
  const s = code('server_scripts/grindless/uv/edge.js');
  assert.ok(s.includes(`'${HATCH}'`));
  assert.match(s, /stationResearch\(function \(r\) \{ return r\.researchStack\(Item\.of\(IMAGE\)\)/);
  assert.ok(!/researchWithoutRecipe|scannerResearch/.test(s), 'station research only');
});

test('the UHV energy hatch with a stand-in original: same id, every input, output, EU/t and duration; old research removed', () => {
  const sized = (id, count) => ({ content: { type: 'gtceu:sized', count, ingredient: { item: id } }, chance: 10000, maxChance: 10000, tierChanceBoost: 0 });
  const tag = (t, count) => ({ content: { type: 'gtceu:sized', count, ingredient: { tag: t } }, chance: 10000, maxChance: 10000, tierChanceBoost: 0 });
  const fluid = (id, amount) => ({ content: { amount, value: [{ fluid: id }] }, chance: 10000, maxChance: 10000, tierChanceBoost: 0 });
  const original = {
    i: HATCH, t: 'gtceu:assembly_line',
    j: {
      type: 'gtceu:assembly_line', duration: 1000,
      inputs: { item: [sized('gtceu:uhv_machine_hull', 1), tag('forge:double_wires/europium', 2), tag('gtceu:circuits/uhv', 2)],
        fluid: [fluid('gtceu:soldering_alloy', 5760), fluid('gtceu:polybenzimidazole', 2016)] },
      outputs: { item: [sized('gtceu:uhv_energy_input_hatch', 1)] },
      tickInputs: { eu: [{ content: 1966080, chance: 10000, maxChance: 10000, tierChanceBoost: 0 }] },
      recipeConditions: [{ type: 'research', research: [{ researchId: '1x_gtceu_uv_energy_input_hatch', dataItem: { id: 'gtceu:data_module', Count: 1 } }] }],
    },
  };
  const r2 = runPackScripts(pack, { originals: [original] });
  const errs = r2.errors.filter((e) => /uv[\\/]edge/.test(String(e.file)));
  assert.deepEqual(errs, []);
  const E2 = plain(r2.global.grindless.uvEdge);
  assert.equal(E2.hatchError, null);
  assert.deepEqual(E2.hatch.items, ['1x gtceu:uhv_machine_hull', '2x #forge:double_wires/europium', '2x #gtceu:circuits/uhv']);
  assert.deepEqual(E2.hatch.fluids, ['gtceu:soldering_alloy 5760', 'gtceu:polybenzimidazole 2016']);
  assert.equal(E2.hatch.output, '1x gtceu:uhv_energy_input_hatch');
  assert.deepEqual([E2.hatch.eut, E2.hatch.duration, E2.hatch.researchItem, E2.hatch.cwut], [1966080, 1000, IMAGE, 128]);
  assert.equal(E2.oldResearch.research, '1x_gtceu_uv_energy_input_hatch');
  assert.deepEqual(E2.oldResearch.sharedWith, []);
  assert.ok(r2.docs.recipes.recipes.some((r) => r.i === HATCH), 're-added under its own id');
});

test('names: en_us and es_es for the machines, the types and the probe', () => {
  const lang = read('client_scripts/grindless/uv_edge_lang.js');
  const [en, es] = lang.split('es_es: {');
  assert.ok(es, 'es_es block');
  for (const part of [en, es]) {
    for (const key of ['bay:', 'interferometer:', 'bayType:', 'interferometerType:', 'bayTips:', 'interferometerTips:', 'precursor_probe:']) {
      assert.ok(part.includes(key), key);
    }
  }
  for (const k of ['block.gtceu.precursor_probe_bay', 'block.gtceu.event_horizon_interferometer', 'gtceu.precursor_probe', 'gtceu.event_horizon_imaging']) {
    assert.ok(lang.includes(`'${k}`), k);
  }
  assert.match(lang, /i < 4/);
});

test('the probe has an icon, and the reused controller faces exist', () => {
  const tex = path.join(pack, 'kubejs', 'assets', 'grindless', 'textures');
  assert.ok(fs.existsSync(path.join(tex, 'item', 'precursor_probe.png')));
  for (const m of E.machines) assert.ok(fs.existsSync(path.join(tex, 'block', 'multiblock', m.overlay, 'overlay_front.png')), m.overlay);
});
