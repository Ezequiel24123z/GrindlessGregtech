// TP-R-uiv: the UIV machine recipes of the tier parity retrofit use UIV components, hull, circuits and EU/t (TP-D3).
import assert from 'node:assert/strict';
import test from 'node:test';
import { factsFromPack, loadConfig } from '../recipe-quality.mjs';
import { circuitTier, evaluate, tierComponent, vaOf } from '../lib/recipe_quality.mjs';

const UIV = 11;
const facts = factsFromPack();
const cfg = loadConfig();
const uiv = (r) => /\/server_scripts\/grindless\/uiv\//.test(String(r.file).replace(/\\/g, '/'));
const CONTROLLERS = [
  'crust_lift', 'decay_heat_vault', 'droplet_radiator_works', 'ergosphere_probe_bay', 'matrioshka_computer', 'neutron_drip_separator',
  'neutronium_cage', 'neutronium_compression_hall', 'penrose_engine', 'polarised_proton_source', 'positronium_condensate_lab',
  'pulsar_wind_trap', 'r_process_decompressor', 'uiv_fusion_reactor', 'xray_pulse_profiler'
];
// Cycles (baseline keys kept): these controllers make the optical mainframe's parts (beuv, stm, femtosecond writer, tfln fab, spectral hole
// burner, millikelvin cryostat) or the rhea / metallic hydrogen the UIV hull and components need (levitation melter, ramp compression pulser),
// so they keep their older components and circuits; only their EU/t was raised.
const CYCLE_KEPT = ['beuv_scanner', 'stm_lithography_cell', 'femtosecond_writer', 'tfln_fab', 'millikelvin_cryostat_works', 'spectral_hole_burner',
  'levitation_melter', 'ramp_compression_pulser'];
const KEPT_KEYS = new Set([...CYCLE_KEPT, 'uiv_machine_hull'].map((n) => `grindless:assembly_line/${n}`));
// parts and singles: at least 2 UIV components and a UIV circuit
const PARTS = ['matrioshka_node', 'matrioshka_tpv_shell', 'logic_tile_block', 'emitter_shell', 'radiator_module'];
const HATCH = 'uiv_parallel_hatch';
const VOLT_ONLY = ['grindless:assembly_line/uxv_machine_casing', 'grindless:assembler/metallic_hydrogen_coil_block',
  'grindless:assembler/neutron_star_site_casing', 'grindless:assembler/uiv_fusion_casing_divertor', 'grindless:assembler/uiv_fusion_casing_wall'];
const byId = (id) => facts.recipes.find((r) => r.id === id);
const line = (name) => byId(`grindless:assembly_line/${name}`);
const comps = (r) => r.items.map((i) => ({ c: tierComponent(i.id), n: i.n || 1 })).filter((x) => x.c);
const total = (cs) => cs.reduce((s, x) => s + x.n, 0);

test('no uiv T-* finding is left except the cycle-kept recipes (the metallic hydrogen coil block is fixed)', () => {
  const left = evaluate(facts, cfg).filter((f) => f.era === 'uiv' && f.code.startsWith('T-') && !KEPT_KEYS.has(f.recipe));
  assert.deepEqual(left.map((f) => `${f.recipe}|${f.code}`), []);
});

for (const name of CONTROLLERS) {
  test(`controller ${name}: UIV components from 3 families, 4 UIV circuits, UIV hull and EU/t`, () => {
    const r = line(name);
    assert.ok(r, 'recipe exists');
    const cs = comps(r);
    assert.ok(cs.every((x) => x.c.tier >= UIV), 'a component below UIV');
    assert.ok(total(cs) >= 8, 'fewer than 8 components');
    assert.ok(new Set(cs.map((x) => x.c.family)).size >= 3, 'fewer than 3 families');
    const circuits = r.items.filter((i) => circuitTier(i.id, cfg) === UIV).reduce((s, i) => s + (i.n || 1), 0);
    assert.ok(circuits >= 4, 'fewer than 4 UIV circuits');
    assert.ok(r.items.filter((i) => /_machine_hull$/.test(i.id)).every((i) => i.id === 'gtceu:uiv_machine_hull'));
    assert.ok(r.eut >= vaOf(UIV), 'EU/t below VA[UIV]');
  });
}

for (const name of CYCLE_KEPT) {
  test(`cycle-kept controller ${name}: EU/t at VA[UIV]`, () => {
    assert.ok(line(name).eut >= vaOf(UIV));
  });
}

for (const name of PARTS) {
  test(`${name}: UIV components only, at least 2, a UIV circuit`, () => {
    const r = line(name);
    assert.ok(r, 'recipe exists');
    const cs = comps(r);
    assert.ok(cs.every((x) => x.c.tier >= UIV));
    assert.ok(total(cs) >= 2);
    assert.ok(r.items.some((i) => circuitTier(i.id, cfg) === UIV), 'no UIV circuit');
  });
}

test('the four casing and part recipes of the matrioshka run on UIV components; the hatch too', () => {
  const r = line(HATCH);
  assert.ok(r && comps(r).every((x) => x.c.tier >= UIV) && total(comps(r)) >= 2);
  assert.ok(r.eut >= vaOf(UIV));
  for (const name of ['matrioshka_node', 'matrioshka_tpv_shell', 'logic_tile_block', 'emitter_shell', 'radiator_module']) {
    assert.ok(line(name).eut >= vaOf(UIV), name);
  }
});

test('casings and the UXV casing run at VA[UIV] with no component below UIV', () => {
  for (const id of VOLT_ONLY) {
    const r = byId(id);
    assert.ok(r, `${id} exists`);
    assert.ok(r.eut >= vaOf(UIV), `${id} EU/t`);
    assert.ok(r.items.every((i) => { const c = tierComponent(i.id); return !c || c.tier >= UIV; }), `${id} component`);
  }
});

test('the droplet radiator module is an assembly line now (the works runs the TPV tile only)', () => {
  assert.equal(byId('grindless:droplet_radiator_assembly/radiator_module'), undefined);
  assert.ok(uiv(line('radiator_module')));
});

test('every listed controller is a uiv-era recipe', () => {
  for (const name of CONTROLLERS) assert.ok(uiv(line(name)), name);
});
