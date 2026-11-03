// D4-CASE-UEV (docs/eras/lines-uev-uxv.md section 9): the UEV casing family, checked without Minecraft by static lookup.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const read = (p) => fs.readFileSync(p, 'utf8');
const startup = read(path.join(kube, 'startup_scripts', 'grindless', 'uev', 'casings.js'));
const server = read(path.join(kube, 'server_scripts', 'grindless', 'uev', 'casings.js'));
const lang = read(path.join(kube, 'client_scripts', 'grindless', 'uev_casings_lang.js'));
const tables = (n) => JSON.parse(read(path.join(kube, 'data', 'grindless', 'tables', n)));

const NEW = ['sic_composite_casing', 'superhydride_magnet_casing', 'hftacn_lining_casing'];
const VA_UEV = 7864320;

test('the three casings are registered with existing textures', () => {
  for (const n of NEW) {
    assert.match(startup, new RegExp(`${n}: \\{ texture: 'grindless:block/uev/${n}'`));
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'uev', `${n}.png`)), n);
  }
});

test('names and two tooltip lines exist in English only', () => {
  for (const n of NEW) assert.ok(lang.includes(`['${n}',`), n);
  assert.match(lang, /ClientEvents\.lang\('en_us'/);
  assert.doesNotMatch(lang, /es_es/);
  assert.match(lang, /'tooltip\.grindless\.' \+ n \+ '\.1'/);
});

test('new casings are machine recipes at UEV voltage, never crafting-table', () => {
  assert.doesNotMatch(server, /shaped|shapeless|event\.shaped|event\.recipes\.minecraft/);
  for (const n of NEW) {
    const m = server.match(new RegExp(`gtceu\\.(\\w+)\\('grindless:${n}'\\)[\\s\\S]*?\\.EUt\\(([^)]+)\\)`));
    assert.ok(m, n);
    assert.ok(['assembler', 'naquadria_magnets', 'spark_plasma_sintering'].includes(m[1]), n);
    assert.equal(m[2].trim(), 'UEV_EUT');
  }
  assert.match(server, /UEV_EUT = 7864320/);
});

test('machine input counts fit the machine limits (circuit counted as an item)', () => {
  const block = (n) => server.split(`'grindless:${n}'`)[1].split('.itemOutputs')[0];
  const items = (n) => (block(n).match(/'\d+x [^']+'/g) || []).length;
  assert.ok(items('superhydride_magnet_casing') + 1 <= 6);
  assert.ok(items('hftacn_lining_casing') + 1 <= 4);
});

test('photonic and degenerate casings are priced at UEV with the new inputs', () => {
  const ph = tables('photonics_uev.json').types.assembler.recipes.find((r) => r.name === 'photonic_casing');
  const de = tables('sirius.json').types.assembler.recipes.find((r) => r.name === 'degenerate_containment_casing');
  for (const r of [ph, de]) {
    assert.ok(r.eut >= VA_UEV);
    assert.ok(!r.itemsIn.some((i) => /machine_casing/.test(i.id)), 'no old machine casing input');
  }
  assert.ok(de.itemsIn.some((i) => i.id === 'grindless:sic_sic_plate'));
  // bootstrap: the SNSPD foundry and vdW stacker that feed the CVI furnace's controller are photonic-bodied, so no SiC/SiC here
  assert.ok(!ph.itemsIn.some((i) => i.id === 'grindless:sic_sic_plate'));
  assert.ok(ph.itemsIn.some((i) => i.id === 'grindless:sic_mirror_blank'));
  assert.equal(ph.itemsOut[0].count, 16);
  assert.equal(de.itemsOut[0].count, 64);
});
