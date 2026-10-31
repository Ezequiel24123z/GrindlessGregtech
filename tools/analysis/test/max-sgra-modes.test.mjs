// MAX-D1 (docs/eras/max.md, D1 "Sgr A* modes on older machines"), no game needed: the rows L15, L16 and L24 add on older machines, the two
// generator balances (1.3-2.5x), circuits, limits, sites and slot fit. T1 is gg_test_max_sgra_modes (tools/test/overlay/kubejs/server_scripts).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const run = runPackScripts(pack);
const json = (p) => JSON.parse(fs.readFileSync(path.join(kube, 'data', 'grindless', 'tables', p), 'utf8'));
const SITE = 'gcyr:black_hole_orbit';
const VA_MAX = 2013265920;
const VH_MAX = 2 ** 30;
const row = (file, type, name) => json(file).types[type].recipes.find((r) => r.name === name);

const disk = (n) => row('cygnus_disk.json', n === 'skim_hot_flow' ? 'disk_skimming' : n === 'load_flux_frc' ? 'frc_forming' : 'blandford_znajek', n);
const lift = (n) => row('cygnus_lift.json', 'plasma_mass_filtering', n);
const L16 = [disk('skim_hot_flow'), lift('hot_flow_filter'), disk('load_flux_frc'), disk('frc_spin_down'), lift('cooled_exhaust_return')];
const energy = (r) => r.eut * r.duration;

test('the D1 scripts run without errors and skip nothing', () => {
  const errs = run.errors.filter((e) => /max[\\/]sgra_modes/.test(String(e.file)) && !/no original recipe/.test(String(e.message)));
  assert.deepEqual(errs, [], errs.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  const SM = run.global.grindless.sgraModes;
  assert.deepEqual(JSON.parse(JSON.stringify(SM.skipped)), []);
  assert.deepEqual(JSON.parse(JSON.stringify(SM.recipes)), ['grindless:lathe/turned_payload_core', 'grindless:assembler/max_penrose_payload']);
});

test('circuits: the contract numbers, each taken once in its type', () => {
  assert.equal(disk('skim_hot_flow').circuit, 3);
  assert.equal(disk('load_flux_frc').circuit, 3);
  assert.equal(disk('frc_spin_down').circuit, 3);
  assert.equal(lift('hot_flow_filter').circuit, 3);
  assert.equal(lift('cooled_exhaust_return').circuit, 4);
  assert.equal(row('matrioshka.json', 'droplet_radiator_assembly', 'shell_droplet_radiator').circuit, 5);
  assert.equal(row('cygnus.json', 'penrose_extraction', 'payload_penrose').circuit, 6);
  assert.equal(row('sirius.json', 'degenerate_harvesting', 'degenerate_slug').circuit, 2);
  assert.equal(row('tfln_femtosecond.json', 'femtosecond_writing', 'droplet_nozzle_plate').circuit, 8);
  // c9 is OpV-B1's bent_ge_rebend, c10 D4's: D1 takes the next free number
  assert.equal(row('megabar.json', 'megabar_synthesis', 'payload_core_press').circuit, 11);
  for (const f of ['cygnus_disk.json', 'cygnus_lift.json', 'megabar.json', 'cygnus.json', 'sirius.json']) {
    for (const t of Object.values(json(f).types)) {
      const cs = (t.recipes || []).map((r) => r.circuit).filter((c) => c > 0);
      assert.equal(new Set(cs).size, cs.length, `${f}: circuits are unique per type`);
    }
  }
});

test('every Sgr A* row carries the string site; the home rows carry none', () => {
  for (const r of [...L16, row('matrioshka.json', 'droplet_radiator_assembly', 'shell_droplet_radiator'), row('cygnus.json', 'penrose_extraction', 'payload_penrose'),
    row('sirius.json', 'degenerate_harvesting', 'degenerate_slug')]) {
    assert.equal(r.site, SITE, r.name);
  }
  assert.equal(row('megabar.json', 'megabar_synthesis', 'payload_core_press').site, undefined);
});

test('limits: every row at most VA[MAX], generators at most VH[MAX]', () => {
  for (const r of [...L16, row('cygnus.json', 'penrose_extraction', 'payload_penrose')]) assert.ok(r.eut <= VA_MAX, r.name);
  assert.equal(disk('frc_spin_down').generator, true);
  assert.ok(disk('frc_spin_down').eut <= VH_MAX);
  assert.ok(row('cygnus.json', 'penrose_extraction', 'payload_penrose').eut <= VH_MAX);
});

test('L16 balance: the BZ dynamo returns 1.3-2.5x of what the four steps cost; cooled exhaust is consumed, not looped', () => {
  const bz = disk('frc_spin_down');
  const cost = energy(L16[0]) + energy(L16[1]) + energy(L16[2]) + 2 * energy(lift('cooled_exhaust_return'));
  const ratio = energy(bz) / cost;
  assert.ok(ratio >= 1.3 && ratio <= 2.5, `ratio ${ratio}`);
  assert.deepEqual(bz.fluidsOut, [{ id: 'gtceu:cooled_exhaust', amount: 800 }]);
  const back = lift('cooled_exhaust_return');
  assert.deepEqual(back.fluidsIn, [{ id: 'gtceu:cooled_exhaust', amount: 800 }]);
  // the return makes less than it took: the exhaust never comes back as flux_loaded_frc or hot_flow_plasma
  assert.ok(back.fluidsOut.every((f) => !/flux_loaded_frc|hot_flow_plasma|filtered_hot_flow/.test(f.id)));
  assert.ok(back.fluidsOut.reduce((s, f) => s + f.amount, 0) <= 800);
});

test('L24 balance: the Penrose engine returns 1.3-2.5x of the five steps; the escaping half is payload_casing x1', () => {
  const pen = row('cygnus.json', 'penrose_extraction', 'payload_penrose');
  assert.deepEqual([pen.eut, pen.duration], [2 ** 29, 2400]);
  assert.deepEqual(pen.itemsOut, [{ id: 'grindless:payload_casing', count: 1 }]);
  const harvest = row('sirius.json', 'degenerate_harvesting', 'degenerate_slug');
  const press = row('megabar.json', 'megabar_synthesis', 'payload_core_press');
  const spsRows = run.global.grindless.uhvPropulsion.recipes;
  const sps = spsRows.find((r) => r.name === 'payload_casing');
  assert.ok(sps && sps.circuit === 22 && sps.eut === 1966080);
  const cost = energy(harvest) + energy(press) + 1966080 * 600 + energy(sps) + VA_MAX * 400;
  const ratio = energy(pen) / cost;
  assert.ok(ratio >= 1.3 && ratio <= 2.5, `ratio ${ratio}`);
});

test('L24 chain: each product is made once and the next step takes it', () => {
  const sirius = row('sirius.json', 'degenerate_harvesting', 'degenerate_slug');
  assert.equal(sirius.itemsOut[0].id, 'grindless:degenerate_matter_slug');
  const press = row('megabar.json', 'megabar_synthesis', 'payload_core_press');
  assert.ok(press.itemsIn.some((x) => x.id === 'grindless:degenerate_matter_slug'));
  assert.equal(press.itemsOut[0].id, 'grindless:compressed_payload_core');
  const src = fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'max', 'sgra_modes.js'), 'utf8');
  assert.match(src, /compressed_payload_core.*turned_payload_core/s);
  assert.match(src, /VA\[MAX\]/);
  assert.match(src, /eut: 2013265920, duration: 400/);
  assert.equal(row('cygnus.json', 'penrose_extraction', 'payload_penrose').itemsIn[0].id, 'grindless:max_penrose_payload');
});

test('slot fit: BZ has one fluid output, droplet works one fluid input; the L15 rows use them', () => {
  const read = (p) => fs.readFileSync(path.join(kube, 'startup_scripts', 'grindless', p), 'utf8');
  assert.match(read('uxv/cygnus_disk.js'), /bz_dynamo[\s\S]{0,400}fluidsOut: 1/);
  assert.match(read('uiv/matrioshka.js'), /droplet_radiator_works[\s\S]{0,400}fluidsIn: 1/);
  assert.equal(disk('frc_spin_down').fluidsOut.length, 1);
  assert.equal(row('matrioshka.json', 'droplet_radiator_assembly', 'shell_droplet_radiator').fluidsIn[0].id, 'gtceu:sn_li_eutectic');
});
