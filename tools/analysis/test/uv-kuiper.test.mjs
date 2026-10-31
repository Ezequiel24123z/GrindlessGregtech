// UV's Kuiper belt (package UV-B4), no game needed. The pack's scripts run in the stand-in of lib/kubejs_static.mjs:
//   - startup_scripts/grindless/uv/kuiper.js: two recipe types, two machines with valid patterns, two items, F1's ids untouched;
//   - server_scripts/grindless/uv/kuiper.js: the bay's intercept, the annealer's release, the canister and the interceptor, the crafting;
//   - server_scripts/grindless/ev/cryogenic_plant.js: the Kuiper row after A1's Triton row, the older rows unchanged;
//   - Kuiper noble gas only from the annealer, and its krypton reaches the thruster works' Hall thruster;
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
const K = plain(run.global.grindless.uvKuiper);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const row = (name) => K.recipes.concat(K.support).find((r) => r.name === name);
const circuitOf = (r) => r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration);
const outputs = (r) => JSON.stringify(r.j.outputs || r.j.result || {});
const inputs = (r) => JSON.stringify(r.j.inputs || r.j.ingredients || {});
const fluidsOut = (r) => (r.j.outputs?.fluid || []).map((f) => [f.content.value[0].fluid, f.content.amount]);
const read = (rel) => fs.readFileSync(path.join(pack, 'kubejs', rel), 'utf8');
const NEW_ITEMS = ['kuiper_interceptor', 'sample_canister'];
const MACHINES = [['gtceu:kuiper_interceptor_bay', 'gtceu:kuiper_intercept', 9, 7, 7], ['gtceu:amorphous_ice_annealer', 'gtceu:ice_annealing', 5, 7, 5]];
const ORBIT = 'grindless:pluto_orbit';
const SAMPLE = 'grindless:planetesimal_sample';
const NOBLE = 'gtceu:kuiper_noble_gas';
const CRYO_ROW = 'grindless:cryogenic_processing/kuiper_noble_gas';

test('the stand-in runs the Kuiper scripts and the cryogenic plant without errors, nothing clashing or skipped', () => {
  const errs = run.errors.filter((e) => /uv[\\/]kuiper|uv_kuiper_lang|cryogenic_plant/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(K.clashes, []);
  assert.deepEqual(K.skipped, []);
});

test('registration: two recipe types, two machines, two items; the sample and the gas stay F1\'s', () => {
  for (const [machine, type] of MACHINES) {
    assert.ok(run.registry.recipeTypes.has(type), type);
    assert.deepEqual(run.registry.machines.get(machine).recipeTypes, [type]);
  }
  for (const n of NEW_ITEMS) assert.ok(run.registry.items.has('grindless:' + n), n);
  const ids = run.global.grindless.uvFoundation.ids;
  assert.equal(ids.planetesimalSample, SAMPLE);
  assert.equal(ids.kuiperNobleGas, NOBLE);
  const src = read('startup_scripts/grindless/uv/kuiper.js');
  assert.ok(!/planetesimal_sample|kuiper_noble_gas/.test(src.replace(/^\s*\/\/.*$/gm, '')), 'no F1 id registered again');
  assert.equal(K.orbit, ORBIT);
});

test('patterns: the bay 7 x 7 x 9 and the annealer 5 x 5 x 7, one controller in the front slice, station truss, GTM part limits', () => {
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
    assert.ok(lim.input_bus, id + ' input bus');
    assert.ok(Object.values(s.symbols).flatMap((v) => v.blocks || []).includes('grindless:station_truss_casing'), id + ' casing');
  }
  const bay = run.docs.structures.structures['gtceu:kuiper_interceptor_bay'];
  const bayLim = Object.fromEntries(bay.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
  assert.ok(bayLim.output_bus, 'the bay returns the sample and the canister');
  const blocks = Object.values(bay.symbols).flatMap((v) => v.blocks || []);
  assert.ok(blocks.includes('gtceu:laminated_glass'), 'the sample airlock');
  const ann = run.docs.structures.structures['gtceu:amorphous_ice_annealer'];
  const annLim = Object.fromEntries(ann.symbols.X.options.filter((o) => o.kind === 'part').map((o) => [o.ability, o.limits]));
  assert.deepEqual(annLim.output_hatch, { min: 1, max: 4 }, 'four gases out');
  assert.ok(!annLim.output_bus, 'no item leaves the annealer: the refractory dust is voided');
  const annBlocks = Object.values(ann.symbols).flatMap((v) => v.blocks || []);
  assert.ok(annBlocks.includes('grindless:cryostat_casing') && annBlocks.includes('gtceu:tungstensteel_pipe_casing'), 'cryostat and manifold');
});

test('the bay: interceptor + chart kept, circuit 1, Pluto orbit -> sample + canister back, VA[UV] x 4,000 t', () => {
  const r = row('planetesimal_intercept');
  assert.equal(r.type, 'kuiper_intercept');
  assert.deepEqual(r.itemsIn, [{ id: 'grindless:kuiper_interceptor', count: 1 }]);
  assert.deepEqual(r.notConsumed, ['grindless:pluto_kuiper_chart']);
  assert.deepEqual(r.itemsOut, [{ id: SAMPLE, count: 1 }, { id: 'grindless:sample_canister', count: 1 }]);
  assert.deepEqual(r.fluidsOut, []);
  assert.equal(r.eut, 491520);
  assert.equal(r.duration, 4000);
  const rec = byId(r.recipeId);
  assert.ok(rec, r.recipeId);
  assert.deepEqual(circuitOf(rec), [1]);
  assert.ok(JSON.stringify(rec.j.recipeConditions || []).includes(ORBIT), 'dimension condition');
});

test('the annealer: sample, circuit 1, Pluto orbit -> water, CO, nitrogen and the Kuiper noble gas, VA[ZPM] x 800 t', () => {
  const r = row('planetesimal_annealing');
  assert.equal(r.type, 'ice_annealing');
  assert.deepEqual(r.itemsIn, [{ id: SAMPLE, count: 1 }]);
  assert.deepEqual(r.itemsOut, []);
  assert.deepEqual(r.fluidsOut, [{ id: 'minecraft:water', amount: 4000 }, { id: 'gtceu:carbon_monoxide', amount: 1000 },
    { id: 'gtceu:nitrogen', amount: 500 }, { id: NOBLE, amount: 250 }]);
  assert.equal(r.eut, 122880);
  assert.equal(r.duration, 800);
  const rec = byId(r.recipeId);
  assert.ok(rec, r.recipeId);
  assert.deepEqual(circuitOf(rec), [1]);
  assert.ok(JSON.stringify(rec.j.recipeConditions || []).includes(ORBIT), 'dimension condition');
});

test('the planetesimal sample comes only from the bay, the Kuiper noble gas only from the annealer', () => {
  const sampleMakers = recipes.filter((r) => outputs(r).includes(`"${SAMPLE}"`));
  assert.deepEqual(sampleMakers.map((r) => r.i), [row('planetesimal_intercept').recipeId]);
  const gasMakers = recipes.filter((r) => outputs(r).includes(`"${NOBLE}"`));
  assert.deepEqual(gasMakers.map((r) => r.i), [row('planetesimal_annealing').recipeId]);
});

test('support: the canister and the interceptor (A11\'s pod, A2\'s RTG), each with one maker; the controllers are craftable', () => {
  const can = row('sample_canister');
  assert.equal(can.type, 'assembler');
  const icp = row('kuiper_interceptor');
  assert.deepEqual(icp.itemsIn.map((x) => x.id), ['grindless:thruster_pod', 'grindless:probe_rtg', 'grindless:sample_canister']);
  for (const r of K.support) assert.ok(byId(r.recipeId), r.recipeId);
  assert.deepEqual(circuitOf(byId(can.recipeId)), [9]);
  for (const n of NEW_ITEMS) {
    const makers = recipes.filter((r) => outputs(r).includes(`"grindless:${n}"`));
    assert.ok(makers.length >= 1, n);
    assert.ok(makers.every((m) => m.t === 'gtceu:assembler' || m.t === 'gtceu:kuiper_intercept'), n + ': ' + makers.map((m) => m.i).join(', '));
  }
  for (const id of ['grindless:thruster_pod', 'grindless:probe_rtg']) {
    assert.ok(recipes.some((r) => r.t === 'gtceu:assembler' && inputs(r).includes(`"${id}"`) && outputs(r).includes('"grindless:kuiper_interceptor"')), id);
  }
  const ids = recipes.map((r) => r.i);
  for (const id of Object.values(K.crafting)) assert.ok(ids.includes(id), id);
});

test('the cryogenic plant: the Kuiper row on the Moon splits the mix into argon, krypton and xenon; the older rows are unchanged', () => {
  const rec = byId(CRYO_ROW);
  assert.ok(rec, CRYO_ROW);
  assert.deepEqual(rec.j.inputs.fluid.map((f) => [f.content.value[0].fluid, f.content.amount]), [[NOBLE, 1000]]);
  assert.deepEqual(fluidsOut(rec), [['gtceu:argon', 400], ['gtceu:krypton', 400], ['gtceu:xenon', 200]]);
  assert.ok(JSON.stringify(rec.j.recipeConditions || []).includes('gcyr:luna'), 'on the Moon');
  const cryo = recipes.filter((r) => r.t === 'gtceu:cryogenic_processing').map((r) => r.i.split('/').pop()).sort();
  // UHV-A6 adds the 99.999 % neon row, UHV-B3 the oganesson propellant row, UEV-A2 the nether-air xenon cut
  // UEV-A7 adds the 6N helium-3 and helium-4 ash rows, UEV-B2 the interstellar gas row, UIV-A2 para hydrogen and liquid para hydrogen
  // UIV-B3 adds the 6N neon row; UXV-A2 adds he_6n, krypton from air, the oxygen-burning fuel and the triple-alpha fuel; OpV-A1 adds liquid helium-3; OpV-B3a adds krypton purification, the tritium cold trap and DT fill conditioning
  assert.deepEqual(cryo, ['dt_fill_conditioning', 'he_6n', 'helium_3_6n', 'helium_4_ash', 'high_purity_neon', 'interstellar_gas', 'krypton_from_air', 'krypton_purification', 'kuiper_noble_gas', 'liquid_helium', 'liquid_helium_3', 'liquid_nitrogen', 'liquid_oxygen', 'liquid_para_hydrogen', 'neon_6n', 'oganesson_propellant',
    'oxygen_burning_fuel', 'para_hydrogen', 'triple_alpha_fuel', 'tritium_cold_trap', 'triton_nitric_oxide', 'xenon_cut']);
  for (const [name, gas, liquid] of [['liquid_oxygen', 'gtceu:oxygen', 'gtceu:liquid_oxygen'], ['liquid_helium', 'gtceu:helium', 'gtceu:liquid_helium'],
    ['liquid_nitrogen', 'gtceu:nitrogen', 'gtceu:liquid_nitrogen']]) {
    const r = byId('grindless:cryogenic_processing/' + name);
    assert.deepEqual(r.j.inputs.fluid.map((f) => [f.content.value[0].fluid, f.content.amount]), [[gas, 1000]], name);
    assert.deepEqual(fluidsOut(r), [[liquid, 1000]], name);
  }
  const triton = recipes.find((r) => r.t === 'gtceu:cryogenic_processing' && r.i.endsWith('/triton_nitric_oxide'));
  assert.deepEqual(fluidsOut(triton), [['gtceu:nitrogen_15_oxide', 1000], ['gtceu:nitric_oxide', 1000]]);
  const src = read('server_scripts/grindless/ev/cryogenic_plant.js');
  assert.ok(src.indexOf('addKuiperNobleGas(event)') > src.indexOf('addTritonNitricOxide(event)'), 'after A1\'s row');
});

test('krypton reaches the thruster works: the Hall thruster takes the krypton the Kuiper row makes', () => {
  const hall = byId('grindless:thruster_assembly/hall_thruster');
  assert.ok(hall, 'A11\'s Hall row');
  assert.ok(inputs(hall).includes('"gtceu:krypton"'));
  assert.ok(fluidsOut(byId(CRYO_ROW)).some(([id]) => id === 'gtceu:krypton'));
});

test('names: en_us and es_es for the machines, the types and the items', () => {
  const lang = read('client_scripts/grindless/uv_kuiper_lang.js');
  const [en, es] = lang.split('es_es: {');
  assert.ok(es, 'es_es block');
  for (const part of [en, es]) {
    for (const key of ['bay:', 'annealer:', 'bayType:', 'annealerType:', 'bayTips:', 'annealerTips:']) assert.ok(part.includes(key), key);
    for (const n of NEW_ITEMS) assert.ok(part.includes(`${n}:`), n);
  }
  for (const k of ['block.gtceu.kuiper_interceptor_bay', 'block.gtceu.amorphous_ice_annealer', 'gtceu.kuiper_intercept', 'gtceu.ice_annealing']) {
    assert.ok(lang.includes(`'${k}`), k);
  }
  assert.match(lang, /i < 1/);
});

test('every new item has an icon, and the reused controller faces exist', () => {
  const tex = path.join(pack, 'kubejs', 'assets', 'grindless', 'textures');
  for (const n of NEW_ITEMS) assert.ok(fs.existsSync(path.join(tex, 'item', n + '.png')), n);
  for (const m of K.machines) assert.ok(fs.existsSync(path.join(tex, 'block', 'multiblock', m.overlay, 'overlay_front.png')), m.overlay);
});
