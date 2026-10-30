// UIV-A2 (docs/eras/uiv.md, "A2. Metallic hydrogen"): the ramp-compression pulser's table, lines 1 to 4 and the five older rows,
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
const T = JSON.parse(fs.readFileSync(path.join(tables, 'metallic_hydrogen.json'), 'utf8'));

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
const OTHER_TABLES = fs.readdirSync(tables).filter((n) => n.endsWith('.json') && n !== 'metallic_hydrogen.json');

test('names unique, EU/t and duration positive, circuits unique per type', () => {
  for (const [type, t] of Object.entries(T.types)) {
    assert.equal(new Set(t.recipes.map((r) => r.name)).size, t.recipes.length, type);
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
    }
  }
});

test('pulser recipes: circuits 1/2/3 and the 3 / 2 item, 1 / 1 fluid slots', () => {
  const rc = T.types.ramp_compression.recipes;
  assert.deepEqual(rc.map((r) => [r.name, r.circuit]), [['mh_quench', 1], ['lonsdaleite_shock', 2], ['cg_nitrogen_shock', 3]]);
  for (const r of rc) {
    assert.ok(ids(r.itemsIn).length <= 3 && ids(r.itemsOut).length <= 2, r.name);
    assert.ok(ids(r.fluidsIn).length <= 1 && ids(r.fluidsOut).length <= 1, r.name);
  }
  assert.deepEqual(inputs(by('ramp_compression', 'mh_quench')), ['grindless:solid_para_h2_target']);
  assert.ok(by('ramp_compression', 'mh_quench').fluidsOut.some((f) => f.id === 'gtceu:para_hydrogen'));
  assert.ok(by('ramp_compression', 'cg_nitrogen_shock').fluidsOut.some((f) => f.id === 'gtceu:nitrogen'));
  assert.ok(by('ramp_compression', 'lonsdaleite_shock').itemsOut.some((o) => o.id === 'gtceu:graphite_dust'));
  assert.match(read('startup_scripts', 'grindless', 'uiv', 'metallic_hydrogen.js'), /ramp_compression_pulser/);
});

test('metallic hydrogen, lonsdaleite and cg-N come only from the pulser', () => {
  const claims = {
    'gtceu:metallic_hydrogen_ingot': 'mh_quench',
    'gtceu:lonsdaleite_dust': 'lonsdaleite_shock',
    'gtceu:cubic_gauche_nitrogen_dust': 'cg_nitrogen_shock'
  };
  for (const [id, name] of Object.entries(claims)) {
    const mine = Object.entries(T.types).flatMap(([type, t]) => t.recipes.filter((r) => outputs(r).includes(id)).map((r) => `${type}/${r.name}`));
    assert.deepEqual(mine, [`ramp_compression/${name}`], id);
    for (const f of OTHER_TABLES) {
      const txt = fs.readFileSync(path.join(tables, f), 'utf8');
      assert.ok(!new RegExp(`"(?:itemsOut|fluidsOut)"\\s*:\\s*\\[[^\\]]*"${id}"`).test(txt), `${f} produces ${id}`);
    }
    for (const f of scripts(kube)) {
      if (f.endsWith(path.join('uiv', 'metallic_hydrogen.js'))) continue;
      const src = fs.readFileSync(f, 'utf8');
      // no script may build a recipe whose output is this id (inputs, removals and tags are fine)
      assert.ok(!new RegExp(`\\.(?:itemOutputs|outputItems|output)\\([^)]*${id}`).test(src), `${path.relative(kube, f)} outputs ${id}`);
    }
  }
});

test('MH wire and the five cable sizes: one recipe per lookup path', () => {
  assert.deepEqual(inputs(by('wiremill', 'mh_wire')), ['gtceu:metallic_hydrogen_ingot']);
  const sizes = ['single', 'double', 'quadruple', 'octal', 'hex'];
  const circuits = [1, 2, 4, 8, 16];
  sizes.forEach((s, i) => {
    const r = by('assembler', `mh_cable_${s}`);
    assert.equal(r.circuit, circuits[i], s);
    assert.ok(outputs(r).includes(`gtceu:metallic_hydrogen_${s}_cable`), s);
    assert.ok(inputs(r).includes('grindless:ffkm_seal'), s);
  });
  const srv = read('server_scripts', 'grindless', 'uiv', 'metallic_hydrogen.js');
  assert.match(srv, /WIRE \+ 'single_wire'/);
  assert.match(srv, /WIRE \+ size \+ '_cable'/);
});

test('the pulser line: bearing, piston, DAC charge, laser and quench steps', () => {
  assert.equal(by('assembler', 'lonsdaleite_bearing').circuit, 5);
  const piston = by('assembler', 'uiv_electric_piston');
  assert.equal(piston.circuit, 6);
  assert.ok(inputs(piston).includes('gtceu:uev_electric_piston'));
  assert.ok(inputs(piston).includes('grindless:lonsdaleite_bearing'));
  assert.ok(inputs(piston).includes('gtceu:metallic_hydrogen_single_cable'));
  assert.equal(by('assembler', 'dac_charge').circuit, 7);
  assert.ok(inputs(by('chemical_reactor', 'lonsdaleite_leach')).includes('gtceu:lonsdaleite_dust'));
  assert.ok(inputs(by('chemical_reactor', 'cg_nitrogen_quench')).includes('gtceu:cubic_gauche_nitrogen_dust'));
  assert.ok(outputs(by('chemical_reactor', 'cg_nitrogen_quench')).includes('grindless:quenched_cg_nitrogen'));
  assert.ok(inputs(by('laser_engraver', 'lonsdaleite_race')).includes('grindless:leached_lonsdaleite'));
  assert.ok(inputs(by('laser_engraver', 'laser_heated_n2')).includes('grindless:dac_charge'));
  assert.ok(outputs(by('laser_engraver', 'laser_heated_n2')).includes('grindless:laser_heated_n2_charge'));
});

test('the five older rows exist', () => {
  const cryo = read('server_scripts', 'grindless', 'ev', 'cryogenic_plant.js');
  assert.match(cryo, /UIV-A2/);
  assert.match(cryo, /gtceu:protium[\s\S]*?gtceu:para_hydrogen/);
  assert.match(cryo, /gtceu:liquid_para_hydrogen/);
  const cold = read('server_scripts', 'grindless', 'uv', 'cold.js');
  assert.match(cold, /para_h2_target[\s\S]*?gtceu:liquid_para_hydrogen/);
  assert.match(cold, /grindless:solid_para_h2_target/);
  const hw = JSON.parse(fs.readFileSync(path.join(tables, 'heavy_water_plant.json'), 'utf8'));
  const draw = JSON.stringify(hw);
  assert.match(draw, /"name": ?"protium_draw_off"/);
  assert.ok(draw.includes('gtceu:protium'));
  const mw = fs.readFileSync(path.join(tables, 'magnet_works.json'), 'utf8');
  assert.match(mw, /"name": ?"mh_winding"/);
  assert.ok(mw.includes('grindless:mh_winding'));
  assert.ok(mw.includes('gtceu:metallic_hydrogen_single_wire'));
  const oc = read('server_scripts', 'grindless', 'zpm', 'outer_chemistry.js');
  assert.match(oc, /grindless:pyrolytic_graphite/);
  assert.match(oc, /UIV-A2/);
});

test('the quench is named fiction and en_us / es_es have the same keys', () => {
  const lang = read('client_scripts', 'grindless', 'uiv_metallic_hydrogen_lang.js');
  assert.match(lang, /Fiction:/);
  assert.match(lang, /Ficción:/);
  const startup = read('startup_scripts', 'grindless', 'uiv', 'metallic_hydrogen.js');
  for (const n of ['solid_para_h2_target', 'pyrolytic_graphite', 'leached_lonsdaleite', 'lonsdaleite_race', 'lonsdaleite_bearing', 'dac_charge', 'laser_heated_n2_charge', 'quenched_cg_nitrogen']) {
    assert.ok(startup.includes(n), n);
    assert.ok(lang.includes(`'${n}'`), n);
  }
  for (const n of ['mh_quench', 'lonsdaleite_shock', 'cg_nitrogen_shock']) assert.ok(lang.includes(`grindless_ramp_compression.${n}`), n);
  assert.match(lang, /\['en_us', 'es_es'\]/);
});
