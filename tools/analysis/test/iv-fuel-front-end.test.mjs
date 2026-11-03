// D2-FUEL (docs/eras/lines-ev-zpm.md, I1 and D2-3): IV's uranium front end. Static checks only; the live numbers are the T1 load's.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const text = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const table = (n) => JSON.parse(text('data', 'grindless', 'tables', n));

const script = text('server_scripts', 'grindless', 'iv', 'fuel_front_end.js');
const priority = Number(/^\/\/ priority: (-?\d+)/.exec(script)[1]);

test('loads after the foundation (zircaloy mixer removal) and before the hot cell reads stages', () => {
  assert.ok(priority > -27666 && priority < -16424, String(priority));
});

test('retires both UF6 electrolyses, the one-reactor UF6 in both sizes and the unseparated zircaloy mixer', () => {
  for (const id of [
    'gtceu:chemical_reactor/uranium_hexafluoride',
    'gtceu:large_chemical_reactor/uranium_hexafluoride',
    'gtceu:electrolyzer/enriched_uranium_hexafluoride_separation',
    'gtceu:electrolyzer/depleted_uranium_hexafluoride_separation',
    'grindless:mixer/zircaloy',
  ]) assert.ok(script.includes(`'${id}'`), id);
});

test('every step name of c1 is a row of the script or GTM centrifuge', () => {
  const cell = table('hot_cell.json').composed.find((c) => c.name === 'enrichment');
  assert.equal(cell.circuit, 1);
  assert.deepEqual(cell.given, { 'i:gtceu:uraninite_dust': 30 });
  assert.equal(cell.stages.length, 5);
  for (const s of cell.stages) {
    if (s === 'gtceu:centrifuge/uranium_hexafluoride_separation') continue;
    const m = /^grindless:large_chemical_reactor\/(\w+)$/.exec(s);
    assert.ok(m, s);
    assert.ok(script.includes(`('grindless:${m[1]}')`), s);
  }
  assert.ok(!cell.stages.some((s) => s.includes('electrolyzer')));
});

test('the leach field gives liquor, no uraninite, and the resin wear moved to step 1', () => {
  const l = table('uranium_cycle.json').leaching;
  assert.deepEqual(l.fluidsOut, [{ id: 'gtceu:uranyl_sulfate_liquor', amount: 2000 }]);
  assert.ok(!l.resin);
  assert.ok(!l.itemsOut.some((o) => o.id === 'gtceu:uraninite_dust'));
  assert.match(script, /'grindless:uranium_eluate'[\s\S]*?chancedInput\('1x grindless:ion_exchange_resin', 100, 0\)/);
});

test('zircaloy is made from the Hf-free sponge, 63 + 1 like the material', () => {
  assert.match(script, /'grindless:zircaloy_from_sponge'[\s\S]*?'63x grindless:zirconium_sponge', '1x gtceu:tin_dust'/);
  assert.ok(!/'\d+x gtceu:zirconium_dust'/.test(script));
});

test('fluorine closes in mB over c1: 40,000 HF + 20,000 F2 in, 60,000 HF out', () => {
  const row = (name) => new RegExp("'grindless:" + name + "'\\)([\\s\\S]*?)\\.EUt").exec(script)[1];
  const amount = (name, id) => {
    const m = new RegExp("Fluid\\.of\\('" + id + "', (\\d+)\\)").exec(row(name));
    return m ? Number(m[1]) : 0;
  };
  const runs = 10; // 30 uraninite at 3 a run
  assert.match(row('uranium_tetrafluoride'), /inputFluids\(Fluid\.of\('gtceu:hydrogen_fluoride', 4000\)\)/);
  assert.equal(amount('uranium_hexafluoride', 'gtceu:fluorine') * runs, 20000);
  const hf = amount('enriched_uranium_deconversion', 'gtceu:hydrogen_fluoride');
  assert.equal(hf, amount('depleted_uranium_deconversion', 'gtceu:hydrogen_fluoride'));
  assert.equal(hf * runs, 60000);
});
test('English only, every new material has a name and a tooltip', () => {
  const lang = text('client_scripts', 'grindless', 'iv_fuel_front_end_lang.js');
  for (const m of ['uranyl_sulfate_liquor', 'uranium_eluate', 'yellowcake', 'triuranium_octoxide', 'uranium_tetrafluoride']) {
    assert.ok(lang.includes(`'material.gtceu.${m}'`), m);
    assert.ok(lang.includes(`'tooltip.grindless.${m}'`), m);
    assert.ok(text('startup_scripts', 'grindless', 'iv', 'fuel_front_end.js').includes(`event.create('${m}')`), m);
  }
  assert.ok(!/es_es/.test(lang));
});
