// UIV-A10 (docs/eras/uiv.md, machines 11 and 12; lines 19, 20, 21, 37, 41, 43, 46): the Matrioshka computer and the droplet radiator works. Static checks only.
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
const T = JSON.parse(fs.readFileSync(path.join(tables, 'matrioshka.json'), 'utf8'));
const GTM = new Set(['assembler', 'chemical_reactor', 'laser_engraver', 'cutter', 'lathe', 'mixer', 'assembly_line']);

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.fluidsIn));
const outputs = (r) => ids(r.itemsOut).concat(ids(r.fluidsOut));
const by = (type, name) => {
  const r = T.types[type].recipes.find((x) => x.name === name);
  assert.ok(r, `${type}/${name}`);
  return r;
};
const all = Object.entries(T.types).flatMap(([type, t]) => t.recipes.map((r) => ({ type, ...r })));

function scripts(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...scripts(p));
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}
const OTHER_TABLES = fs.readdirSync(tables).filter((n) => n.endsWith('.json') && n !== 'matrioshka.json');
const startup = read('startup_scripts', 'grindless', 'uiv', 'matrioshka.js');
const lang = read('client_scripts', 'grindless', 'uiv_matrioshka_lang.js');
const itemNames = [...startup.slice(startup.indexOf('MA.items'), startup.indexOf('MA.blocks')).matchAll(/^\s{4}(\w+): \{ stack/gm)].map((m) => m[1]);
const blockNames = [...startup.slice(startup.indexOf('MA.blocks')).matchAll(/^\s{4}(\w+): \{ texture/gm)].map((m) => m[1]);

test('names unique, EU/t and duration positive, circuits unique per type (0 only for GTM types)', () => {
  const names = [];
  for (const [type, t] of Object.entries(T.types)) {
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      names.push(r.name);
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
      assert.ok(r.circuit > 0 || GTM.has(type), `${type}/${r.name} needs a circuit`);
      assert.match(r._why, /^UIV-A10/, r.name);
    }
  }
  assert.equal(new Set(names).size, names.length);
});

test('Matrioshka computer: circuits 1-3, 31457280 EU/t, orbit only, research NBT written only by c1', () => {
  const rc = T.types.matrioshka_computing.recipes;
  assert.deepEqual(rc.map((r) => [r.name, r.circuit]), [['research_write', 1], ['ns_eos_chart', 2], ['kerr_chart', 3]]);
  for (const r of rc) { assert.equal(r.eut, 31457280, r.name); assert.equal(r.site, true, r.name); assert.ok(r.itemsIn.length + 1 <= 3); }
  assert.deepEqual(inputs(by('matrioshka_computing', 'research_write')), ['grindless:data_crystal_5d', 'gtceu:data_module']);
  assert.match(by('matrioshka_computing', 'research_write').itemsOut[0].nbt, /research_id:"rad_hard_controller".*gtceu:assembly_line/);
  assert.deepEqual(inputs(by('matrioshka_computing', 'ns_eos_chart')), ['grindless:xray_pulse_timed', 'grindless:degenerate_pellet']);
  assert.deepEqual(outputs(by('matrioshka_computing', 'ns_eos_chart')), ['grindless:ns_eos_chart']);
  assert.deepEqual(inputs(by('matrioshka_computing', 'kerr_chart')), ['grindless:correlated_kerr_data']);
  assert.deepEqual(outputs(by('matrioshka_computing', 'kerr_chart')), ['grindless:kerr_chart']);
  // only this machine writes research NBT
  assert.equal(all.filter((r) => ids(r.itemsOut).length && r.itemsOut.some((o) => o.nbt)).length, 1);
  for (const f of scripts(kube)) {
    if (f.endsWith(path.join('uiv', 'matrioshka.js'))) continue;
    assert.ok(!/research_id\s*:\s*"?rad_hard_controller/.test(fs.readFileSync(f, 'utf8')), path.relative(kube, f));
  }
});

test('droplet radiator works: circuits 1-2, orbit only, tin overflow returned, orifice plate used', () => {
  const rc = T.types.droplet_radiator_assembly.recipes;
  assert.deepEqual(rc.map((r) => [r.name, r.circuit]), [['radiator_module', 1], ['tpv_tile', 2]]);
  for (const r of rc) { assert.equal(r.eut, 31457280, r.name); assert.equal(r.site, true, r.name); }
  assert.deepEqual(inputs(by('droplet_radiator_assembly', 'radiator_module')),
    ['grindless:orifice_plate', 'grindless:eb_distilled_tin', 'grindless:droplet_collector']);
  assert.deepEqual(outputs(by('droplet_radiator_assembly', 'radiator_module')), ['grindless:droplet_radiator_module', 'gtceu:tin_ingot']);
  assert.deepEqual(inputs(by('droplet_radiator_assembly', 'tpv_tile')), ['grindless:ingaasb_tpv_cell', 'grindless:selective_emitter']);
});

test('the three temporary EMI exceptions have real uses: lattice_2pp, orifice_plate, data_crystal_5d', () => {
  const cvi = JSON.parse(fs.readFileSync(path.join(tables, 'composites.json'), 'utf8'));
  const glassy = cvi.types.chemical_vapour_infiltration.recipes.find((r) => r.name === 'glassy_carbon_lattice');
  assert.ok(glassy && ids(glassy.itemsIn).includes('grindless:lattice_2pp'));
  assert.ok(inputs(by('droplet_radiator_assembly', 'radiator_module')).includes('grindless:orifice_plate'));
  assert.ok(inputs(by('matrioshka_computing', 'research_write')).includes('grindless:data_crystal_5d'));
});

test('lines 19, 21, 37, 41, 43, 46 chain: every step feeds the next', () => {
  const chain = [
    ['chemical_reactor', 'sic_coat_lattice', 'grindless:sic_coated_lattice'],
    ['assembler', 'droplet_wick', 'grindless:droplet_wick'],
    ['assembler', 'droplet_collector', 'grindless:droplet_collector'],
    ['lathe', 'c12_polish', 'grindless:c12_polished_plate'],
    ['chemical_reactor', 'c12_metallise', 'grindless:c12_metallised_plate'],
    ['assembler', 'matrioshka_node', 'grindless:matrioshka_node'],
    ['cutter', 'tpv_dicing', 'grindless:ingaasb_tpv_cell'],
    ['assembler', 'tpv_segment', 'grindless:tpv_segment'],
    ['assembler', 'matrioshka_tpv_shell', 'grindless:matrioshka_tpv_shell'],
    ['laser_engraver', 'aqfp_die', 'grindless:aqfp_die'],
    ['assembler', 'aqfp_bond', 'grindless:aqfp_module'],
    ['assembler', 'logic_tile_block', 'grindless:matrioshka_logic_tile'],
    ['assembler', 'schottky_die', 'grindless:diamond_schottky_die'],
    ['assembly_line', 'rad_hard_controller', 'grindless:rad_hard_controller'],
    ['chemical_reactor', 'w_sputter', 'grindless:sputtered_w_wafer'],
    ['chemical_reactor', 'hfo2_passivate', 'grindless:hfo2_passivated_crystal'],
    ['assembler', 'selective_emitter', 'grindless:selective_emitter'],
    ['assembler', 'emitter_shell', 'grindless:matrioshka_emitter_shell']
  ];
  for (const [type, name, out] of chain) assert.ok(outputs(by(type, name)).includes(out), `${type}/${name}`);
  assert.ok(inputs(by('lathe', 'c12_polish')).includes('grindless:c12_cvd_plate'));
  assert.ok(inputs(by('assembler', 'aqfp_bond')).includes('grindless:glass_interposer'));
  assert.ok(inputs(by('assembler', 'droplet_collector')).includes('grindless:droplet_wick'));
  assert.ok(inputs(by('chemical_reactor', 'sic_coat_lattice')).includes('grindless:glassy_carbon_lattice'));
  assert.ok(inputs(by('chemical_reactor', 'hfo2_passivate')).includes('grindless:hafnia_dust'));
  assert.ok(inputs(by('mixer', 'ingaasb_dust')).includes('gtceu:antimony_dust'));
  assert.deepEqual(outputs(by('mixer', 'ingaasb_dust')), ['gtceu:ingaasb_dust']);
  const al = by('assembly_line', 'rad_hard_controller');
  assert.equal(al.eut, 1966080);
  assert.equal(al.research, 'rad_hard_controller');
});

test('safety: stibine is contained (a scrub row), gold recycled stack stated, dangerous byproducts have a destination', () => {
  assert.ok(inputs(by('chemical_reactor', 'stibine_scrub')).includes('gtceu:stibine'));
  assert.ok(outputs(by('chemical_reactor', 'stibine')).includes('gtceu:stibine'));
  assert.match(by('mixer', 'tipt_au_stack')._why, /recycled/);
  const epi = read('server_scripts', 'grindless', 'uv', 'photonics.js');
  assert.match(epi, /UIV-A10[\s\S]*?name: 'ingaasb_epi', type: 'mocvd', circuit: 12[\s\S]*?gtceu:stibine/);
});

test('"only from" claims: no other table or script builds these outputs', () => {
  const mine = ['grindless:ns_eos_chart', 'grindless:kerr_chart', 'grindless:droplet_radiator_module', 'grindless:matrioshka_node',
    'grindless:matrioshka_logic_tile', 'grindless:matrioshka_emitter_shell', 'grindless:matrioshka_tpv_shell', 'grindless:rad_hard_controller',
    'grindless:tpv_tile', 'grindless:selective_emitter', 'grindless:droplet_collector', 'grindless:diamond_schottky_die'];
  for (const id of mine) {
    const here1 = all.filter((r) => outputs(r).includes(id));
    assert.equal(here1.length, 1, id);
    for (const f of OTHER_TABLES) {
      const txt = fs.readFileSync(path.join(tables, f), 'utf8');
      assert.equal([...txt.matchAll(new RegExp(`"(?:itemsOut|fluidsOut)"\\s*:\\s*\\[[^\\]]*"${id}"`, 'g'))].length, 0, `${f} produces ${id}`);
    }
    for (const f of scripts(kube)) {
      if (f.endsWith(path.join('uiv', 'matrioshka.js'))) continue;
      assert.ok(!new RegExp(`\\.(?:itemOutputs|outputItems|output)\\([^)]*${id}`).test(fs.readFileSync(f, 'utf8')), `${path.relative(kube, f)} outputs ${id}`);
    }
  }
});

test('the older rows exist, each marked UIV-A10', () => {
  const grab = (file, type, name) => {
    const t = JSON.parse(fs.readFileSync(path.join(tables, file), 'utf8'));
    const r = t.types[type].recipes.find((x) => x.name === name);
    assert.ok(r, `${file} ${type}/${name}`);
    assert.match(r._why, /^UIV-A10/, name);
    return r;
  };
  assert.equal(grab('electron_beam.json', 'electron_beam_refining', 'tin_distill').circuit, 8);
  assert.equal(grab('composites.json', 'chemical_vapour_infiltration', 'glassy_carbon_lattice').circuit, 4);
  assert.equal(grab('photonics_uev.json', 'snspd_fabrication', 'nb_jj_wafer').circuit, 5);
  assert.equal(grab('photonics.json', 'molecular_beam_epitaxy', 'nb_trilayer').circuit, 8);
  assert.deepEqual(['air_bridge', 'diamond_contacts', 'w_photonic_crystal'].map((n) => grab('photonics.json', 'photonic_foundry', n).circuit), [14, 15, 16]);
  assert.match(read('server_scripts', 'grindless', 'uhv', 'propulsion.js'), /row\('nb_target', 'spark_plasma_sintering', 6[\s\S]*?row\('w_target', 'spark_plasma_sintering', 7/);
  assert.match(read('server_scripts', 'grindless', 'zpm', 'qubits.js'), /UIV-A10[\s\S]*?name: 'c12_cvd_plate', type: 'diamond_cvd', circuit: 8[\s\S]*?name: 'c12_boron_diamond', type: 'ion_implantation', circuit: 7/);
  assert.match(read('server_scripts', 'grindless', 'uhv', 'swarm.js'), /UIV-A10[\s\S]*?row\('matrioshka_feed', STATION, 4/);
  assert.match(read('server_scripts', 'grindless', 'hv', 'syngas_plant.js'), /c12_methanation/);
});

test('lang: every item, block and machine named in en_us and es_es, every older row has its EMI line', () => {
  assert.ok(itemNames.length >= 28 && blockNames.length === 5);
  for (const n of itemNames.concat(blockNames)) assert.ok(lang.includes(`['${n}', `), `lang entry for ${n}`);
  for (const m of ['matrioshka_computer', 'droplet_radiator_works']) {
    assert.ok(lang.includes(`block.gtceu.${m}'`));
    for (let i = 0; i < 3; i++) assert.ok(lang.includes(`grindless.machine.${m}.tooltip.${i}'`));
  }
  const keys = ['matrioshka_computing.research_write', 'matrioshka_computing.ns_eos_chart', 'matrioshka_computing.kerr_chart',
    'droplet_radiator_assembly.radiator_module', 'droplet_radiator_assembly.tpv_tile', 'electron_beam.tin_distill',
    'chemical_vapour_infiltration.glassy_carbon_lattice', 'snspd_fabrication.nb_jj_wafer', 'molecular_beam_epitaxy.nb_trilayer',
    'photonic_foundry.air_bridge', 'photonic_foundry.diamond_contacts', 'photonic_foundry.w_photonic_crystal'];
  for (const k of keys) assert.ok(lang.includes(`gtceu.recipe.grindless_${k}'`), k);
  // the startup script registers the same names the lang file knows and the textures script draws them
  const tex = fs.readFileSync(path.join(root, 'tools', 'assets', 'Build-UIVMatrioshkaTextures.ps1'), 'utf8');
  for (const n of itemNames.concat(blockNames)) assert.ok(tex.includes(`'${n}'`), `texture for ${n}`);
  for (const n of itemNames) assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), n);
  for (const n of blockNames) assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'uiv', `${n}.png`)), n);
});

test('controllers read the UIV hull, 2 UIV parts and 2 optical mainframes', () => {
  const srv = read('server_scripts', 'grindless', 'uiv', 'matrioshka.js');
  assert.match(srv, /HULL = 'gtceu:uiv_machine_hull'/);
  assert.match(srv, /MAINFRAME = 'gtnn:optical_mainframe'/);
  assert.match(srv, /\['OPO', 'PHP'\]/);
  assert.match(srv, /matrioshka_computer: 'grindless:uiv_electric_piston'/);
  assert.match(srv, /droplet_radiator_works: 'grindless:uiv_conveyor_module'/);
});
