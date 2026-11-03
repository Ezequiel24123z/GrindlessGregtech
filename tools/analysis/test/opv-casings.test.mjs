// D5-CAS-OPV: the OpV casing family (docs/eras/lines-opv-maxplus.md 7.1): the three new casings' rows and the three retuned ones.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const run = runPackScripts(pack);
const CAS = run.global.grindless.opvCasings;
const recipes = run.docs.recipes.recipes;
const find = (id) => recipes.find((r) => r.i === id);
const text = (id) => JSON.stringify(find(id).j);
const plain = (x) => JSON.parse(JSON.stringify(x));
const EUT = 503316480;
const NEW = ['chain_lamina_casing', 'tpv_wall_casing', 'kugelblitz_cavity_casing'];

test('the three new casings are made, none skipped', () => {
  assert.deepEqual(plain(CAS.skipped), []);
  assert.deepEqual(plain(CAS.recipes), NEW.map((n) => `grindless:${n}`));
});

test('chain lamina casing: assembler at 2^28, four per run, no circuits', () => {
  const r = find('grindless:assembler/chain_lamina_casing');
  assert.equal(r.t, 'gtceu:assembler');
  const t = text('grindless:assembler/chain_lamina_casing');
  for (const id of ['grindless:chain_lamina_stack', 'gtceu:chain_strand_single_wire', 'gtceu:neutronium_plate', 'gtceu:neutronium_frame']) assert.ok(t.includes(id), id);
  assert.ok(!t.includes('gtceu:circuits/'));
  assert.ok(t.includes(String(EUT)));
});

test('TPV wall casing: assembler at 2^28 from the home-made panel and tile', () => {
  const r = find('grindless:assembler/tpv_wall_casing');
  assert.equal(r.t, 'gtceu:assembler');
  const t = text('grindless:assembler/tpv_wall_casing');
  for (const id of ['grindless:tpv_panel', 'grindless:gamma_absorber_tile', 'gtceu:copper_plate', 'grindless:chain_lamina_stack']) assert.ok(t.includes(id), id);
  assert.ok(t.includes(String(EUT)));
});

test('kugelblitz cavity casing: assembly line at OpV behind research, takes the shield casing', () => {
  const r = find('grindless:assembly_line/kugelblitz_cavity_casing');
  assert.equal(r.t, 'gtceu:assembly_line');
  const t = text('grindless:assembly_line/kugelblitz_cavity_casing');
  for (const id of ['grindless:gamma_multilayer_mirror', 'grindless:field_frozen_plate', 'grindless:annihilation_shield_casing', 'gtceu:chain_strand_single_wire']) assert.ok(t.includes(id), id);
  assert.ok(t.includes('503316480') && t.includes('research'));
});

test('the retuned casings: shield and NEG at 2^28 with lamina stacks, the field-frozen one with a coil and cable', () => {
  const nm = recipes.filter((r) => JSON.stringify(r.j).includes('"grindless:neg_xhv_casing"') && r.t === 'gtceu:assembler' && /neg_xhv_casing/.test(r.i));
  assert.equal(nm.length, 1);
  assert.ok(JSON.stringify(nm[0].j).includes('grindless:chain_lamina_stack'));
  assert.ok(JSON.stringify(nm[0].j).includes('gtceu:stainless_steel_frame'));
  assert.ok(JSON.stringify(nm[0].j).includes('gtceu:uxv_electric_pump'));
  assert.ok(text('grindless:assembler/annihilation_shield_casing').includes('grindless:chain_lamina_stack'));
});

test('every new casing has its texture, lang and EMI page', () => {
  const kube = path.join(pack, 'kubejs');
  const L = run.lang.en_us || {};
  for (const n of NEW) {
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'opv', `${n}.png`)), `${n} texture`);
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', `opv_casing_${n}.json`)), `${n} EMI page`);
    for (const k of [`block.grindless.${n}`, `tooltip.grindless.${n}.0`, `tooltip.grindless.${n}.1`, `emi.grindless.info.${n}.0`]) assert.ok(L[k], k);
  }
});
