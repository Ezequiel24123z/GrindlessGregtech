// TP-R-uev: the UEV machine recipes of the tier parity retrofit use UEV components, hull, circuits and EU/t (TP-D3).
import assert from 'node:assert/strict';
import test from 'node:test';
import { factsFromPack, loadConfig } from '../recipe-quality.mjs';
import { circuitTier, evaluate, tierComponent, vaOf } from '../lib/recipe_quality.mjs';

const UEV = 10;
const facts = factsFromPack();
const cfg = loadConfig();
// Controllers after the UEV hull; the ones before it (the component chain) keep their baseline keys: they cannot take the
// components, hull or circuits they themselves make possible (a cycle in the obtain model).
const CONTROLLERS = [
  'barnard_core_drill', 'carbonyl_refinery', 'containment_works', 'degenerate_harvester', 'interstellar_dust_lab', 'nebula_collector',
  'pulsar_timing_station', 'stellar_forge', 'uev_fusion_reactor', 'white_dwarf_spectrograph'
];
const CYCLIC = [
  'grindless:assembler/hftacn_coil_block', 'grindless:assembler/photonic_casing', 'grindless:assembler/uev_machine_casing',
  'grindless:assembly_line/calutron', 'grindless:assembly_line/cvi_furnace', 'grindless:assembly_line/electron_beam_furnace',
  'grindless:assembly_line/entanglement_station', 'grindless:assembly_line/heavy_ion_cyclotron', 'grindless:assembly_line/helium3_polariser',
  'grindless:assembly_line/megabar_press', 'grindless:assembly_line/nitride_magnet_works', 'grindless:assembly_line/photonic_integration_hall',
  'grindless:assembly_line/quantum_gas_lab', 'grindless:assembly_line/recoil_separator', 'grindless:assembly_line/sic_fibre_plant',
  'grindless:assembly_line/single_crystal_foundry', 'grindless:assembly_line/snspd_foundry', 'grindless:assembly_line/superheavy_chemistry_lab',
  'grindless:assembly_line/vdw_stacker'
];
const HATCHES = ['uev_energy_input_hatch', 'uev_energy_input_hatch_16a', 'uev_energy_output_hatch', 'uev_energy_output_hatch_16a', 'uev_machine_hull'];
const PARTS = [
  'grindless:assembler/degenerate_containment_casing', 'grindless:assembler/uev_fusion_casing', 'grindless:assembly_line/uev_parallel_hatch',
  'grindless:assembly_line/uiv_machine_casing'
];
const byId = (id) => facts.recipes.find((r) => r.id === id);
const comps = (r) => r.items.map((i) => ({ c: tierComponent(i.id), n: i.n || 1 })).filter((x) => x.c);
const count = (r) => comps(r).reduce((s, x) => s + x.n, 0);

test('the only uev T-* findings left are the component-chain recipes that would be cyclic', () => {
  const left = evaluate(facts, cfg).filter((f) => f.era === 'uev' && f.code.startsWith('T-'));
  assert.deepEqual([...new Set(left.map((f) => f.recipe))].sort(), [...CYCLIC].sort());
});

for (const name of CONTROLLERS) {
  test(`controller ${name}: UEV components from 3 families, 4 UEV circuits, UEV hull and EU/t`, () => {
    const r = byId(`grindless:assembly_line/${name}`);
    assert.ok(r, 'recipe exists');
    assert.ok(comps(r).every((x) => x.c.tier >= UEV), 'a component below UEV');
    assert.ok(count(r) >= 8, 'fewer than 8 components');
    assert.ok(new Set(comps(r).map((x) => x.c.family)).size >= 3, 'fewer than 3 families');
    const circuits = r.items.filter((i) => circuitTier(i.id, cfg) === UEV).reduce((s, i) => s + (i.n || 1), 0);
    assert.ok(circuits >= 4, 'fewer than 4 UEV circuits');
    assert.ok(r.items.filter((i) => /_machine_hull$/.test(i.id)).every((i) => i.id === 'gtceu:uev_machine_hull'));
    assert.ok(r.eut >= vaOf(UEV), 'EU/t below VA[UEV]');
  });
}

for (const name of HATCHES) {
  test(`${name}: UEV components (at least 2) and a UEV circuit, EU/t at VA[UHV] or more`, () => {
    const r = byId(`grindless:assembly_line/${name}`);
    assert.ok(r, 'recipe exists');
    assert.ok(comps(r).every((x) => x.c.tier >= UEV));
    assert.ok(count(r) >= 2);
    assert.ok(r.items.some((i) => circuitTier(i.id, cfg) === UEV), 'no UEV circuit');
    assert.ok(r.eut >= vaOf(UEV - 1));
  });
}

for (const id of PARTS) {
  test(`${id}: UEV components only and EU/t at VA[UEV]`, () => {
    const r = byId(id);
    assert.ok(r, 'recipe exists');
    assert.ok(comps(r).every((x) => x.c.tier >= UEV));
    assert.ok(r.eut >= vaOf(UEV), 'EU/t below VA[UEV]');
  });
}
