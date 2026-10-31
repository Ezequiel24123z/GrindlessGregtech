// ZPM's qubit chain (package ZPM-A6), no game needed: startup_scripts/grindless/zpm/qubits.js (three recipe types, three machines, five
// items), server_scripts/grindless/zpm/qubits.js (the six chain recipes, the Si-28 boule and wafer, our two alternative HPCA recipes, the
// crafting recipes), the hot cell's circuit 5 row and en_us / es_es text.
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
const Q = plain(run.global.grindless.qubits);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const ZPM_VA = 122880;
const MACHINES = ['diamond_lattice_fab', 'ion_implanter', 'qubit_fab'];
const TYPES = ['diamond_cvd', 'ion_implantation', 'qubit_fabrication'];
const ITEMS = ['nitrogen_doped_cvd_plate', 'nv_diamond_chip', 'silicon_28_boule', 'silicon_28_wafer', 'donor_qubit_wafer'];

test('the stand-in runs the qubit scripts without errors and nothing is skipped or clashing', () => {
  const errs = run.errors.filter((e) => /zpm[\\/]qubits/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(Q.clashes, []);
  assert.deepEqual(Q.skipped.filter((s) => !/unknown id/.test(s.reason)), []);
});

test('registration: three recipe types, three machines, one pattern each with one controller', () => {
  TYPES.forEach((t) => assert.ok(run.registry.recipeTypes.has('gtceu:' + t), t));
  MACHINES.forEach((m, i) => {
    const reg = run.registry.machines.get('gtceu:' + m);
    assert.ok(reg, m);
    assert.deepEqual(reg.recipeTypes, ['gtceu:' + TYPES[i]]);
    const s = run.docs.structures.structures['gtceu:' + m];
    assert.ok(s, m + ' structure');
    const cells = s.slices.flatMap((sl) => sl.join('').split(''));
    assert.equal(cells.filter((c) => c === 'S').length, 1, m + ' one controller');
    for (const sl of s.slices) for (const row of sl) for (const c of row) assert.ok(c === ' ' || s.symbols[c], m + ' symbol ' + c);
    assert.equal(s.symbols.X.kind, 'oneOf');
  });
  const dims = (m) => { const s = run.docs.structures.structures['gtceu:' + m]; return [s.slices[0][0].length, s.slices[0].length, s.slices.length]; };
  assert.deepEqual(dims('diamond_lattice_fab'), [5, 5, 5]);
  assert.deepEqual(dims('ion_implanter'), [5, 5, 15]);
  assert.deepEqual(dims('qubit_fab'), [5, 5, 9]);
});

test('the chain recipes (nine, plus UEV-A3\'s nanodiamond row and UIV-A5\'s H-implanted Si-28 wafer): one circuit per recipe in its type, ZPM VA or less, fits the IO sizes', () => {
  assert.equal(Q.recipes.length, 17); // UIV-A10 adds c12_cvd_plate and c12_boron_diamond; UXV-A3 adds three argon ion mills (ion_implantation c8-10); OpV-A1 hpge_contacts (c15)
  for (const p of Q.recipes) {
    const r = byId(p.recipeId);
    assert.ok(r, p.recipeId + ' added');
    assert.equal(r.t, 'gtceu:' + p.type);
    assert.deepEqual(r.j.inputs.item.filter((i) => i.content.type === 'gtceu:circuit').map((i) => i.content.configuration), [p.circuit]);
    // UIV-A5's implanter row runs at 491,520 EU/t, as UHV's implanter rows c3-c4 in tables/photonics.json do
    assert.ok(p.eut <= (['h_si28_wafer', 'c12_cvd_plate', 'c12_boron_diamond', 'mtj_ion_etch', 'mram_ion_etch', 'stno_ion_mill', 'hpge_contacts'].includes(p.name) ? 491520 : ZPM_VA) && Number.isInteger(p.duration), p.name);
  }
  for (const t of TYPES) {
    const circuits = Q.recipes.filter((r) => r.type === t).map((r) => r.circuit);
    assert.equal(new Set(circuits).size, circuits.length, t + ' circuits differ');
  }
  const q = Q.recipes.filter((r) => r.type === 'qubit_fabrication');
  assert.ok(q.every((r) => r.notConsumedFluids[0].amount === 4000 && r.fluidsIn[0].amount === 10), 'the helium charge loops, 10 mB is the make-up');
  assert.deepEqual(q.map((r) => r.itemsOut[0].id), ['grindless:qubit_array', 'grindless:qubit_array', 'grindless:snspd_array'],
    'circuits 1-2 make the qubit array; UV-A7\'s circuit 3 the SNSPD array');
  const snspd = q.find((r) => r.name === 'snspd_array');
  assert.equal(snspd.circuit, 3);
  assert.deepEqual(snspd.itemsIn, [{ id: 'grindless:nbn_film_wafer', count: 1 }]);
  const d = Q.recipes.filter((r) => r.type === 'diamond_cvd' && r.fluidsOut.length > 0 && r.name !== 'nanodiamond' && r.name !== 'c12_cvd_plate'); // UIV-A10's c12_cvd_plate loops hydrogen too
  assert.equal(d.length, 2, 'the two diamond rows loop hydrogen; UV-A3\'s capsule rows (circuits 3, 4) return nothing');
  const nd = Q.recipes.find((r) => r.name === 'nanodiamond');
  assert.equal(nd.circuit, 7, 'UEV-A3\'s nanodiamond row: circuit 7 (UHV betavoltaics owns 5 and 6)');
  assert.ok(nd.fluidsOut[0].amount < nd.fluidsIn[0].amount, 'the spalling consumes part of its hydrogen');
  assert.ok(d.every((r) => r.fluidsOut[0].amount < r.fluidsIn[1].amount && r.fluidsOut[0].amount >= 0.9 * r.fluidsIn[1].amount), 'hydrogen loops back with a small make-up');
  assert.equal(d[1].fluidsIn[2].amount, 10, 'nitrogen 10 mB');
});

test('both routes give a qubit array: donors (4 wafers) and NV chips (16, slower)', () => {
  const a = Q.recipes.find((r) => r.name === 'array_from_donors');
  const b = Q.recipes.find((r) => r.name === 'array_from_chips');
  assert.equal(a.itemsIn[0].count, 4);
  assert.equal(b.itemsIn[0].count, 16);
  assert.ok(b.duration > a.duration, 'the chip route is slower');
  assert.equal(a.eut, ZPM_VA);
});

test('the two alternative HPCA recipes: arrays where GTM has circuit tags, no key set contains the other', () => {
  assert.equal(Q.hpca.length, 2);
  const want = [['1x gtceu:hpca_empty_component', '1x grindless:qubit_array'], ['1x gtceu:hpca_computation_component', '2x grindless:qubit_array']];
  Q.hpca.forEach((h, i) => {
    const r = byId(h.ours);
    assert.ok(r, h.ours + ' added');
    assert.equal(r.t, 'gtceu:assembler');
    const text = JSON.stringify(r.j);
    for (const id of [h.base, h.fieldGenerator, h.output, 'grindless:qubit_array', 'pcb_coolant']) assert.ok(text.includes(id), id);
    assert.ok(!/circuits/.test(text), 'no circuit tag in ' + h.name);
    assert.ok(want[i].length === 2);
    assert.notEqual(h.ours, h.recipeId, 'a different id from GTM\'s');
  });
  assert.equal(Q.hpca[0].arrays, 1);
  assert.equal(Q.hpca[1].arrays, 2);
  assert.equal(Q.hpca[1].eut, ZPM_VA);
  assert.ok(!run.removals.some((x) => /hpca/.test(JSON.stringify(x.filter))), 'GTM\'s HPCA recipes are not removed');
});

test('each qubit array costs at least the EU of the circuits it replaces (qubit fab run >= 4 ZPM circuits worth of the component recipe)', () => {
  const array = Q.recipes.find((r) => r.name === 'array_from_donors');
  const comp = Q.hpca[0];
  assert.ok(array.energy >= comp.eut * comp.duration, 'the array\'s own EU is above the assembler step it feeds');
});

test('the Si-28 route: hot cell circuit 5, boule in the EBF, wafers from the cutter, the donor and NV recipes read them', () => {
  const table = JSON.parse(fs.readFileSync(path.join(pack, 'kubejs', 'data', 'grindless', 'tables', 'hot_cell.json'), 'utf8'));
  assert.ok(table.modes.some((m) => m.circuit === 5 && m.name === 'silicon_28'));
  const row = table.recipes.find((r) => r.circuit === 5);
  assert.ok(row && row.itemsOut.some((o) => o.id === 'grindless:silicon_28_dust'), 'Si-28 dust from the hot cell');
  assert.ok(row.itemsIn.length + 1 <= 4 && row.itemsOut.length <= 6 && row.fluidsIn.length <= 2 && row.fluidsOut.length <= 4, 'fits the hot cell IO');
  assert.equal(new Set(table.recipes.map((r) => r.circuit + ':' + r.name)).size, table.recipes.length);
  assert.ok(byId(Q.wafers.boule.id) && byId(Q.wafers.cutter.id));
  assert.match(JSON.stringify(byId(Q.wafers.boule.id).j), /silicon_28_boule/);
  assert.match(JSON.stringify(byId(Q.wafers.cutter.id).j), /silicon_28_wafer/);
  assert.match(JSON.stringify(byId('grindless:ion_implantation/donor_qubit_wafer').j), /silicon_28_wafer/);
});

test('the three controllers have crafting recipes from ZPM parts', () => {
  for (const c of Q.crafting) {
    const r = byId(c.id);
    assert.ok(r, c.id + ' added');
    assert.match(JSON.stringify(r.j), new RegExp(c.output));
  }
});

test('every new name and tooltip has en_us and es_es text, translated', () => {
  const en = run.lang.en_us || {};
  const es = run.lang.es_es || {};
  const keys = [];
  MACHINES.forEach((m, i) => { keys.push('block.gtceu.' + m, 'gtceu.' + TYPES[i]); [0].forEach((n) => keys.push(`grindless.machine.${m}.tooltip.${n}`)); });
  ITEMS.forEach((n) => keys.push('item.grindless.' + n, `tooltip.grindless.${n}.0`, `tooltip.grindless.${n}.1`));
  for (const k of keys) {
    assert.ok(en[k] && en[k].length > 3, 'en_us ' + k);
    assert.ok(es[k] && es[k].length > 3, 'es_es ' + k);
    assert.notEqual(en[k], es[k], 'es_es ' + k + ' is translated');
  }
});

test('textures: three PNGs per machine, one per item, generator documented', () => {
  for (const m of MACHINES) {
    const dir = path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'block', 'multiblock', m);
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) assert.ok(fs.existsSync(path.join(dir, f)), m + ' ' + f);
  }
  for (const n of ITEMS) assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'item', n + '.png')), n);
  assert.match(fs.readFileSync(path.join(root, 'tools', 'assets', 'README.md'), 'utf8'), /Build-ZPMQubitsTextures\.ps1/);
});
