// OpV-D3 (kugelblitz): the forge's five rows, the collector's two generator rows, the two controllers' assembly lines and the structures of
// startup_scripts/grindless/opv/kugelblitz.js.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { runPackScripts } from '../lib/kubejs_static.mjs';
import { measure, violations } from '../lib/structure_quality.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const run = runPackScripts(pack);
const KB = run.global.grindless.kugelblitz;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const producers = (id) => recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`));
const plain = (x) => JSON.parse(JSON.stringify(x));
const rec = (type, name) => KB.recipes.find((r) => r.type === type && r.name === name);
const SITE = 'grindless:cygnus_x1_orbit';
const MACHINES = ['kugelblitz_forge', 'hawking_collector'];
const wear = (r, id) => r.wear.find((w) => w.id === id);

// Recovery balance rule: count fuel-specific synthesis and wear, not generic bulk metals,
// gases, common housings or data/circuit parts. Sources are the named rows, not sibling outputs.
const STEP_EU = {
  // E1 branch ezequiel24123z-opv-pair-converter; opv.md:820, line 29.
  positronSource: 491520 * 400, // antimatter.json: moderated_source
  sodium22Target: 491520 * 800, // uv/accelerators.js: sodium_22
  positronCartridge: 1966080 * 400, // antimatter.json: accumulate; source wears 1/16
  seedPlasma: 7864320 * 600, // antimatter.json: seed_plasma
  hotPairs: 503316480 * 1200, // pair_converter.json: boil_seed_plasma
  unsealedCell: 268435456 * 800, // pair_converter.json: seal_positron_cell
  denseCellSeal: 1966080 * 400, // electron_beam.json: positron_cell_seal
  // UXV-B5; cas_a.json: moderate_positronium / stimulate_gamma_emission (line 37 precursor).
  moderatedPs: 67108864 * 1200,
  gammaModule: 134217728 * 2400,
  positronStack: 1966080 * 1200, // uxv/cas_a.js: addTrap, four cartridges
  ti44Separation: 1966080 * 4000, // isotopes.json: titanium_44
  ti44Capsule: 7680 * 400, // hot_cell.json: ti44_core_capsule
  gammaCavity: 31457280 * 1600, // j0437.json: gamma_laser_cavity
  pairPlasma: 31457280 * 1200 / 4, // j0437.json: pair_plasma, 4,000 mB
  cooledPositrons: 1966080 * 600, // j0437.json: pair_plasma_cooling
  psAerogel: 31457280 * 800, // j0437.json: ps_in_aerogel
  cooledPs: 31457280 * 1200, // j0437.json: laser_cooled_ps
  psBec: 1966080 * 800, // j0437.json: ps_bec
  braggCut: 491520 * 300 / 2, // j0437.json: c12_004_cut, two plates
  braggMill: 1966080 * 400, // j0437.json: c12_ion_mill
  braggMirrors: 1966080 * 600, // j0437.json: gamma_bragg_mirror, two mirrors
  neonCartridge: 491520 * 300, // j0437.json: neon_moderator_cartridge
  neonAnneal: 491520 * 200, // j0437.json: anneal_neon_cone
  // B1 branch ezequiel24123z-friendly-spork; opv.md:825-826, lines 34-35.
  bentGeTile: 3932160 * 800 / 4, // megabar.json: bent_ge_tile
  gaasTile: 491520 * 800 / 8, // crystals.json: gaas_laue_tile
  alignedFrame: 491520 * 600, // accelerators.json: laue_frame_alignment
  lens: 268435456 * 1600, // tetron_optics.json: laue_lens
  rebendTiles: 3932160 * 600 / 4, // megabar.json: bent_ge_rebend; three of four return
  mirrorBlank: 1966080 * 4800, // composites.json: superpolished_sic_blank
  multilayer: 33554432 * 800, // spin_deposition.json: wc_sic_multilayer
  metrology: 491520 * 400, // accelerators.json: mirror_metrology
  mirror: 268435456 * 1200, // tetron_optics.json: gamma_multilayer_mirror
  mirrorStrip: 1966080 * 2400, // composites.json: gamma_mirror_strip
  // UXV Cygnus tables, uxv.md:355 and OpV line 37.
  stellarPlasma: 134217728 * 1200, // cygnus_lift.json: stellar_lift, 1,000 mB
  diskPlasma: 134217728 * 1200, // cygnus_disk.json: skim_disk, 1,000 mB
  diskFilter: 67108864 * 400, // cygnus_lift.json: disk_filter, 900 mB
  frc: 134217728 * 1600, // cygnus_disk.json: form_cartridge
  mhQuench: 7864320 * 1200, // metallic_hydrogen.json: mh_quench
  mhWire: 1966080 * 100, // metallic_hydrogen.json: mh_wire, two wires
  mhWinding: 7864320 * 400, // magnet_works.json: mh_winding, sixteen wires
  // D2 branch ezequiel24123z-opv-d2-exotic-matter; opv.md:827, line 36.
  lead208: 268435456 * 400, // isotopes.json: lead_208, one dust
  ionSource: 268435456 * 400, // exotic_matter.json: pb208_ion_source
  leadBeam: 268435456 * 800, // superheavy.json: pb208_beam_cell
  fireball: 503316480 * 1200, // accelerators.json: fireball_distillate (synchrotron c9)
  strangeletSeed: 268435456 * 1600, // exotic_matter.json: strangelet_seed, pasta wear 312/10000
  fedStrangelet: 268435456 * 1600,
  grownStrangelet: 503316480 * 2400,
  stableMatter: 503316480 * 2400,
  // UIV/UXV neutron fuel steps: rx_j1856.json and vela_pasta.json; OpV lines 36-37.
  dripNeutrons: 31457280 * 1200, // crust_decompression/drip_neutrons, 4,000 mB
  crustLift: 31457280 * 2400, // rx_j1856.json: crust_lift, four crusts
  innerCrust: 31457280 * 1200, // rx_j1856.json: inner_crust, two inner matter
  neutronSuperfluid: 31457280 * 2400, // neutronium_caging/neutron_superfluid, 1,000 mB
  neutronPellet: 31457280 * 2400, // neutronium_caging/neutronium_pellet, 2,000 mB
  rawPasta: 134217728 * 2400, // pasta_extraction, pellet wear 1/10
  sortedPasta: 67108864 * 1200, // phase_sorting, one anti_phase_residue
  pastaSample: 134217728 * 2400, // core_sample, 16 residues
  // A3 integrated branch: field_press.json; opv.md:443-448 and line 3.
  fieldCan: 1966080 * 600, // electron_beam.json: field_can
  fieldBillet: 268435456 * 1200,
  fieldPlates: 268435456 * 800 / 4,
  // A0: integrated vela_pasta.json; opv.md:793, line 2.
  latticeSlab: 134217728 * 600,
  latticeCaging: 67108864 * 600,
  lamina: 134217728 * 600 / 4, // four laminae
  laminaStack: 134217728 * 400,
  lasagnaPlate: 134217728 * 1200 / 4,
  // D3: opv.md:398-400, line 37.
  pumpCharge: 503316480 * 800,
  focusedSeed: 503316480 * 2400,
  core: 503316480 * 2400
};
// Explicit provisional steps without accepted EU/time rows: VA[OpV] x 1,200 t.
// B3a (f1f33b70) has no line-32 manufacturing rows yet. C1 must replace these
// four assumptions independently, not count only the final tile's assembler.
const FALLBACK_EU = 503316480 * 1200;
const ASSUMED_EU = {
  boron10Enrichment: FALLBACK_EU, // opv.md:823, B-10 calutron step
  boronCarbide10: FALLBACK_EU, // opv.md:823, B4C-10 synthesis
  tungstenBoronTile: FALLBACK_EU, // opv.md:823, W/B4C SPS step
  absorberAssembly: FALLBACK_EU, // opv.md:823, gamma_absorber_tile assembly
  wcSputterTarget: FALLBACK_EU // opv.md:825, SPS target row missing in B1 snapshot
};
const absorberCost = ASSUMED_EU.boron10Enrichment + ASSUMED_EU.boronCarbide10
  + ASSUMED_EU.tungstenBoronTile + ASSUMED_EU.absorberAssembly;
const cartridgeCost = STEP_EU.positronCartridge + (STEP_EU.positronSource + STEP_EU.sodium22Target) / 16;
const neonCost = STEP_EU.neonCartridge + STEP_EU.neonAnneal;
const cavityCost = STEP_EU.gammaCavity + STEP_EU.pairPlasma + STEP_EU.cooledPositrons
  + STEP_EU.psAerogel + neonCost + STEP_EU.cooledPs + STEP_EU.psBec
  + 4 * (STEP_EU.braggCut + STEP_EU.braggMill) + STEP_EU.braggMirrors;
const moduleCost = STEP_EU.gammaModule + STEP_EU.moderatedPs + neonCost
  + (STEP_EU.ti44Separation + STEP_EU.ti44Capsule) / 50
  + STEP_EU.positronStack + 4 * cartridgeCost + cavityCost;
const denseCost = STEP_EU.seedPlasma + cartridgeCost + STEP_EU.hotPairs + moduleCost / 16
  + STEP_EU.unsealedCell + STEP_EU.denseCellSeal;
// B1 returns: 4 tiles with 25% chance, then 3/4 re-bent; 10% mirrors stripped to a blank.
const lensCost = STEP_EU.lens + 32 * (STEP_EU.bentGeTile + STEP_EU.gaasTile) + STEP_EU.alignedFrame
  - (3 / 4 * STEP_EU.bentGeTile - STEP_EU.rebendTiles);
const mirrorCost = STEP_EU.mirror + STEP_EU.mirrorBlank + STEP_EU.multilayer
  + ASSUMED_EU.wcSputterTarget + STEP_EU.metrology
  - 0.1 * (STEP_EU.mirrorBlank - STEP_EU.mirrorStrip);
const windingCost = STEP_EU.mhWinding + 8 * (STEP_EU.mhQuench + STEP_EU.mhWire);
const diskCost = STEP_EU.diskPlasma + windingCost / 20;
const frcCost = STEP_EU.frc + 0.4 * windingCost + 500 / 900 * (diskCost + STEP_EU.diskFilter);
const chargeCost = STEP_EU.pumpCharge + 2 * denseCost + moduleCost / 8;
const seedCost = (STEP_EU.focusedSeed + 4 * chargeCost + frcCost + (lensCost + mirrorCost) / 64) / 0.95;
const coreCost = STEP_EU.core + seedCost + 4 * cartridgeCost + 8 * absorberCost;
const pelletCost = STEP_EU.neutronPellet + 2 * (STEP_EU.neutronSuperfluid + STEP_EU.dripNeutrons + STEP_EU.crustLift + STEP_EU.innerCrust);
const sampleCost = STEP_EU.pastaSample + 16 * (STEP_EU.sortedPasta + STEP_EU.rawPasta + pelletCost / 10);
const laminaCost = (STEP_EU.latticeSlab + pelletCost / 10 + STEP_EU.latticeCaging) / 2
  + 2 * STEP_EU.lamina + STEP_EU.laminaStack
  + (STEP_EU.rawPasta + pelletCost / 10 + STEP_EU.sortedPasta) / 4 + STEP_EU.lasagnaPlate;
const plateCost = laminaCost + STEP_EU.fieldCan + STEP_EU.fieldBillet / 4 + STEP_EU.fieldPlates;
const matterCost = STEP_EU.lead208 + STEP_EU.ionSource + STEP_EU.leadBeam + diskCost + STEP_EU.fireball
  + STEP_EU.strangeletSeed + sampleCost * 312 / 10000 + STEP_EU.fedStrangelet
  + 4 * pelletCost + STEP_EU.grownStrangelet + STEP_EU.stableMatter + plateCost;
// A shell substitutes four tiles when rebuilding. This is its only fuel-chain credit;
// generic metal/gas recovery (activated tile hot-cell route, spent cans) has zero charged cost.
const CORE_NET_COST = coreCost - 4 * absorberCost;
const BALANCE = [
  { name: 'feed_exotic_matter', target: 2, fullCost: matterCost + CORE_NET_COST / 64 + absorberCost / 8 },
  { name: 'feed_stellar_plasma', target: 1.5, fullCost: 4 * STEP_EU.stellarPlasma + CORE_NET_COST / 32 + absorberCost / 8 }
];

test('the stand-in runs the OpV-D3 scripts without errors, nothing skipped, no lookup clash', () => {
  const mine = run.errors.filter((e) => /kugelblitz|sounds/.test(String(e.file)) && !/no original recipe/.test(String(e.message)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(KB.skipped), []);
  assert.deepEqual(plain(KB.clashes), []);
  assert.equal(KB.recipes.length, 8); // MAX-G1 adds write_seed_wave_packet (c6)
});

test('forge circuits 1-5 with their EU/t and ticks, all locked to Cygnus X-1', () => {
  const want = { charge_gamma_pump: [1, 503316480, 800], focus_kugelblitz_seed: [2, 503316480, 2400], condense_kugelblitz_core: [3, 503316480, 2400], forge_hawking_drive: [4, 268435456, 1200], recondense_core_from_shell: [5, 503316480, 2400], write_seed_wave_packet: [6, 503316480, 2400] };
  for (const [n, v] of Object.entries(want)) {
    const r = rec('kugelblitz_forming', n);
    assert.deepEqual([r.circuit, r.eut, r.duration, r.site, r.generator], [...v, true, false], n);
    assert.ok(JSON.stringify(find(`grindless:kugelblitz_forming/${n}`).j.recipeConditions || []).includes(SITE), n);
  }
});

test('charge and seed: exact wear 1/8 and 1/64, the 5% failed seed', () => {
  const c1 = rec('kugelblitz_forming', 'charge_gamma_pump');
  assert.deepEqual(plain(c1.itemsIn), [{ id: 'grindless:dense_positron_cell', count: 2 }]);
  assert.deepEqual(plain(wear(c1, 'grindless:gamma_laser_module').chance), [1, 8]);
  const c2 = rec('kugelblitz_forming', 'focus_kugelblitz_seed');
  assert.deepEqual(plain(wear(c2, 'grindless:laue_lens').chance), [1, 64]);
  assert.deepEqual(plain(wear(c2, 'grindless:gamma_multilayer_mirror').chance), [1, 64]);
  assert.deepEqual(plain(c2.itemsIn), [{ id: 'grindless:gamma_pump_charge', count: 4 }, { id: 'grindless:frc_cartridge', count: 1 }]);
  assert.deepEqual(plain(c2.itemsOut[0].chance), [95, 100]);
  assert.ok(KB.custom.includes('grindless:kugelblitz_forming/focus_kugelblitz_seed'), '1/64 is written exactly (custom JSON)');
  const j = find('grindless:kugelblitz_forming/focus_kugelblitz_seed').j;
  const lens = j.inputs.item.find((c) => JSON.stringify(c.content).includes('laue_lens'));
  assert.deepEqual([lens.chance, lens.maxChance], [1, 64]);
});

test('core, drive and the shell route', () => {
  const c3 = rec('kugelblitz_forming', 'condense_kugelblitz_core');
  assert.deepEqual(plain(c3.itemsIn.map((x) => [x.id, x.count])), [['grindless:kugelblitz_seed', 1], ['grindless:positron_cartridge', 4], ['grindless:gamma_absorber_tile', 8]]);
  assert.deepEqual(plain(c3.itemsOut), [{ id: 'grindless:kugelblitz_core', count: 1, chance: null }]);
  const c4 = rec('kugelblitz_forming', 'forge_hawking_drive');
  assert.deepEqual(plain(c4.itemsIn.map((x) => x.id)), ['grindless:kugelblitz_core', 'grindless:gamma_multilayer_mirror', 'grindless:field_frozen_plate']);
  assert.equal(c4.itemsOut[0].id, 'grindless:hawking_drive');
  const c5 = rec('kugelblitz_forming', 'recondense_core_from_shell');
  assert.equal(c5.itemsIn.find((x) => x.id === 'grindless:gamma_absorber_tile').count, 4, 'half the tiles come back through the shell');
  assert.ok(c5.itemsIn.some((x) => x.id === 'grindless:evaporated_core_shell'));
});

test('collector: generator rows at 2^30 and 2^29 EU/t, core wear 1/64 and 1/32, tile 1/8, one run', () => {
  const c1 = rec('hawking_power', 'feed_exotic_matter');
  assert.deepEqual([c1.circuit, c1.eut, c1.site, c1.generator], [1, 2 ** 30, true, true]);
  assert.deepEqual(plain(c1.itemsIn), [{ id: 'grindless:stable_exotic_matter', count: 1 }]);
  assert.deepEqual(plain(wear(c1, 'grindless:kugelblitz_core').chance), [1, 64]);
  assert.deepEqual(plain(wear(c1, 'grindless:gamma_absorber_tile').chance), [1, 8]);
  const c2 = rec('hawking_power', 'feed_stellar_plasma');
  assert.deepEqual([c2.circuit, c2.eut, c2.generator], [2, 2 ** 29, true]);
  assert.deepEqual(plain(c2.fluidsIn), [{ id: 'gtceu:stellar_plasma', amount: 4000 }]);
  assert.deepEqual(plain(wear(c2, 'grindless:kugelblitz_core').chance), [1, 32]);
  for (const n of ['feed_exotic_matter', 'feed_stellar_plasma']) {
    const d = find(`grindless:hawking_power/${n}`);
    assert.ok(d && JSON.stringify(d.j.tickOutputs || {}).includes('eu'), n);
    assert.ok(JSON.stringify(d.j.recipeConditions || []).includes(SITE), n);
    assert.ok(KB.custom.includes(`grindless:hawking_power/${n}`), n);
    const r = rec('hawking_power', n);
    const tile = r.itemsOut.find((x) => x.id === 'grindless:activated_absorber_tile');
    assert.deepEqual(plain(tile.chance), [1, 8], `${n}: tile return equals tile wear`);
    const output = d.j.outputs.item.find((x) => JSON.stringify(x.content).includes('activated_absorber_tile'));
    assert.deepEqual([output.chance, output.maxChance], [1250, 10000], `${n}: exact GTM tile chance`);
    const machine = KB.machines.find((x) => x.type === 'hawking_power');
    assert.equal(machine.maxIO.itemsOut, 2);
    assert.equal(r.itemsOut.length, machine.maxIO.itemsOut);
  }
  const core = find('grindless:hawking_power/feed_exotic_matter').j.inputs.item.find((c) => JSON.stringify(c.content).includes('kugelblitz_core'));
  assert.deepEqual([core.chance, core.maxChance], [1, 64]);
  assert.ok(2 ** 30 * c1.duration * 64 > 1.6e14);
});

test('activated tiles have an explicit B3a merge prerequisite for both collector rows', () => {
  const table = JSON.parse(readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', 'kugelblitz.json'), 'utf8'));
  assert.deepEqual(table.pendingRoutes, [{
    package: 'B3a',
    id: 'grindless:activated_absorber_tile',
    recipes: ['grindless:hawking_power/feed_exotic_matter', 'grindless:hawking_power/feed_stellar_plasma']
  }]);
});

test('collector balances include the fuel chain, exact catalyst wear and shell credit', (t) => {
  for (const row of BALANCE) {
    const r = rec('hawking_power', row.name);
    const duration = Math.ceil(row.target * row.fullCost / r.eut / 100) * 100;
    const euOut = r.eut * r.duration;
    const ratio = euOut / row.fullCost;
    t.diagnostic(`${row.name}: fullCost=${row.fullCost}, duration=${duration}, EU out=${euOut}, ratio=${ratio}`);
    assert.equal(r.duration, duration, row.name);
    assert.ok(ratio >= 1.3 && ratio <= 2.5, `${row.name}: ${ratio}`);
    assert.ok(ratio >= row.target && (r.duration - 100) * r.eut / row.fullCost < row.target, row.name);
  }
});

test('no spin, no rotation, no Sgr A* anywhere in the package', () => {
  const text = JSON.stringify(KB.recipes) + JSON.stringify(run.lang.en_us['emi.grindless.info.hawking_collector.0']) + JSON.stringify(run.lang.en_us['emi.grindless.info.kugelblitz_forge.0']);
  assert.ok(!/superradian|sgr_a|sgra|rotation_energy|penrose/i.test(text));
  assert.match(run.lang.en_us['emi.grindless.info.hawking_collector.0'], /non-?spinning|does not spin|no spin/i);
});

test('the controllers: OpV hull, OpV circuits, domain items, station research, 2,400 t at 503,316,480 EU/t', () => {
  assert.deepEqual(plain(KB.controllerRecipes), MACHINES.map((m) => `grindless:assembly_line/${m}`));
  const want = { kugelblitz_forge: ['laue_lens', 'gamma_multilayer_mirror', 'tetron_array', 'frc_cartridge', 'opv_emitter'], hawking_collector: ['kugelblitz_core', 'gamma_absorber_tile', 'tpv_panel', 'stable_exotic_matter', 'opv_electric_pump'] };
  for (const m of MACHINES) {
    const r = find(`grindless:assembly_line/${m}`);
    assert.ok(r && r.t === 'gtceu:assembly_line', m);
    const text = JSON.stringify(r.j);
    assert.ok(text.includes(`gtceu:${m}`));
    for (const need of ['gtceu:opv_machine_hull', 'gtceu:circuits/opv', 'opv_field_generator', 'opv_sensor', 'gtceu:superfluid_helium_3', 'gtceu:data_module', ...want[m]]) assert.ok(text.includes(need), `${m} takes ${need}`);
    assert.ok(!/uxv_|uiv_/.test(text), `${m} takes no older-tier component`);
    assert.ok(text.includes('503316480'), m);
    const ids = new Set(text.match(/"(?:id|tag|item)":"[^"]+"/g) || []);
    assert.ok(ids.size >= 9, `${m}: ${ids.size} distinct ingredients`);
  }
});

test('"only from": the ids of this package come from these rows alone', () => {
  const only = {
    'grindless:gamma_pump_charge': 'kugelblitz_forming/charge_gamma_pump', 'grindless:kugelblitz_seed': 'kugelblitz_forming/focus_kugelblitz_seed',
    'grindless:hawking_drive': 'kugelblitz_forming/forge_hawking_drive', 'gtceu:kugelblitz_forge': 'assembly_line/kugelblitz_forge', 'gtceu:hawking_collector': 'assembly_line/hawking_collector'
  };
  for (const [id, tail] of Object.entries(only)) {
    const ps = producers(id).map((r) => r.i);
    assert.ok(ps.length >= 1, `${id} has a producer`);
    assert.deepEqual(ps.filter((i) => !i.endsWith(tail)), [], `${id} only from ${tail}`);
  }
  const core = producers('grindless:kugelblitz_core').map((r) => r.i).sort();
  assert.deepEqual(core, ['grindless:kugelblitz_forming/condense_kugelblitz_core', 'grindless:kugelblitz_forming/recondense_core_from_shell']);
});

test('structures: spheres, not boring, three functional kinds, controller in the front slice', () => {
  const size = { kugelblitz_forge: 15, hawking_collector: 11 };
  for (const m of MACHINES) {
    const s = run.global.grindless.structures[`gtceu:${m}`];
    assert.ok(s, `${m} has a description`);
    const mm = measure(s);
    assert.deepEqual(violations(mm), [], `${m}: ${JSON.stringify(mm)}`);
    assert.ok(mm.dominantShare <= 0.62, `${m}: dominant share ${mm.dominantShare}`);
    assert.ok(mm.functional.length >= 3, `${m}: ${mm.functional}`);
    assert.equal(s.slices.length, size[m], `${m} is ${size[m]} slices deep`);
    assert.ok(s.slices[s.slices.length - 1].some((row) => row.includes('S')), `${m}: the controller is in the front slice`);
    const xs = s.slices.reduce((n, sl) => n + sl.join('').split('X').length - 1, 0);
    assert.ok(xs >= 4, `${m}: ${xs} hatch cells`);
  }
});

test('lang parity: names, tooltips, EMI pages, items and recipe lines in both languages', () => {
  const keys = ['gtceu.kugelblitz_forming', 'gtceu.hawking_power', 'emi.grindless.info.hawking_drive.0', 'emi.grindless.info.hawking_drive.1'];
  for (const m of MACHINES) keys.push(`block.gtceu.${m}`, `grindless.machine.${m}.tooltip.0`, `emi.grindless.info.${m}.0`, `emi.grindless.info.${m}.1`);
  for (const i of ['gamma_pump_charge', 'kugelblitz_seed', 'evaporated_core_shell']) keys.push(`item.grindless.${i}`, `tooltip.grindless.${i}.0`, `tooltip.grindless.${i}.1`);
  for (const r of KB.recipes) keys.push(`gtceu.recipe.${r.dataKey}.${r.name}`);
  for (const k of keys) for (const lang of ['en_us', 'es_es']) assert.ok(run.lang[lang][k], `${lang} has ${k}`);
  const re = /kugelblitz|hawking|gamma_pump|evaporated_core/;
  assert.deepEqual(Object.keys(run.lang.en_us).filter((k) => re.test(k)).sort(), Object.keys(run.lang.es_es).filter((k) => re.test(k)).sort());
});
