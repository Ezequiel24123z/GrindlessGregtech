// UIV-B2 (docs/eras/uiv.md, machines 13-17; lines 30-33; "B2. RX J1856"): the crust lift, the neutron drip separator, the neutronium cage, the r-process
// decompressor and the decay heat vault, plus the older rows the package appends. Static checks only.
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
const T = JSON.parse(fs.readFileSync(path.join(tables, 'rx_j1856.json'), 'utf8'));
const GTM = new Set(['assembler', 'chemical_reactor', 'laser_engraver', 'cutter', 'lathe', 'mixer', 'assembly_line']);
const SITE = 'grindless:rx_j1856_orbit';

const ids = (xs) => (Array.isArray(xs) ? xs : []).map((x) => x.id);
const inputs = (r) => ids(r.itemsIn).concat(ids(r.kept), ids(r.wear), ids(r.fluidsIn));
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
const OTHER_TABLES = fs.readdirSync(tables).filter((n) => n.endsWith('.json') && n !== 'rx_j1856.json');
const startup = read('startup_scripts', 'grindless', 'uiv', 'rx_j1856.js');
const server = read('server_scripts', 'grindless', 'uiv', 'rx_j1856.js');
const lang = read('client_scripts', 'grindless', 'uiv_rx_j1856_lang.js');
const itemNames = [...startup.slice(startup.indexOf('RX.items'), startup.indexOf('RX.fluids')).matchAll(/^\s{4}(\w+): \{ stack/gm)].map((m) => m[1]);
const fluidIds = [...startup.slice(startup.indexOf('RX.fluids'), startup.indexOf('RX.machines')).matchAll(/'gtceu:(\w+)': \{ colour/g)].map((m) => m[1]);
const json = (f) => JSON.parse(fs.readFileSync(path.join(tables, f), 'utf8'));
const mine = (r) => /^UIV-B2/.test(r._why || r._ || '');

test('names unique, EU/t and duration positive, circuits unique per type (0 only for GTM types), every row says UIV-B2', () => {
  const names = [];
  for (const [type, t] of Object.entries(T.types)) {
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      names.push(r.name);
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
      assert.ok(r.circuit > 0 || GTM.has(type), `${type}/${r.name} needs a circuit`);
      assert.match(r._why, /^UIV-B2|^UXV-B4/, r.name); // UXV-B4 appended gnocchi_decompression (circuit 3)
    }
  }
  assert.equal(new Set(names).size, names.length);
});

test('every far row is locked to grindless:rx_j1856_orbit (site: true) at UIV voltage; the line steps are not', () => {
  for (const type of ['crust_lifting', 'neutron_drip_separation', 'neutronium_caging', 'r_process_decompression', 'decay_heat']) {
    for (const r of T.types[type].recipes) assert.equal(r.site, true, `${type}/${r.name}`);
  }
  for (const r of T.types.assembler.recipes) assert.ok(!r.site, r.name);
  assert.match(server, /recipe\.dimension\(RX\.site/);
  assert.match(startup, /RX\.site = 'grindless:rx_j1856_orbit'/);
  assert.equal(by('crust_lifting', 'crust_lift').eut, 31457280);
  for (const n of ['inner_crust', 'drip_neutrons']) assert.equal(by('neutron_drip_separation', n).eut, 31457280);
  for (const n of ['hot_r_process_mix', 'flash_target']) assert.equal(by('r_process_decompression', n).eut, 31457280);
});

test('crust lift (c1): the electrode is kept, the tether wears one in ten, the worn tether is an output at the same chance', () => {
  const r = by('crust_lifting', 'crust_lift');
  assert.equal(r.circuit, 1);
  assert.deepEqual(ids(r.kept), ['grindless:polar_cap_electrode']);
  assert.deepEqual(r.wear.map((w) => [w.id, w.chance]), [['grindless:crust_lift_tether', 1000]]);
  assert.deepEqual(outputs(r), ['grindless:neutron_star_crust', 'grindless:worn_crust_lift_tether']);
  assert.equal(r.itemsOut[1].chance, 1000);
});

test('line 30: crust -> inner crust -> drip neutrons -> superfluid -> pellet (cage part) -> UIV field generator', () => {
  const inner = by('neutron_drip_separation', 'inner_crust');
  assert.equal(inner.circuit, 1);
  assert.deepEqual(ids(inner.kept), ['grindless:neutron_supermirror']);
  assert.ok(inputs(inner).includes('grindless:neutron_star_crust'));
  assert.deepEqual(outputs(inner), ['grindless:inner_crust_matter', 'grindless:outer_crust_ions']);
  const drip = by('neutron_drip_separation', 'drip_neutrons');
  assert.equal(drip.circuit, 2);
  assert.ok(inputs(drip).includes('grindless:inner_crust_matter'));
  assert.deepEqual(outputs(drip), ['grindless:crust_nuclei', 'gtceu:drip_neutrons']);
  const sf = by('neutronium_caging', 'neutron_superfluid');
  assert.equal(sf.circuit, 1);
  assert.deepEqual(inputs(sf), ['gtceu:drip_neutrons', 'gtceu:superfluid_helium']);
  assert.ok(outputs(sf).includes('gtceu:neutron_superfluid'));
  assert.ok(outputs(sf).includes('gtceu:protium'));
  const pellet = by('neutronium_caging', 'neutronium_pellet');
  assert.equal(pellet.circuit, 2);
  assert.deepEqual(ids(pellet.itemsIn), ['grindless:cage_part']);
  assert.ok(inputs(pellet).includes('gtceu:neutron_superfluid'));
  assert.ok(outputs(pellet).includes('grindless:neutronium_pellet'));
  const fg = by('assembler', 'uiv_field_generator');
  assert.ok(ids(fg.itemsIn).includes('grindless:neutronium_pellet'));
  assert.ok(ids(fg.itemsIn).includes('#gtceu:circuits/uiv'));
  assert.deepEqual(outputs(fg), ['gtceu:uiv_field_generator']);
});

test('line 31: crust nuclei -> hot mix (fission fragments to the vault) -> capsule -> vault -> aged capsule -> ash and helium-4', () => {
  const mix = by('r_process_decompression', 'hot_r_process_mix');
  assert.equal(mix.circuit, 1);
  assert.equal(mix.duration, 1600);
  assert.deepEqual(inputs(mix), ['grindless:crust_nuclei', 'gtceu:drip_neutrons']);
  assert.deepEqual(outputs(mix), ['grindless:fission_fragments', 'gtceu:hot_r_process_mix']);
  assert.deepEqual(outputs(by('assembler', 'kilonova_capsule')), ['grindless:kilonova_capsule']);
  assert.ok(inputs(by('assembler', 'kilonova_capsule')).includes('gtceu:hot_r_process_mix'));
  const v1 = by('decay_heat', 'kilonova_decay');
  assert.deepEqual([v1.circuit, v1.eut, v1.duration], [1, 33554432, 12000]);
  assert.deepEqual(inputs(v1), ['grindless:kilonova_capsule']);
  assert.deepEqual(outputs(v1), ['grindless:aged_kilonova_capsule']);
  const v2 = by('decay_heat', 'capsule_opening');
  assert.equal(v2.circuit, 2);
  assert.ok(v2.eut <= 1024);
  assert.deepEqual(inputs(v2), ['grindless:aged_kilonova_capsule']);
  assert.deepEqual(v2.itemsOut.map((o) => [o.id, o.count]), [['grindless:r_process_ash', 4]]);
  assert.deepEqual(v2.fluidsOut.map((o) => [o.id, o.amount]), [['gtceu:helium_4_ash', 1000]]);
  // the vault's other inputs have a destination
  const v3 = by('decay_heat', 'fragment_burn');
  assert.equal(v3.circuit, 3);
  assert.deepEqual(inputs(v3), ['grindless:fission_fragments']);
  const v4 = by('decay_heat', 'ion_burn');
  assert.equal(v4.circuit, 4);
  assert.deepEqual(inputs(v4), ['grindless:outer_crust_ions']);
});

test('line 32: the flash target never makes Pu-244; its debris goes to the hot cell', () => {
  const f = by('r_process_decompression', 'flash_target');
  assert.equal(f.circuit, 2);
  assert.deepEqual(inputs(f), ['grindless:u238_flash_target', 'gtceu:drip_neutrons']);
  assert.deepEqual(outputs(f), ['grindless:flashed_target']);
  for (const r of all) assert.ok(!outputs(r).some((o) => /plutonium_244|pu_?244/i.test(o)), `${r.name} makes Pu-244`);
  assert.deepEqual(outputs(by('assembler', 'es254_target')), ['grindless:es254_target']);
  assert.ok(inputs(by('assembler', 'es254_target')).includes('gtceu:einsteinium_dust'));
});

test('line 33: yarn -> laminated -> braided -> tether -> electrode and lift tether', () => {
  assert.ok(inputs(by('assembler', 'mh_laminate')).includes('grindless:bn_coated_cnt_yarn'));
  assert.deepEqual(outputs(by('assembler', 'mh_laminate')), ['grindless:mh_laminated_yarn']);
  assert.deepEqual(inputs(by('assembler', 'mh_braid')), ['grindless:mh_laminated_yarn']);
  assert.deepEqual(outputs(by('assembler', 'mh_braid')), ['grindless:braided_mh_tether']);
  assert.ok(inputs(by('assembler', 'polar_cap_electrode')).includes('grindless:mh_tether'));
  assert.ok(inputs(by('assembler', 'crust_lift_tether')).includes('grindless:mh_tether'));
  assert.deepEqual(outputs(by('assembler', 'polar_cap_electrode')), ['grindless:polar_cap_electrode']);
  assert.deepEqual(outputs(by('assembler', 'crust_lift_tether')), ['grindless:crust_lift_tether']);
});

test('the vault is a generator written final: not in power/generators.js, own dynamo hatch, one run at a time', () => {
  assert.equal(T.types.decay_heat.generator, true);
  assert.ok(!/decay_heat/.test(read('server_scripts', 'grindless', 'power', 'generators.js')));
  assert.match(startup, /RX\.dynamo = 'gtceu:uiv_energy_output_hatch'/);
  assert.match(startup, /G\.generators\.configure\(builder, \{ maxParallels: 1/);
  assert.match(startup, /\['energy_output', 1, 2\]/);
  assert.match(server, /EUt\(rec\.generator \? -rec\.eut : rec\.eut\)/);
});

test('invariants: our pellet is never gtceu:neutronium and no recipe of ours takes GTM\'s; Kerr data is not used', () => {
  for (const r of all) {
    assert.ok(![...inputs(r), ...outputs(r)].includes('gtceu:neutronium'), r.name);
    assert.ok(![...inputs(r), ...outputs(r)].includes('grindless:kerr_probe_data'), r.name);
  }
  assert.ok(!itemNames.includes('neutronium_pellet'));
});

test('"only from" claims: no other table or script builds these outputs', () => {
  const out = ['grindless:neutronium_pellet', 'gtceu:uiv_field_generator', 'grindless:neutron_star_crust', 'grindless:kilonova_capsule',
    'grindless:aged_kilonova_capsule', 'grindless:r_process_ash', 'grindless:flashed_target',     'grindless:es254_target', 'grindless:polar_cap_electrode',
        'grindless:crust_lift_tether', 'grindless:mh_tether', 'grindless:fission_fragments'];
  for (const id of out) {
    if (id === 'grindless:mh_tether') continue; // made by the elevator's tether_ribbon c3 row (older row)
    for (const f of OTHER_TABLES) {
      const txt = fs.readFileSync(path.join(tables, f), 'utf8');
      assert.equal([...txt.matchAll(new RegExp(`"(?:itemsOut|fluidsOut)"\\s*:\\s*\\[[^\\]]*"${id}"`, 'g'))].length, 0, `${f} produces ${id}`);
    }
    for (const f of scripts(kube)) {
      if (f.endsWith(path.join('uiv', 'rx_j1856.js'))) continue;
      assert.ok(!new RegExp(`\\.(?:itemOutputs|outputItems|output)\\([^)]*${id}`).test(fs.readFileSync(f, 'utf8')), `${path.relative(kube, f)} outputs ${id}`);
    }
  }
});

test('lang: every item, fluid, machine and type named in en_us and es_es, every row has its EMI line', () => {
  assert.equal(itemNames.length, 17);
  assert.equal(fluidIds.length, 6);
  for (const n of itemNames) {
    assert.ok(lang.includes(`['${n}', `), `lang entry for ${n}`);
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'item', `${n}.png`)), `texture for ${n}`);
  }
  for (const n of fluidIds) assert.ok(lang.includes(`['${n}', `), `fluid name ${n}`);
  for (const m of ['crust_lift', 'neutron_drip_separator', 'neutronium_cage', 'r_process_decompressor', 'decay_heat_vault']) {
    assert.ok(lang.includes(`block.gtceu.${m}'`), m);
    for (let i = 0; i < 1; i++) assert.ok(lang.includes(`grindless.machine.${m}.tooltip.${i}'`), `${m} tooltip ${i}`);
    assert.ok(fs.existsSync(path.join(kube, 'assets', 'grindless', 'textures', 'block', 'multiblock', m, 'overlay_front_active.png')), m);
  }
  for (const [type, t] of Object.entries(T.types)) {
    if (GTM.has(type)) continue;
    assert.ok(lang.includes(`'gtceu.${type}'`), type);
    for (const r of t.recipes) if (!/^UXV-B4/.test(r._why)) assert.ok(lang.includes(`gtceu.recipe.${t.dataKey}.${r.name}'`), `${type}/${r.name}`);
  }
  // en_us and es_es: the loop writes both columns; every entry has three columns
  const entries = [...lang.matchAll(/^\s{8}\['([^']+)',\s*(?:\n\s*)?'/gm)];
  assert.ok(entries.length > 60);
  assert.match(lang, /\['en_us', 'es_es'\]/);
  const tex = fs.readFileSync(path.join(root, 'tools', 'assets', 'Build-UIVRx_j1856Textures.ps1'), 'utf8');
  for (const n of itemNames) assert.ok(tex.includes(`'${n}'`), `drawn: ${n}`);
});

test('controllers read the UIV hull, 2 UIV parts and 2 optical mainframes', () => {
  assert.match(server, /HULL = 'gtceu:uiv_machine_hull'/);
  assert.match(server, /MAINFRAME = 'gtnn:optical_mainframe'/);
  assert.doesNotMatch(server, /\['OPO', 'PHP'\]|gtceu\.shaped/, 'no shaped controller recipe any more');
  assert.match(server, /event\.recipes\.gtceu\.assembly_line\('grindless:' \+ d\.name\)/);
  assert.match(server, /grindless:assembly_line\/' \+ d\.name/);
  assert.match(server, /d\.parts\.forEach\(function \(p\) \{ b\.itemInputs\('3x ' \+ p\) \}\)/);
  assert.match(server, /b\.itemInputs\('2x ' \+ MAINFRAME\)/);
  assert.match(server, /b\.itemInputs\('4x #gtceu:circuits\/uiv'\)/);
  assert.match(server, /inputFluids\(Fluid\.of\('gtceu:soldering_alloy', 2304\), Fluid\.of\('gtceu:lubricant', 2000\), Fluid\.of\('gtceu:neutronium', 576\)\)/);
  assert.match(server, /stationResearch/);
  for (const m of ['crust_lift\', parts: [\'gtceu:uiv_electric_piston\', \'gtceu:uiv_electric_motor\'', 'neutron_drip_separator\', parts: [\'gtceu:uiv_electric_pump\', \'gtceu:uiv_fluid_regulator\', \'gtceu:uiv_conveyor_module\'',
    'neutronium_cage\', parts: [\'gtceu:uiv_robot_arm\', \'gtceu:uiv_electric_motor\', \'gtceu:uiv_electric_piston\'', 'r_process_decompressor\', parts: [\'gtceu:uiv_conveyor_module\', \'gtceu:uiv_electric_piston\'', 'decay_heat_vault\', parts: [\'gtceu:uiv_electric_motor\', \'gtceu:uiv_electric_pump\'']) {
    assert.ok(server.includes('name: \'' + m), m);
  }
});

test('the integrator stamped the priority line of the package\'s scripts', () => {
  for (const f of [startup, server, lang]) assert.match(f, /^\/\/ priority: -?\d+\r?\n/);
});

// ---------------------------------------------------------------------------------------- older rows (commit 3)

test('older rows: 13 in 9 files, each carries UIV-B2 and the free circuit', () => {
  const find = (f, type, name) => json(f).types ? json(f).types[type].recipes.find((r) => r.name === name) : null;
  const hot = json('hot_cell.json').recipes;
  for (const [n, c] of [['es_fm_debris', 13], ['ash_actinide_cut', 14]]) {
    const r = hot.find((x) => x.name === n);
    assert.ok(r && r.circuit === c && mine(r), n);
  }
  assert.ok(ids(hot.find((x) => x.name === 'es_fm_debris').itemsIn).includes('grindless:flashed_target'));
  assert.ok(ids(hot.find((x) => x.name === 'ash_actinide_cut').itemsIn).includes('grindless:r_process_ash'));
  const u = json('uranium_cycle.json').fabrication.find((x) => x.name === 'u238_flash_target');
  assert.ok(u && u.circuit === 10 && mine(u));
  assert.deepEqual(ids(u.itemsOut), ['grindless:u238_flash_target']);
  const tc = find('transcurium.json', 'transuranium_processing', 'es254_extraction');
  assert.ok(tc && tc.circuit === 9 && mine(tc));
  assert.deepEqual(ids(tc.itemsOut), ['gtceu:einsteinium_dust']);
  const bomb = find('superheavy.json', 'heavy_ion_irradiation', 'es254_bombard');
  assert.ok(bomb && bomb.circuit === 8 && mine(bomb));
  assert.ok(ids(bomb.itemsIn).includes('grindless:es254_target') && ids(bomb.itemsIn).includes('grindless:ca48_beam'));
  const rec = find('superheavy.json', 'recoil_separation', 'element_119_recoil');
  assert.ok(rec && rec.circuit === 7 && mine(rec));
  assert.deepEqual(ids(rec.itemsOut), ['grindless:element_119_recoil']);
  const cen = find('superheavy.json', 'superheavy_chemistry', 'census_ii');
  assert.ok(cen && cen.circuit === 3 && mine(cen) && cen.itemsIn.length <= 6);
  assert.ok(ids(cen.itemsIn).includes('grindless:element_120_recoil') && ids(cen.itemsIn).includes('grindless:element_119_recoil'));
  assert.deepEqual(ids(cen.itemsOut), ['grindless:superheavy_census_ii']);
  const plat = read('server_scripts', 'grindless', 'ev', 'platinum_plant.js');
  assert.match(plat, /UIV_ROWS = \[[\s\S]*?circuit: 10,[\s\S]*?r_process_ash/);
  assert.match(plat, /addUivRows\(event\)/);
  assert.match(read('server_scripts', 'grindless', 'zpm', 'europium.js'), /UIV-B2[\s\S]*?name: 'r_process_ash', circuit: 10/);
  assert.match(read('server_scripts', 'grindless', 'zpm', 'actinides.js'), /UIV-B2[\s\S]*?name: 'es_fm_cut', circuit: 6/);
  const el = read('server_scripts', 'grindless', 'uhv', 'elevator.js');
  assert.match(el, /name: 'mh_tether', type: 'tether_ribbon', circuit: 3/);
  assert.match(el, /name: 'worn_tether_scrap', type: 'tether_ribbon', circuit: 4/);
  assert.match(el, /worn_crust_lift_tether[\s\S]{0,120}CNT, 4/);
  assert.match(read('server_scripts', 'grindless', 'uv', 'materials.js'), /UIV-B2[\s\S]*?'bn_coated_cnt_yarn', 'boron_nitride', 6/);
});

test('older rows: the F1 ids and cage_part / element_120_recoil each have a real use', () => {
  const rows = [...all];
  assert.ok(rows.some((r) => ids(r.itemsIn).includes('grindless:cage_part')));
  assert.ok(json('superheavy.json').types.superheavy_chemistry.recipes.some((r) => ids(r.itemsIn).includes('grindless:element_120_recoil')));
  const sh = JSON.stringify(json('superheavy.json'));
  for (const id of ['grindless:element_119_recoil', 'grindless:superheavy_census_ii']) assert.equal(sh.split(`"${id}"`).length - 1 >= 1, true, id);
  assert.ok(JSON.stringify(json('transcurium.json')).includes('gtceu:einsteinium_dust'));
  assert.ok(read('server_scripts', 'grindless', 'zpm', 'actinides.js').includes('gtceu:fermium_dust'));
});
