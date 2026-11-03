// D5-CAS-MAXP: the MAX+ casing family (docs/eras/lines-opv-maxplus.md 7.3) and iron-56 (X5 step 8).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '..', '..', '..', 'pack');
const kube = path.join(pack, 'kubejs');
const run = runPackScripts(pack);
const MC = run.global.grindless.maxPlusCasings;
const find = (id) => run.docs.recipes.recipes.find((r) => r.i === id);
const text = (id) => JSON.stringify(find(id).j);
const VA_MAX = 2013265920;
const PLATE = 'gtceu:iron_56_plate';
const FAMILY = {
  bound_lattice_casing: { ins: ['grindless:bound_degenerate_billet', 'grindless:kerr_strand_wire', 'grindless:tensegrity_truss_casing'], t: 200 },
  kerr_coil_casing: { ins: ['grindless:kerr_field_coil', 'grindless:bound_lattice_casing'], t: 400 },
  fe56_shield_casing: { ins: [PLATE, 'gtceu:lithium_6_dust', 'gtceu:tungsten_plate'], t: 400 },
  primordial_cryostat_casing: { ins: [PLATE, 'grindless:he4_dewar', 'gtceu:pristine_helium_3', 'grindless:neg_xhv_casing'], t: 400 },
  void_diamond_window: { ins: ['grindless:void_grown_diamond', PLATE], t: 200 },
  horizon_gate_casing: { ins: [PLATE, 'grindless:void_grown_diamond', 'grindless:max_field_coil', 'gtceu:pristine_helium_3'], t: 600, line: true }
};
// the hard rule of the design: the horizon plates and the condensate stay the Hyperstargate's
const FORBIDDEN = ['horizon_compressed_plate', 'horizon_containment_plate', 'kerr_condensate'];

test('runs without errors and skips nothing', () => {
  const mine = run.errors.filter((e) => /maxplus[\\/](casings|foundation)|maxplus_casings_lang/.test(String(e.file)));
  assert.deepEqual(mine, []);
  assert.deepEqual(JSON.parse(JSON.stringify(MC.skipped)), []);
  assert.equal(MC.recipes.length, 6);
});

for (const [n, f] of Object.entries(FAMILY)) {
  test(`${n}: ${f.line ? 'assembly line' : 'assembler'} at VA[MAX], ${f.t} t, its inputs, no forbidden plate`, () => {
    const id = `grindless:${f.line ? 'assembly_line' : 'assembler'}/${n}`;
    const r = find(id);
    assert.ok(r, 'row exists');
    assert.equal(r.t, f.line ? 'gtceu:assembly_line' : 'gtceu:assembler');
    const s = text(id);
    for (const i of f.ins) assert.ok(s.includes(i), i);
    assert.ok(s.includes(String(VA_MAX)));
    assert.ok(!s.includes('gtceu:circuits/') && !s.includes('programmed_circuit'));
    for (const bad of FORBIDDEN) assert.ok(!s.includes(bad), `${n} must not take ${bad}`);
    if (f.line) assert.ok(s.includes('grindless:max_field_coil'), 'research item');
  });
}

test('no horizon gate, Fe-56, cryostat or window row anywhere takes a horizon plate or Kerr condensate', () => {
  const rows = run.docs.recipes.recipes.filter((r) => /(horizon_gate_casing|fe56_shield_casing|primordial_cryostat_casing|void_diamond_window)$/.test(r.i));
  assert.ok(rows.length >= 4);
  for (const r of rows) for (const bad of FORBIDDEN) assert.ok(!JSON.stringify(r.j).includes(bad), `${r.i} takes ${bad}`);
});

test('iron-56 is a gtceu material with plate, and the spent cask returns its dust', () => {
  const src = fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', 'maxplus', 'foundation.js'), 'utf8');
  assert.match(src, /event\.create\('gtceu:iron_56'\)\.ingot\(\)/);
  assert.match(src, /GENERATE_PLATE/);
  const t = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'maxplus', 'tarantula.js'), 'utf8');
  assert.match(t, /\['gtceu:iron_56_dust', 64\]/);
  assert.ok(!/\['minecraft:iron_ingot', 64\]/.test(t));
  assert.ok((run.lang.en_us || {})['material.gtceu.iron_56']);
});

test('the six casings have texture, lang, tooltips and EMI page', () => {
  const L = run.lang.en_us || {};
  for (const n of Object.keys(FAMILY)) {
    assert.ok(run.registry.blocks.has(`grindless:${n}`), `${n} registered`);
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'maxplus', `${n}.png`)), `${n} texture`);
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', `maxplus_casing_${n}.json`)), `${n} EMI page`);
    for (const k of [`block.grindless.${n}`, `tooltip.grindless.${n}.0`, `tooltip.grindless.${n}.1`, `emi.grindless.info.${n}.0`]) assert.ok(L[k], k);
  }
});
