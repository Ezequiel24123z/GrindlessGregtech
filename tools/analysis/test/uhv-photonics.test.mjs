// UHV-A4 (docs/eras/uhv.md, "A4. Photonics"): the MBE reactor's, the photonic foundry's and the older machines' rows (the ZPM ion
// implanter's circuits 3-4, the electric blast furnace's GST target, the large chemical reactor's tellurium) of photonics.json, checked
// without Minecraft by static recipe lookup, with the pack's scripts run in the stand-in (lib/kubejs_static.mjs) so the ZPM implanter rows
// are in the lookup too. T1: none (UV-A1's table-driven machines, proof reuse).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const table = (name) => JSON.parse(fs.readFileSync(path.join(tables, name), 'utf8'));
const T = table('photonics.json');
const run = runPackScripts(pack);
const plain = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'function' ? undefined : v)));
const G = run.global.grindless;
const PH = plain(G.uhvPhotonics);
const Q = plain(G.qubits);
const startupOf = (...p) => fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', ...p), 'utf8');

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => (typeof x === 'string' ? x : x.id));
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn), ids(r.charge));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const rowsOf = (type) => T.types[type].recipes;
const by = (type, name) => {
  const r = rowsOf(type).find((x) => x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};
const madeBy = (id) => run.docs.recipes.recipes.filter((r) => JSON.stringify(r.j.outputs || {}).includes(`"${id}"`)).map((r) => r.i);

// every recipe-producing row of every table, as [table:where, recipe]
function allRows() {
  const out = [];
  for (const f of fs.readdirSync(tables).filter((n) => n.endsWith('.json'))) {
    const walk = (node, where) => {
      if (Array.isArray(node)) node.forEach((x, i) => walk(x, `${where}[${i}]`));
      else if (node && typeof node === 'object') {
        if (Array.isArray(node.itemsOut) || Array.isArray(node.fluidsOut)) out.push([`${f}:${where}`, node]);
        for (const [k, v] of Object.entries(node)) if (k !== 'itemsOut' && k !== 'fluidsOut') walk(v, `${where}.${k}`);
      }
    };
    walk(JSON.parse(fs.readFileSync(path.join(tables, f), 'utf8')), '');
  }
  return out;
}
const producers = (id) => allRows().filter(([, r]) => outputs(r).includes(id));

// lookup keys of a published recipe of either script (this package's table rows, ZPM qubits)
function keysOf(r) {
  const k = new Set([`circuit:${r.circuit}`]);
  ids(r.itemsIn).forEach((id) => k.add(`i:${id}`));
  ids(r.kept).concat(ids(r.notConsumedItems)).forEach((id) => k.add(`i:${id}`));
  ids(r.fluidsIn).concat(ids(r.charge), ids(r.notConsumedFluids)).forEach((id) => k.add(`f:${id}`));
  return k;
}

test('the scripts load: every row made, nothing skipped, no clash, both controllers', () => {
  const mine = run.errors.filter((e) => /uhv\/photonics|zpm\/qubits/.test(e.file || ''));
  assert.deepEqual(mine, []);
  const rows = Object.values(T.types).flatMap((t) => t.recipes);
  assert.equal(PH.recipes.length, rows.length);
  assert.deepEqual(PH.skipped, []);
  assert.deepEqual(PH.clashes, []);
  assert.deepEqual(PH.controllerRecipes, ['grindless:crafting/mbe_reactor', 'grindless:crafting/photonic_foundry']);
  const made = new Set(run.docs.recipes.recipes.map((r) => r.i));
  for (const r of PH.recipes) assert.ok(made.has(r.recipeId), r.recipeId);
  // the namespace global.grindless.photonics is UV's fibre tower and MOCVD; this package publishes as uhvPhotonics
  assert.ok(G.photonics && G.photonics !== G.uhvPhotonics);
});

test('one recipe per lookup path, with the ZPM implanter rows: unique circuits, no subset clash', () => {
  const all = PH.recipes.concat(Q.recipes);
  for (const type of ['molecular_beam_epitaxy', 'photonic_foundry', 'ion_implantation']) {
    const rs = all.filter((r) => r.type === type);
    const circuits = rs.map((r) => r.circuit);
    assert.equal(new Set(circuits).size, circuits.length, `${type}: ${circuits}`);
    const ks = rs.map(keysOf);
    const sub = (a, b) => [...a].every((k) => b.has(k));
    for (let i = 0; i < ks.length; i++) {
      for (let j = i + 1; j < ks.length; j++) assert.ok(!sub(ks[i], ks[j]) && !sub(ks[j], ks[i]), `${type}: ${rs[i].name} / ${rs[j].name}`);
    }
  }
  assert.deepEqual(all.filter((r) => r.type === 'ion_implantation').map((r) => r.circuit).sort(), [1, 2, 3, 4]);
  // UEV-A6 added MBE c3 and foundry c7 (UEV rows in the same table); UIV-A1 added MBE c4
  assert.deepEqual(rowsOf('molecular_beam_epitaxy').map((r) => r.circuit), [1, 2, 3, 4]);
  assert.deepEqual(rowsOf('photonic_foundry').map((r) => r.circuit), [1, 2, 3, 4, 5, 6, 7]);
  // GTM's own types take no circuit here; the blast furnace rows carry a temperature
  for (const type of ['electric_blast_furnace', 'large_chemical_reactor']) for (const r of rowsOf(type)) assert.equal(r.circuit, 0, r.name);
  for (const r of rowsOf('electric_blast_furnace')) assert.ok(r.temp > 0, r.name);
});

test('the recipes fit the machines\' slots (startup maxIO; the circuit takes an item slot)', () => {
  const io = {
    molecular_beam_epitaxy: [['uhv', 'photonics.js'], { itemsIn: 6, itemsOut: 2, fluidsIn: 1, fluidsOut: 1 }],
    photonic_foundry: [['uhv', 'photonics.js'], { itemsIn: 6, itemsOut: 3, fluidsIn: 3, fluidsOut: 1 }],
    ion_implantation: [['zpm', 'qubits.js'], { itemsIn: 3, itemsOut: 1, fluidsIn: 1, fluidsOut: 0 }]
  };
  for (const [type, [file, m]] of Object.entries(io)) {
    const startup = startupOf(...file);
    assert.ok(startup.includes(`maxIO: { itemsIn: ${m.itemsIn}, itemsOut: ${m.itemsOut}, fluidsIn: ${m.fluidsIn}, fluidsOut: ${m.fluidsOut} }`), type);
    for (const r of rowsOf(type)) {
      assert.ok(r.itemsIn.length + r.kept.length + 1 <= m.itemsIn, `${r.name} items in`);
      assert.ok(r.fluidsIn.length + r.charge.length <= m.fluidsIn, `${r.name} fluids in`);
      assert.ok(r.itemsOut.length <= m.itemsOut, `${r.name} items out`);
      assert.ok(r.fluidsOut.length <= m.fluidsOut, `${r.name} fluids out`);
    }
  }
  // GTM's blast furnace (3 items, 1 fluid in) and large chemical reactor (3 items, 5 fluids in; 3 items, 4 fluids out)
  for (const r of rowsOf('electric_blast_furnace')) assert.ok(r.itemsIn.length <= 3 && r.fluidsIn.length <= 1 && r.itemsOut.length <= 3, r.name);
  for (const r of rowsOf('large_chemical_reactor')) assert.ok(r.itemsIn.length <= 3 && r.fluidsIn.length <= 5 && r.itemsOut.length <= 3 && r.fluidsOut.length <= 4, r.name);
  // the MBE reactor refuses to void the scraped arsenic
  assert.ok(startupOf('uhv', 'photonics.js').includes("PH.reactorNoVoiding = 'grindless.machine.mbe_reactor.no_voiding'"));
});

test('the optical processor and the optical assembly come only from the photonic foundry', () => {
  for (const [id, name] of [['gtnn:optical_processor', 'optical_processor'], ['gtnn:optical_assembly', 'optical_assembly']]) {
    assert.deepEqual(producers(id).map(([w]) => w), [`photonics.json:.types.photonic_foundry.recipes[${name === 'optical_processor' ? 3 : 4}]`], id);
    assert.deepEqual(madeBy(id), [`grindless:photonic_foundry/${name}`], id);
  }
  const proc = by('photonic_foundry', 'optical_processor');
  for (const id of ['grindless:lnoi_wafer', 'grindless:pcm_photonic_die', 'grindless:quantum_cascade_laser', 'grindless:thin_film_ln_modulator']) assert.ok(inputs(proc).includes(id), id);
  const asm = by('photonic_foundry', 'optical_assembly');
  assert.ok(inputs(asm).includes('gtnn:optical_processor') && inputs(asm).includes('grindless:quantum_memory_chip'));
  // every part has exactly one maker in this package
  const parts = { 'grindless:qcl_superlattice_wafer': 'qcl_superlattice', 'grindless:quantum_cascade_laser': 'quantum_cascade_lasers',
    'grindless:lnoi_wafer': 'lnoi_wafer', 'grindless:pcm_photonic_die': 'pcm_dies', 'grindless:quantum_memory_chip': 'quantum_memory_chips',
    'grindless:thin_film_ln_modulator': 'thin_film_modulators', 'grindless:implanted_ln_wafer': 'ln_smart_cut', 'grindless:implanted_sic_wafer': 'sic_aluminium_implant' };
  for (const [id, name] of Object.entries(parts)) assert.deepEqual(producers(id).map(([, r]) => r.name), [name], id);
  assert.deepEqual(producers('grindless:gst_target').map(([, r]) => r.name), ['gst_target', 'gst_target_remelt']);
});

test('every photonic foundry recipe rinses with ultrapure water, which comes back as plain water', () => {
  for (const r of rowsOf('photonic_foundry')) {
    const up = r.fluidsIn.find((f) => f.id === 'gtceu:ultrapure_water');
    assert.ok(up && up.amount >= 1000, r.name);
    const w = r.fluidsOut.find((f) => f.id === 'minecraft:water');
    assert.ok(w && w.amount >= up.amount, r.name);
    assert.ok(!inputs(r).concat(outputs(r)).includes('gtceu:water'), r.name);
  }
  assert.deepEqual(madeBy('gtceu:ultrapure_water'), ['grindless:ultrapure_water/ultrapure_water']);
});

test('the ion implanter\'s rows: helium smart-cut of lithium niobate (3), aluminium into SiC (4)', () => {
  const ln = by('ion_implantation', 'ln_smart_cut');
  assert.deepEqual(inputs(ln), ['grindless:lithium_niobate_wafer', 'gtceu:helium']);
  assert.deepEqual(outputs(ln), ['grindless:implanted_ln_wafer']);
  const sic = by('ion_implantation', 'sic_aluminium_implant');
  assert.deepEqual(inputs(sic), ['grindless:sic_epi_wafer', 'gtceu:aluminium_dust']);
  assert.deepEqual(outputs(sic), ['grindless:implanted_sic_wafer']);
  // the wafers and boules come from UHV-A2's crystal growth furnace
  for (const id of ['grindless:lithium_niobate_wafer', 'grindless:eu_yso_boule', 'grindless:inp_wafer']) assert.ok(producers(id).some(([w]) => w.startsWith('crystals.json')), id);
  // ZPM's implanter rows keep circuits 1-2 and their inputs; the A3 change to the diamond lattice fab stays
  assert.deepEqual(Q.recipes.filter((r) => r.type === 'ion_implantation').map((r) => [r.name, r.circuit]), [['nv_diamond_chips', 1], ['donor_qubit_wafer', 2]]);
});

test('the byproducts have destinations: arsenic and the LN donor go back, fluorite to the kiln, the spent target to the furnace; tellurium from sludge', () => {
  const sl = by('molecular_beam_epitaxy', 'qcl_superlattice');
  assert.ok(inputs(sl).includes('gtceu:arsenic_dust') && sl.itemsOut.find((x) => x.id === 'gtceu:arsenic_dust').chance < 10000);
  const lnoi = by('photonic_foundry', 'lnoi_wafer');
  assert.ok(outputs(lnoi).includes('grindless:lithium_niobate_wafer') && inputs(by('ion_implantation', 'ln_smart_cut')).includes('grindless:lithium_niobate_wafer'));
  assert.equal(lnoi.itemsOut.find((x) => x.id === 'gcyr:fluorite_dust').count % 3, 0, 'fluorite in whole kiln charges');
  assert.ok(fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'iv', 'fluorspar_kiln.js'), 'utf8').includes("fluorite: { id: 'gcyr:fluorite_dust', count: 3 }"));
  assert.ok(outputs(by('photonic_foundry', 'pcm_dies')).includes('grindless:spent_gst_target'));
  assert.ok(inputs(by('electric_blast_furnace', 'gst_target_remelt')).includes('grindless:spent_gst_target'));
  // tellurium: the platinum plant lets go metal sludge; the large chemical reactor leaches it
  const te = by('large_chemical_reactor', 'tellurium_from_metal_sludge');
  assert.ok(inputs(te).includes('gtceu:metal_sludge_dust') && outputs(te).includes('gtceu:tellurium_dust'));
  // the plant's stages come from GTM's live line (not in the stand-in): its captured fixture holds GTM's iridium chloride separation
  const line = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'analysis', 'fixtures', 'platinum-plant-line.json'), 'utf8'));
  assert.ok(JSON.stringify(line.recipes['gtceu:chemical_reactor/iridium_chloride_separation'].outputs).includes('"gtceu:metal_sludge_dust"'));
  assert.ok(fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'ev', 'platinum_plant.js'), 'utf8').includes("'gtceu:metal_sludge_dust'"));
  assert.ok(inputs(by('electric_blast_furnace', 'gst_target')).includes('gtceu:tellurium_dust'));
});

test('no UEV input, and every lang key the package needs is written in en_us and es_es', () => {
  for (const r of Object.values(T.types).flatMap((t) => t.recipes)) {
    for (const id of inputs(r).concat(outputs(r))) assert.ok(!/(^|[:_])uev(_|$)/.test(id.split(':')[1] || ''), `${r.name}: ${id}`);
  }
  // UEV-A6's two UEV rows in these UHV types keep their keys in uev_photonics_lang.js; UIV-A1's MBE c4 in uiv_isotopes_lang.js
  const lang = ['uhv_photonics_lang.js', 'uev_photonics_lang.js', 'uiv_isotopes_lang.js']
    .map((f) => fs.readFileSync(path.join(kube, 'client_scripts', 'grindless', f), 'utf8')).join('\n');
  for (const [type, t] of Object.entries(T.types)) {
    if (!t.dataKey) continue;
    for (const r of t.recipes) assert.ok(lang.includes(`'gtceu.recipe.${t.dataKey}.${r.name}'`), `${type}/${r.name}`);
  }
  const keys = ['block.gtceu.mbe_reactor', 'block.gtceu.photonic_foundry', 'gtceu.molecular_beam_epitaxy', 'gtceu.photonic_foundry',
    'grindless.machine.mbe_reactor.no_voiding'];
  for (const m of ['mbe_reactor', 'photonic_foundry']) for (let i = 0; i <= 2; i++) keys.push(`grindless.machine.${m}.tooltip.${i}`);
  for (const name of Object.keys(PH.items)) keys.push(`item.grindless.${name}`, `tooltip.grindless.${name}.0`, `tooltip.grindless.${name}.1`);
  for (const k of keys) assert.ok(lang.includes(`'${k}'`), k);
  // each item has a texture
  for (const name of Object.keys(PH.items)) assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${name}.png`)), name);
});
