// D4-CASE-UIV (docs/eras/lines-uev-uxv.md section 9): the UIV casing family, checked without Minecraft by static lookup.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const read = (p) => fs.readFileSync(p, 'utf8');
const startup = read(path.join(kube, 'startup_scripts', 'grindless', 'uiv', 'casings.js'));
const server = read(path.join(kube, 'server_scripts', 'grindless', 'uiv', 'casings.js'));
const lang = read(path.join(kube, 'client_scripts', 'grindless', 'uiv_casings_lang.js'));
const tables = (n) => JSON.parse(read(path.join(kube, 'data', 'grindless', 'tables', n)));

const NEW = ['rhea_casing', 'mh_field_casing', 'multilayer_optics_casing', 'dilution_cryostat_casing'];
const VA_UIV = 31457280;

test('the four casings are registered with existing textures', () => {
  for (const n of NEW) {
    assert.match(startup, new RegExp(`${n}: \\{ texture: 'grindless:block/uiv/${n}'`));
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'uiv', `${n}.png`)), n);
  }
});

test('names and two tooltip lines exist in English only', () => {
  for (const n of NEW) assert.ok(lang.includes(`['${n}',`), n);
  assert.match(lang, /ClientEvents\.lang\('en_us'/);
  assert.doesNotMatch(lang, /es_es/);
  assert.match(lang, /'tooltip\.grindless\.' \+ n \+ '\.1'/);
});

test('new casings are machine recipes, never crafting-table', () => {
  assert.doesNotMatch(server, /shaped|shapeless|event\.shaped|event\.recipes\.minecraft/);
  const types = { rhea_casing: 'powder_bed_fusion', mh_field_casing: 'naquadria_magnets', multilayer_optics_casing: 'assembler', dilution_cryostat_casing: 'nuclear_demagnetisation' };
  for (const n of NEW) {
    const m = server.match(new RegExp(`gtceu\\.(\\w+)\\('grindless:${n}'\\)[\\s\\S]*?\\.EUt\\(([^)]+)\\)`));
    assert.ok(m, n);
    assert.equal(m[1], types[n], n);
    assert.equal(m[2].trim(), n === 'rhea_casing' ? 'UV_EUT' : 'UIV_EUT');
  }
  assert.match(server, /UV_EUT = 1966080/);
  assert.match(server, /UIV_EUT = 31457280/);
});

test('machine input counts fit the machine limits (circuit counted as an item)', () => {
  const block = (n) => server.split(`'grindless:${n}'`)[1].split('.itemOutputs')[0];
  const items = (n) => (block(n).match(/'\d+x [^']+'/g) || []).length + (/\.circuit\(/.test(block(n)) ? 1 : 0);
  assert.ok(items('rhea_casing') <= 3, 'powder bed printer: 3 items');
  assert.ok(items('mh_field_casing') <= 6, 'naquadria magnet works: 6 items');
  assert.ok(items('multilayer_optics_casing') <= 6, 'assembler: 6 items');
  assert.ok(items('dilution_cryostat_casing') <= 4, 'millikelvin works: 4 items');
});

test('neutron star and UIV fusion casings carry the new recipes', () => {
  const ns = tables('rx_j1856.json').types.assembler.recipes.find((r) => r.name === 'neutron_star_site_casing');
  assert.ok(ns.eut >= VA_UIV);
  assert.equal(ns.itemsIn.find((i) => i.id === 'grindless:rad_hard_controller').count, 2);
  assert.equal(ns.itemsOut[0].count, 8);
  const fw = tables('mk5.json').types.assembler.recipes.find((r) => r.name === 'uiv_fusion_casing_wall');
  const count = (id) => fw.itemsIn.find((i) => i.id === id)?.count;
  assert.equal(count('grindless:li_sn_armoured_tile'), 4);
  assert.equal(count('grindless:w_fibre_preform'), 4);
  assert.equal(count('gtceu:uiv_electric_pump'), 1);
  assert.equal(fw.itemsOut[0].count, 4);
});
