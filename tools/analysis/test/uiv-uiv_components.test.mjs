// UIV-A8 (docs/eras/uiv.md, lines 6, 8 and 23): the UIV pump, robot arm and motor. Static checks only (no T1).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const kube = path.join(root, 'pack', 'kubejs');
const tables = path.join(kube, 'data', 'grindless', 'tables');
const read = (...p) => fs.readFileSync(path.join(kube, ...p), 'utf8');
const json = (n) => JSON.parse(fs.readFileSync(path.join(tables, n), 'utf8'));
const T = json('uiv_components.json');

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn), ids(r.charge));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const by = (type, name) => {
  const r = T.types[type].recipes.find((x) => x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};
const OTHER_TABLES = fs.readdirSync(tables).filter((n) => n.endsWith('.json') && n !== 'uiv_components.json');
const A8 = /UIV-A8/;

test('names unique, figures positive, circuits unique per type, melter rows c6+', () => {
  const names = [];
  for (const [type, t] of Object.entries(T.types)) {
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      names.push(r.name);
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
    }
  }
  assert.equal(new Set(names).size, names.length);
  assert.deepEqual(T.types.levitation_melting.recipes.map((r) => r.circuit), [6, 7, 8]);
  const mine = T.types.levitation_melting;
  const a3 = json('levitation_melter.json').types.levitation_melting.recipes.map((r) => r.circuit);
  for (const c of [6, 7, 8]) assert.ok(!a3.includes(c), `circuit ${c} already used by A3`);
  for (const r of mine.recipes) assert.ok(r.itemsIn.length + 1 <= 5 && r.itemsOut.length <= 3 && r.fluidsIn.length <= 1, r.name);
});

test('line 8 steps: Kroll cake distils, suction casting reads the glass dust, gates and swarf return to the melter', () => {
  assert.deepEqual(inputs(by('electric_blast_furnace', 'zr_sponge_distillation')), ['grindless:zirconium_sponge']);
  assert.deepEqual(outputs(by('electric_blast_furnace', 'zr_sponge_distillation')), ['gtceu:zirconium_dust', 'gtceu:magnesium_chloride_dust']);
  assert.deepEqual(inputs(by('electric_blast_furnace', 'bmg_suction_casting')), ['gtceu:zrticunibe_glass_dust', 'gtceu:copper_plate']);
  assert.deepEqual(outputs(by('electric_blast_furnace', 'bmg_suction_casting')), ['grindless:bmg_blank', 'grindless:bmg_gate']);
  assert.deepEqual(outputs(by('lathe', 'bmg_flexspline_machining')), ['grindless:bmg_flexspline']);
  assert.deepEqual(inputs(by('assembler', 'strain_wave_gear')), ['grindless:bmg_flexspline', 'gtceu:rhea_plate']);
  const gate = by('levitation_melting', 'bmg_gate_remelt');
  assert.deepEqual(inputs(gate), ['grindless:bmg_gate', 'gtceu:helium']);
  assert.ok(outputs(gate).includes('gtceu:zrticunibe_glass_dust') && outputs(gate).includes('grindless:beryllium_oxide_dust'));
  assert.deepEqual(inputs(by('levitation_melting', 'rhea_swarf_remelt')), ['grindless:rhea_swarf', 'gtceu:helium']);
  assert.ok(outputs(by('levitation_melting', 'rhea_swarf_remelt')).includes('gtceu:rhea_ingot'));
  assert.deepEqual(inputs(by('levitation_melting', 'rhea_powder_remelt')), ['grindless:rhea_am_powder', 'gtceu:helium']);
});

test('line 6 steps: impeller from printed powder to balanced', () => {
  assert.deepEqual(inputs(by('lathe', 'rhea_impeller_machining')), ['grindless:dense_rhea_impeller']);
  assert.deepEqual(outputs(by('lathe', 'rhea_impeller_machining')), ['grindless:machined_rhea_impeller', 'grindless:rhea_swarf']);
  assert.deepEqual(inputs(by('assembler', 'rhea_impeller_balancing')), ['grindless:machined_rhea_impeller', 'gtceu:tungsten_foil']);
  assert.deepEqual(outputs(by('assembler', 'rhea_impeller_balancing')), ['grindless:balanced_rhea_impeller']);
});

test('line 23 steps: blend, oxygenation, impregnation', () => {
  assert.deepEqual(inputs(by('mixer', 'ba_cu_blend')), ['gtceu:barium_dust', 'gtceu:copper_dust']);
  assert.deepEqual(outputs(by('mixer', 'ba_cu_blend')), ['grindless:ba_cu_blend']);
  assert.deepEqual(inputs(by('chemical_reactor', 'gdbco_oxygenation')), ['grindless:bulk_gdbco', 'gtceu:oxygen']);
  assert.deepEqual(outputs(by('chemical_reactor', 'gdbco_oxygenation')), ['grindless:oxygenated_gdbco']);
  assert.deepEqual(inputs(by('assembler', 'gdbco_impregnation')), ['grindless:oxygenated_gdbco', 'gtceu:epoxy']);
  assert.deepEqual(outputs(by('assembler', 'gdbco_impregnation')), ['grindless:impregnated_gdbco']);
});

test('the three components: UEV part + line part + a UIV circuit tag', () => {
  const pump = by('assembler', 'uiv_electric_pump');
  assert.deepEqual(inputs(pump), ['grindless:uev_electric_pump', 'grindless:balanced_rhea_impeller', 'gtceu:rhea_plate', '#gtceu:circuits/uiv']);
  assert.deepEqual(outputs(pump), ['grindless:uiv_electric_pump']);
  const arm = by('assembler', 'uiv_robot_arm');
  assert.deepEqual(inputs(arm), ['grindless:uev_robot_arm', 'grindless:strain_wave_gear', 'grindless:uiv_electric_piston', '#gtceu:circuits/uiv']);
  assert.equal(arm.itemsIn[1].count, 3);
  assert.deepEqual(outputs(arm), ['grindless:uiv_robot_arm']);
  const motor = by('assembler', 'uiv_electric_motor');
  assert.deepEqual(inputs(motor), ['grindless:uev_electric_motor', 'grindless:field_cooled_gdbco', 'grindless:mh_winding', 'gtceu:metallic_hydrogen_single_cable', '#gtceu:circuits/uiv']);
  assert.deepEqual(outputs(motor), ['grindless:uiv_electric_motor']);
  for (const r of [pump, arm, motor]) assert.equal(r.eut, 7864320, r.name);
});

test('older rows exist, each marked UIV-A8', () => {
  const u = json('uranium_cycle.json').fabrication.find((r) => r.name === 'kroll_zr_sponge');
  assert.ok(u && A8.test(JSON.stringify(json('uranium_cycle.json'))) && u.circuit === 9);
  assert.deepEqual(ids(u.itemsOut), ['grindless:zirconium_sponge']);
  const c = JSON.stringify(json('coated_conductor_line.json'));
  assert.match(c, /"gd_123_precursor"/);
  assert.match(c, /gtceu:gadolinium_oxide_dust/);
  assert.match(c, /UIV-A8/);
  const h = JSON.stringify(json('hts_magnet_works.json'));
  assert.match(h, /"seeded_gdbco_growth"[\s\S]*?grindless:bulk_gdbco/);
  assert.match(h, /UIV-A8/);
  const am = json('am_powders.json');
  assert.ok(JSON.stringify(am).includes('rhea_impeller') && JSON.stringify(am).includes('grindless:rhea_am_powder'));
  assert.match(JSON.stringify(am), /UIV-A8/);
  const m = JSON.stringify(json('megabar.json'));
  assert.match(m, /"rhea_impeller_hip"[\s\S]*?grindless:dense_rhea_impeller/);
  assert.match(m, /UIV-A8/);
  const co = JSON.stringify(json('composites.json'));
  assert.match(co, /"gdbco_field_cool"[\s\S]*?grindless:field_cooled_gdbco/);
  assert.ok(co.indexOf('"halbach_array"') < co.indexOf('"gdbco_field_cool"'));
  assert.match(co, /UIV-A8/);
});

test('"only from" claims: no other table or script produces these', () => {
  const sources = [];
  for (const f of OTHER_TABLES) sources.push([f, fs.readFileSync(path.join(tables, f), 'utf8')]);
  const claims = {
    'grindless:bulk_gdbco': ['hts_magnet_works.json'],
    'grindless:field_cooled_gdbco': ['composites.json'],
    'grindless:strain_wave_gear': [],
    'grindless:bmg_blank': [],
    'gtceu:zrticunibe_glass_dust': []
  };
  for (const [id, files] of Object.entries(claims)) {
    for (const [f, txt] of sources) {
      const hits = [...txt.matchAll(new RegExp(`"(?:itemsOut|fluidsOut)"\\s*:\\s*\\[[^\\]]*"${id}"`, 'g'))].length;
      if (files.includes(f)) assert.equal(hits, 1, `${f} produces ${id}`);
      else if (id !== 'gtceu:zrticunibe_glass_dust' || f !== 'levitation_melter.json') assert.equal(hits, 0, `${f} produces ${id}`);
    }
  }
  const melts = T.types.levitation_melting.recipes.filter((r) => outputs(r).includes('gtceu:zrticunibe_glass_dust')).map((r) => r.name);
  assert.deepEqual(melts, ['bmg_gate_remelt']);
});

test('lang parity: every registered item has en_us, es_es, 2 tooltips and a texture', () => {
  const lang = read('client_scripts', 'grindless', 'uiv_uiv_components_lang.js');
  const rows = [...lang.matchAll(/^\s+\['([a-z0-9_]+)', '((?:[^'\\]|\\.)+)', '((?:[^'\\]|\\.)+)', '(?:[^'\\]|\\.)+', '(?:[^'\\]|\\.)+', '(?:[^'\\]|\\.)+', '(?:[^'\\]|\\.)+'\]/gm)];
  const names = rows.map((m) => m[1]);
  const start = read('startup_scripts', 'grindless', 'uiv', 'uiv_components.js');
  const registered = [...start.matchAll(/^\s+([a-z0-9_]+): \{ stack: \d+ \}/gm)].map((m) => m[1]);
  assert.equal(registered.length, 17);
  assert.deepEqual(names.slice().sort(), registered.slice().sort());
  for (const m of rows) assert.ok(m[2].length > 0 && m[3].length > 0 && m[2] !== m[3], m[1]);
  assert.match(lang, /'en_us', 'es_es'/);
  for (const n of registered) {
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), n);
  }
});
