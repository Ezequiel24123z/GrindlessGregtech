// TP-R-uhv: the UHV machine recipes of the tier parity retrofit use UHV components, hull, circuits and EU/t (TP-D3).
import assert from 'node:assert/strict';
import test from 'node:test';
import { factsFromPack, loadConfig } from '../recipe-quality.mjs';
import { circuitTier, evaluate, tierComponent, vaOf } from '../lib/recipe_quality.mjs';

const UHV = 9;
const facts = factsFromPack();
const cfg = loadConfig();
const uhv = (r) => /\/server_scripts\/grindless\/uhv\//.test(String(r.file).replace(/\\/g, '/'));
const CONTROLLERS = [
  'positron_accumulator', 'casimir_array', 'ultrapure_water_plant', 'betavoltaic_fab', 'nuclear_clock_lab', 'crystal_growth_furnace',
  'pbo_plant', 'tether_ribbon_works', 'space_elevator', 'warp_gate', 'baseline_astrometer', 'quantum_fabricator', 'regolith_excavator',
  'solar_vapour_furnace', 'photonic_foundry', 'mbe_reactor', 'sic_device_fab', 'solar_array_fab', 'spark_plasma_sinterer', 'cold_trap_drill',
  'biomining_heap', 'xenoflora_rover_bay', 'xenobiochem_plant', 'xenobotany_greenhouse', 'radiotrophic_vat', 'sample_receiving_facility',
  'swarm_segment_foundry', 'swarm_control_station', 'solar_probe_bay', 'high_flux_reactor', 'transuranium_facility', 'organoid_array',
  'zblan_draw_tower'
];
const OTHERS = ['uhv_parallel_hatch', 'uev_machine_casing'];
const CASINGS = ['grindless:assembler/warp_gate_casing', 'grindless:assembler/field_ring_casing', 'grindless:assembler/bsl4_casing', 'grindless:assembler/hangar_casing'];
const byId = (id) => facts.recipes.find((r) => r.id === id);

test('no T-* finding is left in the uhv era', () => {
  const left = evaluate(facts, cfg).filter((f) => f.era === 'uhv' && f.code.startsWith('T-'));
  assert.deepEqual(left.map((f) => `${f.recipe}|${f.code}`), []);
});

for (const name of CONTROLLERS) {
  test(`controller ${name}: UHV components from 3 families, 4 UHV circuits, UHV hull and EU/t`, () => {
    const r = byId(`grindless:assembly_line/${name}`);
    assert.ok(r, 'recipe exists');
    const comps = r.items.map((i) => ({ c: tierComponent(i.id), n: i.n || 1 })).filter((x) => x.c);
    assert.ok(comps.every((x) => x.c.tier >= UHV), 'a component below UHV');
    assert.ok(comps.reduce((s, x) => s + x.n, 0) >= 8, 'fewer than 8 components');
    assert.ok(new Set(comps.map((x) => x.c.family)).size >= 3, 'fewer than 3 families');
    const circuits = r.items.filter((i) => circuitTier(i.id, cfg) === UHV).reduce((s, i) => s + (i.n || 1), 0);
    assert.ok(circuits >= 4, 'fewer than 4 UHV circuits');
    assert.ok(r.items.filter((i) => /_machine_hull$/.test(i.id)).every((i) => i.id === 'gtceu:uhv_machine_hull'));
    assert.ok(r.eut >= vaOf(UHV), 'EU/t below VA[UHV]');
  });
}

for (const name of OTHERS) {
  test(`${name}: UHV components only, at least 2, EU/t at VA[UHV]`, () => {
    const r = byId(`grindless:assembly_line/${name}`);
    assert.ok(r, 'recipe exists');
    const comps = r.items.map((i) => ({ c: tierComponent(i.id), n: i.n || 1 })).filter((x) => x.c);
    assert.ok(comps.every((x) => x.c.tier >= UHV));
    assert.ok(comps.reduce((s, x) => s + x.n, 0) >= 2);
    assert.ok(r.eut >= vaOf(UHV));
  });
}

test('the four UHV casing assemblers run at VA[UHV] with UHV components only', () => {
  for (const id of CASINGS) {
    const r = byId(id);
    assert.ok(r, `${id} exists`);
    assert.ok(r.eut >= vaOf(UHV), `${id} EU/t`);
    assert.ok(r.items.every((i) => { const c = tierComponent(i.id); return !c || c.tier >= UHV; }), `${id} component`);
  }
});

test('every listed recipe is a uhv-era recipe', () => {
  for (const name of CONTROLLERS) assert.ok(uhv(byId(`grindless:assembly_line/${name}`)), name);
});
