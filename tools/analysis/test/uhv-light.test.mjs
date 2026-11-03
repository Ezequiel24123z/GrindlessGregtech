// D3-LIGHT (docs/eras/lines-uv-uhv.md, W3): the etched LNOI wafer and the modulators made from it, and the SiC source powder that
// feeds the SiC boule. Static table checks; T1: none.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const kube = path.join(here, '..', '..', '..', 'pack', 'kubejs');
const table = (f) => JSON.parse(fs.readFileSync(path.join(kube, 'data', 'grindless', 'tables', f), 'utf8'));
const row = (f, type, name) => table(f).types[type].recipes.find((r) => r.name === name);
const ids = (xs) => xs.map((x) => x.id);

test('the modulators come from the etched LNOI wafer, sixteen per wafer, with gold electrodes', () => {
  const etch = row('photonics.json', 'photonic_foundry', 'lnoi_etch');
  const mod = row('photonics.json', 'photonic_foundry', 'thin_film_modulators');
  assert.deepEqual(ids(etch.itemsIn), ['grindless:lnoi_wafer']);
  assert.deepEqual(ids(etch.charge), ['gtceu:argon']);
  assert.deepEqual(ids(etch.itemsOut), ['grindless:etched_lnoi_wafer']);
  assert.ok(ids(mod.itemsIn).includes('grindless:etched_lnoi_wafer') && ids(mod.itemsIn).includes('gtceu:gold_foil'));
  assert.ok(!ids(mod.itemsIn).includes('grindless:lnoi_wafer'));
  assert.equal(mod.itemsOut.find((x) => x.id === 'grindless:thin_film_ln_modulator').count, 16);
  assert.notEqual(etch.circuit, mod.circuit);
});

test('the SiC boule takes the source powder made from polysilicon and graphite; the mirror blank keeps GTCA\'s dust', () => {
  const powder = row('power_devices.json', 'silicon_carbide', 'sic_source_powder');
  const boule = row('power_devices.json', 'silicon_carbide', 'sic_boule');
  const blank = row('power_devices.json', 'silicon_carbide', 'sic_mirror_blank');
  assert.deepEqual(ids(powder.itemsIn).sort(), ['grindless:polysilicon', 'gtceu:graphite_dust']);
  assert.deepEqual(ids(powder.itemsOut), ['grindless:sic_source_powder']);
  assert.deepEqual(ids(boule.itemsIn), ['grindless:sic_source_powder']);
  assert.equal(boule.itemsIn[0].count, powder.itemsOut[0].count);
  assert.ok(ids(blank.itemsIn).includes('gtca:silicon_carbide_dust'));
  const circuits = table('power_devices.json').types.silicon_carbide.recipes.map((r) => r.circuit);
  assert.equal(new Set(circuits).size, circuits.length);
});

test('the new items are registered, named, textured', () => {
  const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
  const reg = { 'etched_lnoi_wafer': ['startup_scripts/grindless/uhv/photonics.js', 'client_scripts/grindless/uhv_photonics_lang.js'],
    'sic_source_powder': ['startup_scripts/grindless/uhv/power_devices.js', 'client_scripts/grindless/uhv_power_devices_lang.js'] };
  for (const [name, [startup, lang]] of Object.entries(reg)) {
    assert.ok(read(startup).includes(`${name}: { stack:`), name);
    const l = read(lang);
    for (const k of [`item.grindless.${name}`, `tooltip.grindless.${name}.0`, `tooltip.grindless.${name}.1`]) assert.ok(l.includes(`'${k}'`), k);
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${name}.png`)), name);
  }
});
