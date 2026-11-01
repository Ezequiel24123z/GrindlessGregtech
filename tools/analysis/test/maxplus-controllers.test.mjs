// XP-Q: every MAX+ controller follows the design's base (docs/eras/maxplus.md, Controllers): MAX hull, 2 horizon_machine_casing, 8 horizon_processor,
// 2,000 mB kerr_condensate, at least 8 MAX+ components from 3 families, assembly line at VA[MAX], 4,800 t, station research.
// Named bootstrap exceptions (maxplus.md Bootstrap check): the condensate refinery and the bound-matter press keep MAX parts and add 4 stream bundles.
// A future MAX+ machine package that publishes its controller to ../maxplus/*.js must pass this test: add it to CONTROLLERS below.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const run = runPackScripts(pack);

const BASE = ['meta_material_loom', 'condensate_assembler', 'hills_slingshot', 'hyperfactory', 'tarantula_stellar_lift', 'pair_instability_crucible', 'nickel_56_burner', 'blueshift_forge', 'void_crystal_fab', 'pristine_gas_works', 'primordial_fusion_torus', 'multi_plasma_blender', 'horizon_crystal_furnace', 'horizon_capacitor_bank'];
const BOOTSTRAP = ['condensate_refinery', 'bound_matter_press'];
const FILE = { meta_material_loom: 'loom.js', condensate_assembler: 'assembler.js', hills_slingshot: 'slingshot.js', hyperfactory: 'hyperfactory.js', tarantula_stellar_lift: 'tarantula.js', pair_instability_crucible: 'tarantula.js', nickel_56_burner: 'tarantula.js', blueshift_forge: 'blueshift.js', void_crystal_fab: 'void_fab.js', pristine_gas_works: 'stream.js', primordial_fusion_torus: 'stream.js', multi_plasma_blender: 'crystals.js', horizon_crystal_furnace: 'crystals.js', horizon_capacitor_bank: 'capacitor_bank.js' };
const DURATION = {
  meta_material_loom: /EUt\(VA_MAX\)\.duration\(4800\)/,
  condensate_assembler: /EUt\(VA_MAX\)\.duration\(4800\)/,
  hills_slingshot: /c\.machine, c\.research, 64, 4800\)/,
  hyperfactory: /EUt\(VA_MAX\)\.duration\(4800\)/,
  tarantula_stellar_lift: /c\.machine, c\.research, 64, 4800\)/,
  pair_instability_crucible: /c\.machine, c\.research, 64, 4800\)/,
  nickel_56_burner: /c\.machine, c\.research, 64, 4800\)/,
  blueshift_forge: /c\.machine, c\.research, 64, 4800\)/,
  void_crystal_fab: /c\.machine, c\.research, 64, 4800\)/,
  pristine_gas_works: /c\.machine, c\.research, 64, 4800\)/,
  primordial_fusion_torus: /c\.machine, c\.research, 64, 4800\)/,
  multi_plasma_blender: /a\.EUt\(VA_MAX\)\.duration\(4800\)/,
  horizon_crystal_furnace: /a\.EUt\(VA_MAX\)\.duration\(4800\)/,
  horizon_capacitor_bank: /a\.EUt\(VA_MAX\)\.duration\(4800\)/,
};

const nameOf = (ing) => {
  if (!ing) return null;
  if (Array.isArray(ing)) return nameOf(ing[0]);
  if (ing.ingredient) return nameOf(ing.ingredient);
  if (ing.item) return String(ing.item);
  if (ing.tag) return '#' + ing.tag;
  return null;
};

function controller(name) {
  const r = run.docs.recipes.recipes.find((x) => x.i === `grindless:assembly_line/${name}`);
  assert.ok(r, `no assembly line recipe for ${name}`);
  const items = new Map();
  for (const c of r.j.inputs.item) {
    const id = c.content.type === 'gtceu:circuit' ? 'circuit' : nameOf(c.content);
    items.set(id, (items.get(id) || 0) + (Number(c.content.count) || 1));
  }
  const fluids = r.j.inputs.fluid.map((f) => ({ text: JSON.stringify(f.content), amount: Number(/"amount":(\d+)/.exec(JSON.stringify(f.content))?.[1]) }));
  const eut = r.j.tickInputs.eu.reduce((s, e) => s + e.content, 0);
  return { r, items, fluids, eut };
}

const maxplus = (items) => [...items].filter(([id]) => /^grindless:maxplus_/.test(id));
const familiesOf = (items) => new Set(maxplus(items).map(([id]) => id.replace(/^grindless:maxplus_/, '')));
const count = (items) => maxplus(items).reduce((s, [, n]) => s + n, 0);

test('the stand-in registers every MAX+ controller without errors', () => {
  const mine = run.errors.filter((e) => /maxplus[\\/]/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
});

for (const name of BASE) {
  test(`${name} follows the base: MAX hull, 2 casings, 8 horizon processors, 2,000 mB kerr, 8+ MAX+ components from 3 families`, () => {
    const c = controller(name);
    assert.equal(c.items.get('gtceu:max_machine_hull'), 1, 'MAX hull');
    assert.equal(c.items.get('grindless:horizon_machine_casing'), 2, '2 horizon_machine_casing');
    assert.equal(c.items.get('grindless:horizon_processor'), 8, '8 horizon_processor');
    assert.ok(c.fluids.some((f) => /kerr_condensate/.test(f.text) && f.amount === 2000), '2,000 mB kerr_condensate');
    assert.ok(count(c.items) >= 8, `at least 8 MAX+ components (has ${count(c.items)})`);
    assert.ok(familiesOf(c.items).size >= 3, `at least 3 families (has ${[...familiesOf(c.items)]})`);
    assert.ok(c.eut > 0, 'EUt set (VA[MAX] is checked in the script text below)');
    assert.ok(DURATION[name].test(fs.readFileSync(path.join(pack, 'kubejs', 'server_scripts', 'grindless', 'maxplus', FILE[name]), 'utf8')), '4,800 t (the stand-in does not record durations)');
    assert.ok(c.r.j.recipeConditions.some((x) => x.type === 'research'), 'station research kept');
  });
}

test('the loom takes neither maxplus_electric_pump nor maxplus_fluid_regulator (both need the loom\'s own horizon_valve)', () => {
  const c = controller('meta_material_loom');
  assert.ok(!c.items.has('grindless:maxplus_electric_pump'));
  assert.ok(!c.items.has('grindless:maxplus_fluid_regulator'));
});

for (const name of BOOTSTRAP) {
  test(`${name}: the bootstrap exception keeps MAX parts and adds 4 stream bundles, no MAX+ component`, () => {
    const c = controller(name);
    assert.equal(c.items.get('grindless:stream_bundle'), 4);
    assert.equal(count(c.items), 0, 'a MAX+ component would need this machine\'s bound matter or condensate');
    assert.ok([...c.items.keys()].some((id) => /^grindless:max_/.test(id)), 'MAX parts');
  });
}

test('no MAX+ assembly-line controller is built on MAX components: a MAX+ controller outside the lists above needs adding', () => {
  const known = new Set([...BASE, ...BOOTSTRAP]);
  const machines = new Set(run.docs.machines.machines.map((m) => m.id.replace(/^gtceu:/, '')));
  const unlisted = run.docs.recipes.recipes
    .filter((r) => r.t === 'gtceu:assembly_line' && r.i.startsWith('grindless:assembly_line/'))
    .map((r) => r.i.replace('grindless:assembly_line/', ''))
    .filter((n) => machines.has(n) && !known.has(n) && !/_hatch_/.test(n) && controllerLike(n));
  assert.deepEqual(unlisted, [], `MAX+ controllers not covered: ${unlisted.join(', ')}`);
});

// a machine whose assembly line a maxplus/ script publishes is a MAX+ controller
function controllerLike(n) {
  return /[\\/]maxplus[\\/]/.test(String(run.recipeFiles.get(`grindless:assembly_line/${n}`)));
}
