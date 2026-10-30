// TP-R-uxv: the UXV machine recipes of the tier parity retrofit use UXV components, hull, circuits and EU/t (TP-D3).
import assert from 'node:assert/strict';
import test from 'node:test';
import { factsFromPack, loadConfig } from '../recipe-quality.mjs';
import { circuitTier, evaluate, tierComponent, vaOf } from '../lib/recipe_quality.mjs';

const UXV = 12;
const facts = factsFromPack();
const cfg = loadConfig();
// Controllers upstream of the component chain (spintronic mainframe, lasagna plate, strand coil, FRC cartridge, shequid gyro, MTJ die, gamma laser module, strand,
// filtered disk, stellar cuts) keep their UIV hull and parts: re-tiering them made the obtain model cyclic (TP-R-uxv, three obtain runs).
const UPSTREAM = ['accretion_disk_skimmer', 'annihilation_laser_works', 'ejecta_knot_sweeper', 'frc_former', 'mtj_sputter_cluster', 'pasta_draw_bench',
  'pasta_extractor', 'pasta_laminator', 'pasta_phase_sorter', 'plasma_mass_filter', 'racetrack_fab', 'shequid_works', 'stellar_elevator', 'vdw_stacking_cell', 'yig_lpe_furnace'];
const CONTROLLERS = ['stellar_fractionation_hall', 'uxv_fusion_reactor'];
const byId = (id) => facts.recipes.find((r) => r.id === id);
const comps = (r) => r.items.map((i) => ({ c: tierComponent(i.id), n: i.n || 1 })).filter((x) => x.c);
const count = (r) => comps(r).reduce((s, x) => s + x.n, 0);

test('the re-tiered uxv recipes have no T-* finding', () => {
  const left = evaluate(facts, cfg).filter((f) => f.era === 'uxv' && f.code.startsWith('T-'));
  const done = [...CONTROLLERS.map((n) => `grindless:assembly_line/${n}`), 'grindless:assembly_line/uxv_machine_hull', 'grindless:assembly_line/uxv_parallel_hatch', 'grindless:assembler/uxv_fusion_casing'];
  assert.deepEqual(left.filter((f) => done.includes(f.recipe)), []);
  assert.ok(UPSTREAM.every((n) => left.some((f) => f.recipe === `grindless:assembly_line/${n}`)), 'an upstream controller left the baseline without a cycle-free design');
});

for (const name of CONTROLLERS) {
  test(`controller ${name}: UXV components, 4 UXV circuits, hull and EU/t`, () => {
    const r = byId(`grindless:assembly_line/${name}`);
    assert.ok(r, 'recipe exists');
    assert.ok(comps(r).every((x) => x.c.tier >= UXV), 'a component below UXV');
    assert.ok(count(r) >= 8, 'fewer than 8 components');
    assert.ok(new Set(comps(r).map((x) => x.c.family)).size >= 3, 'too few families');
    const circuits = r.items.filter((i) => circuitTier(i.id, cfg) === UXV).reduce((s, i) => s + (i.n || 1), 0);
    assert.ok(circuits >= 4, 'fewer than 4 UXV circuits');
    assert.ok(r.eut >= vaOf(UXV), 'EU/t below VA[UXV]');
    assert.ok(r.items.filter((i) => /_machine_hull$/.test(i.id)).every((i) => i.id === 'gtceu:uxv_machine_hull'), 'hull below UXV');
  });
}

test('uxv_machine_hull: 2 UXV sensors and a UXV circuit', () => {
  const r = byId('grindless:assembly_line/uxv_machine_hull');
  assert.ok(r, 'recipe exists');
  assert.ok(comps(r).every((x) => x.c.tier >= UXV));
  assert.ok(count(r) >= 2);
  assert.ok(r.items.some((i) => circuitTier(i.id, cfg) === UXV), 'no UXV circuit');
  assert.ok(r.eut >= vaOf(UXV - 1));
});

test('uxv_parallel_hatch: UXV components and EU/t at VA[UXV]', () => {
  const r = byId('grindless:assembly_line/uxv_parallel_hatch');
  assert.ok(r, 'recipe exists');
  assert.ok(comps(r).every((x) => x.c.tier >= UXV));
  assert.ok(count(r) >= 2);
  assert.ok(r.eut >= vaOf(UXV), 'EU/t below VA[UXV]');
});

test('uxv_fusion_casing: EU/t at VA[UXV]', () => {
  const r = byId('grindless:assembler/uxv_fusion_casing');
  assert.ok(r, 'recipe exists');
  assert.ok(r.eut >= vaOf(UXV), 'EU/t below VA[UXV]');
});
