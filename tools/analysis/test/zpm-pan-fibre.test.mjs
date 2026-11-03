// ZPM's PAN carbon fibre (package D2-PAN), no game needed: the pack's scripts run in the stand-in of lib/kubejs_static.mjs.
//   startup: the two materials and the two fibre items; server: the five rows (ZPM voltage, one circuit per lookup slot, carbon / hydrogen /
//   nitrogen conserved from acrylonitrile on), the reformer's circuit 2 retired; text and textures.
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
const PF = plain(run.global.grindless.zpmPanFibre);
const recipes = run.docs.recipes.recipes;
const byId = (id) => recipes.find((r) => r.i === id);
const row = (name) => PF.recipes.find((r) => r.name === name);

// atoms of C, H, N, O per unit: fluids per 1,000 mB molecule, gases per 1,000 mB atom, one dust or item a monomer
const ATOMS = {
  'gtceu:acrylonitrile': { C: 3, H: 3, N: 1 },
  'gtceu:polyacrylonitrile_dust': { C: 3, H: 3, N: 1 },
  'grindless:pan_precursor_fibre': { C: 3, H: 3, N: 1 },
  'grindless:stabilised_pan_fibre': { C: 3, H: 1, N: 1 },
  'gtceu:hydrogen_cyanide': { C: 1, H: 1, N: 1 },
  'gtceu:carbon_fibers': { C: 1 },
  'gtceu:oxygen': { O: 1 },
  'minecraft:water': { H: 2, O: 1 }
};
const side = (items, fluids) => {
  const t = {};
  const add = (id, n) => Object.entries(ATOMS[id] || (() => { throw new Error('no atoms for ' + id); })()).forEach(([a, k]) => { t[a] = (t[a] || 0) + k * n; });
  items.forEach((x) => add(x.id, x.count));
  fluids.forEach((x) => add(x.id, x.amount / 1000));
  return t;
};

test('the stand-in runs the PAN fibre scripts without errors', () => {
  const errs = run.errors.filter((e) => /pan_fibre/.test(String(e.file)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(PF.skipped, [], 'no row skipped for an unknown id');
  assert.equal(PF.recipes.length, 5);
});

test('registration: the two fibre items', () => {
  assert.ok(run.registry.items.has('grindless:pan_precursor_fibre'));
  assert.ok(run.registry.items.has('grindless:stabilised_pan_fibre'));
});

test('every row exists, at ZPM voltage, on the right machine, one circuit each per type', () => {
  const types = { acrylonitrile_cut: 'distillation_tower', polyacrylonitrile: 'large_chemical_reactor', pan_wet_spinning: 'chemical_bath',
    pan_stabilisation: 'electric_blast_furnace', pan_carbonisation: 'electric_blast_furnace' };
  const seen = new Set();
  for (const [name, type] of Object.entries(types)) {
    const p = row(name);
    const r = byId(p.recipeId);
    assert.ok(r, name + ' added');
    assert.equal(r.t, 'gtceu:' + type);
    assert.equal(p.eut, 122880);
    assert.ok(p.duration > 0 && Number.isInteger(p.duration));
    const key = type + ':' + p.circuit;
    assert.ok(!seen.has(key), 'lookup slot unique: ' + key);
    seen.add(key);
  }
  assert.equal(row('pan_stabilisation').temp, 550);
  assert.equal(row('pan_carbonisation').temp, 1600);
});

test('carbon, hydrogen, nitrogen and oxygen are conserved from acrylonitrile on', () => {
  for (const name of ['polyacrylonitrile', 'pan_wet_spinning', 'pan_stabilisation', 'pan_carbonisation']) {
    const p = row(name);
    const inFluids = p.fluidsIn;
    assert.deepEqual(side(p.itemsOut, p.fluidsOut), side(p.itemsIn, inFluids), name + ' balance');
  }
});

test('the nitrile cut yields acrylonitrile, HCN and methane; HCN and methane have consumers, c2 is retired', () => {
  const cut = row('acrylonitrile_cut');
  assert.deepEqual(cut.fluidsOut.map((f) => f.id).sort(), ['gtceu:acrylonitrile', 'gtceu:hydrogen_cyanide', 'gtceu:methane']);
  assert.ok(row('pan_carbonisation').fluidsOut.some((f) => f.id === 'gtceu:hydrogen_cyanide'));
  assert.ok(recipes.some((r) => /methane/.test(JSON.stringify(r.j.inputs)) && /diamond_cvd/.test(r.t)), 'methane feeds the CVD diamond');
  assert.equal(byId('grindless:tholin_reforming/nitrile_fibres'), undefined);
  assert.ok(byId('grindless:tholin_reforming/tholin_hydrolysis') && byId('grindless:tholin_reforming/nitrile_diaminobenzidine'), 'c1 and c3 stay');
  const out = JSON.stringify(row('pan_carbonisation').itemsOut);
  assert.match(out, /carbon_fibers/);
});

test('names, tooltips and textures exist, with the README row', () => {
  const en = run.lang.en_us || {};
  for (const k of ['material.gtceu.acrylonitrile', 'material.gtceu.polyacrylonitrile', 'item.grindless.pan_precursor_fibre', 'item.grindless.stabilised_pan_fibre',
    'tooltip.grindless.pan_precursor_fibre.0', 'tooltip.grindless.stabilised_pan_fibre.0']) assert.ok(en[k], k);
  for (const t of ['pan_precursor_fibre', 'stabilised_pan_fibre']) {
    assert.ok(fs.existsSync(path.join(pack, 'kubejs', 'assets', 'grindless', 'textures', 'item', t + '.png')), t + ' texture');
  }
  assert.match(fs.readFileSync(path.join(root, 'tools', 'assets', 'README.md'), 'utf8'), /Build-ZPMPanFibreTextures\.ps1/);
});
