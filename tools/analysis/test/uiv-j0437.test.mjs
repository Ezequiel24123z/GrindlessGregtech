// UIV-B3 (docs/eras/uiv.md, machines 18 to 20; lines 34, 38, 45): PSR J0437-4715 pair wind, positronium and navigation. Static checks only.
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
const T = JSON.parse(fs.readFileSync(path.join(tables, 'j0437.json'), 'utf8'));
const GTM = new Set(['assembler', 'cutter', 'laser_engraver', 'distillery', 'vacuum_freezer']);
const UIV = 31457280;
const ORBIT = 'grindless:psr_j0437_orbit';

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
    else if (e.name.endsWith('.js') || e.name.endsWith('.json')) out.push(p);
  }
  return out;
}
const startup = read('startup_scripts', 'grindless', 'uiv', 'j0437.js');
const server = read('server_scripts', 'grindless', 'uiv', 'j0437.js');
const lang = read('client_scripts', 'grindless', 'uiv_j0437_lang.js');

test('names unique, figures positive, circuits unique per type (0 only for GTM types), _why tagged', () => {
  const names = [];
  for (const [type, t] of Object.entries(T.types)) {
    const circuits = t.recipes.map((r) => r.circuit).filter((c) => c > 0);
    assert.equal(new Set(circuits).size, circuits.length, type);
    for (const r of t.recipes) {
      names.push(r.name);
      assert.ok(Number.isInteger(r.eut) && r.eut > 0 && Number.isInteger(r.duration) && r.duration > 0, r.name);
      assert.ok(r.circuit > 0 || GTM.has(type), `${type}/${r.name} needs a circuit`);
      assert.match(r._why, /^UIV-B3/, r.name);
    }
  }
  assert.equal(new Set(names).size, names.length);
});

test('machines: three UIV multiblocks in the J0437 orbit, controllers shaped from hull + 2 optical mainframes', () => {
  for (const m of ['pulsar_wind_trap', 'positronium_condensate_lab', 'xray_pulse_profiler']) {
    assert.ok(startup.includes(`'${m}'`) || startup.includes(`${m}:`), m);
    assert.ok(server.includes('grindless:crafting/'), m);
    assert.ok(lang.includes(`grindless.machine.${m}.tooltip.2`), m);
  }
  assert.ok(server.includes('gtceu:uiv_machine_hull') && server.includes('gtnn:optical_mainframe'));
  assert.ok(server.includes(ORBIT) && server.includes('.dimension('));
  assert.ok(/workableCasingModel/.test(startup));
  for (const t of ['pulsar_wind_trapping', 'positronium_condensation', 'xray_pulse_profiling']) {
    for (const r of T.types[t].recipes) { assert.equal(r.eut, UIV, r.name); assert.equal(r.site, true, r.name); }
  }
  for (const t of ['positron_accumulation', 'antimatter_storage']) for (const r of T.types[t].recipes) { assert.equal(r.site, true); assert.equal(r.circuit, 4); }
  for (const r of all.filter((x) => GTM.has(x.type))) assert.ok(!r.site, r.name);
});

test('wind trap: MH coil block kept as catalyst -> pair plasma + electrons back, 1200 t', () => {
  const r = by('pulsar_wind_trapping', 'pair_plasma');
  assert.equal(r.circuit, 1); assert.equal(r.duration, 1200);
  assert.deepEqual(ids(r.kept), ['grindless:metallic_hydrogen_coil_block']);
  assert.deepEqual(outputs(r), ['gtceu:pair_plasma', 'gtceu:wind_electrons']);
  assert.ok(/metallic_hydrogen_coil_block/.test(startup));
});

test('positronium lab: c1 800 t, c2 uses the cooling laser (kept), c3 BEC + 2 Bragg mirrors', () => {
  const c1 = by('positronium_condensation', 'ps_in_aerogel');
  assert.equal(c1.circuit, 1); assert.equal(c1.duration, 800);
  assert.deepEqual(inputs(c1), ['grindless:cooled_positron_bunch', 'grindless:neon_moderator_cartridge', 'grindless:ps_converter_aerogel']);
  assert.deepEqual(outputs(c1), ['grindless:ps_in_aerogel']);
  const c2 = by('positronium_condensation', 'laser_cooled_ps');
  assert.equal(c2.circuit, 2);
  assert.deepEqual(ids(c2.kept), ['grindless:ps_cooling_laser']);
  assert.deepEqual(ids(c2.itemsIn), ['grindless:ps_in_aerogel']);
  assert.deepEqual(outputs(c2), ['grindless:laser_cooled_ps']);
  const c3 = by('positronium_condensation', 'gamma_laser_cavity');
  assert.equal(c3.circuit, 3);
  assert.deepEqual(c3.itemsIn.map((x) => [x.id, x.count]), [['grindless:ps_bec', 1], ['grindless:gamma_bragg_mirror', 2]]);
  assert.deepEqual(outputs(c3), ['grindless:gamma_laser_cavity']);
});

test('profiler: c1 kept UEV chart -> 4 raw, 2400 t; c2 4 timed + EOS chart -> navigation solution', () => {
  const c1 = by('xray_pulse_profiling', 'j0437_pulse_raw');
  assert.equal(c1.circuit, 1); assert.equal(c1.duration, 2400);
  assert.deepEqual(ids(c1.kept), ['grindless:pulsar_navigation_chart']);
  assert.deepEqual(c1.itemsOut.map((x) => [x.id, x.count]), [['grindless:j0437_pulse_raw', 4]]);
  const c2 = by('xray_pulse_profiling', 'pulsar_navigation_solution');
  assert.equal(c2.circuit, 2);
  assert.deepEqual(c2.itemsIn.map((x) => [x.id, x.count]), [['grindless:xray_pulse_timed', 4], ['grindless:ns_eos_chart', 1]]);
  assert.deepEqual(outputs(c2), ['grindless:pulsar_navigation_solution']);
});

test('line 34: pair plasma -> cooled e+ -> Ps (19) -> BEC -> cavity -> UIV emitter', () => {
  assert.deepEqual(inputs(by('positron_accumulation', 'pair_plasma_cooling')), ['gtceu:pair_plasma']);
  assert.deepEqual(ids(by('positron_accumulation', 'pair_plasma_cooling').itemsOut), ['grindless:cooled_positron_bunch']);
  assert.deepEqual(inputs(by('antimatter_storage', 'ps_bec')), ['grindless:laser_cooled_ps', 'gtceu:superfluid_helium']);
  assert.deepEqual(outputs(by('antimatter_storage', 'ps_bec')), ['grindless:ps_bec', 'gtceu:helium']);
  const e = by('assembler', 'uiv_emitter');
  assert.ok(inputs(e).includes('grindless:gamma_laser_cavity'));
  assert.deepEqual(outputs(e), ['grindless:uiv_emitter']);
});

test('line 38 chain: C-12 CVD plate -> HPHT -> (004) cut -> ion mill -> Bragg mirror', () => {
  const mega = JSON.parse(fs.readFileSync(path.join(tables, 'megabar.json'), 'utf8')).types.megabar_synthesis.recipes.find((r) => r.name === 'c12_hpht');
  assert.ok(mega, 'megabar c12_hpht');
  assert.equal(mega.circuit, 4);
  assert.ok(inputs(mega).includes('grindless:c12_cvd_plate'));
  assert.deepEqual(ids(mega.itemsOut), ['grindless:c12_hpht_plate']);
  assert.match(mega._why, /^UIV-B3/);
  assert.deepEqual(ids(by('cutter', 'c12_004_cut').itemsIn), ['grindless:c12_hpht_plate']);
  assert.ok(ids(by('cutter', 'c12_004_cut').itemsOut).includes('grindless:c12_004_plate'));
  assert.deepEqual(ids(by('laser_engraver', 'c12_ion_mill').itemsIn), ['grindless:c12_004_plate']);
  assert.ok(inputs(by('assembler', 'gamma_bragg_mirror')).includes('grindless:c12_ion_milled_plate'));
  assert.deepEqual(outputs(by('assembler', 'gamma_bragg_mirror')), ['grindless:gamma_bragg_mirror']);
  assert.ok(read('server_scripts', 'grindless', 'zpm', 'qubits.js').includes('c12_cvd_plate'));
});

test('line 45 chain: 6N neon -> purified -> solid cone -> annealed -> cartridge; boil-off back', () => {
  assert.deepEqual(outputs(by('distillery', 'purify_neon')), ['gtceu:purified_neon']);
  const cold = read('server_scripts', 'grindless', 'uv', 'cold.js');
  assert.ok(/solid_neon_cone[\s\S]*UIV-B3|UIV-B3[\s\S]*solid_neon_cone/.test(cold));
  assert.ok(cold.includes('gtceu:purified_neon') && cold.includes('grindless:solid_neon_cone'));
  assert.deepEqual(inputs(by('vacuum_freezer', 'anneal_neon_cone')), ['grindless:solid_neon_cone']);
  assert.deepEqual(outputs(by('vacuum_freezer', 'anneal_neon_cone')), ['grindless:annealed_neon_cone']);
  assert.ok(inputs(by('assembler', 'neon_moderator_cartridge')).includes('grindless:annealed_neon_cone'));
  const cryo = read('server_scripts', 'grindless', 'ev', 'cryogenic_plant.js');
  assert.ok(cryo.includes('gtceu:neon_6n') && cryo.includes('UIV-B3') && cryo.includes('gcyr:luna'));
});

test('older rows appended in outer_chemistry, observatory', () => {
  const oc = read('server_scripts', 'grindless', 'zpm', 'outer_chemistry.js');
  assert.ok(/UIV-B3/.test(oc) && oc.includes('ps_converter_aerogel') && oc.includes('silica_aerogel'));
  const ob = read('server_scripts', 'grindless', 'zpm', 'observatory.js');
  assert.ok(/UIV-B3/.test(ob) && ob.includes('j0437_pulse_raw') && ob.includes('xray_pulse_timed') && ob.includes('orbit: true'));
});

test('only from: no other recipe in pack/kubejs produces the B3 key items', () => {
  const own = [path.join('uiv', 'j0437.js'), 'j0437.json', path.join('zpm', 'observatory.js')];
  const key = ['grindless:j0437_pulse_raw', 'grindless:xray_pulse_timed', 'grindless:pulsar_navigation_solution', 'grindless:uiv_emitter'];
  const makers = new Map(key.map((k) => [k, []]));
  for (const f of scripts(path.join(kube, 'server_scripts')).concat(scripts(tables))) {
    if (own.some((o) => f.endsWith(o))) continue;
    const text = fs.readFileSync(f, 'utf8');
    for (const k of key) {
      const short = k.replace('grindless:', '');
      // a recipe output line: itemsOut / outputItems / output: naming the key
      const re = new RegExp(`(itemsOut|outputItems|output|result)[^\\n]{0,120}${short}`);
      if (re.test(text) && !f.includes('foundation')) makers.get(k).push(path.relative(kube, f));
    }
  }
  // uiv_emitter is consumed (not produced) by the UIV hatches; those files do not name it in an output field
  for (const [k, v] of makers) assert.deepEqual(v, [], `${k} produced by ${v.join(', ')}`);
  assert.ok(by('xray_pulse_profiling', 'j0437_pulse_raw').itemsOut.length === 1);
  assert.ok(fs.readFileSync(path.join(kube, 'server_scripts', 'grindless', 'zpm', 'observatory.js'), 'utf8').includes('xray_pulse_timed'));
});

test('lang parity: every EN key has an ES twin, items have two tooltips', () => {
  assert.ok(lang.includes("['en_us', 'es_es']") && lang.includes('e[1 + li]'));
  assert.ok(lang.includes("'tooltip.grindless.' + i[0] + '.0'") && lang.includes("'tooltip.grindless.' + i[0] + '.1'"));
  for (const name of ['cooled_positron_bunch', 'ps_converter_aerogel', 'ps_in_aerogel', 'laser_cooled_ps', 'ps_bec', 'gamma_laser_cavity', 'c12_hpht_plate', 'c12_004_plate', 'c12_ion_milled_plate', 'gamma_bragg_mirror', 'solid_neon_cone', 'annealed_neon_cone', 'neon_moderator_cartridge']) {
    assert.ok(lang.includes(`'${name}'`), name);
    assert.ok(startup.includes(name), name);
  }
  for (const key of ['gtceu.recipe.grindless_positron_accumulation.pair_plasma_cooling', 'gtceu.recipe.grindless_antimatter_storage.ps_bec', 'gtceu.recipe.grindless_megabar.c12_hpht']) assert.ok(lang.includes(key), key);
});
