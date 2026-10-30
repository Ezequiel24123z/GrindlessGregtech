// LuV A2: every item and fluid id the composed recipes use is a real one. The naquadah plant's three modes and the platinum plant's
// attack, mode 3 and mode 4 are composed by the pack's own scripts with Item.exists / Fluid.exists answering only from ids checked in a
// native registry export (tools/analysis/fixtures/luv-a2-registry-ids.json) and A1's registrations (startup_scripts/grindless/luv/
// foundation.js, run here): a misspelt or unregistered id skips its mode and fails, where a permissive stand-in would accept it.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { runServerScripts } from '../lib/kubejs_recipes_sandbox.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PACK = path.join(ROOT, 'pack');
const fixture = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/analysis/fixtures', f), 'utf8'));
const IDS = fixture('luv-a2-registry-ids.json');
const NAQ = fixture('gtnn-1.3.10-naquadah-line.json');
const PGM = fixture('platinum-plant-line.json');

// A1's published ids, from its own startup script
function a1Items() {
  const { G } = runServerScripts({
    packRoot: PACK, scripts: [], startup: ['kubejs/startup_scripts/grindless/luv/foundation.js'], recipes: {},
    before(sandbox) { sandbox.global.grindless.tables = {}; },
  });
  return G.luvFoundation.items;
}

function mercuryFusion() {
  const ctx = { global: { grindless: {} }, ServerEvents: { recipes() {} }, console: { info() {}, warn() {}, error() {}, log() {} } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(PACK, 'kubejs/server_scripts/grindless/iv/mercury.js'), 'utf8'), ctx);
  return JSON.parse(JSON.stringify(ctx.global.grindless.mercury.fusion));
}

const A1 = a1Items();
// ZPM-A2's mode 4 (enriched solution) output: a GTM material dust, resolved natively in gg_test_zpm_naquadria (no skipped ids)
const ZPM_A2 = ['gtceu:enriched_naquadah_dust'];
// UEV-A4's platinum plant rows (circuits 7 and 8): its two residues (startup_scripts/grindless/uev/electron_beam.js) and GTM's
// ruthenium dust, already in the plant's ITEM_ORDER
const UEV_A4 = ['grindless:sx_dross', 'grindless:eb_skull', 'gtceu:ruthenium_dust'];
// UEV-B3's platinum plant row (circuit 9): the Barnard residue in, crude ammonium perrhenate out (startup_scripts/grindless/uev/barnard.js),
// plus three GTM materials the snapshot predates (present in the 20261028-083545 native dump items.json)
const UEV_B3 = ['grindless:barnard_residue', 'grindless:crude_ammonium_perrhenate', 'gtceu:platinum_dust', 'gtceu:tungsten_dust'];
// UIV-B2's platinum plant row (circuit 10): the r-process ash (startup_scripts/grindless/uiv/rx_j1856.js)
const UIV_B2 = ['grindless:r_process_ash'];
// UXV-A2's platinum plant rows (circuits 11-14): the three 5N metals (startup_scripts/grindless/uxv/spin_feed.js) and the sludge's two metals
const UXV_A2 = ['grindless:five_n_platinum', 'grindless:five_n_ruthenium', 'grindless:five_n_iridium', 'gtceu:platinum_group_sludge_dust', 'gtceu:iridium_dust'];
// OpV-A2's platinum plant row (circuit 17): the cryo-CMOS gold overspray (startup_scripts/grindless/opv/circuits.js) and GTM's small gold dust
const OPV_A2 = ['grindless:gold_overspray', 'gtceu:small_gold_dust'];
const ITEMS = new Set([...IDS.items, ...A1, ...ZPM_A2, ...UEV_A4, ...UEV_B3, ...UIV_B2, ...UXV_A2, ...OPV_A2]);
const FLUIDS = new Set([...IDS.fluids, 'gtceu:nitric_acid', 'gtceu:diluted_hydrochloric_acid']);

function strictRun(scripts, startup, recipes, before) {
  const asked = { items: new Set(), fluids: new Set() };
  const r = runServerScripts({
    packRoot: PACK, scripts, startup, recipes, before,
    items: (id) => { asked.items.add(id); return ITEMS.has(id); },
    fluids: (id) => { asked.fluids.add(id); return FLUIDS.has(id); },
  });
  return { ...r, asked };
}

test('A1 registers the asteroid PGM concentrate mode 4 takes', () => {
  assert.ok(A1.includes('grindless:asteroid_pgm_concentrate'));
  assert.ok(!IDS.items.includes('grindless:asteroid_pgm_concentrate'), 'the snapshot holds only ids of the native export');
});

test('naquadah plant: all its modes compose with only registered ids', () => {
  const { G, logs, asked } = strictRun(
    ['kubejs/server_scripts/grindless/lib/compose.js', 'kubejs/server_scripts/grindless/iv/naquadah_plant.js'],
    ['kubejs/startup_scripts/grindless/iv/naquadah_plant.js'], NAQ.recipes);
  assert.deepEqual(logs.filter(([l]) => l === 'error').map(([, m]) => m), []);
  assert.deepEqual(G.naquadahPlant.recipes.map((r) => r.name), ['naquadah', 'enriched_naquadah', 'spent_naquadah']);
  assert.deepEqual([...asked.items].filter((id) => !ITEMS.has(id)), []);
  assert.deepEqual([...asked.fluids].filter((id) => !FLUIDS.has(id)), []);
  // the charges and GT--'s catalyst tag resolve to real items
  const r = G.naquadahPlant.recipes.find((x) => x.name === 'enriched_naquadah');
  for (const c of r.charges) assert.ok(c.item ? ITEMS.has(c.item) : FLUIDS.has(c.fluid), JSON.stringify(c));
});

test('platinum plant: the attack, mode 3 and mode 4 compose with only registered ids', () => {
  const fusion = mercuryFusion();
  const { G, logs, asked } = strictRun(
    ['kubejs/server_scripts/grindless/lib/compose.js', 'kubejs/server_scripts/grindless/ev/platinum_plant.js'],
    ['kubejs/startup_scripts/grindless/ev/platinum_plant.js'], PGM.recipes,
    (sandbox) => { sandbox.global.grindless.mercury = { fusion }; });
  const names = G.platinumPlant.recipes.map((r) => r.name);
  for (const n of ['attack_pentlandite', 'iridosmine', 'asteroid']) assert.ok(names.includes(n), `${n} composed (${names.join(', ')})`);
  for (const s of G.platinumPlant.skipped) assert.ok(!/unknown id/.test(s.reason), `${s.name}: ${s.reason}`);
  assert.deepEqual(logs.filter(([l]) => l === 'error').map(([, m]) => m), []);
  assert.deepEqual([...asked.items].filter((id) => !ITEMS.has(id)), []);
  assert.deepEqual([...asked.fluids].filter((id) => !FLUIDS.has(id)), []);
});

test('the LuV parallel hatch the plants take is a registered GTM item', () => {
  const lib = fs.readFileSync(path.join(PACK, 'kubejs/startup_scripts/grindless/lib/parallel_hatch.js'), 'utf8');
  assert.match(lib, /'gtceu:luv_parallel_hatch'/);
  assert.match(lib, /luvRecipe: 'gtceu:shaped\/parallel_hatch_mk2'/);
  assert.ok(IDS.items.includes('gtceu:luv_parallel_hatch'));
});
