// XP-B1 (MAX+ machines 4-6 at 30 Doradus, lines P6, P7, P8, P17, P20 and P21): the stand-in run of maxplus/tarantula.js, row shape, circuits, lang parity, the zone row.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runPackScripts } from '../lib/kubejs_static.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const pack = path.join(root, 'pack');
const kube = path.join(pack, 'kubejs');
const run = runPackScripts(pack);
const MT = run.global.grindless.maxPlusTarantula;
const plain = (x) => JSON.parse(JSON.stringify(x));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const lang = read(kube, 'client_scripts', 'grindless', 'maxplus_tarantula_lang.js');
const rows = plain(MT.rows);
const row = (type, name) => rows.find((r) => r.type === type && r.name === name);
const ins = (r) => (r.items || []).map((i) => i[0]);
const outs = (r) => (r.outs || []).map((i) => i[0]);

test('the stand-in runs the script without errors and skips nothing', () => {
  const mine = run.errors.filter((e) => /maxplus[\\/]tarantula/.test(String(e.file)));
  assert.deepEqual(mine, [], mine.map((e) => `${e.stage} ${e.file}: ${e.message}`).join('\n'));
  assert.deepEqual(plain(MT.skipped), []);
  assert.equal(plain(MT.controllers).length, 3);
});

test('machine rows: 2^35 EU/t in for the lift and the crucible, 2^34 and 2^33 EU/t out for the burner; wear 1 in 32 and 1 in 16', () => {
  assert.equal(row('tarantula_stellar_lift', 'raw_vms_plasma').eut, 2 ** 35);
  assert.deepEqual(row('tarantula_stellar_lift', 'raw_vms_plasma').wear, [['grindless:vms_lift_nozzle', 312]]);
  assert.equal(row('pair_instability_crucible', 'ni56_slug').eut, 2 ** 35);
  assert.deepEqual(row('pair_instability_crucible', 'ni56_slug').wear, [['grindless:crucible_liner', 625]]);
  assert.equal(row('nickel_56_burner', 'co56_cask').eut, -(2 ** 34));
  assert.equal(row('nickel_56_burner', 'spent_fe56_cask').eut, -(2 ** 33));
  assert.deepEqual(outs(row('nickel_56_burner', 'co56_cask')), ['grindless:co56_cask']);
  assert.deepEqual(ins(row('nickel_56_burner', 'spent_fe56_cask')), ['grindless:co56_cask']);
});

test('each line is one chain: every step feeds the next', () => {
  const feeds = (a, b) => outs(a).some((o) => ins(b).includes(o));
  assert.ok(feeds(row('hot_cell', 'shielded_ni56_cask'), row('nickel_56_burner', 'co56_cask')), 'P7 cask into the burner');
  assert.ok(feeds(row('canner', 'canned_ni56'), row('hot_cell', 'shielded_ni56_cask')), 'P7 canner into the hot cell');
  assert.ok(feeds(row('pair_instability_crucible', 'ni56_slug'), row('canner', 'canned_ni56')), 'P7 slug into the canner');
  assert.ok(feeds(row('nickel_56_burner', 'spent_fe56_cask'), row('hot_cell', 'spent_fe56_cask_iron')), 'P7 spent cask into the iron-back row');
  assert.ok(feeds(row('single_crystal_casting', 'sx_turbine_blade'), row('electron_beam_refining', 'tbc_coated_blade')), 'P17 blade');
  assert.ok(feeds(row('electron_beam_refining', 'tbc_coated_blade'), row('assembler', 'sco2_turbine_module')), 'P17 coated blade into the module');
  assert.ok(feeds(row('spark_plasma_sintering', 'turbine_disc'), row('assembler', 'sco2_turbine_module')), 'P17 disc into the module');
  assert.ok(feeds(row('hot_rolling', 'pche_recuperator_foil'), row('assembler', 'sco2_turbine_module')), 'P17 foil into the module');
  assert.ok(feeds(row('chemical_vapour_infiltration', 'sic_nozzle_former'), row('coated_conductor', 'nozzle_tape')), 'P20 former into the tape');
  assert.ok(feeds(row('coated_conductor', 'nozzle_tape'), row('magnet_winding', 'nozzle_winding')), 'P20 tape into the winding');
  assert.ok(feeds(row('magnet_winding', 'nozzle_winding'), row('chemical_reactor', 'impregnated_nozzle')), 'P20 winding into the impregnation');
  assert.ok(plain(MT.cools).some((c) => c.input === 'grindless:impregnated_nozzle' && c.output === 'grindless:vms_lift_nozzle'), 'P20 cooling');
  assert.ok(feeds(row('chemical_vapour_infiltration', 'infiltrated_liner'), row('electron_beam_refining', 'sealed_liner')), 'P21 liner');
  assert.ok(feeds(row('electron_beam_refining', 'sealed_liner'), row('megabar_synthesis', 'densified_liner')), 'P21 sealed liner into the megabar press');
  assert.ok(feeds(row('megabar_synthesis', 'densified_liner'), row('lathe', 'crucible_liner')), 'P21 densified liner into the lathe');
  assert.ok(row('solvent_extraction', 'ime_leach_fractions').fluidOuts.some((f) => f[0] === 'gtceu:ime_leach_fractions'), 'P8 leach');
  assert.ok(row('electric_blast_furnace', 'recovered_silicon').fluids.some((f) => f[0] === 'gtceu:ime_leach_fractions'), 'P8 leach into the furnace');
  assert.ok(feeds(row('electric_blast_furnace', 'recovered_silicon'), row('zone_refining', 'electronic_grade_silicon')), 'P8 silicon');
});

test('circuits: the first free one of each older machine type; unique per type; the EBF takes none and the burner/machines their own', () => {
  const seen = new Set();
  for (const r of rows) {
    if (!r.circuit) continue;
    const k = `${r.type}:${r.circuit}`;
    assert.ok(!seen.has(k), `circuit clash ${k}`);
    seen.add(k);
  }
  const at = (t, n) => row(t, n).circuit;
  assert.equal(at('plasma_mass_filtering', 'vms_core_plasma'), 6);
  assert.equal(at('frc_forming', 'confined_vms_plasma'), 4);
  assert.equal(at('hot_cell', 'shielded_ni56_cask'), 24);
  assert.equal(at('hot_cell', 'spent_fe56_cask_iron'), 26);
  assert.equal(at('solvent_extraction', 'ime_leach_fractions'), 16);
  assert.equal(at('zone_refining', 'electronic_grade_silicon'), 17);
  assert.equal(at('single_crystal_casting', 'sx_turbine_blade'), 4);
  assert.equal(at('spark_plasma_sintering', 'turbine_disc'), 24);
  assert.equal(at('hot_rolling', 'pche_recuperator_foil'), 15);
  assert.equal(at('assembler', 'sco2_turbine_module'), 28);
  assert.equal(at('chemical_vapour_infiltration', 'sic_nozzle_former'), 17);
  assert.equal(at('chemical_vapour_infiltration', 'infiltrated_liner'), 18);
  assert.equal(at('coated_conductor', 'nozzle_tape'), 11);
  assert.equal(at('magnet_winding', 'nozzle_winding'), 17);
  assert.equal(at('megabar_synthesis', 'densified_liner'), 15);
  assert.equal(at('chemical_reactor', 'impregnated_nozzle'), 8);
  assert.equal(row('electric_blast_furnace', 'recovered_silicon').circuit, undefined);
  assert.ok(row('electric_blast_furnace', 'recovered_silicon').temp > 0, 'EBF temperature');
});

test('controllers: assembly line recipes for the three machines, station research, V[MAX] and the domain item', () => {
  const c = plain(MT.controllers);
  assert.deepEqual(c.map((x) => x.machine), ['gtceu:tarantula_stellar_lift', 'gtceu:pair_instability_crucible', 'gtceu:nickel_56_burner']);
  const text = read(kube, 'server_scripts', 'grindless', 'maxplus', 'tarantula.js');
  assert.ok(/c\.machine, c\.research, 64, 4800\)/.test(text));
  assert.ok(/EUt\(VA_MAX\)\.duration\(duration\)/.test(text));
});

test('no hand-set value reaches 2^31 as a literal: the large rows are V[MAX] x 16 and powers of two', () => {
  const text = read(kube, 'server_scripts', 'grindless', 'maxplus', 'tarantula.js');
  assert.ok(!/\b(2[1-9]\d{8}|[3-9]\d{9}|\d{11,})\b/.test(text), 'a literal at or above 2^31');
});

test('lang: machine, type, tooltip and every keyed row have an en_us entry; ASCII only', () => {
  for (const r of rows.filter((x) => x.key)) assert.ok(lang.includes(`${r.key}.${r.name}'`), `no lang key for ${r.type}/${r.name}`);
  for (const m of ['tarantula_stellar_lift', 'pair_instability_crucible', 'nickel_56_burner']) {
    assert.ok(lang.includes(`'block.gtceu.${m}'`), m);
    assert.ok(lang.includes(`'gtceu.${m}'`), m);
    assert.ok(lang.includes(`'grindless.machine.${m}.tooltip.0'`), m);
  }
  assert.ok(lang.includes("ClientEvents.lang('en_us'"));
  assert.ok(!/[^\x00-\x7f]/.test(lang), 'non-ASCII characters must be \\u escapes');
});

test('older rows carry 30 Doradus; the casings and nothing else do not', () => {
  const text = read(kube, 'server_scripts', 'grindless', 'maxplus', 'tarantula.js');
  assert.ok(/TARANTULA = 'grindless:tarantula_orbit'/.test(text));
  assert.ok(/if \(r\.site !== false\) b\.dimension\(TARANTULA\)/.test(text));
  assert.deepEqual(rows.filter((r) => r.site === false).map((r) => r.name), ['lift_nozzle_casing', 'crucible_liner_casing']);
});

test('the zone row exists and does not overlap another', () => {
  const z = JSON.parse(read(root, 'tools', 'test', 'zones.json'));
  const list = z.zones || z;
  const mine = list.find((r) => r.id === 'maxplus_tarantula');
  assert.ok(mine);
  assert.deepEqual(mine.tests, ['maxplus_tarantula']);
  for (const o of list) {
    if (o === mine) continue;
    const overlap = o.x[0] <= mine.x[1] && mine.x[0] <= o.x[1] && o.z[0] <= mine.z[1] && mine.z[0] <= o.z[1] && o.y[0] <= mine.y[1] && mine.y[0] <= o.y[1];
    assert.ok(!overlap, `overlaps ${o.id}`);
  }
});
