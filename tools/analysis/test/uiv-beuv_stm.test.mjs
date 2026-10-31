// UIV-A5 (docs/eras/uiv.md, machines 5 and 7; lines 11 (to the P:Si die), 13, 14): the BEUV scanner and the STM lithography cell. Static checks only (no T1).
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
const T = JSON.parse(fs.readFileSync(path.join(tables, 'beuv_stm.json'), 'utf8'));

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
const OTHER_TABLES = fs.readdirSync(tables).filter((n) => n.endsWith('.json') && n !== 'beuv_stm.json');

test('names unique, EU/t and duration positive, circuits unique per type', () => {
  const names = [];
  for (const [type, t] of Object.entries(T.types)) {
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      names.push(`${type}/${r.name}`);
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
    }
  }
  assert.equal(new Set(names).size, names.length);
});

test('BEUV scanner: beuv_lithography circuits 1-3, figures and slots', () => {
  const rc = T.types.beuv_lithography.recipes;
  // OpV-A2 appended c4 (cryo-CMOS gates), c5 (Nb TSV vias), c6 (HEMT T-gates), c7 (GaN gates) and c8 (the SDD anode)
  assert.deepEqual(rc.map((r) => [r.name, r.circuit]), [['exposure', 1], ['driver_asic', 2], ['mirror_cleaning', 3], ['cryo_cmos_exposure', 4], ['tsv_exposure', 5],
    ['hemt_gate_exposure', 6], ['gan_gate_exposure', 7], ['sdd_anode_exposure', 8]]);
  for (const r of rc) {
    assert.ok(ids(r.itemsIn).length + 1 <= 4 && ids(r.itemsOut).length <= 2, r.name);
    assert.ok(ids(r.fluidsIn).length <= 1 && ids(r.fluidsOut).length === 0, r.name);
  }
  assert.equal(by('beuv_lithography', 'exposure').eut, 31457280);
  assert.deepEqual(inputs(by('beuv_lithography', 'exposure')), ['grindless:tb_droplet_target', 'grindless:hfo2_resist_wafer', 'grindless:beuv_mirror']);
  assert.deepEqual(outputs(by('beuv_lithography', 'exposure')), ['grindless:beuv_exposed_wafer', 'grindless:fouled_beuv_mirror']);
  assert.equal(by('beuv_lithography', 'driver_asic').eut, 31457280);
  assert.deepEqual(outputs(by('beuv_lithography', 'driver_asic')), ['grindless:beuv_driver_asic']);
  assert.deepEqual(inputs(by('beuv_lithography', 'mirror_cleaning')), ['grindless:fouled_beuv_mirror']);
  assert.deepEqual(outputs(by('beuv_lithography', 'mirror_cleaning')), ['grindless:beuv_mirror', 'gtceu:terbium_dust']);
});

test('STM cell: stm_lithography circuits 1-3, figures and slots', () => {
  const rc = T.types.stm_lithography.recipes;
  // OpV-A2 appended c4 (the gated 2DEG)
  assert.deepEqual(rc.map((r) => [r.name, r.circuit]), [['h_terminate', 1], ['stm_pattern', 2], ['ph3_dose', 3], ['gate_2deg', 4]]);
  for (const r of rc) {
    assert.ok(ids(r.itemsIn).length + 1 <= 2 && ids(r.itemsOut).length <= 1, r.name);
    assert.ok(ids(r.fluidsIn).length <= 1 && ids(r.fluidsOut).length <= 1, r.name);
  }
  assert.deepEqual(inputs(by('stm_lithography', 'h_terminate')), ['grindless:si28_soi_wafer', 'gtceu:hydrogen']);
  assert.deepEqual(outputs(by('stm_lithography', 'h_terminate')), ['grindless:h_terminated_wafer']);
  assert.deepEqual(outputs(by('stm_lithography', 'stm_pattern')).slice(0, 1), ['grindless:stm_patterned_wafer']);
  assert.deepEqual(inputs(by('stm_lithography', 'ph3_dose')), ['grindless:stm_patterned_wafer', 'gtceu:phosphine']);
  assert.deepEqual(outputs(by('stm_lithography', 'ph3_dose')), ['grindless:ph3_dosed_wafer', 'gtceu:phosphine']);
});

test('the lines chain: every grindless input has a producer', () => {
  const all = Object.values(T.types).flatMap((t) => t.recipes);
  const made = new Set(all.flatMap(outputs));
  // OpV-A2: the gate-stack and GaN-on-SiC wafers come from the MOCVD reactor's script rows (uv/photonics.js OPV_ROWS)
  const external = ['si28_soi_wafer', 'uev_emitter', 'hafnia_dust', 'silicon_28_dust', 'si28_donor_wafer', 'si28_fz_ingot', 'gate_stack_soi_wafer', 'gan_sic_epi_wafer'].map((n) => `grindless:${n}`);
  for (const r of all) {
    for (const id of inputs(r)) {
      if (!id.startsWith('grindless:')) continue;
      assert.ok(made.has(id) || external.includes(id) || OTHER_TABLES.some((f) => fs.readFileSync(path.join(tables, f), 'utf8').includes(`"${id}"`)), `${r.name} reads ${id}`);
    }
  }
  assert.ok(by('chemical_reactor', 'phosphine').fluidsOut.some((f) => f.id === 'gtceu:phosphine'));
  assert.ok(outputs(by('chemical_reactor', 'phosphine_scrub')).includes('gtceu:phosphoric_acid'));
});

test('"only from" claims: no other table or script builds these outputs', () => {
  const claims = {
    'grindless:beuv_exposed_wafer': ['beuv_lithography/exposure'],
    'grindless:fouled_beuv_mirror': ['beuv_lithography/exposure', 'beuv_lithography/cryo_cmos_exposure', 'beuv_lithography/tsv_exposure',
      'beuv_lithography/hemt_gate_exposure', 'beuv_lithography/gan_gate_exposure', 'beuv_lithography/sdd_anode_exposure'],
    'grindless:beuv_driver_asic': ['beuv_lithography/driver_asic'],
    'grindless:beuv_mirror': ['assembler/beuv_mirror', 'beuv_lithography/mirror_cleaning'],
    'grindless:tb_droplet_target': ['assembler/tb_droplet_target'],
    'grindless:lan_barrier_mirror': ['chemical_reactor/lan_barrier'],
    'grindless:h_terminated_wafer': ['stm_lithography/h_terminate'],
    'grindless:stm_patterned_wafer': ['stm_lithography/stm_pattern'],
    'grindless:ph3_dosed_wafer': ['stm_lithography/ph3_dose'],
    'gtceu:phosphine': ['chemical_reactor/phosphine', 'stm_lithography/ph3_dose']
  };
  const sorted = (a) => a.slice().sort();
  for (const [id, where] of Object.entries(claims)) {
    const mine = Object.entries(T.types).flatMap(([type, t]) => t.recipes.filter((r) => outputs(r).includes(id)).map((r) => `${type}/${r.name}`));
    assert.deepEqual(sorted(mine), sorted(where), id);
    for (const f of OTHER_TABLES) {
      const txt = fs.readFileSync(path.join(tables, f), 'utf8');
      assert.ok(!new RegExp(`"(?:itemsOut|fluidsOut)"\\s*:\\s*\\[[^\\]]*"${id}"`).test(txt), `${f} produces ${id}`);
    }
    for (const f of scripts(kube)) {
      if (f.endsWith(path.join('uiv', 'beuv_stm.js'))) continue;
      const src = fs.readFileSync(f, 'utf8');
      assert.ok(!new RegExp(`\\.(?:itemOutputs|outputItems|output)\\([^)]*${id}`).test(src), `${path.relative(kube, f)} outputs ${id}`);
    }
  }
});

test('the older rows exist, each marked UIV-A5', () => {
  const ph = JSON.parse(fs.readFileSync(path.join(tables, 'photonics.json'), 'utf8'));
  const mbe = findType(ph, 'molecular_beam_epitaxy');
  assert.ok(mbe, 'molecular_beam_epitaxy');
  const m = mbe.recipes.filter((r) => /UIV-A5/.test(r._why || ''));
  assert.deepEqual(m.map((r) => [r.name, r.circuit]), [['la_b4c_multilayer', 5], ['psi_overgrowth', 6]]);
  assert.ok(outputs(m[1]).includes('grindless:p_si_die'));
  assert.equal(mbe.recipes.filter((r) => r.circuit === 5 || r.circuit === 6).length, 2);
  const foundry = findType(ph, 'photonic_foundry');
  const f = foundry.recipes.filter((r) => /UIV-A5/.test(r._why || ''));
  assert.deepEqual(f.map((r) => [r.name, r.circuit]), [['hfo2_resist', 12]]);
  assert.ok(outputs(f[0]).includes('grindless:hfo2_resist_wafer'));
  assert.equal(foundry.recipes.filter((r) => r.circuit === 12).length, 1);

  assert.match(read('server_scripts', 'grindless', 'uv', 'detectors.js'), /UIV-A5[\s\S]*?circuit: 6[\s\S]*?si28_fz_ingot[\s\S]*?circuit: 7[\s\S]*?si28_donor_wafer/);
  assert.match(read('server_scripts', 'grindless', 'uhv', 'propulsion.js'), /TABLE\.push\(row\('b4c_target', 'spark_plasma_sintering', 5,/);
  assert.match(read('server_scripts', 'grindless', 'zpm', 'qubits.js'), /UIV-A5[\s\S]*?circuit: 6[\s\S]*?h_si28_wafer/);
});

test('lang parity: every ENTRY and ITEM has en_us and es_es, every item has a texture', () => {
  const lang = read('client_scripts', 'grindless', 'uiv_beuv_stm_lang.js');
  const itemNames = [...lang.matchAll(/^\s+\['([a-z0-9_]+)', '[^']+', '[^']+', /gm)].map((m) => m[1]);
  const start = read('startup_scripts', 'grindless', 'uiv', 'beuv_stm.js');
  const registered = [...start.matchAll(/^\s+([a-z0-9_]+): \{ stack: \d+ \}/gm)].map((m) => m[1]);
  assert.equal(registered.length, 14);
  assert.deepEqual(itemNames.sort(), registered.slice().sort());
  const keys = [...lang.matchAll(/^\s+\['((?:block|gtceu|material|grindless)\.[^']+)',\s*$/gm)].map((m) => m[1]);
  const flat = [...lang.matchAll(/^\s+\['((?:block|gtceu|material)\.[^']+)', '[^']+', '[^']+'\]/gm)].map((m) => m[1]);
  for (const k of ['block.gtceu.beuv_scanner', 'block.gtceu.stm_lithography_cell', 'gtceu.beuv_lithography', 'gtceu.stm_lithography', 'material.gtceu.phosphine']) {
    assert.ok(flat.includes(k), k);
  }
  for (const m of ['beuv_scanner', 'stm_lithography_cell']) for (let i = 0; i < 1; i++) assert.ok(keys.includes(`grindless.machine.${m}.tooltip.${i}`), `${m} ${i}`);
  // OpV-A2's rows (BEUV c4-8, STM c4) keep their EMI lines in its own lang file
  const opvLang = read('client_scripts', 'grindless', 'opv_circuits_lang.js');
  for (const t of Object.values(T.types)) {
    if (!t.dataKey) continue;
    for (const r of t.recipes) {
      const k = `gtceu.recipe.${t.dataKey}.${r.name}`;
      assert.ok(keys.includes(k) || (/^OpV-/.test(r._why || '') && opvLang.includes(`['${k}', '`)), k);
    }
  }
  for (const n of registered) assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), n);
  for (const m of ['beuv_scanner', 'stm_lithography_cell']) {
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) {
      assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', m, f)), `${m}/${f}`);
    }
  }
});
