// UIV-A4 (docs/eras/uiv.md, machines 3 and 4; lines 10, 12, 18, 36, 40): the TFLN fab and the femtosecond writer. Static checks only (no T1).
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
const T = JSON.parse(fs.readFileSync(path.join(tables, 'tfln_femtosecond.json'), 'utf8'));

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
const OTHER_TABLES = fs.readdirSync(tables).filter((n) => n.endsWith('.json') && n !== 'tfln_femtosecond.json');

test('names unique, EU/t and duration positive, circuits unique per type', () => {
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
});

test('TFLN fab: ion_slicing circuits 1-4, figures and slots', () => {
  const rc = T.types.ion_slicing.recipes;
  // OpV-A2 appended c5 (the Nb TSV bond) and c6 (LN on Si-28 SOI)
  assert.deepEqual(rc.map((r) => [r.name, r.circuit]), [['ln_on_sin', 1], ['si28_soi', 2], ['poled_lnoi', 3], ['eo_microcomb', 4], ['tsv_bond', 5], ['ln_on_soi', 6]]);
  for (const r of rc) {
    assert.equal(r.eut, 31457280, r.name);
    assert.ok(ids(r.itemsIn).length + 1 <= 3 && ids(r.itemsOut).length <= 2, r.name);
    assert.ok(ids(r.fluidsIn).length <= 1 && ids(r.fluidsOut).length <= 1, r.name);
  }
  assert.equal(by('ion_slicing', 'ln_on_sin').duration, 1600);
  assert.deepEqual(inputs(by('ion_slicing', 'ln_on_sin')), ['grindless:lnoi_wafer', 'grindless:sin_coated_wafer']);
  assert.deepEqual(inputs(by('ion_slicing', 'si28_soi')), ['grindless:h_si28_wafer', 'grindless:oxidised_wafer']);
  assert.deepEqual(outputs(by('ion_slicing', 'si28_soi')), ['grindless:si28_soi_wafer', 'grindless:si28_donor_wafer', 'gtceu:hydrogen']);
  assert.deepEqual(inputs(by('ion_slicing', 'poled_lnoi')), ['grindless:lnoi_wafer']);
  assert.deepEqual(inputs(by('ion_slicing', 'eo_microcomb')), ['grindless:annealed_damascene_ring', 'grindless:lnoi_wafer']);
});

test('femtosecond writer: femtosecond_writing circuits 1-4, figures and slots', () => {
  const rc = T.types.femtosecond_writing.recipes;
  // OpV-A1 appended c5 (the flexspline teeth), OpV-A2 c6 (the LN-on-SOI link waveguides)
  assert.deepEqual(rc.map((r) => [r.name, r.circuit]), [['interposer_blank', 1], ['lattice_2pp', 2], ['orifice_plate', 3], ['crystal_blank', 4], ['flexspline_teeth', 5], ['ln_soi_waveguides', 6]]);
  for (const r of rc) {
    assert.equal(r.eut, 7864320, r.name);
    assert.ok(ids(r.itemsIn).length + 1 <= 3 && ids(r.itemsOut).length <= 2, r.name);
    assert.ok(ids(r.fluidsIn).length <= 1 && ids(r.fluidsOut).length <= 1, r.name);
  }
  assert.equal(by('femtosecond_writing', 'interposer_blank').duration, 800);
  assert.deepEqual(inputs(by('femtosecond_writing', 'interposer_blank')), ['grindless:ule_boule']);
  assert.ok(outputs(by('femtosecond_writing', 'interposer_blank')).includes('gtceu:ule_glass_dust'));
  assert.deepEqual(inputs(by('femtosecond_writing', 'lattice_2pp')), ['gtceu:glass_plate', 'gtceu:photoresin']);
  assert.ok(outputs(by('femtosecond_writing', 'lattice_2pp')).includes('gtceu:uncured_photoresin'));
  assert.deepEqual(inputs(by('femtosecond_writing', 'orifice_plate')), ['gtceu:rhea_plate']);
  assert.ok(outputs(by('femtosecond_writing', 'orifice_plate')).includes('gtceu:rhea_dust'));
  assert.deepEqual(inputs(by('femtosecond_writing', 'crystal_blank')), ['grindless:silica_storage_preform']);
});

test('the lines chain: every intermediate has a producer and a consumer', () => {
  const all = Object.values(T.types).flatMap((t) => t.recipes);
  const made = new Set(all.flatMap(outputs));
  const used = new Set(all.flatMap(inputs));
  const external = (id) => !id.startsWith('grindless:');
  for (const r of all) {
    for (const id of inputs(r)) {
      if (external(id)) continue;
      const elsewhere = made.has(id) || OTHER_TABLES.some((f) => fs.readFileSync(path.join(tables, f), 'utf8').includes(`"${id}"`)) ||
        ['ule_boule', 'sin_coated_wafer', 'lnoi_wafer', 'h_si28_wafer', 'oxidised_wafer', 'platinum_electrode', 'uev_emitter', 'silica_storage_preform'].some((n) => id === `grindless:${n}`);
      assert.ok(elsewhere, `${r.name} reads ${id}`);
    }
  }
  assert.ok(used.has('grindless:written_crystal_blank') && used.has('grindless:verified_crystal'));
  assert.deepEqual(outputs(by('electric_blast_furnace', 'crystal_anneal')), ['grindless:data_crystal_5d']);
  assert.deepEqual(outputs(by('assembler', 'ps_cooling_laser')), ['grindless:ps_cooling_laser']);
  assert.deepEqual(inputs(by('assembler', 'shg_486_stage')), ['grindless:ppln_waveguide', 'gtceu:uev_emitter']);
  assert.equal(by('chemical_reactor', 'sin_trench_fill').circuit, 0);
  assert.ok(by('electric_blast_furnace', 'crystal_anneal').temp > 0);
  assert.ok(by('assembler', 'ps_cooling_laser').eut <= 1966080 && by('assembler', 'shg_486_stage').eut <= 1966080);
});

test('"only from" claims: no other table or script builds these outputs', () => {
  const claims = {
    'grindless:ln_on_sin_wafer': 'ion_slicing/ln_on_sin',
    'grindless:si28_soi_wafer': 'ion_slicing/si28_soi',
    'grindless:poled_lnoi_wafer': 'ion_slicing/poled_lnoi',
    'grindless:eo_microcomb': 'ion_slicing/eo_microcomb',
    'grindless:written_interposer_blank': 'femtosecond_writing/interposer_blank',
    'grindless:lattice_2pp': 'femtosecond_writing/lattice_2pp',
    'grindless:orifice_plate': 'femtosecond_writing/orifice_plate',
    'grindless:written_crystal_blank': 'femtosecond_writing/crystal_blank',
    'grindless:ps_cooling_laser': 'assembler/ps_cooling_laser',
    'grindless:data_crystal_5d': 'electric_blast_furnace/crystal_anneal'
  };
  for (const [id, where] of Object.entries(claims)) {
    const mine = Object.entries(T.types).flatMap(([type, t]) => t.recipes.filter((r) => outputs(r).includes(id)).map((r) => `${type}/${r.name}`));
    assert.deepEqual(mine, [where], id);
    for (const f of OTHER_TABLES) {
      const txt = fs.readFileSync(path.join(tables, f), 'utf8');
      assert.ok(!new RegExp(`"(?:itemsOut|fluidsOut)"\\s*:\\s*\\[[^\\]]*"${id}"`).test(txt), `${f} produces ${id}`);
    }
    for (const f of scripts(kube)) {
      if (f.endsWith(path.join('uiv', 'tfln_femtosecond.js'))) continue;
      const src = fs.readFileSync(f, 'utf8');
      assert.ok(!new RegExp(`\\.(?:itemOutputs|outputItems|output)\\([^)]*${id}`).test(src), `${path.relative(kube, f)} outputs ${id}`);
    }
  }
});

test('the older rows exist, each marked UIV-A4', () => {
  const ph = JSON.parse(fs.readFileSync(path.join(tables, 'photonics.json'), 'utf8'));
  const foundry = JSON.stringify(ph).length > 0 ? findType(ph, 'photonic_foundry') : null;
  assert.ok(foundry, 'photonic_foundry');
  const rows = foundry.recipes.filter((r) => /UIV-A4/.test(r._why || ''));
  assert.deepEqual(rows.map((r) => [r.name, r.circuit]), [['eo_transceiver', 8], ['glass_interposer', 9], ['damascene_ring', 10], ['ppln_waveguide', 11]]);
  assert.deepEqual(outputs(rows[3]), ['grindless:ppln_waveguide', 'minecraft:water']);
  const acc = JSON.parse(fs.readFileSync(path.join(tables, 'accelerators.json'), 'utf8'));
  const sync = findType(acc, 'synchrotron');
  const row = sync.recipes.find((r) => r.name === 'damascene_trench');
  assert.ok(row && /UIV-A4/.test(row._why) && row.circuit === 7);
  assert.equal(sync.recipes.filter((r) => r.circuit === 7).length, 1);
  assert.deepEqual(outputs(row), ['grindless:trenched_oxide_wafer']);
  const fibre = read('server_scripts', 'grindless', 'uv', 'photonics.js');
  assert.match(fibre, /UIV-A4[\s\S]*?UIV_ROWS[\s\S]*?circuit: 9[\s\S]*?grindless:silica_storage_preform/);
  assert.match(fibre, /P\.a8Rows, P\.uivRows/);
});

function findType(obj, key) {
  if (obj && typeof obj === 'object') {
    if (obj[key] && obj[key].recipes) return obj[key];
    for (const v of Object.values(obj)) {
      const r = findType(v, key);
      if (r) return r;
    }
  }
  return null;
}

test('lang parity: every ENTRY and ITEM has en_us and es_es, every item has a texture', () => {
  const lang = read('client_scripts', 'grindless', 'uiv_tfln_femtosecond_lang.js');
  const itemNames = [...lang.matchAll(/^\s+\['([a-z0-9_]+)', '[^']+', '[^']+', '/gm)].map((m) => m[1]);
  const start = read('startup_scripts', 'grindless', 'uiv', 'tfln_femtosecond.js');
  const registered = [...start.matchAll(/^\s+([a-z0-9_]+): \{ stack: \d+ \}/gm)].map((m) => m[1]);
  assert.equal(registered.length, 19);
  assert.deepEqual(itemNames.sort(), registered.slice().sort());
  const keys = [...lang.matchAll(/^\s+\['((?:block|gtceu|material|grindless)\.[^']+)',\s*$/gm)].map((m) => m[1]);
  const flat = [...lang.matchAll(/^\s+\['((?:block|gtceu|material)\.[^']+)', '[^']+', '[^']+'\]/gm)].map((m) => m[1]);
  // OpV-A1: the flexspline_teeth row's EMI line lives in opv_components_lang.js.
  const opvA1 = read('client_scripts', 'grindless', 'opv_components_lang.js');
  for (const m of opvA1.matchAll(/^\s+\['(gtceu\.recipe\.[^']+)', '[^']+', '[^']+'\]/gm)) keys.push(m[1]);
  for (const k of [
    'block.gtceu.tfln_fab', 'block.gtceu.femtosecond_writer', 'gtceu.ion_slicing', 'gtceu.femtosecond_writing',
    'material.gtceu.spent_koh_etchant', 'material.gtceu.photoresin', 'material.gtceu.uncured_photoresin'
  ]) assert.ok(flat.includes(k), k);
  for (const m of ['tfln_fab', 'femtosecond_writer']) for (let i = 0; i < 1; i++) assert.ok(keys.includes(`grindless.machine.${m}.tooltip.${i}`), `${m} ${i}`);
  // OpV-A2's rows (ion slicing c5-6, femtosecond c6) keep their EMI lines in its own lang file
  const opvLang = read('client_scripts', 'grindless', 'opv_circuits_lang.js');
  for (const [type, t] of Object.entries(T.types)) {
    if (!t.dataKey) continue;
    for (const r of t.recipes) {
      const k = `gtceu.recipe.${t.dataKey}.${r.name}`;
      assert.ok(keys.includes(k) || (/^OpV-/.test(r._why || '') && opvLang.includes(`['${k}', '`)), `${type}: ${k}`);
    }
  }
  for (const n of registered) {
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), n);
  }
  for (const m of ['tfln_fab', 'femtosecond_writer']) {
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) {
      assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', m, f)), `${m}/${f}`);
    }
  }
});
