// OpV-B3 (antimatter): the antihydrogen foundry and annihilation engine rows, their controllers' assembly lines, the shield casing's assembler and
// the structures of startup_scripts/grindless/opv/antimatter.js.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { measure, violations } from '../lib/structure_quality.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const run = runPackScripts(pack);
const AM = run.global.grindless.opvAntimatter;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const plain = (x) => JSON.parse(JSON.stringify(x));
const rec = (type, name) => AM.recipes.find((r) => r.type === type && r.name === name);
const MACHINES = ['antihydrogen_foundry', 'annihilation_engine'];
const out = (r, id) => r.chanceOut.find((x) => x.id === id) || r.itemsOut.find((x) => x.id === id);
const wear = (r, id) => r.wear.find((x) => x.id === id);
const joules = (r) => r.eut * r.duration;
const localStep = (type, name) => {
  const r = AM.recipes.find((x) => x.type === type && x.name === name);
  assert.ok(r, `${type}/${name}`);
  return joules(r);
};

// Per-step ledger, not a foundry-only proxy. External snapshots are the coordinator's
// recovery cost references; C1 rechecks them against the integrated obtain graph.
const STEPS = {
  beam: 268435456 * 200, // opv.md:335, B3b antimatter_cygnus.json:6
  spallation: 503316480 * 400, // opv.md:349
  stochastic: 268435456 * 800, // opv.md:366
  electronCooling: 503316480 * 1200, // opv.md:367
  stacking: 491520 * 1200, // F1: UV trap VA x 1200, stacking row not present in B3b snapshot
  pairProduction: 503316480 * 1200, // E1 pair_converter.json:12, opv.md:433
  pairTrapping: 268435456 * 800, // E1 pair_converter.json:24, opv.md:434
  seedCompression: 7864320 * 600, // E1 tables/antimatter.json:53-54
  positronAccumulation: 1966080 * 400, // tables/antimatter.json:31-32
  sourceModeration: 491520 * 400, // tables/antimatter.json:12-13
  positronSeal: 1966080 * 400, // E1 tables/electron_beam.json:76
  penningTrap: 30720 * 200, // tables/antimatter.json:115-117; bulk shielding ignored
  laserModeration: 67108864 * 1200, // tables/cas_a.json:24
  laserEmission: 134217728 * 2400, // tables/cas_a.json:37
  positronStack: 1966080 * 1200, // uxv/cas_a.js:187
  beReduction: 1966080 * 400, // D1 tables/electron_beam.json:76, be_reduction
  beRolling: 167772160 * 200 / 4, // D1 beam_hardware.js:51-52, four foils
  beBrazing: 1966080 * 400, // D1 tables/electron_beam.json:79, be_window_braze
  windowAssembly: 503316480 * 400, // D1 beam_hardware.js:73
  irRefining: 1920 * 300, // D1 ev/platinum_plant.js:696
  irSintering: 1966080 * 600, // D1 uhv/propulsion.js:91, ir_target_rod
  irCladding: 33554432 * 700, // D1 tables/spin_deposition.json:136
  targetAssembly: 503316480 * 400, // D1 beam_hardware.js:77
  hydride: 480 * 200 / 2, // D1 tables/mk5.json:27-30
  hydrideSintering: 1966080 * 400, // D1 uhv/propulsion.js:92, li6h_tile
  hydrideCanning: 1966080 * 400, // D1 tables/electron_beam.json:82, li6h_canning
  shieldAssembly: 503316480 * 400, // D1 beam_hardware.js:81
  ceb6Powder: 167772160 * 300 / 7, // D1 beam_hardware.js:61-62
  ceb6Growth: 491520 * 1200, // D1 tables/crystals.json:125, ceb6_boule
  cathodeCut: 167772160 * 400 / 2, // D1 beam_hardware.js:67-68, two cathodes
  gunAssembly: 503316480 * 400, // D1 beam_hardware.js:86-88, cooler_electron_gun
  coolerAcceptance: 30720 * 600, // D1 luv/helium_refrigerator.js:331, opv_electron_cooler
  pickupWelding: 1966080 * 600, // D1 tables/electron_beam.json:88, pickup_array
  pickupBrazing: 167772160 * 400, // D1 beam_hardware.js:64-65
  pickupAcceptance: 30720 * 600, // D1 luv/helium_refrigerator.js:332-333, opv_stochastic_cooling_pickup
  getterMelt: 7864320 * 1200 / 3, // D1 tables/levitation_melter.json:46-48
  getterSintering: 1966080 * 500, // D1 uhv/propulsion.js:93, tizrv_target
  getterCoating: 33554432 * 700, // D1 tables/spin_deposition.json:148
  getterActivation: 1966080 * 600, // D1 tables/electron_beam.json:85-87, seven chambers
  mgFluoride: 30 * 64, // iv/fluorspar_kiln.js:155-162, one dust
  tiSapphire: 491520 * 800, // tables/crystals.json:104, ti_sapphire
  lbo: 491520 * 800, // tables/crystals.json:108, lbo
  krPurification: 7680 * 300 / 0.95, // ev/cryogenic_plant.js:126-127, krypton_purification
  winding: 1966080 * 600, // tables/hts_magnet_works.json:60-65, octupole_winding
  potting: 1966080 * 4800, // tables/composites.json:85, octupole_potting
  windingCooldown: 7680 * 600, // luv/helium_refrigerator.js:330-336, octupole_winding_cooldown
  magnetTraining: 1966080 * 1200, // tables/hts_magnet_works.json:68-73, octupole_trap_magnet
  graphiteDeposition: 122880 * 900 / 2, // zpm/outer_chemistry.js:102-106, two graphite blanks
  graphiteCleaving: 1966080 * 500 / 3, // tables/electron_beam.json:76-78, three plates
  cellAcceptance: 31457280 * 1600, // tables/memories_cryostat.json:114, levitation_cell
  boronSeparation: 1966080 * 4000, // tables/isotopes.json:202-206, one B-10
  absorberSintering: 1966080 * 600, // uhv/propulsion.js:91-92, gamma_absorber_tile
  curiumCut: 30720 * 200, // zpm/actinides.js:164-169, cm245_cut
  hohlraumWelding: 1966080 * 600, // tables/electron_beam.json:79-81, hohlraum_can
  dtConditioning: 7680 * 400, // ev/cryogenic_plant.js:132, dt_fill_conditioning
  pelletSealing: 7680 * 200, // iv/uranium_cycle.js:61-65, acmf_pellet
  hohlraumDissolution: localStep('chemical_reactor', 'spent_hohlraum_dissolution'),
  curiumRecovery: 30720 * 200 / 2.5 // zpm/actinides.js:174-180, 400 mB returned per pellet
};
// F2: coordinator-approved unknown step = its design VA x 1200; F3: unknown voltage = VA[OpV] x 1200.
// These are conservative consumed-input snapshots, not free tooling. Generic metals/gases are excluded by the balance rule.
const UNKNOWN_OPV_STEP = 503316480 * 1200; // F3: ta_seed_target, chain_field_coil, NbTiN film, RRR Nb
const UNKNOWN_UXV_STEP = 134217728 * 1200; // F2: laser cavity, neon moderator, Ti-44 core, MTJ die
const UNKNOWN_UHV_STEP = 1966080 * 1200; // F2: sodium-22 target
const UNKNOWN_LUV_STEP = 30720 * 1200; // F2: coated conductor tape

const COST = {};
COST.window = STEPS.windowAssembly + STEPS.beBrazing + 2 * STEPS.beRolling + STEPS.beReduction / 2 + 3 * 7680 * 1200 / 2; // F2: BeF2 kiln
COST.target = STEPS.targetAssembly + STEPS.irCladding + 4 * STEPS.irSintering + 16 * STEPS.irRefining + UNKNOWN_OPV_STEP; // F3: Ta seed
COST.shield = STEPS.shieldAssembly + 2 * STEPS.hydrideCanning + 4 * STEPS.hydrideSintering + 8 * STEPS.hydride + UNKNOWN_OPV_STEP; // F3: liner fabrication
COST.getter = (4 * STEPS.getterMelt + STEPS.getterSintering + STEPS.getterCoating + STEPS.getterActivation) / 7;
COST.cooler = STEPS.gunAssembly + STEPS.coolerAcceptance + STEPS.cathodeCut + (7 * STEPS.ceb6Powder + STEPS.ceb6Growth) / 2 + 2 * UNKNOWN_OPV_STEP + COST.getter;
COST.pickup = STEPS.pickupWelding + STEPS.pickupBrazing + STEPS.pickupAcceptance + 5 * UNKNOWN_OPV_STEP; // F3: four NbTiN films + RRR Nb
COST.cold = 4 * (STEPS.beam + COST.window * 313 / 10000) + STEPS.spallation + COST.target / 16 + COST.shield * 313 / 10000 +
  STEPS.stochastic + COST.pickup * 156 / 10000 + STEPS.electronCooling + COST.cooler * 156 / 10000 + STEPS.penningTrap;
COST.cartridge = STEPS.positronAccumulation + STEPS.penningTrap + (STEPS.sourceModeration + UNKNOWN_UHV_STEP) / 16;
COST.gammaLaser = STEPS.laserModeration + STEPS.laserEmission + STEPS.positronStack + 4 * COST.cartridge + 3 * UNKNOWN_UXV_STEP +
  UNKNOWN_UXV_STEP / 50; // F2: cavity, moderator, timing die, worn Ti-44 core
COST.dense = STEPS.pairProduction + STEPS.pairTrapping + STEPS.seedCompression + COST.cartridge +
  2 * STEPS.penningTrap + COST.gammaLaser / 16 + STEPS.positronSeal - STEPS.penningTrap * 0.9;
COST.magnet = localStep('cutter', 'octupole_tape') + 8 * UNKNOWN_LUV_STEP + STEPS.winding + STEPS.potting + STEPS.windingCooldown + STEPS.magnetTraining;
COST.laser = 2 * STEPS.mgFluoride + STEPS.tiSapphire + STEPS.lbo + STEPS.krPurification +
  localStep('assembler', 'kr_tripler_cell') + localStep('chemical_reactor', 'lyman_alpha_laser');
COST.cell = (STEPS.graphiteDeposition + localStep('compressor', 'hopg_ordering')) * 4 / 3 + STEPS.graphiteCleaving + STEPS.cellAcceptance;
COST.tile = 4 * STEPS.boronSeparation + localStep('chemical_reactor', 'b4c_10') + localStep('mixer', 'w_b4c_powder') + STEPS.absorberSintering;
COST.ice = ((COST.cold + COST.dense + localStep('antihydrogen_synthesis', 'trap_antihydrogen') + COST.magnet * 156 / 10000 -
  2 * STEPS.penningTrap * 0.9) / 0.95 + localStep('antihydrogen_synthesis', 'laser_cool') + COST.laser * 78 / 10000) / 0.95;
COST.ice = (COST.ice + localStep('antihydrogen_synthesis', 'freeze_ice') + COST.cell) / 0.95;
COST.pellet = localStep('alloy_smelter', 'w_re_alloy') + STEPS.curiumCut + STEPS.hohlraumWelding +
  localStep('mixer', 'dt_fill') + STEPS.dtConditioning + STEPS.pelletSealing;
export const FULL_COST = {
  burn_ice: COST.ice + COST.tile / 16 - COST.cell * 0.95,
  burn_pellet: 8 * COST.cold + STEPS.stacking - 8 * STEPS.penningTrap * 0.9 + COST.pellet + COST.tile / 16
};
// Bulk W/Re returns cost zero in this ledger. Recovering the Cm fraction costs more
// than a fresh cut, so it grants no positive EU credit; the recycle remains an honest optional route.

test('the stand-in runs the OpV-B3 scripts without errors, nothing skipped, no lookup clash', () => {
  const mine = run.errors.filter((e) => /antimatter|sounds/.test(String(e.file)) && !/no original recipe/.test(String(e.message)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(AM.skipped), []);
  assert.deepEqual(plain(AM.clashes), []);
});

test('foundry: c1 trap, c2 laser cool, c3 ice; each step loses 5%, the traps return at 90%, the magnet and laser wear', () => {
  const c1 = rec('antihydrogen_synthesis', 'trap_antihydrogen');
  assert.deepEqual([c1.circuit, c1.eut, c1.duration, c1.generator], [1, 268435456, 1200, false]);
  assert.equal(wear(c1, 'grindless:octupole_trap_magnet').chance, 156);
  assert.equal(out(c1, 'grindless:trapped_antihydrogen').chance, 9500);
  assert.equal(out(c1, 'grindless:empty_penning_trap').chance, 9000);
  const c2 = rec('antihydrogen_synthesis', 'laser_cool');
  assert.deepEqual([c2.circuit, c2.eut, c2.duration], [2, 268435456, 800]);
  assert.equal(wear(c2, 'grindless:lyman_alpha_laser').chance, 78);
  assert.equal(out(c2, 'grindless:cooled_antihydrogen').chance, 9500);
  const c3 = rec('antihydrogen_synthesis', 'freeze_ice');
  assert.deepEqual([c3.circuit, c3.eut, c3.duration], [3, 503316480, 1600]);
  assert.ok(c3.itemsIn.some((x) => x.id === 'grindless:levitation_trap_cell'));
  assert.equal(out(c3, 'grindless:antihydrogen_ice_cell').chance, 9500);
  for (const r of AM.recipes) assert.ok(r.eut < 2 ** 31, `${r.name} stays below 2^31 EU/t`);
});

test('engine: fixed EU/t and fuels, duration priced from the complete upstream chain and 1/16 tile wear', () => {
  const c1 = rec('annihilation_power', 'burn_ice');
  assert.deepEqual([c1.circuit, c1.eut, c1.generator, c1.site], [1, 2 ** 29, true, false]);
  assert.equal(wear(c1, 'grindless:gamma_absorber_tile').chance, 625);
  assert.equal(out(c1, 'grindless:activated_absorber_tile').chance, 625);
  assert.equal(out(c1, 'grindless:levitation_trap_cell').chance, 9500);
  assert.equal(c1.fluidsIn.find((f) => f.id === 'gtceu:hydrogen').amount, 1000);
  const c2 = rec('annihilation_power', 'burn_pellet');
  assert.deepEqual([c2.circuit, c2.eut, c2.generator], [2, 2 ** 30, true]);
  assert.deepEqual(plain(c2.itemsIn.map((x) => x.id)), ['grindless:acmf_pellet', 'grindless:antiproton_stack_opv']);
  assert.ok(out(c2, 'grindless:spent_acmf_hohlraum'), 'the spent hohlraum goes to the partitioning plant');
  const d = find('grindless:annihilation_power/burn_ice');
  assert.ok(d && JSON.stringify(d.j.tickInputs || d.j.tickOutputs || {}).includes('eu'));
  for (const [r, target] of [[c1, 1.7], [c2, 1.8]]) {
    const cost = FULL_COST[r.name];
    const duration = Math.ceil(target * cost / r.eut / 100) * 100;
    assert.equal(r.duration, duration, `${r.name}: fullCost=${cost}; duration=${duration}`);
    const ratio = joules(r) / cost;
    assert.ok(ratio >= 1.3 && ratio <= 2.5, `${r.name}: ${ratio.toFixed(4)}x`);
  }
});

test('the controllers: OpV hull, OpV components and circuits, superfluid He-3, three domain items, station research', () => {
  assert.deepEqual(plain(AM.controllerRecipes), MACHINES.map((m) => `grindless:assembly_line/${m}`));
  const want = {
    antihydrogen_foundry: ['grindless:octupole_trap_magnet', ['neg_xhv_casing', 'levitation_trap_cell', 'lyman_alpha_laser'], 4],
    annihilation_engine: ['grindless:gamma_absorber_tile', ['tpv_panel', 'li6_hydride_shield', 'octupole_trap_magnet'], 8]
  };
  for (const m of MACHINES) {
    const r = find(`grindless:assembly_line/${m}`);
    assert.ok(r && r.t === 'gtceu:assembly_line', m);
    const text = JSON.stringify(r.j);
    assert.ok(text.includes(`gtceu:${m}`), `${m} is its output`);
    for (const need of ['gtceu:opv_machine_hull', 'gtceu:circuits/opv', 'gtceu:opv_field_generator', 'grindless:superfluid_helium_3', want[m][0]]) assert.ok(text.includes(need), `${m} takes ${need}`);
    for (const d of want[m][1]) assert.ok(text.includes(d), `${m} takes ${d}`);
    assert.ok(!/(uxv|uiv|uev)_|circuits\/(uxv|uiv|uev|uhv)|gtceu:max_/.test(text), `${m} takes no component or circuit below OpV`);
    const ids = new Set((text.match(/"(?:id|tag|item)":"[^"]+"/g) || []));
    assert.ok(ids.size >= 8, `${m}: ${ids.size} distinct ingredients`);
  }
});

test('the annihilation shield casing: an assembler at OpV with two OpV circuits', () => {
  assert.equal(AM.casingRecipe, 'grindless:assembler/annihilation_shield_casing');
  const r = find(AM.casingRecipe);
  assert.ok(r && r.t === 'gtceu:assembler');
  const text = JSON.stringify(r.j);
  assert.ok(text.includes('gtceu:circuits/opv') && text.includes('grindless:annihilation_shield_casing'));
});

test('"only from": nothing else in the pack makes these ids', () => {
  const only = {
    'grindless:trapped_antihydrogen': 'antihydrogen_synthesis/trap_antihydrogen', 'grindless:cooled_antihydrogen': 'antihydrogen_synthesis/laser_cool',
    'grindless:antihydrogen_ice_cell': 'antihydrogen_synthesis/freeze_ice', 'gtceu:antihydrogen_foundry': 'assembly_line/antihydrogen_foundry',
    'gtceu:annihilation_engine': 'assembly_line/annihilation_engine', 'grindless:annihilation_shield_casing': 'assembler/annihilation_shield_casing'
  };
  for (const [id, tail] of Object.entries(only)) {
    const ps = recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`)).map((r) => r.i);
    assert.ok(ps.length >= 1, `${id} has a producer`);
    assert.deepEqual(ps.filter((i) => !i.endsWith(tail)), [], `${id} only from ${tail}`);
  }
});

test('structures: not boring, at least two functional kinds, controller in the front slice', () => {
  for (const m of MACHINES) {
    const s = run.global.grindless.structures[`gtceu:${m}`];
    assert.ok(s, `${m} has a description`);
    const mm = measure(s);
    assert.deepEqual(violations(mm), [], `${m}: ${JSON.stringify(mm)}`);
    assert.ok(mm.dominantShare <= 0.62, `${m}: dominant share ${mm.dominantShare}`);
    assert.ok(mm.functional.length >= 3, `${m}: ${mm.functional}`);
    assert.ok(s.slices[s.slices.length - 1].some((row) => row.includes('S')), `${m}: the controller is in the front slice`);
    const xs = s.slices.reduce((n, sl) => n + sl.join('').split('X').length - 1, 0);
    assert.ok(xs >= 4, `${m}: ${xs} hatch cells for at least four parts`);
  }
});

test('lang parity: every key of both languages, names, tooltips, EMI pages, recipe lines and the items', () => {
  const keys = ['gtceu.antihydrogen_synthesis', 'gtceu.annihilation_power'];
  for (const m of MACHINES) keys.push(`block.gtceu.${m}`, `grindless.machine.${m}.tooltip.0`, `grindless.machine.${m}.tooltip.1`, `emi.grindless.info.${m}.0`, `emi.grindless.info.${m}.1`);
  keys.push('grindless.machine.annihilation_engine.tooltip.2');
  for (const fluid of ['purified_krypton', 'dt_fill', 'cold_dt_fill']) {
    keys.push(`material.grindless.${fluid}`, `fluid.grindless.${fluid}`);
  }
  for (const i of Object.keys(AM.items)) keys.push(`item.grindless.${i}`, `tooltip.grindless.${i}.0`, `tooltip.grindless.${i}.1`);
  for (const r of AM.recipes) if (r.dataKey) keys.push(`gtceu.recipe.${r.dataKey}.${r.name}`);
  for (const k of keys) for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][k], `${lang} has ${k}`);
  const re = /antihydrogen|annihilation|absorber_tile|hohlraum/;
  assert.deepEqual(Object.keys(run.lang.en_us).filter((k) => re.test(k)).sort(), Object.keys(run.lang.es_es).filter((k) => re.test(k)).sort());
  assert.match(run.lang.en_us['grindless.machine.annihilation_engine.tooltip.2'], /neutrino/);
  assert.match(run.lang.en_us['grindless.machine.antihydrogen_foundry.tooltip.1'], /5%/);
});

// OpV-B3a: process lines 26-28 and 31-33, every recipe as the stand-in's recipe documents have it
const makes = (id) => recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`));
const takes = (id) => recipes.filter((r) => JSON.stringify(r.j.inputs || {}).includes(`"${id}"`));
const LINES = {
  26: ['grindless:magnesium_fluoride_dust', 'grindless:ti_sapphire_boule', 'grindless:lbo_boule', 'grindless:kr_tripler_cell', 'grindless:lyman_alpha_laser'],
  27: ['grindless:octupole_tape', 'grindless:octupole_winding', 'grindless:potted_octupole_winding', 'grindless:cooled_octupole_winding', 'grindless:octupole_trap_magnet'],
  28: ['grindless:pyrolytic_graphite', 'grindless:hopg_blank', 'grindless:hopg_plate', 'grindless:levitation_trap_cell'],
  31: ['grindless:w_re_alloy_ingot', 'grindless:cm245_fraction', 'grindless:w_re_hohlraum', 'grindless:acmf_pellet'],
  32: ['grindless:boron_10_dust', 'grindless:b4c_10_dust', 'grindless:w_b4c_powder', 'grindless:gamma_absorber_tile'],
  33: ['grindless:gasb_boule', 'grindless:gasb_wafer', 'grindless:ingaassb_epi_wafer', 'grindless:tpv_panel']
};

test('OpV-B3a: each line has at least four real recipes, every step of the chain is made by a recipe and consumed by the next', () => {
  for (const [line, ids] of Object.entries(LINES)) {
    const steps = new Set();
    for (const id of ids) {
      const made = makes(id);
      assert.ok(made.length >= 1, `line ${line}: nothing makes ${id}`);
      made.forEach((r) => steps.add(r.i));
    }
    assert.ok(steps.size >= 4, `line ${line}: ${steps.size} recipes`);
  }
  for (const id of ['grindless:ti_sapphire_boule', 'grindless:lbo_boule', 'grindless:kr_tripler_cell', 'grindless:octupole_tape', 'grindless:octupole_winding', 'grindless:potted_octupole_winding',
    'grindless:cooled_octupole_winding', 'grindless:hopg_blank', 'grindless:hopg_plate', 'grindless:w_re_alloy_ingot', 'grindless:cm245_fraction', 'grindless:w_re_hohlraum',
    'grindless:boron_10_dust', 'grindless:b4c_10_dust', 'grindless:gasb_boule', 'grindless:gasb_wafer', 'grindless:ingaassb_epi_wafer', 'grindless:magnesium_fluoride_dust']) {
    assert.ok(takes(id).length >= 1, `${id} is consumed`);
  }
});

test('OpV-B3a: the older rows sit on the contract\'s circuits and keep the older type slots', () => {
  const circuitOf = (id) => [...JSON.stringify(find(id)?.j || {}).matchAll(/"configuration":(\d+)/g)].map((m) => Number(m[1]));
  const where = {
    'grindless:calutron_separation/boron_10': 15, 'grindless:chemical_vapour_infiltration/octupole_potting': 9, 'grindless:nuclear_demagnetisation/levitation_cell': 7,
    'grindless:electron_beam_refining/hopg_plate': 21, 'grindless:electron_beam_refining/hohlraum_can': 22, 'grindless:electron_beam_refining/tpv_braze': 32,
    'grindless:crystal_growth/crystal_growth/ti_sapphire': 25, 'grindless:crystal_growth/crystal_growth/lbo': 26, 'grindless:crystal_growth/crystal_growth/gasb': 27, 'grindless:molecular_beam_epitaxy/ingaassb_epi': 11,
    'grindless:spark_plasma_sintering/gamma_absorber_tile': 15, 'grindless:actinide_partitioning/cm245_cut': 8, 'grindless:actinide_partitioning/curium_recovery': 9,
    'grindless:methane_pyrolysis/hopg_blank': 5, 'grindless:magnet_winding/octupole_winding': 9, 'grindless:magnet_winding/octupole_trap_magnet': 10, 'grindless:hot_cell/activated_absorber_decay': 22
  };
  for (const [id, c] of Object.entries(where)) {
    const r = find(id);
    assert.ok(r, `${id} is made`);
    assert.deepEqual(circuitOf(id), [c], id);
  }
  // keyed rows: no programmed circuit, one input that nothing else on the machine takes
  for (const id of ['grindless:methane_pyrolysis/hopg_reanneal', 'grindless:fluorspar_digestion/magnesium_fluoride', 'grindless:cryogenic_processing/krypton_purification',
    'grindless:cryogenic_processing/tritium_cold_trap', 'grindless:closed_loop_cooling/octupole_winding_cooldown']) {
    assert.ok(find(id), `${id} is made`);
    assert.deepEqual(circuitOf(id), [], id);
  }
});

test('OpV-B3a: the returns go to honest, separate destinations', () => {
  const into = (id) => takes(id).map((r) => r.i);
  const outOf = (id) => makes(id).map((r) => r.i);
  assert.ok(outOf('grindless:nickel_tungsten_tape').some((i) => i.endsWith('cutter/octupole_tape')), 'the REBCO trim is the coated conductor line\'s substrate tape');
  assert.ok(into('grindless:nickel_tungsten_tape').some((i) => /coated_conductor/.test(i)), 'and the line takes it');
  assert.ok(into('grindless:hopg_offcut').some((i) => i.endsWith('methane_pyrolysis/hopg_reanneal')), 'the worn HOPG is re-annealed');
  assert.ok(outOf('grindless:hopg_offcut').some((i) => i.endsWith('electron_beam_refining/hopg_plate')));
  assert.ok(into('grindless:spent_acmf_hohlraum').some((i) => i.endsWith('chemical_reactor/spent_hohlraum_dissolution')), 'the spent hohlraum is dissolved');
  assert.ok(into('gtceu:curium_nitrate').some((i) => i.endsWith('actinide_partitioning/curium_recovery')), 'its curium goes back to the partitioner');
  assert.ok(outOf('gtceu:curium_nitrate').some((i) => i.endsWith('chemical_reactor/spent_hohlraum_dissolution')));
  assert.ok(into('grindless:activated_absorber_tile').some((i) => i.endsWith('hot_cell/activated_absorber_decay')), 'the activated tile goes to the hot cell');
  const decay = find('grindless:hot_cell/activated_absorber_decay');
  const outs = JSON.stringify(decay.j.outputs);
  for (const id of ['gtceu:helium', 'gtceu:tungsten_dust', 'gtceu:boron_carbide_dust']) assert.ok(outs.includes(id), `the hot cell gives back ${id}`);
  assert.ok(into('grindless:gasb_kerf_dust').some((i) => i.endsWith('centrifuge/gasb_kerf')), 'the GaSb kerf is centrifuged');
  assert.ok(into('gtceu:gallium_dust').some((i) => i.endsWith('crystal_growth/gasb')) && into('gtceu:antimony_dust').some((i) => i.endsWith('crystal_growth/gasb')), 'and goes back to crystal growth');
  assert.ok(JSON.stringify(find('grindless:chemical_reactor/lyman_alpha_laser').j.outputs).includes('gtceu:krypton'), 'the spent krypton comes back');
  assert.ok(into('gtceu:krypton').some((i) => i.endsWith('cryogenic_processing/krypton_purification')));
});

test('home and OpV dynamo requirements are enforced again on cached recipe starts', () => {
  const opv = (amps) => ({ voltage: 2 ** 29, amps });
  assert.equal(AM.engineAllowed('minecraft:overworld', [opv(1)], 2 ** 29), true);
  assert.equal(AM.engineAllowed('minecraft:overworld', [opv(4)], 2 ** 30), true);
  assert.equal(AM.engineAllowed('minecraft:the_nether', [opv(4)], 2 ** 30), false);
  assert.equal(AM.engineAllowed('minecraft:overworld', [{ voltage: 2 ** 27, amps: 16 }], 2 ** 30), false);
  assert.equal(AM.engineAllowed('minecraft:overworld', [opv(1), opv(1)], 2 ** 30), false);
  assert.equal(AM.engineAllowed('minecraft:overworld', [], 2 ** 29), false);
  const source = fs.readFileSync(path.join(pack, 'kubejs', 'startup_scripts', 'grindless', 'opv', 'antimatter.js'), 'utf8');
  assert.match(source, /\.beforeWorking\(AM\.engineBeforeWorking\)/);
  assert.match(source, /if \(!engineVeto\(machine, recipe\)\) return true/);
  assert.match(source, /G\.noVoiding\.modifier\(KEEP/);
});

test('DT conditioning and krypton purification are actual required production edges', () => {
  assert.ok(takes('grindless:dt_fill').some((r) => r.i.endsWith('cryogenic_processing/dt_fill_conditioning')));
  assert.ok(takes('grindless:cold_dt_fill').some((r) => r.i.endsWith('fuel_fabrication/acmf_pellet')));
  assert.ok(takes('grindless:purified_krypton').some((r) => r.i.endsWith('assembler/kr_tripler_cell')));
  const casing = JSON.stringify(find(AM.casingRecipe).j);
  for (const id of ['gtceu:opv_sensor', 'grindless:superfluid_helium_3']) assert.ok(casing.includes(id), id);
});

test('the native fixture fits the assigned band and exposes the grouped-run completion marker', () => {
  const fixture = fs.readFileSync(path.join(pack, '..', 'tools', 'test', 'overlay', 'kubejs', 'server_scripts', 'gg_test_opv_antimatter.js'), 'utf8');
  assert.match(fixture, /customCommand\('gg_test_opv_antimatter'/);
  assert.match(fixture, /\|DONE\|failures=/);
  assert.match(fixture, /progress >= 1200/);
  assert.match(fixture, /engineBeforeWorking\(u\.m, real\)/);
  const zone = JSON.parse(fs.readFileSync(path.join(pack, '..', 'tools', 'test', 'zones.json'), 'utf8')).zones.find((z) => z.id === 'opv_antimatter');
  assert.deepEqual(zone.x, [38848, 38911]);
  assert.deepEqual(zone.z, [0, 63]);
  assert.deepEqual(zone.y, [98, 115]);
  const d = run.global.grindless.patterns.describe('gtceu:annihilation_engine');
  let controller;
  d.slices.forEach((rows, si) => rows.forEach((row, ri) => [...row].forEach((ch, ci) => {
    if (d.symbols[ch]?.kind === 'controller') controller = { si, ri, ci };
  })));
  assert.ok(controller);
  for (const cx of [38856, 38876, 38896]) {
    d.slices.forEach((rows, si) => rows.forEach((row, ri) => [...row].forEach((_ch, ci) => {
      const xyz = [cx - ci + controller.ci, 104 + ri - controller.ri, 8 - si + controller.si];
      for (const [axis, value] of [['x', xyz[0]], ['y', xyz[1]], ['z', xyz[2]]]) {
        assert.ok(value >= zone[axis][0] && value <= zone[axis][1], `${axis}=${value}`);
      }
    })));
  }
});

test('OpV-B3a: every new row stays below 2^31 EU/t, the new items are registered with names, tooltips and textures', () => {
  for (const r of AM.recipes) assert.ok(r.eut < 2 ** 31, `${r.type}/${r.name}`);
  const fresh = ['magnesium_fluoride_dust', 'ti_sapphire_boule', 'lbo_boule', 'kr_tripler_cell', 'octupole_tape', 'octupole_winding', 'potted_octupole_winding', 'cooled_octupole_winding', 'w_b4c_powder',
    'hopg_blank', 'hopg_plate', 'hopg_offcut', 'w_re_alloy_ingot', 'cm245_fraction', 'w_re_hohlraum', 'boron_10_dust', 'b4c_10_dust', 'gasb_boule', 'gasb_wafer', 'gasb_kerf_dust', 'ingaassb_epi_wafer'];
  for (const n of fresh) {
    assert.ok(AM.items[n], `${n} is registered`);
    for (const lang of ['en_us', 'es_es']) for (const k of [`item.grindless.${n}`, `tooltip.grindless.${n}.0`, `tooltip.grindless.${n}.1`]) assert.ok(run.lang[lang][k], `${lang} ${k}`);
    assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'item', `${n}.png`)), `${n} texture`);
  }
});
