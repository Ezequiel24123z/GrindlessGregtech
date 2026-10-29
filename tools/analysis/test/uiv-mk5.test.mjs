// UIV-A9 (docs/eras/uiv.md, machines 9 and 10; lines 7, 25-29): the polarised proton source and the Mk5 fusion ring. Static checks only here; T1 is gg_test_uiv_mk5.
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
const json = (f) => JSON.parse(fs.readFileSync(path.join(tables, f), 'utf8'));
const T = json('mk5.json');

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn), ids(r.charge));
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
const OTHER_TABLES = fs.readdirSync(tables).filter((n) => n.endsWith('.json') && n !== 'mk5.json');

test('names unique, EU/t and duration positive, circuits unique per type, GTM types use none', () => {
  const names = [];
  for (const [type, t] of Object.entries(T.types)) {
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      names.push(r.name);
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
      if (type !== 'proton_polarisation') assert.equal(r.circuit, 0, r.name);
    }
  }
  assert.equal(new Set(names).size, names.length);
});

test('polarised proton source: circuits 1-3, 31457280 EU/t, 800 t, slots', () => {
  const rc = T.types.proton_polarisation.recipes;
  assert.deepEqual(rc.map((r) => [r.name, r.circuit]), [['rf_dissociation', 1], ['li6h_polarisation', 2], ['nh3_polarisation', 3]]);
  for (const r of rc) {
    assert.equal(r.eut, 31457280, r.name);
    assert.equal(r.duration, 800, r.name);
    assert.ok(r.itemsIn.length + 1 <= 2 && r.itemsOut.length <= 1 && r.fluidsIn.length <= 1 && r.fluidsOut.length <= 2, r.name);
  }
  assert.deepEqual(inputs(rc[0]), ['gtceu:detritiated_protium']);
  assert.deepEqual(outputs(rc[0]), ['gtceu:polarised_h_gas', 'gtceu:hydrogen']);
  assert.deepEqual(inputs(rc[1]), ['grindless:li6_hydride', 'gtceu:helium']);
  assert.deepEqual(outputs(rc[1]), ['grindless:polarised_li6h']);
  assert.deepEqual(inputs(rc[2]), ['gtceu:nitrogen_15_ammonia']);
  assert.deepEqual(outputs(rc[2]), ['grindless:polarised_15nh3_ice']);
});

test('Li-6 metal dust and the chain to the pellets and fuels', () => {
  assert.deepEqual(inputs(by('chemical_reactor', 'li6_hydride')), ['gtceu:lithium_6_metal_dust', 'gtceu:hydrogen']);
  assert.deepEqual(outputs(by('chemical_reactor', 'li6_hydride')), ['grindless:li6_hydride']);
  assert.deepEqual(inputs(by('chemical_reactor', 'polarised_he3_cell')), ['gtceu:silicon_dioxide_dust', 'gtceu:polarised_helium_3']);
  assert.deepEqual(inputs(by('compressor', 'polarised_li6h_pellet')), ['grindless:polarised_li6h']);
  assert.deepEqual(inputs(by('compressor', 'polarised_h_pellet')), ['grindless:polarised_h_ice']);
  assert.deepEqual(inputs(by('compressor', 'polarised_15nh3_pellet')), ['grindless:polarised_15nh3_ice']);
  assert.deepEqual(inputs(by('mixer', 'he3he3_fuel')), ['grindless:polarised_he3_cell', 'gtceu:helium']);
  assert.deepEqual(outputs(by('mixer', 'he3he3_fuel')), ['gtceu:silicon_dioxide_dust', 'gtceu:he3he3_fuel']);
  assert.deepEqual(inputs(by('mixer', 'pli6_fuel')), ['grindless:polarised_li6h_pellet', 'grindless:polarised_h_pellet', 'gtceu:helium']);
  assert.deepEqual(inputs(by('mixer', 'pn15_fuel')), ['grindless:polarised_15nh3_pellet', 'grindless:polarised_h_pellet', 'gtceu:helium']);
  assert.deepEqual(outputs(by('centrifuge', 'pn15_ash_split')), ['gtceu:carbon_12_dust', 'gtceu:helium']);
  assert.deepEqual(inputs(by('centrifuge', 'he3he3_ash_split')), ['gtceu:he3he3_ash']);
});

test('Mk5 ring: three fuels, three plasmas, starts above 2^31, within the tier-11 limit and 5.12 G storage', () => {
  const rc = T.types.fusion_reactor.recipes;
  assert.deepEqual(rc.map((r) => [r.name, r.start, r.eut]), [['uiv_he3he3', 4000000000, 31457280], ['uiv_pli6', 3000000000, 25165824], ['uiv_pn15', 4800000000, 31457280]]);
  for (const r of rc) {
    assert.ok(r.start > 2 ** 31 && r.start <= 5120000000, r.name);
    assert.ok(r.eut <= 33554432 && r.duration === 16, r.name);
    assert.equal(r.fluidsIn[0].amount, 128, r.name);
    assert.equal(r.fluidsOut[0].amount, 1024, r.name);
  }
  assert.deepEqual(outputs(rc[0]), ['gtceu:he3he3_plasma']);
  assert.deepEqual(outputs(rc[1]), ['gtceu:pli6_plasma']);
  assert.deepEqual(outputs(rc[2]), ['gtceu:pn15_plasma']);
  const start = read('startup_scripts', 'grindless', 'uiv', 'mk5.js');
  assert.match(start, /registerFusionTier\(11/);
  assert.match(start, /gtceu:uiv_fusion_reactor/);
});

test('casing: resolves from the W fibre preform and Li-Sn; line 7 and 29 steps', () => {
  assert.deepEqual(inputs(by('assembler', 'first_wall_tile')), ['grindless:plasma_sprayed_tile', 'gtceu:tungsten_steel_plate', 'gtceu:rhea_plate', 'gtceu:argon']);
  assert.deepEqual(inputs(by('assembler', 'li_sn_armoured_tile')), ['grindless:first_wall_tile', 'gtceu:tungsten_foil', 'gtceu:rhea_plate', 'gtceu:li_sn']);
  assert.deepEqual(inputs(by('assembler', 'uiv_fusion_casing_wall')), ['grindless:li_sn_armoured_tile', 'grindless:w_fibre_preform', 'gtceu:tungsten_foil', 'gtceu:rhea_plate', 'gtceu:li_sn', 'gtceu:argon']);
  assert.deepEqual(inputs(by('assembler', 'cps_wetted_mesh')), ['grindless:w_mesh', 'gtceu:rhea_plate', 'gtceu:tungsten_foil', 'gtceu:li_sn', 'gtceu:argon']);
  assert.deepEqual(inputs(by('assembler', 'divertor_cassette')), ['grindless:cps_wetted_mesh', 'gtceu:tungsten_steel_plate', 'gtceu:rhea_plate', 'gtceu:helium']);
  assert.deepEqual(inputs(by('assembler', 'divertor')), ['grindless:divertor_cassette', 'grindless:w_fibre_preform', 'gtceu:rhea_plate', 'gtceu:tungsten_foil', 'gtceu:argon']);
  assert.deepEqual(ids(by('assembler', 'uiv_fusion_casing_divertor').itemsIn)[0], 'grindless:divertor');
  for (const n of ['uiv_fusion_casing_wall', 'uiv_fusion_casing_divertor']) assert.deepEqual(ids(by('assembler', n).itemsOut), ['grindless:uiv_fusion_casing']);
});

test('"only from" claims: no other table or script builds these outputs', () => {
  const claims = {
    'grindless:li6_hydride': 'chemical_reactor/li6_hydride',
    'grindless:polarised_li6h': 'proton_polarisation/li6h_polarisation',
    'grindless:polarised_15nh3_ice': 'proton_polarisation/nh3_polarisation',
    'grindless:polarised_li6h_pellet': 'compressor/polarised_li6h_pellet',
    'grindless:polarised_h_pellet': 'compressor/polarised_h_pellet',
    'grindless:polarised_15nh3_pellet': 'compressor/polarised_15nh3_pellet',
    'grindless:polarised_he3_cell': 'chemical_reactor/polarised_he3_cell',
    'grindless:first_wall_tile': 'assembler/first_wall_tile',
    'grindless:li_sn_armoured_tile': 'assembler/li_sn_armoured_tile',
    'grindless:cps_wetted_mesh': 'assembler/cps_wetted_mesh',
    'grindless:divertor_cassette': 'assembler/divertor_cassette',
    'grindless:divertor': 'assembler/divertor',
    'gtceu:he3he3_fuel': 'mixer/he3he3_fuel',
    'gtceu:pli6_fuel': 'mixer/pli6_fuel',
    'gtceu:pn15_fuel': 'mixer/pn15_fuel',
    'gtceu:he3he3_plasma': 'fusion_reactor/uiv_he3he3',
    'gtceu:pli6_plasma': 'fusion_reactor/uiv_pli6',
    'gtceu:pn15_plasma': 'fusion_reactor/uiv_pn15',
    'gtceu:nitrogen_15_ammonia': 'chemical_reactor/nitrogen_15_ammonia',
    'gtceu:pn15_ash': null
  };
  for (const [id, where] of Object.entries(claims)) {
    const mine = Object.entries(T.types).flatMap(([type, t]) => t.recipes.filter((r) => outputs(r).includes(id)).map((r) => `${type}/${r.name}`));
    assert.deepEqual(mine, where ? [where] : [], id);
    for (const f of OTHER_TABLES) {
      const txt = fs.readFileSync(path.join(tables, f), 'utf8');
      assert.equal([...txt.matchAll(new RegExp(`"(?:itemsOut|fluidsOut)"\\s*:\\s*\\[[^\\]]*"${id}"`, 'g'))].length, 0, `${f} produces ${id}`);
    }
    for (const f of scripts(kube)) {
      if (f.endsWith(path.join('uiv', 'mk5.js'))) continue;
      const src = fs.readFileSync(f, 'utf8');
      assert.ok(!new RegExp(`\\.(?:itemOutputs|outputItems|output|outputFluids)\\([^)]*${id}`).test(src), `${path.relative(kube, f)} outputs ${id}`);
    }
  }
  // the ash is made by the converter rows in tables/fusion_mk5.json
  const mk5 = json('fusion_mk5.json').converter.recipes;
  assert.deepEqual(mk5.map((r) => [r.name, r.input, r.output, r.eut, r.total]), [
    ['uiv_he3he3_plasma', 'gtceu:he3he3_plasma', 'gtceu:he3he3_ash', 524288, 67108864],
    ['uiv_pli6_plasma', 'gtceu:pli6_plasma', 'gtceu:pli6_ash', 393216, 50331648],
    ['uiv_pn15_plasma', 'gtceu:pn15_plasma', 'gtceu:pn15_ash', 786432, 100663296]]);
  for (const r of mk5) assert.equal(r.eut * 128, r.total, r.name);
});

test('older rows exist, each marked UIV-A9', () => {
  const cold = read('server_scripts', 'grindless', 'uv', 'cold.js');
  assert.match(cold, /UIV-A9[^\n]*\n\s*\{ name: 'pli6_ash_split', type: 'superfluid_helium', circuit: null[\s\S]*?gtceu:pli6_ash', 1000[\s\S]*?gtceu:helium_3', 500\), fluid\('gtceu:helium', 500\)/);
  assert.match(cold, /UIV-A9[^\n]*\n\s*\{ name: 'polarised_h_ice', type: 'srf_cavity', circuit: 6[\s\S]*?gtceu:polarised_h_gas', 1000[\s\S]*?grindless:polarised_h_ice/);
  assert.ok(cold.indexOf("name: 'he3_he4_mixture'") < cold.indexOf("name: 'pli6_ash_split'"));
  const th = json('thorium.json').types.pyroprocessing.recipes;
  const row = th[th.length - 1];
  assert.equal(row.name, 'li_sn_eutectic');
  assert.match(row._why, /^UIV-A9:/);
  assert.equal(row.circuit, 9);
  assert.equal(th.filter((r) => r.circuit === 9).length, 1);
  assert.deepEqual(inputs(row), ['gtceu:lithium_dust', 'gtceu:tin_dust']);
  assert.deepEqual(outputs(row), ['gtceu:li_sn']);
  const am = json('am_powders.json').parts;
  const w = am[am.length - 1];
  assert.deepEqual([w.name, w.metal, w.circuit, w.nearNet, w.output], ['w_mesh', 'rhea', 8, 'grindless:near_net_w_mesh', 'grindless:w_mesh']);
  assert.match(w._why, /^UIV-A9/);
  assert.equal(am.filter((p) => p.circuit === 8).length, 1);
  const sp = json('fusion_mk4.json').types.spin_polarisation.recipes;
  const p5 = sp[sp.length - 1];
  assert.equal(p5.name, 'polarise_helium_3_mk5');
  assert.match(p5._why, /^UIV-A9:/);
  assert.equal(p5.circuit, 3);
  assert.equal(sp.filter((r) => r.circuit === 3).length, 1);
  assert.deepEqual(p5.notConsumed, ['grindless:laser_1083nm']);
  assert.deepEqual(outputs(p5), ['gtceu:polarised_helium_3', 'gtceu:helium_3']);
  const fz = read('server_scripts', 'grindless', 'zpm', 'fusion.js');
  assert.match(fz, /UIV-A9[\s\S]*?function addMk5Converter[\s\S]*?function addMk5Quench[\s\S]*?grindless:wf_rhea_billet[\s\S]*?grindless:plasma_sprayed_tile/);
  assert.match(fz, /F\.mk5Converter = addMk5Converter/);
  const tr = read('server_scripts', 'grindless', 'iv', 'tritium_removal.js');
  assert.match(tr, /UIV-A9[\s\S]*?gtceu:protium', 1000[\s\S]*?gtceu:deuterium', 100[\s\S]*?gtceu:detritiated_protium', 950[\s\S]*?gtceu:tritium', 50/);
});

test('controllers: UIV hull, 2 UIV parts and 2 optical mainframes', () => {
  const src = read('server_scripts', 'grindless', 'uiv', 'mk5.js');
  assert.match(src, /gtceu:uiv_machine_hull/);
  assert.match(src, /gtnn:optical_mainframe/);
  assert.doesNotMatch(src, /\['OPO', 'PHP'\]|gtceu\.shaped/, 'no shaped controller recipe any more');
  assert.match(src, /event\.recipes\.gtceu\.assembly_line\('grindless:' \+ d\.name\)/);
  assert.match(src, /grindless:assembly_line\/' \+ d\.name/);
  assert.match(src, /b\.itemInputs\('2x ' \+ d\.part\)/);
  assert.match(src, /b\.itemInputs\('2x ' \+ MAINFRAME\)/);
  assert.match(src, /b\.itemInputs\('4x #gtceu:circuits\/uiv'\)/);
  assert.match(src, /inputFluids\(Fluid\.of\('gtceu:soldering_alloy', 2304\), Fluid\.of\('gtceu:lubricant', 2000\), Fluid\.of\('gtceu:neutronium', 576\)\)/);
  assert.match(src, /stationResearch/);
  assert.match(src, /name: 'polarised_proton_source', part: 'grindless:uiv_electric_pump', research: 'grindless:cps_wetted_mesh'/);
  assert.match(src, /name: 'uiv_fusion_reactor', part: 'grindless:uiv_electric_piston', research: 'grindless:divertor'/);
});

test('lang parity: every ENTRY and ITEM has en_us and es_es, every item has a texture', () => {
  const lang = read('client_scripts', 'grindless', 'uiv_mk5_lang.js');
  const itemNames = [...lang.matchAll(/^\s+\['([a-z0-9_]+)', '[^']+', '[^']+', /gm)].map((m) => m[1]);
  const start = read('startup_scripts', 'grindless', 'uiv', 'mk5.js');
  const registered = [...start.matchAll(/^\s+([a-z0-9_]+): \{ stack: \d+ \}/gm)].map((m) => m[1]);
  assert.equal(registered.length, 16);
  assert.deepEqual(itemNames.sort(), registered.slice().sort());
  const keys = [...lang.matchAll(/^\s+\['((?:block|gtceu|material|grindless|emi)\.[^']+)',\s*$/gm)].map((m) => m[1]);
  const flat = [...lang.matchAll(/^\s+\['((?:block|gtceu|material)\.[^']+)', '[^']+', '[^']+'\]/gm)].map((m) => m[1]);
  for (const k of ['block.gtceu.polarised_proton_source', 'block.gtceu.uiv_fusion_reactor', 'gtceu.proton_polarisation', 'material.gtceu.detritiated_protium', 'material.gtceu.polarised_h_gas', 'material.gtceu.nitrogen_15_ammonia']) assert.ok(flat.includes(k), k);
  assert.ok(keys.includes('gtceu.recipe.grindless_pyroprocessing.li_sn_eutectic'));
  for (const m of ['polarised_proton_source', 'uiv_fusion_reactor']) for (let i = 0; i < 3; i++) assert.ok(keys.includes(`grindless.machine.${m}.tooltip.${i}`), `${m} ${i}`);
  for (const i of [0, 1]) assert.ok(keys.includes(`emi.grindless.info.uiv_mk5.${i}`), `emi ${i}`);
  for (const [type, t] of Object.entries(T.types)) {
    if (!t.dataKey) continue;
    for (const r of t.recipes) assert.ok(keys.includes(`gtceu.recipe.${t.dataKey}.${r.name}`), `${t.dataKey}.${r.name}`);
  }
  assert.equal((lang.match(/'es_es'/g) || []).length, 1);
  for (const n of registered) assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), n);
  for (const m of ['polarised_proton_source', 'uiv_fusion_reactor']) {
    for (const f of ['overlay_front.png', 'overlay_front_active.png', 'overlay_front_active_emissive.png']) {
      assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', m, f)), `${m}/${f}`);
    }
  }
  assert.ok(fs.existsSync(path.join(kube, 'assets', 'emi', 'recipe', 'additions', 'grindless', 'uiv_mk5_fuels.json')));
});
