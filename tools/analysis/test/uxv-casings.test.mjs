// D4-CASE-UXV (docs/eras/lines-uev-uxv.md section 9): the UXV casing family, checked without Minecraft by static lookup.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const read = (p) => fs.readFileSync(p, 'utf8');
const startup = read(path.join(kube, 'startup_scripts', 'grindless', 'uxv', 'casings.js'));
const server = read(path.join(kube, 'server_scripts', 'grindless', 'uxv', 'casings.js'));
const lang = read(path.join(kube, 'client_scripts', 'grindless', 'uxv_casings_lang.js'));
const tables = (n) => JSON.parse(read(path.join(kube, 'data', 'grindless', 'tables', n)));

const NEW = ['gum_metal_casing', 'mu_metal_shield_casing', 'pulsed_field_casing', 'pasta_containment_casing'];
const VA_UEV = 7864320;
const VA_UXV = 125829120;
const recipeOf = (n) => {
  const m = server.match(new RegExp(`gtceu\\.(\\w+)\\('grindless:${n}'\\)([\\s\\S]*?)\\.EUt\\(([^)]+)\\)`));
  assert.ok(m, n);
  return { type: m[1], body: m[2], eut: m[3].trim() };
};

test('the four casings are registered with existing textures and EMI pages', () => {
  for (const n of NEW) {
    assert.match(startup, new RegExp(`${n}: \\{ texture: 'grindless:block/uxv/${n}'`));
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'uxv', `${n}.png`)), n);
    const page = JSON.parse(read(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', `uxv_${n}.json`)));
    assert.deepEqual(page.stacks, [`item:grindless:${n}`]);
    assert.deepEqual(page.text, [`emi.grindless.info.${n}.0`]);
  }
});

test('names and two tooltip lines exist in English only', () => {
  for (const n of NEW) assert.ok(lang.includes(`['${n}',`), n);
  assert.match(lang, /ClientEvents\.lang\('en_us'/);
  assert.doesNotMatch(lang, /es_es/);
  assert.match(lang, /'tooltip\.grindless\.' \+ n \+ '\.1'/);
});

test('new casings are machine recipes at their machine voltage, never crafting-table', () => {
  assert.doesNotMatch(server, /shaped|shapeless|event\.shaped|event\.recipes\.minecraft/);
  const expect = { gum_metal_casing: ['assembler', 'UXV_EUT'], mu_metal_shield_casing: ['assembler', 'UXV_EUT'], pulsed_field_casing: ['naquadria_magnets', 'UIV_EUT'], pasta_containment_casing: ['assembler', 'UXV_EUT'] };
  for (const n of NEW) {
    const r = recipeOf(n);
    assert.equal(r.type, expect[n][0], n);
    assert.equal(r.eut, expect[n][1], n);
  }
  // the family casings are UXV's bootstrap material, held to VA[UIV] (recipe_quality.json familyCasings): the magnet works on two UEV hatches
  assert.match(server, /UIV_EUT = 31457280/);
  assert.match(server, /UXV_EUT = 125829120/);
  assert.equal(VA_UXV, 15 * 2 ** 23);
  assert.equal(VA_UEV, 15 * 2 ** 19);
});

test('the pulsed field recipe fits the magnet works slots (circuit counted as an item)', () => {
  const items = (recipeOf('pulsed_field_casing').body.split('.itemOutputs')[0].match(/'\d+x [^']+'/g) || []).length;
  assert.ok(items + 1 <= 6);
});

test('no Vela or Cassiopeia A product goes into the four casings (bootstrap, uxv.md)', () => {
  const forbidden = /uxv_emitter|uxv_field_generator|uxv_electric|lasagna|pasta_strand|strand_tape|strand_coil|ti44|titanium_44|cnt_whipple|whipple_shield|neutronium_pellet/;
  for (const n of NEW) assert.doesNotMatch(recipeOf(n).body, forbidden, n);
  assert.match(recipeOf('pasta_containment_casing').body, /gtceu:uiv_field_generator/);
  assert.match(recipeOf('pulsed_field_casing').body, /gtceu:uiv_emitter/);
  assert.match(recipeOf('mu_metal_shield_casing').body, /2x gtceu:uiv_sensor/);
});

test('every casing is built on gum metal and the families keep to their products', () => {
  for (const n of ['gum_metal_casing', 'mu_metal_shield_casing', 'pulsed_field_casing', 'pasta_containment_casing']) assert.match(recipeOf(n).body, /grindless:gum_metal_billet/, n);
  assert.match(recipeOf('gum_metal_casing').body, /grindless:w184_cvi_preform/);
  assert.match(recipeOf('mu_metal_shield_casing').body, /grindless:annealed_mu_foil/);
  for (const i of ['mh_winding', 'ga2o3_power_die', 'finemet_core']) assert.match(recipeOf('pulsed_field_casing').body, new RegExp(`grindless:${i}`));
  for (const i of ['frc_cartridge', 'cage_part']) assert.match(recipeOf('pasta_containment_casing').body, new RegExp(`grindless:${i}`));
});

test('uxv_fusion_casing: 12 of each part, one field generator, 24 casings, at VA[UXV]', () => {
  const r = tables('fusion_mk6.json').types.assembler.recipes.find((x) => x.name === 'uxv_fusion_casing');
  assert.equal(r.eut, VA_UXV);
  assert.deepEqual(r.itemsIn.map((i) => [i.id, i.count]), [
    ['grindless:wf_rhea_billet', 12], ['grindless:w184_cvi_preform', 12], ['grindless:mh_winding', 12], ['gtceu:uxv_field_generator', 1], ['gtceu:tritanium_frame', 12]]);
  assert.deepEqual(r.fluidsIn, [{ id: 'gtceu:he_6n', amount: 1000 }]);
  assert.deepEqual(r.itemsOut, [{ id: 'grindless:uxv_fusion_casing', count: 24 }]);
});
