// UIV-A3 (docs/eras/uiv.md, "A3. Levitation melter"): the melter's table, the GTM steps of lines 2, 4, 5, 8 and 39 and the five older rows,
// checked without Minecraft by static lookup. T1 is none (recipe lookup runs in the batch's T2).
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
const T = JSON.parse(fs.readFileSync(path.join(tables, 'levitation_melter.json'), 'utf8'));
// UXV-A3's six melts (circuits 9-14) are pinned in uxv-spin_rows.test.mjs; OpV-D1's c17-18 in opv-beam_hardware.test.mjs; this file pins UIV-A3's five
T.types.levitation_melting.recipes = T.types.levitation_melting.recipes.filter((r) => !/^(UXV-A3|OpV-D1|MAX-H1)/.test(r._why || ''));
const MINE = 'levitation_melter.json';

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const by = (type, name) => {
  const r = T.types[type].recipes.find((x) => x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};

function scripts(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...scripts(p));
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}
const OTHER_TABLES = fs.readdirSync(tables).filter((n) => n.endsWith('.json') && n !== MINE);

test('names unique, EU/t and duration positive, circuits unique per type', () => {
  const seen = new Set();
  for (const [type, t] of Object.entries(T.types)) {
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      assert.ok(!seen.has(r.name), r.name);
      seen.add(r.name);
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
    }
  }
});

test('the five melts: circuits 1 to 5, helium, the 5 / 3 item and 1 / 1 fluid slots', () => {
  const lm = T.types.levitation_melting.recipes;
  assert.deepEqual(lm.map((r) => [r.name, r.circuit]), [['rhea_melt', 1], ['wf_rhea_melt', 2], ['ti50_melt', 3], ['bmg_melt', 4], ['prni5_melt', 5], ['terfenol_ingot', 21]]); // MAX-A2 c21 (line 35)
  for (const r of lm) {
    assert.equal(r.eut, 7864320, r.name);
    assert.ok(ids(r.itemsIn).length + 1 <= 5 && ids(r.itemsOut).length <= 3, r.name);
    assert.ok(ids(r.fluidsIn).length <= 1 && ids(r.fluidsOut).length <= 1, r.name);
  }
  for (const r of lm.slice(0, 4)) assert.deepEqual(ids(r.fluidsIn), ['gtceu:helium'], r.name);
  assert.ok(outputs(by('levitation_melting', 'rhea_melt')).includes('gtceu:rhea_ingot'));
  assert.ok(inputs(by('levitation_melting', 'rhea_melt')).includes('grindless:nb_ta_button'));
  assert.ok(inputs(by('levitation_melting', 'wf_rhea_melt')).includes('grindless:densified_w_preform'));
  assert.ok(outputs(by('levitation_melting', 'wf_rhea_melt')).includes('grindless:wf_rhea_billet'));
  assert.deepEqual(inputs(by('levitation_melting', 'ti50_melt')), ['gtceu:titanium_50_sponge_dust', 'gtceu:helium']);
  assert.ok(outputs(by('levitation_melting', 'ti50_melt')).includes('gtceu:titanium_50_dust'));
  assert.ok(inputs(by('levitation_melting', 'bmg_melt')).includes('grindless:zr_master_alloy'));
  assert.ok(outputs(by('levitation_melting', 'bmg_melt')).includes('gtceu:zrticunibe_glass_dust'));
  assert.ok(outputs(by('levitation_melting', 'bmg_melt')).includes('grindless:beryllium_oxide_dust'));
  assert.ok(inputs(by('levitation_melting', 'prni5_melt')).includes('gtceu:praseodymium_dust'));
  assert.ok(outputs(by('levitation_melting', 'prni5_melt')).includes('gtceu:prni5_dust'));
  assert.match(read('startup_scripts', 'grindless', 'uiv', 'levitation_melter.js'), /gtceu:levitation_melter/);
});

test('RHEA, Wf/RHEA, Ti-50, the glass and PrNi5 come only from the melter', () => {
  const claims = {
    'gtceu:rhea_ingot': 'rhea_melt',
    'grindless:wf_rhea_billet': 'wf_rhea_melt',
    'gtceu:titanium_50_dust': 'ti50_melt',
    'gtceu:zrticunibe_glass_dust': 'bmg_melt',
    'gtceu:prni5_dust': 'prni5_melt'
  };
  for (const [id, name] of Object.entries(claims)) {
    // QR-R7: the flexspline lathe returns BMG swarf as glass dust (a trivial-step scrap return), the melter stays the only source of fresh glass
    const mine = Object.entries(T.types).flatMap(([type, t]) => t.recipes.filter((r) => outputs(r).includes(id)).map((r) => `${type}/${r.name}`));
    assert.deepEqual(mine, [`levitation_melting/${name}`], id);
    for (const f of OTHER_TABLES) {
      let txt = fs.readFileSync(path.join(tables, f), 'utf8');
      // UIV-A8's remelt rows (uiv_components.json, c6-c8) run in the melter too: only other machines count
      const tbl = JSON.parse(txt);
      if (tbl.types && tbl.types.levitation_melting) {
        const types = { ...tbl.types };
        delete types.levitation_melting;
        if (id === 'gtceu:zrticunibe_glass_dust' && f === 'uiv_components.json') delete types.lathe;
        txt = JSON.stringify({ ...tbl, types });
      }
      assert.ok(!new RegExp(`"(?:itemsOut|fluidsOut)"\\s*:\\s*\\[[^\\]]*"${id}"`).test(txt), `${f} produces ${id}`);
    }
    for (const f of scripts(kube)) {
      if (f.endsWith(path.join('uiv', 'levitation_melter.js'))) continue;
      const src = fs.readFileSync(f, 'utf8');
      assert.ok(!new RegExp(`\\.(?:itemOutputs|outputItems|output)\\([^)]*${id}`).test(src), `${path.relative(kube, f)} outputs ${id}`);
    }
  }
});

test('lines 2, 4 and 39: the A2 ids each get a real use', () => {
  const w = by('assembler', 'wound_rhea_former');
  assert.ok(inputs(w).includes('grindless:mh_winding'));
  assert.ok(inputs(by('assembler', 'potted_mh_stator')).includes('grindless:mh_winding'));
  assert.ok(inputs(by('assembler', 'rhea_cased_charge')).includes('grindless:quenched_cg_nitrogen'));
  assert.ok(inputs(by('assembler', 'uiv_conveyor_module')).includes('gtceu:uev_conveyor_module'));
  assert.ok(outputs(by('assembler', 'uiv_conveyor_module')).includes('gtceu:uiv_conveyor_module'));
  assert.ok(outputs(by('assembler', 'sled_charge')).includes('grindless:sled_charge'));
  assert.ok(outputs(by('assembler', 'metallic_hydrogen_coil_block')).includes('grindless:metallic_hydrogen_coil_block'));
  assert.ok(inputs(by('assembler', 'metallic_hydrogen_coil_block')).includes('grindless:impregnated_mh_coil'));
  assert.ok(inputs(by('assembler', 'maglev_stator')).includes('gtceu:metallic_hydrogen_single_cable'));
});

test('line 5: the hot strip mill row, the homogenisation and the Nb2O5 reduction', () => {
  const hr = by('hot_rolling', 'rhea_hot_forge');
  assert.equal(hr.circuit, 4);
  assert.ok(outputs(hr).includes('gtceu:rhea_plate'));
  assert.ok(inputs(hr).includes('grindless:rhea_slab'));
  assert.ok(outputs(by('electric_blast_furnace', 'rhea_homogenise')).includes('grindless:rhea_slab'));
  assert.ok(T.types.electric_blast_furnace.temp > 0);
  assert.ok(outputs(by('chemical_reactor', 'niobium_pentoxide_calciothermic')).includes('grindless:niobium_powder'));
  assert.ok(outputs(by('electrolyzer', 'beo_electrolysis')).includes('gtceu:beryllium_dust'));
  assert.ok(outputs(by('mixer', 'zr_master_alloy_mix')).includes('grindless:zr_master_alloy'));
  const hot = read('server_scripts', 'grindless', 'ev', 'combined_cycle_and_hot_mill.js');
  assert.ok(!hot.includes('rhea_slab'), 'the mill file is not edited');
});

test('the five older rows exist', () => {
  const cascade = read('server_scripts', 'grindless', 'ev', 'extraction_cascade.js');
  assert.match(cascade, /UIV-A3/);
  assert.match(cascade, /name: 'columbite_niobium_split', mode: 'uev', circuit: 12/);
  assert.match(cascade, /name: 'melter_dross_digestion', mode: 'uev', circuit: 13/);
  assert.match(cascade, /gtceu:niobium_pentoxide_dust/);
  assert.match(cascade, /grindless:melter_dross/);
  const eb = JSON.parse(fs.readFileSync(path.join(tables, 'electron_beam.json'), 'utf8')).types.electron_beam_refining.recipes;
  const button = eb.find((r) => r.name === 'nb_ta_button');
  assert.equal(button.circuit, 7);
  // OpV-F3: a circuit may repeat only with different item inputs (consumed or kept); A3's c22 can and re-melt share one
  const ebKey = (r) => `${r.circuit}|${ids(r.itemsIn).concat(ids(r.kept)).sort().join(',')}`;
  assert.equal(new Set(eb.map(ebKey)).size, eb.length);
  assert.ok(ids(button.itemsOut).includes('grindless:nb_ta_button'));
  const comp = JSON.parse(fs.readFileSync(path.join(tables, 'composites.json'), 'utf8')).types;
  const halbach = comp.nitride_magnet_synthesis.recipes;
  // A3's halbach_array follows uiv_smes_cell; UIV-A8 appended gdbco_field_cool (c6) after it
  const h = halbach.findIndex((r) => r.name === 'halbach_array');
  assert.ok(h > 0);
  assert.equal(halbach[h - 1].name, 'uiv_smes_cell');
  assert.equal(halbach[h].circuit, 5);
  const cvi = comp.chemical_vapour_infiltration.recipes;
  assert.deepEqual(cvi.map((r) => [r.name, r.circuit]), [['sic_sic_plate', 1], ['wf_w_tile', 2], ['w_preform_densify', 3], ['glassy_carbon_lattice', 4], ['w184_fibre_preform', 5], ['chain_preform_densify', 6], ['rebco_potting', 7], ['hpsi_sic', 8], ['superpolished_sic_blank', 10], ['gamma_mirror_strip', 11], ['octupole_potting', 9], ['cmc_coil_former', 12], ['sic_sic_preform', 13]]); // MAX-A2 c12-13 (lines 9 and 10); UIV-A10 appended c4; UXV-A3 c5; OpV-A2 c8 (6-7 are OpV-A1's); OpV-B1 c10-11; OpV-B3a c9
  assert.ok(ids(cvi[2].itemsOut).includes('grindless:densified_w_preform'));
});

test('every new item has a texture, a name and two tooltips in en_us and es_es', () => {
  const startup = read('startup_scripts', 'grindless', 'uiv', 'levitation_melter.js');
  const lang = read('client_scripts', 'grindless', 'uiv_levitation_melter_lang.js');
  const names = [...startup.matchAll(/^ {4}([a-z0-9_]+): \{ stack: \d+ \}/gm)].map((m) => m[1]);
  assert.equal(names.length, 14);
  for (const n of names) {
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), n);
    const row = lang.match(new RegExp(`\\['${n}', ('[^\\n]*)\\]`));
    assert.ok(row, `${n} lang row`);
    assert.equal(row[1].split(/', '/).length, 6, `${n}: name, es and four tooltip columns`);
  }
  // every ENTRIES row has en and es
  const entries = lang.slice(lang.indexOf('var ENTRIES'), lang.indexOf('var ITEMS'));
  for (const m of entries.matchAll(/\['([^']+)',\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)'\]/g)) assert.ok(m[2] && m[3], m[1]);
  for (const t of ['block.gtceu.levitation_melter', 'gtceu.levitation_melting', 'grindless.machine.levitation_melter.tooltip.1']) assert.ok(lang.includes(`'${t}'`), t);
  const maxLang = read('client_scripts', 'grindless', 'max_components_lang.js'); // MAX-A2's row names its own EMI line
  for (const r of T.types.levitation_melting.recipes) assert.ok(lang.includes(`grindless_levitation_melting.${r.name}'`) || maxLang.includes(`grindless_levitation_melting.${r.name}'`), r.name);
  for (const k of ['grindless_electron_beam.nb_ta_button', 'grindless_nitride_magnet_synthesis.halbach_array', 'grindless_chemical_vapour_infiltration.w_preform_densify']) {
    assert.ok(lang.includes(k), k);
  }
});
